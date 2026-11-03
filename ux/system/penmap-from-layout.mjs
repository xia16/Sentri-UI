/* The phone's pen map from the farm layout: the one lossy step from a room as the console derives it to the props of
   SentriUI.penMap (contract: ux/model/pen-map-contract.md). It keeps what a worker walks by (the order of lanes and pens
   from the main door, their codes, the size of each pen type, which side lane A is on, where the doors are) and drops every
   centimetre the phone does not draw. Pure: no DOM, no engine; it reads only the fields the contract names.
   penMapOf(room, types) → { room, name, map, props: { lanes, rows, apart, aSide, entranceAt, backDoor }, pens }
   room: one room of the console engine's derive(doc).rooms; types: derive(doc).type (id → { name, w }). */
const letter = (i) => String.fromCharCode(65 + i);

export function penMapOf(room, types) {
  const g = room.geom, typeOf = (id) => types[id] || { name: id };
  const run = (u) => { const t = typeOf(u.type), r = { n: u.n, type: t.name || u.type }; if (t.w > 0) r.size = t.w; return r; };
  /* the worker stands at the main door and looks along the lanes: "left" is her left (the engine's u, or its mirror
     when the pens are counted from the far end) */
  const left = (u) => (g.vflip ? g.dW - u : u);
  const centre = (l) => left((l.x0 + l.x1) / 2);
  const bySide = g.lanes.slice().sort((a, b) => centre(a) - centre(b));
  const aSide = bySide.length > 1 && bySide[0].i !== 0 ? 'right' : 'left';
  /* a door on the end wall, snapped to the aisle it opens onto: before the first lane, between lanes, after the last */
  const across = (d) => {
    if (!bySide.length) return 'middle';
    const u = left(d.u);
    return u < centre(bySide[0]) ? 'left' : u > centre(bySide[bySide.length - 1]) ? 'right' : 'middle';
  };
  const main = g.doors.find((d) => d.main) || g.doors[0];
  const side = main.side === 'left' || main.side === 'right';
  /* a main door on a side wall: the Entrance words sit on that side as she stands at the near end */
  const entranceAt = side ? ((main.side === 'left') !== !!g.vflip ? 'left' : 'right') : across(main);
  /* the far end of the lanes is the end wall away from where the pens are counted; a door there ends the map */
  const farWall = g.vflip ? 'front' : 'back';
  const back = g.doors.find((d) => !d.main && d.side === farWall);
  const backDoor = back ? { at: across(back) } : null;

  const lanes = g.lanes.map((l) => ({ letter: letter(l.i), runs: l.runs.map(run) }));
  const rows = (g.ends || []).map((e) => ({ letter: letter(e.i), at: e.at === 'door' ? 'door' : 'far', runs: e.runs.map(run) }));
  /* pens drawn by hand (imported layouts): one on a lane carries on that lane; any other stands on its own, at the row of
     the lane pen nearest it */
  const drawn = room.drawn || [], lanePens = (room.pens || []).filter((p) => p.end == null);
  drawn.filter((p) => p.lane != null).forEach((p) => {
    const l = lanes[p.lane], last = l.runs[l.runs.length - 1], r = run({ type: p.type, n: 1 });
    if (last && last.type === r.type) last.n++; else l.runs.push(r);
  });
  const apart = drawn.filter((p) => p.lane == null).map((p) => {
    const near = lanePens.slice().sort((a, b) => Math.abs(a.v - p.v) - Math.abs(b.v - p.v))[0];
    return { code: p.code, row: near ? near.j + 1 : 1 };
  });
  /* every pen with its code and its id: the id is what records hold (the code is a label, see Pen identity) */
  const pens = (room.pens || []).concat(drawn).map((p) => ({ code: p.code, id: p.id || p.code, type: typeOf(p.type).name || p.type }));
  return { room: room.code, name: room.name, map: pens.length > 1, props: { lanes, rows, apart, aSide, entranceAt, backDoor }, pens };
}

