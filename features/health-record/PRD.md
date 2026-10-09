# Health record 健康管理

## Problem

The worker records a disease or symptom on one or many pigs, says what to do about it (care), records treatment, and later closes the record as recovered or entered in error. The old Figma draws health three times: in Inspection (add and remove disease or symptom), in the pig list (health management) and in the 健康与治疗 treatment file. The Inspection prototype is the one built version.

## Who

The worker on the walk who finds a sick pig, and the worker who gives treatment or vaccination as a task. A supervisor reads the care levels on the list.

## Anchor

Anchor: the Finding (one condition on one pig).

- Needs attention: care is Monitor, Treat in place or Move to hospital pen. Shown as a row on top of the pig record, with the care level and the day.
- Ongoing, no action needed: recorded and visible as a tag until it is resolved.
- Closed: Recovered, or Entered in error. The case leaves the active list and stays in the pig's log.

Recording, editing, treatment and the pickers can happen in any status.

## Rules

- Diseases and symptoms are one searchable catalogue (9 disease categories; symptoms by body area and body system), for one pig or many. A name that is not in the catalogue can be added as a custom item under a chosen category.
- Care is the only editable condition state: No action needed, Monitor, Treat in place, Move to hospital pen. Attention is derived: every choice except No action needed needs attention.
- Existing findings keep their original start date; adding a condition a pig already has changes nothing.
- Bulk edits preview each pig's change, let a pig be excluded, leave pigs without the condition unchanged, and save only changed rows.
- Treatment records medicine actually given: medicine, method, unit and a dose above 0, a shared dose with a per-pig override, and optional brand, linked condition and note. One record per included pig.
- A treatment started from a Health task (vaccination) lists vaccines only and completes the task on Save.
- A blocked action is listed with the reason, never dropped.
- Recovery keeps the case in history; entered in error marks a correction. Recovering a finding linked to a feed adjustment ends that adjustment.
- Hospital pen is a care choice only; no move is made.

## Scope

In: the pig record as a health view (needs attention, ongoing, several ongoing, care levels), the finding and its edit and resolve forms, Record health with its catalogue picker, Care instructions and Edit conditions, Resolve conditions, Record treatment with the medicine picker (and the brand and condition choosers inside it).

Out: sow death and mortality reports (separate features), the pig record itself (pig-profile), feed changes (feed-plan). Health tags on the walk row belong to inspection.

## Decisions

- Care replaced the older triage and status fields; one select drives both.
- Medicines, brands and units are a sample catalogue until farm configuration exists.
- Treatment never implies identical doses across pigs.

Open (recorded on the screens as issues):

- The default Care is No action needed, so the shortest path records a fever as a non-alert.
- Two rows (Edit conditions and Care instructions) open the same form; Edit finding and Resolve or remove touch the same record for one pig; naming differs between Resolve conditions and Resolve or remove.
- Duration is "Day 2" for attention and "120 days" for ongoing; the day count never advances in the prototype.
- "Recorded — · —" shows empty dashes for unknown date and author.
- The catalogue starts on Symptoms and needs three taps to reach an item; there is no recent or common list.
