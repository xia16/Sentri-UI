# Pen count calibration — requirements brief

Distilled from production 巡检 (`4GZGPBauEOWQQjnRrzoUgF`, section `60:408`) via
`ux/inspection/part-a.md` (calibration: lines 359–602, rules 661–668), `part-e.md`
(transfer / report-missing / fostering), `part-c1.md` · `part-c2.md` (batch membership,
weaning, identity), `PRD.html` §§3–5, and `ux/product-model.html` §4 (Count correction).
Anchored on `ux/components.html` §01b (row grammar), §05 (the entrance), and the variation
table. Two frames were re-pulled from Figma to settle arithmetic: `1799:1985`, `640:1909`.

---

## Thesis

Production's calibration is arithmetic ceremony wrapped around one real payload — how many head
sit in this pen, and which batch each un-identified head belongs to — and it survives only as a
pen-scoped event with no wizard, no submit and no dialog.
The blocking balance predicate `Σ(batch) = un-identified` exists because production refuses to
persist an unallocated head; making that count persistable removes the submit button and, in the
same move, creates the one discrepancy signal the product currently has none of.
Because production has **no discovery mechanism at all** — the farmer must already suspect the
count is wrong before a 24px unlabelled glyph will let him fix it — the redesign's real problem
is not the wizard, it is surfacing the fact.

---

## Production inventory

| Node | Screen / state (中文) | English | Role in the flow |
|---|---|---|---|
| `60:523` · `640:1909` · `907:3431` | pen card, `猪只列表（N）` + green pencil-on-dots icon | pen card header | **The only entry point.** part-a:137, :217, :234, :622 |
| `224:1545` | Step1（默认态） | Confirm identified pigs, default | Read-only `当前系统记录` list; `扫描添加` · `手动添加` · `下一步` |
| `224:1618` | Step1（添加后） | …after adding | Inserts a `新添加` section **above** `当前系统记录`; rows carry `✕` not `?` |
| `566:2426` | 手动添加（需要先搜索，精确搜索） | Manual add — must search first | `请先搜索猪只`; `确认` disabled |
| `566:2854` | 手动添加（无结果） | Manual add — no result | `未搜索到"000009"`; `确认` disabled |
| `566:2788` | 手动添加（搜索结果） | Manual add — one exact hit | Location header `A1` + `1区 - 母猪车间 - 1舍`; **radio**; `确认` still disabled |
| `509:1702` | 二次确认 — 上报失踪 | Report-missing dialog | Fired by the per-row `?` pin. Button emphasis inverted (part-a:710) |
| `1796:1675` | Step2（默认态） | Confirm pen total, default | T=30, I=20, U=10, Σ=10 → **balanced on open** |
| `1797:1721` | Step2（修改过，不可提交） | Under-allocated | T=40, I=20, U=20, Σ=10 → blocked |
| `1799:1985` | Step2（修改过，不可提交） | Over-allocated | T=40, I=20, U=20, Σ=25 → blocked (banner says 10 — see Invariant note) |
| `224:1486` | Step2（修改过，可提交） | Balanced | T=40, I=20, U=20, Σ=5+2+13=20 → submittable |
| `559:1824` | 选择批次 / page title `添加批次` | Add batch | Line-scoped, multi-select checkboxes; already-allocated pinned + greyed (`1924:1784`) |
| `559:1802` | 选择生产线 | Choose production line | Wheel sheet, single-select, `取消` / `确认` |
| `570:1729` | 二次确认 — 数量更新 | Quantity-update dialog | `A1栏位猪只数量从22头更新至25头，请确认。` |
| `566:3375` | 操作结果 | Toast | `✓ 操作成功` |

**14 screens/states for one number.** Supporting spec frames: `907:3431` (row-selection
behaviour, part-a:225–278), annotation `658:3316` (stepper semantics, part-a:512–527),
`907:4986` (batch delete needs no confirmation), motion specs `658:3317` / `658:3338`.

---

## Requirements distilled

### Captured — what the farmer enters

