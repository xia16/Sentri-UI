// Edit, the litter record and End click-through (scenario round 1: R1-7, R1-12, R1-13, R1-14, R1-21, R1-28, R1-29,
// R1-30, N5, N6; owner round 4: two answers to a possible double, End with reviews open). Every fixed flow from the room
// by real taps. Run: node tests/edit-end-click-through.mjs [port]
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
// The `·` between Status tokens is a real text node spaced by CSS: the text reads it with a space each side.
const text = async (p, sel) => (await p.locator(sel).first().innerText()).replace(/\s*·\s*/g, ' · ').replace(/\s+/g, ' ');
// A live status region mounts empty and is filled a moment later (ADR 0002): wait for it.
async function live(p, sel, re) {
  await p.waitForFunction(([s, src]) => { const el = document.querySelector(s); return !!el && new RegExp(src).test(el.innerText.replace(/\s*·\s*/g, ' · ').replace(/\s+/g, ' ')); }, [sel, re.source], { timeout: 4000 });
  return text(p, sel);
}
// room → a litter's sheet (the All lens when the litter isn't owed now)
async function openLitter(page, crate, data, fresh = true) {
  await page.goto(base + 'room.html?state=room' + (data ? '&data=' + data : '') + (fresh ? '&fresh=1' : '')); await ready(page);
  if (!(await page.locator(`[data-action="open-litter"][data-value="${crate}"]`).count())) await page.click('[data-action="lens"][data-value="all"]');
  await page.click(`[data-action="open-litter"][data-value="${crate}"]`);
  await page.waitForURL(/state=litter/); await ready(page);
}
async function openEdit(page) {
  await page.click('[data-action="open-edit"]');
  await page.waitForURL(/edit\.html/); await ready(page);
}
// litter → Record dead: one crushed (with photos), Save returns to the litter
async function recordDead(page, photos) {
  await page.click('[data-action="open-dead"]');
  await page.waitForURL(/dead\.html/); await ready(page);
  await page.click('[data-ds="Stepper"][data-field="crushed"] [data-step="1"]');
  for (let i = 0; i < photos; i++) await page.click('[data-action="photo-add"]');
  await page.click('[data-action="save"]');
  await page.waitForURL(/state=litter/); await ready(page);
}
async function hold(page, sel, ms = 1100) {
  const b = await page.locator(sel).boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down(); await page.waitForTimeout(ms); await page.mouse.up();
}

