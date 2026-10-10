// Screenshots atlas screens bare, at each width and language, from a running server (or one it starts on this checkout).
// Usage: node scripts/shoot-screens.mjs <out dir> [--base <url> --commit <hash>] [--atlas <atlas.json>] [--feature id,id] [--screens id,id] [--widths 390,360] [--langs en,zh]
// Writes <out>/<screen id>/<lang>-<width>.png and <out>/shots.json:
//   { base, commit, runs: [{ screen, feature, lang, width, file, ok, error?, zh? }] }
// zh is "rendered" or "ignored": a page that shows the same text with ?lang=zh does not render Chinese, and the run says so
// instead of passing off an English screenshot as Chinese. Bare screens are pinned to 390; other widths override that the way
// scripts/run-scenarios.mjs does (nothing in the page changes, only the phone's width).
import { spawn, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { screensOf } from './loop-rules.mjs';
import { routeFonts } from './font-route.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PW_HOME = 'C:/Users/ying_/.cache/adam-design/playwright-1.63.0';
const { chromium } = createRequire(PW_HOME + '/package.json')(process.env.SENTRI_PLAYWRIGHT || PW_HOME + '/node_modules/playwright');

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : null; };
const csv = (k, d) => (opt(k) || d).split(',').map((s) => s.trim()).filter(Boolean);
const out = argv.find((a, i) => !a.startsWith('--') && !(argv[i - 1] || '').startsWith('--'));
if (!out) { console.error('usage: node scripts/shoot-screens.mjs <out dir> [--base <url>] [--feature a,b] [--screens a,b] [--widths 390,360] [--langs en,zh]'); process.exit(2); }

const atlas = JSON.parse(fs.readFileSync(opt('atlas') || path.join(root, 'atlas/atlas.json'), 'utf8')); // --atlas: another checkout's screens
const todo = screensOf(atlas, { features: csv('feature', ''), screens: csv('screens', '') });
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
  const page = await context.newPage();
  page.on('requestfailed', (r) => { if (/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(r.url())) fontFailures.add(r.url()); });
  for (const c of todo) for (const lang of langs) {
    const file = path.join(out, c.id, `${lang}-${width}.png`);
    const run = { screen: c.id, feature: c.feature, lang, width, file: path.relative(out, file).replace(/\\/g, '/'), ok: false };
    try {
      const url = new URL(base + c.url);
      url.searchParams.set('screen', c.id);
      if (lang !== 'en') url.searchParams.set('lang', lang);
      for (let attempt = 1; ; attempt++) {
        fontFailures.clear();
        await page.goto(url.href);
        await page.waitForSelector('html.atlas-ready', { timeout: 10000 });
        await page.evaluate(() => document.fonts.ready.then(() => true));
        await page.waitForTimeout(250);
        if (!fontFailures.size) break;
        if (attempt === 3) throw new Error(`an external font failed to load 3 times (${[...fontFailures][0]})`);
      }
      fs.mkdirSync(path.dirname(file), { recursive: true });
      await page.screenshot({ path: file, clip: { x: 0, y: 0, width, height: 844 } });
      const words = await page.evaluate(() => (document.querySelector('.atlas-phone') || document.body).innerText.replace(/\s+/g, ' ').trim());
      text[`${c.id}|${width}|${lang}`] = words;
      if (lang !== 'en') {
        const en = text[`${c.id}|${width}|en`];
        run.zh = en === undefined ? 'unknown' : en === words ? 'ignored' : 'rendered';
      }
      run.ok = true;
    } catch (e) { run.error = e.message.split('\n')[0]; }
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
