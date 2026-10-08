# Piglet processing (仔猪处理) — inventory of existing screens and surfaces

Research date 2026-09-29. What exists before design starts: repo prototypes, production
Figma frames, the farrowing reference, and the design-system cards. Descriptive only; the
single judgement allowed here is "likely reuse".

Sources read: `ux/system/**`, `ux/model/**`, `ux/design-system/**`, `ux/archive/task-screens-combined.html`,
`ux/research/tasks/piglet-processing.html` (the PRD), `ux/research/farrowing/RULINGS.md`,
`ux/tasks/piglet-processing/research/figma-inventory.md`. The held-out eval set was not opened.

---

## 1 · Repo prototypes

**There is no piglet-processing task screen in the repo.** Every current (`ux/system/`) surface is
either (a) a home/task-card entry that dead-ends in a generic placeholder page, or (b) a set of
litter-level pages bolted onto the farrowing prototype and reached from a sow's action menu. The
most complete renderings of the task are in the **archive** (static mocks from the pre-Astra
"task screens" round that the PRD §4 cites).

### 1a · Entry points — home and task cards

| File · anchor | What it shows | Components | Placeholder vs real |
|---|---|---|---|
| `ux/system/home-astra-prototype.js:59` task `piglet27` | Home task card: `Piglet processing` · Batch 27 · `Day 3 · litter care` · `Due today` · counts per unit 6 and 7 · measure `pens` | `astra-home-task-card.js` (home task card) | Card data is sample; card is the shared home card |
| `home-astra-prototype.js:65` task `piglet26done` | Completed-task card, Batch 26, `Today, 09:10` | same | sample |
| `home-astra-prototype.js:116` `cardFields.piglet27` | Card copy: `Age-day schedule` · day 3 of 7 · progress label `All scheduled items complete` · verb `litters due` · state `waiting` | same | sample |
| `home-astra-prototype.js:239-241` `openTask()` | **Routing:** only `farrow28` opens a designed page (`farrowing-astra-concept.html`); every other id — including `piglet27` — calls `push('placeholder')` | — | **Placeholder route** |
| `home-astra-prototype.js:243-248` `placeholder()` | Generic page: header = task type + batch/unit; empty state `Task preview` / "This task page is still to come. The task stays open between scheduled work."; footer `Back` + `End task early` (or `Complete task` when ready). Completed variant: `Task complete` + "Results page not designed yet." | `head()`, `.empty-state`, `page-footer` | **Pure placeholder** |
| `ux/system/astra-home-task-card.js:115-128` `"piglet"` | Card rules: title, label `litters with care due`, next `Next care`, dependency `farrowing`, priority list, support/completion rules ("All required items across the entire age-day schedule recorded AND farrowing closed"), source → PRD | home task card | Real rule text (card spec) |
| `astra-home-task-card.js:208-210` | Fallback line: `Next care · …` / `Waiting for next scheduled care` | same | real |
| `ux/system/task-cards-astra-prototype.js:11` `id:'piglet'` | Card gallery entry: Batch 28 · `litters with work due` · kind `milestones` · day 3/7 · rule/timing/inside notes | task card gallery | Gallery only; no click-through |
| `task-cards-astra-prototype.js:32` | Scenarios: `Care due now` · `Next scheduled care` · `Unit waiting` (+ common) | same | real |
| `ux/system/astra-task-overview.js:26` | Task-overview KPI entry: `On time` 90% · `Target ≥ 90%` · `100/200 Pens completed` · `Day 3 window` | task overview card | sample, reused shape |

### 1b · Litter-level pages inside the farrowing prototype (`ux/system/farrowing-astra-concept.js`)

Reached **only** from a sow: sow page (inspection iframe) → action sheet → "Piglet processing actions"
group, or the sow's current-task row (`current-task` postMessage, `:430` → `pigletCare`). Registered as
pages in `ux/system/astra-surfaces.js:5` (`pigletCare, pigletEdit, foster, pigletDeath, countReconcile`).
All render through `featurePage()` (`:441`): a page `sheet` with `utility-header` (`SentriUI.heading`) +
footer `Back` · one primary button. Styling in `farrowing-astra-concept.css:15` (`.processing-*`,
`.piglet-*`, `.feature-*`) and `farrowing-subpages-refinement.css:77-115`.

