# WeekBoard

A week of work on one board: one line per task under its task type, and a cell per day holding that day's count, so a worker or lead sees what runs when, which day is heavy, and what has slipped. Use [TaskTile](../TaskTile/README.md) instead for what is due now, and [Row](../Row/README.md) for a list of days in words (the row drawer the board opens).

`SentriUI.weekBoard({ days, groups, empty })` draws the board; `SentriUI.weekCell(code)` one cell; `SentriUI.weekBoardKey(rows)` the legend rows for the "How to read the board" drawer.

Classification: **component** (a new job: no part draws work across days). One board variant and its key. Designed with the owner from low-fi rounds, 2026-10-19 ([decision record](../../../../features/workbench/overview-redesign.md)); used by Home's Schedule.

## When to use / when not

**Use it when**
- a worker plans a calendar week of tasks that run over several days (the farm's Mon–Sun batch week).

**Do not use it when**
- only today matters: Home's Overview;
- the days need words or exact figures over 999: the row drawer (Row) the board opens;
- the work has no days (a checklist): Row.

## Anatomy

1. **Day header**: Mon…Sun over the date in 15px mono; past dates muted; today ringed in ink. Not a target (a day column is too narrow for 48px).
2. **Section band** (All only): a full-width band on the app tint with the section's icon tile and name (15px / 600), a rule above.
3. **Task type**: 14px / 600 title written once, a 13px muted note on the right, a rule above.
4. **Row** (a 48px button, the whole width): production rows show the batch ("B31", 13px mono) in a 34px gutter; health and other rows say what they are and where on their own line ("PRRS blood · Units 7, 9", 13px / 500). A row past its plan has a red label.
5. **Cell**: 30px tall, 13px / 500 mono, one per day. Done: the count on `well`. Today: paper on `ink-2`. Planned: an `ink-2` outline. Estimate: a dashed outline and "~". Waiting on today: "–" in a `line` outline. Nothing due: "·" on `well`. Past its plan: a red edge (today: red count on `red-wash`). Continues: an open edge with an arrow into next or last week.
6. **Today band**: a `press` column behind the cells of today.

## Variants

- [Board](variants/board.html): the week, Production only and All with bands.
- [Key](variants/key.html): the legend rows.

## States

| State | Looks |
|---|---|
| This week | Past days show what was done; today filled; the rest planned, estimated or waiting. |
| All sections | A band per section in one card. |
| Next week | Rows from last week enter with an open left edge; no today band. |
| Past its plan | A red edge on every day after the planned end; the label turns red. |
| Empty week | "Nothing planned this week". |
| Pressed row | One step deeper (`press`). |
| Long label / Chinese | Row names end in an ellipsis; cells keep 13px; counts up to 999 in full, from 1,000 "1.2k" (estimates "~1k"). |

## API

`weekBoard({ days: [{ label, date, today, past }], groups: [{ band: { icon, label } | null, none, types: [{ title, sub, rows: [{ label, named, late, action, value, aria, cells }] }] }], empty })`. Cell codes: `''` nothing · `n` nothing due · `u` waiting on today · `dN` done · `oN` today · `pN` planned · `eN` estimate · `vN` past its plan, today · `wN` past its plan, a past day; a trailing `>` runs into next week, a leading `<` came from last week. `weekBoardKey([[code, title, line]])`.

## Copy

Row names at most about 32 English characters; type notes a few words ("estimated returns", "4 batches").

## Do / Don't

Do keep a row's cells on the day columns. Don't put a daily total under the board, a time in a cell, or a "late" state: unfinished work carries on and each past day shows what was done.

## Changelog

2026-10-19: built for Home's Schedule (owner rounds 2026-10-19).
