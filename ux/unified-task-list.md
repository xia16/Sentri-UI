# The Unified Task List — analysis & interaction spec

> **⚠ Historical working document.** Several mechanisms below were superseded during
> design: there is **no round submit / certification**, **no per-pen assertions**,
> **no within-one-pen selection limit**, and pen headers never show "submitted".
> The canonical, current system is `ux/task-screens.html` (laws in sections 01b/02b
> and the contract table). Read this file for the original task models only.

Working document. Source: the 20 production screenshots in `Task references/`
(heat check, breeding, return-heat check, pregnancy check, farrowing, postpartum
check, weaning check, piglet processing), read screen by screen, modeled from the
worker-in-the-pen perspective.

---

## 1 · Task models — what each task actually is in the barn

The unit of thought throughout is: *a worker walks a room pen by pen, makes a
judgment per animal (or per litter), records it with one gloved thumb, and at the
end of the walk certifies the round as done.*

| Task | Cadence | Unit | Judgment / record | Branches | Completion semantics |
|---|---|---|---|---|---|
| 查情 Heat check | 1–2×/day (set per farm) | sow | signs-of-heat / in-heat | in-heat → breeding task spawns | round submit; unmarked = checked-negative (see §4) |
| 配种 Breeding | event-driven, per-sow sequence | sow | confirm mating n of N + semen batch | interval-too-long warning; extra mating | per-sow sequence completes; round submit |
| 返情检查 Return-heat check | daily during day ~18–24 window | sow | signs / returned (= not pregnant, negative outcome) | returned → rebreed flow | round submit; day-dots progress |
| 孕检 Pregnancy check | scheduled, day 1..3 of unit sweep | sow | not-pregnant / uncertain / pregnant | uncertain → auto re-check in 3d; not-pregnant → rebreed | round submit; unchecked carries to next day |
| 分娩 Farrowing | event window per sow (due date) | sow | incremental counters: healthy/weak/deformed/stillborn/mummified + last-birth interval | 45-min interval alert; continue vs. final | **multi-session**: record repeatedly until "final" |
| 母猪产后检查 Postpartum check | scheduled days post-farrow | sow | assessment form: BCS 1–5, mastitis, milk, discharge, feeding, mobility, backfat, notes, cull rec | abnormal → symptom/disease record | per-sow submit |
| 断奶检查 Weaning check | weaning day | **pen/litter** | compound: litter info (count, sex, kept, weight) + sow status (assessment form) | cull recommendation | per-pen submit |
| 仔猪处理 Piglet processing | age-day schedule (1/2/3/5/7日龄) | **pen/litter** | checklist per age-day: treatments (checkbox) + ear-tag/notch/weight (sub-form) | pre-fill allowed for future days | per-day submit; icons show pending treatments |

Recurring facts the current screens already encode (keep — they are right):

- **Pen-grouped rows always**; pen headers carry submitted / not-submitted state.
- **Row anatomy is constant**: mono tag · state icon+label with time qualifier
  (`预计发情：5天后`, `超出预产期1天`) · one trailing action.
- **Three trailing-action meanings**: filled green arrow = act now; light arrow =
  open/view; pencil = done-but-editable.
- **Temporal state grammar**: upcoming (clock, "in N days") → window open (green
  play) → signs (amber) → terminal (done ✓ / negative ⊖ red). Plus a real
  data-missing state (`获取不到状态`) — surface it honestly, never hide it.
- **Special groups exist**: 未定位 (unlocated animals), and pens with *no* task
  (`A4（无仔猪处理任务）`) still listed for physical completeness.
- **Attribution everywhere**: recorded-by + timestamp on every record.
- **Warnings are inline and factual** (mating interval 5h — too long; 45 min
  since last piglet), never modal.

What the current screens are missing (the user-identified gaps this spec fills):

1. No **view toggle** — one target list only; "already marked" lives behind a
   separate link; no "all pigs in pen order" view that matches the physical room.
2. No **multi-select** — heat check is one sheet per sow, brutal at 2×/day × 200.
3. **Submit semantics undefined** — what does submitting a round with unmarked
   pigs assert? Compliance depends on this being explicit.
4. No **focus logic** — the list doesn't privilege "which pens still need me."

---

## 2 · The unified list — one grammar, per-task configuration

Every task screen is this component, configured, never forked:

```
┌────────────────────────────────────┐
│ ← Task name · Room     [Task info] │  scope: task · location · round
│ ROUND / PROGRESS CARD              │  day n/N or session · unit progress
│                                    │  · last action attribution
│ [ Focus 14 ] [ Done 32 ] [ All ]   │  ← THE VIEW TOGGLE (new)
│ Search 🔍 · Filter · List/Map      │
│────────────────────────────────────│
│ PEN A1 ──────────── 2 to go ▾      │  pen group, physical order
│  000268  needs check      [→]      │  row: tag · state · action
│  000231  recheck · 3d      →       │
│ PEN A2 ──────────── ✓ done ▸       │  zero-focus pens collapse
│ PEN A3 ─────────── submitted ▸     │
│────────────────────────────────────│
│ [⋯]  [ Submit round · 14 left ]    │  round bar (sticky)
└────────────────────────────────────┘
```

