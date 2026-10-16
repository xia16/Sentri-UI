// Lighter gate 2: the fast path for an opt-in design-system change, the defaults proof, the scenario skip
// (scripts/loop-rules.mjs fastPathOf, proveDefaults, atlasChanges, shotNeeds, scenariosSkip; briefs/gate.md "The fast path").
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fastPathOf, proveDefaults, atlasChanges, ownComponents, shotNeeds, scenariosSkip, reachOf, reachLine, sharedFiles, DS_FEATURE } from '../scripts/loop-rules.mjs';

const world = () => {
  const screens = [
    { id: 'farrowing.room', feature: 'farrowing', url: '/ux/system/farrowing-astra-concept.html?layout=focus' },
    { id: 'move.transfer-sow', feature: 'move', url: '/ux/system/farrowing-astra-concept.html?layout=focus' },
    { id: 'inspection.room', feature: 'inspection', url: '/ux/system/inspection-astra-concept.html' },
    { id: 'piglet-processing.pens', feature: 'piglet-processing', url: '/ux/tasks/piglet-processing/simple/index.html?view=pens' },
    { id: 'piglet-processing.weigh', feature: 'piglet-processing', url: '/ux/tasks/piglet-processing/simple/index.html?view=weigh' },
  ];
  const assets = {
    'ux/system/farrowing-astra-concept.html': ['ux/system/astra-surfaces.js', 'ux/system/farrowing-astra-concept.js', 'ux/system/farrowing-astra-unified.css', 'ux/design-system/tokens.css', 'ux/design-system/components/bundle.css', 'ux/design-system/components/bundle.js'],
    'ux/system/inspection-astra-concept.html': ['ux/system/astra-surfaces.js', 'ux/system/inspection-astra-concept.js', 'ux/design-system/tokens.css', 'ux/design-system/components/bundle.css', 'ux/design-system/components/bundle.js'],
    'ux/tasks/piglet-processing/simple/index.html': ['ux/tasks/piglet-processing/simple/app.js', 'ux/tasks/piglet-processing/simple/app.css', 'ux/design-system/components/bundle.css', 'ux/design-system/components/bundle.js'],
  };
  return { screens, assets, shared: sharedFiles(screens, assets) };
};
const fast = (files, scope = [], atlasDiff = null) => fastPathOf({ ...world(), files, scope, atlasDiff });
const BUNDLE = ['ux/design-system/components/bundle.css', 'ux/design-system/components/bundle.js'];
const OPT_IN = [...BUNDLE, 'ux/design-system/components/ChoiceList/variants/inline-key.html', 'ux/design-system/components/ChoiceList/variants.json', 'ux/design-system/components/ChoiceList/README.md'];

test('fast path (c): an opt-in option in the bundle used by one feature reaches that feature and the component pages; the rest is the tripwire', () => {
  const r = fast([...OPT_IN, 'ux/tasks/piglet-processing/simple/app.js', 'features/piglet-processing/critique.md', 'ux/design-system/components/index.d.ts', 'docs/design-workflow/briefs/gate.md'], ['piglet-processing']);
  assert.equal(r.eligible, true, r.why.join());
  assert.deepEqual(r.features, [DS_FEATURE, 'piglet-processing']);
  assert.deepEqual(r.own, ['ChoiceList']);
  assert.deepEqual(r.exempt, [...BUNDLE, 'ux/design-system/components/index.d.ts']);
  // what is shot: the feature in full, the component pages at both widths in EN, every other screen once at 390 EN
  const pages = [{ id: 'ds:ChoiceList/inline', feature: DS_FEATURE }, { id: 'ds:Sheet/drawer', feature: DS_FEATURE }];
  const needs = shotNeeds([...world().screens, ...pages], (s) => r.features.includes(s.feature));
  const of = (id) => needs.filter((n) => n.screen === id).map((n) => `${n.width}:${n.langs.join('+')}`);
  assert.deepEqual(of('piglet-processing.pens'), ['390:en+zh', '360:en+zh']);
  assert.deepEqual(of('ds:Sheet/drawer'), ['390:en', '360:en']);
  assert.deepEqual(of('farrowing.room'), ['390:en'], 'tripwire');
  assert.deepEqual(of('inspection.room'), ['390:en'], 'tripwire');
  assert.deepEqual(shotNeeds(world().screens, () => false, { quick: true }), [], 'a --quick self-check has no tripwire');
});