try {
  await new Promise((r) => setTimeout(r, 400));
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();

  // 1. R1-7: room → A02 → Record dead (+1 crushed) → Edit lists the death → Recorded by mistake → Save → the receipt
  //    says alive and dead went back; the litter reads Alive 12 again.
  await openLitter(page, 'A02');
  await recordDead(page, 0);
  assert.match(await text(page, '.lt-summary'), /Alive 11/);
  await openEdit(page);
  const death = page.locator('[data-action="death-void"]').last();
  await death.click();
  assert.match(await live(page, '#ed-banner-summary', /withdrawn/), /Death \+1 crushed withdrawn · recorded by mistake · A02 alive 11 → 12/);
  await page.click('[data-action="save"]');
  let rc = await live(page, '#ed-saved', /Correction saved/);
  assert.match(rc, /Correction saved · A02 · alive 11 → 12 · dead 2 → 1/);
  await page.click('[data-action="back"]');
  await page.waitForURL(/state=litter/); await ready(page);
  assert.match(await text(page, '.lt-summary'), /Alive 12/);
  console.log('ok 1 R1-7 room → A02 → dead → Edit → withdraw the death → Save:', rc);

  // 2. R1-7: a death on the wrong litter moves: Edit → On another litter → A04 → Save → both litters' alive in the receipt;
  //    the record page says where it went.
  await recordDead(page, 2);
  await page.click('[data-action="open-record"]');                          // the death's photos show, and open (Back only)
  await page.waitForURL(/state=record-page/); await ready(page);
  await page.click('[data-action="rec-photo"]');
  assert.match(await text(page, '[data-st-context="drawer"]'), /Photo 1 of 2/);
  assert.equal(await page.locator('[data-st-context="drawer"] [data-action="photo-delete"]').count(), 0);
  await page.click('[data-st-context="drawer"] [data-action="photo-back"]');
  await page.waitForTimeout(400);
  await page.click('[data-action="back"]');
  await page.waitForURL(/state=litter/); await ready(page);
  await openEdit(page);
  await page.locator('[data-action="death-to"]').last().click();
  assert.equal(await page.evaluate(() => +getComputedStyle(document.querySelector('[data-view="picker"]')).zIndex > +getComputedStyle(document.querySelector('[data-view="edit"]')).zIndex), true);   // R1-28: Edit sits under the picker's scrim
  await page.click('[data-action="pick"][data-value="A04"]');
  await page.click('[data-action="save"]');
  rc = await live(page, '#ed-saved', /Correction saved/);
  assert.match(rc, /A02 · alive 11 → 12 · dead 2 → 1 .*A04 · alive 11 → 10 · dead 1 → 2/);
  await page.waitForTimeout(400);                                            // Back right after a drawer closes is a ghost tap
  await page.click('[data-action="back"]');
  await page.waitForURL(/state=litter/); await ready(page);
  await page.click('[data-action="open-record"]');
  await page.waitForURL(/state=record-page/); await ready(page);
  assert.match(await text(page, '[data-ds="Log"]'), /\+1 crushed moved to A04/);
  console.log('ok 2 R1-7 death on the wrong litter → A04 → Save → record page:', rc);

  // 3. R1-28: `Done on another crate` without pressing −; the receipt says what the correction did on both litters.
  await openLitter(page, 'A02');
  await page.click('[data-action="record"][data-value="tail"]');
  await page.waitForTimeout(700);
  await openEdit(page);
  await page.click('[data-action="mark-why"][data-value$=":to"]');
  await page.click('[data-action="pick"][data-value="A04"]');
  assert.match(await live(page, '#ed-banner-summary', /A04/), /Dock tail 12 → 0 piglets · done on A04 11 piglets/);
  await page.click('[data-action="save"]');
  rc = await live(page, '#ed-saved', /Correction saved/);
  assert.match(rc, /A02 · Dock tail owed 0 → 12 · A04 · Dock tail owed 11 → 0/);
  console.log('ok 3 R1-28 Done on another crate (no −) → A04 → Save:', rc);

  // 4. R1-28: castration's reasons are Q16's; a lowered castration filed as hernia leaves the task (not deferred).
  await openLitter(page, 'A02', 'a02-castrated');
  await openEdit(page);
  const cut = page.locator('[data-mark] [data-action="mark-step"][data-step="-1"]').first();
  await cut.click();
  const why = await text(page, '[data-mark]');
  assert.match(why, /Hernia .*Cryptorchid .*Deferred .*Kept boar/);
  assert.doesNotMatch(why, /Weak|Sick/);
  await page.click('[data-action="mark-why"][data-value$=":hernia"]');
  assert.match(await live(page, '#ed-banner-summary', /hernia/), /Castrate 3 → 2 piglets · hernia 1/);
  await page.click('[data-action="save"]');
  rc = await live(page, '#ed-saved', /Correction saved/);
  await page.click('[data-action="back"]');
  await page.waitForURL(/state=litter/); await ready(page);
  await page.click('[data-action="open-record"]');
  await page.waitForURL(/state=record-page/); await ready(page);
  assert.match(await text(page, '[data-ds="Log"]'), /Castrate 3 → 2 piglets · not castrated: hernia 2, weak 2 · the record of 09:20/);
  console.log('ok 4 R1-28 castration → hernia (Q16) → Save → record page:', rc);

  // 5. R1-29 + round 4: A05's possible double from the room → Edit names it → Answer → Given twice → Save → counted once,
  //    a double dose for the vet; the record page says so; the litter's flag is gone.
  await openLitter(page, 'A05');
  await openEdit(page);
  assert.match(await text(page, '[data-ds="Section"]'), /Possible double · Iron · day 3/);
  await page.click('[data-action="open-double"]');
  await page.waitForURL(/state=double/); await ready(page);
  assert.equal(await page.locator('[data-action="save"][aria-disabled="true"]').count(), 1);
  await page.click('[data-action="save"]', { force: true });                 // a waiting Save answers with its reason
  assert.match(await live(page, '#ed-why', /Pick/), /Pick what happened/);
  await page.click('[data-action="dbl-answer"][data-value="twice"]');
  await page.click('[data-action="save"]');
  rc = await live(page, '#ed-saved', /Answer saved/);
  assert.match(rc, /Answer saved · Given twice · a double dose for the vet · Iron · day 3 counted once · 11 piglets/);
  await page.click('[data-action="open-record"]');
  await page.waitForURL(/state=record-page/); await ready(page);
  const rec = await text(page, '[data-ds="Log"]');
  assert.match(rec, /Possible double answered · Iron · day 3 · given twice/);
  assert.match(rec, /given twice · a double dose for the vet · counted once/);
  console.log('ok 5 R1-29 A05 → Edit → Answer → Given twice → Save → record page:', rc);

  // 6. R1-29: the litter's own review door opens the answer sheet directly; Back returns to the litter.
  await openLitter(page, 'A05');
  await page.click('[data-action="open-review"]');
  await page.waitForURL(/edit\.html\?.*double=/); await ready(page);
  assert.match(await text(page, '#screen'), /Possible double · Iron .*What happened\?/);
  await page.click('[data-action="back"]');
  await page.waitForURL(/state=litter/); await ready(page);

  // 6b. "Same injection, recorded twice" asks which record, withdraws it (kept, stamped).
  await openEdit(page);
  await page.click('[data-action="mark-step"][data-value="T-A05-lm"][data-step="-1"]');
  const opts = await text(page, '[data-mark="T-A05-lm"]');
  assert.doesNotMatch(opts, /Recorded by mistake/);                         // a double is not "recorded by mistake · stays owed"
  assert.match(opts, /Same injection, recorded twice/);
  await page.click('[data-mark="T-A05-lm"] [data-action="open-double"]');
  await page.waitForURL(/state=double/); await ready(page);
  await page.click('[data-action="dbl-answer"][data-value="same"]');
  await page.click('[data-action="dbl-withdraw"][data-value="T-A05-lm"]');
  await page.click('[data-action="save"]');
  rc = await live(page, '#ed-saved', /Answer saved/);
  assert.match(rc, /Same injection, recorded twice · 08:40 · L\.M withdrawn, kept · Iron · day 3 counted once · 11 piglets/);
  await page.click('[data-action="back"]');
  await page.waitForURL(/state=litter/); await ready(page);
  console.log('ok 6 R1-29 Same injection → which record → Save:', rc);

  // 7. R1-14: a held body reads held; the count it explained reads explained, with a door to the death.
  await openLitter(page, 'A07', 'held-body');
  await page.click('[data-action="open-record"]');
  await page.waitForURL(/state=record-page/); await ready(page);
  const held = await text(page, '[data-ds="Log"]');
  assert.match(held, /\+1 crushed held for review · maybe the same body as 09:50 · L\.M/);
  assert.match(held, /Count 13 1 missing · explained explained by a death · \+1 crushed · 09:50 · L\.M See the death/);
  await page.click('[data-action="goto-entry"]');
  console.log('ok 7 R1-14 held body and explained count on the record page');

  // 8. End with a review open (round 4), N5, N6, R1-21, R1-12: room (17 Oct) → overview → End → the review lists the
  //    possible double, the day's records by hand and the doses ending drops → hold → the receipt freezes the double as
  //    unresolved at End; Back returns to the room (R1-30).
  await page.goto(base + 'room.html?state=room&data=late&fresh=1'); await ready(page);
  await page.click('.tk-header-back');                                           // the room's Back opens the task overview
  await page.waitForURL(/end\.html/); await ready(page);
  const ov = await text(page, '[data-ds="TaskPage"]');
  assert.match(ov, /Piglet deaths .*4 piglets/);
  await page.click('[data-action="review"]');
  const rv = await text(page, '[data-ds="TaskPage"]');
  assert.match(rv, /Ending now drops 28 scheduled piglet-doses/);
  assert.match(rv, /Open for review .*A05 · possible double · Iron d3/);
  await page.click('[data-action="day"]');                                   // one level down (round 5)
  assert.match(await text(page, '[data-ds="TaskPage"]'), /Today's records, by hand .*L\.M 4 records B03 · Castrate · 1 15:40/);
  await page.click('[data-action="close-sheet"]');
  await hold(page, '[data-action="hold"]', 300);                             // released early: not ended
  assert.match(await live(page, '#pp-hold-status', /KEEP|RELEASED/), /KEEP HOLDING TO END|RELEASED · NOT ENDED/);
  await hold(page, '[data-action="hold"]');
  await page.waitForFunction(() => /state=receipt/.test(location.search), null, { timeout: 4000 });
  const receipt = await text(page, '[data-ds="TaskPage"]');
  assert.match(receipt, /Unresolved at End .*A05 · possible double · Iron d3/);
  assert.match(receipt, /Figures as at End\. What happened since is under Since End\./);
  await page.click('[data-action="close-sheet"]');
  assert.match(await text(page, '#screen'), /No new treatments\. Piglets moved in after End keep their doses as not done\./);
  await page.click('[data-ds="TaskPage"] [data-action="back"]');
  await page.waitForURL(/room\.html/); await ready(page);
  console.log('ok 8 room → overview → End (review open, day by hand, drops) → hold → receipt → Back → room');

  // 9. R1-13: after End the room's Back lands on the ended task (no End anywhere); an overview or End review opened after
  //    End names the real ender before any hold, and opens the receipt.
  await page.click('.tk-header-back');
  await page.waitForURL(/end\.html\?.*state=ended/); await ready(page);
  assert.equal(await page.locator('[data-action="review"], [data-action="hold"]').count(), 0);
  await page.goto(base + 'end.html?state=end-review&data=late'); await ready(page);
  const again = await text(page, '[data-ds="TaskPage"]');
  assert.match(again, /Already ended by G\.H/);
  assert.equal(await page.locator('[data-action="hold"]').count(), 0);
  await page.click('[data-ds="TaskPage"] [data-action="receipt"]');
  assert.match(await text(page, '[data-ds="TaskPage"]'), /Unresolved at End/);
  console.log('ok 9 R1-13 after End: the ended task, no End; a second End names G.H before any hold');

  // 10. Round 4: the review End froze stays answerable: receipt row → the double → Given twice → Save → back to the
  //     ended task: Since End says it was answered; the frozen list no longer holds it.
  await page.click('[data-ds="TaskPage"] [data-action="open-review"]');
  await page.waitForURL(/state=double/); await ready(page);
  await page.click('[data-action="dbl-answer"][data-value="twice"]');
  await page.click('[data-action="save"]');
  await live(page, '#ed-saved', /Answer saved/);
  await page.click('[data-action="back"]');
  await page.waitForURL(/end\.html/); await ready(page);
  const face = await text(page, '#screen');
  assert.match(face, /A05 · Iron d3 · possible double answered: given twice/);
  assert.doesNotMatch(face, /Unresolved at End Frozen at End/);              // the frozen list no longer holds it
  console.log('ok 10 an unresolved-at-End double answered after End → Since End');

  // 11. R1-30: End blocked by farrowing says where to end it and opens the litter still farrowing (never the concept board).
  await page.goto(base + 'room.html?state=room&fresh=1'); await ready(page);
  await page.click('.tk-header-back');                                           // the room's Back opens the task overview
  await page.waitForURL(/end\.html/); await ready(page);
  await page.click('[data-action="review"]');
  const bl = await text(page, '[data-ds="TaskPage"]');
  assert.match(bl, /End it in the Farrowing task on the Tasks list/);
  assert.match(bl, /litters with work left .* not yet due/);
  await page.click('[data-action="open-litter"][data-value="D01"]');
  await page.waitForURL(/state=litter.*crate=D01/); await ready(page);
  console.log('ok 11 R1-30 End blocked → D01 litter');

  // 12. The handoff: rows open their litter; weights say their day; not-reached doses are "not given in this task".
  await page.goto(base + 'end.html?state=weaning-handoff'); await ready(page);
  const ho = await text(page, '[data-ds="TaskPage"]');
  assert.match(ho, /day-21 weight 66\.0 kg/);
  assert.match(ho, /Health shot · 28 not given in this task/);
  assert.match(ho, /Castrate · 4 not done at End/);
  await page.click('[data-ds="TaskPage"] [data-action="open-litter"][data-value="A02"]');
  await page.waitForURL(/state=litter.*crate=A02/); await ready(page);
  console.log('ok 12 handoff wording, weights by day, rows open their litter');

  await browser.close();
} finally {
  server.kill();
}
