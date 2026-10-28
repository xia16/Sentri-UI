# Farrowing (分娩) — scenario tree

Every entity state crossed with the events that can reach it, derived from the rulings, not from what is built. Same
format as `ux/tasks/piglet-processing/research/scenario-tree.md`. Each branch ends in one of:

- **→** an outcome — what the screen shows and what the record holds afterwards;
- **handoff:`<task>`** — the work leaves farrowing (piglet processing · check-in/巡检 · pig actions);
- **? Qn** — undecided; the question that decides it is stated once in §9. A `?` branch is a
  **decision-blocker**: it never gets an invented expectation.

Every branch is marked **S** (sourced — cite follows) or **I** (inferred — reasoning follows). Where sources disagree,
RULINGS wins; when RULINGS does not reach the case, or the PRD itself disagrees with the contract, the branch is a `?`.

**Owner decision 2026-10-10.** Four decisions of that date change rows below and are cited as "owner decision 2026-10-10": no ✕ in drawer heads (the footer Back is the exit; swipe down on the handle or the scrim is Back); no green for drafts; leaving Edit with unsaved changes asks "Save correction?" (an unsaved correction can never reach Finish); a changed row shows "was N" and there is no correction banner. Rows marked *retired* keep their ids out of use.

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
| E-10 | E2 | tap a Sow died row with piglets to allocate | → the allocation sheet (the same sheet as right after her death) | S — owner decision 2026-10-10 (was RUL: her ended record) | `fa-e10-died-row-opens-ended-record` |
| E-11 | E2 | Scan ear tag | → ~~her sheet~~ superseded 2026-10-12 (Scan listed each scanned sow), then amended 2026-10-22: a read in Scan ear tags opens her farrowing drawer over Scan, not the room; see §8b S-21 | S — PRD Scope, then owner decisions 2026-10-12 and 2026-10-22 | pending `fa-e11-scan-ear-tag` (superseded by S-21; the read is the demo control, which the runner cannot tap) |
| E-12 | E2 | read every row | → recorded counts only: no "born N", no "0 dead", no pencil | owner decision 2026-10-10 | `fa-e12-rows-recorded-counts-only` |
| E-13 | E3 | Find a sow, type 4 | → the same rows, same rules | owner decision 2026-10-10 | `fa-e13-search-rows-recorded-counts-only` |
| E-14 | E2 | tap a pen header | ? pen tools (feed, fault, note, log) are out of scope by PRD; review tasks-built-2 | S (open) — PRD Scope Out | — |

## 2 · Sow · Awaiting (A)

States: A0 Awaiting, nothing recorded (000455).

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| A-1 | A0 | tap + on Born alive, Save | → Farrowing at once: alive 1, born 1; no start ceremony | S — RUL Starting and ending ("starts at the first recorded event"); owner decisions 2026-10-23 (Counting) | `fa-a1-first-piglet-starts-farrowing` |
| A-2 | A0 | tap + then − on Born alive, save nothing | → nothing recorded: reads Awaiting, born 0, empty log | S — owner decisions 2026-10-23 (Counting) (a visit is a draft until Save) | `fa-a2-recount-to-zero-reads-awaiting` |
| A-3 | A0 | Report death, Born dead, + Stillborn, Done, Save | → Farrowing: born 1, a stillborn can be the first record | S — RUL Surfaces (the dead drawer live pre-start); owner decisions 2026-10-23 (Counting) | `fa-a3-stillborn-first-record` |
| A-4 | A0 | Edit, Finish farrowing | → present but unavailable until there is something to correct or lock | S — RUL Surfaces ("One layout across states") | — |
| A-5 | A0 | sow dies before farrowing | → Record dead › The sow; session ends, stage *before* | S — RUL Starting and ending (sow mode) | — |

## 3 · Sow · Farrowing, counting (C)

States: C0 Farrowing, nothing entered (000418: alive 9, dead 1·1·2·0·0·1).

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| C-1 | C0 | open | → the Alive card says when the record was last saved (`Saved Aug 26 08:20`) | S — owner decisions 2026-10-23 (Counting) | `fa-c1-receipt-says-saved` |
| C-2 | C0 | read the death tool | → it reads **Report death** | S — owner decisions 2026-10-23 (Counting) | `fa-c2-tool-reads-record-dead` |
| C-3 | C0 | + then − on Born alive | → Born alive − greys at 0; Alive 9 and born 14 unchanged (a saved count is corrected in Edit record) | S — owner decisions 2026-10-23 (Counting) | `fa-c3-minus-clamps-at-floor` |
| C-4 | C0 | idle 90 min | → the visit folds into one log line | S — RUL Surfaces (visit ends after ~90 min idle); contract C3 (draft) | pending `fa-c4-idle-fold` |
| C-5 | C0 | Report death | → the Report death level (§4) | S — owner decisions 2026-10-23 (Counting) | via D-* |
| C-6 | C0 | the Alive card › Edit record | → Litter details, then the one correction screen (§6) | S — owner decisions 2026-10-23 (Counting) | via X-* |
| C-7 | C0 | More actions › Foster piglets | ? Q1 | S (conflict) — RUL After the lock (parked) vs feature.json foster screen | blocker `fa-z1-fostering-scope` |

