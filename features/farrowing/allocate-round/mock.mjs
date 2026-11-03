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
  'new-allocate': { preset: 'allocate' },
  'new-pick': { preset: 'allocate-pick' },
  'new-sow': { preset: 'allocate-foster' },
  'new-confirm': { preset: 'allocate-confirm' },
  'new-after': { preset: 'allocate-after' },
  'new-pen': { preset: 'allocate-pen' },
  'new-scan': { preset: 'allocate', steps: [{ act: 'fosterIdScan' }, { read: 3 }] },
  'new-split': { preset: 'allocate-after', steps: [{ act: 'fosterId', value: '399003' }, { act: 'fosterId', value: '399004' }, { act: 'allocToPen' }, { act: 'allocPen', value: '7|B1' }] },
  'alloc-filter': { preset: 'allocate-filter' },
  'foster': { preset: 'foster' },
  'foster-on': { preset: 'foster-receive' },
  'foster-send': { preset: 'foster-send' },
  'foster-tag': { preset: 'foster', steps: [{ type: '43' }] },
  'room-filter': { preset: 'room', steps: [{ act: 'room-filter' }] },
  'room-filter-narrow': { preset: 'room', steps: [{ act: 'room-filter' }, { range: [0, -2] }, { range: [1, 1] }, { range: [2, 2] }, { range: [3, 5] }] },
  'foster-filter-unit8': { preset: 'allocate-filter', steps: [{ act: 'fosterUnit', value: '8' }] },
};

const browser = await chromium.launch();
for (const [name, shot] of Object.entries(shots)) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await page.goto(base + '/ux/system/farrowing-astra-concept.html?layout=focus');
  await page.evaluate((v) => { const s = document.querySelector('select.scenario'); s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); }, shot.preset);
  await page.waitForTimeout(600);
  for (const st of shot.steps || []) {
    if (st.type != null) await page.fill(card + '[data-foster-search]', st.type);
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
