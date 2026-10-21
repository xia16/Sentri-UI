// The mechanical gate on the exact merge candidate (docs/design-workflow/gate-machine.md), plus the screen diff and the before/after
// pairs the judge decides on (docs/design-workflow/briefs/gate.md §3-4). The work is scripts/evaluate.mjs (gate v2, docs/design-workflow/gate-v2.md):
// evaluate(base, candidate, mode) → pass | fail | blocked. This file parses arguments, holds the machine's one-gate lock, writes
// mechanical.json and checks the judge's verdict.
// Usage: node scripts/gate.mjs --candidate <ref> [--scope <feature,...>] [--mode normal|refactor] [--out <dir>] [--keep] [--base <ref>]
//        node scripts/gate.mjs --verdict <out> [--base <ref>]
//        node scripts/gate.mjs --audit [--out <dir>]
//   --candidate  the branch (or commit) to merge; it must already contain the base (merge main forward first)
//   --scope      the features the change means to touch: a declaration for the known-reach check only (a change that touches no
//                shared file and moves another feature's screen fails). It brings no screen or leaf into the reach.
//   The class (copy, presentation, behaviour, shared) is the gate's, from the change itself: there is no --class, and no --quick
//   (a full gate of a local change takes minutes; gate-simplify.md X3, X6).
//   --audit      not a gate: every screen of main drawn afresh at every run and compared with the stored shot of the same identity.
//                A difference is an identity that misses an input, or a screen that doesn't draw the same twice (gate-simplify.md
//                K12). Run it by hand, weekly; it posts nothing and passes nothing.
//   --base       the base to gate against (default origin/main). Only for testing the gate itself: a run against another base posts
//                no status, so it can never merge.
// One gate runs at a time on a machine (a lock in the git common dir, taken in turn; a --verdict re-gate goes first). Evidence is kept by identity in the git common dir
// (sentri-gate/evidence/): a rerun, or a later gate on the same main, reuses every result whose identity didn't change.
// It judges with the base's own tools, never the candidate's: a candidate does not grade itself with its own gate. Run from a
// checkout whose tools differ from the base (any branch, a stale main), it runs itself from a worktree of the base instead.
// Writes <out>/mechanical.json, <out>/results.md (the PR's Results block) and, for every changed, new or removed screen, <out>/pairs/<screen>/<lang>-<width>.png
// (base | candidate) at EN 390, EN 360 and ZH 360. The design system's variant pages are screens here too (ds:<Name>/<variant>).
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
import { checkVerdict, calibrationProblems, machinePass, carryJudgements, resultsBlock, mergeLibrary } from './loop-rules.mjs';
import { takeTurn, waitForRuns } from './gate-queue.mjs';
import { postStatus as post } from './github.mjs';
import { evaluate, toolsDiffer } from './evaluate.mjs';
import { removeWorktree } from './worktree-remove.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null; };
const flag = (k) => argv.includes('--' + k);
const short = (s) => String(s || '?').slice(0, 7);
const VERDICT_FILE = /^verdict(-[\w.-]+)?\.json$/;
// The gate's own files live in the git common dir, so every worktree on this machine sees them: the lock and the evidence. Its result
// is the sentri/gate commit status on GitHub, which branch protection on main requires, with branches up to date (gate-simplify.md
// G2): there are no local pass records.
const gateDir = () => path.join(path.resolve(root, git(['rev-parse', '--git-common-dir']).out.trim()), 'sentri-gate');
// A run against a test base (--base) never reaches GitHub or the merge guard.
// --try (2026-10-21): run THIS checkout's tools on a candidate against origin/main, posting nothing. It is how a change to the
// gate's own tools is tried on a real PR before it merges (it was a hand-built base and candidate). Never mergeable.
const tryRun = flag('try');
const testBase = !!opt('base') || tryRun;
const mainRef = opt('base') || 'origin/main';
const postStatus = (sha, state, description) => (testBase ? { ok: true } : post(root, sha, state, description));
const passDescription = (mech) => { const moved = ['diff', 'new', 'gone'].reduce((n, k) => n + (mech.screens?.[k]?.length || 0), 0); return `GATE PASS against ${short(mech.base)} · ${moved ? `${moved} screen(s) moved; machine checks only (the owner approved the design)` : 'no screen moved'}`; };
// A ref that passed once (its re-checks go first). Local, per machine; a stale record only ever buys a queue place.
const passFile = (ref) => path.join(gateDir(), 'passed', `${String(ref).replace(/[^\w.-]+/g, '_')}.json`);
// The latest run on each commit (2026-10-21): --post refuses a saved pass when a later run on the same commit replaced it.
const lastFile = (commit) => path.join(gateDir(), 'last', `${commit}.json`);
// Fails closed: when the record can't be written, the old one goes, so no earlier pass can stand for this commit.
const recordLast = (commit, out, outcome) => { try { fs.mkdirSync(path.dirname(lastFile(commit)), { recursive: true }); fs.writeFileSync(lastFile(commit), JSON.stringify({ out: path.resolve(out), outcome, at: new Date().toISOString() })); } catch { try { fs.rmSync(lastFile(commit), { force: true }); } catch {} } };
const recordPass = (ref, commit) => { try { fs.mkdirSync(path.dirname(passFile(ref)), { recursive: true }); fs.writeFileSync(passFile(ref), JSON.stringify({ ref, commit, at: new Date().toISOString() })); } catch {} };
function git(args, cwd = root) { const r = spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 << 20 }); return { code: r.status, out: r.stdout || '', err: r.stderr || '' }; }
const sha = (r) => (r ? git(['rev-parse', '--verify', '--quiet', `${r}^{commit}`]).out.trim() : '');

