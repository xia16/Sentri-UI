// A shared change's scoped reach, propagation pairs and the library check (owner ruling, 2026-10-20; scripts/loop-rules.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { IN_PROGRESS, readInProgress, ownFeatures, scopeReach, componentScope, variantCalls, exportStamps, readLibrary, libraryProblems, newExportProblems, mergeLibrary, checkVerdict, carryJudgements, resultsBlock } from '../scripts/loop-rules.mjs';
import { bundleShape } from '../scripts/bundle-graph.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

test('the in-progress list is read from features/_in-progress.json, and names real features', () => {
  const list = readInProgress(fs.readFileSync(path.join(root, IN_PROGRESS), 'utf8'));
  assert.deepEqual(list, ['farrowing', 'piglet-processing']);
  for (const f of list) assert.ok(fs.existsSync(path.join(root, 'features', f, 'feature.json')), `${f} is a feature`);
  assert.equal(readInProgress('not json'), null, 'unreadable: nothing is scoped');
  assert.equal(readInProgress('{"features":"farrowing"}'), null);
  assert.equal(readInProgress('{"features":[""]}'), null);
});

test("the PR's own features: its features/<id>/ files, its scope, and the one feature of a page file only it loads", () => {
  const all = new Set(['farrowing', 'inspection', 'wean']);
  const users = { 'ux/system/wean.js': new Set(['wean']), 'ux/system/farrowing.js': new Set(['farrowing', 'farrowing-record']), 'ux/system/astra-surfaces.js': new Set(['farrowing', 'inspection']), 'atlas/atlas.json': all, 'ux/laws/strings.json': all, 'ux/design-system/components/task-skeleton.js': all, 'ux/system/surfaces.css': all };
  const own = (files, scope) => ownFeatures({ files, scope, usersOf: (f) => users[f] });
  assert.deepEqual(own(['ux/design-system/components/bundle.css', 'features/move/feature.json']), ['move']);
  assert.deepEqual(own(['ux/design-system/components/bundle.js', 'ux/system/farrowing.js']), ['farrowing', 'farrowing-record'], 'a page file two features load, and nothing names a feature: every loader is its own (the safe fallback)');
  assert.deepEqual(own(['ux/system/astra-surfaces.js']), ['farrowing', 'inspection']);
  assert.deepEqual(own(['ux/system/astra-surfaces.js'], ['inspection']), ['inspection'], 'a scope names the feature, so a shared page file owns no other');
  assert.deepEqual(own(['ux/system/astra-surfaces.js', 'features/farrowing/budget.md']), ['farrowing'], 'so does a features/<id>/ file');
  assert.deepEqual(own(['ux/system/wean.js']), ['wean'], 'a page file one feature loads is that feature\'s');
  assert.deepEqual(own(['ux/system/farrowing.js', 'features/farrowing/critique.md']), ['farrowing'], 'the PR names its feature by its folder');
  assert.deepEqual(own(['atlas/atlas.json', 'ux/laws/strings.json', 'ux/design-system/components/task-skeleton.js', 'ux/system/surfaces.css']), [], 'the shared parts own no feature');
  assert.deepEqual(own(['features/_in-progress.json']), [], 'the list is not a feature');
  assert.deepEqual(own([], ['wean', 'design-system']), ['wean']);
});

test('a shared change keeps its own features in full, the in-progress ones as propagation, and drops the rest', () => {
  const featureOf = (id) => id.split('.')[0];
  const reach = new Set(['farrowing.room', 'farrowing.end', 'move.pick', 'wean.list', 'inspection.room', 'inspection.pen', 'ds:Row/navigation', 'ds:Sheet/page']);
  const r = scopeReach({ reach, featureOf, own: ['move'], inProgress: ['farrowing', 'piglet-processing'], keepPage: (id) => id.startsWith('ds:Row/') });
  assert.deepEqual([...r.keep].sort(), ['ds:Row/navigation', 'farrowing.end', 'farrowing.room', 'move.pick']);
  assert.deepEqual([...r.propagation].sort(), ['farrowing.end', 'farrowing.room']);
  assert.deepEqual(r.outOfScope, { screens: 3, features: ['inspection', 'wean'], componentPages: 1 });
  // an own feature that is also in progress is judged in full
  assert.deepEqual([...scopeReach({ reach, featureOf, own: ['farrowing'], inProgress: ['farrowing'] }).propagation], []);
  // no readable list: the whole reach, judged in full, as before
  const all = scopeReach({ reach, featureOf, own: [], inProgress: null });
  assert.equal(all.keep.size, reach.size);
  assert.equal(all.propagation.size, 0);
});

