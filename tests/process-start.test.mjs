// Who holds the gate lock or a browser-run record (scripts/process-start.mjs): the pid AND when it started. On 2026-10-18 a reboot
// gave a killed gate's pid 2348 to svchost.exe; the pid-only check read its lock as held and the next gate waited forever.
import test from 'node:test';
import assert from 'node:assert/strict';
import { holderAlive, startOf, selfStart, START_SLACK_MS } from '../scripts/process-start.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { gateAhead } from '../scripts/gate-queue.mjs';

const T = Date.parse('2026-10-18T00:16:32Z');
const alive = (pid) => pid === 2348;

test('a holder is alive only while its pid runs the process that wrote the record', () => {
  assert.equal(holderAlive(null, { alive }), false);
  assert.equal(holderAlive({ pid: 7, start: T }, { alive, start: () => T }), false, 'a dead pid');
  assert.equal(holderAlive({ pid: 2348, start: T }, { alive, start: () => T + 800 }), true, 'the same process: its start time within the slack');
  assert.equal(holderAlive({ pid: 2348, start: T }, { alive, start: () => T + 10 * 3600e3 }), false, 'a reused pid: another process started hours later');
  assert.equal(holderAlive({ pid: 2348, start: T }, { alive, start: () => null }), true, 'a start time that cannot be read never frees a lock');
  assert.equal(holderAlive({ pid: 2348 }, { alive, start: () => T + 10 * 3600e3 }), true, 'a record written before records had a start: the pid alone, as before');
  assert.equal(holderAlive({ start: T }, { alive: () => true }), false, 'no pid');
});

test('the gate lock reads the same rule (gate-queue gateAhead): free, held, or stale when its pid is gone or reused', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'process-start-test-'));
  const lock = (rec) => fs.writeFileSync(path.join(dir, 'gate.lock'), JSON.stringify(rec));
  const ahead = (start) => gateAhead(dir, { live: (r) => holderAlive(r, { alive, start }) });
  assert.equal(ahead(() => T), null, 'free');
  lock({ pid: 2348, start: T, sha: 'abc' });
  assert.equal(ahead(() => T)?.pid, 2348, 'held');
  assert.equal(ahead(() => T + START_SLACK_MS + 1), null, 'stale: the pid now belongs to a process that started later');
  lock({ pid: 9, start: T, sha: 'abc' });
  assert.equal(ahead(() => T), null, 'stale: its process is gone');
});

test("this machine's own start time reads back as this process, and a pid that doesn't exist reads as unknown", () => {
  const mine = startOf(process.pid);
  assert.ok(mine !== null, 'the OS start time of this process can be read');
  assert.ok(Math.abs(mine - selfStart()) <= START_SLACK_MS, `the OS says ${new Date(mine).toISOString()}, this process says ${new Date(selfStart()).toISOString()}`);
  assert.equal(holderAlive({ pid: process.pid, start: selfStart() }), true, 'a live gate is never taken over');
  assert.equal(startOf(2 ** 31 - 2), null);
});

// ---------- Codex audit, 2026-10-21: a stopped gate cleans up before its lock goes ----------
test('a gate closes once, awaited: its children first, then its cleanups newest first, whatever throws; a second call waits on the first', async () => {
  const { closer } = await import('../scripts/process-start.mjs');
  const order = [];
  const kids = [{ pid: 1 }, { pid: 2 }], cleanups = [async () => { await new Promise((r) => setTimeout(r, 20)); order.push('worktrees'); }, () => { throw new Error('pool gone'); }, async () => order.push('browsers')];
  const close = closer(kids, cleanups, (k) => order.push(`kill ${k.pid}`));
  const [a, b] = [close(), close()];
  assert.equal(a, b, 'one cleanup, however many ask');
  await a;
  assert.deepEqual(order, ['kill 1', 'kill 2', 'browsers', 'worktrees'], 'awaited to the end: the worktrees go last, after the browsers and servers using them');
});

test('killTree ends a shell child and the processes it started (npm test runs under a shell)', { skip: process.platform !== 'win32' && 'the tree kill is taskkill /T, Windows only; elsewhere the child alone is signalled' }, async () => {
  const { killTree, pidAlive } = await import('../scripts/process-start.mjs');
  const { spawn } = await import('node:child_process');
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'kill-tree-')), 'grandchild.pid');
  // a shell that starts a node grandchild, which writes its pid and waits
  const grand = `require('fs').writeFileSync(${JSON.stringify(out)}, String(process.pid)); setInterval(() => {}, 1000);`;
  const p = spawn(`"${process.execPath}" -e "${grand.replace(/"/g, '\\"')}"`, { shell: true, stdio: 'ignore' });
  let pid = null;
  for (let i = 0; i < 100 && !pid; i++) { await new Promise((r) => setTimeout(r, 100)); try { pid = Number(fs.readFileSync(out, 'utf8')) || null; } catch {} }
  assert.ok(pid && pidAlive(pid), 'the grandchild runs');
  killTree(p);
  for (let i = 0; i < 50 && pidAlive(pid); i++) await new Promise((r) => setTimeout(r, 100));
  assert.equal(pidAlive(pid), false, 'the grandchild is gone too');
});

test('what a gate registers while it is closing is closed too: a child at once, a cleanup before the close ends (Codex review round 2)', async () => {
  const { closer } = await import('../scripts/process-start.mjs');
  const order = [], kids = [], cleanups = [];
  let resume;
  cleanups.push(async () => { order.push('worktrees'); });
  cleanups.push(() => new Promise((r) => { resume = r; }).then(() => order.push('browser closed')));
  const close = closer(kids, cleanups, (k) => order.push(`kill ${k.pid}`));
  const done = close();
  while (!resume) await new Promise((r) => setTimeout(r, 5));
  // evaluate's start-up, still running while the browser closes: a server spawned, its pool registered
  kids.push({ pid: 7 });
  cleanups.push(async () => { order.push('late pool'); });
  resume();
  await done;
  assert.deepEqual(order, ['kill 7', 'browser closed', 'worktrees', 'late pool']);
});
