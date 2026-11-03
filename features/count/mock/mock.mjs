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
// A failed page step must not leave the server holding the process open.
const fail = (e) => { console.error(e); server.kill(); process.exit(1); };
process.on('uncaughtException', fail); process.on('unhandledRejection', fail);
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
// The ticked rows in three colourings (owner, 2026-11-02: "it looks so grey and black"), against the status colour convention
// (done green, in progress blue, late yellow): A as now (well tint, ink box), B green box on white, C green box on green-wash.
const TICK = {
  A: '',
  B: '.st-choice-trail input[type="checkbox"]{accent-color:#276640!important}.inspect-pig.selected,.roster-pig.selected{background:var(--paper,#fff)!important}',
  C: '.st-choice-trail input[type="checkbox"]{accent-color:#276640!important}.inspect-pig.selected,.roster-pig.selected{background:#eaf2e5!important}',
};
for (const [name, fewer, tick] of [['mock-3-count-pen.png', true, 'B'], ['mock-3b-count-pen-match.png', false, 'B'], ['mock-3v-tick-a-now.png', true, 'A'], ['mock-3v-tick-b-green-box.png', true, 'B'], ['mock-3v-tick-c-green-wash.png', true, 'C']]) {
  if (!want(name.slice(5, 7))) continue;
  const p = await open(INSPECT, 'inspection.walk');
  await prep(p);
  await p.evaluate(({ fewer }) => {
    const { U, ic, page, footer, primary } = window.M;
    const all = 16;
    const added = fewer
      ? [['000801', 'Grower · 63d'], ['000802', 'Grower · 63d'], ['000512', 'Grower · 63d', 'In Unit 9 · C3'], ['000733', 'Grower · 61d', 'In Unit 6 · D2'], ['000915', 'Grower · 63d', 'In D5', true]]
      : [['000801', 'Grower · 63d'], ['000802', 'Grower · 63d'], ['000803', 'Grower · 63d']];
    const notAdded = fewer ? ['000803'] : [];
    // Every pig added is a ticked row; untick one read by mistake (a pig in the next pen through the bars) and it leaves the count.
    const kept = added.filter((a) => !a[3]);
    const tagged = kept.length, untagged = all - tagged, expected = 16 + (fewer ? 2 : 0), diff = all - expected;
    // A pig the record places in another pen carries one quiet amber chip on the right (owner, 2026-11-03), where the row's state goes.
    const chip = (text) => '<span class="st-animal-tags m-chip">' + U.status({ variant: 'chip', kind: 'late', icon: '', text }) + '</span>';
    const row = ([id, ctx, away, off]) => {
      const html = U.rowSelectDoor({ code: id, description: ctx, right: { kind: 'tags', tags: [] }, checked: !off, value: id, action: '', openAction: 'pig', openValue: id, className: 'inspect-pig roster-pig' + (off ? '' : ' selected'), label: id });
      return away ? html.replace('</span><span class="st-row-chevron">', chip(away) + '</span><span class="st-row-chevron">') : html;
    };
    const count = '<section class="feature-section">' + U.stepper({ variant: 'well', label: 'How many pigs are in D4?', value: all, min: kept.length, max: 80, action: 'x', reserveHint: false }) + '</section>';
    const search = U.choiceSearch({ label: 'Search ear tag', placeholder: 'Ear tag', value: '', clear: { action: 'x' }, scan: { action: 'x', label: 'Scan ear tags' } });
    const tags = '<section class="feature-section inspect-list m-list">' + U.heading({ title: 'Which tagged pigs are here?', meta: kept.length + ' found', icon: ic('tag'), kind: 'section', level: 3 })
      + '<div class="m-inline-bar">' + search + '</div>'
      + U.rowGroup(added.map(row).join(''))
      + (notAdded.length ? '<p class="m-hint">Recorded here, not scanned yet: <b>' + notAdded.join(', ') + '</b></p>' : '')
      + (fewer ? '<p class="m-hint">000802 added twice · counted once.</p>' : '') + '</section>';
    const line = (title, description, figure, strong) => U.row({ title, description, trailing: figure, className: strong ? 'm-total' : '' });
    const evidence = U.heading({ title: 'Since the last count', icon: ic('record'), kind: 'section', level: 3 })
      + U.rowGroup(line('Counted', 'Oct 28 · 08:10 · G.H', '20')
        + line('Moved to D6', 'Oct 30 · 14:20 · M.L', '−3')
        + line('Died', 'Yesterday · 07:05 · G.H', '−1')
        + line('Should be here now', '3 with ear tags · 13 without', '16', true), { className: 'm-evidence' });
    const left = '<div class="m-left"><strong>' + untagged + ' without ear tags</strong><small>' + (notAdded.length ? notAdded.join(', ') + ' not found' : 'Matches the record') + '</small></div>';
    page('Count D4', 'Recount · Unit 7', count + tags + `<section class="feature-section">${evidence}</section>`, footer(left, primary('Done')));
  }, { fewer });
  if (TICK[tick]) await p.addStyleTag({ content: TICK[tick] });
  await shoot(p, name);
}

