# Inventory (库存)

Inventory is the stock ledger for the farm's materials (物料): feed, medicine (vaccine / veterinary drug / health supplement), semen, and "other". It is a **Console-first** module (the manager and storekeeper do receiving, stocktake, scrapping, ledger review, differences and finance views) with a thin **Mobile** companion in the toolbox (look up stock, receive goods, count stock; no issue/outbound, no adjustments). Stock is kept per **material + batch (批次)**, shown per material, deducted **FEFO** (first-expire-first-out), and may go **negative at material level** instead of blocking production tasks.

Source of truth, by topic (no single doc is fully current; see "Contradictions"):
- Console: the changelogs through 2026-08-14 plus the runnable prototype `Vaccine/src/components/inventory/` are the newest; `Inventory management/Inventory PRD/01-Console库存管理PRD.md` (header 2026-08-11) is the most detailed prose but is internally inconsistent; `Inventory management/Inventory PRD/05-库存系统重整版PRD.md` (2026-08-26) is declared "the unified baseline" but still carries stale pages (see Section 6).
- Mobile: `Inventory management/Inventory PRD/02-Mobile库存管理PRD.md` (2026-09-09) is current and the newest doc in the area.
- Outbound / deduction back-end: `Inventory management/Inventory PRD/06-库存出库后端逻辑.md` (2026-08-19), event-driven.
- Stocktake differences (legacy/pending): `Vaccine/prds/inventory/02-盘点差异自动处理规则.md`. Receipts list: `Vaccine/prds/inventory/04-统一入库记录-PRD.md`. Feed days-of-supply: `Vaccine/prds/inventory/03-饲料预计可用天数.md`.

Figma: **none**. The web file "[Web] 库存管理 · inventory" is an empty cover; the only stock-adjacent frames are 药品管理 drafts and 物资消杀 (disinfection). The repo (`features/`) has **no inventory feature**; `treat` and `feed-plan` explicitly defer stock to "future inventory".

---

## Current flow

Date stamps in brackets are the decision dates from the changelogs (`Vaccine/prds/inventory/修改日志/…` and `Inventory management/Inventory PRD/修改日志/…`, 99 of which are in both places).

### Shared model (both platforms)

| Topic | Rule | Source |
|---|---|---|
| Open categories (一级分类) | 饲料 feed, 药品 medicine, 精液 semen, 其他 other. 消耗品 consumables and 工具 tools are kept in data only (no new items, no tab, not on Mobile). Tab order 饲料 / 药品 / 精液 / 其他 [08-12]. | `Inventory management/Inventory PRD/05-库存系统重整版PRD.md` s5; `Vaccine/prds/inventory/修改日志/修改日志-2026-08-07-移除消耗品与工具品类.md`; `…-2026-08-12-库存分类Tab排序.md`; `Vaccine/src/components/inventory/inventoryData.ts` (`inventoryEnabledCategories`) |
| Medicine sub-class | One level: 疫苗 vaccine / 兽药 veterinary drug / 保健品 supplement (`medicineClass`). Shown as "药品 · 疫苗". Vaccine and drug have extra fields (dose, interval, withdrawal period). [07-08] | `Vaccine/prds/inventory/修改日志/修改日志-2026-07-08-药品分类一级化.md`; code `InventoryMedicineClass` |
| Material master (物料) | Name (zh/en optional), brand, category, accounting unit (核算单位, locked once stock exists), unit conversions (e.g. 1 box = 10 bottles; **feed must include 1吨 = xxL** for feed machines that count litres), status 启用中 / 已停用. **No delete**; stop-use only. Stop-use is blocked if a plan references the material (list shown, links to plan). | `Inventory management/Inventory PRD/01-Console库存管理PRD.md` s5.1, s6.6; `…-2026-07-29-单位换算盘点与物料停用校验.md`; `Vaccine/prds/vaccine prd/01-疫苗管理.md` (Settings > 物料管理) |
| Batch (批次) | Created on receiving. System-generated batch no. (by receive date, never typed, hidden on the receive form), expiry date, total purchase price (元), supplier (+ optional phone), original qty + unit, converted accounting qty, status 正常 / 临期 / 过期 / 已耗尽. | `01-Console库存管理PRD.md` s5.2, s9 |
| Deduction | FEFO across batches that still have stock and are not exhausted. Not enough stock: deduct what exists, put the shortfall on **material-level negative stock** (no fake batch). Production is never blocked. | `01-Console库存管理PRD.md` s7.2, s10; `06-库存出库后端逻辑.md` s1, s5.4 |
| Expired batch | **Not auto-frozen**; keeps taking part in FEFO and loss deductions until someone scraps it. No "restore use" action. | `Inventory management/Inventory PRD/03-库存模块决策记录.md` D-012; `…-2026-06-26-移除过期报废独立页面与自动冻结.md`; `…-2026-06-29-过期批次恢复使用移除.md` |
| Ledger (库存流水) | Every stock change writes a row. Types: 采购入库, 业务消耗, 消耗冲销, 入库更正, 盘盈, 盘亏, 盘点调整, 报废 (+ 后台库存调整 later). Row shows change with up/down icon, balance, type tag, operator/time. | `01-Console库存管理PRD.md` s5.3, s8.8; `…-2026-08-14-库存流水操作人时间字段.md` |
| Risks (derived, not stored) | 负库存 > 已过期 > 临期. **No low-stock / safety-stock** since [07-08]. | `…-2026-07-08-库存安全库存移除与入库草稿提示.md`; prototype has no safety-stock code |
| Stocktake scope | By **material total**, never by batch; **only 药品 and 精液** [08-07]. Unit defaults to the last receiving unit, switchable among convertible units. | `…-2026-08-07-盘点限定药品与精液.md`; `01-Console库存管理PRD.md` s8.11 |
| Cost basis | **Undecided** (moving weighted average vs actual-batch cost). Differences needing money are flagged 财务待确认, valued by estimate. | `03-库存模块决策记录.md` s2 |

### Console flow

