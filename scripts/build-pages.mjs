// Builds the GitHub Pages copy of the design site into _site/.
// The site is served at https://<owner>.github.io/<repo>/, not at the domain root, so the root-relative links the prototypes use
// ("/ux/...", "/atlas/...", "/sections/...") are rewritten to carry that base path. The source is untouched: locally,
// `node scripts/serve-ux.cjs` keeps serving from the root as before.
// Usage: node scripts/build-pages.mjs [basePath]   (default: /Sentri-UI)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const base = (process.argv[2] || '/Sentri-UI').replace(/\/$/, '');
const out = path.resolve('_site');
const TEXT = new Set(['.html', '.js', '.mjs', '.cjs', '.css', '.json', '.svg', '.md', '.txt']);
// Only the folders the site links to from the root. Regexes such as /farrow/ or /pregnan/ in the code are left alone.
const ROOTS = ['ux', 'atlas', 'sections'];
const rootLink = new RegExp(`(["'\`(=\\s])/(${ROOTS.join('|')})/`, 'g');

fs.rmSync(out, { recursive: true, force: true });
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
let rewritten = 0;
for (const file of files) {
  if (file.startsWith('.github/')) continue;
  const src = path.resolve(file), dest = path.join(out, file);
  if (!fs.existsSync(src) || !fs.statSync(src).isFile()) continue;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (TEXT.has(path.extname(file).toLowerCase())) {
    const text = fs.readFileSync(src, 'utf8');
    const next = text.replace(rootLink, (_, lead, dir) => `${lead}${base}/${dir}/`);
    if (next !== text) rewritten++;
    fs.writeFileSync(dest, next);
  } else fs.copyFileSync(src, dest);
}
// The site opens on the atlas. No Jekyll: files and folders that start with "_" or "." are served as they are.
fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Sentri design atlas</title><meta http-equiv="refresh" content="0; url=atlas/"><a href="atlas/">Open the Sentri design atlas</a>\n`);
fs.writeFileSync(path.join(out, '.nojekyll'), '');
console.log(`pages: ${files.length} files into _site, ${rewritten} rewritten for base ${base}`);
