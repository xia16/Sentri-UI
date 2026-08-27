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
