# Canvas

- [转舍 · 负责人场景与产品决策评审](review-canvas/canvas.html)（2026-11-11，离线画布）：按需转舍的五个 `in-design` 状态实图、原子性／计数／离线／权限等待裁定规则及受影响状态。图片由 `review-canvas/mock.mjs` 从实时页面渲染，`review-canvas/canvas.src.html` 经 `node scripts/canvas.mjs` 内嵌成单文件。本画布用于范围和产品问题评审，尚无负责人同意或 screen approval；没有改动原型和 atlas。
- [初始场景 ledger 快照](review-canvas/ledger-initial.json)：由 `node scripts/scenario-ledger.mjs move init` 生成的 62 行初始状态，全部 Pending，尚无走查轮次。脚本的工作 ledger 在被 Git 忽略的 `review/scenarios/move/ledger.json`；此文件只是供分支评审的同内容快照，不能代替未来的走查结果。
