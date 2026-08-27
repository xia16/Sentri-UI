# Ops brief — the piglet day-age protocol ladder (仔猪处理, production screen 7)

Slice of the farrowing-suite mapping. Sources: farrowing-figma-context.md ·
ux/research/tasks/piglet-processing.html (the standing requirements work — this brief extends,
never restates) · SYNTHESIS.md · components.html 04d · motion.html contract.

---

## 1 · Ground truth — how the work is actually batched

Batch farrowing means a room's litters were born inside a 3–5 day window, so on any morning
the room is really **two or three day-age cohorts interleaved down one physical row of
crates**. The hand does not work sow-by-sow-by-ladder; she works **treatment-set-by-walk**:
load the iron gun and the drop bottle, start at crate 1, do every crate that is due, in crate
order. Per crate the rhythm is fixed — catch piglet, drop/inject/notch, next piglet, ~12
times — then step to the next crate. Hands are full the entire time; the phone comes out
*between* crates at best, at the end of the row at worst.

What the hand knows without the app: the schedule itself (d1 cord+drops · d3
teeth/tail/iron/castrate · d5 tag/notch/weigh · d7 health — it is muscle memory within a
week) and what each crate roughly needs by looking at piglet size. What she does **not**
know: which specific litters have drifted off the room's rhythm (late farrowers, re-entered
sows, fostered-in piglets), and which crates were already done by the other hand this
morning. That is the app's whole job here.

Varies per farm (console, never the hand): which treatments at which day; castration at all;
whether d2/d3 are collapsed into one "processing day"; mandatory flag. The ladder's rungs are
config; the walk is universal.

## 2 · The unit of work

Production's unit is the sow page with a five-accordion ladder inside — the record's shape
imposed on the work. The **working set is the day-cohort: every litter with due treatments
today, in crate order** — exactly what the task list's To-do lens already is. So:

- **Cohort list = the workplace.** The ladder survives only as the litter record's schedule
  strip (research delta 1) — the *drill-in* for history, drift, and pre-fill, not the place
  work happens.
- **The mark is per litter × day × treatment** (unchanged from the research data map).
- **Whole-litter default, exception by count.** One tap marks the treatment for the full
  litter (12 of 12). The Roster law already covers partials: *group rows verdict by count
  with an inline stepper* — a partial is the same mark with n adjusted (`iron · 7 of 12`).
  The 5 unmarked heads keep the treatment due; the row stays in To-do with the residual
  token (`iron · 5 left`). No separate "partial" state exists — it is just a smaller count.

## 3 · Interaction model

Three candidates on the house chassis:

| Candidate | Chassis | Verdict |
|---|---|---|
| A · Inline checklist on the cohort row | C4 inline config inside the list | **Recommended** — today's due treatments render as self-committing tokens on the litter row; row-level check = all of today for this litter |
| B · Roster → conveyor down the crate row | C4 → C3 | Reserve for **d5 tag/notch/weigh** only, where per-piglet payload forces a per-crate dwell anyway (the C5-whose-section-is-C3 pad, already specced) |
| C · Select n litters → bulk treatments sheet | C1 bulk (research §4) | Keep as the **catch-up gesture**, not the primary |

Why A: the walk's natural gesture is *one confirmation per crate as you leave it*. A conveyor
(B) forces the phone into the hand at every crate even when nothing varies; A lets five
identical crates be five taps — or, having drifted, one bulk select (C). B earns its cost
only when each crate demands data entry, which is exactly the weigh day.

**No submit anywhere.** Receipts and motion destinies, per the contract table (motion.html
already rows piglet processing):

- Token tap (one treatment, or count-adjusted) → commits → **A · advance-in-place**: wash,
  stamp appears (`08:12 · G.H`), remaining tokens shrink. She stays in To-do.
- Row check / last token → whole day done for the litter → **B · cross-the-lens**: settles
  800 ms, group-collapses, lands atop Checked, `All done` + stamp. Census and unit progress
  tick in the same frame.
- Bulk (C) → one reflow, counts tick by n at once, never staggered.

**Day rendering without dim** (components 04d/06d fact-line rule): done day = `d3 ✓` +
stamp; due day = full-weight `d5 · due today` + live tokens; future day = **forecast
register** — light weight with the word that admits prediction: `Expected · d7 · Sat` — tag
and checks full strength, early mark legal (this *is* 可提前填, needing zero extra UI: the
mark just records with its date).

## 4 · Edge cases

- **Behind schedule (d5 due, d3 undone).** Tokens accumulate on the row, oldest first
  (`iron · d3 · 2d late` heavy, then today's). No forced ordering — she does what the crate
  needs; each mark records against its scheduled day with the actual date, and lateness is
  the on-time KPI's business, not a gate. The schedule strip shows the gap as `d3 !`.
- **Fostering splits day-ages in a crate.** The litter's day-age derives from the sow's own
  farrow date; a fostered-in piglet may be 2 days off-ladder. Identified piglets carry their
  marks as records and their own day-age; unidentified heads can only inherit the receiver
  litter's schedule — an honest limit, printed once on the row (`incl. 3 fostered · d1
  offset`), not a warning banner. Whether an off-ladder identified piglet spawns its own due
  tokens on the receiver's row is an owner call (Q2).
- **Refused / skipped treatment.** Skip records nothing (conveyor law) — the head count
  stays due until task end, where the end-ceremony already prices unfinished work. A
  *deliberate* protocol omission is not a hand's mark: farm-wide omissions are console
  config; a per-litter refusal (weak piglets, gilt kept from castration) is what the count
  exception already expresses — 10 of 12, and the 2 remain visibly due. No reason field: a
  required reason would re-gate a committed stepper (same ruling as set-count, SYNTHESIS Q7).
- **Retroactive entry at end of row.** The expected normal case, not an edge: gun down,
  phone out, bulk-select the 5 finished crates in walk order → mark sheet → one commit, one
  reflow. Timestamps record entry time, not act time — acceptable because the day, not the
  minute, is the compliance grain (confirm, Q4).

## 5 · Open questions for the owner

1. Does d5 tag/weigh justify the roster→conveyor as its *default* entry from the cohort
   list, or is drill-in per litter enough on small rooms?
2. Fostered identified piglet off the receiver's ladder — own due tokens on the receiver
   row, or protocol continuity abandoned at foster (current production behavior)?
3. Is a residual (`iron · 5 left`) allowed to survive past d7 into weaning, or does task end
   remain the only terminator for never-done heads?
4. Compliance grain: is entry-time stamping for end-of-row catch-up acceptable, or does the
   on-time KPI need act-day attestation?
5. When two hands split one room, is crate-order To-do enough, or do they need a claim
   mechanism (row disappears when the other hand marks it — motion already covers the
   reflow)?
