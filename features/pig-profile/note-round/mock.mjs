// The pig note, round 2 (owner, 2026-11-03): no mark ("make it simple"), and the note ends ("note should have an expiry, or else it
// is always there"). On the record the note is a row led by the bookmark, its text not bold, its end on the right; past the end it
// leaves the record and stays in the Log. The Add a note drawer is on the tint with white cards like every drawer (surfaces rule,
// 2026-11-03: "we only have grey background"). Renders the canvas's screens from the live prototype at 390, one PNG each, into this
// folder. "now" is this branch's page; the rest is laid over the live page, nothing is built.
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
const TEXT = 'Red line on left shoulder · monitor overnight';

// The record's note: one row led by the bookmark, the text at row weight, the day it ends on the right (the walk is 12 Sep).
function noteRow([text, until]) {
  const sec = document.querySelector('.pig-note');
  if (!sec) return;
  sec.innerHTML = '<div class="compact-actions st-panel st-row-group st-action-list">' + SentriUI.row({ variant: 'navigation', icon: SentriIcons.icon('bookmark'), title: text, trailing: { text: until }, wrap: true, action: 'pig-log', value: '000306' }) + '</div>';
  const t = sec.querySelector('.st-row-copy strong');
  if (t) t.style.fontWeight = '400';
}

// Add a note: the drawer on the tint, the note in a white card, then how long it shows on her record: a Choice (3 days chosen), its
// heading on the tint above its card. Nothing here is the drawer's real paint yet; the surfaces sweep moves every drawer.
function noteSheet([showFor]) {
  const sheet = document.querySelector('textarea')?.closest('.sheet');
  const field = document.querySelector('textarea')?.closest('.field');
  if (!sheet || !field || !showFor) return;
  sheet.style.background = 'var(--app-background)';
  sheet.querySelector('.sheet-head, header')?.style.setProperty('background', 'transparent');
  const card = document.createElement('div');
  card.className = 'st-panel';
  card.style.setProperty('--st-panel-bg', 'var(--paper)');
  field.before(card);
  card.append(field);
  const options = [['1', '1 day'], ['3', '3 days'], ['7', '1 week']].map(([value, label]) => ({ value, label }));
  const choice = document.createElement('div');
  choice.className = 'st-panel';
  choice.style.cssText = 'margin-top:var(--space-12);--st-panel-bg:var(--paper)';
  choice.innerHTML = SentriUI.choiceRadios({ label: 'Show on her record for', key: 'noteFor', action: 'note-for', layout: 'inline', face: 'row', options, selected: showFor });
  // The label over the options, like the Note field's (the inline Choice puts it beside them; too long for that here).
  const inline = choice.querySelector('.st-choice-inline');
  inline.style.cssText = 'flex-wrap:wrap;row-gap:8px';
  const lab = inline.querySelector('.st-choice-inline-label');
  const noteLab = getComputedStyle(field.querySelector('span'));
  lab.style.cssText = `flex:1 0 100%;font-size:${noteLab.fontSize};font-weight:${noteLab.fontWeight};color:${noteLab.color}`;
  inline.querySelector('.st-choice-inline-opts').style.flex = '1 0 100%';
  card.after(choice);
}

const shots = {
  'record-now': { steps: save(TEXT) },
  'record-new': { steps: save(TEXT), over: [noteRow, [TEXT, 'Until 15 Sep']] },
  'sheet-now': { steps: open },
  'sheet-new': { steps: open, over: [noteSheet, ['3']] },
  'sheet-filled': { steps: [...open, { fill: 'textarea', text: TEXT }], over: [noteSheet, ['3']] },
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
