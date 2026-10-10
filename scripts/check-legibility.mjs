// The farm legibility check: type size, contrast and tap-target size on every atlas screen, rendered bare at 390 x 844.
// Usage: node scripts/check-legibility.mjs [--base <url>] [--feature <id>] [--changed <screen ids> [--compare <base url>]] [--strict] [--self-test]
//   --base      an already-running server (default: this script serves the repo itself)
//   --feature   only the screens of one feature (does not write review/legibility.json)
//   --changed   the screen ids a PR touches (comma or space separated); the exit code is 1 only when one of them fails
//   --compare   with --changed: the base server. A changed screen then fails only when it has MORE violations than the same
//               screen at the base (per category), or a violation on an element that had none there. Use until the type pass lands.
//   --strict    exit 1 when any screen fails (the absolute floors). The gate runs strict, not compare, once
//               docs/design-workflow/README.md says "Legibility gate: strict".
// Writes review/legibility.json. Floors: ux/design-system/README.md, "The farm legibility law".
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PW = process.env.PLAYWRIGHT_DIR || 'C:/Users/ying_/.cache/adam-design/playwright-1.63.0/node_modules/playwright';
const { chromium } = createRequire('C:/Users/ying_/.cache/adam-design/playwright-1.63.0/package.json')(PW);
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.cjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.md': 'text/plain' };

const FLOORS = { minText: 13, bodyText: 16, contrast: 4.5, contrastPrimary: 7, tap: 48 };

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const val = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null; };
const list = (n) => { const i = argv.indexOf(n); if (i < 0) return null; const out = []; for (let j = i + 1; j < argv.length && !argv[j].startsWith('--'); j++) out.push(...argv[j].split(',')); return out.map((s) => s.trim()).filter(Boolean); };

