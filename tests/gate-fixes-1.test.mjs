// Gate fixes, build step 1 of docs/design-workflow/change-map.md: judgements carry by their images (G17) and walks only with their
// inputs; coverage is compared leaf by leaf (G14); a screen's identity is what renders (G7); one leaf entry resolver (G5); the atlas
// carries no build stamps (G1).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { carryJudgements, coverageLost } from '../scripts/loop-rules.mjs';
import { renderDef } from '../scripts/atlas-screens.mjs';
import { leafEntryUrl } from '../scripts/scenario-tree.mjs';

const pair = (screen, base, cand, image) => ({ screen, lang: 'en', width: 390, kind: 'changed', pct: 0.5, identity: { base, cand }, ...(image ? { image } : {}) });
const judged = (screens, walk = []) => [{ pass: true, candidate: 'C1', base: 'M1', walk, defects: [], pairs: screens.map((s) => ({ screen: s, lang: 'en', width: 390, verdict: 'better', why: 'r' })) }];

test('a judgement carries to the same two images even when every shot identity changed (G17, #192)', () => {
  const old = { candidate: 'C1', base: 'M1', screens: { gone: [] }, pairs: [pair('s1', 'b1', 'c1', { base: 'X1', cand: 'Y1' }), pair('s2', 'b2', 'c2', { base: 'X2', cand: 'Y2' })] };
  // strings.json changed: every identity is new, s1 looks the same, s2 does not
  const now = { candidate: 'C2', base: 'M1', screens: { gone: [] }, pairs: [pair('s1', 'b1', 'c1-new', { base: 'X1', cand: 'Y1' }), pair('s2', 'b2', 'c2-new', { base: 'X2', cand: 'Y2-new' })] };
  const r = carryJudgements({ mech: old, parts: judged(['s1', 's2']) }, now);
  assert.deepEqual(r.carried.pairs.map((p) => p.screen), ['s1']);
  assert.deepEqual(r.need, ['s2 en-390']);
});

test('a walk carries only for a screen whose inputs are unchanged; the same picture from changed inputs is walked again', () => {
  const old = { candidate: 'C1', base: 'M1', screens: { gone: [] }, pairs: [pair('s1', 'b1', 'c1', { base: 'X1', cand: 'Y1' }), pair('s2', 'b2', 'c2', { base: 'X2', cand: 'Y2' })] };
  const now = { candidate: 'C2', base: 'M1', screens: { gone: [] }, pairs: [pair('s1', 'b1', 'c1-handler', { base: 'X1', cand: 'Y1' }), pair('s2', 'b2', 'c2', { base: 'X2', cand: 'Y2' })] };
  const r = carryJudgements({ mech: old, parts: judged(['s1', 's2'], [{ screen: 's1', ok: true }, { screen: 's2', ok: true }]) }, now);
  assert.deepEqual(r.need, [], 'both pictures are the same: no pair needs a judge');
  assert.deepEqual(r.walkNeed, ['s1'], 's1 looks the same from a changed handler: walk it again');
  assert.deepEqual(r.carried.walk.map((w) => w.screen), ['s2']);
});

test('a run without recorded images still carries by shot identity', () => {
  const old = { candidate: 'C1', base: 'M1', screens: { gone: [] }, pairs: [pair('s1', 'b1', 'c1')] };
  const now = { candidate: 'C2', base: 'M2', screens: { gone: [] }, pairs: [pair('s1', 'b1', 'c1', { base: 'X1', cand: 'Y1' })] };
  const r = carryJudgements({ mech: old, parts: judged(['s1'], [{ screen: 's1', ok: true }]) }, now);
  assert.deepEqual(r.need, []);
  assert.deepEqual(r.walkNeed, []);
  assert.deepEqual(r.carried.walk.map((w) => w.screen), ['s1']);
});

