// Layout engine: the farm as a plain document (JSON, centimetres) and every rule that turns it into geometry.
// Pure functions only. No DOM, no three.js. The page draws derive(doc); an agent writes ops.
// See layout.schema.md for the document.

export const USES = ['Gestation', 'Farrowing', 'Nursery', 'Finishing', 'Gilts', 'Boars', 'Sick'];
const TW = 25; // wall thickness
const FRONT = 190; // from the door wall to the first pen
const BACK = 90; // behind the last pen
const AISLE = 120;
const GAP = 30; // between two runs of one lane
const END_GAP = 15; // between the lanes and an end row, and between two end rows

const clone = (o) => JSON.parse(JSON.stringify(o));
const letter = (i) => String.fromCharCode(65 + i);
const round = (v) => Math.round(v);
const num = (v) => typeof v === 'number' && isFinite(v);

// ---------- pen types ----------
export function typical(use, per) {
  const t = { Gestation: per > 1 ? [300, 500] : [65, 210], Farrowing: [180, 270], Nursery: [150, 240], Finishing: [300, 350], Gilts: [300, 500], Boars: [300, 350], Sick: per >= 8 ? [400, 700] : [250, 400] };
  return t[use] || [200, 300];
}
export function typicalPer(use) { return { Gestation: 1, Farrowing: 1, Nursery: 10, Finishing: 12, Gilts: 10, Boars: 1, Sick: 4 }[use] || 1; }
// a typical floor space per pig (m2): floor area / this, rounded down, is only a starting number for a group pen
export function spaceOf(use) { return { Gestation: 2.5, Sick: 2.5, Gilts: 1.8, Boars: 6, Nursery: 0.35, Finishing: 0.8 }[use] || 2.5; }
export function areaPer(use, w, l) { if (use === 'Farrowing') return 1; return Math.max(1, Math.floor((w * l / 10000) / spaceOf(use))); }
export function nouns(use) {
  return { Gestation: ['sow', 'sows'], Farrowing: ['sow + litter', 'sows + litters'], Nursery: ['piglet', 'piglets'], Gilts: ['gilt', 'gilts'], Boars: ['boar', 'boars'] }[use] || ['pig', 'pigs'];
}
export function heightOf(use) { return { Gestation: 50, Boars: 60, Farrowing: 50, Nursery: 42, Finishing: 45, Gilts: 45, Sick: 45 }[use] || 45; }
export function kit() {
  const T = (id, name, use, per, w, l, color) => ({ id: id, name: name, uses: [use], perPen: { [use]: per }, w: w, l: l, color: color });
  return [
    T('gest', 'Gestation stall', 'Gestation', 1, 65, 210, 0),
    T('boar', 'Boar pen', 'Boars', 1, 300, 350, 1),
    T('crate', 'Farrowing crate', 'Farrowing', 1, 180, 270, 2),
    T('nurs', 'Nursery pen', 'Nursery', 10, 150, 240, 3),
    T('gilt', 'Gilt pen', 'Gilts', 10, 300, 500, 4),
    T('sick', 'Sick pen', 'Sick', 2, 250, 400, 5),
    { id: 'group', name: 'Group pen', uses: ['Gestation', 'Gilts', 'Boars', 'Nursery'], perPen: { Gestation: 6, Gilts: 8, Boars: 2, Nursery: 42 }, w: 300, l: 500, color: 6 }
  ];
}
export function emptyDoc() { return { version: 1, types: [], zones: [], sections: [], rooms: [] }; }
export function usualDoc() { const d = emptyDoc(); d.types = kit(); return d; }

export function typeInfo(t) {
  const nu = nouns(t.uses[0]), low = t.name.toLowerCase();
  return { per: t.perPen[t.uses[0]], u1: nu[0], uN: nu[1], s1: low, s2: low + 's' };
}
const slug = (s) => String(s || 'x').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'x';
export function suggestCode(name) {
  const w = String(name || '').replace(/[^A-Za-z0-9 ]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (!w.length) return 'NEW';
  if (w.length === 1) return w[0].slice(0, 3).toUpperCase();
  const last = w[w.length - 1];
  // 'Farrowing B' and 'Nursery 2' keep their letter or number; other names take the first three letters
  if (last.length === 1) return (w[0].slice(0, 2) + last).toUpperCase();
  return w[0].slice(0, 3).toUpperCase();
}

// ---------- plain geometry ----------
export function polyArea(pts) { let a = 0; pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; }); return a / 2; }
export function inPoly(pts, x, z) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}
function segCross(a, b, c, d) {
  const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const d1 = o(a, b, c), d2 = o(a, b, d), d3 = o(c, d, a), d4 = o(c, d, b);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}
// shortest distance between two segments in cm: 0 when they cross or touch
export function segDist(a, b, c, d) {
  if (segCross(a, b, c, d)) return 0;
  const ps = (p, q, r) => { const dx = r[0] - q[0], dz = r[1] - q[1], l2 = dx * dx + dz * dz; let t = l2 ? ((p[0] - q[0]) * dx + (p[1] - q[1]) * dz) / l2 : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(p[0] - q[0] - t * dx, p[1] - q[1] - t * dz); };
  return Math.min(ps(a, c, d), ps(b, c, d), ps(c, a, b), ps(d, a, b));
}
// two edges that share a corner s run out to p and q: they fold back on each other when p and q lie the same way from s
export function foldsBack(s, p, q) {
  const ax = p[0] - s[0], az = p[1] - s[1], bx = q[0] - s[0], bz = q[1] - s[1];
  const la = Math.hypot(ax, az), lb = Math.hypot(bx, bz);
  if (!la || !lb) return true;
  return Math.abs(ax * bz - az * bx) / (la * lb) < 0.02 && ax * bx + az * bz > 0;
}
// why an outline [[u, v] in cm] cannot be a pen: '' when it can
export function outlineIssue(pts) {
  const n = pts.length;
  if (n < 3) return 'needs at least 3 corners';
  for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 5) return 'has two corners on the same spot'; }
  for (let i = 0; i < n; i++) {
    if (foldsBack(pts[(i + 1) % n], pts[i], pts[(i + 2) % n])) return 'folds back on itself';
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      if (segDist(pts[i], pts[(i + 1) % n], pts[j], pts[(j + 1) % n]) < 2) return 'crosses itself';
    }
  }
  if (Math.abs(polyArea(pts)) < 1000) return 'is too small';
  return '';
}
// do the insides of two polygons share any floor? touching along an edge does not count
export function polysOverlap(A, B) {
  if (A.some((p) => inPoly(B, p[0], p[1]) && !onEdge(B, p)) || B.some((p) => inPoly(A, p[0], p[1]) && !onEdge(A, p))) return true;
  for (let i = 0; i < A.length; i++) for (let j = 0; j < B.length; j++) if (segCross(A[i], A[(i + 1) % A.length], B[j], B[(j + 1) % B.length])) return true;
  // identical or nested with all vertices on the other's edge: test a few interior points
  const mid = (P) => { let x = 0, z = 0; P.forEach((p) => { x += p[0]; z += p[1]; }); return [x / P.length, z / P.length]; };
  const ma = mid(A), mb = mid(B);
  return (inPoly(B, ma[0], ma[1]) && inPoly(A, ma[0], ma[1])) || (inPoly(A, mb[0], mb[1]) && inPoly(B, mb[0], mb[1]));
}
function onEdge(P, p) {
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length];
    const cr = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    if (Math.abs(cr) / len < 1.5 && p[0] >= Math.min(a[0], b[0]) - 1.5 && p[0] <= Math.max(a[0], b[0]) + 1.5 && p[1] >= Math.min(a[1], b[1]) - 1.5 && p[1] <= Math.max(a[1], b[1]) + 1.5) return true;
  }
  return false;
}
const rectPoly = (u, v, su, sv) => [[u - su / 2, v - sv / 2], [u + su / 2, v - sv / 2], [u + su / 2, v + sv / 2], [u - su / 2, v + sv / 2]];

// ---------- one room ----------
function aisleOf(room) {
  const a = room.aisle;
  if (a == null) return { wall: AISLE, between: AISLE };
  if (typeof a === 'number') return { wall: a, between: a };
  return { wall: a.wall != null ? a.wall : AISLE, between: a.between != null ? a.between : AISLE };
}
const quarter = (room) => (((Math.round((room.rot || 0) / 90)) % 4) + 4) % 4;
const WALLS = { south: 0, east: 1, north: 2, west: 3 };
export const wallOfRot = (rot) => ['south', 'east', 'north', 'west'][(((Math.round(rot / 90)) % 4) + 4) % 4];

// ---------- doors ----------
// A room has one or more doors, each on a wall at a distance along it: { wall, offset, main }.
// wall is front, right, back or left (the room's own sides: the front is where lane pens are counted from in a
// plain rectangle), or the number of a wall of a drawn outline. offset is cm along that wall from its first corner.
// Exactly one door is the main door: pens are numbered from it, as the phone's pen map does.
// Old documents have no list: { door: { offset } } is the main door on the front wall.
export const DOOR_W = 160; // the opening
const DOOR_GAP = 40; // between two doors on one wall
const DOOR_EDGE = DOOR_W / 2 + 30; // from a corner
const WALL_NAMES = ['front', 'right', 'back', 'left'];
function edgeOf(cps, i) {
  const n = cps.length, a = cps[i], b = cps[(i + 1) % n];
  const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz) || 1, sg = polyArea(cps) >= 0 ? 1 : -1;
  return { i: i, a: a, len: len, tu: dx / len, tv: dz / len, nu: sg * dz / len, nv: -sg * dx / len };
}
// which side of the room an outward normal looks at
const sideOfNormal = (nu, nv) => (Math.abs(nv) >= Math.abs(nu) ? (nv < 0 ? 'front' : 'back') : (nu > 0 ? 'right' : 'left'));
function wallIndex(room, cps, w) {
  const n = cps.length;
  if (typeof w === 'number') return room.outline && room.outline.length ? Math.max(0, Math.min(n - 1, Math.round(w))) : ((Math.round(w) % 4) + 4) % 4;
  const k = WALL_NAMES.indexOf(w);
  if (k < 0) return -1;
  if (!(room.outline && room.outline.length)) return k;
  let best = -1, bl = -1;
  for (let i = 0; i < n; i++) { const e = edgeOf(cps, i); if (sideOfNormal(e.nu, e.nv) === w && e.len > bl) { bl = e.len; best = i; } }
  return best;
}
// the old front door, found on whichever wall stands frontmost at that distance from the left
function frontEdge(cps, u) {
  let best = -1, bv = 1e9, bo = 0;
  for (let i = 0; i < cps.length; i++) {
    const a = cps[i], b = cps[(i + 1) % cps.length];
    if (Math.abs(b[0] - a[0]) < 5) continue;
    const lo = Math.min(a[0], b[0]), hi = Math.max(a[0], b[0]);
    if (u < lo - 1 || u > hi + 1) continue;
    const t = (u - a[0]) / (b[0] - a[0]), v = a[1] + (b[1] - a[1]) * t;
    if (v < bv) { bv = v; best = i; bo = Math.hypot(u - a[0], v - a[1]); }
  }
  return best < 0 ? { i: 0, off: u } : { i: best, off: bo };
}
// the doors as derived: where each stands, and which way the pens are counted
function readDoors(room, cps, autoU) {
  let list;
  if (Array.isArray(room.doors) && room.doors.length) list = room.doors.map((d) => ({ wall: d.wall, offset: d.offset, main: !!d.main }));
  else {
    const u = room.door && num(room.door.offset) ? room.door.offset : autoU;
    const fe = frontEdge(cps, u);
    list = [{ wall: fe.i, offset: fe.off, main: true }];
  }
  let mi = list.findIndex((d) => d.main);
  if (mi < 0) mi = 0;
  return list.map((d, k) => {
    let wi = wallIndex(room, cps, d.wall);
    if (wi < 0) wi = 0;
    const e = edgeOf(cps, wi);
    let off = num(d.offset) ? d.offset : e.len / 2;
    off = e.len >= 2 * DOOR_EDGE ? Math.min(e.len - DOOR_EDGE, Math.max(DOOR_EDGE, off)) : e.len / 2;
    return { i: k, main: k === mi, wall: wi, side: sideOfNormal(e.nu, e.nv), offset: off, len: e.len, u: e.a[0] + e.tu * off, v: e.a[1] + e.tv * off, nu: e.nu, nv: e.nv, tu: e.tu, tv: e.tv };
  });
}

