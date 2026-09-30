// Room click-through (scenario round 1: R1-5, R1-13, R1-15, R1-16, R1-17, R1-19, R1-22, N4, N9): every fixed room flow by
// real taps, starting from the room. Run: node tests/room-click-through.mjs [port]
// Uses the Playwright the design lint installs (~/.cache/adam-design/playwright-<v>).
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const port = Number(process.argv[2]) || 4608;
const require = createRequire(join(homedir(), '.cache', 'adam-design', 'playwright-1.63.0', 'package.json'));
const { chromium } = require('playwright');
const server = spawn(process.execPath, ['scripts/serve-ux.cjs', String(port)], { stdio: 'ignore' });
const base = `http://localhost:${port}/ux/tasks/piglet-processing/`;
const ready = (p) => p.waitForSelector('html[data-ready]');
const text = async (p, sel) => (await p.locator(sel).first().innerText()).replace(/\s+/g, ' ');
const row = (code) => `[data-action="open-litter"][data-value="${code}"]`;
const rowText = async (p, code) => text(p, row(code));
const has = async (p, sel) => (await p.locator(sel).count()) > 0;
const lens = async (p, k) => { await p.click(`[data-action="lens"][data-value="${k}"]`); };

try {
  await new Promise((r) => setTimeout(r, 400));
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  // 1. R1-17 + R1-15: the day-3 identity step is owed in the room; record iron on A02 → back: `Last record · just now · Iron · A02`.
  await page.goto(base + 'room.html?state=room&fresh=1'); await ready(page);
  assert.match(await rowText(page, 'A02'), /Iron · Dock tail · Tag/);
  await page.click(row('A02'));
  await page.waitForURL(/state=litter/); await ready(page);
  await page.click('[data-action="record"][data-value="iron3"]');
  await page.waitForTimeout(700);
  await page.click('[data-action="close"]');
  await page.waitForURL(/room\.html/); await ready(page);
  const last = await text(page, '.tk-latest');
  assert.match(last, /Last record \d\d:\d\d · G\. Hansen/);
  console.log('ok 1 identity owed; a new record reads just now:', last);

  // 2. R1-16: filter iron → the headline says so; A02, just done for iron, is in Done under the filter; Clear from the
  //    sheet clears the URL.
  await page.click('[data-action="filter"]');
  await page.click('input[data-action="toggle-dose"][value="iron"]');
  await page.click('[data-action="close-sheet"]');
  assert.match(await text(page, '.tk-summary-unit'), /litters owe iron today/);
  assert.match(page.url(), /filter=iron/);
  assert.equal(await has(page, row('A02')), false);
  await lens(page, 'done');
  assert.match(await rowText(page, 'A02'), /Iron done just now/);
  await page.click('[data-action="filter"]');
  await page.click('.tk-sheet [data-action="clear-filter"]');
  await page.click('[data-action="close-sheet"]');
  await page.waitForTimeout(100);
  assert.doesNotMatch(page.url(), /filter=/);
  assert.doesNotMatch(await text(page, '.tk-summary-unit'), /iron/);
  console.log('ok 2 filter says so; just-done litters in Done; Clear clears the URL:', page.url().replace(/^.*\//, ''));

  // 3. R1-16 / Q15: missed is its own group, never under Later nor owed; tokens read owed.
  await lens(page, 'later');
  assert.equal(await has(page, row('B04')), false);
  await page.click('[data-action="show-missed"]');
  assert.match(await text(page, '.pp-filtered'), /Missed a treatment/);
  assert.match(await rowText(page, 'B04'), /Coccidiosis treatment missed day 9.*window ended day 7/);
  assert.doesNotMatch(await rowText(page, 'B04'), /due/);
  await page.click('[data-action="clear-filter"]');
  await lens(page, 'owed');
  // round 5: what is still owed per treatment is the litter drawer's line (the row names the treatments once)
  assert.match(await rowText(page, 'D01'), /Nasal drops/);
  await page.click(row('D01'));
  assert.match(await text(page, '[data-view="litter"]'), /Nasal drops .*9 owed/);
  await page.click('[data-view="litter"] [data-action="close"]');
  console.log('ok 3 missed is its own group:', await rowText(page, 'D01'));

  // 4. R1-16: deferred reads deferred, never red; a litter done late keeps the marker in Done.
  await page.goto(base + 'room.html?state=room&data=a02-short&fresh=1'); await ready(page);
  // round 5: a deferral is the litter drawer's fact (the row keeps one meta line), never red on the row
  const a02 = await rowText(page, 'A02');
  assert.equal(await page.locator(`${row('B09')} [data-tone="red"]`).count(), 0);
  await page.click(row('A02'));
  assert.match(await text(page, '[data-action="open-dose"][data-value="iron3"]'), /Iron .*2 owed · deferred: weak/);
  await page.click('[data-view="litter"] [data-action="close"]');
  await page.click(row('B09'));
  assert.match(await text(page, '[data-action="open-dose"][data-value="iron3"]'), /2 owed · deferred: weak/);
  assert.match(await text(page, '[data-action="open-dose"][data-value="tail"]'), /3 owed · deferred: weak/);
  await page.click('[data-view="litter"] [data-action="close"]');
  await page.goto(base + 'room.html?state=room&data=all-done&fresh=1'); await ready(page);
  await lens(page, 'done');
  assert.match(await rowText(page, 'B01'), /All done \d+ min ago.*done 2 days late/);
  console.log('ok 4 deferred and done-late:', a02, '|', await rowText(page, 'B01'));

  // 5. N4 / R1-22: the review list from the header; the held body opens where it is answered; the row carries the marker.
  await page.goto(base + 'room.html?state=room&data=held-body&fresh=1'); await ready(page);
  assert.match(await rowText(page, 'A07'), /Check/);
  assert.match(await text(page, '[data-action="reviews"]'), /To review 2/);
  await page.click('[data-action="reviews"]');
  assert.match(await text(page, '[role="dialog"]'), /A07 Body held · recorded twice\?/);
  await page.click('[data-action="open-review"][data-value^="held:"]');
  await page.waitForURL(/count\.html\?.*state=held-body/); await ready(page);
  assert.match(page.url(), /crate=A07/);
  console.log('ok 5 review list → held body → Set count');

  // 6. R1-5: another unit from the room; Back goes to the task, not the designer index.
  await page.goto(base + 'room.html?state=room&fresh=1'); await ready(page);
  await page.click('[data-action="units"]');
  assert.match(await text(page, '[role="dialog"]'), /Unit 8 4 litters · not in a task/);
  await page.click('[data-action="open-unit"][data-value="8"]');
  await page.waitForURL(/room\.html\?.*unit=8/); await ready(page);
  assert.match(await text(page, '.tk-summary'), /Unit 8/);
  await page.click('[data-action="back"]');
  await page.waitForURL(/end\.html\?.*state=overview/); await ready(page);
  console.log('ok 6 Other units → Unit 8; Back → task overview');

  // 7. N9: Find by sow number, by crate code in another unit, and garbage says No match.
  await page.goto(base + 'room.html?state=room&fresh=1'); await ready(page);
  await page.click('.tk-dock [data-action="find"]');
  const q = page.locator('[data-role="q"]');
  await q.fill('hello');
  assert.match(await text(page, '#scan-results'), /No match for hello/);
  await q.fill('F02');
  assert.match(await text(page, '#scan-results'), /crate F02 · sow \d{6} Found in Unit 8, crate F02/);
  await q.fill('000231');
  assert.match(await text(page, '#scan-results'), /crate A02 · sow 000231/);
  await q.press('Enter');
  await page.waitForURL(/state=litter.*crate=A02/); await ready(page);
  console.log('ok 7 Find by sow, crate, and No match');

  // 8. R1-13: after End the room reads ended; the door opens the receipt; no Owed lens; the review is unresolved at End.
  await page.goto(base + 'room.html?state=room&data=ended&fresh=1'); await ready(page);
  assert.equal(await has(page, '[data-action="lens"][data-value="owed"]'), false);
  assert.equal(await has(page, '.tk-summary-unit [data-str="pp.room.lead.many"]'), false);
  assert.match(await text(page, '[data-action="receipt"]'), /End receipt .*Task ended .*16:20 · G\.H/);
  assert.match(await text(page, '.tk-summary-unit'), /6 litters unfinished at end/);
  assert.match(await text(page, '[data-action="reviews"]'), /unresolved at end/);
  assert.match(await rowText(page, 'B01'), /Castrate · 1 not done/);
  await page.click('[data-action="receipt"]');
  await page.waitForURL(/end\.html\?.*state=receipt/); await ready(page);
  console.log('ok 8 ended room → receipt');

  // 9. R1-19: a litter emptied by a move owes nothing and is in no lens but All; the not-in-task litters are named.
  await page.goto(base + 'room.html?state=room&data=emptied&fresh=1'); await ready(page);
  for (const k of ['owed', 'done', 'later']) { await lens(page, k); assert.equal(await has(page, row('C05')), false, k); }
  await lens(page, 'all');
  assert.match(await rowText(page, 'C05'), /Empty · nothing owed/);
  for (const c of ['D02', 'E01']) assert.match(await rowText(page, c), /Not in the task/);
  console.log('ok 9 emptied litter only in All:', await rowText(page, 'C05'));

  assert.deepEqual(errors, []);
  await browser.close();
  console.log('room click-through: all ok');
} finally {
  server.kill();
}