## 4 · The dead drawer draft (D)

States: D0 Report death open over C0 with 1 crushed entered · D1 C0 after Done, the visit holding that death (`Not saved yet`).

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| D-1 | D0 | Done | → D1: the death joins the visit, not saved: Alive 8, `Not saved yet`, a −1 died chip; posted deaths unchanged | S — owner decisions 2026-10-23 (Counting) | `fa-d1-back-keeps-death-draft` |
| D-2 | D1 | reopen Report death | → Crushed reads 1, its − live | S — owner decisions 2026-10-23 (Counting) | `fa-d2-reopen-restores-draft` |
| D-3 | D1 → D0 | + again (resume) | → Crushed 2; nothing posted | S — RUL Starting and ending | `fa-d3-resume-adds-to-draft` |
| D-4 | D1 → D0 | Clear | → counts gone, Clear gone; posted unchanged | S — RUL Starting and ending | `fa-d4-clear-discards-draft` |
| D-5 | D1 → D0 | Done, Save | → one stamped event; crushed 3, Alive 8; draft empty | S — owner decisions 2026-10-23 (Counting) | `fa-d5-save-posts-one-event` |
| D-6 | D1 | dismiss (swipe down or tap the handle, or tap the scrim) | → the drawer closes and keeps the visit | S — RUL Surfaces ("Back or the dismiss gesture keeps it"); owner decisions 2026-10-23 (Counting) | `fa-d6-dismiss-keeps-death-draft` |
| D-7 | D0 | app closed and reopened | → the draft survives the restart | S — contract C5 ("persisted across background and restart") | `fa-d7-restart-keeps-death-draft` |
| D-8 | D0 | add a photo, Save | → the photo rides the death's log line | S — RUL Starting and ending (photos) | — |
| D-9 | D0 on two phones | both save | → signed deltas merge; a breach holds at the floor with a sync review line | S — RUL Starting and ending (merge contract, draft) | pending `fa-d9-two-phones` |
| D-10 | D1 | look at the bar | → §5 F-1 | S | via F-1 |

## 5 · Finish and the lock (F)

States: F0 the record with a visit waiting (from D1) · F1 *retired* (Finish with an Edit draft: an unsaved correction cannot reach Finish, see X-10) · F2 Finish, nothing waiting.

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| F-1 | F0 | look at the bar | → Back · Save: Finish farrowing is not offered until the visit is saved or cleared | S — RUL Starting and ending ("Finish with a draft waiting"); owner decisions 2026-10-23 (Counting) | `fa-f1-finish-blocked-by-death-draft` |
| F-2 | F0 | look at the bar | → nothing can lock; the draft is still there | S — RUL Starting and ending ("A draft never crosses the lock") | `fa-f2-draft-never-crosses-lock` |
| F-3 | F0 | Save, Finish farrowing | → F2: the lock is live | S — RUL ("a guard on the lock, not a gate on recording") | `fa-f3-resolved-finish-unblocked` |
| F-4 | F2 (after F-3) | hold Finish farrowing | → locked; Born frozen = alive + dead (14); the record face | S — RUL Model; RUL Surfaces | `fa-f4-lock-gives-locked-record` |
| F-5 | F1 | *retired* | an unsaved correction cannot reach Finish (X-10); leaf `fa-f5-finish-blocked-by-edit-draft` retired | owner decision 2026-10-10 | — |
| F-6 | F1 | *retired* | replaced by X-12; leaf `fa-f6-saved-correction-returns-to-finish` retired | owner decision 2026-10-10 | — |
| F-7 | F2 | tap (no hold) | → nothing locks | S — RUL Surfaces (hold-to-lock is the second guard) | `fa-f7-tap-does-not-lock` |
| F-8 | F2 | hold | → locked record: Born 14, Edit · Record dead, no Finish | S — RUL After the lock | `fa-f8-locked-record-face` |
| F-9 | F2 | weak / deformed steppers | → commit per tap; healthy derived; capped at alive | S — RUL Model (classification at Finish) | — |
| F-10 | F2 | litter weight outside 0.8–2.5 kg × alive | → soft words warning, never a gate | S — contract C5 (draft); review tasks-built-28 | — |
| F-11 | F2 | tap Yes on Assisted | → No was chosen before (required No / Yes, no Clear); Yes is chosen and recorded | S — owner decision 2026-10-15 | `fa-f11-assisted-no-preselected` |
| F-12 | F2 | type 12,6 in the Litter weight field (the system decimal keyboard) | → the weight reads 12.6 kg (the comma became a point); no Numpad; the sheet stays open | S — owner decision 2026-10-16 | `fa-f12-weight-on-the-keyboard` |

