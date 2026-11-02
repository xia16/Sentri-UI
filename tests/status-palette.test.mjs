// The status palette (owner, 2026-11-02; scripts/check-colours.mjs STATUS): every fill holding a number carries its own ink at 4.5:1,
// and white reads on the one green button. Colour blindness is out of scope (owner, 2026-11-02: "we dont need compatability").
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { STATUS, contrast, deltaE } from '../scripts/check-colours.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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

test('the check\'s status values are the tokens', () => {
  const tokens = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root, 'ux/design-system/tokens.json'), 'utf8')).color.tokens.map((t) => [t.name, t.value.toLowerCase()]));
  const want = { 'done-fill': STATUS.done.fill, 'done-fill-ink': STATUS.done.ink, 'done-mark': STATUS.done.mark, 'progress-fill': STATUS.progress.fill, 'progress-fill-ink': STATUS.progress.ink, 'progress-mark': STATUS.progress.mark, 'amber-fill': STATUS.late.fill, 'amber-fill-ink': STATUS.late.ink, 'late-mark': STATUS.late.mark, handle: STATUS.waiting.track, 'neutral-mark': STATUS.neutral.mark, red: STATUS.actNow.word, 'red-ink': STATUS.actNow.ink, 'red-wash': STATUS.actNow.fill, 'count-key': STATUS.button.fill };
  for (const [name, hex] of Object.entries(want)) assert.equal(tokens[name], hex, `tokens.json ${name}`);
});

test('the math matches known values', () => {
  assert.equal(contrast('#ffffff', '#000000').toFixed(1), '21.0');
  assert.equal(deltaE('#276640', '#276640'), 0);
  assert.ok(deltaE('#ffffff', '#000000') > 99);
});
