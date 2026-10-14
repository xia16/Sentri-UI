// The mechanical gate on the exact merge candidate: docs/design-workflow/briefs/gate.md §1, plus the screen diff and the
// before/after pairs the judge decides on (§3-4).
// Usage: node scripts/gate.mjs --candidate <ref> --scope <feature,...> [--class copy|presentation|behaviour|shared]
//                              [--mode normal|refactor] [--out <dir>] [--quick] [--all] [--keep]
//   --candidate  the branch (or commit) to merge; it must already contain origin/main (merge main forward first)
//   --scope      the features the change means to touch; a changed screen elsewhere makes it a shared-component change
//   --quick      compare only the scope's screens (a builder's self-check; the gate itself never runs quick)
//   --all        shoot every screen in full, whatever the change's reach (by default: its reach in full, a tripwire elsewhere)
// One gate runs at a time on a machine (a lock in the git common dir); base shots are cached per main commit.
// Run it from an up-to-date main checkout, never from the candidate: a candidate does not grade itself with its own gate.
// Writes <out>/mechanical.json and, for every changed, new or removed screen, <out>/pairs/<screen>/<lang>-<width>.png
// (base | candidate) at 390 and 360 in EN and ZH.
// Exit 0 when every mechanical check passes; the judge (gate.md) then writes <out>/verdict.json, and
// `node scripts/gate.mjs --verdict <out>` checks it against mechanical.json, the PR head and origin/main.
// When main has moved on since a GATE PASS by files that draw no pixel and the PR merged it in and nothing else,
// `node scripts/gate.mjs --carry <out>` records the pass for the new head without shooting a screen.
import { spawn, spawnSync } from 'node:child_process';
import { pwPath, playwright } from './playwright-path.mjs';
import { createServer } from 'node:net';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLASSES, screensOf, pageOf, pageAssets, sharedFiles, coverageLost, effectiveClass, classifyScreens, checkVerdict, touchesSystem, touchesTools, queueAhead as queueOf, budgetProblems, critiqueProblems, pageStyling, addedLines, calibrationProblems, lockState, shotsToTake, reachOf, reachLine, carryDecision } from './loop-rules.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');


const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null; };
const flag = (k) => argv.includes('--' + k);
const short = (s) => String(s || '?').slice(0, 7);
const VERDICT_FILE = /^verdict(-[\w.-]+)?\.json$/;
// The gate's own files live in the git common dir, so every worktree on this machine sees them: pass records, the lock, base shots.
const gateDir = () => path.join(path.resolve(root, git(['rev-parse', '--git-common-dir']).out.trim()), 'sentri-gate');
function passRecord(sha) { return path.join(gateDir(), `${sha}.json`); }
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
  const calFile = path.join(root, 'docs/design-workflow/calibration/answers.json');
  if (fs.existsSync(calFile)) v.problems.push(...calibrationProblems(parts, JSON.parse(fs.readFileSync(calFile, 'utf8')).pairs));
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
  // The same result as a commit status on GitHub: branch protection on main can require "sentri/gate", which makes GitHub itself
  // refuse an ungated merge however it is attempted (the local merge guard is only a convenience).
  spawnSync('gh', ['api', '--method', 'POST', `repos/{owner}/{repo}/statuses/${mech.candidate}`, '-f', `state=${ok ? 'success' : 'failure'}`,
    '-f', 'context=sentri/gate', '-f', `description=${ok ? 'GATE PASS' : 'GATE FAIL'} against ${short(mech.base)}`], { cwd: root, encoding: 'utf8' });
  if (!ok) fs.rmSync(passFile, { force: true });
  if (ok) {
    fs.mkdirSync(path.dirname(passFile), { recursive: true });
    fs.writeFileSync(passFile, JSON.stringify({ candidate: mech.candidate, base: mech.base, ref: mech.ref, out: path.resolve(dir), at: new Date().toISOString() }, null, 2));
    console.log(`merge: gh pr merge <n> --squash --match-head-commit ${mech.candidate}`);
  }
  process.exit(ok ? 0 : 1);
}

