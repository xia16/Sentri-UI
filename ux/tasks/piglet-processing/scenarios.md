# Piglet processing — scenario rounds

Each whole-task round: eight walk-throughs (one worker scenario each) and one breaker, in a real browser, starting from the room list. Findings are classified: **handled** · **change a slice** (page named) · **new slice** · **new module** · **owner** (reserved decision). The task is settled after two consecutive rounds find nothing that changes the design.

## Round 1 — 2026-09-29, map `84fd1c6`

Walks: s1 day-3 round · s2 tag & weigh · s3 deaths · s4 fostering (partial iron) · s5 counts · s6 orphans · s7 supervisor End · s8 offline collisions · breaker. Every walk found something that changes the design. **Round 1 is not clean.**

Findings are grouped by the fix they need; the walks that hit each are in brackets.

### Blockers

| # | Finding | Class |
|---|---|---|
| R1-1 | The identity page takes no taps: its sheet sits inside `.page-background` (`pointer-events:none`) and nothing turns them back on. Tag-and-weigh dead-ends. [s2, breaker] | change a slice · `id.html` |
| R1-2 | An `arrived · unknown` row opens a dose drawer at `0 owed` with every control disabled; the resolve sheet (Already had it / Record now / Leave owed) lives only on `move.html`. Q14 promises both answers on the litter. [s4, s5, s7, breaker] | change a slice · `litter.html` |
| R1-3 | After a `Don't know` move, the source keeps one-tap `Record 5` for its deferred piglets; the `6–9 of 11 · check` range disappears after the move. Tapping it double-doses. [s4] | change a slice · ledger + `litter.html` |
| R1-4 | Moved piglets are scheduled by the receiving litter's age, not their own: day-1 piglets in a day-5 litter show iron `late 2 days`, cord `late 5 days`. [s5, s6] | change a slice · ledger |
| R1-5 | Move's crate search and scan do nothing (`S.query` is never set): no move across rows or rooms, and no worker path to another room. [s4, s6] | change a slice · `move.html`, `room.html` |
| R1-6 | A count that finds missing piglets opens a gain beside the loss, and the gain owes every treatment as `unknown`, late, even when records covered them. [breaker, s5] | **owner** (Q-A) + change a slice · ledger, `count.html` |
| R1-7 | A death on the wrong litter, or recorded by mistake, can't be corrected: Edit lists no deaths. [s3, breaker] | change a slice · `edit.html` |
| R1-8 | A body found in a neighbour crate is saved as that crate's death; the owning litter's open loss is never offered. [s3] | change a slice · `dead.html` |
| R1-9 | A tagged missing piglet's body can never close the loss: Set count assumes the missing one is untagged. [s3, s5] | change a slice · `count.html`, `dead.html`, contract |

### Wrong or contradictory facts

