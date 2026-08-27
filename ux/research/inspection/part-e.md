# Part E — 记录 (Records): weight, backfat, temperature, transfer, fostering, report-missing

Figma file `4GZGPBauEOWQQjnRrzoUgF` (巡检 / Inspection). All coordinates below are canvas
coordinates on the single section `60:408 巡检`; they are quoted because the file has **no
prototype links** — flow order is expressed purely by left-to-right frame placement inside a
`模块标题` (module-title) band.

The 记录 cluster occupies the canvas band `y ≈ 26820–31268`, under six module titles:

| Module title node | Text | x |
|---|---|---|
| `510:2212` | 记录-体重 (Record–weight) | 4050 |
| `290:2111` | 记录-背膘 (Record–backfat) | 9600 |
| `293:2421` | 记录-体温 (Record–temperature) | 12300 |
| `300:990` | 记录-上报失踪 (Record–report missing) | 14050 |
| `293:2960` | 记录-转移 (Record–transfer) | 15800 |
| `473:4436` | 记录-寄养 (Record–fostering) | 23250 |

---

## Screen inventory

| Node | Screen (中文) | English | Purpose |
|---|---|---|---|
| `853:2173` | 子功能-记录 | Sub-function drawer: Records | Bottom sheet listing the 6 record actions (documentation copy, in the drawer-overview row y=5024) |
| `854:2488` | 子功能-记录 | Sub-function drawer: Records | **Pixel-identical duplicate** of `853:2173`, placed as the entry frame of the 记录-转移 module band |
| `854:3491` | 功能禁用态 | Drawer, all-disabled state | Same 6 rows, all greyed |
| `319:1005` | 记录体重 | Record weight (1 pig) | Enter a single pig's weight |
| `319:1065` | 体重-总体重-记录个体体重：关 | Weight, total mode, individual OFF | Enter one group weight for N pigs |
| `607:1824` | 体重-总体重-记录个体体重：开（默认状态） | …individual ON, default | Group weight + empty individual-weight sub-panel |
| `620:2752` | 体重-总体重-记录个体体重：开（编辑状态） | …individual ON, edited | Group weight + ID/weight rows added by scan or manual |
| `2092:1996` | 体重-总体重-记录个体体重：开（编辑状态） | **later iteration**, toggle OFF | Total weight only; no mode selector |
| `2092:1784` | 体重-总体重-记录个体体重：开（编辑状态） | **later iteration**, toggle ON | Total weight + one weight field per already-selected pig |
| `607:1928` | 体重-个体体重 | Weight, individual mode | One required weight field per selected pig |
| `1476:1796` / `1476:1785` | (floating 组) | Radio-button alternative for 体重记录方式 | Unplaced design alternative sitting above `607:1824` |
| `290:2115` | 背膘（只可单只记录） | Backfat (single-pig only), qualitative | Record backfat as 薄/适中/厚 |
| `607:1996` | 背膘（只可单只记录） | Backfat (single-pig only), quantitative | Record backfat thickness in mm |
| `293:2425` | 体温（只可单只记录） | Temperature (single-pig only) | Record body temperature in °C |
| `300:1048` | 上报失踪-二次确认 | Report missing — confirmation | Confirm marking N pigs as missing |
| `749:5903` | 选择位置 | Select location | Zone→workshop→house tree for the transfer target |
| `128:1082` | 默认为：选择当前单元的栏位 | Default: pick a pen in the current unit | Auto-raised 选择栏位 drawer with unit/pen wheels |
| `296:1133` | 二次确认 | Transfer confirmation dialog | Confirm move of N pigs to a pen (path shown when **all pigs have IDs**) |
| `612:2414` | 默认态 (h=3000) | Transfer-confirm page, default | Choose which pen health records follow the pigs (path when the selection **includes ID-less pigs**) |
| `749:4264` | 编辑态 (h=3000) | Transfer-confirm page, edited | Same page after 移动/复制 tags applied |
| `749:6023` | 操作结果 | Result | Toast 操作成功 |
| `473:4569` | 选择寄养类型 | Choose fostering type — **寄养转出 selected** | Branch A: foster-out |
| `473:4586` | 选择寄养类型 | Choose fostering type — **寄养接收 selected** | Branch B: foster-in |
| `473:4793` | 1、选择接收的母猪（分娩阶段） | Pick receiving sow, farrowing stage | Branch A step 1 |
| `473:4845` | 1、选择转出的母猪（分娩阶段） | Pick source sow, farrowing stage | Branch B step 1 |
| `473:4603` | 1、选择接收的母猪（仔猪处理阶段）h=2000 | Pick receiving sow, piglet-processing stage | Branch A step 1 |
| `473:4698` | 1、选择转出的母猪（仔猪处理阶段）h=2000 | Pick source sow, piglet-processing stage | Branch B step 1 |
| `473:5017` | 2、选择要转出的仔猪 | Pick piglets to move — **count stepper drawer** | Step 2, ID-less piglets |
| `473:5041` | 2、选择要转出的仔猪 | Pick piglets to move — **identified list page** | Step 2, piglets with ear tags / ear notches |
| `473:5214` | 底部按钮 (floating) | Alternate bottom bar for step 2 | Warning banner + 上一步/下一步 |
| `473:5156` | 3、补充转出的仔猪的身份信息（非必经步骤） | Supplement piglet identity (optional step) | Step 3 |
| `473:4962` | 4、寄养结果确认 | Fostering result confirmation | Step 4, no task-icon row |
| `473:4897` | 4、寄养结果确认 | Fostering result confirmation | Step 4, **with** piglet-processing task icons |

