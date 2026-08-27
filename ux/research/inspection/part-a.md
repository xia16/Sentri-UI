# Part A — the patrol shell

Cluster: navigation into a patrol, the inspection list itself, row selection, submission, and the
pig-count calibration ("add pig") flow.

Figma file `4GZGPBauEOWQQjnRrzoUgF`, page `60:406 🟢 UI设计稿`, section `60:408 巡检`.
All node ids below are from that file. Chinese is quoted verbatim; English in parentheses is a gloss.

---

## Screen inventory

| Node | Screen (中文) | English | Purpose |
|---|---|---|---|
| 60:417 | 首页（车间） | Home (workshop) | Workshop-level overview; entry point to patrol |
| 88:754 | 首页（单元） | Home (unit) | Same home, a single unit tab selected |
| 541:1695 | 选择巡检单元 | Choose inspection unit | Bottom sheet listing houses ordered with last-patrol recency |
| 60:523 | 巡检任务详情-List | Patrol detail — List view (h=4000) | The patrol worksheet: pens → feed stations → pigs |
| 99:627 | 巡检任务详情-Grid | Patrol detail — Grid view (h=2000) | Same worksheet as a grid of pen cards |
| 640:1909 | 栏位猪只列表（点击grid卡片） | Pen pig list (from grid card tap) | Single-pen drill-down from a grid card |
| 907:3431 | 勾选行操作说明 | **Row-selection behaviour SPEC** (h=3000) | Annotated spec of what checking a row does, per row type |
| 1506:2768 | 提交巡检（默认态） | Submit patrol (default) | Post-walk form, sections collapsed |
| 1563:2560 | 提交巡检（展开状态） | Submit patrol (expanded, h=3000) | Same, both sections open |
| 107:1694 | 修改备注 | Edit unit note | Bottom sheet editing the shared unit note |
| 224:1545 | Step1（默认态） | Calibration Step 1, default | Confirm identified pigs present in the pen |
| 224:1618 | Step1（添加后） | Calibration Step 1, after adding | Same with a 新添加 (newly added) section |
| 566:2426 | 手动添加（猪只列表，需要先搜索，精确搜索） | Manual add — must search first | Empty state: 请先搜索猪只 |
| 566:2854 | 手动添加（猪只列表，需要先搜索） | Manual add — no result | Empty state: 未搜索到"000009" |
| 566:2788 | 手动添加（搜索结果） | Manual add — search result | One matching pig with its current location, radio select |
| 509:1702 | 二次确认 | Confirm — report missing | 上报失踪 (report pig missing) dialog |
| 1796:1675 | Step2（默认态） | Calibration Step 2, default (h=2500) | Confirm pen total; allocate un-identified pigs to batches |
| 1797:1721 | Step2（修改过，不可提交） | Step 2 — under-allocated, blocked | Batch totals short of the un-identified count |
| 1799:1985 | Step2（修改过，不可提交） | Step 2 — over-allocated, blocked | Batch totals exceed the recorded pen total |
| 224:1486 | Step2（修改过，可提交） | Step 2 — balanced, submittable | Batch totals match exactly |
| 559:1824 | 选择批次 (page title reads **添加批次**) | Add batch | Pick production line + batch(es) to allocate to |
| 559:1802 | 选择生产线 | Choose production line | Wheel picker sheet |
| 570:1729 | 二次确认 | Confirm — quantity update | 数量更新 dialog stating old → new head count |
| 566:3375 | 操作结果 | Operation result | Dark toast: ✓ 操作成功 |

**Screen count: 24.**

---

## What an inspection (巡检) is

An 巡检 is a **per-unit walkthrough of every pen in that unit, performed on a recency cadence rather
than from a scheduled work order**. There is no task list, no assignee, no due date and no "start
task" anywhere in this cluster: the worker taps the 巡检 card on the home screen (60:417 / 88:754),
gets a sheet of houses each labelled `上次巡检：1 分钟前，张强` … `上次巡检：365 天前，张华强`
(541:1695) — i.e. the queue is ordered by staleness and by who did it last — picks one, and lands on
a single scrolling worksheet for that unit (60:523). The worksheet is the inspection: it lists every
pen, each pen's feed stations and each pen's pigs, and lets the worker tick rows and fire production
/ health / record actions on what they tick. Closing it is a single act — `提交巡检` (submit patrol)
— which asserts that "所有栏位与设备已检查完毕" ("all pens and devices have been checked", 1506:2768)
and then optionally collects unit-level environment and biosecurity readings, all of which are
optional ("所有字段都是选填", annotation 1606:2219). The workshop home shows a completion counter
`巡检 20 / 40 已检查` (60:417) and the unit home shows recency instead (`巡检 365 天前，顾大华`,
88:754), so the system does track a denominator of units expected to be inspected, but that
denominator is never surfaced as an assignable task inside these screens.

---

## 首页（车间） workshop home — 60:417

**Purpose.** Landing screen; shows unit tabs and the patrol completion counter.

**Controls.**
| Control | Notes |
|---|---|
| Avatar (top-left) | no target shown |
| `Section Selector ⌄` | title-bar dropdown, placeholder English string in the mock |
| Bell (green circle, top-right) | notifications |
| Tab strip `总览` (Overview) / `单元1` / `单元2` / `单元3` / `单元4` | `总览` selected; horizontally scrollable (88:754 shows `单元1 / 单元24 / 单元32 / 单元40` clipped at the right edge) |
| Card `存栏` (inventory) | `99,999 头` (head). Display only |
| Card `巡检` (patrol) + `→` arrow | `20 / 40 已检查` ("20 / 40 checked"). The arrow is the entry point into the patrol flow |
| Scroll-to-top FAB (↑, bottom-right) | |
| Bottom nav `首页` (Home) / centre green FAB / `工具` (Tools) | `首页` active |

**Rules.** On the workshop (总览) tab the patrol card reads as a fraction of units checked; on a
single-unit tab (88:754) the same card reads as elapsed time plus the last inspector
(`365 天前，顾大华`). Same card, two different metrics — see Ambiguities.

---

## 首页（单元） unit home — 88:754

Identical shell to 60:417 with a unit tab selected. Only difference: the `巡检` card shows
`365` + `天前，顾大华` ("365 days ago, Gu Dahua") instead of a `n/m 已检查` fraction.

---

