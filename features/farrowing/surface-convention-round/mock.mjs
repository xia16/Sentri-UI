// One surface convention (owner, 2026-11-03: "we need to lock in a good convention first"): every page and drawer is the tint with
// white cards, as iOS's grouped content is. Renders each drawer now and under the proposal, at 390, into this folder. The proposal is
// laid over the live page: every drawer context becomes the tint-with-white-cards one; nothing is built.
// Usage: node features/farrowing/surface-convention-round/mock.mjs [base url]   (default http://localhost:4317, `npm run ux`)
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { playwright } from '../../../scripts/playwright-path.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const base = (process.argv[2] || 'http://localhost:4317').replace(/\/$/, '');
const { chromium } = playwright();

const shots = {
  'sow-drawer': '/ux/system/farrowing-astra-concept.html?layout=focus&screen=farrowing.scan-read',
  'report-death': '/ux/system/farrowing-astra-concept.html?layout=focus&screen=farrowing.death',
  'actions': '/ux/system/farrowing-astra-concept.html?layout=focus&screen=farrowing.sow-actions',
  'filter': '/ux/system/farrowing-astra-concept.html?layout=focus&screen=farrowing.filter',
  'find-results': '/ux/system/farrowing-astra-concept.html?layout=focus&screen=farrowing.search-results',
  'medicines': '/ux/system/inspection-astra-concept.html?layout=focus&screen=treat.medicine-picker',
  'today': '/ux/system/home-astra-prototype.html?layout=focus&section=farrowing&screen=workbench.today',
};
// The proposal: a drawer takes the page's colours (tint base, white cards, press on white).
// Owner, 2026-11-03: nothing sits loose on the tint; every group is a white card (the Alive card, Report death's causes, each
// filter's control, with its heading above the card on the tint).
const tint = () => {
  for (const e of document.querySelectorAll('[data-st-context="drawer"]')) e.setAttribute('data-st-context', 'menu');
  const card = 'background:var(--paper);border:1px solid var(--line);border-radius:var(--radius-panel)';
  for (const e of document.querySelectorAll('.alive-surface')) e.style.background = 'var(--paper)';
  for (const e of document.querySelectorAll('.death-causes')) e.style.cssText += `;${card};padding:0 16px`;
  for (const r of document.querySelectorAll('.st-filter-section .st-range')) {
    const title = r.querySelector('.st-range-title');
    if (title) r.parentElement.insertBefore(title, r);
    r.style.cssText += `;${card};padding:12px 16px`;
  }
  for (const s of document.querySelectorAll('.st-filter-section .st-selection')) s.style.cssText += `;${card};padding:12px`;
};

const browser = await chromium.launch();
for (const [name, url] of Object.entries(shots)) {
  for (const side of ['now', 'new']) {
    const p = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await p.goto(base + url);
    await p.waitForTimeout(1500);
    if (side === 'new') await p.evaluate(tint);
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(here, `${name}-${side}.png`) });
    await p.close();
    console.log(`${name}-${side}`);
  }
}
await browser.close();
