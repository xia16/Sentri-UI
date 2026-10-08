# Grilling — second-model blind design tree (openai gpt-6-astra, high), 2026-09-29


1. **Assumptions and sound foundations.** I treated this as blind work: no separate leader position was supplied. The questions below are a proposed owner interview, not questions back to the leader. China is the stated market; external practice establishes scenarios, not product requirements. PRD §3–§5 remain proposals.

   The owner/design-driver split is sound. So are the fixed constraints: no foster flows, one death drawer, one Edit door, entry-time stamps, and per-piglet identity entry. These do not need another approval round.

2. **Correct the evidence before interviewing.** “The farrowing dependency has nothing to wait on” is wrong. The repository distinguishes sow Finish from batch closure, and the newer [task-closure contract](C:/Users/ying_/Documents/Codex/2026-09-08/clo/Sentri-UI-pilot/ux/research/farrowing/ASTRA-TASK-CLOSURE.md:3) expressly supersedes the older lifecycle proposal for this prototype.

   Concrete scenario: a batch containing finished sows and one awaiting sow can close after warning; an actively farrowing sow blocks closure. “Warn and offer doors, never hard-block” was a recommendation pending confirmation in [SYNTHESIS.md](C:/Users/ying_/Documents/Codex/2026-09-08/clo/Sentri-UI-pilot/ux/research/farrowing/SYNTHESIS.md:163), not a settled owner answer. Processing’s dependency remains a real product decision.

3. **The design tree has nine independent roots.** Their dependent decisions form the later frontier:

   | First-frontier root | Decisions downstream |
   |---|---|
   | Q1 · Treatment record’s scope | Required payload, configuration snapshots, deviations, supported farm policies |
   | Q2 · Population being cared for | Fostered/mixed populations, orphan litters, population changes, record ownership |
   | Q3 · Meaning of treatment completion | Partial work, eligibility, exceptions, residuals, progress and KPI |
   | Q4 · Meaning of identity | Identifier scope, duplicates, correction, retirement, sex and weight attribution |
   | Q5 · Scheduled occurrence | Age calculation, repeated treatments, early work, schedule changes |
   | Q6 · Census and inventory | Unexplained adjustments, later explanations, identity allocations, shared drawer changes |
   | Q7 · Task lifecycle | Admission, ending, mandatory flag, expiry, weaning, post-close writes |
   | Q8 · Verbs and authority | Attestation, correction permissions, wrong-litter records, irreversible actions |
   | Q9 · Concurrent work | Claims, offline guarantees, duplicate versus distinct events, conflict resolution |

   Cross-branch dependencies matter: KPI needs Q3 + Q5 + Q7; anonymous partial-treatment reconciliation needs Q2 + Q3 + Q6; named deaths need Q4 + Q6; offline census reconciliation needs Q6 + Q9.

4. ❓ **Q1 — What responsibility does the treatment record carry?**

   Is v1 **a completion record linked to a separate medication archive**, **a record enriched from console-configured product/dose details**, or **an actual-use record supporting worker-entered deviations**? Does v1 support only the stated China deployment, or also farms with additional certification requirements?

   Concrete scenario: the console specifies one iron product, but the worker uses a replacement. A completion tick with the configured product attached would record something that did not happen.

   ➡️ **Recommend console snapshots plus explicit actual-use deviations for medicinal items**, with the supported farm-policy scope named; configuration alone cannot attest to a substitution.

   **Later frontier:** Once scope is settled, determine required fields by treatment, what is inherited versus observed, what happens when configuration is missing, and whether a deviation changes the scheduled obligation. Product, dose, source and lot are separate decisions—the supplied evidence does not establish that every field is universally mandatory. Snapshot/version behavior also depends on Q5.

---

5. ❓ **Q2 — Which population does a processing record describe?**

   The evidence alternates between **birth litter**, **piglets currently under a sow’s care**, and **pen occupants**. Which is the durable subject of the record?

   Concrete scenario: a sow has ten of her own piglets and two physically fostered-in piglets. “Iron done for this litter” could mean ten birth-litter members or twelve current occupants. Moving the sow to another pen must not transfer the record to whoever occupies her old pen.

   ➡️ **Recommend a stable care-group subject, distinct from location and birth-litter identity**; treatments must describe the animals cared for when recorded.

   **Later frontier:** Decide how v1 handles physically fostered animals while foster recording remains parked: an unexplained population change with unknown origin/history, or an explicitly unsupported case. Do not infer treatment coverage from the receiver’s old marks. Decide mixed-pen allocation, orphan continuity, population changes during unfinished farrowing, and the disposition of a group with zero remaining animals. A supported mixed group needs a rule for unknown ages and origins; a warning alone does not supply one.

