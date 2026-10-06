**Report — Round 2, scenario 4: fostering, worker, partial iron, "Don't know"**
Repo head `dd44ca2`, branch `map/3-piglet-processing`. Port 4954. Screenshots and scripts are in `C:/Users/ying_/AppData/Local/Temp/claude/C--Users-ying--Documents-Codex-2026-09-08-clo-Sentri-UI-pilot/ac8e28b9-518e-469b-8aa6-3533607c5adc/scratchpad/walk/r2-s4/`. I walked at 390×844 in English. I also looked at the A04 litter drawer at 360×740 and in zh at 390.

**What I did**
- I opened A07 (14 piglets) from the room list. I recorded Iron 12 with 2 not treated, reason Weak. A07 then showed Iron 2 owed, deferred.
- I moved 3 piglets to B02 (8 piglets, done so far) by typing the crate code. B02 is in Row B, so this was the other-row case. I answered Iron "Don't know". Screenshots 07–12.
- I resolved the unknown from both sides, in four combinations. Screenshots 15–21 and q0–q3.
- I moved 1 piglet to F02 in Unit 8, answering "Don't know" again. Screenshots 22–31.

**What both litters show for iron, and whether you can avoid double-dosing**
- **A07 (source):** "Iron · 0–2 of 11 owed · check · 3 moved to B02, not known." There is no one-tap Record. Tapping the row opens "Still owe it · checked on the pig · 0–2". The options are "Record iron now for N" or "Leave N owed".
- **B02 (receiver):** "Iron · 3 from A07 · unknown — check spray mark." Tapping it opens "Already had it, 0–3" (stepper, spray-mark hint) and "The other N: Record now / Leave owed".
- **Receiver answers settle the source correctly:**

| Receiver answer | A07 afterwards |
|---|---|
| 3 had it | "Iron 2 owed · deferred: weak, Record 2" |
| 2 had it, 1 recorded now | "1 owed" |
| 1 had it, 2 recorded now | Iron owed disappears |
| 0 had it, 3 recorded now | Iron owed disappears |

- **Verdict:** the right thing is doable without a double dose if the worker answers at the receiving litter. Neither litter offers a blind one-tap on the doubtful piglets.

**What worked well**
- The partial-record flow is clear. Record 12, then "2 not treated · why?" with Weak, Sick, or Some weak/some sick.
- The Move receipt says "Spray-mark the 3 piglets" and lists Owed, Unknown and Arrive done.
- Typing a crate code finds a crate in another row or unit. It shows "Unit 8 · … · not in this task".
- "Joins the task" is stated before the move is saved.
- The receiver's Day-3 piglets (those that arrived by Move) read "3 from A07" on every dose row.
- At 360 the drawer's four tool buttons fold into "More actions" with no horizontal scroll.

**Findings**

1. **Resolving on the source does not reach the receiver. Change a slice (ledger + `litter.html`). Not in R1.**
   - Step: after the move, on A07, I tapped Iron, then either "Record iron now for 2" or set the count to 0 ("none still owe it"). Saved.
   - Screens: `r0`, `r0-b02`, `r2`, `r2-b02`.
   - What happened: B02 still reads "3 from A07 · unknown — check spray mark" for all 3. The A07 answer already implies the 3 moved piglets all had iron (or that 2 of them are the weak ones). The same question is asked again.
   - Expected: either the receiver narrows to "0 of 3 owe" or "2 of 3 owe", or the worker is told which answer is settled. Worst case today: the worker who recorded 2 at A07 can record iron again at B02 with "Record now for 3".

