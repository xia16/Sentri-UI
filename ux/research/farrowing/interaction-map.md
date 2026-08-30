# Farrowing drawer — the complete interaction map (low-fi requirements)

> **RULINGS.md outranks this file where they disagree.** The 2026-08-29 rulings round
> answered §9's questions and pinned the §8 placements; both sections carry the answers
> inline, marked RULED. The developer-facing rendering of this contract is
> `ux/system/farrowing-contract.html` (every state, transition, element state, constant,
> and sync rule) — keep the two in lockstep.

Every action and interaction inside the farrowing drawer suite, walked path by path, with
no UI. This file reconciles session-interaction-spec.md, user-flow-audit.md,
count-entry-pattern.md, the owner rulings in SYNTHESIS §6–§12 and RULINGS.md, and the
drawn state of farrowing.html 09/09a/09b. Where those sources disagreed, the later ruling
stands and §7 records every disagreement found. Where an interaction existed in no source
at all, §8 proposes the requirement and marks it for owner sign-off.

Two design metrics govern every row here, per the owner's brief:

- **Ease** — a hand completes the whole farrowing task from the session sheet. The only
  surfaces that ever open on top of it are the three sanctioned doors (Record dead ·
  Adjust · Finish) and the read-only History. Nothing else may grow a screen.
- **Cleanliness** — one axis per zone, one resting control per figure, no affordance on
  anything that is not tappable. The inventory below therefore lists the dead zones too:
  an unaccounted-for tap target is an inconsistency even when it does nothing.

---

## 0 · The state machine

### Sow states (the room's registers)

```
                    first count event ────────┐
                                              ▼
  AWAITING ────────────────────────────────► ACTIVE ──── Lock born N ────► DONE
     │                                        │                            │
     │                                        │  sow dies (Report death    │  (record;
     │  disposition at batch close            │  on HER page, not here)    │   never a
     │  (not in pig · abort · next batch)     ▼                            ▼   lens exit)
     ▼                                     ENDED · sow died            stays in Done/All
   leaves the batch                        (terminal; Born derives from
                                            what stands, classification
                                            skipped — amendable via Adjust;
                                            litter record survives with an
                                            orphan-count Foster prompt;
                                            she exits every lens, motion C)
```

- Opening a sheet **never** changes state. Only a written event crosses her: the first
  count event crosses Awaiting → Active; Lock crosses Active → Done.
- **Registers derive from posted state** (2026-08-30, from the misclick walk): a session
  recounted or corrected back to all-zero reads Awaiting again — a stray first tap
  un-crosses itself, History keeps the lines, no revert affordance exists or is needed.
- Done and Ended are terminal for the session. Post-lock/post-end events (deaths,
  fosters, amendments) write to the record; they never reopen Active.
- The started mark is KILLED (owner, 2026-08-29 — see RULINGS): no `started` event, no
  `Started · no record yet` register, no revert path. Labor observed with nothing to
  record is a word to the next shift, not an app event. `started hh:mm` everywhere now
  means the first record.
- Sow death mid-farrowing (RULED, was C5): sow verbs never live on the litter sheet —
  that is why the button says Record dead, not Report death. Her death is recorded on
  her: tap her identity (the sh2 tag block / her identity on the room row) → sow page →
  Report death. The event itself ends the session as `ended · sow died`.

### Sheet modes (one sheet, four faces)

| Mode | When | Zones present |
|---|---|---|
| Pre-start | Awaiting sow opened | header · Alive at 0 · `Record dead` · bar `Close` — nothing else exists yet |
| During | Active | header · Alive hero · record block · bar `Close · Finish` |
| Finishing | Finish tapped | summary · classification · optional facts · bar `Back · Lock` |
| After | Done | header · locked figures · read lines · History · bar `Adjust · Foster · Record dead` |

### Drawer modes (one dead drawer, four contexts)

