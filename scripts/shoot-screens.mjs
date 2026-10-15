// Screenshots atlas screens bare, at each width and language, from a running server (or one it starts on this checkout).
// Usage: node scripts/shoot-screens.mjs <out dir> [--base <url> --commit <hash>] [--atlas <atlas.json>] [--feature id,id] [--screens id,id]
//                                       [--screens-file <ids.json>] [--widths 390,360] [--langs en,zh] [--components [Name,Name]]
//   --components  also shoot the design system's variant pages (ds:<Name>/<variant>, feature design-system), all or the named
//                 components; a ds: id in --screens or --screens-file shoots that page. A page is the atlas's own state grid
//                 (.sgrid, Components → <Name> → <variant>), lifted out of the atlas chrome with each state's frame at the run's
//                 width and two to a row, shot whole, in English only: a variant page's Chinese cells are its own.
// Writes <out>/<screen id>/<lang>-<width>.png (ds:<Name> as ds_<Name>) and <out>/shots.json:
//   { base, commit, runs: [{ screen, feature, lang, width, file, ok, error?, zh? }] }
// zh is "rendered" or "ignored": a page that shows the same text with ?lang=zh does not render Chinese, and the run says so
// instead of passing off an English screenshot as Chinese. Bare screens are pinned to 390; other widths override that the way
// scripts/run-scenarios.mjs does (nothing in the page changes, only the phone's width).
import { spawn, execSync } from 'node:child_process';
import { playwright } from './playwright-path.mjs';
import { createServer } from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { screensOf, componentPagesOf, idPath } from './loop-rules.mjs';
import { routeFonts } from './font-route.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// A sheet that slides in, or a backdrop that blurs, is still moving 250ms after load on a slow machine: wait for every finite
// animation and transition to finish (at most 3s), then two frames, so a shot never catches a screen mid-motion.
async function settle(page) {
  await page.evaluate(() => Promise.race([
    Promise.all(document.getAnimations().filter((a) => a.effect?.getComputedTiming().endTime !== Infinity).map((a) => a.finished.catch(() => {}))),
    new Promise((r) => setTimeout(r, 3000)),
  ]).then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))));
}
const { chromium } = playwright();

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : null; };
const csv = (k, d) => (opt(k) || d).split(',').map((s) => s.trim()).filter(Boolean);
const out = argv.find((a, i) => !a.startsWith('--') && !(argv[i - 1] || '').startsWith('--'));
if (!out) { console.error('usage: node scripts/shoot-screens.mjs <out dir> [--base <url>] [--feature a,b] [--screens a,b] [--widths 390,360] [--langs en,zh]'); process.exit(2); }

const atlas = JSON.parse(fs.readFileSync(opt('atlas') || path.join(root, 'atlas/atlas.json'), 'utf8')); // --atlas: another checkout's screens
// --screens-file: a JSON list of screen ids, for a list too long for a command line (the gate's). An empty list shoots nothing.
const listed = opt('screens-file') ? JSON.parse(fs.readFileSync(opt('screens-file'), 'utf8')) : null;
const ids = [...csv('screens', ''), ...(listed || [])], dsIds = ids.filter((id) => id.startsWith('ds:'));
const todo = listed && !listed.length ? [] : screensOf(atlas, { features: csv('feature', ''), screens: ids });
const named = argv.includes('--components') && opt('components') && !opt('components').startsWith('--') ? csv('components', '') : [];
if (argv.includes('--components') || dsIds.length) todo.push(...componentPagesOf(atlas, { components: named, screens: dsIds }));
const widths = csv('widths', '390').map(Number);
const langs = csv('langs', 'en').sort((a, b) => (a === 'en' ? -1 : b === 'en' ? 1 : 0)); // en first: the zh probe compares against it

const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => r(p)); }); });
let base = opt('base'), server = null;
if (!base) {
  const port = await freePort();
  server = spawn(process.execPath, [path.join(root, 'scripts/serve-ux.cjs'), String(port)], { cwd: root, stdio: 'ignore' });
  process.on('exit', () => server.kill());
  base = `http://localhost:${port}`;
  await new Promise((r) => setTimeout(r, 400));
}
base = base.replace(/\/$/, '');

// A component page: the atlas draws its states (one srcdoc frame per state, tokens.css, bundle.css and bundle.js injected), then the
// grid alone becomes the page, two phone-width cells to a row. Moving a frame reloads it; each frame fits its height on load.
async function gridOnly(page, width) {
  await page.waitForSelector('.vbody .sgrid .scell iframe', { timeout: 15000 });
  // the atlas's first load of each frame finishes (its fonts too) before the move, so no font request is cut off mid-flight
  await page.waitForFunction(() => [...document.querySelectorAll('.vbody .sgrid iframe')].every((f) => f.contentDocument?.readyState === 'complete'), null, { timeout: 15000 });
  for (const f of page.frames()) await f.evaluate(() => document.fonts.ready.then(() => true)).catch(() => {});
  await page.evaluate(async (w) => {
    const grid = document.querySelector('.vbody .sgrid'), frames = [...grid.querySelectorAll('iframe')];
    const loaded = Promise.all(frames.map((f) => new Promise((r) => { f.addEventListener('load', r, { once: true }); setTimeout(r, 10000); })));
    document.body.replaceChildren(grid);
    document.documentElement.setAttribute('style', 'height:auto!important;overflow:visible!important;background:#f2f3ee');
    document.body.setAttribute('style', 'height:auto!important;overflow:visible!important;margin:0;padding:12px 16px;display:block;width:max-content');
    Object.assign(grid.style, { gridTemplateColumns: `repeat(${Math.min(2, frames.length)}, ${w}px)`, margin: '0', gap: '20px 16px' });
    frames.forEach((f) => { f.style.width = w + 'px'; f.style.maxWidth = 'none'; });
    await loaded;
  }, width);
}

