# Piglet processing (仔猪处理) — evaluation set

**Date:** 2026-09-28 · **Status:** fixed before design.

**Purpose.** This is the yardstick the autonomous design run on 仔猪处理 is judged against. It was
written from sources only, before any design existed, so the design cannot shape it. The pilot's
scenario lens and walk-through agents never see this file. It is for judging the run, not for
steering it.

It states behaviour and record outcomes only. A design passes a case when the worker can carry
out the intentions and the record afterwards meets the required outcome. How the screens look is
out of scope.

**Sources read**

| Short name | File | Standing |
|---|---|---|
| PRD | `ux/research/tasks/piglet-processing.html` | Primary requirements. §1 inventory, §2 requirements, §6 open questions. Its §3–§5 (subtraction, flow, deltas) are an earlier design proposal and are **not** used as requirements here. |
| BRIEF | `ux/research/tasks/BRIEF.md` | How the PRDs were made: production is the requirements source, its UI is not the target. |
| INV | `ux/tasks/piglet-processing/research/figma-inventory.md` | Frame ids for the old UI section (634:16579) and the new 08/26 UI section (8003:11059). The new page repeats the old frame set one for one. |
| RUL | `ux/research/farrowing/RULINGS.md` | Settled farrowing law. It outranks the other farrowing files. |
| CEP | `ux/research/farrowing/count-entry-pattern.md` | Product-wide count and correction law. |
| SYN | `ux/research/farrowing/SYNTHESIS.md` | Cross-slice laws (§3), the sins register (§4) and owner answers (§6–§7). Wherever RUL disagrees, RUL wins. |
| PM | `ux/model/product-model.html` | Tasks observe events. Event catalogue §4, laws §5, identity §6. |
| (spot) | `ux/research/farrowing/count.md`, `ladder.md`, `identity.md` | Read only to pin boundaries: the piglet ledger, fostered day-ages, duplicate tags. |

No weaning (断奶检查) PRD exists in `ux/research/tasks/`, so the weaning boundary is pinned from SYN,
count.md and PM only.

---

## 1 · Glossary of counts and identities

Each entry gives **entity · population · time · scope**, the source that defines it, and any
ambiguity. A term marked ⚠ is ambiguous or contested between sources. This file does not resolve
those; Section 4 asks the product owner.