| # | Finding | Class |
|---|---|---|
| R1-10 | The litter header (Born · Alive · Dead) doesn't balance after moves or unexplained lines (alive > born). [s4, s5, s6, s7, breaker, s1] | change a slice · `litter.html`, `edge.html` |
| R1-11 | Count copy contradicts round 3: "…until a body, a move or a recount closes it"; the gain heading says a body explains a gain. [s3, s5, s8, breaker] | change a slice · `count.html`, strings |
| R1-12 | End receipt says "except catch-up for piglets moved in after End"; `pp.end.tok.in_after` says catch-up. Round 3 removed catch-up. [s7, breaker] | change a slice · `end.html`, strings |
| R1-13 | After End, the room and litters still read as an open task (Owed lens, "2 litters owe today", "Owed today · 5 of 7 left", Later rows); a second End shows the wrong ender only after the hold. [s7, breaker] | change a slice · `room.html`, `litter.html`, `end.html` |
| R1-14 | The record page still says `unexplained` after a line is explained; a held death reads as applied; a withdrawn count reads "corrected". [s3, s5, s8] | change a slice · `edit.html` record page |
| R1-15 | Time: every new record reads "1h ago" (`U.ago` rounds a future stamp up; fixture clock fixed at 10:30); stamps go backwards; "Last record" picks the wrong event; raw key `pp.common.tx.undefined` after a correction. [all] | change a slice · `shell-ui.js`, `fixtures.js`, `room.html` |
| R1-16 | Room: deferred looks like late; a litter done late shows no late marker; missed filed under Later and counted as owed (Q15); "Nasal drops 9 of 9 piglets" reads done; the filter changes the headline silently and hides just-done litters. [s1, breaker] | change a slice · `room.html`, `end.html` overview |
| R1-17 | Day-3 identity is never shown as owed (Q17). [s1, s2, breaker] | change a slice · `room.html`, `litter.html` |
| R1-18 | Receiver-side: Move asks what the app knows (all-done / none-done sources) and invents source doubt (`10–11 of 11 · check`); visible treatments (tail) marked unknown; receiver doesn't say which piglets owe (`from B01 · tags`). [s4, s5, s6, breaker] | change a slice · `move.html`, ledger |
| R1-19 | A litter emptied by moves stays owed for ever (castrate due, 0 alive); its only clear is a false "No males". [s6, breaker] | change a slice · ledger, `litter.html` |
| R1-20 | Two concurrent counts that agree net of a death one phone hadn't seen are flagged as disagreeing and hold the loss line (Alive 13 while the crate holds 12). [s8] | change a slice · ledger |
| R1-21 | End overview: deaths that explained a missing piglet drop out of "Piglet deaths"; open doubles inflate Done; End-blocked counts not-yet-due doses as unfinished litters; receipt half frozen, half live; weaning handoff wording ("not yet due", "owed"), rows not tappable, stale weight read as today. [s7, s8, breaker] | change a slice · `end.html` |
| R1-22 | Held body and count conflict are invisible on room, litter and dead; the held question is under the stepper sheet. [s8] | change a slice · `room.html`, `litter.html`, `dead.html`, `count.html` |
| R1-23 | Identity: same-litter duplicate assumed a re-catch; cross-litter duplicate flag doesn't travel; litter-weight receipt contradicts its tile; numpad hides counters; litter weight caps at 2 digits; notch 99 refused silently; keepers "so far" after closing; interrupted piglet and weight dropped silently. [s2, breaker] | change a slice · `id.html`, `litter.html` |

### Misleading taps and lost work

| # | Finding | Class |
|---|---|---|
| R1-24 | Browser/phone Back with a drawer open drops the draft; no Resume. [breaker] | change a slice · `litter.html` (shell) |
| R1-25 | Litter drawers: "No males" wipes entered counts; 0 treated + all weak writes a "0 piglets" record; Save looks enabled but is aria-disabled with no feedback; one-tap `Record 12` has no Undo; one reason covers all untreated piglets; partial record missing from Recorded until reopen; early castration filed under Later. [s1, breaker] | change a slice · `litter.html` |
| R1-26 | Dead drawer: steppers prefill the litter's running total; photos announced but not kept; Save lands on a host stub (extra Back); Back from explain returns to the sheet. [s3, s8] | change a slice · `dead.html` |
| R1-27 | Set count: no sanity limit (42 in a litter of 13; 0 with no "moved or weaned?"); stale unsaved draft invisible. [breaker] | change a slice · `count.html` |
| R1-28 | Edit: "Done on another crate" hidden behind −; castration offers Weak/Sick instead of Q16 reasons; corrections leave no amber/stamp on the litter; corrections silent (no receipt, no effect on the line). [s5, s7, breaker] | change a slice · `edit.html`, `litter.html` |
| R1-29 | Possible double treatment has no answer: the only way out is "Recorded by mistake · stays owed" (wrong). [s8] | **owner** (Q-B) + change a slice · `litter.html`, `edit.html` |
| R1-30 | End-blocked's farrowing link opens the concept board; receipt Back goes to the designer index. [s7, breaker] | change a slice · `end.html` |
| R1-31 | Move: iron question below the fold, defaulted; no "All" for tagged; picker "all done" for no-task/missed litters; no warning at 25 piglets; picking the source itself is silent. [s4, s6, breaker] | change a slice · `move.html` |

### New scenarios

