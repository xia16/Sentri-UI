// binding walk (real clicks): Edit layout › Gestation 2 › drag the climate controller into the middle of the room ›
// its pencil opens its set-up (not the room's) › type a code › Bind › + Add › Device › Ventilation fan › click mid-floor › set-up opens › Bind later
const run = require('./walk_modes_lib.cjs');
const W = +(process.argv[2] || 1360);
const path = require('path');
const out = path.resolve(__dirname, 'editux', 'bind');
require('fs').mkdirSync(out, { recursive: true });
const shot = (page, n) => page.screenshot({ path: path.join(out, 'walk_' + n + '_' + W + '.png') }).then(() => console.log('shot', n));
const penXY = (page, code) => page.evaluate((c) => {
  const L = window.__l3, u = L.ui(), rm = L.rooms.find((r) => r.id === u.roomId), p = rm.pens.find((q) => q.code === c);
  const v = new L.T.Vector3(p.x, L.Y.YF + p.h, p.z); rm.g.localToWorld(v); v.project(L.camera);
  const r = L.renderer.domElement.getBoundingClientRect();
  return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height];
}, code);
const st = (page) => page.evaluate(() => { const L = window.__l3, u = L.ui(), d = L.Dv().room[u.roomId]; return { sel: u.sel && u.sel.id, ed: !!u.ed, dvE: u.dvE && u.dvE.id, devs: d.devices.filter((x) => x.serves !== 'pens').map((x) => x.kind + ' | ' + x.where + ' | ' + (x.code || '-')) }; });
(async () => {
  const errs = await run('saved', W, async ({ page, wait }) => {
    await page.getByRole('button', { name: 'Edit layout' }).first().click(); await wait(900);
    await page.evaluate(() => window.__l3.goRoom('g2')); await wait(1500);
    const m = page.locator('[aria-label^="Climate controller"]').first();
    const b = await m.boundingBox();
    const [tx, ty] = await penXY(page, 'C25');
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down();
    for (let j = 1; j <= 12; j++) { await page.mouse.move(b.x + b.width / 2 + (tx - b.x - b.width / 2) * j / 12, b.y + b.height / 2 + (ty + 40 - b.y - b.height / 2) * j / 12); await wait(40); }
    await page.mouse.up(); await wait(900);
    console.log('dragged', JSON.stringify(await st(page)));
    await shot(page, '1_dragged');
    await page.getByRole('button', { name: /^Set up the climate controller/ }).first().click(); await wait(700);
    console.log('pencil', JSON.stringify(await st(page)));
    await page.keyboard.type('CL-20431', { delay: 20 }); await wait(300);
    await shot(page, '2_setup');
    await page.getByRole('button', { name: 'Save', exact: true }).last().click(); await wait(900);
    console.log('bound', JSON.stringify(await st(page)));
    await shot(page, '3_bound');
    await page.keyboard.press('Escape'); await wait(600);
    await page.getByRole('button', { name: /^Add to this room/ }).first().click(); await wait(500);
    await page.getByRole('menuitem', { name: 'Add device' }).click(); await wait(500);
    await page.getByRole('button', { name: 'Ventilation fan', exact: true }).click(); await wait(500);
    const [fx, fy] = await penXY(page, 'B35'); await page.mouse.click(fx, fy + 30); await wait(1000);
    console.log('fan', JSON.stringify(await st(page)));
    await shot(page, '4_fan_setup');
    await page.getByRole('button', { name: 'Bind later', exact: true }).click(); await wait(700);
    console.log('later', JSON.stringify(await st(page)));
    await shot(page, '5_fan_card');
  });
  console.log('errors', errs.length);
})();
