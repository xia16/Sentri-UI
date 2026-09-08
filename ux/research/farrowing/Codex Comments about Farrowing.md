# Codex Comments about Farrowing

Review date: 2026-09-04. Comments for discussion with Claude; these are proposals, not new rulings. Existing HTML and documentation have not been edited.

## Which version this reviews

This review uses `claude/farrowing-review-handover-2b2e0e` at `1dd92c8b693860c245de42e218e695fae9b4a6ed`, in `.claude/worktrees/farrowing-review-handover-2b2e0e`. Main is at `4adf5ec` and is 42 commits behind this branch. My initial inspection used main; findings that the current branch already resolves have been discarded.

The supplied `02-before-the-first-count-nothing-recorded-.png` belongs to Claude's worktree and is also a slightly earlier iteration than its latest HTML. The latest commit moves the how-to to the room title and pares the first-count sheet down to “no records yet.” The screenshot difference primarily came from reviewing different versions. There is also some genuine consolidation debt within the current handoff, listed separately below.

I read the farrowing research corpus, decisions, interaction map and developer contract, and related shared UI foundations, operational model and production task briefs. I inspected the current HTML in the browser, including its room, counting, death, Finish and correction states. These are static design proofs: observations below are not claims of tested application behavior or field usability.

## Overall judgment

The current design is substantially more focused than main. Its strongest choice is to change the information hierarchy with the worker's immediate job: a due status before farrowing, live counts while counting, and a compact finished record afterward. I would preserve that structure.

The biggest remaining opportunities are to give the room's actionable rows more space, make saved counts and retained drafts unmistakable, and prove that the long forms work inside a real phone viewport. I would not start by adding more indicators or reducing text and button sizes.

### Information that earns its space

| Surface | Keep prominent | Keep secondary or conditional | Put behind the existing detail/history door |
| --- | --- | --- | --- |
| Awaiting sow | Identity/location and relative due status | Parity and last litter; replace this context with the latest disposition when applicable | Full reproductive and treatment history |
| Active sow row | Alive/dead and Active state | Latest record age and actor | Born, individual events, prior litter performance |
| Counting sheet | Alive counter, saving receipt, Record dead, Edit, Close/Finish | Started/saved identity and timing; compact Born/dead history line | Historical breakdown beyond what supports the current count |
| Finished sheet | Finished state and current Born/Alive/Dead | Compact causes and the existing actions | Classification, weight, assisted farrowing, detailed change history |
| Death/Edit form | The thing being changed, draft status, Save | Clear only when a draft exists; photos only in their optional field | Previously saved evidence through History |

Much of this is already implemented. In particular, the disposition replacing generic context on an overdue row is a good pattern: use the same space for information that explains the next decision.

## Recommended changes, in order

### 1. Make a retained draft visible from the counting sheet

**Observation:** Live-count taps save immediately, but the death drawer and Edit stage changes until Save. Back retains those drafts locally. The room now teaches “Every tap saves.” A worker can therefore leave a drawer with something safely retained on the device but not yet part of the litter's committed record.

The latest ruling already specifies `Record dead +N` on the host while a draft waits, and explicitly says this state is undrawn. This is a valuable missing state, not a reason to reverse the staged model. Within the drawer, a green cumulative number also does not say how much is new: a displayed 3 can mean two recorded previously plus one draft addition.

**Suggestion:** Draw the full interrupted path: add one death → Back → host shows the pending work → reopen → Save → host badge clears and committed totals update. Use the existing tool itself, for example `Record dead · 1 draft`, rather than another banner. Give Edit an equivalent conditional indication if its draft can remain after returning to the host. Inside the drawer, a compact `1 new · draft` summary would distinguish the increment from the cumulative total without relying on color alone. Exact wording should be compared against the currently ruled `+N` treatment.

Scope the how-to to “Alive taps save” if retained drafts remain a common neighboring interaction. Also define what happens when Finish is entered with an outstanding death/Edit draft. That is an unresolved interaction to walk through, not a recommendation to silently save it, discard it, or introduce a hard gate.

**Check:** After Back, can a worker answer both “Is my work retained?” and “Has the litter total changed?” without reopening every tool?

Sources: `RULINGS.md` staged drawer ruling, especially lines 195–202; `farrowing-contract.html` C5.3, line 149; `farrowing.html` room how-to and During tools, lines 586 and 708 onward.

