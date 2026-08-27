# Cycle ad-hoc — Heat · Unexpected pregnancy 意外妊娠 · Return-to-heat · Abortion 流产

The four production verbs a farmer reaches from the verb sheet after selecting a pig on a
check-in walk — the cycle events the schedule did not predict. Binding sources:
`components.html` §04 (record-sheet shell + field kit, conditional rule) and §05 (entrance,
arity, omitted-not-greyed), `check-in.html` §06d (row grammar), `product-model.html` §4
(event catalogue), `tasks/pig-actions.html` (abortion decisions), `checkin/pen-count.md`
rows 16–17/20 (picker subtractions). Production: `inspection/part-c1.md` (发情 · 意外妊娠 ·
流产 flows) and `inspection/part-c2.md` (drawer `782:2200`).

Governing law (components.html:997): **consequences are chosen inside the action, never at
the entrance** — "'Mark heat and join a batch' and 'mark heat, no batch' are one verb with a
field." Working assumption, honoured not relitigated: ≤~5-field judgment = drawer;
conveyor/composite or more = page (the drawer/page line is still open in
components.html:1007). All four verbs verify as drawers below.

---

## 1 · Production inventory

What production built, per verb. Node ids are Figma; line refs are `part-c1.md` unless noted.

### The entrance production had

One 生产 drawer (`782:2200`, part-c1:141–165 / part-c2:68–81): six tiles — 发情 · 意外妊娠 ·
流产 · 分娩 · 断奶 · 标记/移除留种. Governing annotation `853:2119` (part-c1:64–76):

> 发情、意外妊娠、流产、分娩、断奶：只能作用于 单头猪，选择多头猪时，此按钮禁用

— all five cycle verbs single-pig only, tile *disabled* on multi-select. And `853:2023`:
未选择猪只时…底部操作功能按钮禁用. Every sheet names exactly one pig; no `已选 N 头` header
exists anywhere in the cluster (part-c1:196).

### 发情 — four sheets, one tile (part-c1:203–271)

| Precondition (strip) | Sheet | Body / controls | 中文 rule |
|---|---|---|---|
| 空怀/后备 · 属于批次 · 批次任务未开始 (`246:597`) | `465:1334` | Info card only, 提交 enabled | 「该猪只发情早于批次计划」·「仅记录该猪只的发情时间。」「不影响批次 20_1 的原定计划。」「通知管理员决定是否开始该批次。」 |
| 空怀/后备 · 属于批次 · 批次任务进行中 (`420:1683`) | `359:1188` | Info card only | 「标记猪只为发情」·「生产状态将被标记为发情」「当前进行中的查情任务转移至配种」 |
| 已发情/已配种/已妊娠 · 属于批次 (`420:2116`) | `251:636` / `430:1057` | Segmented 仅记录发情 / 确认返情; 确认返情 reveals ack checkbox, 提交 disabled until ticked | 「配种后再次发情」·「该猪只已配种。请确认是否判定为"返情"并移除后续批次任务？」· ⚠「记录返情，并将该猪只移出所在批次。」· checkbox 「我已知晓，并确认该猪只将从当前批次中移出。」 |
| 空怀/后备/已发情/已配种/已妊娠/成长期 · 不属于批次 (`420:1712`) | `420:1730` / `473:2733` / `473:3168` | Segmented 仅记录发情 / 加入到批次; join branch: outline CTA 选择批次, 提交 disabled until batch chosen, CTA relabels 生产线1 - 批次20 | 「仅记录该猪只的发情时间。」「该猪只发情状态会持续48小时。」 / 「加入批次后，可跟随批次执行配种任务。」 |

Correction `850:2000` (part-c1:85–92): the fourth branch's trigger is **not** batch
membership — 「这里的判断逻辑不是属于不属于批次，而是这头猪所在批次是否还有查情，配种，分娩，
断奶（其中任意一个），如果没有，那就触发这条」.

### 意外妊娠 — the 4-screen chain (part-c1:275–296)

1. **Sheet** `260:556` / `473:3291`: segmented 仅记录妊娠 / 加入到批次.
   仅记录妊娠 → ⓘ「仅记录该猪只的妊娠状态。」 ⚠「该猪只将不会自动加入到任何批次。」, 提交 enabled.
   加入到批次 → ⓘ「加入批次后，可跟随批次执行生产任务。」 + outline CTA 选择批次; 提交
   **disabled** until a batch is picked. (Card title 「查情任务外标记发情」 is miscopied from
   the 发情 flow — part-c1 ambiguity 2, lines 523–526.)
