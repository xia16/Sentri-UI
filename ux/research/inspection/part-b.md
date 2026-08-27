# Part B — 设备巡检与故障上报 (Equipment inspection & fault reporting)

Figma file `4GZGPBauEOWQQjnRrzoUgF`, page `60:406` (🟢 UI设计稿), section `60:408` (巡检).
Module title frame `227:5258` = **设备** (Equipment). The module occupies canvas x 20750–28150, y 400–4100
and contains **exactly 8 screen frames** plus 4 annotation objects and 1 stray artefact — nothing else.

## Screen inventory

| Node | Screen (中文) | English | Purpose |
|---|---|---|---|
| `580:2242` | 设备列表 | Equipment list (entered from a pen) | Browse devices of a pen/unit, see status, multi-select for fault actions |
| `337:1020` | 设备列表 | Equipment list (entered from a unit) | Same screen, shown with one row selected → 上报故障 enabled |
| `571:4757` | 筛选 | Filter | Narrow the equipment list by type / status / pen |
| `1574:3988` | 上报故障-非"其他"设备 | Report fault — non-"other" device | Bottom sheet: describe a fault on a typed device |
| `1574:4029` | 上报故障-"其他"设备 | Report fault — "other" device | Same sheet + a free-text device-name field |
| `225:4803` | 非"其他"设备-异常详情 | Anomaly detail — non-other | Read-only sheet showing the one open fault record |
| `1392:2929` | "其他"设备-异常详情 | Anomaly detail — other | Read-only sheet showing N fault records, one card each |
| `591:4283` | 操作结果 | Operation result | 操作成功 (success) toast |

Annotation objects in the module (not screens):

| Node | Type | Content |
|---|---|---|
| `580:2436` | text (magenta) | `⬇️ 从栏位进入` — "entered from a pen" (caption above `580:2242`) |
| `580:2437` | text (magenta) | `⬇️ 从单元进入` — "entered from a unit" (caption above `337:1020`) |
| `928:2008` | text (magenta) | The behaviour spec — quoted in full under **Rules & conditionality** |
| `928:1869` | arrow vector | `tab --> 筛选` — the filter tab opens `571:4757` |
| `1397:3211` | arrow vector | `tag --> 非"其他"设备-异常详情` — from the 故障 chip on the A2/喝水站 row to `225:4803` |
| `1397:3212` | arrow vector | `tag --> "其他"设备-异常详情` — from the 故障(3) chip on the A2/其他 row to `1392:2929` |
| `227:4869` | frame `栏位号` | Stray 80×80 copy of the pen-number badge ("A1") loose on canvas at x 25373 — artefact, not an annotation |

### Upstream entry points (outside this cluster, needed to answer scope)

| Node | Screen | Relevant content |
|---|---|---|
| `60:523` | 巡检任务详情-List | Per-pen row carries a green **handyman (wrench) icon with a red count badge (`2`)**. Arrow `642:2705` = `handyman --> 异常设备列表`, landing inside `580:2242`. |
| `99:627` | 巡检任务详情-Grid | Collapsible **单元备注与设备状态** panel; when expanded it shows 3 equipment tiles — 饲喂器 `2` (red), 供水 `0` (green), 其他 `0` (green) — each with a wrench icon. Arrow `642:2718` = `handyman --> 设备异常列表`, landing inside `337:1020`. |
| `1506:2768` / `1563:2560` | 提交巡检（默认态 / 展开状态） | The pig-inspection submit screen. Contains **no equipment or fault section** — only 环境数据 and 生物安全评估. Its completion banner reads `巡检完成 / 所有栏位与设备已检查完毕，您可选择填写以下信息。` |

---

## 设备列表 — `580:2242` (从栏位进入) and `337:1020` (从单元进入)

**Purpose.** List every device belonging to the pen(s) in scope, grouped by pen, showing each device's
normal/fault status; multi-select devices to report or resolve faults.

**Frame size** 750 × 2500 (both). The two frames are **pixel-identical except for one checkbox and the
resulting button state** — a full-frame pixel diff produces differing bands only at rows 448–485,
704–741, 986–1023 (chip sub-pixel shift + the checked box) and 1891–1996 (the bottom bar).

