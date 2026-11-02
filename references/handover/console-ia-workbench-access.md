# Console IA, workbench and access

Extracted from the Sentri/Dahua handover (read-only), area: Console information architecture, Console and Mobile workbench/home, login, access and onboarding. All paths are relative to the handover root `Sentri-Dhua/` and in backticks. English first; the Chinese term follows on first use.

**Summary.**
- The handover holds **two unreconciled Console IAs** built on two different code bases: a 5-entry "revised home 1" (改版首页1) inside the Vaccine prototype (2026-08-07 to 08-17), and a 3-entry "function centre" (功能中心) IA of the *online* Console (2026-08-21 to 08-25). The older one's PRD was never updated for the newer.
- Login/access is well specified (SaaS multi-farm, Logto identity, code-first login, invite-token registration, visitor application with sampling). It **diverges** from the Figma sign-in (phone + password + Farm ID) and covers only part of the Figma "Users and access" area.
- Mobile "workbench" in the handover is a prototype Home (task hub) plus a Toolbox page; a separate 2026-09-03 test report covers offline behaviour of the real Android app.
- Onboarding = a four-card setup hub, effectively the same four tasks as the Figma "Console setup" checklist.
- Dates: the `Vaccine` git has no commits after 2026-08-14. Later dates here come from changelog headers and file mtimes.

**Current source-of-truth docs (best available)**

| Topic | Source of truth | Caveat |
|---|---|---|
| Console IA (online Console) | `线上Console侧边栏整理预览.html` + `修改日志/修改日志-2026-08-25-Console信息架构预览.md` | Wireframe with mock data; no PRD |
| Console home inside Vaccine prototype | `Vaccine/prds/console/00-Console工作台首页-PRD.md` (working copy, 2026-08-17; uncommitted) | Covers vaccine/culling/semen/inventory/finance only |
| Login, farm choice, farm switch | `Vaccine/prds/saas-login/04-新登录流程-PRD.md` (2026-07-03) | Console only; no Mobile login spec |
| Staff registration / presence / visitor | `Vaccine/prds/saas-login/01`, `02`, `03` | 01 and `UNIFIED_ACCESS_FLOW.md` disagree on password |
| Mobile Home / Toolbox | Code + changelogs (`Vaccine/src/components/toolbox/`, `MobileVaccinationPage.tsx`) | `Vaccine/docs/MOBILE_FIELD_LAYOUT.md` is partly stale |
| Onboarding | `OnBoarding/sentri-react/docs/PRD-Onboarding.md` + `src/pages/console/onboarding/` | Demo wiring incomplete (see Open questions) |
| Mobile offline | `Vaccine/docs/offline-test-2026-09-03/测试报告-2026-09-03-Mobile生产任务离线能力多角色专项.md` | Test report on the real app, not a spec |

---

## Console navigation

### A. Vaccine-prototype Console, "revised home 1" (改版首页1), 2026-08-07 onward

Toggled by a `改版首页1` button (top right of any normal Console page); `返回原首页` returns to the old sidebar. Full-screen flows (login, onboarding) hide the button. Source: `Vaccine/prds/console/00-Console工作台首页-PRD.md`, `Vaccine/src/components/ConsoleBusinessCenterPage.tsx`, `ConsoleTaskCenterPage.tsx`, `App.tsx` (nav ~L770).

```
Sidebar (5)                                      EN
  工作台                                         Workbench
  任务中心                                       Task centre
  业务中心                                       Business centre
  数据分析  -> opens 财务分析 directly            Data analysis
  ---------
  设置                                           Settings
  [bottom] 切换到 Mobile                         Switch to Mobile

业务中心 (Business centre) categories and entries, as of 2026-08-17
  全部 All
  人员 People          员工
  免疫 Immunisation    疫苗计划配置 | 疫苗任务* | 免疫复核采样*
  治疗 Treatment       按任务类型治疗* | 按药品治疗*
  淘汰&留种 Culling    母猪淘汰&后备留种*
  精液 Semen           查看配种计划 | 精液处理 | 精液设置 | 精液出库
  库存 Inventory       库存管理 | 库存流水 | 盘点记录 | 入库记录 | 入库 | 盘点*
  财务 Finance         财务分析
  设置 Settings        初始化 | 登录流程 | 物料管理
  (* = also listed in 任务中心)

任务中心 (Task centre): the six starred entries + the existing vaccine-task list (search by name / ID / status)
Not entries (opened from lists): 任务详情, 批次详情
```

Workbench (工作台) content in this version: today's to-dos (vaccine tasks to issue, culls to confirm, immunity results to review, inventory risk), run overview (to inject, running, done this week, exceptions), common actions (`查找任务`, `创建疫苗任务`, both open the vaccine task page), business-centre shortcuts, recent visits (first 3 vaccine tasks). Counts for cull / review / inventory / weekly done are mock; the PRD says the real version needs an aggregate API and permission filtering.

**The old sidebar it replaced** (`App.tsx` ~L700): 人员 (员工) / 免疫 (疫苗计划配置, 疫苗任务, 免疫复核采样) / 治疗 (先选任务类型, 先选药品) / 淘汰&留种 (母猪淘汰&后备留种, 任务详情, 批次详情) / 精液 (精液管理, 配种领用, 采精历史, 出库记录, 精液历史, 精液设置) / 库存 (库存管理, 入库, 盘点, 入库记录) / 财务 (财务分析) / 设置 (初始化, 新登陆流程, 物料管理). A feed route (`feed-management`) still exists as a compatibility route but has no entry.

### B. Online Console IA preview, newest = 2026-08-25

Source: `线上Console侧边栏整理预览.html` (mtime 2026-08-25 15:38), log `修改日志/修改日志-2026-08-25-Console信息架构预览.md`. It reorganises the **online** Console (33 page-level entries before 2026-08-21), not the Vaccine prototype.

