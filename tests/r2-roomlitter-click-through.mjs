// Room + litter drawer, scenario round 2 (R2-8, R2-11 … R2-21, R2-27, round 6): every fixed flow by real taps.
// Run: node tests/r2-roomlitter-click-through.mjs [port]
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const port = Number(process.argv[2]) || 4619;
const require = createRequire(join(homedir(), '.cache', 'adam-design', 'playwright-1.63.0', 'package.json'));
const { chromium } = require('playwright');
const server = spawn(process.execPath, ['scripts/serve-ux.cjs', String(port)], { stdio: 'ignore' });
const base = `http://localhost:${port}/ux/tasks/piglet-processing/`;
const ready = (p) => p.waitForSelector('html[data-ready]');
const text = async (p, sel) => (await p.locator(sel).first().innerText()).replace(/\s+/g, ' ');
const row = (code) => `[data-action="open-litter"][data-value="${code}"]`;
const rowText = (p, code) => text(p, row(code));
const has = async (p, sel) => (await p.locator(sel).count()) > 0;
const order = async (p) => p.locator('[data-action="open-litter"]').evaluateAll((els) => els.map((e) => e.dataset.value));
const face = (p) => text(p, '[data-view="litter"]');

try {
  await new Promise((r) => setTimeout(r, 400));
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const go = async (url) => { await page.goto(base + url); await ready(page); };

  // 1. R2-11: one "owe today" — headline, Owed tab, overview and strip/sheet count the same unit.
  await go('room.html?state=room&fresh=1');
  const head = (await text(page, '.tk-summary-unit .tk-summary-value')).trim();
  const tab = (await text(page, '[data-action="lens"][data-value="owed"]')).replace(/\D/g, '');
  assert.equal(head, tab);
  assert.match(await text(page, '.tk-summary-task'), new RegExp(`${head} owe today`));
  assert.match(await text(page, '.pp-answers'), /To review 1 · Not yet explained 1/);
  await page.click('[data-action="reviews"]');
  assert.match(await text(page, '[data-view="reviews"]'), /Unit 7 · 2 to answer/);
  console.log('ok 1 one count: headline', head, '= Owed tab; strip 1 + 1 = sheet 2');

  // 2. R2-12/13: what is owed now, deferred, treatments-done-tagging-left, a draft on this phone.
  await go('room.html?state=room&fresh=1');
  assert.match(await rowText(page, 'A02'), /12 oweds*·?s*due today/);
  assert.doesNotMatch(await rowText(page, 'A02'), /piglets/);
  assert.match(await rowText(page, 'A05'), /5 deferred/);
  await go('room.html?state=room-id-left&fresh=1');
  assert.match(await rowText(page, 'A02'), /Tag · 12 left.*Treatments done/);
  await go('room.html?state=room-drafts&fresh=1');
  assert.match(await rowText(page, 'A04'), /Unsaved draft/);
  assert.match(await rowText(page, 'A07'), /Unsaved draft/);
  assert.equal(await has(page, `${row('A02')} :text("Unsaved draft")`), false);
  console.log('ok 2 rows: owed now, deferred, "Tag · 12 left", drafts:', await rowText(page, 'A04'));

  // 3. R2-14: a record never reorders the rows under the thumb.
  await go('room.html?state=room&fresh=1');
  const before = await order(page);
  await page.click(row('A02'));
  await page.waitForSelector('[data-view="litter"]');
  await page.click('[data-action="record"][data-value^="iron3"]');
  await page.waitForTimeout(700);
  await page.click('[data-view="litter"] [data-action="close"]');
  await page.waitForTimeout(100);
  const after = await order(page);
  assert.deepEqual(after.filter((c) => c.startsWith('A')), before.filter((c) => c.startsWith('A')));
  assert.deepEqual(after, before);
  console.log('ok 3 stable order after a record:', after.slice(0, 5).join(' '));

  // 4. R2-15: a unit with no task has no overview and no tabs; a litter outside every task says so once and lists no Owed.
  await go('room.html?state=room-notask&fresh=1');
  assert.equal(await has(page, '.tk-summary-task'), false);
  assert.equal(await has(page, '[data-action="lens"]'), false);
  assert.match(await text(page, '.tk-summary'), /Unit 8.*Not in a processing task/);
  await go('room.html?state=litter&crate=E01&fresh=1');
  const e01 = await face(page);
  assert.equal((e01.match(/Not in a processing task/g) || []).length, 1);
  assert.doesNotMatch(e01, /\bOwed\b/);
  console.log('ok 4 no-task unit: no overview; no-task litter: once, no Owed list');

  // 5. R2-16: the litter's own piglets and arrivals of another age are separate rows, each its own Record.
  await go('room.html?state=litter&crate=C05&data=moved-to-c05&fresh=1');
  assert.equal(await page.locator('[data-action="record"][data-value^="iron3"]').count(), 2);
  const own = await text(page, '[data-action="record"][data-value="iron3#own"]');
  assert.match(own, /Record 8/);
  const ironRows = await page.locator('.tk-day .st-row').evaluateAll((els) => els.map((e) => e.innerText.replace(/\s+/g, ' ')).filter((t) => /^Iron/.test(t)));
  assert.ok(ironRows.some((t) => /8 of its owns*·?s*day 4/.test(t)) && ironRows.some((t) => /1 from B06s*·?s*day 3/.test(t)), ironRows.join(' | '));
  await page.click('[data-action="record"][data-value="iron3#own"]');
  await page.waitForTimeout(700);
  assert.match(await face(page), /Saved · iron · day 3 · 8 piglets/);
  assert.equal(await page.locator('[data-action="record"][data-value^="iron3"]').count(), 1);
  // group-targeted: the arrival keeps its own age and status (Due today), the litter's own stay 1 day late
  assert.match(await text(page, '.tk-day:has-text("Due today")'), /Due today/);
  await go('room.html?state=litter&crate=C05&data=moved-to-c05&fresh=1');
  await page.click('[data-action="record"][data-value^="iron3#B06"]');
  await page.waitForTimeout(700);
  assert.match(await text(page, ".tk-day:has-text(\"1 day late\")"), /1 day late.*Dock tail 8 of its own/s);
  console.log('ok 5 split rows: either group first, the other keeps its own age and status');
  await page.goto(base + 'room.html?state=litter&crate=C05&data=moved-to-c05&fresh=1&lang=zh'); await ready(page);
  assert.match(await face(page), /来自 B06 · 1头/);

  // 6. R2-17: a deferral completed later is one recorded row, "12 of 12".
  await go('room.html?state=litter&crate=A02&data=a02-short&fresh=1');
  await page.click('[data-action="record"][data-value^="iron3"]');
  await page.waitForTimeout(700);
  const done = await face(page);
  assert.match(done, /Iron [^R]*12 of 12 piglets/);
  assert.equal((done.match(/Iron \d\d:\d\d/g) || []).length, 1);
  console.log('ok 6 one recorded row: 12 of 12');

  // 7. R2-18: while a body is held the one-tap asks first.
  await go('room.html?state=litter&crate=A07&data=held-body&fresh=1');
  const rec = page.locator('[data-action="record"]').first();
  await rec.click();
  await page.waitForTimeout(150);
  assert.match(await text(page, '#lt-ask'), /Alive in question · record \d+\?/);
  await page.click('[data-action="record-no"]');
  assert.equal(await has(page, '#lt-ask'), false);
  assert.equal(await has(page, '.lt-receipt'), false);
  await rec.click(); await page.waitForTimeout(150);
  await page.click('[data-action="record-yes"]');
  await page.waitForTimeout(300);
  assert.match(await face(page), /Saved ·/);
  console.log('ok 7 held body: asks, Not now writes nothing, Record writes');

  // 8. R2-19: castrate shows Early; "No males" says nothing stale beside counts; a contradictory arrival answer is cautioned.
  await go('room.html?state=litter&crate=A02&dose=castrate&fresh=1');
  assert.match(await text(page, '[data-view="dose"]'), /Early · due day 5/);
  assert.match(await text(page, '[data-action="no-males"]'), /castrated 0 · nothing owed/);
  await page.click('[data-action="step"][data-value="castrated"][data-step="1"]');
  assert.doesNotMatch(await text(page, '[data-action="no-males"]'), /nothing owed/);
  await go('room.html?state=litter&crate=A04&data=move-doubt&fresh=1');
  await page.click('[data-action="open-resolve"]');
  await page.waitForSelector('[data-view="dose"]');
  await page.click('[data-action="radio"][data-value="owed"]');
  assert.match(await text(page, '[data-view="dose"]'), /Only 2 of these can have been left untreated/);
  console.log('ok 8 castrate early, no stale sublabel, contradictory answer cautioned');

  // 9. R2-20 / R2-27 / R2-8 / round 6 on the drawer.
  await go('room.html?state=litter&crate=B01&fresh=1');
  assert.match(await text(page, '.lt-summary'), /Sow died Prolapse · Sep 28 · 06:20/);
  await go('room.html?state=litter&crate=B04&fresh=1');
  assert.match(await text(page, '.lt-summary'), /Litter weight 15\.9 kg · day 3/);
  await go('room.html?state=litter&crate=A02&data=killed&fresh=1');
  assert.match(await face(page), /Litter closed.*All 12 died/);
  await go('room.html?state=litter&crate=C05&data=emptied&fresh=1');
  assert.match(await face(page), /Litter closed.*All 8 moved out/);
  await go('room.html?state=litter&crate=A02&data=double-different&fresh=1');
  assert.match(await face(page), /Iron [^R]*12 of 12 piglets/);
  console.log('ok 9 sow cause, weigh-day weight, closed by, "different" = 12 of 12');

  // 10. R2-21: all four tools at 360, labels intact.
  await page.setViewportSize({ width: 360, height: 800 });
  await go('room.html?state=litter&crate=A02&fresh=1');
  const tools = await page.locator('.pp-toolrow .pp-tool').evaluateAll((els) => els.map((e) => ({ t: e.innerText.replace(/\s+/g, ' ').trim(), w: e.getBoundingClientRect().width, vis: getComputedStyle(e).display !== 'none', over: e.scrollWidth > e.clientWidth })));
  assert.deepEqual(tools.map((t) => t.t), ['Edit', 'Record death', 'Set count', 'Move']);
  assert.ok(tools.every((t) => t.vis && !t.over), JSON.stringify(tools));
  assert.equal(await has(page, '[data-action="open-more"]'), false);
  console.log('ok 10 four tools at 360');

  // 11. R2-22: forgiving Find; the drawer lists its Moves, each with an Edit door.
  await page.setViewportSize({ width: 390, height: 844 });
  for (const q of ['a4', 'A 04', 'A-04']) {
    await go('room.html?state=room-find&fresh=1&q=' + encodeURIComponent(q));
    assert.equal(await page.locator('#scan-results [data-action="open-litter"]').count(), 1, q);
    assert.match(await text(page, '#scan-results'), /A04/);
  }
  await go('room.html?state=room-find&fresh=1&q=04');
  assert.ok((await page.locator('#scan-results [data-action="open-litter"]').count()) >= 2);
  await go('room.html?state=room-find&fresh=1&q=0354');
  assert.ok((await page.locator('#scan-results [data-action="open-litter"], #scan-results .tk-row').count()) >= 1);
  await go('room.html?state=litter&crate=A02&data=moved-to-c05&fresh=1');
  await go('room.html?state=litter&crate=C05&data=moved-to-c05&fresh=1');
  assert.match(await face(page), /Move 3 piglets moved in from|Move.*moved in from B06/);
  assert.ok(await has(page, '[data-view="litter"] [data-action="open-edit"][data-value^="MV-"]'));
  console.log('ok 11 forgiving Find; per-Move list with Edit doors');

  assert.deepEqual(errors, []);
  console.log('r2 room+litter click-through: all ok');
  await browser.close();
} finally {
  server.kill();
}
