// Reach by rule (scripts/css-reach.mjs): which component pages a bundle.css edit can style.
import test from 'node:test';
import assert from 'node:assert/strict';
import { cssUnits, cssChange, requiredClasses, markupWords, canCarry, unitMayReach, variantTexts } from '../scripts/css-reach.mjs';

test('a selector requires the classes outside attribute selectors and functional pseudo-classes', () => {
  assert.deepEqual(requiredClasses('.st-banner[data-tone="notice"] .st-banner-headline'), ['st-banner', 'st-banner-headline']);
  assert.deepEqual(requiredClasses('.st-banner[data-door]:is(:active,[data-state="Pressed"])'), ['st-banner']);
  assert.deepEqual(requiredClasses('.button:not(.primary):not(:disabled)::before'), ['button']);
  assert.deepEqual(requiredClasses('.a:has(.b) > .c'), ['a', 'c']);
  for (const sel of [':root', 'body', '*', 'svg', '[data-st-keyboard-host][data-keyboard]', 'button:not(.x)', '.\\31 0']) assert.equal(requiredClasses(sel), null, sel);
});

test('the stylesheet splits into rules, with their at-rule context; comments change nothing', () => {
  const css = '@import url("x.css");\n:root{--a:1}\n/* c */\n@layer base{body{margin:0}.button{color:red}}\n@media(max-width:370px){.st-row{gap:0}}\n@keyframes st-in{from{opacity:0}to{opacity:1}}\n.st-toast{animation:st-in 1s}';
  const { units, problems } = cssUnits(css);
  assert.deepEqual(problems, []);
  assert.deepEqual(units.map((u) => u.kind), ['statement', 'rule', 'rule', 'rule', 'rule', 'at-rule', 'rule']);
  assert.equal(units[3].key, '@layer base{.button{color:red}');
  assert.equal(units[4].key, '@media(max-width:370px){.st-row{gap:0}');
  assert.equal(cssChange(css, css.replace('/* c */', '/* changed */')).units.length, 0);
  assert.equal(cssChange(css, css.replace('color:red', 'color:/* x */red')).units.length, 2, 'a comment inside a rule is part of it');
  assert.equal(cssUnits('.a{').problems.length, 1);
});

test("a changed rule is narrowed by its selectors; anything it can't name reaches every page", () => {
  const base = '.st-banner{color:red}\n.st-row{gap:0}\n.st-toast{animation:st-in 1s}\n@keyframes st-in{from{opacity:0}}\n:root{--a:1}';
  const one = cssChange(base, base.replace('color:red', 'color:blue'));
  assert.equal(one.all, false);
  assert.deepEqual(one.units.map((u) => u.selectors), [['.st-banner'], ['.st-banner']]);
  // moved into a media query: changed
  assert.equal(cssChange(base, base.replace('.st-row{gap:0}', '@media(min-width:1px){.st-row{gap:0}}')).units.length, 2);
  // reordered: one of the two rules that swapped is changed, so the elements whose cascade can change are in reach
  const moved = cssChange(base, '.st-row{gap:0}\n' + base.replace('.st-row{gap:0}\n', ''));
  assert.equal(moved.all, false);
  assert.equal(moved.units.length, 2);
  assert.equal(cssChange(base, base.replace('--a:1', '--a:2')).all, true, ':root');
  assert.equal(cssChange(base, base + '\nbody{margin:0}').all, true, 'an element rule');
  assert.equal(cssChange(base, base + '\n.x,svg{fill:none}').all, true, 'one selector of the list names no class');
  assert.equal(cssChange(base, base + '\n@font-face{font-family:x}').all, true, 'an at-rule');
  assert.equal(cssChange(base, base + '\n.a{').all, true, 'unsplittable');
  // review of this change, round 1: nested rules need not require the outer selector; a rule before an @import turns it off
  assert.equal(cssChange(base, base.replace('.st-banner{color:red}', '.st-banner{color:red;:is(&, .st-row){gap:1px}}')).all, true, 'nested rules');
  const imp = '@import url("f.css");\n' + base;
  assert.equal(cssChange(imp, imp.replace('.st-banner{color:red}', '.st-banner{color:blue}')).all, false, 'an import that stays at the head');
  assert.equal(cssChange(imp, '.st-pen-map{}\n' + imp).all, true, 'a rule added before the import');
  assert.equal(cssChange(base, base + '\n@import url("f.css");').all, true, 'an import after a rule');
  // a keyframes edit reaches what its users reach
  const kf = cssChange(base, base.replace('from{opacity:0}', 'from{opacity:.5}'));
  assert.equal(kf.all, false);
  assert.deepEqual(kf.units[0].selectors, ['.st-toast']);
  assert.equal(cssChange('@keyframes a{to{opacity:1}}', '@keyframes a{to{opacity:0}}').all, false, 'no user: only markup that names it');
});

test('the markup a page can make: exact words, and words a concatenation can continue', () => {
  const w = markupWords([`function toast(tone){return '<div class="st-toast'+(tone?' st-toast--'+tone:'')+'">'}`, "const c=`st-fact${x?' st-fact-inline':''}`; el.closest('.st-pen-map'); f('s')"]);
  assert.ok(canCarry(w, 'st-toast'));
  assert.ok(canCarry(w, 'st-toast--danger'), 'a prefix a concatenation continues');
  assert.ok(canCarry(w, 'st-fact-inline'));
  assert.ok(canCarry(w, 'ST-TOAST'), 'case folded (toLowerCase)');
  assert.ok(!canCarry(w, 'st-pen-map'), 'a selector reads a class: it makes none');
  assert.ok(!canCarry(w, 'st-row'));
  assert.ok(!canCarry(w, 'sheet'), 'a one-letter string is no stem');
  const rule = { kind: 'rule', reaches: 'classes', selectors: ['.st-banner .st-text-action', '.st-toast--done'] };
  assert.ok(unitMayReach(rule, w), 'any one selector');
  assert.ok(!unitMayReach({ ...rule, selectors: ['.st-banner .st-text-action'] }, w));
  assert.ok(unitMayReach({ kind: 'at-rule', reaches: 'keyframes', name: 'st-toast', selectors: [] }, w), 'markup that names a keyframes');
});

test("a page's texts: its closure, the bundle units it runs, the setup; null when a load can bring markup", () => {
  const shape = { outside: ['/* head */'], iifes: [{ namespace: 'SentriUI', units: new Map([['row', { text: 'row-text' }], ['toast', { text: 'toast-text' }]]), setup: [{ text: 'setup-text' }], exportText: 'api' }] };
  const read = (f) => ({ 'v.html': 'variant' })[f] ?? null;
  const inputs = { files: ['v.html', 'ux/design-system/components/bundle.js'], unbounded: [{ type: 'media', why: 'img' }], bundle: { all: false, units: ['SentriUI:row'] } };
  assert.deepEqual(variantTexts({ inputs, read, shape, bundleSrc: 'ALL' }), ['variant', '/* head */', 'row-text', 'setup-text', 'api']);
  assert.deepEqual(variantTexts({ inputs: { ...inputs, bundle: { all: true, units: [] } }, read, shape, bundleSrc: 'ALL' }), ['variant', 'ALL']);
  assert.equal(variantTexts({ inputs: { ...inputs, unbounded: [{ type: 'script', why: 'x' }] }, read, shape, bundleSrc: 'ALL' }), null);
  assert.equal(variantTexts({ inputs: { ...inputs, files: ['gone.html'] }, read, shape, bundleSrc: 'ALL' }), null);
});
