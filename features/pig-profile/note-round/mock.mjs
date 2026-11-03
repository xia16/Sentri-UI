// The pig note as a bookmark (owner, 2026-11-03): on the record the note is a row led by a bookmark, its text not bold; adding a note
// can carry a mark, the paint the worker put on the sow (a colour and, if wanted, a shape), or none ("they don't need one if it's
// just a note"). Renders the canvas's screens from the live prototype at 390, one PNG each, into this folder. "now" is this branch's
// page; "new" is laid over the live page, nothing is built.
// Usage: node features/pig-profile/note-round/mock.mjs <base url>
//   e.g. node features/pig-profile/note-round/mock.mjs http://localhost:4400/.claude/worktrees/pig-record-trim
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { playwright } from '../../../scripts/playwright-path.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const base = (process.argv[2] || 'http://localhost:4317').replace(/\/$/, '');
const { chromium } = playwright();
const url = '/ux/system/inspection-astra-concept.html?layout=focus&screen=pig-profile.full';
const open = ['[data-action="pig-actions"]', '.st-row-tile[data-action="note"]'];
const save = (text) => [...open, { fill: 'textarea', text }, '[data-action="bulk-save"]', '[data-action="pig"][data-value="000306"]'];

// Marker paint, the colours stock markers come in. Green is left out: green means done. New tokens if built (mark-*).
const PAINT = { red: ['Red', '#c0392b'], blue: ['Blue', '#2f62b5'], orange: ['Orange', '#d9741a'], purple: ['Purple', '#7148ad'], black: ['Black', '#20291f'] };

// The record's note: one row led by the bookmark, the text at row weight. A mark colours the bookmark and says itself on line 2.
function noteRow([text, mark, PAINT]) {
  const sec = document.querySelector('.pig-note');
  if (!sec) return;
  const p = mark && PAINT[mark.colour];
  const glyph = SentriIcons.icon('bookmark').replace('<svg', `<svg style="${p ? `color:${p[1]};fill:${p[1]}` : ''}"`);
  sec.innerHTML = '<div class="compact-actions st-panel st-row-group st-action-list">' + SentriUI.row({ variant: 'navigation', icon: glyph, title: text, description: p ? `${p[0]} ${mark.shape || 'mark'}`.trim() : '', wrap: true, action: 'pig-log', value: '000306' }) + '</div>';
  const t = sec.querySelector('.st-row-copy strong');
  if (t) t.style.fontWeight = '400';
}

// Add a note: the note field as it is, then an optional Mark: a row of paint swatches (none chosen = just a note); a chosen colour
// opens Shape inline beneath it (Line, Dot, Cross), the dependent-field law. Save says what it saves.
function noteSheet([colour, shape, PAINT]) {
  const field = document.querySelector('textarea')?.closest('.st-field, .field, label, div');
  if (!field) return;
  const sw = Object.entries(PAINT).map(([k, [name, hex]]) => `<button type="button" aria-label="${name}" aria-pressed="${k === colour}" style="display:grid;place-items:center;width:48px;height:48px;padding:0;border:0;border-radius:50%;background:transparent;${k === colour ? 'box-shadow:0 0 0 2px var(--ink)' : ''}"><span style="width:34px;height:34px;border-radius:50%;background:${hex}"></span></button>`).join('');
  const shapes = ['Line', 'Dot', 'Cross'].map((s) => ({ value: s.toLowerCase(), label: s }));
  const shapeRow = colour ? SentriUI.choiceRadios({ label: 'Shape', key: 'markShape', action: 'mark-shape', layout: 'inline', face: 'row', optional: 'Optional', options: shapes, selected: shape || '' }) : '';
  const block = document.createElement('div');
  block.innerHTML = `<div style="margin-top:20px"><div style="display:flex;align-items:baseline;gap:8px;margin-bottom:8px"><span style="font:500 15px/1.4 var(--font-sans);color:var(--ink)">Mark</span><span style="font:400 11px/1.4 var(--font-sans);color:var(--muted)">Optional · the paint on her</span></div><div role="radiogroup" aria-label="Mark colour" style="display:flex;gap:10px">${sw}</div>${shapeRow ? `<div style="margin-top:12px">${shapeRow}</div>` : ''}</div>`;
  field.after(block);
  const btn = document.querySelector('[data-action="bulk-save"]');
  if (btn && colour) btn.textContent = 'Save note and mark';
}

const shots = {
  'record-now': { steps: save('Red line on left shoulder · monitor overnight') },
  'record-plain': { steps: save('Red line on left shoulder · monitor overnight'), over: [noteRow, ['Red line on left shoulder · monitor overnight', null, PAINT]] },
  'record-marked': { steps: save('Left shoulder · monitor overnight'), over: [noteRow, ['Left shoulder · monitor overnight', { colour: 'red', shape: 'line' }, PAINT]] },
  'sheet-now': { steps: open },
  'sheet-new': { steps: open, over: [noteSheet, ['', '', PAINT]] },
  'sheet-marked': { steps: [...open, { fill: 'textarea', text: 'Left shoulder · monitor overnight' }], over: [noteSheet, ['red', 'line', PAINT]] },
};

const browser = await chromium.launch();
for (const [name, s] of Object.entries(shots)) {
  const p = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p.goto(base + url);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  await p.evaluate(() => { const sel = document.querySelector('select.scenario'); sel.value = 'health-mixed'; sel.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.waitForTimeout(500);
  for (const st of s.steps) { if (st.fill) await p.fill(st.fill, st.text); else await p.click(st); await p.waitForTimeout(400); }
  if (s.over) await p.evaluate(s.over[0], s.over[1]);
  await p.waitForTimeout(200);
  await p.screenshot({ path: path.join(here, `${name}.png`) });
  await p.close();
}
await browser.close();
console.log('wrote', here);
