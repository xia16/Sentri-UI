# Measures — Weigh · Backfat · Temperature

The three body-measure verbs of the Routine strip. All three are arity **Conveyor** in the
product model (`product-model.html` §4, rows Weight/Backfat/Temperature — "kg — group vs
individual model unresolved (§8)" / "qualitative (薄/适中/厚) or mm" / "°C"), reached from the
verb sheet after a selection (`components.html` §05: selection names the subject, the sheet holds
the verbs; Conveyor = "N payloads, one per subject … opens 04 with Confirm & next").

Binding sources: `components.html` §04 (shell, field kit, conditional rule, composition table
rows Weight/Backfat/Temperature, lines 631–675), §05 (arity cards, lines 980–992);
`check-in.html` §06d (measurement chip law, lines 748, 766–767, 787) and §06h (pen sheet count
trail, lines 943–959); production inventory `inspection/part-e.md`; feed requirements
`checkin/feed-mobile.md`.

---

## 1 · Production inventory

Figma `4GZGPBauEOWQQjnRrzoUgF`, 记录 band (part-e.md). Every mode variant that exists:

| Node | Screen (中文) | What it is |
|---|---|---|
| `853:2173` / `854:2488` | 子功能-记录 | Entry drawer, 6 tiles; 体重/背膘/温度 tiles gated single-pig by annotation `654:2366` |
| `854:3491` | 功能禁用态 | Same drawer, all tiles disabled |
| `319:1005` | 记录体重 | Weight, exactly 1 pig: one 体重 ✱ field (kg) |
| `319:1065` | 体重-总体重-记录个体体重：关 | N pigs; 体重记录方式 segmented (总体重/个体体重, `1476:1859`) + 总体重 ✱ + 记录个体体重 toggle OFF |
| `607:1824` | …记录个体体重：开（默认） | Toggle ON reveals empty ID+weight sub-panel; 扫描耳标 / 手动添加 buttons |
| `620:2752` | …记录个体体重：开（编辑） | Sub-panel holds scan/manual-built ID+weight rows with ✕ delete |
| `607:1928` | 体重-个体体体 (个体体重 mode) | One ✱ weight field per already-selected pig; no scan, no add |
| `2092:1996` / `2092:1784` | later iteration, toggle OFF / ON | Mode selector gone; 总体重 always ✱; toggle ON = one non-✱ field per selected pig; 提交 drawn enabled even empty |
| `1476:1796` / `1476:1785` | floating 组 | Unplaced radio-button alternative for 体重记录方式 |
| `290:2115` | 背膘（只可单只记录）定性 | Backfat: 背膘评估方式 segmented (定性/定量, default 定性) + 薄/适中/厚 3-way ✱ |
| `607:1996` | 背膘（只可单只记录）定量 | Same sheet, 定量 branch: 背膘厚度 ✱ mm input — a **separate frame per branch** |
| `293:2425` | 体温（只可单只记录） | One 体温 ✱ field (°C); drawer tile says 温度, screen says 体温 (part-e contradiction 9) |

Production defects carried in the file (part-e.md Ambiguities): the single-pig annotation
`654:2366` contradicts six multi-pig weight frames (#1); two incompatible weight models coexist
with no arbitration, plus a third unplaced variant (#2); per-pig required-ness flips between
models (#3); submit gating inconsistent (#4); none of the three verbs has a result frame (#16).

**Seven weight surfaces for one fact.** That is the mode zoo this spec subtracts.

---

## 2 · The unified model

### The selection is the mode switch

No 体重记录方式 control, no 记录个体体重 toggle, no radios. The thing production asked the user
to declare is already known the moment the verb sheet opens, because selection names the subject
(`components.html` §05):

| Selection | Weigh | Backfat | Temperature |
|---|---|---|---|
| 1 identified pig | drawer, single 04 sheet | drawer, single 04 sheet | drawer, single 04 sheet |
| 2..N identified pigs | **conveyor page**, one payload per pig | conveyor page | conveyor page |
| Group row (un-identified head) | drawer, **sample record** (kg × head, see below) | omitted — counted in the not-available line | omitted — counted in the not-available line |

Backfat and Temperature are per-animal facts that need an identity to land on; the nursery-group
verb sheet already drops Backfat ("7 not available without tags", `components.html` lines
884–894), and `Assign identity` (Conveyor) is the way out of the state (`check-in.html` §06d,
group-row slide). Weigh survives on the group row because a population weight is meaningful
without identities — it is exactly the feed PRD's spot-check.

Container per the working drawer/page line (`components.html` line 1007 — **open item, applied
here, not relitigated**): drawer to ~5 fields, page beyond; "conveyor runs and composites are
pages either way." All three verbs are 1–2 fields, so N=1 is a drawer over the walk; any N>1 run
is a page.

### 2a · Weigh — identified pigs, the conveyor

Fields → kit: `Measure(kg)✱` (§04 kit: "Mono, large, unit always shown. Opens the numpad on
tap"). On a conveyor run the Numpad kit applies by its own rule — "only where many values are
entered in sequence (per-piglet tag / weight)" — so the pad is persistent and carries the
running list of completed subjects.

Anatomy of the persistent page, phone width:

```
←  Weigh                        2 of 5
──────────────────────────────────────
 A2 · 000268        parity 2 · gilt
                    last 118 kg · jun 30
 ┌──────────────────────────────────┐
 │  Weight ✱          121.5    kg   │   ← Measure, focused
 └──────────────────────────────────┘
 done  000254 122.0 · 000261 119.5     ← running list, tap to re-open
 ┌────────┬────────┬────────┐
 │   1    │   2    │   3    │
 │   4    │   5    │   6    │
 │   7    │   8    │   9    │
 │   .    │   0    │   ⌫    │
 └────────┴────────┴────────┘
 [ Skip ]         [ Confirm & next ]
 next: 000271 · same pen · 3 left      ← footnote (§04: conveyor hint)
```

Rules of the run:

* **Subject header advances per pig** — pen · tag · vitals, per the §04 shell; the vitals slot
  carries her last recorded weight as the sanity anchor. The footnote is the next-hint
  (`next: 000268 · same pen`), exactly as the §04 shell rules specify.
* **Confirm & next commits immediately.** Each confirm writes that pig's record on the spot —
  the actions-commit-themselves law (`check-in.html` §06g: "written the moment it was
  recorded"). There is no batch submit, so **finish-early is just leaving**: back arrow at any
  point keeps everything confirmed and drops nothing. On the last subject the primary reads
  `Confirm & finish`.
* **Skip** moves on without writing; skipped pigs are re-offered once at the end of the run,
  then dropped. The count in the header (`2 of 5`) tracks confirmed, the footnote tracks
  remaining.
* **The running list is the Numpad kit's prev list**, one line per confirmed pig; tapping a line
  re-opens that pig for correction (an edit, not a second record).
* Order = walk order (pen order of the selection), same as the selection surface.
* N=1 degenerates to the plain 04 drawer: header, one Measure, `Record`. Same component, no run
  chrome.

### 2b · Weigh — group row, the sample record

The un-identified population of a pen is one selectable row (`check-in.html` §06d: ticking it
asks *how many*). Weigh on that subject is **one record about the population**, not N payloads —
so it is a drawer, not a conveyor.

Production offered 总体重 (one number for N) and, by extension, nothing for partial weighing.
The feed PRD's actual need is a **spot-check**: weigh 10 of 42 and recalibrate. The unification
is that *total vs sample was never a mode — it is a value of n*:

```
──────────────────────────────────────
 D4 · 42 pigs                no tags
 ┌──────────────────────────────────┐
 │  Weight on scale ✱   240    kg   │   ← Measure
 └──────────────────────────────────┘
 ┌──────────────────────────────────┐
 │  Head on scale ✱   −   10   +    │   ← Stepper
 └──────────────────────────────────┘
 loads  96 kg × 4 · 144 kg × 6         ← running list when repeated
 avg 24.0 kg · n 10 of 42              ← derived, read-only
 [ Add load ]              [ Record ]
```

* Two fields only: what the scale read, how many head stood on it (Stepper, §04 kit: "use
  whenever the farmer counts animals"). `Add load` repeats the pair for crate-by-crate weighing;
  the running list accumulates.
* The record stores `{Σkg, n, avg, pen headcount at record time, timestamp, who}`. Weighing the
  whole pen is the case n = headcount; weighing one head is n = 1. No toggle survives because
  there is no mode left to choose.
* The pen sheet renders it as a fact line in the §06h grammar — `avg 24.0 kg · n=10 · aug 25 ·
  G.H` — beside the count trail ("for untagged head, the count is the identity — so its trail
  lives here", `check-in.html` line 958).

**Why n is mandatory (the feed justification).** A spot-check weight recalibrates
`growth_offset_days` by the projected-vs-actual delta (feed PRD §10; `feed-mobile.md` Why-it-
goes-wrong #3, Inputs #2), and `spot_check_due` is one of only two Review Inbox items routed to
the Farmhand (§13.1) — this drawer is what closes it. The comparison needs a per-head average,
and `head_count` is a bare int with no derivation rule and an implied per-day timeline gap
(`feed-mobile.md` Inputs #1, §12.3 headcount × curve). A bare total divided by a possibly-stale
selection count silently corrupts the calibration; recording *what actually stood on the scale*
is immune to that. So 总体重-with-implied-N dies and (kg × head) replaces it.

### 2c · Backfat — one sheet, the conditional

Production split 定性/定量 across two frames; the §04 conditional rule folds them: "the
dependent field appears inline beneath its trigger … never a second step or a second screen"
(line 658), and the backfat composition row is already written that way — `Choice(qualitative /
quantitative)` → `Scale(thin·ok·fat)` **or** `Measure(mm)` (line 674; drawn as the conditional
proof, lines 728–744).

Fields → kit:

| Field | Kit | Notes |
|---|---|---|
| Method ✱ | Choice(2): `Measured — mm` / `Assessed by eye — thin·ok·fat` | production default 定性 kept: eye preselected |
| ↳ reveal | `Scale(3)` thin / ok / fat **or** `Measure(mm)` | amber-rule inline reveal, ✱ |

**Reconciling 只可单只记录 with arity Conveyor.** Production's constraint is on the payload, not
the workflow: one reading belongs to one animal, and a bulk sheet writing one backfat over N
pigs would be a lie. The conveyor honours that — **it is N single-subject sheets run in
sequence**, each with its own header, its own value, its own commit. What is removed is only the
forced round-trip through selection between pigs. Same resolution the model already made for
Death (`components.html` §05: "a bulk death is N sheets").

Conveyor detail: the Method choice is **sticky across the run** — the hand carries a caliper or
it does not, so pig 1's choice pre-fills pigs 2..N, changeable on any pig. The reveal keeps the
sheet at 2 visible fields; N=1 stays a drawer.

### 2d · Temperature — one Measure, one consequence

Fields → kit: `Measure(°C)✱` (composition row, line 675). No conditional, no branching. N=1
drawer; N>1 conveyor page identical in anatomy to Weigh's (2a) with °C in the Measure.

Naming: production's drawer tile 温度 vs screen 体温 (part-e contradiction 9) resolves to **body
temperature on the animal verb**; the *unit's* ambient temperature is a different fact and
already lives on the check-in sheet (`check-in.html` §06g, Temperature/Humidity Measures). One
word, two subjects, two homes — never one screen.

**The consequence is the chip.** The measurement chip law (`check-in.html` §06d): every
unescalated measurement is cut to the inside; an escalated one prints on the row — `Fever day 4
[40.6°]` (line 766). A reading over threshold escalates the row chip whether or not a case is
open; it never *creates* the case — a case is a person's declaration (Add condition), a reading
is data. Chip contention keeps the existing rule: the instruction wins (line 787).

**The threshold is config, not design.** `temp_escalation_c`, farm-level, keyed by stage class
(sow and piglet norms differ) — same pattern as the wean-to-service window behind `no batch`
("derived from config, never a new status", §06d). This spec consumes only `escalated: bool`.

---

## 3 · Subtraction table

| Production element | Node(s) | Fate | Why |
|---|---|---|---|
| 体重记录方式 segmented (总体重/个体体重) | `1476:1859` in `319:1065`, `607:1928` | **dies** | Mode is derivable from selection type — identified pigs → conveyor, group row → sample. Never ask what the system knows |
| Radio-button variant of the same | `1476:1796` / `1476:1785` | **dies** | Same control, different clothes; dies with it |
| 记录个体体重 toggle | `607:1816` in `319:1065`–`2092:1784` | **dies** | Identified pigs get per-pig capture automatically; a group row has no identities to itemise. The hybrid (group total + some IDs) is two records: sample weigh on the row, conveyor on the scanned pigs |
| Scan/manual ID+weight sub-list inside the weight form | `607:1824`, `620:2752` | **dies** | Scanning is the selection door (the dock), not a field. Scan a tag → identified subject → conveyor. Typing a new ID inside a weight form was Assign identity smuggled into Weigh; it stays its own Conveyor verb |
| One long form, one field per selected pig | `607:1928`, `2092:1784` | **dies** | Replaced by the conveyor: one subject per screenful, per-pig commit, skip, correction — a 10-field numpad form at phone width serves none of that, and §05 already ruled the arity |
| 总体重 one-number mode | `319:1065`, `2092:1996` | **transformed** | Survives only as the group-row sample record, with `n` (head on scale) made explicit — a total with implied N cannot feed `growth_offset_days` recalibration safely (feed PRD §10, §12.3) |
| Single-pig weight sheet | `319:1005` | **survives** | As the N=1 degenerate drawer |
| 单头-only gate on the three tiles | `654:2366` | **dies** | Superseded by arity Conveyor (`product-model.html` §4); the constraint it protected — one reading per animal — is kept by the conveyor's per-subject payload |
| Backfat as two frames (定性 / 定量) | `290:2115`, `607:1996` | **folded** | One sheet, Choice reveals Scale or Measure — the §04 conditional rule, already drawn as its proof |
| 温度/体温 naming split | drawer tile vs `293:2425` | **resolved** | Body temperature on the animal; ambient on the check-in sheet (§06g) |
| No result screens | part-e #16 | **moot** | Per-confirm commit + row/pen-sheet update in place; the walk never loses its place (§05 rules). No terminal toast needed |

Net: seven weight surfaces → two (conveyor page, group drawer); two backfat frames → one sheet;
temperature unchanged but re-homed and given its consequence.

---

## 4 · Open questions

1. **What the feed PRD needs from a weight record** — the spot-check entry form is unspecified
   (`feed-mobile.md` Inputs #2). Assumed here: `{Σkg, n, avg, headcount-at-record, timestamp,
   pen/batch ref, who}`. Unconfirmed: minimum n for a valid recalibration; whether the
   calibration consumes avg only or wants the per-load distribution; whether an identified-pig
   conveyor run over pigs of one pen should *also* count as that pen's spot-check (it carries
   better data — per-head with identities).
2. **Headcount timeline.** Does the group weigh record's headcount-at-record stamp double as a
   `head_count` observation for §12.3's implied per-day headcount history (`feed-mobile.md`
   Inputs #1)? Cheap to store, unowned by any PRD.
3. **Temperature threshold values** — per stage class, who sets them, and whether one config key
   or a band (escalate at X, red at Y). Config-owner question, not design.
4. **Over-threshold prompt.** Chip-only (as specced), or may the confirm step suggest `Add
   condition` inline when escalated? Suggestion costs a tap of noise per fever; barn-test.
5. **Backfat → feed band.** Feed PRD §11.1/NUT-12 maps backfat-mm onto the severity-band preset
   table (values are Open Decision "8"). Does a quantitative backfat record surface the matching
   band as a one-tap adjustment offer, or stay a bare reading at MVP?
6. **Temperature's strip.** The §05 verb-sheet specimens draw Weigh and Backfat in Routine but
   no Temperature tile anywhere. Assumed Routine (with its measure siblings); specimen gap to
   close, or an argument for Health.
7. **Skip semantics** — re-offer once at end (as specced) vs drop silently; and whether a
   skipped pig leaves any trace on the run's footnote summary.
8. **Sticky method on the backfat conveyor** — sticky-per-run assumed; verify the hand never
   alternates caliper/eye within one walk.
9. **The drawer/page line itself** is still an open item (`components.html` line 1007). Applied
   as working rule here; if it moves, only the N=1 container changes — the conveyor stays a page
   either way.
