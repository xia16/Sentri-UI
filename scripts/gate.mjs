// The mechanical gate on the exact merge candidate: docs/design-workflow/briefs/gate.md §1, plus the screen diff and the
// before/after pairs the judge decides on (§3-4).
// Usage: node scripts/gate.mjs --candidate <ref> --scope <feature,...> [--class copy|presentation|behaviour|shared]
//                              [--mode normal|refactor] [--out <dir>] [--quick] [--keep]
//   --candidate  the branch (or commit) to merge; it must already contain origin/main (merge main forward first)
//   --scope      the features the change means to touch; a changed screen elsewhere makes it a shared-component change
//   --quick      compare only the scope's screens (a builder's self-check; the gate itself never runs quick)
// Run it from an up-to-date main checkout, never from the candidate: a candidate does not grade itself with its own gate.
// Writes <out>/mechanical.json and, for every changed screen, <out>/pairs/<screen>/<lang>-<width>.png (base | candidate).
// Exit 0 when every mechanical check passes; the judge (gate.md) then writes <out>/verdict.json and
// `node scripts/gate.mjs --verdict <out>` checks it against mechanical.json.
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLASSES, effectiveClass, classifyScreens, checkVerdict, touchesSystem } from './loop-rules.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PW_HOME = 'C:/Users/ying_/.cache/adam-design/playwright-1.63.0';
const pwPath = process.env.SENTRI_PLAYWRIGHT || PW_HOME + '/node_modules/playwright';

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null; };
const flag = (k) => argv.includes('--' + k);

// ---------- --verdict <out>: check the judge's verdict against the mechanical result ----------
if (opt('verdict')) {
  const dir = opt('verdict');
  const mech = JSON.parse(fs.readFileSync(path.join(dir, 'mechanical.json'), 'utf8'));
  // One judge writes verdict.json; a shared change too big for one judge is split by feature into verdict-<feature>.json.
  const files = fs.readdirSync(dir).filter((f) => /^verdict(-[\w.-]+)?\.json$/.test(f));
  if (!files.length) { console.error(`no verdict.json (or verdict-<feature>.json) in ${dir}`); process.exit(2); }
  const parts = files.map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  const cat = (k) => parts.flatMap((p) => p[k] || []);
  const verdict = { ...parts[0], pass: parts.every((p) => p.pass === true), pairs: cat('pairs'), walk: cat('walk'), defects: cat('defects'), rejected: cat('rejected'), contradicted: cat('contradicted') };
  for (const p of parts) if (p.candidate !== verdict.candidate || p.base !== verdict.base) verdict.candidate = 'mixed verdicts';
  const v = checkVerdict(verdict, mech);
  const head = git(['rev-parse', mech.ref]).out.trim();
  if (head && head !== mech.candidate) v.problems.push(`${mech.ref} moved to ${head.slice(0, 7)} after the gate ran on ${mech.candidate.slice(0, 7)}: gate again`);
  const ok = v.problems.length === 0 && verdict.pass === true && mech.pass === true;
  console.log(ok ? `GATE PASS ${mech.candidate.slice(0, 7)}` : `GATE FAIL ${mech.candidate.slice(0, 7)}`);
  for (const p of v.problems) console.log('  -', p);
  if (!verdict.pass) console.log('  - the judge failed it');
  process.exit(ok ? 0 : 1);
}

const ref = opt('candidate');
const declared = opt('class') || 'presentation';
const mode = opt('mode') || 'normal';
const scope = (opt('scope') || '').split(',').map((s) => s.trim()).filter(Boolean);
if (!ref || !CLASSES.includes(declared) || !['normal', 'refactor'].includes(mode) || (mode === 'normal' && !scope.length)) {
  console.error('usage: node scripts/gate.mjs --candidate <ref> --scope <feature,...> [--class copy|presentation|behaviour|shared] [--mode normal|refactor] [--out <dir>] [--quick] [--keep]');
  console.error('       node scripts/gate.mjs --verdict <out dir>');
  process.exit(2);
}
const out = path.resolve(opt('out') || path.join(os.tmpdir(), `sentri-gate-${Date.now()}`));
fs.mkdirSync(out, { recursive: true });
const started = Date.now();

