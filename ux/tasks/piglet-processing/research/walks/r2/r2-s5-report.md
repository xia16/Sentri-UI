**Scenario 5 (counts, worker). Piglet processing walked at 390×844 in en and zh, and at 360×740 in en. Head `dd44ca2`, branch `map/3-piglet-processing`, port 4955.**

Screenshots and scripts are in `C:/Users/ying_/AppData/Local/Temp/claude/C--Users-ying--Documents-Codex-2026-09-08-clo-Sentri-UI-pilot/ac8e28b9-518e-469b-8aa6-3533607c5adc/scratchpad/walk/r2-s5/`. Walk scripts are `w*.cjs` (main walk), `z*.cjs` (zh), `n1.cjs` (360). Screenshots cited by name are in that folder.

**What I did.** I started from the room list and opened A02 (12 alive, owes iron and tail). I counted it 11 and saved, then opened A04 (11) and counted 12. I opened A04's gain line and took the A02 suggestion to explain both lines together. Separately, I miscounted A07 (10 for 13) and fixed it, and withdrew a wrong A02 count, both through Edit. I also tried a Move directly from A02 after its short count. I did not walk a move into another unit or room.

**Room, litters and record, before and after**
- **Room before:** 15 litters owe today. Header "To review 1 · Not yet explained 1" (that is D03's fixture loss). Rows A02 12, A04 11 (`01-room.png`).
- **A02 after the short count:** Born 13, Alive 11, Dead 1, Unexplained loss 1, which balances (`05-saved.png`). The drawer shows an "Unexplained loss 1 piglet" row, and the room header goes to "Not yet explained 2".
- **A04 after the high count:** Born 12, Alive 12, Dead 1, Unexplained gain 1, "Check on the pig · it owes nothing new". The room header goes to 3.
- **After the Move:** A02 is 11 with "Moved out 1" (13−1−1=11). A04 is 12 with "Moved in 1". The header drops back to "Not yet explained 1", so only D03 is open.
- **What the moved piglet owes:**
  - If A02 had not been given iron, A04 shows "Iron 1 owed · 1 from A02" next to its recorded iron.
  - If A02 had already been done (`?data=a02-all-done`), the piglet arrives done and A04 owes 11, not 12.
- **Record:** the log reads truthfully on both sides. A02 says "Count 11 · 1 missing · explained by a Move · 1 piglet to A04", with "See A04's record". A04 says the mirror image. Withdrawing the Move through Edit reopens both lines and says so ("open loss 0 → 1 · A04 open gain 0 → 1").
- **Mistyped count, value fix:** A07 counted 10, then corrected through Edit to 13. The Edit sheet shows a receipt: alive 10 → 13, open loss 4 → 1, iron owed 10 → 13, tail owed 10 → 13. The log keeps the original with a Correction row above it (`96.png`).
- **Mistyped count, withdrawal:** "Wrong count? Edit" opens Edit with the count first. "Recorded by mistake" gives "alive 11 → 12 · open loss 1 → 0".

**Findings**

1. **Move after a short count double-subtracts and leaves the loss open (blocker).**
   - **Step:** count A02 11, then A02 → Move → A04 → "Move 1", without counting A04 first. This is how a worker would use the Move button once they find the piglet next door.
   - **Screens:** `?state=move&crate=A02`, `101.png`, `103.png`, `104.png`.
   - **What happened:** the Move preview reads "From A02 11 → 10". A02 then shows Alive 10, Moved out 1 and Unexplained loss 1 together. The crate actually holds 11, the room row says "10 piglets", and the header still counts A02's loss as open. The Move never says it can close A02's loss.
   - **Expected:** a Move out of a litter with an open loss offers "closes A02's unexplained loss", so it reads 11 → 11.
   - **Class:** change a slice (`move.html` plus the ledger). This is related to R1-18 and R1-6 but not listed in round 1.

2. **The loss line has no "found next door" door.**
   - **Step:** A02 → open the "Unexplained loss 1 piglet" row (`06-loss-open.png`).
   - **What happened:** it offers only Record death, Count A02 again, and Wrong count? Edit. The piglet-jumped case works only from the gain side, after A04 has also been counted. If I find the piglet first, I have no direct door from the loss; I have to Move, which hits finding 1, or count A04.
   - **Class:** change a slice (`count.html` explain page). Add "In another crate" to loss lines, beside Record death.

3. **The explain sheet says "Saved" before anything is saved, then asks a second time.**
   - **Step:** A04 gain → "A02 lost 1 piglet" (`13-after-a02-tap.png`).
   - **What happened:** the sheet says "Saved as a move of 1 piglet: both lines close", with a "Move 1 · A02→A04" button. Tapping the button opens another full "Move piglets" page with another "Move 1 · A02→A04" button (`14-after-confirm.png`). Only that second button saves. A worker taps "Move 1" once, reads "Saved", and could Back out thinking it is done.
   - **Class:** change a slice (`count.html` and `move.html`). Make the suggestion sheet the single confirm, or reword it to "Will save as a move".

4. **Editing a count that a Move explained leaves Save dead with no visible reason.**
   - **Step:** after the Move, A02 → Edit → count 11 → 12 (`61-edit-12.png`).
   - **What happened:** Save is disabled. The reason is "This changes 1 later record · Move A02 → A04", in the banner at the top of the sheet. After the stepper tap the sheet has scrolled and the banner is off-screen. The footer reason is visually hidden (`#ed-why`). The worker sees a dead Save.
   - **What works:** withdrawing the Move first, with "Recorded by mistake" on the Move, then saving, works and is clear.
   - **Class:** change a slice (`edit.html`). Show the reason by the Save button, or keep the banner pinned.

5. **Open lines are not marked on the litter rows.**
   - **Where:** A02 and A04 in `70-room-two-lines.png`, and D03 in the base room, which has a fixture loss.
   - **What happened:** the rows read "Iron · Dock tail · Tag · due today · 11 piglets" with no chip. A05, with a possible double, gets a "Check" chip. Only the header line "Not yet explained N" and its sheet say a loss or gain exists. I could not see which litter to look at from the list.
   - **Class:** change a slice (`room.html`). Reuse the "Check" chip. Related to R1-22, not listed.

6. **Header numbers mix units.**
   - **Where:** `71-review.png`.
   - **What happened:** the header says "To review 1 · Not yet explained 3". The sheet says "Unit 7 · 4 to answer", with "Unexplained loss 3 A02 D03 · Unexplained gain 1 A04 · Net drift −2 piglets". The header counts lines (and doubles). The sheet's detail line counts piglets. "Loss 3 A02 D03" has no separator between the number and the crate codes. The next page (`73.png`) reads clearly.
   - **Class:** change a slice (`room.html`). Word it as "2 losses · 1 gain" or similar.

7. **"0 min" on suggestions.**
   - **Where:** "both lines close · 0 min", on the explain page and the unit list.
   - **Class:** change a slice (`count.html` strings). "Just now" would read better.

8. **At 360 wide, Set count and Move hide behind "More actions" (390 shows all four buttons).**
   - **Screens:** `n02-a02.png`, `n02b-more.png`. The label "Unexplained loss" also wraps to two lines in the summary (`n04-saved.png`).
   - **Class:** change a slice (`room.html` litter drawer). Set count is a main action in this scenario. No horizontal overflow at any step.

9. **The Done lens says "Nothing done yet today" while records exist.**
   - **Step:** `?data=a02-all-done`, Done tab (`40-room-done`). A02 has iron and tail recorded today, but identity is still owed.
   - **What happened:** the tab shows 0 and "Nothing done yet today". Minor.
   - **Class:** change a slice (`room.html`).

10. **Dead-end screens and double status bars.** After the withdrawal, Back from the edit sheet lands on a bare page, "Nothing unexplained here. Back" (`93`), so there are two Backs to the litter. This is minor, in `count.html`. The Move and explain pages are full pages, not drawers like farrowing. They show a second 9:41 behind the page, but only in the text dump, not on screen.

**R1 items still broken:** none of the round-1 items I touched. R1-27 (count sanity limits), R1-28 (corrections silent) and R1-14 (record page after a line is explained) are fixed. R1-11 (count copy) also reads correctly now. R1-6 is partly handled: a gain owes nothing new and the Move rules apply once it is explained.

**zh walk.** The whole flow reads correctly in zh: counts, the A02少了1头 suggestion, the move page, the receipt and the drawer. Findings 1 to 4 reproduce in zh. Two wording notes:
- "给这1头仔猪喷漆标记" ("spray-mark this piglet") on a piglet that moved by itself.
- The section label "不明增减" ("unexplained gain/loss").

Both are probably fine.

**New scenarios found**
- A worker finds the piglet in another crate before counting that crate (findings 1 and 2). Change a slice (`count.html`, `move.html`).
- A moved-and-explained count that was itself mistyped: Edit blocks Save until the Move is withdrawn (finding 4). Already handled in logic, but the explanation needs to be visible.
- A short count followed by a recount of the same crate ("Count A02 again · this line stays open"). I did not walk it. It is likely handled by the round-3 ruling.
- A jump into a crate in another unit or room: not walked. R1-5 covers the search side.

**What worked well**
- The count sheet states the consequence live: "Save writes unexplained loss 1 piglet", "recorded treatments stand · check on the pig", and the 0 and +40 guards.
- The suggested pairing, A02 lost 1 piglet, is correct and says "a suggestion, not proof".
- The Move page shows what the moved piglet owes and what it arrives done.
- Alive, Born, Dead, Moved and Unexplained balance on both litters at every step.
- Corrections are stamped, keep the original, and show a receipt.
- The unit-level "Unexplained" list gathers every open line with its own doors.