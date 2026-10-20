// Where the tooling finds Playwright: SENTRI_PLAYWRIGHT or PLAYWRIGHT_DIR if set, else the project's own install
// (`playwright` is a pinned devDependency, so `npm install` provides it), else a global install (a cloud container has one).
// Nothing here depends on one person's machine. The browser itself comes from `npx playwright install chromium`.
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { selfStart } from './process-start.mjs';
import { gateAhead, registerRun } from './gate-queue.mjs';

const HELP = 'Playwright not found. Run `npm install` and `npx playwright install chromium` in the repo, or set SENTRI_PLAYWRIGHT to a Playwright install.';
function find() {
  const set = process.env.SENTRI_PLAYWRIGHT || process.env.PLAYWRIGHT_DIR;
  if (set) return set;
  const req = createRequire(import.meta.url);
  try { return path.dirname(req.resolve('playwright/package.json')); } catch {}
  try { const g = path.join(execSync('npm root -g', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(), 'playwright'); if (fs.existsSync(g)) return g; } catch {}
  return null;
}
export const pwPath = find();
export const playwright = () => {
  if (!pwPath) throw new Error(HELP);
  besideNoGate();
  return createRequire(import.meta.url)(pwPath);
};

// A gate never shares the machine with another browser run from this repo (scripts/gate.mjs holds sentri-gate/gate.lock in the git
// common dir). Every other run that opens a browser through here (npm test's browser suites, run-scenarios, check-states,
// shoot-screens on their own) registers in sentri-gate/runs/ and, while a gate runs or is queued, waits for it. Many such runs may go
// at once; a gate waits until they have ended, or have stopped working for 10 minutes (the record beats while the run uses the CPU:
// scripts/gate-queue.mjs). The gate's own checks carry SENTRI_GATE_PID and pass straight through.
let registered = false;
function besideNoGate() {
  if (registered || process.env.SENTRI_GATE_PID) return;
  registered = true;
  const here = path.dirname(fileURLToPath(import.meta.url));
  let dir;
  try { dir = path.join(path.resolve(here, execSync('git rev-parse --git-common-dir', { cwd: here, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()), 'sentri-gate'); } catch { return; }
  const me = path.join(dir, 'runs', `${process.pid}.json`);
  const rec = { pid: process.pid, start: selfStart(), what: process.argv.slice(1).map((a) => path.basename(a)).join(' ').slice(0, 120) };
  let said = false;
  for (;;) {
    let g = gateAhead(dir);
    if (!g) {
      const drop = registerRun(me, { ...rec, at: new Date().toISOString() });
      if (!(g = gateAhead(dir))) { process.on('exit', drop); break; } // a gate that came meanwhile would wait for this run: this run steps back for it instead
      drop();
    }
    if (!said) { console.error(`waiting for the gate on ${String(g.sha || '?').slice(0, 7)} (${g.ref || '?'}, pid ${g.pid}) before opening a browser …`); said = true; }
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000);
  }
}