| Mode | Entered from | Header context | Difference |
|---|---|---|---|
| During | Record dead on the During sheet | `farrowing · N alive` | plain tally |
| Post-lock | Record dead on the After bar | `final <date> · N alive now` | tally decrements derived alive-now |
| Check-in | the litter row's death entry | litter context (day N · N alive) | same component, surface's own context (audit C2) |
| Roster | any context, once anonymous remainder = 0 | as host | tallies name a tagged piglet (§8-G8) |

---

## 1 · Entry points — every way a hand reaches these surfaces

| # | Entry | Opens | Notes |
|---|---|---|---|
| E1 | Room row tap, Awaiting sow | sheet · Pre-start | a peek writes nothing |
| E2 | Room row tap, Active sow | sheet · During | |
| E3 | Room row tap, Done sow | sheet · After | the ✎ on the row is a glyph, not a separate target |
| E4 | Scan ear tag (dock) | her sheet in whatever mode her state dictates | also resolves a sow not in this room's list |
| E5 | (retired 2026-08-29 — the started mark was killed; farrowing starts at the first recorded event, E1/E2) | — | number kept so later references stay valid |
| E6 | Check-in litter row death entry | dead drawer · Check-in mode | must be this same component (cross-surface debt) |
| E7 | Count drawer down-door `Record N died` | dead drawer, pre-filled mode | 09e scope; drawer must accept a target count (§8-G9) |
| E8 | Her identity (sh2 tag block; her identity on the room row) | sow page | RULED with the sow-death ruling; the route to every sow verb. Row-level target geometry vs the row-tap-opens-sheet rule → §9-Q1 |

Non-entries, deliberate: no notification ever opens a sheet; the interval chip is not
tappable; pen headers navigate the room, never a sow.

---

## 2 · Surface-by-surface contract

Grammar of every row: **element → gesture → what commits → receipt → where you land.**
"Commits" always means an append-only ledger event stamped who · when, live-synced,
union-merged offline.

### 2.1 The room (09)

| Element | Gesture | Commits | Receipt | Lands |
|---|---|---|---|---|
| Lens `Awaiting / Active / Done / All` | tap | — | list refilters, counts shown in lens | room |
| Filter | tap | — | filter sheet (chassis-standard) | room |
| Sow row | tap | — | — | sheet (mode per state) |
| Row identity (tag) | tap | — | — | sow page (E8 — geometry §9-Q1) |
| Goto pen | tap | — | list scrolls to pen | room |
| Scan ear tag | tap → scan | — | — | her sheet |
| Task overview › | tap | — | — | overview |
| Back ← | tap | — | — | Today |

Dead zones: the interval chip (`last 45m`), the day chip (`day 117`), line-2 metadata,
pen headers, the `Last record 23:10 · L. Meyer` appbar line. None tappable.

Row grammar (the receipts this surface owes):

- Active, attended: line 1 `9 alive · 5 dead` + interval chip while fresh; line 2
  `born 14 · started 6h`. (Parity dropped from Active line 2 — three facts truncated at
  render width, and parity is stable background living on the sheet and the Awaiting
  rows. Drawn-round deviation, 2026-08-29.) The chip runs off record stamps: present
  while the last record < ~60 m, amber ~60–90 m, gone past ~90 m. Absence makes no claim.
- Unattended / free farrow: no start state — she rides Awaiting (forecast → due →
  overdue red chip) until the batch entry, which crosses her to Active and typically
  runs straight to Finish in the same visit.
- Awaiting: forecast register (`Expected · in 2 days` light) → `Due today · day 114` →
  red chip from day 116 (`No record · day 117`); parity rides line 2 here, where it aids
  prediction. Rows carry no controls.
- Done: `11 alive` (alive **now**, ticking with post-lock events) / line 2
  `born 13 · final 05:58 · G.H` — drawn in the 2026-08-29 round; B4 resolved.

### 2.2 Session sheet · Pre-start (the zero face — placements RULED)

| Element | Gesture | Commits | Receipt | Lands |
|---|---|---|---|---|
| Alive `− 0 +` / type | first + or set | `alive_assert` | as During; crosses her to Active — counting IS starting | During |
| Record dead | tap → drawer | `dead(type)` per tap | as During; crosses her to Active | drawer |
| Sheet identity (sh2) | tap | — | — | sow page (E8) |
| Close / grab / backdrop | tap or swipe | — | nothing written, still Awaiting | room |

