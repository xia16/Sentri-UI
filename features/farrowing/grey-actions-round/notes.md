# Grey actions round (owner, 2026-11-06)

Two corrections: "When a sow died, the actions should just be grey" and "Why is this Record dead grey background but not a white card around the action?" Branch `design/grey-actions-record-dead`, canvas first; nothing merged.

Every PNG is bare 390 × 844, `<page>?layout=focus&screen=<id>` then the taps listed, served with `node scripts/serve-ux.cjs` from origin/main 1634a9d5 (before) and this branch (after).

| PNG pair | Reached by | What changed |
|---|---|---|
| `farrowing-dead-sow-actions` | `farrowing.ended` → `[data-action="sowActions"]` | A sow that died: was one Note tile and "Unavailable actions (2) ›". Now the live sow's whole grid, greyed in place (Condition, Treat, Resolve, Care, Transfer, Measure, Feed), Note live; Production rows greyed with "This sow has died." |
| `farrowing-live-sow-actions` | `farrowing.count` → `[data-action="sowActions"]` | A live sow: Resolve and Care (no open condition) and Feed (no feeding plan) now grey in place; they were missing. |
| `pig-profile-actions` | `pig-profile.actions` | Resolve greyed in place (000267 has no open condition). |
| `pig-profile-unavailable-actions` | `pig-profile.unavailable-actions` | Was the Unavailable actions page; the page is gone, so the screen (id kept) is now 000254's Actions with Resolve and Care greyed. |
| `inspection-actions` | `inspection.actions` | Two pigs with conditions: nothing unavailable, so the grid is unchanged in content (Edit is a tile when it applies). |
| `farrowing-record-dead-locked` | `farrowing.locked` → Record dead | The seven steppers were loose on the tint; now one white card (Panel). |
| `farrowing-record-dead-sow-died` | `farrowing.ended` → Record dead | Same card; the card leads the body (no switch above); Clear no longer shows when there is nothing to clear (her recorded cause is never cleared). |
| `farrowing-record-dead-the-sow` | `farrowing.locked` → Record dead → The sow | No change needed: the cause radios are already one white card (ChoiceList), Photos is the empty optional well SURFACES allows, the banner has its own surface. |
| `farrowing-death` | `farrowing.death` | Report death: the causes card is now the shared Panel instead of a local box (looks the same). |
| `farrowing-death-the-sow` | `farrowing.death` → The sow | No change needed (as above). |
| `farrowing-foster-send` | `farrowing.foster-send` | "Without ID" stepper keys sat in a tinted well on the tint; now a white card, its label above on the tint like "With ID". |
| `farrowing-reconcile` | `farrowing.reconcile` | System count (tinted box) is a white Panel; the count stepper's keys are a white card. |
| `farrowing-piglet-death` | `farrowing.count` → sowActions → Piglet processing → Piglet records → Report mortality | Unidentified piglets stepper keys: white card. |

## Also changed, not shot

- Measurements (a single ad-lib pig): Record body condition stays in its place, greyed ("Ad-lib pigs do not have an individual ration."); it was dropped and listed on the old page.
- Farrowing pen pages: Feed guidance text and a resolved fault's resolution now sit inside their card. Neither state is reachable in the demo data (no pen has feed guidance; no fault is resolved).

## The parts

- Row · Tile `disabled` + `reason`: a real disabled button (`disabled`, `aria-disabled="true"`), no press, the well `disabled-surface` with a dashed `control-border` rim, glyph and word `muted`; Death greyed loses its red and stays last. The reason is only in the accessible name ("Treat, Record treatment, not available: this sow has died"). Specimens: Row › Tile › "Greyed in place · a sow that died" and "Greyed in place · Death stays last".
- Row · Navigation disabled: the same grey icon tile and muted words; its reason stays line 2 (the Row's documented disabled face).
- Stepper `well` on a page, drawer or menu: its keys are a white card. The skeleton context (tasks not designed yet) keeps the well.
- Removed: `unavailableActionsPage`, `unavailableActionGroups`, the "Unavailable actions (n) ›" button, its CSS, and strings `feed.copy.pig.190` / `.221` (nothing else used them).

## Judgement calls

- Multi-select Actions now shows Edit (conditions) greyed when no ticked pig has a condition, so the grid keeps the shape it has when they do. Before, Edit was simply absent and not on the old page either.
- A dead sow's Production rows each say "This sow has died." on line 2 (the Row disabled face). Six identical lines is a lot; the owner may prefer the tile rule (reason in the accessible name only, the row's own line 2 kept).
- A dead pig's Production now lists Farrowing's host rows (abortion, not in pig, piglet processing, reconcile, foster) and Batch membership, greyed. Before they were hidden by the stage filter, because a dead pig has no stage. Nothing that was unavailable became available.
- A host note (Farrowing's Edit note) that can't act gives its place to the plain Add a note, which a dead sow still takes; there is never a second Note tile.

## Not done

- The atlas screens `farrowing.sow-actions`, `.note`, `.piglet-care`, `.piglet-identity` and `.piglet-death` replay a text step "Actions" that hits the room dock's Actions (Pigs in Unit 7) rather than the sow's. It was like this on main; I left it alone. These shots tap `[data-action="sowActions"]` instead.
- Farrowing's piglet processing pages (Care, Piglet records, identity) were not swept: piglet processing is not designed yet (owner, 2026-10-20).
- `atlas/component-usage.json` and `review/*.json` were not regenerated.
