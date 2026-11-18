# Farrowing Actions 范围复核与操作链路

2026-11-18。已按确认的范围修正原型。本轮点击验证使用网页原型的独立样例，截图为 390 × 844。

- [更新后的操作截图和 Production 状态表](review.html)
- [66 个当前登记页面的入口逐项表](screen-inventory.md)
- [实际菜单验证数据](production-states.json) · [截图索引](screenshots.json)
- [修正前复核记录](https://github.com/xia16/Sentri-UI/blob/97c16425d163b5d0414e6aede0b2677ac4ccb6c5/features/farrowing/actions-scope-round/README.md)

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

| 入口 | 对谁操作 | 修正后内容 | 使用条件 |
| --- | --- | --- | --- |
| Room 底部 → Actions，副标题 Pigs in Unit 7 | 当前单元选中的一头或多头猪，包括不在分娩任务里的猪 | Condition、Treat、Care、Note、Measure、Feed、Transfer，共 7 项；与 main 菜单相同 | 保持这 7 项通用菜单，不加入生产任务、流产、寄养、身份、死亡登记。这里的 Care 是健康护理指示。Feed 按已有饲喂计划判断可用性，Transfer 显示可返回的占位页。 |
| 点某头母猪 → 分娩记录 → Actions | 当前母猪 | 通用健康/日常操作、备注。Production 按状态显示流产、未孕、寄养和共享 Batch membership | 分娩自己的操作保留流产、未孕和已批准的寄养。仔猪处理、身份和 Reconcile 由对应任务定义。其余共享操作沿用 pig-profile 的规则，不能借本轮扩充为分娩批准范围。 |
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
| Feed | 调整饲喂 | 进入共享饲喂编辑器。样例没有饲喂计划时显示不可调整。 |
| Transfer | 转移选中的猪 | 选猪后显示批量转移暂不可用的占位页，Back 回到已选猪只。 |

Choose pigs 只选择当前单元的在场活猪。筛选可以区分“在分娩任务 / 其他”和是否有健康问题。读到其他单元、离场猪或未知耳标时显示对应信息，不勾入当前选择。该菜单没有生产任务和死亡登记。

### 3. 待产与分娩中

| 路径 | 能做什么 | 限制 / 保存点 |
| --- | --- | --- |
| 母猪记录 → + Born alive | 累加本次新出生的活仔 | 本次未保存；减号只退回本次加数，不减少既有保存。 |
| 母猪记录 → Death / Report death → Born dead | 记录死胎、木乃伊胎 | Done 带回本次草稿，回母猪记录 Save 才保存。 |
| 母猪记录 → Death → Died after birth | 按压死、腹泻、饿死、安乐处置、其他记录死亡，可带照片 | 同上；按现有活仔数限制可登记的死亡数。 |
| 母猪记录 → Death → The sow | 选母猪死亡原因，可填 Other 说明与照片 | 长按保存母猪死亡，结束这头母猪的分娩；有存活仔猪时仍保留仔猪处理路径。 |
| 本次计数 → Save / Clear | 保存 / 清除本次草稿 | 有草稿时不能跨过 Finish。 |
| Alive 卡片 → Details → Farrowing log | 看这一窝的明细、过程记录 | 日志顶端符合条件的记录可 Undo，逐条撤销，保留撤销痕迹；Finish 是不可跨越的底线。 |
| 母猪记录 → Actions → Record abortion | 登记流产与原因 | 分娩未结束时可用；有活仔时母猪仍留在 Room，从 Piglets 送出或移栏。 |
| 母猪记录 → Actions → Mark not in pig | 登记未孕与原因 | 已经记过一窝时不可用；不能拿它清空已有产仔记录。 |
| 母猪记录 → Actions → Foster piglets | 送出仔猪，或从别的母猪接收仔猪 | 有活仔时可用。登记过一窝但活仔为零时置灰。 |
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
| 流产但仍有活仔 | 保留 Room 行。打开可查看流产原因、窝汇总和日志，可从 Record dead 登记死亡，也可通过 Piglets 选仔猪寄养送出或移栏。母猪 Actions 的 Production 仅列共享 Batch membership。 |
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

## 修正结果

- 移除 Farrowing 的仔猪处理、身份、从 Care 进入的选仔猪死亡记录及 Reconcile 入口，并清理任务跳转和 Atlas 登记。
- 在单头母猪 Production 中保留按条件可用的流产、未孕、寄养和共享 Batch membership。Piglets 的选择、Foster / Move 使用既有共享组件。
- 恢复分娩 Record dead 和 Report death 按活仔数登记。若剩余活仔少于记录里的编号数量，Piglets 提示先核对编号后再寄养或移栏。
- 流产后有活仔时保留 Piglets 和仅送出的寄养入口。流产确认页说明记录何时留在产房。
- 批量 Feed 进入共享编辑器。样例缺少饲喂计划时显示原因。Transfer 提供占位和返回路径。

截图验证覆盖待产、分娩中、已结束、有活仔的流产、母猪死亡和活仔归零等状态。寄养、接收、移栏和死亡登记均走到保存后的记录。查看 [验证记录](verification.json)。
