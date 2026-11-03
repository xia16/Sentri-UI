# Pig transfer (转舍 / 转栏)

| | |
|---|---|
| Area | [Transfers, feed, production lines, legacy design system](../transfers-feed-lines-legacy.md) |
| Platforms | Mobile (single and mixed move, designed); Console (transfer orders, menu entry only); back end (plan rules, implied) |
| Maturity | specified + built in prototype (mobile single-pig and mixed move only); the group transfer task is implied and seen as menu copy only |
| Newest sources | `General copy/Sentri_Primer.md` s4.3 (2025-11-28); `OnBoarding/sentri-react/src/pages/console/onboarding/steps/StepProductionLine.tsx` (2026-07-03); `Sentri-UI/ux/system/workflows/place.html` (2026-09-22, same as the repo); `Vaccine/sentri-console-launchpad.html` (2026-08) |
| Related flows | [pig-exit-and-sale](pig-exit-and-sale.md), [production-line-setup](production-line-setup.md), [cull-review](cull-review.md), [mobile-vaccination](mobile-vaccination.md), [offline-production-tasks](offline-production-tasks.md) |

## Job
A stockperson moves one pig, several pigs, or a counted group of un-identified head to another pen or unit; the system records the new location, keeps the location history, and the pen counts follow. A second, planned kind is meant to be generated from a production line's transfer plan for a whole batch.

## Trigger and actors
- **Single or mixed move (mobile):** the worker selects pigs or a group row on a pen/unit walk, or opens one pig's record, and chooses Transfer. Implied by Primer s4.3 and `place.html`.
- **Group transfer task (back end, then Console and mobile):** the transfer plan chosen on a production line fires when its rule matches a batch (rule is "by production status, task or node", per the Onboarding field help). Nothing says who may edit a plan.
- **Console order (转群单):** a manager opens 猪群管理 > 猪群流转 > 转舍 to start and follow orders. Menu copy only (`Vaccine/sentri-console-launchpad.html`).
- Other actors: the vaccination rule engine reads the move (see Rules 8).

## Flow
```mermaid
flowchart TD
  subgraph Back end
    P[Production line has a transfer plan] --> R{Rule matches a batch?}
    R -- yes --> T[Auto-create transfer task]
  end
  subgraph Console
    O[Transfer orders list: source pen, destination pen, head moved]
    T -.implied.-> O
  end
  subgraph Mobile
    S[Select pigs or group row] --> V[Transfer sheet: destination picker]
    T -.implied.-> V
    V --> D{Selection type}
    D -- tagged only --> C1[Tap pen commits]
    D -- tagged + head --> M[Per-record verdict + batch steppers]
    M --> C2[Primary button commits]
  end
  C1 --> U[Location + history updated; cards re-derive]
  C2 --> U
  U --> X[Vaccine exemption window 0-5 days starts]
  U --> Q[Queued offline in transferTask store]
```

## Steps
**Mobile, designed (`place.html`, repo `features/move`)**
1. Worker selects tagged pigs, a group row, or both. A single pig can also start from her record.
2. The Transfer sheet opens on a destination Picker. The current unit's pens come first, the source pen is dimmed ("where they are now"), pens are grouped under unit headers with the full path on cross-unit results. Search reaches any pen; a scan reads a pen plate. An empty pen prints dashed.
3. Tagged pigs only: tapping a pen commits and closes. The sheet header restates the scope; there is no extra confirmation dialog and no toast.
4. Mixed selection: tagged pigs move as placement events, un-identified head move as a count. For each open group record on the source pen (a treatment, a condition) the worker picks Stays, Goes or Both (default Stays; the list folds to a footnote when the whole population leaves).
5. If the moved head come from several batches, one stepper per batch must sum to the number moved. One batch rides silently.
6. After commit the source pen card re-derives down and the destination up. These counts are the receipt.

**Group transfer task (implied, not specified)**
1. A batch reaches the plan's trigger (status, task or node). The system creates a transfer task tied to the batch (Primer s4.3, item 2).
2. The task shows on the Console order list and as a mobile task card; the demo card sits beside vaccination and weaning-check cards (`Vaccine/docs/MOBILE_FIELD_LAYOUT.md`).
3. Worker executes it with the same destination picker (implied). On completion each pig's location and history update "automatically" (Primer).

## States
| Object | State | How it gets there | Allows next |
|---|---|---|---|
| Pig / group | In pen A | default | Transfer |
| Pig / group | In pen B (history keeps A) | sheet commit or task completion | Transfer again; any other verb |
| Transfer task | Planning, In Progress, Ended | implied by Primer s5.2 (that lifecycle is written for production tasks only) | Ended is locked, read-only |
| Lactating sow | Lactating to Empty | `Pig_Status.md`: when she is "no longer in a pen with piglets" | unclear whether a move triggers it (Open question 4) |

