#!/usr/bin/env node
// The behaviour gate: runs a feature's scenario leaves (features/<feature>/scenarios.json) in a real browser.
// Usage: node scripts/run-scenarios.mjs <feature> [--lang en,zh] [--width 360,390] [--base <url>] [--only <leaf,leaf>]
// Format: docs/design-workflow/scenarios.md. Writes review/scenarios-<feature>.json and screenshots under
// review/scenarios/<feature>/<leaf>/<lang>-<width>/. Exits 1 when any leaf fails.
import { spawn, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire('C:/Users/ying_/.cache/adam-design/playwright-1.63.0/package.json');
const { chromium } = require('C:/Users/ying_/.cache/adam-design/playwright-1.63.0/node_modules/playwright');

// ---- arguments ----
const argv = process.argv.slice(2);
const feature = argv.find((a, i) => !a.startsWith('--') && !(argv[i - 1] || '').startsWith('--'));
if (!feature) { console.error('usage: node scripts/run-scenarios.mjs <feature> [--lang en,zh] [--width 360,390] [--base <url>] [--only a,b]'); process.exit(2); }
const opt = (k) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : null; };
const specPath = join(root, 'features', feature, 'scenarios.json');
if (!existsSync(specPath)) { console.error(`no ${relative(root, specPath)}`); process.exit(2); }
const spec = JSON.parse(readFileSync(specPath, 'utf8'));
const D = spec.defaults || {};
const langs = (opt('lang') || (D.langs || ['en']).join(',')).split(',').filter(Boolean);
const widths = (opt('width') || (D.widths || [390]).join(',')).split(',').map(Number).filter(Boolean);
const only = opt('only') ? new Set(opt('only').split(',')) : null;
const verbs = JSON.parse(readFileSync(join(root, 'ux/laws/strings.json'), 'utf8')).verbs || {};
const HARD = ['wrong-fact', 'lost-draft', 'dead-end', 'unreachable-control', 'broken-ruling'];

// ---- the tree: walk it into executable leaves ----
// A leaf's run = the fixture of its nearest `state` ancestor + the taps of every `action` between them + its own taps.
const leaves = [], nodeCount = {}, problems = [], ids = new Set();
(function walk(node, path) {
  nodeCount[node.type] = (nodeCount[node.type] || 0) + 1;
  if (node.id) { if (ids.has(node.id)) problems.push(`duplicate id ${node.id}`); ids.add(node.id); }
  const here = [...path, node];
  if (node.type === 'outcome' || node.type === 'decision-blocker') {
    const state = [...here].reverse().find((n) => n.type === 'state');
    const from = state ? here.slice(here.indexOf(state) + 1) : here;
    const branch = here.find((n) => n.type === 'entry');
    const taps = from.flatMap((n) => n.taps || []);
    if (node.type === 'outcome' && !(node.authority || []).length) problems.push(`${node.id}: an outcome needs authority (else it is a decision-blocker)`);
    if (node.type === 'outcome' && node.status !== 'pending' && !state) problems.push(`${node.id}: no state (reset fixture) above it`);
    leaves.push({ node, branch: branch?.id, state, taps, path: here.map((n) => n.id).filter(Boolean) });
  }
  for (const c of node.children || []) walk(c, here);
})({ type: 'root', children: spec.tree }, []);
if (problems.length) { console.error(problems.join('\n')); process.exit(2); }

// ---- server ----
const freePort = () => new Promise((res) => { const s = createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => res(p)); }); });
let server = null, base = opt('base');
if (!base) {
  const port = await freePort();
  server = spawn(process.execPath, [join(root, 'scripts/serve-ux.cjs'), String(port)], { cwd: root, stdio: 'ignore' });
  process.on('exit', () => server.kill());
  for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => process.exit(130));
  base = `http://localhost:${port}`;
  for (let i = 0; i < 50; i++) { try { await fetch(base + '/atlas/atlas.json'); break; } catch { await new Promise((r) => setTimeout(r, 100)); } }
}
base = base.replace(/\/$/, '');
let commit = 'unknown', dirty = false;
try { commit = execSync('git rev-parse HEAD', { cwd: root }).toString().trim(); dirty = !!execSync('git status --porcelain --untracked-files=no', { cwd: root }).toString().trim(); } catch {}