2. **选择批次** bottom sheet `473:3366` / `580:2097`: filter note 「仅可选择配种任务已完成
   并且分娩任务未完成的批次。」 (「为完成」 typo in 2 of 3 frames — ambiguity 1, part-c1:517–521);
   radio rows `批次20` + timing 「🕐 孕检 3天后 开始」「🕐 孕检 2天后 开始」「◐ 孕检 进行中」;
   search 「批次号」; empty state 「未搜索到"批次99"」 (`479:2251`); 确认 disabled until a row
   is selected.
3. **选择生产线** wheel sheet `473:3447`: 取消 / 确认. Exists because search is line-scoped —
   `575:1965`: 「只能搜到所选的生产线里的批次」 (part-c1:94–98).
4. **操作结果** toast `473:3469`: 「操作成功」.

Gate `420:2159` (part-c1:132, 497): 属于批次 → **"意外妊娠"按钮禁用** — the tile only exists
for pigs outside a batch.

### 流产 — two variants keyed on membership (part-c1:300–319)

| Variant | Body | Gate |
|---|---|---|
| In batch `262:960` 「批次内标记流产」 | ⚠「该猪只移出当前批次。」 ⚠「生产状态更新为"空怀/后备"。」 | checkbox 「我已知晓，并确认该猪只将从当前批次中移出。」 gates 提交 |
| No batch `262:1012` 「标记流产」 | ⓘ「生产状态更新为"空怀"。」 | checkbox 「我已知晓。」 drawn pre-ticked |

**Neither variant captures any data** — no date, cause, or count (part-c1:316–317). The task
side of the product does: 更多操作 → 母猪流产 captures Cause\* (6 chips) + remarks required
iff Other (`2572:19676`, pig-actions.html:58) and states 「流产猪只将从当前批次中移除」.

### Batch pickers — three shapes for one job (part-c1:420–449)

| Reached from | Form | Filter (verbatim) | Rows show |
|---|---|---|---|
| 发情 no-batch (`479:2165`/`479:2251`) | full page, header mislabeled 分娩 | 「仅可选择配种任务进行中或尚未开始的批次。」 | 配种 3天后 开始 / 2天后 / 进行中 |
| 意外妊娠 (`473:3366`/`580:2097`) | bottom sheet | 「仅可选择配种任务已完成并且分娩任务未完成的批次。」 | 孕检 3天后 开始 / 2天后 / 进行中 |
| 分娩 (`479:1867`, out of this cluster) | wizard step | same as 意外妊娠 | 孕检 timing |

`575:2001`: 「已选择批次后，再次点击按钮，可以修改批次」 — re-tap to change. Every flow ends
in the identical 「操作成功」 toast (11 nodes, part-c1:453–461); no partial-success view
anywhere, further proof of single-pig arity.

---

## 2 · Per-verb specification

### Entrance, shared by all four

