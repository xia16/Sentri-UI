**Status: candidate.** Extracted from farrowing's sow row (`.sow-row`, `.sow-identity`, `.state-word`) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)). It is not approved.

# TaskRow (the animal / litter row)

One animal or litter in a [group](../TaskGroup/README.md). **Budget: the mono id with at most one chip under it, one headline, one meta line, one trailing mark.** Nothing else. The row points at the animal's sheet; it never summarises it (retro 30).

**Anatomy** (`.tk-row`, `data-ds="TaskRow"`, a button; a `<label>` with the tick trail; a `<div>` when `still`)
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
- **Parts wrap whole:** every part of the headline and meta (each `{ text, str, args, tone }`, and the `·` between them) is an inline block, so a line that wraps breaks between parts and a wrapped part never lies under the next one.
- **Trail:** a 14px `muted` glyph: chevron (opens), edit (done: opens its record), or none.
  - **Tick** (`trail: 'tick'`): the selection of a bulk act. The row is a `<label>` around ChoiceList's multi trail (`.tk-row-tick.st-choice-trail`, a 20px checkbox in `ink`); the whole row is the target. The checkbox carries `data-action` (default `toggle`) and `value`; the host listens for `change`.

**States**
- Pressed: `press`. Focus: the global ring. Disabled: never drawn; a row that cannot be acted on is absent or says why in its meta.
- Done: the chip `Done` and the edit trail. Never grey.

**Door variant (no id column)** — farrowing's `.disclosure`: `SentriTask.door({ title, description, action, value, label, trail: 'chevron' | 'edit' | '' })` (`.tk-door`, `data-ds="TaskRow"`, `data-variant="door"`). A non-animal door inside a sheet or a page: at least 62px, padded 15px 0, a 1px `line` under it; the title 13px/600, one description line 10px/1.7 `muted` 5px under it; a 16px chevron.

**Doors as a list** — `SentriTask.doors({ card, title, icon, items: [{ title, description, icon, action, value, label }], label })`. `card: false` (default): flat door rows (`door`). `card: true`: farrowing's Pen page / sow-actions list — an optional section title with its icon, then one card of the design system's Rows, each with a 34px tinted icon tile, a title (13px/500), one description line (11px `muted`) and a chevron.

**The id column holds its width** (`animal-id-col`): a chip wider than it ellipses under the id, so every headline in a group starts on one edge.

**Component contract**
- **Props:** `SentriTask.row({ id, chip: { text, str, args, tone }, headline, tone, meta, trail: 'chevron' | 'edit' | 'tick' | '', action = 'open', value, label, tick: { action = 'toggle', value = value, checked, label }, still, data })`. `still: true` draws a row with no action (a `<div>`: a row holding its place after a record). `data: { flash: '' }` adds `data-flash` (and the like) for the host's motion.
- **Events:** `<button data-action=action data-value=value>`.
- **Slots:** `id` (text slot); `headline` and `meta` take a text slot or a list of parts `[{ text, str, args, tone }, { sep: true }, …]`; `{ sep: true }` is the shared `·` (`ds.sep`), a real text node.
- **Port note:** a pressable row, left column fixed width so every headline starts on one edge.

**Don'ts**
- Don't headline a row with a treatment name. The headline is the figure; what is owed is on the sheet.
- Don't add a third line, a second chip, a status dot on the right, instructions, or who/when on an open row beyond the meta line.
- Don't colour the meta line red. Colour lives on one headline part at most.

**Strings**
- Host strings; `ds.sep` for separators.
