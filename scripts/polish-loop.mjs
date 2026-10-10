// The polish loop's ledger: baselines, rounds, grades, stop conditions and the owner's review packet.
// The driver (.claude/skills/polish-loop/SKILL.md) runs these from an up-to-date main checkout; the brief is
// docs/design-workflow/briefs/polish-loop.md. Run files live in review/loop/<feature>/ (not committed; images never are).
//
//   node scripts/polish-loop.mjs start  <feature> [--cap 5] [--job "<what this loop is for>"]
//   node scripts/polish-loop.mjs round  <feature>          shoot every screen, run legibility and leaves: the round's evidence
//   node scripts/polish-loop.mjs grades <feature>          check r<n>/grades.json and print the worst first
//   node scripts/polish-loop.mjs record <feature> --fix defect|enhancement|none [--pr <n>] [--merged yes|no] [--what "<one line>"]
//   node scripts/polish-loop.mjs decide <feature> --title "<product question>" --options "a | b" --recommend "<option and why>" [--blocks "<leaf ids>"]
//   node scripts/polish-loop.mjs status <feature>
//   node scripts/polish-loop.mjs packet <feature>          shoot the final screens; write the packet and review/polish-<feature>.json
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { screensOf, checkGrades, worstFirst, hardCount, loopStatus, isClean, DIMENSIONS } from './loop-rules.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [cmd, feature, ...rest] = process.argv.slice(2);
const opt = (k) => { const i = rest.indexOf('--' + k); return i >= 0 ? rest[i + 1] : null; };
const usage = () => { console.error(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//   node')).map((l) => l.slice(3)).join('\n')); process.exit(2); };
if (!cmd || !feature) usage();

const dir = path.join(root, 'review', 'loop', feature);
const ledgerFile = path.join(dir, 'ledger.json');
const sh = (c, a, o = {}) => spawnSync(c, a, { cwd: root, encoding: 'utf8', maxBuffer: 64 << 20, ...o });
const head = () => sh('git', ['rev-parse', 'HEAD']).stdout.trim();
const atlas = () => JSON.parse(fs.readFileSync(path.join(root, 'atlas/atlas.json'), 'utf8'));
const screens = () => screensOf(atlas(), { features: [feature] });
const load = () => { if (!fs.existsSync(ledgerFile)) { console.error(`no loop for ${feature}: run start first`); process.exit(2); } return JSON.parse(fs.readFileSync(ledgerFile, 'utf8')); };
const save = (l) => fs.writeFileSync(ledgerFile, JSON.stringify(l, null, 2));

// Evidence is only good for the commit it was taken on, and a round starts on main as it is now.
// SENTRI_LOOP_TEST_MAIN=HEAD tests these scripts on a branch; a real loop never sets it.
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

// The checks rewrite tracked reports (review/legibility.json, review/scenarios-*.json); a ledger checkout stays clean.
const restoreReview = () => sh('git', ['checkout', '--', 'review']);

function shoot(out) {
  const r = sh(process.execPath, ['scripts/shoot-screens.mjs', out, '--feature', feature, '--widths', '390,360', '--langs', 'en,zh'], { stdio: ['ignore', 'pipe', 'inherit'] });
  const shots = JSON.parse(fs.readFileSync(path.join(out, 'shots.json'), 'utf8'));
  const zhIgnored = [...new Set(shots.runs.filter((x) => x.zh === 'ignored').map((x) => x.screen))];
  return { shots, zhIgnored, failed: shots.runs.filter((x) => !x.ok), tail: r.stdout.trim().split('\n').pop() };
}

function leaves(out) {
  const spec = path.join(root, 'features', feature, 'scenarios.json');
  if (!fs.existsSync(spec) || !fs.existsSync(path.join(root, 'scripts/run-scenarios.mjs'))) return { none: true };
  const r = sh(process.execPath, ['scripts/run-scenarios.mjs', feature], { stdio: ['ignore', 'pipe', 'pipe'] });
  const report = path.join(root, 'review', `scenarios-${feature}.json`);
  if (fs.existsSync(report)) fs.copyFileSync(report, path.join(out, 'leaves.json'));
  const s = fs.existsSync(report) ? JSON.parse(fs.readFileSync(report, 'utf8')).summary : null;
  if (!s) return { none: true, note: `run-scenarios wrote no report (exit ${r.status})` };
  return { pass: s.pass, fail: s.fail, blocked: s.blocked, pending: s.pending, exit: r.status };
}

function legibility(out) {
  if (!fs.existsSync(path.join(root, 'scripts/check-legibility.mjs'))) return { none: true };
  // Its per-screen findings (selectors, sizes, ratios) go to the grader as legibility.txt; the summary line is the round's number.
  const r = sh(process.execPath, ['scripts/check-legibility.mjs', '--feature', feature], { stdio: ['ignore', 'pipe', 'pipe'] });
  fs.writeFileSync(path.join(out, 'legibility.txt'), r.stdout || '');
  const m = (r.stdout || '').match(/legibility: (\d+) screens, (\d+) fail \(text <\d+px: (\d+) nodes, contrast <[\d.]+: (\d+), 16px\+ text <\d+: (\d+), targets <\d+px: (\d+)\)/);
  if (!m) return { none: true, note: 'check-legibility printed no summary' };
  return { of: +m[1], failing: +m[2], small: +m[3], contrast: +m[4] + +m[5], taps: +m[6] };
}

if (cmd === 'start') {
  if (fs.existsSync(ledgerFile) && !rest.includes('--force')) { console.error(`a loop for ${feature} exists (${ledgerFile}); --force starts over`); process.exit(2); }
  const baseline = onMain();
  if (!screens().length) { console.error(`${feature} has no screens that render`); process.exit(2); }
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, args] of [['npm test', ['test']], ['npm run check', ['run', 'check']]]) {
    const r = spawnSync(`npm ${args.join(' ')}`, { cwd: root, encoding: 'utf8', shell: true, maxBuffer: 64 << 20 });
    if (r.status) { console.error(`${name} fails on the baseline ${baseline.slice(0, 7)}: fix main before a loop starts\n${(r.stdout + r.stderr).trim().split('\n').slice(-6).join('\n')}`); process.exit(1); }
  }
  restoreReview();
  const s = shoot(path.join(dir, 'r0'));
  save({ feature, job: opt('job') || 'polish', baseline, cap: Number(opt('cap')) || 5, started: new Date().toISOString(), screens: screens().map((x) => x.id), zhIgnored: s.zhIgnored, decisions: [], rounds: [] });
  console.log(`loop ${feature} started on ${baseline.slice(0, 7)}: ${screens().length} screens shot at 390/360 × en/zh (${s.tail})`);
  if (s.zhIgnored.length) console.log(`no Chinese rendering on ${s.zhIgnored.length} screen(s): a declared gap until they render ?lang=zh`);
  process.exit(0);
}

