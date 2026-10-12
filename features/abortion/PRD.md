# Abortion 流产

> Draft — compiled from existing docs, not yet confirmed.

## Problem

Production had two acknowledgement-gated abortion variants that captured no date, cause or count. A farmer needs one short record of the cause and its effect on the batch.

## Who

The stockperson who finds an aborted sow; the breeding manager who reads the cause and the batch change.

## Anchor

Anchor: The sow (bred or pregnant, not yet farrowed).

## Rules

- Single only, structurally: each abortion has its own cause and restructures a batch. At more than one sow the verb is absent from the sheet and the not-available line counts it ("abortion — one at a time").
- Available only to a bred or pregnant sow that has not farrowed.
- Cause is required and a Picker of six (the Choice law caps a choice at four); tap selects and returns, no search row. Other reveals a required note inline under the field and folds away if another cause is picked.
- The consequence is a derived footnote, never a fork: in a batch it reads "out of batch 20 · marked empty"; loose it reads "marked empty". Both production acknowledgement checkboxes are gone.
- On commit she leaves the batch's pregnancy-check and farrowing streams, her pregnancy state and farrowing forecast; the abortion, its cause and the batch exit stay on her page trail, and the row reads "Empty · day 0".

## Scope

In: Entry · single only; Abortion drawer · cause required; Cause · six rows; Cause Other · note required; After · what leaves with her.

Out: see the neighbouring features of the same section for what the same sheet does elsewhere; nothing outside the screens above is designed here.

## Decisions

- **One word: abortion / aborted (流产), never miscarriage** — owner decision 2026-10-10. The Pig profile's "Record miscarriage" screen is now "Record abortion" (same event). Farrowing's room list shows an **Aborted** row only while a live piglet remains; with none she leaves the list and the Task overview counts her under "Left the task" (`features/farrowing/PRD.md`, Decisions). Closes backlog item `events-1` ("Abortion vs miscarriage") on the word; the one-form question (deck drawer vs Pig profile sheet) stays open in the screens above.

Open questions and items to confirm:

- The six cause labels are placeholders; they are enumerated only in production node 2572:19676 and must be pulled before build.
- How the Pig profile "Record abortion" sheet (named "Record miscarriage" until 2026-10-10) relates to this design (filed as a decision).

Sources:

- The event workflow deck: `ux/system/workflows/cycle.html` (all decks render in `ux/archive/workflows.html`).
- The ops requirements: `ux/research/ops/cycle-adhoc.md` and `ux/research/ops/SYNTHESIS.md`.