```
Sidebar (3)                                      EN
  工作台                                         Workbench
  功能中心                                       Function centre (single page, 6 business tabs)
  设置                                           Settings
  [top bar] bell -> 通知与决策                    Notifications and decisions (no longer a sidebar entry)

功能中心 tabs, in this order (each: group -> entries)
 1 生产管理 Production      生产运营: 生产线, 生产批次 | 繁育资源: 精液管理
 2 猪群管理 Herd            猪群概览: 猪舍, 猪只 | 猪群流转: 转舍 | 猪只出场: 出场任务, 出场数据
 3 生物安全 Biosecurity     生物安全监控: 监控概览 | 消杀执行: 物资消杀
                            采样管理: 待采样, 待检测, 已检测, 创建采样任务
 4 厂区权限 Site access     人员权限: 待授权人员, 人员权限列表, 权限变更记录
                            进场申请: 进场申请, 进场申请记录
 5 健康与防疫 Health        猪只健康: 健康诊疗, 处方列表, 免疫计划
 6 人员管理 People          场内人员: 员工 | 外部人员: 访客
 (24 entries). Above the tabs: 搜索功能 box (cross-tab) and 常用功能 (6 most-clicked, auto-ranked).
 Entry pages are placeholders with a 3-level breadcrumb (功能中心 / tab / entry); back restores the tab.

设置 Settings: 4 domains, 9 items
  猪场基础配置 Farm base    场区布局, 栏位类型设置
  设备与物联 IoT            摄像头管理, 设备管理
  基础资料 Master data      药品管理, 疫苗管理
  权限与安全 Access         角色管理, 权限配置, 厂区权限
```

Workbench in B (wireframe, mock data): six snapshot tiles (在场存栏, 今日分娩, 今日断奶, 今日转舍, 今日死淘, 待执行出场); three attention cards (待我处理 / 风险提醒 / 等我决策); today's to-dos; risk monitoring in four groups (生产异常, 健康风险, 物资与库存风险, 生物安全); six shortcuts (生产批次, 健康诊疗, 免疫计划, 创建采样任务, 转舍, 猪舍); five recent actions. Positioned as a manager's entry, not a dashboard.
Notifications and decisions page: filter 全部 / 待处理 / 风险提醒 / 决策事项; items carry priority (high/mid/low), source module, time and a primary action that deep-links to the entry. Mock volume 2026-08-25: 4 to-do, 5 risk, 1 decision.

### How B evolved (what each step changed)

| Aspect | 2026-08-21 (v0) | 2026-08-24 launchpad (v1-v3, `Vaccine/sentri-console-launchpad.html`) | 2026-08-25 (`线上Console侧边栏整理预览.html`) |
|---|---|---|---|
| Sidebar | Home of 12 "apps" in 4 groups: 业务运营, 人员与权限, 安全与检测, 基础配置 | 4: 工作台, 通知与决策 (badge 12), 功能中心, 设置 | 3: 工作台, 功能中心, 设置 (bell replaces 通知与决策) |
| Entry structure | App -> app detail page -> modules/status views/history/create | v1 module cards -> module page; **v2/v3 module tabs** (+ `全部功能` tab, default tab 生产管理, ⌘K palette, starred / recent / "has to-do" filter) | Same page, 6 tabs, no `全部功能` tab; usage-ranked 常用功能 |
| Modules | 12 apps (list not preserved; file overwritten) | 7: 生产管理, 猪群管理, 繁育管理, 健康与防疫, 生物安全, 采样与检测, 人员管理 (24 entries) | 6: 繁育管理 deleted, 采样与检测 merged into 生物安全, **厂区权限 added** (24 entries) |
| 精液管理 | n/a | 繁育管理 / 繁育资源 | 生产管理 / 繁育资源 |
| 留种, 淘汰 | n/a | 繁育管理 / 种群结构决策 (+ 2 decision items) | **Removed** (with their notification items) |
| 猪群流转 (转舍) | n/a | 生产管理 | 猪群管理 |
| 出场 | n/a | 生产管理 / 出场管理 (任务, 数据) | 猪群管理 / 猪只出场 |
| 猪群概览 | n/a | 猪群管理 / 整体视图 (猪群概览) + 场舍与个体 | 整体视图 deleted; 场舍与个体 renamed 猪群概览 |
| Prescriptions | n/a | 处方管理: 未执行 / 执行中 / 已执行 as 3 buttons | One 处方列表 entry; states become filters inside |
| 免疫计划 | n/a | Own 免疫 group | Merged into 猪只健康 group |
| 创建采样任务 | n/a | Dashed "发起" action card | Standard card |
| Site access | n/a | Only in Settings (厂区权限) | New tab with 5 entries; workbench to-do "进厂申请" points there |

### Where each module's design lives

| Module / entry | Handover doc area | Figma file (from `references/figma/web/index.md`) |
|---|---|---|
| 工作台 / 通知与决策 | This area only (wireframes) | 🖥️ 工作台 (Home, notifications, drawers) |
| 生产线, 生产批次 | `General copy/Production Lines/探索式测试报告-2026-07-28-生产线.md` (test report only) | [Web] 生产线 is an empty cover; 🖥️ Console 初始化 has 创建生产线 |
| 精液管理 / 精液* | `Vaccine/prds/semen/`, `Vaccine/docs/semen/`, `精液管理/` | none indexed |
| 库存*, 物料管理 | `Vaccine/prds/inventory/`, `Inventory management/Inventory PRD/` | [Web] 库存管理 is an empty cover |
| 饲料 (feed) | `饲料管理/`, `Sentri_Feed_Management_PRD_v2_1_中文.html`; business-centre entry 2026-08-11 to 08-13 only | [Web] 饲喂计划 is an empty cover |
| 免疫, 治疗, 处方 | `Vaccine/prds/vaccine prd/`, `Vaccine/prds/medical-task/` | 🖥 📱 免疫 |
| 淘汰&留种 | `Vaccine/prds/culling&replacement/` | none indexed |
| 猪舍, 猪只, 转舍, 出场 | none found | 🖥️ 猪舍、猪只 |
| 生物安全, 采样, 物资消杀, 设备 | none found (test strategy only) | 🖥 采样与检测, 🖥📱 物资消杀 |
| 厂区权限, 员工, 访客, 角色 | `Vaccine/prds/saas-login/` | Sentri Console（Done), 🖥 用户厂区权限 |
| 场区布局, 初始化 | `OnBoarding/sentri-react/docs/PRD-Onboarding.md` | 🖥️ Console 初始化, 🖥 场区布局 (emptied copy) |

