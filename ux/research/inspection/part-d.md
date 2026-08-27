# Part D — 健康 (Health operations)

Cluster: the `子功能-健康` (Health sub-function) bottom sheet and the five flows it launches —
add disease/symptom, remove/recover disease/symptom, adjust health triage level, treatment,
death reporting.

fileKey `4GZGPBauEOWQQjnRrzoUgF`. Every claim below traces to a node id.

---

## Screen inventory

| Node | Screen (中文) | English | Purpose |
|---|---|---|---|
| 853:2120 | 子功能-健康 | Health sub-function sheet | Menu of the 5 health actions, opened over the unit pig list |
| 272:3354 | 添加疾病（多头猪） | Add disease (many pigs) | Pick disease(s) for N selected pigs |
| 272:3480 | 添加症状（一头猪） | Add symptom (one pig) | Same picker, 症状 tab, single-pig subject |
| 439:2766 | 添加疾病-二次确认 (h=2000) | Add disease — confirm step | Review selection + triage + attach photos, then submit |
| 587:2774 | 已选猪只列表 (title 猪只列表) | Selected-pig list | Read-only roster of the pigs the operation will hit |
| 854:2369 | 选择健康分诊等级 | Select health triage level | Bottom sheet, radio pick of one of 4 levels |
| 643:2798 | 操作结果 | Operation result | `操作成功` toast |
| 591:3550 | 移除疾病/症状（默认态） | Remove disease/symptom — default | Nothing checked; both action buttons off |
| 272:3561 | 疾病 | (Remove) Disease tab | 1 disease checked → 移除/康复 enabled |
| 272:3851 | 症状 | (Remove) Symptom tab | 2 symptoms checked; 提交 still off |
| 272:3674 | 移除疾病/症状之后 | After remove/recover tagging | Rows carry 康复(n)/移除(n) tags; 提交 on |
| 591:3991 | 返回上一页-二次确认 | Leave-page confirm | Unsaved-data guard |
| 124:583 | 移除/康复 疾病/症状-二次确认 | Update-marking confirm | `更新标记` dialog + optional free-text reason |
| 1477:1706 | 操作结果 | Operation result | `操作成功` toast |
| 286:873 | 调整健康分诊等级 | Adjust health triage level | Full page, radio pick of a level for N pigs |
| 286:936 | 二次确认 | Confirm | `确认将 12 头猪只的健康分诊等级调整为"健康"吗?` |
| 286:1027 | 治疗 | Treatment | 7-field medication form for N pigs |
| 1477:1712 | 选择目标疾病 | Select target disease | Drawer, multi-select from diseases the selected pigs already carry |
| 1477:1827 | 选择目标症状 | Select target symptom | Same for symptoms |
| 1482:2083 | 无疾病/症状 | Empty state | `暂无记录症状` |
| 286:1017 | 二次确认 | Confirm | `确认对 12 头猪只进行治疗吗?` |
| 1482:2076 | 操作结果 | Operation result | `操作成功` toast |
| 290:1352 | 选择疾病 (title 添加死亡原因) | Add cause of death — disease tab | Searchable grouped disease picker |
| 290:1422 | 选择症状 (title 添加死亡原因) | Add cause of death — symptom tab | Searchable grouped symptom picker |
| 290:1478 | 已选死亡原因 | Selected causes of death | Review/delete already-chosen causes |
| 290:1515 | 死亡列表（默认态）(h=2400) | Death list — default | Per-pig cause + photo roster, submit |
| 290:1639 | 批量操作：添加死亡原因 (h=2400) | Batch: add cause of death | Selection mode over the death list |
| 290:1793 | 批量操作：上传照片 (h=2400) | Batch: upload photos | Selection mode over the death list |
| 1506:2292 | 二次确认 | Confirm | `有 n/5 头猪只未添加死亡原因，确认要继续提交吗?` |
| 1506:2313 | 操作结果 | Operation result | `操作成功` toast |

---

## 子功能-健康 (Health sub-function sheet) — 853:2120

**Purpose.** A bottom sheet over the unit pig list (单元1). It is the single entry point for all
five health operations; the pig selection is already made on the list behind it.

**Controls.**

