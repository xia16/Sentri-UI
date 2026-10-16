import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { bundleChange, bundleShape, bundleRest, screensByCaller } from '../scripts/bundle-graph.mjs';
import { cssOwnedProof, loadApi } from '../scripts/opt-in-proof.mjs';

// A miniature of ux/design-system/components/bundle.js: the icon registry, then the parts, each an IIFE that sets root.<Namespace>.
// tok is an internal helper Row and Picker share; LABEL a module-level constant; a document listener is setup code.
const ICONS = `(function(root){'use strict';
  const paths={a:'M1 1'};
  const icon=k=>'<svg data-icon="'+k+'"></svg>';
  const api=Object.freeze({icon,paths:Object.freeze(paths)});
  root.SentriIcons=api;
})(globalThis);`;
const PARTS = (o = {}) => `(function(root){'use strict';
  let uid=0;
  const LABEL=${o.label || "'Label'"};
  function tok(v){return ${o.tok || "'<span class=\"st-tok\">'+v+'</span>'"};}
  function row({title=''}={}){return '<div class="st-row">'+tok(title)+'</div>';}
  function picker({value='',placeholder=${o.placeholder || "'Choose'"}}={}){return '<button class="st-picker">'+tok(value||placeholder)+'</button>';}
  function workbenchCard({n=0}={}){return ${o.card || "'<div class=\"st-wb-card\">'+n+'</div>'"};}
  function sheet({title=''}={}){return '<section class="st-sheet"><h3>'+title+'</h3>'+LABEL+'</section>';}
  ${o.extra || ''}
  if(typeof document!=='undefined')document.addEventListener('click',e=>{${o.listener || ''}});
  const api=Object.freeze({row,picker,workbenchCard,sheet${o.exports || ''}});
  root.SentriUI=api;
})(globalThis);`;
const bundle = (o, top = '') => `${top}${ICONS}\n${PARTS(o)}`;
const BASE = bundle();
const KEY = 'base-sha-abc';
const REC = { key: KEY, screens: {
  'farrowing.room': { ok: true, fns: ['SentriUI.row', 'SentriUI.sheet'] },
  'inspection.room': { ok: true, fns: ['SentriUI.picker'] },
  'workbench.home': { ok: true, fns: ['SentriUI.workbenchCard'] },
  'home.today': { ok: true, fns: ['SentriIcons.icon', 'SentriUI.row'] },
} };
const IDS = Object.keys(REC.screens);
const reachOfChange = (cand, rec = REC, ids = IDS, candIds = ids) => screensByCaller({ change: bundleChange(BASE, cand), recordings: rec, key: KEY, baseIds: ids, candIds });

test('the miniature reads like the real bundle: two namespaces, units, setup, export tables', () => {
  const s = bundleShape(BASE);
  assert.deepEqual(s.iifes.map((f) => f.namespace), ['SentriIcons', 'SentriUI']);
  assert.deepEqual([...s.iifes[1].exports.keys()], ['row', 'picker', 'workbenchCard', 'sheet']);
  assert.deepEqual(s.problems, []);
  assert.deepEqual(bundleChange(BASE, BASE), { all: false, why: ['0 changed binding(s) taint 0 export(s)'], exports: [], units: [] });
});

// ---------- the five the brief requires ----------
test('a changed shared helper puts every caller of every export that uses it in reach (transitive)', () => {
  const ch = bundleChange(BASE, bundle({ tok: "'<span class=\"st-tok st-tok--v2\">'+v+'</span>'" }));
  assert.deepEqual(ch.exports, ['SentriUI.picker', 'SentriUI.row']);
  assert.deepEqual(reachOfChange(bundle({ tok: "'<b>'+v+'</b>'" })).screens, ['farrowing.room', 'home.today', 'inspection.room']);
});

test('a function only Workbench calls reaches Workbench only', () => {
  const r = reachOfChange(bundle({ card: "'<div class=\"st-wb-card\" data-n=\"'+n+'\">'+n+'</div>'" }));
  assert.deepEqual([r.all, r.screens], [false, ['workbench.home']]);
});

