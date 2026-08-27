# PEN operation cluster — requirements brief

Report fault · Resolve fault · Set count · Switch feed · Pen note.

Reached by ticking a pen card — the verb sheet rises with the `PEN` strip leading
(`ux/check-in.html` §06b:644, `ux/components.html` §05:932) — or, for the unit-wide switch,
from the unit sheet (§06g:880, :890). Binding law: the pen's own verbs are four and feed is
not one of them — a feed adjustment is always the consequence of a case, never a direct act
(§06b:648, §05:932). Count is one number with one source of truth: derived from placements
for identified animals, set by the last count for un-identified head — no second number, no
staleness token, no discrepancy state (§06b:661).

Production evidence: `ux/inspection/part-b.md` (equipment cluster, Figma section `60:408`),
`ux/inspection/part-a.md` + `ux/checkin/pen-count.md` (count), `ux/checkin/feed-mobile.md`
(switch semantics from the Feed PRD). Field vocabulary: `ux/components.html` §04 (the kit,
lines 619–654; the conditional rule, 658; composition table row "Fault report", 679).
Container rule applied throughout is §05's still-open working line — **drawer to ~5 fields,
page beyond; conveyors and composites are pages** (components.html:1007). Applied, flagged,
not relitigated.

---

## 1 · Production inventory

### Equipment (part-b, the whole cluster — 8 frames)

| Node | Screen (中文) | What it establishes |
|---|---|---|
| `580:2242` / `337:1020` | 设备列表 (pen / unit entry) | Device list grouped by pen; exactly three types exist — `饲喂站` · `喝水站` · `其他` (part-b:73). Multi-select checkboxes arm two bottom buttons; the bar container is literally layer-named `废弃` (deprecated) in both frames (part-b:67) |
| `571:4757` | 筛选 | Filter by 设备类型 / 设备状态 / 栏位, `重置`/`确认` |
| `1574:3988` | 上报故障-非"其他"设备 | Drawer, h 676. Read-only device card + `描述 *` textarea, placeholder `请简单描述`; `提交` gates on 描述 alone. **No severity, no photos, no assignee, no category** (part-b:155–156, :262–263) |
| `1574:4029` | 上报故障-"其他"设备 | Same drawer +188px: adds `设备名称 *` free text (`请输入设备名称`) — the only structural difference (part-b:174) |
| `225:4803` / `1392:2929` | 异常详情 (non-other / other) | Read-only record(s): device, `栏位号`, description, `上报人：张华强`, `上报时间：2025/05/05 12:00`. **No action buttons at all** (part-b:194, :217) |
| `591:4283` | 操作结果 | `操作成功` toast |
| — | **解决故障** | **No screen exists anywhere in the file** (part-b ambiguity 3). The green button is disabled in both list frames; annotation demands `解决故障时，需要一条一条的解决` ("resolved one record at a time") with no UI behind it |

Governing annotation `928:2008`, verbatim (part-b:269–279):

> `"正常"的设备，可以点击"上报故障"按钮` ·
> `"故障"的设备，可以点击"解决故障"按钮` ·
> `同时选择"正常、故障"的设备时，两个按钮均禁用` ·
> `"饲喂站、喝水站"不可重复上报故障` ·
> `"其他"…可以重复上报故障，每次上报故障时，需要填写备注` ·
> `解决故障时，需要一条一条的解决`

Known contradiction: the same annotation says typed devices need no note
(`不需要填写备注`) while the newer sheet `1574:3988` requires `描述 *`. Node ids date the
sheet later; we side with the sheet (part-b ambiguity 1).

A fault record captures, total: `设备名称` (其他 only) + `描述`, with device type, pen,
reporter, time system-stamped. **Captured nowhere:** severity, category, photos, due date,
assignee, resolution note, resolved-by, resolved-at (part-b:259–263).

### Count (part-a via pen-count.md)

Fourteen screens for one number — inventory and the full subtraction live in
`ux/checkin/pen-count.md` and are not repeated here. The load-bearing facts: default total
`T₀` opens balanced (`658:3316`, part-a:512–527); commit predicate
`记录栏位猪只总数 = 有身份猪只 + Σ(batch allocations)` with `提交` enabled iff exact
(part-a:491–500); floor `T ≥ I` by disabling `−` (`"记录栏位猪只总数" 小于等于
有身份猪只的数量时，则不可再[不可]继续减少`); batch rows are `− n +` steppers keyed
(生产线, 批次); trash needs no confirmation (`907:4986`); no reason, date, or author is
captured anywhere (pen-count.md "Not captured").