## 6 · Edit and Correct born (X)

States: X0 Edit open while counting · X1 Edit open on a locked record.

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| X-1 | X0 | first change | *retired*: the amber banner and change summary are gone; see X-9. Leaf `fa-x1-change-shows-banner-and-summary` retired | owner decision 2026-10-10 | — |
| X-2 | X0 + change | Save | → one stamped correction; Born heals from its inputs (13) | S — RUL Surfaces | `fa-x2-save-correction` |
| X-3 | X0 + change | Back | *retired*: Back with unsaved changes now asks (X-10) instead of silently keeping the draft. Leaf `fa-x3-edit-back-keeps-draft` retired | owner decision 2026-10-10 | — |
| X-4 | X0 + change | Clear | → change discarded | S — RUL Surfaces | `fa-x4-edit-clear-discards` |
| X-5 | X1 | Correct born ✎ › More born 1 › Apply › Save | → Born 14 → 15, stamped; original kept in the log | S — RUL After the lock (anyone may amend) | `fa-x5-correct-born-after-lock` |
| X-6 | X1 after X-5 | View log | → the Farrowing record shows the correction and the finish | S — RUL After the lock (one ledger surface) | `fa-x6-log-shows-correction` |
| X-7 | X1 | a piglet dies after the lock | ? Q4 — which door owns post-lock deaths | S (open) — RUL After the lock vs review tasks-built-24 | blocker `fa-x7-post-lock-death-door` |
| X-8 | X0 | lower Alive below the counting floor | ? Q7 — how a pre-lock Alive correction restates Born | S (open) — review tasks-built-33 | — |
| X-9 | X0 | first change | → the changed row shows its new value in ink with a muted `was N` beside the label; no banner, no Corrected tag; Save correction live | owner decision 2026-10-10 | `fa-x9-changed-row-shows-was` |
| X-10 | X0 + change | Back | → the shared dialog asks `Save correction?` (Save / Discard); the screen stays on Edit until answered; nothing posted | owner decision 2026-10-10 | `fa-x10-back-with-change-asks-save` |
| X-11 | X-10 | Discard | → the change is dropped, back on Litter details, nothing posted | owner decision 2026-10-10; owner decisions 2026-10-23 (Counting) | `fa-x11-ask-discard-drops-change` |
| X-12 | X-10 | Save | → one stamped correction (who and old → new go to the log), back on the record | owner decision 2026-10-10 | `fa-x12-ask-save-posts-correction` |

## 7 · Sow death (M)

