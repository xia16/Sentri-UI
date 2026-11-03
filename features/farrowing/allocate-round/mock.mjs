// Allocate piglets and fostering (owner round, 2026-11-02): renders the canvas's screens from the live prototype at 390, one PNG each,
// into this folder. Usage: node features/farrowing/allocate-round/mock.mjs [base url]   (default http://localhost:4317, `npm run ux`)
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { playwright } from '../../../scripts/playwright-path.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const base = (process.argv[2] || 'http://localhost:4317').replace(/\/$/, '');
const { chromium } = playwright();
const card = '[data-card="0"] ';

// Each shot: a preset, then taps ({act, value}), typing ({type}), slider moves ({range: [index, value]}) or demo reads ({read: n}).
const shots = {
  'now-ended': { preset: 'ended' },
  'now-count': { preset: 'count' },
  'now-locked': { preset: 'locked' },
  'd-dead': { preset: 'allocate' },
  'd-finished': { preset: 'locked' },
  'd-details': { preset: 'allocate', steps: [{ act: 'litter' }] },
  'd-room': { preset: 'allocate', steps: [{ act: 'close' }, { js: "(()=>{const r=[...document.querySelectorAll('[data-card=\"0\"] .room-scroll .st-row')].find(e=>e.textContent.includes('000399'));const sc=r.closest('.room-scroll');sc.scrollTop+=r.getBoundingClientRect().top-sc.getBoundingClientRect().top-160;})()" }] },
  'p-list': { preset: 'piglets-dead' },
  'p-ticked': { preset: 'piglets-ticked' },
  
  'p-actions': { preset: 'piglets-actions' },
  'p-sow': { preset: 'piglets-sow' },
  'p-confirm': { preset: 'piglets-confirm' },
  'p-after': { preset: 'piglets-after' },
  'p-pen': { preset: 'piglets-pen' },
  'p-live': { preset: 'piglets-live' },
  'p-scan': { preset: 'piglets-dead', steps: [{ act: 'fosterIdScan' }, { read: 2 }] },
  'p-search': { preset: 'piglets-dead', steps: [{ fill: ['[data-litter-search]', '05'] }] },
  'p-typed': { preset: 'piglets-live', steps: [{ fill: ['[data-litter-count]', '3'] }] },
  'alloc-filter': { preset: 'piglets-filter' },
  'foster': { preset: 'foster' },
  'foster-on': { preset: 'foster-receive' },
  'foster-send': { preset: 'foster-send' },
  'foster-tag': { preset: 'foster', steps: [{ type: '377' }] },
  'foster-gilt': { preset: 'foster', steps: [{ type: '434' }] },
  'foster-refused': { preset: 'foster', steps: [{ act: 'fosterScan' }, { read: 1 }] },
  'room-filter': { preset: 'room', steps: [{ act: 'room-filter' }] },
  'room-filter-narrow': { preset: 'room', steps: [{ act: 'room-filter' }, { range: [0, -2] }, { range: [1, 1] }, { range: [2, 2] }, { range: [3, 5] }] },
  'foster-filter-unit8': { preset: 'piglets-filter', steps: [{ act: 'fosterUnit', value: '8' }] },
};

const browser = await chromium.launch();
for (const [name, shot] of Object.entries(shots)) {
  const page = await browser.newPage({ viewport: { width: 430, height: 900 }, deviceScaleFactor: 2 });   // the phone draws at its true 390 only in a window wider than it
  await page.goto(base + '/ux/system/farrowing-astra-concept.html?layout=focus');
  await page.evaluate((v) => { const s = document.querySelector('select.scenario'); s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); }, shot.preset);
  await page.waitForTimeout(600);
  for (const st of shot.steps || []) {
    if (st.js) await page.evaluate(st.js);
    else if (st.fill) { await page.fill(card + st.fill[0], st.fill[1]); await page.locator(card + st.fill[0]).dispatchEvent('change'); }
    else if (st.type != null) await page.fill(card + '[data-foster-search]', st.type);
    else if (st.range) await page.locator(card + '.st-range input[type=range]').nth(st.range[0]).evaluate((e, v) => { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, st.range[1]);
    else if (st.read) for (let k = 0; k < st.read; k++) { await page.click('[data-demo-scan]'); await page.waitForTimeout(250); }
    else await page.click(card + `[data-action="${st.act}"]` + (st.value != null ? `[data-value="${st.value}"]` : ''));
    await page.waitForTimeout(450);
  }
  await page.waitForTimeout(800);
  await page.locator(card + '.phone').first().screenshot({ path: path.join(here, name + '.png') });
  await page.close();
  console.log(name);
}
await browser.close();