| View · function · line | What it shows | Components | Placeholder notes |
|---|---|---|---|
| Action catalogue `sowActionCatalogue()` `:403-415` | Four actions scoped `piglet-processing`: `Piglet processing` (sub "Care and identity · N identified · N without identity"), `Record piglet deaths`, `Reconcile piglet count`, `Foster piglets`. Grouped under a "Piglet processing" heading on the sow action sheet (`inspection-astra-concept.js:721-795`; asserted in `astra-surfaces.test.cjs:143-167`) | verb/action sheet, Row | Real grouping; entries lead to the pages below |
| Sow current tasks `:421` | Row `Piglet processing` · `Due today` / `Up to date` · "N of M care steps complete" | Row | derived from sample |
| `pigletCare` · `pigletCarePage()` `:459-464` | Page `Piglet processing` · subtitle `B1 · sow 000418 · N alive`. Segment `Care` / `Piglet records`. Primary: `Save care updates` (Care) or `Report mortality · n` (Records) | Segment, Panel, featurePage, Button | Tabs mirror production's 仔猪处理 / 仔猪信息 |
| Care tab · `processingCare()` `:450-453` | Callout "N of M care items complete"; one bordered block per day (`Day 1` Recorded · `Day 3` Due today · `Day 5` In 2 days); each item a tappable toggle with stamp | Panel (`feature-callout`), custom `.processing-day` / `.processing-task` | **Placeholder data:** 5 items (`Dry and warm`, `Disinfect navel`, `Iron supplement`, `Ear tag, notch and weight`, `Health check`) at days 1/3/5 (`:13`) — not production's 8 treatments or 1/2/3/5/7 schedule. Uses a Save button (README forbids) |
| Records tab · `processingRecords()` `:454-458` | Facts (identified / alive / without identity), amber warning "N piglets do not have identity details", search (tag/notch), tools `Scan tag` · `Ear notch` · `Add piglet`, piglet roster (checkbox + tag, notch · sex · weight, state), row `Foster piglets` | Facts, Panel, Row, custom `.piglet-search` `.identity-tools` `.piglet-roster` | Roster = production's 仔猪列表; one piglet per page edit, no conveyor |
| `pigletEdit` · `pigletEditPage()` `:465-469` | `Add piglet identity` / `Piglet identity`: fields Ear tag (text), Ear notch (text), Sex (PickerField), Weight kg (text). Primary `Save identity` | `SentriUI.field` (no card), PickerField | Placeholder; no numpad / next-piglet |
| `foster` · `fosterPage()` `:470-474` | `Send piglets` / `Receive piglets` choice, target sow list, count stepper, hint; primary `Send N piglets` | custom stepper (`.feature-stepper`), buttons | **Fostering is PARKED** per `RULINGS.md` "After the lock" (owner 2026-08-30) — this page predates/ignores that |
| `pigletDeath` · `pigletDeathPage()` `:475-479` | `Report piglet mortality`: selected identified piglets + unidentified stepper, Cause picker (`Cause unknown · Crushed · Scours · Starve-out · Other`), optional photos; primary `Save mortality · n` | Panel, PickerField, custom stepper | **Separate** from farrowing's ruled dead drawer (`death()` `:377`) — two death surfaces exist |
| `countReconcile` · `countReconcilePage()` `:480-484` | `System count` vs `Reported count`, stepper floored at identified-alive, warning "reported count will replace N", Reason textarea; primary `Save corrected count` | custom stepper, field | Merges production's 4 count dialogs into one page |
| Styling only | `farrowing-astra-concept.css:15`, `farrowing-subpages-refinement.css:77` "Linked piglet care, identity, foster, mortality, marker, and reconciliation pages." | — | — |

**Reused from farrowing vs placeholder:** the page shell, Back/primary footer, Segment, Heading, Facts, Panel,
Row, PickerField and the sow context header are the farrowing/shared kit. The day blocks, piglet roster,
search, identity tools, all four steppers and the care-item list are one-off CSS in the farrowing stylesheet
with sample data. There is no room/list, filter, bulk, task header, end-task or receipt for this task.

### 1c · Other current mentions (reference/specification, not screens)