function git(args, cwd = root) { const r = spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 << 20 }); return { code: r.status, out: r.stdout || '', err: r.stderr || '' }; }
function run(cmd, args, cwd, timeout = 20 * 60e3) {
  const o = { cwd, encoding: 'utf8', timeout, maxBuffer: 64 << 20, env: { ...process.env, SENTRI_PLAYWRIGHT: pwPath } };
  // npm is a .cmd on Windows, which only runs through a shell; one command string avoids passing args to a shell
  const r = cmd === 'npm' ? spawnSync(`npm ${args.join(' ')}`, { ...o, shell: true }) : spawnSync(cmd, args, o);
  const all = ((r.stdout || '') + (r.stderr || '')).trim().split('\n');
  return { code: r.status ?? 1, tail: all.slice(-6).join('\n'), all };
}
function runAsync(cmd, args, cwd) {
  return new Promise((res) => {
    const p = spawn(cmd, args, { cwd, env: { ...process.env, SENTRI_PLAYWRIGHT: pwPath } });
    let buf = '';
    p.stdout.on('data', (d) => (buf += d)); p.stderr.on('data', (d) => (buf += d));
    p.on('exit', (code) => res({ code: code ?? 1, tail: buf.trim().split('\n').slice(-6).join('\n') }));
  });
}
const checks = [], gaps = [];
const check = (name, ok, detail = '') => { checks.push({ check: name, result: ok === null ? 'skipped' : ok ? 'pass' : 'fail', detail }); console.log((ok === null ? 'SKIP' : ok ? 'PASS' : 'FAIL').padEnd(5), name, detail ? '— ' + detail.split('\n')[0] : ''); };

const mech = { pass: false, candidate: '', base: '', ref, mode, scope, class: { declared }, checks, gaps, screens: null, pairs: [] };
const finish = (code) => {
  mech.pass = code === 0 && checks.every((c) => c.result !== 'fail');
  mech.took = Math.round((Date.now() - started) / 1000) + 's';
  fs.writeFileSync(path.join(out, 'mechanical.json'), JSON.stringify(mech, null, 2));
  console.log(`\n${mech.pass ? 'MECHANICAL PASS' : 'MECHANICAL FAIL'} ${mech.candidate.slice(0, 7)} on base ${mech.base.slice(0, 7)} (${mech.class.effective || declared}, ${mode}) — ${out}`);
  process.exit(mech.pass ? 0 : 1);
};

// ---------- 0. the exact candidate ----------
git(['fetch', '-q', 'origin']);
mech.base = git(['rev-parse', 'origin/main']).out.trim();
mech.candidate = git(['rev-parse', '--verify', ref + '^{commit}']).out.trim();
if (!mech.candidate) { check('candidate exists', false, `no commit for ${ref}`); finish(1); }
const contains = git(['merge-base', '--is-ancestor', mech.base, mech.candidate]).code === 0;
check('candidate contains origin/main', contains, contains ? mech.base.slice(0, 7) : `merge main forward first: git fetch origin && git merge origin/main (R10, R12)`);
if (!contains) finish(1);
const files = git(['diff', '--name-only', mech.base, mech.candidate]).out.split('\n').filter(Boolean);
mech.files = files;

// ---------- worktrees and servers ----------
// Worktrees sit under a short temp path: Windows refuses the repo's deepest files under a long one.
const wtRoot = path.join(os.tmpdir(), `sg-${process.pid.toString(36)}${Date.now().toString(36).slice(-4)}`);
const wt = { base: path.join(wtRoot, 'base'), cand: path.join(wtRoot, 'cand') };
mech.worktrees = wt;
const servers = [];
const cleanup = () => {
  for (const s of servers) try { s.kill(); } catch {}
  if (flag('keep')) return;
  for (const k of ['base', 'cand']) git(['worktree', 'remove', '--force', wt[k]]);
  git(['worktree', 'prune']);
  fs.rmSync(wtRoot, { recursive: true, force: true });
};
for (const [k, sha] of [['base', mech.base], ['cand', mech.candidate]]) {
  const r = git(['worktree', 'add', '--detach', wt[k], sha]);
  if (r.code || !fs.existsSync(path.join(wt[k], 'scripts/serve-ux.cjs'))) { check(`worktree ${k}`, false, r.err.split('\n').filter((l) => /error|fatal/.test(l)).slice(0, 2).join(' | ')); cleanup(); finish(1); }
}
process.on('exit', cleanup);
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => r(p)); }); });
async function serve(dir) {
  const port = await freePort();
  servers.push(spawn(process.execPath, [path.join(dir, 'scripts/serve-ux.cjs'), String(port)], { cwd: dir, stdio: 'ignore' }));
  const url = `http://127.0.0.1:${port}`; // serve-ux listens on IPv4 only; localhost may resolve to ::1 first
  for (let i = 0; i < 50; i++) { try { const r = await fetch(url + '/atlas/atlas.json'); if (r.ok) return url; } catch {} await new Promise((r) => setTimeout(r, 100)); }
  throw new Error('server did not start in ' + dir);
}
const url = { base: await serve(wt.base), cand: await serve(wt.cand) };

