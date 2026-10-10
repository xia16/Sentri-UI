# Heat check (查情)

Section: Tasks · Platform: mobile · Prototype: `/ux/archive/screens.html?sec=01&slide=1` (earlier design); no current design yet

**Draft: compiled from existing docs, not yet confirmed.** No product decisions are made here; open points are listed under Decisions and filed in `review/populate-tasks.json`.

## Problem

Finding the sows in heat is a twice-a-day sweep over about two hundred sows. Production spends 35 frames on a two-way judgement plus a round certificate; the earlier design reduces it to the unified task list with a two-option outcome sheet.

## Who

- Barn worker (gloved, one hand, in the pen): marks or records per sow from the task list.
- Unit lead / supervisor: reads the Task overview and KPI and, where the task has one, ends it.

## Anchor

The anchor is the **sow** in a heat-check cohort. In heat: the sow leaves heat check and joins Breeding. Signs of heat: she stays here with a SIGNS chip.

## Jobs

- Walk pen by pen; tick the sows plainly in heat or showing signs and mark them together (bulk bar), or tap a row for one sow.
- Scan an ear tag to select a sow.
- Open Task overview for progress, KPI, configuration, SOP and End task.

## Screens

Earlier design: list, bulk select, scan, mark, filter and applied filter, pen picker, peek, task detail. Placeholders (old Figma only): Submit result, End task, Ended task.

## Rules

From the sources, short:

- Pen-grouped rows, never forked: one list configured per task (`ux/model/unified-task-list.md`, `ux/archive/screens.html` section 01).
- No Submit on the room screen: marks commit themselves, rounds are ambient; unmarked sows keep their state (`ux/research/tasks/BRIEF.md`).
- A done row is corrected with the pencil: the same sheet, pre-filled, with an audit line.
- Everything derivable is derived (day counts, windows, percentages); the worker is never asked for it.
- Lens Not in heat / In heat / All; one time dimension in the filter (expected-heat time).
- Heat check is a standing task: End task shows as the supervisor's stop, in the task detail sheet only.
- Absence of a mark is the record of "not seen in heat".

## Scope

In scope: the sweep and its marks. Out: the transfer, death and health records reached from the sheet (their own features).

## Decisions

- Unchecked semantics and the end-task guard (typed count against one confirm): open in the research, see the filed decisions.
- Breeding handoff timing (at mark or at round close): open (research Q3).

## Sources

- `ux/research/tasks/heat-check.html`
- `ux/archive/screens.html` sections 01, 03, 04b, 04c
- `ux/archive/task-screens-combined.html` sections 01c, 02, 02c
- `ux/model/unified-task-list.md` (historical)
- Figma node 7561-10830