// 5. Review count (owner, 2026-11-02): a full page before saving that says plainly what the count will do. No popup: a tagged pig
//    recorded here and not scanned is simply not accounted for, beside the untagged ones. Both go on the batch's balancing sheet, where
//    a count of the pen they went to (or a death, or a move) balances them: the usual reason is pigs already moved and not yet updated,
//    or piglets moved around between pens. Record: 000801, 000802, 000803 + 13 without = 16; 000512 and 000733 scanned here; 16 counted.
if (want('5-')) {
  const p = await open(INSPECT, 'inspection.walk');
  await prep(p);
  await p.evaluate(() => {
    const { U, ic, page } = window.M;
    const now = '<section class="feature-section">' + U.heading({ title: 'In D4 after this count', icon: ic('details'), kind: 'section', level: 3 })
      + U.facts([{ label: 'Pigs', value: '16' }, { label: 'With ear tags', value: '4' }, { label: 'Without', value: '12' }], { columns: 3 }) + '</section>';
    const moved = '<section class="feature-section">' + U.heading({ title: '2 pigs moved here', icon: ic('transfer'), kind: 'section', level: 3 })
      + U.rowGroup(U.row({ code: '000512', description: 'From Unit 9 · C3', trailing: 'C3 → D4', className: 'm-line' })
        + U.row({ code: '000733', description: 'From D2', trailing: 'D2 → D4', className: 'm-line' })) + '</section>';
    const lost = '<section class="feature-section">' + U.heading({ title: '2 pigs not accounted for', icon: ic('alert'), kind: 'section', level: 3 })
      + U.rowGroup(U.row({ code: '000803', description: 'Recorded in D4, not scanned', trailing: '−1', className: 'm-line' })
        + U.row({ icon: ic('tag-off'), title: 'Without ear tags', description: 'Should be 13, now 12', trailing: '−1', className: 'm-line' }))
      + '<p class="m-hint m-explain">They go on batch 25\'s balancing sheet. Counting the pen they went to balances them, as does a death or a move. Still open when batch 25 ends, they are an unaccounted loss.</p></section>';
    const sheet = '<section class="feature-section">' + U.heading({ title: 'Batch 25 balancing sheet', icon: ic('record'), kind: 'section', level: 3 })
      + U.rowGroup(U.row({ code: 'D5', description: 'Counted today · 09:10', trailing: '+1', className: 'm-line' })
        + U.row({ code: 'D4', description: 'This count', trailing: '−2', className: 'm-line' })
        + U.row({ title: 'Open', description: '1 pig not accounted for', trailing: '−1', className: 'm-line m-total' })) + '</section>';
    page('Review count', 'Pen D4 · 16 pigs counted', now + moved + lost + sheet, '<div class="sheet-footer" data-ds="Sheet">' + U.backButton({ action: 'x' }) + U.button({ label: 'Save count', register: 'primary', action: 'x' }) + '</div>');
    const st = document.createElement('style');
    st.textContent = `.m-count .m-line .st-row-trailing{font:600 17px var(--font-mono,'IBM Plex Mono',monospace);color:var(--ink,#20291f);white-space:nowrap}
      .m-count .m-explain{font-size:13px;line-height:1.5;margin-top:10px;color:var(--ink,#20291f)}`;
    document.head.append(st);
  });
  await p.waitForTimeout(400); await p.screenshot({ path: path.join(out, 'mock-5-result.png') });
  await p.evaluate(() => { const s = document.querySelector('.phone .sheet-body'); if (s) s.scrollTop = 600; });
  await shoot(p, 'mock-5b-result-scrolled.png');
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

// 10–13 (owner, 2026-11-03): the recount is the unit's. Recount opens the unit's pens; tap a pen to count it (all pigs, then the ear
// tags); Count on a pen page opens the same recount, straight into that pen. Finish shows the unit's balance sheet, where pens net out
// against each other and only what is still missing goes to the batch. Receiving is the same list and the same pen count.
// Unit 7 on record: C1 000254 000267 000281 · C2 000306 000312 · D4 000801 000802 000803 + 13 without · D5 38 without = 59.
const UNIT_CSS = `.m-count .m-line .st-row-trailing{font:600 17px var(--font-mono,'IBM Plex Mono',monospace);color:var(--ink,#20291f);white-space:nowrap}
  .m-count .m-off .st-row-copy small{color:var(--amber,#896017)}
  .m-count .m-explain{font-size:13px;line-height:1.5;margin-top:10px;color:var(--ink,#20291f)}
  .m-recv-bar{background:var(--paper,#fff);border:1px solid var(--line,#dfe4d8);border-radius:18px;padding:14px 16px;margin:4px 0 20px}
  .m-recv-figs{display:flex;align-items:baseline;gap:8px}.m-recv-figs strong{font:600 32px/1 var(--font-mono,'IBM Plex Mono',monospace);color:var(--ink,#20291f)}.m-recv-figs span{font-size:14px;color:var(--ink,#20291f)}
  .m-recv-track{display:flex;gap:2px;height:8px;margin:12px 0 10px}.m-recv-track i{display:block;height:100%;border-radius:4px;background:var(--handle,#dce0d4)}.m-recv-track i.done{background:var(--done-mark,#5fae6e)}
  .m-count .m-chip{flex:0 0 auto;margin-left:auto}.m-count .m-chip .st-status{white-space:nowrap}
  .m-count .m-ledger .st-row-trailing{font:600 17px var(--font-mono,'IBM Plex Mono',monospace);color:var(--ink,#20291f)}
  .m-count .m-ledger .m-sum .st-row-title{font-weight:600}
  .m-count .m-ledger .m-sum.m-end{border-top:2px solid var(--ink,#20291f)}
  .m-count .m-ledger .m-owed .st-row-copy small{color:var(--amber,#896017)}
  .m-recv-bar small{display:block;font-size:12px;color:var(--muted,#657060)}
  .m-done .st-row-chevron{color:#276640}`;

// 11. Finish recount. A count that matches the record saves at once: no sheet (owner, 2026-11-03). Only when the unit's total changed
//     does the balance sheet open, as one ledger card in the owner's order: Counted now at the top, each change a door with its
//     signed figure in a tonal tile (not found, to the batch's balancing sheet, the only amber), On record at the bottom.
//     Count: C1 3 · C2 2 · D4 16 (000801 000802 + 000512 from Unit 9, 000733 from Unit 6, 12 without; 000803 not found) · D5 39 (000915 + 38).
const LEDGER_CSS = `
  .m-hero{background:var(--paper,#fff);border:1px solid var(--line,#dfe4d8);border-radius:18px;padding:16px 18px 18px;display:grid;grid-template-columns:auto auto 1fr;grid-template-rows:auto auto;column-gap:16px;align-items:baseline;margin:4px 0 24px}.m-hero .m-k{display:contents}.m-hero .m-from small{grid-area:1/1}.m-hero .m-from strong{grid-area:2/1}.m-hero .m-to small{grid-area:1/3}.m-hero .m-to strong{grid-area:2/3}.m-hero .m-arrow{grid-area:2/2;align-self:center}
  .m-hero .m-k small{display:block;font-size:13px;color:var(--muted,#657060);margin-bottom:6px}
  .m-hero .m-from strong{font:500 26px/1 var(--font-mono,'IBM Plex Mono',monospace);color:var(--ink-2,#5b625d)}
  .m-hero .m-to strong{font:600 40px/1 var(--font-mono,'IBM Plex Mono',monospace);color:var(--ink,#20291f);letter-spacing:-1px}
  .m-hero .m-arrow{color:var(--muted,#657060)}.m-hero .m-arrow svg{width:22px;height:22px;display:block;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
  .m-hero .m-net{margin-left:auto;align-self:center;font:600 14px var(--font-mono,'IBM Plex Mono',monospace);color:var(--ink-2,#5b625d)}
  .m-count .m-fig{display:inline-block;min-width:44px;text-align:center;box-sizing:border-box;padding:6px 8px;border-radius:10px;font:600 16px/1.1 var(--font-mono,'IBM Plex Mono',monospace);background:var(--well,#eef1e7);color:var(--ink,#20291f)}
  .m-count .m-fig.m-zero{color:var(--muted,#657060)}
  .m-count .m-fig.m-owe{background:var(--amber-fill,#fede82);color:var(--amber-fill-ink,#5c3f00)}
  .m-stmt{background:var(--paper,#fff);border:1px solid var(--line,#dfe4d8);border-radius:18px;padding:6px 16px;margin:4px 0 0}
  .m-stmt .m-l{display:grid;grid-template-columns:22px 1fr auto 16px;align-items:center;gap:10px;padding:14px 0;border-top:1px solid var(--rule,#e9ece3)}
  .m-stmt .m-l:first-child{border-top:0}
  .m-stmt .m-s{font:600 18px var(--font-mono,'IBM Plex Mono',monospace);color:var(--ink-2,#5b625d);text-align:center}
  .m-stmt .m-t{font-size:16px;color:var(--ink,#20291f)}.m-stmt .m-t small{display:block;font-size:13px;color:var(--muted,#657060);margin-top:3px}
  .m-stmt .m-n{font:600 17px var(--font-mono,'IBM Plex Mono',monospace);color:var(--ink,#20291f);text-align:right}
  .m-stmt .m-c{color:var(--muted,#657060)}.m-stmt .m-c svg{width:16px;height:16px;display:block;fill:none;stroke:currentColor;stroke-width:1.8}
  .m-stmt .m-l.m-total{border-top:1.5px solid var(--ink,#20291f)}.m-stmt .m-l.m-total .m-t,.m-stmt .m-l.m-total .m-n{font-weight:600}.m-stmt .m-l.m-total .m-n{font-size:22px}
  .m-stmt .m-l.m-owe .m-n{color:var(--amber,#896017)}
  .m-stmt-aside{margin-top:12px}
  .m-count .m-ledger .m-end .st-row-trailing{font-family:var(--font-mono,'IBM Plex Mono',monospace);min-width:44px;text-align:center;margin-right:26px}
  .m-count .m-ledger .m-now .st-row-title,.m-count .m-ledger .m-now strong{font-weight:600}
  .m-count .m-ledger .m-now .st-row-trailing{font-size:26px;font-weight:600;color:var(--ink,#20291f)}
  .m-count .m-ledger .m-was .st-row-trailing{font-size:18px;font-weight:500;color:var(--ink-2,#5b625d)}`;
const ARROW = '<svg viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
const CHEV = '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>';
const hero = (fromLabel, from, toLabel, to, net) => `<div class="m-hero"><div class="m-k m-from"><small>${fromLabel}</small><strong>${from}</strong></div><span class="m-arrow">${ARROW}</span><div class="m-k m-to"><small>${toLabel}</small><strong>${to}</strong></div>${net ? `<span class="m-net">${net}</span>` : ''}</div>`;

if (want('11-')) {
  const p = await open(INSPECT, 'inspection.walk');
  await prep(p);
  await p.evaluate(({ UNIT_CSS, LEDGER_CSS }) => {
    const { U, ic, page } = window.M;
    const fig = (n, cls = '') => '<span class="m-fig ' + cls + '">' + n + '</span>';
    const change = (icon, title, description, n, cls) => U.row({ variant: 'navigation', icon: ic(icon), title, description, trail: 'chevron', action: 'x' })
      .replace('<span class="st-row-chevron">', (n ? fig(n, cls) : '') + '<span class="st-row-chevron">');
    const end = (title, description, n, cls) => U.row({ title, description, trailing: n, className: 'm-end ' + cls });
    const body = '<section class="feature-section m-ledger">' + U.rowGroup(end('Counted', 'This recount', '60', 'm-now')
      + change('transfer', 'Found from other units', '000512 · 000733', '+2')
      + change('alert', 'Not found', '000803 · balancing sheet', '−1', 'm-owe')
      + end('On record', 'Before the recount', '59', 'm-was')) + '</section>';
    page('Unit 7 balance sheet', 'Recount · 09:40 · L.M', body, '<div class="sheet-footer" data-ds="Sheet">' + U.backButton({ action: 'x' }) + U.button({ label: 'Save recount', register: 'primary', action: 'x' }) + '</div>');
    const st = document.createElement('style'); st.textContent = UNIT_CSS + LEDGER_CSS; document.head.append(st);
  }, { UNIT_CSS, LEDGER_CSS });
  await shoot(p, 'mock-11-unit-balance.png');
}
// 11b–d. A line opened: its pigs, under the same figure.
const DETAILS = [
  ['mock-11b-found.png', 'Found from other units', '+2', '', [['000512', 'Was Unit 9 · C3', '→ D4'], ['000733', 'Was Unit 6 · D2', '→ D4']], 'Saved, they move into D4 and leave their old units.'],
  ['mock-11c-not-found.png', 'Not found', '−1', 'm-owe', [['000803', 'Recorded in D4', '']], 'She goes on batch 25 balancing sheet. A later count, transfer or death closes it; still open when the batch ends, she is an unaccounted loss.'],
];
for (const [name, title, figure, cls, rows, note] of DETAILS) {
  if (!want(name.slice(5, 8))) continue;
  const p = await open(INSPECT, 'inspection.walk');
  await prep(p);
  await p.evaluate(({ UNIT_CSS, LEDGER_CSS, title, figure, cls, rows, note }) => {
    const { U, page } = window.M;
    const body = '<section class="feature-section">' + U.rowGroup((figure ? U.row({ title: 'Unit 7', className: 'm-sum', trailing: 'X' }) : U.row({ title: 'Unit 7 total', className: 'm-sum', trailing: 'Unchanged' })).replace('<span class="st-row-trailing">X</span>', '<span class="m-fig ' + cls + '">' + figure + '</span>') + rows.map(([code, description, trailing]) => U.row({ code, description, trailing, className: 'm-line' })).join(''))
      + '<p class="m-hint m-explain">' + note + '</p></section>';
    page(title, 'Unit 7 balance sheet', body, '<div class="sheet-footer" data-ds="Sheet">' + U.backButton({ action: 'x' }) + '</div>');
    const st = document.createElement('style'); st.textContent = UNIT_CSS + LEDGER_CSS + '.m-count .st-sheet-line .m-fig,.m-count .sheet-line .m-fig{padding:2px 6px;font-size:13px;min-width:0}'; document.head.append(st);
  }, { UNIT_CSS, LEDGER_CSS, title, figure, cls, rows, note });
  await shoot(p, name);
}

// 13–15. Receiving (owner, 2026-11-03), two parts. First the plan: where the pigs go and how many in each pen, drawn on the unit's
//     pen map so the crew sees it at a glance; they put the pigs in by it, and it is only a guide. Then the count: once the pigs are in,
//     they count the pens (the pen count, all pigs then ear tags), so what they counted is where the pigs are, whatever the plan said.
//     End task closes it. The plan picks pens, not numbers (owner, 2026-11-03): every pen shows its free places (capacity less the
//     pigs already in it), the planned pens are outlined; pigs may go into any pen with room. Unit 9: lanes A–C, rows 1–4, 15 a pen.
const PLAN_CSS = `
  .m-count .m-map{margin:0}
  .m-count .m-map .st-pen-tile{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:64px}
  .m-count .m-map .st-pen-tile .m-pc{font:600 13px var(--font-mono,'IBM Plex Mono',monospace);color:var(--muted,#657060)}
  .m-count .m-map .st-pen-tile .m-pn{font:600 20px/1 var(--font-mono,'IBM Plex Mono',monospace);color:var(--ink,#20291f)}
  .m-count .m-map .st-pen-tile[data-level="empty"] .m-pc{font-weight:500}
  .m-count .m-map .st-pen-tile.m-done{background:var(--done-fill,#d5e8cc);border-color:transparent}
  .m-count .m-map .st-pen-tile.m-done .m-pc,.m-count .m-map .st-pen-tile.m-done .m-pn{color:var(--done-fill-ink,#1d4d2e)}
  .m-count .m-map .st-pen-tile.m-todo .m-pn,.m-count .m-map .st-pen-tile.m-free .m-pn{color:var(--muted,#657060);font-weight:500}
  .m-count .m-map .st-pen-tile.m-plan{border:1.5px solid var(--ink,#20291f)}
  .m-count .m-map .st-pen-tile .m-pw{font:500 12px/1 var(--font-sans,inherit);color:var(--muted,#657060)}
  .m-count .m-plankey .m-k-plan{background:#fff;border:1.5px solid var(--ink,#20291f);box-sizing:border-box}
  .m-count .m-plankey{display:flex;gap:16px;font-size:13px;color:var(--ink,#20291f);margin:2px 0 14px}.m-count .m-plankey i{display:inline-block;width:12px;height:12px;border-radius:4px;vertical-align:-1px;margin-right:6px}
  .m-count .m-over{margin:0 0 12px}.m-count .m-over > *{max-width:none;white-space:nowrap}
  .m-count .m-plankey b{font-family:var(--font-mono,'IBM Plex Mono',monospace)}`;
async function receiveMap(name, opts) {
  const p = await open(INSPECT, 'inspection.walk');
  await prep(p);
  await p.evaluate(({ UNIT_CSS, LEDGER_CSS, PLAN_CSS, o }) => {
    const { U, ic, page, footer, primary } = window.M;
    const pens = {}; for (const [c, v] of Object.entries(o.tiles)) if (v[1] !== 'm-word') pens[c] = 'plain';
    let map = U.penMap({ lanes: o.lanes, depth: o.depth, pens, entrance: 'Entrance', key: 'recv' });
    const host = document.createElement('div'); host.innerHTML = map;
    host.querySelectorAll('.st-pen-tile').forEach((t) => {
      const c = t.dataset.pen, v = o.tiles[c];
      t.innerHTML = '<span class="m-pc">' + c + '</span>' + (!v ? '' : v[1] === 'm-word' ? '<span class="m-pw">' + v[0] + '</span>' : '<span class="m-pn">' + v[0] + '</span>');
      if (v && v[1] && v[1] !== 'm-word') t.classList.add(...v[1].split(' '));
    });
    map = '<div class="m-map">' + host.innerHTML + '</div>';
    const top = o.facts ? '<section class="feature-section">' + U.facts(o.facts.map(([label, value]) => ({ label, value })), { columns: o.facts.length }) + '</section>' : o.top;
    const note = o.chip ? '<p class="m-over">' + U.status({ variant: 'chip', kind: 'late', icon: '', text: o.chip }) + '</p>' : '';
    page(o.title, o.line, top + note + o.key + map, footer(o.left, primary(o.cta)));
    const st = document.createElement('style'); st.textContent = UNIT_CSS + LEDGER_CSS + PLAN_CSS; document.head.append(st);
  }, { UNIT_CSS, LEDGER_CSS, PLAN_CSS, o: opts });
  await shoot(p, name);
}
const bar = (n, of, word, segs) => `<div class="m-recv-bar"><div class="m-recv-figs"><strong>${n}</strong><span>${word}</span></div><div class="m-recv-track" data-status-part="bar">${segs}</div><small>${of}</small></div>`;
// Receiving is a task page like Farrowing's room (owner, 2026-11-03): one header, the task card (this unit, and the task overview
// across units, where the crew switches unit and ends the task); the unit's pen map below. Every pen shows pigs in it over its
// capacity (0/15); the planned pens are outlined, a suggestion only; tap any pen to count it. Batch 25: 120 pigs to Unit 9 (planned
// A1–A4, B1–B2) and Unit 10 (30, done). Run from a checkout that has Farrowing's room page.
async function taskMap(name, o) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(`http://localhost:${port}/ux/system/farrowing-astra-concept.html?layout=focus&screen=farrowing.room`);
  await p.waitForSelector('html.atlas-ready', { timeout: 15000 });
  await p.evaluate(({ PLAN_CSS, o }) => {
    const U = window.SentriUI;
    const titles = document.querySelector('.st-page-titles');
    titles.children[0].textContent = o.title; if (titles.children[1]) titles.children[1].textContent = o.line;
    document.querySelector('.room-context-strip').innerHTML = window.AstraTaskOverview.render({ headingIcons: true, unit: o.unit, task: o.task });
    document.querySelector('.room-controls')?.remove();
    const pens = {}; for (const c of Object.keys(o.tiles)) pens[c] = 'plain';
    const host = document.createElement('div'); host.innerHTML = U.penMap({ lanes: o.lanes, depth: o.depth, pens, entrance: 'Entrance', key: 'recv' });
    host.querySelectorAll('.st-pen-tile').forEach((t) => {
      const c = t.dataset.pen, v = o.tiles[c];
      const [n, cap] = v ? v[0].split('/').map(Number) : [0, 1];
      t.innerHTML = '<span class="m-pc">' + c + '</span>' + (n ? '<span class="m-pn">' + n + '</span><span class="m-fill"><i style="width:' + (100 * n / cap) + '%"></i></span>' : '');
      if (v && v[1]) t.classList.add(v[1]);
    });
    const list = document.querySelector('.room-list'); list.classList.add('m-count');
    list.innerHTML = o.key + '<div class="m-map">' + host.innerHTML + '</div>';
    const walk = document.createTreeWalker(document.querySelector('.st-task-dock, [data-ds="TaskDock"]') || document.body, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) if (walk.currentNode.nodeValue.trim() === 'Pen map') walk.currentNode.nodeValue = 'Pen list';
    const st = document.createElement('style'); st.textContent = PLAN_CSS + '.room-list.m-count{padding-bottom:24px}.m-count .m-map .st-pen-tile{position:relative;overflow:hidden}' // the fill line only where room matters: pens not counted
      + '.m-count .m-fill{position:absolute;left:12px;right:12px;bottom:8px;height:4px;border-radius:2px;background:var(--handle,#dce0d4)}'
      + '.m-count .m-fill i{display:block;height:100%;border-radius:2px;background:var(--muted,#657060)}'
      + '.m-count .st-pen-tile.m-done .m-fill{display:none}.m-count .m-map .st-pen-tile:has(.m-fill){padding-bottom:10px}'; document.head.append(st);
  }, { PLAN_CSS, o });
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(out, name) });
  await p.close();
}
const keyOf = (counted) => '<p class="m-plankey">' + (counted ? '<span><i style="background:var(--done-fill,#d5e8cc)"></i>Counted</span>' : '')
  + '<span><i class="m-k-plan"></i>Planned</span><span>Pens hold <b>15</b></span></p>';
