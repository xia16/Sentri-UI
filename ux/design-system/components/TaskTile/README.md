# TaskTile

One open task instance as a tile on Home's Overview, so a worker sees what is due now and how far the task has run, and a row of tiles scans line by line. Use the [Home task card](../../../research/home/HOME-TASK-CARD-COMPONENT.md) instead on the unit page, where the worker needs pens and recorded totals; use [Row](../Row/README.md) · navigation for work that is a list item (Other work, the Health marks).

`SentriUI.taskTile({ id, title, sub, todo, days, late, entry })` draws one tile as one button. The host lays tiles in a 2-column grid (10px gap).

Classification: **component** (a new job: the Overview needs every open task at a glance, which the full task card is too tall for). One variant, the tile. Designed with the owner from low-fi rounds, 2026-10-18/19 ([decision record](../../../../features/workbench/overview-redesign.md)).

## When to use / when not

**Use it when**
- a screen shows every open task of a scope at once and each needs its count due now and its run (Home's Overview: production and planned health work).

**Do not use it when**
- the worker is in one place and needs where and how much was recorded: the unit page's task card;
- the item has no run of days (an outbound pickup, a transfer): Row · navigation;
- the screen shows one task: the task's own page.

## Anatomy

Four fixed slots, each with one kind of message, at the same height in every tile:

1. **Task**: 16px / 500 (15px at 370px and below, where the tile also pads 12px), one line, a short name of at most about 15 characters ("Return heat", "Processing"); ellipsis is only a guard.
2. **Batch**: 13px muted, one line ("Batch 31"; for health work what and where: "PRRS · Units 7, 8").
3. **To-do**: one line that says it all (owner, 2026-10-19: no second line under it). The count due now in 26px mono with a 13px word ("10 to watch"); when part is overdue, the overdue part follows on the same line and only it is red ("5 now · 2 overdue"). When nothing is due yet, the next count in grey ("8 tomorrow"), or "None now". When everything is recorded, a tick and "Ready to close" (16px / 500, ink-2). Timers and later windows ("4 more from Sat") live in the task and on the Schedule, not the tile.
4. **Run**: a hairline, then one 6px segment per planned day (filled up to today) and "Day N of N". A task past its planned end adds one red segment per day over and reads "1 day overdue"; its to-do says how many are overdue ("6 overdue"). The red segment is the only colour on that tile.

White on the tinted page, 1px `line` border, `radius-panel`, 14px padding. **One coloured signal at most** (owner, 2026-10-19): red only on the overdue part or the days over; no red edge, no red words beside it.

## Variants

- [Tile](variants/tile.html): the one variant.

## States

| State | Looks |
|---|---|
| Due now | Count and word. |
| Overdue part | "5 now · 2 overdue": the overdue part is the only red. |
| Nothing due now | The next count in grey ("8 tomorrow"), or "None now". No done state: a multi-day task stays until it closes. |
| Past its plan | "6 overdue"; a red run segment per day over (the only colour); "1 day overdue". |
| Ready to close | Everything recorded, task still open: a tick and "Ready to close" in the count line, the run full. A reminder only: closing stays inside the task. |
| Last day | "Day 3 of 3 · last day". |
| Pressed | One step deeper (`press`). |
| Long label / Chinese | Name and batch end in an ellipsis; the count never wraps; the Chinese task name fits one line. |

No designed focus or hover (touch only). The whole tile is one target (at least 140px tall, half the content width).

## API

`SentriUI.taskTile({ id, title, sub, todo: { value, label, tone, also: { text, tone } } | { next: { value, label } } | { done } | { none }, days: { day, total, over, text }, late, entry, action })`. `tone: 'act'` marks overdue (on `todo` for a task past its plan, on `also` for an overdue part). `id` is written as `data-card` for the host's routing; `entry` as `data-entry` for the atlas. The accessible name reads every slot in order.

## Copy

Task names at most about 15 English characters or 6 Chinese characters; to-do words one or two words ("ready now", "to watch", "due now"); with an overdue part the word shortens to "now" so the line fits at 360 ("5 now · 2 overdue"). Longer copy is rewritten, never shrunk.

## Do / Don't

Do keep every slot in its place, even empty. Don't add a done state, a second line under the count, a phase line or "All units". Don't use colour except red for overdue.

## Changelog

2026-10-19: built from the Overview redesign (owner rounds 2026-10-18/19).
2026-10-19: the quiet line under the count is gone (owner): the count line carries the overdue part, the next count and Ready to close; the tile is 26px shorter. `next` removed from the API.
