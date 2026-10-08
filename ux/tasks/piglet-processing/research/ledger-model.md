# The litter ledger — recounts, strays, fostering, and what a moved piglet still owes

Research + modelling brief for the piglet-processing (仔猪处理) design, answering the owner's
request (RULINGS "Piglet processing", Q4 and Q9–Q10 *Open*): model recounts, added piglets and
adoption so that "in the end the whole thing balances", and find what the world does when a
piglet moves from an unprocessed litter into a processed one.

Binding context: RULINGS "Model", "After the lock", "Piglet processing"; count.md;
count-entry-pattern.md; SYNTHESIS §3 (laws 1–6), §7; product-model §4 (event catalogue), §5
(laws), §6 (identity); domain.md A4–A6; scenario-tree §2 Litter, §3 Mark, §5 Count.
`eval-set.md` was not opened.

Every external claim is tagged **S** (sourced, link in §6) or **I** (inferred, with why).

---

## 1 · What the world does

### 1.1 Recording a foster: per move, not net

- **PigCHAMP** records fostering as **one event per move**: source sow (off, "negative foster
  number"), destination sow (on, "positive"), date, number of piglets — and *"the source sow,
  destination sow, or both must be entered."* Fostering "can occur multiple times between
  farrowing and weaning". A **nurse-sow event** is complete-wean of her own litter + foster-on in
  one entry. A litter reconciliation report balances weaned against farrowed, fostered and died.
  — **S** [PigCHAMP Mobile User Guide pp.19–20; PigCHAMP search digest].
  → The industry reference system is **double-entry with an optional side**: a one-sided foster
  is allowed, so its paper trail can come up unbalanced. **I**
- **The paper sow card** records "the number of piglets transferred or received and **to which
  sow**", plus deaths with cause, treatments and vaccinations, and number weaned. — **S** [pig333
  sow card]. It is kept per litter; the counterpart sow is written down but the two cards are
  never reconciled against each other. **I** (paper cannot do it).
- **猪场管家 (gxswine) 7.0** has no dedicated foster screen in its public help. Suckling-piglet
  moves go through **仔猪转舍** (source house/group → destination house/group, optional sow tag,
  optional *piglet* tag, quantity, weight). A move between farrowing houses keeps the piglets
  suckling; out of the farrowing house they become nursery pigs. Deleting a transfer
  reverses both sides automatically. — **S** [gxswine 仔猪转舍]. Inventory gaps are **盘亏**
  (an exit type beside 死亡 · 赠出 · 淘汰: "system stock above actual") and **盘盈** (an entry
  type beside 自繁 · 购买 · 调入 · 赠入: "system stock below actual"). No entry may be dated
  before the last 盘点 (stock-take). — **S** [gxswine 仔猪离场; 仔猪进场].
  → Chinese software treats piglets as **stock by head count**, with a stock-take that sets a new
  baseline and named gain/loss documents. **Gain/loss are never paired with each other.** **I**
- **智农通 / 猪联网 (Nongxin), MetaFarms, Porcitec, Agrosoft:** no public documentation of
  foster fields found. Porcitec advertises "40 event types … traceability from birth to market".
  — **S** [Porcitec]. Nothing further claimed.
- **Chinese husbandry practice:** 寄养 within 24 h of colostrum, **日龄相差不超过3天** (age gap
  ≤ 3 days), foster the bigger piglets out, rub with the foster sow's milk, ≤ 12 piglets per sow;
  the sow's production card records birth date and ear numbers. — **S** [河南畜牧兽医信息网;
  gdswine 仔猪寄养并窝]. 并窝 (merging 2–3 small litters onto 1–2 sows) is standard. — **S**
  [gdswine search digest].

### 1.2 Treatment status travels on the pig, not in the record

- **Timing makes the problem rare.** Fostering is done **within 24 h, at most 48 h**, after 4–6 h
  (Teagasc: 12 h) of colostrum — **S** [VT aps-0355; Ceva; Teagasc; QLD]. Processing is mostly
  day 1–5 (iron d2–3, castration d3–7, CN 7–14 d) — **S** [domain.md A1; 河南]. So the **typical
  foster lands before the main processing round** and both litters are equally untreated. **I**
