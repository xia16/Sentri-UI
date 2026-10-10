// The gate's and the polish loop's rules (scripts/loop-rules.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import { effectiveClass, classifyScreens, checkVerdict, checkGrades, worstFirst, isClean, loopStatus, touchesSystem } from '../scripts/loop-rules.mjs';

test('a change to the bundle or tokens is a shared-component change whatever was declared', () => {
  assert.deepEqual(touchesSystem(['ux/design-system/components/bundle.css', 'features/farrowing/feature.json']), ['ux/design-system/components/bundle.css']);
  const r = effectiveClass({ declared: 'presentation', files: ['ux/design-system/tokens.css'], diffs: [], scope: ['farrowing'] });
  assert.equal(r.cls, 'shared');
});

test('a changed screen outside the scope makes it shared; inside the scope it stays as declared', () => {
  const diffs = [{ id: 'farrowing.room', feature: 'farrowing' }];
  assert.equal(effectiveClass({ declared: 'behaviour', files: ['ux/system/farrowing-astra-concept.js'], diffs, scope: ['farrowing'] }).cls, 'behaviour');
  const out = effectiveClass({ declared: 'presentation', files: ['ux/system/farrowing-astra-concept.js'], diffs: [...diffs, { id: 'inspection.room', feature: 'inspection' }], scope: ['farrowing'] });
  assert.equal(out.cls, 'shared');
  assert.match(out.why.join(), /outside the scope \(inspection\)/);
});

test('the class is never lowered', () => {
  assert.equal(effectiveClass({ declared: 'shared', files: [], diffs: [], scope: ['farrowing'] }).cls, 'shared');
});

test('screens are sorted into same, changed, new, gone and broken', () => {
  const base = [{ screen: 'a', feature: 'f', ok: true }, { screen: 'b', feature: 'f', ok: true }, { screen: 'c', feature: 'f', ok: true }, { screen: 'gone', feature: 'f', ok: true }];
  const cand = [{ screen: 'a', feature: 'f', ok: true }, { screen: 'b', feature: 'f', ok: true }, { screen: 'c', feature: 'f', ok: false, error: 'timeout' }, { screen: 'new', feature: 'f', ok: true }];
  const s = classifyScreens(base, cand, (id) => ({ a: 0, b: 3.2 })[id]);
  assert.deepEqual(s.same.map((x) => x.id), ['a']);
  assert.deepEqual(s.diff.map((x) => x.id), ['b']);
  assert.deepEqual(s.broken.map((x) => x.id), ['c']);
  assert.deepEqual(s.new.map((x) => x.id), ['new']);
  assert.deepEqual(s.gone.map((x) => x.id), ['gone']);
});

const mech = { pass: true, candidate: 'c1', base: 'b1', mode: 'normal', screens: { diff: [{ id: 'farrowing.room' }], new: [] } };
const pair = (verdict, lang = 'en', width = 390) => ({ screen: 'farrowing.room', lang, width, verdict, why: 'x' });

test('a verdict passes only on this candidate, with every changed screen judged and one better', () => {
  assert.ok(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [pair('better'), pair('same', 'en', 360)] }, mech).ok);
  assert.match(checkVerdict({ pass: true, candidate: 'old', base: 'b1', pairs: [pair('better')] }, mech).problems.join(), /verdict is for old/); // R10
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [] }, mech).problems.join(), /no en-390 judgement/);
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [pair('same')] }, mech).problems.join(), /same is not enough/); // R7
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [pair('better'), pair('worse', 'zh', 360)] }, mech).problems.join(), /worse pair/);
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [pair('better')], defects: [{ what: 'values off the track' }] }, mech).problems.join(), /cold-look defect/); // R1
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [pair('better')] }, { ...mech, pass: false }).problems.join(), /mechanical gate failed/);
});

test('a refactor verdict passes only when every pair is the same', () => {
  const m = { ...mech, mode: 'refactor', screens: { diff: [], new: [] } };
  assert.ok(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [] }, m).ok);
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [pair('better')] }, m).problems.join(), /refactor/);
});

const state = (screen, scores, extra = {}) => ({ screen, scores, lost: [], hard: [], ...extra });
const full = { hierarchy: 2, alignment: 2, legibility: 2, touch: 2, state: 2 };

test('grades cover every screen, score 0-2, and give evidence for every lost point and hard failure', () => {
  assert.ok(checkGrades({ states: [state('f.a', full)] }, ['f.a']).ok);
  assert.match(checkGrades({ states: [state('f.a', full)] }, ['f.a', 'f.b']).problems.join(), /f.b is not graded/);
  assert.match(checkGrades({ states: [state('f.a', { ...full, legibility: 1 })] }, ['f.a']).problems.join(), /legibility = 1 with no evidence/);
  assert.ok(checkGrades({ states: [state('f.a', { ...full, legibility: 1 }, { lost: [{ dimension: 'legibility', what: '11px meta', shot: 'r1/f.a/en-390.png' }] })] }, ['f.a']).ok);
  assert.match(checkGrades({ states: [state('f.a', full, { hard: [{ type: 'ugly', what: 'x', shot: 'y' }] })] }, ['f.a']).problems.join(), /not one of/);
  assert.match(checkGrades({ states: [state('f.a', { ...full, touch: 3 })] }, ['f.a']).problems.join(), /must be 0, 1 or 2/);
});

test('worst first: hard failures, then the lowest total; perfect states drop out', () => {
  const order = worstFirst({ states: [
    state('ok', full),
    state('weak', { ...full, alignment: 0, legibility: 1 }),
    state('broken', full, { hard: [{ type: 'dead-end', what: 'no way back', shot: 's' }] }),
    state('meh', { ...full, legibility: 1 }),
  ] }).map((s) => s.screen);
  assert.deepEqual(order, ['broken', 'weak', 'meh']);
});

test('a round is clean with no hard failure, no defect fixed and no enhancement merged', () => {
  assert.ok(isClean({ hard: 0 }));
  assert.ok(isClean({ hard: 0, fix: { kind: 'enhancement', merged: false } })); // a rejected enhancement leaves it clean
  assert.ok(!isClean({ hard: 0, fix: { kind: 'enhancement', merged: true } }));
  assert.ok(!isClean({ hard: 0, fix: { kind: 'defect', merged: false } }));
  assert.ok(!isClean({ hard: 1 }));
});

test('the loop is done after two clean rounds with every leaf covered or blocked', () => {
  const clean = { hard: 0, leaves: { pass: 4, fail: 0, blocked: 1 } };
  assert.equal(loopStatus({ cap: 5, rounds: [{ hard: 2, fix: { kind: 'defect', merged: true } }, clean, clean] }).status, 'done');
  assert.equal(loopStatus({ cap: 5, rounds: [clean, { hard: 0, leaves: { pass: 3, fail: 1 } }] }).status, 'continue');
});

test('the loop stops incomplete at the cap, or when a round makes no progress', () => {
  const dirty = (n) => ({ hard: 1, scores: { a: n }, leaves: { fail: 1 }, fix: { kind: 'defect', merged: true } });
  assert.equal(loopStatus({ cap: 3, rounds: [dirty(1), dirty(2), dirty(3)] }).status, 'stopped');
  const stuck = { hard: 1, scores: { a: 5 }, leaves: { fail: 1 }, fix: { kind: 'defect', merged: false } };
  assert.match(loopStatus({ cap: 5, rounds: [stuck, stuck] }).why, /no progress/);
  assert.equal(loopStatus({ cap: 5, rounds: [dirty(1)] }).status, 'continue');
});
