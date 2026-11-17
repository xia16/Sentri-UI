// Render the current Farrowing entrances and component references for the owner canvas.
// All images come from the live prototype at 390 × 844. No prototype source is changed.
// Usage: SENTRI_PLAYWRIGHT=/path/to/node_modules/playwright node features/farrowing/consistency-round/mock.mjs
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { playwright } from '../../../scripts/playwright-path.mjs';

const root = process.cwd();
const here = path.dirname(fileURLToPath(import.meta.url));
const port = 4733;
const server = spawn(process.execPath, [path.join(root, 'scripts/serve-ux.cjs'), String(port)], { cwd: root, stdio: 'ignore' });
const { chromium } = playwright();
const browser = await chromium.launch();
const base = `http://127.0.0.1:${port}`;

async function open(screen, file = 'farrowing-astra-concept') {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  for (let i = 0; i < 30; i++) {
    try { await page.goto(`${base}/ux/system/${file}.html?layout=focus&screen=${screen}`); break; }
    catch (error) { if (i === 29) throw error; await new Promise(resolve => setTimeout(resolve, 100)); }
  }
  await page.locator('html.atlas-ready').waitFor({ timeout: 15000 });
  return page;
}
async function shoot(page, name) {
  await page.screenshot({ path: path.join(here, `${name}.png`) });
  console.log(name, (await page.locator('[data-card="0"] .phone').innerText()).replace(/\s+/g, ' ').slice(0, 160));
  await page.close();
}

try {
  const wrong = await open('farrowing.sow-actions');
  await shoot(wrong, 'actions-atlas-now');

  const actions = await open('farrowing.count');
  await actions.locator('[data-card="0"] [data-action="sowActions"]').first().click();
  await actions.locator('[data-card="0"][data-view="profile"]').waitFor({ state: 'attached', timeout: 10000 });
  await shoot(actions, 'actions-sow-now');

  const note = await open('farrowing.count');
  await note.locator('[data-card="0"] [data-action="sowActions"]').first().click();
  await note.frameLocator('[data-card="0"] iframe.sow-detail-frame').locator('[data-action="sow-host-action"][data-value="marker"]').first().click();
  await note.locator('[data-card="0"] .marker-page').waitFor({ timeout: 10000 });
  await note.evaluate(() => { document.querySelector('.marker-page').setAttribute('data-shot', 'now'); });
  await shoot(note, 'note-sow-now');

  const proposedNote = await open('farrowing.count');
  await proposedNote.locator('[data-card="0"] [data-action="sowActions"]').first().click();
  await proposedNote.frameLocator('[data-card="0"] iframe.sow-detail-frame').locator('[data-action="sow-host-action"][data-value="marker"]').first().click();
  await proposedNote.locator('[data-card="0"] .marker-page').waitFor({ timeout: 10000 });
  await proposedNote.evaluate(() => {
    const U = window.SentriUI, ic = key => window.SentriIcons.icon(key);
    const card = `<div class="st-panel st-note"><div class="st-note-head"><p class="st-note-by"><b>G.H</b> · Today 06:20</p></div><p class="st-note-text">Red line on left shoulder · monitor overnight</p><p class="st-note-foot">${ic('clock')}Shows until Tue 24 Nov</p></div>`;
    const editor = U.field({ label: 'Note', variant: 'textarea', control: '<textarea class="st-note-input" rows="5">Red line on left shoulder · monitor overnight</textarea>' });
    const duration = '<div class="st-panel st-note-days">' + U.stepper({ label: 'Show for', description: '7 days · Until Tue 24 Nov', value: 7, min: 1, max: 60, action: 'note-days', key: 'days', variant: 'row' }) + '</div>';
    document.querySelector('.marker-page .sheet-body').innerHTML = card + editor + duration;
  });
  await shoot(proposedNote, 'note-sow-proposed');

  const piglets = await open('farrowing.piglets');
  await shoot(piglets, 'piglets-now');

  const records = await open('farrowing.count');
  await records.locator('[data-card="0"] [data-action="sowActions"]').first().click();
  await records.frameLocator('[data-card="0"] iframe.sow-detail-frame').locator('[data-action="sow-host-action"][data-value="piglets"]').first().click();
  await records.locator('[data-card="0"] .piglet-care-page').waitFor({ timeout: 10000 });
  await records.locator('[data-card="0"] [data-action="pigletTab"][data-value="records"]').first().click();
  await shoot(records, 'piglet-records-old');

  const mortality = await open('farrowing.count');
  await mortality.locator('[data-card="0"] [data-action="sowActions"]').first().click();
  await mortality.frameLocator('[data-card="0"] iframe.sow-detail-frame').locator('[data-action="sow-host-action"][data-value="piglets"]').first().click();
  await mortality.locator('[data-card="0"] [data-action="pigletTab"][data-value="records"]').first().click();
  await mortality.locator('[data-card="0"] [data-action="openMortality"]').first().click();
  await shoot(mortality, 'mortality-old');

  const recordDead = await open('farrowing.locked');
  await recordDead.locator('[data-card="0"] [data-action="death"]').first().click();
  await shoot(recordDead, 'record-dead-now');

  const reconcile = await open('farrowing.reconcile');
  await shoot(reconcile, 'reconcile-old');

  const log = await open('farrowing.history');
  await shoot(log, 'undo-log-now');

  const outcomesWrong = await open('farrowing.task-outcomes');
  await shoot(outcomesWrong, 'task-outcomes-replay');

  const outcomesProposed = await open('farrowing.overview');
  await outcomesProposed.evaluate(() => {
    const c = window.FarrowingStudy.room(0);
    const records = c.units.flatMap(unit => unit.records);
    const abortion = records.find(record => !record.locked && window.FarrowingStudy.born(record) === 0);
    Object.assign(abortion, { productionOutcome: 'abortion', locked: true, alive: 0, frozen: 0, pending: 0 });
    for (const record of records) {
      if (record === abortion || record.ended || record.productionOutcome) continue;
      if (!record.locked) Object.assign(record, { locked: true, frozen: window.FarrowingStudy.born(record) || 12, alive: window.FarrowingStudy.born(record) ? record.alive : 12, pending: 0 });
    }
  });
  await outcomesProposed.locator('[data-card="0"] [data-action="room-end-review"]:visible').first().click();
  await outcomesProposed.locator('[data-card="0"][data-view="roomEndTask"]').waitFor({ state: 'attached' });
  await shoot(outcomesProposed, 'task-outcomes-proposed');

  const breakdownWrong = await open('farrowing.death-breakdown');
  await shoot(breakdownWrong, 'death-breakdown-replay');

  const details = await open('farrowing.details');
  await shoot(details, 'details-now');
} finally {
  await browser.close();
  server.kill();
}