---

## 子功能-记录 — `853:2173` and `854:2488`

**Purpose.** Bottom sheet raised from a parent action button on the pig-list screen; shows the six
child actions in the 记录 (Record) family.

**Controls.** Header `记录` (Record) with a close ✕ (`close-line`). Content = 4-column grid,
2 rows, 6 tiles. Every tile is icon-over-label:

| # | Label (中文) | English | Icon layer name | Subject |
|---|---|---|---|---|
| 1 | 体重 | Weight | `remove` (−) | 1 pig only |
| 2 | 背膘 | Backfat | `vital_signs` (∿) | 1 pig only |
| 3 | 温度 | Temperature | `skull` | 1 pig only |
| 4 | 转移 | Transfer | `skull` | 1 or N pigs |
| 5 | 寄养 | Fostering | `add_2` (+) | 1 or N pigs |
| 6 | 上报失踪 | Report missing | `not_listed_location` | 1 or N pigs |

Note the drawer label is **温度** (temperature) while the destination screen and its module title
are **体温** (body temperature) — `293:2425` / `293:2421`.

**Diff between the two variants — there is none.** `get_metadata` on both returns identical layer
trees (`853:2174…853:2299` vs `854:2489…854:2530`): same six groups, same icon layer names, same
order, same geometry (750×1624 frame, drawer at y=1112, 750×512). The only difference is canvas
position: `853:2173` at (6900, 5024) sits in the **drawer-documentation row** next to
`782:2200 子功能-生产`, `853:2120 子功能-健康`, `907:4225 标记/移除留种`; `854:2488` at
(15800, 27244) is a copy pasted at the head of the 记录-转移 band as that flow's entry point.

**Rules (annotation `654:2366`, magenta, directly under `853:2173`):**
> 体重、背膘、温度：只能作用于 单头猪，选择多头猪时，此按钮禁用
> 转移、寄养、上报失踪：可作用于 单头猪或多头猪

