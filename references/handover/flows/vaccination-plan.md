# Vaccination plans (免疫计划: 普免计划 / 跟批免疫计划)

| | |
|---|---|
| Area | [Vaccination and medical tasks](../vaccination-and-treatment.md) |
| Platforms | Console (configuration, calendar, lists); back end (date expansion, event listening, task generation) |
| Maturity | specified + built in prototype (also built, with defects, on the live dev product) |
| Newest sources | `Vaccine/prds/vaccine prd/02-普免计划.md` and `03-跟批免疫计划.md` (2026-05-22); `Vaccine/prds/vaccine prd/09-疫苗计划与疫苗任务测试用例.md` (2026-07-06); `Vaccine/docs/测试报告-2026-08-18-免疫计划-多角色.md` (2026-08-18); `Vaccine/src/components/VaccinePlanPage.tsx` |
| Related flows | [vaccine-task](vaccine-task.md), [vaccination-exemption](vaccination-exemption.md), [immune-effect-review](immune-effect-review.md), [material-master](material-master.md) |

## Job
The immunization manager (免疫管理员) defines, once, which pigs get which vaccine and when. The back end then creates vaccine tasks by itself, either on fixed calendar dates (blanket plan, 普免计划) or when a production event fires (batch-following plan, 跟批免疫计划). Nobody has to create each recurring task by hand.

## Trigger and actors
- Console menu 免疫 > 疫苗计划配置 opens the annual immunization calendar (免疫日历). The two plan lists and the create button sit in the same area.
- Actors: immunization manager (configures, enables, disables); back end scheduler (expands dates, listens to production events, builds tasks). Dispatchers and reviewers only read plans.

## Flow
```mermaid
flowchart TD
  subgraph Console
    A["Create plan button"] --> B{"Pick type"}
    B -->|"Close without choice"| X["Nothing created"]
    B -->|"Blanket"| C["Common form + date block"]
    B -->|"Batch-following"| D["Common form + trigger rule groups"]
    C --> E["Preview page"]
    D --> E
    E -->|"Back to edit"| C
    E --> F["Save"]
    F --> G["Plan list: enable switch"]
    G --> H["Plan detail + its tasks"]
    CAL["Annual calendar"] -->|"Plan card"| RO["Read-only plan view"]
  end
  subgraph Back end
    F --> I["Blanket: expand dates"]
    F --> J["Batch: listen to production events"]
    I --> K["On date or event: freeze snapshot, pick pigs, create task"]
    J --> K
  end
  K --> L["Vaccine task, pending"]
  I --> CAL
```

## Steps
**Console, create**
1. On the calendar page press create plan. A modal asks for the type, 普免 or 跟批免疫; the start button stays disabled until one is chosen, and closing the modal creates nothing.
2. Common form (both types): plan name (max 30 characters), production line, target pig group, and a pig filter (猪只筛选条件). The group is a simple pick (for example breeding sows). An advanced-settings dialog adds conditions such as age, parity, weight, breed or source, combined as ALL or ANY. While advanced conditions are applied the pig type is locked in the dialog. Changing the simple group asks for confirmation: yes clears the advanced conditions, cancel keeps them.
3. Vaccine block: choose vaccine, then brand (list limited to that vaccine; changing the vaccine clears the brand), then method, dose and unit. Picking a brand fills method, dose and unit from master data, all still editable. A vaccine with no brand cannot make a complete plan. Dose has a minimum of 0.5.
4. Review block (免疫复核) is a switch. When on it asks for target antibody (read-only, from the vaccine), sampling method, sample container, check interval in days, sampling ratio and pass threshold; see [immune-effect-review](immune-effect-review.md). Ranges are validated.
5. **Blanket only, date block:** first date (today or later), repeat switch, presets monthly / quarterly / yearly or an advanced custom rule (every N days, weekdays, day of month, "Nth weekday", months of the year), end = never or on a date (not before the first date). Alternatively manual dates. Repeat and manual dates cannot both be active. A form-level calendar preview shows the draft nodes only.
6. **Batch-following only, trigger block:** one or more dispatch-rule groups. Each group is a trigger type (before the planned start of a production task, after the actual end of a production task, or a production status) plus an offset in days. At least one group is required and the delete button is disabled on the last one. Changing the trigger type clears its sub-fields. One or more production lines scope the plan (at least one). If the offset puts the vaccination outside the vaccine's suggested age range, a warning dialog asks to confirm.
7. Next opens the preview page; back-to-edit keeps all entries. Save returns to the list. If the save fails the draft stays. The form shows no estimated pig count; it only says pigs matching at task time are added.

**Console, manage**
8. Plan list per type. Blanket columns: name, target group, vaccine over method (merged), review on/off, next vaccination date, enable switch, view. Batch columns: the same, but execution time and applicable production lines instead of next date. Brand, dose, last update and creator appear only in detail.
9. Plan detail: plan info, pig filter, vaccine info, task settings, review settings (only if on), and at the bottom the plan's tasks. The task ID opens [vaccine-task](vaccine-task.md) detail. Batch tasks show line-batch after the ID and target pigs before the date. Cancelled tasks stay listed.
10. Edit opens the form with the plan loaded; saving updates the plan, it does not add a duplicate. For the enable switch see Rules 6 to 8.
11. Calendar: 12 months for the chosen year. A date with a plan node or a real task has a marker and a count. Clicking a date opens a side drawer with that day's cards (empty state when none). A plan card opens a read-only view; a real-task card opens task detail, and back returns to the calendar. The calendar never enables or disables a plan.

