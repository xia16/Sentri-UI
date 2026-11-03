// editux walk: real input under HOSTLIKE=1 at the given width.
// A: setup (pens) -> lane C of a gestation room -> Add pens -> picker -> New pen type -> Add pen type -> 3 -> Add pens -> undo / redo -> Save layout
// B: View -> Edit layout -> a room -> Duplicate -> Done -> View shows the copy
const run = require('./walk_modes_lib.cjs');
const W = +(process.argv[2] || 1360);
const fs = require('fs'), path = require('path');
const out = path.resolve(__dirname, 'editux'); fs.mkdirSync(out, { recursive: true });
const info = (page) => page.evaluate(() => { const u = __l3.ui(), m = __l3.M(); const g = m.rooms.find((r) => r.id === u.roomId); return { mode: u.mode, vm: u.vm, view: u.view, room: u.roomId, sel: u.sel && u.sel.kind + u.sel.i, arT: !!u.arT, rooms: m.rooms.length, types: m.types.length, laneC: g && g.lanes[2] ? g.lanes[2].runs.map((x) => x.type + '×' + x.n).join(' ') : '', past: __l3.hist.past.length, fut: __l3.hist.future.length }; });
const shot = async (page, name) => { await page.screenshot({ path: path.join(out, 'after_' + name + '_' + W + '.png') }); console.log('shot', name); };
const btn = (page, name) => page.getByRole('button', { name: name }).first().click({ timeout: 4000 });

(async () => {
  const e1 = await run('pens', W, async ({ page, wait }) => {
    console.log('A0', JSON.stringify(await info(page)));
    await page.evaluate(() => __l3.goRoom('g2')); await wait(1300); // the flight in is not what we test; every edit below is real input
    await btn(page, /^Lane C$/); await wait(900);
    console.log('A1 lane', JSON.stringify(await info(page))); await shot(page, 'A1_lane');
    await btn(page, 'Add pens'); await wait(700); await shot(page, 'A2_addline');
    console.log('focus', await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('aria-label')));
    await btn(page, /^Pen type:/); await wait(600); await shot(page, 'A3_picker');
    await page.getByRole('menuitem', { name: 'New pen type' }).click(); await wait(600);
    // the steps: what it is › who lives here › name, size, pigs per pen
    await page.getByRole('button', { name: 'Group pen', exact: true }).click(); await wait(300);
    await page.getByRole('button', { name: 'Next', exact: true }).click(); await wait(400);
    await page.getByRole('button', { name: 'Sick pigs', exact: true }).click(); await wait(300);
    await page.getByRole('button', { name: 'Next', exact: true }).click(); await wait(500);
    console.log('focus', await page.evaluate(() => document.activeElement && document.activeElement.id));
    await page.keyboard.type('Isolation pen', { delay: 20 }); await wait(400);
    await shot(page, 'A4_newtype');
    await btn(page, 'Add pen type'); await wait(800);
    console.log('A5 type made', JSON.stringify(await info(page)), 'focus', await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('aria-label')));
    await page.keyboard.press('Control+a'); await page.keyboard.type('3'); await wait(300);
    await shot(page, 'A5_backselected');
    await page.keyboard.press('Enter'); await wait(1100);
    console.log('A6 added', JSON.stringify(await info(page))); await shot(page, 'A6_added');
    await page.locator('canvas').first().click({ position: { x: 5, y: 5 }, force: true }).catch(() => {}); await wait(200);
    await page.keyboard.press('Control+z'); await wait(900); console.log('A7 undo', JSON.stringify(await info(page)));
    await page.keyboard.press('Control+z'); await wait(900); console.log('A7 undo2', JSON.stringify(await info(page)));
    await page.keyboard.press('Control+Shift+z'); await wait(900); console.log('A8 redo', JSON.stringify(await info(page)));
    await page.keyboard.press('Control+Shift+z'); await wait(900); console.log('A8 redo2', JSON.stringify(await info(page)));
    await shot(page, 'A8_redone');
    await btn(page, 'Save layout'); await wait(1600);
    console.log('A9 saved', JSON.stringify(await info(page))); await shot(page, 'A9_saved_view');
  });
  const e2 = await run('saved', W, async ({ page, wait }) => {
    console.log('B0', JSON.stringify(await info(page)));
    await btn(page, 'Edit layout'); await wait(900);
    await page.evaluate(() => __l3.goRoom('fr4')); await wait(1300);
    await shot(page, 'B1_room');
    await btn(page, /^Duplicate/); await wait(700); await shot(page, 'B2_duptask');
    await page.locator('div[role=region] button', { hasText: /^Duplicate$/ }).last().click(); await wait(1300);
    console.log('B3 dup', JSON.stringify(await info(page))); await shot(page, 'B3_duplicated');
    await btn(page, 'Done'); await wait(1600);
    console.log('B4 done', JSON.stringify(await info(page)), await page.evaluate(() => __l3.M().rooms.filter((r) => r.section === 's-far').map((r) => r.name).join(', ')));
    await shot(page, 'B4_view');
    await page.evaluate(() => __l3.goScope('z1', 's-far')); await wait(1400); await shot(page, 'B5_view_section');
  });
  console.log('errors', e1.length, e2.length);
})();
