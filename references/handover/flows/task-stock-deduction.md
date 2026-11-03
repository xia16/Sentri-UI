# Automatic deduction from tasks and events (任务/事件自动出库)

| | |
|---|---|
| Area | [Inventory (库存)](../inventory.md) |
| Platforms | back end (no screen of its own); Mobile task pages submit the usage; Console shows results in the ledger and risks |
| Maturity | specified only (back-end rules); the prototype is front-end memory only |
| Newest sources | `Inventory management/Inventory PRD/06-库存出库后端逻辑.md` (2026-08-19); `Inventory management/Inventory PRD/修改日志/修改日志-2026-08-19-库存出库后端逻辑文档.md`; `Inventory management/Inventory PRD/02-Mobile库存管理PRD.md` s2, s10 (2026-09-09); `Inventory management/Inventory PRD/01-Console库存管理PRD.md` s7.2, s10 |
| Related flows | [vaccine-task](vaccine-task.md), [treatment-task](treatment-task.md), [feed-stock-reconciliation](feed-stock-reconciliation.md), [stocktake](stocktake.md), [scrap-expired-batch](scrap-expired-batch.md), [negative-stock-correction](negative-stock-correction.md), [manual-issue](manual-issue.md), [stock-overview](stock-overview.md) |

## Job
Stock goes down when a confirmed business event happens, never because a person edits a number. The field user only does their task; the system turns the task result into batch deductions and ledger rows, and never blocks the task when stock is short.

## Trigger and actors
| Source | Trigger | Quantity basis | Business type |
|---|---|---|---|
| Feed plan | the plan's scheduled run time on the day arrives (not on create, edit or publish) | the day's planned quantity per SKU line | feed-plan consumption |
| Vaccine task | task completed (early end allowed) | sum of confirmed actual usage, not the plan | vaccine usage |
| Veterinary treatment task | task completed or ended early | per-pig actual treatment records summed, never the prescription maximum | veterinary drug usage |
| Stocktake shortage | difference confirmed | counted minus effective book | stocktake loss |
| Scrap | scrap confirmed | confirmed quantity, a specific batch | scrap |

Actors: system scheduler (feed), field staff and treatment staff (completing tasks), storekeeper (scrap, count). Manual issue is outside this design ([manual-issue](manual-issue.md)).

## Flow
```mermaid
flowchart TD
  subgraph Sources
    A[Feed plan run time reached] --> E
    B[Vaccine task completed] --> E
    C[Treatment task completed / ended early] --> E
    D[Count loss confirmed / scrap confirmed] --> E
  end
  subgraph Back end
    E[Resolve quantity] --> F[Check SKU, unit, idempotency key]
    F -->|fails| X[Reject whole event, no change]
    F --> G[Convert to accounting unit]
    G --> H{Batch material?}
    H -->|yes| I[FEFO over batches with stock]
    H -->|no| J[Deduct total]
    I --> K{Enough?}
    J --> K
    K -->|no| L[Shortfall to material negative stock]
    K -->|yes| M[One transaction commits]
    L --> M
    M --> N[Ledger change detail + source state done]
  end
```

## Steps
1. Plans, prescriptions and tasks are created and executed with no stock effect; actual usage may be recorded repeatedly during a task.
2. At the trigger the source sends: source type and ID, line ID, SKU, quantity, unit, settlement time and an idempotency key.
3. Back end rereads the latest stock, resolves SKU, converts the unit, and locks the SKU (then candidate batches in FEFO order).
4. Deducts from batches in FEFO order (expired but unscrapped batches included); shortfall goes to material-level negative stock with no fake batch; feed deducts the SKU total.
5. In one transaction it writes SKU stock, batch stock, negative stock, source status and the change detail, then returns the shortfall so risks can show it.
6. A repeated delivery returns the first result and detail IDs without deducting again.
7. Mobile: task pages (vaccination, treatment, feeding, breeding) carry material ID, amount and unit from the material's unit system; no separate issue step.

## States
| Object | State | How it gets there | What it allows next |
|---|---|---|---|
| Feed plan line | pending / processing / completed / failed / cancelled | schedule, transaction result | failed can retry; cancelled before run: no deduction |
| Vaccine / treatment task settlement | in progress / completed + settled / failed | task completion | one settlement per completion version |
| Count difference | pending review / processing / completed / cancelled | count confirmation | stock changes only at completed |
| Scrap order | draft / pending confirmation / processing / completed / rejected | request, confirm | stock changes only at completed |

## Rules
1. No deduction for creating or publishing plans, prescriptions or tasks, or during execution.
2. Example quantities: plan 100 ml, actual 92 ml -> deduct 92 ml; treatment records 0.50 + 0.75 + 0.25 ml -> deduct 1.50 ml, not 3 pigs x 3 doses x 0.25 ml.
3. A usage record with no resolvable SKU, a non-positive quantity, a stopped or missing SKU, or an unconvertible unit rejects the whole event; no partial deduction.
4. Idempotency keys: feed plan + execution date + line; vaccine / treatment task + completion version; count + difference + resolution version; scrap + order + confirmation version.
5. Stock never blocks the event; the gap raises negative stock and a risk.
6. Count loss and scrap are not counted as consumption in usage statistics.
7. Only batches with remaining stock participate; scrap names the batch, loss deduction does not.
8. Same SKU is serialised; batch rows use version or remaining-quantity conditions; a count uses snapshot plus changes confirmed during the count.
9. Ledger fields: record type outbound, business type, source type/ID, line ID, SKU, batch, quantity, unit, before/after stock (after can be negative), time, operator (system for automatic events), idempotency key, remark.
10. Treatment tasks do not deduct per record; a real-time design would need an incremental settlement cursor.

## Data
Per-source extra fields: feed plan (plan, date, execution date, line, planned quantity); vaccine task (task, plan, actual quantity, completed time); treatment task (task, prescription, animal records, actual count and quantity); count loss (count, snapshot, effective book, actual, loss); scrap (order, reason, method, quantity, operator). All five sources share the common ledger fields above.

## Edge cases
- Task finished early: only confirmed usage deducts; the rest of the plan is ignored.
- A record added after completion does not deduct again; it falls to a reversal rule that is not yet defined.
- Task cancelled, treatment record corrected, vaccine task rolled back: no reverse rule.
- Transaction failure: everything rolls back and the source can retry.
- Feed with a scale reading that cannot match a plan: handled in [feed-stock-reconciliation](feed-stock-reconciliation.md).

## Versions
- 2026-06-17: negative stock at material level and FEFO set as principles.
- 2026-06-24..07-10: manual issue was the main outbound path.
- 2026-08-19: back-end rules written for feed plan, vaccine, treatment, count loss, scrap.
- 2026-09-09: Mobile PRD restates tasks as automatic deduction, not issue pages.

## Figma and repo
Not in Figma. `features/treat/PRD.md` says stock, batch numbers and expiry "belong to future inventory"; `features/feed-plan` defers inventory; vaccination tasks live under `pig-profile`. No feature in `features/` calls a stock service.

## Open questions
1. Is feed deducted per SKU total only or with back-end batch FEFO (`06` s7)?
2. Reversal for cancelled tasks, corrected records, late-added usage (`06` s5.5, s7).
3. Does a new receipt offset material-level negative stock?
4. Cost basis of deductions: moving average vs actual batch cost (`03-库存模块决策记录.md`).
5. Disinfection (物资消杀) on Mobile picks "disinfection supplies": no source says it deducts stock or from which category.
6. The Mobile PRD says task pages must tie to a material ID but the vaccine and treatment PRDs have no such text; `features/treat` records medicine from a farm list, not stock materials.
