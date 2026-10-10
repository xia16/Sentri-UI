const test = require('node:test');
const assert = require('node:assert/strict');
require('../design-system/components/bundle.js');
const UI = globalThis.SentriUI;

test('sheet drawer: scrim, grab, head without a ✕, body, a Back footer by default', () => {
  const html = UI.sheet({ title: 'Record a death', subtitle: 'B4 · 11 alive', body: '<p>x</p>' });
  assert.match(html, /^<button type="button" class="scrim"/);
  assert.match(html, /role="dialog" aria-modal="true" data-st-context="drawer" data-size="medium" data-sizing="content"/);
  assert.match(html, /<div class="grab" aria-hidden="true">/);
  assert.doesNotMatch(html, /sheet-close/);
  assert.equal((html.match(/class="button secondary surface-back"/g) || []).length, 1);
});
test('no ✕ on any drawer; the aside ends the head; up names the parent and is never Back', () => {
  const html = UI.sheet({ title: 'T', aside: '<button class="st-text-action">Clear</button>' });
  assert.match(html, /class="sheet-aside">.*Clear.*<\/div><\/header>/);
  assert.doesNotMatch(html, /sheet-close/);
  const up = UI.sheet({ title: 'Respiratory diseases', up: { label: 'Diseases', action: 'step', value: '1' } });
  assert.match(up, /<button type="button" class="sheet-up" data-ds="Sheet" data-action="step" data-value="1"><svg[^]*<span>Diseases<\/span><\/button><h2 class="sheet-title">Respiratory diseases/);
  assert.doesNotMatch(up.match(/<header[^]*<\/header>/)[0], />Back</);
});
test('sheet page: no scrim, no grab, no ✕, one Back; dialog: backdrop, no ✕', () => {
  const page = UI.sheet({ variant: 'page', title: 'Log', bar: '<div class="statusbar"></div>' });
  assert.doesNotMatch(page, /class="scrim"|class="grab"|sheet-close|aria-modal/);
  assert.match(page, /role="region" data-st-context="page" data-presentation="page"/);
  assert.equal((page.match(/surface-back/g) || []).length, 1);
  const dlg = UI.sheet({ variant: 'dialog', title: 'End?', icon: 'alert', subtitle: 'Records are kept.' });
  assert.match(dlg, /^<div class="dialog-backdrop"/);
  assert.doesNotMatch(dlg, /sheet-close|class="grab"/);
});
test('sheet footer: a waiting primary stands alone (no reason line drawn), still described by its reason', () => {
  const waiting = UI.sheetFooter({ primary: { label: 'Save', action: 's', waiting: true }, status: { text: 'Say how many died', id: 'why' } });
  assert.match(waiting, /<p class="sheet-status st-visually-hidden" id="why" role="status"/);
  assert.match(waiting, /aria-disabled="true"[^>]*aria-describedby="why"|aria-describedby="why"[^>]*aria-disabled="true"/);
  const quiet = UI.sheetFooter({ primary: { label: 'Save', action: 's' }, status: { text: 'x', id: 'q' } });
  assert.match(quiet, /sheet-status st-visually-hidden/);
});
test('sheet footer: Back alone fills the bar; two controls at most', () => {
  const f = UI.sheetFooter({ back: { action: 'back' }, primary: { label: 'Go', action: 'go' } });
  assert.equal((f.match(/<button/g) || []).length, 2);
  assert.equal((UI.sheetFooter({}).match(/<button/g) || []).length, 1);
});
test('sheet slots: string registry twin and trusted html', () => {
  const html = UI.sheet({ variant: 'page', title: { text: 'Pen log', str: 'log.title' }, subtitle: [{ text: 'B4' }, { sep: true }, { text: '2 open', tone: 'amber' }] });
  assert.match(html, /<span data-str="log.title">Pen log<\/span>/);
  assert.match(html, /st-part" data-tone="amber"/);
  assert.match(UI.sheet({ title: { html: '<a>x</a>' } }), /<h2 class="sheet-title"><a>x<\/a>/);
});
