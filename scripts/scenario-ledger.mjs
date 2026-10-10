// The scenario framework's matrix ledger: every branch of a feature's scenario tree as a row, walk rounds that move rows to
// passed / failed / blocked, and the stop rules (settled · capped · stuck). The driver (.claude/skills/design/SKILL.md, "scenarios")
// runs init / round / close; walkers run mark; the brief is docs/design-workflow/briefs/walk.md. The rules are pure, in
// scripts/scenario-rules.mjs. The working ledger is review/scenarios/<feature>/ledger.json (git-ignored, like the polish loop's);
// when a verdict is reached, close writes review/scenario-ledger-<feature>.json (committed, in the closing PR) so another
// checkout, and scripts/feature-state.mjs, can read the outcome.
//
//   node scripts/scenario-ledger.mjs <feature> init [--force] [--cap 4]     rows from features/<id>/scenarios.json (+ tree-only rows), else scenario-tree.md; all pending
//   node scripts/scenario-ledger.mjs <feature> check                        operations.md is well formed and the PRD's "Not supported" names every not-supported operation
//   node scripts/scenario-ledger.mjs <feature> round [--fresh]              open the next walk round on origin/main (--fresh: walkers who weren't given the paths)
//   node scripts/scenario-ledger.mjs <feature> mark <row ids> passed|failed|blocked --by <walker> --commit <sha> [--finding "<one line>"] [--class handled|defect|missing] [--hard <type>] [--question Qn] [--unblocks Qn]
//   node scripts/scenario-ledger.mjs <feature> close [--reclass m3=handled,m5=defect]   classify the round's findings, apply the stop rules
//   node scripts/scenario-ledger.mjs <feature> status [--json]
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRows, checkMark, checkOperations, notSupportedGaps, parseOperations, scenarioStatus, statusCounts, rowStatus, closeRound, reclassify, MAX_ROUNDS, RESULTS } from './scenario-rules.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [feature, cmd, ...rest] = process.argv.slice(2);
const usage = () => { console.error(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//   node')).map((l) => l.slice(3)).join('\n')); process.exit(2); };
if (!feature || !cmd) usage();

// Flags take a value, except the booleans; everything else is positional.
const BOOL = new Set(['force', 'fresh', 'json']);
const flags = {}, pos = [];
for (let i = 0; i < rest.length; i++) {
  if (rest[i].startsWith('--')) { const k = rest[i].slice(2); flags[k] = BOOL.has(k) ? true : rest[++i]; } else pos.push(rest[i]);
}

const fdir = path.join(root, 'features', feature);
const dir = path.join(root, 'review', 'scenarios', feature);
const ledgerFile = path.join(dir, 'ledger.json');
const summaryFile = path.join(root, 'review', `scenario-ledger-${feature}.json`);
const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '');
const sh = (c, a) => spawnSync(c, a, { cwd: root, encoding: 'utf8', maxBuffer: 64 << 20 });
const head = () => sh('git', ['rev-parse', 'HEAD']).stdout.trim();
const load = () => { if (!fs.existsSync(ledgerFile)) { console.error(`no ledger for ${feature}: run init first`); process.exit(2); } return JSON.parse(fs.readFileSync(ledgerFile, 'utf8')); };
const save = (l) => { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(ledgerFile, JSON.stringify(l, null, 2)); };
const refuse = (msgs) => { for (const m of [].concat(msgs)) console.error('- ' + m); process.exit(2); };

// Evidence is only good for the commit it was taken on, and a round starts on main as it is now (as the polish loop does).
// SENTRI_LOOP_TEST_MAIN=HEAD tests this script on a branch; a real walk never sets it.
function onMain() {
  sh('git', ['fetch', '-q', 'origin']);
  const main = sh('git', ['rev-parse', process.env.SENTRI_LOOP_TEST_MAIN || 'origin/main']).stdout.trim();
  const dirty = sh('git', ['status', '--porcelain', '--untracked-files=no']).stdout.trim();
  if (head() !== main || dirty) {
    console.error(`run this on a clean checkout of origin/main (${main.slice(0, 7)}); HEAD is ${head().slice(0, 7)}${dirty ? ' with local changes' : ''}.\n  git switch --detach origin/main`);
    process.exit(2);
  }
  return main;
}

// The operations inventory against the PRD (the check feature-state also applies).
function checkInventory() {
  const f = path.join(fdir, 'operations.md');
  if (!fs.existsSync(f)) return { exists: false, problems: [`features/${feature}/operations.md is missing (docs/design-workflow/operations-template.md)`] };
  const { rows, problems } = parseOperations(read(f));
  const gaps = notSupportedGaps(rows, read(path.join(fdir, 'PRD.md')));
  const all = [...problems, ...checkOperations(rows)];
  if (!gaps.section && gaps.missing.length) all.push('the PRD has no "Not supported" section, but the inventory has not-supported operations');
  else if (!gaps.section) all.push('the PRD has no "Not supported" section (write it, even when the list is "nothing")');
  else for (const m of gaps.missing) all.push(`the PRD's "Not supported" list does not name "${m}"`);
  return { exists: true, rows, problems: all };
}

const terminal = (s) => ['settled', 'capped', 'stuck'].includes(s.status);

if (cmd === 'check') {
  const c = checkInventory();
  if (c.problems.length) { console.error(`${feature}: the operations inventory is not ready:`); refuse(c.problems); }
  console.log(`${feature}: ${c.rows.length} operations (${c.rows.filter((r) => r.kind === 'not-supported').length} not supported); the PRD's "Not supported" list names them all`);
  process.exit(0);
}

if (cmd === 'init') {
  if (fs.existsSync(ledgerFile) && !flags.force) refuse(`a ledger for ${feature} exists (${path.relative(root, ledgerFile)}); --force starts over, and drops its rounds`);
  if (!fs.existsSync(path.join(fdir, 'feature.json'))) refuse(`no features/${feature}/feature.json`);
  let spec = null;
  const sf = path.join(fdir, 'scenarios.json');
  if (fs.existsSync(sf)) { try { spec = JSON.parse(read(sf)); } catch (e) { refuse(`features/${feature}/scenarios.json is not JSON: ${e.message.split('\n')[0]}`); } }
  const { rows, source, problems } = buildRows(spec, read(path.join(fdir, 'scenario-tree.md')));
  if (problems.length) refuse(problems);
  if (!rows.length) refuse(`no rows: ${feature} has no scenarios.json leaves and no scenario-tree.md table rows`);
  const cap = Number(flags.cap) || MAX_ROUNDS;
  save({ feature, source, created: new Date().toISOString(), cap, knownQuestions: [...new Set(rows.map((r) => r.question).filter(Boolean))], marks: 0, rows, rounds: [] });
  fs.rmSync(summaryFile, { force: true });
  const kinds = rows.reduce((c, r) => ({ ...c, [r.kind]: (c[r.kind] || 0) + 1 }), {});
  console.log(`ledger ${feature}: ${rows.length} rows pending from ${source} (${Object.entries(kinds).map(([k, n]) => `${n} ${k}`).join(', ')}); cap ${cap} rounds`);
  const inv = checkInventory();
  if (inv.exists && inv.problems.length) console.log(`note: the operations inventory has ${inv.problems.length} problem(s); run check`);
  if (!inv.exists) console.log(`note: no features/${feature}/operations.md yet (docs/design-workflow/operations-template.md)`);
  process.exit(0);
}

if (cmd === 'round') {
  const l = load();
  const open = l.rounds.find((r) => !r.closed);
  if (open) refuse(`round ${open.n} is open: close it first`);
  const st = scenarioStatus(l);
  if (terminal(st)) { console.log(`the walks are ${st.status}: ${st.why}. No further round.`); process.exit(0); }
  const commit = onMain();
  const n = l.rounds.length + 1;
  l.rounds.push({ n, commit, fresh: !!flags.fresh, opened: new Date().toISOString(), marks: [] });
  save(l);
  const c = statusCounts(l);
  console.log(`round ${n} open on ${commit.slice(0, 7)}${flags.fresh ? ' (fresh walkers)' : ''}: ${l.rows.length} rows (${c.pending} pending, ${c.failed} failed, ${c.blocked} blocked, ${c.passed} passed)`);
  console.log(`walkers: node scripts/scenario-ledger.mjs ${feature} mark <row ids> passed|failed|blocked --by <walker> --commit ${commit.slice(0, 7)} ...`);
  process.exit(0);
}

if (cmd === 'mark') {
  const l = load();
  const result = pos[pos.length - 1];
  if (!RESULTS.includes(result)) { console.error(result === 'pending' ? 'a row never goes back to pending; the result is passed | failed | blocked' : `the last word is the result: ${RESULTS.join(' | ')}`); process.exit(2); }
  const rows = pos.slice(0, -1).flatMap((s) => s.split(',')).filter(Boolean);
  const base = { rows, result, by: flags.by, commit: flags.commit, finding: flags.finding || '', cls: flags.class, hard: flags.hard, unblocks: flags.unblocks };
  const problems = checkMark(l, { ...base, question: flags.question });
  if (problems.length) refuse(problems);
  const round = l.rounds.find((r) => !r.closed);
  const byId = new Map(l.rows.map((r) => [r.id, r]));
  for (const id of rows) {
    const m = { id: `m${++l.marks}`, row: id, result, by: flags.by, commit: round.commit, at: new Date().toISOString() };
    if (flags.finding) m.finding = flags.finding;
    if (flags.class) m.cls = flags.class;
    if (flags.hard) m.hard = flags.hard;
    if (result === 'blocked') m.question = flags.question || byId.get(id).question;
    if (flags.unblocks) m.unblocks = flags.unblocks;
    round.marks.push(m);
  }
  save(l);
  console.log(`round ${round.n}: ${rows.length} row(s) ${result} by ${flags.by} (${rows.map((id) => `${id} → ${rowStatus(l, id)}`).slice(0, 4).join(', ')}${rows.length > 4 ? ' …' : ''})`);
  process.exit(0);
}

if (cmd === 'close') {
  const l = load();
  const round = l.rounds.find((r) => !r.closed);
  if (!round) refuse('no round is open');
  if (!round.marks.length) refuse(`round ${round.n} has no marks: nothing was walked`);
  const bad = reclassify(round, String(flags.reclass || '').split(',').filter(Boolean));
  if (bad.length) refuse(bad);
  const s = closeRound(l, round);
  save(l);
  console.log(`round ${round.n} closed (${s.clean ? 'clean' : 'not clean'}): ${s.rows} rows walked (${s.passed} passed, ${s.failed} failed, ${s.blocked} blocked marks)`);
  console.log(`  findings: ${s.defects} design defect(s) counted, ${s.noted} noted (one walker, not hard), ${s.handled} handled, ${s.missing} missing branch(es), ${s.questions} new product question(s), ${s.repeats} repeat(s)`);
  for (const f of s.findings) console.log(`  ${f.counted ? 'COUNT ' : f.cls === 'question' ? (f.isNew ? 'NEW?  ' : 'known ') : 'note  '}${f.cls}${f.hard ? ' (' + f.hard + ')' : ''} ${f.row}${f.question ? ' ' + f.question : ''}${f.repeat ? ' [repeat]' : ''} — ${f.walkers.join('+')}${f.text ? ': ' + f.text : ''}`);
  const st = scenarioStatus(l);
  console.log(`walks: ${st.status} — ${st.why}`);
  if (terminal(st)) writeSummary(l, st);
  process.exit(0);
}

if (cmd === 'status') {
  if (!fs.existsSync(ledgerFile)) {
    if (!fs.existsSync(summaryFile)) refuse(`no ledger for ${feature}: run init first`);
    const s = JSON.parse(read(summaryFile));
    console.log(`${feature}: ${s.status.status} — ${s.status.why} (committed summary, ${s.rounds.length} round(s))`);
    process.exit(0);
  }
  const l = load();
  const st = scenarioStatus(l);
  const c = st.counts;
  if (flags.json) { console.log(JSON.stringify({ feature, ...st, rows: l.rows.length, rounds: l.rounds.map((r) => ({ n: r.n, commit: r.commit, closed: !!r.closed, summary: r.summary || null })) }, null, 2)); process.exit(0); }
  console.log(`${feature}: ${st.status} — ${st.why}`);
  console.log(`  rows ${l.rows.length}: ${c.passed} passed · ${c.failed} failed · ${c.blocked} blocked · ${c.pending} pending (from ${l.source})`);
  for (const r of l.rounds) {
    const s = r.summary;
    console.log(`  r${r.n} ${r.commit.slice(0, 7)}${r.fresh ? ' fresh' : ''} ${r.closed ? `${s.clean ? 'clean' : 'not clean'} · ${s.rows} rows · ${s.defects} defect(s), ${s.missing} missing, ${s.questions} new question(s), ${s.repeats} repeat(s)` : `open · ${r.marks.length} mark(s) so far`}`);
  }
  const by = (st2) => l.rows.filter((r) => rowStatus(l, r.id) === st2);
  const list = (label, rows) => rows.length && console.log(`  ${label} (${rows.length}): ${rows.slice(0, 8).map((r) => r.id).join(', ')}${rows.length > 8 ? ' …' : ''}`);
  list('failed', by('failed')); list('blocked', by('blocked')); if (l.rounds.length) list('pending', by('pending'));
  process.exit(0);
}
usage();

// A terminal verdict goes to review/scenario-ledger-<feature>.json (commit it in the closing PR). `items` is what the atlas
// backlog reads from review/*.json: the product questions the walks left open land in the decision queue.
function writeSummary(l, st) {
  const blocked = l.rows.filter((r) => rowStatus(l, r.id) === 'blocked');
  const qOf = (r) => [...l.rounds].reverse().flatMap((x) => x.marks.filter((m) => m.row === r.id && m.question)).map((m) => m.question)[0] || r.question || 'unnamed';
  const byQ = new Map();
  for (const r of blocked) byQ.set(qOf(r), [...(byQ.get(qOf(r)) || []), r]);
  const items = [...byQ].map(([q, rows]) => ({ id: `scenarios-${feature}-${q}`, target: { kind: 'feature', id: feature }, kind: 'decision', severity: 'medium',
    title: `${q}: ${rows[0].label}`.slice(0, 160), detail: `Left open by the scenario walks of ${feature} (${st.status}). Blocks: ${rows.map((r) => r.id).join(', ')}.`, blocks: rows.map((r) => r.id), source: 'scenario-ledger' }));
  const rowsLeft = ['failed', 'pending'].flatMap((s2) => l.rows.filter((r) => rowStatus(l, r.id) === s2).map((r) => ({ id: r.id, status: s2, label: r.label })));
  const out = { feature, status: { status: st.status, why: st.why }, counts: st.counts, source: l.source, cap: l.cap,
    rounds: l.rounds.filter((r) => r.closed).map((r) => ({ n: r.n, commit: r.commit, fresh: !!r.fresh, clean: r.summary.clean, rows: r.summary.rows, defects: r.summary.defects, noted: r.summary.noted, handled: r.summary.handled, missing: r.summary.missing, questions: r.summary.questions, repeats: r.summary.repeats })),
    open: rowsLeft, items };
  fs.writeFileSync(summaryFile, JSON.stringify(out, null, 2));
  console.log(`summary: ${path.relative(root, summaryFile)} — commit it in the closing PR${items.length ? `; ${items.length} open product question(s) go to the decision queue` : ''}`);
}
