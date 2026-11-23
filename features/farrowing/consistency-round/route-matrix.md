# Farrowing 实际入口 → 页面矩阵 · 2026-11-17

从真实控件进入，每行独立重开 390 × 844 原型。期望页面按本轮确认的最新版规则填写；`运行态` 是 Atlas 当前 ID。Scan 示例中没有 Finished、Sow died 和生产结果耳标，相关行只在浏览器内替换一条读卡样例，仍使用原型的扫描事件与路由；仓库文件未因此改动。

| 入口与状态 | 期望页面 | 运行态 | 打开的内容 | 核对 |
|---|---|---|---|---|
| Home Overview | `farrowing.room` | `farrowing.room` | room · 000418 | ✓ |
| Home Unit 7 | `farrowing.room` | `farrowing.room` | room · 000418 | ✓ |
| Room All → Awaiting | `farrowing.before` | `farrowing.before` | count · 000392 | ✓ |
| Room Awaiting tab → Awaiting | `farrowing.before` | `farrowing.before` | count · 000392 | ✓ |
| Find → Awaiting | `farrowing.before` | `farrowing.before` | count · 000392 | ✓ |
| Room All → Farrowing | `farrowing.count` | `farrowing.count` | count · 000418 | ✓ |
| Room Farrowing tab → Farrowing | `farrowing.count` | `farrowing.count` | count · 000418 | ✓ |
| Find → Farrowing | `farrowing.count` | `farrowing.count` | count · 000418 | ✓ |
| Room All → Finished | `farrowing.locked` | `farrowing.locked` | locked · 000406 | ✓ |
| Room Finished tab → Finished | `farrowing.locked` | `farrowing.locked` | locked · 000406 | ✓ |
| Find → Finished | `farrowing.locked` | `farrowing.locked` | locked · 000406 | ✓ |
| Room All → Sow died | `farrowing.ended` | `farrowing.ended` | locked · 000399 | ✓ |
| Room Sow died tab → Sow died | `farrowing.ended` | `farrowing.ended` | locked · 000399 | ✓ |
| Find → Sow died | `farrowing.ended` | `farrowing.ended` | locked · 000399 | ✓ |
| Room Done → Aborted with a live piglet | `farrowing.locked` | `farrowing.locked` | locked · 000392 · abortion | ✓ |
| Find → Aborted with a live piglet | `farrowing.locked` | `farrowing.locked` | locked · 000392 · abortion | ✓ |
| Room Done → Not in pig | `farrowing.history` | `farrowing.history` | history · 000392 · not-in-pig | ✓ |
| Find → Not in pig | `farrowing.history` | `farrowing.history` | history · 000392 · not-in-pig | ✓ |
| Room Done → Removed from batch | `farrowing.history` | `farrowing.history` | history · 000392 · removed | ✓ |
| Find → Removed from batch | `farrowing.history` | `farrowing.history` | history · 000392 · removed | ✓ |
| Aborted without a live piglet leaves Room | `farrowing.room` | `farrowing.room` | room · 000418 | ✓ |
| Aborted without a live piglet leaves Find | `farrowing.search-none` | `farrowing.search-none` | roomSearch · 000418 | ✓ |
| Find → same-unit non-task pig | `farrowing.pig-not-in-task` | `farrowing.pig-not-in-task` | roomPig · 004305 | ✓ |
| Find → other-unit non-task pig | `farrowing.pig-not-in-task` | `farrowing.pig-not-in-task` | roomPig · 000434 | ✓ |
| Find → sow → Back keeps results | `farrowing.search-results` | `farrowing.search-results` | roomSearch · 000392 | ✓ |
| Find → Scan → Back | `farrowing.search` | `farrowing.search` | roomSearch · 000418 | ✓ |
| Find → no match | `farrowing.search-none` | `farrowing.search-none` | roomSearch · 000418 | ✓ |
| Scan → Awaiting | `farrowing.scan-read` | `farrowing.scan-read` | count · 000431 | ✓ |
| Scan → other-unit non-task pig | `farrowing.pig-not-in-task` | `farrowing.pig-not-in-task` | roomPig · 000434 | ✓ |
| Scan → other-unit task sow | `farrowing.scan-read` | `farrowing.scan-read` | count · 004318 | ✓ |
| Scan → unknown tag | `farrowing.scan-unknown` | `farrowing.scan-unknown` | roomScan · 000418 | ✓ |
| Scan → Farrowing | `farrowing.scan-read` | `farrowing.scan-read` | count · 000418 | ✓ |
| Scan → Finished (substituted reader tag) | `farrowing.scan-read` | `farrowing.scan-read` | locked · 000406 | ✓ |
| Scan → Sow died (substituted reader tag) | `farrowing.scan-read` | `farrowing.scan-read` | locked · 000399 | ✓ |
| Scan → Aborted with a live piglet (substituted reader tag) | `farrowing.scan-read` | `farrowing.scan-read` | locked · 000392 · abortion | ✓ |
| Scan → Not in pig (substituted reader tag) | `farrowing.scan-read` | `farrowing.scan-read` | history · 000392 · not-in-pig | ✓ |
| Scan → Removed from batch (substituted reader tag) | `farrowing.scan-read` | `farrowing.scan-read` | history · 000392 · removed | ✓ |
| Scan → Aborted without a live piglet (substituted reader tag) | `farrowing.pig-not-in-task` | `farrowing.pig-not-in-task` | roomPig · 000392 | ✓ |
| Scan → sow died with no piglets (substituted reader tag) | `farrowing.pig-gone` | `farrowing.pig-gone` | roomPig · 000399 | ✓ |
| Scan → sow → Back still listening | `farrowing.scan` | `farrowing.scan` | roomScan · 000431 | ✓ |
| Scan without reader | `farrowing.scan-no-reader` | `farrowing.scan-no-reader` | roomScan · 000418 | ✓ |
| Scan stopped | `farrowing.scan-stopped` | `farrowing.scan-stopped` | roomScan · 000418 | ✓ |
| Farrowing record → sow Actions | `farrowing.sow-actions` | `farrowing.sow-actions` | profile · 000418 | ✓ |
| Finished record → sow Actions | `farrowing.sow-actions` | `farrowing.sow-actions` | profile · 000418 | ✓ |
| Sow died record → sow Actions | `farrowing.sow-actions` | `farrowing.sow-actions` | profile · 000418 | ✓ |
| Farrowing Actions → Note | `farrowing.note` | `farrowing.note` | marker · 000418 | ✓ |
| Farrowing Actions → Piglet processing | `farrowing.piglet-care` | `farrowing.piglet-care` | pigletCare · 000418 | ✓ |
| Farrowing Actions → Foster | `farrowing.foster` | `farrowing.foster` | foster · 000418 | ✓ |
| Farrowing Actions → Reconcile unavailable | `farrowing.sow-actions` | `farrowing.sow-actions` | profile · 000418 | ✓ |
| Finished Actions → Note | `farrowing.note` | `farrowing.note` | marker · 000418 | ✓ |
| Finished Actions → Piglet processing | `farrowing.piglet-care` | `farrowing.piglet-care` | pigletCare · 000418 | ✓ |
| Finished Actions → Foster | `farrowing.foster` | `farrowing.foster` | foster · 000418 | ✓ |
| Finished Actions → Reconcile unavailable | `farrowing.sow-actions` | `farrowing.sow-actions` | profile · 000418 | ✓ |
| Sow died Actions → Note | `farrowing.note` | `farrowing.note` | marker · 000418 | ✓ |
| Sow died Actions → Reconcile unavailable | `farrowing.sow-actions` | `farrowing.sow-actions` | profile · 000418 | ✓ |
| Sow died Actions → piglet actions unavailable | `farrowing.sow-actions` | `farrowing.sow-actions` | profile · 000418 | ✓ |
| Farrowing Actions → Piglet records → Record dead | `farrowing.death-selected` | `farrowing.death-selected` | death · 000418 | ✓ |
| Finished Actions → Piglet records → Record dead | `farrowing.death-selected` | `farrowing.death-selected` | death · 000418 | ✓ |
| Farrowing selected death → visit draft | `farrowing.count-draft` | `farrowing.count-draft` | count · 000418 | ✓ |
| Farrowing selected death → Save visit | `farrowing.count-saved` | `farrowing.count-saved` | count · 000418 | ✓ |
| Finished selected death → Save directly | `farrowing.piglet-care` | `farrowing.piglet-care` | pigletCare · 000418 | ✓ |
| Piglet identity requires tag or notch | `farrowing.piglet-identity` | `farrowing.piglet-identity` | pigletEdit · 000418 | ✓ |
| Finished record → Piglets | `farrowing.piglets` | `farrowing.piglets` | pigletList · 000418 | ✓ |
| Sow died record → Piglets | `farrowing.piglets` | `farrowing.piglets` | pigletList · 000418 | ✓ |
| Sow died record → Record dead | `farrowing.death` | `farrowing.death` | death · 000418 | ✓ |
| Farrowing record → Details → log | `farrowing.history` | `farrowing.history` | history · 000418 | ✓ |
| Finished record → Details → log | `farrowing.history` | `farrowing.history` | history · 000418 | ✓ |
| Task overview → End task blocked | `farrowing.task-blocked` | `farrowing.task-blocked` | roomEndTask · 000418 | ✓ |
| Task outcomes preset → End task | `farrowing.task-outcomes` | `farrowing.task-outcomes` | roomEndTask · 000418 | ✓ |

共 69 条，69 条对齐，0 条差异。详情和可重跑结果见 [route-results.json](route-results.json)。