const unit9 = (over) => {
  const t = { A1: ['0/15', 'm-plan'], A2: ['0/15', 'm-plan'], A3: ['0/15', 'm-plan'], A4: ['0/15', 'm-plan'], B1: ['0/15', 'm-plan'], B2: ['0/15', 'm-plan'],
    B3: ['0/15', 'm-free'], B4: ['0/15', 'm-free'], C1: ['15/15', 'm-free'], C2: ['9/15', 'm-free'], C3: ['0/15', 'm-free'], C4: ['0/15', 'm-free'] };
  return { ...t, ...over };
};
const RECV = { title: 'Receive pigs', line: 'Batch 25 · from Farrowing room 3', lanes: ['A', 'B', 'C'], depth: 4 };
if (want('13-')) {
  await taskMap('mock-13-receive-plan.png', { ...RECV, tiles: unit9({}), key: keyOf(false),
    unit: { name: 'Unit 9', value: '0', metric: 'Received', target: '6 pens planned' },
    task: { value: 30, total: 120, label: 'Received', statuses: { farrowed: 30, active: 0, awaiting: 90 } } });
}
if (want('14-')) {
  await taskMap('mock-14-receive-count.png', { ...RECV, key: keyOf(true),
    tiles: unit9({ A1: ['15/15', 'm-done'], A2: ['15/15', 'm-done'], A3: ['14/15', 'm-done'], B1: ['15/15', 'm-done'], C3: ['4/15', 'm-done'] }),
    unit: { name: 'Unit 9', value: '63', metric: 'Received', target: '5 pens counted' },
    task: { value: 93, total: 120, label: 'Received', statuses: { farrowed: 93, active: 0, awaiting: 27 } } });
}
if (want('10')) {
  const tiles = { C1: ['3', 'm-done'], C2: ['2', 'm-done'], D4: ['16', 'm-done'], D5: ['38', 'm-todo'] };
  for (const c of ['C3', 'C4', 'C5', 'D1', 'D2', 'D3']) tiles[c] = ['Empty', 'm-word'];
  await receiveMap('mock-10-unit-recount.png', {
    title: 'Recount', line: 'Unit 7', lanes: ['C', 'D'], depth: 5, tiles,
    top: bar('3', 'Started 09:05 · L.M', 'of 4 pens with pigs counted', '<i class="done" style="flex:1"></i>'.repeat(3) + '<i style="flex:1"></i>'),
    key: '<p class="m-plankey"><span><i style="background:var(--done-fill,#d5e8cc)"></i>Counted</span><span><b>38</b> On record</span></p>',
    left: '<div class="m-left"><strong>D5 not counted</strong><small>Keeps 38 if you finish</small></div>', cta: 'Finish recount',
  });
}