| Term (中文) | Entity · population · time · scope | Defined by | Notes / ambiguity |
|---|---|---|---|
| **Born** (产仔总数) | Litter · every piglet born to this sow, live and dead · fixed at farrowing Finish/lock · this farrowing | RUL Model: `Born = Alive + Σ Dead + fostered out − fostered in`. Derived and never entered. It locks at Finish. After the lock it changes only through Edit ("More born" / "Count was wrong"). | Owned by farrowing. Piglet processing never writes it directly, but an over-count found during processing may feed it (E06). |
| **Born alive** (活仔 / 健仔+弱仔+畸形) | Litter · piglets alive at birth · at farrowing lock · this farrowing | ⚠ RUL has no "born alive" term. It has Alive (a live count that moves) and Born (which includes the dead). SYN B2 and §8.3 speak of "born-alive" and the live classes. | ⚠ It is unclear whether "born alive" means Alive at lock, or Born minus dead-at-birth. The two differ once post-birth deaths during farrowing count as Dead. |
| **System litter count** (系统记录数量 / 仔猪数量) | Litter · the live piglets the system believes are on this sow now · live · the current sow/crate, **including fostered-in** | PRD 1630:7820 (`20 头（含 3 头寄养）`). SYN §1 and count.md: `live-born − recorded deaths ± recorded fosters`. | ⚠ In `含 3 头寄养`, it is not stated whether 3 means fostered-in only or net fosters. It is also unstated whether piglets fostered-out that the sow is still nursing are counted. |
| **Reported / observed count** (上报数量 / 上报仔猪数量) | Litter · the head count the worker physically counts · the moment of counting · one crate | PRD 1135:7641, 971:15991, 971:16140. | "少上报" means reported < system. "多上报" means reported > system. Production: **the reported count prevails** and the system auto-adds or auto-removes heads. SYN §3.1 and §4: the assertion commits, but piglets are **never removed anonymously**, and the delta becomes real events or an unexplained anomaly. ⚠ These conflict on how the delta is resolved (see E05 and E06). |
| **Unexplained count delta** (数量异常) | Litter · the difference left after a reported count that no death or foster explains · stamped when set · this litter | SYN §7.4: it commits and is tallied as a compliance anomaly (console, not barn). RUL: after the lock, a vanished piglet goes through "count drawer → just set count → unexplained anomaly", never a fabricated death. | Production's 数量异常 entry (1567:20878) and 补录仔猪 (1159:6421) are two ways into the same reconciliation. |
| **Fostered in / out** (寄养 转入 / 转出) | Piglets moved between two live litters · the moved n (count or IDs) · the moment of the move · **both** litters | PM §4 "Foster out / in": counterpart sow, count or IDs, optional identities. count.md: foster-out receiver is mandatory (production 2437:4884). | ⚠ RUL "After the lock": **fostering is PARKED**. v1 farrowing ships no foster doors. The PRD's 更多操作 (1567:20878) offers 寄养仔猪 from piglet processing. Whether fostering exists in this task's v1 is open. |
| **Dead piglet** (死亡 / 上报死亡) | One piglet or a group · piglets that died after being counted alive · recorded when found · this litter | RUL: one dead drawer product-wide. SYN §6 C1: while farrowing is open, death is marked in the farrowing task; after it closes, in check-in. Both write the same ledger event. PRD 1567:20878 also offers 上报死亡 from processing. | SYN §3.2: a **tagged piglet is never subtracted namelessly**. RUL: there is no WHEN; the stamp is the date. |
| **Piglet age-day** (日龄) | Litter · days since the sow's farrow date · derived daily · this litter | PRD §2 "Derived". | ⚠ Fostered-in piglets may be days older or younger than the receiver's litter (ladder.md; SYN §7.7: "fosters ride the crate schedule"). The litter's age-day is the sow's. |
| **Treatment mark** (处理项 — 滴鼻 · 剪牙 · 补铁 · 阉割 · 断尾 · 断脐带 · 保健) | Litter × age-day × treatment · the whole litter · recorded when done · this task | PRD §2: bool + recorded-by + timestamp. "The mark is the record." The schedule is console configuration (task-detail tab 634:17024). | ⚠ PRD says "eight treatment types" while its field list has seven bulk treatments plus 耳标/耳缺/体重. ⚠ Per-piglet exceptions within a treatment ("iron · 7 of 12", ladder.md) have no source in production. |
| **Planned day / on-time** (计划处理日 / 准时率) | Mark · marks dated on or before their planned day · per task · unit/task | PRD §2 derived. The KPI target (≥90%) is config. | Early marks (可提前填) count as done. That an early mark counts as on time follows from "on/before". |
| **Ear tag** (耳标 / 耳标号) | Piglet · one identified piglet · assigned on the tag/notch/weigh day · farm (uniqueness scope ⚠) | PRD 1000:5357 and 635:3533. It can be scanned or typed. SYN §7.1: the system never owns tag ranges, and duplicates **warn and never block**. | ⚠ identity.md earlier said refuse duplicates; SYN §7.1 superseded that. Whether uniqueness is litter-, farm- or lifetime-wide is open (identity.md OQ4). RFID and visual tags are both supported (SYN §6 A1). |
| **Ear notch** (耳缺 / 耳缺号) | Piglet · same as the ear tag · same day or earlier · farm | PRD: "Tag *or* notch may identify". SYN §7.2: notch-first, notch-never and notch-only are all supported. On notch-only farms the notch **is** the identity, and lookup by notch must exist wherever lookup by tag does. | ⚠ PM §6 "Assign identity": **ear tag\* and sex\* are required** and notch is optional. That contradicts notch-only identity. |
| **Identity row** (有身份仔猪) | Piglet · **any subset** of the litter (9 of 20) · weigh day, later catch-up allowed (补录) · this litter | PRD 635:3533 and 971:15924. Row = tag · notch · sex · weight. | ⚠ Whether sex is required per row (PM: yes; PRD: shown as a column, requirement unstated). |
| **Unidentified piglets** (未补充身份) | Litter · system count − identity rows · live · this litter | PRD 971:15924 (`3 头仔猪未补充身份，请及时补录`). | Derived. Its value depends on which system count is used (fostered-in included). |
| **Litter total weight** (仔猪总体重) | Litter · the whole litter weighed together · the weigh age-day · this litter | PRD 1000:5357. "Distinct from summed per-piglet weights." An amber warning shows while it is empty. | ⚠ Which age-day it belongs to: the piglet list footer reads `仔猪总体重（3日龄）` (971:15924), but the PRD's sample config puts tag/notch/weigh on d5. Probably config-driven, but not stated. SYN §6 A1: enrichment is **optional by philosophy**. |
| **Birth whole-litter weight** (出生整窝体重) | Litter · the whole litter at birth · captured at farrowing, backfilled here if missing · this farrowing | PRD 963:14753 and 1630:7820 (amber: growth-efficiency calculations suffer). RUL: litter weight is an optional fact at Finish farrowing, and editable after the lock via Edit's `At finish`. | ⚠ One datum has two doors, farrowing Finish/Edit and processing's backfill. It is not said whether a processing backfill is a first recording or a correction to the farrowing record. |
| **Sex counts** (公猪数量 / 母猪数量) | Litter · boars and gilts in the litter · weigh day · this litter | PRD 1000:5357 (steppers). | ⚠ They are redundant with per-row sex when every piglet has a row. Sources don't say which wins if the two disagree. |
| **Processed pen / completion class** (已处理栏 · 全部完成/部分完成/未完成) | Pen/litter · pens in the task · derived · task | PRD §2 derived. Ended list 5913:9932. | "Pen" and "litter" are used as if interchangeable (`100/200 栏`). ⚠ It is not stated how a pen holding more than one sow is counted. |

