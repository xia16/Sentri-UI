# Home task-card display rules

Status: design proposal grounded in the task specifications. Current user decisions override older screen-placement recommendations; completion stays inside the task overview. The medical/scheduling thresholds are configured farm inputs, not recommendations made by this UI.

## Shared evaluation order

1. Explicitly completed or ended early: compact receipt, bottom of the list. Never revive its due counts from old records.
2. Confirmed actionable exception: one main count and at most one supporting fact. Unrelated agent findings stay in Assistant.
3. Task-specific work due: use the first applicable priority below. Counts include unique eligible animals or litters in the selected scope. Past-due items remain a subset of the due count, not an extra total.
4. All required work recorded: check closure dependencies and unresolved records. A dependency keeps the full bar visible with a quiet reason; only a permitted whole-task closure gets Review & complete task.
5. Unit work finished while other units remain open: Unit work complete · task still open. A unit bar cannot close the whole task.
6. Next scheduled action: quiet time/date, cumulative progress retained. No known next event: task-specific waiting copy.

## Card slots and ordering

- Identity always remains. Compact Day N of N is contextual timing, not a completion measure.
- One headline, one optional supporting line. The supporting line uses its own priority below; lower-priority facts stay inside the task.
- Main count = actionable now; bar = named aggregate progress. Do not compute the main count as total minus completed when eligibility is time-based.
- Only explicit activity can mark an observation round complete. No return/heat outcome is not a negative or completed observation.
- Closed tasks sort last. Open-card order: actionable exceptions / active farrowing → overdue work → due work → ready to complete → waiting (earliest next event first). Equal-ranked cards retain their existing order to limit jumping.
- Evaluate the same rules after scope filtering. Whole-task closure eligibility remains global.
- A full outcome bar, one full treatment session or a finished unit does not prove whole-task readiness. Enrollment/dependency state and future required work must be accounted for.

## Pregnancy check

1. Checks whose configured window is open, including due rechecks in this task instance
2. Next eligible check date
3. No checks due

Supporting line: Overdue checks → due rechecks → scheduled later. Show only the first applicable line; rechecks are included in the main count.

Completion: All required checks in this named sweep recorded; unclear results retain their separate follow-up. A full first-check bar does not complete later checks.

Source: ../research/tasks/pregnancy-check.html

## Heat check

1. Eligible sows still needing the current observation
2. Next scheduled observation
3. Waiting for the configured heat window

Supporting line: Current round. Use an overdue count only with explicit observation records and a configured deadline; no heat mark is not evidence of a missed check.

Completion: Review the configured window and observation activity. Recorded-in-heat is an outcome, not task completion; reaching the heat target does not silently close observation work.

Source: ../research/tasks/heat-check.html

## Breeding

1. Sows eligible for a first or repeat service now
2. Next service time
3. Waiting for heat confirmations

Supporting line: Past service window → first/repeat breakdown. Main count includes both first and repeat services; one sow is counted once.

Completion: All required service sequences complete AND heat check closed. A full bar while heat check remains open shows Waiting for heat check to close.

Source: ../research/tasks/breeding.html

## Return-heat check

1. Sows within their individual return window needing the current observation
2. Next observation or next cohort entering its window
3. No checks due

Supporting line: Current round. Returning is an outcome; neither returned counts nor blank marks establish observation completion.

Completion: Review all configured monitoring windows and recorded activity before closing. No Home progress bar, return-rate result or elapsed-time bar.

Source: ../research/tasks/return-heat.html

## Farrowing

1. Recorded farrowing underway
2. Past expected date without a final record
3. Due today without a final record
4. Next expected date

Supporting line: While farrowing is underway: past expected date → due today. Otherwise, past-date cases show No final record. Missing start records never imply that a sow is not farrowing.

Completion: Final records or resolved outcomes across the cohort, no active farrowing or unsaved drafts. Review before closing; legitimate other outcomes are not fabricated as completed farrowings.

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

## Boundaries still open

Treatment courses, vaccination campaigns and movement orders lack a full task lifecycle specification. Their displayed scheduling states are illustrative. Postpartum recheck triggers and optional piglet care expiry are also unresolved; no automatic behavior is inferred. Heat/return monitoring closure requires a defined window/activity review, not an outcome percentage. Early-end consequences must be shown inside each task: breeding/heat/farrowing may affect batch membership; piglet processing can prevent later backfill.
