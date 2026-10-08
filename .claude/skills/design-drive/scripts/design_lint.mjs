#!/usr/bin/env node
// Design lint: render each screen state in a real browser and measure it.
//
//   node design_lint.mjs [--repo DIR] [--page NAME ...] [--strict] [--pseudo] [--port N]
//                        [--out DIR] [--json]
//
// Reads the repo's docs/agents/design.md (a ```json block) and its design
// system's tokens.json and string registry. For every page x viewport x
// locale it checks:
//   tokens    spacing, font size, radius and colour against tokens.json
//   geometry  horizontal scroll, viewport protrusion, clipped text,
//             collisions of visible ink, overlapping tap areas, content
//             that stays under a header or dock, tap targets,
//             near-miss alignment, sibling boxes that intersect,
//             a sheet's footer that does not sit on the sheet's bottom
//             edge, a sheet taller than its content (dead space), and
//             controls a tap at their centre does not reach, and controls in a
//             pinned region (or a keypad) below the phone's visible bottom
//   copy      banned words; on strict pages every visible string carries a
//             registry id (data-str) and matches the registry, and every
//             control sits inside a design-system component (data-ds)
// It writes report.json and one screenshot per state to --out (default a
// temp folder) and prints a summary. The designer runs it after each edit.
// Exit 0 clean, 1 findings at error level, 2 setup failure.
//
// Playwright is pinned here, not in the design repo: a repo may have no
// package.json at all. It installs once into a per-user cache.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir, tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const PLAYWRIGHT = '1.63.0';
const CACHE = join(homedir(), '.cache', 'adam-design', `playwright-${PLAYWRIGHT}`);

function fail(msg) { console.error(`design-lint: ${msg}`); process.exit(2); }

function args(argv) {
  const a = { repo: '.', page: [], strict: false, pseudo: false, out: '', json: false, port: null };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--repo') a.repo = argv[++i];
    else if (k === '--page') a.page.push(argv[++i]);
    else if (k === '--out') a.out = argv[++i];
    else if (k === '--strict') a.strict = true;
    else if (k === '--pseudo') a.pseudo = true;
    else if (k === '--json') a.json = true;
    else if (k === '--port') a.port = Number(argv[++i]);
    else fail(`unknown argument ${k}`);
  }
  return a;
}

export function loadConfig(repo) {
  const f = join(repo, 'docs', 'agents', 'design.md');
  if (!existsSync(f)) fail(`no docs/agents/design.md in ${repo}: set up the design config first`);
  const m = readFileSync(f, 'utf8').match(/```json\s*\n([\s\S]*?)\n```/);
  if (!m) fail('docs/agents/design.md has no ```json block');
  try { return JSON.parse(m[1]); } catch (e) { fail(`docs/agents/design.md: bad json (${e.message})`); }
}

// Everything the page-side analyser compares against, as plain data.
export function tokenSets(repo, cfg) {
  const t = JSON.parse(readFileSync(join(repo, cfg.design_system, 'tokens.json'), 'utf8'));
  const px = v => { const m = String(v).match(/^(-?\d*\.?\d+)px$/); return m ? Math.abs(+m[1]) : null; };
  const extra = cfg.allow || {};
  const spacing = new Set([0, ...(t.spacing?.tokens || []).map(x => px(x.value)), ...(extra.spacing || [])].filter(v => v != null));
  const fontSize = new Set([...(t.type?.groups || []).flatMap(g => g.styles.map(s => px(s.fontSize))), ...(extra.fontSize || [])].filter(v => v != null));
  const radius = new Set([0, ...(t.radius?.tokens || []).map(x => px(x.value)), ...(extra.radius || [])].filter(v => v != null));
  const hex = v => String(v).toLowerCase();
  const colors = new Set([...(t.color?.tokens || []).map(x => hex(x.value)), ...(extra.colors || []).map(hex)]);
  const touch = px((t.size?.tokens || []).find(x => x.name === 'touch-min')?.value) || 44;
  return { spacing: [...spacing], fontSize: [...fontSize], radius: [...radius], colors: [...colors], touch };
}

export function registry(repo, cfg) {
  const f = cfg.strings && join(repo, cfg.strings);
  if (!f || !existsSync(f)) return { banned: {}, strings: {} };
  const r = JSON.parse(readFileSync(f, 'utf8'));
  return { banned: r.banned || {}, strings: r.strings || {} };
}

