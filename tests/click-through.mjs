// Piglet processing click-through (ticket #19): the pages render from one ledger and one fixture, so a record
// made on one page shows on the next. Run: node tests/click-through.mjs [port]
// Uses the Playwright the design lint installs (~/.cache/adam-design/playwright-<v>).
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const port = Number(process.argv[2]) || 4602;
const require = createRequire(join(homedir(), '.cache', 'adam-design', 'playwright-1.63.0', 'package.json'));
const { chromium } = require('playwright');
const server = spawn(process.execPath, ['scripts/serve-ux.cjs', String(port)], { stdio: 'ignore' });
const base = `http://localhost:${port}/ux/tasks/piglet-processing/`;
const ready = (p) => p.waitForSelector('html[data-ready]');
const text = async (p, sel) => (await p.locator(sel).first().innerText()).replace(/\s+/g, ' ');
const rowText = async (p, code) => (await p.locator(`[data-action="open-litter"][data-value="${code}"]`).first().innerText()).replace(/\s+/g, ' ');

try {
  await new Promise((r) => setTimeout(r, 400));
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();

  // 1. room → litter → record iron → back to room: the row changes.
  await page.goto(base + 'room.html?state=room&fresh=1'); await ready(page);
  const before = await rowText(page, 'A02');
  assert.match(before, /Iron · Dock tail/);
  await page.click('[data-action="open-litter"][data-value="A02"]');
  await page.waitForURL(/litter\.html/); await ready(page);
  await page.click('[data-action="record"][data-value="iron3"]');
  assert.match(await text(page, '.pp-receipt'), /Saved · iron · day 3 · 12 piglets/);
  await page.waitForTimeout(700);
  await page.click('[data-action="close"]');
  await page.waitForURL(/room\.html/); await ready(page);
  const after = await rowText(page, 'A02');
  assert.doesNotMatch(after, /Iron/);
  assert.match(after, /Dock tail/);
  console.log('ok 1 room → litter → record iron → room:', before, '⇒', after);

  // 2. room → litter → Record dead → Save → room: alive drops.
  await page.click('[data-action="open-litter"][data-value="A02"]');
  await page.waitForURL(/litter\.html/); await ready(page);
  assert.match(await text(page, '[data-action="open-record"]'), /Alive 12/);
  await page.click('[data-action="open-dead"]');
  await page.waitForURL(/dead\.html/); await ready(page);
  await page.click('[data-action="dead-step"][data-value="crushed"][data-step="1"]');
  await page.click('[data-action="save"]');
  assert.match(await text(page, '.pp-receipt'), /Saved · \+1 crushed/);
  await page.waitForTimeout(500);
  await page.click('[data-action="close-host"]');
  await page.waitForURL(/litter\.html/); await ready(page);
  assert.match(await text(page, '[data-action="open-record"]'), /Alive 11 · Dead 2/);
  await page.click('[data-action="close"]');
  await page.waitForURL(/room\.html/); await ready(page);
  const dead = await rowText(page, 'A02');
  assert.match(dead, /11 piglets/);
  console.log('ok 2 room → litter → Record dead → Save → room:', dead);

  // 3. room → filter iron → Record for several litters → tick 4 → review → Record → room: the four leave the iron filter.
  await page.goto(base + 'room.html?state=room&fresh=1'); await ready(page);
  await page.click('[data-action="filter"]');
  await page.click('input[data-action="toggle-dose"][value="iron"]');
  await page.click('[data-action="close-sheet"]');
  await page.waitForSelector('[data-action="open-bulk"]');
  await page.click('[data-action="open-bulk"]');
  await page.waitForURL(/bulk\.html/); await ready(page);
  // ticks are a draft on this phone: Close keeps them, the room door says so, reopening restores them
  for (const c of ['A02', 'A04']) await page.check(`input[data-action="toggle"][value="${c}"]`);
  await page.click('.bk-bar [data-action="close"]');
  await page.waitForURL(/room\.html/); await ready(page);
  assert.match(await text(page, '[data-action="open-bulk"]'), /2 ticked · not recorded/);
  await page.click('[data-action="open-bulk"]');
  await page.waitForURL(/bulk\.html/); await ready(page);
  assert.ok(await page.isChecked('input[data-action="toggle"][value="A04"]'));
  for (const c of ['B06', 'B10']) await page.check(`input[data-action="toggle"][value="${c}"]`);
  assert.match(await text(page, '.bk-bar .pp-receipt'), /4 litters · 46 piglets · not recorded yet/);
  // a double tap on Review: the second tap lands on Record at the same spot and is swallowed, Record wearing its pressed face
  const rv = await page.locator('.bk-bar [data-action="review"]').boundingBox();
  const at = [rv.x + rv.width / 2, rv.y + rv.height / 2];
  await page.mouse.click(...at); await page.mouse.click(...at);
  assert.equal(await page.locator('[data-st-context="drawer"]').count(), 1);
  assert.equal(await page.getAttribute('[data-action="record"]', 'aria-busy'), 'true');
  const review = await text(page, '[data-st-context="drawer"]');
  assert.match(review, /A02 12 piglets · A04 11 piglets · B06 12 piglets · B10 11 piglets/);
  await page.waitForTimeout(400);                                    // a deliberate tap after the guard records at once
  assert.equal(await page.getAttribute('[data-action="record"]', 'aria-busy'), null);
  const rc = await page.locator('[data-action="record"]').boundingBox();
  const at2 = [rc.x + rc.width / 2, rc.y + rc.height / 2];
  await page.mouse.click(...at2); await page.mouse.click(...at2);   // …and its double tap never lands on Close
  await page.waitForSelector('.bk-bar [data-action="close"]');
  assert.match(page.url(), /bulk\.html/);
  await page.waitForTimeout(300);
  const receipt = await text(page, '.bk-bar');
  assert.match(receipt, /Saved · iron · day 3 · 4 litters · 46 piglets/);
  // hold, then depart: the finished row keeps its place, then leaves for Done today (a door to its sheet)
  assert.equal(await page.locator('[data-action="open-litter"][data-value="A02"]').count(), 0);
  await page.waitForTimeout(1300);
  assert.equal(await page.locator('[data-action="open-litter"][data-value="A02"]').count(), 1);
  await page.click('.bk-bar [data-action="close"]');
  await page.waitForURL(/room\.html/); await ready(page);
  for (const c of ['A02', 'A04', 'B06', 'B10']) assert.equal(await page.locator(`[data-action="open-litter"][data-value="${c}"]`).count(), 0);
  assert.match(await rowText(page, 'A07'), /Iron/);
  await page.click('[data-action="clear-filter"]');
  const a02 = await rowText(page, 'A02');
  assert.doesNotMatch(a02, /Iron/);
  assert.match(a02, /Dock tail/);
  console.log('ok 3 room → filter iron → Record for several → review → Record → room:', receipt, '⇒ A02', a02);


  // 4. the review is a contract frozen when it opens: a sync moves 1 piglet into A02 → Record → A02 `changed`, never 13.
  await page.goto(base + 'bulk.html?state=bulk-review&tx=iron&fresh=1'); await ready(page);
  await page.evaluate(() => PP.sync({ type: 'move', from: 'B09', to: 'A02', n: 1, rows: ['B09-r10'], answers: { iron3: 'no' } }));
  const frozen = await text(page, '[data-st-context="drawer"]');
  assert.match(frozen, /A04 11 piglets · B06 12 piglets · B10 11 piglets/);
  assert.match(frozen, /Record for 34 piglets/);
  await page.waitForTimeout(400);
  await page.click('[data-action="record"]');
  await page.waitForSelector('.bk-bar:not([inert]) [data-action="close"]');
  const changed = await text(page, '.bk-bar:not([inert])');
  assert.match(changed, /A02 · changed since review · 13 piglets now · record on its sheet/);
  assert.match(changed, /3 litters · 34 piglets/);
  console.log('ok 4 review frozen → sync moves 1 into A02 → Record:', changed);

  await browser.close();
} finally {
  server.kill();
}
