// Mockups for the Count round: open the real prototypes' bare screens at 390 and swap in the proposed content, built with the
// design system's own helpers (SentriUI.*) so tokens and bundle.css parts are the real ones. Nothing here changes a prototype.
// Usage (from the repo root): node features/count/mock/mock.mjs <out dir>
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
const { playwright } = await import(pathToFileURL(path.join(root, 'scripts/playwright-path.mjs')).href);
const { chromium } = playwright();
const out = process.argv[2] || 'features/count/mock';
const only = process.argv[3] ? process.argv[3].split(',') : null;
fs.mkdirSync(out, { recursive: true });
const port = 4751;
const server = spawn(process.execPath, [path.join(root, 'scripts/serve-ux.cjs'), String(port)], { cwd: root, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 600));
const b = await chromium.launch();

// A tally glyph for Count (a proposed icon-registry addition: nothing in the registry draws a count yet).
const TALLY = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 5v14M10 5v14M14 5v14M18 5v14M3.5 15.5l17-7"></path></svg>';
const INSPECT = `http://localhost:${port}/ux/system/inspection-astra-concept.html?layout=focus`;

async function open(url, screen, steps = []) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(`${url}&screen=${screen}`);
  await p.waitForSelector('html.atlas-ready', { timeout: 15000 });
  for (const s of steps) { await p.locator(s).first().click(); await p.waitForTimeout(900); }
  return p;
}
async function shoot(p, name) { await p.waitForTimeout(500); await p.screenshot({ path: path.join(out, name) }); await p.close(); }
const want = (n) => !only || only.some((o) => n.includes(o));

// Shared page-building code, run inside the page: a Count page as a Sheet page, rows and cards from SentriUI.
const LIB = `
  window.M = (() => {
    const U = window.SentriUI, ic = (k) => window.SentriIcons.icon(k);
    const check = (id, ctx, on, extra = '') => U.rowSelectDoor({ code: id, description: ctx, contextWidth: '112px', checked: on, value: id, action: '', openAction: 'pig', openValue: id,
      className: 'inspect-pig roster-pig' + (on ? ' selected' : '') + extra, label: id, ...(arguments[4] || {}) });
    const card = (pen, small, rows, trail = '') => '<section class="inspect-pen m-card" data-pen="' + pen + '"><header class="inspect-pen-head"><span class="pen-name"><strong>' + pen + '</strong><small>· ' + small + '</small></span>' + (trail ? '<span class="m-trail">' + trail + '</span>' : '') + '</header>' + rows + '</section>';
    const page = (title, line, body, footer, above = '') => {
      const sec = document.querySelector('.phone > .sheet, .phone .sheet.feature-page, .phone .sheet');
      const bar = document.querySelector('.phone .statusbar')?.outerHTML || '';
      const html = U.sheet({ variant: 'page', title, line, back: { action: 'x' }, above, body, footer, className: 'm-count', label: title, bar });
      const phone = document.querySelector('.phone');
      phone.innerHTML = html;
    };
    const footer = (left, primary) => '<div class="sheet-footer" data-ds="Sheet">' + left + primary + '</div>';
    const primary = (label) => U.button({ label, register: 'primary', action: 'x' });
    return { U, ic, check, card, page, footer, primary };
  })();
`;
const CSS = `
  .m-count .m-bar{padding:0 16px 14px}
  .m-count .m-list{padding:0}
  .m-count .st-heading{margin-top:16px}
  .m-receipt .st-row-group{margin-bottom:8px}
  .m-receipt .m-hint{margin-top:12px}
  .m-count .inspect-pen-head{display:flex;align-items:center}
  .m-count .m-trail{margin-left:auto;font-size:13px;color:var(--ink-2,#5b625d);font-variant-numeric:tabular-nums}
  .m-count .m-trail.m-short{color:var(--ink,#1d221e);font-weight:600}
  .m-count .sheet-body>*{flex-shrink:0}
  .m-count .m-card{margin-bottom:12px}
  .m-count .m-hint{margin:2px 2px 12px;font-size:13px;color:var(--ink-2,#5b625d)}
  .m-count .m-hint b{color:var(--ink,#1d221e);font-weight:600}
  .m-count .m-evidence .st-row-trailing,.m-count .m-figure{font-family:var(--font-mono,'IBM Plex Mono',monospace);font-size:16px;color:var(--ink,#1d221e)}
  .m-count .m-total .st-row-title{font-weight:600}
  .m-count .m-total .st-row-trailing{font-weight:700}
  .m-count .m-diff{margin:8px 2px 0;font-size:14px;color:var(--ink,#1d221e)}
  .m-count .m-diff span{color:var(--ink-2,#5b625d)}
  .m-count .feature-section{margin-bottom:16px}
  .m-count .m-found .st-animal-context{color:var(--ink,#1d221e)}
  .m-count .sheet-footer .m-left{display:flex;flex-direction:column;justify-content:center;font-size:14px;color:var(--ink,#1d221e);min-width:0;flex:1}
  .m-count .sheet-footer .m-left small{font-size:13px;color:var(--ink-2,#5b625d)}
  .m-count .sheet-footer .button.primary{flex:1.3}
`;
async function prep(p) {
  await p.evaluate(({ LIB, CSS }) => { eval(LIB); const st = document.createElement('style'); st.textContent = CSS; document.head.append(st); }, { LIB, CSS });
}

