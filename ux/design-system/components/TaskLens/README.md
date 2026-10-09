**Status: candidate.** Extracted from farrowing's room lens bar (`.room-controls`, `.room-tabs`, `.room-filter-button`) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)). It is not approved.

# TaskLens

The lens tabs over the grouped list, **each with its count under the label**, and the filter button at the end. The bar sticks to the top of the scroller.

**Anatomy** (`.tk-lens`, `data-ds="TaskLens"`)
- Sticky at `top: 0`, `app-background`, padded `6px 0 9px` with a 1px transparent bottom edge (68px in all).
- **Bar:** margin `0 space-panel`, 7px gap.
- **Tabs** (`.tk-lens-tabs`): `well` track, 1px `line`, `radius-segment`, 3px padding, 1px gaps. Each tab is `tap-min` tall, `radius-tab` (7px), a column: the label in `description` 11px `muted`, 3px above the count in `meta` 10px/500 mono `muted`.
- **Pressed tab** (`aria-pressed="true"`): `paper`, label 500 `ink`, shadow `0 1px 3px`.
- **Filter** (`.tk-lens-filter`): `control-height` square (48px), `paper`, 1px `line`, `radius-control`, the filter glyph at 17px.

**States**
- Pressed: the pressed tab as above. Focus: the global ring. Disabled: never; a lens with nothing in it shows `0`.
- A filter in force is the host's to show (a count badge on the filter is not drawn yet; see ADR 0003, open questions).

**Component contract**
- **Props:** `SentriTask.lens({ tabs: [{ text, count, value, pressed, label }], action = 'lens', filter: { action, value, label } })`. `tabs.label` names the group.
- **Events:** a tab is `<button data-action=action data-value=tab.value aria-pressed>`; the host sets `aria-pressed` and re-renders the list.
- **Slots:** `text` and `count` are text slots; `label` is the tab's aria-label (say the count in words: `Awaiting, 4 sows`).
- **Port note:** a segmented control whose segments are two lines; it pins to the top of the list when scrolled.

**Don'ts**
- Don't put the count beside the label (`Owed 15`). It sits under it.
- Don't put more than four lenses. `All` is last.

**Strings**
- Host strings.