// ---------- the base's own tools ----------
// The gate judges with the base's tools (gate-v2.md §1). From a checkout whose scripts/, docs/design-workflow/ or package.json
// differ from the base, this run starts the base's own gate.mjs from a detached worktree of the base, with the same arguments and
// working directory, and removes that worktree when it ends. Before, such a run blocked until the driver checked main out (three
// blocks on 2026-10-17/18). SENTRI_GATE_TOOLS marks the run inside, so it never goes round again.
if (!process.env.SENTRI_GATE_TOOLS && !tryRun) {
  if (!testBase) git(['fetch', '-q', 'origin']);
  const base = sha(mainRef);
  const stale = base ? toolsDiffer(root, base) : [];
  if (stale.length) {
    const dir = path.join(os.tmpdir(), `sentri-gate-tools-${short(base)}-${process.pid.toString(36)}`);
    const added = git(['worktree', 'add', '--detach', dir, base]);
    if (added.code) { console.log(`GATE BLOCKED — this checkout's tools differ from ${short(base)}, and a worktree of it could not be made: ${added.err.trim().split('\n')[0]}`); process.exit(3); }
    console.log(`this checkout's ${stale.slice(0, 3).join(', ')}${stale.length > 3 ? ' …' : ''} differ from ${mainRef} (${short(base)}): the gate runs ${short(base)}'s own tools, from ${dir}`);
    // HEAD (or @) names this checkout's commit; inside the base's worktree it would name the base (2026-10-21)
    const fwd = argv.map((a, i) => (argv[i - 1] === '--candidate' && /^(HEAD|@)/.test(a) && sha(a) ? sha(a) : a));
    const r = spawnSync(process.execPath, [path.join(dir, 'scripts/gate.mjs'), ...fwd], { stdio: 'inherit', cwd: process.cwd(), env: { ...process.env, SENTRI_GATE_TOOLS: base, ...(pwPath ? { SENTRI_PLAYWRIGHT: pwPath } : {}) } });
    removeWorktree(dir, { cwd: root });
    process.exit(r.status ?? 1);
  }
}

