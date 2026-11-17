# Farrowing 页面 × 入口复核矩阵 · 2026-11-17

基线：`origin/main` `df82ba5d`（PR 315）。`feature.json` 有 **66 个 screen、132 条内部 flow、2 条 Home ways in**。本轮把 66 个 screen 全部按其 preset/steps 在真实原型重放，另从实际入口运行 62 条 Farrowing 场景（Home、状态、Find、Scan、Pen map、Finish/Undo、Piglets/Foster、批量 Actions），均通过其当前场景断言。场景通过只证明当前原型按这些路径可达；下表仍对照更晚批准的规则与元数据。

最新版依据（均已合并；旧轮次保留历史但不是当前基线）：

- **V1 入口与列表**：2026-10-22 PR 289 的单任务 Find/Scan 与批量 Actions；Room 状态色随后由 PR 297，Row 由 PR 310 更新。
- **V2 计数与记录**：PR 291/292 的 visit draft，2026-11-03 PR 306 的 Undo/Details/第七死因，PR 311 的 withdrawn log 文案，PR 315 的死亡白卡片。
- **V3 全任务**：PR 294 的 End task、PR 297 的进度色；死因统计需跟随 PR 306 的 Put down。
- **V4 Piglets/Foster**：2026-11-03 PR 310 的 Piglets 清单、Send/Move 与 Foster；PR 315 的白卡片。
- **V5 Note**：2026-11-03 PR 314 的消息式 Note 与 Show for 默认 7 天。
- **V6 Pen map**：PR 195/285 的共享 PenMap 和落点动效；PR 317 尚未合并，不纳入基线。
- **V7 旧页面**：Piglet processing、Identity、Report mortality、Reconcile 仍在当前原型，但未有覆盖新规则的画布批准，须与 V2/V4 对照。
- **V8 Sow Actions**：2026-11-09 PR 315 的原位灰显与白卡片。

表内「Flow 来源」列出 `feature.json` 声称能进入该页面的来源 screen（重复边以 ×N 表示）。`—` 表示只登记了 preset、未登记内部入路。实际重放的 ✓ 表示 runtime screen ID 与目标 ID 一致。`T` 是 PenMap 900ms 落点帧：画面正确，动效结束后的 runtime ID 回到 Room，单独记录，不计作错误。差异编号见 [audit.md](audit.md)。