/* ---------- runs inside the page (every frame) ---------- */
function auditInPage(F) {
  const W = innerWidth, H = innerHeight;
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  const memo = new Map();
  const parse = (c) => { // -> [r,g,b,a]: rgb 0..255, alpha 0..1
    if (memo.has(c)) return memo.get(c);
    let out; const m = c.match(/^rgba?\(([^)]*)\)$/);
    if (m) { const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat); out = [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
    else { cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; out = [d[0], d[1], d[2], d[3] / 255]; }
    memo.set(c, out); return out;
  };
  const over = (top, a, under) => [0, 1, 2].map((i) => top[i] * a + under[i] * (1 - a)); // top at alpha a over an opaque colour
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const cs = (e, p) => getComputedStyle(e, p);
  const sel = (e) => { const cls = (typeof e.className === 'string' ? e.className : '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((c) => '.' + c).join(''); return e.tagName.toLowerCase() + cls + (e.getAttribute('data-action') ? '[data-action=' + e.getAttribute('data-action') + ']' : ''); };
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TITLE', 'HEAD', 'OPTION', 'TEMPLATE']);
  const related = (a, b) => a === b || a.contains(b) || b.contains(a);

  // is a box really on screen: inside the frame, not clipped by an overflow:hidden ancestor, not faded or hidden
  const shown = (el, r) => {
    if (r.right <= 0 || r.left >= W || r.bottom <= 0) return false;
    if (r.width < 2 && r.height < 2) return false;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const s = cs(e);
      if (s.display === 'none' || s.visibility === 'hidden' || s.visibility === 'collapse' || parseFloat(s.opacity) === 0 || e.getAttribute('aria-hidden') === 'true' || e.hasAttribute('hidden') || e.hasAttribute('inert')) return false;
      if (e !== el && /hidden|clip/.test(s.overflowX + s.overflowY)) { const b = e.getBoundingClientRect(); if (r.right <= b.left || r.left >= b.right || r.bottom <= b.top || r.top >= b.bottom) return false; }
      if (/rect\(0(px)?,? ?0(px)?,? ?0(px)?,? ?0(px)?\)|inset\(50%\)/.test(s.clip + ' ' + s.clipPath) && e.getBoundingClientRect().width <= 2) return false; // visually-hidden
    }
    return true;
  };
  const chrome = (el) => !!el.closest('.statusbar, [data-statusbar]');

  // the opaque colour behind a point of `el`: ancestors' backgrounds (alpha, gradients), then overlays stacked above it
  function backdrop(el, x, y) {
    const layers = []; let unknown = false;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const s = cs(e), c = parse(s.backgroundColor), op = parseFloat(s.opacity), img = s.backgroundImage, hasImg = img && img !== 'none';
      if (hasImg) {
        if (/gradient/.test(img)) { const stops = (img.match(/rgba?\([^)]*\)/g) || []).map(parse); if (stops.length) layers.push({ stops, op }); }
        else unknown = true;
      }
      if (c[3] > 0) layers.push({ c, op });
      if (c[3] * op >= 0.99 && !hasImg) break;
    }
    let cur = [255, 255, 255];
    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i];
      if (l.c) cur = over(l.c, l.c[3] * l.op, cur);
      else { const under = cur, ws = l.stops.map((s) => over(s, s[3] * l.op, under)); cur = ws.reduce((w, v) => (lum(v) < lum(w) ? v : w), ws[0]); } // worst case: the darkest stop
    }
    let obscured = false;
    const hits = document.elementsFromPoint(x, y);
    const idx = hits.findIndex((h) => related(h, el));
    for (let i = (idx < 0 ? hits.length : idx) - 1; i >= 0; i--) { // overlays above the text, nearest to the text last
      const h = hits[i]; if (related(h, el) || h === document.documentElement || h === document.body) continue;
      const s = cs(h), c = parse(s.backgroundColor), a = c[3] * parseFloat(s.opacity);
      if (a >= 0.99) { obscured = true; break; }
      if (a > 0) cur = over(c, a, cur);
    }
    return { color: cur, unknown, obscured };
  }

  const out = { small: [], c45: [], c7: [], taps: [], unverified: 0, sizes: {} };
  const push = (arr, o) => { const f = arr.find((a) => a.sel === o.sel && a.px === o.px && a.ratio === o.ratio && a.size === o.size); if (f) f.n++; else arr.push({ n: 1, ...o }); };

  const checkText = (el, rect, text, color, px) => {
    if (!px || !text.trim() || !shown(el, rect) || chrome(el)) return;
    const sample = text.trim().replace(/\s+/g, ' ').slice(0, 40), disabled = !!el.closest(':disabled, [aria-disabled="true"]');
    out.sizes[px] = (out.sizes[px] || 0) + 1;
    const rec = { sel: sel(el), text: sample, px };
    if (px < F.minText) push(out.small, rec);
    // Disabled text is NOT exempt (unlike WCAG): a greyed-out pen tile or "Save · 0 pigs" still carries information a farmer reads.
    // Show "unavailable" with the surface, an icon or a word, never by fading the text. (Owner, 2026-10-10.)
    void disabled;
    const x = Math.min(Math.max(rect.left + rect.width / 2, 0), W - 1), y = Math.min(Math.max(rect.top + rect.height / 2, 0), H - 1);
    const bd = backdrop(el, x, y);
    if (bd.obscured) return;
    if (bd.unknown) { out.unverified++; return; } // a photo behind the text: cannot be measured here
    let op = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) op *= parseFloat(cs(e).opacity);
    const fg = over(color, color[3] * op, bd.color), r = ratio(fg, bd.color), fixed = Math.round(r * 10) / 10;
    if (r < F.contrast) push(out.c45, { ...rec, ratio: fixed });
    else if (px >= F.bodyText && r < F.contrastPrimary) push(out.c7, { ...rec, ratio: fixed });
  };

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const el = n.parentElement;
    if (!el || SKIP.has(el.tagName) || !n.nodeValue.trim()) continue;
    const range = document.createRange(); range.selectNodeContents(n);
    const rect = [...range.getClientRects()].find((r) => r.width > 0 && r.height > 0);
    if (!rect) continue;
    const s = cs(el);
    checkText(el, rect, n.nodeValue, parse(s.color), parseFloat(s.fontSize));
  }
  for (const el of document.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=range]), textarea')) {
    const rect = el.getBoundingClientRect(), s = cs(el), px = parseFloat(s.fontSize);
    if (el.value) checkText(el, rect, el.value, parse(s.color), px);
    else if (el.placeholder) checkText(el, rect, el.placeholder, parse(cs(el, '::placeholder').color), px);
  }

  // tap targets: the control, widened by an invisible ::before/::after hit area; a control inside a native button, link or label is that one's
  const TAP = 'button, a[href], [role=button], [role=tab], [role=link], [role=checkbox], [role=radio], [role=switch], [role=menuitem], [role=option], input:not([type=hidden]), select, textarea, summary, [data-action], label';
  const NATIVE = 'button, a[href], label, summary';
  for (const el of document.querySelectorAll(TAP)) {
    if (el.tagName === 'LABEL' && !el.control) continue;
    if (el.tagName === 'INPUT' && el.labels && el.labels.length) continue; // its label is the hit area
    if (el.tagName !== 'INPUT' && el.parentElement && el.parentElement.closest(NATIVE)) continue;
    const r = el.getBoundingClientRect();
    if (!shown(el, r) || chrome(el)) continue;
    const top = document.elementFromPoint(Math.min(Math.max(r.left + r.width / 2, 0), W - 1), Math.min(Math.max(r.top + r.height / 2, 0), H - 1));
    if (top && !related(top, el)) { const t = top.closest(TAP); if (!t || !related(t, el)) continue; } // covered by something else
    let L = r.left, T = r.top, R = r.right, B = r.bottom;
    for (const pseudo of ['::before', '::after']) {
      const p = cs(el, pseudo);
      if (p.content === 'none' || p.content === 'normal' || p.display === 'none' || p.pointerEvents === 'none' || p.position !== 'absolute') continue;
      const pw = parseFloat(p.width), ph = parseFloat(p.height); if (!pw || !ph) continue;
      const pl = parseFloat(p.left), pt = parseFloat(p.top);
      const left = Number.isFinite(pl) ? r.left + pl : r.left + (r.width - pw) / 2, tp = Number.isFinite(pt) ? r.top + pt : r.top + (r.height - ph) / 2;
      L = Math.min(L, left); T = Math.min(T, tp); R = Math.max(R, left + pw); B = Math.max(B, tp + ph);
    }
    const w = R - L, h = B - T;
    if (w < F.tap - 0.5 || h < F.tap - 0.5) push(out.taps, { sel: sel(el), text: (el.getAttribute('aria-label') || el.textContent || el.title || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 30), size: Math.round(w) + 'x' + Math.round(h) });
  }
  return out;
}