// 1. Entry, one pen: the pen page gains Count beside Note, Feed, Observe, Fault, Tick all (six tiles: 3 + 3, the row grid rule).
if (want('1-')) {
  const p = await open(INSPECT, 'inspection.pen', []);
  // inspection.pen opens C1; go back to the walk and open D4, the mixed pen (2 with ear tags, 14 without).
  await p.evaluate(() => document.querySelector('[data-action="pen-detail"][data-value="D4"]') || null);
  await p.goto(`${INSPECT}&screen=inspection.walk`); await p.waitForSelector('html.atlas-ready');
  await p.locator('[data-action="pen-detail"][data-value="D4"]').first().click(); await p.waitForTimeout(900);
  await p.evaluate((TALLY) => {
    const U = window.SentriUI, I = (k) => window.SentriIcons.icon(k);
    const grid = document.querySelector('.st-row-grid');
    const tiles = [...grid.querySelectorAll('[data-action]')].map((t) => ({ label: t.querySelector('.st-row-tile-label')?.textContent, icon: t.querySelector('.st-row-tile-icon')?.innerHTML, action: t.dataset.action, value: t.dataset.value }));
    tiles.splice(4, 0, { label: 'Count', icon: TALLY, action: 'count', value: 'D4' });
    grid.outerHTML = U.rowGrid(tiles, { label: 'Pen actions' });
    // The Now card says when the pen was last counted, under its pig figure.
    for (const f of document.querySelectorAll('.st-facts [class*="meta"], .facts-meta, .st-fact-meta')) if (/without tags/.test(f.textContent)) f.textContent = '14 without tags · counted Oct 28';
  }, TALLY);
  await shoot(p, 'mock-1-pen-entry.png');
}

// 2. Entry, a room: the unit's card on Home gains Count pigs under Inspect unit, with when the unit was last counted.
if (want('2-')) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(`http://localhost:${port}/ux/system/home-astra-prototype.html?section=gestation&view=unit&unit=7&screen=workbench.unit`);
  await p.waitForSelector('html.atlas-ready', { timeout: 15000 });
  await p.evaluate((TALLY) => {
    const env = document.querySelector('.unit-hub-environment');
    const row = env.cloneNode(true);
    row.classList.add('unit-hub-count'); row.setAttribute('aria-label', 'Count pigs in Unit 7');
    const arrow = [...env.querySelectorAll('.unit-environment-bottom svg')].pop()?.outerHTML || '';
    row.innerHTML = `<span class="unit-environment-label">Count pigs</span><span class="unit-environment-bottom"><span class="unit-device-count">Last counted Oct 21 · G.H</span>${arrow}</span>`;
    env.before(row);
    const st = document.createElement('style');
    st.textContent = '.unit-hub-count svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round}';
    document.head.append(st);
  }, TALLY);
  await shoot(p, 'mock-2-unit-entry.png');
}

