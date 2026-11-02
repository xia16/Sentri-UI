// Mockups for the fat-finger redo (owner, 2026-11-02: no Edit record; a simple way to redo a born or a death after Save).
// Drives the real prototype's counting drawer at 390 and swaps in only what the proposal changes: Undo in the header corner
// (where Clear sits while a visit is unsaved), the redone visit's log line, Litter details without Edit record.
// Usage (from the repo root): node features/farrowing/edit-record-round/mock-undo.mjs <out dir>
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
const { playwright } = await import(pathToFileURL(path.join(root, 'scripts/playwright-path.mjs')).href);
const { chromium } = playwright();
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const port = 4733;
const server = spawn(process.execPath, [path.join(root, 'scripts/serve-ux.cjs'), String(port)], { cwd: root, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 500));
const b = await chromium.launch();

async function open(screen) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(`http://localhost:${port}/ux/system/farrowing-astra-concept.html?layout=focus&screen=${screen}`);
  await p.waitForSelector('html.atlas-ready', { timeout: 15000 });
  return p;
}
const tap = async (p, sel, n = 1) => { for (let i = 0; i < n; i++) { await p.locator(sel).first().click(); await p.waitForTimeout(250); } await p.waitForTimeout(500); };
const shot = async (p, name) => { await p.waitForTimeout(500); await p.screenshot({ path: path.join(out, name) }); };
const PLUS = '[data-action="bornAlive"][data-value="1"]', MINUS = '[data-action="bornAlive"][data-value="-1"]', SAVE = '[data-action="saveVisit"]';

// The corner text action the drawer shows while a visit is unsaved (Clear). After Save the header has no corner; the mock puts the
// draft's header back with the label changed, so Undo sits exactly where Clear sat.
async function keepCornerTemplate(p) {
  await p.evaluate(() => { window.__hdr = document.querySelector('.sheet[data-view="count"] header').outerHTML; });
}
async function corner(p, label) {
  await p.evaluate((label) => {
    const h = document.querySelector('.sheet[data-view="count"] header');
    h.outerHTML = window.__hdr.replace('data-str="act.clear">Clear<', `>${label}<`).replace('data-action="clearVisit"', 'data-action="undoVisit"');
  }, label);
}

{
  const p = await open('farrowing.count');
  // 1. The fat finger: three taps for two piglets.
  await tap(p, PLUS, 3);
  await shot(p, 'undo-1-fat-finger.png');
  await keepCornerTemplate(p);
  // 2. Saved: the corner, empty until now, says Undo.
  await tap(p, SAVE);
  await corner(p, 'Undo');
  await shot(p, 'undo-2-saved.png');
  // 3. Undo: the visit comes back as the draft, exactly as it was before Save (the corner is Clear again).
  await p.close();
}
{
  // The prototype has no undo yet: a fresh drawer with the same three taps is exactly the reopened visit (the record is back at 9).
  const p = await open('farrowing.count');
  await tap(p, PLUS, 3);
  await shot(p, 'undo-3-reopened.png');
  // 4. Fixed: − takes one back, Save.
  await tap(p, MINUS, 1);
  await shot(p, 'undo-4-fixed.png');
  await p.close();
}

// 5. The log: one line for the visit, marked Corrected with what it was.
{
  const p = await open('farrowing.history');
  await p.evaluate(() => {
    const U = window.SentriUI;
    const groups = [
      { label: 'Today', entries: [{ title: '+2 born alive', corrected: true, was: 'Was +3 born alive', meta: '09:43 · G.H' }] },
      { label: 'Aug 26', entries: [
        { title: '+4 alive', meta: '08:41 · G.H' },
        { title: '+3 crushed · +1 other', meta: '08:12 · G.H' },
        { title: '+5 alive', meta: '07:52 · G.H' },
        { title: '+1 stillborn · +1 mummified', meta: '07:30 · G.H' }] },
    ];
    document.querySelector('.st-log').outerHTML = U.log(groups);
  });
  await shot(p, 'undo-5-log.png');
  await p.close();
}

