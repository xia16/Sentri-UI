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
    const count = '<section class="feature-section">' + U.stepper({ variant: 'well', label: 'All pigs in D4', value: all, min: kept.length, max: 80, action: 'x', reserveHint: false }) + '</section>';
    const search = U.choiceSearch({ label: 'Search ear tag', placeholder: 'Ear tag', value: '', clear: { action: 'x' }, scan: { action: 'x', label: 'Scan ear tags' } });
    const tags = '<section class="feature-section inspect-list m-list">' + U.heading({ title: 'Ear tags · ' + kept.length, icon: ic('tag'), kind: 'section', level: 3 })
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

// 10. Recount · Unit 7, part-way: each pen a row with what was found; a pen not counted yet says so; tap any pen to count it.
if (want('10')) {
  const p = await open(INSPECT, 'inspection.walk');
  await prep(p);
  await p.evaluate((UNIT_CSS) => {
    const { U, ic, page, footer, primary } = window.M;
    const pen = (code, figure, done) => U.row({ variant: 'navigation', code, chip: { text: done ? 'Counted' : 'To do', kind: done ? 'done' : 'awaiting' }, trail: 'chevron', action: 'x', className: 'm-line' })
      .replace('<span class="st-row-chevron">', (figure ? '<span class="st-row-trailing">' + figure + '</span>' : '') + '<span class="st-row-chevron">');
    const bar = '<div class="m-recv-bar"><div class="m-recv-figs"><strong>3</strong><span>of 4 pens counted</span></div><div class="m-recv-track" data-status-part="bar"><i class="done" style="flex:1"></i><i class="done" style="flex:1"></i><i class="done" style="flex:1"></i><i style="flex:1"></i></div><small>Started 09:05 · L.M</small></div>';
    const list = U.heading({ title: 'Pens', icon: ic('grid'), kind: 'section', level: 3 })
      + U.rowGroup(pen('C1', '3', true) + pen('C2', '2', true) + pen('D4', '16', true) + pen('D5', '', false));
    const left = '<div class="m-left"><strong>D5 still to count</strong><small>Pens you skip stay as recorded</small></div>';
    page('Recount', 'Unit 7', bar + list, footer(left, primary('Finish recount')));
    const st = document.createElement('style'); st.textContent = UNIT_CSS; document.head.append(st);
  }, UNIT_CSS);
  await shoot(p, 'mock-10-unit-recount.png');
}

// 11. Finish recount: the unit's balance sheet as a ledger (owner, 2026-11-03). On record, each change signed, Counted: the lines add
//     up (59 + 2 − 1 + 0 = 60). Pigs found from another unit add; a pig not found subtracts and goes on the batch's balancing sheet; the
//     pigs without ear tags net across the unit's pens. Each change line opens its detail (11b–d).
//     Count: C1 3 · C2 2 · D4 16 (000801 000802 + 000512 from Unit 9, 000733 from Unit 6, 12 without; 000803 not found) · D5 39 (000915 + 38).
if (want('11')) {
  const p = await open(INSPECT, 'inspection.walk');
  await prep(p);
  await p.evaluate((UNIT_CSS) => {
    const { U, page } = window.M;
    const sum = (title, figure, end) => U.row({ title, trailing: figure, className: 'm-sum' + (end ? ' m-end' : '') });
    const change = (title, description, figure, cls = '') => U.row({ variant: 'navigation', title, description, trailing: figure, trail: 'chevron', action: 'x', className: cls });
    const ledger = '<section class="feature-section m-ledger">' + U.rowGroup(sum('On record', '59')
      + change('Found from other units', '000512, 000733', '+2')
      + change('Not found', '000803 · to batch 25 balancing sheet', '−1', 'm-owed')
      + change('Without ear tags', 'D4 −1 · D5 +1', '0')
      + sum('Counted', '60', true)) + '</section>';
    page('Unit 7 balance sheet', 'Recount · 09:40 · L.M', ledger, '<div class="sheet-footer" data-ds="Sheet">' + U.backButton({ action: 'x' }) + U.button({ label: 'Save recount', register: 'primary', action: 'x' }) + '</div>');
    const st = document.createElement('style'); st.textContent = UNIT_CSS; document.head.append(st);
  }, UNIT_CSS);
  await shoot(p, 'mock-11-unit-balance.png');
}

