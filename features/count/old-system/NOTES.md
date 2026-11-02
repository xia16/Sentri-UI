# Old system: count, transfer, exit, missing, no-ID pigs

What the old (production) app did, frame by frame. Read-only research, 2026-11-02. This covers
production only, not the repo's redesigns.

Files (link: `https://www.figma.com/design/<key>?node-id=<id with - for :>`):

| Short name | File | Key |
|---|---|---|
| INSP | 巡检 Inspection (mobile) | `4GZGPBauEOWQQjnRrzoUgF`, section `60:408` |
| TASK | 生产任务 Production tasks (mobile) | `psrxDa9LRWLdTL9XMZmWdc` |
| WB | Web workbench (工作台) | `MufYKeR3oCVDyppB3FmlNV` |
| BARN | Web 猪舍、猪只 (barn and pig pages) | `qSEc0RElNQUMWYkX30jVgr` |

Secondary sources (prior repo transcriptions of the same frames): `ux/research/inspection/part-a.md`
(calibration, row selection), `part-e.md` (transfer, missing, fostering),
`ux/research/checkin/pen-count.md`, `ux/research/ops/place-identity.md`,
`ux/research/tasks/piglet-processing.html` (litter count confirm).

Screenshots in this folder (12):

| File | Frame |
|---|---|
| `insp-calibration-step1-224-1545.png` | INSP `224:1545` Step1, confirm identified pigs |
| `insp-calibration-step2-blocked-1797-1721.png` | INSP `1797:1721` Step2, under-allocated, Submit blocked |
| `insp-noid-row-selection-907-3431.png` | INSP `907:3431` row-selection spec (No ID quantity editor) |
| `insp-transfer-with-noid-health-749-4264.png` | INSP `749:4264` transfer confirm page, path B (has no-ID pigs) |
| `insp-report-missing-300-1048.png` | INSP `300:1048` report-missing dialog (bulk) |
| `task-transfer-single-more-actions-7561-12168.png` | TASK `7561:12168` 更多操作 sheet with 转移 |
| `task-transfer-single-pick-unit-7561-12284.png` | TASK `7561:12284` 选择位置 tree (区 › 车间 › 舍) |
| `task-transfer-single-pick-pen-7561-12254.png` | TASK `7561:12254` 选择位置 wheels (单元 × 栏位) |
| `web-workbench-transfer-drawer-3421-7768.png` | WB `3421:7768` 转舍 progress drawer |
| `web-herd-overview-stock-change-3390-6566.png` | WB `3390:6566` 猪群存栏变动 chart, 流入/流出 filter |
| `web-end-finishing-drawer-3421-7344.png` | WB `3421:7344` 结束育肥检查 drawer |
| `web-not-on-site-pigs-1264-13852.png` | BARN `1264:13852` 不在场猪只 table (exit reasons) |

---

## 1 · Count / calibration (猪只数量校准). There is no 盘点 or 存栏 entry screen.

The only head-count edit in the mobile app is a per-pen calibration wizard in Inspection
(module title `221:3461` 修改猪只数量). No other file has a count, stocktake or 存栏 entry
screen. 存栏 appears only as a display: workshop home `存栏 99,999 头`, unit header `共 200 头`,
grid cards `共 2 头`, web block page `65:5401`, herd-overview cards `3390:6566`.

**Entry.** A small unlabelled green pencil-on-dots icon next to `猪只列表（N）` on the pen card
(`60:523`, `640:1909`, `907:3431`). This is the only way in.

**Step 1 — 确认有身份猪只 (confirm identified pigs)** `224:1545` / `224:1618`
- Title `A1：猪只数量校准`; step bar `1 确认有身份猪只 — 2 确认栏位总数`.
- `当前系统记录`: a read-only list of the pigs the system thinks are in the pen. Each row has a `?`
  pin, which opens report missing (`509:1702`, one pig, with a confirm dialog).
- `扫描添加` / `手动添加` add a pig found in this pen. Manual add (`566:2426` / `566:2854` /
  `566:2788`) uses exact search only, single-select radio. The result shows where the system thinks
  the pig is now (`A1 · 1区 - 母猪车间 - 1舍`). Added pigs show in a `新添加` section with an ✕ undo.
- `下一步`.

**Step 2 — 确认栏位总数 (confirm pen total)** `1796:1675` default · `1797:1721` / `1799:1985`
blocked · `224:1486` submittable
- One stepper, `记录栏位猪只总数`, prefilled with T₀ = new identified + system identified + system
  un-identified (`658:3316`). So Step 2 opens already balanced.
