// Touch-ups the no-Edit ruling reaches beyond the drawer (owner, 2026-11-02: "go through the pages this affects").
// Real prototype screens at 390; only the proposed differences are swapped in, with the design system's own parts.
// Usage (from the repo root): node features/farrowing/edit-record-round/mock-touchups.mjs <out dir>
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
const { playwright } = await import(pathToFileURL(path.join(root, 'scripts/playwright-path.mjs')).href);
const { chromium } = playwright();
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const port = 4738;
const server = spawn(process.execPath, [path.join(root, 'scripts/serve-ux.cjs'), String(port)], { cwd: root, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 500));
const b = await chromium.launch();
async function open(screen, steps = []) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(`http://localhost:${port}/ux/system/farrowing-astra-concept.html?layout=focus&screen=${screen}`);
  await p.waitForSelector('html.atlas-ready', { timeout: 15000 });
  for (const s of steps) { await p.locator(s).first().click(); await p.waitForTimeout(1200); }
  return p;
}
const shot = async (p, name) => { await p.waitForTimeout(500); await p.screenshot({ path: path.join(out, name) }); await p.close(); };

// The last save as a run (the Alive card's part): stamp, the run's chips on one line, a quiet Undo.
const RUN_CSS = `.mock-run{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:14px;padding-top:12px;border-top:1px solid var(--line)}
  .mock-run-copy{display:flex;flex-direction:column;gap:8px;min-width:0}
  .mock-run-copy small{font:400 13px/18px var(--font-sans);color:var(--muted)}
  .mock-run-chips{display:flex;flex-wrap:wrap;gap:5px;min-width:0}
  .mock-run .alive-chip{display:inline-flex;align-items:center;gap:5px;height:24px;box-sizing:border-box;padding:0 7px;border-radius:999px;font:500 13px/1 var(--font-sans);background:#eceee7;color:#4b5547;white-space:nowrap}
  .mock-run .alive-chip b{flex:none;font:600 14px/1 var(--font-mono)}
  .farrowing-phone .mock-run .mock-undo{flex:none;display:inline-flex;align-items:center;gap:5px;height:44px;min-height:44px;margin-right:-8px;padding:0 8px;border:0;background:none;font:600 13px/16px var(--font-sans);color:var(--ink)}
  .farrowing-phone .mock-run .mock-undo svg{width:16px;height:16px;stroke-width:2}`;

// 1. Record dead after Finish: the same rows as Report death (died after birth only, counted from 0 for this record).
//    Born dead goes: after Finish a stillborn would be a birth, and Total born is locked.
{
  const p = await open('farrowing.death');
  await p.evaluate(() => {
    const U = window.SentriUI, sheet = document.querySelector('.sheet[data-view="death"]');
    sheet.querySelector('.tk-choice').outerHTML = U.segment({ variant: 'view-switch', options: [['piglets', 'Piglets'], ['sow', 'The sow']], active: 'piglets', action: 'mode', ariaLabel: 'Record death for' });
    sheet.querySelector('.sheet-title').textContent = 'Record dead';
    sheet.querySelector('[data-action="clearVisit"], .st-sheet-corner')?.remove();
    const primary = sheet.querySelector('.sheet-footer .button.primary'); primary.textContent = 'Save';
  });
  await shot(p, 'touch-1-record-dead-after-finish.png');
}

// 2. The finished record after a Record dead: Edit leaves the toolbar; the last save sits under the litter's figures, with Undo.
{
  const p = await open('farrowing.locked');
  await p.evaluate((css) => {
    const ic = (k) => window.SentriIcons.icon(k), sheet = document.querySelector('.sheet[data-view="locked"]');
    sheet.querySelector('.record-inline-actions [data-action="edit"]')?.remove();
    sheet.dataset.size = 'long'; // with a last save to show, the record opens at the long height (as Finish and Record dead do)
    const panel = sheet.querySelector('.finish-record .st-panel, .finish-record dl');
    const dd = [...panel.querySelectorAll('.st-fact')];
    const set = (label, v) => { const f = dd.find((x) => x.querySelector('dt')?.textContent.trim() === label); if (f) f.querySelector('dd').textContent = v; };
    set('Alive now', '7'); set('Dead', '7');
    const host = panel.closest('.st-panel') || panel;
    host.insertAdjacentHTML('beforeend', `<div class="mock-run"><div class="mock-run-copy"><small>Saved 14:02 · G.H</small><span class="mock-run-chips"><span class="alive-chip"><b>−1</b>died</span></span></div><button type="button" class="st-text-action mock-undo" data-ds="Button" data-register="text">${ic('return')}<span>Undo</span></button></div>`);
    const st = document.createElement('style'); st.textContent = css; document.head.append(st);
  }, RUN_CSS);
  await shot(p, 'touch-2-locked.png');
}

// 3. The sow-died record: Edit leaves the toolbar too.
{
  const p = await open('farrowing.ended');
  await p.evaluate(() => { document.querySelector('.record-inline-actions [data-action="edit"]')?.remove(); });
  await shot(p, 'touch-3-sow-died.png');
}

// 4. The log: a redone visit is one Corrected line; a visit undone and cleared stays as Withdrawn, struck.
{
  const p = await open('farrowing.history');
  await p.evaluate(() => {
    const U = window.SentriUI;
    const groups = [
      { label: 'Today', entries: [
        { title: '+1 crushed', corrected: true, meta: '14:02 · G.H', extraHtml: '' },
        { title: '+2 born alive', corrected: true, was: 'Was +3 born alive', meta: '09:43 · G.H' }] },
      { label: 'Aug 26', entries: [
        { title: '+4 alive', meta: '08:41 · G.H' },
        { title: '+3 crushed · +1 other', meta: '08:12 · G.H' },
        { title: '+5 alive', meta: '07:52 · G.H' },
        { title: '+1 stillborn · +1 mummified', meta: '07:30 · G.H' }] },
    ];
    document.querySelector('.st-log').outerHTML = U.log(groups);
    const first = document.querySelector('.st-log-entry');
    first.querySelector('.st-log-category').textContent = 'Withdrawn';
    first.querySelector('.st-log-title').style.cssText = 'text-decoration:line-through;color:var(--muted)';
  });
  await shot(p, 'touch-4-log.png');
}

// 5. The sow's Actions while she farrows: Edit litter record leaves Production.
{
  const p = await open('farrowing.count', ["[aria-label^='Actions for sow']"]);
  const f = p.frames().find((x) => x !== p.mainFrame() && /inspection-astra-concept/.test(x.url()));
  await f.evaluate(() => { for (const r of document.querySelectorAll('.st-row')) if (/Edit litter record/.test(r.textContent)) r.remove(); });
  await f.evaluate(() => { const h = [...document.querySelectorAll('h3,h4')].find((x) => /Production/.test(x.textContent)); h?.scrollIntoView({ block: 'start' }); });
  await shot(p, 'touch-5-actions.png');
}

await b.close(); server.kill();