async function playwright(repo) {
  for (const base of [join(resolve(repo), 'package.json'), join(CACHE, 'package.json')]) {
    try { return createRequire(base)('playwright'); } catch {}
  }
  mkdirSync(CACHE, { recursive: true });
  if (!existsSync(join(CACHE, 'package.json'))) writeFileSync(join(CACHE, 'package.json'), '{"private":true}');
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const r = spawnSync(npm, ['install', '--no-audit', '--no-fund', `playwright@${PLAYWRIGHT}`], { cwd: CACHE, stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) fail(`could not install playwright@${PLAYWRIGHT} into ${CACHE}`);
  return createRequire(join(CACHE, 'package.json'))('playwright');
}

async function ensureBrowser(pw) {
  if (existsSync(pw.chromium.executablePath())) return;
  const cli = join(CACHE, 'node_modules', 'playwright', 'cli.js');
  const r = spawnSync(process.execPath, [cli, 'install', 'chromium'], { stdio: 'inherit' });
  if (r.status !== 0) fail('could not install chromium for playwright');
}

async function up(url) {
  try { const r = await fetch(url, { method: 'HEAD' }); return r.status < 500; } catch { return false; }
}

async function serve(repo, cfg, base) {
  if (await up(base)) return null;
  if (!cfg.serve) fail(`${base} is not answering and the config has no serve command`);
  const cmd = cfg.serve.replace('{port}', String(cfg.port ?? ''));
  const child = spawn(cmd, { cwd: repo, shell: true, stdio: 'ignore' });
  for (let i = 0; i < 60; i++) {
    if (await up(base)) return child;
    await new Promise(r => setTimeout(r, 250));
  }
  child.kill();
  fail(`started "${cmd}" but ${base} never answered`);
}

// Runs inside the page. Must be self-contained: it is serialised by Playwright.
function analyse({ sets, reg, strict, pseudo, locale, root }) {
  const out = [], used = new Set();
  const near = (v, list) => list.some(x => Math.abs(x - v) < 0.05);
  const W = innerWidth, H = innerHeight;
  const roots = [...document.querySelectorAll(root || 'body')];
  // Each root is a frame: a phone canvas on a studio board, or the whole window.
  const frameOf = el => { const r = el.closest(root || 'body'); return !r || r === document.body ? { left: 0, right: W } : r.getBoundingClientRect(); };
  const desc = el => {
    const c = [...el.classList].slice(0, 2).map(x => '.' + x).join('');
    const s = el.getAttribute('data-str'), d = el.getAttribute('data-ds');
    const text = (el.innerText || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 32);
    return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${c}${s ? `[data-str=${s}]` : ''}${d ? `[data-ds=${d}]` : ''}${text ? ` "${text}"` : ''}`;
  };
  const add = (rule, level, el, msg, value) => out.push({ rule, level, el: el ? desc(el) : '', msg, value: value ?? null });
  const hex = c => {
    const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null;
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    const h = n => Math.round(n).toString(16).padStart(2, '0');
    const a = p.length > 3 ? p[3] : 1;
    return a === 0 ? null : '#' + h(p[0]) + h(p[1]) + h(p[2]) + (a < 1 ? h(a * 255) : '');
  };
  const fixedAncestor = el => { for (let e = el; e && e !== document.body; e = e.parentElement) { const p = getComputedStyle(e).position; if (p === 'fixed' || p === 'sticky') return e; } return null; };
  const hidden = el => {
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0 || e.hasAttribute('data-lint-ignore')) return true;
    }
    const r = el.getBoundingClientRect();
    if (r.width < 0.5 || r.height < 0.5) return true;
    const f = fixedAncestor(el);
    if (f && getComputedStyle(f).position === 'fixed' && (r.bottom <= 0 || r.top >= H || r.right <= 0 || r.left >= W)) return true;
    return false;
  };
  const scrollerX = el => { for (let e = el.parentElement; e; e = e.parentElement) { const o = getComputedStyle(e).overflowX; if (o === 'auto' || o === 'scroll') return true; } return false; };
  const ownText = el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  const interactive = el => el.matches('button,a[href],input:not([type=hidden]),select,textarea,summary,[role=button],[data-action]');

  if (pseudo) {
    for (const r of roots) {
      const w = document.createTreeWalker(r, NodeFilter.SHOW_TEXT);
      for (let n; (n = w.nextNode());) {
        const t = n.textContent; if (!t.trim()) continue;
        n.textContent = '⟦' + t + '~'.repeat(Math.ceil(t.trim().length * 0.4)) + '⟧';
      }
    }
  }

  const els = roots.flatMap(r => [r, ...r.querySelectorAll('*')]).filter(el => !el.closest('svg') || el.tagName.toLowerCase() === 'svg').filter(el => !hidden(el));

  // tokens
  for (const el of els) {
    const s = getComputedStyle(el);
    const flow = s.display.includes('flex') || s.display.includes('grid');
    const sp = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'marginTop', 'marginBottom', ...(flow ? ['rowGap', 'columnGap'] : [])];
    for (const p of sp) {
      const v = Math.abs(parseFloat(s[p])); if (!v || Number.isNaN(v)) continue;
      if (!near(v, sets.spacing)) add('token-spacing', 'error', el, `${p} ${v}px is not a spacing token`, v);
    }
    if (ownText(el)) {
      const fs = parseFloat(s.fontSize);
      if (!near(fs, sets.fontSize)) add('token-font-size', 'error', el, `font-size ${fs}px is not on the type scale`, fs);
      const c = hex(s.color); if (c && !sets.colors.includes(c)) add('token-color', 'error', el, `text colour ${c} is not in the palette`, c);
    }
    const bg = hex(s.backgroundColor); if (bg && !sets.colors.includes(bg)) add('token-color', 'error', el, `background ${bg} is not in the palette`, bg);
    if (parseFloat(s.borderTopWidth) > 0) { const bc = hex(s.borderTopColor); if (bc && !sets.colors.includes(bc)) add('token-color', 'error', el, `border ${bc} is not in the palette`, bc); }
    const rad = parseFloat(s.borderTopLeftRadius);
    if (rad && !s.borderTopLeftRadius.includes('%') && rad < 999 && !near(rad, sets.radius)) add('token-radius', 'error', el, `radius ${rad}px is not a radius token`, rad);
  }

  // geometry
  const doc = document.scrollingElement || document.documentElement;
  if (!root && doc.scrollWidth > W + 1) add('geo-hscroll', 'error', null, `the page scrolls sideways: ${doc.scrollWidth}px wide at a ${W}px viewport`, doc.scrollWidth);
  for (const el of els) {
    const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    const fr = frameOf(el);
    if ((r.right > fr.right + 0.5 || r.left < fr.left - 0.5) && !scrollerX(el)) add('geo-viewport', 'error', el, `extends past its screen (${Math.round(r.left - fr.left)}–${Math.round(r.right - fr.left)} of ${Math.round(fr.right - fr.left)}px)`);
    const clipsX = ['hidden', 'clip'].includes(s.overflowX);
    if (clipsX && el.scrollWidth > el.clientWidth + 1 && ownText(el)) {
      if (s.textOverflow === 'ellipsis') add('geo-truncated', 'warn', el, 'text is truncated with an ellipsis');
      else add('geo-clipped', 'error', el, `text is clipped (${el.scrollWidth}px in ${el.clientWidth}px)`);
    }
    if (interactive(el) && !(el.tagName === 'A' && el.closest('p'))) {
      // a control inside its <label> is tapped through the label
      const lab = el.matches('input') && (el.closest('label') || (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)));
      const t = lab ? lab.getBoundingClientRect() : r;
      if (t.width < sets.touch - 0.5 || t.height < sets.touch - 0.5) add('geo-tap', 'error', el, `tap target ${Math.round(r.width)}×${Math.round(r.height)} is under ${sets.touch}px`);
    }
    if (el.hasAttribute('data-ds')) used.add(el.getAttribute('data-ds'));
  }
  const leaves = els.filter(el => (ownText(el) || interactive(el) || el.tagName === 'IMG' || el.tagName.toLowerCase() === 'svg') && el !== document.body);
  // What is actually on screen: the box cut by every ancestor that clips it.
  const box = el => {
    const r = el.getBoundingClientRect(); let v = { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    for (let e = el.parentElement; e && e !== document.documentElement; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.overflowX === 'visible' && s.overflowY === 'visible') continue;
      const c = e.getBoundingClientRect();
      v = { left: Math.max(v.left, c.left), right: Math.min(v.right, c.right), top: Math.max(v.top, c.top), bottom: Math.min(v.bottom, c.bottom) };
    }
    return v;
  };
  const overlap = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  // Two things collide only in the same scroll context: a row passing under a
  // dock is scrolling, not colliding. Whether it can scroll clear is
  // unreachable()'s question.
  const scrollParent = el => { for (let e = el.parentElement; e; e = e.parentElement) { const o = getComputedStyle(e).overflowY; if (o === 'auto' || o === 'scroll') return e; } return null; };
  // A layer is a positioned box covering much of its screen (a drawer, a dialog):
  // what it covers is behind it, not colliding with it. An empty layer (a scrim)
  // is not content at all.
  const frameArea = el => { const f = frameOf(el); return Math.max(1, (f.right - f.left) * ((f.bottom ?? H) - (f.top ?? 0))); };
  const isLayer = e => ['fixed', 'absolute'].includes(getComputedStyle(e).position) && (() => { const r = e.getBoundingClientRect(); return r.width * r.height > 0.3 * frameArea(e); })();
  const layerOf = el => { for (let e = el; e && e !== document.body; e = e.parentElement) if (isLayer(e)) return e; return null; };
  const isScrim = el => isLayer(el) && !(el.innerText || '').trim() && !el.querySelector('svg,img');
  const context = el => layerOf(el) || fixedAncestor(el) || scrollParent(el);
  // Ink is what the eye sees: the text itself, or the icon. A control's padded
  // tap area overlapping plain text is a hit-area extension, not a collision;
  // two tap areas overlapping is an ambiguous tap.
  const ink = el => {
    if (!ownText(el)) return box(el);
    const rg = document.createRange(); rg.selectNodeContents(el);
    const t = rg.getBoundingClientRect(), c = box(el);
    return { left: Math.max(t.left, c.left), right: Math.min(t.right, c.right), top: Math.max(t.top, c.top), bottom: Math.min(t.bottom, c.bottom) };
  };
  for (let i = 0; i < leaves.length; i++) for (let j = i + 1; j < leaves.length; j++) {
    const a = leaves[i], b = leaves[j];
    if (a.contains(b) || b.contains(a) || isScrim(a) || isScrim(b) || context(a) !== context(b)) continue;
    if (interactive(a) && interactive(b)) {
      const o = overlap(box(a), box(b));
      if (o > 4) add('geo-tap-overlap', 'error', a, `tap area overlaps ${desc(b)} by ${Math.round(o)}px²`);
      continue;
    }
    const inkA = interactive(a) && !ownText(a) ? null : ink(a), inkB = interactive(b) && !ownText(b) ? null : ink(b);
    if (!inkA || !inkB) continue;
    const o = overlap(inkA, inkB);
    if (o > 4) add('geo-collision', 'error', a, `overlaps ${desc(b)} by ${Math.round(o)}px²`);
  }
  // Sibling boxes never intersect. A layer (absolute or fixed) sits over its siblings on purpose; everything
  // in flow must tile. An inline element is compared fragment by fragment, so wrapped text does not count.
  const inFlow = el => { const s = getComputedStyle(el); return !['absolute', 'fixed'].includes(s.position) && s.display !== 'contents'; };
  const frags = el => (getComputedStyle(el).display === 'inline' ? [...el.getClientRects()] : [el.getBoundingClientRect()]).filter(r => r.width >= 0.5 && r.height >= 0.5);
  const shown = new Set(els);
  for (const parent of els) {
    const kids = [...parent.children].filter(c => shown.has(c) && inFlow(c));
    for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) {
      let worst = null;
      for (const a of frags(kids[i])) for (const b of frags(kids[j])) {
        const w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (w > 1 && h > 1 && (!worst || w * h > worst.w * worst.h)) worst = { w, h };
      }
      if (worst) add('geo-sibling-overlap', 'error', kids[i], `its box intersects its sibling ${desc(kids[j])} (${Math.round(worst.w)}×${Math.round(worst.h)}px)`);
    }
  }

  // Sheets. A sheet is a drawer, a page or a dialog; its footer is a direct child.
  //  - the footer sits on the sheet's bottom edge (it never floats over space under it);
  //  - a sheet not held at full height (data-height="full", a page, or as tall as its screen) is no taller than
  //    its content plus its footer: no dead space.
  const sheetSel = '.sheet, .tk-sheet, .dialog, .tk-dialog, .tk-page, .record-page, [role="dialog"], [data-sheet]';
  const footSel = '.sheet-footer, .tk-footer, footer, [data-footer]';
  const px = v => parseFloat(v) || 0;
  // How tall an element's content is, whatever height the layout gave it (a flex-grown or scrolling body).
  const natural = c => {
    const s = getComputedStyle(c), r = c.getBoundingClientRect();
    const grows = px(s.flexGrow) > 0 || ['auto', 'scroll'].includes(s.overflowY);
    if (!grows) return r.height;
    const kids = [...c.children].filter(k => shown.has(k) && inFlow(k));
    let bottom = r.top + px(s.borderTopWidth) + px(s.paddingTop);
    if (kids.length) for (const k of kids) bottom = Math.max(bottom, k.getBoundingClientRect().bottom + px(getComputedStyle(k).marginBottom) + c.scrollTop);
    else { const rg = document.createRange(); rg.selectNodeContents(c); const t = rg.getBoundingClientRect(); if (t.height) bottom = Math.max(bottom, t.bottom + c.scrollTop); }
    return bottom - r.top + px(s.paddingBottom) + px(s.borderBottomWidth);
  };
  for (const sh of els.filter(el => el.matches(sheetSel))) {
    const r = sh.getBoundingClientRect(), s = getComputedStyle(sh);
    const foot = [...sh.children].find(c => c.matches(footSel) && shown.has(c));
    if (foot) {
      const gap = r.bottom - foot.getBoundingClientRect().bottom;
      if (Math.abs(gap) > 1) add('geo-footer-float', 'error', foot, `the footer ends ${Math.round(Math.abs(gap))}px ${gap > 0 ? 'above' : 'below'} its sheet's bottom edge (${desc(sh)})`, Math.round(gap));
    }
    const scr = sh.closest(root || 'body'), fh = scr && scr !== document.body ? scr.getBoundingClientRect().height : H;
    const full = sh.matches('[data-height="full"], [data-presentation="page"], .tk-page, .record-page') || r.height >= fh - 2;
    if (full) continue;
    const kids = [...sh.children].filter(c => shown.has(c) && inFlow(c));
    const content = kids.reduce((sum, c) => { const cs = getComputedStyle(c); return sum + natural(c) + px(cs.marginTop) + px(cs.marginBottom); }, 0)
      + px(s.paddingTop) + px(s.paddingBottom) + px(s.borderTopWidth) + px(s.borderBottomWidth);
    const dead = r.height - content;
    if (dead > 2) add('geo-sheet-dead-space', 'error', sh, `the sheet is ${Math.round(dead)}px taller than its content and footer (${Math.round(r.height)}px for ${Math.round(content)}px): size it to its content, or hold it with data-height="full"`, Math.round(dead));
  }

  // near-miss alignment among siblings: edges 1–3px apart were meant to line up
  const byParent = new Map();
  for (const el of leaves) { const p = el.parentElement; if (!byParent.has(p)) byParent.set(p, []); byParent.get(p).push(el); }
  for (const [, kids] of byParent) {
    for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) {
      const a = box(kids[i]), b = box(kids[j]);
      const sameRow = Math.abs(a.top - b.top) < 12 && a.left !== b.left;
      // on one line, top, centre or bottom may be the aligned edge (text of two sizes aligns by baseline)
      const dTop = Math.min(Math.abs(a.top - b.top), Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2), Math.abs(a.bottom - b.bottom)), dLeft = Math.abs(a.left - b.left);
      if (sameRow && dTop >= 1 && dTop <= 3) add('geo-misaligned', 'warn', kids[i], `${dTop.toFixed(1)}px off ${desc(kids[j])} on every edge`, dTop);
      else if (!sameRow && dLeft >= 1 && dLeft <= 3) add('geo-misaligned', 'warn', kids[i], `left edge ${dLeft.toFixed(1)}px off ${desc(kids[j])}`, dLeft);
    }
  }

  // copy
  if (!pseudo) {
    const visibleText = roots.map(r => r.innerText || '').join('\n');
    if (locale === 'en') for (const [word, why] of Object.entries(reg.banned)) {
      if (new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(visibleText)) add('copy-banned', 'error', null, `"${word}" appears on screen — ${why}`, word);
    }
    if (strict) {
      const pattern = t => new RegExp('^' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\{[^}]*\\\}/g, '.+?') + '$');
      for (const el of els) {
        if (interactive(el) && !el.closest('[data-ds]')) add('ds-unmarked', 'error', el, 'control is not inside a design-system component (data-ds)');
        if (!ownText(el)) continue;
        const holder = el.closest('[data-str]');
        if (!holder) { add('copy-unregistered', 'error', el, 'visible text has no registry id (data-str)'); continue; }
        const id = holder.getAttribute('data-str'), entry = reg.strings[id];
        if (!entry) { add('copy-unknown-id', 'error', holder, `data-str "${id}" is not in the registry`); continue; }
        const want = entry[locale];
        if (!want) { add('copy-missing-locale', locale === 'en' ? 'error' : 'warn', holder, `"${id}" has no ${locale} text`); continue; }
        const got = holder.innerText.trim().replace(/\s+/g, ' ');
        if (!pattern(want).test(got)) add('copy-mismatch', 'error', holder, `shows "${got}", registry says "${want}"`);
      }
    }
  }
  return { findings: out, used: [...used] };
}

