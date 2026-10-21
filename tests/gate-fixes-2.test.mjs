// Gate fixes the Codex blind audit found and PR 260 left (2026-10-21): coverage compares assertion contracts, not counts; a required
// run that could not render its language blocks and is never stored; a confirming run is compared failure by failure.
import test from 'node:test';
import assert from 'node:assert/strict';
import { coverageLost, confirmLeaf, reusableLeaf, firstRun, CONFIRMED } from '../scripts/loop-rules.mjs';

const spec = (...leaves) => ({ tree: [{ type: 'state', id: 'st', reset: { url: '/p.html' }, children: leaves }] });
const leaf = (id, visible = [], record = [], extra = {}) => ({ type: 'outcome', id, visible, record, ...extra });
const side = (...leaves) => ({ runner: true, specs: { f: spec(...leaves) } });
const lost = (b, c, rewritten) => coverageLost(side(b), side(c), rewritten);

test('a kept leaf whose assertion is made vacuous loses coverage, whatever the count (audit: window.saved === true became true)', () => {
  const base = leaf('l1', [], [{ expr: 'window.saved === true' }]);
  assert.deepEqual(lost(base, leaf('l1', [], [{ expr: 'true' }])), ['f: leaf l1 asserts nothing: {"expr":"true"} (was {"expr":"window.saved === true"})']);
  for (const expr of ['1', '!0', "'yes'", '(true)', 'window.saved === true || true']) assert.equal(lost(base, leaf('l1', [], [{ expr }])).length, 1, expr);
  assert.equal(lost(leaf('l1', [{ el: '.saved' }]), leaf('l1', [{ el: 'body' }])).length, 1, 'any page has a body');
  assert.equal(lost(leaf('l1', [{ text: 'Saved' }]), leaf('l1', [{ text: ' ' }])).length, 1, 'every page has no text at all in it');
});

test('a kept assertion on the same target made weaker loses coverage: its hard tag, its Chinese, its state, its scope, clipping', () => {
  const w = (b, c) => lost(leaf('l1', [b]), leaf('l1', [c]));
  assert.match(w({ text: 'Saved', hard: 'wrong-fact' }, { text: 'Saved' })[0], /drops hard wrong-fact/);
  assert.match(w({ text: { en: 'Saved', zh: '已保存' } }, { text: 'Saved' })[0], /no longer checks zh/);
  assert.match(w({ el: '[data-action=lock]', is: 'disabled' }, { el: '[data-action=lock]' })[0], /disabled → present/);
  assert.match(w({ text: 'Saved', in: 'sheet' }, { text: 'Saved' })[0], /looks in the phone, not sheet/);
  assert.match(w({ text: 'Saved', absent: true }, { text: 'Saved', absent: true, in: 'sheet' })[0], /looks for its absence only in sheet/);
  assert.deepEqual(lost(leaf('l1', [{ text: 'a' }]), leaf('l1', [{ text: 'a' }], [], { clip: false })), ['f: leaf l1 no longer checks clipping (clip: false)']);
  assert.deepEqual(lost(leaf('l1', [{ text: 'a' }], [], { widths: [360, 390] }), leaf('l1', [{ text: 'a' }], [], { widths: [390] })), ['f: leaf l1 runs at fewer widths or languages (en-360 no longer)']);
});

test('a design change that rewrites an assertion is kept coverage, listed; a stronger or reworded one is simply kept', () => {
  const rewritten = [];
  // #258: the badge became an icon, so "Saved work" left the screen and the leaf checks the icon instead
  assert.deepEqual(lost(leaf('l1', [{ text: 'Saved work' }, { el: '.task-sync' }]), leaf('l1', [{ el: '.task-sync-icon' }, { el: '.task-sync' }]), rewritten), []);
  assert.deepEqual(rewritten, ['f: leaf l1 no longer asserts {"text":"Saved work"}']);
  const none = [];
  assert.deepEqual(lost(leaf('l1', [{ text: 'Saved', says: 'old words' }]), leaf('l1', [{ text: 'Saved', says: 'new words', hard: 'wrong-fact', in: 'sheet' }]), none), [], 'prose, a hard tag and a narrower scope only strengthen it');
  assert.deepEqual(lost(leaf('l1', [{ text: 'Saved' }]), leaf('l1', [{ text: { en: 'Saved', zh: '已保存' } }]), none), []);
  assert.deepEqual(lost(leaf('l1', [{ el: '.x' }]), leaf('l1', [{ el: '.x', is: 'enabled' }]), none), []);
  assert.deepEqual(none, []);
  assert.deepEqual(lost(leaf('l1', [], [{ expr: 'true' }]), leaf('l1', [], [{ expr: 'true' }])), [], "a vacuous assertion main already has is main's, not this change's");
});

