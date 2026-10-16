// The mechanical gate on the exact merge candidate: docs/design-workflow/briefs/gate.md §1, plus the screen diff and the
// before/after pairs the judge decides on (§3-4). The work is scripts/evaluate.mjs (gate v2, docs/design-workflow/gate-v2.md):
// evaluate(base, candidate, mode) → pass | fail | blocked. This file parses arguments, holds the machine's one-gate lock, writes
// mechanical.json and checks the judge's verdict.
// Usage: node scripts/gate.mjs --candidate <ref> --scope <feature,...> [--class copy|presentation|behaviour|shared]
//                              [--mode normal|refactor] [--out <dir>] [--quick] [--all] [--keep] [--base <ref>]
//        node scripts/gate.mjs --verdict <out> [--base <ref>]
//   --candidate  the branch (or commit) to merge; it must already contain the base (merge main forward first)
//   --scope      the features the change means to touch; a changed screen elsewhere makes it a shared-component change
//   --quick      compare only the scope's screens (a builder's self-check; the gate itself never runs quick)
//   --all        every screen in full, whatever the reach analyser says
//   --base       the base to gate against (default origin/main). Only for testing the gate itself: a run against another base posts
//                no status and writes no pass record, so it can never merge.
// One gate runs at a time on a machine (a lock in the git common dir). Evidence is kept by identity in the git common dir
// (sentri-gate/evidence/): a rerun, or a later gate on the same main, reuses every result whose identity didn't change.
// Run it from a checkout of the base (origin/main), never from the candidate: a candidate does not grade itself with its own gate.
// Writes <out>/mechanical.json and, for every changed, new or removed screen, <out>/pairs/<screen>/<lang>-<width>.png
// (base | candidate) at 390 and 360 in EN and ZH. The design system's variant pages are screens here too (ds:<Name>/<variant>).
// Exit 0 when every mechanical check passes, 1 when one fails, 3 when the gate is blocked (it could not establish the evidence).
// The judge (gate.md) then writes <out>/verdict.json, and `node scripts/gate.mjs --verdict <out>` checks it against mechanical.json,
// the PR head and origin/main. When the head or main has moved since, --verdict gates the new head against the new main (reusing
// every result whose identity is unchanged) and carries every judgement whose pair kept its two images; only the pairs whose
// images changed go back to a judge.
import { spawnSync } from 'node:child_process';
import { pwPath } from './playwright-path.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLASSES, checkVerdict, calibrationProblems, lockState, passesWithoutJudge, carryJudgements } from './loop-rules.mjs';
import { postStatus as post } from './github.mjs';
import { evaluate } from './evaluate.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null; };
const flag = (k) => argv.includes('--' + k);
const short = (s) => String(s || '?').slice(0, 7);
const VERDICT_FILE = /^verdict(-[\w.-]+)?\.json$/;
// The gate's own files live in the git common dir, so every worktree on this machine sees them: pass records, the lock, evidence.
const gateDir = () => path.join(path.resolve(root, git(['rev-parse', '--git-common-dir']).out.trim()), 'sentri-gate');
function passRecord(sha) { return path.join(gateDir(), `${sha}.json`); }
// A run against a test base (--base) never reaches GitHub or the merge guard.
const testBase = !!opt('base');
const mainRef = opt('base') || 'origin/main';
const postStatus = (sha, state, description) => (testBase ? { ok: true } : post(root, sha, state, description));
function git(args, cwd = root) { const r = spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 << 20 }); return { code: r.status, out: r.stdout || '', err: r.stderr || '' }; }
const sha = (r) => (r ? git(['rev-parse', '--verify', '--quiet', `${r}^{commit}`]).out.trim() : '');