**Controls.**

| Control | Node (in `580:2242`) | Behaviour / state |
|---|---|---|
| Back arrow `arrow_forward` | `580:2299` | Nav-bar left |
| Title `设备` | `580:2302` | Centred |
| Nav-bar right slot | `580:2303` (`占位` = placeholder) | **Empty 48×48 reserved slot — no action defined** |
| Search field, placeholder `设备名称` | `580:2245` / text `580:2247` | Magnifier icon `search-line` (`580:2246`). **No scan / NFC / camera icon** — unlike the pig lists |
| Filter tab (funnel icon `filter-2-line`) | `580:2248` | Opens 筛选 `571:4757` (arrow `928:1869`) |
| Pen card | `1388:2520` (A1), `1392:2619` (A2) | Card header `栏位` with a `栏位号` badge (A1 / A2) |
| Device row | `1388:2526`, `1388:2539`, `1388:2553` … | icon tile + name + status tag + checkbox |
| Status tag | e.g. `1392:2608` (check) / `1392:2651` (error) | **Tappable** → opens the matching 异常详情 sheet |
| Row checkbox `checkbox-blank-line` | e.g. `1388:2584` | Multi-select; unchecked in `580:2242`, A1/饲喂站 checked in `337:1020` |
| Sub-row (under 其他) | `1397:3175`, `1397:3179`, `1397:3183` | Name text + its **own checkbox**; **no status tag** |
| `上报故障` (Report fault) | `1388:2515` / `1392:2707` | Amber. Disabled in `580:2242`; **enabled (solid amber) in `337:1020`** |
| `解决故障` (Resolve fault) | `1388:2517` / `1392:2709` | Green. Disabled in **both** frames |
| Bottom bar container | `1388:2514` / `1392:2706` | **Layer is literally named `废弃` (deprecated / discarded) in both variants** |

**Data shown per row.**

| Field | Values seen | Notes |
|---|---|---|
| Device type name | `饲喂站` (feeding station), `喝水站` (drinking station), `其他` (other) | Only these three types exist anywhere in the module |
| Type icon | `savings` (piggy bank, amber tile) = 饲喂站; `oil_barrel` (cyan tile) = 喝水站; `batch_prediction` (purple tile) = 其他 | Same icon components reused in the fault sheets and detail sheets |
| Status tag | `✓ 正常` (green), `⚠ 故障` (amber), `⚠ 故障 (3)` (amber with count) | Count appears only on 其他 |
| Selection | checkbox | — |
| Pen grouping | `A1`, `A2` cards | One card per pen; both frames show the same two pens |

**Sample data as drawn (identical in both variants).**

| Pen | Device | Status |
|---|---|---|
| A1 | 饲喂站 | 正常 (checked in `337:1020`) |
| A1 | 喝水站 | 正常 |
| A1 | 其他 | 正常 |
| A2 | 饲喂站 | 正常 |
| A2 | 喝水站 | 故障 |
| A2 | 其他 | 故障 (3) → expands to 风扇 (fan), 栏位门 (pen gate), 空调 (air conditioner) |

**Rules.**
- The 其他 row expands **inline** into a nested sub-list when it has faults; the sub-list length equals
  the number in the tag (`故障 (3)` → 3 sub-rows). A 正常 其他 row (A1) does not expand.
- Sub-rows carry checkboxes but no status tag — everything listed there is a fault record.
- Only faulty 其他 sub-devices are listed. There is **no browsable registry of 其他 devices**; the
  fault form asks the reporter to type the name instead (see `1574:4029`).

**Bulk / scan.** Multi-select via per-row checkboxes, spanning pens and spanning the 其他 sub-list;
the two bottom buttons act on the whole selection. **No scan, NFC or ear-notch affordance anywhere in
this cluster.**

---

## 筛选 — `571:4757`

**Purpose.** Filter the equipment list. Full-screen sheet, 750 × 1624.

**Controls.**

