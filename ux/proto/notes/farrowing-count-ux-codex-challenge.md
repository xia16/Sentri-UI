colleague: family=openai model=gpt-6-astra effort=medium session=01a1633c-46ea-7fe3-971d-b207ea0f3b43 status=ok via=mini · codex:adam cached-tokens=113024 roster-checked=2026-09-24

1. **Verdict: keep fast birth events; reject the automatic invention of a birth.**

   **Sound:** one-tap live births, deliberate death recording, local saving, and preserved corrections fit the setting.

   The crate question is useful **as a check**, but its answer does not establish what happened. “There are 10” cannot prove that the dead piglet’s birth was unrecorded.

   I assume the nine scenarios from the earlier brief still apply; the new position replaces its counting model. For examples, the starting record is 10 live births, 1 stillbirth, no later deaths: **10 alive, 11 total born**. I assume no fostering during these examples.

2. **The strongest failures are not rare mathematical edge cases.**

   - **A different piglet was born between visits.** A counted piglet dies; another is born alive. There are still 10 alive. The worker chooses Died → Crushed → “No, there are 10.” Your model assigns the missing birth to the dead piglet. The totals happen to be right, but the asserted history is wrong. That matters when correcting that death later: removing its supposedly associated birth could remove the surviving newcomer from the count.

   - **The previous shift missed two births.** The record says 10 alive; there are actually 12. One dies, leaving 11. Died → Crushed offers “9?” or “10.” Neither is true. The worker must abandon the task or choose a false answer. An arbitrary count entry solves the restricted answers, but still cannot identify which events were missed.

   - **An old undercount masquerades as today’s birth.** Yesterday’s figure should have been 11 rather than 10. Today one of those piglets dies, leaving 10. “No, there are 10” creates a birth today instead of correcting yesterday’s count. The app obtains a plausible total by recording an unsupported time and relationship.

   - **Offline recording produces a duplicate birth.** Worker A records a birth on an offline phone. That piglet later dies. Worker B’s phone still shows 10, although 11 births have been recorded across the devices. B records Died and answers “There are 10”; the app manufactures another birth. After syncing, the litter has one extra birth and one extra apparent survivor. The body-removal rule does not prevent this.

   - **Interruption splits the death operation.** If selecting Crushed saves the death before the crate question, an uncounted dead piglet temporarily reduces Alive from 10 to 9. The sow needs assistance; the worker locks the phone. The correction never happens. If you instead wait for the answer, the death operation is staged, contrary to “every action saves at once.” Choose staged death recording explicitly.

   - **Physical removal and recording cannot be atomic.** A worker records a death, then helps the sow before removing the body. The next worker records the same body. Reverse the order and an interruption can leave a removed body unrecorded. The farm rule is useful discipline; it is not a guarantee the software can safely assume.

   - **“Missing” becomes a false death.** A piglet disappears under bedding. Died → Missing reduces Alive. It reappears alive later. Recording Born alive would inflate births; removing a death “that did not happen” would misdescribe the original observation. Missing needs a recovery action and must remain separate from confirmed deaths in reports.

   - **Removing a birth can invalidate a later death.** A duplicate birth was recorded on the previous shift; subsequently a piglet died. Fix must remove the duplicate without removing the genuine birth needed by the death record. An event list alone does not make that relationship obvious, especially with anonymous piglets.

   - **A found body does not supply the missing knowledge.** Scenario 9 provides “9 alive and one body,” not evidence of crushing or whether the piglet was born alive. The proposed walk silently supplies both. I do not assume the listed body signs reliably settle every case; the material provides no validation of that rule.

3. **Shared interaction rules for the alternatives**

   All three variants keep a fixed, large **Born alive** target on the main screen. One completed tap saves one birth locally and gives tactile feedback after successful saving. Its position never shifts when a receipt appears. Undo stays available without a timeout.

   This supports looking away **after verifying the sow and screen**. It cannot guarantee no-look operation across unlocking, navigation, or a different sow being open. Do not add a confirmation to each birth or silently discard rapid repeated taps.

   For the scenario walks below:

   - Tap counts start on the correct sow’s main screen; scrolling and unlocking are excluded.
   - **Old-count correction:** History → entry → Correct number → Remove one mistaken birth → Confirm: **5 taps**. The original remains visible.
   - **Cause correction:** History → entry → Correct cause → cause → Apply: **5 taps**.
   - **Wrong sow:** History → entry → Wrong sow → Save discrepancy: **4 taps**. No count changes until both litters are reviewed. None of these variants supports a casual remove-and-re-enter shortcut.
   - Uncertain observations can be saved for handoff. They are explicitly **unresolved**, not completed death records with invented causes.
   - All controls meet the supplied touch and text minimums.

