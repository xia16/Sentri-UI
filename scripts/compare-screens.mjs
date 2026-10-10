// Diff every atlas screen between two running servers (before and after), bare at 390 x 844.
// Usage: node scripts/compare-screens.mjs <beforeBase> <afterBase> [outDir] [idFilter]
//   e.g. node scripts/compare-screens.mjs http://localhost:4352 http://localhost:4394 tmp/compare
// Needs Playwright: SENTRI_PLAYWRIGHT may point to an external install (a path to the `playwright` package).
// Prints one line per screen: SAME, DIFF <changed pixel %>, or FAIL; writes before/after PNGs of every DIFF to outDir.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.SENTRI_PLAYWRIGHT || 'playwright');
const [before, after, out = 'compare-out', filter = ''] = process.argv.slice(2);
if (!before || !after) { console.error('usage: compare-screens.mjs <beforeBase> <afterBase> [outDir] [idFilter]'); process.exit(2); }

const atlas = JSON.parse(fs.readFileSync(new URL('../atlas/atlas.json', import.meta.url), 'utf8'));
const screens = [];
for (const p of atlas.platforms) for (const s of p.sections) for (const f of s.features) for (const c of f.screens)
  if (c.url && (!filter || c.id.includes(filter))) screens.push(c);
fs.mkdirSync(out, { recursive: true });

async function shot(page, base, c) {
  const url = base + c.url + (c.url.includes('?') ? '&' : '?') + 'screen=' + encodeURIComponent(c.id);
  await page.goto(url);
  await page.waitForFunction(() => document.documentElement.classList.contains('atlas-ready'), null, { timeout: 10000 });
  await page.waitForTimeout(250);
  return page.screenshot({ clip: { x: 0, y: 0, width: 390, height: 844 } });
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const cmp = await browser.newPage();
let diffs = 0;
for (const c of screens) {
  try {
    const a = await shot(page, before, c), b = await shot(page, after, c);
    const pct = a.equals(b) ? 0 : await cmp.evaluate(async ([x, y]) => {
      const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + src; });
      const [i, j] = await Promise.all([load(x), load(y)]);
      const cv = n => { const k = document.createElement('canvas'); k.width = 390; k.height = 844; const g = k.getContext('2d'); g.drawImage(n, 0, 0); return g.getImageData(0, 0, 390, 844).data; };
      const d1 = cv(i), d2 = cv(j); let n = 0;
      for (let q = 0; q < d1.length; q += 4) if (Math.abs(d1[q] - d2[q]) + Math.abs(d1[q + 1] - d2[q + 1]) + Math.abs(d1[q + 2] - d2[q + 2]) > 24) n++;
      return n / (390 * 844) * 100;
    }, [a.toString('base64'), b.toString('base64')]);
    if (pct > 0.01) {
      diffs++;
      const name = c.id.replace(/[^a-z0-9.-]/gi, '_');
      fs.writeFileSync(path.join(out, name + '.before.png'), a);
      fs.writeFileSync(path.join(out, name + '.after.png'), b);
      console.log('DIFF', pct.toFixed(2).padStart(6) + '%', c.id);
    } else console.log('SAME', '       ', c.id);
  } catch (e) { console.log('FAIL', '       ', c.id, e.message.split('\n')[0]); }
}
console.log(`${screens.length} screens, ${diffs} changed`);
await browser.close();