---

## Current flows

### 1. Console workbench / home

Two variants exist. Neither has a screen-level PRD beyond what is above.

**1a. Vaccine prototype home (A)** (`00-Console工作台首页-PRD.md`)
1. User is on a normal Console page; sidebar is the old multi-level one; `改版首页1` button top right.
2. Click: main area becomes 工作台; sidebar collapses to the 5 entries; button text becomes `返回原首页`.
3. Choose: a to-do -> opens the existing module page; 常用操作 -> vaccine task page; 业务中心 -> filter by category or search by name/description; 最近访问 -> vaccine task list.
4. Inside a feature page the new sidebar stays, the source entry stays selected, and the top bar shows `返回业务中心` / `返回任务中心` / `返回设置`. Returning to 业务中心 restores the previous category filter (e.g. back to the semen category with its four entries).
5. 数据分析 opens 财务分析 directly and shows no return link.
6. `返回原首页` restores the page the user was on and the old sidebar. The return link is not the same as `返回原首页`.
- Rules: workbench mock data is never written back; no vaccine tasks -> count 0 and empty recent list, other modules still usable; empty search -> empty state, no auto category switch; clearing search restores the category; no-permission target -> (real version) message and stay on workbench; block-level load failure -> per-block error state.

**1b. Online Console workbench (B)** (HTML preview + log 2026-08-25)
1. Land on 工作台: snapshot, attention cards, to-dos, risks, shortcuts, recent actions.
2. Bell or an attention card -> 通知与决策 page; primary action deep-links into the right entry (e.g. 3 pending entry requests -> 厂区权限 / 进场申请).
3. 功能中心: pick a tab, or type in 搜索功能, or use 常用功能; opening an entry shows a placeholder with breadcrumb; back returns to the same tab.
4. Deep links by URL hash (e.g. `#apps/production/batch`, `#settings/iot/camera`, `#inbox/risk`; from the 08-24 log, still present in the 08-25 file). Sidebar collapses at <=1080 px; entry grid 4/3/2 columns at 1440/1280/1024.

### 2. Mobile workbench / toolbox (Vaccine prototype)

Sources: `Vaccine/src/components/MobileVaccinationPage.tsx` (screen state `hub | tools | pigList | weaning | treatmentList | treatmentAddPigs`), `toolbox/MobileToolboxHomePage.tsx`, `MobileHomeTaskCards.tsx`, `buildMobileHomeCards.ts`, `mobileHomeFixtures.ts`, `mobileWorkshops.ts`; layout rules in `Vaccine/docs/MOBILE_FIELD_LAYOUT.md`.

**Home hub (首页)**
1. Top bar: avatar, a location select (workshop 车间, or room 房间 when a unit tab is chosen), bell.
2. Tabs: `总览` (workshop scope) + one tab per unit (room scope).
3. Two stat cards: 存栏 (hard-coded 99,999) and 断奶检查 (done/total, tappable).
4. `种群决策` section (since 2026-07-27): two cards, `留种任务` (retain/breeding) and `淘汰任务` (cull), each opens its batch picker.
5. Task cards: treatment, vaccination (one per batch; per-room pending counts), demo fixtures (断奶检查 x3, 转舍 demo). Workshop scope: tap -> bottom drawer `选择进入房间` -> pig list. Room scope: straight to the pig list. 断奶检查 card -> room drawer -> check flow.
6. Bottom bar: `首页` | centre button (quick actions, demo toast only) | `工具`.

**Toolbox page (工具箱 / 工作台)** reached from the bottom bar
1. Header: `Zone 1 - Farrowing` (tap = back to hub) + avatar (opens 账号信息).
2. Four collapsible groups (all expanded by default), changed 2026-08-20:

| Group | Tools |
|---|---|
| 生物安全 Biosecurity | 新建采样, 物资消杀, 门禁 |
| 猪只出场 Pigs out | 装车, 装车记录 |
| 库存 Inventory | 入库, 盘点, 查看库存 (no standalone stock-out; consumption is deducted by tasks) |
| 其他设置 Other settings | 账号信息, 语言 (value 中文), 退出登录 |

3. Wired: only the three inventory tools. Others show an "integration pending" notice (08-20 log). 4-column grid, 4 px gap (2026-08-25, 09-08).
4. Bottom bar on this page labels the active item `工作台` (the hub labels the same button `工具`).

### 3. Login -> farm selection -> entry (Console, 2026-07-03)

Source: `Vaccine/prds/saas-login/04-新登录流程-PRD.md`, prototype `Vaccine/src/components/NewLoginFlowPage.tsx` (steps: phone, login-methods, code, password, passkey, farm-entry, farm-select, password-setup, no-permission, token-mismatch, forgot-password, reset-password, success), `Vaccine/src/consoleFarmAccess.ts`.

1. Open login. Check local token:
   - valid, **one farm** -> "continue using Sentri" with `即将进入` farm -> `继续登录` -> Console.
   - valid, **many farms** -> farm chooser, last-used farm preselected.
   - valid but **another account** than the one typed -> block page "this device is already logged in as another account"; user must log out inside the system first.
   - none / expired / switching account -> step 2.
