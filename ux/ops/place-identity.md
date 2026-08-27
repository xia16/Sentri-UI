# Place & identity — Transfer · Assign identity · 留种 mark/unmark · Report missing

Requirements brief for the PLACE & IDENTITY operation cluster, distilled from production 巡检
(`4GZGPBauEOWQQjnRrzoUgF`, section `60:408`) via `ux/inspection/part-e.md` (转移 · 上报失踪),
`part-c2.md` (留种 · the 补充身份 wizard), `part-a.md` (row selection, `907:4178`), and anchored on
`ux/components.html` §04 (field kit, conditional rule, composition table rows 676–678), §05
(arity 980–992, entrance rules 994–1002, identity-gate rule at line 998), `ux/check-in.html` §06b
(count law, line 661) · §06d (group row, lines 778–781) · §06h (un-identified pen sheet),
`ux/product-model.html` §4 (rows 145–149) + §6 (identity model), and the subtraction decisions
already made in `ux/checkin/pen-count.md` (rows 10–12, 16–17; open questions 3, 8).

All four verbs are reached one way: selection → the verb sheet (§05). The subject can be 1..N
tagged pigs, a group row of un-identified head (ticked with the how-many stepper,
`勾选单条数据时，若为无ID猪只，需立即填写无ID猪只数量`, `907:4178`), a pen (contributing itself
and its pigs), or any mix. Containers follow the working rule — ≤5-field judgment = drawer;
conveyor or composite = page — flagged per verb, not relitigated (the drawer/page line is an open
question in components.html §05, line 1007).

---

## 1 · Production inventory

### 转移 Transfer (part-e:284–409)

| Node | Screen (中文) | Role |
|---|---|---|
| `854:2488` | 子功能-记录 drawer | entry tile 转移; `654:2366`: 「转移、寄养、上报失踪：可作用于 单头猪或多头猪」 |
| `749:5903` | 选择位置 | zone→workshop→house tree (区-车间-舍), expandable; no bottom button |
| `128:1082` | 默认为：选择当前单元的栏位 | auto-raised 选择栏位 drawer: path card (「只是展示 不能操作」, `1740:1713`) + two wheels (单元 × 栏位), 确认 disabled on 请选择 |
| — | rule `749:5975` | 「点击"转移"按钮后，先进入这个页面 / 然后立马自动唤起右侧"选择栏位"的抽屉…默认转移至当前"区-车间-单元"的其他栏位」 |
| `296:1133` | 二次确认 | **path A — 全部为有ID猪只** (`749:5401`): dialog 「确认将 12 头猪只转移至 1区 - 后备车间 - 1舍 - A1 吗?」 |
| `612:2414` / `749:4264` | 转移-确认页 默认态/编辑态 | **path B — 包含无ID猪只** (`749:5402`): full page; 确认信息 card + 转移健康数据 accordion (diseases/symptoms/treatments, per-row checkbox, bottom 移动 · 复制 · 提交) |
| — | rules `854:3421` / `854:3422` | unmarked ⇒ 「只转移猪只…不跟随」; marked ⇒ 「移动：…从原栏位移除 / 复制：…原栏位仍保留」, effective 提交后才生效 |
| `749:6023` | 操作结果 | toast ✓ 操作成功 |

### 上报失踪 Report missing (part-e:257–281)

| Node | Screen | Role |
|---|---|---|
| `300:1048` | 上报失踪-二次确认 | **the whole flow**: 「确认将 12 头猪只上报为失踪吗？ / 上报后失踪，您可在「工具箱 → 失踪列表」中查看并管理相关猪只。」 Captures nothing beyond the selection |
| `509:1702` | calibration's copy of the same dialog | button emphasis inverted (part-a:710); destination screen designed nowhere (part-e ambiguity 17) |

### 标记 / 移除留种 + 补充身份 (part-c2:85–93, 241–403)