/* type tokens and rules that set a size under the floor */
function tokensInPage(F) {
  const toPx = (v) => { v = v.trim(); if (/^[\d.]+px$/.test(v)) return parseFloat(v); if (/^[\d.]+r?em$/.test(v)) return parseFloat(v) * 16; return null; };
  const tokens = {}, uses = {};
  const walk = (rules) => {
    for (const r of rules) {
      if (r.cssRules) walk(r.cssRules);
      if (!r.style) continue;
      for (let i = 0; i < r.style.length; i++) {
        const name = r.style[i], v = r.style.getPropertyValue(name);
        if (name.startsWith('--type')) { const px = toPx(v); if (px !== null && px < F.minText) tokens[name] = px; }
        if (/font/.test(name)) for (const m of v.matchAll(/var\((--type[\w-]*)/g)) uses[m[1]] = (uses[m[1]] || 0) + 1;
      }
    }
  };
  for (const sh of document.styleSheets) { try { walk(sh.cssRules); } catch (e) { /* cross-origin */ } }
  return Object.entries(tokens).map(([name, px]) => ({ name, px, usedBy: uses[name] || 0 }));
}

/* ---------- harness ---------- */
let server = null, base = val('--base');
if (!base) {
  server = http.createServer((req, res) => {
    const f = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': (TYPES[path.extname(f)] || 'application/octet-stream') + '; charset=utf-8' });
    fs.createReadStream(f).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port;
}
base = base.replace(/\/$/, '');

const merge = (parts) => {
  const m = { small: [], c45: [], c7: [], taps: [], unverified: 0, sizes: {} };
  for (const p of parts) {
    m.unverified += p.unverified;
    for (const [k, v] of Object.entries(p.sizes)) m.sizes[k] = (m.sizes[k] || 0) + v;
    for (const k of ['small', 'c45', 'c7', 'taps']) for (const o of p[k]) { const f = m[k].find((a) => a.sel === o.sel && a.px === o.px && a.ratio === o.ratio && a.size === o.size); if (f) f.n += o.n; else m[k].push({ ...o }); }
  }
  return m;
};
const count = (arr) => arr.reduce((s, o) => s + o.n, 0);
const failing = (a) => a.small.length + a.c45.length + a.c7.length + a.taps.length > 0;

async function auditUrl(browser, url, bare) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    if (bare) await page.waitForFunction(() => !document.documentElement.classList.contains('atlas-bare') || document.documentElement.classList.contains('atlas-ready'), null, { timeout: 8000 }).catch(() => {});
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);
    await page.evaluate(() => document.fonts.ready);
    const parts = [];
    for (const fr of page.frames()) { try { if (await fr.evaluate(() => innerWidth > 0 && innerHeight > 0)) parts.push(await fr.evaluate(auditInPage, FLOORS)); } catch (e) { /* detached frame */ } }
    const tokens = await page.evaluate(tokensInPage, FLOORS);
    return { audit: merge(parts), tokens };
  } finally { await ctx.close(); }
}

