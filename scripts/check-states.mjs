// Mechanical check of every design-system state, rendered the way the atlas draws it.
// Usage: node scripts/check-states.mjs [baseUrl]     (no argument: serves this repo itself)
// Writes review/state-check.json; exits 1 when any state has a problem.
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PW = process.env.PLAYWRIGHT_DIR || 'C:/Users/ying_/.cache/adam-design/playwright-1.63.0/node_modules/playwright';
const { chromium } = createRequire('C:/Users/ying_/.cache/adam-design/playwright-1.63.0/package.json')(PW);
const DS = '/ux/design-system';
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.md': 'text/plain' };

let server = null, base = process.argv[2];
if (!base) {
  server = http.createServer((req, res) => {
    const f = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': (TYPES[path.extname(f)] || 'application/octet-stream') + '; charset=utf-8' });
    fs.createReadStream(f).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
}
base = base.replace(/\/$/, '');

/* runs inside the rendered state; returns [{check, detail}] */
function audit(stateName) {
  const P = [], add = (check, detail) => P.push({ check, detail });
  const W = 390, st = document.querySelector('[data-state]');
  const cs = (e) => getComputedStyle(e), px = (v) => parseFloat(v) || 0;
  const tag = (e) => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/)[0] : '');
  const txt = (e) => (e.textContent || '').replace(/\s+/g, ' ').trim();
  const all = [st, ...st.querySelectorAll('*')].filter((e) => !['SCRIPT', 'STYLE'].includes(e.tagName));
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && cs(e).visibility !== 'hidden'; };
  const scrolls = (e) => /auto|scroll/.test(cs(e).overflowY);
  const lines = (e) => { const r = document.createRange(); r.selectNodeContents(e); return new Set([...r.getClientRects()].filter((x) => x.width > 0).map((x) => Math.round(x.top / 4))).size; };
  const textRect = (e) => { const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (n.nodeValue.trim()) { const r = document.createRange(); r.selectNodeContents(n); const rs = [...r.getClientRects()].filter((x) => x.width > 0); if (rs.length) return rs[0]; } return null; };
  const lastTextRect = (e) => { const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); let n, last = null; while ((n = w.nextNode())) if (n.nodeValue.trim()) { const r = document.createRange(); r.selectNodeContents(n); const rs = [...r.getClientRects()].filter((x) => x.width > 0); if (rs.length) last = rs[0]; } return last; };
  const bgOf = (c) => { const m = c.backgroundColor.match(/[\d.]+/g) || []; return m.length > 3 ? px(m[3]) > 0 : !/rgba?\(0, 0, 0, 0\)|transparent/.test(c.backgroundColor); };
  const boxBorder = (c) => ['Top', 'Right', 'Bottom', 'Left'].filter((s) => px(c['border' + s + 'Width']) > 0 && c['border' + s + 'Style'] !== 'none').length >= 3;
  const surface = (e) => { const c = cs(e); return bgOf(c) || boxBorder(c) || (c.boxShadow && c.boxShadow !== 'none'); };
  const effBg = (e) => { for (let x = e; x; x = x.parentElement) { const c = cs(x); if (bgOf(c)) return c.backgroundColor; } return ''; };
  const interactive = (e) => e.matches('button,a,input,select,textarea,label,[role=button],[role=radio],[role=option],[role=tab],summary,[tabindex]') || cs(e).cursor === 'pointer';

  // (a) taller than frame / unintended scroll
  const doc = document.documentElement;
  if (doc.scrollWidth > W + 1) add('a', `content is wider than the ${W}px screen (${doc.scrollWidth}px)`);
  for (const e of all) {
    if (e === st && !e.matches('.ph,[data-ds]') && false) continue;
    if (e.matches('textarea,input,select,svg,svg *,img')) continue;
    if (e.scrollHeight > e.clientHeight + 1 && !scrolls(e) && e.clientHeight > 0 && cs(e).display !== 'inline') add('a', `${tag(e)} content ${e.scrollHeight}px is taller than its frame ${e.clientHeight}px`);
  }

  // (b) nested surfaces: ground > item > another wide surface
  const wide = (e) => { const r = e.getBoundingClientRect(); return r.width >= W * 0.5 && r.height >= 40; };
  for (const e of all) {
    if (interactive(e) || !wide(e) || !surface(e) || e.matches('svg,svg *,img')) continue;
    let anc = e.parentElement, parent = null;
    while (anc && anc !== document.body) { if (surface(anc) && wide(anc)) { parent = anc; break; } anc = anc.parentElement; }
    if (!parent) continue;
    const c = cs(e), differs = boxBorder(c) || (c.boxShadow && c.boxShadow !== 'none') || c.backgroundColor !== effBg(parent);
    if (differs) add('b', `${tag(e)} draws a surface inside ${tag(parent)}`);
  }

  // (c) left-edge alignment of body text against the heading, inside a sheet or panel
  for (const box of st.querySelectorAll('[data-ds="Sheet"],.st-sheet,[data-ds="Panel"],.st-panel:not(.st-facts):not(.st-row-group)')) {
    const h = box.querySelector('h1,h2,h3,[class*=sheet-title],[class*=-title]'); if (!h || !vis(h)) continue;
    const hr = textRect(h); if (!hr) continue;
    for (const p of box.querySelectorAll('p,[class*=empty],[class*=note],[class*=hint],[class*=subtitle]')) {
      if (p === h || h.contains(p) || !vis(p) || p.closest('li,button,a,label,.st-row,[class*=field],[class*=footer]')) continue;
      if (p.querySelector('svg,img') || (p.previousElementSibling && p.previousElementSibling.matches('svg,img,[class*=icon]'))) continue;
      const pr = textRect(p); if (pr && Math.abs(pr.left - hr.left) > 2) add('c', `"${txt(p).slice(0, 30)}" starts ${Math.round(pr.left - hr.left)}px from the heading "${txt(h).slice(0, 20)}" left edge`);
    }
  }

  // (d) grid alignment, (e) facts value wraps
  for (const g of st.querySelectorAll('.st-facts,[style*=grid],*')) {
    if (g !== st && !g.matches('.st-facts') && cs(g).display !== 'grid') continue;
    const cells = [...g.children].filter(vis); if (cells.length < 2) continue;
    const isFacts = g.matches('.st-facts');
    if (!isFacts && (cs(g).gridTemplateColumns.split(' ').length < 2 || !cells.every((c) => c.children.length >= 2))) continue;
    const rows = new Map(); for (const c of cells) { const k = Math.round(c.getBoundingClientRect().top); rows.set(k, [...(rows.get(k) || []), c]); }
    for (const row of rows.values()) {
      const vals = row.map((c) => (isFacts ? c.querySelector('dd') : c.lastElementChild)).filter(Boolean);
      const bl = vals.map((v) => lastTextRect(v)).filter(Boolean).map((r) => Math.round(r.bottom - (px(cs(vals[0]).lineHeight) || 0) * 0));
      const tops = vals.map((v) => textRect(v)).filter(Boolean).map((r) => Math.round(r.bottom));
      if (tops.length > 1 && Math.max(...tops) - Math.min(...tops) > 1) add('d', `value baselines differ across columns by ${Math.max(...tops) - Math.min(...tops)}px in "${row.map((c) => txt(c).slice(0, 14)).join('" / "')}"`);
    }
    for (const c of cells) {
      const lab = isFacts ? c.querySelector('dt') : c.firstElementChild;
      if (lab && lines(lab) >= 2) add('d', `label "${txt(lab).slice(0, 30)}" wraps to ${lines(lab)} lines`);
      if (isFacts) { const dd = c.querySelector('dd'); if (dd && lines(dd) > 1) add('e', `Facts value "${txt(dd).slice(0, 30)}" wraps to ${lines(dd)} lines`); }
    }
  }

  // (f) clipped / ellipsised / overflowing text
  for (const e of all) {
    if (e.matches('textarea,input,select,svg,svg *,img') || !vis(e) || cs(e).display === 'inline') continue;
    const direct = [...e.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim()); if (!direct) continue;
    const c = cs(e);
    if (e.scrollWidth > e.clientWidth + 1 && !/auto|scroll/.test(c.overflowX)) add('f', `"${txt(e).slice(0, 30)}" overflows its box (${e.scrollWidth}px in ${e.clientWidth}px${c.textOverflow === 'ellipsis' ? ', ellipsised' : ''})`);
    else if (c.webkitLineClamp && c.webkitLineClamp !== 'none' && e.scrollHeight > e.clientHeight + 1) add('f', `"${txt(e).slice(0, 30)}" is clamped`);
    else if (e.getBoundingClientRect().right > W + 1) add('f', `"${txt(e).slice(0, 30)}" runs past the screen edge`);
  }

  // (g) numeric field in a textarea / resize grip
  for (const e of st.querySelectorAll('textarea,input')) {
    const wrap = e.closest('label,[data-ds="Field"],.st-field') || e.parentElement, label = wrap ? txt(wrap) : '';
    const hint = [label, e.getAttribute('inputmode'), e.name, e.getAttribute('aria-label'), e.placeholder].join(' ');
    const numeric = /numeric|decimal/.test(e.getAttribute('inputmode') || '') || e.type === 'number' || /\b(kg|count|dose|weight|how many|ml|number|quantity)\b/i.test(hint);
    if (!numeric) continue;
    if (e.tagName === 'TEXTAREA') add('g', `numeric field "${label.slice(0, 30)}" is a textarea`);
    if (cs(e).resize !== 'none' && e.tagName === 'TEXTAREA') add('g', `numeric field "${label.slice(0, 30)}" has a resize grip`);
  }

  // (i) touching controls
  const ctl = all.filter((e) => vis(e) && e.matches('button,input,select,textarea,[role=button],[aria-haspopup],[class*=search]') && !e.matches('input[type=hidden],input[type=radio],input[type=checkbox]') && (surface(e) || bgOf(cs(e)) || e.matches('input,select,textarea')) && !e.closest('[data-ds="Segment"],[role=radiogroup],[role=tablist]'));
  const rect = (e) => e.getBoundingClientRect();
  for (let i = 0; i < ctl.length; i++) for (let j = i + 1; j < ctl.length; j++) {
    const a = ctl[i], b = ctl[j]; if (a.contains(b) || b.contains(a)) continue;
    const ra = rect(a), rb = rect(b);
    const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left), oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
    const gapY = Math.max(rb.top - ra.bottom, ra.top - rb.bottom), gapX = Math.max(rb.left - ra.right, ra.left - rb.right);
    if ((ox > 4 && gapY < 8 && gapY > -1) || (oy > 4 && gapX < 8 && gapX > -1)) add('i', `${tag(a)} "${txt(a).slice(0, 14)}" and ${tag(b)} "${txt(b).slice(0, 14)}" are ${Math.round(ox > 4 && gapY < 8 ? gapY : gapX)}px apart`);
  }

  // (j) caption repeated inside the state
  const sn = stateName.trim().toLowerCase();
  for (const e of st.querySelectorAll('h1,h2,h3,h4,b,strong,[class*=title]')) if (txt(e).toLowerCase() === sn && vis(e) && !e.closest('[data-ds="Sheet"],.ph')) add('j', `"${txt(e)}" repeats the cell caption`);

  // (k) composite stacked: trigger plus its sheet content outside a sheet / phone frame
  const inFrame = (e) => e.closest('.ph,[data-ds="Sheet"],.st-sheet,[role=dialog]');
  const trig = [...st.querySelectorAll('[data-ds="PickerField"],[aria-haspopup]')].filter((e) => vis(e) && !inFrame(e));
  const body = [...st.querySelectorAll('[class*=search],[data-ds="ChoiceList"],[class*=sheet-footer],[data-ds="FilterSheet"]')].filter((e) => vis(e) && !inFrame(e) && !e.closest('[data-ds="PickerField"]'));
  if (trig.length && body.length) add('k', `closed trigger ${tag(trig[0])} stacked with sheet content ${tag(body[0])} outside a sheet or phone frame`);
  for (const sh of st.querySelectorAll('[data-ds="Sheet"],.st-sheet')) {
    const g = sh.querySelector('.grab,[class*=handle],[class*=grabber]'); if (!g || !vis(g)) continue;
    const first = [...sh.querySelectorAll('*')].filter((e) => vis(e) && !e.contains(g) && e !== g && !g.contains(e)).sort((x, y) => rect(x).top - rect(y).top)[0];
    if (first && rect(first).top < rect(g).top - 1) add('k', `sheet drag handle is not the first element (${tag(first)} sits above it)`);
  }
  return P;
}

