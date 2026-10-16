// A stand-in for the static reach analyser (docs/design-workflow/gate-v2.md §2), which ships as scripts/static-reach.mjs. Same
// interface; the swap is one import in scripts/evaluate.mjs. Until then this answers "unsure", which is "everything":
//   reachOf(base, candidate, { files }) → { all: true, screens: every screen id on either side, functions: null (undecided: all),
//     leaves: every outcome leaf of each feature with a screen in reach, why }. base, candidate: { dir, atlas } (a checkout and its
//     parsed atlas.json); files: the changed paths (the analyser's default is a git diff of the two HEADs; the stub needs none).
//   identityInputs(side, screenId) → { files: every file a page could load on that side, unbounded: [], bundle: { all: true, exports,
//     units, setup: true }, screen: its atlas definition }. side: 'base' or 'candidate'.
// Correct, because it leaves nothing out; slow, because any change to a page-loadable file is a new identity for every screen.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { screensOf, componentPagesOf } from './atlas-screens.mjs';
import { walkTree } from './scenario-tree.mjs';

// What no page can load (the gate's own render inputs, the server, the harness and the shooter, are hashed by the gate itself):
// the workflow's text and other prose outside ux/, CI, tests, agent settings and the scripts.
const NOT_LOADED = [/^docs\//, /^\.github\//, /^tests\//, /^\.claude\//, /^scripts\//, /^(?!ux\/).*\.md$/i];

let sides = null;
const sideOf = (s) => (s === 'base' ? 'base' : 'candidate');

function loadable(dir) {
  const r = spawnSync('git', ['ls-files', '-z'], { cwd: dir, encoding: 'utf8', maxBuffer: 256 << 20 });
  if (r.status !== 0) throw new Error(`git ls-files in ${dir}: ${(r.stderr || '').trim()}`);
  return Object.freeze(r.stdout.split('\0').filter((f) => f && !NOT_LOADED.some((re) => re.test(f))).sort());
}

export function reachOf(base, candidate, { files } = {}) { // eslint-disable-line no-unused-vars
  const at = (s) => ({ ...s, files: loadable(s.dir), defs: new Map([...screensOf(s.atlas), ...componentPagesOf(s.atlas)].map((x) => [x.id, x])) });
  sides = { base: at(base), candidate: at(candidate) };
  const screens = [...new Set([...sides.base.defs.keys(), ...sides.candidate.defs.keys()])].sort();
  const features = new Set([...sides.base.defs.values(), ...sides.candidate.defs.values()].map((x) => x.feature));
  const leaves = [];
  for (const f of [...features].sort()) {
    const spec = path.join(candidate.dir, 'features', f, 'scenarios.json');
    if (!fs.existsSync(spec)) continue;
    try { for (const l of walkTree(JSON.parse(fs.readFileSync(spec, 'utf8'))).leaves) if (l.node.type === 'outcome') leaves.push(l.node.id); } catch {}
  }
  return { all: true, screens, functions: null, leaves, why: ['the static reach analyser (gate-v2 §2) has not landed: every screen is in reach (unsure is everything)'] };
}

export function identityInputs(side, screen) {
  if (!sides) throw new Error('identityInputs before reachOf: the analyser reads both sides first');
  const s = sides[sideOf(side)], def = s.defs.get(screen);
  if (!def) return null;
  const { id, feature, url, preset, steps, component, variant } = def;
  return { files: s.files, unbounded: [], bundle: { all: true, exports: null, units: null, setup: true }, screen: { id, feature, url, preset, steps, component, variant } };
}