// ---- in-page helpers (atlas-bare's step finder, ported; plus the checks) ----
const PAGE_HELPERS = String.raw`
window.__scen = (() => {
  const shown = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) && getComputedStyle(el).visibility !== 'hidden';
  const norm = (t) => (t || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const TAPPABLE = 'button,a,[data-action],[role=button],label,summary,[tabindex],input,select,textarea';
  function phone() { return document.querySelector('.atlas-phone') || document.querySelector('[data-card="0"] .phone') || document.querySelector('.phone, section.device, .tk-phone') || document.body; }
  function top(ph) {   // the topmost open sheet/dialog in the phone, else the phone
    const list = [...ph.querySelectorAll('.sheet, [role=dialog]')].filter(shown);
    return list.length ? list[list.length - 1] : ph;
  }
  function scope(where) { const ph = phone(); return where === 'sheet' ? top(ph) : where && where !== 'phone' ? ph.querySelector(where) : ph; }
  function findStep(rootEl, key) {
    const k = String(key), want = norm(k); let el, list, i;
    if (/^[\[.#]/.test(k)) { list = rootEl.querySelectorAll(k); for (i = list.length - 1; i >= 0; i--) if (shown(list[i])) return list[i]; return null; }
    const all = [...rootEl.querySelectorAll('*')].filter(shown); let best = null;
    for (el of all) if (norm(el.textContent) === want && (!best || best.contains(el))) best = el;
    if (best) { const t = best.closest(TAPPABLE); return t && rootEl.contains(t) ? t : best; }
    for (el of all) if (el.matches(TAPPABLE) && norm(el.textContent).indexOf(want) === 0 && (!best || best.contains(el))) best = el;
    if (best) return best;
    for (el of all) if (norm(el.getAttribute('aria-label')) === want || norm(el.getAttribute('title')) === want) return el;
    return null;
  }
  function find(key) {   // the top sheet first (a drawer covers the room behind it), then the phone, then same-origin iframes
    const ph = phone(), t = top(ph);
    let el = (t !== ph && findStep(t, key)) || findStep(ph, key);
    if (el) return el;
    for (const fr of ph.querySelectorAll('iframe')) { let d = null; try { d = fr.contentDocument; } catch (e) {} if (d && d.body && (el = findStep(d.body, key))) return el; }
    return null;
  }
  function hasText(where, text) {
    const s = scope(where); if (!s) return false;
    const want = norm(text);
    const walker = document.createTreeWalker(s, NodeFilter.SHOW_ELEMENT);
    for (let n = walker.currentNode; n; n = walker.nextNode()) if (shown(n) && norm(n.innerText).includes(want)) {
      // the smallest element that holds it must be visible
      const kids = [...n.children].filter((c) => shown(c) && norm(c.innerText).includes(want));
      if (!kids.length) return true;
    }
    return false;
  }
  function elState(where, sel) {
    const s = scope(where); if (!s) return 'absent';
    const el = [...s.querySelectorAll(sel)].filter(shown).pop();
    if (!el) return 'absent';
    return el.disabled || el.getAttribute('aria-disabled') === 'true' ? 'disabled' : 'enabled';
  }
  function clipped(width) {   // text that is cut off: past the phone's right edge, or hidden by its own box
    const ph = phone(), pr = ph.getBoundingClientRect(), out = [];
    for (const el of ph.querySelectorAll('*')) {
      if (!shown(el) || el.closest('[aria-hidden=true],[inert],.page-background,iframe,svg')) continue;
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!own) continue;
      const r = el.getBoundingClientRect(); if (r.width === 0 || r.bottom < pr.top || r.top > pr.bottom) continue;
      let scroller = el.parentElement, inScroll = false;
      while (scroller && scroller !== ph) { const ox = getComputedStyle(scroller).overflowX; if (ox === 'auto' || ox === 'scroll') { inScroll = true; break; } scroller = scroller.parentElement; }
      if (inScroll) continue;
      const cs = getComputedStyle(el);
      const cut = r.right > pr.left + width + 1 || r.left < pr.left - 1 || ((cs.overflow === 'hidden' || cs.overflowX === 'hidden' || cs.textOverflow === 'ellipsis') && el.scrollWidth > el.clientWidth + 1);
      if (cut) out.push((el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40) + ' <' + el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : '') + '>');
      if (out.length >= 6) break;
    }
    return out;
  }
  function record(expr) {
    const F = window.FarrowingStudy || {}, s = F.states && F.states[0], c = F.room ? F.room(0) : null;
    const sum = (a) => a.reduce((x, y) => x + y, 0);
    return new Function('s', 'c', 'F', 'sum', 'return (' + expr + ');')(s, c, F, sum);
  }
  return { find, hasText, elState, clipped, record, current: () => (window.AtlasBare && window.AtlasBare.current ? window.AtlasBare.current() : null), lang: () => document.documentElement.lang };
})();`;

