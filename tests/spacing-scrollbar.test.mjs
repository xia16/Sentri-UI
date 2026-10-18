// The spacing check's scrollbar defect (scripts/check-spacing.mjs; rules ledger L27). #197: the Farrowing room list had
// `scrollbar-width: thin`, so on a desktop (the atlas) a scrollbar took 10px once the list overflowed and the list jumped
// sideways. Headless shots hide scrollbars, so no pixel pair could show it: the check reads it from the styles.
import test from 'node:test';
import assert from 'node:assert/strict';
import { playwright } from '../scripts/playwright-path.mjs';
import { auditSpacingPage } from '../scripts/check-spacing.mjs';

const list = (style, rows = 30) => `<div class="list" style="height:200px;${style}">${'<p style="margin:0;height:40px">Row</p>'.repeat(rows)}</div>`;
const page = (body, css = '') => `<!doctype html><html><head><style>html,body{margin:0}${css}</style></head><body>${body}</body></html>`;

test('a scroll container that shows a desktop scrollbar is a spacing defect; a hidden one, or one that does not overflow, is not', async (t) => {
  let pw;
  try { pw = playwright(); } catch { t.skip('Playwright is not installed'); return; }
  const browser = await pw.chromium.launch();
  try {
    const p = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
    const scrollbars = async (html) => { await p.setContent(html); return (await auditSpacingPage(p)).filter((d) => d.check === 'scrollbar'); };
    // the case it came from: thin is still a scrollbar that takes width
    assert.equal((await scrollbars(page(list('overflow-y:auto;scrollbar-width:thin')))).length, 1, '#197: scrollbar-width: thin');
    assert.equal((await scrollbars(page(list('overflow-y:auto')))).length, 1, 'the default scrollbar');
    assert.equal((await scrollbars(page(list('overflow-y:scroll', 1)))).length, 1, 'overflow: scroll reserves its scrollbar even when nothing overflows');
    // fixed: hidden by the standard property, or by the WebKit pseudo-element
    assert.deepEqual(await scrollbars(page(list('overflow-y:auto;scrollbar-width:none'))), [], '#197 fixed: scrollbar-width: none');
    assert.deepEqual(await scrollbars(page(list('overflow-y:auto'), '.list::-webkit-scrollbar{display:none}')), [], '::-webkit-scrollbar hidden');
    // nothing to scroll: no scrollbar shows
    assert.deepEqual(await scrollbars(page(list('overflow-y:auto', 2))), [], 'auto that does not overflow');
  } finally { await browser.close(); }
});
