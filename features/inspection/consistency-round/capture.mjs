// Walk the real prototype controls, then capture the review's 390 × 844 states.
// Start `node scripts/serve-ux.cjs 4319` from this checkout before running.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { routeFonts } from '../../../scripts/font-route.mjs';
import { playwright } from '../../../scripts/playwright-path.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const origin = process.env.SENTRI_REVIEW_URL || 'http://127.0.0.1:4319';
const baseline = 'df82ba5dbaf690fab32cfd4437c66457c4e17b9e';
const oldCrossUnit = 'baa057e5624bcfb54c8bf24c344bb58ed36756e9';
const checkOnly = process.argv.includes('--check');
const proposal = process.env.SENTRI_INSPECTION_PROPOSAL;
const width = 390;
const lang = process.env.SENTRI_REVIEW_LANG || 'en';
const browser = await playwright().chromium.launch();
const context = await browser.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
await routeFonts(context, path.join(here, '../../..'));
if (proposal) {
  await context.route(/\/ux\/system\/inspection-astra-concept\.js(?:\?|$)/, route => {
    if (new URL(route.request().url()).pathname.startsWith('/@')) return route.fallback();
    return route.fulfill({ path: proposal, contentType: 'text/javascript' });
  });
}
const page = await context.newPage();
page.setDefaultTimeout(5500);
const errors = [], checks = [];
page.on('pageerror', error => errors.push(error.message));
if (!checkOnly) fs.mkdirSync(path.join(here, 'screenshots'), { recursive: true });

const control = (action, value) => `[data-action="${action}"]${value === undefined ? '' : `[data-value="${value}"]`}`;
const phone = () => page.locator('.atlas-phone, [data-card="0"] .phone').first();
const live = (selector) => phone().locator(`${selector}:not([inert] *)`);
const tap = (action, value) => live(control(action, value)).last().click();
const fill = (selector, value) => live(selector).last().fill(value);
const inspect = (screen = 'walk', ref, extra = '') => `${origin}${ref ? '/@' + ref : ''}/ux/system/inspection-astra-concept.html?layout=focus&screen=inspection.${screen}&lang=${lang}${extra}`;
const farrow = (screen = 'room', ref) => `${origin}${ref ? '/@' + ref : ''}/ux/system/farrowing-astra-concept.html?layout=focus&screen=farrowing.${screen}&lang=${lang}`;
const home = (extra = '') => `${origin}/ux/system/home-astra-prototype.html?section=gestation&view=unit&unit=7&screen=workbench.unit&lang=${lang}${extra}`;
const view = () => page.locator('[data-card="0"]').getAttribute('data-view');
const screen = () => page.evaluate(() => window.AtlasBare?.current?.());
const checksFor = selector => live(`${selector}:checked`).evaluateAll(rows => rows.map(el => el.dataset.pigSelect).sort());
const ticks = () => checksFor('[data-pig-select]');
const tick = id => live(`[data-pig-select="${id}"]`).check();
const untick = id => live(`[data-pig-select="${id}"]`).uncheck();
const demoScan = () => page.locator('[data-card="0"] [data-demo-scan]').evaluate(el => el.click()); // prototype's reader simulation, outside the phone
const visibleText = () => phone().locator(':scope > .sheet, :scope > [data-lookup], :scope > .inspect-main:not([inert])').last().innerText();
const findInput = () => live('[data-find-input]');
const reportText = 'Feeder jams when the gate opens.';

async function open(url) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  if (url.includes('screen=')) await page.locator('html.atlas-ready').waitFor({ timeout: 12500 });
}
async function shot(id, target = phone()) {
  if (!checkOnly) await target.screenshot({ type: 'jpeg', quality: 84, animations: 'disabled', path: path.join(here, 'screenshots', id + '.jpg') });
}
async function check(label, run) {
  await run();
  checks.push(label);
  console.log('PASS', label);
}
async function checkedScan() {
  await demoScan(); await demoScan();
  assert.deepEqual(await ticks(), ['000267', '000306']);
}
async function singleActionsFromScan() {
  await tap('pig', '000306');
  assert.equal(await screen(), 'pig-profile.full');
  await tap('pig-actions');
  assert.equal(await screen(), 'pig-profile.actions');
}

