# Part C2 — 断奶检查 (weaning check), 仔猪信息 (piglet info) & 留种 (replacement-stock) marking

Figma file `4GZGPBauEOWQQjnRrzoUgF`, page `60:406` (🟢 UI设计稿), section `60:408` (巡检).
Three Figma modules are covered:

| Module title node | 中文 | English |
|---|---|---|
| `265:2085` | 生产－断奶 | Production — Weaning |
| `620:2853` | 生产－标记留种 | Production — Mark replacement stock |
| `654:2288` | 生产－移除留种 | Production — Remove replacement stock |

---

## Screen inventory

| Node | Screen (中文) | English | Purpose |
|---|---|---|---|
| `782:2200` | 子功能-生产 | Production sub-function drawer | Entry point. Bottom-sheet of production actions for the selected pig(s). |
| `907:4225` | 标记/移除留种 | Mark/remove replacement stock (chooser) | 提示 dialog forcing a choice between 标记留种 and 移除留种. |
| `470:2388` | 先询问 | Ask first | Pre-weaning dialog: record fostering before weaning? (immediate predecessor of `439:1869`) |
| `439:1869` | 断奶检查 | Weaning check (empty) | Summary form for one sow's weaning: litter side + sow side. Submit disabled. |
| `473:4038` | 断奶检查（已编辑） | Weaning check (filled) | Same screen with both sections filled; Submit enabled. |
| `473:4319` | 断奶检查 | Weaning check — pig not in any batch | Same screen, different top banner. |
| `439:2228` | 仔猪信息（默认状态） | Piglet info (default) | Litter-side editor, accordions collapsed, nothing entered. |
| `1701:1656` | 仔猪信息 | Piglet info (expanded) | Same editor with all three accordions open. |
| `439:2028` | 母猪状态 | Sow status | Sow-side editor: body condition + post-farrowing checks + cull recommendation. |
| `440:1205` | 二次确认 | Second confirmation | 提前断奶须知 (early-weaning notice) with acknowledgement checkbox. |
| `473:4015` | 操作结果 | Operation result | 操作成功 toast. |
| `654:2397` | 弹窗 | Dialog — 标记留种, selection contains ineligible pigs | Mixed-eligibility confirmation. **Carries the key annotation.** |
| `650:2870` | 标记留种 | Mark replacement stock — success (all pigs already have identity) | 操作成功 toast. |
| `620:2857` | 标记留种 | Mark replacement stock — identity completion list | List of selected pigs; rows lacking identity offer 补充身份. Shows before/after states. |
| `1606:1693` | 1、填耳缺 | Step 1 — ear notch | 补充身份 wizard step 1. |
| `1606:1767` | 2、填父母 | Step 2 — enter parents | Wizard step 2, empty. |
| `1606:1957` | 2、确认父母 | Step 2 — confirm parents | Wizard step 2, parents pre-filled and read-only. |
| `1606:1846` | 3、填耳标性别 | Step 3 — ear tag + sex | Wizard step 3; only step with required fields. |
| `1234:1748` | 弹窗 | Dialog — confirm back-navigation | Unsaved-data warning for the 标记留种 pages. |
| `654:2275` | 标记留种 | Mark replacement stock — success | 操作成功 toast after 提交 on `620:2857`. |
| `654:2292` | 选择的猪只中，包含不可执行此操作的猪只 | 移除留种 — selection contains ineligible pigs | Mixed-eligibility confirmation. |
| `654:2367` | 选择的猪只中，全部可执行此操作 | 移除留种 — all selected pigs eligible | Plain-count confirmation. |

Supporting/annotation nodes: `853:2023`, `853:2065`, `853:2119` (bulk rules), `620:3516` (pasted written spec "2.3 工作原理"), `440:1089` / `440:1108` (batch-membership labels), `650:3050` / `620:3508` (identity-state labels), `1606:3276` / `1606:3277` (wizard rules), `654:1887`–`654:1895` (row-variant labels), `850:2000` (batch-logic correction).

---

## Flow map (from the connector arrows in `60:408`)

```
子功能-生产 drawer (782:2200)
  ├─ 断奶  ──► 先询问 (470:2388) ──[继续断奶]──► 断奶检查 (439:1869 / 473:4319)
  │                                              ├─[编辑 on 仔猪信息]──► 仔猪信息 (439:2228 / 1701:1656) ──[确认]──┐
  │                                              ├─[编辑 on 母猪状态]──► 母猪状态 (439:2028)      ──[确认]──┤
  │                                              │                                   ◄──────────────────────────┘
  │                                              └─[提交]──► 二次确认 (440:1205) ──[确认]──► 操作结果 (473:4015)
  │
  └─ 标记/移除留种  ──► 提示 chooser (907:4225)
        ├─[标记留种] ──(mixed selection only)──► 弹窗 654:2397 ──[确认]──┬─► 650:2870 操作成功   (all selected have identity)
        │                                                                └─► 620:2857 标记留种 list (selection contains no-identity pigs)
        │                                                                      └─[补充身份 / 修改身份]──► 1606:1693 ─► 1606:1767 or 1606:1957 ─► 1606:1846 ─► back to the row card
        │                                                                      └─[提交]──► 654:2275 操作成功
        │                                                                      └─[back]──► 1234:1748 确认返回吗
        └─[移除留种] ──► 654:2292 (mixed) or 654:2367 (all eligible) ──[确认]──► (no result frame drawn)
```

