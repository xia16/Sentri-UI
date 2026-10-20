// The machine's one-gate lock taken in turn (scripts/gate-queue.mjs). On 2026-10-20 a gate waited 3.5h while later gates took the lock
// first, a judged PR's re-check queued behind full gates, and leftover browser runs held a gate for 30–100+ min. Every test runs
// against its own temp folder with made-up processes: nothing here touches the machine's real gate.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { takeTurn, waitForRuns, gateAhead, registerRun, RUN_STALE_MS } from '../scripts/gate-queue.mjs';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'gate-queue-test-'));
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
const procs = (...pids) => { const set = new Set(pids); return { live: (r) => !!r && set.has(r.pid), kill: (p) => set.delete(p), add: (p) => set.add(p) }; };
const clock = () => { let t = Date.parse('2026-10-20T09:00:00Z'); return () => (t += 1000); };
const hold = (dir, pid, extra = {}) => fs.writeFileSync(path.join(dir, 'gate.lock'), JSON.stringify({ pid, start: 1, sha: 'aaaaaaa', ref: 'origin/claude/holder', at: new Date().toISOString(), ...extra }));
const opts = (p, now, log = () => {}) => ({ live: p.live, now, poll: 5, log });

// Start gates in this order, then free the lock held by `holder`; returns the order in which they got it.
async function race(dir, p, gates, holder = 100) {
  const now = clock(), order = [];
  hold(dir, holder);
  const runs = [];
  for (const g of gates) {
    p.add(g.pid);
    runs.push(takeTurn(dir, { ...opts(p, now), self: { pid: g.pid, start: 1 }, priority: !!g.priority, ref: `pr-${g.pid}` })
      .then(async (turn) => { order.push(g.pid); await sleep(15); turn.release(); }));
    await sleep(20); // each one waiting before the next arrives
  }
  p.kill(holder); fs.rmSync(path.join(dir, 'gate.lock'));
  await Promise.all(runs);
  return order;
}

test('gates take the lock in the order they arrived, not whoever polls first', async () => {
  const dir = tmp(), p = procs(100);
  assert.deepEqual(await race(dir, p, [{ pid: 103 }, { pid: 101 }, { pid: 102 }]), [103, 101, 102]);
  assert.deepEqual(fs.readdirSync(path.join(dir, 'queue')), [], 'every ticket is gone once its gate has the lock');
  assert.equal(fs.existsSync(path.join(dir, 'gate.lock')), false);
});

test('a --verdict re-check goes ahead of ordinary gates that came before it, never ahead of the gate running', async () => {
  const dir = tmp(), p = procs(100);
  assert.deepEqual(await race(dir, p, [{ pid: 101 }, { pid: 102 }, { pid: 103, priority: true }, { pid: 104, priority: true }]), [103, 104, 101, 102]);
});

test('a ticket or a lock whose process is gone is dropped, and the next gate goes', async () => {
  const dir = tmp(), p = procs(), log = [];
  fs.mkdirSync(path.join(dir, 'queue'));
  fs.writeFileSync(path.join(dir, 'queue', 'a-000000000000001-99.json'), JSON.stringify({ pid: 99, start: 1, sha: 'dead' })); // a re-check that died queued
  hold(dir, 98);
  p.add(101);
  const turn = await takeTurn(dir, { ...opts(p, clock(), (l) => log.push(l)), self: { pid: 101, start: 1 } });
  assert.deepEqual(fs.readdirSync(path.join(dir, 'queue')), []);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'gate.lock'), 'utf8')).pid, 101);
  assert.match(log.join('\n'), /taking over a stale gate lock: pid 98/);
  turn.release();
});

test('a waiting gate takes over when the gate holding the lock dies', async () => {
  const dir = tmp(), p = procs(100, 101);
  hold(dir, 100);
  const got = takeTurn(dir, { ...opts(p, clock()), self: { pid: 101, start: 1 } });
  await sleep(20);
  p.kill(100);
  (await got).release();
});