2. Main page: phone or email (default phone pre-filled, editable), `获取验证码` (format check; 60 s cooldown), code, primary `立即登录`. Alternatives: `账号密码`, `Pass Key`.
3. Server checks in order: code correct (else `验证码不正确，请重新输入。`, no farm lookup) -> phone/email added to any farm (else **暂无员工权限** page with admin phone + email; no sign-up or entry-application link) -> password set?
4. Password not set -> `设置密码` page (8-32 chars, letters + digits, confirm). `设置密码并继续` saves; `跳过，暂不设置密码` does not record anything, so the next code login asks again. Then farm routing.
5. Farm routing by count: 0 -> no-permission page; 1 -> `进入厂区` page showing the farm (no list); many -> `选择厂区`.
6. Farm chooser: order last login > frequent (`常用` tag) > others; one tag per farm; more than 10 farms -> show first 3, `展开全部厂区` reveals a search box; no match -> `未找到匹配厂区。`; `进入厂区` enters.
7. Other methods: password login (unknown account, unset password -> "log in by code first", wrong password errors); Pass Key (must verify first, `请先完成 Pass Key 验证。`) -> farm routing.
8. Forgot password: enter contact -> code (contact must be in the staff list, else `该手机号或邮箱未添加到员工列表，请联系管理员确认。`) -> set new password -> straight to farm routing.
9. Inside Console: top-left `Sentri` with current farm below. One farm: name not clickable. Many farms: switch icon beside the name (no dropdown style) -> `切换厂区` dialog, current farm selected and not re-selectable; choosing another closes the dialog, shows a toast, and every later request uses the new farm. Backend must re-validate and never reuse data of the previous farm.
10. Errors: server relation lookup fails -> stay on page with retry; farm access revoked at entry -> block with `当前账号无法进入该厂区，请联系管理员`.
- The prototype's mock accounts cover five cases: one farm, many farms, no password, no permission, and no password with many farms. Its mock token states are valid, multiple farms, and mismatch.

### 4. Staff registration (invite) and staff presence

Sources: `01-员工注册流程.md` (rev. 2026-07-02), `02-员工入场流程.md`, `Vaccine/src/components/EmployeeLoginFlowPage.tsx` (steps invite, password, profile, success, entry-application), `EmployeeManagementPage.tsx`; page address `/#/employee-register`.

