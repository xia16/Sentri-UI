// equipment walk (real clicks): Edit layout › Farrowing Room 2 › + Add › Device › Feeder › click B3 › click B4, B5, B6 › Done
// then + Add › Device › Climate controller › click the middle of the floor (it goes to the nearest wall) › Undo
const run = require('./walk_modes_lib.cjs');
const W = +(process.argv[2] || 1360);
const path = require('path');
const out = path.resolve(__dirname, 'editux', 'equip');
const shot = (page, n) => page.screenshot({ path: path.join(out, 'walk_' + n + '_' + W + '.png') }).then(() => console.log('shot', n));
const penXY = (page, code) => page.evaluate((c) => {
  const L = window.__l3, u = L.ui(), rm = L.rooms.find((r) => r.id === u.roomId), p = rm.pens.find((q) => q.code === c);
  const v = new L.T.Vector3(p.x, L.Y.YF + p.h, p.z); rm.g.localToWorld(v); v.project(L.camera);
  const r = L.renderer.domElement.getBoundingClientRect();
  return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height];
}, code);
const dev = (page) => page.evaluate(() => { const L = window.__l3, u = L.ui(), d = L.Dv().room[u.roomId]; return { dp: u.dp, sel: u.sel, devs: d.devices.map((x) => x.kind + ':' + x.pens.join('/') + ':' + x.where + (x.route ? ':' + x.route.segs.length + 'segs' : '')) }; });
(async () => {
  const errs = await run('saved', W, async ({ page, wait }) => {
    await page.getByRole('button', { name: 'Edit layout' }).first().click(); await wait(900);
    await page.evaluate(() => window.__l3.goRoom('fr2')); await wait(1500);
    await page.getByRole('button', { name: /^Add to this room/ }).first().click(); await wait(500);
    await page.getByRole('menuitem', { name: 'Add device' }).click(); await wait(500);
    await page.getByRole('button', { name: 'Feeder', exact: true }).click(); await wait(500);
    await shot(page, '1_kind');
    let [x, y] = await penXY(page, 'B3'); await page.mouse.click(x, y); await wait(1000);
    console.log('placed', JSON.stringify(await dev(page)));
    for (const c of ['B4', 'B5', 'B6']) { [x, y] = await penXY(page, c); await page.mouse.click(x, y); await wait(700); }
    console.log('picked', JSON.stringify(await dev(page)));
    await shot(page, '2_picking');
    await page.getByRole('button', { name: 'Done', exact: true }).last().click(); await wait(800);
    console.log('done', JSON.stringify(await dev(page)));
    await shot(page, '3_feeder');
    console.log('after done', JSON.stringify(await page.evaluate(() => { const u = window.__l3.ui(); return { dvE: u.dvE, sel: u.sel, view: u.view }; })));
    await page.keyboard.press('Escape'); await wait(500); await page.keyboard.press('Escape'); await wait(700);
    console.log('after esc', JSON.stringify(await page.evaluate(() => { const u = window.__l3.ui(); return { dvE: u.dvE, sel: u.sel, view: u.view, focus: document.activeElement && document.activeElement.id }; })));
    await page.getByRole('button', { name: /^Add to this room/ }).first().click(); await wait(500);
    await page.getByRole('menuitem', { name: 'Add device' }).click(); await wait(500);
    await page.getByRole('button', { name: 'Climate controller', exact: true }).click(); await wait(500);
    [x, y] = await penXY(page, 'A13'); await page.mouse.click(x + 40, y + 30); await wait(1000);
    console.log('climate', JSON.stringify(await dev(page)));
    await shot(page, '4_climate');
    await page.keyboard.press('Control+z'); await wait(800);
    console.log('undo', JSON.stringify(await dev(page)));
  });
  console.log('errors', errs.length);
})();
