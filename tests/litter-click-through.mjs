// Litter sheet click-through (scenario round 1: R1-2, R1-3, R1-4, R1-10, R1-13, R1-17, R1-19, R1-22, R1-24, R1-25, N12;
// one sheet for orphans and nurse sows; edge Back): every fixed flow from the room by real taps.
// Run: node tests/litter-click-through.mjs [port]. Uses the Playwright the design lint installs (~/.cache/adam-design/playwright-<v>).
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
const clean = (s) => s.replace(/\s+/g, ' ');
const text = async (p, sel) => clean(await p.locator(sel).first().innerText());
// round 5: the litter is a drawer over the room; a treatment opens in the same drawer (its `dose` view)
const face = (p) => text(p, '[data-view="litter"]');
const drawer = (p) => text(p, '[data-view="dose"]');
const DOSE = '[data-view="dose"]';
const bar = async (p) => ((await p.locator('#lt-receipt').count()) ? text(p, '#lt-receipt') : '');
const row = (p, action, value) => p.locator(`[data-action="${action}"][data-value="${value}"]`).first();

// the room (a fixture variant for the day's start), then the litter's row
async function openLitter(page, crate, data, fresh) {
  await page.goto(base + 'room.html?state=room' + (data ? '&data=' + data : '') + (fresh ? '&fresh=1' : '')); await ready(page);
  if (!(await page.locator(`[data-action="open-litter"][data-value="${crate}"]`).count())) await page.click('[data-action="lens"][data-value="all"]');
  await page.click(`[data-action="open-litter"][data-value="${crate}"]`);
  await page.waitForURL(/state=litter/); await ready(page);
}