1. Admin opens the Console staff list (tabs `待注册` / `已注册` / `已过期`), `新增员工`: name, **ID number** (15 or 18 digits, `X` upper-cased; added 2026-07-02; profile data only, not for identity check), phone or email. Sends registration link; row appears under 待注册. Link = opaque `inviteToken`, 7 days; resend creates a new token.
2. Employee opens the link: **accept page** (`加入 {farm}`, masked contact, `继续` / `这不是我的手机号/邮箱`). Invalid / expired / already bound each have a message.
3. **Verify page**: enter the invited contact (must be on this farm's invite list), send code, 6-digit code. Token already on device -> skip code but still compare identity.
4. Mismatch -> `当前账号与邀请不一致` page (switch account / back). Backend compares the Logto-verified contact with the invite.
5. New user -> `完善个人信息` (name, ID number; contact and farm read-only). Existing user with complete profile skips it. Existing user with another farm just binds the new farm.
6. **Bound page**: `已加入 {farm}`; invite status `已注册`, presence defaults to `场外`. `进入厂区` / `切换其他厂区`.
7. Routing: one farm -> enter; many farms from an invite -> enter the just-bound farm, switcher stays; many farms otherwise -> chooser.

**Presence (02)**: only for `已注册` staff, per farm. States `在场` / `场外` / `休假`; defaults: registered or newly bound -> 场外; holiday ended -> 场外. Admin actions by state: 场外 -> mark in, set leave; 在场 -> mark out, set leave; 休假 -> end leave. Not allowed: acting on 待注册 / 已过期; mark in while on leave (end leave first). Presence is not a login permission check.

### 5. Visitor entry

Source: `03-访客入场流程.md` (2026-05-24). Visitors have no account and never enter Console or Mobile.
1. Admin copies the farm's long-lived application link (`visitorApplyToken`; one link per farm, reusable).
2. Visitor opens it (no login, no code), fills name, phone, email, expected arrival start and leave time, purpose; submit -> record `待审核`.
3. Admin reviews in the Console application list: `已通过` (sampling state `未采样`) or `已拒绝`. Expected times are advisory only.
4. At the sampling point the visitor scans the QR (`samplingToken` -> farm + sampling point), types phone or email. MVP: no code check; optional Logto code check per farm or point for unattended or high-risk points.
5. System matches an approved application for that farm; none -> blocked (`未找到已通过申请，请联系管理员`). Match -> sampling page shows applicant info for on-site check; done -> `待检测`.
6. Result: pass -> `检测通过`, entry permission `已生效`; fail -> `检测未通过`, permission stays `未生效`.
- A static page `NewEntryApplicationFlowPage.tsx` (2026-05-27) only illustrates these four steps and has no menu entry.

### 6. Unified access flow (design decisions, 2026-06-01)

`Vaccine/docs/UNIFIED_ACCESS_FLOW.md` tried to merge register, login and entry application behind one generic link that first verifies a phone. Decisions: step one is phone + code only (no farm field); several pending farms -> multi-select and bind in one go; registered + pending -> registered farms first, pending shown as a hint; no relation -> no-permission page with admin contact; success page has primary `完成注册，进入 Sentri` and secondary `填写入场申请` (identity prefilled and locked); registration **requires** setting a password; valid token + other phone -> stay logged in, must log out first; valid token + many farms -> 5 s auto-enter countdown on the last farm (stops on any other choice). The 2026-07 PRDs adopted some of this and dropped the rest (see Contradictions).

### 7. Onboarding (Console setup)

Source: `OnBoarding/sentri-react/docs/PRD-Onboarding.md`, routes in `src/App.tsx` (`/` chooser Console vs Mobile; `/console`; `/console/onboarding`; `/mobile` is an empty shell). The same flow is embedded in the Vaccine app as the `初始化` entry under 设置 (`Vaccine/src/components/onboarding/`, older, untyped copy).
1. Full-screen welcome: "3 minutes to build your cloud farm"; four cards:

| Card | Badge | Unlocked when |
|---|---|---|
| 还原猪场结构 Restore farm structure | 必做 required | always |
| 定制生产计划 Production plan | 推荐 | farm structure complete |
| 猪只档案上云 Pig records | 推荐 | farm structure complete |
| 邀请同事协作 Invite colleagues | none | farm structure complete |

2. Until the structure is done, cards 2-4 are greyed and not clickable. After it, cards unlock, the first shows `已完成`, and a link `稍后完成其他步骤，直接进入 Sentri ->` appears with the hint "tap a card any time to change what you set up".
3. **Farm structure**: guide page (floor plan vs system tree, 3 levels: zone 区 -> block 区块 -> unit 单元 & pens 栏位; why it matters) -> `开始配置` -> main page "copy your farm 1:1" with add/edit dialogs for zone, block, unit (pen range, pen type) and a pen-type dialog (capacity, feeding stations, water stations). Done when at least one zone > block > unit has pens. `返回` -> welcome; `完成配置` -> welcome with tick.
4. **Production line**: line name, block, max sows per batch, first batch start date, production-plan template (标准KPI / 高级KPI / 测试模版1), view template, per-task KPI. **Pigs**: Excel template download + upload (mock alert). **Colleagues**: first / last name, phone, email, position; list of pending staff. Steps 2-4: footer `跳过` and `完成` only (no back); both return to the welcome.
5. Finish: `初始化完成！` -> `进入 Dashboard` -> `/console`; the page lists next steps (add pigs, staff, lines, tasks).

---

## Versions

| Date | Decision / change | Source |
|---|---|---|
| 2026-01-07 to 01-28 | `sentri-react` onboarding demo built (welcome, farm structure, steps); PRD mtime 2026-01-29, committed 2026-06-20 | `OnBoarding/sentri-react` git, `docs/PRD-Onboarding.md` |
| 2026-04-20 | Mobile field layout spec (hub: site select, tabs, stats, task cards) | `Vaccine/docs/MOBILE_FIELD_LAYOUT.md` (mtime) |
| 2026-05-24 | SaaS access overview + staff register, presence, visitor PRDs | `Vaccine/prds/saas-login/00-03` (mtime) |
| 2026-05-27/28 | Prototype pages: entry-application illustration; staff register with a password step | `NewEntryApplicationFlowPage.tsx`, `EmployeeLoginFlowPage.tsx` |
| 2026-06-01 | Unified access flow: 12 decisions (phone-first, password required, 5 s countdown, ...) | `Vaccine/docs/UNIFIED_ACCESS_FLOW.md` |
| 2026-07-02 | New login: code as main method, optional password, farm split; ID number added to staff add | `saas-login/修改日志/…新登录流程密码与厂区分流`, `…Console员工添加身份证号` |
| 2026-07-03 | Console top-left `Sentri` + farm switcher; `consoleFarmAccess.ts`; PRD 04 final; onboarding build fix | `saas-login/修改日志/…Console厂区切换入口`, `OnBoarding/sentri-react/docs/修改日志-2026-07-03…` |
| 2026-07-23 | Mobile toolbox becomes a category directory (retain, cull, stock query, receive, count); Segment removed | `culling&replacement/修改日志/修改日志-2026-07-23-工具箱分类入口.md` |
| 2026-07-27 | Mobile Home gets fixed `留种任务` / `淘汰任务` cards; toolbox kept as secondary entry | `…2026-07-27-Mobile首页留种任务与房间母猪流程.md` |
| 2026-08-07 | Console `改版首页1`: 5 entries, workbench, task centre, business centre | `Vaccine/prds/console/修改日志/…Console改版首页1.md` |
| 2026-08-10 | Business centre inventory: add 库存流水, 盘点记录 | `Vaccine/prds/inventory/修改日志/…2026-08-10-业务中心新增库存记录入口.md` |
| 2026-08-11 | Add `物资管理` category (药物管理, 精液管理), then 饲料管理 | `Vaccine/prds/console/修改日志/…业务中心物资管理分类`, `…新增饲料管理` |
| 2026-08-13 | `物资管理` category deleted; its 3 entries move into 库存 | `…删除业务中心物资管理Tab.md` |
| 2026-08-14 | Reversal: 3 single-category entries removed; 库存 = 6 unified entries | `…删除库存分类管理入口.md` |
| 2026-08-17 | New 精液 category (5 entries), same day split to 4 (`查看配种计划`, `精液处理`, `精液设置`, `精液出库`) | `…业务中心新增精液分类.md`, `…业务中心精液入口拆分.md` |
| 2026-08-20 | Mobile toolbox redrawn as 4 groups from a reference image | `Vaccine/prds/vaccine prd/修改日志/…Mobile工具箱UI复刻.md` |
| 2026-08-21 | Online Console sidebar tidied to 12 "apps" in 4 groups (file later overwritten) | `修改日志/修改日志-2026-08-21-线上Console侧边栏整理.md` |
| 2026-08-24 | Launchpad prototype: 4 entries; v2 card->tab ("no second entry page"); v3 search, favourites, recents | `Vaccine/docs/修改日志-2026-08-24-Console信息架构原型.md` |
| 2026-08-25 | IA preview: 3 entries, bell for notifications, 6 tabs, 厂区权限 tab, culling/retention removed | `修改日志/修改日志-2026-08-25-Console信息架构预览.md` |
| 2026-08-25 | Mobile density tuning; one `MobileSystemStatusBar` component | `vaccine prd/修改日志/…Mobile工作台视觉密度`, `…Mobile顶部系统栏轻量化` |
| 2026-09-03 | Offline test, 4 rounds on the real Android app: 16 issues, 3 P0, "do not release for offline pens" | `Vaccine/docs/offline-test-2026-09-03/` |
| 2026-09-08 | Mobile workbench: all groups on one 4-column grid; settings list indent removed | `vaccine prd/修改日志/…Mobile工作台分组对齐.md` |

### Mobile offline findings (2026-09-03, real Android app 1.3.2, `dev.sentri.cn`)

What the app exposes: Tools -> `Offline & Sync` -> `Offline Data` (`#/offlineRecords`; states Pending / Synced / Failed / Conflict / Cancelled; actions Sync Now, Retry, Force Sync, Cancel local record, Delete, Bulk Sync, Clear) and `Network Test` (`#/offlineNetworkTest`; lock Auto / Offline / Unstable / Good, mutation-failure simulation). Ten production task types are declared offline-capable (heat check, breeding, return-heat check, pregnancy check, farrowing, piglet processing, post-partum check, weaning, end nursery, end finishing; routes `#/task/cq|pz|cfq|yj|fm|piglet|postpartum|lactation|nursery|yf`).

| Id | Priority | Finding |
|---|---|---|
| OT-01 | P0 | Native cold start blank (absolute `/mobile/static` under `file://`) |
| OT-14 | P0 | Two devices offline: later sync silently overwrites; both show synced, no Conflict |
| OT-16 | P0 | Real no-network: Confirm does not queue (only "Lock Offline" works) |
| OT-02 | P1 | Unit "submit" treats unticked pigs as not in heat and moves them to Breeding |
| OT-03 | P1 | Changing a pig's status offline yields a second command; both sync (duplicate) |
| OT-13 | P1 | `file://` and remote origins do not share the queue |
| OT-15 | P1 | Farm chooser blank offline; no unsynced-records warning before switching |
| OT-05/06/09/12 | P2 | No pending text on Home; Network Test in production Tools; end-finishing route returns to Home; no field guidance on conflict |

Report section 3.4 contains a conflict-rule table that is explicitly a **proposal** ("not an existing requirement").

---

## Superseded and duplicate material

| File | Date | Status | Superseded by | Note |
|---|---|---|---|---|
| `线上Console侧边栏整理预览.html` | 2026-08-25 | current | - | Overwrote the 08-21 version; title same as launchpad |
| `修改日志/修改日志-2026-08-25-Console信息架构预览.md` | 2026-08-25 | current | - | Verification list is stale in one place (says 免疫 group still exists) |
| `修改日志/修改日志-2026-08-21-线上Console侧边栏整理.md` | 2026-08-21 | superseded | 08-24 and 08-25 logs | Describes 12-app version; no file left to inspect |
| `Vaccine/sentri-console-launchpad.html` | 2026-08-24 | superseded | root `线上Console侧边栏整理预览.html` | Same page, earlier data (7 modules, 4 sidebar entries) |
| `Vaccine/docs/修改日志-2026-08-24-Console信息架构原型.md` | 2026-08-24 | superseded (rationale still useful) | 08-25 log | Only place with the hierarchy rationale |
| `Vaccine/prds/console/00-Console工作台首页-PRD.md` | 2026-08-17 | current for Vaccine prototype only | - | Not updated for the function-centre IA although the 08-24 log says it must be |
| `Vaccine/prds/console/修改日志/…2026-08-07-Console改版首页1.md` | 2026-08-07 | current history | - | Inventory list in it is outdated |
| `…2026-08-11-业务中心物资管理分类.md`, `…2026-08-11-业务中心新增饲料管理.md` | 2026-08-11 | superseded | 08-13 log | Category removed |
| `…2026-08-13-删除业务中心物资管理Tab.md` | 2026-08-13 | superseded | 08-14 log | Its three entries removed a day later |
| `…2026-08-14-删除库存分类管理入口.md` | 2026-08-14 | current | - | Final inventory entry list |
| `…2026-08-17-业务中心新增精液分类.md` | 2026-08-17 | superseded | 精液入口拆分 (same day) | 5 entries -> 4 |
| `…2026-08-17-业务中心精液入口拆分.md` | 2026-08-17 | current | - | |
| `Vaccine/prds/saas-login/00-SaaS登陆与入场流程总览.md` | 2026-05-24 | current, incomplete | - | Lists only 01-03; does not mention 04 |
| `…/01-员工注册流程.md` | 2026-07-02 | current, conflicts | - | No password step; prototype and UNIFIED have one |
| `…/02-员工入场流程.md` | 2026-05-24 | current | - | |
| `…/03-访客入场流程.md` | 2026-05-24 | current | - | |
| `…/04-新登录流程-PRD.md` | 2026-07-03 | current | - | Console only |
| `…/修改日志/` (3 files) | 2026-07-02 to 07-03 | current history | - | |
| `Vaccine/docs/UNIFIED_ACCESS_FLOW.md` | 2026-06-01 | partly superseded | 04 (login) and 01 (registration) | Still the only description of multi-pending-farm choice, mixed list, entry application after registration |
| `Vaccine/src/components/EmployeeLoginFlowPage.tsx` | 2026-05-28 | stale vs PRD 01 | - | Keeps the password step |
| `Vaccine/docs/MOBILE_FIELD_LAYOUT.md` | 2026-04-20 | stale in parts | code | No 种群决策 cards; sidebar mode switch described at top (PRD 00 says bottom); lists demo cards |
| `Vaccine/prds/culling&replacement/修改日志/…2026-07-23-工具箱分类入口.md` | 2026-07-23 | superseded | 08-20 toolbox log | Culling/retention left the toolbox |
| `vaccine prd/修改日志/…2026-08-20-Mobile工具箱UI复刻.md` | 2026-08-20 | current (grid details superseded) | 09-08 log | 3-column -> 4-column |
| `…2026-08-25-Mobile工作台视觉密度.md` | 2026-08-25 | superseded in part | 09-08 log | Inventory 3-col rule removed |
| `…2026-08-25-Mobile顶部系统栏轻量化.md` | 2026-08-25 | current | - | |
| `…2026-09-08-Mobile工作台分组对齐.md` | 2026-09-08 | current | - | |
| `OnBoarding/sentri-react/docs/PRD-Onboarding.md` | 2026-01 (committed 06-20) | current | - | |
| `OnBoarding/sentri-react/README.md` | 2026-01-07 | stale | - | Vite template boilerplate |
| `Vaccine/src/components/onboarding/` vs `OnBoarding/sentri-react/src/pages/console/onboarding/` | - | duplicate | standalone typed copy | Vaccine copy is the older untyped one |
| `Vaccine/docs/offline-test-2026-09-03/` 4 round logs | 2026-09-03 | superseded | the report (round-4 cumulative) | |
| `…/测试报告-2026-09-03-Mobile生产任务离线能力多角色专项.md` | 2026-09-03 | current | - | |

---

## Where it is in Figma and the repo

Figma index: `references/figma/web/index.md` (Sentri-UI repo). Relationship column answers "supersedes / duplicates / diverges".

| Handover item | Figma / repo location | Relationship |
|---|---|---|
| IA B sidebar (工作台, 功能中心, 设置) | Figma has no IA artifact; sidebar is implied by sub-section names (用户管理 > 员工, 访客; 用户厂区权限; 进出厂请求; 设置 > 场区布局, 所有监控, 栏位类型, 药品管理, 设备管理) | Regroups existing designs; does not supersede them |
| 工作台 content (snapshot, attention cards, risks) | 🖥️ 工作台 > Home (`3985:5458`, task calendar, batch list, production and health cards), Past daily report, 3-level data overviews, task drawers, health triage | **Diverges**: different composition; handover version is a mock wireframe. Figma wins for visuals |
| 通知与决策 page | 🖥️ 工作台 > Notifications and decisions: 480 px side panel, filters, handled tab (12 screens) | Converges on "reached from the bell" (08-25); page-vs-panel form differs |
| 厂区权限 tab (5 entries) | 🖥 用户厂区权限 (list with 全部 / 待给权限 / 即将失效, edit and view dialogs, 权限日志) + Entry and exit requests (进出厂请求) | Duplicates content, regrouped under one tab; Figma keeps three sidebar items |
| 员工 / 访客 | Sentri Console（Done) > Staff (18), Guests (12) | Same objects; handover has no profile, Face ID or exit dialogs |
| Settings 4 domains | Settings section: site layout, devices (door access), medicine management (draft), plus Permission types ("Job") | Mostly consistent; handover adds 疫苗管理, 角色管理, 权限配置 and a duplicate 厂区权限 |
| Login (PRD 04) | Sentri Console（Done) > Log-in (8 screens): phone/email + password + Farm ID; Farm ID auto-filled and locked on a farm URL; forgot password = "contact admin" | **Diverges**: handover is code-first, no Farm ID, farm chosen after login, optional password, Pass Key, self-service reset. Likely newer; Figma does not carry a date. Production app uses Logto (offline report), which matches the handover |
| Farm chooser, farm switcher, token states | No equivalent screens | Handover only |
| Staff registration by invite link | Figma Add User + entrance link; Staff H5 Log-in (7 screens); entry application H5 (28 screens) | Related, different model: Figma = admin adds person, link, person applies, admin approves, then Face ID; handover = invite token, code, bind farm, presence |
| Visitor application + sampling QR | Figma Guests + Guests entry form (with face capture) + site permission with test-report credential | **Diverges**: handover has no face capture, permission levels or validity; Figma has none of the QR-at-sampling-point step |
| Staff presence (在场 / 场外 / 休假) | Figma staff status chips: On farm / Away-On leave / No Face ID / Terminated | Partial overlap; handover lacks Terminated and No Face ID |
| Onboarding (4 cards, 3-level structure) | 🖥️ Console 初始化: Setup checklist, 3-step layout wizard, production line, add pigs, add staff | **Duplicates** the same four tasks. Differences: Figma = checklist rows with `去创建` / `查看` and `进入 Sentri` button enabled when all four are done; Figma add-staff = bulk upload + confirm-errors step, handover = manual form |
| Mobile Home (hub) | Mobile Figma `references/figma/index.md` > 首页 Home > 工作台 (`6003:11580`, 5 screens); repo `features/workbench/` (PRD, 2026-10-19 Overview + Schedule) | Handover hub is an early prototype of the same job; repo Workbench supersedes its layout (section chooser, Production / Health / Other, Schedule). Repo PRD lists language and log-out as undecided; handover puts them in Toolbox > 其他设置 |
| Mobile Toolbox | Repo `features/workbench/PRD.md` mentions Toolbox and Records; no own feature | Handover groups (生物安全, 猪只出场, 库存, 设置) are the only IA for it |
| 种群决策 cards on Home | Repo: none on Home | Handover-only |
| Offline behaviour | `features/data-sync/` (offline queue, header badge, 未被接受 list, block farm switch with unsent records, relogin to the original account) | Report findings OT-15 and OT-05 are the cases the repo rules address; OT-14 and OT-03 are the collision / duplicate cases left to each feature's Offline section. Report's Retry / Force Sync / Conflict UI is not in the repo design (repo: worker does not handle rejections) |
| Scan and search | `features/find-pig/` | Handover Home has no scan entry (centre button is a demo toast) |

