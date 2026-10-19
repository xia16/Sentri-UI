# Workbench Overview and Schedule redesign: decision record

Started 2026-10-18 with the owner. **Status: built in the Home prototype (Overview and Schedule, 2026-10-19); the unit page is next.** The rules are in [PRD.md](PRD.md), "Overview and Schedule · 2026-10-19", and the screens in [feature.json](feature.json).

The low-fi boards behind these decisions were local working files (`work/workbench-overview-lofi/` on the owner's machine, not tracked).

Revised while building (owner, 2026-10-19): a task past its plan says "6 overdue" with one red run segment per day over and "1 day overdue"; Other rows say what and where instead of order numbers; in the Schedule a whole row is the tap target and opens that task's week (day columns are too narrow for a 48px target).

## Why

The Overview showed the same full cards as the Unit page, so it was a second Unit page rather than an overview. Its "Coming up" list repeated the cards. Zhaoxu's compact category list (`codex/workbench-connected-home`) folded production, which is the most important work.

## Decided by the owner

**Home Overview**
- Three sections: **Production**, **Health**, **Other**. The Unit page keeps the full task cards.
- There's no strip of headline numbers at the top.
- **Production** is a 2-column grid of tiles, with one tile per open task instance and every one listed (no "see all").
- **Upcoming work is not on Home.** It lives on the Schedule.
- A multi-day task stays a tile until the task closes.
- **Production tile: four fixed slots.** Every tile has the same rows in the same place:
  1. Task name: one line, at most about 15 characters (for example "Return heat").
  2. "Batch NN".
  3. To-do: the count due now, then a quiet line with the next timer ("◷ 8 at 15:00", "◷ 4 due today"), or red "! N overdue". Revised 2026-10-19 (owner): no second line; one count line carries it ("5 now · 2 overdue", "8 tomorrow", "✓ Ready to close"), timers live in the task and on the Schedule.
  4. Progress: day segments and "Day N of N".
- The tile has no "today done" state. Outcomes are on the task page, not the tile.
- **Health** is reactive:
  - One card with two rows: **To treat** (pigs marked Treat in place or Hospital pen, with "N waiting since yesterday" in red) and **Monitoring** (pigs marked Monitor).
  - There's no walk coverage, withdrawal or deaths line.
  - Vaccination plans and treatment orders from the office are four-slot tiles under the card.
- **Other** is one flat list with no category headers:
  - Each row is "Type · ID" with its own type icon, a context line underneath, and the pigs or pens due on the right.
  - Withdrawal shows in red on the outbound or transfer row it blocks.
- Production and Health each have a "Schedule ›" link.

**Schedule (week board)**
- Opens full screen with ✕. There's no page header and no bottom bar.
- The date range is the only text at the top, with the week number as a small label.
- Natural Mon–Sun weeks. ‹ › paging sits in a 56px footer.
- One row per task instance, with a cell for each day it runs. Each cell holds that day's count.
- There's no daily total row.
- Day headers read Mon–Sun, because single letters made T/T and S/S look alike.
- The batch gutter is 34px. Order IDs drop their type prefix under the type heading ("#241").
- Counts up to 999 print in full. 1,000 and above shorten to "1.2k", with the exact number in the day drawer.

## Proposed, waiting on the owner

- **Production order:** stage order (cycle order, then oldest batch first). Overdue is a mark on the tile; it never moves the tile up.
- **Schedule rows (V4):** the type is written once as a heading, each batch is one 44px line with the batch in a left gutter, and lines appear only between types.
- **All sections (A1):** each Home section's link opens the board filtered to that section, and "All" is the first filter option.
- **One Schedule page:** shared by every section, filtered by section.
- **Cell states** (revised 2026-10-19, after owner review):

  | State | Look | Meaning |
  | --- | --- | --- |
  | done | count, light fill, no tick | how many were recorded on a past day; can be 0 |
  | today | filled count | due today |
  | planned | outlined count | exact count already known |
  | estimate | dashed outline, "~6" | forecast: heat, returns, farrowing |
  | waiting on today | outlined "–" | the count is known only after today's results |
  | past its plan | red edge (today: red count) | the day is after the planned end; the batch label turns red |
  | nothing due | "·" | the task runs but nothing is due that day |
  | continues | edge arrow | the run crosses the week boundary |

  - There's no "late" state and no grace period. Unfinished work carries on until done, and each past day shows what was done.
  - Estimates of 1,000 or more round to whole thousands ("~1k").
  - An **ⓘ** button (top right, labelled "How to read the board") opens a drawer that explains each cell. It opens by itself on first use. The owner found "Key" too abrupt (2026-10-19).
- **All view: one card, one tinted band per section** (owner chose B, 2026-10-19). The band carries the section icon and name, and the today band and columns run unbroken through all sections. The band uses the app tint (`app-background`) with only a top rule, softened at the owner's request.
- **Carded board kept** (2026-10-19). An edge-to-edge version (wider 44px columns, no card) was explored and not taken.
- **The Schedule is settled at low-fi** (2026-10-19). Next: back to the Home page.
- The placeholder box in front of each task type is removed; type headings are text only.

- **Unit page (round 1, 2026-10-19).** Full task cards, using the same three sections and stage order as the Overview. Recommended **U2**:
  - The card follows the tile's order at full width: name · batch with the day top right (red "Past plan · day N" when over), then the count due now with the next timer or red overdue, then a completion bar ("2/6 checked"), then **which pens** ("In pens B2 1 · B4 1").
  - The hub shrinks to 2 rows: Inspect unit with Feed and Maintenance, then Environment. The "Health" hub chip, "Next" and "Coming up" are cut.
  - Alternatives: U1 (current card, tidied) and U3 (compact rows).

## Open

- **Treatment courses.** Without them there's no "2nd dose due".
- **Forecasts.** A heat forecast after weaning needs a farm-level curve.
- **Batches in "All".** Fold them, or not?
- **Copy check.** "Waiting since yesterday" as the trigger for red.
