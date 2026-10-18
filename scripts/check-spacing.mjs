// The spacing check: only what is clearly wrong, never "off by a few pixels". Four defects, each with a tolerance:
//   inversion  a block sits closer to a list than the list's own rows sit to each other, so it reads as part of the list
//              (gap < 60% of the list's row rhythm, rhythm at least 20px)
//   crowding   two different boxed blocks (a surface or border each) less than 8px apart, one above the other, nothing between
//   double     two horizontal edges (hairline, border, box edge) within 6px of each other: two lines doing one job
//   scrollbar  a scroll container whose desktop scrollbar shows (it takes width when the content overflows, and the content jumps)
// Renders every atlas screen bare at 390 x 844 and audits the first screen. Writes review/spacing.json.
// Usage: node scripts/check-spacing.mjs [--base <url>] [--feature <id>] [--screens id,id] [--changed <ids>] [--strict] [--out <file.json>]
//   --changed  exit 1 only when one of these screens has a defect; --strict: exit 1 on any defect.
// Principle: P4 (judge it by eye) made measurable; rules ledger L16. Spacing law: ux/design-system/README.md, "Spacing".
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { playwright } from './playwright-path.mjs';
import { screensOf } from './atlas-screens.mjs';
import { routeFonts } from './font-route.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const val = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null; };
const list = (n) => (val(n) || '').split(',').map((s) => s.trim()).filter(Boolean);
export const TOL = { inversion: 0.6, rhythmMin: 20, crowd: 8, double: 6 };

