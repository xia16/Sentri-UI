// English first (owner, 2026-10-21): the gate checks Chinese only on a frozen feature.
import test from 'node:test';
import assert from 'node:assert/strict';
import { frozenFeatures, checksChinese, resultsBlock } from '../scripts/loop-rules.mjs';

const atlas = (statuses) => ({ platforms: [{ id: 'mobile', sections: [{ id: 'home', features: Object.entries(statuses).map(([id, status]) => ({ id, status })) }] }] });

test('the frozen features are the atlas features whose status is frozen', () => {
  assert.deepEqual([...frozenFeatures(atlas({ farrowing: 'frozen', inspection: 'in-design', wean: 'placeholder', heat: 'agent-checked' }))], ['farrowing']);
  assert.deepEqual([...frozenFeatures(atlas({ farrowing: 'in-design' }))], [], 'nothing frozen: no Chinese anywhere');
  assert.deepEqual([...frozenFeatures(null)], [], 'an unreadable atlas freezes nothing');
  assert.deepEqual([...frozenFeatures({})], []);
});

test('Chinese is checked only for a frozen feature; a component page or an unknown feature never', () => {
  const frozen = new Set(['farrowing']);
  assert.equal(checksChinese('farrowing', frozen), true);
  assert.equal(checksChinese('inspection', frozen), false);
  assert.equal(checksChinese(undefined, frozen), false);
  assert.equal(checksChinese('', frozen), false);
});

test('the Results block says where Chinese was checked', () => {
  const base = { outcome: 'pass', candidate: 'c1', base: 'b1', class: { effective: 'presentation' }, checks: [] };
  assert.match(resultsBlock({ ...base, zh: { frozen: [] } }), /Chinese: checked only on frozen features .*none frozen, so no ZH runs or ZH leaves/);
  assert.match(resultsBlock({ ...base, zh: { frozen: ['farrowing'] } }), /Chinese: checked only on frozen features .*: farrowing/);
  assert.doesNotMatch(resultsBlock(base), /Chinese:/, 'an older run without the field says nothing');
  assert.doesNotMatch(resultsBlock({ ...base, gatePass: true }), /no screen moved/, 'a gate pass no longer implies no screen moved (owner, 2026-10-20)');
});