test('fast path: a page file several features load reaches all of them in full; their stylesheet keeps the full gate', () => {
  const r = fast([...OPT_IN, 'ux/system/farrowing-astra-concept.js'], ['farrowing']);
  assert.equal(r.eligible, true);
  assert.deepEqual(r.features, [DS_FEATURE, 'farrowing', 'move']);
  assert.match(r.why.join(), /loaded by pages of farrowing, move: all their screens in full/);
  assert.match(fast([...OPT_IN, 'ux/system/farrowing-astra-unified.css']).why[0], /draws on every screen/, 'a ux/system stylesheet is the shared system');
  assert.match(fast([...OPT_IN, 'ux/tasks/piglet-processing/simple/app.css']).eligible ? 'eligible' : '', /eligible/, "one feature's own stylesheet is its own");
});

test('fast path: anything else that draws on every screen, or that nothing places, keeps the full gate', () => {
  for (const f of ['ux/design-system/tokens.css', 'ux/system/atlas-bare.js', 'scripts/shoot-screens.mjs', 'scripts/serve-ux.cjs', 'scripts/defaults-proof.mjs', 'package.json', 'package-lock.json',
    'atlas/library.js', 'sections/mobile.json', 'ux/laws/strings.json', 'ux/design-system/components/task-skeleton.css', 'ux/design-system/components/_proposed.json',
    'ux/design-system/components/pass-proof/index.html', 'next.config.ts']) {
    const r = fast([...OPT_IN, f]);
    assert.equal(r.eligible, false, f);
  }
  assert.deepEqual(fast([...OPT_IN, 'ux/system/astra-surfaces.js']).features, [DS_FEATURE, 'farrowing', 'inspection', 'move'], 'a script pages of three features load: all three in full');
  assert.match(fast(['ux/design-system/components/ChoiceList/README.md', 'ux/system/farrowing-astra-concept.js']).why[0], /the bundle is not changed/);
});

test('fast path: the generated atlas may change only for the features and components the change edits', () => {
  const files = [...OPT_IN, 'atlas/atlas.json', 'features/farrowing/feature.json'];
  assert.match(fast(files).why[0], /atlas\/atlas\.json changed and was not compared/);
  assert.equal(fast(files, [], { features: ['farrowing'], components: ['ChoiceList'], other: [] }).eligible, true);
  assert.match(fast(files, [], { features: ['farrowing', 'inspection'], components: ['ChoiceList'], other: [] }).why[0], /screens of inspection, whose files did not change/);
  assert.match(fast(files, [], { features: ['farrowing'], components: ['ChoiceList', 'Button'], other: [] }).why[0], /component Button, whose folder did not change/);
  assert.match(fast(files, [], { features: [], components: [], other: ['copy'] }).why[0], /beyond features and components: copy/);
});

test('atlasChanges names the features and components whose entries differ, and anything else', () => {
  const at = (x = {}) => ({ generated: x.g || 't1', commit: 'c', platforms: [{ id: 'mobile', name: 'Mobile', copy: x.copy || {}, sections: [{ id: 's1', title: x.title || 'S', features: [{ id: 'farrowing', screens: [{ id: 'a', url: x.url || '/a' }] }, { id: 'inspection', screens: [] }] }], components: [{ name: 'ChoiceList', files: { variants: x.v || ['inline'] } }, { name: 'Button', files: {} }] }] });
  assert.deepEqual(atlasChanges(at(), at({ g: 't2' })), { features: [], components: [], other: [] }, 'the stamps are not a change');
  assert.deepEqual(atlasChanges(at(), at({ url: '/b', v: ['inline', 'inline-key'] })), { features: ['farrowing'], components: ['ChoiceList'], other: [] });
  assert.deepEqual(atlasChanges(at(), at({ title: 'T', copy: { x: 1 } })).other, ['platform mobile copy', 'section s1']);
});

