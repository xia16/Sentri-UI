// The icon round on real screens: each atlas screen at 390 x 844, now (main as it is) and new (the proposed registry from
// icons.js plus the usage swaps from swaps.json, applied in memory to the served files; nothing on disk changes).
// Usage (from the repo root): node review/icon-round/mock.mjs [out dir]   (default review/icon-round/shots)
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { patchFile, patchBundle, swaps } from './swaps.mjs';
const root = process.cwd();
const { playwright } = await import(pathToFileURL(path.join(root, 'scripts/playwright-path.mjs')).href);
const { chromium } = playwright();
const out = process.argv[2] || 'review/icon-round/shots';
fs.mkdirSync(out, { recursive: true });
const port = 4743;
const server = spawn(process.execPath, [path.join(root, 'scripts/serve-ux.cjs'), String(port)], { cwd: root, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 600));
const atlas = JSON.parse(fs.readFileSync('atlas/atlas.json', 'utf8'));
const urls = {};
(function walk(o) { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') { if (o.id && o.url) urls[o.id] = o.url; Object.values(o).forEach(walk); } })(atlas);

// [screen, file name, scroll: a selector to scroll into view before the shot]
const screens = [
  ['farrowing.details', 'details-top'],
  ['farrowing.details', 'details-herself', '.finished-section:last-of-type'],
  ['pig-profile.full', 'pig-profile'],
  ['pig-profile.actions', 'pig-actions'],
  ['farrowing.count', 'count'],
  ['farrowing.death', 'death'],
  ['farrowing.filter', 'filter'],
  ['farrowing.sow-actions', 'unit-actions'],
  ['environment.page', 'fan'],
];
const patched = new Set(swaps.map((s) => s.file));
const b = await chromium.launch();
for (const mode of ['now', 'new']) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  if (mode === 'new') await ctx.route(/localhost:\d+\/.+\.(js|html)(\?.*)?$/, async (route) => {
    const rel = decodeURIComponent(new URL(route.request().url()).pathname).replace(/^\//, '');
    const isBundle = rel === 'ux/design-system/components/bundle.js';
    if (!isBundle && !patched.has(rel)) return route.continue();
    const res = await route.fetch(); let body = await res.text();
    body = isBundle ? patchBundle(body) : patchFile(rel, body).text;
    route.fulfill({ response: res, body });
  });
  for (const [id, name, scroll] of screens) {
    const p = await ctx.newPage();
    const u = urls[id]; if (!u) { console.warn('no screen', id); continue; }
    await p.goto(`http://localhost:${port}${u}${u.includes('?') ? '&' : '?'}screen=${id}`);
    await p.waitForSelector('html.atlas-ready', { timeout: 20000 }).catch(() => console.warn('not ready', id));
    if (scroll) await p.evaluate((s) => { const el = [...document.querySelectorAll(s)].pop(); el && el.scrollIntoView({ block: 'end' }); }, scroll);
    await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(out, `${mode}-${name}.png`) });
    await p.close();
  }
  await ctx.close();
}
await b.close(); server.kill();
console.log('shots in', out);