// 6. Litter details: Edit record is gone; the log is the one door.
{
  const p = await open('farrowing.litter');
  await p.evaluate(() => { for (const r of document.querySelectorAll('.st-row')) if (/Edit record/.test(r.textContent)) r.remove(); });
  await shot(p, 'undo-6-litter.png');
  await p.close();
}

// Variant B (owner, 2026-11-02: "should it be inside details and then undo a certain action?"): the card's saved line names what
// was saved, and the undo sits on that one named line in Litter details, the door the card already is. Only the last save has it.
{
  const p = await open('farrowing.count');
  await tap(p, PLUS, 3);
  await tap(p, SAVE);
  await p.evaluate(() => {
    const q = document.querySelector('.sheet[data-view="count"] .alive-quiet');
    q.innerHTML = q.innerHTML.replace('Saved', 'Saved <b class="mock-what">· +3 born</b>');
    const st = document.createElement('style'); st.textContent = '.alive-quiet .mock-what{font-weight:600;color:var(--ink,#1d221e)}'; document.head.append(st);
  });
  await shot(p, 'undo-b1-saved.png');
  await tap(p, '.alive-card');
  await p.evaluate(() => {
    const U = window.SentriUI;
    const doors = document.querySelector('.litter-doors');
    const last = U.rowGroup(U.rowAction({ title: '+3 born alive', description: 'Saved 09:41 · G.H', action: 'history', act: { label: 'Undo', action: 'undoVisit' } }), { title: 'Last save' });
    doors.outerHTML = last + U.rowGroup(U.row({ title: 'Farrowing log', action: 'history', trail: 'chevron' }), { className: 'litter-doors' });
  });
  await shot(p, 'undo-b2-details.png');
  await p.close();
}

// Variant C (owner, 2026-11-02: "maybe we just have a last action by who when. users can click into that to undo"): under the keys,
// one row names the last action, when and who; tapping it asks to undo it. The card's quiet "Saved" time goes (the row says it).
// The row hides while a visit is unsaved: the chips are the visit then, and Clear empties it.
async function lastAction(p, what, when) {
  await p.evaluate(({ what, when }) => {
    const U = window.SentriUI, sheet = document.querySelector('.sheet[data-view="count"]');
    sheet.querySelector('.alive-quiet')?.remove();
    sheet.querySelector('.count-keys').insertAdjacentHTML('afterend',
      U.rowGroup(U.row({ title: what, description: `Last action · ${when}`, action: 'lastAction', trail: 'chevron' }), { className: 'mock-last' }));
    const st = document.createElement('style'); st.textContent = '.mock-last{margin-top:12px}'; document.head.append(st);
  }, { what, when });
}
{
  const p = await open('farrowing.count');
  await lastAction(p, '+4 born alive', 'Aug 26 08:41 · G.H');
  await shot(p, 'undo-c0-idle.png');
  await p.close();
}
{
  const p = await open('farrowing.count');
  await tap(p, PLUS, 3);
  await tap(p, SAVE);
  await lastAction(p, '+3 born alive', '09:41 · G.H');
  await shot(p, 'undo-c1-saved.png');
  await p.evaluate(() => {
    const U = window.SentriUI, sheet = document.querySelector('.sheet[data-view="count"]');
    const body = '<div class="mock-undo-what"><strong>+3 born alive</strong><small>09:41 · G.H</small></div><p class="mock-undo-hint">It comes back as not saved, so you can fix it and save again.</p>';
    sheet.insertAdjacentHTML('afterend', U.sheet({ variant: 'dialog', title: 'Undo the last action?', body,
      footer: '<div class="sheet-footer" data-ds="Sheet"><button type="button" class="button secondary" data-ds="Button" data-register="secondary">Back</button><button type="button" class="button primary" data-ds="Button" data-register="primary">Undo</button></div>' }));
    sheet.setAttribute('inert', '');
    const st = document.createElement('style');
    st.textContent = '.mock-undo-what{display:flex;flex-direction:column;gap:2px;margin-top:12px}.mock-undo-what strong{font-size:17px;font-weight:600;color:var(--ink,#1d221e)}.mock-undo-what small{font-size:13px;color:var(--muted,#6b736d)}.mock-undo-hint{margin:12px 0 0;font-size:14px;color:var(--ink-2,#4a524c)}';
    document.head.append(st);
  });
  await shot(p, 'undo-c2-ask.png');
  await p.close();
}

