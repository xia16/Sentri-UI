# Mark as breeder 标记留种

> Draft — compiled from existing docs, not yet confirmed.

## Problem

Production fused mark and unmark in one tile that needed a chooser, a dialog and a success frame, and silently dropped pigs that could not be marked.

## Who

The stockperson or manager choosing breeding stock from piglets and commercial pigs.

## Anchor

Anchor: The pig and its breeding-stock mark.

## Rules

- Mark has no payload, so the drawer is a subject, a consequence and a primary. The sheet is the confirmation.
- Marking needs an identity: tagged pigs mark directly; the identity gate splices the identity conveyor over the untagged subset (the gate splices, never walls).
- Blocked pigs are named: "2 left out — no tag" with a view link; the primary acts on the remainder, with the count in the verb. Nobody is dropped in silence.
- Mark and Unmark are two verbs, never a toggle: Mark gates on identity, Unmark cannot. The verb sheet renders whichever the selection allows (none marked: Mark only; all marked: Unmark only; mixed: both), each scoping visibly.
- The mark prints nothing on the row. It creates a set: the funnel's marked-set filter collects them, ready to be drained in bulk by Transfer. Her page holds the durable fact under Identity with the history line.
- No toast: row updates and the filter count are the feedback.

## Scope

In: Mark as breeder; Blocked pigs named; Remove breeder mark; After · a filterable set.

Out: see the neighbouring features of the same section for what the same sheet does elsewhere; nothing outside the screens above is designed here.

## Decisions

Open questions and items to confirm:

- The eligibility predicate is not stated in production; the written spec implies piglets or commercial pigs only (open product question).
- Marking breeders also exists as a step inside Piglet processing and Weaning; whether it is one record is not stated in the deck.

Sources:

- The event workflow deck: `ux/system/workflows/place.html` (all decks render in `ux/archive/workflows.html`).
- The ops requirements: `ux/research/ops/place-identity.md` and `ux/research/ops/SYNTHESIS.md`.
