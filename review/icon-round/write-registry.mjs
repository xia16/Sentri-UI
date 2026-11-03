// Writes the icon round's agreed paths (icons.js `paths`) into SentriIcons in the design-system bundle: redrawn names get the new
// path, new names are appended, and return / up become aliases of undo / back-chevron. Safe to rerun.
// Usage (from the repo root): node review/icon-round/write-registry.mjs
import fs from 'node:fs';
import vm from 'node:vm';

const file = 'ux/design-system/components/bundle.js';
let s = fs.readFileSync(file, 'utf8');
const box = {};
vm.runInNewContext(fs.readFileSync('review/icon-round/icons.js', 'utf8'), box);
const next = box.SentriIconsNext.paths;
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\'-]/g, '\\$&');
const key = (k) => (k.includes('-') ? `'${k}'` : k);

const start = s.indexOf('const paths={'), end = s.indexOf('\n  };', start);
let block = s.slice(start, end).replace(/\r$/, ''); // a CRLF checkout leaves the last line's \r before "\n  };"
const replaced = [], added = [];
for (const [k, v] of Object.entries(next)) {
  const re = new RegExp(`((?:^|[{,\\s])${esc(key(k))}:)'[^']*'`);
  if (re.test(block)) { block = block.replace(re, (m, a) => `${a}'${v}'`); replaced.push(k); }
  else added.push(k);
}
block = block.replace(/\r?\n {4}return:'[^']*',/, '').replace(/\r?\n {4}up:'[^']*',/, '');
if (added.length) block += ',\n    // Icon round 2026-11-03 (review/icon-round): farm glyphs that passed the blind naming test.\n' + added.map((k) => `    ${key(k)}:'${next[k]}'`).join(',\n');
s = s.slice(0, start) + block + s.slice(end);
s = s.replace("const aliases=Object.freeze({origin:'place',arrow:'chevron',condition:'plus'});",
  "const aliases=Object.freeze({origin:'place',arrow:'chevron',condition:'plus',return:'undo',up:'back-chevron'});");
// The bundle is checked out with CRLF on Windows: keep one line ending throughout, or git sees the whole file as changed.
const eol = s.includes('\r\n') ? '\r\n' : '\n';
s = s.replace(/\r*\n/g, eol);
fs.writeFileSync(file, s);

const ctx = {};
vm.runInNewContext(s, ctx);
const I = ctx.SentriIcons;
for (const k of Object.keys(next)) if (I.paths[k] !== next[k]) throw new Error('not written: ' + k);
console.log(`replaced ${replaced.join(' ')} | added ${added.join(' ')} | ${Object.keys(I.paths).length} glyphs | return→undo ${I.icon('return') === I.icon('undo')} | up→back-chevron ${I.icon('up') === I.icon('back-chevron')}`);
