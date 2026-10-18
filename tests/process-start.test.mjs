// Who holds the gate lock or a browser-run record (scripts/process-start.mjs): the pid AND when it started. On 2026-10-18 a reboot
// gave a killed gate's pid 2348 to svchost.exe; the pid-only check read its lock as held and the next gate waited forever.
import test from 'node:test';
import assert from 'node:assert/strict';
import { holderAlive, startOf, selfStart, START_SLACK_MS } from '../scripts/process-start.mjs';
import { lockState } from '../scripts/loop-rules.mjs';

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

test('the gate lock reads the same rule: free, held, or stale when its pid is gone or reused', () => {
  assert.equal(lockState(null, alive, () => T), 'free');
  assert.equal(lockState({ pid: 2348, start: T, sha: 'abc' }, alive, () => T), 'held');
  assert.equal(lockState({ pid: 2348, start: T, sha: 'abc' }, alive, () => T + START_SLACK_MS + 1), 'stale');
  assert.equal(lockState({ pid: 9, start: T, sha: 'abc' }, alive, () => T), 'stale');
});

test("this machine's own start time reads back as this process, and a pid that doesn't exist reads as unknown", () => {
  const mine = startOf(process.pid);
  assert.ok(mine !== null, 'the OS start time of this process can be read');
  assert.ok(Math.abs(mine - selfStart()) <= START_SLACK_MS, `the OS says ${new Date(mine).toISOString()}, this process says ${new Date(selfStart()).toISOString()}`);
  assert.equal(holderAlive({ pid: process.pid, start: selfStart() }), true, 'a live gate is never taken over');
  assert.equal(startOf(2 ** 31 - 2), null);
});
