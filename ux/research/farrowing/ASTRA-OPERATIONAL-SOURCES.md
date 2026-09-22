# Farrowing — operational recording references, round two

11 September 2026. Research only. Read with [ASTRA-RESEARCH.md](ASTRA-RESEARCH.md) and the latest dated decisions in [RULINGS.md](RULINGS.md). No HTML was edited.

This round examines two operational products: ODK Collect and SafetyCulture. Their documentation establishes actual lifecycle behavior, which static inspiration screenshots cannot establish. These are analogies for presentation, not replacement domain rules or evidence of measured usability improvement.

## 1. A quiet screen still has to say what is unfinished

**Documented observation.** ODK's draft list identifies each saved draft by a configurable name and pairs it with an explicit validation status: Errors or No errors. Finalization and transmission are distinct from saving a draft. Edits to finalized or sent records can be enabled; those edits appear individually in Central's activity feed. [ODK: Managing Forms in Collect](https://docs.getodk.org/collect-forms/).

**Transfer to farrowing — design inference.** Preserve the sow identity and the existing `1 unsaved` text on Record dead, even when reducing borders or making the tool pair more compact. In the death drawer, keep `Dead 6 · 1 unsaved` in the title area: the displayed tally and its pending portion answer different questions. Do not imply the entire displayed tally is posted while a draft exists. Returning to the same sow should make the retained draft recognizable before the user opens it.

**Do not copy.** Do not add a drafts inbox, submission queue, validation pills, explicit Save to live Alive counting, or a new lifecycle. ODK's editable draft and queued submission model is different from Sentri's committed counts plus retained death/edit drafts.

**What this challenges in round one.** Removing the extra autosave card is reasonable; removing the only visible distinction between saved and unsaved is not. Status words are functional information, not clutter.

## 2. Put the reason a transition cannot happen beside that transition

**Documented observation.** ODK's form-ending guidance distinguishes an editable draft from a record ready for transmission and explains that a draft with unresolved validation problems cannot finalize. Its filling guide distinguishes returning to editing, discarding work, and saving a draft when exiting. [ODK: End-of-form workflow](https://docs.getodk.org/guide-end-of-form/), [ODK: Filling out forms](https://docs.getodk.org/collect-filling-forms/).

**Transfer to farrowing — design inference.** Finish can remain a calm review sheet with usable fields while a death draft waits. Keep the existing `1 death unsaved · Record dead` pointer directly above the disabled Lock control. This explains both why Lock is unavailable and the route that resolves it. The active form area and blocked final action should be visibly different regions.

**Do not copy.** Do not add an exit confirmation, required review checkbox, mandatory fields, or an extra finalization page. Sentri's Back retains death/edit drafts; Clear discards them; Save commits them. Finish's existing fields and Back behavior follow their own rules. Do not relabel all of these exits Cancel or Done for superficial consistency.

**What this challenges in round one.** Reducing dividers must not flatten the form and the final commitment into one undifferentiated list. One purposeful boundary above the action area can communicate more than a completely borderless composition.

## 3. Present the current facts separately from the explanation of their changes

**Documented observation.** ODK can record old and new answers, timestamps and the person making a change. Optional configuration can require a change reason or identity entry. The audit is a separate record of actions and changes, rather than the filled form itself. [ODK: Form Audit Log](https://docs.getodk.org/form-audit-log/).

**Transfer to farrowing — design inference.** The locked face should answer “what stands now?” with Born/Alive/Dead, then “what was recorded at finish?” and “who finished it and when?” The separate Farrowing record page answers “how did this change?” Keep correction direction and before/after values readable there, with timestamps and attribution attached to the relevant event. Grouping by day and hand can reduce repetition only while authorship remains unambiguous.

**Do not copy.** Do not add required reason text, identity prompts, sign-off, permissions, location tracking, CSV-style logs, or generic audit badges. Sentri already has a specific post-lock Born correction ceremony and an open stamped correction policy. Preserve them.

**What this challenges in round one.** A single compact fact string can erase the distinction between at-finish facts and current totals. Fewer words is not the objective when the time frame differs. The existing section labels provide necessary meaning and should survive visual simplification.

## 4. Completion is a handoff to useful facts, not a celebration or an endless report

**Documented observation.** SafetyCulture's November 2024 frontline guide places a review of flagged responses/actions after Complete Inspection, followed by report access or Save & Close. For actions, it distinguishes a Details tab from Activity, where updates and media appear. The guide also documents offline inspection work followed by synchronization. This is a dated, first-party training flow, not verification of today's app UI. [SafetyCulture frontline guide, page 2](https://assets.ctfassets.net/wum34wy9buzj/2JsRvVzB5bv6GZtCWiy8eg/757d2dd0eac8e678b30a34c77cf0fa00/SafetyCulture_Frontline_User_Training_Guide__Two_Page____Nov_24_-Generic_Version-_.pdf).

**Transfer to farrowing — design inference.** After locking, prioritize the facts the next visit needs and keep the record route explicit. Treat the lock as a durable change of mode: controls become facts, the metric structure remains recognizable, and Edit / Record dead remain the relevant action pair. Keep saved death photos with their specific history batch; an unattached gallery on the locked face would lose context.

**Do not copy.** Do not insert a post-lock review wizard, success splash, export/share actions, task creation, follow-up workflow, or Details/Activity tabs. Those are inspection-product requirements. Sentri already places review before its lock and uses a single record page entrance after it.

## Evidence limits and next design checks

- Official ODK pages were opened and read. SafetyCulture's official PDF was opened and its page text inspected. Its current help URL redirected to an inaccessible destination, so no claim rests on that page's search snippet.
- The sources contain screenshots, but the PDF screenshot tool returned no image payload and the attempted browser view timed out. This note makes no claims about visually inspected screenshot geometry, colors, spacing or target dimensions. The parent research round handles actual Mobbin image inspection.
- Documentation proves described behavior, not that users are faster or make fewer errors. None of these sources supplies comparative task-time, error-rate, glove-use, or barn-condition evidence for the proposed farrowing presentation.
- The next concept should be inspected in three concrete states: returning with a retained death draft, finishing while that draft blocks Lock, and reading a locked litter after a later death/correction. A design that looks clean only when everything is saved does not yet resolve the important presentation problem.
