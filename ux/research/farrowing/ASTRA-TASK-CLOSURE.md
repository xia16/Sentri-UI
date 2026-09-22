# Task closure — Astra prototype, 17 September 2026

This implements the current user request and supersedes the older “no End task for event tasks” advice in lifecycle.md for this prototype.

## Farrowing

- Entry: Task overview footer, beside Back. It applies to every unit in the task.
- Task overview and End task use the same tallest drawer (32 px of the phone remains above it). Task overview is one scrollable page: Whole-task progress combines the status bar and per-unit table, followed by Performance metrics and Other outcomes. No tabs. Title and footer remain fixed; return from a review preserves the overview scroll position.
- The main card and overview show actual Farrowed counts, excluding deaths before/during birth, miscarriages and not-in-pig records. A sow whose farrowing was completed before death remains in Farrowed and the finished-litter KPI cohort. Progress uses only Farrowed + Active + Awaiting as its denominator, excluding other terminal outcomes from both the bar and unit table. The Other outcomes section below still lists recorded events (including deaths after farrowing). Original all-sow totals remain available to task closure. The default example shows 7 / 18 farrowed; its separately recorded sow death remains visible below.
- Overview sections use the existing drawer rhythm: 44 px title rows, 8 px title-to-card spacing, 24 px between sections and 16 px card padding, retained on narrow screens since the body scrolls.
- Unit rows all have the same background and left alignment. Only an inline Current tag marks the current unit.
- Other outcomes explicitly shows miscarriages and sow deaths, including zero counts. Nonzero outcomes open the affected-sow list, with return navigation to the same overview reading position. Sow death records retain whether death was before, during or after farrowing. Death timing and piglet totals are shown per sow in the death review list, keeping the overview count row clean. Piglets from unfinished litters do not enter finished-litter KPIs. If a sow dies after completing farrowing, that completed litter stays in the performance cohort. Unknown death timing is labelled rather than inferred.
- Review drawer: own “End task” header and all-unit scope. Awaiting-sow removal is the top warning, with not yet farrowed as its reason. Performance metrics shows KPIs and litter totals, scoped as N finished litters. A compact Task outcomes card accounts for all sows; sow deaths, miscarriages and not-in-pig outcomes appear as rows when recorded, not separate sections. The large drawer provides room for the complete review; narrow phones use more available height.
- KPI definitions: born alive per litter = (born − stillborn − mummified) / finished litters; stillborn rate = stillborn / born. Both use finished litters only. Current alive is displayed separately and is not used as born alive. Missing denominators display a dash. The sample batch has a configured born-alive target of 12; this is sample data, not an assumed universal target.
- Outcome records marked miscarriage or not-in-pig are excluded from awaiting, active and finished categories. The production-outcomes example includes a recorded miscarriage to exercise this rendering. No new miscarriage entry form is implemented in this round.
- Active farrowing blocks closure. Show the reason before submission with a Review route to affected sows, including their unit and pen.
- Unsaved death entries or corrections also block closure. Saved open-visit counts alone do not constitute an unsaved draft.
- Finished sows stay in the batch. Awaiting sows are explicitly warned that they will be removed from the batch when the task ends. The review row and affected-sow list use an amber warning. Do not claim their location stays unchanged: removal may lead to a transfer, whose workflow is outside this prototype. The old reference's batch-removal purpose is retained, without its typed-count or checkbox ceremony.
- Sow deaths are accounted for separately, not described as finished sows staying in the batch.
- Final End task rechecks all units. Cancel/back leaves the task untouched. A receipt records who/when, disposition totals and calculated performance at closure, including recorded production outcomes. Today then opens that receipt rather than an editable closed task.
- The final End task button requires an 850 ms hold, matching the existing finish/save control. A simple tap or short Enter/Space press does not submit. Releasing, cancelling the pointer, leaving focus, changing views or pressing Escape cancels the hold. The Task overview entry opens review with a normal tap.
- Receipt totals describe the closure event; underlying sow and piglet records remain live. This is not the Heat Check location/result snapshot model.
- In-memory demonstration only: batch disposition is represented by a marker, not a backend transfer. Reload resets the examples. Scenario selector includes active-blocked, awaiting-remainder and all-finished cases.

## Heat Check — required for later implementation

User clarification: completed Heat Check results must preserve **where the pig was marked in heat**, even if a transfer task follows and the pig later moves. For example, history must still show “marked in heat in Unit 4” although the pig is now in Unit 6. This is historical result attribution, not a claim about the animal's current location or a movement-tracking feature.

Capture the unit/pen alongside each recorded verdict, with its animal identity and recording time. At task completion, retain these result records and their original unit grouping, plus task/run identity, completed-at, completed-by, and aggregates derived from those records. Do not replace the result's location with the animal's location at closure if a transfer has already occurred. Historical task results do not follow subsequent movements or join against the animal's current unit/status. Transfer tasks are a separate workflow; no movement tracking is needed in this results view.

Later corrections must remain attributable and must not silently rewrite the original completion evidence. Exact correction workflow is still to be designed.

Do not apply this location/result snapshot requirement to Farrowing. No Heat Check implementation is changed in this round.

Performance metrics uses the same shared renderer in the overview, End task and receipt. The title names the information type; the right-side N finished litters identifies its cohort. The unit table and reading cards share outer widths and 16 px horizontal content insets.
