# inspection: headers, information budget

Scope: the headers only (the shared Headers change). Bodies keep their own budgets.

## Inventory

- The task, the last check-in (time, hand), the unit, counts of pigs and pens, pen codes, the walk's recorder.

## Questions

1. Which unit am I walking? (the body's first row) 2. Can I trust the list (last check-in)? 3. What needs me? (the lens)

## Levels

- Header line: the unit, the walk's subject (settled). The last check-in is the body's first row, with Log and End walk as quiet text actions: the activity row the walk already had, now holding its two walk actions, with no second dark fill. Counts, pens and the unit are cut from every drawer: the selection bar and the list say them.

## Headers (2026-10-13)

The header line of every surface of this feature, decided by the Headers law (`ux/design-system/README.md#headers-law-owner-2026-10-13`, owner 2026-10-13). The default is no line; each kept fact names its question and passes the Back test.

| Surface | Hub or action | Header line | The worker's question it answers there | Back test |
|---|---|---|---|---|
| Walk (task page) | hub | fact: `Unit 7`, the walk's subject | Which unit am I walking? (the first question; the unit card is not on this page) | Back reaches Today, which spans units |
| Walk, the row under the header | body | `Last check-in 06:40 · G. Hansen`, then Log and End walk as quiet text actions (crit round 2) | Can I trust this list (who checked in last)? Where do I read or end this walk? | |
| Pen sheet (title `Pen C1`), Pen log, Pen note, Filter pigs, Go to pen, Find or scan, Selected, This walk, End walk, Walk recorded | action | none | | Back reaches the walk, or the pen sheet that names the pen |
| More actions for one pig, and the pig's surfaces | see `features/pig-profile/budget.md` | route on the hubs her forms come back to | | walked on the real chain (crit round 1) |

Crit round 2: the first design (unit as a grey label beside Log and a dark End walk in a new row) read as a stray label and a floating button; the unit is the header line and End walk is a quiet text action in the check-in row.

Chains walked on the real Back path after this change (crit round 1): no surface here writes to or is about one animal without showing it on screen or one Back away; no line changed.

## Check in again (2026-10-14)

| Fact | Level | Question it answers | Change |
|---|---|---|---|
| `Check in again` (EN) / `再次签到` (ZH), the check-in row's action once the unit is checked in | action, quiet text | Can I record another check-in for this unit? | kept; Chinese copy added, nothing else drawn |
| `Check in to Unit 7` / `7单元签到`, the End walk sheet's primary | Act now (the primary) | What does this tap record, and for which unit? | kept; Chinese copy added |

### Corner actions and titles (2026-10-14)

By the Headers law → Corner actions and Title length (`ux/design-system/README.md`, owner ruling C, 2026-10-14; PR #165). Room at a true 360, as `scripts/check-headers.mjs` (workflow/header-checks) measures it: a drawer title has 360 − 2 × (18 + 48 + 12) = 204px (a missing corner counts as the room it would take); a page title has 216px beside Back. Titles measured at their own face (sheet 500 20px, page 500 22px), EN and ZH.

| Surface | Corner action (top right) | Present while | Title | Fits at 360 (EN · ZH) |
|---|---|---|---|---|
| Filter pigs | Reset | a facet is off its default | unchanged | 89px |
| Selected | Clear | always (an empty selection closes) | unchanged | 84px |
| Report fault (choose one pen) | none | | **`Report fault`** (was `Report equipment fault`, 213px): the pen sheet's own row and Farrowing's drawer already call it a fault; `equipment` is what every fault is here | 108px |

## Pen page (2026-10-19)

Owner ruling, 2026-10-19: the pen is a door, not a tick. The pen header's `›` opens the pen page, and everything done to the pen as a whole happens there, for that one pen. Ticking pigs gives pig actions only. No multi-pen actions (`feed-plan.bulk` is already an earlier design, 2026-10-18). `Tick all` on the pen page ticks the pen's pigs for the pig Actions.

| Fact | Level | Question it answers | Change |
|---|---|---|---|
| `Pen C1`, line `3 pigs · Unit 7` | header | Which pen, how many pigs? | kept |
| Pen verbs: Note, Feed, Observe, Fault, Tick all | Act now (one grid, Row tile) | What can I do to this pen? | verbs move to the top; their explanatory second lines are cut |
| Open equipment fault (`Drinker · leaking`, its description) | Needs someone | Is something broken here? | new on this page (today one tap away, in the pen's fault list) |
| Pen note (its text, who and when) | Needs someone | What did the last person leave me? | kept, now a row in the same group as the faults |
| Feed today (`7.6 kg`, the formula) | Now | What does this pen eat today? | new on the page (was the second line of Feed guidance) |
| Pigs (`3`, `2 without tags`) | Now | How many are here, tagged or not? | new on the page |
| Looked (`Huddling`) | Now | How did the pen look last? | new on the page (was the second line of How the pen looks); left out when nothing is recorded |
| Pen log: the last three entries, then `All activity ›` | What happened | What has happened here lately? | new on the page (was one tap away) |

Cut: the `Pen information` heading; the verb rows' second lines; the pen header's checkbox on the walk (it ticked the pen and its pigs; `Tick all` does that from the pen page). Count (`Set count`) is not a verb Inspection has today, so it is not drawn.
