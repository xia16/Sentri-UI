# Home task-card display rules

Status: Home design handoff, updated 2026-10-14. Authoritative task status alone determines Home placement; record progress cannot produce a ready-to-complete state. The medical/scheduling thresholds are configured farm inputs, not recommendations made by this UI. The [Android Home PRD](../../../Sentri-Android-App/docs/home-prd.md) and [production-card overview](../../../Sentri-Android-App/docs/home-production-task-cards.md) explain current examples and backend gaps.

## Current Home contract

Show one entry per open task instance after filtering to the selected section or unit. “In progress” remains in Today's work even between actions. Include unstarted tasks whose start day has arrived and assigned undated tasks that are executable now. Only future, unstarted tasks starting on one of the next seven farm-local days appear under that day's fixed date choice **in Unit scope**; Overview has no date selector. Up to four visible open and today-finished instances show every task: concise identity and one accurate work fact in Overview, full cards in Unit. From five instances, show one connected surface of independently expandable task categories; expanded Overview categories use indented concise child rows, while Unit retains full cards. Category headers expose relevant open, finished, overdue and exception counts without repeating an all-open total. Finished receipts are limited to tasks authoritatively ended today and follow open tasks in their category. Section and unit picker counts are distinct open task instances, including waiting tasks. Stable sorting, explicit deadlines and pagination rules are in the Workbench PRD.

The rules below describe *card content*, not a rule for removing an in-progress task from Home. The task feature owns task closure. Any old Ready-to-complete scenario or Home completion CTA is superseded.

## Shared evaluation order

1. Explicitly completed or ended early: compact receipt, bottom of the list. Never revive its due counts from old records.
2. Confirmed actionable exception: one main count and at most one supporting fact. Unrelated agent findings stay in Assistant.
3. Task-specific work due: use the first applicable priority below. Counts include unique eligible animals or litters in the selected scope. Past-due items remain a subset of the due count, not an extra total.
4. No work due now: show the next scheduled action or a quiet in-progress message. Retain cumulative progress; a full bar does not change the task status or add a closure action to Home.
5. Unit work finished while other units remain open: Unit work complete · task still open. A unit bar cannot close the whole task.

## Card slots and ordering

- Identity always remains. Compact Day N of N is contextual timing, not a completion measure.
- One headline, one optional supporting line. The supporting line uses its own priority below; lower-priority facts stay inside the task.
- Main fact follows the task-specific contract below; it can be an outcome rather than actionable-now count. Unit full cards may show an explicitly named outcome bar. Overview's concise entry must not turn an outcome count into a due count; if no reliable actionable count exists, say the task is in progress or name its next known time. Do not derive an eligible-now count as total minus completed when eligibility is time-based.
- Only explicit activity can mark an observation round complete. No return/heat outcome is not a negative or completed observation.
- Finished Home receipts sit at the end of their category, after open tasks; in the short list they follow open tasks. They keep a readable muted surface, a Completed or Ended early marker, absolute stamp and “View record”. Open-task order: actionable exceptions / active farrowing → explicit overdue work → today's work → previously scheduled but unstarted work → assigned undated work → other in-progress tasks. Equal-ranked tasks use task time and stable ID to avoid jumping. A category ranks by its highest-priority open task.
- Evaluate the same display rules after scope filtering. Scope never changes the task's authoritative status.
- A full outcome bar, one full treatment session or a finished unit does not prove that the task has ended. Do not infer Home closure from enrollment, dependency or record counts.

## Pregnancy check

1. Checks whose configured window is open, including due rechecks in this task instance
2. Next eligible check date
3. No checks due

Supporting line: Overdue checks → due rechecks → scheduled later. Show only the first applicable line; rechecks are included in the main count.

Completion: All required checks in this named sweep recorded; unclear results retain their separate follow-up. A full first-check bar does not complete later checks.

Source: ../research/tasks/pregnancy-check.html

## Heat check

1. Overview: cumulative recorded-in-heat sows / configured target, as an outcome, not a due or completion count
2. Unit: sows with recorded signs but no confirmed heat, with the signs subset shown only when present
3. If reliable targets or candidates are missing, show the known fact without a fabricated denominator or “no signs” branch

Supporting line: one useful sign or schedule fact. Do not show a legacy observation-round label or infer missed checks from absent heat marks. The Overview outcome bar is explicitly “Recorded in heat / target”; it is not completion progress. No quick close on Home.

Completion: Review the configured window and observation activity. Recorded-in-heat is an outcome, not task completion; reaching the heat target does not silently close observation work.

Source: ../research/tasks/heat-check.html

## Breeding

1. Overview: unique heat-marked task sows mated at least once / unique eligible heat-marked task sows
2. Unit: sows currently eligible for a first or repeat service, split only when useful
3. Next service time
4. Waiting for heat confirmations

Supporting line: past service window → first/repeat breakdown. The Overview bar is “Mated at least once / heat-marked”; it is not configured-sequence completion. Unit eligibility counts each sow once. The legacy first-service timing and list eligibility need one authoritative rule before live data drives “ready now.”

