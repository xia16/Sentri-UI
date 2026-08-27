# Part C1 — sow reproductive-status operations (子功能-生产 and everything it launches)

Figma file `4GZGPBauEOWQQjnRrzoUgF`, page `60:406 🟢 UI设计稿`, section `60:408 巡检`.

All frames in this cluster live in the band `x ≈ 4050–24700`, `y ≈ 5024–19500`. Flows read
**left → right**; each horizontal row is one precondition case.

---

## Screen inventory

| Node | Screen (中文, = Figma frame name) | English | Purpose |
|---|---|---|---|
| 782:2200 | 子功能-生产 | Production sub-function drawer | The 6-tile action menu launched from the 生产 parent button |
| 235:810 | 模块标题 "生产-发情" | Section title | Marks the 发情 flow column |
| 246:597 / 420:1683 / 420:2116 / 420:1712 | precondition strips | — | Magenta = required 生产状态; green/red = batch membership |
| 465:1334 | 空怀 / 后备 | Empty/reserve — 发情 sheet, batch task **not started** | Record heat earlier than the batch plan |
| 473:2728 | 操作结果 | Result | 操作成功 toast |
| 359:1188 | 空怀 / 后备 | Empty/reserve — 发情 sheet, batch task **in progress** | Mark sow in heat, move the heat-check task to mating |
| 420:1426 | 操作结果 | Result | 操作成功 toast |
| 251:636 | 已发情，已配种，已妊娠 | 发情 sheet for an already-served sow, 仅记录发情 selected | Record repeat heat only |
| 430:1057 | 已发情，已配种，已妊娠 | same sheet, 确认返情 selected | Confirm return-to-heat, remove from batch |
| 473:2688 | 操作结果 | Result | 操作成功 toast |
| 420:1730 | 发情 | 发情 sheet, sow **not in a batch** | Record heat and optionally join a batch |
| 473:2733 | 选择批次 | 发情 sheet with 加入到批次 selected | Shows the 选择批次 CTA |
| 473:3168 | 选择批次（已选） | same, batch chosen | CTA becomes 生产线1 - 批次20; 提交 enabled |
| 479:2165 | 选择批次 | Batch picker (full page) | Pick line + batch for the 发情 join |
| 479:2251 | 选择批次-搜索结果 | Batch picker, empty search | 未搜索到"批次99" |
| 420:1861 | 选择生产线 | Production-line picker (wheel sheet) | Choose 生产线 |
| 473:3163 | 操作结果 | Result | 操作成功 toast |
| 260:451 | 模块标题 "生产-意外妊娠" | Section title | — |
| 260:556 | 妊娠 | 意外妊娠 sheet, 仅记录妊娠 selected | Record unexpected pregnancy without a batch |
| 473:3291 | 操作结果 *(mis-named frame — it is a sheet)* | 意外妊娠 sheet, 加入到批次 selected | Shows the 选择批次 CTA |
| 473:3366 | 选择批次（默认态） | Batch picker (bottom sheet) | Default list state |
| 580:2097 | 选择批次（搜索批次） | Batch picker, search hit selected | 确认 enabled |
| 473:3447 | 选择生产线 | Production-line picker (wheel sheet) | Choose 生产线 |
| 473:3469 | 操作结果 | Result | 操作成功 toast |
| 262:953 | 模块标题 "生产-流产" | Section title | — |
| 262:960 | 流产 | Abortion, sow **in** a batch | 批次内标记流产 — removes from batch |
| 473:3749 | 操作结果 | Result | 操作成功 toast |
| 262:1012 | 流产 | Abortion, sow **not in** a batch | 标记流产 — status only |
| 473:3754 | 操作结果 | Result | 操作成功 toast |
| 262:1128 | 模块标题 "生产-分娩" | Section title | — |
| 265:2685 | 前置条件 | Precondition modal 是否结束分娩 | **Annotated 这个不需要了 — cut** |
| 473:3523 | 分娩 (h=2168) | Farrowing, batch task **not started** | Records litter + starts the batch farrowing task |
| 473:3759 | 操作结果 | Result | 操作成功 toast |
| 473:3769 | 分娩 (h=2000) | Farrowing, batch task **already running** | Records litter into the running batch task |
| 473:3764 | 操作结果 | Result | 操作成功 toast |
| 480:1601 | 分娩 (h=2000) | Farrowing, sow **not in** a batch — blocked | Steppers disabled, 加入批次 CTA |
| 479:1686 | 分娩（已编辑） | Farrowing after batch joined | Steppers enabled, mating info displayed |
| 479:1867 | 加入批次 | Join batch — wizard step 1 | Pick line + batch |
| 439:1753 | 补充配种信息 | Supplement mating info — wizard step 2 | Mating date + boar |
| 442:1602 | 选择配种公猪 | Select mating boar | Ear-tag search + single-select |
| 479:1958 | 操作结果 | Result | 操作成功 toast |