States: M0 Report death on The sow over C0 · M1 Ended (sow died).

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| M-1 | M0 | Prolapse, hold Save | → session ends without Finish; the sheet becomes the allocation sheet | S — RUL Starting and ending; owner decision 2026-10-10 | `fa-m1-sow-death-ends-session` |
| M-2 | M1 | Back to the room | → she stays as a Sow died row, "N to allocate" | S — RUL Starting and ending ("She stays in the room"); owner decision 2026-10-10 | `fa-m2-dead-sow-stays-in-room` |
| M-3 | M0 | Prolapse, tap (no hold) | → nothing recorded | S — RUL Starting and ending (hold-to-commit) | `fa-m3-sow-death-needs-hold` |
| M-4 | M1 | record a piglet death (Record dead) | → recorded; her alive count drops, born unchanged | S — owner decision 2026-10-10 (answers Q5) | `fa-m4-piglet-deaths-after-sow-died` |
| M-5 | M0 | Other | → an optional free-text line | S — RUL Starting and ending | — |
| M-6 | M1 | her alive piglets | handoff:piglet processing when hand-reared (M-12, M-13); otherwise allocated (M-7 on) | S — RUL Starting and ending; owner decision 2026-10-10 | — |
| M-7 | M0 | right after the hold | → title "N piglets to allocate", subtitle "<ID> · <pen> · sow died <time>", three options, footer Back = later (no ✕) | owner decision 2026-10-10 | `fa-m7-allocation-sheet-after-death` |
| M-8 | M7 | Move to other sows, send all | → she leaves the room list | owner decision 2026-10-10 | `fa-m8-all-fostered-she-leaves` |
| M-9 | M8 | Task overview | → "Left the task · 1 sow died"; progress counts 18 (7 / 18 farrowed); every total adds up | owner decision 2026-10-10 | `fa-m9-overview-counts-who-left` |
| M-11 | M7 | Back | → row: red tile "N / to allocate", facts "Sow died" | owner decision 2026-10-10 | `fa-m11-back-row-says-to-allocate`, `fa-m15-back-leaves-row-to-allocate` |
| M-12 | M7 | Hand-rear here | → row: neutral tile "N / hand-reared"; the row stays | owner decision 2026-10-10 | `fa-m12-hand-reared-row-stays` |
| M-13 | M12 | tap the row | → her record, where piglet care continues | owner decision 2026-10-10 | `fa-m13-hand-reared-row-opens-record` |
| M-14 | M7 | Move to a rearing pen | → she leaves the list | owner decision 2026-10-10 | `fa-m14-rearing-pen-she-leaves` |
| M-16 | M7 | farm has no rearing pen | → the third option is absent | owner decision 2026-10-10 | `fa-m16-no-rearing-pen-no-option` |
| M-17 | M11 | tap the row | → the same sheet | owner decision 2026-10-10 | `fa-m17-row-opens-allocation-sheet` |
| M-18 | M17 | Move some (send 5 of 9) | → the sheet returns with the remaining count; her row never says "5 moved" | owner decision 2026-10-10 | `fa-m18-partial-move-keeps-the-rest` |
| M-19 | M18 | Hand-rear here (the rest) | → row "4 hand-reared" | owner decision 2026-10-10 | `fa-m19-rest-hand-reared` |
| M-20 | M-ab | abortion, no live piglet | → she is not listed | owner decision 2026-10-10 | `fa-m20-abortion-no-live-leaves-list` |
| M-21 | M20 | Task overview | → "Left the task · 1 aborted" | owner decision 2026-10-10 | `fa-m21-overview-counts-aborted` |
| M-22 | M-ab | abortion, 1 live piglet | → the row stays: tile "1 / alive", facts "Aborted" (recorded counts only) | owner decision 2026-10-10 | `fa-m22-abortion-with-live-row-stays` |

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

## 8b · Find a sow and Scan ear tags (S)