| # | Scenario | Class |
|---|---|---|
| N1 | Orphans that still owe (overdue) moved to a nurse sow outside every task — dead end today. [s4, s6] | **owner** (Q-C) |
| N2 | End with open review items (possible double, disputed count, held body). [s8] | **owner** (Q-D) |
| N3 | The offline worker's own phone: "not synced yet", "your record was held", "kept but not counted after End". [s7, s8] | new slice |
| N4 | Room-level list of everything held for review. [s8] | change a slice · `room.html` |
| N5 | A wrong-litter mark that exactly fills that litter's deferred owed hides the real debt; End review could list the day's records by hand. [s7] | change a slice · `end.html` |
| N6 | Ending before scheduled doses fall due silently drops them; warn on the End review. [s7] | change a slice · `end.html` (with provisional *early End counts not-yet-due*) |
| N7 | Double-issued tag: two piglets in one litter carry the same printed number. [s2] | change a slice · `id.html` |
| N8 | Weigh day other than day 3 (weaning, litter > 99 kg). [s2] | change a slice · `id.html` |
| N9 | Search by sow number or crate card. [breaker] | change a slice · `room.html` Find |
| N10 | Tagged piglet dies in the same visit; weight stamped with the alive count at the time; two phones tagging online. [s2] | handled by ledger stamps (D); two-phone tag suggestion → Not yet specified |
| N11 | A farm treatment not in the configuration (teeth). [s1] | out of scope: treatments come from farm configuration |
| N12 | Split untreated reasons within one dose (1 weak, 1 sick); hernia piglet identity. [s1] | change a slice · `litter.html` |

### Owner questions raised

- **Q-A** — does a counted gain owe treatments? (R1-6)
- **Q-B** — a possible double treatment: what are the answers, and is "given twice" recorded? (R1-29)
- **Q-C** — orphans that still owe, moved to a sow outside every task. (N1)
- **Q-D** — does End wait for open review items? (N2)
- Who may answer a review → *Decided for you* (provisional): anyone who can record in the task, stamped with who and when.

## Round 2 — 2026-10-05, map `dd44ca2` (after the rebuild on farrowing's skeleton)

Same nine walks (Sonnet), each also asked to flag anything unlike farrowing or cluttered. Reports: `scratchpad/walk/r2-*-report.md`. **Round 2 is not clean.** No walk found the UI unlike farrowing; the findings are behaviour, wrong facts and density inside the new shell. Round-1 items confirmed fixed: R1-1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 14, 18, 19, 20, 24, 25, 27 (logic), 28, 29, N1 (join), N7. Partly fixed: R1-16, 21, 22, 23, 30, N4, N9.

### Wrong facts and dead ends (blockers)

| # | Finding | Class |
|---|---|---|
| R2-1 | Identity: Record on an empty tag field records the greyed "next tag" as a real piglet. [s2] | change a slice · `id.html` |
| R2-2 | Set count refuses a real gain ≥ +4: the reason and "say it's right" are inside the now-hidden footer status — a dead end (regression from hiding hint lines). [breaker] | change a slice · `count.html` |
| R2-3 | A Move out of a litter with an open loss subtracts again (11 → 10) and leaves the loss open; the loss line has no "in another crate" door. [s5] | change a slice · ledger, `move.html`, `count.html` |
| R2-4 | Answering the source of a "Don't know" move doesn't narrow the receiver — the receiver can record all 3 again. [s4] | change a slice · ledger, litter drawer |
| R2-5 | Arrivals' castration never shows on a receiver of a different age; the receiver goes "done". Arrivals one day younger read "late". [s6, s4] | change a slice · ledger, litter drawer |
| R2-6 | Log after a settled count dispute shows a false "explained by a Move · from {code}" and "matches the litter". [s8] | change a slice · ledger, `edit.html` record page |
| R2-7 | Held body answered through Set count: no receipt, the stepper keeps the old number, one Save writes an invented gain. [s8] | change a slice · `count.html`, litter drawer |
| R2-8 | Killing a whole litter: no confirm, and the closed litter reads "all moved out or weaned". [breaker] | change a slice · `dead.html`, ledger wording |
| R2-9 | `id.html` "More than 12? Set count" does nothing. Re-catch silently drops entered sex/weight. [s2] | change a slice · `id.html` |
| R2-10 | End: the drafts blocker can't be cleared; a real unsaved draft on this phone doesn't gate End; End-blocked has no working path to the farrowing task. [s7] | change a slice · `end.html`, litter drawer |

### Room truth and density

