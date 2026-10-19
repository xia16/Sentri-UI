# Disease and symptom: information budget

These screens are the live Inspection prototype with two pigs ticked (owner, 2026-10-20). They were built and budgeted in
[Conditions](../conditions/budget.md) (#223) and [Health record](../health-record/budget.md); this file lists what each of
this feature's screens shows, by the worker's question, so a later change knows what it may cut. No fact is added here.

## Inventory

| Screen | Facts |
|---|---|
| Actions (two pigs) | the walk list behind; the verbs: Condition, Treat, Edit, Resolve, Care, Note, Measure, Feed; Back |
| Record health | title; Conditions (None or the names); Care (No action needed by default); Note (optional); Save · N pigs |
| Choose conditions | search; On these pigs; Recent; Symptoms by where you look; Diseases by body system, each with a line of examples; Done · N |
| A body area | the area as title; its symptoms as ticks, a typed symptom as a door; Back; Done · N |
| Add a condition | Name (pre-filled from the search); Category; Back; Add |
| Saved list | each pig row with its new condition; the toast: Condition recorded · N pigs |
| Resolve (one pig) | Condition; Outcome; Note (optional); Save |
| Resolve (two pigs) | Pigs: each pig's ear tag, pen · stage · days, and what will happen to it; Details: Condition, Outcome, Note; Save · N pig(s) |
| Outcome | Recovered; Entered in error |
| Resolved list | the pig rows without the closed condition; the toast: Marked recovered · ear tag |

## Questions

1. What can I do for these pigs? (Actions: the verbs)
2. What is wrong with them? (Conditions, the catalogue)
3. What should happen next? (Care)
4. Will this record what I mean, and for how many? (Save · N; on Resolve, each pig's line)
5. Did it save? (the row and the toast)

## Levels

- **Act now**: the primary (Save · N, Done · N, Add); the verb tiles on Actions.
- **Watch**: a pig the action will not change ("No Thin · unchanged"), a feed adjustment the outcome resets.
- **Settled**: the field values (Coughing, No action needed, Recovered); the pig's pen · stage · days; the ear tag of a pig left
  unchanged, in the same ink as the others.
- **Audit**: the toast's detail (2 pigs, the ear tag).
- Cut: a pig list on Record health (the selection is fixed before it), a confirm step, a result screen, counts per catalogue item,
  colour on the catalogue rows.
