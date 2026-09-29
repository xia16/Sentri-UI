# Piglet processing (仔猪处理) — scenario tree

Every entity state crossed with every event that can reach it. Each branch ends in one of:

- **→** an outcome — what the record holds afterwards;
- **handoff:`<task>`** — the work leaves this task (farrowing · check-in/巡检 · weaning/断奶 ·
  death drawer · foster · pig actions · postpartum);
- **? Qn** — undecided; the question that decides it is stated once in §8.

Every branch is marked **S** (sourced — cite follows) or **I** (inferred — reasoning follows).
Where sources disagree, RULINGS wins; the conflict is noted and, if RULINGS does not reach
piglet processing, the branch becomes a `?`.

**Citation keys.** PRD = `ux/research/tasks/piglet-processing.html` (§1 production, §2
requirements, §6 open questions; §3–§5 are a proposal, cited only as "PRD-prop" and never as
law) · RUL = `farrowing/RULINGS.md` · SYN = `farrowing/SYNTHESIS.md` (§ = section; law n = §3
law n) · CEP = `count-entry-pattern.md` · CNT = `count.md` · ID = `identity.md` · LAD =
`ladder.md` · LC = `lifecycle.md` · PM = `ux/model/product-model.html` · UTL =
`ux/model/unified-task-list.md` (historical) · CI = `ux/research/checkin/` (check-in.html,
pen-count.md, row-content.md).

**Two clocks, kept apart throughout.** *Her farrowing session* locks per sow at `Lock born N`
(RUL "Model", "After the lock"). *The batch farrowing task* ends when the batch is closed
(SYN §6 E2). "Farrowing still open" in the task states below means the batch task; a litter
can be locked while the batch is still open.

---

## 1 · Task

States: T0 not yet created · T1 open, batch farrowing still open · T2 open, farrowing ended ·
T3 ended complete · T4 ended partial. Each crossed with **mandatory (m)** / **non-mandatory
(n)** only where the flag changes the result.

| # | State | Event | Result | Src |
|---|---|---|---|---|
| T-1 | T0 | litter farrows (first record) | ? Q1 — when the task is created and whether day-1 marks (cord, drops) can land before it exists | I — PRD §2 says the schedule is console-configured; nothing says when the task opens |
| T-2 | T0 | record treatment on a litter (e.g. d1 cord at birth, from the farrowing sheet) | ? Q1 | I — day-1 work happens while the sow may still be farrowing |
| T-3 | T0 | find dead piglet | handoff:death drawer (from the farrowing sheet while her session is open) | S — RUL "Surfaces": one dead drawer, opened during · on the record · in check-in |
| T-4 | T1 | record treatments (any) | → marks commit per tap, stamped who·when; progress re-derives | S — PRD §2 (mark = record, no payload); SYN §4 (no submit) |
| T-5 | T1 | end task | ? Q2 — production blocks (farrowing must end first); owner's closure stance is warn + doors, never hard-block | S (conflict) — PRD §1 cannot-end dialog 928:5219 vs SYN §6 E2 + B1 |
| T-6 | T1 | farrowing batch task ends | → T2; End task becomes available (production rule) | S — PRD §2 configuration: "end farrowing before ending piglet processing" |
| T-7 | T1 | window expires (day N of N) with litters outstanding | ? Q6 | S (open) — PRD §6 Q2; LC §2 vs §4 |
| T-8 | T2 | end task, all litters all done | → T3; task detail frozen (progress, on-time KPI, who ended, when); litter records stay viewable | S — PRD §1 ended fork (5752:7186); LC §3 frozen sheet |
| T-9 | T2 (n) | end task, litters outstanding | → T4 after the consequences statement is acknowledged; unfinished marks print `!` on the frozen record | S — PRD §1 (971:15884 non-mandatory may end incomplete; 4763:4382 ack page; ended record `!` markers) |
| T-10 | T2 (m) | end task, litters outstanding | ? Q5 — what mandatory changes (block, escalate, or copy only) | S (open) — PRD §2 lists the flag; no source defines mandatory behaviour |
| T-11 | T2 | end task — who may | → anyone; stamped | I — SYN §6 E2 rules "anyone may close" for batch farrowing; LC Q2 left sweeps open; applied here by analogy |
| T-12 | T2 | End task still exists at all? | ? Q3 — production ceremony vs "closure is non-events" | S (conflict) — PRD §1 vs SYN §4, LC §2–3 |
| T-13 | T2 | window expires | ? Q6 | S (open) — PRD §6 Q2; LC Q2 |
| T-14 | T2 | weaning arrives for some litters | handoff:weaning for those litters; their processing residual → ? Q7 | S — SYN §1 spine; LAD Q3 |
| T-15 | T3 / T4 | record a new treatment mark (backfill) | ? Q4 — production: "cannot backfill later"; lifecycle: rows stay ✎ at record level | S (conflict) — PRD §1 928:5219 vs LC §4 |
| T-16 | T3 / T4 | correct an existing mark or identity row | ? Q4 | S (conflict) — as T-15 |
| T-17 | T3 / T4 | view litter record / piglet table | → read-only; day accordions keep ✓/`!` and attributions; identity table viewable | S — PRD §1 ended litter record ×3; "提交后不可再查看" applies to the entry form, not the data |
| T-18 | T3 / T4 | find dead piglet | handoff:check-in/巡检 → death drawer (events outlive the task) | S — SYN §6 C1 (after close, deaths go to check-in); PM §2 (tasks observe events) |
| T-19 | T3 / T4 | count heads / mismatch | handoff:check-in/巡检 (count correction is a unit event) | S — PM §4 count correction (巡检 calibration); CI pen-count |
| T-20 | T3 / T4 | sow dies | handoff:death drawer (sow mode) · pig actions (her page leads with the death) | S — RUL "Starting and ending": sow mode of the one drawer; pig-actions round |
| T-21 | T3 / T4 | weaning arrives | handoff:weaning; nothing carried from processing except the ledger | I — PM §2: records persist independently of the task |
| T-22 | T4 | reopen task | ? Q4 (no source describes a reopen; "cannot backfill" implies none) | I |
| T-23 | any open | interruption (app closed / phone dies / offline) | → nothing lost: every committed mark stands; staged drafts (death drawer) stay on device | S — RUL "exit grammar"; ID §4 mid-litter interruption |
| T-24 | any open | second worker working the same room | → both see live marks when online; offline duplicate marks dedupe (same litter · treatment · day) | S — SYN §7.9 |
| T-25 | T1/T2 | two hands split one room | ? Q28 — is live dedupe enough, or is a claim mechanism needed | S (open) — LAD Q5; SYN §5 E1 (not answered in §7) |
| T-26 | T1/T2 | postpartum check open on the same pens | ? Q30 | S (open) — PRD §1 designer note 2519:9347; PRD §6 Q4 |
| T-27 | T1/T2 | on-time KPI computed | → derived: marks dated on/before planned day ÷ scheduled marks; early counts as on time; late counts against | S — PRD §2 derived values |

