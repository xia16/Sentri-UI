# Breaker report, piglet processing round 2

Branch `map/3-piglet-processing`, head `dd44ca2`. The server ran on port 4959. I drove it with Playwright at 390×844, plus 360×740 and 320×568 for layout, and `?lang=zh` at 390. Screenshots and scripts are in `C:/Users/ying_/AppData/Local/Temp/claude/C--Users-ying--Documents-Codex-2026-09-08-clo-Sentri-UI-pilot/ac8e28b9-518e-469b-8aa6-3533607c5adc/scratchpad/walk/r2-breaker/`. Names below are relative to that folder.

At 360, 320 and zh there was no horizontal overflow on any of 14 states, and no raw string keys showed.

## Findings

### Dead ends and wrong facts

1. **Set count refuses a real gain of +4 or more, with no visible reason.**
   - **Steps:** A02 → Set count, tap + four times (12 → 16).
   - **Result:** Save goes disabled. The reason ("16 piglets is 4 more than the record's 12 · count again, or say it's right") sits only in a visually hidden status (`tk-footer-status st-visually-hidden`). There is no "say it's right" control.
   - **Expected:** a visible reason and a way to confirm. As built, a stale record or a found or adopted piglet cannot be saved.
   - **Screenshot:** `count16.png`.
   - **Class:** change a slice, `count.html`. This is R1-27, now a dead end.

2. **Killing all 12 in one Save reads as "moved out or weaned".**
   - **Steps:** A02 → Record death, tap Crushed + 12 times, Save.
   - **Result:** there is no confirmation and no Undo. The litter then reads "Litter closed · No piglets left · nothing owed · all moved out or weaned (0 moved out, 0 weaned)". That is wrong, because they died. Cause is silently "crushed", and the drawer already shows "Dead 13".
   - **Expected:** confirm a whole-litter loss, and say "all dead".
   - **Screenshot:** `closed.png`.
   - **Class:** change a slice, `dead.html` and the litter drawer wording.

3. **The litter counts disagree across the room, overview and End.**
   - **Base fixture:** the room header says "15 litters owe today". The overview line says "13 owe today · 7 later". End-blocked says "17 litters with work left".
   - **Review count:** the room strip says "To review 1 · Not yet explained 1", but its sheet says "2 to answer".
   - **Late variant:** the End review shows "Open for review · 1 item" (A05 only) while its own metrics say "Open loss 2". The unexplained D03 loss is not listed.
   - **Screenshots:** `room.png`, `review.png`, `end2.png`.
   - **Class:** change a slice, `room.html` and `end.html`. This relates to R1-21, N2 and N4.

4. **A litter outside the task shows an "Owed" list it cannot act on.**
   - **Steps:** Find `000512`, which opens F02 in Unit 8.
   - **Result:** the drawer says "Not in the task" but headlines "Owed: Cut cord / Nasal drops / Iron / Dock tail, 11 not done" with no Record buttons. The room row says "Nothing due today". Edit, Death, Set count and Move are all live.
   - **Expected:** no "Owed" heading and no treatment rows, or a clear "not tracked here".
   - **Screenshot:** `find-u8.png`.
   - **Class:** change a slice, `litter.js` / `room.html`.
   - **Also:** in Unit 8 the header still shows the Unit 7 overview ("0/20 · 13 owe today") beside "0 litters owe today".

5. **A late litter has no late word on its row.** B09 owes deferred iron (1 day late) and deferred tail, but its meta reads only "10 piglets". A05 says "8 still owed · due today". Class: change a slice, `room.html` (R1-16 residual).

### Misleading taps and lost work

6. **Move is a full page, unlike Set count and Death, which are drawers, and it needs two Backs.**
   - **Steps:** Move → pick A04 → "Move 1".
   - **Result:** a "Spray-mark the piglet" receipt sheet appears. Back lands on a "Moves" list page, which still offers "Move piglets" on a litter that now has 0 alive. A second Back reaches the litter drawer. The Move form has no X.
   - **Screenshots:** `move.png`, `move-t150.png`, `move-done.png`.
   - **Class:** change a slice, `move.html`. This is the R1-26 pattern (extra Back), and the page is unlike farrowing.

7. **Crate and tag lookup is too strict for a gloved typist.**
   - **Crate code:** `a04` works. `a4`, `A 04`, `A-04` and `04` give "No litter at crate …".
   - **Find:** `231` and `0005` do not match sow 000231 or a tag prefix. Only the full number works. A worker reads the last digits off an ear.
   - **Screenshot:** `find.png`.
   - **Class:** change a slice, `move.html` and the `room.html` Find sheet (N9 residual).

8. **Only the one-tap `Record n` has an Undo.**
   - **Result:** the partial treatment save, Death, Set count and Move have none. They need Edit, which does cover deaths now (R1-7 handled).
   - **Layout shift:** the "Saved …" banner pushes the whole drawer down about 30px under the finger.
   - **Class:** change a slice, litter drawer (low).

9. **Drafts disappear from view.**
   - **Steps:** open a Dock tail draft, then tap the scrim or phone Back.
   - **Result:** you land on the room, and nothing there marks the litter as holding a draft. Inside the litter, the Dock tail row shows only "1 unsaved · Resume". It loses the "12 owed" fact and the one-tap Record. The draft survives a reload.
   - **Screenshots:** `unsaved.png`, `unsaved-room.png`.
   - **Class:** change a slice, litter drawer and `room.html`. R1-24 is handled (Resume works). The marker is the residual.

