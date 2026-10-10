# Move 转移

> Draft — compiled from existing docs, not yet confirmed.

## Problem

Production moved pigs through a tree page, a two-wheel drawer and a confirmation dialog, and a separate full page for groups with uncounted head.

## Who

The stockperson moving pigs between pens or units; the supervisor reading pen counts.

## Anchor

Anchor: The placement of a pig or a counted group.

## Rules

- An identified pig's records live on the animal: cases, treatments and marks travel with her silently, so the whole event is one Picker.
- The sheet is the confirmation: the subject header restates scope, view > filters the list to the selection, and the primary commits. Production's confirmation dialog is cut.
- The destination tree survives as labels only. The current unit is pinned first and the source cell dimmed; cross-unit groups carry their full path; search reaches any pen and the scan reads a pen plate. Tap commits and closes. An empty pen prints dashed.
- Mixed selection: tagged pigs move as placement events, un-identified head move as a count. Each open group record on the source pen gets a verdict (Stays, Goes, Both; default stays) and the checklist folds to a footnote when the whole population leaves.
- A pen's un-identified count is fully partitioned by (line, batch), so a multi-batch move must say which batches shrink (steppers, sum = n). A single-batch group rides silently.
- No toast: counts are the feedback. The source card re-derives down and the destination up (derived for tagged pigs, set by count for head).

## Scope

In: Transfer · tagged pigs; Destination picker; Transfer · tagged and head; After · the cards are the receipt; Transfer sow · from a sow record.

Out: see the neighbouring features of the same section for what the same sheet does elsewhere; nothing outside the screens above is designed here.

## Decisions

Open questions and items to confirm:

- Whether Transfer on a sow's record is the same design as this page (the sow transfer in Farrowing and in the Pig profile uses a unit and pen pair of fields; see the screen).
- The deck flags this as the worst-case container for a drawer.

Sources:

- The event workflow deck: `ux/system/workflows/place.html` (all decks render in `ux/archive/workflows.html`).
- The ops requirements: `ux/research/ops/place-identity.md` and `ux/research/ops/SYNTHESIS.md`.