/* ---------- runs inside every frame ---------- */
function auditFrame(TOL) {
  const W = innerWidth, H = innerHeight, out = [];
  const vis = (el) => { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < H; };
  const name = (el) => (el.dataset?.ds ? `${el.dataset.ds}` : el.tagName.toLowerCase()) + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '');
  const lines = (el) => { const rs = []; const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { if (!n.textContent.trim() || !vis(n.parentElement)) continue; const rg = document.createRange(); rg.selectNodeContents(n); for (const r of rg.getClientRects()) if (r.width && r.height) rs.push(r); } return rs; };
  const ink = (el) => { const ls = lines(el); const r = el.getBoundingClientRect(); return ls.length ? { top: Math.min(...ls.map((l) => l.top)), bottom: Math.max(...ls.map((l) => l.bottom)) } : { top: r.top, bottom: r.bottom }; };
  const clear = (c) => !c || /rgba\(0, 0, 0, 0\)|transparent/.test(c);
  const backdrop = (el) => { for (let e = el.parentElement; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (!clear(c)) return c; } return 'rgb(255, 255, 255)'; };
  // a surface only when it differs from what is behind it: a white row on a white sheet is not a separate box
  const painted = (el) => { const cs = getComputedStyle(el); const bg = cs.backgroundColor; const hasBg = !clear(bg) && bg !== backdrop(el); const hasBorder = ['Top', 'Bottom', 'Left', 'Right'].some((s) => parseFloat(cs[`border${s}Width`]) > 0 && !/rgba\(0, 0, 0, 0\)/.test(cs[`border${s}Color`])); return hasBg || hasBorder; };
  // Audit what the worker sees on top: an open sheet or dialog alone, else the page. Fixed and sticky chrome (status bar,
  // app bar, dock, footer) is placed by design and is not judged here.
  const tops = [...document.querySelectorAll('[role="dialog"], .sheet, [data-ds="Sheet"], [data-st-context="drawer"]')].filter((el) => vis(el) && el.getBoundingClientRect().height > H * 0.3);
  const scope = tops.length ? tops[tops.length - 1] : document.body;
  const pinned = (el) => { for (let e = el; e && e !== scope; e = e.parentElement) { const p = getComputedStyle(e).position; if (p === 'fixed' || p === 'sticky') return true; if (/^(HEADER|FOOTER|NAV)$/.test(e.tagName) || /(^|[-_\s])(footer|dock|statusbar|appbar)/i.test(typeof e.className === 'string' ? e.className : '')) return true; } return false; };
  const interactive = (el) => el.matches('button, a, input, select, textarea, [role="tab"], [role="radio"], [role="button"]') || !!el.querySelector('button, a, input, select, textarea, [role="tab"], [role="radio"], [role="button"]');
  const surfaceOf = (el) => { for (let e = el.parentElement; e && e !== scope; e = e.parentElement) if (painted(e)) return e; return null; };
  const all = [...scope.querySelectorAll('*')].filter((el) => !['SCRIPT', 'STYLE', 'IFRAME', 'svg', 'path'].includes(el.tagName) && vis(el) && !pinned(el));

  // inversion: a list of 3+ like siblings stacked vertically, and the block right above it
  const seen = new Set();
  for (const parent of new Set(all.map((e) => e.parentElement))) {
    if (!parent) continue;
    const kids = [...parent.children].filter((k) => all.includes(k));
    const groups = {};
    for (const k of kids) (groups[name(k)] = groups[name(k)] || []).push(k);
    for (const g of Object.values(groups)) {
      if (g.length < 3) continue;
      const rs = g.map((k) => k.getBoundingClientRect());
      if (!rs.every((r, i) => i === 0 || r.top >= rs[i - 1].bottom - 1)) continue; // a vertical list, not a row of chips
      const gaps = g.slice(1).map((k, i) => ink(k).top - ink(g[i]).bottom).sort((a, b) => a - b);
      const rhythm = gaps[Math.floor(gaps.length / 2)];
      if (rhythm < TOL.rhythmMin) continue;
      // the block above: the first list item's previous visible sibling, else the parent's (two levels up)
      let above = null, node = g[0];
      for (let lvl = 0; lvl < 3 && node && !above; lvl++) { let p = node.previousElementSibling; while (p && !all.includes(p)) p = p.previousElementSibling; if (p) above = p; else node = node.parentElement; }
      // a heading, label or note above its own list belongs to it: only a control or a boxed block close to a list is wrong
      if (!above || seen.has(above) || !(interactive(above) || painted(above))) continue;
      const a = above.getBoundingClientRect(); if (a.bottom > rs[0].top + 1 || a.height < 8) continue;
      const gap = ink(g[0]).top - a.bottom;
      const firstTop = rs[0].top, csFirst = getComputedStyle(g[0]);
      const ruled = parseFloat(csFirst.borderTopWidth) > 0 || parseFloat(getComputedStyle(above).borderBottomWidth) > 0 || all.some((e) => { const r = e.getBoundingClientRect(); return r.height <= 2 && r.width > W * 0.5 && r.top >= a.bottom - 1 && r.bottom <= firstTop + 1; });
      if (!ruled && gap < rhythm * TOL.inversion) { seen.add(above); out.push({ check: 'inversion', at: Math.round(a.bottom), detail: `${name(above)} is ${Math.round(gap)}px from the list of ${g.length} ${name(g[0])} whose rows are ${Math.round(rhythm)}px apart: it reads as part of the list` }); }
    }
  }
  // crowding: two different painted boxes, one above the other, under 8px apart
  const boxes = all.filter(painted).map((el) => ({ el, r: el.getBoundingClientRect() })).filter((b) => b.r.width > W * 0.3 && b.r.height >= 24 && b.r.height < H * 0.6);
  for (const a of boxes) for (const b of boxes) {
    // rows inside one card touch by design: only separate surfaces can crowd each other
    if (a === b || a.el.contains(b.el) || b.el.contains(a.el) || name(a.el) === name(b.el) || (surfaceOf(a.el) && surfaceOf(a.el) === surfaceOf(b.el))) continue;
    const overlap = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
    const gap = b.r.top - a.r.bottom;
    const ruled = parseFloat(getComputedStyle(a.el).borderBottomWidth) > 0 || parseFloat(getComputedStyle(b.el).borderTopWidth) > 0;
    if (!ruled && overlap > Math.min(a.r.width, b.r.width) * 0.5 && gap >= 0 && gap < TOL.crowd) out.push({ check: 'crowding', at: Math.round(a.r.bottom), detail: `${name(a.el)} and ${name(b.el)} are ${Math.round(gap)}px apart with nothing between` });
  }
  // double: horizontal edges within 6px of each other
  const edges = [];
  for (const el of all) {
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    if (r.width < W * 0.5) continue;
    for (const [side, y] of [['Top', r.top], ['Bottom', r.bottom]]) if (parseFloat(cs[`border${side}Width`]) > 0 && !/rgba\(0, 0, 0, 0\)/.test(cs[`border${side}Color`])) edges.push({ y, el, l: r.left, rr: r.right });
    if (el.tagName === 'HR' || (r.height <= 2 && painted(el))) edges.push({ y: r.top, el, l: r.left, rr: r.right });
    if (painted(el) && r.height >= 24 && r.height < H * 0.6) { edges.push({ y: r.top, el, l: r.left, rr: r.right, box: true }); }
  }
  for (const a of edges) for (const b of edges) {
    if (a.el === b.el || a.y >= b.y || a.el.contains(b.el) || b.el.contains(a.el) || (a.box && b.box)) continue;
    const overlap = Math.min(a.rr, b.rr) - Math.max(a.l, b.l);
    if (b.y - a.y > 0.5 && b.y - a.y < TOL.double && overlap > W * 0.5) out.push({ check: 'double', at: Math.round(a.y), detail: `${name(a.el)} and ${name(b.el)} draw edges ${Math.round(b.y - a.y)}px apart` });
  }
  // scrollbar: a scroll container whose desktop scrollbar shows (scrollbar-width not none, no hidden ::-webkit-scrollbar) takes its
  // width once the content overflows, and the content jumps sideways (#197, in the atlas on a desktop). Headless shots hide
  // scrollbars, so no pixel pair shows it: it is read from the styles. The page's own root scrolls under the phone frame, not in it.
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    const y = cs.overflowY === 'scroll' || (cs.overflowY === 'auto' && el.scrollHeight > el.clientHeight + 1);
    const x = cs.overflowX === 'scroll' || (cs.overflowX === 'auto' && el.scrollWidth > el.clientWidth + 1);
    if (!(y || x) || cs.scrollbarWidth === 'none' || !vis(el)) continue;
    let hidden = false;
    try { const ps = getComputedStyle(el, '::-webkit-scrollbar'); hidden = ps.display === 'none' || parseFloat(ps.width) === 0 || parseFloat(ps.height) === 0; } catch {}
    if (!hidden) out.push({ check: 'scrollbar', at: Math.round(el.getBoundingClientRect().top), detail: `${name(el)} scrolls with a visible desktop scrollbar (scrollbar-width: ${cs.scrollbarWidth}): it takes its width once the content overflows and the content jumps sideways; hide it (scrollbar-width: none)` });
  }

  // one finding per check and place
  const key = new Set(); return out.filter((o) => { const k = o.check + '|' + Math.round(o.at / 10); if (key.has(k)) return false; key.add(k); return true; });
}