| # | Label (中文) | English | Icon node | Icon name |
|---|---|---|---|---|
| 1 | 添加疾病/症状 | Add disease/symptom | 853:2132 | `remove` (a **minus** glyph) |
| 2 | 移除疾病/症状 | Remove disease/symptom | 853:2138 | `vital_signs` |
| 3 | 调整分诊等级 | Adjust triage level | 853:2254 | `vital_signs` |
| 4 | 治疗 | Treatment | 1445:3291 | `vital_signs` |
| 5 | 上报死亡 | Report death | 853:2144 | `skull` |

- Sheet header `健康` (Health) + `✕` close (853:2127). Left of the title is a 48×48 `占位`
  (placeholder) rect (853:2125) — an unused slot.
- Sheet geometry: drawer 853:2123 sits at y=1112, height **512** of a 1624 frame. 4-column grid,
  2 rows (853:2129, 686×320); row 2 holds only item 5.
- **Row 1's label is rendered in `#4B5468`; rows 2–5 use `#26292E`.** All five *icons* are
  `#4B5468`. There is no other visual difference (no reduced opacity on the tile). Whether
  添加疾病/症状 is meant to be disabled here, or this is a token slip, is not resolvable from the
  file — see Ambiguities.

**Bulk / scan.** No selection happens in the sheet. The screen behind it shows `已选 20 头`
(20 selected) with an indeterminate master checkbox, pen card `A1` checked, and a search field with
scan + ear-tag icons — i.e. **selection and scanning live on the list screen, not in this cluster.**
No health screen in Part D contains a scan/NFC affordance.

Magenta designer notes visible on the dimmed backdrop (`默认展开` = "expanded by default",
`正常态` = "normal state", `需操作` = "needs action") annotate the **list** screen, not the health
sheet.

---

## 添加疾病/症状 — picker step

### 添加疾病（多头猪） — 272:3354 · 添加症状（一头猪） — 272:3480

**Purpose.** Tick the diseases and/or symptoms to attach to the selected pig(s). Same component,
two subject cardinalities.

**Controls.**
- Nav title `添加疾病/症状` (Add disease/symptom); back arrow; 48×48 `占位` slot top-right (272:3400).
- **Segmented tabs** `疾病` (Disease) / `症状` (Symptom) — 583:2703. Exactly one active.
- **Subject header**
  - N-pig variant (272:3354): `已选 10 头猪` (10 pigs selected) + `>` chevron (587:2766) → 587:2774.
  - 1-pig variant (272:3480): `已选猪只：000001` (Selected pig: 000001), **no chevron, not tappable**.
- **Grouped accordion list.** Group headers are collapsible (`stat_1` = expanded chevron-up,
  `stat_minus_1` = collapsed chevron-down). Disease groups seen: `疾病类型名称` (disease type name —
  placeholder group), `呼吸系统疾病` (Respiratory diseases), `胃肠道疾病` (Gastrointestinal
  diseases), `Reproductive and Neonatal Diseases`. Symptom groups: `症状类型名称`, `综合`
  (General).
- Each leaf row: name + ⓘ info button (opens a definition; target not in this cluster) + checkbox.
  Multi-select, no cap observed.
- **No search field** on this screen (contrast 添加死亡原因 290:1352, which has one).
- **Footer.** Summary line `已选择 1 种疾病，1 项症状` ("1 disease, 1 symptom selected") + `下一步`
  (Next). The summary line is **absent** at zero selections (272:3354) and counts **across both
  tabs**, not just the visible one (272:3480 shows 1 disease + 1 symptom while only a symptom is
  ticked on screen).
- `下一步` gate: disabled `#D6F1E8` at 0 selections (272:3354); enabled `#00A76F` at ≥1 (272:3480).

**Fields.** None — selection only.

**Bulk.** 272:3354 is bulk (N pigs); 272:3480 is single-pig. The only structural difference is the
subject header (chevron vs plain text).

**Annotation.** 272:3480 carries a magenta arrow (no text) drawn from the ticked checkbox down to
the footer summary line — i.e. ticking a row updates the counter.

### 添加疾病-二次确认 — 439:2766 (h=2000)

**Purpose.** Review what will be written, optionally re-set the triage level, attach photos, submit.

