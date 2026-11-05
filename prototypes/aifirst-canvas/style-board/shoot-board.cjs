// PW=/path/to/playwright node style-board/shoot-board.cjs
// OFFLINE=1 also disables connectivity and aborts every non-file request.
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PW || 'playwright');
const offline = process.env.OFFLINE === '1';
const root = __dirname;
const url = pathToFileURL(path.join(root, 'treatment-style-board.html')).href;
const shots = path.join(root, 'shots');
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
    // Exercise the same full-size viewer used by the owner, including keyboard stepping.
    await page.locator('[data-open="Aa"]').click();
    for (const id of ['Aa','Ab','Ba','Bb','Ca','Cb','Da','Db']) {
      if (await page.locator('#overlay-stage .frame').getAttribute('data-frame') !== id) throw new Error(`Viewer navigation: expected ${id}`);
      await page.keyboard.press('ArrowRight');
    }
    await page.keyboard.press('ArrowLeft');
    if (await page.locator('#overlay-stage .frame').getAttribute('data-frame') !== 'Db') throw new Error('Viewer previous navigation failed');
    await page.keyboard.press('Escape');
    if (await page.locator('#overlay').evaluate(el => el.classList.contains('open'))) throw new Error('Viewer did not close');
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const letter of ['A','B','C','D']) for (const screen of ['a','b']) {
      const id = letter + screen;
      await load(`${url}?frame=${id}`);
      await page.screenshot({ path: path.join(shots, `${id}.png`) });
      // Check the full scrolling document too, including content below the screenshot.
      const scroller = page.locator('.right-pane .page-scroll');
      await scroller.evaluate(el => { el.scrollTop = el.scrollHeight; });
      overflows.push(...await overflow(page));
      const docOverflow = await page.evaluate(() => document.documentElement.scrollWidth > 1441);
      if (docOverflow) overflows.push({ frame: id, text: 'Document horizontal overflow' });
    }
    if (overflows.length) console.error(JSON.stringify(overflows, null, 2));
  } finally {
    await browser.close();
    console.log(`errors ${errors}`);
    console.log(`overflow ${overflows.length}`);
  }
  if (errors || overflows.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