- No start ceremony (the mark is killed): the only controls are the ones that record —
  the Alive counter and `Record dead`. The first event IS the start.
- Finish absent (no event exists). Adjust absent (nothing posted to correct — the one
  state where the door has no figures; hiding beats a dead door, and "no dim-as-disabled"
  stays intact because nothing is drawn disabled).
- Header vit shows her due line (`due today · day 114` / `day 117`); `started hh:mm`
  appears only once records exist, meaning the first record.
- The batch-entry morning case needs no special mode: the hand converges Alive and
  tallies the pile exactly as During; the first event backfills the cross.

### 2.3 Session sheet · During

| Element | Gesture | Commits | Receipt | Lands |
|---|---|---|---|---|
| Alive `+` | tap | `alive_assert(+1)` | count ticks; receipt line recomputes; Born foot ticks | — |
| Alive `−` | tap | `alive_assert(−1)` | count ticks; clamps + grays at the floor; a tap on the grayed − shows the two pointers (§2.3a) | — |
| Alive framed count | tap | — (opens pad) | pad grows in; typing previews | pad inline |
| pad set | confirm digit entry | `alive_assert(n)` absolute | as above | pad folds |
| Record dead | tap | — | — | dead drawer |
| Adjust | tap | folds pending first (RULED) | — | Adjust picker |
| Sheet identity (sh2) | tap | — | — | sow page (E8) |
| History › | tap | — | — | History (read-only) |
| Close | tap | folds pending → one stamped visit event | room row updates; `saved hh:mm · who` was already live | room |
| Grab swipe / backdrop tap | swipe/tap | same as Close | same | room |
| Finish (hidden until any count event) | tap | — | — | Finishing |

Dead zones: `Born 14 · Dead 5` (derived — no tap-the-fact, one-door law), the breakdown
metadata line, the receipt line, the saved stamp. The header identity is no longer dead:
it is the one door to the sow page (E8) — the wrong-crate tripwire and the sow-verb
route in a single, honest place.

**2.3a · The Alive floor model (owner-ruled 2026-08-30 — the clamp, every figure):**

- Big number = live total = posted + pending. Receipt = words, always:
  `5 posted · +4 this visit`; with bodies tallied and alive brought down,
  `5 posted · −2 this visit` (§8-G2 for the drawn form). The receipt never mentions the
  floor — the grayed − carries it.
- `+` is free. `−` drains this visit only and clamps at
  **floor = posted − dead tallied this visit** — the drawer unlocks the steps down,
  physically enforcing drawer-first for deaths. Type-to-set clamps identically.
- At the floor, `−` grays out — the suite's ONE disabled control (scoped owner exception
  to no-dim-as-disabled). Tapping it writes nothing and shows two quiet pointers in the
  reserved line for ~4 s (draft): `Pigs died? Record dead` · `Count wrong? Adjust`.
- Consequence, by construction: **Born can never drop silently.** Every drop is bodies
  or a stamped Adjust reason; the savaged accepted-cost is deleted — a vanished piglet
  is `Adjust → Gone · no body`, a stamped truth.
- Every tap commits its event immediately (crash-safe); Close nets the visit into the
  trail as one line. Same-visit +/− pairs net to nothing.

**2.3b · Wrong-sow and idle:**

- Idle reopen (no record ≳ 90 m): the sheet leads with its freshness stamp before the
  hand can tap — the wrong-sow tripwire (audit B6).
- The 3am wrong-crate discovery routes through Adjust → Wrong sow (§8-G6): scope choice
  *this visit* (the void-last-visit fix) or *one figure*, then the receiving sow; both
  records take mirrored, stamped events.

### 2.4 The dead drawer (09b)

