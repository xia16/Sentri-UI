// Build step 1 of docs/design-workflow/gate-simplify.md. S1: a rule the diff decides stops the gate before any browser work (five
// such failures on 2026-10-17/18 came after full runs of 3 to 15 minutes). S2: run from a checkout whose tools differ from the base,
// gate.mjs runs the base's own gate from a worktree of the base, instead of blocking until the driver checks main out.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluate } from '../scripts/evaluate.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const git = (args, cwd = root) => { const r = spawnSync('git', args, { cwd, encoding: 'utf8' }); assert.equal(r.status, 0, r.stderr); return r.stdout.trim(); };
const scratch = (name) => path.join(os.tmpdir(), `sentri-${name}-${process.pid}-${Date.now().toString(36)}`);
function worktree(name) {
  const dir = scratch(name);
  git(['worktree', 'add', '--detach', dir, 'HEAD']);
  return { dir, done: () => { spawnSync('git', ['worktree', 'remove', '--force', dir], { cwd: root }); spawnSync('git', ['worktree', 'prune'], { cwd: root }); } };
}

test('a visual declaration outside the design system fails the gate before any browser work', async () => {
  const w = worktree('failfast');
  try {
    const page = fs.readdirSync(path.join(w.dir, 'ux/system')).find((f) => f.endsWith('.css'));
    fs.appendFileSync(path.join(w.dir, 'ux/system', page), '\n.fail-fast-probe { color: red; }\n');
    git(['-c', 'user.name=gate test', '-c', 'user.email=gate@test', 'commit', '-qam', 'probe: a page declares a colour'], w.dir);
    const base = git(['rev-parse', 'HEAD~1'], w.dir), candidate = git(['rev-parse', 'HEAD'], w.dir);
    const out = scratch('failfast-out');
    const { outcome, mech } = await evaluate({ root: w.dir, out, base, candidate, ref: candidate, scope: ['probe'], log: () => {}, testBase: true });
    assert.equal(outcome, 'fail');
    const ds = mech.checks.find((c) => c.check === 'design-system components only');
    assert.equal(ds?.result, 'fail', 'the page-styling rule is read from the diff, whether or not a screen moves');
    assert.match(ds.detail, new RegExp(`${page.replace('.', '\\.')} color`));
    assert.match(mech.stoppedEarly, /no browser work ran/);
    assert.equal(mech.evidence, null, 'nothing was planned, shot or checked');
    assert.equal(mech.screens, null);
    fs.rmSync(out, { recursive: true, force: true });
  } finally { w.done(); }
});

test("from a checkout whose tools differ from the base, the gate runs the base's own gate.mjs from a worktree of the base", () => {
  const w = worktree('tools');
  try {
    // this checkout's gate (uncommitted edits included), in a checkout whose workflow docs differ from its HEAD
    fs.cpSync(path.join(root, 'scripts'), path.join(w.dir, 'scripts'), { recursive: true });
    fs.appendFileSync(path.join(w.dir, 'docs/design-workflow/README.md'), '\nA local edit to the workflow.\n');
    const env = { ...process.env };
    delete env.SENTRI_GATE_TOOLS; // npm test inside a gate inherits it
    // no --candidate: the base's gate prints its usage, so nothing is gated; --base keeps it off the network
    const r = spawnSync(process.execPath, [path.join(w.dir, 'scripts/gate.mjs'), '--base', 'HEAD'], { cwd: w.dir, encoding: 'utf8', env });
    assert.match(r.stdout, /docs\/design-workflow\/README\.md.* differ from HEAD \(\w{7}\): the gate runs \w{7}'s own tools, from /);
    assert.match(r.stderr, /usage: node scripts\/gate\.mjs/, "the base's own gate.mjs ran, with the same arguments");
    assert.equal(r.status, 2, 'its exit code is the run inside');
    assert.doesNotMatch(git(['worktree', 'list']), /sentri-gate-tools-/, 'the tools worktree is removed afterwards');
  } finally { w.done(); }
});
