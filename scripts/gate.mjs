// The mechanical gate on the exact merge candidate: docs/design-workflow/briefs/gate.md §1, plus the screen diff and the
// before/after pairs the judge decides on (§3-4).
// Usage: node scripts/gate.mjs --candidate <ref> --scope <feature,...> [--class copy|presentation|behaviour|shared]
//                              [--mode normal|refactor] [--out <dir>] [--quick] [--keep]
//   --candidate  the branch (or commit) to merge; it must already contain origin/main (merge main forward first)
//   --scope      the features the change means to touch; a changed screen elsewhere makes it a shared-component change
//   --quick      compare only the scope's screens (a builder's self-check; the gate itself never runs quick)
// Run it from an up-to-date main checkout, never from the candidate: a candidate does not grade itself with its own gate.
// Writes <out>/mechanical.json and, for every changed, new or removed screen, <out>/pairs/<screen>/<lang>-<width>.png
// (base | candidate) at 390 and 360 in EN and ZH.
// Exit 0 when every mechanical check passes; the judge (gate.md) then writes <out>/verdict.json, and
// `node scripts/gate.mjs --verdict <out>` checks it against mechanical.json, the PR head and origin/main.
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLASSES, screensOf, pageOf, pageAssets, sharedFiles, coverageLost, effectiveClass, classifyScreens, checkVerdict, touchesSystem, touchesTools } from './loop-rules.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PW_HOME = 'C:/Users/ying_/.cache/adam-design/playwright-1.63.0';
const pwPath = process.env.SENTRI_PLAYWRIGHT || PW_HOME + '/node_modules/playwright';

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null; };
const flag = (k) => argv.includes('--' + k);
const short = (s) => String(s || '?').slice(0, 7);
const VERDICT_FILE = /^verdict(-[\w.-]+)?\.json$/;
function passRecord(sha) { return path.join(path.resolve(root, git(['rev-parse', '--git-common-dir']).out.trim()), 'sentri-gate', `${sha}.json`); }
function git(args, cwd = root) { const r = spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 << 20 }); return { code: r.status, out: r.stdout || '', err: r.stderr || '' }; }

