// Quick engine check: repeated types in a lane, and grouping keeps the zone. Run: node _engine-check.mjs
import { applyOps, emptyDoc, kit, derive } from './project/layout.engine.js';
let bad = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
const doc = emptyDoc(); doc.types = kit();
const base = applyOps(doc, [
  { op: 'add_zone', id: 'z1', name: 'Production Zone 1', code: 'Z1' }, { op: 'add_zone', id: 'z2', name: 'Isolation Zone', code: 'Z2' },
  { op: 'add_section', id: 's1', name: 'Gestation', code: 'GES', zone: 'z1' }, { op: 'add_section', id: 's2', name: 'Farrowing', code: 'FAR', zone: 'z1' }, { op: 'add_section', id: 's3', name: 'Quarantine', code: 'QUA', zone: 'z2' },
  { op: 'add_room', id: 'a', name: 'Room A', section: 's1', lanes: [{ runs: [{ type: 'gest', n: 4 }] }] },
  { op: 'add_room', id: 'b', name: 'Room B', section: 's1', lanes: [{ runs: [{ type: 'gest', n: 4 }] }] },
  { op: 'add_room', id: 'c', name: 'Room C', section: 's2', lanes: [{ runs: [{ type: 'crate', n: 4 }] }] },
  { op: 'add_room', id: 'd', name: 'Room D', section: 's3', lanes: [{ runs: [{ type: 'group', n: 4 }] }] },
  { op: 'auto_layout' }]).doc;

