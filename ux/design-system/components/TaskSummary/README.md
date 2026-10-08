**Status: candidate.** Extracted from farrowing's task context card (`.task-context-card` in `.overview-host`) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)). It is not approved.

# TaskSummary

The one card under the last-record line: **left, this unit's figure; right, the whole task's progress**, which opens the task overview.

**Anatomy** (`.tk-summary`, `data-ds="TaskSummary"`)
- A two-column grid (`1fr` | `1.12fr`), margin `0 space-panel 10px`, `paper`, 1px `line`, `radius-panel`, `shadow-card`, clipped.
- **Each half** padded `space-heading space-card-x` (12 × 15), a column:
  - **Heading:** `description` 11px/500 `muted`, 19px tall, a 14px glyph 6px before it.
  - **Value:** 5px below, 35px tall; the figure in `figure-card` (31px/600 mono, −1.4px, tabular).
  - **Description:** 2px below, 11px/500 `ink-2`.
  - **Support:** 6px below, `meta` 10px/1.6 `muted` (`amber` with `supportTone: 'amber'`, e.g. under target).
- **The task half** is a button (the whole half). A 1px `line` divider on its left, inset 14px top and bottom. The heading ends in a chevron. The value adds `/ n` in `figure-denominator` (15px mono `muted`); the description adds a `muted` 10px scope (`· all units`).
- **Progress bar:** 5px, 10px under the description, 1px gaps, 6px radius, on `line`. Segments: `done` in `current-marker`, `active` in `progress-active`, `rest` in `handle`. Its support line sits 7px under it.

- **No clip:** the card does not clip its halves (a clip read as hiding the task half's last pixel on a room too short to scroll); the task half keeps the card's right corners with its own `radius-panel`, so its pressed wash stays inside.

**States**
- Pressed (task half): `green-wash`. Focus: the global ring. Disabled: not drawn.
- Empty: a half with no figure prints the heading and `—`; the card is never absent from a task's first screen.

**Component contract**
- **Props:** `SentriTask.summary({ unit: { icon, heading, value, description, support, supportTone, label }, task: { icon, heading, count, of, description, scope, segments: [{ tone, share }], max, now, barLabel, support, action, value, label } })`.
- **Events:** the task half is `<button data-action=task.action (default "task-overview")>`.
- **Slots:** every text is a text slot. `segments[].share` is a percentage.
- **Ids:** none. The bar is `role="progressbar"` with `aria-valuemin/max/now`.
- **Port note:** two equal-height cells; the right one is one pressable.

**Don'ts**
- Don't add a third half or a second card. What the unit owes today is the unit figure; everything else is on the overview.
- Don't colour the figures. Colour is on the support line only (`amber` for a figure off target).

**Strings**
- All host strings. The bar's `aria-label` takes a label slot (`barLabel`).