// 3. Count one pen, by number (and the two with ear tags by scan): Pen D4.
for (const [name, counted] of [['mock-3-count-pen.png', 12], ['mock-3b-count-pen-match.png', 14]]) {
  if (!want(name.slice(5, 7))) continue;
  const p = await open(INSPECT, 'inspection.walk');
  await prep(p);
  await p.evaluate(({ counted }) => {
    const { U, ic, card, page, footer, primary } = window.M;
    const expected = 14, diff = counted - expected;
    const scan = U.scanBar({ state: 'scanning', device: 'Reader 1', stop: { action: 'x' } });
    const tagged = '<section class="feature-section inspect-list m-list">' + U.heading({ title: 'With ear tags · 2 of 2 seen', icon: ic('tag'), kind: 'section', level: 3 }) + U.rowGroup(
      U.rowSelectDoor({ code: '000801', description: 'Grower · 63d', contextWidth: '112px', checked: true, value: '000801', action: '', openAction: 'pig', openValue: '000801', className: 'inspect-pig roster-pig selected', label: '000801', right: { kind: 'tags', tags: [] } })
      + U.rowSelectDoor({ code: '000802', description: 'Grower · 63d', contextWidth: '112px', checked: true, value: '000802', action: '', openAction: 'pig', openValue: '000802', className: 'inspect-pig roster-pig selected', label: '000802', right: { kind: 'tags', tags: [] } })) + '</section>';
    const stepper = U.stepper({ variant: 'well', label: 'Pigs without ear tags', value: counted, min: 0, max: 60, action: 'x', reserveHint: false });
    const result = diff === 0 ? '<p class="m-diff">Matches the record.</p>'
      : `<p class="m-diff"><strong>${Math.abs(diff)} ${diff < 0 ? 'fewer' : 'more'} than the record.</strong> <span>Saved as ${Math.abs(diff)} unaccounted in batch 25.</span></p>`;
    const line = (title, description, figure, strong) => U.row({ title, description, trailing: figure, className: strong ? 'm-total' : '' });
    const evidence = U.heading({ title: 'Since the last count', icon: ic('record'), kind: 'section', level: 3 })
      + U.rowGroup(line('Counted', 'Oct 28 · 08:10 · G.H', '18')
        + line('Moved to D6', 'Oct 30 · 14:20 · M.L', '−3')
        + line('Died', 'Yesterday · 07:05 · G.H', '−1')
        + line('Should be here now', '', String(expected), true), { className: 'm-evidence' });
    const body = `<section class="feature-section">${stepper}${result}</section>${tagged}<section class="feature-section">${evidence}</section>`;
    page('Count pigs', 'Pen D4 · Unit 7', body, footer(U.backButton({ action: 'x' }), primary('Save count')), `<div class="m-bar">${scan}</div>`);
  }, { counted });
  await shoot(p, name);
}

// 4. Count a room by scan: Unit 7. Every read ticks the pig in her pen; a pig recorded elsewhere joins the pen scanned just before;
//    the group rows take a number. The footer keeps the tally.
if (want('4-')) {
  const p = await open(INSPECT, 'inspection.walk');
  await prep(p);
  await p.evaluate(() => {
    const { U, card, page, footer, primary } = window.M;
    const pig = (id, ctx, on, extra = {}) => U.rowSelectDoor({ code: id, description: ctx, contextWidth: '112px', right: extra.right || { kind: 'tags', tags: [] }, checked: on, value: id, action: '', openAction: 'pig', openValue: id, className: 'inspect-pig roster-pig' + (on ? ' selected' : '') + (extra.cls || ''), label: id });
    const scan = U.scanBar({ state: 'scanning', device: 'Reader 1', stop: { action: 'x' } });
    const hint = '<p class="m-hint"><b>Count</b> · scan every pig, type how many have no ear tag. Pens you skip stay as they are.</p>';
    const c1 = card('C1', '3 pigs', pig('000254', 'Gestation · 40d', true) + pig('000267', 'Gestation · 42d', true) + pig('000281', 'Gestation · 46d', false), '2 of 3');
    const c2 = card('C2', '3 pigs', pig('000306', 'Gestation', true) + pig('000312', 'Gestation · 35d', true) + pig('000512', 'Was Unit 9 · C3', true, { cls: ' m-found', right: { kind: 'state', word: 'Moves here', level: 'live' } }), '3 of 2');
    const group = U.rowSelectDoor({ code: '14 pigs', lead: 'tag-off', contextWidth: '112px', right: { kind: 'tags', tags: [] }, className: 'inspect-pig roster-pig selected', label: '14 without ear tags, pen D4', action: '', checked: true, value: 'notags-D4', openAction: 'x', openValue: 'D4', count: { value: 12, idle: false } });
    const d4 = card('D4', '16 pigs', pig('000801', 'Grower · 63d', true) + pig('000802', 'Grower · 63d', true) + group, '14 of 16');
    const d5 = card('D5', '38 pigs', U.rowSelectDoor({ code: '38 pigs', lead: 'tag-off', contextWidth: '112px', right: { kind: 'tags', tags: [] }, className: 'inspect-pig roster-pig', label: '38 without ear tags, pen D5', action: '', checked: false, value: 'notags-D5', openAction: 'x', openValue: 'D5', count: { value: 38, idle: true } }), 'Not counted');
    const body = '<div class="inspect-list m-list">' + hint + c1 + c2 + d4 + d5 + '</div>';
    const left = '<div class="m-left"><strong>3 of 4 pens</strong><small>1 not seen yet</small></div>';
    page('Count pigs', 'Unit 7', body, footer(left, primary('Save count')), `<div class="m-bar">${scan}</div>`);
    for (const t of document.querySelectorAll('.m-trail')) if (/3 of 2/.test(t.textContent)) { t.textContent = '+1 here'; t.classList.add('m-short'); }
  });
  await p.waitForTimeout(400); await p.screenshot({ path: path.join(out, 'mock-4-count-room.png') });
  await p.evaluate(() => { const s = document.querySelector('.phone .sheet-body'); if (s) s.scrollTop = 330; });
  await shoot(p, 'mock-4c-count-room-scrolled.png');
}

