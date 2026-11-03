// batch view walk (real clicks). Standalone at W: View › Farrowing Room 2 › click crate A3 › Batch 32 chip › batch view › a sow in the list ›
// her chip back to the batch › ✕ back to her › Shift-pick 3 pens › Actions › Treatment (sentri:open caught) › crate A3 › "In a decision" (sentri:open caught).
// Then in Main (1440): the same picks › Treatment opens with the strip › Back to the farm › crate A3 › the decision opens.
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const run = require('./walk_modes_lib.cjs');
const root = path.resolve(__dirname, '../aifirst/project');
const runtime = path.resolve(__dirname, '../artifact-files/15394c53-c767-4178-a99f-287167e3eb10/artifact-type/dc-runtime.js');
const out = path.resolve(__dirname, 'batchview');
const W = +(process.argv[2] || 1360);
const penXY = (page, code) => page.evaluate((c) => {
  const L = window.__l3, u = L.ui(), rm = L.rooms.find((r) => r.id === u.roomId), p = rm.pens.find((q) => q.code === c);
  const v = new L.T.Vector3(p.x, L.Y.YF + p.h, p.z); rm.g.localToWorld(v); v.project(L.camera);
  const r = L.renderer.domElement.getBoundingClientRect();
  return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height];
}, code);
const st = (page) => page.evaluate(() => { const u = window.__l3.ui(); return { view: u.view, room: u.roomId, psel: u.psel, bv: u.bv, menu: u.moreOpen, last: window.__opened || null }; });
const catchOpen = (page) => page.evaluate(() => { window.__opened = null; window.addEventListener('sentri:open', (e) => { window.__opened = e.detail; }); });
const click = async (page, code, shift) => { const [x, y] = await penXY(page, code); if (shift) await page.keyboard.down('Shift'); await page.mouse.click(x, y); if (shift) await page.keyboard.up('Shift'); };

