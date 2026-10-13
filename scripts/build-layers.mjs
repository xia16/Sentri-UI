// Writes atlas/layers.json: every unmerged branch, the features it touches, and how each screen differs from where the
// branch started (its merge base with main). The atlas draws these as layers on a feature page (atlas/feature.js).
//   new      the screen is in the branch's atlas data, not the base's
//   removed  the base has it, the branch does not
//   changed  the screen renders differently: base and branch are rendered bare at 390 x 844 and compared pixel by pixel
// Screens render straight from git through serve-ux's /@<commit>/ route, which this script starts on its own.
// Usage: node scripts/build-layers.mjs [--previous <layers.json path or URL>] [branch ...]
//   no branches: every branch on origin except main. --previous reuses the comparison of any branch whose tip and
//   merge base have not moved, so a rebuild only renders what changed.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { playwright } from './playwright-path.mjs';

const args = process.argv.slice(2), at = args.indexOf('--previous');
const prevSrc = at >= 0 ? args.splice(at, 2)[1] : null;
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 1 << 28 }).trim();
const show = (rev, file) => { try { return execFileSync('git', ['show', `${rev}:${file}`], { encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] }); } catch { return null; } }; // null when the file isn't there
const features = (text) => { try { return Object.fromEntries(JSON.parse(text).platforms.flatMap((p) => p.sections.flatMap((s) => s.features.map((f) => [f.id, f])))); } catch { return null; } };
// how a branch's author is named on its layer; anyone not listed shows as their git name
const PEOPLE = { zhangzhaoxu: 'Zhaoxu', xia16: 'Adam', Claude: 'Agent' };

