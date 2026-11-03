// discard walk (real clicks). Saved farm: Edit layout › Gestation 2 › Lane C › Remove lane › Discard changes › View, lane C back › Undo › Edit, lane gone › Done.
// Setup: a lane removed › Discard changes › the draft is back, still in setup.
const run = require('./walk_modes_lib.cjs');
const W = +(process.argv[2] || 1360);
const path = require('path');
const out = path.resolve(__dirname, 'editux', 'discard');
require('fs').mkdirSync(out, { recursive: true });
const shot = (page, n) => page.screenshot({ path: path.join(out, 'walk_' + n + '_' + W + '.png') }).then(() => console.log('shot', n));
const st = (page) => page.evaluate(() => { const L = window.__l3, u = L.ui(), g = L.M().rooms.find((r) => r.id === 'g2'); return { mode: u.mode, vm: u.vm, lanes: g ? g.lanes.length : -1, past: L.hist.past.length, fut: L.hist.future.length, toast: u.toast && u.toast.text }; });
(async () => {
  let errs = await run('saved', W, async ({ page, wait }) => {
    await page.getByRole('button', { name: 'Edit layout' }).first().click(); await wait(900);
    await page.evaluate(() => window.__l3.goRoom('g2')); await wait(1500);
    await page.getByRole('button', { name: /^Lane C$/ }).first().click(); await wait(800);
    await page.getByRole('button', { name: /^Remove lane/ }).first().click(); await wait(900);
    console.log('removed', JSON.stringify(await st(page)));
    await shot(page, '1_changed');
    await page.getByRole('button', { name: 'Discard changes', exact: true }).click(); await wait(1500);
    console.log('discarded', JSON.stringify(await st(page)));
    await shot(page, '2_discarded');
    await page.getByRole('button', { name: 'Undo', exact: true }).last().click(); await wait(1500);
    console.log('undo', JSON.stringify(await st(page)));
    await shot(page, '3_undone');
    await page.getByRole('button', { name: 'Done', exact: true }).first().click(); await wait(1500);
    console.log('done', JSON.stringify(await st(page)));
  });
  errs = errs.concat(await run('pens', W, async ({ page, wait }) => {
    console.log('setup0', JSON.stringify(await st(page)));
    await page.evaluate(() => window.__l3.goRoom('g2')); await wait(1500);
    await page.getByRole('button', { name: /^Lane C$/ }).first().click(); await wait(800);
    await page.getByRole('button', { name: /^Remove lane/ }).first().click(); await wait(900);
    console.log('setup removed', JSON.stringify(await st(page)));
    await shot(page, '4_setup_changed');
    await page.getByRole('button', { name: 'Discard changes', exact: true }).click(); await wait(1500);
    console.log('setup discarded', JSON.stringify(await st(page)));
    await shot(page, '5_setup_discarded');
  }));
  console.log('errors', errs.length);
})();