| Element | Gesture | Commits | Receipt | Lands |
|---|---|---|---|---|
| Type row `+` (the only resting control) | tap | `dead(type)` | pending chip appears/ticks (`2 +1`); `−` grows in; sheet's Dead + Born tick behind | — |
| Grown `−` | tap | `correction(type,−1)` | drains pending only; **clamped at pending 0**, then withers away | — |
| Other › (label) | tap | — | farm's configured cause list; a pick tallies that cause | tail list (§8-G7) |
| Other `+` | tap | `dead(other)` | unclassified tally — Unknown is a cause, not a failure | — |
| Done | tap | folds pending → one stamped event per type | sheet breakdown + `Dead N` update | sheet |
| Grab swipe / backdrop | swipe/tap | same as Done | same | sheet |

- Header carries the host surface's context (mode table §0) and the live headline
  `Dead · N — every body, born dead or died`, N = posted + pending.
- Rest is read-state: posted count + lone +. A row a hand has not touched this visit
  shows no −, no chip, no affordance beyond +.
- Types, in order (RULED — the five defaults + Other): Stillborn · Mummified · Crushed ·
  Scours · Starve-out · Other. Born-dead leads because it is the common during-farrowing
  case. `euthanized` lives behind Other › in v1 — promote only if farm data shows
  frequency. The type carries the timing; **no WHEN anywhere, absolutely — including
  check-in** (RULED; §7-A4 resolved): the stamp is the date.
- Corrections to **posted** dead counts never happen here — Adjust only. The − can
  never reach posted state by construction.
- Pre-filled mode (E7): opens with the door's count as unassigned pending demanding
  types (§8-G9). Roster mode (§8-G8): once every remaining piglet is tagged, a tally
  must name which.

### 2.5 Adjust — the one correction door

The shape is a deliberate drill-in, owner-ratified (2026-08-29): **click in → the list
of the current counts → click the figure to change → the few options** (what happened →
should-be value). Recording stays flat on the sheet; correcting announces itself and
sits one level deeper by design — the two doors are differently shaped on purpose.
Entering Adjust folds the pending window first (RULED): corrections operate on posted
state only, so the picker's figures are posted = live and a correction can never race a
buffer. What it adjusts is the observations, never the derivation: Born has no door
pre-lock. And a missed fact is a recording (drawer +, alive +), never an Adjust — no
"missed entry" chip exists; the door serves figures that must come down, change kind,
or change sow (RULED 2026-08-30).

Step 1 · **Picker** (which figure?):

| Element | Gesture | Lands |
|---|---|---|
| Figure row (only figures with posted values; During: Alive + posted dead types; post-lock adds Born · classification · litter weight · assisted — §8-G10) | tap | correction event |
| Cancel / grab | tap | host sheet, nothing written |

Step 2 · **Correction event** (what happened?):

| Element | Gesture | Commits | Receipt |
|---|---|---|---|
| Chips `Miscount (default) · Wrong type › · Wrong sow` | tap | — (arms the event) | chip current; body reshapes per chip |
| Should-be `− n +` / framed count types | tap | — | consequence line previews: `writes −1 stillborn · miscount · wears its ✎ mark` |
| Correct to N | tap | `correction(figure, signed Δ, why)` | figure wears ✎ forever; History gains the line | host sheet |
| Cancel | tap | — | — back to picker |

- Wrong type › adds the destination type; commits the paired move as one event.
- Wrong sow adds scope (this figure / this visit) + sow picker; mirrored events both
  records (§8-G6).
- Post-lock, Born first shows the ceremony: amber warn → `More born ›` (asks where the
  extra goes: alive now / died, then writes both lines) or `Count was wrong ›` (plain
  correction). The invariant never breaks silently (audit B5).
- Both steps sit under the amber banner `Correcting a past record · logged as <who>`,
  and both keep the sow identity header (§7-B3 — currently missing from the drawing).
- Why is asked only here, only as chips. Free text optional, never demanded.

### 2.6 Finish (the ceremony)

| Element | Gesture | Commits | Receipt | Lands |
|---|---|---|---|---|
| Weak / Deformed `− n +` | tap | `classify` per tap (RULED; §7-A5 resolved) | Healthy remainder recomputes live; sum clamped to alive | — |
| Litter weight field | tap → pad | `litter_weight(kg)` on set | soft range hint outside ~0.8–2.5 kg/piglet — words, never a gate | — |
| Assisted checkbox | tap | `assisted(bool)` | check | — |
| Back / grab | tap/swipe | — (entries already committed) | — | During |
| Lock born N | **hold** to commit; release early cancels with a receipt | `final()` | motion B cross → Done; room row flips | After |

