# PenMap propagation inventory · 2026-11-16

Source: [`PenMap`](../../../ux/design-system/components/PenMap/README.md), updated in `46ef869c` (2026-11-03). The room layout adapter and contract already describe the current component. Farrowing and Inspection remain `in-design`.

| Place | Difference from the current component | This branch |
|---|---|---|
| `features/farrowing/PRD.md`, `budget.md` | The budget still specified the retired `1–20` range buttons and treated row numbers as universal. Neither file said when Whole room or a no-map room applies. | Updated the intended room-shape and Whole room rules, with the 4 × 6 prototype called out as sample data. |
| `features/inspection/PRD.md`, `budget.md` | Only Back and a uniform letter/number grid were described; the new room shapes and Whole room were absent. | Updated the intended rules, preserving Inspection's amber/white/quiet colour mapping. |
| `features/farrowing/feature.json` (`farrowing.pen-map`, `farrowing.room`) | Says a row over 20 pens gets range buttons; the issue describes long rooms that way, and `farrowing.room` still describes a fact line inside each tile. | Replaced the retired rules and added long, Whole room, shared-tile return, mixed-size and one-pen screen states. |
| `features/inspection/feature.json` (`inspection.go-to-pen`, `inspection.walk`) | Says the layout is the same sample 4 × 6 as Farrowing, with no long/mixed layout or Whole room states. | Updated room-shape and Whole room rules, plus long, Whole room and one-pen screen states. |
| `ux/system/farrowing-astra-concept.js`, `ux/system/inspection-astra-concept.js` | Both hosts pass fixed 4 × 6 geometry and obsolete `depth`/`label` footer arguments. On a long room their general `[data-action]` click listeners redraw the new Whole room button before PenMap can handle it. | Pass room props from shared sample fixtures, remove footer arguments, and leave Whole room and group taps to PenMap. `tests/penmap-hosts.test.mjs` covers both hosts. |
| `ux/system/penmap-sample-rooms.js` | No saved-layout-shaped room variants in the prototype hosts. | Added standard, long, mixed and one-pen fixtures for atlas screens; `?penmap=` selects the sample room. Native room data still comes from the saved-layout contract. |
| `ux/design-system/components/PenMap/variants/map.html`, `ux/design-system/components/Sheet/variants/drawer.html` | Specimens still passed retired footer `depth` and `label`; the Chinese PenMap specimen lacked Whole room strings. | Updated both footer calls and the Chinese labels. |
| `atlas/atlas.json` | Generated from the stale `feature.json` entries. | Regenerated from the updated metadata after canvas agreement. |
| `ux/laws/strings.json` | New `ds.penmap.whole_room`, `pen_by_pen`, and `pens` are already present. Old `ds.penmap.jump` remains, and Farrowing's host still carries its retired text. | Removed the unused retired key and host text; the new strings remain. |

No change is needed to `ux/model/pen-map-contract.md`, `ux/system/penmap-from-layout.mjs`, or the component API: they already carry lanes of different lengths, sizes, door orientation, rows across the room and Whole room. Historical critiques and research notes retain their dates and original observations.

## Proposed screen states

- Both features: existing 4 × 6 map (unchanged), long room pen by pen, Whole room, tap shared tile back to its first pen, mixed sizes and a row across the room, one/no-pen room without a map entry.
- Farrowing: amber, blue, white and quiet levels still come from the room's shown sows; peek and landing cue stay as specified.
- Inspection: amber, white and quiet levels still come from the walk's shown pigs; no blue level or checked marker appears.
- Both hosts: let PenMap own Whole room / Pen by pen clicks so the sheet is not redrawn on its empty `data-action`.

The owner agreed to the offline canvas on 2026-11-16. The feature screen metadata and prototypes were updated after that agreement.
