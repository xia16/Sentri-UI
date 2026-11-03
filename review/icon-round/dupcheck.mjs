import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
const { playwright } = await import(pathToFileURL(path.join(root, 'scripts/playwright-path.mjs')).href);
const { patchFile, patchBundle, swaps } = await import(pathToFileURL(path.join(root, 'review/icon-round/swaps.mjs')).href);
const { chromium } = playwright();
const port = 4747;
const server = spawn(process.execPath, [path.join(root, 'scripts/serve-ux.cjs'), String(port)], { cwd: root, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 600));
const atlas = JSON.parse(fs.readFileSync('atlas/atlas.json', 'utf8')); const urls = {};
(function walk(o) { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') { if (o.id && o.url) urls[o.id] = o.url; Object.values(o).forEach(walk); } })(atlas);
const ids = Object.keys(urls).filter((id) => /^(farrowing|pig-profile|inspection|workbench|environment|find-pig)\./.test(id) && urls[id].includes('/ux/system/'));
const patched = new Set(swaps.map((s) => s.file));
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route(/localhost:\d+\/.+\.(js|html)(\?.*)?$/, async (route) => {
  const rel = decodeURIComponent(new URL(route.request().url()).pathname).replace(/^\//, '');
  const isB = rel === 'ux/design-system/components/bundle.js'; if (!isB && !patched.has(rel)) return route.continue();
  const res = await route.fetch(); let body = await res.text(); body = isB ? patchBundle(body) : patchFile(rel, body).text; route.fulfill({ response: res, body });
});
const p = await ctx.newPage();
const names = await (async () => { await p.goto(`http://localhost:${port}/review/icon-round/craft.html`); return p.evaluate(() => { const m = {}; const all = Object.assign({}, SentriIcons.paths, SentriIconsNext.paths); for (const [k, d] of Object.entries(all)) m[d] = k; return m; }); })();
for (const id of ids) {
  const u = urls[id]; await p.goto(`http://localhost:${port}${u}${u.includes('?') ? '&' : '?'}screen=${id}`);
  await p.waitForSelector('html.atlas-ready', { timeout: 20000 }).catch(() => {});
  const out = await p.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
    const pick = (sel) => [...document.querySelectorAll(sel)].filter(vis).map((s) => s.querySelector('path')?.getAttribute('d')).filter(Boolean);
    return { heads: pick('.st-heading-icon svg, .st-heading svg:not(.st-heading-action svg)'), rows: pick('.st-row-icon svg, .st-row-tile svg, [data-ds="Row"] .st-row-icon svg') };
  });
  const dup = (arr) => { const c = {}; arr.forEach((d) => (c[d] = (c[d] || 0) + 1)); return Object.entries(c).filter(([, n]) => n > 1).map(([d, n]) => `${names[d] || '?'}x${n}`); };
  const h = dup(out.heads), r = dup(out.rows);
  if (h.length || r.length) console.log(id.padEnd(34), h.length ? 'HEADINGS ' + h.join(' ') : '', r.length ? 'ROWS ' + r.join(' ') : '');
}
await b.close(); server.kill();