// ---------- --verdict <out>: check the judge's verdict against the mechanical result ----------
if (opt('verdict')) {
  const dir = opt('verdict');
  const read = (f) => { try { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { console.log(`GATE FAIL — ${path.join(dir, f)}: ${e.message.split('\n')[0]}`); process.exit(1); } };
  const mech = read('mechanical.json');
  // One judge writes verdict.json; a shared change too big for one judge is split by feature into verdict-<feature>.json.
  const files = fs.readdirSync(dir).filter((f) => VERDICT_FILE.test(f));
  if (!files.length) { console.error(`no verdict.json (or verdict-<feature>.json) in ${dir}`); process.exit(2); }
  const parts = files.map(read);
  const cat = (k) => parts.flatMap((p) => p[k] || []);
  const verdict = { ...parts[0], pass: parts.every((p) => p.pass === true), pairs: cat('pairs'), walk: cat('walk'), defects: cat('defects'), gone: cat('gone'), rejected: cat('rejected'), contradicted: cat('contradicted') };
  for (const p of parts) if (p.candidate !== verdict.candidate || p.base !== verdict.base) verdict.candidate = 'mixed verdicts';
  const v = checkVerdict(verdict, mech);
  // Fail closed: the PR head and origin/main are read fresh, and a ref that doesn't resolve fails the gate, never passes it.
  const fetched = git(['fetch', '-q', 'origin']);
  if (fetched.code !== 0) v.problems.push(`git fetch origin failed, so the PR head and origin/main can't be checked: ${fetched.err.trim().split('\n')[0]}`);
  const sha = (r) => (r ? git(['rev-parse', '--verify', '--quiet', `${r}^{commit}`]).out.trim() : '');
  const head = sha(mech.ref), main = sha('origin/main');
  if (!head) v.problems.push(`${mech.ref || 'the candidate ref'} does not resolve, so the PR head can't be checked against ${short(mech.candidate)}`);
  else if (head !== mech.candidate) v.problems.push(`${mech.ref} moved to ${short(head)} after the gate ran on ${short(mech.candidate)}: gate again`);
  if (!main) v.problems.push('origin/main does not resolve');
  else if (main !== mech.base) v.problems.push(`origin/main moved to ${short(main)} after the gate ran against ${short(mech.base)}: merge main forward and gate again (R10)`);
  const ok = v.problems.length === 0 && verdict.pass === true && mech.pass === true;
  console.log(`${ok ? 'GATE PASS' : 'GATE FAIL'} ${short(mech.candidate)}`);
  for (const p of v.problems) console.log('  -', p);
  if (verdict.pass !== true) console.log('  - the judge failed it');
  if (verdict.pass !== true && mech.pass !== true) console.log('  - the mechanical gate failed');
  // The merge names the gated commit, so GitHub refuses it if the PR head has moved since.
  // The pass record the merge guard (scripts/merge-guard.mjs) looks for lives in the git common dir, so every worktree sees it;
  // a failed verdict removes any earlier pass for the same commit.
  const passFile = passRecord(mech.candidate);
  if (!ok) fs.rmSync(passFile, { force: true });
  if (ok) {
    fs.mkdirSync(path.dirname(passFile), { recursive: true });
    fs.writeFileSync(passFile, JSON.stringify({ candidate: mech.candidate, base: mech.base, ref: mech.ref, out: path.resolve(dir), at: new Date().toISOString() }, null, 2));
    console.log(`merge: gh pr merge <n> --squash --match-head-commit ${mech.candidate}`);
  }
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
// A rerun into the same folder starts clean: old shots, pairs and verdicts are about a mechanical run that no longer exists.
for (const f of ['shots', 'pairs', 'mechanical.json', ...fs.readdirSync(out).filter((f) => VERDICT_FILE.test(f))]) fs.rmSync(path.join(out, f), { recursive: true, force: true });
const started = Date.now();
const env = { ...process.env, SENTRI_PLAYWRIGHT: pwPath };
const kids = [];

function run(cmd, args, cwd, timeout = 20 * 60e3) {
  const o = { cwd, encoding: 'utf8', timeout, maxBuffer: 64 << 20, env };
  // npm is a .cmd on Windows, which only runs through a shell; one command string avoids passing args to a shell
  const r = cmd === 'npm' ? spawnSync(`npm ${args.join(' ')}`, { ...o, shell: true }) : spawnSync(cmd, args, o);
  const all = ((r.stdout || '') + (r.stderr || '')).trim().split('\n');
  return { code: r.status ?? 1, tail: all.slice(-6).join('\n'), all };
}
// A long check runs beside the capture. Its output goes to a log file: the synchronous checks block this event loop, and a
// pipe nobody drains would stall the child.
function runAsync(cmd, args, cwd, log) {
  return new Promise((res) => {
    const fd = fs.openSync(log, 'w');
    const p = spawn(cmd, args, { cwd, stdio: ['ignore', fd, fd], env });
    kids.push(p);
    const done = (code) => { try { fs.closeSync(fd); } catch {} res({ code: code ?? 1, tail: fs.readFileSync(log, 'utf8').trim().split('\n').slice(-6).join('\n') }); };
    p.on('error', () => done(1)); p.on('exit', done);
  });
}
const checks = [], gaps = [];
const check = (name, ok, detail = '') => { checks.push({ check: name, result: ok === null ? 'skipped' : ok ? 'pass' : 'fail', detail }); console.log((ok === null ? 'SKIP' : ok ? 'PASS' : 'FAIL').padEnd(5), name, detail ? '— ' + detail.split('\n')[0] : ''); };

const mech = { pass: false, candidate: '', base: '', ref, mode, scope, quick: flag('quick'), class: { declared }, checks, gaps, screens: null, pairs: [] };
const finish = (code) => {
  mech.pass = code === 0 && checks.every((c) => c.result !== 'fail');
  mech.took = Math.round((Date.now() - started) / 1000) + 's';
  fs.writeFileSync(path.join(out, 'mechanical.json'), JSON.stringify(mech, null, 2));
  console.log(`\n${mech.pass ? 'MECHANICAL PASS' : 'MECHANICAL FAIL'} ${short(mech.candidate)} on base ${short(mech.base)} (${mech.class.effective || declared}, ${mode}) — ${out}`);
  process.exit(mech.pass ? 0 : 1);
};

// ---------- 0. the exact candidate ----------
git(['fetch', '-q', 'origin']);
mech.base = git(['rev-parse', 'origin/main']).out.trim();
mech.candidate = git(['rev-parse', '--verify', ref + '^{commit}']).out.trim();
if (!mech.candidate) { check('candidate exists', false, `no commit for ${ref}`); finish(1); }
fs.rmSync(passRecord(mech.candidate), { force: true }); // a new gate run voids any earlier pass for this commit until its verdict
const contains = git(['merge-base', '--is-ancestor', mech.base, mech.candidate]).code === 0;
check('candidate contains origin/main', contains, contains ? short(mech.base) : `merge main forward first: git fetch origin && git merge origin/main (R10, R12)`);
if (!contains) finish(1);
const files = git(['diff', '--name-only', mech.base, mech.candidate]).out.split('\n').filter(Boolean);
mech.files = files;

// ---------- worktrees ----------
// Worktrees sit under a short temp path: Windows refuses the repo's deepest files under a long one.
const wtRoot = path.join(os.tmpdir(), `sg-${process.pid.toString(36)}${Date.now().toString(36).slice(-4)}`);
const wt = { base: path.join(wtRoot, 'base'), cand: path.join(wtRoot, 'cand') };
mech.worktrees = wt;
const cleanup = () => {
  for (const k of kids) try { k.kill(); } catch {}
  if (flag('keep')) return;
  for (const k of ['base', 'cand']) git(['worktree', 'remove', '--force', wt[k]]);
  git(['worktree', 'prune']);
  try { fs.rmSync(wtRoot, { recursive: true, force: true, maxRetries: 5 }); } catch {}
};
for (const [k, sha] of [['base', mech.base], ['cand', mech.candidate]]) {
  const r = git(['worktree', 'add', '--detach', wt[k], sha]);
  if (r.code || !fs.existsSync(path.join(wt[k], 'scripts/serve-ux.cjs'))) { check(`worktree ${k}`, false, r.err.split('\n').filter((l) => /error|fatal/.test(l)).slice(0, 2).join(' | ')); cleanup(); finish(1); }
}
process.on('exit', cleanup);

// ---------- what the change reaches, from its files alone (settled before anything that depends on the class) ----------
// Shared files come from the base checkout: each atlas screen's page and what that page loads. A file pages of two or more
// features load is shared like the bundle, whatever the first frames show.
const baseScreens = screensOf(JSON.parse(fs.readFileSync(path.join(wt.base, 'atlas/atlas.json'), 'utf8')));
const assets = {};
for (const p of new Set(baseScreens.map((s) => pageOf(s.url)))) {
  const f = path.join(wt.base, p);
  assets[p] = fs.existsSync(f) ? pageAssets(fs.readFileSync(f, 'utf8'), p).filter((a) => fs.existsSync(path.join(wt.base, a))) : [];
}
const shared = sharedFiles(baseScreens, assets);
const touched = touchesSystem(files, shared);
mech.shared = { files: Object.keys(shared).length, touched: Object.fromEntries(touched.map((f) => [f, shared[f] || []])) };
const byFiles = effectiveClass({ declared, files, diffs: [], scope, shared });
mech.class = { declared, effective: byFiles.cls, why: byFiles.why };
if (byFiles.cls !== declared) console.log(`class: ${declared} → ${byFiles.cls} (${byFiles.why.join('; ')})`);

// ---------- 1. mechanical checks on the candidate ----------
// The atlas rebuild rewrites the candidate's atlas/atlas.json, so it runs before any page loads that file.
let r;
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

// A design PR never removes behaviour coverage: the runner, a feature's scenarios.json, or any of its outcome leaves.
{
  const dirs = fs.existsSync(path.join(wt.base, 'features')) ? fs.readdirSync(path.join(wt.base, 'features')) : [];
  const withLeaves = dirs.filter((f) => fs.existsSync(path.join(wt.base, 'features', f, 'scenarios.json')));
  const coverage = (dir) => ({
    runner: fs.existsSync(path.join(dir, 'scripts/run-scenarios.mjs')),
    specs: Object.fromEntries(withLeaves.map((f) => { try { return [f, JSON.parse(fs.readFileSync(path.join(dir, 'features', f, 'scenarios.json'), 'utf8'))]; } catch { return [f, null]; } })),
  });
  const lost = coverageLost(coverage(wt.base), coverage(wt.cand));
  check('behaviour coverage kept', !lost.length, lost.length ? `removes behaviour coverage (${lost.slice(0, 3).join('; ')}): do it in its own workflow PR` : `${withLeaves.length} feature(s) with leaves`);
}

// check-states runs on both sides for every class, beside everything below (it takes minutes). A state that already fails on
// main (e.g. a stress-test label the copy pass hasn't removed yet) is main's debt, reported but not blocking; a problem main
// doesn't have fails the gate. The committed report goes first, so a run that writes none can't pass on an old one.
const statesRun = Promise.all(['base', 'cand'].map((k) => {
  fs.rmSync(path.join(wt[k], 'review/state-check.json'), { force: true });
  return runAsync(process.execPath, ['scripts/check-states.mjs'], wt[k], path.join(out, `check-states-${k}.log`));
}));

// ---------- the screen diff: every screen, base vs candidate, at 390 and 360 in EN and ZH ----------
const freePort = () => new Promise((res) => { const s = createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => res(p)); }); });
async function serve(dir) {
  const port = await freePort();
  kids.push(spawn(process.execPath, [path.join(dir, 'scripts/serve-ux.cjs'), String(port)], { cwd: dir, stdio: 'ignore' }));
  const url = `http://127.0.0.1:${port}`; // serve-ux listens on IPv4 only; localhost may resolve to ::1 first
  for (let i = 0; i < 50; i++) { try { const res = await fetch(url + '/atlas/atlas.json'); if (res.ok) return url; } catch {} await new Promise((res) => setTimeout(res, 100)); }
  throw new Error('server did not start in ' + dir);
}
const url = { base: await serve(wt.base), cand: await serve(wt.cand) };

