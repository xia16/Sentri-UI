# Production line setup (生产线)

| | |
|---|---|
| Area | [Transfers, feed, production lines, legacy design system](../transfers-feed-lines-legacy.md) |
| Platforms | Console (create, edit, templates); back end (batch generation, task dispatch); Mobile only receives the result |
| Maturity | seen on the live product only (July dev page, broken), plus a designed Figma create form and an Onboarding demo step. The concept is specified in the Primer; the lifecycle is not specified anywhere. |
| Newest sources | `General copy/Production Lines/探索式测试报告-2026-07-28-生产线.md` (2026-07-28); `OnBoarding/sentri-react/src/pages/console/onboarding/steps/StepProductionLine.tsx` (2026-07-03); `General copy/Sentri_Primer.md` s5 (2025-11-28); `OnBoarding/sentri-react/docs/PRD-Onboarding.md` s2.3 |
| Related flows | [pig-transfer](pig-transfer.md), [feed-requirement](feed-requirement.md), [cull-review](cull-review.md), [offline-production-tasks](offline-production-tasks.md) |

## Job
A manager defines a production line: which sections it covers, the rhythm of its batches, a production plan template (task sequence), KPI thresholds and a transfer plan. When saved, the system generates batches on the line's interval and dispatches each batch's tasks to mobile. Done means batches and their tasks appear without further setup.

## Trigger and actors
- **Farm manager** on Console 生产 > 生产线 (`/console/production/line`), or on the skippable Onboarding step after the farm layout (flow: layout, production line, add pigs, add staff, finish; Skip or Finish only).
- **System** creates batches (type "System") when a line's interval comes round and at least one eligible pig exists; a manager may also add a batch by hand.
- **Farmhands** see tasks on mobile when the estimated start is reached; they never edit a line.

## Flow
```mermaid
flowchart TD
  subgraph Console
    A[Production lines page] --> B[Create line form]
    B --> B1[Name, covered sections, max sows per batch, first batch week]
    B1 --> B2[Select or create production plan template]
    B2 --> B3[Select or create task KPI template]
    B3 --> B4[Select transfer plan]
    B4 --> S[Save line]
  end
  subgraph Back end
    S --> G{Interval reached and at least one eligible pig?}
    G -- yes --> N[Create batch: copy of plan template]
    G -- no --> W[Wait]
    N --> D[Tasks dispatched, hidden until estimated start]
    N --> TR[Transfer plan may create transfer tasks]
  end
  subgraph Mobile
    D --> M[Task visible to farmhands at estimated start]
  end
  S -.not defined.-> LC[Edit, pause, deactivate, restore, archive]
```

## Steps
1. Manager opens the line list. In July the page showed only three header entries and no list, empty state or status (BUG-10).
2. Manager opens the create form (Figma has default and edit states). Fields: 生产线名称 (required); 生产线覆盖区块, a dropdown of sections (required); 每批次配种母猪数量上限 (optional); 预计首批开始日期, a year and week picker (required; the current week and the next are disabled); 生产计划; 任务KPI; 转舍计划.
3. 生产计划 offers select-template or create-template pages. A plan template is the ordered task list with dependencies; optional tasks (return check, pregnancy check, piglet handling, postpartum exam) are toggled on the template, not per batch.
4. 任务KPI offers standard KPI templates or a custom one, with a KPI detail dialog. Optional; may be configured later.
5. 转舍计划 selects a transfer plan template. Help text: it sets when pigs move, rules by production status, task or node, and creates tasks automatically when conditions match. The Onboarding demo just prompts for a name. No form for creating one is indexed.
6. Save. The line exists; the first batch is generated at the chosen week and later ones by the line's interval. The batch list shows creation type System or manual.
7. Each batch gets a copy of the plan template at creation. Tasks dispatch on batch creation and are visible to farmhands from the estimated start.

## States
| Object | State | How it gets there | Allows next |
|---|---|---|---|
| Line | exists | save | batches generate (the only state the sources confirm) |
| Line (proposed) | draft, planned, running, paused generation, deactivated, archived | test report s6 only | deactivation stops future generation, never edits history |
| Batch | System or manual | interval or a manager | closed by final task plus all pigs out, or manager end (Primer s5.5) |
| Plan template | current | edited on the line | affects future batches only; active batches keep their copy |

