# Farrowing 67 个登记页面：入口与范围逐项表

2026-11-18，按修正后的 feature.json 登记、实际状态分支、main 的范围和后续明确决定核对。

此表覆盖登记页，不把“能回放”“有 screen ID”当成产品批准。本轮关键交互实走并提供 [更新后的截图](review.html)；其余项依据入口和状态分支检查，本轮没有重跑一次 66 页 UI 自动回放。全部业务链路和待修正项见 [复核清单](README.md)。

| 页面登记 | 实际入口 / 状态 | 可做的操作、保存与返回 | 范围或缺口 |
| --- | --- | --- | --- |
| `farrowing.room` · Room list | Home 的两个 Ways in；Room/Find/Scan 返回 | 按状态看母猪、筛选、地图、找猪、进入单元 Actions 或 Task overview | 分娩范围 |
| `farrowing.count` · Counting | Room/Find/Scan/任务复核 → 分娩中母猪 | 记录出生、报告死亡、Save/Clear、Details/日志、Finish、母猪 Actions | 分娩范围 |
| `farrowing.count-draft` · Counting · not saved yet | 计数 → + Born alive，或 Report death → Done | Save 提交本次；Clear 清本次；不带草稿跨 Finish | 分娩范围 |
| `farrowing.count-saved` · Counting · just saved | 计数 → Save | 继续计数、看 Details/日志或 Finish；Undo 在日志顶端 | 分娩范围 |
| `farrowing.undo` · Undo the last save | Details → Farrowing log → 顶端 Undo | 确认撤销符合条件的顶端记录；Finish 为底线 | 分娩范围 |
| `farrowing.before` · Before first count | Room/Find/Scan/任务复核 → 待产母猪 | 开始出生计数、报告死亡、母猪 Actions；不能空窝 Finish | 分娩范围 |
| `farrowing.death` · Report death | 母猪计数 → Death；已结束/死亡记录 → Record dead | 分娩中 Done 带回草稿；已结束直接保存；母猪死亡要选原因长按保存 | 分娩范围 |
| `farrowing.litter` · Details · while she farrows | 分娩中 Alive 卡片 → Details | 看这一窝明细，进入 Farrowing log/Undo | 分娩范围 |
| `farrowing.finish` · Finish | 计数已保存 → Finish farrowing | Weak/Deformed、Assisted、可选窝重；长按完成并锁 Born | 分娩范围 |
| `farrowing.locked` · Locked record | Room/Find/Scan/任务复核 → 正常已结束母猪；有活仔的流产母猪也路由到这里 | 正常完成有 Details、Piglets、Actions、Record dead；有活仔的流产记录也有 Piglets | 分娩范围 |
| `farrowing.details` · Details · a finished sow | 正常结束/母猪死亡记录卡片 → Details | 查看本窝、批次比较、过往窝、Farrowing log；没有历史时保留占位 | 分娩范围 |
| `farrowing.details-first` · Details · no earlier litters | 正常结束/母猪死亡记录卡片 → Details | 查看本窝、批次比较、过往窝、Farrowing log；没有历史时保留占位 | 分娩范围 |
| `farrowing.history` · Farrowing log | Details → Farrowing log；未孕/移出批次记录；流产保存后 | 看日志；符合条件的顶端分娩记录可 Undo；生产退出结果不继续计数 | 分娩范围 |
| `farrowing.piglets` · Piglets · a dead sow's litter | 已结束母猪或死亡母猪记录 → Piglets | 查看已有身份和无身份分组、搜索/扫描选择、全选、填写要选择的无编号只数 | 分娩范围 |
| `farrowing.piglets-ticked` · Piglets · three ticked | Piglets → 勾选/搜索或扫描已有 ID/填无编号选择只数 | 已选择 N 只，可打开 Actions · N | 分娩范围 |
| `farrowing.piglets-actions` · Piglets · Actions | Piglets → 已选仔猪 → Actions · N | 只有 Foster / Move | 分娩范围 |
| `farrowing.piglets-sow` · Piglets · foster to a sow | 已选仔猪 → Actions → Foster | 选择接收母猪；只 Send，不切换 Receive | 分娩范围 |
| `farrowing.piglets-filter` · Piglets · filter sows | 已选仔猪 → Foster → Filter | 按 Unit/Farrowed/Alive now 筛接收母猪；Show/Reset/Back | 分娩范围 |
| `farrowing.piglets-confirm` · Piglets · confirm the sow | 已选仔猪 → Foster → 选接收母猪 | 确认目标与仔猪，Send 后回 Piglets，显示 Sent and moved | 分娩范围 |
| `farrowing.piglets-pen` · Piglets · move to a pen | 已选仔猪 → Actions → Move | 搜索栏/扫描栏牌选目标，原栏禁用；移完回 Piglets | 分娩范围 |
| `farrowing.ended` · Sow died | Room/Find/Scan/任务复核 → 母猪死亡记录 | Details、Piglets Foster/Move、剩余仔猪 Record dead；母猪操作灰，备注可用 | 分娩范围 |
| `farrowing.task-blocked` · End task · active sows | Task overview → End task，仍在分娩或有草稿 | 不能结束；打开相应母猪处理，再返回 | 分娩范围 |
| `farrowing.task-ready` · End task · awaiting sows | Task overview → End task early，仍有待产 | 复核会离开批次的待产母猪，再长按提前结束 | 分娩范围 |
| `farrowing.task-complete` · End task · all finished | Task overview → End task，全部完成 | 复核统计，长按结束 | 分娩范围 |
| `farrowing.task-outcomes` · End task · production outcomes | Task overview → End task，存在生产结果 | 复核死亡/流产/未孕/移出批次等结果；仍遵守阻止结束条件 | 分娩范围 |
| `farrowing.overview` · Task overview | Room → Task overview | 查看全任务进度/各单元/结果，换单元，进入 End task | 分娩范围 |
| `farrowing.task-receipt` · Task receipt | End task → 长按确认 | 查看结束回执；返回 Today，不重开进行中任务 | 分娩范围 |
| `farrowing.foster` · Foster piglets | 活母猪计数或结束记录 → Actions → Foster piglets | 先选 Send/Receive，再选另一母猪；需要保留接收入口 | 分娩范围 |
| `farrowing.foster-search` · Foster piglets · typed | 活母猪 Actions → Foster → 搜索耳号/栏位 | 按查询找另一母猪；不修改身份 | 分娩范围 |
| `farrowing.foster-scanning` · Foster piglets · scanning | 活母猪 Actions → Foster → Scan | 读到合资格母猪进入选择；不合资格说明后不打开 | 分娩范围 |
| `farrowing.foster-send` · Foster piglets · send to a sow | 活母猪 Actions → Foster → 方向 → 另一母猪 | 选择已有 ID 和无 ID 只数；Send/Receive 保存，回母猪 Actions | 分娩范围 |
| `farrowing.foster-filter` · Foster piglets · filter sows | 活母猪 Actions → Foster → Filter | Unit/Farrowed/Alive now；Show/Reset/Back | 分娩范围 |
| `farrowing.filter` · Filter sows | Room → Filter sows | 按预计分娩日期与胎次筛选；Show/Reset/Back | 分娩范围 |
| `farrowing.pen-map` · Pen map | Room → Pen map | 选栏回 Room 落到该栏 | 分娩范围 |
| `farrowing.pen-map-long` · Pen map · long room | Room（长房间样例）→ Pen map | 看长房间栏位与 Whole room 入口 | 分娩范围 |
| `farrowing.pen-map-whole` · Pen map · Whole room | 长房间 Pen map → Whole room | 看整栋分组；点分组回逐栏 | 分娩范围 |
| `farrowing.pen-map-group` · Pen map · shared tile opened | Whole room → 某栏位组 | 回逐栏地图，再选具体栏位 | 分娩范围 |
| `farrowing.pen-map-mixed` · Pen map · mixed pens | Room（混合栏位样例）→ Pen map | 查看不同类型/跨度栏位，选栏 | 分娩范围 |
| `farrowing.room-single` · Room list · one pen | Home → 单栏 Room 样例 | 使用 Room 列表；没有 Pen map 入口 | 分娩范围 |
| `farrowing.pen-landed` · Landed on a pen · needs you | Pen map → 具体栏位 | 短暂落点高亮后回 Room；不是额外的操作菜单 | 分娩范围 |
| `farrowing.pen-landed-live` · Landed on a pen · farrowing | Pen map → 具体栏位 | 短暂落点高亮后回 Room；不是额外的操作菜单 | 分娩范围 |
| `farrowing.pen-landed-plain` · Landed on a pen · has sows | Pen map → 具体栏位 | 短暂落点高亮后回 Room；不是额外的操作菜单 | 分娩范围 |
| `farrowing.search` · Find a sow | Room → Search；全屏默认已确认 | 全屏搜索各单元；可从输入框进 Scan | 分娩范围 |
| `farrowing.search-results` · Find a sow · results | Find a sow → 输入耳号/栏位 | 任务母猪按状态开记录；其他猪开共享猪档案 | 分娩范围 |
| `farrowing.search-none` · Find a sow · no match | Find a sow → 无匹配查询 | 修改查询或清空，不创建母猪/任务记录 | 分娩范围 |
| `farrowing.scan` · Scan ear tags | Room → Scan；Find → 扫描图标 | 全屏；每读一头开记录；Stop/Resume；返回保留来源 | 分娩范围 |
| `farrowing.scan-no-reader` · Scan · reader not connected | Scan 进入但读卡器未连接 | 显示连接提示，Back 返回 | 分娩范围 |
| `farrowing.scan-read` · Scan · her drawer opened | Scan → 读到本任务母猪 | 按状态打开记录；Back 回 Scan | 分娩范围 |
| `farrowing.pig-not-in-task` · A pig not in Farrowing | Find/Scan → 不在此任务的猪 | 共享猪档案的读取和通用操作；不创建分娩记录 | 共享 pig-profile 交接 |
| `farrowing.pig-gone` · A pig no longer on the farm | Find/Scan → 已死亡或售出的猪 | 受限/只读猪档案；不能勾入本单元通用选择 | 共享 pig-profile 交接 |
| `farrowing.scan-unknown` · Scan · a tag with no pig | Scan → 未知耳标 | 提示耳标未知/未同步，继续扫描；不造数据 | 分娩范围 |
| `farrowing.scan-stopped` · Scan · stopped | Scan → Stop scanning | Resume 后继续逐头打开 | 分娩范围 |
| `farrowing.batch` · Actions · pigs in this unit | Room 底部 Actions | Pigs in this unit：7 项通用操作；无生产任务/身份/寄养/死亡 | 共享通用操作；Feed 按饲喂计划判断，Transfer 为占位 |
| `farrowing.batch-pick-none` · Choose pigs | Room Actions → 选通用操作 | 在当前单元选猪；未选择不能 Next | 共享通用选择 |
| `farrowing.batch-pick` · Choose pigs · 3 chosen | Choose pigs → 勾猪 | Next 进入对应通用表单 | 共享通用选择 |
| `farrowing.batch-search` · Choose pigs · search | Choose pigs → 输入耳号/栏位 | 过滤可选猪，不额外开放生产操作 | 共享通用选择 |
| `farrowing.batch-filter` · Choose pigs · filter | Choose pigs → Filter | 按任务内/外、健康问题筛选；应用或重置 | 共享通用选择 |
| `farrowing.batch-waiting` · Choose pigs · waiting for the reader | Choose pigs → Scan，未连接 | 等连接，不添加未知/离场/其他单元猪 | 共享通用选择 |
| `farrowing.batch-scanning` · Choose pigs · scanning | Choose pigs → Scan，已连接 | 读到合格猪勾选，支持多头；不同于逐头开记录的 Scan | 共享通用选择 |
| `farrowing.batch-missed` · Choose pigs · reads that can't join | Choose pigs → Scan 读到不能加入的耳标 | 显示原因和可查看的记录，不加入选择 | 共享通用选择 |
| `farrowing.batch-form` · Actions · the form | Choose pigs → Next | 共享表单；当前示例 Condition；Feed 使用共享饲喂编辑器，Transfer 提供占位 | 共享通用表单 |
| `farrowing.batch-saved` · Actions · saved | 共享通用表单 → Save | 返回 Room 显示保存反馈；登记样例不证明每个菜单后续都走通 | 共享通用表单 |
| `farrowing.task-sows` · Task sows list | End task → Still farrowing / Awaiting / 生产结果分组 | 开对应母猪记录，Back 回原复核列表 | 分娩范围 |
| `farrowing.today` · Today | Room → Back；已结束任务的各入口 | 任务运行时继续原位置；结束后看回执 | Home/Workbench 交接示意 |
| `farrowing.sow-actions` · Actions | 某头母猪记录 → Actions | 通用操作、备注；分娩自己批准流产/寄养；按状态显示，已移除 processing 和 Reconcile | 共享菜单 + 分娩操作 |
| `farrowing.batch-membership` · Batch membership · remove awaiting sow | 待产母猪 → Actions → Batch membership | 查当前批次，选择原因和可选备注，保存移除并打开 Production log | 已记录产仔时只读 |
| `farrowing.note` · Sow note | 母猪记录 → Actions → Add/Edit note | 填写备注和展示天数，保存回 Actions | 共享猪备注 |
