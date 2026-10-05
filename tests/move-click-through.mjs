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
// the surface on top: the Move sheet (R2-22: a sheet like Record death; Save and Back return to the litter drawer)
const drawer = (p) => text(p, '.tk-sheet');
const back = async (p) => { await p.waitForURL(/room\.html\?.*state=litter/); await ready(p); };

// room → the litter (its drawer over the room, or its own page) → its Move door
async function openMove(page, crate, fresh) {
  await page.goto(base + 'room.html?state=room' + (fresh ? '&fresh=1' : '')); await ready(page);
  const row = page.locator(`[data-action="open-litter"][data-value="${crate}"]`);
  if (!(await row.count())) await page.click('[data-action="lens"][data-value="all"]');
  await page.click(`[data-action="open-litter"][data-value="${crate}"]`);
  await page.waitForURL(/state=litter/); await ready(page);
  await page.click(`[data-action="open-move"]`);
  await page.waitForURL(/move\.html/); await ready(page);
  await page.waitForSelector('.tk-sheet[data-view="move"]');
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
  await back(page);                                   // one Back: Save lands in the litter drawer, with the receipt
  d = await drawer(page);
  assert.match(d, /Saved · 1 piglet moved to A03 · Unit 8/);
  console.log('ok 1 search across units → A03 · Unit 8:', d.slice(0, 80));

  // 2. R1-31: typing this crate's own code says why; R1-5: scan fills the search with the crate card read.
  await page.click('[data-action="open-move"]');
  await page.waitForURL(/move\.html/); await ready(page);
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
  assert.equal(await page.locator('#mv-reason.st-visually-hidden').count(), 1);               // read by the primary, not drawn, until it is tapped
  await page.locator('[data-action="save-move"]').dispatchEvent('click');
  await page.waitForFunction(() => { const r = document.getElementById('mv-reason'); return r && !r.classList.contains('st-visually-hidden') && r.textContent.trim().length > 0; });   // announced: cleared, then set
  assert.match(await drawer(page), /Answer Iron first/);
  await page.click('[data-action="answer"][data-value="iron3:unknown"]');
  assert.match(await text(page, '[data-action="save-move"]'), /Move 2 to B02 · Iron unknown/);
  await page.click('[data-action="save-move"]');
  await back(page);
  assert.match(await drawer(page), /Saved · 2 piglets moved to B02/);
  const face = await text(page, '.tk-sheet');
  assert.match(face, /Iron 0–2 of 8 owed · check/);
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
  await back(page);
  d = await drawer(page);
  assert.match(d, /Saved · 13 piglets moved to D02/); assert.match(d, /D02 joins this task/);
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

  // 6. Back from the Move sheet lands on the litter's drawer over the room, its Move door there again.
  await page.click('.tk-sheet[data-view="move"] .tk-footer [data-action="back"]');
  await page.waitForURL(/room\.html\?.*state=litter.*crate=C05/); await ready(page);
  await page.locator('[data-action="open-move"]').first().waitFor();
  console.log('ok 6 Back → the litter drawer');

  // 7. R2-22: the Move is a sheet (title, subtitle, Clear, Back, pinned footer); the likely crates lead, the lookup forgives.
  await openMove(page, 'A02', true);
  assert.equal(await page.locator('.tk-sheet[data-view="move"] .tk-sheet-title').innerText(), 'Move piglets');
  assert.equal(await page.locator('.tk-sheet[data-view="move"] .tk-footer [data-action="back"]').count(), 1);
  const likely = await page.locator('#mv-results [data-action="pick-crate"]').evaluateAll((els) => els.map((e) => e.dataset.value));
  assert.match(await text(page, '#mv-results'), /^Likely · same age, smaller litters/);
  assert.deepEqual(likely.slice(0, 4), ['E01', 'B02', 'C05', 'C04']);           // same age band, smallest first, any row
  for (const [q, want] of [['a4', 'A04'], ['A 04', 'A04'], ['A-04', 'A04']]) {
    await find(page, q);
    assert.deepEqual(await page.locator('#mv-results [data-action="pick-crate"]').evaluateAll((els) => els.map((e) => e.dataset.value)), [want]);
  }
  await find(page, '04');
  assert.deepEqual(await page.locator('#mv-results [data-action="pick-crate"]').evaluateAll((els) => els.map((e) => e.dataset.value)), ['A04', 'B04', 'C04']);
  await find(page, 'b2');
  await page.locator('[data-role="crate-q"]').press('Enter');                  // the one match is picked
  assert.match(await drawer(page), /To crate B02/);
  console.log('ok 7 sheet anatomy · likely crates first · a4 / A 04 / A-04 / 04 find the crate');

  // 8. The max reached is a fact; round 6: the receiver's own piglets join too, said before Save.
  await page.click('[data-action="all"]').catch(() => {});
  d = await drawer(page);
  assert.doesNotMatch(d, /has only/);
  await page.click('[data-action="change-crate"]');
  await find(page, 'E01');
  await page.click('[data-action="pick-crate"][data-value="E01"]');
  d = await drawer(page);
  assert.match(d, /E01's own 7 piglets join too.*owe Cut cord, Nasal drops \(2 days late\)/);
  await page.click('[data-action="save-move"]');
  await back(page);
  assert.match(await drawer(page), /Saved · 1 piglet moved to E01/);
  console.log('ok 8 own piglets join too: preview before Save, receipt in the drawer');
  // 9. R2-3: a source with an open loss offers "this is the missing piglet": the line closes, the source keeps its alive.
  await openMove(page, 'D03', true);
  await find(page, 'A02');
  await page.click('[data-action="pick-crate"][data-value="A02"]');
  await page.click('[data-action="step"][data-value="untagged"][data-step="1"]');
  assert.match(await drawer(page), /From D03\s*11 → 10/);
  await page.click('[data-action="closes-loss"]');
  assert.match(await drawer(page), /From D03\s*11 → 11/);
  console.log('ok 9 missing piglet moved: the source keeps its alive');

  // 10. R3-3: opened from a loss line (closesLoss=1), "This is the missing piglet" is ticked once the crate is picked and the
  //     preview reads 11 → 11; saving writes one Move that closes the loss (the button never contradicts the preview).
  await page.goto(base + 'move.html?state=move&crate=D03&closesLoss=1&n=1&fresh=1'); await ready(page);
  await find(page, 'A02');
  await page.click('[data-action="pick-crate"][data-value="A02"]');
  assert.equal(await page.locator('[data-action="closes-loss"]').isChecked(), true);
  assert.match(await drawer(page), /From D03\s*11 → 11/);
  assert.match(await text(page, '[data-action="save-move"]'), /Move 1/);
  await page.click('[data-action="save-move"]');
  await back(page);
  console.log('ok 10 loss line → Move: the missing-piglet box starts ticked, 11 → 11');

  // 11. R3-2: a double tap on Move writes one move (the button is spent on the first tap).
  await page.evaluate(() => sessionStorage.clear());      // drafts of earlier flows are kept per crate (R3-17)
  await openMove(page, 'B06', true);
  await find(page, 'A03');
  await page.click('[data-action="pick-crate"][data-value="A03"]');
  await page.click('[data-action="step"][data-value="untagged"][data-step="1"]');
  await page.evaluate(() => { for (let i = 0; i < 3; i++) { const b = document.querySelector('[data-action="save-move"]'); if (b) b.click(); } });   // taps in the same breath
  await back(page);
  assert.match(await drawer(page), /Saved · 1 piglet moved to A03/);
  const moves = await page.evaluate(() => Object.keys(sessionStorage).filter((k) => k.startsWith('pp-log:')).reduce((n, k) => n + JSON.parse(sessionStorage.getItem(k)).filter((e) => e.type === 'move' && e.from === 'B06').length, 0));
  assert.equal(moves, 1, 'one move written');
  console.log('ok 11 double tap on Move writes one move');

  // 12. R3-17: the draft survives phone Back; piglet chips carry names; the own-piglets warning sits above the counts.
  await page.evaluate(() => sessionStorage.clear());
  await openMove(page, 'A02', true);
  await find(page, 'E01');
  await page.click('[data-action="pick-crate"][data-value="E01"]');
  d = await drawer(page);
  assert.ok(d.indexOf("E01's own 7 piglets join too") >= 0 && d.indexOf("E01's own 7 piglets join too") < d.indexOf('Piglets'), 'warning above the count');
  await page.goBack(); await ready(page);
  await page.goForward(); await ready(page);
  await page.waitForSelector('.tk-sheet[data-view="move"]');
  assert.match(await drawer(page), /To crate\s*E01/);
  await page.goto(base + 'move.html?state=move-tagged'); await ready(page);
  assert.ok(await page.getByRole('checkbox', { name: '000301' }).count() >= 1, 'chip has its name');
  console.log('ok 12 draft kept over Back, warning above the count, chips named');

  await browser.close();
} finally {
  server.kill();
}
