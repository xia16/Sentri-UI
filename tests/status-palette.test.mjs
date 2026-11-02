// The status palette (owner, 2026-11-02; scripts/check-colours.mjs STATUS): the marks tell apart under colour blindness, and every
// fill holding a number carries its own ink at 4.5:1. The math is check-colours.mjs's (OKLab, Machado 2009 CVD simulation).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STATUS, deltaE, contrast } from '../scripts/check-colours.mjs';

const SEPARATION = 8; // OKLab ΔE x100 under each simulation, the dataviz validator's target
const KINDS = ['protan', 'deutan', 'tritan'];
// The marks that sit side by side: the segments of one bar (done, progress, late on the empty track) and the dots of one legend;
// the act-now red sits beside any of them as the one red signal in a row.
const MARKS = { done: STATUS.done.mark, progress: STATUS.progress.mark, late: STATUS.late.mark, waiting: STATUS.waiting.track, 'act now': STATUS.actNow.word };
// A pair the settled palette fails, kept visible as a TODO until the owner moves a mark (never dropped from the list).
const KNOWN = {
  'done|progress|tritan': 'the done mark #5fae6e and the progress mark #6f9fdc share a lightness, so a tritan reader sees one colour (ΔE 3.3); darkening either mark separates them (done #51945e gives 8.8, progress #597fb0 gives 8.9): waiting for the owner',
};

const names = Object.keys(MARKS);
for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) for (const kind of KINDS) {
  const [a, b] = [names[i], names[j]], todo = KNOWN[`${a}|${b}|${kind}`] || KNOWN[`${b}|${a}|${kind}`];
  test(`status marks ${a} and ${b} tell apart under ${kind} (ΔE ≥ ${SEPARATION})`, todo ? { todo } : {}, () => {
    const d = deltaE(MARKS[a], MARKS[b], kind);
    assert.ok(d >= SEPARATION, `${a} ${MARKS[a]} vs ${b} ${MARKS[b]} under ${kind}: ΔE ${d.toFixed(1)}`);
  });
}

test('the marks tell apart with full colour vision too', () => {
  for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) {
    const d = deltaE(MARKS[names[i]], MARKS[names[j]]);
    assert.ok(d >= SEPARATION, `${names[i]} vs ${names[j]}: ΔE ${d.toFixed(1)}`);
  }
});

test('each status fill carries its own ink at 4.5:1 or more', () => {
  for (const [status, { fill, ink }] of Object.entries({ done: STATUS.done, progress: STATUS.progress, late: STATUS.late, 'act now': STATUS.actNow })) {
    const r = contrast(fill, ink);
    assert.ok(r >= 4.5, `${status}: ${ink} on ${fill} is ${r.toFixed(2)}:1`);
  }
});

test('white on the one green button is 4.5:1 or more', () => {
  const r = contrast(STATUS.button.label, STATUS.button.fill);
  assert.ok(r >= 4.5, `white on ${STATUS.button.fill} is ${r.toFixed(2)}:1`);
});

test('the math matches known values', () => {
  assert.equal(contrast('#ffffff', '#000000').toFixed(1), '21.0');
  assert.equal(deltaE('#276640', '#276640'), 0);
  // protan and deutan readers lose red against green; tritan readers keep it
  assert.ok(deltaE('#d62728', '#2ca02c', 'deutan') < deltaE('#d62728', '#2ca02c'));
});
