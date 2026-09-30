**Status: candidate.** Extracted from farrowing's Finish farrowing totals (`.finish-totals`: `Born 14 · Alive 9 · Dead 5`) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)), owner round 5 (match farrowing). It is not approved.

# TaskTotals (the figures a sheet commits)

The two or three figures a sheet is about to commit, at the top of its body: `Born 14 · Alive 9 · Dead 5` before Finish farrowing, `Litters 4 · Piglets 46` before a bulk record.

**Anatomy** (`dl.st-panel.tk-totals`, `data-ds="TaskTotals"`)
- The Panel (`well`, 1px `line`, `radius-panel`), padded `space-row-x` (14px), a grid of 3 columns (`columns: 2` for two), `space-heading` (12px) between cells.
- **Label** (`dt`): `description` 11px/1.5 `muted`.
- **Figure** (`dd`): 4px under it, `figure-total` 23px/600/1.3 in the sans face, `ink`, tabular numerals.

**States**
- Default only: the totals read, they never act.

**Component contract**
- **Props:** `SentriTask.totals([{ label, value }], { columns = 3, label })`. `label` and `value` are text slots (`{ text, str, args }`).
- **Port note:** a small figure grid at the head of a commit sheet.

**Don'ts**
- Don't put more than three figures, a unit in the figure, or an action in it. Longer facts (`12 piglets` per litter) are the [Facts](../Facts/README.md) card.

**Strings**
- Host strings; the figure is a `{n}` string.