// ---------- devices (a capability preview: nothing reads from them yet) ----------
// A device kind says what it serves:
//   room  the whole room's air (a climate controller, a fan): on a wall or hung anywhere, nothing to point at
//   spot  a reading where it hangs (temperature, ammonia): it is near a pen, never for one
//   pens  some pens (a feeder line, a camera, heat lamps, a moving floor): it lists them, and its line runs on the floor
// A room lists devices: { id, kind, pens: ['A1', ...] } for a pens kind (an old { pen } still reads as one pen),
// { id, kind, wall, offset } on a wall, or { id, kind, u, v } hung in the room. u, v are cm in the room's own frame.
// Any device may carry code (the code on its label that binds it to the real device) and model; nothing reads them yet.
export const DEVICE_KINDS = [
  { id: 'climate', name: 'Climate controller', short: 'Climate', serves: 'room' },
  { id: 'fan', name: 'Ventilation fan', short: 'Fan', serves: 'room' },
  { id: 'temp', name: 'Temperature and humidity sensor', short: 'Temp and humidity', serves: 'spot' },
  { id: 'nh3', name: 'Ammonia sensor', short: 'Ammonia', serves: 'spot' },
  { id: 'feeder', name: 'Feeder', short: 'Feeder', serves: 'pens' },
  { id: 'water', name: 'Water line', short: 'Water', serves: 'pens' },
  { id: 'heat', name: 'Heat lamps', short: 'Heat lamps', serves: 'pens' },
  { id: 'camera', name: 'Camera', short: 'Camera', serves: 'pens' },
  { id: 'floor', name: 'Moving floor', short: 'Moving floor', serves: 'pens' },
  { id: 'scale', name: 'Scale', short: 'Scale', serves: 'pens' }
];
const deviceKind = (k) => DEVICE_KINDS.find((x) => x.id === k) || null;
// pen codes said short: A1–A4, B7
export function penRanges(codes) {
  const by = {};
  codes.forEach((c) => { const m = /^([A-Z]+)(\d+)$/.exec(c); if (m) (by[m[1]] = by[m[1]] || []).push(+m[2]); });
  return Object.keys(by).sort().map((L) => {
    const ns = by[L].sort((a, b) => a - b), out = [];
    let a = ns[0], b = ns[0];
    ns.slice(1).concat([null]).forEach((n) => { if (n === b + 1) b = n; else { out.push(a === b ? L + a : L + a + '–' + L + b); a = n; b = n; } });
    return out.join(', ');
  }).join(', ');
}
// a pens device's line on the floor: it starts in the cross aisle by the door, runs up the aisles beside the lanes it serves,
// and sends a short stub to each pen's edge. It stays in the aisles, so it never crosses a pen. Segments are [u1, v1, u2, v2] in cm.
export function routeOf(codes, pens, cps) {
  const S = codes.map((c) => pens.find((p) => p.code === c)).filter((p) => p && p.shape == null);
  if (!S.length || !cps || !cps.length) return null;
  const us = cps.map((c) => c[0]), vs = cps.map((c) => c[1]);
  const U0 = Math.min(...us), U1 = Math.max(...us), V0 = Math.min(...vs), V1 = Math.max(...vs);
  const lanes = {};
  pens.filter((p) => p.end == null && p.shape == null && p.lane != null).forEach((p) => {
    const L = lanes[p.lane] || (lanes[p.lane] = { i: p.lane, uc: p.u, half: 0, vmin: Infinity, vmax: -Infinity, first: null, last: null });
    L.half = Math.max(L.half, p.su / 2 + 7); L.vmin = Math.min(L.vmin, p.v - p.sv / 2); L.vmax = Math.max(L.vmax, p.v + p.sv / 2);
    if (!L.first || p.j < L.first.j) L.first = p;
    if (!L.last || p.j > L.last.j) L.last = p;
  });
  const LS = Object.values(lanes).sort((a, b) => a.uc - b.uc);
  const all = pens.filter((p) => p.shape == null);
  const doorLow = LS.length ? LS.every((L) => !L.last || L.first.v <= L.last.v) : true;
  const near = doorLow ? Math.min(...all.map((p) => p.v - p.sv / 2)) : Math.max(...all.map((p) => p.v + p.sv / 2));
  const vf = doorLow ? Math.max(V0 + 20, near - 28) : Math.min(V1 - 20, near + 28);
  // the aisles: left of the first lane, between lanes, right of the last; one is there only if it is 40 cm or more
  const n = LS.length, aisles = [];
  for (let k = 0; k <= n; k++) {
    const lo = k === 0 ? U0 : LS[k - 1].uc + LS[k - 1].half, hi = k === n ? U1 : LS[k].uc - LS[k].half;
    aisles.push(hi - lo >= 40 ? (lo + hi) / 2 : null);
  }
  const segs = [], use = {}, beside = {};
  const mark = (k, v) => { (beside[k] = beside[k] || []).push(v); };
  const take = (k, v) => { use[k] = use[k] == null ? v : (Math.abs(v - vf) > Math.abs(use[k] - vf) ? v : use[k]); };
  // lane pens: each lane is served from one aisle beside it; two neighbouring lanes share the aisle between them
  const servedLanes = [...new Set(S.filter((p) => p.end == null).map((p) => p.lane))].map((i) => LS.findIndex((L) => L.i === i)).filter((x) => x >= 0).sort((a, b) => a - b);
  const side = {};
  servedLanes.forEach((pos, q) => {
    const left = pos, right = pos + 1;
    let k;
    if (use[left] != null || side[pos - 1] === left) k = left;
    else if (servedLanes[q + 1] === pos + 1 && aisles[right] != null) k = right;
    else k = aisles[right] != null ? right : (aisles[left] != null ? left : null);
    if (k == null) return;
    side[pos] = k;
    use[k] = use[k] == null ? vf : use[k];
  });
  S.filter((p) => p.end == null).forEach((p) => {
    const pos = LS.findIndex((L) => L.i === p.lane), k = side[pos];
    if (k == null) return;
    const ua = aisles[k], L = LS[pos], edge = k === pos ? L.uc - L.half + 4 : L.uc + L.half - 4;
    take(k, p.v); mark(k, p.v);
    segs.push([ua, p.v, edge, p.v]);
  });
  // row pens (across the room): from the nearest aisle, along the gap in front of the row, then in
  const laneMid = LS.length ? (Math.min(...LS.map((L) => L.vmin)) + Math.max(...LS.map((L) => L.vmax))) / 2 : (V0 + V1) / 2;
  S.filter((p) => p.end != null).forEach((p) => {
    let k = null;
    aisles.forEach((a, i) => { if (a != null && (k == null || Math.abs(a - p.u) < Math.abs(aisles[k] - p.u))) k = i; });
    if (k == null) return;
    const toward = p.v > laneMid ? -1 : 1, edge = p.v + toward * (p.sv / 2 - 4), gap = p.v + toward * (p.sv / 2 + 8);
    take(k, gap); mark(k, gap);
    if (Math.abs(aisles[k] - p.u) > 1) segs.push([aisles[k], gap, p.u, gap]);
    segs.push([p.u, gap, p.u, edge]);
  });
  const ks = Object.keys(use).map(Number).sort((a, b) => a - b);
  if (!ks.length) return null;
  ks.forEach((k) => { if (Math.abs(use[k] - vf) > 1) segs.unshift([aisles[k], vf, aisles[k], use[k]]); });
  if (ks.length > 1) segs.unshift([aisles[ks[0]], vf, aisles[ks[ks.length - 1]], vf]);
  // the device stands in its aisle beside the middle of the pens it serves
  const k0 = ks.find((k) => beside[k]) != null ? ks.find((k) => beside[k]) : ks[0], nv = beside[k0] || [vf];
  return { segs: segs.map((g) => g.map((x) => Math.round(x))), u: Math.round(aisles[k0]), v: Math.round((Math.min(...nv) + Math.max(...nv)) / 2) };
}
function devicesOf(room, cps, pens) {
  return (room.devices || []).map((x, i) => {
    const kd = deviceKind(x.kind) || { id: x.kind, name: String(x.kind), short: String(x.kind), serves: 'spot' };
    let u = num(x.u) ? x.u : 0, v = num(x.v) ? x.v : 0, at = 'room', where = 'In the room', route = null;
    const list = Array.isArray(x.pens) ? x.pens.slice() : (x.pen ? [x.pen] : []);
    if (kd.serves === 'pens') {
      const there = list.filter((c) => pens.some((p) => p.code === c));
      route = routeOf(there, pens, cps);
      if (route) { u = route.u; v = route.v; at = 'floor'; }
      where = there.length ? 'Serves ' + penRanges(there) : 'Serves no pens yet';
      if (there.length < list.length) where += ' (' + (list.length - there.length) + ' not there now)';
    } else if (x.wall != null && cps && cps.length) {
      const wi = wallIndex(room, cps, x.wall);
      if (wi >= 0) { const e = edgeOf(cps, wi), off = num(x.offset) ? Math.min(e.len, Math.max(0, x.offset)) : e.len / 2; u = e.a[0] + e.tu * off; v = e.a[1] + e.tv * off; at = 'wall'; where = 'On the ' + sideOfNormal(e.nu, e.nv) + ' wall'; }
    } else if (x.pen) {
      const p = pens.find((q) => q.code === x.pen);
      if (p) { u = p.u; v = p.v; } at = 'room';
    }
    if (kd.serves !== 'pens' && at !== 'wall') {
      let best = null;
      pens.forEach((p) => { const dd = Math.hypot(p.u - u, p.v - v); if (!best || dd < best.d) best = { d: dd, code: p.code }; });
      where = best && best.d < 500 ? 'Hangs near pen ' + best.code : 'Hangs in the room';
    }
    if (kd.serves === 'room') where = 'Serves the room · ' + where.charAt(0).toLowerCase() + where.slice(1);
    return { i: i, id: x.id || 'dev' + i, kind: x.kind, name: kd.name, short: kd.short, serves: kd.serves, at: at, where: where, u: u, v: v, pen: x.pen || '', pens: list, route: route, code: x.code || '', model: x.model || '' };
  });
}
// where the lanes stand: the main door decides which end pens are counted from and which lane is A
function orientOf(main, aLeft, L) {
  const A = aLeft !== false;
  if (main.side === 'front') return { rev: !A, vflip: false };
  if (main.side === 'back') return { rev: A, vflip: true };
  if (main.side === 'left') return { rev: !A, vflip: main.v > L / 2 };
  return { rev: A, vflip: main.v > L / 2 };
}