### 2. Reconsider the room's two-cell context block

**Observation:** At the mock's 390px width, the first sow row begins approximately 379px below the phone's top. The context block alone is about 90px high. It presents `10 live / litter · target 12` beside `1 farrowing · 10 awaiting`, above lenses that already carry task counts.

The performance number may matter to a supervisor, but it does not identify which sow needs attention or what to do on this pass. It receives more space and numerical emphasis than some of the actual work below it.

**Suggestion:** Compare the current version with a compact `Unit 7 · Task overview ›` entry, keeping status counts in the lenses and the performance comparison inside the overview. This would recover much of the block's height while keeping overview access. Preserve pen order, sow identity and clear lens selection; a new urgency-sorted dashboard is unnecessary.

This is a proposed revision to an accepted shared chassis rule. It should be evaluated across unit work screens, not treated as a farrowing-only inconsistency to patch. The tradeoff is less ambient performance visibility in exchange for more immediate work visibility.

**Check:** At the same phone height, compare how many sow rows are visible and how quickly a worker can find a due sow, an active sow and the overview. Do not achieve the gain by shrinking touch targets.

Sources: `farrowing.html` lines 586–588; shared `components.html` context block and room chassis decisions.

### 3. Let the hero own the total; let the receipt explain the change

**Observation:** The large Alive value is 9 and the receipt reads `9 saved · +4 new`. The 4 is already included in the 9. A reader could nevertheless interpret the line as 9 saved plus four still to add or save. The existing blind-review notes already record confusion around “new”; adding “saved” helps but still leaves two neighboring quantities to reconcile.

**Suggestion:** Compare `Saved · 4 added this visit` beneath the hero 9. For the downward state, compare `Saved · 2 died this visit` beneath the current Alive total. This gives the large numeral sole ownership of the total and the small line sole ownership of the visit change. Use a neutral saved receipt when there is no change to describe. Avoid adding another timestamp here; the header already carries recency and actor.

This deliberately revisits the latest receipt wording. It is a readability hypothesis, not evidence that workers have misread this exact final version.

**Check:** Show the screen briefly and ask “How many are alive now?” and “Is anything still waiting to be saved?” Test it alongside the retained death-draft state in comment 1.

Sources: `farrowing.html` line 705; `RULINGS.md` receipt and blind-review notes around lines 126–155 and 287.

### 4. Prove the long forms at a bounded phone height

**Observation:** Several frames are extended to show their contents. The post-lock Edit sheet measures roughly 832px high; the More born variant roughly 996px, inside a 1075px phone illustration. The piglet death sheet is about 729px before allowing for the rest of the device viewport. These demonstrate content but do not yet demonstrate comfortable reach, scrolling and save access on a shorter phone.

**Suggestion:** Show the same forms at 390×844 and 360×740 with a stable identity/header, a scrolling content region and reachable Back/Save controls. For Edit, compare collapsing secondary at-birth fields within the same screen, leaving the counts being corrected directly accessible. Keep the single Edit surface and its atomic save behavior; do not reintroduce the retired correction picker.

Keep the established 44px controls and 60px death rows. Remove repetition or progressively disclose secondary fields before reducing those dimensions. The expanded Other field and photos should be included in the height proof, with the keyboard shown where relevant.

**Check:** Can the worker reach the last cause, inspect the change summary and save without losing sow identity? Can content scroll without dismissing a nonempty draft? These are verification questions, not claims that the current static mock clips in production.

