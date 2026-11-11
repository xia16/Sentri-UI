# Move 转舍 — operations inventory and 95% cut

This inventory is for a **mobile move of pigs between registered pens or units**. `S` means a source describes the operation, not that the owner has approved the draft. `I` is a reasoned scenario, not a measured farm frequency. The old transfer deck, current five `in-design` screens, [place and identity research](../../ux/research/ops/place-identity.md), [synthesis](../../ux/research/ops/SYNTHESIS.md), and [handover](../../references/handover/flows/pig-transfer.md) are the baseline. Product questions and affected screens are in [decisions.md](decisions.md).

| Operation | How often | At stake | Recorded? | Where | Least UI | Reason |
|---|---|---|---|---|---|---|
| Move one identified pig from its record | S — PRD Scope and move.transfer-sow | Wrong animal or destination | yes | here | Show animal and origin, choose destination, commit once | |
| Move several identified pigs from a pen selection | S — place.html slide 1 and PRD Scope | Some pigs left behind or moved twice | yes | here | Selection scope and one destination with one primary | |
| Move a counted group of unidentified pigs | S — place-identity §2.1 | Wrong pen population and batch count | yes | here | Select head count, destination and conditional group facts | |
| Move identified pigs and unidentified head together | S — place.html slide 3 | Split result or count drift | yes | here | One review showing both populations and one commit | |
| Open transfer from Inspection or another host action | S — Lookup card, owner 2026-10-20 | Selection lost between screens | derived | here | Host passes selected subjects and returns to its list | |
| Choose another pen in the current unit | S — feature.json move.picker | No-op move or wrong pen | yes | here | Current unit first, source pen unavailable | |
| Find a pen in another unit | S — place.html slide 2 | Wrong unit with duplicate pen code | yes | here | Search with complete location path | |
| Scan a pen plate to choose destination | S — place-identity §2.1 | Scan maps to wrong or ambiguous pen | yes | here | Scan entry and exact matched pen with path | |
| Check an empty destination pen | S — feature.json move.picker | Worker misses a suitable empty pen | derived | here | Empty state on pen choice | |
| Decide where each open group record belongs | S — PRD Rules and move.mixed | Condition or treatment attached to wrong population | yes | here | Per-record Stays, Goes or Both verdict | |
| Move the whole unidentified population | S — feature.json move.mixed | Open records stranded on an empty source | yes | here | Show all-head scope and record verdict summary | |
| Split moved head across multiple batches | S — synthesis §4 and move.mixed | Wrong batch membership or count | yes | here | One stepper per source batch; total equals moved head | |
| Move a single-batch unidentified group | S — PRD Rules | Extra allocation step slows routine work | yes | here | Carry known batch without another choice | |
| Review source and destination after saving | S — move.after and PRD Rules | Worker cannot tell which move was accepted | derived | here | Updated location and counts where visible; feedback follows current law | |
| Keep location history for a moved identified pig | S — handover Rules 2 | Later worker cannot trace where pig went | yes | here | Readable movement entry on the pig record | |
| Leave a draft and return before saving | I — mobile Back and interruption are normal | Accidental transfer or lost selection | no | here | Back leaves without committing; return restores or clearly discards draft | |
| Double tap the commit control | I — gloved touch and slow network | Duplicate placement and count changes | yes | here | One pending operation and one result | |
| Save while offline and later reconcile | S — handover Edge cases, transferTask store | Local move mistaken for shared farm location | yes | here | Distinguish saved on phone from confirmed on farm | |
| Handle a failed or partly accepted mixed move | I — mixed payload and unreliable network | One side moves without the other | yes | here | Keep explicit pending or failure state; atomic result is Q5 | |
| Handle another worker moving the same pig first | I — multiworker farm and handover conflict gap | Wrong location or overwritten history | yes | here | Show conflict and recoverable record; policy is Q5 | |
| Correct an accepted move to the wrong pen | I — mistaken pen or scan can occur | History and counts stay wrong | yes | here | Record a correction linked to the first move; authority is Q6 | |
| Move a lactating sow away from piglets | S — handover Open question 4 | Wrong production status or litter relationship | yes | here | Show movement effect before commit; status rule is Q4 | |
| Check a destination at capacity | S — handover Open question 1 cites conflicting sources | Overcrowding or an unjustified block | derived | here | Capacity signal or block, according to Q1 | |
| Open a scheduled transfer task from Workbench | S — handover describes implied task and Workbench entry | Worker cannot find assigned move | derived | handoff:workbench | Task row opens the identified move context; execution contract is Q2 | |
| Review offline upload and rejected record | S — Data sync PRD and owner feedback law | Worker assumes farm accepted a local move | derived | handoff:data-sync | Task-scoped pending and rejected record | |
| Move piglets between litters or crates in farrowing | S — farrowing and piglet-processing PRDs | Litter counts use a different ledger | yes | handoff:piglet-processing | Use the litter Move flow and its own count reconciliation | |
| Create or administer Console transfer orders | S — handover Console menu only | Orders and permissions have no agreed contract | yes | not supported | | Separate Console product scope; Q3 asks how it hands off to mobile |
| Configure production-line transfer plan rules | S — handover Onboarding field help only | Automatic task creation has no agreed trigger or ownership | yes | not supported | | Needs its own planning contract; Q2 records the dependency |
| Transfer pigs off the farm | S — handover distinguishes pig exit and sale | Exit changes lifecycle and inventory | yes | not supported | | This is an exit operation with different identity and permission rules |
| Move feed or other inventory with a pig transfer | S — handover Rule 10 says inventory does not move | False stock movement | no | not supported | | Inventory is not part of a pig placement event |

The `not supported` rows are a cut for this mobile feature, not a claim that the product never needs those jobs. Q2 and Q3 keep the cross-platform dependencies visible.