Door 1–3 per components.html §05 (759–780). On the check-in walk: tick/scan names the
subject → the verb sheet rises. The four live on the **Production strip**: components'
specimens show `Heat` for gilts (line 816) and `Pregnancy result · Returned to heat ·
Abortion` for a mated sow (lines 852–856). Blocked verbs are **omitted, never greyed**, and
one mono line accounts for them — 「4 not available for a gilt ›」 (components:934; this
explicitly revises pig-actions' disabled-with-reason). Production's per-tile disable and its
five-way single-pig rule both die here: arity is a property of the event
(product-model:155), stated per verb below.

#### Gating truth table

Gates read the animal (product-model Law 3, lines 171–179), never the surface, never batch
membership. States use production's vocabulary; "watched" = her batch still has any of
查情/配种/分娩/断奶 outstanding (`850:2000`).

| Her state | Heat | Pregnancy result | Returned to heat | Abortion |
|---|---|---|---|---|
| 成长期 gilt, breeding age | ✓ | ✓ (the true 意外妊娠 — production `420:2128` lists 成长期) | omit · not bred | omit · not bred |
| 空怀/后备 empty sow | ✓ | ✓ | omit · not bred | omit · not bred |
| 已发情 (within 48 h mark) | ✓ (re-open = edit, audited) | ✓ | omit · not bred | omit · not bred |
| 已配种 bred | omit — the observation *is* a return; Returned to heat owns it | ✓ (ad-hoc / early check) | ✓ | ✓ |
| 已妊娠 pregnant | omit | ✓ (re-confirm — production `420:2128` includes 已妊娠) | ✓ | ✓ |
| Farrowed, pre-wean | omit · nursing | omit · nursing | omit · already farrowed | omit · already farrowed (pig-actions:192) |
| Male / slaughter pig | strip absent entirely (components:931) | — | — | — |

Batch membership gates **nothing**. Production's 意外妊娠 in-batch disable (`420:2159`) is
subtracted: the conflict it protected against (joining while already a member) is now
impossible structurally, because the join field only appears when she is unwatched.
Production's own 发情/断奶 branch split by membership becomes in-sheet variation, resolved
by the `850:2000` test.

#### Arity (product-model:122–127 · components:983–987)

| Verb | Arity | N>1 payload |
|---|---|---|
| Heat | **Bulk** | one Choice + one optional shared batch join + one timestamp, written to N records |
| Pregnancy result | **Bulk** | one Choice (+ shared recheck interval, or shared join) |
| Returned to heat | **Bulk** | one Choice |
| Abortion | **Single** | absent from a multi-selection; counted in the not-available line (「abortion — one at a time」), never greyed |

Bulk batch join is deliberate: product-model:123 defines Heat's capture as "timestamp;
**optional batch join**" at arity Bulk — the join is part of the payload, so N gilts found
cycling can be joined to the same service batch in one act (that *is* how a batch forms).
Partial eligibility follows Law 3 (product-model:177–179): pigs whose state blocks the join
are listed with the reason, and the farmer proceeds with the remainder deliberately — never
silently dropped.

---

### 2a · Heat (ad-hoc) — drawer

Same record as 查情's task mark (Law 4, product-model:181–184; heat-check.html:139–140):
one form, two doors, different pre-fill.

**Fields → kit** (components §04):

| # | Field | Kit | Notes |
|---|---|---|---|
| 1 | Outcome\* | Choice(2) | `Heat signs` — hint `watch · stays` · `In heat` — hint varies (below). Matches composition table row "Heat · Return-heat — Choice(2)" (components:665) |
| 2 | ↳ Join batch | Picker, **optional**, conditional | revealed inline beneath `In heat` (amber-rule reveal, components:657–659) **only when she is unwatched** per `850:2000`. Empty state reads `No batch` — an unfilled optional Picker *is* production's 仅记录发情 |

**The `In heat` consequence hint is derived, not chosen** — production's first two sheets
were pure information, so they compress to one line each:

| Derived state | Hint / caption on `In heat` |
|---|---|
| batch 查情 running (`359:1188`) | `→ breeding` — her running heat-check advances to mating (「当前进行中的查情任务转移至配种」) |
| batch task not started (`465:1334`) | `batch plan unchanged · admin notified` (「不影响批次…原定计划」「通知管理员决定是否开始该批次」) |
| unwatched (`420:1730`) | reveals field 2. Picker empty: caption `expires in 48 h · nothing will schedule her` (「该猪只发情状态会持续48小时。」). Picker filled: `follows batch · 配种 in 3 d` (「加入批次后，可跟随批次执行配种任务。」) |

**Commit** is never blocked: record-only is legal, so production's 提交-disabled-until-batch
dies with the segmented control. Container: 2 fields → **drawer**. ✓

**Post-commit row** (check-in.html §06d, lines 748–749: line 2 = `standing · no batch ·
trail`, zero rule throughout):

| Case | Row after commit |
|---|---|
| Record only, gilt | `In heat · just now` / `gilt · 232d`. **No `no batch` token** — a gilt is pre-batch by definition, so batch-lessness is normal and prints nothing (zero rule; the §05 gilt rows confirm, components:792–793). At 48 h unclaimed she reverts to `Quiet`; the heat event stays on her page trail |
| Record only, slipped empty sow | keeps her existing `no batch` — a heat mark claims nothing; only a join or a batch task removes the token |
| Joined | `In heat · just now`, batch silent (having one is normal). She surfaces in that batch's 配种 task list; **a prior `no batch` token disappears — that vanishing is the join's visible effect** |

### 2b · Unexpected pregnancy 意外妊娠 — drawer

Not a verb of its own: product-model:125 folds 巡检's 意外妊娠 into **Pregnancy result**
("task (孕检) · 巡检 意外妊娠"). The ad-hoc door opens the same Choice(3) record the 孕检
task uses (pregnancy-check.html:166–171, D1/D2 at 200–201); the farmer who found her
pregnant taps `Pregnant` — the other outcomes stay available because it is one form.

**Fields → kit**:

| # | Field | Kit | Notes |
|---|---|---|---|
| 1 | Result\* | Choice(3) | `Pregnant` · `Not pregnant` · `Unclear` — consequence hints per D2. Composition row components:666 |
| 2 | ↳ Recheck | Stepper (days), conditional on `Unclear` | default 3 d from config, hint tap-to-override (D1) |
| 3 | ↳ Join batch | Picker, **optional**, conditional on `Pregnant` **and** unwatched (`850:2000`) | the collapsed 意外妊娠 chain — see §3. Empty state `No batch`; caption ⚠「该猪只将不会自动加入到任何批次。」 rendered as `nothing will watch her — her row will read no batch`. Filled: 「加入批次后，可跟随批次执行生产任务。」+ the batch's 孕检 timing |

Hints when she is watched: `Pregnant → follows batch · farrowing` · `Not pregnant → leaves
batch · rebreed` (pregnancy-check.html:108, 201). Production's miscopied card title
(「查情任务外标记发情」, ambiguity 2) dies with the sheet. Conditional-reveal check: no
choice reveals more than one field at a time → not a composite (components:658). Container:
3 fields → **drawer**. ✓

**Post-commit row**:

| Case | Row after commit |
|---|---|
| Record only | `Pregnant` / `parity 2 · no batch` — **`no batch` prints immediately**: §06d prints it exactly when no task is watching her (check-in:748–749, 775–776 "Fell out of every task"), and record-only is production's ⚠ bullet made into a standing token. No day count — there is no mating date to derive it from (see open Q7) |
| Joined | `Pregnant`, batch silent; she appears in the batch's 孕检/分娩 stream at the timing the picker row showed |
| Not pregnant (was in batch) | leaves batch → rebreed watch; `no batch` only after the service window lapses unclaimed (§06d between-batches rule, check-in:769–773: a watched station is not an orphan) |
| Unclear | `Recheck · in 3 d` trail; resurfaces on the recheck day |

### 2c · Return-to-heat (ad-hoc) — drawer

Same record as the 返情检查 task mark (return-heat.html:36, `886:12500`): **exactly two
radios, no negative** — unmarked is the record of no return. This is the one-field shape,
confirmed.

**Fields → kit**:

| # | Field | Kit | Notes |
|---|---|---|---|
| 1 | Outcome\* | Choice(2) | `Signs of return` — hint `watch · stays in batch` (「有返情迹象，但是还没有返情」) · `Returned` — hint `→ out of batch · rebreed` (「已返情…提交结果后，会被移出批次」, return-heat:34, 39) |

Production's 巡检 counterpart is the third 发情 sheet (`251:636`/`430:1057`): its 仅记录发情
maps to `Signs of return` (an observation, no consequence), its 确认返情 to `Returned`. The
**acknowledgement checkbox** 「我已知晓，并确认该猪只将从当前批次中移出。」 that gated 提交
(part-c1:243–246, 502–503) is subtracted: the consequence hint sits on the option at the
moment of decision (the D2 pattern), the commit is deliberate, the mark is undoable and
audited — return-heat.html:92 already ruled the sibling 我已知晓 "ceremony — the summary
*is* the acknowledgment". Flagged as a decision in Q4. Container: 1 field → **drawer**. ✓

**Post-commit row**: `Signs` → state unchanged, amber signs chip + trail (`signs 10h ·
G.H`), stays in batch. `Returned` → `Returned · just now` / `parity 3`; stamp carries its
consequence `out of batch · rebreed queued` (return-heat.html:148, Δ1); `no batch` prints
only when the service window lapses with nothing claiming her (§06d).

### 2d · Abortion 流产 — drawer, Single

Decisions already taken in pig-actions.html stand: gated to **bred or pregnant, not yet
farrowed** (line 192), **never bulk** (line 142 — each abortion has its own cause and
restructures a batch), cause required.

**Fields → kit**:

| # | Field | Kit | Notes |
|---|---|---|---|
| 1 | Cause\* | Choice(6 causes) | composition row components:668; production `2572:19676` (6 chips). Tension with the kit's "never more than four — a fifth is a picker" (components:623) — Q1 |
| 2 | ↳ Note\* | Note, conditional, **required** iff cause = Other | the canonical conditional (components:658 names it) |

**Consequence is derived, printed as the sheet's footnote**, collapsing production's two
variants (`262:960` / `262:1012`):

- in a batch → `out of batch · status → empty` (「该猪只移出当前批次。」「生产状态更新为
  "空怀/后备"。」)
- no batch → `status → empty` (「生产状态更新为"空怀"。」)

Both acknowledgement checkboxes die with the same reasoning as 2c. Production's 巡检 forms
captured *nothing*; the task-side cause schema is the survivor — one record, two doors.
Container: 2 fields → **drawer**. ✓

**N>1**: absent from the sheet; the not-available line reads `abortion — one at a time`
alongside any state-blocked verbs (`not bred` · `already farrowed`).

**Post-commit row**: state → `Empty · day 0` with trail `aborted just now · G.H`; out of
batch; rebreed watch applies before `no batch` ever prints. The abortion, its cause, and
the batch exit live on her page trail.

---

### The batch-picker sub-sheet — one component, two parameterizations

Field 2/3's Picker (kit: "returns exactly one record; opens a sheet with search; empty
state reads Select", components:641–644). Production built it three times (part-c1
ambiguity 5); ours is one sheet, parameterized by the filter. The 选择生产线 wheel is
**merged in as a scope control** — pen-count.md row 17: "a modal wheel with two buttons for
one single-select field is ceremony. KEEP the scoping rule."

