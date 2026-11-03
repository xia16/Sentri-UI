// The icon round's usage swaps (swaps.json) and registry additions (icons.js), as text patches.
// The canvas mock applies them to served files in memory; after the owner agrees, `node review/icon-round/swaps.mjs --write`
// applies the usage swaps to the files on disk. `--check` only reports what would change.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = path.dirname(fileURLToPath(import.meta.url));
export const swaps = JSON.parse(fs.readFileSync(path.join(here, 'swaps.json'), 'utf8'));
const box = {};
vm.runInNewContext(fs.readFileSync(path.join(here, 'icons.js'), 'utf8'), box);
export const next = box.SentriIconsNext;

// Applies every swap for one repo-relative file; throws if a swap finds nothing, so a moved string never passes silently.
export function patchFile(rel, text) {
  let n = 0;
  for (const s of swaps.filter((x) => x.file === rel)) {
    const find = [].concat(s.find).find((f) => text.includes(f));
    if (text.includes(s.replace)) continue; // already applied (an insert keeps its find, so test the replacement first)
    if (!find) throw new Error(`${rel}: not found: ${[].concat(s.find)[0]}`);
    text = s.all ? text.split(find).join(s.replace) : text.replace(find, s.replace);
    n++;
  }
  return { text, n };
}

// The bundle with the proposed registry: new and redrawn paths win over the old ones, and the old names become aliases.
export function patchBundle(text) {
  const entries = Object.entries(next.paths).map(([k, v]) => `    ${/-/.test(k) ? `'${k}'` : k}:'${v}'`).join(',\n');
  const end = text.indexOf('\n  };', text.indexOf('const paths={'));
  text = text.slice(0, end) + ',\n' + entries + text.slice(end);
  return text.replace("const aliases=Object.freeze({origin:'place',arrow:'chevron',condition:'plus'})",
    `const aliases=Object.freeze({origin:'place',arrow:'chevron',condition:'plus',${Object.entries(next.aliases).map(([a, b]) => `${a}:'${b}'`).join(',')}})`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const write = process.argv.includes('--write');
  for (const rel of [...new Set(swaps.map((s) => s.file))]) {
    const before = fs.readFileSync(rel, 'utf8');
    const { text, n } = patchFile(rel, before);
    if (write && text !== before) fs.writeFileSync(rel, text);
    console.log(`${write ? 'wrote' : 'would change'} ${rel}: ${n} swaps`);
  }
}