Arrow evidence: `643:2788` (先询问→断奶检查), `643:2789` (按钮→仔猪信息), `643:2790` (按钮→母猪状态), `643:2791` (button→二次确认), `643:2792` (button→操作结果), `643:2793` (→断奶检查（已编辑）), `907:4312` (icon→弹窗), `907:4991` & `907:4992` (button→标记留种, two targets), `1606:3274`/`1606:3275` (button→1、填耳缺), `1606:3268`/`1606:3269` (→2、填父母), `1606:3270`/`1606:3271`/`1606:3272` (→3、填耳标性别), `1606:3273` (button→card), `654:2286` (button→标记留种 result), `1234:1756` (arrow_forward→弹窗).

---

## 子功能-生产 (production sub-function drawer) — `782:2200`

**Purpose.** Bottom-sheet listing the production actions applicable to the currently selected pig(s).

**Controls.** Title 生产 (Production), close ✕. Two rows of icon buttons:

| Row | Buttons |
|---|---|
| 1 | 发情 (estrus, −) · 意外妊娠 (unexpected pregnancy) · 流产 (abortion, 💀) · 分娩 (farrowing, 💀) |
| 2 | 断奶 (weaning, +) · **标记/移除留种** (mark/remove replacement stock, +) |

Above the drawer, the dimmed unit screen shows the selection banner 已选 20 头 (20 selected) with a deselect-all control, plus a magenta note 默认展开 (expanded by default) on the 饲喂站（3）row.

**Bulk / scan.** Selection happens on the unit pig list before the drawer opens. Search bar carries 🔍 `ID/栏位` placeholder, a QR/barcode scan icon and an **ear-notch (耳缺) icon** — the same ear-notch glyph reused on the wizard's 耳缺号 field.

---

## 标记/移除留种 chooser — `907:4225`

**Purpose.** After tapping the combined 标记/移除留种 entry, force the user to pick a direction.

**Controls.** Dialog titled 提示 (Notice), body 「请选择“标记留种”或“移除留种”」 ("Please choose 'mark replacement stock' or 'remove replacement stock'"), two large buttons: `＋ 标记留种` and `－ 移除留种`. No cancel button drawn.

**Bulk / scan.** Acts on the whole current selection (N pigs). No scanning here.

**Contradiction (see Ambiguities).** The dimmed action bar *behind* this dialog shows three separate buttons — 断奶 (+), 标记留种 (+), 移除留种标记 (−) — whereas `782:2200` shows one combined 标记/移除留种 button.

---

## 先询问 (ask first) — `470:2388`

**Purpose.** Warn that fostering must be recorded before weaning.

**Controls.** Dialog 断奶 (Weaning). Body: 「如果该母猪的仔猪需要寄养，请先记录寄养再记录断奶」 ("If this sow's piglets need fostering, record the fostering first and then record the weaning"). Buttons: 寄养 (Foster) | 继续断奶 (Continue weaning). Both enabled, equal weight — no primary.

---

## 断奶检查 (weaning check) — `439:1869` (empty) / `473:4038` (filled) / `473:4319` (not in a batch)

**Purpose.** One screen, one sow. Read-only summary of the two data blocks that make up a weaning record, each opened for editing via its own 编辑 link.

**Header (all three).** Back arrow, title 断奶 (Weaning). Pig identity card: pen chip `A1`, ID `000001`, 生产母猪 (production sow) · `650 日龄` (650 days old) · `3 胎` (parity 3). Two stat tiles: 批次 `20₁` (batch) and 生产状态 `已配种 1 天` (production status: mated 1 day).

**Conditional banner (the only difference between the three frames).**

| Node | Banner title | Bullets |
|---|---|---|
| `439:1869`, `473:4038` | 「该猪只需早于批次计划断奶」 (This pig must be weaned earlier than the batch plan) | ⓘ「该猪只将从批次中移出。」 (This pig will be removed from the batch.) · ⓘ「生产状态将更新为“空怀”。」 (Production status will be updated to "empty/open".) |
| `473:4319` | 「猪只不属于任何生产批次」 (The pig does not belong to any production batch) | ⓘ「生产状态将更新为“空怀”。」 |

Adjacent designer labels for these variants: `440:1089` 「空怀/后备，已发情，已配种，已妊娠，成长期」 + green tag 「属于批次」 (belongs to a batch); `440:1108` same list + red tag 「不属于批次」 (does not belong to a batch).

**Sections.**