| Node | Screen | Role |
|---|---|---|
| `782:2200` / `907:4225` | drawer entry + 提示 chooser | combined 标记/移除留种 tile forces 「请选择"标记留种"或"移除留种"」; the bar *behind* the chooser shows three split buttons — the split model is intended, the chooser legacy (part-c2 ambiguity 1) |
| `620:3516` | pasted written spec 2.3 | 「系统强制要求在标记为育种之前进行打耳标」·「用户必须为每只动物指定性别」· notch optional, sex derivable from notch · 「有ID的动物，直接标记，无需额外步骤」 |
| `654:2397` | 弹窗, mixed eligibility | 「选中的 10 头猪只中，仅有 5 头猪只可执行此操作…」— confirms, then **silently drops** the ineligible 5 |
| `650:2870` | 操作成功 | 「所选猪只 全部有身份 / 直接标记成功」 (`650:3050`) |
| `620:2857` | 标记留种 identity-completion list | pigs grouped by pen; 无ID rows carry 补充身份 ›, post-wizard rows 修改身份 ›; 提交 blocked until all have identity |
| `1606:1693` → `1606:1767`/`1606:1957` → `1606:1846` | 补充身份 wizard | 3 steps: 耳缺 (skippable) → 系谱 (derived = read-only confirm `1606:1957`; else global search/scan, `1606:3277`) → **耳标\* + 性别\*** (the only required step, last) |
| `1234:1748` | back-nav dialog | 「返回后，您已填写的内容将不会被保存」 |
| `654:2292` / `654:2367` | 移除留种 dialogs | mixed / all-eligible confirms; no result frame drawn |

---

## 2 · Per-verb spec

### 2.1 Transfer 转移 — Bulk · drawer

**Fields → kit** (composition table already fixes this — components.html:676):

| Field | Kit | Required | Notes |
|---|---|---|---|
| Destination pen | **Picker** | ✱ | "opens a sheet with search + scan" (components.html:643). The sheet is the **pen picker component (§02)** — not a location tree |
| Group records | **Checklist**, per-item verdict | conditional | revealed only when the selection includes un-identified head **and** the source pen has open group records. Same kit shape as Resolve condition — "Checklist(her open conditions, per-item verdict)" (components.html:672) |
| Batch split | **Stepper** per batch | conditional | revealed only when the moved group heads come from a multi-batch partition — see mixed semantics |

**Destination depth.** Production drew three notions of "where the pigs land" (pen `A1` in
`296:1133`, unit `1单元` in `612:2414`, wheels of 单元×栏位 in `128:1082` — part-e ambiguities 6–7)
on an unsettled 区-车间-舍-单元-栏位 hierarchy. Mobile needs **two levels: unit → pen**, delivered
as one flat picker: pens grouped under unit headers, **current unit pinned first** — production's
own default (`749:5975` 「默认转移至当前"区-车间-单元"的其他栏位」) kept as *ordering*, not as an
auto-raised modal wheel. Search reaches any pen; each result carries its full path as a trailing
token (the load-bearing location header of `566:2788`, kept per pen-count row 9). The
zone/workshop tree survives as the picker's group labels, never as navigation.

**The records-follow model.** Who owns a health record decides whether transfer asks about it:

| Subject | Where its records live | On transfer |
|---|---|---|
| Identified pig | on the animal | **ride the animal, always, silently.** Nothing to ask — this is why all-identified transfer is one field |
| Un-identified head | on the pen, as counts (`Treatment · 2 head · scours`, 06h:956) | the system cannot know whether the treated heads are among the n leaving — **the farmer says, per record**: stays (default, production's own `854:3421`) · moves (`从原栏位移除`) · copies (`原栏位仍保留`) |

Production's path B is a full page because the verdict is applied by checking rows and then
tapping bottom-bar 移动/复制 buttons — a two-step mark across a modal accordion. Collapsed here to
**one conditional Checklist**: each row is one open group record on the source pen, carrying a
three-state verdict inline (`stays · move · copy`). It is **not a composite** — a composite's
sections are record sheets (components.html:683); this is one field with per-item verdicts, and
the row count is the pen's open group records (typically 0–3, per 06h). One edge decided: when
the **whole** un-identified population moves (n = N), "stays" would strand records on an emptied
population — the default flips to **move**, and the checklist collapses to a footnote line unless
the farmer opens it.

**Mixed selection (tagged + group heads).** One sheet, one commit, two movements under it:

- Identified pigs move as placement events; the source and destination counts **derive** (06b:661
  — "derived from placements for identified").
- Group heads move as a **count**, set by the stepper at tick time (`已选 n/N`, `907:3431`);
  source pen's un-identified count −n, destination +n — "set by count for un-identified".
- **Batch allocation follows the count.** The un-identified population is a pen-level count
  partitioned by (生产线, 批次) (pen-count, "The batch-allocation model"). Single-batch group —
  the common case — moves silently under its batch. Multi-batch group: the system cannot know
  which heads left, so per-batch steppers (the calibration allocation rows, reused) reveal
  beneath the picker, Σ = n. Unallocated heads move as unallocated — legal because `unallocated`
  is persistable (pen-count subtraction row 2). Flagged against pen-count open q 8.

**No confirm ceremony.** Production's two confirm paths both die: the dialog (`296:1133`) is a
diff of what the farmer just chose (same cut as pen-count row 3), and the full page collapses
into the conditional above. The record sheet **is** the confirmation — subject header restates
scope (`12 pigs · selected · 3 tagged + 9 head`), `view ›` filters the list to the selection
(06b:705), and the primary commits. Toast cut (pen-count row 20): the rows leave the pen where
they sit, and the destination pen card updates.

```
┌──────────────────────────────────┐
│  ═                               │
│  12 pigs · selected      view ›  │   3 tagged + 9 head · D4
│                                  │
│  Destination pen *    Select ›   │   → pen picker: current unit first,
│                                  │     search + scan, path tokens
│  ┌ ↳ 9 head leave D4 ──────────┐ │   conditional — group heads in selection
│  │ Scours · treatment · 2 head │ │
│  │   ( stays ) ( move )( copy )│ │   default: stays
│  │ Weak · condition · 1 head   │ │
│  │   ( stays ) ( move )( copy )│ │
│  └─────────────────────────────┘ │
│  ┌ ↳ 9 of 38 · two batches ────┐ │   conditional — multi-batch group only
│  │ 批次 25 · 线1    − 4 +      │ │
│  │ 批次 26 · 线1    − 5 +      │ │   Σ must equal 9
│  └─────────────────────────────┘ │
│        [ Transfer 12 pigs ]      │
│   records of tagged pigs move    │
│   with them                      │
└──────────────────────────────────┘
```

**Container: drawer.** Judgment fields ≤ 2 in the common case; both conditionals together can
push a worst-case sheet past five rows — flagged, not relitigated. Arity Bulk (§05:983).

### 2.2 Assign identity 补充身份 — Conveyor · page

The one event, reachable from anywhere it is a precondition (product-model:201–204): standalone
as the **Tag** tile on the Routine strip (components.html:811), and inline as the gate.

**Fields → kit** — one sheet per pig, production's three steps merged, required first (production
put 耳标\*/性别\* on the *last* step, `1606:1846`):

| Field | Kit | Required | Notes |
|---|---|---|---|
| 耳标号 Tag | text + trailing scan; **Numpad** for sequences | ✱ | 「请填写耳标号或扫描耳标」 (`1606:1846`). Numpad's running list (components.html:638–640, "per-piglet tag") serves consecutive paper tags: each entry commits a sheet and advances the conveyor |
| 性别 Sex | Choice(2) ♂公 · ♀母 | ✱ | pre-fills from the notch when one is given — 「如果提供了耳缺，性别从耳缺中自动确定」 (`620:3516`), specified but undesigned in production (part-c2 ambiguity 10); editable after pre-fill |
| 耳缺 Notch | Picker — two tappable ear diagrams | — | the scan fallback (product-model §6, Scan row) |
| 父母 Parents | 2 × Picker (母亲 · 父亲) | — | derived when known → read-only confirm cards (`1606:1957`, no 跳过 — "nothing to skip"); unknown → picker with global search + scan (`1606:3277`) |

No 跳过 buttons: optional fields are simply not required (production needed Skip because it made
whole *steps* of optional fields). No pedigree warning dialog: the empty parents field is the
visible absence (zero rule); production specified the warning and never designed it (part-c2
ambiguity 11).

**Conveyor mechanics.** Page (conveyor = page). Subject header names the pig it can
(`D4 · no-ID pig · 34d`); footnote carries the conveyor hint (`3 of 8 remaining`,
components.html:612). Primary `Confirm & next`; last sheet `Confirm`. **Each sheet commits its
own pig** — the tag is physically in the ear, so the record follows the world immediately; no
batched submit, so production's back-nav warning (`1234:1748`) has nothing to guard. Committing
identity also migrates that head's batch from the pen partition to the animal (one head leaves
`无身份猪只`'s batch rows, the animal record gains `20₁`) — the decrement no production screen
shows (pen-count open q 8).

