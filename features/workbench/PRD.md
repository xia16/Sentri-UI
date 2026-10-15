# Workbench 工作台

## Problem

A worker opens the app to see the active work in the chosen area, not how the farm is doing. Home must show which tasks are in progress, scheduled, or assigned, let the worker work either by task across units or by place inside one unit, and show what is saved on the phone when there is no signal. The old Figma (首页 › 工作台) says the same: a workbench, not a data page.

## Who

Daily floor workers in a section (Breeding, Gestation, Farrowing, Nursery): gloved, one-handed, often offline. A supervisor can open the same task cards; task completion remains in the owning task flow.

## Anchor

None. Home has no lifecycle of its own; each card inherits the lifecycle of its task. Screens are grouped by scope: section Overview, unit, drawers, task preview, settings.

## Rules

- The screen is "Today's work": one card per task instance in the chosen section. An authoritative in-progress task stays in the main list even when its next action is later; upcoming contains only future tasks that have not started. Rank confirmed exceptions, explicit overdue work, today's work, previously scheduled but unstarted work, assigned undated work, and other in-progress tasks. Equal ranks keep a stable order.
- Home placement follows the authoritative task status. Records and a full progress bar inform the card content but never create a separate "ready to complete" state or closure call to action. Only an authoritative completed or ended-early task becomes a finished Home receipt. Task closure belongs to the owning task detail.
- A card has identity (task, batch, context), timing ("Day N of N", contextual, never a completion measure), one task-specific headline fact, at most one supporting line, an optional named progress bar when its denominator is reliable, and in the Overview a footer "Across N units · View task". Eligible-now counts are never guessed as total minus done.
- Counts are unique animals or litters in the selected scope. A unit narrows the counts, never the batch time.
- Task-specific rules: Farrowing = underway, past expected date, due today, next expected; Piglet processing = litters with care due, next care, waiting; Pregnancy = open windows, then next check; Heat and Return-heat show no completion bar for observation.
- Unit scope: the compact unit hub shows population, occupied pens, last inspection and reliable attention summaries. Inspection, Inventory and available Environment are separate actions; an open Maintenance count opens Maintenance independently. Inspection owns the pen walk. Overview has Inspection and Inventory shortcuts.
- Offline: the app header shows a compact, phone-wide unsent-record badge on Home and other internal pages. It distinguishes waiting, automatic upload and exceptions; an exception opens Data sync for manual handling. A usable connection starts upload automatically. Task pages can show a separately labeled count for that task instance. The record lifecycle and recovery rules belong to [Data sync](../data-sync/PRD.md).
- Finished tasks stay at the end of their type (or after the full cards when the list is short); they never revive due counts. Their readable muted surface, ✓ or ended marker, absolute stamp and “View record” distinguish a receipt from a disabled task.
- Tapping the section name in the Home header opens the section chooser with a 260 ms horizontal slide and fade: the chooser enters from the right by about one third of the page width while Home exits left by about one sixth. Back or choosing a section reverses the motion. The bottom navigation stays fixed; reduced-motion preference removes the animation.

### Home list contract · updated 2026-10-15

- A task instance is identified by farm, source type and task ID; keep the batch and any genuinely separate check instance in its identity. Do not merge different batches or split one cross-unit task into several Overview cards. An authoritative in-progress task belongs in Today's work regardless of whether an action is due now. A scheduled task that has not started belongs there from its start day; an assigned, executable undated task also belongs there. Drafts, unscheduled work and permanent tool entrances do not generate task cards.
- Use farm-local dates. Only an explicit deadline makes a task overdue; passing its start date alone does not. The date strip shows **exactly the next seven farm-calendar days, starting tomorrow**, all visible together; there is no month, range or earlier-date navigation. Each date has a 48×48px target; on a very narrow screen the seven dates may wrap into two rows instead of hiding a date. Tapping a date shows only task instances scheduled to start on that date. A short inline result names the start or gives the count; “View” opens the full read-only list. Today’s in-progress tasks stay put. An unknown backend state is read-only “Status to confirm”; it produces no due count, overdue marker or end action.
- First filter by section or unit, then rank open instances: confirmed actionable exceptions, explicitly overdue tasks, today's scheduled/action tasks, previously scheduled unstarted tasks, assigned executable undated tasks, then other in-progress tasks. Ties use explicit action time, start time and stable task ID. When the visible Home set is small (at most four open plus today-finished instances), show every full card. From five instances onward, put the full cards inside one connected surface grouped by **task category**: Production tasks, Treatment, Vaccination, Pig transfer, Outbound and Sampling in this study. Production subtypes such as Pregnancy check and Return-heat check remain distinct cards inside Production tasks. A cross-unit task keeps one card in Overview.
- The category order follows its highest-ranked open instance; a category containing only finished receipts follows open categories. Open cards retain their ranked order inside the category. A category header shows its total and short counts for open, finished, explicit overdue and actionable exceptions; it does not hide urgent work behind an ellipsis. All urgent categories open by default; if none is urgent, the first category opens. Each category can open independently, and any number may stay open. When a worker returns from a task, restore the scope, scroll position and open categories. Changing scope or returning from another top-level area resets expansion. Section and unit picker counts remain **distinct open task instances**, including waiting tasks, not categories or unfinished animal rows. Complete sorting and counts before pagination; the first fetched page cannot establish the total.
- Only authoritative completed and ended-early tasks that ended today in the farm timezone appear as finished receipts, after open cards within their category. They have no separate Closed section or inferred Ready-to-complete state. Show the completion type, absolute local stamp, ✓ or ended marker and an explicit “View record” action on a readable muted surface. Older receipts live in Records. A full progress bar or all currently due records do not make an open task finished.
- A task may have no reliable headline number or denominator. Show an accurate status/next-time line and omit an invented bar. Distinguish loading, empty, no permission and read failure. The detailed local-record/upload-failure/offline-snapshot behavior belongs to Data sync and the Android implementation contract, outside this design handoff.

