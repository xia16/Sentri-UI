// The pen map contract's fixtures (ux/model/pen-map-contract.md): rooms as the console engine derives them, trimmed to the
// fields the contract reads. Run it when the engine changes one of them.
// Usage: node scripts/penmap-fixtures.mjs <layout.engine.js> <farms dir> [out]   (out: ux/system/penmap-from-layout.fixtures.json)
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const [enginePath, farms, outArg] = process.argv.slice(2);
if (!enginePath || !farms) { console.error('usage: node scripts/penmap-fixtures.mjs <layout.engine.js> <farms dir> [out]'); process.exit(2); }
/* the engine is an ES module whatever its extension: load a copy named .mjs */
const tmp = path.join(path.dirname(path.resolve(enginePath)), '.penmap-engine.' + process.pid + '.mjs');
fs.copyFileSync(enginePath, tmp);
const { derive } = await import(pathToFileURL(tmp).href).finally(() => fs.unlinkSync(tmp));
const load = (f) => JSON.parse(fs.readFileSync(path.join(farms, f + '.json'), 'utf8'));
const trim = (r) => ({
  code: r.code, name: r.name,
  geom: {
    vflip: !!r.geom.vflip, dW: Math.round(r.geom.dW),
    lanes: r.geom.lanes.map((l) => ({ i: l.i, x0: Math.round(l.x0), x1: Math.round(l.x1), runs: l.runs.map((u) => ({ type: u.type, n: u.n })) })),
    ends: (r.geom.ends || []).map((e) => ({ i: e.i, at: e.at, runs: e.runs.map((u) => ({ type: u.type, n: u.n })) })),
    doors: r.geom.doors.map((d) => ({ main: d.main, side: d.side, u: Math.round(d.u) }))
  },
  pens: r.pens.map((p) => Object.assign({ code: p.code, lane: p.lane, j: p.j, v: Math.round(p.v), type: p.type }, p.end != null ? { end: p.end } : {})),
  drawn: r.drawn.map((p) => ({ code: p.code, lane: p.lane, v: Math.round(p.v), type: p.type }))
});
const out = { note: 'Rooms as the console engine derives them (layout.engine.js derive(), 2026-11-03), trimmed to the fields ux/model/pen-map-contract.md names. Regenerate when the engine changes.', types: {}, rooms: {} };
const add = (key, doc, k = 0) => { const d = derive(doc); d.types.forEach((t) => { out.types[t.id] = { name: t.name, w: t.w }; }); out.rooms[key] = trim(d.rooms[k]); return d.rooms[k]; };
for (const f of ['sketch', 'groupgest', 'weaner', 'acres']) add(f, load(f));
/* the gestation barn, changed the ways the console can change it */
const D = derive(load('groupgest')).rooms[0], off = D.doors[0].offset;
const variant = (key, fn) => { const d = load('groupgest'); fn(d.rooms[0], d); add('groupgest:' + key, d); };
variant('door+30', (r) => { r.doors = [{ wall: 'front', offset: off + 30, main: true }]; });
variant('door-80', (r) => { r.doors = [{ wall: 'front', offset: off - 80, main: true }]; });
variant('wider-group', (r, d) => { d.types.find((t) => t.id === 'group').l += 20; });
variant('aisle+40', (r) => { r.aisle = 160; });
variant('moved-turned', (r) => { r.at = { x: 5000, z: 900 }; r.rot = 90; });
variant('side-door', (r) => { r.doors = [{ wall: 'front', offset: off, main: true }, { wall: 'left', offset: 900 }]; });
variant('outline', (r) => { r.outline = [[0, 0], [1560, 0], [1560, 7000], [700, 7400], [0, 7000]]; });
variant('door-left-aisle', (r) => { r.doors = [{ wall: 'front', offset: 100, main: true }]; });
variant('back-door', (r) => { r.doors = [{ wall: 'front', offset: off, main: true }, { wall: 'back', offset: 500 }]; });
variant('a-right', (r) => { r.aLeft = false; });
variant('main-back', (r) => { r.doors = [{ wall: 'back', offset: D.geom.W / 2, main: true }]; });
variant('main-left-far', (r) => { r.doors = [{ wall: 'left', offset: 600, main: true }]; });
variant('row-by-door', (r) => { r.ends[0].at = 'door'; });
/* an imported layout with pens drawn by hand: one at the far end of lane A, one on its own */
{ const d = load('sketch'), r = d.rooms[0]; delete r.ends;
  const g0 = derive(d).rooms[0].geom, la = g0.lanes[0], end = g0.v0 + la.len;
  r.pens = [{ type: 'sick', polygon: [[la.x0 + 10, end + 20], [la.x1 - 10, end + 20], [la.x1 - 10, end + 300], [la.x0 + 10, end + 300]] }, { type: 'large', polygon: [[1300, 300], [1700, 300], [1700, 700], [1300, 700]] }];
  add('sketch:drawn', d); }
const dest = path.resolve(outArg || path.join(path.dirname(fileURLToPath(import.meta.url)), '../ux/system/penmap-from-layout.fixtures.json'));
/* never write over an input */
if (dest === path.resolve(enginePath) || dest.startsWith(path.resolve(farms) + path.sep)) { console.error('the output would overwrite an input: ' + dest); process.exit(2); }
fs.writeFileSync(dest, JSON.stringify(out, null, 1) + '\n');
console.log(Object.keys(out.rooms).length, 'rooms');
