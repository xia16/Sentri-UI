# Temperature 体温

> Draft — compiled from existing docs, not yet confirmed.

## Problem

Production labelled the drawer tile "temperature" while the screen said body temperature: one word, two subjects, two homes. Body temperature belongs to the animal verb; ambient temperature belongs to the check-in sheet.

## Who

The stockperson taking temperatures on the walk; the vet reads flagged rows.

## Anchor

Anchor: The animal and its temperature reading.

## Rules

- Same chassis and laws as Weigh, with °C in the Measure: per-confirm commit, skip without recording, leaving keeps confirmed readings, receipt lines reopen as edits.
- The threshold is config, not design: temp_escalation_c, farm-level, keyed by stage class (sow and piglet norms differ). The sheet consumes only "escalated, yes or no".
- An escalated reading prints a chip on her row whether or not a case is open. A reading is data and a case is a person's declaration, so the reading never creates a case. Where a row could carry two chips, the instruction wins.
- The receipt stays neutral on escalated values: escalation is the row's business. An unescalated reading stays cut to the inside (the zero rule).
- The primary states the reading ("Record 40.6 °C"); the footnote says what an over-threshold reading does (flags her row over 40.0 °C).

## Scope

In: Temperature · one pig; Temperature · conveyor; After · the chip on her row.

Out: see the neighbouring features of the same section for what the same sheet does elsewhere; nothing outside the screens above is designed here.

## Decisions

Open questions and items to confirm:

- An inline Add-condition offer on an over-threshold confirm stays open (spec q4); chip-only as specced.

Sources:

- The event workflow deck: `ux/system/workflows/measures.html` (all decks render in `ux/archive/workflows.html`).
- The ops requirements: `ux/research/ops/measures.md` and `ux/research/ops/SYNTHESIS.md`.