// ---------- one gate at a time ----------
// Two gates on one machine starve each other's browsers into timeouts (#164), so every gate run, an audit included, and a
// --verdict that has to gate again, holds one lock in the gate's folder for its whole run. Gates take it in turn
// (scripts/gate-queue.mjs): first come, first served, except that a --verdict re-gate goes ahead of ordinary gates. A lock or
// ticket whose process is gone, or whose pid now belongs to another process (a reboot reuses pids), is stale and dropped. The lock
// goes on every exit: finish, a signal, a crash. A signal first awaits the running evaluation's one cleanup (its browsers, servers,
// worktrees and npm test's process tree), so the lock never goes while they still run; a second signal exits at once.
let turn = null, closeEvaluation = null, stopping = null;
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) process.on(sig, () => {
  if (stopping) { console.log(`${sig} again: the gate exits now`); process.exit(130); }
  console.log(`\n${sig}: the gate stops${closeEvaluation ? ' (closing its browsers, servers and npm test first)' : ''}`);
  stopping = Promise.resolve(closeEvaluation?.()).catch(() => {}).finally(() => process.exit(130));
});
async function acquireLock(ref, priority) {
  turn = await takeTurn(gateDir(), { ref, sha: sha(ref), priority });
  // The gate's own checks open browsers without waiting on it (scripts/playwright-path.mjs); every other browser run from this
  // repo registered in sentri-gate/runs/ is waited for while it works, and a new one waits for the gate.
  process.env.SENTRI_GATE_PID = String(process.pid);
  await waitForRuns(gateDir());
  return turn.waited;
}

// One mechanical gate run, under the lock: evaluate(), then mechanical.json. A change that moves no screen has nothing to judge, so
// its pass is the gate pass: it posts the sentri/gate status (which branch protection on main requires). A run starts by posting
// "pending", so an earlier pass on the same commit never stands for this run, and ends with "failure" when it fails or blocks. Never
// for a run against a test base or an audit.
async function runGate({ ref, base, out, mode, scope, audit = false, keep = false, priority = false }) {
  fs.mkdirSync(out, { recursive: true });
  const waited = await acquireLock(ref, priority);
  // A rerun into the same folder starts clean: old shots, pairs and verdicts are about a mechanical run that no longer exists. Cleared
  // only once this run holds the lock, so a queued run never deletes a running one's output (2026-10-21).
  for (const f of ['shots', 'pairs', 'leaves', 'scenarios', 'npm-test.log', 'mechanical.json', ...fs.readdirSync(out).filter((f) => VERDICT_FILE.test(f))]) fs.rmSync(path.join(out, f), { recursive: true, force: true });
  const env = { ...process.env, ...(pwPath ? { SENTRI_PLAYWRIGHT: pwPath } : {}) };
  git(['fetch', '-q', 'origin']);
  const candidate = sha(ref);
  if (candidate) turn.relabel(candidate); // the lock names what it gates
  // first the local record, then the network: a run killed even inside the pending post stays 'running', and --post refuses
  if (candidate && !audit && !testBase) recordLast(candidate, out, 'running');
  if (candidate && !audit) postStatus(candidate, 'pending', `gate running against ${short(sha(base))}`); // an earlier pass for this commit no longer stands
  let res;
  try {
    res = await evaluate({ root, out, base, candidate: ref, ref, mode, scope, audit, keep, env, testBase, ownTools: tryRun, onClose: (close) => { closeEvaluation = close; } });
  } catch (e) {
    console.error(e.stack || e);
    res = { outcome: 'blocked', mech: { outcome: 'blocked', pass: false, ref, candidate: candidate || undefined, mode, scope, class: {}, blocked: [`the gate crashed: ${String(e.message || e).split('\n')[0]}`], checks: [], gaps: [], pairs: [] } };
  }
  if (stopping) await stopping; // stopped: no status and no record; the exit after the cleanup releases the lock
  const mech = { ...res.mech, waited: waited + 's', testBase: testBase || undefined };
  if (!testBase && !audit && machinePass(mech)) {
    mech.gatePass = true;
    const posted = postStatus(mech.candidate, 'success', passDescription(mech));
    if (!posted.ok) { mech.gatePass = false; mech.notPosted = posted.why; }
    else recordPass(ref, mech.candidate);
  } else if (!testBase && !audit && mech.candidate) {
    postStatus(mech.candidate, 'failure', `MECHANICAL ${String(mech.outcome).toUpperCase()} against ${short(mech.base)}`);
  }
  fs.writeFileSync(path.join(out, 'mechanical.json'), JSON.stringify(mech, null, 2));
  if (!testBase && !audit && mech.candidate) recordLast(mech.candidate, out, mech.outcome);
  // the PR's Results block (gate-simplify.md S8): the gate's own measurements, pasted whole into the PR body
  fs.writeFileSync(path.join(out, 'results.md'), resultsBlock(mech));
  const t = mech.timings || {};
  console.log(`\ntimings (s): ${Object.entries(t).map(([k, v]) => `${k} ${v}`).join(', ')}`);
  if (mech.evidence) console.log(`evidence: ${JSON.stringify(mech.evidence.byKind || {})}; scheduler ${JSON.stringify(mech.evidence.scheduler?.busy || {})}`);
  const word = (audit ? { pass: 'AUDIT PASS', fail: 'AUDIT FAIL', blocked: 'AUDIT BLOCKED' } : { pass: 'MECHANICAL PASS', fail: 'MECHANICAL FAIL', blocked: 'MECHANICAL BLOCKED' })[mech.outcome] || 'MECHANICAL FAIL';
  console.log(`${word} ${short(mech.candidate)} on base ${short(mech.base)} (${mech.class?.effective || '?'}, ${mode})${tryRun ? ' — TRY RUN: this checkout\'s tools, no status posted, never mergeable' : ''} — ${out}`);
  for (const b of mech.blocked || []) console.log('  blocked:', b);
  if (mech.gatePass) console.log(`GATE PASS (machine checks; the owner's "PR it" approved the design): gh pr merge <n> --squash --match-head-commit ${mech.candidate}`);
  if (mech.notPosted) console.log(`NOT POSTED: the machine passed, but GitHub did not take the sentri/gate status (${mech.notPosted}), so GitHub refuses the merge. Post it without gating again: node scripts/gate.mjs --post ${out}`);
  return mech;
}

