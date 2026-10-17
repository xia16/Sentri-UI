// One prepared visit per screen state (docs/design-workflow/gate-v2.md §4): a fresh context at the run's width, the page opened on its
// screen (or a component page's state grid), Ready, then the settling protocol (scripts/settle.mjs). The screenshot and every
// compatible mechanical check (legibility, spacing, headers) then read that one prepared page; each check stays its own evidence.
// A visit reports what went wrong as one of: machine (a recognised machine error: retried once by the scheduler), unstable (the
// screen did not settle, or moved after it settled: the gate blocks), error (a design result: the screen doesn't render).
import { routeFonts } from './font-route.mjs';
import { BOUNDS, settleDecision, verifyCapture, settleProbe, settleSample } from './settle.mjs';
import { classifyMachineError } from './machine.mjs';

// The code a visit's evidence depends on (its identity hashes these, with their local imports).
export const VISIT_CODE = ['scripts/visit.mjs'];
export const CLOCK = '2026-10-11T09:41:00';
export const HEIGHT = 844;

// A component page: the atlas draws its states (one srcdoc frame per state, tokens.css, bundle.css and bundle.js injected), then the
// grid alone becomes the page, two phone-width cells to a row. Moving a frame reloads it; each frame fits its height on load.
export async function gridOnly(page, width) {
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

// Bare screens are pinned to 390: another width overrides that (nothing in the page changes, only the phone's width).
function widthOverride(w) {
  const css = `html.atlas-bare,html.atlas-bare body{width:${w}px!important}html.atlas-bare .atlas-phone{width:${w}px!important}`;
  const add = () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); };
  if (document.head) add(); else document.addEventListener('DOMContentLoaded', add);
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Open and prepare one visit. mode: 'screen' (a bare atlas screen, ?screen=<id>), 'grid' (a component page's state grid lifted out
// at the width, as shot), 'atlas' (a component page as the atlas draws it, as header-checked). url: the page URL, absolute.
// fontsRoot: the checkout whose vendor/fonts serve the fonts (the side's own). Returns the visit; close() it.
// Contexts are kept and reused, one visit at a time each, per origin, width and mode: a fresh context per visit opens fresh
// connections for every file of every page, and ~2,700 visits ran Windows out of sockets (net::ERR_NO_BUFFER_SPACE, 2026-10-17).
// A visit starts on a context whose cookies and storage the last visit cleared; a visit that hit a machine error closes its
// context, so its retry starts in a fresh one.
export function contextPool() {
  const idle = new Map(), all = new Set();
  return {
    async take(key, make) { const l = idle.get(key) || []; while (l.length) { const c = l.pop(); if (all.has(c)) return c; } const c = await make(); all.add(c); return c; },
    give(key, c) { if (!idle.has(key)) idle.set(key, []); idle.get(key).push(c); },
    async drop(c) { all.delete(c); await c.close().catch(() => {}); },
    async close() { for (const c of all) await c.close().catch(() => {}); all.clear(); idle.clear(); },
    get size() { return all.size; },
  };
}

export async function prepareVisit(browser, { url, mode = 'screen', width, lang = 'en', fontsRoot, bounds = BOUNDS, pool = null }) {
  const key = `${new URL(url).origin}|${width}|${mode}|${fontsRoot}`;
  const v = { width, lang, mode, ok: false, page: null, context: null };
  const netErrors = [];
  const make = async () => {
    const c = await browser.newContext({ viewport: { width, height: HEIGHT }, deviceScaleFactor: 1 });
    c._missingFonts = new Set();
    await routeFonts(c, fontsRoot, c._missingFonts);
    if (mode === 'screen') await c.addInitScript(widthOverride, width);
    await c.addInitScript(settleProbe);
    return c;
  };
  // close(): the page goes; the context is cleared and kept for the next visit, or closed when this one was the machine's fault
  v.close = async () => {
    const c = v.context;
    if (!c) return;
    if (!pool || v.machine) { if (pool) await pool.drop(c); else await c.close().catch(() => {}); return; }
    try {
      await v.page?.evaluate(async () => { try { localStorage.clear(); sessionStorage.clear(); } catch {} try { for (const d of (await indexedDB.databases?.()) || []) indexedDB.deleteDatabase(d.name); } catch {} });
      await c.clearCookies();
      for (const p of c.pages()) await p.close();
      pool.give(key, c);
    } catch { await pool.drop(c); }
  };
  let inflight = 0;
  try {
    v.context = pool ? await pool.take(key, make) : await make();
    const missingFonts = v.context._missingFonts;
    missingFonts.clear();
    const page = v.page = await v.context.newPage();
    // The clock starts at a fixed moment and then runs: a screen that prints "now" would otherwise differ from minute to minute, and
    // a frozen clock would stall the screens' own tap guards and timers.
    await page.clock.install({ time: new Date(CLOCK) });
    await page.clock.resume();
    page.on('request', () => { inflight++; });
    page.on('requestfinished', () => { inflight = Math.max(0, inflight - 1); });
    page.on('requestfailed', (r) => {
      inflight = Math.max(0, inflight - 1);
      const err = r.failure()?.errorText || '';
      // A request the page itself cancelled (a frame that went away, a navigation) is not the network; a font the vendor folder
      // doesn't have is aborted by the route and named as such (a design result: vendor it).
      if (/ERR_ABORTED/.test(err) || /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(r.url())) return;
      if (/net::ERR_/.test(err)) netErrors.push(`${err} ${r.url()}`);
    });
    // a 5xx from the gate's own server is the machine too (a 404 is a missing file: a design result)
    const origin = new URL(url).origin;
    page.on('response', (r) => { if (r.status() >= 500 && r.url().startsWith(origin)) netErrors.push(`HTTP ${r.status()} ${r.url()}`); });
    const u = new URL(url);
    if (lang !== 'en') u.searchParams.set('lang', lang);
    await page.goto(u.href, { timeout: 30000 });
    if (mode === 'grid') await gridOnly(page, width);
    else if (mode === 'atlas') await page.waitForSelector('.vbody .sgrid .scell iframe', { timeout: 15000 });
    else await page.waitForSelector('html.atlas-ready', { timeout: 10000 });
    for (const f of page.frames()) await f.evaluate(() => document.fonts.ready.then(() => true)).catch(() => {});
    // ---- settle ----
    const t0 = Date.now(), samples = [];
    const sample = async () => {
      const parts = (await Promise.all(page.frames().map((f) => f.evaluate(settleSample, bounds).catch(() => null)))).filter(Boolean);
      return {
        t: Date.now() - t0, requests: inflight,
        fonts: parts.every((p) => p.fonts === 'loaded') ? 'loaded' : 'loading',
        scrolling: parts.some((p) => p.scrolling), timers: parts.reduce((n, p) => n + p.timers, 0),
        animations: parts.reduce((n, p) => n + p.animations, 0), mutations: parts.reduce((n, p) => n + p.mutations, 0),
      };
    };
    for (;;) {
      samples.push(await sample());
      const d = settleDecision(samples, bounds);
      if (d.state === 'settled') { v.settledAt = d.at; break; }
      if (d.state === 'unstable') { v.unstable = d.why; break; }
      await wait(bounds.sample);
    }
    v.sample = sample;
    if (v.context._missingFonts.size) v.error = `a font the vendor folder doesn't have: ${[...missingFonts][0]} (scripts/vendor-fonts.mjs)`;
    if (netErrors.length) { v.machine = 'net-error'; v.error = netErrors[0]; }
    v.netErrors = netErrors;
    v.ok = !v.unstable && !v.error && !v.machine;
  } catch (e) {
    const msg = String(e.message || e).split('\n')[0];
    v.machine = classifyMachineError(msg) || (netErrors.length ? 'net-error' : null);
    v.error = msg;
  }
  return v;
}

// The shot: taken, and taken again a quiet window later; the two must be the same image and nothing may change between them.
// Returns { png, text } or { unstable } (or { machine, error } when a request failed meanwhile).
export async function captureShot(v, bounds = BOUNDS) {
  const page = v.page;
  // caret: 'initial' — Playwright would otherwise hide the caret by injecting a style into every frame for each shot, a DOM change
  // of its own (the harness already draws the caret transparent). The page is sampled after the first shot and again a quiet window
  // later, before the second: nothing may change between them.
  const shoot = () => (v.mode === 'grid' ? page.locator('body').screenshot({ caret: 'initial' }) : page.screenshot({ clip: { x: 0, y: 0, width: v.width, height: HEIGHT }, caret: 'initial' }));
  const a = await shoot();
  const before = await v.sample();
  await wait(bounds.quiet);
  const after = await v.sample();
  const b = await shoot();
  const ok = verifyCapture({ a, b, before, after });
  if (v.netErrors.length) { v.machine = 'net-error'; return { machine: 'net-error', error: v.netErrors[0] }; }
  if (!ok.stable) return { unstable: ok.why };
  // the words on the screen: a ?lang=zh page that shows the same words as English does not render Chinese
  const text = await page.evaluate(() => (document.querySelector('.atlas-phone') || document.body).innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
  return { png: a, text };
}
