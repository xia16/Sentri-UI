# Post-farrowing check (母猪产后检查)

Section: Tasks · Platform: mobile · Prototype: `/ux/archive/screens.html?sec=01&slide=6` (earlier design; the deck calls it Postpartum check); no current design yet

**Draft: compiled from existing docs, not yet confirmed.** No product decisions are made here; open points are listed under Decisions and filed in `review/populate-tasks.json`.

## Problem

After farrowing each sow is assessed within a short window: body condition, udder, milk, discharge, feeding, mobility, backfat, with a cull recommendation. Abnormal results need follow-up.

## Who

- Barn worker (gloved, one hand, in the pen): marks or records per sow from the task list.
- Unit lead / supervisor: reads the Task overview and KPI and, where the task has one, ends it.

## Anchor

The anchor is the **sow** farrowed N days ago in the check window.

## Jobs

- Record the assessment for one sow; correct it later through the pencil.
- See which sows are due and which need a recheck.

## Screens

Earlier design: list, sow check form, task detail. Placeholders (old Figma only): End task, Ended task.

## Rules

From the sources, short:

- Rail task: tap acts; no boxes (`ux/archive/screens.html` section 01).
- Save commits the check; there is no round submit.
- Any abnormal item creates a symptom record and a recheck row (research).
- The cull reason field appears only when cull is recommended (research).
- End task is disabled with a reason while the batch's farrowing task is open (research).
- A done row is corrected with the pencil: the same sheet, pre-filled, with an audit line.
- Everything derivable is derived (day counts, windows, percentages); the worker is never asked for it.

## Scope

In scope: the assessment and its recheck. Out: the symptom module itself.

## Decisions

- Recheck trigger, pass definition, mastitis values, required fields, early-end carry-over: open (research section 6).

## Sources

- `ux/research/tasks/postpartum.html`
- `ux/archive/screens.html` sections 01, 03, 04b
- Figma node 8006-14820
