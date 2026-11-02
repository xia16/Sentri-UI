// The colour family check: every colour a screen draws is a token, and the status colours keep their roles. Rendered bare at 390 x 844.
// Usage: node scripts/check-colours.mjs [--base <url>] [--feature <id>] [--changed <screen ids> [--compare <base url>]] [--self-test]
//   --base      an already-running server (default: this script serves the repo itself)
//   --feature   only the screens of one feature (does not write review/colours.json)
//   --changed   the screen ids a PR touches (comma or space separated); the exit code is 1 only when one of them is worse
//   --compare   with --changed: the base server. A changed screen fails only on a stray colour or a role defect the same screen at the base
//               doesn't have; a new screen only on a stray colour no stylesheet under ux/ on origin/main holds (--base-ref picks another ref).
// Writes review/colours.json. The convention: the owner, 2026-11-02 (one hue per status, size picks the shade); the tokens:
// ux/design-system/tokens.json. Three checks, the first two here, the third in tests/status-palette.test.mjs:
//   1. token colours only: a colour more than ΔE 2 (OKLab x100) from every token is a stray colour
//   2. role rules: red only where it means act now, one red signal per row, no green button fill but the counting "+ Born alive" key,
//      and the status parts (bars, Schedule cells, count discs, legend dots) drawn in the status set
//   3. the status palette itself: colour-blind separation of the marks, and each fill with its ink
import { playwright } from './playwright-path.mjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.cjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.md': 'text/plain' };

