# Inspection actions: individual and bulk

The selected pigs are the subjects of each record. Selecting a pen selects its current pigs; it does not create a separate pen-level health or feed record.

## Layout

- One pig: a short measurement/note drawer or a medium health/treatment drawer. No redundant pig list.
- Multiple pigs: a tall drawer with a scrolling pig list above anchored shared controls and Save.
- Each row previews the change. A checkbox excludes that pig. Ineligible pigs remain visible with an explanation.
- Back discards the draft. Save applies only valid changed rows; invalid entered readings block the whole save.

## Action audit

| Action | Individual | Bulk |
| --- | --- | --- |
| Current task, including Farrowing | Show the pig’s current task | Hidden, even when selected pigs share a task |
| Production, litter, movement and death actions | Existing individual workflow | Hidden; no accidental single-pig dispatch |
| Disease or symptom | Choose findings and care | Same findings for included pigs; existing findings retain their dates |
| Edit conditions | From the finding | Choose a condition; edit care for pigs carrying it |
| Care instructions | Select condition and care | Apply to matching conditions; other pigs unchanged |
| Resolve conditions | Recover or correct a finding | Preview affected pigs; archive matching findings only |
| Record treatment | Medicine, method, unit and dose | Shared details and starting dose; dose can differ by pig |
| Weight / temperature | One reading and optional note | Separate readings; blank rows stay unchanged |
| Backfat | Sow/gilt reading | Separate eligible readings; other animal types skipped |
| Body condition | Record condition | Shared observation; feed remains unchanged |
| Adjust feed | Pig’s curve adjustment | Percentage replaces each pig’s adjustment; existing feed preview and eligibility rules retained |
| Note | Pig note | Same note recorded separately for each included pig |
| Pen note | Explicit pen selection | Same note on selected pens |
| Equipment fault | Device at one pen | Choose one pen so the fault has a specific location |

## Checks

Verified single treatment fits the medium drawer without body scrolling. With seven pigs, only the pig list scrolls; the action panel stays at the same position and the last row remains reachable. Row input outlines have reserved space within the scroll region.

Verified draft validation, separate readings and doses, excluded rows, matching-condition updates, duplicate-finding protection, single task completion, and return to a finding after treatment. No real treatment records are submitted by these prototype checks.

## Unified care

Care is the only editable condition state: No action needed, Monitor, Treat in place, or Move to hospital pen. Attention is derived from care; every choice except No action needed requires attention. A condition with No action needed remains recorded and visible in the health tags until explicitly resolved. Individual and bulk edits use the same rule and retain the condition’s original age. Bulk Keep current care preserves each pig’s existing choice.
