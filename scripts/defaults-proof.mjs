// The component pages as the gate captures them, and the defaults proof's own fixtures (lighter gate 2, briefs/gate.md "The fast path").
// scripts/shoot-screens.mjs imports the capture from here (LAUNCH, settle, gridOnly, specimenPrints), so the fixtures run the
// gate's own code. The decision is proveDefaults in scripts/loop-rules.mjs.
// Usage: node scripts/defaults-proof.mjs --self-test
//   Each folder in scripts/defaults-proof.fixtures/ (but base/) is a candidate over the shared base/: its files replace base's
//   (bundle.css, bundle.js, <Name>/variants/<variant>.html). Every specimen page is drawn on both sides by the atlas's own state
//   grid (atlas/library.js stateGridAt) at 390 and 360, printed like the gate prints it, and proved; case.json says what the proof
//   must find: { "expect": "pass" | "fail", "own": [components], "changed": [components the proof names] }.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// One raster thread: Chromium's parallel raster anti-aliases a curve a hair differently from run to run (a channel off by 1-2 at
// a chip's rounded corners), so the same commit shot twice differed (FilterChips/tags, 1 run in 4) and blocked changes that
// never touched it (#173). With one thread, 8 runs of 8 are identical. The base cache is keyed on this file, so it refreshes.
export const LAUNCH = { args: ['--num-raster-threads=1', '--disable-partial-raster'] };

const sha = (b) => createHash('sha256').update(b).digest('hex').slice(0, 20);

// A sheet that slides in, or a backdrop that blurs, is still moving 250ms after load on a slow machine: wait for every finite
// animation and transition to finish (at most 3s), then two frames, so a shot never catches a screen mid-motion.
export async function settle(page) {
  await page.evaluate(() => Promise.race([
    Promise.all(document.getAnimations().filter((a) => a.effect?.getComputedTiming().endTime !== Infinity).map((a) => a.finished.catch(() => {}))),
    new Promise((r) => setTimeout(r, 3000)),
  ]).then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))));
}

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

// Each state of a component page, after gridOnly and the shot: { name, png, html }, the hash of its frame's pixels and of its frame's
// body as the bundle left it (the HTML catches a default that draws nothing: an attribute, a role, a label).
export async function specimenPrints(page) {
  const out = [];
  for (const cell of await page.$$('.sgrid .scell')) {
    const name = await cell.$eval('figcaption', (e) => e.textContent.trim()).catch(() => '');
    // a frame that can't be printed has no print (null), which the proof refuses, never counts as the same
    const frame = await cell.$('iframe');
    const html = frame ? await frame.evaluate((f) => f.contentDocument?.body?.innerHTML ?? null).catch(() => null) : null;
    const png = frame ? await frame.screenshot().catch(() => null) : null;
    out.push({ name, png: png ? sha(png) : null, html: html == null ? null : sha(html) });
  }
  return out;
}
export const pngSha = (file) => sha(fs.readFileSync(file));

// ---------- --self-test: the fixtures ----------
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url && process.argv.includes('--self-test')) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const { playwright } = await import('./playwright-path.mjs');
  const { proveDefaults } = await import('./loop-rules.mjs');
  const FIX = path.join(root, 'scripts/defaults-proof.fixtures');
  const T = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };
  const at = (dir, rel) => { const f = path.join(dir, rel); return fs.existsSync(f) ? f : null; };
  // The specimen pages a side has: <Name>/variants/<variant>.html in base/, plus the candidate's own.
  const pagesIn = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir) : []).filter((n) => fs.existsSync(path.join(dir, n, 'variants'))).flatMap((n) => fs.readdirSync(path.join(dir, n, 'variants')).filter((v) => v.endsWith('.html')).map((v) => ({ component: n, variant: v.replace(/\.html$/, '') })));
  const harness = (c, v) => `<!doctype html><html><head><meta charset="utf-8"></head><body><div class="vbody"></div>
<script>const el = (h) => { const t = document.createElement('template'); t.innerHTML = h.trim(); return t.content.firstElementChild; };
const esc = (x) => String(x ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));</script>
<script src="/atlas/library.js"></script>
<script>stateGridAt('/ux/design-system/components/${c}/', '${v}').then((g) => document.querySelector('.vbody').append(g));</script></body></html>`;
  const { chromium } = playwright();
  const browser = await chromium.launch(LAUNCH);
  // One side: every specimen page at 390 and 360, as the gate shoots and prints a component page.
  async function side(dir) {
    const runs = [];
    for (const width of [390, 360]) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: 1 });
      await context.route('**/*', (r) => {
        const u = new URL(r.request().url());
        if (u.hostname !== 'fixture.test') return r.abort();
        const p = decodeURIComponent(u.pathname);
        let file = null;
        if (p === '/atlas/library.js' || p === '/ux/design-system/tokens.css') file = path.join(root, p);
        else { const m = /^\/ux\/design-system\/components\/(.+)$/.exec(p); if (m) file = at(dir, m[1]) || at(path.join(FIX, 'base'), m[1]); }
        if (p.startsWith('/page/')) { const [, c, v] = p.split('/').slice(1); return r.fulfill({ status: 200, contentType: 'text/html', body: harness(c, v) }); }
        if (!file || !fs.existsSync(file)) return r.fulfill({ status: 404, body: '' });
        return r.fulfill({ status: 200, contentType: T[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
      });
      const pages = [...pagesIn(path.join(FIX, 'base')), ...pagesIn(dir)].filter((x, i, a) => a.findIndex((y) => y.component === x.component && y.variant === x.variant) === i);
      for (const { component, variant } of pages) {
        const page = await context.newPage();
        const run = { screen: `ds:${component}/${variant}`, feature: 'design-system', lang: 'en', width, ok: false };
        try {
          await page.goto(`http://fixture.test/page/${component}/${variant}`);
          await gridOnly(page, width);
          await settle(page);
          run.sha = sha(await page.locator('body').screenshot());
          run.states = await specimenPrints(page);
          run.ok = true;
        } catch (e) { run.error = e.message.split('\n')[0]; }
        await page.close();
        runs.push(run);
      }
      await context.close();
    }
    return runs;
  }
  const base = await side(path.join(FIX, 'base'));
  let fails = 0, n = 0;
  // the base against itself first: a print that isn't stable would fail every candidate
  for (const c of ['(base against itself)', ...fs.readdirSync(FIX).filter((d) => d !== 'base' && fs.existsSync(path.join(FIX, d, 'case.json'))).sort()]) {
    const spec = c.startsWith('(') ? { expect: 'pass', own: [], changed: [] } : JSON.parse(fs.readFileSync(path.join(FIX, c, 'case.json'), 'utf8'));
    const cand = c.startsWith('(') ? await side(path.join(FIX, 'base')) : await side(path.join(FIX, c));
    const p = proveDefaults({ base, cand, own: spec.own || [] });
    const ok = (spec.expect === 'pass') === p.ok && JSON.stringify(p.changed) === JSON.stringify(spec.changed || []);
    n++; if (!ok) fails++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${c}  expected ${spec.expect}${spec.changed?.length ? ` (${spec.changed.join(', ')})` : ''}  got ${p.ok ? 'pass' : 'fail'}: ${p.line}`);
    if (!ok || !p.ok) for (const w of p.why.slice(0, 6)) console.log(`       ${w}`);
  }
  await browser.close();
  console.log(`${n - fails}/${n} defaults-proof fixtures behave as expected`);
  process.exit(fails ? 1 : 0);
}
