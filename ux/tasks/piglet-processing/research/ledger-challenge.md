# Ledger model — second-model challenge (openai gpt-6-astra, high), 2026-09-29

Attack on Model B in ledger-model.md. Kept verbatim for the record; the driver's synthesis is in the round-2 grilling and the rulings.


**Model B’s paired transfers are sound; its claim that balance guarantees correctness is not.** The treatment packet also needs substantially more semantics before it can safely drive “owed” counts.

Assumptions: piglets are anonymous unless explicitly identified; workers may record after handling; unspecified reconciliation behavior does not exist yet. I tested the written rules, including the draft offline merge contract.

1. **Sound: one known transfer should update both litters atomically.** Moving two piglets from crate 12 to 16 should produce −2/+2 from one record; linking a previously recorded loss to a subsequently found body can correctly avoid subtracting twice.

2. **A partial-source move can manufacture “fully covered” status.**  
   On day 3, crate 14 has 10 piglets, seven treated and three untreated. Move three **treated** piglets to crate 12. Under the [packet rules](C:/Users/ying_/Documents/Codex/2026-09-08/clo/Sentri-UI-pilot/ux/tasks/piglet-processing/research/ledger-model.md:201), the packet is unknown, and source coverage decreases only for a covered packet. Crate 14 therefore becomes `alive 7, covered 7, owed 0`. Physically, it contains four treated and three untreated piglets.

   Move one untreated survivor to crate 16: the source now falsely certifies it as covered. The uncertainty has become a missed treatment.

   **Change:** update uncertainty on **both** sides. After an unidentified departure of three, remaining coverage is somewhere between four and seven. Preserve that uncertainty until evidence resolves it; never infer uniform coverage merely because the denominator shrank.

3. **Deaths and losses expose the same flaw without any fostering.**  
   Day 3: crate 12 has 12 alive and 12 covered. Day 4: one dies. The model specifies no coverage retirement, leaving `alive 11, covered 12`; its asserted equality already fails. One untreated newcomer then arrives: `alive 12, covered 12, owed 0`, although one piglet owes treatment.

   Blindly subtracting coverage for every death is also wrong: from ten piglets with seven covered, the dead piglet could belong to either group.

   **Change:** distinguish historical treatment counts from coverage among current residents. Every death, loss, transfer and weaning must update the latter, with uncertainty when membership is unknown. Historical marks remain intact.

4. **Offline assertions double-count discrepancies while every equation balances.**  
   At 08:00, both phones show crate 14 at ten. Offline, two workers independently count the same nine piglets. Each writes `L⁻1`. Signed-delta merging produces eight. No zero-floor breach catches this.

   Another case: a worker records a real move 14→16 offline. A second worker, before receiving it, counts the resulting nine and ten and records loss/gain adjustments. Applying both records counts the same movement twice.

   **Change:** persist each count’s observed total and causal base alongside its adjustment. Reconcile overlapping observations and newly received movements explicitly. The repository already leaves this conflict open in [scenario-tree C-14](C:/Users/ying_/Documents/Codex/2026-09-08/clo/Sentri-UI-pilot/ux/tasks/piglet-processing/research/scenario-tree.md:216); suspense does not resolve it.

5. **An open loss can be consumed twice.**  
   September 26: crate 14 has one open loss. Offline, one worker pairs it with crate 16’s gain. Another finds a body and assigns it to that same loss. Both actions appear valid locally. After sync, that one missing piglet has both moved and died.

   Quantities complicate this further: a loss of three might explain two arrivals in crate 16 and one body. A single “relabel this line” operation cannot express that safely.

   **Change:** reconciliation must allocate quantities against immutable observation IDs, support partial allocations, and prevent over-consumption. Concurrent explanations must remain a visible conflict. Atomic transfer legs alone are insufficient.

6. **Delayed pairing and corrections invalidate treatment snapshots.**  
   September 25: an untreated piglet leaves crate 14. September 26: its nine remaining piglets are treated. September 27: the loss is paired with a gain in crate 12. Resolving the packet from crate 14’s **current** fully covered state incorrectly covers the absent piglet. Even a snapshot at loss-recording time fails if the loss was entered after treatment.

   Separately, crate 12 records 12 treated, moves one covered piglet to crate 16, then corrects the original mark as wrong-litter. The stored packet still claims coverage unless a dependency rule invalidates it.

   **Change:** transferred coverage must reference supporting treatment evidence and its population scope. Later evidence corrections must propagate uncertainty. Where event ordering is unknown, preserve unknown; pairing inventory is not proof of treatment history.

