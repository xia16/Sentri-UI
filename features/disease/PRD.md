# Disease and symptom 疾病与症状

## Problem

A worker who sees a pig with scours or a limp needs to put that on the record and later close it, without choosing between a disease list and a symptom list and without a chain of confirmation screens. Production used five screens to add and four plus a dialog to remove.

## Who

Anyone on the walk (stockperson, supervisor) recording what they see on one or many pigs; the same record is read by the vet.

## Anchor

Anchor: the condition on a pig (a finding in [Health record](../health-record/PRD.md)): open with a care level, then closed as Recovered or Entered in error.

## Rules

This feature is the walk's path through Health record's pages; the rules are Health record's and [Conditions](../conditions/PRD.md)'s, not repeated here. In short:

- The selection is made first on the walk list and is fixed: Actions → Condition opens Record health, a page of fields (Conditions, Care, Note) with Save · N and no pig list.
- One catalogue for diseases and symptoms: symptoms by where you look, diseases by body system, search across all, and Add “…” when nothing matches (Name and Category, like Add medicine).
- A pig that already has the condition gets no second finding; it keeps its start date.
- Save returns to the walk list: the tags are on the rows and a toast counts the pigs.
- Resolve picks one condition across the selected pigs and an outcome: Recovered (kept in history) or Entered in error (a correction). Pigs without that condition are listed as unchanged.

## Scope

In: Actions on two ticked pigs; Record health; Choose conditions (first level, a body area, Add a condition); the walk list after saving; Resolve conditions for one pig and for several, its outcome, and the walk list after resolving.

Out: the pig record as a health view, the finding and its edit forms, Care instructions (Health record); giving medicine (Treatment); pen-wide observations, deaths and abortions (not conditions; see Conditions).

## Decisions

- 2026-10-20 (owner): the Health record built in the Inspection prototype is the design. The event deck's Add condition and Resolve (one drawer with triage inline, Recover and Strike, silent prints) are earlier designs and are no longer this feature's screens; they stay viewable in `ux/archive/workflows.html` (`wf-condition`, `wf-resolve`). This feature's screens are the live prototype's states, most of them the same screens as Health record's with two pigs selected.

Open questions are Health record's and Conditions' (default care, folding, group counts, reporting); confirm the catalogue contents with the farm vet.

Sources:

- The prototype: `ux/system/inspection-astra-concept.html` and the catalogue `ux/system/conditions-catalogue.js`.
- The ops requirements: `ux/research/ops/health.md` and `ux/research/ops/SYNTHESIS.md`.
