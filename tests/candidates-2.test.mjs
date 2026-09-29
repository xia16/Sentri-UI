// Design-system candidates 2 (candidate, ADR 0002): the hold's rules, and the cards' markup contracts.
// Run: node --test tests/candidates-2.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
require('../ux/design-system/components/bundle.js');
const UI = globalThis.SentriUI;
const run = (events, phase = 'idle') => events.reduce((acc, e) => {
  const r = UI.holdStep({ phase: acc.phase }, e);
  return { phase: r.phase, commits: acc.commits + (r.commit ? 1 : 0), cue: r.cue };
}, { phase, commits: 0, cue: null });

test('hold: down then elapsed commits once and goes pending', () => {
  const r = run(['down', 'elapsed']);
  assert.equal(r.phase, 'pending');
  assert.equal(r.commits, 1);
});
test('hold: release, leave, cancel, blur and Escape before elapsed never commit', () => {
  for (const e of [{ type: 'up', held: 500 }, 'leave', 'cancel', 'blur', 'escape']) {
    const r = run(['down', e, 'elapsed']);
    assert.equal(r.commits, 0, JSON.stringify(e));
    assert.equal(r.phase, 'idle');
  }
});
test('hold: a quick tap is answered as a tap, a late release as released', () => {
  assert.equal(UI.holdStep({ phase: 'holding' }, { type: 'up', held: 120 }).cue, 'tap');
  assert.equal(UI.holdStep({ phase: 'holding' }, { type: 'up', held: 600 }).cue, 'released');
});
test('hold: keyboard is a two-step — the first press arms, the second commits', () => {
  assert.deepEqual(UI.holdStep({ phase: 'idle' }, 'key'), { phase: 'armed', commit: false, cue: 'again' });
  assert.equal(run(['key', 'key']).commits, 1);
  assert.equal(run(['key', 'timeout', 'key']).phase, 'armed');
  assert.equal(run(['key', 'blur', 'key']).commits, 0);
  assert.equal(run(['key', 'escape']).phase, 'idle');
});
test('hold: pending ignores everything until done or failed', () => {
  assert.equal(run(['down', 'elapsed', 'down', 'elapsed', 'key', 'key']).commits, 1);
  assert.equal(UI.holdStep({ phase: 'pending' }, 'failed').phase, 'idle');
  assert.equal(UI.holdStep({ phase: 'pending' }, 'done').phase, 'idle');
});
test('row: without the candidate options the output is unchanged', () => {
  assert.equal(UI.row({ title: 'Pen 14', description: '3 sows due today', action: 'open', value: 'p14' }),
    '<button class="st-row " data-ds="Row" type="button" data-action="open" data-value="p14"><span class="st-row-copy"><strong>Pen 14</strong><small>3 sows due today</small></span><span class="st-row-chevron"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></span></button>');
});
test('row: colour lives on the value, the word stays plain', () => {
  const html = UI.row({ title: [[{ text: 'Overdue' }, { text: '3 days', tone: 'red' }]] });
  assert.match(html, /<span class="st-tok">Overdue <span class="st-part" data-tone="red">3 days<\/span><\/span>/);
});
test('row act: two targets, never nested buttons', () => {
  const html = UI.row({ title: 'Iron', action: 'open-dose', value: 'iron', act: { label: 'Record 12', action: 'record', value: 'iron' } });
  assert.match(html, /^<div class="st-row [^"]*" data-ds="Row" data-act="">/);
  assert.equal((html.match(/<button/g) || []).length, 2);
});
test('choice radios: one tab stop, on the chosen option (or the first)', () => {
  const opts = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }];
  const none = UI.choiceRadios({ label: 'X', options: opts });
  assert.equal((none.match(/tabindex="0"/g) || []).length, 1);
  assert.match(none, /aria-checked="false" tabindex="0" data-action="choose" data-value="a"/);
  const chosen = UI.choiceRadios({ label: 'X', options: opts, selected: 'b', layout: 'inline' });
  assert.match(chosen, /aria-checked="true" tabindex="0" data-action="choose" data-value="b"/);
  assert.match(chosen, /role="radiogroup"/);
});
test('photos: inactive and full grey the camera as aria-disabled, never disabled', () => {
  assert.match(UI.photos({ active: false }), /aria-disabled="true"/);
  assert.match(UI.photos({ items: Array.from({ length: 12 }, (_, i) => ({ id: i })) }), /aria-disabled="true"/);
  assert.doesNotMatch(UI.photos({}), /aria-disabled|\sdisabled/);
});
test('button waiting: aria-disabled, focusable, described by its reason', () => {
  const html = UI.button({ label: 'Save', register: 'primary', waiting: true, describedby: 'why' });
  assert.match(html, /aria-disabled="true" aria-describedby="why"/);
  assert.doesNotMatch(html, /\sdisabled[\s>]/);
});
