import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { routeFonts } from '../../../scripts/font-route.mjs';
import { playwright } from '../../../scripts/playwright-path.mjs';

const source = new URL('./', import.meta.url);
const root = fileURLToPath(new URL('../../../', source));
const origin = process.argv[2] || 'http://127.0.0.1:4319';
const browser = await playwright().chromium.launch();
const output = new URL('screenshots/', source);
await fs.mkdir(output, { recursive: true });

try {
  for (const width of [390, 360]) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
    await routeFonts(context, root);
    const page = await context.newPage();
    page.setDefaultTimeout(5000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const open = async params => {
      await page.goto(origin + '/features/inspection/move-picker-round/mock.html?' + params);
      await page.evaluate(() => document.fonts.ready);
    };
    const action = key => page.locator(`[data-action="${key}"]:not([inert] *)`);
    const shot = async name => {
      const phone = page.locator('.phone');
      const overflow = await phone.locator('.sheet:not([inert]) > .sheet-body').evaluateAll(bodies =>
        bodies.some(body => body.scrollWidth > body.clientWidth + 1));
      assert.equal(overflow, false, name + ': sheet body fits width ' + width);
      if (width === 390) await phone.screenshot({
        path: fileURLToPath(new URL(name + '.jpg', output)), type: 'jpeg', quality: 88, animations: 'disabled'
      });
    };

    await open('option=a');
    assert.ok(await action('confirm').isDisabled());
    await shot('a-start');
    await action('map').click();
    const whole = page.locator('.sheet-footer .st-pen-whole-toggle');
    await whole.click();
    await shot('a-whole');
    await page.locator('.st-pen-group[data-from="C11"]').click();
    const pen = page.locator('.st-pen-tile[data-pen="C12"]');
    await pen.scrollIntoViewIfNeeded();
    await shot('a-pens');
    assert.ok(await page.locator('.st-pen-tile[data-pen="C1"]').isDisabled());
    await pen.click();
    assert.ok(await action('confirm').isEnabled());
    await shot('a-review');
    await action('map').click();
    assert.equal(await pen.getAttribute('aria-pressed'), 'true');
    await action('close-map').last().click();
    assert.match(await action('map').innerText(), /C12/);

    await open('option=b');
    const search = page.locator('[data-mock-search]');
    await search.fill('C12');
    await search.blur();
    await shot('b-search');
    await action('map').click();
    await shot('b-map');
    await action('close-map').last().click();
    assert.equal(await search.inputValue(), 'C12');
    await action('pen').click();
    assert.match(await action('search').innerText(), /Unit 7 · C12/);
    await shot('b-review');
    await action('search').click();
    await action('rooms').click();
    await action('room').filter({ hasText: 'Unit 8' }).click();
    await action('back').click();
    assert.match(await action('search').innerText(), /Unit 7 · C12/);
    await action('search').click();
    await action('rooms').click();
    await action('room').filter({ hasText: 'Unit 8' }).click();
    assert.equal(await search.inputValue(), '');
    await search.fill('B3');
    await action('pen').click();
    assert.match(await action('search').innerText(), /Unit 8 · B3/);

    await open('option=a&outside=1');
    await shot('outside-review');
    await action('map').click();
    assert.equal(await page.getByRole('dialog').count(), 1);
    await action('close-map').last().click();
    await action('confirm').click();
    assert.match(await page.locator('.st-toast').innerText(), /目标栏已满/);
    assert.match(await action('map').innerText(), /Unit 7 · C12/);
    await shot('outside-error');
    assert.deepEqual(errors, []);
    console.log(width + ' × 844：两套选栏、整栋、改选目的栏和报错回到核对均通过');
    await context.close();
  }
} finally {
  await browser.close();
}