- `+` adds un-identified head, `−` removes them. Floor: the total cannot go below the identified
  count (`658:3316`).
- `更改前` and `更改后` cards break the total into 有身份 / 无身份 and, under 无身份, rows of
  `生产线 N - 批次 M  n 头`, each with a stepper and a red trash icon. Deleting a batch row needs no
  confirm (`907:4986`).
- `+ 添加批次` opens the line picker (`559:1802`, wheel) and then the batch multi-select
  (`559:1824`).
- **Invariant:** Submit works only when Σ(batch rows) = un-identified count exactly. Banners:
  `↓ 10 头需补充批次信息` (short) · `↓ 10 头需删除，或调整栏位总数` (over) ·
  `✓ 无身份猪只已全部补充批次`.
- On submit, a confirm dialog `570:1729`: `A1栏位猪只数量从22头更新至25头，请确认。` Then a toast
  `566:3375` 操作成功.

**Fields asked:** found pigs (scan or exact ID), missing pigs (tap `?`), one pen total, and
(line, batch, head count) for every un-identified head. **No reason, no date, no note.**
**Steps:** 2 wizard pages, plus up to 3 sub-screens (manual add, line, batch) and 2 dialogs
(missing, quantity update), plus a toast. About 14 frames for one number.

**Other count reconciliations in the old system** (same idea, different place):
- Piglet processing, TASK `1135:7641` / `971:15991` / `971:16140` 仔猪数量确认: reported vs system.
  Under-report auto-removes piglets (`将自动移除 2 头仔猪`), over-report auto-adds them. Needs a
  reason textarea and a `确认无误，继续提交` checkbox. `1159:6421` 补录仔猪 (from 数量异常
  `1567:20878`) updates the system count with a `确认更新系统记录数量` checkbox.
- Fostering result `473:4962` / `473:4897`: `10 头 → 8 头` / `10 头 → 12 头`. Then it tells the
  worker `请在寄养后同步转出与接收栏位的任务进度`, so the pen numbers are synced by hand.

**What is complex about it**
- A two-step wizard with a blocking balance check (`B = U` exactly) guarding one number.
- Batch allocation of anonymous head is the real payload. It is split by production line, then
  batch, with a two-picker add.
- Identified and un-identified pigs are different kinds of thing: pigs vs a count per (line,
  batch). The total stepper only moves the un-identified part.
- The floor rule (total ≥ identified) means that to lower the count below the named pigs, you
  must first report each named pig missing in Step 1.
- Under and over are treated the same (stepper). There is no reason for the delta. Piglet
  processing does the opposite: a forced reason, plus auto-add or auto-remove.
- Nothing finds a wrong count. The entry is a hidden glyph. There is no expected-vs-counted
  number, no last-counted stamp and no count task. It is 100% farmer-initiated.
- The confirm dialog only repeats what was typed (old → new).

---

## 2 · Transfer (转移 / 转舍)

### 2a · Inspection 记录 › 转移, one or many pigs (INSP)
- Entry: select pigs on the pen list, then bottom bar `记录`, then drawer `853:2173` / `854:2488`,
  then tile 转移. Rule `654:2366`: `转移、寄养、上报失踪：可作用于 单头猪或多头猪`.
- `749:5903` 选择位置: a 区 › 车间 › 舍 tree with header `已选 10 头猪 ›`. The pen picker
  `128:1082` opens on its own (rule `749:5975`: by default you transfer to **another pen in the
  current 区-车间-单元**). It has a read-only path card (`1740:1713` `只是展示 不能操作`) and two
  wheels, 单元 × 栏位. 确认 is disabled until both are picked.
- **The flow splits on identity** (labels `749:5401` / `749:5402`):
  - **All identified:** dialog `296:1133` `确认将 12 头猪只转移至 1区 - 后备车间 - 1舍 - A1 吗?`,
    then toast `749:6023`.
  - **Includes no-ID pigs:** full page `612:2414` / `749:4264`. Card `已选 N 头猪 · 转移至：…`.
    Accordion `转移健康数据` lists the pen-level diseases, symptoms and treatments (`共 2 种疾病，4
    项症状，1 个治疗`). Each row has a checkbox, and bottom buttons `移动` / `复制` / `提交`.
    Rules `854:3421` / `854:3422`: unmarked records stay; 移动 moves them and removes them from the
    old pen; 复制 copies them and keeps them on the old pen. The marks take effect only on submit.
