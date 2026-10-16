// Records every call the atlas screens make into the design-system bundle (SentriUI.*), as the corpus the opt-in proof replays
// (scripts/opt-in-proof.mjs). Each screen is loaded bare once, at 390 in English, from a server on this checkout (or --base); an
// init script wraps window.SentriUI as the bundle assigns it and keeps each distinct call whose result is markup.
// Usage: node scripts/record-calls.mjs <out.json> [--root <checkout>] [--base <url> --commit <hash>] [--atlas <atlas.json>] [--screens a,b]
//   --root  the checkout to serve and read (the gate's base worktree); default this one
// Writes { commit, screens, failed: [{ screen, error }], calls: [[fn, args], ...] } in first-seen order.
import { spawn, execSync } from 'node:child_process';
import { createServer } from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { playwright } from './playwright-path.mjs';
import { screensOf } from './loop-rules.mjs';
import { routeFonts } from './font-route.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = playwright();
const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : null; };
const out = argv.find((a, i) => !a.startsWith('--') && !(argv[i - 1] || '').startsWith('--'));
if (!out) { console.error('usage: node scripts/record-calls.mjs <out.json> [--base <url> --commit <hash>] [--atlas <atlas.json>] [--screens a,b]'); process.exit(2); }

const site = path.resolve(opt('root') || root);
const atlas = JSON.parse(fs.readFileSync(opt('atlas') || path.join(site, 'atlas/atlas.json'), 'utf8'));
const todo = screensOf(atlas, { screens: (opt('screens') || '').split(',').map((s) => s.trim()).filter(Boolean) });
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => r(p)); }); });
let base = opt('base'), server = null;
if (!base) {
  const port = await freePort();
  server = spawn(process.execPath, [path.join(site, 'scripts/serve-ux.cjs'), String(port)], { cwd: site, stdio: 'ignore' });
  process.on('exit', () => server.kill());
  base = `http://127.0.0.1:${port}`; // serve-ux listens on IPv4 only
  await new Promise((r) => setTimeout(r, 400));
}
base = base.replace(/\/$/, '');

// In every frame, before any page script: the bundle's `root.SentriUI = api` lands on a setter that keeps a wrapped copy. Each
// call returning a string is kept once by its name and arguments (JSON: a function argument is dropped, which both bundles of a
// replay see alike). Calls between the bundle's own parts go through local names and are not recorded: only the pages' calls are.
const RECORD = () => {
  const calls = new Map();
  let api;
  Object.defineProperty(globalThis, '__sentriCalls', { value: calls });
  Object.defineProperty(globalThis, 'SentriUI', {
    configurable: true, enumerable: true,
    get: () => api,
    set(real) {
      const wrapped = {};
      for (const k of Object.keys(real)) {
        const f = real[k];
        wrapped[k] = typeof f !== 'function' ? f : function (...args) {
          const r = f.apply(this, args);
          if (typeof r === 'string' && calls.size < 20000) { try { const key = k + '\u0000' + JSON.stringify(args); if (!calls.has(key)) calls.set(key, [k, JSON.parse(JSON.stringify(args))]); } catch {} }
          return r;
        };
      }
      api = Object.freeze(wrapped);
    },
  });
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await routeFonts(context, root);
await context.addInitScript(RECORD);
const seen = new Map(), failed = [];
for (const s of todo) {
  const page = await context.newPage();
  await page.clock.install({ time: new Date('2026-10-11T09:41:00') });
  await page.clock.resume();
  try {
    const url = new URL(base + s.url);
    url.searchParams.set('screen', s.id);
    await page.goto(url.href);
    await page.waitForSelector('html.atlas-ready', { timeout: 15000 });
    await page.waitForTimeout(250);
    for (const fr of page.frames()) {
      const got = await fr.evaluate(() => (globalThis.__sentriCalls ? [...globalThis.__sentriCalls] : [])).catch(() => []);
      for (const [k, v] of got) if (!seen.has(k)) seen.set(k, v);
    }
  } catch (e) { failed.push({ screen: s.id, error: e.message.split('\n')[0] }); }
  await page.close();
}
await browser.close();
let commit = opt('commit') || '';
if (!commit && server) try { commit = execSync('git rev-parse HEAD', { cwd: site }).toString().trim(); } catch {}
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ commit, screens: todo.length, failed, calls: [...seen.values()] }));
console.log(`record-calls: ${seen.size} distinct call(s) from ${todo.length - failed.length} of ${todo.length} screen(s)${failed.length ? `, ${failed.length} failed` : ''} — ${out}`);
process.exit(0);