("Weight, backfat, temperature: can only act on a **single pig**; when multiple pigs are selected
this button is disabled. Transfer, fostering, report-missing: can act on **one pig or many pigs**.")

Sibling annotation `853:2119` (under the 子功能-生产 drawer) gives the general drawer rule:
> 点击底部某个父功能按钮后，使用抽屉展示其子功能
> 所选的猪只 可使用该子功能时，子功能为可用态，反之为禁用态
> 发情、意外妊娠、流产、分娩、断奶：只能作用于 单头猪，选择多头猪时，此按钮禁用
> 标记留种、移除留种标记：可作用于 单头猪或多头猪

("After tapping one of the bottom parent-function buttons, a drawer shows its sub-functions. When
the selected pigs *can* use that sub-function it is enabled, otherwise disabled…")

**Disabled state — `854:3491 功能禁用态`.** All six tiles rendered greyed simultaneously. Its icon
assignment is shifted by one relative to the enabled frame (体重=−, 背膘=−, 温度=∿, 转移=skull,
寄养=skull, 上报失踪=+); the `not_listed_location` pin is absent. Both frames are therefore using
placeholder icons.

**Bulk / scan.** No scanning in the drawer itself. Selection has already happened on the pig-list
screen behind it (visible in the blurred backdrop: `已选 20 头` "20 selected").

---

## 记录体重 — `319:1005` (single pig)

Canvas label above the frame (`607:1978`): **⬇ 一头猪** ("one pig").

**Purpose.** Record the weight of exactly one pig.

**Controls.** Back arrow; title 记录体重 (Record weight); bottom 提交 (Submit) — **disabled**
(pale green) because the required field is empty.

**Fields.**

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| 已选猪只：000001 | read-only header (`607:1780`) | – | – | **No chevron** — not tappable, unlike the multi-pig variants |
| 体重 (Weight) | number input | ✱ (`319:1015`) | empty | placeholder "请输入体重"; suffix unit **kg** |

**Rules.** No mode selector, no toggle — a single pig has only one weight.

---

## 体重-总体重-记录个体体重：关 — `319:1065` (N pigs, total mode, toggle off)

Canvas label above the frame (`607:1980`): **⬇ 多头猪** ("multiple pigs").

**Controls / fields.**

| Element | Type | Required | Default | Notes |
|---|---|---|---|---|
| 已选 10 头猪 | header card + `arrow_forward_ios` chevron | – | – | Tappable → the selected-pig list |
| 体重记录方式 (Weight recording mode) | 2-way segmented (`总体重` / `个体体重`) | ✱ | **总体重** (total) | `1476:1859` "数字" control |
| 总体重 (Total weight) | number input | ✱ | empty | placeholder "请输入总体重"; unit **kg** |
| 记录个体体重 (Also record individual weights) | card + Toggle (`607:1816`) | – | **OFF** (knob at x=4) | |
| 提交 | primary button | – | **disabled** | |

**Rules.** With the toggle OFF the screen captures **one number for the whole selection** —
no per-pig data at all.

---

## 体重-总体重-记录个体体重：开（默认状态） — `607:1824`

Same as above but the toggle is **ON** (knob at x=40). Turning it on expands the card
(`749:4188`, 380 px tall) to reveal:

| Element | Type | Notes |
|---|---|---|
| 请添加猪只 | empty-state placeholder card (`749:4194`) | "Please add pigs" |
| 扫描耳标 (Scan ear tag) | button with `qr-scan-2-line` icon | **This is the scan entry point for weight** |
| 手动添加 (Add manually) | button with `add` icon | |

提交 still disabled. The individual-weight list starts **empty** — it is *not* pre-populated with
the 10 selected pigs.

---

## 体重-总体重-记录个体体重：开（编辑状态） — `620:2752`

Card grows to 704 px and holds three ID+weight rows (`620:3557`, `620:3592`, `643:2842`), each:

| Sub-control | Type | Notes |
|---|---|---|
| ID cell | text input | row 1 placeholder "000001" (grey), row 2 filled "000002" (black), row 3 placeholder "ID" — three different placeholder treatments in one list |
| Weight cell | number input | row 1 filled "10", rows 2–3 placeholder "体重"; unit **kg** |
| ✕ | `close` icon (`620:3588`) | removes that row |

扫描耳标 / 手动添加 remain at the bottom of the card. A magenta arrow vector (`643:2856`) points
from the row list to **手动添加**, i.e. rows are produced by that button (and by scanning).
提交 is now **enabled** (solid green).

---

## 体重-个体体重 — `607:1928` (individual mode)

Reached by switching 体重记录方式 to **个体体重**.

| Element | Type | Required | Notes |
|---|---|---|---|
| 已选 10 头猪 | header + chevron | – | |
| 体重记录方式 | segmented, 个体体重 selected | ✱ | |
| 000001 / 000002 / 000003 … | one weight input **per selected pig**, labelled by pig ID | ✱ each (`607:1943`, `620:2705`, `620:2712`) | placeholder "请输入体重"; unit **kg** |

No 总体重 field, no scan, no add/remove — the row set is fixed to the pigs already selected.
提交 disabled while empty.

---

## The later weight iteration — `2092:1996` and `2092:1784`

These two frames (node ids ~2092, i.e. created after the 319/607/620 set) sit on a second row at
y≈29017 directly beneath their predecessors and describe a **different model**:

* **The 体重记录方式 segmented control is gone entirely.** Metadata for `2092:1997` and
  `2092:1785` contains no "数字" segmented group.
* 总体重 ✱ is always present (placeholder "请输入总体重", kg).
* 记录个体体重 toggle OFF (`2092:1996`) → nothing else.
* Toggle ON (`2092:1784`) → the card expands to hold **one labelled weight field per selected
  pig** (000001 / 000002 / 000003, placeholder "请输入体重", kg) — i.e. the `607:1928` behaviour
  folded into the toggle. **These per-pig fields carry no `*`** (metadata `2092:1975`,
  `2092:1982`, `2092:1989` each have a single text child and no asterisk sibling), whereas the
  equivalents in `607:1928` do.
* 提交 is drawn **enabled** in both, even with 总体重 empty.

So the file contains **two mutually exclusive weight models** and does not mark which one wins.

**Unplaced alternative** `1476:1796` / `1476:1785` (floating above `607:1824`, not inside any
frame): 体重记录方式 ✱ rendered as two **radio buttons** — 总体重 / 个体体重 — instead of a
segmented control. Two states are drawn (总体重 checked, 个体体重 checked).

---

## 背膘（只可单只记录）— `290:2115` (qualitative) and `607:1996` (quantitative)

The single-pig constraint is stated in the **frame name itself**: 「背膘（**只可单只记录**）」
= "Backfat (**can only be recorded for a single pig**)", and again in annotation `654:2366`
quoted above.

**Controls / fields.**

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| 已选猪只：000001 | read-only header, **no chevron** | – | – | single pig |
| 背膘评估方式 (Backfat assessment method) | 2-way segmented 定性 / 定量 | ✱ | **定性** (qualitative) | |
| 背膘测量值 (Backfat measurement) — *定性 branch* | 3-way segmented 薄 / 适中 / 厚 (thin / moderate / thick) | ✱ | **none selected** | `290:2115` |
| 背膘厚度 (Backfat thickness) — *定量 branch* | number input | ✱ | empty | placeholder "请输入背膘厚度"; unit **mm**; `607:1996` |

**Rules.** The two frames are the two branches of 背膘评估方式 — switching the segment swaps the
second field between a 3-option chooser and a mm input. 提交 disabled in both (nothing entered).

---

## 体温（只可单只记录）— `293:2425`

Single-pig constraint again stated in the frame name: 「体温（**只可单只记录**）」.

| Field | Type | Required | Notes |
|---|---|---|---|
| 已选猪只：000001 | read-only header, no chevron | – | single pig |
| 体温 (Body temperature) | number input | ✱ (`607:1991` group) | placeholder "请输入体温"; unit **°C** |

提交 disabled. No mode selector, no branching.

---

## 上报失踪-二次确认 — `300:1048`

**Purpose.** Confirm reporting the selected pigs as missing. **This dialog is the whole flow** —
there is no data-entry screen for 上报失踪 anywhere in the band.

**Controls.** Modal over a dimmed backdrop. Title 上报失踪. Body:
> 确认将 12 头猪只上报为失踪吗？
>
> 上报后失踪，您可在「工具箱 → 失踪列表」中查看并管理相关猪只。

("Confirm reporting 12 pigs as missing? / After reporting missing, you can view and manage the
relevant pigs in 「Toolbox → Missing list」.")

Buttons: 取消 (Cancel, outline) / 上报失踪 (Report missing, primary green).

**Data captured.** Nothing beyond the pig selection — no reason, no date, no photo, no notes.

**Effect on state.** Pigs move to a **失踪列表 (missing list)** reachable from 工具箱 (Toolbox);
that destination screen is **not in this file**.

**Bulk.** Bulk — the count is templated ("12 头猪只").

Note the copy defect: 「上报后失踪」 reads as "after reporting, missing"; the intended phrasing is
almost certainly 「上报失踪后」 ("after reporting missing").

---

## 转移 (Transfer) — is it a pen move? **Yes.**

Module title `293:2960` = 记录-转移. Every screen in the band is titled **转移** and the
confirmation reads 「确认将 12 头猪只转移至 1区 - 后备车间 - 1舍 - A1 吗?」 — a move of pigs to a
**栏位 (pen)** inside the zone→workshop→house→unit→pen hierarchy.

### 选择位置 — `749:5903`

**Purpose.** Choose the destination location.

**Controls.**
* Nav bar, title 转移. No bottom button on this screen.
* Header card 已选 10 头猪 + `arrow_forward_ios` chevron → selected-pig list.
* Expandable tree (`749:5910`, `749:5941`, `749:5947`):

| Row | Level | Affordance | Sample |
|---|---|---|---|
| `749:5911` | 区 (zone) | `stat_1` expand/collapse, expanded | 1区 |
| `749:5916` | 车间 (workshop) | `stat_1`, expanded | 后备车间 |
| `749:5921`, `749:5926` | 舍 (house) | trailing `arrow_forward_ios` → drills in | 1舍, 2舍 |
| `749:5931`, `749:5936` | 车间, collapsed | `stat_minus_1` | 后备车间, 母猪车间 |
| `749:5942`, `749:5948` | 区, collapsed | leading `arrow_forward_ios` | 2区, 3区 |

Two different collapse affordances are used at the same tree level (`stat_1`/`stat_minus_1` inline
vs a leading `arrow_forward_ios` on the collapsed zone cards) — inconsistent.

**Rule (annotation `749:5975`, magenta, directly under the frame):**
> 点击"转移"按钮后，先进入这个页面
> 然后立马自动唤起右侧"选择栏位"的抽屉
>
> 原因是：
> 默认转移至当前"区-车间-单元"的其他栏位
> 所以默认是让用户选择当前"区-车间-单元"的其他栏位
> 也可以关闭"选择栏位"的抽屉，重新选择"区-车间-单元"

("After tapping the '转移' button you first land on this page, then the '选择栏位' (select pen)
drawer on the right is raised automatically straight away. The reason is: the default is to
transfer to **another pen in the current 区-车间-单元**, so by default the user is asked to pick
another pen in the current 区-车间-单元; they can also close the '选择栏位' drawer and re-select
the 区-车间-单元.")

Note the annotation names the hierarchy **区-车间-单元**, but the tree in `749:5903` shows
**区-车间-舍** and the drawer header shows **1区 - 后备车间 - 1舍**. 舍 (house) is an extra level
the annotation does not mention.

### 默认为：选择当前单元的栏位 — `128:1082`

**Purpose.** The auto-raised pen picker described above. Frame name = "default: select a pen of
the current unit".

**Controls.**
* Drawer nav bar: title 选择栏位 (Select pen) + ✕ close.
* Header card `612:2163` showing the current path **1区 - 后备车间 - 1舍**.
  Annotation `1740:1713` (magenta, arrow pointing left at this card): **「只是展示 不能操作」**
  ("display only, cannot be operated").
* Two-column wheel picker `128:1089`:
  * 第一列 (col 1): 请选择 / E / F / G — the 单元 (unit)
  * 第二列 (col 2): 请选择 / 2 / 3 — the 栏位 (pen)
  Both wheels rest on **请选择** ("please select"), i.e. nothing chosen.
* 确认 (Confirm) — **disabled** while either wheel is on 请选择.

### 二次确认 — `296:1133`

Canvas label above the frame (`749:5401`): **⬇ 全部为有ID猪只** ("all are pigs **with** IDs").

Dialog, title 转移, body 「确认将 12 头猪只转移至 1区 - 后备车间 - 1舍 - A1 吗?」, buttons
取消 / 确认 (primary green). This is the **short path**: pick pen → confirm → done.

### 默认态 — `612:2414` (h=3000) and 编辑态 — `749:4264` (h=3000)

Canvas label above `612:2414` (`749:5402`): **⬇ 包含无ID猪只** ("**includes pigs without IDs**").

So the transfer flow **forks on whether the selection contains ID-less pigs**: all-identified →
the one-tap dialog `296:1133`; contains ID-less pigs → this full confirmation page.

**Structure (both frames).**

| Section | Content |
|---|---|
| 确认信息 (Confirm info) | Card 「已选 1 头猪（可查看猪只列表，不能改位置」 (default) / 「已选 10 头猪（可查看猪只列表，不能改位置」 (edited), sub-line 「转移至：1区 - 后备车间 - 2舍 - 1单元」, chevron |
| 转移健康数据 (Transfer health data) | Card 「共 2 种疾病，4 项症状，1 个治疗」 / 「请选择需跟随猪只转移的疾病、症状或治疗。」 + master checkbox |
| Accordion groups | 疾病类型名称 › 疾病名称/简称 ⓘ · 症状类型名称 › 症状名称/简称 ⓘ · 综合 › 虚弱 ⓘ, 生长缓慢 ⓘ · 注射-皮下注射 › 阿莫西林 · 注射-肌肉注射 › 电解质水 — each row has a checkbox and, for symptoms, an ⓘ info affordance |
| Bottom bar | 移动 (Move) · 复制 (Copy) · 提交 (Submit) |

**默认态 `612:2414`:** nothing checked; master checkbox empty; **移动 and 复制 disabled**;
提交 enabled.
**编辑态 `749:4264`:** master checkbox indeterminate (green minus); 疾病名称/简称 checked;
阿莫西林 carries a green **移动** tag and 电解质水 a green **复制** tag; bottom bar gains a
status line **「已选择 1 种疾病」** ("1 disease selected") and 移动 / 复制 are enabled.

The literal card label 「已选 1 头猪（**可查看猪只列表，不能改位置**」 has an unclosed opening
parenthesis — a designer note ("can view the pig list, cannot change the location") has been baked
into what is otherwise production copy.

**Rules — annotation `854:3421` (under `612:2414`):**
> 疾病/症状/治疗 不做"移动 / 复制"标记，
> 点击提交，是 只转移猪只，
> 猪只身上的 疾病/症状/治疗 不跟随猪只转移至新栏位

("If no 'move / copy' mark is put on the diseases/symptoms/treatments, tapping submit **transfers
only the pigs**; the diseases/symptoms/treatments on the pigs do **not** follow them to the new
pen.")

**Rules — annotation `854:3422` (under `749:4264`):**
> 疾病/症状/治疗 做了"移动 / 复制"标记（提交后才生效），
> 点击提交，是 只转移猪只，
> 并且 移动 / 复制 猪只身上的 疾病/症状/治疗 到新栏位
>
> 移动：疾病/症状/治疗，移动至新栏位，从原栏位移除
> 复制：疾病/症状/治疗，复制至新栏位，原栏位仍保留

("If diseases/symptoms/treatments **are** marked 'move / copy' (**effective only after submit**),
tapping submit transfers the pigs **and** moves/copies the diseases/symptoms/treatments on those
pigs to the new pen. **Move**: the disease/symptom/treatment moves to the new pen and is **removed
from the original pen**. **Copy**: it is copied to the new pen and **retained in the original
pen**.")

The move/copy targets are **栏位 (pens)**, not pigs — which is why this page appears exactly when
the selection contains ID-less pigs, whose health records live on the pen rather than on an
individual animal.

### 操作结果 — `749:6023`

Dark centred toast: ✓ **操作成功** ("Operation succeeded"). This is the only result screen in the
whole 记录 band; weight, backfat, temperature and 上报失踪 have no result frame of their own.

---

## 寄养 (Fostering) — `473:4569` … `473:4897`

Entered from the 寄养 tile of the 记录 drawer; per `654:2366` the subject may be **one or many
pigs**.

### 选择寄养类型 — `473:4569` (foster-out) and `473:4586` (foster-in)

**Purpose.** Choose the direction of the fostering event before anything else.

Modal, title 寄养. Two icon buttons, mutually exclusive:

| Option | English | `473:4569` | `473:4586` |
|---|---|---|---|
| 寄养转出 | Foster **out** (send piglets away) | **selected** (green outline + green label) | unselected |
| 寄养接收 | Foster **in** (receive piglets) | unselected | **selected** |

Buttons 取消 / 确认.

**The two variants are the two branches of one dialog, not redundant copies.** Their consequences
diverge on the next screen: `473:4569` (转出 selected, y=27244) leads to the **接收母猪**
(receiving-sow) pickers on the y=27244 row; `473:4586` (接收 selected, y=29644) leads to the
**转出母猪** (source-sow) pickers on the y=29644 row. In other words the user always picks *the
other end* of the transfer.

**Defect:** the 寄养接收 tile uses a different icon in each variant — `login-box-line`
(`473:4579`) in `473:4569` vs `logout-box-r-line` (`473:4596`) in `473:4586`. Visually the arrow
points into the box in one and out of it in the other.

### Step 1 — sow pickers, split by stage

Four frames = 2 directions × 2 stages. The **stage** is a property of the sow's litter, not a
user choice; the screens differ in what each sow row shows.

| Node | Direction | Stage | Section header | Count card | Search affordances | 下一步 |
|---|---|---|---|---|---|---|
| `473:4793` | receiving | 分娩 (farrowing) | 选择接收母猪 | 共 20 头 | 耳标号/栏位 + **scan** + **ear-notch** + filter | disabled |
| `473:4845` | source | 分娩 | 选择转出母猪 | 共 3 头母猪 | 耳标号/栏位 + filter only (**no scan / ear-notch**) | disabled |
| `473:4603` | receiving | 仔猪处理 (piglet processing) | 选择接收母猪 | 共 20 头 | 耳标号/栏位 + **scan** + **ear-notch** + filter | enabled |
| `473:4698` | source | 仔猪处理 | 选择转出母猪 | 共 5 头母猪 | 耳标号/栏位 + filter only | enabled |

Common chrome: nav title 寄养; a location-scope dropdown **1区 - 母猪 - 1** with a caret
(top-right of the section header); pen group headers (A1); **radio** selectors → step 1 is
strictly **single-select** (exactly one counterpart sow).

Sow row content:
* **分娩阶段** rows: 000001 (with red alert dot), health chips 「发烧，感冒，四肢肿胀，食欲不振」
  (fever, cold, limb swelling, loss of appetite), 「仔猪：10 头」 (10 piglets).
* **仔猪处理阶段** rows add a processing status and task icons:
  「下次处理：3 天后」 (next handling in 3 days) · 「需处理」 (needs handling) ·
  「已完成所有处理」 (all handling complete); icon chips (Fe = iron, castration, tail-dock etc.,
  greyed = not yet done, green = done, "+1"/"+5" overflow pills); 「20 头仔猪」 /
  「20 头留种仔猪」 (20 piglets / 20 replacement piglets), 「日龄 3 天」 (3 days of age).

**Rule — the only in-screen constraint text in the fostering flow** (`672:1935`, inside
`473:4698` only, plain grey body copy under the count card):
> 接收寄养的母猪必须已经结束分娩

("The sow **receiving** the fostered piglets must have already finished farrowing.")

It is worth flagging that this sentence about the *receiving* sow appears on the screen for
choosing the **transferring-out** sow, and only in the 仔猪处理 stage — not on `473:4603`,
`473:4793` or `473:4845`.

### Step 2 — 选择要转出的仔猪 (choose the piglets to move)

Two mutually exclusive presentations:

**`473:5017` — count-only drawer.** Bottom sheet titled 选择转出仔猪 with ✕. Single field
**转出仔猪数量 ✱** (number of piglets to transfer out) as a **stepper** (− / value `2` / +).
Buttons 上一步 (Back) / 确认 (Confirm, enabled). No IDs at all.

**`473:5041` — identified list page.** Full page, section header 选择转出仔猪.
* Search placeholder **「耳标号/耳缺号」** (ear-tag number / ear-notch number) + scan icon +
  ear-notch icon + filter.
* Count card 「共 20 头」 with a **select-all checkbox**.
* Rows: 000001 (red alert dot), health chips, subtitle 「生产母猪 | 650日龄」, **checkbox**
  → multi-select.
* Buttons 上一步 / 确认 (**disabled** until something is ticked).

The row subtitle 「生产母猪 | 650日龄」 ("production sow | 650 days old") is clearly carried over
from a sow list — on a piglet-selection screen it is wrong data.

**`473:5214` — alternate bottom bar** (floating frame parked under `473:5017`): an amber warning
banner **「接收母猪已完成仔猪身份处理，请补充寄养信息」** ("the receiving sow has already
completed piglet identity processing; please supplement the fostering information") above
上一步 / **下一步** (Next). This replaces 确认 with 下一步, i.e. it is what routes the user into
the otherwise-optional step 3.

### Step 3 — 补充转出的仔猪的身份信息（非必经步骤）— `473:5156`

Frame name marks it **非必经步骤** = "not a mandatory step".

Same amber banner 「接收母猪已完成仔猪身份处理，请补充寄养信息」 at the top of the page.
Section 信息补充 (Supplement information). Repeating row, one per piglet:

| Sub-field | Type | Placeholder |
|---|---|---|
| 耳标号 | text input | 耳标号 (ear-tag no.) |
| 耳缺 | picker (trailing ›) | 耳缺 (ear notch) |
| 性别 | dropdown (trailing ˅) | 性别 (sex) |
| 体重 | number input, unit **kg** | 体重 |
| ✕ | delete row | |

Below the rows: **扫描耳标** (Scan ear tag, green) and **选择耳缺** (Choose ear notch, green).
Bottom bar has three buttons: 上一步 / **跳过** (Skip) / 确认 (disabled until rows are valid).
The presence of 跳过 is the mechanical expression of "非必经步骤".

### Step 4 — 寄养结果确认 — `473:4962` and `473:4897`

Nav title **寄养结果确认** (Fostering result confirmation). Amber advisory box, two bullets,
identical in both:
> · 请在寄养后同步转出与接收栏位的任务进度
> · 寄养后，目标栏位不推荐留种。

("· After fostering, please sync the task progress of the transferring-out and receiving pens.
· After fostering, the target pen is **not recommended for replacement-stock selection (留种)**.")

Two sections, 寄养转出 (foster out) and 寄养接收 (foster in), each a card:

| Element | 转出 card | 接收 card |
|---|---|---|
| Sow ID | 000001 | 000002 |
| Location (`location_on` pin) | 1区 - 分娩2舍 - A1 | 1区 - 分娩2舍 - A2 |
| 仔猪数量 (piglet count) delta | **-2** (green) | **+2** (red) |
| Before → after | 10 头 → 8 头 | 10 头 → 12 头 |

CTA: **寄养** (Foster), primary green, full width.

**The only difference between the two variants** is that `473:4897` adds a task-icon row inside
each count card (`1578:1743`, `1578:1785` — absent from `473:4962`): the 转出 card shows 5 green
+ 2 grey processing icons (Fe etc.), the 接收 card 3 green. `473:4962` is therefore the
**分娩阶段** result and `473:4897` the **仔猪处理阶段** result, where per-piglet processing
progress must be shown.

Note the delta colouring is inverted from the usual convention: the **-2** is green and the
**+2** is red.

---

## Actions this cluster exposes

| Action | Entry point | Subject | Data captured | Effect on state |
|---|---|---|---|---|
| 记录体重 (record weight) | 记录 drawer tile 1 → `319:1005` | **1 pig only** (`654:2366`) | 体重 ✱ (kg) | one weight reading |
| 记录体重, 总体重 mode | `319:1065` (reached with N pigs pre-selected on the pig list) | N pigs | 总体重 ✱ (kg); optional per-pig weights via toggle | one group weight (+0..N individual weights) |
| 记录体重, 个体体重 mode | `607:1928` | N pigs | one ✱ weight per selected pig (kg) | N individual weights |
| 记录背膘 (record backfat) | drawer tile 2 → `290:2115` / `607:1996` | **1 pig only** | 背膘评估方式 ✱ (定性/定量) + 背膘测量值 ✱ (薄/适中/厚) **or** 背膘厚度 ✱ (mm) | one backfat reading |
| 记录体温 (record temperature) | drawer tile 3 → `293:2425` | **1 pig only** | 体温 ✱ (°C) | one temperature reading |
| 转移 (transfer) | drawer tile 4 → `749:5903` | **1 or N pigs** | destination 区/车间/舍/单元/栏位; optionally per-record 移动/复制 marks on pen diseases/symptoms/treatments | pigs move to the target pen; health records optionally moved or copied (`854:3421`, `854:3422`); toast 操作成功 |
| 寄养 (fostering) | drawer tile 5 → `473:4569` | **1 or N pigs** | direction (转出/接收); counterpart sow (single-select); piglet count **or** piglet IDs; optional 耳标号/耳缺/性别/体重 per piglet | litter counts adjusted on both sows (−n / +n); pen task progress must be re-synced manually per the advisory |
| 上报失踪 (report missing) | drawer tile 6 → `300:1048` | **1 or N pigs** | nothing beyond the selection | pigs move to 工具箱 → 失踪列表 |

### Single-only vs bulk — summary

| Record type | Single pig | Many pigs | Evidence |
|---|---|---|---|
| 体重 Weight | ✅ | ❌ button disabled | `654:2366`; but `319:1065`/`607:1928` are explicitly multi-pig — see contradiction below |
| 背膘 Backfat | ✅ | ❌ | `654:2366` + frame names 背膘（只可单只记录） |
| 体温 Temperature | ✅ | ❌ | `654:2366` + frame name 体温（只可单只记录） |
| 转移 Transfer | ✅ | ✅ | `654:2366` |
| 寄养 Fostering | ✅ | ✅ | `654:2366` |
| 上报失踪 Report missing | ✅ | ✅ | `654:2366` |

### Scanning in this cluster

| Screen | Scan affordance | Purpose |
|---|---|---|
| `607:1824`, `620:2752` | 扫描耳标 (`qr-scan-2-line`) + 手动添加 | Add a pig row to the individual-weight list |
| `473:4793`, `473:4603` | scan + ear-notch icons inside the 耳标号/栏位 search box | Find the receiving sow |
| `473:5041` | scan + ear-notch icons inside the 耳标号/耳缺号 search box | Find a piglet |
| `473:5156` | 扫描耳标 + 选择耳缺 buttons | Populate a piglet identity row |

No scanning appears on the weight/backfat/temperature single-pig forms, on the transfer flow, or
on 上报失踪 — those all inherit their subject from the pig list behind the drawer.

---

## Rules & conditionality

* `853:2173` / `854:2488` — the drawer's tiles are individually enabled or disabled by whether the
  current selection can perform that sub-function (`853:2119`: 「所选的猪只 可使用该子功能时，
  子功能为可用态，反之为禁用态」).
* `654:2366` — 「体重、背膘、温度：只能作用于 单头猪，选择多头猪时，此按钮禁用 / 转移、寄养、
  上报失踪：可作用于 单头猪或多头猪」.
* `319:1065` → `607:1824` — the 记录个体体重 toggle is what reveals the individual-weight
  sub-panel; it defaults OFF.
* `607:1824` → `620:2752` — individual-weight rows come **only** from 扫描耳标 / 手动添加; the
  list is not pre-seeded from the selection (contrast `2092:1784`, where it is).
* `290:2115` ↔ `607:1996` — 背膘评估方式 switches the second field between the 薄/适中/厚 chooser
  and the mm input.
* `749:5975` — the 选择栏位 drawer is auto-raised on entering 转移, defaulting the user to another
  pen inside the current 区-车间-单元; it can be dismissed to re-pick the 区-车间-单元.
* `1740:1713` — the path card at the top of the 选择栏位 drawer is 「只是展示 不能操作」
  (display only, non-interactive).
* `128:1082` — 确认 stays disabled while either wheel reads 请选择.
* `749:5401` vs `749:5402` — the transfer confirmation branches on ID coverage:
  「全部为有ID猪只」 → dialog `296:1133`; 「包含无ID猪只」 → page `612:2414`.
* `854:3421` — no move/copy marks ⇒ submit transfers **pigs only**; health records stay on the old
  pen.
* `854:3422` — move/copy marks take effect **only after submit**; 移动 removes from the old pen,
  复制 keeps it there.
* `612:2414` — 移动 / 复制 are disabled until at least one health row is checked; the count line
  「已选择 1 种疾病」 appears only in the edited state (`749:4264`).
* `473:4569` / `473:4586` — direction chosen first; it determines whether step 1 asks for the
  receiving sow or the source sow.
* `473:4793` / `473:4603` / `473:4845` / `473:4698` — step 1 is single-select (radios).
* `672:1935` (in `473:4698`) — 「接收寄养的母猪必须已经结束分娩」.
* `473:5214` — 「接收母猪已完成仔猪身份处理，请补充寄养信息」 turns step 2's 确认 into 下一步 and
  routes into step 3.
* `473:5156` — step 3 is optional (frame name 非必经步骤; 跳过 button present).
* `473:4962` / `473:4897` — 「请在寄养后同步转出与接收栏位的任务进度」 and 「寄养后，目标栏位
  不推荐留种。」
* `300:1048` — 「上报后失踪，您可在「工具箱 → 失踪列表」中查看并管理相关猪只。」

---

## Ambiguities / contradictions found

1. **The single-pig rule contradicts the weight screens.** `654:2366` says 体重 is
   「只能作用于 单头猪，选择多头猪时，此按钮禁用」, yet `319:1065`, `607:1824`, `620:2752`,
   `607:1928`, `2092:1996` and `2092:1784` all show **已选 10 头猪** and a 总体重/个体体重 model
   that only makes sense for a group. Six of the seven weight frames are multi-pig. Either the
   annotation is stale or the weight tile's gating rule is wrong. (背膘 and 体温 are consistent —
   their frame names carry 只可单只记录 and every frame shows 已选猪只：000001.)

2. **Two incompatible weight models coexist with no arbitration.**
   Model A (`319:1065` / `607:1824` / `620:2752` / `607:1928`): a required 体重记录方式 segmented
   control (总体重 | 个体体重) plus, in 总体重 mode, a 记录个体体重 toggle exposing a
   scan/manual-built ID+weight list.
   Model B (`2092:1996` / `2092:1784`, later node ids): **no** mode control; 总体重 always
   required; the toggle exposes one weight field per already-selected pig.
   A third unplaced alternative (`1476:1796`) renders the mode control as radio buttons.
   Nothing in the file says which is final.

3. **Individual-weight required-ness flips between models.** Per-pig fields are ✱-required in
   `607:1928` but carry no ✱ in `2092:1784`.

4. **Submit-button gating is inconsistent.** 提交 is disabled on empty forms in `319:1005`,
   `319:1065`, `607:1824`, `607:1928`, `290:2115`, `607:1996`, `293:2425` — but drawn **enabled**
   on `2092:1996` and `2092:1784` with 总体重 empty.

5. **Pig-count placeholders disagree inside the same flow.** 转移: `749:5903` and `128:1082` show
   已选 **10** 头猪, `296:1133` confirms **12** 头猪只; `612:2414` says 已选 **1** 头猪 while
   `749:4264` says 已选 **10** 头猪. `300:1048` uses 12.

6. **Destination granularity disagrees inside 转移.** `128:1082` picks a 单元 + 栏位 (E/F/G × 2/3);
   `296:1133` confirms a pen 「…- 1舍 - **A1**」 — a pen id that is not in either wheel; and
   `612:2414` / `749:4264` state the target as 「…- 2舍 - **1单元**」, i.e. a **unit**, with no pen
   at all. Three different notions of "where the pigs land".

7. **Hierarchy depth is unsettled.** Annotation `749:5975` describes 区-车间-单元-栏位; the tree in
   `749:5903` and the drawer header show 区-车间-**舍**; `296:1133` shows 区-车间-舍-栏位;
   `612:2414` shows 区-车间-舍-单元; the fostering result cards show 区-**分娩2舍**-栏位.

8. **A designer note is baked into production copy.** `612:2414` / `749:4264` card title reads
   「已选 1 头猪（可查看猪只列表，不能改位置」 — an unclosed parenthesis containing an instruction
   to the developer.

9. **Drawer label vs destination label.** The drawer tile says **温度**; the module title and the
   screen say **体温**.

10. **Icons are placeholders and are inconsistent.** In `853:2173`: 温度 and 转移 both use `skull`,
    背膘 uses `vital_signs`, 寄养 uses `add_2`. The disabled twin `854:3491` shifts the whole icon
    list by one and drops `not_listed_location`. In fostering, 寄养接收 uses `login-box-line` in
    `473:4569` but `logout-box-r-line` in `473:4586`.

11. **The two 子功能-记录 frames are byte-identical duplicates.** `853:2173` and `854:2488` differ
    only in canvas position; maintaining two copies means the menu can drift.

12. **Scan availability is asymmetric in fostering step 1.** The 接收母猪 screens (`473:4793`,
    `473:4603`) have scan + ear-notch icons in the search field; the 转出母猪 screens
    (`473:4845`, `473:4698`) do not, with no stated reason.

13. **The farrowing constraint sits on the wrong screen.** 「接收寄养的母猪必须已经结束分娩」
    appears only inside `473:4698` (select the **transferring-out** sow, 仔猪处理阶段) — not on any
    of the three other step-1 screens, including the two that actually pick the receiving sow.

14. **Wrong sample data on the piglet picker.** `473:5041` rows read 「生产母猪 | 650日龄」
    (production sow | 650 days old) on a screen for selecting **piglets**.

15. **Step-2 branching is undocumented.** `473:5017` (count stepper) and `473:5041` (ID list) are
    both named 「2、选择要转出的仔猪」 with no annotation saying when each is used. The most likely
    trigger — piglets without identities vs piglets already ear-tagged — is inferred from the
    fields, not stated.

16. **No result screen for four of the six actions.** `749:6023 操作成功` sits at the end of the
    转移 band only. 体重, 背膘, 体温 and 上报失踪 have no success frame; compare the annotation on a
    neighbouring flow (`1606:2219`) that specifies 「点击提交，toast提示：操作成功」.

17. **上报失踪 captures nothing.** No reason, date, last-seen location, photo or note — and the
    destination 「工具箱 → 失踪列表」 does not exist in this file.

18. **Copy defect.** `300:1048`: 「上报后失踪，您可在…」 — word order is wrong; presumably
    「上报失踪后」.

19. **Delta colour convention is inverted.** In `473:4962` / `473:4897`, **-2** is green and
    **+2** is red.

20. **Collapse affordances differ within one tree.** `749:5903` uses inline `stat_1` /
    `stat_minus_1` markers for 区/车间 rows inside the expanded card but a leading
    `arrow_forward_ios` on the collapsed 2区 / 3区 cards.