10. **Castrate on a not-yet-due litter has no "Early · due day 5" line.**
    - **Steps:** A02, day 3. Coccidiosis and Health shot both show "Early · due day 7 · counts on time".
    - **Result:** Castrate shows nothing, and offers Weak/Sick again under "Deferred", which already means weak or sick. "No males" keeps the sublabel "castrated 0 · nothing owed" while 6 are counted.
    - **Screenshots:** `cast30.png`, `cast-def.png`.
    - **Class:** change a slice, litter drawer.

11. **Identity entry gives no feedback when it swallows input.**
    - **Tag keypad:** the keys silently disable after 6 digits.
    - **Rapid taps:** taps on "Record · next piglet" within roughly 1 second of a record are ignored. In my run only 4 of 12 fast taps recorded. There is no cue, so a hurried worker cannot tell whether a tag was taken.
    - **Class:** change a slice, `id.html`.

12. **The weigh-day sheet is cluttered.**
    - **Layout:** the boar and gilt counter rows are cropped behind the numpad. "Boars and gilts · 12 not identified" appears twice. Save disappears and a lone Back remains.
    - **Counters:** they save on every tap with no Undo.
    - **Guard:** weight 999 is correctly refused ("over 72 kg for 12 piglets").
    - **Screenshots:** `lw2.png`, `lw3.png`.
    - **Class:** change a slice, `id.html`.

13. **A 0-treated save with every piglet weak writes a record that looks done.** Result: "Recorded: Dock tail 10:31 · none treated · 12 deferred: weak" sits in the Day 3 Recorded group, while the dose is still owed. It is honest text but reads as complete. The save is no longer blocked and the reason is visible, so R1-25 is largely handled. Class: change a slice, litter drawer (low).

14. **Smaller items.**
    - **Death drawer:** every A02 death shows the extra row "One of D03's 2 missing?". Tapping it silently re-titles the sheet to D03.
    - **Move form:** at the maximum, "A02 has only 12 piglets" reads like an error.
    - **Edit:** every stepper is labelled just "Decrease" or "Increase". Opening a row focuses its −.
    - **Litter tools at 390:** the tool row clips "Move" when two draft markers are shown (`drafts.png`). At 320 it collapses to "More actions".
    - **Class:** change a slice (litter, `dead.html`, `edit.html`).

15. **D01's "Farrowing sheet" door does nothing visible.** The handler only sets a `data-door` attribute, so it is a host stub. Class: already handled by the host hand-off, but the prototype gives no feedback. This is R1-30, partly: End-blocked now opens the D01 litter, not the concept board.

## Already handled, checked on a second look

- **Double taps:** one-tap Record, Save on Set count, "Move 1" and "Record · next piglet" each wrote a single record on a double tap. Undo is idempotent.
- **R1-24:** phone Back mid-draft now returns to the litter with "n unsaved" or "n counted · not saved" markers and Resume. Dead and count drafts are kept too.
- **R1-25:**
  - **No males:** it now asks before clearing counts.
  - **Reasons:** a reason is required before Save enables.
- **R1-7:** Edit lists deaths, with "Recorded by mistake" and "On another litter".
- **R1-29:** a possible double now offers "Same injection, recorded twice" or "Given twice".
- **R1-23:** notch 99 is accepted, and a duplicate tag asks "Different piglet?". Weight over 72 kg is refused.
- **Tag entry:** all 12 identified gives "More than 12? Set count", not a dead end.
- **Hold to end:**
  - **Hold:** a short tap or sliding away reads "RELEASED · NOT ENDED". A full hold gives the receipt.
  - **After End:** the room reads "units unfinished at end / Not done / Finished", and litters read "not done at end · can no longer be recorded".
- **Browser Back after End:** it does not allow a second End.
- **Move guards:**
  - **Targets:** moving into itself, a sow that died, or an unknown crate is refused with a message.
  - **Warnings:** 17 or 23 piglets warns "More than one sow nurses".
  - **Nurse sow:** D02 joins the task and the room count goes 20 → 21.
  - **Receipt:** it says to spray-mark the piglet.

## New scenarios found

- **N-a:** a whole-litter loss, and the closed-litter wording after it (finding 2).
- **N-b:** a legitimate count gain above +3 (stale record, found or adopted piglets) with no path to save (finding 1).
- **N-c:** a worker who reads only the last 3 or 4 digits of a tag, or types "A 4" (finding 7).
- **N-d:** a litter reached by Find that is outside the task, in a unit with no task, showing owed rows (finding 4).
- **N-e:** a worker tapping a second time while the app silently ignores the tap (finding 11).
- **N-f:** Back after a saved Set count returns to the count page, which now reads "11 alive · Same as the record". That is an extra step, and I did not test whether a second Save there writes a no-op. Class: change a slice, `count.html`.
- **N-g (prototype limit, not a design finding):** records live in per-tab `sessionStorage`, so a second tab shows the pre-record day. This is relevant to the N3 offline-phone scenario.

## What worked well

- The room and litter drawer look the same as farrowing: one chip per row, one headline, drawer over a blurred room, lone filled Back, steppers and hold-to-end.
- Resume and the draft markers.
- The balanced litter header: Born / Alive / Dead / Unexplained loss always added up.
- The Move preview ("12 → 11 · 11 → 12", owed and arrive-done).
- Zh was complete and tidy at 390.