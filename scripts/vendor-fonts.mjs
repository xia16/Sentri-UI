// Downloads every Google Fonts stylesheet the prototypes link, and the font files they name, into vendor/fonts/, so screenshots
// and checks render the real typefaces without the network (scripts/font-route.mjs serves them). Both families are open-licensed
// (Plus Jakarta Sans and IBM Plex Mono, SIL Open Font License). Rerun when a page links a new font URL.
// Usage: node scripts/vendor-fonts.mjs        (uses curl, which goes through the system proxy where Node's fetch may not)
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'vendor', 'fonts');
// Chromium's own user agent: Google serves woff2 to it, the format the screenshots' browser asks for.
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const curl = (url, file) => {
  const r = spawnSync('curl', ['-sSfL', '--ssl-no-revoke', '--retry', '3', '-m', '60', '-A', UA, '-o', file, url], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`curl ${url}: ${r.stderr.trim()}`);
};

const urls = new Set();
(function scan(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'vendor', 'archive'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) scan(p);
    else if (/\.(html|css|js|mjs)$/.test(e.name)) for (const m of fs.readFileSync(p, 'utf8').matchAll(/https:\/\/fonts\.googleapis\.com\/css2\?[^"' )`]+/g)) urls.add(m[0].replace(/&amp;/g, '&'));
  }
})(path.join(root, 'ux'));

fs.mkdirSync(path.join(out, 'css'), { recursive: true });
fs.mkdirSync(path.join(out, 'files'), { recursive: true });
const manifest = { css: {}, files: {} };
for (const url of [...urls].sort()) {
  const name = createHash('sha1').update(url).digest('hex').slice(0, 12) + '.css';
  curl(url, path.join(out, 'css', name));
  manifest.css[url] = `css/${name}`;
  for (const m of fs.readFileSync(path.join(out, 'css', name), 'utf8').matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)) {
    const f = m[1];
    if (manifest.files[f]) continue;
    const file = createHash('sha1').update(f).digest('hex').slice(0, 12) + path.extname(new URL(f).pathname);
    if (!fs.existsSync(path.join(out, 'files', file))) curl(f, path.join(out, 'files', file));
    manifest.files[f] = `files/${file}`;
  }
}
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n');
console.log(`vendored ${Object.keys(manifest.css).length} stylesheets and ${Object.keys(manifest.files).length} font files into vendor/fonts/`);