## Rules
1. A line groups one or more zones or sections and may cover the whole cycle or only some stages (Primer s5.1.1).
2. Auto batch creation needs at least one eligible pig: a production sow or female breeder, above minimum age, not culling-flagged, in no active batch, and located in a section of the line (Primer s5.1.2).
3. One template per line; template changes touch future batches only.
4. First-batch week: current and next week are disabled (2026-07-28 build); the reason is unexplained (BUG-13).
5. Week numbering on the live page was not ISO at year end and in leap years (BUG-02, BUG-08).
6. The required section dropdown had no options, so no line could be created (BUG-03).
7. Line name accepted digits only on the live page ("start from 1"), though the Console launchpad and mobile cards show alphanumeric names; 60 digits were accepted (BUG-09).
8. Max sows per batch accepted negatives, letters and emoji (BUG-07). Intended: a whole number.
9. Reload during creation lost everything, with no draft (BUG-05); the language switched to English on reload (BUG-06).
10. Batch number `0001` repeated across lines and search did not find it (BUG-04, BUG-11); the report suggests `line-batch` ids.
11. A removed line must not orphan batches; with history, deletion should be blocked (report s6, proposed).
12. Onboarding submit needs name, section and first-batch week (code `canSubmit`).

## Data
| Field | Where | Required? |
|---|---|---|
| Line name | create form | yes |
| Covered sections | create form | yes |
| Max sows per batch | create form | no |
| First batch start (year, week) | create form | yes |
| Production plan template | create form | in Figma and live page; not required in Onboarding |
| Task KPI template | create form | optional |
| Transfer plan template | create form | optional |
| Batch interval, wean age (if weaning is included) | line, per Primer | not shown in indexed screens |

## Edge cases
- Empty list: no empty state; no lifecycle actions (BUG-10).
- Orphans: dev data had 8 batches pointing at three lines that the list did not show (BUG-01).
- Narrow window: the table was 1,795 px wide at 390 px and the action column sat near 1,700 px (BUG-12).
- Not tested: edit, stop, restore, delete, retry idempotency, permissions, concurrency, offline.
- The report lists eight auto-generation scenarios to test with virtual time: once only, ten retries, downtime catch-up, deactivate then restore, edit scope, year and leap boundaries, optimistic lock, auto against manual on the same week.

## Versions
- 2025-11-28: Primer defines line, batch and plan template.
- 2026-07-03: Onboarding adds the line step with a transfer-plan field (demo).
- 2026-07-28: exploratory test of the live Console page: 13 findings, 1 blocker, 2 critical; "not recommended for acceptance".
- Proposed in the report, not adopted: lifecycle states, versioned config with a from-this-batch scope, impact preview of 8-12 future batches, a three-step create flow with drafts.

## Figma and repo
Web Figma `hRZQbmxWMPSBZYCDkvm5dY` 创建生产线: default `39:3685`, edit `60:4620`, select template `60:13260`, create template `83:3082`, create KPI template `60:13365`, KPI detail `83:3969`. Also `qSEc0RElNQUMWYkX30jVgr` (`1359:9198`, `1359:14129`, content not checked). `[Web] 生产线` (`DlcLGqx61y44IVEvonQBJR`) is a cover only. No transfer-plan screen is indexed. Repo: no feature; `features/workbench` shows only line or batch labels on tasks.

## Open questions
1. What states can a line be in, and what may be edited after batches exist? Only the test report proposes anything.
2. Week standard: ISO or a farm calendar? Primer is silent; the live page is wrong at year end.
3. Name rule: digits only (live page) or free text (mock data and mobile cards)? Batch numbering global or per line?
4. Who builds the transfer plan, and where is its UI? Field help exists; Figma has no screen.
5. Is the two-week freeze on the first batch week a business rule?
6. Which Figma home is authoritative: the Console setup file, the 猪舍、猪只 file, or the empty `[Web] 生产线` file?