**Sections.**
1. `确认信息` (Confirm information) — 587:3129
   - Card A (749:5077): `已选 10 头猪` + chevron → 587:2774.
   - Card B (854:2469): title `健康分诊等级` (Health triage level); coloured count tags
     `紧急治疗 × 2`, `优先干预 × 1`, `常规观察 × 200`; chevron (854:2472) → 854:2369.
     **This card shows the current triage distribution of the selected pigs, and the chevron lets
     you overwrite it for the whole batch as part of the add flow.**
   - Card C (587:3068): `已选 2 种疾病，4 项症状` + 6 name tags: 感冒, 蓝耳PRRS, 猪流感,
     猪支原体肺炎, 巴氏杆菌病, 支气管败血波氏杆菌感染. **No visual separation of disease vs symptom
     tags, and all six read as disease names** (see Ambiguities). No chevron — not editable here.
2. `上传附件` (Upload attachments) — 587:3128
   - Sub-label `照片` (Photos). Thumbnail grid, each with `close-circle-fill` delete; final tile is
     an `add-line` `+` picker (444:1331).
   - Hint row (587:3130) ⓘ **`最多可上传 12 张照片`** — "Up to 12 photos may be uploaded."

**Footer.** `上一步` (Previous, 587:3163) + `提交` (Submit, 439:2821, enabled green).

**Fields.**

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| 健康分诊等级 | drawer radio (854:2369) | not marked | current per-pig levels | overwrite applies to all selected pigs |
| 照片 | image picker, multi | no `*` | empty | max 12 (quoted above) |

### 已选猪只列表 / 猪只列表 — 587:2774

**Purpose.** Read-only roster of the pigs an operation will affect. Reached from every
`已选 N 头猪 >` header.

**Structure.** Grouped by pen: card header `A1` + `共 6 头猪` (6 pigs total); a second card `A2`
`共 6 头猪` follows. Row shapes seen:
- `000001` + pink `vital_signs` pulse icon + disease/symptom text; meta line
  `20₁ | 猪只类型 | 生产状态 | 日龄` (batch | pig type | production status | day-age).
- A row with no badge at all (pig with no recorded disease/symptom).
- `No ID Pigs` + `× 1` count chip + badge `发烧` (fever); meta `20₁ | 650日龄`.
- One `No ID Pigs` row whose meta reads `650日龄（这是没有批次的猪）` — "(this is a pig with no
  batch)".

**Designer placeholder text left in the mock** (treat as spec, not copy):
`显示疾病症状，没有就不显示` — "show disease symptoms; if there are none, don't show [the badge]".

**Controls.** Back arrow only. **No checkboxes, no delete** — this screen cannot change the
selection.

**Bulk.** Bulk by nature; also the place unidentified animals surface (`No ID Pigs × n`), meaning a
health op can target *counts* of un-tagged pigs, not only IDs.

### 选择健康分诊等级 — 854:2369

**Purpose.** Bottom sheet; pick one triage level to apply to the batch.

**The triage scale — 4 levels, ordered most to least severe:**

| Order | 中文 | English | Icon stroke | Icon bg | Tag fg / bg (439:2766) |
|---|---|---|---|---|---|
| 1 | 紧急治疗 | Emergency treatment | `#FF8080` | `#FFF2F2` | `#FF4C4C` / `#FFF2F2` |
| 2 | 优先干预 | Priority intervention | `#FFD073` | `#FFFBF2` | `#FFBF40` / `#FFFBF2` |
| 3 | 常规观察 | Routine observation | `#73D0FF` | `#F2FBFF` | `#40BFFF` / `#F2FBFF` |
| 4 | 健康 | Healthy | `#5CE673` | `#E6FFEA` | — |

All four icons are the same `vital_signs` pulse glyph, tinted. Every row's description is the
placeholder **`这里是健康分诊等级的描述`** ("this is the description of the health triage level") —
level 4 repeats it twice to show two-line wrapping. **No real level definitions exist in the file.**

**Controls.** Header `选择健康分诊等级` + `✕`; radio (single-select) per row;
footer `取消` (Cancel) / `确认` (Confirm). `确认` is disabled `#D6F1E8` with nothing picked.

---

## 移除疾病/症状 (Remove / recover) — 591:3550, 272:3561, 272:3851, 272:3674

**Purpose.** For the selected pigs, mark existing diseases/symptoms as either **移除** (Remove — a
mis-marking, erase it) or **康复** (Recovered — it resolved). Both verbs are handled by one screen
and one submit.

