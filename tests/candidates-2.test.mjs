// Design-system candidates 2 (candidate, ADR 0002): the hold's rules, radio keys, the Row roots, token parity.
// Run: node --test tests/candidates-2.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
require('../ux/design-system/components/bundle.js');
const UI = globalThis.SentriUI;
const run = (events, phase = 'idle') => events.reduce((acc, e) => {
  const r = UI.holdStep({ phase: acc.phase, armedAt: acc.armedAt }, e);
  return { phase: r.phase, armedAt: r.armedAt, commits: acc.commits + (r.commit ? 1 : 0), cue: r.cue };
}, { phase, armedAt: null, commits: 0, cue: null });
const key = (at, repeat = false) => ({ type: 'key', at, repeat });

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
test('hold: keyboard two-step — arm, then a second press at least 400ms later commits', () => {
  const armed = UI.holdStep({ phase: 'idle' }, key(1000));
  assert.deepEqual(armed, { phase: 'armed', armedAt: 1000, commit: false, cue: 'again' });
  assert.equal(run([key(1000), key(1500)]).commits, 1);
  const early = run([key(1000), key(1200)]);
  assert.equal(early.commits, 0);
  assert.equal(early.phase, 'armed');
  assert.equal(early.cue, 'early');
  assert.equal(run([key(1000), key(1200), key(1450)]).commits, 1, 'the early press does not re-arm');
});
test('hold: a repeated key (Enter held down) never arms or commits', () => {
  assert.equal(run([key(1000, true)]).phase, 'idle');
  const r = run([key(1000), key(1100, true), key(1200, true), key(2000, true)]);
  assert.equal(r.commits, 0);
  assert.equal(r.phase, 'armed');
});
test('hold: timeout, blur and Escape disarm; the next press arms again', () => {
  assert.equal(run([key(0), 'timeout']).phase, 'idle');
  assert.equal(run([key(0), 'blur', key(900)]).phase, 'armed');
  assert.equal(run([key(0), 'escape']).cue, 'disarmed');
});
test('hold: settle — done and unknown are terminal, failed returns to idle', () => {
  const pending = { phase: 'pending' };
  assert.equal(UI.holdStep(pending, { type: 'settle', outcome: 'done' }).phase, 'done');
  assert.equal(UI.holdStep(pending, { type: 'settle', outcome: 'failed' }).phase, 'idle');
  const unknown = UI.holdStep(pending, { type: 'settle', outcome: 'unknown' });
  assert.equal(unknown.phase, 'unknown');
  for (const e of ['down', 'elapsed', key(0), key(900), { type: 'settle', outcome: 'failed' }]) {
    assert.equal(UI.holdStep({ phase: 'unknown' }, e).phase, 'unknown', 'an irreversible act is never re-offered');
    assert.equal(UI.holdStep({ phase: 'done' }, e).phase, 'done');
  }
});
test('hold: pending ignores everything but settle', () => {
  assert.equal(run(['down', 'elapsed', 'down', 'elapsed', key(0), key(900)]).commits, 1);
});
test('hold: the defaults match the tokens (hold-commit, hold-arm)', () => {
  const t = JSON.parse(readFileSync(new URL('../ux/design-system/tokens.json', import.meta.url), 'utf8'));
  const ms = n => parseFloat(t.motion.tokens.find(x => x.name === n).value);
  assert.equal(UI.HOLD.commit, ms('hold-commit'));
  assert.equal(UI.HOLD.arm, ms('hold-arm'));
});
test('holdButton: a waiting hold is aria-disabled and described by its reason; pending is busy', () => {
  const w = UI.holdButton({ label: 'End task', waiting: true, describedby: 'why', statusId: 'hold-line', id: 'h' });
  assert.match(w, /data-waiting=""/);
  assert.match(w, /aria-describedby="h-caption hold-line why"/);
  assert.match(w, /aria-disabled="true"/);
  assert.match(UI.holdButton({ label: 'x', phase: 'pending' }), /aria-busy="true"/);
});
test('radioNext: arrows wrap, Home and End jump, other keys do nothing', () => {
  const v = ['a', 'b', 'c'];
  assert.equal(UI.radioNext(v, 'a', 'ArrowDown'), 'b');
  assert.equal(UI.radioNext(v, 'c', 'ArrowRight'), 'a');
  assert.equal(UI.radioNext(v, 'a', 'ArrowUp'), 'c');
  assert.equal(UI.radioNext(v, 'b', 'ArrowLeft'), 'a');
  assert.equal(UI.radioNext(v, 'b', 'Home'), 'a');
  assert.equal(UI.radioNext(v, 'a', 'End'), 'c');
  assert.equal(UI.radioNext(v, '', 'ArrowDown'), 'a');
  assert.equal(UI.radioNext(v, 'a', 'Tab'), null);
  assert.equal(UI.radioNext([], 'a', 'ArrowDown'), null);
});
test('choice radios: one tab stop; Clear only on an optional field with a value', () => {
  const opts = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }];
  const none = UI.choiceRadios({ label: 'X', options: opts, optional: 'Optional' });
  assert.equal((none.match(/tabindex="0"/g) || []).length, 1);
  assert.match(none, /aria-checked="false" tabindex="0" data-action="choose" data-value="a"/);
  assert.doesNotMatch(none, /choose-clear/);
  const chosen = UI.choiceRadios({ label: 'X', options: opts, selected: 'b', layout: 'inline', optional: 'Optional', key: 'sex' });
  assert.match(chosen, /aria-checked="true" tabindex="0" data-action="choose" data-value="b"/);
  assert.match(chosen, /data-action="choose-clear" data-value="sex"/);
  assert.match(chosen, /role="radiogroup"/);
  assert.doesNotMatch(UI.choiceRadios({ label: 'X', options: opts, selected: 'b' }), /choose-clear/, 'a required field has no Clear');
});
test('row: existing navigation signature retains content and routing', () => {
  assert.equal(UI.row({ title: 'Pen 14', description: '3 sows due today', action: 'open', value: 'p14' }),
    '<button class="st-row " data-ds="Row" data-variant="plain" type="button" data-action="open" data-value="p14"><span class="st-row-copy"><strong>Pen 14</strong><small>3 sows due today</small></span><span class="st-row-chevron"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7"/></svg></span></button>');
});
test('row: colour lives on the value; the separator is a real text node', () => {
  const html = UI.row({ title: [[{ text: 'Overdue' }, { text: '3 days', tone: 'red' }]], description: ['7 alive', 'parity 5'] });
  assert.match(html, /<span class="st-tok">Overdue <span class="st-part" data-tone="red">3 days<\/span><\/span>/);
  assert.match(html, /<span class="st-tok">7 alive<\/span><span class="st-sep" data-str="ds.sep">·<\/span><span class="st-tok">parity 5<\/span>/);
});
test('rowSelect: a label with a checkbox; the payload is change-only { value, checked }', () => {
  const html = UI.rowSelect({ title: 'Iron', value: 'A02', checked: true, action: 'toggle' });
  assert.match(html, /^<label class="st-row [^"]*" data-ds="Row" data-variant="select-door" data-select="">/);
  assert.match(html, /<input type="checkbox" data-action="toggle" value="A02" checked>/);
  const input = { type: 'checkbox', value: 'A02', checked: false, getAttribute: () => 'toggle', closest: sel => (sel === '.st-row[data-select]' ? {} : null) };
  assert.deepEqual(UI.rowSelectChange({ target: input }), { value: 'A02', checked: false, action: 'toggle' });
  assert.equal(UI.rowSelectChange({ target: { type: 'button', closest: () => ({}) } }), null);
  assert.equal(UI.rowSelectChange({ target: { type: 'checkbox', closest: () => null } }), null);
});
test('rowAction: two sibling targets; the act is named with the row title; pending is busy', () => {
  const html = UI.rowAction({ id: 'r1', title: 'Iron', action: 'open-dose', value: 'iron', act: { label: 'Record 12', action: 'record', value: 'iron' } });
  assert.match(html, /^<div class="st-row [^"]*" data-ds="Row" data-variant="door-act" data-act="" id="r1">/);
  assert.equal((html.match(/<button/g) || []).length, 2);
  assert.match(html, /<strong id="r1-title">/);
  assert.match(html, /id="r1-act"[^>]*aria-labelledby="r1-act r1-title"/);
  const busy = UI.rowAction({ id: 'r2', title: 'Iron', act: { label: 'Recording', busy: true } });
  assert.match(busy, /aria-disabled="true" aria-busy="true"/);
});
test('photos: inactive and full grey the camera with a reason, never disabled', () => {
  assert.match(UI.photos({ active: false }), /aria-disabled="true" data-reason="inactive"/);
  assert.match(UI.photos({ items: Array.from({ length: 12 }, (_, i) => ({ id: i })) }), /data-reason="full"/);
  assert.doesNotMatch(UI.photos({}), /aria-disabled|\sdisabled/);
  assert.match(UI.photos({ items: [{ id: 'a', pending: true }] }), /data-pending=""/);
});
test('live regions mount empty: the content waits in a template', () => {
  assert.match(UI.statusLine(['Saved'], { live: true }), /role="status" aria-live="polite" aria-atomic="true" data-live=""><template><span class="st-tok">Saved<\/span><\/template><\/p>$/);
  const b = UI.banner({ tone: 'correction', headline: 'H', summary: ['x'] });
  assert.equal((b.match(/role="status"/g) || []).length, 1, 'one live region per banner');
});
test('button waiting: aria-disabled, focusable, described by its reason; text register too', () => {
  const html = UI.button({ label: 'Save', register: 'primary', waiting: true, describedby: 'why' });
  assert.match(html, /aria-disabled="true" aria-describedby="why"/);
  assert.doesNotMatch(html, /\sdisabled[\s>]/);
  assert.match(UI.button({ label: 'Clear', register: 'text', waiting: true }), /class="st-text-action"[^>]*aria-disabled="true"/);
});

