**Report — Round 2, scenario 6 (orphans: worker/supervisor)**

Head `dd44ca2` on `map/3-piglet-processing`. Served on port 4956 and walked in Playwright at 390×844 (en), 360×740 (en, zh) and zh at 360 only. Nothing in the repo was edited. Screenshots and scripts are in `C:/Users/ying_/AppData/Local/Temp/claude/C--Users-ying--Documents-Codex-2026-09-08-clo-Sentri-UI-pilot/ac8e28b9-518e-469b-8aa6-3533607c5adc/scratchpad/walk/r2-s6/`. Called "scratch" below.

**What I walked**
- B01 (sow died Sep 28, 13 piglets) from the room list, `?data=base`:
  - 3 piglets (004101–004103) to B02.
  - 4 to B08.
  - 3 to B10.
  - 2 to D02, the nurse sow outside the task.
  - The last piglet (000391) to B09, which empties B01.
- D06 (sow died mid-farrowing, 6 alive):
  - 2 to C02.
  - 1 each to D03, E01 and D02.
- A02: I recorded a sow death live (The sow tab → Prolapse → hold to save).
- Then I read each receiver and the nurse for owed doses and counts, plus the log, the room list and the End overview.

**Findings**

**1. A receiving litter never shows the arrivals' castration, and goes "done" without it. Change a slice: `litter.js` / ledger, plus `room.html` row and the `move.html` receipt wording. New (not R1-4, R1-18 or R1-19).**
- Step: B01 → B02, B08 and B10. State `room.html?state=litter&crate=B02`; screenshots `11-b02.png`, `a0-B02-tap.png`.
- B01 is day 5, so the arrivals owe castration today. The Move preview and receipt say "Castrate · males only · 0–3 males among the 3 · owed".
- On B02, B08 and B10 the Castrate row reads "Tomorrow" or "In 2 days" (own piglets only). It has no "from B01" line and no action.
- I tapped Record 3 for the arrivals' iron on B02. The drawer then said "Nothing owed today · next: castrate tomorrow". The room row for B02 listed only "Iron".
- Expected: a castrate row "males from B01 · due today" on the receiver, as the nurse shows it.
- Inconsistent: D02 (the nurse) does show "Castrate · Due today", because her own age equals the arrivals'. Whether the arrivals' castration shows depends on whether the receiver's own litter is the same age.
- For a worker this means five days of castration quietly dropped for moved males.

**2. The End overview drops the nurse sow's litter from the rows.**
- Step: Task overview, `end.html?state=overview`, after moving 2 piglets from B01 to D02. Screenshot `b0-overview.png`.
- Row D still says "4 litters", with 22 owed and 138 not yet due, the same as before the move.
- The headline still says 204 owed and 664 not yet due. The rows now add up to 202 and 658.
- Row B did drop (87 → 85 owed, 231 → 225 not yet due).
- So D02's doses are in the headline but in no row. A supervisor drilling from the overview cannot find them.
- The header does read "0 / 21" and "Identity 8/21", so D02 is in the task count.
- Class: change a slice, `end.html` overview (row grouping must include joined nurse litters).

**3. Joining a litter that has her own piglets drags her whole litter in.**
- Step: D06 → E01. Screenshots `62-e01-pre.png`, `7-E01.png`.
- E01 is outside the task, and her own 7 piglets are 2 days old. The move preview says only "Joins the task. E01 joins this task: the piglets are treated there".
- After the move, E01's own 7 piglets owe cord and nasal drops "late 2 days" (8 owed). The room row reads "due 2 days ago · 8 piglets" and counts toward "owe today".
- The ruling says the nurse's own earlier facts stay on her earlier litter. That was written for a sow with no piglets, like D02.
- Neither the preview nor the receipt warns that this adds her own piglets' debt.
- E01's summary also says "Nurse sow · from D06", although she is a farrowed sow with her own litter.
- Class: owner question (a litter with own piglets, outside the task, receiving an orphan) plus change a slice, `move.html` and the ledger. Not previously ruled.

**4. The room row says how many piglets are in the litter, not how many owe.**
- Screenshot `30-room-after.png`.
- After the moves, B08 reads "Iron · due 2 days ago · 13 piglets" but only the 4 arrivals owe. C02 reads "Cut cord · Nasal drops · due yesterday · 16 piglets" but only 2 owe.
- A05 and C04 read "8 still owed", which is the right pattern.
- Expected: "4 of 13 owed", not "13 piglets".
- B09 shows no due text at all in the room ("Iron · Dock tail · 10 piglets"). The Move picker calls it "late".
- Class: change a slice, `room.html` row headline.