Adjacent, **out of this cluster** but reached from the same menu: `907:4225 标记/移除留种` (x=5000,
y=5024) for the 标记/移除留种 tile; the 断奶 module sits at x≈26399 (`440:1098`, `473:4319`,
`439:1869`, `473:4038`); 标记留种 at x≈37697.

---

## Designer annotations (verbatim, highest-value)

**`853:2119`** (magenta, sits directly under the 子功能 drawers at x=4050, y=6688):

> 点击底部某个父功能按钮后，使用抽屉展示其子功能
> 所选的猪只 可使用该子功能时，子功能为可用态，反之为禁用态
>
> 发情、意外妊娠、流产、分娩、断奶：只能作用于 单头猪，选择多头猪时，此按钮禁用
> 标记留种、移除留种标记：可作用于 单头猪或多头猪

*Tapping one of the bottom parent-function buttons shows its sub-functions in a drawer. When the
selected pig can use that sub-function the tile is enabled, otherwise disabled. **发情 (heat),
意外妊娠 (unexpected pregnancy), 流产 (abortion), 分娩 (farrowing), 断奶 (weaning) can only act on
a SINGLE pig — when multiple pigs are selected this button is disabled.** 标记留种 / 移除留种标记
(mark / unmark as breeding stock) can act on one pig or many.*

**`853:2023`** (x=4840, y=4560):

> ⬅️ 未选择猪只时，或选择的猪只 不可执行 某操作时 底部操作功能按钮（父功能） 禁用

*When no pig is selected, or the selected pig cannot perform an operation, the bottom
action-function button (parent function) is disabled.*

**`850:2000`** (x=5247, y=16982 — sits above the "不属于批次" 发情 row):

> 这里的判断逻辑不是属于不属于批次，而是这头猪所在批次是否还有查情，配种，分娩，断奶
> （其中任意一个），如果没有，那就出发这条

*The condition here is not whether the pig belongs to a batch, but whether the batch it is in still
has any of 查情 (heat check), 配种 (mating), 分娩 (farrowing), 断奶 (weaning) — if none, this branch
triggers.* (「出发」 is a typo for 「触发」.)

**`575:1965`** (x=6900, y=18822, under the 发情 batch picker):

> ⬆️ 只能搜到所选的生产线里的批次

*Search can only find batches inside the selected production line.*

**`575:2000`** (x=19899, y=17650, under 480:1601 分娩):

> ⬆️ 没选择批次时，不可填写仔猪信息

*When no batch is selected, piglet information cannot be entered.*

**`575:2001`** (x=20849, y=17650, under 479:1686 分娩（已编辑）):

> ⬆️ 已选择批次后，再次点击按钮，可以修改批次

*Once a batch is selected, tapping the button again lets you change the batch.*

**`265:2685`** — purple annotation across the whole 前置条件 screen:

> 这个不需要了

*This is no longer needed.* The screen it kills is a modal:
「是否结束分娩 / 该母猪的分娩是否已结束？若尚未结束，将无法在巡检中执行分娩操作。」
buttons 已结束 (finished) / 未结束 (not finished, red primary).
*Has farrowing ended? If not yet finished, the farrowing operation cannot be performed in 巡检.*

### Precondition strips (colour-coded requirement labels above each flow row)

Magenta chip = allowed 生产状态; green chip = batch membership; red chip = not in a batch.

| Strip node | 生产状态 (magenta) | Batch (green/red) | Launches |
|---|---|---|---|
| 246:597 | 空怀/后备 | 属于批次（批次任务：未开始） | 465:1334 |
| 420:1683 | 空怀/后备 | 属于批次（批次任务：进行中） | 359:1188 |
| 420:2116 | 已发情，已配种，已妊娠 | 属于批次 | 251:636 / 430:1057 |
| 420:1712 | 空怀/后备，已发情，已配种，已妊娠，成长期 | 不属于批次 | 420:1730 |
| 420:2128 | 空怀/后备，已发情，已配种，已妊娠，成长期 | 不属于批次 | 260:556 |
| 420:2159 | 空怀/后备，已发情，已配种，已妊娠，成长期 | 属于批次 → **"意外妊娠"按钮禁用** | *(no screen — button disabled)* |
| 430:1063 | 空怀/后备，已发情，已配种，已妊娠，成长期 | 属于批次 | 262:960 |
| 430:1075 | 空怀/后备，已发情，已配种，已妊娠，成长期 | 不属于批次 | 262:1012 |
| 430:1102 | 空怀/后备，已发情，已配种，已妊娠，成长期 | 属于批次（批次任务：未开始） | 473:3523 |
| 430:1120 | 空怀/后备，已发情，已配种，已妊娠，成长期 | 属于批次（批次任务：已开始） | 473:3769 |
| 430:1111 | 空怀/后备，已发情，已配种，已妊娠，成长期 | 不属于批次 | 480:1601 |