const browser = await chromium.launch();
const results = [];
const comps = fs.readdirSync(path.join(root, 'ux/design-system/components'), { withFileTypes: true }).filter((d) => d.isDirectory() && fs.existsSync(path.join(root, 'ux/design-system/components', d.name, 'variants'))).map((d) => d.name).sort();
const parser = await browser.newPage();
await parser.goto(base + '/ux/design-system/tokens.css');

for (const comp of comps) {
  const vdir = path.join(root, 'ux/design-system/components', comp, 'variants');
  for (const file of fs.readdirSync(vdir).filter((f) => f.endsWith('.html')).sort()) {
    const variant = file.replace(/\.html$/, ''), dir = `${DS}/components/${comp}/variants/`;
    const html = fs.readFileSync(path.join(vdir, file), 'utf8');
    const parts = await parser.evaluate((h) => {
      const d = new DOMParser().parseFromString(h, 'text/html');
      const sts = [...d.querySelectorAll('[data-state]')].filter((x) => !x.parentElement.closest('[data-state]'));
      return {
        head: [...d.head.querySelectorAll('style, link[rel=stylesheet]')].map((x) => x.outerHTML).join(''),
        tail: [...d.querySelectorAll('script')].filter((x) => !x.closest('[data-state]')).map((x) => x.outerHTML).join(''),
        states: sts.map((s) => { const hh = s.querySelector(':scope > h2, :scope > h3'); if (hh && hh.textContent.trim().toLowerCase() === s.getAttribute('data-state').trim().toLowerCase()) hh.remove(); return { name: s.getAttribute('data-state'), html: s.outerHTML }; }),
      };
    }, html);
    for (const s of parts.states) {
      const problems = [];
      const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
      page.on('console', (m) => { if (m.type() === 'error') problems.push({ check: 'h', detail: m.text().slice(0, 160) }); });
      page.on('pageerror', (e) => problems.push({ check: 'h', detail: String(e.message).slice(0, 160) }));
      const url = `${base}${dir}__check__.html`;
      const doc = `<!doctype html><html><head><base href="${base}${dir}"><link rel="stylesheet" href="${DS}/tokens.css"><link rel="stylesheet" href="${DS}/components/bundle.css"><script src="${DS}/components/bundle.js"></script>${parts.head}<style>html,body{margin:0;overflow:hidden;background:var(--app-background);color:var(--ink);font-family:var(--font-sans)}body{padding:var(--space-16)}</style></head><body>${s.html}${parts.tail}</body></html>`;
      await page.route(url, (r) => r.fulfill({ status: 200, contentType: 'text/html', body: doc }));
      try {
        await page.goto(url, { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(() => { // same own-surface rule as the atlas
          const d = document, own = [...d.querySelectorAll('[data-state] *')].slice(0, 12).find((x) => { const c = getComputedStyle(x), r = x.getBoundingClientRect(); return parseFloat(c.borderTopWidth) > 0 && c.borderTopStyle !== 'none' && r.width > d.documentElement.clientWidth * 0.8; });
          if (own) d.body.style.padding = '0';
        });
        await page.setViewportSize({ width: 390, height: Math.max(200, await page.evaluate(() => Math.ceil(document.body.getBoundingClientRect().height))) });
        await page.waitForTimeout(60);
        problems.push(...(await page.evaluate(audit, s.name)));
      } catch (e) { problems.push({ check: 'h', detail: 'render failed: ' + String(e.message).split('\n')[0] }); }
      await page.close();
      const seen = new Set(), uniq = problems.filter((p) => { const k = p.check + p.detail; if (seen.has(k)) return false; seen.add(k); return true; });
      results.push({ component: comp, variant, state: s.name, problems: uniq });
    }
  }
}
await browser.close(); if (server) server.close();

fs.mkdirSync(path.join(root, 'review'), { recursive: true });
fs.writeFileSync(path.join(root, 'review/state-check.json'), JSON.stringify(results, null, 2) + '\n');
const by = {};
for (const r of results) { const c = (by[r.component] ||= { n: 0, bad: 0, checks: {} }); c.n++; if (r.problems.length) { c.bad++; for (const p of r.problems) c.checks[p.check] = (c.checks[p.check] || 0) + 1; } }
console.log('component'.padEnd(18) + 'states'.padStart(7) + 'failing'.padStart(9) + '  top check');
let total = 0;
for (const [k, c] of Object.entries(by)) { total += c.bad; const top = Object.entries(c.checks).sort((a, b) => b[1] - a[1])[0]; console.log(k.padEnd(18) + String(c.n).padStart(7) + String(c.bad).padStart(9) + '  ' + (top ? `(${top[0]}) x${top[1]}` : '-')); }
console.log(`\n${results.length} states, ${total} failing. Details: review/state-check.json`);
process.exit(total ? 1 : 0);