// 1. a type may repeat anywhere in a lane
let r = applyOps(base, [{ op: 'set_lanes', room: 'a', lanes: [{ runs: [{ type: 'gilt', n: 3 }, { type: 'gest', n: 1 }, { type: 'gilt', n: 1 }] }] }]);
let D = derive(r.doc), pens = D.room.a.pens;
ok(pens.map((p) => p.code + ':' + p.type).join(' ') === 'A1:gilt A2:gilt A3:gilt A4:gest A5:gilt', 'gilt x3, stall x1, gilt x1 -> A1-A3 gilt, A4 stall, A5 gilt (' + pens.map((p) => p.code + ':' + p.type).join(' ') + ')');
ok(r.doc.rooms.find((x) => x.id === 'a').lanes[0].runs.length === 3, 'three runs kept');
ok(pens[3].v > pens[2].v && pens[4].v > pens[3].v, 'drawn in that order along the lane');
ok(D.room.a.places === 3 * 10 + 1 + 10, 'places count each run (' + D.room.a.places + ')');
// 2. neighbours of one type merge silently
r = applyOps(base, [{ op: 'set_lanes', room: 'a', lanes: [{ runs: [{ type: 'gilt', n: 2 }, { type: 'gilt', n: 3 }, { type: 'gest', n: 1 }] }] }]);
ok(JSON.stringify(r.doc.rooms[0].lanes[0].runs) === '[{"type":"gilt","n":5},{"type":"gest","n":1}]', 'two adjacent gilt runs merge to 5');
// 3. removing the middle run joins the neighbours
r = applyOps(applyOps(base, [{ op: 'set_lanes', room: 'a', lanes: [{ runs: [{ type: 'gilt', n: 3 }, { type: 'gest', n: 1 }, { type: 'gilt', n: 1 }] }] }]).doc, [{ op: 'remove', room: 'a', lane: 0, run: 1 }]);
D = derive(r.doc);
ok(D.room.a.pens.length === 4 && r.doc.rooms[0].lanes[0].runs.length === 1, 'remove the stall run -> the two gilt runs join into one of 4 (' + r.doc.rooms[0].lanes[0].runs.map((u) => u.type + u.n).join(',') + ')');
// 4. group keeps the zone
r = applyOps(base, [{ op: 'ungroup', section: 's1' }]);
ok(r.doc.rooms.find((x) => x.id === 'a').zone === 'z1' && r.doc.rooms.find((x) => x.id === 'a').section === '', 'ungroup section: rooms stay directly in the zone');
r = applyOps(r.doc, [{ op: 'group', rooms: ['a', 'b'], as: 'section', name: 'Gilts' }]);
let s = r.doc.sections.find((x) => x.name === 'Gilts');
ok(s && s.zone === 'z1', 'group the loose rooms -> Gilts is in Production Zone 1');
ok(derive(r.doc).sections.every((x) => x.zone), 'no section is loose');
// majority and tie
r = applyOps(base, [{ op: 'group', rooms: ['a', 'b', 'd'], as: 'section', name: 'Mixed' }]);
ok(r.doc.sections.find((x) => x.name === 'Mixed').zone === 'z1', 'two rooms from z1 and one from z2 -> z1');
r = applyOps(base, [{ op: 'group', rooms: ['d', 'a'], as: 'section', name: 'Tie' }]);
ok(r.doc.sections.find((x) => x.name === 'Tie').zone === 'z2', 'a tie goes to the first room (z2)');
r = applyOps(base, [{ op: 'group', rooms: ['a', 'd'], as: 'section', name: 'Tie2' }]);
ok(r.doc.sections.find((x) => x.name === 'Tie2').zone === 'z1', 'a tie goes to the first room (z1)');
// ungroup a zone: sections go to farm level (the one way to get loose sections)
r = applyOps(base, [{ op: 'ungroup', zone: 'z1' }]);
ok(r.doc.sections.filter((x) => !x.zone).length === 2 && !r.doc.zones.some((z) => z.id === 'z1'), 'ungroup a zone: its sections are loose at Farm level');
// 5. end rows: a row of pens across the room
{
  const d2 = emptyDoc(); d2.types = kit().concat([{ id: 'big', name: 'Sick pen, large', uses: ['Sick'], perPen: { Sick: 12 }, w: 700, l: 400, color: 7 }]);
  const b2 = applyOps(d2, [{ op: 'add_zone', id: 'z', name: 'Z', code: 'Z1' }, { op: 'add_section', id: 's', name: 'S', code: 'S', zone: 'z' }, { op: 'add_room', id: 'r', name: 'Sick room', section: 's', at: { x: 0, z: 0 }, lanes: [{ runs: [{ type: 'sick', n: 2 }] }, { runs: [{ type: 'sick', n: 2 }] }] }]).doc;
  const before = derive(b2).room.r.geom;
  let q = applyOps(b2, [{ op: 'add_end_row', room: 'r', at: 'far', type: 'big', n: 1 }]);
  D = derive(q.doc); pens = D.room.r.pens;
  ok(q.problems.length === 0 && pens.map((p) => p.code).join(' ') === 'A1 A2 B1 B2 C1', 'end row C after lanes A, B (' + pens.map((p) => p.code).join(' ') + ')');
  const c1 = pens.find((p) => p.code === 'C1'), a2 = pens.find((p) => p.code === 'A2');
  ok(c1.end === 0 && c1.v - c1.sv / 2 > a2.v + a2.sv / 2 - 1, 'C1 stands beyond the ends of the lanes');
  ok(D.room.r.geom.L > before.L && Math.abs(c1.u - D.room.r.geom.W / 2) < 1, 'the room grew deeper and C1 is centred across it');
  q = applyOps(q.doc, [{ op: 'set_end_row', room: 'r', end: 0, runs: [{ type: 'big', n: 1 }, { type: 'big', n: 1 }] }]);
  ok(q.doc.rooms[0].ends[0].runs.length === 1 && q.doc.rooms[0].ends[0].runs[0].n === 2, 'set_end_row merges neighbouring runs of one type');
  q = applyOps(q.doc, [{ op: 'add_end_row', room: 'r', at: 'door', type: 'sick', n: 3 }]);
  D = derive(q.doc);
  ok(D.room.r.pens.filter((p) => p.code[0] === 'D').length === 3 && D.room.r.pens.find((p) => p.code === 'A1').v > D.room.r.pens.find((p) => p.code === 'D1').v, 'an end row by the door stands before the lanes');
  q = applyOps(q.doc, [{ op: 'remove', room: 'r', pen: 'C2' }]);
  ok(q.doc.rooms[0].ends[0].runs[0].n === 1 && q.problems.length === 0, 'removing a pen of an end row shortens it');
  q = applyOps(q.doc, [{ op: 'remove_end_row', room: 'r', end: 0 }]);
  ok(q.doc.rooms[0].ends.length === 1 && derive(q.doc).room.r.pens.some((p) => p.code === 'C1'), 'removing end row C: the next one is lettered C');
  // the group-gestation barn: 20 group pens and 24 stalls in an end row make the plan's 53.85 m
  const g = applyOps(emptyDoc(), [{ op: 'add_pen_type', id: 'group', name: 'Group pen', uses: ['Gestation'], per: 14, w: 483, l: 564 }, { op: 'add_pen_type', id: 'stall', name: 'Gestation stall', uses: ['Gestation'], per: 1, w: 65, l: 210 }, { op: 'add_zone', name: 'Z' }, { op: 'add_section', name: 'S', zone: 'Z' }, { op: 'add_room', name: 'Barn', section: 'S', at: { x: 0, z: 0 }, aisle: { wall: 0, between: 92 }, lanes: [{ runs: [{ type: 'group', n: 10 }] }, { runs: [{ type: 'group', n: 10 }] }], ends: [{ at: 'far', runs: [{ type: 'stall', n: 24 }] }] }]);
  const gg = derive(g.doc);
  ok(Math.abs(gg.rooms[0].geom.ol - 5385) < 1 && gg.totals.places === 304, 'group gestation barn is ' + (gg.rooms[0].geom.ol / 100).toFixed(2) + ' m long, 304 places');
}
console.log(bad ? bad + ' FAILED' : 'all ok'); process.exit(bad ? 1 : 0);
