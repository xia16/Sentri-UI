// Field cards (candidate, ADR 0001): the Numpad's string rules, scan and wedge-burst handling.
// Run: node --test tests/field-cards.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
require('../ux/design-system/components/bundle.js');
const UI = globalThis.SentriUI;
const TAG = { maxLength: 6 };
const W = { decimals: 2, intLength: 2 };
const keys = (state, list, o) => list.reduce((s, k) => UI.numpadInput(s, k, o), state);

test('typed 12 then scan 000254 → 000254 (replacement, not append)', () => {
  const typed = keys({ value: '' }, ['1', '2'], TAG);
  assert.equal(typed.value, '12');
  const r = UI.numpadScan(typed, '000254', TAG);
  assert.equal(r.value, '000254');
  assert.equal(r.scanned, true);
  assert.equal(r.suggested, false);
});

test('a full typed tag then a scan is replaced', () => {
  const full = keys({ value: '' }, ['0', '0', '0', '2', '5', '9'], TAG);
  assert.equal(full.value, '000259');
  assert.equal(UI.numpadInput(full, '7', TAG).dead, 'full');
  assert.equal(UI.numpadScan(full, '000254', TAG).value, '000254');
});

test('a scan replaces an untouched suggestion', () => {
  const r = UI.numpadScan({ value: '000258', suggested: true, suggestion: '000258' }, '000254', TAG);
  assert.deepEqual([r.value, r.suggested], ['000254', false]);
});

test('an invalid scan keeps the state and says why', () => {
  const s = { value: '12' };
  for (const bad of ['00025', '0002544', '00A254', '']) {
    const r = UI.numpadScan(s, bad, TAG);
    assert.equal(r.value, '12');
    assert.equal(r.dead, 'scan');
  }
});

test('⌫ on a suggestion turns it into typed ink minus its last digit', () => {
  const r = UI.numpadInput({ value: '000258', suggested: true, suggestion: '000258' }, 'back', TAG);
  assert.deepEqual([r.value, r.suggested], ['00025', false]);
});

test('clearing reaches a stable empty; the suggestion returns only through the named transition', () => {
  let s = { value: '000258', suggested: true, suggestion: '000258' };
  for (let i = 0; i < 6; i++) s = UI.numpadInput(s, 'back', TAG);
  assert.deepEqual([s.value, s.suggested, s.dead], ['', false, null]);
  s = UI.numpadInput(s, 'back', TAG);
  assert.deepEqual([s.value, s.suggested, s.dead], ['', false, 'empty']);
  s = UI.numpadInput(s, 'suggestion', TAG);
  assert.deepEqual([s.value, s.suggested], ['000258', true]);
});

test('the first digit replaces a suggestion', () => {
  const r = UI.numpadInput({ value: '000258', suggested: true, suggestion: '000258' }, '1', TAG);
  assert.deepEqual([r.value, r.suggested], ['1', false]);
});

test('weights: "." first gives 0., a leading zero is stripped, places and whole digits cap', () => {
  assert.equal(keys({ value: '' }, ['.'], W).value, '0.');
  assert.equal(keys({ value: '' }, ['0', '7'], W).value, '7');
  const r = keys({ value: '' }, ['1', '2'], W);
  assert.equal(UI.numpadInput(r, '3', W).dead, 'full');
  const d = keys({ value: '' }, ['1', '.', '4', '2'], W);
  assert.equal(UI.numpadInput(d, '9', W).dead, 'full');
  assert.equal(UI.numpadInput(d, '.', W).dead, 'point');
});

test('tags keep leading zeros, and the value is always a string', () => {
  const r = keys({ value: '' }, ['0', '0', '0', '2'], TAG);
  assert.equal(r.value, '0002');
  assert.equal(typeof r.value, 'string');
});

test('commit: 16. → 16, empty → null (missing), weights lose leading zeros, tags keep them', () => {
  assert.equal(UI.numpadCommit('16.', { decimals: 1 }), '16');
  assert.equal(UI.numpadCommit('', {}), null);
  assert.equal(UI.numpadCommit('07.5', { decimals: 2 }), '7.5');
  assert.equal(UI.numpadCommit('000254', {}), '000254');
});

// A fake clock for the burst detector.
function clock() {
  let t = 0, q = [];
  return {
    now: () => t,
    later: (f, ms) => { const h = { f, at: t + ms }; q.push(h); return h; },
    cancel: h => { q = q.filter(x => x !== h); },
    tick(ms) { t += ms; const due = q.filter(x => x.at <= t); q = q.filter(x => x.at > t); due.forEach(x => x.f()); }
  };
}
const ev = key => ({ key });

test('a wedge burst (fast digits + Enter) is one scan, never typed', () => {
  const c = clock(), typed = [], scans = [];
  const s = UI.numpadScanner({ onKey: k => typed.push(k), onScan: v => scans.push(v), ...c });
  for (const k of '000254') { s.handle(ev(k)); c.tick(10); }
  s.handle(ev('Enter'));
  c.tick(100);
  assert.deepEqual(scans, ['000254']);
  assert.deepEqual(typed, []);
});

test('human keystrokes are released as ordinary keys, and Enter never commits', () => {
  const c = clock(), typed = [], scans = [];
  const s = UI.numpadScanner({ onKey: k => typed.push(k), onScan: v => scans.push(v), ...c });
  for (const k of '12') { s.handle(ev(k)); c.tick(200); }
  s.handle(ev('Enter'));
  c.tick(200);
  assert.deepEqual(typed, ['1', '2']);
  assert.deepEqual(scans, []);
});

test('typed 12, then a burst: the burst replaces through numpadScan', () => {
  const c = clock();
  let state = { value: '' };
  const s = UI.numpadScanner({
    onKey: k => { state = UI.numpadInput(state, k, TAG); },
    onScan: v => { state = UI.numpadScan(state, v, TAG); },
    ...c
  });
  for (const k of '12') { s.handle(ev(k)); c.tick(200); }
  for (const k of '000254') { s.handle(ev(k)); c.tick(8); }
  s.handle(ev('Enter'));
  assert.equal(state.value, '000254');
});