---

6. ❓ **Q3 — What does “treated” assert?**

   Choose between production’s **whole-litter boolean**, the research’s **treated count**, or **coverage of identifiable animals/subgroups**. What can a worker honestly attest when only part of an anonymous litter was treated?

   Concrete scenario: seven of twelve receive iron. Another hand later records five. The total twelve does not prove full coverage: three of those five could already belong to the first seven.

   ➡️ **Recommend counted treatment events with an explicit eligible population, while limiting claims of complete coverage to distinguishable groups**; arithmetic alone cannot identify untreated animals.

   **Later frontier:** Decide the male denominator before identity entry; unknown sex; deferred versus permanently excluded animals; zero eligible animals; and whether exclusions require recorded facts. Then decide how residual work changes after deaths or population adjustments. If two anonymous animals die, the system cannot know whether they were among the untreated five.

   Define identity-work completion for keepers-only farms: recording nine intended keepers out of twenty must not automatically mean eleven overdue identities. Finally settle progress units and KPI treatment of partial work, exclusions and zero eligibility, jointly with Q5 and Q7.

---

7. ❓ **Q4 — What makes an identity row the same animal over time?**

   Is the recorded identifier **farm-wide**, **birth-litter scoped**, or **typed by identification scheme**? Is the physical tag/notch the animal’s identity, or an attribute of a persistent animal record?

   Concrete scenario: two litters both contain notch “3”; a lost tag is replaced; an accidentally duplicated tag is scanned. A single untyped identifier cannot resolve all three reliably.

   ➡️ **Recommend a persistent animal record with typed, scoped identifiers and retained identifier history**; replacement and ambiguity must not create or silently select another animal.

   **Later frontier:** Set minimum valid fields, including whether sex may remain unknown. Determine duplicate resolution without overturning the established warning-only policy, correction of phantom rows, and tag reuse after death or replacement. Identity-row creation must be distinguished from adding inventory: the twenty-first row against twenty live piglets needs reconciliation, not an automatic birth.

   Jointly with Q3/Q6, decide how newly identified animals consume anonymous sex counts and how named deaths affect the roster. Decide whether later weights append measurements or correct an earlier measurement; preserve whole-litter weighing as a separate observation rather than replacing it with a sum of subset weights.

---

8. ❓ **Q5 — What is one scheduled occurrence?**

   Is an obligation identified by **treatment and age-day**, or by a **stable scheduled occurrence whose planned date may change**? Does editing console configuration affect existing litters, only future litters, or existing litters through an explicit revision?

   Concrete scenario: first iron is scheduled on day 3 and second iron on day 14. The farm moves the first occurrence to day 4 after it was recorded. Matching only on treatment/day can create a second outstanding obligation or detach the original record.

   ➡️ **Recommend stable occurrence identities and versioned schedules, with explicit revisions for active litters**; repeated doses and configuration changes must not rewrite history.

   **Later frontier:** Define day zero/day one and the date anchor for farrowing across midnight; schedule limits beyond day seven; and treatment-specific permission for early work. “Prefill” must mean recording work already performed, not declaring future work complete.

   Then decide what an early act satisfies, how corrected birth dates affect planned dates and KPI, and whether two overdue occurrences can ever be satisfied by one act. Clinical expiry or conversion depends on Q1; do not infer it from a generic overdue rule.

---

9. ❓ **Q6 — How does an unexplained census change balance the ledger?**

   The rulings require both a locked Born equation and a post-lock “just set count” path. What ledger fact makes these compatible?

   Concrete scenario: Born is locked at twelve, recorded deaths are zero, fostering is zero, and the hand finds ten alive. Setting Alive to ten violates `Born = Alive + Dead` unless something else changes.

   ➡️ **Recommend an explicit signed unexplained-inventory adjustment, leaving Born and deaths intact**; this requires an owner-approved extension of the stated derivation.

   **Later frontier:** Define whether counting first records an observation and then applies a resolution, or commits the inventory adjustment immediately. Establish when counts are required and which observations re-anchor inventory.

   Resolve the later-body case: after the unexplained reduction from twelve to ten, finding one body must reclassify part of the adjustment rather than reduce Alive to nine. Decide allocations when named animals are involved and how excess identity rows are reconciled.

   Pre-lock discrepancies retain the established farrowing routes. Any required change to the shared death drawer—named allocations, reconciliation links or post-lock sow-death behavior—needs a concrete owner decision after these semantics are settled. Merely opening the existing drawer from processing is not a reason to redesign it.

