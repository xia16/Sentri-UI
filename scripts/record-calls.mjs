// Records, for every atlas screen, which design-system functions it calls (SentriUI.*, SentriIcons.*), and the distinct calls whose
// result is markup, as the corpus the opt-in proof replays and the map reach by caller reads (scripts/opt-in-proof.mjs,
// scripts/bundle-graph.mjs). Each screen is loaded bare once, at 390 in English, from a server on a checkout; atlas-bare.js applies
// its preset and replays its steps before it marks the page ready, so a recording covers every call up to the state the gate shoots.
// Usage: node scripts/record-calls.mjs <out.json> [--root <checkout>] [--base <url> --commit <hash>] [--key <k>] [--atlas <atlas.json>] [--screens a,b]
//   --root  the checkout to serve and read (the gate's base worktree); default this one
//   --key   stored as the recording's key (the gate: base sha, base bundle hash, this script's hash); a reader ignores another key
// Writes { commit, key, screens: { id: { ok, fns: ['SentriUI.row', …], files: ['ux/laws/strings.json', …], error? } },
// calls: [[fn, args], …] } (calls: SentriUI only, first-seen order; files: every path the screen fetched from the server).
// A screen that never becomes ready is { ok: false }: unrecorded, so in reach.
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
if (!out) { console.error('usage: node scripts/record-calls.mjs <out.json> [--root <checkout>] [--base <url> --commit <hash>] [--key <k>] [--atlas <atlas.json>] [--screens a,b]'); process.exit(2); }

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

// In every frame, before any page script: each namespace the bundle assigns (root.SentriUI = api, root.SentriIcons = api) lands
// on a setter that keeps a wrapped copy. Every call is noted by its qualified name; a SentriUI call whose result is a string is
// also kept once by its name and arguments (JSON: a function argument is dropped, which both bundles of a replay see alike).
// Calls between the bundle's own parts go through local names and are not recorded: the call graph covers those.
const RECORD = () => {
  const calls = new Map(), fns = new Set();
  Object.defineProperty(globalThis, '__sentriCalls', { value: calls });
  Object.defineProperty(globalThis, '__sentriFns', { value: fns });
  for (const ns of ['SentriUI', 'SentriIcons']) {
    let api;
    Object.defineProperty(globalThis, ns, {
      configurable: true, enumerable: true,
      get: () => api,
      set(real) {
        const wrapped = {};
        for (const k of Object.keys(real)) {
          const f = real[k];
          wrapped[k] = typeof f !== 'function' ? f : function (...args) {
            fns.add(`${ns}.${k}`);
            const r = f.apply(this, args);
            if (ns === 'SentriUI' && typeof r === 'string' && calls.size < 20000) { try { const key = k + '\u0000' + JSON.stringify(args); if (!calls.has(key)) calls.set(key, [k, JSON.parse(JSON.stringify(args))]); } catch {} }
            return r;
          };
        }
        api = Object.freeze(wrapped);
      },
    });
  }
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await routeFonts(context, root);
await context.addInitScript(RECORD);
const seen = new Map(), screens = {};
for (const s of todo) {
  const page = await context.newPage();
  await page.clock.install({ time: new Date('2026-10-11T09:41:00') });
  await page.clock.resume();
  const fns = new Set(), fetched = new Set();
  // every file the screen (or a frame of it) asks this server for, up to the shot state: a file no page names but one fetches at
  // runtime (ux/laws/strings.json) reaches only the screens that fetch it. The context's routes turn the HTTP cache off, so a
  // file a second screen fetches is seen again.
  page.on('request', (rq) => { try { const u = new URL(rq.url()); if (u.origin === new URL(base).origin) fetched.add(decodeURIComponent(u.pathname).replace(/^\/+/, '')); } catch {} });
  try {
    const url = new URL(base + s.url);
    url.searchParams.set('screen', s.id);
    await page.goto(url.href);
    await page.waitForSelector('html.atlas-ready', { timeout: 15000 });
    await page.waitForTimeout(250);
    for (const fr of page.frames()) {
      const got = await fr.evaluate(() => ({ calls: globalThis.__sentriCalls ? [...globalThis.__sentriCalls] : [], fns: globalThis.__sentriFns ? [...globalThis.__sentriFns] : [] })).catch(() => ({ calls: [], fns: [] }));
      for (const [k, v] of got.calls) if (!seen.has(k)) seen.set(k, v);
      for (const f of got.fns) fns.add(f);
    }
    screens[s.id] = { ok: true, fns: [...fns].sort(), files: [...fetched].sort() };
  } catch (e) { screens[s.id] = { ok: false, fns: [], files: [], error: e.message.split('\n')[0] }; }
  await page.close();
}
await browser.close();
let commit = opt('commit') || '';
if (!commit && server) try { commit = execSync('git rev-parse HEAD', { cwd: site }).toString().trim(); } catch {}
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ commit, key: opt('key') || '', screens, calls: [...seen.values()] }));
const failed = Object.values(screens).filter((r) => !r.ok).length;
console.log(`record-calls: ${seen.size} distinct call(s) from ${todo.length - failed} of ${todo.length} screen(s)${failed ? `, ${failed} not recorded` : ''} — ${out}`);
process.exit(0);
