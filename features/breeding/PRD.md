# Breeding (配种)

Section: Tasks · Platform: mobile · Prototype: `/ux/archive/screens.html?sec=01&slide=4` (earlier design); no current design yet

**Draft: compiled from existing docs, not yet confirmed.** No product decisions are made here; open points are listed under Decisions and filed in `review/populate-tasks.json`.

## Problem

Sows in heat are mated once or several times at set intervals with a recorded semen batch. The worker needs the next mating, its interval and its batch visible at the crate.

## Who

- Barn worker (gloved, one hand, in the pen): marks or records per sow from the task list.
- Unit lead / supervisor: reads the Task overview and KPI and, where the task has one, ends it.

## Anchor

The anchor is the **sow** in heat with a mating sequence (mating 1 of N). When she reaches the configured N the row reads Done and the sequence feeds the pregnancy check.

## Jobs

- Confirm the next mating with its semen batch from the sequence sheet; add an extra mating to a done sow.
- Scan an ear tag to open her sheet directly.

## Screens

Earlier design: list, record mating, filter, pen picker, peek, task detail. Placeholders (old Figma only): Search results, End task, Ended task.

## Rules

From the sources, short:

- Rail task: tap acts; no boxes, no bulk (`ux/archive/screens.html` section 01).
- Event task: no End task button; it closes record by record (section 03).
- Semen batch defaults to the previous mating's and forward-fills when changed; the confirm button names the batch (research delta 1).
- A long interval shows an amber line and a LAST chip.
- No Submit on the room screen: marks commit themselves, rounds are ambient; unmarked sows keep their state (`ux/research/tasks/BRIEF.md`).
- A done row is corrected with the pencil: the same sheet, pre-filled, with an audit line.
- Everything derivable is derived (day counts, windows, percentages); the worker is never asked for it.

## Scope

In scope: matings and their batch. Out: batch-phase close (a console action, research delta 4).

## Decisions

- Does READY expire, where phase close lives, batch-join verification, natural-mating farms, extra-mating cap: open (research section 6).

## Sources

- `ux/research/tasks/breeding.html`
- `ux/archive/screens.html` sections 01, 03, 04b
- `ux/archive/task-screens-combined.html` sections 01c, 02, 02c
- Figma node 7845-6780
