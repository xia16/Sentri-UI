# Farrowing suite — cross-slice synthesis

Scope: the nine production screens colleagues flagged in the Figma 生产任务 section —
end task · mating sheet · scan edge cases · farrowing (in progress) · record farrowing ·
farrowing detail · piglet processing ladder · ear tag/notch/weight entry · piglet count
confirmation. Mating (screens 2–3) is parked for its own round; everything else is this
suite. Five discussants each took a slice and anchored on the standing research
(`tasks/farrowing.html`, `tasks/piglet-processing.html`, `ops/SYNTHESIS.md`, the chassis
in components 04d, the motion contract). Their full briefs sit beside this file:
[session](session.md) · [ladder](ladder.md) · [identity](identity.md) ·
[count](count.md) · [lifecycle](lifecycle.md). This synthesis is the map; the briefs
carry the evidence.

This is an interaction-model map, not visual design. Nothing here is drawn yet.

---

## 1 · The spine — how the suite hangs together

One litter's life through the system, each stage handing the next its data:

```
sow due            farrowing            litter record         day-age cohorts        weaning
(Awaiting lens) ─► C6 Session per sow ─► ledger + schedule ─► C4 cohort list      ─► transfer
                   counters commit        strip (drill-in)     in crate order         count is
                   per tap; Final         d5 drills into       tokens commit          the last
                   closes her             C3 identity          per crate              ledger line
                                          conveyor
```

- **The farrowing room is a standing surface, not a windowed task.** Lens
  `Awaiting / Active / Done / All`; each sow is her own window; the surface drains, it
  never "closes". The Active lens *is* the room view — no dashboard, no grid.
- **The litter ledger is the truth.** `count = live-born − deaths ± fosters`. Births are
  facts; decrements are events (death, foster-out, missing); a fresh physical count that
  disagrees is news that one ledger line is missing — never an anomaly to launder.
- **The working set for piglet care is the day-cohort in crate walk order**, not the
  per-sow ladder. The ladder survives only as the litter record's schedule strip — the
  drill-in for history and drift, not the place work happens.
- **Identity is captured at the moment of physical action.** Tags come in pre-printed
  sequential ranges, so a range-armed conveyor makes capture near-zero-typing: pre-fill
  next number, scan overrides, one confirm per piglet commits that piglet. Pairing
  reconstructed later is pairing from memory — the root of every error shape.

## 2 · Per-slice recommendations (detail in the briefs)

| Slice | Model | Receipt (no submit, no toast) |
|---|---|---|
| Farrowing session | C6 Session sheet per sow; Live + Stillborn counters top, Weak/Deformed/Mummified below for cleanup; first count = "started" (Awaiting→Active cross); Final = the one closing act | counter digit; trail line `+2 live · 02:14 · G.H`; `LAST 45M` chip; row totals tick on close |
| Completed detail | the same sheet reopened read-only, ✎ per line — production's separate detail screen dies | — |
| Day-age ladder | C4 inline tokens on the cohort row; whole-litter default, exception by count (`iron · 7 of 12`); bulk select = catch-up gesture | token wash + stamp; last token crosses the row to Checked; residual `iron · 5 left` stays due |
| Tag / notch / weigh | range-armed C3 Conveyor from the litter record (`tag/weigh · 9 of 20 ›`); tag pre-filled next-in-range, editable, scan override; sex Choice(2); weight Numpad with previous weight ghosted; per-piglet commit | running list `001246 · 1.4 kg ♂ ✓` — doubles as the two-person audit channel |
| Count reconciliation | count-subject drawer; assertion always commits; a non-zero delta renders as **doors**: `Record 2 deaths ›` (pre-filled) · `Record a foster ›` · `Just set count` (trail carries `2 unexplained`) | census tick on litter row + pen header; trail `was 20 · 2 deaths · since jul 12` |
| Task lifecycle | sweeps auto-close at window end, remainder escalates via the strip (`Unchecked at close · 12 sows`); event tasks drain, no End task; closed run = the task detail sheet frozen, reached from Today's done card | three non-events mark "done": lens at zero, Today card compressed, chip quiet |

## 3 · New cross-slice laws

1. **Assertion always commits; reasons render as doors, never gates.** A required reason
   textarea is a submit button wearing a hat. The honest path (recording the death) must
   be the cheap path — one pre-filled drawer, not a penalty essay.
2. **A tagged piglet is never subtracted namelessly.** Anonymous decrements draw only on
   the untagged remainder; beyond it, the death door becomes a roster naming which.
3. **Counters record facts, verbs record events.** Minus on a birth counter is a
   correction (miscount); a piglet that dies after birth is the death verb writing the
   ledger — live-born stays a birth fact.