if (cmd === 'round') {
  const l = load();
  const st = loopStatus(l);
  if (st.status !== 'continue') { console.log(`the loop is ${st.status}: ${st.why}. Next: packet.`); process.exit(0); }
  const open = l.rounds.find((r) => !r.recorded);
  if (open) { console.error(`round ${open.n} is not recorded yet`); process.exit(2); }
  const start = onMain();
  const n = l.rounds.length + 1;
  const out = path.join(dir, `r${n}`);
  fs.rmSync(out, { recursive: true, force: true });
  const s = shoot(out);
  const evidence = { n, start, at: new Date().toISOString(), legibility: legibility(out), leaves: leaves(out), shotFailures: s.failed.map((x) => `${x.screen} ${x.lang}-${x.width}: ${x.error}`) };
  restoreReview();
  fs.writeFileSync(path.join(out, 'evidence.json'), JSON.stringify(evidence, null, 2));
  l.rounds.push({ n, start, recorded: false });
  save(l);
  console.log(`round ${n} on ${start.slice(0, 7)}: shots in ${path.relative(root, out)}`);
  console.log(`  legibility: ${evidence.legibility.none ? 'not available' : `${evidence.legibility.failing}/${evidence.legibility.of} screens fail (${evidence.legibility.small} small text, ${evidence.legibility.contrast} contrast, ${evidence.legibility.taps} targets)`}`);
  console.log(`  leaves: ${evidence.leaves.none ? 'none (no features/' + feature + '/scenarios.json yet)' : `${evidence.leaves.pass} pass, ${evidence.leaves.fail} fail, ${evidence.leaves.blocked} blocked`}`);
  if (s.failed.length) console.log(`  ${s.failed.length} shot(s) failed: ${evidence.shotFailures.slice(0, 3).join(' | ')}`);
  console.log(`next: a grader writes ${path.relative(root, path.join(out, 'grades.json'))} (docs/design-workflow/briefs/grade.md), then: polish-loop grades ${feature}`);
  process.exit(0);
}

