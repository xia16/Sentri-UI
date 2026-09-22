# Farrowing — second research round

11 September 2026. Scope: the farrowing room, counting, death/correction side paths, Finish, locked face and record page. Research only; no concept or reference HTML edits.

**Later owner constraint:** study only well-designed apps with substantial adoption. Apply the [reference criteria and qualified shortlist](ASTRA-REFERENCE-CRITERIA.md) before using any app below as a design benchmark. Specialist/unqualified references are retained as research history only.

## What this round changes

The first round concentrated too much on tidy summaries. The harder design problem is helping a worker distinguish **the count now, what changed this visit, an unsaved draft, and the facts fixed at Finish**. Improving that distinction should lead the next concept, with visual simplification serving it.

Three revisions to [round one](ASTRA-RESEARCH.md):

1. **Keep useful grouping.** Do not remove containers indiscriminately. A live counting area, a staged editing form and a read-only summary benefit from different visual treatment. Remove duplicate borders within those groups.
2. **Do not default to a two-column grid for At finish.** Four facts include counts, weight and a yes/no observation; they are not four comparable KPIs. Start with compact labeled rows and compare against one unboxed grid at actual phone size. Neither should become four separate cards.
3. **Do not make every sheet short.** A taller sheet with a stable identity header and reachable actions is preferable to compressed targets or clipped fields. Keep the room relationship visible where space permits; full-height expansion under large text is different from replacing the workflow with a standalone page.

## Research method and coverage

Ran nine new Mobbin searches: three for flows and six for screens. Examined 19 inline previews across six returned flows and 18 screen images, including one screen already seen in round one. The queries, result IDs and canonical links are preserved in [the search record](ASTRA-MOBBIN-ROUND-2.json). Flow previews omit intermediate screens; this review does not infer behavior from those missing steps.

Also revisited the local [simulated-user audit](user-flow-audit.md) and [earlier Codex review](Codex%20Comments%20about%20Farrowing.md). Their interruption, wrong-sow and floor concerns explain why several current controls exist. Their historical proposed remedies are not current requirements; [RULINGS.md](RULINGS.md) and the latest owner-selected reference remain the product basis.

Operational product documentation is collected separately in [ASTRA-OPERATIONAL-SOURCES.md](ASTRA-OPERATIONAL-SOURCES.md). That evidence supplements Mobbin where pictures cannot establish retention or correction behavior.

