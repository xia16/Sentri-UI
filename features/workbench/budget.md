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
| Overdue part of a task; a task past its plan | Act now | Red quiet line on the tile; "6 overdue", red run segment |
| Count due now, with a short word | Act now | Tile slot 3 |
| Pigs marked to treat, aging since yesterday | Act now | Health card, To treat (plain line) |
| Next timer or due date | Coming up | Tile slot 3, quiet line |
| Day N of N | Live | Tile slot 4 |
| Pigs marked Monitor | Watch | Health card, Monitoring |
| Other work: what, where, how many | Live | Other list row |
| Future tasks | Coming up | The Schedule, not Home |
| Everything recorded, task still open | Act now (quiet) | Tile: "All recorded", tick "Ready to close" |
| Closed today | Settled | One quiet line under Production |

Cut from the Overview: phase, supporting counts, outcomes, progress labels, "All units · View task" (the Overview is all units; the tile is the tap), order numbers, walks, withdrawal as a Health fact (it shows on the row it blocks), deaths, open cases by disease, the sample date and the headline-number strip.
