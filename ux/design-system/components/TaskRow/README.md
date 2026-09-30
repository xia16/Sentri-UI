**Status: candidate.** Extracted from farrowing's sow row (`.sow-row`, `.sow-identity`, `.state-word`) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)). It is not approved.

# TaskRow (the animal / litter row)

One animal or litter in a [group](../TaskGroup/README.md). **Budget: the mono id with at most one chip under it, one headline, one meta line, one trailing mark.** Nothing else. The row points at the animal's sheet; it never summarises it (retro 30).

**Anatomy** (`.tk-row`, `data-ds="TaskRow"`, a button)
- `animal-row-min` (76px), padded `space-animal-row-y space-row-x` (13 × 14), 10px gaps, aligned centre; a 1px `line` above every row but the first.
- **Identity** (`.tk-row-identity`, `animal-id-col` 59px min): the id in 13px/600 mono, −0.6px (`000418`, `A02`); 7px under it, the **chip**.
- **Chip** (`.tk-chip`): `meta` 10px/600, padded `3px 6px`, `radius-chip`, 1px border, one line, `row-chip-max` wide at most. Tones:
  - `green` (in progress: `Active`): `green` on `green-wash`, `chip-green-border`.
  - none (done: `Done`): `muted` on `well`, `line`.
  - `red` (a terminal fact: `Sow died`): `red` on `red-wash`, `chip-red-border`.
  - `amber` (waiting on the worker): `amber` on `amber-wash`, `pending-border`.
- **Detail** (`.tk-row-detail`), 5px between its lines:
  - **Headline:** 14px/500/1.45 `ink`: the figure the task is about (`9 alive · 5 dead`, `12 owed`). `tone: 'forecast'` prints it `muted` (`Due tomorrow`). A part can carry colour (`Overdue · 3 days` with `3 days` red).
  - **Meta:** `meta` 10px/1.6 mono `muted`, tokens separated by `·` (`born 14 · 1h ago · G.H`).
- **Trail:** a 14px `muted` glyph: chevron (opens), edit (done: opens its record), or none.

**States**
- Pressed: `press`. Focus: the global ring. Disabled: never drawn; a row that cannot be acted on is absent or says why in its meta.
- Done: the chip `Done` and the edit trail. Never grey.

**Component contract**
- **Props:** `SentriTask.row({ id, chip: { text, str, args, tone }, headline, tone, meta, trail: 'chevron' | 'edit' | '', action = 'open', value, label })`.
- **Events:** `<button data-action=action data-value=value>`.
- **Slots:** `id` (text slot); `headline` and `meta` take a text slot or a list of parts `[{ text, str, args, tone }, { sep: true }, …]`; `{ sep: true }` is the shared `·` (`ds.sep`), a real text node.
- **Port note:** a pressable row, left column fixed width so every headline starts on one edge.

**Don'ts**
- Don't headline a row with a treatment name. The headline is the figure; what is owed is on the sheet.
- Don't add a third line, a second chip, a status dot on the right, instructions, or who/when on an open row beyond the meta line.
- Don't colour the meta line red. Colour lives on one headline part at most.

**Strings**
- Host strings; `ds.sep` for separators.
