# Transfers, feed, production lines, legacy design system

Extraction of four smaller topics from the Dahua handover, so a designer can say "look at the old flows" and find them. Read-only pass; nothing in the handover was edited.

- **Handover root:** `C:\Users\ying_\Documents\Sentri-Dahua-Handover\Sentri-Dhua` (all paths below are relative to it unless prefixed `repo:`).
- **Repo:** `C:\Users\ying_\Documents\Codex\2026-09-08\clo\Sentri-UI` (prefix `repo:`).
- **Language:** docs are Chinese; the Chinese term is given in parentheses at first use.
- **Dates:** file modification dates (`mtime`) unless a document states its own date. `mtime` can be later than the content date because several PRDs were touched by bulk edits (for example `Inventory management/Inventory PRD/01-Console库存管理PRD.md` is `2026-10-13` but its newest change log is `2026-08-14`).

## Summary

| Topic | What the handover holds | Thickness |
|---|---|---|
| (a) Transfers and pig exits | No transfer PRD. Behaviour is scattered over about 10 files: two sentences in the Primer, a status model in `Pig_Status.md`, a post-culling exit design in `brainstorm/&&sale.md`, Console menu entries, a production-line "transfer plan" field, and a full mobile Transfer workflow deck inside the legacy `Sentri-UI/` copy. | Very thin as product spec. The only designed UI is `Sentri-UI/ux/system/workflows/place.html`, which is byte-identical to the repo copy. |
| (b) Feed management | One full PRD (`Sentri_Feed_Management_PRD_v2_1_中文.html`, 19 sections plus 2 appendices, machine-translated Chinese), 3 Chinese SVG diagrams, and a separate, partly contradictory thread inside Inventory (feed as reference-only stock, days-of-use). No UI designs. | Thick on rules and data model, zero screens. |
| (c) Production lines | Definition in the Primer (section 5), a 584-line exploratory test report of the live Console page, the Onboarding step, the Console field list (via Onboarding code). | Medium. Concept clear, lifecycle undefined, live page broken in July. |
| (d) Legacy `Sentri-UI/` | A snapshot of the team's mobile design repo as of **2026-09-22** (equals repo commit `4d2fbd83`), plus Chinese-team additions from 2026-09-29 to 2026-10-12: a 1,165-line `SKILL.md`, an offline-sync prototype with specs and change logs. | Older snapshot, not a competing fork. Unique items: `SKILL.md`, offline-sync prototype and specs, `修改日志` folders. |

---

## (a) Transfers and pig movement

### What is and is not defined

There is **no dedicated transfer PRD** anywhere in the handover. Searches for 转舍 (move between houses), 转栏 (move between pens), 转移 (move/transfer), 调拨 (stock allocation), 离场 (leave the farm) and `transfer` give these hits that actually define behaviour:

| Source | Date | What it defines about movement |
|---|---|---|
| `General copy/Sentri_Primer.md` section 4.3 | 2025-11-28 | Two transfer types (single pig, group), location history, production-line-driven group transfer. |
| `General copy/Pig_Status.md` | 2025-11-13 | `Left (离场)` terminal status: sold, transferred to another farm, or removed from inventory. |
| `brainstorm/&&sale.md` | 2026-04-15 | Post-culling handling methods, including `INTERNAL_TRANSFER` and `TRANSFER_OUT_OF_FARM`; outbound task linkage; capacity release. |
| `Sentri-UI/ux/system/workflows/place.html` (section `wf-transfer`) | file 2026-09-22 (repo commit 2026-08-27) | The only designed Transfer flow: 4 mobile slides. |
| `Sentri-UI/ux/system/motion.html` | 2026-09-22 | Transfer as an "exit" animation: source pen census ticks down, destination pen card ticks up. |
| `OnBoarding/sentri-react/src/pages/console/onboarding/steps/StepProductionLine.tsx` (and `onboardingTypes.ts`) | 2026-07-03 | Production line has a `transferPlanId/Name` field: "transfer plan sets when pigs are moved, rules by production status, task or node, auto-creates a task when conditions match". |
| `Vaccine/sentri-console-launchpad.html`, `线上Console侧边栏整理预览.html` | 2026-08-21..25 | Console menu: 猪群流转 (herd flow) / 转舍 (transfer), 出场任务 (exit task), 出场数据 (exit data). Mock copy only. |
| `修改日志/修改日志-2026-08-25-Console信息架构预览.md` | 2026-08-25 | "猪群流转 / 转舍" moved from 生产管理 to 猪群管理 tab; 出场管理 renamed 猪只出场 and moved with it. |
| `Vaccine/docs/MOBILE_FIELD_LAYOUT.md` | 2026-04-20 | Mobile home keeps a demo 转舍 task card beside vaccination and weaning-check cards. |
| `Vaccine/docs/offline-test-2026-09-03/测试报告-2026-09-03-Mobile生产任务离线能力多角色专项.md` | 2026-09-03 | Live app has `transferTask` and `outboundTask` offline stores; 转舍 and 出栏 are not auto-dispatched production tasks. |
| `Vaccine/vaccine prds/06-后端强制豁免规则-PRD.md` | 2026-04-23 | Vaccine exemption rule 1: no vaccination within 0-5 days after 转群/转舍/合群 (transfer, house move, merge). |
| `Vaccine/prds/culling&replacement/00-淘汰与留种业务总览.md`, `01-...`, `03-...` | 2026-08-04, 08-05, 07-22 | Culling decision page must not show sold/transferred/left/dead states; `已淘汰` appears only after sale, death, or transfer to another farm completes. |

Not transfers (ignore when searching): `调拨` in `Inventory management/Inventory PRD/01..06` is multi-warehouse stock allocation, explicitly out of scope; semen "位置转移" in `Vaccine/prds/semen/00-Console精液管理-PRD.md` moves straws between storage locations; `转移` in `Vaccine/prds/vaccine prd/09-疫苗计划与疫苗任务测试用例.md` (VMOB-021) is a stub "More actions" entry; `员工离场` in `Vaccine/prds/saas-login/02-员工入场流程.md` is staff presence; `当前进行中的查情任务转移至配种` in `Sentri-UI/ux/system/workflows/cycle.html` moves a running heat-check task to breeding, not a pig.

### Pig-status lifecycle (source: `General copy/Pig_Status.md`, 2025-11-13)

