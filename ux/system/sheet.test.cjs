const test = require('node:test');
const assert = require('node:assert/strict');
require('../design-system/components/bundle.js');
const UI = globalThis.SentriUI;

test('sheet drawer: scrim, grab, head, body, a Back footer by default and no ✕', () => {
  const html = UI.sheet({ title: 'Record a death', subtitle: 'B4 · 11 alive', body: '<p>x</p>' });
  assert.match(html, /^<button type="button" class="scrim"/);
  assert.match(html, /role="dialog" aria-modal="true" data-st-context="drawer" data-size="medium" data-sizing="content"/);
  assert.match(html, /<div class="grab" aria-hidden="true">/);
  assert.equal((html.match(/sheet-close/g) || []).length, 0);
  assert.equal((html.match(/class="button secondary surface-back"/g) || []).length, 1);
});
test('sheet drawer: the footer Back is the exit, so no ✕; a drawer with no footer keeps one; the aside sits in the head', () => {
  const html = UI.sheet({ title: 'T', aside: '<button class="st-text-action">Clear</button>', close: { action: 'dismiss' } });
  assert.doesNotMatch(html, /sheet-close/);
  assert.match(html, /class="sheet-aside">.*Clear.*<\/div><\/header>/);
  assert.match(UI.sheet({ title: 'T', footer: false }), /class="icon-button sheet-close"/);
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
test('sheet footer: a waiting primary has no reason line; a status is drawn only when visible or carrying an action', () => {
  const waiting = UI.sheetFooter({ primary: { label: 'Save', action: 's', waiting: true }, status: { text: 'Say how many died', id: 'why' } });
  assert.doesNotMatch(waiting, /sheet-status|role="status"|aria-describedby|Say how many died/);
  assert.match(waiting, /aria-disabled="true"/);
  const shown = UI.sheetFooter({ primary: { label: 'Save', action: 's' }, status: { text: 'Saving', id: 'q', visible: true } });
  assert.match(shown, /<p class="sheet-status" id="q" role="status"/);
  assert.match(shown, /aria-describedby="q"/);
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