**Controls.**
- Nav title `移除疾病/症状`.
- Tabs `疾病` / `症状`.
- Subject header `已选 10 头猪` + chevron → 587:2774.
- Grouped accordion of only the conditions the selection actually carries. Groups seen: 疾病 —
  `疾病类型名称`, `呼吸系统疾病`, `胃肠道`; 症状 — `症状类型名称`, `综合`.
- Each row: name + ⓘ + **count chip `× n`** (n = how many of the selected pigs carry it, e.g.
  `蓝耳PRRS × 2`, `猪流感 × 10`) + checkbox.
- Footer, three controls: summary line, then a two-up button pair `🗑 移除` / `✓ 康复`, then `提交`.

**Rules (state machine, verified by button colour).**

| State | Node | 移除 / 康复 | 提交 |
|---|---|---|---|
| nothing checked | 591:3550 | disabled `#98A2B2` | disabled `#D6F1E8` |
| ≥1 checked | 272:3561, 272:3851 | enabled `#26292E` | **still disabled** |
| ≥1 row tagged | 272:3674 | disabled again (nothing checked) | enabled `#00A76F` |

- So: tick rows → press 移除 **or** 康复 → the ticked rows' count chip + checkbox are **replaced by
  a green tag** `✓ 康复 (2)` / `🗑 移除 (2)` (272:3674) → repeat for other rows → `提交`.
- 移除 and 康复 are per-row verdicts, not a page mode: one submission can carry both.
- The summary line counts checked items across tabs (`已选择 1 种疾病` on 272:3561,
  `已选择 1 种疾病，2 项症状` on 272:3851).
- Tagged rows drop out of the checkable pool; untagged rows keep their `× n` chip
  (272:3674 row `症状名称/简称 × 2` remains checkable).

**Confirm — 124:583 `更新标记` (Update marking).**
> `确认更新 12 头猪只的疾病/症状标记吗?` — "Confirm updating the disease/symptom marking on 12 pigs?"
- Lists the affected condition names as chips (same 6 as 439:2766).
- **Free-text field, placeholder `更新标记原因（选填）`** — "Reason for updating the marking
  (optional)". Multi-line, ~4 rows tall. Explicitly optional.
- `取消` / `提交`.

**Leave guard — 591:3991 `离开此页面`.**
> `离开此页面后，已填写的内容将不会保存，确认离开吗?` — "After leaving this page the content you
> entered will not be saved. Confirm leaving?" → `取消` / `确认`.

**Result — 1477:1706:** `操作成功` toast.

**Bulk.** Bulk (N pigs). The count chips are the only per-pig granularity — you cannot pick
*which* of the 10 pigs gets the disease removed; the verdict applies to every pig carrying it.

---

## 调整健康分诊等级 (Adjust triage) — 286:873, 286:936

**Purpose.** Set one triage level on the selected pigs, as a standalone operation.

**Controls.** Full page (not a sheet). Nav `调整健康分诊等级`. Subject header `已选 10 头猪` +
chevron → 587:2774. The same 4-level radio list as 854:2369, same placeholder descriptions.
Single `提交` footer button, enabled once a level is chosen (286:873 shows `健康` picked, button
green).

**Rules.** Confirm 286:936:
> `确认将 12 头猪只的健康分诊等级调整为"健康"吗?` — "Confirm adjusting the health triage level of
> 12 pigs to 'Healthy'?" → `取消` / `确认`.
- The confirm string interpolates both the pig count and the chosen level name.
- No reason field, no photo, no note. Triage is a bare state write.

**Bulk.** Bulk. One level for the whole batch — no per-pig variation.

---

## 治疗 (Treatment) — 286:1027

**Purpose.** Record a medication administered to the selected pigs, optionally bound to the
disease(s)/symptom(s) it targets.

**Controls.** Nav `治疗`; subject header `已选 10 头猪` + chevron; single `提交` footer, disabled
`#D6F1E8` in the empty state.

**Fields** (7 rows; `*` presence verified in metadata — nodes 286:1100, 1482:2013, 1482:2021 carry
`hidden="true"` on the asterisk):

