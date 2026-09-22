# Home task cards — proposal for discussion

> Superseded by [Home task-card component](HOME-TASK-CARD-COMPONENT.md). The owner rejected removal of progress bars and promotion of small Inspection actions to full tasks. The current review uses one shared component, labelled task-specific progress and elapsed/remaining time. The notes below record the earlier proposal, not the current design.

Status: information hierarchy demonstrated in `../../system/task-cards-astra-prototype.html`, a separate review gallery linked from Home's studio header and Toolbox. Existing Home task lists and inner task pages have not been replaced by the gallery.

## Sources and limits

- `../../system/screens.html`, the configuration-per-task table: eight core production tasks, task-specific metrics and record semantics.
- `../tasks/heat-check.html`, `breeding.html`, `return-heat.html`, `pregnancy-check.html`, `farrowing.html`, `postpartum.html`, `piglet-processing.html`: consolidated production requirements.
- `../ops/today.html`, “The live UI, mined”: additionally inventories nursery-exit and finishing-exit checks. These have less detailed coverage than the eight core tasks; their exact due/completion rules still need definition.
- `../../model/unified-task-list.md` is explicitly historical. Do not revive its superseded round-submission or implicit-negative mechanisms. Older Today guidance on task ending also does not override the current Farrowing design.

## Three levels, three questions

1. **Home: Which work should I enter?** Task and batch identity, what needs action, scope, timing, and an exception that changes priority. This is a work selector.
2. **Task overview: How is this whole task doing, and where should I go?** Whole-task progress, unit breakdown, outcomes and performance metrics. Unit rows lead into work. Existing task-ending controls remain here where already designed.
3. **Unit task page: What do I do to which animal or pen?** Working list, current states, record trails, filters and recording actions. Unit KPI may remain as established in the existing inner designs.

Useful repetition is permitted: an action count on Home can appear in the overview's breakdown. It must retain the same scope and meaning. Avoid repeating the whole dashboard.

## Card contract

- One card per task × batch × scheduled check/round where applicable; never merge different batches or check rounds into a denominator.
- Shared shape and typography. Dedicated contents per task rather than ten unrelated visual styles.
- Top: task name, batch/check identity and status only if it adds information.
- Middle: one main action count or compact state split; at most one priority-changing exception.
- Bottom: due window/next round and location scope. Overview says “Across 3 units”; Unit view says “In Unit 7”. Time-based facts retain their meaning in either view.
- **Proposed default: no generic completion bar on Home.** “12 to check” plus deadline is sufficient for selecting work. The detailed overview owns completed/total, bars, breakdowns and outcome rates. Do not repeat the same measure as remaining + fraction + percentage + bar.
- Completed or between-round states use factual copy (“This check finished” / “Next round 14:30”), not an implied whole-batch completion.
- Home overview enters the existing whole-task overview; unit-scoped Home enters the selected unit's working page. Undesigned pages remain explicit placeholders.

## Dedicated task contents

Examples below are illustrative, not added farm records or clinical schedules.

