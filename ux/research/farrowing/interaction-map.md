# Farrowing drawer — the complete interaction map (low-fi requirements)

Every action and interaction inside the farrowing drawer suite, walked path by path, with
no UI. This file reconciles session-interaction-spec.md, user-flow-audit.md,
count-entry-pattern.md, the owner rulings in SYNTHESIS §6–§12, and the drawn state of
farrowing.html 09/09a/09b. Where those sources disagreed, the later ruling stands and §7
records every disagreement found. Where an interaction existed in no source at all, §8
proposes the requirement and marks it for owner sign-off.

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
                    started mark ─────────────┐
                    or first count event      ▼
  AWAITING ────────────────────────────────► ACTIVE ──── Lock born N ────► DONE
     │                                        │                            │
     │  disposition at batch close            │  sow death / abortion      │  (record;
     │  (not in pig · abort · next batch)     │  (sow verbs, outside       │   never a
     ▼                                        ▼   this suite — C5 open)    ▼   lens exit)
   leaves the batch                        exits every lens             stays in Done/All
```

- Opening a sheet **never** changes state. Only a written event crosses her: the started
  mark or any count event crosses Awaiting → Active; Lock crosses Active → Done.
- Done is terminal for the session. Post-lock events (deaths, fosters, amendments) write
  to the record; they never reopen Active.
- There is no Undo of a cross as a gesture; a false started mark reverts through Adjust
  (§8-G3), stamped.

### Sheet modes (one sheet, four faces)

| Mode | When | Zones present |
|---|---|---|
| Pre-start | Awaiting sow opened | header · Alive at 0 · empty record block · bar (§8-G1) |
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
| E5 | Started mark | — writes `started` | **placement currently unspecced — §8-G1** |
| E6 | Check-in litter row death entry | dead drawer · Check-in mode | must be this same component (cross-surface debt) |
| E7 | Count drawer down-door `Record N died` | dead drawer, pre-filled mode | 09e scope; drawer must accept a target count (§8-G9) |

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
| Goto pen | tap | — | list scrolls to pen | room |
| Scan ear tag | tap → scan | — | — | her sheet |
| Task overview › | tap | — | — | overview |
| Back ← | tap | — | — | Today |

Dead zones: the interval chip (`last 45m`), the day chip (`day 117`), line-2 metadata,
pen headers, the `Last record 23:10 · L. Meyer` appbar line. None tappable.

Row grammar (the receipts this surface owes):

- Active, attended: line 1 `9 alive · 5 dead` + interval chip while fresh; line 2
  `born 14 · started 6h · parity 3`. The chip runs off record stamps: present while the
  last record < ~60 m, amber ~60–90 m, gone past ~90 m. Absence makes no claim.
- Active, unattended: `Started · no record yet` / `marked 23:10 · L.M · parity 5`. Flips
  to totals the moment any count lands.
- Awaiting: forecast register (`Expected · in 2 days` light) → `Due today · day 114` →
  red chip from day 116 (`No record · day 117`).
- Done: `Final · N alive` (alive **now**, ticking with post-lock events) / line 2
  `born N · final <date> · who` (§7-D4 fixes the current drawn grammar).

### 2.2 Session sheet · Pre-start (the zero face — §8-G1 proposes, owner signs)

| Element | Gesture | Commits | Receipt | Lands |
|---|---|---|---|---|
| Mark started (bar, primary) | tap | `started` | header vit `marked hh:mm · who`; room row crosses to Active | sheet stays open |
| Alive `− 0 +` / type | first + or set | `alive_assert` | as During; crosses her to Active — counting IS starting | During |
| Record dead | tap → drawer | `dead(type)` per tap | as During; crosses her to Active | drawer |
| Close / grab / backdrop | tap or swipe | — | nothing written, still Awaiting | room |

- Finish absent (no event exists). Adjust absent (nothing posted to correct — the one
  state where the door has no figures; hiding beats a dead door, and "no dim-as-disabled"
  stays intact because nothing is drawn disabled).
- Header vit shows her due line (`due day 114` / `day 117`), not `started`.
- The batch-entry morning case needs no special mode: the hand converges Alive and
  tallies the pile exactly as During; the first event backfills the cross.

### 2.3 Session sheet · During

| Element | Gesture | Commits | Receipt | Lands |
|---|---|---|---|---|
| Alive `+` | tap | `alive_assert(+1)` | count ticks; receipt line recomputes; Born foot ticks | — |
| Alive `−` | tap | `alive_assert(−1)` | count ticks; below posted: reminder line + Born tick (§2.3a) | — |
| Alive framed count | tap | — (opens pad) | pad grows in; typing previews | pad inline |
| pad set | confirm digit entry | `alive_assert(n)` absolute | as above | pad folds |
| Record dead | tap | — | — | dead drawer |
| Adjust | tap | folds pending first (§8-G5) | — | Adjust picker |
| History › | tap | — | — | History (read-only) |
| Close | tap | folds pending → one stamped visit event | room row updates; `saved hh:mm · who` was already live | room |
| Grab swipe / backdrop tap | swipe/tap | same as Close | same | room |
| Finish (hidden until any count event) | tap | — | — | Finishing |

Dead zones: `Born 14 · Dead 5` (derived — no tap-the-fact, one-door law), the breakdown
metadata line, the receipt line, the saved stamp, the header identity.

**2.3a · The Alive pending model (signed, unlike the drawer):**

- Big number = live total = posted + pending. Receipt = words, always:
  `5 posted · +4 this visit`. Pending may go negative — convergence below posted is
  honest — and then reads `5 posted · −2 this visit` (§8-G2 for the drawn form).
- Every tap commits its event immediately (crash-safe); Close nets the visit into the
  trail as one line. Same-visit +/− pairs net to nothing.
- Every `−` raises the transient inline hint (*died? tally the body in Record dead*) in
  the reserved hint line — reserved, so nothing reflows under the finger. Never a popup,
  never a gate.
- No clamp on `−`: the savaged-piglet case (alive down, no body) is an accepted cost,
  mitigated by the hint and the visible Born tick.

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
- Types, in order: Stillborn · Mummified · Crushed · Scours · Starve-out · Other.
  Born-dead leads because it is the common during-farrowing case. The type carries the
  timing; **no WHEN anywhere** — the stamp is the date (but see §7-A4 for the check-in
  tension).
- Corrections to **posted** dead counts never happen here — Adjust only. The − can
  never reach posted state by construction.
- Pre-filled mode (E7): opens with the door's count as unassigned pending demanding
  types (§8-G9). Roster mode (§8-G8): once every remaining piglet is tagged, a tally
  must name which.

### 2.5 Adjust — the one correction door

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
| Weak / Deformed `− n +` | tap | `classify` per tap (§7-A5) | Healthy remainder recomputes live; sum clamped to alive | — |
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
- Foster is post-lock only (the 12–48 h equalization window is guidance in copy, never a
  gate). No foster during farrowing, ever.
- Read lines (living / dead / since final / fostered / weight · assisted) are dead zones
  except their ✎ glyphs.

### 2.8 History (read-only; undrawn — minimal contract, §8-G11)

- One list, newest first, netted per type per visit: `+4 alive · 08:41 · G.H`,
  `+1 crushed · 08:12 · G.H`, `−1 stillborn · miscount · 09:02 · G.H ✎`,
  `started 07:30 · G.H`, `fostered out 2 → 000431`, `final · born 14 · 08:12 · G.H`.
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
| P7 | Passing hand marks labor | 2 | row → Mark started (§8-G1) |
| P8 | Person B verifies, all agrees | 0 | reads Born · Alive; touches nothing |
| P9 | Mis-tap fixed same visit | 2 | Alive + then Alive − (or drawer + then −); trail shows nothing |
| P10 | Over-tally caught next visit | 4 | Adjust → Crushed → Miscount (default) → should-be − → Correct to 1 |
| P11 | Wrong type (stillborn was mummified) | 5 | Adjust → Stillborn → Wrong type › → Mummified → Correct — one paired event |
| P12 | Wrong sow discovered | ~6 | Adjust → figure or visit scope → Wrong sow → pick sow → Correct (§8-G6) |
| P13 | Savaged (alive down, no body) | 1 | Alive −; hint shows; Born drops — accepted cost, story still sums |
| P14 | Finish, normal | ~5 + hold | Finish → Weak + → Deformed + → (skip optionals) → hold Lock |
| P15 | Premature lock, three more born | 4 | After: Adjust → Born → More born › → +3 · where: alive now → commit |
| P16 | Death after final | 3 | After: Record dead → type + → Done; alive-now derives down |
| P17 | Foster out | — | After: Foster → Pairing flow (its own spec) |
| P18 | Euthanized deformed piglet | 3 | After: Record dead → (list position per §9-Q2) → Done |
| P19 | Interrupted mid-drawer (bolts at a scream) | 0 lost | every tap already committed; pending folds on next Done/close; nothing vanishes |
| P20 | Phone dies / sleeps mid-visit | 0 lost | taps committed; reopen shows freshness stamp; convergence gesture re-heals |
| P21 | Peek at an Awaiting sow | 0 | open → Close; no state change |
| P22 | False started mark | 3 | Adjust → Started → False alarm → she returns to Awaiting, stamped (§8-G3) |
| P23 | Sow dies mid-farrowing | — | leaves via sow verbs outside this suite; session disposition OPEN (§9-Q3, C5) |
| P24 | Check-in death, litter weaned off record | 3 | litter row → same drawer → type + → Done |

Ease audit against the metric: P1 (the 90% action) is one tap on the sheet itself; the
worst routine path (P6, a whole overnight litter) is ~8 taps on two surfaces; every
correction is ≤ 6 taps through one door. No path requires a third component. The one
structural cost is deliberate: every dead tally pays the drawer round-trip (P2 — 3 taps
for the single commonest event) to keep one component product-wide — flagged as the
standing ease-vs-cleanliness trade in §9-Q1, not silently accepted.

---

## 4 · Invariants (what makes inconsistency impossible)

1. `Born = Alive + Σ Dead + fostered out − fostered in`, every moment, every device.
2. Born is never directly editable — two observable numbers before lock, stamped
   amendment after.
3. One resting control per figure: Alive's `− n +`; a drawer row's lone `+`. Everything
   else is read-state.
4. Pending on Alive is signed (convergence); pending on a dead row is non-negative
   (a pile is append-only) — the drawer's `−` clamps at pending 0 by construction.
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
| `started` | header vit | crosses to Active, `Started · no record yet` | line | — |
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
- A4 **Open tension, needs owner:** SYNTHESIS §7.5 (owner ruling: late-found deaths
  offer `Today · Yesterday · Not sure` chips) vs the final no-WHEN law (§12: stamp is
  the date, no WHEN anywhere). The one-drawer law means check-in's late-death case
  currently loses the chips the owner explicitly ruled for. Either §7.5 is superseded
  (accepted cost §4 says dates = stamps) or the drawer's check-in mode alone carries the
  three chips. → §9-Q4.
- A5 Per-tap commit vs the Finish ceremony: classification was specced as
  `classify(weak, deformed) + final()` at Lock — a two-stage ceremony of exactly the
  shape B1 killed in the drawer (Back or a dead phone silently discards entered
  classification). This map specs classify-per-tap (§2.6), with `final()` alone at the
  hold. Costs nothing visible; closes the last uncommitted state in the suite. → owner
  confirm, §9-Q5.

**B · Drawn artifact vs the law (register only — fix in the next render round, not here):**

- B1 09a intro paragraph still narrates Save / Report death / the Trail door — three
  renames ago (Close / Record dead / History). Mock is right, prose is stale.
- B2 09b: Other row lacks its › (the farm-tail door; "one Other › across drawers" is the
  ruled copy law). Currently Other is drawn as a plain tally row only.
- B3 Adjust picker and event phones have no sow identity header — the wrong-sow ruling
  (B6) demands loud identity precisely on correction surfaces. Banner ≠ identity.
- B4 Done-row grammar differs between sections: 09 room shows `Final · 11 live · 2 dead`
  (birth-time totals, frozen) while the After backdrop shows `6 alive` / `born 14 ·
  final aug 27` (alive now, ticking). The second is the law (alive-now must tick with
  post-final deaths); 09's Done row and its rules-table copy need the same grammar.
- B5 `live` vs `alive` drift on row line 1 (09 room rows say "live", 09a backdrops and
  the handover say "alive"). One word, everywhere.
- B6 09's rules table cites `8 live · 1 dead` while its own mock draws `8 live · 3 dead`
  — mock numbers must agree with every caption (owner law, caught twice before).
- B7 The interval chip is drawn amber at `last 45m`; the ruling sets amber at ~60–90 m
  (neutral before). Either the mock time or the mock color is wrong.
- B8 The During sheet reserves no hint line — the panel adopted a reserved slot so the
  died-hint never reflows the sheet; the drawn hero has nowhere for it to appear.
- B9 09e's death door copy says "death drawer · died 2 pre-filled" — the component is
  the dead drawer and nothing about it is "died 2" until types are chosen; align when
  09e gets its round (E7/§8-G9 define the actual mechanics).

**C · Fidelity note:** the mocks in 09a/09b agree with each other numerically
(9 + 5 = 14; classification 1+1+7 = 9; After 14 − 6 dead − 2 fostered = 6). Keep it
that way — B4/B6 are the only number/grammar drifts found.

---

## 8 · Gaps — interactions no source accounted for (proposed here, owner signs)

- **G1 · The started mark has no home.** Every source says "one-tap started mark";
  none says where. Proposal: primary bar action `Mark started` on the Pre-start sheet
  (§2.2) — so the true cost is row-tap + tap. No row-level control (rows stay clean, no
  hidden gestures). 09's "one tap, nothing else asked" copy then means one tap *in the
  sheet*.
- **G2 · Negative pending display.** `5 posted · −2 this visit` (worded, amber −2), same
  slot as the positive receipt. Never drawn; needed for honest convergence.
- **G3 · Un-starting a false alarm.** Adjust picker (post-start, pre-event) offers
  `Started` → `False alarm` → she reverts to Awaiting, stamped. Without this the only
  exit from a mis-tap is a fake farrowing.
- **G4 · Type-to-set pad.** Tapping any framed count (Alive, should-be, weight) grows
  the standard inline pad under the field; set commits an absolute assert; grab/tap-out
  folds it without writing. One pad grammar product-wide (the conveyor already has it).
- **G5 · Adjust × pending.** Opening Adjust folds pending first (a visit checkpoint), so
  the picker's figures are posted = live and a correction can never race a buffer.
- **G6 · Wrong sow, the full shape.** Scope step (`this figure` / `this visit` — the
  audit's void-last-visit) → sow picker (scan-first) → mirrored stamped events on both
  records; both Histories carry the move; both figures wear ✎.
- **G7 · Other ›.** The label is the door (farm-configured tail list; picking a cause
  tallies it), the + on the row tallies unclassified. Two targets, one row, both honest.
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
- **G11 · History contract** as §2.8 — currently a door to nowhere in both modes.
- **G12 · Visit boundary.** A visit ends at Close/dismiss or after ~90 min idle
  (auto-fold, same band that kills the chip). Sleep/background alone does not end it —
  protects the convergence-after-sleep behavior the audit praised.

---

## 9 · Unresolved questions (owner)

- Q1 · Stillborn tap cost: is 3 taps (drawer round-trip) acceptable for the single
  commonest during-farrowing event, or does the sheet earn a persistent one-tap
  `+ stillborn` shortcut that writes the same drawer event? (Shortcut breaks "one
  resting control per figure" on the sheet; keeping the round-trip is the cleanliness
  call. Recommendation: keep the drawer; revisit only if field use complains.)
- Q2 · `euthanized`: in the default six or behind Other ›? (Walkthrough P18 needs it.)
- Q3 · Sow dies mid-farrowing (C5, still open): does her session Finish as-is (litter
  enrolls in processing) or park in a third terminal state? The sheet also still has no
  route to the sow verbs (audit C7) — where does that door live?
- Q4 · §7-A4: do the relative-date chips (`Today · Yesterday · Not sure`) survive in the
  drawer's check-in mode, or is no-WHEN absolute product-wide?
- Q5 · §7-A5: confirm classify-per-tap on the Finish sheet (kills the last two-stage
  ceremony) — or was lock-time classify deliberate?
- Q6 · G1/G3/G5/G12 proposals as written?
- Q7 · Standing from before: dead-type defaults confirm; B2 who may amend born-alive
  post-lock.
