// The gate's and the polish loop's rules (scripts/loop-rules.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import { passesWithoutJudge, aimdStep, queueAhead, newScenarioFailures, calibrationProblems, budgetProblems, critiqueProblems, pageStyling, addedLines, effectiveClass, classifyScreens, checkVerdict, checkGrades, worstFirst, isClean, loopStatus, touchesSystem, touchesTools, regressions,
  pageOf, pageAssets, sharedFiles, outcomeLeaves, coverageLost, reachOf, reachLine, timedOutOnly, lockState, scenarioDebt, ghNetworkError,
  componentPage, componentPagesOf, componentsTouched, idPath } from '../scripts/loop-rules.mjs';

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

test('there is no flaky exemption: a moved screen needs a better pair, whatever an old run calls flaky (gate v2)', () => {
  // Gate v2 visits a changed screen again on both sides: it draws its own shot again (a real change) or the gate blocks. A
  // `flaky` list left in mechanical.json by an older run changes nothing.
  const fl = { ...mech, class: { declared: 'shared' }, flaky: ['farrowing.room'] };
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [pair('same'), pair('same', 'en', 360)] }, fl).problems.join(), /same is not enough/);
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [pair('same'), pair('same', 'en', 360)] }, mech).problems.join(), /same is not enough/);
});

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
  assert.deepEqual(coverageLost(base, { runner: true, specs: { farrowing: spec(2) } }), ['farrowing has 2 outcome leaves, 3 on base', 'farrowing: leaf o2 is gone']);
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

test('clean rounds with uncovered leaves still stop at the cap; score order never hides no-progress', () => {
  const clean = { hard: 0, scores: { a: 12 }, leaves: { pass: 3, fail: 0, uncovered: 1 } };
  assert.equal(loopStatus({ cap: 2, rounds: [clean, clean] }).status, 'stopped');
  const r1 = { hard: 1, scores: { a: 8, b: 9 }, leaves: { fail: 1 }, fix: { kind: 'defect', merged: false } };
  const r2 = { hard: 1, scores: { b: 9, a: 8 }, leaves: { fail: 1 }, fix: { kind: 'defect', merged: false } };
  assert.match(loopStatus({ cap: 9, rounds: [r1, r2] }).why, /no progress/);
});

test('the shared queue holds only older shared PRs whose head has passed the gate', () => {
  const pr = (number, createdAt, extra = {}) => ({ number, createdAt, headRefOid: 'sha' + number, isDraft: false, files: [{ path: 'ux/design-system/components/bundle.css' }], statusCheckRollup: [], ...extra });
  const mine = pr(120, '2026-10-11');
  const ok = [{ context: 'sentri/gate', state: 'SUCCESS' }];
  const prs = [mine, pr(113, '2026-10-10'), pr(112, '2026-10-09', { statusCheckRollup: ok }), pr(111, '2026-10-08', { statusCheckRollup: [{ context: 'sentri/gate', state: 'FAILURE' }] }),
    pr(110, '2026-10-07', { statusCheckRollup: ok, isDraft: true }), pr(109, '2026-10-06', { statusCheckRollup: ok, files: [{ path: 'features/x/PRD.md' }] }), pr(121, '2026-10-12', { statusCheckRollup: ok })];
  assert.deepEqual(queueAhead(prs, mine).map((p) => p.number), [112]);
  assert.deepEqual(queueAhead(prs, mine, {}, (sha) => sha === 'sha113').map((p) => p.number), [113, 112]);
});

test('a feature whose screens change needs its information budget, with inventory, questions and levels', () => {
  const files = { 'features/a/budget.md': '## Inventory\n## Questions\n## Levels\n', 'features/b/budget.md': '## Inventory\n' };
  assert.deepEqual(budgetProblems(['a', 'a', 'b', 'c'], (p) => files[p] ?? null), ['b: budget.md lacks ## Questions, ## Levels', 'c: no features/c/budget.md']);
});

