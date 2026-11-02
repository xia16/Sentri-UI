colleague: family=openai model=gpt-6-astra effort=high session=01a19a92-d3e6-7d60-a540-5b2c8f83ae7b status=ok via=mini · codex:adam cached-tokens=179072 roster-checked=2026-09-24

**1. Corrections inventory**

My recommendation is a restricted hybrid: keep evidence-based corrections available after Finish, remove unrestricted editing of totals, and make Recount a separate action that never changes birth or death figures.

I am treating the owner’s proposed post-Finish lock as a hypothesis to test. No separate leader position was supplied. I assume paper tallies sometimes survive shift changes and individual piglet identification varies by farm.

Today’s correction entrances are:

| Entrance | What it reaches |
|---|---|
| During farrowing → Alive card → Litter details → Edit record | Alive and all six death counts |
| Finished → Farrowing record → Edit | Born, all six death counts, Finish details |
| Sow → Actions → Edit litter record | The corresponding editor; disabled before anything is recorded |
| Sow → Actions → Reconcile piglet count | Current live count, with an identified-piglet floor and mandatory reason |

The corrections available through these entrances are:

| Correction | Current support |
|---|---|
| Alive up or down during farrowing | Direct stepper; changing it also changes derived Total born |
| Stillborn, Mummified, Crushed, Scours, Starve-out, Other | Each count can increase or decrease, during and after farrowing |
| Wrong death category | Decrease one category and increase another |
| Wrong sow | The rulings prescribe a correction on the wrong sow and a separate recording on the correct sow; these are not linked |
| Additional births after Finish | Born pencil → More born → quantity → Alive or Died; Died requires a category |
| Incorrect birth total after Finish | Born pencil → Count was wrong → replacement total |
| Weak, Deformed, Assisted, Litter weight at Finish | Finished editor → Finish details |
| Current litter head count | Reconcile piglet count; raises frozen Born when the count increases |

Draft changes before Save are not historical corrections. Record dead and Foster are new events, although workers may misuse them to repair mistakes.

**The provenance principle is sound:** preserve the original and stamp the amendment.

The implementation nevertheless contradicts the processing rules. [`saveCountReconcile`](/Users/agent/jobs/call-7ddc132f2e/tree/ux/system/farrowing-astra-concept.js:154) can raise frozen Born, whereas the [rulings](/Users/agent/jobs/call-7ddc132f2e/tree/ux/research/farrowing/RULINGS.md:432) explicitly say a high count is not More born. That is a product inconsistency, not merely confusing wording.

**2. What a worker can honestly know**

Finish does not determine whether evidence exists. A shift change can destroy knowledge before Finish; a paper tally can preserve it for days afterwards.

