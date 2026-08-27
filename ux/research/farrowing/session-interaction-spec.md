# Farrowing session — interaction spec

The state model and event grammar behind the session drawer, written before further
design. Companion to [SYNTHESIS.md](SYNTHESIS.md) §5–11; supersedes any drawn detail in
farrowing.html 09a where they disagree.

---

## 1 · The two numbers and why neither is entered

- **Born** — how many piglets this sow produced. A historical fact. Grows only by birth
  events; shrinks only by miscount corrections. Locks at Finish (amendable afterward only
  through a deliberate, stamped ✎ amendment).
- **Alive now** — the living census. Moves with deaths and fosters. Never locks, because
  dying doesn't stop when the record closes.

Both are derived. There is no field anywhere that accepts "Born = …" or "Alive = …", which
is what makes person B unable to corrupt the birth record by reading the wrong number.

## 2 · Event grammar

Every interaction emits an **event** into the litter's append-only ledger, stamped
who · when · device. The steppers emit **deltas, never absolute values** — this is what
makes two hands tallying concurrently merge correctly (two +1s from two phones are two
births; a last-write-wins "set healthy = 5" would eat one).

| Event | UI path | Born | Born-alive | Alive now |
|---|---|---|---|---|
| `birth(class)` | + on an alive class (healthy / weak / deformed) | +1 | +1 | +1 |
| `birth_dead(class)` | + on stillborn / mummified | +1 | — | — |
| `dead_found(cause?)` | dead-cause + → instant (Alive = 0) or `new` chip | +1 | if died-after | — |
| `miscount(class)` | Readjust mode: − or set | −1 | per class | per class |
| `death(cause, when)` | dead-cause + → `counted` chip (during) · Report death (09b, after) | — | — | −1 |
| `death_amend / retract` | ✎ on a death line in the record | — | — | +1 if retracted |
| `recount(class, n)` | numpad: up-only in tally, absolute in Readjust | sets | sets | derives |
| `foster_out / in (n)` | Pairing | — | — | ∓n |
| `count_assert(n)` | count drawer (09e) | — | — | routes via doors |
| `final()` | Finish farrowing | locks | locks | — |
| `birth_amendment(…)` | ✎ on Born, post-final | ±, stamped | ± | derives |

**Class taxonomy.** Alive classes: healthy · weak · deformed — healthy is the default; there
is no "alive, unclassified". Dead classes ARE causes, and each implies its birth status:
crushed ⇒ born alive (then died); stillborn / mummified ⇒ born dead; unknown ⇒ born, status
unknown. The hand records what the eye sees; the routing derives.

**Two gestures and a mode — one surface, no doors, no tabs (owner rulings):**
- **+ on a class** is the only tally gesture. If a pig is born, it is — no − beside it.
- **Readjust** is an explicit button entering correction mode: only there do classes show
  − and absolute set; every change logs as a `miscount`/reclassification. Deaths cannot
  be recorded in Readjust — one line says so.
- **There is no Died door during farrowing.** The dead-cause cells ARE the death path;
  the separate Report-death drawer (09b) exists only after Final and in check-in.

**How a dead-cause + resolves without a second surface.** The classes carry the answer:
- `Stillborn` / `Mummified` — born dead by definition. Commits instantly. Born +1.
- `Crushed` / `Scours` / `Unknown` / `Other ›` — a dead body of this cause. The one real
  ambiguity is whether this body was already in the alive count. If the litter&#39;s Alive
  count is **zero**, there is nothing it could have been counted in — commits instantly
  as a new find (Born +1; for a died-after cause that is birth + death in the ledger;
  for Unknown, timing stays unknown). If Alive &gt; 0, two chips slide out on the same
  row — **`counted` · `new`** — one tap: `counted` keeps Born and drops Alive (the
  attended mid-session death); `new` adds the body (Born +1). Same sheet, same row, one
  extra tap only when the question is real.
- The two unknowns collapse: a counted piglet dead of unknown cause and an uncounted body
  of unknown everything are both a tap on `Unknown` — the chip answer tells the ledger
  which it was; the hand never sees the distinction.
- Order never breaks correctness, only tap count: a morning hand who tallies the dead
  pile before the living answers zero questions; one who counts the living first answers
  `new` per body. Either order sums.

Residual risk (a hand hiding a death as a Readjust decrement) is accepted: the correction
mode is more friction than the cause cell beside it, and the decrement visibly drops Born.

**Typing counts.** In the default sheet, tapping a count opens the numpad but only counts
*up* — typing 12 over 4 records 8 births (the morning-pile case); typing down is refused
with a one-line pointer to Readjust. Inside Readjust the numpad sets absolutely.

## 3 · Invariants — always true, for anyone, at any time

