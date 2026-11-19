// Run against the local preview: node features/farrowing/actions-scope-round/capture.mjs
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { playwright } from '../../../scripts/playwright-path.mjs';

const base = process.env.SENTRI_REVIEW_URL || 'http://127.0.0.1:4317';
const browser = await playwright().chromium.launch();
const errors = [];
const results = {};
const action = (name, value) => `[data-action="${name}"]${value === undefined ? '' : `[data-value="${value}"]`}`;
const label = (page, name) => page.getByRole('button', { name, exact: true });
const control = (page, name, value) => page.locator('[data-card="0"] '+action(name, value));
const tap = (page, name, value) => control(page, name, value).first().click();
const state = page => page.evaluate(() => {
  const s = FarrowingStudy.states[0];
  return { alive: s.alive, draft: s.deathDraft, view: s.view, outcome: s.productionOutcome, born: FarrowingStudy.born(s), events: s.events.map(e => e.text) };
});
const embedded = page => page.frameLocator('iframe.sow-detail-frame');
const hostTap = (page, value) => embedded(page).locator(action('sow-host-action', value)).click();
const shot = async (page, name) => {
  await page.locator('[data-card="0"] .phone').screenshot({
    type: 'jpeg', quality: 88, animations: 'disabled',
    path: new URL('screenshots/' + name + '.jpg', import.meta.url).pathname
  });
};
async function open(screen) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(6000);
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto(`${base}/ux/system/farrowing-astra-concept.html?layout=focus&screen=farrowing.${screen}`);
  await page.locator('html.atlas-ready').waitFor();
  return page;
}
async function menu(page, key, expected) {
  await tap(page, 'sowActions');
  const production = embedded(page).locator('[data-action-group="production"]');
  await production.waitFor();
  const rows = await production.locator('button').evaluateAll(buttons => buttons.map(button => ({
    title: button.querySelector('strong')?.textContent?.trim(),
    disabled: button.disabled || button.getAttribute('aria-disabled') === 'true'
  })));
  assert.deepEqual(Object.fromEntries(rows.map(row => [row.title, row.disabled])), expected, key);
  results[key] = rows;
}
async function showProduction(page) {
  await embedded(page).locator('[data-action-group="production"]').evaluate(section => {
    const scroll = section.closest('.sheet-body');
    scroll.scrollTop = scroll.scrollHeight;
  });
}
async function closeMenu(page) {
  await embedded(page).getByRole('button', { name: 'Back', exact: true }).click();
}
async function fosterDirection(page, direction) {
  await hostTap(page, 'foster');
  await label(page, direction + ' piglets').click();
}
async function selectPiglet(page, id) {
  await page.getByRole('checkbox', { name: 'Select ' + id, exact: true }).check();
}
async function openPiglets(page) {
  await tap(page, 'pigletList');
  await page.locator('.litter-page').waitFor();
}
async function sendFromList(page, ids, prefix, after) {
  for (const id of ids) await selectPiglet(page, id);
  await tap(page, 'litterActions');
  await shot(page, prefix[0]);
  await tap(page, 'allocToSow');
  assert.equal(await label(page, 'Receive piglets').count(), 0);
  await shot(page, prefix[1]);
  await tap(page, 'fosterPick', '000406');
  await shot(page, prefix[2]);
  await tap(page, 'saveFoster');
  assert.equal((await state(page)).alive, after);
  assert.match(await page.locator('.litter-page').innerText(), /Sent and moved/);
  await shot(page, prefix[3]);
}
const options = (abortion, foster, batch = false) => ({
  'Record abortion': abortion,
  ...(foster === undefined ? {} : { 'Foster piglets': foster }),
  'Batch membership': batch
});

