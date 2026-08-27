# The check-in row — what it shows, and why

**Question.** During a routine check-in walk of a unit, what should a row show?

**Answer, in one line.**

> **A task row says what is being asked of you. A check-in row says what is true.**
> Every *demand* — due dates, windows, readiness, intervals, overdue — is owned by a scheduled task
> and is noise on a walk. Every *state*, and above all a state that no task has scheduled a look at,
> is the check-in's payload.

That distinction is the whole design. It resolves the product owner's tension — *"enough information
where users can potentially see an anomaly but not so much as to bombard users with noise"* — by
giving it an objective test rather than an aesthetic one: **if a task drives it, it is noise; if
nothing drives it, it is the point.**

Two independent parts of the corpus already say this, and neither knew about the other:

- `tasks/pig-actions.html` §7, on turning production's `猪只列表` into the check-in:
  *"the task list component, minus the task"*; **"Health is the row's subject, not a decoration…
  it is line 1."**
- `components.html` §05, on why nothing is promoted in unit mode:
  *"Promotion in unit mode was cut because a walkthrough has no verb to promote: what you find is
  the point."*

A row with no verb to promote must not print the verb's prerequisites either.

---

## 0 · What the corpus already fixes

### 0.1 The binding grammar (`components.html` §01b) — nothing below may break it

| Law | Text |
|---|---|
| **Fact (line 1) — words** | *"The animal's cycle position as a readable phrase — space is free on line 1, so spend it on clarity… Past events read elapsed, scheduled read until."* |
| **Metadata (line 2) — tokens** | *"Space is scarce, so compress: mono, lowercase, `·` separated tokens… fixed order time → counts → codes. Open rows carry only relative times and counts — no clock stamps."* |
| **Stamps** | *"`Jul 8 · 07:14 · G.H · JY001` are record trails: they live on done rows, and on an open row's metadata line when its state descends from a prior record."* |
| **Chip law** | *"A chip is the reason this row needs you first — an escalated measurement (`LAST 45M`) or a flagged observation recorded by a hand (`SIGNS`). Below threshold, measurements stay grey tokens; the flag's trail (who · when) lives in the metadata line."* |
| **Rail** | *"Box tasks: empty — the bar acts. Rail tasks: verdict word + › — the tap acts. Done: ✎."* |
| **Template** | *"Two lines, every row, every task — one height, one rhythm across the product."* |
| **Slot discipline** | *"One chip per row at most; an escalated token leaves line 2, a flag's trail stays in line 2 — nothing is said twice. Where a slot is empty it stays empty; slots are never repurposed."* |
| **Chip priority** (§02b) | *"red › amber › green › neutral › done › grey. One chip per cell, most urgent wins; count leads the word (`3 SIGNS`), only from 2; durations always with a unit."* |
| **Peek mirrors the row** (§02c) | *"Anything you want in the peek, you put in the row; there is one place to manage."* |

Two more that constrain a check-in specifically:

- **§02b's exclusion list.** *"Deliberately absent from cells: ear tags, head counts, second chips,
  progress bars, coloured text, blue anything."*
- **§05's litter rule.** *"A litter is a selection, not a subject. Nothing edits a litter… the count
  is wrong → reconciliation on the pen."* So litter counts ride the **sow's** row and count
  mismatches ride the **pen's** row.

### 0.2 What production actually puts on a patrol row

`inspection/part-a.md` → `60:523`, row spec component `749:2125`. This is the complete field list:

```
[ID | "No ID Pigs"] · [× N head-count chip, un-ID only] · [health icon + symptom text, conditional]
   · [20₁ | 猪只类型 | 生产状态 | 日龄] · [checkbox]
```

populated as `000001 · 发烧 · 20₁ | 生产母猪 | 已发情 | 650日龄 · ☐`.

Four facts about that row matter enormously:

1. **Conditional health is production's own idea.** The magenta legend annotation reads
   `显示疾病症状，没有就不显示` — *"show disease symptoms; if there are none, don't show."*
   This is the noise rule, already written, in production's hand.
2. **The row never expands.** `part-a.md` → `907:3431` (the row-selection spec) renders every row
   type unchecked then checked. Cases 1 and 2 (has ID): *"identical row, ☑ green. **No extra UI.**"*
   The only in-row disclosure in the whole patrol shell is the un-identified head-count stepper
   `✕ [− 0 +] ✓`. **And no pig-detail screen exists anywhere in the ~150-screen 巡检 file.**
3. **Production deliberately withholds parity and days-in-status from the walking row.** Both exist
   — on *action-sheet* headers only (`part-c1.md`, "Shared anatomy of every action sheet"):
   `3 胎` and Card 2 `生产状态 → 空怀/后备 1 天` (*"status + days in status"*). Production knows
   them and chose not to walk with them.
4. **The meta string is canonical module-wide.** The identical `20₁ | 猪只类型 | 生产状态 | 日龄`
   is reused verbatim in the selected-pig roster (`part-d.md` `587:2774`) and the death list
   (`part-d.md` `290:1515`).

**And what production flags:** exactly two signals. Disease/symptom text on a pig row, and a **red
count badge on a wrench icon in the pen card header** = device faults (`part-a.md`,
`part-b.md` arrow `642:2705`). Nothing else. Specifically **not** flagged: triage level
(the palette exists but *"never touches a list row"*), treatment state, count mismatch, overdue
anything, or "already handled this walk". There is **no sort or priority ordering of pig rows
anywhere in the file.**

The one apparent third signal is disqualified by its own annotation. `需操作` ("needs action")
appears as a grid-card status and a filter chip, but `658:3113` reads
`⬅️ "需操作"代表：饲喂站需加料/减料` + `❌ 本期不做饲喂站功能` — *its only meaning is feed-station,
and feed stations are out of scope this phase.* **So production ships a patrol with no
attention-ranking affordance at all.** That is the gap this brief closes.

### 0.3 Production's status vocabulary — the set we may refine but not invent

`生产状态`, enumerated verbatim and repeatedly as a magenta precondition strip (`part-c1.md`
`420:1712`, `430:1063`…; `part-c2.md` `440:1089`, `440:1108`):

> `空怀/后备，已发情，已配种，已妊娠，成长期`

| 中文 | English | Check-in line-1 form (state + elapsed) |
|---|---|---|
| `空怀` | open / empty | `Open · 6 days` |
| `后备` | reserve / gilt (bucketed with 空怀 by production) | `Open · 235 days` (the clock is age) |
| `已发情` | in heat | `In heat · 10h` |
| `已配种` | mated | `Mated · 25 days ago` |
| `已妊娠` | pregnant | `Pregnant · day 87` |
| `哺乳` * | lactating | `Nursing · day 12` |
| `成长期` | growing period | `Growing · day 68` |