// ---------- --carry <out>: a GATE PASS carried over main moving on by files that draw no pixel ----------
// The gate passed C against main M1 (<out>/mechanical.json and its pass record). Main is now M2 and the PR head C2. The pass is
// recorded for C2 without shooting a screen only when C2 is C merged with M2 and nothing else (every path the candidate changed is
// as it was on C, no other path differs from M2, no commit of its own since C) and main's change M1..M2 reaches no screen (reachOf).
// Anything else: run the gate again. A stricter gate landing on main does not void a pass by itself (README, Approvals).
if (opt('carry')) {
  const dir = opt('carry');
  const refuse = (why) => { console.log('NOT CARRIED: run the gate again'); for (const w of [].concat(why)) console.log('  -', w); process.exit(1); };
  let mech;
  try { mech = JSON.parse(fs.readFileSync(path.join(dir, 'mechanical.json'), 'utf8')); } catch (e) { refuse(`${path.join(dir, 'mechanical.json')}: ${e.message.split('\n')[0]}`); }
  if (!mech.candidate || !mech.base || mech.quick) refuse('mechanical.json is not a full gate run on a candidate');
  const fetched = git(['fetch', '-q', 'origin']);
  if (fetched.code !== 0) refuse(`git fetch origin failed, so the PR head and origin/main can't be checked: ${fetched.err.trim().split('\n')[0]}`);
  const stale = git(['diff', '--name-only', 'origin/main', '--', 'scripts', 'docs/design-workflow', 'package.json']).out.trim().split(/\r?\n/).filter(Boolean);
  if (stale.length) refuse(`this checkout's ${stale.slice(0, 3).join(', ')} differ from origin/main: carry from a checkout of origin/main`);
  const sha = (r) => (r ? git(['rev-parse', '--verify', '--quiet', `${r}^{commit}`]).out.trim() : '');
  const C = mech.candidate, M1 = mech.base, head = sha(mech.ref), main = sha('origin/main');
  let pass = null;
  try { pass = JSON.parse(fs.readFileSync(passRecord(C), 'utf8')); } catch {}
  const changed = (a, b) => git(['diff', '--name-only', '--no-renames', a, b]).out.split(/\r?\n/).filter(Boolean);
  const blobs = (a, b, at) => Object.fromEntries(changed(a, b).map((f) => [f, git(['rev-parse', '--verify', '--quiet', `${at}:${f}`]).out.trim() || null]));
  // An atlas commit's screens and what their pages load, read straight from git.
  const pagesAt = (rev) => {
    const tree = new Set(git(['ls-tree', '-r', '--name-only', rev]).out.split(/\r?\n/).filter(Boolean));
    const show = (p) => (tree.has(p) ? git(['show', `${rev}:${p}`]).out : null);
    let screens = [];
    try { screens = screensOf(JSON.parse(show('atlas/atlas.json'))); } catch {}
    const assets = {};
    for (const p of new Set(screens.map((s) => pageOf(s.url)))) { const html = show(p); assets[p] = html == null ? [] : pageAssets(html, p).filter((a) => tree.has(a)); }
    return { screens, assets };
  };
  const ready = head && main && main !== M1;
  const mainFiles = ready ? changed(M1, main) : [];
  let reach = null;
  if (ready) {
    const [a, b] = [pagesAt(M1), pagesAt(main)];
    const screens = [...a.screens, ...b.screens], assets = { ...a.assets };
    for (const [p, l] of Object.entries(b.assets)) assets[p] = [...new Set([...(assets[p] || []), ...l])];
    reach = reachOf({ files: mainFiles, screens, assets, shared: sharedFiles(screens, assets), scope: [] });
  }
  const d = carryDecision({
    pass, mech, head, main, reach, mainFiles,
    containsC: ready && git(['merge-base', '--is-ancestor', C, head]).code === 0,
    containsMain: ready && git(['merge-base', '--is-ancestor', main, head]).code === 0,
    ownCommits: ready ? git(['rev-list', '--no-merges', head, `^${C}`, `^${main}`]).out.split(/\s+/).filter(Boolean) : [],
    cand: ready ? blobs(M1, C, C) : {},
    carried: ready ? blobs(main, head, head) : {},
  });
  if (!d.ok) refuse(d.why);
  const desc = `GATE PASS carried from ${short(C)}: main ${short(M1)}..${short(main)} draws no pixel`;
  spawnSync('gh', ['api', '--method', 'POST', `repos/{owner}/{repo}/statuses/${head}`, '-f', 'state=success', '-f', 'context=sentri/gate', '-f', `description=${desc}`], { cwd: root, encoding: 'utf8' });
  fs.mkdirSync(path.dirname(passRecord(head)), { recursive: true });
  fs.writeFileSync(passRecord(head), JSON.stringify({ candidate: head, base: main, ref: mech.ref, out: path.resolve(dir), at: new Date().toISOString(), carried: { from: C, base: M1, verdict: 'GATE PASS', mainFiles } }, null, 2));
  console.log(`GATE PASS ${short(head)} (carried)`);
  console.log(`  - the gated pass: ${short(C)} against main ${short(M1)}`);
  for (const w of d.why) console.log('  -', w);
  console.log(`merge: gh pr merge <n> --squash --match-head-commit ${head}`);
  process.exit(0);
}

