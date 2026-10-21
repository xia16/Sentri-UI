const test = require('node:test');
const assert = require('node:assert/strict');
require('../design-system/components/bundle.js');
const UI = globalThis.SentriUI;

test('sheet drawer: scrim, grab, head without a ✕, body, a Back footer by default', () => {
  const html = UI.sheet({ title: 'Record a death', body: '<p>x</p>' });
  assert.match(html, /^<button type="button" class="scrim"/);
  assert.match(html, /role="dialog" aria-modal="true" data-st-context="drawer" data-size="medium" data-sizing="content"/);
  assert.match(html, /<div class="grab" aria-hidden="true">/);
  assert.doesNotMatch(html, /sheet-close/);
  assert.equal((html.match(/class="button secondary surface-back"/g) || []).length, 1);
});
test('nothing else in the head; a drawer with levels: a ✕ closes, no "‹ Parent" (owner ruling B, 2026-10-16)', () => {
  const html = UI.sheet({ title: 'T', aside: '<button class="st-text-action">Clear</button>', subtitle: 'B4' });
  assert.doesNotMatch(html, /Clear|sheet-aside|sheet-subtitle|B4/, 'aside and subtitle are retired');
  assert.doesNotMatch(html, /sheet-close|st-sheet-corner/, 'no ✕ unless a drawer with levels asks for one');
  const lv = UI.sheet({ title: 'Respiratory diseases', up: { label: 'Diseases', action: 'step', value: '1' }, cross: { action: 'dismiss', label: { text: 'Close', str: 'act.close' } }, footer: UI.sheetFooter({ back: { action: 'step', value: '1' } }) });
  const head = lv.match(/<header[^]*<\/header>/)[0];
  assert.doesNotMatch(head, /sheet-up|Diseases|>Back</, 'the retired up control is not drawn');
  assert.match(head, /<button type="button" class="st-sheet-corner" data-corner="start" data-ds="Sheet" data-action="dismiss"[^>]*aria-label="Close"/);
  assert.match(head, /<h2 class="sheet-title">Respiratory diseases<\/h2>/);
  assert.match(lv, /class="sheet-footer"[^]*data-action="step" data-value="1"[^]*>Back</, 'the footer Back goes up a level');
});
test('sheet page: no scrim, no grab, no ✕, one Back; dialog: backdrop, no ✕', () => {
  const page = UI.sheet({ variant: 'page', title: 'Log', bar: '<div class="statusbar"></div>', footer: false });
  assert.doesNotMatch(page, /class="scrim"|class="grab"|sheet-close|aria-modal|surface-back/);
  assert.match(page, /role="region" data-st-context="page" data-presentation="page"/);
  assert.equal((page.match(/class="st-page-back"/g) || []).length, 1, 'one Back, top left');
  const dlg = UI.sheet({ variant: 'dialog', title: 'End?', icon: 'alert', description: 'Records are kept.' });
  assert.match(dlg, /<p class="dialog-desc">Records are kept\.<\/p>/);
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
  const html = UI.sheet({ variant: 'page', title: { text: 'Pen log', str: 'log.title' }, line: { text: [{ text: 'B4' }, { sep: true }, { text: '2 open', tone: 'amber' }] } });
  assert.match(html, /<span data-str="log.title">Pen log<\/span>/);
  assert.match(html, /st-part" data-tone="amber"/);
  assert.match(UI.sheet({ title: { html: '<a>x</a>' } }), /<h2 class="sheet-title"><a>x<\/a>/);
});
test('headers: the sheet header takes a route line (chip + at most two facts) or one fact; nothing else acts', () => {
  const html = UI.sheet({ title: 'Farrowing record', line: { chip: { id: '000418', action: 'profile', label: 'View sow 000418' }, facts: ['B1', 'Parity 3', 'extra'] } });
  const head = html.match(/<header[^]*<\/header>/)[0];
  assert.match(head, /class="st-header-line" data-line="route"><button type="button" class="st-subject-chip" data-action="profile" data-value="000418" aria-label="View sow 000418">/);
  assert.match(head, /#000418/);
  assert.equal((head.match(/class="st-sep"/g) || []).length, 1, 'two facts at most, one separator');
  assert.equal((head.match(/<button/g) || []).length, 1, 'the chip is the only control in the head');
  const fact = UI.sheet({ title: 'Pen note', line: { text: [{ text: 'Last record ' }, { text: '08:41', strong: true }] } });
  assert.match(fact, /data-line="fact">Last record <strong>08:41<\/strong><\/p>/);
  assert.doesNotMatch(UI.sheet({ title: 'Record dead' }), /st-header-line/, 'absent by default');
});
test('headers: a page takes the page header (Back top left, title, line); a task page header draws the same', () => {
  const page = UI.sheet({ variant: 'page', title: 'Scan ear tags', back: { action: 'scan-back' }, footer: false });
  assert.match(page, /<header class="st-page-header" data-ds="Sheet"><button type="button" class="st-page-back" data-action="scan-back"/);
  assert.doesNotMatch(page, /utility-header|sheet-footer/);
  require('../design-system/components/task-skeleton.js');
  const th = globalThis.SentriTask.header({ title: 'Farrowing', back: { action: 'room-home' }, line: { text: 'Last record 08:41' } });
  assert.match(th, /class="st-page-header tk-header" data-ds="Header"><button type="button" class="st-page-back" data-action="room-home"/);
  assert.match(th, /<h1 class="st-page-title">Farrowing<\/h1><p class="st-header-line" data-line="fact">Last record 08:41<\/p>/);
  assert.match(globalThis.SentriTask.header({ title: 'Piglet processing' }), /class="st-page-back" data-action="back"/, 'Back always');
});
test('headers: Reset and Clear are the sheet header\'s corner action (top right); the footer keeps Back and the primary', () => {
  const d = UI.sheet({ title: 'Record dead', corner: { label: { text: 'Clear', str: 'act.clear' }, action: 'clear' }, body: '', footer: UI.sheetFooter({ primary: { label: 'Save', action: 's' } }) });
  assert.match(d, /<div class="sheet-text" data-corners="end"><h2 class="sheet-title">Record dead<\/h2><button type="button" class="st-text-action st-sheet-corner"[^>]*data-corner="end"[^>]*>[^]*data-str="act.clear"/);
  const r = UI.sheet({ title: 'Farrowing record', line: { text: 'B1' }, corner: { label: 'Clear', action: 'clear' }, body: '' });
  assert.match(r, /class="sheet-text" data-corners="end"><h2 class="sheet-title">Farrowing record<\/h2><p class="st-header-line"[^]*st-sheet-corner/, 'the corner is centred on the title + line block');
  assert.doesNotMatch(UI.sheet({ title: 'Record dead', body: '' }), /sheet-text|st-sheet-corner/, 'no corner, no block: the header is as before');
  assert.match(UI.sheet({ title: 'T', cross: { action: 'dismiss' }, body: '' }), /<button type="button" class="st-sheet-corner" data-corner="start"[^>]*aria-label="Close"/);
  const f = UI.sheetFooter({ back: { action: 'back' }, quiet: { label: 'Clear', action: 'clear' }, primary: { label: 'Save', action: 's' } });
  assert.doesNotMatch(f, /data-action="clear"/, 'the footer quiet action is retired');
  const fs = UI.filterSheet({ title: 'Filter sows', reset: { label: 'Reset', action: 'r' }, apply: { label: 'Show 4 sows', action: 'a' } });
  assert.match(fs, /utility-header[^]*data-corner="end"[^]*<\/header>/);
  assert.doesNotMatch(UI.filterSheet({ title: 'Filter sows', reset: false }), /st-sheet-corner/);
});
