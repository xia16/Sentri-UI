# Operations inventory (template)

Copy this table to `features/<id>/operations.md`: one row per real-world operation around the job, from the baseline (the old Figma flows, the current screens, the PRD and research). It is step 1 and 2 of [the scenario framework](README.md#the-scenario-framework): the inventory, then the cut. Agents fill it in and the owner reacts in the review.

| Column | What goes in it |
|---|---|
| **Operation** | What a farmer does or meets, in a few words: routine work, an exception, a correction, a handoff, something that goes wrong. Unique within the feature. |
| **How often** | Starts with **S** (sourced) or **I** (inferred), then why: the source for S (a ruling, research, the old flows), the reasoning for I. For example `S — every farrowing (PRD Rules)` or `I — rare on commercial farms`. |
| **At stake** | What goes wrong if it is missing or wrong: the number, the animal, the record, the money. |
| **Recorded?** | Does the system keep a record of it: `yes`, `no`, or `derived`. |
| **Where** | Exactly one of `here`, `handoff:<feature>` (a link to that feature, not a copy) or `not supported`. |
| **Least UI** | For `here` and `handoff`, the least UI that covers it: no new top-level actions, no heavy infrastructure. Empty for `not supported`. |
| **Reason** | For `not supported` only: why it is below the 95% line (rare, noisy or needing heavy infrastructure). Only a high-stakes operation that needs heavy infrastructure becomes a decision ticket instead. |

The PRD's `## Not supported` section must name every `not supported` operation, as written here. `node scripts/scenario-ledger.mjs <feature> check` verifies the table is well formed and that the PRD names them all; `node scripts/feature-state.mjs <feature>` holds the scenarios step open until it does.

| Operation | How often | At stake | Recorded? | Where | Least UI | Reason |
|---|---|---|---|---|---|---|