### 仔猪信息 (piglet info) — read-only rows, 编辑 link on the right → `439:2228`

| Field | Type | Required | Empty (`439:1869`) | Filled (`473:4038`) | Notes |
|---|---|---|---|---|---|
| 总数量 (total count) | derived number | **Yes** (`*`) | `-` | `10` | Only starred field on the whole screen. |
| 公/母 (boar/sow) | derived | No | `-` | `5` | Value shown is a single number, not a pair — see Ambiguities. |
| 留种 (replacement stock) | derived | No | `-` | `-` | Still `-` in the fully-filled frame → optional. |
| 总体重 (total weight) | derived | No | `-` | `10kg` | Unit kg. |

### 母猪状态 (sow status) — read-only rows, 编辑 link on the right → `439:2028`

| Field | Type | Required | Empty | Filled | Notes |
|---|---|---|---|---|---|
| 体况评分 (body-condition score) | derived | No | `-` | `标准` (standard) | Textual band, not the 1–5 number. |
| 是否淘汰 (cull or not) | derived | No | `-` | `不建议淘汰` (not recommended for culling) | |
| 检查异常 (check abnormalities) | derived count | No | `-` | `0 项` (0 items) | Rolls up the post-farrowing checks. |

**Controls.** Bottom 提交 (Submit) — **disabled** in `439:1869` and `473:4319` (nothing entered), **enabled** in `473:4038`. Gate appears to be 总数量 (the one required field).

**Bulk / scan.** Single sow only. No scanning on this screen.

---

## 仔猪信息 (piglet info) — `439:2228` (default/collapsed) / `1701:1656` (expanded)

**Purpose.** Capture the litter side of the weaning: how many piglets came off, their weight, their sex split, and which ones are kept for breeding.

**Header.** Back arrow, title 仔猪信息. Same identity card + 批次/生产状态 tiles as the weaning check.

### 记录当前仔猪数量 * (record current piglet counts) — always expanded

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| 健仔 (healthy piglets) | stepper − 0 + | — | `0` | `−` greyed at 0. |
| 弱仔 (weak piglets) | stepper − 0 + | — | `0` | |
| 畸形 (deformed) | stepper − 0 + | — | `0` | |
| 仔猪总数量 (total piglets) | computed, read-only | — | placeholder 「填写明细后自动计算总数」 ("total is calculated automatically after the breakdown is filled in") | Never typed directly. |

The section header carries the red `*`; the individual steppers do not.

### 仔猪体重 (piglet weight) — accordion, collapsed by default

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| 仔猪总体重 (total piglet weight) | numeric input, suffix `kg`, placeholder 「请输入」 | No | empty | Orange inline warning under it: 「请填写仔猪总体重，否则将会影响后期生长效益的计算。」 ("Please fill in the total piglet weight, otherwise it will affect the later growth-performance calculation.") — advisory, not blocking. |
| 录入有身份仔猪个体体重 (enter individual weights for identified piglets) | toggle | No | **off** | Only meaningful for piglets that already have an identity. |

### 仔猪性别 (piglet sex) — accordion, collapsed by default

| Field | Type | Required | Default |
|---|---|---|---|
| 公猪数量 (boar count) | stepper − 0 + | No | `0` |
| 母猪数量 (sow count) | stepper − 0 + | No | `0` |

### 留种仔猪 (replacement-stock piglets) — accordion, collapsed by default

Single control: `＋ 选择留种仔猪` (Select replacement-stock piglets) — a full-width green add button. No count field, no list drawn in either frame.

**Controls.** Bottom 确认 (Confirm) — disabled in both frames (nothing entered). Returns to 断奶检查（已编辑）.

**Bulk / scan.** One litter (one sow). No scan control on this screen.

---

## 母猪状态 (sow status) — `439:2028`

**Purpose.** Capture the sow side of the weaning check: body condition, post-farrowing health observations, cull recommendation.

**Header.** Back arrow, title 母猪状态, same identity card + tiles.

### 体况评分 (body-condition score)

Segmented control `1分 · 2分 · 3分 · 4分 · 5分` (1–5 points), nothing preselected. Below it a yellow→green→red gradient bar labelled 消瘦 (thin, left, orange) · 标准 (standard, centre, green) · 肥胖 (obese, right, red).

### 产后检查项目 (post-farrowing check items)

Section subtitle: 「健康状态异常将会作为疾病/症状展示，请酌情填写」 ("Abnormal health states will be displayed as diseases/symptoms — please fill in as appropriate."). All items are segmented single-select, none preselected, none starred:

| Field | Options |
|---|---|
| 乳房炎 (mastitis) | 无 (none) · 轻度 (mild) · 中度 (moderate) · 重度 (severe) |
| 乳汁产能 (milk output) | 差 (poor) · 中 (medium) · 佳 (good) |
| 分泌物 (discharge) | 正常 (normal) · 异常 (abnormal) |
| 采食情况 (feed intake) | 正常 · 进食减少 (reduced intake) · 拒食 (refusing feed) |
| 活动能力 (mobility) | 正常 · 瘸 (lame) · 不愿意动 (unwilling to move) |
| 背膘 (backfat) | 薄 (thin) · 适中 (moderate) · 厚 (thick) |
| 其他观察 (other observations) | multiline textarea, placeholder 「请简单描述」 ("Please describe briefly") |
| 淘汰建议 (cull recommendation) | 不建议淘汰 (do not cull) · 建议淘汰 (recommend culling) |

**Controls.** Bottom 确认 (Confirm) — disabled by default. Returns to 断奶检查（已编辑）.

**Bulk / scan.** Single sow. No scan.

---

## 二次确认 — 提前断奶须知 (early-weaning notice) — `440:1205`

**Purpose.** Gate the weaning submission when the sow is being weaned earlier than the batch plan.

**Controls / copy.** Title 「提前断奶须知」 (Early-weaning notice). Three red ⓘ bullets:

1. 「提前将该猪只移出所在批次」 — Removes this pig from its batch ahead of schedule.
2. 「可能导致该母猪的发情时间与生产计划不匹配」 — May cause this sow's oestrus timing to no longer match the production plan.
3. 「通知管理员」 — The administrator will be notified.

Then an **unchecked checkbox**: 「我已知晓，并确认该猪只将从当前批次中移出。」 ("I understand and confirm that this pig will be removed from the current batch.")

Buttons 取消 (Cancel, enabled) | 确认 (Confirm, **disabled**). The confirm button is gated on the checkbox.

**Bulk / scan.** Single pig ("该猪只" / "该母猪" throughout).

---

## 操作结果 — `473:4015`

Dark centred toast: ✓ + 「操作成功」 (Operation succeeded). No buttons.

---

## 留种 (replacement stock) — what it is and what marking requires

`620:3516` is a **pasted written spec** ("image 27", 1334×732) parked immediately left of the 标记留种 module. It is the highest-authority statement of the rule in the file. Verbatim:

> ### 2.3 工作原理
> 1. 用户在巡检过程中选择仔猪或商品猪
> 2. 用户点击操作栏中的育种状态类别按钮
> 3. 用户从展开的面板中选择"标记为育种"
> 4. 系统打开标记为育种模态框
> 5. 对于没有ID的动物，用户需要：
>    – 指定要标记的无ID猪只数量（每个SKU）
>    – **为动物打耳标** – 系统强制要求在标记为育种之前进行打耳标
>    – **指定性别** – 用户必须为每只动物指定性别，可通过以下方式：
>      – 通过选择耳缺（如果提供了耳缺，性别从耳缺中自动确定）
>      – 单独输入性别（如果未提供耳缺）
>    – 可选地在打耳标过程中提供耳缺信息
>    – 如果未提供耳缺，系统会警告缺少系谱信息，并可选地提示输入母本/父本/出生日期信息
> 6. 对于有ID的动物，直接标记，无需额外步骤
> 7. 系统将选定的动物标记为"标记为育种"状态

Translation: *2.3 Working principle.* (1) During inspection the user selects piglets or commercial pigs. (2) The user taps the breeding-status category button in the action bar. (3) The user picks "mark as breeding" from the expanded panel. (4) The system opens the mark-as-breeding modal. (5) For animals **without an ID**, the user must: specify how many no-ID pigs to mark (per SKU); **ear-tag the animal** — the system *mandatorily requires* ear-tagging before marking as breeding; **specify sex** — the user must give every animal a sex, either by selecting an ear notch (if an ear notch is supplied, sex is derived automatically from it) or by entering sex separately (if no ear notch is supplied); ear-notch information may optionally be supplied during ear-tagging; if no ear notch is supplied the system warns that pedigree information is missing and may optionally prompt for dam/sire/birth-date. (6) For animals **that already have an ID**, mark directly, no extra steps. (7) The system sets the selected animals to "marked as breeding".

So: **留种 = designate a piglet/commercial pig as breeding replacement stock. Its hard prerequisite is that the animal has an identity (ear tag + sex). Pedigree is soft.**

---

## 弹窗 — 标记留种, selection contains ineligible pigs — `654:2397`

**Purpose.** Confirm a bulk 标记留种 when only part of the selection can actually be marked.

**Designer annotation (magenta, inside the frame) — verbatim:**

> 非必经步骤
> 选择的猪只中
> 包含不可执行此操作的猪只时
> 会经过这一步

Translation: "Not a mandatory step. You go through this step **when the selected pigs include pigs that cannot perform this operation**."

**Copy.** Title 标记留种. Body: 「选中的 10 头猪只中，仅有 5 头猪只可执行此操作，确认标记留种吗？」 ("Of the 10 selected pigs, only 5 can perform this operation. Confirm marking as replacement stock?")

**Controls.** 取消 (Cancel, outline) | 确认 (Confirm, solid green, **enabled**).