| File · anchor | Content |
|---|---|
| `ux/system/components.html` §01b (`:576-579`) | Row-grammar table row `Piglet proc.`: `12 piglets · day 3` · `teeth · tail · castrate · tag/weigh` · done `All done · 9 piglets` ✎ |
| `components.html` §04 (`:636-641`, `:684`) | Field kit: Checklist sample (`Teeth clipping`, `Castration done Jul 6 · G.H`); Numpad rule "per-piglet tag / weight"; note "Composites… treatments + per-piglet identity" |
| `components.html` §04d (`:766`), §05 (`:882-884`, `:1133-1157`) | Chassis: composite = weaning & piglet processing; treatments = C1 checklist bulk per litter; tag/weigh = C5 whose section is a C3, per-piglet numpad run; "母猪流产 had no business in a piglet-processing menu" |
| `components.html` §02 (`:1257`, `:1311-1320`) | Pen picker slide `Piglet processing` — `Go to pen · Unit 7 · due today`, grid cells done/due/late |
| `components.html` §02b (`:1361`) | Status matrix row `Piglet proc.`: `late` · `due` · `done` · `next 2d` |
| `components.html` §02c (`:1382-1398`, note `:1448`) | Peek slide: `PEN B1 · day 3`, per-litter remaining treatments strip (`teeth · tail · castrate · tag/weigh`) |
| `components.html` §01c (`:1580-1590`, `:1468-1476`) | Filter sheet `Piglet processing · sheet`: `Treatments due today` chips (Drops · Teeth · Iron · Castrate · Tail · Tag / notch / weigh · Cord · Health) + `Day-age` chips (1 2 3 4 6 7 ≥8); `Show 14` |
| `ux/system/motion.html:674` | Motion table: Piglet processing · some treatments → A · advance, "remaining-treatment tokens shrink" |
| `ux/system/workflows/place.html:185` | Numpad kit "per-piglet tag" cited |
| `ux/model/unified-task-list.md:31` | 仔猪处理 row: age-day schedule 1/2/3/5/7; unit pen/litter; checklist + tag/notch/weight sub-form; per-day submit |
| `ux/model/product-model.html:130-133,176,203` | Piglet verbs: Foster (single), Piglet treatments (bulk, task only), Piglet tag/weigh (conveyor, own screen); 流产 in processing flagged |
| `ux/model/consolidation-plan.html:85,135,159,231` | Composite container; farrowing opens piglet processing; two weight variants; identity model blocks processing |
| `ux/design-system/tokens.json:54` | `count-surface` "hero count area in the piglet count sheet" |
| `ux/design-system/DOCTOR.md:22-23` | Missing Stepper / Measure / Numpad cards "block the pilot" |

### 1d · Archived mocks (`ux/archive/task-screens-combined.html`) — static, pre-Astra

The PRD §4 anchors (`ux/task-screens.html` 01–04b) no longer exist at that path; the content lives here.

| Anchor (section · line) | Slide |
|---|---|
| 01 Task lists · `:627` | `Piglet processing` room: header `Last record 08:40 · G. Hansen`, `Unit 7 · 90 % on time · target ≥ 90% · Task overview ›`, `100 / 200 pens · day 3 window`, lens `Due today 60 · Done 100 · All 200`, pen groups with litter rows (`000221 · 12 piglets · day 3` / `teeth · tail · castrate · tag/weigh`; `All done · 9 piglets ✎`), dock `B1 · Scan ear tag` |
| 01 · `:644` | Same, selecting: bar `✕ 2 selected · Mark treatments…` |
| 01c Filter · `:838` | Filter sheet (as components.html §01c) |
| 02 Pen picker · `:923`; 02c Peek · `:990` | as components.html |
| 03 Task detail · `:1243` | Progress `100 / 200 pens`, KPI `90 % on time`, Configuration (`Day 1 cord · drops`, `Day 3 teeth · tail · iron · castrate`, `Day 5 tag / notch / weigh`, `Day 7 health`), `SOP ›`, `End task` |
| 04b · `:1571` | Tag / weigh pad inside the litter record: `Piglet 5 of 12 · tag 001238`, `Weight 1.42 kg`, running list, numpad, `Done · Next piglet`, "tag auto-increments · scan overrides" |
| 04b · `:1589` | Bulk treatments sheet: `B1 · 2 litters · 000221 · 000228 · day 3`, checklist `Teeth clipping · Tail docking · Castration · Iron done Jul 6 · G.H` |