// 4b. An unknown tag read during the count: the shared scan toast, the count goes on.
if (want('4b')) {
  const p = await open(INSPECT, 'inspection.walk');
  await prep(p);
  await p.evaluate(() => {
    const { U, card, page, footer, primary } = window.M;
    const pig = (id, ctx, on) => U.rowSelectDoor({ code: id, description: ctx, contextWidth: '112px', right: { kind: 'tags', tags: [] }, checked: on, value: id, action: '', openAction: 'pig', openValue: id, className: 'inspect-pig roster-pig' + (on ? ' selected' : ''), label: id });
    const scan = U.scanBar({ state: 'scanning', device: 'Reader 1', stop: { action: 'x' } });
    const c1 = '<div class="inspect-list m-list">' + card('C1', '3 pigs', pig('000254', 'Gestation · 40d', true) + pig('000267', 'Gestation · 42d', true) + pig('000281', 'Gestation · 46d', false), '2 of 3') + '</div>';
    const toast = U.toast('No pig with this tag', { detail: '000999 · Left out of the count', dismiss: { action: 'x' }, door: { action: 'x', label: 'Open' } });
    page('Count pigs', 'Unit 7', '<p class="m-hint"><b>Count</b> · scan every pig, type how many have no ear tag. Pens you skip stay as they are.</p>' + c1 + `<div class="m-toast-host">${toast}</div>`, footer('<div class="m-left"><strong>1 of 4 pens</strong><small>1 not seen yet</small></div>', primary('Save count')), `<div class="m-bar">${scan}</div>`);
    const st = document.createElement('style'); st.textContent = '.m-toast-host{position:absolute;left:16px;right:16px;bottom:104px}.m-toast-host>*{position:static!important;transform:none!important;opacity:1!important}';
    document.head.append(st);
  });
  await shoot(p, 'mock-4b-count-unknown-tag.png');
}

// 5. Saved: a receipt drawer over the room with only what changed or needs eyes.
if (want('5-')) {
  const p = await open(INSPECT, 'inspection.walk');
  await prep(p);
  await p.evaluate(() => {
    const { U, ic } = window.M;
    const r = (title, description, trail, icon) => U.row({ title, description, ...(trail === 'chevron' ? { trail: 'chevron', action: 'x', variant: 'navigation' } : { trailing: trail }), ...(icon ? { icon: ic(icon) } : {}) });
    const body =
      U.heading({ title: 'Different from the record', kind: 'section', level: 3 })
      + U.rowGroup(r('D4 · 12 counted', 'Should be 14 · 2 unaccounted in batch 25', '−2')
        + r('000512 moved to C2', 'Was Unit 9 · C3', '+1'), { className: 'm-evidence' })
      + U.heading({ title: 'Not seen', kind: 'section', level: 3 })
      + U.rowGroup(r('000281', 'Stays recorded in C1 · open her to report missing', 'chevron'))
      + '<p class="m-hint">C1 and C2 match the record otherwise. D5 was not counted.</p>';
    const sheet = U.sheet({ variant: 'drawer', title: 'Count saved', line: 'Unit 7 · 3 of 4 pens · 09:30', body, footer: '<div class="sheet-footer" data-ds="Sheet">' + U.button({ label: 'Done', register: 'primary', action: 'x' }) + '</div>', className: 'm-count m-receipt', label: 'Count saved' });
    const phone = document.querySelector('.phone');
    const main = phone.querySelector('.inspect-main') || phone.firstElementChild;
    main.setAttribute('inert', '');
    phone.insertAdjacentHTML('beforeend', '<div class="m-scrim"></div>' + sheet);
    const st = document.createElement('style');
    st.textContent = '.m-scrim{position:absolute;inset:0;background:rgba(20,24,21,.38);z-index:5}.phone>.sheet.m-receipt{position:absolute;left:0;right:0;bottom:0;z-index:6}';
    document.head.append(st);
  });
  await shoot(p, 'mock-5-result.png');
}