| # | Finding | Class |
|---|---|---|
| R2-11 | Headline numbers disagree: "15 owe today" vs overview "13 owe today", End-blocked "17", review strip vs sheet counts; tabs don't add to the task total. One count rule. [s1, s2, s5, breaker] | change a slice · `room.html`, `end.html` |
| R2-12 | Row meta says the litter size ("12 piglets") not what is owed ("4 owed"); deferred, open loss/gain, half-done identity and drafts are invisible on the row; a late litter can lack its late word. [s1, s2, s3, s5, s6, s8, breaker] | change a slice · `room.html` |
| R2-13 | Identity owed keeps every finished litter in Owed — the headline can't show "treatments done, tagging left". [s1] | change a slice · `room.html` |
| R2-14 | Rows reorder after a record (worker loses their place). [s1] | change a slice · `room.html` |
| R2-15 | Unit 8 (no task) shows Unit 7's overview; a litter outside the task shows an "Owed" list it can't act on. [breaker] | change a slice · `room.html`, litter drawer |

### Litter drawer

| # | Finding | Class |
|---|---|---|
| R2-16 | Mixed-source rows (own + arrivals of another age) merge into one row/one button with a six-line meta; zh "来自A073头". [s4, s6] | change a slice · litter drawer |
| R2-17 | A deferral completed later splits into two rows ("2 piglets" / "10 · 2 deferred"), stale. [s1] | change a slice · ledger, litter drawer |
| R2-18 | One-tap Record N stays while Alive is disputed or held. [s8] | change a slice · litter drawer |
| R2-19 | Castrate: no "Early · due day 5"; "No males" sublabel stale; Deferred re-asks weak/sick. Contradictory arrival answers accepted silently. [s1, s4, breaker] | change a slice · litter drawer |
| R2-20 | Sow death: cause lost after save; a Sow died mark can't be corrected. [s6] | change a slice · litter drawer, `edit.html` |
| R2-21 | At 360 Set count and Move fold into "More actions" — three walks found it costs the core action. [s3, s5, s6] | change a slice · litter drawer (Decided for you: keep four tools at every width) |

### Pages

| # | Finding | Class |
|---|---|---|
| R2-22 | Move is a full page with two Backs, unlike farrowing's drawers; suggestions not ranked by size; crate/tag lookup too strict (`a4`, last digits). [breaker, s4, s5] | change a slice · `move.html`, room Find |
| R2-23 | Dead drawer: Save waits with no visible reason (identified sheet, "None were missing" not tappable-looking, "From the missing" reads as a cause); "Found outside its crate?" only after a count; receipt "B06" bare. [s3, breaker] | change a slice · `dead.html` |
| R2-24 | Explain/suggest: says "Saved" before saving, then asks again; tagged missing piglet not named; "0 min"; no-op counts saved. [s3, s5] | change a slice · `count.html` |
| R2-25 | Edit: Save dead with reason off-screen; duplicate-tag warning hidden under the pad and receipt loses the old tag; mixed death record only withdrawable whole; corrections don't reach the drawer / last record. [s2, s3, s5] | change a slice · `edit.html`, litter drawer |
| R2-26 | End: unfinished overstated (not-yet-due counted); receipt/handoff/room numbers don't reconcile; accepted late mark still "not done"; frozen headline beside live meta; handoff header 21 vs 20 rows; overview rows drop the joined nurse; today's records stale after a correction; answer sheets on a blank backdrop. [s6, s7, s8] | change a slice · `end.html`, `edit.html`, `room.html` |
| R2-27 | Identity: header "Identified 4 · Boars 3 · Gilts 2"; numpad covers weigh-day counters; weigh-first hides the tag; swallowed taps give no cue; keepers row twice; weigh-day weight not shown on the drawer/log. [s2, breaker] | change a slice · `id.html`, litter drawer |
| R2-28 | Bulk: a Sow-died row loses its Done/late; tickable rows can't be opened. [s1] | change a slice · `bulk.html` |

### New scenarios / owner

| # | Scenario | Class |
|---|---|---|
| R2-N1 | An orphan moved onto a litter **outside the task that has her own piglets** pulls her own litter's whole backlog in, unannounced. [s4, s6] | **owner** (Q-E) |
| R2-N2 | Two offline phones each treated a different half of a litter; both "possible double" answers count once, leaving a real double-dose trap. [s8] | **owner** (Q-F) |
| R2-N3 | The offline worker's own phone (not synced / held / kept but not counted) — still undesigned (R1 N3). [s7, s8] | new slice |
| R2-N4 | Where the vet sees "double dose recorded for the vet". [s8] | out of scope → Not yet specified |
| R2-N5 | Orphaned litters and where their piglets went, at End. [s6] | change a slice · `end.html` |
