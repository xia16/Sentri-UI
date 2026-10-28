colleague: family=openai model=gpt-6-astra effort=high session=01a1633c-46ea-7fe3-971d-b207ea0f3b43 status=ok via=mini · codex:adam cached-tokens=54272 roster-checked=2026-09-24

1. **Scope, assumptions, and the problem no interaction can remove**

   I ran this as a blind exercise. No leader’s position was supplied, so I have not invented one to attack. I checked the repository’s workflow, design rules, and [farrowing PRD](/Users/agent/jobs/call-84de2f84d8/tree/features/farrowing/PRD.md). These are proposed alternatives, not changes to approved product rules.

   **Sound:** derived Born, preserved history, and touch-only operation are sensible constraints.

   I assume Dead means **all deaths recorded for this litter**, including bodies already removed. Otherwise removing a body would reduce Born.

   Two concrete limits matter:

   - **A census cannot always establish deaths.** The record says 10 alive, 1 dead. A worker sees 9 alive and one body. That body might be the previously recorded death, with another piglet missing; or a new death, with the earlier body removed. The same observation supports different totals.
   - **Missing cannot be represented faithfully by the three numbers.** Starting at 10 alive, 1 dead, 11 born, a missing piglet means 9 alive, 1 known dead, but still 11 born. The required equation cannot express that.

   All variants therefore allow a **saved observation awaiting a check**. It records what the worker saw without pretending the official totals are resolved. This is a proposed capability, not an existing one.

   Tap counts below start on the sow’s counting screen, exclude unlocking and scrolling, and use one-digit replacement values. Each example independently starts at **10 alive, 1 dead, 11 born**. All actionable controls meet the brief’s size requirements.

2. **Variant A — “Tell me what happened”: an event book**

   **Idea:** Record a birth or death as a named action.

   **Worker’s mental model:** “I’m telling the next person what just happened.”

   **Main surface, in order:** sow and crate; Alive; “Born alive” and “Record a death”; latest saved action with Undo; Dead and Born; History; “Count doesn’t match.”

   A death asks: **“Was this piglet included in Alive?”** Choices are Yes, No, and Don’t know. There is no preselected answer. Cause follows, then a review stating the resulting numbers.

   **The nine scenarios**

   - **1. Born alive:** Tap “Born alive” — **1 tap**. Immediately shows 11 alive, 1 dead, 12 born and “Birth recorded.”
   - **2. Stillborn or mummified:** Record a death; No; choose the cause; Record death — **4 taps**. Shows 10 alive, 2 dead, 12 born.
   - **3. Counted alive, then dies:** Record a death; Yes; choose cause; Record death — **4 taps**. Shows 9 alive, 2 dead, 11 born. Both changes save together.
   - **4. Previously uncounted dead piglet:** Record a death; No; cause; Record death — **4 taps**. Shows 10 alive, 2 dead, 12 born. Works only if the worker knows it was uncounted.
   - **5. Mis-tap:** Tap the persistent Undo beside the latest action — **1 additional tap**. A mistaken live birth restores 10/1/11; a mistaken death reverses its entire change, including any Alive reduction.
   - **6. Earlier miscount:** History; relevant entry; “Number was wrong”; Alive field; enter 9; Apply correction — **6 taps**. Shows 9 alive, 1 dead, 10 born, with “Earlier count corrected.” No death is created.
   - **7. Vanished:** Count doesn’t match; Alive field; enter 9; “No body found”; Record observation — **5 taps**. Shows “9 seen; record says 10; check needed.” Official totals remain unchanged. **Does not resolve the count.**
   - **8. Wrong cause or sow:** Wrong cause: History; death entry; Correct cause; new cause; Apply — **5 taps**; totals unchanged. Wrong sow: History; entry; Wrong sow; Record discrepancy — **4 taps**; entry is flagged and totals remain unchanged. **Moving a death between sows is unsupported here.**
   - **9. Sees 9 alive and one body:** Count doesn’t match; Alive field; 9; Bodies seen field; 1; “Don’t know what changed”; Record observation — **7 taps**. Both observations are saved; totals remain unresolved. **Poor at completing routine rounds when workers lack history.**

   **Saving and undo:** A live-birth tap saves locally immediately. A death saves only on its final named action. Back keeps an unfinished death as a clearly labelled draft; locking does the same. Neither commits it. Undo appends a reversal; older actions remain accessible through History. If later work depends on an action, reversing it requires review.

   **Old versus now:** Main actions describe events. Old corrections start from a historical entry and show its original worker and time.

   **Loss and night-time risk:** Uncertain findings cannot update totals. This avoids invented events but leaves common work unfinished. A tired worker may interpret “included in Alive” as “was it ever alive?” and answer Yes for scenario 4. The distinction demands exactly the knowledge the brief says workers often lack.

