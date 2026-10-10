# Workbench 工作台

## Problem

A worker opens the app to know what to do now, not how the farm is doing. Home must answer "what is ready, where" at a glance, let the worker work either by task across units or by place inside one unit, and show what is saved on the phone when there is no signal. The old Figma (首页 › 工作台) says the same: a workbench, not a data page.

## Who

Daily floor workers in a section (Breeding, Gestation, Farrowing, Nursery): gloved, one-handed, often offline. A supervisor completes or ends tasks from the same cards.

## Anchor

None. Home has no lifecycle of its own; each card inherits the lifecycle of its task. Screens are grouped by scope: section Overview, unit, drawers, task preview, settings.

## Rules

- The screen is "Today's work": one card per task instance in the chosen section, ordered by attention rank (live exception, overdue, due, ready to complete, waiting by earliest next event, closed last). Equal ranks keep their order so cards do not jump.
- Evaluation order per card (HOME-TASK-DISPLAY-RULES): closed receipt; confirmed exception; task-specific work due; all required work recorded (only a permitted whole-task closure gets "Review & complete task"); unit work finished while others remain; next scheduled action.
- A card has identity (task, batch, context), timing ("Day N of N", contextual, never a completion measure), one headline count (what is actionable now), at most one supporting line, a named aggregate progress bar, and in the Overview a footer "Across N units · View task". The main count is never total minus done.
- Counts are unique animals or litters in the selected scope. A unit narrows the counts, never the batch time.
- Task-specific rules: Farrowing = underway, past expected date, due today, next expected; Piglet processing = litters with care due, next care, waiting; Pregnancy = open windows, then next check; Heat and Return-heat show no completion bar for observation.
- Unit scope: inspection, attention, environment and devices entrances sit at the unit; Inspection owns the pen walk.
- Offline: records saved on the device are shown with a count and the connection state; upload is explicit.
- Closed tasks never revive due counts.

## Scope

In: section chooser, Overview, unit picker, unit hub, card states (due, waiting, round complete, ready, closed), the Saved work card (its drawer is the Data sync feature), Toolbox and Records, the unit attention states, task preview, end-early confirmation, closed-task receipt.

Out: Assistant (its own feature), Scan and Find a pig (Find a pig), the Saved work drawer (Data sync); task detail pages (their own features); Environment & devices (its own feature). Language and Log out exist in the old design and are not built here (placeholder).

## Decisions

- Decided: one Overview plus unit scope; Assistant has no badge on Home; the last section is remembered; the unit picker has no search (about 15 units at most); completion stays inside the task.
- Open: where language and log out live; what the real "Not designed yet" page shows per task; whether ready-to-complete shows a review before closing; how the real queue feeds Saved work; what "Day N of N" means for tasks with no batch window.
- Open (data): the Home sample batches (Piglet processing Batch 27, 8 pens, 2 units) do not match the piglet-processing prototype it opens (Batch 40, 12 pens).