## States
| Object | State | How it gets there | Allows next |
|---|---|---|---|
| Plan | draft | Form being filled (implied; named only in the old `Vaccine/vaccine prds/01-跟批免疫计划-PRD.md`) | Save |
| Plan | enabled | Save in the prototype (new plan starts enabled), or switch on | Generates tasks; disable with restrictions |
| Plan | disabled | Switch off | Re-enable; edit |
| Plan node (blanket) | scheduled date | Expanded from first date + repeat, or manual dates | Becomes a task on that date |
| Plan view | read-only | Opened from the calendar | Back only: no edit, no advanced dialog, no save |

## Rules
1. A blanket plan is calendar-driven; a batch-following plan is event-driven. They share vaccine data and the form shell but not the trigger logic.
2. The plan holds a rule, not a pig list. The back end picks the pigs from the filter at task time. A plan that matches zero pigs should not be enabled silently (the live product allows it, defect ST-04).
3. Exemption rules are not configured in the plan; the request carries an empty exemption list. See [vaccination-exemption](vaccination-exemption.md).
4. A plan keeps a snapshot of brand, method and dose. Later master-data edits never change existing plans (test VX-015). Later plan edits never change tasks already generated (VX-014); a batch plan edit affects only tasks triggered afterwards.
5. First date cannot be before today. It is a plain calendar date, not a timestamp (live defect: saved a day early, ST-01).
6. Disabling a plan with no issued tasks and no progress is allowed.
7. Disabling a plan that already has issued tasks is blocked with a "cannot disable" notice in one test case. Disabling a plan with partly executed tasks asks for confirmation and, if confirmed, keeps all generated records (VP-MASS-042..044, VP-ROU-025..026). The PRDs say only "restricted by business rules".
8. Disabling affects only future generation. Tasks already issued stay viewable and executable (VX-013).
9. The calendar and read-only views never change a plan.
10. Status words in the plan's task list are the vaccine-task ones (pending, in progress, done) plus cancelled for deleted pending tasks.
11. If date expansion from a repeat rule fails, fall back to manual dates with a notice (old PRD only). The prototype caps generation at 120 dates.
12. Required: name, line (batch), target group, vaccine, brand, method, dose, unit, first date (blanket), at least one dispatch rule (batch). Incomplete trigger rules block saving.

## Data
| Field | Where | Required |
|---|---|---|
| Plan name (up to 30 chars), type | Both | Yes |
| Production line(s) | Batch; also in the prototype blanket form | Batch yes |
| Target pig group + advanced filter (ALL/ANY) | Both | Group yes |
| Vaccine, brand, method, dose, unit | Both | Yes |
| First date, repeat rule, end rule or manual dates | Blanket | First date yes |
| Dispatch rule groups (trigger, production task or status, offset days) | Batch | At least one |
| Review config (antibody, method, container, interval default 28 days, ratio default 5 %, threshold default 80 %) | Both, optional | Only if on |
| Exemptions | Both | Always empty |

## Edge cases
- Empty calendar day: empty state in the drawer. Empty plan task list: "no related vaccine tasks".
- Batch plan with duplicate dispatch groups: nothing stops two identical groups being saved (live defect ST-05).
- Production events missing or dirty: the back end must record why a trigger could not fire (implied by `03-跟批免疫计划.md`).
- Two users editing one plan: the later save should show a conflict rather than overwrite (test VX-009; untested on the live product).
- Leaving the form midway has no unsaved-changes guard on the live product (ST-18). Cancelling the preview or the type modal keeps nothing.
- Custom monthly rule on a short month: use the month's last day (VP-MASS-026); the live product has no month-end rule (ST-17).

## Versions
- 2026-04-15 calendar opens plans read-only.
- 2026-04-23 first plan PRDs (old folder): plan states DRAFT/ACTIVE/INACTIVE, recurrence fallback; the per-plan exemption builder is replaced by back-end rules.
- 2026-05-04 to 05-22 new numbered PRDs: merged vaccine/method column, brand moved to detail, plan detail lists its tasks, cancelled tasks kept.
- 2026-07-06 test cases fix list columns, disable rules and date presets.
- 2026-07-14 and 08-18 live tests: new plans default to disabled, no estimated pig count, many data defects; verdict "do not release".

## Figma and repo
Figma file 🖥 📱 免疫 (`8BkIL2azMuBS2w6Vn26Cac`): calendar `11748:13312`, `12012:10234`; type chooser `11004:3454`; forms `11004:2810`, `11013:1050`, `11082:6919`, `11084:7544`; advanced filter `11092:10140`; lists `12053:16307`, `12053:16620`; details `11017:1896`, `11092:7263`. Two frames named 废弃 are archived. No matching `features/` folder.

## Open questions
1. Default state of a new plan: the prototype enables it on save (VP-MASS-034); the live product creates it disabled (BUG-08, 2026-07-14). No PRD says.
2. Exact disable rule once tasks exist: blocked (VP-MASS-042) versus confirm (VP-MASS-043/044), depending on how far execution has gone. The old PRD says only "restricted".
3. Is the plan state machine DRAFT/ACTIVE/INACTIVE still wanted? It exists only in the superseded `Vaccine/vaccine prds/` folder.
4. Batch plans: PRD 03 lists age as a trigger; the prototype offers events and status only (test VP-ROU-013 flags it).
5. How should "enabled with zero matching pigs" behave (ST-04)?
6. Production line appears on the blanket form in the prototype, while PRD 02 lists it only generically; unclear whether a blanket plan needs it.
