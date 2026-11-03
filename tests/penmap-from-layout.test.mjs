// The pen map contract (ux/model/pen-map-contract.md): rooms as the console derives them, turned into SentriUI.penMap props.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { penMapOf } from '../ux/system/penmap-from-layout.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const F = JSON.parse(fs.readFileSync(path.join(root, 'ux/system/penmap-from-layout.fixtures.json'), 'utf8'));
const of = (key) => penMapOf(F.rooms[key], F.types);
const runs = (lane) => lane.runs.map((u) => `${u.n} ${u.type} ${u.size}`).join(' + ');
const UI = (() => { const ctx = { console }; ctx.globalThis = ctx; ctx.window = ctx; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(root, 'ux/design-system/components/bundle.js'), 'utf8'), ctx); return ctx.SentriUI; })();

test('the four example farms', () => {
  const g = of('groupgest').props;
  assert.deepEqual(g.lanes.map((l) => l.letter + ': ' + runs(l)), ['A: 10 Group pen 483', 'B: 10 Group pen 483']);
  assert.deepEqual(g.rows.map((w) => w.letter + ' ' + w.at + ': ' + runs(w)), ['C far: 24 Gestation stall 65']);
  assert.deepEqual([g.aSide, g.entranceAt, g.backDoor, g.apart], ['left', 'middle', null, []]);
  const s = of('sketch').props;
  assert.deepEqual(s.rows.map((w) => w.letter + ': ' + runs(w)), ['C: 1 Sick pen, large 900']);
  assert.deepEqual(of('weaner').props.lanes.map(runs), ['4 Weaner pen 545', '4 Weaner pen 545']);
  assert.deepEqual(of('acres').props.lanes.map(runs), ['20 Farrowing crate 180', '20 Farrowing crate 180']);
  assert.equal(of('acres').pens.length, 40);
});

test('what the console can change that the phone must not notice', () => {
  const base = of('groupgest').props;
  for (const k of ['door+30', 'door-80', 'wider-group', 'aisle+40', 'moved-turned', 'side-door', 'outline', 'main-back'])
    assert.deepEqual(of('groupgest:' + k).props, base, k);
});

test('what the phone must notice', () => {
  assert.equal(of('groupgest:door-left-aisle').props.entranceAt, 'left');
  assert.deepEqual(of('groupgest:back-door').props.backDoor, { at: 'middle' });
  assert.equal(of('groupgest:a-right').props.aSide, 'right');
  const side = of('groupgest:main-left-far').props;
  assert.deepEqual([side.aSide, side.entranceAt], ['right', 'right'], 'a main door on the left wall near the far end: she faces back, the door on her right');
  assert.equal(of('groupgest:row-by-door').props.rows[0].at, 'door');
});

test('pens drawn by hand: one carries on its lane, one stands on its own', () => {
  const d = of('sketch:drawn');
  assert.deepEqual(d.props.lanes.map(runs), ['3 Sick pen 250', '2 Sick pen 250']);
  assert.deepEqual(d.props.apart, [{ code: 'C1', row: 2 }]);
  assert.deepEqual(d.pens.map((p) => p.code), ['A1', 'A2', 'B1', 'B2', 'A3', 'C1']);
});

test('a room of one pen has no map', () => {
  const one = { code: 'Z1-SICK-1', name: 'Sick 1', geom: { vflip: false, dW: 600, lanes: [{ i: 0, x0: 120, x1: 520, runs: [{ type: 'large', n: 1 }] }], ends: [], doors: [{ main: true, side: 'front', u: 300 }] }, pens: [{ code: 'A1', lane: 0, j: 0, v: 400, type: 'large' }], drawn: [] };
  assert.equal(penMapOf(one, F.types).map, false);
});

test('the props draw every pen the room has, and no other', () => {
  for (const [key, room] of Object.entries(F.rooms)) {
    const o = penMapOf(room, F.types), html = UI.penMap(Object.assign({}, o.props, { key: 'contract-' + key }));
    const drawn = [...html.matchAll(/data-pen="([^"]+)"/g)].map((m) => m[1]).sort();
    assert.deepEqual(drawn, o.pens.map((p) => p.code).sort(), key);
  }
});