test("a component page's variant names the exports it calls, through an alias too; any other use is unbounded", () => {
  assert.deepEqual(variantCalls(`var UI = window.SentriUI;\nUI.row({}) + SentriUI.rowGroup(x) + SentriUI['sheet']()`), ['SentriUI.row', 'SentriUI.rowGroup', 'SentriUI.sheet']);
  assert.deepEqual(variantCalls('<div data-state="Default"></div>'), []);
  assert.equal(variantCalls('render(SentriUI)'), null);
  assert.equal(variantCalls('const k = "row"; SentriUI[k]()'), null);
  assert.equal(variantCalls('var UI = SentriUI || {}; UI.row()'), null);
});

test("a shared change keeps the component pages of the parts it touches or calls; CSS can't be narrowed", () => {
  const variants = { 'Row/navigation': 'SentriUI.rowGroup(SentriUI.row({}))', 'Sheet/page': 'SentriUI.sheet({})', 'Toast/default': 'render(SentriUI)' };
  const readVariant = (c, v) => variants[`${c}/${v}`] ?? null;
  const stamps = new Map([['SentriUI.row', ['Row']], ['SentriUI.sheet', ['Sheet']], ['SentriUI.toast', ['Toast']]]);
  const js = componentScope({ files: ['ux/design-system/components/bundle.js'], change: { all: false, exports: ['SentriUI.row'] }, stamps, readVariant });
  assert.equal(js.narrow, true);
  assert.deepEqual([...js.touched], ['SentriUI.row']);
  assert.equal(js.keepPage('ds:Row/navigation'), true, 'its variant calls a touched export');
  assert.equal(js.keepPage('ds:Sheet/page'), false, 'it calls none');
  assert.equal(js.keepPage('ds:Toast/default'), true, 'its calls can\'t be bounded');
  assert.equal(js.keepPage('ds:Gone/x'), true, 'no variant file to read: kept');
  // the component's own folder: its pages, and every export that draws it
  const folder = componentScope({ files: ['ux/design-system/components/bundle.js', 'ux/design-system/components/Sheet/variants/page.html'], change: { all: false, exports: [] }, stamps, readVariant });
  assert.deepEqual([...folder.touched], ['SentriUI.sheet']);
  assert.equal(folder.keepPage('ds:Sheet/page'), true);
  assert.equal(folder.keepPage('ds:Row/navigation'), false);
  // the stylesheet, or a bundle the graph can't narrow: every page
  assert.equal(componentScope({ files: ['ux/design-system/components/bundle.css'], stamps, readVariant }).keepPage('ds:Sheet/page'), true);
  assert.equal(componentScope({ files: ['ux/design-system/components/bundle.js'], change: { all: true, exports: [] }, stamps, readVariant }).keepPage('ds:Sheet/page'), true);
});

const BUNDLE = (extra = '', exp = '') => `(function(root){'use strict';
  function row(o){return '<div data-ds="Row">'+o.title+'</div>';}
  function sheetFooter(){return '<footer data-ds="Sheet"></footer>';}
  function announce(t){return t;}
  ${extra}
  const api=Object.freeze({row,sheetFooter,announce${exp}});
  root.SentriUI=api;
})(globalThis);`;

test('each export stamps the components it draws (data-ds), the cheap map from exports to parts', () => {
  const st = exportStamps(bundleShape(BUNDLE()));
  assert.deepEqual(st.get('SentriUI.row'), ['Row']);
  assert.deepEqual(st.get('SentriUI.sheetFooter'), ['Sheet']);
  assert.deepEqual(st.get('SentriUI.announce'), []);
  assert.equal(exportStamps(null).size, 0);
});

test("main's library is organised: every component folder is grouped or retired", () => {
  const lib = readLibrary(root);
  assert.ok(lib.folders.length >= 40, 'the folders are read');
  assert.deepEqual(libraryProblems(lib), []);
  assert.ok(lib.folders.find((f) => f.name === 'TaskHold').retired, 'TaskHold is retired by its gate.json');
});