try {
  await new Promise((r) => setTimeout(r, 400));
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  let f, d;

  // 1. R1-2: an `arrived · unknown` row opens the resolve drawer on the litter (never a 0-owed dose drawer): 1 already had it,
  //    the other recorded now. Visible tail reads `check on the pig`.
  await openLitter(page, 'B02', 'moved-unknown', true);
  f = await face(page);
  assert.match(f, /Iron · day 3 2 from B09 · 004229, 004230\s*·?\s*unknown — check spray mark/);
  assert.match(f, /Dock tail 2 from B09 · 004229, 004230\s*·?\s*check on the pig/);
  assert.doesNotMatch(f, /0 owed/);
  await page.click('[data-action="open-resolve"][data-value$=":iron3"]');
  d = await drawer(page);
  assert.match(d, /Already had it/);
  await page.click('[data-action="step"][data-value="had"][data-step="1"]');
  assert.match(await drawer(page), /Say what to do with the other piglet/);
  await page.click('[data-action="radio"][data-value="record"]');
  await page.click('[data-action="save"]');
  await page.waitForSelector(DOSE, { state: 'detached' });
  assert.match(await bar(page), /Saved · iron · day 3 · 1 already had it · 1 recorded now/);
  f = await face(page);
  assert.doesNotMatch(f, /unknown — check spray mark/);
  assert.match(f, /1 piglet arrived by Move/);
  console.log('ok 1 arrived · unknown → resolve on the litter:', (await bar(page)).slice(0, 70));

  // 2. R1-3: after a Don't-know move out the source owes a range, with no one-tap; a check on the pig settles it.
  await openLitter(page, 'A07', 'move-doubt', true);
  f = await face(page);
  assert.match(f, /Iron · day 3 due day 3\s*·?\s*0–2 of 11 owed · check\s*·?\s*3 moved to A04, not known/);
  assert.equal(await page.locator('[data-action="record"][data-value="iron3"]').count(), 0);
  await row(page, 'open-dose', 'iron3').click();
  await page.click('[data-action="step"][data-value="still"][data-step="-1"]');
  await page.click('[data-action="step"][data-value="still"][data-step="-1"]');
  await page.click('[data-action="save"]');
  await page.waitForSelector(DOSE, { state: 'detached' });
  assert.match(await bar(page), /Saved · iron · day 3 · none still owe it/);
  assert.doesNotMatch(await face(page), /0–2 of 11/);
  console.log('ok 2 range 0–2 of 11 → checked on the pig → settled');

  // 3. R1-4 + R1-10: two day-1 orphans moved onto A02 (day 3) — iron is due now for A02's own 12, in 2 days for the two;
  //    the one-tap records 12 and defers the two `not due`; the header balances with the move.
  await openLitter(page, 'D06', null, true);
  f = await face(page);
  assert.match(f, /Sow died/);                                  // one sheet for an orphaned litter, not edge.html
  assert.match(page.url(), /state=litter/);
  await page.click('[data-action="open-move"]');
  await page.waitForURL(/move\.html/); await ready(page);
  await page.waitForSelector('[data-st-context="drawer"]');
  const box = page.locator('[data-role="crate-q"]'); await box.click(); await box.type('A02');
  await page.click('[data-action="pick-crate"][data-value="A02"]');
  await page.click('[data-action="step"][data-value="n"][data-step="1"]');
  await page.click('[data-action="save-move"]');
  assert.match(await text(page, '[data-st-context="drawer"]'), /Saved · 2 piglets moved to A02/);   // move.html's own drawer
  await openLitter(page, 'A02', null, false);
  f = await face(page);
  assert.match(f, /Born 13 Alive 14 Dead 1 Moved in 2/);
  assert.match(f, /Iron · day 3 12 owed now of 14\s*·?\s*12 of its own\s*·?\s*day 3\s*·?\s*due today\s*·?\s*2 from D06\s*·?\s*day 1\s*·?\s*due in 2 days/);
  await page.click('[data-action="record"][data-value="iron3"]');
  assert.match(await bar(page), /Saved · iron · day 3 · 12 piglets · 2 not due yet, back on their day/);
  await page.waitForTimeout(700);
  f = await face(page);
  assert.match(f, /Recorded.*Iron · day 3 \d\d:\d\d · G\.H\s*·?\s*12 piglets\s*·?\s*2 deferred: not due yet/);
  assert.match(f, /Later.*Iron · day 3 2 from D06\s*·?\s*due day 3 · in 2 days/);
  console.log('ok 3 arrivals by their own age: Record 12, 2 not due · header balances');

  // 4. R1-25: one-tap Record has Undo on its receipt; the owed comes back.
  await page.click('[data-action="record"][data-value="tail"]');
  assert.match(await bar(page), /Saved · dock tail · 12 piglets.*Undo/);
  await page.waitForTimeout(700);
  await page.click('[data-action="undo"]');
  assert.match(await bar(page), /Undone · dock tail · 12 piglets owed again/);
  assert.equal(await page.locator('[data-action="record"][data-value="tail"]').count(), 1);
  console.log('ok 4 one-tap → Undo → owed again');

  // 5. R1-24: the phone's Back with a drawer open closes the drawer and keeps the draft; Resume brings it back.
  await row(page, 'open-dose', 'tail').click();
  await page.click('[data-action="step"][data-value="n"][data-step="-1"]');
  await page.goBack();
  await page.waitForSelector(DOSE, { state: 'detached' });
  assert.match(page.url(), /state=litter/);
  assert.match(await face(page), /Dock tail 1 unsaved Resume/);
  await page.click('[data-action="open-dose"][data-value="tail"] >> nth=-1');
  assert.match(await drawer(page), /Treated of 14 owed 13/);
  console.log('ok 5 phone Back closes the drawer, keeps the draft → Resume');

  // 6. R1-25: a gray Save looks waiting and a tap says why; N12: untreated split across reasons (1 weak, 1 sick);
  //    the partial record shows in Recorded at once.
  await page.click('[data-action="step"][data-value="n"][data-step="-1"]');
  const save = page.locator('[data-action="save"]');
  assert.equal(await save.getAttribute('aria-disabled'), 'true');
  await save.click({ force: true });                              // the waiting face takes the tap (aria-disabled, never disabled)
  assert.equal(await page.locator('#lt-why[data-answer]').count(), 1);
  await page.waitForTimeout(150);                                // the reason re-announces: cleared, then set
  assert.match(await text(page, '#lt-why'), /Pick why 2 weren't treated/);
  await page.click('[data-action="radio"][data-value="split"]');
  assert.match(await drawer(page), /Weak the other 1 sick 1/);
  await save.click();
  await page.waitForSelector(DOSE, { state: 'detached' });
  f = await face(page);
  assert.match(f, /Recorded.*Dock tail \d\d:\d\d · G\.H\s*·?\s*12 piglets\s*·?\s*2 deferred: 1 weak, 1 sick/);
  assert.match(f, /Dock tail due day 3\s*·?\s*2 owed · deferred: weak, sick/);
  console.log('ok 6 waiting Save says why → split 1 weak, 1 sick → in Recorded at once');

  // 7. R1-25: 0 treated + all deferred records the deferral, never `0 piglets`.
  await openLitter(page, 'A04', null, true);
  await row(page, 'open-dose', 'iron3').click();
  for (let i = 0; i < 11; i++) await page.click('[data-action="step"][data-value="n"][data-step="-1"]');
  await page.click('[data-action="radio"][data-value="weak"]');
  await page.click('[data-action="save"]');
  await page.waitForSelector(DOSE, { state: 'detached' });
  assert.match(await bar(page), /Saved · iron · day 3 · none treated · 11 deferred/);
  assert.doesNotMatch(await face(page), /0 piglets/);
  console.log('ok 7 0 treated, all weak → the deferral, not "0 piglets"');

  // 8. R1-25: No males never wipes entered counts silently.
  await openLitter(page, 'A02', 'a02-castrate', true);
  await row(page, 'open-dose', 'castrate').click();
  await page.click('[data-action="step"][data-value="castrated"][data-step="1"]');
  await page.click('[data-action="step"][data-value="castrated"][data-step="1"]');
  await page.click('[data-action="no-males"]');
  assert.match(await drawer(page), /No males clears the 2 already counted Clear them Keep counts/);
  await page.click('[data-action="no-males-keep"]');
  assert.match(await drawer(page), /Castrated 2/);
  await page.click('[data-action="no-males"]');
  await page.click('[data-action="no-males-yes"]');
  assert.match(await drawer(page), /Castrated 0/);
  console.log('ok 8 No males asks before it clears counts');

  // 9. R1-13: after End the litter never reads actionable: `not done at End`, no Owed today, no Later, no one-tap.
  await openLitter(page, 'B01', 'ended', true);
  f = await face(page);
  assert.match(f, /Not done at End Task ended · 16:20 · G\.H Castrate 1 not done at End · can no longer be recorded/);
  assert.doesNotMatch(f, /Owed today|treatments left|Later/);
  assert.equal(await page.locator('[data-action="record"]').count(), 0);
  // …and a review open at End reads `unresolved at End`, still answerable (round 4)
  await openLitter(page, 'A05', 'ended', false);
  assert.match(await face(page), /Possible double treatment · Iron · day 3.*unresolved at End · still answerable/);
  console.log('ok 9 ended: not done at End · unresolved at End');

  // 10. R1-19: a litter emptied by moves reads closed.
  await openLitter(page, 'C05', 'emptied', true);
  f = await face(page);
  assert.match(f, /Born 9 Alive 0 Dead 1 Moved out 8/);
  assert.match(f, /Litter closed No piglets left · nothing owed/);
  assert.doesNotMatch(f, /Owed today|Later/);
  console.log('ok 10 emptied → Litter closed');

  // 11. R1-17: identity owed on its day, a door to the identity page.
  await openLitter(page, 'C05', null, true);
  assert.match(await face(page), /Identity · tag 8 to identify\s*·?\s*late 1 day/);
  await page.click('[data-ds="Row"][data-action="open-identity"] >> nth=0');
  await page.waitForURL(/id\.html/);
  console.log('ok 11 identity owed on its day → id.html');

  // 12. R1-22: a held body and a possible double are on the sheet, each with its door to the answer.
  await openLitter(page, 'A07', 'held-body', true);
  assert.match(await face(page), /Needs an answer 1 held for review Same body recorded twice\?/);
  await page.click('[data-action="open-review"]');
  await page.waitForURL(/count\.html/); await ready(page);
  assert.match(await text(page, '#screen'), /Same body recorded twice\?/);
  await openLitter(page, 'A05', null, true);
  assert.match(await face(page), /Possible double treatment · Iron · day 3 08:40 · L\.M · 11 piglets\s*·?\s*08:52 · G\.H · 11 piglets\s*·?\s*same injection recorded twice, or given twice\?/);
  await page.click('[data-action="open-review"]');
  await page.waitForURL(/edit\.html\?.*double=T-A05-lm%2BT-A05-gh/);
  console.log('ok 12 held body → count host; possible double → Edit');

  // 13. round 4: a nurse sow that joined the task is the litter sheet, her earlier litter on its own line.
  await openLitter(page, 'D02', 'moved-orphan', true);
  f = await face(page);
  assert.match(page.url(), /state=litter/);
  assert.match(f, /Alive 13 Dead 0 Moved in 13/);
  assert.match(f, /Nurse sow from B01/);
  assert.match(f, /Her earlier litter born 12 · dead 1 · weaned 11/);
  assert.equal(await page.locator('[data-action="record"][data-value="iron3"]').count(), 1);
  console.log('ok 13 nurse sow: one sheet, earlier litter on its own line');

  // 14. edge: the birth-weight drawer closes on the phone's Back and keeps the page.
  await openLitter(page, 'C02', null, true);
  await page.click('[data-action="open-weight"]');
  await page.waitForURL(/state=litter.*dose=weight/);
  await page.waitForSelector('[data-view="weight"]');
  await page.goBack();
  await page.waitForSelector('[data-view="weight"]', { state: 'detached' });
  assert.match(page.url(), /state=litter/);
  console.log('ok 14 edge weight drawer: phone Back closes it, stays on the page');

  // 15. The dead drawer's Save hands its receipt to the litter (`saved=dead`, pp-receipt:dead), shown once.
  await openLitter(page, 'A02', null, true);
  await page.click('[data-action="open-dead"]');
  await page.waitForURL(/dead\.html/); await ready(page);
  await page.click('[data-action="dead-step"][data-value="crushed"][data-step="1"]');
  await page.click('[data-action="save"]');
  await page.waitForURL(/state=litter.*saved=dead/); await ready(page);
  assert.match(await bar(page), /Saved · \+1 crushed/);
  assert.match(await face(page), /Alive 11 Dead 2/);
  await page.reload(); await ready(page);
  assert.doesNotMatch(await bar(page), /crushed/);              // handed over once, then dropped
  console.log('ok 15 dead Save → litter receipt:', (await bar(page)).slice(0, 40), '(once)');

  // 16. Drafts other pages keep on this phone show on their doors: Record dead, Set count, identity.
  await page.click('[data-action="open-dead"]');
  await page.waitForURL(/dead\.html/); await ready(page);
  await page.click('[data-action="dead-step"][data-value="crushed"][data-step="1"]');
  await page.click('[data-action="dead-step"][data-value="crushed"][data-step="1"]');
  await page.click('[data-action="back"]');
  await page.waitForURL(/state=litter/); await ready(page);
  assert.match(await text(page, '.pp-tools'), /Record dead 2 unsaved Set count/);
  await page.click('[data-action="open-count"]');
  await page.waitForURL(/count\.html/); await ready(page);
  await page.click('[data-action="step"][data-step="-1"]');
  await page.click('[data-st-context="drawer"] [data-action="back"]');      // the count drawer, then the count face
  await page.waitForSelector('[data-st-context="drawer"][data-view="count"]', { state: 'detached' });
  await page.waitForTimeout(450);
  await page.click('[data-action="back"]');
  await page.waitForURL(/state=litter/); await ready(page);
  assert.match(await text(page, '.pp-tools'), /Record dead 2 unsaved Set count 10 counted · not saved/);
  await page.click('[data-ds="Row"][data-action="open-identity"] >> nth=-1');
  await page.waitForURL(/id\.html/); await ready(page);
  await page.click('[data-action="open-run"]');
  for (const k of '0043') await page.click(`[data-action="numpad"][data-value="tag"][data-key="${k}"]`);
  await page.click('[data-action="close"]');
  await page.waitForURL(/state=litter/); await ready(page);
  assert.match(await face(page), /Record identity a piglet in hand · not saved/);
  console.log('ok 16 drafts on the doors: dead 2 unsaved · Set count 10 · identity in hand');

  // 17. edge: Record dead from a litter outside the task comes back to its own face, with the receipt.
  await openLitter(page, 'E01', null, true);
  assert.match(page.url(), /state=litter/);
  await page.click('[data-action="open-dead"]');
  await page.waitForURL(/dead\.html\?.*crate=E01/); await ready(page);
  await page.click('[data-action="dead-step"][data-value="crushed"][data-step="1"]');
  await page.click('[data-action="save"]');
  await page.waitForURL(/state=litter.*crate=E01.*saved=dead/); await ready(page);
  assert.match(await text(page, '#lt-receipt'), /Saved · \+1 crushed/);
  console.log('ok 17 edge → Record dead → Save → back on edge with the receipt');

  await browser.close();
} finally {
  server.kill();
}