3. **Variant B — “Count the litter”: replace totals after a recount**

   **Idea:** Enter the complete count observed during this visit, rather than individual events. This departs from counter buttons.

   **Worker’s mental model:** “I’m checking how many there are.”

   **Main surface, in order:** sow and crate; “Count this litter”; last checked Alive and time; any unfinished check; recorded Dead and derived Born; History.

   The check asks for Alive now, then **total deaths for this litter, including bodies removed**. A changed death total requires a cause for each added death. The previous numbers are available during review, but do not prefill answers as if they were a fresh count.

   **The nine scenarios**

   - **1. Born alive:** Count this litter; Alive field; enter 11; “Deaths unchanged”; Record count — **6 taps**, counting both digits. Shows 11 alive, 1 dead, 12 born. **Slow for someone watching every birth.**
   - **2. Stillborn or mummified:** Count this litter; Alive field; enter 10; Total deaths field; enter 2; choose cause for the added death; Record count — **8 taps**. Shows 10/2/12.
   - **3. Counted alive, then dies:** Count this litter; Alive field; 9; Total deaths field; 2; cause; Record count — **7 taps**. Shows 9/2/11. No question about whether to subtract Alive.
   - **4. Previously uncounted dead piglet:** Same actions as scenario 2, with the appropriate cause — **8 taps**. Shows 10/2/12. The worker must know that two deaths have occurred across the litter’s history.
   - **5. Mis-tap:** Before recording, tap the field and replace its value — **2 taps** for a one-digit value. After recording, Undo last count — **1 tap** if nothing later depends on it; restores the prior totals.
   - **6. Earlier miscount:** History; earlier check; “Number was wrong”; Alive field; 9; Apply correction — **6 taps**. Shows 9/1/10 and a correction linked to the earlier check. Using today’s check instead would conceal the distinction.
   - **7. Vanished:** Count this litter; Alive field; 9; Deaths unchanged; “One missing, no body”; Record observation — **6 taps**. Saves the discrepancy, with official totals still 10/1/11. **A normal count cannot be committed as resolved.**
   - **8. Wrong cause or sow:** Cause: History; entry; Correct cause; cause; Apply — **5 taps**, totals unchanged. Sow: History; entry; Wrong sow; Record discrepancy — **4 taps**, flagged for checking. **No direct reassignment.**
   - **9. Sees 9 alive and one body:** Count this litter; Alive field; 9; “Don’t know total deaths”; Bodies seen field; 1; Record observation — **7 taps**. Shows the observation beside the unresolved record. **The apparently natural census still cannot settle this case.**

   **Saving and undo:** Nothing changes official totals until Record count. Inputs persist locally as a draft through Back, locking, and interruptions. The review states every changed number. A completed check is one transaction; Undo reverses the check, not individual figures.

   **Old versus now:** A new check is stamped “Seen now.” Corrections must open an earlier check and say “Number was wrong.” An unexplained fall in Alive cannot silently pass as an ordinary recount.

   **Loss and night-time risk:** Birth times and the sequence between rounds disappear; the system knows when someone checked, not when each birth occurred. That loss may be acceptable for litter totals. The larger weakness is the question about cumulative deaths: a tired worker can enter the one body in front of them and erase two earlier deaths from the current totals through an accidental correction.

