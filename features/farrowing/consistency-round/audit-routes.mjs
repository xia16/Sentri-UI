// Verify Farrowing's real entrances, in addition to the preset replay in
// audit-entries.mjs. This only drives the local prototype; it writes evidence.
// SENTRI_PLAYWRIGHT=/path/to/playwright node features/farrowing/consistency-round/audit-routes.mjs
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { playwright } from '../../../scripts/playwright-path.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const port = 4735;
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, [path.join(root, 'scripts/serve-ux.cjs'), String(port)], { cwd: root, stdio: 'ignore' });
const browser = await playwright().chromium.launch();
const results = [];
const url = id => `${base}/ux/system/farrowing-astra-concept.html?layout=focus&screen=farrowing.${id}`;
const action = (name, value) => `[data-card="0"] [data-action="${name}"]${value === undefined ? '' : `[data-value="${value}"]`}`;

async function open(id = 'room', extra = '', scanTag = '') {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  // The demo's fixed reader sequence lacks Finished and Sow died. Substitute
  // one read in memory to exercise their real scan routing without changing
  // the checked-in prototype or its records.
  if (scanTag) await page.route('**/farrowing-astra-concept.js*', async route => {
    const response = await route.fetch();
    const source = await response.text();
    const body = source.replace(/const scanSequence=\[[^;]+;/, `const scanSequence=['${scanTag}'];`);
    if (body === source) throw new Error('scan sequence not found in intercepted source');
    await route.fulfill({ response, body });
  });
  for (let attempt = 0; attempt < 30; attempt++) {
    try { await page.goto(url(id) + extra, { waitUntil: 'domcontentloaded' }); break; }
    catch (error) { if (attempt === 29) throw error; await new Promise(resolve => setTimeout(resolve, 100)); }
  }
  await page.locator('html.atlas-ready').waitFor({ timeout: 20000 });
  return page;
}
async function current(page) {
  return page.evaluate(() => ({
    id: window.AtlasBare?.current?.() || (window.FarrowingStudy?.states?.[0]?.view === 'room' ? 'farrowing.room' : null),
    view: window.FarrowingStudy?.states?.[0]?.view || null,
    tag: window.FarrowingStudy?.states?.[0]?.tag || null,
    pig: window.FarrowingStudy?.room?.(0)?.pig || null,
    locked: !!window.FarrowingStudy?.states?.[0]?.locked,
    ended: !!window.FarrowingStudy?.states?.[0]?.ended,
    title: document.querySelector('[data-card="0"] .phone .sheet-title, [data-card="0"] .phone .st-page-header h1')?.textContent?.trim() || null
  }));
}
async function tap(page, name, value) {
  await page.locator(action(name, value)).first().click();
  await page.waitForTimeout(35);
}
async function check(label, expected, run, options = {}) {
  const page = await open(options.start || 'room', options.extra || '', options.scanTag || '');
  try {
    await run(page);
    if (options.iframe) await page.waitForTimeout(350);
    const observed = await current(page);
    const pass = observed.id === expected;
    results.push({ label, start: options.start || 'room', expected, ...observed, pass });
    console.log(`${pass ? 'PASS' : 'DIFF'} ${label}: ${observed.id} (${observed.view}, ${observed.tag})`);
  } catch (error) {
    results.push({ label, start: options.start || 'room', expected, id: null, pass: false, error: String(error) });
    console.log(`ERROR ${label}: ${error}`);
  } finally { await page.close(); }
}

const roomTags = [
  ['Awaiting', '000392', 'farrowing.before'],
  ['Farrowing', '000418', 'farrowing.count'],
  ['Finished', '000406', 'farrowing.locked'],
  ['Sow died', '000399', 'farrowing.ended']
];

try {
  // The two actual Home cards, then the room's four status-specific sow doors.
  for (const [label, homeURL] of [
    ['Home Overview', `${base}/ux/system/home-astra-prototype.html?section=farrowing&view=overview`],
    ['Home Unit 7', `${base}/ux/system/home-astra-prototype.html?section=farrowing&view=unit&unit=7`]
  ]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    try {
      await page.goto(homeURL);
      await page.locator('[data-card="farrow28"]').first().click();
      await page.waitForURL('**/farrowing-astra-concept.html**');
      await page.locator('[data-card="0"] .phone').waitFor({ timeout: 20000 });
      const landing = await page.evaluate(() => ({ pathname: location.pathname, entry: new URLSearchParams(location.search).get('entry'), unit: new URLSearchParams(location.search).get('unit') }));
      const observed = await current(page);
      const pass = landing.pathname.endsWith('/farrowing-astra-concept.html') && landing.entry === (label === 'Home Overview' ? 'overview' : 'unit') && observed.id === 'farrowing.room';
      results.push({ label, start: 'home', expected: 'farrowing.room', ...observed, ...landing, pass });
      console.log(`${pass ? 'PASS' : 'DIFF'} ${label}: ${JSON.stringify(landing)}`);
    } catch (error) {
      results.push({ label, start: 'home', expected: 'farrowing.room', id: null, pass: false, error: String(error) });
      console.log(`ERROR ${label}: ${error}`);
    } finally { await page.close(); }
  }

  for (const [state, tag, expected] of roomTags) {
    await check(`Room All → ${state}`, expected, page => tap(page, 'room-sow', tag));
    await check(`Room ${state} tab → ${state}`, expected, async page => {
      await tap(page, 'room-lens', state === 'Farrowing' ? 'Active' : state === 'Awaiting' ? 'Awaiting' : 'Done');
      await tap(page, 'room-sow', tag);
    });
    await check(`Find → ${state}`, expected, async page => {
      await tap(page, 'room-search');
      await page.locator('[data-card="0"] [data-room-search]').fill(tag);
      await tap(page, 'room-sow', tag);
    });
  }
  await check('Find → same-unit non-task pig', 'farrowing.pig-not-in-task', async page => {
    await tap(page, 'room-search');
    await page.locator('[data-card="0"] [data-room-search]').fill('004305');
    await tap(page, 'room-pig', '004305');
  });
  await check('Find → other-unit non-task pig', 'farrowing.pig-not-in-task', async page => {
    await tap(page, 'room-search');
    await page.locator('[data-card="0"] [data-room-search]').fill('000434');
    await tap(page, 'room-pig', '000434');
  });
  await check('Find → sow → Back keeps results', 'farrowing.search-results', async page => {
    await tap(page, 'room-search');
    await page.locator('[data-card="0"] [data-room-search]').fill('000392');
    await tap(page, 'room-sow', '000392');
    await tap(page, 'close');
  });
  await check('Find → Scan → Back', 'farrowing.search', async page => {
    await tap(page, 'room-search');
    await tap(page, 'room-scan');
    await tap(page, 'room-back');
  });
  await check('Find → no match', 'farrowing.search-none', async page => {
    await tap(page, 'room-search');
    await page.locator('[data-card="0"] [data-room-search]').fill('909090');
  });

  const scanCases = [
    ['Awaiting', 0, 'farrowing.scan-read', '000431'],
    ['other-unit non-task pig', 1, 'farrowing.pig-not-in-task', '000434'],
    ['other-unit task sow', 2, 'farrowing.scan-read', '004318'],
    ['unknown tag', 3, 'farrowing.scan-unknown', '000999'],
    ['Farrowing', 4, 'farrowing.scan-read', '000418']
  ];
  for (const [label, seq, expected, tag] of scanCases) {
    await check(`Scan → ${label}`, expected, async page => {
      await tap(page, 'room-scan');
      await page.evaluate(n => { window.FarrowingStudy.room(0).scan.seq = n; }, seq);
      await page.locator('[data-card="0"] [data-demo-scan]').evaluate(button => button.click());
      await page.waitForTimeout(40);
      const got = await current(page);
      if (expected === 'farrowing.scan-read' && got.tag !== tag) throw new Error(`opened ${got.tag} instead of ${tag}`);
    });
  }
  for (const [label, tag, ended] of [['Finished', '000406', false], ['Sow died', '000399', true]]) {
    await check(`Scan → ${label} (substituted reader tag)`, 'farrowing.scan-read', async page => {
      await tap(page, 'room-scan');
      await page.locator('[data-card="0"] [data-demo-scan]').evaluate(button => button.click());
      await page.waitForTimeout(40);
      const got = await current(page);
      if (got.tag !== tag || !got.locked || got.ended !== ended) throw new Error(`wrong record: ${JSON.stringify(got)}`);
    }, { scanTag: tag });
  }
  await check('Scan → sow → Back still listening', 'farrowing.scan', async page => {
    await tap(page, 'room-scan');
    await page.locator('[data-card="0"] [data-demo-scan]').evaluate(button => button.click());
    await tap(page, 'close');
  });
  await check('Scan without reader', 'farrowing.scan-no-reader', page => tap(page, 'room-scan'), { extra: '&scanner=off' });
  await check('Scan stopped', 'farrowing.scan-stopped', async page => { await tap(page, 'room-scan'); await tap(page, 'room-scan-toggle'); });

  for (const [state, start] of [['Farrowing', 'count'], ['Finished', 'locked'], ['Sow died', 'ended']]) {
    await check(`${state} record → sow Actions`, 'farrowing.sow-actions', page => tap(page, 'sowActions'), { start });
  }
  for (const [state, start] of [['Farrowing', 'count'], ['Finished', 'locked']]) {
    await check(`${state} Actions → Note`, 'farrowing.note', async page => {
      await tap(page, 'sowActions');
      await page.frameLocator('[data-card="0"] iframe.sow-detail-frame').locator('[data-action="sow-host-action"][data-value="marker"]').first().click();
    }, { start, iframe: true });
    await check(`${state} Actions → Piglet processing`, 'farrowing.piglet-care', async page => {
      await tap(page, 'sowActions');
      await page.frameLocator('[data-card="0"] iframe.sow-detail-frame').locator('[data-action="sow-host-action"][data-value="piglets"]').first().click();
    }, { start, iframe: true });
    await check(`${state} Actions → Foster`, 'farrowing.foster', async page => {
      await tap(page, 'sowActions');
      await page.frameLocator('[data-card="0"] iframe.sow-detail-frame').locator('[data-action="sow-host-action"][data-value="foster"]').first().click();
    }, { start, iframe: true });
    await check(`${state} Actions → Reconcile`, 'farrowing.reconcile', async page => {
      await tap(page, 'sowActions');
      await page.frameLocator('[data-card="0"] iframe.sow-detail-frame').locator('[data-action="sow-host-action"][data-value="countReconcile"]').first().click();
    }, { start, iframe: true });
  }
  for (const [state, start] of [['Finished', 'locked'], ['Sow died', 'ended']]) {
    await check(`${state} record → Piglets`, 'farrowing.piglets', page => tap(page, 'pigletList'), { start });
  }
  await check('Farrowing record → Details → log', 'farrowing.history', async page => {
    await tap(page, 'litter');
    await tap(page, 'history');
  }, { start: 'count' });
  await check('Finished record → Details → log', 'farrowing.history', async page => {
    await tap(page, 'litter');
    await tap(page, 'history');
  }, { start: 'locked' });
  await check('Task overview → End task blocked', 'farrowing.task-blocked', async page => {
    await tap(page, 'room-overview');
    await tap(page, 'room-end-review');
  });
  await check('Task outcomes preset → End task', 'farrowing.task-outcomes', async page => {
    await tap(page, 'room-back');
    await tap(page, 'room-end-review');
  }, { start: 'task-outcomes' });

  const output = path.join(here, 'route-results.json');
  writeFileSync(output, JSON.stringify(results, null, 2) + '\n');
  console.log(`Checked ${results.length} routes; ${results.filter(x => !x.pass).length} differences → ${path.relative(root, output)}`);
} finally {
  await browser.close();
  server.kill();
}
