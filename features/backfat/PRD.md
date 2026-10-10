# Backfat 背膘

> Draft — compiled from existing docs, not yet confirmed.

## Problem

Production split qualitative and quantitative backfat across two frames. One reading belongs to one animal.

## Who

The stockperson or technician who assesses body condition on sows and gilts.

## Anchor

Anchor: The animal and its backfat reading.

## Rules

- A single-subject payload: the conveyor runs N single-pig sheets in sequence, with no forced round-trip through selection between pigs.
- One Choice of method folds both production frames: By eye (preselected; thin, ok, fat as a three-segment scale) or Measure mm. The dependent field appears inline under its trigger, marked by the amber rule only; the sheet never grows past two visible fields.
- The method rides the run sticky (prefilled from pig 1, changeable on any pig).
- The primary states the reading ("Record OK", "Record 17 mm").
- The reading lands on her page BODY key with its trail. The walk row stays quiet: an unescalated measurement is cut to the inside, and backfat has no threshold so it never chips.

## Scope

In: Backfat · by eye; Backfat · measured; Backfat · conveyor; After · her page body key.

Out: see the neighbouring features of the same section for what the same sheet does elsewhere; nothing outside the screens above is designed here.

## Decisions

Open questions and items to confirm:

- Whether a measured mm also offers the matching feed band is open (spec q5); at MVP it is a bare reading.
- Sows and gilts only: the Pig profile measure sheet marks backfat as ineligible for boars and piglets.

Sources:

- The event workflow deck: `ux/system/workflows/measures.html` (all decks render in `ux/archive/workflows.html`).
- The ops requirements: `ux/research/ops/measures.md` and `ux/research/ops/SYNTHESIS.md`.