**Rules.**
- Confirming proceeds on the **eligible subset only** (5 of 10). The ineligible 5 are dropped silently — no list of which pigs, no reason given.
- Confirm branches on identity (arrows `907:4991` and `907:4992`):
  - all eligible pigs already have identity → `650:2870` 操作成功 directly;
  - any eligible pig lacks identity → `620:2857` identity-completion list.

---

## 标记留种 — success (all selected pigs already identified) — `650:2870`

Dark toast ✓ 「操作成功」. Magenta annotation above the frame (`650:3050`) and inside it:

> 所选猪只 全部有身份
> 直接标记成功

Translation: "All selected pigs have an identity → marked successfully, directly."

---

## 标记留种 — identity-completion list — `620:2857` (h = 3600)

**Purpose.** Before the mark can be committed, give an identity to every selected pig that lacks one.

Frame label above it (`620:3508`, magenta): 「所选猪只 包含无身份」 ("The selected pigs include ones with no identity").

**Banner (yellow).** 「当前有 4 头仔猪尚无身份信息，请补充耳标、耳缺及性别信息。」 ("There are currently 4 piglets with no identity information — please supply ear tag, ear notch and sex information.")

**Body.** Pigs grouped by pen card (`A1`, `A2`). This frame is a *before/after* study — magenta labels 补充身份前 (before supplying identity) and 补充身份后 (after supplying identity) mark the two copies of the same list.

Row anatomy and the designer's row-variant labels sitting to the right of the frame (`654:1887`–`654:1895`):

| Row form | Right-hand action | Designer label |
|---|---|---|
| `000001` · `20₁` · 商品猪 · 650 日龄 | none | 「⬅️ 有ID，有批次」 (has ID, has batch) — `654:1887` |
| `000001` · 商品猪 · 650 日龄 (no batch chip) | none | 「⬅️ 有ID，无批次」 (has ID, no batch) — `654:1890` |
| `无ID猪只 1` · `20₁` · 650 日龄 | **补充身份 >** (supply identity) | 「⬅️ 无ID，有批次」 — `654:1888` |
| `No ID Pigs 1` · 650 日龄 | **补充身份 >** | 「⬅️ 无ID，无批次」 — `654:1889` |
| after the wizard: `000001` · `20₁` · 商品猪 · 650 日龄 | **修改身份 >** (modify identity) | 「⬅️ 补充ID后，有批次」 — `654:1894` |
| after the wizard: `000001` · 商品猪 · 650 日龄 | **修改身份 >** | 「⬅️ 补充ID后，无批次」 — `654:1895` |

Rows can also carry a health chip: ⚠ 「发烧，感冒，四肢肿胀，食欲不振」 (fever, cold, swollen limbs, loss of appetite) rendered inline after the ID.

**Controls.** Bottom 提交 (Submit) — disabled in the drawn state; on submit → `654:2275` 操作成功 (arrow `654:2286`). Back arrow → `1234:1748`.

**Bulk / scan.** Operates on the whole selection at once, but identity is supplied **per row**, one pig at a time.

---

## 弹窗 — confirm back-navigation — `1234:1748`

Title 「确认返回吗」 (Confirm going back). Body 「返回后，您已填写的内容将不会被保存，确认要返回吗？」 ("Once you go back, what you have filled in will not be saved. Confirm going back?"). Buttons 取消 | 确认 (green).

---

## 补充身份 / 修改身份 wizard — `1606:1693` → `1606:1767` / `1606:1957` → `1606:1846`

**Purpose.** Give one no-identity pig an identity so it can be marked as 留种.

**Annotation on step 1 (`1606:3276`) — verbatim:**

> ⬆ ️ 点击“补充身份”按钮进入此页面时，页面名称叫“补充身份”
> ️ 点击“修改身份”按钮进入此页面时，页面名称叫“修改身份”

Translation: "When you enter this page via the 补充身份 (Supply identity) button, the page is titled 补充身份; when you enter it via the 修改身份 (Modify identity) button, the page is titled 修改身份."

**Annotation on step 2 (`1606:3277`) — verbatim:**

> ⬆️ 点击“父亲/母亲”选择器后，全局搜索/扫描母猪， 公猪

Translation: "After tapping the father/mother picker, globally search / scan for sows and boars."

**Stepper.** Three steps, shown at the top of all four frames: `1 耳缺信息` (ear-notch info) → `2 系谱信息` (pedigree info) → `3 耳标信息` (ear-tag info). Completed steps become a green ✓.

### Step 1 — 耳缺信息 (`1606:1693`)

| Field | Type | Required | Placeholder | Notes |
|---|---|---|---|---|
| 耳缺号 (ear-notch number) | text input with trailing **ear-notch icon** | No (`*` absent) | 「请填写耳缺号」 ("Please fill in the ear-notch number") | Icon is the same 耳缺 glyph used in the unit search bar. |

Buttons: 跳过 (Skip, outline, enabled) | 下一步 (Next, **disabled** until the field has a value).

### Step 2a — 系谱信息, empty (`1606:1767`)

