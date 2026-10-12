// The scenario files' format, checked fast and without a browser: every features/*/scenarios.json is walked with the
// same code the runner uses (scripts/scenario-tree.mjs). Running the leaves themselves stays in the gate
// (node scripts/run-scenarios.mjs <feature>): it needs a browser and minutes.
// Format: docs/design-workflow/scenarios.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { walkTree, checkStep, checkGwt, parseDuration, stepKind, STEP_KINDS } from '../scripts/scenario-tree.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const features = readdirSync(join(root, 'features')).filter((f) => existsSync(join(root, 'features', f, 'scenarios.json')));

test('there is at least one scenarios.json to check', () => assert.ok(features.length > 0));

for (const feature of features) {
  test(`features/${feature}/scenarios.json is well-formed`, () => {
    const spec = JSON.parse(readFileSync(join(root, 'features', feature, 'scenarios.json'), 'utf8'));
    assert.equal(spec.feature, feature, 'the file names its own feature');
    const { leaves, problems, gwtProblems, nodeCount } = walkTree(spec);
    // problems cover: unique ids, every outcome has authority (else it is a decision-blocker), every outcome that runs
    // sits under a state, only known node types and step kinds. gwtProblems: every outcome has a given / when / then.
    assert.deepEqual(problems, [], problems.join('\n'));
    assert.deepEqual(gwtProblems, [], gwtProblems.join('\n'));
    assert.ok(leaves.length > 0, 'the tree has leaves');
    assert.ok((nodeCount.outcome || 0) > 0, 'the tree has outcomes');
    for (const l of leaves) if (l.node.type === 'decision-blocker') assert.ok(l.node.question, `${l.node.id}: a decision-blocker states its question`);
  });
}

// the checker itself: a malformed tree must fail it, so the test above means something
const leaf = (over = {}) => ({ type: 'outcome', id: 'o1', authority: [{ src: 'PRD', at: 'x', says: 'y' }], gwt: { given: 'A worker is on the list.', when: 'They tap the row.', then: 'Her record opens.' }, visible: [{ text: 'x' }], ...over });
const tree = (o, state = {}) => ({ feature: 'f', tree: [{ type: 'entry', id: 'e', children: [{ type: 'state', id: 's', reset: { screen: 'a.b' }, ...state, children: [{ type: 'action', id: 'a', taps: ['Go'], children: [o] }] }] }] });

test('the checker accepts a well-formed leaf', () => {
  const r = walkTree(tree(leaf()));
  assert.deepEqual([r.problems, r.gwtProblems], [[], []]);
});

test('the checker refuses what the format forbids', () => {
  const bad = (o, state) => walkTree(tree(o, state));
  assert.match(bad(leaf({ authority: [] })).problems.join(), /needs authority/);
  assert.match(walkTree({ tree: [{ type: 'entry', id: 'e', children: [leaf(), leaf({ id: 'o1' })] }] }).problems.join(), /duplicate id/);
  assert.match(walkTree({ tree: [{ type: 'entry', id: 'e', children: [leaf()] }] }).problems.join(), /no state/);
  assert.match(bad(leaf({ type: 'mystery' })).problems.join(), /unknown node type/);
  assert.match(bad(leaf({ gwt: undefined })).gwtProblems.join(), /no gwt/);
  assert.match(bad(leaf({ gwt: { given: 'A worker is on the list.', when: 'They tap the row.' } })).gwtProblems.join(), /gwt\.then/);
  assert.match(bad(leaf({ gwt: { given: "The record has s.view === 'room'.", when: 'They tap the row.', then: 'Her record opens.' } })).gwtProblems.join(), /selector or prototype state/);
  const withTaps = (taps) => walkTree({ tree: [{ type: 'entry', id: 'e', children: [{ type: 'state', id: 's', reset: {}, children: [{ type: 'action', id: 'a', taps, children: [leaf()] }] }] }] });
  assert.match(withTaps([{ teleport: true }]).problems.join(), /unknown step/);
  assert.match(withTaps([{ tap: 'x', back: true }]).problems.join(), /unknown step/);
  assert.match(withTaps([{ advance: 'soon' }]).problems.join(), /duration/);
  assert.match(withTaps([{ device: 'c' }]).problems.join(), /device is one of/);
  assert.match(withTaps([{ offline: 'yes' }]).problems.join(), /true or false/);
  assert.match(withTaps([{ expect: [{ nonsense: 1 }] }]).problems.join(), /unknown assertion/);
  assert.match(walkTree(tree(leaf(), { reset: { taps: [{ reload: true }] } })).problems.join(), /taps only/);
});

test('every interruption step is a known step kind', () => {
  for (const s of [{ reload: true }, { offline: true }, { offline: false }, { advance: '2h' }, { advance: '30m' }, { advance: '1d' }, { back: true }, { device: 'a' }, { device: 'b' }, { wait: 200 }, { fill: '[data-x]', value: '1' }, { tap: 'Go', hold: 1100 }, 'Go'])
    assert.deepEqual(checkStep(s), [], JSON.stringify(s));
  assert.deepEqual([...new Set(['reload', 'offline', 'advance', 'back', 'device'].map((k) => stepKind({ [k]: 1 })))].sort(), ['advance', 'back', 'device', 'offline', 'reload']);
  for (const k of ['offline', 'advance', 'back', 'device']) assert.ok(STEP_KINDS.includes(k));
});

test('durations read as 30m, 2h, 1d', () => {
  assert.equal(parseDuration('30m'), 30 * 60000);
  assert.equal(parseDuration('2h'), 2 * 3600000);
  assert.equal(parseDuration('1d'), 86400000);
  assert.equal(parseDuration('later'), null);
  assert.equal(parseDuration('2'), null);
});

test('plain given / when / then needs all three parts', () => {
  assert.deepEqual(checkGwt({ given: 'A worker is on the list.', when: 'They tap the row.', then: 'Her record opens.' }), []);
  assert.ok(checkGwt({}).length === 3);
  assert.ok(checkGwt(null).length === 1);
});
