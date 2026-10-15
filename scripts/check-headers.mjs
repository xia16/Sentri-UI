// The header check: the Headers law (ux/design-system/README.md, "Headers") made measurable. Five defects:
//   gap       the header-to-body gap is not space-section (24px ±2): a drawer from its hairline, a page from its last line
//             (the bottom of its title block or Back, whichever is lower) to the first body content (text, a control, a box)
//   contents  a header holds a control other than Back (‹ Parent in a drawer with levels), the subject chip and a sheet
//             header's corner actions (Clear or Reset at the top right, a ✕ at the top left), an aside, or a number-with-unit
//             count ("2 sows", "3 unsaved", "7 / 18", "11 头") in its title or header line
//   corner    a corner action whose vertical centre is more than 2px off the centre of the header's text block (the title's
//             top to its header line's bottom; the title alone only when there is no line), or that is not a 48px target
//   room      a header title that does not fit on one line with 12px clear of each corner target at 360, in English or
//             Chinese; a missing corner is measured as the room it would take (gutter + 48px); a page's left corner is Back.
//             Computed from the title's unwrapped width against 360, so a screen the atlas pins to 390 is judged at 360 too
//   wrap      the header line takes more than one line, or runs past its header, at 360 in English or Chinese
// Headers are the two the law allows (.st-page-header, a sheet's header.utility-header) and any other header that sits on top
// of a sheet (the old .sheet-head): a header behind an open drawer (inert) is not judged on that screen.
// Renders every atlas screen bare at 390 (EN: gap, contents, corner) and 360 (EN and ZH: contents, corner, room, wrap).
// Writes review/headers.json.
// Usage: node scripts/check-headers.mjs [--base <url>] [--feature <id>] [--screens id,id] [--changed <ids>] [--strict]
//                                       [--out <file.json>] [--self-test] [--components [Name,Name]]
//   --components the design system's variant pages instead of the screens (all, or the named components): see below;
//                --atlas <atlas.json> names the pages from another checkout's atlas (the gate's base and candidate).
//   --changed    exit 1 only when one of these screens has a defect; --strict: exit 1 on any defect.
//   --self-test  the known-bad fixtures in scripts/check-headers.fixtures/ must fail the check named in their
//                <meta name="expect">, the known-good ones must pass.
// Principle: P3 (information before layout); rules ledger L17; owner ruling C (2026-10-14) for corners and title room. The gate runs it on changed screens, base against candidate.
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { playwright } from './playwright-path.mjs';
import { screensOf, componentPagesOf } from './loop-rules.mjs';
import { routeFonts } from './font-route.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const val = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null; };
const list = (n) => (val(n) || '').split(',').map((s) => s.trim()).filter(Boolean);
export const TOL = { gap: 24, slack: 2, corner: 2, clear: 12, phone: 360 };

