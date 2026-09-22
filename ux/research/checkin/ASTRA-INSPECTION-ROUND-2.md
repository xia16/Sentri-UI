# Inspection revision — unit context, health and feeding

12 September 2026. This supersedes the first inspection study's generic observation and bulk feed-preset approach. The original check-in and farrowing designs remain reference files.

## What the product audit changed

- The overview now describes Unit 7: population, pens and production-stage composition. Stage selection scopes the list and combines with counted All / Health / Feed attention filters. Counts refer to pigs, not cases. Health and Feed overlap; they do not partition the population. See [check-in §06](../../system/check-in.html) and [product audit](ASTRA-INSPECTION-PRODUCT-AUDIT.md).
- Health means open diseases, symptoms and body-condition cases. A pig can carry several cases. Adding an existing condition preserves onset and triage; recovery and correction are different recorded outcomes. Manual feed instructions remain visible beside cases. See [health operations](../ops/health.md).
- Arbitrary multiselection no longer exposes a shared percentage editor. Body-condition recording creates individual configured plans; direct adjustment review is single-pig only. Ends is explicitly prompted rather than mislabeled as a review date. Clearing an adjustment does not recover its health case. Resolving its linked body-condition case ends the plan. See [feed extraction](feed-mobile.md), [check-in feed grammar](../../system/check-in.html), and the conflicting source passages documented in the audit.
- Maintenance belongs to the unit and pen, independent of feeding mode. A report requires device and description; Other requires a device name. Selecting an already-faulty typed device opens its current fault. Resolution is per record. See [pen operations](../ops/pen-ops.md), based on [original equipment screens](../inspection/part-b.md).
- The action sheet now includes disease/symptom recording, treatment records, case recovery/correction, triage, body condition, notes, individual weight progression, and single-pig temperature/backfat. Treatment records capture what was administered, without supplying a recommended medicine or dose. See [health](../ops/health.md) and [measures](../ops/measures.md).

## Flighty references actually inspected on Mobbin

1. [Airport overview and departures](https://mobbin.com/screens/edfb8407-22bc-40c4-bf59-e3e7220b4a13): location context precedes compact filters, a status distribution and the affected records. Applied as a small stage-composition strip followed by counted filters and pen groups. The large hourly chart is unnecessary for this unit list.
2. [Filtered airport result](https://mobbin.com/screens/86b141a6-776e-46eb-8728-1b574fb69534): the result remains grounded in the airport context, with an explicit reset path. Applied as composable stage/condition/triage filters with a visible Clear action.
3. [Airports grouped by operational issues](https://mobbin.com/screens/b39b56db-5cbc-49e7-879a-a34e5ec36c33): exceptions are named alongside their numbers and context. Applied as explicit case/day text, triage labels and a separate equipment-fault count. No invented urgency algorithm or red/green health score.
4. [Changed departure detail](https://mobbin.com/screens/09e08a95-1063-4e78-baeb-a68dddb6136a): the changed fact appears near the value it affects. Applied to meaningful feed steps and a scheduled formula-change entry, not a generic notification panel.

Shopify's earlier [group-and-member selection](https://mobbin.com/screens/0b8b725e-f5ec-4a98-97c4-37a79dd27635) remains useful for individual pig checkboxes and a stable selection count. Photos and Todoist remain rejected references.

## Prototype boundaries and unresolved source questions

This is one editable inspection concept in the existing Astra visual family. Stage mix and feed numbers are sample data, and refresh resets records. The farm band percentages are demonstration configuration, not validated feeding guidance. The first study's C1 allocation is retained as an explicitly labeled shared-trough allocation, not an intake measurement. Separate manual top-dressing is excluded from that allocation.

The sources disagree on free pen percentage edits and formula-assignment authority. The study follows condition-led individual presets and demonstrates only a preconfigured scheduled ad-lib formula change. It does not let the walker choose an arbitrary replacement formula. Actual role permissions and configured band values still require product decisions. Date expiry is shown and stored; the static same-day prototype does not simulate time passing or a feed controller.

This revision implements the requested unit, health, feeding and maintenance core. The wider production-event, transfer/fostering, missing/death, untagged count-allocation, batch management and photo-attachment flows from the original inspection module are not implemented here. They are inventoried in the audit; notes are not substitutes for these operations. The two sample growers have explicit tags and do not pretend to model an untagged pen.

## Verification

Browser checks covered combined stage/health and condition filters, cross-pen multiselection, selection across disease/symptom tabs, treatment entry, body-condition plans with explicit ends, recovery of a linked Thin case, duplicate-device redirection, Other equipment reporting, per-record fault resolution and scheduled formula change. Model assertions covered duplicate/onset preservation, exact subject scope, single-only feed edits, ad-lib rejection, and retaining a health case when only its adjustment is cleared.

The final 360 CSS-pixel browser check found no horizontal overflow in the unit list. Filter labels and numbers remain stacked, and the action sheet scrolls independently above its fixed Back bar.