1. `Born = born-alive + born-dead + unknown-timing bodies`
2. `Alive now = born-alive − deaths − fostered out + fostered in`
3. Every dead piglet has exactly one ledger line saying what kind of dead.
4. Nothing is ever deleted. Wrong records are corrected by appended, stamped events
   (miscount, amend, retract) that are visible *as corrections*.
5. The trail nets per class per visit; a same-visit +/− undo pair never reaches it.
6. Sum the ledger at any moment, on any device, and the story adds up — this is invariant
   1+2 restated as the product promise: **the numbers always sum for the next person**.

## 4 · Scenario walkthroughs

### During the tally (attended)
- Birth: + healthy (or weak/deformed). Born and Alive tick.
- Born dead: + stillborn. Born ticks, Alive doesn't.
- Counted piglet dies, body tossed in the bucket: `+ Crushed` → chips slide out →
  `counted`. Born 10 stands, Alive 5, crushed 2. Two taps, same sheet. **Removal of the body is physical, not digital** —
  the death event already told the story; carcass disposal is out of scope in v1.
- Mis-tap: Readjust → −. Two taps, deliberate; a same-visit correction nets to nothing in the trail.
- Numpad: tap the count, type 12 — records the difference as births (up-only in the
  default sheet). Absolute sets exist only inside Readjust; concurrent sets, later stamp
  wins, deltas after it apply on top.

### The morning after (unattended)
One pass, one surface — dead pile first, then the living, and zero questions: crushed 2 ·
stillborn 1 · mummified 1 · unknown 1, then the alive classes. Born derives 10. (Living
first also works; each pile body then takes one `new` chip tap.) The trail records one stamped
visit; no birth times are pretended, so the interval engine stays silent.

### Two people, one litter
- **Sequential (the person-B case):** A records 7 born, 1 died. B opens the sheet an hour
  later: `Born 7 · Alive 6`, trail says who and when. B counts 5 → taps the death they
  found (or asserts the count and takes a door). Born untouched, by construction.
- **Concurrent, online:** both sheets live-update; delta events interleave harmlessly.
- **Concurrent, offline:** ledgers merge as a union of events (append-only, event-ids
  dedupe). Only `recount`/`count_assert` are absolute — later stamp wins. No birth is
  ever lost to a sync conflict.

### Seeing the pen (the row, without opening the sheet)
Row grammar proposal: **line 1 is now, line 2 is the record.**
- Active: `5 alive · 3 dead` + interval chip when fresh; line 2 `born 10 · started 6h · parity 3`.
- Done: `5 alive` (the pen census term); line 2 `born 10 · final jul 8 · G.H`.
The pen header census counts living animals only; Born lives in the record. (Open q 1.)

### Discovered later (task closed)
- Death days later: check-in → Report death (09b) — cause + when-words; `since final`
  accrues on the record. Alive ticks down; Born frozen.
- **Extra live piglet** (record says 7, eyes say 8): not the session sheet — the count
  drawer's up-delta doors (`record births` amendment · `foster in` · `set count`). This is
  the one correction "after = only report death" doesn't cover, and it routes through the
  count surface instead. (Open q 3.)
- Wrong death (marked died, she's alive): ✎ on the death line → retract, stamped; Alive
  restores. The line stays visible as a retracted event. (Open q 4.)

### The sow who never finishes
Finish is always human — no auto-final, and (owner ruling) **no staleness tracking
either**: no threshold, no escalation prompt. Absence of records makes no claim — the
same law that makes the interval chip fade instead of lie. An abandoned Active sow simply
stays Active, and her row already carries the story as a plain fact (`started · yesterday
· L.M`) that any hand walking the room reads without machinery. Closure discipline, if a
farm wants it, is a console report over the stamps — never barn chrome. Both farrowing
models remain first-class: supervised farrowing is standard modern practice on intensive
farms (induction into staffed hours, attendants raising born-alive survival), and
unattended free farrow is equally real where labor is short.

## 5 · Open questions before design resumes

1. Row grammar "line 1 = now, line 2 = record" — confirm, incl. the Done row dropping
   "Final · 11 live" for "5 alive / born 10 · final …".
2. ~~Minus asks~~ — resolved by the owner's Readjust ruling: no − on the default sheet
   at all; corrections are a deliberate mode, deaths are the Died door, the question dies.
3. Post-final discovery of an *extra live* piglet routes through the count drawer's doors,
   not the session sheet — ok?
4. Wrong-death correction = visible retract event (never deletion) — ok?
5. ~~Active-sow staleness prompt~~ — resolved: no tracking, no prompt; the row's stamp is
   the only signal. Finish stays human.
6. Inside Readjust, may dead-cause cells be typed absolutely too, or − only (a big typed
   number on a cause is almost always an error)?
