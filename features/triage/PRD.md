# Triage level 分诊等级

> Draft — compiled from existing docs, not yet confirmed.

## Problem

A pig that needs the hospital pen, or treatment in place, is a complete judgment before anyone names a condition. Production needed a four-level page and a confirmation dialog for it.

## Who

Anyone on the walk who decides how urgent a pig is; the person who later drains the marked set (treat or move).

## Anchor

Anchor: The triage mark on a pig (Monitor, Treat in place, Move to hospital pen).

## Rules

- One field, so a drawer; the primary says everything. Three levels with consequence hints: urgent treatment means Hospital pen, priority intervention means Treat in place, routine observation means Monitor.
- Healthy is not a level: it is the absence of a case, written by Resolve. Euthanise is the Cull verb, not a triage level.
- The mark stands alone: no open case is required. Naming the condition stays one tap away in Add condition, which still carries triage inline.
- A "now marked" line prints only when the selection already carries marks, because one level for all would then replace someone's judgment. The footnote says "replaces".
- The mark is a set, not an execution screen: filter to marked, select, then Treat or Transfer.

## Scope

In: Triage · six pigs; Triage · no case required; How the mark prints.

Out: see the neighbouring features of the same section for what the same sheet does elsewhere; nothing outside the screens above is designed here.

## Decisions

Open questions and items to confirm:

- How the three-level triage relates to the care levels shown in the Inspection prototype (filed as a decision).

Sources:

- The event workflow deck: `ux/system/workflows/health.html` (all decks render in `ux/archive/workflows.html`).
- The ops requirements: `ux/research/ops/health.md` and `ux/research/ops/SYNTHESIS.md`.
