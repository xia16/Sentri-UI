# Round 2, Scenario 1 report: the day-3 round (worker, Unit 7)

Repo head `dd44ca2`, branch `map/3-piglet-processing`, base fixture. Walked in a real browser (Playwright) from the room list at 390×844 in English, then once in zh, then 360×740 once. Screenshots are in `C:/Users/ying_/AppData/Local/Temp/claude/C--Users-ying--Documents-Codex-2026-09-08-clo-Sentri-UI-pilot/ac8e28b9-518e-469b-8aa6-3533607c5adc/scratchpad/walk/r2-s1/`, named `NN-*.png`. Scripts are `lib.js`, `repl.js` and `run.sh` in the same folder.

Walk order:
1. A02 iron: recorded 10 of 12, reason Weak. Tail dock: Record 12.
2. D03 (day 5) castrate: 5 castrated, 1 hernia.
3. Room filter → Iron → "Record iron for several litters" → Tick all owed → Review → hold-to-record.
4. A02 iron again for the 2 deferred piglets.
5. Bulk for dock tail, with a tick left in place while one litter was recorded individually.
6. Read the room.

## Findings

### F1. The room's headline numbers contradict each other
- **Step:** room list, any state. Screenshots `01-room`, `22-room-after-bulk`, `30-room-end`.
- **Seen:** the headline says "15 litters owe today". The overview line under it says "13 owe today · 7 later" at the start, then "12 · 8", then "6 owe today · 14 later" after my records.
- **Also contradictory:** a green progress bar is partly filled under "0 / 20 Litters finished". The Owed, Done, Later and All tabs read 15 / 0 / 4 / 22, which doesn't add up to 20. "All 22" includes D02 and E01, which are "Not in the task". I couldn't find a rule that makes these reconcile.
- **Expected:** one count, one rule. A worker can't tell what "6 owe today" means next to "15".
- **Class:** change a slice (`room.html`). Related to R1-16, but R1-16's items are fixed; this is the new headline.

### F2. Identity (Tag) keeps every litter "owed" after the treatments are done
- **Step:** the room after my records. Screenshots `30-room-end`, `08-room-after-A02`.
- **Seen:** every day-3 litter I finished still sits in Owed as "Tag · due today", and the headline still says 15. The Done tab stays 0.
- **Why it matters:** the room doesn't show "iron and tail are finished, only tagging is left". I can't see my round is finished apart from tagging. It's truthful, but the one number mixes the two.
- **Class:** change a slice (`room.html`). It may need a one-line decision on whether the headline counts identity.

### F3. The room doesn't say "deferred", and a partly-done litter looks untouched
- **Step:** after deferring 2 weak piglets on A02. Screenshots `08-room-after-A02`, `15-iron-filter`.
- **Seen:** the A02 row reads "Iron · Tag · due today · 12 piglets", with no sign that 10 are done and 2 are deferred. Under the Iron filter it is the same. The bulk sheet does say "2 owed · deferred: weak", and the litter drawer says "2 owed · deferred: weak".
- **Also:** B09's row reads "Iron · Dock tail · 10 piglets" with no due chip, though it has deferred piglets. A05 says "8 still owed" in the room but "5 owed · deferred: weak" in bulk, so the numbers disagree.
- **Expected:** the room row says "iron 2 deferred" or "2 still owed", as it does for "still owed" on tag rows.
- **Class:** change a slice (`room.html`).

### F4. A litter jumps position in its row after you record it
- **Step:** back to the room after A02. Screenshot `08-room-after-A02`.
- **Seen:** A02 moved from first in Row A to third, and B09 and B01 reordered in Row B. A worker who pans down the aisle loses the litter they were about to do next.
- **Class:** change a slice (`room.html`): keep crate order stable.

### F5. A deferred-then-completed treatment is split in two on the litter drawer
- **Step:** A02 drawer after "Record 2" for the deferred piglets. Screenshot `26-A02-iron-done`.
- **Seen:**
  - Right after saving, iron shows ticked under "Day 3 · Due today" as "10:35 · 2 piglets".
  - After reload it moves to "Day 3 · Recorded", where the earlier line still reads "10 piglets · 2 deferred: weak".
  - Both views make it look as if only 2 piglets got iron. The "2 deferred" text is stale after the second record covered them.