- Selecting a no-ID row asks how many head move: an inline stepper with ✓ / ✕ (see §5). Whole-pen
  selection takes everyone.
- **Occupied destination:** no frame checks capacity, a mixed batch, a mixed pig type, or that the
  destination already has pigs. Pigs are simply added to the pen. The batch stays on the pig (for
  identified pigs) or on the moved head. Nothing re-asks the batch at the destination.

### 2b · Production task 查情 › 转移单头猪 (2026.1.23), single pig (TASK `7561:10830`)
- `7561:12168` 更多操作 sheet on one pig: 添加标记 · **转移** · 上报死亡 · 健康管理. The same panel
  exists for many pigs in one pen and in several pens (`7678:2390`, `7667:2064`, label 转舍).
- `7561:12220` / `7561:12284` 选择位置 tree (区 › 车间 › 舍, 舍 is single-select ✓), footer
  `取消` / `选择栏位`.
- `7561:12254` 选择位置 wheels: path card `1区 - 后备车间 - 1舍`, wheels 单元 (A…G) × 栏位 (1…3),
  footer `选择其他单元` / `确认`. No confirm dialog after it is drawn.
- Steps: sheet → tree → wheels → done (3 surfaces). Fields: destination only.

### 2c · Web
- WB `3421:7768` 转舍 drawer: shows progress only, no entry. Tiles 未开始 5 / 进行中 5 / 已完成 5. Each
  in-progress task is one row per (pig type, batch), e.g. `生产母猪 · PL1-Batch1`, with a bar and
  `已转入 / 已转出 100 / 200`. So the web treats 转舍 as a **planned task** that is reconciled by
  counts in and out. The phone does the moving.
- BARN `283:4470` 转舍记录 dialog (archived): a log filtered by event type, pig ID, location and
  time. BARN `159:7004` 日志-车间: an event log (time, pig, location, event, operator).

**What is complex about it**
- Two designs for the same verb (Inspection tree + wheels; task sheet + tree + wheels), with
  three ideas of where the pigs land: pen `A1`, unit `1单元`, and 单元 × 栏位 wheels.
- The hierarchy depth is not settled: 区-车间-舍-单元-栏位 vs 区-车间-单元.
- The no-ID split adds a whole page, because pen-level health records cannot know which head
  moved. The worker decides stay / move / copy for each record.
- No-ID head move by count (stepper at tick time). Identified pigs move as single pigs.
- The web models transfer as a task (转入 vs 转出 counts per batch). The phone models it as an
  immediate move. The two are never linked in the frames.
- There is no rule for an occupied pen: no capacity, mixing or batch-merge prompt.

---

## 3 · Transfer out / sale (出栏 / 销售 / 转出). Not designed on mobile.

- No mobile file has a sale, market or ship-out flow. Pigs leave the mobile model only by death
  (`上报死亡`), missing (`上报失踪`) or weaning (the sow leaves her batch).
- BARN `1264:13852` 不在场猪只 (pigs not on site): a table with columns 猪只ID · 猪只类型 · 日龄 ·
  **出厂原因** · 出场时间 · 入场时间, filtered by 出场原因. The sample reasons are **售出** (sold),
  **转出** (transferred off farm) and **死亡** (died). So an exit is a record with a reason and a
  date, kept and searchable after the pig leaves.
- WB `3390:6566` 猪群存栏变动: the stock chart filter splits **流入** (分娩 · 转入 · 采购 · 种类变动)
  from **流出** (not expanded in the frame). 种类变动 (type change) counts as a flow.
- WB `3421:7344` 结束育肥检查: an end-of-finishing check per batch (`已结束育肥 80 头`, average
  weight, 公/母/未知, 留种猪只, 育肥存活率, day `第 n/3 天`, 延误 / 超时 chips). It is the stage just
  before exit, but no sale step is drawn.
- `ux/research/ops/terminal.md`: growers are 出栏 (marketed), not culled (淘汰).

**What is complex about it**
- Exit reasons share one table with death. The reason vocabulary (售出 / 转出 / 死亡, and maybe
  missing) is only implied.
- Exits are mostly group events (a batch to market), while the web table is per pig ID. How
  no-ID head leave is not drawn.
- Stock flow categories (采购, 种类变动) exist on the web with no mobile capture.

---

## 4 · Missing (上报失踪)

- **Bulk:** INSP `300:1048`, from 记录 drawer tile 6. The dialog is the whole flow:
  `确认将 12 头猪只上报为失踪吗？ / 上报后失踪，您可在「工具箱 → 失踪列表」中查看并管理相关猪只。`
  Buttons `取消` / `上报失踪` (primary).