### The view toggle (segmented, below progress — the user's core ask)

| View | Contents | Order | Purpose |
|---|---|---|---|
| **Focus** (default) | animals whose window is open, overdue, or showing signs — "needs my judgment this round" | pen physical order | the walk: which pens do I still enter |
| **Done** | everything dispositioned this round, with disposition shown; edit/undo until round submit | recency or pen order | trust check: what did I already mark |
| **All** | every animal in every pen of the room, cohort or not; non-cohort dimmed with their current lifecycle state; 未定位 pinned top | strict pen physical order | matches the physical room; answers "what is this pig in front of me" |

Counts on each segment. Focus empty = round complete state, big and obvious.

### Disposition interaction — three tiers, chosen per task

- **T1 · Quick-mark (binary/ternary judgments):** heat check, return-heat,
  pregnancy check. Single tap on the row's disposition chip for the common
  positive; **multi-select** for batches: enter via select button or long-press,
  check rows, bulk action bar appears bottom (e.g. "Mark in heat · 3"). Selection
  is **within one pen at a time** — matches the eyes-on-animals reality, prevents
  cross-pen fat-fingers. The choice sheet (T2) remains available per row for the
  non-default option.
- **T2 · Choice sheet (choices need context):** the current bottom-sheet pattern,
  kept: sow header, radio cards with status icons, confirm. Add **"Confirm & next"**
  — advances to the next Focus animal in the same pen, then next pen; the sheet
  becomes a conveyor and the phone never leaves the hand.
- **T3 · Stateful record (multi-field or multi-session):** farrowing counters,
  postpartum/weaning assessment forms, piglet age-day checklists. Full sheet or
  page; own internal grammar (steppers, segmented scales, checklist rows) but the
  same header anatomy (pen chip · tag · vitals) and the same submit bar.

### Round & compliance semantics (the batch question)

- A **round** is a first-class object: task × room × session (heat check 2×/day →
  AM and PM rounds, per farm setting). The progress card names it; history keeps it.
- Records save **locally per animal immediately** (nothing lost walking between
  barns, offline-first with sync pill), but the round is **certified by one
  explicit submit**. Compliance reporting counts certified rounds, not row edits.
- **No pen-level assertions (superseded design):** an earlier draft had a per-pen
  "nothing to report" checkpoint; it was rejected — pen headers only aggregate row
  facts, never attest. Unmarked animals simply keep their state; the absence of a
  mark plus recorded check activity is the compliance story.
- Submit with unmarked pens → the bar says exactly what will be asserted
  ("2 pens unconfirmed — they stay open for the PM round"). Nothing implicit.
- After submit, rows lock to edit-with-audit (pencil), pen headers show submitted.

### What stays per-task (configuration, not forks)

Disposition taxonomy + icons; progress metric (count / cumulative-vs-target /
day-dots); round cadence; unit (sow vs pen/litter — weaning and piglet processing
group by pen with the litter as the row); T-tier per disposition; spawn rules
(in-heat → breeding sequence; uncertain → recheck row in 3d; returned → rebreed).

---

## 3 · Why this fits the barn (walk-through test)

Morning heat check, Room 1, 46 sows, 8 pens: worker opens task → Focus shows 5
pens needing eyes (3 pens collapsed, nothing due). Walks to A2 — 6 sows listed in
physical order. Two show standing heat: select both → "Mark in heat". One shows
signs only: row sheet → signs → Confirm & next. Rest of pen quiet: taps pen
header → "rest not in heat". Pen flips ✓, next open pen is already on screen.
At the door: "Submit round — 46/46, AM round certified 07:42, G. Hansen."
Twice-daily compliance is now a fact the farm can prove, and the worker never
typed a word.

Farrowing, same grammar, different tier: Focus = sows due/active; the row opens
the T3 incremental record; "45 min since last piglet" rides the row in Focus so
re-checks self-schedule during the walk.

---

## 4 · Open decisions (need product owner)

1. **Unmarked semantics per task.** Heat check: per-pen confirm proposed above.
   Pregnancy check day 1 of 3: unchecked simply carries — no assertion. Confirm
   per task which of the two models applies.
2. **Round definition for 2×/day farms** — fixed AM/PM windows, or min-gap rule?
3. **Multi-select for ternary tasks** — allow bulk "pregnant" on pregnancy check,
   or is bulk only safe for heat marks? (Risk: bulk-confirming a clinical result.)
4. **Map/grid view** — the current grid toggle: keep as card grid, or make it the
   pen-map (spatial layout per room, ties into the Panel schematic direction)?
5. **未定位 animals** — can they be dispositioned in place, or must they be
   located first (blocking state)?