| Field | Type | Required | Placeholder |
|---|---|---|---|
| 母亲 (dam) | picker row `>` | No | 「请选择母亲」 ("Please select the dam") |
| 父亲 (sire) | picker row `>` | No | 「请选择父亲」 ("Please select the sire") |

Buttons: 上一步 (Back) | 跳过 (Skip) | 下一步 (Next, **disabled**).

### Step 2b — 确认父母, pre-filled (`1606:1957`)

Two **read-only cards**: 「母亲：000001」 and 「父亲：000001」. No picker chevrons, no placeholders.
Buttons: 上一步 | 下一步 (**enabled**, full-width green). **No 跳过 button** — when parentage is known there is nothing to skip.

→ **Parent info is derived when the system knows it (confirm-only), and entered by global search/scan of a sow or boar when it does not.**

### Step 3 — 耳标信息 (`1606:1846`)

| Field | Type | Required | Placeholder / options |
|---|---|---|---|
| 耳标号 (ear-tag number) | text input with trailing **scan icon** | **Yes** (`*`) | 「请填写耳标号或扫描耳标」 ("Please fill in the ear-tag number or scan the ear tag") |
| 性别 (sex) | segmented | **Yes** (`*`) | ♂ 公猪 (boar) · ♀ 母猪 (sow) |

Buttons: 上一步 | 确认 (Confirm, **disabled** until both required fields are set). On confirm the row card in `620:2857` updates (arrow `1606:3273`).

**Scanning.** Step 1 offers ear-notch capture; step 3 offers ear-tag scanning; step 2 offers global search/scan for the parents.

---

## 移除留种 (remove replacement stock) — `654:2292` / `654:2367`

**Purpose.** Strip the 留种 flag from the selected pigs. No identity work — the pigs by definition already have one.

| Node | Case | Copy | Buttons |
|---|---|---|---|
| `654:2292` | Selection contains ineligible pigs | Title 移除留种. Body 「选中的 10 头猪只中，仅有 5 头猪只可执行此操作，确认移除留种吗？」 ("Of the 10 selected pigs, only 5 can perform this operation. Confirm removing the replacement-stock mark?") | 取消 \| 确认 (green, enabled) |
| `654:2367` | All selected pigs eligible | Title 移除留种. Body 「确认移除 1 头猪只的留种吗？」 ("Confirm removing the replacement-stock mark for 1 pig?") | 取消 \| 确认 (green, enabled) |

No result/toast frame is drawn for 移除留种.

---

## Actions this cluster exposes

| Action | Entry point | Subject | Data captured | Effect on state |
|---|---|---|---|---|
| 断奶 (wean) | 生产 drawer → 断奶 (`782:2200`) → 先询问 (`470:2388`) | **1 sow only** (`853:2119`) | Litter: 健仔/弱仔/畸形 counts, auto total, 仔猪总体重, optional individual weights, 公猪/母猪 counts, 留种仔猪 selection. Sow: 体况评分 1–5, 乳房炎, 乳汁产能, 分泌物, 采食情况, 活动能力, 背膘, 其他观察 text, 淘汰建议. | Pig removed from its batch (`该猪只将从批次中移出`); 生产状态 → 空怀 (open/empty); admin notified when weaning early (`440:1205`). Toast 操作成功. |
| 寄养 (foster) | 先询问 → 寄养 | 1 sow | — | Leaves this cluster (fostering flow, module 生产－寄养). |
| 标记留种 (mark replacement stock) | 生产 drawer → 标记/移除留种 → 提示 chooser (`907:4225`) | **1 or N pigs** (`853:2119`) | For pigs lacking identity: 耳缺号 (optional), 母亲/父亲 (optional or confirm), **耳标号 (required)**, **性别 (required)** | Selected eligible pigs get the "留种 / marked as breeding" state; no-identity pigs additionally gain an ear tag + sex. Toast 操作成功 (`650:2870` or `654:2275`). |
| 补充身份 / 修改身份 (supply / modify identity) | 补充身份 or 修改身份 link on a row of `620:2857` | **1 pig per invocation** | as above | Row changes from 无ID猪只 N to a real ID with a 修改身份 link. |
| 移除留种 (remove replacement stock) | 生产 drawer → 标记/移除留种 → 提示 chooser | **1 or N pigs** | none | 留种 flag cleared on the eligible subset. No result frame drawn. |

---

## Rules & conditionality

### Bulk eligibility — the exact rule

**`853:2119`** (magenta, at x 4050 / y 6688, annotating the sub-function drawers) — verbatim:

> ⬆️ 点击底部某个父功能按钮后，使用抽屉展示其子功能
> 所选的猪只 可使用该子功能时，子功能为可用态，反之为禁用态
> 发情、意外妊娠、流产、分娩、断奶：只能作用于 单头猪，选择多头猪时，此按钮禁用
> 标记留种、移除留种标记：可作用于 单头猪或多头猪