In particular, [ODK documents draft/finalized distinctions](https://docs.getodk.org/collect-forms/) and [old/new-value audit information](https://docs.getodk.org/form-audit-log/). These support keeping state words and change provenance visible. They do not justify importing ODK's submission workflow. The linked operational note also examines a dated first-party SafetyCulture completion flow and carefully separates documented behavior from visual judgments.

## Closer references and what they actually show

### 1. Repeated counting: stable control positions, not progress decoration

[Garmin Connect's hydration screen](https://mobbin.com/screens/c6ba672b-b16b-441b-aa65-48c750299e19) places minus and plus around a dominant count, with an update timestamp above. It is a much closer visual analogy for Alive than a shopping quantity wheel. The screenshot also repeats the quantity, adds a goal and offers bulk increments. Those additions are unsuitable for the settled farrowing interaction.

**Recommendation:** keep one unboxed Alive numeral, fixed minus/value/plus positions and the receipt immediately beneath. Tool buttons should have enough reserved height for their existing unsaved subline, so opening a draft does not move the counting controls. Reserve color for actual state and changes. Do not introduce a target litter size, completion ring, quick-add amounts or long-press acceleration.

[Bevel's hydration sheet](https://mobbin.com/screens/72c2c383-93ef-494b-9053-bf6bc217e8f0) is a useful counterexample: its amount and controls lead to `Add to journal`. That is an entry awaiting submission, whereas Alive records per tap. Copying its submit button would communicate the wrong persistence model.

### 2. Long forms can remain sheets

The [AllTrails editing flow](https://mobbin.com/flows/ae89a84b-b381-4c36-b6bb-cdf24b1e4ee1) includes an [upper form view](https://mobbin.com/screens/4fb38295-67da-4794-bfca-2fee3026141c) and a [scrolled form view](https://mobbin.com/screens/6d3bc537-fef1-4a8f-af6a-9dd668936a3a). The form remains on a sheet, its header becomes compact, and Save is visible in both views.

**Recommendation:** build Finish and Edit around a bounded scrolling body, clear sow identity and a stable footer. Let optional facts and photos remain reachable without stretching the phone illustration. Do not copy the example's tiny photo-delete badges, activity-delete action or its editing semantics.

**Consequence for the concept:** replace the current full-page header plus repeated identity with one sheet identity construction. The content may become tall; the navigation model should remain the same.

### 3. Draft visibility is valuable; exit dialogs are not automatically valuable

[Reddit](https://mobbin.com/screens/546daefb-c788-4fad-9d35-4a9615ff8218) and [Gojek](https://mobbin.com/screens/302f5179-3aca-4211-8218-d89f081ce3eb) show explicit choices to retain a draft. [GoPro Quik](https://mobbin.com/screens/beed654c-76cd-4e1d-b533-038a3c4667d3) warns of unsaved changes with two exit choices. These establish visible vocabulary and consequences, not evidence that Sentri needs another dialog.

**Recommendation:** use the existing `1 unsaved` on Record dead, `unsaved` on Edit, and the drawer's draft count. Keep the contrast between the Alive receipt (`Saved · +4 this visit`) and a staged draft understandable through words and placement, not green alone. Put the existing unresolved-draft pointer next to Lock, the action it affects. Retain Back/Clear/Save exactly as ruled.

**Reject:** generic “save before leaving?” prompts, changing Back to Discard, silently posting drafts at Finish, or an autosave banner that makes every form look committed. The local retention rule already protects interruption; a dialog would add work without solving that problem.

### 4. Corrections need a readable delta, not a wall of unchanged facts

[MacroFactor's edit review](https://mobbin.com/screens/4e13dfe2-c783-4569-be53-efecd1c9f433) explicitly distinguishes changed information and `No Change`. It gives review a different presentation from entry. However, the visible review is lengthy and the multiple weight relationships require interpretation.

**Recommendation:** retain Sentri's more direct `crushed 3 → 2` summary. Give the changed number and summary enough space and contrast; retain all necessary correction deltas when they wrap. Keep unchanged rows ordinary. The correction banner appears only after the first change. Do not add a separate confirmation page or replace actual deltas with a vague “3 changes” count.

[GitHub's diff screen](https://mobbin.com/screens/c06533bc-cfd8-40da-b005-c0d4633a4eba) demonstrates explicit additions/removals but is not a suitable visual style for this task: a colored line-by-line diff would reproduce the dense-log problem the user rejected.

### 5. Finishing should transform the read hierarchy, not add a celebration screen

The [Runna strength-workout flow](https://mobbin.com/flows/d88683b7-90c0-4cf1-8a45-296099e59a3b) previews show active work, a save review and a completed-session record. This is evidence of different presentations for different stages; the previews do not establish all transitions or commit timings. The active screens are too visually busy to copy.

**Recommendation:** During emphasizes the action/count; Finish emphasizes the few observations still being recorded; After emphasizes the current litter and completion provenance. Reuse the Born/Alive/Dead summary between Finish and After so the visual transition is recognizable. Give the post-lock value the caption **Alive now**, while At finish and Finished remain separately labeled. This is a wording/presentation proposal, not a new stored value.

For the sample litter, the locked Born total can remain 14 while the later record shows 8 alive and 6 dead. A large `Finished` banner would not explain that distinction. The finished date and author belong beside their label, not repeated on every current total.

### 6. Explain the specific blocked action in place

[Wise's unavailable referral form](https://mobbin.com/screens/e059597c-6870-45a0-9aae-02ebc7d5a1e5) pairs an unavailable action with a stated reason. It is a terminal eligibility case, unlike Sentri's recoverable unsaved-death draft.

**Recommendation:** keep the ruled `1 death unsaved · Record dead` pointer above Lock and make that existing route clearly targetable. Keep classification and optional fields usable. At the Alive floor, retain the distinct pointers for found dead versus wrong count. Do not dim the entire sheet or add a new modal explanation.

The research supports making the cause understandable; the exact floor and lock gates come from the local product rules, not from Wise.

## Proposed structure for the next visual comparison

| Area | Starting direction | Alternative to compare | Decide by |
| --- | --- | --- | --- |
| During counter | Plain hero, stable keys, tightly associated receipt; tools immediately below | Same content with slightly more separation before the tools | Find current Alive and unsaved work without reading the entire sheet; no target movement between states |
| Finish form | One summary well; classification rows separated by fine rules; a lightly tinted optional section | One shared form group with section spacing, avoiding another outside border | Find Weak, weight and Lock quickly; keep related fields recognizable at large text |
| At finish readout | Compact aligned label/value rows under one heading | One unboxed two-column group | Read all four facts at narrow widths without ambiguity or extra cards |
| Death causes in summary | Wrapping inline text when it fits naturally | Two aligned columns when the full cause list becomes long | Preserve every cause/count and avoid truncation; never change ordering between screens |
| Correction summary | Existing literal before → after descriptions, readable and allowed to wrap | Same summary given a quiet background only after changes exist | Distinguish corrections from new recordings; inspect all changes before Save |
| Record page | Sans event text, date grouping, compact time/author metadata | More whitespace between visits, fewer individual row rules | Find who changed a number and when without confusing a correction with a newly recorded death |

These are bounded presentation alternatives within the same interaction model. Comparing them does not require building several different applications.

## The states that should drive the next prototype

Round one listed flows; this round makes the visual checks more specific. Build the ordinary screen together with its difficult adjacent state, not as isolated attractive screenshots.

| Pair to compare | The viewer must be able to answer |
| --- | --- |
| Before first record / count active | Where do I count, and can a stillborn be the first record? |
| Alive 9, +4 this visit / same sheet with 1 death unsaved | How many are alive now, and is any work still waiting to be posted? |
| Normal minus / minus at its floor | Do I have a counted body or a wrong earlier count, and which existing door addresses it? |
| Death draft / return to host / reopened draft | Is the draft retained, and has it changed the posted record yet? |
| Edit untouched / Edit with one change | Am I recording a new fact or correcting an earlier one? What exactly changed? |
| Finish normal / Finish with a retained draft | Why is Lock unavailable, and can I still fill the finish observations? |
| Finish / locked face after a later death | Which totals describe now, and which information belongs to the finishing event? |
| Locked face / record page / return | Where is the overview, where is the evidence, and how do I return to the same litter? |

For each pair: use identical sow/pen identity and consistent fixture data; verify the first and last field at 360×740 and 390×844; then test narrow content, text enlargement, focus and the existing hold gestures. Keep large touch areas. Field testing is still needed before claiming suitability for wet gloves or faster work.

## Negative findings and remaining uncertainty

- The baby-feeding query returned [Noom food logging](https://mobbin.com/flows/9cd04ac8-c463-4b29-bea7-9bb657d0a67f) and [Oura dose logging](https://mobbin.com/flows/fabfcfd5-f3cb-4e4d-8b5f-0bda061eb37a). These are not evidence of baby-tracker or farrowing behavior. Their submit flow and toast/schedule treatment are not adopted.
- [Centr's logbook flow](https://mobbin.com/flows/91d9a275-24f7-4dea-b152-c96d31c7cedd) shows repeat entries and row-level edit icons; retain the useful separation of entry and record, but do not scatter Edit entrances through Sentri history.
- Work-list results were poor matches: [Airtasker](https://mobbin.com/screens/6fd405f8-7297-4f85-8886-006105dd30ec) is a card-heavy job list, [Urban Company](https://mobbin.com/screens/0bac8206-3f12-45f6-93ba-68fd65d78009) is a scope list, and [monday.com](https://mobbin.com/screens/42a1ca62-e034-4e60-839f-11948dcc8588) is a table. No evidence in this round justifies redesigning room grouping, adding status badges or changing pen order.
- Other summary results repeated round-one patterns or returned irrelevant sections. They are logged for traceability, not counted as corroborating evidence.
- The earlier local audit used simulated users. Neither that audit nor this screenshot review measures real worker success. The remaining choices about density, row grouping and glanceability should be decided with the paired screens above.

## Priority

First restore the current workflow in the separate concept and draw the interrupted-draft and long-sheet states. Then compare the Finish/After information groups. Refine color, borders and spacing against those states. This research does not authorize edits to the reference file or expansion into other farm workflows.