| Correction | While the sow is still farrowing | Hours or days after Finish |
|---|---|---|
| Alive | The worker knows they tapped +4 twice after seeing four births. But counting nine piglets now does not establish how many were born across earlier shifts. | They can count bodies present. Without complete birth, death and movement records, they cannot reconstruct births from that count. |
| Stillborn | A witnessed delivery or contemporaneous tally can establish a recording error. Finding a dead piglet later does not itself establish stillbirth. | A paper record can prove “two entered, one recorded on paper.” An unidentified body cannot reliably establish its original litter and birth status. |
| Mummified | A distinguishable mummy associated with this delivery can support the entry. A shared disposal container cannot establish which sow it came from. | A retained litter-specific tally or documented examination can support correction. Memory of “some mummies last night” cannot. |
| Crushed | A worker who recorded one observed death twice can remove the duplicate. Finding a body under the sow does not by itself prove every causal detail. | An original tally can prove a duplicate or wrong button. With the body gone and another shift present, “probably crushed” cannot justify replacing another cause. |
| Scours | The worker may know which category they intended to select from their observation. A suspected diagnosis remains suspected. | A documented later finding may support revision. A new scours case does not prove yesterday’s unidentified death had the same cause. |
| Starve-out | An observation or farm assessment associated with that piglet may support the category. A low head count cannot. | A surviving record can establish a transcription error. The next worker cannot infer starvation merely because the litter is smaller. |
| Other | A known death with no defensible specific cause can remain unclassified. A missing piglet is not a known death. | A documented finding may justify reclassification. Pressure to reduce “Other” is not evidence. |
| Wrong death category | The worker notices they tapped Crushed while intending Stillborn. Both values must change together. | The same correction remains honest if the paper entry or identified piglet establishes the mistake. Finish adds no relevant evidence barrier. |
| Wrong sow | The worker checks sow tags and discovers that a four-piglet entry went to the adjacent crate. | A sow-tagged paper tally can establish the same error later. Untagged fostered piglets cannot reconstruct maternity merely by being present. |
| More born | A witnessed additional birth is a new recording. | A worker can witness a birth after an erroneous Finish, or discover an omitted birth entry on paper. An extra piglet found at feeding is neither proof. |
| Born should be N | The complete original tally can reveal duplicate or omitted births; a current count cannot replace that history. | A complete paper tally may establish the correct total. The present litter, after fostering and deaths, generally cannot. |
| Weak | The original observer can correct a mistaken entry. | A piglet looking stronger now does not make its earlier weak classification wrong. Only evidence about the original assessment supports correction. |
| Deformed | The worker can correct a misentry associated with an observed piglet. | A persistent visible feature may support correction if the piglet’s identity and birth litter are known. An untagged fostered piglet does not establish which sow’s Finish record was wrong. |
| Assisted | The person who assisted knows the answer, including when another worker finished the record. | Their direct testimony or contemporaneous note can still establish Yes. A relief worker’s lack of recollection cannot establish No. |
| Litter weight | A scale reading or written slip can prove a transcription error. | The original slip can still prove it. Reweighing a growing, fostered litter measures a different thing. |
| Reconcile count | A physical count establishes the number present at that moment, provided births and movements are not continuing through the count. | The same applies. Tags help identify animals; a roster saying three are alive does not prove three are physically present. |

**The owner’s concern about unsupported cause changes is sound.** The proposed time boundary is not: a documented wrong-button correction tomorrow can be stronger than a guess made before Finish.