Translation: "After tapping one of the bottom parent-function buttons, a drawer shows its sub-functions. When the selected pigs **can** use that sub-function, the sub-function is enabled; otherwise it is disabled. **发情 (estrus), 意外妊娠 (unexpected pregnancy), 流产 (abortion), 分娩 (farrowing), 断奶 (weaning): can only act on a single pig — when multiple pigs are selected this button is disabled. 标记留种 (mark replacement stock), 移除留种标记 (remove replacement-stock mark): can act on a single pig or on multiple pigs.**"

**`853:2023`** — 「⬅️ 未选择猪只时，或选择的猪只 不可执行 某操作时 底部操作功能按钮（父功能） 禁用」 ("When no pigs are selected, or when the selected pigs cannot perform an operation, the bottom action buttons (parent functions) are disabled.")

**`853:2065`** — 「⬆️ 选择猪只后，或选择的猪只 可执行 某操作时 底部操作功能按钮（父功能） 可用」 ("After pigs are selected, or when the selected pigs can perform an operation, the bottom action buttons (parent functions) are enabled.")

So eligibility is enforced at **three levels**:

1. **Parent function** (生产 / 健康 / 记录 in the bottom bar) — disabled when nothing is selected, or when the selection can do nothing in that category (`853:2023`, `853:2065`).
2. **Sub-function** (icon inside the drawer) — disabled when the selection cannot use it. For the five single-pig actions (发情、意外妊娠、流产、分娩、断奶) "cannot use it" includes *"more than one pig is selected"* (`853:2119`). 留种 marking/removal is exempt: it takes 1..N.
3. **Confirmation dialog** — a *partially* eligible selection is allowed through, with a count-based warning:

   | Case | Dialog | Copy template |
   |---|---|---|
   | Some selected pigs ineligible | `654:2397` (标记留种), `654:2292` (移除留种) | 「选中的 **{N}** 头猪只中，仅有 **{M}** 头猪只可执行此操作，确认{标记留种\|移除留种}吗？」 |
   | All selected pigs eligible | `654:2367` (移除留种 only) | 「确认移除 **{N}** 头猪只的留种吗？」 |

   **`654:2397` annotation:** 「非必经步骤 / 选择的猪只中 / 包含不可执行此操作的猪只时 / 会经过这一步」 — "Not a mandatory step; you go through this step when the selected pigs include pigs that cannot perform this operation."

   In the mixed case 确认 is **enabled** and green. Confirming executes on the **M eligible pigs only** and silently drops the N−M ineligible ones. The dialog never names them or says why they are ineligible. There is no "select only the eligible ones" affordance and no partial-result screen.

### Identity branching for 留种

- `650:3050` — 「所选猪只 全部有身份 / 直接标记成功」 → all selected pigs already have an identity ⇒ mark commits immediately, straight to 操作成功 (`650:2870`).
- `620:3508` — 「所选猪只 包含无身份」 → any selected pig lacks an identity ⇒ route to the identity-completion list (`620:2857`) and block 提交 until they are given one.
- `620:3516` (written spec) — 「系统强制要求在标记为育种之前进行打耳标」 (the system mandatorily requires ear-tagging before marking as breeding) and 「用户必须为每只动物指定性别」 (the user must specify a sex for every animal). Ear notch and pedigree are optional; 「如果未提供耳缺，系统会警告缺少系谱信息」 (if no ear notch is given, the system warns that pedigree information is missing).

### Weaning-specific rules

- Batch-membership banner variants: `440:1089` 属于批次 (belongs to a batch) vs `440:1108` 不属于批次 (does not belong to a batch), both over the pig-state list 「空怀/后备，已发情，已配种，已妊娠，成长期」.
- **`850:2000`** (plain text, at x 5247 / y 16982) — 「这里的判断逻辑不是属于不属于批次，而是这头猪所在批次是否还有查情，配种，分娩，断奶（其中任意一个），如果没有，那就出发这条」 ("The judgment logic here is not whether it belongs to a batch or not, but whether the batch this pig is in still has 查情 (heat check) / 配种 (mating) / 分娩 (farrowing) / 断奶 (weaning) — any one of them; if none, then this one is triggered."). This note is a **correction to the 属于批次 / 不属于批次 labelling convention**, but it is parked next to the 发情 module, not next to the weaning frames — see Ambiguities.
- Weaning always sets 生产状态 → 空怀 and removes the pig from its batch (`439:1869`, `473:4319`).
- Early weaning additionally requires an explicit acknowledgement checkbox before 确认 becomes enabled (`440:1205`), and notifies the administrator.
- 仔猪总数量 is computed, never typed: 「填写明细后自动计算总数」 (`439:2228`).
- Total piglet weight is advisory, not blocking: 「请填写仔猪总体重，否则将会影响后期生长效益的计算。」 (`1701:1656`).
- Abnormal sow findings feed the disease/symptom system: 「健康状态异常将会作为疾病/症状展示，请酌情填写」 (`439:2028`).
- Related upstream rule for no-ID pigs in the selection (`907:4178`, on the pig list): 「勾选单条数据时，若为无 ID 猪只，需立即填写无 ID 猪只数量 / 勾选整个栏位时，无需且不可填写无 ID 猪只数量」 ("When you tick a single row that is a no-ID pig, you must immediately enter the no-ID pig count; when you tick a whole pen, no count is entered and it cannot be entered.") — this is what supplies the N in "4 头仔猪尚无身份信息".