// ---------- 1. mechanical checks on the candidate ----------
let r = run('npm', ['test'], wt.cand);
const counts = (r.all.join('\n').match(/ℹ (pass|fail|skipped) \d+/g) || []).join(', ');
check('npm test', r.code === 0, counts || r.tail);

r = run('npm', ['run', 'check'], wt.cand);
check('npm run check', r.code === 0, r.all.find((l) => /atlas:/.test(l)) || r.tail);

{
  const file = path.join(wt.cand, 'atlas/atlas.json');
  const strip = (s) => { const j = JSON.parse(s); delete j.generated; delete j.commit; return JSON.stringify(j); };
  const before = fs.readFileSync(file, 'utf8');
  r = run(process.execPath, ['scripts/build-atlas.mjs'], wt.cand);
  const same = r.code === 0 && strip(before) === strip(fs.readFileSync(file, 'utf8'));
  git(['checkout', '--', 'atlas/atlas.json'], wt.cand);
  check('atlas.json is regenerated', same, same ? '' : r.code ? r.tail : 'npm run atlas changes atlas/atlas.json beyond its stamps: rebuild and commit it');
}

r = git(['grep', '-n', '-E', '^(<<<<<<<|>>>>>>>)( |$)', mech.candidate]);
check('no conflict markers', !r.out.trim(), r.out.trim().split('\n').slice(0, 3).join(' | '));

// check-states runs on both sides: a state that already fails on main (e.g. a stress-test label the copy pass hasn't
// removed yet) is main's debt, reported but not blocking; a problem main doesn't have fails the gate.
if (CLASSES.indexOf(declared) >= 1 || mode === 'refactor') {
  const [rb, rc] = await Promise.all([runAsync(process.execPath, ['scripts/check-states.mjs'], wt.base), runAsync(process.execPath, ['scripts/check-states.mjs'], wt.cand)]);
  const problems = (dir) => {
    const f = path.join(dir, 'review/state-check.json');
    if (!fs.existsSync(f)) return null;
    const n = {};
    for (const s of JSON.parse(fs.readFileSync(f, 'utf8'))) for (const p of s.problems || []) { const k = `${s.component}/${s.variant}/${s.state}: (${p.check}) ${String(p.detail).replace(/\d+(\.\d+)?px/g, 'Npx')}`; n[k] = (n[k] || 0) + 1; }
    return n;
  };
  const pb = problems(wt.base), pc = problems(wt.cand);
  if (!pc) check('check-states', false, `no review/state-check.json written on the candidate (exit ${rc.code}): ${rc.tail}`);
  else {
    const added = Object.keys(pc).filter((k) => pc[k] > ((pb || {})[k] || 0));
    const fixed = Object.keys(pb || {}).filter((k) => !pc[k]);
    const debt = Object.keys(pc).length - added.length;
    mech.states = { added, fixed: fixed.length, debt };
    check('check-states (no new problem)', added.length === 0, added.length ? `${added.length} new: ${added.slice(0, 3).join(' | ')}` : `${debt} problem(s) already on main${fixed.length ? `, ${fixed.length} fixed` : ''}`);
    if (debt) gaps.push(`check-states: ${debt} problem(s) already on main are not this change's (review/state-check.json)`);
  }
}

// ---------- the screen diff: every screen, base vs candidate, bare at 390 ----------
const quick = flag('quick');
if (quick) gaps.push('quick run: screens outside the scope were not compared (a builder self-check, not a gate)');
const shoot = (side, dir, extra) => new Promise((res) => {
  const args = [path.join(root, 'scripts/shoot-screens.mjs'), dir, '--base', url[side], '--commit', side === 'base' ? mech.base : mech.candidate,
    '--atlas', path.join(wt[side], 'atlas/atlas.json'), ...extra];
  const p = spawn(process.execPath, args, { cwd: root, stdio: ['ignore', 'ignore', 'inherit'], env: { ...process.env, SENTRI_PLAYWRIGHT: pwPath } });
  p.on('exit', () => res(JSON.parse(fs.readFileSync(path.join(dir, 'shots.json'), 'utf8'))));
});
const scopeArgs = quick ? ['--feature', scope.join(',')] : [];
console.log('\nshooting every screen on base and candidate …');
const [shotsBase, shotsCand] = await Promise.all([shoot('base', path.join(out, 'shots/base'), scopeArgs), shoot('cand', path.join(out, 'shots/cand'), scopeArgs)]);

