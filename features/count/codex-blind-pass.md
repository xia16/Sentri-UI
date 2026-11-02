colleague: family=openai model=gpt-6-astra effort=high session=01a19ad6-ed78-7012-bb54-f06177ee51f5 status=ok via=mini · codex:adam cached-tokens=196736 roster-checked=2026-09-24

1. **What the old system does, and where it becomes complex**

This is an independent proposal, not an approved design. I assume **blind mode**: no separate leader position was supplied. The challenges below address the older proposals in the evidence. The settled owner rulings take precedence over them.

| Old behaviour | Useful part | Concrete complexity or failure |
|---|---|---|
| Two-step pen calibration: identify pigs, then balance total against batch allocations | Preserves named identities and batch membership | A worker counting 25 pigs must also solve allocation arithmetic before recording that observation. |
| Total cannot fall below named pigs | Prevents anonymous deletion of identities | Five names remain in the system, but only three pigs are visible. Entering “3” cannot tell the system which two names to remove. |
| Scan or manually find a pig recorded elsewhere | Supports correcting its location | A room scan identifies the pig, but does not establish which pen it occupies. |
| Transfer adds selected pigs to an occupied destination | Existing destination pigs need not be rescanned | No clear distinction between verifying three arrivals and recounting the entire destination. |
| Anonymous health records stay, move or copy | Acknowledges that identity is missing | Moving three pigs from “Coughing · 5” cannot move all five cases; copying creates ten recorded cases. |
| Missing parks an identity | **Sound: preserve the pig and its history.** | Recovery is promised without a designed return flow. |
| Piglet processing can change counts and request reasons | Allows a present count to replace an incorrect record | A higher count can be mistaken for additional births; a reason demands knowledge the worker may not have. |
| Calibration records old → new | **Sound: retain an attributable observation.** | A confirmation dialog repeats the same numbers, followed by a toast that adds no information. |
| Older redesign commits every stepper tap | Removes a final action | Changing 40 to 35 exposes five intermediate “counts”; an interruption at 38 can leave a number nobody actually counted. |

**Recommendation:** one global feature named **Count / 盘点**, with two explicit jobs: **Count all pigs here** and **Confirm pigs here**. The first records a complete count; the second reconciles selected identities without requiring a complete rescan.

2. **Scenario map**

“Knows” means what the worker can establish at the pen, not what the database would like them to know.

