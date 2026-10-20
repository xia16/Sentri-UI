import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
require('../ux/design-system/components/bundle.js');
const UI=globalThis.SentriUI;

// The keyboard never covers a sheet's footer (owner, 2026-10-20): the lift is how far the sheet's resting bottom sits under the visible bottom.
test('keyboard lift: the sheet rises by the keyboard that covers it, never below its resting place', () => {
  assert.equal(UI.keyboardLift(844, 0, 544), 300, 'an 844px phone with 544px visible: the sheet rises 300px');
  assert.equal(UI.keyboardLift(544, 300, 544), 300, 'already lifted: measured from where it rests, the lift holds');
  assert.equal(UI.keyboardLift(844, 0, 844), 0, 'no keyboard: nothing moves');
  assert.equal(UI.keyboardLift(700, 0, 844), 0, 'a sheet ending above the visible bottom never moves down');
  assert.equal(UI.keyboardLift(544, 300, 844), 0, 'the keyboard closed: the lift returns to nothing');
});
test('keyboard lift: drawers and pages take it from their bottom and keep their top in view', () => {
  const css=readFileSync(new URL('../ux/design-system/components/bundle.css', import.meta.url),'utf8');
  assert.match(css,/\.sheet\[data-keyboard\]\{bottom:var\(--st-keyboard-lift,0px\);max-height:calc\(100% - var\(--size-80\) - var\(--st-keyboard-lift,0px\)\)\}/);
  assert.match(css,/\.sheet\[data-presentation="page"\]\[data-keyboard\]\{bottom:var\(--st-keyboard-lift,0px\);height:auto;max-height:none\}/);
  assert.match(css,/\[data-st-keyboard-host\]\[data-keyboard\]\{box-sizing:border-box;padding-bottom:var\(--st-keyboard-lift,0px\)\}/,'a host screen takes the lift as bottom padding');
  // The drawer rule must come after the size rules it caps, so it wins at the same specificity.
  assert.ok(css.indexOf('.sheet[data-keyboard]{')>css.indexOf('.sheet[data-size="long"]{'),'the cap follows the size rules');
});
