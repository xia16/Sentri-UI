# Scenario 7 (supervisor End), round 2 report

Head `dd44ca2` on `map/3-piglet-processing`, server on port 4957. Screenshots and scripts are in `C:/Users/ying_/AppData/Local/Temp/claude/C--Users-ying--Documents-Codex-2026-09-08-clo-Sentri-UI-pilot/ac8e28b9-518e-469b-8aa6-3533607c5adc/scratchpad/walk/r2-s7/`. In the list below, `03-base-end.png` and the other names are files in that folder. I walked at 390×844 in en, at 360×740 in en once, and at 390×844 in zh once.

I started from `room.html`. Data variants used: `base` (farrowing open), `late` (17 Oct, farrowing ended), and the post-End variants `ended`, `ended-after-end`, `ended-late-mark` and `ended-after`. Several scripts load a `?state=` URL directly to save time. The state is a start URL, and the taps from that screen are the real ones.

## Walk summary
- **End while blocked:** Overview, then End task, shows a red "Farrowing task is still open" banner. It names D01 and says to end it in Farrowing. The farrowing task can't be ended from inside this task, so this cannot be resolved here (S-1, S-2).
- **Drafts blocker:** `end-blocked-draft` lists a death draft on D03 and a correction draft on A05. Saving the D03 draft really commits the death, but the End page still lists it as unsaved (S-3).
- **Correction before End:** The overview opens at 14/20 finished. The wrong-litter mark is a castrate on B03, meant for B01, entered at 15:40 by L. Madsen. I corrected it and then ended:
  - I found the mark via the overview's "Today's records, by hand", then the litter log, then the room's Done lens and the B03 drawer. B03 showed "All done · done 20 days late" because of the wrong mark.
  - Tapping the recorded Castrate row opened Edit on that record. I stepped it to 0, picked "Done on another crate", and chose B01 ("owes 1"). The save reads "Correction saved · B03 Castrate owed 0 → 1 · B01 Castrate owed 1 → 0".
  - I then ended. The End review showed a "Ending now drops 28 scheduled piglet-doses" warning, one item open for review (A05 possible double), and the hold-to-End button.
- **After End:**
  - **Receipt:** it reads "Task ended Oct 17 16:32", with unresolved A05 and "For weaning".
  - **Not done at end:** the room and drawers read as ended ("Not done / Finished / All", "can no longer be recorded"). Edit, Record death, Set count and Move stay available, which matches the rulings.
  - **Offline late treatments:** on `ended-after-end`, B01 shows "After end · Castrate 1 · kept · not counted" on the litter and the receipt. On `ended-late-mark`, C02's mark stamped before End is "accepted".

## Findings

**S-1. End-blocked offers no way to Farrowing.** The page says "End it in the Farrowing task on the Tasks list", but the D01 row opens D01's litter drawer. The drawer's "Farrowing sheet" door ("Dead, count, birth litter weight · still open") does nothing on tap (`03-base-end.png`, `04-d01.png`, `05-farrowsheet.png`). Expected a door to the farrowing task.
- Class: change a slice (`end.html`, `litter.js`).
- Status: R1-30 still broken in a different form. The concept-board link is gone, but there is no working path.

**S-2. Piglet-processing End can't be completed after a farrowing block.** Nothing in the task resolves it. Only the `late` variant, where farrowing ended on 3 Oct, can End. A supervisor following the steps lands on an unfinished End.
- Class: owner or hand-off to farrowing, plus the S-1 slice.

**S-3. The drafts blocker can't be cleared.** In `end-blocked-draft`, I opened the D03 death draft and saved it. The death was written (D03 went to Dead 2, Unexplained loss 1), but the End page returned still saying "2 unsaved drafts on this phone" with D03 listed (`53-after-save.png`). Clear on that draft did not return me to the End page (`54-clear.png`).
- Class: change a slice (`end.html`).

**S-4. A real unsaved draft does not gate End.** I started Set count on A02 and left with Back. The litter drawer correctly shows "10 counted · not saved" (`58-after-back.png`). The End review ignored it, with no warning or block. The device-drafts gate is read from a fixed fixture list, not from this phone.
- Class: change a slice (`end.html`).