- **Once fostered, never moved again:** "Once a pig is cross-fostered, it should not be moved to
  a new litter again"; "Always **mark fostered piglets** to avoid moving them again." — **S**
  [Ceva]. The new litter is "kept intact without repeated cross-fostering until weaning" — **S**
  [VT aps-0355]. Research protocols mark piglets "resident" vs "adopted" — **S** [VT aps-0355;
  TAS 2025].
- **The fostering kit is a spray marker, tagger and notebook.** — **S** [Teagasc factsheet]. The
  physical mark is the reminder. **I**
- **Late moves exist:** nurse-sow strategies move supernumerary or fall-behind piglets at day
  1 onto a sow 7 or 21 days into lactation; late cross-fostering in week 1–2 happens. — **S**
  [nurse sow strategies, Animal 2018; PubMed 32241314]. These are the moves that cross
  processing states. **I**
- **What a hand does with a mover whose history is unknown** — no source states a rule. Practice
  inferred from the procedures: **visible procedures can be checked by eye** (tail docked, teeth
  clipped, castrated, notched, tagged) and are simply done if missing; **invisible ones** (iron,
  toltrazuril, vaccine) cannot, so the hand either trusts a spray mark or decides by farm policy.
  — **I** (anatomy of the procedures, domain.md A1). No source was found stating that software
  carries per-piglet treatment status across a foster for untagged piglets. — **I** (domain.md A5
  reached the same gap).
- **Notches carry the litter.** In the universal notch system the right ear is the **litter
  number**, identical for all littermates; the left ear is the pig number. — **S** [KSU; UNL
  G1880]. So on a notch farm a stray or foster **can be read back to its birth litter**. **I**

### 1.3 Reconciling inventory

- Counting truths are already researched (count.md §1, domain.md A6): processing day and weaning
  are the real counts; the daily crush check counts deads, not lives; 盘亏 exists "to bring system
  stock down to actual" — **S** (as cited there). Chinese farm rules require monthly stock to
  match books, discrepancies fined — **S** [domain.md A6]. Incentive to launder deaths into
  "shortfall" is real — **I** (count.md §1).
- **Strays between crates:** no source discusses it. Farrowing crates hold one sow per crate
  with a piglet area and partition; small piglets do squeeze under or over partitions. — **I**
  (barn experience claims only; no citation found in EN or CN searches for 串栏/钻栏). What a hand
  does: if the stray is recognisable (notch, spray, size), **puts it back**; if not, leaves it.
  **I**
- **A body found later** (behind a heat mat, under slats, after a count already wrote the piglet
  off): no software source; 猪场管家's 盘亏 → 死亡 would simply double-book. **I**

### 1.4 Farrowing housing — are multi-sow pens in scope?

- **Crates dominate globally:** the farrowing crate is "the most prevalent maternity system in
  global pig production". — **S** [Frontiers review 2022, fvets.2022.811810 / 998192]. The
  majority of EU sows can legally be crated at farrowing. — **S** [EFSA/CIWF digest].
- **China:** scale farms use **高床分娩栏 / 产床**, one crate (母猪限位架 0.6 m wide + piglet area
  + heat box) per farrowing sow; it is "工厂化养猪场的主要设施之一". — **S** [pwsannong 分娩栏;
  ngx 标准化规模养殖]. No national percentage found. — gap.
- **Crate bans ≠ group lactation:** Sweden (1987), Switzerland (1997), Norway (2000) ban crates;
  Austria (2033), Germany (2036) phasing out; Denmark funding free lactation. — **S** [Frontiers
  998192]. The replacement is the **individual free-farrowing pen** — still one sow, one litter.
  **I** (that is what "free farrowing" denotes in every source above).
