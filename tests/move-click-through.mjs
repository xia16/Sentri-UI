// Move click-through (scenario round 1: R1-5, R1-18, R1-31, R1-3, owner round 4 nurse sow): every fixed flow from the
// room by real taps. Run: node tests/move-click-through.mjs [port]
// Uses the Playwright the design lint installs (~/.cache/adam-design/playwright-<v>).
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const port = Number(process.argv[2]) || 4606;
const require = createRequire(join(homedir(), '.cache', 'adam-design', 'playwright-1.63.0', 'package.json'));
const { chromium } = require('playwright');
const server = spawn(process.execPath, ['scripts/serve-ux.cjs', String(port)], { stdio: 'ignore' });
const base = `http://localhost:${port}/ux/tasks/piglet-processing/`;
const ready = (p) => p.waitForSelector('html[data-ready]');
const text = async (p, sel) => (await p.locator(sel).first().innerText()).replace(/\s+/g, ' ');
// the surface on top: the Move page, or a sheet (the receipt) over the litter's Moves page
const drawer = (p) => text(p, '.tk-sheet, .tk-page[data-view="move"]');

// room → the litter (its drawer over the room, or its own page) → its Move door
async function openMove(page, crate, fresh) {
  await page.goto(base + 'room.html?state=room' + (fresh ? '&fresh=1' : '')); await ready(page);
  const row = page.locator(`[data-action="open-litter"][data-value="${crate}"]`);
  if (!(await row.count())) await page.click('[data-action="lens"][data-value="all"]');
  await page.click(`[data-action="open-litter"][data-value="${crate}"]`);
  await page.waitForURL(/state=litter/); await ready(page);
  await page.click(`[data-action="open-move"]`);
  await page.waitForURL(/move\.html/); await ready(page);
  await page.waitForSelector('.tk-page[data-view="move"]');
}
async function find(page, q) {
  const box = page.locator('[data-role="crate-q"]');
  await box.click(); await box.fill(''); await box.type(q);
}

try {
  await new Promise((r) => setTimeout(r, 400));
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();

  // 1. R1-5: find a crate in another unit by typing its code; move one untagged piglet there.
  await openMove(page, 'B06', true);
  await find(page, 'A0');
  let d = await drawer(page);
  assert.match(d, /Crates matching A0/); assert.match(d, /A03 Unit 8/);
  await page.click('[data-action="pick-crate"][data-value="A03"]');
  await page.click('[data-action="step"][data-value="untagged"][data-step="1"]');
  await page.click('[data-action="save-move"]');
  d = await drawer(page);
  assert.match(d, /Saved · 1 piglet moved to A03 · Unit 8/);
  console.log('ok 1 search across units → A03 · Unit 8:', d.slice(0, 80));

  // 2. R1-31: typing this crate's own code says why; R1-5: scan fills the search with the crate card read.
  await page.click('.tk-sheet [data-action="back"]');
  await page.click('[data-action="open-move"]');
  await find(page, 'B06');
  assert.match(await drawer(page), /B06 is this crate/);
  await page.click('[data-action="scan"]');
  d = await drawer(page);
  assert.match(d, /Scanned crate card A02/);
  await page.click('[data-action="pick-crate"][data-value="A02"]');
  assert.match(await drawer(page), /To crate A02/);
  console.log('ok 2 self says why; scan → A02');

  // 3. R1-18: a partly done source asks, nothing chosen; Move waits and then says what it records. R1-3: the source owes a range.
  await openMove(page, 'B09', false);
  await find(page, 'B02');
  await page.click('[data-action="pick-crate"][data-value="B02"]');
  await page.locator('input[data-action="pick-row"][value="B09-r9"]').check();
  await page.locator('input[data-action="pick-row"][value="B09-r10"]').check();
  d = await drawer(page);
  assert.match(d, /Iron: did all 2 piglets have it\?/);
  assert.equal(await page.locator('[data-action="save-move"]').isDisabled(), true);
  // the waiting Move stands alone; a tap on it says why (the guard answers, the reason line appears above the footer)
  assert.doesNotMatch(d, /Answer Iron first/);
  await page.locator('[data-action="save-move"]').dispatchEvent('click');
  await page.waitForFunction(() => ((document.getElementById('mv-reason') || {}).textContent || '').trim().length > 0);   // announced: cleared, then set
  assert.match(await drawer(page), /Answer Iron first/);
  await page.click('[data-action="answer"][data-value="iron3:unknown"]');
  assert.match(await text(page, '[data-action="save-move"]'), /Move 2 to B02 · Iron unknown/);
  await page.click('[data-action="save-move"]');
  assert.match(await drawer(page), /Saved · 2 piglets moved to B02/);
  await page.click('.tk-sheet [data-action="back"]');
  const face = await text(page, '.tk-page[data-view="face"]');
  assert.match(face, /Owed after a move — check on the pig/);
  assert.match(face, /Iron 0–2 of 8 owe · 2 to B02 unknown/);
  console.log('ok 3 ask waits → Move 2 to B02 · Iron unknown → B09 owes 0–2 of 8');

  // 4. R1-31 All for a tagged litter; round 4: the orphans' Move onto a sow outside every task brings her into the task.
  await openMove(page, 'B01', true);
  await find(page, 'D02');
  await page.click('[data-action="pick-crate"][data-value="D02"]');
  await page.click('[data-action="all-rows"]');
  d = await drawer(page);
  assert.match(d, /13 of 13 piglets/);
  assert.match(d, /Joins the task D02 joins this task as a nurse sow/);
  await page.click('[data-action="save-move"]');
  d = await drawer(page);
  assert.match(d, /Saved · 13 piglets moved to D02/); assert.match(d, /Joins the task/);
  console.log('ok 4 All 13 → D02 joins the task');

  // 5. R1-31: past a sane litter size the review warns (never blocks).
  await openMove(page, 'C05', true);
  await find(page, 'B08');
  await page.click('[data-action="pick-crate"][data-value="B08"]');
  await page.click('[data-action="all"]');
  d = await drawer(page);
  assert.match(d, /B08 will have 17 piglets/);
  assert.equal(await page.locator('[data-action="save-move"]').isDisabled(), false);
  console.log('ok 5 crowded warning:', d.match(/B08 will have[^.]*\./)[0]);

  // 6. Back from the Move page lands on the litter's drawer over the room, its Move door there again.
  await page.click('.tk-page[data-view="move"] .tk-footer [data-action="back"]');
  await page.waitForURL(/room\.html\?.*state=litter.*crate=C05/); await ready(page);
  await page.locator('[data-action="open-move"]').first().waitFor();
  console.log('ok 6 Back → the litter drawer');

  await browser.close();
} finally {
  server.kill();
}
