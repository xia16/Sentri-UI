#!/usr/bin/env node
// The behaviour gate: runs a feature's scenario leaves (features/<feature>/scenarios.json) in a real browser.
// Usage: node scripts/run-scenarios.mjs <feature> [--lang en,zh] [--width 360,390] [--base <url>] [--only <leaf,leaf>] [--jobs N]
// Format: docs/design-workflow/scenarios.md (the pure tree walk and format checks: scripts/scenario-tree.mjs). Writes review/scenarios-<feature>.json and screenshots under
// review/scenarios/<feature>/<leaf>/<lang>-<width>/. Exits 1 when any leaf fails.
import { spawn, execSync } from 'node:child_process';
import { playwright } from './playwright-path.mjs';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { walkTree } from './scenario-tree.mjs';
import { timedOutOnly, aimdStep } from './machine.mjs';
import { leafRunner, leafRow, reportOf } from './scenario-runner.mjs';
import os from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = playwright();

// ---- arguments ----
const argv = process.argv.slice(2);
const feature = argv.find((a, i) => !a.startsWith('--') && !(argv[i - 1] || '').startsWith('--'));
if (!feature) { console.error('usage: node scripts/run-scenarios.mjs <feature> [--lang en,zh] [--width 360,390] [--base <url>] [--only a,b] [--jobs N]'); process.exit(2); }
const opt = (k) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : null; };
const specPath = join(root, 'features', feature, 'scenarios.json');
if (!existsSync(specPath)) { console.error(`no ${relative(root, specPath)}`); process.exit(2); }
const spec = JSON.parse(readFileSync(specPath, 'utf8'));
const D = spec.defaults || {};
const langs = (opt('lang') || (D.langs || ['en']).join(',')).split(',').filter(Boolean);
const widths = (opt('width') || (D.widths || [390]).join(',')).split(',').map(Number).filter(Boolean);
const only = opt('only') ? new Set(opt('only').split(',')) : null;
const verbs = JSON.parse(readFileSync(join(root, 'ux/laws/strings.json'), 'utf8')).verbs || {};

// ---- the tree: walk it into executable leaves (scripts/scenario-tree.mjs) ----
// A leaf's run = the reset fixture of its nearest `state` ancestor + the steps of every `action` between them + its own.
const { leaves, nodeCount, problems, gwtProblems } = walkTree(spec);
if (problems.length) { console.error(problems.join('\n')); process.exit(2); }
for (const w of gwtProblems) console.warn(`warning: ${w}`);   // npm test (tests/scenarios-format.test.mjs) is what fails on these

// ---- server ----
const freePort = () => new Promise((res) => { const s = createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => res(p)); }); });
let server = null, base = opt('base');
if (!base) {
  const port = await freePort();
  server = spawn(process.execPath, [join(root, 'scripts/serve-ux.cjs'), String(port)], { cwd: root, stdio: 'ignore' });
  process.on('exit', () => server.kill());
  for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => process.exit(130));
  base = `http://localhost:${port}`;
  for (let i = 0; i < 50; i++) { try { await fetch(base + '/atlas/atlas.json'); break; } catch { await new Promise((r) => setTimeout(r, 100)); } }
}
base = base.replace(/\/$/, '');
let commit = 'unknown', dirty = false;
try { commit = execSync('git rev-parse HEAD', { cwd: root }).toString().trim(); dirty = !!execSync('git status --porcelain --untracked-files=no', { cwd: root }).toString().trim(); } catch {}

const runLeaf = leafRunner({ base, defaults: D, verbs, evidenceDir: join(root, 'review', 'scenarios', feature), relativeTo: root });

// A run whose only failure is a navigation timeout (the machine was busy, not the design) runs once more in fresh contexts.
// Timing out again fails it as a slow machine, never as a design failure; an assertion failure never retries.
async function runWithRetry(browser, leaf, lang, width) {
  const first = await runLeaf(browser, leaf, lang, width);
  if (first.result !== 'fail' || !timedOutOnly(first.failures)) return first;
  console.log(`retry    ${leaf.node.id} ${lang}-${width}: ${first.failures[0].got}`);
  const again = await runLeaf(browser, leaf, lang, width);
  again.retried = first.failures.map((f) => f.got);
  if (again.result === 'fail' && timedOutOnly(again.failures)) {
    again.slow = true;
    again.failures = again.failures.map((f) => ({ ...f, what: `slow machine (timed out twice): ${f.what}`, tag: null }));
  }
  return again;
}

