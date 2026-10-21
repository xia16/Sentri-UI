// Gate v2 §2, the static analyser (scripts/static-reach.mjs), on two miniature checkouts: base and candidate. The gate's reach is
// what the identities say (gate-simplify.md X1): a screen is in it when its identity differs between the two sides.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { identityInputs } from '../scripts/static-reach.mjs';
import { inputsDigest, canonical } from '../scripts/evidence.mjs';
import { screensOf } from '../scripts/atlas-screens.mjs';

// The miniature: a bundle (a helper tok that Row and Picker share, a start-up DEFAULTS object, Sheet), four features on four pages.
//   farrowing.html  → farrowing.js: SentriUI.row only; fetch('../data/rooms.json') literally; steps on farrowing.finish
//   inspection.html → an inline script: SentriUI['picker'] only
//   home.html       → home.js: let UI = SentriUI (not a provable alias: every export)
//   report.html     → report.js: fetch(`../data/${name}.json`) (computed); embeds farrowing.html in an iframe
const BUNDLE = (o = {}) => `(function(root){'use strict';
  const DEFAULTS=${o.defaults || "{size:'regular'}"};
  function tok(v){return ${o.tok || "'<span class=\"st-tok\">'+v+'</span>'"};}
  function row({title=''}={}){return '<div class="st-row">'+tok(title)+'</div>';}
  function picker({value='',placeholder=${o.placeholder || "'Choose'"}}={}){return '<button class="st-picker" data-size="'+DEFAULTS.size+'">'+tok(value||placeholder)+'</button>';}
  function sheet({title=''}={}){${o.sheet || "return '<section class=\"st-sheet\">'+title+'</section>';"}}
  ${o.extra || ''}
  const api=Object.freeze({row,picker,sheet${o.exports || ''}});
  root.SentriUI=api;
})(globalThis);`;
const PAGE = (scripts) => `<!doctype html><html><head><link rel="stylesheet" href="page.css"></head><body><div class="phone"></div>
<script src="../design-system/components/bundle.js"></script>${scripts}</body></html>`;
const ATLAS = (extra = []) => ({ platforms: [{ sections: [{ features: [
  { id: 'farrowing', screens: [{ id: 'farrowing.room', url: '/ux/system/farrowing.html' }, { id: 'farrowing.finish', url: '/ux/system/farrowing.html', preset: 'finish', steps: ['Finish'] }] },
  { id: 'inspection', screens: [{ id: 'inspection.room', url: '/ux/system/inspection.html' }] },
  { id: 'workbench', screens: [{ id: 'workbench.today', url: '/ux/system/home.html' }, ...extra] },
  { id: 'reports', screens: [{ id: 'reports.week', url: '/ux/system/report.html' }] },
] }] }] });
const FILES = (o = {}) => ({
  'ux/design-system/components/bundle.js': BUNDLE(o.bundle),
  'ux/design-system/components/bundle.css': o.css || '.st-row{display:flex}',
  'ux/system/page.css': '.phone{width:390px}',
  'ux/system/farrowing.html': PAGE('<script src="farrowing.js"></script>'),
  'ux/system/farrowing.js': o.farrowingJs || "fetch('../data/rooms.json');document.querySelector('.phone').innerHTML=SentriUI.row({title:'B1'});\nconst back=()=>location.assign('home.html');",
  'ux/system/inspection.html': PAGE("<script>document.querySelector('.phone').innerHTML=SentriUI['picker']({});</script>"),
  'ux/system/home.html': PAGE('<script src="home.js"></script>'),
  'ux/system/home.js': o.homeJs || "let UI=SentriUI;document.querySelector('.phone').innerHTML=UI.sheet({title:'Today'});",
  'ux/system/report.html': PAGE('<script src="report.js"></script><iframe src="farrowing.html?embed=1"></iframe>'),
  'ux/system/report.js': 'const name=location.hash.slice(1);fetch(`../data/${name}.json`);',
  'ux/data/rooms.json': o.rooms || '{"B1":1}',
  'features/farrowing/scenarios.json': JSON.stringify({ tree: [{ type: 'entry', id: 'f', reset: { url: '/ux/system/farrowing.html' }, children: [{ type: 'outcome', id: 'fa-1' }, { type: 'outcome', id: 'fa-2' }] }] }),
  'features/inspection/scenarios.json': JSON.stringify({ tree: [{ type: 'entry', id: 'i', reset: { url: '/ux/system/inspection.html' }, children: [{ type: 'outcome', id: 'in-1' }] }] }),
  'features/workbench/scenarios.json': JSON.stringify({ tree: [{ type: 'entry', id: 'w', reset: { url: '/ux/system/home.html' }, children: [{ type: 'outcome', id: 'wb-1' }] }] }),
  ...(o.more || {}),
});
let n = 0;
function checkout(o = {}, atlas = ATLAS()) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `sr-${++n}-`));
  for (const [f, text] of Object.entries(FILES(o))) { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), text); }
  fs.mkdirSync(path.join(dir, 'atlas'), { recursive: true }); fs.writeFileSync(path.join(dir, 'atlas/atlas.json'), JSON.stringify(atlas));
  return { dir, atlas };
}
const BASE = checkout();
// A checkout as the gate hashes it: every file by its content, and the files a page can load (what an unbounded load hashes).
function treeOf(dir) {
  const t = new Map();
  (function w(d) { for (const e of fs.readdirSync(path.join(dir, d), { withFileTypes: true })) { const f = d ? `${d}/${e.name}` : e.name; if (e.isDirectory()) w(f); else t.set(f, createHash('sha1').update(fs.readFileSync(path.join(dir, f))).digest('hex')); } })('');
  return t;
}
// what no page can load, as the gate says (evaluate.mjs NOT_LOADED)
const runtimeOf = (t) => [...t.keys()].filter((f) => !/^(docs|\.github|tests|\.claude|scripts)\//.test(f) && !/^(?!ux\/).*\.md$/i.test(f)).sort();
const digest = (side, id) => { const ii = identityInputs(side, id); if (!ii) return null; const t = treeOf(side.dir); return canonical(inputsDigest(ii, t, runtimeOf(t)).digest); };
// The screens whose identity differs between base and candidate, or that only one side has: the gate's reach.
const moved = (b, c) => [...new Set([b, c].flatMap((s) => screensOf(s.atlas).map((x) => x.id)))].sort().filter((id) => digest(b, id) !== digest(c, id));
const EVERY = ['farrowing.finish', 'farrowing.room', 'inspection.room', 'reports.week', 'workbench.today'];

// ---------- must not pass: a change moves the identity of every screen it can affect ----------
test('a changed shared helper moves every page that uses an export over it (and every aliasing page)', () => {
  assert.deepEqual(moved(BASE, checkout({ bundle: { tok: "'<b class=\"st-tok\">'+v+'</b>'" } })), EVERY, 'row, picker, the alias, and the report that embeds farrowing');
});

test('a mutation moves the readers of what it mutates', () => {
  const extra = "function grow(){DEFAULTS.size='large';}";
  const r = moved(checkout({ bundle: { extra, exports: ',grow' } }), checkout({ bundle: { extra: "function grow(){DEFAULTS.size='huge';}", exports: ',grow' } }));
  assert.ok(r.includes('inspection.room'), 'the picker reads DEFAULTS, which grow writes');
  assert.ok(r.includes('workbench.today'), 'the alias runs every unit');
});

test('a start-up change (a constant, a new binding built at load, a setup statement) moves every screen that loads the bundle', () => {
  assert.deepEqual(moved(BASE, checkout({ bundle: { defaults: "{size:'compact'}" } })), EVERY, 'an initialiser runs at load on every page');
  const computed = checkout({ bundle: { extra: "const k='row';" } });
  assert.deepEqual(moved(computed, checkout({ bundle: { extra: "const k='row';const api2=Object.freeze({[k]:row});" } })), EVERY, 'review of #194, round 2: nothing exports it, and it still runs');
  assert.deepEqual(moved(BASE, checkout({ bundle: { extra: "DEFAULTS.size='compact';" } })), EVERY, 'a setup statement');
  assert.deepEqual(moved(BASE, checkout({ bundle: { extra: 'function pick(n){return api[n];}', exports: ',pick' } })), EVERY, 'a new export: the exports object every page builds at load changed');
});

test('a page aliasing SentriUI uses every export: any bundle change moves it', () => {
  const r = moved(BASE, checkout({ bundle: { sheet: "return '<section class=\"st-sheet st-sheet--v2\">'+title+'</section>';" } }));
  assert.deepEqual(r, ['farrowing.finish', 'reports.week', 'workbench.today'], 'the aliasing page, farrowing.finish, whose steps may tap through to Home, and the report, whose computed fetch hashes every page-loadable file');
  assert.equal(identityInputs(BASE, 'workbench.today').bundle.all, true);
});

test('a computed fetch beside a literal consumer: both move', () => {
  const r = moved(BASE, checkout({ rooms: '{"B1":2}' }));
  assert.ok(r.includes('farrowing.room'), 'names it literally');
  assert.ok(r.includes('reports.week'), 'fetches by a computed URL; the literal consumer does not let it off');
  assert.ok(!r.includes('inspection.room'));
});

test('a cross-feature dependency: a page that embeds another feature moves when that feature changes', () => {
  const r = moved(BASE, checkout({ farrowingJs: "fetch('../data/rooms.json');document.querySelector('.phone').innerHTML=SentriUI.row({title:'B2'});\nconst back=()=>location.assign('home.html');" }));
  assert.ok(r.includes('reports.week'), 'the report embeds farrowing.html');
  assert.ok(r.includes('farrowing.room'));
  assert.ok(!r.includes('inspection.room'));
});

test('a stylesheet every page loads moves every screen', () => {
  assert.deepEqual(moved(BASE, checkout({ more: { 'ux/system/page.css': '.phone{width:391px}' } })), EVERY);
});

test('an added and a removed screen are in reach; a changed atlas definition moves its screen', () => {
  // the report fetches by a computed URL, so it could read atlas.json: the gate keeps the whole file in its identity (atlasDigest)
  assert.deepEqual(moved(BASE, checkout({}, ATLAS([{ id: 'workbench.new', url: '/ux/system/home.html' }]))), ['reports.week', 'workbench.new']);
  assert.deepEqual(moved(checkout({}, ATLAS([{ id: 'workbench.old', url: '/ux/system/home.html' }])), BASE), ['reports.week', 'workbench.old']);
  const a = ATLAS(); a.platforms[0].sections[0].features[1].screens[0].preset = 'filters';
  assert.deepEqual(moved(BASE, checkout({}, a)), ['inspection.room', 'reports.week']);
});

// ---------- must stay fast ----------
test('an intended default change moves its callers only', () => {
  assert.deepEqual(moved(BASE, checkout({ bundle: { placeholder: "'Pick one'" } })), ['farrowing.finish', 'inspection.room', 'reports.week', 'workbench.today']);
});

test("docs, tests, the scripts and prose move no screen; a file no page names moves only a page that fetches by a computed URL", () => {
  // #200 edited atlas/SCHEMA.md and ran all 404 screens: a file no page can load can't draw
  assert.deepEqual(moved(BASE, checkout({ more: { 'docs/x.md': '# x', 'tests/y.test.mjs': '//', 'scripts/z.mjs': '//', 'atlas/SCHEMA.md': '# s', 'sections/home/notes.md': '# n', 'features/inspection/budget.md': '# b' } })), []);
  assert.deepEqual(moved(BASE, checkout({ more: { 'ux/design-system/components/index.d.ts': 'export {}', 'features/inspection/budget.json': '{}' } })), ['reports.week']);
});

// ---------- how a page reads the namespace, and what its URLs can name ----------
test('namespace use: NS.X and NS["X"] use X; a static destructuring uses its keys; typeof is a check; anything else uses every export', () => {
  const uses = (js) => identityInputs(checkout({ farrowingJs: js }), 'farrowing.room').bundle;
  assert.deepEqual(uses("if(typeof SentriUI!=='undefined')SentriUI.row({});SentriUI['sheet']({});").exports, ['SentriUI.row', 'SentriUI.sheet']);
  assert.deepEqual(uses('const { row, sheet: s } = SentriUI; row({}); s({});').exports, ['SentriUI.row', 'SentriUI.sheet']);
  assert.deepEqual(uses('window.SentriUI.picker({});').exports, ['SentriUI.picker'], 'through the global object is still a direct access');
  for (const js of ["const k='row';SentriUI[k]({});", 'render(SentriUI);', "window[name]('x');", 'const { row, ...rest } = SentriUI;']) assert.equal(uses(js).all, true, js);
});

test('provable aliases (gate-v2 review): a const alias used only statically uses exactly what it reads; anything else is every export', () => {
  const uses = (js) => identityInputs(checkout({ farrowingJs: js }), 'farrowing.room').bundle;
  assert.deepEqual([uses('const UI = SentriUI; UI.picker({});').all, uses('const UI = SentriUI; UI.picker({});').exports], [false, ['SentriUI.picker']]);
  assert.deepEqual(uses('const UI = window.SentriUI; const { row, sheet: s } = UI; if (UI) row(s);').exports, ['SentriUI.row', 'SentriUI.sheet']);
  assert.deepEqual(uses("const UI = SentriUI; const V = UI; V['row']({});").exports, ['SentriUI.row'], 'an alias of an alias resolves');
  for (const js of [
    'const UI = SentriUI; f(UI);', 'let UI = SentriUI; UI.picker({});', 'var UI = SentriUI; UI.picker({});', 'const { a, ...r } = SentriUI;',
    'const UI = SentriUI; const { row, ...r } = UI;', 'const UI = SentriUI; const o = { UI };', 'const UI = SentriUI; const list = [UI];',
    'const UI = SentriUI; function get(){ return UI; }', "const UI = SentriUI; const k = 'row'; UI[k]({});", 'const UI = SentriUI; let V = UI; V.row({});',
    'const UI = SentriUI; function f(UI){ return UI.x; }', 'with (o) { SentriUI.row({}); }',
  ]) assert.equal(uses(js).all, true, js);
});

test('a top-level alias of a classic script is a global: another script on the page that misuses it widens the page', () => {
  const two = (homeJs) => identityInputs(checkout({ homeJs, more: { 'ux/system/home2.js': 'pass(UI);' } }), 'workbench.today').bundle;
  const fine = identityInputs(checkout({ homeJs: "const UI=SentriUI;document.querySelector('.phone').innerHTML=UI.sheet({});" }), 'workbench.today').bundle;
  assert.deepEqual([fine.all, fine.exports], [false, ['SentriUI.sheet']]);
  const page = checkout({ homeJs: "const UI=SentriUI;UI.sheet({});", more: { 'ux/system/home2.js': 'pass(UI);', 'ux/system/home.html': PAGE('<script src="home.js"></script><script src="home2.js"></script>') } });
  assert.equal(identityInputs(page, 'workbench.today').bundle.all, true);
  const reads = checkout({ homeJs: "const UI=SentriUI;UI.sheet({});", more: { 'ux/system/home2.js': 'UI.picker({});', 'ux/system/home.html': PAGE('<script src="home.js"></script><script src="home2.js"></script>') } });
  assert.deepEqual(identityInputs(reads, 'workbench.today').bundle.exports, ['SentriUI.picker', 'SentriUI.sheet']);
});

test('URLs: a literal, new URL(literal, base), location.href and a local function fed only literals are bounded; anything else is not', () => {
  const deps = (js) => identityInputs(checkout({ farrowingJs: js }), 'farrowing.room');
  assert.ok(deps("const u=new URL('../data/a.json',location.href);fetch(u.href);").files.includes('ux/data/a.json'));
  assert.ok(deps("const here=document.currentScript.src;fetch(new URL('../data/b.json',here));").files.includes('ux/data/b.json'), 'against the script');
  assert.ok(deps("function load(f){return fetch(new URL(f,location.href));}load('../data/c.json');load('../data/d.json');").files.includes('ux/data/d.json'));
  assert.deepEqual(deps("function load(f){return fetch(f);}load('../data/c.json');setTimeout(load,1);").unbounded.map((u) => u.type), ['any'], 'an escaping function: its parameter can be anything');
  assert.deepEqual(deps("fetch(`../data/${x}.json`);").unbounded.map((u) => u.type), ['any']);
  assert.deepEqual(deps("el.innerHTML=`<img src=\"${p}\">`;").unbounded.map((u) => u.type), ['media'], 'an <img> can only load an image');
  assert.equal(deps("location.assign(`x/${y}.html`);").unbounded.length, 0, 'a navigation is not a load…');
  assert.ok(!deps("const go=()=>location.assign('../data/e.html');").files.includes('ux/data/e.html'), '…and a literal one does not load its target either');
});

test('markup whose literal part reaches a query or a fragment names its file: only the query is computed (G6)', () => {
  // farrowing.finish has steps, so its closure follows navigation
  const deps = (js) => identityInputs(checkout({ farrowingJs: js }), 'farrowing.finish');
  const anywhere = (ii) => ii.unbounded.filter((u) => /navigate anywhere|navigation to a computed URL/.test(u.why));
  assert.equal(anywhere(deps("el.innerHTML=`<a href=\"${t}\">x</a>`;")).length, 1, 'a computed file can go anywhere');
  const q = deps("el.innerHTML=`<a class=\"d\" href=\"home.html?entry=${t.id}&from=x\">x</a>`;");
  assert.equal(anywhere(q).length, 0, 'home.html?entry=${…} can only open home.html');
  assert.ok(q.files.includes('ux/system/home.js'), 'and its page is followed like a literal link');
  assert.equal(anywhere(deps("el.innerHTML=`<a href=\"?view=${v}\">x</a>`;")).length, 0, 'a query alone is the page itself');
  assert.deepEqual(deps("el.innerHTML=`<img src=\"pic.png?v=${n}\">`;").unbounded, [], 'a load with a computed query is its file');
  assert.equal(deps("el.innerHTML=`<img srcset=\"a.png?w=${n} 2x\">`;").unbounded.length, 1, 'srcset can list more URLs: still unbounded');
});

test('identity hashes: a body edit changes exactly that unit; a setup or between-unit edit changes setupHash only; every byte is covered', () => {
  const ids = (o) => identityInputs(checkout(o), 'workbench.today').bundle; // every unit: Home does not prove its alias
  const a = ids({}), b = ids({ bundle: { sheet: "return '<section class=\"st-sheet\">'+title+'!</section>';" } });
  const changed = Object.keys(a.unitHashes).filter((k) => a.unitHashes[k] !== b.unitHashes[k]);
  assert.deepEqual(changed, ['SentriUI:sheet']);
  assert.equal(a.setupHash, b.setupHash);
  const comment = ids({ bundle: { extra: '/* a note between units */' } });
  assert.deepEqual(Object.keys(a.unitHashes).filter((k) => a.unitHashes[k] !== comment.unitHashes[k]), []);
  assert.notEqual(a.setupHash, comment.setupHash, 'a comment outside every unit is in setupHash');
  const crlf = identityInputs(checkout({ bundle: { tok: "'<span class=\"st-tok\">'+v+\r\n'</span>'" } }), 'workbench.today').bundle;
  const lf = identityInputs(checkout({ bundle: { tok: "'<span class=\"st-tok\">'+v+\n'</span>'" } }), 'workbench.today').bundle;
  assert.equal(crlf.unitHashes['SentriUI:tok'], lf.unitHashes['SentriUI:tok'], 'only line endings are normalised');
  assert.deepEqual(Object.keys(identityInputs(BASE, 'inspection.room').bundle.unitHashes), ['SentriUI:DEFAULTS', 'SentriUI:picker', 'SentriUI:tok']);
});

// ---------- identity ----------
test("identityInputs: a screen's page closure, the bundle units it can run, its definition", () => {
  const id = identityInputs(BASE, 'inspection.room');
  assert.ok(id.files.includes('ux/system/inspection.html') && id.files.includes('ux/design-system/components/bundle.js') && id.files.includes('ux/system/page.css'));
  assert.deepEqual(id.bundle.exports, ['SentriUI.picker']);
  assert.deepEqual(id.bundle.units, ['SentriUI:DEFAULTS', 'SentriUI:picker', 'SentriUI:tok']);
  assert.equal(identityInputs(BASE, 'farrowing.finish').screen.preset, 'finish');
  const fin = identityInputs(BASE, 'farrowing.finish');
  assert.ok(fin.files.includes('ux/system/home.js'), 'its steps may tap through to Home');
  assert.ok(!identityInputs(BASE, 'farrowing.room').files.includes('ux/system/home.js'), 'without steps, a navigation is not a load');
  assert.equal(identityInputs(BASE, 'nope'), null);
});

// ---------- per-leaf identity (gate-v2 §3): a leaf hashes what its run can reach ----------
test('a picker-only change is a new identity only for leaves whose closure can run the picker (an aliasing page counts)', async () => {
  const { leafInputs } = await import('../scripts/static-reach.mjs');
  const { inputsDigest, identityOf } = await import('../scripts/evidence.mjs');
  const { createHash } = await import('node:crypto');
  const more = {
    'ux/system/rows.html': PAGE("<script>document.querySelector('.phone').innerHTML=SentriUI.row({title:'A1'});</script>"),
    'ux/system/wander.html': PAGE("<script>const to=location.hash.slice(1);document.querySelector('.phone').innerHTML=SentriUI.row({title:'x'});location.assign(to+'.html');</script>"),
  };
  const side = (o) => { const c = checkout({ ...o, more }); return { ...c, rev: `r${++n}` }; };
  const b = side({}), c = side({ bundle: { placeholder: "'Pick one'" } });
  const treeOf = (s) => { const t = new Map(); for (const [f] of Object.entries(FILES({ ...(s === c ? { bundle: { placeholder: "'Pick one'" } } : {}), more }))) t.set(f, createHash('sha1').update(fs.readFileSync(path.join(s.dir, f))).digest('hex')); return t; };
  const tb = treeOf(b), tc = treeOf(c), runtime = (t) => [...t.keys()].filter((f) => !/^(features|docs|tests|scripts)\//.test(f)).sort();
  const id = (s, t, url) => identityOf('leaf', { reach: inputsDigest(leafInputs(s, { url }), t, runtime(t)).digest, walked: url });
  const changed = (url) => id(b, tb, url) !== id(c, tc, url);
  assert.equal(changed('/ux/system/inspection.html'), true, 'its page calls the picker (SentriUI[\'picker\'])');
  assert.equal(changed('/ux/system/rows.html'), false, 'a leaf whose pages call Row only is reused');
  assert.equal(changed('/ux/system/farrowing.html'), true, 'farrowing calls Row only, but its taps can reach home.html, which aliases SentriUI with let: every unit');
  const w = leafInputs(b, { url: '/ux/system/wander.html' });
  assert.ok(w.unbounded.some((u) => u.type === 'any'), 'a navigation to a computed URL is unbounded');
  assert.equal(changed('/ux/system/wander.html'), true, 'unsure is everything: a leaf that can go anywhere hashes every page-loadable file');
  assert.deepEqual(leafInputs(b, { url: '/ux/system/farrowing.html' }).pages.sort(), ['ux/system/farrowing.html', 'ux/system/home.html']);
  assert.equal(leafInputs(b, {}), null);
});

// ---------- review of #194: start-up effects are part of every identity that loads the bundle ----------
test('a start-up initialiser change is a new identity for every screen that loads the bundle, not only a reach of all', async () => {
  const { inputsDigest, canonical } = await import('../scripts/evidence.mjs');
  const { createHash } = await import('node:crypto');
  const extra = (v) => `const OPACITY=${v};const formats=new Map([['a',OPACITY]]);if(typeof document!=='undefined')document.documentElement.style.opacity=String(formats.get('a'));`;
  const mk = (v) => { const o = { bundle: { extra: extra(v) } }; const c = checkout(o); const t = new Map(Object.keys(FILES(o)).map((f) => [f, createHash('sha1').update(fs.readFileSync(path.join(c.dir, f))).digest('hex')])); return { side: { ...c, rev: `o${++n}` }, tree: t }; };
  const b = mk('1'), c = mk('0.99');
  const rt = (t) => [...t.keys()].filter((f) => !/^(features|docs|tests|scripts)\//.test(f)).sort();
  for (const id of ['inspection.room', 'farrowing.room', 'reports.week']) {
    const d = (x) => canonical(inputsDigest(identityInputs(x.side, id), x.tree, rt(x.tree)).digest);
    assert.notEqual(d(b), d(c), `${id}: its evidence must not be reused across a start-up change (the initialiser and what it reads are in its identity)`);
  }
  assert.ok(identityInputs(b.side, 'inspection.room').bundle.units.some((u) => /OPACITY|formats/.test(u)), 'the initialisers are units of the identity');
});

// ---------- review of #194, round 2: a new start-up initialiser can't escape reach, and nothing whose identity changed is left out ----------
test('the probe: a new DOMContentLoaded initialiser that dims one page at 360 only reaches every screen, and is in its identity', async () => {
  const { inputsDigest, canonical, identityDiff } = await import('../scripts/evidence.mjs');
  const { createHash } = await import('node:crypto');
  const probe = "const boot=typeof document!=='undefined'&&document.addEventListener('DOMContentLoaded',()=>{if(innerWidth===360&&/report/.test(location.pathname))document.documentElement.style.opacity='0.5';});";
  const mk = (o) => { const c = checkout(o); const t = new Map(Object.keys(FILES(o)).map((f) => [f, createHash('sha1').update(fs.readFileSync(path.join(c.dir, f))).digest('hex')])); return { side: { ...c, rev: `p${++n}` }, tree: t }; };
  const b = mk({}), c = mk({ bundle: { extra: probe } });
  // the reach by identity: the dimmed page's identity changed, so it is shot in full
  const rt = (t) => [...t.keys()].filter((f) => !/^(features|docs|tests|scripts)\//.test(f)).sort();
  const changed = (id) => canonical(inputsDigest(identityInputs(b.side, id), b.tree, rt(b.tree)).digest) !== canonical(inputsDigest(identityInputs(c.side, id), c.tree, rt(c.tree)).digest);
  assert.equal(changed('reports.week'), true);
  const ids = ['reports.week', 'farrowing.room'].map((id) => ({ id }));
  assert.deepEqual(identityDiff({ base: ids, cand: ids, idOf: (side, x) => (side === 'base' || !changed(x.id) ? x.id : x.id + '+') }).changed.sort(), ['farrowing.room', 'reports.week'], 'every bundle-loading screen is in the reach: the initialiser is a start-up effect of each');
});

// ---------- gate-simplify.md K3: the reach is the identity, so a stylesheet is read only in the syntax the gate checks ----------
test('a stylesheet loads only through lowercase @import "…" or url(…) before any rule; anything else widens the identity to every stylesheet', async () => {
  const { cssLoads } = await import('../scripts/static-reach.mjs');
  const loads = (text) => { const r = cssLoads(text, 'ux/system/page.css'); return { files: [...r.files].sort(), unchecked: r.unchecked.map((u) => u.type) }; };
  assert.deepEqual(loads('@charset "utf-8";\n@import "leaf.css";\n@import url(\'/ux/x.css\') screen;\n.a{background:url(bg.png)}'), { files: ['ux/system/bg.png', 'ux/system/leaf.css', 'ux/x.css'], unchecked: [] });
  assert.deepEqual(loads('@IMPORT "leaf.css";').unchecked, ['style'], 'another case: the browser loads it, the gate does not read it');
  assert.deepEqual(loads('@\\69mport "leaf.css";').unchecked, ['style'], 'an escape');
  assert.deepEqual(loads('.a{color:red}\n@import "leaf.css";').unchecked, ['style'], 'after a rule');
  assert.deepEqual(loads('/* @IMPORT "x.css" */ .a{}'), { files: [], unchecked: [] }, 'a comment is not a load');
  assert.deepEqual(loads('.a{background:image-set("a.png" 1x)}').unchecked, ['media'], 'a file named by a string');
  assert.deepEqual(loads('@media (min-width:1px){.a{}} @font-face{src:url(f.woff2)}'), { files: ['ux/system/f.woff2'], unchecked: [] }, 'other at-rules are not imports');
});

test("a page's identity follows its stylesheets' checked imports, and a stylesheet it can't read makes it hash every stylesheet", () => {
  const ii = (more) => identityInputs(checkout({ more }), 'farrowing.room');
  const checked = ii({ 'ux/system/page.css': '@import "leaf.css";\n.phone{width:390px}', 'ux/system/leaf.css': '.x{}' });
  assert.ok(checked.files.includes('ux/system/leaf.css'));
  assert.equal(checked.unbounded.filter((u) => u.type === 'style').length, 0);
  const loose = ii({ 'ux/system/page.css': '@IMPORT "leaf.css";\n.phone{width:390px}', 'ux/system/leaf.css': '.x{}' });
  assert.match(loose.unbounded.find((u) => u.type === 'style')?.why || '', /ux\/system\/page\.css: an @import the gate doesn't read/);
  const block = ii({ 'ux/system/farrowing.html': PAGE('<style>@import "leaf.css";</style><script src="farrowing.js"></script>'), 'ux/system/leaf.css': '.x{}' });
  assert.ok(block.files.includes('ux/system/leaf.css'), 'a <style> block is read like a stylesheet');
  const blockLoose = ii({ 'ux/system/farrowing.html': PAGE('<style>.a{} @import "leaf.css";</style><script src="farrowing.js"></script>') });
  assert.match(blockLoose.unbounded.find((u) => u.type === 'style')?.why || '', /farrowing\.html <style>/);
});

// ---------- Codex audit, 2026-10-21: srcset (latent, no page uses it) ----------
test('srcset names several candidates, so it is an unbounded media load wherever it is written, never its first file', () => {
  const page = (body, js) => identityInputs(checkout({ farrowingJs: js, more: body ? { 'ux/system/farrowing.html': PAGE(`${body}<script src="farrowing.js"></script>`) } : {} }), 'farrowing.room');
  for (const ii of [
    page('<img src="a.png" srcset="a.png 1x, b.png 2x">', 'SentriUI.row({});'),
    page('<picture><source srcset="wide.png 800w, narrow.png 400w"><img src="narrow.png"></picture>', 'SentriUI.row({});'),
    page(null, "el.innerHTML='<img srcset=\"a.png 1x, b.png 2x\">';"),
    page(null, "img.srcset='a.png 1x, b.png 2x';"),
    page(null, "img.setAttribute('srcset','a.png 1x, b.png 2x');"),
  ]) {
    assert.ok(ii.unbounded.some((u) => u.type === 'media' && /srcset can name several files/.test(u.why)), JSON.stringify(ii.unbounded));
    assert.ok(!ii.files.some((f) => /\s|,/.test(f)), 'no candidate list is read as a file name');
  }
  assert.ok(page('<img src="a.png" srcset="a.png 1x, b.png 2x">', '').files.includes('ux/system/a.png'), 'its src is still a literal load');
});
