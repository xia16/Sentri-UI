# workbench: headers, information budget

Scope: the headers only (the shared Headers change). Bodies keep their own budgets.

## Inventory

- The page's name, the farm, the section, the unit, a description of the page, the source of a finding.

## Questions

1. Where am I? (the title) 2. How do I get back? (Back, top left)

## Levels

- No header line on any Home page or drawer: the farm, section and unit are scope (on Home itself, one Back away); descriptions are cut.

## Headers (2026-10-13)

The header line of every surface of this feature, decided by the Headers law (`ux/design-system/README.md#headers-law-owner-2026-10-13`, owner 2026-10-13). The default is no line; each kept fact names its question and passes the Back test.

| Surface | Hub or action | Header line | The worker's question it answers there | Back test |
|---|---|---|---|---|
| Every page and drawer of this feature | action or destination off Home | none | | Back reaches Home, which shows the section and unit |

Ambiguous, quieter option taken: The PREVIEW badges (prototype chrome) stay where they were.

Chains walked on the real Back path after this change (crit round 1): no surface here writes to or is about one animal without showing it on screen or one Back away; no line changed.

The Schedule (2026-10-19) has no header line either: the date range is its title and the week number and section are its one small line, because the section is not one Back away there (✕ returns to Home, which shows it).

## Overview body (2026-10-19)

Inventory: per production task its name, batch, phase, Day N of N, count due now, supporting counts, outcome so far, progress label and fraction, scope ("All units"); triage marks, open cases, treatments given, withdrawal, deaths, walks; health and other tasks with order numbers, destinations, pickup times, units; future tasks; tasks closed today; the sample date.

Questions, in order, for a worker opening Home at the start of a shift: 1 Is anything late? 2 What production work is on today, and how far through its run? 3 Who is waiting for care? 4 What else is open, and where? 5 What starts soon? 6 What did we finish?

| Fact | Level | Where |
|---|---|---|
| Overdue part of a task; a task past its plan | Act now | Red part of the count line ("5 now · 2 overdue"); "6 overdue", red run segment |
| Count due now, with a short word | Act now | Tile slot 3 |
| Pigs marked to treat, aging since yesterday | Act now | Health card, To treat (plain line) |
| Next count when nothing is due yet | Coming up | Tile slot 3 in grey ("8 tomorrow"); timers in the task and on the Schedule |
| Day N of N | Live | Tile slot 4 |
| Pigs marked Monitor | Watch | Health card, Monitoring |
| Other work: what, where, how many | Live | Other list row |
| Future tasks | Coming up | The Schedule, not Home |
| Everything recorded, task still open | Act now (quiet) | Tile slot 3: tick "Ready to close" |
| Closed today | Settled | One quiet line under Production |

Cut from the Overview: phase, supporting counts, outcomes, progress labels, "All units · View task" (the Overview is all units; the tile is the tap), order numbers, walks, withdrawal as a Health fact (it shows on the row it blocks), deaths, open cases by disease, the sample date and the headline-number strip.

To treat / Monitoring drawer (2026-10-19): which pig (tag), where (unit as the group, pen), how it is treated ("Hospital", "In place"), how long it waited ("1d"), what it has (condition tag). Cut: colour on every row (the title says what to do), the mark time, who marked it.

How to read the board (2026-10-20): one row per mark a cell can carry, each the cell as drawn, a name and one plain line: Done, Today, Planned, Estimate, Waiting on today, Past its plan, Nothing due, Continues. The question is "what does this cell mean?", so every mark on the board has a row and nothing else does. Continues was added because the arrow had no row.

Empty sections (2026-10-20): the question is "is anything here for me?", so an empty section answers it in one quiet line in its own card, in the section's usual place, and says nothing else: no zero, no count, no next date (the Schedule link on the heading holds what comes later). Cut: the "Nothing marked" row with no chevron (a zero row is absent).

## To treat / Monitoring page (2026-10-20)

The drawer becomes a page (owner, 2026-10-20: "what if we have 100 pigs that need treatment in that list? … we need to make it a list with filters"; then "everything goes inside the filter, search bar at top, flat list"; "scan and search goes hand in hand"; no waiting filter). Real volume: a heavy Gestation day has about 100 pigs to treat across three units, 3–5 in a pen, and about 60 under watch.

Inventory, per pig: tag, unit, pen, care (hospital pen or treat in place), days waiting, condition (one or more), who marked it, when, the walk it came from. Per list: the total, the count per unit, per care, per condition, per wait.

Questions, in order, for a worker opening the list: 1 Which pigs, where (unit, then pen, in walking order)? 2 What does each one have, and is it moved or treated in place? 3 Has any waited since yesterday? 4 Is this pig on the list (the one in front of me)? 5 Only mine: one unit, one care, one condition.

| Fact | Level | Where |
|---|---|---|
| Tag | Live | Row, line 1 (the identity, ink) |
| Unit | Live | Card heading, one per unit (never on the row) |
| Pen | Live | Row, line 2, first; the list runs in pen order |
| Condition | Watch | Row, right, plain tag (no colour: the title says what to do) |
| Care: Hospital / In place | Live | Row, line 2 (To treat only) |
| Days waiting ("1d", "2d") | Act now (quiet) | Row, line 2, last; only when a pig waited since yesterday |
| Find one pig | Live | The search at the top (tag as typed, or a pen code), with Scan ear tag inside the field |
| Narrow the list | Live | The filter: unit, care, condition; the button carries the number applied |
| The total and counts per facet | Settled | The filter's "Show N pigs" and the condition list, not the page |

Cut from the page: a waiting facet (owner: "1d" on the row says it), a dock (scan sits in the search), a lens or chips above the list (the owner put every facet in the filter), the total on the page (the Overview row shows it; the filter's commit shows the narrowed count), who marked it and when (the walk's record holds them), colour on any row, pen cards (marked pigs are 1–5 a pen, so a card per pen spent a header on every one or two rows). Monitoring drops care: a mark to watch has none.

## Saved work on Home (2026-10-21)

| Part | First | Then | Quiet | Cut |
|---|---|---|---|---|
| Header control | That records are on this phone (the icon is there at all) | Signed out: the alert glyph in red | Ink, no number | The pill, its colours, the spinning mark, "Fix", the island |
| Task tile | The task's to-do and run, as before | "↑ N": that task's records still on this phone | Ink-2 on the run line, never red | Nothing else added to the tile |