test('a feature whose screens change needs its critique: keep, problems, parts and self-crit', () => {
  const files = { 'features/a/critique.md': '## Keep\n## Problems\n## Parts\n## Self-crit — round 2\n', 'features/b/critique.md': '## Keep\n## Problems\n' };
  assert.deepEqual(critiqueProblems(['a', 'b', 'c'], (p) => files[p] ?? null), ['b: critique.md lacks ## Parts, ## Self-crit', 'c: no features/c/critique.md']);
});

test('visual styling added in a page is an improvised component; layout and the design system are fine', () => {
  const diff = ['+++ b/ux/system/home.css', '+.tile{padding:12px;gap:8px}', '+.tile.on{border-bottom:3px solid var(--ink)}', '+.x{font-size:11px} /* ds-exception: chart axis */',
    '+++ b/ux/system/home.js', "+  return `<div class=\"t\" style=\"display:grid;color:red\">`;", '+  el.style.marginTop = "4px";', '+  el.style.backgroundColor = "#fff";',
    '+++ b/ux/design-system/components/bundle.css', '+.st-tile{border:1px solid var(--line)}'].join('\n');
  assert.deepEqual(pageStyling(addedLines(diff)).map((p) => p.file.split('/').pop() + ' ' + p.prop), ['home.css border-bottom', 'home.css font-size', 'home.js color', 'home.js background-color']);
});

test('a judge that rates an owner-rejected calibration pair better, or skips one, is not used', () => {
  const answers = { c1: { owner: 'not-better', said: 'cluttered' }, c2: { owner: 'not-better', said: 'flat' } };
  assert.deepEqual(calibrationProblems([{ calibration: [{ pair: 'c1', verdict: 'worse' }, { pair: 'c2', verdict: 'same' }] }], answers), []);
  const bad = calibrationProblems([{ calibration: [{ pair: 'c1', verdict: 'better' }] }], answers);
  assert.equal(bad.length, 2);
  assert.match(bad[0], /c1 better/); assert.match(bad[1], /c2 not rated/);
});

// ---------- the lighter gate ----------

test('a scenario run retries only when every failure is a navigation timeout', () => {
  assert.ok(timedOutOnly([{ what: 'run', got: 'page.goto: Timeout 30000ms exceeded.' }]));
  assert.ok(timedOutOnly([{ what: 'back', got: 'page.goBack: Timeout 3000ms exceeded.' }, { what: 'run', got: 'page.waitForLoadState: Timeout 30000ms exceeded.' }]));
  assert.ok(timedOutOnly([{ what: 'run', got: 'page.goto: net::ERR_NO_BUFFER_SPACE at http://127.0.0.1:5000/ux/x.html' }]), 'a navigation the network refused is the machine');
  assert.ok(!timedOutOnly([{ what: 'run', got: 'page.evaluate: TypeError: x is undefined' }]), 'a script error is not');
  assert.ok(!timedOutOnly([]), 'a pass never retries');
  assert.ok(!timedOutOnly([{ what: 'run', got: 'page.goto: Timeout 30000ms exceeded.' }, { what: '"Done" shown', got: 'absent' }]), 'an assertion failure never retries');
  assert.ok(!timedOutOnly([{ what: 'run', got: 'page.waitForSelector: Timeout 8000ms exceeded.' }]), 'a page that never gets ready is the design');
  assert.ok(!timedOutOnly([{ what: 'tap Done', got: 'control not tappable: Done (locator.click: Timeout 2500ms exceeded.)' }]));
});

test('a GitHub call that failed on the network retries; an answer GitHub gave never does', () => {
  for (const e of ['Post "https://api.github.com/graphql": EOF', 'gh api repos/x/y/pulls/166/files failed: unexpected EOF', 'net/http: TLS handshake timeout',
    'dial tcp: lookup api.github.com: no such host', 'proxyconnect tcp: dial tcp 127.0.0.1:9: connectex: No connection could be made because the target machine actively refused it.', 'wsarecv: An existing connection was forcibly closed by the remote host (connection reset)',
    'HTTP 502: Bad Gateway (https://api.github.com/...)', 'HTTP 503', 'context deadline exceeded (Client.Timeout exceeded while awaiting headers)']) assert.ok(ghNetworkError(e), e);
  for (const e of ['HTTP 404: Not Found (https://api.github.com/repos/x/y/pulls/9)', 'HTTP 422: No commit found for SHA: abc', 'HTTP 401: Bad credentials', '', null]) assert.ok(!ghNetworkError(e), String(e));
});