const ref = opt('candidate');
const declared = opt('class') || 'presentation';
const mode = opt('mode') || 'normal';
const scope = (opt('scope') || '').split(',').map((s) => s.trim()).filter(Boolean);
if (!ref || !CLASSES.includes(declared) || !['normal', 'refactor'].includes(mode) || (mode === 'normal' && !scope.length)) {
  console.error('usage: node scripts/gate.mjs --candidate <ref> --scope <feature,...> [--class copy|presentation|behaviour|shared] [--mode normal|refactor] [--out <dir>] [--quick] [--all] [--keep]');
  console.error('       node scripts/gate.mjs --verdict <out dir>');
  console.error('       node scripts/gate.mjs --carry <out dir>');
  process.exit(2);
}
const out = path.resolve(opt('out') || path.join(os.tmpdir(), `sentri-gate-${Date.now()}`));
fs.mkdirSync(out, { recursive: true });
// A rerun into the same folder starts clean: old shots, pairs and verdicts are about a mechanical run that no longer exists.
for (const f of ['shots', 'pairs', 'mechanical.json', ...fs.readdirSync(out).filter((f) => VERDICT_FILE.test(f))]) fs.rmSync(path.join(out, f), { recursive: true, force: true });

// ---------- one gate at a time ----------
// Two gates on one machine starve each other's browsers into timeouts (#164), so every gate run, a builder's --quick included,
// holds one lock beside the pass records for its whole run. A second gate waits; a lock whose process is gone is stale and is
// taken over. The lock goes on every exit: finish, a signal, a crash (the exit handler below).
const lockFile = path.join(gateDir(), 'gate.lock');
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };
const lockAs = (sha) => JSON.stringify({ pid: process.pid, sha, ref, at: new Date().toISOString() });
function releaseLock() { try { if (JSON.parse(fs.readFileSync(lockFile, 'utf8')).pid === process.pid) fs.rmSync(lockFile, { force: true }); } catch {} }
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) process.on(sig, () => { console.log(`\n${sig}: the gate stops`); process.exit(130); });
const waited = await (async () => {
  fs.mkdirSync(path.dirname(lockFile), { recursive: true });
  const t0 = Date.now(), tmp = `${lockFile}.${process.pid}`;
  let said = '';
  for (;;) {
    // Created whole or not at all: a hard link to a finished file, so a reader never sees half a lock.
    fs.writeFileSync(tmp, lockAs(git(['rev-parse', '--verify', '--quiet', ref + '^{commit}']).out.trim()));
    try { fs.linkSync(tmp, lockFile); fs.rmSync(tmp, { force: true }); break; } catch (e) { fs.rmSync(tmp, { force: true }); if (e.code !== 'EEXIST') throw e; }
    let raw, lock = null;
    try { raw = fs.readFileSync(lockFile, 'utf8'); } catch { continue; } // released between the two calls
    try { lock = JSON.parse(raw); } catch {}
    if (!lock || lock.pid === process.pid || lockState(lock, alive) === 'stale') {
      // Only the stale lock read above is removed, never one another gate has taken since.
      try { if (fs.readFileSync(lockFile, 'utf8') === raw) { fs.rmSync(lockFile); console.log(`taking over a stale gate lock: pid ${lock?.pid ?? '?'} (the gate on ${short(lock?.sha)}) is gone`); } } catch {}
      continue;
    }
    const line = `waiting for the gate on ${short(lock.sha)} (pid ${lock.pid}) …`;
    if (line !== said) { console.log(line); said = line; }
    await new Promise((res) => setTimeout(res, 5000));
  }
  process.on('exit', releaseLock);
  return Math.round((Date.now() - t0) / 1000);
})();
const started = Date.now();
const env = { ...process.env, ...(pwPath ? { SENTRI_PLAYWRIGHT: pwPath } : {}) };
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

