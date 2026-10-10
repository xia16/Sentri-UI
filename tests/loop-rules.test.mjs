// The gate's and the polish loop's rules (scripts/loop-rules.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import { effectiveClass, classifyScreens, checkVerdict, checkGrades, worstFirst, isClean, loopStatus, touchesSystem, touchesTools, regressions,
  pageOf, pageAssets, sharedFiles, outcomeLeaves, coverageLost } from '../scripts/loop-rules.mjs';

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

test('a screen changed at 360 or in Chinese only is changed; a run broken on the candidate breaks the screen', () => {
  const runs = (screen, ok = {}) => ['en-390', 'zh-390', 'en-360', 'zh-360'].map((t) => ({ screen, feature: 'f', lang: t.slice(0, 2), width: +t.slice(3), ok: ok[t] ?? true, error: ok[t] === false ? 'timeout' : undefined }));
  const base = [...runs('a'), ...runs('b'), ...runs('c'), ...runs('d', { 'zh-360': false })];
  const cand = [...runs('a'), ...runs('b'), ...runs('c', { 'en-360': false }), ...runs('d', { 'zh-360': false })];
  const s = classifyScreens(base, cand, (id, r) => (id === 'b' && r.lang === 'zh' && r.width === 360 ? 0.02 : 0));
  assert.deepEqual(s.diff.map((x) => [x.id, x.runs]), [['b', ['zh-360']]]);
  assert.deepEqual(s.broken.map((x) => [x.id, x.error]), [['c', 'en-360: timeout']]);
  assert.deepEqual(s.same.map((x) => x.id), ['a', 'd']); // d fails zh-360 on both sides: main's, judged on its other runs
  assert.deepEqual(s.bothBroken.map((x) => x.id), ['d']);
});

const mp = (screen, lang, width, kind = 'changed', pct = 1.5) => ({ screen, lang, width, kind, pct: kind === 'changed' ? pct : null, file: `pairs/${screen}/${lang}-${width}.png` });
const mech = { pass: true, candidate: 'c1', base: 'b1', mode: 'normal', class: { declared: 'presentation' },
  screens: { diff: [{ id: 'farrowing.room' }], new: [], gone: [] }, pairs: [mp('farrowing.room', 'en', 390), mp('farrowing.room', 'en', 360)] };
const pair = (verdict, lang = 'en', width = 390, screen = 'farrowing.room') => ({ screen, lang, width, verdict, why: 'x' });

test('a verdict passes only on this candidate, with every changed screen judged and one better', () => {
  assert.ok(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [pair('better'), pair('same', 'en', 360)] }, mech).ok);
  assert.match(checkVerdict({ pass: true, candidate: 'old', base: 'b1', pairs: [pair('better'), pair('same', 'en', 360)] }, mech).problems.join(), /verdict is for old/); // R10
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [] }, mech).problems.join(), /no judgement for pair farrowing.room en-390/);
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [pair('same'), pair('same', 'en', 360)] }, mech).problems.join(), /same is not enough/); // R7
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [pair('better'), pair('worse', 'en', 360)] }, mech).problems.join(), /worse or failed pair/);
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [pair('better'), pair('same', 'en', 360)], defects: [{ what: 'values off the track' }] }, mech).problems.join(), /cold-look defect/); // R1
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [pair('better'), pair('same', 'en', 360)] }, { ...mech, pass: false }).problems.join(), /mechanical gate failed/);
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [pair('better'), pair('same', 'en', 360)] }, { ...mech, candidate: '' }).problems.join(), /names no candidate/);
});

test('every pair the gate built needs a judgement, not only en-390', () => {
  const m = { ...mech, pairs: [mp('farrowing.room', 'en', 390), mp('farrowing.room', 'zh', 360, 'changed', 0.3), mp('farrowing.room', 'en', 360, 'changed', 0)] };
  const r = checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [pair('better'), pair('same', 'en', 360)] }, m);
  assert.deepEqual(r.problems, ['no judgement for pair farrowing.room zh-360']);
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [pair('same'), pair('same', 'zh', 360), pair('better', 'en', 360)] }, m).problems.join(), /en-360 is pixel-identical: it can only be same/);
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [pair('better'), pair('fine', 'zh', 360), pair('same', 'en', 360)] }, m).problems.join(), /better or same or worse, not "fine"/);
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [pair('better')] }, { ...mech, pairs: [] }).problems.join(), /farrowing.room moved but has no pair/);
});