try {
  let page = await open('count');
  await shot(page, 'a01-active-record');
  await menu(page, 'Farrowing', options(false, false));
  await shot(page, 'a02-active-sow-actions-current');
  await showProduction(page);
  await shot(page, 'a03-active-actions-production-current');
  await fosterDirection(page, 'Send');
  await shot(page, 'a04-active-foster-send-direction');
  await tap(page, 'fosterPick', '000406');
  for (const id of ['418001', '418002']) await page.getByRole('checkbox', { name: 'Move ' + id, exact: true }).check();
  await shot(page, 'a05-active-send-select-three');
  await tap(page, 'saveFoster');
  assert.equal((await state(page)).alive, 6);
  await closeMenu(page);
  await shot(page, 'a06-active-after-send');
  await page.close();

  page = await open('count');
  await tap(page, 'sowActions');
  await fosterDirection(page, 'Receive');
  await shot(page, 'b01-active-receive-direction');
  await tap(page, 'fosterPick', '000406');
  await page.getByRole('button', { name: 'Without ID Increase', exact: true }).click();
  await shot(page, 'b02-active-receive-select-two');
  await tap(page, 'saveFoster');
  assert.equal((await state(page)).alive, 11);
  await closeMenu(page);
  await shot(page, 'b03-active-after-receive');
  await page.close();

  page = await open('locked');
  await shot(page, 'c01-finished-record');
  await openPiglets(page);
  await shot(page, 'c02-finished-piglets');
  await sendFromList(page, ['418001', '418002', '418003'], [
    'c03-finished-selected-actions', 'c04-finished-foster-sow-picker',
    'c05-finished-foster-confirm', 'c06-finished-after-foster'
  ], 5);
  await page.close();

  page = await open('locked');
  await openPiglets(page);
  await selectPiglet(page, '418001');
  await selectPiglet(page, '418002');
  await tap(page, 'litterActions');
  await tap(page, 'allocToPen');
  await shot(page, 'd01-finished-move-pen-picker');
  await tap(page, 'allocPen', '7|B2');
  assert.equal((await state(page)).alive, 6);
  await shot(page, 'd02-finished-after-move');
  await page.close();

  page = await open('ended');
  await shot(page, 'e01-sow-died-record');
  await menu(page, 'Sow died', options(true, true, true));
  await showProduction(page);
  await shot(page, 'e06-sow-died-actions-greyed');
  await closeMenu(page);
  await openPiglets(page);
  await sendFromList(page, ['418001', '418002'], [
    'e02-sow-died-piglets-actions', 'e03-sow-died-foster-picker',
    'e04-sow-died-send-confirm', 'e05-sow-died-after-send'
  ], 5);
  await page.close();

  page = await open('locked');
  await menu(page, 'Finished', options(true, false));
  await showProduction(page);
  await shot(page, 'f01-finished-sow-actions-current');
  await fosterDirection(page, 'Receive');
  await shot(page, 'f02-finished-receive-direction');
  await tap(page, 'fosterPick', '000406');
  await tap(page, 'saveFoster');
  assert.equal((await state(page)).alive, 9);
  await closeMenu(page);
  await shot(page, 'f03-finished-after-receive');
  await page.close();

  page = await open('locked');
  await tap(page, 'death');
  await shot(page, 'g01-finished-record-dead');
  for (let n = 0; n < 6; n++) await tap(page, 'deadStep', '2,1');
  assert.equal((await state(page)).draft[2], 6);
  await shot(page, 'g02-death-six-of-eight');
  await tap(page, 'saveDeath');
  assert.equal((await state(page)).alive, 2);
  await shot(page, 'g03-death-saved-two-alive');
  await openPiglets(page);
  assert.match(await page.locator('.litter-page').innerText(), /Check piglet IDs/);
  assert.equal(await control(page, 'litterActions').count(), 0);
  await shot(page, 'g04-piglet-ids-need-check');
  await page.close();

  page = await open('count');
  await tap(page, 'sowActions');
  await hostTap(page, 'miscarriage');
  await embedded(page).locator('[data-loss-reason]').fill('Fever');
  assert.match(await embedded(page).locator('[data-card="0"] .phone').innerText(), /Her record stays in Farrowing/);
  await shot(page, 'h01-abortion-with-live-confirm');
  await embedded(page).locator(action('save-miscarriage')).click();
  await label(page, 'Back').click();
  await tap(page, 'room-sow', '000418');
  await shot(page, 'h02-aborted-with-live-piglets');
  await menu(page, 'Aborted with live piglets', { 'Batch membership': false });
  await showProduction(page);
  await shot(page, 'h03-aborted-actions');
  await closeMenu(page);
  await openPiglets(page);
  await sendFromList(page, ['418001'], [
    'h04-aborted-piglets-actions', 'h05-aborted-foster-picker',
    'h06-aborted-foster-confirm', 'h07-aborted-after-send'
  ], 8);
  await page.close();

  for (const verb of ['health', 'feed', 'transfer']) {
    page = await open('batch');
    if (verb === 'health') {
      const labels = await control(page, 'room-batch-verb').allTextContents();
      assert.deepEqual(labels.map(text => text.trim()), ['Condition', 'Treat', 'Care', 'Note', 'Measure', 'Feed', 'Transfer']);
      await shot(page, 'i01-unit-generic-actions');
    }
    await tap(page, 'room-batch-verb', verb);
    await page.getByRole('checkbox', { name: 'Choose 000418', exact: true }).check();
    if (verb === 'health') await shot(page, 'i02-unit-choose-pigs');
    await tap(page, 'room-batch-next');
    if (verb === 'health') {
      await embedded(page).getByRole('heading', { name: 'Record health' }).waitFor();
      await shot(page, 'i03-unit-condition-form');
    } else if (verb === 'feed') {
      await embedded(page).getByText('Feed adjustment unavailable').waitFor();
      await shot(page, 'i04-unit-adjust-feed-no-plan');
      await closeMenu(page);
    } else {
      await page.getByText('Batch transfer is not available in this preview').waitFor();
      await shot(page, 'i05-unit-transfer-placeholder');
      await label(page, 'Back').click();
    }
    if (verb !== 'health') assert.equal(await page.getByRole('checkbox', { name: 'Choose 000418', exact: true }).isChecked(), true);
    await page.close();
  }

  page = await open('before');
  await shot(page, 'j01-awaiting-record');
  await menu(page, 'Awaiting', options(false, undefined));
  await showProduction(page);
  await shot(page, 'j02-awaiting-sow-actions');
  await embedded(page).locator(action('batch-membership')).click();
  const form = embedded(page).locator('[data-card="0"] .sheet[aria-label="Batch membership"]');
  await form.waitFor();
  assert.match(await form.innerText(), /Batch 28/);
  const remove = form.locator(action('save-batch-removal'));
  assert.equal(await remove.isDisabled(), true);
  await shot(page, 'j03-awaiting-batch-membership');
  await form.locator('[data-picker-key="dispositionReason"]').click();
  const reason = 'Assigned to this batch in error';
  await embedded(page).locator(action('picker-select', reason)).click();
  assert.equal(await remove.isEnabled(), true);
  await shot(page, 'j04-awaiting-removal-reason');
  await remove.click();
  await page.getByRole('heading', { name: 'Production log', exact: true }).waitFor();
  const removed = await state(page);
  assert.equal(removed.outcome, 'removed');
  assert.equal(removed.born, 0);
  assert.match(removed.events[0], /Removed from farrowing batch · Assigned to this batch in error/);
  await shot(page, 'j05-removal-production-log');
  await label(page, 'Back').click();
  await tap(page, 'room-lens', 'Awaiting');
  assert.equal(await control(page, 'room-sow', '000455').count(), 0);
  await tap(page, 'room-lens', 'Done');
  await control(page, 'room-sow', '000455').waitFor();
  await shot(page, 'j06-removed-sow-in-done');
  await tap(page, 'room-overview');
  await control(page, 'room-task-list', 'removed').waitFor();
  await shot(page, 'j07-overview-removal-count');
  await tap(page, 'room-task-list', 'removed');
  await tap(page, 'room-task-sow', '7:000455');
  await page.getByRole('heading', { name: 'Production log', exact: true }).waitFor();
  await page.close();

  page = await open('count');
  await tap(page, 'sowActions');
  await embedded(page).locator(action('batch-membership')).click();
  await embedded(page).getByText('A litter has already been recorded.', { exact: true }).waitFor();
  assert.equal(await embedded(page).locator(action('save-batch-removal')).count(), 0);
  await page.close();

  // Boundary case: a living sow with a recorded litter but no live piglets.
  page = await open('locked');
  await tap(page, 'death');
  for (let n = 0; n < 8; n++) await tap(page, 'deadStep', '2,1');
  assert.equal(await control(page, 'deadStep', '2,1').isDisabled(), true);
  await tap(page, 'saveDeath');
  assert.equal((await state(page)).alive, 0);
  assert.equal(await control(page, 'pigletList').count(), 0);
  await menu(page, 'Finished with no live piglets', options(true, true));
  await showProduction(page);
  await shot(page, 'f04-finished-zero-live-actions');
  await page.close();

  page = await open('room');
  await tap(page, 'room-search');
  await page.locator('[data-card="0"] [data-room-search]').fill('000418');
  await tap(page, 'room-sow', '000418');
  await tap(page, 'bornAlive', '1');
  assert.equal(await control(page, 'saveVisit').isEnabled(), true);
  assert.equal(await control(page, 'sowActions').isEnabled(), true);
  await shot(page, 'k01-find-active-draft');
  await page.close();

  assert.deepEqual(errors, []);
  writeFileSync(new URL('production-states.json', import.meta.url), JSON.stringify(results, null, 2) + '\n');
  console.log('Verified Actions across six conditions and captured current prototype screenshots.');
} finally {
  await browser.close();
}
