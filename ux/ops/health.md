# Health ops — Add condition · Resolve · Triage · Treatment

The 健康 cluster of the verb sheet, consolidated from production Part D
(`ux/inspection/part-d.md`, fileKey 4GZGPBauEOWQQjnRrzoUgF) onto the system in
`components.html` §04 (record-sheet shell + field kit), §05 (entrance, arity), §07 (detail
grammar) and `check-in.html` 06d–06f (row, triage-dot, case-vs-characteristic). 上报死亡 is the
fifth production tile (853:2144) but is a **Conveyor** with per-pig payload
(product-model §4) — its spec is separate; it appears here only where the four verbs borrow
patterns it proved (three-level checkbox hierarchy, per-item counts).

Laws in force, restated once: every sheet's one primary commits — no Submit ceremony, no
confirm dialog, no result screen; ≤2 actions per bar; fields stacked, never columns, except
the dose+unit pair; conditional reveal inline, >2 reveals = composite; every token
self-describing; the zero rule (nothing prints "normal"); the catalogue classifies
case-vs-characteristic, never the farmer (check-in 06f L841); 移除 = correction ("this was
never true") and 康复 = outcome ("this is no longer true") are different verbs with different
record consequences (product-model Q4 L246). Container rule: judgment sheet ≤~5 fields =
drawer; more fields, any conveyor, or a composite/review = full page — this resolves the
"drawer/page line" left open in components.html 05 (L1007).

---

## 1 · Production inventory

Scope: the four verbs + their shared sub-screens. All nodes from part-d.md; quoted 中文 is
production's own rule text.

| Node | Screen | Captures / rule (verbatim where load-bearing) | part-d |
|---|---|---|---|
| 853:2120 | 子功能-健康 sheet | 5 tiles over the unit list; selection made behind it (`已选 20 头`); no scan affordance in the cluster; row-1 label `#4B5468` vs `#26292E` (disabled-or-slip, unresolved) | L48–79, L459 |
| 272:3354 / 272:3480 | 添加疾病（多头猪）/ 添加症状（一头猪） | Tabs 疾病/症状; grouped accordion, leaf = name+ⓘ+checkbox; no search; footer counter counts **across both tabs** (`已选择 1 种疾病，1 项症状`), hidden at 0; `下一步` gates ≥1. Single-pig variant differs only in subject header (no chevron) | L83–116 |
| 439:2766 | 添加疾病-二次确认 | Review cards: A `已选 10 头猪 >`; B `健康分诊等级` with distribution tags `紧急治疗 × 2 · 优先干预 × 1 · 常规观察 × 200` + chevron→854:2369 override for whole batch; C condition chips (unlabeled kind-mix, contradicts own counter — ambiguity 3); photos `最多可上传 12 张照片`; footer 上一步/提交 | L118–144, L467–472 |
| 587:2774 | 已选猪只列表 | Read-only roster grouped by pen; `No ID Pigs × 1` rows prove ops target counts; designer note `显示疾病症状，没有就不显示` ("show disease/symptoms; if none, don't show"); **cannot deselect** | L146–167 |
| 854:2369 | 选择健康分诊等级 | Bottom sheet, radio ×4 (紧急治疗/优先干预/常规观察/健康), every description the placeholder `这里是健康分诊等级的描述`; footer 取消/确认 | L169–188 |
| 591:3550 → 272:3561 → 272:3851 → 272:3674 | 移除疾病/症状 | Condition-major list scoped to what the selection carries, rows carry `× n` chips (`猪流感 × 10`); 3-stage gate: tick rows → press `移除` **or** `康复` → rows re-render as tags `✓ 康复 (2)` / `🗑 移除 (2)` and leave the pool → `提交` enables only on ≥1 tagged. One submission may carry both verdicts. **"You cannot pick *which* of the 10 pigs gets the disease removed"** — no per-pig granularity | L191–222, L236–237 |
| 124:583 | 更新标记 confirm | `确认更新 12 头猪只的疾病/症状标记吗?` + free text `更新标记原因（选填）` | L223–228 |
| 591:3991 | Leave guard | `离开此页面后，已填写的内容将不会保存，确认离开吗?` — only flow in the cluster with one | L230–233 |
| 286:873 / 286:936 | 调整健康分诊等级 + confirm | Full page, same 4-level radio, single 提交; confirm `确认将 12 头猪只的健康分诊等级调整为"健康"吗?`; no reason/photo/note — "a bare state write" | L241–256 |
| 286:1027 / 286:1017 | 治疗 + confirm | 7 fields: 药物\*, 品牌（剂型）, 治疗方式\*, 剂量\* (free text), 剂量单位\*, 目标疾病, 目标症状; no photo, no note, no date; confirm `确认对 12 头猪只进行治疗吗?` | L260–283, L303 |
| 1477:1712 / 1477:1827 / 1482:2083 | 选择目标疾病/症状 + empty | Drawer **scoped to conditions the selected pigs already carry**, `× n` = pigs affected; select-all header `共 10 种疾病`; no confirm footer (ambiguity 6); `抽屉最大高度1462px 屏幕高度的90%` / `最小高度406px 25%`; empty `暂无记录症状` | L285–301, L478–480 |
| 643:2798 · 1477:1706 · 1482:2076 | 操作结果 | Byte-identical `操作成功` toasts; no undo, no partial-failure state | L449–451 |

Production rules worth keeping verbatim: photos max 12 (439:2766); target scoping to carried
conditions with affected-pig counts (1477:1712); one submission may mix 移除 and 康复
verdicts (272:3674); group rows select a count via stepper —
`勾选单条数据时，若为无ID猪只，需立即填写无ID猪只数量` (check-in.html L781).

---

## 2 · Shared decisions (all four verbs)

**Entrance.** All four are tiles on the verb sheet's HEALTH strip — `Condition · Treatment ·
Triage · Resolve · (Death)` — raised by selection (components 05 L798–804, L875–882). Same
sheet at N=1 (⋯ on her page) and N=200; only the record sheet's subject header changes
(04 shell rule, L612). Production's 853:2120 drawer, its 占位 slots and its icon slips
(minus glyph on *Add*, one `vital_signs` glyph on three tiles — part-d ambiguities 1–2)
dissolve into the tile grammar: one word + one glyph per verb, blocked verbs omitted and
accounted for in the `n not available ›` line (05 L934).

**Arity: all four are Bulk** (product-model §4 L136–139; 05 arity L982). One payload, N
records — except Resolve, whose *review* is per-pig × per-condition while its *verdict
vocabulary* stays one payload-shape (§4 below).

**The N is always inspectable and still editable.** Every sheet's subject header reads
`N pigs · selected`, and `view ›` filters the live list to the selection — same screen, live
checkboxes (check-in 06b L705). This replaces 587:2774 and fixes its defect: production's
roster **cannot deselect**; ours is the selection.

**Group rows** (un-identified populations): ticking asks *how many* via the inline stepper;
the verb receives a count, not identities. Health state on a group is a **count-case
ledger** — the row already prints it (`38 pigs · 2 under treatment`, check-in L780). Each
verb's group handling is specified per verb below; the common rule: **writes land on the
group's count-cases; identity is never invented, and scan can never reach them** (check-in
06d L781).

**No confirm dialogs, no toasts, no leave guards.** The drawer *is* the review (its field
values carry the counts production put on a confirm screen); the primary is self-describing
(`Record · 12 pigs`); the receipt is the row updating where it sits — "the walk never loses
its place" (05 L999). Cuts: 439:2766, 124:583 (dialog), 286:936, 286:1017, 591:3991, all
four 操作成功.

**Catalogue sheets** (opened by Multi-picker fields): categories, **search always** (production
had it only in the death picker — ambiguity 7), ⓘ definition per row, per-item counts, ticks
commit live, ✕ closes (resolves ambiguity 6 — nothing pends). Drawer geometry keeps
production's tokens: max 90% / min 25% of screen (part-d L298–301).

---

## 3 · Per-verb specs

### 3.1 Add condition （添加疾病/症状）

**Fields (04 kit)** — 4 fields, one sheet; production's picker-step → confirm-step staging
collapses into it.

| Field | Kit | Req | Notes |
|---|---|---|---|
| Diseases | Multi-picker | ≥1 across both | value `2 selected`; catalogue sheet: disease taxonomy groups (呼吸系统/胃肠道/…), search, ⓘ |
| Symptoms | Multi-picker | ≥1 across both | separate field = the kind distinction production lost in its mixed chips (ambiguity 3, 5) |
| Triage | Choice(3) | preset Monitor | Hospital pen `→ move list` / Treat in place `→ treat list` / Monitor `watch` (check-in 06e L806–810) |
| Photos | Photos | no | max 12 kept (part-d L135); attach to the event, not the animal (04 kit L654) |

**Container: drawer.** 4 fields, no conditional reveal — under the ≤5 line. Primary
`Record · 12 pigs`, disabled at 0 conditions (production's ≥1 gate, L108, kept).

**N=1 vs N>1.** Identical body; header `A2 · 000254 · parity 3` vs `12 pigs · selected · view ›`
— production already proved the single/bulk variant is header-only (272:3480, L112–114).

**Already-carrying pigs.** The catalogue sheet's per-item count answers it *before* the tick:
a row some of the selection already carries reads `Fever · open on 3 of 12`. Commit is
idempotent for carriers — no duplicate case, their day count keeps aging from the original
start; the footnote states the subtraction: `fever already open on 3 · their day count keeps`.
Nothing blocks — an add that is a no-op for 3 of 12 is still the right act for 9.

**Triage inline, distribution cut.** Production put a current-distribution card + override
drawer inside the add flow (439:2766 card B). Here triage is one Choice on the sheet — the
mark the case opens with. The *distribution* belongs to the Triage verb (§3.3); on Add it is
noise: these are new cases. Default Monitor because a case must hold a level and an
untouched add means "watching" — no null level exists (06e: healthy is not a level either;
absence of a case is).

**Group rows.** Payload applies to the ticked count: `Scours` added to `5 of 38` writes
`scours ×5` to the group's ledger; the group row's line 1 re-aggregates.

**Case vs characteristic.** The farmer picks from one catalogue; the entry's class decides
what gets written (case with day count vs characteristic on her page) — no toggle, per 06f
L841. Primary stays `Record`, not "Open case", because a hernia records without opening one.

```
┌──────────────────────────────────────┐
│ ▁▁▁  (grab)                          │
│ 12 pigs · selected          view ›   │
│ Diseases            2 selected  ›    │
│ Symptoms                 None   ›    │
│ ◉ Monitor                watch       │
│ ○ Treat in place    → treat list     │
│ ○ Hospital pen      → move list      │
│ Photos   [▣][▣][ + ]                 │
│ [        Record · 12 pigs        ]   │
│  fever already open on 3 · day keeps │
└──────────────────────────────────────┘
```

### 3.2 Resolve （移除/康复） — the review model

**The problem.** Each selected pig carries *different* open conditions; one payload cannot
fit. Production solved it condition-major (`猪流感 × 10` + tick + tag), which has **no per-pig
granularity** — "the verdict applies to every pig carrying it" (part-d L236–237). The product
owner's ask is the inverse: *"a detail screen of all the pigs selected."*

**The model: a pig-major verdict page.** One line per **pig × open condition**, grouped by
pen, in the 06d row grammar (words left, mono trail right — also 07's fact line). Each line
takes one of two verdicts:

- **Recover (康复)** — the big left target, a checklist tick (04 kit Checklist). The default
  verb; the walk's normal act. Writes a *recovery*: case closes, day count stops, history and
  KPIs keep it.
- **Strike (移除)** — a small 34px `✕` on the right rail. The exception. Writes a
  *correction*: the record is struck as never-true — excluded from history lines and KPIs,
  retained for audit. The row renders struck-through grey.

The asymmetry of the two targets **is** the distinction — outcome is cheap and central,
correction is deliberate and peripheral — so one screen carries both verbs without doubling,
exactly as production's one submission carried both tags (272:3674), minus its 3-stage
tick→tag→submit machine.

**Anatomy** (existing components only):

| Zone | Component | Content |
|---|---|---|
| Header | 04 subject header | `12 pigs · selected · view ›` |
| Master row | select-all header (production's own, 1477:1712 `共 10 种疾病`; death batch 290:1639 hierarchy) | `☐ Recover all · 9 open conditions` — governs ticks only; struck lines stay struck |
| Body | pen-grouped cards (06/06b) of checklist lines | tag prints once per pig; line = `[✓] condition · day n  |  trail [✕]` — the trail (`treated 3d`, `feed +10%`, escalated chip `40.6°`) shows what closing it stops |
| Conditional | Note, amber-ruled, sheet-level | appears when ≥1 strike: `↳ struck 1 · reason (optional)` — production's `更新标记原因（选填）` survives as this reveal, its dialog dies |
| Bar | one primary | `Recover 7 · strike 1`, disabled at 0 verdicts |
| Footnote | audit line | `3 of 12 selected · nothing open` — the zero rule keeps their rows off the page, the footnote keeps the subtraction honest (Law 3, partial visibility) |

```
┌──────────────────────────────────────┐
│ ← Resolve                            │
│ 12 pigs · selected          view ›   │
│ ☐ Recover all · 9 open conditions    │
│ ── PEN C3 ─────────────────────────  │
│ 001479 ☑ Lame · day 4   treated 2d ✕ │
│ 001503 ☑ Fever · day 6  treated 3d ✕ │
│        ☐ Scours · day 2          — ✕ │
│ 000287 ☒̶ ̶F̶e̶v̶e̶r̶ ̶·̶ ̶d̶a̶y̶ ̶1̶  struck    ↺ │
│ ── PEN D4 ─────────────────────────  │
│ 38 pigs ☑ Scours ×12  [− 12 +]     ✕ │
│ ↳ struck 1 · reason (optional)       │
│ [ ......................... ]        │
│ [     Recover 7 · strike 1       ]   │
│   3 of 12 selected · nothing open    │
└──────────────────────────────────────┘
```

**Recover-all shortcuts.** Two, both existing patterns: the master row (whole selection) and
the pen-group header tick (that pen's lines) — production's own three-level hierarchy from
290:1639. Condition-major shortcuts ("recover fever everywhere") are **cut**: with per-line
ticks, N-of-selection carrying one condition is N taps or one master tick, and the
condition-major screen only existed because production lacked the per-pig view. The mass
case ("the whole pen is over scours") is a group row anyway — one line, one tick.

**Container: page at N>1** (a per-pig review is a composite-shaped surface; the working rule
sends any review/composite to a page). **Drawer at N=1**: her 1–3 open-condition lines +
conditional Note is a judgment sheet ≤5 fields — exactly the composition-table row
`Checklist(her open conditions, per-item verdict) · Note when mis-entry` (components 04
L672). Same line grammar in both; the page is the drawer's body repeated per pig.

**What never appears.** Characteristics — hernia, blind eye — do not resolve; they end by
correction *on the record* from her page (06f L838, 07 L1075 "records act"). The line list
is open **cases** only. Resolving a `Thin` case ends its feed-plan treatment — the trail
(`feed +10%`) says so at the moment of the tick (06d L784–787).

**Group rows.** A group's count-case resolves by count: line `38 pigs · Scours ×12`, tick =
all 12 recovered, with an inline stepper reveal to lower it (`recovered 8 of 12`); strike
works the same for count corrections. Default full count — the common case is "the pen is
over it".

**Cuts from production's flow**: the 疾病/症状 tabs (lines carry their kind), the ×n count
chips as the *only* granularity (each carrier is now a line; counts survive only on group
lines), the 3-stage gate, 更新标记 dialog, leave guard 591:3991 (one screen, ticks cost
seconds to redo), 操作成功.

### 3.3 Triage （调整分诊等级）

**Fields.** One: Choice(3) — Hospital pen / Treat in place / Monitor, with consequence hints
(`→ move list` / `→ treat list` / `watch`). Production's 4-level scale maps 紧急治疗→Hospital
pen, 优先干预→Treat in place, 常规观察→Monitor; **健康 is cut** — healthy is the absence of a
case, and the way "back to healthy" is written is Resolve, not a triage level (06e L810).
Euthanize is the Cull verb (06e L809). Production's level descriptions were all the
placeholder `这里是健康分诊等级的描述` (L184); 06e's means/offers column is the operative copy
until vet definitions land (product-model Q5).

**Container: drawer.** One field. Primary self-describing: `Mark 6 · hospital pen`. No
confirm (`确认将 12 头猪只…调整为"健康"吗?` 286:936 — cut).

**Distribution: keep, compressed, and only when it warns.** Production's
`紧急治疗 × 2 · 优先干预 × 1 · 常规观察 × 200` tags (439:2766 card B) become one mono line
under the subject header — `now marked: hospital 2 · treat 1` — printed **only when the
selection already carries marks**, because that is when one level for all N destroys
information (an overwrite of someone's hospital mark must be seen). No marks → no line
(zero rule). This is record-sheet context ("what makes an entry safe", 05 L928), not
verb-sheet state.

**N=1 vs N>1.** Identical; one level applied to all is the verb's meaning (Bulk).

**Gating.** Triage re-levels open cases; the dot model ties every dot to a case (06e L808).
So the tile appears only when ≥1 selected subject has an open case; selected pigs with
nothing open are excluded and the footnote counts them (`2 of 8 · nothing open · not
marked`). "Urgent pig, no condition recorded yet" is the Add-condition sheet's job — its
inline triage Choice exists precisely so that path is one act, not two.

**Group rows.** Marks land on counts: `hospital ×3` on the group ledger; the hospital move
list carries `3 heads · pen D4`.

```
┌──────────────────────────────────────┐
│ Triage                               │
│ 6 pigs · selected           view ›   │
│ now marked: hospital 2 · treat 1     │
│ ◉ Hospital pen      → move list      │
│ ○ Treat in place    → treat list     │
│ ○ Monitor                watch       │
│ [     Mark 6 · hospital pen      ]   │
│  2 of 8 ticked · nothing open        │
└──────────────────────────────────────┘
```

### 3.4 Treatment （治疗）

**Fields** — production's 7 kept intact (286:1027, L271–279), mapped:

| Field | Kit | Req |
|---|---|---|
| Drug 药物 | Picker | \* |
| Brand · form 品牌（剂型） | Picker | |
| Method 治疗方式 | Picker | \* |
| Dose 剂量 + Unit 剂量单位 | Measure + Picker, **the one sanctioned pair** | \* both |
| Target disease 目标疾病 | Multi-picker, scoped | |
| Target symptom 目标症状 | Multi-picker, scoped | |

**Container: page.** 7 fields — the named example of the working rule, and the most-used
sheet in the product (05 L1007). Primary `Record for 12 pigs`. Already rendered as the
"maximum" proof at components.html L706–727; this spec adopts it as-is.

**Target scoping — the rule: UNION with per-target carrier counts.** The target catalogue
sheets list the union of open conditions across the selection, each row labelled
`Fever · 4 of 12` (production's `× n` chips, 1477:1712, upgraded to a fraction so the
subtraction is visible). Intersection is wrong: it goes empty the moment the selection is
heterogeneous, and a broad treatment legitimately targets the union. On commit **the drug
payload goes to all N; each target link attaches only to the pigs whose case it is** — the
page footnote states it (`targets scoped to open conditions · fever links to its 4`, already
drawn at L724). Select-all header kept (`共 10 种疾病`).

**When conditions differ** this is the whole answer: the farmer sees the union, the
fractions say who carries what, and no pig gets a case link she doesn't have.

**When nothing is open** the two target fields are **absent, not empty** (zero rule — same
move as omitted verbs). Production's `暂无记录症状` empty drawer (1482:2083) dies with them.
A target-less treatment on healthy pigs is legal — prophylaxis and vaccination.

**No date field, on purpose** (ambiguity 15): the event carries recorded-at + person like
every event; `treated 3d` trails derive from it — the "smallest high-value data change"
flagged at check-in 06d L767. Administered-at ≠ recorded-at (backdating) stays out of scope.

**Group rows.** Payload applies to the ticked count; the group's `n under treatment` trail
increments; group count-cases join the target union (`Scours · 12 of 43`).

**N=1 vs N>1.** Identical page; header only. Production's two treatment designs were already
merged on this rule (pig-actions.html §2 L80).

---

## 4 · Subtraction table

| Production element (node) | Verdict | Why |
|---|---|---|
| 子功能-健康 drawer 853:2120 | MERGE | Becomes the verb sheet's HEALTH strip; gating by the pigs, blocked verbs omitted (05) |
| Row-1 colour slip · minus-glyph on Add · one glyph ×3 (853:2132) | CUT | Moot under tile grammar: one word + one glyph per verb |
| 48×48 占位 slots (853:2125, 272:3400, 1477:1717) | CUT | Unused placeholders |
| 疾病/症状 segmented tabs (583:2703) | CUT | Two Multi-picker fields carry the kind; fixes the unlabeled mixed chips of 439:2766 (ambiguity 3/5) |
| Cross-tab footer counter `已选择 1 种疾病，1 项症状` | CUT | Field values (`2 selected`) carry the counts |
| `下一步` → 二次确认 staging (272:3354→439:2766) | CUT | The drawer is the review; one primary commits |
| Confirm card B triage distribution + override drawer chevron | MERGE | One conditional mono line on the **Triage** sheet (`now marked: …`); cut from Add entirely |
| Photos max 12 hint (587:3130) | KEEP | Kit limit, quoted `最多可上传 12 张照片` |
| 已选猪只列表 587:2774 | MERGE | `view ›` filters the live list; fixes read-only-roster defect (cannot deselect) |
| `显示疾病症状，没有就不显示` (587:2774 note) | KEEP | It is the zero rule, stated by production's own designer |
| 选择健康分诊等级 854:2369, 4 levels + 取消/确认 footer | MERGE | Choice(3) inline; 健康 level cut (absence of a case), euthanize→Cull; footer dies (commit-on-primary) |
| Remove screen 3-stage machine (tick→tag→提交, 591:3550…272:3674) | CUT | Per-line direct verdicts; mixed verdicts in one commit kept |
| Condition-major `× n` chips as the only granularity | MERGE | Per-line pig×condition rows; counts survive only on group-row lines (stepper) |
| 更新标记 dialog 124:583 | CUT | Dialog dies; its optional reason survives as the sheet-level Note reveal on strike |
| Leave guard 591:3991 | CUT | One screen, cheap ticks; no leave guards anywhere in the system |
| 调整分诊等级 page 286:873 + confirm 286:936 | MERGE | Drawer, 3 levels, self-describing primary; confirm cut |
| Treatment form 286:1027 (7 fields, required set) | KEEP | Verbatim field set and requiredness; container = page |
| Free-text dose (`请输入剂量`) | MERGE | Measure (numeric) + Unit picker pair; validation still open (Q3) |
| Target drawers 1477:1712/1827 scoping + `× n` + select-all | KEEP | Upgraded to `n of N` fractions; ticks commit live, ✕ closes (fixes no-footer ambiguity 6) |
| Drawer height tokens 90% max / 25% min | KEEP | System drawer geometry |
| Empty target drawer `暂无记录症状` 1482:2083 | CUT | Fields absent when nothing open |
| Treatment confirm 286:1017 | CUT | Commit-on-primary |
| 操作成功 toasts ×4 (643:2798 …) | CUT | The updated row is the receipt; the walk never loses its place |
| Search only in death picker (290:1352) | MERGE | Search in every catalogue sheet |
| ⓘ per catalogue row | KEEP | Definition drawer; content console-authored |
| No-scan-in-cluster (L452) | KEEP | Scan lives on the list; selection precedes the verb |

---

## 5 · Open product questions

1. **Strike semantics** — confirm 移除 = audit-retained but excluded from history lines and
   KPIs (mortality/morbidity, day counts). Blocks the event store (product-model Q4).
2. **Triage vet definitions** — 06e's operational copy stands in; real level semantics still
   unwritten (production shipped placeholders; product-model Q5). Also confirm the gate:
   no standalone triage without an open case.
3. **Dose: per head or total?** Proposed per-head (`Dose · per head` label), needs
   confirmation + unit list + numeric rules (production was free text with none).
4. **Re-add to a carrier** — idempotent no-op proposed; confirm whether the add event should
   attach as a new *observation* (photos!) on the existing case instead.
5. **Mark death with case** — when the last open case resolves while an unexecuted hospital
   mark stands, the mark dies with its case (proposed); confirm nothing needs to survive.
6. **Group count arithmetic** — recovering `8 of 12` on a count-ledger with no identities:
   who reconciles drift when the guessed counts are wrong? Ties into pen-count calibration.
7. **Backdating** — no administered-at field anywhere; recorded-at is the record. Confirm
   acceptable for treatments given before the phone came out.