**S-5. "Today's records, by hand" is stale after a correction.** After the B03 to B01 correction, the list still shows "B03 · Castrate · 1 15:40" under "A mark on the wrong litter shows here · open it to correct" (`22-day-after.png`). The correction is not listed.
- Class: change a slice (`end.html`).
- Related: the list is reachable only from the overview, not from the End review where the supervisor decides. Also, Back from the litter log goes to the room's litter drawer, not to this list.
- Status: R1 N5 is handled by the page, but this staleness is new.

**S-6. The correction message explains B03 poorly.** "B03 Castrate owed 0 → 1" does not say this is B03's real deferred-sick debt coming back. The B03 room row then reads "Castrate · 11 piglets" with no "due … ago" line, unlike C04's "due 16 days ago". The drawer reads "20 days late".
- Class: change a slice (`edit.html` message, `room.html` row meta).

**S-7. "Unfinished" is overstated.** The End review says "6 litters unfinished". The unfinished-litters sheet lists C02, D01 and D06 as "Only doses not yet due", so only 3 are really unfinished (`08-litters.png`). B04 "Coccidiosis treatment missed · 10 owed" is counted as owed, while the room says "Past the last day · not owed, not overdue".
- Class: change a slice (`end.html`).
- Status: R1-21 and R1-16 still broken.

**S-8. The receipt and handoff numbers don't reconcile.** The receipt says "Owed 14 · Unfinished litters 6" and doesn't mention the 28 dropped doses it warned about. The weaning handoff says "Not done at end 42 piglet-doses", and calls not-yet-due Health shot doses "28 not done at end". The ended room says "Health shot · 13 not done" with "not due at end" on the same row.
- Class: change a slice (`end.html`, `room.html`).
- Status: R1-21 still broken (wording).

**S-9. An accepted late mark still reads as not done.** On `ended-late-mark`, the receipt says C02's 16:05 health shot was stamped before End and is "accepted". The C02 drawer shows both "Health shot 13 not yet due at end" under "Not done at end" and "Health shot 16:05 · 13 piglets · early" as recorded. The room row still says "Health shot · 13 not done" (`44-c02-latemark.png`).
- Class: change a slice (`room.html`, `litter.js`).

**S-10. The frozen headline sits next to live meta.** On `ended-after`, C02's row says "13 not done" with "7 piglets" alive (after 2 deaths and 4 moved out). D01 says "9 not done · 11 piglets".
- Class: change a slice (`room.html`).
- Status: the R1-21 "half frozen, half live" pattern, now in the room.

**S-11. The handoff header counts 21 litters but lists 20.** On `ended-after`: "By litter 21 litters" and "Litter weights 17 of 21 litters", with "3 not yet at day 21" and only 20 rows (Row A 4, B 8, C 4, D 4).
- Class: change a slice (`end.html`).

**S-12. A handoff treatment row opens only the first crate.** "Castrate · 4 not done" lists "B01 C04" but opens B01 only. The `ended` and `late` fixtures differ here because the wrong mark was not corrected in `ended`.
- Class: change a slice (`end.html`).
- Status: R1-21 "rows not tappable" is mostly fixed.

**S-13. The offline worker's own phone is not designed.** The receipt says "that phone shows it saved · after end", but no such screen exists in the task.
- Class: new slice (the R1 N3 gap is still open).

**zh and 360:** zh walked clean, with no English leaks and no raw keys. Minor: "截至结束应做157" has no unit. 360×740 had no clipping on the Edit sheet, End review or receipt.

## What worked well
- Edit from the recorded row opens straight on that record.
- The wrong-litter correction is clear: "Done on another crate" lists only crates that owe, and the save message names both litters and both debts.
- The End warning "Ending now drops N doses" is shown before the hold.
- The hold works, and the receipt shows who ended and when.
- A late mark flagged "after end" is kept, stamped and not counted (B01 on `ended-after-end`).
- The B01 header balances (Born 14, Dead 2, Moved out 3, Alive 9).

## New scenarios
- N-A: End started from a phone with an unsaved draft that the ledger can't see (S-4).
- N-B: A correction made before End should refresh the End review's "by hand" list (S-5).
- N-C: A late mark accepted after End should change the litter's not-done row (S-9).

Nothing in this walk is a new module. Everything above is "change a slice" except S-2 (owner or farrowing hand-off) and S-13 (new slice).