# Farrowing (分娩) — scenario tree

Every entity state crossed with the events that can reach it, derived from the rulings, not from what is built. Same
format as `ux/tasks/piglet-processing/research/scenario-tree.md`. Each branch ends in one of:

- **→** an outcome — what the screen shows and what the record holds afterwards;
- **handoff:`<task>`** — the work leaves farrowing (piglet processing · check-in/巡检 · pig actions);
- **? Qn** — undecided; the question that decides it is stated once in §9. A `?` branch is a
  **decision-blocker**: it never gets an invented expectation.

Every branch is marked **S** (sourced — cite follows) or **I** (inferred — reasoning follows). Where sources disagree,
RULINGS wins; when RULINGS does not reach the case, or the PRD itself disagrees with the contract, the branch is a `?`.

**Executable leaves.** `features/farrowing/scenarios.json` is the machine-readable form of this tree's executable
rows: each leaf names its row here (`"tree": "D-1"`). `node scripts/run-scenarios.mjs farrowing` runs them (EN, ZH ×
360, 390) and writes `review/scenarios-farrowing.json`. A row with **leaf** in the last column has one; **pending**
means the prototype cannot run it yet; rows without either are tree-only for now.

**Citation keys.** PRD = `features/farrowing/PRD.md` · RUL = `ux/research/farrowing/RULINGS.md` (heading quoted) ·
SYN = `ux/research/farrowing/SYNTHESIS.md` (§) · HANDOVER = `ux/research/farrowing/HANDOVER.md` · contract =
`ux/system/farrowing-contract.html` (C1–C11) · CLOSURE = `ux/research/farrowing/ASTRA-TASK-CLOSURE.md` · STR =
`ux/laws/strings.json` verbs · review = `review/*.json` item id (a recommendation there is not a ruling) · flow =
`features/farrowing/feature.json` flow.

**Two clocks.** *Her session* (one sow's litter) locks at Finish farrowing. *The task* (the batch's farrowing) ends at
End task. A litter can be locked while the task is open.

---

## 1 · Entry and the room (E)

States: E0 Home, Farrowing section · E1 Home, Choose unit · E2 room list (Unit 7, All) · E3 room filtered / searched.

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| E-1 | E0 | tap the Farrowing card (View task) | → the room list, not the Task overview | S — PRD Rules, owner calls for this atlas | `fa-e1-home-lands-on-room` |
| E-2 | E1 | pick Unit 7, View task | → Unit 7's room list | S — PRD Rules, owner calls | `fa-e2-choose-unit-lands-on-unit-room` |
| E-3 | E2 | tap Awaiting | → only sows with nothing recorded | S — PRD Anchor, Scope | `fa-e3-awaiting-tab-lists-awaiting-only` |
| E-4 | E2 | Search, type part of an ear tag | → matching sows only | S — PRD Scope | `fa-e4-search-finds-sow` |
| E-5 | E3 | tap the result | → her sheet, face by status (Awaiting here) | S — RUL Surfaces (sheet-first identity) | `fa-e5-search-result-opens-awaiting-face` |
| E-6 | E2 | Filter, parity 6+ | → only parity ≥ 6 | S — PRD Scope | `fa-e6-parity-filter` |
| E-7 | E2 | Filter, due range | ? Q3 — does it hide Active and Done sows? | S (open) — PRD Scope silent; review tasks-built-3 | blocker `fa-e7-due-filter-scope` |
| E-8 | E2 | tap an Active row | → Counting | S — PRD Anchor; flow | `fa-e8-active-row-opens-counting` |
| E-9 | E2 | tap a Done row | → the locked record, no counter | S — RUL After the lock | `fa-e9-done-row-opens-record` |
| E-10 | E2 | tap a Sow died row | → her ended record; she is still in the room | S — RUL Starting and ending | `fa-e10-died-row-opens-ended-record` |
| E-11 | E2 | Scan ear tag | → her sheet | S — PRD Scope | pending `fa-e11-scan-ear-tag` |
| E-12 | E2 | tap a pen header | ? pen tools (feed, fault, note, log) are out of scope by PRD; review tasks-built-2 | S (open) — PRD Scope Out | — |