---

## 2 · Evaluation cases

**Categories.** O = ordinary path · X = exception · B = cross-task boundary.
**Probes.** T = transitions/retry · H = handoff outcomes (accepted / cancelled / partial / return
failed) · C = copy · N = count semantics.
**Tag.** `sourced` means a cited source states the required behaviour. `inferred` means the case
was reasoned out; the case says why it seems real. `sourced*` means sourced, but the sources
conflict. A design passes such a case by satisfying the undisputed part and not silently taking a
side on the disputed part. It must either surface the choice or follow whatever the product owner
has ruled by the time the run is judged.

### E01 · Mark today's due treatments on one litter — O
- **Start:** A litter at its day-3 planned date. Day-1 marks are done. The day-3 set per config (e.g. 剪牙 · 断尾 · 补铁 · 阉割) is due.
- **Worker:** Does the day-3 treatments on this litter and records each one as done.
- **Required outcome:** One mark per litter × age-day × treatment, each stamped with who and when. The litter's remaining set becomes empty for day 3, and its status moves to "next due in n days" or "all done". Unit and task progress re-derive from the marks, and nothing is asserted separately. Earlier marks and their stamps are untouched.
- **Source:** PRD §1 993:13532 (per-item recorded-by + timestamp), §2 "Treatment done" and "Derived". PM §2 (task progress derived from events). INV 993:13532 / 8003:11569.
- **Tag:** sourced · **Probes:** T, N

### E02 · Record one day's treatments across several litters at once, some already done — O
- **Start:** Five litters on day 3. Two already have 剪牙 marked by another worker this morning.
- **Worker:** Records the day-3 treatments for all five in one go.
- **Required outcome:** The three unmarked litters gain marks. The two already-marked litters keep their **original** mark and stamp, with no duplicate mark and no overwritten attribution. The worker can tell afterwards which litters took the new marks and which were already done (partial application is visible, never silent).
- **Source:** PRD §2 (litter-level treatments are bulk, per-piglet data is never bulk). SYN §7.9 (the same litter · treatment · day marked twice is deduplicated). PM Law 3 (partial eligibility must be visible).
- **Tag:** sourced · **Probes:** H (partial), N

### E03 · Identity and weigh day for a litter — O
- **Start:** A litter of 20 on its tag/notch/weigh day. No identity rows yet (963:14499).
- **Worker:** Weighs the litter as a whole, tags and weighs 9 piglets (tag, sex, weight), and records the litter's boar and gilt counts.
- **Required outcome:** 9 identity rows with who and when. Litter total weight is stored against this age-day, separate from the sum of the 9 weights. Unidentified = 11. None of the enrichment fields (weight, sex counts) blocks saving the rows (SYN §6 A1). The identity data can be viewed afterwards (see E13).
- **Source:** PRD 1000:5357, 635:3533, 971:15924. PRD §2 field table. SYN §6 A1.
- **Tag:** sourced · **Probes:** N, C

