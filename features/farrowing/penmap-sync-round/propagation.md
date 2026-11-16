# PenMap propagation inventory · 2026-11-16

Source: [`PenMap`](../../../ux/design-system/components/PenMap/README.md), updated in `46ef869c` (2026-11-03). The room layout adapter and contract already describe the current component. Farrowing and Inspection remain `in-design`.

| Place | Difference from the current component | This branch |
|---|---|---|
| `features/farrowing/PRD.md`, `budget.md` | The budget still specified the retired `1–20` range buttons and treated row numbers as universal. Neither file said when Whole room or a no-map room applies. | Updated the intended room-shape and Whole room rules, with the 4 × 6 prototype called out as sample data. |
| `features/inspection/PRD.md`, `budget.md` | Only Back and a uniform letter/number grid were described; the new room shapes and Whole room were absent. | Updated the intended rules, preserving Inspection's amber/white/quiet colour mapping. |
| `features/farrowing/feature.json` (`farrowing.pen-map`, `farrowing.room`) | Says a row over 20 pens gets range buttons; the issue describes long rooms that way, and `farrowing.room` still describes a fact line inside each tile. | Awaiting canvas agreement; updating a screen's metadata also changes the atlas source. |
| `features/inspection/feature.json` (`inspection.go-to-pen`) | Says the layout is the same sample 4 × 6 as Farrowing, with no long/mixed layout or Whole room states. | Awaiting canvas agreement. |
| `ux/system/farrowing-astra-concept.js`, `ux/system/inspection-astra-concept.js` | Both hosts pass fixed 4 × 6 geometry and obsolete `depth`/`label` footer arguments. On a long room their general `[data-action]` click listeners redraw the new Whole room button before PenMap can handle it. | Live-prototype mock and before/after screens in `mock.mjs`; source edits await canvas agreement. |
| `atlas/atlas.json` | Generated from the stale `feature.json` entries. | Regenerate after the screen metadata and prototype change, not before canvas agreement. |
| `ux/laws/strings.json` | New `ds.penmap.whole_room`, `pen_by_pen`, and `pens` are already present. Old `ds.penmap.jump` remains, and Farrowing's host still carries its retired text. | Remove the retired host usage with the prototype change; check registry usage before removing the key. |

No change is needed to `ux/model/pen-map-contract.md`, `ux/system/penmap-from-layout.mjs`, the component API, or the component specimens: they already carry lanes of different lengths, sizes, door orientation, rows across the room and Whole room. Historical critiques and research notes retain their dates and original observations.

## Proposed screen states

- Both features: existing 4 × 6 map (unchanged), long room pen by pen, Whole room, tap shared tile back to its first pen, mixed sizes and a row across the room, one/no-pen room without a map entry.
- Farrowing: amber, blue, white and quiet levels still come from the room's shown sows; peek and landing cue stay as specified.
- Inspection: amber, white and quiet levels still come from the walk's shown pigs; no blue level or checked marker appears.
- Both hosts: let PenMap own Whole room / Pen by pen clicks so the sheet is not redrawn on its empty `data-action`.