## 2 · Sow · Awaiting (A)

States: A0 Awaiting, nothing recorded (000455).

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| A-1 | A0 | tap + | → Farrowing at once: alive 1, born 1; no start ceremony | S — RUL Starting and ending ("starts at the first recorded event") | `fa-a1-first-piglet-starts-farrowing` |
| A-2 | A0 + 1 | tap − back to zero | → reads Awaiting again; the log keeps the lines | S — RUL Starting and ending ("registers derive from the live total") | `fa-a2-recount-to-zero-reads-awaiting` |
| A-3 | A0 | Record dead, + Stillborn, Save | → Farrowing: born 1, a stillborn can be the first record | S — RUL Surfaces (Record dead live pre-start) | `fa-a3-stillborn-first-record` |
| A-4 | A0 | Edit, Finish farrowing | → present but unavailable until there is something to correct or lock | S — RUL Surfaces ("One layout across states") | — |
| A-5 | A0 | sow dies before farrowing | → Record dead › The sow; session ends, stage *before* | S — RUL Starting and ending (sow mode) | — |

## 3 · Sow · Farrowing, counting (C)

States: C0 Farrowing, no draft (000418: alive 9, dead 1·1·2·0·0·1, +4 this visit).

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| C-1 | C0 | open | → the receipt says saved (`Saved · +4 this visit`) | S — RUL After the lock (receipt copy) | `fa-c1-receipt-says-saved` |
| C-2 | C0 | read the death tool | → it reads **Record dead** | S — RUL Surfaces; review tasks-built-17 (recommends as ruled) | `fa-c2-tool-reads-record-dead` |
| C-3 | C0 | − until it stops | → drains the visit, clamps at the floor (B* − dead); − greys there; Born never drops | S — RUL Model | `fa-c3-minus-clamps-at-floor` |
| C-4 | C0 | idle 90 min | → the visit folds into one log line | S — RUL Surfaces (visit ends after ~90 min idle); contract C3 (draft) | pending `fa-c4-idle-fold` |
| C-5 | C0 | Record dead | → the dead drawer (§4) | S — RUL Surfaces | via D-* |
| C-6 | C0 | Edit | → the one correction screen (§6) | S — RUL Surfaces | via X-* |
| C-7 | C0 | More actions › Foster piglets | ? Q1 | S (conflict) — RUL After the lock (parked) vs feature.json foster screen | blocker `fa-z1-fostering-scope` |

## 4 · The dead drawer draft (D)

States: D0 drawer open over C0 with a draft of 1 crushed · D1 C0 with that draft kept (host shows `1 unsaved`).

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| D-1 | D0 | Back | → D1: the draft stays on the device; the host's Record dead says `1 unsaved`; posted deaths unchanged | S — RUL Starting and ending ("Back … KEEPS the draft"); contract C1; STR Back | `fa-d1-back-keeps-death-draft` |
| D-2 | D1 | reopen Record dead | → the draft is there, green, `1 unsaved` | S — RUL Starting and ending | `fa-d2-reopen-restores-draft` |
| D-3 | D1 → D0 | + again (resume) | → `2 unsaved`; nothing posted | S — RUL Starting and ending | `fa-d3-resume-adds-to-draft` |
| D-4 | D1 → D0 | Clear | → draft gone, Clear gone; posted unchanged | S — RUL Starting and ending | `fa-d4-clear-discards-draft` |
| D-5 | D1 → D0 | Save | → one stamped death event; draft empty | S — RUL Surfaces | `fa-d5-save-posts-one-event` |
| D-6 | D0 | dismiss (close / swipe) | → as Back | S — RUL Surfaces ("Back or the dismiss gesture keeps it") | `fa-d6-dismiss-keeps-death-draft` |
| D-7 | D0 | app closed and reopened | → the draft survives the restart | S — contract C5 ("persisted across background and restart") | `fa-d7-restart-keeps-death-draft` |
| D-8 | D0 | add a photo, Save | → the photo rides the death's log line | S — RUL Starting and ending (photos) | — |
| D-9 | D0 on two phones | both save | → signed deltas merge; a breach holds at the floor with a sync review line | S — RUL Starting and ending (merge contract, draft) | pending `fa-d9-two-phones` |
| D-10 | D0 | Back, then Finish farrowing | → §5 F-1 | S | via F-1 |