| Pig type | Statuses | Transitions |
|---|---|---|
| Sow | Gilt (后备母猪), In Estrus (已发情), Bred (已配种), Pregnant (已妊娠), Lactating (泌乳期), Empty (空怀) | Empty/Gilt -> In Estrus -> Bred -> Pregnant -> Lactating -> Empty. Weaning (sow no longer in a pen with piglets) closes Lactating. Doc suggests merging Empty and Gilt. |
| Boar | In Production (生产中) only | Only exits are Left or Deceased. |
| Piglet / breeder | Lactating Period (哺乳期) -> Growing Period (成长期) | Weaning triggers it. Breeder is a category (Primer 4.1), not a status. |
| All | **Left (离场)**, **Deceased (死亡)** | Reachable from any status, terminal, no way back. Left triggers: sold, transferred to another farm, removed from inventory for any reason. |

Category (Primer 4.1: production sow, production boar, breeder, piglet, fattener) is independent of status flags (deceased, sold, culled). Breeder becomes sow when added to a production batch, boar at minimum age.

### Implied transfer flows

Each flow is assembled from the sources named in its heading; steps marked (implied) are not written anywhere.

**T1. Single-pig transfer** (`General copy/Sentri_Primer.md` 4.3 item 1; `Sentri-UI/ux/system/workflows/place.html` slides 1-2)

1. Worker opens one pig's detail page (mobile) or selects pig(s) in a unit walk.
2. Changes the location field. Primer: "any location without restrictions".
3. Designed version (place.html): a destination Picker with the current unit pinned first and the source pen dimmed ("where they are now"); search reaches any pen; tap commits; the sheet is the confirmation (no extra dialog); primary button reads "Transfer 2 pigs".
4. System updates current location and keeps location history. Records of an identified pig (cases, treatments, marks) move with her silently.
5. Feedback: no toast; source pen card re-derives down, destination up.
6. Downstream (implied): vaccine exemption window of 0-5 days (`Vaccine/vaccine prds/06-后端强制豁免规则-PRD.md`); offline queue domain `transferTask`.

**T2. Group transfer task** (Primer 4.3 item 2; `StepProductionLine.tsx`; Console menu mocks)

1. Production line carries a 转舍计划 (transfer plan): rules by production status, task, or node.
2. When conditions match for a batch, the system **auto-creates a transfer task** (Primer: "task-based, tied to batches").
3. Console: 猪群管理 > 猪群流转 > 转舍 lists 转群单 (transfer orders); launchpad mock says "initiate and track, record source pen, destination pen and number moved", with "today 3 orders / 340 head".
4. Workbench "今日进度" has a 转舍 drawer (900 wide) per the Figma index.
5. Mobile: transfer task appears as a task card; works offline (`transferTask` store).
6. Task lifecycle (implied from Primer 5.2): Planning -> In Progress -> Ended; cannot be skipped or deleted; overdue stays open; ended = locked read-only; last upload wins on conflict. Primer does not say transfer tasks follow this, only that it holds for tasks.
7. On completion, each pig's location and history update (Primer: "automatically").

**T3. Mixed transfer (tagged pigs plus un-identified head)** (`place.html` slides 3-4; production Figma path B, documented in `repo:ux/research/ops/place-identity.md`, not in the handover)

1. Selection contains tagged pigs and a group count.
2. Tagged pigs move as placement events; the head move as a count.
3. For each open group record on the source pen (treatment, condition): choose **Stays / Goes / Both** (default Stays; folds to a footnote when the whole population leaves).
4. If the head come from several batches: steppers per batch, sum = n.
5. One primary button; counts update on the cards.

**T4. Internal transfer after a culling decision** (`brainstorm/&&sale.md` sections 3, 7, 12)

1. Manager confirms culling, then picks handling method `INTERNAL_TRANSFER`: sow moves to another eligible pen or unit on the same farm.
2. System creates or links an internal transfer task with a **destination capacity check**; no capacity = block or require another destination.
3. Source slot released, destination slot occupied; sow stays on farm and may remain culling-flagged.
4. Marked optional in V1 ("only if transfer module exists"); complex capacity optimisation deferred.

**T5. Transfer out of farm / sale / outbound** (`brainstorm/&&sale.md`; `General copy/Pig_Status.md`; Primer 5.5)

1. Handling method `SALE` or `TRANSFER_OUT_OF_FARM`; create a draft outbound task prefilled with pig ids, source `CULLING_PLAN`, batch, reason `CULLING`, planned date, source locations, or link an existing task (same farm, status draft/planned/in progress, one active outbound link per pig).
2. Task executes in Sale/Outbound (`出场任务`: schedule, assign executor, track loading; `出场数据`: head, average weight, loss, settlement basis).
3. Completion event `OUTBOUND_TASK_COMPLETED` sets execution state `RELEASED`, `pig.currentStatus = Left`, recalculates capacity forecast.
4. Cancel or remove-pig events reopen the capacity gap. Death before outbound = `EXCEPTION_DECEASED`.
5. Batch closure (Primer 5.5): batch stays active until all pigs are recorded sold/outbound, or the manager ends it. Sale/outbound action is "in development".

**Culling handling state model** (`brainstorm/&&sale.md` section 7): decision `PLANNED -> FIELD_CONFIRMED | FIELD_CONTESTED -> CONFIRMED_FOR_CULLING | RETAINED_BY_OVERRIDE | CULLING_CANCELLED`; execution `PENDING_HANDLING_SELECTION -> PENDING_OUTBOUND -> OUTBOUND_TASK_LINKED -> SCHEDULED_RELEASE -> RELEASED` (or `OUTBOUND_CANCELLED`, `EXCEPTION_DECEASED`). Capacity counts scheduled release (planned before next batch start) separately from actual release (outbound completed).

### Rules that cut across the flows

| Rule | Source |
|---|---|
| Location changes are automatic and keep history | Primer 4.3 |
| A pig's records follow the animal; group records stay on the pen unless the worker says otherwise | `place.html` slides 1 and 3 |
| Left and Deceased are terminal | `Pig_Status.md` 5.2 |
| Decision pages never show downstream execution states (sold, transferred, left) | `AGENTS.md` line 35; `Vaccine/AGENTS.md` line 108; culling PRD 01 |
| A confirmed cull still occupies its pen until sale, transfer or death is done | `brainstorm/&&sale.md` section 2 |
| Pig not in the current batch is blocked from the batch's task; in batch but other unit is allowed | Primer 4.2 (RFID validation) |
| Inventory does not move on a pig transfer; only supplies change on task use or manual stock-out | Inventory PRD 01/02/06 (no mention of pig transfer) |