// the room's frame: u across from the left wall as you walk in, v away from the door wall. Lanes run along v.
export function roomGeom(room, tm) {
  const al = aisleOf(room);
  const lanesIn = room.lanes || [];
  const endsIn = room.ends || [];
  const n = lanesIn.length;
  const tyOf = (u) => tm[u.type] || { id: u.type, name: '?', uses: ['Gestation'], perPen: { Gestation: 1 }, w: 100, l: 100 };
  // the lanes: how deep each is and what its runs are, before anyone knows which side is A
  const dims = lanesIn.map((l) => {
    let dm = 0, len = 0, nn = 0;
    const runs = l.runs.map((u, kk) => {
      const t = tyOf(u);
      dm = Math.max(dm, t.l);
      const o = { k: kk, type: u.type, w: t.w, d: t.l, h: heightOf(t.uses[0]), n: u.n, off: len, i0: nn };
      len += u.n * t.w + (kk < l.runs.length - 1 ? GAP : 0);
      nn += u.n;
      return o;
    });
    return { dm: dm, len: len, nn: nn, runs: runs };
  });
  // end rows: a row of pens across the room, at the far end or by the main door.
  // A pen's w runs along the row (its frontage), its l is how deep it stands.
  const edims = endsIn.map((e, k) => {
    let len = 0, depth = 0, nn = 0;
    const runs = e.runs.map((u, kk) => {
      const t = tyOf(u);
      depth = Math.max(depth, t.l);
      const o = { k: kk, type: u.type, w: t.w, d: t.l, h: heightOf(t.uses[0]), n: u.n, off: len, i0: nn };
      len += u.n * t.w + (kk < e.runs.length - 1 ? GAP : 0);
      nn += u.n;
      return o;
    });
    return { k: k, at: e.at === 'door' ? 'door' : 'far', runs: runs, len: len, depth: depth, n: nn };
  });
  const maxLen = Math.max(0, ...dims.map((d) => d.len));
  const doorRows = edims.filter((e) => e.at === 'door'), farRows = edims.filter((e) => e.at === 'far');
  // the lanes start after the clearance by the door and any end row standing there
  let v0 = FRONT;
  doorRows.forEach((e) => { e.v0 = v0; v0 += e.depth + END_GAP; });
  let vEnd = v0 + maxLen;
  farRows.forEach((e, q) => { e.v0 = vEnd + (n || q > 0 || doorRows.length ? END_GAP : 0); vEnd = e.v0 + e.depth; });
  const endW = Math.max(0, ...edims.map((e) => e.len + 2 * al.wall));
  const standAt = (rev, shift) => {
    const order = dims.map((_, i) => i);
    if (rev) order.reverse();
    const lanes = new Array(n);
    let cx = al.wall + shift;
    order.forEach((i, k) => { const d = dims[i]; lanes[i] = { i: i, x0: cx, x1: cx + d.dm, runs: d.runs, len: d.len, n: d.nn }; cx += d.dm + (k < n - 1 ? al.between : al.wall); });
    return { lanes: lanes, W: n ? cx : 900 };
  };
  const wl = standAt(room.aLeft === false, 0).W;
  // an end row wider than the lanes widens the room; the lanes then stand in the middle of it
  const shift = n && endW > wl ? (endW - wl) / 2 : 0;
  const stand = (rev) => standAt(rev, shift);
  let st = stand(room.aLeft === false);
  let W = Math.max(n ? st.W + shift : 900, endW);
  let L = n || edims.length ? Math.max(vEnd + BACK, 600) : 2400;
  // pens drawn by hand may stand past the rectangle the lanes make: the room grows to hold them
  (room.pens || []).forEach((p) => p.polygon.forEach((q) => { W = Math.max(W, q[0] + 60); L = Math.max(L, q[1] + BACK); }));
  const dW = W, dL = L;
  let ou = 0, ov = 0;
  if (room.outline && room.outline.length) {
    let a = 1e9, b = -1e9, c = 1e9, d = -1e9;
    room.outline.forEach((p) => { a = Math.min(a, p[0]); b = Math.max(b, p[0]); c = Math.min(c, p[1]); d = Math.max(d, p[1]); });
    ou = Math.max(0, -a); ov = Math.max(0, -c);
    W = Math.max(dW, b) + ou; L = Math.max(dL, d) + ov;
  }
  const cps = room.outline && room.outline.length ? room.outline : [[0, 0], [W, 0], [W, L], [0, L]];
  // a door that was never moved opens on the aisle nearest the middle of the front wall
  let autoU = W / 2;
  if (!(Array.isArray(room.doors) && room.doors.length) && !(room.door && num(room.door.offset))) {
    const cand = [];
    if (al.wall > 0) { cand.push(al.wall / 2); cand.push(W - al.wall / 2); }
    const byX = st.lanes.slice().sort((a, b) => a.x0 - b.x0);
    for (let k = 0; k + 1 < byX.length; k++) cand.push((byX[k].x1 + byX[k + 1].x0) / 2);
    if (cand.length) autoU = cand.reduce((b, c) => (Math.abs(c - W / 2) < Math.abs(b - W / 2) ? c : b), cand[0]);
  }
  const doors = readDoors(room, cps, Math.min(Math.max(autoU, 110), W - 110));
  const main = doors.find((d) => d.main);
  const o = orientOf(main, room.aLeft, dL);
  if (o.rev !== (room.aLeft === false)) { st = stand(o.rev); }
  // each end row is centred across the room; it is counted from the side lane A is on
  const ends = edims.map((e) => ({ i: n + e.k, k: e.k, at: e.at, v0: e.v0, depth: e.depth, len: e.len, n: e.n, runs: e.runs, u0: (dW - e.len) / 2 }));
  const ow = W + 2 * TW, ol = L + 2 * TW;
  const odd = quarter(room) % 2 === 1;
  return { W: W, L: L, dW: dW, dL: dL, ou: ou, ov: ov, TW: TW, FRONT: FRONT, BACK: BACK, v0: v0, aisle: al, lanes: st.lanes, ends: ends, doors: doors, doorX: main.side === 'front' ? main.u : W / 2, vflip: o.vflip, rev: o.rev, entry: main.side, ow: ow, ol: ol, fw: odd ? ol : ow, fl: odd ? ow : ol };
}
export function cornersOf(room, gm) { return room.outline && room.outline.length ? room.outline : [[0, 0], [gm.W, 0], [gm.W, gm.L], [0, gm.L]]; }
export const typesMap = (doc) => { const m = {}; doc.types.forEach((t) => { m[t.id] = t; }); return m; };
const fpOf = (room, gm) => { const a = room.at || { x: 0, z: 0 }; return { x0: a.x, z0: a.z, x1: a.x + gm.fw, z1: a.z + gm.fl }; };
const overlapBox = (a, b, gap) => a.x0 < b.x1 + gap && a.x1 > b.x0 - gap && a.z0 < b.z1 + gap && a.z1 > b.z0 - gap;
const bboxOf = (bs) => { const b = { x0: 1e9, z0: 1e9, x1: -1e9, z1: -1e9 }; bs.forEach((f) => { b.x0 = Math.min(b.x0, f.x0); b.z0 = Math.min(b.z0, f.z0); b.x1 = Math.max(b.x1, f.x1); b.z1 = Math.max(b.z1, f.z1); }); return b; };
const padBox = (b, p) => ({ x0: b.x0 - p, x1: b.x1 + p, z0: b.z0 - p, z1: b.z1 + p });
const unionBox = (a, b) => ({ x0: Math.min(a.x0, b.x0), z0: Math.min(a.z0, b.z0), x1: Math.max(a.x1, b.x1), z1: Math.max(a.z1, b.z1) });

// ---------- the patches under the rooms ----------
// A section hugs its rooms (+2 m) and a zone hugs its sections (+3 m). One with nothing in it is a placeholder at the
// spot it was put (`at`, the middle, in cm): a section 24 x 16 m, a zone 48 x 32 m.
export const EMPTY_SECTION = { w: 2400, h: 1600 };
export const EMPTY_ZONE = { w: 4800, h: 3200 };
const zoneIdOfRoom = (doc, r) => { const s = r.section ? doc.sections.find((x) => x.id === r.section) : null; return s ? (s.zone || '') : (r.zone || ''); };
function patchBoxes(doc, fps, hints) {
  hints = hints || {};
  const sec = {}, zone = {};
  doc.sections.forEach((s) => {
    const rs = doc.rooms.filter((r) => r.section === s.id && fps[r.id]);
    if (rs.length) { sec[s.id] = { hull: padBox(bboxOf(rs.map((r) => fps[r.id])), 200), empty: false }; return; }
    const h = s.at || hints[s.id];
    const zr = doc.rooms.filter((r) => s.zone && zoneIdOfRoom(doc, r) === s.zone && fps[r.id]);
    const zb = zr.length ? bboxOf(zr.map((r) => fps[r.id])) : null;
    const c = h || (zb ? { x: zb.x1 + EMPTY_SECTION.w / 2 + 500, z: zb.z0 + EMPTY_SECTION.h / 2 } : { x: 0, z: 0 });
    sec[s.id] = { hull: { x0: c.x - EMPTY_SECTION.w / 2, x1: c.x + EMPTY_SECTION.w / 2, z0: c.z - EMPTY_SECTION.h / 2, z1: c.z + EMPTY_SECTION.h / 2 }, empty: true };
  });
  doc.zones.forEach((z) => {
    let b = null;
    const add = (rc) => { b = b ? unionBox(b, rc) : Object.assign({}, rc); };
    doc.sections.forEach((s) => { if (s.zone === z.id) add(sec[s.id].hull); });
    doc.rooms.forEach((r) => { if (!r.section && r.zone === z.id && fps[r.id]) add(fps[r.id]); });
    const c = z.at;
    const yard = c ? { x0: c.x - EMPTY_ZONE.w / 2, x1: c.x + EMPTY_ZONE.w / 2, z0: c.z - EMPTY_ZONE.h / 2, z1: c.z + EMPTY_ZONE.h / 2 } : null;
    const hasRooms = doc.rooms.some((r) => fps[r.id] && zoneIdOfRoom(doc, r) === z.id);
    // sections without rooms yet: the zone keeps the size it was made at until rooms arrive and it hugs them
    if (b) { zone[z.id] = hasRooms || !yard ? { hull: padBox(b, 300), empty: false, bare: false } : { hull: unionBox(yard, padBox(b, 300)), empty: false, bare: true }; return; }
    zone[z.id] = { hull: yard, empty: true, bare: false };
  });
  return { sec: sec, zone: zone };
}
// the footprint of every room and the patches round them, without deriving the pens
function boxesOf(doc) {
  const tm = typesMap(doc), fps = {};
  doc.rooms.forEach((r) => { if (r.at) fps[r.id] = fpOf(r, roomGeom(r, tm)); });
  return Object.assign({ fps: fps }, patchBoxes(doc, fps, {}));
}