// 11b–d. A ledger line opened: the pigs behind it, with the same signed figure on top.
const DETAILS = [
  ['mock-11b-found.png', 'Found from other units', '+2', [['000512', 'Was Unit 9 · C3', '→ D4'], ['000733', 'Was Unit 6 · D2', '→ D4']], 'Saved, they move into D4 and leave their old units.'],
  ['mock-11c-not-found.png', 'Not found', '−1', [['000803', 'Recorded in D4 · in no pen counted', '−1']], 'She goes on batch 25 balancing sheet. A later count, transfer or death closes it; still open when the batch ends, she is an unaccounted loss.'],
  ['mock-11d-without-tags.png', 'Without ear tags', '0', [['D4', 'Recorded 13, counted 12', '−1'], ['D5', 'Recorded 37, counted 38', '+1']], 'Pigs moved between pens and not recorded balance out inside the unit.'],
];
for (const [name, title, figure, rows, note] of DETAILS) {
  if (!want(name.slice(5, 8))) continue;
  const p = await open(INSPECT, 'inspection.walk');
  await prep(p);
  await p.evaluate(({ UNIT_CSS, title, figure, rows, note }) => {
    const { U, page } = window.M;
    const body = '<section class="feature-section m-ledger">' + U.rowGroup(U.row({ title: 'Unit 7', trailing: figure, className: 'm-sum' })
      + rows.map(([code, description, trailing]) => U.row({ code, description, trailing, className: 'm-line' })).join(''))
      + '<p class="m-hint m-explain">' + note + '</p></section>';
    page(title, 'Unit 7 balance sheet', body, '<div class="sheet-footer" data-ds="Sheet">' + U.backButton({ action: 'x' }) + '</div>');
    const st = document.createElement('style'); st.textContent = UNIT_CSS; document.head.append(st);
  }, { UNIT_CSS, title, figure, rows, note });
  await shoot(p, name);
}

// 12. Receive pigs into one pen: the same pen count. All pigs put in N3, then the ear tags, so each tagged pig is placed in its pen.
if (want('12')) {
  const p = await open(INSPECT, 'inspection.walk');
  await prep(p);
  await p.evaluate((UNIT_CSS) => {
    const { U, ic, page, footer, primary } = window.M;
    const pig = (id, ctx) => U.rowSelectDoor({ code: id, description: ctx, contextWidth: '240px', right: { kind: 'tags', tags: [] }, checked: true, value: id, action: '', openAction: 'pig', openValue: id, className: 'inspect-pig roster-pig selected', label: id });
    const count = '<section class="feature-section">' + U.stepper({ variant: 'well', label: 'All pigs put in N3', value: 14, min: 1, max: 80, action: 'x', reserveHint: false }) + '</section>';
    const search = U.choiceSearch({ label: 'Search ear tag', placeholder: 'Ear tag', value: '', clear: { action: 'x' }, scan: { action: 'x', label: 'Scan ear tags' } });
    const tags = '<section class="feature-section inspect-list m-list">' + U.heading({ title: 'Ear tags · 1', icon: ic('tag'), kind: 'section', level: 3 })
      + '<div class="m-inline-bar">' + search + '</div>' + U.rowGroup(pig('000904', 'Gilt · from B4')) + '</section>';
    const left = '<div class="m-left"><strong>13 without ear tags</strong><small>Into N3 · batch 25</small></div>';
    page('Put pigs in N3', 'Receive · Unit 9', count + tags, footer(left, primary('Done')));
    const st = document.createElement('style'); st.textContent = UNIT_CSS + '.st-choice-trail input[type="checkbox"]{accent-color:#276640!important}.inspect-pig.selected,.roster-pig.selected{background:var(--paper,#fff)!important}'; document.head.append(st);
  }, UNIT_CSS);
  await shoot(p, 'mock-12-receive-pen.png');
}