// ---------- --verdict <out>: advice only. Check an optional judge's verdict against the mechanical result ----------
// Owner ruling (2026-10-20): the judge no longer holds a merge, so --verdict posts no status; the machine's pass is the gate.
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
    console.log(`${mech.ref} is ${short(head)} and ${mainRef} is ${short(main)} since the gate ran on ${short(mech.candidate)} against ${short(mech.base)}: gating again, reusing every result and judgement whose identity is unchanged`);
    const again = path.join(dir, `regate-${short(head)}-${short(main)}`);
    const now = await runGate({ ref: mech.ref, base: mainRef, out: again, mode: mech.mode, scope: mech.scope, priority: true });
    if (now.outcome !== 'pass') { console.log(`GATE FAIL ${short(now.candidate)}\n  - the mechanical gate on the new head and main: ${now.outcome}${(now.blocked || [])[0] ? ` (${now.blocked[0]})` : ''}`); process.exit(1); }
    const { carried, need, goneNeed, walkNeed = [], problems: refused } = carryJudgements({ mech, parts }, now);
    if (refused.length) { console.log(`GATE FAIL ${short(now.candidate)}: the judged run's verdicts can't be carried`); for (const p of refused) console.log('  -', p); process.exit(1); }
    if (carried) fs.writeFileSync(path.join(again, 'verdict-carried.json'), JSON.stringify({ ...carried, walkNeed }, null, 2));
    console.log(`carried ${carried?.pairs.length || 0} judgement(s) of ${now.pairs.length} pair(s) by image or identity${carried?.gone.length ? `, and ${carried.gone.length} removed screen reason(s)` : ''}, and ${carried?.walk.length || 0} walk entr(ies) whose screen's inputs are unchanged`);
    if (need.length || goneNeed.length || walkNeed.length) {
      console.log(`GATE FAIL ${short(now.candidate)}: ${need.length} pair(s) show different images now${goneNeed.length ? ` and ${goneNeed.length} removed screen(s) need a reason` : ''}${walkNeed.length ? `; ${walkNeed.length} screen(s) look the same from changed inputs and are walked again` : ''}; a judge decides only those`);
      for (const n of need.slice(0, 20)) console.log('  - judge', n);
      for (const g of goneNeed) console.log('  - say why under "gone":', g);
      for (const w of walkNeed) console.log('  - walk again:', w);
      console.log(`  write them as ${path.join(again, 'verdict-new.json')} (every other pair is in verdict-carried.json), then: node scripts/gate.mjs --verdict ${again}`);
      process.exit(1);
    }
    dir = again; mech = now; parts = verdictFiles(dir).map((f) => readIn(dir, f));
    head = sha(mech.ref); main = sha(mainRef);
  }
  const cat = (k) => parts.flatMap((p) => p[k] || []);
  // Each part's pass is about its own pairs: no worse or failed pair, no defect, no failed walk, no contradicted claim. "At least
  // one pair better" is the whole change's, which checkVerdict applies over every part's pairs together (G13): a part that is all
  // "same", or all new screens, passes on its own.
  const verdict = { ...parts[0], pass: parts.every((p) => p.pass === true), pairs: cat('pairs'), walk: cat('walk'), defects: cat('defects'), gone: cat('gone'), rejected: cat('rejected'), contradicted: cat('contradicted'), library: mergeLibrary(parts) };
  for (const p of parts) if (p.candidate !== verdict.candidate || p.base !== verdict.base) verdict.candidate = 'mixed verdicts';
  const v = checkVerdict(verdict, mech);
  // a screen whose walk could not carry (same picture, changed inputs) needs a walk in this verdict
  for (const s of new Set(cat('walkNeed'))) if (!verdict.walk.some((w) => w.screen === s)) v.problems.push(`walk ${s} again: it looks the same as when it was walked, but its inputs changed`);
  // G15: a screen that runs changed code and draws the same is walked
  for (const s of mech.walkNeed || []) if (!verdict.walk.some((w) => w.screen === s)) v.problems.push(`walk ${s}: it runs changed code and draws the same (G15)`);
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
  // The same result as a commit status on GitHub: branch protection on main can require "sentri/gate", which makes GitHub itself
  // refuse an ungated merge however it is attempted (the local merge guard is only a convenience).
  console.log('  (advice only: the judge does not hold the merge; sentri/gate is the machine\'s result)');
  process.exit(ok ? 0 : 1);
}