// ---------- derive: everything the page draws ----------
// opts.hints: { sectionId: {x, z} } where an empty section's placeholder should sit
export function derive(doc, opts) {
  const hints = (opts && opts.hints) || {};
  const tm = typesMap(doc);
  const problems = [];
  const zoneOf = (id) => doc.zones.find((z) => z.id === id) || null;
  const secOf = (id) => doc.sections.find((s) => s.id === id) || null;
  const rooms = [];
  const room = {};
  doc.rooms.forEach((r) => {
    const gm = roomGeom(r, tm);
    const fp = fpOf(r, gm);
    const sec = secOf(r.section), zone = sec ? zoneOf(sec.zone) : (r.zone ? zoneOf(r.zone) : null);
    const code = (zone ? zone.code + '-' : '') + (sec ? sec.code + '-' : (zone ? '' : 'NEW-')) + (r.num || 1);
    const cps = cornersOf(r, gm);
    // lane pens: one rectangle each, numbered along the lane from the door
    const pens = [];
    // pens are counted from the main door: when that is at the far end, the lanes are laid out from there
    const vf = (v) => (gm.vflip ? gm.dL - v : v);
    gm.lanes.forEach((ln) => ln.runs.forEach((ru) => {
      for (let j = 0; j < ru.n; j++) {
        const jj = ru.i0 + j;
        pens.push({ code: letter(ln.i) + (jj + 1), lane: ln.i, run: ru.k, j: jj, jr: j, type: ru.type, u: (ln.x0 + ln.x1) / 2, v: vf(gm.v0 + ru.off + j * ru.w + ru.w / 2), su: ru.d - 14, sv: ru.w - Math.min(10, ru.w * 0.16), h: ru.h, bad: false, outside: false, overlap: false });
      }
    }));
    // end rows: pens side by side across the room, counted from the side lane A is on, lettered after the lanes
    gm.ends.forEach((e) => e.runs.forEach((ru) => {
      for (let j = 0; j < ru.n; j++) {
        const jj = ru.i0 + j, ul = e.u0 + ru.off + j * ru.w + ru.w / 2;
        pens.push({ code: letter(e.i) + (jj + 1), lane: e.i, end: e.k, run: ru.k, j: jj, jr: j, type: ru.type, u: gm.rev ? gm.dW - ul : ul, v: vf(e.v0 + ru.d / 2), su: ru.w - Math.min(10, ru.w * 0.16), sv: ru.d - 14, h: ru.h, bad: false, outside: false, overlap: false });
      }
    }));
    // pens drawn by hand: any shape. Drawn at the far end of one lane they carry on that lane's numbers
    const drawn = [];
    let free = gm.lanes.length + gm.ends.length;
    const seen = {};
    (r.pens || []).forEach((s, k) => {
      const t = tm[s.type] || { uses: ['Gestation'], perPen: { Gestation: 1 } };
      const us = s.polygon.map((p) => p[0]), vs = s.polygon.map((p) => p[1]);
      const bu0 = Math.min(...us), bu1 = Math.max(...us), bv0 = Math.min(...vs), bvn = gm.vflip ? gm.dL - Math.max(...vs) : bv0;
      const hits = gm.lanes.filter((ln) => bu1 > ln.x0 + 20 && bu0 < ln.x1 - 20 && bvn < gm.v0 + ln.len + 80 && bvn > gm.v0 + ln.len - 40);
      const lane = hits.length === 1 ? hits[0].i : null;
      let pc;
      if (lane != null) { seen[lane] = (seen[lane] || 0) + 1; pc = letter(lane) + (gm.lanes[lane].n + seen[lane]); } else { pc = letter(free) + '1'; free++; }
      let cu = 0, cv = 0;
      s.polygon.forEach((p) => { cu += p[0]; cv += p[1]; });
      drawn.push({ code: pc, shape: k, type: s.type, polygon: s.polygon, lane: lane, u: cu / s.polygon.length, v: cv / s.polygon.length, su: Math.max(50, bu1 - bu0), sv: Math.max(50, Math.max(...vs) - bv0), area: Math.abs(polyArea(s.polygon)) / 10000, h: heightOf(t.uses[0]), bad: false, outside: false, overlap: false });
    });
    // red flags: a pen outside the walls, or on top of another pen
    if (r.outline && r.outline.length) {
      pens.forEach((p) => { p.outside = !rectPoly(p.u, p.v, p.su, p.sv).every((c) => inPoly(r.outline, c[0], c[1])); });
      drawn.forEach((p) => { p.outside = !p.polygon.every((c) => inPoly(r.outline, c[0], c[1])); });
    }
    drawn.forEach((p, i) => {
      const hitLane = pens.some((q) => polysOverlap(p.polygon, rectPoly(q.u, q.v, q.su, q.sv)));
      const hitDrawn = drawn.some((q, j) => j !== i && polysOverlap(p.polygon, q.polygon));
      if (hitLane || hitDrawn) p.overlap = true;
      if (hitLane) pens.forEach((q) => { if (polysOverlap(p.polygon, rectPoly(q.u, q.v, q.su, q.sv))) q.overlap = true; });
    });
    pens.concat(drawn).forEach((p) => { p.bad = p.outside || p.overlap; });
    const outN = pens.concat(drawn).filter((p) => p.outside).length;
    const overN = pens.concat(drawn).filter((p) => p.overlap && !p.outside).length;
    if (outN) problems.push(r.name + ': ' + outN + (outN === 1 ? ' pen is' : ' pens are') + ' outside the wall');
    if (overN) problems.push(r.name + ': ' + overN + (overN === 1 ? ' pen overlaps' : ' pens overlap') + ' another');
    let places = 0;
    const byType = {};
    pens.concat(drawn).forEach((p) => { const t = tm[p.type]; if (!t) return; places += typeInfo(t).per; byType[p.type] = (byType[p.type] || 0) + 1; });
    const d = { id: r.id, name: r.name, code: code, section: r.section || '', zone: zone ? zone.id : '', at: r.at, rot: r.rot || 0, aLeft: r.aLeft !== false, door: { wall: wallOfRot(r.rot || 0), x: gm.doorX, offset: r.door && num(r.door.offset) ? r.door.offset : null }, doors: gm.doors, entry: gm.entry, vflip: gm.vflip, geom: gm, fp: fpOf(r, gm), outline: cps, hasOutline: !!(r.outline && r.outline.length), pens: pens, drawn: drawn, places: places, byType: byType, outside: outN, overlaps: overN, empty: !pens.length && !drawn.length, devices: devicesOf(r, cps, pens.concat(drawn)) };
    rooms.push(d); room[r.id] = d;
  });
  // rooms that sit on each other
  for (let i = 0; i < rooms.length; i++) for (let j = i + 1; j < rooms.length; j++) if (overlapBox(rooms[i].fp, rooms[j].fp, 0)) problems.push(rooms[i].name + ' and ' + rooms[j].name + ' overlap');
  // sections hug their rooms (+2 m), zones hug their sections (+3 m)
  const fps = {};
  rooms.forEach((r) => { fps[r.id] = r.fp; });
  const PB = patchBoxes(doc, fps, hints);
  const sections = doc.sections.map((s) => ({ id: s.id, name: s.name, code: s.code, zone: s.zone || '', hull: PB.sec[s.id].hull, empty: PB.sec[s.id].empty, rooms: rooms.filter((r) => r.section === s.id).map((r) => r.id) }));
  const zones = doc.zones.map((z) => ({ id: z.id, name: z.name, code: z.code, hull: PB.zone[z.id].hull, empty: PB.zone[z.id].empty, bare: PB.zone[z.id].bare }));
  const by = {};
  let all = 0, multi = false;
  rooms.forEach((rd) => {
    Object.keys(rd.byType).forEach((tid) => {
      const t = tm[tid], n = rd.byType[tid];
      if (t.uses.length > 1) multi = true;
      t.uses.forEach((u) => { by[u] = (by[u] || 0) + n * (t.perPen[u] != null ? t.perPen[u] : typeInfo(t).per); });
      all += n * typeInfo(t).per;
    });
  });
  const totals = { rooms: rooms.length, places: all, byUse: USES.filter((u) => by[u]).map((u) => ({ use: u, n: by[u] })), multi: multi };
  const types = doc.types.map((t, i) => Object.assign({}, t, typeInfo(t), { color: t.color != null ? t.color : i % 8 }));
  const byId = (a) => { const o = {}; a.forEach((x) => { o[x.id] = x; }); return o; };
  return { types: types, type: byId(types), rooms: rooms, room: room, sections: sections, section: byId(sections), zones: zones, zone: byId(zones), totals: totals, problems: problems };
}

// ---------- positions ----------
let OFFS = null;
function offsets() {
  if (!OFFS) { OFFS = []; for (let dx = -40; dx <= 40; dx++) for (let dz = -40; dz <= 40; dz++) OFFS.push([dx * 100, dz * 100, dx * dx + dz * dz]); OFFS.sort((p, q) => p[2] - q[2]); }
  return OFFS;
}
function footprints(doc) { const tm = typesMap(doc); return doc.rooms.map((r) => ({ r: r, f: r.at ? fpOf(r, roomGeom(r, tm)) : null })); }
// nearest whole-metre shift of dx, dz at which the boxes touch no room outside `moving`
function freeShift(doc, moving, boxes, gap) {
  const others = footprints(doc).filter((e) => e.f && moving.indexOf(e.r) < 0).map((e) => e.f);
  for (const o of offsets()) {
    if (boxes.every((b) => { const s = { x0: b.x0 + o[0], z0: b.z0 + o[1], x1: b.x1 + o[0], z1: b.z1 + o[1] }; return !others.some((q) => overlapBox(s, q, gap)); })) return { dx: o[0], dz: o[1] };
  }
  return { dx: 0, dz: 0 };
}
// where the room's front-left wall corner stands on the site: kept fixed while the walls are reshaped
export function origin(room, tm) {
  const g = roomGeom(room, tm), f = fpOf(room, g);
  const c = { x: (f.x0 + f.x1) / 2, z: (f.z0 + f.z1) / 2 }, th = quarter(room) * Math.PI / 2;
  const x = -g.W / 2 + g.ou, z = g.L / 2 - g.ov;
  return { x: c.x + x * Math.cos(th) + z * Math.sin(th), z: c.z - x * Math.sin(th) + z * Math.cos(th) };
}
function keepOrigin(doc, room, fn) {
  const tm = typesMap(doc);
  const a = origin(room, tm);
  fn();
  const b = origin(room, tm);
  room.at.x = round(room.at.x + a.x - b.x); room.at.z = round(room.at.z + a.z - b.z);
}

// ---------- ops ----------
class Problem { constructor(m) { this.problem = m; } }
const fail = (m) => { throw new Problem(m); };

function byRef(list, ref, kind) {
  if (ref == null || ref === '') fail('No ' + kind + ' given');
  const key = String(ref).toLowerCase();
  const hit = list.find((x) => x.id === ref) || list.find((x) => String(x.name).toLowerCase() === key) || list.find((x) => x.code && String(x.code).toLowerCase() === key && kind !== 'room');
  if (!hit) fail(kind[0].toUpperCase() + kind.slice(1) + " '" + ref + "' not found");
  return hit;
}
const roomRef = (d, ref) => byRef(d.rooms, ref, 'room');
const typeRef = (d, ref) => byRef(d.types, ref, 'pen type');
const secRef = (d, ref) => byRef(d.sections, ref, 'section');
const zoneRef = (d, ref) => byRef(d.zones, ref, 'zone');
function uniqueId(list, base) { let id = slug(base), k = 2; while (list.some((x) => x.id === id)) { id = slug(base) + '-' + k; k++; } return id; }
function nextCode(d) { let n = 0; d.zones.forEach((z) => { n = Math.max(n, parseInt(String(z.code).replace(/\D/g, ''), 10) || 0); }); return 'Z' + (n + 1); }
function nextRoomName(d, secId, from) {
  const rs = d.rooms.filter((r) => r.section === secId);
  const ref = from || rs[rs.length - 1];
  let base = ref ? ref.name.replace(/\s*\d+$/, '') : 'Room';
  if (!base) base = 'Room';
  let max = 0;
  rs.forEach((r) => { if (r.name.replace(/\s*\d+$/, '') === base) { const m = /(\d+)$/.exec(r.name); if (m) max = Math.max(max, +m[1]); } });
  return base + ' ' + (max + 1);
}
function nextNum(d, secId) { let n = 0; d.rooms.forEach((r) => { if (r.section === secId) n = Math.max(n, r.num || 0); }); return n + 1; }