---

## 2 · Production screens (Figma)

Descriptions come only from PRD §1 (`ux/research/tasks/piglet-processing.html:31-87`), §2 (`:89-127`) and
§6 (`:229-239`). The PRD describes the **old UI section 634:16579** only. The **new 08/26 section 8003:11059**
repeats the old layout at a fixed +6139 px x-offset; matching frames below are paired by name and
position. New-only frames have **no PRD description**.

### 2a · Frame table (old id → new id)

| Old id | New id | Frame name | Purpose / fields & controls (PRD §1) |
|---|---|---|---|
| 634:16707 | 8003:13354 | Tab：仔猪处理（猪只List） | Room list. Header + tabs 仔猪处理 · 任务详情. Unit progress card (barn · day 1/3 · `100/200 栏` · 50%). Search (ear tag / notch) · funnel · list/grid toggle. Info banner "200 pens · mark each pen's items". Pen-grouped litter rows: sow tag · status (下次处理：3天后 / 需处理 / 已完成所有处理) · treatment icon strip · `20 头仔猪 \| 日龄 3 天` · arrow. Pens with no task listed (A4 无仔猪处理任务). Scan FAB |
| 634:17948 | (8003:13759 "Grid", unmatched by position) | Tab：仔猪处理（栏位Grid） | Card per pen: pen chip · age (7.5 天日龄) · status (距下次处理 3 天 / 待处理 / 已完成所有处理) · icon strip (8+ incl. Kg, tag, notch) · litter tag. Single- vs multi-pig card templates |
| 634:17024 | (8003:13705 "任务概览", unmatched by position) | Tab：任务详情 | Total progress (5 units · day 1/3 · 100/200 pens), KPI 仔猪处理准时率 `90%（目标 ≥90%）`, config table (8 treatments × age-day: 滴鼻 drops · 剪牙 teeth · 补铁 iron · 阉割 castrate · 断尾 tail · 耳缺/耳标/体重 tag/notch/weigh · 断脐带 cord · 保健 health), SOP link, 状态说明 legend (3 entries), red 结束任务 button |
| 827:12672 | (8003:13885 "筛选", unmatched by position) | 筛选 | Full-screen filter: 状态 全部/需处理/倒计时中/已完成 · today's due items (8 treatment chips) · 日龄 1/2/3/4/6/7/≥8 · row A/B/… ("栏位Grid has no row filter") · Reset/Confirm |
| 2495:5505 | 8003:11744 | 仔猪处理（无任务） | Litter page for a pen with no task: empty state 无仔猪处理任务 |
| 993:13532 | 8003:11569 | 仔猪处理 (750×2600) | **Litter checklist (core).** Header: pen chip A1 · sow tag · 母猪，650日龄，3胎. Tabs 仔猪处理 \| 仔猪信息. Five age-day accordions (1日龄 done-collapsed · 2日龄 done · 3日龄 needs-completion expanded with 计划 2025/05/03 处理 · 5日龄 · 7日龄). Items: checkbox unchecked/checked/done-grey + recorded-by & time (顾大华 2025/07/08 23:00). 耳标/耳缺/体重 = chevron sub-form, 已填写/未填写, labelled 提交后不可再查看. Day-5 items 可提前填. Footer `[⋯] [提交结果]` |
| 1630:7820 | 8003:11771 | 仔猪处理 (1624) | 仔猪信息 tab: 仔猪日龄 2 天 (derived) · 仔猪数量 `20 头（含 3 头寄养）` → count-confirm · 出生整窝体重 无 → weight sheet, amber warning about growth-efficiency |
| 1567:20878 | 8003:12030 | 更多功能 | More sheet from [⋯]: 寄养仔猪 foster · 上报死亡 report death · 数量异常 count anomaly · 母猪流产 sow abortion |
| 963:14499 | 8003:11835 | 仔猪列表（未录入身份信息） | Piglet list before identity: 共 20 头仔猪 · identity not yet filled |
| 971:15924 | 8003:11846 | 仔猪列表（已录入身份信息） | Read-only table tag · notch · sex · weight ("-" gaps); red banner 3 头仔猪未补充身份，请及时补录; footer 仔猪总体重（3日龄）19.5kg |
| 963:14753 | 8003:12013 | 出生整窝体重 | Bottom sheet from 仔猪信息: 出生整窝体重 kg input · cancel/confirm |
| 1000:5357 | 8003:12183 | 耳标/耳缺/体重（初始态） | Entry form: litter block (仔猪总体重 kg, amber if empty; 公猪数量/母猪数量 steppers), 有身份仔猪 section with 扫描耳标 · 选择耳缺 · 手动添加. Foster warning (fostered-in pigs without identity → identity may be inaccurate). Submit disabled until content |
| 635:3533 | 8003:12056 | 耳标/耳缺/体重（编辑态） | Rows: 耳标号 · 耳缺号 (picker) · 性别 · 体重 kg · delete; red invalid-row state; submit counts heads 提交（9 头仔猪）; any subset of the litter |
| 1135:7641 | 8003:12272 | 仔猪数量确认-数量无误 | Count confirm, match: 上报数量 20 vs 系统记录数量 20 |
| 971:15991 | 8003:12242 | 仔猪数量确认-少上报猪 | Under-report 18 vs 20 → 将自动移除 2 头仔猪; red "reported count prevails"; 数量不符原因 textarea; 确认无误，继续提交 checkbox gates submit |
| 971:16140 | 8003:12317 | 仔猪数量确认-多上报猪 | Over-report 22 vs 20 → auto-add; same reason + checkbox |
| 1159:6421 | 8003:12293 | 补录仔猪 | Dialog from 数量异常: reported vs system + 确认更新系统记录数量 checkbox |
| 928:5219 | — (absent in new) | 结束任务 (old dialogs) | Three variants: target not reached ("100 个栏位未完成…没有完成的处理后期将无法补充" — cannot backfill), target reached, cannot end. Block: farrowing task of the batch must end first |
| 4763:4382 · 4763:4323 · 4763:4311 | 8003:12418 · 8003:12359 · 8003:12348 | 结束任务 ×3 (pages) | Consequences page: status card (amber 100/200 · 50% or green 200/200), 执行详情 totals (processed pens + heads 1,231 · unprocessed pens + heads · sows 100 · total 2,562 头), 我已知晓 checkbox gates red button. Third repeats the farrowing-block dialog |
| 5913:9932 | 8003:11060 | Tab：猪只列表 (ended) | Read-only review list: segmented 全部完成(80) / 部分完成(0) / 未完成(0), location chip 1区-母猪车间-1单元, summary + stacked bar; row = pen chip · litter tag · recorded-by · date |
| 5752:7186 | 8003:12532 | Tab：任务详情 (ended) | 已结束 badge, final 190/200 (95%), KPI 90%, config, SOP; no end button |
| 5752:7145 | 8003:12485 | 筛选（默认状态）(ended) | 最后一次处理日期 date picker · completed-items chips · unit chips |
| 5788:6097 · 5791:5779 · 5791:5843 | 8003:11685 · 8003:12627 · 8003:12684 | 仔猪处理详情 ×2 · 仔猪列表 (ended) | Frozen litter record: day accordions with ✓ done / ! not-done per item, attributions kept; info tab without edit; piglet list without the supplement banner |
| 5788:5918 · 5788:5913 | 8003:12481 · 8003:12477 | 模块标题 | Cluster titles (in-progress / ended) |
| — | 8004:14216 | 选择数据+筛选 (new only) | **Not described in PRD** (name: "select data + filter") |
| — | 8003:13705 | 任务概览 (new only) | **Not described in PRD** (name: "task overview") |
| — | 8003:13885 | 筛选 (new only) | **Not described in PRD** |
| — | 8003:13759 | Grid (new only) | **Not described in PRD** |
| — | 8003:13939 | 仔猪处理 (new only, 750×1700) | **Not described in PRD** |
| — | 8043:20032 | image 10 (852×886, under 8003:13939) | **Not described in PRD** (an embedded image) |

