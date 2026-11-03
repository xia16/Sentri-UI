# Farm layout document

One JSON document is the whole farm. It is the only thing saved and the only thing an agent writes.
Units are centimetres. Nothing in it is geometry you have to work out: say what is there and how big,
`layout.engine.js` derives every rectangle, aisle, code and patch, and the 3D page only draws that.

Page: `ActLayout3JS`. Engine (pure functions, no three.js): `layout.engine.js`.
`derive(doc)` gives pens with codes and rectangles, room shells, section and zone patches, totals by use, problems.
`applyOps(doc, ops)` returns `{ doc, changes, problems }`. An op that cannot apply is skipped and explained in plain words.

## Document

    { "name": "Island Acres", "types": [], "zones": [], "sections": [], "rooms": [] }

- **type** `{ id, name, uses: [..], perPen: { use: n }, w, l }`. `w` is the pen's size along the lane, `l` across it.
  `uses` are stages only: Gestation, Farrowing, Nursery, Finishing, Gilts, Boars, Sick. A group pen lists several
  and `perPen` says how many pigs it holds for each. Totals count it under every use it allows.
- **zone** `{ id, name, code, at? }` and **section** `{ id, name, code, zone, at? }`. They carry no geometry: they hug their rooms.
  One with nothing in it is a placeholder yard where it was put: `at {x, z}` is its middle in cm (a section pad is 24 x 16 m, a zone yard 48 x 32 m). `at` is ignored once there are rooms.