## 5 · Finish and the lock (F)

States: F0 Finish with a death draft waiting (from D1) · F1 Finish with an Edit draft waiting · F2 Finish, nothing waiting.

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| F-1 | F0 | open Finish | → opens; lock waits floor-gray; pointer `1 death unsaved · Record dead` | S — RUL Starting and ending ("Finish with a draft waiting") | `fa-f1-finish-blocked-by-death-draft` |
| F-2 | F0 | hold the lock anyway | → nothing locks; the draft is still there | S — RUL Starting and ending ("A draft never crosses the lock") | `fa-f2-draft-never-crosses-lock` |
| F-3 | F0 | Back, Record dead, Save, Finish | → F2: the lock is live | S — RUL ("a guard on the lock, not a gate on recording") | `fa-f3-resolved-finish-unblocked` |
| F-4 | F2 (after F-3) | hold Finish farrowing | → locked; Born frozen = alive + dead (15); the record face | S — RUL Model; RUL Surfaces | `fa-f4-lock-gives-locked-record` |
| F-5 | F1 | open Finish | → lock waits; a door to the waiting correction | S — RUL Starting and ending; RUL Surfaces (same triad on Edit) | `fa-f5-finish-blocked-by-edit-draft` |
| F-6 | F1 | Review, Save correction | → back on Finish, lock live; one correction event | S — flow (edit → finish); RUL Surfaces | `fa-f6-saved-correction-returns-to-finish` |
| F-7 | F2 | tap (no hold) | → nothing locks | S — RUL Surfaces (hold-to-lock is the second guard) | `fa-f7-tap-does-not-lock` |
| F-8 | F2 | hold | → locked record: Born 14, Edit · Record dead, no Finish | S — RUL After the lock | `fa-f8-locked-record-face` |
| F-9 | F2 | weak / deformed steppers | → commit per tap; healthy derived; capped at alive | S — RUL Model (classification at Finish) | — |
| F-10 | F2 | litter weight outside 0.8–2.5 kg × alive | → soft words warning, never a gate | S — contract C5 (draft); review tasks-built-28 | — |

## 6 · Edit and Correct born (X)

States: X0 Edit open while counting · X1 Edit open on a locked record.

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| X-1 | X0 | first change | → amber banner + live change summary; Save live | S — RUL Surfaces | `fa-x1-change-shows-banner-and-summary` |
| X-2 | X0 + change | Save | → one stamped correction; Born heals from its inputs (13) | S — RUL Surfaces | `fa-x2-save-correction` |
| X-3 | X0 + change | Back, reopen Edit | → the change is still there; nothing posted | S — RUL Surfaces (Back keeps) | `fa-x3-edit-back-keeps-draft` |
| X-4 | X0 + change | Clear | → change discarded | S — RUL Surfaces | `fa-x4-edit-clear-discards` |
| X-5 | X1 | Correct born ✎ › More born 1 › Apply › Save | → Born 14 → 15, stamped; original kept in the log | S — RUL After the lock (anyone may amend) | `fa-x5-correct-born-after-lock` |
| X-6 | X1 after X-5 | View log | → the Farrowing record shows the correction and the finish | S — RUL After the lock (one ledger surface) | `fa-x6-log-shows-correction` |
| X-7 | X1 | a piglet dies after the lock | ? Q4 — which door owns post-lock deaths | S (open) — RUL After the lock vs review tasks-built-24 | blocker `fa-x7-post-lock-death-door` |
| X-8 | X0 | lower Alive below the counting floor | ? Q7 — how a pre-lock Alive correction restates Born | S (open) — review tasks-built-33 | — |

