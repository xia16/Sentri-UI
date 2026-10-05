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
  await page.waitForURL(/state=litter/); await ready(page);
  await page.click('[data-action="record"][data-value="iron3"]');
  assert.match(await text(page, '.pp-receipt'), /Saved · iron · day 3 · 12 piglets/);
  await page.waitForTimeout(700);
  await page.click('[data-action="close"]');
  await page.waitForURL(/room\.html/); await ready(page);
  const after = await rowText(page, 'A02');
  assert.doesNotMatch(after, /Iron/);
  assert.match(after, /Dock tail/);
  console.log('ok 1 room → litter → record iron → room:', before, '⇒', after);

  // 2. room → litter → Record death → Save → room: alive drops.
  await page.click('[data-action="open-litter"][data-value="A02"]');
  await page.waitForURL(/state=litter/); await ready(page);
  assert.match(await text(page, '.lt-summary'), /Alive now 12/);
  await page.click('[data-action="open-dead"]');
  await page.waitForURL(/dead\.html/); await ready(page);
  await page.click('[data-action="dead-step"][data-value="crushed"][data-step="1"]');
  // Save returns to the litter it was opened from (no host stub, R1-26)
  await page.click('[data-action="save"]');
  await page.waitForURL(/state=litter/); await ready(page);
  assert.match(await text(page, '.lt-summary'), /Alive now 11 Dead 2/);
  await page.click('[data-action="close"]');
  await page.waitForURL(/room\.html/); await ready(page);
  const dead = await rowText(page, 'A02');
  assert.match(dead, /11 owed/);
  console.log('ok 2 room → litter → Record death → Save → room:', dead);

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
  await page.click('[data-action="leave"]');
  await page.waitForURL(/room\.html/); await ready(page);
  assert.match(await text(page, '[data-action="open-bulk"]'), /2 ticked · not recorded/);
  await page.click('[data-action="open-bulk"]');
  await page.waitForURL(/bulk\.html/); await ready(page);
  assert.ok(await page.isChecked('input[data-action="toggle"][value="A04"]'));
  for (const c of ['B06', 'B10']) await page.check(`input[data-action="toggle"][value="${c}"]`);
  assert.match(await text(page, '.tk-page-desc'), /4 litters · 46 piglets · not recorded yet/);
  // a double tap on Review: the second tap lands on Record (a hold, TaskHold) at the same spot and records nothing
  const rv = await page.locator('[data-action="review"]').boundingBox();
  const at = [rv.x + rv.width / 2, rv.y + rv.height / 2];
  await page.mouse.click(...at); await page.mouse.click(...at);
  assert.equal(await page.locator('[data-st-context="drawer"]').count(), 1);
  assert.equal(await page.getAttribute('[data-action="record"]', 'data-phase'), 'idle');
  assert.equal(await page.locator('#bk-receipt').count(), 0);
  const review = await text(page, '[data-st-context="drawer"]');
  assert.match(review, /A02 12 piglets A04 11 piglets B06 12 piglets B10 11 piglets/);
  // a deliberate hold records every ticked litter at once…
  const rc = await page.locator('[data-action="record"]').boundingBox();
  const at2 = [rc.x + rc.width / 2, rc.y + rc.height / 2];
  await page.mouse.move(...at2); await page.mouse.down(); await page.waitForTimeout(1000); await page.mouse.up();
  await page.mouse.click(...at2);                                   // …and a tap after it at the same spot never leaves the page
  await page.waitForSelector('#bk-receipt');
  assert.match(page.url(), /bulk\.html/);
  await page.waitForTimeout(300);
  const receipt = await text(page, '#bk-receipt');
  assert.match(receipt, /Saved · iron · day 3 · 4 litters · 46 piglets/);
  // hold, then depart: the finished row keeps its place, then leaves for Done today (a door to its sheet)
  assert.equal(await page.locator('[data-action="open-litter"][data-value="A02"]').count(), 0);
  await page.waitForTimeout(1300);
  assert.equal(await page.locator('[data-action="open-litter"][data-value="A02"]').count(), 1);
  await page.click('[data-action="leave"]');
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
  assert.match(frozen, /A04 11 piglets B06 12 piglets B10 11 piglets/);
  assert.match(frozen, /Record for 34 piglets/);
  const rh = await page.locator('[data-action="record"]').boundingBox();
  await page.mouse.move(rh.x + rh.width / 2, rh.y + rh.height / 2); await page.mouse.down(); await page.waitForTimeout(1000); await page.mouse.up();
  await page.waitForSelector('#bk-receipt');
  const changed = await text(page, '#bk-receipt');
  assert.match(changed, /A02 · changed since review · 13 piglets now · record on its sheet/);
  assert.match(changed, /3 litters · 34 piglets/);
  console.log('ok 4 review frozen → sync moves 1 into A02 → Record:', changed);

  // 5. litter → record iron → Edit → iron 12 → 10, 2 weak → Save → the litter prints the value amber → the record page
  //    shows the correction (ticket #12).
  await page.goto(base + 'litter.html?state=litter&crate=A02&stay=1&fresh=1'); await ready(page);
  await page.click('[data-action="record"][data-value="iron3"]');
  await page.waitForTimeout(700);
  await page.click('[data-action="open-edit"]');
  await page.waitForURL(/edit\.html/); await ready(page);
  assert.equal(await page.locator('[data-ds="Banner"]').count(), 0);                      // no banner on entry
  const minus = page.locator('[data-action="mark-step"][data-step="-1"]').first();
  await minus.click(); await minus.click();
  await page.waitForFunction(() => /2 not treated/.test((document.querySelector('#ed-banner-summary') || {}).innerText || ''));
  assert.match((await text(page, '[data-ds="Banner"]')).replace(/\s*·\s*/g, ' · '), /Correcting a past record logged as G\.H Iron · day 3 12 → 10 piglets · 2 not treated/);
  assert.equal(await page.locator('[data-action="save"][aria-disabled="true"]').count(), 1);   // Save waits for the reason
  await page.click('[data-action="mark-why"][data-value$=":weak"]');
  await page.click('[data-action="save"]');
  // Save stays on Edit and says what the correction did (R1-28); Back returns to the litter (a drawer over the room)
  await page.waitForFunction(() => /Correction saved/.test((document.querySelector('#ed-saved') || {}).innerText || ''));
  assert.match((await text(page, '#ed-saved')).replace(/\s*·\s*/g, ' · '), /Correction saved · A02 · Iron · day 3 owed 0 → 2/);
  await page.click('[data-action="back"]');
  await page.waitForURL(/state=litter/); await ready(page);
  // the evidence row is Row (ADR 0002): its tap opens Edit (✎); a corrected figure is amber and says what it was (R1-28)
  const rec = page.locator('.tk-day-door[data-action="open-edit"]', { hasText: 'Iron' }).first();
  assert.match((await rec.innerText()).replace(/\s+/g, ' '), /10 piglets\s*·?\s*2 deferred: weak.*was 12 · corrected/);
  assert.equal(await rec.locator('.tk-tone[data-tone="amber"]').count(), 3);
  assert.match(await text(page, '[data-action="open-dose"][data-value="iron3"]'), /2 owed|weak/);
  await page.click('[data-action="open-record"]');
  await page.waitForURL(/edit\.html\?state=record-page/); await ready(page);
  const log = await text(page, '[data-ds="Log"]');
  assert.match(log, /Correction Iron · day 3 12 → 10 piglets · 2 deferred: weak .*Iron · day 3 · 12 piglets corrected/);
  console.log('ok 5 litter → Edit → 12 → 10 · 2 weak → Save → litter amber → record page:', log.slice(0, 120));

  // 6. Edit → tail was done on another crate → A04 → Save → A04's record page shows the act at its own time (ticket #12).
  await page.goto(base + 'edit.html?state=edit&crate=A02&data=a02-marked&fresh=1'); await ready(page);
  await page.click('[data-action="wrong-crate"]');                                        // one door under the list (parity 1)
  await page.click('[data-action="mark-why"][data-value="T-A02-tail:to"]');                // R1-28: there without pressing −
  await page.click('[data-action="pick"][data-value="A04"]');
  await page.waitForFunction(() => /A04/.test((document.querySelector('#ed-banner-summary') || {}).innerText || ''));
  assert.match((await text(page, '[data-ds="Banner"]')).replace(/\s*·\s*/g, ' · '), /Dock tail 12 → 0 piglets · done on A04 11 piglets/);
  await page.click('[data-action="save"]');
  await page.waitForFunction(() => /Correction saved/.test((document.querySelector('#ed-saved') || {}).innerText || ''));
  await page.goto(base + 'edit.html?state=record-page&crate=A04&data=a02-marked'); await ready(page);
  const there = await text(page, '[data-ds="Log"]');
  assert.match(there, /Correction Dock tail 11 piglets · was on A02 · 08:40 · L\. Madsen/);
  console.log('ok 6 Edit → wrong litter → A04 → Save → A04 record page:', there.slice(0, 100));

  // 7. bulk: a tickable row still opens its litter from the id (the row elsewhere ticks); a Sow-died row keeps Done and
  //    its lateness after the record (chip Sow died, Done · late on the meta line) — R2-28.
  await page.goto(base + 'bulk.html?state=bulk&tx=iron&fresh=1'); await ready(page);
  await page.click('[data-action="open-litter"][data-value="B01"]');
  await page.waitForURL(/litter\.html/);
  assert.match(page.url(), /crate=B01/);
  await page.goto(base + 'bulk.html?state=bulk&tx=iron&fresh=1'); await ready(page);
  await page.locator('label.tk-row:has(input[value="B01"]) .tk-row-headline').scrollIntoViewIfNeeded();
  const hl = await page.locator('label.tk-row:has(input[value="B01"]) .tk-row-headline').boundingBox();
  await page.mouse.click(hl.x + hl.width / 2, hl.y + hl.height / 2);
  assert.ok(await page.isChecked('input[data-action="toggle"][value="B01"]'));
  await page.click('[data-action="review"]');
  const rb = await page.locator('[data-action="record"]').boundingBox();
  await page.mouse.move(rb.x + rb.width / 2, rb.y + rb.height / 2); await page.mouse.down(); await page.waitForTimeout(1000); await page.mouse.up();
  await page.waitForSelector('#bk-receipt');
  const b01 = (await page.locator('.tk-row:has-text("B01")').first().innerText()).replace(/\s+/g, ' ');
  assert.match(b01, /Sow died/);
  assert.match(b01, /Done/);
  assert.match(b01, /2 days late/);
  console.log('ok 7 bulk: id opens the litter, row ticks; Sow died row keeps Done + late:', b01);

  await browser.close();
} finally {
  server.kill();
}