const WIDTHS = [390, 360], LANGS = ['en', 'zh'];
if (mech.quick) gaps.push('quick run: screens outside the scope were not compared (a builder self-check, not a gate)');
const shoot = (side, dir, extra) => new Promise((res) => {
  const args = [path.join(root, 'scripts/shoot-screens.mjs'), dir, '--base', url[side], '--commit', side === 'base' ? mech.base : mech.candidate,
    '--atlas', path.join(wt[side], 'atlas/atlas.json'), ...extra];
  const p = spawn(process.execPath, args, { cwd: root, stdio: ['ignore', 'ignore', 'inherit'], env });
  kids.push(p);
  p.on('exit', () => { try { res(JSON.parse(fs.readFileSync(path.join(dir, 'shots.json'), 'utf8')).runs.map((x) => ({ ...x, png: path.join(dir, x.file) }))); } catch { res(null); } });
});
// One shoot-screens per width: each width gets its own browser context either way, so this changes no pixel and halves the wait.
const shootAll = (side, dir, extra) => Promise.all(WIDTHS.map((w) => shoot(side, path.join(dir, `w${w}`), [...extra, '--widths', String(w), '--langs', LANGS.join(',')])))
  .then((parts) => (parts.includes(null) ? null : parts.flat()));
console.log(`\nshooting every screen on base and candidate at ${WIDTHS.join('/')} × ${LANGS.join('/')} …`);
const scopeArgs = mech.quick ? ['--feature', scope.join(',')] : [];
const capture = Promise.all([shootAll('base', path.join(out, 'shots/base'), scopeArgs), shootAll('cand', path.join(out, 'shots/cand'), scopeArgs)]);