\* `哺乳` is absent from the five-token precondition strip but is a first-class node in the state
machine at `consolidation-plan.html` §4 (`哺乳 ──weaning──► 空怀`). Flagged in §6 below.

The elapsed suffix is production's own pattern, lifted from the sheet header
(`空怀/后备 1 天`, `已配种 1 天`) onto the row — the single most valuable transplant in this brief,
because **days-in-status is the only fact that makes a stall visible while walking past.**

Two adjacent vocabularies that are **not** pig status and must not be conflated:
`健康分诊等级` (4 levels, `part-d.md` `854:2369`) and equipment `正常 / 故障` (`part-b.md`).

---

## 1 · The candidate inventory

Every fact that could plausibly appear on a check-in row. **D** = derived, **R** = recorded.
Churn = how often the value changes for a given animal.

### 1.1 Identity and address

| # | Fact | Source | Tells the farmer | Churn | D/R |
|---|---|---|---|---|---|
| 1 | Ear tag `000254` | `part-a.md` `749:2125` | which animal | never | R |
| 2 | Head-count chip `× 42` | `part-a.md` `749:2125` (un-ID rows only) | this row is N head, not one | on death/move | D |
| 3 | Ear notch | `product-model.html` §6; flagged by 4 task docs | second identity key when no tag | never | R |
| 4 | `猪只类型` — 生产母猪 / 商品猪 / 仔猪 | `part-a.md`; `part-c2.md` `620:3516` | herd role | never | R |
| 5 | Batch `20₁` (subscript = production line) | `part-a.md` `749:2125` + annotation `说明:20是批次号，1是生产线` | **whether any task is watching her** | per cycle | D |
| 6 | Batch membership `属于/不属于批次` | `part-c1.md` `420:1712` etc. | same, as a boolean | per cycle | D |
| 7 | Pen | pen header, `components.html` §02 | where she is | on transfer | R |
| 8 | 留种 mark | `product-model.html` §4 | selected for breeding | once | R |
| 9 | Has identity / no tag | `product-model.html` §6 | can she be acted on individually | once | D |

### 1.2 Cycle and production status

| # | Fact | Source | Tells the farmer | Churn | D/R |
|---|---|---|---|---|---|
| 10 | `生产状态` | `part-c1.md` `420:1712` | where she is in her life | 5–8×/year | D |
| 11 | **Days in status** | `part-c1.md` Card 2, `空怀/后备 1 天` | **is she stuck** | daily | D |
| 12 | `日龄` day-age | `part-a.md` `749:2125` | growth clock (gilts, growers) | daily | D |
| 13 | Parity `3 胎` | `part-c1.md` sheet header; `components.html` §04 shell | how much this sow is worth arguing about | 2×/year | D |
| 14 | Days since mating | `tasks/pregnancy-check.html` (`Mated · 28 days ago`) | pregnancy-check due | daily | D |
| 15 | Gestation day | derived from mating + offset (`tasks/farrowing.html`) | farrowing due | daily | D |
| 16 | Days since farrowing / lactation day | `tasks/postpartum.html` (`Farrowed · 2 days ago`) | postpartum + weaning due | daily | D |
| 17 | Live litter count | `product-model.html` §4 (farrowing ± deaths ± fostering) | is the litter holding | on event | D |
| 18 | Piglets born | farrowing record | baseline for #17 | once | R |
| 19 | Litter day-age | `tasks/piglet-processing.html` (`day 3`) | which treatments are due | daily | D |
| 20 | Semen batch `JY001` | `tasks/breeding.html` | traceability | once/cycle | R |
| 21 | Mating count `2 matings` | `tasks/return-heat.html` | how well served | once/cycle | D |
| 22 | Days since weaning `weaned 4d` | `tasks/heat-check.html` | heat expected | daily | D |
| 23 | Mating interval `last 5h` | `tasks/breeding.html` | dose timing | hourly | D |
| 24 | Birth interval `last 12m` | `tasks/farrowing.html` | farrowing stalling | minutely | D |
| 25 | Hours since heat `in heat 6h` | `tasks/breeding.html` | mating window | hourly | D |

### 1.3 Health

| # | Fact | Source | Tells the farmer | Churn | D/R |
|---|---|---|---|---|---|
| 26 | Open diseases | `part-a.md` `749:2125`; `part-d.md` `272:3354` | what she has | on event | R |
| 27 | Open symptoms | `part-d.md` `272:3480` | what she shows | on event | R |
| 28 | **Days a condition has been open** | derivable from add-condition timestamp | **is it resolving** | daily | D |
| 29 | Triage level | `part-d.md` `854:2369` — `紧急治疗 · 优先干预 · 常规观察 · 健康` | how urgent, per a hand | on event | R |
| 30 | Under treatment (count / bool) | `part-d.md` `286:1027` | someone is on it | on event | D |
| 31 | **Days since treatment started** | derivable — but **no timestamp field exists on the form** | **is the drug working** | daily | D |
| 32 | Treatment drug / dose / method | `part-d.md` `286:1027` (7 fields) | what she is on | on event | R |
| 33 | Treatment response | **does not exist** | — | — | — |
| 34 | Withdrawal period remaining | **does not exist** | — | — | — |
| 35 | Health recheck window | **does not exist** (proposed, `consolidation-plan.html` §7) | — | — | — |
| 36 | Postpartum graded facts — 乳房炎 · 乳汁产能 · 分泌物 · 采食情况 · 活动能力 · 背膘 · 体况 · 淘汰建议 | `tasks/postpartum.html`; `part-c2.md` `439:2028` | condition of a fresh sow | once | R |

### 1.4 Measurements

| # | Fact | Source | Tells the farmer | Churn | D/R |
|---|---|---|---|---|---|
| 37 | Weight kg | `part-e.md` (Conveyor) | growth | weeks–months | R |
| 38 | Backfat (薄/适中/厚 or mm) | `part-e.md` | condition | months | R |
| 39 | Temperature °C | `part-e.md` (`体温（只可单只记录）`) | acute illness | rarely | R |
| 40 | BCS 1–5 | `tasks/postpartum.html` | condition | 2×/year | R |

### 1.5 Place, count, population