### E04 · Head count matches the system (数量无误) — O
- **Start:** System count 20, including 3 fostered in.
- **Worker:** Counts the crate, gets 20, and confirms.
- **Required outcome:** The system count is unchanged and no anomaly is created. ⚠ Whether a matching count leaves a stamped "counted 20 · who · when" trace is not stated (Q3). The design must not invent a mandatory confirmation step for a matching count.
- **Source:** PRD 1135:7641 · INV 仔猪数量确认-数量无误 (1135:7641 / 8003:12272).
- **Tag:** sourced (outcome); the trace is open · **Probes:** N, C

### E05 · Under-count: fewer piglets than the system says (少上报猪) — X
- **Start:** System count 20. Four piglets carry identity rows. The worker counts 18.
- **Worker:** Records that there are 18.
- **Required outcome:** The observed 18 is accepted as the litter's count; an assertion is never refused. The 2-head delta must end up as **either** recorded death or foster events (explaining it) **or** an unexplained anomaly tallied for compliance. It is never a silent anonymous removal. If the delta is attributed to identified piglets, the worker names which ones. The death path must be no more expensive than leaving it unexplained. Who and when are stamped. ⚠ Production requires a free-text reason plus a confirmation checkbox before submit. SYN law 1 says reasons are doors, never gates. The design must not make a mandatory prose reason the only way through, unless the owner rules for it (Q1).
- **Source:** PRD 971:15991 (`将自动移除 2 头仔猪`, reported count prevails, 数量不符原因, 确认无误 checkbox), PRD §6 OQ3. SYN §3.1, §3.2, §4, §7.4. count.md "Why under ≠ over".
- **Tag:** sourced* (production vs SYN conflict) · **Probes:** N, C, H (cancelled: backing out leaves the count at 20)

