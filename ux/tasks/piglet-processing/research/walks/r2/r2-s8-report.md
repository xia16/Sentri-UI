# Round 2, Scenario 8: offline collisions (two workers)

Repo `C:/Users/ying_/Documents/Codex/2026-09-08/clo/Sentri-UI-pilot`, branch `map/3-piglet-processing`, head `dd44ca2`. I served it on port 4958 and drove it with Playwright at 390×844 (en), and once each at 360×740 and in zh. I started from the room list (`room.html?data=<variant>`), then tapped through litter, review and answer sheets. Screenshots and scripts are in `…/scratchpad/walk/r2-s8/`. `01`–`06`, `11`–`17`, `20`–`25`, `31`–`32`, `40`–`41`, `50`–`52` are the ones cited below.

Variants used: `base` (A05 iron double), `double-twice`, `double-same`, `count-offline`, `count-agree`, `held-body` and the `end.html` states `end-review`, `receipt`, `receipt-answered`. I also ran the real ledger in node (`sim.mjs`) for iron collisions the fixtures don't show.

## The three questions

**Iron recorded twice (A05, 08:40 L.M / 08:52 G.H, 11 of 11 each)**
- **Held for review:** both records are kept and each is marked "possible double" on the litter. The room shows a **Check** chip on the A05 row and "To review 1" above the list. The A05 drawer shows a "Needs an answer · 1 held for review" card.
- **Where it is answered:** I tapped the card (or the row in the To-review sheet). It opens a sheet on `edit.html` with two answers: "Same injection, recorded twice" (withdraws one record, counts once) and "Given twice" (double dose for the vet, counts once). The first answer asks "Which record to withdraw?" and Save stays disabled until I pick one.
- **Counted twice or lost:** nothing. The room shows iron as done once, and the log keeps both records, stamped. After "same" the withdrawn record reads "withdrawn, kept". After "twice" the litter shows an extra line, "double dose recorded for the vet · counted once". The room review line and Check chip clear after either answer.

**Two different counts of A07 (G.H 13 at 09:40, L.M 11 at 09:50 synced later)**
- **Held for review:** the room shows a Check chip and "To review 2". The drawer shows a "Counts disagree · neither stands · count again" card. No loss line is written.
- **Where it is answered:** the card opens Set count, with the stepper pre-filled at 13. A new count settles it. Saving 13 clears the flag with no loss. Saving 12 writes an unexplained loss of 1. Saving 11 writes a loss of 2.
- **Counted twice or lost:** no double count. Alive stays 13 (14 minus the crushed piglet), which matches neither phone's figure. I found wrong facts around this, listed below. R1-20 is fixed: `count-agree` shows no Check chip, Alive 12, and an open loss of 1.

**Same dead piglet recorded twice (A07, L.M 09:50 and G.H 09:55, one missing piglet)**
- **Held for review:** the room shows Check and "To review 2". The drawer shows "Body held · recorded twice?" with "Dead 2, Alive 13 until you answer".
- **Where it is answered:** the card opens Set count with a second sheet on top ("Same body recorded twice?"). The answers are "One body" (Alive stays 13) and "Two bodies" (Alive 12). Apply commits the answer.
- **Counted twice or lost:** nothing. "One body" withdraws the second record and Dead stays 2. "Two bodies" applies it, giving Dead 3 and Alive 12. Both are stamped in the log.

**End with these open:** the End review lists open items ("Open for review · 1 item"). The receipt freezes them as "Unresolved at end". `receipt-answered` shows an answer given after End as a correction, with the end figures unchanged. This is already handled for all three kinds (reviewsSelect covers double, held and count). I only saw the double listed in the fixtures, because End is blocked by D01 in the base state.

## Findings

**1. Raw placeholder and a false "Move" in the log after a count dispute is settled.** [change a slice: `edit.html` record page, ledger string] (screenshot 17 area; text captured)
- Step: `count-offline`, open A07, settle the dispute with 13 or 12, then View log.
- Result: G.H's original line reads "1 missing · explained · explained by a Move · 1 piglet from {code} · See {code}'s record". There was no Move, and the `{code}` is unfilled.
- Same log: L.M's count of 11 reads "matches the litter" when the litter is 13 (or 12). After a settle at 11 the line is true.
- Expected: either nothing, or "explained by a death".
- In `held-body` the same line correctly reads "explained by a death".
- New, not in round 1.