### Mixed production and other work · design preview

The `many=operations&variant=connected` Home scene mixes three open production task instances with two instances each of treatment, vaccination, transfer, outbound and sampling. It shows their category summaries, seven fixed date choices and full cards inside independently opened categories. `groups=collapsed` and `groups=all` are review presets; workers may open or close any category. These are fictional schedules for checking density and priority, not connected task data or approved task lifecycles. Tapping an operational card opens an explicit detail preview without an End task action. Older `variant=grouped|joined|seamless` and unqualified URLs remain comparison studies and do not define the chosen list layout.

The [review image set](connected-home-preview.md) shows the few-task, grouped, date, unit, empty and pointer-feedback states side by side.

| Card | Headline fact | Supporting fact and named progress |
| --- | --- | --- |
| Treatment course | Pigs due for the current scheduled dose | Dose number or next dose time; “This dose recorded X / Y pigs”, never whole-course completion |
| Vaccination | Pigs due for this scheduled vaccination | Vaccine and dose identity, explicit overdue subset or next session; “This vaccination recorded X / Y pigs” |
| Pig transfer | Pigs whose move still needs confirmation | Source and destination; “Move confirmed X / Y pigs”. One order stays one Overview card across units. |
| Outbound | Pigs in this assigned order awaiting outbound confirmation | Object group and “No deadline” when no date exists; “Outbound confirmed X / Y pigs” |
| Sampling | Scheduled targets not yet sampled | Target kind and location; “Targets sampled X / Y”. One sampling task is one card. |

The [Android Home PRD](../../../Sentri-Android-App/docs/home-prd.md) §4.2 defines the source-data conditions, scope rules and missing-field fallbacks for these five types. Daily inspection, environment and maintenance stay in the unit hub; semen collection stays a tool entrance until it has its own task instance and schedule.

## Scope

In: section chooser, Overview, unit picker, compact unit hub, status-driven task cards (in progress, scheduled, finished), fixed seven-day date choices, the app-header Saved work badge (details belong to Data sync), Toolbox and Records, unit attention states, task preview, end-early confirmation and finished-task receipt.

Out: Assistant (its own feature), Scan and Find a pig (Find a pig), the Data sync page; task detail pages (their own features); Environment & devices (its own feature). Language and Log out exist in the old design and are not built here (placeholder).

The Assistant, Scan and Toolbox controls are visible prototype navigation to separate sample pages, not part of the Home delivery. A Home-only native preview may open an explicit "UI preview · not connected" explanation for these controls; it must not imply that an agent, camera, search or record action ran. Production navigation waits for the owning feature's design and implementation.

## Decisions

- Decided: one Overview plus unit scope; Assistant has no badge on Home; the last section is remembered; the unit picker has no search (about 15 units at most); completion stays inside the task.
- Decided (2026-10-12; aligned 2026-10-14): remove Home's inferred "ready to complete" state. An in-progress task remains in Today's work regardless of record progress. The [Android Home PRD](../../../Sentri-Android-App/docs/home-prd.md) defines the target card fields and source-data fallback. The Workbench state map and current interactive prototypes now omit the old Ready state; historical review snapshots do not override this decision.
- Decided (2026-10-15): the connected Home study uses full cards for up to four visible instances and independently expandable task categories from five onward. Finished receipts sit inside their category with readable muted styling. The seven-date strip is fixed to tomorrow through the following six days; it has no broader date browsing. The old five-card truncation, separate Coming up list and separate Closed section are historical comparison states.
- Open: where language and log out live; what the real "Not designed yet" page shows per task; how the real queue feeds the app-header badge; what "Day N of N" means for tasks with no batch window.
- Open (data): the Home card uses Piglet processing Batch 27 (8 pens, 2 units), while its linked piglet-processing prototype uses Batch 40 (12 pens). These are independent design fixtures; the click-through demonstrates the intended destination, not continuity of one task instance. Align the fixtures before using this flow for connected-data acceptance.
- Open (date): `Sample · Thu, 8 Jul` is a fixed prototype date, not the device clock or a real work schedule. The connected Home date source and formatting still need definition.
