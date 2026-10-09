// Identity and weigh click-through (scenario round 1: R1-1, R1-23, N7, N8): every button on the identity page takes a
// real tap, walked from the room — room → litter → Record identity → record 3 piglets → Close — then the same-tag
// choice, the device draft through Close, the litter-weight drawer, a keepers farm and a notch farm.
// Run: node tests/id-click-through.mjs [port]. Uses the Playwright the design lint installs (~/.cache/adam-design/playwright-<v>).
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const port = Number(process.argv[2]) || 4643;
const require = createRequire(join(homedir(), '.cache', 'adam-design', 'playwright-1.63.0', 'package.json'));
const { chromium } = require('playwright');
const server = spawn(process.execPath, ['scripts/serve-ux.cjs', String(port)], { stdio: 'ignore' });
const base = `http://localhost:${port}/ux/tasks/piglet-processing/`;
const ready = (p) => p.waitForSelector('html[data-ready]');
const text = async (p, sel) => (await p.locator(sel).first().innerText()).replace(/\s+/g, ' ');
const status = (p) => text(p, '#id-pad .st-numpad-hint');
// a real tap: the pointer lands on the element's centre, so anything covering it (a pointer-events:none wrapper, a
// scrim) would take it instead
const tap = async (p, sel) => { const l = p.locator(sel).first(); await l.evaluate((e) => e.scrollIntoView({ block: 'center' })); const b = await l.boundingBox(); assert.ok(b, 'nothing to tap: ' + sel); await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await p.waitForTimeout(80); };
const keys = async (p, digits, field = 'tag') => { for (const k of digits) await tap(p, `[data-action="numpad"][data-value="${field}"][data-key="${k === '<' ? 'back' : k}"]`); };
const record = async (p) => { await tap(p, '.sheet-footer [data-action="record"]'); await p.waitForTimeout(650); };   // repeat taps inside 600ms are ignored
// the run (Piglet identity) and the table (Piglet records) are pages; the run's head line carries the litter's progress
// the run's head line names the piglet in hand (`Piglet 4 of 12`: three identified), or the litter's count when all are in
const progress = (p) => text(p, '[data-view="run"] .sheet-subtitle');
const toTable = (p) => tap(p, '[data-view="run"] .sheet-footer [data-action="to-table"]');
const leave = (p) => tap(p, '[data-view="table"] .sheet-footer [data-action="leave"]');
// the room → the litter's drawer (room.html?state=litter) → Record identity
async function openIdentity(p, crate) {
  await tap(p, `[data-action="open-litter"][data-value="${crate}"]`);
  await drawerIdentity(p, crate);
}
// on the litter's drawer (where Back from the records lands): Record identity
async function drawerIdentity(p, crate) {
  await p.waitForURL(new RegExp(`room\\.html\\?.*state=litter.*crate=${crate}`)); await ready(p);
  await tap(p, '[data-action="open-identity"]');
  await p.waitForURL(/id\.html/); await ready(p);
}