test('nothing visible changed: only a behaviour change passes, on a walk where every entry is ok', () => {
  const still = { ...mech, screens: { diff: [], new: [], gone: [] }, pairs: [] };
  const v = { pass: true, candidate: 'c1', base: 'b1', pairs: [] };
  assert.match(checkVerdict(v, still).problems.join(), /no screen changed/);
  const behaviour = { ...still, class: { declared: 'behaviour', effective: 'shared' } };
  assert.match(checkVerdict(v, behaviour).problems.join(), /0 walk entries/);
  assert.ok(checkVerdict({ ...v, walk: [{ screen: 'farrowing.counting', ok: true }] }, behaviour).ok);
  assert.match(checkVerdict({ ...v, walk: [{ screen: 'farrowing.counting', ok: true }, { screen: 'farrowing.blocked' }] }, behaviour).problems.join(), /not ok/);
});

test('a new screen is judged pass or fail on every pair; one fail blocks', () => {
  const m = { ...mech, screens: { diff: [], new: [{ id: 'farrowing.end' }], gone: [] }, pairs: [mp('farrowing.end', 'en', 390, 'new'), mp('farrowing.end', 'zh', 360, 'new')] };
  assert.ok(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [pair('pass', 'en', 390, 'farrowing.end'), pair('pass', 'zh', 360, 'farrowing.end')] }, m).ok);
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [pair('pass', 'en', 390, 'farrowing.end'), pair('fail', 'zh', 360, 'farrowing.end')] }, m).problems.join(), /worse or failed pair/);
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [pair('better', 'en', 390, 'farrowing.end'), pair('pass', 'zh', 360, 'farrowing.end')] }, m).problems.join(), /one side: its verdict is pass or fail/);
});

test('a refactor verdict passes only when every pair is the same', () => {
  const m = { ...mech, mode: 'refactor', screens: { diff: [], new: [] }, pairs: [] };
  assert.ok(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [] }, m).ok);
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [pair('better')] }, m).problems.join(), /refactor/);
});

const state = (screen, scores, extra = {}) => ({ screen, scores, lost: [], hard: [], ...extra });
const full = { hierarchy: 2, alignment: 2, legibility: 2, touch: 2, state: 2, native: 2 };

test('grades cover every screen, score 0-2, and give evidence for every lost point and hard failure', () => {
  assert.ok(checkGrades({ states: [state('f.a', full)] }, ['f.a']).ok);
  assert.match(checkGrades({ states: [state('f.a', full)] }, ['f.a', 'f.b']).problems.join(), /f.b is not graded/);
  assert.match(checkGrades({ states: [state('f.a', { ...full, legibility: 1 })] }, ['f.a']).problems.join(), /legibility = 1 with no evidence/);
  assert.ok(checkGrades({ states: [state('f.a', { ...full, legibility: 1 }, { lost: [{ dimension: 'legibility', what: '11px meta', shot: 'r1/f.a/en-390.png' }] })] }, ['f.a']).ok);
  assert.match(checkGrades({ states: [state('f.a', full, { hard: [{ type: 'ugly', what: 'x', shot: 'y' }] })] }, ['f.a']).problems.join(), /not one of/);
  assert.match(checkGrades({ states: [state('f.a', { ...full, touch: 3 })] }, ['f.a']).problems.join(), /must be 0, 1 or 2/);
});