| Control | Node | Notes |
|---|---|---|
| Close `X` | `571:4841` | Nav-bar **left** (mirror of the equipment list, which has back-left) |
| Title `筛选` | `571:4833` | — |
| Nav-bar right slot | `571:4834` (`占位`) | Empty placeholder — **no 重置 in the header** |
| `重置` (Reset) | `571:4807` | Outlined, bottom-left, 226 wide |
| `确认` (Confirm) | `571:4809` | Solid green, bottom-right, 436 wide |

**Fields.**

| Group (中文) | English | Options | Default | Type |
|---|---|---|---|---|
| 设备类型 (`571:4765`) | Device type | 全部 / 饲喂站 / 喝水站 / 其他 | 全部 | Chip group, wraps to 2 rows (3 per row), single-select as drawn |
| 设备状态 (`928:1770`) | Device status | 全部 / 正常 / 故障 | 全部 | Chip group, 1 row |
| 栏位 (`928:1781`) | Pen | 全部 / A / B | 全部 | Chip group, 1 row |

Selected chips render mint-green fill + green text; unselected render grey fill + dark text.
Nothing indicates multi-select; each group shows exactly one green chip.

**Rules.** No conditional visibility. No annotation attached to this screen beyond the entry arrow
`928:1869` (`tab --> 筛选`).

---

## 上报故障-非"其他"设备 — `1574:3988`

**Purpose.** Report a fault on a device that has a defined type (饲喂站 / 喝水站).

**Layout.** Scrim `1574:3989` over the list; bottom drawer `1574:3990` at y 948, height **676**.

**Controls.**

| Control | Node | State |
|---|---|---|
| Title `上报故障` | `1574:3993` | — |
| Nav-bar left slot | `1574:3992` (`占位`) | Empty |
| Close `X` | `1574:3994` | Nav-bar right |
| `提交` (Submit) | `1574:4026` / text `1574:4027` | **Disabled** (pale green) while 描述 is empty |

**Fields.**

| Field | Type | Required | Default | Placeholder | Notes |
|---|---|---|---|---|---|
| Device summary card (`1769:1691`) | read-only | — | pre-filled from selection | — | Type icon (`savings`), device name `饲喂站`, and a `location_on` pin + `A1` = 栏位号 (pen number) |
| `描述` (Description) | multi-line text area `1574:4022` | **Yes** — red `*` at `1574:4021` | empty | `请简单描述` ("please describe briefly") | 686 × 174, text inset 24px, ~2 lines tall |

**Rules.** No fault-type picker, no severity, no photo/attachment control, no reporter or timestamp
input — those exist as nodes nowhere in the frame. `提交` gates on 描述 only.

**Bulk / scan.** The sheet shows **one** device card. No node exists for an N-device variant.

---

## 上报故障-"其他"设备 — `1574:4029`

**Purpose.** Report a fault on an unclassified device, which must first be named.

**Layout.** Drawer `1574:4031` at y 760, height **864** (188 taller than the non-other sheet — the
extra field is what grows it).

**Fields.**

| Field | Type | Required | Default | Placeholder | Notes |
|---|---|---|---|---|---|
| Device summary card (`1769:1677`) | read-only | — | pre-filled | — | Icon `batch_prediction`, name `其他`, pin + `A1` |
| `设备名称` (Device name) | single-line input `1574:4059` | **Yes** — red `*` at `1574:4058` | empty | `请输入设备名称` ("please enter the device name") | 686 × 96; **this field is the only structural difference from `1574:3988`** |
| `描述` (Description) | text area `1574:4065` | **Yes** — red `*` at `1574:4064` | empty | `请简单描述` | Identical to the non-other sheet |

**Controls.** Title `上报故障` (`1574:4034`), close `X` (`1574:4035`), `提交` (`1574:4053`) shown
**disabled**.

**Why 其他 branches.** Annotation `928:2008`: `"其他"是所有没有明确设备类型的设备的聚合`
("'Other' is the aggregate of all devices with no defined device type"). Because there is no device
record to point at, the reporter supplies the identity (`设备名称`) as free text at report time —
which is also why 其他 accepts repeat reports while typed devices do not.

---

## 非"其他"设备-异常详情 — `225:4803`

**Purpose.** Read-only view of the open fault on a typed device.