7. **Zero suspense hides unresolved facts; “self-healing” only repairs the total.**  
   Crate 14 loses two; crate 16 gains two. Nobody pairs them. Net suspense is zero, so the room header disappears despite four unexplained heads across two observations. They could represent two deaths and two unrelated arrivals.

   Scenario 11 has the same defect: loss, subsequently recorded death, then corrective gain restores alive to nine. It does **not** establish which events describe the same animal. Automatically netting them can conceal a genuinely separate loss and arrival.

   **Change:** report unresolved losses and gains separately, alongside net drift. Keep them open until explicitly explained or corrected. Replace “self-healing” with “a later count restores the observed total.”

8. **The app knows a quantity, but the worker needs to know which piglet.**  
   Day 3: crate 16 receives one treated piglet from crate 12 and one untreated piglet from crate 14. Both receive the same foster spray mark. Tomorrow’s worker sees two marked arrivals and “one owes iron.” Treating either one satisfies the app’s count; choosing the wrong one duplicates treatment and leaves the other untreated.

   “Check the one unknown” has the same problem once that animal cannot be distinguished physically.

   **Change:** define what physical distinction supports each treatment claim. If that distinction is lost, downgrade the affected group to uncertain. Include catching, checking and maintaining distinguishable marks in the workflow comparison: “four taps” does not establish low operating cost.

9. **Applicability, temporary skips and coverage are different states.**  
   Crate 12 has six castrated males and six females. The equation says six remain owed unless females are recorded as excused. Once they are, the packet rule treats **every** unidentified departure as unknown because source excuses are nonzero—even though the resident population has no outstanding castration work.

   Meanwhile, crate 14’s three weak piglets skipped on day 3 become permanently non-owing under the proposed equation, although whether that skip means defer or exempt remains explicitly open.

   **Change:** separate treated, not applicable, deferred, exempted and unresolved. Support aggregate applicability without requiring individual sex records. Preserve skip reasons and their obligation effect when animals move; do not silently settle the owner’s open skip decision.

10. **“Treatment T” needs an occurrence, and a birth-date note is not a scheduling model.**  
    Assume the farm configures iron at days 3 and 15. A piglet covered for day-3 iron moves into a crate whose day-15 iron is due. A generic “iron covered” packet cannot determine whether the second obligation is satisfied. Existing [mark semantics include age-day](C:/Users/ying_/Documents/Codex/2026-09-08/clo/Sentri-UI-pilot/ux/tasks/piglet-processing/research/scenario-tree.md:118).

    Likewise, an empty nurse crate receives two day-2 and two day-5 piglets. Choosing the youngest clock postpones the older animals’ schedule; choosing the oldest advances the younger animals’ schedule. “Schedule on arrivals” leaves the actual decision unresolved.

    **Change:** identify treatment occurrences and retain the minimum origin-age/evidence groups needed to schedule them. That need not require a lot-selection question on every action, but B cannot claim exact obligations while discarding their prerequisites.

11. **Birth-litter identity does not establish the most recent source.**  
    Piglet 3041 was born in crate 12, fostered to 14 on day 1, and jumps into 16 on day 3. Its birth-litter notch still points to 12. Pairing crate 16’s gain with an unrelated loss in 12 would produce plausible arithmetic and false movement history.

    A litter-number notch alone also cannot distinguish two littermates. Supporting farm-specific notch schemes does not make every observed notch a unique match.

    **Change:** separate birth origin, individual identity and current custody. Pair exactly only when the configured identifier and custody evidence establish the match; otherwise present a candidate.

12. **The pairing restrictions confuse husbandry guidance with evidence validity.**  
    Two same-age litters exchange one piglet on September 25; the discrepancy is recognized September 29. A three-day matching cutoff rejects a real explanation. Conversely, losses and gains recorded five minutes apart can be unrelated.

    A piglet crossing from Room 3 into Room 4 is another valid explanation excluded by same-room pairing. That movement changes each room’s inventory without unexplained drift.

    **Change:** use time and room proximity to rank suggestions, not define truth. Preserve explicit cross-room transfers and older explanations. The supplied age-gap guidance concerns piglet ages, not how long reconciliation evidence remains valid.

13. **A simpler alternative has not been fairly tested.**  
    Model A is rejected partly because it inherits receiver treatment status, but that choice is independent of whether inventory uses a suspense account.

    For crate 14’s nine-count followed by finding the missing body, ordinary records can retain: the count observation, its −1 unexplained adjustment, the death, and an explicit link replacing the adjustment’s inventory effect. Known transfers can still post both legs atomically. Neither behavior requires declaring every count discrepancy a physical move.

    **Change:** compare B against an event ledger with atomic transfers, count observations, unexplained adjustments and explicit reconciliation links. Evaluate treatment evidence separately. A suspense projection may remain useful, but it does not remove the hard reconciliation or treatment-state problems above.

14. **What I did not probe:** external husbandry claims, clinical treatment defaults, live implementation, measured glove-use performance, or the held-out `eval-set.md`. This was a semantic review of the supplied model and repository contracts; no files were changed.
