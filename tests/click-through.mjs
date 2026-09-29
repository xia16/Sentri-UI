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
  for (const c of ['A02', 'A04', 'B06', 'B10']) await page.check(`input[data-action="toggle"][value="${c}"]`);
  assert.match(await text(page, '.bk-bar .pp-receipt'), /4 litters · 46 piglets/);
  await page.click('[data-action="review"]');
  assert.match(await text(page, '[data-st-context="drawer"]'), /Will record/);
  await page.click('[data-action="record"]');
  await page.waitForSelector('.bk-bar [data-action="close"]');
  await page.waitForTimeout(300);
  const receipt = await text(page, '.bk-bar');
  assert.match(receipt, /Saved · iron · day 3 · 4 litters · 46 piglets/);
  await page.waitForTimeout(1000);
  await page.click('.bk-bar [data-action="close"]');
  await page.waitForURL(/room\.html/); await ready(page);
  for (const c of ['A02', 'A04', 'B06', 'B10']) assert.equal(await page.locator(`[data-action="open-litter"][data-value="${c}"]`).count(), 0);
  assert.match(await rowText(page, 'A07'), /Iron/);
  await page.click('[data-action="clear-filter"]');
  const a02 = await rowText(page, 'A02');
  assert.doesNotMatch(a02, /Iron/);
  assert.match(a02, /Dock tail/);
  console.log('ok 3 room → filter iron → Record for several → review → Record → room:', receipt, '⇒ A02', a02);

  await browser.close();
} finally {
  server.kill();
}
