# Return-heat check (查返情)

Section: Tasks · Platform: mobile · Prototype: `/ux/archive/workflows.html?sec=wf-return` (current) and the archive list (earlier design)

**Draft: compiled from existing docs, not yet confirmed.** No product decisions are made here; open points are listed under Decisions and filed in `review/populate-tasks.json`.

## Problem

Bred sows are watched for a return to heat during a window after mating. A return takes the sow out of the batch for rebreeding; the unwanted outcome means the cohort never shrinks.

## Who

- Barn worker (gloved, one hand, in the pen): marks or records per sow from the task list.
- Unit lead / supervisor: reads the Task overview and KPI and, where the task has one, ends it.

## Anchor

The anchor is the **bred sow** in the return window. Signs of return: stays in batch. Returned: leaves the batch, rebreed.

## Jobs

- Mark Signs of return or Returned for one sow, from the verb sheet on her record or from the task list.
- Watch progress in days, not sows.

## Screens

Current: Returned to heat entry, record and result (`workflows.html` wf-return). Earlier design: list and task detail.

## Rules

From the sources, short:

- Pen-grouped rows, never forked: one list configured per task (`ux/model/unified-task-list.md`, `ux/archive/screens.html` section 01).
- No Submit on the room screen: marks commit themselves, rounds are ambient; unmarked sows keep their state (`ux/research/tasks/BRIEF.md`).
- A done row is corrected with the pencil: the same sheet, pre-filled, with an audit line.
- Everything derivable is derived (day counts, windows, percentages); the worker is never asked for it.
- Two radios, no negative: unmarked is the record of no return; the consequence is stated on the option, not asked in a checkbox.
- Return-heat is a watch task: progress is days (3 of 7) with a day gauge and "2 returned" as a side fact.
- The Returned row carries its consequence: out of batch, rebreed.

## Scope

In scope: the marks and their consequences. Out: ended-task history (not designed).

## Decisions

- Second pass reality, when removal commits, day certification with two checks a day, signs at window end, task length N: open (research questions 1 to 6).

## Sources

- `ux/research/tasks/return-heat.html`
- `ux/system/workflows/cycle.html` (wf-return)
- `ux/research/ops/cycle-adhoc.md`
- `ux/archive/screens.html` sections 01, 03
- Figma node 7606-10300
