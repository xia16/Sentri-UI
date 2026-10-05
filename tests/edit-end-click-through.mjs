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
  // (a region may be visually hidden, item 11: read its textContent)
  await p.waitForFunction(([s, src]) => { const el = document.querySelector(s); return !!el && new RegExp(src).test(el.textContent.replace(/\s*·\s*/g, ' · ').replace(/\s+/g, ' ')); }, [sel, re.source], { timeout: 4000 });
  return (await p.locator(sel).first().textContent()).replace(/\s*·\s*/g, ' · ').replace(/\s+/g, ' ');
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
// litter → Record death: one crushed (with photos), Save returns to the litter
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

  // 1. R1-7: room → A02 → Record death (+1 crushed) → Edit lists the death → Recorded by mistake → Save → the receipt
  //    says alive and dead went back; the litter reads Alive 12 again.
  await openLitter(page, 'A02');
  await recordDead(page, 0);
  assert.match(await text(page, '.lt-summary'), /Alive now 11/);
  await openEdit(page);
  const death = page.locator('[data-action="death-void"]').last();
  await death.click();
  assert.match(await live(page, '#ed-banner-summary', /withdrawn/), /Death \+1 crushed withdrawn · recorded by mistake · A02 alive 11 → 12/);
  await page.click('[data-action="save"]');
  let rc = await live(page, '#ed-saved', /Correction saved/);
  assert.match(rc, /Correction saved · A02 · alive 11 → 12 · dead 2 → 1/);
  await page.click('[data-action="back"]');
  await page.waitForURL(/state=litter/); await ready(page);
  assert.match(await text(page, '.lt-summary'), /Alive now 12/);
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
  await page.click('[data-action="wrong-crate"]');
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
  assert.match(held, /\+1 crushed held for review · maybe the same body as 09:50 · L\. Madsen/);
  assert.match(held, /Count 13 1 missing · explained explained by a death · \+1 crushed · 09:50 · L\. Madsen See the death/);
  await page.click('[data-action="goto-entry"]');
  console.log('ok 7 R1-14 held body and explained count on the record page');

  // 8. End with a review open (round 4), N5, N6, R1-21, R1-12: room (17 Oct) → overview → End → the review lists the
  //    possible double, the day's records by hand and the doses ending drops → hold → the receipt freezes the double as
  //    unresolved at End; Back returns to the room (R1-30).
  await page.goto(base + 'room.html?state=room&data=late&fresh=1'); await ready(page);
  await page.click('.tk-header-back');                                           // the room's Back opens the task overview
  await page.waitForURL(/end\.html/); await ready(page);
  const ov = await text(page, '[data-ds="TaskPage"]');
  assert.match(ov, /Piglet deaths .*4/);
  await page.click('[data-action="day"]');                                   // a door on the overview (parity 15)
  assert.match(await text(page, '[data-ds="TaskPage"]'), /Today's records, by hand .*L\.M 4 records B03 · Castrate · 1 15:40/);
  await page.click('[data-action="close-sheet"]');
  await page.click('[data-action="review"]');
  const rv = await text(page, '[data-ds="TaskPage"]');
  assert.match(rv, /Ending now drops 28 scheduled piglet-doses/);
  assert.match(rv, /Open for review .*A05 Possible double · Iron · day 3 08:40 · L\.M, 08:52 · G\.H/);
  await hold(page, '[data-action="hold"]', 300);                             // released early: not ended
  assert.match(await live(page, '#pp-hold-status', /KEEP|RELEASED/), /KEEP HOLDING TO END|RELEASED · NOT ENDED/);
  await hold(page, '[data-action="hold"]');
  await page.waitForFunction(() => /state=receipt/.test(location.search), null, { timeout: 4000 });
  const receipt = await text(page, '[data-ds="TaskPage"]');
  assert.match(receipt, /Unresolved at end .*A05 Possible double · Iron · day 3/);
  assert.match(receipt, /Since end Kept and stamped; the figures above stay as at end/);
  await page.click('[data-action="close-sheet"]');
  assert.match(await text(page, '#screen'), /No new treatments\. Piglets moved in after end keep their doses as not done\./);
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
  assert.match(await text(page, '[data-ds="TaskPage"]'), /Unresolved at end/);
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
  assert.match(face, /A05 · Iron · day 3 · possible double answered: given twice/);
  assert.doesNotMatch(face, /Unresolved at end \d+ items? A05/);              // the frozen list no longer holds it
  console.log('ok 10 an unresolved-at-End double answered after End → Since End');

  // 11. R1-30: End blocked by farrowing says where to end it and opens the litter still farrowing (never the concept board).
  await page.goto(base + 'room.html?state=room&fresh=1'); await ready(page);
  await page.click('.tk-header-back');                                           // the room's Back opens the task overview
  await page.waitForURL(/end\.html/); await ready(page);
  await page.click('[data-action="review"]');
  const bl = await text(page, '[data-ds="TaskPage"]');
  assert.match(bl, /End it in the Farrowing task on the Tasks list/);
  assert.match(bl, /litters with work left .* not yet due/);
  // R2-10: the farrowing door is a host door in the prototype: it says where it would go, visibly, and stays on the page
  await page.click('[data-action="open-farrowing"][data-value="D01"]');
  assert.equal(await page.locator('#pp-stub').isVisible(), true);
  assert.match(await text(page, '#pp-stub'), /Opens Farrowing · D01/);
  assert.match(page.url(), /end\.html/);
  console.log('ok 11 R1-30 / R2-10 End blocked → the farrowing door says "Opens Farrowing · D01"');

  // 12. The handoff: rows open their litter; weights say their day; not-reached doses are "not done at end", one phrase.
  await page.goto(base + 'end.html?state=weaning-handoff'); await ready(page);
  const ho = await text(page, '[data-ds="TaskPage"]');
  assert.match(ho, /day-21 weight 66\.0 kg/);
  assert.match(ho, /Health shot · \d+ not done at end/);   // the figure follows End's unfinished rule (R2-26: not-yet-due-only litters apart)
  assert.match(ho, /Castrate · 4 not done at end/);
  await page.click('[data-ds="TaskPage"] [data-action="open-litter"][data-value="A02"]');
  await page.waitForURL(/state=litter.*crate=A02/); await ready(page);
  console.log('ok 12 handoff wording, weights by day, rows open their litter');

  // 13. R2-10: the drafts blocker reads the drafts on this phone and clears when one is saved or cleared. A fresh tab: a Set
  //     count draft left with Back gates End; End shows it; the design state's two drafts clear one by one.
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p2 = await ctx2.newPage();
  await p2.goto(base + 'end.html?state=end-review&data=late'); await ready(p2);
  assert.equal(await p2.locator('[data-action="hold"]').count(), 1);               // nothing on this phone: End is open
  await openLitter(p2, 'A02', 'late', false);
  await p2.click('[data-action="open-count"]'); await p2.waitForURL(/count\.html/); await ready(p2);
  await p2.click('[data-ds="Stepper"] [data-step="-1"]');
  await p2.click('[data-action="back"]'); await p2.waitForURL(/room\.html/); await ready(p2);
  await p2.goto(base + 'end.html?state=end-review&data=late'); await ready(p2);
  assert.equal(await p2.locator('[data-action="hold"]').count(), 0);
  assert.match(await text(p2, '[data-ds="TaskPage"]'), /1 unsaved draft on this phone .*A02 Count draft · unsaved/);
  await p2.goto(base + 'end.html?state=end-blocked-draft'); await ready(p2);
  assert.match(await text(p2, '[data-ds="TaskPage"]'), /3 unsaved drafts on this phone/);
  await p2.click('[data-action="open-draft"][data-value="dead:D03"]');
  await p2.waitForURL(/dead\.html/); await ready(p2);
  await p2.click('[data-action="save"]');
  await p2.waitForURL(/end\.html/); await ready(p2);                                 // Save returns to End
  const left = await text(p2, '[data-ds="TaskPage"]');
  assert.match(left, /2 unsaved drafts on this phone/);
  assert.doesNotMatch(left, /D03 Death draft/);
  console.log('ok 13 R2-10 End reads the drafts on this phone; saving one returns to End with it cleared');

  // 14. R2-25: a Save that waits says why where the worker looks; a duplicate tag warns above the pad and the receipt keeps
  //     the before value; Back to the litter shows the correction receipt.
  await page.goto(base + 'edit.html?state=edit-gated&fresh=1'); await ready(page);
  assert.equal(await page.locator('#ed-why').isVisible(), true);
  await page.goto(base + 'edit.html?state=edit-row-dup&fresh=1'); await ready(page);
  const padTop = (await page.locator('.ed-pad').boundingBox()).y;
  const warn = await page.locator('.ed-pad .st-status-line').boundingBox();
  assert.ok(warn && warn.y >= padTop && warn.y + warn.height <= 844, 'the duplicate-tag warning is on screen, in the pad');
  assert.match(await text(page, '.ed-pad'), /Tag 004305 is already on this litter/);
  await page.click('[data-action="save"]');
  assert.match(await live(page, '#ed-saved', /Correction saved/), /tag 004304 → 004305/);
  await page.click('[data-action="back"]');
  await page.waitForURL(/state=litter/); await ready(page);
  assert.match(await text(page, 'body'), /Saved · correction/);
  console.log('ok 14 R2-25 Save-waits reason visible · duplicate-tag warning above the pad · receipt "tag 004304 → 004305" · litter shows the correction receipt');

  // 15. R2-26: today's records list a correction; a treatment not done on several crates opens the list of them.
  await page.goto(base + 'end.html?state=end-day&data=ended-correct'); await ready(page);
  assert.match(await text(page, '[data-ds="TaskPage"]'), /B03 · Correction .*corrected|A05 · Correction/);
  await page.goto(base + 'end.html?state=weaning-handoff'); await ready(page);
  await page.click('[data-action="open-dose"]');
  assert.match(await text(page, '[data-ds="TaskPage"]'), /Castrate · not done .*4 piglets on 2 crates .*B01 .*C04/);
  await page.click('[data-action="open-litter"][data-value="C04"]');
  await page.waitForURL(/state=litter.*crate=C04/); await ready(page);
  console.log('ok 15 R2-26 today’s records show the correction · the handoff dose opens its crates');

  // 16. Round 6: the third answer to a possible double, "Different piglets", is an option of the sheet (both stand).
  await page.goto(base + 'edit.html?state=double&data=double-halves&crate=A02'); await ready(page);
  await page.click('[data-action="dbl-answer"][data-value="different"]');
  await page.click('[data-action="save"]');
  assert.match(await live(page, '#ed-saved', /Answer saved/), /Different piglets · both stand, each counted in full/);
  console.log('ok 16 round 6 Different piglets · both stand');

  // 17. R2-25: a death of several bodies withdraws one body: tick it, the receipt says what changed, the other stays.
  await openLitter(page, 'A02');
  await page.click('[data-action="open-dead"]');
  await page.waitForURL(/dead\.html/); await ready(page);
  await page.click('[data-ds="Stepper"][data-field="crushed"] [data-step="1"]');
  await page.click('[data-ds="Stepper"][data-field="crushed"] [data-step="1"]');
  await page.click('[data-action="save"]');
  await page.waitForURL(/state=litter/); await ready(page);
  assert.match(await text(page, '.lt-summary'), /Alive now 10/);
  await openEdit(page);
  assert.equal(await page.locator('[data-action="death-piece"]').count(), 2);
  await page.locator('[data-action="death-piece"]').last().click();
  assert.match(await live(page, '#ed-banner-summary', /withdrawn/), /Death \+2 crushed 1 withdrawn · 1 stays · recorded by mistake · A02 alive 10 → 11/);
  await page.click('[data-action="save"]');
  rc = await live(page, '#ed-saved', /Correction saved/);
  assert.match(rc, /A02 · alive 10 → 11 · dead 3 → 2/);
  await page.waitForTimeout(400);
  await page.click('[data-action="back"]');
  await page.waitForURL(/state=litter/); await ready(page);
  assert.match(await text(page, '.lt-summary'), /Alive now 11/);
  await page.click('[data-action="open-record"]');
  await page.waitForURL(/state=record-page/); await ready(page);
  assert.match(await text(page, '[data-ds="Log"]'), /Death \+2 crushed 1 withdrawn · 1 stays/);
  console.log('ok 17 R2-25 two bodies recorded → withdraw one → Save → alive 10 → 11:', rc);

  // 18. R2-20: a Sow died mark recorded by mistake is withdrawn from Edit (own row); the litter's sow farrows on.
  await openLitter(page, 'B01');
  await openEdit(page);
  assert.match(await text(page, '[data-sow]'), /Sow died .*prolapse|Sow died .*Sep 28/);
  await page.click('[data-action="sow-void"]');
  assert.match(await live(page, '#ed-banner-summary', /Sow died withdrawn/), /Sow died withdrawn · recorded by mistake/);
  await page.click('[data-action="save"]');
  rc = await live(page, '#ed-saved', /Correction saved/);
  assert.equal(await page.locator('[data-sow]').count(), 0);
  console.log('ok 18 R2-20 Sow died → Recorded by mistake → Save:', rc);

  // 19. R2-20: a Sow died mark on the wrong crate moves through the crate picker; Save waits for the crate.
  await openLitter(page, 'B01');
  await openEdit(page);
  await page.click('[data-action="sow-to"]');
  await page.locator('[data-view="picker"] [data-action="picker-back"]').last().click();
  await page.waitForTimeout(400);
  await page.click('[data-action="sow-to"]');
  assert.equal(await page.locator('[data-view="picker"] [data-action="pick"][data-value="B01"]').count(), 0);
  await page.click('[data-view="picker"] [data-action="pick"][data-value="B02"]');
  assert.match(await live(page, '#ed-banner-summary', /Sow died moved to B02/), /Sow died moved to B02/);
  await page.waitForTimeout(450);                                            // a tap right after a drawer closes is a ghost tap
  await page.click('[data-action="save"]');
  rc = await live(page, '#ed-saved', /Correction saved/);
  assert.equal(await page.locator('[data-sow]').count(), 0);                // the mark left this litter
  await page.waitForTimeout(400);
  await page.click('[data-action="back"]');
  await page.waitForURL(/state=litter/); await ready(page);
  await page.click('[data-action="open-record"]');
  await page.waitForURL(/state=record-page/); await ready(page);
  assert.match(await text(page, '[data-ds="Log"]'), /Sow died moved to B02/);
  console.log('ok 19 R2-20 Sow died → On another litter → B02 → Save');

  // 20. R3-7 (blocker): a real draft left from a page, read at End, then Saved or Cleared, brings the worker back to End —
  //     and End never lists the design state's two drafts (D03 death, A05 count) in a real flow.
  const ctx3 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p3 = await ctx3.newPage();
  const draftDoors = (p) => p.locator('[data-action="open-draft"]').evaluateAll((els) => els.map((e) => e.dataset.value));
  await p3.goto(base + 'dead.html?state=dead&crate=D03&data=late'); await ready(p3);
  await p3.click('[data-ds="Stepper"][data-field="crushed"] [data-step="1"]');
  await p3.click('[data-action="back"]'); await p3.waitForURL(/room\.html/); await ready(p3);
  await p3.goto(base + 'end.html?state=overview&data=late'); await ready(p3);
  await p3.click('[data-action="review"]');
  await p3.waitForURL(/state=end-blocked(&|$)/);                              // a real draft never names the design state
  assert.deepEqual(await draftDoors(p3), ['dead:D03']);
  await p3.click('[data-action="open-draft"]'); await p3.waitForURL(/dead\.html/); await ready(p3);
  await p3.click('[data-action="save"]'); await p3.waitForURL(/end\.html/); await ready(p3);
  assert.deepEqual(await draftDoors(p3), []);                                   // saved: nothing left, no phantom A05/D03
  assert.equal(await p3.locator('[data-action="hold"]').count(), 1);
  // Clear on the dead page returns to End
  await p3.goto(base + 'dead.html?state=dead&crate=D03&data=late'); await ready(p3);
  await p3.click('[data-ds="Stepper"][data-field="crushed"] [data-step="1"]');
  await p3.click('[data-action="back"]'); await p3.waitForURL(/room\.html/); await ready(p3);
  await p3.goto(base + 'end.html?state=overview&data=late'); await ready(p3);
  await p3.click('[data-action="review"]');
  await p3.click('[data-action="open-draft"]'); await p3.waitForURL(/dead\.html/); await ready(p3);
  await p3.click('[data-action="clear"]'); await p3.waitForURL(/end\.html/); await ready(p3);
  assert.deepEqual(await draftDoors(p3), []);
  // a count draft: End → the draft opens Set count → Clear (and Save) return to End
  await p3.goto(base + 'count.html?state=count&crate=A02&data=late'); await ready(p3);
  await p3.click('[data-ds="Stepper"] [data-step="-1"]');
  await p3.click('[data-action="back"]'); await p3.waitForURL(/room\.html/); await ready(p3);
  await p3.goto(base + 'end.html?state=overview&data=late'); await ready(p3);
  await p3.click('[data-action="review"]');
  assert.deepEqual(await draftDoors(p3), ['count:A02']);
  await p3.click('[data-action="open-draft"]'); await p3.waitForURL(/count\.html/); await ready(p3);
  await p3.click('[data-action="clear"]'); await p3.waitForURL(/end\.html/); await ready(p3);
  assert.deepEqual(await draftDoors(p3), []);
  // an Edit draft: End → Edit (from=end) → Clear → after the Undo window, End
  await p3.goto(base + 'edit.html?state=edit&crate=A02&data=late&from=litter'); await ready(p3);
  await p3.click('[data-action="mark-step"][data-step="-1"]');
  await p3.click('[data-action="back"]'); await p3.waitForURL(/room\.html/); await ready(p3);
  await p3.goto(base + 'end.html?state=overview&data=late'); await ready(p3);
  await p3.click('[data-action="review"]');
  assert.deepEqual(await draftDoors(p3), ['edit:A02']);
  await p3.click('[data-action="open-draft"]'); await p3.waitForURL(/edit\.html/); await ready(p3);
  await p3.click('[data-action="clear"]');
  await p3.waitForURL(/end\.html/, { timeout: 8000 }); await ready(p3);
  assert.deepEqual(await draftDoors(p3), []);
  await ctx3.close();
  console.log('ok 20 R3-7 a real draft read at End: saved or cleared, back at End with none left (no design drafts planted)');

  // 21. R3-15: a death of several bodies. The reasons are a radio (the chosen one shows); one pick is the one-body route and
  //     tapping "Recorded by mistake" does not wipe it; a withdrawn body is no longer offered, and a second withdrawal
  //     does not bring the first back.
  await openLitter(page, 'A02');
  await page.click('[data-action="open-dead"]');
  await page.waitForURL(/dead\.html/); await ready(page);
  for (let i = 0; i < 3; i++) await page.click('[data-ds="Stepper"][data-field="crushed"] [data-step="1"]');
  await page.click('[data-action="save"]');
  await page.waitForURL(/state=litter/); await ready(page);
  await openEdit(page);
  const dth = '[data-death]', dvoid = `${dth} [data-action="death-void"]`;
  assert.equal(await page.locator(`${dth} [data-mode="radio"]`).count(), 2);
  assert.equal(await page.locator(dvoid).getAttribute('aria-checked'), 'false');
  assert.equal(await page.locator(`${dth} [data-action="death-piece"]`).count(), 3);
  await page.locator(`${dth} [data-action="death-piece"]`).first().click();
  assert.equal(await page.locator(dvoid).getAttribute('aria-checked'), 'true');          // one picked: "Recorded by mistake" shows chosen
  await page.click(dvoid);
  assert.equal(await page.locator(dvoid).getAttribute('aria-checked'), 'true');          // tapping it keeps the one-body pick
  assert.equal(await page.locator(`${dth} [data-action="death-piece"]:checked`).count(), 1);
  assert.match(await live(page, '#ed-banner-summary', /withdrawn/), /Death \+3 crushed 1 withdrawn · 2 stay/);
  await page.click('[data-action="save"]');
  rc = await live(page, '#ed-saved', /Correction saved/);
  assert.match(rc, /dead 4 → 3/);
  assert.equal(await page.locator(`${dth} [data-action="death-piece"]`).count(), 2);  // the withdrawn body is not offered again
  await page.click(dvoid);                                                               // nothing picked → the whole death: both bodies
  assert.equal(await page.locator(`${dth} [data-action="death-piece"]:checked`).count(), 2);
  assert.match(await text(page, dth), /all 2/);
  await page.locator(`${dth} [data-action="death-piece"]`).first().click();           // narrow to one
  await page.waitForTimeout(650);                                                      // (a Save right after a Save is a double tap)
  await page.click('[data-action="save"]');
  rc = await live(page, '#ed-saved', /Correction saved/);
  assert.match(rc, /dead 3 → 2/);                                                     // the first body stayed withdrawn
  console.log('ok 21 R3-15 radio reasons · one-body pick kept · a withdrawn body is not offered again:', rc);

  // 22. R3-15: Sow died shows her cause; the move picker leaves out litters whose sow is already dead.
  await openLitter(page, 'B01');
  await openEdit(page);
  assert.match(await text(page, '[data-sow]'), /Sow died · Prolapse/);
  assert.equal(await page.locator('[data-sow] [data-mode="radio"]').count(), 2);
  await page.click('[data-action="sow-to"]');
  assert.equal(await page.locator('[data-view="picker"] [data-action="pick"][data-value="D06"]').count(), 0);   // her sow died too
  assert.equal(await page.locator('[data-view="picker"] [data-action="pick"][data-value="B02"]').count(), 1);
  console.log('ok 22 R3-15 Sow died · cause on the row · the picker leaves out dead sows');

  // 23. R3-15: the amber correction card stays under the sheet header while the list scrolls; "Done on another crate" leads
  //     the treatments, in view on a long list.
  await page.goto(base + 'room.html?state=litter&crate=B03&data=late&fresh=1'); await ready(page);
  await openEdit(page);
  const bodyBox = await page.locator('[data-view="edit"] .tk-sheet-body').boundingBox();
  const doorBox = await page.locator('[data-action="wrong-crate"]').boundingBox();
  assert.ok(doorBox.y - bodyBox.y < 160, 'the wrong-crate door is at the top of the treatments, not below the fold');
  await page.locator('[data-action="mark-step"][data-step="-1"]').first().click();
  await page.evaluate(() => { document.querySelector('[data-view="edit"] .tk-sheet-body').scrollTop = 500; });
  const cardBox = await page.locator('#ed-banner').boundingBox();
  assert.ok(Math.abs(cardBox.y - bodyBox.y) < 24, 'the card is pinned under the header');
  console.log('ok 23 R3-15 correction card pinned under the header · wrong-crate door leads');

  // 24. R3-18 (page part): the weigh-day litter weight is in the litter log, on its day.
  await page.goto(base + 'edit.html?state=record-page&crate=B04&data=base'); await ready(page);
  assert.match(await text(page, '[data-ds="Log"]'), /Litter weight · day 3 15\.9 kg 08:40 · L\. Madsen/);
  console.log('ok 24 R3-18 the weigh-day litter weight is in the log');

  // 25. Owner round 7: a correction lists every litter whose owed moved (the ledger's `owedMoved`; the page renders it —
  //     here a stand-in for the ledger worker's field).
  const ctx4 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx4.route('**/piglet-processing/ledger.js', async (route) => {
    const res = await route.fetch(); const body = await res.text();
    await route.fulfill({ response: res, body: body + `\nselect.edit = ((o) => (d, id, dr, st) => { const r = o(d, id, dr, st); if (r && r.changes.length) r.owedMoved = [{ litter: 'C04', dose: 'castrate', from: 3, to: 0 }, { litter: 'B03', dose: 'castrate', from: 2, to: 1 }]; return r; })(select.edit);\n` });
  });
  const p4 = await ctx4.newPage();
  await p4.goto(base + 'edit.html?state=edit-changed'); await ready(p4);
  const cas = await text(p4, '.ed-later');
  assert.match(cas, /Owed moves on 2 litters C04 · Castrate owed 3 → 0 B03 · Castrate owed 2 → 1/);
  await ctx4.close();
  console.log('ok 25 round 7 the correction lists every litter whose owed moved:', cas);

  await browser.close();
} finally {
  server.kill();
}
