// The seams gate v2's evidence half builds on (docs/design-workflow/gate-v2.md): the reach analyser's interface as its stand-in
// answers it, the leaf report the scheduler assembles, and the legibility comparison the visits feed.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reachOf, identityInputs } from '../scripts/static-reach-stub.mjs';
import { leafRow, reportOf } from '../scripts/scenario-runner.mjs';
import { scenarioDebt } from '../scripts/loop-rules.mjs';
import { legibilityWorse } from '../scripts/check-legibility.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const atlas = JSON.parse(fs.readFileSync(path.join(root, 'atlas/atlas.json'), 'utf8'));

test('the reach stand-in answers the analyser interface with everything: all screens, every leaf, whole-file identities', () => {
  const side = { dir: root, atlas };
  const r = reachOf(side, side, { files: ['ux/system/atlas-bare.js'] });
  assert.equal(r.all, true);
  assert.equal(r.functions, null, 'null: the graph is undecided, which the gate reads as every screen');
  assert.ok(r.screens.includes('farrowing.room') && r.screens.some((id) => id.startsWith('ds:')), 'screens and component pages');
  assert.ok(r.leaves.length > 50, 'every outcome leaf of each feature with a screen in reach');
  const ii = identityInputs('candidate', 'farrowing.room');
  assert.deepEqual(Object.keys(ii).sort(), ['bundle', 'files', 'screen', 'unbounded']);
  assert.equal(ii.bundle.all, true);
  assert.deepEqual(ii.unbounded, []);
  assert.ok(ii.files.includes('ux/design-system/components/bundle.js') && ii.files.includes('atlas/atlas.json'));
  assert.ok(!ii.files.some((f) => /^(docs|tests|scripts)\//.test(f)), 'what no page loads is left out');
  assert.equal(ii.screen.id, 'farrowing.room');
  assert.equal(identityInputs('base', 'no.such.screen'), null);
});

const leaf = (id, extra = {}) => ({ node: { id, type: 'outcome', label: id, authority: ['S'], ...extra }, branch: 'b', path: [id] });
const run = (lang, width, result, failures = []) => ({ lang, width, result, failures, skipped: [], notes: result === 'blocked' ? ['no zh rendering'] : [], evidence: [] });

test('leaf rows and reports, as the scheduler assembles them, compare base against candidate run by run', () => {
  const cand = reportOf({ feature: 'f', commit: 'c', base: 'u', langs: ['en', 'zh'], widths: [390], rows: [
    leafRow(leaf('a'), [run('en', 390, 'fail', [{ what: 'Saved shown', got: 'absent', tag: 'wrong-fact' }]), run('zh', 390, 'blocked')]),
    leafRow(leaf('b'), [run('en', 390, 'pass'), run('zh', 390, 'fail', [{ what: 'nothing clipped', got: 'x', tag: null }])]),
    leafRow(leaf('c', { status: 'pending' })),
  ] });
  assert.deepEqual(cand.summary, { pass: 0, fail: 2, blocked: 0, pending: 1, slow: 0 });
  assert.deepEqual(cand.leaves[0].hard, ['wrong-fact']);
  const base = reportOf({ feature: 'f', commit: 'b', base: 'u', langs: ['en'], widths: [390], rows: [leafRow(leaf('a'), [run('en', 390, 'fail', [{ what: 'Saved shown', got: 'absent', tag: 'wrong-fact' }])])] });
  const d = scenarioDebt(cand, base);
  assert.deepEqual(d.debt, ['a'], "a fails on main exactly as here: main's debt");
  assert.deepEqual(d.added.map((x) => x.id), ['b'], "b's failure is the change's");
  assert.deepEqual(scenarioDebt(cand, null).added.map((x) => x.id), ['a', 'b'], 'with no base report nothing is debt');
});

test('legibility, no worse than base: more violations or one on a new element is worse; a new screen is held to none', () => {
  const audit = (small = [], taps = []) => ({ audit: { small, c45: [], c7: [], taps, unverified: 0, sizes: {} } });
  const s = (sel, n = 1) => ({ sel, text: 't', px: 10, n });
  assert.equal(legibilityWorse(audit([s('a')]), audit([s('a')])).worse, false);
  assert.equal(legibilityWorse(audit([s('a')]), audit([s('a', 2)])).worse, true);
  assert.equal(legibilityWorse(audit([s('a')]), audit([s('b')])).worse, true);
  assert.equal(legibilityWorse(null, audit()).worse, false, 'a clean new screen');
  assert.equal(legibilityWorse(null, audit([], [{ sel: 'button', text: 'x', size: '30x30', n: 1 }])).worse, true, 'a new screen with a small target');
});