| Scenario | What the worker actually knows | Required behaviour |
|---|---|---|
| Anonymous pen, record and count both 14 | Fourteen pigs are present | Save a count observation even though the difference is zero. |
| Anonymous pen, record 14, count 12 or 16 | Present number; possibly no explanation | Set the current number. Record unexplained −2 or +2 at batch/task level. Ask no reason. |
| Empty pen, record 4 | No live pigs are present | Accept zero for anonymous pigs. Preserve their previous records. |
| Apparently empty pen with four named pigs | Nobody is visible; names remain recorded | Require explicit identification of the named pigs being reported missing or moved. Zero alone cannot choose identities. |
| Fully identified group, all present | Which identities are physically here | Confirm by scan or manual selection. A count alone cannot alter membership. |
| Five named pigs recorded, only three visible, identities readable | Which three are present | Confirm those three; explicitly report the other two missing or locate them elsewhere. Never infer missing from an incomplete scan. |
| Five named pigs recorded, three visible, identifiers unreadable | Only a physical total | Retain a count observation of three, but do not apply an identity deletion. State that two identities still need checking. This is a limitation, not a new pen status. |
| Three newly moved pigs enter a pen already holding 20 | The three arrivals and their destination | Reconcile those three only. Destination becomes 23 if the movement was unrecorded. Do not label all 23 as physically counted. |
| The transfer was already recorded | The arrivals are the same pigs already placed here | Confirm presence; add zero pigs. Repeated scans add zero. |
| Anonymous pigs moved, source and quantity known | “Three came from B2” | Use Transfer’s source → destination transaction. Count may verify either pen afterward. |
| Anonymous pigs found, source unknown | Present total only | Count here. Do not invent a source pen or infer a transfer from another pen’s shortage. |
| Pig found in a different crate | Its identity and actual crate | Show recorded and observed locations; confirmation moves that identity atomically. Check the destination’s existing adult occupant. |
| Room-wide scanning | Identities encountered; pen location only while standing at each pen | Choose the current pen before collecting scans. Save that pen before moving to the next. A room scan without pen assignment cannot correct pen placement. |
| Mixed named and anonymous pigs | Named identities plus a total, or anonymous remainder | Confirm necessary identity changes; derive anonymous count as total minus named occupants. |
| Farm uses individual notches, not ear tags | A uniquely identifiable pig, if the farm’s scheme supports it | Treat a unique notch as identity. A shared litter notch is not an individual identity. |
| Unknown scanned identifier | A physical identifier, but no matching record | Do not create a pig automatically. Offer manual lookup or the separate intake/identity flow. |
| Previously missing pig found | The parked identity is present | Restore that same identity into the observed pen; keep its batch and history. |
| Pig recorded dead, sold or off farm is scanned | An identifier conflicts with an exit record | Do not resurrect automatically. Show the conflicting record; correction is outside Count. |
| One anonymous batch in the pen | Which batch owns the population | Apply the count to that batch automatically. |
| Several anonymous batches, physically distinguishable | Count for each batch | Enter per-batch counts; total derives. No separate total-and-allocation balancing exercise. |
| Several anonymous batches, indistinguishable | Total only; no defensible batch split | Retain the total observation, but do not fabricate batch corrections. Applying it requires an owner decision described below. |
| Finished litter, fewer or more piglets | Live piglets now | Set live count through the shared Count feature. Born and recorded death causes remain unchanged. |
| Sow still farrowing | Current births belong to the active visit | Open the farrowing screen. No competing Count writer and no Edit record. |
| Sow died; piglets remain | Surviving piglets and their current location | Count the remaining task population. Allocation follows the existing sow-died flow; do not create an outside-task nurse sow. |
| Worker knows pigs were sold or transferred off farm | A specific exit occurred | Record the exit through its own feature. Count must not manufacture a sale. Those flows remain dependencies, not shipped capabilities. |
| Body found before counting | A death and the remaining live population | Record death, then count if needed. Reopen Count against the updated record. |
| Body found after a count already reduced the population | A body exists; whether its death was included in the count may be unknown | Do not blindly subtract again. Use the late-death rule proposed in point 3. |
| Count changes a group with condition counts | New population size, not which affected pigs disappeared | Preserve condition observations; do not automatically resolve or proportionally shrink conditions. |
| Partial anonymous transfer with known affected pigs | How many affected pigs are among those moving | Split each condition’s affected count by that number. |
| Partial anonymous transfer, affected pigs unknown | Quantity moved, but not condition membership | Preserve source evidence for both populations without asserting exact current affected counts. Never copy a numerical case count as fact. |
| Whole anonymous population moves | Every pig is moving | Move its population-linked condition information. Pen observations remain with the pen. |
| Anonymous pig receives an identity | Which physical pig was identified | Anonymous −1, identified +1; total unchanged. Attach only health information known to belong to that pig. |
| Back, app closes, or interrupted scan | Work entered so far | Keep a local draft; no count or placement changes until confirmation. |
| Double tap or upload retry | Same observation/action | Write once using one event identifier. |
| Two offline counts | Two observations at different times | Later observation stands; never sum their differences. Preserve both in history. |
| Another worker moves pigs during the draft | The observation and current record may refer to different moments | Preserve the observation time. Show the intervening movement before applying; require a fresh count if ordering cannot be established. |

These restrictions are deliberate. “Global” means a shared feature and consistent rules across places; it does not mean a room total can safely repair every pen.

3. **The model**

**What Count writes**

| Record | Fields |
|---|---|
| Count observation | Event ID; farm, unit and pen; population scope; batch/task references; observed time; author; device; recorded/synced time; observed number; record version used for comparison |
| Applied count | Previous effective number; observed number; unexplained difference; affected batch population; originating observation |
| Identity reconciliation | Pig identity; previous placement or missing state; observed destination; author/time; originating observation; explicit confirmed operation |
| Scan draft | Target pen; deduplicated identifiers; lookup results; selected reconciliations; collection times |
| Audit relationship | Which observation supersedes an earlier count; which movement or other event affects the projection |

A count is an **absolute observation**, not “subtract two.”

For anonymous populations, current stock derives from the latest applicable observation plus subsequent recorded movements, deaths and exits. An event known to have occurred before that observation is not applied again afterward merely because its upload arrived late.

For litters:

**Alive = Born − Dead − Moved out + Moved in ± Unexplained − Weaned.**