/* ---------- runs inside every frame ---------- */
function auditHeaders({ TOL, checks }) {
  const out = [], seen = [];
  const cs = (e) => getComputedStyle(e);
  const vis = (el) => { const c = cs(el); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity === 0) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const txt = (e) => (e ? (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim() : '');
  const clear = (c) => !c || /rgba\(0, 0, 0, 0\)|transparent/.test(c);
  const backdrop = (el) => { for (let e = el.parentElement; e; e = e.parentElement) { const c = cs(e).backgroundColor; if (!clear(c)) return c; } return 'rgb(255, 255, 255)'; };
  const painted = (el) => { const c = cs(el); const bg = c.backgroundColor; return (!clear(bg) && bg !== backdrop(el)) || ['Top', 'Bottom', 'Left', 'Right'].some((s) => parseFloat(c[`border${s}Width`]) > 0 && !clear(c[`border${s}Color`])); };
  const ownText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  const isPage = (h) => h.matches('.st-page-header');
  const headers = [...document.querySelectorAll('.st-page-header, .sheet > header.utility-header, .sheet > .sheet-head, .sheet > header')]
    .filter((h, i, a) => a.indexOf(h) === i && vis(h) && !h.closest('[inert]'));
  const titleOf = (h) => h.querySelector('.st-page-title, .sheet-title, h1, h2, h3');
  const linesOf = (h) => [...h.querySelectorAll('.st-header-line, .sheet-subtitle')].filter(vis);
  const where = (h) => (isPage(h) ? 'page header' : 'sheet header') + ` "${txt(titleOf(h)).slice(0, 40)}"`;
  // Back (top left of a page, a lead "Back to …" icon button) and ‹ Parent act; the subject chip acts; nothing else does.
  const allowed = (el) => el.matches('.st-page-back, .st-subject-chip, .sheet-up') || /(^|[-_\s])back($|[-_\s])/i.test(typeof el.className === 'string' ? el.className : '') || /^(back|返回)\b/i.test((el.getAttribute('aria-label') || txt(el)).trim());
  // A corner action (sheet header only; owner ruling C, 2026-10-14): Clear or Reset as quiet text at the top right, a ✕ at the
  // top left. Which corner is told by where the control sits in its header.
  const cornerOf = (h, el) => {
    if (isPage(h)) return null;
    const hr = h.getBoundingClientRect(), r = el.getBoundingClientRect(), mid = (r.left + r.right) / 2, centre = (hr.left + hr.right) / 2;
    const label = (el.getAttribute('aria-label') || txt(el)).trim();
    if (/^(clear|reset|清除|重置)$/i.test(label) && mid > centre) return 'right';
    if ((/^(close|dismiss|关闭)$/i.test(el.getAttribute('aria-label') || '') || /^[✕×]$/.test(txt(el))) && mid < centre) return 'left';
    return null;
  };
  // a count: a number followed by what it counts (or "of N", "/ N"); an ID (#000254, B4, P2), a time (08:41) or a weight is not
  const COUNT = /(^|[^\w#.:\/-])(\d+(?:[.,]\d+)?)\s*((?:sows?|gilts?|boars?|piglets?|pigs?|litters?|pens?|crates?|rooms?|units?|animals?|head|alive|dead|born|weaned|fostered|unsaved|saved|selected|left|done|due|overdue|checked|pending|missing|items?|records?|tasks?|issues?|alerts?|of\s+\d+)\b|\/\s*\d+|头|只|窝|栏|个|条|项|未保存|已选|待)/i;

  for (const h of headers) {
    const title = titleOf(h), lines = linesOf(h), note = { kind: isPage(h) ? 'page' : 'sheet', title: txt(title).slice(0, 40), lines: lines.length };
    seen.push(note);
    const controls = [...h.querySelectorAll('button, a[href], [role="button"], [role="link"], input, select, textarea, [contenteditable="true"]')].filter((el) => vis(el) && !el.parentElement.closest('.st-page-back, .st-subject-chip, .sheet-up, button, a[href]'));
    const corners = controls.map((el) => ({ el, side: cornerOf(h, el) })).filter((c) => c.side);
    note.corners = corners.map((c) => c.side);
    // ---- corner: each corner action a 48px target, vertically centred (±2px) on the text block: the title's top to the
    //      header line's bottom, or the title alone when there is no line (never the title alone beside a line, never the box)
    if (checks.includes('corner') && title) {
      const tr = title.getBoundingClientRect(), bottom = lines.length ? lines[lines.length - 1].getBoundingClientRect().bottom : tr.bottom, block = (tr.top + bottom) / 2;
      for (const c of corners) {
        const r = c.el.getBoundingClientRect(), mid = (r.top + r.bottom) / 2, label = (c.el.getAttribute('aria-label') || txt(c.el)).slice(0, 20);
        if (Math.abs(mid - block) > TOL.corner) out.push({ check: 'corner', at: Math.round(r.top), detail: `${where(h)}: "${label}" (${c.side}) is centred ${Math.round(Math.abs(mid - block) * 10) / 10}px ${mid > block ? 'below' : 'above'} the centre of the ${lines.length ? 'title and its line' : 'title'}: it should be within ${TOL.corner}px` });
        const hit = (pe) => { const p = getComputedStyle(c.el, pe); return p.content !== 'none' && p.content !== 'normal' && p.position === 'absolute'; };
        if (Math.min(r.width, r.height) < 47.5 && !hit('::before') && !hit('::after')) out.push({ check: 'corner', at: Math.round(r.top), detail: `${where(h)}: "${label}" is a ${Math.round(r.width)}×${Math.round(r.height)} target: a corner action is 48px` });
      }
    }
    // ---- room: the title on one line with 12px clear of each corner target at 360, computed: its unwrapped width against 360
    //      less, on each side, the corner target (or the room one takes, gutter + 48px, where there is none) and 12px. A sheet
    //      title is centred, so its deeper side counts twice; a page title starts after Back, its left corner. Computed, so a
    //      screen the atlas pins to 390 is judged at 360 all the same.
    if (checks.includes('room') && title) {
      const hr = h.getBoundingClientRect(), hc = cs(h), back = h.querySelector('.st-page-back');
      const reach = (side) => { const c = corners.find((x) => x.side === side); if (c) { const r = c.el.getBoundingClientRect(); return side === 'left' ? r.right - hr.left : hr.right - r.left; } if (side === 'left' && isPage(h) && back) return back.getBoundingClientRect().right - hr.left; return parseFloat(side === 'left' ? hc.paddingLeft : hc.paddingRight) + 48; };
      const probe = title.cloneNode(true); probe.removeAttribute('id');
      Object.assign(probe.style, { position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap', width: 'auto', maxWidth: 'none', left: '0', top: '0' });
      title.parentElement.appendChild(probe); const natural = probe.getBoundingClientRect().width; probe.remove();
      const room = isPage(h) ? TOL.phone - reach('left') - reach('right') - 2 * TOL.clear : TOL.phone - 2 * Math.max(reach('left'), reach('right')) - 2 * TOL.clear;
      if (natural > room + 0.5) out.push({ check: 'room', at: Math.round(title.getBoundingClientRect().top), detail: `${where(h)}: the title is ${Math.round(natural)}px on one line; at ${TOL.phone} there is ${Math.round(room)}px between the corner targets${corners.length ? '' : ' (where they would sit)'} with ${TOL.clear}px clear: shorten it` });
    }
    // ---- contents ----
    if (checks.includes('contents')) {
      const acts = controls.filter((el) => !allowed(el) && !cornerOf(h, el));
      for (const a of acts) out.push({ check: 'contents', at: Math.round(a.getBoundingClientRect().top), detail: `${where(h)} holds a control "${(a.getAttribute('aria-label') || txt(a)).slice(0, 30)}": nothing in a header acts but Back, the subject chip and a sheet's corner actions (Clear or Reset top right, ✕ top left)` });
      if (h.querySelector('.sheet-aside')) out.push({ check: 'contents', at: Math.round(h.getBoundingClientRect().top), detail: `${where(h)} has an aside: nothing sits beside the title` });
      for (const el of [title, ...lines].filter(Boolean)) {
        const m = txt(el).match(COUNT);
        if (m) out.push({ check: 'contents', at: Math.round(el.getBoundingClientRect().top), detail: `${where(h)} shows a count "${(m[2] + ' ' + m[3]).replace(/\s+/g, ' ')}" in its ${el === title ? 'title' : 'line'}: counts go in the body` });
      }
      if (lines.length > 1) out.push({ check: 'contents', at: Math.round(lines[1].getBoundingClientRect().top), detail: `${where(h)} has ${lines.length} header lines: at most one` });
    }
    // ---- wrap: one line, never wrapped or running past the header ----
    if (checks.includes('wrap')) {
      const hr = h.getBoundingClientRect(), hc = cs(h), right = hr.right - parseFloat(hc.paddingRight) + 1, left = hr.left + parseFloat(hc.paddingLeft) - 1;
      for (const l of lines) {
        const rs = []; const w = document.createTreeWalker(l, NodeFilter.SHOW_TEXT); let n;
        while ((n = w.nextNode())) { if (!n.textContent.trim()) continue; const rg = document.createRange(); rg.selectNodeContents(n); rs.push(...[...rg.getClientRects()].filter((r) => r.width > 0 && r.height > 0)); }
        const boxes = [...l.querySelectorAll('*')].filter(vis).map((e) => e.getBoundingClientRect());
        const lh = parseFloat(cs(l).lineHeight) || parseFloat(cs(l).fontSize) * 1.5;
        // a line of text is a run of text boxes whose middles lie within half a line of each other (a mono chip beside sans facts is one line)
        const mids = rs.map((r) => (r.top + r.bottom) / 2).sort((a, b) => a - b);
        const rows = { size: mids.length ? 1 + mids.slice(1).filter((m, i) => m - mids[i] > lh / 2).length : 0 };
        const past = [...rs, ...boxes].some((r) => r.right > right || r.left < left) || l.scrollWidth > l.clientWidth + 1;
        if (rows.size > 1 || l.getBoundingClientRect().height > Math.max(lh, ...boxes.map((b) => b.height)) * 1.5) out.push({ check: 'wrap', at: Math.round(l.getBoundingClientRect().top), detail: `${where(h)}: the header line "${txt(l).slice(0, 40)}" wraps onto ${Math.max(2, rows.size)} lines` });
        else if (past) out.push({ check: 'wrap', at: Math.round(l.getBoundingClientRect().top), detail: `${where(h)}: the header line "${txt(l).slice(0, 40)}" runs past the header` });
      }
    }
    // ---- gap: header to the first body content ----
    if (checks.includes('gap')) {
      const hr = h.getBoundingClientRect();
      const from = isPage(h) ? Math.max(...[...h.children].filter(vis).map((c) => c.getBoundingClientRect().bottom)) : hr.bottom;
      // the body: what follows the header in its surface, outside fixed or sticky chrome and the footer
      const host = h.parentElement, after = [];
      let past = false;
      for (const c of host.children) { if (c === h) { past = true; continue; } if (past) after.push(c); }
      const chrome = (el) => { for (let e = el; e && e !== host; e = e.parentElement) { const p = cs(e).position; if (p === 'fixed' || p === 'sticky' || e.matches('.sheet-footer, .tk-dock, .scrim, footer, nav')) return true; } return false; };
      // the first body content: descend from the first block after the header through plain wrappers to the first thing that
      // draws (text, a control, an image, a painted box) or the root of a component (data-ds: its own padding is its own)
      const stop = (el) => el.hasAttribute('data-ds') || ownText(el) || /^(IMG|svg|INPUT|BUTTON|SELECT|TEXTAREA|CANVAS|VIDEO|HR)$/.test(el.tagName) || painted(el);
      // where a thing starts: a painted box at its edge, anything else where its content starts (inside its own padding)
      // (followed down through first children that share its top edge: a search pulled up over the body's padding by a negative
      // margin starts where its own padding ends)
      const topOf = (el) => {
        for (;;) {
          const r = el.getBoundingClientRect(); if (painted(el)) return r.top;
          const kid = [...el.children].find((k) => vis(k) && !['SCRIPT', 'STYLE', 'TEMPLATE'].includes(k.tagName));
          if (!kid || Math.abs(kid.getBoundingClientRect().top - r.top) > 0.5 || parseFloat(cs(el).paddingTop) > 0) { const c = cs(el); return r.top + parseFloat(c.paddingTop) + parseFloat(c.borderTopWidth); }
          el = kid;
        }
      };
      // the topmost such thing (a row's text centred beside a taller control starts where the control does)
      const descend = (els) => {
        let best = null;
        for (const el of els) {
          if (['SCRIPT', 'STYLE', 'TEMPLATE'].includes(el.tagName) || !vis(el) || chrome(el) || cs(el).position === 'absolute') continue;
          const hit = stop(el) ? el : descend([...el.children]);
          if (hit && (!best || topOf(hit) < topOf(best))) best = hit;
        }
        return best;
      };
      const el0 = descend(after), first = el0 && { el: el0, top: topOf(el0) };
      // a state centred in the space under the header (an empty or waiting screen) is placed by its container, not the header gap
      const centred = (el) => { for (let e = el.parentElement; e && e !== host; e = e.parentElement) { const c = cs(e); if ((/flex/.test(c.display) && c.flexDirection.startsWith('column') && c.justifyContent === 'center') || (/grid/.test(c.display) && /center/.test(c.alignContent))) return true; } return false; };
      if (first && !centred(first.el)) {
        const gap = first.top - from;
        note.gap = Math.round(gap * 10) / 10;
        if (Math.abs(gap - TOL.gap) > TOL.slack) {
          const nm = first.el.tagName.toLowerCase() + (typeof first.el.className === 'string' && first.el.className.trim() ? '.' + first.el.className.trim().split(/\s+/)[0] : '');
          out.push({ check: 'gap', at: Math.round(from), detail: `${where(h)} is ${Math.round(gap)}px from ${isPage(h) ? 'its last line' : 'its hairline'} to the body (${nm}): it should be ${TOL.gap}px (space-section)` });
        }
      }
    }
  }
  return { out, seen };
}

const free = () => new Promise((res) => { const s = createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => res(p)); }); });
let base = val('--base'), server = null;
if (!base) { const port = await free(); server = spawn(process.execPath, ['scripts/serve-ux.cjs', String(port)], { cwd: root, stdio: 'ignore' }); base = `http://localhost:${port}`; await new Promise((r) => setTimeout(r, 1500)); }
base = base.replace(/\/$/, '');
const { chromium } = playwright();
const browser = await chromium.launch();
const contexts = {};
async function ctx(width) {
  if (contexts[width]) return contexts[width];
  const c = await browser.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: 1 });
  await routeFonts(c, root);
  // bare atlas screens are pinned to 390: another width overrides it the way scripts/shoot-screens.mjs does
  await c.addInitScript((w) => { const css = `html.atlas-bare,html.atlas-bare body{width:${w}px!important}html.atlas-bare .atlas-phone{width:${w}px!important}`; const add = () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }; if (document.head) add(); else document.addEventListener('DOMContentLoaded', add); }, width);
  return (contexts[width] = c);
}
const RUNS = [{ width: 390, lang: 'en', checks: ['gap', 'contents', 'corner'] }, { width: 360, lang: 'en', checks: ['contents', 'wrap', 'corner', 'room'] }, { width: 360, lang: 'zh', checks: ['contents', 'wrap', 'corner', 'room'] }];
async function audit(href, run, ready) {
  const page = await (await ctx(run.width)).newPage();
  await page.clock.install({ time: new Date('2026-10-11T09:41:00') }); await page.clock.resume();
  const defects = [], seen = [];
  try {
    await page.goto(href);
    if (ready) await page.waitForSelector(ready, { timeout: 15000 });
    await page.evaluate(() => document.fonts.ready.then(() => true));
    await page.waitForTimeout(400);
    // a sheet that slides in is still moving: wait for finite animations (at most 3s)
    await page.evaluate(() => Promise.race([Promise.all(document.getAnimations().filter((a) => a.effect?.getComputedTiming().endTime !== Infinity).map((a) => a.finished.catch(() => {}))), new Promise((r) => setTimeout(r, 3000))]));
    for (const f of page.frames()) { try { const r = await f.evaluate(auditHeaders, { TOL, checks: run.checks }); defects.push(...r.out.map((d) => ({ ...d, lang: run.lang, width: run.width }))); seen.push(...r.seen.map((x) => ({ ...x, lang: run.lang, width: run.width }))); } catch {} }
  } finally { await page.close(); }
  return { defects, seen };
}
// one finding per check, language and text: the same one at two widths is one
const dedupe = (ds) => { const k = new Set(); return ds.filter((d) => { const key = d.check + '|' + d.lang + '|' + d.detail; if (k.has(key)) return false; k.add(key); return true; }); };