// Scroll everything to its end: anything a fixed or sticky bar still covers is unreachable.
function unreachable({ root }) {
  const out = [];
  const pos = e => getComputedStyle(e).position;
  const inScope = e => !root || e.closest(root);
  const rect = e => e.getBoundingClientRect();
  const area = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const scrollParent = el => { for (let e = el.parentElement; e; e = e.parentElement) { const o = getComputedStyle(e).overflowY; if ((o === 'auto' || o === 'scroll') && e.scrollHeight > e.clientHeight + 1) return e; } return null; };
  const frame = e => { const r = e.closest(root || 'body'); return r && r !== document.body ? rect(r) : { left: 0, right: innerWidth, top: 0, bottom: innerHeight }; };
  // A bar is a positioned strip over a scroller (header, dock, footer) — not a
  // layer covering most of the screen: a drawer's scrim hides the page on purpose.
  // A bar inside an inert subtree (the page behind an open drawer) is behind the drawer: it covers nothing.
  const bars = [...document.querySelectorAll('*')].filter(e => ['fixed', 'sticky', 'absolute'].includes(pos(e)) && inScope(e) && !e.closest('[inert]') && getComputedStyle(e).visibility !== 'hidden' && (() => { const r = rect(e), f = frame(e); return r.height > 0 && r.width * r.height < 0.3 * (f.right - f.left) * (f.bottom - f.top); })());
  for (const el of document.querySelectorAll('button,a[href],input,[data-action],[data-str]')) {
    if (!inScope(el)) continue;
    const sc = scrollParent(el); if (!sc) continue;
    const covering = () => { const e = rect(el), v = rect(sc); if (area(e, v) < 1) return null; return bars.find(b => !b.contains(el) && !el.contains(b) && area(e, rect(b)) > e.width * e.height * 0.25) || null; };
    // bring it as far into view as its scroller allows, then ask again
    el.scrollIntoView({ block: 'center', inline: 'nearest' });
    const b = covering();
    if (b) out.push({ rule: 'geo-unreachable', level: 'error', el: `${el.tagName.toLowerCase()} "${(el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 32)}"`, msg: `stays under ${b.tagName.toLowerCase()}${b.classList.length ? '.' + b.classList[0] : ''} even scrolled into view`, value: null });
  }
  return out;
}

