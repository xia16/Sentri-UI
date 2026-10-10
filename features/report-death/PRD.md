# Report death 上报死亡

> Draft — compiled from existing docs, not yet confirmed.

## Problem

A dead pig is a daily event that must be easy to find yet hard to hit by accident. Production committed each death on its own confirm, with no rollback, plus a submit, a soft warning and a toast.

## Who

Anyone on the walk who finds a dead pig; the supervisor and vet read causes afterwards.

## Anchor

Anchor: The pig (or group count) reported dead; the record outlives the pig.

## Rules

- Death is the last Health verb: same tile size and grid, red outline and no fill. A daily event is easy to find; distinct styling makes it hard to hit by accident.
- Each death commits on its own confirm and no rollback exists, so protection moves in front of the first commit: the roster (several pigs) shows the whole selection as names with a per-row remove before anything is written.
- Blocked pigs are listed with the reason ("already reported", with who and when), never silently dropped; the remainder proceeds deliberately.
- Cause is one multi-picker over the same catalogue as conditions and treatment; the catalogue stays open (a pig can die of something never recorded). Her open case is preselected. "Cause unknown" is an explicit option, not an empty commit.
- Conveyor: Report death · next writes that pig immediately; Skip advances without writing (she stays alive, which is not the same as Cause unknown); leaving early is legal and committed deaths stand. From pig two on, the cause carries forward and the sheet says so ("same cause as last · edit"). Photos never carry.
- After commit: rows leave in place and pen counts re-derive; no toast. Her page outlives her: scanning the tag opens the page with the terminal band; open cases freeze under the death record and a pending cull recommendation closes. The only way back is the deliberate mis-entry correction.
- The selection type decides the shape, never a toggle: tagged pigs go to the per-pig conveyor, an un-identified group row goes to one count sheet. A mixed selection composes on the roster.

## Scope

In: Entry · verb sheet, Death outlined; Death · one pig drawer; Death roster · several pigs; Death conveyor · 2 of 3; After · rows gone, counts down; Death · un-identified group.

Out: see the neighbouring features of the same section for what the same sheet does elsewhere; nothing outside the screens above is designed here.

## Decisions

Open questions and items to confirm:

- Whether the shared death form is one design across Inspection, Farrowing and Piglet processing (filed as a decision).
- The count-sheet pre-fill for an un-identified group needs no provenance token; two causes in one group are two passes (deck rule, not yet confirmed with the farm).

Sources:

- The event workflow deck: `ux/system/workflows/terminal.html` (all decks render in `ux/archive/workflows.html`).
- The ops requirements: `ux/research/ops/terminal.md` and `ux/research/ops/SYNTHESIS.md`.
