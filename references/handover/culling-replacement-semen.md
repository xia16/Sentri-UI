# Culling, replacement and semen (淘汰 / 留种 / 精液)

Extracted from the Dahua handover (`C:\Users\ying_\Documents\Sentri-Dahua-Handover\Sentri-Dhua`, a Chinese pig-farm SaaS: web Console plus Mobile app). All paths below are relative to that root. Dates come from changelog headers and `git log` of `Vaccine/` (last commit 2026-08-14); `prds/semen/` and the test reports are untracked, so their dates are file dates.

- **Culling (淘汰)** is the decision to remove a production sow from the herd. The Console sets a soft target and a "suggested" list ahead of a batch, the Mobile weaning check reviews each sow, and the Console then confirms. It is deliberately not its own task; selling or moving the sow afterwards is another module.
- **Replacement / keep for breeding (后备留种, 留种)** is choosing which piglets from which litters become breeders. The Console sets a reference number and points at "focus" sows; Mobile (留种中心, a resident centre) and Console then maintain one shared list of ear-tagged piglets, scored by a rules engine.
- **Semen (精液管理)** is Console-only in the handover: collection, QC, dilution, packing, inventory, picking for breeding, plus design notes for matching a boar to an in-heat sow.
- **Source of truth:** `Vaccine/prds/culling&replacement/` files 00 to 05, newest changelogs, and the `仔猪留种评分规则-修订版-2026-08-06/` folder. For sow scoring, the 2026-08-13 changelog `修改日志-2026-08-13-母猪淘汰评分规则V1.3.md` is the only trace of V1.3, whose rule files live outside the handover. For semen, `Vaccine/prds/semen/00-Console精液管理-PRD.md` plus `Vaccine/docs/semen/zh-精液模块文档/`.
- **Sale** exists only as an April brainstorm (`brainstorm/&&sale.md`); nothing was built.

---

## Current flow

### 1. Culling (淘汰)

Sources: `Vaccine/prds/culling&replacement/00-…总览.md`, `01-console-母猪淘汰计划.md`, `03-mobile-淘汰复核.md`, `05-console-淘汰&留种计划编辑与生效规则补充说明.md`, changelog `修改日志-2026-06-18-淘汰留种导航调整.md`, scoring: `修改日志-2026-08-13-母猪淘汰评分规则V1.3.md`, `Sentri母猪淘汰评分计算说明-V1.2.md`.

**Label ladder (keep these straight; the PRDs use them loosely):**

| Label | Meaning | Set by |
|---|---|---|
| 建议淘汰 (suggested) | Plan tag: "look at this sow". Not a result. | Console plan (manual pick) |
| 需淘汰 (needs culling) | Field-confirmed "yes, cull" | Mobile review |
| 确认淘汰 (confirmed) | Decision confirmed on the Console 淘汰猪只 page | Console |
| 已淘汰 (culled) | Sow has actually left (sold, moved, died); other modules' job | Downstream |

**Console, plan (before the batch)**

1. Sidebar 淘汰&留种 (culling and retention) has three items since 2026-06-18: 母猪淘汰&后备留种 (plan), 任务详情, 批次详情. The plan page holds two cards: culling plan and 后备留种 plan.
2. Switch on the 母猪淘汰计划 toggle. Switching it off hides the config and stops new tags, but the target and list are kept; switching on again restores them and still needs a re-save.
3. Choose target mode 百分比 (percent) or 头数 (head count), type a value; the page always shows both the typed value and the converted planned head count.
4. 指定淘汰母猪 opens a modal listing batch sows with ear tag, parity, avg litter size, avg born alive, teat count, return-to-heat count, disease tags; key columns sort, abnormal values go red; the outer button shows "已选 N 头". A sow that left before saving cannot be added.
5. Save: any change to toggle, target or list is a "formal change". The button becomes 保存并执行 (save and execute); a double-check modal lists what changes (plan on/off, target mode/value/planned count, picked sow counts, which not-yet-started tasks are affected); 确认修改 makes it live (doc 05).
6. Locking: editable until the linked task starts; after that the whole block is read-only with "关联任务已开始执行，当前计划已锁定，不可再修改。". Tasks that have not started read the new version; started tasks do not change. Unsaved edits trigger a leave guard (继续编辑 / 放弃修改).
7. Rules: the target is soft (never blocks ending a task); a sow may carry both 建议淘汰 and 重点留种来源 with no auto-resolution; target 0 with a manual list is allowed (attention only).

**Mobile, review (during weaning check, also postpartum check and inspection per doc 03)**

1. The weaning-check list groups sows by stall. Tags: 建议淘汰, 需淘汰, 已淘汰 (different colours for the last two). Each card shows the 淘汰评分. The shared sort sheet offers 按淘汰评分升序 / 降序 (and 留种评分, see Replacement); only stall order changes.
2. Tap a sow to open the 母猪状态 editor. A banner above 体况评分 shows 建议淘汰/计划淘汰, 淘汰评分 ("暂无评分" if none) and 淘汰排名 ("排名待生成" if none).
3. Choose 建议淘汰 or 不建议淘汰 (only two options). If the sow carried the Console tag and the user picks 不建议淘汰, a modal forces a reason; cancelling reverts to 建议淘汰.
4. The review is part of the single per-sow submit, not a separate submission. Network failure keeps the typed content.
5. Progress card: if a plan is enabled, 已检查/需检查 plus an extra 已淘汰/目标淘汰 row (the number really means "confirmed as needing culling"). A planned 0 still shows "0 / 0". The end-task page repeats it; whether a shortfall blocks ending is per-task rule, but the gap must be stated. 结束任务 is a red outline button.