4. **Taps-per-piglet is the metric** for any per-animal capture surface. Pre-fill from
   the physical world (tag ranges, previous weight, derivation tables); the human confirms,
   the system types.
5. **Late is not gone.** A missed day-age treatment goes overdue and stamps its actual
   who/when when done; the on-time KPI absorbs lateness. Nothing expires silently, nothing
   nags twice.
6. **Timestamps must not lie.** Batch catch-up entry is the normal case, so derived
   engines (birth-interval warnings) run only off explicitly asserted times, never off tap
   times; late-found events carry the interval, not a fake date.

## 4 · What dies from production (the sins register)

- 提交结果 submit buttons and success toasts — everywhere. The commit is per tap / per
  confirm; the list updating is the receipt.
- 提交后不可再查看 (records unviewable after submit) — everything stays ✎, stamped.
- The 仔猪数量确认 red wall (auto-remove + forced reason + confirm checkbox) — replaced by
  the delta-as-doors choice. The system never removes piglets anonymously.
- The per-sow ladder as the workplace — becomes the drill-in; the cohort list is the work.
- The batch edit-table for tag/weight — becomes the per-commit conveyor.
- 分娩详情 as a separate screen — the session sheet reopened.
- The 结束任务 ceremony — closure is non-events; the frozen task sheet is the record.
  (One production job it did — certification for pay/compliance — is genuinely open, Q-B1.)

## 5 · Consolidated owner questions

**A · Physical facts we need from the farms** (cheapest to answer, unblock the most)
1. Tags: RFID or visual, per farm or mixed? Reader = phone camera or paired stick?
2. Is there any Bluetooth scale in the field, and is birth weight individual anywhere or
   always litter-total at farrowing with per-piglet at the tag day?
3. Who owns tag ranges — console pre-allocation per batch/unit, or physical strips only?
4. Notch timing: same pass as tagging, or days earlier (making notch the lookup key)?
5. Farrowing due-window tolerance (±N days) before a sow reads overdue — farm config?

**B · Pay, KPI and compliance** (decides how hard the record must be)
1. Does pay/compliance need an explicit per-run sign-off, or is recorded activity + the
   frozen sheet enough?
2. Who may amend born-alive after Final — open ✎ (stamped) or role-gated? It moves the KPI
   pay may ride on.
3. Compliance grain for treatments: is end-of-row entry-time stamping acceptable, or does
   the on-time KPI need act-day attestation?

**C · Ledger semantics**
1. Does a hand expect − on the session counter to mean "one died", or is the
   correction/death-verb split acceptable (needing a death shortcut beside the counters)?
2. Is `Just set count · n unexplained` legal at weaning close, or must a litter reconcile
   before transfer? (Gating contradicts assertion-always-commits — needs an explicit call.)
3. Late-found deaths: dated at interval midpoint, interval-stamped, or found-date?
4. Stillborn vs mummified: one "dead found" counter split at cleanup, or asked live?
5. Sow dies mid-farrowing: her session counts as Final (enrolling the litter in
   processing), or a third terminal state?

**D · Protocol policy**
1. Fostered identified piglet off the receiver litter's ladder — own due tokens on the
   receiver row, or protocol continuity ends at foster (production behavior)?
2. Is there a clinical ceiling after which an overdue treatment converts to a health flag
   instead of staying due (day-1 iron at day 10)? Same call decides whether residuals
   survive past d7 into weaning.
3. Per-litter refusal (weak piglets, kept gilts): is count-exception (`10 of 12`, 2 stay
   due) the right rendering, or does a deliberate omission need its own mark?

**E · Roles and rooms**
1. Two hands in one room: is crate-order To-do with live row-claiming (row departs when
   the other hand marks it) enough, or do they need explicit claiming?
2. Who may End task early on sweeps — any hand or lead only? ("Supervisor's stop" implies
   a role gate that rubs against "nothing is ever disabled".)

---

## 6 · Owner answers — first round (2026-08-27)

**A1/A2 · Tags and enrichment data.** Both visual and RFID tags must be supported (per
farm, possibly mixed). Birth weight and similar enrichment fields are **optional by
philosophy**: the farm enters what it wants, at its own accord — give them the space and
the freedom. Design consequence: the identity conveyor must be complete with zero weight
entries; no enrichment field ever gates a confirm; scan and manual entry are peers.

**B1/B3 · Compliance = provenance, not sign-off.** The owner trusts the per-entry trail
over any end ceremony: falsifying records is much harder when every single data entry
would have to be planned and faked, each stamped who · when. So: no per-run sign-off;
entry-time stamping stands; the frozen task sheet + the stamps are the audit. This also
argues against any hard gate that pressures a hand to enter fake data to get past it —
a blocked path is a falsification incentive (see closure ruling below).