// ---------- one gate at a time ----------
// Two gates on one machine starve each other's browsers into timeouts (#164), so every gate run, a builder's --quick included, and a
// --verdict that has to gate again, holds one lock beside the pass records for its whole run. A second gate waits; a lock whose
// process is gone is stale and is taken over. The lock goes on every exit: finish, a signal, a crash (the exit handler below).
const lockFile = path.join(gateDir(), 'gate.lock');
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };
let lockedRef = null;
const lockAs = (s) => JSON.stringify({ pid: process.pid, sha: s, ref: lockedRef, at: new Date().toISOString() });
function releaseLock() { try { if (JSON.parse(fs.readFileSync(lockFile, 'utf8')).pid === process.pid) fs.rmSync(lockFile, { force: true }); } catch {} }
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) process.on(sig, () => { console.log(`\n${sig}: the gate stops`); process.exit(130); });
async function acquireLock(ref) {
  lockedRef = ref;
  fs.mkdirSync(path.dirname(lockFile), { recursive: true });
  const t0 = Date.now(), tmp = `${lockFile}.${process.pid}`;
  let said = '';
  for (;;) {
    // Created whole or not at all: a hard link to a finished file, so a reader never sees half a lock.
    fs.writeFileSync(tmp, lockAs(sha(ref)));
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
  // The gate's own checks open browsers without waiting on it (scripts/playwright-path.mjs); every other browser run from this
  // repo registered in sentri-gate/runs/ is waited for, and a new one waits for the gate.
  process.env.SENTRI_GATE_PID = String(process.pid);
  const runs = path.join(gateDir(), 'runs');
  for (said = ''; ;) {
    const live = [];
    for (const f of (fs.existsSync(runs) ? fs.readdirSync(runs) : []).filter((x) => x.endsWith('.json'))) {
      let r = null;
      try { r = JSON.parse(fs.readFileSync(path.join(runs, f), 'utf8')); } catch {}
      if (r && lockState(r, alive) === 'held' && r.pid !== process.pid) live.push(r); else fs.rmSync(path.join(runs, f), { force: true });
    }
    if (!live.length) break;
    const line = `waiting for ${live.length} other browser run(s) from this repo: ${live.slice(0, 3).map((r) => `pid ${r.pid} ${r.what || ''}`.trim()).join('; ')} …`;
    if (line !== said) { console.log(line); said = line; }
    await new Promise((res) => setTimeout(res, 5000));
  }
  return Math.round((Date.now() - t0) / 1000);
}

// One mechanical gate run, under the lock: evaluate(), then mechanical.json. A change that moves no screen has nothing to judge, so
// its pass is the gate pass: it posts the sentri/gate status (which branch protection on main requires) and the pass record the
// merge guard reads. Never for a run against a test base.
async function runGate({ ref, base, out, mode, scope, declared, quick = false, all = false, keep = false }) {
  fs.mkdirSync(out, { recursive: true });
  // A rerun into the same folder starts clean: old shots, pairs and verdicts are about a mechanical run that no longer exists.
  for (const f of ['shots', 'pairs', 'leaves', 'scenarios', 'npm-test.log', 'mechanical.json', ...fs.readdirSync(out).filter((f) => VERDICT_FILE.test(f))]) fs.rmSync(path.join(out, f), { recursive: true, force: true });
  const waited = await acquireLock(ref);
  const env = { ...process.env, ...(pwPath ? { SENTRI_PLAYWRIGHT: pwPath } : {}) };
  git(['fetch', '-q', 'origin']);
  const candidate = sha(ref);
  if (candidate) { const tmp = `${lockFile}.${process.pid}`; fs.writeFileSync(tmp, lockAs(candidate)); try { fs.renameSync(tmp, lockFile); } catch { fs.rmSync(tmp, { force: true }); } } // the lock names what it gates
  if (candidate) fs.rmSync(passRecord(candidate), { force: true }); // a new gate run voids any earlier pass for this commit until its verdict
  let res;
  try {
    res = await evaluate({ root, out, base, candidate: ref, ref, mode, scope, declared, quick, all, keep, env, testBase });
  } catch (e) {
    console.error(e.stack || e);
    res = { outcome: 'blocked', mech: { outcome: 'blocked', pass: false, ref, mode, scope, class: { declared }, blocked: [`the gate crashed: ${String(e.message || e).split('\n')[0]}`], checks: [], gaps: [], pairs: [] } };
  }
  const mech = { ...res.mech, waited: waited + 's', testBase: testBase || undefined };
  if (!testBase && passesWithoutJudge(mech)) {
    mech.gatePass = true;
    const posted = postStatus(mech.candidate, 'success', `GATE PASS against ${short(mech.base)} · no screen moved`);
    if (!posted.ok) console.log(`  - the sentri/gate status was not posted (${posted.why}): gate again; until then GitHub refuses the merge`);
    const passFile = passRecord(mech.candidate);
    fs.mkdirSync(path.dirname(passFile), { recursive: true });
    fs.writeFileSync(passFile, JSON.stringify({ candidate: mech.candidate, base: mech.base, ref: mech.ref, out: path.resolve(out), noScreenMoved: true, at: new Date().toISOString() }, null, 2));
  }
  fs.writeFileSync(path.join(out, 'mechanical.json'), JSON.stringify(mech, null, 2));
  const t = mech.timings || {};
  console.log(`\ntimings (s): ${Object.entries(t).map(([k, v]) => `${k} ${v}`).join(', ')}`);
  if (mech.evidence) console.log(`evidence: ${JSON.stringify(mech.evidence.byKind || {})}; scheduler ${JSON.stringify(mech.evidence.scheduler?.busy || {})}`);
  const word = { pass: 'MECHANICAL PASS', fail: 'MECHANICAL FAIL', blocked: 'MECHANICAL BLOCKED' }[mech.outcome] || 'MECHANICAL FAIL';
  console.log(`${word} ${short(mech.candidate)} on base ${short(mech.base)} (${mech.class?.effective || declared}, ${mode}) — ${out}`);
  for (const b of mech.blocked || []) console.log('  blocked:', b);
  if (mech.gatePass) console.log(`GATE PASS (no screen moved, so no judge): gh pr merge <n> --squash --match-head-commit ${mech.candidate}`);
  return mech;
}

// ---------- --verdict <out>: check the judge's verdict against the mechanical result ----------
if (opt('verdict')) {
  let dir = opt('verdict');
  const readIn = (d, f) => { try { return JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')); } catch (e) { console.log(`GATE FAIL — ${path.join(d, f)}: ${e.message.split('\n')[0]}`); process.exit(1); } };
  let mech = readIn(dir, 'mechanical.json');
  // One judge writes verdict.json; a shared change too big for one judge is split by feature into verdict-<feature>.json.
  const verdictFiles = (d) => fs.readdirSync(d).filter((f) => VERDICT_FILE.test(f));
  if (!verdictFiles(dir).length) { console.error(`no verdict.json (or verdict-<feature>.json) in ${dir}`); process.exit(2); }
  let parts = verdictFiles(dir).map((f) => readIn(dir, f));
  // Fail closed: the PR head and main are read fresh, and a ref that doesn't resolve fails the gate, never passes it.
  const fetched = git(['fetch', '-q', 'origin']);
  if (fetched.code !== 0) { console.log(`GATE FAIL ${short(mech.candidate)}\n  - git fetch origin failed, so the PR head and ${mainRef} can't be checked: ${fetched.err.trim().split('\n')[0]}`); process.exit(1); }
  let head = sha(mech.ref), main = sha(mainRef);
  if (!head) { console.log(`GATE FAIL ${short(mech.candidate)}\n  - ${mech.ref || 'the candidate ref'} does not resolve, so the PR head can't be checked`); process.exit(1); }
  if (!main) { console.log(`GATE FAIL ${short(mech.candidate)}\n  - ${mainRef} does not resolve`); process.exit(1); }
  // A moved head or main never voids the work on its own (gate-v2.md §3): gate the new head against the new main, reusing every
  // result whose identity is unchanged, and carry every judgement whose pair still shows the same two images.
  if (head !== mech.candidate || main !== mech.base) {
    if (mech.quick) { console.log(`GATE FAIL ${short(mech.candidate)}\n  - the judged run was --quick: gate it in full`); process.exit(1); }
    console.log(`${mech.ref} is ${short(head)} and ${mainRef} is ${short(main)} since the gate ran on ${short(mech.candidate)} against ${short(mech.base)}: gating again, reusing every result and judgement whose identity is unchanged`);
    const again = path.join(dir, `regate-${short(head)}-${short(main)}`);
    const now = await runGate({ ref: mech.ref, base: mainRef, out: again, mode: mech.mode, scope: mech.scope, declared: mech.class?.declared || 'presentation' });
    if (now.outcome !== 'pass') { console.log(`GATE FAIL ${short(now.candidate)}\n  - the mechanical gate on the new head and main: ${now.outcome}${(now.blocked || [])[0] ? ` (${now.blocked[0]})` : ''}`); process.exit(1); }
    const { carried, need, goneNeed } = carryJudgements({ mech, parts }, now);
    if (carried) fs.writeFileSync(path.join(again, 'verdict-carried.json'), JSON.stringify(carried, null, 2));
    console.log(`carried ${carried?.pairs.length || 0} judgement(s) of ${now.pairs.length} pair(s) by identity${carried?.gone.length ? `, and ${carried.gone.length} removed screen reason(s)` : ''}`);
    if (need.length || goneNeed.length) {
      console.log(`GATE FAIL ${short(now.candidate)}: ${need.length} pair(s) show different images now${goneNeed.length ? ` and ${goneNeed.length} removed screen(s) need a reason` : ''}; a judge decides only those`);
      for (const n of need.slice(0, 20)) console.log('  - judge', n);
      for (const g of goneNeed) console.log('  - say why under "gone":', g);
      console.log(`  write them as ${path.join(again, 'verdict-new.json')} (every other pair is in verdict-carried.json), then: node scripts/gate.mjs --verdict ${again}`);
      process.exit(1);
    }
    dir = again; mech = now; parts = verdictFiles(dir).map((f) => readIn(dir, f));
    head = sha(mech.ref); main = sha(mainRef);
  }
  const cat = (k) => parts.flatMap((p) => p[k] || []);
  const verdict = { ...parts[0], pass: parts.every((p) => p.pass === true), pairs: cat('pairs'), walk: cat('walk'), defects: cat('defects'), gone: cat('gone'), rejected: cat('rejected'), contradicted: cat('contradicted') };
  for (const p of parts) if (p.candidate !== verdict.candidate || p.base !== verdict.base) verdict.candidate = 'mixed verdicts';
  const v = checkVerdict(verdict, mech);
  const calFile = path.join(root, 'docs/design-workflow/calibration/answers.json');
  if (fs.existsSync(calFile)) v.problems.push(...calibrationProblems(parts, JSON.parse(fs.readFileSync(calFile, 'utf8')).pairs));
  if (head !== mech.candidate) v.problems.push(`${mech.ref} moved to ${short(head)} while the gate ran on ${short(mech.candidate)}: run --verdict again`);
  if (main !== mech.base) v.problems.push(`${mainRef} moved to ${short(main)} while the gate ran against ${short(mech.base)}: run --verdict again`);
  const ok = v.problems.length === 0 && verdict.pass === true && mech.pass === true;
  console.log(`${ok ? 'GATE PASS' : 'GATE FAIL'} ${short(mech.candidate)}${testBase ? ` (against the test base ${mainRef}: not mergeable, no status posted)` : ''}`);
  for (const p of v.problems) console.log('  -', p);
  if (verdict.pass !== true) console.log('  - the judge failed it');
  if (verdict.pass !== true && mech.pass !== true) console.log('  - the mechanical gate failed');
  // The merge names the gated commit, so GitHub refuses it if the PR head has moved since.
  // The pass record the merge guard (scripts/merge-guard.mjs) looks for lives in the git common dir, so every worktree sees it;
  // a failed verdict removes any earlier pass for the same commit.
  const passFile = passRecord(mech.candidate);
  // The same result as a commit status on GitHub: branch protection on main can require "sentri/gate", which makes GitHub itself
  // refuse an ungated merge however it is attempted (the local merge guard is only a convenience).
  const posted = postStatus(mech.candidate, ok ? 'success' : 'failure', `${ok ? 'GATE PASS' : 'GATE FAIL'} against ${short(mech.base)}`);
  if (!posted.ok) console.log(`  - the sentri/gate status was not posted (${posted.why}): run --verdict again; until then GitHub ${ok ? 'refuses the merge' : 'may still show an earlier status'}`);
  if (!testBase) {
    if (!ok) fs.rmSync(passFile, { force: true });
    if (ok) {
      fs.mkdirSync(path.dirname(passFile), { recursive: true });
      fs.writeFileSync(passFile, JSON.stringify({ candidate: mech.candidate, base: mech.base, ref: mech.ref, out: path.resolve(dir), at: new Date().toISOString() }, null, 2));
      console.log(`merge: gh pr merge <n> --squash --match-head-commit ${mech.candidate}`);
    }
  }
  process.exit(ok ? 0 : 1);
}

// ---------- --carry: replaced by evidence reuse ----------
// Gate v2 (gate-v2.md §3): there is no carried pass. --verdict on a run whose head or main has moved gates again, reusing every result
// and judgement whose identity did not change.
if (argv.includes('--carry')) {
  console.log('--carry is gone: run --verdict <out> on the judged run; when the head or main has moved it gates again, reusing every result and judgement whose identity is unchanged.');
  process.exit(2);
}

const ref = opt('candidate');
const declared = opt('class') || 'presentation';
const mode = opt('mode') || 'normal';
const scope = (opt('scope') || '').split(',').map((s) => s.trim()).filter(Boolean);
if (!ref || !CLASSES.includes(declared) || !['normal', 'refactor'].includes(mode) || (mode === 'normal' && !scope.length)) {
  console.error('usage: node scripts/gate.mjs --candidate <ref> --scope <feature,...> [--class copy|presentation|behaviour|shared] [--mode normal|refactor] [--out <dir>] [--quick] [--all] [--keep] [--base <ref>]');
  console.error('       node scripts/gate.mjs --verdict <out dir> [--base <ref>]');
  process.exit(2);
}
const out = path.resolve(opt('out') || path.join(os.tmpdir(), `sentri-gate-${Date.now()}`));
const mech = await runGate({ ref, base: mainRef, out, mode, scope, declared, quick: flag('quick'), all: flag('all'), keep: flag('keep') });
process.exit(mech.outcome === 'pass' ? 0 : mech.outcome === 'blocked' ? 3 : 1);
