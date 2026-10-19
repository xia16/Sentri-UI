# Health record 健康管理

## Problem

The worker records a disease or symptom on one or many pigs, says what to do about it (care), and later closes the record as recovered or entered in error. The old Figma draws health three times: in Inspection (add and remove disease or symptom), in the pig list (health management) and in the 健康与治疗 treatment file. The Inspection prototype is the one built version. Giving the pig something for it is Treatment (`features/treat`), reached from the finding's Record treatment.

## Who

The worker on the walk who finds a sick pig. A supervisor reads the care levels on the list.

## Anchor

Anchor: the Finding (one condition on one pig).

- Needs attention: care is Monitor, Treat in place or Move to hospital pen. Shown as a row on top of the pig record, with the care level and the day.
- Ongoing, no action needed: recorded and visible as a tag until it is resolved.
- Closed: Recovered, or Entered in error. The case leaves the active list and stays in the pig's log.

Recording, editing and the pickers can happen in any status; so can Record treatment, which opens Treatment.

## Rules

- Diseases and symptoms are one searchable catalogue (9 disease categories; symptoms by body area and body system), for one pig or many. A name that is not in the catalogue can be added as a custom item under a chosen category.
- Care is the only editable condition state: No action needed, Monitor, Treat in place, Move to hospital pen. Attention is derived: every choice except No action needed needs attention.
- Existing findings keep their original start date; adding a condition a pig already has changes nothing.
- Bulk edits preview each pig's change, let a pig be excluded, leave pigs without the condition unchanged, and save only changed rows.
- Record treatment on the finding opens Treatment's form with the condition fixed (`features/treat`); Save returns to the finding, which shows the record.
- A blocked action is listed with the reason, never dropped.
- Recovery keeps the case in history; entered in error marks a correction. Recovering a finding linked to a feed adjustment ends that adjustment.
- Hospital pen is a care choice only; no move is made.

## Scope

In: the pig record as a health view (needs attention, ongoing, several ongoing, care levels), the finding and its edit and resolve forms, Record health with its catalogue picker, Care instructions and Edit conditions, Resolve conditions. The condition chooser inside Record treatment is this feature's picker.

Out: sow death and mortality reports (separate features), the pig record itself (pig-profile), feed changes (feed-plan), treatment and the medicine list (treat), vaccination (a task). Health tags on the walk row belong to inspection.

## Decisions

- Care replaced the older triage and status fields; one select drives both.
- 2026-10-19 (owner): Record treatment, its pickers and its save moved to Treatment (`features/treat`), which is ad hoc treatment only; vaccination is a task.
- 2026-10-17 to 10-19 (owner): the selection is made on the walk list and is fixed when recording, so Record health is a page of fields (Conditions, Care, Note, Save · N) with no pig list; the condition picker uses one catalogue (symptoms by where you look, diseases by body system, Add condition as Add medicine). The model and its reasons are in [Conditions](../conditions/PRD.md).

Open (recorded on the screens as issues):

- The default Care is No action needed, so the shortest path records a fever as a non-alert.
- Two rows (Edit conditions and Care instructions) open the same form; Edit finding and Resolve or remove touch the same record for one pig; naming differs between Resolve conditions and Resolve or remove.
- Duration is "Day 2" for attention and "120 days" for ongoing; the day count never advances in the prototype.
- "Recorded — · —" shows empty dashes for unknown date and author.
- The catalogue starts on Symptoms and needs three taps to reach an item; there is no recent or common list.