**C1 · Marking piglet deaths (question restated in plain terms and answered).** The
question was: when a piglet dies, does the hand expect to just tap minus on the birth
counter, or make an explicit "died" mark? Owner: hands must be able to mark piglets dead
**easily**, both during farrowing and after — not all piglets make it. Ruling: an explicit
death mark sits right on the session sheet beside the counters (one tap, count follows);
minus on a counter remains "I miscounted". While the farrowing task is open, death is
marked in the task; after it closes, in check-in. Both write the same ledger event.

**D-display · Fostering visibility.** Fostered counts (given and received) and the
original birth count belong on the sow detail page — present but secondary, not
immediately obvious in the pen view. Whether that information earns its place at all is
a design-time call; flag it for the render round, default to quiet.

**E2 + closure · Ending batch farrowing.** End task here means "done with farrowing in
this batch". Anyone may close it. Sows that died or aborted leave the batch via their own
verbs, so the remainder at close time is only sows that genuinely have not farrowed.
Owner left open: warn explicitly vs hard-block until all have farrowed. Recommendation
(pending owner confirmation): **warn + doors, never hard-block** — there is always a
legitimate laggard (a sow that was never actually in pig has not farrowed, is not dead,
and is not aborted; she needs a disposition verb, not a birth record). A hard block would
pressure exactly the fake entries the provenance principle (B above) is designed to
prevent. So the close surface lists the unfarrowed remainder as visible choices —
disposition doors per sow (not-in-pig · abort · move to next batch) or close anyway, in
which case they escalate to the strip / check-in and nothing silently expires.

