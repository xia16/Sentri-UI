# Workbench 工作台

## Problem

A worker opens the app to see the active work in the chosen area, not how the farm is doing. Home must show which tasks are in progress, scheduled, or assigned, let the worker work either by task across units or by place inside one unit, and show what is saved on the phone when there is no signal. The old Figma (首页 › 工作台) says the same: a workbench, not a data page.

## Who

Daily floor workers in a section (Breeding, Gestation, Farrowing, Nursery): gloved, one-handed, often offline. A supervisor can open the same task cards; task completion remains in the owning task flow.

## Anchor

None. Home has no lifecycle of its own; each card inherits the lifecycle of its task. Screens are grouped by scope: section Overview, unit, drawers, task preview, settings.

## Rules

- The Overview is three sections: Production, Health, Other (see "Overview and Schedule · 2026-10-19" below). The unit page is "Today's work": one card per task instance in the unit, until its own redesign. On the unit page an authoritative in-progress task stays in the main list even when its next action is later; rank confirmed exceptions, explicit overdue work, today's work, previously scheduled but unstarted work, assigned undated work, and other in-progress tasks. Equal ranks keep a stable order.
- Home placement follows the authoritative task status. Records and a full progress bar inform the card content but never create a separate "ready to complete" state or closure call to action. Only an authoritative completed or ended-early task enters Closed. Task closure belongs to the owning task detail.
- A unit card has identity (task, batch, context), timing ("Day N of N", contextual, never a completion measure), one task-specific headline fact, at most one supporting line and an optional named progress bar when its denominator is reliable. The Overview uses the four-slot tile instead. Eligible-now counts are never guessed as total minus done.
- Counts are unique animals or litters in the selected scope. A unit narrows the counts, never the batch time.
- Task-specific rules: Farrowing = underway, past expected date, due today, next expected; Piglet processing = litters with care due, next care, waiting; Pregnancy = open windows, then next check; Heat and Return-heat show no completion bar for observation.
- Unit scope: inspection, attention, environment and devices entrances sit at the unit; Inspection owns the pen walk.
- Offline: the app header shows a compact, phone-wide unsent-record badge on Home and other internal pages. It distinguishes waiting, automatic upload and exceptions; an exception opens Data sync for manual handling. A usable connection starts upload automatically. Task pages can show a separately labeled count for that task instance. The record lifecycle and recovery rules belong to [Data sync](../data-sync/PRD.md).
- Closed tasks never revive due counts.
- Tapping the section name in the Home header opens the section chooser with a 260 ms horizontal slide and fade: the chooser enters from the right by about one third of the page width while Home exits left by about one sixth. Back or choosing a section reverses the motion. The bottom navigation stays fixed; reduced-motion preference removes the animation.

### Home list contract · 2026-10-14

- A task instance is identified by farm, source type and task ID; keep the batch and any genuinely separate check instance in its identity. Do not merge different batches or split one cross-unit task into several Overview cards. An authoritative in-progress task belongs in Today's work regardless of whether an action is due now. A scheduled task that has not started belongs there from its start day; an assigned, executable undated task also belongs there. Drafts, unscheduled work and permanent tool entrances do not generate task cards.
- Use farm-local dates. Only an explicit deadline makes a task overdue; passing its start date alone does not. A future, unstarted task is not on Home: it is on the Schedule. An unknown backend state is read-only “Status to confirm”; it produces no due count, overdue marker or end action.
- The unit page sorts confirmed actionable exceptions, explicitly overdue tasks, today's scheduled/action tasks, previously scheduled unstarted tasks, assigned executable undated tasks, then other in-progress tasks. Ties use explicit action time, start time and stable task ID. The Overview orders Production by stage instead (below).
- Every open task instance is listed; neither the Overview nor the unit page folds the list behind "See all". Counts in the section chooser are **distinct open task instances in that section** across Production, Health and Other; the unit picker counts the unit's production task instances until the unit page carries health and other work. Waiting tasks count; task types and unfinished animal rows don't. Complete sorting and counts before pagination; the first fetched page cannot establish the total.
- Closed contains only authoritative completed and ended-early tasks that ended today in the farm timezone. It is collapsed by default, newest first; older receipts live in Records. A full progress bar or all currently due records do not move an open task to Closed. Home has no inferred Ready-to-complete state or completion button.
- A task may have no reliable headline number or denominator. Show an accurate status/next-time line and omit an invented bar. Distinguish loading, empty, no permission and read failure. The detailed local-record/upload-failure/offline-snapshot behavior belongs to Data sync and the Android implementation contract, outside this design handoff.

### Overview and Schedule · 2026-10-19

Owner decisions from the redesign (record: [overview-redesign.md](overview-redesign.md)).