try {
  await new Promise((r) => setTimeout(r, 400));
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));

  // 1. room → A02 → Record identity → the table → Record identity → three piglets by tap → Close → the litter says 3 of 12.
  await page.goto(base + 'room.html?state=room&fresh=1'); await ready(page);
  await openIdentity(page, 'A02');
  assert.match(await text(page, '[data-view="table"] .sheet-subtitle'), /A02/);
  await tap(page, '[data-action="open-run"]');
  // piglet 1: typed tag, boar, weight typed on the weight pad
  await keys(page, '004301');
  assert.doesNotMatch(await status(page), /Tag is 6 digits/);                  // a full tag says nothing about its length
  await tap(page, '[data-action="numpad"][data-value="tag"][data-key="7"]');     // …until a digit past it
  assert.match(await status(page), /Tag is 6 digits/);
  assert.equal(await page.locator('.st-numpad-readout .st-measure-value').first().innerText(), '004301');
  await tap(page, '#id-sex [data-value="b"]');
  assert.equal(await page.getAttribute('#id-sex [data-value="b"]', 'aria-checked'), 'true');
  await tap(page, '[data-action="open-numpad"][data-value="weight"]');
  // the piglet in hand is named once, in the head line (three identified: piglet 4); the weight field is plain Weight
  assert.match(await progress(page), /Piglet 1 of 12/);
  assert.match(await text(page, '[data-ds="Measure"][data-field="weight"]'), /Weight/);
  await keys(page, '1.42', 'weight');
  await record(page);
  assert.match(await status(page), /Last 004301 · boar · 1\.42 kg/);
  // piglet 2: the suggestion (004302), a gilt, then the visible Clear takes the sex back to missing, then gilt again
  assert.match(await text(page, '.st-numpad-readout'), /004302/);
  // R2-1: with only the suggestion in the field the button names it, so recording it is never silent
  assert.match(await text(page, '.sheet-footer [data-action="record"]'), /^Record · 004302$/);
  await keys(page, '9');
  assert.match(await text(page, '.sheet-footer [data-action="record"]'), /Record · next piglet/);
  await keys(page, '<');
  await tap(page, '[data-action="numpad-suggestion"]');
  assert.match(await text(page, '.st-numpad-readout'), /004302/);
  await tap(page, '#id-sex [data-value="g"]');
  await tap(page, '[data-action="sex-clear"]');
  assert.equal(await page.locator('#id-sex [aria-checked="true"]').count(), 0);
  await tap(page, '#id-sex [data-value="g"]');
  await record(page);
  assert.match(await status(page), /Last 004302 · gilt/);
  // piglet 3: the scan button reads the bag's next tag
  await tap(page, '[data-action="scan"]');
  assert.match(await text(page, '.st-numpad-readout'), /004303/);
  await record(page);
  assert.match(await progress(page), /Piglet 4 of 12/);
  // Undo takes the last one back onto the pad; Record puts it back
  await tap(page, '[data-action="undo"]');
  assert.match(await status(page), /Withdrew 004303/);
  await record(page);
  assert.match(await progress(page), /Piglet 4 of 12/);
  console.log('ok 1 room → litter → Record identity → 3 piglets:', await status(page));

  // 2. the same tag as a piglet here: caught again is the primary, a different piglet is offered beside it.
  await keys(page, '004301');
  assert.match(await status(page), /004301 is piglet 1 Different piglet\?/);
  assert.match(await text(page, '.sheet-footer [data-action="record"]'), /Record · same piglet 1/);
  await tap(page, '[data-action="twin"][data-value="other"]');
  assert.match(await status(page), /A second piglet tagged 004301 Same piglet 1/);
  assert.match(await text(page, '.sheet-footer [data-action="record"]'), /Record · second 004301/);
  assert.match(await progress(page), /Piglet 4 of 12/);
  await tap(page, '[data-action="twin"][data-value="same"]');
  await record(page);
  assert.match(await status(page), /Piglet 1 · kept boar · kept 1\.42 kg|Piglet 1 · nothing new/);
  assert.match(await progress(page), /Piglet 4 of 12/);
  // …and a double-issued tag: a second piglet with 004302 gets its own row, amber on both
  await keys(page, '004302');
  await tap(page, '[data-action="twin"][data-value="other"]');
  await record(page);
  assert.match(await status(page), /Last 004302 · a second piglet with this tag/);
  assert.match(await progress(page), /Piglet 5 of 12/);
  await toTable(page);
  assert.equal(await page.locator('[data-action="edit-row"]', { hasText: 'tag issued twice' }).count(), 2);
  console.log('ok 2 same tag: caught again, or a second piglet (double-issued tag) → 4 of 12, both rows amber');

  // 3. a piglet in hand survives Close: kept on this phone, back on reopen.
  await tap(page, '[data-action="open-run"]');
  await keys(page, '004305');
  await tap(page, '#id-sex [data-value="g"]');
  await toTable(page);
  await leave(page);
  await drawerIdentity(page, 'A02');
  assert.match(await text(page, '[data-action="open-run"]'), /Record identity · 1 unsaved/);
  await tap(page, '[data-action="open-run"]');
  assert.match(await status(page), /004305 kept on this phone · not recorded yet/);
  assert.equal(await page.getAttribute('#id-sex [data-value="g"]', 'aria-checked'), 'true');
  await record(page);
  assert.match(await progress(page), /Piglet 6 of 12/);
  console.log('ok 3 piglet in hand → Close → reopen → kept → Record');

  // 4. the litter weight: three whole digits, a plausibility refusal, the counts the pad covered, a receipt that agrees
  //    with the tiles; an unsaved weight survives Close too.
  await toTable(page);
  await tap(page, '[data-action="open-weight"]');
  await keys(page, '168', 'lw');
  // R2-27: the pad is up and the boar/gilt counts are on its status line, above the keys, in view (never covered)
  const cb = await page.locator('[data-action="to-counts"]').boundingBox(), pb = await page.locator('#id-lw-pad .st-numpad-key').first().boundingBox();
  assert.ok(cb && pb && cb.y + cb.height <= pb.y + 1, 'the counts sit above the pad');
  assert.match(await text(page, '[data-action="to-counts"]'), /Boars and gilts · \d+ not identified/);
  await tap(page, '[data-action="numpad"][data-value="lw"][data-key="5"]');
  assert.match(await text(page, '#id-lw-pad .st-numpad-hint'), /3 digits before the point at most/);
  const cb2 = await page.locator('[data-action="to-counts"]').boundingBox();         // still in view beside the note
  assert.ok(cb2 && cb2.y + cb2.height <= pb.y + 1, 'the counts pointer stays above the keys beside a note');
  await tap(page, '[data-action="to-counts"]');                                      // a tap steps the pad aside
  assert.equal(await page.locator('#id-lw-pad').count(), 0);
  assert.match(await text(page, '[data-ds="Measure"][data-field="lw"]'), /Not recorded · over 72 kg for 12 piglets/);
  assert.equal(await page.locator('[data-st-context="drawer"] [data-action="save"]').count(), 0);
  await tap(page, '[data-action="count"][data-value="boars"][data-step="1"]');
  await tap(page, '[data-action="open-numpad"][data-value="lw"]');
  await keys(page, '<<<16.8', 'lw');
  // Close with the drawer open keeps the weight on this phone
  await tap(page, '[data-st-context="drawer"] [data-action="back"]');
  assert.match(await text(page, '[data-action="open-weight"]'), /1 unsaved/);
  await leave(page);
  await drawerIdentity(page, 'A02');
  assert.match(await text(page, '[data-action="open-weight"]'), /1 unsaved/);
  await tap(page, '[data-action="open-weight"]');
  assert.match(await text(page, '[data-ds="Measure"][data-field="lw"]'), /16\.8/);
  await tap(page, '[data-st-context="drawer"] [data-action="save"]');
  const tiles = await text(page, '[data-ds="Facts"]');
  const [, boars, gilts] = tiles.match(/Boars (\d+)(?: \d+ not identified)? Gilts (\d+)/);
  const rc = await text(page, '.id-group[role="status"]');
  assert.match(rc, new RegExp(`Saved · 16\\.8 kg · ${boars} boars? · ${gilts} gilts? in all`));
  console.log('ok 4 litter weight: 168 refused, counts reachable, kept through Close, saved:', rc.slice(0, 60), '| tiles', tiles);

  // R3-18: at 360 x 740 the Weight field is whole on screen above the pad; a second litter weight on the same day asks
  // "Replace 18.6 kg?" first and keeps the old value amber on the row; a farm with no identity says so.
  {
    const small = await (await browser.newContext({ viewport: { width: 360, height: 740 } })).newPage();
    const smallErrors = []; small.on('pageerror', (e) => smallErrors.push(e.message));
    await small.goto(base + 'id.html?state=id-entry&fresh=1'); await ready(small);
    const wb = await small.locator('[data-ds="Measure"][data-field="weight"] .st-measure-box').boundingBox(), dock = await small.locator('.id-pad-dock').boundingBox();
    assert.ok(wb && dock && wb.y >= 100 && wb.y + wb.height <= dock.y + 1, 'Weight is whole, above the pad');
    await tap(small, '[data-action="open-numpad"][data-value="weight"]');
    await keys(small, '1.4', 'weight');
    assert.match(await text(small, '[data-ds="Measure"][data-field="weight"]'), /1\.4/);
    await small.goto(base + 'id.html?state=litter-weight-replace&fresh=1'); await ready(small);
    assert.match(await text(small, '.sheet-status'), /Replace 18\.6 kg\?/);
    await tap(small, '[data-st-context="drawer"] [data-action="save"]');
    const rowTxt = await text(small, '[data-action="open-weight"]');
    assert.match(rowTxt, /16\.8 kg.*was 18\.6 kg/);
    await small.goto(base + 'id.html?state=litter-weight-typing&fresh=1'); await ready(small);
    await tap(small, '[data-action="open-numpad"][data-value="lw"]');
    await keys(small, '9', 'lw');
    const w2 = await small.locator('[data-ds="Measure"][data-field="lw"]').boundingBox(), cbtn = await small.locator('[data-action="to-counts"]').boundingBox();
    assert.ok(w2 && w2.height > 30 && cbtn && cbtn.height > 30, 'weight and the counters button are both visible while typing');
    await tap(small, '[data-action="to-counts"]');
    assert.ok(await small.locator('[data-action="count"]').count() > 0, 'the counters open behind the button');
    await small.goto(base + 'id.html?state=id-none&fresh=1'); await ready(small);
    assert.match(await text(small, '[data-view="none"]'), /Identity is not recorded on this farm/);
    assert.equal(await small.locator('[data-action="open-run"]').count(), 0);
    await small.goto(base + 'id.html?state=id-candidates-done&fresh=1'); await ready(small);
    assert.match(await text(small, '[data-view="table"]'), /Identity done · 9 keepers/);
    assert.doesNotMatch(await text(small, '[data-view="table"]'), /9 of 14/);
    assert.deepEqual(smallErrors, []);
    console.log('ok R3-18 360 x 740: weight reachable, replace asks and stamps, counters button, all-in state, no-identity farm, keepers closed');
  }

  // 5. every alive piglet identified: no suggestion, no Record, Close is the way on.
  await page.goto(base + 'id.html?state=id-all&fresh=1'); await ready(page);
  assert.equal(await page.locator('.sheet-footer [data-action="record"]').count(), 0);
  assert.equal(await page.locator('[data-view="run"] .sheet-footer > *').count(), 1);
  const inked = await page.$eval('[data-view="run"] .sheet-footer [data-action="to-table"]', (b) => {
    const probe = document.createElement('i'); probe.style.color = 'var(--ink)'; document.body.append(probe);
    const ink = getComputedStyle(probe).color; probe.remove();
    return getComputedStyle(b).backgroundColor === ink;
  });
  assert.equal(inked, true);
  // R3-18: all identified — no pad, no sex, no weight to type into (nothing to swallow); one door row says so, Back is the way out
  assert.match(await text(page, '[data-view="run"] .sheet-body'), /All 12 alive identified.*More than 12\? Set count/);
  assert.equal(await page.locator('#id-pad, #id-sex, [data-action="scan"], [data-action="numpad"]').count(), 0);
  await toTable(page);
  assert.equal(await page.locator('[data-view="table"] [data-action="open-run"]').count(), 0);
  assert.match(await text(page, '[data-ds="Facts"]'), /Identified 12 of 12 .*Boars .*Gilts/);
  await tap(page, '[data-view="table"] .sheet-footer [data-action="leave"]');
  await page.goto(base + 'id.html?state=id-all&fresh=1'); await ready(page);
  // R2-9: "More than 12? Set count" opens Set count for this litter
  await tap(page, '[data-action="set-count"]');
  await page.waitForURL(/count\.html\?.*crate=A02/); await ready(page);
  assert.match(await text(page, '#screen'), /Set count/);
  await page.goto(base + 'id.html?state=id-all&fresh=1'); await ready(page);
  await toTable(page);
  await leave(page);
  await page.waitForURL(/room\.html\?.*state=litter.*crate=A02/);
  console.log('ok 5 all identified → Back');

  // R2-9: a re-catch with a different sex/weight says before the tap what is not applied; R2-27: weigh-first keeps a way
  // back to the tag, and a swallowed fast second tap says so.
  await page.goto(base + 'id.html?state=id-entry&fresh=1'); await ready(page);
  await tap(page, '#id-sex [data-value="g"]');
  await tap(page, '[data-action="open-numpad"][data-value="weight"]');
  await keys(page, '1.7', 'weight');
  assert.equal(await page.locator('#id-pad [data-action="to-tag"]').count(), 1);   // weigh-first: the way back to the tag
  await tap(page, '#id-pad [data-action="to-tag"]');
  await keys(page, '004302');
  assert.match(await status(page), /Piglet 2 · gilt not applied Different piglet\?/);
  await tap(page, '.sheet-footer [data-action="record"]');
  await page.waitForTimeout(650);
  await page.goto(base + 'id.html?state=id-entry&fresh=1'); await ready(page);
  await tap(page, '[data-action="open-numpad"][data-value="weight"]');
  assert.match(await text(page, '#id-pad'), /Back to tag|Back to ear tag/);
  await tap(page, '#id-pad [data-action="to-tag"]');
  await keys(page, '004399');
  await tap(page, '.sheet-footer [data-action="record"]');
  await tap(page, '.sheet-footer [data-action="record"]');                           // inside 600 ms: swallowed, and it says so
  assert.match(await status(page), /Just recorded · tap Record again/);
  console.log('ok R2 re-catch wording, weigh-first way back, swallowed tap cue, Set count');

  // 6. keepers farm: tag two, close the set, the closed set never says "so far" and says how to add a keeper.
  await page.goto(base + 'room.html?state=room&data=keepers&fresh=1'); await ready(page);
  await openIdentity(page, 'A07');
  await tap(page, '[data-action="open-run"]');
  await record(page);
  await toTable(page);
  assert.match(await text(page, '[data-ds="Facts"]'), /Tagged so far 10/);
  await tap(page, '[data-action="close-set"]');
  await tap(page, '[data-action="confirm-close"]');
  const done = await text(page, '[data-action="edit-done"]');
  assert.match(done, /set closed at 10 .* Edit adds a keeper/);
  assert.doesNotMatch(await text(page, '#screen'), /so far/);
  assert.equal(await page.locator('[data-action="open-run"]').count(), 0);
  console.log('ok 6 keepers: close the set →', done);

  // 7. notch farm: 99 is the last number (the next suggestion is the lowest free one), 0 is refused with the reason.
  await page.goto(base + 'room.html?state=room&data=notch&fresh=1'); await ready(page);
  await openIdentity(page, 'A04');
  await tap(page, '[data-action="open-run"]');
  await keys(page, '99');
  await record(page);
  assert.match(await status(page), /Last 118-99/);
  assert.equal(await page.locator('.st-numpad-readout .st-measure-value').first().innerText(), '4');
  await keys(page, '0');
  await record(page);
  assert.match(await status(page), /118-0 is not a piglet number · they run 1–99/);
  console.log('ok 7 notch: 99 → next 4; 0 refused with the reason');

  // 8. zh: the run speaks Chinese end to end.
  await page.goto(base + 'id.html?state=id-same&lang=zh&fresh=1'); await ready(page);
  assert.match(await status(page), /004301是第1头 不是同一头？/);
  console.log('ok 8 zh:', await status(page));

  assert.deepEqual(errors, []);
  await browser.close();
} finally {
  server.kill();
}
