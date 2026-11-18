# Farrowing Actions 范围复核与操作链路

复核日期：2026-11-18。现状基线：`af1f54bd03719a547fbb9c2a489de29df62b6006`；main 基线：`df82ba5dbaf690fab32cfd4437c66457c4e17b9e`。

本轮是范围复核和实际操作证据，尚未按下方修正项修改产品原型、组件或 Atlas。截图来自本地网页原型的独立样例，不是 Android 实现验收，也不是新方案的批准记录。每组数字独立，不跨组累计。

- [按顺序看操作截图](review.html)：36 张 390 × 844 实际页面截图，包含分娩中送出、分娩中接收、结束分娩后寄养、移栏、母猪死亡后的仔猪，以及发现的缺口。
- [69 个登记页面的入口逐项表](screen-inventory.md)：逐项说明入口、可进行的操作与范围；关键交互实走，其余结合来源与状态分支核对。
- [截图清单与逐步说明](screenshots.json)：每张图的入口、状态、操作与结果。

## 先把范围说清楚

用户本次明确：仔猪处理及其身份工作属于独立 Piglet processing 任务。这条最新澄清取代本分支此前把 Care / 身份保留在 Farrowing 的口径。原型存在、`feature.json` 登记页面、回放通过、gate 通过，都不能证明产品范围已批准。

以下以 main 的 PRD 和后续明确决定作依据，避免引用本分支后来扩大的 In / Out 来证明其自身：

