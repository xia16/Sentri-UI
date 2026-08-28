# Farrowing session — interaction spec (final model)

The state model behind the session drawer. Supersedes all earlier drafts of this file and
any drawn detail in farrowing.html 09a where they disagree. Decided across owner rounds
four through nine; the discarded intermediate models (class steppers, tally chips, the
counted/new question, the Died door, append-only logs) live in git history.

---

## 1 · The model — a picture of the crate

The sheet shows two numbers a hand can physically observe, and derives the fact:

- **Alive** — one number, no classes: the hand converges it to the crate with − / + (or
  taps the framed count and types). Live piglets stay in the crate, so the total is always
  re-countable; nobody computes a delta or knows "which are new".
- **Dead** — one side, every type together: stillborn · mummified · crushed · scours ·
  starve-out · other (absorbing the unknowable). **Append-only** (+), because bodies leave the crate and
  the pile is never re-countable. Each type is tallied as found; the type itself carries
  the timing analytics needs (stillborn/mummified ⇒ born dead; crushed/scours ⇒ died
  after) — no timing question, and **no WHEN anywhere**: the stamp is the date.
- **Born = Alive + Σ Dead.** Derived, displayed, never entered. Locks at Finish.

The counted/new ambiguity that haunted every earlier model dissolves mechanically:
- New body found: `+1 crushed`, alive untouched → Born +1.
- Counted piglet dies: `+1 crushed` and alive converged down → Born unchanged.
The hand never answers the question; their two observations encode it.

## 2 · Gestures

| Gesture | Meaning | Ledger event |
|---|---|---|
| Alive − / + / type-to-set | converge to the crate | `alive_assert(n)` — signed delta logged, stamped |
| + on a dead type | one more body of this type | `dead(type)` — append |
| − on a dead type (cart capsule, shown once n > 0) | took one back — an over-tally correction, never a death | `correction(type, −1)`; same-visit pairs net out |
| Adjust | in the bar beside Save: the only place anything counts down — − / set on both sides, logged as corrections; after the lock it warns first ("Born 14 is locked — adjusting amends the record. Continue?") and stamps as an amendment | `correction(…)` / `amendment(…)` |
| Finish farrowing | shows the run summary, asks "Any weak or deformed?" (healthy = remainder), then Lock born N (hold-to-commit) | `classify(weak n, deformed n)` + `final()` |
| Report death (after Finish) | same dead-type tally on the record; alive drops; Born frozen | `death(type)` |
| ✎ on the record | stamped amendment, the deliberate exception | `amendment(…)` |

- A counted piglet that dies mid-session: tally the body on the dead side, then Adjust
  alive down — Born holds. Adjust reminds inline that a found body belongs on the dead
  side before alive comes down.
- **Classification happens once, at Finish**, phrased as the question a hand would ask —
  *any weak or deformed?* — with healthy deriving as the remainder. Optional earlier,
  never demanded.
- **Two optional facts ride the Finish sheet**, never gating the lock: **litter weight**
  (one number, kg — avg birth weight is a standard survival KPI where a scale exists) and
  **assisted farrowing** (one checkbox — sow-level dystocia fact feeding her breeding
  record). Skippable in one glance; stamped when filled.
- Same-visit +/− pairs net to nothing in the trail; the trail nets per type per visit;
  the ledger is append-only, stamped who · when, merged as a union across devices
  (deltas and appends interleave safely; asserts resolve by later stamp).

## 3 · Invariants

1. `Born = Alive + Σ Dead` at every moment, on every device.
2. Born is never directly editable; it moves only through the two observable numbers
   (before Finish) or stamped amendment (after).
3. Every dead piglet is one tally in exactly one type.
4. Nothing is deleted; corrections append, stamped, visible as corrections.
5. The attended hand, the revisiting hand, and the morning-after hand perform the same
   gesture: **make the screen match what you see.**

## 4 · Accepted costs (owner-signed)

- A piglet that vanishes without a body (savaged) reads as alive-down with no dead tally,
  and Born quietly drops during farrowing. The hint mitigates; post-Finish the case must
  route through Report death because Born is locked.
- A double-tapped body inflates the pile permanently unless Adjusted — the pile is not
  re-countable, so the system cannot catch it.
- No WHEN means death dates equal record dates; at daily-walk granularity this is the
  accepted precision. Mortality-by-day analytics reads stamps.

## 5 · Walkthroughs

- **Attended**: sees a birth → alive 4→5. A counted one gets crushed → `+1 crushed`,
  alive 5→4. Born: 4 alive + 1 dead = 5, unchanged. ✓
- **Revisit (the walkthrough that killed append-only)**: logged 5, returns, sees 9 → taps
  + until 9 (or types 9). No memory, no math, no knowing which are new. ✓
- **Morning after**: alive → 5; pile → crushed 2, stillborn 1, mummified 1, unknown 1.
  Born derives 10. Identical gesture set to the attended flow. ✓
- **Person B**: reads Born 10 · Alive 5; counts 5 → touches nothing. Counts 4 → either
  tallies the body they found, or Adjusts if they judge a miscount. Born never accepts a
  direct write. ✓
- **Finish**: alive 9 → classify weak 1 · deformed 1 → healthy 7 derives → Born 14 locks.
- **The deformed piglet they euthanize**: Report death · type `euthanized` — a death like
  any other; "cull" remains a breeding-stock concept, piglets never need it.
- **After Finish**: only Report death (and stamped ✎ amendments). An extra live piglet
  discovered later routes through the count drawer's up-doors (09e), not this sheet.

## 6 · Open questions

1. Dead-type list: stillborn · mummified · crushed · scours · starve-out · unknown +
   Other › (farm-configured tail) — confirm the six defaults.
2. Is `euthanized` in the default six or behind Other ›?
3. Early classification (optional weak/deformed before Finish): worth the two extra cells
   on the during sheet, or strictly at Finish in v1?