// ---- Refute round (gpt-6-astra): each class pinned by a test that failed on e32a857 ----
function fakeHoldDom() {
  const attrs = { 'data-phase': 'idle' };
  const b = {
    isConnected: true,
    getAttribute: k => (k in attrs ? attrs[k] : null), setAttribute: (k, v) => { attrs[k] = String(v); },
    removeAttribute: k => { delete attrs[k]; }, hasAttribute: k => k in attrs,
    querySelector: () => null, closest: () => b,
  };
  const handlers = {};
  const scope = { addEventListener: (n, f) => { handlers[n] = f; }, removeEventListener: () => {}, querySelectorAll: () => [b] };
  const ev = (key, repeat) => ({ key, repeat, target: b, preventDefault() {}, stopPropagation() {} });
  return { b, scope, handlers, ev, attrs };
}
test('refute 1: a held Enter does not extend the arm window; a press after it re-arms, never commits', () => {
  let t = 0, commits = 0;
  const d = fakeHoldDom();
  const h = UI.holdBind(d.scope, { now: () => t, vibrate: false, onCommit: () => { commits++; } });
  d.handlers.keydown(d.ev('Enter', false));                 // t=0: arm
  for (t = 100; t <= 6000; t += 100) d.handlers.keydown(d.ev('Enter', true));   // held 6s: repeats only
  t = 6500; d.handlers.keydown(d.ev('Enter', false));       // after the 5s deadline
  assert.equal(commits, 0);
  assert.equal(d.attrs['data-phase'], 'armed', 'the late press is a fresh first press');
  t = 7000; d.handlers.keydown(d.ev('Enter', false));       // a deliberate second press inside the new window
  assert.equal(commits, 1);
  h.destroy();
});
test('refute 1: holdStep enforces the arm deadline against armedAt', () => {
  const late = UI.holdStep({ phase: 'armed', armedAt: 0 }, { type: 'key', at: 6500 }, { arm: 5000 });
  assert.equal(late.commit, false);
  assert.equal(late.phase, 'armed');
  assert.equal(late.armedAt, 6500);
  assert.equal(UI.holdStep({ phase: 'armed', armedAt: 0 }, { type: 'key', at: 4900 }, { arm: 5000 }).commit, true);
});
test('refute 2: two guard calls 30ms apart keep the reason (announce never reads the emptied DOM)', async () => {
  const reason = { innerHTML: 'Choose a cause for 2 crushed to save', getAttribute: k => (k === 'role' ? 'status' : null), setAttribute() {}, removeAttribute() {} };
  const btn = { getAttribute: k => (k === 'aria-disabled' ? 'true' : k === 'aria-describedby' ? 'why' : null) };
  const prev = globalThis.document;
  globalThis.document = { getElementById: id => (id === 'why' ? reason : null) };
  try {
    UI.guard(btn, { flash: 10 });
    await new Promise(r => setTimeout(r, 30));
    UI.guard(btn, { flash: 10 });
    await new Promise(r => setTimeout(r, 150));
    assert.equal(reason.innerHTML, 'Choose a cause for 2 crushed to save');
  } finally { globalThis.document = prev; }
});
test('refute 2: a superseded announcement never lands', async () => {
  const el = { innerHTML: '' };
  UI.announce(el, 'first');
  UI.announce(el, 'second');
  await new Promise(r => setTimeout(r, 150));
  assert.equal(el.innerHTML, 'second');
});
test('refute 3: a capture error resolves to its registered message, amber, without a caller hint', () => {
  const strings = JSON.parse(readFileSync(new URL('../ux/laws/strings.json', import.meta.url), 'utf8')).strings;
  for (const [error, id] of [['denied', 'ds.c2.photos.denied'], ['too-large', 'ds.c2.photos.too_large']]) {
    const html = UI.photos({ error });
    assert.match(html, new RegExp(`data-tone="amber"><span class="st-field-hint-text"><span data-str="${id.replace(/\./g, '\\.')}">`));
    assert.ok(html.includes(strings[id].en), `${error}: the en message is the fallback text`);
    assert.ok(strings[id].zh, `${error}: zh is registered`);
  }
  assert.doesNotMatch(UI.photos({ error: 'cancelled' }), /st-field-hint-text/, 'a cancelled capture says nothing');
});
test('refute 4: handFocus moves focus only when it is still inside what is leaving', () => {
  let focused = 0;
  const target = { focus: () => { focused++; } };
  const inside = {}, outside = {};
  const leaving = { contains: n => n === inside };
  const prev = globalThis.document;
  try {
    globalThis.document = { activeElement: outside };
    assert.equal(UI.handFocus(leaving, target), false);
    assert.equal(focused, 0, 'focus elsewhere is left alone');
    globalThis.document = { activeElement: inside };
    assert.equal(UI.handFocus(leaving, target), true);
    assert.equal(focused, 1);
  } finally { globalThis.document = prev; }
});