// 8 (redrawn). Receive pigs into Unit 9: received against sent on top, then the unit's pens; tap a pen to put pigs in it.
if (want('8-')) {
  const p = await open(INSPECT, 'inspection.walk');
  await prep(p);
  await p.evaluate((UNIT_CSS) => {
    const { U, ic, page, footer, primary } = window.M;
    const pen = (code, figure, what) => U.row({ variant: 'navigation', code, description: what, trailing: figure, trail: 'chevron', action: 'x', className: 'm-line' });
    const bar = '<div class="m-recv-bar"><div class="m-recv-figs"><strong>112</strong><span>of 120 received</span></div><div class="m-recv-track" data-status-part="bar"><i class="done" style="flex:112"></i><i style="flex:8"></i></div><small>Batch 25 · from Farrowing room 3</small></div>';
    const list = U.heading({ title: 'Pens', icon: ic('grid'), kind: 'section', level: 3 })
      + U.rowGroup(pen('N1', '15', 'Put in') + pen('N2', '15', 'Put in') + pen('N3', '14', 'Put in · 1 with ear tag') + pen('N4', '16', 'Put in') + pen('N5', '15', 'Put in') + pen('N6', '15', 'Put in') + pen('N7', '12', 'Put in') + pen('N8', '10', 'Put in') + pen('N9', '', 'Empty'));
    const left = '<div class="m-left"><strong>8 still to come</strong><small>120 sent</small></div>';
    page('Receive pigs', 'Batch 25 · into Unit 9', bar + list, footer(left, primary('Finish receiving')));
    const st = document.createElement('style'); st.textContent = UNIT_CSS; document.head.append(st);
  }, UNIT_CSS);
  await shoot(p, 'mock-8-receive.png');
}

// 9 (redrawn). Pigs to move: a reference list. A pen sending only some of its pigs says how many of how many, and names who stays.
if (want('9-')) {
  const p = await open(INSPECT, 'inspection.walk');
  await prep(p);
  await p.evaluate((UNIT_CSS) => {
    const { U, ic, page } = window.M;
    const pen = (code, head, rows) => '<section class="inspect-pen m-card"><header class="inspect-pen-head"><span class="pen-name"><strong>' + code + '</strong><small>· ' + head + '</small></span></header>' + rows + '</section>';
    const heads = (n) => U.row({ icon: ic('tag-off'), title: n + ' pigs', description: 'Without ear tags' });
    const tagged = (id, ctx) => U.row({ code: id, description: ctx, trail: 'chevron', action: 'x' });
    const stays = (id, ctx) => U.row({ code: id, description: ctx, className: 'm-stays' });
    const head = '<div class="m-recv-bar"><div class="m-recv-figs"><strong>120</strong><span>pigs to move</span></div><small>From Farrowing room 3 to Unit 9 · today</small></div>';
    const list = '<div class="inspect-list m-list">'
      + pen('B1', 'all 11 move', heads(11))
      + pen('B2', '12 of 13 move', heads(12) + stays('000901', 'Stays in B2 · kept for breeding'))
      + pen('B3', 'all 10 move', heads(10))
      + pen('B4', 'all 13 move', heads(12) + tagged('000904', 'Gilt')) + '</div>';
    page('Pigs to move', 'Transfer · batch 25', head + list, '<div class="sheet-footer" data-ds="Sheet">' + U.backButton({ action: 'x' }) + U.button({ label: 'Receive in Unit 9', register: 'primary', action: 'x' }) + '</div>');
    const st = document.createElement('style'); st.textContent = UNIT_CSS + `.m-stays{background:var(--well,#eef1e7)}.m-stays .st-row-code,.m-stays .st-row-copy small{color:var(--muted,#657060)}`; document.head.append(st);
  }, UNIT_CSS);
  await shoot(p, 'mock-9-transfer-out.png');
}

await b.close(); server.kill();