// The tests run while the screens are shot (each in its own process; this loop just waits).
r = run('npm', ['test'], wt.cand);
const counts = (r.all.join('\n').match(/ℹ (pass|fail|skipped) \d+/g) || []).join(', ');
check('npm test', r.code === 0, counts || r.tail);

r = run('npm', ['run', 'check'], wt.cand);
check('npm run check', r.code === 0, r.all.find((l) => /atlas:/.test(l)) || r.tail);

const [shotsBase, shotsCand] = await capture;
if (!shotsBase || !shotsCand) { check('every screen shot on both sides', false, 'shoot-screens wrote no shots.json (its errors are above)'); finish(1); }

const { chromium } = createRequire(PW_HOME + '/package.json')(pwPath);
const browser = await chromium.launch();
const page = await browser.newPage();
// Exact: a pixel counts when any of its channels differs. An image that doesn't decode counts as all different.
async function pctDiff(a, b) {
  const x = fs.readFileSync(a), y = fs.readFileSync(b);
  if (x.equals(y)) return 0;
  return page.evaluate(async ([p, q]) => {
    const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = 'data:image/png;base64,' + s; });
    const [i, j] = await Promise.all([load(p), load(q)]);
    if (!i || !j) return 100;
    const w = Math.max(i.width, j.width), h = Math.max(i.height, j.height);
    const px = (n) => { const k = document.createElement('canvas'); k.width = w; k.height = h; const g = k.getContext('2d'); g.drawImage(n, 0, 0); return g.getImageData(0, 0, w, h).data; };
    const d1 = px(i), d2 = px(j); let n = 0;
    for (let o = 0; o < d1.length; o += 4) if (d1[o] !== d2[o] || d1[o + 1] !== d2[o + 1] || d1[o + 2] !== d2[o + 2] || d1[o + 3] !== d2[o + 3]) n++;
    return (n / (w * h)) * 100;
  }, [x.toString('base64'), y.toString('base64')]);
}
const key = (x) => `${x.screen} ${x.lang}-${x.width}`;
const baseAt = new Map(shotsBase.map((x) => [key(x), x])), candAt = new Map(shotsCand.map((x) => [key(x), x]));
const pct = {};
for (const c of shotsCand) { const b = baseAt.get(key(c)); if (c.ok && b?.ok) pct[key(c)] = await pctDiff(b.png, c.png); }
const screens = classifyScreens(shotsBase, shotsCand, (id, x) => pct[key(x)] ?? 0);
mech.screens = screens;
console.log(`screens: ${screens.same.length} same, ${screens.diff.length} changed, ${screens.new.length} new, ${screens.gone.length} gone, ${screens.broken.length} broken${screens.bothBroken.length ? `, ${screens.bothBroken.length} with a run broken on both` : ''}`);
for (const d of screens.diff) console.log(`  DIFF ${String(d.pct).padStart(7)}%  ${d.id}  ${d.runs.join(' ')}`);

