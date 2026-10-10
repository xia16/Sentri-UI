# Pregnancy check (孕检)

Section: Tasks · Platform: mobile · Prototype: `/ux/system/inspection-astra-concept.html?layout=focus` (preset `pig-tasks`) for the current check; earlier list design in the archive deck

**Draft: compiled from existing docs, not yet confirmed.** No product decisions are made here; open points are listed under Decisions and filed in `review/populate-tasks.json`.

## Problem

After mating each sow is checked for pregnancy in a time-boxed sweep. The outcome decides where she goes next: on with the batch, recheck, or back to rebreed.

## Who

- Barn worker (gloved, one hand, in the pen): marks or records per sow from the task list.
- Unit lead / supervisor: reads the Task overview and KPI and, where the task has one, ends it.

## Anchor

The anchor is the **sow** in a pregnancy-check cohort with outcomes Pregnant, Not in pig (earlier design: Not pregnant) and Recheck later (earlier design: Unclear).

## Jobs

- Record the check from the sow's own record (current design: Pregnant, Not in pig, Recheck later, optional note).
- In the earlier list design, sweep the unit and mark several sows together.

## Screens

Current: Record the check (from the sow's Current tasks). Earlier design: list, pen picker, task detail.

## Rules

From the sources, short:

- Pen-grouped rows, never forked: one list configured per task (`ux/model/unified-task-list.md`, `ux/archive/screens.html` section 01).
- No Submit on the room screen: marks commit themselves, rounds are ambient; unmarked sows keep their state (`ux/research/tasks/BRIEF.md`).
- A done row is corrected with the pencil: the same sheet, pre-filled, with an audit line.
- Everything derivable is derived (day counts, windows, percentages); the worker is never asked for it.
- Pregnant keeps the sow in the current gestation batch; Not in pig closes the task and returns her to rebreed watch; Recheck later keeps the task open (current sheet).
- Earlier design: bulk marking on all three outcomes is a confirmed product decision; unclear defaults to a 3-day recheck.

## Scope

In scope: the check and its outcome. Out: ended-task history (not designed).

## Decisions

- When batch removal commits (at mark or at End task): open (research Q1).
- Who owns a recheck that falls outside the 3-day window: open (research Q2).
- Number of check rounds: open (research Q4).

## Sources

- `ux/research/tasks/pregnancy-check.html`
- `ux/archive/screens.html` sections 01, 03
- `ux/system/inspection-astra-concept.html` (pig-tasks preset)
- Figma node 7607-10820