**Console, result and confirmation (after the task)**

1. Task detail's 任务信息 card has 淘汰进度 (确认淘汰 / 目标淘汰) with a 查看 icon (hover explains the number). If the task has ended and suggestions are still unresolved, a speech-bubble next to the icon says 发现 N 头建议淘汰母猪待确认 / 查看并完成淘汰决策 (not clickable; hidden at 0 or without permission).
2. 淘汰猪只 page: one table, two tabs 建议淘汰 N 头 and 确认淘汰 N 头, search by sow ID, hint under the search box ("请勾选需要确认淘汰的猪只…"), footer "上次更新 · 断奶检查任务 · time", 10 rows per page. Columns: sow ID, location, 淘汰指数, parity, avg litter, teats, avg born alive, return-to-heat, disease tags, operator/time. No progress bar, no stat cards, no sale/transfer/death status.
3. Tick sows in 建议淘汰 and press 确认淘汰; they move to the other tab. Rejected suggestions keep their reasons for review.

**Scoring behind the number (summary only)**

- V1.3 (2026-08-13, current): score per batch at the weaning/postpartum point; six dimensions, 19 indicators, indicator score 0 to 5; no fixed tiers, batch ranking only; "economic cull priority", not welfare urgency. Missing data still scores: not-applicable and rule-unavailable items are dropped, individual gaps are filled from the farm's historical median; weight is shown in four parts (own data / filled / not applicable / not enabled). Hard gates were removed; one "cull red line" remains (uterine prolapse, or re-prolapse after reset). Sows below 60% data completeness never enter an auto Top N. Return-to-heat count kept, 历史难产 field removed from Console and Mobile lists.
- V1.2 (superseded): three weighted angles (reproduction, health, lifecycle), indicator risk 0 to 100, hard gates (severe mastitis, lame) forcing 100 and 优先淘汰, otherwise 优先淘汰 at 90 to 100.
- `Culling_Suggestion_Engine_中文.md` is a wider concept spec (hard gate, weighted signals, economic damping, tiers, stage-3 economics). It calls itself the only authoritative source and "dev-ready", but later rule docs replaced its scoring.

**Prototype status (what was really built):** plan page, task/batch detail, 淘汰猪只 page with tabs, weaning-check review and the 淘汰评分 sort are built. Not built: 保存并执行 / lock states (doc 05), the mandatory "why not cull" reason modal (`cullRejectReason` exists in `MobileWeaningCheckFlow.tsx` but nothing prompts for it). Built but not specified in any PRD: a Mobile 淘汰中心 (Home entry 淘汰任务 and Toolbox) with batch dashboard (progress percent), sow list, filters 全部/建议淘汰/已标记淘汰/未标记 and batch 标记淘汰/取消淘汰 (`src/components/culling/MobileCullingCenterPage.tsx`).

### 2. Replacement: keep for breeding (后备留种 / 留种)

Sources: `00-…总览.md`, `02-console-后备留种计划.md`, `04-mobile-留种标记.md`, `05-…补充说明.md`, changelogs `2026-07-23-Mobile留种中心`, `2026-07-27-Mobile首页留种任务与房间母猪流程`, `2026-07-28-Console-Mobile共享留种名单`, `2026-07-28-Mobile留种补耳标与选择解耦`, `2026-08-06-*`.

**Model in one paragraph:** keeping is a continuous decision across the batch, not a task step. Both ends work on one shared list of the batch's ear-tagged piglets; "已留种 / 未留种" is a single current state either end can set or revoke. There is no candidate-then-approve step. Piglets without a tag exist only on Mobile.

**Console, plan**

1. Same plan page, second card 后备留种计划 with a toggle. Reference number is head count only (no percent) and is explicitly "储备参考" (a planning reference, not a goal, completion rate, cap or submit gate).
2. 指定留种母猪: modal like the culling one, picks sows (not piglets) whose offspring deserve attention; button shows "已选 N 头". These sows get a 重点留种来源 tag on Mobile.
3. Same 保存并执行 / lock rules as culling (doc 05).

**Mobile, 留种中心 (resident module)**

1. Entry: Home has fixed 留种任务 and 淘汰任务 cards; Toolbox keeps a secondary entry (grouped by business category since 2026-07-23). Reminders from 结束保育, 结束育肥 and 留种 tasks show "建议进行留种 / 已留种 X / 待确认 X" and 立即处理 opens the batch directly (no batch picker, no selection inside the task).
2. Batch dashboard: search by batch number or line; card shows batch number, "line · batch name · day-age", 已留种 (primary), 待确认 (= current 候选), lifecycle status 进行中 / 已完成 / 待开始. No expected count, remaining, percent or progress bar.
3. Batch detail: sticky summary (已留种, 待确认, last update). Tabs 母猪待选 and 已留种. Room chips, search by sow tag, room, breed. Sows listed by room, sorted by sow score; each card shows tag, parity, breed, sow score, PSY, avg weaning weight, litter size, kept count, selectable count; only action 留种.
4. 留种 on a sow opens a full-screen selection page for her litter (mother summary pinned; question-mark opens a 82% scoring-explanation sheet). Piglet cards sorted by score: checkbox + tag/sex icon, score and change vs previous node (arrow plus number, no sparkline), data state/health-structure state, day-age/weaning weight/ADG, up to two reasons. 8px gaps and borders; selection is blue, green means kept/normal, orange attention, red abnormal/blocked.
5. Only 候选 or 未评估 piglets with a complete record can be ticked; 已留种 and 已淘汰 never appear. 全选可留种 X 头 counts only complete records and notes "Y 头身份待补充".
6. Missing tag or incomplete record: checkbox disabled, card grey, text 补耳标 or 完善档案. Tapping that card opens a single-pig 补充身份 page headed by room, source sow and RFID plus sex, day-age, weaning weight, score ("check these against the pig in front of you, then enter the tag you just applied"). Required: tag, ear notch, sex, breed; optional sire/dam ID. Tag and notch must each be unique. Saving only updates that pig, keeps its status, returns to the same list position, selects nothing, clears nothing. Closing discards. A saved unique tag makes the pig appear in the Console list at once.
7. Bottom bar shows one dynamic "本次已选 X 头" and 完成留种. Closing with a selection asks 放弃本次选择？. On success: toast "已完成留种 X 头。", counts and the 已留种 list update. Backend revalidates; failure keeps the selection and shows no success.
8. 已留种 view: one bordered card per pig (tag, sex icon, 已留种; score area; two-column day-age/weaning weight/ADG/breed; reasons; 取消留种). Cancel needs a confirm, returns the pig to 候选, keeps tag and record, and is not culling.
9. Single-pig detail page (not a modal): identity facts, health, structure review, reason, notes; editable breeding identity (后备母猪 / 种公 / 其它), status, health, structure, notes; fixed 保存. Growth dossier (score basis, trend) opens from the card's detail icon.