check('no screen broken by the change', !screens.broken.length, screens.broken.map((s) => `${s.id} ${s.error}`).slice(0, 3).join(' | '));
if (screens.bothBroken.length) gaps.push(`${screens.bothBroken.length} screen(s) have a run that renders on neither base nor candidate: ${screens.bothBroken.map((s) => `${s.id} (${s.error})`).slice(0, 5).join(', ')}`);

// A changed screen is shot once more on base, at a run that differed: if base doesn't render the same way twice, its diff
// may be noise. It stays changed (the judge looks), and the judge is told.
mech.flaky = [];
const again = {};
for (const d of screens.diff) { const t = d.runs.find((x) => pct[`${d.id} ${x}`] > 0); if (t) (again[t] ||= []).push(d.id); }
const reshot = await Promise.all(Object.entries(again).map(([t, ids]) => { const [lang, w] = t.split('-'); return shoot('base', path.join(out, 'shots/again', t), ['--screens', ids.join(','), '--widths', w, '--langs', lang]); }));
for (const x of reshot.flat()) if (x?.ok && (await pctDiff(baseAt.get(key(x)).png, x.png)) > 0) mech.flaky.push(x.screen);
if (reshot.includes(null)) gaps.push('the second base shot failed for some changed screens: their diff is not double-checked');
if (mech.flaky.length) gaps.push(`${mech.flaky.length} changed screen(s) render differently twice on base, so their diff may be noise: ${mech.flaky.slice(0, 5).join(', ')}`);