// Variant D (owner, 2026-11-02, on C: "should be up here with a divider, with undo as a button … the popup is too wordy"):
// the last action sits inside the Alive card under a divider, with its own Undo button. The card stays one surface with two
// sibling targets: the figure area opens Details as before; the Undo button is beside the line, never nested in the door.
// Undo shows only for the worker who saved it, while it is the last action; for anyone else the line is plain text.
async function cardLast(p, what, when, mine) {
  await p.evaluate(({ what, when, mine }) => {
    const sheet = document.querySelector('.sheet[data-view="count"]'), card = sheet.querySelector('.alive-card');
    card.querySelector('.alive-quiet')?.remove();
    const wrap = document.createElement('div'); wrap.className = 'mock-alive';
    card.replaceWith(wrap); wrap.append(card);
    const undo = mine ? `<button type="button" class="button secondary mock-undo" data-ds="Button" data-register="secondary" data-action="undoLast" aria-label="Undo ${what}">${window.SentriIcons.icon('return')}<span>Undo</span></button>` : '';
    wrap.insertAdjacentHTML('beforeend', `<div class="mock-last-line"><span class="mock-last-copy"><strong>${what}</strong><small>${when}</small></span>${undo}</div>`);
    const st = document.createElement('style');
    st.textContent = `.farrowing-phone .mock-alive{margin:0 0 16px;border:1px solid var(--line);border-radius:20px;background:#f6f7f1;overflow:hidden}
      .farrowing-phone .mock-alive .alive-card{margin:0;border:0;border-radius:0;background:transparent}
      .mock-last-line{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:68px;margin:0 16px;padding:12px 0;border-top:1px solid var(--line);box-sizing:border-box}
      .mock-last-copy{display:flex;flex-direction:column;gap:2px;min-width:0}
      .mock-last-copy strong{font:600 15px/20px var(--font-sans);color:var(--ink)}
      .mock-last-copy small{font:400 13px/18px var(--font-sans);color:var(--muted)}
      .farrowing-phone .mock-undo{flex:none;display:inline-flex;align-items:center;gap:6px;width:auto;min-width:0;height:44px;min-height:44px;padding:0 16px}
      .farrowing-phone .mock-undo svg{width:18px;height:18px}`;
    document.head.append(st);
  }, { what, when, mine });
}
{
  const p = await open('farrowing.count');
  await cardLast(p, '+4 born alive', 'Aug 26 08:41 · L.M', false);
  await shot(p, 'undo-d0-not-mine.png');
  await p.close();
}
{
  const p = await open('farrowing.count');
  await tap(p, PLUS, 3);
  await tap(p, SAVE);
  await cardLast(p, '+3 born alive', '09:41 · G.H', true);
  await shot(p, 'undo-d1-saved.png');
  await p.evaluate(() => {
    const U = window.SentriUI, sheet = document.querySelector('.sheet[data-view="count"]');
    sheet.insertAdjacentHTML('afterend', U.sheet({ variant: 'dialog', title: 'Undo +3 born alive?', body: '',
      footer: '<div class="sheet-footer" data-ds="Sheet"><button type="button" class="button secondary" data-ds="Button" data-register="secondary">Back</button><button type="button" class="button primary" data-ds="Button" data-register="primary">Undo</button></div>' }));
    sheet.setAttribute('inert', '');
  });
  await shot(p, 'undo-d2-ask.png');
  await p.close();
}

