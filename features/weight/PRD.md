# Weight 体重

> Draft — compiled from existing docs, not yet confirmed.

## Problem

Production had seven weight surfaces. The farmer records what the scale reads, for one pig, a run of pigs or a counted group.

## Who

The stockperson weighing pigs; the feed plan reads the group sample to recalibrate.

## Anchor

Anchor: The pig (or the untagged population in a pen) and its latest weight record.

## Rules

- The selection is the mode switch: one pig gives the plain drawer, several tagged pigs a conveyor page, a group row the sample drawer. No control asks.
- Record commits on the spot: no draft, no toast. The primary states the value it writes ("Record 182 kg").
- Conveyor: the subject header advances per pig with her last weight as the sanity anchor; the running list is the receipt, one line per committed pig; tapping a line reopens her as an edit, never a second record. Skip records nothing and skipped pigs are re-offered once at the end; leaving early keeps every confirmed record.
- Group sample: two fields, what the scale read and how many head stood on it; Next load banks the pair, Record writes one population record {sum kg, n, average, headcount at record, who, when}. Weighing the whole pen is the case n = headcount, so there is no total/sample toggle.
- n is mandatory because this drawer closes the feed PRD's spot-check: recalibration needs a per-head average and a bare total over a stale count would corrupt it silently.
- After commit the pen sheet shows a fact line under BODY beside the count trail; stats notation is written in words ("10 of 42 head", "240 kg total").

## Scope

In: Weigh · one pig; Weigh · conveyor; Weigh · group sample; After · pen sheet body line.

Out: see the neighbouring features of the same section for what the same sheet does elsewhere; nothing outside the screens above is designed here.

## Decisions

Open questions and items to confirm:

- spot_check_due as the Review Inbox item this drawer closes is assumed and made visible (spec open question 1).
- How this per-pig conveyor relates to the list-form measure sheet in the Pig profile (filed as a decision).

Sources:

- The event workflow deck: `ux/system/workflows/measures.html` (all decks render in `ux/archive/workflows.html`).
- The ops requirements: `ux/research/ops/measures.md` and `ux/research/ops/SYNTHESIS.md`.