test("own components are those whose README or specimens change; the bundle and other docs aren't", () => {
  assert.deepEqual(ownComponents([...OPT_IN, 'ux/design-system/components/Measure/gate.json', 'ux/design-system/components/Sheet/variants/page.html']), ['ChoiceList', 'Sheet']);
});

// The defaults proof on prints shaped like shoot-screens writes them.
const st = (name, png, html = png) => ({ name, png, html });
const page = (screen, width, sha, states, ok = true) => ({ screen, width, lang: 'en', ok, sha, states });
const baseRuns = [390, 360].flatMap((w) => [
  page('ds:Chip/default', w, `chip${w}`, [st('Default', `c1-${w}`), st('On', `c2-${w}`)]),
  page('ds:Badge/default', w, `badge${w}`, [st('Default', `b1-${w}`)]),
  page('ds:ChoiceList/inline', w, `choice${w}`, [st('Default', `ch1-${w}`), st('Selected', `ch2-${w}`)]),
]);
const edit = (runs, screen, change) => runs.map((r) => (r.screen === screen ? change(structuredClone(r)) : r));

test('defaults proof (a): a CSS rule added for one component that leaks to another component\'s specimen fails', () => {
  let cand = edit(baseRuns, 'ds:Chip/default', (r) => ({ ...r, sha: r.sha + '+key', states: [...r.states, st('Key', `c3-${r.width}`)] }));
  cand = edit(cand, 'ds:Badge/default', (r) => ({ ...r, sha: r.sha + '+leak', states: [st('Default', r.states[0].png + '+leak')] }));
  const p = proveDefaults({ base: baseRuns, cand, own: ['Chip'] });
  assert.equal(p.ok, false);
  assert.deepEqual(p.changed, ['Badge']);
  assert.equal(p.line, 'default behaviour of Badge changed');
  assert.match(p.why.join(), /ds:Badge\/default at 390: the page draws differently/);
});

test('defaults proof (b): a changed default fails, on the own component too, and by its HTML alone', () => {
  // Measure's own page gains a specimen, but its existing Default state moved: the default changed for every feature that uses it
  const own = edit(baseRuns, 'ds:ChoiceList/inline', (r) => ({ ...r, sha: 'moved', states: [st('Default', 'moved'), r.states[1], st('Key face', 'k')] }));
  assert.deepEqual(proveDefaults({ base: baseRuns, cand: own, own: ['ChoiceList'] }).changed, ['ChoiceList']);
  assert.match(proveDefaults({ base: baseRuns, cand: own, own: ['ChoiceList'] }).why.join(), /state "Default" draws differently/);
  // same pixels, different HTML (an attribute default): still a changed default
  const html = edit(baseRuns, 'ds:Badge/default', (r) => ({ ...r, states: [{ ...r.states[0], html: 'other' }] }));
  const p = proveDefaults({ base: baseRuns, cand: html, own: [] });
  assert.deepEqual([p.ok, p.changed], [false, ['Badge']]);
  assert.match(p.why.join(), /has different HTML/);
  // a state gone, a page that no longer renders, a page with no print, a new page of a component that isn't the change's
  assert.match(proveDefaults({ base: baseRuns, cand: edit(baseRuns, 'ds:Chip/default', (r) => ({ ...r, states: r.states.slice(0, 1) })), own: ['Chip'] }).why.join(), /state "On" is gone/);
  assert.match(proveDefaults({ base: baseRuns, cand: edit(baseRuns, 'ds:Badge/default', (r) => ({ ...r, ok: false, error: 'timeout' })) }).why.join(), /does not render on the candidate \(timeout\)/);
  assert.match(proveDefaults({ base: baseRuns, cand: edit(baseRuns, 'ds:Badge/default', (r) => ({ ...r, states: undefined })) }).why.join(), /no specimen print/);
  assert.match(proveDefaults({ base: baseRuns, cand: edit(baseRuns, 'ds:Badge/default', (r) => ({ ...r, states: [st('Default', null)] })) }).why.join(), /has no print on the candidate/);
  assert.match(proveDefaults({ base: baseRuns, cand: [...baseRuns, page('ds:Badge/large', 390, 'x', [])], own: ['ChoiceList'] }).why.join(), /ds:Badge\/large at 390 is new/);
});