---

## 子功能-生产 — 782:2200

**Purpose.** Bottom drawer listing the six production sub-actions for the pig(s) selected on the
unit pig list.

**Entry point.** Connector `907:4406 组 --> 子功能-生产` runs from the bottom parent-function bar on
the pig-list screen down to this frame. The blurred background is the 单元1 pig list showing
`已选 20 头` (20 selected), search by `ID/栏位` with scan + ear-notch icons, filter chips
`需操作 / 筛选结果1 / 筛选结果2`, list/grid toggle.

**Controls.** Sheet header 生产 + `close-line` ✕ (`782:2207`). Content grid `782:2225` = 2 rows ×
4 columns, tile = 88×88 icon + 24px label.

**The exact menu rows, in order (this is the answer to "what does the menu offer"):**

| # | Label | English | Icon layer | Node |
|---|---|---|---|---|
| 1 | 发情 | In heat / oestrus | `remove` | 782:2226 |
| 2 | 意外妊娠 | Unexpected pregnancy | `vital_signs` | 782:2232 |
| 3 | 流产 | Abortion | `skull` | 782:2238 |
| 4 | 分娩 | Farrowing | `skull` | 782:2244 |
| 5 | 断奶 | Weaning | `add_2` | 782:2250 |
| 6 | 标记/移除留种 | Mark / remove breeding-stock flag | `add_2` | 782:2256 |

There is no scroll region and no seventh tile — the grid frame is exactly 686×320.

**Rules.**
- Per `853:2119`, rows 1–5 are **single-pig only** and must be disabled on multi-select; row 6
  works on one or many.
- Disabled treatment (sampled from the sibling 功能禁用态 frame `854:3491`, the 记录 drawer):
  label `#98A2B2`, icon tile faded. Enabled label is `#26292E`, icon `#4B5468`.
- In this mock the labels are `#26292E` (enabled) for five tiles and `#4B5468` for 发情 — neither
  is the `#98A2B2` disabled colour, so **no tile is drawn in the disabled state** even though the
  background says `已选 20 头`.

**Bulk / scan.** Selection happens on the list behind the drawer (checkbox per pen card, `已选 N 头`
summary row with a minus button to clear). Scan / ear-notch entry lives on that list's search bar,
not in this cluster's sheets.

---

## Shared anatomy of every action sheet

Every 发情 / 意外妊娠 / 流产 sheet and every 分娩 page opens with the identical single-pig header:

| Element | Value in mocks | Notes |
|---|---|---|
| 栏位号 chip | `A1` | pen number |
| Ear tag | `000001` | |
| `savings` icon | 生产母猪 (production sow) | pig type |
| `cake` icon | 650 日龄 (650 days old) | |
| `pediatrics` icon | 3 胎 (parity 3) | |
| Card 1 | 批次 → `20₁` | batch (subscript = 生产线) |
| Card 2 | 生产状态 → e.g. 空怀/后备 1 天 | status + days in status |

**No sheet anywhere in this cluster shows `已选 N 头`.** Every one names exactly one pig.

Bottom bar on sheets: 取消 (226px) / 提交 (436px). On pages: back arrow + single full-width 提交,
or 上一步 / 确认.

---

## 发情 — four sheets

### 465:1334 空怀/后备, in a batch, batch task **not started**
**Purpose.** Record that a 空怀/后备 sow came into heat before her batch plan says she should.

**Controls.** ✕ close, 取消, 提交 (enabled). No toggle, no batch picker.

**Body.** Card title **「该猪只发情早于批次计划」** (*this pig is in heat earlier than the batch
plan*), three ⓘ bullets:
- 「仅记录该猪只的发情时间。」 *Only records this pig's heat time.*
- 「不影响批次 20_1 的原定计划。」 *Does not affect the original plan of batch 20_1.*
- 「通知管理员决定是否开始该批次。」 *Notifies the administrator to decide whether to start the batch.*

**Rules.** No state change to batch membership. Escalates to an admin decision.
**Bulk / scan.** Single pig; no scan.

