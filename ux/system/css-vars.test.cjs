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
