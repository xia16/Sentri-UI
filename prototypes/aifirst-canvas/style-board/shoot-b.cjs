// PW=/path/to/playwright node style-board/shoot-b.cjs
// OFFLINE=1 also disables connectivity and aborts every non-file request.
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PW || 'playwright');
const offline = process.env.OFFLINE === '1';
const root = __dirname;
const url = pathToFileURL(path.join(root, 'treatment-b.html')).href;
const shots = path.join(root, 'shots-b');
async function overflow(page) {
  return page.evaluate(() => [...document.querySelectorAll('.frame')].flatMap(frame => {
    const bounds = frame.getBoundingClientRect();
    const scale = bounds.width / 1440;
    return [...frame.querySelectorAll('*')].filter(el => {
      if (!el.getClientRects().length) return false;
      const box = el.getBoundingClientRect();
      return el.scrollWidth > el.clientWidth + 1 || box.right > bounds.right + scale;
    }).map(el => ({ frame: frame.dataset.frame, tag: el.tagName, class: el.className, text: el.textContent.trim().slice(0, 80), width: el.clientWidth, scroll: el.scrollWidth }));
  }));
}
(async () => {
  fs.mkdirSync(shots, { recursive: true });
  const browser = await chromium.launch();
  let errors = 0;
  const overflows = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1, offline });
    if (offline) await context.route('**/*', route => route.request().url().startsWith('file:') ? route.continue() : route.abort());
    const page = await context.newPage();
    page.on('console', message => { if (message.type() === 'error') { errors++; console.error(message.text()); } });
    page.on('pageerror', error => { errors++; console.error(error.message); });
    async function load(target) {
      await page.goto(target, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(150);
      overflows.push(...await overflow(page));
    }
    const assert = require('node:assert/strict');
    async function assertPicker(scope) {
      assert.equal(await scope.locator('.picker-table').count(), 1);
      assert.equal(await scope.locator('.pick-all').evaluate(el => el.indeterminate), true);
      assert.equal(await scope.locator('[data-pig]:checked').count(), 4);
      assert.equal(await scope.locator('.picked-count').textContent(), '4 of 6 picked');
      assert.equal(await scope.locator('.filters').evaluate(el => {
        const boxes = [...el.children].map(c => c.getBoundingClientRect());
        return boxes.every(b => Math.abs(b.top - boxes[0].top) < 1);
      }), true, 'Filters must stay in one row');
      assert.deepEqual(await scope.locator('.picker-table tbody tr').evaluateAll(rows => rows.map(r => r.getBoundingClientRect().height)), Array(6).fill(48));
    }
    await load(url);
    assert.equal(await page.locator('.screens').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length), 2);
    await page.screenshot({ path: path.join(shots, 'board.png'), fullPage: true });
    await page.locator('[data-open="pick"]').click();
    const overlay = page.locator('#overlay-stage');
    await assertPicker(overlay);
    await overlay.getByRole('cell', { name: 'C07', exact: true }).click();
    assert.equal(await overlay.locator('.picked-count').textContent(), '5 of 6 picked');
    await overlay.getByRole('button', { name: 'Continue with 5 sows', exact: true }).click();
    assert.equal(await overlay.locator('.frame').getAttribute('data-frame'), 'form');
    assert.equal(await overlay.locator('.pig-source').textContent(), '5 sows · Gestation 2');
    await overlay.getByRole('textbox', {name:'Notes',exact:true}).fill('Keep on straw');
    await overlay.getByRole('button', {name:'Change pigs',exact:true}).click();
    assert.equal(await overlay.locator('[data-pig]:checked').count(), 5);
    await overlay.getByRole('checkbox', {name:'Pick C12',exact:true}).check();
    await overlay.getByRole('button', {name:'Cancel',exact:true}).click();
    assert.equal(await overlay.getByRole('textbox', {name:'Notes',exact:true}).inputValue(), 'Keep on straw');
    assert.equal(await overlay.locator('.pig-chips .badge').count(), 5);
    await page.keyboard.press('ArrowRight');
    assert.equal(await overlay.locator('.frame').getAttribute('data-frame'), 'filled');
    await overlay.getByRole('button', {name:'Change pigs',exact:true}).click();
    await assertPicker(overlay);
    await overlay.getByRole('button', {name:'Continue with 4 sows',exact:true}).click();
    assert.equal(await overlay.locator('.frame').getAttribute('data-frame'), 'filled');
    await overlay.locator('.apply-method').click();
    assert.equal(await overlay.locator('.method-control span').textContent(), 'Intramuscular');
    assert.equal(await overlay.locator('.agent-comment').count(), 0);
    await page.keyboard.press('ArrowRight');
    assert.equal(await overlay.locator('.frame').getAttribute('data-frame'), 'running');
    await page.keyboard.press('ArrowLeft');
    await overlay.locator('.dismiss-comment').click();
    assert.equal(await overlay.locator('.method-control span').textContent(), 'In feed');
    assert.equal(await overlay.locator('.has-comment').count(), 0);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#overlay').evaluate(el => el.classList.contains('open')), false);
    await page.getByRole('button', {name:'Whole console',exact:true}).click();
    overflows.push(...await overflow(page));
    await page.setViewportSize({width:1000,height:900});
    assert.equal(await page.locator('.screens').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length), 1);
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const id of ['pick','form','filled','running']) {
      await load(`${url}?frame=${id}`);
      if(id === 'filled') {
        assert(await page.locator('.agent-comment').evaluate(el => {const b=el.getBoundingClientRect();const scroll=el.closest('.page-scroll').getBoundingClientRect();return b.top>=scroll.top && b.bottom<=scroll.bottom}), 'Comment must be fully above the fold');
        assert.equal(await page.getByRole('button', {name:'Issue treatment',exact:true}).isEnabled(), true);
      }
      if(id === 'form') {
        assert.equal(await page.locator('.vet-credit,.agent-comment').count(), 0);
        assert.equal(await page.locator('.method-control span').textContent(), 'Intramuscular');
        assert.equal(await page.getByRole('spinbutton', {name:'Dose',exact:true}).inputValue(), '');
        assert.equal(await page.locator('.pig-source').textContent(), '4 sows · Gestation 2');
      }
      await page.screenshot({ path: path.join(shots, `${id}.png`) });
      if (id === 'pick') {
        await assertPicker(page);
        await page.getByRole('checkbox', {name:'Pick C07',exact:true}).check();
        assert.equal(await page.locator('.picked-count').textContent(), '5 of 6 picked');
        assert.equal(await page.locator('.continue-pigs').textContent(), 'Continue with 5 sows');
        await page.screenshot({path:path.join(shots,'pick-five.png')});
        await page.locator('.pick-all').check();
        assert.equal(await page.locator('.picked-count').textContent(), '6 of 6 picked');
        assert.equal(await page.locator('.pick-all').evaluate(el => el.indeterminate), false);
        await page.locator('.pick-all').uncheck();
        assert.equal(await page.locator('.picked-count').textContent(), '0 of 6 picked');
        assert.equal(await page.locator('.continue-pigs').textContent(), 'Pick at least one pig');
        assert.equal(await page.locator('.continue-pigs').isDisabled(), true);
        await page.getByRole('cell', {name:'B15',exact:true}).click();
        assert.equal(await page.locator('.continue-pigs').textContent(), 'Continue with 1 sow');
        await page.locator('.continue-pigs').click();
        assert.equal(new URL(page.url()).searchParams.get('frame'), 'form');
        assert.equal(await page.locator('.pig-source').textContent(), '1 sow · Gestation 2');
        await page.getByRole('button', {name:'Change pigs',exact:true}).click();
        assert.equal(new URL(page.url()).searchParams.get('frame'), 'pick');
        assert.equal(await page.locator('[data-pig]:checked').count(), 1);
        await page.getByRole('button', {name:'New treatment',exact:true}).click();
        assert.equal(await page.locator('.frame').getAttribute('data-frame'), 'form');
      }
      if (id === 'filled') {
        await page.getByRole('button', {name:'Use intramuscular',exact:true}).click();
        assert.equal(await page.locator('.method-control span').textContent(), 'Intramuscular');
        assert.equal(await page.locator('.has-comment,.agent-comment').count(), 0);
        await page.screenshot({path:path.join(shots,'filled-applied.png')});
        await load(`${url}?frame=filled`);
        await page.getByRole('button', {name:'Dismiss',exact:true}).click();
        assert.equal(await page.locator('.method-control span').textContent(), 'In feed');
        assert.equal(await page.locator('.has-comment,.agent-comment').count(), 0);
        await page.getByRole('button', {name:'Change pigs',exact:true}).click();
        await assertPicker(page);
        await page.getByRole('button', {name:'Cancel',exact:true}).click();
        assert.equal(await page.locator('.frame').getAttribute('data-frame'), 'filled');
      }
      const scroller = page.locator('.right-pane .page-scroll');
      await scroller.evaluate(el => { el.scrollTop = el.scrollHeight; });
      overflows.push(...await overflow(page));
      if(await page.evaluate(() => document.documentElement.scrollWidth > 1441)) overflows.push({ frame:id,text:'Document horizontal overflow' });
    }
    if (overflows.length) console.error(JSON.stringify(overflows, null, 2));
  } finally {
    await browser.close();
    console.log(`errors ${errors}`);
    console.log(`overflow ${overflows.length}`);
  }
  if (errors || overflows.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