test("grades count only for their own round and its commit, against that round's screens", () => {
  const round = { n: 2, start: 'abc1234def' };
  assert.ok(checkGrades({ round: 2, commit: 'abc1234def', states: [state('f.a', full), state('f.new', full)] }, ['f.a', 'f.new'], round).ok);
  assert.match(checkGrades({ round: 2, commit: 'abc1234def', states: [state('f.a', full)] }, ['f.a', 'f.new'], round).problems.join(), /f.new is not graded/);
  assert.match(checkGrades({ round: 1, commit: 'abc1234def', states: [state('f.a', full)] }, ['f.a'], round).problems.join(), /graded as round 1, this is round 2/);
  assert.match(checkGrades({ round: 2, commit: 'old0000', states: [state('f.a', full)] }, ['f.a'], round).problems.join(), /graded on old0000, the round started on abc1234/);
  assert.match(checkGrades({ round: 2, states: [state('f.a', full)] }, ['f.a'], round).problems.join(), /graded on \(no commit\)/);
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

test('any changed pixel is a change: a 1px shift of a small element is a few dozen pixels', () => {
  const runs = [{ screen: 'a', feature: 'f', ok: true }];
  assert.equal(classifyScreens(runs, runs, () => 0.004).diff.length, 1);
  assert.equal(classifyScreens(runs, runs, () => 0).same.length, 1);
});

test('a removed screen must be accounted for and its base pairs judged, and a quick run never feeds a verdict', () => {
  const m = { ...mech, screens: { diff: [{ id: 'farrowing.room' }], new: [], gone: [{ id: 'farrowing.old' }] }, pairs: [mp('farrowing.room', 'en', 390), mp('farrowing.old', 'en', 390, 'gone')] };
  const ok = { pass: true, candidate: 'c1', base: 'b1', pairs: [pair('better'), pair('pass', 'en', 390, 'farrowing.old')] };
  assert.match(checkVerdict(ok, m).problems.join(), /farrowing.old was removed/);
  assert.ok(checkVerdict({ ...ok, gone: [{ screen: 'farrowing.old', why: 'merged into the room list' }] }, m).ok);
  assert.match(checkVerdict({ ...ok, pairs: [pair('better')], gone: [{ screen: 'farrowing.old', why: 'merged' }] }, m).problems.join(), /no judgement for pair farrowing.old en-390/);
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [pair('better'), pair('same', 'en', 360)] }, { ...mech, quick: true }).problems.join(), /--quick/);
});

test("a page's own files are read from its markup: what it loads, not what it links to", () => {
  const html = `<link rel="preconnect" href="https://fonts.gstatic.com"><link rel="stylesheet" href="../design-system/tokens.css">
    <script src="astra-surfaces.js?v=astra-consolidated-1"></script><SCRIPT SRC='/ux/design-system/components/bundle.js'></SCRIPT>
    <a href="task-overview-astra-study.html">study</a><img data-src="x.png"><script>h += '<img src="' + litterHref(f) + '">';</script>`;
  assert.deepEqual(pageAssets(html, 'ux/system/farrowing-astra-concept.html').sort(),
    ['ux/design-system/components/bundle.js', 'ux/design-system/tokens.css', 'ux/system/astra-surfaces.js']);
  assert.equal(pageOf('/ux/system/inspection-astra-concept.html?layout=focus#x'), 'ux/system/inspection-astra-concept.html');
  assert.equal(pageOf('/ux/tasks/piglet-processing/simple/'), 'ux/tasks/piglet-processing/simple/index.html');
});

