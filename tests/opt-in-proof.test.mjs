import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { cssRules, cssChange, splitSelectors, hooksOf, hookIsNew, templateValues, cssProof, replayProof, optInProof, OPT_IN_FILES } from '../scripts/opt-in-proof.mjs';

// A miniature bundle: the shape of ux/design-system/components/bundle.js (an IIFE that sets root.SentriUI).
const bundle = (measureBody, extra = '') => `(function(root){'use strict';
  let uid=0;const id=p=>p+'-'+(++uid);
  function measure({label='',value='',unit='',placeholder='—'${extra}}={}){${measureBody}}
  function heading({title=''}={}){return '<h4 class="st-heading">'+title+'</h4>';}
  root.SentriUI=Object.freeze({measure,heading});
})(globalThis);`;
const BASE_JS = bundle(`const i=id('m');return '<div class="st-measure" id="'+i+'"><button class="st-measure-box">'+(value||placeholder)+'<span class="st-measure-unit">'+unit+'</span></button></div>';`);
const BASE_CSS = `.st-measure{display:flex}
.st-measure-box{border:1px solid #bdc7b6}
.st-measure-unit{color:#657060}
@media (prefers-reduced-motion:reduce){.st-measure-box{transition:none}}`;
const CALLS = [['measure', [{ label: 'Litter weight', value: '12.6', unit: 'kg' }]], ['measure', [{ label: 'Weight', unit: 'kg' }]], ['heading', [{ title: 'Piglet condition' }]]];
const known = (js, css) => {
  const api = {}; new Function('globalThis', js)(api);
  return { markup: CALLS.map(([f, a]) => api.SentriUI[f](...a)).join('\n'), sources: { 'bundle.js': js, 'bundle.css': css, 'page.js': '<div data-face="${row?\'row\':\'flat\'}">' } };
};
const K = known(BASE_JS, BASE_CSS);
const sys = ['ux/design-system/components/bundle.js', 'ux/design-system/components/bundle.css'];

test('PASSES an additive opt-in: a new option, its own markup hook, CSS keyed only on that hook', () => {
  const candJs = bundle(`const i=id('m');if(input==='system')return '<div class="st-measure" data-input="system" id="'+i+'"><label class="st-measure-box"><input class="st-measure-input" value="'+value+'"></label></div>';return '<div class="st-measure" id="'+i+'"><button class="st-measure-box">'+(value||placeholder)+'<span class="st-measure-unit">'+unit+'</span></button></div>';`, `,input=''`);
  const candCss = BASE_CSS + `\n.st-measure[data-input="system"] .st-measure-box{cursor:text}\n.st-measure-input{border:0}\n.st-measure.st-measure .st-measure-box[data-input="system"]:focus-within,.st-measure-input:placeholder-shown{color:#20291f}`;
  const r = optInProof({ files: sys, systemFiles: sys, base: { js: BASE_JS, css: BASE_CSS }, cand: { js: candJs, css: candCss }, calls: CALLS, known: K });
  assert.equal(r.applies, true);
  assert.deepEqual(r.why, []);
  assert.equal(r.ok, true);
});

test('FAILS a CSS rule that leaks to existing markup (no new hook)', () => {
  const r = cssProof(BASE_CSS, BASE_CSS + '\n.st-measure-box{color:red}', K);
  assert.equal(r.ok, false);
  assert.match(r.why.join(' '), /can match existing markup/);
});