(async () => {
  const errs = await run('view', W, async ({ page, wait }) => {
    await catchOpen(page);
    await page.evaluate(() => window.__l3.goRoom('fr2')); await wait(1600);
    await click(page, 'A3'); await wait(1300);
    console.log('1 sow', JSON.stringify(await st(page)));
    await page.getByRole('button', { name: 'Show Batch 32 across the farm' }).last().click(); await wait(1400);
    console.log('2 batch', JSON.stringify(await st(page)));
    await page.screenshot({ path: path.join(out, 'walk_1_batch_' + W + '.png') });
    await click(page, 'A23'); await wait(1400);
    console.log('3 sow from list', JSON.stringify(await st(page)));
    await page.screenshot({ path: path.join(out, 'walk_2_sowfromlist_' + W + '.png') });
    await page.getByRole('button', { name: 'Show Batch 32 across the farm' }).last().click(); await wait(1200);
    await page.getByRole('button', { name: 'Close Batch 32' }).click(); await wait(1300);
    console.log('4 back', JSON.stringify(await st(page)));
    await page.keyboard.press('Escape'); await wait(800);
    for (const c of ['A5', 'A6', 'B7']) { await click(page, c, true); await wait(500); }
    console.log('5 picked', JSON.stringify(await st(page)));
    await page.getByRole('button', { name: /^Actions for/ }).click(); await wait(600);
    await page.screenshot({ path: path.join(out, 'walk_3_actions_' + W + '.png') });
    await page.getByRole('menuitem', { name: /Treatment/ }).click(); await wait(800);
    console.log('6 treatment', JSON.stringify(await st(page)));
    await page.keyboard.press('Escape'); await wait(600);
    await click(page, 'A3'); await wait(1300);
    await page.getByRole('button', { name: /In a decision/ }).click(); await wait(700);
    console.log('7 decision', JSON.stringify(await st(page)));
    await page.screenshot({ path: path.join(out, 'walk_4_decision_' + W + '.png') });
  });
  console.log('standalone errors', errs.length);
  if (process.argv[3] !== 'main') return;
  // ---- inside Main ----
  const srv = http.createServer((req, res) => { const u = decodeURIComponent(req.url.split('?')[0]); const f = u.endsWith('/support.js') ? runtime : path.join(root, u); fs.readFile(f, (e, b) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'text/html' }); res.end(b); }); });
  await new Promise((r) => srv.listen(0, r));
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  if (process.env.HOSTLIKE) await page.route((u) => ['/vendor/', 'layout.engine', 'pigs.module', '/farms/'].some((k) => u.pathname.includes(k)), (r) => r.abort());
  const merr = [];
  page.on('pageerror', (e) => { merr.push(e.message); console.log('[pageerror]', e.message); });
  page.on('console', (m) => { if (m.type() === 'error' && !/moveto|Expected length|fonts.g|Failed to load resource/.test(m.text())) { merr.push(m.text()); console.log('[console]', m.text().slice(0, 200)); } });
  await page.addInitScript(() => { window.__dbg = true; });
  const wrap = '_pv_walk_main.dc.html';
  const head = fs.readFileSync(path.join(root, 'FlowActionOpened.dc.html'), 'utf8').replace('start="actionopened"', 'start="farmview"');
  fs.writeFileSync(path.join(root, wrap), head);
  await page.goto('http://localhost:' + srv.address().port + '/' + wrap); await page.waitForTimeout(4500);
  const mst = () => page.evaluate(() => { const t = [...document.querySelectorAll('[role=note]')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()); return { note: t[0] || '', tabs: [...document.querySelectorAll('button, a')].filter((b) => /Treatment orders|For you|Farm layout/.test(b.textContent)).map((b) => b.textContent.trim().slice(0, 30)) }; });
  await page.evaluate(() => window.__l3.goRoom('g2')); await page.waitForTimeout(1600);
  // the pens a person can see: left of the pig panel once it opens, below the card
  const vis = await page.evaluate(() => { const L = window.__l3, u = L.ui(), rm = L.rooms.find((r) => r.id === u.roomId), cv = L.renderer.domElement.getBoundingClientRect(); return rm.pens.map((p) => { const v = new L.T.Vector3(p.x, L.Y.YF + p.h, p.z); rm.g.localToWorld(v); v.project(L.camera); return { c: p.code, x: cv.left + (v.x + 1) / 2 * cv.width, y: cv.top + (1 - v.y) / 2 * cv.height }; }).filter((q) => q.x > cv.left + 40 && q.x < cv.right - 470 && q.y > cv.top + 200 && q.y < cv.bottom - 140).map((q) => q.c); });
  const picks = vis.filter((c, k) => k % 3 === 0).slice(0, 3);
  console.log('picking', picks.join(' '));
  for (const c of picks) { await click(page, c, true); await page.waitForTimeout(600); }
  await page.getByRole('button', { name: /^Actions for/ }).click(); await page.waitForTimeout(600);
  await page.getByRole('menuitem', { name: /Treatment/ }).click(); await page.waitForTimeout(1500);
  console.log('M1 treatment', JSON.stringify(await mst()));
  await page.screenshot({ path: path.join(out, 'walk_main_1_treatment_1440.png') });
  await page.getByRole('button', { name: 'Back to the farm' }).click(); await page.waitForTimeout(3500);
  await page.evaluate(() => window.__l3.goRoom('fr2')); await page.waitForTimeout(1600);
  console.log('A3 xy', JSON.stringify(await penXY(page, 'A3')), JSON.stringify(await page.evaluate(() => { const u = window.__l3.ui(); return { view: u.view, room: u.roomId, vm: u.vm, mode: u.mode }; })));
  await click(page, 'A3'); await page.waitForTimeout(1300);
  console.log('after A3', JSON.stringify(await page.evaluate(() => window.__l3.ui().psel)));
  await page.screenshot({ path: path.join(out, 'walk_main_dbg_1440.png') });
  await page.getByRole('button', { name: /In a decision/ }).click(); await page.waitForTimeout(1500);
  console.log('M2 decision', JSON.stringify(await mst()), await page.evaluate(() => document.body.innerText.includes('For you')));
  await page.screenshot({ path: path.join(out, 'walk_main_2_decision_1440.png') });
  fs.unlinkSync(path.join(root, wrap)); await browser.close(); srv.close();
  console.log('main errors', merr.length);
})();