- **Overview = Production, Health, Other**, in that order, with no strip of headline numbers. Each section heading may carry "Schedule ›" (Production, Health), which opens the Schedule filtered to that section.
- **Production** is a 2-column grid of tiles, one per open task instance, every one listed. Order: the sow's cycle (Heat check, Breeding, Return heat, Pregnancy check, Farrowing, Piglet processing, Weaning), then oldest batch first. Overdue is a mark on the tile, never a re-sort.
- **The tile has four fixed slots**, each with one kind of message, at the same height in every tile: (1) the task, one line, a short name of at most about 15 characters ("Return heat", "Processing"); (2) the batch; (3) to-do: the count due now with a short word, then one quiet line with the next timer or due date ("◷ 4 more from Sat"), red when part is overdue ("! 2 overdue"), or "None now" with the next timer; (4) the run: one segment per day of the plan and "Day N of N". There is no done state: a multi-day task stays a tile until the task closes. A task past its planned end says how many are overdue ("6 overdue"), its run grows one red segment per day over and reads "1 day overdue", and the tile takes a red edge. A closed task leaves the grid for one quiet "N closed today" line.
- **Health** is reactive first: one card with **To treat** (pigs marked Treat in place or Hospital pen and not yet treated or moved; "N waiting since yesterday" in red, else its units; "Nothing marked" at 0) and **Monitoring** (pigs marked Monitor, with units). Planned health work (vaccination plans, treatment orders) are tasks, shown as tiles under the card. Walk coverage, withdrawal and deaths are not on Home.
- **Other** is one flat list with no category headers: type icon, what the work is and where ("Move to Farrowing, Unit 6" · "From Units 7, 8"), pigs or pens due on the right. Order numbers stay on the task page. Withdrawal shows in red on the outbound or transfer row it blocks.
- **Schedule** (the week board): full screen; ✕ closes back to Home (owner, 2026-10-19); no page header and no bottom bar. The date range is the only text at the top, the week number a small label, ⓘ "How to read the board" top right. Natural Mon–Sun weeks, paged with ‹ › in a 56px footer, plus "This week" when away from it. A segment filters All, Production, Health, Other; All is one card with a tinted band per section.
- **Rows and cells:** production rows show the batch in a 34px gutter under the task type written once; health and other rows say what they are and where on their own line. A whole row is the tap target and opens that task's week in words with exact numbers. Each cell holds that day's count: done (past days, can be 0), today, planned (exact), estimate ("~6", dashed: heat, returns, farrowing), waiting on today ("–"), nothing due ("·"), past its plan (red edge; the batch label turns red). There is no "late" state and no grace period: unfinished work carries on. Counts up to 999 print in full; actual counts from 1,000 shorten to "1.2k", estimates to "~1k". No daily total.

## Scope

In: section chooser, Overview (Production tiles, Health, Other), the Schedule (week board), unit picker, unit hub, status-driven task cards (in progress, scheduled, closed), the app-header Saved work badge (details belong to Data sync), Toolbox and Records, the unit attention states, task preview, end-early confirmation, closed-task receipt.

Out: Assistant (its own feature), Scan and Find a pig (Find a pig), the Data sync page; task detail pages (their own features); Environment & devices (its own feature). Language and Log out exist in the old design and are not built here (placeholder).

The Assistant, Scan and Toolbox controls are visible prototype navigation to separate sample pages, not part of the Home delivery. A Home-only native preview may open an explicit "UI preview · not connected" explanation for these controls; it must not imply that an agent, camera, search or record action ran. Production navigation waits for the owning feature's design and implementation.

## Decisions

- Decided: one Overview plus unit scope; Assistant has no badge on Home; the last section is remembered; the unit picker has no search (about 15 units at most); completion stays inside the task.
- Decided (2026-10-12; aligned 2026-10-14): remove Home's inferred "ready to complete" state. An in-progress task remains in Today's work regardless of record progress. The [Android Home PRD](../../../Sentri-Android-App/docs/home-prd.md) defines the target card fields and source-data fallback. The Workbench state map and current interactive prototypes now omit the old Ready state; historical review snapshots do not override this decision.
- Open: where language and log out live; what the real "Not designed yet" page shows per task; how the real queue feeds the app-header badge; what "Day N of N" means for tasks with no batch window.
- Open (data): the Home card uses Piglet processing Batch 27 (8 pens, 2 units), while its linked piglet-processing prototype uses Batch 40 (12 pens). These are independent design fixtures; the click-through demonstrates the intended destination, not continuity of one task instance. Align the fixtures before using this flow for connected-data acceptance.
- Open (date): `Sample · Thu, 8 Jul` is a fixed prototype date, not the device clock or a real work schedule. The connected Home date source and formatting still need definition.