---

## Contradictions and open questions

| # | Issue | Sources |
|---|---|---|
| 1 | **Two Console IAs, no merge.** Revised home 1 (5 entries) covers vaccine, culling, semen, inventory, finance. The function centre (3 entries) covers production, herd, health, biosecurity, site access, people. Neither contains the other's modules. Which is the target, and where do inventory, feed, finance, immunity review sit in the 3-entry IA? | `00-Console工作台首页-PRD.md` vs `修改日志-2026-08-25-Console信息架构预览.md` |
| 2 | The 08-24 log says the console PRD must be updated if the new IA is adopted; it was not. | `Vaccine/docs/修改日志-2026-08-24-Console信息架构原型.md` |
| 3 | **Culling and retention disappear** from the 08-25 IA (deleted with 繁育管理), but the PRD 00 menu, the Console culling PRDs and Mobile Home 种群决策 cards still have them. Semen is one entry in IA B but four in the business centre. | 08-25 log vs `ConsoleBusinessCenterPage.tsx`, `MobileVaccinationPage.tsx` |
| 4 | Duplicate entries inside IA B: 厂区权限 is both a function-centre tab and a Settings item; 访客 (3 pending) and 进场申请 (3 pending) show the same requests; 员工 vs 人员权限列表. | `线上Console侧边栏整理预览.html` |
| 5 | 08-25 log verification says 健康与防疫 shows "猪只健康、免疫" two groups; the same log and the file merge 免疫 into 猪只健康. The file is right. | 08-25 log |
| 6 | The 12-app grouping (08-21) cannot be recovered; only the group names are in the log. | 08-21 log |
| 7 | Notifications and decisions: full page (handover) vs 480 px side panel (Figma). | HTML preview vs `references/figma/web/index.md` |
| 8 | **Login method**: Figma = phone/email + password + Farm ID; handover 04 = code first, no Farm ID, optional password, Pass Key. Which is live? Production uses Logto. | Figma Log-in vs `04-新登录流程-PRD.md` |
| 9 | **Password at registration**: UNIFIED decision 6 and the prototype require it; PRD 01 (rev. 07-02) has no password step; PRD 04 lets login skip it. | `UNIFIED_ACCESS_FLOW.md`, `EmployeeLoginFlowPage.tsx`, 01, 04 |
| 10 | **Generic entry link vs invite link.** UNIFIED handles a phone that has several pending farms or both registered and pending farms; 01 is single-farm by invite token; 04 sends any phone not on a farm list to the no-permission page and never mentions pending invites. | UNIFIED D1-D4, D9-D10; 01; 04 |
| 11 | The 5 s auto-enter countdown for token + many farms (UNIFIED D8) is absent in 04. Dropped or forgotten? | UNIFIED vs 04 |
| 12 | **Staff entry application.** UNIFIED D5/D11 and the prototype add `填写入场申请` after registration; 00, 02 and 04 say it is out of scope; 02 has the admin set presence by hand. No PRD for it or for the Console review of it. Figma has the staff H5 entry form and web requests. | UNIFIED, `02`, `04`, Figma Entry application |
| 13 | **Visitor model**: handover visitors are not Console people, no face capture, entry permission only after the sampling test, no validity or exit; Figma guests are Console records with Face ID, permission types and validity. | `03`, Figma Guests / 用户厂区权限 |
| 14 | Status vocabularies differ: 待注册 / 已注册 / 已过期 and 在场 / 场外 / 休假 vs Figma No Face ID / On farm / Away-On leave / Terminated. | 01, 02 vs Figma Staff `Read me` |
| 15 | Mobile naming: Home bottom bar says `工具`, the toolbox page says `工作台`; the user-facing "Mobile workbench" is the toolbox, while the repo's Workbench is the Home hub. | `MobileVaccinationPage.tsx`, `MobileToolboxHomePage.tsx`, `features/workbench` |
| 16 | Toolbox: 3-column (08-20) vs 4-column (08-25, 09-08) in logs; only inventory tools wired; the toolbox type still lists breeding/culling keys that no group shows. | logs, `MobileToolboxHomePage.tsx` |
| 17 | `MOBILE_FIELD_LAYOUT.md` puts the Console/Mobile switch at the sidebar top; PRD 00 puts `切换到 Mobile` at the bottom. | both docs |
| 18 | Mobile login and onboarding are not specified at all (`/mobile` in sentri-react is an empty shell; PRD 04 is Console only). | `sentri-react/src/pages/mobile/MobileLayout.tsx` |
| 19 | Onboarding demo wiring (as read from code): the "skip and enter Sentri" link only logs (standalone copy) or calls a missing step (embedded copy); the completion page needs a step index past the last step, which the flow never reaches. PRD flow ends at that page. | `StepWelcome.tsx`, `OnboardingFlow.tsx` in both copies |
| 20 | Onboarding vs Figma setup: manual add-staff vs bulk upload with error confirmation; welcome cards vs checklist rows; PRD dated Jan 2026, Figma date unknown. | PRD-Onboarding vs Figma Console setup |
| 21 | Offline: report's Retry / Force Sync / Conflict model vs repo data-sync's "worker does not handle it" model; OT-15 (no warning on farm switch) breaks the repo rule "block switching with unsent records"; the real-offline failure OT-16 means "Lock Offline" tests are not valid evidence. Collision rule per feature is still undefined. | offline report 3.4 and issue table vs `features/data-sync/PRD.md` |
| 22 | No handover doc covers production lines, herd, biosecurity, sampling or devices; for those the Figma files are the only design, and three of the empty `[Web]` files (production, inventory, feeding plan) carry no design. | folder survey, `references/figma/web/index.md` |

## Corrections found while writing the workflow specs (2026-11-03)

- §2: vaccination and treatment open a drawer titled "选择进入单元". Only the weaning and post-partum checks use "选择进入房间".
- Offline report: the summary counts only open items (3 P0, 4 P1, 5 P2, 2 P3); 2 of the 16 logged findings are closed.
- New staff default to "off the farm" in PRD 02, but to "off the farm or on leave" in `UNIFIED_ACCESS_FLOW.md`.