---

## 2 · Litter (pen / crate row)

States: L0 no task · L1 nothing due (next in n days) · L2 due today · L3 overdue · L4 partly done
today · L5 all done · L6 pre-fillable (future day) · L7 sow dead / orphaned · L8 fostered off
entirely · L9 multi-sow pen · L10 farrowing session not yet locked (added — the count and birth
facts still belong to farrowing).

| # | State | Event | Result | Src |
|---|---|---|---|---|
| L-1 | L0 | any processing event | → none possible; pen listed for physical completeness (dimmed in All), record shows no-task state | S — PRD §1 A4 无仔猪处理任务, 2495:5505 |
| L-2 | L0 | a real litter has no task (late farrower, sow re-entered, litter outside the batch) | ? Q33 | I — LAD §1 names drifted litters; no source says whether they join a task |
| L-3 | L0 | find dead piglet | handoff:death drawer via check-in/巡检 | S — RUL "Surfaces"; SYN §6 C1 |
| L-4 | L1 | time passes to due day | → L2; row reads due, planned date derived, never typed | S — PRD §2 derived (age-day, planned date, countdown) |
| L-5 | L1 | record treatments early (pre-fill) | → L6 branch: mark commits dated today; strip shows early stamp; counts on time | S — PRD §1 可提前填; LAD §3; PRD §2 on-time rule |
| L-6 | L2 | record treatments (one litter, all today's) | → L5 for today; stamps; row leaves Due lens; progress +1 pen | S — PRD §2; LAD §3 (last token crosses the row) |
| L-7 | L2 | record treatments (one litter, some) | → L4; remaining treatments listed in words | S — PRD §2 remaining set; LAD §3 |
| L-8 | L2 | record treatments (many litters, bulk) | → each selected litter marked with the same set; already-done items show stamp, not re-marked | S — PRD §2 ("litter-level treatments are bulk"); PM §4 arity Bulk; PRD-prop §4 greying |
| L-9 | L2 | bulk selection includes a litter where a chosen treatment is not due / already done / not applicable | ? Q12 variant → partial eligibility must be listed, not silently dropped | S — PM §5 Law 3 (partial eligibility visible); the rendering for marks is undecided |
| L-10 | L2 | day ends unmarked | → L3; row overdue, "late is not gone" | S — SYN law 5; LC §4; SYN §7.8 |
| L-11 | L3 | record treatments late | → marks stamped with actual who·when against the scheduled day; KPI absorbs lateness; row never nags twice | S — SYN law 5; LC §4 |
| L-12 | L3 | next scheduled day arrives, earlier day still undone | → both days' tokens on the row, oldest first; no forced order; strip shows `d3 !` | S — LAD §4 behind schedule |
| L-13 | L3 | treatment is clinically pointless now (d1 iron at d10) | → stays overdue; no conversion in v1 | S — SYN §7.8 |
| L-14 | L3 | window expires / task ends | ? Q6 (window) · T-9/T-10 (end) | S (open) |
| L-15 | L3 | weaning arrives with the residual | ? Q7 | S (open) — LAD Q3 |
| L-16 | L4 | record the rest | → L5 | S — LAD §3 |
| L-17 | L4 | second worker marks the rest on another phone | → L5 on sync; attribution per mark shows two hands | S — SYN §7.9; PRD §2 (recorded-by per mark) |
| L-18 | L5 | reopen by un-recording a mark | ? Q12 | I |
| L-19 | L5 | next scheduled day arrives | → L2 for the new day | S — PRD §2 derived status |
| L-20 | L5 (all days) | nothing further | → row reads all done with stamp; stays until weaning / task end | S — PRD §1 已完成所有处理 |
| L-21 | L6 | record future-day treatments | → commit, dated today; that day shows as done early | S — PRD §1 可提前填; LAD §3 |
| L-22 | L6 | record future-day tag/weigh (identity + weight before d5) | → I: allowed — conveyor has no day gate; weight is stamped with today's date (age derived) | I — nothing is ever disabled (LC §4); ID has no day gate |
| L-23 | L6 | how far ahead may one pre-fill | ? Q34 | I |
| L-24 | L7 | sow dies (post-lock) | handoff:death drawer (sow mode); litter stays in the room: `N alive` + `sow died` chip; record face opens with red band | S — RUL "Sow dies" (row stays in room, orphan fact) |
| L-25 | L7 | record treatments on the orphan litter | → I: marks continue on the litter's own schedule (age derives from the farrow date, not the sow) | I — PRD §2 age-day from farrow date; RUL `7 alive stay under piglet care` |
| L-26 | L7 | foster the orphans off | ? Q8 (fostering parked in v1 farrowing) → if reopened, handoff:foster | S — RUL "After the lock" (fostering PARKED; orphan shows `N alive · no sow`, no Pairing door) |
| L-27 | L7 | which door records the sow's death during processing | ? Q31 | S (open) — RUL rules the drawer's sow mode for mid-farrowing only |
| L-28 | L8 | all piglets fostered out, sow stays | ? Q11 — row leaves the cohort, counts done, or not applicable | I |
| L-29 | L8 | the receiving litter | → fostered piglets ride the receiver's crate schedule; row note `incl. 3 fostered · 2d older` | S — SYN §7.7; PRD §1 `20 头（含 3 头寄养）` |
| L-30 | L9 | record treatments in a multi-sow pen | → each litter is its own row inside the pen group; marks per litter | S — PRD §1 pen-grouped rows, single- vs multi-pig card templates |
| L-31 | L9 | count / death / unidentified piglet whose litter is unclear | ? Q27 | I — CI row-content #13: mixed pens unspecified |
| L-32 | L10 | record treatments | → allowed; marks are litter facts independent of the lock | I — PRD §2 mark has no dependency on Born |
| L-33 | L10 | count mismatch found during processing | handoff:farrowing (pre-lock: Alive stepper, or Edit → Gone · no body) · ? Q21 | S — RUL "Model" (pre-lock vanished piglet = Edit → Gone · no body) |
| L-34 | L10 | find dead piglet | handoff:death drawer (the farrowing sheet's Record dead; same ledger event) | S — RUL "Surfaces"; SYN §6 C1 |
| L-35 | L10 | her session locks | → Born frozen; count door becomes the litter census (count drawer) | S — RUL "Model" post-lock |
| L-36 | any | task ended while litter at L2–L4 | → frozen with `!` on gaps; row style = no attribution stamp | S — PRD §1 5913:10060, ended litter record |
| L-37 | any | weaning arrives | handoff:weaning; the transfer carries the counted number, never blocked by reconciliation | S — CNT §4 day-3 vs weaning; SYN §1 |
| L-38 | any | postpartum check on the same sow | handoff:postpartum (separate record) · ? Q30 for a link | S (open) — PRD §6 Q4 |
| L-39 | any | scan a piglet tag | → resolves to its litter (selection or record) | I — PRD-prop §4 only; production scan is sow/pen (PRD §1 FAB) |

---

## 3 · Treatment mark (per litter × age-day × treatment)

States: M0 not done · M1 done by me · M2 done by other · M3 done early · M4 done late · M5 on
the wrong litter · M6 partial count (added — `iron · 7 of 12`).

| # | State | Event | Result | Src |
|---|---|---|---|---|
| M-1 | M0 | record (one litter) | → M1: bool + recorded-by + timestamp; no payload | S — PRD §2 |
| M-2 | M0 | record (many litters) | → M1 on each; one timestamp; one reflow | S — PRD §2; LAD §3 bulk |
| M-3 | M0 | record for fewer heads than the litter | → M6: `7 of 12`, 5 stay due | S — LAD §2 (whole-litter default, exception by count) · ? Q14 whether this is the v1 rendering |
| M-4 | M0 | deliberate omission (weak piglets, kept gilts) | ? Q14 | S (open) — SYN §5 D3, not answered in §7 |
| M-5 | M0 | sex-limited treatment (castrate) | ? Q15 — does "whole litter" mean all heads or all boars; is sex known before d5 | I |
| M-6 | M0 | day passes | → overdue (L3) | S — LC §4 |
| M-7 | M0 | task ends | → stays not done, printed `!` on the frozen record | S — PRD §1 ended record |
| M-8 | M0 | interruption mid-litter | → marks already tapped stand; the rest stays M0 | S — RUL "exit grammar" (commit per tap) |
| M-9 | M0 | offline | → mark commits on device, syncs later; stamp is tap time | S — SYN §7.9; SYN law 6 |
| M-10 | M1 | record again (same treatment, same day, by me) | → no second mark (greyed with stamp in the bulk sheet) | S — PRD-prop §4 greying; SYN §7.9 dedupe rule |
| M-11 | M1 | un-record (tapped by mistake, still on the litter) | ? Q12 | I |
| M-12 | M1 | correct (wrong treatment ticked) | ? Q12 | I |
| M-13 | M1 | litter later loses heads (death, foster out) | → mark stands; it was true when made | I — marks are append-only events (SYN §7.9) |
| M-14 | M1 | litter later gains heads (foster in) | ? Q9 — do the fostered heads owe the already-marked treatment | I |
| M-15 | M2 | I open the litter | → done, stamp shows the other hand; not re-offered | S — PRD §1 recorded-by on every done item |
| M-16 | M2 | both of us mark it offline | → deduped as same litter · treatment · day; both stamps kept in history | S — SYN §7.9 |
| M-17 | M2 | I think the other hand's mark is wrong | ? Q12 (who may correct another's mark) — RUL: open ✎, stamped, no role gate, stated for Born | I — by analogy with RUL "Anyone may amend born" |
| M-18 | M3 | its day arrives | → nothing due for that treatment; strip shows the early stamp | S — LAD §3; PRD §1 可提前填 |
| M-19 | M3 | KPI | → on time (dated before planned day) | S — PRD §2 on-time rule |
| M-20 | M4 | recorded after planned day | → stamped actual date; counts late in KPI; row un-reds | S — SYN law 5; LC §4 |
| M-21 | M4 | end-of-row catch-up entry (act at 07:10, entered 09:30) | → stamp = entry time; the day is the compliance grain | S — LAD §4; SYN §6 B1/B3 (entry-time stamping stands) |
| M-22 | M5 | discovered wrong litter | ? Q13 — correction on the wrong litter + fresh mark on the right one (the wrong-sow rule), and which date the right litter's mark carries | S (analogy) — RUL "Surfaces": wrong sow = correction here + recording on the right sow |
| M-23 | M5 | the right litter's treatment still due | → stays due until marked on the right litter | I — follows from M-22 |
| M-24 | M6 | record the remaining heads later | → `12 of 12` → done; two stamps | S — LAD §2 |
| M-25 | M6 | remaining heads die | → I: residual should drop with the count; ? Q14 whether residual is heads or a litter flag | I |
| M-26 | M6 | task ends with residual | → `!` on frozen record; counted as partial | S — PRD §1 ended fork 部分完成 |
| M-27 | any done | task ended | → frozen, viewable, correction ? Q4 | S — PRD §1; LC §4 |

---

## 4 · Piglet identity row (tag · notch · sex · weight)

States: R0 none · R1 partial (some piglets rowed) · R2 complete (every live piglet rowed) · R3
duplicate tag · R4 dead piglet with row · R5 fostered piglet (in, with or without row) · R6
incomplete row (added — row exists, missing tag/notch or weight).

| # | State | Event | Result | Src |
|---|---|---|---|---|
| I-1 | R0 | record rows (conveyor) | → R1; each `Confirm & next` commits one piglet; line reads `tag/weigh · 9 of 20` | S — ID §3 R1; SYN §2 |
| I-2 | R0 | first tag entered / scanned | → next field suggests +1, editable; scan overrides | S — SYN §7.1 (no range management) |
| I-3 | R0 | notch-only farm | → notch is the identity; lookup by notch exists wherever lookup by tag does | S — SYN §7.2 |
| I-4 | R0 | no weight entered | → row valid; weight never gates confirm | S — SYN §6 A1/A2 |
| I-5 | R0 | keepers-only farm (tag a subset) | → legal; untagged remainder stays the group count | S — ID §4; PRD §2 "any subset" |
| I-6 | R1 | interruption (app closed, phone dies) | → committed rows stand; resume at `9 of 20`, pre-fill = last + 1 | S — ID §4 mid-litter interruption |
| I-7 | R1 | second worker adds rows on another phone | → I: both sets stand; tag +1 suggestion may collide → duplicate warning (R3) | I — SYN §7.9 append-only; ID §2 |
| I-8 | R1 | offline | → rows commit on device; sync later | S — SYN §7.9 |
| I-9 | R1 | record more rows | → R2 when rows = live count | S — ID §3 |
| I-10 | R1 | sex counts asked | → steppers only for the un-rowed remainder | S — ID §4; PRD §2 (公猪/母猪数量) |
| I-11 | R1 | rows later + steppers disagree / steppers entered then more rows added | ? Q23 | I |
| I-12 | R1 | count heads — observed is below rows | → anonymous decrement only from the untagged remainder; beyond it, name which tagged piglets (roster) | S — SYN law 2; CNT §4 |
| I-13 | R2 | record another row (21st of 20) | ? Q20 | I |
| I-14 | R2 | sex counts | → derived from rows, never asked | S — ID §4; PRD-prop merge (consistent with SYN law 4 "never ask twice") |
| I-15 | R1/R2 | correct a row (typo, swapped tags) | → ✎ per row, stamped; swapping two tags = two edits | S — ID §4 |
| I-16 | R1/R2 | retag after tag loss | handoff:pig actions (✎ on identity, 修改身份; old number retired to history) | S — ID §4 retag |
| I-17 | R1/R2 | un-record a row (tag failed after confirm, phantom row) | ? Q16 | I — ID §4 covers editing the pre-fill before confirm only |
| I-18 | R1/R2 | view after "submit" | → always viewable (piglet table) · ? Q17 whether 提交后不可再查看 is a compliance rule | S (open) — PRD §6 Q1; SYN §4 |
| I-19 | R3 | duplicate tag entered | → amber inline warning, never blocks | S — SYN §7.1 (downgraded from ID's refuse) |
| I-20 | R3 | duplicate within the same litter pass (same piglet caught twice) | → I: warning; hand edits the second row · ? Q16 if it should be deleted | I |
| I-21 | R3 | scan a duplicated tag | ? Q19 — which litter/piglet the scan resolves to | I |
| I-22 | R4 | tagged piglet found dead | handoff:death drawer, per-pig (named) death; ? Q18 row's fate in the table | S — SYN law 2; CNT §4 |
| I-23 | R4 | count heads afterwards | → count excludes the dead piglet; its row no longer counts toward `n of N` | I |
| I-24 | R5 | fostered-in piglets without identity into a rowed litter | ? Q10 | S (open) — PRD §6 Q6; PRD §1 foster warning 1000:5357 |
| I-25 | R5 | fostered-in piglet with identity | → I: its row moves with it (itemised foster) · parked: Q8 | S — PM §6 fostering (identities → itemised list) |
| I-26 | R5 | fostered piglet's own treatments / day-age | → rides the receiver's crate schedule | S — SYN §7.7 |
| I-27 | R6 | row missing weight | → valid; list shows `-` | S — PRD §1 971:15924; SYN §6 A1 |
| I-28 | R6 | row missing both tag and notch | → invalid-row state; not committed | S — PRD §1 635:3533 red invalid row; PM §6 (tag* required) — with notch-only exception SYN §7.2 |
| I-29 | any | task ended | → table read-only and viewable; correction ? Q4 | S — PRD §1 ended piglet list |
| I-30 | any | weaning | handoff:weaning (identity rows travel with the piglets) | I — PM §4 weaning conveyor |

---

## 5 · Count (observed vs system)

System count = alive (post-lock: Born − deaths ± fosters; derived). States: C0 matches · C1 under
(observed < system) · C2 over (observed > system) · C3 unexplained anomaly outstanding.

| # | State | Event | Result | Src |
|---|---|---|---|---|
| C-1 | C0 | count heads | → confirmation stamped (`counted jul 12 · G.H`), no delta | S — CNT §3 |
| C-2 | C1 | count heads (post-lock) | → assertion commits; delta shows doors: `Record 2 deaths ›` · (`Record a foster ›` — parked, Q8) · `Just set count` | S — CNT §3 A; SYN law 1; RUL "Model" (post-lock door is the census) |
| C-3 | C1 | take the death door | handoff:death drawer (pre-filled); alive re-derives from the death; no second write | S — CNT §3; RUL one dead drawer |
| C-4 | C1 | choose `Just set count` | → C3: count set, trail `2 unexplained`, compliance anomaly tallied in console, not barn chrome | S — SYN §7.4; RUL "Model" (never a fabricated death) |
| C-5 | C1 | delta exceeds the untagged remainder | → death door becomes a roster naming tagged piglets | S — SYN law 2 |
| C-6 | C1 | pre-lock (her session open) | handoff:farrowing (Edit → Gone · no body; bodies via Record dead) · ? Q21 | S — RUL "Model" |
| C-7 | C2 | count heads (post-lock) | → doors: `More born ›` (Edit ceremony on the farrowing record) · foster in (parked) · `Just set count` (anomaly) | S — RUL "After the lock" (extra live piglet → More born › inside Edit); CNT §4 |
| C-8 | C2 | take More born | handoff:farrowing (post-lock Edit, amber, stamped, open to anyone) | S — RUL "Anyone may amend born" |
| C-9 | C2 | pre-lock | handoff:farrowing (+ is free on Alive) | S — RUL "Model" |
| C-10 | C3 | later count matches the set value | → anomaly stays in the trail; new base | I — CNT §4 repeated drift |
| C-11 | C3 | body of an "unexplained" piglet found later | ? Q22 | I |
| C-12 | C3 | weaning with anomaly outstanding | → legal; commits and tallies | S — SYN §7.4 (answers CNT Q1) |
| C-13 | C3 | repeated unexplained drift on one litter | → console report, not barn chrome | S — CNT §4 |
| C-14 | any | offline, two hands count the same litter | ? Q29 — last-record-wins (SYN §7.9) vs merge contract (RUL: signed deltas, floor breach → sync review) | S (conflict) |
| C-15 | any | interruption mid-count | → I: committed assertion stands; an unfinished drawer draft stays on device | I — RUL "exit grammar" (staged drawers keep drafts) |
| C-16 | any | task ended | handoff:check-in/巡检 | S — PM §4; SYN §6 C1 |
| C-17 | any | foster in / out recorded | → system count re-derives on both litters; no manual sync · parked Q8 | S — PM §2 (nothing to sync); RUL (foster terms reserved, = 0 in v1) |

---

## 6 · Litter weight (at the weigh day) and birth litter weight

States: W0 missing · W1 present · W2 conflicting. "Litter weight" = 仔猪总体重 at the weigh
age-day; "birth weight" = 出生整窝体重, a farrowing fact.

| # | State | Event | Result | Src |
|---|---|---|---|---|
| W-1 | litter weight W0 | weigh litter | → W1: decimal kg, stamped; age derived from the stamp | S — PRD §2 |
| W-2 | litter weight W0 | weigh day passes without it | → stays missing; never gates anything | S — SYN §6 A1/A2 (enrichment optional) |
| W-3 | litter weight W0 | shown as missing | ? Q25 — production's amber warning vs "optional by philosophy" | S (conflict) — PRD §1 1000:5357 amber vs SYN §6 A1 |
| W-4 | litter weight W1 | weigh again (second hand, same day) | → later stamp stands (scalar last-record-wins) · ? Q29 | S — SYN §7.9 |
| W-5 | litter weight W1 | weighed on another age-day | ? Q26 — one value per litter or per age-day | I |
| W-6 | litter weight W1 | out-of-band value | → soft range warning, never blocks | S — RUL "Model" (Finish litter weight: soft range warn) by analogy; ID §3 |
| W-7 | litter weight W2 | differs from Σ per-piglet weights (fully rowed) | ? Q24 | I — PRD §2 says the two are distinct facts |
| W-8 | birth W0 | backfill during processing | ? Q25 — processing's backfill line vs farrowing's post-lock Edit (`At finish` fold) | S (conflict) — PRD §1 963:14753 vs RUL "Edit folds what a hand rarely fixes" |
| W-9 | birth W0 | her session still open | handoff:farrowing (optional fact at Finish) | S — RUL "Model" (optional facts at Finish: litter weight) |
| W-10 | birth W1 | correct it | handoff:farrowing (post-lock Edit, amber corrected figure) | S — RUL "After the lock" |
| W-11 | birth W2 | entered at Finish and again via processing backfill | ? Q25 | I |
| W-12 | any | task ended | → read-only on the frozen record; correction ? Q4 | S — PRD §1 ended info tab |

---

## 7 · Cross-cutting events (any entity)

| # | State | Event | Result | Src |
|---|---|---|---|---|
| X-1 | any | find dead piglet (untagged) | handoff:death drawer — cause tally, no WHEN (the stamp is the date), photos optional | S — RUL "Surfaces", "No WHEN anywhere" |
| X-2 | any | find dead piglet — which context opens the drawer from processing | → the litter record's overflow · ? Q32 whether processing is a third context beside farrowing and check-in | S (partial) — PRD §1 更多操作 上报死亡; SYN §6 C1 names two contexts |
| X-3 | any | sow abortion entry on the more-sheet | → not offered (wrong-stage leftover) | S — PM §5 Law 3 (gate on the animal; 流产 named as the leak) |
| X-4 | any | foster in / out from the litter record | ? Q8 | S (conflict) — PRD §1 1567:20878 vs RUL fostering PARKED |
| X-5 | any | app closed / phone dies | → all per-tap commits stand; staged drafts kept on device | S — RUL "exit grammar"; ID §4 |
| X-6 | any | offline | → records queue; photos upload later; stamps are device times but clocks never resolve conflicts | S — RUL "Sow dies" (uploads queue offline); RUL merge contract |
| X-7 | any | offline event stamped before a lock but arriving after | → flagged, offered through the record's own ceremony (More born › / Count was wrong ›) | S — RUL merge contract |
| X-8 | any | postpartum check due on the same sow | handoff:postpartum · ? Q30 | S (open) |
| X-9 | any | weaning | handoff:weaning | S — SYN §1 spine |

---

## 8 · Open questions for the product owner (deduplicated)

Each is stated once; the branches that need it are listed.

1. **Q1 · When is the task created?** Relative to farrowing — at batch start, at a litter's
   first record, or on a console schedule? Can day-1 marks (cord, drops) be recorded while
   the sow is still farrowing and before a task exists? *(T-1, T-2)*
2. **Q2 · Ending processing while farrowing is open:** production blocks it; the owner's
   batch-close stance is "warn and offer doors, never hard-block". Which one applies to piglet
   processing? *(T-5)*
3. **Q3 · Does an End task act survive?** Production has a consequences page and an
   acknowledgement. The synthesis says a task closes by itself (the list reaches zero, the
   frozen sheet is the record). Is End task a manual act, an auto-close, or both? *(T-12)*
4. **Q4 · After the task ends, what can still be written?** Production: "cannot backfill
   later". Lifecycle: records stay editable. Answer separately for (a) new marks, (b)
   corrections to marks, (c) identity rows and weights, (d) reopening the task.
   *(T-15, T-16, T-22, M-27, I-29, W-12)*
5. **Q5 · What does the mandatory flag change?** Block ending until all litters are done,
   escalate the remainder, or only the wording? *(T-10)*
6. **Q6 · Window expiry:** when the task's window ends with litters outstanding, does the
   task auto-close, stay open, or do per-litter overdue items carry on? (PRD §6 Q2.)
   *(T-7, T-13, L-14)*
7. **Q7 · Residual treatments at weaning:** does an undone treatment survive into weaning,
   end at weaning, or end only at task end? *(T-14, L-15)*
8. **Q8 · Fostering in piglet processing v1:** RULINGS parks fostering and ships no foster
   doors in v1 farrowing. Does that parking extend to the litter record's foster entry here?
   *(L-26, C-2, C-7, C-17, I-25, X-4)*
9. **Q9 · Fostered-in heads and treatments already marked:** if the receiver's day-3 iron is
   already done, do the three fostered-in piglets owe iron (the row reopens `iron · 3 left`)
   or does the litter mark cover them? *(M-14)*
10. **Q10 · Fostered-in piglets without identity into a rowed litter:** allow identity rows
    flagged as possibly inaccurate, or block until the origin is resolved? (PRD §6 Q6.)
    *(I-24)*
11. **Q11 · Litter fostered off entirely:** with the sow alive and zero piglets, does the row
    leave the task, count as done, or count as not applicable in progress and the on-time
    KPI? *(L-28)*
12. **Q12 · Undoing a treatment mark:** can a done mark be removed (tapped by mistake, wrong
    treatment), through which door, and is the original kept as a struck event? May anyone
    correct another hand's mark? Also: how does a bulk mark treat litters where the treatment
    is not due or already done? *(L-9, L-18, M-11, M-12, M-17)*
13. **Q13 · Marks on the wrong litter:** confirm the wrong-sow rule applies (correct here,
    record fresh on the right litter), and say which date the right litter's mark carries for
    the on-time KPI. *(M-22)*
14. **Q14 · Partial and refused treatments:** is `iron · 7 of 12` (5 stay due) the v1
    rendering for refusals, or does a deliberate omission need its own mark? Is the residual
    a head count that falls when those piglets die? (SYN D3 — not answered in §7.)
    *(M-3, M-4, M-25)*
15. **Q15 · Sex-limited treatments (castration):** does "whole litter" mean all heads or all
    boars, and how is it known before sex is recorded? *(M-5)*
16. **Q16 · Deleting an identity row:** can a confirmed row be deleted (tag failed after
    confirm, piglet entered twice), or only edited? Is deletion stamped? *(I-17, I-20)*
17. **Q17 · 提交后不可再查看:** a compliance rule (tamper protection needing a permission gate)
    or a form artefact? (PRD §6 Q1.) *(I-18)*
18. **Q18 · A tagged piglet's row after death:** does it stay in the piglet table marked dead,
    and is its tag number retired? *(I-22)*
19. **Q19 · Scanning a tag that exists twice:** duplicates only warn, so which litter or
    piglet does a scan open? *(I-21)*
20. **Q20 · More rows than live piglets:** does the 21st row of 20 raise the count (a `More
    born` path), get refused, or only warn? *(I-13)*
21. **Q21 · Count mismatch before her farrowing is locked:** hand the count to the farrowing
    sheet, or allow the processing count drawer too? *(L-33, C-6)*
22. **Q22 · An "unexplained" piglet's body found later:** recording the death would subtract
    it a second time. How is the unexplained anomaly resolved, and does the death re-anchor
    the count? *(C-11)*
23. **Q23 · Sex counts vs rows:** when sex steppers were entered for the remainder and more
    rows are added later, do the steppers re-derive, and which one wins if they disagree?
    *(I-11)*
24. **Q24 · Litter weight vs summed piglet weights** on a fully rowed litter: two independent
    facts, or warn when they disagree? *(W-7)*
25. **Q25 · Birth litter weight:** it is recorded in farrowing (at Finish, then Edit), and
    processing also has a backfill line. One field with two doors, or farrowing only? And is
    the amber "missing" warning allowed, given the owner's rule that enrichment is optional?
    *(W-3, W-8, W-11)*
26. **Q26 · Litter weight grain:** one value per litter, or one per age-day weighed? *(W-5)*
27. **Q27 · Multi-sow pens:** when unidentified piglets mix across litters, which litter
    owns a count, a death or a mark? *(L-31)*
28. **Q28 · Two hands in one room:** is live dedupe enough, or is an explicit claim needed?
    (LAD Q5 / SYN E1.) *(T-25)*
29. **Q29 · Offline conflicts on counts and weights:** the owner said last-record-wins; the
    RULINGS merge contract (draft) says signed deltas with floor breaches flagged for review.
    Which governs piglet-processing counts and weights? *(C-14, W-4)*
30. **Q30 · Postpartum and processing on the same pens:** one combined walk, or a jump link
    between the two records? (PRD §6 Q4.) *(T-26, L-38, X-8)*
31. **Q31 · The sow dies during processing (after the lock):** is the door the death
    drawer's sow mode opened from the litter record, or her sow page (pig actions)? Does the
    orphan litter keep its schedule? *(L-27)*
32. **Q32 · Death contexts:** the synthesis names two (the farrowing task while open,
    check-in after). Is the processing litter record a third context for the same drawer?
    *(X-2)*
33. **Q33 · Litters without a task:** a late farrower or re-entered sow whose litter falls
    outside the batch. Can it be processed, and in which task? *(L-2)*
34. **Q34 · How far ahead can marks be pre-filled:** any future day, including tag and
    weigh? *(L-22, L-23)*