Navigation (prototype `Vaccine/src/App.tsx`): sidebar **库存 > 库存管理 / 入库 / 盘点 / 入库记录**, and **财务 > 财务分析**. The 业务中心 (business centre) 库存 category lists six entries: 库存管理, 库存流水, 盘点记录, 入库记录, 入库, 盘点 [08-14]. Settings > **物料管理** holds the full material master (with Excel batch add). The older per-category entries 药物管理 / 精液管理 / 饲料管理 were removed from the business centre [08-14] but their routes remain.

**C1. Inventory home (库存管理)**
1. Top: **库存风险** list across *all* categories, filter chips 已过期 / 临期库存 / 负库存 with counts; top 5 by priority, click chip for all; list/tab/search filters never change it.
2. Row actions: 负库存 -> **修正** and **发起盘点**; 临期 -> 发起盘点 (药品/精液 only); 已过期 -> go to material detail and scrap. Row click opens material detail. Feed rows have no stocktake entry.
3. Below: category tabs 饲料 / 药品 / 精液 / 其他, a list toolbar (search, material status 启用中/已停用/全部 default 启用中, 确认 button; Enter = confirm), then the list.
4. List per material (medicine, other, feed): name + brand + status, [medicine: 药品分类], current stock with health bar, 30-day stock sparkline (hover = daily usage line + total/avg/peak), nearest expiry, status. **Feed**: 预计库存 label, 预计使用天数 (floor(stock / 30-day average daily use), colour bands <=3 red, 4-7 orange, 8-15 yellow, >15 green, "—" when no use), no batch module in detail [08-14]. **Semen**: one row per batch (公猪 ID / breed, available = stock - reserved, storage place, expiry).
5. Select one or more enabled materials -> **生成采购单** (button only appears once something is ticked): editor shows last receive date/qty, current stock and days-of-supply, qty defaults to last receive; confirm -> purchase-order detail (screenshot-friendly, **导出 Excel**). Does not touch stock; goods still arrive through 入库. Not for semen.
6. Top-right shortcuts: 库存记录 (ledger + stocktake records), 入库, 发起盘点. **No 出库 and no 盘点差异 here.**

**C2. Receive goods (入库) — one workbench page** [07-07 .. 08-10]
1. Click 入库 -> single page, sticky footer with count of materials, total amount, 取消 / 清空 / 确认入库. Unsaved draft is restored with a light "已恢复上次未提交草稿" notice.
2. Search box (name, English name, brand, SKU, pinyin) adds a material row; no category pre-pick. Existing materials are read-only for master data; stopped materials are not offered.
3. No match -> "新建物料：xxx" in the dropdown -> quick-create dialog: name, brand, category (+ medicine class), unit, **unit conversions** (mandatory only for feed, with 1吨 = xxL), category-specific fields (vaccine: administration method required). Material + batch are created together on submit; incomplete profiles get a "资料待完善" tag.
4. Row fields: quantity (focus, Enter jumps qty -> amount -> expiry), **unit dropdown limited to the material's accounting unit and convertible units** (no free units), total amount (qty x unit price auto-linked both ways), **expiry (保质期至) required**, **supplier required per row**, supplier phone optional. No warehouse, location, batch no., production date, safety stock.
5. 确认入库 -> preview/confirm (read-only header, unit price per entered unit, total only) -> submit. Result: new batch(es) + 采购入库 ledger row per line; new materials appear under their category tab.
6. Prototype header carries 入库日期, 采购单号, 备注 (no warehouse); the 08-26 PRD still lists 仓库 as required (see contradictions).

**C3. Receipts (入库记录) — one page for 药品 / 精液 / 饲料**
1. One row = one receipt (入库单) in an expandable table; collapsed by default, several can be open, lazy-rendered, no drawer. Not a ledger and not a stock list.
2. Filters (staged, apply with 确认): search (material name; semen also boar ID / breed), time (default last 30 days), category 全部/药品/精液/饲料, type 全部/采购入库/盘盈入库.
3. Mixed receipts show once under 全部; under a single category the lines are trimmed first, then item count and amount are recomputed.
4. Header: type tag, item count, total amount (not for 盘盈入库), remark, operator/date. No status, no warehouse, no SKU count, no order number shown or searchable [08-10]. Expanded: basic info + material table (name, category, brand, qty, unit, total, expiry, supplier, phone; semen adds boar ID / breed, date column becomes 有效期至) + "共 N 项物料". No stats block, no operation log.
5. Feed receipts: per `Vaccine/prds/inventory/04-统一入库记录-PRD.md` feed only records the receipt fact (no batch/ledger/stock); the 08-12 changelog restored batches for feed (see contradictions).

**C4. Manual issue (出库) — entry on 财务 > 财务分析**
1. Button top-right of 财务分析. Page lists all enabled materials (search + category filter in one row); user fills quantity per material plus 领用用途 (required) and remark (<=200). Unit is the accounting unit (fixed). Shows current stock so a negative result is visible.
2. Submit -> 出库清单 confirm -> 出库单详情 (no., time, user, purpose, lines, ledger rows made). System fills batch (FEFO), user, date; shortfall -> material negative stock, ledger row with empty batch. Toast just says "出库成功".
3. Status: the 08-19 back-end doc says manual issue is **not** part of the event-driven design and must be specified separately if kept.

**C5. Stocktake (盘点) -> direct adjustment**
1. 发起盘点 or sidebar 盘点 opens the full-list page directly (no scope dialog, no modes). Only 药品/精液 rows. Risk entry from a risk row pre-filters to that material.
2. Columns: 名称, 分类, 品牌, 当前库存 (shown in last receive unit + accounting qty in brackets; anomaly line under the number such as 临期 850ml (46%); hover = recent stock changes), 近30天使用 (sparkline + total), 盘点库存 (input, empty = no change). Search, category/anomaly filters, sorting. No location, no spec.
3. 提交盘点 -> 盘点清单 / "盘点差异确认": only changed rows, using neutral words 实盘多出 / 实盘少了 (not 盘盈/盘亏). Counter never explains the difference.
4. 确认 -> new stock applies at once; 盘点调整 ledger rows written; 盘点已完成 page. Counting with no changes can be completed without ledger rows.
5. 盘点记录 (tab of 库存记录): one row per stocktake, expand to material table (系统库存, 实际库存, 差异 with colour + arrow, link "查看库存流水" to the ledger prefiltered 30 days back). No stocktake number shown.