/* ---------- colour math (OKLab, WCAG contrast, CVD simulation) ---------- */
// Ported from the dataviz skill's validate_palette.js. Its CVD model is Machado, Oliveira & Fernandes (2009) at severity 1.0: the
// ΔE 8 separation target is calibrated to that model, so it is kept rather than swapped for Brettel/Viénot.
const MACHADO = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
  tritan: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
};
const s2lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
// '#rgb', '#rgba', '#rrggbb', '#rrggbbaa' -> [r, g, b, a]: rgb 0..255, alpha 0..1
export const parseHex = (h) => {
  h = h.trim().replace(/^#/, '');
  if (h.length <= 4) h = [...h].map((c) => c + c).join('');
  const v = [0, 2, 4, 6].map((i) => parseInt(h.slice(i, i + 2), 16));
  return [v[0], v[1], v[2], h.length >= 8 ? v[3] / 255 : 1];
};
export const toHex = ([r, g, b, a = 1]) => '#' + [r, g, b, ...(a < 0.995 ? [a * 255] : [])].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const linOf = (c) => (typeof c === 'string' ? parseHex(c) : c).slice(0, 3).map((v) => s2lin(v / 255));
function oklabFromLin([r, g, b]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
}
export const oklab = (c) => oklabFromLin(linOf(c));
export const simulate = (c, kind) => { const x = linOf(c), M = MACHADO[kind]; return M.map((row) => Math.max(0, Math.min(1, row[0] * x[0] + row[1] * x[1] + row[2] * x[2]))); };
// Euclidean distance in OKLab, x100; `kind` (protan, deutan, tritan) compares the two as that reader sees them
export const deltaE = (c1, c2, kind) => {
  const a = oklabFromLin(kind ? simulate(c1, kind) : linOf(c1)), b = oklabFromLin(kind ? simulate(c2, kind) : linOf(c2));
  return 100 * Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
};
const relLum = (c) => { const [r, g, b] = linOf(c); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contrast = (a, b) => { const [hi, lo] = [relLum(a), relLum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
const over = (top, under) => [0, 1, 2].map((i) => top[i] * top[3] + under[i] * (1 - top[3]));

/* ---------- the palette ---------- */
// The status convention (owner, 2026-11-02). Each status keeps one hue; size picks the shade: words dark, anything holding a number a
// light fill with the number in the same hue's dark ink, bars, day segments and dots a clean mid tone. The values the convention adds
// are listed here until tokens.json carries them; a token with the same value replaces the name given here.
export const STATUS = {
  done: { fill: '#d5e8cc', ink: '#1d4d2e', mark: '#5fae6e' },
  progress: { fill: '#c1ddfd', ink: '#1f4470', mark: '#6f9fdc' },  // progress-fill, progress-fill-ink
  late: { fill: '#fede82', ink: '#5c3f00', mark: '#e8b33c' },      // amber-fill, amber-fill-ink
  waiting: { track: '#dce0d4' },                                   // handle: the empty track, or an outline
  actNow: { word: '#98362b', ink: '#85291f', fill: '#fff1ee' },    // red, red-ink, red-wash
  button: { fill: '#258048', label: '#ffffff' },                   // the one green button: the counting "+ Born alive" key
};
const CONVENTION = [
  ['done-fill', STATUS.done.fill], ['done-ink', STATUS.done.ink], ['done-mark', STATUS.done.mark],
  ['progress-mark', STATUS.progress.mark], ['amber-mark', STATUS.late.mark], ['done-button', STATUS.button.fill],
];
const NEUTRAL = ['paper', 'app-background', 'ground', 'surface', 'inset', 'ink', 'muted', 'line', 'rule', 'control-border', 'button-border', 'handle'];
const GREEN = ['green', 'green-wash', 'count-key', 'chip-green-border', 'count-surface', 'count-ink'];

// tokens.json's colours and shadow colours, plus the convention's: [{ name, hex, c: [r,g,b,a], lab }]
export function loadPalette(tokensJson) {
  const t = typeof tokensJson === 'string' ? JSON.parse(tokensJson) : tokensJson;
  const out = [], seen = new Set();
  const add = (name, hex) => { const c = parseHex(hex), key = toHex(c); if (seen.has(name)) return; seen.add(name); out.push({ name, hex: key, c, lab: oklab(c) }); };
  for (const x of t.color?.tokens || []) if (/^#[0-9a-f]{3,8}$/i.test(x.value)) add(x.name, x.value);
  for (const x of t.shadow?.tokens || []) for (const [i, m] of [...String(x.value).matchAll(/#[0-9a-f]{3,8}\b/gi)].entries()) add(x.name + (i ? '-' + i : ''), m[0]);
  for (const [name, hex] of CONVENTION) if (!out.some((p) => p.hex === toHex(parseHex(hex)))) add(name, hex);
  return out;
}
const defaultPalette = () => loadPalette(fs.readFileSync(path.join(root, 'ux/design-system/tokens.json'), 'utf8'));

// The roles, as sets of values (a token and its aliases share a value, so a rename never loosens a rule)
function rolesOf(palette) {
  const val = (names) => new Set(palette.filter((p) => names.includes(p.name)).map((p) => p.hex));
  const hexes = (list) => new Set(list.map((h) => toHex(parseHex(h))));
  const red = new Set([...val(['red', 'red-ink']), ...hexes([STATUS.actNow.word, STATUS.actNow.ink])]);
  const done = hexes([STATUS.done.fill, STATUS.done.ink, STATUS.done.mark, STATUS.button.fill]);
  const green = new Set([...val(GREEN), ...done]);
  const statusSet = new Set([...hexes([STATUS.done.fill, STATUS.done.ink, STATUS.done.mark, STATUS.progress.fill, STATUS.progress.ink, STATUS.progress.mark, STATUS.late.fill, STATUS.late.ink, STATUS.late.mark, STATUS.waiting.track, STATUS.actNow.word, STATUS.actNow.ink, STATUS.actNow.fill]), ...val(NEUTRAL)]);
  return { red, green, statusSet };
}

/* ---------- runs inside the page (every frame) ---------- */
// The status parts: a part a new screen draws is one of these classes or carries data-status-part.
export const PARTS = {
  bar: '[data-status-part=bar], [role=progressbar], .tk-progress, [class*=progress-bar], [class*=-segs], .task-perf-bar, .task-status-bar, .mk-bar, .hc-progress, .tc-progress',
  cell: '[data-status-part=cell], .st-week-cell, [class*=week-cell]',
  disc: '[data-status-part=disc], [class*=count-disc], [class*=status-disc]',
  dot: '[data-status-part=dot], [class*=legend] [class*=dot], [class*=legend-dot], [class*=status-dot], .task-dot, .tk-progress-counts [class*=dot]',
};
// Where red may stand: an act-now state word with its "!", a danger chip, a destructive hold or button, a field error. Read from the
// classes, data-* values and roles of the element and its near ancestors.
export const RED_OK = 'danger|error|invalid|destructive|delete|remove|alert|act|overdue|died|death|dead|hold|end|stop|hospital|critical|red';
const BUTTON = 'button, [role=button], a.button, .button, input[type=button], input[type=submit]';
const ROW = '[data-ds=Row], .st-row, li, tr, [role=row], [class~=row], [class$=-row]';
const PLUS_KEY = '.count-key[data-tone=plus]';

function collectInPage(cfg) {
  const W = innerWidth;
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  const memo = new Map();
  const parse = (c) => { // -> [r,g,b,a]: rgb 0..255, alpha 0..1 (any CSS colour, via the canvas for the ones not written as rgb())
    if (memo.has(c)) return memo.get(c);
    let out; const m = c.match(/^rgba?\(([^)]*)\)$/);
    if (m) { const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat); out = [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
    else { cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; out = [d[0], d[1], d[2], Math.round(d[3] / 255 * 1000) / 1000]; }
    memo.set(c, out); return out;
  };
  const cs = (e, p) => getComputedStyle(e, p);
  const sel = (e) => { const cls = (typeof e.className === 'string' ? e.className : e.className?.baseVal || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((c) => '.' + c).join(''); return e.tagName.toLowerCase() + cls + (e.getAttribute('data-action') ? '[data-action=' + e.getAttribute('data-action') + ']' : '') + (e.getAttribute('data-tone') ? '[data-tone=' + e.getAttribute('data-tone') + ']' : ''); };
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TITLE', 'HEAD', 'META', 'LINK', 'OPTION', 'TEMPLATE', 'BR']);
  const SHAPES = new Set(['path', 'circle', 'rect', 'ellipse', 'line', 'polyline', 'polygon', 'text', 'tspan', 'use']);
  const redOk = new RegExp('(^|[^a-z])(' + cfg.redOk + ')([^a-z]|$)', 'i');
  const vhidden = (el) => { // read by a screen reader, not drawn
    for (let e = el, i = 0; e && e.nodeType === 1 && i < 3; e = e.parentElement, i++) { const r = e.getBoundingClientRect(), s = cs(e); if (r.width <= 1 || r.height <= 1 || /rect\(0(px)?,? ?0(px)?,? ?0(px)?,? ?0(px)?\)|inset\(50%\)/.test(s.clip + ' ' + s.clipPath)) return true; }
    return false;
  };
  const visible = new Map();
  const shown = (el) => {
    if (visible.has(el)) return visible.get(el);
    let v = true;
    const s = cs(el);
    if (s.display === 'none' || s.visibility === 'hidden' || s.visibility === 'collapse' || parseFloat(s.opacity) === 0 || el.hasAttribute('hidden') || el.hasAttribute('inert')) v = false;
    else if (el.parentElement && el.parentElement !== document.documentElement) v = shown(el.parentElement);
    visible.set(el, v); return v;
  };
  const clipped = (el, r) => {
    if (r.right <= 0 || r.left >= W || r.bottom <= -scrollY) return true; // off the page sideways or above it
    for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) {
      const s = cs(e);
      if (/hidden|clip/.test(s.overflowX + s.overflowY)) { const b = e.getBoundingClientRect(); if (r.right <= b.left || r.left >= b.right || r.bottom <= b.top || r.top >= b.bottom) return true; }
    }
    return false;
  };
  const ctxOf = (el) => { // the words red may stand on: classes, data-* values, roles, an invalid field
    const words = [];
    for (let e = el, i = 0; e && e.nodeType === 1 && i < 5; e = e.parentElement, i++) {
      words.push(typeof e.className === 'string' ? e.className : e.className?.baseVal || '');
      for (const a of e.attributes) if (a.name.startsWith('data-') || a.name === 'role') words.push(a.value);
      if (e.getAttribute('aria-invalid') === 'true') words.push('invalid');
    }
    return words.join(' ');
  };
  const backdrop = (el) => { // the opaque colour under el: the nearest ancestor background that is opaque, composited over white
    const layers = [];
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const c = parse(cs(e).backgroundColor); if (c[3] > 0) layers.push(c); if (c[3] >= 0.99) break; }
    let cur = [255, 255, 255];
    for (let i = layers.length - 1; i >= 0; i--) { const l = layers[i]; cur = [0, 1, 2].map((k) => l[k] * l[3] + cur[k] * (1 - l[3])); }
    return cur.map(Math.round);
  };
  const rowIds = window.__colourRows || (window.__colourRows = new WeakMap());
  let rowN = window.__colourRowN || 0;
  const out = new Map();
  const push = (el, host, prop, colour, extra = {}) => {
    const c = parse(colour);
    if (!(c[3] > 0.01)) return;
    const rec = { sel: sel(host), prop, c: c.map((v, i) => (i < 3 ? Math.round(v) : Math.round(v * 1000) / 1000)) };
    if (c[3] < 0.99) rec.bd = backdrop(prop === 'background-color' || prop === 'box-shadow' ? host.parentElement || host : host);
    for (const [name, q] of Object.entries(cfg.parts)) if (host.closest(q)) { rec.part = name; break; }
    if (host.closest(cfg.button) === host && prop === 'background-color') { rec.button = true; if (host.matches(cfg.plusKey)) rec.plus = true; }
    if (redOk.test(ctxOf(host))) rec.redOk = true;
    Object.assign(rec, extra);
    const k = JSON.stringify(rec);
    const f = out.get(k); if (f) f.n++; else out.set(k, { ...rec, n: 1 });
  };
  const ownText = (el) => { let t = ''; for (const n of el.childNodes) if (n.nodeType === 3) t += n.nodeValue; if (!t.trim() && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' && /^(text|search|number|tel|email|url|password|)$/.test(el.type))) t = el.value || el.placeholder || ''; return t.trim().replace(/\s+/g, ' '); };
  const boxColours = (el, s, pseudo) => {
    const host = el;
    const bg = s.backgroundColor; if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') push(el, host, 'background-color', bg, pseudo ? { pseudo } : {});
    for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
      if (parseFloat(s['border' + side + 'Width']) > 0 && !/none|hidden/.test(s['border' + side + 'Style'])) push(el, host, 'border-color', s['border' + side + 'Color'], pseudo ? { pseudo } : {});
    }
    if (s.boxShadow && s.boxShadow !== 'none') for (const m of s.boxShadow.match(/rgba?\([^)]*\)|#[0-9a-f]{3,8}\b/gi) || []) push(el, host, 'box-shadow', m, pseudo ? { pseudo } : {});
  };

  for (const el of document.body.querySelectorAll('*')) {
    if (SKIP.has(el.tagName) || el.closest('.statusbar, [data-statusbar]')) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 && r.height < 1) continue;
    if (!shown(el) || clipped(el, r)) continue;
    const s = cs(el);
    if (el instanceof SVGElement) {
      if (!SHAPES.has(el.tagName.toLowerCase())) continue;
      if (s.fill && s.fill !== 'none' && !/^url/.test(s.fill) && parseFloat(s.fillOpacity) > 0) push(el, el, 'fill', s.fill);
      if (s.stroke && s.stroke !== 'none' && !/^url/.test(s.stroke) && parseFloat(s.strokeWidth) > 0 && parseFloat(s.strokeOpacity) > 0) push(el, el, 'stroke', s.stroke);
      continue;
    }
    boxColours(el, s, null);
    const text = ownText(el);
    if (text && parseFloat(s.fontSize) > 0 && !vhidden(el)) {
      let row = el.closest(cfg.row);
      let id = -1;
      if (row) { if (!rowIds.has(row)) rowIds.set(row, ++rowN); id = rowIds.get(row); }
      push(el, el, 'color', s.color, { text: text.slice(0, 24), ...(id >= 0 ? { row: id } : {}), ...(/^[\d\s.,:%/+−-]+$/.test(text) ? { figure: true } : {}) });
    }
    for (const p of ['::before', '::after']) {
      const ps = cs(el, p);
      if (ps.content === 'none' || ps.content === 'normal' || ps.display === 'none' || ps.visibility === 'hidden' || parseFloat(ps.opacity) === 0) continue;
      boxColours(el, ps, p);
      const t = ps.content.replace(/^["']|["']$/g, '');
      if (t.trim() && !/^(counter|attr|url)\(/.test(t)) push(el, el, 'color', ps.color, { pseudo: p, text: t.slice(0, 24) });
    }
  }
  window.__colourRowN = rowN;
  return [...out.values()];
}

// Every frame of a prepared page (the gate's shared visit at 390 EN, or the CLI's own). It doesn't scroll: what is below the fold of a
// scroll area is in the DOM and counts, and a sheet that is closed is hidden or clipped. Returns { recs } (raw, mapped later).
export async function auditColourPage(page) {
  const recs = [];
  const cfg = { parts: PARTS, button: BUTTON, row: ROW, plusKey: PLUS_KEY, redOk: RED_OK };
  for (const [i, fr] of page.frames().entries()) {
    try {
      if (!(await fr.evaluate(() => innerWidth > 0 && innerHeight > 0))) continue;
      for (const r of await fr.evaluate(collectInPage, cfg)) recs.push(i ? { ...r, ...(r.row !== undefined ? { row: i + ':' + r.row } : {}) } : r);
    } catch (e) { /* detached frame */ }
  }
  return { recs };
}

/* ---------- mapping and the rules (Node) ---------- */
export const STRAY = 2;  // ΔE (OKLab x100) past which a colour is no token
const SAME = 1;          // a stray at base within ΔE 1 (and alpha 0.03) is the same stray

// the token a rendered colour is: { token, de } or { stray: hex }
export function nearest(c, palette, bd) {
  let best = null;
  const tryOn = (rgb, a, set) => { for (const p of set) { if (Math.abs(p.c[3] - a) > 0.03) continue; const d = deltaE(rgb, p.c); if (!best || d < best.de) best = { token: p.name, hex: p.hex, de: d }; } };
  tryOn(c, c[3], palette);
  if (best && best.de <= STRAY) return best;
  if (c[3] < 0.99) { const flat = over(c, bd || [255, 255, 255]); const was = best; best = null; tryOn(flat, 1, palette); if (best && best.de <= STRAY) return { ...best, over: true }; if (!was || (best && best.de < was.de)) { best = best || was; } else best = was; }
  return { stray: toHex(c), de: best ? best.de : 99, near: best?.token };
}

// one screen's audit -> { strays: [{ hex, n, on }], defects: [{ rule, sel, detail }], colours: n }
export function classify(audit, palette = defaultPalette()) {
  const roles = rolesOf(palette);
  const strays = new Map(), defects = [], rows = new Map();
  for (const r of audit.recs) {
    const m = nearest(r.c, palette, r.bd);
    if (m.stray) {
      const f = strays.get(m.stray) || { hex: m.stray, c: r.c, n: 0, on: [], near: m.near, de: Math.round(m.de * 10) / 10 };
      f.n += r.n; if (f.on.length < 4 && !f.on.includes(r.sel + ' ' + r.prop)) f.on.push(r.sel + ' ' + r.prop);
      strays.set(m.stray, f); continue;
    }
    const where = r.sel + (r.pseudo || '') + ' ' + r.prop;
    if (roles.red.has(m.hex) && !r.redOk) defects.push({ rule: 'red-role', sel: where, detail: m.token + ' where nothing is act now, danger, destructive or an error' });
    if (r.button && roles.green.has(m.hex) && !r.plus) defects.push({ rule: 'green-button', sel: where, detail: m.token + ' button fill (the one green button is the counting "+ Born alive" key)' });
    if (r.part && !roles.statusSet.has(m.hex)) defects.push({ rule: 'status-part', sel: where, detail: 'a ' + r.part + ' in ' + m.token + ', not the status set' });
    if (r.prop === 'color' && r.row !== undefined && roles.red.has(m.hex) && !/^[!！]$/.test(r.text || '')) {
      const g = rows.get(r.row) || []; g.push(r); rows.set(r.row, g);
    }
  }
  for (const g of rows.values()) {
    const sels = [...new Set(g.map((r) => r.sel))];
    if (sels.length > 1) defects.push({ rule: 'red-row', sel: sels.join(' + '), detail: 'two red signals in one row (' + g.map((r) => '"' + r.text + '"').slice(0, 3).join(', ') + ')' + (g.some((r) => r.figure) ? ', one a red figure' : '') });
  }
  const seen = new Set();
  const uniq = defects.filter((d) => { const k = d.rule + ' ' + d.sel + ' ' + d.detail; if (seen.has(k)) return false; seen.add(k); return true; });
  return { strays: [...strays.values()].sort((a, b) => b.n - a.n), defects: uniq, colours: audit.recs.length };
}

// The colour literals a checkout's stylesheets hold (every .css under ux/ and <style> in its pages): what a new screen may reuse as debt.
export function stylesheetColours(files) {
  const out = new Map();
  for (const text of files) {
    for (const m of text.matchAll(/#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi)) { const c = parseHex(m[0]); out.set(toHex(c), c); }
    for (const m of text.matchAll(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)/gi)) {
      const a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
      const c = [+m[1], +m[2], +m[3], a]; out.set(toHex(c), c);
    }
  }
  return [...out.values()];
}
export function readStylesheets(dir) {
  const texts = [];
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== 'node_modules' && e.name !== 'archive') walk(f); } else if (/\.css$/.test(e.name)) texts.push(fs.readFileSync(f, 'utf8')); else if (/\.html$/.test(e.name)) texts.push(...[...fs.readFileSync(f, 'utf8').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1])); } };
  if (fs.existsSync(path.join(dir, 'ux'))) walk(path.join(dir, 'ux'));
  return texts;
}

const sameStray = (a, b) => Math.abs((a[3] ?? 1) - (b[3] ?? 1)) <= 0.03 && deltaE(a, b) <= SAME;
// A changed screen against the same screen on base: worse on a stray colour base doesn't draw there, or a role defect base doesn't have
// there. A new screen (base null) is worse on a stray no stylesheet on base holds (`known`, from stylesheetColours) and on any role defect.
export function colourWorse(base, cand, { palette = defaultPalette(), known = [] } = {}) {
  const c = classify(cand, palette), b = base ? classify(base, palette) : { strays: [], defects: [] };
  const had = base ? b.strays.map((s) => s.c) : known;
  const newStrays = c.strays.filter((s) => !had.some((h) => sameStray(s.c, h)));
  const key = (d) => d.rule + ' ' + d.sel + ' ' + d.detail;
  const was = new Set(b.defects.map(key));
  const newDefects = c.defects.filter((d) => !was.has(key(d)));
  const why = [];
  if (newStrays.length) why.push(newStrays.length + ' new stray colour(s): ' + newStrays.slice(0, 4).map((s) => s.hex + ' on ' + s.on[0] + ' (near ' + s.near + ', ΔE ' + s.de + ')').join(', '));
  for (const d of newDefects.slice(0, 4)) why.push(d.rule + ': ' + d.sel + ' — ' + d.detail);
  if (newDefects.length > 4) why.push('… ' + (newDefects.length - 4) + ' more role defect(s)');
  return { worse: why.length > 0, why, newStrays, newDefects, debt: { strays: c.strays.length - newStrays.length, defects: c.defects.length - newDefects.length }, cand: { strays: c.strays.length, defects: c.defects.length } };
}

const main = process.argv[1] && path.resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();
if (main) {
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const val = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null; };
const list = (n) => { const i = argv.indexOf(n); if (i < 0) return null; const out = []; for (let j = i + 1; j < argv.length && !argv[j].startsWith('--'); j++) out.push(...argv[j].split(',')); return out.map((s) => s.trim()).filter(Boolean); };
const { chromium } = playwright();
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
const palette = defaultPalette();

async function auditUrl(browser, url, bare) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    if (bare) await page.waitForFunction(() => !document.documentElement.classList.contains('atlas-bare') || document.documentElement.classList.contains('atlas-ready'), null, { timeout: 8000 }).catch(() => {});
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);
    return await auditColourPage(page);
  } finally { await ctx.close(); }
}
const browser = await chromium.launch();

/* --self-test: each known-bad fixture must fail the rules named in its <meta name="expect">; a good one must pass */
if (flag('--self-test')) {
  const dir = path.join(root, 'scripts/check-colours.fixtures');
  let fails = 0, n = 0;
  for (const fn of fs.readdirSync(dir).filter((f) => f.endsWith('.html')).sort()) {
    const html = fs.readFileSync(path.join(dir, fn), 'utf8');
    const expect = ((html.match(/name="expect" content="([^"]*)"/) || [])[1] || '').split(',').filter(Boolean);
    const audit = await auditUrl(browser, base + '/scripts/check-colours.fixtures/' + fn, false);
    const k = classify(audit, palette);
    const got = [...new Set([...(k.strays.length ? ['stray'] : []), ...k.defects.map((d) => d.rule)])];
    const ok = expect.length ? expect.every((e) => got.includes(e)) && got.every((g) => expect.includes(g)) : got.length === 0;
    n++; if (!ok) fails++;
    console.log((ok ? 'ok   ' : 'FAIL ') + fn + '  expected [' + (expect.join(',') || 'pass') + ']  got [' + (got.join(',') || 'pass') + ']');
    if (!ok) for (const s of k.strays.slice(0, 3)) console.log('       stray ' + s.hex + ' on ' + s.on.join(', ')), void 0;
    if (!ok) for (const d of k.defects.slice(0, 3)) console.log('       ' + d.rule + ' ' + d.sel + ' — ' + d.detail);
  }
  // and the comparison: a stray base already draws is debt, a new one is not
  const bad = await auditUrl(browser, base + '/scripts/check-colours.fixtures/bad-stray.html', false), good = await auditUrl(browser, base + '/scripts/check-colours.fixtures/good-passes.html', false);
  const cmp = [['same stray on both sides is debt', colourWorse(bad, bad, { palette }).worse === false], ['a stray base lacks is new', colourWorse(good, bad, { palette }).worse === true], ['a new screen may reuse a stylesheet stray', colourWorse(null, bad, { palette, known: classify(bad, palette).strays.map((s) => s.c) }).worse === false]];
  for (const [name, ok] of cmp) { n++; if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + 'compare: ' + name); }
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

const results = new Array(todo.length), audits = new Map();
let next = 0;
async function worker() {
  while (next < todo.length) {
    const i = next++, s = todo[i];
    const u = new URL(base + s.url); u.searchParams.set('screen', s.id);
    try { const a = await auditUrl(browser, u.toString(), true); audits.set(s.id, a); const k = classify(a, palette); results[i] = { id: s.id, feature: s.feature, strays: k.strays.map(({ c, ...x }) => x), defects: k.defects }; }
    catch (e) { results[i] = { id: s.id, feature: s.feature, error: String(e.message).split('\n')[0].slice(0, 120) }; }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
await browser.close(); if (server) server.close();

const ok = results.filter((r) => !r.error);
const strayTotals = new Map(), ruleTotals = {};
for (const r of ok) { for (const s of r.strays) { const f = strayTotals.get(s.hex) || { hex: s.hex, near: s.near, de: s.de, screens: 0, n: 0, on: s.on }; f.screens++; f.n += s.n; strayTotals.set(s.hex, f); } for (const d of r.defects) ruleTotals[d.rule] = (ruleTotals[d.rule] || 0) + 1; }
const doc = { threshold: STRAY, viewport: '390x844', changed, totals: { screens: results.length, errors: results.length - ok.length, strayColours: strayTotals.size, screensWithStrays: ok.filter((r) => r.strays.length).length, roleDefects: ruleTotals }, strays: [...strayTotals.values()].sort((a, b) => b.screens - a.screens), screens: results };
if (!only && !flag('--no-write')) { fs.mkdirSync(path.join(root, 'review'), { recursive: true }); fs.writeFileSync(path.join(root, 'review/colours.json'), JSON.stringify(doc, null, 1) + '\n'); }
const t = doc.totals;
console.log('colours: ' + t.screens + ' screens, ' + t.strayColours + ' stray colour(s) on ' + t.screensWithStrays + ' screen(s); role defects ' + (Object.entries(ruleTotals).map(([k, v]) => k + ' ' + v).join(', ') || 'none') + (t.errors ? '; ' + t.errors + ' could not render' : ''));
for (const s of doc.strays.slice(0, changed.length ? 0 : 12)) console.log('  ' + s.hex + '  ' + s.screens + ' screen(s), near ' + s.near + ' (ΔE ' + s.de + ')  e.g. ' + s.on[0]);
for (const r of results.filter((r) => r.error)) console.log('  ' + r.id + ': could not render (' + r.error + ')');

const compare = val('--compare');
if (changed.length && !compare) { console.error('--changed needs --compare <base url>: the check is no worse than base'); process.exit(2); }
const blocked = [];
if (changed.length) {
  const baseUrl = compare.replace(/[/]$/, '');
  const baseIds = new Set(); try { const ba = await (await fetch(baseUrl + '/atlas/atlas.json')).json(); for (const p of ba.platforms) for (const sc of p.sections) for (const f of sc.features || []) for (const x of f.screens || []) baseIds.add(x.id); } catch (e) { console.warn('warning: could not read the base atlas: ' + e.message); }
  // a new screen's debt: the colours the base's stylesheets hold (git, so no checkout of the base is needed)
  const ref = val('--base-ref') || 'origin/main';
  const lsTree = spawnSync('git', ['ls-tree', '-r', '--name-only', ref, 'ux'], { cwd: root, encoding: 'utf8', maxBuffer: 64 << 20 }).stdout || '';
  const texts = lsTree.split(/\r?\n/).filter((f) => /\.(css|html)$/.test(f) && !/\/archive\//.test(f)).map((f) => { const t = spawnSync('git', ['show', ref + ':' + f], { cwd: root, encoding: 'utf8', maxBuffer: 64 << 20 }).stdout || ''; return f.endsWith('.css') ? t : [...t.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n'); });
  const known = stylesheetColours(texts);
  const b2 = await chromium.launch();
  for (const r of results.filter((x) => changed.includes(x.id))) {
    if (r.error) { blocked.push(r); continue; }
    const sc = screens.find((x) => x.id === r.id);
    let ba = null;
    if (baseIds.has(r.id)) { const u = new URL(baseUrl + sc.url); u.searchParams.set('screen', r.id); try { ba = await auditUrl(b2, u.toString(), true); } catch (e) { console.warn('warning: base render of ' + r.id + ' failed: ' + e.message.split('\n')[0]); } }
    const w = colourWorse(ba, audits.get(r.id), { palette, known });
    console.log('  compare ' + r.id + ': ' + (w.worse ? 'WORSE (' + w.why.join('; ') + ')' : 'no worse than base (debt: ' + w.debt.strays + ' stray colour(s), ' + w.debt.defects + ' role defect(s))'));
    if (w.worse) blocked.push(r);
  }
  await b2.close();
}
if (blocked.length) { console.error('\nblocked: ' + blocked.length + ' changed screen(s) leave the colour family: ' + blocked.map((r) => r.id).join(', ')); process.exit(1); }
process.exit(0);
}