test('a gate lock is free, held by a live gate, or stale when its process is gone', () => {
  assert.equal(lockState(null, () => true), 'free');
  assert.equal(lockState({ pid: 42, sha: 'abc' }, (p) => p === 42), 'held');
  assert.equal(lockState({ pid: 42, sha: 'abc' }, () => false), 'stale');
  assert.equal(lockState({ sha: 'abc' }, () => true), 'stale');
});

const reachWorld = () => {
  const screens = [
    { id: 'farrowing.room', feature: 'farrowing', url: '/ux/system/farrowing-astra-concept.html?layout=focus' },
    { id: 'move.transfer-sow', feature: 'move', url: '/ux/system/farrowing-astra-concept.html?layout=focus' },
    { id: 'inspection.room', feature: 'inspection', url: '/ux/system/inspection-astra-concept.html' },
    { id: 'piglet-processing.pens', feature: 'piglet-processing', url: '/ux/tasks/piglet-processing/simple/index.html?view=pens' },
  ];
  const assets = {
    'ux/system/farrowing-astra-concept.html': ['ux/system/astra-surfaces.js', 'ux/system/farrowing-astra-concept.js', 'ux/design-system/components/bundle.js'],
    'ux/system/inspection-astra-concept.html': ['ux/system/astra-surfaces.js', 'ux/system/inspection-astra-concept.js', 'ux/design-system/components/bundle.js'],
    'ux/tasks/piglet-processing/simple/index.html': ['ux/tasks/piglet-processing/simple/app.js', 'ux/design-system/components/bundle.js'],
  };
  return { screens, assets, shared: sharedFiles(screens, assets) };
};
const reach = (files, scope = []) => reachOf({ ...reachWorld(), files, scope });