Completion: All required service sequences complete AND heat check closed. A full bar while heat check remains open shows Waiting for heat check to close.

Source: ../research/tasks/breeding.html

## Return-heat check

1. Temporary Overview bridge: recorded returns and sows without a return record in the same historical scope; these are separate facts, not a rate or due count
2. Unit: sows at their estimated return date and submitted signs; these sets may overlap and must not be added
3. Next reliable estimated date when neither fact is current

Supporting line: one estimated-date or submitted-signs fact. No Home pie, return-rate bar, observation-round wording or quick close. Current backend daily statistics are unreliable for this card; review this temporary bridge after the Return-heat feature is settled.

Completion: owning task flow only. Neither returned counts nor blank marks establish observation completion.

Source: ../research/tasks/return-heat.html

## Farrowing

1. Recorded farrowing underway
2. Past expected date without a farrowing record
3. Due today without a farrowing record
4. Next expected date

Supporting line: while farrowing is underway, past expected date → due today. Otherwise, use a neutral expected-date fact. Missing start records never imply that a sow is not farrowing. If dates cannot be trusted, say “Expected date to confirm.”

Home bar: “Farrowed X / Y sows”; Y covers current task members expected to farrow. Death and abortion remove the sow from this task and from both numerator and denominator. The Farrowing feature is being revised separately; this Home-side handoff does not change that feature's task flow. Closure stays in the owning task.

Source: ../research/tasks/farrowing.html

## Postpartum check

1. Assessments due from each sow’s farrowing date, including explicitly scheduled rechecks
2. Next scheduled assessment
3. Waiting for more farrowing records

Supporting line: Overdue assessments → explicitly scheduled rechecks. Do not create a recheck from an abnormal answer without an agreed scheduling rule.

Completion: Required assessments recorded AND farrowing closed. The denominator can grow while farrowing remains open.

Source: ../research/tasks/postpartum.html

## Piglet processing

1. Litters with at least one scheduled care item due and unfinished
2. Next scheduled care date
3. Waiting for new litters or scheduled care

Supporting line: Litters with overdue required care. Count unique litters, not the number of procedures; optional skipped items need an explicit farm rule.

Completion: All required items across the entire age-day schedule recorded AND farrowing closed. Finishing today’s items is not finishing the schedule.

Source: ../research/tasks/piglet-processing.html

## Weaning check

1. Eligible pens with a weaning assessment due
2. Next scheduled assessment
3. No assessments due

Supporting line: Overdue assessments, if a deadline is configured. Body weight and readiness results belong inside the assessment.

Completion: Required assessments for the cohort recorded. This completes the check, not the physical transfer. Other closure dependencies are not specified.

Source: screens.html

## Treatments — proposed

1. Animals due for the scheduled treatment session
2. Next scheduled session
3. No treatment due

Supporting line: Unrecorded past-due administrations only when the plan defines that status. The UI reports records and schedules; it does not recommend a replacement dose.

Completion: Session completion does not complete a course. Course-level close rules remain a proposal; the existing docs specify administration recording only.

Source: ../research/ops/health.md

## Vaccinations — proposed

1. Eligible animals due for this scheduled vaccination
2. Next scheduled vaccination date
3. No vaccinations due

Supporting line: Overdue animals if the campaign defines a deadline. Boosters belong to their own scheduled instance.

Completion: Required records for this vaccination instance complete; future boosters are not implicitly completed. Campaign lifecycle remains a proposal.

Source: ../research/ops/health.md

## Pig transfer — proposed

1. Confirmed issue preventing a scheduled move, when present
2. Animals eligible to move in the current receiving window
3. Next receiving window
4. Waiting for the movement plan

Supporting line: A confirmed receiving/location issue supersedes the movement count only when the worker has an action to resolve it. Do not infer capacity problems.

Completion: All required movements confirmed; selection or a destination choice is not a movement record. Order scheduling and closure remain a proposal.

Source: ../research/ops/place-identity.md

## End-nursery and end-finishing

End-nursery is the old `NURSERY` pen check. For a verified task pen set, show “N pens to check” and “Checked X / Y pens” in the selected scope; a full bar does not end the task. If the pen set is not reliable, show the task entrance without a guessed count. Confirm the stable pen set and `check_at` before connected use. End-finishing has a backend pen-check command, but no corresponding old Web task page or Home card: leave its card fields undesigned until the workflow is agreed.

## Boundaries still open

Treatment courses, vaccination campaigns and movement orders lack a full task lifecycle specification. Their displayed scheduling states are illustrative. Postpartum recheck triggers and optional piglet care expiry are also unresolved; no automatic behavior is inferred. Heat/return monitoring closure requires a defined window/activity review, not an outcome percentage. Early-end consequences must be shown inside each task: breeding/heat/farrowing may affect batch membership; piglet processing can prevent later backfill.
