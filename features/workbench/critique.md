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
- A continuing cell now has no border on its open side, so the run reads as going on past the week and the arrow stands clear.
- **Better because** the first screen answers "what's on and how far along" for every task at once, in the same place on each tile.

## Schedule fixes (2026-10-20)

Scope: the Schedule's day header and its "How to read the board" drawer, plus WeekBoard's own atlas pages. A blind gate judge flagged these when the pages entered the gate's reach (ledger L23). The rest of the Schedule keeps its design.

Keep: the board's layout, cells and colours; today as the one ringed date and the one filled cell; the key's seven rows and their order.

- **minor** · Today's day label ("Thu") sat about 5px above the other labels and almost touched its ring: the ringed date is 28px tall and the others 18px, and each column centred its own pair.
- **minor** · The board marks a run that continues into the next or last week with an open edge and an arrow, but the key never said what the arrow means.
- **minor** · A run that continues into the next or last week is meant to end in an open edge with an arrow (README, Cell), but the cell kept its border on that side, so the arrow sat on the line ("~4▸").
- **minor** · WeekBoard's atlas pages capped the board at 348px, so it sat flush left with a dead gutter; the Past its plan specimen showed a red "0" the Schedule never draws.

#### Final look (the gate's pairs at 390 and 360, EN and ZH)
- Every date sits in the same 28px box, 2px under its label, so all seven labels share one line and the ring has room.
- The key gains "Continues · Runs into next week, or from last" as its last row. Its drawer is `long` (85% cap, sized to content), so all eight rows show at 360 without scrolling.
- **Better because** the header reads as one line again, and every mark on the board is in the key.

## Empty sections and the closed line (2026-10-20)

Scope: the Overview's three sections when they hold nothing, and the "closed today" line. The owner asked for both ("we need an empty status … for production too?"; "for the closed today there needs to be a border around it"), was shown two directions and three versions mocked in the live page (review/mockups/), and picked A and version 2.

Keep: the three sections, their headings and Schedule links; the tiles, rows and cards as they are when there is work; the closed line's words, tick and chevron.

- **major** · An empty Production or Other was a bare grey "Nothing open" line floating on the tint, with no surface, so it read as leftover text rather than a state, and it broke the README's "empty is absent" law without replacing it.
- **minor** · Health kept a dead row when nothing was marked ("To treat · Nothing marked", no chevron): a row that looks tappable but leads nowhere, saying a zero.
- **minor** · "1 closed today" had no edge, so on the tint it read as a caption, not a door to the closed tasks.

#### Final look (the gate's pairs at 390 and 360)
- An empty section keeps its place and says so in a white card, one quiet line with a tick ("No production work open", "Nothing else open"); with no marks and no planned health work, Health says "No pigs marked to treat or watch". A zero row is absent.
- The closed line has a hairline edge and no fill, the quietest framed target, so it reads as a tap without competing with the tiles above it.
- **Better because** every section reads as checked and in its usual place, nothing on the page is a dead row, and the closed tasks have a visible door.
