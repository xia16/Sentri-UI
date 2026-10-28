colleague: family=openai model=gpt-6-astra effort=medium session=01a1633c-46ea-7fe3-971d-b207ea0f3b43 status=ok via=mini · codex:adam cached-tokens=163072 roster-checked=2026-09-24

1. **The card’s job is to distinguish “recorded” from “will be recorded,” without moving the number.**

   **Sound:** one prominent Alive count, a draft committed by Save, and Details for the fuller record.

   I’m treating this as the narrower card critique requested, not reopening the recording flows. I assume the example starts at 12 saved Alive, and the draft contains three live births, one later death, and one stillbirth: projected Alive is 14.

   Two tests matter particularly:
   
   - A stillbirth-only draft leaves Alive at 12 but still needs saving.
   - One live birth and one later death also leave Alive at 12. An unchanged count must never imply an empty draft.

2. **“Was”: the old number looks superseded before it actually is.**

   A worker enters three births and one death, sees **14**, then leaves with Back. The crossed-out 12 implies that 12 is obsolete, although it remains the committed count. Another worker reopening the draft may treat 14 as established fact.

   Death-only entry makes this sharper: **11, was 12** looks like a completed reduction. Taking back that death restores 12, but a remaining stillbirth still needs Save. The number alone cannot communicate that.

   **Keep:** a stable position for the projected count. **Cut:** the crossed-out baseline and “was.” If the saved number is shown, label it “Saved,” because it is still authoritative until Save.

3. **Chips: they describe events better than they describe commitment.**

   **Sound:** “+3 born” and “−1 died” explain the arithmetic.

   But a worker can read the big 14 and the event chips as a receipt for completed work, overlooking “not saved yet.” The proposed use of green strengthens that impression.

   At 360 px, longer two-digit entries and “not saved yet” compete for space and wrap. Removing the only later death removes a chip and potentially changes the card’s height. That repeats the owner’s objection in another form: the card changes shape during counting.

   “1 born dead” is also categorically different: it is a recorded event, but not part of the Alive change. Mixing it into the same strip makes the worker interpret which chips affect the big number.

   **Cut:** event chips from this card. The existing Save summary already lists those events.

4. **Receipt: accurate ingredients, ambiguous arithmetic.**

   Starting at 12, the list “saved 12 · born +3 · died −1 · born dead 1” places a non-contributing 1 alongside contributing numbers. A tired worker can reasonably wonder why the answer is 14 rather than 15.

   With only a stillbirth, the receipt changes while Alive does not. With a death removed, one ledger row disappears. Beside a large two-digit count at 360 px, this also creates a cramped second reading task.

   **Keep:** explicit “Saved” terminology. **Cut:** a miniature ledger beside Alive. It belongs in Details or the existing draft summary.

5. **Equation: it makes the saved count visually primary while the worker needs the result.**

   For a death-only visit, **12 −1 = 11** presents two plausible answers to “How many alive?” The worker must scan to the right to find the projected count. After Save, 11 presumably returns to the original position. The result still moves—just at Save instead of at first entry.

   With two-digit changes, **12 +12 −10 = 14** demands substantially more width. Shrinking it, wrapping it, or shifting the result all undermine the stable transition the owner wants.

   Removing the only death changes the expression’s length. A stillbirth-only draft yields either **12 = 12**, which looks pointless, or plain **12**, which conceals the pending work unless another indicator carries it.

   A reopened draft is worse: “12” could mean the saved count when the draft began, not the latest saved count after another worker’s update.

   **Keep:** the equation as an explanation in Details if needed. **Cut:** arithmetic as the main Alive presentation.

6. **Better option A — keep the projected count anchored; label its status explicitly.**

   **Before entry:** “Alive” with the large **12**. A reserved status line says “Saved.” Details remains in its usual place.

   **During entry:** the large number becomes **14 in exactly the same position and size**. The status line says **“Draft · after Save.”** The event breakdown stays on the existing Save control; the card does not repeat it.

   **After Save:** 14 stays where it is. The status changes to “Saved on this phone.” Sync status must not imply the record is already available to another worker.

   **Animation:** no movement, rolling digits, scaling, or rearrangement. Replace the digits in place. Keep the number, status, and Details positions fixed.

   **Edge cases:**
   
   - Death only: 12 becomes 11; status becomes Draft.
   - Death taken back: 11 returns to 12; Draft remains if any other entry remains.
   - Stillbirth only or net-zero change: 12 stays 12, but the status becomes Draft and Save remains available.
   - Clear: restore the saved number and Saved status.
   - Reopened draft: immediately show Draft, with a short attribution such as “Started by Mei.” Its time and full contents are available in Details.

   **Weakness:** a worker who reads only the large number can still mistake a projection for a saved count. Explicit nearby status reduces this risk; it cannot eliminate it.

7. **Better option B — keep the saved count anchored; show the proposed result beneath it.**

   **Before entry:** “Alive · saved” with large **12**. Details stays fixed.

   **During entry:** the large saved 12 does not change. A reserved line beneath says **“After Save: 14 alive.”** The Save control lists the draft events.

   **After Save:** the large number changes to 14 in place. The preview line clears without collapsing its space.

   **Animation:** none. Both numeric positions stay fixed throughout; saving replaces the main value rather than moving the preview into it.

   **Edge cases:**
   
   - Death only: saved 12; “After Save: 11 alive.”
   - Death taken back: the preview updates to 12, remaining visible if other draft entries exist.
   - Stillbirth only: “After Save: 12 alive.” That repetition is useful—it confirms that the draft leaves Alive unchanged.
   - Reopened draft: saved count remains unmistakable; the preview is labelled as a draft and attributed to its starter.

   **Weakness:** during a long visit, the largest count deliberately lags behind the crate. A worker counting successive births must watch the smaller preview. This is safer about commitment but worse for the central counting task.

8. **Both options need one rule beyond presentation: never silently treat an old draft as current.**

   Concrete case: Mei starts from 12 and drafts three births. Before she saves, another worker saves two births. If Mei’s draft simply writes its displayed 15, two births disappear. If the app silently adds everything and shows 17, it may double-count births both workers witnessed.

   Preserve the draft’s author and starting record. When a newer saved record is discovered, require review of the overlap before completing Save. A card label cannot solve that uncertainty, especially offline.

   Likewise, tapping Back and reopening must not make another worker’s draft look like a newly started visit. Attribution should appear on the drawer, not require finding it inside the log.

9. **Recommendation: option A, with a fixed status line and no event breakdown on the card.**

   **Reason:** the count the worker checks against the crate stays in one place throughout entry and Save.

   Use **“Draft · after Save”**, rather than a crossed-out number, chips, a ledger, or an equation, to explain its status. Keep that status even when the draft does not change Alive. The owner’s two choices are whether the large number means **projected** or **saved**, and how an inherited or stale draft must be reviewed.

10. **What I did not probe**

   I did not test actual 360 px layouts, Chinese wording, glove use, status recognition, or offline reconciliation. I have not reopened the settled Save model, death flows, or Details structure.
