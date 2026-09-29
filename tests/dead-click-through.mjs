// Dead drawer click-through (scenario round 1: R1-8, R1-9, R1-22, R1-26): real taps from the room, one ledger, one fixture.
// Run: node tests/dead-click-through.mjs [port]
// Uses the Playwright the design lint installs (~/.cache/adam-design/playwright-<v>).
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const port = Number(process.argv[2]) || 4633;
const require = createRequire(join(homedir(), '.cache', 'adam-design', 'playwright-1.63.0', 'package.json'));
const { chromium } = require('playwright');
const server = spawn(process.execPath, ['scripts/serve-ux.cjs', String(port)], { stdio: 'ignore' });
const base = `http://localhost:${port}/ux/tasks/piglet-processing/`;
const ready = (p) => p.waitForSelector('html[data-ready]');
const text = async (p, sel) => (await p.locator(sel).first().innerText()).replace(/\s+/g, ' ');
const dialog = async (p) => (await p.locator('[role="dialog"]').last().innerText()).replace(/\s+/g, ' ');
const log = (p, v) => p.evaluate((k) => JSON.parse(sessionStorage.getItem('pp-log:' + k) || '[]'), v);
const stepValue = (p, cause) => p.locator(`[data-ds="Stepper"][data-field="${cause}"] [role="spinbutton"]`).innerText();

async function toDead(page, code, data) {
  await page.goto(base + `room.html?state=room&lens=all&fresh=1${data ? '&data=' + data : ''}`); await ready(page);
  await page.click(`[data-action="open-litter"][data-value="${code}"]`);
  await page.waitForURL(/litter\.html/); await ready(page);
  await page.click('[data-action="open-dead"]');
  await page.waitForURL(/dead\.html/); await ready(page);
}