- Summary card (born · alive · dead + breakdown) is read-only; a wrong number means
  Back, fix on the sheet, Finish again — the ceremony never edits.
- Healthy derives as remainder; it has no stepper.
- Finish is reachable only once a **count event** exists — a started mark alone does not
  reveal it (an all-zero litter cannot lock Born 0; audit C10).
- Both optional facts skippable in one glance; they print on the record with ✎.

### 2.7 After (the locked record)

| Element | Gesture | Commits | Receipt | Lands |
|---|---|---|---|---|
| Adjust | tap | — | — | Adjust, post-lock flavor |
| Foster | tap | `foster_out/in(n)` at its own commit | both records print the move | Pairing (C7) |
| Record dead | tap | `death(type)` per tally | `since final` line + alive-now derive down + room row tick | dead drawer, post-lock mode |
| History › | tap | — | — | History |
| ✎ glyph on a figure | tap | — | provenance reveal: original → correction · who · when · why (read-only) | inline reveal |

- Mode flip, stated once: **During, Alive is observed and Born derives; After, Born is
  locked and alive-now derives** (born − Σdead − fostered out + fostered in). The two
  faces are the same ledger read from opposite ends.
- No alive counter exists here. Extra live piglets found later are `Adjust → More born ›`
  — never a count assert on this sheet.
- Anyone may amend born post-lock (RULED, standing unless the owner vetoes): open ✎,
  stamped, no role gate — provenance over sign-off deters falsification, permissions do
  not.
- Foster is post-lock only (the 12–48 h equalization window is guidance in copy, never a
  gate). No foster during farrowing, ever.
- Read lines (living / dead / since final / fostered / weight · assisted) are dead zones
  except their ✎ glyphs.

### 2.8 History (read-only; undrawn — minimal contract, §8-G11)

- One list, newest first, netted per type per visit: `+4 alive · 08:41 · G.H`,
  `+1 crushed · 08:12 · G.H`, `−1 stillborn · miscount · 09:02 · G.H ✎`,
  `fostered out 2 → 000431`, `final · born 14 · 08:12 · G.H`.
- Correction lines carry why; tap nothing — the list IS the reveal. Same-visit netted
  pairs never appear. Append-only, never editable, no actions on this surface.
- Reached from During and After; Close returns to the host.

---

## 3 · The walked paths (every flow, with its tap cost)

Tap counts start from the During sheet unless noted; +2 overhead from the room (row tap
… Close).

