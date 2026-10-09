# Pig profile 猪只详情

## Problem

When a worker taps a pig they need, in this order: what needs attention, what to do next, who she is, how she is fed, where to read more, and the actions they can take. The old Figma draws pig detail twice: inside Inspection and in the pig list (猪只列表) file. The built version (inside the Inspection prototype) is one sheet with six blocks and many repeated facts.

## Who

A worker on the walk or in a task who reaches a single pig; the same sheet opens inside Farrowing's sow drawer. A supervisor reading history uses Production stats, Origin and Log.

## Anchor

No anchor. The record is the same for a pig at any stage; what changes is which blocks and which actions apply. Screens are grouped as The record, Read more, Actions - Production, Actions - General and Actions - Unavailable.

## Rules

- Human-entered records lead; derived plans and stable facts sit in reading sections.
- The blocks follow the animal type (Sow cycle, Gilt breeding, Boar breeding, Piglet growth, Growth).
- An empty production-average section is absent; facts missing from the registry show a dash.
- The Actions sheet has three groups, Production, Health and General. Production is for one pig only and holds only the rows that fit her stage and tasks; blocked rows are listed with the reason in "Unavailable actions".
- Farrowing opens the shared health and measurement flows rather than copying them; it adds its own Production rows when embedded (piglet processing, piglet deaths, count reconciliation, fostering, litter edit, remove from batch, not in pig, transfer).
- Not in pig, miscarriage and batch removal take a sow out of her batch and return her to rebreed watch; saved records are kept.
- Weight, temperature and backfat take one value per pig.
- A dead sow offers a note only.

## Scope

In: the record (full, partial, empty, with tasks), Production stats and a batch record, Origin, the pig Log, the Actions sheet for one pig, the task outcome form, miscarriage, batch membership, the measurement menu and forms, body condition, notes and the unavailable list.

Entry points: Inspection (a pig row, search or scan), Tasks (a sow in the Farrowing room list), Pigs (the pig list; that feature is a placeholder written elsewhere, so this entry has no source screen yet).

Out: health forms and findings (health-record), feed editing and the pig's feed plan (feed-plan), the unit walk (inspection). Transfer sow, Mark not in pig and Remove from batch render only inside Farrowing's drawer; they are named on the Actions screen but not drawn as screens here.

## Decisions

- One Actions sheet for one pig or twenty; the Production group appears only for one.
- Tasks are shown as cards on the record and as rows in Actions; Farrowing and Piglet processing open the Farrowing task.
- Body condition is recorded from Measurements & condition and creates a health finding with Monitor care.

Open (recorded on the screens as issues):

- Next task and Batch are repeated in the task card, the grid and the type block; stage and days appear in the header, the grid and the type block.
- Age is in days for a sow.
- Saving a reading or a note returns to the walk list, not to the pig record; the task, miscarriage and batch forms return to the record.
- The pig's lifetime figures (litters, born total, rates) are in the data but not shown.
- Mark-not-in-pig, remove-from-batch and transfer cannot be reviewed outside Farrowing.
