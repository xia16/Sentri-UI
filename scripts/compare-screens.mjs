// Pixel-compare every screen of a feature between a baseline server and a branch server.
// Usage: node scripts/compare-screens.mjs <feature> <baselineUrl> <branchUrl> [outDir]
//   e.g. node scripts/compare-screens.mjs farrowing http://localhost:4386 http://localhost:4388
// Screen ids come from both servers' atlas/atlas.json (union). Each screen is rendered at 390x844 via
// <screen url>&screen=<id> (atlas-bare replays the preset and steps), screenshotted, and diffed on a canvas
// in the page. Writes review/compare-<feature>.json (count, max channel delta, diff PNG) and diff PNGs to
// review/compare-<feature>/. A "note" already in an existing JSON for a screen is kept (the explanation of an allowed delta).
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/ying_/.cache/adam-design/playwright-1.63.0/node_modules/playwright');

const [feature, baseUrl, branchUrl, outDirArg] = process.argv.slice(2);
if (!feature || !baseUrl || !branchUrl) { console.error('usage: compare-screens.mjs <feature> <baselineUrl> <branchUrl> [outDir]'); process.exit(2); }
const outDir = outDirArg || 'review';
const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
const imgDir = path.join(outDir, `compare-${feature}`);
fs.mkdirSync(imgDir, { recursive: true });
const jsonPath = path.join(outDir, `compare-${feature}.json`);
const prev = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, 'utf8')) : { screens: {} };

async function screensOf(base) {
  const d = await (await fetch(base + '/atlas/atlas.json')).json();
  const out = {};
  for (const p of d.platforms) for (const s of p.sections) for (const f of s.features) if (f.id === feature) for (const sc of f.screens) out[sc.id] = sc;
  return out;
}
const A = await screensOf(baseUrl), B = await screensOf(branchUrl);
const ids = [...new Set([...Object.keys(A), ...Object.keys(B)])].filter((i) => !only || only.includes(i));

const browser = await chromium.launch();
async function shoot(base, sc) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const url = base + sc.url + (sc.url.includes('?') ? '&' : '?') + 'screen=' + encodeURIComponent(sc.id);
  await page.goto(url);
  await page.waitForSelector('html.atlas-ready', { timeout: 15000 });
  await page.waitForTimeout(400);
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: 390, height: 844 } });
  await ctx.close();
  return buf;
}
const diffPage = await (await browser.newContext()).newPage();
async function diff(a, b) {
  return diffPage.evaluate(async ([ua, ub]) => {
    const load = (u) => new Promise((r, j) => { const i = new Image(); i.onload = () => r(i); i.onerror = j; i.src = u; });
    const [ia, ib] = await Promise.all([load(ua), load(ub)]);
    const w = ia.width, h = ia.height, c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(ia, 0, 0); const da = x.getImageData(0, 0, w, h);
    x.clearRect(0, 0, w, h); x.drawImage(ib, 0, 0); const db = x.getImageData(0, 0, w, h);
    const out = x.createImageData(w, h); let count = 0, max = 0;
    for (let i = 0; i < da.data.length; i += 4) {
      let m = 0; for (let k = 0; k < 3; k++) m = Math.max(m, Math.abs(da.data[i + k] - db.data[i + k]));
      if (m > 0) { count++; max = Math.max(max, m); out.data.set([255, 0, 160, 255], i); }
      else { const g = 255 - Math.round((255 - da.data[i]) * 0.25); out.data.set([g, g, g, 255], i); }
    }
    x.putImageData(out, 0, 0);
    return { count, max, png: c.toDataURL('image/png') };
  }, [a, b]);
}
const url = (buf) => 'data:image/png;base64,' + buf.toString('base64');

const result = { feature, baseline: baseUrl, branch: branchUrl, size: '390x844', screens: {} };
for (const id of ids) {
  const r = { note: prev.screens?.[id]?.note || '' };
  try {
    if (!A[id]) r.status = 'no-baseline';
    else if (!B[id]) r.status = 'no-branch';
    else {
      const [a, b] = [await shoot(baseUrl, A[id]), await shoot(branchUrl, B[id])];
      const d = await diff(url(a), url(b));
      r.pixels = d.count; r.maxDelta = d.max; r.status = d.count ? 'differs' : 'identical';
      fs.writeFileSync(path.join(imgDir, id + '.base.png'), a);
      fs.writeFileSync(path.join(imgDir, id + '.branch.png'), b);
      if (d.count) { r.diff = path.join(imgDir, id + '.diff.png').split(path.sep).join('/'); fs.writeFileSync(r.diff, Buffer.from(d.png.split(',')[1], 'base64')); }
      else for (const s of ['.diff.png']) fs.rmSync(path.join(imgDir, id + s), { force: true });
    }
  } catch (e) { r.status = 'error'; r.error = String(e.message || e).split('\n')[0]; }
  result.screens[id] = r;
  console.log(id.padEnd(28), r.status, r.pixels ?? '', r.maxDelta ?? '', r.error || '');
}
fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2) + '\n');
await browser.close();
