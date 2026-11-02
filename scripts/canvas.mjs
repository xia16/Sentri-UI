// The owner's canvas: makes a canvas page self-contained, so it opens anywhere the owner looks (the app's file preview, a
// browser, a phone) with every picture in it. Each <img src="…"> naming a local file becomes a data: URI; remote and data:
// sources are left as they are. A missing picture fails the run, so a canvas never reaches the owner with a blank frame.
// Usage: node scripts/canvas.mjs <canvas.src.html> [<out.html>]   (out defaults to the source name without ".src")
import fs from 'node:fs';
import path from 'node:path';

const [src, outArg] = process.argv.slice(2);
if (!src) { console.error('usage: node scripts/canvas.mjs <canvas.src.html> [<out.html>]'); process.exit(2); }
const out = outArg || src.replace(/\.src\.html$/, '.html');
if (path.resolve(out) === path.resolve(src)) { console.error('the output would overwrite the source: name the source <name>.src.html or pass an output'); process.exit(2); }
const types = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const dir = path.dirname(src), missing = [];
let n = 0;
const html = fs.readFileSync(src, 'utf8').replace(/(<img\b[^>]*?\ssrc=")([^"]+)(")/gi, (all, head, ref, tail) => {
  if (/^(data:|https?:|\/\/)/i.test(ref)) return all;
  const file = path.join(dir, decodeURI(ref)), type = types[path.extname(file).toLowerCase()];
  if (!type || !fs.existsSync(file)) { missing.push(ref); return all; }
  n++;
  return head + `data:${type};base64,` + fs.readFileSync(file).toString('base64') + tail;
});
if (missing.length) { console.error('missing pictures:\n  ' + missing.join('\n  ')); process.exit(1); }
fs.writeFileSync(out, html);
console.log(`${n} pictures inlined → ${out} (${(Buffer.byteLength(html) / 1e6).toFixed(1)} MB)`);