The supplied fostering assumption also needs tightening. Guidance places routine fostering within the first day, including 12–24 hours, so it can intersect the period this product treats as farrowing. It should not be assumed to belong safely to a later task. [AHDB guidance](https://ahdb.org.uk/knowledge-library/piglet-fostering), [Queensland guidance](https://www.business.qld.gov.au/industries/farms-fishing-forestry/agriculture/animal/industries/pigs/health/foster).

I did not establish how commonly farms use lung testing. It must not be assumed that ordinary workers can reliably distinguish every unwitnessed stillbirth from an early postnatal death.

**3. Correction versus recount**

A **correction** says: “This particular record was wrong when written.” It needs an identifiable mistake: duplicate entry, wrong number, wrong category, wrong sow or mistranscribed Finish detail.

A **recount** says: “I counted the animals present again; the count differs from the record.” It establishes current presence, not birth history, death cause or maternity.

Today’s controls mix these concepts:

- Alive edits based on looking into the crate are recounts.
- Reconcile piglet count is explicitly a recount.
- More born used because an extra piglet is present is a recount disguised as a birth.
- Born should be N inferred from today’s litter is an unsupported reconstruction.
- Reweighing or reassessing weakness today is a new observation, not a Finish correction.
- A missed birth or death is a late recording, not correction of an existing entry.

Concrete failures follow.

**3.1. A received piglet becomes a fictional birth.** A sow finishes with Born 14, Dead 2 and Alive 12. Another worker moves one piglet in without recording it. Reconcile sets Alive to 13 and increases Born to 15. The app has changed this sow’s reproductive performance without observing a birth.

**3.2. A death correction changes meaning at Finish.** With Alive 9 and Dead 5, reducing Crushed by one before Finish produces Born 13 while Alive stays 9. After Finish, the same reduction with Born fixed at 14 produces Alive 10. A duplicate death entry should restore the piglet deducted by that entry; its meaning should not depend on which side of Finish the correction happens.

**3.3. Recount can count a loss twice.** The record says ten alive. A worker counts nine and saves a loss of one. The next shift discovers the body of the already-absent piglet and records a death. Blindly subtracting again produces eight. A generic adjustment requires a rule for later evidence, even if the product declines a complicated reconciliation workflow.

A trustworthy recount needs a compact explanation:

> Last counted: 12 · yesterday 08:00 · G.H  
> Since then: 2 sent to B4 · 1 received from B7 · 1 death  
> Expected now: 10  
> Counted now: 9 · difference: −1

The underlying history should retain the baseline, relevant events, expected count, observed count and worker/time. If there has been no physical count, say what the baseline actually is; Finish is not automatically a verified head count.

Show event details on demand. Include births during an open farrowing session, moves, deaths, prior adjustments and weaning where applicable. Show whether other workers’ records are still unsynced: “no recorded moves” cannot mean “no moves happened.”

**A compulsory explanation is unsound:** a relief worker may honestly know nine are present and have no idea why ten were expected. Allow no explanation; record the difference as unexplained.

**4. Product options**

**4.1. Option A: Edit during farrowing only; lock all historical fields at Finish**

- **Data:** Keep original entries and pre-Finish amendments. Permit subsequent deaths and moves as new events.
- **History:** Stamped pre-Finish corrections; no later corrections.
- **Total born:** Permanently frozen at Finish.
- **Dead by cause:** Later deaths accumulate, but incorrect entries cannot be repaired after Finish.
- **Worker sees:** Edit disappears; ordinary recording actions remain.
- **Rulings changed:** Removes anyone’s right to amend Born after Finish and all Finish-detail corrections. The recount action must also stop changing Born.
- **Failure scenario:** The night worker finishes before noticing a duplicated paper entry. The morning worker proves the duplicate, but the product requires a knowingly false birth or death figure to remain.

This is the simplest restriction, but it protects mistakes as firmly as facts. It also leaves pre-Finish aggregate editing’s ambiguity unresolved.

**4.2. Option B: Remove Edit; use generic Recount**

- **Data:** Keep births, deaths and moves as recorded; add signed unexplained count adjustments.
- **History:** Expected → counted, difference, stamp and optional explanation. The brief’s mandatory reason would reverse the processing ruling.
- **Total born:** Never changes through Recount.
- **Dead by cause:** Never changes through Recount.
- **Worker sees:** One current-count action in Actions, with supporting events.
- **Rulings changed:** Retires historical corrections, Born amendment and Finish-detail editing; aligns recount arithmetic with processing.
- **Failure scenario:** A worker accidentally records two crushed deaths instead of one. Recount restores the live count, but the crushing statistic still contains the false death. Assisted and weight errors have no remedy at all.

**Separating current count from Born is sound.** Recount cannot replace every correction.

**4.3. Option C: Restricted corrections plus Recount — recommended**

- **Data:** Keep original saved entries, stamped amendments tied to those entries, the original Finish snapshot, and separate count observations.
- **History:** “Crushed entry 2 → 1; original entry by L.M; amended by G.H,” rather than an unexplained replacement of an aggregate. Preserve original and corrected Finish figures.
- **Total born:** Derive it from birth records. Freeze ordinary birth recording at Finish, but allow a supported amendment or explicit late birth recording to restate the historical total. Recount never changes it.
- **Dead by cause:** Change only through recording or amendment of a death event. Recounts never invent deaths. Moving one death between categories preserves total deaths; moving between born-dead and died-after-birth also changes the birth-status reporting.
- **Worker sees:** Recount in Actions; Correct entry on a saved log entry or the Finish record. No editable grid of historical totals.
- **Rulings changed:** Replaces “one correction screen of figures” with one correction route attached to records; removes the More born/count-mismatch shortcut; extends processing’s unexplained-count rule into farrowing.
- **Failure scenario:** A worker may still claim “wrong entry” to improve results. The original record, author and amendment remain visible; the app cannot manufacture truthful evidence.

This adds a distinction farmers can explain on paper: correcting a line versus counting the pen again.

**5. Recommendation, cuts and risks**

Choose Option C with these restrictions.

**5.1. Correct the entry, not the desired outcome.** A worker must identify the saved record being corrected. For a finished birth total or historical cause change, require a short basis such as “duplicate entry” or “paper tally,” with an optional note. Do not require photographs, supervisor approval or a reason for ordinary Recount.

This deliberately changes the old “delta alone is sufficient” ruling for historical amendments.

**5.2. Preserve Finish without making it infallible.** Keep the original Finish snapshot. Display the corrected birth total as amended and use it consistently in current performance reporting. An old receipt remains a historical snapshot with access to subsequent amendments; silently rewriting it would erase what was known at closure.

**5.3. A later recount anchors current presence.** Correcting an older birth or death record must not overwrite a subsequently observed head count. For example, correcting yesterday’s duplicate birth should repair Born without subtracting a piglet from this morning’s counted nine.

A late death found after a recount needs the same protection. If the worker cannot establish whether that piglet was included in the count, require a fresh count to establish current Alive. Do not silently deduct twice or silently forgive a death.

**5.4. Record known movements as movements.** Two opposite recount differences do not prove a transfer. If the worker knows two piglets went from A to B, record the transfer against both litters.

I would reopen ordinary within-batch fostering during farrowing. Otherwise this feature routinely asks workers to explain a difference caused by an operation the product refuses to record. Keep outside-batch fostering out of this round.

**5.5. Do not let aggregate counts rewrite individual identities.** If all three recorded piglets have tags but only two are found, the third has not become an anonymous death. Require the identity discrepancy to be resolved before posting a contradictory aggregate count. This is a genuine limit on a “works for any group” promise.

I would cut:

- The seven-row aggregate correction editor.
- More born as a response to finding an extra piglet.
- Born should be N without an identifiable birth-record basis.
- Mandatory free-text reasons for Recount.
- Automatic death-cause assignments from count differences.
- A universal all-species, all-group adjustment feature in this round.
- Automatic matching of unexplained gains and losses between pens.

The main risks are concrete. Workers may use Recount instead of recording known deaths, leaving mortality understated. They may call a recount a birth correction to improve sow results. Shift changes may leave movements unknown. A later body may be recorded twice. These risks require clear accounting rules and visible originals; hiding the Edit button does not remove them.

**6. Questions only the owner can answer**

These are proposed decisions, not requests to pause this review.

**6.1. May a proven historical mistake be corrected after Finish?**  
**Recommended answer:** Yes, against the original entry, with the original retained and a stamped basis. Finish alone is not grounds to reject evidence.

**6.2. May Recount ever change Born or a death category?**  
**Recommended answer:** No, before or after Finish. Unexplained differences remain separate from births and deaths.

**6.3. Is a reason required for a count difference?**  
**Recommended answer:** No. Keep the existing processing rule; allow an optional note. Require a basis only when asserting that historical information was wrong.

**6.4. Will Farrowing support ordinary fostering within the batch?**  
**Recommended answer:** Yes, including before Finish. Otherwise explicitly accept that common movements will appear as unexplained differences.

**6.5. What happens when late evidence overlaps a saved recount?**  
**Recommended answer:** Preserve the recount as evidence of presence at that time. Amend historical facts separately; require a fresh count when current presence cannot be established without guessing.

**6.6. Which figures should reports and closed receipts use after amendment?**  
**Recommended answer:** Current performance reports use amended historical facts and expose their provenance. Closed receipts retain their original snapshot and disclose later amendments.

**7. What I did not probe**

I inspected repository rules, scenario documentation and the relevant prototype handlers; I did not run a fresh interactive prototype walk or change files. I did not interview workers, measure error frequency, validate cause-diagnosis practices, or test offline concurrency. I did not fully examine sow-died/aborted corrections, downstream exports, or the identity workflow needed when tagged animals disappear. Those limits do not alter the central finding: a present count cannot establish birth history, and Finish cannot determine whether a historical correction is honest.
