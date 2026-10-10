# Treat 治疗

> Draft — compiled from existing docs, not yet confirmed.

## Problem

Recording a treatment for many pigs took five screens in production, with two separate target pickers and a confirm page.

## Who

The person giving the treatment; the vet and supervisor read the trail afterwards.

## Anchor

Anchor: The treatment event, linked to the cases it targets.

## Rules

- Treat is a page of six fields: drug, brand, method, dose with unit (the one sanctioned pair), Treating for, and the per-pig dose; requiredness is kept from production. The confirm screen and toast are gone.
- Dose is per pig, one field. The total is a footnote on the commit, never a field.
- No date field: recorded-at is the record and the treated trail derives from it.
- With nothing open on the selection the Treating for field is absent, not empty: treating healthy pigs without a target is legal prophylaxis.
- Targets are a union with fractions ("fever · 4 of 6"): the drug event goes to all pigs, the case link only to the pigs that carry the case. An intersection is wrong because it empties as soon as the selection is mixed.
- Treat discharges a "treat in place" mark; a hospital mark is discharged by the move, not by the drug.
- There is no execution screen: the marked set is a filter over the walk rows.

## Scope

In: The marked set · select and treat; Treatment page · six fields; Targets · union with fractions; Next walk · treated trail.

Out: see the neighbouring features of the same section for what the same sheet does elsewhere; nothing outside the screens above is designed here.

## Decisions

Open questions and items to confirm:

- Whether this page and the Health record "Record treatment" in the Inspection prototype stay two designs (filed as a decision).

Sources:

- The event workflow deck: `ux/system/workflows/health.html` (all decks render in `ux/archive/workflows.html`).
- The ops requirements: `ux/research/ops/health.md` and `ux/research/ops/SYNTHESIS.md`.
