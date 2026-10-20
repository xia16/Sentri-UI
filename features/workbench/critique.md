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

## To treat / Monitoring page (2026-10-20)

Scope: the To treat and Monitoring lists the Overview's Health card opens. The Overview itself, its Health rows and every other Home page keep their design.

Keep: today's rows exactly (Row · Animal with tags: tag over "Pen B2 · Hospital · 1d", the condition as a plain tag, no colour); one card per unit under a "Unit 7" heading; pigs in walking order; a pig opens its unit's walk on the Health lens.

- **major** · The list was a medium drawer, so at 100 pigs (a heavy Gestation day) it is a long scroll in a sheet with no way to find one pig or narrow it. Owner, 2026-10-20: "what if we have 100 pigs that need treatment in that list? … we need to make it a list with filters".
- **major** · Nothing found the pig in front of the worker: no search, no scan.
- **minor** · Monitoring opened the same drawer as To treat but had no atlas screen.

| Part | Drawn by | Component | Keep / fix / cut |
|---|---|---|---|
| The list's frame | Sheet drawer | Page header (pageHeader) | **fix** |
| Unit heading + rows | Heading · group, Row · Animal in rowGroup | same | keep |
| Search, with Scan ear tag in it | none | ChoiceList search field (choiceSearch) + IconButton · plain | **new** |
| Filter | none | IconButton (count badge) + FilterSheet: Segment facets, PickerField, ChoiceList | **new** |

Directions shown to the owner (all at 390 in the real prototype): A pen cards under a unit lens (Inspection's walk); B unit cards under a unit lens; C a care lens (Hospital / In place). The owner chose none of the lenses: "everything goes inside the filter i think, search bar at top, flat list". Built: B's list with the search and the filter on top. On the build the owner moved scan into the search ("scan and search goes hand in hand") and cut the Waiting facet.

Also fixed on the way: IconButton's count badge was styled only inside the Inspection and Farrowing phones, so anywhere else (and on IconButton's own Badge page) the number fell under the glyph. The rule is now the component's own.

#### Self-crit
- Problems fixed: the list is a page that holds 104 pigs in the same rows; the search finds a tag or a pen as typed; the filter narrows by unit, care and condition with a live "Show N pigs"; Scan ear tag sits in the search field and fills it.
- Keep as strong: the rows are unchanged pixel for pixel; unit headings and walking order stay.
- Squint (104 pigs): the title, the search field, the first tags. The search leads, as the owner asked; the rows read as before.
- Against the original: one control row added (search with scan, and the filter); nothing added to the rows.
- **Better because** a worker with 100 pigs can find the one in front of them or keep only their unit, where before they could only scroll a drawer.

## Saved work on Home (2026-10-21)

Scope: the header's saved-work control on Home and its other pages, and the Overview tiles of tasks with records still on this phone. Owner ruling 2026-10-18 (PRD of Data sync, PR 235): quiet by default; Home's header shows the icon alone; the tiles carry the counts; red only when signed out.

Keep: the header's section trigger and Assistant door, their order and alignment; every tile's four slots; the control opening Saved work.

- **major** · The control was a yellow pill with a shadow ("↑ 3"), the loudest thing in the header, for a state that needs nothing from the worker; uploading turned it blue with a spinning mark, failure red with "Fix". Colour meant three things, none of them a call to act.
- **major** · Its number counted every record on the phone, while the tasks the records belong to said nothing, so the worker couldn't tell which work was still on the phone.
- **minor** · The island variant (`?indicator=island`) and the per-state classes were study leftovers with no ruling behind them.

| Part | Drawn by | Component | Keep / fix / cut |
|---|---|---|---|
| Saved-work control | page-drawn pill (data-sync-shell.css) | IconButton · bordered (upload; alert in red when signed out) | **fix** |
| Task tile's records | none | TaskTile `saved` ("↑ N" on the run line) | **new** |
| Island variant, state classes | page | none | **cut** |