- **room** `{ id, name, section, num, at, rot, doors, aLeft, aisle, outline, lanes, ends, pens, devices }`
  - `at {x, z}` where the room's footprint starts on the site. `rot` is 0, 90, 180 or 270 (the door faces south, east, north, west).
  - `doors [{ wall, offset, main }]`: any number of doors, exactly one `main`. `wall` is `front`, `right`, `back` or `left` (the room's own sides; for a drawn outline, the number of the wall, counted from corner 0).
    `offset` is cm along that wall from its first corner (front: from the left as you walk in; right: from the front corner; back: from the right; left: from the back corner). A door opening is 1.6 m.
    **The main door numbers the pens**, as the phone's pen map does: pens are counted from the end of the lanes nearest it (A1 is the first one you reach), and lane A is the lane on your left as you come in.
    A main door on a side wall counts from the nearer end, and lane A is the one nearest the door (`aLeft: false`: the farthest). The other doors are openings people and pigs use (loading, cleaning, between rooms).
    Old documents have `door { offset? }` instead: it is the main door on the front wall (default: the aisle nearest the middle). It is read as before, and rewritten as `doors` the first time a door op touches the room.
  - `aLeft` true (default): lane A is on the left as you walk in. `aisle` is a number, or `{ wall, between }`.
    Default 120. Pens that stand against the walls use `wall: 0`.
  - `outline` optional wall polygon `[[across, along], ..]` in cm, measured from the door wall's left corner. Without it the room is a rectangle fitted to its lanes.
  - `lanes [{ runs: [{ type, n }] }]`: lanes run away from the door, lettered A, B, C. A lane is one or more runs
    of one pen type each, in order from the door. Pens are numbered along the lane: A1, A2 ...
  - `ends [{ at, runs: [{ type, n }] }]` end rows: a row of pens **across** the room, side by side, at the far end
    (`at: "far"`, the default) or by the main door (`at: "door"`). An end row is a lane turned across the room: a pen type's `w`
    runs along the row, its `l` is how deep the pen stands. The row is centred across the room, which grows deeper to hold it
    (and wider, with the lanes then in the middle, when the row is wider than they are). Pens are counted from the side lane A is on.
    End rows are lettered after the lanes in list order (lanes A, B, then end row C, 1 pen: C1). Several rows at one end stack away from the lanes.
  - `pens [{ type, polygon }]` optional pens of any shape, polygon `[[across, along], ..]`. The page draws them and keeps them
    (a document that came with them), but nothing in it creates them any more: use an end row. One that stands at the far
    end of one lane carries on that lane's numbers; any other gets the next free letter.

## Ops

`set_farm` `add_pen_type` `set_pen_type` `add_zone` `add_section` `add_room` `set_room` `set_lanes` `add_end_row` `set_end_row` `remove_end_row` `add_door` `move_door` `remove_door` `set_main_door` `set_outline`
`draw_pen` (reads and writes drawn pens for imported documents; the page no longer offers it) `move_room` `move_zone` `move_section` `copy_room` `rename` `group` `ungroup` `remove` `auto_layout`

- `add_room { name, section, at {x,z} | near { room, side, gap } , door, aisle, lanes, ends, outline, pens }`; `at: "auto"` waits for `auto_layout`. `door { wall: "south", offset }` here is the old way: it turns the room so its main door faces that side of the site.
- `add_zone { name, at? }` and `add_section { name, zone, at? }`: `at` is where an empty one stands.
- `add_door { room, wall, offset? }` puts another door on a wall (the middle, or the nearest free spot). `move_door { room, door, wall?, offset? }` slides a door (`door` is its place in the room's list, or `"main"`), round corners onto another wall.
  `remove_door { room, door }` (never the main door: make another main first). `set_main_door { room, door }` renumbers the pens from that door. Two doors never stand within 2 m of each other on a wall.
- `add_end_row { room, at, type, n }` (or `runs`) puts a row of pens across the room. `set_end_row { room, end, runs?, at? }` changes one (`end` is its place in the room's list: 0 is the first, lettered after the last lane). `remove_end_row { room, end }` takes one away; the letters after it move up. `remove { room, pen: "C3" }` takes a pen out of an end row like a lane's.
- `add_device { room, kind, pens | wall, offset | u, v }` puts a device in a room (a capability preview: nothing reads from it yet). A kind serves the **room** (climate, fan: on a wall), a **spot** (temp, nh3: hung anywhere, described as near the closest pen) or **pens** (feeder, water, heat, camera, floor, scale: `pens: ["A1", ...]`). A pens device has no position of its own: derive gives it a floor `route` ({ segs: [[u1, v1, u2, v2], ...], u, v } in cm) that runs from the cross aisle by the door up the aisles beside its lanes, with a stub to each pen, never through a pen; the marker stands beside the middle of its pens. `set_device_pens { room, device, pens }` changes them. Any device may carry `code` (the code on its label that binds it to the real device) and `model`: `add_device` takes them, `set_device { room, device, code, model }` changes them (an empty value removes it). A room kind hangs anywhere too, not only on a wall. An old `{ pen }` reads as one pen. `move_device { room, device, ... }` and `remove_device { room, device }` take the device's `id`. In the app a lane is called a Lane and an end row a Row (the ops keep the old names).
- `move_zone { zone, dx, dz }` and `move_section { section, dx, dz, zone? }` move everything inside by cm. `zone` on a section puts it into that zone (`""`: no zone); its codes follow. Rooms and patches never overlap: a move that would land on one goes on to the nearest clear spot and the change says how far.
- `copy_room { room, times, side, gap }` numbers the names (Farrowing 2, 3 ...). Rooms never overlap: one that would is moved to the nearest free spot and the change says so.
- `remove` takes one of: `room`/`rooms`, `section`, `zone`, `{ room, lane }`, `{ room, lane, run }`, `{ room, end }`, `{ room, pen: "C5" }`, `{ room, corner }`, `{ type, replaceWith }`.
- `group { rooms, as: "section", name }` or `{ sections, as: "zone", name }`.

## One example

    [ { "op": "add_pen_type", "id": "crate", "name": "Farrowing crate", "uses": ["Farrowing"], "per": 1, "w": 180, "l": 260 },
      { "op": "add_zone", "name": "Island Acres" },
      { "op": "add_section", "name": "Farrowing house", "code": "FAR", "zone": "Island Acres" },
      { "op": "add_room", "name": "Farrowing 1", "section": "Farrowing house", "at": { "x": 0, "z": 0 }, "door": { "wall": "south" },
        "aisle": { "wall": 0, "between": 222 }, "lanes": [ { "runs": [ { "type": "crate", "n": 20 } ] }, { "runs": [ { "type": "crate", "n": 20 } ] } ] },
      { "op": "copy_room", "room": "Farrowing 1", "times": 10, "side": "east", "gap": 0 } ]

The group-gestation barn is two lanes of ten group pens and an end row of 24 stalls (`add_end_row`), which makes the plan's 53.85 m. Four real farms built this way are in `farms/<id>.ops.json` (what the agent sends) and `farms/<id>.json` (the result).