const browser = await chromium.launch();
const runs = [];
const text = {};
for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: 1 });
  await routeFonts(context, root); // the prototypes' Google Fonts come from vendor/fonts/: no network in a render
  await context.addInitScript((w) => {
    const css = `html.atlas-bare,html.atlas-bare body{width:${w}px!important}html.atlas-bare .atlas-phone{width:${w}px!important}`;
    const add = () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); };
    if (document.head) add(); else document.addEventListener('DOMContentLoaded', add);
  }, width);
  // External fonts load over the network. A font that fails to load renders in the fallback face and shows as a pixel change on
  // every screen that uses it, so a failed font request retries the screen (3 tries) and is reported, never shot silently.
  const fontFailures = new Set();
  for (const c of todo) for (const lang of c.component ? langs.filter((l) => l === 'en') : langs) {
    // A fresh tab per shot: a screen that goes back in history would otherwise land on the screen shot before it.
    const page = await context.newPage();
    // The clock starts at a fixed moment and then runs: a screen that prints "now" (a receipt's time) would otherwise differ
    // from minute to minute, and a frozen clock would stall the screens' own tap guards and timers.
    await page.clock.install({ time: new Date('2026-10-11T09:41:00') });
    await page.clock.resume();
    // A request cut off because its frame went away (a component page's frames reload when the grid is lifted out) is not a failure.
    const gone = (r) => r.failure()?.errorText === 'net::ERR_ABORTED' && (() => { try { return r.frame().isDetached(); } catch { return true; } })();
    page.on('requestfailed', (r) => { if (/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(r.url()) && !gone(r)) fontFailures.add(r.url()); });
    const file = path.join(out, idPath(c.id), `${lang}-${width}.png`);
    const run = { screen: c.id, feature: c.feature, lang, width, file: path.relative(out, file).replace(/\\/g, '/'), ok: false };
    try {
      const url = new URL(base + c.url);
      if (!c.component) url.searchParams.set('screen', c.id);
      if (lang !== 'en') url.searchParams.set('lang', lang);
      for (let attempt = 1; ; attempt++) {
        fontFailures.clear();
        await page.goto(url.href);
        if (c.component) await gridOnly(page, width); else await page.waitForSelector('html.atlas-ready', { timeout: 10000 });
        await page.evaluate(() => document.fonts.ready.then(() => true));
        await page.waitForTimeout(250);
        await settle(page);
        if (c.component) for (const f of page.frames()) await f.evaluate(() => document.fonts.ready.then(() => true)).catch(() => {});
        if (!fontFailures.size) break;
        if (attempt === 3) throw new Error(`an external font failed to load 3 times (${[...fontFailures][0]})`);
      }
      fs.mkdirSync(path.dirname(file), { recursive: true });
      if (c.component) await page.locator('body').screenshot({ path: file }); // the whole grid: its height is the states'
      else await page.screenshot({ path: file, clip: { x: 0, y: 0, width, height: 844 } });
      const words = await page.evaluate(() => (document.querySelector('.atlas-phone') || document.body).innerText.replace(/\s+/g, ' ').trim());
      text[`${c.id}|${width}|${lang}`] = words;
      if (lang !== 'en') {
        const en = text[`${c.id}|${width}|en`];
        run.zh = en === undefined ? 'unknown' : en === words ? 'ignored' : 'rendered';
      }
      run.ok = true;
    } catch (e) { run.error = e.message.split('\n')[0]; }
    await page.close();
    runs.push(run);
    console.log(run.ok ? 'OK  ' : 'FAIL', `${lang}-${width}`, c.id, run.zh === 'ignored' ? '(no zh rendering)' : '', run.error || '');
  }
  await context.close();
}
await browser.close();

let commit = opt('commit') || ''; // with --base the server's checkout is someone else's: the caller names its commit
if (!commit && server) try { commit = execSync('git rev-parse HEAD', { cwd: root }).toString().trim(); } catch {}
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'shots.json'), JSON.stringify({ base, commit, runs }, null, 2));
const bad = runs.filter((r) => !r.ok).length;
console.log(`${todo.length} screens × ${langs.length} langs × ${widths.length} widths: ${runs.length - bad} shot, ${bad} failed`);
process.exit(bad ? 1 : 0);