test("reach: a page, or a file only one feature's pages load, reaches that feature; the scope is always in", () => {
  const r = reach(['ux/tasks/piglet-processing/simple/app.js'], ['piglet-processing']);
  assert.deepEqual([r.all, r.features], [false, ['piglet-processing']]);
  assert.deepEqual(reach(['ux/system/inspection-astra-concept.js']).features, ['inspection']);
  assert.deepEqual(reach(['ux/system/inspection-astra-concept.html']).features, ['inspection']);
  assert.deepEqual(reach(['ux/system/inspection-astra-concept.js'], ['farrowing']).features, ['farrowing', 'inspection']);
  assert.match(reachLine(reach(['ux/tasks/piglet-processing/simple/app.js']), 24), /^reach: 24 screen\(s\) in features piglet-processing \(ux\/tasks\/piglet-processing\/simple\/app\.js: a page of piglet-processing/);
});

test("reach: a feature's own folder reaches that feature", () => {
  assert.deepEqual(reach(['features/weaning/budget.md', 'features/weaning/scenarios.json']).features, ['weaning']);
  assert.equal(reach(['features/weaning/budget.md']).all, false);
});

test('reach: the bundle, tokens, the harness, the shooter, the atlas, packages and anything 2+ features load reach every screen', () => {
  for (const f of ['ux/design-system/components/bundle.js', 'ux/design-system/tokens.css', 'ux/system/atlas-bare.js', 'scripts/shoot-screens.mjs', 'scripts/serve-ux.cjs', 'scripts/font-route.mjs',
    'atlas/atlas.json', 'sections/mobile.json', 'package.json', 'package-lock.json', 'vendor/fonts/manifest.json',
    'ux/system/astra-surfaces.js', 'ux/system/farrowing-astra-concept.js']) assert.equal(reach([f]).all, true, f);
  assert.match(reachLine(reach(['ux/system/astra-surfaces.js']), 291), /^reach: all screens \(ux\/system\/astra-surfaces\.js: loaded by pages of 3 features\)/);
});

test('reach: a ux file no page loads by name reaches every screen, since a page may fetch it', () => {
  const r = reach(['ux/laws/strings.json', 'docs/design-workflow/README.md']);
  assert.equal(r.all, true);
  assert.match(r.why[0], /ux\/laws\/strings\.json: no page loads it by name/);
  assert.equal(reach(['ux/README.md']).all, true, 'prose inside ux/ is a ux file');
});

test('reach: docs, prose outside ux, CI, tests, agent settings and the other scripts reach no screen', () => {
  const r = reach(['docs/design-workflow/briefs/gate.md', 'README.md', 'archive/notes.md', '.github/workflows/x.yml', 'tests/loop-rules.test.mjs', '.claude/skills/design/SKILL.md', 'scripts/gate.mjs', 'scripts/check-states.mjs']);
  assert.deepEqual([r.all, r.features], [false, []]);
  assert.match(reachLine(r, 0), /^reach: no screen \(docs\/design-workflow\/briefs\/gate\.md, README\.md, archive\/notes\.md and 5 more: draws no pixel\)$/);
});

test('reach: a file nothing classes falls back to every screen, and a page that loads a script reaches its feature first', () => {
  assert.equal(reach(['references/figma/home.png']).all, true);
  assert.equal(reach(['next.config.ts']).all, true);
  const w = reachWorld();
  w.assets['ux/system/inspection-astra-concept.html'].push('scripts/inspection-data.js');
  assert.deepEqual(reachOf({ ...w, shared: sharedFiles(w.screens, w.assets), files: ['scripts/inspection-data.js'] }).features, ['inspection']);
});

test('scenarioDebt: main\'s debt only for the same leaf, width, language, assertion and failure class', () => {
  const run = (lang, width, result, failures = []) => ({ lang, width, result, failures });
  const leaf = (id, runs) => ({ id, result: runs.some((r) => r.result === 'fail') ? 'fail' : 'pass', runs });
  // a failure as the runner reports it: the assertion it broke (its contract) and how (its category); the tag is the hard class
  const fl = (what, tag = null, category = 'wrong-text') => ({ what, got: 'x', tag, contract: `c:${what}`, category: tag === 'dead-end' ? 'timeout' : category });
  const base = { leaves: [leaf('ds-a11', [run('zh', 360, 'fail', [fl('"Task 2" shown')]), run('en', 390, 'pass')])] };
  // The same failure on main is debt.
  assert.deepEqual(scenarioDebt({ leaves: [leaf('ds-a11', [run('zh', 360, 'fail', [fl('"Task 2" shown')])])] }, base), { added: [], debt: ['ds-a11'] });
  // The review's case: main fails only at zh-360, the candidate also fails at en-390. It's new, not hidden as debt.
  const both = scenarioDebt({ leaves: [leaf('ds-a11', [run('zh', 360, 'fail', [fl('"Task 2" shown')]), run('en', 390, 'fail', [fl('Done saves the record', 'lost-draft')])])] }, base);
  assert.deepEqual(both.debt, []);
  assert.equal(both.added[0].id, 'ds-a11');
  assert.match(both.added[0].why.join(), /en-390: Done saves the record/);
  // The same assertion with a different failure class is new.
  assert.equal(scenarioDebt({ leaves: [leaf('ds-a11', [run('zh', 360, 'fail', [fl('"Task 2" shown', 'dead-end')])])] }, base).added.length, 1);
  // A leaf base doesn't have, or no base report at all: the failure stands.
  assert.equal(scenarioDebt({ leaves: [leaf('new-leaf', [run('en', 390, 'fail', [fl('x')])])] }, base).added.length, 1);
  assert.equal(scenarioDebt({ leaves: [leaf('ds-a11', [run('zh', 360, 'fail', [fl('"Task 2" shown')])])] }, null).added.length, 1);
  // Passing leaves are neither.
  assert.deepEqual(scenarioDebt({ leaves: [leaf('ds-a13', [run('en', 390, 'pass')])] }, base), { added: [], debt: [] });
});

test('scenarioDebt: two unrelated failures in one leaf, language and width are not equated (review of #194)', () => {
  const run = (lang, width, failures) => ({ lang, width, result: 'fail', failures });
  const leaf = (id, runs) => ({ id, result: 'fail', runs });
  // the probe: main breaks on a missing preset, the candidate on a timeout waiting for a selector; both reported as a 'run' dead end
  const base = { leaves: [leaf('fa-1', [run('en', 390, [{ what: 'run', got: 'preset "count" is not in the page', tag: 'dead-end', contract: 'c-open', category: 'preset-missing' }])])] };
  const cand = { leaves: [leaf('fa-1', [run('en', 390, [{ what: 'run', got: 'page.waitForSelector: Timeout 8000ms exceeded.', tag: 'dead-end', contract: 'c-open', category: 'timeout' }])])] };
  const d = scenarioDebt(cand, base);
  assert.deepEqual(d.debt, []);
  assert.match(d.added[0].why.join(), /en-390: run \(timeout\)/);
  // the same contract and category is debt; either unknown, on either side, is not
  assert.deepEqual(scenarioDebt(base, base).debt, ['fa-1']);
  const unknown = { leaves: [leaf('fa-1', [run('en', 390, [{ what: 'run', got: 'x', tag: 'dead-end', contract: 'c-open', category: 'unknown' }])])] };
  assert.deepEqual(scenarioDebt(unknown, unknown).debt, [], 'unknown is never debt');
  const old = { leaves: [leaf('fa-1', [run('en', 390, [{ what: 'run', got: 'preset "count" is not in the page', tag: 'dead-end' }])])] };
  assert.deepEqual(scenarioDebt(old, old).debt, [], 'a report without fingerprints (an older runner) is never debt');
});

test('the runner classes failures by category and fingerprints the definition that failed', async () => {
  const { failureCategory, contractOf } = await import('../scripts/scenario-runner.mjs');
  assert.equal(failureCategory({ got: 'preset "count" is not in the page' }), 'preset-missing');
  assert.equal(failureCategory({ got: 'page.waitForSelector: Timeout 8000ms exceeded.' }), 'timeout');
  assert.equal(failureCategory({ got: 'control not found: Done', kind: 'step' }), 'missing-control');
  assert.equal(failureCategory({ got: 'control is covered: Done', kind: 'step' }), 'unreachable-control');
  assert.equal(failureCategory({ got: 'absent', kind: 'text' }), 'wrong-text');
  assert.equal(failureCategory({ got: 'TypeError: x', kind: 'page-error' }), 'page-error');
  assert.equal(failureCategory({ got: 'something else' }), 'unknown');
  assert.equal(contractOf({ assertion: { text: 'Saved' } }), contractOf({ assertion: { text: 'Saved' } }));
  assert.notEqual(contractOf({ assertion: { text: 'Saved' } }), contractOf({ assertion: { text: 'Done' } }));
});

// Component pages are in the gate's reach (rules ledger L23): the Headers law changed, screens were gated, and Sheet → page kept
// teaching a 21-character Chinese title because nothing shot or checked the design system's own pages.
test('a component page id names its component and variant; anything else is a screen', () => {
  assert.deepEqual(componentPage('ds:Sheet/page'), { component: 'Sheet', variant: 'page' });
  assert.equal(componentPage('farrowing.room'), null);
  assert.equal(componentPage('ds:Sheet'), null);
  assert.equal(idPath('ds:Sheet/page'), 'ds_Sheet/page');
  assert.equal(idPath('farrowing.room'), 'farrowing.room');
});

test('the component pages are the variants the atlas draws, filtered by component or id', () => {
  const atlas = { platforms: [{ components: [{ name: 'Sheet', files: { variants: ['drawer', 'page'] } }, { name: 'Banner', files: {} }, { name: 'Heading', files: { variants: ['page'] } }] }, { components: [] }] };
  const all = componentPagesOf(atlas);
  assert.deepEqual(all.map((p) => p.id), ['ds:Sheet/drawer', 'ds:Sheet/page', 'ds:Heading/page']);
  assert.equal(all[1].feature, 'design-system');
  assert.equal(all[1].url, '/atlas/index.html?view=components&component=Sheet&variant=page');
  assert.deepEqual(componentPagesOf(atlas, { components: ['Heading'] }).map((p) => p.id), ['ds:Heading/page']);
  assert.deepEqual(componentPagesOf(atlas, { screens: ['ds:Sheet/page', 'farrowing.room'] }).map((p) => p.id), ['ds:Sheet/page']);
});

test('a change edits a component when it edits a file in its own folder, not the shared bundle', () => {
  assert.deepEqual(componentsTouched(['ux/design-system/components/Sheet/variants/page.html', 'ux/design-system/components/bundle.css', 'ux/design-system/components/Sheet/README.md', 'features/farrowing/x.js']), ['Sheet']);
});

test('a moved component page is in scope for its own component, outside it for another, and never copy-only', () => {
  const files = ['ux/design-system/components/Sheet/variants/page.html'];
  const page = { id: 'ds:Sheet/page', feature: 'design-system' };
  const own = effectiveClass({ declared: 'copy', files, diffs: [page], scope: ['farrowing'] });
  assert.equal(own.outside.length, 0);
  assert.equal(own.cls, 'presentation');
  assert.match(own.why.join(), /ds:Sheet\/page/);
  assert.equal(effectiveClass({ declared: 'copy', files: [], diffs: [page], scope: ['design-system'] }).cls, 'presentation');
  const other = effectiveClass({ declared: 'presentation', files, diffs: [page, { id: 'ds:Heading/page', feature: 'design-system' }], scope: ['farrowing'] });
  assert.deepEqual(other.outside.map((d) => d.id), ['ds:Heading/page']);
  assert.equal(other.cls, 'shared');
  assert.equal(effectiveClass({ declared: 'behaviour', files, diffs: [page], scope: ['farrowing'] }).cls, 'behaviour');
  assert.equal(effectiveClass({ declared: 'copy', files, diffs: [], scope: ['farrowing'] }).cls, 'copy');
});

test('a moved component page needs a judgement like a screen, and a better one to pass', () => {
  const mech = { pass: true, candidate: 'c', base: 'b', mode: 'normal', class: { declared: 'copy' }, screens: { diff: [{ id: 'ds:Sheet/page', feature: 'design-system' }], new: [], gone: [] },
    pairs: ['390', '360'].map((w) => ({ screen: 'ds:Sheet/page', feature: 'design-system', lang: 'en', width: +w, kind: 'changed', pct: 1.2 })) };
  assert.match(checkVerdict({ pass: true, candidate: 'c', base: 'b', pairs: [] }, mech).problems.join(), /no judgement for pair ds:Sheet\/page en-390/);
  const same = mech.pairs.map((p) => ({ screen: p.screen, lang: p.lang, width: p.width, verdict: 'same' }));
  assert.match(checkVerdict({ pass: true, candidate: 'c', base: 'b', pairs: same }, mech).problems.join(), /no pair better/);
  assert.equal(checkVerdict({ pass: true, candidate: 'c', base: 'b', pairs: same.map((p) => ({ ...p, verdict: 'better' })) }, mech).ok, true);
});

test("reach: a component's own pages and notes reach the component pages, not every screen", () => {
  const r = reach(['ux/design-system/components/Sheet/variants/page.html', 'ux/design-system/components/Sheet/variants.json', 'ux/design-system/components/Sheet/README.md']);
  assert.deepEqual([r.all, r.features], [false, ['design-system']]);
  assert.match(r.why[0], /Sheet's component pages/);
  assert.equal(reach(['ux/design-system/components/bundle.css']).all, true, 'the bundle still reaches every screen');
  assert.equal(reach(['ux/design-system/components/Sheet/sheet.css']).all, true, 'any other file in the folder is unsure, so every screen');
});

test('newScenarioFailures: a leaf already failing on base is main\'s debt; one passing there, or new, is the change\'s', () => {
  const base = 'blocked  ds-a7-global-wait\nfail     ds-a11-task-layer  en-360: "Task 2" shown → absent\npass     ds-a13-home-to-task\n\ndata-sync @ c4f98e2: pass 1 · fail 1';
  assert.deepEqual(newScenarioFailures(['ds-a11-task-layer'], base), { added: [], debt: ['ds-a11-task-layer'] });
  assert.deepEqual(newScenarioFailures(['ds-a13-home-to-task', 'ds-a11-task-layer'], base), { added: ['ds-a13-home-to-task'], debt: ['ds-a11-task-layer'] });
  assert.deepEqual(newScenarioFailures(['ds-new-leaf'], base), { added: ['ds-new-leaf'], debt: [] }); // not on base: new
  assert.deepEqual(newScenarioFailures(['x'], ''), { added: ['x'], debt: [] }); // base printed nothing: the failure stands
});

test('scenario runs at once grow while runs stay fast, halve on a timeout or a slowdown, and stay between 1 and max', () => {
  let s = { limit: 2, min: 1, max: 8, baseline: null };
  const feed = (ms, n = 1, timedOut = false) => { let why = null; for (let i = 0; i < n; i++) ({ state: s, why } = aimdStep(s, { ms, timedOut })); return why; };
  feed(1000, 6);
  assert.equal(s.baseline, 1000);
  assert.equal(s.limit, 2);
  assert.match(feed(1100, 3), /1\.1x/);
  assert.equal(s.limit, 3);
  feed(1200, 3);
  assert.equal(s.limit, 4);
  feed(1400, 4);
  assert.equal(s.limit, 5);
  assert.equal(feed(2000, 5), null, 'between 1.5x and 2.5x it holds');
  assert.equal(s.limit, 5);
  assert.match(feed(3000, 5), /slowed to 3\.0x/);
  assert.equal(s.limit, 2);
  assert.match(feed(900, 1, true), /timed out/);
  assert.equal(s.limit, 1);
  assert.equal(feed(900, 1, true), null, 'never below min');
  assert.equal(s.limit, 1);
  s = { limit: 8, min: 1, max: 8, baseline: 1000 };
  feed(1000, 8);
  assert.equal(s.limit, 8, 'never above max');
});

test("a mechanical pass that moves no screen is a gate pass without a judge; anything else still needs one", () => {
  const ok = { pass: true, candidate: "c", base: "b", quick: false, screens: { diff: [], new: [], gone: [] }, pairs: [] };
  assert.equal(passesWithoutJudge(ok), true);
  assert.equal(passesWithoutJudge({ ...ok, pass: false }), false);
  assert.equal(passesWithoutJudge({ ...ok, quick: true }), false);
  assert.equal(passesWithoutJudge({ ...ok, screens: null }), false);
  assert.equal(passesWithoutJudge({ ...ok, screens: { diff: [{ id: "farrowing.pen-map" }], new: [], gone: [] } }), false);
  assert.equal(passesWithoutJudge({ ...ok, screens: { diff: [], new: [{ id: "x" }], gone: [] } }), false);
  assert.equal(passesWithoutJudge({ ...ok, screens: { diff: [], new: [], gone: [{ id: "x" }] } }), false);
  assert.equal(passesWithoutJudge({ ...ok, screens: { diff: [], new: [] } }), false);
  assert.equal(passesWithoutJudge({ ...ok, pairs: [{ screen: "x" }] }), false);
  assert.equal(passesWithoutJudge({ ...ok, candidate: "" }), false);
  assert.equal(passesWithoutJudge({ ...ok, outcome: "blocked" }), false, "gate v2: a blocked gate is never a pass");
});

// L25: motion has a held frame. The case it came from: #195 added the pen-map landing keyframes and no screen showed them.
test('motion: a keyframe a change adds or alters needs a screen that holds it', async () => {
  const { keyframesOf, unheldMotion, heldOf } = await import('../scripts/loop-rules.mjs');
  const css195 = '.x{color:red}\n@keyframes st-pen-land-act{from{background-color:var(--amber-fill)}}\n@keyframes st-pen-land-ring{from{box-shadow:0 0 0 2px var(--ink)}to{box-shadow:0 0 0 2px transparent}}';
  assert.deepEqual([...keyframesOf(css195).keys()], ['st-pen-land-act', 'st-pen-land-ring']);
  const f = 'ux/design-system/components/bundle.css';
  // #195: both new, none held: both fail
  assert.deepEqual(unheldMotion({ base: { [f]: '.x{color:red}' }, cand: { [f]: css195 } }).map((m) => m.name + ' ' + m.kind), ['st-pen-land-act new', 'st-pen-land-ring new']);
  // held by a screen: passes
  const atlas = { platforms: [{ sections: [{ features: [{ screens: [{ id: 'a', holds: ['st-pen-land-act'] }, { id: 'b', holds: ['st-pen-land-ring'] }] }] }] }] };
  assert.deepEqual(unheldMotion({ base: { [f]: '' }, cand: { [f]: css195 }, held: heldOf(atlas) }), []);
  // #196: the ring's body changed (box-shadow to outline): a change, so it needs its holding screen again
  const css196 = css195.replace('{from{box-shadow:0 0 0 2px var(--ink)}to{box-shadow:0 0 0 2px transparent}}', '{from{outline-color:var(--ink)}to{outline-color:transparent}}');
  assert.deepEqual(unheldMotion({ base: { [f]: css195 }, cand: { [f]: css196 } }).map((m) => m.name + ' ' + m.kind), ['st-pen-land-ring changed']);
  // untouched keyframes (only whitespace moved), a removed one, a page outside ux/ or in the archive: nothing to hold
  assert.deepEqual(unheldMotion({ base: { [f]: css195 }, cand: { [f]: css195.replace(/\{from/g, '{ from') } }), []);
  assert.deepEqual(unheldMotion({ base: { [f]: css195 }, cand: { [f]: '.x{color:red}' } }), []);
  assert.deepEqual(unheldMotion({ base: {}, cand: { 'atlas/atlas.css': css195, 'ux/archive/old.css': css195 } }), []);
  // nested braces inside a keyframe are read whole
  assert.equal(keyframesOf('@keyframes k{0%{a:1}50%{a:2}100%{a:3}}.y{}').get('k'), '0%{a:1}50%{a:2}100%{a:3}');
});

// L26: a leaf's failure is a design result only once it repeats. The case it came from: #197's fa-s26 failed once at en-360 (a tap
// racing a drawer), was stored by identity, and every re-gate reused it.
test('leaf: a fresh failure is stored only when a confirming run fails too; a pass after it is unstable', async () => {
  const { confirmLeaf, reusableLeaf } = await import('../scripts/loop-rules.mjs');
  const fail = { run: { result: 'fail', failures: [{ what: 'on farrowing.note' }] } }, pass = { run: { result: 'pass' } };
  assert.deepEqual(confirmLeaf(fail, fail), { store: true, unstable: false }, 'the same failure twice: a design result');
  assert.deepEqual(confirmLeaf(fail, pass), { store: false, unstable: true, why: 'passed' }, 'fa-s26: failed, then passed: unstable, stored as nothing');
  assert.equal(confirmLeaf(fail, { run: { result: 'blocked' } }).unstable, true, 'any other result is a disagreement');
  assert.deepEqual(confirmLeaf(fail, { machine: 'navigation-timeout' }), { store: false, unstable: false }, 'a lost confirming run confirms nothing');
  assert.deepEqual(confirmLeaf(fail, { error: 'boom' }), { store: false, unstable: false });
  // reuse: a pass, or a confirmed failure; never a failure stored before L26
  assert.equal(reusableLeaf({ run: { result: 'pass' } }), true);
  assert.equal(reusableLeaf({ run: { result: 'fail' }, confirmed: true }), true);
  assert.equal(reusableLeaf({ run: { result: 'fail' } }), false, 'an unconfirmed stored failure is run again');
  assert.equal(reusableLeaf(null), false);
});
