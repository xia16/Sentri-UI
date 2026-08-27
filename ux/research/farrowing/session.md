# Farrowing session cluster — live record · birth counts · completed detail

Ops brief. Slice: production screens 4 (分娩中), 5 (记录分娩), 6 (分娩详情). Binding context:
tasks/farrowing.html (inventory + subtraction — this brief builds on its Δ1–Δ5, not from
scratch); components.html 04d C6 Session; motion.html destiny matrix + contract;
ops/SYNTHESIS.md laws. Production is evidence of scope, not design.

---

## 1 · Ground truth — the room at 2am

A farrowing shift is animal care with data entry losing every contest for the hand's hands.
The physical sequence per sow:

```
nesting/restless ──► first piglet ──► births in bursts (2–8 h) ──► placenta ──► cleanup
   phone: yes          phone: no        phone: in the gaps           phone: yes    phone: yes
```

- Between births the hand dries piglets, clears membranes, sets them on the heat mat, gets
  them to a teat, watches the sow. During a birth or an assist (long glove, arm in the sow)
  the phone does not exist. Touch windows are the **gaps** — 10–40 min apart, wet gloves.
- **Several sows farrow at once.** The hand walks a loop; each sow gets 30 s of attention
  per pass. Any per-sow surface must be reachable, updated, and left in under 10 s.
- Numbers arrive incrementally and are only certain at the end. Live births are witnessed
  one by one (or found as a burst of 3 after an assist elsewhere). Stillborn/mummified are
  often found at cleanup, under the sow. Weak-vs-healthy is a judgment that changes by
  morning. **Total litter size exists only after the placenta.**
- Start time is fuzzy (nobody notes the first piglet's minute); end is fuzzier (is she done
  or pausing?). "Last birth ≈ N min ago" is honest; exact timestamps are fiction.

## 2 · Must capture vs can wait

| In the moment (the hand, in the gap) | Waits / derived (never asked) |
|---|---|
| count increments — live, and dead-found | session start (= first count's timestamp) |
| last birth ≈ N min ago (optional, seeds interval engine) | live/dead totals, cumulative per class |
| the one closing act (Final) | operator · timestamp per tap (auto) |
| — | interval band amber/red (engine) |
| — | Awaiting → Active → Done state |

**Where production over-asks, mid-birth:** five-way classification per session (weak vs
healthy vs deformed is end-of-litter judgment — demand only live/dead live, refine at
cleanup or via ✎); a birth date/time field (the tap is the timestamp); a remark field; the
continue/final toggle + submit pair (a form ceremony where a counter tap suffices);
re-entering totals the system already holds. The five classes stay as counters — but only
Live and Stillborn earn top position; Weak · Deformed · Mummified sit below, expected to be
touched at cleanup, not per birth.

## 3 · Interaction model

Candidates against the chassis:

- **A · Session sheet per sow (C6, anchor).** Row tap opens the session bottom-sheet over
  the list; counters commit per tap; closing loses nothing; reopening resumes. Final is the
  one closing act.
- **B · Room dashboard.** A bespoke all-active-sows tally surface, one card per sow with
  inline ±. Rejected: it is the Active lens re-rendered as a grid — the exact production
  pattern the farrowing subtraction already cut (grid never acts; the list is the room
  view). Eighth chassis smell.
- **C · Record-farrowing page form (production screen 5).** A per-visit increment form with
  submit. Rejected: violates no-submit, makes every gap a form round-trip, and invents
  "session records" the trail derives for free from stamped taps.

**Recommendation: A.** The Session chassis holds without amendment. Simultaneous sows =
the farrowing list on its Active sub-lens, each row carrying live totals + the `LAST 45M`
chip; the loop walk is list → tap sow → ±± → swipe down → next row. One session per sow;
the room view is the list; no new surface. Scan opens the same session (04b).

**Receipts (no submit, no toast):** the counter digit is the receipt of the tap; the row's
totals and the pen header aggregate tick on sheet close; the trail line
(`+2 live · 02:14 · G.H`) appends in place; the interval chip resets to `LAST 0M`. The
completed-farrowing "detail screen" is this same sheet reopened read-only — totals strip +
trail, ✎ per line — production screen 6 dies as a separate surface (farrowing.html Δ3).

**Motion destinies (contract, destiny matrix rows kept):**

| Commit | Destiny | Row becomes |
|---|---|---|
| First count on an Awaiting sow | **B · cross** (sub-lens) | Awaiting → Active — this IS "farrowing started"; no separate start act |
| Every ± tap / session visit | **A · advance** | totals + chip update in place, wash only |
| Final | **B · cross** | lands atop Done, stamped `final 05:58 · G.H` |
| Abortion · sow death (overflow) | **C · exit** | leaves every lens; census ticks; terminal band; 1200 ms read |

## 4 · Edge cases

- **Assisted birth.** No production field (farrowing.html §1 note, open Q4). Until owner
  answers: the Mark flag + pen note carry it; if wanted, it is one chip-toggle on the
  session sheet ("assisted"), not a form.
- **Sow dies mid-farrowing.** Death verb from session overflow → C exit for the sow; the
  session freezes read-only with counts standing (records are the litter's, not hers);
  surviving piglets need an immediate foster Pairing — the death commit should surface the
  orphaned-litter count as its consequence line.
- **Shift change.** The session belongs to the sow, not the operator — re-entering resumes
  (C6 law); every tap stamps who·when, so the trail shows the handover for free
  (`+3 · 05:40 张 · +5 · 23:55 G.H`). Nothing to design.
- **Record started late** (births already happened): counters accept +N in one visit — a
  burst is indistinguishable from a catch-up, by design. The interval engine must not
  trust tap timestamps as birth times: it runs only off "last birth ≈ N min" (production
  annotation 1647:19868 already says so — keep that rule precisely because taps lie).
- **Corrections.** "−" on a counter is pure correction (miscounts), motion A. A piglet that
  dies after birth is **not** a −1 live: it is the death verb writing the piglet ledger
  (2437:4884 — decreases = death/foster/missing), so live-born stays a birth fact and the
  ledger explains the current count. Post-Final corrections: ✎ on trail lines and totals,
  stamped, forever — no locked archive (subtraction already cut it).

## 5 · Open questions for the owner

(farrowing.html §6 Q1–Q6 stand; not repeated. New, from this slice only:)

1. **Counter minus vs death verb** — is the "birth fact vs ledger" split above acceptable,
   or do hands expect −1 on the sheet to mean "one died"? Decides whether the session sheet
   needs a death shortcut beside the counters.
2. **Class refinement after the fact** — moving a piglet Live→Weak (or Weak→Healthy by
   morning) is a reclassification, not a correction. Same ✎, or a distinct move so class
   counts stay auditable?
3. **Sow-death session close** — does her session count as Final (enrolling the litter in
   piglet processing) or a third terminal state? Cleanup may still find stillborns after
   she exits.
4. **Two dead classes at cleanup** — stillborn vs mummified is sometimes only clear when
   the placenta passes. Is one "dead found" counter with later split acceptable, or must
   the pair be asked live?
