// Guard: the atlas draws each [data-state] block of components/<Name>/variants/<id>.html in its own iframe and runs the
// file's top-level scripts in every one of them. A script that looks up another state's element (getElementById, or a
// querySelector for one named state) finds null in the iframes that do not hold that state, throws, and leaves the cell
// blank. A variant page draws either by iterating the states it finds (document.querySelectorAll('[data-state]')) or from a script inside its state that writes to document.currentScript.parentElement.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const components = path.join(__dirname, '../design-system/components');
const ALLOW = [];   // 'Name/variants/id.html' entries only for a file that genuinely needs a lookup; none today

const pages = [];
for (const entry of fs.readdirSync(components, { withFileTypes: true })) {
  const dir = path.join(components, entry.name, 'variants');
  if (!entry.isDirectory() || !fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) if (f.endsWith('.html')) pages.push({ rel: `${entry.name}/variants/${f}`, file: path.join(dir, f) });
}

test('there are variant pages to check', () => {
  assert.ok(pages.length > 40, `found ${pages.length}`);
});

for (const { rel, file } of pages) {
  if (ALLOW.includes(rel)) continue;
  test(`${rel}: draws by iterating [data-state], never by looking one up`, () => {
    const html = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(html, /getElementById/, 'getElementById returns null in the iframes that hold other states');
    assert.doesNotMatch(html, /querySelector\(\s*['"`](?:#|\[data-state\s*=)/, 'querySelector for one named state returns null in the other states\' iframes');
    const scripted = /<script[\s>]/i.test(html.replace(/<script[^>]*\ssrc=[^>]*><\/script>/gi, ''));
    const iterates = /querySelectorAll\(\s*['"`]\[data-state\]['"`]\s*\)/.test(html) || /document\.currentScript/.test(html);
    if (scripted) assert.ok(iterates, "scripts must iterate document.querySelectorAll('[data-state]') or sit inside their state and use document.currentScript");
  });
}