- **Expected:** one iron row reading "12 of 12", with the history under it.
- **Class:** change a slice (`room.html`, litter drawer).

### F6. Smaller things
- **F6a. Layout shift after a one-tap record:** the "Saved · … Undo" banner pushes the rows down. The next Record button moves under a gloved thumb. A rapid second tap on the same spot did not double-record, but it hit something else. Class: change a slice (`room.html`).
- **F6b. Stale text on the castrate sheet:** the "No males" row keeps reading "castrated 0 · nothing owed" while Castrated is 5, in en and zh. Screenshots `11-castrate-5-1`, `43-zh-castrate`. Class: change a slice (`room.html`).
- **F6c. Done status lost on a "Sow died" row in bulk:** after the bulk record, B01 shows "13 piglets · day 5" with no "Done" chip, because the Sow died chip takes the slot. Its "2 days late" mark also disappears. Screenshot `21-after-bulk`. Class: change a slice (`bulk.html`).
- **F6d. No way to peek at a tickable row in bulk:** the row toggles its tick when tapped, with no chevron to open the litter. Class: change a slice (`bulk.html`).
- **F6e. Ambiguous Later rows:** "Castrate tomorrow / yesterday · 8 piglets" doesn't say whether "yesterday" means the last record or something else. Class: change a slice (`room.html`).
- **F6f. The filter keeps its scroll position:** after applying the Iron filter the page opened scrolled to Row B. Screenshot `15-iron-filter`. Class: change a slice (`room.html`).

### F7. What the final read of the room does tell truthfully
- **Done:** it lists litters per treatment through the filter ("Done 8" under Iron, 2 owed).
- **Late:** C03, C05, D03, B01 and D06 show red "due yesterday" or "2 days ago".
- **Missed:** B04 sits in a "1 litter missed a treatment" door.
- **Deferred:** it does not say deferred anywhere on the room page (F3). A worker has to open a litter or a bulk sheet to learn it.

## Checks that passed (no double-recording)
- **Bulk skips done litters:** "Tick all owed" skipped C04 (done at 08:30), A02 (deferred) and B09 (deferred). It ticked 6 litters and 69 piglets.
- **Ticked litter recorded individually:** I ticked A04 for dock tail, recorded A04 on its own, and returned to bulk. A04 was recomputed as "Done" and the review read "4 litters · 45 piglets". The hold-to-record sheet then recorded exactly that.
- **No re-record in the drawer:** after bulk, the A04 drawer showed iron as done with no Record button.
- **Fixture limit:** sessionStorage is per tab, so a second tab or phone can't be tested here.

## New scenarios found
- **Day-3 identity:** treatment-done and identity-done need separate states in the room headline (class: change a slice, `room.html`).
- **Completing a deferral:** once the deferred piglets are treated, the litter should read as one complete treatment (F5).

## R1 items re-checked
- **R1-24 (Back drops the draft):** the draft survived. I entered castrate counts, pressed browser Back, and the counts were still there on reopening. Handled.
- **R1-1, R1-2, R1-3, R1-25 (one-tap undo):** an Undo banner now appears after a one-tap record.
- **R1-16 (deferred looks like late):** partly fixed; see F3 and F4 for what remains. I did not re-walk the other R1 items.

## What worked well
- **Treatment drawer:** it opens on the litter, treatment by treatment, and Back returns cleanly.
- **Shortfall reasons:** lowering the count asks Weak or Sick (and "Some weak, some sick" when two or more are short). Save stays disabled until a reason is picked.
- **Castration sheet:** counts castrated and not castrated by reason (Hernia, Cryptorchid, Deferred, Kept boar). The hernia shows up as a litter note.
- **Bulk guard-rails:** the bulk review sheet states the totals. Deferred and "Check" litters are excluded from "Tick all owed".
- **360 width:** no horizontal scroll, and Move and Set count tuck behind "More actions".
- **Chinese:** the zh pass reads cleanly through room, drawer, iron sheet and castrate sheet.