**Layout.** Drawer `225:4805` at y 1080, height **544** (shortest of the sheets — one record).

**Controls.** Title `异常详情` (`225:4808`), close `X` (`235:1235`), empty left slot `225:4807`.
**No action buttons at all** — there is no `底部按钮` frame, so no resolve/edit/delete affordance here.

**Fields (all read-only).**

| Field | Node | Sample value |
|---|---|---|
| Device icon + name | `1574:4068` / `1574:4074` | `savings` icon, `饲喂站` |
| 栏位号 (pen) | `1574:4080` with `location_on` pin `1578:1598` | `A1` |
| Description body | `227:4865` | `喝水站是怎么怎么坏的，需要尽快维修，吧啦吧啦吧啦吧啦` |
| `上报人：` (Reported by) | label `227:4866`, value `1392:2959` | `张华强` |
| `上报时间：` (Reported at) | label `1392:2961`, value `1392:2962` | `2025/05/05 12:00` |

**Rules.** Exactly one record card. Entry is by tapping the `故障` status chip on the row
(arrow `1397:3211`).

---

## "其他"设备-异常详情 — `1392:2929`

**Purpose.** Read-only list of **all** open fault records aggregated under 其他 for one pen.

**Layout.** Drawer `1392:2931` at y 436, height **1188** — the tallest sheet, because it holds N cards.

**Controls.** Title `异常详情` (`1392:2934`), close `X` (`1392:2935`). **No action buttons.**

**Fields.** Header device card (`1578:1601`): `batch_prediction` icon, `其他`, pin + `A1`.
Then one card per record (`1392:2944`, `1397:2972`, `1397:3148`) — 3 cards, matching the `故障 (3)` tag:

| Card | Sub-device title | Description | 上报人 | 上报时间 |
|---|---|---|---|---|
| `1392:2944` | `风扇` (fan) | `南边墙上的风扇坏了，需要换零件，扇叶也需要换新的` | 张华强 | 2025/05/05 12:00 |
| `1397:2972` | `栏位门` (pen gate) | `A1栏位的门锁不上了` | 张华强 | 2025/05/05 12:00 |
| `1397:3148` | `空调` (air conditioner) | `不能制冷了` | 张华强 | 2025/05/05 12:00 |

**Rules.** The per-record `title` node (`1397:3122` etc.) exists **only** in this variant — it carries
the free-text `设备名称` captured on `1574:4029`. Entry is by tapping the `故障 (3)` chip
(arrow `1397:3212`).

---

## 操作结果 — `591:4283`

**Purpose.** Confirmation toast after a fault action.

Centred dark rounded square, white check glyph, label `操作成功` ("operation successful").
No buttons, no dismiss control — a timed toast. Same component used by the pig modules
(`473:3759`, `473:3764`, `479:1958`, `1482:2076`).

---

## Actions this cluster exposes

| Action | Entry point | Subject | Data captured | Effect on state |
|---|---|---|---|---|
| Open equipment list (pen scope) | Wrench icon + fault-count badge on a pen row in 巡检任务详情-List `60:523` (arrow `642:2705`) | 1 pen | — | → `580:2242` |
| Open equipment list (unit scope) | Wrench icon in a 设备状态 tile inside 单元备注与设备状态 on 巡检任务详情-Grid `99:627` (arrow `642:2718`) | 1 unit | — | → `337:1020` |
| Search | Search field `580:2245` | — | 设备名称 (free text) | Filters list |
| Filter | Funnel tab `580:2248` → `571:4757` → `确认` | — | 设备类型, 设备状态, 栏位 | Filters list; `重置` clears |
| Select device(s) | Row checkbox `1388:2584` etc., and sub-row checkboxes `1397:3177` etc. | 1..N devices | — | Gates the two bottom buttons |
| 上报故障 (report fault) | Bottom-bar button `1388:2515` → sheet `1574:3988` / `1574:4029` → `提交` | N selected **正常** devices (sheet renders 1) | 描述* ; plus 设备名称* when type = 其他 | Device status → 故障; fault count increments; `操作成功` toast `591:4283` |
| 解决故障 (resolve fault) | Bottom-bar button `1388:2517` | N selected **故障** devices | none shown anywhere in the file | Presumed status → 正常; **no screen exists for this flow** |
| 查看异常详情 (view anomaly) | Tap the `故障` / `故障 (n)` status chip (arrows `1397:3211`, `1397:3212`) | 1 device | — | Opens read-only sheet `225:4803` or `1392:2929` |