| # | Label (中文) | English | Type | Required | Placeholder / value | Node |
|---|---|---|---|---|---|---|
| 1 | 药物 | Drug | picker `>` | **yes** `*` | `请选择药物` | 286:1090 |
| 2 | 品牌（剂型） | Brand (dosage form) | picker `>` | no | `请选择品牌（剂型）` | 286:1097 |
| 3 | 治疗方式 | Route / method of treatment | picker `>` | **yes** `*` | `请选择治疗方式` | 286:1104 |
| 4 | 剂量 | Dose | **free text input** (no chevron) | **yes** `*` | `请输入剂量` | 286:1112 |
| 5 | 剂量单位 | Dose unit | picker `>` | **yes** `*` | `请选择剂量单位` | 286:1118 |
| 6 | 目标疾病 | Target disease | drawer, multi | no | `请选择目标疾病` | 1482:2010 |
| 7 | 目标症状 | Target symptom | drawer, multi | no | shown filled: `已选择 1 项症状` | 1482:2018 |

- Dose has no unit baked in — unit is a separate required picker, so dose is `number + unit` and the
  unit list is not enumerated in the file.
- **No photo upload, no note, no date/time field on the treatment form.**

**Target disease/symptom drawers — 1477:1712 / 1477:1827.**
- Header `选择目标疾病` / `选择目标症状` + `✕`. A 48×48 `占位` slot sits left of the title
  (1477:1717).
- **Select-all header row**: `共 10 种疾病` ("10 diseases in total") / `共 1 项症状` with a master
  checkbox.
- Rows: name + ⓘ + `× n` count chip + checkbox. **The list is scoped to conditions the selected
  pigs already carry** (`× n` = pigs affected) — it is not the global catalogue. This is how
  treatment links to disease/symptom: you can only target what is already recorded.
- **The drawers have no 确认/取消 footer** — only the `✕`. Content frame 1477:1720 is 1496px tall
  inside a 1462px drawer, so the list scrolls with nothing pinned below it.
- Empty state 1482:2083: `暂无记录症状` — "no symptoms recorded yet".

**Annotations (verbatim, magenta):**
- 1477:1909 (on 选择目标疾病): **`抽屉最大高度1462px 屏幕高度的90%`** — "Drawer max height 1462px,
  90% of screen height."
- On 1482:2083 (无疾病/症状): **`抽屉最小高度406px 屏幕高度的25%`** — "Drawer min height 406px,
  25% of screen height."

**Confirm — 286:1017:** `确认对 12 头猪只进行治疗吗?` — "Confirm treating 12 pigs?" → `取消`/`确认`.
**Result — 1482:2076:** `操作成功`.

**Bulk.** Bulk. One drug/dose/route for the whole batch.

---

## 上报死亡 (Report death) — 290:1515, 290:1639, 290:1793, 290:1352, 290:1422, 290:1478, 1506:2292, 1506:2313

### 死亡列表（默认态） — 290:1515 (h=2400)

**Purpose.** The death-report worksheet: every pig marked dead, each with a cause and optional
photos, submitted in one go.

**Controls.**
- Nav `上报死亡` (Report death), back arrow, 48×48 `占位` slot right.
- **Top action card (290:1517), two batch entry points:**
  - `+ 死亡原因` (Cause of death — `add-line` icon, 290:1519) → enters batch mode 290:1639.
  - `🖼 上传照片` (Upload photos — `image-line` icon, 290:1522) → enters batch mode 290:1793.
- Section title `死亡列表` (Death list); header row `共 10 头猪` (10 pigs total).
- Card grouped by pen: `栏位号` badge `A1` (1485:2120), then rows.
- Per-pig row: ID + pulse badge + condition text; meta `20₁ | 猪只类型 | 生产状态 | 日龄`.
  Below it a grey sub-card:
  - `死亡原因` + **`edit-2-line` pencil** (290:1607) → value, e.g. `发烧，感冒`.
  - `附件照片` (attached photos) → value, e.g. `无` (none), or a thumbnail grid.
- Footer: single `提交` (Submit) — rendered **disabled** `#D6F1E8` in this "default state" frame.

**Fields.**

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| 死亡原因 | multi-select of disease + symptom names, per pig | **No** — soft-warned only | may be pre-filled from the pig's recorded conditions | editable per pig via the pencil |
| 附件照片 | photos, per pig | no | `无` | delete-`✕` per thumbnail; no max stated on this screen |