```
┌─────────────────────────────────────────┐
│                 ▁▁▁▁                    │  grab
│  Join batch                 [Line 1 ▾]  │  ← line scope chip (pen-count #17);
│                                         │    tap = inline single-select, no wheel,
│  ┌───────────────────────────────────┐  │    no 取消/确认
│  │ 🔍  批次号                         │  │  ← search, scoped to the line
│  └───────────────────────────────────┘  │    (575:1965 「只能搜到所选的生产线里的批次」)
│                                         │
│  ○  批次 20        ◐ 孕检 · 进行中       │  ← radio rows: batch + timing state,
│  ○  批次 21        🕐 孕检 · 3天后 开始   │    production's own grammar (479:1867 /
│  ○  批次 22        🕐 孕检 · 2天后 开始   │    473:3366)
│                                         │
│  仅可选择配种任务已完成且分娩任务          │  ← the filter rule, printed once as the
│  未完成的批次                            │    sheet's scope footnote (04 footnote slot)
└─────────────────────────────────────────┘
   tap a row → selects, dismisses, the record sheet's field reads  批次20 · Line 1
   (no 确认 — pen-count #16: "there is no confirm step")
   empty search → 未搜索到"批次99"  (479:2251)
   re-tap the filled field → re-opens to change (575:2001)
```

