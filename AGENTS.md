# Sentri-UI

本仓库保存 Sentri 产品需求、状态原型和移动端设计系统。开始功能设计或修改前，先看 [README.md](README.md) 与 [设计流程](docs/design-workflow/README.md)。

- Android 需求的设计交接、版本追踪和实现反哺见 [实现与反哺流程](docs/implementation-workflow.md)。从 `features/<slug>/PRD.md`、`feature.json` 出发，按链接进入原型与组件卡片；确认状态和未决项再实现。
- `ux/design-system/` 是当前组件与视觉规则源；`archive/` 是历史材料。候选组件、`in-design` 和占位 feature 保持其原有成熟度，不能默认为已批准。
- 产品语义、身份/计数、权限、不可逆操作以及已批准组件的跨功能变化，先给出具体方案和受影响状态。常规可逆的文档、原型及组件修正自主完成，并同步相关来源。
- 设计流程本身的改动按 [设计流程](docs/design-workflow/README.md) 单独处理，单独提 PR，不混在设计 PR 里。不自动启动多代理设计流程。
- 提交方式：不直接推送到 `main`（`main` 是保护分支，直接推送会被拒绝）。在自己的分支和 worktree 上工作，推送分支并提交 PR；gate（`node scripts/gate.mjs`）通过、`sentri/gate` 状态为成功后才能合并。未完成的功能留在自己的分支上。

Working here (English): never push to `main` (it is protected). Work on your own branch in a worktree, push the branch and open a pull request; it merges only after the gate (`node scripts/gate.mjs`) passes and the `sentri/gate` status is green. Unfinished work stays on its branch. Workflow changes go in their own PR. Never link `node_modules` into a worktree (set `SENTRI_PLAYWRIGHT` instead), and remove a worktree with `node scripts/worktree-remove.mjs <dir>`: `git worktree remove --force` deletes through a junction on Windows and empties the main checkout's `node_modules`. Don't start the multi-agent design workflow on your own.