### 添加死亡原因 (cause picker) — 290:1352 (疾病 tab) / 290:1422 (症状 tab)

- Nav title on screen is `添加死亡原因` (frame names are 选择疾病 / 选择症状).
- Subject header `已选 10 头猪` + **`查看 >`** ("View") — a labelled variant of the chevron header.
- Tabs `疾病` / `症状`.
- **Search field**, placeholder `疾病名称` / `症状名称` (disease name / symptom name). *This is the
  only picker in Part D with search.*
- Grouped accordion. Disease groups: `呼吸系统` (Respiratory), `胃肠道` (GI),
  `繁殖与新生仔猪` (Reproductive & neonatal piglets), `神经系统` (Nervous system). Symptom groups:
  `综合` (General), `四肢` (Limbs).
- Rows: `疾病名称/简称` / `症状名称/简称` + ⓘ + checkbox.
- Footer: summary `已选择 1 种疾病，2 项症状` + **`查看 >`** → 290:1478; button `添加` (Add),
  disabled at 0 (290:1352), enabled at ≥1 (290:1422).
- Cause of death is therefore drawn from the **same disease + symptom vocabulary** as the rest of the
  cluster — a cause can be a symptom.

### 已选死亡原因 — 290:1478

- Nav `已选死亡原因` (Selected causes of death). Tabs `疾病` / `症状`.
- Grouped accordion (`综合`, `四肢`, `四肢` — the group appears twice, a mock artefact).
- Each row: name + ⓘ + **trash icon** — remove that cause.
- **No footer button** — review/delete only; back to return.

### 批量操作：添加死亡原因 — 290:1639 (h=2400)

Selection mode layered onto the death list.
- Header card gains a subtitle: **`请选择要添加死亡原因的猪只`** — "Please select the pigs to add a
  cause of death to." Master checkbox shown **indeterminate** (green minus).
- Pen group `A1` gains its own (indeterminate) checkbox; each pig row gains a checkbox.
- Footer replaced: summary `已选择 1 头猪只` ("1 pig selected") + `取消` (Cancel) /
  `添加死亡原因` (Add cause of death, enabled green).

### 批量操作：上传照片 — 290:1793 (h=2400)

- Same selection scaffolding; subtitle **`请选择要上传照片的猪只`** — "Please select the pigs to
  upload photos for." Master + pen + row checkboxes all **unchecked** here.
- Footer: `取消` / `上传照片`, the latter **disabled** `#D6F1E8` at 0 selected. **No
  `已选择 N 头猪只` summary line** in this variant (present in 290:1639).
- Row rendering differs from 290:1515/290:1639: ID in green, `生产母猪 | 已发情 | 650 日龄` on line
  1, and a **red `!` badge** + condition list on line 2 (vs pink pulse badge inline on the other two
  frames).
- Photo thumbnails render inline in the pig's sub-card, each with a `✕` delete; row `000008` shows 5.

### Confirm & result

- **1506:2292** `上报死亡`:
  > `有 n/5 头猪只未添加死亡原因，确认要继续提交吗?`
  > "n of 5 pigs have no cause of death added — confirm you want to continue submitting?"
  → `取消` / **`继续提交`** (Continue submitting).
  **This proves cause of death is NOT mandatory** — it is a soft, dismissible warning. `n/5` is left
  as a literal placeholder in the design.
- **1506:2313** `操作成功`.

**Bulk.** The whole death flow is bulk (N pigs), but it is the **only** health operation with
per-pig data: each pig carries its own cause and its own photos. The two batch modes exist purely to
fan one cause set / one photo set out to a chosen subset.

---

## Actions this cluster exposes

