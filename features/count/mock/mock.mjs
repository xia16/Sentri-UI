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
  .m-count .m-inline-bar{margin:0 0 8px}
  .m-count .m-inline-bar .st-choice-search{margin-bottom:0}
  .m-count .m-total-field{margin-left:10px;display:flex}
  .m-count .m-total-field>*{box-sizing:border-box;width:56px;height:44px;border:1px solid #bdc7b6;border-radius:12px;background:#fff;text-align:center;font:600 16px/42px 'IBM Plex Mono',monospace;color:#20291f;padding:0}
  .m-count .m-total-field>[data-idle],.m-count .m-total-field>.is-idle{color:#657060}
  .m-count .m-away .st-row-copy small,.m-count .m-away .st-animal-context{color:var(--amber,#896017)}
  .m-count .m-inline-bar+*{margin-top:0!important}
  .m-count .m-hint b{font-family:var(--font-mono,'IBM Plex Mono',monospace)}
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

// 2. (Dropped, owner 2026-11-02: no "Last counted" row on Home; a recount is asked for inside the task that needs it.)

// 3. Count one pen (owner, 2026-11-02): one pen at a time. First count every pig in the pen, then add the ear tags with the shared
//    search-and-scan field (farms without a reader type them); each added pig appears below it, a tag added twice counts once, and a
//    pig the record places in another pen says so quietly ("Currently in …"). Pigs without ear tags are worked out, never typed.
//    Pen D4 on record: 000801, 000802, 000803 with ear tags + 13 without = 16.
for (const [name, fewer] of [['mock-3-count-pen.png', true], ['mock-3b-count-pen-match.png', false]]) {
  if (!want(name.slice(5, 7))) continue;
  const p = await open(INSPECT, 'inspection.walk');
  await prep(p);
  await p.evaluate(({ fewer }) => {
    const { U, ic, page, footer, primary } = window.M;
    const all = 16;
    const added = fewer
      ? [['000801', 'Grower · 63d'], ['000802', 'Grower · 63d'], ['000512', 'Currently in Unit 9 · C3', true], ['000733', 'Currently in D2', true], ['000915', 'Currently in D5', true, true]]
      : [['000801', 'Grower · 63d'], ['000802', 'Grower · 63d'], ['000803', 'Grower · 63d']];
    const notAdded = fewer ? ['000803'] : [];
    // Every pig added is a ticked row; untick one read by mistake (a pig in the next pen through the bars) and it leaves the count.
    const kept = added.filter((a) => !a[3]);
    const tagged = kept.length + notAdded.length, untagged = all - tagged, expected = 13, diff = untagged - expected;
    const row = ([id, ctx, away, off]) => U.rowSelectDoor({ code: id, description: ctx, contextWidth: '240px', right: { kind: 'tags', tags: [] }, checked: !off, value: id, action: '', openAction: 'pig', openValue: id, className: 'inspect-pig roster-pig' + (off ? '' : ' selected') + (away ? ' m-away' : ''), label: id });
    const count = '<section class="feature-section">' + U.stepper({ variant: 'well', label: 'All pigs in D4', value: all, min: kept.length, max: 80, action: 'x', reserveHint: false }) + '</section>';
    const search = U.choiceSearch({ label: 'Search ear tag', placeholder: 'Ear tag', value: '', clear: { action: 'x' }, scan: { action: 'x', label: 'Scan ear tags' } });
    const tags = '<section class="feature-section inspect-list m-list">' + U.heading({ title: 'Ear tags · ' + kept.length, icon: ic('tag'), kind: 'section', level: 3 })
      + '<div class="m-inline-bar">' + search + '</div>'
      + U.rowGroup(added.map(row).join(''))
      + (notAdded.length ? '<p class="m-hint">Recorded here, not added yet: <b>' + notAdded.join(', ') + '</b></p>' : '')
      + (fewer ? '<p class="m-hint">000802 added twice · counted once.</p>' : '') + '</section>';
    const line = (title, description, figure, strong) => U.row({ title, description, trailing: figure, className: strong ? 'm-total' : '' });
    const evidence = U.heading({ title: 'Since the last count', icon: ic('record'), kind: 'section', level: 3 })
      + U.rowGroup(line('Counted', 'Oct 28 · 08:10 · G.H', '20')
        + line('Moved to D6', 'Oct 30 · 14:20 · M.L', '−3')
        + line('Died', 'Yesterday · 07:05 · G.H', '−1')
        + line('Should be here now', '3 with ear tags · 13 without', '16', true), { className: 'm-evidence' });
    const left = '<div class="m-left"><strong>' + untagged + ' without ear tags</strong><small>' + (diff === 0 ? 'Matches the record' : Math.abs(diff) + ' unaccounted') + '</small></div>';
    page('Count pigs', 'Pen D4 · Unit 7', count + tags + `<section class="feature-section">${evidence}</section>`, footer(left, primary('Save count')));
  }, { fewer });
  await shoot(p, name);
}

// 5a. Save count with a tagged pig recorded here but not added: a short drawer settles her on the spot, before anything is saved.
if (want('5a')) {
  const p = await open(INSPECT, 'inspection.walk');
  await prep(p);
  await p.evaluate(() => {
    const { U, ic, page, footer, primary } = window.M;
    // The count page behind it, as the worker left it.
    page('Count pigs', 'Pen D4 · Unit 7', '<section class="feature-section">' + U.stepper({ variant: 'well', label: 'All pigs in D4', value: 16, min: 4, max: 80, action: 'x', reserveHint: false }) + '</section>'
      + '<section class="feature-section">' + U.heading({ title: 'Ear tags · 4', icon: ic('tag'), kind: 'section', level: 3 }) + '</section>',
      footer('<div class="m-left"><strong>11 without ear tags</strong><small>2 unaccounted</small></div>', primary('Save count')));
    const pig = U.rowGroup(U.row({ code: '000803', description: 'Grower · 63d' }));
    const choice = U.choiceRadios({ label: 'Where is she?', labelHidden: true, action: 'x', selected: 'here', options: [
      { value: 'here', label: 'Here · add her' },
      { value: 'missing', label: 'Not here · report her missing' },
      { value: 'later', label: 'Not sure · leave her in D4' }] });
    const sheet = U.sheet({ variant: 'drawer', title: '1 pig not added', line: 'Recorded in D4, not scanned or typed', body: pig + choice, footer: '<div class="sheet-footer" data-ds="Sheet">' + U.backButton({ action: 'x' }) + U.button({ label: 'Save count', register: 'primary', action: 'x' }) + '</div>', className: 'm-count m-receipt', label: '1 pig not added' });
    const phone = document.querySelector('.phone');
    phone.firstElementChild.setAttribute('inert', '');
    phone.insertAdjacentHTML('beforeend', '<div class="m-scrim"></div>' + sheet.replace('m-count m-receipt', 'm-receipt'));
    const st = document.createElement('style');
    st.textContent = `.m-scrim{position:absolute;inset:0;background:rgba(20,24,21,.38);z-index:10}.phone>.sheet.m-receipt{position:absolute;left:0;right:0;bottom:0;top:auto;z-index:20!important;filter:none!important;opacity:1!important}
      .m-receipt .st-row-group{margin-bottom:16px}`;
    document.head.append(st);
  });
  await shoot(p, 'mock-5a-not-added.png');
}

// 5. Count saved: a full page that says plainly what the count did. What is in the pen now; the pigs moved here, by name, from where;
//    the pigs unaccounted for and what happens to them (the batch's balancing sheet). Nothing left to decide: that was done before saving.
if (want('5-')) {
  const p = await open(INSPECT, 'inspection.walk');
  await prep(p);
  await p.evaluate(() => {
    const { U, ic, page, footer, primary } = window.M;
    const now = '<section class="feature-section">' + U.heading({ title: 'In D4 now', icon: ic('details'), kind: 'section', level: 3 })
      + U.facts([{ label: 'Pigs', value: '16' }, { label: 'With ear tags', value: '5' }, { label: 'Without', value: '11' }], { columns: 3 }) + '</section>';
    const moved = '<section class="feature-section">' + U.heading({ title: '2 pigs moved here', icon: ic('transfer'), kind: 'section', level: 3 })
      + U.rowGroup(U.row({ code: '000512', description: 'From Unit 9 · C3', trailing: 'C3 → D4', className: 'm-line' })
        + U.row({ code: '000733', description: 'From D2', trailing: 'D2 → D4', className: 'm-line' })) + '</section>';
    const lost = '<section class="feature-section">' + U.heading({ title: '2 pigs unaccounted for', icon: ic('alert'), kind: 'section', level: 3 })
      + U.rowGroup(U.row({ icon: ic('tag-off'), title: 'Without ear tags', description: 'Should be 13, now 11', trailing: '13 → 11', className: 'm-line' }))
      + '<p class="m-hint m-explain">They go on batch 25\'s balancing sheet. A later count, a death or a move can balance them. Still open when batch 25 ends, they are recorded as an unaccounted loss.</p></section>';
    page('D4 counted', 'Pen D4 · 09:30 · L.M', now + moved + lost, '<div class="sheet-footer" data-ds="Sheet">' + primary('Done') + '</div>');
    const st = document.createElement('style');
    st.textContent = `.m-count .m-line .st-row-trailing{font:600 17px var(--font-mono,'IBM Plex Mono',monospace);color:var(--ink,#20291f);white-space:nowrap}
      .m-count .m-explain{font-size:13px;line-height:1.5;margin-top:10px;color:var(--ink,#20291f)}`;
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
