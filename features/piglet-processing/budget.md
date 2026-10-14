# piglet-processing: headers, information budget

Scope: the headers only (the shared Headers change). Bodies keep their own budgets.

## Inventory

- The task name, the last record (time, hand), the sow's tag, the pen, parity, the alive count, the piglets' age in days, the batch, items done, a correction in progress (`Fixing 001216`).

## Questions

1. Which pen am I at? 2. Is this the right sow? 3. Can I trust the list (last record)? 4. What is left to do here? (the body: the processing days)

## Levels

- **Settled**, header line: last record on the list; chip and pen on the pen sheet. Parity is cut: it answers nothing in processing (the owner's example: it matters at farrowing and may not elsewhere). Alive count and day are on the Piglets card and the processing days. Batch is on the summary card.
- Cut list: `B05 · parity 3 · 11 piglets · day 1`, `A03 · day 4`, `A03 · 12 alive`, `A02 · Sow 000238`, `A02 · sow 000238 · 8 without ID`, `Fixing 001216`, `Piglet processing · Batch 40`.

## Headers (2026-10-13)

The header line of every surface of this feature, decided by the Headers law (`ux/design-system/README.md#headers-law-owner-2026-10-13`, owner 2026-10-13). The default is no line; each kept fact names its question and passes the Back test.

| Surface | Hub or action | Header line | The worker's question it answers there | Back test |
|---|---|---|---|---|
| Pen list (task page) | hub | fact: `Last record 08:20 · G. Hansen` (none while a phone-clash note shows: the note is the newer fact) | Can I trust this list? | Back (new) reaches Today, as the Farrowing room's does |
| Pen sheet | hub | route: `#000245 ›` · `A03` | chip: open the sow; pen: is this the pen in front of me | Back reaches the list, which does not say which pen I opened |
| Boars and gilts, Litter weight, Record death, Set count, Fewer piglets, More actions | action | none | | Back reaches the pen sheet |
| Piglets (identified piglets) | hub for Give IDs | route: `#000238 ›` · `A02` | Whose litter am I identifying? | the pen sheet (chip) | on screen |
| Give IDs | action (page) | none | | Piglets (chip), walked in crit round 1 | one Back away |
| Move piglets, Pen log | action (pages) | none | | Back reaches the pen sheet (chip) | one Back away |
| End task, Task ended | action (page) | none | the receipt in the body says who and when | Back reaches the list |
| Round pages outside the atlas (room, litter, count, dead, edit, id, bulk, move, end) | room: hub; the rest actions | room: fact (last record); others none; their status and instructions are the body's first line | | |

Ambiguous, quieter option taken: Give IDs: `Fixing 001216` is cut, not moved (the tag field shows the number being fixed); the litter is one Back away on Piglets. The litter drawer of the round pages has no route line (that round has no sow page for a chip to open).


### Corner actions and titles (2026-10-14)

By the Headers law → Corner actions and Title length (`ux/design-system/README.md`, owner ruling C, 2026-10-14; PR #165). Room at a true 360, as `scripts/check-headers.mjs` (workflow/header-checks) measures it: a drawer title has 360 − 2 × (18 + 48 + 12) = 204px (a missing corner counts as the room it would take); a page title has 216px beside Back. Titles measured at their own face (sheet 500 20px, page 500 22px), EN and ZH.

| Surface | Corner action (top right) | Present while | Title | Fits at 360 (EN · ZH) |
|---|---|---|---|---|
| Round pages' drawers (dead, tagged, count, edit, weigh, litter weight, dose, room filter) | Clear / Reset | as before: a draft, a change or a filter | unchanged | |
| Bulk record (a page) | Clear moves to the list, beside Tick all (a page header has no corners; the footer keeps the primary) | something is ticked | unchanged | |

Known, not changed here: the round pages outside the atlas carry question titles that overrun 204px (`Which tagged piglets are missing?`, `Same body recorded twice?`, `Found outside its crate?`); they are not atlas screens, so they are listed for the feature's own pass. The simplified prototype's titles (the atlas screens) all fit.