### What a fault record captures

Written by the reporter: `设备名称` (free text, **其他 only**), `描述` (free text).
Implied / system-supplied (visible on the detail sheets, absent from the form):
device type, `栏位号`, `上报人`, `上报时间`.
**Not captured anywhere:** severity/priority, fault category or code, photos or any attachment,
due date, assignee, resolution note, resolved-by, resolved-at.

---

## Rules & conditionality

Annotation `928:2008` (magenta, sits below `337:1020` with an ⬆️ pointing at it) — verbatim:

> `"正常"的设备，可以点击"上报故障"按钮`
> `"故障"的设备，可以点击"解决故障"按钮`
> `同时选择"正常、故障"的设备时，两个按钮均禁用`
>
> `"饲喂站、喝水站"不可重复上报故障，`
> `点击上报故障后，即为上报成功，不需要填写备注`
>
> `"其他"是所有没有明确设备类型的设备的聚合，`
> `可以重复上报故障，每次上报故障时，需要填写备注`
> `解决故障时，需要一条一条的解决`

Translation:

> Devices that are "正常" (normal) can use the "上报故障" (report fault) button.
> Devices that are "故障" (faulty) can use the "解决故障" (resolve fault) button.
> When "正常" and "故障" devices are selected at the same time, **both buttons are disabled**.
>
> "饲喂站、喝水站" (feeding station, drinking station) **cannot have a fault reported twice**;
> once you tap report-fault it counts as reported successfully — **no note needs to be filled in**.
>
> "其他" (other) is the aggregate of all devices with no defined device type;
> it **can take repeated fault reports**, and **each report requires a note**.
> When resolving, they must be **resolved one record at a time**.

Derived / observed rules:

- **Button gating** (`580:2242` vs `337:1020`): with nothing selected both buttons are disabled;
  with one 正常 device selected `上报故障` turns solid amber while `解决故障` stays pale green.
  Mixed selection disables both (per `928:2008`).
- **Duplicate-report block** (`928:2008`): 饲喂站 / 喝水站 hold at most one open fault; 其他 holds many —
  which is exactly why `1392:2929` renders N record cards and `225:4803` renders one.
- **其他 expansion** (`1397:3159` in `580:2242`): a faulty 其他 row expands inline to one sub-row per open
  record; the tag count `故障 (3)` equals the sub-row count equals the card count on `1392:2929`.
- **Status chip is the detail affordance** (`1397:3211`, `1397:3212`): 异常详情 opens from the chip, not
  from the row or the checkbox.
- **Required-field gating** (`1574:3988`, `1574:4029`): `提交` renders disabled in both sheets while the
  starred fields are empty. Non-other requires 描述; other requires 设备名称 + 描述.
- **Sheet height is content-driven**: 676 (1 field) / 864 (2 fields) / 544 (1 record) / 1188 (3 records).
- **Scope of the 巡检 submission** (`1563:2560`): the submit screen carries only 环境数据 (temperature,
  humidity, ammonia, CO₂, light, ventilation, water use, feed total, other observations) and
  生物安全评估 (cleanliness grade, biosecurity compliance, biosecurity notes). **No equipment fields, no
  fault list, no fault count.** Its banner asserts `所有栏位与设备已检查完毕，您可选择填写以下信息。`
  ("All pens and equipment have been checked; you may optionally fill in the following.")

**Answer to "does equipment share the pig inspection's submit flow?" — No, only the completion gate.**
Fault reports are committed the moment `提交` is tapped in the bottom sheet, each producing its own
`操作成功` toast. They are not queued into, summarised on, or re-submitted by 提交巡检. Equipment is tied
to the 巡检 only by (a) being reached from 巡检任务详情, and (b) being named in the completion copy on
提交巡检 as something that must already be "checked".

---

## Ambiguities / contradictions found

