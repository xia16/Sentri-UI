# Disease and symptom 疾病与症状

> Draft — compiled from existing docs, not yet confirmed.

## Problem

A farmer who sees a pig with scours or a limp needs to put that on the record and later close it, without choosing between a disease list and a symptom list and without a chain of confirmation screens. Production used five screens to add and four plus a dialog to remove.

## Who

Anyone on the walk (stockperson, supervisor) recording what they see on one or many pigs; the same record is read by the vet.

## Anchor

Anchor: The condition (a case with a day count, or a characteristic on the pig page) opened or closed on a pig.

## Rules

- One catalogue, one Conditions field: disease versus symptom is taxonomy the catalogue carries silently. An entry that is a characteristic (a hernia) writes a fact on the pig page, not a case.
- Triage rides inline on Add condition with the preset Monitor (no null level exists); the distribution card is cut from Add.
- Commit is idempotent for a carrier: a pig already carrying the condition gets no second case and its day count keeps aging. The drawer footnote states the subtraction before commit.
- No toast and no result screen: the list rows are the receipt, the selection clears and the walk keeps its scroll.
- Resolve has two verbs with unequal weight: Recover (the outcome, big tick on the left) and Strike (a correction of a wrong entry, small chip on the right). One commit carries mixed verdicts; characteristics are never listed in Resolve.
- Resolve at one pig is a drawer; at several pigs it is a verdict page, one line per pig by open condition, grouped by pen, with recover-all on the master row and pen headers. The primary is disabled at zero verdicts.
- The zero rule: pigs with nothing open stay off the page and a footnote counts them. Recovery prints as silence: the closed line disappears and nothing says "recovered". A struck entry prints nothing anywhere; the audit keeps it.

## Scope

In: Select pigs · verb sheet; Add condition · one drawer; Condition catalogue; After adding · list is the receipt; Resolve · one pig; Resolve · verdict page; Resolve · verdicts in place; After resolving.

Out: see the neighbouring features of the same section for what the same sheet does elsewhere; nothing outside the screens above is designed here.

## Decisions

Open questions and items to confirm:

- How this feature relates to the Health record built in the Inspection prototype (filed as a decision).
- The deck states the decisions were taken from production frames; confirm the catalogue contents with the farm vet.

Sources:

- The event workflow deck: `ux/system/workflows/health.html` (all decks render in `ux/archive/workflows.html`).
- The ops requirements: `ux/research/ops/health.md` and `ux/research/ops/SYNTHESIS.md`.
