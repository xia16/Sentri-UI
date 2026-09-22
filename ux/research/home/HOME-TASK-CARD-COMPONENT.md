# Home task-card component — current proposal

Supersedes the earlier 18-card gallery and its no-progress-bar proposal. The owner requested a component-first design, visible progress and elapsed/remaining days, grounded in Claude's task documents. Weight checks belong inside Inspection, not as full Home tasks.

## Review surface

`../../system/task-cards-astra-prototype.html` remains linked from Sentri Home's header and Toolbox. It now opens an annotated component with Task, Scope and State controls. Tabs expose major-task examples and source-linked rules. The shared renderer and stylesheet are `astra-home-task-card.js` and `astra-home-task-card.css`; examples provide data rather than separate markup per task.

The reviewed component is now used by the Home prototype in both Overview and unit scopes. Each existing task instance has its own card; repeated group headings and the old grouped rows are removed. Existing task destinations remain linked, and unfinished destinations retain their placeholder. There are eight established production types plus the owner's three major operational task types: treatments, vaccinations and transfers.

## Fixed fields

| Position | Input fields | Meaning / constraints |
| --- | --- | --- |
| 1 · Identity & time | `identity.title/context/icon`, `timing.elapsed/remaining`, `status.tone` | Task title and batch/plan/check identity. Clock + `Day N of N` replaces the generic In progress badge. Upcoming shows `Starts tomorrow`; overdue shows `2 days overdue`; undated shows `Day N`. |
| 2 · Attention | `action.value/label/secondary`, optional `route.from/to`, optional `exception` | What needs attention now. One main count; one useful contextual line at most. Transfer has origin → destination. |
| 3 · Progress | `progress.kind/label/value/total/unit`, optional segments/legend/note | Every bar names what it measures. Scope is identical to the card's location scope. No generic percentage without a semantic denominator. |
| 4 · Navigation | `scope.label/action`, task ID | Whole-task overview from all-unit scope; unit working page from selected-unit scope. Entire card is one hit target. |

Owner refinement: removed the entire standalone timing row, its divider, the redundant days-left count and next-work sentence. Timing is now the compact header badge. Full scheduling data remains available to the task detail model; it no longer adds a separate section to every Home card.

White surface, 18 px corners, 17–18 px content padding, 14 px medium-weight title, a single 34 px regular-weight action count, 6 px progress bar and a quiet tinted navigation footer. Annotation dots belong to the review page only. The default card is 354 px wide, fitting a 390 px phone with 18 px side margins.

## Task semantics read from Claude's documents

| Task | What the bar measures | Time / caveat | Source |
| --- | --- | --- | --- |
| Heat check | In heat / target cohort: **outcome**, not checks completed | Day N of configured heat window plus next observation. Source mocks contain 3/7-day variants, not one hardcoded duration. | `../tasks/heat-check.html`, requirements + subtraction; `../../system/screens.html`, task configuration |
| Breeding | Sows reaching configured service count / in-heat cohort | Batch window plus next service eligibility. One mating does not finish a sequence. | `../tasks/breeding.html`, requirements |
| Return-heat | **Elapsed monitoring days**, displayed as day segments | Current day is visually distinct. Return count is an adverse outcome shown separately, never a success numerator. Day segments do not certify observations. | `../tasks/return-heat.html`; `../../system/screens.html`, configuration |
| Pregnancy | Checked / eligible for this particular check | Configured three-day sweep; first/second checks and unclear-result rechecks remain distinct. Unclear can be recorded yet still need follow-up. | `../tasks/pregnancy-check.html`, requirements + data map |
| Farrowing | Farrowed / enrolled, with active and awaiting segments | Batch window only if configured; individual due dates stay independent. Uses current Astra inner page for navigation and closure rather than reviving older closure rules. | `../tasks/farrowing.html`, requirements; current Farrowing prototype |
| Postpartum | Checked / farrowed | Denominator grows with new farrowings. Configured start/window; no invented pass or recheck triggers. | `../tasks/postpartum.html`, requirements |
| Piglet processing | Pens with all scheduled items complete / eligible pens | Partial completion is not full completion. Litter age-day schedule controls next work; task elapsed days are a separate fact. | `../tasks/piglet-processing.html`, requirements |
| Weaning | Assessed / eligible pens | Configured day window. No standalone consolidated weaning document was found; the shared screens are the source. Assessment is not a movement. | `../../system/screens.html`, configuration + task-detail examples |
| Treatments | **Proposed:** recorded / due pigs in the named session | Plan-level days remain separate from session progress. Entire course completion is not established by the action docs. | `../ops/health.md`; owner request |
| Vaccinations | **Proposed:** recorded / eligible pigs for this scheduled vaccination | Campaign window is illustrative; a later booster is a separate instance. | `../ops/health.md`; owner request |
| Transfers | **Proposed:** confirmed movements / order head count | Order start/deadline are proposed. Selection alone does not advance progress. | `../ops/place-identity.md`; owner request |

The legacy `../../model/unified-task-list.md` is historical. Its submit/certification and implicit-negative mechanisms are superseded. Where a task document inventories an old production behavior, the later subtraction/data map and current shared task configuration take precedence. No new animal-health regimen is defined by this component study.

## Timing and scope rules

