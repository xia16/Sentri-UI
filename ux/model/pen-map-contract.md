# Pen map contract: from the console's Farm layout to the phone's pen map

The console's Farm layout describes every room exactly (centimetres, walls, door offsets, devices). The phone's [Pen map](../design-system/components/PenMap/README.md) draws a room the way a worker walks it. This contract is the one step between them: what the phone receives, where it comes from, and what it must ignore.

- **Function:** `penMapOf(room, types)` in [`ux/system/penmap-from-layout.mjs`](../system/penmap-from-layout.mjs). Pure: no DOM, no engine.
- **Tests:** [`tests/penmap-from-layout.test.mjs`](../../tests/penmap-from-layout.test.mjs), on rooms the console engine derived ([`ux/system/penmap-from-layout.fixtures.json`](../system/penmap-from-layout.fixtures.json)). The fixtures are regenerated whenever the engine changes the fields below.
- **Owner rulings it carries:** the pen lists don't change (2026-11-02); size, not labels (2026-11-03); one zoom out, Whole room (2026-11-03).

## Three layers, one source

| Layer | Where | What it holds |
|---|---|---|
| Layout document | the console (`layout.schema.md`), saved | Rooms, lanes and runs of pen types (with sizes in cm), rows across the room, doors (wall and offset), lane A's side, walls, devices. What people edit. |
| Derived room | the console engine, `derive(doc).rooms[i]` | Every pen's code and rectangle, the lanes' order across the room, the doors' sides. What the 3D view draws. |
| Pen map room | **this contract**, `penMapOf(room, types)` | The room as a worker meets it at the main door. What the phone draws. |

It runs when the console saves the layout (Save layout, Done). Drafts and half-made rooms never reach phones. The result is stored per room and cached on the phone for offline use. The phone never runs the engine or three.js.

## Input: the derived room (the fields this contract reads)

The engine may change anything else freely. A change to one of these fields changes the contract and its fixtures.

| Field | Meaning |
|---|---|
| `code`, `name` | The room's code and name. |
| `geom.lanes[] { i, x0, x1, runs[] { type, n } }` | Lane `i` (letter A + i), where it stands across the room, its runs in order from the door. |
| `geom.ends[] { i, at, runs[] }` | Rows across the room (letter A + i, after the lanes); `at` is `far` or `door`. |
| `geom.doors[] { main, side, u }` | Every door: whether it is the main one, which wall (`front`, `back`, `left`, `right`), where along the room it stands (cm). |
| `geom.vflip`, `geom.dW` | Whether the pens are counted from the far end (the main door is there), and the room's width, to mirror `u`. |
| `pens[] { code, id?, lane, end?, j, v, type }` | Lane and row pens with their codes (`id` once pens have one; see Pen identity). |
| `drawn[] { code, id?, lane, v, type }` | Pens drawn by hand (imported layouts only); `lane` set when one carries on a lane. |
| `types { id: { name, w } }` | `derive(doc).type`: each pen type's name and its length along the lane in cm. |

## Output: the pen map room

```js
{ room: 'Z1-GES-1', name: 'Gestation barn',
  map: true,                                   // false: one pen or none. The host draws no Pen map button
  props: {                                     // passed straight to SentriUI.penMap({ ...props, pens, current, labels, ... })
    lanes: [{ letter: 'A', runs: [{ n: 10, type: 'Group pen', size: 483 }] }, ...],
    rows:  [{ letter: 'C', at: 'far', runs: [{ n: 24, type: 'Gestation stall', size: 65 }] }],
    apart: [{ code: 'C1', row: 2 }],           // pens on their own (imported layouts only)
    aSide: 'left' | 'right',                   // lane A on her left or right as she walks in
    entranceAt: 'left' | 'middle' | 'right',   // which aisle the main door opens onto
    backDoor: null | { at: 'left' | 'middle' | 'right' } },  // a door at the far end of the lanes
  pens: [{ code: 'A1', id: 'A1', type: 'Group pen' }, ...] } // every pen; records hold the id
```

The host adds what the layout cannot know: each pen's status (`pens` levels), the current pen, the words (`labels`, the back door's label), the peek. The test draws every output through `SentriUI.penMap` and checks the tiles are exactly the listed pens.

## Each console detail and what the phone keeps