**Still open after this round:** A3 (tag-range ownership), A4 (notch timing), A5
(due-window tolerance), C2 (unexplained count at weaning close), C3 (late-death dating),
C4 (stillborn/mummified split timing), C5 (sow-death session close state), D1 (fostered
piglet's ladder in the receiver crate), D2 (overdue-treatment clinical ceiling), D3
(refusal rendering), E1 (two hands, one room).

---

## 7 · Owner answers — second round (2026-08-27)

**1 · Tags: no range management.** The system never owns or allocates tag numbers — the
farm buys tags, the numbers are whatever is on the hardware, and duplicate purchases are
the farm's own problem. Design consequence: the conveyor's "next number" is a pure typing
convenience, not a managed range — after the hand enters/scans the first tag of a
sequential strip, the next field *suggests* +1, editable, scan always overrides; if a
farm's tags are not sequential the suggestion is simply wrong once and the hand types.
Duplicate tags warn amber inline but never block (downgraded from the identity brief's
"refuse": policing purchases is not our job).

**2 · Notching.** All workflows supported: notch-first, notch-never, notch-only. Notch is
an optional identity field on the same conveyor; for notch-only farms the notch IS the
identity, so lookup-by-notch must exist wherever lookup-by-tag does.

**3 · Due window: hardcoded, no config.** Industry rule encoded as pure frontend logic:
gestation averages 114 days (the "3 months, 3 weeks, 3 days" rule; normal spread roughly
111–117). Encoding: **expected = first service + 114 d**; the row runs forecast register
before day 114, prints nothing during the normal window (zero rule), and flags
**overdue from day 116** (due + 2) — the point at which industry practice says examine
or induce.

**4 · Unexplained count = compliance anomaly.** Confirmed working model: "just set count"
commits and tallies as an anomaly for compliance; at the moment of setting, the hand may
do nothing, add a note, or take the death door. The anomaly count is a console/compliance
surface, not barn chrome.

**5 · Late-death dating: relative words, not date ranges.** Interval honesty stays in the
data, but the UI never asks a hand to pick a date range. The death sheet offers relative
chips: **Today (default) · Yesterday · Not sure** — "Not sure" silently carries the
interval since the last count (the system knows it; the hand is never asked). Display
prints words ("died today", "between Jul 12 and today"), never a picker. To be drawn in
the design round; flagged as a UX-quality gate.

**6 · Stillborn vs mummified: keep both, never force.** Owner asked the analytics value —
it is real and they diagnose different problems: stillborn rate points at farrowing
management (long labors, big litters, sow condition, supervision), mummified rate is an
infectious-disease early warning (mid-gestation infection — PPV/PRRS class), one of the
cheapest herd-health signals a farm has. And mummies are visually unmistakable, so the
classification costs nothing when actually seen. Ruling (owner-corrected): no new
structure — this is the **existing death grammar**: the session sheet tallies **Dead** as
the leading mark, and stillborn/mummified is the *optional cause slot* on that record,
exactly as cause is optional in the Report death drawer. Filled on the spot when obvious,
skipped when not, refined later with ✎; an unclassified record stays "dead" and analytics
degrades gracefully. The earlier "Live + Stillborn counters top, others below" arrangement
in the session brief is superseded: the counters are **Live + Dead**, class rides the
record as optional cause.

**7 · Fosters ride the crate schedule.** Confirmed. The reminder is the quiet row note
(`incl. 3 fostered · 2d older`) — a standing fact line, not a notification.

**8 · Overdue stays overdue.** No conversion in v1; late work back-fills.

**9 · Sync: live when online, last-record-wins offline.** Compatible with the ledger
model: marks are append-only events stamped who·when, so offline collision on the same
crate resolves as the same treatment marked twice — harmless, deduped as same litter ·
same treatment · same day. Last-write-wins only ever bites on scalar edits (a count set
twice offline), where the later stamp standing is the correct outcome anyway.

**All owner questions are now closed.** The suite is ready for the design round.

---

## 8 · Owner review of the first design render (2026-08-27)

1. **Two farrowing models, both first-class.** Attended: one-by-one entry, the sheet is an
   interval tracker between births. Unattended: free farrow — the hand returns ~a day later
   and enters the litter as one batch. Nothing in the UI may assume real-time entry, and
   batch entry must feel designed, not degenerate.
2. **ACTIVE is green.** In-progress rail words unify with the act-now color (s-green);
   applied corpus-wide (screens.html, components.html, farrowing.html).
3. **Live classifications restored** from the old product: 健仔 Healthy · 弱仔 Weak ·
   畸形 Deformed (live = sum) alongside 死胎 Stillborn · 木乃伊 Mummified — counts per class,
   not single-select chips (3 dead must split as stillborn 2 · mummified 1). Unclassified
   entries stay legal, refined with ✎. Supersedes §7.6's two-counter reading.
4. **Save returns to the session sheet.** Save closes the sheet and keeps her Active — the
   explicit "done here for now" checkpoint the hand expects mid-farrowing. Finish farrowing
   remains the litter-closing act. Every entry still commits per tap; Save gates nothing.
5. **The session sheet ruled below standard** — rebuilt in a per-frame optimization round.

---

## 9 · Owner review of the drawers (2026-08-27, round three)

1. **Whole-cell targets, no ink slabs.** The class cells are the tap targets themselves;
   a quiet edge + names the gesture. Filled buttons survive only as the small standard
   stepper squares nothing else on the sheet competes with.
2. **The edited state.** A cell touched this visit washes green and carries its per-visit
   delta (+1 / amber −1) beside the count, so a 7 can never masquerade as "was already 7".
   Deltas clear when the sheet closes; the trail keeps them.
3. **The death drawer is cause-led.** No Died stepper to feed: each tap on a cause cell
   IS one death, the count derives, Record N died writes once — 3 crushed = 4 touches.
   Causes: Crushed · Scours · Starve-out · Unknown cover ~95% of pre-weaning mortality
   records at one tap (crushing alone is typically half or more); Other › opens the farm's
   configured list for the tail. Unknown is a cause, not a failure.
4. **When stays because it is free.** Today default costs zero taps; day-of-death is real
   analytics (crushing clusters in days 1–3; a shift in the curve flags crate or
   supervision problems). Words, never a picker.

---

## 10 · Owner rounds four and five: the form question and the timer (2026-08-27)

**Document over log.** The session sheet is an always-open document — the hand edits state,
never history; the trail is the append-only log the system writes beneath, netted per class
per visit. Corrections are visible as corrections. A +/− pair cancelled within the same
visit is an undo and never reaches the trail; after the sheet closes, a − is a real
correction line. Reclassification is −1 here +1 there, read by the netted trail as a move;
death is always the Died-after-birth door, never minus.

**The form itself is under owner review as two candidates, side by side in 09a:**
A · the cell grid (whole-cell targets, edge +, minus after first touch); B · the classic
stepper form — the old product's own shape completed and restyled (visible − n + per class,
minus dim at 0, no hairlines, derived section totals, tap-the-count-to-type for batch
entry, plus the row the old form was missing: Died after birth). The owner asked for
another round of thinking against how other apps do count forms; the analysis favors B's
familiarity (carts, stock-takes, iOS steppers) over A's larger targets.

**The interval chip: evidence of tracking, not surveillance.** The owner flagged both
failure modes — a stale chip misleads when the hand was merely busy, and leaving for the
night would turn the whole room amber. Ruling: the chip lives only while records are fresh;
amber past ~60 m (the husbandry check-her band); gone past ~90 m rather than stale —
absence makes no claim, so the room fades to calm overnight and the chip returns with the
next tally. Never a threshold config, never a notification, never asked-for times.