1. **The annotation contradicts the fault form.** `928:2008` says
   `"饲喂站、喝水站"…不需要填写备注` ("no note needs to be filled in"), and that tapping report-fault
   *is* the successful report. But `1574:3988` (上报故障-非"其他"设备) is a full sheet with a
   **required** `描述 *` and a disabled `提交`. Node ids say the sheet (`1574:*`) is much newer than the
   annotation (`928:*`), so the sheet is probably current and the annotation stale — but nothing in the
   file states this.
2. **The bottom action bar is named `废弃` (deprecated) in both list variants** — `1388:2514` in
   `580:2242` and `1392:2706` in `337:1020` — yet it renders fully, is the only affordance that could
   launch either fault flow, and is the subject of the annotation's first three lines. Either the
   two-button pattern is retired (and no replacement trigger is drawn), or the layer name is stale.
3. **No 解决故障 screen exists.** A file-wide scan of the 巡检 section finds no frame named 解决/维修/
   resolve. `928:2008` requires 其他 faults to be `一条一条的解决` (resolved one at a time), which implies
   a per-record UI that is not designed. Whether resolve is one-tap or opens a confirm/note step is
   undefined.
4. **The two 设备列表 variants do not actually differ by entry point.** They are captioned `从栏位进入`
   (`580:2436`) and `从单元进入` (`580:2437`), but both render the **same two pens (A1 + A2)** and are
   pixel-identical apart from one checked checkbox. A pen-scoped list showing A2 makes no sense. So the
   pair documents a **selection state**, and the pen-vs-unit scoping difference the captions promise is
   not drawn.
5. **Device-type naming is inconsistent across screens.** The unit panel on `99:627` labels the three
   tiles `饲喂器` (feeder) / `供水` (water supply) / `其他`; the list and filter use
   `饲喂站` / `喝水站` / `其他`. The two entry arrows are also named differently for the same destination:
   `异常设备列表` (`642:2705`) vs `设备异常列表` (`642:2718`), neither matching the frame name `设备列表`.
6. **Filter pen values do not match list pen values.** `571:4757` offers 栏位 = `全部 / A / B`; the list
   groups by `A1` / `A2`. Either the filter is by pen *row* letter and the list by pen id, or one is
   placeholder data.
7. **Multi-select vs single-device form.** The list supports selecting N devices across pens, but both
   报故障 sheets show exactly one device card and one 描述 box. What happens on N > 1 — one shared
   description, a stepper through N sheets, or a disallowed state — is not specified.
8. **Parent/child selection under 其他 is undefined.** The 其他 row has its own checkbox *and* each
   expanded sub-row has one (`1397:3172` vs `1397:3177`/`3181`/`3185`). Whether ticking the parent ticks
   all children, and what "resolve the parent" means given the one-at-a-time rule, is not stated.
9. **No 其他 device registry.** Only *faulty* 其他 sub-devices are listed, and the report form asks for a
   free-text `设备名称`. So the same physical fan can be filed under three different spellings, and a
   healthy 其他 device cannot be inspected or looked up.
10. **`提交巡检` claims equipment was "checked" but the device list has no inspect action.**
    `所有栏位与设备已检查完毕` implies a per-device inspected/checked mark; the equipment list has only a
    selection checkbox (used to arm the fault buttons) and a status chip. There is no affordance that
    marks a device as inspected, and no completion counter for equipment.
11. **No incoming link is annotated for the two 上报故障 sheets.** `928:1869`, `1397:3211` and `1397:3212`
    are the module's only flow arrows; nothing connects a button to `1574:3988` / `1574:4029`.
12. **Sample-copy mismatch on `225:4803`:** the device card reads `饲喂站` while the description body
    reads `喝水站是怎么怎么坏的…` ("how the *drinking station* broke…"). Placeholder-text error, but it
    makes the record's subject ambiguous.
13. **Two empty `占位` (placeholder) slots** sit in the nav bars — `580:2303` (equipment list, right) and
    `571:4834` (filter, right). Reserved actions with no defined behaviour.
14. **Stray canvas artefact** `227:4869` — a loose `栏位号` badge rendering "A1" parked at x 25373,
    outside every frame.
