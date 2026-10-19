// Removing a worktree never deletes through a link (scripts/worktree-remove.mjs): on 2026-10-19 `git worktree remove --force` on a
// worktree whose node_modules was a junction to the main checkout's emptied the main checkout's node_modules, twice.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { unlinkLinks, removeWorktree } from '../scripts/worktree-remove.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scratch = (name) => fs.mkdtempSync(path.join(os.tmpdir(), `sentri-${name}-`));
// A folder standing in for the main checkout's node_modules, with a file that must survive.
function sentinel() { const dir = scratch('modules'); fs.writeFileSync(path.join(dir, 'keep.txt'), 'main checkout'); return dir; }
const link = (target, at) => fs.symlinkSync(target, at, 'junction'); // a junction on Windows, a directory symlink elsewhere

test('unlinkLinks removes a node_modules junction and a nested link, never what they point at', () => {
  const target = sentinel(), wt = scratch('wt');
  try {
    link(target, path.join(wt, 'node_modules'));
    fs.mkdirSync(path.join(wt, 'ux', 'deep'), { recursive: true });
    link(target, path.join(wt, 'ux', 'deep', 'linked'));
    fs.writeFileSync(path.join(wt, 'ux', 'own.txt'), 'the worktree\'s own file');
    const removed = unlinkLinks(wt).map((p) => path.relative(wt, p)).sort();
    assert.deepEqual(removed, [path.join('node_modules'), path.join('ux', 'deep', 'linked')].sort());
    assert.equal(fs.readFileSync(path.join(target, 'keep.txt'), 'utf8'), 'main checkout');
    assert.ok(fs.existsSync(path.join(wt, 'ux', 'own.txt')), 'files that are not links stay for git to remove');
  } finally { fs.rmSync(wt, { recursive: true, force: true }); fs.rmSync(target, { recursive: true, force: true }); }
});

test('removeWorktree removes a real worktree with a node_modules junction and leaves the junction\'s target whole', () => {
  const target = sentinel(), dir = path.join(scratch('wtparent'), 'wt');
  try {
    const add = spawnSync('git', ['worktree', 'add', '--detach', dir, 'HEAD'], { cwd: root, encoding: 'utf8' });
    assert.equal(add.status, 0, add.stderr);
    link(target, path.join(dir, 'node_modules'));
    const r = removeWorktree(dir, { cwd: root });
    assert.equal(r.code, 0, r.err);
    assert.deepEqual(r.links.map((p) => path.basename(p)), ['node_modules']);
    assert.equal(fs.readFileSync(path.join(target, 'keep.txt'), 'utf8'), 'main checkout');
    assert.ok(!fs.existsSync(dir), 'the worktree is gone');
    const list = spawnSync('git', ['worktree', 'list', '--porcelain'], { cwd: root, encoding: 'utf8' }).stdout;
    assert.ok(!list.includes(dir.replace(/\\/g, '/')) && !list.includes(dir), 'git no longer lists it');
  } finally {
    if (fs.existsSync(dir)) removeWorktree(dir, { cwd: root });
    fs.rmSync(path.dirname(dir), { recursive: true, force: true }); fs.rmSync(target, { recursive: true, force: true });
  }
});