const { chromium } = createRequire(PW_HOME + '/package.json')(pwPath);
const browser = await chromium.launch();
const page = await browser.newPage();
async function pctDiff(a, b) {
  const x = fs.readFileSync(a), y = fs.readFileSync(b);
  if (x.equals(y)) return 0;
  return page.evaluate(async ([p, q]) => {
    const load = (s) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s; });
    const [i, j] = await Promise.all([load(p), load(q)]);
    const w = Math.max(i.width, j.width), h = Math.max(i.height, j.height);
    const px = (n) => { const k = document.createElement('canvas'); k.width = w; k.height = h; const g = k.getContext('2d'); g.drawImage(n, 0, 0); return g.getImageData(0, 0, w, h).data; };
    const d1 = px(i), d2 = px(j); let n = 0;
    for (let o = 0; o < d1.length; o += 4) if (Math.abs(d1[o] - d2[o]) + Math.abs(d1[o + 1] - d2[o + 1]) + Math.abs(d1[o + 2] - d2[o + 2]) > 24) n++;
    return (n / (w * h)) * 100;
  }, [x.toString('base64'), y.toString('base64')]);
}
const pct = {};
for (const c of shotsCand.runs) {
  const b = shotsBase.runs.find((x) => x.screen === c.screen);
  if (c.ok && b?.ok) pct[c.screen] = await pctDiff(path.join(out, 'shots/base', b.file), path.join(out, 'shots/cand', c.file));
}
const screens = classifyScreens(shotsBase.runs, shotsCand.runs, (id) => pct[id] ?? 0);
mech.screens = screens;
console.log(`screens: ${screens.same.length} same, ${screens.diff.length} changed, ${screens.new.length} new, ${screens.gone.length} gone, ${screens.broken.length} broken${screens.bothBroken.length ? `, ${screens.bothBroken.length} broken on both` : ''}`);
for (const d of screens.diff) console.log(`  DIFF ${String(d.pct).padStart(6)}%  ${d.id}`);

