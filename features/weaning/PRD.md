# Weaning check (断奶检查)

Section: Tasks · Platform: mobile · Prototype: `/ux/tasks/piglet-processing/end.html?state=weaning-handoff` (current handoff); earlier design in the archive deck

**Draft: compiled from existing docs, not yet confirmed.** No product decisions are made here; open points are listed under Decisions and filed in `review/populate-tasks.json`.

## Problem

At weaning the litter is counted, weighed and a few piglets are kept for breeding, and the sow's status is assessed. It is a pen-level task: the row is the litter.

## Who

- Barn worker (gloved, one hand, in the pen): marks or records per sow from the task list.
- Unit lead / supervisor: reads the Task overview and KPI and, where the task has one, ends it.

## Anchor

The anchor is the **litter** (keyed under its pen and sow) at weaning day (day 21 in the examples).

## Jobs

- Record the litter: piglets weaned, kept for breeding, average weight, then the sow status.
- Start from what piglet processing hands over.

## Screens

Current: Handoff to weaning (the unit as it stands when piglet processing ends). Earlier design: list, weaning check, task detail. Placeholders (old Figma only): Keep breeders and fill IDs, End task, Ended task.

## Rules

From the sources, short:

- Pen-level task: the row is the litter; progress counts pens (archive screens section 01).
- The sow half of the check is the postpartum assessment (section 04b).
- No Submit on the room screen: marks commit themselves, rounds are ambient; unmarked sows keep their state (`ux/research/tasks/BRIEF.md`).
- A done row is corrected with the pencil: the same sheet, pre-filled, with an audit line.
- Everything derivable is derived (day counts, windows, percentages); the worker is never asked for it.

## Scope

In scope: the litter record and the handoff. Out: keeping breeders and filling IDs (see the filed overlap decision).

## Decisions

- The Weaning check, Wean and Mark as breeder features overlap: filed as a decision.

## Sources

- `ux/archive/screens.html` sections 01, 03, 04b
- `ux/tasks/piglet-processing/end.html`
- `ux/model/unified-task-list.md` (historical)
- Figma node 8023-17019