| Task | Home: enough to choose work | Task overview: full accounting |
| --- | --- | --- |
| Heat check | Sows in the current observation window; count showing signs if present; current/next round | In-heat totals versus cohort/target, heat rate, unit distribution and activity. In heat is an outcome, not proof that the rest were checked. |
| Breeding | Ready for service now; first/repeat split only when useful; earliest next eligibility | Required service sequences, service-count distribution, completed sequences, unit breakdown and interval metrics. One mating is not necessarily completion. |
| Return-heat check | Sows in the monitoring window, signs needing attention, day N of the watch window | Elapsed monitoring days, returned count/rate and unit breakdown. The cohort does not shrink simply because a sow has not returned. |
| Pregnancy check | Checks due/remaining; distinguish scheduled first/follow-up check from a recheck after an unclear result; deadline | Checked/total for that specific check, pregnant/not-pregnant/unclear outcomes, pregnancy rate and unit breakdown. An unclear record can count as performed without resolving the follow-up. |
| Farrowing | Active now and due/overdue; show an actual attention exception when present | Farrowed/active/awaiting across units, litter metrics, other outcomes and task closure. Do not label every awaiting sow as work due today. |
| Postpartum check | Assessments due, due rechecks if configured, window end | Checked/eligible, assessment outcomes, unit breakdown and the defined assessment KPI. Pass rules and recheck triggers are not inferred by the Home card. |
| Piglet processing | Litters/pens with work due today; short description of the scheduled work | Completion of required items by day/litter, on-time coverage and unit breakdown. Future scheduled work is separate from today's completion. |
| Weaning check | Litters/pens ready or due for weaning; date/window | Checked/eligible, litter totals, weights, sow assessments and unit breakdown. Exact cohort/closure semantics need confirmation in the underlying task design. |
| Nursery-exit check | Pens due for exit assessment; target date/window | Checked/eligible pens, results and unit breakdown. Detailed rules are not established in the current task catalogue. |
| Finishing-exit check | Pens due for exit assessment; target date/window | Checked/eligible pens, results and unit breakdown. Detailed rules are not established in the current task catalogue. |

The owner explicitly expanded Home tasks beyond production to include transfers, treatments and vaccinations. Assigned or scheduled work has its own Home card; the same action can still be performed ad hoc in Inspection. A recorded action does not automatically create a standing task.

## Expanded card gallery

The gallery uses the established Sentri card language: white surfaces, restrained type, thin borders and muted status color. It has 18 examples, category filters, Overview/Unit 7 scope and Today/Upcoming/Completed-session states. Each example is independent fictional data; the Unit 7 switch demonstrates scope, not one unit containing every production stage.

| Additional task | Card contents | Inside the task |
| --- | --- | --- |
| Treatments | Pigs due in the scheduled session, timing, unit scope | Assigned treatment plans, previous administrations and recording |
| Vaccinations | Pigs remaining in this scheduled vaccination, batch, timing, units | Eligibility, assigned vaccine/dose, previous records, lot information and recording |
| Pig transfer | Remaining pigs, origin → destination, movement order and timing | Exact pens, selected animals/group counts, capacity, record handling and confirmation |
| Health follow-up | Pigs due for review, case-review session and timing | Case history, observations and explicit resolution or treatment changes |
| Feed adjustment | Pens with assigned changes, effective timing | Current/proposed plans and explicit application |
| Weight check | Remaining pigs in the planned sample, batch and deadline | Individual weights, sample progress and aggregate results |
| Cleaning & preparation | Assigned pens and arrival deadline | Farm checklist and completion; this task category is proposed |
| Maintenance | Assigned open issues, equipment and deadline | Exact location, issue details and resolution |

Cards intentionally omit generic progress bars. A completed treatment session does not complete the course; a completed heat round does not end monitoring; assessment does not imply movement. The completed examples preserve these distinctions.

Tapping a gallery card opens a design review of the Home/detail boundary. Farrowing links to the existing overview or unit page. Maintenance links to the existing Unit 7 entrance. Other inner task pages are explicitly marked not designed yet; no substitute recording interface is invented. Medication examples do not prescribe products, doses or schedules.

Sources for the extension are the owner's task request plus `../ops/health.md` and `../ops/place-identity.md`. Those documents establish action/record behavior; they do not establish all scheduling and assignment rules for these new Home tasks. The gallery's counts, session times and grouping are illustrative.

Verification: opened the gallery from Home's Toolbox, checked category and unit filters, upcoming/completed-session examples, the vaccination review placeholder and the existing Farrowing overview link. Reviewed desktop and 390 px mobile layouts without horizontal page overflow. Syntax checks passed; no browser errors were reported.

## Home attention area — implemented separately

Pending uploads appear directly below the scope selector, above unit context and tasks. When there are no pending records, the quiet uploaded status can remain at the bottom. This queue is device-wide, independent of the selected section/unit.

Assistant remains a navigation entrance only on Home. Agent findings, decision requests and their counts live inside Assistant; they do not occupy Home or section cards.