### 2b · Flow arrows (from `figma-inventory.md`)

| Arrow id (old / new) | Label → target | Where it sits | Reading |
|---|---|---|---|
| 1000:15248 / — | button → 结束任务 | x 3088–3324, y 3660 | From the 任务详情 tab's 结束任务 button (634:17024) to the old end dialogs 928:5219 |
| 5788:6334 / 8003:12626 | arrow_forward_ios → 仔猪处理 | spans x 15226–17424, y 1636 | Ended list / detail row → ended litter record (5788:6097) |
| 5791:5927 / 8003:12732 | text → 仔猪处理详情 | x 18026–18374, y 939 | Ended litter record → its second state (5791:5779), tab/text tap |
| 5791:5928 / 8003:12733 | arrow-right-s-line → 仔猪列表 | x 19048–19324, y 1442 | Ended litter record chevron → ended piglet list (5791:5843) |

In-progress navigation has no drawn arrows; PRD text states the routes: litter row → 仔猪处理 (993:13532);
[⋯] → 更多功能 (1567:20878); 仔猪数量 → count confirm (1135:7641 / 971:15991 / 971:16140); 数量异常 → 补录
(1159:6421); 出生整窝体重 → sheet (963:14753); 耳标/耳缺/体重 chevron → entry form (1000:5357 → 635:3533);
提交结果 → toast → barn list (note 971:15884).

