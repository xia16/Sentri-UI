# 巡检页面版本与入口

**基线：** `main` 的 `df82ba5d`（PR #315）。对照当前 `feature.json`、实际可点击原型、组件卡片和 `approvals.json`。2026-10-12 的记录只覆盖当时的巡检行与查找；两条记录都标了后来有改动。以下「当前」指应对齐的现行实现。新增登记和纠偏仍是 `in-design`。

## 一眼看懂每条链路

| 从哪儿进 | 打开哪个状态 | 进去做什么 / 返回到哪里 | 本轮处理 |
| --- | --- | --- | --- |
| 首页 → 切到某单元 → **Inspect unit** | `inspection.walk`，当前单元 | 看栏位和猪只，切 All / Health / Feed。左上返回同一首页单元。 | 实走 Unit 7，保留。 |
| 首页概览 → **To treat / Monitoring** → 点猪的一行 | `inspection.walk`，该猪所在单元、Health | 看整个单元 Health 列表；返回原待治疗／监测列表。首页行携带单元，未携带猪身份。 | 补两个 Ways in；是否直接到猪见待复核。 |
| 首页底部放大镜 → 输入 / 切扫码 | `find-pig.*`，首页自己的 Lookup | 搜全单元，可点行看猪档案。首页的扫码栏在同一页内切换；首页的批量 Actions 在此原型是入口演示。 | 用当前组件，保留宿主差异。 |
| 巡检 → All / Health / Feed → 漏斗 | `inspection.walk` / `inspection.filters` | 看对应猪只；筛选后回巡检；返回保留未应用草稿。 | 同一列表及筛选组件。 |
| 巡检 → **Pen map** → 点 C2 → 点 C2 栏名 | `inspection.go-to-pen` → `inspection.pen-landed` → `inspection.pen-faults` | 地图点选定位到列表；从栏名再进栏位页。返回落在本来的栏附近。 | 基线 4 × 6 路径已验证；长图与 Whole room 的宿主接入在 #317。 |
| 巡检 → 栏位标题 `›` | `inspection.pen` / `inspection.pen-faults` | 一栏的五个入口：备注、饲喂、观察、报障、全选。存在备注或故障时可点对应行；可看栏位日志。 | 补齐当前 Atlas 路径。 |
| 栏位 → Note / 备注卡 → 铅笔 | `inspection.pen-note` / `inspection.pen-read-note` | 新增或修改备注；默认显示 7 天。通过备注卡编辑后回阅读；关闭备注回栏位，日志中可查。 | 登记阅读与编辑各自页面。 |
| 栏位 → **Observe** / **Pen log** | `inspection.pen-observe` / `inspection.pen-log` | 记录栏况；读本栏的历史并按活动和日期筛。均回该栏。 | 登记 Observe；沿用日志。 |
| 栏位 → Feed；或列表点栏头饲喂数字 | `feed-plan.pen` / `feed-plan.adlib`；直接编辑 `feed-plan.editor` | 栏位的 Feed 先读计划；数字入口直接编辑可调的栏；自由采食无猪只定量调整。 | 两个控件意图不同，保留。 |
| 栏位 → **Fault** → 选设备 / Other → 报告 | `inspection.fault-report` / `inspection.fault-report-other` | Other 多一个必填名称；返回保留草稿。保存后先回栏位，再回列表可见扳手。选到已有未解除故障的设备，直接打开原记录，继续处理草稿。 | Atlas 从旧稿换成实时表单；恢复列表故障提示。 |
| 栏位 → 故障行 → **Resolve fault** → Pen log | `inspection.fault-resolve` → `inspection.fault-resolved` → `inspection.pen-log` | 可填处理经过；处理后回栏位，最后一条未解决故障消失，日志留原报告和处理记录。 | 实走且重新登记 Atlas。 |
| 巡检底部 Search → 输耳号或栏号 → 点结果 | `inspection.search` → `inspection.find-pig` / `inspection.search-none` → `pig-profile.full` | 开始为空、无结果有提示；跨单元结果显示真实归属；回查找保留输入。 | 同一全屏 Lookup；异单元操作规则待定。 |
| 巡检底部 **Scan** / 查找右侧扫码图标 | `inspection.scan` / `scan-no-reader` / `scan-list` / `scan-new` / `scan-ticked` / `scan-stopped` | 同一全屏；读一只勾一只、重复读不增加行、可手动取消。尚未选择时可停／恢复。没有读卡器时没有 Actions。返回分别回巡检、查找。 | 修复查找切扫码后跳级、暂停示例显示成已勾选。 |
| 巡检、查找结果、扫码列表 → 点猪耳号 | `pig-profile.full` → **Actions** → `pig-profile.actions` | 看档案，再只对这一只做操作。回上一步保留原名单、勾选和搜索。 | 修复单猪 Actions 覆盖原勾选；验证备注只保存给这只猪。 |
| 列表勾选、栏位 **Tick all**、扫码勾选 → **Actions** | 单头 `pig-profile.actions`；多头 `inspection.actions` | 单头按猪只阶段出现生产操作；多头是日常操作。点击巡检底部已选数量还可先核对和取消某头。 | 多处用同一份 Actions；已选列表的阶段天数用巡检格式。 |
| 巡检右上 History | `inspection.walk-log` | 看巡检已记录内容，返回同一列表。没有结束巡检和签到。 | 按 #314 更正需求和流程。 |
| 分娩房间 → B1 栏位 `›` | `inspection.farrowing-pen*` | 备注／备注卡、饲喂指导、报障／故障记录、栏位日志，返回分娩房间。 | 仍是分娩自己的实现。入口和话题差异图见待复核。 |
| 巡检 → 有分娩任务的母猪 → 当前任务卡 / 单猪 Actions → Open Farrowing | 当前跳整个 `farrowing.room`（不带耳号） | 未完成可开；已完成单猪没有活动分娩项；两个入口都能进入分娩任务，当前没有落到指定母猪。 | 目标页和保存后的返回规则待复核。 |