| 页面 | 最新版 | Flow 来源 | 实际重放 | 复核 |
|---|---|---|---|---|
| `room` | V1 | Home ×2; overview, before, count, locked, ended, history, filter, pen-map, search, batch, scan, scan-no-reader, today | ✓ | 差异 #11 |
| `count` | V2 | room, finish, history, task-blocked, foster-send, reconcile, search-results, task-sows, count-draft, litter | ✓ | 差异 #2 |
| `count-draft` | V2 | death, before, count, undo | ✓ | 差异 #2 |
| `count-saved` | V2 | count-draft, undo | ✓ | 差异 #2 |
| `undo` | V2 | count-saved | ✓ | 差异 #2 |
| `before` | V2 | room, task-ready, search-results | ✓ | 差异 #2,11 |
| `death` | V2 | before, count, locked, ended, count-draft | ✓ | 差异 #3 |
| `litter` | V2 | count | ✓ | 差异 #2 |
| `finish` | V2 | count, death | ✓ | 对齐 |
| `locked` | V2 | room ×2, finish, death, history, details | ✓ | 差异 #3 |
| `details` | V2 | locked, history | ✓ | 差异 #3,10 |
| `details-first` | V2 | — | ✓ | 差异 #10,12 |
| `history` | V2 | room, ended, task-outcomes, litter, details | ✓ | 差异 #2 |
| `piglets` | V4 | ended, locked, piglets-confirm, piglets-pen | ✓ | 差异 #4,13 |
| `piglets-ticked` | V4 | piglets, piglets-pen | ✓ | 差异 #4,13 |
| `piglets-actions` | V4 | piglets-ticked | ✓ | 差异 #4,13 |
| `piglets-sow` | V4 | piglets-actions, piglets-filter, piglets-confirm | ✓ | 差异 #7,13 |
| `piglets-filter` | V4 | piglets-sow | ✓ | 差异 #7,13 |
| `piglets-confirm` | V4 | piglets-sow | ✓ | 差异 #7,13 |
| `piglets-pen` | V4 | piglets-actions | ✓ | 差异 #7,13 |
| `ended` | V4 | room, history, task-outcomes, death ×2, piglets | ✓ | 差异 #4 |
| `task-blocked` | V3 | overview | ✓ | 差异 #3 |
| `task-ready` | V3 | overview | ✓ | 差异 #3 |
| `task-complete` | V3 | overview | ✓ | 差异 #3 |
| `task-outcomes` | V3 | overview | → task-ready | 差异 #3,9 |
| `overview` | V3 | room, task-blocked, task-ready, task-complete, task-outcomes | ✓ | 差异 #3 |
| `task-receipt` | V3 | task-ready, task-complete, task-outcomes | ✓ | 差异 #3 |
| `foster` | V4 | count, foster-send | ✓ | 差异 #7,12 |
| `foster-search` | V4 | — | ✓ | 差异 #7,12 |
| `foster-scanning` | V4 | — | ✓ | 差异 #7,12 |
| `foster-send` | V4 | foster | ✓ | 差异 #7,12 |
| `foster-filter` | V4 | foster | ✓ | 差异 #7 |
| `reconcile` | V7 | count | ✓ | 差异 #6,12 |
| `filter` | V1 | room | ✓ | 对齐 |
| `pen-map` | V6 | room | ✓ | 对齐 |
| `pen-landed` | V6 | — | → room | 动效 T |
| `pen-landed-live` | V6 | — | → room | 动效 T |
| `pen-landed-plain` | V6 | — | → room | 动效 T |
| `search` | V1 | room | ✓ | 差异 #11 |
| `search-results` | V1 | search | ✓ | 差异 #11,12 |
| `search-none` | V1 | search-results | ✓ | 差异 #11 |
| `scan` | V1 | search, room, scan-read, scan-unknown, scan-stopped | ✓ | 差异 #11 |
| `scan-no-reader` | V1 | search, room | ✓ | 差异 #11 |
| `scan-read` | V1 | scan | ✓ | 差异 #11 |
| `pig-not-in-task` | V1 | scan | ✓ | 差异 #11,12 |
| `pig-gone` | V1 | scan | ✓ | 差异 #11 |
| `scan-unknown` | V1 | scan | ✓ | 差异 #11 |
| `scan-stopped` | V1 | scan | ✓ | 差异 #11 |
| `batch` | V1 | room, batch-pick-none | ✓ | 对齐 |
| `batch-pick-none` | V1 | batch | ✓ | 对齐 |
| `batch-pick` | V1 | batch-pick-none, batch-form | ✓ | 对齐 |
| `batch-search` | V1 | batch-pick-none | ✓ | 对齐 |
| `batch-filter` | V1 | batch-pick-none | ✓ | 对齐 |
| `batch-waiting` | V1 | batch-pick-none | ✓ | 对齐 |
| `batch-scanning` | V1 | batch-pick-none, batch-waiting | ✓ | 对齐 |
| `batch-missed` | V1 | batch-scanning | ✓ | 对齐 |
| `batch-form` | V1 | batch-pick | ✓ | 对齐 |
| `batch-saved` | V1 | batch-form | ✓ | 对齐 |
| `task-sows` | V3 | task-blocked, task-ready | ✓ | 对齐 |
| `death-breakdown` | V2 | — | → locked; step missing | 差异 #10 |
| `today` | V1 | room | ✓ | 对齐 |
| `sow-actions` | V8 | count, locked, note; pig-profile.full (addsTo) | → batch | 差异 #1,13 |
| `note` | V5 | sow-actions | → batch; step missing | 差异 #1,5,13 |
| `piglet-care` | V7 | sow-actions, piglet-identity, piglet-death | → batch; step missing | 差异 #1,4,13 |
| `piglet-identity` | V7 | piglet-care | → batch; step missing | 差异 #1,4 |
| `piglet-death` | V7 | piglet-care | → batch; step missing | 差异 #1,3,4 |

## 判读

- 直接重放 **56/66** 个 ID 与运行态一致；**7 个**实质不一致（Actions 5、Task outcomes 1、Death breakdown 1）；**3 个** Pen map 落点是正确的瞬时画面，结束后回 Room。外部字体的偶发网络错误不影响本地画面或重放。
- `details-first`、`foster-search`、`foster-scanning`、三个 `pen-landed` 与 `death-breakdown` 在 `flow` 中没有入边；前六个实际可由相邻页进入，最后一个现在没有入口。其他缺失或错误返程边见 audit #12。
- `anchor` 的状态分组本身也要按最新入口重排，见 audit #13。
- 本表是页面与入口的覆盖索引；具体不一致、受影响状态和同步方案在 audit.md。