### Switch feed (feed-mobile)

Production/PRD has **no barn switch screen**. What exists: `phase_diet_switch_due` fires
when estimated days-on-formula approaches `phase_budget_duration_days` and routes to the
**Farm Manager** (§12.11, feed-mobile:166) — yet the physical changeover is a barn act. An
explicit `stocked_out` log **auto-fires the fallback formula immediately** (§12.8); fallback
activation is treated as a `formula_changed` event on any locked point (feed-mobile:154).
§12.8's inline "assign a substitute formula now?" prompt conflicts with §6 reserving formula
assignment to the Farm Manager — unresolved in the PRD (feed-mobile:88, :295). Formula
display names are farm-configured, console-enforced to ~14 characters (check-in.html:645).

### Pen note

No pen-scoped note exists in production. The nearest thing is the **unit** note `107:1694` —
a single shared text overwritten in place, stamped `上次修改：张华 2025/05/05`
(part-a:620). Note is already in the catalogue as Bulk (§05:983).

---

## 2 · Per-verb specification

Shared mechanics: every sheet is the 04 shell — subject header (`C3 · 13 pigs`), fields in
capture order, at most two actions, audit footnote. Blocked verbs are omitted, not greyed,
and counted in the not-available line (§05:934) — production's all-greyed drawer
(`854:3491 功能禁用态`, part-e:104) is the pattern this replaces. Record → back to the same
scroll position; the row updates where it sits; no toasts (§05:999).

### 2.1 · Report fault

Arity **Single** — "a fault names a device in this pen" (§06b:648, §05:987). With N>1 pens
ticked it drops to the not-available line (§06b:703). Container: **drawer** (3–4 fields).

| Field | Kit | Req | Notes |
|---|---|---|---|
| Device | Picker | * | Scoped to this pen's device list (production types 饲喂站 · 喝水站 · 其他 until an instance registry exists — see OQ3). Each picker row carries the device's status. A typed device already `故障` is not blocked: choosing it **opens its existing fault record** instead of a second form — production's dedupe rule (`不可重复上报故障`) kept as a redirect, not an error. `其他` always accepts a new report (`可以重复上报故障`) |
| ↳ Device name | Note (single line) | * | **Conditional reveal** when Device = 其他 — inline beneath its trigger, amber rule (§04:658). Production `设备名称 *` on `1574:4029`; matches 04's composition row "Picker→text(device name)* when type = other" (components.html:679) |
| Description | Note | * | Production `描述 *`, placeholder `请简单描述` (`1574:3988`). Required for every type — siding with the sheet over the stale annotation (part-b ambiguity 1) |
| Photos | Photos | — | **ADD — production captures none anywhere** (part-b:263). Justification: a fault is a claim about a physical object that a *different person* repairs later; the photo transmits "which fan, broken how" where free text demonstrably fails — production's own 其他 records identify devices by unstandardised free text (`风扇` / `栏位门` / `空调`, `1392:2929`), so the same fan can be filed under three spellings (part-b ambiguity 9). The kit field already exists ("evidence, up to 12, attaches to the event", §04:652–654); optional, never gating. What we still do **not** add: severity, category, assignee, due date — nothing in either production file consumes them, and a maintenance-dispatch workflow is out of scope. Production's omission of those is a subtraction to keep |

```
  ┌──────────────────────────────────────────────┐
  │                 ── grab ──                   │
  │  C3   Report fault                           │  subject header (04)
  │                                              │
  │  Device *              Drinking station  ›   │  Picker — this pen's devices
  │                                              │
  │  Device *              Other             ›   │  (when Other is picked:)
  │   ┃ ↳ Device name *                          │  conditional reveal,
  │   ┃   [ Fan, south wall              ]       │  amber rule (04)
  │                                              │
  │  Description *                               │
  │  [ chain jammed at hopper end            ]   │  Note
  │                                              │
  │  Photos                [▣] [▣] [ + ]         │  optional, ≤12
  │                                              │
  │  [            Report fault            ]      │  one action
  │        writes C3 · G. Hansen · 09:41         │  audit footnote
  └──────────────────────────────────────────────┘
```

Afterwards: the strip's wrench increments (`PEN C3 · 13 pigs · 49.8 kg ⚒2`, §06b:656); the
pen sheet grows a FAULTS row with the description quoted beneath (§06h:918–919); one history
line (`Fault · reported · jul 20 · G.H`, §06h:923). No toast.

