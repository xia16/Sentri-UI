// Guard: a component's preview.html and variants/*.html run inside the atlas, which loads each one into a srcdoc iframe.
// In a srcdoc document `location` is about:srcdoc, so `new URL(relative)` throws, and a page that builds its own
// srcdoc iframe nests a second document the atlas cannot size or inject tokens into. Button's Overview broke this way.
// A preview calls SentriUI.* directly; the atlas supplies tokens.css, bundle.css and bundle.js.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const components = path.join(__dirname, '../design-system/components');
const pages = [];
for (const entry of fs.readdirSync(components, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const dir = path.join(components, entry.name);
  if (fs.existsSync(path.join(dir, 'preview.html'))) pages.push(path.join(dir, 'preview.html'));
  const variants = path.join(dir, 'variants');
  if (fs.existsSync(variants)) for (const f of fs.readdirSync(variants)) if (f.endsWith('.html')) pages.push(path.join(variants, f));
}

test('there are component previews to check', () => {
  assert.ok(pages.length > 50, `found ${pages.length}`);
});

for (const page of pages) {
  const name = path.relative(components, page).split(path.sep).join('/');
  test(`${name}: no new URL( and no nested srcdoc loader`, () => {
    const html = fs.readFileSync(page, 'utf8');
    assert.doesNotMatch(html, /new\s+URL\s*\(/, 'new URL( throws inside the atlas srcdoc iframe: use a plain relative path or none');
    assert.doesNotMatch(html, /srcdoc/i, 'the atlas already runs this page in a srcdoc iframe: render with SentriUI.* instead of loading another document');
  });
}