const current = (l) => { const r = l.rounds[l.rounds.length - 1]; if (!r) { console.error('no round yet: run round first'); process.exit(2); } return r; };

if (cmd === 'grades') {
  const l = load(); const r = current(l);
  const f = path.join(dir, `r${r.n}`, 'grades.json');
  if (!fs.existsSync(f)) { console.error(`no ${path.relative(root, f)}`); process.exit(2); }
  const g = JSON.parse(fs.readFileSync(f, 'utf8'));
  const c = checkGrades(g, l.screens);
  if (g.commit && g.commit !== r.start) c.problems.push(`graded on ${g.commit.slice(0, 7)}, the round started on ${r.start.slice(0, 7)}`);
  if (c.problems.length) { console.log('GRADES REJECTED — send these back to the grader:'); for (const p of c.problems) console.log('  -', p); process.exit(1); }
  const worst = worstFirst(g);
  console.log(`round ${r.n}: ${g.states.length} states graded, ${hardCount(g)} hard failure(s). Worst first:`);
  for (const s of worst.slice(0, 12)) console.log(`  ${(s.hard || []).length ? 'HARD ' + s.hard.map((h) => h.type).join(',') : 'score ' + s.total + '/10'}  ${s.screen}${s.state ? ' / ' + s.state : ''} — ${(s.hard?.[0] || s.lost?.[0] || {}).what || ''}`);
  if (!worst.length) console.log('  nothing below full marks: no defect to select');
  process.exit(0);
}

if (cmd === 'record') {
  const l = load(); const r = current(l);
  const kind = opt('fix');
  if (!['defect', 'enhancement', 'none'].includes(kind)) usage();
  const g = JSON.parse(fs.readFileSync(path.join(dir, `r${r.n}`, 'grades.json'), 'utf8'));
  if (!checkGrades(g, l.screens).ok) { console.error('the grades are not accepted yet: polish-loop grades first'); process.exit(2); }
  const ev = JSON.parse(fs.readFileSync(path.join(dir, `r${r.n}`, 'evidence.json'), 'utf8'));
  const merged = opt('merged') === 'yes';
  if (kind !== 'none' && merged && !opt('pr')) { console.error('a merged fix names its PR'); process.exit(2); }
  Object.assign(r, {
    recorded: true, hard: hardCount(g),
    scores: Object.fromEntries(g.states.map((s) => [`${s.screen}${s.state ? '/' + s.state : ''}`, DIMENSIONS.reduce((n, d) => n + s.scores[d], 0)])),
    leaves: ev.leaves.none ? { uncovered: 0, none: true } : { pass: ev.leaves.pass, fail: ev.leaves.fail, blocked: ev.leaves.blocked, uncovered: ev.leaves.pending || 0 },
    legibility: ev.legibility.none ? null : { failing: ev.legibility.failing, of: ev.legibility.of },
    fix: kind === 'none' ? null : { kind, pr: Number(opt('pr')) || null, merged, what: opt('what') || '' },
  });
  save(l);
  const st = loopStatus(l);
  console.log(`round ${r.n} recorded (${isClean(r) ? 'clean' : 'not clean'}). Loop: ${st.status} — ${st.why}`);
  process.exit(0);
}

if (cmd === 'decide') {
  const l = load();
  if (!opt('title') || !opt('options') || !opt('recommend')) usage();
  const d = { id: `${feature}-loop-${l.decisions.length + 1}`, target: { kind: 'feature', id: feature }, kind: 'decision', severity: 'medium',
    title: opt('title'), detail: `Found by the polish loop on ${feature}, round ${l.rounds.length}.`, options: opt('options').split('|').map((s) => s.trim()),
    recommendation: opt('recommend'), blocks: (opt('blocks') || '').split(',').map((s) => s.trim()).filter(Boolean), source: 'polish-loop' };
  l.decisions.push(d); save(l);
  console.log(`filed ${d.id}; it goes to review/polish-${feature}.json with the packet, and its leaves stay blocked`);
  process.exit(0);
}