**Console, 留种仔猪 page (from task detail, 留种数量 field with 查看 icon)**

1. Title 留种仔猪 with compact counts 已打耳标 / 已留种 / 未留种 / 批次活仔. One table of all ear-tagged piglets, no status tabs, boars and gilts mixed (sex icon beside the tag, no sex column). Untagged pigs never appear (no temp IDs or RFID).
2. Mother Group Table: a white summary header per sow (status bar, tag, litter value or "优秀母系 / 普通母系 / 关注母系" badge, health, parity, breed, PSY, avg weaning weight; right side "本次选择 X / 当前窝已打耳标数" and "已留种 X 头"), default expanded and remembered locally; no header checkbox; groups ordered by the highest piglet score. 25 piglets per page, continuing the header across pages.
3. Piglet row: tag (with 已留种 chip), 综合评分 with trend, 日龄/断奶重, ADG, structure review (通过/待复核/异常), health, 留种标记人&时间 (only for currently kept pigs, last "mark" action), fixed action column. Recommendation label rule: only `NORMAL` pigs in the top 10% of the same batch and sex show 推荐; DEGRADED 需复核; INSUFFICIENT_DATA/NO_DATA 数据不足; REJECTED 不推荐. No recommendation-reason column, rank column or approval columns.
4. Score drawer (click the number): 评分依据 and 变化趋势. Trend uses five fixed nodes (birth, 7, 14, 21 days, current), equal weight average, y axis fixed 0 to 100; missing node shows 数据不足 with count; fewer than two nodes shows 暂无趋势; every snapshot keeps the rule version.
5. Selection: one batch selection holds only one state (the other state's checkboxes grey out). Bottom bar appears only when something is ticked and shows count, number of litters and one button, 标记留种 or 取消留种. Cancel keeps the pig's record. Both ends write the same record; the last successful server write wins; the loser rolls back and is told to reload.
6. Sync: Mobile saves a unique tag, Console gains the row; Mobile edits weight/structure/health, same Console row updates (no duplicates, keeper stamp not overwritten); mark or cancel on either side shows on the other.

**Scoring behind the piglet number (summary only)**

- Rules live in `仔猪留种评分规则-修订版-2026-08-06/` (release candidate `V1.8-rc.20260806.7`, backend contract `BACKEND-CONTRACT-1.0-rc.7`). Three production states: 哺乳期 (shared score for the source litter, shown on the sow header), 保育期 and 育肥期 (per ear-tagged piglet, compared within sex; boars and gilts have different weights and 育肥 structure items). Each stage restarts; earlier totals are not carried.
- Calculation: raw data to item score (100 / 70 / 40), times module weights (family background `B` = mother history `M` + sire's offspring `F_sire`; litter birth quality `Q`; weaning weight; ADG and FCR; backfat at 120 kg; health `H`; common structure `C`). Missing and invalid data are handled only by the rule `Sentri评分缺失数据处理规则-2026-08-04.md` (eight data classes, coverage, confidence, `missing_fields`, `calculation_status`). Red lines give score 0 and REJECTED; 12 to 13 teats is OBSERVE (not in the normal recommendation pool). Front ends show the server's score and never recompute.
- Open items are in `后端评审待确认问题清单-2026-08-06.md`.

**Prototype status:** Console plan page, 留种仔猪 shared-list table, Mobile 留种中心 and the Mobile home entries are built with mock data (batches B2401 to B2404). The weaning-check reminder card still shows 预计留种 / 目标留种 / 还剩 (old target logic), unlike PRD 04.

### 3. Semen (精液)

Sources: `Vaccine/prds/semen/00-Console精液管理-PRD.md` (+ 3 changelogs, 2026-08-17), `Vaccine/docs/semen/zh-精液模块文档/` (six design notes), test reports in `精液管理/测试报告/`, prototype `Vaccine/src/console-dev/features/semen-manage`.

**What the PRD actually is:** a migration instruction. The Console UI is a source-level copy of an existing `console-dev` module (MUI, Apollo, local mock data); Sentri only supplies sidebar entries, routes and demo data. Product logic is not redesigned.

**Console entries**

| Where | Items |
|---|---|
| Original home sidebar, group 精液 | 精液管理, 配种领用 (page title 出库), 采精历史, 出库记录, 精液历史, 精液设置 |
| Revamped home, 业务中心 > 精液 (since 2026-08-17) | 查看配种计划, 精液处理, 精液设置, 精液出库 (first version listed five: 精液管理, 配种领用, 出库记录, 精液历史, 精液设置) |

**Console, process (state machine)**

1. 添加采精 (boar, date, collector) creates a batch: 待质检.
2. 质检 (QC) passes to 待稀释; fail goes to 已废弃. The 废弃精液列表 opens one shared drawer from all three stages.
3. 稀释 (dilution, ratio and volume) then 分装入库 (packing, labels) gives 待入库, then 库存可用.
4. Inventory tab: add stock, detail, quantity adjust, move, discard, log drawer (collection, QC, dilution, inbound, adjust, move, discard, outbound).
5. 配种计划 view: today and next seven days as cards per breeding unit, with 精液充足 / 精液不足; its 出库 button enters the pick flow.
6. 配种领用 / 出库: step one pick breeding units (or 手动选择精液), step two system allocation check with quantity edit and sow detail, confirm outbound (manual mode checks duplicates/unavailable batches; barcode can be typed or scanned).
7. Settings: dilution defaults, QC thresholds, inventory settings, boar-unit supply relation, storage locations. Boar list tab holds collection status and the boar action menu.

**Matching design notes (docs/semen, English originals from `Downloads`, not yet reflected in the prototype)**

1. Batch planning (up to 7 days before the batch) only sets intent: on/off, batch purpose 肉猪生产 (terminal line) / 种猪扩繁 (sow line) / 混合 (split), manual breed allocation, and locked manual sow-to-boar pairs for sows already in the batch. It cannot finish matching because the sow set is incomplete.
2. Real matching starts per sow when the heat check marks her 发情; reservation of unreserved stock happens only after a boar is chosen (back end may run the whole batch once at the first heat).
3. Fallback (non-AI, deterministic) order: manual pair, then intent (plan purpose, else none), then filter (boar not 停产, matches line/unit, COI if pedigree exists, stock in window), then rank: full-course stock coverage, fewer health tags, lower COI, cooldown readiness, FEFO fit, fewer batch assignments, boar ID. COI ≤ 10% safe; above 10% still pairable but labelled 高 COI with the percentage and ranked lower. Result is tagged `deterministic_fallback`, never shown as AI.
4. Needed changes (doc 当前模块所需变更): a separate 配种规划 button on batch detail (editable until the breeding task starts); show match result per sow (matched or not, which boar, source manual / plan / fallback); breeding task pre-selects `boarId` (except when reservation fails and the user chose Ignore); manual boar choice by list or by scanning the straw code (Sentri code resolves; foreign code must be registered with boar ID, breed, source farm, expiry and writes a `manual_entry` log).
5. Inventory log types: created, lab_tested, diluted, reserved, picked, used, moved, adjusted, discarded, manual_entry, expired; columns Log Type / Time / User / Details; Details are readable text.

**Test findings (real environment `dev.sentri.cn`, not the prototype):** 2026-09-11 full-flow report SEMEN-BUG-001 to 032 (3 P0: expired stock still counted, QC "pass" below thresholds, QC dialog and settings disagree on morphology; 19 P1; 10 P2), verdict not ready; 2026-09-15 filter/pagination report SEMEN-BUG-033 to 036 (all P1, today's-plan filters and paging untrustworthy). The 09-11 report also lists nine product suggestions OPT-001 to 009 (no-skip state machine, split bought-in vs own-farm stock, per-metric QC verdicts, dilution safety, count-difference reasons, expiry grouping, unify history/log pages, unique plan-card labels, versioned settings).

### 4. Sale (销售 / 出库)

Only `brainstorm/&&sale.md` (English, 2026-04-15): "culling is a decision; sale/outbound is the execution". Proposed handling methods SALE, TRANSFER_OUT_OF_FARM, INTERNAL_TRANSFER, SLAUGHTER_OR_DISPOSAL, EUTHANASIA_OR_DEATH_HANDLING, PENDING_OUTBOUND (V1: sale, transfer out, pending). Console flow: finalize cull, choose handling, create a draft outbound task prefilled with sow IDs or link an existing active one (one active link per pig), planned date before next batch start counts as "scheduled release", only completion counts as "actual release". Outbound completed/cancelled/pig-removed events update the cull item and capacity forecast. Nothing in `Vaccine/src` or the PRDs implements it; the 2026-08-25 IA preview lists 猪只出场 (出场任务, 出场数据) under 猪群管理 as the nearest placeholder.

---

## Versions

| Date | Decision / change | Supersedes | Source |
|---|---|---|---|
| 2026-04-15 | Culling plan brainstorm: batch-level, % or head count, soft target (confirmed); culling flag only at final confirmation (proposed); sale/outbound brainstorm: cull is separate from execution | - | `brainstorm/culling_plan_brainstorm.md`, `brainstorm/&&sale.md` |
| 2026-04-16 | "Corrected understanding": 留种任务 means replenishing a batch from eligible gilts (补入, label 建议补入, score 30/25/20/15/10); culling task split into review task + handling task | Earlier reading of 留种 as piglet selection | `brainstorm/breeder_selection_task.md`, `brainstorm/culling task.md` |
| 2026-04-17 | First build of both: Mobile culling pages, culling task page, workflow data, Console replacement page | - | git `67a14d7` |
| 2026-04-22 | Task-based culling pages deleted; replaced by Console plan page + Mobile weaning-check flow with embedded review; first PRD "…淘汰计划&后备留种计划" | 04-17 build and the review/handling task split | git `cb590f4` |
| 2026-04-29 / 05-04 | Overview 00 created; PRDs split into 00 to 05 (plan, retention, Mobile review, Mobile marking, edit rules); six semen docs added | Old combined PRDs 01/02/03 | git `51ea9d3`, `c2a45cb` |
| 2026-06-02 | Batch detail and outcome detail pages added | - | git `5d54514` |
| 2026-06-18 | Task/batch detail become sidebar items; progress fields renamed 淘汰进度 / 留种进度; cull detail page: options A (titles with counts), B (top status strip), C (two lists) explored, C won, refined v1 to v3 (lighter weights), then merged into one table with 建议淘汰 / 确认淘汰 tabs | Top progress cards, 已淘汰 column | `修改日志-2026-06-18-淘汰留种导航调整.md`, `.superpowers/brainstorm/79275-1781766750/content/culling-detail-*.html` |
| 2026-07-01 | Retention becomes Mobile candidate + Console second approval, reverse selection (tick the ones not to keep) | Direct mark on Mobile | `修改日志-2026-07-01-留种二次审批.md` |
| 2026-07-02/03 | Console retention page simplified (no state tabs, filter by column), then positive selection 标记留种 (ticked ones are kept) | Reverse selection | `…07-02-Console留种页面简化`, `…07-03-Console留种列表字段合并` |
| 2026-07-23 | Retention leaves the tasks: Mobile 留种中心 as a Toolbox module, tasks become reminders; Toolbox becomes a category catalogue; Console list becomes Mother Group Table | Retention inside weaning/end-nursery/end-finishing tasks; Toolbox segment switch | `…07-23-Mobile留种中心`, `…07-23-工具箱分类入口`, `…07-23-Console留种母猪分组列表` |
| 2026-07-25 | Untagged piglets: collect tag, notch, sex, breed at keep time; batch submit is atomic | - | `…07-25-Mobile无耳标仔猪留种补录` |
| 2026-07-26 | Multi-perspective review of the retention prototype: 6 P0 gaps (object = gilts only or mixed, one data source, plan never saved, risk bypass, free revert, nested controls) | Triggers the following changes | `留种操作多视角评审-2026-07-26.md` |
| 2026-07-26/27 | Sow culling indicator document (HTML) cut to 11 leaf indicators, 6 weights summing to 100, strong cull needs two independent soft signals | First draft same day | `修改日志-2026-07-26/27-母猪…`, `母猪淘汰评分核心指标.html` |
| 2026-07-27 | Mobile Home gets fixed 留种任务 and 淘汰任务; flow becomes batch, room, sow, full-screen litter selection (drawer retired) | Toolbox as the only entry; sow header with expanded piglets | `…07-27-Mobile首页留种任务与房间母猪流程` |
| 2026-07-28 | Shared ear-tagged list: Mobile and Console both mark and cancel; second approval and candidate model dropped; progress, percent and targets removed; untagged tagging decoupled from keep (single pig, no auto select) | 07-01 approval, 07-25/27 atomic tag-and-keep, 07-23 percent/target summary | `…07-28-Console-Mobile共享留种名单`, `…留种结果同步`, `…留种补耳标与选择解耦`, `…留种状态摘要去完成度` |
| 2026-07-30/31 | Culling indicator reviews: 8 rounds (07-30, data-collection spec v1.7 accepted) and 5 rounds (07-31, 12-indicator core table "can be finalised"), three roles each | - | `淘汰指标评审记录/`, `核心指标评审记录/` |
| 2026-08-04/05 | Sow score V1.2 written (hard gates, 90+ 优先淘汰); gilt retention score rebuilt from zero as V0.1/V0.2 (gilts only, per-stage score, red lines notify only); piglet rule corrections (`FCR_F` 25%, 8 missing-data classes) | Old index-engine docs (deleted 08-13) | `Sentri母猪淘汰评分计算说明-V1.2.md`, `后备母猪留种评分*-V0.*.md`, `仔猪留种评分规则已确认修订/待确认项-2026-08-05.md` |
| 2026-08-06 | Piglet rules reworked through rc.1 to rc.7: qualification status separate from calculation status, `S_sib` (full-sibling history) removed so family background is `M` 70 + `F_sire` 30, lactation `F_sire` is NA, backend contract and snapshot rules; Mobile batch name removed then restored the same day | Gilt-only V0.1/V0.2 as basis; `S_sib` rules | `修改日志-2026-08-06-*.md` |
| 2026-08-13 | Sow score V1.3 replaces V1.2: 0 to 5 scale, six dimensions, no hard gates or tiers, filled median for missing data, 历史难产 field removed | V1.2, `…公式与阶段权重-2026-07-28.md` | `修改日志-2026-08-13-母猪淘汰评分规则V1.3.md` |
| 2026-08-17 | Semen: self-written Ant Design UI deleted, `console-dev` source copied; business centre semen entries (5 then 4) | Rewritten semen UI | `Vaccine/prds/semen/修改日志/*` |
| 2026-08-25 | IA preview drops the 繁育管理 tab with its 留种 and 淘汰 entries and notification items; 精液管理 moves to 生产管理 > 繁育资源; 猪只出场 sits under 猪群管理 | Sidebar group 淘汰&留种 (as built in prototype) | `修改日志/修改日志-2026-08-25-Console信息架构预览.md` |
| 2026-09-11 / 09-15 | Semen test reports: 36 bugs, not release-ready | - | `精液管理/测试报告/*` |

---

## Superseded and duplicate material

Folder `P` = `Vaccine/prds/culling&replacement/`. About 60 changelog files sit in `P/修改日志/` (git also shows early July logs that are no longer in the folder) and 39 review records in two review folders.

| File | Date | Status | Superseded by | Note |
|---|---|---|---|---|
| `P/00-淘汰与留种业务总览.md` | 2026-08-04 | current (links stale) | - | Links to piglet formula files at folder root; they moved to `仔猪留种评分规则-修订版-2026-08-06/` |
| `P/01-console-母猪淘汰计划.md` | 2026-08-05 | current | - | Does not mention V1.3, red line, Top N tagging |
| `P/02-console-后备留种计划.md` | 2026-08-04 | current | - | Shared-list model; rewritten after 07-28 |
| `P/03-mobile-淘汰复核.md` | 2026-07-22 | current but stale in places | - | Pre-dates V1.3 and the Mobile 淘汰中心 screens |
| `P/04-mobile-留种标记.md` | 2026-08-06 | current | - | File name says 留种标记 but content is the 留种中心 PRD |
| `P/05-…编辑与生效规则补充说明.md` | 2026-05-04 | current, not built | - | Save-and-execute and locking absent in prototype |
| `P/Culling_Suggestion_Engine_中文.md` | 2026-08-06 | stale (concept) | V1.3 scoring | Claims sole authority; 21 sections; still a useful vocabulary (decision windows, evidence, gates) |
| `P/Sentri母猪淘汰评分计算说明-V1.2.md` | 2026-08-04 | superseded | V1.3 (not in handover) | Hard gates, 90+ tag |
| `P/母猪淘汰评分计算公式与阶段权重-2026-07-28.md` | 2026-07-28 | superseded | V1.2, then V1.3 | "待生产与兽医负责人确认" |
| `P/母猪淘汰评分核心指标.html` | 2026-07-27 | superseded / exploratory | `…公式与阶段权重…`, V1.3 | "团队评审稿", 11 leaf indicators |
| `P/核心指标评审记录/` (15 files) | 2026-07-31 | review log | - | 5 rounds x 3 roles; last round: 12-indicator core table accepted (later cut to 11 by the 07-27 change) |
| `P/淘汰指标评审记录/` (24 files) | 2026-07-30 | review log | - | 8 rounds x 3 roles; last round "no valid objection" on v1.7 |
| `P/留种操作多视角评审-2026-07-26.md` | 2026-07-26 | review (pre-change) | 07-27/28 changelogs | P0 list mostly resolved by shared list; ones not resolved are in Contradictions |
| `P/仔猪留种评分规则-修订版-2026-08-06/` (5 files) | 2026-08-14 (file) | current | - | Formula file keeps an old date in its name (`…2026-07-28.md`) though content is `rc.7` |
| `P/仔猪留种评分规则已确认修订-2026-08-05.md` | 2026-08-05 | duplicate / folded in | 修订版 folder | Corrections already merged |
| `P/仔猪留种评分规则待确认项-2026-08-05.md` | 2026-08-05 | folded in | 修订版 folder + `后端评审待确认问题清单` | Qualification status idea became `qualification_status` |
| `P/后备母猪留种评分完整需求-V0.1.md`, `…指标映射与计算方案-V0.2.md` | 2026-08-05 | stale / parallel | piglet rules (both sexes) | Gilts only, "批次结束 Console 逐头确认正式种猪", red lines notify only |
| Deleted 2026-08-13 (git): `Console_Piglet_Retention_Index_Engine`, `Mobile_Litter_Retention_Priority_Index_Engine`, `Piglet_Breeding_Selection_Index_Engine`, `Retention_Scoring_Rule_Book`, `仔猪留种指标与系统数据缺口.html` | 2026-07-29 | removed | revised folder | Only in `git log` of `Vaccine/` |
| `P/修改日志/` (~60 UI/rule logs) | 2026-06-18 to 08-14 | history | - | Key ones listed under Versions; UI micro-changes (field merges, gender icon, header columns) not repeated |
| `brainstorm/culling_plan_brainstorm.md` | 2026-04-15 | exploratory | PRD 01/05 | Confirmed items (soft target, % or head count) survive; finalization and handling stages did not |
| `brainstorm/culling task.md` | 2026-04-16 | exploratory, dropped | PRD 00 "not a separate task" | Review task + handling task |
| `brainstorm/breeder_selection_task.md` | 2026-04-16 | exploratory, conflicts | PRD 02/04 | 补入 model; only the orphan `src/components/replacement/` realises it |
| `brainstorm/&&sale.md` | 2026-04-15 | exploratory, never built | - | Only sale material |
| `.superpowers/brainstorm/…/culling-detail-list-options.html` | 2026-06-18 | exploratory; option C won | refined-c, -v2, -v3 | Server stopped on idle timeout |
| `.superpowers/…/culling-detail-refined-c(.html, -v2, -v3)` | 2026-06-18 | exploratory chain | table with tabs (06-18 later change) | v2: "确认淘汰" not "已确认淘汰"; v3: lighter titles |
| `Vaccine/prds/semen/00-Console精液管理-PRD.md` | 2026-08-17 | current | - | Describes the copied module; no product logic |
| `Vaccine/prds/semen/修改日志/` (3 files) | 2026-08-17 | history | - | Entry split 5 to 4 items |
| `Vaccine/docs/semen/zh-精液模块文档/README.md` | 2026-08-14 | index | - | Notes originals are English files in a user's `Downloads` |
| `…/精液匹配与预留说明.md`, `精液备选匹配.md`, `精液资质过滤与近交评估.md`, `当前模块所需变更.md` | 2026-05-04 (git) | current design notes, not in prototype | - | Translations; the English originals are not in the handover |
| `…/精液库存日志说明.md` | 2026-05-04 | current | - | |
| `…/精液库存日志_第4节_日志类型与UI显示.md` | 2026-05-04 | duplicate | `精液库存日志说明.md` §4 | Same table, says so itself |
| `精液管理/测试报告/…2026-09-11.md`, `…2026-09-15.md` | 2026-09-15 | current (bug logs) | - | Two independent reports, second does not merge the first |
| `Vaccine/测试报告/2026-08-04-疫苗功能联调/` | 2026-08-04 | out of scope | - | Vaccine, screenshots only |
| `线上Console侧边栏整理预览.html`, `修改日志/修改日志-2026-08-2{1,5}-*.md` | 2026-08-25 | current IA proposal | - | Removes 淘汰 and 留种 from navigation |

---

## Where it is in Figma and the repo

Repo features compared: `features/keep-breeding`, `weaning`, `wean`, `breeding`, `pig-profile` (in `C:\Users\ying_\Documents\Codex\2026-09-08\clo\Sentri-UI`).

| Flow / screen | Figma | Repo feature | Relation |
|---|---|---|---|
| Mobile mark / unmark for breeding (生产-标记留种 8 screens, 生产-移除留种 5, No ID Pigs 4) | 巡检 Inspection file `4GZGPBauEOWQQjnRrzoUgF`, node `60:408` | `keep-breeding` (in-design, 4 screens) | See comparison below: same verb, different job |
| Weaning check, in progress / ended (cull tags, 淘汰评分, retain counts) | 生产任务 file `psrxDa9LRWLdTL9XMZmWdc`, node `8023:17019` | `weaning`, `wean` (not designed yet) | Handover weaning check is where cull review lives; repo PRD leaves "keeping breeders and filling IDs" out and files an overlap decision |
| Postpartum check | same file, node `8006:14820` | `post-farrowing` | Handover lists it as a cull-review task; not compared |
| Mobile 留种中心 (batch, room, sow, litter selection, 补充身份, 已留种) | not in Figma | none | New in handover; closest repo idea is `keep-breeding` identity gate |
| Mobile 淘汰中心 | not in Figma | none | Prototype only |
| Console plan (母猪淘汰&后备留种), 淘汰猪只, 留种仔猪 | not in Figma (web files have no 淘汰 / 留种 / 精液 / 销售 / 种猪 screens besides generic 猪只列表 with 育种猪 tab `1264:25125`) | none | Console index file lists none; Workbench drawers mirror mobile tasks (`3337:6928` 今日进度) |
| Sow record / pig page "Identity" holding the breeder fact | not in Figma for handover | `pig-profile` (no mention of breeding mark in its PRD) | `keep-breeding` PRD says the durable fact sits under Identity there; handover keeps it in the 留种中心 dossier |
| Semen process, inventory, outbound, settings | not in Figma | none | Breeding task semen batch is in `breeding` (confirm uses the previous mating's batch); handover design notes (pre-selecting `boarId`) are not reflected there |
| Sale / outbound | not in Figma | none | Console IA preview 猪只出场 only |
| Console IA preview (功能中心, 繁育资源 > 精液管理) | not in Figma (HTML) | none | Relevant for web designers |

**How the Mobile 留种 flow relates to `keep-breeding`.** Same job at the core: choose which pigs become breeders, with a Mark verb, an Unmark verb (not a toggle), an identity requirement that blocks untagged pigs, and an eligibility rule that is unwritten (open in the repo PRD, spelled out here as "候选 or 未评估, complete record, not 已留种 or 已淘汰"). Differences: the handover wraps it in a resident module (batch, room, sow, litter) with a score engine, trend, recommendation tag and shared Console list; the repo feature is a bulk action from a pig selection with no scoring and a filterable "marked set" that drains into Transfer (for example to gilt development). Conflict to resolve: the repo splices an identity conveyor over the untagged subset, while the handover (2026-07-28) removed batch tagging because a system-chosen "next untagged pig" risks tag mismatch, and requires single-pig tagging from the tapped card anchored on room, source sow and RFID. The handover is newer than the repo's source deck, but its Mobile marking still sits in a different place (Home 留种任务), so it does not replace `keep-breeding`; treat the two as overlapping candidates, as the repo already files for Weaning, Wean and Mark as breeder.

---

## Contradictions and open questions

| # | Item | Sources | Notes |
|---|---|---|---|
| 1 | **What 留种 means.** April brainstorm: select existing eligible gilts to refill a batch after culling (补入). PRDs 02/04: select piglets from litters. The orphan `ReplacementConsolePage` implements the former and is mounted nowhere. | `brainstorm/breeder_selection_task.md`; `02`, `04`; `src/components/replacement/` | No PRD says how kept piglets become batch members later; 2026-07-26 review asks whether 补入 joins V1 |
| 2 | **Is culling its own task?** Brainstorm: review task + handling task. PRD 00: not a separate task. Prototype: Mobile 淘汰中心 with a progress percent and batch mark/unmark. | `brainstorm/culling task.md`; `00`; `MobileCullingCenterPage.tsx` | PRD 04 mentions 淘汰任务 as a Home entry but no PRD defines it |
| 3 | **Who confirms a cull.** 03: Mobile selection produces 需淘汰. 01/Console: 建议淘汰 tab holds items still needing a decision, 确认淘汰 tab holds confirmed ones. Unclear whether a Mobile 需淘汰 lands under 确认淘汰 or still waits on the Console. | `01`, `03` | Progress label 已淘汰 / 目标淘汰 on Mobile actually counts 需淘汰 |
| 4 | **Three or four generations of sow-cull score** are in one folder (engine concept, 07-28 stage weights, V1.2, V1.3). PRD 01 (淘汰指数) and 03 (淘汰评分/排名) cite none. V1.3 rule documents are not in the handover (their stated home: `~/Documents/ChatGPT/Dahua/`). | `Culling_Suggestion_Engine…`, `…2026-07-28.md`, `V1.2`, V1.3 changelog | Which scale (0 to 100 vs 0 to 5 mapped to 0 to 100)? Fetch V1.3 files before design work |
| 5 | **Auto-tagging vs manual list.** V1.3 suggests Top N by rank auto-tags 建议淘汰; PRD 01 says the manager picks sows by hand. The 90 and above 优先淘汰 tag of V1.2 is gone. | V1.3 changelog "衔接待确认"; `01` | Unresolved |
| 6 | **Hard red lines / acute illness.** V1.3 deliberately lets a sick sow with good output rank low, handled by health tasks; the culling index may hide urgent cases. | V1.3 changelog, "第一版范围收敛" | Product decision recorded; revisit if the floor relies on this list |
| 7 | **Plan edit rules not built.** 保存并执行, double check, lock after task start are specified for both plans; prototype page has none. Also, 02 says the keep number is reference-only while 05 treats it like a target that needs executing. | `05`, `02`, `CullingPlanPage.tsx` | |
| 8 | **Reminder card.** PRD 04: reminder shows 已留种 X, 待确认 X. Prototype weaning-check card shows 预计留种 / 目标留种 / 还剩 and a "建议留种 / 目标留种" row, and the sort sheet still has 留种评分 sorting. | `04`, `MobileWeaningCheckFlow.tsx` | Old target logic remains in prototype |
| 9 | **"Not cull" reason modal** specified in 03 but absent (field exists, no prompt). | `03`, `MobileWeaningCheckFlow.tsx` | |
| 10 | **Gilts only or both sexes.** 07-26 review P0-1 asks; V0.1/V0.2 say gilts only; PRD 02/04 and the piglet rules include boars and gilts in one mixed list; 07-03 Console had separate boar/gilt tabs. Plan card still titled 后备留种 and target is "后备" reserve. | review, `V0.1`, `02`, 07-03 log | |
| 11 | **Batch name on Mobile batch card.** Removed and restored on 2026-08-06; two logs, no time order; PRD 04 still shows "生产线 - 批次名称 · 日龄" and search by name. | `…08-06-Mobile留种批次名称*` | The "位置调整" log says "恢复", so removal came first |
| 12 | **Red lines.** V0.1 says red lines only notify the Console and change nothing; piglet rules set REJECTED score 0 and 不推荐. 12 to 13 teats OBSERVE vs the Console highlighting `<12` teats for sows (different animals, but one teat threshold story). | `V0.1`, piglet rule folder | |
| 13 | **Unresolved P0s from the 07-26 review** that the later PRDs do not answer: risk bypass (high score but unhealthy: 04 says show "需要现场复核" but allows keep), who may revert 已留种 (any user, no reason or audit field defined), offline and conflict handling beyond "last write wins", whether kept pigs enter 后备培养 with health/immunity/pen approval. | review §四, `02`, `04` | |
| 14 | **Broken links.** PRD 00 and 02 point to piglet rule files at folder root; they now sit in the 修订版 folder. Scoring doc versions are release candidates ("不得当作生产 PUBLISHED"). | `00`, `02` | |
| 15 | **Navigation.** Prototype keeps 淘汰&留种 under the old sidebar; the 2026-08-25 IA preview deletes 留种 / 淘汰 entries with the 繁育管理 tab and gives no new home. | `修改日志-2026-08-25-Console信息架构预览.md` | Decision needed |
| 16 | **Semen COI hard or soft.** Eligibility doc: system tries to "block high-risk pairs" and the fallback lists COI under filters, yet COI above 10% is allowed (ranked down, labelled 高 COI). Old rule rejected sows/boars sharing ancestors within a forbidden depth. | `精液资质过滤与近交评估.md` §5.1/§4.5/§6.1, `精液备选匹配.md` §6.4 | Needs a final word |
| 17 | **Semen docs vs build.** Matching, 配种规划 dialog, pre-selected boar, foreign-straw registration are not in the prototype; the prototype is the migrated module. Test bugs are from `dev.sentri.cn`, not the prototype, so their state is not tied to a prototype version. | `当前模块所需变更.md`, PRD 00, bug reports | Also open in `精液库存日志说明.md` §6: whether foreign scans always log `manual_entry`, when the log row is written, how batch ID is derived inside a breeding task |
| 18 | **Semen state machine.** Prototype allows manual add that skips QC, dilution and packing even for own-farm stock (BUG-009); OPT-001 proposes a strict state machine. Not yet decided. | bug report 09-11 | |
| 19 | **Sale.** No product decision beyond the brainstorm; unclear who owns outbound for culled sows (卖猪 vs 猪只出场 task) and how 已淘汰 gets set. | `&&sale.md`, IA preview | |
| 20 | **Ownership of originals.** Several source files live outside the handover (V1.3 rule docs, English semen originals in `Downloads`, `console-dev` in `/Users/gu/Desktop`). | changelogs | Ask the Dahua team for them |

## Corrections found while writing the workflow specs (2026-11-03)

- The prototype's Console "confirm cull" dialog makes you type the pig count to enable the button. It warns that confirmed pigs can be filtered in the sale and transfer modules and won't join a new batch. This is the only built hand-off from culling to exit. See [flows/cull-review.md](flows/cull-review.md).
- PRD 00's module table is stale: it still calls `02` a candidate second approval and `04` a Toolbox module.
- Semen stock-shortage dialog: Ignore is enabled, "use another boar" is disabled. The semen bug reports total 3 P0, 23 P1 and 10 P2.