**C6. Negative-stock correction (修正透支记录)** [08-03 .. 08-05]
1. From a negative-stock risk row click 修正. Dialog shows material, stock, overdraft amount, overdraft start date. Three ways: (a) 修正物料库存 -> opens stocktake with only this material; (b) 修正实际用料 -> pick the material actually used (searchable, any SKU in stock list except this one, own unit), qty <= overdraft; writes 消耗冲销 on the original and 业务消耗 (FEFO) on the real one; confirm risk if the substitute goes negative; (c) 补录漏记入库 -> opens 入库 with the material pre-filled.
2. Does not remember a "default material" (that checkbox was removed 08-05).

**C7. Expired batch scrap (报废)**
1. Material detail > 批次库存 table, button 报废 on a batch with stock. Mandatory confirm dialog "报废处理": material, batch, supplier batch no., stock, expiry; quantity (default all, partial allowed, >0 and <= batch stock), reason (过期/变质, 受潮/发霉, 外包装破损/漏包, 日常损耗/误差修正), handling method, optional photo.
2. Confirm -> batch reduced, 报废 ledger row, batch becomes 已耗尽 when zero and the home risk closes. Feed detail has no batch table, hence no scrap entry for feed [08-14].

**C8. Material detail** — tabs 详情信息 / 库存流水 (ledger filtered to this material, full columns). Sections: basic info, stock overview, 30/90-day trend (not for feed since 08-10 wording; see contradictions), batch table (药品/精液/其他 only), risks, consumption analysis. Top-right 编辑物料, 停用/启用. Navigation back is by breadcrumb 业务中心 / … / 物料详情 only (no local back buttons).

**C9. Ledger and records (库存记录)** — tabs 库存流水 / 盘点记录. Ledger filters: date, material/brand/batch search, type; sort by time default newest first; list view no longer shows a batch column [08-14] (detail ledger still does).

**C10. 财务分析** [07-06] — three charts moved out of inventory home: 库存金额占比 (click a category to filter the others), 本月消耗金额 Top 物料, 库存消耗趋势 (7d/30d/this month/last month/custom + category). Top-right buttons: 出库 and 盘点差异 (with a pending count).

**C11. 盘点差异处理 (legacy / pending differences only)** — reached from 财务分析. In the prototype a fresh stocktake no longer produces differences (it adjusts directly); the page only works on seeded/pending differences. Two tabs 待处理 / 已处理 (columns: material, category, effective book stock, counted stock, difference, result, counter/time, [handled: method, handler/time]). 处理差异 drawer "盘点差异分析 + 处理": first **库存变动（近30天）** (current stock, last stocktake, last 5 ledger rows, 查看更多 -> material ledger), then method + reason, **no batch picker**. Six methods:

| Direction | Method | Ledger type | Batch landing |
|---|---|---|---|
| surplus | 回补原消耗 | 消耗冲销 (+) | latest-used batch first, then earlier |
| surplus | 更正入库数量（金额不变） | 入库更正 (+) | system-chosen existing batch |
| surplus | 补录入库数量和金额 | 入库更正 (+) | system-chosen existing batch, amount recorded |
| shortage | 补记业务消耗 / 出库 | 业务消耗 (-) | FEFO |
| shortage | 更正入库多录 | 入库更正 (-) | FEFO |
| shortage | 报废 / 损耗处理 | 报废 (-) | FEFO |

Auto rules (from `Vaccine/prds/inventory/02-盘点差异自动处理规则.md`): effective book = snapshot + receipts - issues during the count; zero adjusted difference = no record; within tolerance (A 药品·疫苗兽药 +/-2% or 1 smallest pack unit, whichever larger; B 饲料/消耗品/保健品 +/-5%; C 工具/其他 +/-5% or 1 pack unit) small shortage is auto-deducted FEFO, small surplus auto-returns to the latest-used batch (as 消耗冲销, never a new batch) or goes to manual if none found; over tolerance goes to manual with no suggestion. Note this doc still names the old A/B/C groups (tools/consumables) and "疫苗兽药" naming.

### Mobile flow (toolbox, 库存 group)

Three tiles in a 3-column row: **查看库存, 入库, 盘点** (no outbound, no "new material" tile). Each opens its own page with sticky title bar, 44px back button, safe areas. Source: `Inventory management/Inventory PRD/02-Mobile库存管理PRD.md`, `Vaccine/prds/inventory/修改日志/修改日志-2026-08-20-Mobile入库UI重构.md`, `…-2026-08-25-Mobile盘点对齐Console.md`, `…-2026-08-26-Mobile库存工具箱评审优化.md`, `…-2026-09-09-Mobile盘点筛选抽屉与列表规范.md`.

**M1. 查看库存 (read only)**
1. Enabled materials in 饲料/药品/精液/其他 only. Search (case-insensitive name/brand, clear button), horizontal chips 全部/饲料/药品/精液/其他.
2. Row: name, brand, category, current stock (package unit first with accounting qty in brackets, e.g. 20.3袋（20300kg）), status tag only for negative stock. Negative first, then category order, then name. No batches.
3. Negative item that can be counted shows **去盘点修正** -> straight to that item's count page, returns to the same list context. Empty state with 清除筛选.

**M2. 入库 (receive)**
1. Pick a category (饲料/药品/精液/其他); **each category keeps its own draft**, switching never clears; chips show draft counts.
2. Add entries. Per entry: search existing material, or (only when nothing matches and the user taps **新建该物料**) fill the minimal profile and tap **完成物料信息** (front-end only; the profile is created with the batch in one transaction). Until done, quantity fields and "add next" stay hidden; after done, profile collapses to a summary and quantity gets focus.
3. Entry fields: quantity, unit (configured units only), expiry (already-expired allowed with a warning), total purchase price, supplier. Status badges 待补齐 / 可提交. Top shows counts of ready vs incomplete.
4. Main button reads `请先填写入库信息 / 还需补齐 X 条` until valid, then `下一步，确认入库`; review page "确认本次入库" lists per line material, brand, qty, converted stock, expiry, amount, supplier; footer 返回修改 / 确认完成入库. Only complete entries submit; incomplete drafts stay and the user is told.
5. Result page lists each line and converted stock; actions 继续补齐 or 继续入库. Creates material (if new), batches, 采购入库 ledger rows.