## 7 · Sow death (M)

States: M0 drawer in The sow mode over C0 · M1 Ended (sow died).

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| M-1 | M0 | Prolapse, hold Save | → session ends without Finish; red band with the cause | S — RUL Starting and ending | `fa-m1-sow-death-ends-session` |
| M-2 | M1 | Back to the room | → she stays as a Done row marked Sow died | S — RUL Starting and ending ("She stays in the room") | `fa-m2-dead-sow-stays-in-room` |
| M-3 | M0 | Prolapse, tap (no hold) | → nothing recorded | S — RUL Starting and ending (hold-to-commit) | `fa-m3-sow-death-needs-hold` |
| M-4 | M1 | record a piglet death | ? Q5 | S (open) — contract C4 vs review tasks-built-25 | blocker `fa-m4-piglet-deaths-after-sow-died` |
| M-5 | M0 | Other | → an optional free-text line | S — RUL Starting and ending | — |
| M-6 | M1 | her alive piglets | handoff:piglet processing (`7 alive stay under piglet care`) | S — RUL Starting and ending | — |

## 8 · The task: overview → End → receipt (K)

States: K0 room with sows still farrowing · K1 End review, all finished · K2 End review, awaiting remainder, none active · K3 task ended.

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| K-1 | K0 | Task overview | → whole-task progress; every sow in exactly one outcome | S — PRD Problem | `fa-k1-overview-adds-up` |
| K-2 | K0 | End task early | ? Q2 — blocked, or allowed with a warning | S (conflict) — PRD Decisions + CLOSURE vs contract C9 + SYN §6 E2 | blocker `fa-k2-end-while-farrowing` |
| K-3 | K1 | tap (no hold) End task | → nothing ends | S — PRD Decisions (hold-to-commit) | `fa-k3-end-needs-hold` |
| K-4 | K1 | hold End task | → K3: receipt, stamped who and when (09:41) | S — PRD Decisions | `fa-k4-end-gives-receipt` |
| K-5 | K3 | leave the receipt | → one exit, Back | S — RUL Round 5 (exit word Back); review screens-a-14 | `fa-k5-receipt-one-exit` |
| K-6 | K2 | hold End task early | → early receipt | S — PRD Decisions | `fa-k6-end-early-receipt` |
| K-7 | K2 | the awaiting sows at End | ? Q6 — where they go | S (open) — contract C9 vs review tasks-built-44 | blocker `fa-k7-awaiting-at-early-end` |
| K-8 | K3 | a later correction to a sow | ? Q8 — does the receipt change | S (open) — review tasks-built-50 | — |

## 9 · Open questions (decision-blockers)

1. **Q1 · Is fostering in Farrowing's scope?** RUL *After the lock* parks it ("v1 farrowing ships NO foster doors");
   the PRD lists it Out; yet `farrowing.foster` exists, reached from More actions. *(C-7, `fa-z1-fostering-scope`)*
2. **Q2 · Can the task end while a sow is farrowing?** The PRD blocks it ("blocked while farrowing is open", with
   CLOSURE: drafts block too); the contract C9 says "close never blocks on them" (ACTIVE sows list informationally),
   SYN §6 E2 recommends warn + doors, and RUL piglet-processing Round 4 allows End with review items open.
   *(K-2, `fa-k2-end-while-farrowing`)*
3. **Q3 · Does the due-range filter apply to Active and Done sows?** *(E-7)*
4. **Q4 · After the lock, which door records a piglet death?** *(X-7)*
5. **Q5 · May piglet deaths be recorded after the sow died?** *(M-4)*
6. **Q6 · Where do awaiting sows go when the task ends early?** *(K-7)*
7. **Q7 · How does a pre-lock Alive correction below the floor restate Born?** *(X-8)*
8. **Q8 · Does a correction after End change the receipt?** *(K-8)*

Also standing as a recommendation, not a ruling: review tasks-built-21 proposes reversing D-1 (discard with a confirm).
RULINGS wins until the owner rules, so D-1 keeps its expectation.