if (cmd === 'status') {
  const l = load(); const st = loopStatus({ ...l, rounds: l.rounds.filter((r) => r.recorded) });
  console.log(`${feature}: ${st.status} — ${st.why}`);
  for (const r of l.rounds) console.log(`  r${r.n} ${r.start.slice(0, 7)} ${r.recorded ? `${isClean(r) ? 'clean' : 'not clean'} · hard ${r.hard} · ${r.fix ? `${r.fix.kind} #${r.fix.pr || '-'} ${r.fix.merged ? 'merged' : 'rejected'}` : 'no fix'}` : 'open'}`);
  process.exit(0);
}

if (cmd === 'packet') {
  const l = load();
  const final = onMain();
  const out = path.join(dir, 'final');
  fs.rmSync(out, { recursive: true, force: true });
  const s = shoot(out);
  const st = loopStatus({ ...l, rounds: l.rounds.filter((r) => r.recorded) });
  const pk = path.join(dir, 'packet');
  fs.rmSync(pk, { recursive: true, force: true });
  fs.mkdirSync(path.join(pk, 'img'), { recursive: true });
  const rows = [];
  for (const id of l.screens) for (const run of ['en-390', 'en-360', 'zh-390']) {
    const [lang] = run.split('-');
    if (lang === 'zh' && l.zhIgnored.includes(id)) continue;
    const b = path.join(dir, 'r0', id, run + '.png'), a = path.join(out, id, run + '.png');
    if (!fs.existsSync(b) && !fs.existsSync(a)) continue;
    const same = fs.existsSync(b) && fs.existsSync(a) && fs.readFileSync(b).equals(fs.readFileSync(a));
    for (const [side, f] of [['before', b], ['after', a]]) if (fs.existsSync(f)) fs.copyFileSync(f, path.join(pk, 'img', `${id}.${run}.${side}.png`));
    rows.push({ id, run, same });
  }
  const leavesLast = [...l.rounds].reverse().find((r) => r.recorded)?.leaves;
  // `items` is what the atlas backlog reads from review/*.json: the loop's open decisions land in the decision queue.
  const summary = { feature, job: l.job, baseline: l.baseline, final, status: st, rounds: l.rounds, decisions: l.decisions, items: l.decisions,
    gaps: [
      ...(l.zhIgnored.length ? [`No Chinese rendering on ${l.zhIgnored.length} screen(s): ZH fit unverified (${l.zhIgnored.slice(0, 6).join(', ')}${l.zhIgnored.length > 6 ? ' …' : ''}).`] : []),
      ...(leavesLast?.none ? [`No executable leaves (features/${feature}/scenarios.json): behaviour covered by walks only.`] : []),
      ...(s.failed.length ? [`${s.failed.length} final shot(s) failed to render.`] : []),
    ] };
  fs.writeFileSync(path.join(root, 'review', `polish-${feature}.json`), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(pk, 'summary.json'), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(pk, 'index.html'), packetHtml(summary, rows));
  console.log(`packet: ${path.relative(root, pk)}/index.html (${rows.filter((r) => !r.same).length} changed of ${rows.length} screen runs)`);
  console.log(`summary: review/polish-${feature}.json — commit it in the loop's closing PR, and publish the packet for the owner`);
  process.exit(0);
}
usage();

function packetHtml(s, rows) {
  const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const recorded = s.rounds.filter((r) => r.recorded);
  const keys = [...new Set(recorded.flatMap((r) => Object.keys(r.scores || {})))];
  const changed = rows.filter((r) => !r.same), same = rows.filter((r) => r.same);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(s.feature)} review packet</title>
