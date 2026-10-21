// Merge main forward, regenerating the generated files instead of resolving them by hand (gate.md, build.md: forward merges go
// through this). Never rebases, never force-pushes, never commits a conflict marker.
//   node scripts/merge-main.mjs              fetch, merge origin/main, regenerate, commit the merge
//   node scripts/merge-main.mjs --continue   after resolving the other conflicts by hand (and git add): regenerate, check, commit
// Generated and committed: atlas/atlas.json (npm run atlas) and ux/design-system/tokens.css (scripts/tokens-css.py, from tokens.json).
// A conflict in one of them takes main's side, then regenerates it from the merged sources. Any other conflict is listed and left to
// you. The atlas is rebuilt on every merge: two clean textual merges of atlas.json can still be stale, and the gate fails a stale one.
// Exit 0 merged (or already up to date), 1 conflicts or a regeneration left to you, 2 usage or git error.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const GENERATED = {
  'atlas/atlas.json': { how: 'node scripts/build-atlas.mjs', run: [[process.execPath, ['scripts/build-atlas.mjs']]], always: true },
  'ux/design-system/tokens.css': { how: 'python scripts/tokens-css.py', run: [['python', ['scripts/tokens-css.py']], ['py', ['-3', 'scripts/tokens-css.py']], ['python3', ['scripts/tokens-css.py']]], source: 'ux/design-system/tokens.json' },
};
// The conflicted files, split: the generated ones (regenerated) and the rest (yours to resolve).
export function classifyConflicts(files) {
  const generated = [], other = [];
  for (const f of files) (Object.hasOwn(GENERATED, f) ? generated : other).push(f);
  return { generated, other };
}
// What to regenerate after the merge: every conflicted generated file, the atlas always, and tokens.css when tokens.json changed.
export function toRegenerate({ conflicted = [], changed = [] }) {
  return Object.keys(GENERATED).filter((f) => GENERATED[f].always || conflicted.includes(f) || changed.includes(f) || (GENERATED[f].source && changed.includes(GENERATED[f].source)));
}
// The lines of a text that hold a conflict marker (the gate's own test: <<<<<<< or >>>>>>> at the start of a line).
export const markerLines = (text) => String(text).split(/\r?\n/).flatMap((l, i) => (/^(<<<<<<<|>>>>>>>)( |$)/.test(l) ? [i + 1] : []));

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const git = (args) => { const r = spawnSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 << 20 }); return { code: r.status, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() }; };
const lines = (s) => s.split(/\r?\n/).filter(Boolean);

function main(argv) {
  const cont = argv.includes('--continue');
  if (argv.some((a) => a !== '--continue')) { console.error('usage: node scripts/merge-main.mjs [--continue]'); return 2; }
  const gitDir = git(['rev-parse', '--git-dir']).out;
  const merging = () => fs.existsSync(path.resolve(root, gitDir, 'MERGE_HEAD'));
  if (cont && !merging()) { console.error('no merge in progress: run node scripts/merge-main.mjs'); return 2; }
  if (!cont) {
    if (merging()) { console.error('a merge is already in progress: resolve it, then node scripts/merge-main.mjs --continue'); return 2; }
    const dirty = lines(git(['status', '--porcelain', '--untracked-files=no']).out);
    if (dirty.length) { console.error(`uncommitted changes (${dirty.slice(0, 3).join(', ')}): commit them first`); return 2; }
    const f = git(['fetch', 'origin']);
    if (f.code) { console.error(`git fetch origin failed: ${f.err.split('\n')[0]}`); return 2; }
    const m = git(['merge', '--no-ff', '--no-commit', 'origin/main']);
    if (!merging()) {
      if (m.code) { console.error(`git merge origin/main failed: ${(m.err || m.out).split('\n')[0]}`); return 2; }
      console.log('already up to date with origin/main');
      return 0;
    }
  }
  // the generated files: main's side now, regenerated below from the merged sources
  const unmerged = lines(git(['diff', '--name-only', '--diff-filter=U']).out);
  const { generated, other } = classifyConflicts(unmerged);
  for (const f of generated) {
    if (git(['checkout', '--theirs', '--', f]).code && git(['checkout', '--ours', '--', f]).code) { console.log(`${f}: neither side checks out; resolve it by hand`); other.push(f); continue; }
    git(['add', '--', f]);
  }
  if (other.length) {
    console.log(`${other.length} conflict(s) to resolve by hand:`);
    for (const f of other) console.log(`  - ${f}`);
    console.log(`${generated.length ? `regenerated after you finish: ${generated.join(', ')}. ` : ''}Resolve them, git add them, then: node scripts/merge-main.mjs --continue`);
    return 1;
  }
  const changed = lines(git(['diff', '--name-only', 'HEAD', 'MERGE_HEAD']).out);
  for (const f of toRegenerate({ conflicted: generated, changed })) {
    const g = GENERATED[f];
    let ok = false, why = '';
    for (const [cmd, args] of g.run) {
      const r = spawnSync(cmd, args, { cwd: root, encoding: 'utf8' });
      if (r.status === 0) { ok = true; break; }
      why = r.error ? `${cmd}: ${r.error.code || r.error.message}` : ((r.stderr || r.stdout || '').trim().split('\n').slice(-1)[0] || `${cmd} exited ${r.status}`);
    }
    if (!ok) { console.log(`${f}: could not regenerate it (${why}). Run ${g.how}, git add ${f}, then: node scripts/merge-main.mjs --continue`); return 1; }
    git(['add', '--', f]);
    console.log(`regenerated ${f}`);
  }
  const left = lines(git(['diff', '--name-only', '--diff-filter=U']).out);
  if (left.length) { console.log(`still unmerged: ${left.join(', ')}`); return 1; }
  const marked = lines(git(['grep', '--cached', '-l', '-E', '^(<<<<<<<|>>>>>>>)( |$)']).out);
  if (marked.length) {
    const at = (f) => { try { return markerLines(fs.readFileSync(path.join(root, f), 'utf8')).slice(0, 5).join(', '); } catch { return '?'; } };
    console.log(`conflict markers in: ${marked.map((f) => `${f} (line ${at(f)})`).join(', ')}. Fix them, git add, then: node scripts/merge-main.mjs --continue`);
    return 1;
  }
  const c = git(['commit', '--no-edit']);
  if (c.code) { console.error(`git commit failed: ${(c.err || c.out).split('\n')[0]}`); return 2; }
  console.log(`merged origin/main: ${git(['rev-parse', '--short', 'HEAD']).out}. Gate the new head.`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) process.exit(main(process.argv.slice(2)));