const textOf = (a, lang) => {
  if (a.verb) { const v = verbs[a.verb]; if (!v) return { err: `verb "${a.verb}" is not in ux/laws/strings.json` }; return { text: lang === 'zh' ? v.zh : a.verb }; }
  if (typeof a.text === 'string') return lang === 'en' ? { text: a.text } : { skip: `no ${lang} copy given` };
  if (a.text && typeof a.text === 'object') return a.text[lang] ? { text: a.text[lang] } : { skip: `no ${lang} copy given` };
  return null;
};

async function checkOne(page, a, lang, width) {
  // returns null when it holds, else { got }
  await ensureHelpers(page);
  if ('expr' in a) {
    let got; try { got = await page.evaluate((e) => window.__scen.record(e), a.expr); } catch (e) { return { got: 'error: ' + e.message.split('\n')[0] }; }
    return got === true ? null : { got: JSON.stringify(got) };
  }
  if (a.screen) { const got = await page.evaluate(() => window.__scen.current()); return got === a.screen ? null : { got: String(got) }; }
  if (a.el) {
    const got = await page.evaluate(([w, s]) => window.__scen.elState(w, s), [a.in || 'phone', a.el]);
    const want = a.is || 'present';
    const ok = want === 'present' ? got !== 'absent' : got === want;
    return ok ? null : { got };
  }
  if (a.noClip) { const got = await page.evaluate((w) => window.__scen.clipped(w), width); return got.length ? { got: got.join(' | ') } : null; }
  const t = textOf(a, lang);
  if (t?.err) return { got: t.err };
  if (t?.skip) return { skipped: t.skip };
  if (t) {
    const has = await page.evaluate(([w, x]) => window.__scen.hasText(w, x), [a.in || 'phone', t.text]);
    return has === !a.absent ? null : { got: has ? 'present' : 'absent', want: t.text };
  }
  return { got: 'unknown assertion ' + JSON.stringify(a) };
}
async function ensureHelpers(page) { if (!(await page.evaluate(() => !!window.__scen).catch(() => false))) await page.evaluate(PAGE_HELPERS); }
const describe = (a) => a.says || (a.expr ? a.expr : a.verb ? `"${a.verb}" ${a.absent ? 'absent' : 'shown'}` : a.el ? `${a.el} ${a.is || 'present'}` : a.screen ? `on ${a.screen}` : a.noClip ? 'nothing clipped' : `"${typeof a.text === 'string' ? a.text : a.text?.en}" ${a.absent ? 'absent' : 'shown'}`);

async function settle(page) {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))).catch(() => {});
  await page.waitForTimeout(120);
}

async function tap(page, step) {
  const key = typeof step === 'string' ? step : step.tap;
  await ensureHelpers(page);
  const handle = await page.evaluateHandle((k) => window.__scen.find(k), key);
  const el = handle.asElement();
  if (!el) return `control not found: ${key}`;
  try {
    if (step.hold) {
      await el.scrollIntoViewIfNeeded({ timeout: 2000 });
      const box = await el.boundingBox();
      if (!box) return `control has no box: ${key}`;
      // the press must land on the control itself, not on whatever covers it
      const hit = await el.evaluate((n, [x, y]) => { const t = n.ownerDocument.elementFromPoint(x, y); return !!t && (n === t || n.contains(t)); }, [box.x + box.width / 2, box.y + box.height / 2]);
      if (!hit) return `control is covered: ${key}`;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down(); await page.waitForTimeout(step.hold); await page.mouse.up();
    } else {
      await el.click({ timeout: 2500 });
    }
  } catch (e) { return `control not tappable: ${key} (${e.message.split('\n')[0]})`; }
  await settle(page);
  return null;
}

