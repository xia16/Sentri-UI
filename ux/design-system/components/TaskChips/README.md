**Status: candidate.** New for the simple piglet-processing prototype (`ux/tasks/piglet-processing/simple/`); farrowing has no chips, so the part is built from farrowing's segment faces (TaskLens) under the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md), *Chips round*). It is not approved.

# TaskChips

One row of filter chips over a task list: `All · Iron 4 · Castrate 6 · Tag 5 · Done 3`. A chip names one job due today and how many places need it; choosing it filters the list to them. One chip is chosen at a time. It replaces the lens tabs on a list that filters by job (the two are not used together).

**Anatomy** (`.tk-chips`, `data-ds="TaskChips"`)
- **Row:** `app-background`, padded `6px 0 9px`. The track (`.tk-chips-track`) scrolls sideways with no scrollbar, starts at `space-gutter`, `space-key-gap` (8px) between chips.
- **End of the row:** a trailing spacer `space-gutter` wide and a `space-gutter` fade on the right edge. Scrolled to the end, the last chip sits clear of the fade: never cut, never under the edge. While more chips are to the right, the fade says so.
- **Chip** (`.tk-chips-chip`): `tap-min` (48px) tall, `space-row-x` side padding, `well`, 1px `line`, `radius-segment` (10px). The label in `row-title` 13px `tab-ink`; the count after it, `space-key-gap` apart, in `meta` 10px/500 mono `muted`.
- **Chosen chip** (`aria-checked="true"`): farrowing's pressed segment — `paper`, label 500 `ink`, shadow `0 1px 3px`.

**States**
- Chosen: as above. Pressed: `press`. Focus: the global ring. A chip with nothing in it is not drawn, except the chosen one (it stays until another is chosen, so the list under it does not lose its filter).
- Disabled: never.

**Component contract**
- **Props:** `SentriTask.chips({ items: [{ value, label, count, checked, aria }], action = 'chip', key = 'chips', label })`. `label` names the group (`Show pens that need`). Exactly one item is checked (the first when none is).
- **Events:** each chip is `<button role="radio" aria-checked data-action=action data-value=item.value>`; the host re-renders with the new `checked`. Keyboard: one tab stop (the chosen chip); wire the arrow keys, Home and End with `SentriUI.radioBind(scope, { onChange(field, value) })` — `field` is `key`.
- **Slots:** `label` and `count` are text slots (`{ text, str, args }` for the registry); `aria` is the chip's aria-label (say the count in words: `Iron, 4 pens`).
- **Port note:** a single-choice chip group (iOS: a scrolling segmented filter; Android: `ChipGroup` with `singleSelection`).

**Don'ts**
- Don't use chips and lens tabs on the same list.
- Don't put the count under the label or in a badge: it sits inside the chip, after the label, in mono.
- Don't wrap the row onto two lines; it scrolls.

**Strings**
- Host strings (the prototype's `sp.chips.*`, `sp.tr.*`, `sp.fig`).
