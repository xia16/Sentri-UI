# piglet-processing: animal lists, critique

Scope: the rows of the pen list, End task's not-done list and the tagged piglets list (the current app, `ux/tasks/piglet-processing/simple/`). The older full-task pages are left as they are (owner, 2026-10-20).

## Keep

- The pen card. The pen leads as the card's header (`A02 · 1 sow ›`), and its door opens the pen sheet.
- The sow's tag as each row's identity: mono, ink, first on the left.
- The order of the list, the To do / Done lens, the job chips and the summary card above it, unchanged.
- The breeding flag on a tagged piglet as its own 48px target, ticked in green when kept.
- End task's progress card, its Not done group and the hold-to-end footer, unchanged.

## Problems

- **major** · The headline listed every job owed (`Iron · Dock tail · Castrate · Coccidiosis · Tag`), wrapping to two lines at 390. Every row had the same weight, so nothing led.
- **major** · Late sat as a chip under the ID. The Animal row ruling (owner, 2026-10-11) puts the state on the right as one red word with the "!" and no chips.
- **minor** · The mono meta line mixed the litter, the age and the last record (`12 piglets · day 5 · 07:33 · G.H`). History sat on rows that ask for action.
- **minor** · End task repeated `due today` on every pen; ended lists would have repeated `Task ended` on every row.
- **minor** · The tagged piglets put sex and weight in the headline and a mono line under it, so the piglet's tag was the only thing that read.

## Parts

| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| Sow row in a pen card | SentriTask.row (classic) | Row · Animal (state) | **fix** |
| End task not-done row | SentriTask.row (classic, still) | Row · Animal (state), no action | **fix** |
| Tagged piglet row | SentriTask.row (classic) + flag | Row · Animal (state) + the flag IconButton | **fix** |
| Pen card header | TaskGroup | TaskGroup | keep |

## Self-crit

The house pattern is the Farrowing room's sow row: the tag and context on the left, figure over state on the right. The only real choice was what the figure says when a pen owes several jobs.
- **Option A:** every job name. This is the original problem: it wraps, and a figure never wraps.
- **Option B:** a count (`4 to do`). It says nothing about what to bring.
- **Option C (chosen):** the next job in the day's order plus the count of the rest (`Castrate +2`). It names what to pick up first, stays on one line in EN and ZH at 360, and the chips above still name every job.

#### Round 1 (renders at 390/360, EN and ZH)
- Every To do figure was bold (live), so no row led. Due today is now regular ink (`soon`), as the ruling has for "coming up today", and Late alone is red.
- After the end, every row read `Task ended` under the figure, said once already on the card. It is cut.
- On a tagged piglet a chevron sat against the breeding flag. It is cut; the row is still the door to fix the piglet.