test('a file pages of two or more features load is shared, and changing it is a shared change queued like the bundle', () => {
  const screens = [
    { id: 'farrowing.room', feature: 'farrowing', url: '/ux/system/farrowing-astra-concept.html?layout=focus' },
    { id: 'move.transfer-sow', feature: 'move', url: '/ux/system/farrowing-astra-concept.html?layout=focus' },
    { id: 'inspection.room', feature: 'inspection', url: '/ux/system/inspection-astra-concept.html' },
    { id: 'piglet-processing.pens', feature: 'piglet-processing', url: '/ux/tasks/piglet-processing/simple/index.html?view=pens' },
  ];
  const assets = {
    'ux/system/farrowing-astra-concept.html': ['ux/system/astra-surfaces.js', 'ux/system/farrowing-astra-concept.js'],
    'ux/system/inspection-astra-concept.html': ['ux/system/astra-surfaces.js', 'ux/system/inspection-astra-concept.js'],
    'ux/tasks/piglet-processing/simple/index.html': ['ux/tasks/piglet-processing/simple/app.js'],
  };
  const shared = sharedFiles(screens, assets);
  assert.deepEqual(shared, {
    'ux/system/astra-surfaces.js': ['farrowing', 'inspection', 'move'],
    'ux/system/farrowing-astra-concept.html': ['farrowing', 'move'],
    'ux/system/farrowing-astra-concept.js': ['farrowing', 'move'], // its page also draws move's screens
  });
  assert.deepEqual(touchesSystem(['ux/system/astra-surfaces.js', 'ux/tasks/piglet-processing/simple/app.js', 'ux/design-system/tokens.css'], shared), ['ux/system/astra-surfaces.js', 'ux/design-system/tokens.css']);
  const ec = effectiveClass({ declared: 'presentation', files: ['ux/system/astra-surfaces.js'], diffs: [], scope: ['farrowing'], shared });
  assert.equal(ec.cls, 'shared');
  assert.match(ec.why.join(), /astra-surfaces\.js \(farrowing, inspection, move\)/);
  assert.equal(effectiveClass({ declared: 'presentation', files: ['ux/tasks/piglet-processing/simple/app.js'], diffs: [], scope: ['piglet-processing'], shared }).cls, 'presentation');
});

test('a candidate that removes behaviour coverage is caught: the runner, a scenarios.json, or outcome leaves', () => {
  const leaf = (id) => ({ type: 'outcome', id });
  const spec = (n) => ({ tree: [{ type: 'entry', id: 'e', children: [{ type: 'state', id: 's', children: [...Array(n).keys()].map((i) => leaf('o' + i)).concat([{ type: 'decision-blocker', id: 'q' }]) }] }] });
  assert.equal(outcomeLeaves(spec(3)), 3);
  const base = { runner: true, specs: { farrowing: spec(3) } };
  assert.deepEqual(coverageLost(base, { runner: true, specs: { farrowing: spec(4) } }), []);
  assert.deepEqual(coverageLost(base, { runner: false, specs: { farrowing: spec(3) } }), ['scripts/run-scenarios.mjs is gone']);
  assert.deepEqual(coverageLost(base, { runner: true, specs: { farrowing: null } }), ['features/farrowing/scenarios.json is gone or unreadable']);
  assert.deepEqual(coverageLost(base, { runner: true, specs: { farrowing: spec(2) } }), ['farrowing has 2 outcome leaves, 3 on base']);
});

test("the gate's own tools and the workflow text are told apart from design files", () => {
  assert.deepEqual(touchesTools(['scripts/check-states.mjs', 'docs/design-workflow/README.md', 'ux/system/farrowing-astra-concept.js', 'tests/row-family.test.mjs']),
    ['scripts/check-states.mjs', 'docs/design-workflow/README.md']);
});

test('keep the best version: a screen that fell since the last round is reported', () => {
  assert.deepEqual(regressions({ a: 10, b: 8 }, { a: 9, b: 9, c: 4 }), [{ screen: 'a', from: 10, to: 9 }]);
});

test('the loop stops when the risk budget is spent, a screen oscillates, or hard failures keep growing', () => {
  const fix = (outcome) => ({ hard: 0, scores: { a: 8 }, leaves: { fail: 1 }, fix: { kind: 'defect', merged: true, outcome } });
  assert.match(loopStatus({ cap: 9, rounds: [fix('verified'), fix('reverted'), fix('verified')] }).why, /risk budget/);
  assert.equal(loopStatus({ cap: 9, rounds: [fix('verified'), fix('verified'), fix('best-effort')] }).status, 'continue');
  const sc = (a, hard = 1) => ({ hard, scores: { a }, leaves: { fail: 1 }, fix: { kind: 'defect', merged: true, outcome: 'verified' } });
  assert.match(loopStatus({ cap: 9, rounds: [sc(6), sc(8), sc(6)] }).why, /oscillating: a/);
  assert.match(loopStatus({ cap: 9, rounds: [sc(6, 1), sc(7, 2), sc(8, 3)] }).why, /growing/);
});