- `Day N of M` is the current inclusive calendar day, not N completed days. `M - N days left` counts calendar days after today; final day says `Ends today`.
- Actual implementation must derive values from configured start/end dates in the farm's timezone. The review fixture supplies illustrative day values only.
- Overdue changes the deadline/status but does not advance recorded work. Upcoming has zero recorded work and a start date, never `Day 0`.
- With no end date, retain days elapsed and show no invented countdown. A monitoring window without a configured duration also has no filled time bar.
- Unit selection changes animal/pen counts and progress denominators, not the batch's elapsed days. A task-specific unit window would require explicit data, not an inferred reset.
- Ongoing or closed tasks are not automatically 100% successful. Current review states focus on active/upcoming/overdue/undated; closure belongs to the actual task model.

## What is not a full Home task

Weight checks, feed adjustments, notes and routine health observations stay in Inspection. Maintenance stays under the unit, as previously agreed. The invented Cleaning task is removed. This changes the gallery taxonomy; existing Inspection actions remain available.

Nursery-exit and finishing-exit are present in `../ops/today.html` but lack dedicated definitions. They are acknowledged in the rules tab; their progress and timing are deferred rather than fabricated.

## Verification

Syntax checks passed for the component and study scripts. Browser review covered all 11 configured examples, overview/unit scope, return-heat day segments, overdue and missing-duration handling, upcoming zero progress and the 390 px responsive layout. At phone width the page's scroll width equals its available client width. The viewport override was reset after review. No live farm records are used or changed.

## Current state refinement

Supersedes the monitoring-bar and outcome-bar examples above for Heat and Return-heat Home cards. Both now show the eligible scope for the current observation (`38 to check`) with no monitoring bar or returned count. Results, targets and rates remain inside the task. Actionable counts are supplied independently from whole-task completion; pregnancy now illustrates 5 due among 12 unfinished.

- Due now: prominent count, concise action, optional whole-task progress.
- Waiting: quiet clock line with the next scheduled time.
- Round complete: quiet checkmark line with the next time; task remains open. This fixture is explicit and never inferred from absence of observation marks. Real round-activity evidence remains a product prerequisite.
- Task complete: compact review row with task, batch, scope and completion time; no progress, action number or day badge. Task closure is explicit, not inferred from a full bar.
- Order: actionable work first, waiting/round-complete/upcoming by next scheduled time, completed tasks in a separate bottom section.

Home defaults to a mixed-day fixture and has an outside-the-phone Work preview selector. Gallery State offers the same states plus Mixed day. Added completed examples are separate fictional prior task instances; unfinished results pages remain labelled placeholders. All state changes are local preview controls, not task mutations.

## Attention panel refinement

The main count now sits in a softly tinted inset with a readable action phrase (e.g. 5 sows ready to check) and optional scheduling context (7 scheduled later). Waiting/completed cards remain compact. Heat check restores the explicitly labelled Recorded in heat outcome bar; this supersedes its no-bar treatment above. Return-heat still omits elapsed-day progress and returned outcomes on Home. The pregnancy eligibility count remains independent of total incomplete checks.

Owner refinement: removed the attention inset background, border, radius and padding. Count and two-line action copy now sit directly on the main card surface, separated from progress through spacing. The explicit copy and progress semantics are unchanged.

## Task-specific scenarios and unit context

The component study replaces Scope selection with simultaneous Overview and Unit 7 previews. Chips above the cards select task-specific scenarios, including first/repeat services and due/recheck pregnancy checks. Unit models supply their own eligibility and action state; a due Overview can coexist with a waiting unit. Unit cards omit the location/navigation footer and retain a small header chevron plus whole-card navigation.

Farrowing: default attention is expected today with no final record. Explicit in-progress records are optional secondary context, and can become primary when relevant. Progress is final farrowing records / enrolled sows in both live and final-only recording scenarios. No in-progress record does not establish that a sow has not started. Past expected date means check animal or update record; it does not assert biological status. Missing dates prompt schedule review, never an invented due count. Final-only, live, late, unknown-date, waiting and completed scenarios are available in the component chips. Illustrative dates/counts are not a farm protocol.

## Attention cascade and continuing tasks

Home and gallery now share an attention resolver, independent from progress. Precedence: explicit task ending selects the completed layout; otherwise a recorded actionable exception wins, followed by work due, the next scheduled event, then waiting for candidates. Farrowing precedence is recorded in progress, past expected date without final record, due today, next expected. Missing expected dates is removed from the preview catalogue.

Breeding with no due services shows Next service or Waiting for heat confirmations. Piglet processing with no care due shows Next care; neither says completed today or round complete. Explicitly ended historical task instances alone move into Completed. Generic round-complete previews resolve to waiting for these task types. Observation rounds may still explicitly report a finished round without ending the task. Component chips illustrate both competing priorities and the selected unit having no work while the whole task does.

### Waiting, ready for review, and closure
- Retain cumulative progress during waiting, including service sequences; the quiet next-work line does not replace it.
- When all required work across the whole task is recorded and no actionable blockers remain, show a full bar and Review & complete task. This is still an open task.
- Explicit Complete task confirms closure; only then show the compact Completed card at the bottom. End task early is a separate, confirmed action and shows Ended early.
- A finished unit retains its full bar with Unit work complete · task still open while other units remain unfinished. Outcome metrics and session-only bars never establish whole-task readiness by themselves.
- Gallery closure controls and Home sample closure are in-memory prototype actions. Existing Farrowing closure safeguards remain in effect.
