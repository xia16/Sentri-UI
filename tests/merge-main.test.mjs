// The forward-merge helper's pure parts (scripts/merge-main.mjs): which conflicts it regenerates and which it leaves to you.
import test from 'node:test';
import assert from 'node:assert/strict';
import { GENERATED, classifyConflicts, toRegenerate, markerLines } from '../scripts/merge-main.mjs';

test('a conflict in a generated file is regenerated; every other conflict is left to you', () => {
  assert.deepEqual(classifyConflicts(['atlas/atlas.json', 'features/farrowing/feature.json', 'ux/design-system/tokens.css', 'ux/design-system/tokens.json']), {
    generated: ['atlas/atlas.json', 'ux/design-system/tokens.css'],
    other: ['features/farrowing/feature.json', 'ux/design-system/tokens.json'],
  });
  assert.deepEqual(classifyConflicts([]), { generated: [], other: [] });
  assert.deepEqual(classifyConflicts(['atlas/atlas.json.bak', 'tokens.css']).generated, [], 'only the exact generated paths');
});

test('the atlas is rebuilt on every merge; tokens.css when it conflicted or tokens.json changed', () => {
  assert.deepEqual(toRegenerate({}), ['atlas/atlas.json']);
  assert.deepEqual(toRegenerate({ changed: ['ux/design-system/tokens.json'] }), ['atlas/atlas.json', 'ux/design-system/tokens.css']);
  assert.deepEqual(toRegenerate({ conflicted: ['ux/design-system/tokens.css'] }), ['atlas/atlas.json', 'ux/design-system/tokens.css']);
  assert.deepEqual(toRegenerate({ changed: ['features/wean/PRD.md'] }), ['atlas/atlas.json']);
  for (const g of Object.values(GENERATED)) assert.ok(g.run.length && g.how, 'each generated file says how it is made');
});

test("a conflict marker is the gate's own: <<<<<<< or >>>>>>> at the start of a line", () => {
  assert.deepEqual(markerLines('a\n<<<<<<< HEAD\nb\n=======\nc\n>>>>>>> origin/main\n'), [2, 6]);
  assert.deepEqual(markerLines('Title\n=======\n  <<<<<<< quoted\n'), [], 'a setext heading or an indented quote is not a marker');
  assert.deepEqual(markerLines('<<<<<<<\r\n'), [1]);
});