### 2c · Annotation notes

| Node | Verbatim (Chinese) | English gloss |
|---|---|---|
| 971:15884 (note, under 993:13532) | ⬆️ 点击提交结果：Toast提示操作成功 返回至：本舍的仔猪处理页面 console配置的仔猪处理任务，非必须完成，不完成也可以结束任务 | Tap Submit results: toast "operation succeeded", return to this barn's piglet-processing page. The console-configured processing task is not mandatory; it can be ended without being completed |
| 871:12487 (text) | not quoted verbatim in PRD | PRD: done = grey with corner ✓, due today = green, not-yet = other colour |
| 1815:5163 (text) | not quoted verbatim in PRD | PRD: a treatment's icon appears on the day it is due |
| 5913:10060 / 8003:12734 (text) | not quoted verbatim in PRD | PRD: the 未完成 row style = row without attribution stamp |
| 2519:9347 (text) | not quoted verbatim in PRD | PRD: "when piglet processing and postpartum check run at the same time, do the two tasks need a jump-to-the-other-task entry point?" |
| In-frame labels (993:13532, 971:15924, 928:5219) | 提交后不可再查看 · 可提前填 · 3 头仔猪未补充身份，请及时补录 · 100 个栏位未完成…没有完成的处理后期将无法补充 | cannot view again after submit · can be filled early · 3 piglets missing identity, please backfill · 100 pens unfinished… unfinished processing cannot be backfilled later |

The new section (8003:11059) contains no note/annotation node for 971:15884, 871:12487, 1815:5163 or 2519:9347.

### 2d · Requirements (PRD §2) and open questions (PRD §6)

| Data captured | Type |
|---|---|
| Treatment done per litter × age-day × treatment (7 bulk: drops · teeth · iron · castrate · tail · cord · health) | bool + recorded-by + timestamp |
| Litter total weight at weigh day (仔猪总体重) | decimal kg |
| Litter sex counts (公猪/母猪数量) | int + int |
| Per-piglet identity row: tag (scan/manual) · notch (picker) · sex · weight | per row, any subset, never bulk |
| Birth whole-litter weight backfill (出生整窝体重) | decimal kg |
| Observed litter count (上报仔猪数量) + mismatch reason + confirmation | int, text + bool |
| Litter events: foster · death · count anomaly | entry points only |
| End-task acknowledgement | bool + actor |

Derived (never asked): age-day, planned dates, countdown; litter status and remaining set; pen/unit/task
progress and 全部/部分/未完成 classes; 准时率; system count incl. fostered and unidentified; end-task totals.
Console config: schedule (treatment × age-day), KPI target, mandatory flag, SOP, dependency "end farrowing first".

Open questions (PRD §6, `:233-238`): (1) is 提交后不可再查看 a compliance rule; (2) non-mandatory task —
do unfinished litters stay overdue or expire at weaning; (3) should count-mismatch removal require a cause
(death vs count error); (4) postpartum/processing cross-task jump; (5) day-age filter 1/2/3/4/6/7/≥8 vs
schedule 1/2/3/5/7 — config-driven?; (6) fostered-in piglets without identity — allow flagged rows or block.

### 2e · Prior proposal (not requirements) — PRD §3–§5 (`:129-227`)