Counts change the unexplained term. They never move Born.

**What it never rewrites**

Birth totals, death causes, historical treatment administrations, previous count observations, original batch membership, recorded sales, or earlier movement events.

A new observation can supersede a current number without deleting the previous observation.

**Identity reconciliation**

- A pig has one active placement.
- Confirming “here” transfers that placement from the recorded pen to the observed pen in one transaction.
- Scanning is evidence collection. Merely opening the ordinary scan page does not move pigs.
- An unscanned pig remains unchanged.
- Missing requires an explicit choice about named pigs.
- Finding a missing pig restores the existing identity; it does not create another pig.
- Adding identity to one anonymous pig conserves total head count.
- Batch membership follows the animal or anonymous population; placement correction does not silently enrol it into a different task.

**The floor is sound, but its meaning must be explicit.** It protects the applied inventory from unnamed identity deletion. It must not prevent retaining the worker’s truthful observation that only three pigs were visible.

**Anonymous conditions**

Separate three things that the old system conflates:

| Information | Ownership and movement |
|---|---|
| Individual condition | Follows the identified pig |
| Condition observed on *k* anonymous pigs | Population-linked evidence with an observation time |
| Pen observation, such as scours on the floor | Remains with the pen |

The distinction is supported by the current [Conditions draft](/Users/agent/jobs/call-7f76c8b160/tree/features/conditions/PRD.md), which already separates pen observations from conditions on selected pigs.

For a known partial transfer, let source population be **N**, moved quantity **n**, affected quantity **k**, and affected pigs moving **m**:

- Source affected count becomes **k − m**.
- Destination receives **m** affected pigs.
- Require `max(0, k − (N − n)) ≤ m ≤ min(k, n)`.

Example: 14 pigs, five coughing, three moving. The worker identifies two coughing pigs among the three. Source becomes 11 pigs with three coughing; destination gains three pigs with two coughing.

If **m is unknown**, there is no honest exact split. Retain the original observation and show factual history such as **“Coughing recorded in B2 before move”**. Do not show “Coughing · 5” as a current count on both populations. A subsequent Condition observation establishes a new affected count.

A count reduction has the same uncertainty. Reducing a pen from 14 to two does not prove that the three previously coughing pigs recovered. Show the prior observation with its time; do not silently cap three to two.

Treatment administrations remain historical facts. Moving a population must not duplicate a dose, prove that an unidentified arrival received treatment, or infer individual treatment eligibility.

**Late deaths: a required neighbouring change**

Concrete failure: record 10 live pigs → Count observes nine → a body is found → ordinary Death subtracts one → system incorrectly displays eight.

Recommendation for anonymous deaths where overlap with a later count cannot be established: the death form also captures **“Live pigs now”** and commits the death record with that live observation atomically. Nine remains nine. Count itself asks no reason and no “one of the missing?” question.

This does **not** prove which earlier discrepancy the body explains. Preserve the evidence; do not automatically relabel an old unexplained loss. Any recomputed discrepancy accounting must distinguish known timing from an unexplained balancing adjustment. This is an owner decision affecting Death, not an implementation detail Count can hide.

**Batch/task checker**

Keep unexplained gains and losses separately visible; do not hide them behind a net number. A pen losing two and another gaining two is not proof of a transfer.

The checker can show **“2 fewer · 2 extra”**, with underlying observations. Pen rows show their current populations, without discrepancy badges.

**Neighbouring features**

- Transfer owns source, destination, moved quantity and condition partition.
- Death owns deaths and causes.
- Sale/off-farm transfer owns exit reason and date.
- Identity assignment owns anonymous-to-individual conversion.
- Farrowing owns live counting while farrowing.
- Weaning owns its stage transition and quantity.
- Count verifies present inventory; it does not complete any of those tasks merely because totals match.

4. **Options and recommendation**

| Option | Screens and rules | Main cost |
|---|---|---|
| **A. One editable pen total** | One form and history; identities resolved elsewhere | Shortest interface, but a worker counting three of five named pigs hits a floor with no useful path. Partial arrivals also need another feature. |
| **B. One Count feature with two visible jobs — recommended** | Entry choices; total form; identity confirmation page; shared lookup and pen picker; conditional batch/identity work | More rules than a total field, but each journey asks only what the worker knows. Three arrivals require three identities, not 23 scans. |
| **C. Full room stocktake** | Session setup; room progress; pen scans; exceptions; final reconciliation; recovery screens | Handles formal audits, but introduces a session lifecycle and invites false absence conclusions from incomplete scans. |