test('FAILS a changed default: an existing call renders differently', () => {
  const candJs = BASE_JS.replace("placeholder='—'", "placeholder='0'");
  const r = optInProof({ files: sys, systemFiles: sys, base: { js: BASE_JS, css: BASE_CSS }, cand: { js: candJs, css: BASE_CSS }, calls: CALLS, known: K });
  assert.equal(r.ok, false);
  assert.match(r.why.join(' '), /1 existing call\(s\) render differently \(measure/);
});

test('FAILS an edited, removed or reordered existing rule', () => {
  assert.match(cssProof(BASE_CSS, BASE_CSS.replace('#bdc7b6', '#000'), K).why.join(' '), /removed or edited/);
  assert.match(cssProof(BASE_CSS, BASE_CSS.replace('.st-measure-unit{color:#657060}\n', ''), K).why.join(' '), /removed or edited/);
  const lines = BASE_CSS.split('\n');
  assert.match(cssProof(BASE_CSS, [lines[1], lines[0], ...lines.slice(2)].join('\n'), K).why.join(' '), /changed order/);
});

test('a hook inside :not() or one branch of :is() is not required, so it does not make a selector opt-in', () => {
  assert.equal(cssProof(BASE_CSS, BASE_CSS + '\n.st-measure-box:not([data-brand-new]){color:red}', K).ok, false);
  assert.equal(cssProof(BASE_CSS, BASE_CSS + '\n:is(.st-brand-new,.st-measure-box){color:red}', K).ok, false);
  assert.equal(cssProof(BASE_CSS, BASE_CSS + '\n.st-brand-new .st-measure-box{color:red}', K).ok, true, 'a new ancestor is required');
  assert.equal(cssProof(BASE_CSS, BASE_CSS + '\n.st-measure-box,.st-brand-new{color:red}', K).ok, false, 'every selector of a list must be opt-in');
});

test('an attribute value is new only when base can emit it neither literally nor from a template that holds it', () => {
  assert.equal(hookIsNew({ kind: 'attr', name: 'data-face', value: 'key' }, K), true, "the template writes only 'row' or 'flat'");
  assert.equal(hookIsNew({ kind: 'attr', name: 'data-face', value: 'row' }, K), false);
  assert.equal(hookIsNew({ kind: 'class', name: 'st-measure-unit' }, K), false);
  assert.equal(hookIsNew({ kind: 'class', name: 'st-measure-input' }, K), true);
  assert.equal(hookIsNew({ kind: 'attr', name: 'id' }, K), false);
});

test('a template writes only its closed values; an open one (a variable) can write any value', () => {
  assert.deepEqual(templateValues("row ? 'row' : 'flat'"), ['row', 'flat']);
  assert.deepEqual(templateValues("'key'"), ['key']);
  assert.equal(templateValues('face'), null);
  assert.equal(templateValues("row ? face : 'flat'"), null);
  const open = { markup: '', sources: { 'x.js': 'html+=`<i data-face="${face}">`' } };
  assert.equal(hookIsNew({ kind: 'attr', name: 'data-face', value: 'key' }, open), false, 'an open template could write it');
  const other = { markup: '', sources: { 'dist.html': "<i data-face=\"${row ? 'row' : 'flat'}\">", 'far.js': "const k = 'key';" } };
  assert.equal(hookIsNew({ kind: 'attr', name: 'data-face', value: 'key' }, other), true, "a 'key' literal elsewhere in the repo is not the template");
});

test('@keyframes, @font-face and media conditions are compared whole', () => {
  const rules = cssRules('@media (min-width:1px){.a{color:red}}@keyframes spin{from{opacity:0}to{opacity:1}}.b{x:1}');
  assert.deepEqual(rules.map((r) => r.media + '|' + r.head), ['@media(min-width:1px)|.a', '|@keyframes spin', '|.b']);
  assert.equal(cssProof('.a{x:1}', '.a{x:1}@keyframes spin{to{opacity:1}}', K).ok, false, 'a new keyframes name is global');
  assert.deepEqual(splitSelectors('.a:is(.b,.c),.d'), ['.a:is(.b,.c)', '.d']);
  assert.deepEqual(hooksOf('.a:is(.b,.c)').map((h) => h.name), ['a']);
  assert.equal(cssChange('.a{x:1}', '.a{x:1}.b{y:2}').added.length, 1);
});

test('a system file outside the bundle is never opt-in, and no corpus proves nothing', () => {
  const tok = ['ux/design-system/tokens.css'];
  assert.equal(optInProof({ files: tok, systemFiles: tok, base: {}, cand: {}, calls: CALLS, known: K }).applies, false);
  const r = optInProof({ files: sys, systemFiles: sys, base: { js: BASE_JS, css: BASE_CSS }, cand: { js: BASE_JS, css: BASE_CSS }, calls: [], known: K });
  assert.equal(r.ok, false);
  assert.match(r.why[0], /no recorded calls/);
  assert.deepEqual(OPT_IN_FILES.map((f) => f.split('/').pop()), ['bundle.js', 'bundle.css', 'index.d.ts']);
});

test('the real bundle replays against itself without a difference', () => {
  const src = fs.readFileSync(new URL('../ux/design-system/components/bundle.js', import.meta.url), 'utf8');
  const r = replayProof(src, src, [['measure', [{ label: 'W', value: '1', unit: 'kg', key: 'w' }]], ['heading', [{ title: 'X', kind: 'section' }]], ['stepper', [{ label: 'Weak', value: 1, key: 'weak', action: 'step' }]]]);
  assert.equal(r.ok, true);
});