| Proposal | Summary |
|---|---|
| §3 Cuts | Age-day accordions + 提交结果 + toast; treatment icon strip; dual List/Grid; status legend; info banner; 状态/排 filter dims; 提交后不可再查看; 母猪流产 in more-sheet |
| §3 Merges | 倒计时中 into lenses; 已填写/未填写 into `tag/weigh · 9 of 20`; 4 count dialogs into one step; sex steppers derived from rows when complete; 仔猪信息 tab into record header; scan FAB into dock; ended fork into same screens read-only |
| §3 Keeps | Attribution stamps; early pre-fill; birth-weight backfill line; end-task consequences ceremony; on-time KPI; no-task pens dimmed in All |
| §4 Flow | Room (header, lens, pen-grouped rows with remaining treatments) → bulk tick → `Mark treatments…` sheet; row tap → litter record (schedule strip, tag/weigh pad, litter facts, ⋯ foster/death); scan piglet tag → litter; task detail sheet → End task consequences |
| §4 Deltas | 1 schedule strip · 2 pad gains notch + sex · 3 litter facts block (count verify, total weight, birth-weight backfill) · 4 litter overflow ⋯ · 5 end-task consequences page |
| §5 | Field → new location → production-origin map |

---

## 3 · The reference task — farrowing (signed off)

Interactive prototype: `ux/system/farrowing-astra-concept.html` (shell) + `farrowing-astra-concept.js` (all views).
Contract: `ux/system/farrowing-contract.html` (C1–C11). Rulings: `ux/research/farrowing/RULINGS.md` (outranks both).

| Pattern | Where (file · anchor) | What to match | Likely reuse for processing |
|---|---|---|---|
| Home → task routing | `home-astra-prototype.js:226-240` `openDesigned()` | Card opens designed file with `unit`/`overview` entry | Replacing the placeholder route |
| Task overview / header | `farrowing-astra-concept.js:213` `taskOverview()`, `:227` `roomHome()`; `astra-task-overview.js`; `astra-task-header.css`; archive 01 header | Unit KPI + progress + `Task overview ›` | Header (90% on time, 100/200 pens) |
| Room list (crate rows, lens) | `:217` `roomRow()`, `:218` `room()`; views `room`, `roomGrid`, `roomSearch`, `roomScan`; contract C5 5.7 recency; RULINGS "Names and glyphs" | Pen-grouped rows, lens `Awaiting · Active · Done · All`, Go to pen, Scan ear tag | Litter rows, lens, dock |
| Filters | `:311` `roomOverlay()` view `roomFilter` ("Filter sows": Expected farrowing range, Previous litters); `:167-171`; `ux/research/farrowing/ASTRA-FARROWING-FILTERS.md` | Filter sheet with live count | Treatments-due + day-age filter |
| Pen detail / picker | views `roomPenDetail`, `roomPenLog`, `roomPenFeed`, `roomPicker` (`:236-264`) | Pen page, log | Pen context |
| Record sheet (count) | `:363` `count()`, `:361` `receipt()`; contract C4 faces, C5 5.0–5.2 | sh2 identity header, hero stepper `− n +`, receipt `Saved · +4 this visit`, reserved hint line | Litter record shell, count row |
| Dead drawer | `:377` `death()`; contract C5 5.3; RULINGS "Surfaces & entrances", "Sow dies mid-farrowing" | One drawer product-wide, `Back · Save`, `Clear`, Photos field, roster mode past untagged remainder | Piglet death from the litter record (vs. the separate `pigletDeathPage`) |
| Edit (correction) | `:379` `edit()`, `:384` `editFinish()`; contract 5.4 | One screen, amber banner, change summary | Correcting treatment marks / counts |
| Finish / lock | `:364` `finish()`, `:372` `locked()`; contract 5.5 | Steppers commit per tap, hold-to-commit | Pattern for irreversible acts |
| History / record page | `:390` `history()`; contract 5.6, C4 "Farrowing record (page)"; Log card | Netted ledger, day headers, stamps | Litter record history |
| Sow page + action sheet | `:401` `profile()` (inspection iframe), `:403` catalogue, `inspection-astra-concept.js:721-795` | Grouped production actions | Current processing entries |
| End task / receipt | `:291` `taskEndSheet()`, `:115` `closeTask()`, `:104` `taskClosureReview()`, views `roomEndTask`, `roomTaskReceipt`, `roomTaskSows`; `:271-288` performance/outcomes/death review; contract C9; `ux/research/farrowing/ASTRA-TASK-CLOSURE.md` | `Complete task` / `End task early`, `Task completed` / `Task ended early`, `Back to Today` | Consequences page + completion receipt |
| Page vs drawer policy | `astra-surfaces.js` `isPage()`/`present()`; `ux/research/farrowing/ASTRA-PAGES-AND-DRAWERS.md` | which views are pages | Classifying new views |