---

## Ambiguities / contradictions found

1. **Two different production drawers.** `782:2200` (子功能-生产) shows row 2 as **断奶 · 标记/移除留种** — one combined entry, which is what makes the `907:4225` 提示 chooser necessary. The dimmed drawer *behind* the chooser in `907:4225` shows **断奶 · 标记留种 · 移除留种标记** — three separate entries, which would make the chooser redundant. Only one can ship. The `853:2119` annotation uses the three-button naming (「标记留种、移除留种标记」), which argues the split version is the intended model and the chooser is legacy.

2. **The all-eligible 标记留种 confirmation is not drawn.** `654:2397`'s annotation says the mixed dialog is 非必经步骤 (only reached when the selection is mixed), and no all-eligible counterpart exists in the 标记留种 module — implying an all-eligible 标记留种 goes straight through with no confirmation. But the 移除留种 module drew **both** cases (`654:2292` mixed, `654:2367` all-eligible). Either 标记留种 skips confirmation when everything is eligible (asymmetric with 移除留种), or the frame is simply missing.

3. **移除留种 has no result frame.** Nothing is drawn after 确认 on `654:2292` / `654:2367`. By analogy with 标记留种 it should be a 操作成功 toast, but that is inference, not design.

4. **The mixed-eligibility dialog gives no diagnostics.** 「仅有 5 头猪只可执行此操作」 states the count but never which pigs or why. There is no way to inspect or de-select the ineligible 5, and no partial-result report after 确认.

5. **What makes a pig ineligible for 留种 is never stated anywhere in the file.** The written spec (`620:3516`) says the flow starts by selecting 仔猪或商品猪 (piglets or commercial pigs) — implying breeding-stock sows/boars are out of scope — but no screen or annotation states the eligibility predicate for either 标记留种 or 移除留种. (For 移除留种 the obvious predicate would be "is currently marked 留种", but it is not written down.)

6. **公/母 shows a single value.** In `473:4038` the 公/母 (boar/sow) summary row reads just `5`, while the editor (`1701:1656`) captures two separate numbers (公猪数量 and 母猪数量). Whether the summary is meant to be `5/5`, or truncated, or a boar-only count, is unresolved.

7. **The 留种 summary row is never populated.** In the fully-filled `473:4038` every other row has a value but 留种 stays `-`, and `1701:1656`'s 留种仔猪 accordion contains only an empty `＋ 选择留种仔猪` button. What the picker shows, whether it is count-based or identity-based, and how it interacts with the standalone 标记留种 flow are all undrawn.

8. **Banner-condition wording contradicts the annotation.** `473:4319`'s banner says 「猪只不属于任何生产批次」 (the pig belongs to no production batch) and the frame labels say 属于批次 / 不属于批次, but `850:2000` explicitly denies that batch membership is the test — the real test is whether the pig's batch still has any of 查情/配种/分娩/断奶 outstanding. The annotation sits next to the 发情 module (x 5247, y 16982), ~21 000 px from these frames, so whether it is scoped to 发情 only or to every banner of this shape is not determinable from the file.

9. **`620:2857`'s banner over-states the requirement.** It asks for 「耳标、耳缺及性别信息」 (ear tag, ear notch **and** sex), but in the wizard only 耳标号 and 性别 carry `*`; 耳缺号 is skippable and the written spec calls it optional.

10. **Sex-from-ear-notch derivation is specified but not designed.** `620:3516` says 「如果提供了耳缺，性别从耳缺中自动确定」 (if an ear notch is supplied, sex is derived from it automatically). Step 3 (`1606:1846`) always shows 性别 as a required, empty segmented control with no pre-fill or read-only state — the derivation is nowhere in the UI.

11. **Pedigree warning is specified but not designed.** `620:3516` says the system warns about missing pedigree when no ear notch was given, and may optionally prompt for 母本/父本/出生日期 (dam/sire/birth date). No such warning appears on any wizard step, and **出生日期 (birth date) is not a field anywhere in the wizard**.

12. **Weaning-check submit gating is inferred, not stated.** 总数量 is the only starred field on `439:1869`, and 提交 is disabled there and enabled on `473:4038`; but 473:4038 also fills the sow side and the weight, so the exact enable predicate is not isolated by the frames.

13. **`439:2228` vs `1701:1656` differ only by accordion state,** yet both are kept as separate top-level frames with no annotation saying which is canonical; `439:2228` is named （默认状态）(default state) so the collapsed one is presumably the shipping default.