// A control that cannot be scrolled to must be on screen as the page opens (geo-control-offscreen). Run before any
// other check scrolls. A control with no scrolling ancestor inside the screen (a footer, a dock, a pinned pad) whose box
// ends below the phone's visible bottom can never be reached. A keypad ([data-ds=Numpad]) is one tool used whole, so its
// keys count as pinned wherever it sits: a pad whose bottom row is under the fold is flagged even inside a scroller.
function offscreen({ root }) {
  const out = [];
  const inScope = e => !root || e.closest(root);
  const shown = el => {
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0 || e.hasAttribute('data-lint-ignore')) return false;
    }
    const r = el.getBoundingClientRect();
    return r.width >= 0.5 && r.height >= 0.5;
  };
  const scroller = el => {
    const top = root ? el.closest(root) : null;
    for (let e = el.parentElement; e && e !== top; e = e.parentElement) {
      const o = getComputedStyle(e).overflowY;
      if ((o === 'auto' || o === 'scroll') && e.scrollHeight > e.clientHeight + 1) return e;
    }
    return null;
  };
  const name = el => `${el.tagName.toLowerCase()}${[...el.classList].slice(0, 2).map(x => '.' + x).join('')}${el.dataset && el.dataset.action ? `[data-action=${el.dataset.action}]` : ''}${el.dataset && el.dataset.key ? `[data-key=${el.dataset.key}]` : ''} "${(el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 32)}"`;
  for (const el of document.querySelectorAll('button,[data-action]')) {
    if (!inScope(el) || el.closest('[inert]') || el.disabled || !shown(el)) continue;
    const pad = el.closest('[data-ds="Numpad"]'), host = root ? el.closest(root) : null;
    if (!pad && (scroller(el) || (!host && document.scrollingElement && document.scrollingElement.scrollHeight > innerHeight + 1))) continue;
    // the visible bottom: the phone's (and the window's, unless the document itself scrolls, as a gallery does), or the
    // nearest scroller's (a pad inside a scroller is cut at the scroller's edge)
    const docScrolls = document.scrollingElement && document.scrollingElement.scrollHeight > innerHeight + 1;
    let bottom = host ? host.getBoundingClientRect().bottom : docScrolls ? Infinity : innerHeight;
    if (!docScrolls) bottom = Math.min(bottom, innerHeight);
    for (let e = el.parentElement; e && e !== host; e = e.parentElement) { const o = getComputedStyle(e).overflowY; if (o === 'auto' || o === 'scroll') { const b = e.getBoundingClientRect(); bottom = Math.min(bottom, b.top + e.clientHeight); } }
    const r = el.getBoundingClientRect();
    if (r.bottom > bottom + 2) out.push({ rule: 'geo-control-offscreen', level: 'error', el: name(el), msg: `${pad ? (el.dataset.key ? 'a keypad key' : 'a keypad control') : 'a pinned control'} ends ${Math.round(r.bottom - bottom)}px below its visible bottom`, value: Math.round(r.bottom - bottom) });
  }
  return out;
}