## 选择巡检单元 choose inspection unit — 541:1695

**Purpose.** Pick which house to patrol.

**Controls.**
| Control | Notes |
|---|---|
| Bottom sheet, title `选择巡检单元`, `✕` close | scrim over the home screen |
| Group header `1区 - 母猪车间` | Zone 1 – Sow workshop |
| Rows `1舍` … `5舍` (House 1…5) | each with right-aligned metadata + a green circular `→` button |

**Fields (read-only per row).**
| Field | Value in mock |
|---|---|
| House name | `1舍` … `5舍` |
| `上次巡检：` (last patrol) | `1 分钟前，张强` / `1 分钟前，张华强` / `1 小时前，张华强` / `365 天前，张华强` |

**Rules.** Every row carries last-patrol recency + last inspector. No filter, no search, no
"assigned to me". Any house can be entered at any time — nothing gates re-entry (a house patrolled
`1 分钟前` is still tappable).

**Bulk / scan.** None.

---

## 巡检任务详情-List — 60:523 (h=4000)

**Purpose.** The patrol worksheet in list form: unit note + device status, then every pen expanded
inline with its feed stations and its pigs.

**Controls (top to bottom).**
| Control | State / notes |
|---|---|
| `←` back, title `单元1` | |
| Accordion `单元备注与设备状态` (unit note & device status) | **collapsed** in List (`⌄`), **expanded** in Grid (99:627) |
| Search field, placeholder `ID/栏位` (ID / pen) | |
| Scan icon (viewfinder) inside the search field | |
| Ear-tag icon (green leaf/tag glyph) inside the search field | second scan modality alongside the camera |
| Filter button (funnel) | annotation 2523:1814 above the frame: `筛选：支持筛选批次，支持多选` ("Filter: supports filtering by batch, supports multi-select") |
| View toggle: list icon / grid icon | segmented; list active here, grid active in 99:627 |
| Removable filter chips `需操作 ✕`, `筛选结果1 ✕`, `筛选结果2 ✕` | `需操作` = "needs action"; the other two are placeholder labels |
| Header row `共 200 头` + checkbox | unit-level select-all. In Grid the same row reads `已选 1 头` with a green **minus** (indeterminate) button — so this control has ≥3 states: total/unchecked, partial/green-minus, all/checked |
| Per-pen card header: pen chip (`A1`, `A100`), tool icon with red count badge (`2`), checkbox | the badge is the device-fault count for that pen |
| Section `饲喂站（3）` (feed stations) with `⌃`/`⌄` | A1 is expanded and carries the magenta annotation `默认展开` ("expanded by default"); A100 is collapsed |
| Feed-station tiles | `1 6kg` `正常态` (normal state) · `2 0.5kg` `需操作` `↓ Decrease 20.5kg` · `3 10kg` `↑ Increase 20.5kg` |
| Section `猪只列表（5）` (pig list) + green pencil-on-dots icon | that icon is the entry to the pig-count calibration flow (Step1/Step2) |
| Pig rows | see field table below |
| Bottom action bar `生产` (Production) / `健康` (Health) / `记录` (Record) | **disabled/greyed here** (nothing selected) |
| Primary button `提交巡检` (Submit patrol) | always enabled in the mock |

**Fields — a pig row.** Row spec component `749:2125` carries an inline magenta note
`说明:20是批次号，1是生产线` ("Note: 20 is the batch number, 1 is the production line"), i.e. the
token `20₁` = batch 20, subscript = production line 1.

| Field | Type | Notes |
|---|---|---|
| ID | text, bold | e.g. `000001`. Absent for un-identified pigs, replaced by `No ID Pigs` |
| Head-count chip | text chip | only on un-identified rows: `× 10`, `× 2`, `× 200` |
| Health icon + symptom list | icon + truncating text | `发烧` / `发烧，感冒，四肢肿胀，食…`. Placeholder text on the legend row reads `显示疾病症状，没有就不显示` ("show disease symptoms; if none, don't show") — i.e. **conditional visibility** |
| Batch | text `20₁` | batch number with production-line subscript; omitted when the pig has no batch |
| `猪只类型` (pig type) | text | e.g. `生产母猪` / `Production Sow` |
| `生产状态` (production status) | text | e.g. `已发情` / `Estrused` / `In - Estrus Estrus` |
| `日龄` (age in days) | text | e.g. `650日龄` / `650 d` |
| Checkbox | right-aligned | see selection rules |

**Row taxonomy (annotations 654:1880–1885, magenta, to the right of the frame).** The `A1` card in
this frame is a **field legend**, not real data — annotation `654:1880` reads `⬅️ 字段说明`
("field description") and its row shows label placeholders (`猪只类型 | 生产状态 | 日龄`). The
following rows are then labelled, top to bottom:

| Annotation node | 中文 verbatim | English |
|---|---|---|
| 654:1880 | `⬅️ 字段说明` | field description |
| 654:1882 | `⬅️ 有ID，有批次` | has ID, has batch |
| 654:1884 | `⬅️ 有ID，无批次 换行样式` | has ID, no batch — wrapping style |
| 654:1883 | `⬅️ 无ID，有批次` | no ID, has batch |
| 654:1885 | `⬅️ 无ID，无批次` | no ID, no batch |

**Other annotations on this frame.**
| Node | 中文 verbatim | English |
|---|---|---|
| 2523:1814 | `筛选：支持筛选批次，支持多选` | Filter: supports filtering by batch, multi-select supported |
| 643:2834 | `❌ "饲喂站"功能 本期不开发` | ❌ The "feed station" feature is **not being built this phase** |
| in-frame magenta | `默认展开` | expanded by default (on `饲喂站（3）`) |
| in-frame magenta | `正常态` / `需操作` | normal state / needs action (feed-station tile states) |
| in-frame magenta | `显示疾病症状，没有就不显示` | show disease symptoms; if there are none, don't show |

**Bulk / scan.** Bulk throughout: unit-level select-all, pen-level checkbox, pig-level checkbox.
Scan appears twice in the search field (camera + ear-tag).

---

## 巡检任务详情-Grid — 99:627 (h=2000)

**Purpose.** Same worksheet, pens as a 3-across card grid instead of expanded lists.

**Differences from List — this is the whole delta:**