| Action | Entry point | Subject | Data captured | Effect on state |
|---|---|---|---|---|
| 添加疾病/症状 Add disease/symptom | 853:2120 row 1 → 272:3354 / 272:3480 → 439:2766 | N pigs (272:3354) or 1 pig (272:3480) | disease set + symptom set (cross-tab); optional triage level override; up to 12 photos | attaches conditions to every selected pig; may overwrite triage for the batch |
| 移除/康复 Remove or Recover | 853:2120 row 2 → 591:3550 → 124:583 | N pigs | per-condition verdict 移除 or 康复; optional free-text `更新标记原因` | clears (移除) or resolves (康复) the condition on every selected pig carrying it |
| 调整分诊等级 Adjust triage | 853:2120 row 3 → 286:873 → 286:936 | N pigs | one of 4 triage levels | sets 健康分诊等级 on all selected pigs |
| 治疗 Treatment | 853:2120 row 4 → 286:1027 → 286:1017 | N pigs | 药物*, 品牌（剂型）, 治疗方式*, 剂量*, 剂量单位*, 目标疾病, 目标症状 | logs a treatment event against the batch, optionally linked to existing conditions |
| 上报死亡 Report death | 853:2120 row 5 → 290:1515 → 1506:2292 | N pigs, **per-pig payload** | per pig: 死亡原因 (diseases + symptoms), 附件照片 | marks pigs dead; cause may be blank (warned) |
| (sub) 选择健康分诊等级 | 439:2766 card B chevron → 854:2369 | the whole batch | one level | feeds the add-disease submission |
| (sub) 添加死亡原因 | 290:1515 / 290:1639 → 290:1352 | selected subset of the death list | disease + symptom set | writes the same cause set to every selected pig |
| (sub) 上传照片 (death) | 290:1515 / 290:1793 | selected subset | photos | attaches to every selected pig |
| (view) 已选猪只列表 | any `已选 N 头猪 >` header | — | — | read-only, cannot deselect |

**Bulk-capability summary.** *Every* health operation is bulk-capable. Only 272:3480
(添加症状（一头猪）) is drawn as a single-pig case, and it is the same component with the subject
header degraded to plain text. Nothing in the cluster is single-pig-only.

---

## Rules & conditionality

- **853:2120** — the health sheet is a 512px-tall drawer with 5 tiles in a 4-col grid; row 1's label
  uses a lighter colour token (`#4B5468`) than rows 2–5 (`#26292E`).
- **272:3354 → 272:3480** — the footer summary counts selections across *both* tabs; it is hidden at
  zero. `下一步` gates on `≥1 total selection`.
- **439:2766** — `最多可上传 12 张照片` ("Up to 12 photos may be uploaded") is the only stated media
  limit in the cluster. The death flow states no limit.
- **439:2766 card B** — triage is presented as an *aggregate of the current selection*
  (`紧急治疗 × 2`, `优先干预 × 1`, `常规观察 × 200`), and adjusting it from here is an override on
  the whole batch.
- **854:2369 / 286:873** — every triage row's description is the placeholder
  `这里是健康分诊等级的描述` ("this is the description of the health triage level"). No real level
  semantics are specified anywhere in the file.
- **591:3550 / 272:3561 / 272:3851 / 272:3674** — three-stage gate: `移除`/`康复` require ≥1 checked
  row; `提交` requires ≥1 *tagged* row and ignores checked-but-untagged rows. Tagging clears the
  checkboxes, so `移除`/`康复` go disabled again after each tagging pass.
- **124:583** — `更新标记原因（选填）` is explicitly marked 选填 = optional.
- **591:3991** — `离开此页面后，已填写的内容将不会保存，确认离开吗?` — leaving discards the draft.
  Only drawn for the remove/recover flow; the other four flows have no leave-guard frame.
- **286:1027** — required: 药物, 治疗方式, 剂量, 剂量单位. Not required: 品牌（剂型）, 目标疾病,
  目标症状 (asterisk nodes present but `hidden="true"`).
- **1477:1712 / 1477:1827** — target pickers are scoped to conditions the selected pigs already
  carry, with `× n` affected-pig counts, and have a select-all header (`共 10 种疾病`).
- **1477:1712** annotation: `抽屉最大高度1462px 屏幕高度的90%` (drawer max height 1462px = 90% of
  screen height). **1482:2083** annotation: `抽屉最小高度406px 屏幕高度的25%` (drawer min height
  406px = 25% of screen height).
- **1482:2083** — empty state copy `暂无记录症状` ("no symptoms recorded yet").
- **290:1639 / 290:1793** — batch mode subtitles `请选择要添加死亡原因的猪只` /
  `请选择要上传照片的猪只`; three-level checkbox hierarchy (all-pigs master → pen group → pig) with
  an indeterminate state on the parents.
- **1506:2292** — `有 n/5 头猪只未添加死亡原因，确认要继续提交吗?` — missing cause of death is a
  warning, not a block; the affirmative button is `继续提交` (Continue submitting).
