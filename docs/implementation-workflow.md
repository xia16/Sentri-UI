# Sentri-UI → Android 实现与反哺流程

Sentri-UI 保存产品意图、交互状态和视觉规则；`../Sentri-Android-App` 用 Kotlin + Compose 实现并验证真实设备、会话、接口及离线行为。两者是相邻仓库，目前没有 Gradle 或发布包依赖。HTML/CSS/JS 原型是交互与视觉参考，不是要复制到原生工程的实现代码。

本流程用于**已提出 Android 开发需求**时的设计交接与实现反馈。新功能的设计探索仍见 [Design workflow](design-workflow/README.md)；其中的 `/design` 是当前设计入口，包含独立的产品评审和交付步骤。

## 1. 定位需求和设计成熟度

从 `features/<slug>/PRD.md` 读取问题、范围、规则、决定及未决项；从同目录 `feature.json` 找稳定 screen ID、`status`、`url`、状态和相关 feature。继续按实际链接读取 `ux/tasks/<slug>/` 中的 handoff、contract、scenario、原型，以及 `ux/design-system/README.md`、使用到的组件卡片、tokens、ADR 和文案规则。设计版本用 Sentri-UI 的 commit SHA 记录。

`features/` 是索引，不是“全部已批准”的标记。`placeholder`、`in-design`、候选组件、PRD 的 `Open` 项及 handoff 中的暂定决定，都须按原状态对待。只有相关范围、状态、文案和交互有明确交付证据时，才把它作为 Android 的实现验收依据；缺口应列出来，能独立推进的基础工作继续推进。不要仅凭原型能点击就推断服务端能力或产品决定已定。

## 2. 对齐实现契约

每个需求在 Android 的本地任务记录或实现说明里留下简短映射：feature slug、Sentri-UI commit、目标 screen ID/状态、对应原型或 handoff、复用的组件/规则、所需后端 operation、离线与设备条件、待确认项。开发前对照 Android 的 `docs/integration.md`、`docs/migration.md`、GraphQL schema/operations 和已有代码；真实后端契约与设备能力由验证结果判定。

若 PRD、原型、现有 Android 行为或后端互相矛盾，记下**具体场景、证据、影响的状态及建议**。业务语义、身份/计数、权限、不可逆操作或已批准组件的全局变化由产品所有者决定；可以继续做不依赖该决定的工作。技术适配（如 Compose 布局、无障碍、系统返回、输入法、进程恢复）由 Android 处理，并在影响体验时反馈给 Sentri-UI。不要把暂定原型规则直接写成生产业务规则。

## 3. 实现并同步反哺

先复用设计系统已有组件语义，再在 Compose 中建立对应实现；设计 token 转为 Android 资源时检查密度、字号、触控尺寸和系统行为。无需为了 HTML 结构而扭曲原生组件。实现一条可运行的端到端路径，再覆盖 PRD 所列的空态、加载、错误、离线、部分成功、取消、重试、权限和恢复状态中适用的分支。

实现中发现设计问题时，按影响更新 Sentri-UI 的源头：

| 发现 | 回写位置 | 判定 |
| --- | --- | --- |
| 局部文案、状态或流程遗漏 | `features/<slug>/PRD.md`、`feature.json` 和对应原型/contract | 同时更新关联状态与中英文文案；语义变化先形成具体产品方案 |
| 可复用组件缺口 | `ux/design-system/` 的组件卡片、tokens/ADR、共享实现及受影响原型 | 先检查已有变体与现有使用者；候选保持候选，已批准组件的跨功能变化由产品所有者决定 |
| 后端或设备无法支持原设计 | feature 的问题/决定记录及 handoff；Android 的契约/验证记录 | 写明实际接口或设备证据、受影响路径和建议，不用假数据掩盖缺口 |
| 仅 Android 的平台适配 | Android 实现说明或 ADR；必要时在 feature 补平台差异 | 保留同一用户结果与关键状态 |

一个发现若影响多个文件，应把 PRD、screen 元数据、原型、组件卡片中的相同规则同步改到一致；未决项保持可见。设计工作流本身的修改遵守 [现有流程](design-workflow/README.md) 的独立变更要求，不混入普通功能设计改动。

## 4. 验证与交付

- Sentri-UI：对改过的原型走通相关 URL 状态和中英文；对改过的共享组件检查受影响页面。运行 `npm test`、`npm run check`，并按[设计流程](design-workflow/README.md)执行适用的场景、状态和共享组件 gate。文档改动检查链接和状态即可；未运行或受环境限制的检查要如实记录。
- Android：运行 `scripts/verify.sh`；涉及 UI、会话存储或 WebView 时执行适用设备测试与运行验证。Fake、模拟器、真机、真实登录及真实后端分别标注，未执行不能写成通过。
- 交付说明同时列出两个仓库的修改路径和 commit/工作树状态、采用的 Sentri-UI 版本、已覆盖的 screen/状态、设计反馈、仍待产品决定的点及验证证据。未获授权时不推送、不发布。

需求完成的条件是：已实现范围能从 PRD/状态 ID 追到 Android 行为；本次发现的设计差异已回写或明确登记为未决；相关验证执行并如实记录。
