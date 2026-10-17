// Builds the GitHub Pages copy of the design site into _site/.
// The site is served at https://<owner>.github.io/<repo>/, not at the domain root, so the root-relative links the prototypes use
// ("/ux/...", "/atlas/...", "/sections/...") are rewritten to carry that base path. The source is untouched: locally,
// `node scripts/serve-ux.cjs` keeps serving from the root as before.
// Pages cannot read git, so the commits the atlas shows screens from (serve-ux's /@<commit>/ route: approved versions and
// branch layers from atlas/layers.json) are written out as _site/@<commit>/ with that commit's ux/ and atlas/atlas.json.
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
let rewritten = 0;
const rewrite = (file) => {
  if (!TEXT.has(path.extname(file).toLowerCase())) return;
  const text = fs.readFileSync(file, 'utf8'), next = text.replace(rootLink, (_, lead, dir) => `${lead}${base}/${dir}/`);
  if (next !== text) { rewritten++; fs.writeFileSync(file, next); }
};

fs.rmSync(out, { recursive: true, force: true });
// tracked files, plus the generated layers when the build made them
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
if (fs.existsSync('atlas/layers.json') && !files.includes('atlas/layers.json')) files.push('atlas/layers.json');
for (const file of files) {
  if (file.startsWith('.github/')) continue;
  const src = path.resolve(file), dest = path.join(out, file);
  if (!fs.existsSync(src) || !fs.statSync(src).isFile()) continue;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest); rewrite(dest);
}

const commits = new Set();
const atlas = JSON.parse(fs.readFileSync('atlas/atlas.json', 'utf8'));
// The repo's atlas.json carries no build stamps (scripts/build-atlas.mjs); the published copy says when and from which commit it
// was built, for the brand's tooltip (atlas/boot.js).
{
  let commit = ''; try { commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim(); } catch {}
  const site = path.join(out, 'atlas/atlas.json');
  if (fs.existsSync(site)) { const a = JSON.parse(fs.readFileSync(site, 'utf8')); fs.writeFileSync(site, JSON.stringify({ generated: new Date().toISOString(), commit, ...a }, null, 1) + '\n'); }
}
for (const p of atlas.platforms) for (const s of p.sections) for (const f of s.features) for (const c of f.screens) if (c.approval && c.approval.commit) commits.add(c.approval.commit);
if (fs.existsSync('atlas/layers.json')) for (const l of JSON.parse(fs.readFileSync('atlas/layers.json', 'utf8')).layers) commits.add(l.sha);
for (const sha of commits) {
  const dir = path.join(out, '@' + sha);
  try { // the commit's files, read from git in one batch: "<blob> <path>" from ls-tree, then each blob's bytes from cat-file
    const tree = execFileSync('git', ['ls-tree', '-r', '-z', sha, '--', 'ux', 'atlas/atlas.json'], { encoding: 'utf8', maxBuffer: 1 << 28 })
      .split('\0').filter(Boolean).map((l) => { const [meta, file] = l.split('\t'); return { blob: meta.split(' ')[2], file }; });
    const data = execFileSync('git', ['cat-file', '--batch'], { input: tree.map((t) => t.blob).join('\n') + '\n', maxBuffer: 1 << 30 });
    let at = 0;
    for (const t of tree) {
      const nl = data.indexOf(10, at), size = +data.subarray(at, nl).toString().split(' ')[2];
      const dest = path.join(dir, t.file); fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, data.subarray(nl + 1, nl + 1 + size)); rewrite(dest);
      at = nl + 1 + size + 1;
    }
  } catch (e) { console.warn(`pages: could not write @${sha.slice(0, 7)} (${e.message.split('\n')[0]})`); }
}

// The site opens on the atlas. No Jekyll: files and folders that start with "_" or "." are served as they are.
fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Sentri design atlas</title><meta http-equiv="refresh" content="0; url=atlas/"><a href="atlas/">Open the Sentri design atlas</a>\n`);
fs.writeFileSync(path.join(out, '.nojekyll'), '');
console.log(`pages: ${files.length} files and ${commits.size} commit(s) into _site, ${rewritten} rewritten for base ${base}`);