Recommend **B**, with these restrictions:

- One pen is the location target at a time.
- One anonymous batch per pen is the preferred operating rule.
- Multiple anonymous batches require physically defensible per-batch counts before application.
- No automatic disappearance from scanning.
- No new pig, batch membership, sale or death inferred from a count difference.

**Argument against the recommendation:** a relief worker facing five recorded sows and only three readable bodies may need both counting and identity reconciliation. “Two jobs” is still a decision they must understand. The mitigation is contextual entry: a simple anonymous pen opens the count form directly; the two choices appear only where both jobs are meaningful. If field observation shows workers cannot distinguish them, option A plus a clearly separate location-check flow may be easier.

5. **Recommended flow, with exact copy**

All descriptions target 360–390px phones. Use one flat form surface, no nested cards. Footer buttons are **56px**; other interactive targets meet the repository’s **48px** floor. Acted-on text is at least **13px**, ordinarily 16px. Counts use steppers; manual identifier entry uses the touch number pad. No hover or keyboard-dependent actions.

**Attention order:** target pen/population → observed number or identities → consequence of this action → optional history. Remove repeated totals, reason fields, green balance banners and automatic success messages.

**Entry**

Count lives on the **pen page**, not in the pig Actions page. A task’s existing count entry opens the same feature with its population already selected.

For a pen where both jobs apply:

> **Count**  
> Pen B4  
>   
> **Count all pigs here**  
> Record the number you can see.  
>   
> **Confirm pigs here**  
> Scan or choose pigs in this pen.

These are full-width navigation rows. No extra Continue button.

An anonymous single-batch pen opens the first form directly. A farrowing litter opens its farrowing screen.

**Count form — ordinary anonymous pen**

> **Count**  
> Pen D4  
>   
> **Pigs here now**  
> **− 12 +**  
>   
> Record: 14 pigs  
>   
> **Recent records ›**

Footer: **Back** · **Save count**

The stepper starts at the recorded number; Save deliberately confirms it, including an unchanged number. Intermediate taps are draft values.

For a finished litter the label is **“Live piglets here”**. The sow is excluded. For a mixed pen, the field is **“All pigs here”** and a subordinate line reads **“Includes 3 identified pigs.”**

No automatic “Found dead?” detour appears merely because the count is lower. Death is available from its established entry.

**Result**

Return to the same pen and scroll position:

> **D4 · 12 pigs**

The group row also becomes **“12 pigs”**. No toast, result dialog or new pen badge.

History:

> **Count · 14 → 12 pigs**  
> 2 Nov, 09:41 · G. Hansen

The event detail contains the scope, observation time and comparison. The task checker carries the unexplained difference.

**Several anonymous batches**

> **Count**  
> Pen D4  
>   
> **Batch 18**  
> − 8 +  
>   
> **Batch 20**  
> − 6 +  
>   
> **Total · 14 pigs**  
>   
> **Cannot tell the batches apart**

Footer: **Back** · **Save count**

There is no second editable total.

“Cannot tell the batches apart” opens a total-observation form with:

> **The total can be recorded. Batch numbers will stay unchanged.**

Its primary is **Record observation**. It saves evidence without claiming inventory was fully reconciled. This limitation is explicit and requires the owner decision in point 6.

**Confirm selected identities**

> **Confirm pigs here**  
> Pen B4  
>   
> **Hold the reader to an ear tag**  
>   
> **000418**  
> Recorded in B2  
>   
> **000419**  
> Recorded in B2  
>   
> **000420**  
> Recorded in B2  
>   
> **Enter identifier**

Reader control: **Stop scanning**, changing to **Resume scanning**.

Footer: **Back** · **Review 3 pigs**

Repeated reads highlight the existing row and do not increment the number. A removable selection is a labelled control with a full touch target.

**Identity review**

> **Confirm pigs here**  
> Pen B4  
>   
> **3 pigs will move from B2**  
> B2 · 10 → 7 pigs  
> B4 · 20 → 23 pigs  
>   
> **View pigs ›**

Footer: **Back** · **Confirm here**

No second confirmation dialog.

Result: the source and destination counts update. History:

> **Found here · 3 pigs from B2**  
> 2 Nov, 09:41 · G. Hansen

If already placed here, review instead says:

> **3 pigs are already recorded here.**

