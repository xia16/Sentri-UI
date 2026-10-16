// Machine errors and the one scheduler (scripts/machine.mjs, scripts/scheduler.mjs; docs/design-workflow/gate-v2.md §4).
import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyMachineError, machineErrorOf, WORKERS, LAUNCH_ARGS } from '../scripts/machine.mjs';
import { createScheduler } from '../scripts/scheduler.mjs';

test('machine errors: a navigation timeout and net::ERR only; an assertion, a missing control or a Ready timeout stands', () => {
  assert.equal(classifyMachineError('page.goto: Timeout 30000ms exceeded.'), 'navigation-timeout');
  assert.equal(classifyMachineError('frame.waitForLoadState: Timeout 8000ms exceeded'), 'navigation-timeout');
  assert.equal(classifyMachineError('net::ERR_CONNECTION_RESET http://127.0.0.1:5000/ux/system/a.js'), 'net-error');
  assert.equal(classifyMachineError('page.goto: net::ERR_EMPTY_RESPONSE at http://127.0.0.1'), 'net-error');
  assert.equal(classifyMachineError("page.goto: net::ERR_NO_BUFFER_SPACE at http://127.0.0.1:5000/"), "net-error", "#190: a navigation the network refused");
  for (const design of ['page.waitForSelector: Timeout 10000ms exceeded', 'control not found: Done', 'expected "Saved" shown, got absent', 'TypeError: x is undefined', '', null]) assert.equal(classifyMachineError(design), null, String(design));
});

test('a run is a machine error only when every failure is one', () => {
  assert.equal(machineErrorOf([{ got: 'page.goto: Timeout 30000ms exceeded' }]), 'navigation-timeout');
  assert.equal(machineErrorOf([{ got: 'page.goto: Timeout 30000ms exceeded' }, { got: 'net::ERR_FAILED' }]), 'navigation-timeout');
  assert.equal(machineErrorOf([{ got: 'page.goto: Timeout 30000ms exceeded' }, { got: 'control not found: Done' }]), null);
  assert.equal(machineErrorOf([]), null);
});

test('one setting: 4 workers by default, one raster thread', () => {
  if (!process.env.SENTRI_WORKERS) assert.equal(WORKERS, 4);
  assert.ok(LAUNCH_ARGS.includes('--num-raster-threads=1'));
});

const sched = (workers = 4) => createScheduler({ playwright: () => { throw new Error('no browser in this test'); }, workers });
const task = (kind, run, extra = {}) => ({ kind, label: kind, browserless: true, run, ...extra });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test('scheduler: never more than its workers at once, counting weight', async () => {
  const s = sched(4);
  let now = 0, peak = 0;
  const work = (w) => task('visit', async () => { now += w; peak = Math.max(peak, now); await sleep(15); now -= w; return { ok: true } }, { weight: w });
  await Promise.all([...Array(10)].map(() => s.run(work(1))).concat([s.run(work(2)), s.run(work(2))]));
  assert.ok(peak <= 4, `peak ${peak}`);
  assert.ok(peak >= 3, `it does run tasks at once (peak ${peak})`);
});

test('scheduler: a machine error is retried once, alone, after the queue drains; a second one is reported, never passed', async () => {
  const s = sched(4);
  let tries = 0, aloneOk = true, running = 0;
  const flaky = task('visit', async ({ alone }) => { tries++; if (alone && running > 0) aloneOk = false; return tries === 1 ? { machine: 'navigation-timeout', error: 'page.goto: Timeout 30000ms exceeded' } : { ok: true }; });
  const others = [...Array(6)].map(() => task('visit', async () => { running++; await sleep(10); running--; return { ok: true }; }));
  const [r] = await Promise.all([s.run(flaky), ...others.map((t) => s.run(t))]);
  assert.equal(r.ok, true);
  assert.equal(r.retried, true);
  assert.equal(tries, 2);
  assert.ok(aloneOk, 'the retry ran with nothing else running');
  const always = await s.run(task('visit', async () => ({ machine: 'net-error', error: 'net::ERR_CONNECTION_RESET' })));
  assert.equal(always.machine, 'net-error');
  assert.equal(always.retried, true);
  assert.equal(s.stats.machineTwice, 1);
});

test('scheduler: a design failure is never retried, and a throw that is not the machine is an error, not a retry', async () => {
  const s = sched(2);
  let n = 0;
  const r = await s.run(task('leaf', async () => { n++; return { run: { result: 'fail', failures: [{ got: 'control not found: Done' }] } }; }));
  assert.equal(n, 1);
  assert.equal(r.retried, undefined);
  let m = 0;
  const e = await s.run(task('visit', async () => { m++; throw new Error('TypeError: boom'); }));
  assert.equal(m, 1);
  assert.match(e.error, /boom/);
  let k = 0;
  const t = await s.run(task('visit', async () => { k++; if (k === 1) throw new Error('page.goto: Timeout 30000ms exceeded.'); return { ok: true }; }));
  assert.equal(k, 2, 'a thrown navigation timeout is a machine error: retried once');
  assert.equal(t.ok, true);
});

test('scheduler: a machine error halves how many run at once', async () => {
  const s = sched(4);
  await s.run(task('visit', async () => ({ machine: 'navigation-timeout', error: 'page.goto: Timeout' })));
  assert.equal(s.limit, 2);
});

test('scheduler: after a machine error halves it, a run of clean tasks brings it back one at a time, never above its workers', async () => {
  const s = sched(4);
  await s.run(task('visit', async () => ({ machine: 'net-error', error: 'net::ERR_NO_BUFFER_SPACE' })));
  assert.equal(s.limit, 2);
  for (let i = 0; i < 32; i++) await s.run(task('visit', async () => ({ ok: true })));
  assert.equal(s.limit, 3);
  for (let i = 0; i < 200; i++) await s.run(task('visit', async () => ({ ok: true })));
  assert.equal(s.limit, 4);
});