| # | Fact | Source | Tells the farmer | Churn | D/R |
|---|---|---|---|---|---|
| 41 | Transfer-in date | `part-e.md` `296:1133`; `components.html` §05 pig page (`since jun 12`) | how long she has been here | on move | R |
| 42 | **Recorded vs observed head count** | `part-a.md` Step 2 balance equation | **is the pen right** | on event | D |
| 43 | Reported missing | `part-a.md` `509:1702`; `part-e.md` `300:1048` | she is gone | rare | R |
| 44 | Fostering delta | `part-e.md` `473:4569` | litter changed hands | rare | R |
| 45 | Un-identified head requiring batch allocation | `part-a.md` Step 2 (`↓ 10 头需补充批次信息`) | untracked animals | on event | D |
| 46 | Piglets lost since birth | derived (#18 − #17) | litter attrition | on event | D |

### 1.6 Environment and equipment (not pigs)

| # | Fact | Source | Tells the farmer | Churn | D/R |
|---|---|---|---|---|---|
| 47 | Device fault count per pen | `part-b.md`; wrench + red badge on pen header | broken kit here | on event | D |
| 48 | Device fault detail (`故障` / `故障 (3)`) | `part-b.md` `225:4803`, `1392:2929` | which device | on event | R |
| 49 | Feed-station state `正常态 / 需操作` | `part-a.md` — **`❌ 本期不开发`** | — | — | — |
| 50 | Unit environment readings (temp, humidity, NH₃, CO₂…) | `part-a.md` `1563:2560` — unit-level, at submit only | unit conditions | daily | R |
| 51 | Unit note + last editor | `part-a.md` `99:627` `单元备注与设备状态` | standing instruction | rarely | R |

### 1.7 Task-derived (listed to be excluded)

| # | Fact | Source | Owner |
|---|---|---|---|
| 52 | `Due · today / in N days / No data` | `screens.html` §01 | heat check |
| 53 | `SIGNS` chip | `components.html` §01b | heat check / return-heat |
| 54 | `In window · day 21` | `screens.html` §01 | return-heat |
| 55 | `Recheck · due today` | `screens.html` §01 | pregnancy check |
| 56 | `READY / WAIT` + `LAST 26H` | `tasks/breeding.html` | breeding |
| 57 | `ACTIVE / DUE / LATE` + `LAST 45M` | `tasks/farrowing.html` | farrowing |
| 58 | `CHECK / IN 3D` | `tasks/postpartum.html` | postpartum |
| 59 | remaining treatments `teeth · tail · castrate` | `tasks/piglet-processing.html` | piglet processing |
| 60 | Last checked / who (unit) | `components.html` §05 — **the header, never a row** | the check-in itself |

---

## 2 · The ownership table — the core deliverable

For each candidate: is it already owned and driven by a scheduled task (so the farmer meets it
there), or is it **orphaned**?

### 2.1 What each task owns — the eight cohorts

Reading the seven PRDs plus `components.html` §01b's eight-task matrix. **Every cohort is a
sow-cycle cohort or a litter cohort. There is no task whose cohort is "pigs".**

| Task | Cohort trigger (quoted) | Owns on its row |
|---|---|---|
| Heat check | all sows + gilts in the unit; expected date *"computed from last heat or weaning"*; window 7 d, 2 checks/day | expected-heat date, **days since weaning**, heat signs + recency + recorder |
| Breeding | in-heat sows; *"last event timestamp + configured interval + configured count"*; 2 matings, 24 h interval | which mating is next, **hours since heat**, interval to next, over-interval escalation, semen batch |
| Pregnancy check | mated sows; `第1次孕检 配种后第10天 · 第2次孕检 配种后第20天`; 3-day sweep | **days since mating**, check round, unclear trail + recheck date |
| Return-heat | mated sows; `开始时间 = 发情后第18天`, `任务时长 7天` ⇒ **d18–24 window** | day number in window, **mating count + semen batch**, return signs |
| Farrowing | pregnant sows; *"due date = mating + gestation-offset"* | live piglet count, **elapsed farrowing + birth interval**, **parity**, `Late · 1d` |
| Postpartum | farrowed sows; `产后母猪检查开始时间 = 分娩后第 1 天`, 3-day window | days since farrowing, **the nine graded facts** (§1.3 #36), recheck + flagged item |
| Weaning | litters at the day-21 window (`components.html` §01b; **no PRD exists — see §6**) | litter count at weaning, weights, kept-for-breeding, sow assessment |
| Piglet processing | litters on an age-day schedule `d1 cord,drops · d3 teeth,tail,iron,castrate · d5 tag/notch/weigh · d7 health` | litter day-age, remaining treatments, per-piglet tag/notch/weigh |

### 2.2 The verdict, candidate by candidate

| # | Candidate | Verdict | Owner / reason |
|---|---|---|---|
| 1 | Ear tag | **row key** | not a fact — the address |
| 2 | Head-count chip | **ORPHANED** | no task lists un-identified groups; `product-model.html` §6 is new work |
| 3 | Ear notch | **ORPHANED (search only)** | four task docs flag it as *missing*; never on a row |
| 4 | 猪只类型 | **NOISE — context** | the unit already declares it |
| 5–6 | Batch / membership | **ORPHANED — and load-bearing** | see §2.3 |
| 7 | Pen | **NOISE — the header** | pen-grouped rows; `components.html` §01b |
| 8 | 留种 mark | OWNED | weaning (`留种仔猪 selection`) |
| 9 | Has identity | **ORPHANED after the d5 window** | piglet processing owns tag/weigh at day 5 only |
| 10 | 生产状态 | **ORPHANED** | every task shows its *own* question, never the animal's standing state |
| 11 | **Days in status** | **ORPHANED** | production computes it for sheet headers; no task uses it |
| 12 | 日龄 | **ORPHANED for growers**, noise for sows | no task covers a grower; parity beats age for a sow |
| 13 | Parity | OWNED | farrowing (line 2, every row), postpartum, weaning |
| 14 | Days since mating | OWNED | pregnancy check (`Mated · 28 days ago`), return-heat |
| 15 | Gestation day | OWNED | farrowing (`Due · today`, `Late · 1d`) |
| 16 | Days since farrowing | OWNED | postpartum (`Farrowed · 2 days ago`) |
| 17 | Live litter count | **PARTLY ORPHANED** | farrowing owns it *during* birth; weaning at d21; **days 1–20 are unwatched** |
| 18 | Piglets born | OWNED | farrowing → postpartum line 2 (`11 born`) |
| 19 | Litter day-age | OWNED | piglet processing, weaning |
| 20 | Semen batch | OWNED | breeding, return-heat |
| 21 | Mating count | OWNED | return-heat (`2 matings · JY001`) |
| 22 | Days since weaning | OWNED | heat check (`weaned 4d`) |
| 23 | Mating interval | OWNED | breeding (`last 2d · next 9h`, chip `LAST 26H`) |
| 24 | Birth interval | OWNED | farrowing (chip `LAST 45M`, mirrored per `1649:20693`) |
| 25 | Hours since heat | OWNED | breeding (`in heat 6h`) |
| 26–27 | Open diseases / symptoms | **ORPHANED** | `product-model.html` §4 marks add/resolve condition **巡检 only**. No task's cohort is "sick pigs" |
| 28 | **Days a condition has been open** | **ORPHANED** | derivable, computed nowhere |
| 29 | Triage level | **ORPHANED** | 巡检 only; *"never touches a list row"* even there |
| 30 | Under treatment | **ORPHANED** | 巡检 only |
| 31 | **Days since treatment** | **ORPHANED + BLOCKED** | *"No treatment history, no dosage validation, no date/time… no administered-at timestamp field appears on the form"* (`part-d.md`) |
| 32 | Drug / dose / method | **ORPHANED — but belongs in the record** | too specific for a walk |
| 33 | Treatment response | **UNMODELLED** | §6 |
| 34 | Withdrawal period | **UNMODELLED** | §6 |
| 35 | Health recheck | **UNMODELLED** | §6 |
| 36 | Postpartum graded facts | **OWNED for 3 days, ORPHANED for the rest of her life** | see §2.4 — the single most important row in this table |
| 37–39 | Weight / backfat / temperature | **ORPHANED but rightly buried** | *"the measurements are write-only from the patrol's point of view — they are captured and vanish"* (`part-e.md`). Stale on most rows most days |
| 40 | BCS | OWNED | postpartum, weaning |
| 41 | Transfer-in date | **ORPHANED** | belongs on the pig page (`components.html` §05: `Unit 4 · pen A2 since jun 12`) |
| 42 | **Count mismatch** | **ORPHANED — and actively hidden** | see §2.5 |
| 43 | Reported missing | **ORPHANED** | 巡检 only; destination `工具箱 → 失踪列表` *"does not exist in this file"* |
| 44 | Fostering delta | OWNED | farrowing + piglet-processing record overflow |
| 45 | Un-ID head needing batch | **ORPHANED** | calibration Step 2 only |
| 46 | Piglets lost since birth | **ORPHANED** | derivable; nothing computes it between farrowing and weaning |
| 47–48 | Device faults | **ORPHANED — but has a lane** | `part-b.md`: wrench + red badge on the **pen header**. Keep it there |
| 49 | Feed-station state | **OUT OF SCOPE** | `❌ 本期不开发` |
| 50 | Environment readings | **ORPHANED — unit level** | `consolidation-plan.html` §6: *"their own event"*, beside the stamp |
| 51 | Unit note | **ORPHANED — unit level** | the header accordion, not a row |
| 52–59 | All task row states | **OWNED — by definition** | the noise list, §5 |
| 60 | Last checked | **the unit header** | `components.html` §05 |

### 2.3 Finding 1 — batch membership is the orphan-detector

Production makes `属于批次` / `不属于批次` a first-class gating state on eight separate precondition
strips (`part-c1.md` `420:1712`–`430:1111`), and the correction annotation `850:2000` sharpens it:

> `这里的判断逻辑不是属于不属于批次，而是这头猪所在批次是否还有查情，配种，分娩，断奶…如果没有，那就[触]发这条`
> — *"The test is not batch membership, but whether the pig's batch still has any of
> heat-check / mating / farrowing / weaning outstanding."*

That is, in production's own words, **a test for "is any task still watching this animal?"**
Every one of the eight cohorts in §2.1 is scoped by batch or by a litter that descends from one.

**Therefore `no batch` on a check-in row means precisely: nothing else in the product will ever
show you this pig.** It is the cheapest, most literal orphan signal available, it is production's
own vocabulary, and it costs one token. It goes on line 2.

### 2.4 Finding 2 — the postpartum window is a three-day keyhole onto a two-year animal

`tasks/postpartum.html` captures the nine facts that describe a sow's *physical condition*:
`体况评分 1–5` · `乳房炎` · `乳汁产能` · `分泌物` · **`采食情况` (normal / reduced / refusing)** ·
**`活动能力` (normal / lame / won't move)** · `背膘` · `其他观察` · `淘汰建议`.

They are asked **once**, of sows on days 1–3 after farrowing (`产后母猪检查开始时间 = 分娩后第 1 天`),
plus any recheck. That is **3 days out of a reproductive cycle of roughly 140** (gestation +
lactation + wean-to-service — *my arithmetic, not the corpus'*: no doc states a cycle length) — and
**0 % of a gilt's, a grower's, a finisher's or a boar's.**

So: *is she eating? is she walking?* — the two questions a stockperson answers by looking — are
**owned for 2 % of the herd-life and orphaned for the other 98 %.** A gestating sow off feed at day
60, a nursery pig going lame, a gilt refusing feed: no task exists, has ever existed, or is planned.

The mechanism that saves this is already in production and is the hinge of the whole proposal.
`part-c2.md` `439:2028`, the 母猪状态 section subtitle:

> `健康状态异常将会作为疾病/症状展示，请酌情填写`
> — *"Abnormal health states **will be displayed as diseases/symptoms**."*

An abnormal postpartum answer becomes an ordinary condition record. Conditions render on the patrol
row. **So "off feed" and "lame" are already row-renderable facts — production simply has only one
narrow funnel that produces them.** The check-in is the second funnel, and it is the general one.

### 2.5 Finding 3 — the count mismatch is computed and then hidden

`part-a.md` Step 2 enforces a real balance equation:

```
记录栏位猪只总数  =  有身份猪只 (fixed by Step 1)  +  Σ(batch allocations)
```

with three enumerated states (`✓ 无身份猪只已全部补充批次` / `↓ 10 头需补充批次信息` /
`↓ 10 头需删除，或调整栏位总数`). The arithmetic exists. But:

> **A count mismatch is never surfaced.** There is no badge, colour, warning or sort order that
> says "this pen's headcount disagrees with the record". The discrepancy is only discoverable by
> entering the wizard and looking at the arithmetic. The pen card shows `猪只列表（5）` — a count
> of rows, with no expected-vs-actual comparison.

Counting a pen is the single most expensive act on a walk. Making the farmer enter a wizard per pen
to learn whether counting is *worth doing* inverts the economics. The mismatch belongs on the pen
header, where it costs nothing to read.

### 2.6 Finding 4 — the largest orphan is a whole population

All seven PRDs, plus weaning, are sow-cycle or litter tasks. `components.html` §05 states the
consequence outright:

> *"A pen of growers has no cycle, so the whole Production strip is absent."*

Between piglet processing (~day 5–7) and sale, **a commercial pig is touched by no scheduled task
for its entire life** — essentially all of it. (No doc states a finishing age; the corpus simply
contains no task whose cohort could include a grower.) For a farm, that is most of the animals in
most of the buildings. Nursery and finisher units have exactly one surface that will ever look at
them, and it is this one.

### 2.7 Summary — the orphan set

**Orphaned, and therefore the check-in's payload:**

1. Production status **+ days in it** (#10, #11)
2. Open conditions **+ how long they have been open** (#26–28)
3. Triage level (#29)
4. Under treatment **+ for how long** (#30, #31)
5. Batch membership as the orphan-detector (#5–6)
6. Identity gap — untagged head past the tagging window (#2, #9, #45)
7. Pen count mismatch (#42)
8. Litter attrition between farrowing and weaning (#17, #46)
9. Day-age for growers (#12)
10. Device faults (#47) — pen lane
11. **Every fact about every pig that is not a breeding sow or a nursing litter** (§2.6)

**Owned, and therefore noise:** every due date, every window, every interval, every readiness
verdict, every task chip, semen batch, mating count, days-since-weaning, parity, BCS, born counts,
remaining treatments.

---

## 3 · The anomaly set

What can go wrong in a pen that **no task is watching for**, and the minimum signal that lets a
farmer notice it while walking past — without counting and without drilling in.

| # | Anomaly | Who catches it today | Minimum walking signal | Where it lives |
|---|---|---|---|---|
| 1 | **Pig off feed** | postpartum, days 1–3 only, sows only | line 1 becomes the finding: `Off feed day 1` | line 1 |
| 2 | **Lame pig** | postpartum, days 1–3 only | `Lame day 2` | line 1 |
| 3 | **Treated and not improving** | **nobody** | the condition is still line 1 *and* line 2 says `treated 3d` — the farmer reads "day 4 of a fever, day 3 of a drug" in one glance | line 1 + line 2 |
| 4 | **Sick pig no one has ranked** | **nobody** | absence of a chip on a row whose line 1 is a condition — every condition row should carry a triage chip or visibly lack one | chip |
| 5 | **Pig in the wrong pen** | calibration `手动添加`, which *"shows where the system currently thinks the pig is"* | pen header count mismatch (it is the same arithmetic seen from the other side) | pen header |
| 6 | **Count does not match** | calibration wizard, buried | pen header chip `1 SHORT` | pen header |
| 7 | **Untagged animal past the tagging window** | piglet processing, day 5 only | `no tags` token; the row's subject is `× 42` rather than a tag | tag slot + line 2 |
| 8 | **Un-ID head with no batch allocation** | calibration Step 2 | `no batch` token | line 2 |
| 9 | **Environmental / equipment fault** | equipment lane, wrench badge (already good) | keep the pen-header wrench + count; **do not** move it onto pig rows | pen header |
| 10 | **Recheck window silently lapsed** | postpartum's `需复查` only, inside its own task | `Recheck · overdue 2d` on line 1 — **but the health recheck event does not exist yet** (§6) | line 1, blocked |
| 11 | **Withdrawal period still running** | **nobody — unmodelled** | would be a line-2 token `withdrawal 3d`; **do not build on a guess** (§6) | blocked |
| 12 | **Sow stuck in a status** | **nobody** — heat check has no overdue state, breeding's `READY` *"persists indefinitely"* | days-in-status on line 1: `Open · 42 days` reads wrong to anyone who knows the herd | line 1 |
| 13 | **Sow who fell out of every task** | **nobody** | `no batch` on line 2 | line 2 |
| 14 | **Litter shrinking** | farrowing (during birth) and weaning (day 21) — nothing between | `9 piglets · 4 lost`, printed **only when > 0** | line 2 |
| 15 | **A grower pen no one has looked at** | **nobody, ever** | the row exists at all, with `Growing · day 68` and any treatment load | whole row |
| 16 | **Health load climbing in a group** | **nobody** | `3 under treatment` as line 1 of the group row — a number that grows day to day | line 1 |
| 17 | **Dead pig never recorded** | **nobody** | surfaces as #6, the count mismatch | pen header |

Anomalies 1, 2, 3, 12, 14, 15, 16 are all readable **because line 1 carries a state with a clock on
it.** That single decision — state + elapsed, not state alone — is what makes a walking glance
diagnostic. Production computed the clock and left it on a modal header.

---

## 4 · The row proposal

### 4.1 The rules, stated once

**Line 1 — words. Two-slot precedence:**

1. **If an open condition exists → the condition and its day.** `Fever day 3` · `Lame day 2` ·
   `Off feed day 1`. Grounded in `tasks/pig-actions.html` §7 (*"Health is the row's subject… it is
   line 1"*) and production's own conditional-health slot.
   Multiple conditions → the most severe, then `+2 more`, never a truncating comma-list.
   *(Production truncates —* `发烧，感冒，四肢肿胀，食…` *— which is the one thing on its row that
   fails outright at glove distance.)*
2. **Otherwise → production status + elapsed.** `Pregnant · day 87` · `Open · 6 days` ·
   `Nursing · day 12` · `Growing · day 68`. Vocabulary from §0.3; the elapsed form from
   production's `空怀/后备 1 天`.

**Line 2 — mono tokens.** Order per §01b (*time → counts → codes*), with unit mode's standing facts
leading because they are counts:

```
[standing: parity N | Nd age | N piglets] · [batch code | no batch] · [open trail: treated Nd · G.H]
```

**The zero rule.** *A token that says "nothing is wrong" is not printed.* Direct generalisation of
production's `显示疾病症状，没有就不显示`. So `4 lost` appears only above zero, `no tags` only when
true, `treated 3d` only while a treatment is open. This is the single mechanism that keeps 220 rows
quiet and makes the eight that are not quiet visible.

**Chip — at most one, and only these.** Per §01b's chip law (*"an escalated measurement or a
flagged observation recorded by a hand"*) and §02b's priority (*red › amber › green › neutral*):

| Chip | Colour | Source | Why it qualifies |
|---|---|---|---|
| `URGENT` | red | triage `紧急治疗` / consolidation §7 *Euthanize* | flagged observation, recorded by a hand |
| `PRIORITY` | amber | triage `优先干预` / *Hospital pen* · *Treat in place* | same |
| `40.6°` | amber | temperature over threshold | escalated measurement — the exact analogue of `LAST 45M` |
| `N SHORT` | amber | pen count mismatch (**pen rows only**) | escalated measurement — observed vs recorded |
| `N FAULTS` | red | device fault count (**pen rows only**) | production's existing wrench badge, given the chip's shape |

`常规观察` / *Monitor* is **not** a chip — it stays a grey `monitor` token on line 2, per
*"Below threshold, measurements stay grey tokens."* Counts lead the word from 2 (`3 URGENT`).

**Rail — empty.** Unit mode has no verdict to render: `components.html` §05 assigns the tick to
selection and the tap to reading (*"Tick the box → selection → the verb sheet: this is how you act.
Tap the row → her page: this is how you read"*), and §01b reserves the rail for verdicts. 220
chevrons would be 220 units of noise for one bit of information. **Flagged as a deliberate reading
of §01b, not a certainty — see §6.**

**Two lines, one height, always.**

### 4.2 A · Gestating sow — identified, in a gestation unit

```
        ┌────────────────────────────────────────────────────┐
NORMAL  │ ☐  000254   Pregnant · day 87                      │
        │             parity 3 · 20₁                         │
        └────────────────────────────────────────────────────┘
```
Line 1 is her state and how long she has held it. Line 2 is the two facts that change how you judge
anything else about her: how valuable she is (parity) and whether anyone is watching her (batch).

```
        ┌────────────────────────────────────────────────────┐
ANOM 1  │ ☐  000254   Off feed day 2            ▌PRIORITY▐   │
off     │             parity 3 · 20₁ · G.H                   │
feed    └────────────────────────────────────────────────────┘
```
*No task asks whether a day-87 gestating sow is eating.* The condition supersedes the cycle state on
line 1; the chip ranks her against the other four off-feed sows in the unit; `G.H` is the flag's
trail, per §01b.

```
        ┌────────────────────────────────────────────────────┐
ANOM 2  │ ☐  000254   Fever day 4                ▌URGENT▐    │
treated │             parity 3 · 20₁ · treated 3d · G.H      │
not     └────────────────────────────────────────────────────┘
better
```
**The most valuable row in the product.** Day 4 of a fever, day 3 of a drug: the drug is not
working, and nothing else in Sentri will ever tell anyone that. Read without counting, without
tapping. *(Blocked on a treatment timestamp — §6.)*

```
        ┌────────────────────────────────────────────────────┐
ANOM 3  │ ☐  000254   Mated · 46 days ago                    │
fell    │             parity 3 · no batch                    │
out     └────────────────────────────────────────────────────┘
```
She should have been pregnancy-checked at day 20 and farrowed near day 114. `no batch` says no task
holds her; `46 days ago` says how long that has been true. Two tokens, one lost sow.

### 4.3 B · Lactating sow with a litter

The row is **the sow**; the litter is a count on her (`components.html` §05: *"A litter is a
selection, not a subject"*).

```
        ┌────────────────────────────────────────────────────┐
NORMAL  │ ☐  000418   Nursing · day 12                       │
        │             parity 3 · 11 piglets · 20₁            │
        └────────────────────────────────────────────────────┘
```

```
        ┌────────────────────────────────────────────────────┐
ANOM 1  │ ☐  000418   Mastitis day 1            ▌PRIORITY▐   │
after   │             parity 3 · 11 piglets · G.H            │
the     └────────────────────────────────────────────────────┘
window
```
Postpartum owned mastitis on days 1–3. This is lactation day 12. **The window closed nine days ago
and the sow did not.**

```
        ┌────────────────────────────────────────────────────┐
ANOM 2  │ ☐  000418   Nursing · day 12                       │
litter  │             parity 3 · 9 piglets · 4 lost · 20₁    │
falling └────────────────────────────────────────────────────┘
```
Farrowing recorded 13 born; weaning will count them at day 21. Between those two events nothing
computes the difference. `4 lost` is derived from recorded piglet deaths and prints only above zero.

```
        ┌────────────────────────────────────────────────────┐
ANOM 3  │ ☐  000418   Off feed day 3             ▌URGENT▐    │
sow     │             parity 3 · 11 piglets · treated 2d     │
failing └────────────────────────────────────────────────────┘
```
A lactating sow off feed for three days is a litter about to fail. `11 piglets` on line 2 is what
makes the row urgent rather than merely unwell.

### 4.4 C · Un-identified nursery group

The count occupies the tag slot, as production does (`× 10`, `× 200` on `No ID Pigs` rows,
`part-a.md` `749:2125`). **This subject type has no task, ever.**

```
        ┌────────────────────────────────────────────────────┐
NORMAL  │ ☐  × 42     Growing · day 68                       │
        │             26₁ · in jul 14                        │
        └────────────────────────────────────────────────────┘
```
`day 68` is the growth clock — the only schedule a grower has. `in jul 14` is arrival, which for a
group is the closest thing it has to an identity.

```
        ┌────────────────────────────────────────────────────┐
ANOM 1  │ ☐  × 42     Coughing · 6 head        ▌3 PRIORITY▐  │
health  │             26₁ · treated 4d · G.H                 │
load    └────────────────────────────────────────────────────┘
```
Add-condition is Bulk over N pigs (`product-model.html` §4), so a group row carries a group
condition. `6 head` today against `3 head` yesterday is the anomaly; `treated 4d` says the response
has been running four days without closing it out. Count leads the chip word per §02b.

```
        ┌────────────────────────────────────────────────────┐
ANOM 2  │ ☐  × 42     Growing · day 68                       │
nothing │             no batch · no tags                     │
watching└────────────────────────────────────────────────────┘
```
**The purest orphan in the system.** Forty-two animals with no identity, in no batch, past every
tagging window, at day 68. No task can see them. Two tokens, and only this surface will ever print
them.

```
        ┌────────────────────────────────────────────────────┐
ANOM 3  │ ☐  × 42     Growing · day 68           ▌40.6°▐     │
escal.  │             26₁ · monitor · G.H                    │
measure └────────────────────────────────────────────────────┘
```
An escalated measurement, the direct analogue of `LAST 45M`. Below threshold it would be a grey
token, not a chip. `monitor` is the triage level below the chip line. *(Threshold is a farm-config
unknown — §6.)*

### 4.5 D · Pen row

A pen is a legitimate subject (`components.html` §05: *"The subject can be anything on screen — a
tagged sow, an untagged head in a group, a pen"*), and pen-scoped events (count correction,
equipment) need no door of their own. The pen row carries **exactly what is true of the pen and
false of any pig in it.**

```
        ┌────────────────────────────────────────────────────┐
NORMAL  │ ☐  C1       42 pigs                                │
        │             26₁ · day 68                           │
        └────────────────────────────────────────────────────┘
```

```
        ┌────────────────────────────────────────────────────┐
ANOM 1  │ ☐  C1       42 pigs                    ▌1 SHORT▐   │
count   │             counted jul 22 · G.H                   │
        └────────────────────────────────────────────────────┘
```
Line 1 states the record; the chip states the discrepancy; line 2 is the trail of the last count.
Nothing is said twice, per §01b slot discipline. This is `part-a.md` Step 2's balance equation
printed once, at the door, instead of hidden behind a wizard entered pen by pen.

```
        ┌────────────────────────────────────────────────────┐
ANOM 2  │ ☐  C1       42 pigs                   ▌2 FAULTS▐   │
kit     │             feeder · water · jul 20 · G.H          │
        └────────────────────────────────────────────────────┘
```
Production's wrench-plus-red-badge, given the chip's shape. Line 2 names the devices — the flag's
trail. **Pig rows stay clean of equipment**, exactly as production separates the lanes.

```
        ┌────────────────────────────────────────────────────┐
ANOM 3  │ ☐  C1       42 pigs · 6 under treatment ▌2 URGENT▐ │
health  │             26₁ · 3 conditions open               │
load    └────────────────────────────────────────────────────┘
```
The pen-level roll-up of §4.4. Useful in the pen picker and the peek, where the pen *is* the row —
and §02c requires it: *"Anything you want in the peek, you put in the row."*

### 4.6 What this changes against the existing §05 sketch

`components.html` §05 already contains a check-in draft:

```
001471  Quiet          gilt · 235d
001479  Lame day 2     gilt · 233d · treated 1d · G.H
001482  Standing heat  gilt · 232d · 118kg
001507  Off feed day 1 gilt · 228d · G.H
```

It is right in structure and this proposal keeps it. Four refinements, each with a reason:

| Change | From | To | Why |
|---|---|---|---|
| Status word | `Quiet` | `Open · 235 days` | `Quiet` is not in production's set (§0.3). `Open` is, and the elapsed clock turns the row diagnostic — a 260-day gilt still `Open` is the anomaly, and `Quiet` cannot say it |
| Drop the type token | `gilt · 235d` | `235d` | `Unit 6 gilt pool` already said it — production's own redundancy, repeated 84× |
| Drop the stale measurement | `232d · 118kg` | `232d` | A weight from three weeks ago on every row is the definition of the bombardment the brief warns against (§5.4) |
| Add the orphan-detector | — | `no batch` when true | §2.3 |
| Add a chip | (none) | `URGENT` / `PRIORITY` | `Lame day 2` and `Off feed day 1` are equally loud today. The chip is what ranks them, and it is what §01b's chip law is for |

---

## 5 · The noise list — what is deliberately off the row

### 5.1 Everything a task drives

`Due · today` · `Due · in 5 days` · `In window · day 21` · `Recheck · due today` · `READY` ·
`WAIT · next 9h` · `ACTIVE` · `CHECK` · `IN 3D` · `Late · 1d` · `SIGNS` · `LAST 26H` · `LAST 45M` ·
`teeth · tail · castrate`.

Two reasons, and the second is the stronger. **(a)** The farmer meets each of these inside a task
that provides its lens, its bar and its cohort. **(b)** Rendering a demand on a surface that cannot
satisfy it correctly is worse than silence: `components.html` §05 cut promotion in unit mode for
exactly this reason, and a check-in that prints `READY` without a breeding lens invites a mating
recorded outside its batch — which `tasks/pig-actions.html` forbids (*"Bulk never crosses the
batch"*).

### 5.2 Task-owned facts, even though they are true

Semen batch `JY001` (breeding, return-heat) · mating count (return-heat) · `weaned 4d`
(heat check) · `in heat 6h` (breeding) · `11 born` (postpartum) · BCS (postpartum, weaning) ·
remaining treatments (piglet processing) · `留种` (weaning).

### 5.3 Parity — kept for sows, dropped everywhere else

Production omits parity from its patrol row entirely and keeps it on sheet headers. This proposal
puts it back **on sow rows only**, because it is the single fact that changes what an anomaly means
(a parity-8 sow off feed is a cull conversation; a parity-1 sow off feed is a treatment). On gilts,
growers and groups, `日龄` does that job and parity is undefined.

### 5.4 Stale measurements

Weight · backfat · BCS values · temperature values below threshold.

`part-e.md` establishes these as Conveyor events recorded weeks apart. A three-week-old weight
printed on 220 rows is 220 tokens of nothing, every day, until the day it is replaced. They belong
on the pig page — where `components.html` §05 already puts them:
`Body · 182 kg jun 30 · backfat 15 mm`. **An escalated temperature is the sole exception**, and it
appears as a chip rather than a token precisely because escalation is what earns the space.

### 5.5 Production's own redundancies

`猪只类型` (the unit says it) · pen code on a row (the pen header says it) ·
the production-line subscript beyond the batch code · the truncating symptom list
`发烧，感冒，四肢肿胀，食…` — the one element of production's row that fails outright at glove
distance, replaced here by `most severe + N more`.

### 5.6 Identity attributes

Ear notch · sex · parents · birth date. Searchable (`product-model.html` §6 requires notch search),
never scannable by eye. They identify; they do not report.

### 5.7 Structural noise

- **The rail verdict / chevron** — §4.1.
- **Progress and denominators** (`4 of 6 left`, `n of m shown`) — nothing on a walk is being
  completed. `consolidation-plan.html` §6 is explicit: *"No coverage assertion. We never claim 'all
  pens checked' — production claims it and validates nothing."*
- **A second chip, coloured text, progress bars, blue anything** — §02b's exclusion list.
- **`需操作`** — disqualified by its own annotation (§0.2).
- **Feed-station tiles** — `❌ 本期不开发`, and pen-lane anyway.
- **Notes and photo counts** — trails, not states; the pig page holds them.
- **The `⚑` flag token and red dot** — carried by four task docs' row grammar but **cut entirely**
  by the newest doc, `tasks/pig-actions.html` (*"Mark is cut entirely. The action, its sheet, its
  three entry points, the red dot on rows and pen cells, the `已被标记` row line, and the 'flagged'
  filter chip all go"*). Flagged as an unreconciled contradiction in §6.
- **"Already handled this walk"** — production has no such state and no progress denominator
  (`part-a.md` Ambiguity 8: *"Nothing defines what makes a pen 'checked'"*), and
  `components.html` §05 removes the need: the check-in *"asserts the negative"* at unit level only.

---

## 6 · Unknowns — flagged, not guessed

| # | Unknown | What it blocks | Evidence |
|---|---|---|---|
| 1 | **Withdrawal period (休药期) does not exist anywhere.** Zero matches across all six inspection parts, the treatment form, and our own model. | Anomaly 11. A treated pig inside a withdrawal window is a food-safety and audit fact, and it is exactly a check-in row fact. **Do not invent the field to justify the token.** Needs a domain decision first. | `part-d.md` grep; treatment form `286:1027` has no date, no note, no photo |
| 2 | **Treatment has no timestamp.** *"No treatment history, no dosage validation, no date/time… no administered-at timestamp field appears on the form."* | `treated 3d` — the token that carries anomaly 3, the most valuable row in §4. One field on the treatment sheet unblocks it. **Recommended as the smallest high-value data change in this brief.** | `part-d.md` Ambiguity 15 |
| 3 | **No health recheck exists.** `consolidation-plan.html` §7 proposes *Monitor → "sets a recheck window; she appears in the next check-in's attention list"*, but no event, no window, no lapse. Postpartum's `需复查` is task-internal and its trigger and interval are themselves open (`tasks/postpartum.html` Q1). | Anomaly 10, and the `Recheck · overdue 2d` line-1 form | `consolidation-plan.html` §7; `part-d.md` §4c |
| 4 | **Triage semantics are placeholder text.** Every level's description reads `这里是健康分诊等级的描述`. `consolidation-plan.html` §7 proposes action-naming levels (*Euthanize · Hospital pen · Treat in place · Monitor*) marked *"validate the exact wording and escalation policy with your veterinarian before it ships."* | The chip vocabulary in §4.1. Structure is safe; **wording is not settled** | `part-d.md` `854:2369` |
| 5 | **Triage and disease are independent writes.** *"Adding a disease does not force a triage change, and marking everything 康复 does not visibly reset triage to 健康."* | Whether every condition row can be guaranteed to carry a chip (anomaly 4). If triage stays optional, most condition rows will have no chip and the ranking fails | `part-d.md` Ambiguity 13 |
| 6 | **`哺乳` is not in the precondition strip** but is in the state machine. | Whether `Nursing · day 12` is a real `生产状态` or a derived state. Affects §4.3 | `part-c1.md` `420:1712` vs `consolidation-plan.html` §4 |
| 7 | **Two names for one transition.** `262:960` writes `生产状态更新为"空怀/后备"`; `262:1012` writes `"空怀"`. | Whether line 1 reads `Open` or `Open / Gilt` after abortion and weaning | `part-c1.md` Ambiguity 7 |
| 8 | **No temperature threshold is defined anywhere**, and there is no evidence temperature is taken at scale on a walk (`体温（只可单只记录）`). | The `40.6°` chip. Structurally correct per the chip law; **the number is farm config we do not have** | `part-e.md` |
| 9 | **Days-in-status thresholds are undefined.** How many days at `Open` is wrong? | Whether days-in-status ever *escalates* to a chip, or only ever reads as a number the farmer judges. **This brief assumes the latter** — the number is printed, never coloured | — |
| 10 | **The `Mark` contradiction.** Four task docs keep `⚑` in the row grammar; `pig-actions.html` (newest) cuts it and the red dot outright. | Whether a free-note flag exists at all. This brief follows the newest doc and omits it | `tasks/pig-actions.html` line 76 vs heat-check D2, pregnancy-check D3, farrowing Δ4 |
| 11 | **Weaning has no PRD.** Seven task docs exist; weaning appears as the eighth task in `components.html` §01b and `screens.html` §01 with a full row grammar, but no requirements doc. | Confidence in the weaning ownership row of §2.1. Its row grammar is specified; its cohort trigger and lapse behaviour are inferred | `ux/tasks/` directory listing |
| 12 | **The rail in unit mode.** §01b defines the rail as verdict / ✎ / empty. Unit mode has no verdict, but §05 gives the row-tap to the pig page — arguably a chevron's job. | This brief proposes **empty**. It is a reading, not a quotation. Worth one test | `components.html` §01b, §05 |
| 13 | **Mixed pens are unspecified.** Production's four row types are ID × batch; a pen holding both tagged and untagged animals renders as one group row plus N pig rows, but nothing states whether the group's `× N` excludes the tagged ones. | Count arithmetic on the pen row (§4.5) | `part-a.md` `654:1880`–`1885` |
| 14 | **`工具箱 → 失踪列表` does not exist.** Reported-missing pigs are routed to a destination that is not designed. | Whether a missing pig leaves the check-in list, stays greyed, or persists | `part-a.md` `509:1702`; `part-e.md` Ambiguity 17 |

---

## Sources

- `/Users/xia/Desktop/Sentri-UI/ux/components.html` — §01b, §01c, §02, §02b, §02c, §04, §05
- `/Users/xia/Desktop/Sentri-UI/ux/screens.html` — §01 (task list config table), §04b
- `/Users/xia/Desktop/Sentri-UI/ux/product-model.html` — §3, §4, §5, §6, §8
- `/Users/xia/Desktop/Sentri-UI/ux/consolidation-plan.html` — §2, §4 (supersession), §6, §7
- `/Users/xia/Desktop/Sentri-UI/ux/inspection/part-a.md` — `60:523`, `749:2125`, `907:3431`,
  `654:1880`–`1885`, `224:1545`, `1796:1675`–`224:1486`, `509:1702`, `658:3113`
- `/Users/xia/Desktop/Sentri-UI/ux/inspection/part-b.md` — `580:2242`, `225:4803`, `928:2008`, `642:2705`
- `/Users/xia/Desktop/Sentri-UI/ux/inspection/part-c1.md` — `420:1712`–`430:1111`, `850:2000`,
  sheet-header anatomy, Ambiguity 7
- `/Users/xia/Desktop/Sentri-UI/ux/inspection/part-c2.md` — `440:1089`, `440:1108`, `439:2028`, `620:2857`
- `/Users/xia/Desktop/Sentri-UI/ux/inspection/part-d.md` — `853:2120`, `854:2369`, `286:1027`,
  `587:2774`, `591:3550`, Ambiguities 12, 13, 15
- `/Users/xia/Desktop/Sentri-UI/ux/inspection/part-e.md` — `654:2366`, `296:1133`, `300:1048`,
  `473:4569`, Ambiguities 1, 2, 17
- `/Users/xia/Desktop/Sentri-UI/ux/tasks/*.html` — seven PRDs + `pig-actions.html`