| # | Path | Taps | Walk |
|---|---|---|---|
| P1 | Attended birth | 1 | Alive + |
| P2 | Stillborn found | 3 | Record dead → Stillborn + → Done |
| P3 | Counted piglet dies (crushed) | 4 | Record dead → Crushed + → Done → Alive − (order free; Born holds by arithmetic) |
| P4 | New body found (was never counted) | 3 | Record dead → Crushed + → Done; Alive untouched; Born +1 |
| P5 | Revisit convergence (logged 5, sees 9) | 4 or 2 | Alive + ×4, or count-tap → type 9 |
| P6 | Morning-after batch (unattended) | ~8 | converge Alive to 5 → Record dead → crushed ++ · stillborn + · mummified + · Other + → Done; Born derives 10 |
| P7 | Passing hand sees labor, nothing to count | 0 | no app act (the mark is killed): recording nothing asserts nothing; she stays Awaiting and the next shift is told in person |
| P8 | Person B verifies, all agrees | 0 | reads Born · Alive; touches nothing |
| P9 | Mis-tap fixed same visit | 2 | Alive + then Alive − (or drawer + then −); trail shows nothing |
| P10 | Over-tally caught next visit | 4 | Adjust → Crushed → Miscount (default) → should-be − → Correct to 1 |
| P11 | Wrong type (stillborn was mummified) | 5 | Adjust → Stillborn → Wrong type › → Mummified → Correct — one paired event |
| P12 | Wrong sow discovered | ~6 | Adjust → figure or visit scope → Wrong sow → pick sow → Correct (§8-G6) |
| P13 | Savaged (vanished, no body) | 3–4 | − is floored, so: Adjust → (auto-skip) → `Gone · no body` → should-be → commit; Born drops with a stamped reason — the silent-drop cost is deleted |
| P14 | Finish, normal | ~5 + hold | Finish → Weak + → Deformed + → (skip optionals) → hold Lock |
| P15 | Premature lock, three more born | 4 | After: Adjust → Born → More born › → +3 · where: alive now → commit |
| P16 | Death after final | 3 | After: Record dead → type + → Done; alive-now derives down |
| P17 | Foster out | — | After: Foster → Pairing flow (its own spec) |
| P18 | Euthanized deformed piglet | 4 | After: Record dead → Other › → euthanized → Done (RULED: behind Other in v1) |
| P19 | Interrupted mid-drawer (bolts at a scream) | 0 lost | every tap already committed; pending folds on next Done/close; nothing vanishes |
| P20 | Phone dies / sleeps mid-visit | 0 lost | taps committed; reopen shows freshness stamp; convergence gesture re-heals |
| P21 | Peek at an Awaiting sow | 0 | open → Close; no state change |
| P22 | Stray first tap, discovered later | 1–2 | reopen → converge to the crate (or Adjust → miscount → 0). Posted back to all-zero → she reads Awaiting again (registers derive from posted state); same-visit catch is P9 |
| P23 | Sow dies mid-farrowing | 3 + sow flow | sheet identity → sow page → Report death (RULED). Session ends `ended · sow died`: Born derives from what stands, classification skipped (amendable via Adjust), litter record surfaces its orphan count as a Foster prompt, she exits every lens |
| P24 | Check-in death, litter weaned off record | 3 | litter row → same drawer → type + → Done |

Ease audit against the metric: P1 (the 90% action) is one tap on the sheet itself; the
worst routine path (P6, a whole overnight litter) is ~8 taps on two surfaces; every
correction is ≤ 6 taps through one door. No path requires a third component. The one
structural cost is deliberate and now owner-ratified (Q1): every dead tally pays the
drawer round-trip — and it is tally-then-dismiss, not a ceremony, because every tap
already commits; a hand that bolts mid-drawer loses nothing (P19). The correction
drill-in's depth (P10–P12) is equally deliberate — see §2.5.

---

## 4 · Invariants (what makes inconsistency impossible)

1. `Born = Alive + Σ Dead + fostered out − fostered in`, every moment, every device.
2. Born is never directly editable — two observable numbers before lock, stamped
   amendment after.
3. One resting control per figure: Alive's `− n +`; a drawer row's lone `+`. Everything
   else is read-state.
4. Every figure obeys the clamp: a dead row's `−` floors at pending 0; Alive's `−`
   floors at posted − dead tallied this visit. **Born can never decrease except through
   Adjust** — by construction, not by teaching.
5. Corrections to posted state pass through Adjust, and nowhere else. Additive surfaces
   stay pure; no gesture hides a second meaning.
6. Every event commits at the tap and stamps who · when; visits net in History; nothing
   is ever deleted, disabled, dimmed, toasted, or submitted.
7. Opening, reading, and closing surfaces write nothing.
8. Same gesture for every hand: make the screen match the crate.

---

## 5 · Where each event lands (receipt matrix)

| Event | Sheet | Room row | History | Elsewhere |
|---|---|---|---|---|
| `alive_assert` | count + receipt + Born foot | line 1 totals + fresh chip | netted per visit | census |
| `dead(type)` | Dead N + breakdown | line 1 totals | netted per visit | census |
| `correction(…)` | figure wears ✎ | totals re-derive | signed line + why | — |
| `classify` | Finish remainder | — | at final | — |
| `final` | mode flip to After | crosses to Done | line | batch tallies (09f) |
| `death(type)` post-lock | since-final line + alive-now | Done row alive ticks | line | census |
| `foster_out/in` | fostered lines both records | both rows' alive | lines both | receiver's cohort note |

