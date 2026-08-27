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
| `dead_found(unknown)` | + on Unknown (a body whose timing can't be told) | +1 | — | — |
| `miscount(class)` | − → "miscount" | −1 | per class | per class |
| `death(cause, when)` | − on an alive class → "died ›", or Report death (09b) | — | — | −1 |
| `death_amend / retract` | ✎ on a death line in the record | — | — | +1 if retracted |
| `recount(class, n)` | tap the count, type on numpad | sets | sets | derives |
| `foster_out / in (n)` | Pairing | — | — | ∓n |
| `count_assert(n)` | count drawer (09e) | — | — | routes via doors |
| `final()` | Finish farrowing | locks | locks | — |
| `birth_amendment(…)` | ✎ on Born, post-final | ±, stamped | ± | derives |

**Class taxonomy.** Alive classes: healthy · weak · deformed — healthy is the default; there
is no "alive, unclassified". Dead classes ARE causes, and each implies its birth status:
crushed ⇒ born alive (then died); stillborn / mummified ⇒ born dead; unknown ⇒ born, status
unknown. The hand records what the eye sees; the routing derives.

**The two paths to a dead piglet, disambiguated by path, not by question:**
- **+ on a dead class** = a body not previously counted (the morning pile). Born +1.
- **− on an alive class → died ›** = a counted piglet is gone. Born stands, Alive −1.

**Minus always asks.** − on an alive class always offers exactly two words: `miscount`
(the birth never happened) or `died ›` (cause follows). No timing heuristics, no silent
guessing — predictable beats clever. A miscount that cancels a + from the same visit nets
to nothing in the trail; − on a dead-class cell is always a miscount (a body can't die
twice).

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
- Counted piglet dies, body tossed in the bucket: − healthy → `died ›` → crushed.
  Born 10 stands, Alive 5, crushed 2. **Removal of the body is physical, not digital** —
  the death event already told the story; carcass disposal is out of scope in v1.
- Mis-tap: − → miscount. Two taps, trail stays clean (same-visit net).
- Numpad: tap the count, type 12 — a `recount` assertion (absolute). Concurrent recounts:
  the later stamp wins, deltas after it apply on top.

### The morning after (unattended)
One pass, one surface: alive classes for the living, dead-class taps for the pile —
crushed 2 · stillborn 1 · mummified 1 · unknown 1. Born derives 10. No born-dead vs
died-after question is ever asked; the causes answer it. The trail records one stamped
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
2. − always asks (two-word choice, predictable) vs silent timed undo for an immediate
   re-tap — spec chose always-ask; confirm.
3. Post-final discovery of an *extra live* piglet routes through the count drawer's doors,
   not the session sheet — ok?
4. Wrong-death correction = visible retract event (never deletion) — ok?
5. ~~Active-sow staleness prompt~~ — resolved: no tracking, no prompt; the row's stamp is
   the only signal. Finish stays human.
6. Numpad `recount` allowed on dead-cause cells too, or steppers only for causes (a big
   typed number on a cause is almost always an error)?
