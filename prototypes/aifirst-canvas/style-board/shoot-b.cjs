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
    await load(url);
    await page.screenshot({ path: path.join(shots, 'board.png'), fullPage: true });
    const assert = require('node:assert/strict');
    await page.locator('[data-open="pick"]').click();
    await page.getByRole('checkbox', { name: 'Pick C07', exact: true }).last().check();
    assert.equal(await page.locator('#overlay-stage .picked-count').textContent(), '5 of 6 picked');
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#overlay-stage .frame').getAttribute('data-frame'), 'filled');
    await page.locator('#overlay-stage .apply-method').click();
    assert.equal(await page.locator('#overlay-stage .method-control span').textContent(), 'Intramuscular');
    assert.equal(await page.locator('#overlay-stage .agent-comment').count(), 0);
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#overlay-stage .frame').getAttribute('data-frame'), 'running');
    await page.keyboard.press('ArrowLeft');
    assert.equal(await page.locator('#overlay-stage .frame').getAttribute('data-frame'), 'filled');
    await page.locator('#overlay-stage .dismiss-comment').click();
    assert.equal(await page.locator('#overlay-stage .method-control span').textContent(), 'In feed');
    assert.equal(await page.locator('#overlay-stage .has-comment').count(), 0);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#overlay').evaluate(el => el.classList.contains('open')), false);
    await page.getByRole('button', {name:'Whole console', exact:true}).click();
    overflows.push(...await overflow(page));
    await page.setViewportSize({width:1000,height:900});
    assert.equal(await page.locator('.screens').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length), 1);
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const id of ['pick','filled','running']) {
      await load(`${url}?frame=${id}`);
      if(id === 'filled') {
        assert(await page.locator('.agent-comment').evaluate(el => {const b=el.getBoundingClientRect();const scroll=el.closest('.page-scroll').getBoundingClientRect();return b.top>=scroll.top && b.bottom<=scroll.bottom}), 'Comment must be fully above the fold');
        assert.equal(await page.getByRole('button', {name:'Issue treatment',exact:true}).isEnabled(), true);
      }
      await page.screenshot({ path: path.join(shots, `${id}.png`) });
      if (id === 'pick') {
        await page.getByRole('checkbox', {name:'Pick C07',exact:true}).check();
        assert.equal(await page.locator('.picked-count').textContent(), '5 of 6 picked');
        assert.equal(await page.locator('.save-picked').textContent(), '5 sows picked');
        await page.screenshot({path:path.join(shots,'pick-five.png')});
        await page.getByRole('checkbox', {name:'Pick C07',exact:true}).uncheck();
        assert.equal(await page.locator('.picked-count').textContent(), '4 of 6 picked');
        await page.getByRole('button', {name:'Clear',exact:true}).click();
        assert.equal(await page.locator('.save-picked').textContent(), '0 sows picked');
        await page.getByRole('button', {name:'Pick all',exact:true}).click();
        assert.equal(await page.locator('.picked-count').textContent(), '6 of 6 picked');
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
