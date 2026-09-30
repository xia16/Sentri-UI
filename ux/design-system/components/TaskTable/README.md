**Status: candidate.** Extracted from farrowing's comparison table on the Task overview (`.unit-routing`: Choose a unit) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)), owner round 5 (match farrowing exactly). It is not approved.

# TaskTable (the comparison table)

Places compared on a few figures, each row a door: `Unit 6 · 4 · 1 · 3 ›`.

**Anatomy** (`.tk-table`, `data-ds="TaskTable"`)
- A section heading (13px/500 with its 16px icon, optional meta), `space-heading` under it.
- One card: 1px `line`, `radius-panel`, `paper`, clipped.
- **Column headings:** `surface`, a 1px `line` under, padded `space-row-y space-row-x`; `table-heading` **9px** `muted` — farrowing's size, below the 10px floor by the owner's round-5 ruling (as the hold caption); the figure columns centred.
- **Rows:** a grid `minmax(78px, 1.5fr) repeat(n, 1fr) 18px`, 8px apart; `animal-row-min` (76px), padded `space-row-x`; a 1px `rule` between rows. The name 14px/500 (a 9px `muted` subline, `Current unit`); each figure `table-figure` 15px mono, centred; an 18px `green` chevron. Pressed: `green-wash`.
- At 370px and below: `minmax(65px, 1.35fr) … 16px`, 5px apart, padded 12; the name 13px.

**Component contract**
- **Props:** `SentriTask.table({ title, icon, meta, nameColumn, columns: [text slots], rows: [{ name, sub, values: [text slots], action = 'open', value, label, current }], label })`.
- **Events:** each row is `<button data-action data-value>` (`aria-current` on the current place).