| Aspect | List (60:523) | Grid (99:627) |
|---|---|---|
| `单元备注与设备状态` accordion | collapsed | **expanded**, showing the note text, `上次修改：张华 2025/05/05` with a green pencil, and three device tiles `饲喂器 2` (red), `供水 0`, `其他 0` |
| Search placeholder | `ID/栏位` (ID / pen) | `ID` only — cannot search by pen, because the grid *is* the pen list |
| Filter chips row | present (`需操作`, `筛选结果1`, `筛选结果2`) | absent |
| Pen rendering | expanded card: feed stations + full pig rows | 88×88-ish card: pen chip, checkbox, `需操作` in green, and either a single pig ID (`000001`, variant labelled `单头猪` = single pig) or `共 2 头` (variant labelled `多头猪` = multi pig) |
| Feed stations | shown inline | not shown |
| Individual pig selection | possible (per-row checkboxes) | **not possible** — only whole-pen checkboxes |
| Header row | `共 200 头` + empty checkbox | `已选 1 头` + green minus (indeterminate) |
| Bottom bar `生产 / 健康 / 记录` | greyed (nothing selected) | **enabled** (one pen selected) |
| Drill-down | n/a | tapping a card opens 640:1909 |

**Annotation.** `658:3113`, pointing at the grid-card spec `658:3105`:
`⬅️ "需操作"代表：饲喂站需加料/减料` / `❌ 本期不做饲喂站功能`
("'Needs action' means: the feed station needs feed added / reduced" / "❌ the feed-station feature
is not being built this phase"). So the only meaning `需操作` carries on a grid card is a
feed-station meaning, and that feature is explicitly out of scope this phase.

---

## 栏位猪只列表（点击grid卡片） pen pig list — 640:1909

**Purpose.** One pen's pigs, reached by tapping a grid card.

**Controls.** `←` back, title = pen number (`A1`); search `ID/栏位` + scan + ear-tag; filter funnel
(**no list/grid toggle**); the same three filter chips; one pen card (`A1`, tool icon with red badge
`2`, pen checkbox) containing `猪只列表（5）` + the green calibration icon and the pig rows with
per-row checkboxes; bottom bar `生产 / 健康 / 记录` **greyed** + `提交巡检`.

**Rules.** No `饲喂站` section here at all. Otherwise identical row anatomy to the List view.
Note that `提交巡检` is present on this drill-down screen too, i.e. the patrol can be submitted from
inside a single pen.

---

## 勾选行操作说明 — 907:3431 (h=3000) — THE ROW-SELECTION SPEC

**Purpose.** A pure specification frame (not a real screen) documenting exactly what checking a row
does, for each of the four ID×batch row types. It renders each row type twice: unchecked, then
checked.

**Frame chrome.** Title `A1`; one pen card whose header is `A1` + tool icon + a **green minus
button** at top-right (partial-selection state at pen level); `猪只列表（5）` + the green
calibration icon.

**The four annotations, verbatim and in order:**

| # | 中文 verbatim | English |
|---|---|---|
| 1 | `⬇ 猪只 有ID 有批次，勾选后无变化` | Pig **with ID, with batch** — no change after checking |
| 2 | `⬇ 猪只 有ID 无批次，勾选后无变化` | Pig **with ID, no batch** — no change after checking |
| 3 | `⬇ 猪只 无ID 有批次，勾选后 有 变化` | Pig **no ID, with batch** — there **is** a change after checking |
| 4 | `⬇ 猪只 无ID 无批次，勾选后 有 变化` | Pig **no ID, no batch** — there **is** a change after checking |

**Plus the governing rule, annotation `907:4178` immediately below the frame:**

> `⬆️ 勾选单条数据时，若为无 ID 猪只，需立即填写无 ID 猪只数量`
> `勾选整个栏位时，无需且不可填写无 ID 猪只数量`

("When checking a **single row**, if it is an un-identified pig you must immediately fill in the
un-identified-pig quantity. When checking the **whole pen**, filling in the un-identified-pig
quantity is neither required nor permitted.")

**What each case renders.**

| Case | Unchecked row | Checked row |
|---|---|---|
| 1 — 有ID 有批次 | `000001` · 发烧 · `20₁ \| 生产母猪 \| 已发情 \| 650日龄` · ☐ | identical row, ☑ green. **No extra UI.** |
| 2 — 有ID 无批次 | `000001` · 发烧 · `生产母猪 \| 已发情 \| 650日龄` · ☐ | identical row, ☑ green. **No extra UI.** |
| 3 — 无ID 有批次 | `No ID Pigs` `× 10` · 发烧 · `20₁ \| 650 日龄` · ☐ | header becomes `No ID Pigs` **`已选 1/10`** · ☑ green. A quantity editor appears **between** the two states: `✕  [ − 0 + ]  ✓` with `−` and `✓` disabled at 0, then `✕  [ − 1 + ]  ✓` with both enabled |
| 4 — 无ID 无批次 | `No ID Pigs` `× 200` · `发烧，食欲…` · `650 日龄` · ☐ | header becomes `No ID Pigs` **`已选 200/200`** · ☑ green. Same editor: `✕ [ − 0 + ] ✓` (disabled) → `✕ [ − 200 + ] ✓` (enabled) |

**Derived rules.**
- Checking an un-identified row is a **two-stage commit**: check → inline stepper appears → enter a
  number ≥ 1 → tap `✓` to commit, or `✕` to abort. The row's chip flips from `× N` (population) to
  `已选 n/N` (selected / population).
- The stepper's `−` and the confirm `✓` are both **disabled while the value is 0**; `+` is always
  enabled.
- Identified pigs are all-or-nothing (one head), so no quantity is asked.
- Checking at pen level bypasses the quantity question entirely and is stated as **forbidden** to
  ask, not merely unnecessary — `无需且不可` ("neither required nor permitted").

**Related bottom-bar rules (annotations near 99:627).**
| Node | 中文 verbatim | English |
|---|---|---|
| 853:2065 | `⬆️ 选择猪只后，或选择的猪只 可执行 某操作时 底部操作功能按钮（父功能） 可用` | After pigs are selected, or when the selected pigs *can* perform a given operation, the bottom action buttons (parent functions) are **enabled** |
| 853:2023 | `⬅️ 未选择猪只时，或选择的猪只 不可执行 某操作时 底部操作功能按钮（父功能） 禁用` | When no pigs are selected, or the selected pigs *cannot* perform a given operation, the bottom action buttons (parent functions) are **disabled** |
| 853:2119 | `⬆️ 点击底部某个父功能按钮后，使用抽屉展示其子功能 所选的猪只 可使用该子功能时，子功能为可用态，反之为禁用态 发情、意外妊娠、流产、分娩、断奶：只能作用于 单头猪，选择多头猪时，此按钮禁用 标记留种、移除留种标记：可作用于 单头猪或多头猪` | Tapping a bottom parent-function button opens a **drawer** of sub-functions. A sub-function is enabled when the selected pigs can use it, disabled otherwise. 发情 (estrus), 意外妊娠 (accidental pregnancy), 流产 (abortion), 分娩 (farrowing), 断奶 (weaning): **single pig only** — disabled when multiple pigs are selected. 标记留种 / 移除留种标记 (mark / unmark for retention): work on **one or many** pigs |

---

## 提交巡检（默认态） submit patrol, default — 1506:2768

**Purpose.** Close out the patrol and optionally record unit-level readings.

**Controls.** `←` back, title `提交巡检`; a status card; two collapsed accordions; primary `提交`.

**Status card.** ✓ green tick, heading `巡检完成` ("Patrol complete"), body
`所有栏位与设备已检查完毕，您可选择填写以下信息。`
("All pens and devices have been checked; you may optionally fill in the following information.")

**Accordions (collapsed, `⌄`).** `环境数据` (Environment data) · `生物安全评估` (Biosecurity
assessment).

**Rules.** Annotation `1606:2219` directly below this frame:
> `⬆️ 所有字段都是选填`
> `点击提交，toast提示：操作成功`

("All fields are optional. On tapping submit, toast: 操作成功 / operation successful.")
That toast is screen 566:3375.

---

## 提交巡检（展开状态） submit patrol, expanded — 1563:2560 (h=3000)

Same screen with both accordions open. Every field is optional (1606:2219).

**Fields — `环境数据` (Environment data).**
| Field | Type | Required | Default | Unit | Placeholder |
|---|---|---|---|---|---|
| `温度` (temperature) | numeric input | no | empty | `°C` | `请输入` |
| `湿度` (humidity) | numeric input | no | empty | `%` | `请输入` |
| `氨` (ammonia) | numeric input | no | empty | `ppm` | `请输入` |
| `二氧化碳` (CO₂) | numeric input | no | empty | `ppm` | `请输入` |
| `光照条件` (lighting condition) | picker `›` | no | empty | — | `请选择` |
| `通风状况` (ventilation status) | picker `›` | no | empty | — | `请选择` |
| `用水量` (water used) | numeric input | no | empty | `升` (litres) | `请输入` |
| `饲料消耗总量` (total feed consumed) | numeric input | no | empty | `kg` | `请输入` |
| `其他观察` (other observations) | multi-line textarea | no | empty | — | `请输入` |

**Fields — `生物安全评估` (Biosecurity assessment).**
| Field | Type | Required | Default | Placeholder |
|---|---|---|---|---|
| `清洁度评级` (cleanliness rating) | picker `›` | no | empty | `请选择` |
| `生物安全措施是否达标` (do biosecurity measures meet standard) | picker `›` | no | empty | `请选择` |
| `生物安全须知` (biosecurity notes) | multi-line textarea | no | empty | `请输入` |

**Rules.** No `*` markers anywhere; annotation confirms nothing is mandatory. `提交` is enabled
regardless of whether any field is filled. The option lists behind the four `请选择` pickers are
not shown anywhere in this cluster.

**What submitting asserts.** Purely by the copy: that every pen and every device in the unit has
been checked (`所有栏位与设备已检查完毕`). Nothing in the UI validates that claim — the patrol
detail screen never gates `提交巡检` on all pens being ticked, and `提交巡检` is even available from
the single-pen drill-down (640:1909). See Ambiguities.

---

## 修改备注 edit unit note — 107:1694

**Purpose.** Edit the unit-level free-text note surfaced in `单元备注与设备状态`.

**Controls.** Bottom sheet, title `修改备注`, `✕` close; `取消` (Cancel, outline) / `确认`
(Confirm, green).

**Fields.**
| Field | Type | Required | Default |
|---|---|---|---|
| `备注` (note) | multi-line textarea | not marked | pre-filled with the current note |

**Rules.** The note's own content states the sharing rule verbatim:
`在这里用户可以写一些关于单元的备注。这个备注是所有人共享的，修改也是所有人共享的。`
("Here the user can write notes about the unit. This note is shared with everyone, and edits are
shared with everyone too.") The read view (99:627) shows `上次修改：张华 2025/05/05`
("last modified: Zhang Hua 2025/05/05") — so the note is a single shared, attributed, last-write-wins
record, not per-inspection.

---

## Step1（默认态） — 224:1545

Entered from the green pencil-on-dots icon next to `猪只列表（N）` on any pen card.

**Purpose.** Reconcile which *identified* pigs are actually in the pen.

**Controls.**
| Control | Notes |
|---|---|
| `←` back, title `A1：猪只数量校准` (`A1: pig count calibration`) | title is prefixed with the pen number |
| Step indicator: `1 确认有身份猪只` (green, active) — `2 确认栏位总数` (grey) | "confirm identified pigs" → "confirm pen total" |
| Section header `当前系统记录` (current system record) | green bar accent |
| Search field, placeholder `ID` + scan icon + ear-tag icon | placeholder becomes `耳标号/耳缺号` in 224:1618 — see Ambiguities |
| Per-row `?` map-pin icon (`not_listed_location`) | opens 509:1702 上报失踪 |
| `扫描添加` (Scan to add) — outline button with viewfinder icon | |
| `手动添加` (Manual add) — outline button with `+` icon | opens 566:2426 |
| `下一步` (Next) — green primary | always enabled in the mock |

**Fields (per row, read-only).** ID `000001`; symptom list `发烧，感冒，四肢肿胀，食欲不振`;
`20₁ | 生产母猪 | 已发情 | 650日龄` (batch₍line₎ | pig type | production status | age in days).

**Bulk / scan.** Scan (camera + ear-tag) in the search field and as a dedicated `扫描添加` button.
Adds are one pig at a time.

---

## Step1（添加后） — 224:1618

Same screen with a **`新添加`** ("newly added") section inserted *above* `当前系统记录`.

| Difference | Detail |
|---|---|
| New section `新添加` | rows identical in shape to system rows but with a **`✕` remove** affordance instead of the `?` pin |
| Search placeholder | `耳标号/耳缺号` ("ear-tag number / ear-notch number") instead of `ID` |

**Rules.** The two lists are kept visually distinct — pigs the system *thinks* are here
(`当前系统记录`, actionable via `?` → report missing) vs pigs the worker *found* here
(`新添加`, actionable via `✕` → undo the add). Removing from `新添加` needs no confirmation;
reporting a system row missing does.

---

## 手动添加 manual add — 566:2426 / 566:2854 / 566:2788

All three share: title `添加猪只` (Add pig), a search field with scan + ear-tag icons, and a green
primary `确认` (Confirm) that is **disabled** in all three frames.

| Node | State | Content |
|---|---|---|
| 566:2426 | search empty | empty-state illustration + `请先搜索猪只` ("please search for a pig first"). `确认` disabled |
| 566:2854 | search = `000009` | empty-state illustration + `未搜索到"000009"` ("'000009' not found"). `确认` disabled |
| 566:2788 | search = `000001` | one result. `确认` still shown disabled |

**Search result anatomy (566:2788).** A location header — pen chip `A1` + breadcrumb
`1区 - 母猪车间 - 1舍` ("Zone 1 – Sow workshop – House 1") — above the matched pig row
(`000001` · 发烧，感冒，四肢肿胀，食欲不振 · `20₁ | 生产母猪 | 已发情 | 650日龄`) with a
**radio (single-select circle)**, not a checkbox.

**Rules.**
- Search is required before anything renders — the list has no browse mode. The brief's title for
  566:2426 says `精确搜索` (exact search); the visible result set for `000001` is exactly one row,
  consistent with exact match.
- The result shows **where the system currently thinks the pig is**, which is the whole point:
  manual-add is used to claim a pig that is recorded in a *different* pen.
- Selection is single (radio), so one pig per add cycle.
- `确认` is gated on a selection (disabled in all shown states, including the one with a result but
  nothing selected).

**Bulk / scan.** Individual only. Scan present via both icons.

---

## 二次确认 — 上报失踪 report missing — 509:1702

**Purpose.** Confirmation when the worker marks a system-recorded pig as not present.

**Copy, verbatim.**
> `上报失踪`
> `确认将 000001 猪只上报为失踪吗？`
> `上报后，您可在「工具箱 → 失踪列表」中查看并管理相关猪只。`

("Report missing. Confirm reporting pig 000001 as missing? After reporting, you can view and manage
the affected pigs under 「Toolbox → Missing list」.")

**Controls.** `上报失踪` (outline/secondary) | `取消` (Cancel, **green primary**).

**Rules.** The destructive action is the de-emphasised button and Cancel is the green primary — the
inverse of every other dialog in the cluster (compare 570:1729 where `确认` is green). Flagged below.
The state change is a **hand-off out of the patrol**: the pig lands in `工具箱 → 失踪列表`
(Toolbox → Missing list), which is outside this cluster.

---

## Step2 — 1796:1675 (default) / 1797:1721 / 1799:1985 (blocked) / 224:1486 (submittable)

**Purpose.** Reconcile the pen's **total** head count, and account for every un-identified pig by
assigning it to a production line + batch.

**Common structure (all four frames).**
| Element | Notes |
|---|---|
| Title `A1：猪只数量校准`, step indicator `✓ 确认有身份猪只` — `2 确认栏位总数` (green, active) | Step 1 shown complete |
| Card: `记录栏位猪只总数` (recorded pen pig total) with a `− n +` stepper | the single editable total |
| Section `总结` (Summary) | green bar accent |
| Card `更改前` (before change) — `20 头` | breakdown `↳ 有身份猪只 10 头` / `↳ 无身份猪只 10 头` / `↳↳ 生产线 1 - 批次 25  5 头` / `↳↳ 生产线 1 - 批次 26  5 头` |
| Card `更改后` (after change) — total | breakdown `↳ 有身份猪只` / `↳ 无身份猪只` + a status banner + editable batch rows |
| Batch row | `↳ 生产线 1 - 批次 N`, a `− n +` stepper, and a **red trash icon** |
| `+ 添加批次` (Add batch) link | opens 559:1824 |
| Footer `上一步` (Previous) | outline |
| Footer `提交` (Submit) | green primary, enabled/disabled per the balance rule |

**The four frames side by side.**

| Node | Designer label | `记录栏位猪只总数` | `更改后` | 有身份 | 无身份 | Batch rows (sum) | Banner in card | Footer warning | `提交` |
|---|---|---|---|---|---|---|---|---|---|
| 1796:1675 | `Step2（默认态）` | 30 | 30 头 | 20 | 10 | 25→5, 26→5 (**10**) | ✓ green `无身份猪只已全部补充批次` | none | **enabled** |
| 1797:1721 | `Step2（修改过，不可提交）` | 40 | 40 头 | 20 | 20 | 25→5, 20→5 (**10**) | ⚠ amber `↓ 10 头需补充批次信息` | ⓘ `尚有无身份猪只 未补充批次信息` | **disabled** |
| 1799:1985 | `Step2（修改过，不可提交）` | 40 | 40 头 | 20 | 20 | 25→5, 20→20 (**25**) | ⚠ amber `↓ 10 头需删除，或调整栏位总数` | ⓘ `无身份猪只数量 超出记录栏位总数` | **disabled** |
| 224:1486 | `Step2（修改过，可提交）` | 40 | 40 头 | 20 | 20 | 25→5, 26→2, 27→13 (**20**) | ✓ green `无身份猪只已全部补充批次` | none | **enabled** |

**Verbatim strings.**
| 中文 | English |
|---|---|
| `记录栏位猪只总数` | recorded pen pig total |
| `更改前` / `更改后` | before change / after change |
| `有身份猪只` / `无身份猪只` | identified pigs / un-identified pigs |
| `✓ 无身份猪只已全部补充批次` | ✓ all un-identified pigs have had a batch supplied |
| `↓ 10 头需补充批次信息` | ↓ 10 head still need batch information supplied |
| `↓ 10 头需删除，或调整栏位总数` | ↓ 10 head must be deleted, or adjust the pen total |
| `⚠ 尚有无身份猪只 未补充批次信息` | there are still un-identified pigs whose batch information has not been supplied |
| `⚠ 无身份猪只数量 超出记录栏位总数` | the un-identified pig count exceeds the recorded pen total |

**Why "修改过，不可提交" happens.** Step 2 enforces a **balance equation**:

```
记录栏位猪只总数  =  有身份猪只 (fixed by Step 1)  +  Σ(batch allocations)
```

`有身份猪只` is frozen by Step 1 (system records ± adds ± missing reports). The worker sets
`记录栏位猪只总数` with a stepper. `无身份猪只` is the remainder. Every un-identified head must be
assigned to a production line + batch. The state is submittable **only when Σ(batch allocations)
exactly equals the un-identified remainder**:

- **Σ < remainder** → "modified, cannot submit" case 1 (1797:1721): amber `N 头需补充批次信息`,
  footer `尚有无身份猪只 未补充批次信息`, submit disabled. Designer's gutter note `1834:1781`:
  `⬅️下方数量少了` ("the quantity below is short").
- **Σ > remainder** → "modified, cannot submit" case 2 (1799:1985): amber
  `N 头需删除，或调整栏位总数` — note the two escapes it offers: delete allocations, *or* raise the
  pen total. Footer `无身份猪只数量 超出记录栏位总数`, submit disabled. Designer's note `1834:1784`:
  `⬅️下方数量多了` ("the quantity below is too many").
- **Σ = remainder** → green ✓ banner, submit enabled. Designer's notes `1814:1940` / `1834:1787`:
  `⬅️下方数量正好` ("the quantity below is exactly right").

**Stepper semantics — annotation `658:3316`, verbatim:**
> `数量默认是在上一步中`
> `"新添加"的有身份猪只 + "当前系统记录"的有身份猪只和无身份猪只`
>
> `点击"+"：添加新的无身份猪只`
> `点击"-"：减去无身份猪只的数量`
> `"记录栏位猪只总数" 小于等于 有身份猪只的数量时，则不可再不可继续减少`

("The default quantity is, from the previous step, the identified pigs under '新添加' plus the
identified and un-identified pigs under '当前系统记录'. Tapping '+' adds a new un-identified pig.
Tapping '−' subtracts from the un-identified pig count. When '记录栏位猪只总数' is less than or
equal to the identified-pig count, it can no longer be decreased." — the source contains a
duplicated `不可再不可`, apparently a typo.)

So: the pen-total stepper's floor is the identified-pig count. `+`/`−` only ever move the
*un-identified* population; identified pigs are immovable at this step.

**Other Step2 annotations.**
| Node | 中文 verbatim | English |
|---|---|---|
| 1797:1965, 1797:1966, 1834:1782, 1834:1783, 1834:1785, 1834:1786, 1834:1788, 1834:1789 | `⬅这是原有的批次` | this is a pre-existing batch |
| 1834:1790 | `⬅这是新添加的批次` | this is a newly added batch |
| 907:4986 | `⬅ 删除批次无需二次确认` | **deleting a batch requires no secondary confirmation** |
| 566:2908 / 566:2909 | `⬇ Step1` / `⬇ Step2` | frame labels |
| 658:3353 | `加减猪只动效 ⬇` | add/subtract pig animation ⬇ (labels the `加猪只` 658:3317 / `减猪只` 658:3338 motion specs) |

---

## 选择批次 / 添加批次 add batch — 559:1824

The frame is named `选择批次` but the rendered page title is **`添加批次`** (Add batch).

**Controls.**
| Control | Notes |
|---|---|
| `←` back, title `添加批次` | |
| Production-line selector chip `生产线1 ›` | opens 559:1802 |
| Search field, placeholder `批次号` (batch number) | |
| Batch rows with **checkboxes** (multi-select) | `批次 25`, `批次 26`, `批次 27` rendered **checked and greyed/disabled**; `批次21`, `批次22` rendered unchecked and enabled |
| `确认` (Confirm), green primary | **disabled** in the shown state |

**Fields per row.** `批次 N` (bold) + `批次的生产状态` (batch production status) `|`
`批次生产状态的天数` (days in that production status) — both label placeholders, not data.

**Rules.**
- Annotation `1924:1784`: `⬆ 已选择的批次置顶展示` ("already-selected batches are pinned to the
  top") — which is why 25/26/27 sit above 21/22 and are checked-and-greyed: they are already
  allocated on the Step 2 screen and cannot be re-added.
- Multi-select (checkboxes), so several batches can be added in one pass; the per-batch head count
  is then set back on Step 2 with the row steppers.
- The list is scoped by the production-line chip. The parallel batch picker elsewhere in this file
  carries annotation `575:1965` `⬆️ 只能搜到所选的生产线里的批次` ("you can only find batches within
  the selected production line") — the same scoping almost certainly applies here, but that
  annotation is anchored to a different frame, so treat it as inferred rather than stated.

---

## 选择生产线 choose production line — 559:1802

**Purpose.** Set the production line that scopes the batch list.

**Controls.** Bottom sheet, title `选择生产线`, `✕` close; a **wheel picker** (iOS-style, centre
item bold — `生产线1` repeated as placeholder data); `取消` (Cancel, outline) | `确认` (Confirm,
green primary).

**Rules.** Single-select by construction. No search.

---

## 二次确认 — 数量更新 quantity update — 570:1729

**Purpose.** Final confirmation of the calibration result before it is written.

**Copy, verbatim.**
> `数量更新`
> `A1栏位猪只数量从22头更新至25头，请确认。`

("Quantity update. The pig count for pen A1 is being updated from 22 head to 25 head; please
confirm.")

**Controls.** `取消` (Cancel, outline) | `确认` (Confirm, **green primary**).

**Rules.** States the pen, the old count and the new count explicitly. Emphasis is the conventional
way round here (confirm = green), unlike 509:1702.

---

## 操作结果 operation result — 566:3375

Dark rounded toast, centred: ✓ tick + `操作成功` ("operation successful"). Referenced by annotation
1606:2219 as the response to submitting the patrol; also the terminal state of the calibration flow.

---

## Actions this cluster exposes

| Action | Entry point | Subject | Data captured | Effect on state |
|---|---|---|---|---|
| Enter a patrol | `巡检 →` card (60:417 / 88:754) → 选择巡检单元 (541:1695) | 1 unit (舍) | — | Opens the unit worksheet (60:523) |
| Toggle List ⇄ Grid | segmented toggle (60:523 / 99:627) | view only | — | Grid loses per-pig selection, filter chips, feed stations; gains an expanded note/device panel |
| Filter | funnel button (60:523, 640:1909) | the pig/pen list | batch (multi-select) per 2523:1814 | Adds removable chips (`需操作`, …) |
| Search | search field | pig / pen | `ID/栏位` in List & pen list, `ID` only in Grid | Filters the list |
| Scan | viewfinder icon + ear-tag icon, both inside every search field; plus `扫描添加` in Step 1 | 1 pig | ear tag or ear notch | Resolves to a pig; in Step 1 adds it to `新添加` |
| Select all (unit) | header checkbox (`共 200 头` / `已选 1 头`) | all pens in the unit | — | 3-state: unchecked / green-minus partial / checked |
| Select a pen | pen-card checkbox | 1 pen (all its pigs) | — | Per 907:4178, the un-identified quantity is **not asked and not allowed** |
| Select a pig — identified | row checkbox | 1 pig | — | Row ticks. No further UI (907:3431 cases 1–2) |
| Select a pig — un-identified | row checkbox | n of N pigs | **head count (required, ≥1)** | Inline `✕ [− n +] ✓` editor appears; on ✓ the chip becomes `已选 n/N` (907:3431 cases 3–4) |
| 生产 / 健康 / 记录 | bottom bar | the current selection (1..N pigs) | — | Opens a drawer of sub-functions; enabled only when a selection exists *and* can perform the op (853:2023 / 853:2065 / 853:2119). Detail is outside Part A |
| Edit unit note | pencil in `单元备注与设备状态` → 107:1694 | 1 unit | free text | Overwrites a note shared by all users; stamps `上次修改：<name> <date>` |
| Open pen drill-down | tap a grid card | 1 pen | — | 640:1909 |
| Start calibration | green pencil-on-dots next to `猪只列表（N）` | 1 pen | — | Enters Step 1 (224:1545) |
| Add pig by scan | `扫描添加` (Step 1) | 1 pig | ear tag / ear notch | Appends to `新添加` |
| Add pig manually | `手动添加` → 566:2426/2854/2788 | 1 pig (radio) | pig ID via exact search | Appends to `新添加`; result shows the pig's *current* recorded pen |
| Remove a newly-added pig | `✕` on a `新添加` row | 1 pig | — | Removes from `新添加`. No confirmation |
| Report a pig missing | `?` pin on a `当前系统记录` row → 509:1702 | 1 pig | — | Pig moves to `工具箱 → 失踪列表` (Toolbox → Missing list) |
| Set pen total | `记录栏位猪只总数` stepper (Step 2) | 1 pen | integer | Floor = identified-pig count; changes the un-identified remainder (658:3316) |
| Add batch | `+ 添加批次` → 559:1824 (+ 559:1802) | 1 pen's un-identified pigs | production line + one or more batch numbers | Adds batch allocation rows to `更改后` |
| Set batch head count | per-batch stepper (Step 2) | n un-identified pigs | integer | Feeds the balance equation |
| Delete a batch allocation | red trash on a batch row | 1 batch row | — | Removed immediately — `删除批次无需二次确认` (907:4986) |
| Submit calibration | `提交` (Step 2) → 570:1729 → 566:3375 | 1 pen | the whole before/after diff | Confirmation states `A1栏位猪只数量从22头更新至25头`; then toast `操作成功` |
| Submit patrol | `提交巡检` (60:523 / 99:627 / 640:1909) → 1506:2768 | 1 unit | optional environment + biosecurity readings | Asserts `所有栏位与设备已检查完毕`; `提交` → toast `操作成功` (1606:2219) |

---

## Rules & conditionality

**Row selection**
- `907:4178` — `勾选单条数据时，若为无 ID 猪只，需立即填写无 ID 猪只数量` / `勾选整个栏位时，无需且不可填写无 ID 猪只数量`. Single-row check on an un-identified pig **requires** an immediate quantity; whole-pen check **forbids** one.
- `907:3431` — checking a pig **with an ID** (batch or no batch) produces **no UI change** beyond the tick. Checking a pig **without an ID** (batch or no batch) always produces the inline quantity editor.
- `907:3431` — the un-identified row's chip changes from `× N` to `已选 n/N` once committed.
- `907:3431` — inside the inline editor, `−` and the confirm `✓` are disabled while the value is `0`; `✕` aborts.
- `907:3431` — the pen-level control renders as a **green minus** (indeterminate) when only some of its pigs are checked; `60:523` shows the unchecked box; `99:627` header shows the minus at unit level.

**Bottom action bar**
- `853:2065` — `选择猪只后，或选择的猪只 可执行 某操作时 底部操作功能按钮（父功能） 可用`.
- `853:2023` — `未选择猪只时，或选择的猪只 不可执行 某操作时 底部操作功能按钮（父功能） 禁用`. Confirmed visually: greyed in 60:523 and 640:1909 (nothing selected), enabled in 99:627 (`已选 1 头`).
- `853:2119` — sub-functions appear in a drawer; 发情 / 意外妊娠 / 流产 / 分娩 / 断奶 are **single-pig only**; 标记留种 / 移除留种标记 accept one or many.

**List content**
- `643:2834` — `❌ "饲喂站"功能 本期不开发` (the feed-station feature is not built this phase), despite `饲喂站（3）` being rendered and annotated `默认展开` in 60:523.
- `658:3113` — `"需操作"代表：饲喂站需加料/减料` + `❌ 本期不做饲喂站功能`. The green `需操作` label on grid cards means only "feed station needs feed added/reduced" — and that feature is out of scope.
- `60:523` in-frame — `显示疾病症状，没有就不显示`: symptom text is conditionally rendered.
- `749:2125` in-frame — `说明:20是批次号，1是生产线`: the `20₁` token is batch-number with a production-line subscript.
- `2523:1814` — `筛选：支持筛选批次，支持多选`.

**Submission**
- `1606:2219` — `所有字段都是选填` / `点击提交，toast提示：操作成功`. Every field on 提交巡检 is optional; success is a toast, not a result page.
- `1506:2768` in-frame — `所有栏位与设备已检查完毕，您可选择填写以下信息。` Submitting asserts complete coverage of pens *and* devices.

**Step 2 balance**
- `1797:1721` — under-allocation: `↓ N 头需补充批次信息` + `尚有无身份猪只 未补充批次信息` + `提交` disabled.
- `1799:1985` — over-allocation: `↓ N 头需删除，或调整栏位总数` + `无身份猪只数量 超出记录栏位总数` + `提交` disabled. Two remedies offered: delete allocations or raise the pen total.
- `224:1486` / `1796:1675` — balanced: `✓ 无身份猪只已全部补充批次` + `提交` enabled.
- `658:3316` — `"记录栏位猪只总数" 小于等于 有身份猪只的数量时，则不可再不可继续减少`: the pen-total stepper cannot go below the identified-pig count. `+` creates a new un-identified pig; `−` removes an un-identified pig.
- `658:3316` — the pen total defaults to `"新添加"的有身份猪只 + "当前系统记录"的有身份猪只和无身份猪只` (Step 1's newly-added identified pigs plus the system record's identified and un-identified pigs).
- `907:4986` — `删除批次无需二次确认`.
- `1924:1784` — `已选择的批次置顶展示`; already-allocated batches appear pinned at the top of 559:1824 as checked-and-disabled.

**Confirmation dialogs in this cluster**
- `509:1702` 上报失踪 — irreversible-ish (routes to Toolbox → Missing list); buttons `上报失踪` (outline) / `取消` (green).
- `570:1729` 数量更新 — states old and new head counts; buttons `取消` (outline) / `确认` (green).
- Removing a `新添加` row (`✕`) and deleting a batch row (trash) both have **no** confirmation.

---

## Ambiguities / contradictions found

1. **The feed-station section is fully designed and explicitly out of scope.** `643:2834` says
   `❌ "饲喂站"功能 本期不开发` and `658:3113` repeats `❌ 本期不做饲喂站功能`, yet 60:523 renders
   `饲喂站（3）` with three tiles, an annotation `默认展开` specifying its default expansion, and
   `正常态` / `需操作` state labels. And `需操作` — which also appears as a **filter chip** on the
   list and as the only status line on grid cards — is defined *solely* in feed-station terms. If
   feed stations ship disabled, it is unspecified what `需操作` then means, and whether the chip and
   the grid-card status line have any content at all.

2. **Feed-station default expansion is contradicted within the same frame.** `默认展开` annotates
   A1's `饲喂站（3）` (expanded, `⌃`), but the very next pen card `A100` in the same frame renders
   `饲喂站（3）` collapsed (`⌄`).

3. **`更改后` header on 60:523 vs. selection depth in Grid.** The Grid view has no per-pig
   checkboxes at all, only per-pen ones. Since `907:4178` forbids entering an un-identified
   quantity when the whole pen is checked, **an un-identified pig population can never be partially
   selected from the Grid view.** Whether that is intentional (grid = coarse, list = fine) or an
   omission is not stated anywhere.

4. **Arithmetic in the over-allocation mock does not add up.** 1799:1985 shows
   `记录栏位猪只总数 = 40`, `有身份猪只 20`, `无身份猪只 20`, and batch rows summing to `5 + 20 = 25`
   — an excess of **5**, yet the banner reads `↓ 10 头需删除，或调整栏位总数` and no third batch row
   exists. The under-allocation frame 1797:1721 (`5 + 5 = 10` vs `20` needed → `10 头需补充批次信息`)
   *is* self-consistent, as is the submittable frame 224:1486 (`5 + 2 + 13 = 20` vs `20`). Either
   1799:1985's mock data is wrong or the over-allocation figure is computed differently from the
   under-allocation figure; the file does not say which.

5. **Step 1's search placeholder changes between states.** `ID` in 224:1545 (default) vs
   `耳标号/耳缺号` ("ear-tag / ear-notch number") in 224:1618 (after adding). Same field, same
   section (`当前系统记录`), two different contracts about what is searchable. The manual-add screens
   use `ID` again (566:2426/2854), while the patrol list uses `ID/栏位`.

6. **The 上报失踪 dialog inverts button emphasis.** `取消` is the green primary and the destructive
   `上报失踪` is the outline button (509:1702) — the opposite of 570:1729 and 107:1694, where
   `确认` is green. Either an error or an unstated deliberate friction; nothing annotates it.

7. **`确认` is disabled on the manual-add search-result screen.** 566:2788 shows a matched pig with
   an *unselected* radio and `确认` greyed, so the gate is presumably "a pig is selected". But no
   frame shows the selected/enabled state, so the enablement condition is inferred, not documented.

8. **What `提交巡检` actually asserts is never validated.** The copy claims
   `所有栏位与设备已检查完毕`, but no screen gates the button on every pen being ticked, no progress
   indicator exists on the worksheet, and `提交巡检` is offered even from the single-pen drill-down
   (640:1909) where at most one pen is in view. Nothing defines what makes a pen "checked" — ticking
   its checkbox? opening it? performing an action on it? — nor how the workshop-home counter
   `20 / 40 已检查` is incremented.

9. **The patrol card shows two incompatible metrics.** `20 / 40 已检查` on the workshop tab vs
   `365 天前，顾大华` on a unit tab (60:417 vs 88:754). Whether these are two variants of one
   component or two different data contracts is not stated.

10. **Frame name vs page title on the batch picker.** 559:1824 is named `选择批次` (choose batch) in
    Figma but titled `添加批次` (add batch) in the design. Its top-right also contains an empty white
    rectangle where an action (clear? done?) would sit.

11. **Batch-list scoping to the production line is only annotated on a sibling flow.** `575:1965`
    (`只能搜到所选的生产线里的批次` — you can only find batches inside the selected production line)
    is anchored to a different batch picker elsewhere in the file, not to 559:1824. The same rule is
    strongly implied by the `生产线1 ›` chip but is not stated for this screen.

12. **`猪只列表（5）` vs the number of rows rendered.** The A1 legend card in 60:523 declares 5 pigs
    but renders 6 rows (the extra being a second `No ID Pigs × 2` variant used to demonstrate the
    no-batch wrapping style). Mock artefact, not a rule — noted so it is not mistaken for one.

13. **Typo carried in a requirement.** `658:3316` reads
    `则不可再不可继续减少` — `不可` is duplicated. Intended meaning is clearly "cannot be decreased
    further".
