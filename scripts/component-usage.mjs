// Which design-system components each atlas screen draws, measured, for the atlas's Components pages (owner, 2026-10-21: a
// library a developer can browse; "used by" was guessed from screen notes). Opens every atlas screen bare at 390 in its
// default state and counts the data-ds stamps it renders (frames included); adds each component's source callers: the
// files under ux/ outside the design system that call an API its README names (SentriUI.x / SentriTask.x).
// A screen's other states are not opened, so a part only a later state draws reads 0: the atlas says "not observed".
// Usage: node scripts/component-usage.mjs      writes atlas/component-usage.json (rerun after screens or components change)
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { playwright } from './playwright-path.mjs';
import { screensOf } from './atlas-screens.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const COMPONENTS = path.join(root, 'ux/design-system/components');
const OUT = path.join(root, 'atlas/component-usage.json');
const atlas = JSON.parse(fs.readFileSync(path.join(root, 'atlas/atlas.json'), 'utf8'));
const screens = screensOf(atlas);

const freePort = () => new Promise((res) => { const s = createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => res(p)); }); });
const port = await freePort();
const server = spawn(process.execPath, [path.join(root, 'scripts/serve-ux.cjs'), String(port)], { cwd: root, stdio: 'ignore' });
for (let i = 0; i < 50; i++) { try { await fetch(`http://localhost:${port}/atlas/atlas.json`); break; } catch { await new Promise((r) => setTimeout(r, 200)); } }

const { chromium } = playwright();
const browser = await chromium.launch();
const drawn = {}, failed = [];
let next = 0;
async function worker() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  while (next < screens.length) {
    const c = screens[next++];
    const url = new URL(`http://localhost:${port}${c.url}`); url.searchParams.set('screen', c.id);
    try {
      await page.goto(url.href);
      await page.waitForSelector('html.atlas-ready', { timeout: 15000 });
      const stamps = await page.evaluate(() => {
        const n = new Set();
        const walk = (doc) => { for (const e of doc.querySelectorAll('[data-ds]')) n.add(e.dataset.ds); for (const f of doc.querySelectorAll('iframe')) { try { if (f.contentDocument) walk(f.contentDocument); } catch {} } };
        walk(document); return [...n];
      });
      for (const s of stamps) (drawn[s] ||= []).push(c.id);
    } catch (e) { failed.push(c.id); }
  }
  await ctx.close();
}
try { await Promise.all([worker(), worker(), worker(), worker()]); } finally { await browser.close(); server.kill(); }

// source callers: the API names a component's README gives, called from a page file under ux/ outside the design system
const pages = [];
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (!/node_modules|design-system/.test(p)) walk(p); } else if (/\.(js|html)$/.test(e.name)) pages.push(p); } };
walk(path.join(root, 'ux'));
const text = Object.fromEntries(pages.map((p) => [path.relative(root, p).replace(/\\/g, '/'), fs.readFileSync(p, 'utf8')]));
const components = {};
for (const name of fs.readdirSync(COMPONENTS).filter((n) => /^[A-Z]/.test(n) && fs.existsSync(path.join(COMPONENTS, n, 'README.md'))).sort()) {
  const readme = fs.readFileSync(path.join(COMPONENTS, name, 'README.md'), 'utf8');
  const apis = [...new Set(readme.match(/\bSentri(?:UI|Task)\.[a-zA-Z]+\b/g) || [])];
  const files = Object.keys(text).filter((f) => apis.some((a) => new RegExp(`\\b${a.replace('.', '\\.')}\\(`).test(text[f]) || new RegExp(`\\b(?:UI|K|T)\\.${a.split('.')[1]}\\(`).test(text[f])));
  const ids = drawn[name] || [];
  const byId = Object.fromEntries(screens.map((s) => [s.id, s.feature]));
  components[name] = { screens: ids.sort(), features: [...new Set(ids.map((id) => byId[id]))].sort(), apis, files: files.sort() };
}
// stamps with no component folder (a part documented inside another component, or a feature's own)
const other = Object.fromEntries(Object.entries(drawn).filter(([k]) => !components[k]).map(([k, v]) => [k, v.sort()]));
const commit = execSync('git rev-parse --short HEAD', { cwd: root, encoding: 'utf8' }).trim();
fs.writeFileSync(OUT, JSON.stringify({ measured: new Date().toISOString().slice(0, 10), commit, screens: screens.length, failed, components, other }, null, 1) + '\n');
console.log(`component usage: ${screens.length} screens (${failed.length} failed), ${Object.keys(components).length} components → ${path.relative(root, OUT)}`);
