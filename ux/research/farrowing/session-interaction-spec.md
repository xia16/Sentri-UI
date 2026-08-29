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
- **Dead** — every type (stillborn · mummified · crushed · scours · starve-out · other)
  lives in **one death drawer product-wide** (09b), opened during farrowing by the
  Report death button; the breakdown prints on the sheet as plain metadata, never a
  disclosure row. Append-only —
  bodies leave the crate; the pile is never re-countable. The type carries the timing
  (stillborn/mummified ⇒ born dead; crushed/scours ⇒ died after) — no timing question,
  **no WHEN anywhere**: the stamp is the date.
- **Born = Alive + Σ Dead (± fosters after they exist).** Derived, displayed, never
  entered. Locks at Finish.

The counted/new ambiguity that haunted every earlier model dissolves mechanically:
- New body found: `+1 crushed`, alive untouched → Born +1.
- Counted piglet dies: `+1 crushed` and alive converged down → Born unchanged.
The hand never answers the question; their two observations encode it.

## 2 · Gestures

| Gesture | Meaning | Ledger event |
|---|---|---|
| Alive − / + / type-to-set | converge to the crate | `alive_assert(n)` — signed delta logged, stamped |
| Record dead button → drawer | at rest every row is read-state: posted count + a lone +. The first + grows the − capsule and the pending chip beside the still posted count — `2 +1`. Every tap commits; − drains pending only, **clamped at pending 0 by construction** — it can never touch posted state. Old over-tallies are corrections and route through Adjust. Done folds pending into posted as one stamped event per type; History keeps the lines | `dead(type)` / `correction(type,−1)` per tap |
| − in the drawer (capsule, once pending > 0) | took one back — undoing this visit's tally, never a death and never a posted correction | `correction(type, −1)`; same-visit pairs net out |
| Adjust (always available, beside Record dead) | THE one correction door for every posted figure: pick the figure → banner → provenance → what happened (miscount · wrong type › · wrong sow) → should-be value. During farrowing plain; post-lock the same surface adds the Born ceremony (More born › / Count was wrong ›) | `correction(…)` / `amendment(…)` |
| Close | closes the sheet — everything already committed; the `saved hh:mm · who` stamp beside History teaches persistence, recency and identity | — |
| Finish farrowing (hidden until any event exists) | shows the run summary, asks "Any weak or deformed?" (healthy = remainder), then Lock born N (hold-to-commit) | `classify(weak n, deformed n)` + `final()` |
| Report death (after Finish) | the same drawer on the record; Born frozen | `death(type)` |
| Foster (after Finish) | Pairing (C7): n moved + receiving sow — the 12–48 h equalization walk; never during farrowing | `foster_out/in(n)` |
| ✎ on the record | stamped amendment, the deliberate exception | `amendment(…)` |

- A counted piglet that dies mid-session: Record dead (+1 type), then converge alive
  down — two taps, Born holds by arithmetic. An alive net-down without a tallied body
  shows the standing reminder line and the Born tick.
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

1. `Born = Alive + Σ Dead + fostered out − fostered in` at every moment, on every device;
   fostering prints on both records (donor `fostered out 2 → 000431`, receiver the mirror),
   and the receiver&#39;s Born stays her own birth fact.
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

1. Dead-type list: stillborn · mummified · crushed · scours · starve-out + Other
   (absorbing the unknowable; farm-configured tail behind it) — confirm the defaults.
2. Is `euthanized` in the default six or behind Other ›?
3. Early classification (optional weak/deformed before Finish): worth the two extra cells
   on the during sheet, or strictly at Finish in v1?

## 7 · Audit rulings applied (2026-08-28, user-flow-audit.md)

- The drawer is state-showing with per-tap commits — the Record ceremony died (dead-path
  blocker B1). Stillborn · mummified lead its list; the button is **Record dead**, named
  for the pile (B3).
- **Save died; Close replaced it** (B4): everything commits per tap, and the
  `saved hh:mm · who` stamp beside History teaches persistence, recency and who (also
  resolving the sheet's missing recency/identity echo).
- Every − on Alive raises a transient *died? record it as dead* hint, and the Born foot
  line ticks visibly (B2). Never a gate.
- Finish is hidden until any event exists; Lock is hold-to-commit and drawn as such; the
  post-lock Adjust warning offers More born › / Count was wrong › (B5, C10, C3).
- Wrong-sow: loud header identity, freshness stamp on idle reopen, and a void-last-visit
  correction (B6).
- Litter weight soft-warns outside ~0.8–2.5 kg per piglet; both optional facts print on
  the locked record with ✎ (C8).
- Trail renamed **History** (count dropped) on the session surfaces (C4).
- Invariant 1 corrected for fostering (C6).
- **Rest is read-state** (owner ruling, round ten): drawer rows at rest show posted
  count + lone +; the − and the pending chip grow in only on touch. Receipt forms, final
  (superseding this bullet's earlier `was N` wording, per the §8 posted/pending
  adoption): under Alive the worded decomposition `5 posted · +4 this visit`; beside a
  touched drawer row the pending chip with posted still — `2 +1`. The owner's round-11
  catch was a *bare* signed number beside a figure reading as a second live count; the
  words and the still-posted anchor resolve it. One live number per field, always.

## 8 · The count-entry pattern adopted (2026-08-28, count-entry-pattern.md)

- **Posted + pending, everywhere a count meets live entry.** Alive: the big number is the
  live total (posted + pending) the hand converges; the decomposition beneath is the
  receipt (`5 posted · +4 this visit`). Drawer rows: posted stays still, the pending chip
  moves (`2 +1`). − drains pending only, clamped by construction; it can never touch
  posted state. Close/Done folds pending into posted as one stamped event.
- **One correction door: Adjust.** Additive surfaces are pure (alive converges, the
  drawer tallies; pending − is free undo, nothing else hides on a gesture). Every
  correction to posted state — alive or dead, during farrowing or after — lives behind
  the small labeled Adjust button: pick the figure → banner → provenance → what happened
  (miscount · wrong type › · wrong sow) → should-be value → committed signed delta,
  ✎ glyph on the figure. Post-lock, the same surface adds the Born ceremony (More born ›
  / Count was wrong ›). An alive net-down without a tallied body shows the standing
  reminder line and the Born tick — a fact line, never a popup. This consolidation
  supersedes the floor-door and tap-the-fact entries (owner ruling: no scattered
  correction entrances).

- **Corrections are events, not edits.** The amend path (post-lock Adjust, cross-session
  fixes) opens a correction flow: state banner ("Correcting a past record — logged with
  your name"), one-tap reason chips (miscount · missed entry · wrong sow), the system
  computes and appends the signed delta, and the amended figure wears a corner glyph
  forever — tap for original → correction · who · when · why. Why is asked only here,
  never on the record path.
