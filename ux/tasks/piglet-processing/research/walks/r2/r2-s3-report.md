**Scenario 3 (deaths, worker) — Round 2 walk report**

Head: `dd44ca2` (branch `map/3-piglet-processing`). Port 4953. I walked en at 390×844, en at 360×740 once, and zh at 390×844 once. I started from the room list each time. Screenshots and scripts are in `C:/Users/ying_/AppData/Local/Temp/claude/C--Users-ying--Documents-Codex-2026-09-08-clo-Sentri-UI-pilot/ac8e28b9-518e-469b-8aa6-3533607c5adc/scratchpad/walk/r2-s3/`.

I used B06 for the crushed piglets because it is the fixture litter with tagged piglets, 9 of them. B10 was the neighbouring crate for the found body. I added no `?data=` variant.

**Walk (all in the base data, en)**
1. Room → B06 (the litter opens as a drawer over the room) → Record death.
   - Crushed + once = 1 untagged.
   - Identified · 9 → tick 271004 → Crushed cause → Save.
   - The litter drawer reads "Saved · +1 crushed · 271004 crushed". Born 13, Alive 10, Dead 3. Iron owed drops 12 → 10 and "2 to identify". All of this is correct.
2. Set count 10 → 9 reads "Save writes unexplained loss 1 piglet".
   - After Save, Born 13, Alive 9, Dead 3, Unexplained loss 1 (balanced).
   - The drawer has an Unexplained row and the room header shows "Not yet explained 2" (D03's loss is the other).
3. Body found in the next crate, with two routes:
   - **From B06:** Record death → Crushed + shows "From the 1 missing" (a stepper) → set to 1. The drawer shows "alive stays 9 · none missing now". After Save, Dead 4, Alive 9, loss closed.
   - **From B10 (untagged crate):** Record death → Crushed + shows "Found outside its crate? · 2 crates have piglets missing" → B06 → "Recording in B06 · found in B10 · Record in B10 instead" → Save.
     - B06 now has Dead 4, Alive 9, loss closed.
     - B10 is unchanged (Born 12, Alive 11, Dead 1) and has no log entry. Nothing is counted twice.
     - B06's log reads "+1 crushed · 1 of the missing" and "Count 9 · 1 missing · explained · See the death".
4. Withdraw a death recorded by mistake: B06 → Edit → Deaths.
   - Withdrawing the "+1 crushed · 1 of the missing" record shows "Correction saved · dead 4 → 3 · open loss 0 → 1".
   - The log keeps the withdrawn row ("withdrawn 10:33 · G. Hansen · recorded by mistake") and a Correction row.
   - Withdrawing the tagged "+2 crushed · names 271004" shows "alive 10 → 12 · dead 3 → 1 · Iron owed 10 → 12 · Dock tail owed 10 → 12". 271004 is no longer marked dead and "3 to identify" is restored.
5. Tagged missing piglet: Set count lower → "Which tagged piglets are missing? · optional" → pick 271005 → Save.
   - Record death → Identified list shows "271005 · counted missing 10:30". Tick it, choose a cause, Save. Dead 2, Alive 11, balanced.
   - So R1-9 is fixed.
6. zh walk (crush, tagged death, count loss, outside crate, edit withdraw): no English leaks anywhere.

**Findings** (class in brackets)

- **F1. Identified sheet: Save is disabled with no visible reason, and the cause list is out of view.**
  - Step: tick a piglet in "Identified piglets" (`dead.html?state=dead&crate=B06`, screenshot `05-ticked.png`).
  - What I tried: Save stayed greyed after I ticked 271004. "Cause for 271004 / Pick a cause" sits below the 9-row list, and the sheet gave no sign it was waiting on that answer.
  - Expected: a visible prompt, or the cause list inside the first screen.
  - Class: change a slice (`dead.html`).
  - Severity: a gloved worker will think the app is stuck.

- **F2. "None were missing" does not look tappable.**
  - Step: add a crushed piglet on a litter with an open loss (`15-b06-dead-plus1.png`, `54-dead360.png`).
  - What happened: Save is disabled until the worker taps a line that looks like a bold sub-heading ("None were missing"), or moves the "From the 1 missing" stepper. The hint "How many were missing?" is only in the footer.
  - Expected: two obvious choices, or a button style on that line.
  - Class: change a slice (`dead.html`).

- **F3. "From the 1 missing" is a stepper beside the cause rows, so it reads like a fifth cause.**
  - Its meaning (these bodies were missing ones) is explained only after you tap it ("alive stays 9 · none missing now"). The header "Dead 1" does not change.
  - Class: change a slice (`dead.html`, wording or layout).

- **F4. Neighbour-crate case works only if the worker knows to try it.**
  - In B09 (all 10 piglets identified) the Crushed + is disabled ("Count a body or pick a piglet first"). Nothing says "this could be B06's missing piglet".
  - The "Found outside its crate?" row appears only after a stepper is pressed, and only in a crate that has untagged piglets.
  - A worker holding the body in an all-tagged crate sees only that crate's piglet list.
  - Class: change a slice (`dead.html`, offer "Found outside its crate?" before any count).

- **F5. The receipt after a found-elsewhere save says "Saved · B06 · +1 crushed · all missing found" on B10's drawer.**
  - The bare "B06" does not say "recorded on B06". B10's Dead stays 1, so the worker wonders where the body went.
  - Class: change a slice (`litter.js` receipt string).

- **F6. The litter log does not name the tagged piglet or where the body was found.**
  - `25-b06-log.png`: the first death shows only "+2 crushed", with no 271004. "9 identified · 271001–27-14" still lists it. Edit does show "names 271004", so the information exists.
  - The found-body row says "1 of the missing" but not "found in B10".
  - The "explained by a death · +1 crushed · 10:32 · G. Hansen" sub-line wraps awkwardly beside "See the death".
  - Class: change a slice (`edit.html` record page).

- **F7. A mixed death record can only be withdrawn whole.**
  - The "+2 crushed" record holds one untagged and one tagged piglet. If only one was wrong, the worker must withdraw both and re-record the other. The card says "record the death again on the right litter".
  - Class: change a slice (`edit.html`). A record per piglet or per cause would fix it.

- **F8. After a correction, the litter drawer and room header do not show it.**
  - Back from Edit shows no "Correction saved" line, and "Last record" still reads 10:31 after the 10:33 withdrawal. The receipt shows only inside the Edit sheet. This is R1-28 and R1-15, partly still broken (the corrections receipt and the "Last record" stamp).
  - Class: change a slice (`litter.js`, `room.html`).

- **F9. The explain page for a loss with a named tagged piglet does not say who is missing.**
  - `44-explain-row.png`: after Set count with 271005 named, the line reads "Unexplained loss 1 piglet" only. 271005 appears only later, in the dead picker.
  - The page is a nearly empty full page.
  - Class: change a slice (`count.html`).

- **F10. The room row of a litter with an open loss shows no marker.**
  - B06 has no chip, unlike A05's "Check". The only trace is the header "Not yet explained 2".
  - The header mixes units: "Not yet explained 2" counts crates, the sheet says "Unexplained loss 3" (piglets) and "3 to answer" (loss lines plus the double).
  - Class: change a slice (`room.html`).

- **F11. At 360 wide, Set count and Move are behind "More actions".**
  - Set count is a core step in this scenario, so it costs one extra tap there (`52-litter.png`, `53-more.png`).
  - Class: change a slice (`litter.html` action row). This may be a deliberate density choice.

- **F12. Set count 10 on a litter of 10 (no change) saves "Saved · same as the record".**
  - It writes a no-op count record, and Save is enabled and dark. The log fills with no-op counts.
  - Class: change a slice (`count.html`).

- **F13. zh vocabulary mismatch.** The dead sheet and receipts use "少了的" for missing, while the Edit card uses "其中1头为失踪的". Class: change a slice (strings).

**Already handled (R1 items now fixed)**
- R1-7 (a death can't be withdrawn in Edit): fixed.
- R1-8 (a body found in a neighbour crate): fixed via "Found outside its crate?".
- R1-9 (tagged missing piglet): fixed.
- R1-10 (litter header balance): fixed. Born − Dead − Unexplained = Alive held at every step.
- R1-14 (record page wording after a line is explained): fixed. It now reads "explained".
- R1-26 (dead drawer): the Save-lands-on-a-stub issue is fixed; Save returns to the litter drawer.
- R1-15, R1-28 and R1-27 are in F8 and F12.
- Untouched: R1-22 and N4, the room-level held list.

**New scenarios**
- N-a. The body is of a tagged missing piglet and is found in another crate. The outside-crate path should name the tag (F4 and F9 adjacent). Class: change a slice (`dead.html`).
- N-b. Worker records the found body on the neighbour crate as a plain death, then notices. Withdraw works in Edit ("On another litter"), but the open loss then needs recording again. A "move this death to B06" action is absent. Class: change a slice (`edit.html`).
- N-c. A tagged death withdrawn restores the dose owed: Iron and Dock tail go 10 → 12. This is correct, but the worker should be told that doses are owed again. Class: already handled (the correction receipt shows it).

**What worked well**
- Born, Alive, Dead and Unexplained balanced at every step.
- Nothing was counted twice: B10 stayed untouched when the body belonged to B06.
- The correction receipt shows deltas ("dead 4 → 3 · open loss 0 → 1").
- The tag list marks "counted missing 10:30".
- The zh pass had no English leaks and no layout breaks.
- Treatment and identity counts (owed, to identify) follow every death, loss and withdrawal.