4. **Variant A — “Record what you know”: events without inferred births**

   **Idea:** Keep the event model, but require evidence before adding an unrecorded birth.

   **Worker’s mental model:** “I record what happened; if I don’t know, I leave a finding for the next person.”

   **Main surface, in order:** sow and crate; Alive; Born alive; Record death; latest saved action and Undo; unresolved findings; total born; History.

   Death entry asks for cause, then whether its birth was **already recorded**, **known to be unrecorded**, or **unknown**. The final action states the resulting Alive count. “Count differs” saves a finding instead of manufacturing events.

   **Nine scenarios**

   - **1 — Live birth:** Born alive, **1 tap**. Shows 11 alive, 12 born.
   - **2 — Witnessed stillbirth or mummy:** Born dead → Stillborn/Mummified, **2 taps**. Shows 10 alive, 12 born.
   - **3 — Counted piglet dies:** Record death → cause → Birth already recorded → Record, **4 taps**. Review shows 9 alive; afterwards 9 alive, 11 born.
   - **4 — Known uncounted piglet dies:** Record death → cause → Birth not recorded → Record, **4 taps**. Shows 10 alive, 12 born. The birth is marked “recorded later; time unknown,” not born at entry time. **If the worker cannot establish this history, the case remains unresolved.**
   - **5 — Mis-tap:** Undo, **1 additional tap**. Reverses the complete action, including both records in a birth-and-death entry.
   - **6 — Old miscount:** The shared correction path, **5 taps**. Removing one false live birth shows 9 alive, 10 born.
   - **7 — Missing:** Count differs → One missing → Record finding, **3 taps**. Shows “One reported missing; count needs checking.” Does not assert a death or silently change the confirmed count.
   - **8 — Wrong cause/sow:** Shared paths: **5/4 taps**. Cause changes without changing counts; wrong-sow finding awaits review.
   - **9 — Nine alive and one body:** Found body → Birth history unknown → Alive seen → 9 → Record finding, **5 taps**. Shows the observation beside the recorded 10 alive. **Does not finish reconciliation.**

   **Saving and undo:** Births save immediately; deaths commit only on Record. Back or locking preserves an unfinished death draft without changing totals. Undo is tied to a specific action, not an invisible visit boundary. After dependent work, it opens a correction review.

   **Old versus now:** History corrections explicitly identify the earlier record. Findings are observations now; they are not backdated events.

   **Loss and night-time confusion:** This preserves honest history but leaves uncertain work unfinished. “Was its birth recorded?” remains difficult at shift change. This variant is strongest for continuous attendance and weakest for rounds.

5. **Variant B — “Check the crate”: live-birth shortcuts plus independent observations**

   **Idea:** Record births quickly, but use a fresh Alive observation and body findings during rounds. Do not reconstruct events merely to make totals agree.

   **Worker’s mental model:** “I say what I can see now.”

   **Main surface, in order:** sow and crate; latest observed Alive and when it was checked; Born alive; Check crate; unresolved difference, when present; recorded births and losses; History.

   This deliberately challenges “nobody edits Alive”: a worker records a new **observation**, preserving the previous one. Observed Alive and event-derived Alive may differ. Total born continues to come from birth records, never from the observation alone.

   **Nine scenarios**

   - **1 — Live birth:** Born alive, **1 tap**. Saves the birth and advances the working Alive count to 11; shows 12 recorded births.
   - **2 — Witnessed stillbirth or mummy:** Born dead → cause, **2 taps**. Shows 10 alive, 12 born.
   - **3 — Counted piglet dies:** Check crate → Alive field → 9 → One new body → cause → Record check, **6 taps**. Shows 9 observed alive; records the body and cause. Birth total stays 11.
   - **4 — Uncounted dead piglet:** Same check, entering 10, **7 taps** because 10 has two digits. Shows 10 observed alive and the new body. **Recorded births remain 11 and reconciliation is required.** Adding the missing birth needs separate evidence; the check does not invent it.
   - **5 — Mis-tap:** Before committing, replace the mistaken entry. After committing, Undo check, **1 tap**, restores the previous observation and reverses its body entry together.
   - **6 — Old miscount:** Shared historical correction, **5 taps**. Corrects the earlier birth figure; an independent later observation is not silently rewritten.
   - **7 — Missing:** Check crate → Alive field → 9 → No body → Record check, **5 taps**. Shows 9 seen, one unexplained difference. No death is created.
   - **8 — Wrong cause/sow:** Shared paths, **5/4 taps**. A wrong-sow check requires reviewing both its body finding and Alive observation.
   - **9 — Nine alive and one body:** Check crate → Alive field → 9 → One body → Not sure when/how it died → Record check, **6 taps**. Saves exactly that observation. Shows 9 alive seen and one body awaiting classification.

   **Saving and undo:** Checks commit together on Record check. Back and interruptions preserve drafts. Live births still save immediately. An old check cannot overwrite a newer check that arrives during sync; both observations retain worker and time and require resolution if inconsistent.

   **Old versus now:** “Check crate” always means observed now. Correcting an old figure starts in History.

   **Loss and night-time confusion:** Exact intervening events and sometimes birth totals remain unknown. That is acceptable if honest operational observations outrank immediately complete statistics. It is unacceptable if the owner requires one always-reconciled number: a tired worker may struggle with “9 seen” versus “10 calculated.” The main surface must lead with the fresh observation and expose the discrepancy plainly.