### E06 · Over-count: more piglets than the system says (多上报猪 / 补录仔猪) — X
- **Start:** System count 20. Farrowing for this sow is locked. The worker counts 22. The second way in is the 数量异常 → 补录仔猪 route, raised mid-task rather than at a count check.
- **Worker:** Records that there are 22.
- **Required outcome:** The count becomes 22, stamped. The increase is not recorded as anything death-related. It is either attributed (a missed birth, which RUL routes to farrowing's "More born" and so changes Born; or an unlogged foster-in) or left as an unexplained increase. The system count changes only on an explicit worker assertion, never on its own. Whichever way in is used, the result is the same.
- **Source:** PRD 971:16140 (auto-add), 1159:6421 (`确认更新系统记录数量`). RUL "After the lock" (an extra live piglet found later → "More born" inside Edit). count.md (over-report is never a death).
- **Tag:** sourced* (which attribution applies is Q2) · **Probes:** N, H (accepted/cancelled), C

### E07 · Piglet found dead during processing — X
- **Start:** Litter of 12 on day 3, with day-3 treatments partly marked. One untagged piglet is found crushed. In a variant, the dead piglet is one of the tagged piglets (tag 001246).
- **Worker:** Records the death and carries on with the litter.
- **Required outcome:** One death event on the litter's ledger (the same kind of event farrowing and check-in write). The system count drops to 11, and unidentified re-derives. Marks already recorded today stand. In the variant, the death is recorded against **that** piglet's identity: its identity row ends as dead, and the untagged remainder is untouched. No second, task-local death record exists.
- **Source:** PRD 1567:20878 (上报死亡). RUL (one dead drawer product-wide). SYN §3.2, §6 C1. PM Law 4 (one record, two doors).
- **Tag:** sourced · **Probes:** N, H

### E08 · Interrupted identity entry, resumed later or by another hand — X
- **Start:** Litter of 20. The worker has entered 5 identity rows when a call pulls them away (the app is backgrounded or closed). An hour later, a second worker resumes.
- **Worker:** The first worker leaves mid-entry. The second worker finishes the litter.
- **Required outcome:** The 5 rows exist with the first worker's stamp, and nothing entered is lost. The second worker sees 5 done and 15 unidentified, and adds rows under their own stamp. A partly done litter reads as partial, not as untouched and not as complete. ⚠ Production collects rows in one form with a single submit (`提交（9 头仔猪）`, 635:3533), so an interruption before submit loses them. RUL's exit grammar (commit per tap, nothing lost to an interruption) is farrowing-scoped. SYN §4 names the per-commit conveyor the replacement. The yardstick holds to "nothing entered is lost".
- **Source:** PRD 635:3533, 971:15924. RUL "exit grammar". SYN §2 (tag row), §4.
- **Tag:** sourced* (production batch submit vs later law) · **Probes:** T, H (partial)

### E09 · Tag number already in use — X
- **Start:** While tagging litter A, the worker enters or scans a tag number that is already on another piglet's identity row (a re-caught piglet in the same litter, or a piglet in another litter).
- **Worker:** Tries to record the piglet with that tag.
- **Required outcome:** The worker is told, at that moment, that the number already exists and where. The entry is not silently accepted as a second identity, and not silently merged. Per SYN §7.1 the warning **does not block**. What the record holds if the worker proceeds (two rows sharing a tag, or the first row corrected) is open (Q6). For a re-caught piglet in the same litter, the worker must be able to end with one row, not two.
- **Source:** SYN §7.1 (duplicates warn amber, never block). identity.md (duplicate as an error shape; OQ4 on scope).
- **Tag:** sourced (warn, don't block); inferred (re-catch leads to one row: re-catching is the error shape identity.md names) · **Probes:** C, N, T

### E10 · Tag missing, unreadable, or not used — X
- **Start:** The tag won't scan (damaged RFID or smudged print), or the farm is notch-only.
- **Worker:** Identifies the piglet by notch and records its weight and sex. In a variant, the worker records weight without any identity.
- **Required outcome:** Typing the tag number is equal to scanning. A notch-only row is a valid identity row, and the piglet can later be found by notch. ⚠ PM §6 requires an ear tag for Assign identity (Q5). The outcome for a weight without identity is open: either rejected as a row, or folded into the litter total only.
- **Source:** PRD 1000:5357 (scan / notch picker / manual peers), §2 ("Tag *or* notch may identify"). SYN §6 A1, §7.2. PM §6.
- **Tag:** sourced* · **Probes:** N, C

### E11 · No processing task for this pen (仔猪处理（无任务）) — X
- **Start:** The worker reaches a pen whose litter has no processing task (A4 in the pig list; for example the litter is outside the task's cohort).
- **Worker:** Looks for work on this litter. In a variant, the worker finds a dead piglet there.
- **Required outcome:** No treatment marks can be recorded against a task that doesn't exist, and the pen still counts toward physical completeness rather than vanishing. In the variant, the death can still be recorded, because litter events belong to the litter, not the task (inferred from PM Law 4 and Law 3: availability follows the animal's state, not the surface).
- **Source:** PRD 634:16707 (pens with no task still listed), 2495:5505. INV 仔猪处理（无任务） (2495:5505 / 8003:11744). PM Laws 3 and 4.
- **Tag:** sourced (no-task state); inferred (the variant) · **Probes:** H (return failed: nothing to mark), C

### E12 · Off-schedule timing: late and early marks — X
- **Start:** (a) The day-3 treatments were not done on day 3, and it is now day 4. (b) On day 3 the worker has hands on a litter whose day-5 treatments are pre-fillable.
- **Worker:** (a) Does and records the late day-3 treatments. (b) Records the day-5 treatments early.
- **Required outcome:** (a) The mark carries its real date, still counts as done for day 3, and counts as late in 准时率. It stayed due, never silently expired, until done or until the task ended. (b) The mark carries its real date and satisfies day 5 in advance, and counts as on time. The day-5 remaining set becomes empty.
- **Source:** PRD 993:13532 (`可提前填`), §2 on-time derivation. SYN §3.5 ("late is not gone"), §7.8 ("overdue stays overdue").
- **Tag:** sourced · **Probes:** T, N

### E13 · Correction after entry — X
- **Start:** Earlier today the worker recorded piglet 001246 as 1.4 kg ♂. It is actually 1.9 kg ♀. Separately, 补铁 was marked on the wrong litter.
- **Worker:** Fixes the identity row. Un-records the mis-placed mark and records it on the right litter.
- **Required outcome:** The corrected values stand. The originals are retained, and the correction is stamped with who and when and shows as a correction. Anyone may correct (provenance over permission). The identity data stays viewable after entry and after the task ends. ⚠ Production labels the sub-form `提交后不可再查看` (cannot be viewed after submit), yet shows the data read-only after the task ends (5791:5843). Whether this is a compliance lock is open (Q7). No source says whether a treatment mark can be un-recorded (Q7).
- **Source:** PRD 993:13532, §6 OQ1. SYN §4 sins register. CEP laws 1–3. RUL (anyone may amend, stamped; amber correction mark).
- **Tag:** sourced* · **Probes:** T, C, N

### E14 · End the task with unfinished pens — X
- **Start:** The task is at 100 of 200 pens processed. Farrowing for the batch has ended. The task is configured non-mandatory.
- **Worker:** Ends the task knowing work is outstanding. In a variant, the worker starts to end it and backs out.
- **Required outcome:** Before ending, the worker is shown the consequences in derived numbers: unfinished pens and heads, and the fact that **unfinished work cannot be backfilled afterwards**. Ending needs an explicit acknowledgement, and the acknowledgement is recorded with the actor. After ending: the marks are frozen, not-done items stay visible as not done, the identity table stays viewable, and no new marks can be recorded for this task. In the back-out variant, nothing changes.
- **Source:** PRD 928:5219 (`没有完成的处理后期将无法补充`), 4763:4382 / 4323 (我已知晓 acknowledgement), 971:15884 (non-mandatory, can end without completing), 5788:6097 / 5791:5779 / 5791:5843 (ended, read-only, ! on gaps). PRD §2 "End task acknowledgement".
- **Tag:** sourced · **Probes:** H (accepted / cancelled), C, T

### E15 · End blocked while the batch's farrowing is still open — B
- **Start:** Farrowing for the batch has not ended. A worker tries to end piglet processing.
- **Worker:** Tries to end the task.
- **Required outcome:** The end does not happen. The task stays open with everything intact, and the worker is told why: the batch's farrowing must end first. ⚠ SYN §6 records the owner's stance against hard blocks that push workers toward fake entries (applied to closing farrowing). Whether this dependency stays a hard block is Q9.
- **Source:** PRD 4763:4311, 928:5219 (cannot-end variant), §2 Configuration ("Dependency"). INV 结束任务 ×3.
- **Tag:** sourced · **Probes:** H (return failed), C

### E16 · Fostering in and out during the processing window — B
- **Start:** Sow A's litter (12, day 3, day-3 marks done) receives 3 unidentified piglets from sow B, whose litter is 2 days older and has 4 identity rows.
- **Worker:** Moves 3 piglets from B to A, then later tags A's piglets.
- **Required outcome:** One foster event changes **both** litters' counts (A 15 including 3 fostered, B −3). Nobody has to sync either task's progress by hand. The receiving sow is named. The fostered-in piglets follow A's schedule. Rows added on A after the foster carry the source's warning that fostered piglets without identity may make identity inaccurate. ⚠ Not stated: whether treatments the fostered piglets already had (or missed) on B carry over, and whether fostering is available in v1 at all, since RUL parks it (Q10).
- **Source:** PRD 1567:20878 (寄养仔猪), 1000:5357 (foster warning), 1630:7820 (`含 3 头寄养`). PM §2 (the "manually sync both pens" problem disappears), §4 Foster. SYN §7.7. count.md (receiver mandatory). RUL (fostering PARKED).
- **Tag:** sourced* · **Probes:** N, H

### E17 · A dead piglet recorded while farrowing and processing overlap — B
- **Start:** The sow farrowed unattended. Day-1 processing (断脐带 · 滴鼻) is due, but her farrowing is still open (not Finished) because the batch's farrowing task is open. A piglet is found dead.
- **Worker:** Records the death, from whichever task they are working in.
- **Required outcome:** Exactly one death event on the litter's ledger, visible to both farrowing and processing. Neither task holds a private copy, and the count isn't double-decremented. While farrowing is open, the death obeys farrowing's rules (it counts into Dead, and Born derives). After farrowing's lock, the same event moves the live count and never Born.
- **Source:** SYN §6 C1 (both write the same ledger event). RUL (one dead drawer product-wide; the Born formula). PM Law 4. The overlap itself follows from PRD 4763:4311 (processing can't end before farrowing, so they coexist).
- **Tag:** sourced (one event); inferred (the overlap scenario is real: the end-order dependency implies both tasks are open at once) · **Probes:** N, H

### E18 · Backfill the birth litter weight from processing — B
- **Start:** Farrowing is locked with no litter weight recorded. Processing shows 出生整窝体重 as missing.
- **Worker:** Enters the birth litter weight from processing. In a variant, farrowing already had 12.6 kg, and the worker enters 13.0 here.
- **Required outcome:** One birth-litter-weight fact exists, and farrowing's record and processing both show the same value with who and when. It is not confused with the litter total weight on the weigh day. In the variant, 12.6 is not silently overwritten: the change is a stamped correction with the original kept (CEP law 2). The missing prompt disappears once a value exists.
- **Source:** PRD 963:14753, 1630:7820, §2 ("Backfill of a farrowing-time datum"). RUL (litter weight at Finish; editable after the lock via Edit, amber corrected). CEP law 2.
- **Tag:** sourced (one fact, missing prompt); the variant is inferred (two doors onto one datum make the collision possible) · **Probes:** N, C

### E19 · Handoff to weaning with residual work — B
- **Start:** The litter reaches weaning (断奶). It has 3 piglets still unidentified, 补铁 recorded for 10 of 12 (or not at all), and an unexplained −1 anomaly from day 3. The processing task may be open or ended.
- **Worker:** Weans the litter.
- **Required outcome:** Weaning starts from the ledger's current count (deaths, fosters and the asserted count applied), existing identity rows, and litter weights, with no re-entry. The weaning transfer carries the **counted** number, and reconciliation never blocks the transfer. Unidentified piglets stay unidentified, and nothing invents identities. ⚠ Whether residual treatments survive into weaning or end with the task is open (Q8 and Q16).
- **Source:** SYN §1 spine (the transfer count is the last ledger line), §7.4. count.md "Day-3 vs weaning" (the weaning transfer carries the counted number; reconciliation never blocks). ladder.md OQ3.
- **Tag:** sourced (count and no re-entry); open (residuals) · **Probes:** H (partial), N

### E20 · Identity captured here is needed later for breeding stock — B
- **Start:** Months later, a gilt from this litter is to be marked 留种 (kept for breeding). She has an identity row from processing (tag, sex). A sibling has none.
- **Worker:** Marks both as 留种.
- **Required outcome:** The identified gilt qualifies using the identity recorded here, with no re-entry of tag or sex, and the link to her litter and dam is preserved. The unidentified sibling is shown as blocked with the reason, and can be given an identity on the spot; it is not silently dropped from the selection.
- **Source:** PM §6 (留种 requires identity plus sex; blocked rows offer Assign identity inline; parents derived when known). PM Law 3 (partial eligibility visible).
- **Tag:** sourced · **Probes:** H (partial), N

### Case count

| Category | Cases | n |
|---|---|---|
| Ordinary | E01–E04 | 4 |
| Exception | E05–E14 | 10 |
| Boundary | E15–E20 | 6 |

Tags: **14 sourced** (E01–E04, E07, E09, E11, E12, E14, E15, E17–E20) · **6 sourced\*** where the sources conflict (E05, E06, E08, E10, E13, E16) · **0 wholly inferred**. Inferred sub-parts sit inside four sourced cases, and each says why it is real: E09 (a re-catch ends with one row), E11 (a death on a no-task pen), E17 (the overlap scenario) and E18 (two conflicting weights).

---

## 3 · Probe coverage

| Probe | Cases |
|---|---|
| T transitions/retry | E01, E08, E09, E12, E13, E14 |
| H handoff outcomes | accepted E06, E14 · cancelled E05, E06, E14 · partial E02, E08, E19, E20 · return failed E11, E15 |
| C copy | E03, E04, E05, E06, E09, E10, E11, E13, E14, E15, E18 |
| N count semantics | E01–E07, E09, E10, E12, E13, E16–E20 |

---

## 4 · Open questions for the product owner

These cover behaviour only. Each lists the options the sources present.

1. **Under-count resolution.** When the worker counts fewer than the system: (a) production: auto-remove, mandatory reason text and a confirm checkbox; (b) SYN: the count commits and the delta goes to death / foster / "just set count" (unexplained anomaly) with no forced reason; (c) something else?
2. **Over-count after farrowing is locked.** Is +N (a) a "More born" correction to farrowing's Born, (b) an unexplained increase on the litter only, (c) a foster-in needing a source sow, or (d) the worker's choice among these?
3. **Matching count.** Does a count that matches leave a stamped "counted · who · when" trace, or no trace?
4. **When is the count asked?** (a) at every day's submit (production), (b) only when the worker raises it (数量异常 / 补录), (c) on the weigh day?
5. **Minimum identity.** Is a notch-only row a full identity (PRD, SYN §7.2), or are ear tag and sex required (PM §6)? Is sex required on every piglet row?
6. **Duplicate tags.** Is uniqueness per litter, per farm, or for life (can a dead pig's number be reused)? If the worker proceeds past the warning, do both rows keep the tag?
7. **Corrections.** Is `提交后不可再查看` a compliance lock (corrections need a permission) or a form artefact (anyone corrects, stamped)? Can a treatment mark be un-recorded, and if so, is that a stamped reversal?
8. **After End task.** Is it truly "cannot backfill", or can a late mark still be recorded and flagged? Do residual treatments carry into weaning or die with the task?
9. **Ending the task.** Keep the hard block while the batch's farrowing is open, or warn and allow? Is End task manual only, or does the task auto-close at its window end (SYN §2)?
10. **Fostering in v1.** Is fostering reachable from piglet processing despite RUL parking it? If yes: do fostered-in piglets keep treatments already received at the source, and pick up missed ones on the receiver's schedule? Is the receiving sow mandatory?
11. **`含 3 头寄养`.** Does the litter count include fostered-in piglets, and is "3" fostered-in only or net?
12. **Birth litter weight.** Is a processing backfill a first recording of farrowing's field, or a post-lock correction (stamped, amber)? If both doors wrote values, which stands?
13. **Weigh-day enrichment.** Are litter total weight and boar/gilt counts optional (owner: "optional by philosophy") or expected? When every piglet has a row, are sex counts derived, and which wins if they disagree?
14. **Weigh day.** Which age-day holds tag/notch/weigh and 仔猪总体重: config-driven (d5 in the sample) or fixed (the footer reads 3日龄)?
15. **Non-mandatory task.** Do unfinished litters stay overdue until End task, or lapse quietly at weaning (PRD OQ2)?
16. **Postpartum overlap.** Postpartum check and processing hit the same pens on the same days: one combined walk, a link between the two, or independent (designer note 2519:9347)?
17. **Sow dies during the processing window.** Does her orphan litter keep its schedule and task membership unchanged (RUL: "7 alive stay under piglet care"), and who is the dam of record if the litter is fostered off?
18. **Per-piglet exceptions.** Can a treatment be recorded for only part of a litter (weak piglets, kept gilts, "iron · 7 of 12"), or is a mark always whole-litter (production)?

---

## 5 · What this set does not cover

- Visual design, layout, components, navigation, gestures, icons and colour. PRD §3–§5's proposed design is excluded on purpose.
- The task list's filters, grid versus list view, search and scan mechanics (except that a notch must be as findable as a tag, E10), and the status legend.
- Console configuration: authoring the treatment schedule, the KPI target, the mandatory flag and the SOP document. The cases assume a configured schedule.
- The on-time KPI's exact formula beyond "on or before the planned day", and reporting or console anomaly views.
- Offline sync and merge conflicts beyond same-mark deduplication (E02). RUL's merge contract is farrowing-scoped and draft.
- The death drawer's internals (causes, photos), the foster flow's internals, and weaning's own form. Only their outcomes at this task's boundary are covered.
- 母猪流产 in the more-actions sheet (1567:20878): an out-of-stage leftover with no behaviour to test here.
- Multi-sow pens, and two workers in one room claiming crates (SYN E1), beyond E02 and E08.
- The ended-task review list's segmentation (全部/部分/未完成) as a view. Its underlying facts are covered by E14.
