// The spacing check's sideways defect (scripts/check-spacing.mjs; rules ledger L28). #207: the medicine and condition pickers'
// lists scrolled 21px sideways, because the sticky search bled past the list that scrolled it. Shots are taken at scroll offset
// 0, so no pixel pair could show it: the check reads it from the layout. A row meant to scroll sideways (a chip track) is not one.
import test from 'node:test';
import assert from 'node:assert/strict';
import { playwright } from '../scripts/playwright-path.mjs';
import { auditSpacingPage } from '../scripts/check-spacing.mjs';

const page = (body) => `<!doctype html><html><head><style>html,body{margin:0}.box{width:354px;margin:0 18px;scrollbar-width:none}</style></head><body>${body}</body></html>`;
const rows = '<p style="margin:0;height:40px">Row</p>'.repeat(20);
// the picker before #207: a vertical list that scrolls, holding a search that bleeds 21px past it on both sides
const bleed = '<label style="display:block;margin:0 -21px;padding:0 21px"><input style="width:100%;box-sizing:border-box"></label>';
const chips = '<span style="flex:none;width:120px;height:40px">Chip</span>'.repeat(5);

test('a scroll container that scrolls sideways is a spacing defect unless its content is a row; a clipped one is not', async (t) => {
  let pw;
  try { pw = playwright(); } catch { t.skip('Playwright is not installed'); return; }
  const browser = await pw.chromium.launch();
  try {
    const p = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
    const sideways = async (html) => { await p.setContent(html); return (await auditSpacingPage(p)).filter((d) => d.check === 'sideways'); };
    // the case it came from: a vertical list (overflow-y: auto makes overflow-x auto too) with a bleeding child
    const found = await sideways(page(`<div class="box" style="height:300px;overflow-y:auto">${bleed}${rows}</div>`));
    assert.equal(found.length, 1, '#207: the picker list scrolled 21px sideways');
    assert.match(found[0].detail, /scrolls 21px sideways/);
    assert.equal((await sideways(page(`<div class="box" style="height:300px;overflow:auto;display:flex;flex-direction:column">${bleed}${rows}</div>`))).length, 1, 'a column flex list is not a row');
    assert.equal((await sideways(page(`<div class="box" style="overflow-x:auto;display:flex;flex-wrap:wrap">${chips}<div style="flex:none;width:400px;height:10px"></div></div>`))).length, 1, 'a wrapping flex is not a track');
    // fixed: #207 clips the bleed
    assert.deepEqual(await sideways(page(`<div class="box" style="height:300px;overflow-y:auto;overflow-x:hidden">${bleed}${rows}</div>`)), [], '#207 fixed: overflow-x hidden');
    assert.deepEqual(await sideways(page(`<div class="box" style="height:300px;overflow-y:auto">${rows}</div>`)), [], 'nothing reaches past the list');
    // tracks meant to scroll sideways
    assert.deepEqual(await sideways(page(`<div class="box" style="overflow-x:auto;display:flex;gap:8px">${chips}</div>`)), [], 'a chip track: a flex row that does not wrap');
    assert.deepEqual(await sideways(page(`<div class="box" style="overflow-x:auto;display:grid;grid-auto-flow:column;grid-auto-columns:120px">${chips}</div>`)), [], 'a grid flowing in columns');
    assert.deepEqual(await sideways(page(`<div class="box" style="overflow-x:auto;white-space:nowrap">${'A long line of text that does not wrap. '.repeat(4)}</div>`)), [], 'text that does not wrap');
  } finally { await browser.close(); }
});
