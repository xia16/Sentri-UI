# Farrowing 页面 × 入口复核矩阵 · 2026-11-17

2026-11-18 范围纠正：负责人最新澄清将仔猪处理及身份工作排除在分娩外，取代本表此前的 V7 保留口径。下表保留为当时原型的回放证据；screen 登记和回放通过不代表范围批准。现行边界、69 页逐项说明和操作截图见[新复核清单](../actions-scope-round/README.md)。当前原型尚待按清单修正。

当前分支的 **69 个 screen、156 条内部 flow、2 条 Home ways in** 均列在下方。每页的最新版按已同意的画布、当前原型和组件来源判定；“Flow 来源”从当前 `feature.json` 的入边生成。每页 preset/steps 在 390 × 844 真实原型中重放，结果见 [entry-render-results.json](entry-render-results.json)。另从 Home、Room、各状态、Find、Scan、Actions、Piglets 和 End task 控件逐条进入，见 [实际入口矩阵](route-matrix.md)及 [JSON 证据](route-results.json)。

- **V1 入口与列表**：PR 289 的单任务 Find/Scan 与批量 Actions；Room 状态色由 PR 297，Row 由 PR 310 更新。
- **V2 计数与记录**：PR 291/292 的 visit draft，PR 306 的 Undo/Details/第七死因，PR 311 的 withdrawn log，PR 315 的死亡白卡片；本轮把已选仔猪带进同一死亡页。
- **V3 全任务**：PR 294 的 End task、PR 297 的进度色；本轮让 outcome 示例与七死因统计一致。
- **V4 Piglets/Foster**：PR 310 的 Piglets 清单、Send/Move 与 Foster，PR 315 的白卡片。
- **V5 Note**：PR 314 的消息式 Note 与 Show for 默认 7 天；本轮同步到母猪 Note。
- **V6 PenMap**：PR 307 的房间形状、尺寸和 Whole room；负责人 2026-11-16 同意 PR 317 画布后，本分支同步 Farrowing、Inspection 与共享组件。
- **V7 Care/身份**：原型中的 sow Actions → Piglet processing；负责人 2026-11-17 选择保留该入口，本轮同步 Piglet records 的 Row 与身份校验。独立 Piglet processing 任务仍是 in-design。
- **V8 Sow Actions**：PR 315 的原位灰显；本轮校正到具体母猪的重放步骤与状态说明。