test('a confirming run is compared failure by failure: a different failure is unstable, and one that could not run blocks', () => {
  const failing = (...fs) => ({ run: { result: 'fail', failures: fs } });
  const saved = { what: 'saved', contract: 'c1', category: 'wrong-record' }, sheet = { what: 'sheet open', contract: 'c2', category: 'wrong-state' };
  assert.deepEqual(confirmLeaf(failing(saved), failing({ ...saved, got: 'another value' })), { store: true, unstable: false }, 'the same contract broken the same way');
  assert.deepEqual(confirmLeaf(failing(saved), failing(sheet)), { store: false, unstable: true, why: 'failed differently' });
  assert.equal(confirmLeaf(failing(saved), failing(saved, sheet)).unstable, true, 'a second failure the first run did not have');
  assert.equal(confirmLeaf(failing({ what: 'run' }), failing({ what: 'tap Save' })).unstable, true, 'without a contract, by what failed');
  for (const y of [{ machine: 'navigation-timeout' }, { error: 'browser closed' }, undefined]) {
    const c = confirmLeaf(failing(saved), y);
    assert.equal(c.store, false, 'never stored as confirmed');
    assert.equal(c.unstable, false, 'not unstable: it never disagreed');
    assert.match(c.blocked, /its confirming run could not run/);
  }
});

test('a required run that could not render its language blocks and is never stored or reused; a decision-blocker is a row, not a run', () => {
  assert.deepEqual(firstRun({ result: 'pass' }), { store: true });
  assert.deepEqual(firstRun({ result: 'fail' }), { confirm: true });
  const zh = { lang: 'zh', width: 360, result: 'blocked', notes: ['no zh rendering: ?lang=zh is ignored (no "返回")'] };
  assert.deepEqual(firstRun(zh), { blocked: 'could not run (no zh rendering: ?lang=zh is ignored (no "返回"))' });
  assert.equal(reusableLeaf({ run: zh }), false, 'a stored blocked run (written before 2026-10-21) is run again');
  assert.equal(reusableLeaf({ run: { result: 'pass' } }), true);
  assert.equal(reusableLeaf({ run: { result: 'fail' }, confirmed: CONFIRMED }), true);
});

test('a closed scheduler launches nothing more: queued tasks and retries settle, a running task\'s crash is not retried', async () => {
  const { createScheduler } = await import('../scripts/scheduler.mjs');
  const events = [];
  let n = 0;
  const playwright = () => ({ chromium: { launch: async () => { const i = n++; events.push(`launch ${i}`); let up = true; return { isConnected: () => up, close: async () => { up = false; events.push(`close ${i}`); } }; } } });
  const sched = createScheduler({ playwright, workers: 1 });
  let release;
  const first = sched.run({ kind: 'state', label: 'a', run: async ({ browser }) => { await new Promise((r) => { release = r; }); return browser.isConnected() ? { ok: true } : { machine: 'browser-crash' }; } });
  const second = sched.run({ kind: 'state', label: 'b', run: async () => ({ ok: true }) });
  while (!release) await new Promise((r) => setTimeout(r, 5));
  const closing = sched.close();
  release();
  await closing;
  const [a, b] = await Promise.all([first, second]);
  assert.ok(a.machine && !a.retried, 'the running task\'s crash is reported, not retried in a new browser');
  assert.match(b.error, /stopped/, 'the queued task never runs');
  await sched.drained();
  assert.deepEqual(events, ['launch 0', 'close 0']);
  await assert.rejects(sched.browser(), /closed/);
});

test('Codex review round 1: a contract is compared at every depth, and a failure confirmed under the old rule is run again', () => {
  const zh = leaf('l1', [{ text: { en: 'Saved', zh: '已保存' } }]);
  assert.match(lost(zh, leaf('l1', [{ text: { en: 'Saved' } }]))[0] || '', /no longer checks zh/, 'zh dropped from the object');
  assert.match(lost(zh, leaf('l1', [{ text: { en: '', zh: '已保存' } }]))[0] || '', /asserts nothing/, 'English emptied inside the object');
  assert.equal(reusableLeaf({ run: { result: 'fail' }, confirmed: true }), false, 'confirmed: true may be a different second failure');
  assert.equal(reusableLeaf({ run: { result: 'fail' }, confirmed: CONFIRMED }), true);
});