---

10. ❓ **Q7 — What does ending processing end?**

   Options in the evidence are **manual closure that prevents further recording**, **manual closure of task monitoring while animal records remain writable**, or **automatic draining/closure as litter obligations terminate**.

   Concrete scenario: processing ends for a batch, but a worker later discovers that yesterday’s treatment was recorded against the wrong litter. A frozen task report and an uncorrectable animal history are different consequences.

   ➡️ **Recommend closure of task monitoring with a dated receipt, while preserving audited animal records**; closure should not force known errors to remain true.

   **Later frontier:** Define task creation and admission of late/out-of-batch litters, including day-one work during farrowing. Then settle the batch-farrowing dependency, manual versus automatic closure triggers, the mandatory flag, window expiry and residual work at weaning.

   Separately decide post-close new treatment records, corrections, identity additions, new measurements and reopening. Decide whether the closure receipt remains an as-of snapshot while live records change, and where subsequent records are accessible. Permissions and hold-to-commit follow from Q8 and the actual irreversible consequence.

---

11. ❓ **Q8 — What do the verbs promise, and who may correct the record?**

   Should **Mark** be a synonym for **Record**, or a distinct act such as claiming work or changing task status? Do processing corrections follow open, stamped amendment, or introduce permissions for particular record types?

   Concrete scenario: a second worker sees “Mark iron” and interprets it as reserving the job, while the system treats the tap as proof of administration. Separately, the permission to amend Born does not itself settle permission to invalidate another worker’s treatment record.

   ➡️ **Recommend one attestation meaning: Record asserts completed work; Mark introduces no separate status-only act. Extend open, stamped correction to processing**, preserving the original evidence.

   **Later frontier:** Define correction versus a second real treatment, wrong-litter correction plus fresh recording, and withdrawal of phantom identity rows. Entry-time stamping remains fixed; correcting yesterday’s wrong-litter entry today must not silently manufacture yesterday’s stamp.

   Carry forward **Edit**, **Back**, **Clear**, **Save** and **Close** with their ruled meanings. Finalize **End** after Q7. Determine whether identity confirmation merely commits the current animal’s record, and ensure it cannot imply that all identity work is finished. If any action becomes irreversible, specify its consequence before selecting its confirmation mechanism.

---

12. ❓ **Q9 — Is coordinating physical work part of v1?**

   Options are **record visibility and deduplication only**, **an advisory claim on work**, or **an exclusive assignment/claim requirement**.

   Concrete scenario: two offline workers each see iron as due and both administer it. Merging their marks into one completed item does not undo the second administration—and can hide evidence of it.

   ➡️ **Recommend an advisory claim with visible synchronization limits, while retaining both workers’ attestations**; it can reduce collisions without pretending to guarantee exclusivity offline.

   **Later frontier:** If claims are included, define their subject, expiry, release and offline behavior. After Q3/Q5, distinguish retransmission of one event from two independent records of physical work; do not silently deduplicate the latter into proof of one administration.

   After Q6, specify concurrent census behavior: two observations of ten from a shared base of twelve are not automatically two separate losses of two. Weight measurements, treatment counts and inventory movements likewise need different merge semantics. Apply the existing farrowing merge contract where it governs; any change to it requires explicit owner approval.

---

13. **Keep the remaining work with the design driver.** Navigation between postpartum and processing, filter values derived from configuration, layout, copy, and ordinary reuse of the existing drawer are not owner questions. Combining the two tasks’ records or changing a shared component’s behavior would be.

   Do not reopen fostering merely because lower-priority documents show a foster button. Do not reopen optional enrichment simply because production colored a missing weight amber. Neither resolves the actual semantic gaps above.

14. **What I did not probe.** I did not inspect leader artifacts or the held-out evaluation set, validate external husbandry/legal sources, inspect live Figma frames, or run the prototype. Repository checking covered standing rulings and the batch-closure contradiction. This is a dependency-complete interview proposal from the supplied material, not a settled product contract; later questions must be pruned or expanded from the owner’s answers before design starts.