| The console has | The phone keeps | Why |
|---|---|---|
| Lanes and runs | Letter, and each run's type name, count and size (cm along the lane) | Order and codes are how she finds a pen; size tells the type ([Pen sizes](../design-system/components/PenMap/README.md#pen-sizes)). |
| Rows across the room (`ends`) | `rows`, by the door or at the far end | The order she meets them. |
| Pens drawn by hand | On a lane: one more pen of that lane. Otherwise `apart`, at the row of the nearest lane pen. | The console no longer makes them; imported layouts still have them. |
| The main door's offset | `entranceAt`, snapped to the aisle the door opens onto | A nudge never moves the phone; it changes only when the door crosses a lane. |
| The main door's wall | Nothing for an end wall: pens are numbered from the main door, so it is always the top. A side wall: `entranceAt` is that side as she stands at the near end. | One reading direction for every room. |
| Other doors | `backDoor` for a door on the far end wall; side doors are dropped | She starts from the high numbers when she comes in at the back; a side door doesn't change the order. |
| `aLeft`, a door on the back or side wall | `aSide`, worked out where she stands | Lane A's side as she sees it, not as the console draws it. |
| Pen depth (`l`), aisles, walls, outline, wall thickness | Nothing | Tiles are never to scale across the lane; an odd room matters only through its pens. |
| Room position, rotation, zones, sections | Nothing (room code and name only) | The farm overview's job. |
| Devices, heights, colours, problem flags | Nothing | The phone's pen map doesn't show devices; a broken layout is never saved. |

Tested (each one leaves the output unchanged): the main door 30 cm one way and 80 cm the other, deeper group pens, a wider aisle, the room moved and turned, a side door added, a non-rectangular outline, the main door moved to the back wall. Tested (each one changes it, as it should): the door into the left aisle, a back door, lane A on the right, the main door on the left wall near the far end, the stall row moved by the door.

## Pen identity: proposal, owner decision

**The problem.** A pen's code comes from its position. These console edits re-code pens that already exist:
- adding a lane re-letters every row across the room (Row C becomes D, so all 24 stalls get new codes);
- inserting pens in a lane renumbers every pen after them;
- choosing another main door, or putting lane A on the other side, re-codes the whole room.

Everything that holds a code then points at the wrong pen: the sows recorded in a pen, the console's devices (a feeder bound to `C1–C12`), plans and tasks, and the codes painted on the barn.

**Proposal (recommended):**
1. **Every pen gets an id when it is first saved**, never reused. Records, devices, plans and tasks hold the id; the code is a label.
2. **A saved pen keeps its code.** Edits never re-code a saved pen. A new pen takes the next free number in its lane (A21, even when it stands between A10 and A11); a new lane or row takes the next free letter. The map still draws by position, so it matches the barn and the signs stay true.
3. **Renumber room is an explicit action** in Edit layout. It shows each pen's old and new code, says which pens hold pigs or devices, and asks for confirmation. Records follow the ids, so nothing is lost; only the signs need repainting. Choosing another main door, or the other side for lane A, asks "Renumber the pens from here?" (Renumber / Keep codes).
4. **A pen with pigs in it can't be removed** until they are moved.

**What it affects:**
- **Layout document:** runs gain `ids` and, once saved, `codes`, aligned with `n`.
- **Engine:** `derive` uses stored codes before derived ones, and the add, insert and remove ops keep the arrays aligned.
- **Console:** Edit layout gets Renumber room and the main-door / lane-A question.
- **Devices:** `pens` hold ids.
- **Phone:** nothing changes (it already draws by position and shows codes).
- **This contract:** `pens[].id` becomes the stored id. Until then it is the code, which is only safe while layouts are still being set up.
- **Existing farms:** ids are given at their next save, from today's codes.

**The alternative:** codes always follow position and every save renumbers silently, with records still keyed by id. It is simpler for the engine, but the signs on the barn stop matching the map after any edit, and a worker standing at pen C4 sees a different C4 on the phone. Not recommended.

## When the contract changes

A change to the output shape is a change to the PenMap component's API (`index.d.ts` › `PenMapProps`): both change in one PR. When the console engine changes one of the input fields, regenerate the fixtures from it (`node scripts/penmap-fixtures.mjs <layout.engine.js> <farms dir>`) and run `npm test`. The console owns the engine; this file owns the step.