check('no screen broken by the change', !screens.broken.length, screens.broken.map((s) => `${s.id}: ${s.error || 'does not render'}`).slice(0, 3).join(' | '));
if (screens.bothBroken.length) gaps.push(`${screens.bothBroken.length} screen(s) don't render on base or candidate: ${screens.bothBroken.map((s) => s.id).slice(0, 5).join(', ')}`);
const ec = effectiveClass({ declared, files, diffs: [...screens.diff, ...screens.new, ...screens.gone], scope });
mech.class = { declared, effective: ec.cls, why: ec.why };
if (ec.cls !== declared) console.log(`class: ${declared} → ${ec.cls} (${ec.why.join('; ')})`);
if (mode === 'refactor') {
  const moved = [...screens.diff, ...screens.new, ...screens.gone];
  check('refactor: every screen identical', !moved.length, moved.map((s) => s.id).slice(0, 5).join(', '));
}
// The shared-component queue: one shared change at a time, oldest first. A shared candidate waits while an older open,
// non-draft PR also touches the shared system; once that merges, this one merges main forward and is gated against it.
if (ec.cls === 'shared') {
  const q = queueAhead();
  check('shared-component queue: first in line', q.ok, q.detail);
  gaps.push('shared-component change: every changed screen on every feature is judged (split the judges by feature if needed)');
}
function queueAhead() {
  const branch = ref.replace(/^origin\//, '');
  const r = spawnSync('gh', ['pr', 'list', '--state', 'open', '--limit', '100', '--json', 'number,headRefName,createdAt,isDraft,files'], { cwd: root, encoding: 'utf8', maxBuffer: 64 << 20 });
  if (r.status) return { ok: false, detail: `cannot read the queue (gh pr list failed): ${(r.stderr || '').trim().split('\n')[0]}` };
  const prs = JSON.parse(r.stdout);
  const mine = prs.find((p) => p.headRefName === branch);
  if (!mine) return { ok: false, detail: `no open PR for ${branch}: open one, the queue orders PRs` };
  const ahead = prs.filter((p) => p.number !== mine.number && !p.isDraft && p.createdAt < mine.createdAt && touchesSystem((p.files || []).map((f) => f.path)).length);
  return ahead.length ? { ok: false, detail: `waiting behind ${ahead.map((p) => '#' + p.number).join(', ')}: merge or close those first, then merge main forward and gate again` } : { ok: true, detail: `#${mine.number}` };
}

// ---------- the pairs the judge decides on: every changed screen, 390 and 360, EN and ZH ----------
const changed = [...screens.diff, ...screens.new].map((s) => s.id);
if (changed.length) {
  console.log(`\nshooting ${changed.length} changed screen(s) at 390/360 × en/zh …`);
  const pairArgs = ['--screens', changed.join(','), '--widths', '390,360', '--langs', 'en,zh'];
  const [pb, pc] = await Promise.all([shoot('base', path.join(out, 'pairs-raw/base'), pairArgs), shoot('cand', path.join(out, 'pairs-raw/cand'), pairArgs)]);
  const zhIgnored = new Set();
  for (const c of pc.runs) {
    const b = pb.runs.find((x) => x.screen === c.screen && x.lang === c.lang && x.width === c.width);
    if (c.lang === 'zh' && c.zh === 'ignored') { zhIgnored.add(c.screen); continue; }
    const file = path.join(out, 'pairs', c.screen, `${c.lang}-${c.width}.png`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const img = (side, run) => run?.ok ? 'data:image/png;base64,' + fs.readFileSync(path.join(out, 'pairs-raw', side, run.file)).toString('base64') : '';
    await page.setViewportSize({ width: c.width * 2 + 48, height: 900 });
    await page.setContent(`<body style="margin:0;background:#ddd;font:600 13px system-ui;display:flex;gap:16px;padding:8px 16px">
      ${[['BASE ' + mech.base.slice(0, 7), img('base', b)], ['CANDIDATE ' + mech.candidate.slice(0, 7), img('cand', c)]].map(([t, s]) =>
        `<div><div style="height:28px;line-height:28px">${t} · ${c.lang} ${c.width}</div>${s ? `<img src="${s}" style="display:block;width:${c.width}px;height:844px">` : `<div style="width:${c.width}px;height:844px;background:#fff;display:grid;place-items:center">not on this side</div>`}</div>`).join('')}</body>`);
    await page.screenshot({ path: file, fullPage: true });
    mech.pairs.push({ screen: c.screen, lang: c.lang, width: c.width, file: path.relative(out, file).replace(/\\/g, '/') });
  }
  if (zhIgnored.size) gaps.push(`no Chinese rendering (?lang=zh is ignored) on ${zhIgnored.size} changed screen(s): ${[...zhIgnored].slice(0, 6).join(', ')}${zhIgnored.size > 6 ? ' …' : ''}. ZH fit is unverified there.`);
}
await browser.close();

// ---------- legibility on the changed screens ----------
if (changed.length) {
  if (fs.existsSync(path.join(wt.cand, 'scripts/check-legibility.mjs'))) {
    // the README's own line, not a sentence that mentions it ("change the line above to `Legibility gate: strict`")
    const strict = /^Legibility gate: strict\s*$/m.test(fs.readFileSync(path.join(wt.cand, 'docs/design-workflow/README.md'), 'utf8'));
    r = run(process.execPath, ['scripts/check-legibility.mjs', '--base', url.cand, '--changed', changed.join(','), ...(strict ? ['--strict'] : ['--compare', url.base])], wt.cand);
    check(`farm legibility (${strict ? 'strict' : 'no worse than base'}) on changed screens`, r.code === 0, r.tail);
  } else check('farm legibility on changed screens', false, 'scripts/check-legibility.mjs is not on this candidate (it lands with #101): the gate fails closed');
}

// ---------- scenario leaves: the scope's features, and every feature whose screens changed ----------
const runner = fs.existsSync(path.join(wt.cand, 'scripts/run-scenarios.mjs'));
for (const f of new Set([...scope, ...[...screens.diff, ...screens.new].map((s) => s.feature)])) {
  const spec = path.join(wt.cand, 'features', f, 'scenarios.json');
  if (!fs.existsSync(spec)) { if (CLASSES.indexOf(declared) >= 2) gaps.push(`${f} has no executable leaves (features/${f}/scenarios.json): behaviour is covered by the walk only`); continue; }
  if (!runner) { check(`scenarios ${f}`, false, 'scripts/run-scenarios.mjs is not on this candidate'); continue; }
  r = run(process.execPath, ['scripts/run-scenarios.mjs', f, '--base', url.cand], wt.cand);
  check(`scenarios ${f}`, r.code === 0, r.tail);
}

finish(0);
