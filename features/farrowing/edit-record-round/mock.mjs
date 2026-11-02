// Mockups for the Edit record round: open the real prototype's bare screens at 390 and swap in the proposed content,
// built with the design system's own helpers (SentriUI.*) so tokens and bundle.css parts are the real ones.
// Usage (from the repo root): node mock.mjs <out dir>
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
const { playwright } = await import(pathToFileURL(path.join(root, 'scripts/playwright-path.mjs')).href);
const { chromium } = playwright();
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const port = 4731;
const server = spawn(process.execPath, [path.join(root, 'scripts/serve-ux.cjs'), String(port)], { cwd: root, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 500));
const b = await chromium.launch();

// A tally glyph for Count (a proposed registry addition; nothing in the registry draws a count yet).
const TALLY = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 5v14M10 5v14M14 5v14M18 5v14M3.5 15.5l17-7"></path></svg>';

async function open(screen, steps = []) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(`http://localhost:${port}/ux/system/farrowing-astra-concept.html?layout=focus&screen=${screen}`);
  await p.waitForSelector('html.atlas-ready', { timeout: 15000 });
  for (const s of steps) { await p.locator(s).first().click(); await p.waitForTimeout(1200); }
  return p;
}
async function shoot(p, name) { await p.waitForTimeout(600); await p.screenshot({ path: path.join(out, name) }); await p.close(); }

// 1. The finished record: Edit leaves the toolbar (Record dead · Actions).
{
  const p = await open('farrowing.locked');
  await p.evaluate(() => { document.querySelector('.record-inline-actions [data-action="edit"]')?.remove(); });
  await shoot(p, 'mock-1-locked.png');
}

// 2. The sow's Actions: Count joins the shared verb tiles; Reconcile piglet count and Edit litter record leave Production.
{
  const p = await open('farrowing.locked', ["[aria-label^='Actions for sow']"]);
  const f = p.frames().find((x) => x !== p.mainFrame() && /inspection-astra-concept/.test(x.url()));
  await f.evaluate((TALLY) => {
    const grid = document.querySelector('.st-row-grid');
    const treat = grid.querySelector('[data-action="treatment"]');
    const tile = treat.cloneNode(true);
    tile.dataset.action = 'count'; tile.setAttribute('aria-label', 'Count, Count the pigs');
    tile.querySelector('.st-row-tile-icon').innerHTML = TALLY;
    tile.querySelector('.st-row-tile-label').textContent = 'Count';
    treat.after(tile);
    grid.style.setProperty('--st-row-grid-cols', '3'); // five tiles: 3 + 2 (row grid rule)
    for (const r of document.querySelectorAll('.st-row')) if (/Reconcile piglet count|Edit litter record/.test(r.textContent)) r.remove();
  }, TALLY);
  await shoot(p, 'mock-2-actions.png');
}

// 3. Count piglets: the evidence since the last count, the counted number, the difference.
for (const [name, counted] of [['mock-3-count.png', 6], ['mock-3b-count-match.png', 7]]) {
  const p = await open('farrowing.reconcile');
  await p.evaluate(({ counted }) => {
    const U = window.SentriUI, ic = (k) => window.SentriIcons.icon(k);
    const expected = 7, diff = counted - expected;
    const line = (title, description, figure, strong) => U.row({ title, description, trailing: figure, className: strong ? 'mock-total' : '' });
    const evidence = U.heading({ title: 'Since the last count', icon: ic('record'), kind: 'section', level: 3 })
      + U.rowGroup(
        line('At finish', 'Aug 27 · 08:12 · G.H', '9')
        + line('Died · crushed', 'Yesterday · 14:02 · L.M', '−1')
        + line('Fostered out · to 000601', 'Yesterday · 16:20 · L.M', '−2')
        + line('Fostered in · from 000605', 'Yesterday · 16:25 · L.M', '+1')
        + line('Should be here now', '', String(expected), true),
        { className: 'mock-evidence' });
    const stepper = U.stepper({ variant: 'well', label: 'Piglets you counted', value: counted, min: 0, max: 30, action: 'x', reserveHint: false });
    const result = diff === 0
      ? `<p class="feature-hint">Matches the record.</p>`
      : `<p class="feature-hint mock-diff"><strong>${Math.abs(diff)} ${diff < 0 ? 'fewer' : 'more'} than the record.</strong> Saved as ${Math.abs(diff)} unaccounted.</p>`
        + (diff < 0 ? U.rowGroup(U.row({ title: 'Found a dead piglet?', description: 'Record dead, with its cause, instead', icon: ic('alert'), action: 'death', trail: 'chevron' })) : '');
    const body = `<section class="feature-section mock-first">${stepper}${result}</section>${evidence}`;
    const sec = document.querySelector('.sheet.feature-page');
    const bar = sec.querySelector('.statusbar').outerHTML;
    const html = U.sheet({ variant: 'page', title: 'Count piglets', line: '000418 · B1', back: { action: 'featureBack' }, body,
      footer: `<div class="sheet-footer" data-ds="Sheet"><button type="button" class="button primary" data-ds="Button" data-register="primary">Save count</button></div>`,
      className: 'feature-page count-page', label: 'Count piglets', bar });
    sec.outerHTML = html;
    const st = document.createElement('style');
    st.textContent = `.count-page .mock-evidence .st-row-trailing{font-family:var(--font-mono,'IBM Plex Mono',monospace);font-size:16px;color:var(--ink,#1d221e)}
      .count-page .mock-total strong{font-weight:600}
      .count-page .mock-total .st-row-trailing{font-weight:700}
      .count-page .mock-diff strong{color:var(--ink,#1d221e);font-weight:600}
      .count-page .sheet-body>*{flex-shrink:0}
      .count-page .feature-section{margin-bottom:12px}
      .count-page .mock-first{margin-top:4px}`;
    document.head.append(st);
  }, { counted });
  await shoot(p, name);
}

// 4. The Farrowing log after it: the moves, the count and its difference; the finish line still says born 14.
{
  const p = await open('farrowing.history');
  await p.evaluate(() => {
    const U = window.SentriUI;
    const groups = [
      { label: 'Today', entries: [{ title: 'Counted 6 · 1 unaccounted', detail: 'Should have been 7', meta: '09:30 · L.M' }] },
      { label: 'Yesterday', entries: [
        { title: '+1 fostered in · from 000605', meta: '16:25 · L.M' },
        { title: '−2 fostered out · to 000601', meta: '16:20 · L.M' },
        { title: '+1 crushed', meta: '14:02 · L.M' }] },
      { label: 'Aug 27', entries: [{ title: 'Farrowing finished · born 14', meta: '08:12 · G.H' }] },
      { label: 'Aug 26', entries: [
        { title: '+4 alive', meta: '08:41 · G.H' },
        { title: '+3 crushed · +1 other', meta: '08:12 · G.H' },
        { title: '+5 alive', meta: '07:52 · G.H' }] },
    ];
    document.querySelector('.st-log').outerHTML = U.log(groups);
  });
  await shoot(p, 'mock-4-log.png');
}

await b.close(); server.kill();