test('the waiting line says who holds the gate, what it gates, for how long and the place in the queue', async () => {
  const dir = tmp(), p = procs(100, 101, 102), log = [], now = clock();
  hold(dir, 100, { at: new Date(now() - 30 * 60e3).toISOString() });
  const first = takeTurn(dir, { ...opts(p, now), self: { pid: 101, start: 1 } });
  const second = takeTurn(dir, { ...opts(p, now, (l) => log.push(l)), self: { pid: 102, start: 1 } });
  await sleep(20);
  assert.match(log[0], /^waiting for the gate on aaaaaaa \(origin\/claude\/holder, pid 100\) for \d+ min · 1 ahead in the queue …$/);
  p.kill(100);
  (await first).release();
  (await second).release();
});

test('a new browser run waits for the gate holding the lock, else the first gate queued', () => {
  const dir = tmp(), p = procs(100, 101);
  assert.equal(gateAhead(dir, { live: p.live }), null);
  fs.mkdirSync(path.join(dir, 'queue'));
  fs.writeFileSync(path.join(dir, 'queue', 'b-000000000000005-101.json'), JSON.stringify({ pid: 101, start: 1, sha: 'bbb' }));
  assert.equal(gateAhead(dir, { live: p.live }).pid, 101, 'a queued gate: a run started in the gap between two gates waits too');
  hold(dir, 100);
  assert.equal(gateAhead(dir, { live: p.live }).pid, 100);
  p.kill(100); p.kill(101);
  assert.equal(gateAhead(dir, { live: p.live }), null);
});

test('a gate waits for a browser run that works, not for a dead one or a leftover that stopped beating', async () => {
  const dir = tmp(), p = procs(200, 202, 203), log = [], runs = path.join(dir, 'runs');
  fs.mkdirSync(runs);
  const at = (ago) => new Date(Date.now() - ago).toISOString();
  fs.writeFileSync(path.join(runs, '200.json'), JSON.stringify({ pid: 200, start: 1, what: 'daemon.mjs', at: at(90 * 60e3), beat: at(RUN_STALE_MS + 60e3) }));
  fs.writeFileSync(path.join(runs, '201.json'), JSON.stringify({ pid: 201, start: 1, what: 'walk.mjs', at: at(60e3) }));
  fs.writeFileSync(path.join(runs, '202.json'), JSON.stringify({ pid: 202, start: 1, what: 'run-scenarios.mjs', at: at(20 * 60e3), beat: at(30e3) }));
  let done = false;
  const waiting = waitForRuns(dir, { live: p.live, poll: 5, log: (l) => log.push(l), self: { pid: 203 } }).then(() => { done = true; });
  await sleep(30);
  assert.equal(done, false, 'run-scenarios beat 30s ago: the gate waits for it');
  assert.equal(fs.existsSync(path.join(runs, '201.json')), false, 'a dead run is dropped');
  assert.match(log.join('\n'), /not waiting for pid 200 daemon\.mjs: it has not worked for 11 min/);
  assert.match(log.join('\n'), /waiting for 1 other browser run\(s\) from this repo: pid 202 run-scenarios\.mjs, running 20 min, last beat 30s ago …/);
  p.kill(202);
  await waiting;
});

test('a browser run beats only in a minute it used the CPU', async () => {
  const dir = tmp(), file = path.join(dir, 'runs', '300.json');
  let cpu = 0;
  const drop = registerRun(file, { pid: 300, start: 1, at: '2026-10-20T09:00:00.000Z' }, { cpu: () => cpu, every: 10 });
  const beat = () => JSON.parse(fs.readFileSync(file, 'utf8')).beat;
  assert.equal(beat(), '2026-10-20T09:00:00.000Z');
  await sleep(40);
  assert.equal(beat(), '2026-10-20T09:00:00.000Z', 'idle: no beat');
  cpu += 50e3;
  await sleep(40);
  assert.notEqual(beat(), '2026-10-20T09:00:00.000Z', 'working: it beats');
  drop();
  assert.equal(fs.existsSync(file), false);
});
