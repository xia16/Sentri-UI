# Heat 发情

> Draft — compiled from existing docs, not yet confirmed.

## Problem

A gilt found standing on the walk has to be marked in heat, and may join a service batch. Production used six screens (four sheets, a full-page picker and a toast).

## Who

The stockperson who sees the heat; the breeding manager who owns batches.

## Anchor

Anchor: The gilt or non-pregnant sow, and her heat mark.

## Rules

- Heat is the same record the heat-check task marks; whether she joins a batch is a field inside it, never a second entry. It is Bulk: two gilts ticked raise the same sheet and one shared join forms a service batch.
- Heat signs is the observation (watch, stays). In heat commits the state; if nothing watches her, one question follows as two visible options: Just record (preselected, so the primary still commits in one tap) or Join a batch.
- Commit is never gated on a batch. Record-only is production's "record only"; the 48-hour fact rides it as a hint: unclaimed, the mark lapses back to Quiet and the event stays on her page trail.
- The join picker lists only batches not done breeding, in breeding timing; the production line is a scope chip, tap commits and returns. Re-tapping the chosen batch reopens it.
- When she is already watched by a running heat check, the block never appears and the In heat option carries the derived hint ("breeding for a running heat check").
- No toast, no navigation: the row is the receipt. A joined gilt prints no batch token; a record-only mark keeps "no batch".

## Scope

In: Entry · verb sheet; Heat drawer · just record or join; Join a batch · picker; Heat drawer · batch chosen; After · the row is the receipt.

Out: see the neighbouring features of the same section for what the same sheet does elsewhere; nothing outside the screens above is designed here.

## Decisions

Open questions and items to confirm:

- The gating table (components erratum) admits Pregnancy result for a breeding-age gilt: open Q2.
- Heat-check task screens of the earlier decks are under the heat-check feature.

Sources:

- The event workflow deck: `ux/system/workflows/cycle.html` (all decks render in `ux/archive/workflows.html`).
- The ops requirements: `ux/research/ops/cycle-adhoc.md` and `ux/research/ops/SYNTHESIS.md`.
