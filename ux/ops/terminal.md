# Terminal cluster — Report death · Cull recommendation

Ops-cluster spec. Reached from the verb sheet (components.html 05) after selecting 1..N pigs or a
group row of un-identified head. Binding context: components.html 04 (field kit) + 05 (arity, the
Death tile), check-in.html 06d/06e (row grammar, marks), product-model.html §4/§5,
consolidation-plan.html §2 (Fan-out), §4 (supersession), §7 (triage domain). Production:
inspection/part-d.md 上报死亡; tasks/farrowing.html + piglet-processing.html (litter death);
tasks/postpartum.html + inspection/part-c2.md (淘汰建议). No HTML here — flows are ASCII.

---

## 1 · Production inventory

### 上报死亡 (Report death) — inspection, part-d.md:310–393

The only health operation with per-pig data — "bulk selection, individual detail"
(pig-actions.html:141; product-model.html:168, Law 2's third clause).

| Screen | Node | What it is |
|---|---|---|
| 死亡列表 (default) | 290:1515 | The death worksheet: pigs grouped by pen (`栏位号 A1`), per-pig sub-card `死亡原因` (pencil-editable, e.g. `发烧，感冒`) + `附件照片` (`无` or thumbnails), header `共 10 头猪`, single `提交` footer (part-d.md:312–328) |
| 添加死亡原因 (cause picker) | 290:1352 / 290:1422 | Tabs `疾病`/`症状`, search (`疾病名称`/`症状名称` — the only Part-D picker with search), grouped accordion (`呼吸系统`·`胃肠道`·`繁殖与新生仔猪`·`神经系统`; `综合`·`四肢`), footer `已选择 1 种疾病，2 项症状` (part-d.md:337–351). "Cause of death is drawn from the **same disease + symptom vocabulary** as the rest of the cluster — a cause can be a symptom" (350–351) |
| 已选死亡原因 | 290:1478 | Review/delete chosen causes; no confirm button; `四肢` group rendered twice (mock artefact) (353–358) |
| 批量操作：添加死亡原因 | 290:1639 | Selection mode over the death list — `请选择要添加死亡原因的猪只`, three-level checkboxes, `添加死亡原因` fans one cause set to the subset (360–367) |
| 批量操作：上传照片 | 290:1793 | Same scaffolding for photos — `请选择要上传照片的猪只` (369–378) |
| 二次确认 | 1506:2292 | `有 n/5 头猪只未添加死亡原因，确认要继续提交吗?` → `取消`/`继续提交`. "This proves cause of death is NOT mandatory — a soft, dismissible warning"; `n/5` shipped as a literal placeholder (382–387, 492) |
| 操作结果 | 1506:2313 | `操作成功` toast, no undo, no partial-failure state (388, 449–451) |

Fields: `死亡原因` per pig, optional, "may be pre-filled from the pig's recorded conditions"
(part-d.md:334); `附件照片` per pig, no max stated in the death flow (335) while the condition flow
states `最多可上传 12 张照片` (422–423). Entry: health drawer 853:2120 row 5 `上报死亡`, the one
`skull` icon in the menu (part-d.md:61). Scan inside the flow adds to the selection without
switching scope (pig-actions.html:167–168). Eligibility: "always" (pig-actions.html:196).

### Litter death — tasks, count-based

- farrowing.html:88 — `Piglet death 上报死亡 | count + cause | Post-farrow only; flow shared with
  piglet task`. Overflow row on 更多操作 1560:21065; gate annotation 1567:21399: before farrowing
  the death button is hidden (farrowing.html:40).
- piglet-processing.html:52, 102 — same overflow row; "the flows live with the litter, not the
  task". No per-piglet identity is involved: the payload is a count and a cause.
- Born-dead is not this event: farrowing's own five steppers capture `死胎`/`木乃伊` as birth
  outcomes (farrowing.html:41).
- The count trail is already our display model: pen sheet `was 40 · 1 death · 1 moved`
  (check-in.html:949).

### 淘汰建议 (Cull recommendation) — no standalone mobile flow exists

Production has no cull verb. The recommendation exists only as a field inside two assessments:

- Postpartum: `淘汰建议: 不建议淘汰 / 建议淘汰`; choosing 建议淘汰 reveals conditional free text
  `请填写建议淘汰原因` (postpartum.html:36–37, 63, 153; screens.html:1011 renders it as a
  No/Recommend segment). Whether the reason is mandatory is unresolved in production
  (postpartum.html:185).
- Weaning sow status: same two options (part-c2.md:209); the weaning summary shows it as a derived
  read-only row `是否淘汰 · 不建议淘汰` (part-c2.md:136); it rides the weaning consequence row
  (part-c2.md:411).
- Postpartum's ended-task filters include `淘汰建议` (cull recommended) as an audit dimension
  (postpartum.html:98, 157).
- Execution has no mobile surface anywhere. The nearest thing is console batch disposal of
  un-farrowed sows at task end (farrowing.html:44, 189) — explicitly relocated to console.

---

## 2 · Report death — the spec

### Arity and the review model (design question 1)

Death is **Conveyor**: "cause and photos are per animal — so a bulk death is N sheets, and the
friction that protects it is structural rather than a warning dialog bolted on"
(components.html:991; product-model.html:140, 168). Consolidation classifies the same event
**Fan-out**: "one selection, a per-animal payload, with batch helpers to fill many at once"
(consolidation-plan.html:84). These are not in conflict — they name the two halves of one flow,
and the review model is their synthesis:

**Decision: N>1 opens on a roster — an entry review list — then runs the per-pig sheet chain.**

Reasoning:

1. **Each death commits on its own Confirm.** Sheets commit themselves (the standing law;
   consolidation-plan.html:74) and no submit button exists anywhere in the product
   (product-model.html:235). So there is no batch rollback: an error discovered at sheet 12 has
   already recorded 11 deaths. Production could afford to protect the *end* of the flow (the
   1506:2292 warning before one big `提交`) because nothing was written until then. We cannot —
   our protection must move to the **front**, before the first commit.
2. **The roster is the only moment the whole N is readable as names.** A fat-finger 40-pig
   selection surfaces as forty rows before any sheet opens; "40 pigs · 3 pens" in a sheet header
   does not.
3. **It is where partial eligibility already lives.** Law 3: "list the blocked animals with the
   reason, and let the farmer proceed with the remainder deliberately"
   (product-model.html:177–179). The roster hosts that list without a new component.
4. **It is production's own shape, corrected.** The 死亡列表 was a review list; its read-only
   `已选猪只` header ("cannot deselect", part-d.md:408) becomes a roster with per-row remove.

The roster commits nothing. It exists only at N>1; at N=1 the record sheet's subject header is
the review (one name, one pen — components.html:612).

```
selection: 3 ticked → verb sheet → DEATH (red-outline tile, last health verb)
        │
        ▼
┌─ REPORT DEATH · 3 pigs ──────────────────┐   the roster — nothing committed yet
│  A2 · 000254 · parity 3              ✕   │   every name visible before any
│  A2 · 000268 · parity 1 · lame 4d    ✕   │   sheet opens; ✕ removes a row
│  C1 · 001479 · gilt · 232d           ✕   │
│  ──────────────────────────────────────  │
│  (blocked pigs, if any, listed w/ reason)│   Law 3 — proceed deliberately
│  [ Cancel ]            [ Start · 3 ]     │
└──────────────────────────────────────────┘
        ▼
┌─ DEATH · 000254 ─────────────── 1 of 3 ──┐   the conveyor, per-pig sheet
│  A2 · 000254 · parity 3                  │
│  Cause · diseases      2 selected    ›   │   Multi-picker; her open conditions
│  Cause · symptoms      1 selected    ›   │   pre-selected, full catalogue open
│  Photos   [▦][▦][+]                      │   up to 12
│  [ Skip ]           [ Confirm & next ]   │   Confirm commits THIS death, now
│  next: 000268 · skipped 0                │
└──────────────────────────────────────────┘
        ▼  … sheet 3 of 3: [ Skip & finish ] [ Confirm & finish ]
list · selection cleared · rows gone · each pen count −1
```

Commit, skip, finish-early — stated plainly:

- **Commit**: each `Confirm & next` writes that pig's death event immediately. There is no batch,
  no draft, no rollback. The footnote carries the conveyor hint (`next: 000268`) per the shell
  rules (components.html:612).
- **Skip**: advances without recording — she stays alive, untouched. Skip is *not* "death with
  unknown cause"; an empty cause still commits a death (below).
- **Finish early**: leaving the run (back / ✕) ends it. Committed deaths stand; remaining pigs
  are untouched. Nothing is discarded because nothing was draft — the leave-guard production drew
  for remove/recover (591:3991) has nothing to guard here.
- **Carry-forward** replaces production's two batch-helper modes (290:1639, 290:1793): each new
  sheet pre-fills its cause set from the previous sheet's, editable. One pen going down with
  scours is N confirms, not N picker sessions — the fan-out's "batch helper," rebuilt as a
  pre-fill instead of a mode.

### Group-row death — the count sheet (design question 2)

A group row is *N head*, not N animals; ticking it already asked **how many** via the inline
stepper — production's own rule `勾选单条数据时，若为无ID猪只，需立即填写无ID猪只数量`
(check-in.html:781; product-model.html:193). For identity-less head **the subject is the count**,
so death is one record sheet per (group × cause) — never a conveyor, because there is no
individual to convey through. This is the production litter flow generalised: `count + cause`
(farrowing.html:88), and it is what the pen sheet already displays (`was 40 · 1 death`,
check-in.html:949).

```
group row: 38 pigs · no tags · D4 — ticked, stepper set to 2
        │  verb sheet → DEATH
        ▼
┌─ DEATH · 2 head · pen D4 ────────────────┐   one sheet, commits once
│  38 head · no tags · in jul 14           │
│  Died      [ −   2   + ]                 │   pre-filled from the tick stepper
│  Cause · diseases      1 selected    ›   │   the pen's open group conditions
│  Cause · symptoms      none          ›   │   pre-selected (scours · 2 treated)
│  Photos   [+]                            │
│  [ Record 2 deaths ]                     │
│  count 38 → 36 · one cause per record    │
└──────────────────────────────────────────┘
```

**The rule that picks the shape: the selection type decides, never a toggle.** Tagged pigs →
conveyor (per-pig payload). A group row → count sheet (the count is the payload's subject). It is
Law 2 read against the identity model (product-model.html:164–169, 193): arity asks whether the
payload is per subject; where heads have no identity there is no per-subject, so the per-pig law
collapses to one sheet. A mixed selection composes: the roster lists tagged pigs as rows and each
ticked group as one `n head · pen` row; the conveyor visits them in list order, tagged sheets and
count sheets alike. Deaths with two causes inside one group are two events — two passes, each one
sheet; no per-head fiction is ever invented.

### Cause anatomy and container (design question 3)

- **Cause = Multi-picker(disease) + Multi-picker(symptom)** — the kit controls
  (components.html:645–648), over the same catalogue as condition and treatment; a cause can be a
  symptom (part-d.md:350–351). **Scoping**: the pickers open on the full catalogue with the pig's
  open conditions pre-selected — production's pre-fill (part-d.md:334) kept, but never
  hard-scoped the way treatment targets are (components.html:724), because a pig can die of
  something never recorded. Group sheets pre-select the group's open condition entries.
- **Unknown is legal.** Cause is optional; committing with an empty cause records
  `death · cause unknown`. Production proves the domain need (1506:2292 soft-warns and lets
  `继续提交` through); we drop the dialog — the empty picker reading `None` on a death sheet is
  the farmer's own review, and the history line carries `cause unknown` honestly.
- **Photos**: the kit field, up to 12, attaches to the event (components.html:652–654). The death
  flow's unstated limit unifies to the kit's 12.
- **No Note field.** Production's death flow captures cause + photos only; anything more belongs
  to the condition history that led here. (Subtraction, not omission — see §3.)
- **Container** — per the open drawer/page line (components.html:1007), flagged, not relitigated:
  death at N=1 is 3 fields → **drawer**; the group count sheet is 4 fields → **drawer**; the
  N>1 conveyor (roster + chain) is **pages** ("conveyor runs and composites are pages either
  way").

---

## 2b · Cull recommendation — the spec

### What it is

A **recommendation, not an act** — "you do not triage an animal as *euthanize* and leave her
there — it is a decision pending execution, which is the existing Cull recommendation verb"
(check-in.html:809). Consolidation's euthanize triage level (consolidation-plan.html:215) landed
here instead. It is a mark in the 06e sense: it creates a filterable set that someone drains;
"triage never performs the act itself" (check-in.html:819).

### Payload and arity

- **Arity: Bulk** — one payload, N pigs (components.html:983 lists `cull` in the Bulk column).
  One sheet regardless of N; no roster, because nothing commits per animal and nothing is
  terminal yet — withdrawing a recommendation is one supersession, not a resurrection.
- **Payload: reason, free text (Note), optional.** Derived from production's only cull fields:
  `淘汰建议 不建议淘汰/建议淘汰` + conditional `请填写建议淘汰原因` (postpartum.html:36–37,
  63; part-c2.md:209). Production never resolved whether the reason is mandatory
  (postpartum.html:185); we keep it optional and flag the catalogue question (§4).
- The postpartum and weaning assessments keep their 淘汰建议 field — it writes **the same
  cull-rec event** (Law 4, one record two doors). The standalone verb is the walk's door to it.

```
selection: 3 sows → verb sheet → CULL (Health strip, tile, beside Death)
        ▼
┌─ CULL RECOMMENDATION · 3 pigs ───────────┐
│  3 pigs · selected · A2                  │
│  Reason (optional)                       │
│  [ prolapse risk · parity 7…          ]  │   Note — free text
│  [ Recommend for 3 pigs ]                │
│  a mark — nothing moves until executed   │
└──────────────────────────────────────────┘
```

Placement: a tile in the Health strip, immediately before Death — the terminal pair sits
together, recommendation then act, and "Death is the last health verb" (components.html:933)
holds. On a pig already carrying a recommendation the same sheet shows it (`recommended jul 22 ·
G.H · reason…`) and offers **Withdraw** — a superseding event, kept in history, exactly the 留种
mark/unmark shape.

### The pending state (design question 4)

Cross-checked against 06d/06e: the dot is urgency on an open **case**, and "pending is the dot
itself — a dot with no done-trail is the unexecuted mark" (check-in.html:749, 763). A cull rec is
not a case and has no urgency rank, so it must not claim a dot. What was *done* is the
recommendation itself, so it prints where done things print — **the line-2 trail slot, aging**:

    000287   Weaned · 12 days ago
             parity 7 · cull rec · 3d

The gap needs no token of its own (the zero rule): an aging `cull rec · Nd` on a row still in the
list *is* the unexecuted state, and execution removes the row entirely — so no "executed" variant
ever prints. The set is filterable (production already filters ended tasks by 淘汰建议,
postpartum.html:157; the filter chip moves to the live list per postpartum.html:98).

### Who executes

The mark is drained the way 06e drains marks — "filter to marked → select → the existing model"
(check-in.html:819):

- **On-farm euthanasia** → the **Death** verb, exactly as specified above; the death record is
  the execution and the rec closes with it.
- **Removal for sale/transport** → a second terminal event (`left the herd · culled`) with **no
  mobile flow in production** — the console owns batch disposal today (farrowing.html:44, 189).
  Deliberately not designed here; the terminal band already anticipates the wording
  (components.html:1072 shows the band's grammar). Open question §4.
- Escalation ("escalates to a supervisor per farm policy", consolidation-plan.html:215) is a
  notification concern, not a sheet — open question.

---

## 2c · After death (design question 5)

One paragraph, consequences only, no new design. The event is terminal: she "leaves everything,
removed from every task cohort" (consolidation-plan.html:137), and every watching task re-derives
by construction (product-model.html:63–70). Her pen count decrements, and for un-identified head
the decrement lands in the count's own trail — `was 40 · 1 death` set against the last calibrated
count (check-in.html:947–949) — which also re-derives the pen's feed total (per-head × count).
Her batch exit is the same re-derivation, and if she was mid-task the task's lens counts move
without ceremony. Her page survives her: scanning the tag opens the page, not a selection — "no
verb sheet rises and no verbs render. The terminal band leads (`✕ left the herd · died aug 02`),
the state sections freeze at her final state, and history remains whole. 'On farm' is never a
field; departure is a state the page wears" (components.html:1072, 1079). Supersession runs in
one direction only: the death record beats everything — open cases freeze under it, a pending
cull rec is closed by it, later contradicting records cannot occur because no surface can select
her — and the sole way back is the deliberate mis-entry correction, 移除 as supersession
("that was never true, I mis-tapped", consolidation-plan.html:143–155), after which state, batch
and counts re-derive again from the corrected truth.

---

## 3 · Subtraction table

| Production had | Node | We ship | Why |
|---|---|---|---|
| One big `提交` over the whole death list, disabled until valid | 290:1515 | Per-pig `Confirm & next`; no terminal submit | No submit button exists anywhere (product-model.html:235); sheets commit themselves |
| Soft-warn dialog `有 n/5 头猪只未添加死亡原因，确认要继续提交吗?` | 1506:2292 | Nothing at the end; the roster at the front | Protection must precede the first commit once commits are per-pig; the friction is structural (components.html:991) |
| Batch modes 批量添加死亡原因 / 批量上传照片 with 3-level checkboxes | 290:1639 / 290:1793 | Cause carry-forward, sheet to sheet, editable | Same job — shared causes are common — without a second selection model inside a flow |
| 已选死亡原因 review screen (no confirm, duplicated `四肢` group) | 290:1478 | The Multi-picker's own selected view | Kit already owns it (components.html:645–648) |
| Read-only `已选 N 头猪 · 查看` header — "cannot deselect" | part-d.md:408 | The roster, with per-row ✕ | A review that cannot edit is a receipt, not a review |
| `操作成功` toast, no undo, no partial state | 1506:2313 | Row disappears in place; counts move | The walk never loses its place (components.html:999) |
| Death hidden by task stage (`分娩前…隐藏`) | farrowing.html:40, 1567:21399 | Gate on the animal: live piglets exist → litter death exists | Law 3 — the animal's state decides, never the surface |
| Cull rec buried as an assessment field only | postpartum 1000:15683 · part-c2.md:209 | Also a standalone Bulk verb; the assessments write the same event | Law 4 — one record, two doors |
| Euthanize proposed as a triage level | consolidation-plan.html:215 | Not a level (check-in.html:809); cull rec + Death execution | A level you must execute is a pending decision, not a state |
| Death-flow photos with no stated limit | part-d.md:335 | Kit cap, 12 | One Photos field everywhere (components.html:652) |
| Free-text cause? Never offered — cause was picker-only, but optional silently | part-d.md:334, 383 | Same optionality, made honest: empty commits as `cause unknown` | The record says what is known, not what a dialog extracted |
| `占位` placeholder slots, pencil present/absent per row | part-d.md:318, 490 | — | Mock debris, nothing to keep |

---

## 4 · Open questions

1. **Cull reason: free text vs catalogue.** Production is free text (`请填写建议淘汰原因`).
   Reporting will want aggregation (parity, reproductive failure, lameness, prolapse…). A
   farm-configurable reason catalogue behind a Picker is the likely end state — needs the domain
   list before it earns a control.
2. **Cull eligibility.** 淘汰 is a breeding-herd word; growers are 出栏 (marketed), not culled.
   Proposed gate: identified breeding stock (sow/gilt/boar) only — group rows never show Cull.
   Validate with the domain before the not-available copy is written.
3. **The second terminal event.** `left the herd · culled/sold` has no mobile flow and no design;
   console owns disposal today (farrowing.html:189). Decide owner (console vs toolbox vs a future
   removal verb) — until then a cull rec is only ever executed on-farm via Death.
4. **Supervisor escalation.** consolidation-plan.html:215 implies cull/euthanasia escalates per
   farm policy. Notification model undesigned product-wide.
5. **Trail-slot contention.** Line 2 holds one trail token (check-in.html:749). `cull rec · 3d`
   vs `treated 3d` on the same sow — proposed: the terminal decision wins; needs barn testing
   alongside 06d's chip-contention rule ("the instruction wins").
6. **Group death vs the count.** `Died n` where n equals or exceeds the group's current count
   should hand off to count correction (Reconciliation), not commit blindly — the boundary
   between the two events needs a rule.
7. **Mis-entry undo for a committed death.** 移除-as-supersession is defined for conditions
   (consolidation-plan.html:154); the correction path for a terminal event (from the frozen pig
   page? console only?) is unplaced.
8. **`cause unknown` display.** Exact history-line and report token for an empty cause — copy
   decision, flagged for the same pass as the 流产 wording (components.html:1009).