test('a CSS rule that leaks to another component fails (every screen); one the changed function owns passes', () => {
  const cand = bundle({ card: "'<div class=\"st-wb-card st-wb-card--dense\">'+n+'</div>'" });
  const ch = bundleChange(BASE, cand);
  const known = { markup: [['row', [{ title: 'x' }]], ['sheet', [{ title: 'y' }]]].map(([f, a]) => loadApi(BASE)[f](...a)).join('\n'), sources: { 'bundle-rest': bundleRest(BASE, ch.units) + bundleRest(cand, ch.units) } };
  const css = '.st-row{display:flex}\n.st-wb-card{gap:8px}';
  assert.equal(cssOwnedProof(css, css + '\n.st-wb-card--dense{gap:4px}', known).ok, true, 'the changed function alone emits the hook');
  assert.equal(cssOwnedProof(css, css.replace('gap:8px', 'gap:6px'), known).ok, true, 'an edit to a rule only the changed function matches');
  const leak = cssOwnedProof(css, css + '\n.st-sheet .st-wb-card,.st-row{color:red}', known);
  assert.equal(leak.ok, false);
  assert.match(leak.why[0], /can match markup the changed functions don't emit: \.st-row/);
});

test('an unrecorded screen is in reach: missing, failed, or recorded under another key', () => {
  const cand = bundle({ card: "'<i>'+n+'</i>'" });
  assert.deepEqual(reachOfChange(cand, REC, [...IDS, 'move.transfer']).screens, ['move.transfer', 'workbench.home']);
  const failed = { key: KEY, screens: { ...REC.screens, 'farrowing.room': { ok: false, fns: [], error: 'timeout' } } };
  assert.deepEqual(reachOfChange(cand, failed).screens, ['farrowing.room', 'workbench.home']);
  assert.deepEqual(reachOfChange(cand, { ...REC, key: 'other-base' }).screens, [...IDS].sort(), 'a stale recording is no recording');
});

test('a top-level side effect reaches every screen: setup code, code outside the IIFEs', () => {
  assert.match(bundleChange(BASE, bundle({ listener: 'e.preventDefault();' })).why[0], /setup code changed/);
  assert.match(bundleChange(BASE, bundle({}, 'globalThis.x=1;\n')).why[0], /top-level code outside the IIFEs/);
  assert.match(bundleChange(BASE, bundle({ extra: "defaults.pickerSize='compact';" })).why[0], /setup code changed/, 'a new start-up statement');
  assert.equal(reachOfChange(bundle({ listener: 'e.preventDefault();' })).all, true);
});

test('gate v2: a changed constant, or an object built at start-up, taints the units that read it', () => {
  assert.deepEqual(bundleChange(BASE, bundle({ label: "'Name'" })).exports, ['SentriUI.sheet'], 'only sheet reads LABEL');
  const built = bundle({ extra: "const DEFAULTS=makeDefaults();function makeDefaults(){return {size:'regular'};}function sized(){return DEFAULTS.size;}", exports: ',sized' });
  assert.deepEqual(bundleChange(built, built.replace("size:'regular'", "size:'compact'")).exports, ['SentriUI.sized'], 'the start-up object changes because makeDefaults did');
});

test('gate v2: a changed function that mutates a top-level binding taints its readers (assignment, method, Object.assign, a call it is handed to)', () => {
  const host = (body) => bundle({ extra: `const defaults={pickerSize:'regular'};function setUp(){${body}}function picked(){return defaults.pickerSize;}`, exports: ',setUp,picked' });
  for (const [from, to] of [
    ["defaults.pickerSize='regular';", "defaults.pickerSize='compact';"],
    ["Object.assign(defaults,{a:1});", "Object.assign(defaults,{a:2});"],
    ["list(defaults,1);", "list(defaults,2);"],
  ]) {
    const ch = bundleChange(host(from), host(to));
    assert.deepEqual(ch.exports, ['SentriUI.picked', 'SentriUI.setUp'], to);
  }
  const arr = bundle({ extra: "const ITEMS=[];function addOne(){ITEMS.push(1);}function count(){return ITEMS.length;}", exports: ',addOne,count' });
  assert.deepEqual(bundleChange(arr, arr.replace('ITEMS.push(1)', 'ITEMS.push(2)')).exports, ['SentriUI.addOne', 'SentriUI.count']);
});

// ---------- the acceptance faults (the pilot gates scratch branches with these) ----------
test('fault: a changed picker default reaches the screens that call the picker', () => {
  const r = reachOfChange(bundle({ placeholder: "'Pick one'" }));
  assert.deepEqual([r.all, r.screens], [false, ['inspection.room']]);
});

test('fault: a changed internal helper Row uses reaches every Row caller', () => {
  const r = reachOfChange(bundle({ tok: "'<span class=\"st-tok\" title=\"'+v+'\">'+v+'</span>'" }));
  for (const id of ['farrowing.room', 'home.today']) assert.ok(r.screens.includes(id), id);
});

test('fault: a CSS leak into Sheet fails the ownership check', () => {
  const cand = bundle({ tok: "'<span class=\"st-tok\">'+v+'!</span>'" });
  const ch = bundleChange(BASE, cand);
  const known = { markup: loadApi(BASE).sheet({ title: 'x' }), sources: { r: bundleRest(BASE, ch.units) } };
  assert.equal(cssOwnedProof('.st-tok{x:1}', '.st-tok{x:1}\n.st-sheet h3{margin:0}', known).ok, false);
});

test('fault: a top-level bundle change reaches every screen', () => {
  assert.equal(reachOfChange(bundle({}, '/* banner */ void 0;\n')).all, true);
});

test('fault: dynamic dispatch the graph cannot resolve reaches every screen', () => {
  for (const extra of ['function go(n){return root.SentriUI[n]();}', 'function go(n){return api[n];}', 'function go(s){return eval(s);}', 'function go(n){return globalThis[n];}', 'function go(){return this.row();}', 'function go(s){return Function(s)();}']) {
    const ch = bundleChange(BASE, bundle({ extra }));
    assert.equal(ch.all, true, extra);
    assert.match(ch.why[0], /dynamic dispatch|cannot read/, extra);
  }
});

// ---------- the edges ----------
test('a screen only one side has is in reach; an export removed or repointed reaches its callers', () => {
  assert.deepEqual(reachOfChange(bundle({ card: "'<i>'+n+'</i>'" }), REC, IDS, [...IDS, 'workbench.new']).screens, ['workbench.home', 'workbench.new']);
  const gone = bundleChange(BASE, BASE.replace('row,picker,workbenchCard,sheet', 'row,picker,sheet'));
  assert.deepEqual(gone.exports, ['SentriUI.workbenchCard']);
  const repointed = bundleChange(BASE, BASE.replace('row,picker,workbenchCard,sheet', 'row,picker:row,workbenchCard,sheet'));
  assert.deepEqual(repointed.exports, ['SentriUI.picker'], 'picker now behaves like row; row itself is unchanged');
});

test('a changed icon reaches the screens that call SentriIcons, and every SentriUI unit that names the namespace', () => {
  const cand = BASE.replace(`'<svg data-icon="'+k+'"></svg>'`, `'<svg data-icon="'+k+'" aria-hidden="true"></svg>'`);
  const ch = bundleChange(BASE, cand);
  assert.deepEqual(ch.exports, ['SentriIcons.icon']);
  assert.deepEqual(reachOfChange(cand).screens, ['home.today']);
  const viaNs = bundle({ extra: "function glyph(k){return root.SentriIcons.icon(k);}", exports: ',glyph' });
  assert.deepEqual(bundleChange(viaNs, viaNs.replace(`'<svg data-icon="'+k+'"></svg>'`, `'<svg></svg>'`)).exports, ['SentriIcons.icon', 'SentriUI.glyph']);
});

test('a taint that setup code reaches is every screen (a listener calls the changed function)', () => {
  const withListener = bundle({ listener: 'tok("x");' });
  const ch = bundleChange(withListener, withListener.replace("'<span class=\"st-tok\">'+v+'</span>'", "'<i>'+v+'</i>'"));
  assert.equal(ch.all, true);
  assert.match(ch.why[0], /setup code calls a changed function/);
});

test('the real bundle: the Finish change touches exactly Measure and ChoiceList', () => {
  const src = fs.readFileSync(new URL('../ux/design-system/components/bundle.js', import.meta.url), 'utf8');
  assert.deepEqual(bundleShape(src).problems, []);
  assert.deepEqual(bundleChange(src, src).exports, []);
  const edited = src.replace("function measure({label='',", "function measure({note2='',label='',");
  assert.deepEqual(bundleChange(src, edited).exports, ['SentriUI.measure']);
});
