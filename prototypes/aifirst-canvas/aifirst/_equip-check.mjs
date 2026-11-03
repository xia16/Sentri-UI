// Quick check: a pens device lists its pens, its floor route stays in the aisles. Run: node _equip-check.mjs
import { applyOps, emptyDoc, kit, derive, penRanges } from './project/layout.engine.js';
let bad = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
const doc = emptyDoc(); doc.types = kit();
let r = applyOps(doc, [{ op: 'add_room', id: 'g', name: 'G', lanes: [{ runs: [{ type: 'gest', n: 10 }] }, { runs: [{ type: 'gest', n: 10 }] }, { runs: [{ type: 'gest', n: 10 }] }] },
  { op: 'add_device', room: 'g', id: 'cam', kind: 'camera', pens: ['A5', 'A6', 'B5', 'B6'] },
  { op: 'add_device', room: 'g', id: 'fd', kind: 'feeder', pens: ['C1', 'C2', 'C3'] },
  { op: 'add_device', room: 'g', id: 'cl', kind: 'climate', wall: 'back' },
  { op: 'add_device', room: 'g', id: 'nh', kind: 'nh3', u: 300, v: 600 }]);
const D = derive(r.doc).room.g, pens = D.pens, dv = (id) => D.devices.find((x) => x.id === id);
ok(penRanges(['A5', 'A6', 'B5', 'B6', 'B9']) === 'A5–A6, B5–B6, B9', 'ranges ' + penRanges(['A5', 'A6', 'B5', 'B6', 'B9']));
ok(dv('cam').where === 'Serves A5–A6, B5–B6' && !!dv('cam').route, 'camera serves ' + dv('cam').where);
const inPen = (u, v) => pens.some((p) => Math.abs(u - p.u) < p.su / 2 - 1 && Math.abs(v - p.v) < p.sv / 2 - 1);
const crosses = (g) => { for (let t = 0.02; t < 1; t += 0.02) { if (inPen(g[0] + (g[2] - g[0]) * t, g[1] + (g[3] - g[1]) * t)) return true; } return false; };
['cam', 'fd'].forEach((id) => { const segs = dv(id).route.segs; ok(segs.every((g) => !crosses(g)), id + ': ' + segs.length + ' segments, none inside a pen'); ok(segs.every((g) => g[0] === g[2] || g[1] === g[3]), id + ': straight lines only'); });
ok(dv('cam').route.segs.filter((g) => g[0] === g[2] && g[1] !== g[3]).length === 1, 'A and B share the aisle between them (one trunk)');
ok(/^Serves the room · on the back wall/.test(dv('cl').where), 'climate: ' + dv('cl').where);
ok(/^Hangs near pen /.test(dv('nh').where), 'ammonia: ' + dv('nh').where);
r = applyOps(r.doc, [{ op: 'set_device', room: 'g', device: 'cl', code: ' SN-4F2A-91 ', model: 'Fancom F38' }]);
ok(derive(r.doc).room.g.devices.find((x) => x.id === 'cl').code === 'SN-4F2A-91', 'set_device binds a code');
r = applyOps(r.doc, [{ op: 'set_device_pens', room: 'g', device: 'fd', pens: ['C1', 'C2', 'C3', 'C4'] }]);
ok(derive(r.doc).room.g.devices.find((x) => x.id === 'fd').where === 'Serves C1–C4', 'set_device_pens');
let threw = false; try { const q = applyOps(r.doc, [{ op: 'set_device_pens', room: 'g', device: 'cl', pens: ['A1'] }]); threw = !!(q.problems && q.problems.length); } catch (e) { threw = true; } ok(threw, 'a climate controller cannot take pens');
console.log(bad ? bad + ' failed' : 'all good'); process.exit(bad ? 1 : 0);