try {
  await check('Home Unit 7 → Inspect unit → same Home unit', async () => {
    await open(home()); await shot('01-home');
    await page.locator('.atlas-phone [data-action="inspect"]').click();
    await page.waitForURL('**/inspection-astra-concept.html?**');
    assert.equal(new URL(page.url()).searchParams.get('unit'), '7');
    assert.match(await phone().locator('.inspect-main').innerText(), /Unit 7|7\s*单元/);
    await tap('home'); await page.waitForURL('**/home-astra-prototype.html?**');
    assert.equal(new URL(page.url()).searchParams.get('unit'), '7');
  });
  for (const [entry, key] of [['to-treat', 'treat'], ['monitoring', 'monitor']]) {
    await check(`Home ${entry} → the pig’s unit in Health → original Home list`, async () => {
      await open(`${origin}/ux/system/home-astra-prototype.html?section=gestation&sheet=${key}&screen=workbench.${entry}&lang=${lang}`);
      await shot(`46-home-${key}`);
      const row = page.locator('.atlas-phone ' + control('marked-pig', '7')).first();
      await row.click(); await page.waitForURL('**/inspection-astra-concept.html?**');
      assert.equal(new URL(page.url()).searchParams.get('lens'), 'Health');
      assert.equal(await live(control('lens', 'Health')).getAttribute('aria-pressed'), 'true');
      if (key === 'treat') await shot('47-home-health');
      await tap('home'); await page.waitForURL('**/home-astra-prototype.html?**');
      assert.equal(new URL(page.url()).searchParams.get('sheet'), key);
      await page.locator(control('marked-pig', '7')).first().waitFor();
    });
  }
  await check('Home Lookup stays in Home and opens the shared pig record', async () => {
    await open(home());
    await page.locator('.atlas-phone .bottom-nav ' + control('search')).click();
    await page.locator('.atlas-phone [data-find-input]').fill('204318');
    await shot('02-home-lookup');
    assert.equal(await page.locator('.atlas-phone [data-find-input]').inputValue(), '204318');
    const row = page.locator('.atlas-phone .st-find-results [data-action="lookup-pig"][data-value="204318"]').first();
    await row.waitFor();
    await row.click();
    const record = page.frameLocator('.atlas-phone iframe.home-pig-frame').locator('[data-card="0"] .phone');
    await record.locator(control('pig-actions')).waitFor();
    assert.match(await record.innerText(), /204318/);
    await record.locator(control('back')).last().click();
    assert.equal(await page.locator('.atlas-phone [data-find-input]').inputValue(), '204318');
  });
  await check('Baseline: Find → Scan → single Actions loses one tick and Back skips Find', async () => {
    await open(inspect('walk', baseline));
    await tap('search'); await findInput().fill('30'); await shot('03-find-results');
    await tap('scan'); await checkedScan(); await shot('04-scan-two');
    await singleActionsFromScan(); await shot('05-scan-pig-actions');
    await tap('back'); await tap('back'); assert.deepEqual(await ticks(), ['000306']);
    await shot('06-old-scan-one'); await tap('back');
    assert.equal(await view(), 'list'); await shot('07-old-find-back');
  });
  await check('Find and dock open the same full-screen Scan; Back restores the search or the walk', async () => {
    await open(inspect()); await tap('search');
    await findInput().fill('does-not-match'); assert.equal(await screen(), 'inspection.search-none');
    await findInput().fill('30'); await tap('search-pig', '000306');
    assert.equal(await screen(), 'pig-profile.full');
    await tap('back'); assert.equal(await findInput().inputValue(), '30');
    await tap('scan'); await live('[data-lookup="scan"]').waitFor();
    await tap('scan-toggle'); assert.equal(await screen(), 'inspection.scan-stopped'); await shot('08-scan-stopped');
    await tap('scan-toggle'); await checkedScan();
    await singleActionsFromScan();
    await tap('back'); await tap('back'); assert.deepEqual(await ticks(), ['000267', '000306']);
    await shot('09-new-scan-two');
    await tap('actions'); assert.equal(await screen(), 'inspection.actions'); await shot('10-scan-bulk-actions');
    await tap('back'); assert.deepEqual(await ticks(), ['000267', '000306']);
    await tap('back'); assert.equal(await findInput().inputValue(), '30'); await shot('11-new-find-back');
    await tap('back'); assert.equal(await view(), 'list'); assert.deepEqual(await ticks(), ['000267', '000306']);
    await open(inspect()); await tap('scan'); assert.equal(await screen(), 'inspection.scan'); await tap('back'); assert.equal(await view(), 'list');
    await open(inspect('walk', undefined, '&scanner=off')); await tap('scan'); assert.equal(await screen(), 'inspection.scan-no-reader');
    assert.equal(await live(control('actions')).count(), 0); await shot('12-no-reader');
  });
  await check('Single-pig Actions preserves walk ticks on Back and saves only for that pig', async () => {
    await open(inspect());
    await tick('000254'); await tick('000267');
    await tap('review-sheet');
    const selectedText = await live('.review-list').last().innerText();
    assert.match(selectedText, /42d|天|\d+d/);
    assert.deepEqual(await ticks(), ['000254', '000267']); await shot('13-new-selected');
    await tap('actions'); assert.equal(await screen(), 'inspection.actions'); await shot('14-selected-bulk-actions');
    await tap('back'); assert.equal(await view(), 'review'); await tap('back');
    await tap('pig', '000254'); await tap('pig-actions'); assert.equal(await screen(), 'pig-profile.actions');
    await tap('back'); await tap('back'); assert.deepEqual(await ticks(), ['000254', '000267']);
    await tap('pig', '000254'); await tap('pig-actions');
    await tap('note'); await fill('[data-bulk-key="note"]', 'Check this pig tomorrow.'); await tap('bulk-save');
    assert.equal(await view(), 'list'); assert.deepEqual(await ticks(), []); await shot('50-saved-on-walk');
    await tap('pig', '000254'); assert.match(await visibleText(), /Check this pig tomorrow/);
    await tap('back'); await tap('pig', '000267'); assert.doesNotMatch(await visibleText(), /Check this pig tomorrow/);
  });
  await check('PenMap lands on C2; pen door opens faults, Pen log, and returns to that pen', async () => {
    await open(inspect());
    await tap('filters'); await shot('15-filters'); await tap('back');
    await tap('grid'); await shot('16-pen-map');
    await live('[data-ds="PenMap"] button[data-value="C2"]').click();
    await tap('pen-detail', 'C2'); assert.equal(await screen(), 'inspection.pen-faults');
    await tap('pen-log', 'C2'); assert.equal(await screen(), 'inspection.pen-log'); await tap('back');
    await tap('fault-record'); assert.equal(await screen(), 'inspection.fault-resolve');
    await tap('back'); await tap('back'); assert.equal(await view(), 'list');
    await tap('history'); assert.equal(await screen(), 'inspection.walk-log'); await shot('17-walk-history');
  });
  await check('Report → marker and pen record → resolve → equipment entries in Pen log', async () => {
    await open(inspect('walk', baseline)); await shot('18-old-walk-fault');
    await open(inspect());
    await tap('pen-detail', 'C1'); await tap('new-fault', 'C1');
    assert.equal(await screen(), 'inspection.fault-report'); await shot('20-new-live-report');
    await live('[data-picker-key="device"]').last().click(); await tap('picker-select', 'Other');
    assert.equal(await screen(), 'inspection.fault-report-other');
    assert.equal(await live('[data-v2="name"]').count(), 1); await shot('21-fault-other');
    await fill('[data-v2="name"]', 'Gate sensor'); await fill('[data-v2="description"]', reportText);
    await tap('back'); await tap('new-fault', 'C1');
    assert.equal(await live('[data-v2="description"]').inputValue(), reportText);
    await tap('save-fault'); assert.equal(await screen(), 'inspection.pen-faults'); await shot('22-pen-fault');
    await tap('back'); assert.equal(await screen(), 'inspection.fault-flag');
    assert.equal(await live(control('pen-detail', 'C1')).locator('.has-fault').count(), 1); await shot('23-new-walk-fault');
    await tap('pen-detail', 'C1'); await tap('fault-record'); await shot('24-fault-resolve');
    await live('[data-st-optional]').last().click();
    await fill('[data-v2="resolution"]', 'Cable reconnected.'); await tap('close-fault');
    assert.equal(await screen(), 'inspection.fault-resolved');
    assert.equal(await live(control('fault-record')).count(), 0);
    await tap('pen-log', 'C1');
    assert.match(await visibleText(), /Cable reconnected/); assert.match(await visibleText(), /Gate sensor/);
    await shot('25-pen-log');
    await tap('back'); await tap('back'); assert.equal(await live(control('pen-detail', 'C1')).locator('.has-fault').count(), 0);
  });
  await check('Existing equipment fault opened from its row or a duplicate report keeps one resolution draft', async () => {
    await open(inspect()); await tap('pen-detail', 'C2'); await tap('fault-record');
    await live('[data-st-optional]').last().click();
    await fill('[data-v2="resolution"]', 'Draft from the existing record.');
    await tap('back'); await tap('new-fault', 'C2'); await live('[data-picker-key="device"]').last().click();
    await tap('picker-select', 'Drinking station'); assert.equal(await screen(), 'inspection.fault-resolve');
    await live('[data-st-optional]').last().click();
    assert.equal(await live('[data-v2="resolution"]').inputValue(), 'Draft from the existing record.');
    await tap('close-fault'); assert.equal(await screen(), 'inspection.fault-resolved');
  });
  await check('Inspection pen → read / edit / close note; Feed, Observe and Tick all', async () => {
    await open(inspect()); await tap('pen-detail', 'C1'); await shot('26-inspection-pen');
    await tap('read-pen-note', 'C1'); assert.equal(await screen(), 'inspection.pen-read-note'); await shot('27-inspection-note');
    await tap('pen-note', 'C1'); await shot('28-inspection-note-edit');
    await fill('[data-v2="note"]', 'Keep the aisle clear.'); await tap('save-pen-note');
    assert.equal(await screen(), 'inspection.pen-read-note'); await tap('close-pen-note');
    await tap('pen-log', 'C1'); assert.match(await visibleText(), /Keep the aisle clear/); await tap('back');
    await tap('feed', 'C1'); assert.equal(await screen(), 'feed-plan.pen'); await shot('29-inspection-feed'); await tap('back');
    await tap('pen-observe', 'C1'); assert.equal(await screen(), 'inspection.pen-observe'); await shot('30-inspection-observe'); await tap('back');
    await tap('tick-pen', 'C1'); assert.deepEqual(await ticks(), ['000254', '000267', '000281']);
    await tap('actions'); assert.equal(await screen(), 'inspection.actions');
    assert.equal(await live('[data-action-group="production"]').count(), 0);
  });
  await check('Farrowing has its own pen page and pen tools', async () => {
    await open(farrow()); await tap('room-pen-detail', 'B1'); await shot('31-farrowing-pen');
    await tap('room-pen-feed'); await shot('32-farrowing-feed'); await tap('room-back');
    await tap('room-pen-note'); await shot('33-farrowing-note-edit'); await tap('room-back');
    await tap('room-pen-fault'); await shot('34-farrowing-fault'); await tap('room-back');
    await tap('room-pen-log'); await shot('35-farrowing-pen-log'); await tap('room-back'); await tap('room-back');
    assert.equal(await screen(), 'farrowing.room');
  });
  await check('Cross-unit lookup: real Unit 6 record, no selection into the walk; earlier Move proposal stays disabled', async () => {
    await open(inspect()); await tap('search'); await findInput().fill('000430'); await shot('36-cross-unit-result');
    await tap('search-pig', '000430'); assert.match(await visibleText(), /Unit 6|6\s*单元/); await shot('37-cross-unit-record');
    await tap('pig-actions'); assert.equal(await live('[data-action-group="production"]').count(), 0); await shot('38-cross-unit-actions');
    await tap('back'); await tap('back'); await tap('back'); assert.deepEqual(await ticks(), []);
    const archived = [['scan-other-unit', '39-old-cross-unit-scan'], ['scan-move', '40-old-cross-unit-choices'], ['scan-move-pen', '41-old-cross-unit-pen']];
    if ((await context.request.get(inspect(archived[0][0], oldCrossUnit))).ok()) {
      for (const [id, img] of archived) { await open(inspect(id, oldCrossUnit)); await shot(img); }
      assert.equal(await live(control('scan-move-confirm')).isDisabled(), true);
    } else {
      // This study was never merged. Fresh clones can reuse the captured historical evidence.
      for (const [, img] of archived) assert.ok(fs.existsSync(path.join(here, 'screenshots', img + '.jpg')));
      console.log('KEEP historical cross-unit screenshots (the study commit is not in this clone)');
    }
  });
  await check('Production card and single Actions both enter Farrowing; completed sow has no active task', async () => {
    await open(inspect('batch-farrowing'));
    await tap('pig', '000254'); assert.equal(await live(control('open-farrowing')).count(), 0); await shot('42-farrowing-completed-sow'); await tap('back');
    await tap('pig', '000281'); assert.equal(await live(control('open-farrowing')).count(), 1); await shot('43-farrowing-active-card');
    await tap('pig-actions'); assert.equal(await live(control('open-farrowing')).count(), 1); await shot('44-farrowing-active-actions');
    await tap('open-farrowing'); await page.waitForURL('**/farrowing-astra-concept.html?**');
    assert.equal(new URL(page.url()).searchParams.has('tag'), false);
    await page.goBack({ waitUntil: 'domcontentloaded' }); await page.locator('html.atlas-ready').waitFor();
    await tap('pig', '000281'); await tap('open-farrowing'); await page.waitForURL('**/farrowing-astra-concept.html?**');
    assert.equal(new URL(page.url()).searchParams.has('tag'), false);
    await open(farrow()); await shot('45-farrowing-task-landing');
  });
  if (!checkOnly) {
    // The historical deck draws adjacent specimens in a wide carousel. Crop each phone from the wide layout.
    await page.setViewportSize({width: 1120, height: 1040});
    await open(`${origin}/@${baseline}/ux/archive/workflows.html`);
    await page.locator('.wchip[data-for="wf-fault"]').click();
    await page.addStyleTag({content: '.wnav{position:static!important}'});
    await shot('48-old-atlas-report', page.locator('#wf-fault .slide').nth(1).locator('.phone'));
    await page.locator('.wchip[data-for="wf-count"]').click();
    await shot('49-old-atlas-count', page.locator('#wf-count .slide').first().locator('.phone'));
  }
  assert.deepEqual(errors, [], 'Unhandled JavaScript errors');
  if (!checkOnly) fs.writeFileSync(path.join(here, 'verification.json'), JSON.stringify({ baseline, crossUnitStudy: oldCrossUnit, viewport: [width, 844], language: lang, checks }, null, 2) + '\n');
} finally {
  await browser.close();
}