const main = git('rev-parse', 'origin/main');
const branches = (args.length ? args : git('for-each-ref', 'refs/remotes/origin', '--format=%(refname:short)').split('\n'))
  .map((b) => b.replace(/^origin\//, '')).filter((b) => b && b !== 'main' && b !== 'HEAD' && b !== 'origin');

const previous = {};
if (prevSrc) {
  try {
    const text = /^https?:/.test(prevSrc) ? await (await fetch(prevSrc)).text() : fs.readFileSync(prevSrc, 'utf8');
    for (const l of JSON.parse(text).layers || []) previous[l.sha + ' ' + l.base] = l;
  } catch (e) { console.warn(`layers: no previous layers (${e.message})`); }
}

// a screen can only look different if its page, or a file its page loads, changed
function touched(rev, url, changed) {
  const file = url.split('?')[0].replace(/^\//, ''), html = show(rev, file);
  if (!html) return true;
  const dir = path.posix.dirname(file);
  const refs = [file, ...[...html.matchAll(/(?:src|href)="([^"#:]+?)(?:\?[^"]*)?"/g)].map((m) => path.posix.normalize(path.posix.join(dir, m[1])))];
  return refs.some((r) => changed.has(r) || changed.has(r.replace(/\.html$/, '.js')) || changed.has(r.replace(/\.html$/, '.css')));
}

let server = null, browser = null, pages = null, cmp = null;
const WORKERS = 4; // screens compared at once
const port = 4300 + Math.floor(Math.random() * 600), origin = `http://127.0.0.1:${port}`;
async function render() { // started only when some branch needs comparing
  if (pages) return;
  server = spawn(process.execPath, [path.resolve('scripts/serve-ux.cjs'), String(port)], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { await fetch(origin + '/atlas/'); break; } catch { await new Promise((r) => setTimeout(r, 100)); } }
  const { chromium } = playwright();
  browser = await chromium.launch();
  pages = await Promise.all(Array.from({ length: WORKERS }, () => browser.newPage({ viewport: { width: 390, height: 844 } })));
  cmp = await browser.newPage();
}
async function shot(page, sha, s) {
  await page.goto(`${origin}/@${sha}${s.url}${s.url.includes('?') ? '&' : '?'}screen=${encodeURIComponent(s.id)}`);
  await page.waitForFunction(() => document.documentElement.classList.contains('atlas-ready'), null, { timeout: 15000 });
  await page.waitForTimeout(250);
  return page.screenshot({ clip: { x: 0, y: 0, width: 390, height: 844 } });
}
const differs = async (a, b) => !a.equals(b) && (await cmp.evaluate(async ([x, y]) => {
  const load = (src) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + src; });
  const [i, j] = await Promise.all([load(x), load(y)]);
  const px = (n) => { const k = document.createElement('canvas'); k.width = 390; k.height = 844; const g = k.getContext('2d'); g.drawImage(n, 0, 0); return g.getImageData(0, 0, 390, 844).data; };
  const d1 = px(i), d2 = px(j); let n = 0;
  for (let p = 0; p < d1.length; p += 4) if (Math.abs(d1[p] - d2[p]) + Math.abs(d1[p + 1] - d2[p + 1]) + Math.abs(d1[p + 2] - d2[p + 2]) > 24) n++;
  return n / (390 * 844);
}, [a.toString('base64'), b.toString('base64')])) > 0.0005;

const out = { generated: new Date().toISOString(), main, tips: { main }, layers: [] };
try {
  for (const name of branches) {
    const sha = git('rev-parse', `origin/${name}`); out.tips[name] = sha;
    if (git('rev-list', '--count', `origin/main..${sha}`) === '0') continue; // nothing main does not have
    const base = git('merge-base', 'origin/main', sha);
    const was = features(show(base, 'atlas/atlas.json')), now = features(show(sha, 'atlas/atlas.json'));
    if (!was || !now) { console.log(`${name}: no atlas data to compare`); continue; }
    const changed = new Set(git('diff', '--name-only', base, sha).split('\n').filter(Boolean));
    const reuse = previous[sha + ' ' + base];
    let pr = null;
    try { pr = JSON.parse(execFileSync('gh', ['pr', 'list', '--head', name, '--state', 'open', '--json', 'number,url'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }))[0] || null; } catch {}
    const who = git('log', '-1', '--format=%an', sha);
    const layer = {
      branch: name, sha, base, author: PEOPLE[who] || who, updated: git('log', '-1', '--format=%cs', sha),
      commits: +git('rev-list', '--count', `${base}..${sha}`), behind: +git('rev-list', '--count', `${sha}..origin/main`), pr, features: {},
    };
    for (const [id, f] of Object.entries(now)) {
      const old = was[id], before = Object.fromEntries((old ? old.screens : []).map((s) => [s.id, s]));
      let screens = {};
      if (reuse) screens = (reuse.features[id] || {}).screens || {};
      else {
        const todo = [], found = {};
        for (const s of f.screens) {
          if (!before[s.id]) { screens[s.id] = 'new'; continue; }
          const b = before[s.id];
          if (s.url && b.url && (touched(sha, s.url, changed) || s.url !== b.url)) todo.push([b, s]);
        }
        if (todo.length) await render();
        await Promise.all((pages || []).slice(0, todo.length).map(async (page) => {
          for (let job; (job = todo.shift());) {
            const [b, s] = job;
            try { if (await differs(await shot(page, base, b), await shot(page, sha, s))) found[s.id] = 'changed'; }
            catch (e) { console.warn(`  ${s.id}: could not compare (${e.message.split('\n')[0]})`); }
          }
        }));
        f.screens.forEach((s) => { if (found[s.id]) screens[s.id] = 'changed'; }); // in the feature's order
        for (const sid of Object.keys(before)) if (!f.screens.some((s) => s.id === sid)) screens[sid] = 'removed';
      }
      const prd = changed.has(`features/${id}/PRD.md`);
      if (!Object.keys(screens).length && !prd) continue;
      layer.features[id] = { screens, prd, feature: f, removed: Object.keys(screens).filter((k) => screens[k] === 'removed' && before[k]).map((k) => before[k]) };
    }
    const n = Object.keys(layer.features).length;
    console.log(`${name}: ${n ? Object.entries(layer.features).map(([id, x]) => `${id} ${Object.keys(x.screens).length}`).join(', ') : 'touches no screen'}${reuse ? ' (reused)' : ''}`);
    if (n) out.layers.push(layer);
  }
} finally {
  if (browser) await browser.close();
  if (server) server.kill();
}
fs.writeFileSync(new URL('../atlas/layers.json', import.meta.url), JSON.stringify(out) + '\n');
console.log(`layers: ${out.layers.length} of ${branches.length} branch(es) → atlas/layers.json`);
