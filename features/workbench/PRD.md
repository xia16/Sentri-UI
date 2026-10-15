# Workbench 工作台

## Problem

A worker opens the app to see the active work in the chosen area, not how the farm is doing. Home must show which tasks are in progress, scheduled, or assigned, let the worker work either by task across units or by place inside one unit, and show what is saved on the phone when there is no signal. The old Figma (首页 › 工作台) says the same: a workbench, not a data page.

## Who

Daily floor workers in a section (Breeding, Gestation, Farrowing, Nursery): gloved, one-handed, often offline. A supervisor can open the same task cards; task completion remains in the owning task flow.

## Anchor

None. Home has no lifecycle of its own; each card inherits the lifecycle of its task. Screens are grouped by scope: section Overview, unit, drawers, task preview, settings.

## Rules

- The screen is "Today's work": one card per task instance in the chosen section. An authoritative in-progress task stays in the main list even when its next action is later; upcoming contains only future tasks that have not started. Rank confirmed exceptions, explicit overdue work, today's work, previously scheduled but unstarted work, assigned undated work, and other in-progress tasks. Equal ranks keep a stable order.
- Home placement follows the authoritative task status. Records and a full progress bar inform the card content but never create a separate "ready to complete" state or closure call to action. Only an authoritative completed or ended-early task enters Closed. Task closure belongs to the owning task detail.
- A card has identity (task, batch, context), timing ("Day N of N", contextual, never a completion measure), one task-specific headline fact, at most one supporting line, an optional named progress bar when its denominator is reliable, and in the Overview a footer "Across N units · View task". Eligible-now counts are never guessed as total minus done.
- Counts are unique animals or litters in the selected scope. A unit narrows the counts, never the batch time.
- Task-specific rules: Farrowing = underway, past expected date, due today, next expected; Piglet processing = litters with care due, next care, waiting; Pregnancy = open windows, then next check; Heat and Return-heat show no completion bar for observation.
- Unit scope: inspection, attention, environment and devices entrances sit at the unit; Inspection owns the pen walk.
- Offline: the app header shows a compact, phone-wide unsent-record badge on Home and other internal pages. It distinguishes waiting, automatic upload and exceptions; an exception opens Data sync for manual handling. A usable connection starts upload automatically. Task pages can show a separately labeled count for that task instance. The record lifecycle and recovery rules belong to [Data sync](../data-sync/PRD.md).
- Closed tasks never revive due counts.
- Tapping the section name in the Home header opens the section chooser with a 260 ms horizontal slide and fade: the chooser enters from the right by about one third of the page width while Home exits left by about one sixth. Back or choosing a section reverses the motion. The bottom navigation stays fixed; reduced-motion preference removes the animation.

### Home list contract · 2026-10-14

- A task instance is identified by farm, source type and task ID; keep the batch and any genuinely separate check instance in its identity. Do not merge different batches or split one cross-unit task into several Overview cards. An authoritative in-progress task belongs in Today's work regardless of whether an action is due now. A scheduled task that has not started belongs there from its start day; an assigned, executable undated task also belongs there. Drafts, unscheduled work and permanent tool entrances do not generate task cards.
- Use farm-local dates. Only an explicit deadline makes a task overdue; passing its start date alone does not. A future, unstarted task enters the compact Coming up preview during the next seven farm-calendar days. Show at most three previews by default, ordered by start time then stable task ID, with the true total. An unknown backend state is read-only “Status to confirm”; it produces no due count, overdue marker or end action.
- Today's work sorts confirmed actionable exceptions, explicitly overdue tasks, today's scheduled/action tasks, previously scheduled unstarted tasks, assigned executable undated tasks, then other in-progress tasks. Ties use explicit action time, start time and stable task ID. Do not add a second grouping by task type. A section or unit choice filters first, then applies this ordering.
- Show the first five task-instance cards by default. When more exist, offer “See all N tasks”; if hidden cards include exceptions or overdue work, state their separate counts on the control. The Workbench feature includes separate collapsed and expanded seven-task previews, positioned at the fold so both states are reviewable. Expansion shows the same ordered list; changing scope or leaving Home resets it. Counts in the section chooser and unit picker are **distinct open task instances in that scope**, including waiting tasks, not distinct task types or unfinished animal rows. Complete sorting and counts before pagination; the first fetched page cannot establish the total.
- Closed contains only authoritative completed and ended-early tasks that ended today in the farm timezone. It is collapsed by default, newest first; older receipts live in Records. A full progress bar or all currently due records do not move an open task to Closed. Home has no inferred Ready-to-complete state or completion button.
- A task may have no reliable headline number or denominator. Show an accurate status/next-time line and omit an invented bar. Distinguish loading, empty, no permission and read failure. The detailed local-record/upload-failure/offline-snapshot behavior belongs to Data sync and the Android implementation contract, outside this design handoff.

## Scope

In: section chooser, Overview, unit picker, unit hub, status-driven task cards (in progress, scheduled, closed), the app-header Saved work badge (details belong to Data sync), Toolbox and Records, the unit attention states, task preview, end-early confirmation, closed-task receipt.

Out: Assistant (its own feature), Scan and Find a pig (Find a pig), the Data sync page; task detail pages (their own features); Environment & devices (its own feature). Language and Log out exist in the old design and are not built here (placeholder).

The Assistant, Scan and Toolbox controls are visible prototype navigation to separate sample pages, not part of the Home delivery. A Home-only native preview may open an explicit "UI preview · not connected" explanation for these controls; it must not imply that an agent, camera, search or record action ran. Production navigation waits for the owning feature's design and implementation.

## Decisions

- Decided: one Overview plus unit scope; Assistant has no badge on Home; the last section is remembered; the unit picker has no search (about 15 units at most); completion stays inside the task.
- Decided (2026-10-12; aligned 2026-10-14): remove Home's inferred "ready to complete" state. An in-progress task remains in Today's work regardless of record progress. The [Android Home PRD](../../../Sentri-Android-App/docs/home-prd.md) defines the target card fields and source-data fallback. The Workbench state map and current interactive prototypes now omit the old Ready state; historical review snapshots do not override this decision.
- Open: where language and log out live; what the real "Not designed yet" page shows per task; how the real queue feeds the app-header badge; what "Day N of N" means for tasks with no batch window.
- Open (data): the Home card uses Piglet processing Batch 27 (8 pens, 2 units), while its linked piglet-processing prototype uses Batch 40 (12 pens). These are independent design fixtures; the click-through demonstrates the intended destination, not continuity of one task instance. Align the fixtures before using this flow for connected-data acceptance.
- Open (date): `Sample · Thu, 8 Jul` is a fixed prototype date, not the device clock or a real work schedule. The connected Home date source and formatting still need definition.