---

## 6 · Deliberate non-features (asked and refused — do not re-add)

No Save. No submit. No toasts. No WHEN question in the drawer. No staleness escalation,
threshold config, or notifications. No dashboard/grid room view. No separate detail
screen. No End-task on the room. No scattered correction entrances (floor-doors,
tap-the-fact, hidden gestures). No dim-as-disabled. No hard gates anywhere — a blocked
path is a falsification incentive. No foster during farrowing. No role gates in v1.

---

## 7 · Inconsistency register — found this pass

**A · Spec-internal (fixed in this commit where the standing ruling is unambiguous):**

- A1 session-interaction-spec §2 (Record dead row) still said "− is not clamped, so old
  over-tallies fix by touch-then-step-down" and "a plain receipt `was 2`" — both predate
  the consolidation; §8 of the same file, 09b's drawn rules, and the handover all say
  clamped-to-pending with the `2 +1` chip, corrections via Adjust. **Fixed: row rewritten
  to the consolidated model.**
- A2 session-interaction-spec §7 (rest-is-read-state bullet) still said the receipt is
  the words `was N`, banning signed chips — superseded by the §8 posted/pending adoption
  (worded decomposition under Alive, pending chip on drawer rows). The owner's round-11
  catch was about a bare signed number beside a figure; the worded receipt resolved it.
  **Fixed: bullet now records the final form and keeps the why.**
- A3 count-entry-pattern.md mapping bullet said Alive's − "drains the chip only" —
  farrowing's Alive deliberately allows convergence below posted (signed pending). The
  general pattern (clamp) still governs tally rows. **Fixed: mapping bullet carries the
  convergence exception.**
- A4 **RESOLVED (RULINGS):** no-WHEN is absolute, including check-in. The
  Today/Yesterday/Not-sure chips are dead; SYNTHESIS §9.4 is struck in place; any other
  mention is a stale artifact.
- A5 **RESOLVED (RULINGS):** classify-per-tap confirmed. The weak/deformed steppers
  commit per tap like every control, healthy re-derives live; `Lock born N` remains the
  suite's one staged act (hold-to-commit, audit-mandated). The last two-stage ceremony
  is dead.

**B · Drawn artifact vs the law — ALL FIXED in the 2026-08-29 drawn round except B9:**

- B1 FIXED — 09a intro rewritten (Close / Record dead / History; workflow-order framing).
- B2 FIXED — Other row wears its › (label = the farm-tail door, + tallies unclassified).
- B3 FIXED — every Adjust phone (picker · event · wrong-sow) carries the sh2 identity
  header above the banner.
- B4 FIXED — one Done-row grammar everywhere: `11 alive` / `born 13 · final 05:58 · G.H`.
- B5 FIXED — `alive` everywhere on row line 1.
- B6 FIXED — 09's rules-table numbers now quote the mock (`9 alive · 5 dead`; the room
  hero and the 09a backdrops now show the same 000418 moment).
- B7 FIXED — chip drawn `last 60m` amber, agreeing with `saved 08:41` on the sheet and
  the 9:41 statusbar; the appbar's room-level last record now agrees too (08:41 · G.H).
- B8 FIXED — the reserved hint line is drawn under the Alive receipt, shown in its
  raised state (`fewer alive? tally the body — Record dead`).
- B9 open — 09e's door copy aligns when 09e gets its round (E7/§8-G9 define the
  mechanics).

**C · Fidelity note:** one timeline now runs the whole 09/09a/09b suite — first records
07:30, then 07:52/08:12, a correction 08:20, the open visit to 08:41, statusbar 9:41
(rows say `started 2h`, meaning the first record); posted alive 5 (+4 pending = 9), dead 5 by type; Born 14; History's lines sum to
exactly these figures. Every new mock must join this timeline or use a sow the suite
has never shown (the ended record uses 000399).

---

## 8 · Gaps — interactions no source accounted for (proposed here, owner signs)