const browser = await chromium.launch();

/* --self-test: each known-bad fixture must fail the checks named in its <meta name="expect">; the good one must pass */
if (flag('--self-test')) {
  const dir = path.join(root, 'scripts/check-legibility.fixtures');
  let fails = 0, n = 0;
  for (const fn of fs.readdirSync(dir).filter((f) => f.endsWith('.html')).sort()) {
    const html = fs.readFileSync(path.join(dir, fn), 'utf8');
    const expect = ((html.match(/name="expect" content="([^"]*)"/) || [])[1] || '').split(',').filter(Boolean);
    const { audit } = await auditUrl(browser, base + '/scripts/check-legibility.fixtures/' + fn, false);
    const got = [audit.small.length && 'small', audit.c45.length && 'contrast', audit.c7.length && 'contrast-primary', audit.taps.length && 'tap'].filter(Boolean);
    const ok = expect.length ? expect.every((e) => got.includes(e)) : got.length === 0;
    n++; if (!ok) fails++;
    console.log((ok ? 'ok   ' : 'FAIL ') + fn + '  expected [' + (expect.join(',') || 'pass') + ']  got [' + (got.join(',') || 'pass') + ']');
  }
  console.log((n - fails) + '/' + n + ' fixtures behave as expected');
  await browser.close(); if (server) server.close();
  process.exit(fails ? 1 : 0);
}

const atlas = JSON.parse(fs.readFileSync(path.join(root, 'atlas/atlas.json'), 'utf8'));
const screens = [], seen = new Set();
for (const p of atlas.platforms) for (const s of p.sections) for (const f of s.features || []) for (const sc of f.screens || []) {
  if (seen.has(sc.id) || !sc.url) continue; seen.add(sc.id); screens.push({ id: sc.id, feature: f.id, url: sc.url });
}
const only = val('--feature');
const todo = only ? screens.filter((s) => s.feature === only) : screens;
if (only && !todo.length) { console.error('no screens for feature "' + only + '"'); process.exit(2); }
const changed = list('--changed') || [];
const unknown = changed.filter((id) => !seen.has(id));
if (unknown.length) console.warn('warning: --changed names screens not in the atlas: ' + unknown.join(', '));

const results = new Array(todo.length), tokenMap = new Map();
let next = 0;
async function worker() {
  while (next < todo.length) {
    const i = next++, s = todo[i];
    const u = new URL(base + s.url); u.searchParams.set('screen', s.id);
    try {
      const { audit, tokens } = await auditUrl(browser, u.toString(), true);
      for (const t of tokens) if (!tokenMap.has(t.name) || tokenMap.get(t.name).usedBy < t.usedBy) tokenMap.set(t.name, t);
      results[i] = { id: s.id, feature: s.feature, small: count(audit.small), contrast: count(audit.c45), contrastPrimary: count(audit.c7), taps: count(audit.taps), fails: failing(audit), unverified: audit.unverified, sizes: audit.sizes, smallText: audit.small, lowContrast: audit.c45, lowContrastPrimary: audit.c7, smallTargets: audit.taps };
    } catch (e) { results[i] = { id: s.id, feature: s.feature, error: String(e.message).split('\n')[0].slice(0, 120), fails: false }; }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
await browser.close(); if (server) server.close();

/* ---------- report ---------- */
const byFeature = {}, offenders = {};
for (const r of results) {
  const f = (byFeature[r.feature] ||= { screens: 0, failing: 0, small: 0, contrast: 0, contrastPrimary: 0, taps: 0, errors: 0 });
  f.screens++; if (r.error) { f.errors++; continue; }
  if (r.fails) f.failing++; f.small += r.small; f.contrast += r.contrast; f.contrastPrimary += r.contrastPrimary; f.taps += r.taps;
  for (const o of r.smallText) { const k = o.sel + ' @' + o.px + 'px'; offenders[k] = (offenders[k] || 0) + o.n; }
}
const ok = results.filter((r) => !r.error);
const tot = (k) => ok.reduce((s, r) => s + r[k], 0);
const doc = {
  floors: FLOORS, viewport: '390x844', changed,
  totals: { screens: results.length, screensFailing: ok.filter((r) => r.fails).length, errors: results.length - ok.length, small: tot('small'), contrast: tot('contrast'), contrastPrimary: tot('contrastPrimary'), taps: tot('taps') },
  byFeature,
  topSmallTextSelectors: Object.entries(offenders).sort((a, b) => b[1] - a[1]).slice(0, 40).map(([selector, n]) => ({ selector, n })),
  tokensUnderFloor: [...tokenMap.values()].sort((a, b) => b.usedBy - a.usedBy),
  screens: results,
};
if (!only && !flag('--no-write')) { fs.mkdirSync(path.join(root, 'review'), { recursive: true }); fs.writeFileSync(path.join(root, 'review/legibility.json'), JSON.stringify(doc, null, 1) + '\n'); }

const t = doc.totals;
console.log('legibility: ' + t.screens + ' screens, ' + t.screensFailing + ' fail (text <' + FLOORS.minText + 'px: ' + t.small + ' nodes, contrast <' + FLOORS.contrast + ': ' + t.contrast + ', 16px+ text <' + FLOORS.contrastPrimary + ': ' + t.contrastPrimary + ', targets <' + FLOORS.tap + 'px: ' + t.taps + ')' + (t.errors ? ', ' + t.errors + ' could not render' : ''));
const show = changed.length ? ok.filter((r) => changed.includes(r.id) && r.fails) : ok.filter((r) => r.fails).sort((a, b) => b.small + b.taps + b.contrast - (a.small + a.taps + a.contrast)).slice(0, 8);
for (const r of show) {
  console.log('  ' + r.id + ': ' + r.small + ' small, ' + (r.contrast + r.contrastPrimary) + ' contrast, ' + r.taps + ' targets');
  if (changed.length) {
    for (const o of r.smallText.slice(0, 6)) console.log('      ' + o.px + 'px  ' + o.sel + '  "' + o.text + '"');
    for (const o of [...r.lowContrast, ...r.lowContrastPrimary].slice(0, 6)) console.log('      ' + o.ratio + ':1  ' + o.sel + '  "' + o.text + '"');
    for (const o of r.smallTargets.slice(0, 6)) console.log('      ' + o.size + '  ' + o.sel + '  "' + o.text + '"');
  }
}
for (const r of results.filter((r) => r.error)) console.log('  ' + r.id + ': could not render (' + r.error + ')');
const gateStrict = /^Legibility gate: *strict/mi.test(fs.existsSync(path.join(root, 'docs/design-workflow/README.md')) ? fs.readFileSync(path.join(root, 'docs/design-workflow/README.md'), 'utf8') : '');
const compare = val('--compare');
let blocked = [];
if (changed.length && !gateStrict && !flag('--strict')) {
  if (!compare) { console.error('--changed needs --compare <base url> while the gate is no-regression (docs/design-workflow/README.md); or pass --strict'); process.exit(2); }
  const baseUrl = compare.replace(/[/]$/, '');
  const baseIds = new Set(); try { const ba = await (await fetch(baseUrl + '/atlas/atlas.json')).json(); for (const p of ba.platforms) for (const sc of p.sections) for (const f of sc.features || []) for (const x of f.screens || []) baseIds.add(x.id); } catch (e) { console.warn('warning: could not read the base atlas: ' + e.message); }
  const b2 = await chromium.launch();
  const CATS = [['small', 'smallText', 'text under 13px'], ['contrast', 'lowContrast', 'low contrast'], ['taps', 'smallTargets', 'target under 48px']];
  for (const r of results.filter((x) => changed.includes(x.id))) {
    if (r.error) { blocked.push(r); continue; }
    const sc = screens.find((x) => x.id === r.id); const why = [];
    let bs = { small: 0, contrast: 0, taps: 0, smallText: [], lowContrast: [], smallTargets: [] };
    if (baseIds.has(r.id)) {
      const u = new URL(baseUrl + sc.url); u.searchParams.set('screen', r.id);
      try { const { audit } = await auditUrl(b2, u.toString(), true); bs = { small: count(audit.small), contrast: count(audit.c45) + count(audit.c7), taps: count(audit.taps), smallText: audit.small, lowContrast: [...audit.c45, ...audit.c7], smallTargets: audit.taps }; }
      catch (e) { console.warn('warning: base render of ' + r.id + ' failed: ' + e.message.split('\n')[0]); }
    } else why.push('new screen: no baseline');
    const cand = { small: r.small, contrast: r.contrast + r.contrastPrimary, taps: r.taps };
    for (const [k, arr, label] of CATS) {
      const mine = k === 'contrast' ? [...r.lowContrast, ...r.lowContrastPrimary] : r[arr];
      const had = new Set(bs[arr].map((o) => o.sel));
      if (cand[k] > bs[k]) why.push(label + ': ' + bs[k] + ' -> ' + cand[k]);
      const fresh = [...new Set(mine.filter((o) => !had.has(o.sel)).map((o) => o.sel))];
      if (fresh.length) why.push('new ' + label + ' on ' + fresh.slice(0, 4).join(', '));
    }
    console.log('  compare ' + r.id + ': ' + (why.length ? 'WORSE (' + why.join('; ') + ')' : 'no worse than base (small ' + bs.small + '->' + cand.small + ', contrast ' + bs.contrast + '->' + cand.contrast + ', targets ' + bs.taps + '->' + cand.taps + ')'));
    if (why.length) blocked.push(r);
  }
  await b2.close();
} else blocked = results.filter((r) => changed.includes(r.id) && (r.fails || r.error));
if (blocked.length) { console.error('\nblocked: ' + blocked.length + ' changed screen(s) ' + (gateStrict || flag('--strict') ? 'break the farm legibility law' : 'got worse than the base') + ': ' + blocked.map((r) => r.id).join(', ')); process.exit(1); }
if (flag('--strict') && (t.screensFailing || t.errors)) { console.error('\nstrict: screens fail the farm legibility law'); process.exit(1); }
process.exit(0);