// ---------- the pairs the judge decides on: every changed, new or removed screen at each run, from the shots above ----------
const moved = [...screens.diff, ...screens.new, ...screens.gone];
const zhIgnored = new Set(), zhLost = new Set();
const round4 = (p) => (p > 0 ? Math.max(0.0001, Math.round(p * 1e4) / 1e4) : 0);
for (const s of moved) for (const width of WIDTHS) for (const lang of LANGS) {
  const k = `${s.id} ${lang}-${width}`, b = baseAt.get(k), c = candAt.get(k);
  const noZh = (x) => lang === 'zh' && x?.ok && x.zh === 'ignored';
  const sides = [b, c].filter((x) => x?.ok);
  if (!sides.length) continue;
  // An English page shot twice: nothing Chinese to judge, unless this run shows a difference its English pair doesn't.
  if (sides.every(noZh) && !(pct[k] > 0 && !(pct[`${s.id} en-${width}`] > 0))) { zhIgnored.add(s.id); continue; }
  if (noZh(c) && b?.ok && !noZh(b)) zhLost.add(s.id);
  const kind = b?.ok && c?.ok ? 'changed' : c?.ok ? 'new' : 'gone';
  const file = path.join(out, 'pairs', s.id, `${lang}-${width}.png`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const side = (title, x) => `<div><div style="height:28px;line-height:28px">${title} · ${lang} ${width}${noZh(x) ? ' · NO CHINESE' : ''}</div>${x?.ok
    ? `<img src="data:image/png;base64,${fs.readFileSync(x.png).toString('base64')}" style="display:block;width:${width}px;height:844px">`
    : `<div style="width:${width}px;height:844px;background:#fff;display:grid;place-items:center">not on this side</div>`}</div>`;
  await page.setViewportSize({ width: width * 2 + 48, height: 900 });
  await page.setContent(`<body style="margin:0;background:#ddd;font:600 13px system-ui;display:flex;gap:16px;padding:8px 16px">${side('BASE ' + short(mech.base), b)}${side('CANDIDATE ' + short(mech.candidate), c)}</body>`);
  await page.screenshot({ path: file, fullPage: true });
  mech.pairs.push({ screen: s.id, feature: s.feature, lang, width, kind, pct: kind === 'changed' ? round4(pct[k] ?? 0) : null, file: path.relative(out, file).replace(/\\/g, '/') });
}
await browser.close();
if (zhIgnored.size) gaps.push(`no Chinese rendering (?lang=zh is ignored) on ${zhIgnored.size} moved screen(s): ${[...zhIgnored].slice(0, 6).join(', ')}${zhIgnored.size > 6 ? ' …' : ''}. ZH fit is unverified there.`);
if (zhLost.size) gaps.push(`${zhLost.size} screen(s) rendered Chinese on base and not on the candidate: ${[...zhLost].slice(0, 6).join(', ')} (their zh pairs say so)`);

// ---------- the class, now that the screens are known; the checks that follow from it ----------
const ec = effectiveClass({ declared, files, diffs: moved, scope, shared });
mech.class = { declared, effective: ec.cls, why: ec.why };
if (ec.cls !== byFiles.cls) console.log(`class: ${declared} → ${ec.cls} (${ec.why.join('; ')})`);
if (mode === 'refactor') check('refactor: every screen identical', !moved.length, moved.map((s) => s.id).slice(0, 5).join(', '));
const tools = touchesTools(files);
if (tools.length && moved.length) check('workflow changes in their own PR', false, `this change moves ${moved.length} screen(s) and also edits the workflow or the gate's tools (${tools.slice(0, 3).join(', ')}): split it`);
// The shared-component queue: one shared change at a time, oldest first. A shared candidate waits while an older open,
// non-draft PR also touches the shared system (the same shared set); once that merges, this one merges main forward and is
// gated against it.
if (ec.cls === 'shared') {
  const q = queueAhead();
  check('shared-component queue: first in line', q.ok, q.detail);
  gaps.push('shared-component change: every changed screen on every feature is judged (split the judges by feature if needed)');
}
function queueAhead() {
  const branch = ref.replace(/^origin\//, '');
  const res = spawnSync('gh', ['pr', 'list', '--state', 'open', '--limit', '100', '--json', 'number,headRefName,createdAt,isDraft,files'], { cwd: root, encoding: 'utf8', maxBuffer: 64 << 20 });
  if (res.status) return { ok: false, detail: `cannot read the queue (gh pr list failed): ${(res.stderr || '').trim().split('\n')[0]}` };
  const prs = JSON.parse(res.stdout);
  const mine = prs.find((p) => p.headRefName === branch);
  if (!mine) return { ok: false, detail: `no open PR for ${branch}: open one, the queue orders PRs` };
  const ahead = prs.filter((p) => p.number !== mine.number && !p.isDraft && p.createdAt < mine.createdAt && touchesSystem((p.files || []).map((f) => f.path), shared).length);
  return ahead.length ? { ok: false, detail: `waiting behind ${ahead.map((p) => '#' + p.number).join(', ')}: merge or close those first, then merge main forward and gate again` } : { ok: true, detail: `#${mine.number}` };
}

// ---------- legibility on the changed screens ----------
const changed = [...screens.diff, ...screens.new].map((s) => s.id);
if (changed.length) {
  if (fs.existsSync(path.join(wt.cand, 'scripts/check-legibility.mjs'))) {
    // the README's own line, not a sentence that mentions it ("change the line above to `Legibility gate: strict`")
    const strict = /^Legibility gate: strict\s*$/m.test(fs.readFileSync(path.join(wt.cand, 'docs/design-workflow/README.md'), 'utf8'));
    r = run(process.execPath, ['scripts/check-legibility.mjs', '--base', url.cand, '--changed', changed.join(','), ...(strict ? ['--strict'] : ['--compare', url.base])], wt.cand);
    check(`farm legibility (${strict ? 'strict' : 'no worse than base'}) on changed screens`, r.code === 0, r.tail);
  } else check('farm legibility on changed screens', false, 'scripts/check-legibility.mjs is not on this candidate (it lands with #101): the gate fails closed');
}

// ---------- scenario leaves: the scope's features, every feature whose screens changed, every feature a touched shared file reaches ----------
const runner = fs.existsSync(path.join(wt.cand, 'scripts/run-scenarios.mjs'));
const noLeaves = [];
for (const f of new Set([...scope, ...[...screens.diff, ...screens.new].map((s) => s.feature), ...touched.flatMap((t) => shared[t] || [])])) {
  if (!fs.existsSync(path.join(wt.cand, 'features', f, 'scenarios.json'))) { noLeaves.push(f); continue; }
  if (!runner) { check(`scenarios ${f}`, false, 'scripts/run-scenarios.mjs is not on this candidate'); continue; }
  r = run(process.execPath, ['scripts/run-scenarios.mjs', f, '--base', url.cand], wt.cand);
  check(`scenarios ${f}`, r.code === 0, r.tail);
}
if (noLeaves.length && CLASSES.indexOf(ec.cls) >= 2) gaps.push(`${noLeaves.length} affected feature(s) have no executable leaves (features/<id>/scenarios.json): ${noLeaves.slice(0, 6).join(', ')}${noLeaves.length > 6 ? ' …' : ''}. Behaviour there is covered by the walk only.`);

// ---------- check-states, both sides (started at the top) ----------
{
  const [, rc] = await statesRun;
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
    let added = Object.keys(pc).filter((k) => pc[k] > ((pb || {})[k] || 0));
    // A new problem must reproduce: one rerun on the candidate drops blips (a resource that failed to load once).
    if (added.length) {
      await runAsync(process.execPath, ['scripts/check-states.mjs'], wt.cand);
      const again = problems(wt.cand) || {};
      const blips = added.filter((k) => !(again[k] > ((pb || {})[k] || 0)));
      if (blips.length) gaps.push(`check-states: ${blips.length} problem(s) seen once and not on a rerun, so not counted: ${blips.slice(0, 2).join(' | ')}`);
      added = added.filter((k) => !blips.includes(k));
    }
    const fixed = Object.keys(pb || {}).filter((k) => !pc[k]);
    const debt = Object.keys(pc).length - added.length;
    mech.states = { added, fixed: fixed.length, debt };
    check('check-states (no new problem)', added.length === 0, added.length ? `${added.length} new: ${added.slice(0, 3).join(' | ')}` : `${debt} problem(s) already on main${fixed.length ? `, ${fixed.length} fixed` : ''}`);
    if (debt) gaps.push(`check-states: ${debt} problem(s) already on main are not this change's (review/state-check.json)`);
    if (!pb) gaps.push('check-states wrote no report on base: every problem on the candidate counts as new');
  }
}

finish(0);
