# Ops synthesis — six clusters, one system

Sources: health.md · cycle-adhoc.md · measures.md · place-identity.md · terminal.md · pen-ops.md
(2,007 lines of per-verb requirements). This file is what they agree on, where they collided,
and the laws that fall out. UI build proceeds from here.

---

## 1 · The roster — the component three clusters invented independently

Health's resolve needed a per-pig × per-condition verdict page. Death needed a pre-commit
review of the selection. Transfer needed per-record verdicts (stays/move/copy). One component:

> **The roster: the selection (or a subject's open records) as readable rows, each carrying
> a verdict, in front of — or instead of — a bulk commit.**

Three configurations, one anatomy (04 subject header · master row · pen-grouped verdict lines
in the 06d row grammar · conditional reveals · one primary):

| Configuration | Verdict per line | Commit | Used by |
|---|---|---|---|
| **Verdict page** | 2-state (recover ✓ big-left / strike ✕ small-right) | one commit, mixed verdicts | Resolve; (future: any per-record judgment) |
| **Roster → conveyor** | keep / remove (✕) | nothing commits here; `Start · n` enters the per-pig chain | Death; Assign-identity splice entry |
| **Inline verdict checklist** | 3-state segment (stays · move · copy) | with the parent sheet's commit | Transfer's group records |

Shared rules: blocked/ineligible members listed with reasons (never silently dropped); the zero
rule keeps nothing-open members off the list with a counting footnote; group rows verdict by
count with an inline stepper; target asymmetry may encode verb asymmetry (outcome cheap and
central, correction deliberate and peripheral).

**Placement: components.html gains `04d · The roster`.** It is 04-family (a commit surface),
not 07 (it acts).

## 2 · Laws confirmed across clusters

1. **Selection type decides the shape — never a toggle.** Tagged pigs → per-pig (conveyor);
   a group row → one count sheet (the tick's stepper already named n); mixed → compose
   (roster stops / two movements under one commit). Found independently by measures (weight
   modes), terminal (death), place (transfer). Kills every production mode control.
2. **A decision renders as a visible choice; a Picker holds data, never a decision.**
   (Amended after owner review: the earlier "empty Picker = record-only" mechanism read as an
   incomplete form, not a choice, and needed a footnote to explain itself — if the mechanism
   needs a footnote, the mechanism is wrong. Production's explicit record-only/join pair was
   right.) Consequence decisions (join a batch / just record) are explicit options revealed
   under the trigger; the picker opens after choosing. Optional Pickers survive only for
   genuinely optional *data* (brand). Commits stay ungated either way.
3. **Per-confirm commit, so protection moves in front.** No batch rollback exists anywhere;
   end-of-flow warnings are structurally impossible → the roster reviews *before* the first
   commit. Conveyors: skip advances without recording (≠ empty-cause commit); finish-early is
   legal, committed records stand; **carry-forward** pre-fills each sheet from the last.
4. **Sub-sheets commit on tap.** Picker sheets lose their 确认; production-line wheels become
   scope chips inside the picker; filters keep production's own eligibility rules, quoted.
5. **The record acts.** Resolve-fault lives on the fault's record (pen sheet →), not in the
   verb sheet. Characteristics correct on the record, never in Resolve's roster.
6. **The gate splices, never walls.** Gated verbs run the identity conveyor over the untagged
   subset; the verb owns the journey (`identity first · 2 of 3` · footnote `next: 留种`);
   identities commit per-confirm (the tag is in the ear), the verb commits only at its own sheet.

## 3 · Container assignment (working rule applied: judgment ≤~5 fields = drawer; conveyor/composite/roster-page = page)

| Drawer | Page |
|---|---|
| Heat ad-hoc · Pregnancy result (+batch picker sub-sheet) · Return · Abortion | Treatment (7 fields) |
| Triage · Add condition (N incl. 1) | Resolve at N>1 (verdict page) |
| Resolve at N=1 · Death at N=1 · Cull rec | Death roster + conveyor at N>1 |
| Weigh N=1 · group sample · Backfat · Temperature | Weigh conveyor N>1 |
| Transfer (worst case flagged) · 留种 · Missing | Assign identity conveyor |
| Fault report · Set count · Switch feed · Pen note | — |

## 4 · Collisions resolved

- **Transfer's "unallocated heads move as unallocated"** (place-identity) relied on the
  persistable-residual model that pen-ops correctly notes is superseded by the one-number rule
  (06b). Resolution: a pen's un-identified count is *fully partitioned* by (line, batch) by
  construction — there is no unallocated bucket; multi-batch moves reveal per-batch steppers,
  Σ = n, single-batch moves ride silently.
- **Abortion's 6 causes vs the Choice law (≤4).** The kit's own rule decides: a fifth option is
  a Picker. Abortion cause = Picker(cause) — one sub-sheet, six rows, tap commits; conditional
  Note when Other. (Production's chip grid dies with the law, not by taste.)
- **意外妊娠 is not a verb.** Folded into Pregnancy result (one record, two doors); the join-batch
  Picker reveals only when nothing watches her (850:2000's test), so the in-batch tile-disable
  dies structurally.
- **Treatment = page** stands (7 fields; conveyor-like bulk).

## 5 · Consolidated open product questions (deduped from ~40)

1. ~~Strike KPI semantics~~ **Settled**: no mobile KPI concern — strike is plain human-error correction; anything KPI-ish is backend's problem.
2. ~~Triage without a case~~ **Settled: allowed** — and bigger: the owner declared the whole health model (disease/symptom labeling, triage) incoherent and over-complicated. **The health walkthrough card is a model redesign, not a port**: one condition concept, simple case lifecycle, triage standing alone.
3. ~~Treatment dose~~ **Settled: per pig, one field** (matches the console dispatch task). Vet practice: mg/kg on the label, converted to fixed per-head doses by stage class on-farm. Total (`3 ml × 12`) as a commit footnote, not a field.
4. ~~Cull recommendation~~ **Deferred** — out of the v1 verb sheet; the removal/sale event that would execute it is undesigned. Parked together.
5. Weight record payload for feed calibration — store {Σkg, n, avg, headcount-at-record}: confirm with console/feed owner.
6. Fault photos — added (production lacked); confirm evidence value.
7. Set-count reason — optional (required would re-gate committed steppers); direction-filtered Choice(4).
8. Device registry — until one exists, bulk fault-resolve is unprovable; per-pen dedupe only.
9. Recheck stepper default (Unclear → 3d) — farm config?
10. Missing→found flow (工具箱 失踪列表) — destination designed nowhere; parked.

---

## 6 · Owner amendments from the workflow review

- **Decisions render as visible choices** (law 2 rewritten above) — the heat drawer's canonical fix.
- **Feed is a pen verb after all**: one `Feed` door per pen — current · % adjust · switch formula. The earlier "no pen-level adjustment" derivation is superseded by the owner's call; the feed model's pen scope carries it. Per-pig direct adjust exists at N=1 only; bulk per-pig plans stay case-driven (Thin/Fat). A shared % across ticked animals is deliberately impossible.
- The bare `Switch` tile died with this — switching is a row inside Feed, pre-filled on due days.