<style>
:root{--bg:#f6f7f4;--paper:#fff;--ink:#17201b;--muted:#5d6861;--line:#dfe3dd;--green:#1f7a4d;--amber:#9a6200;--red:#b3261e}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#121513;--paper:#1b1f1c;--ink:#e8ece9;--muted:#a3ada6;--line:#2c322e;--green:#5fc28f;--amber:#e0a84a;--red:#f08b84}}
:root[data-theme=dark]{--bg:#121513;--paper:#1b1f1c;--ink:#e8ece9;--muted:#a3ada6;--line:#2c322e;--green:#5fc28f;--amber:#e0a84a;--red:#f08b84}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,sans-serif}
main{max-width:1100px;margin:0 auto;padding:24px 16px 64px}h1{font-size:26px;margin:0 0 4px}h2{font-size:19px;margin:40px 0 12px}
.meta{color:var(--muted);font-size:14px}code{font-size:14px}table{border-collapse:collapse;width:100%;font-size:14px;background:var(--paper)}
th,td{border-bottom:1px solid var(--line);padding:8px 10px;text-align:left;vertical-align:top}th{color:var(--muted);font-weight:600}
.status{font-weight:600}.done{color:var(--green)}.stopped{color:var(--amber)}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:12px 0 28px}
.pair figure{margin:0}.pair img{width:100%;max-width:390px;border:1px solid var(--line);display:block}.pair figcaption{font-size:13px;color:var(--muted);margin-top:4px}
.wrap{overflow-x:auto}ul{padding-left:20px}
</style></head><body><main>
<h1>${esc(s.feature)}: polish loop</h1>
<p class="meta">${esc(s.job)} · baseline <code>${s.baseline.slice(0, 7)}</code> → final <code>${s.final.slice(0, 7)}</code> · <span class="status ${s.status.status}">${esc(s.status.status)}</span>: ${esc(s.status.why)}</p>
<p class="meta">Agent grades are not approval. The approved version of each screen stays in the atlas until you promote the new one.</p>
<h2>Open decisions (${s.decisions.length})</h2>
${s.decisions.length ? `<ul>${s.decisions.map((d) => `<li><strong>${esc(d.title)}</strong><br>Options: ${d.options.map(esc).join(' · ')}<br>Recommended: ${esc(d.recommendation)}${d.blocks.length ? `<br><span class="meta">Blocks: ${d.blocks.map(esc).join(', ')}</span>` : ''}</li>`).join('')}</ul>` : '<p class="meta">None.</p>'}
<h2>Rounds</h2><div class="wrap"><table><tr><th>Round</th><th>Start</th><th>Hard failures</th><th>Leaves</th><th>Legibility</th><th>Change</th></tr>
${recorded.map((r) => `<tr><td>${r.n}</td><td><code>${r.start.slice(0, 7)}</code></td><td>${r.hard}</td><td>${r.leaves?.none ? 'none yet' : `${r.leaves.pass} pass · ${r.leaves.fail} fail · ${r.leaves.blocked} blocked`}</td><td>${r.legibility ? `${r.legibility.failing}/${r.legibility.of} screens fail` : '—'}</td><td>${r.fix ? `${esc(r.fix.kind)} ${r.fix.pr ? '#' + r.fix.pr : ''} ${r.fix.merged ? 'merged' : 'rejected by the gate'}<br><span class="meta">${esc(r.fix.what)}</span>` : 'none (clean)'}</td></tr>`).join('')}
</table></div>
<h2>Grades per screen (of 10)</h2><div class="wrap"><table><tr><th>Screen</th>${recorded.map((r) => `<th>R${r.n}</th>`).join('')}</tr>
${keys.map((k) => `<tr><td><code>${esc(k)}</code></td>${recorded.map((r) => `<td>${r.scores?.[k] ?? '—'}</td>`).join('')}</tr>`).join('')}
</table></div>
<h2>Before and after (${changed.length} changed)</h2>
${changed.map((r) => `<h3 style="font-size:16px;margin:20px 0 0"><code>${esc(r.id)}</code> <span class="meta">${esc(r.run)}</span></h3><div class="pair">
<figure><img loading="lazy" src="img/${esc(r.id)}.${r.run}.before.png" alt="${esc(r.id)} before"><figcaption>Before · ${s.baseline.slice(0, 7)}</figcaption></figure>
<figure><img loading="lazy" src="img/${esc(r.id)}.${r.run}.after.png" alt="${esc(r.id)} after"><figcaption>After · ${s.final.slice(0, 7)}</figcaption></figure></div>`).join('')}
${same.length ? `<p class="meta">Unchanged: ${[...new Set(same.map((r) => r.id))].map(esc).join(', ')}</p>` : ''}
<h2>Declared gaps</h2>${s.gaps.length ? `<ul>${s.gaps.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>` : '<p class="meta">None.</p>'}
</main></body></html>`;
}