### 2.2 · Resolve fault

Production has nothing to subtract — this is designed from the annotation alone. The verb
does **not** live on the verb sheet: **the record acts** (§06h:925 — "the fault line
chevrons into the fault's own record, where Resolve lives — the page reads, records act").

Reached from: the pen sheet's FAULTS row `›` (§06h:918); the unit sheet's
`Equipment — 2 faults ›` list (§06g:881); the fault-report picker's redirect (2.1).

The fault record = production's 异常详情 (`225:4803` / `1392:2929`) **merged with the act
it was missing**. Container: **drawer** (read block + ≤2 fields).

| Element | Kit | Req | Notes |
|---|---|---|---|
| Device · pen · description · photos · reported by/at | read-only | — | Exactly the fields production's detail sheets already show (part-b:199–204), plus the photos from 2.1 |
| Resolution note | Note | — | Optional — "what was done" is worth having, never worth gating. ADD (production captures no resolution data at all, part-b:263) |
| **Resolve** | primary action | — | Payload beyond the note: **nothing**. `resolved-by` and `resolved-at` stamp automatically, same grammar as every stamp (`set jul 14 · G.H`) |

```
  ┌──────────────────────────────────────────────┐
  │                 ── grab ──                   │
  │  C3   Fault · Drinking station               │
  │       reported jul 20 · G. Hansen            │
  │                                              │
  │  "chain jammed at hopper end"                │  read block
  │  [▣] [▣]                                     │
  │                                              │
  │  Resolution note                             │
  │  [ freed the chain, no parts needed      ]   │  optional
  │                                              │
  │  [              Resolve               ]      │
  │       stamps resolved · G.H · 09:41          │
  └──────────────────────────────────────────────┘
```

**N semantics — one record at a time, no bulk resolve.** Production's own rule
(`一条一条的解决`) survives on the merits: typed devices hold at most one open fault (the
dedupe rule), so bulk is moot there; 其他 records name *different physical objects* via free
text (fan, gate, air-conditioner), so one shared resolution payload would be a lie. The one
case bulk would serve — N repeat reports against the same physical 其他 device — is exactly
the case free-text naming makes unprovable (OQ3). Until a registry exists, resolving is
per-record.

Afterwards: the FAULTS row goes; when the section would be empty it prints `— none open` —
the one legal empty state, because the wrench's absence promised it (§06h:936, :941 rule).
History: `Fault resolved · drinking station · aug 25 · G.H`. The wrench count decrements.

### 2.3 · Set count

Arity **Single**, **untagged pens only** — for identified animals the count derives from
placement events and there is nothing to set; on a fully-identified pen the verb sits in the
not-available line (`not available — count derives`, §06b:648, :661). Mixed pens edit only
the un-identified remainder. Container: **drawer**.

This is `pen-count.md`'s subtraction (rows 1–23) turned into a sheet, with one amendment
(§3 below): the wizard, `提交`, both dialogs, the twin snapshot cards, and the toast are
gone; the total stepper, the batch allocation rows, the batch picker (minus its `确认`), and
the floor survive; a reason field is added.

**The identity, live.** `T = I + Σ(batch)` holds at every commit **by construction — at any
moment exactly one side carries steppers**, so no state can exist in which the equation
fails, which is what removes the submit button, the balance banners, and the blocked states
(`1797:1721` / `1799:1985`) in one move:

- `I` (identified head) prints, immovable — production's own rule: `+`/`−` only ever move
  the un-identified population (`658:3316`, part-a:526).
- **One batch row** (the common case — pen D5 is `38 pigs · no tags · batch 18`, §06h:946):
  the total and the row are the same number; moving either moves both.
- **N>1 batch rows:** a delta must name its batch, so the rows carry the steppers and TOTAL
  prints as the derived sum. (Production instead let the total float free and blocked commit
  until the farmer reconciled — the whole failure-state apparatus existed to police what
  derivation makes impossible.)
- **Floor:** each batch row's `−` disables at 0; the total's `−` disables at `T = I` —
  production's floor kept verbatim (`658:3316`).
- **Every stepper commits on change.** No 提交, no `数量更新` dialog (`570:1729` — a diff
  presented as a decision), no toast. The open sheet is one session; closing it seals **one**
  history event carrying the old → new pair as payload: `Count set · 40 → 38 · jul 14 · G.H`
  (§06h:955), which is `570:1729`'s sentence made a record.

| Field | Kit | Req | Notes |
|---|---|---|---|
| Head in pen (T) | Stepper | — | Commits on change. Editable only while ≤1 batch row; otherwise derived, printed mono |
| `↳ identified n` | read-only | — | The floor, printed with its meaning |
| Batch rows | Stepper per row | — | Keyed (line, batch), production's `− n +` kept (C6). Row `✕` only at 0 head — amended from production's any-value trash (`907:4986`), because with no `unallocated` state there is nowhere for orphaned head to go; a row at 0 also drops on close |
| `+ Add batch` | Multi-picker | — | Production's `559:1824` kept: line-scoped, already-allocated pinned + greyed (`1924:1784`). Its `确认` cut — ticking commits the row at 0 head. The `选择生产线` wheel (`559:1802`) collapses to a scope control inside the picker |
| Reason | Choice(4) | — | **ADD** — production captures none; `product-model` §4 says the event carries one. Appears once the session's net Δ ≠ 0, and the delta's **sign filters the list** (derive-everything): count went down → `Died unrecorded · Moved unrecorded · Miscount · Other`; went up → `Born unrecorded · Moved unrecorded · Miscount · Other`. Four options, inside the Choice law (2–4, §04:623 — the naive five-item list would breach it); `Other` reveals `Note *` inline (the conditional rule, same shape as Abortion). Optional at MVP: the steppers have already committed, so a required reason would reintroduce a gate — see OQ1 |

```
  ┌──────────────────────────────────────────────┐
  │                 ── grab ──                   │
  │  D5   Set count            38 head · no tags │
  │                                              │
  │  Head in pen        [ − ]    38    [ + ]     │  commits on change
  │   ↳ identified 3 — derives, floor            │  − disables at T = 3
  │                                              │
  │  BY BATCH · 35 untagged                      │
  │  line 1 · batch 18  [ − ]    23    [ + ]     │  N>1 rows → TOTAL above
  │  line 1 · batch 20  [ − ]    12    [ + ]  ✕  │  is derived; ✕ at 0 only
  │  + Add batch                              ›  │  picker, no 确认
  │                                              │
  │  REASON — down 2 since opening               │  appears when Δ ≠ 0
  │  (•) Died unrecorded    ( ) Moved unrecorded │
  │  ( ) Miscount           ( ) Other            │
  │   ┃ ↳ Note *  [                    ]         │  reveal on Other
  │                                              │
  │      no submit — closing seals the event     │
  │        Count set · 40 → 38 · G.H · 09:41     │  audit footnote
  └──────────────────────────────────────────────┘
```

Afterwards: the strip census re-reads (`PEN D5 · 38 pigs`); the pen sheet COUNT block is the
trail — `38 head · set jul 14 · G.H` / `was 40 · 1 death · 1 moved · since jul 14`
(§06h:947–949). No banner, no green ✓, no discrepancy state anywhere (§06b:661).

Selection nuance kept from production: ticking the un-identified **row** (not the pen) still
demands a head count via the inline stepper (`勾选单条数据时，若为无 ID 猪只，需立即填写无 ID
猪只数量`, `907:4178`, part-a:246–251) — that rule belongs to pig-verb selection and is
untouched by this sheet.

### 2.4 · Switch feed

The sheet's whole job is **WHEN + WHICH — two fields**, both doors, one component.
Container: **drawer**.

| Field | Kit | Req | Notes |
|---|---|---|---|
| Formula | Picker | * | Farm-configured names, console-enforced ~14 chars (check-in.html:645) — never a code letter. **Confirm door:** pre-filled with the scheduled target (`Nursery 2 → Grower 1`); leaving it is one glance. **Ad-hoc door:** empty — `Select` |
| Switched at | Measure (time) | * | Defaults to now. Editable **backwards only** — the overdue case (`due 1d ago` on the strip) is exactly when the pour happened before the tap, and this timestamp is the point variance anchors on: it closes the old formula's phase budget and starts the new one's (`formula_changed` semantics, feed-mobile:144–154; §12.11). Recording the tap-time instead of the pour-time would smear Tier-2 baselines by a day |

Two doors, different N:

- **Confirm switch — pen strip, Single, gated.** The tile exists only while a switch is due
  (§06b:648); until the due day the upcoming switch lives on the pen sheet as a countdown
  (`Switches to Finisher 1 · in 4 days`, §06h:934), then moves to the strip as the
  transition (`Nursery 2 → Grower 1`, §06b:658). Confirming writes the history line variance
  anchors on (§06h:941).
- **Switch feed — unit sheet, Bulk.** `Switch feed — batch 18 · due ›` runs the transition
  across every pen of the batch in one act; pre-filled when due, formula picker when ad hoc
  (§06g:880, :890). The unit sheet is the right door because a switch is Bulk and the unit
  is the subject there.

**What this verb is not:** a stockout. An explicit `stocked_out` log auto-fires the
configured fallback immediately and flags `formula_changed` on any locked point
(feed-mobile §12.8) — the silo event performs its own switch; nobody re-enters it here.

**Flag, not resolved here:** the ad-hoc picker puts formula assignment in a farm hand's
thumb, which §6 of the Feed PRD reserves for the Farm Manager — the PRD's own §12.8
inline-prompt conflict, unresolved in that document (feed-mobile:88, :183, :295). The sheet
is designed; the permission gate on the ad-hoc path is a product decision pending (OQ5).

### 2.5 · Pen note

Arity **Bulk** (§06b:648) — one payload to N ticked pens. Container: **drawer**.

| Field | Kit | Req | Notes |
|---|---|---|---|
| Note | Note | * | The event is the text; an empty note is nothing |
| Photos | Photos | — | Same evidence argument as 2.1, already in the kit |

An event, not production's overwrite-in-place shared unit note (`107:1694`, stamped
`上次修改：张华 2025/05/05` — the last writer erases the trail, part-a:620). Afterwards it
surfaces in exactly one place: the pen sheet's HISTORY tail (`Note · "gate latch sticky" ·
aug 25 · G.H`, §06h:920) — never on the strip, which carries derived counts and the feed
slot only (§06b:647 "deliberately absent" list). The **unit** note stays a separate field on
the check-in sheet (§06g:879).

---

## 3 · Subtraction table

Count rows 1–23 are already judged in `ux/checkin/pen-count.md` and stand, with one
amendment recorded first.

| # | Production element | Verdict | Justification |
|---|---|---|---|
| 0 | pen-count.md row 2's **persistable `unallocated` count** | **SUPERSEDED** | §06b:661 ruled harder: *no discrepancy state at all*. The identity survives by making one side derived (2.3) instead of by persisting a residual. Row 2's real payload — no submit, no blocked state — is kept; the new signal it promised is given up, which is the price of "one number, one source of truth" |
| 1 | 设备列表 as a screen (`580:2242` / `337:1020`) | **CUT as a door, KEEP the data** | The pen's device list lives inside the fault sheet's Picker and the pen sheet's FAULTS section; the unit's, behind the unit sheet's Equipment row (§06g:881). A list-screen existed because the verbs were bottom buttons needing a selection surface; selection already names the subject in our model, and the device is named *inside* the sheet |
| 2 | Bottom bar `上报故障` / `解决故障` (`1388:2514`, layer-named `废弃`) | **CUT** | Production itself marked the bar deprecated (part-b ambiguity 2). Report moves to the verb sheet's PEN strip; Resolve moves onto the record |
| 3 | Mixed-selection rule (`同时选择"正常、故障"…两个按钮均禁用`) | **CUT** | Dissolves with device multi-select. One report names one device (Single); resolve is per-record |
| 4 | Device multi-select checkboxes + the N>1 report ambiguity (part-b #7) | **CUT** | Single arity answers the question production left open — both drawn sheets only ever rendered one device card anyway |
| 5 | 筛选 sheet (`571:4757` — 设备类型/状态/栏位) | **CUT** | A pen holds a handful of devices; the unit's fault list is already scoped to faults (`2 faults`). A filter over single digits is ceremony |
| 6 | Duplicate-report block for typed devices (`不可重复上报故障`) | **KEEP as a redirect** | The picker shows the open fault and choosing the device opens its record — the rule enforced by architecture instead of a dead-end error. 其他's repeat-reports rule kept as-is |
| 7 | `描述 *` required (`1574:3988`) | **KEEP** | The one field production got right. The stale `不需要填写备注` annotation (`928:2008`) is CUT — superseded by the newer sheet (part-b ambiguity 1) |
| 8 | `设备名称 *` when 其他 (`1574:4029`) | **KEEP** | As the conditional reveal — already canonised in 04's composition table (components.html:679) |
| 9 | 异常详情 read-only sheets (`225:4803` / `1392:2929`) | **MERGE into the fault record** | Same fields, plus the act they were missing. "The page reads, records act" (§06h:925). Their per-record card structure survives as FAULTS rows |
| 10 | Status chip as the detail affordance (arrows `1397:3211/3212`) | **MERGE** | The chevroned FAULTS row and the wrench are the doors; a tappable status word inside a row is a hidden affordance |
| 11 | `操作成功` toast (`591:4283`) | **CUT** | The wrench count and the FAULTS row updating in place are the feedback |
| 12 | Device search field `设备名称` (`580:2245`) | **CUT** | The Picker searches its own list; three-to-a-handful devices per pen need no standing search bar |
| 13 | 解决故障 flow | **ADD** | No screen exists (part-b ambiguity 3). Designed in 2.2: record + optional note + automatic stamps |
| 14 | Resolution note, resolved-by, resolved-at | **ADD** | Captured nowhere in production (part-b:263); the stamps are free (event model), the note optional |
| 15 | Photos on fault and note | **ADD** | Kit field, optional, evidence for the person who fixes it later (2.1). Production has no photo capture anywhere in the equipment cluster or the Feed PRD (feed-mobile:263) |
| 16 | Severity · category · assignee · due date | **KEEP OUT** | Production omits them and nothing consumes them; adding any would smuggle in a maintenance-dispatch product |
| 17 | Batch-row trash at any value (`删除批次无需二次确认`, `907:4986`) | **AMEND** | `✕` only at 0 head; with no unallocated state, deleting a non-empty allocation would orphan head silently. Steppering to 0 first *is* the confirmation |
| 18 | Reason for a count change | **ADD** | Direction-filtered Choice(4) + Other→Note (2.3). Production captures nothing; `product-model` §4 expects it |
| 19 | `phase_diet_switch_due` routed to Farm Manager only (§12.11) | **AMEND (surface)** | The due state must reach the barn — it does, as the strip transition + gated Confirm tile + unit sheet pre-fill. The Review-Inbox routing itself is untouched |
| 20 | All-disabled drawer (`854:3491 功能禁用态`) | **CUT (pattern)** | Blocked verbs are omitted and counted in the not-available line (§05:934), never greyed en masse |
| 21 | Shared overwrite unit note (`107:1694`) | **REPLACED at pen scope** | Pen note is an append-only event with a stamp; the overwrite pattern erased its own trail |

---

## 4 · Open questions

1. **Is the count reason required, and is the list right?** (pen-count.md OQ2, narrowed.)
   Proposed: optional, direction-filtered Choice(4) with `Other → Note *`. Requiring it
   would reintroduce a gate after steppers already committed — the alternative is holding
   the session event open until a reason lands, which is a submit button wearing a hat.
   Needs a product call, and barn validation of the four labels.
2. **Total-edit at N>1 batch rows.** Specced: the total goes derived and the rows carry the
   steppers (a delta must name its batch). Alternative rejected but recordable: total stays
   editable and the delta lands on the last-touched row — fewer taps, silent misallocation.
3. **The 其他 registry problem** (part-b ambiguity 9). Free-text `设备名称` means repeat
   reports on the same fan are unlinkable, which is also what blocks any same-device bulk
   resolve. §06h's mock names `Feeder FD-102` — implying registered device *instances*,
   where production has only three *types* per pen. Promoting recurring names to console-
   registered devices is the fix; console scope.
4. **Ad-hoc per-pen switch has no door.** Confirm switch is gated to the due window
   (§06b:648); ad hoc lives on the unit sheet as Bulk (§06g:890, "per-pen remains possible
   from any strip" — true only while due). If one pen must deviate from its batch off-cycle,
   either the gate widens or the unit sheet's act takes a pen scope. Flagged.
5. **§12.8 vs §6 permission conflict** — a farm hand assigning a formula via the ad-hoc
   picker vs the PRD reserving assignment to the Farm Manager. Unresolved in the PRD
   (feed-mobile:295); the sheet works either way, the gate is policy.
6. **The drawer/page line** is still open in components §05 (components.html:1007). All five
   verbs here fall at ≤5 fields → drawer under the working rule; nothing in this cluster
   forces the decision.
7. **Missing-report ↔ count interaction** (pen-count.md OQ3) — does the total drop on
   report or on resolution from `工具箱 → 失踪列表`? Unchanged, still open, still blocks the
   trail line's arithmetic (`was 40 · 1 death · 1 moved`).
8. **Batch picker scope** (pen-count.md OQ7) — hard line-scoped filter
   (`只能搜到所选的生产线里的批次`, `575:1965`) vs global search with the line as a trailing
   token. Kept line-scoped here per production; unverified.