### 359:1188 空怀/后备, in a batch, batch task **in progress**
**Body.** Card title **「标记猪只为发情」** (*mark pig as in heat*), body text:
- 「生产状态将被标记为发情」 *Production status will be marked as in-heat.*
- 「当前进行中的查情任务转移至配种」 *The heat-check task currently in progress moves to mating.*

**Rules.** Status → 已发情. The batch's running 查情 task is advanced to 配种 for this pig. Batch
membership unchanged. Submit enabled with no gating.

### 251:636 / 430:1057 已发情 / 已配种 / 已妊娠, in a batch
**Purpose.** Sow already served comes into heat again — decide record-only vs. return-to-heat.

**Controls.** Segmented control, two options:

| Option | Node showing it selected | Consequence bullets |
|---|---|---|
| 仅记录发情 (record heat only) | 251:636 | ⓘ「仅记录该猪只的发情时间。」 ⓘ「不影响批次 20_1 的原定计划。」 |
| 确认返情 (confirm return to heat) | 430:1057 | ⚠「记录返情，并将该猪只移出所在批次。」 ⚠「该猪只将不再跟随批次进行生产任务。」 |

**Body.** Card title **「配种后再次发情」**, body 「该猪只已配种。请确认是否判定为"返情"并移除后续批次任务？」
*This pig has already been mated. Please confirm whether to judge it as "return to heat" and remove
subsequent batch tasks.*

**Rules.**
- 仅记录发情 → 提交 immediately enabled (251:636), no checkbox row.
- 确认返情 → a **confirmation checkbox row appears**: 「我已知晓，并确认该猪只将从当前批次中移出。」
  (*I understand and confirm this pig will be removed from the current batch.*) 提交 is **disabled
  until it is ticked** (430:1057 shows it unticked + disabled 提交).
- Effect: removes the pig from its batch and stops it following batch production tasks.

### 420:1730 / 473:2733 / 473:3168 — sow **not in** a batch
Frame `420:1730` is the entry state; `473:2733` and `473:3168` are the same sheet after the
segmented control is switched.

**Body (420:1730 / 473:2733).** Card title **「确认发情并加入生产批次？」**, body
「该猪只已达配种年龄，当前尚未加入生产批次。」 *This pig has reached mating age and has not yet
joined a production batch.*
`473:3168` shows the same sheet with the title **「猪只不属于任何生产批次」** (*the pig does not
belong to any production batch*) — same body, same controls.

**Controls.** Segmented control:

| Option | Bullets | Extra control |
|---|---|---|
| 仅记录发情 | ⓘ「仅记录该猪只的发情时间。」 ⓘ「该猪只发情状态会持续48小时。」 | none |
| 加入到批次 | ⓘ「记录该猪只的发情时间。」 ⓘ「加入批次后，可跟随批次执行配种任务。」 | outline button 选择批次 |

**Rules.**
- 仅记录发情 (420:1730): no batch change; heat state auto-expires after **48 hours**.
- 加入到批次 (473:2733): 提交 **disabled** until a batch is chosen. After choosing, the outline
  button relabels to `生产线1 - 批次20` and 提交 becomes enabled (473:3168).
- The real trigger for this branch is not batch membership — see annotation `850:2000`.

**Bulk / scan.** Single pig; no scan.

---

## 意外妊娠 — 260:556 / 473:3291

**Purpose.** Record a pregnancy detected outside the planned heat-check task.

**Body.** Card title **「查情任务外标记发情」** (*mark in-heat outside the heat-check task*), body
「该猪只发情早于批次计划，是否提前启动查情任务」 *This pig is in heat earlier than the batch plan
— should the heat-check task be started early?*

**Controls.** Segmented control:

| Option | Node | Bullets |
|---|---|---|
| 仅记录妊娠 (record pregnancy only) | 260:556 | ⓘ「仅记录该猪只的妊娠状态。」 ⚠「该猪只将不会自动加入到任何批次。」 |
| 加入到批次 (join a batch) | 473:3291 | ⓘ「记录该猪只的妊娠状态。」 ⓘ「加入批次后，可跟随批次执行生产任务。」 + outline button 选择批次 |

**Rules.**
- 仅记录妊娠 → 提交 enabled, no batch assignment at all.
- 加入到批次 → 提交 **disabled** until a batch is picked via 选择批次.
- Per strip `420:2159`, when the sow **is already in a batch** the 意外妊娠 tile is disabled outright
  — the action only exists for pigs outside a batch.

**Bulk / scan.** Single pig; no scan.

---

## 流产 — 262:960 / 262:1012