// ---------- --post <out>: post a machine pass GitHub did not take, without gating again (2026-10-21) ----------
// This machine's GitHub calls often fail on TLS/EOF. A pass is posted only for the same head and the same main it was gated on.
if (opt('post')) {
  const dir = opt('post');
  let mech; try { mech = JSON.parse(fs.readFileSync(path.join(dir, 'mechanical.json'), 'utf8')); } catch (e) { console.log(`NOT POSTED — ${path.join(dir, 'mechanical.json')}: ${e.message.split('\n')[0]}`); process.exit(1); }
  if (mech.testBase || mech.tryRun || !machinePass(mech)) { console.log(`NOT POSTED — that run is not a machine pass against main (${mech.outcome}${mech.tryRun ? ', a try run' : ''})`); process.exit(1); }
  await acquireLock(mech.ref, true); // never while a gate on this machine is running, which could replace the result
  let last = null; try { last = JSON.parse(fs.readFileSync(lastFile(mech.candidate), 'utf8')); } catch {}
  if (!last || last.out !== path.resolve(dir) || last.outcome !== 'pass') { console.log(`NOT POSTED — a later gate run on ${short(mech.candidate)} replaced this one${last ? ` (${last.outcome}, ${last.out})` : ''}: post that run's result, or gate again`); process.exit(1); }
  const fetched = git(['fetch', '-q', 'origin']);
  if (fetched.code !== 0) { console.log(`NOT POSTED — git fetch origin failed: ${fetched.err.trim().split('\n')[0]}`); process.exit(4); }
  const head = sha(mech.ref), main = sha(mainRef);
  if (head !== mech.candidate) { console.log(`NOT POSTED — ${mech.ref} is ${short(head)} now, not the gated ${short(mech.candidate)}: gate again`); process.exit(1); }
  if (main !== mech.base) { console.log(`NOT POSTED — ${mainRef} is ${short(main)} now, not ${short(mech.base)}: merge main forward and gate again`); process.exit(1); }
  const posted = post(root, mech.candidate, 'success', passDescription(mech));
  if (!posted.ok) { console.log(`NOT POSTED — GitHub: ${posted.why}. Run it again.`); process.exit(4); }
  recordPass(mech.ref, mech.candidate);
  console.log(`POSTED GATE PASS on ${short(mech.candidate)} against ${short(mech.base)}: gh pr merge <n> --squash --match-head-commit ${mech.candidate}`);
  process.exit(0);
}

