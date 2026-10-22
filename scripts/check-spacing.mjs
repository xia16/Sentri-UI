// The spacing check: only what is clearly wrong, never "off by a few pixels". Seven defects, each with a tolerance:
//   inversion  a block sits closer to a list than the list's own rows sit to each other, so it reads as part of the list
//              (gap < 60% of the list's row rhythm, rhythm at least 20px)
//   crowding   two different boxed blocks (a surface or border each) less than 8px apart, one above the other, nothing between
//   double     two horizontal edges (hairline, border, box edge) within 6px of each other: two lines doing one job
//   scrollbar  a scroll container whose desktop scrollbar shows (it takes width when the content overflows, and the content jumps)
//   sideways   a scroll container that scrolls sideways (more than 1px) though its content is not a row
//   heading    a section heading (short text, no surface, border or control) closer to the block above it (a control or a boxed
//              block) than to the content it labels, so it reads as that block's tail: gap above < 8px, or gap above + 4px
//              < gap below (more than 4px nearer the block above than its content)
//   trailing   a row's trailing control (checkbox, radio, switch, chevron) off its row's centre by more than 6px, row 44px+
// A sticky block taller than half the viewport is content, not chrome, and is judged like the rest.
// Renders every atlas screen bare at 390 x 844 and audits the first screen. Writes review/spacing.json.
// Usage: node scripts/check-spacing.mjs [--base <url>] [--feature <id>] [--screens id,id] [--changed <ids>] [--strict] [--out <file.json>]
//   --changed  exit 1 only when one of these screens has a defect; --strict: exit 1 on any defect.
// Principle: P4 (judge it by eye) made measurable; rules ledger L16, L27, L28, L33. Spacing law: ux/design-system/README.md, "Space groups".
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
export const TOL = { inversion: 0.6, rhythmMin: 20, crowd: 8, double: 6, headingMin: 8, headingLead: 4, trailing: 6, rowMin: 44 };

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
  // A sticky block taller than half the viewport is not chrome but content that sticks (#264: the picker's sticky search wrapper
  // swallowed the whole list, and nothing under it was judged).
  const pinned = (el) => { for (let e = el; e && e !== scope; e = e.parentElement) { const p = getComputedStyle(e).position; if (p === 'fixed' || (p === 'sticky' && e.getBoundingClientRect().height < H * 0.5)) return true; if (/^(HEADER|FOOTER|NAV)$/.test(e.tagName) || /(^|[-_\s])(footer|dock|statusbar|appbar)/i.test(typeof e.className === 'string' ? e.className : '')) return true; } return false; };
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

  // sideways: a scroll container that a swipe moves sideways although its content is not laid out as a row (#207: the picker's
  // sticky search bled 21px past the list that scrolled it). A row meant to scroll sideways (a chip track: a flex row that does not
  // wrap, a grid flowing in columns, text that does not wrap) is a track, not a defect; overflow-x hidden or clip cannot be swiped,
  // so it is not one either. Shots are taken at scroll offset 0, so no pixel pair can show it.
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (!(cs.overflowX === 'auto' || cs.overflowX === 'scroll') || el.scrollWidth <= el.clientWidth + 1 || !vis(el)) continue;
    const row = (/flex/.test(cs.display) && /^row/.test(cs.flexDirection) && cs.flexWrap === 'nowrap') || (/grid/.test(cs.display) && /column/.test(cs.gridAutoFlow)) || /^(nowrap|pre)$/.test(cs.whiteSpace);
    if (row) continue;
    const box = el.getBoundingClientRect(), over = el.scrollWidth - el.clientWidth;
    const wide = [...el.querySelectorAll('*')].find((k) => { const r = k.getBoundingClientRect(); return r.width > 0 && (r.right > box.right + 1 || r.left < box.left - 1); });
    out.push({ check: 'sideways', at: Math.round(box.top), detail: `${name(el)} scrolls ${over}px sideways though its content is not a row${wide ? ` (${name(wide)} reaches past it)` : ''}: fix what overflows, or clip it (overflow-x: hidden)` });
  }

  // heading: a section heading that sits closer to the block above it than to the content it labels, so it reads as the tail of the
  // block above (#264 on Health record's Conditions sheet: the "Recent" heading went from 20px under the search field to 0). A
  // heading is a short text-only block (no surface, no border, no control; an icon is fine) directly followed by the content it
  // labels; the block above is a different block, a control or a boxed one, as for inversion (a heading under a paragraph is prose).
  // Measured from the heading's text, to the box above and to the first thing drawn in the content below.
  const drawnTop = (el) => {
    if (painted(el) || interactive(el)) return el.getBoundingClientRect().top;
    const tops = lines(el).map((l) => l.top);
    for (const k of el.querySelectorAll('*')) if (vis(k) && (painted(k) || k.matches('img, svg, input, canvas, video, button'))) tops.push(k.getBoundingClientRect().top);
    return tops.length ? Math.min(...tops) : el.getBoundingClientRect().top;
  };
  const prevBlock = (el) => { let node = el; for (let lvl = 0; lvl < 3 && node && node !== scope; lvl++) { let p = node.previousElementSibling; while (p && !all.includes(p)) p = p.previousElementSibling; if (p) return p; node = node.parentElement; } return null; };
  const textOnly = (el) => !interactive(el) && !painted(el) && !el.querySelector('img, canvas, video, input') && ![...el.querySelectorAll('*')].some((k) => vis(k) && painted(k));
  const headed = new Set();
  for (const h of all) {
    const hr = h.getBoundingClientRect();
    if (hr.height < 10 || hr.height > 48 || hr.width < W * 0.3 || !textOnly(h)) continue;
    // it reads as a heading: a heading element or role, or bold text (a field's plain hint under it belongs to the field)
    if (!(/^(H[1-6]|LEGEND)$/.test(h.tagName) || h.getAttribute('role') === 'heading' || +getComputedStyle(h).fontWeight >= 600)) continue;
    const ls = lines(h); if (!ls.length || new Set(ls.map((l) => Math.round(l.top))).size > 2) continue;
    // the content it labels: its next visible sibling, directly below it, bigger than a line and not another line of text
    let next = h.nextElementSibling; while (next && !all.includes(next)) next = next.nextElementSibling;
    if (!next || textOnly(next)) continue;
    const nr = next.getBoundingClientRect(); if (nr.top < hr.bottom - 1 || nr.height < 24) continue;
    const above = prevBlock(h);
    if (!above || headed.has(above) || above.contains(h) || !(interactive(above) || painted(above))) continue;
    const a = above.getBoundingClientRect(); if (a.height < 8 || a.width < W * 0.3) continue;
    const t = ink(h), up = t.top - a.bottom, down = drawnTop(next) - t.bottom;
    if (up < -1 || down < 0 || a.bottom > hr.top + 1) continue;
    if (up < TOL.headingMin || up + TOL.headingLead < down) { headed.add(above); out.push({ check: 'heading', at: Math.round(hr.top), detail: `the heading "${h.textContent.trim().slice(0, 24)}" is ${Math.round(up)}px under ${name(above)} and ${Math.round(down)}px over the ${name(next)} it labels: it reads as the tail of the block above` }); }
  }
  // trailing: a row's trailing control (checkbox, radio, switch, chevron) not centred on its row (#264 on the Conditions sheet: the
  // field rule's 48px min-height reached the rows' checkboxes, 12px low on 56px rows). A row is a row-like element (label, button,
  // link, list item, a row role or a Row part) at least 44px tall; the control sits in its right part.
  const ROWISH = 'label, button, a, li, [role="button"], [role="option"], [role="row"], [role="listitem"], [role="menuitem"], [role="link"], [data-ds="Row"]';
  const CONTROL = 'input[type="checkbox"], input[type="radio"], [role="switch"], [role="checkbox"], [role="radio"], [class*="chevron"]';
  const judged = new Set();
  for (const c of document.querySelectorAll(CONTROL)) {
    if (!scope.contains(c) || !vis(c) || pinned(c) || [...judged].some((j) => j.contains(c))) continue;
    let row = c.parentElement;
    while (row && row !== scope && !(row.matches(ROWISH) || (typeof row.className === 'string' && /(^|[-_])row$/i.test(row.className.trim().split(/\s+/).find((k) => /row$/i.test(k)) || '')))) row = row.parentElement;
    if (!row || row === scope) continue;
    const r = row.getBoundingClientRect(), b = c.getBoundingClientRect();
    if (r.height < TOL.rowMin || r.height > 160 || r.width < W * 0.5 || b.height > r.height || b.left < r.left + r.width * 0.6) continue;
    judged.add(c);
    const off = (b.top + b.bottom) / 2 - (r.top + r.bottom) / 2;
    if (Math.abs(off) > TOL.trailing) out.push({ check: 'trailing', at: Math.round(r.top), detail: `${name(c)} sits ${Math.round(Math.abs(off))}px ${off > 0 ? 'below' : 'above'} the centre of its ${Math.round(r.height)}px ${name(row)}: a trailing control is centred on its row` });
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
const per = (c) => bad.flatMap((r) => r.defects).filter((d) => d.check === c).length;
console.log(`spacing: ${results.length} screens, ${bad.length} with a clear defect (${['inversion', 'crowding', 'double', 'scrollbar', 'sideways', 'heading', 'trailing'].map((c) => `${c} ${per(c)}`).join(', ')})`);
const failing = list('--changed').length ? bad.filter((r) => list('--changed').includes(r.screen)) : argv.includes('--strict') ? bad : [];
process.exit(failing.length ? 1 : 0);
}