// ---- run ----
// Every run (a leaf in one language at one width) opens its own contexts on its reset fixture and writes its own evidence folder,
// so runs share nothing and several go at once in one browser. How many is found as it goes (aimdStep: start at 2, add one while
// runs stay as fast as the first ones, halve on a timeout or when they slow down, at most the machine's cores). --jobs N (or
// SENTRI_SCENARIO_JOBS) fixes it instead; --jobs 1 is the old one-by-one order. Results are put back in leaf order, so the report
// and the log read the same however many ran at once.
const fixed = Number(opt('jobs') || process.env.SENTRI_SCENARIO_JOBS) || 0;
const browser = await chromium.launch();
const out = [];
const runnable = leaves.filter((l) => (!only || only.has(l.node.id)) && l.node.type !== 'decision-blocker' && l.node.status !== 'pending');
const tasks = runnable.flatMap((leaf) => (leaf.node.langs || langs).flatMap((lang) => (leaf.node.widths || widths).map((width) => ({ leaf, lang, width }))));
const done = new Map();
{
  const cores = Math.max(1, os.cpus().length);
  let ctl = { limit: fixed ? Math.max(1, fixed) : Math.min(2, cores), min: 1, max: fixed ? Math.max(1, fixed) : cores, baseline: null };
  let next = 0, inflight = 0, peak = ctl.limit;
  const t0 = Date.now();
  await new Promise((resolve) => {
    const pump = () => {
      if (next >= tasks.length && inflight === 0) return resolve();
      while (inflight < ctl.limit && next < tasks.length) {
        const t = tasks[next++], s = Date.now(); inflight++;
        runWithRetry(browser, t.leaf, t.lang, t.width).catch((e) => ({ lang: t.lang, width: t.width, result: 'fail', failures: [{ what: 'run', got: String((e && e.message) || e), tag: null }], skipped: [], notes: [], evidence: [] })).then((r) => {
          done.set(t, r); inflight--;
          if (!fixed) { const { state, why } = aimdStep(ctl, { ms: Date.now() - s, timedOut: !!r.retried }); if (why && state.limit !== ctl.limit) console.log(`at once: ${ctl.limit} → ${state.limit} (${why})`); ctl = state; peak = Math.max(peak, ctl.limit); }
          pump();
        });
      }
    };
    pump();
  });
  console.log(`ran ${tasks.length} run(s) in ${Math.round((Date.now() - t0) / 1000)}s, ${fixed ? `${ctl.limit} at once (--jobs)` : `up to ${peak} at once (adaptive, ${cores} cores)`}`);
}
for (const leaf of leaves) {
  if (only && !only.has(leaf.node.id)) continue;
  const row = leafRow(leaf, tasks.filter((t) => t.leaf === leaf).map((t) => done.get(t)));
  out.push(row);
  if (row.result === 'blocked' && 'question' in row) { console.log(`blocked  ${row.id}  ${row.question || ''}`); continue; }
  if (row.result === 'pending') { console.log(`pending  ${row.id}`); continue; }
  const first = row.runs.flatMap((r) => r.failures.map((f) => `${r.lang}-${r.width}: ${f.what} → ${f.got}`))[0] || '';
  console.log(`${row.result.padEnd(8)} ${row.id}${row.hard.length ? '  [' + row.hard.join(', ') + ']' : ''}${first ? '  ' + first.slice(0, 160) : ''}`);
}
await browser.close();
if (server) server.kill();

const report = reportOf({ feature, commit, dirty, base, langs, widths, nodeCount, rows: out });
const byLang = report.byLang;
const reportPath = join(root, 'review', `scenarios-${feature}.json`);
if (!only) writeFileSync(reportPath, JSON.stringify(report, null, 1) + '\n');
if (opt('report')) writeFileSync(opt('report'), JSON.stringify(report, null, 1) + '\n');   // --report <file>: the report for an --only run too (the gate compares base and candidate by it)
console.log(`\n${feature} @ ${commit.slice(0, 7)}${dirty ? ' (dirty)' : ''}: pass ${report.summary.pass} · fail ${report.summary.fail}${report.summary.slow ? ` (${report.summary.slow} only a slow machine: timed out twice, not a design failure)` : ''} · blocked ${report.summary.blocked} · pending ${report.summary.pending}${only ? '' : '  → ' + relative(root, reportPath)}`);
for (const [l, b] of Object.entries(byLang)) console.log(`  ${l}: pass ${b.pass} · fail ${b.fail} · blocked ${b.blocked} (leaves that ran)`);
process.exit(report.summary.fail ? 1 : 0);
