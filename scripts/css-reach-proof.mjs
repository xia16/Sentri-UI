// The proof of scripts/css-reach.mjs against what renders: every component state drawn as check-states draws it (tokens.css,
// bundle.css, bundle.js, then the variant's own head and scripts), and on every one, (1) every class in the rendered DOM is one the
// analyser says the page's markup can carry, and (2) every bundle.css selector that matches the DOM (pseudo-classes and
// pseudo-elements dropped, so it matches more) is one the analyser lets a change of its rule reach this page. Either failing is a
// mismatch: the scope would drop a page a rule can style. Read-only; run by hand after a bundle.js or variant change, and before
// trusting a narrower scope. Exit 0 when nothing mismatches, 1 otherwise.
// Usage: node scripts/css-reach-proof.mjs [--only=Banner,Row] [--json <file>]
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { playwright } from './playwright-path.mjs';
import { routeFonts } from './font-route.mjs';
import { bundleShape } from './bundle-graph.mjs';
import { variantInputs } from './static-reach.mjs';
import { cssUnits, markupWords, canCarry, requiredClasses, unitMayReach, variantTexts, splitList } from './css-reach.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DS = '/ux/design-system', COMPONENTS = 'ux/design-system/components';
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const argv = process.argv.slice(2);
const only = (argv.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const jsonOut = argv.includes('--json') ? argv[argv.indexOf('--json') + 1] : null;
const read = (f) => { try { return fs.readFileSync(path.join(root, f), 'utf8'); } catch { return null; } };

const atlas = JSON.parse(read('atlas/atlas.json'));
const bundleSrc = read(`${COMPONENTS}/bundle.js`), shape = bundleShape(bundleSrc);
const { units, problems } = cssUnits(read(`${COMPONENTS}/bundle.css`));
if (problems.length) { console.log(`bundle.css can't be split: ${problems[0]} (every change reaches every page; nothing to prove)`); process.exit(0); }
const ruleUnits = units.filter((u) => u.kind === 'rule');

const server = http.createServer((req, res) => {
  const f = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': (TYPES[path.extname(f)] || 'application/octet-stream') + '; charset=utf-8' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await playwright().chromium.launch();
const context = await browser.newContext();
await routeFonts(context, root);
const parser = await context.newPage();
await parser.goto(base + DS + '/tokens.css');

// what one state renders: its classes, and the bundle.css selectors that match its DOM
async function render(html, dir) {
  const parts = await parser.evaluate((h) => {
    const d = new DOMParser().parseFromString(h, 'text/html');
    const sts = [...d.querySelectorAll('[data-state]')].filter((x) => !x.parentElement.closest('[data-state]'));
    return { head: [...d.head.querySelectorAll('style, link[rel=stylesheet]')].map((x) => x.outerHTML).join(''), tail: [...d.querySelectorAll('script')].filter((x) => !x.closest('[data-state]')).map((x) => x.outerHTML).join(''), states: sts.map((s) => ({ name: s.getAttribute('data-state'), html: s.outerHTML })) };
  }, html);
  const out = [];
  for (const s of parts.states) {
    const page = await context.newPage();
    await page.setViewportSize({ width: 390, height: 900 });
    const url = `${base}${dir}__proof__.html`;
    const doc = `<!doctype html><html><head><meta charset="utf-8"><base href="${base}${dir}"><link rel="stylesheet" href="${DS}/tokens.css"><link rel="stylesheet" href="${DS}/components/bundle.css"><script src="${DS}/components/bundle.js"></script>${parts.head}<style>html,body{margin:0;overflow:hidden;background:var(--app-background);color:var(--ink);font-family:var(--font-sans)}body{padding:var(--space-16)}</style></head><body>${s.html}${parts.tail}</body></html>`;
    await page.route(url, (r) => r.fulfill({ status: 200, contentType: 'text/html', body: doc }));
    try {
      await page.goto(url, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(60);
      const got = await page.evaluate(() => {
        const classes = new Set();
        for (const e of document.querySelectorAll('[class]')) for (const c of e.classList) classes.add(c);
        const sheet = [...document.styleSheets].find((x) => /\/components\/bundle\.css$/.test(x.href || ''));
        const selectors = new Set();
        const walk = (rules) => { for (const r of rules) { if (r.selectorText) selectors.add(r.selectorText); if (r.cssRules?.length) walk(r.cssRules); } };
        if (sheet) walk(sheet.cssRules);
        return { classes: [...classes], selectors: [...selectors], sheet: !!sheet };
      });
      // each selector of each rule, every pseudo-class and pseudo-element replaced by :where(*), so it matches more, never less
      const strip = (sel) => { let x = sel; for (let p = null; p !== x;) { p = x; x = x.replace(/::?[\w-]+\([^()]*\)/g, '\u0001'); } return x.replace(/::?[\w-]+/g, '\u0001').replace(/\u0001/g, ':where(*)'); };
      const sels = [...new Set(got.selectors.flatMap(splitList))];
      const tested = await page.evaluate((list) => list.map(([sel, s]) => { try { return document.querySelector(s) ? 1 : 0; } catch { return -1; } }), sels.map((sel) => [sel, strip(sel)]));
      out.push({ name: s.name, classes: got.classes, sheet: got.sheet, matched: sels.filter((_, i) => tested[i] === 1), unchecked: sels.filter((_, i) => tested[i] === -1) });
    } catch (e) { out.push({ name: s.name, error: String(e.message).split('\n')[0] }); }
    await page.close();
  }
  return out;
}

const report = { pages: 0, states: 0, mismatches: [], unchecked: 0, uncheckedSelectors: new Set(), precision: [] };
const comps = fs.readdirSync(path.join(root, COMPONENTS), { withFileTypes: true }).filter((d) => d.isDirectory() && fs.existsSync(path.join(root, COMPONENTS, d.name, 'variants'))).map((d) => d.name).sort();
for (const comp of comps) {
  if (only.length && !only.includes(comp)) continue;
  for (const file of fs.readdirSync(path.join(root, COMPONENTS, comp, 'variants')).filter((f) => f.endsWith('.html')).sort()) {
    const variant = file.replace(/\.html$/, ''), f = `${COMPONENTS}/${comp}/variants/${variant}.html`, id = `ds:${comp}/${variant}`;
    const texts = variantTexts({ inputs: variantInputs({ dir: root, atlas }, f), read, shape, bundleSrc });
    report.pages++;
    const states = await render(read(f), `${DS}/components/${comp}/variants/`);
    report.states += states.length;
    if (!texts) { report.precision.push({ page: id, reached: ruleUnits.length, matched: null }); continue; } // every rule reaches it
    const words = markupWords(texts), miss = (m) => report.mismatches.push({ page: id, ...m });
    const matchedAll = new Set();
    for (const st of states) {
      if (st.error) { miss({ state: st.name, why: `did not render: ${st.error}` }); continue; }
      if (!st.sheet) miss({ state: st.name, why: 'bundle.css did not load' });
      for (const c of st.classes) if (!canCarry(words, c)) miss({ state: st.name, why: `class "${c}" is in the DOM but not in the markup the analyser reads` });
      for (const sel of st.matched) { matchedAll.add(sel); const req = requiredClasses(sel); if (req && !req.every((c) => canCarry(words, c))) miss({ state: st.name, why: `selector ${sel} matches but its rule would not reach the page` }); }
      report.unchecked += st.unchecked.length;
      for (const u of st.unchecked) report.uncheckedSelectors.add(u);
    }
    report.precision.push({ page: id, reached: ruleUnits.filter((u) => unitMayReach(u, words)).length, matched: matchedAll.size });
  }
}
await browser.close(); server.close();

const reached = report.precision.map((p) => p.reached), avg = reached.reduce((a, b) => a + b, 0) / Math.max(1, reached.length);
console.log(`${report.pages} component pages, ${report.states} states; ${ruleUnits.length} style rules in bundle.css`);
console.log(`a rule edit may reach a page: ${avg.toFixed(0)} of ${ruleUnits.length} rules per page on average (the analyser); selectors that match its DOM: ${Math.round(report.precision.reduce((a, p) => a + (p.matched || 0), 0) / Math.max(1, report.precision.length))} per page`);
if (report.unchecked) console.log(`${report.uncheckedSelectors.size} selector(s) the browser couldn't test once pseudo-classes were dropped (left out of the proof): ${[...report.uncheckedSelectors].slice(0, 6).join(' | ')}`);
if (report.mismatches.length) { console.log(`MISMATCH  ${report.mismatches.length}:`); for (const m of report.mismatches.slice(0, 40)) console.log(`  ${m.page} [${m.state}]: ${m.why}`); }
else console.log('PASS  every class rendered and every matching selector is attributed to its page');
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(report, null, 2) + '\n');
process.exit(report.mismatches.length ? 1 : 0);