**The inline gate splice.** "Identity is a gate that resolves inline, never a wall — an untagged
gilt still shows Heat; tapping it runs the identity step first, then the event"
(components.html:998). Specified:

- **Gated verbs**: those whose record only means anything pinned to an individual — cycle events
  (Heat on an anonymous head cannot be found tomorrow) and 留种
  (「系统强制要求在标记为育种之前进行打耳标」). Bulk health verbs do *not* gate — group rows
  record them as counts against the population (06h:958).
- **Splice**: tapping the verb with k untagged subjects in the selection opens the identity
  conveyor over those k only. The **verb owns the journey**: page title is the verb; a mono step
  line beneath reads `identity first · 2 of 3`; the footnote reads `next: 留种` — the conveyor-hint
  grammar carrying the splice.
- **What commits when**: each identity commits on its own `Confirm & next` (physical act, record
  follows). The original verb commits only on its own sheet, which opens after the last identity
  sheet with the whole selection — new tags in its subject scope.
- **Back behaviour**: back on an identity sheet abandons that pig's uncommitted fields only;
  already-confirmed identities stand. Backing out of the conveyor returns to the list, selection
  intact; the verb was never written. Re-tapping the verb re-gates on whoever is still untagged.
  Back from the spliced verb sheet abandons the verb; the identities stay — the asymmetry is
  honest, because one mirrors the world and the other doesn't yet.

