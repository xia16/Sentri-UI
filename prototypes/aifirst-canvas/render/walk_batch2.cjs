// batch view v2 walk (real clicks): View farm › Batches › Batch 32 › Lactation (pens tinted, hover a pen) › back › Born alive per litter › scroll ›
// Batches back to the list › Batch 34 › Breeding › Esc › Esc › Esc
const run = require('./walk_modes_lib.cjs'), path = require('path');
const W = +(process.argv[2] || 1360), out = path.resolve(__dirname, 'batchview');
const st = (page) => page.evaluate(() => { const u = window.__l3.ui(); return { view: u.view, room: u.roomId, bl: u.bl, bv: u.bv, fig: u.bfig }; });
const shot = (page, n) => page.screenshot({ path: path.join(out, 'v2walk_' + n + '_' + W + '.png') });
(async () => {
  const errs = await run('view', W, async ({ page, wait }) => {
    await page.getByRole('button', { name: 'Show the running batches' }).click(); await wait(900);
    console.log('1 list', JSON.stringify(await st(page))); await shot(page, '1_list');
    await page.getByRole('button', { name: 'Open Batch 32' }).click(); await wait(1600);
    console.log('2 batch', JSON.stringify(await st(page))); await shot(page, '2_batch');
    await page.getByRole('button', { name: /^Open Lactation/ }).click(); await wait(900);
    console.log('3 task', JSON.stringify(await st(page)));
    const xy = await page.evaluate(() => { const L = window.__l3, u = L.ui(), rm = L.rooms.find((r) => r.id === u.roomId), p = rm.pens.find((q) => q.code === 'A12'); const v = new L.T.Vector3(p.x, L.Y.YF + p.h * 0.5, p.z); rm.g.localToWorld(v); v.project(L.camera); const r = L.renderer.domElement.getBoundingClientRect(); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; });
    await page.mouse.move(xy[0] - 30, xy[1]); await page.mouse.move(xy[0], xy[1], { steps: 5 }); await wait(600);
    await shot(page, '3_task_hover');
    await page.getByRole('button', { name: 'Batch 32', exact: true }).first().click(); await wait(800);
    await page.getByRole('button', { name: /^Born alive per litter/ }).click(); await wait(500);
    await page.evaluate(() => { const sc = [...document.querySelectorAll('section div')].find((d) => getComputedStyle(d).overflowY === 'auto' && d.scrollHeight > d.clientHeight); if (sc) sc.scrollTop = 9999; }); await wait(400);
    console.log('4 compare', JSON.stringify(await st(page))); await shot(page, '4_compare');
    await page.getByRole('button', { name: 'Batches', exact: true }).first().click(); await wait(900);
    console.log('5 back to list', JSON.stringify(await st(page)));
    await page.getByRole('button', { name: 'Open Batch 34' }).click(); await wait(1600);
    await page.getByRole('button', { name: /^Open Breeding/ }).click(); await wait(900);
    console.log('6 breeding', JSON.stringify(await st(page))); await shot(page, '5_breeding');
    for (let k = 0; k < 3; k++) { await page.keyboard.press('Escape'); await wait(800); console.log('esc', k, JSON.stringify(await st(page))); }
  });
  console.log('errors', errs.length);
})();
