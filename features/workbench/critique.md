# workbench: Overview and Schedule, critique

Scope: Home's Overview (every section) and the new Schedule. The unit page, the section chooser and every other Home page keep their design; the unit page gets its own round. The previous critique (the shared Headers change, 2026-10-13) is in git history.

## Keep

- Home's own header (farm, section chooser, Assistant door, saved-work badge) and the Overview / Choose unit switch: unchanged.
- One task instance per item, never merged across batches; counts are unique animals in the scope.
- What needs the worker now outweighs everything else on the screen (the count due now is the one large figure).
- A task's closure stays inside the task: Home has no close button.
- The bottom bar (Home, Scan, Toolbox).

## Problems

The owner's rounds of 2026-10-18/19 named each of these on the live Overview.

- **major** · The Overview repeated the unit page: one tall card per task (155–206px) with phase, Day N of N, a supporting line, a named bar and "All units · View task", so only about 1.5 tasks showed on the first screen. "Overview should not be the exact same information as the unit view."
- **major** · Production, the most important work, sat folded or behind "See all N tasks" (five cards, then a control), and Zhaoxu's compact version folded it into a category.
- **major** · Facts sat in different places on every card (a supporting line on one, none on another, the bar label changing), so a row of cards couldn't be scanned.
- **major** · "Next" and "Coming up" put future, unstarted work on the Overview, repeating what a plan should hold; there was no view of the week ahead.
- **major** · Health was only the office's treatment tasks; nothing showed the pigs marked on the walk (Treat in place, Hospital pen, Monitor). US and EU farms treat reactively.
- **minor** · Other work (transfers, outbound, sampling) had no designed place, and Zhaoxu's version labelled it with order numbers ("#11") that mean nothing on the floor.
- **minor** · A task past its plan had no clear mark; overdue lived in a supporting line.
- **minor** · The "Today's work" header carried a sample date and a count that repeated the list.

## Parts

| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| Overview task card | page-built `astra-home-task-card` | TaskTile (new) | **fix** (the card stays on the unit page) |
| Section headings with "Schedule" | page-built `work-section-heading` | Heading (section, icon, action) | **fix** |
| Health marks, Other work | none | Row · navigation in a row group | **new** |
| Closed tasks | page-built details list | Button · text, quiet (new face) + Sheet drawer | **fix** |
| "See all N tasks", Next, Coming up | page-built | (the Schedule) | **cut** |
| The week ahead | none | WeekBoard (new) | **new** |

## Self-crit

#### Final look (072b913, the gate's pairs at 390 and 360, EN and ZH, base 92e0f0d)
- Reach: 12 screens changed (8 Overview states, 4 whose Overview sits behind a drawer or banner), 6 new (the Schedule, closed today), 1 gone (the expanded list); 393 identical; none broken. npm test 840 pass; legibility, spacing, headers and states pass on every changed screen.
- Problems fixed: every open production task is a tile of the same four slots on the first screen (Gestation shows all three, the busy day six of seven); future work is on the Schedule; Health leads with the marked pigs; Other says what and where.
- Keep as strong: the header and switch are untouched; the count due now is still the one large figure, now in the same place on every tile.
- Squint (Gestation): the section switch, the tiles' large counts, the red "2 overdue".
- Against the original: less, and every fact in a fixed place; no fact the worker acts on was dropped (phase, outcomes and the bar label moved to the task page).
- **Better because** the first screen answers "what's on and how far along" for every task at once, in the same place on each tile.
