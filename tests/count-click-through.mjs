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
const log = (p, v) => p.evaluate((k) => JSON.parse(sessionStorage.getItem('pp-log:' + k) || '[]'), v);
const text = async (p, sel) => (await p.locator(sel).first().innerText()).replace(/\s+/g, ' ');
// round 5: the room's review and drift doors are one row (`reviews`); its sheet holds the drift door (`explain`)
async function drift(p) { await p.click('[data-action="reviews"]'); const t = await text(p, '[data-action="explain"]'); await p.click('.sheet [data-action="close-sheet"]'); await p.waitForSelector('.sheet', { state: 'detached' }); return t; }
async function explain(p) { await p.click('[data-action="reviews"]'); await p.click('[data-action="explain"]'); }
const rowText = async (p, code) => (await p.locator(`[data-action="open-litter"][data-value="${code}"]`).first().innerText()).replace(/\s+/g, ' ');

try {
  await new Promise((r) => setTimeout(r, 400));
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();

  // 1. The room before: D03's loss 2 (base) and B08's gain 1; nothing open on B06.
  await page.goto(base + 'room.html?state=room&lens=all&data=gain-b08&fresh=1'); await ready(page);
  const strip0 = await drift(page);
  assert.match(strip0, /Unexplained loss 2 D03/); assert.match(strip0, /Unexplained gain 1 B08/);
  assert.doesNotMatch(await rowText(page, 'B06'), /loss/);
  console.log('ok 1 room before:', strip0);

  // 2. room → B06 → Set count → − once (11 seen, 12 by the record) → Save: an unexplained loss of 1, stamped; no reason asked.
  await page.click('[data-action="open-litter"][data-value="B06"]');
  await page.waitForURL(/state=litter/); await ready(page);
  await page.click('[data-action="open-count"]');
  await page.waitForURL(/count\.html/); await ready(page);
  assert.equal(await page.locator('[role="spinbutton"]').first().innerText(), '12');
  await page.click('[data-action="step"][data-step="-1"]');
  assert.match(await text(page, '[data-ds="Stepper"]'), /1 fewer · Save writes unexplained loss 1 piglet/);
  await page.click('[data-action="save"]');
  // Save returns straight to the litter drawer with the count's receipt
  await page.waitForURL(/room\.html\?.*state=litter.*crate=B06.*saved=count/); await ready(page);
  await page.waitForSelector('#lt-receipt span');
  assert.match(await text(page, '#lt-receipt'), /Saved\s*·\s*unexplained loss 1 piglet/);
  // Save writes one count (a double tap never writes a second)
  assert.equal((await log(page, 'gain-b08')).filter((e) => e.type === 'count' && e.litter === 'B06').length, 1);
  // the open line is on the litter, with the Move the app ranks first; its doors are one level down, on Explain
  assert.match(await text(page, '[data-action="open-explain"]'), /Unexplained loss 1 piglet B08 gained 1 piglet/);
  const rcpt2 = await text(page, '#lt-receipt');
  await page.waitForTimeout(450);
  await page.click('[data-action="open-explain"]');
  await page.waitForURL(/count\.html\?.*state=explain/); await ready(page);
  assert.match((await page.locator('[data-action="suggest"]').first().innerText()).replace(/\s+/g, ' '), /B08 gained 1 piglet/);
  console.log('ok 2 litter Set count 11:', rcpt2);

  // 3. Back to the room: the strip and B06's row show the open loss, beside B08's gain (never netted).
  await page.waitForTimeout(450);
  await page.click('[data-action="back"]');
  await page.waitForURL(/state=litter/); await ready(page);
  await page.click('[data-action="close"]');
  await page.waitForURL(/room\.html/); await ready(page);
  const strip1 = await drift(page);
  assert.match(strip1, /Unexplained loss 3 B06 D03/); assert.match(strip1, /Unexplained gain 1 B08/); assert.match(strip1, /Net drift −2 piglets/);
  console.log('ok 3 room shows the open loss:', strip1);

  // 4. The drift strip → the room's open lines → B06's suggestion `B08 gained 1 piglet · both lines close` → the Move sheet, pre-filled.
  await explain(page);
  await page.waitForURL(/count\.html\?state=explain/); await ready(page);
  const sug = page.locator('[data-action="suggest"][data-value$="|C-B08-gain"]').first();
  assert.match((await sug.innerText()).replace(/\s+/g, ' '), /B08 gained 1 piglet both lines close\s*·\s*counted \d+ min apart/);
  await sug.click();
  assert.match(await text(page, '[role="dialog"]'), /Alive stays 11 piglets in B06 and 10 piglets in B08/);
  assert.match(await text(page, '[data-action="open-move"]'), /^Review move$/);                     // R3-20: only the Move sheet saves
  await page.click('[data-action="open-move"]');
  await page.waitForURL(/move\.html\?.*state=move-explain/); await ready(page);
  assert.match(await text(page, '.sheet[data-view="move"]'), /Closes 1 unexplained loss and 1 gain/);
  await page.click('[data-action="save-move"]');
  await page.waitForURL(/room\.html\?.*state=litter/); await ready(page);                         // R2-22: Save returns to the litter drawer
  console.log('ok 4 explain via the move suggestion: saved', await text(page, '.sheet .sheet-title'));

  // 5. The room after: both lines closed; D03's loss (nothing to pair) stays open.
  await page.goto(base + 'room.html?state=room&lens=all&data=gain-b08'); await ready(page);
  const strip2 = await drift(page);
  assert.match(strip2, /Unexplained loss 2 D03/); assert.doesNotMatch(strip2, /gain/); assert.doesNotMatch(strip2, /B06/);
  assert.doesNotMatch(await rowText(page, 'B06'), /loss/); assert.doesNotMatch(await rowText(page, 'B08'), /gain/);
  console.log('ok 5 both lines closed:', strip2);

  // 6. A gain line's `Move from another crate`: the source with an open loss is flagged; the worker pairs it; both close.
  await page.goto(base + 'count.html?state=explain&crate=B08&data=explain&fresh=1'); await ready(page);
  await page.click('[data-action="move-in"]');
  await page.waitForURL(/move\.html/); await ready(page);
  const b06 = page.locator('[data-action="pick-crate"][data-value="B06"]').first();
  assert.match((await b06.innerText()).replace(/\s+/g, ' '), /loss 1 open/);
  await b06.click();
  await page.click('[data-action="pair-loss"]');
  assert.match(await text(page, '.sheet[data-view="move"]'), /Closes 1 unexplained loss and 1 gain/);
  await page.click('[data-action="save-move"]');
  await page.waitForURL(/room\.html\?.*state=litter/); await ready(page);
  await page.goto(base + 'room.html?state=room&lens=all&data=explain'); await ready(page);
  const strip3 = await drift(page);
  assert.doesNotMatch(strip3, /B06|B08/);
  console.log('ok 6 gain line → Move from another crate, paired with B06\'s loss:', strip3);

  // 7. Two offline counts that never saw each other: neither stands; the litter asks for a new count, which settles it.
  await page.goto(base + 'count.html?state=count-conflict&fresh=1'); await ready(page);
  assert.match(await text(page, '#screen'), /Two counts disagree/);
  // s8 #4: the stepper starts blank and Save waits (nobody has the number yet); the worker counts, then saves
  assert.equal(await page.locator('[role="spinbutton"]').first().innerText(), '–');
  assert.equal(await page.locator('[data-action="save"]').getAttribute('aria-disabled'), 'true');
  await page.click('[data-action="step"][data-step="-1"]'); await page.click('[data-action="step"][data-step="1"]');
  await page.click('[data-action="save"]');
  await page.waitForURL(/state=litter.*saved=count/); await ready(page);
  assert.doesNotMatch(await text(page, '.sheet'), /Two counts disagree|Counts disagree/);
  await page.waitForSelector('#lt-receipt span');
  console.log('ok 7 two counts disagree → count again settles it:', await text(page, '#lt-receipt'));

  const toCount = async (code, data) => {
    await page.goto(base + `room.html?state=room&lens=all&fresh=1${data ? '&data=' + data : ''}`); await ready(page);
    await page.click(`[data-action="open-litter"][data-value="${code}"]`);
    await page.waitForURL(/state=litter/); await ready(page);
    await page.click('[data-action="open-count"]');
    await page.waitForURL(/count\.html/); await ready(page);
  };
  const step = async (d, n) => { for (let i = 0; i < n; i++) await page.click(`[data-action="step"][data-step="${d}"]`); };

  // 8. R1-27: a count far above Alive asks before it saves; a waiting Save answers the tap and saves nothing; `17 is right` lets
  // it save. R1-11: the gain says "check on the pig" (it owes nothing new).
  await toCount('A02');
  await step(1, 5);
  assert.match(await text(page, '[data-ds="Stepper"]'), /recorded treatments stand · check on the pig/);
  // R2-2: the reason and its answer are on screen as soon as the number is entered, before any tap on Save
  assert.ok(await page.locator('#ct-why').isVisible() && await page.locator('#ct-why ~ [data-action="sure"], [data-action="sure"]').first().isVisible());
  await page.click('[data-action="save"]', { force: true });                      // a waiting Save says why once tapped
  assert.match(await text(page, '#ct-why'), /17 piglets is 5 more than the record's 12 piglets · count again, or say it's right/);
  assert.equal(await page.locator('[data-action="save"]').getAttribute('aria-disabled'), 'true');
  await page.click('[data-action="sure"]');
  assert.match(await text(page, '#ct-why'), /You said 17 is right/);                       // R3-20: the answer is said back
  await page.click('[data-action="save"]');
  await page.waitForURL(/state=litter.*saved=count/); await ready(page);
  await page.waitForSelector('#lt-receipt span');
  assert.match(await text(page, '#lt-receipt'), /unexplained gain 5 piglets\s*·\s*check on the pig/);
  assert.match(await text(page, '.sheet'), /Check on the pig · it owes nothing new/);
  console.log('ok 8 a count far above Alive asks first; the gain owes nothing new:', await text(page, '#lt-receipt'));

  // 9. R1-27: 0 asks "moved or weaned?" (the Move door is right there); the draft kept on Back is never a stale 0 ready to Save.
  await toCount('B10');
  await step(-1, 11);
  assert.match(await text(page, '[data-target="zero"]'), /None seen in B10 · moved or weaned\? Record a Move from B10/);
  assert.equal(await page.locator('[data-action="save"]').getAttribute('aria-disabled'), 'true');
  await page.click('[role="dialog"] [data-action="back"]');
  await page.waitForURL(/state=litter.*crate=B10/); await ready(page);
  assert.match(await text(page, '.pp-tools'), /Set count 0 counted · not saved/);
  await page.click('[data-action="open-count"]');
  await page.waitForURL(/count\.html/); await ready(page);
  assert.equal(await page.locator('[role="spinbutton"]').first().innerText(), '0');
  assert.equal(await page.locator('[data-action="save"]').getAttribute('aria-disabled'), 'true');
  await page.click('[data-action="save"]', { force: true });
  assert.match(await text(page, '#ct-why'), /0 writes all 11 piglets as missing/);
  await page.click('[data-target="zero"] [data-action="open-move"]');
  await page.waitForURL(/move\.html\?.*crate=B10/);
  console.log('ok 9 0 asks moved or weaned; the kept 0 still asks; the Move door opens');

  // 10. R1-9: Set count names the tagged piglet it knows is missing (optional: the untagged could cover it); the line then
  // carries 271004, and its body (Record death from the line) closes it — Alive stays.
  await toCount('B06');
  await step(-1, 1);
  assert.match(await text(page, '[data-target="roster"]'), /Which tagged piglets are missing\? · optional/);
  await page.click('[data-action="sub"][data-value="roster"]');
  await page.check('input[data-action="pick-row"][value="B06-r4"]');
  await page.click('[data-action="save"]');
  await page.waitForURL(/state=litter.*saved=count/); await ready(page);
  await page.waitForSelector('#lt-receipt span');
  await page.waitForTimeout(450);
  await page.click('[data-action="open-dead"]');
  await page.waitForURL(/dead\.html/); await ready(page);
  await page.click('[data-action="sub"][data-value="tagged"]');
  assert.match(await text(page, '[data-ds="ChoiceList"]'), /271004 counted missing/);
  await page.check('input[data-action="pick"][value="B06-r4"]');
  await page.click('[data-action="pick-cause"][data-value="crushed"]');
  await page.click('[data-action="save"]');
  await page.waitForURL(/state=litter.*crate=B06.*saved=dead/); await ready(page);
  await page.waitForSelector('#lt-receipt span');
  assert.match(await text(page, '#lt-receipt'), /271004 crushed\s*·\s*all missing found/);
  assert.match(await text(page, '[data-ds="Facts"]'), /Alive now 11/);
  console.log('ok 10 a named missing piglet body closes its line:', await text(page, '#lt-receipt'));

  // 11. R2-7: a held body is asked in its own dialog (the Set count sheet is not under it); the answer comes back with a receipt on
  // the litter, and no stale count can be saved: Set count starts again from the new Alive.
  await toCount('A07', 'held-body');
  const drawerText = await text(page, '[role="dialog"]');
  assert.ok(drawerText.indexOf('Same body recorded twice?') >= 0 && drawerText.indexOf('Same body recorded twice?') < drawerText.indexOf('Seen in A07'));
  await page.click('[data-action="sub"][data-value="held"]');
  assert.doesNotMatch(await text(page, '#screen'), /Seen in A07/);
  await page.click('[data-action="sub-back"]');
  assert.match(await text(page, '#screen'), /Seen in A07/);
  await page.click('[data-action="sub"][data-value="held"]');
  await page.click('[role="dialog"] [data-action="held-pick"][data-value="two"]');
  await page.click('[role="dialog"] [data-action="resolve"][data-value$="|two"]');
  await page.waitForURL(/state=litter.*saved=count/); await ready(page);
  await page.waitForSelector('#lt-receipt span');
  assert.match(await text(page, '#lt-receipt'), /Saved\s*·\s*two bodies\s*·\s*Alive 12 piglets/);
  await page.waitForTimeout(450);
  await page.click('[data-action="open-count"]');
  await page.waitForURL(/count\.html/); await ready(page);
  assert.equal(await page.locator('[role="spinbutton"]').first().innerText(), '12');
  assert.match(await text(page, '[data-ds="Stepper"]'), /Same as the record/);
  console.log('ok 11 held body answered in its own dialog, receipt, stepper reset: Two bodies');

  // 12. R2-24: a count equal to the record writes nothing; Back after a saved count returns to the litter.
  await toCount('A02');
  assert.match(await text(page, '[data-ds="Stepper"]'), /Same as the record · Save writes nothing new/);
  const before = (await log(page, 'base')).length;
  await page.click('[data-action="save"]');
  await page.waitForURL(/state=litter.*saved=count/); await ready(page);
  assert.equal((await log(page, 'base')).length, before);
  assert.match(await text(page, '#lt-receipt'), /Same as the record/);
  await page.goBack(); await ready(page);
  assert.doesNotMatch(page.url(), /count\.html/);
  console.log('ok 12 same-as-record writes nothing, Back skips the count page');

  // 13. R3-16: the tagged-missing picker's line counts down as piglets are ticked and never says "0 untagged can't cover".
  await page.goto(base + 'count.html?state=count-name-need&fresh=1'); await ready(page);
  const sub13 = () => text(page, '.sheet .sheet-subtitle, .utility-header');
  assert.match(await sub13(), /7 piglets missing · 3 piglets untagged · tick 4 more by tag/);
  await page.check('input[data-action="pick-row"][value="B06-r1"]');
  assert.match(await sub13(), /tick 3 more by tag/);
  for (const r of ['B06-r2', 'B06-r3', 'B06-r4']) await page.check(`input[data-action="pick-row"][value="${r}"]`);
  assert.match(await sub13(), /4 ticked · enough, the rest were untagged/);
  console.log('ok 13 R3-16 the named-missing picker counts down as piglets are ticked');

  await browser.close();
} finally {
  server.kill();
}
