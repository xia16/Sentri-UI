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

  // 3. litter → record iron → Edit → iron 12 → 10, 2 weak → Save → the litter prints the value amber → the record page
  //    shows the correction (ticket #12).
  await page.goto(base + 'litter.html?state=litter&crate=A02&stay=1&fresh=1'); await ready(page);
  await page.click('[data-action="record"][data-value="iron3"]');
  await page.waitForTimeout(700);
  await page.click('[data-action="open-edit"]');
  await page.waitForURL(/edit\.html/); await ready(page);
  assert.equal(await page.locator('[data-ds="Candidate:EditBanner"]').count(), 0);          // no banner on entry
  const minus = page.locator('[data-action="mark-step"][data-step="-1"]').first();
  await minus.click(); await minus.click();
  assert.match(await text(page, '[data-ds="Candidate:EditBanner"]'), /Correcting a past record · logged as G\.H.*Iron · day 3 12 → 10 · 2 not treated/);
  assert.equal(await page.locator('[data-action="save"][aria-disabled="true"]').count(), 1);   // Save waits for the reason
  await page.click('[data-action="mark-why"][data-value$=":weak"]');
  await page.click('[data-action="save"]');
  await page.waitForURL(/litter\.html/); await ready(page);
  const rec = page.locator('.lt-rec', { hasText: 'Iron · day 3' }).first();
  assert.match((await rec.innerText()).replace(/\s+/g, ' '), /10 piglets · 2 deferred: weak/);
  assert.equal(await rec.locator('.pp-tone[data-tone="amber"]').count(), 2);
  assert.match(await text(page, '[data-action="open-dose"][data-value="iron3"]'), /2 owed|weak/);
  await page.click('[data-action="open-record"]');
  await page.waitForURL(/edit\.html\?state=record-page/); await ready(page);
  const log = await text(page, '[data-ds="Log"]');
  assert.match(log, /Iron · day 3 corrected .*12 → 10 · 2 deferred: weak.*Iron · day 3 · 12 piglets/);
  console.log('ok 3 litter → Edit → 12 → 10 · 2 weak → Save → litter amber → record page:', log.slice(0, 120));

  await browser.close();
} finally {
  server.kill();
}