const mech = { pass: false, candidate: '', base: '', ref, mode, scope, quick: flag('quick'), class: { declared }, checks, gaps, screens: null, pairs: [], waited: waited + 's' };
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
// The gate judges with main's own rules: a checkout whose tools or briefs differ from origin/main (a stale gate, or local edits)
// fails closed. A builder's --quick self-check is exempt.
if (!argv.includes('--quick')) {
  const stale = git(['diff', '--name-only', 'origin/main', '--', 'scripts', 'docs/design-workflow', 'package.json']).out.trim().split(/\r?\n/).filter(Boolean);
  if (stale.length) { check("the gate runs main's own tools", false, `this checkout's ${stale.slice(0, 3).join(', ')} differ from origin/main: run the gate from a checkout of origin/main (git checkout --detach origin/main)`); finish(1); }
}
mech.candidate = git(['rev-parse', '--verify', ref + '^{commit}']).out.trim();
if (!mech.candidate) { check('candidate exists', false, `no commit for ${ref}`); finish(1); }
{ const tmp = `${lockFile}.${process.pid}`; fs.writeFileSync(tmp, lockAs(mech.candidate)); try { fs.renameSync(tmp, lockFile); } catch { fs.rmSync(tmp, { force: true }); } } // the lock names what it gates
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
// What the change can reach, from its files (both sides of a rename) and both sides' pages: only those screens are shot in full
// (scripts/loop-rules.mjs reachOf; unsure is every screen). Every other screen is still shot once, at 390 in English, as a tripwire.
const candScreens = screensOf(JSON.parse(fs.readFileSync(path.join(wt.cand, 'atlas/atlas.json'), 'utf8')));
const reach = (() => {
  if (mech.quick) return { all: false, features: [...scope].sort(), why: ['quick: the scope only'] };
  if (flag('all')) return { all: true, features: [], why: ['--all'] };
  const both = { ...assets };
  for (const p of new Set(candScreens.map((s) => pageOf(s.url)))) {
    const f = path.join(wt.cand, p);
    const mine = fs.existsSync(f) ? pageAssets(fs.readFileSync(f, 'utf8'), p).filter((a) => fs.existsSync(path.join(wt.cand, a))) : [];
    both[p] = [...new Set([...(both[p] || []), ...mine])];
  }
  const screens = [...baseScreens, ...candScreens];
  const changed = git(['diff', '--name-only', '--no-renames', mech.base, mech.candidate]).out.split(/\r?\n/).filter(Boolean);
  return reachOf({ files: changed, screens, assets: both, shared: sharedFiles(screens, both), scope });
})();
const inReach = (s) => reach.all || reach.features.includes(s.feature);
mech.reach = { ...reach, screens: new Set(candScreens.filter(inReach).map((s) => s.id)).size };
console.log(reachLine(reach, mech.reach.screens));
const byFiles = effectiveClass({ declared, files, diffs: [], scope, shared });
mech.class = { declared, effective: byFiles.cls, why: byFiles.why };
if (byFiles.cls !== declared) console.log(`class: ${declared} → ${byFiles.cls} (${byFiles.why.join('; ')})`);

