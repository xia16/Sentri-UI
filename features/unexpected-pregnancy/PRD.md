# Unexpected pregnancy 意外妊娠

> Draft — compiled from existing docs, not yet confirmed.

## Problem

A sow found pregnant outside the planned check was an unplanned, gated flow of four screens and two gated buttons in production.

## Who

The stockperson who finds a pregnant sow; the breeding manager who owns batches.

## Anchor

Anchor: The sow and her pregnancy-check result.

## Rules

- The unexpected pregnancy is not a verb: it is Pregnancy result reached ad hoc, the same three-way record the pregnancy-check task writes. One record, two doors.
- Production disabled the tile for sows in a batch; that gate is gone. The join field simply never appears for a watched sow.
- Pregnant asks the follow-up only when nothing watches her: Just record (preselected) or Join a batch. After commit, the warning that she joins no batch becomes a standing row token.
- The join picker lists batches with breeding done and farrowing not complete, in pregnancy-check timing. The chosen batch's timing rides back onto the drawer.
- Unclear carries its default: recheck in 3 days from the task config, with a stepper only for the exception. No choice reveals more than one field.
- For a watched sow the options carry hints instead: "follows batch · farrowing" / "leaves batch · rebreed". Marking a watched sow Not pregnant moves her into the rebreed watch.

## Scope

In: Entry · verb sheet; Pregnant · just record or join; Join a batch · pregnancy timing; Unclear · recheck default; After · the warning became a token.

Out: see the neighbouring features of the same section for what the same sheet does elsewhere; nothing outside the screens above is designed here.

## Decisions

Open questions and items to confirm:

- Q5: which configuration supplies the recheck default when the ad-hoc door fires for a sow in no batch.
- Q7: no mating date exists to derive a day count for a record-only pregnancy; production captured nothing either.

Sources:

- The event workflow deck: `ux/system/workflows/cycle.html` (all decks render in `ux/archive/workflows.html`).
- The ops requirements: `ux/research/ops/cycle-adhoc.md` and `ux/research/ops/SYNTHESIS.md`.