| # | Field | Type | Where | Required | Default | Notes |
|---|---|---|---|---|---|---|
| C1 | Pig added to the pen | pig reference (one at a time) | Step 1 `扫描添加` / `手动添加` | no | — | Scan resolves 耳标号 or 耳缺号; manual is **exact-match search on ID**, single-select radio (`566:2788`). No reason, no date, no note captured |
| C2 | Pig reported missing | pig reference | Step 1 per-row `?` pin → `509:1702` | no | — | Captures **nothing** beyond the reference — no reason, date, last-seen or photo (`509:1702`; corroborated part-e `300:1048`) |
| C3 | Pig un-added | pig reference | `✕` on a `新添加` row | no | — | No confirmation (part-a:625) |
| C4 | `记录栏位猪只总数` — pen head total | integer, `− n +` stepper | Step 2 card | implicitly yes (it is the commit) | **derived**, see D4 | Floor = identified count (`658:3316`). The single editable total |
| C5 | Batch allocation — membership | (生产线, 批次) tuple | `+ 添加批次` → `559:1824` (+ `559:1802`) | one per un-identified head | — | Multi-select; batch list scoped by the production line (inferred, `575:1965` annotated on a sibling flow) |
| C6 | Batch allocation — head count | integer, `− n +` stepper | per batch row on Step 2 | yes | 0 for a newly added batch, existing value for a pre-existing one (`⬅这是原有的批次` / `⬅这是新添加的批次`, `1834:1790`) | The actual payload of the whole flow |
| C7 | Batch allocation removed | — | red trash on a batch row | no | — | Immediate, `删除批次无需二次确认` (`907:4986`) |

**Not captured anywhere:** a reason for the correction, a date/time of the physical count, who
counted, a photo, or a note. `ux/product-model.html` §4 catalogues Count correction as capturing
*"system count vs observed, **reason**, allocations"* — production's screens capture no reason.
That is a gap in production, not in the catalogue.

### Derived — what the system computes

| # | Value | Formula | Surfaced as |
|---|---|---|---|
| D1 | `有身份猪只` I | `|当前系统记录 identified| − |reported missing (C2)| + |added (C1)|` | `↳ 有身份猪只 N 头` in both cards. **Frozen** entering Step 2 |
| D2 | `无身份猪只` U | `T − I` | `↳ 无身份猪只 N 头`. Never typed |
| D3 | `Σ(batch allocations)` B | `Σ C6` | Not printed as a number; only as the delta `|B − U|` |
| D4 | Default pen total T₀ | `"新添加"的有身份猪只 + "当前系统记录"的有身份猪只和无身份猪只` (`658:3316`, part-a:512–527) | Pre-fills the C4 stepper. In `1796:1675`: 20 + 10 = 30 |
| D5 | Delta N | under: `U − B`; over: `B − U` | The amber banner's number |
| D6 | `更改前` snapshot | total, I, U, and per-(line,batch) breakdown as they stood on entry | Read-only card |
| D7 | Old → new sentence | `A1栏位猪只数量从22头更新至25头` | `570:1729` |
| D8 | Pen list count `（N）` | pen's current believed head total | `猪只列表（5）` — see Discovery |

### Configuration — what an admin owns

| Item | Evidence |
|---|---|
| 生产线 (production line) list | wheel picker `559:1802`, single-select |
| 批次 (batch) list per line, each with `批次的生产状态` + `批次生产状态的天数` | `559:1824` (both are label placeholders in the mock) |
| Pen identity and its 区 → 车间 → 舍 → 单元 → 栏位 path | `566:2788` header; hierarchy depth is itself unsettled (part-e ambiguity 7) |
| Pig taxonomies displayed on rows — 猪只类型, 生产状态, 日龄 | part-a:150–155 |

### The batch-allocation model

`20₁` = batch 20, subscript = production line 1 (annotation `749:2125`, part-a:142–144).
A batch belongs to exactly one production line; the picker is scoped by the line chip.

The identified/un-identified split is structural, and the two halves carry batch membership
**differently**:

- **Identified pigs** carry their own batch on the animal record — the `20₁` chip is a per-row
  field, and rows exist for all four combinations of ID × batch (`654:1880`–`654:1885`,
  part-a:163–168). Batch membership is a property of the pig.