```
┌──────────────────────────────────┐
│ ←  Mark 留种                     │   the verb owns the journey
│    identity first · 2 of 3       │
│ ┌──────────────────────────────┐ │
│ │ D4 · no-ID pig · 34d         │ │
│ │ 耳标 Tag *   [______]  ⌗scan │ │
│ │ 性别 Sex *    ♂ 公 · ♀ 母    │ │
│ │ 耳缺 Notch      Select ›     │ │
│ │ 父母 Parents    Confirm ›    │ │   read-only cards when derived
│ │      [ Confirm & next ]      │ │   commits THIS pig now
│ │      next: 001240 · 留种     │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

### 2.3 留种 mark / unmark — Bulk · drawer (+ gate)

**Two verbs, not a toggle.** Production fused them into one tile and then needed the 提示 chooser
dialog (`907:4225`) to un-fuse them — and its own annotation names them separately
(`853:2119` 「标记留种、移除留种标记」), with the split bar visible behind the chooser (part-c2
ambiguity 1). The verb sheet renders whichever the subject allows (blocked verbs omitted, §05):
none marked → 标记留种 only; all marked → 移除留种 only; mixed → both. Reasons: the two gate
differently (mark gates on identity; unmark cannot — a marked pig has one by definition,
part-c2:396); a toggle hides which state the selection is in; and the chooser dies with the
fusion.

**Mark 标记留种.** No payload (composition table :677 — "— none"). Flow for N selected, k
untagged:

1. Identity conveyor over the k (§2.2 splice). 「有ID的动物，直接标记，无需额外步骤」
   (`620:3516`) — k = 0 skips straight to 2.
2. The mark sheet: drawer, zero fields — subject header (`8 pigs · selected`), one consequence
   line, primary `Mark 8 for 留种`. The zero-field record sheet **is** the confirmation; no
   dialog.

**No silent drops.** Production's mixed-eligibility dialog (`654:2397` 「仅有 5 头猪只可执行此
操作」) confirms and drops the ineligible without naming them (part-c2 ambiguity 4). Law 3
(product-model:171–179): the sheet lists blocked pigs *with reasons* — `2 blocked · not tagged ›`
for pigs whose identity sheet was backed out of, plus whatever the eligibility predicate blocks —
and the primary proceeds on the remainder, deliberately. Production's identity-completion list
page (`620:2857`) is subsumed: its per-row 补充身份 › links were manual invocation of the wizard;
the conveyor runs the untagged subset unprompted.

**Unmark 移除留种.** Same drawer shape, no gate, no payload. Mixed marked-state selection: sheet
reads `10 selected · 6 marked`, primary `Remove 留种 mark · 6` — scoping visible, not silent
(production drew both dialogs `654:2292`/`654:2367`; both collapse into the sheet). No result
toast (production drew none either — part-c2 ambiguity 3 resolved by having no toasts at all).

### 2.4 Report missing 上报失踪 — Bulk · drawer

**No payload beyond the selection** (production captures 「nothing beyond the pig selection —
no reason, no date, no photo」, part-e:272; catalogue row :678 agrees). Drawer, zero fields:
subject header, the parking sentence, primary. The one kept sentence (pen-count row 12):

> 上报后，您可在「工具箱 → 失踪列表」中查看并管理相关猪只。 (`300:1048`)

— rendered as the sheet's footnote: *parked, not deleted — she moves to the missing list and can
be recovered.* The dialog itself is cut; its inverted button emphasis (`509:1702`, part-a:710)
was a defect, not friction to preserve. The per-row `?` pin entry died in pen-count row 11 —
this verb's only door is the verb sheet.

**The group-row gate.** Group heads **cannot go missing.** A missing report parks an *identity*
for later resolution; an un-identified head has none to park — it is named only by its count
(06d:781, "count is how they are named"), so an untagged head that cannot be found is not a
missing pig but a **wrong count**, and the fix is the pen's Count sheet (Single, pen-scoped, which
captures the reason — pen-count row 23). Stated per the entrance rules:

- Selection is group heads only → **Missing is omitted**, counted in the not-available line:
  `missing needs a tag — set the pen count ›`.
- Mixed selection → the verb stays; the sheet scopes visibly: `12 selected · 4 head can't go
  missing — adjust the pen count instead`; primary acts on the 8 tagged (Law 3, deliberate
  remainder).

**Effect.** The pig leaves her pen (count re-derives — when, exactly, is pen-count open q 3);
her page wears the parked state, history whole (§07's "the page outlives the subject" grammar).
The missing list itself is designed nowhere in production (part-e ambiguity 17) — where it lives
in our IA is open.

---

## 3 · Subtraction table

Judged against: everything commits itself · no submit button anywhere · one catalogue, one door ·
blocked verbs omitted, not greyed · identity resolves inline, never a wall · partial eligibility
visible, never silent (Law 3) · count has one source of truth (06b:661).

| # | Production element | Verdict | Justification |
|---|---|---|---|
| 1 | 选择位置 tree page (`749:5903`), 区-车间-舍 navigation | **CUT — MERGE into the pen picker** | Mobile needs unit → pen; the hierarchy survives as group labels and path tokens on search results. Depth itself is unsettled in production (part-e ambiguities 6–7) |
| 2 | Auto-raised 选择栏位 wheel drawer (`128:1082`) + disabled 确认 | **CUT the wheels, KEEP the default** | 「默认转移至当前…的其他栏位」 (`749:5975`) survives as *ordering* — current unit pinned first. A two-wheel modal with a dead confirm is ceremony; the picker is §02's component |
| 3 | Path card 「只是展示 不能操作」 (`1740:1713`) | **KEEP the data** | Every picker result carries its path token — same decision as pen-count row 9 |
| 4 | Transfer confirm dialog `296:1133` (all-ID path) | **CUT** | A diff of what was just chosen (same cut as pen-count row 3). The record sheet is the confirmation; `view ›` reviews the selection (06b:705) |
| 5 | Transfer-confirm full page `612:2414`/`749:4264` (ID-less path) | **MERGE → one conditional Checklist** | The per-record 移动/复制 judgment is real (pen-level records, farmer must say); the page, master checkbox, accordion taxonomy and bottom-bar apply-buttons are not. Per-row three-state verdict, default stays (`854:3421`) |
| 6 | Bottom bar 移动 · 复制 · 提交 | **CUT** | Verdict moves onto the row; 提交 dies with the no-submit law |
| 7 | Result toast `749:6023` 操作成功 | **CUT** | Rows leave the pen where they sit; the destination card updates (pen-count row 20) |
| 8 | 上报失踪 dialog (`300:1048`/`509:1702`) | **CUT, KEEP one sentence** | Already decided — pen-count row 12. The parking sentence becomes the sheet footnote; the inverted button emphasis was a defect |
| 9 | Per-row `?` pin → missing | **MOVED to the verb sheet** | Already decided — pen-count row 11 |
| 10 | Combined 标记/移除留种 tile + 提示 chooser (`907:4225`) | **CUT — two verbs** | The chooser exists only because one tile fused two verbs; production's own annotation and the bar behind the dialog use the split naming (part-c2 ambiguity 1). Subject state gates which verb renders |
| 11 | Mixed-eligibility dialogs (`654:2397`, `654:2292`) | **CUT — blocked list on the sheet** | 「仅有 5 头…」 confirms then silently drops, naming nobody. Law 3: list the blocked with reasons, proceed on the remainder deliberately |
| 12 | Identity-completion list page (`620:2857`) with per-row 补充身份 › | **MERGE into the conveyor** | The list was manual dispatch into the wizard, with a 提交 blocked until done. The gate runs the untagged subset as a conveyor unprompted; each identity commits itself, so there is no blocked submit |
| 13 | 补充身份 wizard, 3 steps, required fields last | **MERGE to one sheet, required first** | 耳缺→系谱→耳标+性别 puts both ✱ fields on step 3 (`1606:1846`). One sheet of four fields; steps were only pagination |
| 14 | 跳过 buttons on wizard steps | **CUT** | Optional fields are simply not required; Skip existed because whole steps were optional |
| 15 | Back-nav warning dialog (`1234:1748`) | **CUT** | Nothing batched remains to lose — each pig commits on confirm; back abandons at most the current sheet's fields |
| 16 | Sex-from-notch derivation (`620:3516`, undesigned) | **ADD — design it** | Notch entered → sex pre-fills, editable. Production specified it and drew a permanently-empty required control (part-c2 ambiguity 10) |
| 17 | Pedigree-missing warning (`620:3516`, undesigned) | **CUT** | The empty parents field is the visible absence; zero rule. 出生日期 was specified as a prompt field and never drawn anywhere — not added |
| 18 | 修改身份 › re-entry (`1606:3276` retitling) | **KEEP** | Same sheet, title 修改身份, reached from the pig page — one event, two titles |
| 19 | All 操作成功 toasts in the cluster | **CUT** | Everything commits itself; the row updating in place is the feedback |
| 20 | Batch picker: pinned + greyed already-allocated (`1924:1784`); 选择生产线 wheel | **KEPT / MERGED as decided** | pen-count rows 16–17 — reused unchanged where transfer's multi-batch reveal needs the same rows |

---

## 4 · Open questions

1. **Multi-batch group transfer** — per-batch steppers (specified above) or a default split
   (proportional / oldest-first) with the steppers as an override? Depends on how often nursery
   pens genuinely hold multi-batch un-identified populations. Ties into pen-count open q 8 (batch
   migration on identity-assign is the same undrawn decrement).
2. **Missing timing and destination** — does the pen count drop on report or on resolution
   (pen-count open q 3)? And where does the missing list live in our IA — production's
   工具箱 → 失踪列表 is designed nowhere (part-e ambiguity 17); candidates are a Today escalation
   and the pig page's parked state, with recovery as a verb on that page.
3. **留种 eligibility predicate** — production never states what makes a pig ineligible
   (part-c2 ambiguity 5; the written spec implies 仔猪或商品猪 only). Blocks the blocked-list
   reasons on the mark sheet.
4. **The exact identity-gated verb set** — cycle events + 留种 are established
   (components.html:998; `620:3516`). Do measurements gate (a weight on an anonymous head is a
   group weight instead)? Death does not (bulk death works on group rows in part-d). Needs the
   per-event precondition pass (product-model open q 2).
5. **Destination picker reach** — can a transfer cross workshops/zones from mobile, or is
   cross-workshop movement a console act with mobile scoped to the walker's zone? Production's
   tree implies farm-wide; biosecurity may say otherwise.
6. **Sex-from-notch derivation table** — farm-configured or breed convention? The pre-fill needs
   its source named.
7. **Transfer of a whole pen's group population** (n = N) — the move-by-default flip specified in
   §2.1 assumes records always belong with the animals when nobody stays; confirm no case exists
   where an emptied pen keeps an open treatment (e.g. an in-progress pen-level medication course
   tied to the trough, not the heads).