// ---------- --carry: replaced by evidence reuse ----------
// Gate v2 (gate-v2.md §3): there is no carried pass. --verdict on a run whose head or main has moved gates again, reusing every result
// and judgement whose identity did not change.
if (argv.includes('--carry')) {
  console.log('--carry is gone: run --verdict <out> on the judged run; when the head or main has moved it gates again, reusing every result and judgement whose identity is unchanged.');
  process.exit(2);
}

// ---------- --audit: the identities, checked off the merge path ----------
if (flag('audit')) {
  const out = path.resolve(opt('out') || path.join(os.tmpdir(), `sentri-audit-${Date.now()}`));
  const mech = await runGate({ ref: mainRef, base: mainRef, out, mode: 'normal', scope: [], audit: true });
  for (const d of (mech.audit?.differ || []).slice(0, 20)) console.log(`  - ${d.screen} ${d.run}: ${d.pct}% different from the stored shot of identity ${short(d.identity)}`);
  process.exit(mech.outcome === 'pass' ? 0 : mech.outcome === 'blocked' ? 3 : 1);
}

const ref = opt('candidate');
for (const gone of ['quick', 'class']) if (argv.includes('--' + gone)) { console.log(`--${gone} is gone (gate-simplify.md X3, X6): the gate derives the class itself, and a full run of a local change takes minutes`); process.exit(2); }
const mode = opt('mode') || 'normal';
const scope = (opt('scope') || '').split(',').map((s) => s.trim()).filter(Boolean);
if (!ref || !['normal', 'refactor'].includes(mode)) {
  console.error('usage: node scripts/gate.mjs --candidate <ref> [--scope <feature,...>] [--mode normal|refactor] [--out <dir>] [--keep] [--base <ref>] [--try]');
  console.error('       node scripts/gate.mjs --post <out dir>   (post a machine pass GitHub did not take)');
  console.error('       node scripts/gate.mjs --verdict <out dir> [--base <ref>]');
  console.error('       node scripts/gate.mjs --audit [--out <dir>]');
  process.exit(2);
}
const out = path.resolve(opt('out') || path.join(os.tmpdir(), `sentri-gate-${Date.now()}`));
// A ref that has passed before is re-checked ahead of first gates (2026-10-21): after main moves, or a small fix, the re-check is what
// stands between an approved PR and its merge. Priority was --verdict's only, which the machine-only workflow no longer runs.
const mech = await runGate({ ref, base: mainRef, out, mode, scope, keep: flag('keep'), priority: !testBase && fs.existsSync(passFile(ref)) });
process.exit(mech.notPosted ? 4 : mech.outcome === 'pass' ? 0 : mech.outcome === 'blocked' ? 3 : 1);
