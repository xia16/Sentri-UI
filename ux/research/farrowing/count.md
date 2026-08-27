# Litter count truth — reconciliation as census, not ceremony

Ops brief for the FARROWING suite. Subject: production screen 9 (仔猪数量确认 — reported 18 vs
system 20 → 将自动移除 2 头仔猪, forced reason textarea + 确认无误 checkbox, red wall) and, more
broadly, where litter counts drift between farrowing and weaning. Binding context:
farrowing-figma-context.md (house laws), tasks/farrowing.html (piglet ledger 2437:4884),
tasks/piglet-processing.html (count-confirm ×3 + 补录, its own OQ3), ops/terminal.md §2
(group-row death count sheet), ops/pen-ops.md §2.3 (Set count), motion.html (destiny C — the
census tick is the receipt), SYNTHESIS.md laws 1–3.

---

## 1 · Ground truth — where hands actually count

- **At farrowing** — the five steppers, per session. The only count born as data, not as a check.
  Feeds 窝均活仔 (avg live/litter vs target 12) — the KPI wall, and often pay.
- **At processing days** — the real recounts. Day-3/day-5 tag/notch/weigh puts *every piglet in a
  hand*; the count is a free by-product of the work, the most trustworthy number of the week.
  Bulk-treatment days (drops, iron) are weaker: the hand treats a wriggling pile, doesn't count it.
- **At fostering** — the moved n is counted exactly (you carry them); both litters' counts move.
- **At weaning transfer** — unavoidable count: piglets loaded per crate, and the number the nursery
  *receives* is the number farrowing is judged against. The cross-team handoff makes this the most
  load-bearing count after born-alive.
- Daily crush checks count **deads found**, not lives — which is exactly why drift accumulates:
  a crushed piglet pulled out at 05:30 is a death event only if someone opens the app.

**Why under ≠ over.** Under-report (physical < system) is almost always an *unrecorded death* —
common, expected, mortality-shaped; silently absorbing it (production's auto-remove) launders
pre-weaning mortality out of the stats (piglet-processing.html OQ3: removal bypasses the death
flow that sits one button away). Over-report (physical > system) is rarer and never a death: a
missed farrowing increment, an unlogged foster-in, or piglets recorded to the wrong litter — each
with batch/genetics consequences. Production's symmetric auto-add *invents* piglets with no origin.

## 2 · The truth model

`system count = Σ farrowing live-born − recorded deaths ± recorded fosters` — the piglet ledger
production itself annotated (2437:4884: up = own birth · foster-in · unknown; down = death ·
foster-out (receiver mandatory) · missing). A fresh physical count that disagrees is not an
anomaly; it is **news that one ledger line is missing**. The possible truths for −2: two
unrecorded deaths · an unlogged foster-out · a farrowing miscount · (if identity rows exist) two
specific piglets missing. For +2: a missed birth record · an unlogged foster-in · a wrong-litter
recording elsewhere.

Production's dialog collapses all of these into "auto-remove 2 + free-text blame". terminal.md
already holds the correct primitive: **un-identified group death is one count sheet, count +
cause, commits once** — and its OQ6 already flags the boundary ("Died n ≥ group count hands off
to count correction"). Reconcile: the delta is not a new record type. It is a **router to the
three existing verbs** — the group-death count sheet (pre-filled Died = 2), the foster Pairing,
and pen-ops' Set count. "Auto-remove" dies; nothing is ever removed anonymously *by the system* —
the hand's assertion commits, and what the delta *was* renders as a visible choice.

## 3 · Interaction model

House chassis; visible-choice law; no red wall, no checkbox, no forced textarea, nothing disabled.

**A · Count row → delta choice (count-subject drawer, recommended).** The litter record's count
row (`20 head · incl 3 fostered · counted jul 12`) opens the Set-count drawer variant: stepper,
commits on change (pen-ops §2.3 mechanics). Session net Δ ≠ 0 reveals the choice inline, sign-
filtered exactly like pen-ops' reason — but here the options are *doors, not labels*:
`Record 2 deaths ›` (group-death drawer, Died pre-filled, litter conditions pre-selected) ·
`Record a foster ›` (Pairing, count pre-filled) · `Just set count` (commits `Count set · 20 → 18`,
trail carries `2 unexplained`). Down-sign; up-sign reads `Record births ›` (a farrowing-record
addendum) · `Record foster in ›` · `Just set count`. Choosing a door writes the *real* event and
the count re-derives — no second write. Receipt: destiny C, census ticks on the litter row and
the pen header; the explained line lands in the trail (`was 20 · 2 deaths · since jul 12`).

**B · Assertion-first conveyor step.** The weigh/wean conveyor already produces a count as a
by-product; on disagreement the same choice renders as the next sheet in the run. Same model as A,
different door — keep, because weaning is where drift is most often *found*.

**C · Silent set + later triage (rejected).** Always commit the set, queue unexplained drift to a
console inbox. Rejected barn-side: the hand standing at the crate is the only person who knows
whether it was a crush or a foster; deferring the question discards the knowledge at its cheapest
moment. (The console still *sees* unexplained trail lines — §4.)

Recommend **A**, with B as its conveyor rendering. The count assertion always commits (no gate —
a required reason would be a submit button wearing a hat, pen-ops OQ1); the choice makes the
honest path the cheap path: recording 2 deaths is one pre-filled drawer, not a penalty essay.

## 4 · Edge cases

- **Over-report.** Never auto-add. `Record births` appends a dated farrowing session (the litter's
  born-alive KPI moves honestly, stamped); foster-in takes source sow or `unknown` (production's
  own ledger allows unknown-in, never unknown-out). `Just set count` up leaves `2 unexplained` in
  the trail — legal, visible, ugly on purpose.
- **Identity-tagged piglets.** Anonymous decrement may only draw on the *untagged remainder*. If
  the litter has 9 identity rows and the delta exceeds untagged head, the death door becomes a
  roster (04d): name which tagged piglets — each a per-pig death/missing record, terminal.md
  conveyor rules. A tagged piglet is never subtracted namelessly.
- **Day-3 vs weaning.** Same surface both times; what differs is the date honesty. Drift found at
  weaning back-dates only to "since last count" — the event carries the interval, not a fake
  timestamp. The weaning transfer always carries the *counted* number; reconciliation never blocks
  the crate leaving.
- **Repeated drift, one crate.** Two+ unexplained-down events on one litter is a process signal
  (crush-check discipline, or a hole in the crate) — a console report over the trail lines, not
  barn chrome; the zero rule keeps the row clean. Threshold configurable.

## 5 · Open questions for the owner

1. Is `Just set count` (unexplained) legal at weaning close, or must the litter reconcile to zero
   unexplained before transfer? Gating contradicts "assertion always commits" — needs a call.
2. Who may amend the farrowing record itself (born-alive correction via `Record births` / a
   negative miscount)? It moves the KPI that pay may ride on — permission gate or open ✎?
3. Death events found late: default date = interval midpoint, interval-stamped, or found-date?
   Affects mortality-by-day analytics downstream.
4. Foster door from the delta: is the receiving sow mandatory there too (production says yes for
   foster-out), or does "moved, receiver unknown" exist as an honest intermediate?
5. Repeated-drift threshold and surface (console report vs unit sheet) — undesigned.
6. terminal.md OQ6 boundary: `Died n` ≥ group count inside the death drawer should bounce to this
   count surface — confirm the two doors reference one shared component.