### Versions, newest last

| Date | Document | Change |
|---|---|---|
| 2025-11-13 | `General copy/Pig_Status.md` | Status model. |
| 2025-11-28 | `General copy/Sentri_Primer.md` | Transfer types, production line, task lifecycle. |
| 2026-01-23 (Figma label) | Mobile Figma 查情 "转移单头猪" | Single-pig transfer from heat check (4 screens). |
| 2026-04-15 | `brainstorm/&&sale.md` | Post-culling exit design. |
| 2026-07-03 | Onboarding `StepProductionLine.tsx` | 转舍计划 field on production line (demo prompt). |
| 2026-08-25 | `修改日志/修改日志-2026-08-25-Console信息架构预览.md` | 转舍 moved to 猪群管理 tab; 出场管理 becomes 猪只出场. |
| 2026-08-27 | repo commit `0c19a1cf` | `workflows/place.html` Transfer deck enters the repo. |
| 2026-09-03 | offline test report | Confirms `transferTask` and `outboundTask` offline domains in the live app. |
| 2026-09-22 | `Sentri-UI/ux/system/workflows/place.html` in handover | Identical to repo. |

### Where it is in Figma and the repo

| Item | Location |
|---|---|
| Mobile single-pig transfer (production design) | Mobile Figma `4GZGPBauEOWQQjnRrzoUgF`: 记录-转移 (2 screens, section `60:408`, feature `move`); 查情 · 转移单头猪 (2026.1.23, 4 screens, `7561:10830`, feature `heat-check`). Source: `repo:references/figma/index.md` lines 32 and 72. Path A confirm dialog `296:1133`, path B confirm page `612:2414` / `749:4264` (per `repo:ux/research/ops/place-identity.md`). |
| Web transfer drawer | Web Figma `MufYKeR3oCVDyppB3FmlNV` 工作台 > 生产-今日进度 > 转舍, node `3421:7768`, 1440x900, "Transfer drawer (900 wide)". `repo:references/figma/web/index.md` line 124. |
| Web transfer record dialog (转舍记录) | Web Figma `qSEc0RElNQUMWYkX30jVgr`, node `283:4470`, frame named 废弃 (archived copy). Same file has 日志-车间 (`159:7004`, workshop event log with event type filter). |
| Repo feature | `repo:features/move/PRD.md` + `feature.json`: **draft**, five screens, all `in-design` (Transfer tagged, Destination picker, tagged and head, After, Transfer sow). Source is the same `workflows/place.html` deck. |
| Entry points | Farrowing Actions drawer has a Transfer tile; per `repo:features/farrowing/feature.json` line 3086 "Transfer opens only the Transfer placeholder". `repo:features/pig-profile/PRD.md`: Transfer sow, Mark not in pig, Remove from batch render only inside Farrowing's drawer. Workbench Other list shows "Move to Farrowing, Unit 6" rows (`repo:features/workbench/PRD.md` line 44). |
| Handover vs repo | The handover Transfer deck is **not new**: all six `workflows/*.html` files are identical to the repo (after line-ending normalisation). The handover adds prior art around it (production-line transfer plan, Console 转舍/出场 menus, culling-to-exit design, pig-status lifecycle), none of which the repo has. |

---

## (b) Feed management (饲料管理)

### Documents

| Path | Date | What it is |
|---|---|---|
| `Sentri_Feed_Management_PRD_v2_1_中文.html` | 2026-08-12 (header: v2.1 consensus draft, 2026-08-11; supersedes spec v1 of 2026-08-05, not in the handover) | Full PRD, 105 KB, 19 numbered sections + Appendix A (about 70 review findings -> resolutions) + Appendix B (5 worked examples). Chinese is a literal machine translation, field names and enums kept in English. |
| `饲料管理/assets/饲料解析级联-中文.svg` | 2026-08-12 | Diagram 1: resolution cascade (7 layers). |
| `饲料管理/assets/饲料库存对账流程-中文.svg` | 2026-08-12 | Diagram 2: plan vs reality reconciliation. |
| `饲料管理/assets/饲料对账时间线-中文.svg` | 2026-08-12 | Diagram 3: three-period reconciliation timeline. |
| `饲料管理/assets/diagram-{1,2,3}-original.png` | 2026-08-12 | English originals (images; not read). |
| `饲料管理/修改日志/修改日志-2026-08-12-PRD全文翻译.md` | 2026-08-12 | Translation only, no business change; 21 h2 sections, 36 tables, 3 figures verified. |
| `Vaccine/prds/inventory/03-饲料预计可用天数.md` | 2026-10-13 | Console inventory: feed estimated days of use. |
| `Vaccine/prds/console/修改日志/修改日志-2026-08-11-业务中心新增饲料管理.md` | 2026-08-11 | Business Center > 物资管理 gets a 饲料管理 button. |
| `Inventory management/Inventory PRD/06-库存出库后端逻辑.md` section 1.1 | 2026-08-19 | Backend rule: feed stock-out comes from feed plan x feed curve. |
| `Vaccine/prds/inventory/修改日志/*饲料*.md` (11 files, 2026-06-30 to 2026-08-14) | see timeline below | Feed inventory change history. |

### The feed flow in the PRD (design-level steps)

Anchor: **stage -> feeding curve -> feed formula -> performance**. The farm enters only what it already has (stage, feed product, kg/day curve); nutrition science is never a required farm input.