// 12. Count one pen after putting pigs in: the same pen count, with the plan beside it.
if (want('12')) {
  const p = await open(INSPECT, 'inspection.walk');
  await prep(p);
  await p.evaluate((UNIT_CSS) => {
    const { U, ic, page, footer, primary } = window.M;
    const pig = (id, ctx) => U.rowSelectDoor({ code: id, description: ctx, right: { kind: 'tags', tags: [] }, checked: true, value: id, action: '', openAction: 'pig', openValue: id, className: 'inspect-pig roster-pig selected', label: id });
    const count = '<section class="feature-section">' + U.stepper({ variant: 'well', label: 'How many pigs are in A3?', value: 14, min: 1, max: 80, action: 'x', reserveHint: false }) + '</section>';
    const search = U.choiceSearch({ label: 'Search ear tag', placeholder: 'Ear tag', value: '', clear: { action: 'x' }, scan: { action: 'x', label: 'Scan ear tags' } });
    const tags = '<section class="feature-section inspect-list m-list">' + U.heading({ title: 'Which tagged pigs are here?', meta: '1 found', icon: ic('tag'), kind: 'section', level: 3 })
      + '<div class="m-inline-bar">' + search + '</div>' + U.rowGroup(pig('000904', 'Gilt')) + '</section>';
    const left = '<div class="m-left"><strong>13 without ear tags</strong><small>Batch 25</small></div>';
    page('Count A3', 'Receive · Unit 9', count + tags, footer(left, primary('Done')));
    const st = document.createElement('style'); st.textContent = UNIT_CSS + '.st-choice-trail input[type="checkbox"]{accent-color:#276640!important}.inspect-pig.selected,.roster-pig.selected{background:var(--paper,#fff)!important}'; document.head.append(st);
  }, UNIT_CSS);
  await shoot(p, 'mock-12-receive-pen.png');
}