// Every frame of a prepared page (the gate's shared visit, or the CLI's own): the defects, deduplicated per frame as above.
export async function auditSpacingPage(page) {
  const defects = [];
  for (const f of page.frames()) { try { defects.push(...await f.evaluate(auditFrame, TOL)); } catch {} }
  return defects;
}

const main = process.argv[1] && path.resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();
if (main) {
const free = () => new Promise((res) => { const s = createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => res(p)); }); });
let base = val('--base'), server = null;
if (!base) { const port = await free(); server = spawn(process.execPath, ['scripts/serve-ux.cjs', String(port)], { cwd: root, stdio: 'ignore' }); base = `http://localhost:${port}`; await new Promise((r) => setTimeout(r, 1500)); }
const atlas = JSON.parse(fs.readFileSync(path.join(root, 'atlas/atlas.json'), 'utf8'));
let todo = screensOf(atlas).filter((s) => s.url);
if (val('--feature')) todo = todo.filter((s) => s.feature === val('--feature'));
const only = [...list('--screens'), ...list('--changed')];
if (only.length) todo = todo.filter((s) => only.includes(s.id));
const { chromium } = playwright();
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await routeFonts(context, root);
const results = [];
for (const s of todo) {
  const page = await context.newPage();
  await page.clock.install({ time: new Date('2026-10-11T09:41:00') }); await page.clock.resume();
  const u = new URL(base + s.url); u.searchParams.set('screen', s.id);
  const res = { screen: s.id, feature: s.feature, defects: [] };
  try {
    await page.goto(u.href); await page.waitForSelector('html.atlas-ready', { timeout: 15000 }); await page.waitForTimeout(400);
    res.defects.push(...await auditSpacingPage(page));
  } catch (e) { res.error = e.message.split('\n')[0]; }
  await page.close();
  results.push(res);
  if (res.defects.length || res.error) console.log(`${res.error ? 'ERR ' : 'SPACE'} ${s.id}${res.error ? ' ' + res.error : ''}`), res.defects.forEach((d) => console.log(`      ${d.check.padEnd(9)} ${d.detail}`));
}
await browser.close(); if (server) server.kill();
if (!only.length && !val('--feature')) fs.writeFileSync(path.join(root, 'review/spacing.json'), JSON.stringify({ tolerances: TOL, screens: results }, null, 1));
if (val('--out')) fs.writeFileSync(val('--out'), JSON.stringify(results));
const bad = results.filter((r) => r.defects.length);
console.log(`spacing: ${results.length} screens, ${bad.length} with a clear defect (inversion ${bad.flatMap((r) => r.defects).filter((d) => d.check === 'inversion').length}, crowding ${bad.flatMap((r) => r.defects).filter((d) => d.check === 'crowding').length}, double ${bad.flatMap((r) => r.defects).filter((d) => d.check === 'double').length}, scrollbar ${bad.flatMap((r) => r.defects).filter((d) => d.check === 'scrollbar').length})`);
const failing = list('--changed').length ? bad.filter((r) => list('--changed').includes(r.screen)) : argv.includes('--strict') ? bad : [];
process.exit(failing.length ? 1 : 0);
}