Sources: `farrowing.html` death and post-lock Edit variants, especially the More born frame at line 3283; `farrowing-contract.html` C5.3. The existing target-size direction is also consistent with [W3C's enhanced target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html); that 44px criterion is AAA, not the AA minimum.

### 5. Specify the day between Due today and Overdue

**Observation:** Due is service +114 days and Overdue begins on day 116. The contract groups days 114–115 as “due,” but the illustrated labels do not say what day 115 displays. `Due today` would no longer be truthful if reused on that day.

**Suggestion:** Add a neutral `Due yesterday` case for day 115, retaining the agreed overdue threshold and red treatment from day 116. This fills the vocabulary gap without adding another chip, alert or rule. Do not continue overdue signals into Active; that behavior was explicitly settled.

**Check:** Walk one Awaiting row through days 113, 114, 115 and 116, including a disposition, and confirm the relative copy and color at each step.

Sources: `RULINGS.md` lines 63–65; `farrowing-contract.html` C2, line 89. This is a specification gap, not an observed runtime bug.

### 6. Make the count's appearance match its actual interaction

**Observation:** Type-to-set has explicitly been retired. The center Alive numeral still sits in a bordered field that resembles an editable input. Conversely, sow identity is an actionable route whose visual cue is quiet.

**Suggestion:** Try a plain or visually integrated center numeral between the existing stepper keys, so the keys clearly own input. If the sow header remains a navigation target, use the existing small chevron vocabulary within that identity area. This should clarify existing interactions without adding a button row.

There is also a speed tradeoff worth measuring: recording 12 live piglets from zero requires 12 plus taps. Do not restore a keypad on assumption; compare a real continuous-count pass and a batch-entry pass before revisiting the owner's stepper-only decision.

**Check:** Ask an unfamiliar worker where they would tap to add a piglet, correct the count and open the sow. Note attempts to type into the center numeral.

Sources: `RULINGS.md` type-to-set retirement around lines 160–162; `farrowing.html` Alive hero at line 703; contract C5.8 identity behavior.

## Consolidation debt to resolve before implementation

These findings concern conflicting instructions, not a request to redesign the current screens. I have left the source files unchanged.

| Location | Conflict | Why it matters |
| --- | --- | --- |
| `farrowing-contract.html` C1, line 74 | Post-lock Alive is written as locked Born minus deaths **since lock**, although Born includes piglets that died before lock. | Born 14 with five deaths at lock means nine alive. One later death means eight alive; the written formula gives 13. Use total applicable deaths, or start from Alive at lock. Keep parked foster terms consistent. This is a documented formula error, not a tested application defect. |
| Contract C4, line 117, versus C5.8, line 191 | C4 makes the Born/dead fact line a ≥44px History target; C5.8 calls it untappable. | A developer can implement the wrong history entrance while following the contract. The newer whole-line History decision should be reflected consistently. |
| Contract C2, line 92, versus C8, line 227 | The latest rule keeps a sow-death record in Done; the consumer table still says it departs every lens and opens a Foster prompt. | The room could lose visibility of surviving piglets, and a parked workflow could reappear. |
| Contract closing “Never build” note, line 250 | It prohibits Save and submit controls broadly, despite explicitly staged death/Edit forms with Save elsewhere. | Scope the prohibition to immediate count recording. The current unqualified text contradicts the selected interaction model. |
| Earlier handover/spec passages and historical rulings versus later dated decisions | Per-tap death recording, older exit vocabulary and fold-on-Edit-entry survive alongside staged Save, Close/Finish and fold-on-Edit-Save. | A fresh implementer must currently reconstruct chronology. A short current-state entry point with explicitly superseded passages would reduce divergent implementations. |

The last item is especially relevant to the screenshot question: newer designs are present in the worktree HTML, but “read all the docs” does not yield a single unambiguous implementation contract yet.

## Lower-priority follow-through

The later 09c–09f surfaces are earlier-stage proposals; I would not hold up the core farrowing review for them. Two useful cleanup candidates are the tagging conveyor's previous weight shown inside the new-entry field (`1.51`, line 3410), which can look already entered, and the count drawer's explanatory implementation prose. Put previous weight in the existing last-record receipt, leave the current entry visibly empty, and phrase discrepancy choices as worker actions rather than descriptions of event handling. Keep fostering parked.

For correction marks and draft numbers, ensure color has accompanying meaning in text or structure. Avoid adding a label beside every number; one scoped draft summary or an amendment indication in the existing record/history area is enough to explore. [W3C's use-of-color guidance](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) supports not making color the only carrier of the distinction.

## Suggested next review with Claude

First reconcile the concrete contract contradictions. Then draw the interrupted draft path and the long forms at fixed phone heights. Compare one compact-header variant and one receipt-copy variant against the current design, using the same sow data. Preserve the settled state model, pen order, no extra staleness alerts, compact finished face, and parked fostering. The decision criterion is whether the worker can find the next action, understand the current count and finish it with less interpretation—not whether the screen can display more information.