// Variant E (owner, 2026-11-02: "header should be the time and who, with all the results of that run below it"): the stamp is the
// line's header, and the run's results sit under it as the same chips the unsaved visit wears (+3 born, −1 died, 1 born dead),
// on one line under the header (at most three kinds: born, died, born dead), so a saved run looks as it did before Save, in the quiet tone (saved: colour no longer means "not yet"). Undo is a small key on the right, centred on the run: the return glyph over a 13px word.
async function cardRun(p, stamp, chips, figure, mine) {
  await p.evaluate(({ stamp, chips, figure, mine }) => {
    const ic = (k) => window.SentriIcons.icon(k);
    const sheet = document.querySelector('.sheet[data-view="count"]'), card = sheet.querySelector('.alive-card');
    card.querySelector('.alive-quiet')?.remove();
    if (figure) card.querySelector('.alive-figure').textContent = figure;
    const wrap = document.createElement('div'); wrap.className = 'mock-alive';
    card.replaceWith(wrap); wrap.append(card);
    const chip = ([tone, glyph, n, word]) => `<span class="alive-chip" data-tone="${tone}"><b>${n}</b>${word}</span>`; // no glyph: the word says it, and three always fit one line
    const undo = mine ? `<button type="button" class="button secondary mock-undo" data-ds="Button" data-register="secondary">${ic('return')}<span>Undo</span></button>` : '';
    wrap.insertAdjacentHTML('beforeend', `<div class="mock-run"><div class="mock-run-copy"><small>${stamp}</small><span class="mock-run-chips">${chips.map(chip).join('')}</span></div>${undo}</div>`);
    const st = document.createElement('style');
    st.textContent = `.farrowing-phone .mock-alive{margin:0 0 16px;border:1px solid var(--line);border-radius:20px;background:#f6f7f1;overflow:hidden}
      .farrowing-phone .mock-alive .alive-card{margin:0;border:0;border-radius:0;background:transparent}
      .mock-run{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 16px;padding:12px 0 14px;border-top:1px solid var(--line)}
      .mock-run-copy{display:flex;flex-direction:column;gap:8px;min-width:0}
      .mock-run-copy small{font:400 13px/18px var(--font-sans);color:var(--muted)}
      .mock-run-chips{display:flex;flex-wrap:wrap;gap:5px;min-width:0}
      .mock-run .alive-chip{display:inline-flex;align-items:center;gap:5px;height:24px;box-sizing:border-box;padding:0 7px;border-radius:999px;font:500 13px/1 var(--font-sans);background:#eceee7;color:#4b5547;white-space:nowrap}
      .mock-run .alive-chip b{flex:none;font:600 14px/1 var(--font-mono)}
      .mock-run .alive-chip svg{display:block;flex:none;width:15px;height:15px;stroke-width:2}
      .farrowing-phone .mock-run .mock-undo{flex:none;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;width:56px;min-width:0;height:56px;min-height:0;padding:0;border-radius:14px;font:500 13px/16px var(--font-sans)}
      .farrowing-phone .mock-run .mock-undo svg{width:20px;height:20px}`;
    document.head.append(st);
  }, { stamp, chips, figure, mine });
}
const RUN = [['add', 'farrow', '+3', 'born'], ['sub', 'trend-down', '−1', 'died'], ['quiet', 'minus', '1', 'born dead']];
{
  const p = await open('farrowing.count');
  await tap(p, PLUS, 3);
  await tap(p, SAVE);
  await cardRun(p, 'Saved 09:41 · G.H', RUN, '11', true);
  await shot(p, 'undo-e1-saved.png');
  await p.evaluate(() => {
    const U = window.SentriUI, sheet = document.querySelector('.sheet[data-view="count"]');
    sheet.insertAdjacentHTML('afterend', U.sheet({ variant: 'dialog', title: 'Undo the 09:41 save?', body: '',
      footer: '<div class="sheet-footer" data-ds="Sheet"><button type="button" class="button secondary" data-ds="Button" data-register="secondary">Back</button><button type="button" class="button primary" data-ds="Button" data-register="primary">Undo</button></div>' }));
    sheet.setAttribute('inert', '');
  });
  await shot(p, 'undo-e2-ask.png');
  await p.close();
}
{
  const p = await open('farrowing.count');
  await cardRun(p, 'Saved Aug 26 08:41 · L.M', [['add', 'farrow', '+4', 'born']], '', false);
  await shot(p, 'undo-e0-not-mine.png');
  await p.close();
}

await b.close(); server.kill();