| 页面 | 最新版来源 | Flow 来源 | 实际重放 |
|---|---|---|---|
| `room` | V1 | overview, before, count, locked, ended, history, filter, pen-map, search, batch, scan, scan-no-reader, today, pen-landed, pen-landed-live, pen-landed-plain, Home via Overview, Home via a unit | ✓ |
| `count` | V2 | room, finish, history, task-blocked, search-results, task-sows, count-draft, litter, death-selected | ✓ |
| `count-draft` | V2 | death, before, count | ✓ |
| `count-saved` | V2 | count-draft | ✓ |
| `undo` | V2 | history | ✓ |
| `before` | V2 | room, task-ready, search-results | ✓ |
| `death` | V2 | before, count, locked, ended, count-draft, sow-actions | ✓ |
| `death-selected` | V2 + V4 | piglet-care | ✓ |
| `litter` | V2 | count, count-saved | ✓ |
| `finish` | V2 | count, death | ✓ |
| `locked` | V2 | room ×2, finish, death, history, details, piglets | ✓ |
| `details` | V2 | locked, history | ✓ |
| `details-first` | V2 | locked | ✓ |
| `history` | V2 | room, ended, task-outcomes, litter, details, undo | ✓ |
| `piglets` | V4 | ended, locked, piglets-confirm, piglets-pen, foster-send, piglets-ticked | ✓ |
| `piglets-ticked` | V4 | piglets, piglets-pen, piglets-actions | ✓ |
| `piglets-actions` | V4 | piglets-ticked, piglets-sow | ✓ |
| `piglets-sow` | V4 | piglets-actions, piglets-filter, piglets-confirm | ✓ |
| `piglets-filter` | V4 | piglets-sow | ✓ |
| `piglets-confirm` | V4 | piglets-sow | ✓ |
| `piglets-pen` | V4 | piglets-actions | ✓ |
| `ended` | V2 | room, history, task-outcomes, death ×2, piglets | ✓ |
| `task-blocked` | V3 | overview | ✓ |
| `task-ready` | V3 | overview | ✓ |
| `task-complete` | V3 | overview | ✓ |
| `task-outcomes` | V3 | overview | ✓ |
| `overview` | V3 | room, task-blocked, task-ready, task-complete, task-outcomes | ✓ |
| `task-receipt` | V3 | task-ready, task-complete, task-outcomes | ✓ |
| `foster` | V4 | count, foster-send, sow-actions, foster-search, foster-scanning, foster-filter | ✓ |
| `foster-search` | V4 | foster | ✓ |
| `foster-scanning` | V4 | foster | ✓ |
| `foster-send` | V4 | foster | ✓ |
| `foster-filter` | V4 | foster | ✓ |
| `filter` | V1 | room | ✓ |
| `pen-map` | V6 | room | ✓ |
| `pen-map-long` | V6 | preset / URL | ✓ |
| `pen-map-whole` | V6 | pen-map-long | ✓ |
| `pen-map-group` | V6 | pen-map-whole | ✓ |
| `pen-map-mixed` | V6 | preset / URL | ✓ |
| `room-single` | V6 | preset / URL | ✓ |
| `pen-landed` | V6 | pen-map | T → room |
| `pen-landed-live` | V6 | pen-map | T → room |
| `pen-landed-plain` | V6 | pen-map | T → room |
| `search` | V1 | room | ✓ |
| `search-results` | V1 | search | ✓ |
| `search-none` | V1 | search-results | ✓ |
| `scan` | V1 | search, room, scan-read, scan-unknown, scan-stopped | ✓ |
| `scan-no-reader` | V1 | search, room | ✓ |
| `scan-read` | V1 | scan | ✓ |
| `pig-not-in-task` | V1 | scan, search-results | ✓ |
| `pig-gone` | V1 | scan, search-results | ✓ |
| `scan-unknown` | V1 | scan | ✓ |
| `scan-stopped` | V1 | scan | ✓ |
| `batch` | V1 | room, batch-pick-none | ✓ |
| `batch-pick-none` | V1 | batch | ✓ |
| `batch-pick` | V1 | batch-pick-none, batch-form | ✓ |
| `batch-search` | V1 | batch-pick-none | ✓ |
| `batch-filter` | V1 | batch-pick-none | ✓ |
| `batch-waiting` | V1 | batch-pick-none | ✓ |
| `batch-scanning` | V1 | batch-pick-none, batch-waiting | ✓ |
| `batch-missed` | V1 | batch-scanning | ✓ |
| `batch-form` | V1 | batch-pick | ✓ |
| `batch-saved` | V1 | batch-form | ✓ |
| `task-sows` | V3 | task-blocked, task-ready | ✓ |
| `today` | V1 | room | ✓ |
| `sow-actions` | V8 | foster-send, count, locked, note, foster, piglet-care | ✓ |
| `note` | V5 | sow-actions | ✓ |
| `piglet-care` | V7 | sow-actions, piglet-identity, death-selected | ✓ |
| `piglet-identity` | V7 | piglet-care | ✓ |

重放结果：66/66 个稳定页面 ID 与运行态一致；3 个 PenMap 落点帧是正确的瞬时画面，动效结束后回 Room。真实入口 69/69 条对齐。入口覆盖与同步前的 13 组差异分别见 [route-matrix.md](route-matrix.md)和 [audit.md](audit.md)。
