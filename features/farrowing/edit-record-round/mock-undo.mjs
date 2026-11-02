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

await b.close(); server.kill();