2. **Contradictory lateness on the receiving litter and its list row. Change a slice (ledger + `room.html`, `litter.html`). Not in R1.**
   - Step: B02 after the move. Screens: `17-b02`, `14-back2`.
   - What happened: on the B02 drawer, Iron for the 3 arrivals sits under "Day 3 · 1 day late" (the arrivals' Iron and Identity rows). Directly under it, "Day 3 · Due today" shows Dock tail for the same 3 piglets. The list row reads "due yesterday · 11 piglets" for a litter with 3 owing piglets and 8 done. After the first dose the row reads "3 still owed · due yesterday".
   - Why it's wrong: the 3 are day-3 piglets (A07's age) and everything else for them is due today.
   - Expected: Iron under "Due today", and a headline that says "3 owed".
   - This is related to R1-4 (receiving litter's age), but that fix covered day-1 piglets. Day-3 piglets in a day-4 litter still pick up "late".

3. **Zh run-together of source and count. Change a slice (strings; `litter.html` row meta). New.**
   - Screen: `40-390-zh-a04`.
   - What happened: "来自A073头" and "14头待处理 · 来自A073头". The crate code A07 and the piglet count 3 run together as "A073".
   - Expected: a separator such as "来自 A07 · 3头".

4. **One tap can record the arrivals together with the litter's own piglets in Unit 8. Change a slice (`litter.html`). New.**
   - Screen: `31-f02`. F02 (day 6) shows "Dock tail · 12 owed · 11 of its own · late 3 days · 1 from A07 · due today · Record 12".
   - Problem: the arrival's age and the litter's own age are merged into one row and one button. The row title says one thing and the meta two.
   - Iron is handled well: two separate rows, "Iron 11 owed, Record 11" and "Iron 1 from A07 unknown".
   - Expected: Dock tail split the same way as Iron, or the meta line separates the own piglets from the arrival.

5. **Moving 1 piglet to an unprocessed Unit-8 sow drags her whole litter into the task as late. Owner question, not a slice change. Already ruled in R4, but a worker would still be surprised.**
   - Screens: `30-unit8`, `31-f02`.
   - What happened: Task overview goes "0 / 20" to "0 / 21". Unit 8 goes from none owed to F02 "due 6 days ago · Check". The F02 drawer lists Cut cord and Nasal drops "6 days late" and Iron "3 days late", each with 11 owed and a Record 11 button.
   - Why the worker cares: the worker only fostered one piglet and has no sign that F02's own piglets now owe a week's backlog.
   - Suggest the owner confirm that a nurse sow's own history (Round 4: "her earlier facts stay") belongs on her earlier litter, and that the room shows "joined the task" as its own signal. In the base fixture she has no earlier facts.

6. **A contradictory answer is accepted. Change a slice (`litter.html`). New.**
   - Step: the receiver answers "0 had it, record now for 3" for piglets that came from a source with only 2 untreated ones.
   - What happened: Save is allowed with no warning. The source silently drops to zero owed.
   - Expected: a one-line caution such as "only 2 of these were left untreated".

7. **Smaller issues:**
   - Move's crate suggestions list same-row crates by row (A02, A04, A05, D02 for a sow with no piglets). B02, the small litter the worker wants, is not suggested. The worker must know and type the code. Related to R1-5 and R1-31, but a different gap: search works, suggestions are not ranked by size.
   - The Move page's Iron question sits above the fold. On the next screen the hint "Answer Iron first" is a third of a screen below the disabled Move button.
   - The Moves page (`move.html?state=move`) opens as a separate screen with its own "Moves" header, not as a drawer over the room. After the receipt, Back goes to that page and then to the litter drawer. That is two Backs before the room. A farrowing sow drawer has one.

**Classified**

| Item | Class |
|---|---|
| Source-side answer not reaching receiver (1) | change a slice (ledger, `litter.html`) |
| Receiver lateness and list row (2) | change a slice (ledger, `room.html`, `litter.html`) |
| Zh "A073" (3) | change a slice (strings) |
| Merged Dock tail row on F02 (4) | change a slice (`litter.html`) |
| Unit-8 nurse sow dragged in as late (5) | owner question (R4 already ruled the join) |
| Contradictory answer accepted (6) | change a slice (`litter.html`) |
| Move suggestions not ranked by size, below-the-fold hint, Moves screen not a drawer (7) | change a slice (`move.html`) |

None of these is a new slice or a new module.

**R1 findings**
- **Fixed since round 1:** R1-2 (resolve sheet on `litter.html`), R1-3 (source range after a "Don't know" move), R1-5 (crate search across rows and units), R1-18 (receiver shows "from A07 · unknown" instead of inventing doubt).
- **Still broken:** none of the R1 items I touched.

**New scenarios found**
- A piglet moves twice from one source. A07 then reads "0–2 of 10 owe · 3 to B02 unknown · 1 to F02 unknown". It is correct but needs three separate checks. The worker may want one "check all moved" path.
- Worker resolves the source first, then goes to the receiver (finding 1). The reverse order works.
- Move is the only way to reach a litter in another unit. Opening it from the room list is not possible. The worker must type the crate code, and "Unit 8" is a different task.