// ---- Refute round 2 (on 188a61d): a guard replay keeps the host's localization ----
function localizingLine() {
  const line = { innerHTML: '', getAttribute: k => (k === 'role' ? 'status' : null), setAttribute() {}, removeAttribute() {} };
  let runs = 0;
  // A zh host: the payload has an empty fallback and a data-str id; `then` (PP.apply) fills it.
  const then = el => { runs++; el.innerHTML = el.innerHTML.replace('<span data-str="why"></span>', '<span data-str="why">保存前请选择原因</span>'); };
  return { line, then, runs: () => runs };
}
async function withDoc(line, fn) {
  const prev = globalThis.document;
  globalThis.document = { getElementById: id => (id === 'why' ? line : null) };
  try { await fn(); } finally { globalThis.document = prev; }
}
const waitBtn = { getAttribute: k => (k === 'aria-disabled' ? 'true' : k === 'aria-describedby' ? 'why' : null) };
const sleep = ms => new Promise(r => setTimeout(r, ms));
test('refute 2b: a tap after the reason rendered replays it localized', async () => {
  const L = localizingLine();
  await withDoc(L.line, async () => {
    UI.announce(L.line, '<span data-str="why"></span>', { then: L.then });
    await sleep(100);
    assert.match(L.line.innerHTML, /保存前请选择原因/);
    UI.guard(waitBtn, { flash: 10 });
    await sleep(100);
    assert.match(L.line.innerHTML, /保存前请选择原因/, 'the replay is localized, not blank');
  });
});
test('refute 2b: a tap during the first delay still localizes the reason', async () => {
  const L = localizingLine();
  await withDoc(L.line, async () => {
    UI.announce(L.line, '<span data-str="why"></span>', { then: L.then });
    await sleep(20);
    UI.guard(waitBtn, { flash: 10 });
    await sleep(150);
    assert.ok(L.runs() >= 1, 'the localization ran');
    assert.match(L.line.innerHTML, /保存前请选择原因/);
  });
});