/* ---------- --self-test ---------- */
if (argv.includes('--self-test')) {
  const dir = path.join(root, 'scripts/check-headers.fixtures');
  let n = 0, fails = 0;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.html')).sort()) {
    const html = fs.readFileSync(path.join(dir, f), 'utf8'), expect = (html.match(/name="expect" content="([^"]+)"/) || [])[1] || 'pass';
    const lang = (html.match(/<html lang="([a-z]+)/) || [])[1] === 'zh' ? 'zh' : 'en';
    const ds = [];
    let heads = 0;
    for (const run of RUNS.filter((r) => r.lang === 'en')) { const r = await audit(`${base}/scripts/check-headers.fixtures/${f}`, { ...run, lang }, null); ds.push(...r.defects); heads = Math.max(heads, r.seen.length); }
    const got = new Set(ds.map((d) => d.check));
    const ok = heads > 0 && (expect === 'pass' ? got.size === 0 : expect.split(',').every((c) => got.has(c)) && [...got].every((c) => expect.split(',').includes(c)));
    n++; if (!ok) fails++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${f}  expected ${expect}  got ${[...got].join(',') || 'nothing'}${heads ? '' : ' (no header found)'}`);
    for (const d of dedupe(ds)) console.log(`       ${d.check}: ${d.detail}`);
  }
  console.log(`${n - fails}/${n} fixtures behave as expected`);
  await browser.close(); if (server) server.kill();
  process.exit(fails ? 1 : 0);
}

/* ---------- --components: the design system's own variant pages ---------- */
// A law that a screen must follow, the component page that teaches it must follow too: every variant page the atlas draws
// (Components → <Name> → <variant>, ds:<Name>/<variant>; the same list the gate shoots) is audited like a screen, as the atlas
// draws it: each state is a frame, and audit() walks every frame (room, wrap, contents and corner at 360, EN; a page's Chinese
// cells are its own). --out writes [{ page, headers, defects, error? }]; the gate compares it base against candidate.
// Exit 1 on any defect or page that doesn't render with --strict.
if (argv.includes('--components')) {
  const pages = componentPagesOf(JSON.parse(fs.readFileSync(val('--atlas') || path.join(root, 'atlas/atlas.json'), 'utf8')), { components: list('--components') });
  const run = { width: 360, lang: 'en', checks: ['contents', 'wrap', 'corner', 'room'] };
  const found = [];
  for (const pg of pages) {
    const res = { page: pg.id, headers: 0, defects: [] };
    try { const r = await audit(base + pg.url, run, '.vbody .sgrid .scell iframe'); res.defects = dedupe(r.defects); res.headers = r.seen.length; } catch (e) { res.error = e.message.split('\n')[0]; }
    if (res.defects.length || res.error) { console.log(`${res.error ? 'ERR ' : 'HEAD'} ${pg.id}${res.error ? ' ' + res.error : ''}`); res.defects.forEach((d) => console.log(`      ${d.check.padEnd(8)} ${d.detail}`)); }
    found.push(res);
  }
  const bad = found.filter((f) => f.defects.length || f.error);
  console.log(`headers: ${pages.length} component pages (${found.reduce((n, f) => n + f.headers, 0)} headers), ${bad.length} with a defect or not rendered`);
  if (val('--out')) fs.writeFileSync(val('--out'), JSON.stringify(found));
  await browser.close(); if (server) server.kill();
  process.exit(argv.includes('--strict') && bad.length ? 1 : 0);
}

/* ---------- the atlas screens ---------- */
const atlas = JSON.parse(fs.readFileSync(path.join(root, 'atlas/atlas.json'), 'utf8'));
let todo = screensOf(atlas).filter((s) => s.url);
if (val('--feature')) todo = todo.filter((s) => s.feature === val('--feature'));
const only = [...list('--screens'), ...list('--changed')];
if (only.length) todo = todo.filter((s) => only.includes(s.id));
const results = [];
for (const s of todo) {
  const res = { screen: s.id, feature: s.feature, headers: [], defects: [] };
  for (const run of RUNS) {
    const u = new URL(base + s.url); u.searchParams.set('screen', s.id); if (run.lang !== 'en') u.searchParams.set('lang', run.lang);
    try { const r = await audit(u.href, run, 'html.atlas-ready'); res.defects.push(...r.defects); if (run.checks.includes('gap')) res.headers = r.seen; } catch (e) { res.error = `${run.lang}-${run.width}: ${e.message.split('\n')[0]}`; }
  }
  res.defects = dedupe(res.defects);
  results.push(res);
  if (res.defects.length || res.error) console.log(`${res.error ? 'ERR ' : 'HEAD'} ${s.id}${res.error ? ' ' + res.error : ''}`), res.defects.forEach((d) => console.log(`      ${d.check.padEnd(8)} ${d.lang}-${d.width} ${d.detail}`));
}
await browser.close(); if (server) server.kill();
if (!only.length && !val('--feature')) { fs.mkdirSync(path.join(root, 'review'), { recursive: true }); fs.writeFileSync(path.join(root, 'review/headers.json'), JSON.stringify({ tolerances: TOL, screens: results }, null, 1)); }
if (val('--out')) fs.writeFileSync(val('--out'), JSON.stringify(results));
const bad = results.filter((r) => r.defects.length), all = bad.flatMap((r) => r.defects), errs = results.filter((r) => r.error);
console.log(`headers: ${results.length} screens (${results.filter((r) => r.headers.length).length} with a header, ${results.reduce((n, r) => n + r.headers.length, 0)} headers), ${bad.length} with a defect (${['gap', 'contents', 'corner', 'room', 'wrap'].map((k) => `${k} ${all.filter((d) => d.check === k).length}`).join(', ')})${errs.length ? `, ${errs.length} failed to render` : ''}`);
const failing = list('--changed').length ? results.filter((r) => list('--changed').includes(r.screen) && (r.defects.length || r.error)) : argv.includes('--strict') ? [...bad, ...errs] : [];
process.exit(failing.length ? 1 : 0);