test('a component folder outside every group, or a new export with no grouped home, fails the library check', () => {
  const groups = [{ group: 'Base', components: ['Row', 'Sheet'] }];
  const folders = [{ name: 'Row', component: true, readme: 'Row. `rowGrid(tiles)` lays tiles.' }, { name: 'Sheet', component: true, readme: '' }, { name: 'Search', component: true, readme: '' }, { name: 'Old', component: true, retired: true }, { name: 'Cover', component: false }];
  assert.deepEqual(libraryProblems({ groups, folders }), ['Search: in no group of _groups.json and not retired (gate.json "status": "retired")']);
  assert.deepEqual(libraryProblems({ groups: null, folders }), ['ux/design-system/components/_groups.json is unreadable']);
  const before = new Set(exportStamps(bundleShape(BUNDLE())).keys());
  const after = exportStamps(bundleShape(BUNDLE(`function rowGrid(t){return t.join('');}\n  function searchBar(){return '<div data-ds="Search"></div>';}\n  function chip(){return '<b data-ds="Row"></b>';}\n  function helper(){return 1;}`, ',rowGrid,searchBar,chip,helper')));
  const p = newExportProblems({ before, after, library: { groups, folders } });
  assert.equal(p.length, 2, p.join(' | '));
  assert.match(p[0], /^SentriUI\.searchBar is new and belongs to no grouped component/);
  assert.match(p[1], /^SentriUI\.helper is new/);
  // rowGrid is named in Row's README; chip stamps Row; the old exports are not new
});

// ---------- propagation pairs in the verdict ----------
const mp = (screen, lang, width, extra = {}) => ({ screen, lang, width, kind: 'changed', pct: 1.2, file: `pairs/${screen}/${lang}-${width}.png`, ...extra });
const prop = (screen, lang = 'en', width = 390, extra = {}) => mp(screen, lang, width, { propagation: true, ...extra });
const mech = (pairs, extra = {}) => ({ pass: true, outcome: 'pass', candidate: 'c1', base: 'b1', mode: 'normal', class: { effective: 'shared' },
  screens: { diff: [...new Set(pairs.map((p) => p.screen))].map((id) => ({ id })), new: [], gone: [] }, pairs, ...extra });
const said = (screen, verdict, lang = 'en', width = 390) => ({ screen, lang, width, verdict, why: 'x' });

test('a propagation pair is judged propagated or broken, never better or worse, and broken fails', () => {
  const m = mech([mp('ds:Row/navigation', 'en', 390), prop('farrowing.room')]);
  assert.deepEqual(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [said('ds:Row/navigation', 'better'), said('farrowing.room', 'propagated')] }, m).problems, []);
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [said('ds:Row/navigation', 'better'), said('farrowing.room', 'better')] }, m).problems.join(), /propagation pair .*propagated or broken, not "better"/);
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [said('ds:Row/navigation', 'better'), said('farrowing.room', 'broken')] }, m).problems.join(), /worse or failed pair/);
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [said('ds:Row/navigation', 'propagated'), said('farrowing.room', 'propagated')] }, m).problems.join(), /ds:Row\/navigation .*not "propagated"/);
});

test('propagation pairs never count toward "at least one better": the ds: page (or an own screen) carries it', () => {
  const m = mech([mp('ds:Row/navigation', 'en', 390), prop('farrowing.room')]);
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [said('ds:Row/navigation', 'same'), said('farrowing.room', 'propagated')] }, m).problems.join(), /same is not enough/);
  // only propagation pairs moved: the change shows on no page of its own
  const only = mech([prop('farrowing.room'), prop('farrowing.room', 'en', 360)]);
  assert.match(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [said('farrowing.room', 'propagated'), said('farrowing.room', 'propagated', 'en', 360)] }, only).problems.join(), /only propagation pairs moved/);
  // a pixel-identical propagation run may still be broken (the old look showing), so it is not forced to "same"
  const still = mech([mp('ds:Row/navigation', 'en', 390), prop('farrowing.room', 'zh', 360, { pct: 0 })]);
  assert.deepEqual(checkVerdict({ pass: true, candidate: 'c1', base: 'b1', pairs: [said('ds:Row/navigation', 'better'), said('farrowing.room', 'propagated', 'zh', 360)] }, still).problems, []);
});

