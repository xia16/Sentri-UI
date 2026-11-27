# Inspection recount scenario tree

The scope for this round is the Inspection recount. Sources are [canvas.md](canvas.md), the [Count PRD review](https://github.com/xia16/Sentri-UI/blob/b77b35ea/features/count/PRD.md#owner-rulings-on-the-scenario-attack-2026-11-05-scenario-attackmd) and its [scenario review](https://github.com/xia16/Sentri-UI/blob/b77b35ea/features/count/scenario-attack-2.md).

## 1 · Walk through one unit (C)

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| C-1 | Inspection pen page | Count | → open that pen with no tag selected | S — boards 1, 6 | |
| C-2 | Unit map | Recount, choose an empty pen | → enter zero or a positive observed count | S — board 5 | |
| C-3 | Pen count | Search, confirm known tag; repeat scan or untick | → one entry per ear tag and removable misread | S — boards 6–8 | |
| C-4 | Pen count | Total below confirmed tags | → keep the draft, wait for a consistent count | S — Count PRD counting order | |
| C-5 | Pen count | Done, re-open the same pen | → stage, then edit the same observation | S — boards 5, 7 | |
| C-6 | Unit round | Finish with no changes | → save to Pen log without a balance sheet | S — boards 5, 13 | |
| C-7 | Unit round | Confirm external tag and miss an original one, same total | → separate found and unconfirmed rows with locations | S — boards 9–12 | |
| C-8 | Review | Back, correct suspect tag | → same round, choose pen and review again | I — review Back and staged map | |
| C-9 | Partial count | Difference of untagged pigs with uncounted pens | ? Q1 | S — Count PRD P26 and scenario review N7–N10 | |
| C-10 | Review | Save an unconfirmed tag | ? Q2 for its downstream placement and lifecycle; show the original pen and a discrepancy in the preview | S — board 11 and conflicting Count PRD sections | |
| C-11 | Pen count | Confirm tag on an active move into the unit | ? Q3 | S — 17 Nov canvas note and open task reconciliation | |
| C-12 | Draft on a phone | Reload, go offline, or another worker saves | ? Q4 for native durability and conflicts | I — required for a real inventory write | |

## 2 · Open decisions

- Q1. Partial anonymous difference: the 5 Nov example moves +2 against one skipped pen, D5. For several pens or batches, recommend using only eligible untagged pigs of the same known batch, showing every proposed adjustment as inferred, and leaving the uncovered remainder as a discrepancy. A silent inferred adjustment is blocked in the prototype preview.
- Q2. Missing read: save the observation and batch discrepancy with the original pen. Recommend a last-known location plus an explicit unconfirmed state on the pig record and pen roster; no automatic Missing/Death. Confirm whether the live roster subtracts it immediately. The preview keeps the registry location and displays the observation separately.
- Q3. Open incoming move: recommend counting actual location and routing task progress reconciliation to its owner, so one physical arrival is not booked twice. Neither task commands nor progress are part of this branch.
- Q4. Interrupted/conflicting writes: recommend keeping a draft with observation time, distinguishing local from synced, and surfacing named location conflicts rather than accepting two writes silently. This preview uses one in-memory sample.
