# Web and console in Figma

The 13 web/console Figma files, indexed on 2026-10-19 and regrouped by product area instead of by file. One row per screen; a Chinese/English pair counts once. 452 screens: 344 current, 49 archived, 36 unclear, 15 reference, 8 draft. Machine-readable copy: [index.json](index.json). Link: `https://www.figma.com/design/<key>?node-id=<node id with - for :>`.

Status: **current** = live section, no marker · **archived** = trash page/section or a frame marked 废弃/DEPR/取消/替代/没了 · **draft** = heading says deferred or still changing · **reference** = notes, specs, source frames · **unclear** = no marker either way. Rows marked ◌ were classified from layer names only (the Figma seat's call quota ran out during indexing); treat their descriptions as provisional.

## Files

| File | Key | Frames indexed | Screens (CN/EN merged) | Indexed under |
|---|---|---|---|---|
| 🖥️ 工作台 | `MufYKeR3oCVDyppB3FmlNV` | 69 | 69 | Workbench |
| 🖥️ 猪舍、猪只 | `qSEc0RElNQUMWYkX30jVgr` | 81 | 48 | Barns and pigs |
| 🖥 📱 免疫 | `8BkIL2azMuBS2w6Vn26Cac` | 63 | 63 | Immunization, Settings |
| 🖥 采样与检测 | `WJYP32oqthOUHOa7xdjDcb` | 31 | 16 | Biosecurity |
| 🖥📱 物资消杀 | `fVWq5EfZKLL7x8tnE9UR1E` | 75 | 43 | Biosecurity, Settings |
| Sentri Console（Done） | `4zA7Ug5vWGqqvdKuU0uNcM` | 228 | 145 | Users and access |
| 🖥 用户厂区权限 | `yUF0zQdpgTlKP9azeFNcL5` | 34 | 18 | Users and access |
| 🖥️ Console 初始化 | `hRZQbmxWMPSBZYCDkvm5dY` | 48 | 48 | Settings, Console setup |
| 🖥 场区布局 | `1UFIgtR4SLQQ3t4Qlgx572` | 2 | 2 | Settings |
| [Web] 库存管理 · inventory | `CIPVXjxWEGV3egSoNS7qMH` | 0 | 0 | Cover page only (`67:699`), nothing designed yet |
| [Web] 生产线 · production | `DlcLGqx61y44IVEvonQBJR` | 0 | 0 | Cover page only (`2081:7438`), nothing designed yet |
| [Web] 项目索引 · project index | `UvTWyJTKlJueUTg2GYqFFk` | 0 | 0 | Cover page only (`104:656`), nothing designed yet |
| [Web] 饲喂计划 · feeding plan | `2owiBMZ66JOILBd5VELWgt` | 0 | 0 | Cover page only (`67:699`), nothing designed yet |

## Duplicates and overlaps across files

- **User site permissions are designed twice.** 🖥 用户厂区权限 holds the page and all edit/view dialogs. Sentri Console（Done） › Access Control CN/EN copies the edit dialogs as 1440×960 overlays (编辑权限 - …) and one frame says it was moved over unchanged (8442:111920). → Treat 🖥 用户厂区权限 as the source; Console copies follow it.
- **Site layout file is an emptied copy.** 🖥 场区布局 has two empty 场区布局 shells whose node ids are 物资消杀's 设备管理列表 / 门禁设备列表. The real site-layout design is in 🖥️ Console 初始化 (场区布局 page, 12 frames). → Use Console 初始化 for site layout. The 场区布局 file has nothing to index yet.
- **Sampling video viewer appears in two files.** 查看采样视频 is in 🖥 采样与检测 (6001:6162) and again in 🖥 用户厂区权限 (2010:5621, plus three video-card states), where it opens from a permission's test report. → Same viewer reached from two places; keep one design. *(from names; not compared visually)*
- **Add pigs is designed twice.** 🖥️ 猪舍、猪只 › 添加猪只 (file upload, confirm with/without errors, skip) and 🖥️ Console 初始化 › 添加猪只 (setup step, 1 frame + image). → Setup step should reuse the 猪只 import flow; check which is newer. *(from names; not compared visually)*
- **Add staff is designed twice.** 🖥️ Console 初始化 › 添加员工 (bulk upload, confirm) and Sentri Console（Done） › Staff › Add User. → Setup uses bulk import, Console adds one user; confirm both are wanted. *(from names; not compared visually)*
- **Production line in three places.** 🖥️ Console 初始化 › 创建生产线 (with KPI templates), 🖥️ 猪舍、猪只 › 生产线 (1 page), and the empty [Web] 生产线 file. → The [Web] 生产线 file is the intended home; nothing is drawn there yet. *(from names; not compared visually)*
- **Medicine management sits in the Immunization file.** 药品管理 (list, add, delete) is drawn in 🖥 📱 免疫 under the heading '药品管理（还要改…）', but the Settings sidebar lists 药品管理. → Indexed under Settings, marked draft. *(from names; not compared visually)*
- **Health triage on the workbench and on pig detail.** 工作台 › 健康分诊 drawers and 猪只详情 › 健康分诊等级 dialog (1257:4300) both set or show triage level. → Related, not copies. *(from names; not compared visually)*
- **Workbench task drawers mirror the mobile production tasks.** 工作台 › 生产-今日进度 has one drawer per task (查情, 配种, 返情检查, 孕检, 分娩, 产后母猪检查, 仔猪处理, 断奶检查, 结束保育检查, 结束育肥检查, 转舍): the same tasks as the app's features heat-check, breeding, return-heat, pregnancy, farrowing, post-farrowing, piglet-processing, weaning, end-nursery, end-finishing, move. → Web shows progress; the phone does the work. *(from names; not compared visually)*

Inside files, every Chinese section has an English copy (except 工作台, 免疫, 初始化 and 场区布局, which are Chinese only); those pairs are merged below.

## Workbench · 工作台

69 screens (37 current, 31 archived, 1 unclear). Grouped by: Module headings on the 工作台 canvas.

| Feature | Screens | Current | Platform | File | Entry node |
|---|---|---|---|---|---|
| Home · 首页 | 2 | 2 | web | 🖥️ 工作台 | [`3985:5458`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3985-5458) |
| Past daily report · 往日日报 | 2 | 2 | web | 🖥️ 工作台 | [`3598:11687`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3598-11687) |
| Notifications and decisions · 通知/决策 | 12 | 12 | web | 🖥️ 工作台 | [`3327:5031`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3327-5031) |
| Data overview: herd, PSY, health · 3级数据概览 | 5 | 5 | web | 🖥️ 工作台 | [`3390:6566`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3390-6566) |
| Production task calendar · 生产-任务日历 | 1 | 1 | web | 🖥️ 工作台 | [`3725:7488`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3725-7488) |
| Today's production: task drawers · 生产-今日进度（转舍、生产） | 11 | 11 | web | 🖥️ 工作台 | [`3402:10175`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3402-10175) |
| Health triage drawers · 健康-健康分诊 | 4 | 4 | web | 🖥️ 工作台 | [`3438:8032`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3438-8032) |
| Drawer kit, palette, images · 组件/色板 | 1 | 0 | web | 🖥️ 工作台 | [`4647:9283`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=4647-9283) |
| Discarded drafts · 废稿 | 31 | 0 | web | 🖥️ 工作台 | [`3345:5502`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3345-5502) |

<details><summary>Home · 首页 — 2 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 空样式 | [`3816:7774`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3816-7774) | 1440×2404 web | current | Home dashboard in empty state: placeholder illustrations and zero counts. |
| 首页 | [`3985:5458`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3985-5458) | 1440×2404 web | current | Home dashboard, populated: task calendar grid, batch list, production and health cards. |

</details>

<details><summary>Past daily report · 往日日报 — 2 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 1 | [`3598:11687`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3598-11687) | 1440×2404 web | current | Full page under the 往日日报 heading (frame named '1'). |
| 今日进度 | [`3337:6928`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3337-6928) | 1272×1612 web | current | Today's progress panel, CN and EN variants: counts and metrics per stage (配种, 分娩, 仔猪处理, etc.). |

</details>

<details><summary>Notifications and decisions · 通知/决策 — 12 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 业务类型：健康（默认态） ◌ | [`4652:11413`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=4652-11413) | 272×204 web | current | Business-type filter popover: 健康 (health), default state. |
| 业务类型：生产 ◌ | [`4652:11540`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=4652-11540) | 272×302 web | current | Business-type filter popover: 生产 selected. |
| 业务类型：生产（默认态） ◌ | [`4652:10967`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=4652-10967) | 272×302 web | current | Business-type filter popover: 生产 (production), default state. |
| 业务类型：生物安全（默认态） ◌ | [`4652:11476`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=4652-11476) | 272×204 web | current | Business-type filter popover: 生物安全 (biosecurity), default state. |
| 决策（CN） ◌ | [`3327:5031`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3327-5031) | 480×748 web | current | Decision side panel, Chinese: decision tabs and decision cards. |
| 已处理 | [`3041:1632`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3041-1632) | 1528×1364 web | current | Four handled-tab states of the notification panel, showing processed events with 'Processed by' footers. |
| 通知-全部标记为已读 ◌ | [`4652:12190`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=4652-12190) | 480×116 web | current | Notification panel header state with a 'mark all as read' tooltip. |
| 通知-筛选 ◌ | [`4652:12199`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=4652-12199) | 480×900 web | current | Notification panel filter state: header, tabs, filter list. |
| 通知/决策 ◌ | [`3231:3607`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3231-3607) | 1440×900 web | current | 1440-wide page frame with a background image and the Chinese notification panel. |
| 通知（CN） | [`3331:5586`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3331-5586) | 480×3562 web | current | Notification side panel, Chinese: tabs, filters and a long list of notification cards. |
| 通知（EN） ◌ | [`3238:6569`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3238-6569) | 480×2900 web | current | Notification side panel, English counterpart of 3331:5586. |
| 默认状态 ◌ | [`4652:10906`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=4652-10906) | 272×204 web | current | Business-type filter popover, default state. |

</details>

<details><summary>Data overview: herd, PSY, health · 3级数据概览 — 5 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| PSY 预测 ◌ | [`3873:5703`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3873-5703) | 1440×2406 web | current | PSY prediction drawer (tall). |
| 健康概览 | [`3390:7905`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3390-7905) | 1440×900 web | current | Drawer 健康概览: 30-day line chart of unhealthy pig count, filter 全部. |
| 猪群概览（猪只详情） ◌ | [`3486:5465`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3486-5465) | 1440×1100 web | current | Herd overview drawer, pig-detail state. |
| 猪群概览（选择某一种猪只类型） ◌ | [`3478:7219`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3478-7219) | 1440×1800 web | current | Herd overview drawer, state for choosing one pig type. |
| 猪群概览（默认态） | [`3390:6566`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3390-6566) | 1440×900 web | current | Herd overview drawer, default state: stock-change chart (存栏变动) with four pig-type stat cards and a type filter. |

</details>

<details><summary>Production task calendar · 生产-任务日历 — 1 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 任务日历（这是个满屏的抽屉） | [`3725:7488`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3725-7488) | 1440×1148 web | current | Full-screen task calendar drawer: week grid of batch tasks by type, with batch rows and status chips. |

</details>

<details><summary>Today's production: task drawers · 生产-今日进度（转舍、生产） — 11 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 产后母猪检查 ◌ | [`3413:5944`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3413-5944) | 1440×900 web | current | Post-partum sow check drawer. |
| 仔猪处理 ◌ | [`3413:6197`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3413-6197) | 1440×1300 web | current | Piglet processing drawer (tall). |
| 分娩 ◌ | [`3404:13031`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3404-13031) | 1440×900 web | current | Farrowing drawer. |
| 孕检 ◌ | [`3404:12605`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3404-12605) | 1440×900 web | current | Pregnancy check drawer. |
| 断奶检查 ◌ | [`3418:6574`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3418-6574) | 1440×1300 web | current | Weaning check drawer (tall). |
| 查情 ◌ | [`3402:10175`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3402-10175) | 1440×900 web | current | Estrus check drawer. |
| 结束保育检查 ◌ | [`3421:7021`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3421-7021) | 1440×900 web | current | End-of-nursery check drawer. |
| 结束育肥检查 ◌ | [`3421:7344`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3421-7344) | 1440×900 web | current | End-of-finishing check drawer. |
| 转舍 ◌ | [`3421:7768`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3421-7768) | 1440×900 web | current | Transfer drawer (900 wide). |
| 返情检查 ◌ | [`3404:12831`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3404-12831) | 1440×900 web | current | Return-to-estrus check drawer. |
| 配种 ◌ | [`3404:11908`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3404-11908) | 1440×900 web | current | Breeding drawer. |

</details>

<details><summary>Health triage drawers · 健康-健康分诊 — 4 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 健康分诊 ◌ | [`4451:10569`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=4451-10569) | 1440×900 web | current | Health triage drawer. |
| 健康异常 ◌ | [`4451:3483`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=4451-3483) | 1440×900 web | current | Health anomaly drawer. |
| 健康概览 | [`4597:3580`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=4597-3580) | 1440×900 web | current | Drawer 受影响单元: unit health heatmap by symptom; clicking a unit name opens that unit. The frame is misnamed 健康概览. |
| 健康诊疗 ◌ | [`3438:8032`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3438-8032) | 1440×900 web | current | Health treatment drawer (800 wide). |

</details>

<details><summary>Drawer kit, palette, images · 组件/色板 — 1 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| Frame 2036083885 | [`4647:9283`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=4647-9283) | 2690×1200 web | **unclear**: top-level frame on live page; generic UI-kit content, no Sentri marker | Component sheet with four drawer instances (Tour/FiltersDrawer, Portal/Settings, Portal/AccountDrawer, Portal/Notifications); content is a generic UI kit, not Sentri-specific. |

</details>

<details><summary>Discarded drafts · 废稿 — 31 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 1 ◌ | [`3577:9538`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3577-9538) | 1440×1416 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Numbered screen '1'; not screenshotted. |
| 2 ◌ | [`3577:9913`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3577-9913) | 1440×1432 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Numbered screen '2'; not screenshotted. |
| 3 ◌ | [`3577:10670`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3577-10670) | 1440×1974 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Numbered screen '3'; not screenshotted. |
| 4 ◌ | [`3577:10288`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3577-10288) | 1440×1444 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Numbered screen '4'; not screenshotted. |
| 5 ◌ | [`3895:9977`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3895-9977) | 1440×2404 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Numbered screen '5' (1440x2404); not screenshotted. |
| 6 ◌ | [`3899:11797`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3899-11797) | 1440×2404 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Numbered screen '6' (1440x2404); not screenshotted. |
| Frame 33331 ◌ | [`3345:5355`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3345-5355) | 408×2022 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Frame group (408x2022); not screenshotted. |
| Frame 33334 ◌ | [`4017:11509`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=4017-11509) | 2120×590 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Frame group (2120x590) with five children; not identified. |
| PSY 跟踪 ◌ | [`3478:8032`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3478-8032) | 1440×1000 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | PSY tracking screen; not screenshotted. |
| PSY 跟踪 ◌ | [`4017:11211`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=4017-11211) | 1440×1000 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | PSY tracking screen; not screenshotted. |
| card ◌ | [`3345:5127`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3345-5127) | 840×998 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Card (840x998); not screenshotted. |
| card | [`3472:9388`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3472-9388) | 2148×3266 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Six columns of biosecurity visitor event cards (事件标题, 到达/离开日期, 目的) with 'Processed by' footers. |
| 仔猪处理 ◌ | [`4552:9423`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=4552-9423) | 1440×1300 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Piglet processing draft (1440x1300); kind inferred. |
| 任务日历 ◌ | [`3816:14209`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3816-14209) | 1440×1062 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Task calendar draft; not screenshotted. |
| 健康概览 ◌ | [`4451:9964`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=4451-9964) | 1440×1879 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Health overview draft (1440x1879); not screenshotted. |
| 健康概览 ◌ | [`4597:9309`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=4597-9309) | 1440×900 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Health overview draft (1440x900); kind inferred. |
| 分娩 ◌ | [`4435:9970`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=4435-9970) | 1440×1300 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Farrowing screen draft (1440x1300); kind inferred from live drawer family. |
| 原型 ◌ | [`3345:10729`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3345-10729) | 480×3082 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Tall side-panel prototype (480 wide); not screenshotted. |
| 原型 ◌ | [`3345:10990`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3345-10990) | 480×2900 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Tall side-panel prototype (480 wide); not screenshotted. |
| 工作台 ◌ | [`3472:7967`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3472-7967) | 1440×1572 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Workbench page variant named 工作台; not screenshotted. |
| 工作台 ◌ | [`3472:8290`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3472-8290) | 1440×1908 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Workbench page variant named 工作台; not screenshotted. |
| 工作台 ◌ | [`3472:8653`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3472-8653) | 1440×1572 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Workbench page variant named 工作台; not screenshotted. |
| 工作台 ◌ | [`3472:9011`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3472-9011) | 1440×1364 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Workbench page variant named 工作台; not screenshotted. |
| 废稿 | [`3345:5502`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3345-5502) | 1440×3800 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Dense single-page dashboard with many KPI cards and panels; no live frame matched by name. |
| 猪群概览2 ◌ | [`3478:7019`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3478-7019) | 1440×1100 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Herd overview drawer copy named 猪群概览2; same size as 3486:5465. |
| 空样式 ◌ | [`3899:12488`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3899-12488) | 1440×2404 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Empty-state home draft; not screenshotted. |
| 配种 ◌ | [`4435:9458`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=4435-9458) | 1440×1183 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Breeding screen draft (1440x1183); kind inferred from live drawer family. |
| 首页 ◌ | [`3536:10497`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3536-10497) | 1440×1428 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Home page draft; not screenshotted. |
| 首页 ◌ | [`3536:11151`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3536-11151) | 1440×1700 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Home page draft (taller); not screenshotted. |
| 首页 ◌ | [`3648:10550`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3648-10550) | 1440×1550 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Home page draft; not screenshotted. |
| 首页 ◌ | [`3648:11280`](https://www.figma.com/design/MufYKeR3oCVDyppB3FmlNV?node-id=3648-11280) | 1440×1672 web | **archived**: inside 🗑️ 废稿 page (203:4256), section 废稿 (3345:5126) | Home page draft (taller); not screenshotted. |

</details>

## Barns and pigs · 猪舍、猪只

48 screens (40 current, 4 reference, 2 unclear, 2 archived). Grouped by: File sections 猪舍 / 猪只.

| Feature | Screens | Current | Platform | File | Entry node |
|---|---|---|---|---|---|
| Barn pages: block, house, pen · 猪舍-区块/舍/栏位详情页 | 4 | 4 | web | 🖥️ 猪舍、猪只 | [`65:5401`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=65-5401) |
| Herd view (floor plan) · 猪群视图 | 6 | 4 | web | 🖥️ 猪舍、猪只 | [`235:2372`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=235-2372) |
| Live video and recordings · 环境监控-直播/完整录像 | 6 | 6 | web | 🖥️ 猪舍、猪只 | [`1140:4605`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1140-4605) |
| Workshop log · 日志-车间 | 3 | 1 | web | 🖥️ 猪舍、猪只 | [`159:7004`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=159-7004) |
| Stock, task and stage cards · 存栏量、任务列表/阶段任务卡片 | 3 | 3 | web | 🖥️ 猪舍、猪只 | [`1140:4443`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1140-4443) |
| Pig list and not-on-site · 猪只列表/不在场猪只 | 3 | 3 | web | 🖥️ 猪舍、猪只 | [`1178:7707`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1178-7707) |
| Pig detail and its dialogs · 猪只详情/弹窗 | 10 | 10 | web | 🖥️ 猪舍、猪只 | [`1218:7986`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1218-7986) |
| Add pigs (file import) · 添加猪只 | 7 | 7 | web | 🖥️ 猪舍、猪只 | [`1359:8578`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1359-8578) |
| Production line · 生产线 | 1 | 1 | web | 🖥️ 猪舍、猪只 | [`1359:9198`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1359-9198) |
| Product and review notes · 说明/评审标注 | 5 | 1 | web | 🖥️ 猪舍、猪只 | [`1359:14095`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1359-14095) |

<details><summary>Barn pages: block, house, pen · 猪舍-区块/舍/栏位详情页 — 4 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 猪舍-区块页面 | [`65:5401`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=65-5401) / [`1143:7548`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1143-7548) | 1440×2000 web | current | Barn block detail page: pig counts, batches and environment for one block. |
| 猪舍-栏位详情页 | [`147:8997`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=147-8997) / [`1143:8966`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1143-8966) | 1440×2000 web | current | Pen detail page for one pen, with a camera view and the pen's pig records. |
| 猪舍-栏位详情页（ 摄像头离线） | [`823:3392`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=823-3392) / [`1143:9125`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1143-9125) | 1440×2000 web | current | Pen detail with the camera offline (placeholder image instead of video). |
| 猪舍-舍详情页 | [`65:6105`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=65-6105) / [`1143:7789`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1143-7789) | 1440×2000 web | current | Barn house (舍) detail page for one house. |

</details>

<details><summary>Herd view (floor plan) · 猪群视图 — 6 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| Group 33220 ◌ | [`885:3022`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=885-3022) / [`1143:9537`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1143-9537) | 173×121 web | current | Hover card for a breeding pig (male or female) in the herd view, per note 885:3025. |
| Group 33221 ◌ | [`885:3024`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=885-3024) / [`1143:9544`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1143-9544) | 439×118 web | current | Second hover card for a breeding pig in the herd view. |
| 猪群视图 | [`235:2372`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=235-2372) / [`1143:8729`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1143-8729) | 1080×1722 web | current | Herd view in three variants: many pen columns as a grid, few pens as cards, and a list view (pig ID, pen, type, age, health grade, batch). |
| 猪群视图-平面图-图例说明 ◌ | [`318:4007`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=318-4007) / [`1426:8615`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1426-8615) | 210×396 web | current | Legend for the herd-view floor plan. |
| Group 350 ◌ | [`283:3667`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=283-3667) / [`1143:9395`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1143-9395) | 572×317 web | **unclear**: unnamed group in live section 猪舍（CN）; not screenshotted (Figma tool limit reached) | Unnamed group inside the barn section; not identified. |
| Group 351 ◌ | [`283:3683`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=283-3683) / [`1143:9399`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1143-9399) | 383×128 web | **unclear**: unnamed group in live section 猪舍（CN）; not screenshotted (Figma tool limit reached) | Unnamed group inside the barn section; not identified. |

</details>

<details><summary>Live video and recordings · 环境监控-直播/完整录像 — 6 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 1、进入时的加载 ◌ | [`1908:7936`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1908-7936) | 1080×683 web | current | Video loading state on entry; shimmer bar, progress bar held at 99% while loading (per notes). |
| 2、加载完成 ◌ | [`1491:5919`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1491-5919) | 1080×683 web | current | Video loaded state after loading completes. |
| 3、摄像头离线 ◌ | [`1899:7900`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1899-7900) | 1080×683 web | current | Camera offline state in the video viewer. |
| 4、实时AI检测-加载 ◌ | [`1899:7791`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1899-7791) | 1080×683 web | current | Loading state for live AI detection. |
| 区块/单元环境监控-直播 | [`1140:4605`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1140-4605) | 1440×900 web | current | Live camera view for a block or house, with environment monitoring. |
| 完整录像（空状态） | [`1140:2956`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1140-2956) / [`1143:7781`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1143-7781) | 1080×310 web | current | Full recording panel in its empty state. |

</details>

<details><summary>Workshop log · 日志-车间 — 3 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 日志-车间 ◌ | [`159:7004`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=159-7004) / [`1143:9292`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1143-9292) | 1440×900 web | current | Workshop event log: time, pig ID, location, event, event type, operator; filters by date, location, type, operator; search by pig ID; default newest first. |
| 废弃 | [`283:4588`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=283-4588) | 800×900 web | **archived**: frame named 废弃 inside live section 猪舍（CN） 62:4756; the screenshot shows an archived copy of this dialog | Visitor record dialog (来访记录): event content, event type, visit time, people; archived copy. |
| 废弃 | [`283:4470`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=283-4470) | 800×900 web | **archived**: frame named 废弃 inside live section 猪舍（CN） 62:4756; the screenshot shows an archived copy of this dialog | Transfer record dialog (转舍记录): filters for event type, pig ID, location and time; archived copy. |

</details>

<details><summary>Stock, task and stage cards · 存栏量、任务列表/阶段任务卡片 — 3 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 卡片 | [`1140:4443`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1140-4443) | 528×482 web | current | Production unit dialog; the screenshot shows the empty state 暂无单元 (no units yet). Name is generic. |
| 存栏量、任务列表（二者占比比例3:4） | [`257:3438`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=257-3438) / [`1143:8189`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1143-8189) | 1080×880 web | current | Stock count card and task list card in a 3:4 split, with filled, empty and hover states. |
| 组 | [`1426:8115`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1426-8115) / [`1426:7579`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1426-7579) | 3560×774 web | current | Sheet of ten stage task cards (查情, 配种, 返情检查, 孕检, 分娩, 仔猪处理, 母猪产后检查, 断奶, 结束保育检查, 结束育肥检查) with overview and progress states. |

</details>

<details><summary>Pig list and not-on-site · 猪只列表/不在场猪只 — 3 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 不在场猪只列表 | [`1264:13852`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1264-13852) / [`1518:6071`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1518-6071) | 1440×900 web | current | Table of pigs that are not on site. |
| 猪只列表 | [`1178:7707`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1178-7707) / [`1518:5875`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1518-5875) | 1440×900 web | current | Pig list page: status summary cards, search and filters, and a table of pigs. |
| 猪只列表 | [`1264:25125`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1264-25125) / [`1518:6612`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1518-6612) | 1080×1352 web | current | Pig list with category tabs (生产母猪, 生产公猪, 育种猪, 商品猪), search, location and production-status filters, and a table. |

</details>

<details><summary>Pig detail and its dialogs · 猪只详情/弹窗 — 10 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 弹窗 ◌ | [`1237:12249`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1237-12249) / [`1518:6389`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1518-6389) | 800×236 web | current | Pig detail dialog (800x236); content not checked. |
| 弹窗 ◌ | [`1264:6530`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1264-6530) / [`1518:6421`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1518-6421) | 800×780 web | current | Pig detail dialog (800x780); content not checked. |
| 弹窗 ◌ | [`1264:13003`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1264-13003) / [`1518:6488`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1518-6488) | 800×606 web | current | Pig detail dialog (800x606); content not checked. |
| 弹窗 | [`1257:4300`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1257-4300) / [`1518:6528`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1518-6528) | 480×464 web | current | Health triage level dialog: checkboxes for 紧急治疗, 优先干预, 常规观察, 健康, with cancel and confirm. |
| 弹窗 ◌ | [`1257:5180`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1257-5180) / [`1518:6560`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1518-6560) | 480×262 web | current | Pig detail dialog (480x262); content not checked. |
| 弹窗 ◌ | [`1259:4832`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1259-4832) / [`1518:6575`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1518-6575) | 480×232 web | current | Pig detail dialog (480x232); content not checked. |
| 弹窗 ◌ | [`1259:4855`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1259-4855) / [`1518:6584`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1518-6584) | 480×232 web | current | Pig detail dialog (480x232); content not checked. |
| 弹窗 ◌ | [`1259:4893`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1259-4893) / [`1518:6593`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1518-6593) | 480×306 web | current | Pig detail dialog (480x306); content not checked. |
| 弹窗 ◌ | [`1264:28348`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1264-28348) / [`1518:6602`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1518-6602) | 480×384 web | current | Pig detail dialog (480x384); content not checked. |
| 猪只详情 | [`1218:7986`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1218-7986) / [`1518:6195`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1518-6195) | 1440×1698 web | current | Pig detail page with basic info and event sections; actions open dialogs. |

</details>

<details><summary>Add pigs (file import) · 添加猪只 — 7 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 有/无身份信息猪只-列表 ◌ | [`1359:8700`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1359-8700) / [`1359:13622`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1359-13622) | 1440×1532 web | current | Imported pigs split into those with and without identity information. |
| 添加猪只-上传文件（已上传） ◌ | [`1359:8638`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1359-8638) / [`1359:13560`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1359-13560) | 1440×900 web | current | Add pigs, upload step after a file is uploaded. |
| 添加猪只-上传文件（未上传） ◌ | [`1359:8578`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1359-8578) / [`1359:13500`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1359-13500) | 1440×900 web | current | Add pigs, upload step before a file is uploaded. |
| 添加猪只-确认信息（无错误数据） ◌ | [`1359:9104`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1359-9104) / [`1359:14035`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1359-14035) | 1440×900 web | current | Confirm step when all rows are valid. |
| 添加猪只-确认信息（无错误数据） ◌ | [`1359:13840`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1359-13840) | 1440×1522 web | current | Confirm step named 'no error data', but 1522 tall, unlike either CN confirm frame. The name may be wrong. |
| 添加猪只-确认信息（有错误数据） ◌ | [`1359:8918`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1359-8918) | 1440×1576 web | current | Confirm step when the import contains error rows. |
| 跳过 ◌ | [`1359:9229`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1359-9229) / [`1359:14162`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1359-14162) | 480×232 web | current | Skip dialog in the add-pig flow; content not checked. |

</details>

<details><summary>Production line · 生产线 — 1 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 生产线 ◌ | [`1359:9198`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1359-9198) / [`1359:14129`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1359-14129) | 1440×900 web | current | Production line page in the add-pig area; content not checked. |

</details>

<details><summary>Product and review notes · 说明/评审标注 — 5 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 左菜单 ◌ | [`1359:14095`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1359-14095) | 280×900 web | current | Left navigation menu component (280 wide). |
| Group 33228 ◌ | [`1292:4896`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1292-4896) | 1210×687 web | **reference**: loose frame on the page canvas, outside every section; annotation or requirement notes, not a product screen | Review screenshot (image 31) with notes on pen tile icons, corner radii and a hover pop-up. |
| Group 33229 ◌ | [`1292:4897`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1292-4897) | 710×502 web | **reference**: loose frame on the page canvas, outside every section; annotation or requirement notes, not a product screen | Review screenshot (image 30) with notes on treatment levels, progress bars and icon colours. |
| Group 33230 ◌ | [`1292:4908`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=1292-4908) | 1196×431 web | **reference**: loose frame on the page canvas, outside every section; annotation or requirement notes, not a product screen | Review screenshot (image 32) with notes on the list layout and search. |
| Group 349 ◌ | [`136:9973`](https://www.figma.com/design/qSEc0RElNQUMWYkX30jVgr?node-id=136-9973) | 782×820 web | **reference**: loose frame on the page canvas, outside every section; annotation or requirement notes, not a product screen | PRD notes on barn levels (区, 区块, 单元) and what each overview and detail page shows; text, not a screen. |

</details>

## Immunization · 免疫

59 screens (37 current, 9 archived, 5 reference, 4 unclear, 4 draft). Grouped by: Sidebar 免疫; module headings on the canvas.

| Feature | Screens | Current | Platform | File | Entry node |
|---|---|---|---|---|---|
| Vaccination task calendar · 疫苗任务日历 | 8 | 7 | web | 🖥 📱 免疫 | [`11748:13312`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11748-13312) |
| Create immunization plan · 创建免疫计划（首免/跟批） | 10 | 8 | web | 🖥 📱 免疫 | [`11004:2810`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11004-2810) |
| Plan detail and plan list · 免疫计划详情/列表 | 5 | 4 | web | 🖥 📱 免疫 | [`11017:1896`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11017-1896) |
| Vaccine task detail · 疫苗任务详情 | 12 | 8 | web | 🖥 📱 免疫 | [`11019:3284`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11019-3284) |
| Create vaccine task (deferred) · 创建疫苗任务（这个功能先不做） | 4 | 0 | web | 🖥 📱 免疫 | [`11019:3521`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11019-3521) |
| Vaccine task list (removed) · 疫苗任务列表（这些页面没了） | 4 | 0 | web | 🖥 📱 免疫 | [`11017:2699`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11017-2699) |
| Vaccination tasks on the phone · 免疫（Mobile） | 16 | 10 | mobile | 🖥 📱 免疫 | [`11047:13784`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11047-13784) |

<details><summary>Vaccination task calendar · 疫苗任务日历 — 8 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 今日 ◌ | [`12053:20945`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=12053-20945) | 480×896 web | current | Side panel listing today's vaccination tasks. |
| 任务日历 | [`11849:10712`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11849-10712) | 1440×1500 web | current | Modal month calendar (2026.1-3) with dots on task dates; closes with 关闭. |
| 初次使用此功能 ◌ | [`11676:12555`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11676-12555) | 1440×1364 web | current | First-use onboarding screen for the vaccination task feature. |
| 弹窗 | [`11849:9240`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11849-9240) | 400×534 web | current | Modal titled 任务日期列表 listing vaccination dates by serial number, with 关闭. |
| 未来（不含今日） ◌ | [`12053:21472`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=12053-21472) | 480×544 web | current | Side panel listing upcoming vaccination tasks, excluding today. |
| 疫苗任务日历（1440px） ◌ | [`12012:10234`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=12012-10234) | 1440×1364 web | current | Vaccination task calendar at 1440px width. |
| 疫苗任务日历（1920px） ◌ | [`11748:13312`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11748-13312) | 1920×1200 web | current | Vaccination task calendar at 1920px width. |
| 历史疫苗任务 ◌ | [`11878:21483`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11878-21483) | 1440×900 web | **unclear**: Name contains 历史 (history), one of the listed archive words, but it sits in the live calendar group and reads as a feature, not an archive p | History of vaccine tasks; has a discard confirm layer (丢弃). |

</details>

<details><summary>Create immunization plan · 创建免疫计划（首免/跟批） — 10 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 创建疫苗计划（编辑态） ◌ | [`11013:1050`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11013-1050) | 1440×2200 web | current | Edit state of creating a first-round vaccination plan. |
| 创建疫苗计划（编辑态） ◌ | [`11084:7544`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11084-7544) | 1440×3100 web | current | Edit state of creating a follow-batch immunization plan. |
| 创建疫苗计划（默认态） ◌ | [`11004:2810`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11004-2810) | 1440×1400 web | current | Default state of creating a first-round (首免) vaccination plan. |
| 创建疫苗计划（默认态） ◌ | [`11082:6919`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11082-6919) | 1440×1520 web | current | Default state of creating a follow-batch immunization plan. |
| 疫苗任务设置 ◌ | [`11092:10140`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11092-10140) | 1080×2148 web | current | Settings panel for one vaccine task. |
| 自定义接种频率 ◌ | [`11037:6232`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11037-6232) | 5500×3833 web | current | Overlay (组 frame) with options for a custom vaccination interval. |
| 选择创建类型 ◌ | [`11004:3454`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11004-3454) | 1440×900 web | current | Choose the type of plan to create (first-round or follow-batch). |
| 高级筛选 ◌ | [`11024:8228`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11024-8228) | 1500×2700 web | current | Advanced filter panel for choosing pigs. |
| 废弃 ◌ | [`11128:9844`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11128-9844) | 862×152 web | **archived**: Frame named 废弃 (discarded), sitting in the live section. | Sheet of numbered checkboxes 1-30; a sample, not a screen. |
| 废弃 ◌ | [`11139:10710`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11139-10710) | 1152×106 web | **archived**: Frame named 废弃 (discarded); the radio options repeat under 自定义接种频率. | Four radio options: by day, by week, by month, by year (按天/按周/按月/按年). |

</details>

<details><summary>Plan detail and plan list · 免疫计划详情/列表 — 5 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 免疫计划列表—空状态 ◌ | [`12053:16307`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=12053-16307) | 1080×446 web | current | Empty state of the immunization plan list. |
| 免疫计划列表—跟批免疫计划 ◌ | [`12053:16620`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=12053-16620) | 1080×480 web | current | Immunization plan list showing a follow-batch plan. |
| 疫苗计划详情—普免计划 ◌ | [`11017:1896`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11017-1896) | 1440×1100 web | current | Detail page of a general (普免) vaccination plan. |
| 疫苗计划详情—跟批免疫计划 ◌ | [`11092:7263`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11092-7263) | 1440×1100 web | current | Detail page of a follow-batch (跟批) immunization plan. |
| “免疫计划信息”的多种状态 ◌ | [`11849:9567`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11849-9567) | 1080×270 web | **reference**: Spec/state sheet (multiple states of one block), not a live screen. | Sheet showing the states of the plan-info block. |

</details>

<details><summary>Vaccine task detail · 疫苗任务详情 — 12 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 关联任务 ◌ | [`11684:16663`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11684-16663) | 1440×900 web | current | Page for linking tasks. |
| 疫苗任务详情—已接种 ◌ | [`11081:6410`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11081-6410) | 1440×1200 web | current | Vaccine task detail (已接种), probably the 任务详情 tab like 11019:3284. |
| 疫苗任务详情—已接种 ◌ | [`11536:13810`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11536-13810) | 1440×900 web | current | Vaccine task detail (已接种), probably the 任务猪只列表 tab like 11536:12508. |
| 疫苗任务详情—待接种 | [`11019:3284`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11019-3284) | 1440×1188 web | current | Vaccine task detail, 任务详情 tab: plan info, task info, review settings. |
| 疫苗任务详情—待接种 | [`11536:12508`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11536-12508) | 1440×900 web | current | Vaccine task detail, 任务猪只列表 tab (pig ID, batch, location, hit adverse reaction). |
| 疫苗任务详情—接种中 ◌ | [`11081:5660`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11081-5660) | 1440×1200 web | current | Vaccine task detail (接种中), probably the 任务详情 tab like 11019:3284. |
| 疫苗任务详情—接种中 ◌ | [`11536:13025`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11536-13025) | 1440×1200 web | current | Vaccine task detail (接种中), probably the 任务猪只列表 tab like 11536:12508. |
| 补充接种、重新接种 ◌ | [`11169:10470`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11169-10470) | 2220×1312 web | current | Set of states for supplementary vaccination and re-vaccination. |
| “免疫复核设置”模块其他状态 ◌ | [`11531:11441`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11531-11441) | 1080×408 web | **reference**: Spec/state sheet, not a live screen. | Sheet showing other states of the immunization review settings module. |
| “疫苗任务信息”的多种状态 ◌ | [`11536:14768`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11536-14768) | 1080×2024 web | **reference**: Spec/state sheet, not a live screen. | Sheet showing the states of the vaccine task info block. |
| “疫苗任务设置”模块其他状态 ◌ | [`11531:11609`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11531-11609) | 1080×752 web | **reference**: Spec/state sheet, not a live screen. | Sheet showing other states of the vaccine task settings module. |
| “疫苗任务设置”的多种状态 ◌ | [`11536:12067`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11536-12067) | 1080×420 web | **reference**: Spec/state sheet, not a live screen. | Sheet showing states of the vaccine task settings block. |

</details>

<details><summary>Create vaccine task (deferred) · 创建疫苗任务（这个功能先不做） — 4 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 创建疫苗任务—Step 1 ◌ | [`11019:3521`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11019-3521) | 1440×900 web | **draft**: Group label 创建疫苗任务（这个功能先不做）: this feature is not being done for now (deferred). | Step 1 of creating a single vaccine task. |
| 创建疫苗任务—Step 2 ◌ | [`11022:6658`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11022-6658) | 1440×1100 web | **draft**: Group label 创建疫苗任务（这个功能先不做）: deferred. | Step 2 of creating a single vaccine task. |
| 创建疫苗任务—Step 3 ◌ | [`11022:8027`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11022-8027) | 1440×900 web | **draft**: Group label 创建疫苗任务（这个功能先不做）: deferred. | Step 3 of creating a single vaccine task. |
| 已选猪只列表（仅查看） ◌ | [`11024:3562`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11024-3562) | 1440×900 web | **draft**: Group label 创建疫苗任务（这个功能先不做）: deferred. | Read-only list of the pigs selected for a task. |

</details>

<details><summary>Vaccine task list (removed) · 疫苗任务列表（这些页面没了） — 4 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 列表空状态 ◌ | [`11017:2647`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11017-2647) | 1440×900 web | **archived**: Group label 疫苗任务列表（这些页面没了）: these pages are gone. | Empty state of the vaccine task list. |
| 疫苗任务列表：已完成 ◌ | [`11019:2803`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11019-2803) | 1440×900 web | **archived**: Group label 疫苗任务列表（这些页面没了）: these pages are gone. | Vaccine task list filtered to completed. |
| 疫苗任务列表：未开始 ◌ | [`11017:2699`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11017-2699) | 1440×900 web | **archived**: Group label 疫苗任务列表（这些页面没了）: these pages are gone. | Vaccine task list filtered to not started. |
| 疫苗任务列表：进行中 ◌ | [`11019:2122`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11019-2122) | 1440×900 web | **archived**: Group label 疫苗任务列表（这些页面没了）: these pages are gone. | Vaccine task list filtered to in progress. |

</details>

<details><summary>Vaccination tasks on the phone · 免疫（Mobile） — 16 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 任务详情 ◌ | [`11067:6734`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11067-6734) | 750×2500 mobile | current | Task detail page. Annotation: search row and total row stick to top on scroll. |
| 任务详情页（List） ◌ | [`11056:5538`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11056-5538) | 750×3000 mobile | current | Task detail page in list view. |
| 健康管理-默认状态 ◌ | [`11416:9883`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11416-9883) | 750×2000 mobile | current | Placeholder for the health-management jump; annotation says reuse the existing feature, no new design. |
| 单元-单剂次 ◌ | [`11047:13941`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11047-13941) | 750×2000 mobile | current | Home view for a single-dose unit. |
| 已达到任务目标 ◌ | [`11416:9530`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11416-9530) | 750×1624 mobile | current | Total-task state where the goal is reached. |
| 总览 ◌ | [`11047:13784`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11047-13784) | 750×2500 mobile | current | Home overview of tasks. |
| 总览-选择执行任务 ◌ | [`11047:13667`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11047-13667) | 750×1624 mobile | current | Home state for choosing a task to execute. |
| 操作结果 ◌ | [`11141:21702`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11141-21702) | 750×1624 mobile | current | Result screen after an operation (check-mark confirmation). |
| 更多操作 ◌ | [`11416:9786`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11416-9786) | 750×1624 mobile | current | Bottom sheet of more actions for a task. |
| 未达到任务目标 ◌ | [`11416:9562`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11416-9562) | 750×1624 mobile | current | Total-task state where the goal is not reached. |
| 任务详情页（Grid） ◌ | [`11067:5850`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11067-5850) | 750×2500 mobile | **archived**: Canvas text 不要grid视图 (no grid view) sits directly above this frame; mobile list view (11056:5538) is kept instead. | Grid-view variant of the task detail page. |
| 本间完成——二次确认 ◌ | [`11067:6634`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11067-6634) | 750×1624 mobile | **archived**: Canvas text 这页面也没了 (this page is gone too) sits directly above this frame. | Second confirm dialog for completing the current pen. |
| 栏位猪只列表 ◌ | [`11067:6234`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11067-6234) | 750×2500 mobile | **archived**: Canvas text 这页面也没了 (this page is gone too) sits directly above this frame. | Pig list for one pen (栏位). |
| 移出接种列表 | [`11067:6654`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11067-6654) | 750×1624 mobile | **unclear**: Loose canvas frame above 免疫（Mobile）, no section; no archive marker. Screenshot shows a normal confirm modal. | Confirm modal asking to remove 1 pig from the vaccination list. |
| 结束任务 ◌ | [`11067:7385`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11067-7385) | 750×1624 mobile | **unclear**: Loose canvas frame above 免疫（Mobile）, not inside a section; no archive marker. A red note inside says 执行详情没意义 (execution detail is meaningles | End-task page in the goal-reached state, with a confirm checkbox and button. |
| 结束任务 | [`11067:7463`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11067-7463) | 750×1624 mobile | **unclear**: Loose canvas frame above 免疫（Mobile）, not inside a section; no archive marker. | End-task page in the goal-not-reached state. |

</details>

## Biosecurity · 生物安全

49 screens (44 current, 3 archived, 2 unclear). Grouped by: Sidebar 生物安全 › 生物安全监控, 采样&检测, 采样计划.

| Feature | Screens | Current | Platform | File | Entry node |
|---|---|---|---|---|---|
| Sampling and testing · 采样与检测 | 11 | 10 | web | 🖥 采样与检测 | [`6001:4860`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6001-4860) |
| Pending tests and manual samples · 待检测列表/手动添加样本 | 5 | 5 | web | 🖥 采样与检测 | [`6087:11677`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6087-11677) |
| Supplies disinfection (web) · 物资消杀（Console） | 6 | 6 | web | 🖥📱 物资消杀 | [`13003:476`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13003-476) |
| Supplies disinfection and doors (phone) · 物资消杀（App） | 27 | 23 | mobile | 🖥📱 物资消杀 | [`13431:3940`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3940) |

<details><summary>Sampling and testing · 采样与检测 — 11 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 1.禁选态；2.可选态；3.已选态 | [`6001:6113`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6001-6113) / [`6001:7340`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6001-7340) | 1112×442 web | current | Spec sheet of the sample-type chip states: disabled, selectable, selected. |
| 创建采样任务-编辑状态 | [`6001:5099`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6001-5099) / [`6001:6381`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6001-6381) | 1440×1592 web | current | Create sampling task form in edit state, shorter frame (1592px tall). |
| 创建采样任务-编辑状态 | [`6001:5197`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6001-5197) / [`6001:6479`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6001-6479) | 1440×2630 web | current | Create sampling task form in edit state, taller frame (2630px tall). |
| 创建采样任务-默认状态 | [`6001:5022`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6001-5022) / [`6001:6304`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6001-6304) | 1440×900 web | current | Create sampling task form in its default (empty) state. |
| 删除-二次确认 | [`6009:5622`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6009-5622) / [`6014:5709`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6014-5709) | 480×232 web | current | Delete confirmation dialog with title, body and action buttons, reached from the list's trash icon. |
| 查看采样视频 | [`6001:6162`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6001-6162) / [`6001:7385`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6001-7385) | 1440×900 web | current | Overlay that shows the sampling video over a dimmed mask; the video area is a placeholder image in this file. |
| 详情（已检测） | [`6001:5903`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6001-5903) / [`6001:7133`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6001-7133) | 1440×2665 web | current | Detail page of a completed test (已检测): test result, sampling task info, sample sections, notes, and an attached test report file. |
| 详情（待检测） | [`6001:5676`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6001-5676) / [`6001:6945`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6001-6945) | 1440×1752 web | current | Detail page of a sampling task in 待检测 (awaiting test) status. |
| 详情（待采样） | [`6001:5492`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6001-5492) / [`6001:6764`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6001-6764) | 1440×1544 web | current | Detail page of a sampling task in 待采样 (awaiting sampling) status. |
| 采样&检测列表-CN | [`6001:4860`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6001-4860) / [`6001:6168`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6001-6168) | 1440×946 web | current | Sampling task list with 待采样 / 待检测 / 已检测 tabs, date and sample-ID filters, row actions (view, upload, delete), and a 创建采样任务 button. |
| 改之前 | [`6001:5864`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6001-5864) | 1080×414 web | **archived**: Frame named 改之前 ('before the change') sits in a live section, beside the revised detail frames. Superseded before-state; no EN counterpart. | Earlier layout of the two detail info cards (检测结果 and 采样任务信息), kept for comparison with the revised detail states. |

</details>

<details><summary>Pending tests and manual samples · 待检测列表/手动添加样本 — 5 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| Snackbar | [`6087:19797`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6087-19797) / [`6093:7445`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6093-7445) | 230×56 web | current | Confirmation toast shown after a sample is added. |
| 待检测列表 | [`6087:11677`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6087-11677) / [`6093:7120`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6093-7120) | 1440×900 web | current | Pending-test list as a single table with no status tabs, with a 手动添加样本 button to add a sample by hand. |
| 手动添加样本（已知样品） | [`6111:12429`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6111-12429) / [`6114:11479`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6114-11479) | 1440×1234 web | current | Manual add for a known sample: the 人员 (person) type chip is selected and a person list with an add button appears below. |
| 手动添加样本（未知样品） | [`6111:11495`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6111-11495) / [`6114:11602`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6114-11602) | 1440×948 web | current | Manual add for an unknown sample: the '?' (unknown) type chip is selected and the form below changes for it. |
| 手动添加样本（默认态） | [`6087:11839`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6087-11839) / [`6114:11377`](https://www.figma.com/design/WJYP32oqthOUHOa7xdjDcb?node-id=6114-11377) | 1440×900 web | current | Manual add sample form in its default state: sample number and sample-type chips, nothing selected, with cancel and confirm buttons. |

</details>

<details><summary>Supplies disinfection (web) · 物资消杀（Console） — 6 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 创建消杀区域（编辑状态） | [`13076:15009`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13076-15009) / [`13317:2136`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13317-2136) | 1440×1700 web | current | Edit-area form: same sections as create, with fields filled in. |
| 创建消杀区域（默认状态） | [`13045:2583`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13045-2583) / [`13317:2054`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13317-2054) | 1440×1400 web | current | Create-area form: basic settings, risk and disinfection settings. |
| 删除-二次确认 | [`13593:3018`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13593-3018) / [`13593:3061`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13593-3061) | 480×232 web | current | Confirm dialog to delete a disinfection area. |
| 操作记录 | [`13008:1233`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13008-1233) / [`13317:1719`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13317-1719) | 1440×900 web | current | Right-side drawer listing the disinfection operation records over a dimmed page. |
| 物资消杀 | [`13003:476`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13003-476) / [`13317:1611`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13317-1611) | 1440×900 web | current | Disinfection area list: area cards with status and action buttons, plus a create button. |
| 物资消杀-空状态 | [`13307:2382`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13307-2382) | 1440×900 web | current | Disinfection area list with no areas yet. |

</details>

<details><summary>Supplies disinfection and doors (phone) · 物资消杀（App） — 27 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 关门-二次确认 ◌ | [`13431:3458`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3458) | 750×1624 mobile | current | Confirm dialog to close the door. Present only in the EN section. |
| 工具箱 ◌ | [`13431:3940`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3940) / [`13431:2815`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-2815) | 750×1624 mobile | current | App toolbox: category tiles including 物资消杀 and 门禁. |
| 工具箱 ◌ | [`13431:4642`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-4642) / [`13431:3517`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3517) | 750×1624 mobile | current | Second toolbox screen (App CN). |
| 开始消杀 ◌ | [`13431:4446`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-4446) / [`13431:3321`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3321) | 750×1624 mobile | current | Start-disinfection screen in progress. |
| 开始消杀（默认态） ◌ | [`13431:4411`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-4411) / [`13431:3286`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3286) | 750×1624 mobile | current | Start-disinfection screen, default state. |
| 开门-已选择门 ◌ | [`13431:4319`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-4319) / [`13431:3194`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3194) | 750×1624 mobile | current | Open-door screen with a door selected. |
| 开门-有风险 ◌ | [`13431:4570`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-4570) / [`13431:3445`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3445) | 750×1624 mobile | current | Open-door screen with a risk warning. |
| 开门-获取密码失败 ◌ | [`13431:4397`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-4397) / [`13431:3272`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3272) | 750×1624 mobile | current | Open-door: password request failed. |
| 开门-获取密码成功 ◌ | [`13431:4337`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-4337) / [`13431:3212`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3212) | 750×1624 mobile | current | Open-door: password obtained successfully. |
| 开门-获取离线密码（有二维码） ◌ | [`13431:4358`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-4358) / [`13431:3233`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3233) | 750×1624 mobile | current | Open-door: offline password shown as a QR code. |
| 开门-默认态 ◌ | [`13431:4291`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-4291) / [`13431:3166`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3166) | 750×1624 mobile | current | Open-door screen, default state before a door is chosen. |
| 弹窗 ◌ | [`13431:4536`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-4536) / [`13431:3411`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3411) | 750×1624 mobile | current | Generic dialog in the start-disinfection flow (content not readable at section scale). |
| 物资消杀-空状态 ◌ | [`13431:4708`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-4708) / [`13431:3583`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3583) | 750×1624 mobile | current | Disinfection home with no areas yet. |
| 物资消杀（无门禁-单门/多门） ◌ | [`13431:4229`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-4229) / [`13431:3104`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3104) | 750×1624 mobile | current | Disinfection home for sites without door access; single- and multi-door variants. |
| 物资消杀（有门禁） ◌ | [`13431:3965`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3965) / [`13431:2840`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-2840) | 750×1624 mobile | current | Disinfection home when the site has door access. |
| 绑定设备 ◌ | [`13509:3524`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13509-3524) / [`13431:3495`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3495) | 750×1624 mobile | current | Bind a device to a disinfection area. |
| 设备位置 ◌ | [`13509:3379`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13509-3379) / [`13431:3492`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3492) | 750×1624 mobile | current | Choose the device location for a disinfection area. |
| 设置 ◌ | [`13431:4173`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-4173) / [`13431:3048`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3048) | 750×1624 mobile | current | Disinfection module settings screen. |
| 选择时间单位 ◌ | [`13431:4567`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-4567) / [`13431:3442`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3442) | 750×1624 mobile | current | Bottom sheet to choose the time unit for disinfection duration. |
| 选择消杀方式 ◌ | [`13431:4513`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-4513) / [`13431:3388`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3388) | 750×1624 mobile | current | Bottom sheet to choose the disinfection method. |
| 选择消杀物资 ◌ | [`13431:4481`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-4481) / [`13431:3356`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3356) | 750×1624 mobile | current | Bottom sheet to choose the supplies to disinfect. |
| 门禁 ◌ | [`13431:4039`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-4039) / [`13431:2914`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-2914) | 750×1624 mobile | current | Access-control door list. |
| 门禁-空状态 ◌ | [`13431:4089`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-4089) / [`13431:2964`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-2964) | 750×1624 mobile | current | Access-control list with no doors yet. |
| 工具箱 | [`13318:4158`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13318-4158) | 750×1624 mobile | **unclear**: sits on the page root, outside every section; no archive marker, but no live-section placement either | Toolbox with a dimmed overlay and the 门禁 tile highlighted (a callout-style state). |
| 废弃 | [`13431:3477`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3477) | 670×504 mobile | **archived**: layer name is exactly 废弃, inside live section 物资消杀（App）（EN）; screenshot checked | Offline-password dialog: password failed, with a button to fetch the offline password without network. |
| 弹窗 ◌ | [`13513:4828`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13513-4828) | 670×372 unknown | **unclear**: page-root frame with slot names, no archive marker; looks like a spec template, not a screen | Generic dialog skeleton with 标题, 内容 and 底部按钮 slots; not a specific screen. |
| （废弃）开门-获取离线密码（无二维码） ◌ | [`13431:4378`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-4378) / [`13431:3253`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13431-3253) | 750×1624 mobile | **archived**: Layer name starts with （废弃）. Its EN twin 13431:3253 has no marker but renders identically, so both are archived. | Open-door: offline password without QR (marked obsolete). |

</details>

## Users and access · 用户管理

163 screens (135 current, 24 unclear, 4 archived). Grouped by: Sidebar 用户管理 › 用户 (员工, 访客), 用户厂区权限, 进出厂请求.

| Feature | Screens | Current | Platform | File | Entry node |
|---|---|---|---|---|---|
| Admin sign-in · Log-in | 8 | 8 | web | Sentri Console（Done） | [`6210:34883`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6210-34883) |
| Staff · 员工 | 18 | 14 | web | Sentri Console（Done） | [`5980:40479`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-40479) |
| Guests · 访客 | 12 | 12 | web | Sentri Console（Done） | [`5980:44677`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-44677) |
| User site permissions · 用户厂区权限 | 30 | 28 | web | Sentri Console（Done）, 🖥 用户厂区权限 | [`2001:8882`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2001-8882) |
| Permission types · 权限类型 | 12 | 11 | web | Sentri Console（Done） | [`6214:41077`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6214-41077) |
| Grant access (earlier flow) · User Access Control / H5 | 22 | 21 | mobile/web | Sentri Console（Done） | [`873:8683`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=873-8683) |
| Entry application (phone H5) · 员工/非员工-入场申请 | 28 | 26 | mobile | Sentri Console（Done） | [`6210:35009`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6210-35009) |
| Entry and exit requests · 进出厂请求/出入场审批 | 15 | 15 | mobile/web | Sentri Console（Done）, 🖥 用户厂区权限 | [`981:13726`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=981-13726) |
| Changes dated 2025/02/28 · 2025/02/28 | 18 | 0 | mobile/web | Sentri Console（Done） | [`6980:48871`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6980-48871) |

<details><summary>Admin sign-in · Log-in — 8 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| ResetPassword_Centered | [`6210:34889`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6210-34889) / [`570:18423`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=570-18423) | 1440×1024 web | current | Forgot-password screen telling the user to contact the Sentri admin, with a return-to-sign-in link. |
| SignIn_Centered（Default） | [`6210:34883`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6210-34883) / [`570:18405`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=570-18405) | 1440×1024 web | current | Sign-in with phone or email, password and Farm ID; language switch 中文 / English. |
| 字段为空提示 | [`6822:46058`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6822-46058) / [`6821:45412`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6821-45412) | 460×700 web | current | Sign-in with required fields empty, showing a red message under each field. |
| 已输入状态 | [`6822:46848`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6822-46848) / [`6821:45238`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6821-45238) | 460×622 web | current | Sign-in with phone, password and Farm ID filled in. |
| 系统自动填充Farm ID，不可修改 | [`6822:46763`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6822-46763) / [`6821:45146`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6821-45146) | 460×622 web | current | Farm ID filled in by the system and locked from editing. |
| 输入错误时的报错提示文案 | [`6822:46025`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6822-46025) / [`6822:46024`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6822-46024) | 368×288 web | current | Error list: incorrect phone or email, incorrect password, incorrect Farm ID. |
| 默认状态（通过sentri.com进入） | [`6822:46678`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6822-46678) / [`6821:45324`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6821-45324) | 460×622 web | current | Sign-in with an empty Farm ID field for the user to type it. |
| 默认状态（通过特殊URL进入，需要显示厂区名称） | [`6886:73804`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6886-73804) / [`6885:73719`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6885-73719) | 460×656 web | current | Sign-in opened from a farm-specific URL, which shows the farm name. |

</details>

<details><summary>Staff · 员工 — 18 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| Add User | [`5980:40810`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-40810) / [`132:11043`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=132-11043) | 1440×1024 web | current | Form to add a staff (name, phone, role, email, access) before sending the entrance link. |
| Add User | [`5980:41098`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-41098) / [`132:10555`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=132-10555) | 1440×828 web | current | Form to add a staff (name, phone, role, email, access) before sending the entrance link. |
| Delete 11 | [`5980:41061`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-41061) / [`132:20848`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=132-20848) | 480×184 unknown | current | Delete-user warning: the action is not reversible and all information will be deleted. |
| Delete 12 | [`5980:41065`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-41065) / [`132:20852`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=132-20852) | 480×312 unknown | current | Delete-user confirmation: type the person's name to confirm deletion. |
| Delete 13 | [`5980:41093`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-41093) / [`166:9135`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=166-9135) | 480×312 unknown | current | Delete-user confirmation: type the person's name to confirm deletion. |
| Error | [`5980:41115`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-41115) / [`879:20826`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=879-20826) | 480×184 unknown | current | Error: at least one Face ID image is required, shown when the last photo is deleted. |
| Exit farm | [`5980:41070`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-41070) / [`132:22005`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=132-22005) | 480×408 unknown | current | Exit-farm dialog: confirm the person has left by typing their name; access is then removed. |
| Exit farm 4 | [`5980:41077`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-41077) / [`132:22067`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=132-22067) | 480×312 unknown | current | Exit-farm dialog step: pick the reason for leaving (leave, non-staff exit, work-required leave, other). |
| Face ID pictures | [`5980:40978`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-40978) / [`132:10962`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=132-10962) | 1440×1024 web | current | Grid of candidate Face ID photos to tick (up to 8 kept), then confirm. |
| Profile - Basic info | [`5980:40664`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-40664) / [`132:10328`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=132-10328) | 1440×1138 web | current | Staff profile with employee details, software or area access, and Edit, Exit farm and Delete actions. |
| Profile Edit | [`5980:40479`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-40479) / [`7:15171`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=7-15171) | 1440×1138 web | current | Editable profile form for name, phone, role and access checkboxes. |
| Read me | [`12:8628`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=12-8628) | 974×1270 unknown | current | Spec sheet: staff status, employee ID rules, job titles, sequence numbers, and the staff and guest flows. |
| Staff view | [`5980:40558`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-40558) / [`132:9982`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=132-9982) | 1440×1123 web | current | Staff table with search, filters, an Add button and an entrance-link button; rows open a profile. |
| Terminate | [`5980:41086`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-41086) / [`132:20857`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=132-20857) | 480×312 unknown | current | Terminate dialog: type the person's name to confirm termination. |
| Profile - Biosecurity12 | [`877:11799`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=877-11799) | 1440×1562 web | **unclear**: EN frame; the Staff - CN mirror (frame 此页面被user access 里面的页面替代) marks the same page as replaced by the User Access page. | Face ID photos, entry permissions and access levels (L1, L2) for this person. |
| Profile - Task Priority | [`7:15298`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=7-15298) | 1440×1154 web | **unclear**: EN frame; the Staff - CN mirror is named 此页面取消了 (page cancelled) at the same size. | Task priority settings by zone (Zone 1, Zone 2) for this staff member. |
| 此页面取消了 | [`5980:40457`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-40457) | 1440×1154 web | **archived**: Frame name 此页面取消了 (this page was cancelled), inside Staff - CN. | Profile task-priority page whose own frame name says it was cancelled. |
| 此页面被user access 里面的页面替代 | [`5980:40735`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-40735) | 1440×1562 web | **archived**: Frame name 此页面被user access 里面的页面替代 (replaced by the page in user access), inside Staff - CN. | Profile biosecurity page whose frame name says it is replaced by the page in User Access. |

</details>

<details><summary>Guests · 访客 — 12 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| Add User | [`5980:44973`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-44973) / [`132:22122`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=132-22122) | 1440×1024 web | current | Form to add a guest (name, phone, role, email, access) before sending the entrance link. |
| Delete 14 | [`5980:45218`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-45218) / [`132:22775`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=132-22775) | 480×208 unknown | current | Delete-user warning: the action is not reversible and all information will be deleted. |
| Delete 15 | [`5980:45226`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-45226) / [`132:22779`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=132-22779) | 480×312 unknown | current | Delete-user confirmation: type the person's name to confirm deletion. |
| Delete 16 | [`5980:45313`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-45313) / [`163:10344`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=163-10344) | 480×312 unknown | current | Delete-user confirmation: type the person's name to confirm deletion. |
| Error | [`5980:45222`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-45222) / [`879:20730`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=879-20730) | 480×184 unknown | current | Error: at least one Face ID image is required, shown when the last photo is deleted. |
| Exit farm | [`5980:44959`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-44959) / [`132:22089`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=132-22089) | 480×432 unknown | current | Exit-farm dialog: confirm the person has left by typing their name; access is then removed. |
| Exit farm 5 | [`5980:44966`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-44966) / [`132:22096`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=132-22096) | 480×312 unknown | current | Exit-farm dialog step: pick the reason for leaving (leave, non-staff exit, work-required leave, other). |
| Face ID pictures | [`5980:45232`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-45232) / [`132:23218`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=132-23218) | 1440×1024 web | current | Grid of candidate Face ID photos to tick (up to 8 kept), then confirm. |
| Guest View | [`5980:44677`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-44677) / [`132:10080`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=132-10080) | 1440×1123 web | current | Guest table with search, filters, an Add button and an entrance-link button; rows open a profile. |
| Profile - Basic info | [`5980:44790`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-44790) / [`132:20925`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=132-20925) | 1440×1218 web | current | Guest profile with employee details, software or area access, and Edit, Exit farm and Delete actions. |
| Profile - Biosecurity | [`5980:44844`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-44844) / [`132:20996`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=132-20996) | 1440×1554 web | current | Face ID photos, entry permissions and access levels (L1, L2) for this person. |
| Profile Edit | [`5980:45145`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5980-45145) / [`132:22699`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=132-22699) | 1440×1138 web | current | Editable profile form for name, phone, role and access checkboxes. |

</details>

<details><summary>User site permissions · 用户厂区权限 — 30 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| Frame 33189 | [`6214:40091`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6214-40091) / [`5016:35007`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5016-35007) | 1440×1208 web | current | Access control page with tabs, a search box, a user table and a Grant Access button. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| Read Me | [`6214:40183`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6214-40183) / [`5016:35099`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5016-35099) | 500×856 web | current | Spec note for the access control screens. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| 查看权限类型 | [`6214:40993`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6214-40993) / [`5016:55074`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5016-55074) | 1440×960 web | current | Modal listing the permission types for a person, with level checkboxes. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| 查看视频 | [`6214:40910`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6214-40910) / [`5016:36305`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5016-36305) | 1440×960 web | current | Video modal explaining the permission test; placeholder shown. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| 查看（直接搬过来的，无改动） | [`8442:111920`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=8442-111920) | 2200×1153 web | current | Frame labelled as copied over with no changes; which page it duplicates is unclear. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| 编辑权限 - 待给权限/无权限 | [`6214:40186`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6214-40186) / [`5016:35581`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5016-35581) | 1440×960 web | current | Edit permissions: each access type is pending or has no permission. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| 编辑权限 - 无需凭证权限类型 | [`6214:40552`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6214-40552) / [`5016:35947`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5016-35947) | 1440×960 web | current | Edit permissions: a permission type that needs no credential. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| 编辑权限 - 检测结果 | [`6214:40290`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6214-40290) / [`5016:35685`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5016-35685) | 1440×960 web | current | Edit permissions: a test result is shown for the access type. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| 编辑权限 - 检测结果（无结果） | [`6214:40434`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6214-40434) / [`5016:35829`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5016-35829) | 1440×960 web | current | Edit permissions: the test result is empty (no result). PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| 编辑权限 - 特殊批准 | [`6214:40668`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6214-40668) / [`5016:36063`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5016-36063) | 1440×960 web | current | Edit permissions: special approval, with a document to upload. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| 编辑权限 - 特殊批准（已上传） | [`6214:40788`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6214-40788) / [`5016:36183`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5016-36183) | 1440×960 web | current | Edit permissions: special approval, document uploaded. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| Frame 33192 | [`6214:41650`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6214-41650) / [`5016:61345`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5016-61345) | 500×280 web | **unclear**: Frame name is only a number. | Unnamed 500x280 popover; purpose unclear from the name. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| Frame 33193 | [`6214:41652`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6214-41652) / [`5061:39422`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5061-39422) | 1440×934 web | **unclear**: Frame name is only a number. | Unnamed 1440-wide access-control screen; purpose unclear from the name. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| 出厂-二次确认 | [`2034:4087`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2034-4087) / [`2034:4159`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2034-4159) | 600×334 web | current | Confirm dialog 出厂: 'once this flow completes, the person loses all site permissions. Confirm they have left the site?', with an exit-reason dropdown and 取消 / 出厂 (red). |
| 厂区权限 | [`2001:8882`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2001-8882) / [`2033:14327`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2033-14327) | 1440×1446 web | current | Staff list with tabs (全部 / 待给权限 / 即将失效), search, 权限日志 button, and per-row view, edit, and exit actions. Columns: user, permission type and validity, site purpose and dates, latest test result. |
| 厂区权限详情 | [`2013:2154`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2013-2154) / [`2112:9828`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2112-9828) | 600×378 web | current | Edit dialog titled 编辑用户厂区权限: permission type dropdown and permission validity date, with 取消 and 确认. Frame name says 厂区权限详情 but the content is the edit form. |
| 授权凭证：无需授权凭证 | [`2023:11817`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2023-11817) / [`2112:10117`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2112-10117) | 600×510 web | current | Edit dialog for a credential that needs no authorization document. |
| 授权凭证：无需授权凭证 | [`2030:9174`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2030-9174) / [`2112:10132`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2112-10132) | 600×578 web | current | View dialog for a user whose site permission needs no credential document. Same name as 2023:11817 (edit); the view/edit split is by column position. |
| 授权凭证：检测报告（无检测结果） | [`2023:11461`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2023-11461) / [`2112:9848`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2112-9848) | 600×676 web | current | Edit dialog where the authorization credential is a test report with no result yet: test-item chips and a file upload area. |
| 授权凭证：检测报告（有检测结果） | [`2023:11619`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2023-11619) / [`2112:9883`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2112-9883) | 600×766 web | current | Edit dialog where the test report has a result (positive or negative), with the result and sample-time fields. |
| 授权凭证：特殊批准（已上传） | [`2023:12007`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2023-12007) / [`2112:10030`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2112-10030) | 600×772 web | current | Edit dialog where the special-approval file is uploaded (shows the uploaded file row). |
| 授权凭证：特殊批准（未上传） | [`2023:11718`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2023-11718) / [`2112:9995`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2112-9995) | 600×650 web | current | Edit dialog where the credential is a special approval and no approval file is uploaded yet. |
| 无权限 | [`2030:8819`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2030-8819) / [`2112:9838`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2112-9838) | 600×446 web | current | View dialog for a user with no site permission (no active grant). Footer has a close action. |
| 无权限 - 点击编辑权限 | [`2303:3742`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2303-3742) | 480×334 web | current | Dialog for a user with no permission when edit is clicked. Title and body text; body copy not extracted. |
| 无采样视频 | [`2130:12594`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2130-12594) / [`2130:12681`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2130-12681) | 552×152 web | current | Same test-result card when no sampling video exists. |
| 有权限：授权凭证：检测报告 | [`2030:9047`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2030-9047) / [`2112:9937`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2112-9937) | 600×934 web | current | View dialog for a user with permission granted on a test-report credential: result, sample and upload info, and sampling-video links. |
| 有权限：授权凭证：特殊批准 | [`2030:9133`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2030-9133) / [`2112:10077`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2112-10077) | 600×778 web | current | View dialog for a user with permission granted on a special-approval credential. |
| 有采样视频 | [`2130:12572`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2130-12572) / [`2130:12659`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2130-12659) | 552×152 web | current | Test-result record card with a sampling video: test item, result, sample time, report upload time, uploader, and video. |
| 查看采样视频 | [`2010:5621`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2010-5621) / [`2033:15052`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2033-15052) | 1440×900 web | current | Full-page state: a sampling-video layer and grey video placeholder open over the test-report dialog. Per the note, the video layer stacks on top without closing the edit or view dialog. |
| 采样视频还未处理完成 | [`2130:12616`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2130-12616) / [`2130:12703`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2130-12703) | 552×152 web | current | Same test-result card while the sampling video is still processing. |

</details>

<details><summary>Permission types · 权限类型 — 12 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| CN-创建 | [`6214:41298`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6214-41298) | 1440×1026 web | current | Form to create an access profile type: name, jobs, permission levels and credential rule. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| Delete 17 | [`6214:41557`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6214-41557) / [`5016:36389`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5016-36389) | 480×360 web | current | Delete confirmation for an access profile type (warning, then name entry). PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| Delete 18 | [`6214:41563`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6214-41563) / [`5016:36395`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5016-36395) | 480×360 web | current | Delete confirmation for an access profile type (warning, then name entry). PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| Delete 19 | [`6214:41569`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6214-41569) / [`5016:36401`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5016-36401) | 480×184 web | current | Short delete confirmation for an access profile type. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| Delete 20 | [`6214:41573`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6214-41573) / [`5016:36405`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5016-36405) | 480×184 web | current | Short delete confirmation for an access profile type. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| EN-创建 | [`8445:114999`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=8445-114999) | 1440×1026 web | current | Form to create an access profile type: name, jobs, permission levels and credential rule. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| Job_List | [`6214:41077`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6214-41077) / [`5016:35102`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5016-35102) | 1440×1042 web | current | Grid of access profile type cards (one per job), with search and Create. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| Profile - Biosecurity12 | [`6214:41577`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6214-41577) / [`5016:60742`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5016-60742) | 1440×1642 web | current | Profile biosecurity tab: Face ID photos and the access profile types granted. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| TableView/User | [`6214:41486`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6214-41486) / [`5016:35510`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5016-35510) | 1080×784 web | current | Table of users with their access status and profile types. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| 创建 | [`5016:35323`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5016-35323) | 1440×804 web | current | Form to create an access profile type: name, jobs, permission levels and credential rule. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| 详情 | [`6214:41385`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6214-41385) / [`5016:35409`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=5016-35409) | 1440×1540 web | current | Detail page for one access profile type, with its permissions and an edit action. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| 废弃 | [`8445:114966`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=8445-114966) | 252×252 unknown | **archived**: Frame name 废弃 (deprecated) inside Access Control - CN. | Frame named 废弃 (deprecated) in the CN section, 252x252. |

</details>

<details><summary>Grant access (earlier flow) · User Access Control / H5 — 22 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| Access details | [`873:8837`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=873-8837) | 1440×1027 web | current | Access details: test results and entrance-permission record for one user. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| Add User | [`877:14162`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=877-14162) | 375×812 mobile | current | Mobile step of the grant-access flow (auth type, results, levels or add user). |
| Add User | [`877:14192`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=877-14192) | 375×812 mobile | current | Mobile step of the grant-access flow (auth type, results, levels or add user). |
| Add User | [`877:14229`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=877-14229) | 375×812 mobile | current | Mobile step of the grant-access flow (auth type, results, levels or add user). |
| Add User | [`877:14239`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=877-14239) | 375×812 mobile | current | Mobile step of the grant-access flow (auth type, results, levels or add user). |
| Add User | [`877:14248`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=877-14248) | 375×812 mobile | current | Mobile step of the grant-access flow (auth type, results, levels or add user). |
| Complete | [`873:9283`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=873-9283) | 1440×1024 web | current | Confirmation 'Access Granted!' with a Back button. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| Frame 33182 | [`873:8683`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=873-8683) | 1440×934 web | current | User access list in one of three tab states (grant status), with a Grant Access action. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| Frame 33183 | [`873:8739`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=873-8739) | 1440×815 web | current | User access list, second tab state. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| Frame 33184 | [`873:8784`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=873-8784) | 1440×815 web | current | User access list, third tab state. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| Grant Access - Exec 1 | [`873:9148`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=873-9148) | 1440×1048 web | current | Grant access with executive approval: drop or select a PDF to upload. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| Grant Access - Exec 2 | [`873:9186`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=873-9186) | 1440×684 web | current | Grant access with executive approval, review step. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| Grant Access - Exec 3 | [`1078:15487`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=1078-15487) | 1440×1156 web | current | Grant access with executive approval, levels step. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| Grant Access - Exec uploaded | [`873:9167`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=873-9167) | 1440×1048 web | current | Grant access with executive approval: uploaded file preview. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| Grant Access - test 1 | [`873:8937`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=873-8937) | 1440×1240 web | current | Grant access step: choose the authorisation type (test result) and select valid results. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| Grant Access - test 2 | [`873:8989`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=873-8989) | 1440×1452 web | current | Grant access step: grant or remove Farm Access levels L1 to L4 for each person. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| Grant access - Add user | [`873:9293`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=873-9293) | 1440×1024 web | current | Search and tick users to add to the grant list, then Add. PERMISSIONS OVERLAP: user/farm permission screen, overlaps the 用户厂区权限 file. |
| [MOBILE] Staff view | [`883:15323`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=883-15323) | 375×812 mobile | current | Mobile staff list view. |
| [MOBILE] User_List | [`877:13838`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=877-13838) | 375×812 mobile | current | Mobile list of users with access status; tap one to grant access. |
| [MOBILE] User_List | [`877:13923`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=877-13923) | 375×1177 mobile | current | Mobile list of users with access status; tap one to grant access. |
| [MOBILE] User_List | [`877:14077`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=877-14077) | 375×812 mobile | current | Mobile list of users with access status; tap one to grant access. |
| [MOBILE] Product_Checkout_Complete | [`877:14259`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=877-14259) | 375×812 mobile | **unclear**: Frame name copied from a product-checkout template; content is an access-granted success state. | Success screen 'Access granted' with a back-to-list link. |

</details>

<details><summary>Entry application (phone H5) · 员工/非员工-入场申请 — 28 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| Guests - Entry form ◌ | [`6210:35009`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6210-35009) / [`972:20188`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=972-20188) | 375×1899 mobile | current | Mobile guest entry-application form: long scrolling questions and submit. |
| Guests - Entry form - face 12 ◌ | [`6210:35067`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6210-35067) / [`972:20265`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=972-20265) | 375×812 mobile | current | Mobile face-capture step with framing tips. |
| Guests - Entry form - face 13 ◌ | [`6210:35074`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6210-35074) / [`972:20272`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=972-20272) | 375×812 mobile | current | Mobile face-capture step with framing tips. |
| Guests - Entry form - face 14 ◌ | [`6210:35082`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6210-35082) / [`972:20280`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=972-20280) | 375×872 mobile | current | Mobile face-capture step with framing tips. |
| Guests - Entry form - face 15 ◌ | [`6210:35343`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6210-35343) / [`972:20541`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=972-20541) | 375×812 mobile | current | Mobile face-capture step with framing tips. |
| Guests - Entry form - face 16 ◌ | [`6210:35601`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6210-35601) / [`972:22270`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=972-22270) | 375×812 mobile | current | Mobile face-capture step with framing tips. |
| Guests - Entry form - face 17 | [`6213:36187`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6213-36187) / [`972:19820`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=972-19820) | 375×909 mobile | current | Mobile face-capture step with framing tips. |
| Guests - Entry form - face 18 | [`6213:36544`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6213-36544) / [`976:13300`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=976-13300) | 375×812 mobile | current | Mobile face-capture step with framing tips. |
| Guests - Entry form - face 19 | [`6213:36551`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6213-36551) / [`1558:23928`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=1558-23928) | 375×812 mobile | current | Mobile face-capture step with framing tips. |
| Guests - Entry form - face 20 ◌ | [`6213:36559`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6213-36559) | 375×812 mobile | current | Mobile face-capture step with framing tips. |
| Guests - Entry form - face 21 ◌ | [`6213:36817`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6213-36817) | 375×812 mobile | current | Mobile face-capture step with framing tips. |
| Guests - Entry form 3 ◌ | [`6210:35037`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6210-35037) / [`972:20235`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=972-20235) | 375×2197 mobile | current | Mobile guest entry-application form: long scrolling questions and submit. |
| Guests - Image Quality Low | [`8748:53458`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=8748-53458) | 375×812 mobile | current | Mobile error: photo quality is too low; retake. |
| Guests - Success | [`976:13315`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=976-13315) | 375×812 mobile | current | Mobile success screen after the entry application is submitted. |
| Staff - Entry form | [`6213:36504`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6213-36504) / [`972:20147`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=972-20147) | 375×1439 mobile | current | Mobile entry-application form for staff: questions and submit. |
| Staff - Entry form 3 | [`6213:36523`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6213-36523) / [`972:20166`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=972-20166) | 375×1439 mobile | current | Mobile entry-application form for staff: questions and submit. |
| Staff H5 Log-in | [`6213:36448`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6213-36448) / [`972:20091`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=972-20091) | 375×872 mobile | current | Mobile staff log-in step reached from the entry link. |
| Staff H5 Log-in 10 | [`6213:36476`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6213-36476) / [`972:20125`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=972-20125) | 375×872 mobile | current | Mobile staff log-in step reached from the entry link. |
| Staff H5 Log-in 11 | [`6213:36487`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6213-36487) / [`972:20136`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=972-20136) | 375×872 mobile | current | Mobile staff log-in step reached from the entry link. |
| Staff H5 Log-in 12 | [`6213:36498`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6213-36498) / [`1084:15693`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=1084-15693) | 375×872 mobile | current | Mobile staff log-in step reached from the entry link. |
| Staff H5 Log-in 7 | [`6213:36455`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6213-36455) / [`972:20101`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=972-20101) | 375×872 mobile | current | Mobile staff log-in step reached from the entry link. |
| Staff H5 Log-in 8 | [`6213:36462`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6213-36462) / [`972:20111`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=972-20111) | 375×872 mobile | current | Mobile staff log-in step reached from the entry link. |
| Staff H5 Log-in 9 | [`6213:36469`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6213-36469) / [`972:20118`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=972-20118) | 375×872 mobile | current | Mobile staff log-in step reached from the entry link. |
| 在厂人员不可填写入场申请 | [`7483:80531`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=7483-80531) / [`7483:80620`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=7483-80620) | 375×812 mobile | current | Mobile message: a person already on the farm cannot submit an entry application. |
| 邀请链接已过期 | [`7264:91899`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=7264-91899) / [`7264:92208`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=7264-92208) | 375×872 mobile | current | Mobile page: the invite link has expired. |
| 链接已过期 ◌ | [`7264:92101`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=7264-92101) / [`7264:92146`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=7264-92146) | 375×812 mobile | current | Mobile page: the invite link has expired. |
| DEPR | [`976:13307`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=976-13307) | 375×812 mobile | **archived**: Frame name DEPR (deprecated). | Frame named DEPR (deprecated). |
| NEW ◌ | [`8748:53159`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=8748-53159) | 375×816 mobile | **unclear**: Frame name NEW does not say whether this is live or a draft. | Frame named NEW: a face-photo step of the guest entry form. |

</details>

<details><summary>Entry and exit requests · 进出厂请求/出入场审批 — 15 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| Add User | [`981:15401`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=981-15401) | 1440×828 web | current | Exit request review, second variant (named 'Add User' in Figma). |
| Add User | [`6213:38058`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6213-38058) / [`981:13905`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=981-13905) | 1440×828 web | current | Entry request review form. |
| Complete | [`6213:38107`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6213-38107) / [`981:13950`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=981-13950) | 1440×1024 web | current | Confirmation 'Request Accepted' with a Back button. |
| Complete | [`6213:38117`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6213-38117) / [`981:13960`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=981-13960) | 1440×1024 web | current | Confirmation 'Request Denied' with a Back button. |
| Complete ◌ | [`982:15075`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=982-15075) | 375×812 mobile | current | Mobile confirmation after a request is accepted or denied. |
| Entrance Request ◌ | [`6213:37961`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6213-37961) | 1440×828 web | current | Entry request form with the person's answers and photo; actions to close, pend or accept. |
| Entry requests | [`6213:37859`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6213-37859) / [`981:13632`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=981-13632) | 1440×838 web | current | Table of all entry requests with type, status and date filters. |
| Entry/Exit Requests | [`6213:37700`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6213-37700) / [`981:13473`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=981-13473) | 1440×946 web | current | Two columns of pending entry and exit requests, with View all links. |
| Entry/Exit Requests ◌ | [`981:13726`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=981-13726) | 375×1362 mobile | current | Mobile list of pending entry and exit requests. |
| Exit Application | [`6213:38006`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6213-38006) / [`982:15231`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=982-15231) | 1440×828 web | current | Exit request form with the person's details; actions to close, pend or accept. |
| Exit Application | [`6213:38030`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6213-38030) / [`981:16300`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=981-16300) | 1440×828 web | current | Exit request form with the person's details; actions to close, pend or accept. |
| Exit Application ◌ | [`982:15663`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=982-15663) | 375×932 mobile | current | Mobile exit request review with accept or pend actions. |
| Exit requests all | [`6213:37910`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6213-37910) / [`981:13679`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=981-13679) | 1440×838 web | current | Table of all exit requests with type, status and date filters. |
| Frame 22883 ◌ | [`981:13873`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=981-13873) | 375×1890 mobile | current | Long mobile review form for an entry request. |
| 查看进厂申请 | [`2282:3585`](https://www.figma.com/design/yUF0zQdpgTlKP9azeFNcL5?node-id=2282-3585) | 1440×700 web | current | Entry-request dialog 进厂申请 over the 进出厂请求 page: basic info (name, phone, email) and entry and expected exit dates, with 取消. |

</details>

<details><summary>Changes dated 2025/02/28 · 2025/02/28 — 18 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| # | [`6985:49690`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6985-49690) | 1080×492 web | **unclear**: Section named 2025/02/28 (a date, not an archive marker); not confirmed. | Unnamed table or list frame (named #). |
| # | [`6985:49818`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6985-49818) | 1080×492 web | **unclear**: Section named 2025/02/28 (a date, not an archive marker); not confirmed. | Unnamed table or list frame (named #). |
| Delete 21 | [`7130:111392`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=7130-111392) | 480×336 unknown | **unclear**: Section named 2025/02/28 (a date, not an archive marker); not confirmed. | Delete-user confirmation: type the person's name to confirm deletion. |
| Delete 22 | [`7130:111411`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=7130-111411) | 480×312 unknown | **unclear**: Section named 2025/02/28 (a date, not an archive marker); not confirmed. | Delete-user confirmation: type the person's name to confirm deletion. |
| Entry/Exit Requests | [`6975:46201`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6975-46201) | 1440×946 web | **unclear**: Section named 2025/02/28 (a date, not an archive marker); not confirmed. | Frame 'Entry/Exit Requests' in the staff section; purpose unclear from the name. |
| Entry/Exit Requests | [`6975:47575`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6975-47575) | 1440×946 web | **unclear**: Section named 2025/02/28 (a date, not an archive marker); not confirmed. | Frame 'Entry/Exit Requests' in the staff section; purpose unclear from the name. |
| Exit farm 6 | [`6980:50424`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6980-50424) | 480×336 unknown | **unclear**: Section named 2025/02/28 (a date, not an archive marker); not confirmed. | Exit-farm dialog step: pick the reason for leaving (leave, non-staff exit, work-required leave, other). |
| Exit farm 7 | [`6980:50443`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6980-50443) | 480×360 unknown | **unclear**: Section named 2025/02/28 (a date, not an archive marker); not confirmed. | Exit-farm dialog step: pick the reason for leaving (leave, non-staff exit, work-required leave, other). |
| Frame 33194 | [`6980:48871`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6980-48871) | 1440×1208 web | **unclear**: Section named 2025/02/28 (a date, not an archive marker); not confirmed. | Unlabelled 1440-wide screen in the 2025/02/28 snapshot. |
| Frame 33195 | [`6980:49498`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6980-49498) | 1440×1208 web | **unclear**: Section named 2025/02/28 (a date, not an archive marker); not confirmed. | Unlabelled 1440-wide screen in the 2025/02/28 snapshot. |
| Guest View | [`6982:51215`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6982-51215) | 1440×1123 web | **unclear**: Section named 2025/02/28 (a date, not an archive marker); not confirmed. | Guest table with search, filters, an Add button and an entrance-link button; rows open a profile. |
| Guest View | [`6982:52825`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6982-52825) | 1440×1123 web | **unclear**: Section named 2025/02/28 (a date, not an archive marker); not confirmed. | Guest table with search, filters, an Add button and an entrance-link button; rows open a profile. |
| Staff H5 Log-in 13 | [`7146:151548`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=7146-151548) | 375×872 mobile | **unclear**: Section named 2025/02/28 (a date, not an archive marker); not confirmed. | Mobile staff log-in step reached from the entrance link. |
| Staff H5 Log-in 14 | [`7146:151653`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=7146-151653) | 375×872 mobile | **unclear**: Section named 2025/02/28 (a date, not an archive marker); not confirmed. | Mobile staff log-in step reached from the entrance link. |
| Staff view | [`6982:50467`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6982-50467) | 1440×1123 web | **unclear**: Section named 2025/02/28 (a date, not an archive marker); not confirmed. | Staff table with search, filters, an Add button and an entrance-link button; rows open a profile. |
| Staff view | [`6982:52144`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=6982-52144) | 1440×1123 web | **unclear**: Section named 2025/02/28 (a date, not an archive marker); not confirmed. | Staff table with search, filters, an Add button and an entrance-link button; rows open a profile. |
| 详情 | [`7037:150482`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=7037-150482) | 1440×1540 web | **unclear**: Section named 2025/02/28 (a date, not an archive marker); not confirmed. | Detail page for one person (dated snapshot). |
| 详情 | [`7037:151279`](https://www.figma.com/design/4zA7Ug5vWGqqvdKuU0uNcM?node-id=7037-151279) | 1440×1540 web | **unclear**: Section named 2025/02/28 (a date, not an archive marker); not confirmed. | Detail page for one person (dated snapshot). |

</details>

## Settings · 设置

28 screens (20 current, 4 draft, 2 reference, 2 unclear). Grouped by: Sidebar 设置 › 场区布局, 所有监控, 栏位类型, 药品管理, 设备管理.

| Feature | Screens | Current | Platform | File | Entry node |
|---|---|---|---|---|---|
| Site layout · 场区布局 | 14 | 10 | web | 🖥️ Console 初始化, 🖥 场区布局 | [`374:3158`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=374-3158) |
| Device management: door access · 设备管理-门禁 | 10 | 10 | web | 🖥📱 物资消杀 | [`10542:19093`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=10542-19093) |
| Medicine management · 药品管理（还要改） | 4 | 0 | web | 🖥 📱 免疫 | [`11024:4223`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11024-4223) |

<details><summary>Site layout · 场区布局 — 14 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 场区布局-区 ◌ | [`348:18058`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=348-18058) | 1440×912 web | current | Zone (区) selected: annotation says every monitor type under it has count at least 1 (376:4185). |
| 场区布局-区 ◌ | [`348:18288`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=348-18288) | 1440×912 web | current | Zone selected with all monitor counts at zero (annotation 379:3000). |
| 场区布局-区块 ◌ | [`348:17251`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=348-17251) | 1440×1012 web | current | Block (区块) selected that has units: monitor counts at least 1 (annotation 379:3001). |
| 场区布局-区块 ◌ | [`350:3000`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=350-3000) | 1440×912 web | current | Block selected with no units: all monitor counts zero (annotation 379:3002). |
| 场区布局-单元 ◌ | [`267:2506`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=267-2506) | 1440×912 web | current | Unit (单元) selected that has slots: slot map shows per-row counts; above 4 rows it shows 展开全部 (expand all) with endless scroll, and a fullscreen action (annotation 380:3149). |
| 场区布局-单元 ◌ | [`348:16539`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=348-16539) | 1440×912 web | current | Unit with slots but pig count 0: per-row counts are hidden in the slot map (annotation 380:3150). |
| 场区布局-单元 ◌ | [`348:16967`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=348-16967) | 1440×912 web | current | Unit with no slots: all counts zero and the fullscreen button is disabled (annotation 380:3151). |
| 场区布局-空状态 ◌ | [`358:2673`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=358-2673) | 1440×900 web | current | Farm layout page with no zones yet: empty content area under the page title, left 场区结构 panel visible. |
| 场区布局-默认态 ◌ | [`374:3158`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=374-3158) | 1440×912 web | current | Farm layout page default: left 场区结构 panel at fixed width, nothing auto-selected (annotation 376:4183), content under the page title. |
| 栏位地图-全屏 ◌ | [`384:3152`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=384-3152) | 1440×912 web | current | Full-screen slot map drawer for a unit: title and map content. |
| 点击热区 ◌ | [`384:3692`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=384-3692) | 365×202 unknown | **reference**: section 初始化 (12:3550) on live page 🟢 UI设计稿; no archive/draft markers in names or XML; spec legend frame with hotspot samples and annotation  | Legend for tap hotspots on the farm layout page: red marks a position hotspot (tap to select), green marks a feature hotspot (tap to use the feature) (annotation 384:3716). |
| 选项状态 ◌ | [`384:3656`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=384-3656) | 365×904 unknown | **reference**: section 初始化 (12:3550) on live page 🟢 UI设计稿; no archive/draft markers in names or XML; spec specimen frame with 区 / 区块 / 组 / 单元 rows; not vie | Specimen of tree-row option states for 区, 区块 and 单元 in the structure panel (expand arrow, nested rows). |
| 场区布局 | [`10542:19093`](https://www.figma.com/design/1UFIgtR4SLQQ3t4Qlgx572?node-id=10542-19093) | 1440×900 web | **unclear**: Empty shell. Same node id as 设备管理列表 in 物资消杀, so this file is a renamed copy of that one with the content removed. | Settings > 场区布局 list page: left nav shows 5 Settings items (场区布局 selected, 所有监控, 栏位类型, 药品管理, 设备管理); content area is empty under title 场区布局 with breadcrumb 首页 / 场区布局. |
| 场区布局 | [`13002:2117`](https://www.figma.com/design/1UFIgtR4SLQQ3t4Qlgx572?node-id=13002-2117) | 1440×900 web | **unclear**: Empty shell. Same node id as 门禁设备列表 in 物资消杀; the breadcrumb still ends in 门禁列表. | Settings > 场区布局 sub-page with a back arrow beside the title 场区布局; left nav shows 3 Settings items (场区布局 selected, 药品管理, 设备管理); content area is empty. Breadcrumb reads 首页 / 场区布局 / 门禁列表. |

</details>

<details><summary>Device management: door access · 设备管理-门禁 — 10 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 删除-二次确认 | [`13051:3713`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13051-3713) / [`13317:2242`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13317-2242) | 480×232 web | current | Confirm dialog to delete a device (identified by position; text not readable at section scale). |
| 添加门禁 | [`13318:4056`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13318-4056) | 480×576 web | current | Add-access-device modal with connection instructions and a device illustration. |
| 添加门禁（已上传文件） | [`13317:1966`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13317-1966) | 640×518 web | current | Add-access-device modal after a file is uploaded. |
| 添加门禁（已上传文件） | [`13317:2004`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13317-2004) | 640×518 web | current | Add-access-device modal after a file is uploaded (second frame with the same name). |
| 添加门禁（默认态） | [`13317:1952`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13317-1952) | 640×534 web | current | Add-access-device modal, default state (English). |
| 获取密码-失败 | [`13317:1941`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13317-1941) | 480×454 web | current | Get-password failure modal. |
| 获取密码（在线） | [`13044:2164`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13044-2164) / [`13317:1924`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13317-1924) | 480×468 web | current | Online device: modal showing a QR code and a numeric password. |
| 获取密码（掉线） | [`13093:2610`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13093-2610) | 480×408 web | current | Offline device: modal with a QR code and offline-password guidance. |
| 设备管理列表 | [`10542:19093`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=10542-19093) / [`13317:1573`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13317-1573) | 1440×900 web | current | Device management landing: device-type cards for door access, each with status tags. |
| 门禁设备列表 | [`13002:2117`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13002-2117) / [`13317:1812`](https://www.figma.com/design/fVWq5EfZKLL7x8tnE9UR1E?node-id=13317-1812) | 1440×900 web | current | Access-control device table with search and an add button. |

</details>

<details><summary>Medicine management · 药品管理（还要改） — 4 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 列表空状态 ◌ | [`11024:4145`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11024-4145) | 1440×900 web | **draft**: Group label 药品管理（还要改，改成入库出库）: still to be changed into stock in/out. | Empty state of the medicine management list. |
| 删除药品 ◌ | [`11076:9170`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11076-9170) | 1440×900 web | **draft**: Group label 药品管理（还要改，改成入库出库）: still to be changed. | Delete-medicine confirmation. |
| 添加药品 ◌ | [`11024:7930`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11024-7930) | 2800×1386 web | **draft**: Group label 药品管理（还要改，改成入库出库）: still to be changed. | Add-medicine dialog/flow. |
| 疫苗管理 ◌ | [`11024:4223`](https://www.figma.com/design/8BkIL2azMuBS2w6Vn26Cac?node-id=11024-4223) | 1440×900 web | **draft**: Group label 药品管理（还要改，改成入库出库）: still to be changed. | Vaccine management page in the medicine group. |

</details>

## Console setup · 初始化

36 screens (31 current, 4 reference, 1 unclear). Grouped by: File 🖥️ Console 初始化.

| Feature | Screens | Current | Platform | File | Entry node |
|---|---|---|---|---|---|
| Setup checklist · 初始化页面 | 4 | 4 | web | 🖥️ Console 初始化 | [`33:286`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=33-286) |
| Create site layout · 创建场区布局 | 16 | 12 | web | 🖥️ Console 初始化 | [`384:4081`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=384-4081) |
| Create production line · 创建生产线 | 6 | 6 | web | 🖥️ Console 初始化 | [`39:3685`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=39-3685) |
| Add pigs · 添加猪只 | 2 | 1 | web | 🖥️ Console 初始化 | [`53:349`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=53-349) |
| Add staff · 添加员工 | 8 | 8 | web | 🖥️ Console 初始化 | [`53:512`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=53-512) |

<details><summary>Setup checklist · 初始化页面 — 4 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 已完成全部 | [`53:576`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=53-576) | 1440×1082 web | current | Setup checklist with all four tasks done: every row shows 查看 and the 进入 Sentri button turns green and active. |
| 已完成第一个 | [`27:2039`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=27-2039) | 1440×1082 web | current | Setup checklist after the first task: create farm layout shows a check and 查看 (view); the other three rows still show 去创建 / 去添加 buttons. |
| 查看-进入系统 ◌ | [`114:2786`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=114-2786) | 1440×900 web | current | Sentri home reached from the checklist once all four tasks are done; the left menu has no 返回初始化 (back to setup) entry, per annotation 384:4136. |
| 默认态 | [`33:286`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=33-286) | 1440×1070 web | current | Setup checklist for a new farm: create farm layout (marked required), create production line, add pigs and add staff, each with a go button; the enter-Sentri button is grey until all four are done. |

</details>

<details><summary>Create site layout · 创建场区布局 — 16 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 一条场区结构创建成功-默认态 ◌ | [`442:4936`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=442-4936) | 1440×972 web | current | Wizard result after the first complete zone structure (区-区块-单元-栏位) is created: a success alert 一条场区结构创建成功 sits above the content and stays from then on (annotation 419:25321). |
| 创建指南 ◌ | [`421:25323`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=421-25323) | 1440×900 web | current | Creation-guide dialog (640 px) over a dimmed page with title, content and action row, opened from the wizard's 创建指南 button. |
| 场区结构映射示例 ◌ | [`384:4081`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=384-4081) | 1440×2601 web | current | Explainer page on how a farm's 区, 区块, 单元 and 栏位 nest, with one clickable button at the bottom to create the farm layout; everything else is view-only (annotation 394:3426). |
| 添加区 ◌ | [`374:3069`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=374-3069) | 1440×900 web | current | Illustration of the add-zone form (480 px overlay image) on a dimmed live page; annotation says the zone code auto-increments and is not shown to the user. |
| 添加区块 ◌ | [`374:3382`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=374-3382) | 1440×900 web | current | Illustration of the add-block form (480 px overlay image) on a dimmed live page; note says add/edit logic is unchanged. |
| 添加单元 ◌ | [`400:3344`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=400-3344) | 1440×900 web | current | Illustration of the add-unit step as a full-width image; annotation says two steps are merged into one. |
| 添加栏位 ◌ | [`400:4763`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=400-4763) | 1440×900 web | current | Illustration of the add-slot step with an action button at the bottom; annotation asks the frontend to set that button's colour. |
| 离开此页面 ◌ | [`400:3422`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=400-3422) | 480×256 web | current | Leave-page confirmation dialog (480 px) inside the farm-layout wizard, with title, body text and action buttons. |
| 第一步 | [`39:2686`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=39-2686) | 1440×900 web | current | Create-layout wizard step 1 (添加区, add zone): stepper 1/2/3, empty zone panel with a highlighted 添加区 button and a 稍后创建，返回首页 (create later, back to home) link, over a dimmed live page. |
| 第三步 ◌ | [`442:4815`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=442-4815) | 1440×900 web | current | Create-layout wizard step 3 (添加单元与栏位, add unit and slot): stepper at step 3 with a highlighted add button over a dimmed overlay. |
| 第二步 ◌ | [`374:2989`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=374-2989) | 1440×900 web | current | Create-layout wizard step 2 (添加区块, add block): stepper at step 2 with a highlighted add button over a dimmed overlay. |
| 配置栏位类型 ◌ | [`400:4767`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=400-4767) | 1440×900 web | current | Illustration of the slot-type configuration step; note says add/edit logic is unchanged. |
| 创建指南源文件 ◌ | [`415:24875`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=415-24875) | 1080×1090 web | **reference**: section 初始化 (12:3550) on live page 🟢 UI设计稿; no archive/draft markers in names or XML; name ends 源文件 and content is a ▼ Step flow diagram (ju | Flow source for the creation guide: three stacked blocks (Step 1, Step 2, Step 3) laid out as a diagram. |
| 第一步源文件 ◌ | [`442:4088`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=442-4088) | 1440×900 web | **reference**: section 初始化 (12:3550) on live page 🟢 UI设计稿; no archive/draft markers in names or XML; name ends 源文件 (source file) and the frame has no 遮罩 la | Clean source frame of step 1 without the dimming mask or highlights. |
| 第三步源文件 ◌ | [`442:4700`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=442-4700) | 1440×1024 web | **reference**: section 初始化 (12:3550) on live page 🟢 UI设计稿; no archive/draft markers in names or XML; name ends 源文件 and no 遮罩 layer (judgement) | Clean source frame of step 3 without mask or highlights. |
| 第二步源文件 ◌ | [`442:4347`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=442-4347) | 1440×1024 web | **reference**: section 初始化 (12:3550) on live page 🟢 UI设计稿; no archive/draft markers in names or XML; name ends 源文件 and no 遮罩 layer (judgement) | Clean source frame of step 2 without mask or highlights. |

</details>

<details><summary>Create production line · 创建生产线 — 6 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| KPI 详情 ◌ | [`83:3969`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=83-3969) | 1440×900 web | current | KPI detail dialog (800 px) over a background image; its inner frame is named 跳过批次 (skip batch), so it may be a skip-batch confirmation (unverified). |
| 创建任务 KPI 模版 ◌ | [`60:13365`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=60-13365) | 1440×2048 web | current | Create KPI task template page: long form (2048 px) with title, body and bottom action row. |
| 创建模板 ◌ | [`83:3082`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=83-3082) | 480×410 web | current | Create-template dialog (480 px) with a name text field, a multi-line textarea and dialog actions. |
| 创建生产线（编辑态） ◌ | [`60:4620`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=60-4620) | 1440×1140 web | current | Same page in edit state; the body is taller (1140 px frame against 1000 px for the default). |
| 创建生产线（默认态） ◌ | [`39:3685`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=39-3685) | 1440×1000 web | current | Create-production-line page in default state: page title, form body and a bottom action row. |
| 选择模版 ◌ | [`60:13260`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=60-13260) | 1440×900 web | current | Template picker drawer (1200 px wide) over a dimmed page, with title and content area, for choosing a template. |

</details>

<details><summary>Add pigs · 添加猪只 — 2 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 添加猪只（默认态） ◌ | [`53:349`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=53-349) | 1440×900 web | current | Add-pigs step, default state: page title, one card and a bottom button; annotation says later flow pages are not drawn and that finishing returns to the setup home to refresh the checklist. |
| image 42 ◌ | [`400:3163`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=400-3163) | 1440×1082 web | **unclear**: section 初始化, 添加猪只 group; node is a rounded-rectangle with image fill named 'image 42'; the overview suggests a setup-home style page but thi | Pasted raster image (a rounded rectangle, not a frame) of a 1440x1082 page placed beside the add-pigs step; not opened, so its content is unverified. |

</details>

<details><summary>Add staff · 添加员工 — 8 screens</summary>

| Screen | Node (CN / EN) | Size | Status | What it shows |
|---|---|---|---|---|
| 上传文件（已上传） ◌ | [`400:11653`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=400-11653) | 1440×900 web | current | Upload step after a file is uploaded; the content area is taller (264 px against 226 px). |
| 上传文件（未上传） ◌ | [`400:11593`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=400-11593) | 1440×900 web | current | Staff upload step with no file uploaded yet: stepper, upload area and bottom button. |
| 添加员工（查看态） ◌ | [`98:23261`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=98-23261) | 1440×900 web | current | Add-staff page in view state: a read-only list with an alert and one button; annotation 432:3390 says the table-header copy button beside it copies all staff registration addresses. |
| 添加员工（编辑态） ◌ | [`60:6125`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=60-6125) | 1440×900 web | current | Add-staff page in edit state with a taller card (462 px) for entering staff details; same user-management overlap question as the default state. |
| 添加员工（默认态） ◌ | [`53:512`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=53-512) | 1440×900 web | current | Add-staff page in default state: page title, one card and a bottom button. Staff records may overlap Sentri Console user management (not checked against that file). |
| 确认信息（无错误数据） ◌ | [`400:11901`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=400-11901) | 1440×900 web | current | Confirm-info step with no error rows: short content area and bottom button. |
| 确认信息（有错误数据） ◌ | [`400:11715`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=400-11715) | 1440×900 web | current | Confirm-info step when the uploaded data has errors: taller list area (498 px) for the rows with errors. |
| 离开此页面 ◌ | [`411:13535`](https://www.figma.com/design/hRZQbmxWMPSBZYCDkvm5dY?node-id=411-13535) | 480×256 web | current | Leave-page confirmation dialog (480 px) during the staff upload flow; same structure as the farm-layout leave dialog. |

</details>

## Archived, by evidence

- 🖥️ 工作台 · the whole 🗑️ 废稿 page (`203:4256`): 31 frames, listed under Workbench › Discarded drafts.
- 🖥️ 猪舍、猪只 · `283:4588` 废弃: frame named 废弃 inside live section 猪舍（CN） 62:4756; the screenshot shows an archived copy of this dialog
- 🖥️ 猪舍、猪只 · `283:4470` 废弃: frame named 废弃 inside live section 猪舍（CN） 62:4756; the screenshot shows an archived copy of this dialog
- 🖥 📱 免疫 · `11128:9844` 废弃: Frame named 废弃 (discarded), sitting in the live section.
- 🖥 📱 免疫 · `11139:10710` 废弃: Frame named 废弃 (discarded); the radio options repeat under 自定义接种频率.
- 🖥 📱 免疫 · `11017:2647` 列表空状态: Group label 疫苗任务列表（这些页面没了）: these pages are gone.
- 🖥 📱 免疫 · `11019:2803` 疫苗任务列表：已完成: Group label 疫苗任务列表（这些页面没了）: these pages are gone.
- 🖥 📱 免疫 · `11017:2699` 疫苗任务列表：未开始: Group label 疫苗任务列表（这些页面没了）: these pages are gone.
- 🖥 📱 免疫 · `11019:2122` 疫苗任务列表：进行中: Group label 疫苗任务列表（这些页面没了）: these pages are gone.
- 🖥 📱 免疫 · `11067:5850` 任务详情页（Grid）: Canvas text 不要grid视图 (no grid view) sits directly above this frame; mobile list view (11056:5538) is kept instead.
- 🖥 📱 免疫 · `11067:6634` 本间完成——二次确认: Canvas text 这页面也没了 (this page is gone too) sits directly above this frame.
- 🖥 📱 免疫 · `11067:6234` 栏位猪只列表: Canvas text 这页面也没了 (this page is gone too) sits directly above this frame.
- 🖥 采样与检测 · `6001:5864` 改之前: Frame named 改之前 ('before the change') sits in a live section, beside the revised detail frames. Superseded before-state; no EN counterpart.
- 🖥📱 物资消杀 · `13431:3477` 废弃: layer name is exactly 废弃, inside live section 物资消杀（App）（EN）; screenshot checked
- 🖥📱 物资消杀 · `13431:4378` （废弃）开门-获取离线密码（无二维码）: Layer name starts with （废弃）. Its EN twin 13431:3253 has no marker but renders identically, so both are archived.
- Sentri Console（Done） · `5980:40457` 此页面取消了: Frame name 此页面取消了 (this page was cancelled), inside Staff - CN.
- Sentri Console（Done） · `5980:40735` 此页面被user access 里面的页面替代: Frame name 此页面被user access 里面的页面替代 (replaced by the page in user access), inside Staff - CN.
- Sentri Console（Done） · `8445:114966` 废弃: Frame name 废弃 (deprecated) inside Access Control - CN.
- Sentri Console（Done） · `976:13307` DEPR: Frame name DEPR (deprecated).

## Open questions

- **Console 2025/02/28 section.** Its node ids (6975–7146) are newer than the live Staff/Guest/Access sections, so it is probably a later round of changes, not an old snapshot. Status left unclear until the owner says which wins.
- **Two access-control flows in Console.** User Access Control (EN only, grant access by test result or executive approval, L1–L4) and Access Control CN/EN (permission types + edit permission dialogs). Staff CN has '此页面被user access 里面的页面替代', so one replaced the other; which one is current is not marked.
- **Vaccination calendar at 1440 and 1920.** Two widths of the same page (12012:10234, 11748:13312); keep both or pick one.
- **历史疫苗任务** (11878:21483) has 历史 in its name but reads as a live 'history' page, not an archived one.
- **Empty [Web] files** (库存管理, 生产线, 项目索引, 饲喂计划) were created 2026/08/14 with only a cover; if their designs live elsewhere, link them.

## How this was made

Nine Haiku agents indexed one file each from Figma's node tree and section renders (`get_metadata`, `get_screenshot`). The orchestrator merged CN/EN twins, regrouped by the web sidebar, checked the doubtful calls against renders and fixed four wrong duplicate/status calls. Per-file indexer problems:

- 🖥️ 工作台: Figma MCP tool-call limit reached on the Full seat after about 14 get_screenshot calls (the next call, 3402:10175 查情, was refused). Most drawers are status- and name-based, not screenshot-checked (screenshot_checked=false).
- 🖥️ 工作台: get_metadata for 203:4256 exceeded the tool output limit; the saved output was copied from the tool-results file to $S/figma/workbench-203-4256.json (tree at .tree.txt). Page 175:3953 was not refetched.
- 🖥️ 工作台: Section 工作台 (388:4996) is 36973x12000, too large for one screenshot; screenshots were taken per frame and the rest was classified from tree names and sizes.
- 🖥️ 工作台: Ambiguous names: '1' (3598:11687), numbered trash screens '1'-'6', 'Frame 33334' (4017:11509), and many [card]/组/Group N snippets. 3598:11687 was judged a populated home variant from its screenshot.
- 🖥️ 猪舍、猪只: Figma MCP tool-call limit reached (Professional Full seat) after about 13 successful get_screenshot calls. The remaining calls failed, so items with screenshot_checked false are classified from names and location only.
- 🖥️ 猪舍、猪只: Not screenshotted: 1237:12249, 1264:6530, 1264:13003, 1257:5180, 1259:4832, 1259:4855, 1259:4893, 1264:28348, 1359:9198, 1359:9229, the loading states 1908:7936, 1491:5919, 1899:7791, 1899:7900, the log 159:7004, and most EN items.
- 🖥️ 猪舍、猪只: A 备注 (remarks textarea) dialog was seen in a screenshot, but I could not map it to a node id. It is one of the unscreenshotted 弹窗 items above.
- 🖥️ 猪舍、猪只: Loading rules conflict: 1911:7206 says the bar holds at 99% after 15 s, and 1911:7207 says 30 s. Both are on the same page, so the spec is unclear.
- 🖥 📱 免疫: Page XML (843k chars) was saved to a tool-results file and copied to scratch; no rate limits hit.
- 🖥 📱 免疫: Child x/y coordinates in the metadata do not match section sizes, so screen-to-group mapping was done against the section screenshot and layout order. Group membership is approximate for a few items (高级筛选, 任务日历, 弹窗, 疫苗任务设置).
- 🖥 📱 免疫: Mobile group labels (模块标题 frames) carry no text in metadata; names were read from the mobile section screenshot.
- 🖥 📱 免疫: Loose canvas frames (结束任务 x2, 移出接种列表, 任务详情页（Grid）, 栏位猪只列表, 本间完成——二次确认) sit above the mobile section with no section wrapper; status comes from nearby canvas text notes, or is unclear.
- 🖥 采样与检测: get_metadata on page 0:1 exceeded the tool output limit (about 417 KB). The saved dump was copied to scratchpad/figma/sampling-testing-0-1.json and parsed from there with tree.py (depth 2 and 3).
- 🖥 采样与检测: The page has no 🟢 or 🗑️ marker and no archive keyword, so every section is marked current except the one 改之前 frame. The 2025.2.28 tabbed list (采样-CN) and the 2025.4.16 single-table pending-test list both carry no marker. Which supersedes which is unclear from the file; the orchestrator should decide.
- 🖥 采样与检测: Small frames (sort-state cells, sample-type chip sheets, delete dialogs, snackbars, 模块标题 headers) were judged from section-overview renders and one or two frame renders, not each one individually. screenshot_checked is true where the frame appeared legibly in an overview or frame render.
- 🖥 采样与检测: Red annotation text on the entry-point image (node 6087:16721, 'image 2') is only partly legible at overview scale. Its wording is not quoted here.
- 🖥📱 物资消杀: get_metadata for the page returned 307,930 characters and was saved to a tool-results file; copied to scratchpad/figma/supplies-disinfection-10265-24908.json. The depth-2 tree is at ...tree.txt. No rate limits.
- 🖥📱 物资消杀: Section-level screenshots were taken at 1400px (console) and 1600px (app). The app sections are 20000px wide, so the 750x1624 screens render as thumbnails with no readable text. Names, sizes and status for the App screens come from Figma layer names, not from reading the screens; only 13318:4158, 13431:3477 and the 工具箱/废弃 frames were viewed closely.
- 🖥📱 物资消杀: Console dialog 13051:3713 is labelled 删除-二次确认 with no visible text; it is identified as a device delete by its position (x 5040, near 设备管理 column) and by its EN twin 13317:2242 'Delete Device', which was readable.
- 🖥📱 物资消杀: 13431:4536 and 13431:3411 are named 弹窗 with no further label; kind is modal by convention, content is unknown.
- Sentri Console（Done）: Figma MCP tool-call limit hit after 12 get_screenshot calls (budget was ~60). Visually checked at section-thumbnail scale only: Read me, Staff EN, Staff CN, Guest EN, Log-in EN, H5, User Access Control EN, Access Control EN, Access Control CN, 2025/02/28, 出入场审批 EN, 员工-入场申请 EN. Not viewed: Guest CN, Log-in CN, 员工-入场申请 CN, 非员工-入场申请 EN/CN, 出入场审批 CN, 审批H5. For those and for most per-frame what_en text, the description is inferred from frame name, size and section context, so treat what_en as provisional. screenshot_checked=true means the section thumbnail was viewed, not that each frame was read.
- Sentri Console（Done）: Frames are from the full page XML (1.3 MB dump). Items are frames at least 300 px wide and 150 px tall; smaller frames (Job/Card, Frame 33177, Frame 33196, etc.), Menu instances, vectors and text were counted in non_screen_counts and not listed. Exception: the 废弃 frame 8445:114966 (252x252) was added by hand.
- Sentri Console（Done）: The top-level text node 3731:49433 is a Notion link to the 'Console' doc, not a section; it is not indexed.
- Sentri Console（Done）: EN/CN mirror pairs are matched by normalised frame name in order (k-th occurrence), so possible_duplicate_of for mirrors is approximate. 2025/02/28 items are matched to live items by exact name and size.
- 🖥 用户厂区权限: Figma MCP tool-call limit was hit after about 8 metadata and screenshot calls. The EN section (2033:14326) and EN items were not screenshotted; their status comes from names and structure only. The CN items were checked against the section overview screenshot, and some details at full size.
- 🖥 用户厂区权限: The page XML (153 KB) exceeded the inline limit and was saved to a file. It was copied to scratchpad figma/user-permissions-0-1.json and parsed locally.
- 🖥 用户厂区权限: Dialog body copy is not in the XML (text layers are named 'text'). what_en for dialogs is built from frame names, the section overview, and the few full-size shots. Body text for 2303:3742 and most 检测报告 / 特殊批准 dialogs was not read.
- 🖥 用户厂区权限: Frame 2013:2154 (and EN 2112:9828) are named 厂区权限详情 but display the edit form 编辑用户厂区权限. The name is misleading.
- 🖥️ Console 初始化: Figma MCP tool-call quota ('Full seat' on the Professional plan) was hit mid-run. Five get_screenshot calls succeeded (section overview, 33:286, 27:2039, 53:576, 39:2686); later calls failed (114:2786, 374:2989, 442:4815). The quota is a plan limit, not a rate limit, so I did not retry in a loop.
- 🖥️ Console 初始化: Items with screenshot_checked false were indexed from the XML (names, sizes, child frame names), the 2400px section overview, and the 14 annotation texts. Their what_en is inferred from that and should be checked when screenshots are available.
- 🖥️ Console 初始化: 400:3163 'image 42' is a raster rounded-rectangle, not a frame, and was never opened; status is unclear. The overview suggests a setup-home style page, which may duplicate 27:2039 or 53:576. Not verified.
- 🖥️ Console 初始化: The prototype arrow 'Button --> 创建厂区布局-说明页' matches no frame name. 384:4081 场区结构映射示例 is the inferred target from arrow geometry and annotation 394:3426.
- 🖥 场区布局: Page 10265:24908 is small enough to be returned inline, so no file dump was needed. Only one section exists, so no tree.py run was needed.
- 🖥 场区布局: Both screens have empty content areas (placeholders). Nothing to read beyond the title, breadcrumb and left nav.
- 🖥 场区布局: Breadcrumb on 13002:2117 ends in 门禁列表, which looks like a copy-paste leftover from another feature. Flagged, not changed.
- 🖥 场区布局: No 物资消杀 / supplies-disinfection screens found on this page, despite the shared page id. The duplicate noted in the brief is not visible here.