4. **Variant C — “Record the body, then count the living”: recount after a death**

   **Idea:** Keep fast live-birth recording, but every newly recorded death includes a fresh Alive count. The app never asks whether that piglet was previously counted alive.

   **Worker’s mental model:** “I record this dead piglet, then tell the app how many are alive now.”

   **Main surface, in order:** sow and crate; Alive; “Born alive” and “Found a dead piglet”; latest saved action and Undo; unresolved observations; Dead and Born; History.

   The death flow asks whether this body has already been recorded: **Not recorded, Already recorded, Don’t know**. There is no default. This is a different uncertainty from whether the piglet was included in Alive.

   **The nine scenarios**

   - **1. Born alive:** Born alive — **1 tap**. Shows 11/1/12.
   - **2. Stillborn or mummified:** Found a dead piglet; Not recorded; cause; Alive field; enter 10; Record death and count — **7 taps**. Shows 10/2/12.
   - **3. Counted alive, then dies:** Found a dead piglet; Not recorded; cause; Alive field; 9; Record death and count — **6 taps**. Shows 9/2/11.
   - **4. Previously uncounted dead piglet:** Same steps, entering 10 alive — **7 taps**. Shows 10/2/12. Whether it once appeared in Alive does not need an answer.
   - **5. Mis-tap:** Before recording, change the mistaken answer; no totals have changed. After recording, Undo — **1 tap** when there is no later dependency. Reverses both the death and its accompanying Alive count.
   - **6. Earlier miscount:** History; earlier entry; “Number was wrong”; Alive field; 9; Apply correction — **6 taps**. Shows 9/1/10, explicitly labelled as an old correction.
   - **7. Vanished:** “Count doesn’t match” under the count; Alive field; 9; No body found; Record observation — **5 taps**. Shows 9 seen against 10 recorded; unresolved. No death or correction is invented.
   - **8. Wrong cause or sow:** Cause: History; death; Correct cause; cause; Apply — **5 taps**, totals unchanged. Sow: History; entry; Wrong sow; Record discrepancy — **4 taps**, flagged. **No direct reassignment.**
   - **9. Sees 9 alive and one body:** Found a dead piglet; Don’t know; Alive field; 9; Record observation — **5 taps**. Shows “9 alive and 1 body seen; check whether death recorded.” Official totals remain unchanged. If the worker later establishes that this is a new death, opening that observation, choosing Not recorded, choosing cause, and recording takes **4 further taps**, provided the recount is still current.

   **Saving and undo:** Births save locally on the tap. Death and recount save together only on Record death and count. Back or interruption preserves the draft, including when the count was observed. Resuming an old draft requires checking that Alive is still current. Undo adds a reversal to history.

   **Old versus now:** The death flow records a body and a present observation. History handles old errors. If a recount reveals an extra unexplained drop—record says 10 alive, one new death is entered, but only 8 are found—the discrepancy stays unresolved; the app does not fabricate a second death.

   **Loss and night-time risk:** This loses the exact sequence of births and deaths between checks, but usually preserves useful totals. It imposes a whole-litter recount for one death, potentially while the worker should be assisting the sow. A tired worker may also choose Not recorded simply to proceed. If the cause is unknown, the finding remains pending; “Other” must not secretly mean “I don’t know.”

5. **Recommendation and owner decisions**

   **Choose Variant C**, with the clearly separate observation path. It gives watched live births a one-tap action and handles scenarios 2–4 without asking workers to reconstruct whether the dead piglet was included in Alive. Its cost is the recount after each death.

   This is conditional: if recounting the living litter is impractical during normal work, C is unsuitable. Variant A is faster but pushes the central ambiguity onto the worker. Variant B asks workers for a cumulative death count they may be unable to observe.

   The owner needs to settle three decisions:

   - **Can a record remain visibly unresolved?** Without that state, scenario 9 forces a guess. The handoff must preserve the observation until someone can resolve it.
   - **Is a fresh Alive count practical after each death?** If not, the owner must accept either delayed completion or the event model’s knowledge requirement.
   - **What does “missing” mean in the product?** Keeping both the stated Alive definition and the Born equation prevents a truthful resolved record for scenario 7. Either leave it unresolved or explicitly change the counting model.

   **Do not support guessing an event from a count difference.** A drop from 10 to 9 is insufficient evidence for death, disappearance, or historical error.

   **Do not support one-tap reassignment of an old death to another sow.** If it originally reduced Alive on sow A, moving the death to sow B does not establish whether B’s Alive should fall. That needs a separate review of both records.

6. **What I did not probe**

   I did not test glove use, recount feasibility, Chinese wording, native screen layouts, concurrent offline edits, or reconciliation after later dependent records. I did not examine finish-lock behavior, fostering, reporting calculations, or build a prototype. Those limits especially affect whether Variant C’s recount burden is acceptable.