test('a change that touches a component needs the library fit; extend-existing fails, restructure-needed names the restructure', () => {
  const m = mech([mp('ds:Row/navigation', 'en', 390)], { library: { required: true } });
  const v = (library) => ({ pass: true, candidate: 'c1', base: 'b1', pairs: [said('ds:Row/navigation', 'better')], ...(library ? { library } : {}) });
  assert.match(checkVerdict(v(), m).problems.join(), /needs "library"/);
  assert.match(checkVerdict(v({ fit: 'great' }), m).problems.join(), /not fit "great"/);
  assert.deepEqual(checkVerdict(v({ fit: 'ok', note: '' }), m).problems, []);
  assert.match(checkVerdict(v({ fit: 'extend-existing', note: 'a second footer beside Sheet footer' }), m).problems.join(), /extend-existing/);
  assert.match(checkVerdict(v({ fit: 'restructure-needed', note: ' ' }), m).problems.join(), /must name the restructure/);
  assert.deepEqual(checkVerdict(v({ fit: 'restructure-needed', note: 'fold pickerFooter into Sheet footer' }), m).problems, []);
  assert.deepEqual(checkVerdict(v(), mech([mp('ds:Row/navigation', 'en', 390)])).problems, [], 'no component touched: no library fit asked');
});

test("the library fit of split verdicts is the worst part's, and it carries across a main move", () => {
  assert.deepEqual(mergeLibrary([{ library: { fit: 'ok' } }, { library: { fit: 'restructure-needed', note: 'merge footers' } }, {}]), { fit: 'restructure-needed', note: 'merge footers' });
  assert.equal(mergeLibrary([{}, {}]), undefined);
  assert.equal(mergeLibrary([{ library: { fit: 'ok' } }, { library: { fit: 'nonsense' } }]).fit, 'nonsense', 'an unknown fit wins, so checkVerdict names it');
  const old = { mech: { candidate: 'c1', base: 'b1', pairs: [] }, parts: [{ candidate: 'c1', base: 'b1', pass: true, pairs: [], library: { fit: 'ok', note: 'Row variant' } }] };
  assert.deepEqual(carryJudgements(old, { candidate: 'c2', base: 'b2', pairs: [], screens: { gone: [] } }).carried.library, { fit: 'ok', note: 'Row variant' });
});

test('the Results block says in one line what a shared change left unchecked', () => {
  const md = resultsBlock({ outcome: 'pass', candidate: 'c1', base: 'b1', class: { effective: 'shared' }, checks: [], ownFeatures: ['move'], inProgress: ['farrowing', 'piglet-processing'],
    outOfScope: { screens: 120, features: ['inspection', 'wean', 'treat'], componentPages: 0 }, pairs: [prop('farrowing.room'), mp('move.pick', 'en', 390)], propagation: [{ screen: 'farrowing.room', uses: [], notUsingShared: true }] });
  assert.match(md, /- Scope: checked in full on move and the component pages; propagation only on farrowing, piglet-processing \(in progress\); 120 screens in 3 features not checked: not in progress/);
  assert.match(md, /- Propagation: 1 pair\(s\) checked by the machine; calls none of the changed exports \(a local copy\?\): farrowing.room/);
  assert.doesNotMatch(resultsBlock({ outcome: 'pass', checks: [] }), /Scope:/);
});

test('readLibrary reads a library folder by folder', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lib-'));
  try {
    const c = path.join(dir, 'ux/design-system/components');
    fs.mkdirSync(path.join(c, 'Row/variants'), { recursive: true });
    fs.mkdirSync(path.join(c, 'Gone'), { recursive: true });
    fs.mkdirSync(path.join(c, 'pass-proof'), { recursive: true });
    fs.writeFileSync(path.join(c, 'Gone/gate.json'), '{"status":"retired"}');
    fs.writeFileSync(path.join(c, '_groups.json'), '[{"group":"Base","components":["Row"]}]');
    const lib = readLibrary(dir);
    assert.deepEqual(lib.folders.map((f) => [f.name, f.component, f.retired]), [['Gone', true, true], ['Row', true, false]]);
    assert.deepEqual(libraryProblems(lib), []);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
