**Status: candidate.** Extracted from farrowing's room (`.task-header`, `.room-intro .room-latest`) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)). It is not approved. Since the Headers law (owner, 2026-10-13) it is the page header ([Sheet](../Sheet/README.md), `SentriUI.pageHeader`) on a task's own screen.

# TaskHeader

The top of a task: **Back, the task's name and its optional header line**, then 24px to the body. The title is the task (`Farrowing`, `Piglet processing`), never the unit: the unit lives on the [summary card](../TaskSummary/README.md). It is the same header a sheet page draws ([Headers](../../README.md#headers-law-owner-2026-10-13)).

**Anatomy** (`.st-page-header.tk-header`, `data-ds="TaskHeader"`)
- A row outside the scroller (it never scrolls), padded `space-4 space-gutter space-section`: the 24px under the header is the header's, so the body sets no top padding of its own.
- **Back** (`.st-page-back`): `tap-min` square (48px), `paper`, 1px `line`, `radius-control`; the back chevron at 18px. Every top page of a task has it; it goes where the task came from (Today).
- **Title** (`.st-page-title`, `h1`): `page-title` 22px/500, line-height 1.25, −0.6px tracking, `ink`, left-aligned.
- **Header line** (optional, absent by default; `.st-header-line`): one quiet line under the title, aligned with it, `description` 13px/1.5 `muted`. On a task page it is the fact the next worker needs to trust the screen: `Last record` **`08:41`** `· G.H` (the figure 500 `ink`). It never wraps.

**States**
- Default only. Back's pressed face is `press`.
- Empty: with no record yet the line says so (`No records yet`) or is absent, as the task's budget decides.

**Component contract**
- **Props:** `SentriTask.header({ title, back: { action, value }, backLabel, line })`; `line` is `{ text }` (a text slot or parts, `{ text, strong: true }` for the figure) or a route `{ chip, facts }` (see Sheet).
- **Events:** Back is `<button data-action=back.action data-value=back.value>`; the host navigates.
- **Slots:** text slots `title`, the line's parts (a string or `{ text, str, args }`).
- **Ids:** none.
- **Port note:** the header is a fixed app bar with the line as its subtitle; the 24px is the bar's bottom inset.

**Don'ts**
- Don't title the page with the unit or the room. Don't put counts, dates, scope or status on the line; one fact at most.
- Don't put actions in the header (End task, Scan, a log link). They live on the summary card, the lens bar, the body or the dock.

**Strings**
- Back's label defaults to `act.back`. The rest are the host's.

**Changelog**
- 2026-10-13 (headers): the page header; Back always; `line` replaces TaskLatest (retired), which drew the last-record line as the first row of the scroller.