- **Single:** INSP `509:1702`, from the `?` pin in calibration Step 1, for one pig `000001`, same
  copy. The button emphasis is inverted: Cancel is the green primary.
- Fields: **none** beyond the selection. No reason, date, last-seen pen, photo or note. No result
  frame.
- Effect: the pig leaves the pen and is parked in `工具箱 → 失踪列表`. That list is designed nowhere
  (the web `不在场猪只` shows no missing reason). There is no found again / return flow.

**What is complex about it**
- Missing is not resolved, only parked. The list where it would be managed does not exist.
- It is a pig verb: a no-ID head can only be ticked as a count. No frame says whether no-ID head can
  be reported missing, or whether calibration's `−` is the only way to lose them.
- It is reachable from two places (the 记录 drawer and the calibration step) with different
  dialogs.
- It captures nothing, so it cannot be told apart from a theft, an unrecorded death or a wrong pen.

---

## 5 · No-ID pigs (无ID / 无身份猪只) and their conditions

- A row is `No ID Pigs × N` (e.g. `× 10`, `× 200`), optionally with a batch `20₁` (batch 20 on
  line 1, `749:2125`), conditions (`发烧，食欲…`) and `650 日龄`. There are four row types,
  ID × batch (`654:1880`–`654:1885`).
- **Selection rule** `907:4178`: `勾选单条数据时，若为无 ID 猪只，需立即填写无 ID 猪只数量 /
  勾选整个栏位时，无需且不可填写无 ID 猪只数量`. Ticking a no-ID row opens `✕ [− n +] ✓`
  (− and ✓ disabled at 0). The chip then reads `已选 n/N`. A pen-level tick takes them all with no
  quantity.
- **Conditions belong to the pen, not the head.** Diseases, symptoms and treatments on no-ID head
  are pen records. That is why transfer path B asks stay / move / copy for each record (§2a).
- **Identity:** a `补充身份 ›` link on a no-ID row runs the identity wizard (`1606:1693` →
  `1606:1846`: 耳缺 → 系谱 → **耳标\* + 性别\***). It moves one head from un-identified to
  identified (`654:1888`/`1889` → `654:1894`/`1895`). Mark-for-breeding forces it
  (`620:3512` `所选猪只 包含无身份`).
- **Drawer gating** (`853:2119`, `654:2366`; doc row "No ID Pigs" = `782:2200`, `853:2120`,
  `907:4225`, `853:2173`, `854:3491` 功能禁用态): tiles are enabled only if the selection can do
  that action. Single-pig-only actions (发情, 流产, 分娩, 断奶, 体重, 背膘, 体温) are disabled for a
  multi-head selection.
- **In calibration**, no-ID head exist only as a pen total split by (line, batch) (§1).

**What is complex about it**
- Two models live side by side: pigs (records) and head (counts per pen per batch). Every verb has
  to say how it treats each.
- Ticking needs a second input (how many). Pen-level ticking forbids it.
- Conditions on counted head belong to the pen, so they split or copy when head move.
- Batch membership of no-ID head lives only in calibration's allocation rows. The system never
  re-checks it outside the wizard.

---

## Things a new design must not lose

1. **Found here / not here per pig:** claim a pig recorded elsewhere (exact ID or scan, showing
   its current location), and mark a named pig as not here.
2. **One pen total with a floor:** the count cannot go below the pigs the system can name.
3. **Batch (and production line) for anonymous head:** every counted head belongs to a batch, or is
   visibly unallocated.
4. **Old → new kept as a record** (`22 → 25 头`): who, when, which pen.
5. **Transfer of one or many**, with the current unit's pens offered first (`749:5975`), and the
   full path shown on the destination.
6. **No-ID head move by count;** a single-row tick asks how many, a whole-pen tick takes all.
7. **Pen-level health records** (diseases, symptoms, treatments) get a stay / move / copy decision
   when no-ID head leave. Identified pigs carry theirs.
8. **Missing parks the pig** in a recoverable list. It is not a deletion. The old system never
   designed the list or the return flow.
9. **Exit reasons** (售出 · 转出 · 死亡), with date out and date in, kept in a not-on-site record;
   stock flows split into in (分娩 · 转入 · 采购 · 种类变动) and out.
10. **Planned transfer progress** (`已转入 / 已转出 n / N` per batch) on the web.
11. **Litter counts:** reported vs system with a stated reason, and fostering moving both litters'
    numbers. The old auto-remove and auto-add are the part to replace, not keep.