// 9. Pigs to move (owner, 2026-11-03): the source room's pen map. A pen whose pigs all go shows the move glyph; a pen sending some
//    shows how many of how many (12/13). Tap a partial pen: its pigs, a toggle between those that move and those that stay (9b, 9c).
//    A glance, not a tool (owner, 2026-11-03: the crew looks once, closes the phone, works): where to on top, the pigs that stay
//    and no button (the move out records nothing; receiving is the destination's). Each pen says it in words, read at a glance
//    (owner, 2026-11-03: no icon, no 12/13, no key, no list of who stays): Move all, or Move 12.
//    Farrowing room 3: A1 12 · A2 11 · A3 12 of 13 · A4 10 · B1 13 · B2 11 · B3 12 · B4 9 of 10 · C1–C3 10 each = 120.
const MOVE = { A1: 'all', A2: 'all', A3: '12', A4: 'all', B1: 'all', B2: 'all', B3: 'all', B4: '9', C1: 'all', C2: 'all', C3: 'all' };
if (want('9-')) {
  const p = await open(INSPECT, 'inspection.walk');
  await prep(p);
  await p.evaluate(({ UNIT_CSS, PLAN_CSS, MOVE }) => {
    const { U, ic, page } = window.M;
    const pens = {}; for (const c of Object.keys(MOVE)) pens[c] = 'plain';
    const host = document.createElement('div'); host.innerHTML = U.penMap({ lanes: ['A', 'B', 'C'], depth: 4, pens, key: 'move' });
    host.querySelectorAll('.st-pen-tile').forEach((t) => {
      const c = t.dataset.pen, v = MOVE[c];
      t.innerHTML = '<span class="m-pc">' + c + '</span>' + (!v ? '' : '<span class="m-mv">Move ' + (v === 'all' ? 'all' : '<b>' + v + '</b>') + '</span>');
    });
    const head = '<div class="m-recv-bar"><div class="m-recv-figs"><strong>120</strong><span>pigs to Unit 9</span></div><small>Today · into A1–A4, B1–B2</small></div>';
    page('Pigs to move', 'Transfer · batch 25 · from Farrowing room 3', head + '<div class="m-map">' + host.innerHTML + '</div>', '');
    const st = document.createElement('style'); st.textContent = UNIT_CSS + PLAN_CSS + `.m-count .m-map .st-pen-tile .m-pi svg{width:22px;height:22px;display:block;color:var(--ink,#20291f)}
      .m-count .m-map .st-pen-tile .m-pn.m-part{font-size:17px}
      .m-count .m-plankey .m-ki{display:inline-flex;align-items:center;gap:6px}.m-count .m-plankey .m-ki svg{width:16px;height:16px}
      .m-count .m-map .st-pen-tile .m-mv{font:500 14px/1.2 var(--font-sans,inherit);color:var(--ink,#20291f)}
      .m-count .m-map .st-pen-tile .m-mv b{font:600 18px/1 var(--font-mono,'IBM Plex Mono',monospace)}`;
    document.head.append(st);
  }, { UNIT_CSS, PLAN_CSS, MOVE });
  await shoot(p, 'mock-9-transfer-out.png');
}
for (const [name, view] of [['mock-9b-pen-move.png', 'move'], ['mock-9c-pen-stay.png', 'stay']]) {
  if (!want(name.slice(5, 7))) continue;
  const p = await open(INSPECT, 'inspection.walk');
  await prep(p);
  await p.evaluate(({ UNIT_CSS, view }) => {
    const { U, ic, page } = window.M;
    const toggle = U.segment({ variant: 'view-switch', options: [['move', 'Move · 12'], ['stay', 'Stay · 1']], active: view, action: 'x', ariaLabel: 'Pigs in A3' });
    const rows = view === 'move'
      ? U.row({ icon: ic('tag-off'), title: '11 pigs', description: 'Without ear tags' }) + U.row({ code: '000904', description: 'Gilt', trail: 'chevron', action: 'x' })
      : U.row({ code: '000901', description: 'Gilt', trail: 'chevron', action: 'x' });
    page('A3', 'Pigs to move · 12 of 13', '<section class="feature-section">' + toggle + '</section><section class="feature-section">' + U.rowGroup(rows) + '</section>', '<div class="sheet-footer" data-ds="Sheet">' + U.backButton({ action: 'x' }) + '</div>');
    const st = document.createElement('style'); st.textContent = UNIT_CSS; document.head.append(st);
  }, { UNIT_CSS, view });
  await shoot(p, name);
}