6. **Variant C — “One record per piglet”: individual life records**

   **Idea:** Each birth creates a piglet record; later outcomes belong to that piglet. This replaces aggregate counter interaction with a roster of individual lives.

   **Worker’s mental model:** “This piglet was born; this same piglet later died.”

   **Main surface, in order:** sow and crate; Born alive; Alive total; piglet records ordered by recent activity; Add found piglet; History.

   **Critical assumption:** workers can distinguish individual piglets using an existing reliable identifier. A sequence number assigned by the app is not enough. Without such identification, this variant fails.

   **Nine scenarios**

   - **1 — Live birth:** Born alive, **1 tap**. Creates a provisional piglet record; shows 11 alive, 12 born. Identity must be attached later if unavailable now.
   - **2 — Stillbirth or mummy:** Born dead → cause, **2 taps**. Creates a dead-at-birth record; shows 10 alive, 12 born.
   - **3 — Counted piglet dies:** Select identified piglet → Died → cause → Record, **4 taps**. That record becomes dead; shows 9 alive, 11 born.
   - **4 — Uncounted dead piglet:** Add found piglet → Born alive, later died → cause → Record, **4 taps**, **only if known**. Shows 10 alive, 12 born. If unknown, choose Unknown history and save a provisional finding instead.
   - **5 — Mis-tap:** Undo, **1 tap**, restores the preceding state or removes the mistaken provisional birth through a retained reversal.
   - **6 — Old miscount:** Select duplicate piglet record → Recorded by mistake → Confirm, **3 taps**. Shows 9 alive, 10 born. **Fails if the worker cannot identify which record is the duplicate; later outcomes require review.**
   - **7 — Missing:** Select piglet → Missing → Record, **3 taps**. Shows 9 present, one missing, 11 born. A later Found action restores presence without creating a birth.
   - **8 — Wrong cause:** Select piglet → History → death → Correct cause → cause → Apply, **6 taps**. Wrong sow uses the shared discrepancy path, **4 taps**, followed by review.
   - **9 — Nine alive and one body:** Add found piglet → Identity unknown → Alive seen → 9 → Record finding, **5 taps**. Saves an unresolved observation. **Identification is still needed to settle the roster.**

   **Saving and undo:** Birth creation saves immediately; later outcomes commit as complete actions. Back preserves drafts. Undo cannot erase a birth with subsequent care or death records without review.

   **Old versus now:** Corrections change a specific historical entry; current events change the piglet’s current state.

   **Loss and night-time confusion:** With reliable identity, little is lost. Without it, the app creates precise-looking records workers cannot connect to real animals. “Piglet 7” and “Piglet 8” are meaningless if neither is physically distinguishable. I would reject this variant for the supplied setting unless identification already exists.

7. **Recommendation, the crate guard, and what to cut**

   **Choose Variant A if complete event accounting remains the product’s priority. Choose Variant B if supporting hourly rounds and uncertain findings is the priority.** My recommendation for this brief is **B with the one-tap birth shortcut**, because scenarios 4 and 9 are normal work, not exceptions workers can reliably explain.

   The crate question should be a **discrepancy detector**, never a birth generator:

   - Ask at the end of a death flow, before committing the combined result.
   - Offer **Matches / Different / Cannot count now**, rather than two guessed totals.
   - After a witnessed stillbirth, do not require a recount merely for symmetry. After discovering an unwitnessed body, offer a crate check regardless of which cause the worker suspects.
   - If counting is impossible, retain the finding without presenting the litter as reconciled.

   The owner has three decisions to make:

   - **May observed Alive differ from event-derived Alive?** If no, accept unresolved counts rather than fabricated births.
   - **Is Missing a distinct state with a Found action?** I recommend yes, excluded from confirmed-death rates.
   - **What uncertainty may be saved?** Unknown birth history, unknown cause, and an interrupted death entry need explicit treatment; “Other” should not conceal them.

   Cut the automatic “count differs by one, therefore this piglet had an unrecorded live birth” rule. Cut the visit-only Undo boundary. Cut the requirement to identify every found body as born dead or born alive when the worker lacks evidence.

   **Do not support automatic reconciliation from a count difference or casual cross-sow death reassignment.** Both need information that the proposed taps do not provide.

8. **What I did not probe**

   I did not validate body-based classification, practical piglet identification, recount accuracy, glove feedback, bilingual wording, finish-lock corrections, or the implementation of offline conflict handling. These are interaction proposals and concrete counterexamples, not field-tested findings.