- **Un-identified head** are not animal records. They are a **pen-level count, partitioned by
  (line, batch)**. The `更改前` breakdown proves the nesting — the batch rows sit one indent level
  *under* `无身份猪只`, never under `有身份猪只`:

```
更改前                    20 头
  ↳ 有身份猪只            10 头
  ↳ 无身份猪只            10 头
      ↳ 生产线 1 - 批次 25   5 头
      ↳ 生产线 1 - 批次 26   5 头
```

So Step 2's whole arithmetic concerns the un-identified population only. An un-identified row on
the pig list renders as `No ID Pigs × 10` and, when ticked singly, demands a head count before it
can be acted on — `勾选单条数据时，若为无 ID 猪只，需立即填写无 ID 猪只数量 / 勾选整个栏位时，
无需且不可填写无 ID 猪只数量` (`907:4178`, part-a:246–251). Whole-pen selection makes the quantity
**forbidden**, not merely unnecessary.

---

## The invariant

Let, for one pen:

- **I** = `有身份猪只` — identified head after Step 1 (D1). Frozen at Step 2.
- **T** = `记录栏位猪只总数` — the one editable total (C4).
- **U** = `无身份猪只` = **T − I** (D2). Derived, never typed.
- **B** = Σ over allocation rows of head count (C6), rows keyed by (production line, batch),
  unique per pen.

**Commit predicate (part-a:491–500, `1797:1721` · `1799:1985` · `224:1486` · `1796:1675`):**

```
记录栏位猪只总数 = 有身份猪只 + Σ(batch allocations)
                T = I + B          ⇔          B = U
```

`提交` is enabled **iff B = U exactly**. Not ≥, not ≤.

**Floor rule (`658:3316`, part-a:518, :665):**

