**Status: candidate.** Extracted from farrowing's room (`.task-header`, `.room-intro .room-latest`) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)). It is not approved.

# TaskHeader (and the last-record line)

The top of a task: **back + the task's name**, then **the last-record line** as the first thing in the scroller. The title is the task (`Farrowing`, `Piglet processing`), never the unit: the unit lives on the [summary card](../TaskSummary/README.md).

**Anatomy — header** (`.tk-header`, `data-ds="TaskHeader"`)
- A row, `min-height` 60px, padded `4px space-gutter 10px`, `space-heading` (12px) gap, `app-background`, outside the scroller (it never scrolls).
- **Back** (`.tk-header-back`): `tap-min` square (48px), `paper`, 1px `line`, `radius-control`; the chevron-left glyph at 18px. It leaves the task (to Today).
- **Title** (`.tk-header-title`, `h1`): `page-title` 22px/500, line-height 1.25, −0.6px tracking, `ink`.

**Anatomy — last record** (`.tk-latest`, `data-ds="TaskLatest"`)
- `tap-min` tall, text centred, padded `0 space-gutter 8px`, `description` 11px/1.5 `muted`: `Last record` **`08:41`** `· G. Hansen`. The time is 500 `ink`.

**States**
- Default only. Pressed and disabled are not drawn.
- Empty: with no record yet the line is absent (the empty slot stays empty).

**Component contract**
- **Props:** `SentriTask.header({ title, back: { action, value } | false, backLabel })`; `SentriTask.latest({ lead, value, rest })`.
- **Events:** Back is `<button data-action=back.action data-value=back.value>`; the host navigates.
- **Slots:** text slots `title`, `lead`, `value`, `rest` (a string or `{ text, str, args }`).
- **Ids:** none.
- **Port note:** the header is a fixed app bar; the last-record line is the first list header of the scroll view.

**Don'ts**
- Don't title the page with the unit or the room. Don't add a subtitle under the title: the last-record line is the one line.
- Don't put actions in the header (Other units, Scan). They live on the summary card, the lens bar or the dock.

**Strings**
- Back's label defaults to `act.back`. The rest are the host's.