**5. A mixed-age Iron row reads confusingly.**
- B10: Iron says "2 days late · 14 owed · 3 from B01 · 004108, 004109, 004110 · day 5 · late 2 days · 11 of its own · day 3 · due today", with one button, "Record 14". Screenshot `3-B10.png`.
- The header says late while 11 of the 14 are due today.
- The meta text wraps to six lines, with stray " · day 5 ·" fragments.
- E01 and D03 show the same two-source pattern on their coccidiosis and cord rows.
- A worker cannot tell which piglets are late, or choose to record only the arrivals.
- Class: change a slice, `litter.html` row (mixed sources) and the strings.

**6. The sow's death cause is lost after save.**
- Step: A02, Record death → The sow → Prolapse → hold to save. A "Saved · Sow died · Prolapse" banner shows once. Screenshot `85-after-save.png`.
- Reopening A02, and B01 and D06 from the start, show only the red "Sow died" in the subtitle. The litter log shows "Sow died 06:20" with no cause or who. Fixture B01 says prolapse.
- Expected: the cause on the drawer or the log.
- Class: change a slice, `litter.html` / `edit.html` log.

**7. A "Sow died" mark can't be corrected.**
- Step: B01, Edit (`edit.html?state=edit&crate=B01&from=litter`). It lists treatments and identity only. There is no Sow died line and no withdraw.
- It cannot be undone if marked on the wrong litter, and "Sow died" blocks nothing afterwards.
- This is the sow-death version of R1-7, whose other parts were not re-walked here, so I'm not saying R1-7 is still broken as a whole. Class: change a slice, `edit.html`.

**8. Nurse sow D02 (smaller points).**
- It offers "Record birth litter weight · Optional". That is meaningless for borrowed piglets, and B01 and D06 offer it too.
- Her log mixes eras. The header says "born 0 · 2 alive now", while the list has "Farrowing finished · born 12" from Sep 3 and "11 piglets weaned" from yesterday.
- Her summary reads "Nurse sow · from B01". With two sources it would not say which.
- Class: change a slice, `litter.html` and the log.

**9. Sow-died litters read oddly.**
- D06 shows "Born 8 · counted, not locked" next to "Sow died".
- B01 shows "Record birth litter weight" with 14 born. After emptying, a closed litter still offers it.
- B01's log lists "10 identified · 004104–000391", an odd range because 000391 is a different tag form.
- Class: change a slice (small), `litter.html`.

**10. At 360 px, Move is behind a menu.**
- Step: `room.html?state=litter&crate=B01` at 360×740 (en and zh). Screenshots `z6-b01-en-360.png`, `z1-b01-zh-360.png`.
- The tool row shows Edit, Record death and "More actions". Move and Set count are one tap deeper.
- At 390 all four show.
- Move is the main action for an orphan litter. It is one extra tap on small phones, and the zh label "更多操作" gives no hint that it holds Move.
- Class: change a slice, `litter.html` tools row.

**R1 items that now work**
- R1-4: arrivals keep their own age. D06's day-1 piglets owe cord and nasal drops "1 day late" at C02 and "in 2 days" for iron.
- R1-5: crate search by crate code, sow number, other rows and Unit 8 works.
- R1-10: Born − Moved out − Dead = Alive balances on source and receiver.
- R1-18: the receiver says "N from B01 · tag list".
- R1-19: the emptied B01 reads "Litter closed · nothing owed · a move in reopens it".
- N1/Q-C: a nurse sow outside the task (D02) joins; the room count goes 20 → 21 and her row appears.
- Not re-tested: the R1-2, R1-3, R1-6 and R1-31 areas.

**New scenarios found**
- **N-A:** orphans of different ages, moved to one receiver, where castration is due only for the older ones. Same slice as finding 1.
- **N-B:** two sources onto one nurse sow (D02 gets 2 from B01 and 1 from D06). The summary and the rows must name both. Change a slice, `litter.html`.
- **N-C:** an orphan moved onto a litter outside the task that has her own piglets (finding 3). Owner question.
- **N-D:** the supervisor needs "orphaned litters and where their piglets went" at End. The overview shows only "Piglets moved 5", with no list by source or nurse. Change a slice, `end.html`.

**What worked well**
- The Move preview shows 13 → 10, the owed doses, "arrive done", and "Joins the task" before commit, and the receipt says "Spray-mark the N piglets".
- Tagged piglets move by identity row. The receiver shows "11 of 11 identified", and C02/D06 untagged piglets use a stepper.
- The sow-death flow shows its cause, the hold-to-save, and a "not saved" draft marker on the litter.
- Emptying a litter closes it cleanly.
- The zh strings render correctly at 360, with no overflow.