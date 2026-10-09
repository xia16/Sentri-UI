// Guard: every var(--x) a stylesheet reads is a token or is defined in the same file.
// A misspelt or retired token silently falls back to nothing (a transparent fill, a zero gap), so it never shows as an error.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (p) => fs.readFileSync(p, 'utf8');
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const tokens = stripComments(read(path.join(__dirname, '../design-system/tokens.css')));
const defined = (css) => new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
const tokenNames = defined(tokens);

/* Set inline on an element by the screen's script (style="--x:…" or el.style.setProperty), never in a stylesheet,
   so no file can define them. Keep this list short: add a name only when a script writes it. */
const INLINE_SET = [
  /^--tk-/,              // TaskSkeleton parts: per-instance sizes and tones written into style="" by task-skeleton.js
  /^--from$/, /^--to$/,  // sheet and motion transitions: the start and end offsets are written per animation
  /^--status-count$/,    // Farrowing metrics: the number of columns, written into style="" by the screen
  /^--st-context-bg$/,   // set by bundle.css on [data-st-context]; a page stylesheet only reads it inside such a context
];

const files = [
  path.join(__dirname, '../design-system/components/bundle.css'),
  ...fs.readdirSync(__dirname).filter((n) => n.endsWith('.css')).map((n) => path.join(__dirname, n)),
];

/* Component preview and variant pages carry their own <style>; the atlas injects tokens.css and bundle.css beside it,
   so a page may read either. Button's specimens used an undefined --space-1 because only .css files were checked. */
const componentsDir = path.join(__dirname, '../design-system/components');
const bundleNames = defined(stripComments(read(path.join(componentsDir, 'bundle.css'))));
const pages = fs.readdirSync(componentsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).flatMap((d) => {
  const dir = path.join(componentsDir, d.name);
  const variants = path.join(dir, 'variants');
  return [
    ...(fs.existsSync(path.join(dir, 'preview.html')) ? [path.join(dir, 'preview.html')] : []),
    ...(fs.existsSync(variants) ? fs.readdirSync(variants).filter((n) => n.endsWith('.html')).map((n) => path.join(variants, n)) : []),
  ];
});
for (const file of pages) {
  const name = path.relative(componentsDir, file).split(path.sep).join('/');
  test(`components/${name}: every var(--x) is a token, a bundle property or defined on the page`, () => {
    const css = stripComments(read(file));
    const own = defined(css);
    const missing = new Set();
    for (const m of css.matchAll(/var\(\s*(--[\w-]+)\s*([,)])/g)) {
      const [, prop, after] = m;
      if (after === ',') continue;
      if (tokenNames.has(prop) || bundleNames.has(prop) || own.has(prop) || INLINE_SET.some((re) => re.test(prop))) continue;
      missing.add(prop);
    }
    assert.deepEqual([...missing].sort(), [], 'undefined custom properties on a component page');
  });
}

for (const file of files) {
  const name = path.relative(path.join(__dirname, '..'), file).split(path.sep).join('/');
  test(`${name}: every var(--x) is a token or defined in the file`, () => {
    const css = stripComments(read(file));
    const own = defined(css);
    const missing = new Set();
    for (const m of css.matchAll(/var\(\s*(--[\w-]+)\s*([,)])/g)) {
      const [, prop, after] = m;
      if (after === ',') continue;   // var(--x, fallback) states its own fallback
      if (tokenNames.has(prop) || own.has(prop) || INLINE_SET.some((re) => re.test(prop))) continue;
      missing.add(prop);
    }
    assert.deepEqual([...missing].sort(), [], 'undefined custom properties: define them in tokens.css or the file, or list an inline-set name in INLINE_SET');
  });
}