- **All four 操作结果 frames (643:2798, 1477:1706, 1482:2076, 1506:2313) are byte-identical**
  `操作成功` ("Operation successful") dark toasts. No per-flow result detail, no undo, no
  partial-failure state anywhere in the cluster.
- **Scanning** — no scan / NFC / ear-notch affordance exists on any Part D screen. Scanning is on
  the list screen that precedes the sheet.

---

## Ambiguities / contradictions found

1. **853:2120 — is `添加疾病/症状` disabled?** Its label is `#4B5468` while the other four are
   `#26292E`, but its icon matches the others and the tile has no dimmed background. Either it is a
   disabled state whose spec was never written, or the label picked up the icon colour token by
   mistake. Unresolvable from the file.
2. **853:2120 — the `添加疾病/症状` icon is `remove`** (853:2132), a minus glyph, on the *Add*
   action. Rows 2–4 all reuse `vital_signs`, so 移除/调整/治疗 are visually indistinguishable from
   each other.
3. **439:2766 — `已选 2 种疾病，4 项症状` is contradicted by its own chips.** Six chips are listed
   (感冒, 蓝耳PRRS, 猪流感, 猪支原体肺炎, 巴氏杆菌病, 支气管败血波氏杆菌感染) and all six are
   disease names; none is a symptom. The card also gives no visual separation between the two kinds,
   so a reader cannot tell which chips are diseases and which are symptoms.
4. **439:2766 — pig count vs triage counts don't reconcile.** Header says `已选 10 头猪`; the triage
   tags total 2 + 1 + 200 = 203.
5. **Disease vs symptom are not distinguished as data anywhere.** They share the picker component,
   the accordion-group pattern, the ⓘ affordance, the `× n` count chip, the remove/recover verdicts
   and the death-cause vocabulary. The *only* differences observable in the file are (a) the tab they
   live under, (b) their group taxonomies (diseases: 呼吸系统 / 胃肠道 / 繁殖与新生仔猪 / 神经系统;
   symptoms: 综合 / 四肢), and (c) the counter unit — diseases counted with 种, symptoms with 项.
   Nothing indicates a symptom is subordinate to a disease.
6. **1477:1712 / 1477:1827 have no confirm button.** The drawer has only `✕`, yet the content frame
   (1496px) overflows the drawer (1462px). Whether ticking commits immediately or `✕` commits is
   unspecified.
7. **Search exists only in the death-cause picker** (290:1352/290:1422). The add-disease picker
   (272:3354) and the remove picker (591:3550) have none, despite the disease catalogue being large
   enough to need four+ accordion groups.
8. **290:1515 shows `提交` disabled in the "default state"** even though both visible pigs already
   have a cause filled in. Given 1506:2292 explicitly allows submitting with missing causes, the gate
   on `提交` is unexplained.
9. **The death list renders pig rows two different ways.** 290:1515 / 290:1639: ID + pink
   `vital_signs` pulse badge inline, meta on line 2. 290:1793: green ID + meta on line 1, red `!`
   badge + conditions on line 2. Same data, two treatments.
10. **The `死亡原因` pencil is inconsistent within 290:1793** — present on row `000008`, absent on the
    `000001` rows. In 290:1515 and 290:1639 every row has it.
11. **1506:2292 ships a literal placeholder**: `有 n/5 头猪只未添加死亡原因` — `n` was never
    parameterised, and `5` contradicts the list's `共 10 头猪`.
12. **`移除` vs `康复` semantics are never stated.** Both are submitted through one dialog titled
    `更新标记` (Update marking) with one optional reason field; nothing in the file says whether
    移除 erases history (mis-diagnosis) and 康复 closes it (resolved), nor whether either changes the
    pig's 健康分诊等级.
13. **Triage is never linked to disease state.** Adding a disease does not force a triage change, and
    marking everything 康复 does not visibly reset triage to 健康 — the two are independent writes.
14. **290:1478 shows the group `四肢` twice**, and the `已选死亡原因` screen has no confirm/save
    control at all.
15. **No treatment history, no dosage validation, no date/time.** 治疗 captures a dose as free text
    (`请输入剂量`) with a separate unit picker; no numeric range, no decimal rule, and no
    administered-at timestamp field appears on the form.