### 巡检 Actions 实际能做什么

- **一头本单元猪**：猪的阶段、当前任务和批次决定生产区的内容。样例母猪可以见到当前生产任务、适用的流产记录、批次归属；正在分娩的样例有 Open Farrowing。没有在这里增加仔猪身份、仔猪 Care 或寄养入口。
- **一头或多头已选猪**：记录病症、治疗；有病症时按适用条件改 Care、解除病症，批量还可编辑条件。日常区可见转舍入口、猪只备注、测量、饲喂调整；有的会按对象置灰。转舍仍有未完成的流程或权限边界，看到入口不表示可提交真实转舍。
- **栏位工具**：备注、饲喂、观察、报障、全选属于栏位页。当前没有靠「勾整栏」打开旧 Pen Actions 的入口。无耳标组和可用数量属于本栏，不假定为哪头已标识猪。

## 页面的版本判定

| 登记的页面组 | 采用的当前版本 | 版本证据及限制 |
| --- | --- | --- |
| `walk`、`stage-times`、`animal-types`、`filters` | `inspection-astra-concept` 走真实列表与筛选 | #314 已移除 End walk；紧凑 Row / ConditionTag 及绿底白勾来自 #302。各预设只改变样例阶段或动物。 |
| `go-to-pen`、两个 `pen-landed*` | 同一 `SentriUI.penMap`，当前 4 × 6 走查 | #273 为巡检接入；#307 更新共享 PenMap；#317 的真实长览、Whole room 和一栏规则仍在独立 PR。 |
| `search`、`find-pig`、`search-none`、六个 `scan*` | 同一 `SentriUI.findPage` / `scanPage` 全屏 Lookup | #248 接入 Lookup，#290 按栏卡分组，#302 更新选中状态。扫完的结果、刚读、取消勾选、暂停、无读卡器分别保留。 |
| `pen`、`pen-signals`、`pen-note`、`pen-read-note`、`pen-observe`、`pen-log` | 巡检自有栏位页以及独立读、写、栏况、日志入口 | #314 的消息式备注、7 天 Stepper 和 Panel；新增两个真实 Atlas 入口。栏位的饲喂页面归 `feed-plan`。 |
| `pen-faults`、`fault-report`、`fault-report-other`、`fault-flag`、`fault-resolve`、`fault-resolved` | 可点的栏位页、报障、原记录和处理后状态 | 已用当前原型替代 Archive 的静态步骤。旧稿的照片、跨单元设备汇总及批量解决未映射成可用入口。 |
| `review-selected`、`actions`、`pig-profile.*` | 同一个选择上下文和共享猪档案 | #315 操作不适用时原位灰显；猪的阶段限制生产区，选择多头不出现同一组。被其他宿主嵌入时由宿主提供上下文。 |
| `no-batches`、`one-batch`、`many-batches`、`batch-farrowing`、`batch-concurrent` | 样例中的批次／阶段变体，只在巡检名单或猪档案显示 | 无可点击的批次跟踪卡。`batch-detail`、`sensors`、`unit-detail` 保持占位。 |
| `walk-log` | History → This walk | #314 已移除签到，与历史记录分开。 |
| 八个 `farrowing-pen*` | 分娩原型的栏位工具 | 2026-10-22 的需求归属判定把这些画面登记在 Inspection；运行时仍是另一份实现。 |
| `pen-actions`、五个 `set-count*` / `count-recorded` | 早期工作流留档 | 不能从当前 Web 巡检进入。Android 在 Pigs 事实卡上另有盘点预览，是否同步待复核。 |

## 组件对照

| 组件 | 核对结果 |
| --- | --- |
| Lookup、Row、ConditionTag | 巡检 Search / Scan / 行分别调用共享版本。本轮在调用方修返回和选中对象；Home 的同页 scan bar 与巡检独立全屏是两种已有用法。 |
| Sheet、PickerField、Panel、Stepper | 当前表单用浅底白卡；栏位备注消息卡和 7 天步进器沿用 #314，报障用共享设备选择字段。 |
| Header、TaskDock | 巡检和其他任务都调用共享组件；History 仍在 Header，Scan/搜索/地图在 dock。 |
| PenMap | 基线的组件支持 Whole room，但巡检宿主的动态布局和长图接线并未进 `main`。继续由已打开的 #317 负责。 |

图中为样例、原型操作。没有变更 Android，也没有将登记或验证成功标成新的批准记录。