// 16. End the transfer (owner, 2026-11-03: "look at how we do it for the farrowing end task"): Farrowing's End task, its own parts.
//     The heading answers whether the task can close; one bar over the batch's pigs, then a row per part (Received; Not arrived,
//     never "still to count": the planned pens are a suggestion, so nothing is owed to a pen; which goes on the balancing sheet with the amber "!"; the row says what ending does); the hold. No second
//     count card and no "When you end" (owner, 2026-11-03: confusing; the part rows already say it). These need Farrowing's End task (PR 294): run from a checkout that has it.
const FARROW = `http://localhost:${port}/ux/system/farrowing-astra-concept.html?layout=focus`;
const END = [
  ['mock-16b-end-early.png', 'task-ready', {
    heading: 'Ready to end early', meta: '120 pigs', segs: [['farrowed', 105], ['awaiting', 15]],
    parts: [['done', 105, 'Received', 'Counted into Unit 9 and Unit 10', false], ['awaiting', 15, 'Not arrived', 'Goes on the balancing sheet', true, true]],
    sent: 120, counted: 119, countedNote: '1 not arrived', tagged: 2,
    ends: [['Recorded in Unit 9', '119'], ['Left in Farrowing room 3', '0']], owe: ['To the balancing sheet', '1', 'A loss if not found by batch end'],
    hold: ['End task early', 'HOLD TO END EARLY', false, true],
  }],
  ['mock-16c-end-ready.png', 'task-complete', {
    heading: 'Ready to end', meta: '120 pigs', segs: [['farrowed', 120]],
    parts: [['done', 120, 'Received', 'Counted into Unit 9 and Unit 10', false]],
    sent: 120, counted: 120, countedNote: 'All arrived', tagged: 2,
    ends: [['Recorded in Unit 9', '120'], ['Left in Farrowing room 3', '0']], owe: null,
    hold: ['End task', 'HOLD TO END', false],
  }],
];
for (const [name, screen, d] of END) {
  if (!want(name.slice(5, 8))) continue;
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(`${FARROW}&screen=farrowing.${screen}`);
  await p.waitForSelector('html.atlas-ready', { timeout: 15000 });
  await p.evaluate((d) => {
    const U = window.SentriUI, ic = (k) => window.SentriIcons.icon(k);
    const sheet = document.querySelector('.task-end-sheet');
    const total = d.segs.reduce((a, s) => a + s[1], 0);
    const bar = '<span class="task-status-bar" role="progressbar">' + d.segs.map(([k, n]) => '<i class="task-status-' + k + '" style="width:' + (100 * n / total) + '%"></i>').join('') + '</span>';
    const alert = document.querySelector('.st-alert-dot')?.outerHTML || '';
    const chev = document.querySelector('.task-closure-row .st-row-chevron')?.outerHTML || '';
    const part = ([k, n, title, sub, door, warn]) => (door ? '<button class="st-row task-closure-row" data-ds="Row" data-variant="navigation" type="button" data-part="' + k + '">' : '<div class="st-row task-closure-row" data-ds="Row" data-variant="navigation" data-part="' + k + '">')
      + '<span class="st-row-icon"><span class="task-closure-count">' + n + '</span></span><span class="st-row-copy"><strong>' + title + (warn ? alert : '') + '</strong><small>' + sub + '</small></span>' + (door ? chev + '</button>' : '</div>');
    const closure = '<section class="task-closure">' + U.heading({ title: d.heading, meta: d.meta, kind: 'section', level: 4 })
      + '<div class="task-closure-surface st-panel">' + bar + '<div class="st-row-group">' + d.parts.map(part).join('') + '</div></div></section>';
    const count = '<section class="task-performance">' + U.heading({ title: 'Count', icon: ic('tag'), meta: 'Batch 25', kind: 'section', level: 4 })
      + '<div class="task-perf-card st-panel"><div class="task-perf-kpis"><div><span>Sent</span><strong>' + d.sent + '</strong><small>From Farrowing room 3</small></div><div><span>Counted</span><strong>' + d.counted + '</strong><small>' + d.countedNote + '</small></div></div>'
      + '<dl class="task-perf-facts"><div><dt>Pens</dt><dd>' + (d.counted === 105 ? 7 : 8) + '<small>of 8</small></dd></div><div><dt>Per pen</dt><dd>' + (d.counted / (d.counted === 105 ? 7 : 8)).toFixed(1) + '</dd></div><div><dt>Ear tags</dt><dd>' + d.tagged + '</dd></div></dl></div></section>';
    // What ending does, in the summary rows Farrowing's Other outcomes uses; the one that needs following up is a door.
    const rows = d.ends.map(([title, n]) => U.row({ title, variant: 'summary-count', trailing: { text: n } })).join('')
      + (d.owe ? U.row({ title: d.owe[0], description: d.owe[2], variant: 'summary-count', trailing: { text: d.owe[1] }, action: 'x', trail: 'chevron' }) : '');
    const ends = '<section class="task-other-outcomes">' + U.heading({ title: 'When you end', icon: ic('record'), kind: 'section', level: 4 }) + '<div class="task-other-surface st-panel st-row-group">' + rows + '</div></section>';
    sheet.querySelector('.sheet-body').innerHTML = closure;
    const [label, caption, waiting, danger] = d.hold;
    sheet.querySelector('.sheet-footer').innerHTML = U.holdButton({ action: 'x', label, tone: danger || waiting ? 'danger' : 'primary', waiting, caption, className: label === 'End task' ? 'task-complete' : 'task-end-confirm' });
    sheet.querySelector('.st-page-title').textContent = 'End task';
    const line = document.createElement('p'); line.className = 'st-header-line'; line.textContent = 'Transfer · batch 25';
    sheet.querySelector('.st-page-titles').append(line);
  }, d);
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(out, name) });
  await p.close();
}