- **Multi-suckling** is "relatively uncommon in commercial practice" — **S** [Frontiers 998192];
  commercial use "limited" — **S** [PubMed 24534691 review]. It lives in **organic** production:
  Swedish organic sows farrow in individual pens and are **grouped at ~14 days** (Ljungström:
  10–14 d), weaned at 6 weeks — **S** [PLOS One 2016 / PMC4892577; ThePigSite]; 25 of 31 organic
  farms in DE/AT/CH practised group suckling, typically 3 sows per unit — **S** [FiBL].
- **Conclusion — I:** every source has sows **farrowing and spending the processing window
  (d0–7) individually housed**. Multi-sow lactation starts after processing, only on organic
  farms. **Multi-sow pens are out of scope for processing v1.** If a farm groups at d14, the
  model below degrades cleanly: litter attribution ends at grouping and the pen becomes one count
  pool (the room level of §2). Q27 can be closed as "not in v1".

---

## 2 · The shared arithmetic

Every model below uses the same per-litter terms. Farrowing's law is already one of them.

| Term | Meaning | Written by |
|---|---|---|
| **B** Born | alive + dead at birth, locks at Finish | farrowing |
| **D** Dead | Σ dead, one shared picker | dead picker (any surface) |
| **O / I** Out / In | piglets moved out of / into this litter | move (foster, stray, nurse) |
| **L⁻ / L⁺** Unexplained loss / gain | the gap a head count found | count (Set count) |
| **W** Weaned | left the farrowing room | weaning (out of scope, closes the equation) |