test('coverage is compared leaf by leaf: a leaf made pending, weakened or replaced is lost, whatever the count (G14)', () => {
  const leaf = (id, extra = {}) => ({ type: 'outcome', id, visible: [{ text: 'a' }, { text: 'b' }], ...extra });
  const spec = (...leaves) => ({ tree: [{ type: 'state', id: 'st', reset: { url: '/p.html' }, children: leaves }] });
  const base = { runner: true, specs: { f: spec(leaf('l1'), leaf('l2'), leaf('l3'), leaf('p1', { status: 'pending' })) } };
  assert.deepEqual(coverageLost(base, { runner: true, specs: { f: spec(leaf('l1'), leaf('l2'), leaf('l3'), leaf('p1', { status: 'pending' })) } }), []);
  // the count holds (4 outcomes) but l1 is now pending, l2 checks one thing, and l3 became l4
  const lost = coverageLost(base, { runner: true, specs: { f: spec(leaf('l1', { status: 'pending' }), leaf('l2', { visible: [{ text: 'a' }] }), leaf('l4'), leaf('p1', { status: 'pending' })) } });
  assert.deepEqual(lost, ['f: leaf l1 runs on base and is pending here', 'f: leaf l2 makes 1 assertion(s), 2 on base', 'f: leaf l3 is gone']);
  // a pending leaf on base owes nothing
  assert.deepEqual(coverageLost(base, { runner: true, specs: { f: spec(leaf('l1'), leaf('l2'), leaf('l3'), leaf('p2', { status: 'pending' })) } }), []);
});

test('a leaf that moves to another feature with its id is kept coverage there; one that is weakened on the way is not', () => {
  const leaf = (id, extra = {}) => ({ type: 'outcome', id, visible: [{ text: 'a' }, { text: 'b' }], ...extra });
  const spec = (...leaves) => ({ tree: [{ type: 'state', id: 'st', reset: { url: '/p.html' }, children: leaves }] });
  const base = { runner: true, specs: { a: spec(leaf('a1'), leaf('a2')), b: spec(leaf('b1'), leaf('bp', { status: 'pending' })), c: null } };
  // a and b merge into c: every leaf lands, the two scenarios.json files go
  assert.deepEqual(coverageLost(base, { runner: true, specs: { a: null, b: null, c: spec(leaf('a1'), leaf('a2'), leaf('b1'), leaf('bp', { status: 'pending' })) } }), []);
  // part of a feature moves out, the rest stays
  assert.deepEqual(coverageLost(base, { runner: true, specs: { a: spec(leaf('a1')), b: spec(leaf('b1'), leaf('bp', { status: 'pending' })), c: spec(leaf('a2')) } }), []);
  // a leaf left behind, one weakened, one made pending where it lands
  assert.deepEqual(coverageLost(base, { runner: true, specs: { a: null, b: null, c: spec(leaf('a1', { visible: [{ text: 'a' }] }), leaf('b1', { status: 'pending' })) } }),
    ['features/a/scenarios.json is gone or unreadable', 'features/b/scenarios.json is gone or unreadable']);
  assert.deepEqual(coverageLost(base, { runner: true, specs: { a: spec(), b: spec(leaf('bp', { status: 'pending' })), c: spec(leaf('a1', { visible: [{ text: 'a' }] }), leaf('a2'), leaf('b1', { status: 'pending' })) } }),
    ['a: leaf a1 makes 1 assertion(s), 2 on base', 'b: leaf b1 runs on base and is pending here']);
});

test('what renders of a screen is its url, preset and steps (G7)', () => {
  const entry = { id: 'f.s', name: 'S', zh: '屏', status: 'approved', url: '/ux/p.html?x=1', preset: 'room', steps: ['[data-a]'], figma: '', notes: { purpose: 'p' }, approval: { commit: 'abc' } };
  assert.deepEqual(renderDef(entry), { id: 'f.s', url: '/ux/p.html?x=1', preset: 'room', steps: ['[data-a]'] });
  assert.deepEqual(renderDef({ ...entry, notes: { purpose: 'changed' }, status: 'in-design' }), renderDef(entry), 'notes and status draw nothing');
  assert.notDeepEqual(renderDef({ ...entry, steps: ['[data-b]'] }), renderDef(entry));
  assert.deepEqual(renderDef({ id: 'f.t', url: '/ux/q.html' }), { id: 'f.t', url: '/ux/q.html' });
});

test("a leaf's entry page is its nearest reset's url, else the spec's default url (G5)", () => {
  assert.equal(leafEntryUrl({ url: '/a.html' }, { url: '/d.html' }), '/a.html');
  assert.equal(leafEntryUrl({ screen: 'f.s', preset: 'x' }, { url: '/d.html' }), '/d.html', 'a reset that names only a screen opens the default page');
  assert.equal(leafEntryUrl(null, { url: '/d.html' }), '/d.html');
  assert.equal(leafEntryUrl(null, {}), null);
});

test('atlas.json carries no build stamps, so a rebuild that changed nothing is no diff (G1)', () => {
  const atlas = JSON.parse(fs.readFileSync(new URL('../atlas/atlas.json', import.meta.url), 'utf8'));
  assert.equal('generated' in atlas, false);
  assert.equal('commit' in atlas, false);
});