Rulings that bear directly (RULINGS.md): one stepper shape `− n +` (60px rows); type-to-set retired on counts,
pads only for ear tags and weights; staged drawers `Back · Save` + `Clear`, recording surfaces commit per tap;
three button registers + text action; "words carry actions, icons carry objects"; "no toasts; no submit
buttons"; relative dates within a week; **fostering parked**.

---

## 4 · Design-system cards (`ux/design-system/components/`)

| Card | One line |
|---|---|
| Button | CSS footer/bar actions; `primary` ink fill, one per bar on the right |
| CategoryFooter | Actions-page footer: Back left, category tabs right |
| ChoiceList | One chooser row shape (flat/sectioned/nested) — the Multi-picker card |
| Cover | preview only, no README |
| Facts | Label–value grid in a panel; reading half of a detail page |
| Heading | Title line with optional icon, description, meta, text action |
| Icon | `SentriIcons` glyph registry (open strokes, 24px grid) |
| IconButton | Square icon-only tool (filter, search, scan, more) with optional badge |
| Log | Grouped history thread, newest first |
| Panel | The one bordered, unshadowed container |
| PickerField | Field-shaped trigger opening a picker sheet; replaces `<select>` |
| Row | Icon tile · title over description · trailing slot; `rowGroup` |
| Segment | Lens control — filters, never acts |
| Sheet | Drawer (four heights) vs page presentation contract |

### README laws bearing on this task (`ux/design-system/README.md`)

| Law | Text (summarised) |
|---|---|
| Verbs | "Verbs on buttons, states in segments"; buttons name act + count ("Record for 12 pigs") |
| No Submit/Save/Complete | "Never 'Submit', 'Save' or 'Complete'. Every action commits itself" — note: farrowing drawers (`Back · Save`, RULINGS) and the current processing pages (`Save care updates`, `Save identity`, …) use Save |
| Count law | "The count leads the word, and only from 2"; units always written (`1.42 kg`); deltas `11 → 8` |
| Time | Open rows relative; done rows/records stamped `Jul 8 · 07:14 · G.H` |
| Missing ≠ zero | Empty sections absent; picker reads "Select" |
| Record sheet fields | Only Choice · Scale · Stepper · Measure · Checklist · Numpad · Picker · Multi-picker · Note · Photos; stacked in capture order; bar ≤ 2 actions |
| Containers | Drawer (~5 fields) · page form · conveyor (per-confirm commit, Skip) · roster · composite · session · pairing |
| Row | Two lines; line 2 mono `time → counts → codes`; one chip max; rail empty / verdict › / ✎ |
| Segments | Working pile first, finished second, All last; ≤ 4 |
| States | Prefer omission to disabled; done rows differ by ✓, stamp, ✎ |
| Motion | Commit at 0 ms; rows hold 800 ms then depart |

### Field types named by the README with no card

| Field type | Card? | Where it is rendered today |
|---|---|---|
| Choice | none | components.html §04 |
| Scale | none | components.html §04 |
| **Stepper** | none | farrowing hero/drawer steppers (`count()`, `death()`); processing `.feature-stepper` |
| **Measure** | none | components.html §04; processing weight is a plain text input |
| **Checklist** | none | components.html §04 (`Teeth clipping`, `Castration done Jul 6 · G.H`); archive 04b |
| **Numpad** | none | components.html §04; archive 04b tag/weigh pad |
| Note | none | processing `countReconcile` textarea via `SentriUI.field` |
| Photos | none | farrowing dead drawer; `pigletDeathPage` |
| Picker | PickerField | — |
| Multi-picker | ChoiceList | — |

Also without a card (DOCTOR.md §1): `field` (text field), `chooserList`, task header, task context card,
verb sheet, dialog, receipt/toast.