**2. Answering a held body lands on a "Set count" sheet with Save enabled, and "Two bodies" leaves a trap.** [change a slice: `count.html` and `litter.html`] (screenshots 24, 25)
- Step: `held-body`, A07, tap "Body held", pick an answer, Apply.
- Result: Apply gives no receipt, such as "Answer saved". The sheet underneath is still titled "Set count" with Save live, and the room behind it still reads "To review 2".
- After "Two bodies", Alive becomes 12, but the stepper stays at 13. It says "1 more · Save writes unexplained gain 1 piglet", the litter shows a "13 counted · not saved" chip, and one tap on Save re-inflates the litter by an invented gain.
- Expected: the held question answered on its own sheet, the stepper reset to the new Alive, and a receipt.
- R1-22 ("held question under the stepper sheet") is partly fixed: it is now visible on room, litter and log. It is still answered through Set count.

**3. A one-tap "Record 13" sits on a litter whose Alive is disputed.** [change a slice: `litter.html`] (screenshot 40, 41)
- Step: `held-body`, tap Record 13 on Iron. Then answer "Two bodies".
- Result: the iron record stays "13 piglets" in a litter that is now 12 alive. Nothing warns that the record is larger than the litter. In `count-offline`, Record 13 sits under "neither stands" while G.H's own count and L.M's count both imply 12 or fewer.
- Expected: while a count or body is held, the Record N shortcut should ask or show "Alive in question".

**4. Count-conflict card and review row are cryptic.** [change a slice: `room.html` To-review row]
- The To-review row reads "Counts disagree · 09:50 ·" with a dangling separator and no names or figures. The drawer card has the figures.
- The stepper pre-fills G.H's 13 with "Same as the record · nothing to explain", so a tap on Save settles the dispute with a number nobody just counted.
- Expected: start the stepper blank or at the disputed range.

**5. Possible-double answers don't fit two workers who each did a different half.** [new slice or owner question, ledger and `edit.html`] (ledger run in node, no UI path)
- Step: two offline phones each record iron for 6 of 12 piglets, with the other 6 deferred.
- Result: the ledger flags a possible double and counts it once (`treatedOnce 6`, `owed 6`). Both answers count once. Neither "same injection" nor "given twice" can say that these were different piglets and both are real.
- Consequence: the litter keeps "6 owed", which would be a real double dose for 6 piglets if the worker taps Record 6.
- Unequal overlaps (8+9 of 12, 12+5) are flagged correctly because they must overlap.
- Expected: a third answer, "Different piglets, both stand".
- Same family as R1-29 / Q-B, but this case is new. The answer set was settled in round 4.

**6. Answer sheets have an empty backdrop.** [change a slice: `edit.html`] (screenshots 04, 06)
- Step: from the A05 drawer, tap the double card.
- Result: the sheet opens on `edit.html`, a different page, so the room behind it is a blank grey. Back returns to the drawer (this works).
- Farrowing keeps the room visible behind its sheets.

**7. Initials are used for people in worker-facing review text.** [change a slice: `litter.js` / `edit.html` strings] (screenshots 12, 14)
- "L.M and G.H each took a body…", "G.H 09:40 · 13 piglets", "08:40 · L.M, 08:52 · G.H".
- The log and receipts use full names ("L. Madsen").

**8. The withdrawn iron record disappears from the A05 drawer.** [already handled, minor]
- After "same", the drawer's Recorded list shows only the kept record. The withdrawn one is in View log, labelled "withdrawn 10:25".

**9. A05's room row reads "8 still owed" while the drawer says 5 tail owed and 8 to identify.** [change a slice: `room.html`] (screenshot 01)
- This is a mixed unit in the headline; it is not a collision bug.

## New scenarios

- **N3 still open:** the worker whose record was held sees "the second body (09:55 · G.H) is held" and "Counts disagree" on their own phone. There is still no "not synced yet" or "your record was held" state. The phone has no sync status at all. [new slice]
- **N-A:** two phones each did half a litter (finding 5).
- **N-B:** a held body, or a disputed count, combined with a one-tap Record N already taken (finding 3).
- **N-C:** where the vet sees "double dose recorded for the vet". It is only a litter log line. I found no vet page or handoff. [owner question or new module]

## What worked

- Both double answers are explicit and stamped, with "counts once" stated up front.
- Nothing is merged silently, and the held body's "Dead 2, Alive 13 until you answer" is clear.
- End never blocks on review items, and a late answer shows as a correction on the receipt.
- zh is fully translated, including all review strings.
- There is no horizontal overflow at 360×740, and the stacked held-body sheet fits.