// 16d, 16e: Not arrived opened (owner, 2026-11-03): the pigs without ID are one number; the ones with ID sit in Fostering's With ID
//     picker (search and scan in one box, a read ticks). Ticking a pig that turned up makes the footer Move to, to put her in a pen.
const WITH_ID_CSS = `
  .m-ids{display:flex;flex-direction:column;gap:8px}
  .m-ids-head{display:flex;align-items:baseline;justify-content:space-between;margin:0;font:500 15px/1.5 var(--font-sans,inherit);color:var(--ink,#20291f)}
  .m-ids-count{font:400 13px/1.5 var(--font-sans,inherit);color:var(--muted,#657060)}
  .m-ids .st-choice-search{margin:0}
  .m-id-box{border:1px solid var(--line,#dfe4d8);border-radius:var(--radius-panel,18px);background:var(--paper,#fff);overflow:clip}
  .m-id-box>.st-row+.st-row{border-top:1px solid var(--line,#dfe4d8)}
  .st-choice-trail input[type="checkbox"]{accent-color:#276640!important}
  .m-id-box .st-row.selected{background:var(--paper,#fff)!important}`;
for (const [name, ticked] of [['mock-16d-not-arrived.png', []], ['mock-16e-not-arrived-move.png', ['000903']]]) {
  if (!want(name.slice(5, 8))) continue;
  const p = await open(INSPECT, 'inspection.walk');
  await prep(p);
  await p.evaluate(({ UNIT_CSS, WITH_ID_CSS, ticked }) => {
    const { U, ic, page, footer, primary } = window.M;
    const pigs = [['000903', 'Gilt · was A3'], ['000911', 'Barrow · was B2']];
    const rows = pigs.map(([id, d]) => U.rowSelect({ code: id, description: d, right: { kind: 'state', figure: '', word: '', level: 'settled' }, checked: ticked.includes(id), fill: false, action: 'x', value: id }).replace('class="', ticked.includes(id) ? 'class="selected ' : 'class="')).join('');
    const search = U.choiceSearch({ label: 'Search pig ID', placeholder: 'Pig ID', value: '', clear: { action: 'x' }, scan: { action: 'x', label: 'Scan ear tags' } });
    const body = '<section class="feature-section">' + U.rowGroup(U.row({ icon: ic('tag-off'), title: '13 pigs', description: 'Without ID' })) + '</section>'
      + '<section class="feature-section m-ids"><p class="m-ids-head"><span>With ID</span><span class="m-ids-count">' + ticked.length + ' of ' + pigs.length + '</span></p>'
      + search + '<div class="m-id-box">' + rows + '</div></section>';
    const foot = ticked.length
      ? footer('<div class="m-left"><strong>' + ticked.length + ' found</strong><small>' + ticked.join(' · ') + '</small></div>', primary('Move to'))
      : '<div class="sheet-footer" data-ds="Sheet">' + U.backButton({ action: 'x' }) + '</div>';
    page('Not arrived', 'Batch 25 · 15 pigs', body, foot);
    const st = document.createElement('style'); st.textContent = UNIT_CSS + WITH_ID_CSS; document.head.append(st);
  }, { UNIT_CSS, WITH_ID_CSS, ticked });
  await shoot(p, name);
}

await b.close(); server.kill();