// two neighbouring runs of one type are one run; the same type further along the lane stays its own run
function mergeRuns(l) { const out = []; l.runs.forEach((u) => { const p = out[out.length - 1]; if (p && p.type === u.type) p.n += u.n; else out.push(u); }); l.runs = out; }

// a list of { type, n } runs; two neighbours of one type are one run
function normRuns(d, runs, what) {
  if (!Array.isArray(runs) || !runs.length) fail(what + ' has no pens: give runs: [{ type, n }]');
  const out = [];
  runs.forEach((u) => {
    const t = typeRef(d, u.type);
    if (!(u.n >= 1) || u.n !== Math.floor(u.n)) fail(what + ": a run needs a whole number of pens, not '" + u.n + "'");
    const last = out[out.length - 1];
    if (last && last.type === t.id) last.n += u.n; else out.push({ type: t.id, n: u.n });
  });
  return out;
}
const endAt = (at) => { if (at == null || at === 'far' || at === 'door') return at || 'far'; fail("a row goes at 'far' or 'door', not '" + at + "'"); };
function normEnds(d, ends) {
  if (!Array.isArray(ends)) fail('ends must be a list');
  return ends.map((e, i) => ({ at: endAt(e.at), runs: normRuns(d, e.runs || (e.type ? [{ type: e.type, n: e.n }] : null), 'Row ' + letter(i)) }));
}
function normLanes(d, lanes) {
  if (!Array.isArray(lanes)) fail('lanes must be a list');
  return lanes.map((l, i) => {
    let runs = Array.isArray(l) ? l : (l && l.runs ? l.runs : (l && l.type ? [l] : null));
    if (!runs || !runs.length) fail('Lane ' + letter(i) + ' has no pens: give { runs: [{ type, n }] }');
    // a type may come back anywhere in the lane (3 gilt pens, a stall, 1 gilt pen); only two neighbouring runs of one type are one run
    const out = [];
    runs.forEach((u) => {
      const t = typeRef(d, u.type);
      if (!(u.n >= 1) || u.n !== Math.floor(u.n)) fail("Lane " + letter(i) + ": a run needs a whole number of pens, not '" + u.n + "'");
      const last = out[out.length - 1];
      if (last && last.type === t.id) last.n += u.n; else out.push({ type: t.id, n: u.n });
    });
    return { runs: out };
  });
}
function normPoly(poly, what) {
  if (!Array.isArray(poly) || poly.length < 3 || !poly.every((p) => Array.isArray(p) && num(p[0]) && num(p[1]))) fail(what + ' needs at least 3 corners as [across, along] in cm');
  return poly.map((p) => [round(p[0] * 10) / 10, round(p[1] * 10) / 10]);
}
function sideOf(side) { if (['east', 'west', 'north', 'south'].indexOf(side) < 0) fail("side must be east, west, north or south, not '" + side + "'"); return side; }
// a box of the given size placed against `ref` on one side: east/west align the door-side edges, north/south align the left edges
function beside(ref, fw, fl, side, gap) {
  if (side === 'east') return { x: ref.x1 + gap, z: ref.z1 - fl };
  if (side === 'west') return { x: ref.x0 - fw - gap, z: ref.z1 - fl };
  if (side === 'north') return { x: ref.x0, z: ref.z0 - fl - gap };
  return { x: ref.x0, z: ref.z1 + gap };
}
function sizeFor(d, room) { return roomGeom(room, typesMap(d)); }

function placeRoom(ctx, room, at, gap, label) {
  const d = ctx.d;
  const g = sizeFor(d, room);
  room.at = { x: round(at.x), z: round(at.z) };
  const box = { x0: room.at.x, z0: room.at.z, x1: room.at.x + g.fw, z1: room.at.z + g.fl };
  const s = freeShift(d, [room], [box], gap);
  if (s.dx || s.dz) {
    room.at.x += s.dx; room.at.z += s.dz;
    ctx.changes.push(room.name + ' moved ' + (Math.round(Math.hypot(s.dx, s.dz) / 10) / 10) + ' m to stay clear of the next room');
  }
}

function defaultAt(d, section) {
  const tm = typesMap(d);
  const mine = d.rooms.filter((r) => r.at && section && r.section === section.id);
  if (mine.length) { const last = mine[mine.length - 1]; const g = roomGeom(last, tm), f = fpOf(last, g); return { x: f.x1 + 260, z: f.z1 - 0 }; }
  const all = d.rooms.filter((r) => r.at);
  if (all.length) { const b = bboxOf(all.map((r) => fpOf(r, roomGeom(r, tm)))); return { x: b.x0, z: b.z1 + 700 }; }
  return { x: 0, z: 0 };
}

function groupSectionOf(d, rooms, name, code, zoneId) {
  const olds = {};
  rooms.forEach((r) => { olds[r.section] = true; });
  const oldIds = Object.keys(olds).filter(Boolean);
  const sorted = rooms.slice().sort((a, b) => a.at.x - b.at.x);
  let nm = name || 'New section';
  if (!name && oldIds.length === 1 && olds[oldIds[0]]) {
    const o = d.sections.find((s) => s.id === oldIds[0]);
    if (o) { const base = o.name.replace(/\s+[A-Z]$/, ''); for (let k = 1; k < 26; k++) { const t = base + ' ' + letter(k); if (!d.sections.some((s) => s.name === t)) { nm = t; break; } } }
  }
  const os = oldIds.length === 1 ? d.sections.find((s) => s.id === oldIds[0]) : null;
  let cd = code || suggestCode(nm);
  // all of one section's rooms grouped again: it keeps its name and code
  if (!name && os && d.rooms.filter((r) => r.section === os.id).length === rooms.length) { nm = os.name; cd = os.code; }
  // the new section sits in the zone that holds most of its rooms (a tie goes to the first room's zone)
  let zone = zoneId;
  if (zone === undefined) {
    const zoneOfRoom = (r) => { const s0 = r.section ? d.sections.find((x) => x.id === r.section) : null; return s0 ? (s0.zone || '') : (r.zone || ''); };
    const count = {}, first = [];
    rooms.forEach((r) => { const z0 = zoneOfRoom(r); if (count[z0] == null) { count[z0] = 0; first.push(z0); } count[z0]++; });
    let best = first[0];
    first.forEach((z0) => { if (count[z0] > count[best]) best = z0; });
    zone = best || null;
  }
  const sec = { id: uniqueId(d.sections, nm), name: nm, code: cd, zone: zone || null };
  d.sections.push(sec);
  sorted.forEach((r, i) => { r.section = sec.id; delete r.zone; r.num = i + 1; });
  oldIds.forEach((id) => { const s = d.sections.find((x) => x.id === id); if (s && s !== sec && !d.rooms.some((r) => r.section === id)) d.sections.splice(d.sections.indexOf(s), 1); });
  return sec;
}

const storeWall = (room, wi) => (room.outline && room.outline.length ? wi : WALL_NAMES[wi % 4]);
const storeDoor = (room, x) => ({ wall: storeWall(room, x.wall), offset: round(x.offset), main: x.main });
function doorRef(g, ref) {
  if (ref === 'main') return g.doors.findIndex((x) => x.main);
  if (!num(ref) || ref < 0 || ref >= g.doors.length) fail('No door ' + (ref == null ? '' : "'" + ref + "'") + ' in that room');
  return ref;
}
// every room of a zone: the rooms of its sections, and the ones standing in it without a section
const roomsInZone = (d, zid) => d.rooms.filter((r) => (r.section ? (d.sections.find((s) => s.id === r.section) || {}).zone === zid : r.zone === zid));
// move whole rooms; they never end up on other rooms or other patches: the nearest clear spot is taken and the change says so
function moveGroup(ctx, d, rooms, dx, dz, what, clash) {
  const base = rooms.map((r) => ({ x: r.at.x, z: r.at.z }));
  const at = (sx, sz) => rooms.forEach((r, i) => { r.at = { x: base[i].x + dx + sx, z: base[i].z + dz + sz }; });
  let hit = null, n = 0;
  for (const o of offsets()) {
    if (n++ > 4500) break;
    at(o[0], o[1]);
    if (!clash(boxesOf(d))) { hit = o; break; }
  }
  if (!hit) { rooms.forEach((r, i) => { r.at = { x: base[i].x, z: base[i].z }; }); fail('There is no clear ground for ' + what + ' there'); }
  if (hit[0] || hit[1]) { const m = Math.round(Math.hypot(hit[0], hit[1]) / 10) / 10; ctx.changes.push(what + ' landed ' + m + ' m from where you dropped it, to stay clear of other rooms'); }
  rooms.forEach((r) => ctx.moved.add(r.id));
}
const hitBox = (a, b) => !!a && !!b && a.x0 < b.x1 && a.x1 > b.x0 && a.z0 < b.z1 && a.z1 > b.z0;
const centreOf = (h) => ({ x: round((h.x0 + h.x1) / 2), z: round((h.z0 + h.z1) / 2) });