States: S1 Find a sow, empty field · S2 Scan, no reader paired · S3 Scan, reader connected, listening · S4 Scan, a sow on the farrowing list read (her drawer over Scan) · S5 Scan, any other pig read (her pig record) · S6 Scan, a tag no pig has read (a toast). S-1 to S-12 are owner decision 2026-10-12 (PRD, *Owner decisions, 2026-10-12 · Find a sow and Scan ear tags*). **Amended by owner ruling 2026-10-22: a single-action task's scan opens the sow's drawer, no scanned list**, and Find a sow's rows follow task membership. In Farrowing, Scan ear tags lists nothing and each read opens that sow at once; a multi-select place ticks instead (§8d). S-13 to S-26 keep their ids and leaves: each is amended to the new flow (its old assertion is replaced by a new one), and the leaves of the old scanned list that have no counterpart in Scan now check the same job in Choose pigs (§8d). The demo control "Simulate scan" (outside the phone) reads 000431, 000434, 004318, 000999, 000418 and on; the runner cannot tap it (hidden in the atlas), so the reads themselves are **pending** and the states they produce are leaves.

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| S-1 | S1 | open, before typing | → only the hint; nothing listed; no unit in the header; field focused | S — owner decision 2026-10-12 | `fa-s1-search-lists-nothing-until-typed` |
| S-2 | S1 | type 43 | → "Unit 7" (000431, 004305), then "Unit 3" (000434, 004329), "Unit 6" (000437, 004318) and "Unit 8" (000943): every pig, a sow on the list or not (amended 2026-10-22; was Unit 7, 6, 8 sows only) | S — owner decision 2026-10-12, 2026-10-22 | `fa-s2-search-groups-this-unit-first` |
| S-3 | S1 | type 004 | → a tag that starts with it ranks before a tag that contains it | S — owner decision 2026-10-12 | `fa-s3-tags-starting-with-the-text-rank-first` |
| S-4 | S1 | type B4 | → the sows of pen B4; pen codes match | S — owner decision 2026-10-12 | `fa-s4-pen-codes-match` |
| S-5 | S1 | type 909 | → "No sow matching “909” in any unit." | S — owner decision 2026-10-12 | `fa-s5-no-match-says-so` |
| S-6 | S1 | tap a result in another unit | → her farrowing drawer (the same drawer), subtitle "Unit 6 · A2"; the room stays Unit 7 | S — owner decision 2026-10-12 | `fa-s6-other-unit-result-opens-her-farrowing-drawer` |
| S-8 | S1 | tap the scan icon in the field | → Scan ear tags | S — owner decision 2026-10-12 | `fa-s8-search-scan-icon-opens-scan` |
| S-27 | S1 | type 43, tap the scan icon, then the back arrow | → Find a sow again with 43 typed and its results, not the room | I — Back returns to where you came from (design system, Back) | `fa-s27-back-from-scan-returns-to-find-a-sow` |
| S-9 | S1 | Cancel | → the room list | S — owner decision 2026-10-12 | `fa-s9-cancel-returns-to-the-room` |
| S-10 | S2 | open | → "Scanner not connected" and the pairing instruction; no pill, no list, no button | S — owner decision 2026-10-12 | `fa-s10-no-reader-says-so-with-no-buttons` |
| S-11 | S2 | back arrow | → the room list | S — owner decision 2026-10-12 | `fa-s11-back-arrow-leaves-scan` |
| S-12 | S3 | open | → "Hold the reader to an ear tag" / "Each sow opens as soon as her tag is read."; Stop scanning (the only status); no banner, no "Not found" (amended 2026-10-22; was "Each sow you scan appears here.") | S — owner decision 2026-10-12, 2026-10-22 | `fa-s12-connected-empty-says-hold-the-reader` |
| S-13 | S3 | read the page | → amended: Scan lists nothing, no rows, no tick boxes (was one card per unit, newest first) | S — owner ruling 2026-10-22: a single-action task's scan opens the sow's drawer, no scanned list | `fa-s13-scans-listed-newest-first-in-two-groups` |
| S-14 | S1 + 43 | read the rows | → amended: a sow on the farrowing list: tag over "Pen B4", her farrowing state on the right ("3 days" / "Overdue" for 000431); any other pig: tag over her pen, her condition tag or nothing (000434 in Unit 3 "Thin"; 004329 nothing) (was: the scan row, tick box + door) | S — owner ruling 2026-10-22: a single-action task's scan opens the sow's drawer, no scanned list; search rows follow task membership | `fa-s14-scan-rows-are-select-and-door` |
| S-15 | S3 | Stop scanning | → amended: "Scanning is stopped" / "Resume scanning to open the next sow."; the footer offers Resume scanning (was: the list is kept) | S — owner decision 2026-10-12; owner ruling 2026-10-22: a single-action task's scan opens the sow's drawer, no scanned list | `fa-s15-stop-scanning-pauses-and-keeps-the-list` |
| S-16 | S3 stopped | Resume scanning | → Stop scanning; listening again | S — owner decision 2026-10-12 | `fa-s16-resume-scanning-listens-again` |
| S-17 | Choose pigs | tick one pig | → amended: "Next · 1 pig", on (was: the scan list's selection bar, "1 sow selected" + Actions); choosing many pigs lives in §8d | S — owner ruling 2026-10-22: a single-action task's scan opens the sow's drawer, no scanned list; §8d | `fa-s17-one-ticked-shows-the-selection-bar` |
| S-18 | the Actions menu | read the verbs | → amended: Condition, Treat, Care, Note, Measure, Feed, Transfer in the tile grid; no Death and no Farrowing action (was: the scan list's Actions sheet, four verbs) | S — owner ruling 2026-10-22: a single-action task's scan opens the sow's drawer, no scanned list; §8d | `fa-s18-actions-offer-the-generic-actions-only` |
| S-19 | Choose pigs, 3 ticked | read the footer | → amended: the count is inside the primary "Next · 3 pigs"; no separate count text (was "N sows selected" as plain text) | S — owner ruling 2026-10-22: a single-action task's scan opens the sow's drawer, no scanned list; §8d | `fa-s19-selection-count-is-plain-text` |
| S-20 | Choose pigs, 3 ticked | untick all three | → amended: Next is off again, reading "Next" (was: Stop scanning returns) | S — owner ruling 2026-10-22: a single-action task's scan opens the sow's drawer, no scanned list; §8d | `fa-s20-unticking-the-last-sow-brings-stop-scanning-back` |
| S-21 | S4 | the reader reads a sow on the farrowing list | → amended: her farrowing drawer over Scan, at once; nothing is added to a list (was: tap her row) | S — owner ruling 2026-10-22: a single-action task's scan opens the sow's drawer, no scanned list | `fa-s21-scan-row-opens-her-drawer`, pending `fa-s35-a-read-opens-her-at-once-with-no-list` (the read) |
| S-22 | S4 | Back from her drawer | → amended: Scan, still listening (was: the scan list, unchanged) | I — a scan visit is work in progress; owner ruling 2026-10-22: a single-action task's scan opens the sow's drawer, no scanned list | `fa-s22-back-returns-to-the-scan-list` |
| S-23 | Choose pigs, 3 ticked | open the filter, then its Back | → amended: the three ticks are kept, "Next · 3 pigs" (was: a tick survives opening a sow) | I — as S-22; §8d | `fa-s23-ticks-survive-opening-a-sow` |
| S-24 | Choose pigs, reads that cannot join | the reader reads a pig of another unit (000434) | → amended: she sits under the "Unit 3" heading above the pens, with no tick box (was: tap a scanned row in another unit) | S — owner ruling 2026-10-22: a single-action task's scan opens the sow's drawer, no scanned list; §8d | `fa-s24-scan-row-in-another-unit-opens-her-drawer` |
| S-25 | Choose pigs, scanning | the reader reads a pig of this unit | → amended: one row, ticked once (was: a repeat scan does not duplicate the list row) | S — owner ruling 2026-10-22: a single-action task's scan opens the sow's drawer, no scanned list; §8d | `fa-s25-repeat-scan-does-not-duplicate` |
| S-26 | Choose pigs, scanning | the reader reads a pig | → amended: her row holds the arrival tint, no other row is lit (was: her scan row slides in lit) | S — owner 2026-10-20, owner ruling 2026-10-22: a single-action task's scan opens the sow's drawer, no scanned list | `fa-s26-a-new-scan-lights-her-row` |
| S-26 | the Actions menu | tap Note | → amended: Choose pigs, line "Note · tick each pig in Unit 7, or scan." (was: the note page for the first ticked sow) | S — owner ruling 2026-10-22: a single-action task's scan opens the sow's drawer, no scanned list; §8d | `fa-s26-actions-note-opens-the-note-for-the-first-sow` |
| S-29 | S1 + 43 | tap a pig that is not on the list (000434) | → her pig record, not a farrowing drawer; its line "Not in Farrowing · Unit 3 · A2"; Back returns to Find a sow with 43 typed | S — owner decision 2026-10-22 | `fa-s29-a-pig-not-on-the-list-opens-her-pig-record` |
| S-34 | S4 | the reader reads a sow on the list in another unit (004318) | → her farrowing drawer (the same drawer), subtitle "Unit 6 · A2" | S — owner decision 2026-10-12, 2026-10-22 | pending `fa-s34-a-sow-in-another-unit-opens-her-drawer` (the read) |
| S-35 | S5 | the reader reads a pig that is not on the list (000434) | → her pig record, line "Not in Farrowing · Unit 3 · A2" | S — owner decision 2026-10-22 | `fa-s36-a-pig-not-on-the-list-opens-her-pig-record` |
| S-36 | S5 | the reader reads a pig that died or was sold (000512) | → her pig record with "Died 14 Oct" first, not "Not in Farrowing" | S — owner decision 2026-10-22 | `fa-s37-a-pig-that-died-opens-her-record-with-died-first` |
| S-37 | S6 | the reader reads a tag no pig has (000999) | → nothing opens; a toast on Scan: "No pig with this tag" / "000999 · New tag, or not synced yet", a ✕ at its left, the rest one door to her pig profile | S — owner decision 2026-10-22 | `fa-s38-an-unknown-tag-gives-a-toast-on-scan` |
| S-38 | S6 | tap the toast's ✕ | → the toast closes; Scan keeps listening | S — owner decision 2026-10-22 | `fa-s39-the-toast-x-closes-it` |
| S-39 | S6 | tap the rest of the toast | → her pig profile (deals with a new tag), line "No pig with this tag" | S — owner decision 2026-10-22 | `fa-s40-the-toast-door-opens-her-pig-profile` |

E-11 is superseded twice: a scan no longer opens her sheet from the room by itself (owner decision 2026-10-12: it listed her), and, amended 2026-10-22, a read in Scan ear tags opens her farrowing drawer over Scan, not the room (S-21); the read cannot be driven by the runner, so `fa-e11-scan-ear-tag` stays pending.

## 8c · Pen map (P)

States: P1 the room open on its map · P2 the room on its Active tab, then the map. All S — owner decision 2026-10-14 (the PenMap design; `atlas/` notes of `farrowing.pen-map`).

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| P-1 | P1 | tap a pen that has sows | → the room list, that pen pinned under the tabs, its header in the tapped tile's colour (a ring for a white tile), settling in 1.6 s | S — owner decision 2026-10-14 | `fa-p1-tap-a-pen-goes-to-it` |
| P-2 | P1 | hold a pen 500 ms, let go | → a peek of its sows was shown; the map stays open; the pen is not opened | S — owner decision 2026-10-14 | `fa-p2-hold-a-pen-peeks-and-stays` |
| P-3 | P1 | read an empty pen | → disabled, its code and nothing else | S — owner decision 2026-10-14 | `fa-p3-empty-pens-are-disabled` |
| P-4 | P1 | open Pen map again after going to B4 | → B4 in view, no ring or fill | S — owner decision 2026-10-14 | `fa-p4-map-opens-on-the-current-pen` |
| P-5 | P2 | open the map on the Active tab | → pens the tab hides are disabled; the legend follows the tab | S — owner decision 2026-10-14 | `fa-p5-a-pen-the-tab-hides-is-disabled` (EN only: the room list behind the map is not drawn in Chinese) |

## 8d · Actions for pigs in this unit (B)

States: B1 the room list · B2 the room list, no tag reader paired · B3 Choose pigs, scanning · B4 Choose pigs, reads that cannot join · B5 Choose pigs, three pigs ticked · B6 the room after saving. All S — owner decision 2026-10-22 (feature.json *Actions for pigs in this unit*; owner story: perform other actions on the pigs of this unit without switching to Inspection). The room dock's ··· opens the menu "Actions" with the line "Pigs in Unit 7"; a verb comes first, then the pigs of this unit (the farrowing sows and the other pigs, not a sow that died, not another unit), chosen in Choose pigs (search with scan inside it, a filter, tick rows by pen); Next opens the verb's own form (Inspection's), saved once for every pig chosen. Death is not a verb: it cannot be undone, so it stays one pig at a time. In Choose pigs a scan **ticks**; a read that cannot join (another unit, a pig that died or was sold, a tag no pig has) is not lost and not ticked: it goes into a card at the top of the list. The demo control reads 000431, 004305, 000434, 000512, … while scanning (and reads "Simulate reader on" while the bar waits for the reader); the runner cannot tap it, so the reads are **pending** and the states they produce are leaves.

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| B-1 | B1 | tap ··· (Actions) in the dock | → the menu "Actions", line "Pigs in Unit 7" | S — owner decision 2026-10-22 | `fa-b1-dock-actions-opens-the-pigs-sheet` |
| B-2 | B1 + menu | read the verbs | → Condition, Treat, Care, Note, Measure, Feed, Transfer; no Death, no Record dead | S — owner decision 2026-10-22 (death can't be undone) | `fa-b2-verbs-are-the-everyday-ones-and-death-is-not-one` |
| B-3 | B1 + menu | tap Condition | → Choose pigs: search field "Ear tag or pen" with a scan button, a filter button, "Condition · tick each pig in Unit 7, or scan.", footer Back + Next (off) | S — owner decision 2026-10-22 | `fa-b3-a-verb-opens-choose-pigs` |
| B-4 | B1 + Choose pigs | read the list | → Unit 7's living pigs in pen cards (B1, B2, B3, B4, D2): sows with their farrowing row, other pigs with the generic row; the dead sow 000399 is not listed; no pig of another unit | S — owner decision 2026-10-22 | `fa-b4-choose-pigs-lists-this-unit-only-and-no-dead-sow` |
| B-5 | B1 + Choose pigs | tick a pig; tick another; untick the last | → "Next · 1 pig", "Next · 2 pigs" (a pig outside Farrowing counts too); with none ticked Next is off again | S — owner decision 2026-10-22 | `fa-b5-ticking-a-pig-turns-next-on-with-the-count`, `fa-b6-the-count-follows-the-ticks`, `fa-b7-unticking-the-last-pig-turns-next-off`, `fa-b21-three-ticked-offers-next-with-three-pigs` |
| B-6 | B1 + Choose pigs | type 43 in the field | → only Unit 7's matches: 000431 (B4) and 004305 (D2); Unit 3's 000434 and 004329 are not offered | S — owner decision 2026-10-22 | `fa-b8-search-narrows-the-unit-list` |
| B-7 | B1 + Choose pigs | tap the filter button; choose Has a condition; Show N pigs | → the sheet "Filter pigs" with "Show 8 pigs"; the count follows the choice ("Show 1 pig"); applied, the list is 004305 and the button says one filter is applied | S — owner decision 2026-10-22 (the filter as To treat's) | `fa-b9-filter-sheet-counts-the-pigs-it-shows`, `fa-b10-filter-count-follows-the-choice`, `fa-b11-applied-filter-narrows-the-list` |
| B-8 | B1 + Choose pigs | tap the scan button (reader connected) | → the field becomes the bar "Scanning" / "Scan to tick pigs" with Stop; the list stays | S — owner decision 2026-10-22 | `fa-b12-scan-button-turns-the-bar-to-scanning` |
| B-9 | B1 + Choose pigs | Back | → the menu "Actions" | I — Back returns up a level (design system, Back) | `fa-b13-back-from-choose-pigs-returns-to-the-menu` |
| B-10 | B2 | tap the scan button, no reader yet | → the bar "Waiting for reader" / "Make sure Reader 1 is on" with Stop | S — owner decision 2026-10-22 | `fa-b14-scan-with-no-reader-waits-for-it` |
| B-11 | B2 | the reader connects | → the bar becomes "Scanning" by itself | S — owner decision 2026-10-22 | pending `fa-b15-reader-connects-scanning-starts` (the demo control) |
| B-12 | B3 | the reader reads a pig of this unit | → she is ticked where she is, her row marked as the arrival; the count follows ("Next · 2 pigs"); a repeat read keeps her ticked | S — owner decision 2026-10-22 | `fa-b16-a-read-of-a-pig-in-this-unit-ticks-her`, pending `fa-b17-reading-the-next-pig-ticks-her-too` (the read) |
| B-13 | B4 | the reader reads a pig of another unit, a pig that died or was sold, a tag no pig has | → not ticked, no tick box: cards at the top, newest first: "Unit 3" (000434), "Not on the farm" (000622 Sold 2 Oct, 000512 Died 14 Oct), "No pig with this tag" (000999); then the heading "Unit 7" and the pens; the count stays | S — owner decision 2026-10-22 | `fa-b18-reads-that-cannot-join-go-in-the-top-cards`, `fa-b19-reads-that-cannot-join-are-not-ticked`, pending `fa-b20-the-next-read-from-elsewhere-joins-the-top-cards` (the read) |
| B-14 | B5 | Next · 3 pigs | → the verb's own form (Inspection's Record health), "Save · 3 pigs" | S — owner decision 2026-10-22 | `fa-b22-next-opens-the-verbs-own-form-for-all-three` |
| B-15 | B6 | save the form | → back on the room list with the toast "Condition recorded · 3 pigs" (the leaf checks the state after saving: the form's own picker is Inspection's) | S — owner decision 2026-10-22 | `fa-b23-saving-returns-to-the-room-with-the-count` |

## Walk personas (for `docs/design-workflow/briefs/walk.md`)

One per main branch, plus the breaker: **s1** night shift counting two sows at once (C, D) · **s2** a sow dies
mid-farrowing (M) · **s3** next shift continues another hand's records from the room (E, D-1, F) · **s4** a wrong
figure found after the lock (X) · **s5** a stillborn is the first thing that happens (A) · **s6** supervisor ends the
task with laggards and an unsaved draft somewhere (K, Q2) · **s7** interrupted: phone pocketed, app closed mid-drawer
(D-6, D-7) · **s8** Home and Choose unit, unit to unit (E-1, E-2) · **breaker**: extremes, Back and reload everywhere,
360 and ZH.

## 9 · Open questions (decision-blockers)

1. **Q1 · Is fostering in Farrowing's scope?** *Partly answered 2026-10-10: in scope for the sow-died case (M-7, M-8, M-18); parked elsewhere.* RUL *After the lock* parks it ("v1 farrowing ships NO foster doors");
   the PRD lists it Out; yet `farrowing.foster` exists, reached from More actions. *(C-7, `fa-z1-fostering-scope`)*
2. **Q2 · Can the task end while a sow is farrowing?** The PRD blocks it ("blocked while farrowing is open", with
   CLOSURE: drafts block too); the contract C9 says "close never blocks on them" (ACTIVE sows list informationally),
   SYN §6 E2 recommends warn + doors, and RUL piglet-processing Round 4 allows End with review items open.
   *(K-2, `fa-k2-end-while-farrowing`)*
3. **Q3 · Does the due-range filter apply to Active and Done sows?** *(E-7)*
4. **Q4 · After the lock, which door records a piglet death?** *(X-7)*
5. **Q5 · May piglet deaths be recorded after the sow died?** *Answered 2026-10-10: through Record dead; the count drops. (M-4, now a leaf)*
6. **Q6 · Where do awaiting sows go when the task ends early?** *(K-7)*
7. **Q7 · How does a pre-lock Alive correction below the floor restate Born?** *(X-8)*
8. **Q8 · Does a correction after End change the receipt?** *(K-8)*

Also standing as a recommendation, not a ruling: review tasks-built-21 proposes reversing D-1 (discard with a confirm).
RULINGS wins until the owner rules, so D-1 keeps its expectation.