Two mutually-exclusive variants keyed on batch membership.

### 262:960 — sow **in** a batch (「批次内标记流产」, *mark abortion inside the batch*)
**Body bullets** (both red ⚠):
- 「该猪只移出当前批次。」 *This pig is removed from the current batch.*
- 「生产状态更新为"空怀/后备"。」 *Production status is updated to "empty/reserve".*

**Controls.** Confirmation checkbox 「我已知晓，并确认该猪只将从当前批次中移出。」 — 提交 is
**disabled** until ticked. 取消 always enabled.

### 262:1012 — sow **not in** a batch (「标记流产」, *mark abortion*)
**Body bullet** (amber ⓘ): 「生产状态更新为"空怀"。」 *Production status is updated to "empty".*
**Controls.** Checkbox 「我已知晓。」 (shown ticked) → 提交 enabled.

**Fields.** Neither variant captures any data — no date, no count, no reason code. Abortion is a
pure status transition.

**Bulk / scan.** Single pig; no scan.

---

## 分娩 — four variants (full pages, not sheets)

All four are **full screens** with a back arrow and title 分娩, unlike the sheet-based actions.

### Litter fields (identical in all variants)

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| 健仔 (healthy piglets) | stepper − / n / + | — | 0 | |
| 弱仔 (weak piglets) | stepper | — | 0 | |
| 畸形 (deformed) | stepper | — | 0 | |
| 死胎 (stillborn) | stepper | — | 0 | |
| 木乃伊 (mummified) | stepper | — | 0 | |

提交 is **disabled while every stepper is 0** (473:3523, 480:1601) and enabled once any count is
non-zero (473:3769 all-2s, 479:1686 健仔=10).

### 473:3523 — in a batch, batch task **not started** (h=2168)
Card **「该猪只分娩早于批次计划」**, bullet ⓘ「将会启动 生产线1-批次20 的"分娩"任务」
*Will start the "farrowing" task of production line 1 - batch 20.*

Adds a **其他 (Other)** section that no other variant has:

| Field | Type | Required | Default | Placeholder / units |
|---|---|---|---|---|
| 最近产仔时间 (most recent farrowing time) | inline number input | — | empty | 「约 [请输入] 分钟前」 — *approx N minutes ago*; placeholder 「请输入」 |
| 本次是母猪最后一次分娩吗？ (*is this the sow's last farrowing?*) | segmented | — | 还将继续分娩 selected | 还将继续分娩 (will continue) / 最后一次分娩 (last one) |

### 473:3769 — in a batch, batch task **already running** (h=2000)
Card **「分娩任务正在进行中」**, bullet ⓘ「将该猪只的分娩结果体现在所在批次的任务中。」
*Reflect this pig's farrowing result inside its batch's task.*
**No 其他 section** — no farrowing time, no last-farrowing question. Steppers + 提交 only.

### 480:1601 — sow **not in** a batch — blocked
Card **「不属于批次不可记录分娩」** (*not in a batch — farrowing cannot be recorded*), bullet
ⓘ「如需记录分娩请将其加入到正确生产批次。」 *To record farrowing, add it to the correct production
batch.* Outline CTA **加入批次**.

All five steppers are rendered **disabled** and 提交 is disabled — matching annotation `575:2000`
「没选择批次时，不可填写仔猪信息」.

### 479:1686 — 分娩（已编辑）, after a batch has been joined
The 加入批次 CTA is replaced by **`生产线1 - 批次20`**, and a read-only info block appears beneath it:

| Row | Value |
|---|---|
| 🕐 配种时间 (mating date) | 2020/02/03 |
| 🐖 配种公猪 (mating boar) | 000001 |

Steppers become enabled, 提交 enabled. Per `575:2001`, tapping the `生产线1 - 批次20` button again
re-opens 加入批次 to change the batch (confirmed by connector `643:2787`).

**Bulk / scan.** Single pig; no scan.

---

## 加入批次 (join batch) — 479:1867 → 439:1753 → 442:1602

A **2-step wizard** reached only from 分娩 480:1601 / 479:1686. Stepper header: ① 加入批次 → ② 补充配种信息.

### Step 1 — 479:1867 加入批次
**Controls.**
- Pig header card (A1 / 000001 / 生产母猪 / 650 日龄 / 3 胎).
- Production-line dropdown, value `生产线1`, chevron.
- Search input, placeholder 「批次号」 (*batch number*).
- Filter note: 「仅可选择配种任务已完成并且分娩任务**为**完成的批次。」 (see contradictions below).
- Radio list, single-select. Rows show 批次20 + task timing:
  `🕐 孕检 3天后 开始` / `🕐 孕检 2天后 开始` / `◐ 孕检 进行中`
  (*pregnancy check starts in 3 days / in 2 days / in progress*).
- 下一步 (next) — **disabled** until a batch radio is selected.

### Step 2 — 439:1753 补充配种信息 (supplement mating info)

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| 配种时间 (mating date) | date picker row, chevron | **Yes — red `*`** | `2020/02/02` pre-filled | |
| 配种公猪 (mating boar) | picker row, chevron | No (no `*`) | empty | placeholder 「请选择配种公猪」 |

Hint below: ⓘ「上次配种：2020/02/03；000001 公猪」 *Last mating: 2020/02/03; boar 000001.*
Buttons: 上一步 (back) / 确认 (confirm, enabled — because the required date is pre-filled).

**Note the date contradiction:** the hint says last mating was `2020/02/03` while the field defaults
to `2020/02/02`, yet 479:1686 renders the result as `配种时间：2020/02/03`.

### 442:1602 选择配种公猪 (select mating boar)
Full page. Search input placeholder 「耳标号」 (*ear tag number*). Single-select radio list of boar
ear tags (`000001` ×8 in the mock). 确认 **disabled** until one is selected. No scan affordance here
even though the field is an ear tag.

**Result.** 确认 → back to 分娩（已编辑）(connector `643:2737`) → 提交 → `479:1958` 操作成功.

**So: 加入批次 assigns the sow to a production line + batch AND backfills the mating record
(date, boar) that the batch needs in order to compute her farrowing task.** It is the only place in
this cluster where mating data is captured.

---

## 选择批次 / 选择生产线 — why they keep reappearing

Batch pickers appear in **three** flows, each with a **different eligibility filter**, which is why
they look duplicated:

| Picker node | Form | Reached from | Filter text (verbatim) | Rows show |
|---|---|---|---|---|
| 479:2165 / 479:2251 | full page, header reads 分娩 | 发情, sow not in a batch (473:2733) | 「仅可选择配种任务**进行中或尚未开始**的批次。」 | 配种 3天后 开始 / 配种 2天后 开始 / 配种 进行中 |
| 473:3366 / 580:2097 | bottom sheet, header 选择批次 | 意外妊娠 → 加入到批次 (473:3291) | 3366: 「仅可选择配种任务已完成并且分娩任务**未**完成的批次。」 · 2097: 「…分娩任务**为**完成…」 | 孕检 3天后 开始 / 孕检 2天后 开始 / 孕检 进行中 |
| 479:1867 (step 1) | full page wizard | 分娩, sow not in a batch (480:1601) | 「仅可选择配种任务已完成并且分娩任务**为**完成的批次。」 | 孕检 3天后 开始 / 孕检 2天后 开始 / 孕检 进行中 |

**When is a batch required?**

| Action | Batch required? | Behaviour |
|---|---|---|
| 发情 | Optional | 仅记录发情 works batch-less; 加入到批次 is the alternative branch |
| 意外妊娠 | Optional | 仅记录妊娠 works batch-less; tile is disabled entirely if already in a batch |
| 流产 | Not required | Two variants; if in a batch it *removes* her from it |
| 分娩 | **Mandatory** | Blocked outright (480:1601); steppers disabled until a batch is joined |
| 断奶 | *(out of cluster)* | — |

**选择生产线** (`420:1861`, `473:3447`) is a wheel-picker bottom sheet listing 生产线 values,
取消 / 确认. It exists because the batch list is scoped to one line — annotation `575:1965`:
「只能搜到所选的生产线里的批次」. Both instances are pixel-identical; the batch picker embeds the
line dropdown in its header, so the line sheet is a sub-picker of the batch picker, not a separate
step.

**Search states.** `479:2251` shows the empty state: icon + 「未搜索到"批次99"」 (*"batch 99" not
found*), 确认 stays disabled. `580:2097` shows a hit: search `批次20`, one row, green filled check,
确认 enabled.

---

## 操作结果 — all eleven nodes

`473:2728`, `420:1426`, `473:2688`, `473:3163`, `473:3469`, `473:3749`, `473:3754`, `473:3759`,
`473:3764`, `479:1958` (and `473:3291`, which is mis-named — it is an 意外妊娠 sheet).

Every real 操作结果 frame is structurally identical: a 280×280 dark rounded toast, `check-line`
icon 72×72, label **「操作成功」** (*operation successful*). Verified visually on `479:1958`,
`473:2688`, `473:3764`. There is **no** partial-success / per-pig result list anywhere — further
evidence these are single-pig operations.

---

## Actions this cluster exposes

| Action | Entry point | Subject | Data captured | Effect on state |
|---|---|---|---|---|
| 发情 — record only (batch, not started) | 782:2226 → 465:1334 | 1 pig | none (implicit timestamp) | Records heat time; batch plan untouched; notifies admin |
| 发情 — mark in heat (batch, running) | 782:2226 → 359:1188 | 1 pig | none | 生产状态 → 发情; running 查情 task → 配种 |
| 发情 — record only (already served) | 782:2226 → 251:636 | 1 pig | none | Heat time only; batch plan untouched |
| 发情 — confirm 返情 | 782:2226 → 430:1057 | 1 pig | checkbox ack | **Removed from batch**; no longer follows batch tasks |
| 发情 — record only (no batch) | 782:2226 → 420:1730 | 1 pig | none | Heat recorded; expires after 48h; stays batch-less |
| 发情 — join batch | 782:2226 → 473:2733 → 479:2165 (+420:1861) | 1 pig | 生产线 + 批次 | **Joins batch**; will follow the batch 配种 task |
| 意外妊娠 — record only | 782:2232 → 260:556 | 1 pig | none | Pregnancy status recorded; explicitly **not** auto-assigned to any batch |
| 意外妊娠 — join batch | 782:2232 → 473:3291 → 473:3366/580:2097 (+473:3447) | 1 pig | 生产线 + 批次 | **Joins batch**; follows batch production tasks |
| 流产 — in batch | 782:2238 → 262:960 | 1 pig | checkbox ack | **Removed from batch**; 生产状态 → 空怀/后备 |
| 流产 — no batch | 782:2238 → 262:1012 | 1 pig | checkbox ack | 生产状态 → 空怀 |
| 分娩 — batch task not started | 782:2244 → 473:3523 | 1 pig | 5 litter counts + 最近产仔时间 (min) + 最后一次分娩? | **Starts the batch's 分娩 task**; batch membership unchanged |
| 分娩 — batch task running | 782:2244 → 473:3769 | 1 pig | 5 litter counts | Result folded into the running batch task |
| 分娩 — no batch | 782:2244 → 480:1601 | 1 pig | blocked | Cannot record until 加入批次 |
| 加入批次 (from 分娩) | 480:1601 / 479:1686 | 1 pig | 生产线, 批次, 配种时间*, 配种公猪 | **Joins batch** + backfills the mating record |
| 断奶 | 782:2250 | *(screens at x≈26399, out of cluster)* | — | — |
| 标记/移除留种 | 782:2256 → 907:4225 | **1 or many pigs** | *(out of cluster)* | — |

---

## Rules & conditionality

- **Single-pig only.** `853:2119`: 「发情、意外妊娠、流产、分娩、断奶：只能作用于 单头猪，选择多头猪时，此按钮禁用」.
  Every sheet/page in this cluster confirms this — all show one ear tag (`000001`), one pen (`A1`),
  and none shows a `已选 N 头` summary. Only 标记/移除留种 is bulk-capable.
- **Parent button gating.** `853:2023`: the bottom 生产 button itself is disabled when nothing is
  selected or the selection cannot perform the op.
- **Sub-function tile gating.** `853:2119`: 「所选的猪只 可使用该子功能时，子功能为可用态，反之为禁用态」.
  Disabled visual = label `#98A2B2` (measured on `854:3491`).
- **意外妊娠 is disabled for pigs already in a batch** — strip `420:2159`: 「属于批次 → "意外妊娠"按钮禁用」.
- **Branching is by batch-task state, not by membership** — `850:2000`:
  「这里的判断逻辑不是属于不属于批次，而是这头猪所在批次是否还有查情，配种，分娩，断奶（其中任意一个），如果没有，那就出发这条」.
  The magenta/green strips still describe the branches as 属于批次 / 不属于批次, i.e. the strips and
  the annotation disagree; the annotation is the later correction.
- **Batch removal always requires an explicit acknowledgement checkbox** — 430:1057 and 262:960 both
  gate 提交 on 「我已知晓，并确认该猪只将从当前批次中移出。」. 262:1012 uses the weaker 「我已知晓。」.
- **分娩 is the only action that hard-requires a batch** — 480:1601 「不属于批次不可记录分娩」 +
  `575:2000` 「没选择批次时，不可填写仔猪信息」.
- **Batch search is line-scoped** — `575:1965` 「只能搜到所选的生产线里的批次」.
- **Batch can be changed after selection** — `575:2001` 「已选择批次后，再次点击按钮，可以修改批次」.
- **Heat state has a 48-hour lifetime** — 420:1730 「该猪只发情状态会持续48小时。」 (stated only in the
  no-batch variant; the other three 发情 variants never mention a duration).
- **The 是否结束分娩 precondition modal is cancelled** — `265:2685` annotated 「这个不需要了」.
- Every successful submit ends in the same 操作成功 toast; there is no confirmation dialog between
  提交 and the toast for any action in this cluster.

---

## Ambiguities / contradictions found

1. **Batch-eligibility copy contradicts itself inside one flow.** `473:3366` says
   「…并且分娩任务**未**完成的批次」 while its own search state `580:2097` and the 分娩 wizard
   `479:1867` both say 「…并且分娩任务**为**完成的批次」. 「为完成」 is not grammatical Chinese;
   「未完成」 is almost certainly intended, since a batch whose farrowing is finished cannot accept
   a sow that has not farrowed. Two of three frames carry the typo.
2. **意外妊娠 sheet's card title says the wrong thing.** 260:556 / 473:3291 are titled 意外妊娠, the
   toggles read 仅记录妊娠 / 加入到批次, but the card heading is 「查情任务外标记发情」 and the body
   「该猪只发情早于批次计划，是否提前启动查情任务」 — copied from the 发情 flow. Nothing in the
   pregnancy flow starts a 查情 task.
3. **Two different card titles for the same state.** 473:2733 says 「确认发情并加入生产批次？」 and
   473:3168 says 「猪只不属于任何生产批次」 for what is otherwise the identical sheet in the identical
   branch.
4. **Batch picker page carries the wrong header.** `479:2165` / `479:2251` are titled 分娩 but belong
   to the 发情 flow (their filter is 配种任务进行中或尚未开始). There is also an unstyled white square
   in the top-right of the nav bar in both frames.
5. **Two picker patterns for the same job.** 发情 uses a full-page batch picker (479:2165); 意外妊娠
   uses a bottom-sheet picker (473:3366); 分娩 uses a wizard step (479:1867). All three do the same
   thing with the same row layout.
6. **The 批次 chip contradicts the copy.** 262:1012 (「不属于批次」 branch), 480:1601 and 479:1686
   (「不属于批次不可记录分娩」) all still render the header card as 批次 = `20₁`. Mock data was not
   updated for the no-batch cases.
7. **流产 status target is inconsistent.** 262:960 → 「生产状态更新为"空怀/后备"」; 262:1012 →
   「生产状态更新为"空怀"」. Two different status names for the same transition.
8. **Mating date inconsistency.** 439:1753 hint says 上次配种 `2020/02/03`, the 配种时间 field defaults
   to `2020/02/02`, and the resulting 479:1686 shows `配种时间：2020/02/03`.
9. **Multi-select vs. the mock.** 782:2200 is drawn over a list reading `已选 20 头`, yet all six
   tiles are drawn enabled — directly contradicting `853:2119`, which requires five of the six to be
   disabled on multi-select. The 发情 label is additionally drawn in `#4B5468` rather than either the
   enabled `#26292E` or the disabled `#98A2B2`.
10. **A frame is mis-named.** `473:3291` is named 操作结果 in Figma but contains the 意外妊娠 sheet.
11. **Weak vs. strong acknowledgement.** 262:1012 (no batch change) uses 「我已知晓。」 and is drawn
    pre-ticked with 提交 enabled; 262:960 and 430:1057 (batch removal) use the long acknowledgement
    and are drawn unticked with 提交 disabled. Whether the short checkbox is a real gate or purely
    decorative is not specified.
12. **48-hour heat expiry is stated only once.** It appears in 420:1730 only; whether it applies to
    the in-batch 发情 variants (465:1334, 359:1188, 251:636) is unstated.
13. **配种公猪 is optional but no boar-less path is shown.** 439:1753 marks only 配种时间 with `*`, yet
    479:1686 always renders a 配种公猪 row. What the row shows when no boar was chosen is undefined.
14. **No scanning anywhere in this cluster.** 442:1602 searches boars by 耳标号 with a plain text
    field and no scan/NFC affordance, even though the pig list behind the menu has scan and
    ear-notch buttons.
15. **The cancelled precondition leaves a gap.** `265:2685` (是否结束分娩) is struck out with
    「这个不需要了」, but nothing else in the 分娩 flow captures whether farrowing is complete except
    the 本次是母猪最后一次分娩吗？ toggle, which exists only in the 批次任务未开始 variant (473:3523)
    and not in the 批次任务已开始 variant (473:3769). How a multi-session farrowing is closed out in
    the running-task case is unspecified.