**M3. 盘点 (count)** — aligned to Console [08-25]
1. Opens a **待盘点物料** list (max 6, "异常优先": negative > expired > near-expiry > none, then 30-day use, name). 药品 and 精液 only. One search box + one funnel button; funnel opens a bottom drawer (category 全部/药品/精液, risk 全部/负库存/临期/已过期), staged until 应用筛选; 重置 resets the draft only, page-level 清除 clears applied filters; summary line + count badge show active filters. Searching or filtering shows all matches (not limited to 6).
2. Rows form a continuous white ledger list (name, brand, category, risk, current stock, 30-day use, filled mark).
3. Tap a material -> single-material page: current stock, 30-day use, risk, actual-stock input with unit switch; 保存返回 or 保存并下一个. Equal to current = marked checked but not in the final list.
4. Bottom bar: filled count, changed count -> 盘点清单 (changed items only) -> confirm. Stock updates immediately, one 盘点调整 ledger row per item; completion page 盘点已完成 (counts checked/adjusted/surplus/shortage, stocktake no.), actions 返回工作台 / 再盘一次. No changes at all: can still finish "完成本次核对" with no ledger rows. Leaving with an unsaved single-item draft asks for confirmation. No reason picking, no differences page, no locations.

**M4. Link to tasks** — Mobile task pages are not issue pages: vaccination, treatment, feeding, breeding submissions deduct stock automatically (material ID, amount, unit from the material's unit system) and may drive stock negative. Back-end timing is in `06-库存出库后端逻辑.md` (below).

### Back-end deduction rules (event-driven, 2026-08-19)

| Source | Trigger | Quantity | businessType |
|---|---|---|---|
| Feed plan | scheduled run time of the day arrives (not on create/publish) | the day's planned qty per SKU line | `FEED_PLAN_CONSUMPTION` |
| Vaccine task | task COMPLETED | sum of confirmed actual usage (not plan; early end = only what was used) | `VACCINE_USAGE` |
| Veterinary treatment task | task completed or ended early | per-pig actual treatment records summed (never max prescription) | `VETERINARY_DRUG_USAGE` |
| Stocktake shortage | difference confirmed | abs(counted - effective book) | `STOCKTAKE_LOSS` (not counted as consumption) |
| Scrap | scrap confirmed (request alone changes nothing) | confirmed qty, a specific batch for batch materials | `SCRAP` |

Common: idempotency key per source, one transaction for stock + batch + negative stock + source state + change detail, unit that cannot convert rejects the whole event, FEFO for batch materials, feed deducts SKU total (batch assignment by the system if kept), 11 acceptance cases listed. Gaps flagged in the doc: prototype is front-end-only, manual issue unresolved, reversal rules, whether receipts offset negative stock, cost basis.

---

## Versions

Order = decision date. "Superseded" says what the line replaced. Changelog file names omit the `修改日志-` prefix; all live in `Vaccine/prds/inventory/修改日志/` unless marked (IM) = `Inventory management/Inventory PRD/修改日志/`.

| Date | Decision | Superseded / reversed | Source |
|---|---|---|---|
| 2026-06-17 | Console + Mobile Word PRDs become the dev baseline; decisions D-001..D-005 recorded (negative stock at material level, expiry action required, tools kept, **semen excluded**). Old `Inventory_System.md` demoted to history. | Original English `Inventory_System.md` (4 categories Feed/Medication/Tool/Supply, weighted-average costing, tool check-out, FEFO with manual lot choice, expired = blocked) | (IM) `2026-06-17-库存PRD基准.md`; `Inventory management/Inventory PRD/Inventory_System.md` |
| 06-19..06-20 | Material detail page; dashboard layout; receive modal with structured package spec (`1瓶=100ml`); safety stock optional; edit + stop/enable material | free-text conversions | (IM) `2026-06-19-物料详情页.md`, `2026-06-20-采购入库结构化包装规格.md`, `2026-06-20-编辑物料与停启用.md` |
| 06-24 | Manual issue added; stocktake loop built as a **modal with 4 modes** (exception / specified / category / all) -> scope page -> task -> differences with mandatory reasons -> adjustment; **expired batch auto-frozen** with scrap flow; nav split 库存管理 / 库存流水 / 盘点记录 / 报废记录; semen category removed (7 categories: 饲料 兽药 疫苗 消毒用品 保健品 工具 其他) | — | `2026-06-24-库存手工出库.md`, `2026-06-24-库存盘点流程.md`, `2026-06-24-过期报废闭环.md`, `2026-06-24-库存导航结构调整.md`, `2026-06-24-移除精液库存分类.md` |
| 06-25 | Expired batch actions: 报废 or 恢复使用 | auto-frozen = can't deduct | `2026-06-25-过期批次处理方式.md` |
| 06-26 | Submitting a count **no longer adjusts stock**; creates pending differences handled on a dedicated page with 8 sources, 财务待确认 flag; separate 过期/报废 page and auto-freeze **removed** (scrap only from material detail) | direct adjustment from 06-24; freeze/restore from 06-24..25 | `2026-06-26-盘点差异闭环.md`, `2026-06-26-移除过期报废独立页面与自动冻结.md`, `2026-06-29-过期批次恢复使用移除.md` |
| 06-29 | Ledger removed from sidebar -> button on home; "入库2" card-style batch receive; 物料管理 replaces 药品管理 in Settings with shared material model + Excel batch add; tolerance-based auto-handling of small differences | sidebar 库存流水 | `2026-06-29-库存流水入口调整.md`, `2026-06-29-入库2卡片式批量入库页重构.md`, `2026-06-29-盘点小差异自动处理实现.md`; `Vaccine/prds/vaccine prd/修改日志/修改日志-2026-06-29-物料管理批量添加.md` |
| 06-30 | Small surplus = **return to original consumption batch** (消耗冲销), never a new surplus batch; over-tolerance goes to manual with no system suggestion; method/reason split in two steps | auto "原因不明盘盈" batch | `2026-06-30-小盘盈成本口径修正.md`, `2026-06-30-大差异人工处理口径.md`, `2026-06-30-盘点差异处理方式与原因拆分方案.md` |
| 07-01 | Manual actions cut to 3 surplus + 3 shortage, **batch picker removed** (system lands batch) | 8-source list + batch selector | `2026-07-01-盘点差异人工动作与批次落点.md` |
| 07-06 | **Five categories** 饲料 药品 消耗品 工具 其他 (药品 -> 疫苗兽药/保健品 -> 疫苗/兽药); 发起盘点 goes straight to the **full-material list** (modes and "all" removed; storage location shown for finding goods); 盘点差异 + 出库 moved to 财务 > 财务分析 and three charts moved there too; feed 30-day trend chart on home | 7 categories; stocktake modal; modes | `2026-07-06-物料分类五类目规范.md`, (IM) `2026-07-06-发起盘点流程直达全量清单.md`, `2026-07-06-盘点位置与全部盘点移除.md`, `2026-07-06-盘点差异迁移至财务分析.md`, `2026-07-06-财务分析图表迁移.md`, `2026-07-06-饲料库存余量趋势.md` |
| 07-07 | Receive flow v2 = doc-style (header: warehouse, supplier, date, PO no., remark; search-first rows; expiry/price/supplier optional); batch issue page (list all, fill qty, 出库清单 -> 出库单详情); purchase-order generation from home; `05` + `INVENTORY_CODE_STRUCTURE.md` written | single-item issue modal; per-row required fields | `2026-07-07-入库流程交互优化V2.md`, `2026-07-07-入库页搜索优先与入库单预览.md`, `2026-07-07-批量出库页面.md`, (IM) `2026-07-07-首页生成采购单.md`, (IM) `2026-07-07-库存系统结构梳理与PRD重整.md` |
| 07-08 | Receive page = **single workbench**; **safety stock and low-stock risk removed**; **medicine collapsed to one level** (疫苗/兽药/保健品); storage location field removed everywhere; feed 适用猪只与阶段 removed; material detail redesigned (overview + trend + consumption analysis) | 3-level medicine class (07-06); low stock; location (07-06 stocktake) | `2026-07-08-库存安全库存移除与入库草稿提示.md`, `2026-07-08-药品分类一级化.md`, `2026-07-08-移除存放位置字段.md`, `2026-07-08-入库页单一工作台UI.md` |
| 07-09/07-10 | Receive row gets **supplier required, phone optional**; unit conversion required at quick-create (feed 1吨=xxL); medicine "days of supply" added then **withdrawn** (unstable consumption); issue entry moved to 财务分析; ledger/records get 盘点记录 tab | 07-07 optional supplier; medicine days-of-supply (07-09) | `2026-07-09-入库明细单位供应商.md`, `2026-07-10-入库新建物料单位换算.md`, `2026-07-09-药品预计可用天数.md` -> `2026-07-10-药品列表移除预计可用天数.md`, `2026-07-10-出库入口迁移至财务分析.md`, `2026-07-10-库存流水盘点记录Tab.md` |
| 07-13 | Receipts (入库单) go into 库存记录 tab; no status, no warehouse, no stats/log; types 采购入库 / 盘盈入库 only; unit selectable among convertible units again | standalone 入库单据 button (07-10); read-only unit (07-09) | `2026-07-13-入库单并入库存记录Tab.md`, `2026-07-13-入库单类型与明细字段.md`, `2026-07-13-入库单移除仓库与汇总统计.md`, `2026-07-13-入库单位可选换算单位.md` |
| 07-29 | Home redesigned as KPI/risk-card workbench **then reverted the same day** to the risk list; feed trend module removed; unit conversion mandatory only for feed; count unit switch; stop-use blocked by plan references | KPI cards (same day); all-category conversion (07-10) | `2026-07-29-库存工作台首页信息架构.md` -> `2026-07-29-库存首页恢复风险列表.md`, `2026-07-29-单位换算盘点与物料停用校验.md` |
| 08-03..08-05 | Overdraft correction: 修正 / 发起盘点, then three ways (fix stock, fix actual material, add missing receipt) | stocktake-only handling | `2026-08-03-负库存透支记录修正.md`, `2026-08-04-负库存盘点入口恢复.md`, `2026-08-05-负库存实际用料选择.md` |
| 08-05 | Categories narrowed to **药品 + 精液 only**; semen listed per batch (boar ID, reserved, cold storage) | 5 categories | `2026-08-05-库存分类收敛药品精液.md` |
| 08-06 | Nav: 药品库存 / 精液库存 split, 入库 and 盘点 get own menus, receipts split into 药品入库记录 / 精液入库记录 | single 库存管理; 入库单 tab inside 库存记录 | `2026-08-06-库存子菜单拆分药品精液.md`, `2026-08-06-入库与盘点独立导航页.md`, `2026-08-06-入库记录拆分药品精液.md` |
| 08-07 | Restored all six, then **four open categories** 饲料 药品 精液 其他 (消耗品/工具 history-only); risks pinned above and independent of tabs; stocktake limited to 药品/精液 | 08-05 two-category scope; 08-06 split menus (merged back to 库存管理) | `2026-08-07-恢复库存全部品类.md`, `2026-08-07-移除消耗品与工具品类.md`, `2026-08-07-库存风险置顶并独立分类筛选.md`, `2026-08-07-盘点限定药品与精液.md` |
| 08-10 | **One 入库记录** page (药品/精液/饲料 filter, mixed receipt rules); order number hidden; category tag dropped from header | two receipt pages (08-06) | `2026-08-10-统一入库记录.md`, `2026-08-10-入库记录视觉分组与隐藏单号.md`, `2026-08-10-入库记录移除分类标签.md`; `Vaccine/prds/inventory/04-统一入库记录-PRD.md` |
| 08-11 | Business centre gets 药物管理 / 精液管理 / 饲料管理 (each with 库存管理 / 入库记录 tabs); **feed becomes "reference only"** (no batches, risk, stocktake; receipt creates no stock); breadcrumbs unified; whole module restyled | feed as managed stock | `Vaccine/prds/console/修改日志/修改日志-2026-08-11-业务中心物资管理分类.md`, `…-2026-08-11-业务中心新增饲料管理.md`, `2026-08-11-饲料管理库存入口.md`, `2026-08-11-饲料移除库存风险.md`, `2026-08-11-库存面包屑与返回入口统一.md` |
| 08-12 | **Feed restored** to full stock (current stock, batches, risk, ledger, receipt creates batch); tab order 饲料 药品 精液 其他; "预计库存" label; 08-13 console entries merged under 库存, 08-14 the three category entries removed | 08-11 feed-as-reference (partly) | `2026-08-12-恢复饲料库存属性与详情.md`, `2026-08-12-总库存恢复饲料Tab.md`, `2026-08-12-饲料预计库存文案.md`; `Vaccine/prds/console/修改日志/修改日志-2026-08-13-删除业务中心物资管理Tab.md`, `…-2026-08-14-删除库存分类管理入口.md` |
| 08-14 | Feed detail drops the **batch module** again (and 08-10: trend + expiry columns on feed list), list header "预计存量", hover = last stocktake time; 盘盈入库 has no amount; ledger list drops batch column | partly 08-12 | `2026-08-14-饲料详情移除批次库存.md`, `2026-08-14-库存预计存量与盘点提示.md`, `2026-08-14-盘盈入库移除金额.md`, `2026-08-14-库存流水移除批次字段.md`, `2026-08-10-饲料列表采购单与字段精简.md` |
| 08-19 | Back-end outbound rules written, event-driven (feed plan, vaccine task, treatment task, stocktake loss, scrap) | Console-centred "manual issue" as the main outbound | (IM) `2026-08-19-库存出库后端逻辑文档.md`; `06-库存出库后端逻辑.md` |
| 08-20..08-26 | Mobile receive redesigned (lightweight list, draft badges); toolbox group = 入库 / 盘点 / 查看库存; Mobile stocktake aligned with Console (direct list, funnel, per-item page, no mode/scope step); review round: separated search vs create, 完成物料信息, per-category drafts, review page. `05` re-issued 2026-08-26 | 07-03 Mobile with modes, location, differences page | `2026-08-20-Mobile入库UI重构.md`, `2026-08-25-Mobile盘点对齐Console.md`, `2026-08-26-Mobile库存工具箱评审优化.md`; `05-库存系统重整版PRD.md` |
| 09-09 | Mobile stocktake: funnel drawer with staged filters, continuous ledger list, safe-area rules | two always-on filter rows | (IM) `2026-09-09-Mobile盘点筛选抽屉与列表规范.md` |

Unchanged since 06-17 and still open: cost basis; whether a later receipt offsets material-level negative stock; scrap cost basis; batch-level stocktake (deferred "advanced").

---

## Superseded and duplicate material

Dates are the document's own "更新时间" / changelog date; file modified times in the handover are copy dates and unreliable (e.g. `01` was touched 2026-10-13 though its header says 2026-08-11).

| File | Date | Status | Superseded by | Note |
|---|---|---|---|---|
| `Inventory management/Inventory PRD/Inventory_System.md` | 2026-06-17 | superseded (history) | `00` .. `05` | English "unified module" overview: 4 categories Feed/Medication/Tool/Supply, weighted-average cost, tools checked out/in, lot choice allowed for manual out, expired lots blocked. Contradicted on tools, expiry, manual lot. |
| `Inventory management/Inventory PRD/00-库存模块开发基准.md` | 2026-07-07 | stale | `05` | Lists five categories, safety stock, semen excluded, tools kept. Points to `05` as the baseline. |
| `Inventory management/Inventory PRD/01-Console库存管理PRD.md` | header 2026-08-11 | current but inconsistent | partly by `05`, changelogs and code | Richest Console spec (page fields, tab rules, receipts, scrap, negative-stock correction). Contains the old 8/9-way difference table (s5.3, s8.12) that `02-盘点差异` (07-06) replaced, and says "six category tabs" next to "four". Mentions feed both as non-batch and with batch. |
| `Inventory management/Inventory PRD/02-Mobile库存管理PRD.md` | 2026-09-09 | current | — | Newest doc. s11 still says Mobile does not do "精液库存管理" although semen is an open category; s9.1 mentions batch-no. duplicates that no longer exist. |
| `Inventory management/Inventory PRD/03-库存模块决策记录.md` | 2026-07-07 | partly stale | D-012, D-013..D-014 partly overtaken | D-003 "scrap / keep using / partial" replaced by D-012 and 06-29; D-004 tools kept and D-005 semen excluded reversed 08-05..08-07; D-013/D-014 five categories + 3-level medicine reversed. Cost basis / negative offset / expiry cost sections still open and useful. |
| `Inventory management/Inventory PRD/04-库存管理评审版流程说明.md` | header 2026-07-06 | stale / exploratory (review pack) | `05`, changelogs | Five categories, low-stock risk, `入库单据` not yet moved, separate 出库 and 盘点差异 on 财务分析. Still a good summary of stocktake paths. |
| `Inventory management/Inventory PRD/05-库存系统重整版PRD.md` | 2026-08-26 | current baseline, stale in places | — | Closest to "current". Stale: home trend module (removed 07-29), 入库单据 button, 仓库 in header, 3-level medicine (s5.2), low-stock risk (s11.3), receipt header 入库单号. Correct: four categories, direct stocktake adjustment, Mobile s10, scrap, six difference actions in s9.6 are the *old* naming. |
| `Inventory management/Inventory PRD/06-库存出库后端逻辑.md` | 2026-08-19 | current | — | Back-end event rules; links `批量出库页面` changelog that exists in `Vaccine/prds/inventory/修改日志/`. |
| `Vaccine/docs/INVENTORY_CODE_STRUCTURE.md` | 2026-07-07 | stale (still useful) | code | Five categories, `medicineSubtype/medicineKind`; code now also has `medicineClass` and four open categories. File list and proposed split of `inventoryData.ts` (4,418 lines) still apply. |
| `Vaccine/prds/inventory/02-盘点差异自动处理规则.md` | 2026-07-06 | current (legacy scope) | — | Applies only to pending/seeded differences in the prototype; tolerance groups still name consumables/tools. |
| `Vaccine/prds/inventory/03-饲料预计可用天数.md` | 2026-08-14 (mtime 10-13) | current | — | Feed treated as non-batch (matches 08-14, not 08-12). Calls the column 预计库存 / 预计存量. |
| `Vaccine/prds/inventory/04-统一入库记录-PRD.md` | 2026-08-11 | current | — | Feed receipt = fact only, no stock (08-11 state; 08-12 reversed this). |
| `Vaccine/prds/inventory/修改日志/` (184 files, 2026-06-24 .. 09-09) | — | current record | — | 68 file names are identical in `Inventory management/Inventory PRD/修改日志/` (duplicate copies). |
| `Inventory management/Inventory PRD/修改日志/` (99 files) | 2026-06-17 .. 09-09 | duplicate (68) + unique (31) | — | Unique ones are mostly early (06-17..06-20), purchase-order, `库存出库后端逻辑文档`, Mobile 09-09 and review-pack notes. |
| `Vaccine/prds/vaccine prd/01-疫苗管理.md` | 2026-08-13 | stale on categories | 4-category rule | 物料管理 PRD still lists tabs 饲料/药品/消耗品/工具/其他. Material master PRD lives here, not in the inventory folder. |
| `Vaccine/prds/vaccine prd/修改日志/修改日志-2026-06-29-物料管理批量添加.md`, `…-物料管理统一模型与动态字段.md`, `…-2026-07-06-物料分类五类目规范.md` | 06-29, 07-06 | history | later inventory changelogs | Rename 药品管理 -> 物料管理, shared material model, five categories. |
| `Vaccine/vaccine prds/04-疫苗管理-PRD.md` (and 01..06) | undated | duplicate / older copy | `Vaccine/prds/vaccine prd/` | Older vaccine-only master data (categories + brands). No inventory content; the `Vaccine/prds/vaccine prd/` series replaced it. |
| `Vaccine/prds/console/修改日志/` 08-11..08-17 (6 files) | 08-11..08-17 | current record | — | Business-centre entries: 药物管理/精液管理/饲料管理 added (08-11), merged under 库存 (08-13), removed (08-14); 精液 category in the centre is *semen module*, not inventory. |
| `Sentri_Feed_Management_PRD_v2_1_中文.html`, `饲料管理/assets/饲料库存对账流程-中文.svg` | 2026-08 | other area (feed) | — | Feed management has its own 库存对账 (reconciliation) diagram; not reconciled with this module. |

---

## Where it is in Figma and the repo

Figma indexes: `references/figma/web/index.md` (Console/web) and `references/figma/index.md` (phone, 7 files). Mobile index contains **no** stock, medicine or supplies screen.

| Flow / screen | Figma | Repo `features/` |
|---|---|---|
| Inventory home, risks, category lists, material detail | **Not in Figma.** `[Web] 库存管理 · inventory` (`CIPVXjxWEGV3egSoNS7qMH`) has 0 screens, cover page only (`67:699`), created 2026-08-14. Only the runnable prototype `Vaccine/src/components/inventory/ConsoleInventoryPage.tsx` shows it. | none |
| Receive (入库), receipts (入库记录), stocktake, scrap, ledger, 财务分析, differences, outbound | not in Figma | none |
| Material master (物料管理, Settings) | partly: 药品管理 draft in 🖥 📱 免疫 (`8BkIL2azMuBS2w6Vn26Cac`) group "药品管理（还要改，改成入库出库）": list empty `11024:4145`, delete `11076:9170`, add medicine `11024:7930`, 疫苗管理 `11024:4223` — all marked **draft**; the label says it is meant to become stock in/out. Settings sidebar also lists 药品管理 in `1UFIgtR4SLQQ3t4Qlgx572` (场区布局, empty shells). | `features/treat` owns a different, phone-side **Medicines list** (categories, brands, withdrawal defaults) reached from Home > Toolbox > Medicines, no stock; `features/prescriptions` has no stock |
| Mobile 查看库存 / 入库 / 盘点 (toolbox 库存 group) | not in Figma | none (`features/workbench` toolbox has no inventory tiles) |
| Feed stock and days-of-supply | not in Figma | `features/feed-plan` (Out of scope: "Feed inventory, purchase, supplier and formula authoring belong to management screens"); feed consumption deduction is a back-end hook from the plan |
| Vaccine / treatment task deduction | not in Figma | `features/treat/PRD.md` (stock, batch numbers and expiry "belong to future inventory"); vaccination tasks live under `pig-profile` |
| 物资消杀 Console (disinfection areas, 6 screens) | `fVWq5EfZKLL7x8tnE9UR1E`, sections `13003:476` (list), `13307:2382` (empty), `13045:2583` / `13076:15009` (create / edit area) | none; it is Biosecurity, not stock |
| 物资消杀 App (27 screens; toolbox tile, start disinfection, 选择消杀物资 sheet `13431:4481`, choose method `13431:4513`) | `13431:3940` (toolbox), `13431:4446` / `13431:4411` (start), `13431:4708` (empty) | none. Whether the chosen disinfectant is deducted from inventory is not stated in any handover doc. |
| Semen stock | not in Figma | `Vaccine/prds/semen/00-Console精液管理-PRD.md` has its own 库存 tab; no repo feature (breeding/keep-breeding do not cover stock) |

---

## Contradictions and open questions

1. **Stocktake outcome on Console.** Direct adjustment on confirm (`05` s9.5, `04` s7.1, changelog `…-2026-07-06-发起盘点流程直达全量清单.md`, prototype `confirmStocktakeAdjustment`) versus submit -> auto-tolerance handling -> pending differences -> 财务分析 (`01-Console库存管理PRD.md` s8.11/8.12, `02-盘点差异自动处理规则.md`). The prototype only keeps differences as seeded/legacy data. Decide whether the differences page is still a product requirement or can be dropped. Mobile (`02-Mobile…` s4) says "confirm -> update directly, no reason".
2. **Which difference method list.** `01` s8.12 lists 9 methods (incl. 供应商多送/赠品, 原因不明盘盈/盘亏, blind recount, system recommendation, batch picker) and 财务待确认; `02-盘点差异` and changelog 07-01 say 6 methods and no batch picker; `05` s9.6 mixes (has "供应商多送 / 原因不明"). 6 is the newest.
3. **Feed in or out of stock management.** 08-11 feed = reference only (`Vaccine/prds/inventory/04-统一入库记录-PRD.md`, `01` s4: "饲料按物料总量管理，不建立可操作的剩余批次") -> 08-12 full stock restored (`…-2026-08-12-恢复饲料库存属性与详情.md`: receipts create batches/ledger) -> 08-14 batch module removed from detail while risk, trend and ledger stay. Is feed stock a measured ledger or a calculated reference? Also `06` says feed deduction may remain SKU-total only and asks whether back-end needs feed batches. And the feed bin is measured by scale reading, not batch (`03-饲料预计可用天数.md`).
4. **Feed 预计库存 vs 当前库存 wording** differs between `03-饲料预计可用天数.md` (预计库存/预计存量) and the 08-12 restore (当前库存 restored while the same day renamed to 预计库存).
5. **Category count.** `05` s2 says four open categories, `05` s1 and s5.2 are written around five categories with 药品 -> 疫苗兽药 -> 疫苗/兽药, while code and 07-08 use a single `medicineClass`. `Vaccine/prds/vaccine prd/01-疫苗管理.md` still lists five tabs. Which medicine taxonomy do designers use? (Newest: three flat classes.)
6. **Disinfectants and tools have no home.** 原消毒用品 was folded into 消耗品 (07-06), and 消耗品/工具 were then removed from open categories (08-07). 物资消杀 on Mobile selects "消杀物资" but no inventory doc says what stock it draws from.
7. **Low stock / safety stock.** Removed 07-08; `05` s11.3 and `00` still list it; `Inventory management/Inventory PRD/修改日志/2026-06-20-安全库存帮助提示.md` is history.
8. **Semen.** Excluded (`00`, `03` D-005, `02-Mobile` s11, `01` s11 "精液专属库存扩展" not done) vs open category with batch list, reserved qty, storage location (08-05 onward, prototype). Separate semen module (`Vaccine/prds/semen/`) also manages its own stock; two sources of truth. Mobile stocktake does allow 精液 ("药品和精液"), which sits oddly beside the Mobile s11 exclusion.
9. **Receipts: warehouse, header and requireds.** `05` s9.2 shows 仓库 + 供应商 at receipt header and expiry/supplier optional (07-07 v2); later changelogs (07-09, 07-13) make supplier per-row required, remove warehouse, and prototype requires expiry. Which is intended?
10. **Receipts list header.** Category tag shown (`Vaccine/prds/inventory/04-统一入库记录-PRD.md` s7.4) vs removed (`…-2026-08-10-入库记录移除分类标签.md`); order number shown (`05` s9.3) vs hidden (`…-2026-08-10-入库记录视觉分组与隐藏单号.md`). Same-day ordering is not stated.
11. **Manual issue.** Console issue page (`01` s8.6, `05` s9.4) vs `06` s7 and G-02: manual issue is outside the event-driven design. Also its entry lives under 财务分析, not 库存, by 07-10 decision; `05`/`04` agree on this, `00` does not mention it.
12. **Business-centre entries.** Six-entry 库存 category [08-14] vs sidebar 4 items; single-category pages (药物/精液/饲料管理) are hidden but routes still exist. `01` s8.1 still documents them as active.
13. **Stocktake scope.** 药品/精液 only [08-07]; `02-盘点差异` tolerance groups B/C still list 饲料, 消耗品, 工具, 其他 which cannot be counted. Feed stock accuracy then relies on the feed-management reconciliation (other area).
14. **Open business decisions** (unchanged since 06-17): moving-average vs batch cost; negative-stock offset on later receipt (auto / none / semi-auto); cost basis on scrap; keep-using expired stock approvals; reversal of completed deductions (task cancel / corrected record) — all in `03-库存模块决策记录.md` s2/s4/s5 and `06-库存出库后端逻辑.md` s7.
15. **Mobile gaps.** No ledger or batch view (listed "optional"); no outbound; task page material picker "必须关联物料ID" is specified only in `02-Mobile` s10, not in the vaccine/treatment PRDs (`Vaccine/vaccine prds/05-Mobile接种任务-PRD.md` has no inventory text). Repo `features/treat` records medicine by farm list, not by stock material.
16. **Sparkline/trend rules** differ across docs (feed detail trend removed 08-10 vs restored 08-11 "趋势参考化" vs 03 says detail keeps 7/30/90-day chart). Treat feed detail as unsettled.

## Corrections found while writing the workflow specs (2026-11-03)

- The purchase-order page exists only in changelogs; `01-Console库存管理PRD.md` has no purchase-order section, although the 2026-07-07 changelog says one was added. Medicine days-of-use was withdrawn from the list on 07-10, but the 07-09 purchase-order line that uses it was never reversed.
- `Vaccine/prds/vaccine prd/01-疫苗管理.md` (Settings 物料管理) still has delete and safety stock, against the stop-only and no-safety-stock rules.
- `02-Mobile库存管理PRD.md` says a stocktake surplus first offsets negative stock and then goes to a "surplus adjustment batch", against the 2026-06-30 rule that a surplus never creates a batch. See [flows/stocktake.md](flows/stocktake.md).
