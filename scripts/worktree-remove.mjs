// Removing a worktree without deleting through a link. On Windows, `git worktree remove --force` follows a directory junction and
// deletes what it points at: a worktree whose node_modules was a junction to the main checkout's emptied the main checkout's
// node_modules (twice on 2026-10-19, after which every gate crashed on "Cannot find module .../playwright"). So every link inside
// the worktree (a junction or a symlink, at any depth) is unlinked first, the link itself and never its target; then git removes
// what is left. Nothing here links node_modules into a worktree: tooling finds Playwright through SENTRI_PLAYWRIGHT.
//
//   node scripts/worktree-remove.mjs <dir> [<dir> ...]      unlink the links, remove each worktree, prune
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Unlinks every link under dir without following one; returns the links it removed. `.git` (a worktree's pointer file) is left.
export function unlinkLinks(dir) {
  const removed = [];
  (function walk(d) {
    let entries;
    try { entries = fs.readdirSync(d); } catch { return; }
    for (const name of entries) {
      if (name === '.git') continue;
      const p = path.join(d, name);
      let st;
      try { st = fs.lstatSync(p); } catch { continue; }
      if (st.isSymbolicLink()) { // a junction reports as a link too; unlink removes the link, rmdir is the fallback for a directory link
        try { fs.unlinkSync(p); } catch { fs.rmdirSync(p); }
        removed.push(p);
      } else if (st.isDirectory()) walk(p);
    }
  })(dir);
  return removed;
}

// Removes one worktree safely: its links first, then `git worktree remove --force` and a prune, from cwd (any checkout of the repo).
export function removeWorktree(dir, { cwd = process.cwd() } = {}) {
  const links = fs.existsSync(dir) ? unlinkLinks(dir) : [];
  const r = spawnSync('git', ['worktree', 'remove', '--force', dir], { cwd, encoding: 'utf8' });
  spawnSync('git', ['worktree', 'prune'], { cwd });
  return { links, code: r.status, err: (r.stderr || '').trim() };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dirs = process.argv.slice(2);
  if (!dirs.length) { console.error('usage: node scripts/worktree-remove.mjs <dir> [<dir> ...]'); process.exit(2); }
  let failed = 0;
  for (const dir of dirs) {
    const r = removeWorktree(dir);
    if (r.code) failed++;
    console.log(`${r.code ? 'FAILED' : 'removed'} ${dir}${r.links.length ? ` (unlinked ${r.links.length} link(s) first: ${r.links.map((l) => path.relative(dir, l)).join(', ')})` : ''}${r.code ? `: ${r.err.split('\n')[0]}` : ''}`);
  }
  process.exit(failed ? 1 : 0);
}
