// The seams gate v2's evidence half builds on (docs/design-workflow/gate-v2.md): the reach analyser's interface as its stand-in
// answers it, the leaf report the scheduler assembles, and the legibility comparison the visits feed.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reachOf, identityInputs } from '../scripts/static-reach.mjs';
import { leafRow, reportOf } from '../scripts/scenario-runner.mjs';
import { scenarioDebt } from '../scripts/loop-rules.mjs';
import { legibilityWorse } from '../scripts/check-legibility.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const atlas = JSON.parse(fs.readFileSync(path.join(root, 'atlas/atlas.json'), 'utf8'));

test('the reach analyser answers the interface the evidence half reads: screens, leaves, and identity inputs with unit hashes', () => {
  const side = { dir: root, atlas };
  const r = reachOf(side, side, { files: ['ux/design-system/components/bundle.css'] });
  assert.equal(r.all, true, 'any stylesheet is every screen (no CSS proof in v1)');
  const one = reachOf(side, side, { files: ['docs/design-workflow/README.md'] });
  assert.equal(one.all, false);
  assert.deepEqual(one.screens, []);
  const ii = identityInputs(side, 'farrowing.room');
  assert.ok(ii.files.includes('ux/design-system/components/bundle.js'));
  assert.ok(Array.isArray(ii.unbounded));
  assert.equal(typeof ii.bundle.setupHash, 'string');
  assert.ok(ii.bundle.all || Object.keys(ii.bundle.unitHashes || {}).length > 0, 'unit hashes for the units it can run');
  assert.equal(ii.screen.id, 'farrowing.room');
  assert.equal(identityInputs(side, 'no.such.screen'), null);
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