test('defaults proof (c): a purely additive opt-in variant passes; its own page may gain specimens and pages', () => {
  let cand = edit(baseRuns, 'ds:ChoiceList/inline', (r) => ({ ...r, sha: r.sha + '+key', states: [...r.states, st('Key face', `ch3-${r.width}`)] }));
  cand = [...cand, page('ds:ChoiceList/inline-key', 390, 'k390', [st('Default', 'k')]), page('ds:ChoiceList/inline-key', 360, 'k360', [st('Default', 'k')])];
  const p = proveDefaults({ base: baseRuns, cand, own: ['ChoiceList'] });
  assert.equal(p.ok, true, p.why.join());
  assert.equal(p.compared, 6);
  assert.match(p.line, /defaults proof passed on 6 component page run/);
  assert.equal(proveDefaults({ base: baseRuns, cand, own: [] }).ok, false, 'not declared its own: its page must not move');
  assert.equal(proveDefaults({ base: [], cand: [] }).ok, false, 'nothing compared proves nothing');
});

test('scenario leaves are skipped only when the files reach no screen and none moved', () => {
  const w = world();
  const docs = reachOf({ ...w, files: ['docs/design-workflow/briefs/gate.md', 'scripts/gate.mjs', 'tests/loop-rules.test.mjs'], scope: [] });
  const none = { diff: [], new: [], gone: [], broken: [] };
  assert.deepEqual(scenariosSkip(docs, none), { skip: true, why: 'no screen in reach and none moved' });
  assert.equal(scenariosSkip(docs, { ...none, diff: [{ id: 'farrowing.room' }] }).skip, false, 'a screen moved');
  assert.equal(scenariosSkip(docs, { ...none, broken: [{ id: 'farrowing.room' }] }).skip, false, 'a screen broke');
  assert.equal(scenariosSkip(reachOf({ ...w, files: ['features/farrowing/scenarios.json'], scope: [] }), none).skip, false, "a feature's own file");
  assert.equal(scenariosSkip(reachOf({ ...w, files: ['ux/design-system/tokens.css'], scope: [] }), none).skip, false, 'every screen');
  // with a scope, the docs-only reach line says the files reach no screen and the scope is still shot
  const scoped = reachOf({ ...w, files: ['docs/design-workflow/README.md'], scope: ['farrowing'] });
  assert.deepEqual([scoped.features, scoped.byFiles], [['farrowing'], []]);
  assert.match(reachLine(scoped, 1), /^reach: no screen by its files; the scope's 1 screen\(s\) in features farrowing are shot in full \(docs\/design-workflow\/README\.md: draws no pixel; scope farrowing\)$/);
  assert.match(reachLine(reachOf({ ...w, files: ['features/farrowing/budget.md'], scope: ['farrowing'] }), 1), /^reach: 1 screen\(s\) in features farrowing/);
});

// The proof runner on fixture pages (scripts/defaults-proof.fixtures/): the gate's own capture of a component page (the atlas's
// state grid, each state's frame printed) on a base bundle and on candidates that leak, change a default, or add an opt-in.
test('defaults proof fixtures: a leak and changed defaults fail, an opt-in variant passes, on real renders', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const r = spawnSync(process.execPath, [path.join(root, 'scripts/defaults-proof.mjs'), '--self-test'], { encoding: 'utf8' });
  process.stdout.write(r.stdout + r.stderr);
  assert.equal(r.status, 0, r.stdout.split('\n').filter((l) => /FAIL/.test(l)).join('\n') || r.stderr);
  for (const c of ['(base against itself)', 'a-leak-to-another', 'b-changed-default', 'b-default-html-only', 'c-opt-in-variant']) assert.match(r.stdout, new RegExp(`^ok {2}${c.replace(/[()]/g, '\\$&')} `, 'm'), c);
});
