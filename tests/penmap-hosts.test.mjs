import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { playwright } from '../scripts/playwright-path.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = await new Promise(resolve => { const s = createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => resolve(p)); }); });
const server = spawn(process.execPath, [path.join(root, 'scripts/serve-ux.cjs'), String(port)], { cwd: root, stdio: 'ignore' });
const base = `http://localhost:${port}`;
for (let i = 0; i < 50; i++) { try { await fetch(base + '/ux/system/penmap-sample-rooms.js'); break; } catch { await new Promise(resolve => setTimeout(resolve, 100)); } }
const { chromium } = playwright();
const browser = await chromium.launch();

async function open(task, shape, screen, { width = 390, lang = 'en' } = {}) {
  const page = await browser.newPage({ viewport: { width, height: 844 } });
  await page.goto(`${base}/ux/system/${task}-astra-concept.html?layout=focus&penmap=${shape}&screen=${screen}&lang=${lang}`);
  await page.waitForSelector('html.atlas-ready');
  return page;
}

test('both hosts let PenMap open Whole room and return to a shared tile’s first pen', async () => {
  for (const [task, screen, pen] of [['farrowing', 'farrowing.room', 'B1'], ['inspection', 'inspection.walk', 'C1']]) {
    const page = await open(task, 'long', screen);
    try {
      const card = page.locator('[data-card="0"]');
      await card.locator('.dock-map').click();
      assert.equal(await card.locator('.st-pen-map .st-pen-tile').count(), 200, task);
      const toggle = card.locator('.st-pen-whole-toggle');
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-pressed'), 'true', task);
      assert.equal(await card.locator('.st-pen-whole .st-pen-group').count(), 20, task);
      await card.locator(`.st-pen-group[data-from="${pen}"]`).click();
      assert.equal(await toggle.getAttribute('aria-pressed'), 'false', task);
      assert.equal(await card.locator('.st-pen-whole').count(), 0, task);
      await card.locator(`.st-pen-map .st-pen-tile[data-pen="${pen}"]`).click();
      await card.locator('.st-pen-map').waitFor({ state: 'detached' });
      assert.equal(await card.locator(`.room-list [data-pen="${pen}"],.inspect-list [data-pen="${pen}"]`).count(), 1, task);
    } finally { await page.close(); }
  }
});

test('mixed sample keeps the row across the room and no-map sample hides the dock entry', async () => {
  const page = await open('farrowing', 'mixed', 'farrowing.room');
  try {
    const card = page.locator('[data-card="0"]');
    await card.locator('.dock-map').click();
    assert.equal(await card.locator('.st-pen-grid[data-stacked]').count(), 1);
    assert.equal(await card.locator('.st-pen-tile[data-pen="C24"]').count(), 1);
    assert.equal(await card.locator('.st-pen-row[data-row]').count(), 0);
  } finally { await page.close(); }
  for (const [task, screen, pen] of [['farrowing', 'farrowing.room', 'B4'], ['inspection', 'inspection.walk', 'C1']]) {
    const single = await open(task, 'single', screen);
    try {
      const card = single.locator('[data-card="0"]');
      assert.equal(await card.locator('.dock-map').count(), 0, task);
      assert.equal(await card.locator(`.room-list [data-pen],.inspect-list [data-pen]`).count(), 1, task);
      assert.equal(await card.locator(`.room-list [data-pen="${pen}"],.inspect-list [data-pen="${pen}"]`).count(), 1, task);
    } finally { await single.close(); }
  }
});

test('Inspection names the map and its legend in Chinese at 360 px', async () => {
  const page = await open('inspection', 'long', 'inspection.walk', { width: 360, lang: 'zh' });
  try {
    const card = page.locator('[data-card="0"]');
    await card.locator('.dock-map').click();
    assert.equal(await card.locator('.sheet-title').textContent(), '栏位图');
    assert.match(await card.locator('[data-line="key"]').textContent(), /需处理/);
    await card.locator('.st-pen-whole-toggle').click();
    assert.equal(await card.locator('.st-pen-whole-toggle').textContent(), '逐栏');
  } finally { await page.close(); }
});

test.after(async () => { await browser.close(); server.kill(); });