- **G1 · CLOSED — the started mark is KILLED (owner, 2026-08-29).** Farrowing starts at
  the first recorded event; there is no mark, no `Started · no record yet` register, no
  start chrome anywhere. (Arc: bar-action proposal → row left edge → sheet action →
  killed on cost/benefit once each form was seen drawn.)
- **G2 · Negative pending display.** `5 posted · −2 this visit` (worded, amber −2), same
  slot as the positive receipt. Never drawn; needed for honest convergence.
- **G3 · CLOSED — moot with the mark killed.** No mark, no false mark, no revert. (The
  saga is instructive: the plain revert button needed a label nobody parsed and was a
  second correction entrance; killing the mark dissolved the whole problem — the best
  correction door is a fact that never posts.)
- **G4 · Type-to-set pad.** Tapping any framed count (Alive, should-be, weight) grows
  the standard inline pad under the field; set commits an absolute assert; grab/tap-out
  folds it without writing. One pad grammar product-wide (the conveyor already has it).
- **G5 · RULED — Adjust folds pending on entry**; corrections operate on posted state
  only.
- **G6 · Wrong sow, the full shape — RATIFIED, drawn 2026-08-29.** Scope step
  (`this figure` / `this visit` — the audit's void-last-visit) → sow picker (scan-first)
  → mirrored stamped events on both records; both Histories carry the move; both figures
  wear ✎.
- **G7 · Other › — RATIFIED, drawn 2026-08-29.** The label is the door (farm-configured
  tail list; picking a cause tallies it), the + on the row tallies unclassified. Two
  targets, one row, both honest.
- **G8 · Roster mode.** Once tags exist and a tally exceeds the untagged remainder, the
  drawer row expands to a piglet roster (scan-first) — a tagged piglet is never
  subtracted namelessly. Applies in check-in/post-lock contexts; during farrowing there
  are no tags.
- **G9 · Pre-filled door mode.** From 09e's `Record N died`: the drawer opens with N as
  unassigned pending on a header line (`2 to record`), each type-tap converts one; Done
  allowed only when unassigned = 0 — or Done with remainder returns it to the count
  drawer's unexplained tally (never silently absorbed). Needs its own micro-round.
- **G10 · Post-lock picker contents.** Born (ceremony) · each dead type · classification
  (weak/deformed) · litter weight · assisted. Alive-now is derived and absent. During:
  Alive + posted dead types only.
- **G11 · History contract — RATIFIED, drawn 2026-08-29** as §2.8, plus one addition
  discovered while drawing: the open visit prints its running net as the top line
  (`+4 alive · this visit · open · 08:41 · G.H`), which is what makes the `saved` stamp
  and the list agree mid-visit.
- **G12 · RULED — the visit ends at Close, at sheet dismiss, on Adjust entry, or after
  ~90 min idle** — the same boundary as the interval-chip fade, so there is exactly one
  notion of "visit over". Sleep/background alone does not end it — protects the
  convergence-after-sleep behavior the audit praised.
- **G13 · Picker auto-skip — ACCEPTED (owner "ok", 2026-08-29).** When exactly one
  figure holds a posted value (the common early-session state: only Alive), Adjust skips
  Step 1 and opens the correction event directly, back-titled with the figure. Saves the
  drill-in's one redundant tap without adding an entrance; the two-step shape returns
  the moment a second figure posts.

---

## 9 · Unresolved questions (owner)

The seven questions of the first pass were answered in the 2026-08-29 rulings round;
the second pass's four (row geometry, G13, the G-proposals, open-✎) were accepted in
the owner's "ok" of the same day — sheet-first identity confirmed, G13 in, proposals
ratified as written, no veto on open-✎. RULINGS.md holds all of it. Still open:

- B9 — 09e's death-door copy and the G9 pre-filled mechanics, at 09e's own round.
- The undrawn interactions that have requirements but no pixels yet: G2 negative
  pending, G4 the pad, G8 roster mode, G10's post-lock picker face, and the post-lock
  Adjust (Born ceremony).
- Owner screenshot review of the 2026-08-29 drawn round (this round).