| 依据 | 结论 |
| --- | --- |
| [main PRD · In，57–59 行](https://github.com/xia16/Sentri-UI/blob/df82ba5dbaf690fab32cfd4437c66457c4e17b9e/features/farrowing/PRD.md#L57) | 分娩自己的 Actions 包括 Record abortion、Mark not in pig；活母猪寄养、死亡母猪仔猪的 Foster / Move 也在范围内。 |
| [main PRD · Out，64–66 行](https://github.com/xia16/Sentri-UI/blob/df82ba5dbaf690fab32cfd4437c66457c4e17b9e/features/farrowing/PRD.md#L64) | Piglet processing 与身份工作是独立功能；照原型登记的 processing / identity / mortality 页面不等于批准范围。母猪档案其余 Actions 属 pig-profile，栏位工具属 Inspection。 |
| [main PRD · 2026-11-03，189–195 行](https://github.com/xia16/Sentri-UI/blob/df82ba5dbaf690fab32cfd4437c66457c4e17b9e/features/farrowing/PRD.md#L189) | 分娩中寄养放在母猪 Actions；结束分娩后有 Piglets；选中仔猪后的 Actions 只有 Foster / Move；活母猪的寄养保留 Send / Receive。此决定取代更早的“fostering parked”。 |
| [Piglet processing PRD](../../piglet-processing/PRD.md) | 按日龄的处理、给予或修改身份、性别、体重与该任务的计数等由仔猪处理任务定义；其中仍有未决项，不能在本轮提升成熟度。 |

## 三种 Actions 的准确边界

| 入口 | 对谁操作 | 实际现状 | 本轮校对结论 |
| --- | --- | --- | --- |
| Room 底部 → Actions，副标题 Pigs in Unit 7 | 当前单元选中的一头或多头猪，包括不在分娩任务里的猪 | Condition、Treat、Care、Note、Measure、Feed、Transfer，共 7 项；与 main 菜单相同 | 保持这 7 项通用菜单，不加入生产任务、流产、寄养、身份、死亡登记。这里的 Care 是健康护理指示。Feed / Transfer 的后续中断另列。 |
| 点某头母猪 → 分娩记录 → Actions | 当前母猪 | 通用健康/日常操作、备注；Production 中有流产、未孕、Piglet processing、Reconcile、Foster、共享 Batch membership | 分娩自己的操作保留流产、未孕和已批准的寄养。撤回仔猪处理/身份入口及 Reconcile。其余共享操作沿用 pig-profile 的规则，不能借本轮扩充为分娩批准范围。 |
| 已结束/母猪死亡 → Piglets → 选仔猪 → Actions · N | 已选中的仔猪 | Foster、Move，只有这两项 | 保留。搜索/扫描已有编号只是选仔猪；无编号行填数量只是选择要转出的只数，不创建身份，也不核对整窝数量。 |

共享 Batch membership 当前确实可见。它管理猪的批次，归属 pig-profile；本轮不新增批次功能，也不把“移出批次”混写成分娩结束操作。是否改变共享菜单由其所属功能处理。

## 全部链路：从哪里进去，能做什么

### 1. 进入任务、找母猪和找栏位

| 路径 | 可以进行的操作与去向 |
| --- | --- |
| Home → Overview → Farrowing | 到 Room 产房列表。 |
| Home → 某单元 → Farrowing | 到同一 Room，以该单元为上下文。 |
| Room → Awaiting / Active / Done / All | 换看待产、分娩中、已完成或全部母猪。 |
| Room → Filter sows | 按预计分娩日期、胎次筛选；Show 应用，Reset 重置，Back 返回。 |
| Room → Pen map → 某栏 | 回到 Room 对应栏位；长房间有 Whole room 与逐栏切换；单栏或无栏位划分时不显示地图入口。 |
| Room → Task overview → 某单元 | 换单元继续做同一分娩任务。 |
| Room → Search / Find a sow | 全屏输入耳号或栏位，搜索各单元；点结果按母猪状态打开记录。清空、无结果、跨单元结果都是同一搜索链路的状态。 |
| Room → Scan，或 Find a sow → 扫描图标 | 全屏 Scan；每读到一头就打开其记录；Back 回扫描；Stop / Resume 暂停和继续。没有连接读卡器时显示连接提示。 |
| Find / Scan → 在本任务的母猪 | 按状态到待产记录、计数记录、结束记录或死亡记录，后续能力与从 Room 进入一致。 |
| Find / Scan → 不在本任务的猪 | 到猪档案，显示不在分娩任务，沿用共享档案操作；不造出一份分娩记录。 |
| Scan → 已死亡/售出的猪；未知耳标 | 已离场猪到只读/受限猪档案；未知耳标在扫描页提示。它们不能自动加入本单元批量选择。 |

Find 和 Scan 的全屏默认版本已经得到先前确认，本次范围纠正不撤回那两页的批准。

### 2. 对当前单元的猪做通用操作

路径：**Room → 底部 Actions → 选一项操作 → Choose pigs → 勾选 / 搜索 / 扫描 → Next → 共享表单**。

| 菜单项 | 大白话 | 当前边界 |
| --- | --- | --- |
| Condition | 记录疾病或症状 | 进入共享健康登记表。 |
| Treat | 记录用药、剂量与方法 | 进入共享治疗表，受健康功能规则约束。 |
| Care | 记录或调整健康护理指示 | 健康护理，不是按日龄补铁、断尾等仔猪处理清单。 |
| Note | 给选中的猪加备注 | 共享备注表。 |
| Measure | 测量 / 体况 | 此批量入口当前传入 `body`，直接开 Body condition；不能据菜单标题声称所有体重、体温等表单都从这里可达。 |
| Feed | 调整饲喂 | 当前选择完猪后中断，见问题 6。 |
| Transfer | 转移选中的猪 | 菜单是通用移动入口；当前选择完猪后为空白，不能写成已完成移栏，见问题 6。 |

Choose pigs 只选择当前单元的在场活猪。筛选可以区分“在分娩任务 / 其他”和是否有健康问题。读到其他单元、离场猪或未知耳标时显示对应信息，不勾入当前选择。该菜单没有生产任务和死亡登记。

### 3. 待产与分娩中

| 路径 | 能做什么 | 限制 / 保存点 |
| --- | --- | --- |
| 母猪记录 → + Born alive | 累加本次新出生的活仔 | 本次未保存；减号只退回本次加数，不减少既有保存。 |
| 母猪记录 → Death / Report death → Born dead | 记录死胎、木乃伊胎 | Done 带回本次草稿，回母猪记录 Save 才保存。 |
| 母猪记录 → Death → Died after birth | 按压死、腹泻、饿死、安乐处置、其他记录死亡，可带照片 | 同上；本分支误把直接入口上限收紧到无编号数量，需修正。 |
| 母猪记录 → Death → The sow | 选母猪死亡原因，可填 Other 说明与照片 | 长按保存母猪死亡，结束这头母猪的分娩；有存活仔猪时仍保留仔猪处理路径。 |
| 本次计数 → Save / Clear | 保存 / 清除本次草稿 | 有草稿时不能跨过 Finish。 |
| Alive 卡片 → Details → Farrowing log | 看这一窝的明细、过程记录 | 日志顶端符合条件的记录可 Undo，逐条撤销，保留撤销痕迹；Finish 是不可跨越的底线。 |
| 母猪记录 → Actions → Record abortion | 登记流产与原因 | 分娩未结束时可用；有活仔时母猪仍留在 Room。当前后续 Piglets 管理有缺口。 |
| 母猪记录 → Actions → Mark not in pig | 登记未孕与原因 | 已经记过一窝时不可用；不能拿它清空已有产仔记录。 |
| 母猪记录 → Actions → Foster piglets | 送出仔猪，或从别的母猪接收仔猪 | 已批准分娩链路；当前不能依赖 Piglet processing 任务是否存在来决定显示。 |
| 母猪记录 → Actions → 健康/日常操作、备注 | 给这头母猪做健康记录、治疗、护理指示、测量、饲喂、备注、母猪转移等共享操作 | 按所属功能的可用条件；母猪死亡后这些操作置灰，备注保留。母猪 Transfer 与仔猪列表中的 Move 对象不同。 |

### 4. 分娩中的寄养：可以送出，也可以接收

**送出：**分娩中母猪记录 → Actions → Foster piglets → **Send piglets** → 选接收母猪（可搜索、扫描、按单元/分娩时间/当前活仔数筛选）→ 勾已有编号的仔猪，或填无编号只数 → **Send N piglets** → 回 Actions，母猪当前活仔减少。

**接收：**分娩中母猪记录 → Actions → Foster piglets → **Receive piglets** → 选来源母猪 → 选她要转过来的仔猪/只数 → **Receive N piglets** → 回 Actions，当前母猪活仔增加。

接收对象应是正在哺乳的母猪，或刚断奶后做奶妈的母猪；后备猪、妊娠母猪不可以接收。编号在这里用于找到、选择已有仔猪，未发生给予或修改身份。

本轮实际样例：送出 2 只有编号 + 1 只无编号，活仔 **9 → 6**；独立接收样例接收 2 只无编号，活仔 **9 → 11**。见截图 A、B 组。

### 5. 结束这一窝分娩

母猪计数记录 → **Finish farrowing** → 填 Weak、Deformed，确认 Assisted 的 No / Yes，可填整窝重量 → **长按 Finish farrowing** → 已结束记录。

没有记录出生或有未保存草稿时不能完成。完成后 Born 锁定；不再通过 Care、身份、数量核对或普通编辑改变 Born。完成后的记录可以看 Details、比较本批次/前几窝、进入日志 Undo 顶端符合条件的后续记录。

### 6. 结束分娩后的仔猪：先选仔猪，再送出或移栏

**寄养送出：**已结束母猪记录 → **Piglets** → 勾选已有编号的仔猪 / 搜索或扫描选中 / 填无编号只数 → **Actions · N → Foster** → 选接收母猪 → 确认接收母猪和仔猪 → **Send N piglets** → 回 Piglets；剩余仔猪继续留着，送出的进入 Sent and moved。

**移栏：**同样先选仔猪 → **Actions · N → Move** → 搜索栏位或扫描栏牌 → 选目标栏 → 回 Piglets，记录移栏结果。当前原栏不可选。

这条 Foster 没有 Send / Receive 切换，因为待送出的仔猪已选好。其 Actions 只有 Foster / Move，不增加 Care、给予身份、编辑性别体重、数量核对或新的死亡入口。

**活母猪结束分娩后仍要接收：**当前已批准路径是 **已结束母猪记录 → Actions → Foster piglets → Receive piglets**。因此现阶段保留活母猪 Actions 的 Send / Receive；不能为了删除看似重复的 Foster，把接收入口一起删除。若以后统一入口，应先明确接收的新落点，另行展示方案。

本轮实际样例：已结束记录有 8 只活仔，从 Piglets 选 3 只送出后，列表剩 **5**，并显示 3 只的送出记录。独立 Move 样例选 2 只移到 B2，列表剩 **6**。见 C、D、F 组。

### 7. 母猪死亡之后

母猪死亡记录 → **Piglets · Foster or move** → 选择仔猪 → Actions → **Foster / Move**，后续与上面的送出、移栏链路相同。没有接收进死亡母猪的选项。

没被寄养或移走的仔猪留在原栏人工哺育，不需要额外 Keep / Allocate 按钮。还可以从母猪记录的 **Record dead** 登记剩余仔猪死亡。全部仔猪寄养、移栏或登记死亡后，这头母猪才退出 Room；任务统计仍保留这次结果。

母猪自己的 Actions 中健康、日常和生产操作置灰，备注仍可加/改；仔猪的 Foster / Move 通过 Piglets 进入。不能据“母猪操作不可用”禁止剩余仔猪被处理。见 E 组。

### 8. 流产、未孕、移出批次等退出状态

| 状态 | 现状与边界 |
| --- | --- |
| 流产但仍有活仔 | 保留 Room 行，点开有流产原因、窝汇总、日志、Record dead、母猪 Actions；**目前没有 Piglets，Actions 也没有 Foster**。因此当前不能宣称寄养/移栏链路完整。建议补 Piglets 的送出/移栏路径，接收资格不扩展。 |
| 流产且没有活仔 | 离开 Room，在任务结果/日志保留记录。 |
| 未孕 | 看 Production log；不是继续数仔猪。 |
| 移出批次 | 当前共享 Batch membership 有此路径；归 pig-profile，结果保留在任务汇总。不能把其存在当成新批准的分娩任务操作。 |
| 母猪死亡且没有剩余活仔 | 离开 Room；任务结果仍保留。 |

### 9. 栏位与整个任务

| 路径 | 能做什么 |
| --- | --- |
| Room 栏位标题 → 栏位详情 | 查看栏位、母猪/活仔情况；写/改栏位备注、读饲喂指导、报告设备故障、查看/处理故障、看 Pen log。所属功能为 Inspection。 |
| Task overview | 看全任务各单元进度、完成数、生产结果；换单元、进 End task。 |
| End task → Still farrowing / 未保存记录 | 结束被阻止；点进去找出相应母猪，继续保存/完成，再返回检查。 |
| End task → 尚有待产母猪 | 看将移出批次的母猪；确认后长按 End task early。 |
| End task → 全部完成 | 检查统计，长按结束任务。 |
| End task → 死亡/流产/未孕/移出批次 | 分组查看具体母猪记录、复核统计；仍在分娩时不能跳过阻止条件。 |
| 结束任务 → Receipt → Today | 看回执、结束时间/操作人和统计；各入口回到已结束任务/回执，不重新打开进行中 Room。 |

### 10. 仔猪处理任务中的工作

按日龄的补铁等处理、给予/修改耳标或耳缺、录性别和体重、该任务的数量核对，在 **Piglet processing 自己的任务链路**里定义。本轮不把它们嵌回分娩母猪 Actions，也不新建已批准入口来替代该功能的未决设计。

## 发现的问题与修正顺序

| # | 不一致 / 缺口 | 来源与现状 | 修正范围 |
| --- | --- | --- | --- |
| 1 | 把照原型登记的 Care / 身份页面当成分娩已批准范围 | main 明确 Out；本分支改写了 PRD In / Out，并在 feature notes、历史审核文档和 PR 描述中写成保留 | 撤回这项范围扩张；分娩链路移除 processing / identity / 从 Care 进入的 selected mortality。保留独立任务原有成熟度。更正 PRD、feature notes、flow、登记分组、审核记录和 PR 描述。 |
| 2 | 只删一个 Piglet processing 按钮还会有后门，并可能误删寄养 | `connectSowDetail()` 还构造一个 processing 任务；共享 Actions 会在 host 行消失后补通用任务行。Foster 的 `scope` 目前也被挂在 `piglet-processing` | 同时核对 host action、传给档案的任务、Current tasks 回调和 scope 筛选；切断分娩内部 processing 的后门，把已批准寄养与其依赖解除。不能误删真正猪档案中的独立任务导航。 |
| 3 | Reconcile 仍以灰色占位留在分娩 Actions | 本分支把旧可写页退为禁用，但没有批准的 Count 落点；其旧原型存在不能证明范围 | 本轮从分娩菜单撤回该项，不提供更改锁定 Born 的旁路。 |
| 4 | **本轮回归：直接 Record dead 被限制为无编号只数** | 当前样例活仔 8，其中无编号 5，直接入口在 +5 死亡时全部加号禁用；main 同样 +5 草稿时仍可继续。`death()`、`reportDeath()`、`deadStep`、`saveDeath` 都受新身份逻辑影响 | 移除 Care / 身份入口时一并解除死亡登记的依赖；恢复分娩死亡按活仔数的边界。已有编号选择如何追踪属于相应任务的设计，不能阻断分娩核心记录。见 G 组。 |
| 5 | **既有缺口：流产后仍有活仔，却没有 Piglets 管理入口** | `locked()` 的 abortion 分支没有 `litterDoor()`；生产 scope 过滤后 Actions 也没有 Foster。本轮实走复现。流产表单还一律说 Sow leaves this batch，与活仔留在 Room 的条件表达不清 | 补齐“有活仔”的 Piglets → Foster / Move，统一确认文案；不自动赋予该母猪 Receive 资格。见 H 组。 |
| 6 | **既有中断：单元通用 Feed / Transfer 选猪后走不通** | 两个 batch 入口/host 传参和 main 相同。Transfer 被当 bulk form 打开，无对应表单，空白；Feed 被当 pen feed 页面打开，却没传 `penId`，出现 `Cannot read properties of undefined (reading 'id')` | 保持通用菜单边界。Feed 接所属饲喂操作，Transfer 按 Move 的成熟度接合法入口或明确占位，不能生成一个假完成链路。 |
| 7 | flow 登记没有充分区分状态，且仍把越界页当正常链路 | `feature.json` 同时登记 Room → history（包含 abortion）和 Room → locked（有活仔 abortion）；死亡母猪/活母猪列表返回、Care 链路与新范围都需对照 | 以实际状态路由和本次范围为准逐项更新，不用替换全部旧页面的方式制造范围批准。69 页逐项表单列现状。 |

## 组件核对与实现时要保留的边界

- **共享 Actions**：使用 Inspection / pig-profile 的菜单和禁用规则。功能归属与状态先判定，属于该状态但不可做的行按既有约定置灰；本就不在本轮范围的独立任务入口不能用“置灰”变成批准项。
- **Row**：分娩 Piglets 保留已有编号选择、无编号数量行、搜索/扫描选择；这里不提供编辑身份的门。此前因独立 identity 编辑而添加的 `selectDisabled` 等共享能力要检查其他使用者，不能为撤回分娩入口盲目删除组件 API。
- **Lookup**：Find / Scan 保留此前已批准的全屏版本。搜索猪、选择批量猪、选择寄养母猪、选择仔猪有不同对象和选择语义，不互相替代。
- **Stepper / 死亡表单**：核心分娩死亡入口要独立可用；修正数量限制时同步入口、保存、Undo 与日志统计，保留 Put down 等七种原因。
- **PenMap**：已合在同一 PR 的传播改动保持原范围；这次没有修改地图、共享组件或其批准记录。
- **TaskDay / 仔猪 Care 组件用法**：按独立仔猪处理任务的成熟度记录；撤回分娩入口不代表批准该任务的整套交互。

## 验证与交付状态

- 对照 main PRD 的范围和 11 月 3 日明确决定，并检查独立 Piglet processing PRD。
- 对照 main 与候选的通用 Actions 目录、batch host、母猪目录、任务注入、scope 筛选、状态路由、死亡数量限制和保存。
- 本轮实际走完并截图：分娩中送出 3 只、分娩中接收 2 只、已结束后送出 3 只、已结束后移栏 2 只、母猪死亡后送出 2 只。另核对已结束后接收入口、待产/死亡母猪菜单、流产后活仔入口缺失、死亡上限与 main 的差异，以及单元 Feed / Transfer 中断。
- 本轮新增审核文档和截图，不改 `ux/`、`feature.json` 或 Atlas，不把本审核标成新设计批准。
- 本轮文档检查：36 张截图均为 390 × 844，截图总览无坏图；69 个 screen ID 与 feature.json 一一对应；本地链接、JSON、`git diff --check` 和 `node scripts/build-atlas.mjs --check` 通过。见 [验证记录](verification.json)。
- 本轮未重跑全量 gate 或 69 页 UI 自动回放。前一轮 gate 的通过只证明当时测试覆盖内的机械检查，不推翻本次范围问题，也没有覆盖上述死亡身份依赖回归。
- 后续修正仍使用 **同一分支和 PR #317**；先把修正方案和受影响状态展示清楚，再更新原型与 Atlas。当前不能以本次校对材料宣称产品修正已经完成。