**Per litter, always:** `A = B − D − O + I − L⁻ + L⁺ − W`, equivalently
`B = A + ΣD + O − I + (L⁻ − L⁺) + W` — RULINGS' `Born = Alive + ΣDead + fostered out − fostered
in` plus the unexplained terms (which are 0 until someone counts). Alive is derived, never stored;
a count is an **assertion** that writes `L⁻` or `L⁺ = |observed − A|`.

**Per room / batch:** `ΣA = ΣB − ΣD − ΣW + (Σ I − Σ O) − ΣL⁻ + ΣL⁺`. Moves inside the room cancel
(`ΣI − ΣO = 0`), so the room's only free term is its **net drift** `ΣL⁺ − ΣL⁻`.

**Per litter per treatment T** (the owner's count-marks): `A = covered_T + excused_T + owed_T`,
with `owed_T = max(0, A − covered_T − excused_T)`. `covered` is the count on marks; `excused` is
the explicit skip-for-a-reason. The litter is done for T when owed is 0.

**The worked room used in every table** — Room 3, batch 2609:

| crate | sow | born | dead | alive | processing (iron · tail · castrate) |
|---|---|---|---|---|---|
| 12 | A | 13 | 1 | **12** | done d3, covered 12 (castrate: 6 boars) |
| 14 | B | 11 | 1 | **10** | not done (due today) |
| 16 | C | 9 | 0 | **9** | not done |

Room: born 33, dead 2, alive 31, drift 0.

---

## 3 · Three candidate models

### Model A — Sow card (net per litter, no pairing)

**Terms.** Per litter: B, D, net fostered `F = I − O` (one signed number), net adjustment
`J = L⁺ − L⁻` (one signed number). `A = B − D + F + J`. The room balances only if every foster
was written on both litters; nothing checks it.

**Events and taps.**
- *Set count*: open litter → observed → Record. 3 taps. Δ becomes J.
- *Foster* (single-sided, like 猪场管家 盘盈/盘亏 or a sow-card line): open litter → ±n → optional
  "with crate" → Record. 3–4 taps per side, two litters → **6–8 taps per foster**.
- *Dead*: shared picker, unchanged.

**Treatment of moved piglets:** **inherit the receiver** (SYN §7.7 "fosters ride the crate
schedule"). Receiver's marks are litter booleans/counts; a moved-in piglet silently counts as
covered if the receiver was done.

**Reminder:** the row note `incl. 3 fostered` only.

**Anomalies for the console:** per-litter J ≠ 0; a room where ΣF ≠ 0 (one side missing).

**Cost / risk.** Cheapest; mirrors paper and Chinese stock software. But it **fails the owner's
own scenario**: the piglet moved from 14 into 12 reads as treated. The reverse move gets
double iron. Strays are two unrelated anomalies forever. A body found after a J = −1 subtracts
again unless someone recounts. Net F cannot answer "from whom", which the sow card itself
records. **Rejected as the model; its cheapness is the bar the others must justify.**

### Model B — Paired moves over a room suspense (recommended)

**Idea.** Every change of heads is **double-entry**. A move has two legs (out of one litter, into
another). An unexplained loss or gain is a move **whose other leg is the room's suspense line
("unaccounted")**. So a one-sided foster, a stray, a recount gap and a vanished piglet are all
the same object: *a move with one side not yet known*. Pairing a loss with a gain later is
**naming the missing leg** — it changes no count, only relabels `L⁻ → O` and `L⁺ → I`.
A body found is **a death drawn from the suspense line** — it relabels `L⁻ → D`, alive untouched.

**Terms.** §2 exactly. Each `L⁻` / `L⁺` item is an **open line** (n, litter, stamp) until paired
or reclassified. Room suspense = Σ open L⁺ − Σ open L⁻ — it reads 0 when every gap is explained
or cancels against its twin.

**Balance.** Per litter by construction (alive is derived). Per room: moves cancel; pairing moves
a pair out of suspense without changing ΣA. Nothing can make a litter or the room unbalance —
the only possible "imbalance" is an open suspense line, which is a named fact, not an error.

**A move carries a treatment packet.** When n piglets move S → R, for each treatment T the move
snapshots their status from S: **covered** if S was fully covered for T (`owed_T(S) = 0`, excused
0), **not covered** if S had nothing for T, **unknown** otherwise (S partly done, or S is the
suspense — an unexplained gain has no known origin). Then:
- R: `covered_T += n` (covered) · nothing (not covered → they owe) · `unknown_T += n` (unknown).
- S: `covered_T −= n` if covered.
- Unknown resolves on the next mark for T on R: the sheet asks *for the n unknown only*
  `Check the 1 from crate 14 · done already / treat now / skip`. For visible procedures (tail,
  teeth, castration, notch/tag) the hand looks; for invisible ones (iron, toltrazuril, vaccine)
  the farm's default (console: *treat* or *skip-with-reason "history unknown"*) pre-selects.
  (**I** — §1.2.)

**Events a worker creates, fewest taps.**

| Event | Door | Taps | Notes |
|---|---|---|---|
| **Set count** | litter → count drawer | 3 (open · value · Record) | Δ ≠ 0 posts one open L line. If a litter in the same room has an open opposite line ≤ 3 days old, one chip: `From crate 12? · 1 missing since 07:40` → **+1 tap to pair**. Ignoring it leaves both open. |
| **Move piglets** (foster · stray back · nurse) | either litter's ⋯ → Move | 4 (open · other crate by scan/list · n or tags · Record) | n defaults 1; tagged piglets are picked, never counted (law 2). Receipt names what they owe: `Saved · 1 to crate 12 · owes iron, tail, castrate there — spray it`. Reason chip optional: foster (default) · stray · nurse. |
| **Record dead** (shared picker) | unchanged | unchanged +0/1 | If the litter has an open L⁻, the picker shows one chip `One of the 2 missing` (on = draws from L⁻, alive unchanged). |
| **Treatment mark** | processing sheet | unchanged | Count defaults to `owed` (not `alive`); moved-in lines print under the treatment. |
| **Pair** (barn or console) | open suspense line → `It went to…` | 2 | Available later from the room's `Unaccounted` line or the litter record. Console can pair too. |

**Reminders — what the hand sees, where.**
- *Litter row (Due lens):* a done litter that gained owing piglets **returns to Due** with the
  residual in words: `iron · tail · castrate — 1 from crate 14`. Not red; it is due today.
- *Processing sheet:* per treatment `12 of 13 · 1 from crate 14 owes` / in the reverse case
  `10 due · 1 from crate 12 already done — marked`. The mark stepper defaults to owed.
- *Move receipt:* the owing list + `spray it` (the physical mark is the real-world reminder,
  §1.2; the app tells the hand to make it). No blocking dialog.
- *Room header:* `Unaccounted −1` only while a suspense line is open (zero rule: prints
  nothing when 0).
- *Count drawer:* the pairing chip (above) — the moment the hand knows most.

**Stays anomalous for the console:** open suspense lines (by age, by room; at weaning the room's
net drift is the reported 盘亏/盘盈); unknown treatment status resolved as "skip"; moves after
day 3 or with age gap > 3 days (the CN rule); a litter moved twice (Ceva's "never again" — only
knowable for tagged piglets or by move history on the litter); repeated unexplained loss on one
crate (count.md §4).

**Cost.** One new object (the move with a packet) and one new projection (suspense). Treatment
state stays a count per litter, not per piglet — the anonymous-piglet reality holds. Pairing UI is
one chip in two places. **Risk:** the pairing chip could be tapped to tidy numbers dishonestly
(pair a death-shaped loss with an unrelated gain) — mitigated because pairing is stamped and
restricted to same room, opposite sign, ≤ 3 days; the unknown default for invisible treatments is
a farm-policy question, not a UI one.

### Model C — Origin lots (sub-litters with their own schedule)

**Idea.** A litter's alive heads are held in **lots**: `own` plus one lot per arrival
(`from crate 14 · 1 · born sep 25`). Each lot has its own age and its own coverage per treatment
and is scheduled on **its own** age-days. Lots merge when their coverage and age-day match
(e.g. after both are processed). Unexplained lines are lots of origin "unknown".

**Terms.** §2 per litter, plus Σ lots = A per litter. Room identical to B.

**Events and taps.** As B, plus: every **death, count gap and mark on a litter with >1 lot asks
which lot** (+1 tap each, and a guess — the hand cannot tell untagged piglets apart unless
sprayed). Moves out of a multi-lot litter ask which lot (+1).

**Reminders.** Exact: the fostered lot carries its own due days, so a nurse sow holding piglets
from four litters of d5–d8 gets each lot's castration on its real day.

**Anomalies.** As B, plus lots whose attribution was guessed.

**Cost / risk.** The most precise and the most tap-hungry; precision is fictional for untagged
piglets (a death in a two-lot crate is attributed by guess). It solves the **nurse-sow / late
foster** case B handles only coarsely (B puts the arrivals on the receiver's schedule with a
`2d older` note, SYN §7.7). Worth it only if late moves are common; §1.2 says they are the
exception.

---

## 4 · The scenarios, played through

Room 3 as in §2. "Suspense" = the room's `Unaccounted`. Each row: what the hand does → the
ledger after, in the three models.

| # | Scenario | Hand | Model A (net) | Model B (paired, suspense) | Model C (lots) |
|---|---|---|---|---|---|
| 1 | **Recount low.** Crate 14 counted at 9 (system 10). | Set count 9 | J₁₄ = −1. A₁₄ 9. | L⁻₁₄ 1 open; A₁₄ 9; suspense −1; room header `Unaccounted −1`. | as B; an "unknown" negative lot. |
| 2 | **Recount high.** Crate 16 counted at 10 (system 9). Owner: never More born. | Set count 10 | J₁₆ = +1. Newcomer reads as having 16's state (none). | L⁺₁₆ 1 open, packet **unknown** (origin unknown); suspense 0 if #1 still open. Chip in the count drawer: `From crate 14? · 1 missing today` (tap → pair, see #3). | as B; lot "unknown origin", own schedule unknown. |
| 3 | **The jump.** #1 and #2 are the same piglet: it went 14 → 16. | one tap on the chip (or later: Pair) | impossible; two anomalies forever. | L⁻₁₄ → O₁₄, L⁺₁₆ → I₁₆; **a stray move 14 → 16**, reason stray. Counts unchanged (9, 10). Packet re-resolved from unknown to 14's state (not covered): 16 owes nothing new (16 not done either). Suspense 0. | as B, lot becomes "from 14". |
| 4 | **Stray put back.** Hand finds the stray in 16 before anyone counts and puts it in 14. | nothing | nothing | nothing — no count was asserted, the ledger never diverged. | nothing |
| 5 | **Stray put back after the counts.** After #1 and #2, the hand returns it. | Move 16 → 14 (the move sheet offers `Back to crate 14? · 1 missing`) → 4–5 taps | J₁₆ −1 again? Hand must also fix J₁₄: two edits. | Pairs L⁻₁₄/L⁺₁₆ into stray 14 → 16, then move 16 → 14. Counts 10 / 9 again; history shows the round trip; suspense 0. | as B; lot merges back into own. |
| 6 | **Foster before processing** (the normal case, d1). Crate 12 before processing: move 2 of its 12 to 16 (9 → 11). | Move 12 → 16, n 2 | F₁₂ −2, F₁₆ +2 (two entries). | O₁₂ 2, I₁₆ 2. Packet: not covered (12 not yet done). 12 → 10, 16 → 11. Nothing owed differently; both still due. | two lots in 16 until both processed, then merge. |
| 7 | **Owner's case: undone → done.** Crate 12 done (covered 12); move 1 from 14 (undone) to 12. | Move 14 → 12, n 1 | 12 reads 13, **done** — the piglet silently misses iron, tail, castration. | 12: A 13, covered 12 → **owed 1** for iron, tail, castrate (castrate: owed if boar; the hand records `castrate 1` or `skip · female`). Row returns to Due `iron · tail · castrate — 1 from crate 14`. Receipt: `owes iron, tail, castrate there — spray it`. 14: A 9, still due for 9. | 12 holds lot "from 14 · 1", scheduled on 14's age; same reminder. |
| 8 | **Reverse: done → undone.** Crate 12 done; move 1 from 12 to 14 (undone, 10 → 11). | Move 12 → 14, n 1 | 14 reads 11 due; the hand iron-injects all 11 → **double iron**. | 14: A 11, covered 1 (packet covered) → **owed 10**. Sheet: `10 due · 1 from crate 12 already done — marked`. Mark stepper defaults 10. 12: A 11, covered 11, done. | as B. |
| 9 | **Move from a half-done litter.** Crate 14 had iron 7 of 10 (3 weak skipped: excused 3); move 1 to 12 (done). | Move 14 → 12 | as #7 | Packet for iron: **unknown** (14 was partial). 12: `iron · 1 from crate 14 · check` — iron is invisible, so the farm default applies (treat / skip · history unknown). Tail and castration: visible, the hand looks. | as B, lot unknown. |
| 10 | **Body found after an unexplained loss.** #1 stands (L⁻₁₄ 1, A 9); next day the body is found under the heat mat. | Record dead crushed; chip `One of the 1 missing` is on | D₁₄ +1 → A 8 (**double subtraction**) until a recount writes J +1. | L⁻₁₄ → D₁₄ (crushed). A stays 9. Suspense 0. | as B. |
| 11 | **…and the hand misses the chip.** | Record dead, chip off | as #10 | D₁₄ +1 → A 8 (wrong by one). The next count asserts 9 → L⁺₁₄ 1. Same-litter L⁺ and L⁻ **net** in the display (`net 0 unexplained`); born 11 = 9 + 2 dead + 1 − 1 ✓. Self-healing at the next count. | as B. |
| 12 | **Tagged piglet vanishes.** Crate 12 tag-all; count 11 of 12. | Set count 11 | J −1 (nameless — breaks law 2). | Count on a tagged litter can't subtract namelessly (SYN law 2): drawer turns into the roster `Which one is missing?` → pick tag 3041 → L⁻ **named** (product-model's Report missing). | as B. |
| 13 | **…and it turns up in 16.** A hand scans tag 3041 in crate 16. | scan | two anomalies; tag lookup says 12. | Scan resolves 3041 → litter 12 with an open named L⁻ → one-tap `Moved to crate 16` pairs it exactly; packet is 12's state (covered). | as B. |
| 14 | **Notched stray.** Notch-all farm; count 16 is +1; the stray's right ear reads litter 12's number. | count + chip | — | The chip list is sorted by notch match; pairing is certain, not guessed. | as B. |
| 15 | **Nurse sow.** Sow D (crate 18) weans her own 11 at d21 and takes 4 fall-behinds from 12 and 14 (d5). | Wean (out of scope) + Move 12 → 18 n 2, Move 14 → 18 n 2 | net F +4; ages lost. | Two moves. Packets per source (12 covered; 14 not → 2 owe). Litter 18's own schedule is over, so arrivals need a clock: **the move carries the source's farrow date**; a litter with no own piglets schedules on its arrivals (open Q, §5). | natural: two lots on their own ages. **C's strongest case.** |
| 16 | **One-sided foster** (hand forgot where they came from). Crate 16 +2 "fostered, don't know from". | Set count / Move with other side "unknown" | F +2 | This *is* L⁺ 2 with reason foster: the same open line. Pairs later when the other crate's count comes up −2. | as B. |
| 17 | **Weaning with an open line.** | Wean | J stays | Open lines don't block (SYN §7.4); the room's net drift is reported as 盘亏/盘盈 at weaning. | as B. |

---

## 5 · Recommendation — Model B

**Choose B: paired moves over a room suspense line, with a treatment packet on every move.**

Why:
1. **It is the owner's "balances out" literally.** Every head change is double-entry; an
   unexplained gap is a move with its other leg unknown, parked on one room line. Pairing and
   finding a body are relabellings, so balance cannot break — and the room line tells a manager
   exactly how much is still unexplained. PigCHAMP already stores fosters this way with an
   optional side (§1.1); B just gives the missing side a name ("unaccounted") instead of leaving
   the report unbalanced.
2. **It answers the treatment question the way the barn does.** The moved piglet brings its own
   state (the only honest answer — the receiver's marks were made before it arrived), known when
   the source was uniformly done or undone and **unknown — check** otherwise. Visible procedures
   are checked by eye; the spray marker that fostering already uses is the physical twin of the
   record (§1.2). The owed count is the reminder; the Due lens carries it — no alerts.
3. **It stays anonymous-first.** Treatment state is a count per litter, as the owner ruled for
   marks. Identity only sharpens it (tags and notches pair strays exactly, #13–14); it is never
   required. Model C's per-lot precision is fictional for untagged piglets and costs a tap on
   every death and mark.
4. **Fewest new surfaces.** Set count gets one chip; the dead picker gets one chip; one Move
   sheet (4 taps) serves foster, stray and nurse. The foster door parked in farrowing v1 bolts on
   without rework — RULINGS reserved exactly these terms.
5. **Self-healing.** A missed chip is repaired by the next count (#11), because counts are
   assertions and same-litter unexplained lines net.

**Borrow from C, narrowly:** a move carries the source litter's farrow date, so a receiver can
print `1 from crate 14 · 2d older` (SYN §7.7) and a nurse-sow litter with no own piglets can be
scheduled on its arrivals. Full lots only if the owner reports nurse sows as routine.

### Rulings the owner should make

1. **Pair window and scope:** same room, opposite sign, ≤ 3 days (the CN age-gap rule) — or wider?
2. **Unknown invisible treatment:** farm default *treat* or *skip · history unknown*? (A vet
   question; iron twice is the harmful case, domain.md A4.)
3. **Pre-lock "Gone · no body"** (session-interaction-spec §78) should post the same L⁻ line so a
   vanished piglet is one object across farrowing and processing — confirm.
4. **RULINGS "After the lock" says an extra live piglet routes to More born;** Q4 says a high count
   is an unexplained gain. Confirm Q4 wins product-wide (B assumes it does).
5. **Nurse-sow scheduling:** a litter of only arrivals — schedule on the youngest arrival, the
   oldest, or per source (which is Model C)?
6. **Is the barn allowed to pair, or console only?** B puts the chip in the barn because the hand
   at the crate knows most (count.md §3 C's argument); console can pair too.
7. **Multi-sow pens:** close Q27 as out of scope for v1 on the §1.4 evidence.
8. **Is "stray" a move reason distinct from "foster"?** (Keeps the fostering-rate KPI honest;
   B defaults to stray when the move comes from a pairing chip.)

---

## 6 · Sources

- PigCHAMP Mobile User Guide (Fostering, Nurse Sow Weaning, Piglet Death, pp.19–20) —
  https://www.pigchamp.com/Portals/0/Documents/Mobile%20User%20Guide.pdf
- pig333, *Sow card: accurate record keeping is essential* —
  https://www.3tres3.com/en/articles/sow-card-accurate-record-keeping-is-essential-to-improve-performance_21297/
- 猪场管家 7.0 help: 仔猪离场 — http://help.gxswine.com/doku.php?id=pigfarm7.0%3Ascgl_xzgl_xzlc ;
  仔猪进场 — http://help.gxswine.com/doku.php?id=pigfarm7.0:scgl_xzgl_xzjc ;
  仔猪转舍 — http://help.gxswine.com/doku.php?id=pigfarm7.0:scgl_xzgl_xzzs
- 河南畜牧兽医信息网, 仔猪接生补铁寄养阉割完整操作方案 — http://www.hnxmsyzz.com/jstg/show-5577.html
- 养猪信息网, 仔猪寄养并窝技术措施 — http://m.gdswine.com/a/175041
- VT Extension, *Cross-fostering Piglets on Commercial Sow Farms* —
  https://www.sites.ext.vt.edu/newsletter-archive/livestock/aps-01_04/aps-0355.html
- Ceva Swine Health, *Cross-fostering* — https://swinehealth.ceva.com/blog/cross-fostering
- Teagasc Pig Skills factsheet, *Cross Fostering Piglets* —
  https://teagasc.ie/wp-content/uploads/media/website/news/daily/pdfs/Teagasc-Pig-Skills-Series-Factsheet---Cross-Fostering-Piglets.pdf
- Business Queensland, *Fostering piglets* —
  https://www.business.qld.gov.au/industries/farms-fishing-forestry/agriculture/animal/industries/pigs/health/foster
- Translational Animal Science 2025, cross-fostered litter composition —
  https://academic.oup.com/tas/article/doi/10.1093/tas/txaf074/8169811
- Nurse sow strategies I/II, *Animal* 2018 — https://www.sciencedirect.com/science/article/pii/S1751731118001702 ;
  late cross-fostering, PubMed 32241314 — https://pubmed.ncbi.nlm.nih.gov/32241314
- Universal ear notching: KSU — https://www.asi.k-state.edu/extension/youth-programs/nominated-livestock/KSU%20Ear%20Notching_from%20Show%20Guide.pdf ;
  UNL G1880 — https://extensionpublications.unl.edu/assets/html/g1880/build/g1880.htm
- Frontiers in Vet Sci 2022, *Transitioning from crates to free farrowing* —
  https://www.frontiersin.org/journals/veterinary-science/articles/10.3389/fvets.2022.998192/full ;
  *Review of temporary crating* — https://www.frontiersin.org/journals/veterinary-science/articles/10.3389/fvets.2022.811810/full
- EFSA 2022, *Welfare of pigs on farm* — https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2022.7421
- Group housing of lactating sows review, PubMed 24534691 — https://pubmed.ncbi.nlm.nih.gov/24534691/
- PLOS One 2016, group housing at 1/2/3 weeks (Swedish organic practice) —
  https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4892577/ ;
  ThePigSite, Swedish bedded group lactation — https://www.thepigsite.com/articles/performance-of-pigs-in-a-swedish-bedded-group-lactation-and-nursery-system
- FiBL, group suckling on organic farms — https://www.fibl.org/en/themes/projectdatabase/projectitem/project/533
- 分娩栏 (CN crate design) — https://www.pwsannong.com/c/2016-04-13/564483.shtml ;
  生猪标准化规模养殖 — https://www.ngx.net.cn/ngmt/gb/jmyg/zfzbc_zfzbc/201506/t20150618_171967.html
- Porcitec — https://www.agritecsoft.com/porcitec/en/breeding-management/