> `"记录栏位猪只总数" 小于等于 有身份猪只的数量时，则不可再不可继续减少`
> ("When 记录栏位猪只总数 is less than or equal to the identified-pig count, it can no longer be
> decreased." — the source duplicates 不可, part-a ambiguity 13.)

So **T ≥ I**, enforced by disabling the stepper's `−` at T = I. Consequence: **U ≥ 0 always**;
the farmer can never state a pen total below the animals the system can name. `+` and `−` only
ever move the un-identified population — identified pigs are immovable at this step
(`点击"+"：添加新的无身份猪只` / `点击"-"：减去无身份猪只的数量`).

**Default (D4):** T₀ = (identified added in Step 1) + (identified on system record) +
(un-identified on system record). Because B₀ is the pen's pre-existing allocations, **Step 2 opens
already balanced** — `1796:1675` is green with `提交` enabled and nothing to do. The balance
machinery engages only once the farmer touches the total stepper. Step 2 therefore exists to (a)
show a diff and (b) collect batch allocations for head the farmer has just invented with `+`.

**Note on the over-allocation mock.** Re-pulled `1799:1985` confirms part-a ambiguity 4
(part-a:697–703): T=40, I=20, U=20, batch rows `批次 25 → 5` and `批次 20 → 20`, Σ = 25, so the
true excess is **5**, yet the banner reads `10 头需删除`. The most likely defect is that the second
row's stepper value was typed from its own batch number (`批次 20` → `20`); with the intended
`25` the sum is 30 and the excess is 10, matching the banner. Read the rule as
**N = |B − U|** in both directions; the mock is wrong, not the formula.

---

## Failure states

| State | Predicate | Banner **inside** `更改后` | Footer warning line | `提交` | Node |
|---|---|---|---|---|---|
| Balanced | B = U | `✓ 无身份猪只已全部补充批次` (green) — "all un-identified pigs have had a batch supplied" | none | **enabled** | `1796:1675`, `224:1486` |
| Under-allocated | B < U | `↓ 10 头需补充批次信息` (amber) — "10 head still need batch information supplied" | `⚠ 尚有无身份猪只 未补充批次信息` — "there are still un-identified pigs whose batch information has not been supplied" | **disabled** | `1797:1721`; designer note `1834:1781` `⬅️下方数量少了` ("the quantity below is short") |
| Over-allocated | B > U | `↓ 10 头需删除，或调整栏位总数` (amber) — "10 head must be deleted, or adjust the pen total" | `⚠ 无身份猪只数量 超出记录栏位总数` — "the un-identified pig count exceeds the recorded pen total" | **disabled** | `1799:1985`; designer note `1834:1784` `⬅️下方数量多了` ("the quantity below is too many") |
| At the floor | T = I | — | — | stepper `−` disabled | `658:3316` |

The over-allocation copy is the only place production offers **two escapes** — delete allocations
*or* raise the pen total (`需删除，或调整栏位总数`). Under-allocation offers one
(`需补充批次信息`), although raising Σ or lowering T would both resolve it; the asymmetry is
unexplained.

Both failure states say the same thing twice in two registers — a counted instruction in the card,
an uncounted diagnosis in the footer. Neither names which batch is wrong.

**Step 1 blocked states.** `确认` on manual add is disabled in all three drawn frames
(`566:2426` empty, `566:2854` no result, `566:2788` result present but radio unselected) — the
enable predicate "a pig is selected" is inferred, never drawn (part-a ambiguity 7).

**States production does not have:** no sanity check on the magnitude of the change, no threshold
warning, no reason prompt, no "are you sure this pen went from 22 to 220", no partial save, no
draft. `570:1729` states the delta as a sentence and asks for a tap.

**Dialog inconsistency worth recording.** `509:1702` 上报失踪 puts the destructive verb on the
outline button and `取消` on the green primary — the inverse of `570:1729` and every other dialog
in the cluster (part-a:710–712, ambiguity 6). Nothing annotates it as deliberate friction.

---

## Discovery — how a discrepancy surfaces

**It does not. Production has no discovery mechanism for a wrong count.**

Verified against `640:1909` (re-pulled) and `60:523`:

1. **The entry point is a decoration.** `猪只列表（5）` renders in **grey** section-header text
   with a ~24px unlabelled green pencil-on-dots glyph immediately to its right, on a hairline
   rule, inside the pen card — not in the action bar, not in a menu, no label, no affordance
   language (part-a:137, :217, :234). A farmer who does not already know what it is will not find
   it, and one who does must already suspect the count is wrong.
2. **`（N）` is the system's belief, presented as a fact.** There is no second number beside it —
   no expected-vs-observed, no last-calibrated stamp, no delta, no confidence. Same at every
   altitude: grid cards read `共 2 头` or a single pig ID (part-a:195); the unit header reads
   `共 200 头` (part-a:133); the workshop home reads `存栏 99,999 头`, **display only**
   (part-a:74).
3. **The one red badge on a pen card is not about pigs.** The crossed-tools icon with the red `2`
   is the **device-fault count** for that pen (part-a:134). Confirmed visually on `640:1909`.
4. **The module's only attention word is spoken for, and is out of scope.** `需操作` appears as a
   filter chip and as the sole status line on grid cards, and annotation `658:3113` defines it
   exclusively: `"需操作"代表：饲喂站需加料/减料` ("'needs action' means: the feed station needs
   feed added / reduced"), immediately followed by `❌ 本期不做饲喂站功能` — and `643:2834`
   repeats `❌ "饲喂站"功能 本期不开发` (part-a:202–206, :651–652). So the attention channel exists,
   is reserved for feed stations, and ships **empty** this phase.
5. **Nothing schedules a count.** The patrol queue is ordered by recency and last inspector
   (`上次巡检：365 天前，张华强`, `541:1695`), never by count staleness. There is no audit task, no
   cycle count, no sampling.
6. **The one assertion that could carry it is unvalidated.** `提交巡检` claims
   `所有栏位与设备已检查完毕` ("all pens and devices have been checked") but nothing gates it on
   any pen being ticked, no progress indicator exists, and it is offered from the single-pen
   drill-down where at most one pen is in view (part-a:718–723, ambiguity 8). Nothing defines what
   makes a pen "checked".
7. **The sibling product's anomaly concept is deferred.** `ux/product-model.html` §4 catalogues
   Count correction as `巡检 calibration · 生产任务 数量异常 (deferred)` — the other production
   file has a "quantity anomaly" notion and it does not ship. Neither file surfaces a discrepancy.

**So the flow is 100% farmer-initiated, from a memory of having physically counted a pen.** The
system displays its own belief with the same visual weight as a measured fact, and the only door
to correcting it is a glyph styled as ornament.

**The one thing the system provably could know.** Because Step 2 forces `Σ(batch) = U` at commit
time, a pen whose allocations no longer sum to its un-identified total is *demonstrably*
inconsistent — no counting required. Production never re-evaluates that predicate outside the
wizard, and cannot persist the state that would make it visible, because commit is blocked while
it holds. That is the signal the redesign should recover, and recovering it is the same decision
as removing the submit button (see Subtraction, row 2).

---

## Adjacent flows that change the count

| Flow | Effect on a pen's head count | Kept correct automatically? | Evidence |
|---|---|---|---|
| 转移 Transfer | −n source pen, +n destination pen | **Yes.** The event *is* the move. Forks on identity: all-identified → one-tap dialog `296:1133`; contains un-identified → the long page `612:2414` where pen-level health records are marked 移动/复制 | part-e `749:5903` · `128:1082` · `296:1133` · `612:2414` · `749:4264`; annotations `854:3421` / `854:3422` |
| 上报失踪 Report missing | −n from the pen | **Partly.** The pig leaves the pen and lands in `工具箱 → 失踪列表`; the discrepancy is *parked*, not resolved, and that destination is designed nowhere in the file (part-e ambiguity 17) | `509:1702` (1 pig, from calibration Step 1); part-e `300:1048` (N pigs, from the 记录 drawer) |
| 上报死亡 Report death | −n | **Yes.** Bulk selection, per-pig payload (cause = diseases + symptoms, photos). Cause is soft-warned, not required: `有 n/5 头猪只未添加死亡原因，确认要继续提交吗?` | part-d `290:1515` · `290:1639` · `1506:2292` |
| 寄养 Fostering | litter −n on the donor sow, +n on the receiver | **The counts, yes; the pens, no.** Result cards show `10 头 → 8 头` / `10 头 → 12 头` — and then instruct the farmer: **`请在寄养后同步转出与接收栏位的任务进度`** ("after fostering, please sync the task progress of the transferring-out and receiving pens") | part-e `473:4962` / `473:4897` |
| 分娩 Farrowing | +litter | **Yes**, as 5 litter counts + last-birth time | part-c1 farrowing band |
| 断奶 Weaning | litter ends; sow leaves her batch — `该猪只将从批次中移出`, 生产状态 → 空怀 | **Yes** for batch membership. Litter counts are the payload (`健仔/弱仔/畸形`, auto-summed: `填写明细后自动计算总数`) | part-c2:115, :411, `439:2228` |
| 补充身份 Assign identity | total unchanged; moves one head from un-identified to identified | **Implied, undrawn.** The `无ID` row carries a `补充身份 >` link; after the wizard the row reads as an identified pig (`654:1888`/`1889` → `654:1894`/`1895`) | part-c2:317–322 |
| 标记 / 移除留种 | none | n/a | part-a:277 |
| **校准 Calibration** | sets T outright, re-partitions U across batches | **The fallback.** The only verb that can absorb a change the system never saw | `224:1545` → `1796:1675` |

**Where calibration is genuinely the fallback:** shrinkage the system never observed — a death
nobody recorded, a physical move done without a transfer, a piglet born and not counted, a
double-count at intake, a head allocated to the wrong batch. Every *recorded* event already keeps
the count right; the residual is exactly the silent events. That residual is the whole reason the
verb exists, and it is also why no signal can be derived from event history alone.

**Symptoms worth quoting — production asking the human to reconcile its own system:**

> `请在寄养后同步转出与接收栏位的任务进度` (`473:4962` / `473:4897`)
> "After fostering, please sync the task progress of the transferring-out and receiving pens."

`ux/product-model.html` §1 already names this as the load-bearing defect ("The system asks a human
to reconcile its two halves"). A second instance, softer:

> `上报后，您可在「工具箱 → 失踪列表」中查看并管理相关猪只。` (`509:1702`)
> "After reporting, you can view and manage the affected pigs under 「Toolbox → Missing list」."

— i.e. the pen's count is made correct by moving the unexplained head into a list the farmer must
later go and manage by hand, in a screen that does not exist in the file.

---

## Subtraction analysis

Judged against: everything commits itself · **no submit button anywhere** · rows are two lines,
one height · no invented statuses · selection names the subject and a verb sheet holds the verbs ·
blocked verbs omitted, not greyed · a litter is a selection, not a subject · pen-scoped events need
no door of their own (§05, "the subject can be anything on screen").

| # | Production element | Verdict | Justification |
|---|---|---|---|
| 1 | **Two-step wizard** (`1 确认有身份猪只` → `2 确认栏位总数`) | **CUT the wizard, KEEP both jobs** | Step 1 contains no capture of its own. Its two real acts — a found pig, a missing pig — are already catalogue events (Report missing = Bulk; a pig found in the wrong pen = Transfer, or Assign identity if untagged). Step 1 *is* the walk. What is left is Step 2's arithmetic: one sheet |
| 2 | **`提交` on Step 2** | **CUT — and invert what is captured** | No submit button exists in the product. The blocking predicate exists only because production refuses to persist an unallocated head. Replacement: **make `unallocated` a first-class, persistable count on the pen.** The sheet then commits every stepper change immediately; adjusting a batch row re-derives the total, adjusting the total moves the difference into `unallocated`, and `T = I + Σ(batch) + unallocated` becomes an **identity** rather than a predicate. Nothing to validate, nothing to block. This is the single decision that removes the submit button — and it produces the discovery signal in Discovery ¶8 for free |
| 3 | **Confirmation dialog 数量更新** (`570:1729`) | **MERGE into the record** | Its whole content is `A1栏位猪只数量从22头更新至25头` — a diff, not a decision, and it asks for a tap on information the farmer just typed. KEEP the old→new pair **as payload** in the pen's event log (§05 pig page grammar: `from B2 · jun 12 · G.H`) |
| 4 | **`更改前` / `更改后` twin cards** | **MERGE → one live breakdown + one log entry** | Two snapshots exist because the wizard is modal and hides the pen behind it. Editing the pen in place makes "before" the log and "after" the pen. KEEP every value in D6 as the recorded payload — `product-model` §4 asks for "system count vs observed" |
| 5 | Step indicator; `上一步` / `下一步` | **CUT** | No wizard, no steps |
| 6 | Step 1 `当前系统记录` list | **CUT as a screen** | Byte-for-byte the pen's rows in unit mode (part-a:377 vs :142–155). Re-rendering the list inside a modal is precisely the scatter §05 removes |
| 7 | Step 1 `新添加` section + its `✕` undo | **MERGE into the list** | A found pig is not a pending edit; it is a pig that is here. Committing the place event makes the row appear in the pen with its stamp. The `✕` was undoing an *uncommitted* edit — we have none |
| 8 | `扫描添加` / `手动添加` buttons | **MERGE into the dock** | The dock is already `⊞ Go to pen · Scan ear tag · ⌕` in every mode (variation table). Production built a second scan entry because the wizard hid the list. Scan already means "name this subject" everywhere |
| 9 | Manual-add screen's **location header** (`A1` + `1区 - 母猪车间 - 1舍`) | **KEEP the data, MOVE to search results** | Load-bearing: it is the only place production admits the system can be wrong about *where* a pig is. Search results must always carry the pig's recorded pen |
| 10 | Manual-add radio + disabled `确认` + `请先搜索猪只` browse-block | **CUT** | Selection is our one subject-naming gesture; there is no confirm. Exact-match-only with no browse mode is a search-quality decision, not a requirement |
| 11 | Per-row `?` map-pin → 上报失踪 | **MOVE to the verb sheet** | Report missing is already in the catalogue (Bulk, §4). A per-row pin is a tenth entry point for a verb that has a door |
| 12 | 上报失踪 dialog (`509:1702`) | **CUT the dialog, KEEP one sentence** | The destination line — the pig is *parked*, not deleted — is genuinely informative and belongs in the record sheet's own header copy (04). The inverted button emphasis is a defect (part-a:710), not friction to preserve |
| 13 | `记录栏位猪只总数` stepper + floor rule | **KEEP** | The floor `T ≥ I` survives as a structural constraint: a pen cannot hold fewer head than the animals you can name. It should be structural, not a disabled `−` |
| 14 | Per-batch `− n +` rows | **KEEP** | This is the actual payload of the entire flow (C5 + C6) |
| 15 | Red trash on a batch row, no confirmation (`907:4986`) | **KEEP** | Already right. Deleting an allocation is not destructive once `unallocated` persists — the head returns to unallocated |
| 16 | `+ 添加批次` picker (`559:1824`), multi-select, selected pinned + greyed (`1924:1784`) | **KEEP as a picker, CUT its `确认`** | Pinning already-allocated batches is good behaviour. Ticking commits the row at 0 head; there is no confirm step |
| 17 | 选择生产线 wheel sheet (`559:1802`) with `取消` / `确认` | **MERGE into the batch picker as a scope control** | A modal wheel with two buttons for one single-select field is ceremony. KEEP the scoping rule (`只能搜到所选的生产线里的批次`, `575:1965`) |
| 18 | Amber in-card banner **+** ⓘ footer warning | **MERGE into one derived line** | Production states the same condition twice in two registers. One statement, naming the number and the remedy, in the metadata register (01b: line 2 is tokens). Not a warning — a reading |
| 19 | Green `✓ 无身份猪只已全部补充批次` | **CUT** | It announces that nothing is wrong. 01b slot discipline: where a slot is empty it stays empty |
| 20 | Toast `操作成功` (`566:3375`) | **CUT** | Everything commits itself; the row updating in place is the feedback (variation table: "Record → back to the same scroll position, row updates where it sits") |
| 21 | Title `A1：猪只数量校准` | **KEEP as the sheet header** | Pen-scoped, reached by selecting the pen's pigs — §05: "pen-scoped events (count correction…) need no door of their own" |
| 22 | Arity | **KEEP as Single** | `product-model` §4 and §05's arity table both list count correction as Single — meaningless for two pens. It is absent while N>1, counted in the not-available line |
| 23 | Reason for the correction | **ADD** (it does not exist in production) | §4 says the event captures a reason; no screen does. See Open questions |

**What replaces the two-step wizard ending in `提交`:** one pen-scoped sheet on the verb sheet's
Routine strip, reached from selection like every other verb, in which every stepper commits on
change, the total and the allocations are two views of one arithmetic identity, and the residual
lives in a persistable `unallocated` count instead of a disabled button. The two things Step 1 did
that were real — a pig that is here, a pig that is not — are the existing Transfer and Report
missing events, performed on the walk, from the list, before the sheet is ever opened.

---

## What a pen row must carry during a routine check-in

Anchor: 01b — two lines, one height; line 1 is words, line 2 is `·`-separated mono tokens; **one
chip maximum**, and a chip is "the reason this row needs you first"; a token past its threshold
escalates into that chip. Variation table: **pen headers carry derived counts only**.

**The minimum signal — two tokens on the pen header's metadata line, one usually absent:**

| Token | When present | Why it is legitimate |
|---|---|---|
| `n unallocated` | only when the pen's own arithmetic does not close — `T − I − Σ(batch) ≠ 0` | **Derived, provable, zero human input.** It appears the moment a farrowing, transfer or death lands without a batch, and it is exactly production's own blocked state made persistable. Not an invented status — arithmetic |
| `counted <elapsed>` | always, once the pen has ever been calibrated | Same grammar as the check-in stamp (`checked 09:41 · G. Hansen`) and as production's own `上次巡检：365 天前，张华强`. Makes staleness orderable on Today without alarming anyone |

**Escalation.** `n unallocated` promotes to the pen's one chip only when it crosses a threshold —
per the chip law, a token past its threshold escalates; below it, it stays a grey token. Threshold
is an open question (see below). Nothing else on a pen ever becomes a count chip.

**Explicitly noise — do not build:**

- **A "count may be wrong" badge on every pen.** The system does not know. Flagging all 40 pens
  flags none, and "may be wrong" is an invented status with no fact behind it.
- **A verify-count prompt at each pen during check-in.** That is the two-step wizard re-imposed
  forty times a day; the farmer will stamp through it and the data gets *worse*. The check-in
  asserts presence, not a verdict (§05: "not a verdict on the pigs").
- **A red badge for pens not calibrated recently.** Recency is not error. Staleness belongs on
  Today as ordering — production already does exactly this for units (`541:1695`) — never as an
  alarm on a row.
- **Printing the pen total on the row as a "signal".** `猪只列表（5）` already is the pen header's
  derived count. A second copy of a number nobody disputes is not information.
- **Any variance against a "planned" or "expected" head count.** No such number exists in either
  production file. Inventing one manufactures discrepancies rather than surfacing them.
- **A green ✓ / "count verified" on healthy pens.** Slot discipline: empty slots stay empty.
- **Reviving `需操作` for counts.** It is defined solely in feed-station terms (`658:3113`) and
  reusing it would collide the moment feed stations ship.

**The structural point behind all of it.** The strongest discovery mechanism is not a signal: it is
that the count is a **by-product of work the farmer already does**. Every recorded event already
moves the count; only silent events leave a residual. So the design target is to shrink the
residual — one door for every count-changing verb, no manual re-sync anywhere — and surface only
the residual, in the register 01b reserves for facts the farmer did not assert.

---

## Open questions

1. **Is `unallocated` persistable?** This is the decision the whole brief hinges on. If yes: no
   submit button, no blocked state, and the only derivable discrepancy signal we have. If no: a
   blocking predicate returns in some form, and the pen row has nothing truthful to say. Related
   evidence cuts both ways — row type 4 `无ID，无批次` (`654:1885`) says a batch-less un-identified
   head is a legal row on the list, while `无身份猪只已全部补充批次` says it is illegal at commit.
   The file contradicts itself; we must choose.
2. **Does count correction capture a reason?** `product-model` §4 says "system count vs observed,
   **reason**, allocations"; no production screen captures one, and `570:1729` states only old →
   new. Shrinkage accounting almost certainly needs it. Fixed list (died unrecorded / moved
   unrecorded / miscount / born unrecorded / other) or free text?
3. **What does a missing report do to the pen total, and when?** `658:3316`'s default formula is
   written as a sum of the two visible lists and never mentions reported-missing pigs. Does the
   total drop on report, or only when `工具箱 → 失踪列表` resolves? That list is designed nowhere
   (part-e ambiguity 17), and it is the destination of the only "remove a pig I cannot find" verb.
4. **Threshold for escalating `n unallocated` to a chip** — time-based (outstanding > N days),
   magnitude-based (> N head), or proportional (> x% of the pen)? Needs barn data. Also: does a
   pen with unallocated head block anything (batch reporting, transfer), or is it purely a
   reading?
5. **Can a farmer state a pen total below what he can physically see?** Production's floor is
   `T ≥ I` — the *system's* identified count, not an observation. If the farmer finds 3 tagged
   pigs missing, must he report each missing before he can lower the total, or should the sheet
   accept the number and derive the three reports? Production forces the former (Step 1 before
   Step 2); it is a real workflow choice, not just ceremony.
6. **Is a calibration attributable and auditable?** Production stamps nothing on the result —
   contrast the unit note, which stamps `上次修改：张华 2025/05/05` (`107:1694`). If count
   correction is an event, the log answers this for free; confirm that is wanted.
7. **Batch picker scope.** Does `只能搜到所选的生产线里的批次` (`575:1965`, annotated on a sibling
   flow only, part-a ambiguity 11) survive as a hard filter, or should batch search be global with
   the line shown as a trailing token on each result?
8. **What is the un-identified head's relationship to a batch, exactly?** For an identified pig the
   batch is a field on the animal. For un-identified head it is a pen-level partition. When one
   head is tagged via 补充身份, its batch must migrate from the pen partition to the animal — no
   screen anywhere shows that decrement. Confirm the model before building either side.