// ---------- 1. mechanical checks on the candidate ----------
// The atlas rebuild rewrites the candidate's atlas/atlas.json, so it runs before any page loads that file.
let r;
{
  const strip = (s) => { const j = JSON.parse(s); delete j.generated; delete j.commit; return JSON.stringify(j); };
  const fresh = (dir) => {
    const file = path.join(dir, 'atlas/atlas.json'), before = fs.readFileSync(file, 'utf8');
    const res = run(process.execPath, ['scripts/build-atlas.mjs'], dir);
    const same = res.code === 0 && strip(before) === strip(fs.readFileSync(file, 'utf8'));
    git(['checkout', '--', 'atlas/atlas.json'], dir);
    return { same, res };
  };
  const c = fresh(wt.cand); r = c.res;
  // A stale atlas on main is main's debt: it blocks only a change that touches what the atlas is built from.
  const sources = files.filter((f) => /^(features|sections|references|review|atlas)\/|^ux\/design-system\/components\/(_proposed\.json$|[^/]+\/(gate\.json|variants\.json|variants\/))|^scripts\/build-atlas\.mjs$/.test(f));
  const debt = !c.same && !sources.length && !fresh(wt.base).same;
  if (debt) gaps.push('atlas/atlas.json is stale on main itself (npm run atlas changes it); this change touches none of its sources');
  check('atlas.json is regenerated', c.same || debt, c.same ? '' : debt ? 'stale on main too, so main owns it' : r.code ? r.tail : 'npm run atlas changes atlas/atlas.json beyond its stamps: rebuild and commit it');
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

// check-states runs on both sides for every class, beside the shots and the checks below (it takes minutes), and is done before
// the scenario leaves start. A state that already fails on
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
// One shoot-screens per group of runs (a width and its languages, from shotsToTake): each width gets its own browser context
// either way, so this changes no pixel and halves the wait. The screen ids go in a file: a list of hundreds is too long for a command line.
const shootGroups = (side, dir, groups) => Promise.all(groups.map((g) => {
  const sub = path.join(dir, `${g.width}-${g.langs.join('-')}`), list = path.join(dir, `${g.width}-${g.langs.join('-')}.json`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(list, JSON.stringify(g.screens));
  return shoot(side, sub, ['--screens-file', list, '--widths', String(g.width), '--langs', g.langs.join(',')]);
})).then((parts) => (parts.includes(null) ? null : parts.flat()));
// The runs each side needs: { screen, width, langs }. A screen in the reach is shot in full; every other screen once at 390 in
// English, the tripwire (a --quick self-check skips it).
const TRIP = { width: 390, lang: 'en' };
const needsOf = (list) => list.flatMap((s) => (inReach(s) ? WIDTHS.map((width) => ({ screen: s.id, width, langs: LANGS })) : mech.quick ? [] : [{ screen: s.id, width: TRIP.width, langs: [TRIP.lang] }]));

// ---------- base shots, once per main commit ----------
// Base is the same main commit gate after gate, so its shots are kept in <git common dir>/sentri-gate/base-shots/<base>/<key>/,
// where the key hashes everything else that decides a base pixel: the shooter and its font routing, the vendored fonts, the base
// side's harness and server, the Playwright version and browser build, the widths and languages. Only runs that rendered are kept;
// a missing or failed run is shot again and added. Caches for bases older than main's last 10 commits are removed.
const baseCache = (() => {
  const h = createHash('sha256');
  const add = (label, f) => h.update(`${label}\0`).update(fs.existsSync(f) ? fs.readFileSync(f) : 'missing').update('\0');
  add('shoot', path.join(root, 'scripts/shoot-screens.mjs'));
  add('fonts', path.join(root, 'scripts/font-route.mjs'));
  const vendor = path.join(root, 'vendor/fonts');
  for (const f of (fs.existsSync(vendor) ? fs.readdirSync(vendor, { recursive: true }) : []).map(String).sort()) if (fs.statSync(path.join(vendor, f)).isFile()) add(`vendor/${f}`, path.join(vendor, f));
  add('bare', path.join(wt.base, 'ux/system/atlas-bare.js'));
  add('serve', path.join(wt.base, 'scripts/serve-ux.cjs'));
  const pw = JSON.parse(fs.readFileSync(path.join(pwPath, 'package.json'), 'utf8')).version;
  const browser = (playwright().chromium.executablePath().match(/chromium[^\\/]*/) || ['?'])[0];
  h.update(`playwright ${pw} ${browser} ${process.platform} widths ${WIDTHS} langs ${LANGS}`);
  return path.join(gateDir(), 'base-shots', mech.base, h.digest('hex').slice(0, 16));
})();
{
  const dir = path.join(gateDir(), 'base-shots'), keep = new Set(git(['rev-list', '--first-parent', '-n', '10', mech.base]).out.split(/\s+/).filter(Boolean));
  for (const d of fs.existsSync(dir) ? fs.readdirSync(dir) : []) if (!keep.has(d)) fs.rmSync(path.join(dir, d), { recursive: true, force: true });
}
async function shootBase(needs) {
  let cached = [];
  try { cached = JSON.parse(fs.readFileSync(path.join(baseCache, 'shots.json'), 'utf8')).runs || []; } catch {}
  const plan = shotsToTake(needs, cached, (f) => fs.existsSync(path.join(baseCache, f)));
  const taken = plan.take.length ? await shootGroups('base', path.join(out, 'shots/base'), plan.take) : [];
  if (!taken) return null;
  const runs = new Map(cached.map((x) => [`${x.screen} ${x.lang}-${x.width}`, x]));
  for (const { png, ...x } of taken.filter((t) => t.ok)) {
    fs.mkdirSync(path.dirname(path.join(baseCache, x.file)), { recursive: true });
    fs.copyFileSync(png, path.join(baseCache, x.file));
    runs.set(`${x.screen} ${x.lang}-${x.width}`, x);
  }
  if (taken.some((t) => t.ok)) { const tmp = path.join(baseCache, `shots.json.${process.pid}`); fs.writeFileSync(tmp, JSON.stringify({ commit: mech.base, runs: [...runs.values()] })); fs.renameSync(tmp, path.join(baseCache, 'shots.json')); }
  mech.baseShots = { cache: path.relative(gateDir(), baseCache).replace(/\\/g, '/'), reused: plan.reuse.length, taken: taken.length };
  console.log(`base ${short(mech.base)}: ${plan.reuse.length} shot(s) from the cache, ${taken.length} taken`);
  return [...plan.reuse.map((x) => ({ ...x, png: path.join(baseCache, x.file) })), ...taken.map((x) => (x.ok ? { ...x, png: path.join(baseCache, x.file) } : x))];
}

const needs = { base: needsOf(baseScreens), cand: needsOf(candScreens) };
const runsOf = (n) => n.reduce((k, x) => k + x.langs.length, 0);
console.log(`\nshooting ${runsOf(needs.cand)} run(s) on the candidate and ${runsOf(needs.base)} on base (cached base runs reused) at ${WIDTHS.join('/')} × ${LANGS.join('/')} …`);
const shotsStarted = Date.now();
const capture = Promise.all([shootBase(needs.base), shootGroups('cand', path.join(out, 'shots/cand'), shotsToTake(needs.cand).take)]);

// The tests run while the screens are shot (each in its own process; this loop just waits).
r = run('npm', ['test'], wt.cand);
const counts = (r.all.join('\n').match(/ℹ (pass|fail|skipped) \d+/g) || []).join(', ');
check('npm test', r.code === 0, counts || r.tail);

r = run('npm', ['run', 'check'], wt.cand);
check('npm run check', r.code === 0, r.all.find((l) => /atlas:/.test(l)) || r.tail);

const [shotsBase, shotsCand] = await capture;
mech.timings = { shots: Math.round((Date.now() - shotsStarted) / 1000) + 's' };
if (!shotsBase || !shotsCand) { check('every screen shot on both sides', false, 'shoot-screens wrote no shots.json (its errors are above)'); finish(1); }

const { chromium } = playwright();
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
// A screen that renders differently twice on base can't be judged by pixels: its pairs still go to the judge, but it doesn't
// escalate the class or fail a refactor by itself.
const steady = moved.filter((s) => !mech.flaky.includes(s.id));
const ec = effectiveClass({ declared, files, diffs: steady, scope, shared });
mech.class = { declared, effective: ec.cls, why: ec.why };
// P2, every change has a known reach: a change declared for its own features that moves another feature's screen fails here
// instead of being quietly escalated to a shared change (rules ledger L3). A deliberate shared change declares --class shared.
if (declared !== 'shared' && mode !== 'refactor') {
  const out = (ec.outside || []).filter((d) => !mech.flaky?.includes(d.id));
  check('known reach: only SCOPE moved (P2)', !out.length, out.length ? `declared ${declared} for ${scope.join(', ')} but moves ${out.length} screen(s) of ${[...new Set(out.map((d) => d.feature))].join(', ')} (${out.slice(0, 3).map((d) => d.id).join(', ')}): give your part its own rule or token, or make it a declared shared change` : '');
}
// The tripwire: a screen outside the reach that moved means the reach was wrong for this change, and its other widths and Chinese
// were never shot. It fails whatever the class; a deliberately wide change gates again with --all.
if (!reach.all && !mech.quick) {
  const missed = moved.filter((s) => !inReach(s) && !mech.flaky.includes(s.id));
  check(`reach: nothing outside it moved (tripwire, ${TRIP.width} ${TRIP.lang})`, !missed.length, missed.length
    ? `${missed.length} screen(s) outside the reach moved (${missed.slice(0, 3).map((s) => s.id).join(', ')}): the change reaches further than its files say; gate again with --all`
    : `${candScreens.filter((s) => !inReach(s)).length} other screen(s) unchanged`);
}
if (ec.cls !== byFiles.cls) console.log(`class: ${declared} → ${ec.cls} (${ec.why.join('; ')})`);
if (mode === 'refactor') check('refactor: every screen identical', !steady.length, steady.length ? steady.map((s) => s.id).slice(0, 5).join(', ') : mech.flaky.length ? `${mech.flaky.length} unstable on base, not counted` : '');
const tools = touchesTools(files);
// Information before layout, and design-system components only (owner, 2026-10-11), for any change that moves a screen.
if (steady.length) {
  const feats = [...screens.diff, ...screens.new].map((s) => s.feature);
  const bp = budgetProblems(feats, (p) => { const f = path.join(wt.cand, p); return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null; });
  check('information budget before layout', !bp.length, bp.length ? bp.join('; ') + ' (P3: write it first, briefs/build.md §2)' : '');
  const cp = critiqueProblems(feats, (p) => { const f = path.join(wt.cand, p); return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null; });
  check('critique of the original before the change', !cp.length, cp.length ? cp.join('; ') + ' (P1, P4: keep, problems, parts and self-crit, briefs/build.md §1, §4)' : '');
  const ps = pageStyling(addedLines(git(['diff', '-U0', mech.base, mech.candidate, '--', 'ux']).out));
  mech.pageStyling = ps;
  const proposed = files.includes('ux/design-system/components/_proposed.json') && /^\+\s*[\[{"]/m.test(git(['diff', '-U0', mech.base, mech.candidate, '--', 'ux/design-system/components/_proposed.json']).out);
  check('no workaround beside a component proposal', !proposed, proposed ? 'this change proposes a component and changes screens: build the component in the design system in this change (P2, briefs/build.md §3), never a workaround' : '');
  check('design-system components only', !ps.length, ps.length ? `${ps.length} visual declaration(s) added outside ux/design-system (${ps.slice(0, 3).map((p) => p.file.split('/').pop() + ' ' + p.prop).join(', ')}): use a SentriUI component, or build the part in the design system (P2, briefs/build.md §3)` : '');
}
if (tools.length && steady.length) check('workflow changes in their own PR', false, `this change moves ${steady.length} screen(s) and also edits the workflow or the gate's tools (${tools.slice(0, 3).join(', ')}): split it`);
// The shared-component queue: one shared change at a time, oldest first. A shared candidate waits while an older open,
// non-draft PR that has passed the gate also touches the shared system (queueAhead in loop-rules.mjs); once that merges, this
// one merges main forward and is gated against it. An older PR that hasn't passed doesn't block.
if (ec.cls === 'shared') {
  const q = queueAhead();
  check('shared-component queue: first in line', q.ok, q.detail);
  gaps.push('shared-component change: every changed screen on every feature is judged (split the judges by feature if needed)');
}
function queueAhead() {
  const branch = ref.replace(/^origin\//, '');
  const prs = openPrs();
  if (prs.error) return { ok: false, detail: `cannot read the queue: ${prs.error}` };
  const mine = prs.find((p) => p.headRefName === branch);
  if (!mine) return { ok: false, detail: `no open PR for ${branch}: open one, the queue orders PRs` };
  const ahead = queueOf(prs, mine, shared, (sha) => !!sha && fs.existsSync(passRecord(sha)));
  return ahead.length ? { ok: false, detail: `waiting behind ${ahead.map((p) => '#' + p.number).join(', ')}: merge or close those first, then merge main forward and gate again` } : { ok: true, detail: `#${mine.number}` };
}

// The open PRs in the shape `gh pr list --json number,headRefName,headRefOid,createdAt,isDraft,files,statusCheckRollup` gives,
// read over REST: GraphQL (which gh pr list uses) is blocked in cloud sessions.
function openPrs() {
  // Pages by number: --paginate follows Link headers with numeric-ID paths, which the cloud proxy refuses.
  const page = (p, jq) => { const r = spawnSync('gh', ['api', p, '--jq', jq], { cwd: root, encoding: 'utf8', maxBuffer: 64 << 20 }); if (r.status) throw new Error(`gh api ${p} failed: ${(r.stderr || '').trim().split('\n')[0]}`); return r.stdout.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)); };
  const api = (p, jq) => { const all = []; for (let n = 1; n <= 30; n++) { const got = page(`${p}&page=${n}`, jq); all.push(...got); if (got.length < 100) break; } return all; };
  try {
    return api('repos/{owner}/{repo}/pulls?state=open&per_page=100', '.[] | {number, headRefName: .head.ref, headRefOid: .head.sha, createdAt: .created_at, isDraft: .draft}').map((p) => ({
      ...p,
      files: api(`repos/{owner}/{repo}/pulls/${p.number}/files?per_page=100`, '.[] | {path: .filename}'),
      statusCheckRollup: api(`repos/{owner}/{repo}/commits/${p.headRefOid}/statuses?per_page=100`, '.[] | {context, state: (.state | ascii_upcase)}'),
    }));
  } catch (e) { return { error: e.message }; }
}

// ---------- legibility on the changed screens ----------
// A screen base renders differently twice (mech.flaky) didn't move by this change: it isn't held to the floors here.
const changed = [...screens.diff.filter((s) => !mech.flaky.includes(s.id)), ...screens.new].map((s) => s.id);
if (changed.length) {
  if (fs.existsSync(path.join(wt.cand, 'scripts/check-legibility.mjs'))) {
    // the README's own line, not a sentence that mentions it ("change the line above to `Legibility gate: strict`")
    // A shared-component change is held to no worse than main (README, Legibility gate): pages' own debt is each feature's.
    const strict = declared !== 'shared' && /^Legibility gate: strict\s*$/m.test(fs.readFileSync(path.join(wt.cand, 'docs/design-workflow/README.md'), 'utf8'));
    r = run(process.execPath, ['scripts/check-legibility.mjs', '--base', url.cand, '--changed', changed.join(','), ...(strict ? ['--strict'] : ['--compare', url.base])], wt.cand);
    check(`farm legibility (${strict ? 'strict' : 'no worse than base'}) on changed screens`, r.code === 0, r.tail);
  } else check('farm legibility on changed screens', false, 'scripts/check-legibility.mjs is not on this candidate (it lands with #101): the gate fails closed');
  // P4: clearly wrong spacing (scripts/check-spacing.mjs). A defect main already has on that screen is main's debt, not this change's.
  if (fs.existsSync(path.join(wt.cand, 'scripts/check-spacing.mjs'))) {
    const outC = path.join(out, 'spacing-cand.json'), outB = path.join(out, 'spacing-base.json');
    run(process.execPath, ['scripts/check-spacing.mjs', '--base', url.cand, '--screens', changed.join(','), '--out', outC], wt.cand);
    run(process.execPath, [path.join(wt.cand, 'scripts/check-spacing.mjs'), '--base', url.base, '--screens', changed.join(','), '--out', outB], wt.cand);
    const read = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
    const C = read(outC), B = read(outB) || [];
    if (!C) check('clear spacing on changed screens (P4)', false, 'check-spacing wrote no result on the candidate');
    else {
      const key = (d) => d.check + ' ' + d.detail.replace(/\d+px/g, 'Npx');
      const was = new Set(B.flatMap((s) => s.defects.map((d) => s.screen + '|' + key(d))));
      const added = C.flatMap((s) => s.defects.filter((d) => !was.has(s.screen + '|' + key(d))).map((d) => `${s.screen}: ${d.check} — ${d.detail}`));
      const debt = C.reduce((n, s) => n + s.defects.length, 0) - added.length;
      check('clear spacing on changed screens (P4)', !added.length, added.length ? `${added.length} new: ${added.slice(0, 2).join(' | ')}` : debt ? `${debt} defect(s) already on main` : '');
      if (debt) gaps.push(`spacing: ${debt} defect(s) on changed screens are already on main (review/spacing.json)`);
    }
  }
}

// ---------- scenario leaves: the scope's features, every feature whose screens changed, every feature a touched shared file reaches ----------
// They run alone: a gate's own check-states (both sides) running beside them starved their page loads into timeouts (#164).
// The shots finished above; check-states is awaited here.
let t0 = Date.now();
const statesDone = await statesRun;
mech.timings.statesWait = Math.round((Date.now() - t0) / 1000) + 's';
t0 = Date.now();
const runner = fs.existsSync(path.join(wt.cand, 'scripts/run-scenarios.mjs'));
const noLeaves = [];
for (const f of new Set([...scope, ...[...screens.diff, ...screens.new].map((s) => s.feature), ...touched.flatMap((t) => shared[t] || [])])) {
  if (!fs.existsSync(path.join(wt.cand, 'features', f, 'scenarios.json'))) { noLeaves.push(f); continue; }
  if (!runner) { check(`scenarios ${f}`, false, 'scripts/run-scenarios.mjs is not on this candidate'); continue; }
  r = run(process.execPath, ['scripts/run-scenarios.mjs', f, '--base', url.cand], wt.cand);
  check(`scenarios ${f}`, r.code === 0, r.tail);
}
mech.timings.scenarios = Math.round((Date.now() - t0) / 1000) + 's';
if (noLeaves.length && CLASSES.indexOf(ec.cls) >= 2) gaps.push(`${noLeaves.length} affected feature(s) have no executable leaves (features/<id>/scenarios.json): ${noLeaves.slice(0, 6).join(', ')}${noLeaves.length > 6 ? ' …' : ''}. Behaviour there is covered by the walk only.`);

// ---------- check-states, both sides (started at the top) ----------
{
  const [, rc] = statesDone;
  const problems = (dir) => {
    const f = path.join(dir, 'review/state-check.json');
    if (!fs.existsSync(f)) return null;
    const n = {};
    // A resource that failed to load (net::ERR_*) is the machine or the network, not the design: reported, never counted.
    for (const s of JSON.parse(fs.readFileSync(f, 'utf8'))) for (const p of s.problems || []) { if (/net::ERR_/.test(String(p.detail))) { netErrors.add(`${s.component}/${s.variant}/${s.state}`); continue; } const k = `${s.component}/${s.variant}/${s.state}: (${p.check}) ${String(p.detail).replace(/\d+(\.\d+)?px/g, 'Npx')}`; n[k] = (n[k] || 0) + 1; }
    return n;
  };
  const netErrors = new Set();
  const pb = problems(wt.base), pc = problems(wt.cand);
  if (!pc) check('check-states', false, `no review/state-check.json written on the candidate (exit ${rc.code}): ${rc.tail}`);
  else {
    let added = Object.keys(pc).filter((k) => pc[k] > ((pb || {})[k] || 0));
    // A new problem must reproduce: one rerun on the candidate drops blips (a resource that failed to load once).
    if (added.length) {
      await runAsync(process.execPath, ['scripts/check-states.mjs'], wt.cand, path.join(out, 'check-states-cand-rerun.log'));
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
    if (netErrors.size) gaps.push(`check-states: ${netErrors.size} state(s) had a resource fail to load (net::ERR_*), a machine or network blip, not counted: ${[...netErrors].slice(0, 3).join(', ')}`);
  }
}

finish(0);