| Opened from | Filter (verbatim, typo corrected) | Rows show |
|---|---|---|
| Heat | 「仅可选择配种任务**进行中或尚未开始**的批次。」 (`479:2165`) | `配种 3天后 开始` / `配种 2天后 开始` / `配种 进行中` |
| Pregnancy result | 「仅可选择配种任务已完成并且分娩任务**未**完成的批次。」 (`473:3366`; 「为完成」→「未完成」 per ambiguity 1) | `孕检 3天后 开始` / `孕检 2天后 开始` / `孕检 进行中` |

No scan affordance: the kit's scan is for resolving *pigs*; a batch is not scannable.
Whether the line scope is a hard filter or a soft default with the line as a trailing token
on globally-searched rows is pen-count open question 7 — inherited here (Q6).

---

## 3 · Subtraction — the 意外妊娠 chain, screen by screen

Production: **sheet → 选择批次 → 选择生产线 → toast** (4 screens, 2 gated 提交/确认 buttons,
1 modal wheel). Ours: **one drawer + one sub-sheet, zero toasts**.

| # | Production element (node) | Fate | Where it went |
|---|---|---|---|
| 1 | 生产 drawer tile 意外妊娠 (`782:2232`), disabled on multi-select (`853:2119`) | CUT | Verb-sheet pill `Pregnancy result` on the Production strip; arity **Bulk** (product-model:125) |
| 2 | In-batch tile disable (`420:2159` 「属于批次 → "意外妊娠"按钮禁用」) | CUT | Verb stays available for any eligible female; the join field is conditionally *absent* when she is watched — the conflict the gate protected against is now structural |
| 3 | Segmented 仅记录妊娠 / 加入到批次 (`260:556`/`473:3291`) | CUT | The optional Picker's empty/filled state *is* the choice — an unfilled `No batch` field is record-only (components:997: one verb with a field) |
| 4 | Miscopied card 「查情任务外标记发情」 + body (ambiguity 2) | CUT | Nothing replaces it; consequence hints on the Choice options say what the card tried to |
| 5 | Outline CTA 选择批次 → relabel 生产线1 - 批次20 | MERGE | The Picker field's value slot: `Select` → `批次20 · Line 1`; re-tap to change (`575:2001`) |
| 6 | 选择批次 bottom sheet with gated 确认 (`473:3366`/`580:2097`) | MERGE | The batch-picker sub-sheet; 确认 CUT — tap commits and dismisses (pen-count #16) |
| 7 | 选择生产线 wheel + 取消/确认 (`473:3447`) | CUT | Line = scope chip inside the picker header (pen-count #17); scoping rule `575:1965` kept |
| 8 | Filter copy 「…分娩任务为完成…」 (typo, 2 of 3 frames) | FIX | 「未完成」, printed once as the picker's scope footnote |
| 9 | 提交 disabled until batch chosen | CUT | The Picker is optional; commit is never blocked — record-only is legal |
| 10 | ⚠「该猪只将不会自动加入到任何批次。」 warning bullet | MERGE | The empty Picker's caption *and* the row's standing `no batch` token (§06d) — the warning becomes a persistent fact instead of a dismissed sentence |
| 11 | 操作结果 toast 「操作成功」 (`473:3469`) | CUT | The walk never loses its place (components:999): row updates where it sits — `Pregnant · … · no batch` or her appearance in the batch's 孕检 stream is the feedback (pen-count #20) |

The same subtraction runs for Heat's join (its full-page picker `479:2165` with the wrong
分娩 header, ambiguity 4, dies into the same sub-sheet) and for 流产's variant pair
(membership branch → derived footnote; ack checkboxes → consequence hints). Three picker
patterns become one component; four 发情 sheets become one; eleven toast nodes become zero.

---

## 4 · Open questions

1. **Abortion Choice(6) vs the kit's own rule.** components:623 says "never more than four —
   a fifth is a picker"; components:668 and production `2572:19676` say six causes. Chips
   that wrap, a kit exception for cause sets, or Picker(cause)? Also: the six cause labels
   themselves are enumerated in no doc we hold — pull them from node `2572:19676`.
2. **Pregnancy result for gilts.** Production `420:2128` allows 意外妊娠 for
   空怀/后备/成长期; this spec follows it (a pregnant gilt is the paradigm unexpected
   pregnancy). The §05 gilt specimen shows only `Heat` and counts `4 not available` —
   if Pregnancy result is among the four, a pregnant gilt has no verb. Components slide
   needs an erratum or this table needs a tighter gate.
3. **Bulk join with a mixed selection.** N pigs, some watched, some not: does the join
   field reveal scoped to the unwatched subset (with the Law-3 blocked list at commit), or
   stay absent unless all N are unwatched? Law 3's partial-eligibility grammar covers
   commit, not reveal.
4. **The acknowledgement subtraction.** Batch-removal checkboxes (`430:1057`, `262:960`
   「我已知晓…」) are replaced by consequence hints + deliberate commit + undo. Confirm the
   product-wide undo window exists as assumed (return-heat.html:118 "undo window applies");
   if it does not, the checkbox question reopens for `Returned` and Abortion.
5. **Recheck default source.** Pregnancy's `Unclear → recheck in 3 d` reads from task
   config (pregnancy-check D1). The ad-hoc door may fire for a sow in no batch — which
   config supplies her default?
6. **Line scope: hard or soft.** `575:1965` as hard filter vs global batch search with the
   line as a trailing token — pen-count open question 7, unresolved, inherited by this
   picker.
7. **Pregnant with no mating date.** Record-only unexpected pregnancy has no `day n` to
   print (§06d line 1 wants state + day) and no farrowing forecast. Capture an estimated
   stage (a Scale? a Measure in weeks?), or accept `Pregnant · —`? Production captured
   nothing.
8. **The `850:2000` "watched" test at task granularity.** An empty sow inside her service
   window is watched by heat-check (no `no batch`, §06d) — does that watch also suppress
   the join field on an ad-hoc Heat, or does "her batch still has 查情/配种/分娩/断奶"
   read batch tasks only? Decides whether a just-weaned sow found cycling can be joined to
   a *different* batch from the sheet.
9. **48-hour heat expiry scope.** Stated only in the no-batch variant (`420:1730`;
   part-c1 ambiguity 12). Does the mark expire when she joined a batch, or does the 配种
   task consume it?
10. **流产 status target name.** 「空怀/后备」 (`262:960`) vs 「空怀」 (`262:1012`) — one
    transition, two names (part-c1 ambiguity 7). Pick one for the footnote and the row.