try {
  await new Promise((r) => setTimeout(r, 400));
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();

  // 1. R1-26: room → A02 → Record dead. The steppers start at 0 for this entry (A02's 1 dead is said apart); the stepper keys
  // name the cause; photos are previewed, deleted, restored and ride the Save; Save returns to the litter (no host stub).
  await toDead(page, 'A02');
  assert.match(await dialog(page), /Record dead A02 · 12 alive · 1 dead so far/);
  for (const c of ['crushed', 'scours', 'starve_out', 'other']) assert.equal(await stepValue(page, c), '0');
  const inc = page.locator('[data-ds="Stepper"][data-field="crushed"] [data-step="1"]');
  assert.match(await inc.evaluate((el) => el.getAttribute('aria-label')), /Crushed · one more/);
  await inc.click();
  assert.match(await dialog(page), /1 unsaved/);
  await page.click('[data-action="photo-add"]'); await page.click('[data-action="photo-add"]');
  assert.match(await text(page, '[data-ds="Photos"]'), /2 attached/);
  await page.click('[data-action="photo-view"][data-value="ph-2"]');
  assert.match(await dialog(page), /Photo 2 of 2/);
  await page.click('[data-action="photo-delete"]');
  assert.match(await text(page, '[data-ds="Photos"]'), /1 attached.*Photo deleted/);
  await page.click('[data-action="photo-undo"]');
  assert.match(await text(page, '[data-ds="Photos"]'), /2 attached/);
  await page.click('[data-action="save"]');
  await page.waitForURL(/litter\.html\?.*saved=dead/); await ready(page);
  assert.match(await text(page, '[data-action="open-record"]'), /Alive 11 · Dead 2/);
  const ev1 = (await log(page, 'base')).pop();
  assert.equal(ev1.type, 'death'); assert.equal(ev1.photos.length, 2);
  console.log('ok 1 steppers from 0, photos kept on the event, Save → litter:', await text(page, '[data-action="open-record"]'));

  // 2. R1-26: Back keeps the draft on this phone and returns to the litter; reopening restores it. `Other` asks for a note.
  await page.click('[data-action="open-dead"]');
  await page.waitForURL(/dead\.html/); await ready(page);
  await page.click('[data-ds="Stepper"][data-field="other"] [data-step="1"]');
  await page.fill('input[data-field="pigNote"]', 'leg caught in the slats');
  await page.click('[data-action="back"]');
  await page.waitForURL(/litter\.html/); await ready(page);
  await page.click('[data-action="open-dead"]');
  await page.waitForURL(/dead\.html/); await ready(page);
  assert.equal(await stepValue(page, 'other'), '1');
  assert.equal(await page.inputValue('input[data-field="pigNote"]'), 'leg caught in the slats');
  await page.click('[data-action="save"]');
  await page.waitForURL(/litter\.html/); await ready(page);
  const ev2 = (await log(page, 'base')).pop();
  assert.equal(ev2.note, 'leg caught in the slats'); assert.equal(ev2.lines[0].note, 'leg caught in the slats');
  console.log('ok 2 Back keeps the draft; Other carries its note:', ev2.lines[0].cause, ev2.note);

  // 3. R1-8: a body found in A02 that is one of D03's missing: the drawer offers D03's open loss and records it there.
  // A02's Alive does not move; D03's line drops to 1.
  await toDead(page, 'A02');
  await page.click('[data-ds="Stepper"][data-field="crushed"] [data-step="1"]');
  assert.match(await dialog(page), /One of D03's 2 missing\?/);
  await page.click('[data-action="route"][data-value="D03"]');
  const routed = await dialog(page);
  assert.match(routed, /Record dead D03/); assert.match(routed, /Recording in D03 · found in A02/);
  assert.match(routed, /From the 2 missing 1 alive stays 11 · 1 missing still open/);
  await page.click('[data-action="save"]');
  await page.waitForURL(/litter\.html\?.*crate=A02/); await ready(page);
  assert.match(await text(page, '[data-action="open-record"]'), /Alive 12/);
  await page.click('[data-action="close"]');
  await page.waitForURL(/room\.html/); await ready(page);
  assert.match(await text(page, '[data-ds="Candidate:DriftStrip"]'), /Unexplained loss 1 D03/);
  console.log('ok 3 neighbour crate → D03\'s loss:', await text(page, '[data-ds="Candidate:DriftStrip"]'));

  // 4. R1-8 room-level: the drift strip → the room's open lines → `Found a body?` → whose? D03 → Save: back on Explain with
  // the receipt `all missing found`; D03's line is gone.
  await page.click('[data-action="explain"]');
  await page.waitForURL(/count\.html\?state=explain/); await ready(page);
  await page.click('[data-action="found-body"]');
  await page.waitForURL(/dead\.html\?.*state=dead-found/); await ready(page);
  assert.match(await dialog(page), /Found a body Unit 7 · whose missing piglet is it\? D03 · 1 piglet missing/);
  await page.click('[data-action="found-pick"][data-value="D03"]');
  await page.click('[data-ds="Stepper"][data-field="crushed"] [data-step="1"]');
  assert.match(await dialog(page), /alive stays 11 · none missing now/);
  await page.click('[data-action="save"]');
  await page.waitForURL(/count\.html\?.*state=explain.*saved=dead/); await ready(page);
  await page.waitForSelector('#ct-receipt span');
  assert.match(await text(page, '#ct-receipt'), /Saved\s*·\s*D03\s*·\s*\+1 crushed\s*·\s*all missing found/);
  assert.match(await text(page, '#screen'), /Nothing unexplained here/);
  console.log('ok 4 room `Found a body` → D03 → back on Explain:', await text(page, '#ct-receipt'));

  // 5. R1-26: Back from a drawer opened on Explain returns to Explain (not to a host or the litter).
  await page.goto(base + 'room.html?state=room&lens=all&data=explain&fresh=1'); await ready(page);
  await page.click('[data-action="explain"]');
  await page.waitForURL(/count\.html\?state=explain/); await ready(page);
  await page.click('[data-action="open-dead"][data-value="B06"]');
  await page.waitForURL(/dead\.html/); await ready(page);
  await page.click('[data-action="back"]');
  await page.waitForURL(/count\.html\?state=explain/); await ready(page);
  console.log('ok 5 Back from Explain\'s Record dead returns to Explain:', new URL(page.url()).search);

  // 6. R1-9: B06 counted 11 (one missing, unnamed). Its body carries tag 271004: the drawer asks whether it was the missing
  // one; yes closes the loss and Alive stays 11.
  await page.click('[data-action="open-dead"][data-value="B06"]');
  await page.waitForURL(/dead\.html/); await ready(page);
  await page.check('input[data-action="pick"][value="B06-r4"]');
  await page.click('[data-action="pick-cause"][data-value="crushed"]');
  assert.match(await text(page, '#dd-why'), /Was 271004 one of the missing\? Answer to save/);
  await page.click('[data-action="save"]', { force: true });                       // waiting: answered, nothing saved
  assert.match(page.url(), /dead\.html/);
  await page.click('[data-action="miss"][data-value="yes"]');
  await page.click('[data-action="save"]');
  await page.waitForURL(/count\.html\?state=explain/); await ready(page);
  await page.waitForSelector('#ct-receipt span');
  assert.match(await text(page, '#ct-receipt'), /271004 crushed\s*·\s*all missing found/);
  assert.doesNotMatch(await text(page, '#screen'), /B06 · Unexplained loss/);
  console.log('ok 6 a tagged body closes the loss a count left unnamed:', await text(page, '#ct-receipt'));

  // 7. R1-22: a held body (the same body recorded twice offline) is shown in the dead drawer and answered there.
  await toDead(page, 'A07', 'held-body');
  assert.match(await dialog(page), /Same body recorded twice\?/);
  await page.click('[data-action="resolve"][data-value$="|one"]');
  assert.doesNotMatch(await dialog(page), /Same body recorded twice\?/);
  assert.match(await dialog(page), /Record dead A07 · 13 alive/);
  console.log('ok 7 held body answered in the dead drawer: One body');

  // 8. At 360 the drawer header's Clear never overlaps the title line.
  await page.setViewportSize({ width: 360, height: 740 });
  await toDead(page, 'A02');
  await page.click('[data-ds="Stepper"][data-field="crushed"] [data-step="1"]');
  const clear = await page.locator('[data-action="clear"]').boundingBox();
  const title = await page.locator('.dd-grab .st-heading-main').boundingBox();
  assert.ok(clear.x >= title.x + title.width - 1 || clear.y >= title.y + title.height - 1, 'Clear overlaps the title');
  console.log('ok 8 360: Clear clear of the title');

  await browser.close();
} finally {
  server.kill();
}