const OPS = {
  add_pen_type(ctx, o) {
    const d = ctx.d;
    if (!o.name || !String(o.name).trim()) fail('A pen type needs a name');
    const uses = o.uses || (o.use ? [o.use] : []);
    if (!uses.length) fail("Pen type '" + o.name + "' needs a Used for: one or more of " + USES.join(', '));
    uses.forEach((u) => { if (USES.indexOf(u) < 0) fail("'" + u + "' is not a use. Use stages only: " + USES.join(', ')); });
    if (!(o.w > 0) || !(o.l > 0)) fail("Pen type '" + o.name + "' needs a size: w and l in cm");
    const perPen = {};
    uses.forEach((u) => { const v = o.perPen && o.perPen[u] != null ? o.perPen[u] : (uses.length === 1 && o.per != null ? o.per : null); if (!(v > 0)) fail("Pen type '" + o.name + "': how many pigs per pen for " + u + '?'); perPen[u] = v; });
    const id = o.id || uniqueId(d.types, o.name);
    if (d.types.some((t) => t.id === id || t.name.toLowerCase() === String(o.name).trim().toLowerCase())) fail("Pen type '" + String(o.name).trim() + "' already exists");
    d.types.push({ id: id, name: String(o.name).trim(), uses: uses.slice(), perPen: perPen, w: o.w, l: o.l, color: o.color != null ? o.color : d.types.length % 8 });
    ctx.made.push(id);
    ctx.changes.push('Pen type ' + o.name + ' added');
  },
  set_pen_type(ctx, o) {
    const t = typeRef(ctx.d, o.type);
    if (o.name) t.name = String(o.name).trim();
    if (o.uses) { o.uses.forEach((u) => { if (USES.indexOf(u) < 0) fail("'" + u + "' is not a use"); }); t.uses = o.uses.slice(); }
    if (o.perPen) t.perPen = Object.assign({}, o.perPen);
    t.uses.forEach((u) => { if (!(t.perPen[u] > 0)) fail("Pen type '" + t.name + "': how many pigs per pen for " + u + '?'); });
    Object.keys(t.perPen).forEach((u) => { if (t.uses.indexOf(u) < 0) delete t.perPen[u]; });
    if (o.w > 0) t.w = o.w;
    if (o.l > 0) t.l = o.l;
    ctx.rebuildAll = true;
    ctx.changes.push('Pen type ' + t.name + ' changed');
  },
  set_farm(ctx, o) {
    if (!o.name || !String(o.name).trim()) fail('A farm needs a name');
    ctx.d.name = String(o.name).trim();
    ctx.changes.push('Farm named ' + ctx.d.name);
  },
  add_zone(ctx, o) {
    const d = ctx.d;
    if (!o.name) fail('A zone needs a name');
    const z = { id: o.id || uniqueId(d.zones, o.name), name: o.name, code: o.code || nextCode(d) };
    if (o.at) { if (!num(o.at.x) || !num(o.at.z)) fail('at needs x and z in cm'); z.at = { x: round(o.at.x), z: round(o.at.z) }; }
    d.zones.push(z);
    ctx.changes.push('Zone ' + o.name + ' added');
  },
  add_section(ctx, o) {
    const d = ctx.d;
    if (!o.name) fail('A section needs a name');
    const z = o.zone ? zoneRef(d, o.zone) : null;
    const sc = { id: o.id || uniqueId(d.sections, o.name), name: o.name, code: o.code || suggestCode(o.name), zone: z ? z.id : null };
    if (o.at) { if (!num(o.at.x) || !num(o.at.z)) fail('at needs x and z in cm'); sc.at = { x: round(o.at.x), z: round(o.at.z) }; }
    d.sections.push(sc);
    ctx.changes.push('Section ' + o.name + ' added');
  },
  add_room(ctx, o) {
    const d = ctx.d;
    const sec = o.section ? secRef(d, o.section) : null;
    const z = !sec && o.zone ? zoneRef(d, o.zone) : null;
    const name = o.name && String(o.name).trim() ? String(o.name).trim() : (sec ? nextRoomName(d, sec.id) : 'Room 1');
    if (d.rooms.some((r) => r.name.toLowerCase() === name.toLowerCase())) fail("Room '" + name + "' already exists");
    const r = { id: o.id || uniqueId(d.rooms, name), name: name, section: sec ? sec.id : '', num: o.num || (sec ? nextNum(d, sec.id) : 1), at: null, rot: 0, aLeft: o.aLeft !== false, lanes: [] };
    if (z) r.zone = z.id;
    if (o.aisle != null) r.aisle = o.aisle;
    if (o.lanes) r.lanes = normLanes(d, o.lanes);
    if (o.ends) r.ends = normEnds(d, o.ends);
    if (o.outline) r.outline = normPoly(o.outline, 'outline');
    if (o.pens) r.pens = o.pens.map((p) => ({ type: typeRef(d, p.type).id, polygon: normPoly(p.polygon, 'A drawn pen') }));
    if (o.door) {
      if (o.door.wall != null) { if (!(o.door.wall in WALLS)) fail("door.wall must be north, east, south or west, not '" + o.door.wall + "'"); r.rot = WALLS[o.door.wall] * 90; } else if (num(o.rot)) r.rot = (((Math.round(o.rot / 90)) % 4) + 4) % 4 * 90;
      if (num(o.door.offset)) r.door = { offset: o.door.offset };
    } else if (num(o.rot)) r.rot = (((Math.round(o.rot / 90)) % 4) + 4) % 4 * 90;
    let at;
    if (o.at === 'auto') { d.rooms.push(r); ctx.rebuild.add(r.id); ctx.changes.push('Room ' + name + ' added'); return; }
    if (o.at) { if (!num(o.at.x) || !num(o.at.z)) fail('at needs x and z in cm'); at = o.at; } else if (o.near) {
      const ref = roomRef(d, o.near.room), side = sideOf(o.near.side || 'east'), g = sizeFor(d, r);
      at = beside(fpOf(ref, sizeFor(d, ref)), g.fw, g.fl, side, num(o.near.gap) ? o.near.gap : 260);
    } else at = defaultAt(d, sec);
    d.rooms.push(r);
    placeRoom(ctx, r, at, 0);
    ctx.rebuild.add(r.id);
    ctx.changes.push('Room ' + name + ' added');
  },
  set_room(ctx, o) {
    const d = ctx.d, r = roomRef(d, o.room);
    if (o.aLeft != null) r.aLeft = !!o.aLeft;
    if (o.aisle !== undefined) { if (o.aisle === null) delete r.aisle; else r.aisle = o.aisle; }
    if (o.name) r.name = o.name;
    if (o.num != null) r.num = o.num;
    if (o.section !== undefined) { const s = o.section ? secRef(d, o.section) : null; if (!s) r.section = ''; else if (r.section !== s.id) { r.section = s.id; delete r.zone; r.num = nextNum(d, s.id); } }
    ctx.rebuild.add(r.id);
    ctx.changes.push('Room ' + r.name + ' changed');
  },
  set_lanes(ctx, o) {
    const d = ctx.d, r = roomRef(d, o.room);
    r.lanes = normLanes(d, o.lanes);
    ctx.rebuild.add(r.id);
    ctx.changes.push(r.name + ' now has ' + r.lanes.length + (r.lanes.length === 1 ? ' lane' : ' lanes'));
  },
  add_end_row(ctx, o) {
    const d = ctx.d, r = roomRef(d, o.room);
    const e = { at: endAt(o.at), runs: normRuns(d, o.runs || (o.type != null ? [{ type: o.type, n: o.n }] : null), 'The row') };
    r.ends = r.ends || [];
    r.ends.push(e);
    ctx.rebuild.add(r.id);
    ctx.changes.push('Row ' + letter((r.lanes || []).length + r.ends.length - 1) + ' added to ' + r.name);
  },
  set_end_row(ctx, o) {
    const d = ctx.d, r = roomRef(d, o.room);
    const k = o.end;
    if (!(r.ends || [])[k]) fail('Row ' + (k == null ? '' : "'" + (typeof k === 'number' ? letter((r.lanes || []).length + k) : k) + "' ") + 'not found in ' + r.name);
    if (o.runs) r.ends[k].runs = normRuns(d, o.runs, 'Row ' + letter((r.lanes || []).length + k));
    if (o.at != null) r.ends[k].at = endAt(o.at);
    ctx.rebuild.add(r.id);
    ctx.changes.push('Row ' + letter((r.lanes || []).length + k) + ' of ' + r.name + ' changed');
  },
  remove_end_row(ctx, o) {
    const d = ctx.d, r = roomRef(d, o.room);
    const k = o.end;
    if (!(r.ends || [])[k]) fail('Row not found in ' + r.name);
    r.ends.splice(k, 1);
    if (!r.ends.length) delete r.ends;
    ctx.rebuild.add(r.id);
    const L0 = (r.lanes || []).length;
    ctx.changes.push('Row ' + letter(L0 + k) + ' removed' + ((r.ends || []).length > k ? ' · ' + letter(L0 + k + 1) + (r.ends.length > k + 1 ? '–' + letter(L0 + r.ends.length) : '') + ' ' + (r.ends.length > k + 1 ? 'are' : 'is') + ' now ' + letter(L0 + k) + (r.ends.length > k + 1 ? '–' + letter(L0 + r.ends.length - 1) : '') : ''));
  },
  add_device(ctx, o) {
    const d = ctx.d, r = roomRef(d, o.room);
    if (!deviceKind(o.kind)) fail("A device is one of: " + DEVICE_KINDS.map((x) => x.id).join(', '));
    const x = { id: o.id || 'dev' + Math.random().toString(36).slice(2, 7), kind: o.kind };
    if (deviceKind(o.kind).serves === 'pens') x.pens = (Array.isArray(o.pens) ? o.pens : (o.pen ? [o.pen] : [])).map(String);
    else if (o.pen) x.pen = String(o.pen);
    else if (o.wall != null) { x.wall = o.wall; x.offset = num(o.offset) ? round(o.offset) : undefined; if (x.offset === undefined) delete x.offset; }
    else { x.u = round(num(o.u) ? o.u : 0); x.v = round(num(o.v) ? o.v : 0); }
    if (o.code) x.code = String(o.code).trim();
    if (o.model) x.model = String(o.model).trim();
    r.devices = r.devices || [];
    r.devices.push(x);
    ctx.made.push(x.id);
    ctx.rebuild.add(r.id);
    ctx.changes.push(deviceKind(o.kind).name + ' added to ' + r.name);
  },
  move_device(ctx, o) {
    const d = ctx.d, r = roomRef(d, o.room), x = (r.devices || []).find((q) => q.id === o.device);
    if (!x) fail('Device not found in ' + r.name);
    delete x.pen; delete x.wall; delete x.offset; delete x.u; delete x.v;
    if (o.pen) x.pen = String(o.pen);
    else if (o.wall != null) { x.wall = o.wall; if (num(o.offset)) x.offset = round(o.offset); }
    else { x.u = round(num(o.u) ? o.u : 0); x.v = round(num(o.v) ? o.v : 0); }
    ctx.rebuild.add(r.id);
    ctx.changes.push(deviceKind(x.kind).name + ' of ' + r.name + ' moved');
  },
  // the code on the device's label binds this spot to the real device; the model says what it is
  set_device(ctx, o) {
    const d = ctx.d, r = roomRef(d, o.room), x = (r.devices || []).find((q) => q.id === o.device);
    if (!x) fail('Device not found in ' + r.name);
    ['code', 'model'].forEach((k) => { if (o[k] === undefined) return; const v = String(o[k] == null ? '' : o[k]).trim(); if (v) x[k] = v; else delete x[k]; });
    ctx.changes.push(deviceKind(x.kind).name + ' of ' + r.name + (x.code ? ' bound to ' + x.code : ' not bound'));
  },
  set_device_pens(ctx, o) {
    const d = ctx.d, r = roomRef(d, o.room), x = (r.devices || []).find((q) => q.id === o.device);
    if (!x) fail('Device not found in ' + r.name);
    if ((deviceKind(x.kind) || {}).serves !== 'pens') fail('A ' + (deviceKind(x.kind) || { name: 'device' }).name.toLowerCase() + ' serves the room or a spot, not pens');
    if (!Array.isArray(o.pens)) fail('pens is a list of pen codes');
    delete x.pen;
    x.pens = [...new Set(o.pens.map(String))];
    ctx.rebuild.add(r.id);
    ctx.changes.push(deviceKind(x.kind).name + ' of ' + r.name + ' serves ' + (x.pens.length ? penRanges(x.pens) : 'no pens'));
  },
  remove_device(ctx, o) {
    const d = ctx.d, r = roomRef(d, o.room), k = (r.devices || []).findIndex((q) => q.id === o.device);
    if (k < 0) fail('Device not found in ' + r.name);
    const kd = deviceKind(r.devices[k].kind);
    r.devices.splice(k, 1);
    if (!r.devices.length) delete r.devices;
    ctx.rebuild.add(r.id);
    ctx.changes.push((kd ? kd.name : 'Device') + ' removed from ' + r.name);
  },
  add_door(ctx, o) {
    const d = ctx.d, r = roomRef(d, o.room), g = roomGeom(r, typesMap(d)), cps = cornersOf(r, g);
    const wi = wallIndex(r, cps, o.wall == null ? 'right' : o.wall);
    if (wi < 0) fail("wall must be front, right, back or left, not '" + o.wall + "'");
    const e = edgeOf(cps, wi);
    if (e.len < 2 * DOOR_EDGE) fail('That wall is too short for a door');
    const free = (off) => !g.doors.some((x) => x.wall === wi && Math.abs(x.offset - off) < DOOR_W + DOOR_GAP);
    let off = Math.min(e.len - DOOR_EDGE, Math.max(DOOR_EDGE, num(o.offset) ? o.offset : e.len / 2));
    if (!free(off)) {
      if (num(o.offset)) fail('There is a door there already');
      const step = DOOR_W + DOOR_GAP + 20;
      let found = null;
      for (let k = 1; k < 40 && found == null; k++) [e.len / 2 + k * step, e.len / 2 - k * step].forEach((c) => { if (found == null && c >= DOOR_EDGE && c <= e.len - DOOR_EDGE && free(c)) found = c; });
      if (found == null) fail('There is no room for another door on that wall');
      off = found;
    }
    const list = g.doors.map((x) => storeDoor(r, x));
    list.push({ wall: storeWall(r, wi), offset: round(off), main: false });
    r.doors = list; delete r.door;
    ctx.rebuild.add(r.id);
    ctx.changes.push('Door added to ' + r.name);
  },
  move_door(ctx, o) {
    const d = ctx.d, r = roomRef(d, o.room), g = roomGeom(r, typesMap(d)), cps = cornersOf(r, g);
    const k = doorRef(g, o.door);
    const cur = g.doors[k];
    let wi = cur.wall;
    if (o.wall != null) { wi = wallIndex(r, cps, o.wall); if (wi < 0) fail("wall must be front, right, back or left, not '" + o.wall + "'"); }
    const e = edgeOf(cps, wi);
    if (e.len < 2 * DOOR_EDGE) fail('That wall is too short for a door');
    const off = Math.min(e.len - DOOR_EDGE, Math.max(DOOR_EDGE, num(o.offset) ? o.offset : (wi === cur.wall ? cur.offset : e.len / 2)));
    if (g.doors.some((x, i) => i !== k && x.wall === wi && Math.abs(x.offset - off) < DOOR_W + DOOR_GAP)) fail('There is a door there already');
    const list = g.doors.map((x) => storeDoor(r, x));
    list[k] = { wall: storeWall(r, wi), offset: round(off), main: cur.main };
    r.doors = list; delete r.door;
    ctx.rebuild.add(r.id);
    ctx.changes.push((cur.main ? 'Main door' : 'Door') + ' of ' + r.name + ' moved');
  },
  remove_door(ctx, o) {
    const d = ctx.d, r = roomRef(d, o.room), g = roomGeom(r, typesMap(d));
    const k = doorRef(g, o.door);
    if (g.doors.length < 2) fail('A room needs a door');
    if (g.doors[k].main) fail('Make another door the main door first');
    const list = g.doors.map((x) => storeDoor(r, x));
    list.splice(k, 1);
    r.doors = list; delete r.door;
    ctx.rebuild.add(r.id);
    ctx.changes.push('Door removed from ' + r.name);
  },
  set_main_door(ctx, o) {
    const d = ctx.d, r = roomRef(d, o.room), g = roomGeom(r, typesMap(d));
    const k = doorRef(g, o.door);
    if (g.doors[k].main) fail('That is the main door already');
    const list = g.doors.map((x) => storeDoor(r, x));
    list.forEach((x, i) => { x.main = i === k; });
    r.doors = list; delete r.door;
    ctx.rebuild.add(r.id);
    ctx.changes.push('Pens of ' + r.name + ' are now numbered from the new main door');
  },
  set_outline(ctx, o) {
    const d = ctx.d, r = roomRef(d, o.room);
    keepOrigin(d, r, () => { if (o.outline == null) delete r.outline; else r.outline = normPoly(o.outline, 'outline'); });
    ctx.rebuild.add(r.id);
    ctx.changes.push(o.outline == null ? 'Walls of ' + r.name + ' back to a rectangle' : 'Walls of ' + r.name + ' reshaped (' + r.outline.length + ' corners)');
  },
  draw_pen(ctx, o) {
    const d = ctx.d, r = roomRef(d, o.room);
    const t = typeRef(d, o.type);
    r.pens = r.pens || [];
    r.pens.push({ type: t.id, polygon: normPoly(o.polygon, 'A drawn pen') });
    ctx.rebuild.add(r.id);
    ctx.changes.push('Pen drawn in ' + r.name);
  },
  move_room(ctx, o) {
    const d = ctx.d, r = roomRef(d, o.room);
    const tm = typesMap(d);
    let at;
    if (o.at) at = o.at; else if (o.by) at = { x: r.at.x + o.by.x, z: r.at.z + o.by.z }; else if (o.near) {
      const ref = roomRef(d, o.near.room), side = sideOf(o.near.side || 'east'), g = roomGeom(r, tm);
      at = beside(fpOf(ref, roomGeom(ref, tm)), g.fw, g.fl, side, num(o.near.gap) ? o.near.gap : 260);
    } else fail('move_room needs at, by or near');
    if (o.exact) r.at = { x: round(at.x), z: round(at.z) }; else placeRoom(ctx, r, at, 0);
    ctx.moved.add(r.id);
  },
  move_zone(ctx, o) {
    const d = ctx.d, z = zoneRef(d, o.zone);
    if (!num(o.dx) || !num(o.dz)) fail('move_zone needs dx and dz in cm');
    const dx = round(o.dx), dz = round(o.dz);
    if (!dx && !dz) return;
    const rooms = roomsInZone(d, z.id);
    const own = d.sections.filter((s) => s.zone === z.id);
    const shiftAt = (e, k) => { if (e.at) e.at = { x: e.at.x + k * dx, z: e.at.z + k * dz }; };
    if (rooms.length) {
      moveGroup(ctx, d, rooms, dx, dz, z.name, (B) => {
        const mine = B.zone[z.id] && B.zone[z.id].hull;
        if (d.zones.some((x) => x.id !== z.id && B.zone[x.id] && hitBox(mine, B.zone[x.id].hull))) return true;
        if (d.sections.some((s) => !s.zone && hitBox(mine, B.sec[s.id].hull))) return true;
        return d.rooms.some((r) => !r.section && !r.zone && B.fps[r.id] && hitBox(mine, B.fps[r.id]));
      });
    }
    // a zone or section with nothing in it is a placeholder: it moves with the zone
    own.forEach((e) => shiftAt(e, 1)); shiftAt(z, 1);
    if (!rooms.length) {
      const B = boxesOf(d), mine = B.zone[z.id] && B.zone[z.id].hull;
      if (d.zones.some((x) => x.id !== z.id && B.zone[x.id] && hitBox(mine, B.zone[x.id].hull))) { own.forEach((e) => shiftAt(e, -1)); shiftAt(z, -1); fail('Another zone is in the way there'); }
    }
    ctx.changes.push('Zone ' + z.name + ' moved');
  },
  move_section(ctx, o) {
    const d = ctx.d, s = secRef(d, o.section);
    if (!num(o.dx) || !num(o.dz)) fail('move_section needs dx and dz in cm');
    const dx = round(o.dx), dz = round(o.dz);
    let z = s.zone || '';
    if (o.zone !== undefined) z = o.zone ? zoneRef(d, o.zone).id : '';
    const was = s.zone || '';
    if (!dx && !dz && z === was) return;
    const rooms = d.rooms.filter((r) => r.section === s.id);
    s.zone = z || null;
    try {
      if (rooms.length) {
        moveGroup(ctx, d, rooms, dx, dz, s.name, (B) => {
          const mine = B.sec[s.id].hull;
          if (d.sections.some((x) => x.id !== s.id && hitBox(mine, B.sec[x.id].hull))) return true;
          if (d.rooms.some((r) => !r.section && B.fps[r.id] && hitBox(mine, B.fps[r.id]))) return true;
          const mz = z && B.zone[z] ? B.zone[z].hull : null;
          return !!mz && d.zones.some((x) => x.id !== z && B.zone[x.id] && hitBox(mz, B.zone[x.id].hull));
        });
      } else if (s.at) s.at = { x: s.at.x + dx, z: s.at.z + dz };
      else { const c = centreOf(boxesOf(d).sec[s.id].hull); s.at = { x: c.x + dx, z: c.z + dz }; }
    } catch (e) { s.zone = was || null; throw e; }
    if (z !== was) rooms.forEach((r) => { delete r.zone; });
    const zn = z ? d.zones.find((x) => x.id === z) : null;
    ctx.changes.push('Section ' + s.name + (z !== was ? ' moved to ' + (zn ? zn.name : 'no zone') : ' moved'));
  },
  copy_room(ctx, o) {
    const d = ctx.d, src = roomRef(d, o.room);
    const times = o.times == null ? 1 : o.times;
    if (!(times >= 1) || times !== Math.floor(times)) fail('times must be a whole number of copies');
    const side = sideOf(o.side || 'east'), gap = num(o.gap) ? o.gap : 260;
    const tm = typesMap(d);
    let prev = src;
    const made = [];
    for (let k = 0; k < times; k++) {
      const c = clone(src);
      c.name = nextRoomName(d, src.section, src);
      c.id = uniqueId(d.rooms, c.name);
      c.num = nextNum(d, src.section);
      const g = roomGeom(c, tm), pf = fpOf(prev, roomGeom(prev, tm));
      const at = o.by ? { x: prev.at.x + o.by.x, z: prev.at.z + o.by.z } : beside(pf, g.fw, g.fl, side, gap);
      c.at = { x: round(at.x), z: round(at.z) };
      // neighbours that stand where the copy goes make room: the copy and everything beyond it in that row shift on
      if (o.shove) {
        const box = { x0: c.at.x, z0: c.at.z, x1: c.at.x + g.fw, z1: c.at.z + g.fl };
        const row = footprints(d).filter((e) => e.f && e.r !== c && e.f.z1 > box.z0 && e.f.z0 < box.z1 && e.f.x0 >= box.x0 - 1);
        if (row.some((e) => overlapBox(e.f, box, 0))) { const dx = g.fw + gap; row.forEach((e) => { e.r.at.x += dx; }); }
        d.rooms.push(c);
      } else { d.rooms.push(c); if (!o.exact) placeRoom(ctx, c, c.at, 0); }
      ctx.rebuild.add(c.id);
      made.push(c); prev = c;
    }
    ctx.made = ctx.made.concat(made.map((c) => c.id));
    ctx.changes.push(made.length === 1 ? made[0].name + ' added' : made[0].name + ' to ' + made[made.length - 1].name + ' added');
  },
  rename(ctx, o) {
    const d = ctx.d;
    if (!o.name) fail('rename needs a name');
    if (o.room) { const r = roomRef(d, o.room); r.name = o.name; ctx.rebuild.add(r.id); } else if (o.section) { const s = secRef(d, o.section); s.name = o.name; if (o.code) s.code = String(o.code).toUpperCase().slice(0, 3); } else if (o.zone) { const z = zoneRef(d, o.zone); z.name = o.name; if (o.code) z.code = o.code; } else if (o.type) { typeRef(d, o.type).name = o.name; } else fail('rename needs room, section, zone or type');
    ctx.changes.push('Renamed to ' + o.name);
  },
  group(ctx, o) {
    const d = ctx.d;
    if (o.as === 'zone' || (o.sections && !o.rooms)) {
      const secs = (o.sections || []).map((s) => secRef(d, s));
      if (!secs.length) fail('group into a zone needs sections');
      const old = {};
      const z = { id: o.id || uniqueId(d.zones, o.name || 'New zone'), name: o.name || 'New zone', code: o.code || nextCode(d) };
      secs.forEach((s) => { if (s.zone) old[s.zone] = true; s.zone = z.id; });
      d.zones.push(z);
      Object.keys(old).forEach((id) => { const zz = d.zones.find((x) => x.id === id); if (zz && zz !== z && !d.sections.some((s) => s.zone === id) && !d.rooms.some((r) => !r.section && r.zone === id)) d.zones.splice(d.zones.indexOf(zz), 1); });
      ctx.made = [z.id];
      ctx.changes.push('Zone ' + z.name + ' made from ' + secs.length + (secs.length === 1 ? ' section' : ' sections'));
      return;
    }
    const rooms = (o.rooms || []).map((r) => roomRef(d, r));
    if (!rooms.length) fail('group needs rooms');
    let zoneId;
    if (o.zone) zoneId = zoneRef(d, o.zone).id;
    const s = groupSectionOf(d, rooms, o.name, o.code, zoneId);
    ctx.made = [s.id];
    rooms.forEach((r) => ctx.rebuild.add(r.id));
    ctx.changes.push('Section ' + s.name + ' made from ' + rooms.length + (rooms.length === 1 ? ' room' : ' rooms'));
  },
  ungroup(ctx, o) {
    const d = ctx.d;
    if (o.section) {
      const s = secRef(d, o.section);
      d.rooms.forEach((r) => { if (r.section === s.id) { r.section = ''; if (s.zone) r.zone = s.zone; } });
      d.sections.splice(d.sections.indexOf(s), 1);
      ctx.changes.push('Section ' + s.name + ' ungrouped · the rooms stay');
    } else if (o.zone) {
      const z = zoneRef(d, o.zone);
      d.sections.forEach((s) => { if (s.zone === z.id) s.zone = null; });
      d.rooms.forEach((r) => { if (r.zone === z.id) delete r.zone; });
      d.zones.splice(d.zones.indexOf(z), 1);
      ctx.changes.push('Zone ' + z.name + ' ungrouped · the sections stay');
    } else fail('ungroup needs section or zone');
  },
  remove(ctx, o) {
    const d = ctx.d;
    if (o.pen != null) {
      const r = roomRef(d, o.room);
      const D = derive(d), rd = D.room[r.id];
      const p = rd.pens.find((x) => x.code === o.pen) || rd.drawn.find((x) => x.code === o.pen);
      if (!p) fail("Pen '" + o.pen + "' not found in " + r.name);
      if (p.shape != null) r.pens.splice(p.shape, 1);
      else {
        const l = p.end != null ? r.ends[p.end] : r.lanes[p.lane], total = l.runs.reduce((a, u) => a + u.n, 0);
        l.runs[p.run].n -= 1;
        if (l.runs[p.run].n <= 0) { l.runs.splice(p.run, 1); mergeRuns(l); }
        if (!l.runs.length) { if (p.end != null) OPS.remove_end_row(ctx, { room: r.id, end: p.end }); else removeLane(ctx, r, p.lane); ctx.rebuild.add(r.id); return; }
        ctx.changes.push('Pen ' + o.pen + ' removed' + shiftNote(letter(p.lane), p.j + 2, total, 1));
      }
      ctx.rebuild.add(r.id);
      return;
    }
    if (o.corner != null) {
      const r = roomRef(d, o.room), tm = typesMap(d), g = roomGeom(r, tm), cur = cornersOf(r, g);
      if (cur.length <= 3 || o.corner < 0 || o.corner >= cur.length) fail('A room needs at least 3 corners');
      keepOrigin(d, r, () => { r.outline = clone(cur); r.outline.splice(o.corner, 1); });
      ctx.rebuild.add(r.id); ctx.changes.push('Corner removed');
      return;
    }
    if (o.end != null && o.lane == null) { OPS.remove_end_row(ctx, o); return; }
    if (o.lane != null) {
      const r = roomRef(d, o.room);
      if (!r.lanes[o.lane]) fail('Lane ' + letter(o.lane) + ' not found in ' + r.name);
      if (o.run != null) {
        const l = r.lanes[o.lane];
        if (!l.runs[o.run]) fail('Run ' + (o.run + 1) + ' not found in lane ' + letter(o.lane));
        if (l.runs.length < 2) fail('A lane keeps at least one run. Remove the lane instead');
        const run = l.runs[o.run], total = l.runs.reduce((a, u) => a + u.n, 0);
        let from = 0; for (let j = 0; j <= o.run; j++) from += l.runs[j].n;
        const t = typeRef(d, run.type), I = typeInfo(t);
        l.runs.splice(o.run, 1);
        mergeRuns(l);
        let text = run.n + ' ' + (run.n === 1 ? I.s1 : I.s2) + ' removed from lane ' + letter(o.lane);
        if (total > from) text += shiftNote(letter(o.lane), from + 1, total, run.n);
        ctx.changes.push(text);
      } else removeLane(ctx, r, o.lane);
      ctx.rebuild.add(r.id);
      return;
    }
    if (o.type != null) {
      const t = typeRef(d, o.type);
      const rep = o.replaceWith ? typeRef(d, o.replaceWith) : null;
      let used = 0;
      d.rooms.forEach((r) => {
        r.lanes.concat(r.ends || []).forEach((l) => { l.runs.forEach((u) => { if (u.type === t.id) { used++; if (rep) u.type = rep.id; } }); const merged = []; l.runs.forEach((u) => { const p = merged[merged.length - 1]; if (p && p.type === u.type) p.n += u.n; else merged.push(u); }); l.runs = merged; });
        (r.pens || []).forEach((p) => { if (p.type === t.id) { used++; if (rep) p.type = rep.id; } });
        if (used) ctx.rebuild.add(r.id);
      });
      if (used && !rep) fail("Pen type '" + t.name + "' is used by " + used + (used === 1 ? ' lane or pen' : ' lanes or pens') + ': say replaceWith');
      d.types.splice(d.types.indexOf(t), 1);
      ctx.changes.push(t.name + ' deleted' + (rep && used ? ' · now ' + rep.name : ''));
      return;
    }
    if (o.section != null) {
      const s = secRef(d, o.section), k = d.rooms.filter((r) => r.section === s.id);
      k.forEach((r) => { d.rooms.splice(d.rooms.indexOf(r), 1); ctx.gone.add(r.id); });
      d.sections.splice(d.sections.indexOf(s), 1);
      ctx.changes.push('Section ' + s.name + (k.length ? ' and its ' + (k.length === 1 ? 'room' : k.length + ' rooms') : '') + ' deleted');
      return;
    }
    if (o.zone != null) { OPS.ungroup(ctx, { zone: o.zone }); return; }
    const refs = o.rooms || (o.room != null ? [o.room] : null);
    if (!refs) fail('remove needs a room, rooms, section, zone, lane, pen, corner or type');
    const rs = refs.map((x) => roomRef(d, x));
    rs.forEach((r) => { d.rooms.splice(d.rooms.indexOf(r), 1); ctx.gone.add(r.id); });
    ctx.changes.push(rs.length === 1 ? rs[0].name + ' deleted' : rs.length + ' rooms deleted');
  },
  auto_layout(ctx) {
    // first layout of rooms that have no position: rows by section, zones side by side
    const d = ctx.d, tm = typesMap(d);
    let x = 400;
    const placed = [];
    d.zones.forEach((z) => {
      x = 400;
      const mine = [];
      d.sections.filter((s) => s.zone === z.id).forEach((s) => {
        d.rooms.filter((r) => r.section === s.id && !r.at).forEach((r) => { const g = roomGeom(r, tm); r.at = { x: x, z: -round(g.fl / 100) * 100 }; x += g.fw + 260; mine.push(r); ctx.rebuild.add(r.id); });
        x = x - 260 + 700;
      });
      placed.push(mine);
    });
    const loose = d.rooms.filter((r) => !r.at);
    if (loose.length) { let lx = 400; loose.forEach((r) => { const g = roomGeom(r, tm); r.at = { x: lx, z: 1500 }; lx += g.fw + 260; ctx.rebuild.add(r.id); }); }
    const b0 = placed[0] && placed[0].length ? bboxOf(placed[0].map((r) => fpOf(r, roomGeom(r, tm)))) : null;
    placed.forEach((rs, k) => {
      if (k === 0 || !rs.length || !b0) return;
      const b = bboxOf(rs.map((r) => fpOf(r, roomGeom(r, tm))));
      const dx = round((b0.x1 - b.x1 - 400) / 100) * 100, dz = round((b0.z0 - 2000 - b.z1) / 100) * 100;
      rs.forEach((r) => { r.at.x += dx; r.at.z += dz; });
    });
    ctx.changes.push('Rooms laid out');
  }
};
function shiftNote(Lt, firstOld, lastOld, by) {
  if (lastOld < firstOld) return '';
  if (firstOld === lastOld) return ' · ' + Lt + firstOld + ' is now ' + Lt + (firstOld - by);
  return ' · ' + Lt + firstOld + '–' + Lt + lastOld + ' are now ' + Lt + (firstOld - by) + '–' + Lt + (lastOld - by);
}
function removeLane(ctx, r, i) {
  const old = r.lanes.length;
  r.lanes.splice(i, 1);
  let text = 'Lane ' + letter(i) + ' removed';
  const moved = old - 1 - i;
  if (moved === 1) text += ' · ' + letter(i + 1) + ' is now ' + letter(i);
  else if (moved > 1) text += ' · ' + letter(i + 1) + '–' + letter(old - 1) + ' are now ' + letter(i) + '–' + letter(old - 2);
  ctx.changes.push(text);
}