1. **Reference requirement (layer 1).** Sentri admin keeps a global library per genetic line, sex class, parity band, wean age, stage. Energy basis (ME or NE) is mandatory. Farm cannot edit.
2. **Modality gate (layer 2).** `curve_fed` (sows, boars: produces kg/day) or `ad_lib` (growers, finishers: no kg/day, only which formula and when to switch). Gilt development resolves by lean-potential tier.
3. **Batch strategy (layer 3).** Rarely set, at batch start (standard / market-time / accelerated).
4. **Formula resolution (layer 4).** kg/day = reference energy / formula energy density, with four precision tiers: default, basic derived, advanced derived (Liebig minimum with lysine), nutritionist manual. ME and NE never mixed.
5. **Nutritionist override (layer 5).** Whole curve in MVP, point-level as fast-follow. Sacred: never silently overwritten.
6. **Individual / condition override (layer 6).** Per animal, pen or batch via one shared "adjustment" primitive. MVP is a severity-band preset dropdown (BCS or backfat based), not a scoring engine.
7. **Event and environment modifiers (layer 7).** Flushing (manual button, window of N days before transition) and temperature or heat-stress rate adjustments (manual seasonal switch in MVP).
8. **Curve point states.** `derived` (recalculates silently), `system_fallback` (data gap, recovers on its own), `nutritionist_locked` (never auto-reverts; upstream change raises a review flag). Weekly anchors, linear daily interpolation.
9. **Always log purchases** (kg, total landed cost, delivery date; delivery date governs). This is the only required inventory input.
10. **Tier 1 projected balance** (always available): purchases minus theoretical (curve) consumption. Labelled "projected / unconfirmed", never "stock".
11. **Optional physical count** (any confidence tier: eyeball, dipstick, sensor, self-report; calibrations in scoops or bags). Counts open and close **reconciliation periods**.
12. **Tier 2 feed variance** per closed period: actual (open count + purchases - close count) minus theoretical (daily sum of head x that day's curve). Noise tolerance by confidence tier; `estimated_loss` only beyond tolerance; spoilage disposals excluded first.
13. **Persistence check.** One period with same-sign variance = hint; repeated = real issue. In MVP shown to the human as side-by-side signed variances, not computed trend.
14. **Cost.** Weighted-average cost with trailing window and immutable WAC history per period; batch feed cost is standard (curve x WAC) not measured. Usage variance only, no price variance.
15. **Stock-out and fallback.** Human-asserted stock-out auto-switches to fallback formula; projected-balance-below-zero only raises a prompt. Restock asks "switch back?". Fallback activation closes the count period and prompts a count. Cycles (A->B->A) rejected.
16. **Formula retirement** forces a final count and closes the WAC pool.
17. **Review inbox** (single, role-routed, persistent). Item types and states below.
18. **Onboarding.** A farm's existing program is imported as `nutritionist_locked`, so day-one feeding is unchanged; unlock stage by stage.

**Review inbox items** (section 13.1, 9.17): `formula_changed` -> nutrition contact; `stockout_confirm`, `restock_switchback`, `variance_flagged`, `phase_diet_switch_due` -> farm manager; `override_aging` (over 30 days without `expires_at`) -> whoever applied it or manager; `spot_check_due` -> worker or manager. Status: `pending / resolved / dismissed`. While `formula_changed` is pending the affected point falls back to derived with a "awaiting nutrition contact" badge.

**Stages** (section 8): lactation, nursery/weaner, grower, finisher (growth line); gilt development, wean-to-service, gestation, lactation (sow); boar development, breeding boar. Only grower-to-finisher has no discrete real-world event (handled by growth-offset estimation, section 10, confirmed with one tap on physical pen move).

**Roles** (section 6): farm worker (log events, apply preset overrides, answer inbox), farm manager/owner (assign formulas, set policy, whole-curve or point overrides, see all cost and variance), nutrition contact (higher-trust override badge, resolves formula-change flags, optional tenant reference curves), Sentri admin (global library).

**MVP vs later** (section 16): ON = reference, modality, formula energy density, derivation, whole-curve override, purchases, optional counts, tier 1 and 2, stock-out detection with human gate, phase-budget forecast (`phase_budget_kg_per_head`, `phase_budget_duration_days`), mixed-sex pens, review inbox, locked import. Reserved pattern = batch strategy, individual override presets, flushing, environment. Deferred = per-animal IoT feeding, AI curve suggestions, price variance, tenant reference curves, push/email escalation.

**Open decisions** (section 17, 9 items): who owns reference curves (global vs tenant); default curve source; noise-tolerance bands; shared implementation of growth offset and feed calibration; WAC window length; severity thresholds (needs nutritionist); gilt transition gate defaults (about 220-230 days, 2nd-3rd estrus); phase-budget defaults per stage and line; how `sex_mix_ratio` is entered.

### Feed in the Console inventory thread (separate from the PRD)

Console treats feed as **reference stock**, because the barn can only read a bin scale and cannot tell which purchase batch is left. Timeline from `Vaccine/prds/inventory/修改日志/`:

| Date | Change |
|---|---|
| 2026-06-30 | Feed profile gets "applicable stages" (one pig type many stages). |
| 2026-07-06 | Feed stock trend chart on inventory home; list gets "estimated days available" (7-day average). |
| 2026-07-08 | "Applicable pigs and stages" removed from feed profile (too much entry). |
| 2026-08-10 | Feed list slimmed (no trend or nearest expiry); generate-purchase-order enabled for feed. |
| 2026-08-11 | Feed becomes **read-only reference**: 30-day trend, days-of-use on 30-day average; batch column and balance removed from feed ledger; stock-risk module removed; 饲料管理 entry added to Business Center with 库存管理 / 入库记录 tabs. |
| 2026-08-12 | Reversal: "restore managed-stock attributes and detail" (batch stock, risk, ledger balance back), then same day "estimated stock" header wording. Feed tab restored in total inventory. |
| 2026-08-14 | Final: feed detail **loses the batch stock** module; feed is managed by material total, not remaining batches. Risk, trend, ledger and days-of-use stay. |
| 2026-08-19 | `06-库存出库后端逻辑.md`: feed stock-out is scheduled from feed plan x curve at execution time, deducts planned quantity, idempotent per `feedPlanId + executionDate + planLineId`. |

Days-of-use rule (`Vaccine/prds/inventory/03-饲料预计可用天数.md`): `floor(current stock / (30-day business usage / 30))`; no usage = dash; stock 0 = red "0天"; stock below 0 = dash and the stock-risk module handles it. Bands: 3 days or fewer red, 4-7 orange, 8-15 yellow, over 15 green, uncomputable grey. Column sortable, dashes last. Feed only; medicine, semen and others do not show it.

### Where it is in Figma and the repo

| Item | Location |
|---|---|
| Web Figma | `[Web] 饲喂计划 · feeding plan`, file `2owiBMZ66JOILBd5VELWgt`: **cover page only** (`67:699`), 0 screens. Created 2026/08/14. `repo:references/figma/web/index.md` lines 23 and 944. |
| Mobile Figma | No feed screens ("The old Figma has no feed plan screen", `repo:features/feed-plan/PRD.md`). |
| Repo feature | `repo:features/feed-plan/` (`PRD.md`, `feature.json`, `budget.md`, `critique.md`): mobile **pen feeding read, ad-lib pen, several-pens entry, Adjust-feed editor (-50..+50 percent, hold, stop)**, built inside the Inspection prototype; Pen feeding screens `in-design`, bulk entry `earlier`. Explicitly **out**: feed inventory, purchase, supplier, formula authoring ("management screens"). |
| Repo prior art in the handover copy | `Sentri-UI/ux/system/workflows/pen.html` sections `wf-switch` (Feed · pen: switch a pen's formula on due day) and `wf-feed-pig` (Adjust feed · one pig), identical to repo. |
| Concept mapping handover PRD -> repo feature | PRD formula / program / assignment (9.3-9.5) <-> repo "feeding program (animal's plan) separate from feed formula (product)" and the open ASTRA-FEED-PLAN-FIELDS issue (brand, supplier, energy, protein, lysine not drawn). PRD `phase_diet_switch_due` inbox item (13.1) <-> repo "Formula due on the pen header has no screen that explains it". PRD individual override (+-10 percent flat, then severity bands, 11.1) <-> repo +-50 percent percentage editor. PRD "stop" and "ad-lib read-only" <-> repo four states and ad-lib read-only. |

---

## (c) Production lines (生产线)

### Concept (source: `General copy/Sentri_Primer.md` section 5, 2025-11-28)

| Term | Definition |
|---|---|
| Production line | Logical unit over one or more zones or sections; can cover the whole cycle or only some stages. Defines included sections, batch management system (interval between batches, wean age if weaning tasks included), template-based production plan. |
| Production batch | Group of pigs progressing through the cycle within a line. Created **automatically** at the line's interval if at least 1 eligible pig exists (production sow or female breeder, above min age, not culling-flagged, in no active batch, in a section of the line), or **manually** for ad hoc groups. |
| Production plan template | Sequence of tasks, KPIs, dependencies. One template per line; each batch inherits a **copy**; template changes affect **future batches only**. |
| Task sequence | Estrus check -> Breeding (runs in tandem) -> Return check (opt.) -> Pregnancy check (opt.) -> Farrowing -> Piglet handling (opt.) and Postpartum exam (opt.) -> Weaning check -> Nursery exit check -> Fattening exit check. Optional tasks are toggled per template, not per batch. |
| Funnel logic | When a task ends, pigs failing the condition leave the batch and become unassigned; removal reason mandatory. Culling flag excludes a pig from future batches. |
| Batch closure | Final task done; batch stays active until all pigs are sold/outbound or manager ends it; then a Batch Report is generated. |

### Create-line flow (assembled)

1. **Entry.** Console 生产 > 生产线 (`/console/production/line`), or the skippable Onboarding step after 厂区布局 (`OnBoarding/sentri-react/docs/PRD-Onboarding.md` 2.3, flow: farm layout -> production line -> add pigs -> add staff -> done; bottom nav only Skip / Finish).
2. **Fields** (`StepProductionLine.tsx`, `onboardingTypes.ts`, test report): 生产线名称 (required; live page says digits only, "start from 1"), 生产线覆盖区块 (required dropdown of sections), 每批次配种母猪数量上限 (optional), 预计首批开始日期 (required, year and week picker; current and next week disabled), 生产计划 (template: select or create), 任务KPI (template: standard KPI templates or custom, KPI detail dialog), 转舍计划 (template: select).
3. **Save.** Line is created; batches are generated automatically on the line's interval (system) or created by hand (manual). The batch list shows creation type `System` or manual.
4. **Run.** Tasks dispatch to mobile on batch creation, visible to farmhands once the estimated start is reached (Primer 5.2.1).
5. **Lifecycle (not defined in the handover).** The test report proposes: draft, planned, running, paused generation, deactivated, archived; no physical delete once batches exist; edits versioned with "from this batch onward" scope and an impact preview of 8-12 future batches; deactivation stops future generation without touching history; restore asks which week to restart from.

### Live-page findings (`General copy/Production Lines/探索式测试报告-2026-07-28-生产线.md`, 584 lines, `https://dev.sentri.cn`)

13 findings: 1 Blocker, 2 Critical, 5 Major, 3 Minor, 2 Suggestion. Verdict: "not recommended for production acceptance".

| Id | Severity | Finding |
|---|---|---|
| BUG-03 | Blocker | Required coverage-section dropdown has no options; line cannot be created. |
| BUG-01 | Critical | Line list is empty but batch page shows 8 batches referencing lines `011`, `11111`, `1` (orphans). |
| BUG-02 | Critical | Year-end week numbering: same week 2026-12-28..2027-01-03 shows "Week 1 of 2026" and "Week 1 of 2027". Should be ISO 2026-W53. |
| BUG-04 | Major | Batch number search for `0001` returns no data (three exist); clearing does not restore. |
| BUG-05 | Major | Refresh in create flow loses everything, no draft. |
| BUG-06 | Major | Chinese UI flips to English on refresh. |
| BUG-07 | Major | Max sows per batch accepts `-1e3.5abc` and emoji. |
| BUG-08 | Major | Leap-year week off by one (2028-02-29 shows Week 10, ISO W09). |
| BUG-09..11 | Minor | 60-digit line name accepted; empty list has no empty state or lifecycle actions; batch number `0001` repeats across lines with no global key (suggest `line-batch`, e.g. `1-0001`). |
| BUG-12, 13 | Suggestion | Table 1,795 px wide at 390 px, action column at 1,694 px; two-week freeze rule unexplained. |

Not covered: edit, deactivate, restore, delete, auto-generation idempotency, permissions, concurrency, offline. Report lists 8 auto-generation scenarios that must be tested with virtual time (once-only, 10x retry, downtime catch-up, deactivate/restore, edit scope, year/leap boundaries, optimistic lock, auto vs manual collision on same line and week).

### Other mentions of production lines (usage, not definition)

| Path | Role of line |
|---|---|
| `Vaccine/prds/vaccine prd/02-普免计划.md`, `03-跟批免疫计划.md`, `Vaccine/vaccine prds/01-跟批免疫计划-PRD.md` | Plan basic info includes 生产线; plan list shows applicable lines; batch-following tasks show `生产线-批次`. |
| `Vaccine/prds/culling&replacement/04-mobile-留种标记.md` | Breeding-stock centre searches by batch no., name, line; row shows `line - batch name · age`. |
| `Vaccine/docs/MOBILE_FIELD_LAYOUT.md` | Weaning-check home card shows line / batch. |
| `Vaccine/docs/offline-test-2026-09-03/...` | Production tasks are auto-dispatched "line -> batch". No shortest-interval test line was created, so later tasks were not reachable in one round. |
| `Vaccine/sentri-console-launchpad.html`, `线上Console侧边栏整理预览.html` | Menu mock: 生产线 "6 production lines, capacity and rhythm for gestation, farrowing, nursery, finishing". |

### Where it is in Figma and the repo

| Item | Location |
|---|---|
| Web Figma, Console setup | `hRZQbmxWMPSBZYCDkvm5dY` 🖥️ Console 初始化 > 创建生产线, 6 screens: 创建生产线（默认态）`39:3685`, （编辑态）`60:4620`, 选择模版 `60:13260`, 创建模板 `83:3082`, 创建任务 KPI 模版 `60:13365`, KPI 详情 `83:3969`. |
| Web Figma, pig houses | `qSEc0RElNQUMWYkX30jVgr` 🖥️ 猪舍、猪只 > 生产线, `1359:9198` / `1359:14129`, "content not checked". |
| Web Figma, dedicated file | `[Web] 生产线 · production`, `DlcLGqx61y44IVEvonQBJR`, cover only (`2081:7438`), nothing designed. The web index calls this the intended home of the three scattered designs. |
| Repo | No `production-line` feature in `repo:features/`. Mentioned only through `repo:features/workbench` (today's production progress). The line is a Console concept; mobile never edits it. |
| Mismatch to note | Web Figma designs the create form with a plan template and KPI template picker; live dev page (July) had the same fields but a broken coverage-section dropdown. Transfer-plan template exists in code and live page but has no web Figma screen indexed. |

---

## (d) Legacy design-system copy (`Sentri-UI/`)

### What it is

A **snapshot of the team's mobile design repo as of 2026-09-22**, with Chinese-team additions on top. Not a competing fork of the current design system.

| Evidence | Detail |
|---|---|
| Content match | 5 of 5 sampled files (`astra-surfaces.js`, `farrowing-astra-concept.js`, `sentri-components.js`, `home-astra-prototype.js`, `astra-task-overview.js`) are identical to repo commits `4d2fbd83` and `a8c87fcf` (2026-09-22, "consolidated Astra component layer"). They differ from current `main` (764 commits). |
| Mtimes | 53 files in `Sentri-UI/ux/system/` dated 2026-09-22; additions dated 2026-10-10..12. |
| `Sentri Design System/` | Identical to `repo:archive/design-system-2026-08/Sentri Design System/` except `SKILL.md` and the extra `修改日志/` folder. That August export was archived in the repo on 2026-09-28 (`388f97ad`) when `repo:ux/design-system/` replaced it. |
| `ux/system/workflows/*.html` | All six decks (cycle, health, measures, pen, place, terminal) identical to `repo:ux/system/workflows/`. |
| Not a git repo | The folder has no `.git`; `README.md` is still the "vinext-starter" boilerplate and links `ux/README.md`, which is missing. `Task references/Grid View/` is empty (repo has `任务列表`, `任务操作`, `任务筛选`, `任务详情`). |

"Astra" is the team's name for the Farrowing-led component language (`farrowing-astra-concept`, `home-astra-prototype`, `inspection-astra-concept`, `astra-surfaces`, `astra-task-overview`). It is still in the repo (about 25 files in `repo:ux/system/` plus `repo:features/*` mentions); the repo moved on to `ux/design-system/`.

### What is unique to the handover copy (absent from the repo)

| Item | Path | Date | Note |
|---|---|---|---|
| Reverse-extracted design-and-implementation rules | `Sentri-UI/Sentri Design System/SKILL.md` (1,165 lines) | 2026-09-29, revised 2026-10-10 | Rewrote a 9-line pointer into a full rulebook derived from the approved Farrowing build ("Golden Sample"), with evidence tags `[C]` code-confirmed, `[R]` repeated habit, `[I]` inferred, `[X]` existing inconsistency. Records 7 conflicts between old `readme.md`/`tokens` and the Golden Sample (primary colour `#15603f` vs ink `#20291f`, badge style, button radius, card style, title weight, big-number size, touch minimum 48 vs 44 px, icon source). The repo's equivalent is `repo:ux/design-system/` and `repo:docs/design-workflow/`. "Golden Sample" occurs nowhere in the repo. |
| Change logs | `Sentri-UI/Sentri Design System/修改日志/` (2 files), `Sentri-UI/ux/system/修改日志/` (9 files, 2026-10-10..12) | 2026-09-29..10-12 | Chinese change-log convention; repo has none. |
| Offline-sync prototype, review canvas | `Sentri-UI/ux/system/offline-sync-astra-concept.{html,css,js,test.cjs}`, `...-refinements.css`, `offline-sync-astra-study.{css,js}` | 2026-10-10..12 | Pending-upload and sync-log tabs, eight business modules (production, treatment, inspection, vaccine, sampling, transfer 转群, outbound, semen), 30-day sync log, network-failure resolve page, bilingual switch. |
| Offline-sync product page | `Sentri-UI/ux/system/offline-sync-mobile.html` | 2026-10-12 | Real phone interaction incl. a Toolbox page with "离线数据" badge (13 pending). |
| Offline specs | `ux/system/离线与同步-卡片信息布局规范.md`, `离线与同步-字号与图标规范.md` | 2026-10-12 | Card column layout (ear tag left, action type and place middle, time right), field semantics (`earTag` vs `id`, `location` vs `place`, `identifier`/`identifierType`), type scale (22/20/13/14/11/10 px). |
| Studies archived in repo, still live here | `components.html`, `sentri-components-study.*`, `task-cards-astra-prototype.*`, `task-overview-astra-study.html` | 2026-09-22 | Repo moved these to `repo:ux/archive/` on 2026-10-22 (#276). |
| Shared component layer files | `sentri-components.css/js`, `sentri-icons.js` in `ux/system/` | 2026-09-22 | Repo history shows reworks (#72, #77); the files no longer exist in `repo:ux/system/`. |

Offline sync is the one place the handover holds work the repo only has as a trace: the repo's `features/data-sync/consolidation.md` maps Zhaoxu's `codex/data-sync-split` branch onto the owner's 2026-10-18..20 design, and the repo prototype `ux/system/data-sync-astra-prototype.*` is derived from commit `8c87a9ac` (zhangzhaoxu, 2026-10-15, "Integrate Home workbench and offline sync design"). The handover files look like the earlier 10-10..12 iteration of that same line of work (the iteration dates 10-10..12 precede the 10-15 integration commit). Treat them as superseded history; the repo PRD was not compared item by item.

### What the repo has that the copy lacks

`ux/design-system/`, `ux/laws`, `ux/model`, `ux/research` (including `ops/place-identity.md`, the Transfer rationale), `features/*` (about 40 PRD + `feature.json`), `atlas/`, `docs/design-workflow/`, tests (`*.test.cjs` for sheet, surfaces, legibility, save feedback), medicines catalogue, `home-overview.css`, `data-sync-astra-prototype.*`, `feed-locale.js`, `unit-snapshot.js`.

### Two general files in `General copy/`

| File | One line |
|---|---|
| `General copy/Code_Organization_Guidelines.md` (2025-11-06) | Generic coding standard for the React code base: 500-600 line file limit, when to extract components, folder patterns, refactoring practices. No product content. |
| `General copy/Iterative_Clarity_Protocol.md` (2025-11-26) | ICP: a question-and-answer protocol an AI follows to reach full understanding of a document or topic (init, context adaptation, questioning, integration, finalisation); examples include "Start ICP for mobile transfer". Process doc, not product. |

---

## Superseded and duplicate material

| File | Date | Status | Superseded by | Note |
|---|---|---|---|---|
| `General copy/Pig_Status.md` | 2025-11-13 | current (only status model) | none | Predates Primer by 2 weeks; Primer 4.1 uses "status flags" wording, Pig_Status uses "production status". |
| `General copy/Sentri_Primer.md` | 2025-11-28 | current | none | Source for transfer types and production line. "Sale/outbound feature in development". |
| `brainstorm/&&sale.md` | 2026-04-15 | exploratory | none | Brainstorm, not approved; uses English enums. Outbound module still undefined. |
| `brainstorm/README.md`, `culling task.md`, `culling_plan_brainstorm.md`, `breeder_selection_task.md` | 2026-04-15..16 | exploratory | `Vaccine/prds/culling&replacement/` | Early culling brainstorms. |
| `.superpowers/brainstorm/79275-1781766750/content/culling-detail-*.html` | not checked | exploratory | `Vaccine/prds/culling&replacement/01-console-母猪淘汰计划.md` | Option mock-ups of the culling detail list. |
| `Sentri_Feed_Management_PRD_v2_1_中文.html` | 2026-08-12 | current (only feed PRD) | supersedes spec v1 (2026-08-05, not present) | Machine translation; English original not in handover. |
| `饲料管理/assets/diagram-*-original.png` | 2026-08-12 | duplicate | `饲料管理/assets/*-中文.svg` | English originals of the three SVGs. |
| `Vaccine/prds/inventory/修改日志/*饲料*.md` (08-11 reference-only entries, 08-12 restore entry) | 2026-08-11..12 | stale | `修改日志-2026-08-14-饲料详情移除批次库存.md` | Feed rules flipped three times in four days; only the 08-14 state is current. |
| `Inventory management/Inventory PRD/修改日志/` vs `Vaccine/prds/inventory/修改日志/` | 2026-06..09 | duplicate (partly) | n/a | Same change-log convention in two trees; the Vaccine copy has 184 files. Some feed logs reference both. |
| `Inventory management/Inventory PRD/Inventory_System.md`, `00-...`, `03-库存模块决策记录.md`, `04-...评审版`, `05-库存系统重整版PRD.md` | 2026-06-17..08-26 | superseded / older | `01-Console库存管理PRD.md`, `02-Mobile库存管理PRD.md` | Earlier rounds of the same inventory PRD; 04 is a review-version summary. |
| `General copy/Production Lines/探索式测试报告-2026-07-28-生产线.md` | 2026-07-28 | current for that build | none | Test evidence of the dev page of July; bugs likely changed since. |
| `Sentri-UI/Sentri Design System/` (all except `SKILL.md`) | 2026-09-22 | duplicate | `repo:archive/design-system-2026-08/Sentri Design System/` and `repo:ux/design-system/` | August export. |
| `Sentri-UI/ux/system/workflows/*.html` | 2026-09-22 | duplicate | `repo:ux/system/workflows/` | Byte-identical (modulo line endings). |
| `Sentri-UI/ux/system/*-astra-*.{css,js,html}` (25 files) | 2026-09-22 | stale | same names in `repo:ux/system/` | Handover is the 2026-09-22 version; repo is newer. |
| `Sentri-UI/ux/system/components.html`, `sentri-components-study.*`, `task-cards-astra-prototype.*`, `task-overview-astra-study.html` | 2026-09-22 | stale | `repo:ux/archive/` | Archived in repo 2026-10-22. |
| `Sentri-UI/ux/system/offline-sync-*`, `离线与同步-*.md`, `修改日志/` | 2026-10-10..12 | superseded | `repo:features/data-sync/PRD.md` + `consolidation.md`, `repo:ux/system/data-sync-astra-prototype.*` | Earlier iteration of the Zhaoxu offline work. |
| `Sentri-UI/Sentri Design System/SKILL.md` | 2026-10-10 | unique, current in its tree | none in repo | See (d). |
| `Sentri-UI/README.md` | 2026-09-22 | stale | n/a | Starter boilerplate; refers to missing `ux/README.md`. |
| `修改日志/修改日志-2026-08-21-线上Console侧边栏整理.md`, `...08-25-Console信息架构预览.md` and the two sidebar preview HTMLs | 2026-08-21..25 | exploratory | `Vaccine/prds/console/00-Console工作台首页-PRD.md` (2026-08-17) is the earlier "改版首页1" prototype | Sidebar reorganisations: "工作台 / 功能中心 / 设置", 6 business tabs; mock data only, PRD not changed. |

---

## Contradictions and open questions

| # | Topic | Contradiction or gap | Sources |
|---|---|---|---|
| 1 | Transfer | Single-pig transfer has "no restrictions" but culling design blocks internal transfer when the destination has no capacity. Which wins, and does capacity apply to ordinary transfers? | Primer 4.3; `brainstorm/&&sale.md` section 12; repo `features/move` open question on cross-workshop reach |
| 2 | Transfer | Status after transfer out of farm is `Left` in `Pig_Status.md`, but "`Left` or `Transferred Out` depending on final status model" in `&&sale.md`. | `General copy/Pig_Status.md`; `brainstorm/&&sale.md` section 3 |
| 3 | Pig status | Primer says sold, deceased, culled are status flags independent of category; `Pig_Status.md` defines Left and Deceased as production statuses and lists no "culled" status. Culling PRD introduces `需淘汰`/`已淘汰` labels that mean "disposal complete" = Left. | Primer 4.1; Pig_Status; culling PRD 03 |
| 4 | Pig status | Lactating -> Empty fires when the sow is "no longer in a pen with piglets": a location move can change status. Not stated whether a transfer out of the farrowing pen triggers it or only a recorded wean. | `Pig_Status.md` 5.3 |
| 5 | Transfer | No spec for transfer-plan rules (what triggers, what is moved, destination choice, who executes), nor for 转群单 fields beyond "source pen, destination pen, number moved". Only an Onboarding demo (`prompt()` for plan name). | `StepProductionLine.tsx` line 82; launchpad mock |
| 6 | Transfer | Offline test lists `transferTask` as an offline store but marks 转舍 as not a line-dispatched task; whether transfer tasks follow the same Planning/In-progress/Ended lifecycle and "no skip, no delete" is unwritten. | offline test report line 53; Primer 5.2 |
| 7 | Transfer | Records on transfer: handover says only "transfers update location and keep history". The pen-level records choice (Stays / Goes / Both) exists only in the Sentri-UI deck and repo research; production's own path B asks Move / Copy / Submit. | `place.html`; `repo:ux/research/ops/place-identity.md` |
| 8 | Transfer | Console says 转舍 is a "转群单" tracked with counts; mobile deck designs a per-pig sheet. How a Console order becomes mobile tasks is not described. | launchpad vs `place.html` |
| 9 | Exit | Primer: sale/outbound is "in development"; `&&sale.md` assumes it exists ("if outbound task type already supports it") and also designs `SLAUGHTER_OR_DISPOSAL`, `PENDING_OUTBOUND`. No PRD for 出场任务/出场数据. | Primer 5.5; `&&sale.md`; launchpad |
| 10 | Feed vs Inventory | Feed PRD: feed has **no stock**, only "projected balance (purchases - theoretical)", optional counts, never labelled "inventory". Inventory 01 PRD: feed has `当前库存` and 库存价值 in detail overview (line 435) and trend, but 03 doc and 08-14 log say 预计库存 and no batches. Backend 06: feed stock-out deducts planned quantity from SKU stock on schedule. Three different models of the same stock. | PRD section 12.2; `01-Console库存管理PRD.md` lines 364, 435; `03-饲料预计可用天数.md`; `06-库存出库后端逻辑.md` 1.1 |
| 11 | Feed | Days-of-use averages 30 days of business usage; the PRD's cost and variance model uses curve x head-days. Which usage feeds the Console number (actual stock-out or planned curve) is unstated. 06 says planned quantity is deducted, so the "usage" is the plan, not observation. | `03-饲料预计可用天数.md`; `06` 1.1.3; PRD section 12.3 |
| 12 | Feed | Feed plan (`feedPlanId`) is a backend object in `06` but no PRD defines it; the Feed PRD defines `feeding_program` and `feeding_assignment` instead. Are they the same? | `06-库存出库后端逻辑.md`; PRD 9.4-9.5 |
| 13 | Feed | Feed unit conversion `1吨 = xxL` is mandatory for feed items so feeder-machine litres can be converted; Feed PRD explicitly assumes no feeder machine. | Inventory 01/02 lines 547, 235; PRD sections 2 and 12 |
| 14 | Feed | Feed PRD is v2.1 "consensus draft", owner "Product"; its nine open decisions are all open. English source and v1 not in handover; some cross-references in the translated text look inconsistent (for example the persistence check is cited as section 12.6 in 9.16, but is described in 12.4). | PRD sections 12, 17 |
| 15 | Feed | No screens exist for any of this (web Figma 饲喂计划 is empty). Repo `feed-plan` covers the mobile editor only and calls inventory/formula authoring "management screens" that do not exist yet. | web index line 23; `repo:features/feed-plan/PRD.md` |
| 16 | Production line | Lifecycle (stop, restore, delete, version) undefined; July dev page had no status column or stop action and allowed orphan batches. | test report BUG-01, BUG-10, section 6 |
| 17 | Production line | Week definition: UI uses non-ISO numbering at year end and leap years; Primer says nothing on week standard. | test report BUG-02, BUG-08 |
| 18 | Production line | Line name restricted to digits on the live page; Primer, Console launchpad and mobile cards show names like `生产线A01`. Batch number uniqueness (per line or global) undecided. | test report BUG-09, BUG-11; `04-mobile-留种标记.md` line 136 |
| 19 | Production line | Three Figma homes (Console setup, 猪舍、猪只, empty `[Web] 生产线`); web index says the empty file is intended home, nothing drawn. | web index lines 21 and 32 |
| 20 | Legacy copy | `Sentri-UI/README.md` links missing `ux/README.md`; `Task references/Grid View/` empty; offline-sync files have no repo history, so authorship and branch cannot be confirmed from the repo alone (guess: `codex/data-sync-split`, Zhaoxu). | handover tree; `repo:features/data-sync/consolidation.md` |
| 21 | Legacy copy | `SKILL.md` ranks `ux/system` Astra code above the older `readme.md`/`tokens`; the repo made `ux/design-system/` the rule source. Rules in `SKILL.md` (for example primary action ink `#20291f`, 44 px touch minimum) were not compared against the repo's current legibility and footer rules; check before reuse. | `SKILL.md` sections 0 and "已知不一致"; repo memory notes on legibility |

## Corrections found while writing the workflow specs (2026-11-03)

- The repo's `features/workbench` already shows withdrawal in red on outbound and transfer rows. No handover exit source states that rule.
- The feed PRD has two inconsistent cross-references in the translated text: the persistence check cites s12.6 but is described in s12.4.