Confirmation writes a presence observation with zero stock change. It does not create a whole-pen count stamp.

**Missing identities**

From the count form:

> **3 pigs counted; 5 identities recorded**  
> **Check recorded pigs ›**

The identity list exposes named choices:

> **000418**  
> **Here** · **Elsewhere** · **Missing**

“Elsewhere” opens the shared pen picker. “Missing” enters the established missing operation, with:

> **The pig leaves this pen. Its identity and history are kept.**

The final review names the actual affected pigs. Unselected identities remain unchanged.

If the worker cannot identify the absent pigs:

> **Record the count of 3. Check the identities before changing the pen record.**

Primary: **Record observation**.

**Found missing pig**

Review shows:

> **000418**  
> Reported missing  
>   
> **Return this pig to B4**

The same **Confirm here** transaction restores it. History:

> **Found here · 000418**  
> Returned to B4 · 2 Nov, 09:41 · G. Hansen

**Room walk**

The unit page opens **Count pens**, a plain pen list. Selecting B4 opens the same Count feature.

After saving, return to that list. B4 displays its resulting population. Opening B5 explicitly changes the target; subsequent scans cannot silently remain assigned to B4.

There is no “Finish room” stock mutation. A partial walk leaves untouched pens untouched.

**Transfer condition handoff**

This belongs inside the future Transfer flow, not inside Count:

> **Coughing · 5 recorded**  
> **How many are moving?**  
> − 2 +  
>   
> **Cannot tell**

No default zero: zero would assert that all affected pigs stayed.

Choosing “Cannot tell” shows:

> **The earlier observation stays in both groups’ history. No current coughing count will be assigned.**

The transfer’s normal primary commits stock and condition consequences together.

**Interruption and conflict copy**

- Draft resumed: **“Count not saved”** beside the input, not an animal status.
- New movement arrived: **“2 pigs moved out at 09:43.”** Visible choices: **“I counted before the move”** / **“I counted after the move”**, only where the worker can establish this; otherwise recount.
- Earlier offline count uploads later: history retains it; the pen continues to show the later observation.
- Unknown identifier: **“No matching pig record”** with **“Check identifier”** and **“Open intake”** only when that separate feature exists.

6. **Questions only the owner can answer, with recommended answers**

These are decisions for the proposal, not requests to the leader.

| Decision | Recommended answer and concrete consequence |
|---|---|
| May physically indistinguishable anonymous batches share a pen? | **Restrict new mixing.** A worker counting 19 animals cannot honestly divide them between two batches. Existing mixed pens may retain total observations, but cannot apply guessed batch corrections. If unrestricted mixing is required, explicit allocation uncertainty is unavoidable. |
| May a truthful total observation be retained before named identities are reconciled? | **Yes.** Keep “three seen” without deleting two arbitrary identities. Do not present the stored inventory as reconciled. |
| Should partial anonymous movement require exact condition membership? | **No.** Permit movement with source condition evidence, without inventing current numerical case counts. A later observation establishes those counts. |
| How should anonymous Death handle a possible overlap with a prior count? | **Capture live pigs now in that exceptional death flow.** Commit it with the death to avoid a second subtraction. Do not ask whether it was “one of the missing,” and do not automatically explain an older loss. |
| What does “later offline count” mean across devices? | **Observation time, not upload order.** Use device time anchored to the last server synchronization; keep both timestamps. If ordering cannot be established, retain both observations and require a fresh count instead of silently choosing. |
| Does correcting a sow’s placement also move her litter? | **No automatic assumption.** Moving a sow from crate B2 to B4 does not establish where her piglets went. The location operation must explicitly cover the sow, litter or both while preserving batch/task membership. |
| Should unexplained gains cancel losses in the checker? | **Show both directions.** Two fewer in B2 and two extra in B4 are not a proven transfer. |
| Can Count ship before Transfer and exit flows? | **A limited Count can; the full requested workflow cannot.** Ship recount and identity reconciliation only with explicit boundaries. Do not present count adjustments as completed transfers, sales or off-farm exits. |

**Not probed:** live Figma frames beyond the supplied transcriptions; rendered phone screens; reader hardware; synchronization implementation; treatment eligibility rules; real farm frequency of mixed anonymous batches; or whether workers can distinguish affected pigs during partial transfers. I read repository workflow, component and neighbouring feature rules. I did not build, modify files, run UI tests, or treat draft features as approved.
