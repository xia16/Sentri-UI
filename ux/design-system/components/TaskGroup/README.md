**Status: candidate.** Extracted from farrowing's room list (`.room-list`, `.pen-card`, `.pen-top`) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)). It is not approved.

# TaskGroup (the grouped list)

The task's list is **grouped by where the animals are**: one card per pen or crate row, a header naming it, then its [rows](../TaskRow/README.md). Never a flat list.

**Anatomy**
- **List** (`.tk-list`): padded `1px space-panel space-gutter`, a column with `space-heading` (12px) between cards.
- **Card** (`.tk-group`, `data-ds="TaskGroup"`): `paper`, 1px `line`, `radius-panel`, a soft `0 2px 8px` shadow, clipped (`overflow: clip`, so the header can stick).
- **Header** (`.tk-group-head`): `surface`, 1px `line` under it, padded `2px space-row-x`; sticky under the lens bar (`--tk-sticky`, default 68px) **only when a lens bar is above the list** (`.tk-lens ~ .tk-list`); on a page or in a sheet the headers scroll with their cards, and the list drops its gutter (the body carries it).
  - **Door** (`.tk-group-door`): the whole header is one button, `touch-min` tall: the pen code in 13px/600 mono `ink`, 5px, the count in `meta` 10px `muted` (`· 2 sows`), 5px, a 12px chevron. It opens the pen's page.
- Rows follow the header, a 1px `line` between rows.

**States**
- Pressed (door): not drawn beyond the focus ring. Focus: the global ring.
- Empty: a group with no rows in the current lens is absent. A lens with no rows at all shows one line in the list's place (the host's).

**Component contract**
- **Props:** `SentriTask.list(groups)`; `SentriTask.group({ title, meta, door: { action, value, label } | null, rows })`.
- **Events:** the door is `<button data-action=door.action data-value=door.value>`. Without `door` the header is plain text.
- **Slots:** `title`, `meta` (text slots); `rows` (HTML from `SentriTask.row`).
- **Port note:** a section list with sticky section headers; each section is a card.

**Don'ts**
- Don't flatten the list, and don't group by status (the lens does that).
- Don't put a second line or a status in the header. The header names a place and counts it.

**Strings**
- Host strings.