// applyOps(doc, ops) -> { doc, changes, problems, rebuild, moved, gone, made }
// Each op is checked before it changes anything; one that cannot apply is skipped and reported in plain words.
// opts.mutate edits the document in place (the page does this so it can keep what it drew).
export function applyOps(doc, ops, opts) {
  const d = opts && opts.mutate ? doc : clone(doc);
  const ctx = { d: d, changes: [], problems: [], rebuild: new Set(), moved: new Set(), gone: new Set(), made: [], rebuildAll: false };
  (ops || []).forEach((o, i) => {
    const fn = o && OPS[o.op];
    if (!fn) { ctx.problems.push(o && o.op ? "Unknown op '" + o.op + "'" : 'Op ' + (i + 1) + ' has no name'); return; }
    const snap = opts && opts.mutate ? null : null;
    void snap;
    try { fn(ctx, o); } catch (e) { if (e instanceof Problem) ctx.problems.push(e.problem); else throw e; }
  });
  return { doc: d, changes: ctx.changes, problems: ctx.problems, rebuild: Array.from(ctx.rebuild), rebuildAll: ctx.rebuildAll, moved: Array.from(ctx.moved), gone: Array.from(ctx.gone), made: ctx.made };
}

export const ENGINE_OPS = Object.keys(OPS);
