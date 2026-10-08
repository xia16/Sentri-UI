// Copies the prototype's words (strings.js) into the string registry (ux/laws/strings.json) as `sp.<key>`, one line
// each, so the strict design lint can check every visible string. Run after editing strings.js:
//   node ux/tasks/piglet-processing/simple/register.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const ctx = { location: { search: '' }, localStorage: { getItem: () => null, setItem() {} } };
ctx.globalThis = ctx;
vm.runInNewContext(readFileSync(resolve(here, 'strings.js'), 'utf8'), ctx);
const { EN, ZH } = ctx.PPT;
const file = resolve(here, '../../../laws/strings.json');
const raw = readFileSync(file, 'utf8'), crlf = raw.includes('\r\n');
let text = raw.replace(/\r\n/g, '\n');
// drop the old sp.* lines, then add the current ones before the end of "strings"
text = text.split('\n').filter(l => !/^\s*"sp\.[^"]+": \{/.test(l)).join('\n');
const base = k => k.replace(/\.(0|1)$/, '');
const lines = Object.keys(EN).map(k => `    ${JSON.stringify('sp.' + k)}: {"en": ${JSON.stringify(EN[k])}, "zh": ${JSON.stringify(ZH[k] != null ? ZH[k] : ZH[base(k)])}, "kind": "label"}`);
const end = text.lastIndexOf('\n  }\n}');
if (end < 0) throw new Error('strings.json: the "strings" object is not last');
const head = text.slice(0, end).replace(/,?\s*$/, '');
text = head + ',\n' + lines.join(',\n') + text.slice(end);
JSON.parse(text);   // still valid
writeFileSync(file, crlf ? text.replace(/\n/g, '\r\n') : text);
console.log(`registered ${lines.length} sp.* strings`);