const slug = (s) => String(typeof s === 'string' ? s : s.tap || s.fill || s.says || 'check').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 32) || 'step';

async function runLeaf(browser, leaf, lang, width) {
  const n = leaf.node, st = leaf.state, fx = st.fixture || {};
  const dir = join(root, 'review', 'scenarios', feature, n.id, `${lang}-${width}`);
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const evidence = [], failures = [], skipped = [], notes = [];
  const context = await browser.newContext({ viewport: { width, height: D.height || 844 }, deviceScaleFactor: 1, locale: lang === 'zh' ? 'zh-CN' : 'en-GB' });
  // the phone is drawn at the run's width (atlas-bare pins it to 390; the runner overrides that, nothing in the page changes)
  await context.addInitScript((w) => {
    const css = `html.atlas-bare,html.atlas-bare body{width:${w}px!important}html.atlas-bare .atlas-phone{width:${w}px!important}`;
    const add = () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); };
    if (document.head) add(); else document.addEventListener('DOMContentLoaded', add);
  }, width);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && /atlas-bare: step not found/.test(m.text())) errors.push(m.text()); });
  const clock = n.clock || st.clock || D.clock;
  if (clock) await page.clock.install({ time: new Date(clock) });
  let i = 0;
  const shot = async (label) => { const f = join(dir, `${String(i++).padStart(2, '0')}-${slug(label)}.png`); await page.screenshot({ path: f }).catch(() => {}); evidence.push(relative(root, f).replace(/\\/g, '/')); };
  const fail = (what, got, tag, at) => failures.push({ what, got, tag: tag || null, at });
  try {
    const url = new URL(base + (fx.url || D.url));
    if (fx.screen) url.searchParams.set('screen', fx.screen);
    for (const [k, v] of Object.entries(fx.params || {})) url.searchParams.set(k, v);
    if (lang !== 'en') url.searchParams.set('lang', lang);
    await page.goto(url.href);
    if (fx.screen) await page.waitForSelector('html.atlas-ready', { timeout: 8000 });
    await settle(page);
    if (fx.preset) {   // the reset fixture: the prototype's own deterministic seed for this preset
      const ok = await page.evaluate((p) => { const sel = document.querySelector('select.scenario'); if (!sel || ![...sel.options].some((o) => o.value === p)) return false; if (sel.value !== p) { sel.value = p; sel.dispatchEvent(new Event('change', { bubbles: true })); } return true; }, fx.preset);
      if (!ok) throw new Error(`preset "${fx.preset}" is not in the page`);
      await settle(page);
    }
    for (const t of fx.taps || []) { const e = await tap(page, t); if (e) throw new Error('fixture: ' + e); }
    await ensureHelpers(page);
    if (lang !== 'en') {   // the locale probe: does the page render this language at all?
      const back = verbs.Back?.[lang];
      const ok = back && await page.evaluate((x) => window.__scen.hasText('phone', x), back);
      if (!ok) notes.push(`no ${lang} rendering: ?lang=${lang} is ignored (no "${back}")`);
    }
    await shot('start');
    for (const step of leaf.taps) {
      if (step.expect) {
        for (const a of [].concat(step.expect)) { const r = await checkOne(page, a, lang, width); if (r?.skipped) skipped.push(describe(a)); else if (r) fail(describe(a), r.got, a.hard, `after step ${i - 1}`); }
        continue;
      }
      if (step.fill) { await ensureHelpers(page); await page.locator(step.fill).last().fill(String(step.value)); await settle(page); await shot('fill-' + step.fill); continue; }
      if (step.wait) { await page.waitForTimeout(step.wait); continue; }
      if (step.reload) {   // an interruption: the app is closed and opened again on the same device
        await page.reload(); if (fx.screen) await page.waitForSelector('html.atlas-ready', { timeout: 8000 });
        await settle(page); await shot('reload'); continue;
      }
      const e = await tap(page, step);
      await shot(step);
      if (e) { fail(`tap ${typeof step === 'string' ? step : step.tap}`, e, step.hard || 'unreachable-control', `step ${i - 1}`); break; }
    }
    if (!failures.some((f) => f.what.startsWith('tap '))) {
      for (const a of n.visible || []) { const r = await checkOne(page, a, lang, width); if (r?.skipped) skipped.push(describe(a)); else if (r) fail(describe(a), r.got, a.hard); }
      for (const a of n.record || []) { const r = await checkOne(page, a, lang, width); if (r) fail(describe(a), r.got, a.hard); }
      if (n.clip !== false && D.clipCheck !== false) { const r = await checkOne(page, { noClip: true }, lang, width); if (r) fail('nothing clipped', r.got, null); }
    }
    for (const e of errors) fail('no page errors', e, null);
  } catch (e) {
    fail('run', e.message.split('\n')[0], 'dead-end'); await shot('error');
  }
  await context.close();
  let result = failures.length ? 'fail' : 'pass';
  if (notes.length && result === 'pass') result = 'blocked';   // the screens can't run in this language: never counted as covered
  return { lang, width, result, failures, skipped, notes, evidence };
}