## Rules
1. Single-pig transfer has "no restrictions" on destination (Primer s4.3). Source: Primer.
2. Every transfer updates the current location and keeps history. Source: Primer.
3. An identified pig's records (cases, treatments, marks) travel with her silently. Group records stay on the pen unless the worker says Goes or Both. Source: `place.html`; `ux/research/ops/place-identity.md` (repo).
4. A pen's un-identified count is partitioned by (line, batch); a multi-batch move must name which batches shrink. Source: `place.html` (repo `features/move`).
5. The sheet is the confirmation. Production's older dialog and full confirm page were cut. Source: repo `features/move/PRD.md`.
6. Destination capacity: the culling brainstorm blocks an internal transfer into a full pen (`brainstorm/&&sale.md` s12). No transfer source states a capacity check for ordinary moves (Open question 1).
7. Plan rules and the group task's fields are implied only: trigger by status, task or node; auto-create when matched (Onboarding field help, `StepProductionLine.tsx`). Source: that file; Primer s4.3.
8. Downstream: a transfer, house move or merge opens a 0-5 day vaccination exemption window (first of the fixed backend rules in `Vaccine/vaccine prds/06-后端强制豁免规则-PRD.md`, 2026-04-23). The window blocks nothing by itself; the worker may still vaccinate and the override is logged.
9. A pig not in the current batch is blocked from that batch's task; a pig in the batch but in another unit is allowed (Primer s4.2). Applies to the picker's scope when a task started the move (implied).
10. Inventory does not move on a pig transfer (Inventory PRD 01/02/06 never mention it).
11. Offline: the live app has a `transferTask` offline store; transfer is not an auto-dispatched production task (`Vaccine/docs/offline-test-2026-09-03/...离线能力多角色专项.md`).

## Data
| Field | Where | Required? |
|---|---|---|
| Subjects: tagged pigs, group row with head count | Selection | yes |
| Destination pen (unit pinned first) | Picker | yes |
| Verdict per open group record (Stays/Goes/Both) | Mixed sheet | only if head move and source has open records |
| Head per batch | Steppers | only if head come from several batches |
| Transfer plan id/name | Production line | optional on the line |
| Order fields: source pen, destination pen, head moved | Console order | menu copy only |

## Edge cases
- Whole population leaves: the records checklist folds to a footnote.
- Source pen dimmed in the picker, so a no-op move cannot be picked.
- Mixed selections combine two behaviours in one commit; partial failure is not described.
- Offline: moves queue in the `transferTask` domain; conflict policy for two workers moving the same pig is not written (Primer s5.2 says "last upload prevails" for tasks).
- Production's older "move or copy health data" choice (path B) is replaced by Stays/Goes/Both; the "copy" outcome has no equivalent.

## Versions
- 2025-11-28: Primer defines the two transfer types.
- 2026-01 (Figma label): single-pig transfer from heat check, 4 screens.
- 2026-07-03: transfer plan appears as a production-line field in the Onboarding demo.
- 2026-08-25: Console menu moves 转舍 under 猪群管理 > 猪群流转.
- 2026-08-27: `place.html` deck enters the repo; the handover copy (2026-09-22) is identical.

## Figma and repo
- Mobile Figma `4GZGPBauEOWQQjnRrzoUgF`: 记录-转移 (section `60:408`), 查情 转移单头猪 (`7561:10830`); dialogs `296:1133`, `612:2414`, `749:4264`.
- Web Figma `MufYKeR3oCVDyppB3FmlNV`, node `3421:7768`: 转舍 drawer under 今日进度 (900 wide).
- Repo `features/move` (draft): five screens, all `in-design`, built from `ux/system/workflows/place.html`. It covers the mobile move only. The group task, plan rules and Console order list have no design. Repo Workbench "Other" shows rows such as "Move to Farrowing, Unit 6" with a batch label, which is the nearest thing to a task card.

## Open questions
1. Does capacity apply to ordinary transfers? Primer s4.3 says "no restrictions"; `&&sale.md` s12 blocks a full destination for internal transfer.
2. What triggers a group task and what does the plan hold (destination choice, who executes)? Only the Onboarding field help and a demo prompt exist.
3. How does a Console 转群单 (counts) become mobile work, when the mobile deck is per pig? Launchpad copy vs `place.html`.
4. Does moving a lactating sow out of the farrowing pen change her status (Lactating to Empty), or only a recorded wean? `Pig_Status.md` s5.3.
5. Do transfer tasks follow the Planning/In Progress/Ended rules? Offline test report lists the store but not the lifecycle.
6. Should "copy records" survive? Production path B had it; the deck drops it.