// 6. The pen log: one line per count, the figures it saw; history is never rewritten.
if (want('6-')) {
  const p = await open(INSPECT, 'inspection.pen-log');
  await p.evaluate(() => {
    const U = window.SentriUI;
    const groups = [
      { label: 'Today', entries: [
        { title: 'Counted 14 · 2 unaccounted', detail: 'Should have been 16 · both tagged pigs seen', meta: '09:30 · L.M' }] },
      { label: 'Yesterday', entries: [{ title: 'Died · 1 without ear tag', detail: 'Coughing', meta: '07:05 · G.H' }] },
      { label: 'Oct 30', entries: [{ title: '3 pigs moved to D6', detail: '3 without ear tags · 1 with Coughing', meta: '14:20 · M.L' }] },
      { label: 'Oct 28', entries: [{ title: 'Counted 20 · matched', detail: 'Both tagged pigs seen', meta: '08:10 · G.H' }] },
    ];
    const log = document.querySelector('.st-log');
    if (log) log.outerHTML = U.log(groups);
    for (const t of document.querySelectorAll('p, span, small')) if (/^2 entries/.test(t.textContent)) t.textContent = t.textContent.replace('2 entries', '4 entries');
    for (const t of document.querySelectorAll('.st-page-title, .sheet-title, h2')) if (/C1/.test(t.textContent)) t.textContent = t.textContent.replace('C1', 'D4');
    for (const t of document.querySelectorAll('.st-header-line, .sheet-line')) if (/C1/.test(t.textContent)) t.textContent = t.textContent.replace('C1', 'D4');
  });
  await shoot(p, 'mock-6-log.png');
}

// 7. Pigs without ear tags carry their conditions by count: picking 5 of D4's 14 asks, per condition the group has, how many of the 5 have it.
if (want('7-')) {
  const p = await open(INSPECT, 'inspection.walk');
  await prep(p);
  await p.evaluate(() => {
    const { U, ic } = window.M;
    const pad = U.numpad({ compact: true, label: 'How many in all?', value: '5', unit: 'of 14', maxLength: 3, id: 'm-pad', action: 'x', actions: [{ label: 'All 14', action: 'x' }] });
    const cond = U.stepper({ label: 'With Coughing', description: 'of the 3 in D4', value: 2, min: 0, max: 3, action: 'x', reserveHint: false });
    const body = U.rowGroup('<div class="m-cond">' + cond + '</div>') + pad;
    const sheet = U.sheet({ variant: 'drawer', title: 'Without ear tags · D4', body, footer: '<div class="sheet-footer" data-ds="Sheet">' + U.backButton({ action: 'x' }) + U.button({ label: 'Done', register: 'primary', action: 'x' }) + '</div>', className: 'm-count notags-count-sheet', label: 'Without ear tags' });
    const phone = document.querySelector('.phone');
    (phone.querySelector('.inspect-main') || phone.firstElementChild).setAttribute('inert', '');
    phone.insertAdjacentHTML('beforeend', '<div class="m-scrim"></div>' + sheet);
    const st = document.createElement('style');
    st.textContent = '.m-scrim{position:absolute;inset:0;background:rgba(20,24,21,.38);z-index:5}.phone>.sheet.notags-count-sheet{position:absolute;left:0;right:0;bottom:0;z-index:6}.m-cond{padding:8px 16px}.notags-count-sheet .st-row-group{margin-bottom:14px}';
    document.head.append(st);
  });
  await shoot(p, 'mock-7-noid-conditions.png');
}

await b.close(); server.kill();