// ---- run ----
const browser = await chromium.launch();
const out = [];
for (const leaf of leaves) {
  const n = leaf.node;
  if (only && !only.has(n.id)) continue;
  const row = { id: n.id, tree: n.tree || null, branch: leaf.branch, label: n.label, path: leaf.path, authority: n.authority || [], result: null, hard: [], runs: [] };
  if (n.type === 'decision-blocker') { row.result = 'blocked'; row.question = n.question; row.sources = n.sources; out.push(row); console.log(`blocked  ${n.id}  ${n.question || ''}`); continue; }
  if (n.status === 'pending') { row.result = 'pending'; row.why = n.why || ''; out.push(row); console.log(`pending  ${n.id}`); continue; }
  for (const lang of n.langs || langs) for (const width of n.widths || widths) row.runs.push(await runLeaf(browser, leaf, lang, width));
  row.result = row.runs.some((r) => r.result === 'fail') ? 'fail' : row.runs.some((r) => r.result === 'blocked') ? 'blocked' : 'pass';
  row.hard = [...new Set(row.runs.flatMap((r) => r.failures.map((f) => f.tag)).filter((t) => HARD.includes(t)))];
  out.push(row);
  const first = row.runs.flatMap((r) => r.failures.map((f) => `${r.lang}-${r.width}: ${f.what} → ${f.got}`))[0] || '';
  console.log(`${row.result.padEnd(8)} ${n.id}${row.hard.length ? '  [' + row.hard.join(', ') + ']' : ''}${first ? '  ' + first.slice(0, 160) : ''}`);
}
await browser.close();
if (server) server.kill();

const count = (r) => out.filter((x) => x.result === r).length;
const byBranch = {};
for (const x of out) { const b = byBranch[x.branch] || (byBranch[x.branch] = { pass: 0, fail: 0, blocked: 0, pending: 0 }); b[x.result]++; }
const report = {
  feature, commit, dirty, ran: new Date().toISOString(), base, langs, widths,
  nodes: nodeCount, summary: { pass: count('pass'), fail: count('fail'), blocked: count('blocked'), pending: count('pending') }, byBranch,
  hardFailures: out.filter((x) => x.hard.length).map((x) => ({ id: x.id, hard: x.hard })),
  leaves: out,
};
const reportPath = join(root, 'review', `scenarios-${feature}.json`);
if (!only) writeFileSync(reportPath, JSON.stringify(report, null, 1) + '\n');
console.log(`\n${feature} @ ${commit.slice(0, 7)}${dirty ? ' (dirty)' : ''}: pass ${report.summary.pass} · fail ${report.summary.fail} · blocked ${report.summary.blocked} · pending ${report.summary.pending}${only ? '' : '  → ' + relative(root, reportPath)}`);
process.exit(report.summary.fail ? 1 : 0);
