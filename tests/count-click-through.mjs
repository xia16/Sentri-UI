// Count and explain click-through (ticket #10): room → litter Set count → count lower → the room shows the open loss →
// the drift strip → explain via the move suggestion → both lines close. One ledger, one fixture (variant gain-b08:
// L.M found 10 in B08 at 09:55, 9 by the record). Run: node tests/count-click-through.mjs [port]
// Uses the Playwright the design lint installs (~/.cache/adam-design/playwright-<v>).
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const port = Number(process.argv[2]) || 4631;
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

  // 1. The room before: D03's loss 2 (base) and B08's gain 1; nothing open on B06.
  await page.goto(base + 'room.html?state=room&lens=all&data=gain-b08&fresh=1'); await ready(page);
  const strip0 = await text(page, '[data-ds="Candidate:DriftStrip"]');
  assert.match(strip0, /Unexplained loss 2 D03/); assert.match(strip0, /Unexplained gain 1 B08/);
  assert.doesNotMatch(await rowText(page, 'B06'), /loss/);
  console.log('ok 1 room before:', strip0);

  // 2. room → B06 → Set count → − once (11 seen, 12 by the record) → Save: an unexplained loss of 1, stamped; no reason asked.
  await page.click('[data-action="open-litter"][data-value="B06"]');
  await page.waitForURL(/litter\.html/); await ready(page);
  await page.click('[data-action="open-count"]');
  await page.waitForURL(/count\.html/); await ready(page);
  assert.equal(await page.locator('[role="spinbutton"]').first().innerText(), '12');
  await page.click('[data-action="step"][data-step="-1"]');
  assert.match(await text(page, '[data-ds="Stepper"]'), /1 fewer · Save writes unexplained loss 1 piglet/);
  await page.click('[data-action="save"]');
  assert.match(await text(page, '.pp-receipt'), /Saved · unexplained loss 1 piglet/);
  // a double tap right after Save lands nowhere
  await page.click('[data-action="back"]');
  assert.match(page.url(), /count\.html/);
  // one open line: its doors are right on the litter (no extra hop)
  assert.match((await page.locator('[data-action="suggest"]').first().innerText()).replace(/\s+/g, ' '), /B08 gained 1 piglet/);
  console.log('ok 2 litter Set count 11:', await text(page, '.pp-receipt'));

  // 3. Back to the room: the strip and B06's row show the open loss, beside B08's gain (never netted).
  await page.waitForTimeout(450);
  await page.click('[data-action="back"]');
  await page.waitForURL(/litter\.html/); await ready(page);
  await page.click('[data-action="close"]');
  await page.waitForURL(/room\.html/); await ready(page);
  const strip1 = await text(page, '[data-ds="Candidate:DriftStrip"]');
  assert.match(strip1, /Unexplained loss 3 B06 D03/); assert.match(strip1, /Unexplained gain 1 B08/); assert.match(strip1, /Net drift −2 piglets/);
  console.log('ok 3 room shows the open loss:', strip1);

  // 4. The drift strip → the room's open lines → B06's suggestion `B08 gained 1 piglet · both lines close` → the Move sheet, pre-filled.
  await page.click('[data-action="explain"]');
  await page.waitForURL(/count\.html\?state=explain/); await ready(page);
  const sug = page.locator('[data-action="suggest"][data-value$="|C-B08-gain"]').first();
  assert.match((await sug.innerText()).replace(/\s+/g, ' '), /B08 gained 1 piglet both lines close \d+ min/);
  await sug.click();
  assert.match(await text(page, '[role="dialog"]'), /Alive stays 11 piglets in B06 and 10 piglets in B08/);
  await page.click('[data-action="open-move"]');
  await page.waitForURL(/move\.html\?.*state=move-explain/); await ready(page);
  assert.match(await text(page, '[role="dialog"]'), /Closes 1 unexplained loss and 1 gain/);
  await page.click('[data-action="save-move"]');
  console.log('ok 4 explain via the move suggestion: saved', await text(page, '[role="dialog"] h3'));

  // 5. The room after: both lines closed; D03's loss (nothing to pair) stays open.
  await page.goto(base + 'room.html?state=room&lens=all&data=gain-b08'); await ready(page);
  const strip2 = await text(page, '[data-ds="Candidate:DriftStrip"]');
  assert.match(strip2, /Unexplained loss 2 D03/); assert.doesNotMatch(strip2, /gain/); assert.doesNotMatch(strip2, /B06/);
  assert.doesNotMatch(await rowText(page, 'B06'), /loss/); assert.doesNotMatch(await rowText(page, 'B08'), /gain/);
  console.log('ok 5 both lines closed:', strip2);

  await browser.close();
} finally {
  server.kill();
}