// Tap every control at its centre: brought into view as far as its scrollers allow, the topmost element there
// must be the control or inside it. Catches a control under pointer-events:none, under a layer, or under a bar.
// Controls inside an inert subtree (the page behind an open drawer) are not offered to the finger and are skipped.
function untappable({ root }) {
  const out = [];
  const inScope = e => !root || e.closest(root);
  const shown = el => {
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0 || e.hasAttribute('data-lint-ignore')) return false;
    }
    const r = el.getBoundingClientRect();
    return r.width >= 0.5 && r.height >= 0.5;
  };
  const name = el => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${[...el.classList].slice(0, 2).map(x => '.' + x).join('')}${el.dataset && el.dataset.action ? `[data-action=${el.dataset.action}]` : ''} "${(el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 32)}"`;
  for (const el of document.querySelectorAll('button,[data-action]')) {
    if (!inScope(el) || el.closest('[inert]') || !shown(el)) continue;
    el.scrollIntoView({ block: 'center', inline: 'center' });
    const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) {
      out.push({ rule: 'geo-untappable', level: 'error', el: name(el), msg: `its centre (${Math.round(x)}, ${Math.round(y)}) stays outside the window even scrolled into view`, value: null });
      continue;
    }
    const hit = document.elementFromPoint(x, y);
    if (hit && (hit === el || el.contains(hit))) continue;
    // A scrim (an empty positioned layer) is tapped wherever it shows, above its drawer, not at its centre,
    // which the drawer covers: walk down its centre line and accept the first point it owns.
    const empty = !(el.innerText || '').trim() && !el.querySelector('svg,img') && ['absolute', 'fixed'].includes(getComputedStyle(el).position);
    if (empty) {
      let reached = false;
      for (let yy = Math.max(0, r.top) + 4; yy < Math.min(innerHeight, r.bottom) && !reached; yy += 8) { const h = document.elementFromPoint(x, yy); reached = !!h && (h === el || el.contains(h)); }
      if (reached) continue;
    }
    out.push({ rule: 'geo-untappable', level: 'error', el: name(el), msg: `a tap at its centre lands on ${hit ? name(hit) : 'nothing'}`, value: null });
  }
  return out;
}

function pagesFrom(cfg, only) {
  const pages = (cfg.pages || []).map(p => typeof p === 'string' ? { name: p, url: p } : p);
  const pick = only.length ? pages.filter(p => only.includes(p.name)) : pages;
  if (!pick.length) fail(only.length ? `no page named ${only.join(', ')} in the config` : 'the config lists no pages');
  return pick;
}

function withLocale(url, cfg, locale) {
  if (!cfg.locale_param || locale === (cfg.locales || ['en'])[0]) return url;
  return url + (url.includes('?') ? '&' : '?') + `${cfg.locale_param}=${locale}`;
}

async function main() {
  const a = args(process.argv.slice(2));
  const repo = resolve(a.repo);
  const cfg = loadConfig(repo);
  if (a.port) cfg.port = a.port; // parallel worktrees: each lints on its own server
  const sets = tokenSets(repo, cfg), reg = registry(repo, cfg);
  const base = (cfg.base_url || 'http://localhost:{port}/').replace('{port}', String(cfg.port ?? ''));
  const out = a.out ? resolve(a.out) : mkdtempSync(join(tmpdir(), 'design-lint-'));
  mkdirSync(out, { recursive: true });
  const pw = await playwright(repo);
  await ensureBrowser(pw);
  const server = await serve(repo, cfg, base);
  const browser = await pw.chromium.launch();
  const results = [], used = new Set();
  try {
    for (const page of pagesFrom(cfg, a.page)) {
      const locales = page.locales || cfg.locales || ['en'];
      for (const vp of page.viewports || cfg.viewports || [{ name: 'phone', width: 390, height: 844 }]) {
        for (const locale of locales) {
          const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, locale: locale === 'zh' ? 'zh-CN' : 'en-US' });
          const p = await ctx.newPage();
          const url = new URL(withLocale(page.url, cfg, locale), base).href;
          await p.goto(url, { waitUntil: 'networkidle' });
          await p.evaluate(() => document.fonts && document.fonts.ready);
          const o = await p.evaluate(offscreen, { root: cfg.screen_root });
          const strict = a.strict || !!page.strict;
          const r = await p.evaluate(analyse, { sets, reg, strict, pseudo: a.pseudo, locale, root: cfg.screen_root });
          const shot = join(out, `${page.name.replace(/[^\w.-]+/g, '_')}.${vp.name}.${locale}${a.pseudo ? '.pseudo' : ''}.png`);
          await p.screenshot({ path: shot, fullPage: true });
          const u = await p.evaluate(unreachable, { root: cfg.screen_root });
          const t = await p.evaluate(untappable, { root: cfg.screen_root });
          r.used.forEach(x => used.add(x));
          const seen = new Set();
          const findings = [...r.findings, ...o, ...u, ...t].filter(f => { const k = f.rule + f.el + f.msg; if (seen.has(k)) return false; seen.add(k); return true; });
          results.push({ page: page.name, url, viewport: vp.name, locale, pseudo: a.pseudo, screenshot: shot, findings });
          await ctx.close();
        }
      }
    }
  } finally {
    await browser.close();
    if (server) server.kill();
  }
  const all = results.flatMap(r => r.findings);
  const errors = all.filter(f => f.level === 'error').length;
  const byRule = all.reduce((m, f) => (m[f.rule] = (m[f.rule] || 0) + 1, m), {});
  const report = { errors, warnings: all.length - errors, byRule, components: [...used].sort(), results };
  writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 2));
  if (a.json) console.log(JSON.stringify(report, null, 2));
  else {
    for (const r of results) {
      console.log(`\n${r.page} · ${r.viewport} · ${r.locale}${r.pseudo ? ' · pseudo' : ''} — ${r.findings.length} finding(s)`);
      for (const f of r.findings.slice(0, 40)) console.log(`  ${f.level === 'error' ? 'ERR ' : 'warn'} ${f.rule.padEnd(18)} ${f.el ? f.el + ' — ' : ''}${f.msg}`);
      if (r.findings.length > 40) console.log(`  … ${r.findings.length - 40} more in report.json`);
    }
    console.log(`\ndesign-lint: ${errors} error(s), ${all.length - errors} warning(s) · ${Object.entries(byRule).map(([k, v]) => `${k} ${v}`).join(', ') || 'clean'}`);
    console.log(`report and screenshots: ${out.replace(/\\/g, '/')}`);
  }
  process.exit(errors ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main().catch(e => fail(e.stack || e.message));
