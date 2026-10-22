// The spacing check's heading and trailing defects (scripts/check-spacing.mjs; rules ledger L33). #264 rebuilt the picker search's
// markup and Health record's Conditions sheet broke out of the gate's scope: the "Recent" heading went from 20px under the search
// field to 0, so it read as the field's tail, and the rows' checkboxes sank 12px below their rows' centres. Fixtures after that
// sheet, broken (#264) and fixed (#268).
import test from 'node:test';
import assert from 'node:assert/strict';
import { playwright } from '../scripts/playwright-path.mjs';
import { auditSpacingPage } from '../scripts/check-spacing.mjs';
import { routeFonts } from '../scripts/font-route.mjs';

// Inline pages load nothing, so the DOM is the whole page: no wait for load, and room for a loaded machine (2026-10-22: two 30 s
// setContent timeouts inside a gate while other sessions' gates ran; passed alone).
const LOAD = { waitUntil: 'domcontentloaded', timeout: 120000 };

const css = `html,body{margin:0;font:16px/1.25 system-ui;background:#fff}
.body{padding:24px 18px}
.search{display:flex;align-items:center;height:48px;border:1px solid #888;border-radius:12px;padding:0 14px}
.search input{border:0;flex:1;font:inherit}
.heading{margin:0;padding:4px 0;font-size:14px;line-height:18px}
.panel{background:#f2f3ee;border-radius:12px}
.row{display:flex;align-items:center;min-height:56px;padding:0 16px}
.row span{flex:1}
.check{width:20px;height:20px;margin:0}`;
// .heading is an h5, bold by default
const page = (body, extra = '') => `<!doctype html><html><head><style>${css}${extra}</style></head><body><div class="body">${body}</div></body></html>`;
const rows = (n = 3) => Array.from({ length: n }, (_, i) => `<label class="row"><span>Condition ${i + 1}</span><input class="check" type="checkbox"></label>`).join('');
// the search, then a section: its heading and the panel it labels (the sheet's structure on main)
const sheet = (gap, extra = '') => page(`<label class="search"><input placeholder="Search all options"></label><section style="margin-top:${gap}px"><h5 class="heading">Recent</h5><div class="panel">${rows()}</div></section>`, extra);

test('a section heading closer to the block above than to the content it labels is a spacing defect', async (t) => {
  let pw;
  try { pw = playwright(); } catch { t.skip('Playwright is not installed'); return; }
  const browser = await pw.chromium.launch();
  try {
    const p = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
    const headings = async (html) => { await p.setContent(html, LOAD); return (await auditSpacingPage(p)).filter((d) => d.check === 'heading'); };
    // #264: the heading right under the search field
    const found = await headings(sheet(0));
    assert.equal(found.length, 1, '#264: "Recent" hugged the search field');
    assert.match(found[0].detail, /the heading "Recent" is \dpx under label\.search and \dpx over the div\.panel it labels/);
    assert.equal((await headings(sheet(6, '.heading{padding:0}'))).length, 1, 'under 8px, whatever is below');
    // #268: 20px under the field, 4px over its panel
    assert.deepEqual(await headings(sheet(20)), [], '#268: the heading belongs to its panel');
    // clearly nearer the block above (by more than 4px) is wrong; about even is not clearly wrong
    assert.equal((await headings(sheet(8, '.heading{padding:4px 0 20px}'))).length, 1, '12px above, 20px below');
    assert.deepEqual(await headings(sheet(10, '.heading{padding:4px 0 14px}')), [], '14px above, 14px below');
    assert.deepEqual(await headings(sheet(16, '.heading{padding:4px 0 12px}')), [], '20px above, 12px below');
    // plain text under a field is its hint, not a heading
    assert.deepEqual(await headings(sheet(6, '.heading{font-weight:400}')), [], 'a plain hint');
    // a heading under prose, or one with nothing it labels below, is not one
    assert.deepEqual(await headings(page('<p style="margin:0">A note.</p><h5 class="heading">Recent</h5><div class="panel">' + rows() + '</div>')), [], 'under a paragraph');
    assert.deepEqual(await headings(page('<label class="search"><input></label><h5 class="heading">Recent</h5>')), [], 'labels nothing');
  } finally { await browser.close(); }
});

test("a row's trailing control off its row's centre is a spacing defect", async (t) => {
  let pw;
  try { pw = playwright(); } catch { t.skip('Playwright is not installed'); return; }
  const browser = await pw.chromium.launch();
  try {
    // bundle.css @imports Google Fonts: serve them from vendor/fonts/, so a network blip can't fail the style tag (twice, 2026-10-22)
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await routeFonts(context, process.cwd());
    const p = await context.newPage();
    const trailing = async (html) => { await p.setContent(html, LOAD); return (await auditSpacingPage(p)).filter((d) => d.check === 'trailing'); };
    // #264: the field rule's 48px min-height reached the checkboxes, so each sat 14px low in its 56px row
    const found = await trailing(sheet(20, '.check{position:relative;top:14px}'));
    assert.equal(found.length, 3, '#264: every row');
    assert.match(found[0].detail, /input\.check sits 14px below the centre of its 56px label\.row/);
    assert.deepEqual(await trailing(sheet(20)), [], '#268: centred');
    assert.deepEqual(await trailing(sheet(20, '.check{position:relative;top:5px}')), [], '5px off is a few pixels, not a defect');
    // a chevron, a switch, and a row too short to judge
    assert.equal((await trailing(page('<div class="panel"><a class="row" href="#"><span>Breathing</span><i class="row-chevron" style="width:15px;height:15px;margin-top:30px;background:#888"></i></a></div>'))).length, 1, 'a low chevron');
    assert.deepEqual(await trailing(page('<div class="panel"><a class="row" href="#"><span>Breathing</span><i class="row-chevron" style="width:15px;height:15px;background:#888"></i></a></div>')), [], 'a centred chevron');
    assert.equal((await trailing(page('<div class="panel"><label class="row" style="align-items:flex-start;padding-top:4px"><span>Alerts</span><span role="switch" style="flex:none;width:40px;height:24px;background:#888"></span></label></div>'))).length, 1, 'a switch at the top of its row');
    // the shared ChoiceList's navigation row, from its own generated markup: its chevron is a bare svg in .st-choice-trail (Codex review)
    {
      await p.setContent('<!doctype html><html><head></head><body><div id="m" style="padding:24px 18px"></div></body></html>', LOAD);
      await p.addStyleTag({ path: 'ux/design-system/tokens.css' });
      await p.addStyleTag({ path: 'ux/design-system/components/bundle.css' });
      await p.addScriptTag({ path: 'ux/design-system/components/bundle.js' });
      const nav = async (extra) => {
        await p.evaluate((x) => { document.getElementById('m').innerHTML = '<div class="st-choice-group">' + window.SentriUI.choiceRow({ label: 'Breathing', mode: 'navigate', action: 'condition-level', value: 'Breathing' }) + '</div>'; const s = document.createElement('style'); s.textContent = x; document.head.appendChild(s); }, extra);
        return (await auditSpacingPage(p)).filter((d) => d.check === 'trailing');
      };
      assert.deepEqual(await nav(''), [], 'the shared navigation row, centred');
      assert.equal((await nav('.st-choice-trail svg{position:relative;top:14px}')).length, 1, 'the shared navigation row, its chevron 14px low');
    }
    assert.deepEqual(await trailing(page('<div class="panel"><label class="row" style="min-height:40px;align-items:flex-start"><span>Short</span><input class="check" type="checkbox"></label></div>')), [], 'a row under 44px is not judged');
  } finally { await browser.close(); }
});
