# Astra inspection — scope and feeding distinctions

12 September 2026. Bounded research for the separate `inspection-astra-concept.html` study. Existing reference HTML remains unchanged. Repository documents establish product intent; external sources substantiate husbandry distinctions, not Sentri permissions or clinical rules.

## Recommended core

The walk is a place-based list of pens and identified pigs, with fast ad-hoc recording. Keep room identity, grouped animal rows, readable findings, distinct selection targets, a persistent selection count, and a short action sheet. Reading a pig and selecting a pig must remain different gestures. A saved finding returns to the same place and updates the affected rows. Ending a walk records attendance; it does not certify that every pig is healthy or that every ration was delivered. These follow [components §05](../../system/components.html) and [check-in §§06a–g](../../system/check-in.html).

The husbandry basis is broader than scheduled production work: Defra's England code describes inspection of animals and equipment plus recording findings and actions. It includes appetite, condition and lameness among observable concerns. Use these as observation vocabulary; do not generate diagnoses, medical urgency thresholds or treatments from elapsed days. This is a husbandry reference, not an assertion of the prototype farm's jurisdiction. [Defra, inspection §§25–27](https://www.gov.uk/government/publications/pigs-on-farm-welfare/caring-for-pigs#inspection).

## Selection and ad-hoc actions

| Interaction | Recommendation | Repository basis |
|---|---|---|
| Tagged pig checkbox | Toggle identity without navigating; preserve a visible total across pens and filters. | [Components §05](../../system/components.html) |
| Pig row body | Open readable identity, findings, active instructions and history. | [Check-in §06d](../../system/check-in.html) |
| Pen checkbox | The new study selects visible pigs only, with that scope stated explicitly. Keep pen feeding entry separate. This intentionally differs from the reference, where ticking a pen adds both the pen and its pigs. | [Check-in §06b](../../system/check-in.html) |
| Bulk condition or note | One payload applied to reviewed identities; sheet repeats the count and lets the selection be inspected. | [Health operations, shared decisions](../ops/health.md) |
| Weight | One value for each identified pig, using a next-pig sequence. Never stamp one weight across a bulk selection. | [Components §04, Weigh arity](../../system/components.html) |
| Mixed eligibility | Explain excluded subjects; do not silently claim that all selected pigs received the action. | [Components §04, roster](../../system/components.html) |
| Reproductive events | Preserve action-specific arity; several production events are single-pig only. They are outside the first compact demo rather than bulk shortcuts. | [Inspection production extraction](../inspection/part-c1.md) |

An individual ear tag names the animal; an untagged group's count is not a synthetic identity. This study explicitly uses two sample tagged growers in D4. That fixture does not stand in for an untagged population; an untagged pen needs its own group record. [Health operations, group rows](../ops/health.md).

## Feed: three different questions

| Question | UI should show | UI must not imply |
|---|---|---|
| What feed belongs in this pen? | Formula name, actual feeding mode, relevant open feeder/water issue, configured change information. | Formula or mode can be inferred universally from stage alone. |
| How much is allocated today? | For a configured curve-fed animal, `kg/head/day`. A uniform shared-trough pen may show an explicitly labeled illustrative daily pen allocation and readable derivation. | A daily allocation is a meal amount, measured consumption, or evidence that each pig ate its share. |
| What must be done for this pig? | Named active instruction, affected ear tag, delivery method, start/end or review date, source, and whether manual action is needed. | Adding an individual allowance to a shared trough guarantees targeted intake. |

The [feed-mobile extraction](feed-mobile.md) defines Sentri's curve-fed output as kg per head per day and explicitly prohibits displaying an internal ad-lib phase-budget rate as a ration. It does not define meals. It also leaves pen total display and mixed-stage aggregation unresolved. Existing [check-in §06c](../../system/check-in.html) goes further by summing animal adjustments into a trough total; treat that as a design proposal, not an established feed PRD requirement.

External husbandry supports retaining the delivery distinction. Defra's code distinguishes shared access from automatic individual feeding and requires adequate individual access despite competitors. Big Dutchman's first-party ESF description identifies tagged sows and dispenses their individual portions inside a protected feeding station. Therefore a shared trough sum can represent allocation, while targeted delivery needs a real physical method. [Defra, feed and water](https://www.gov.uk/government/publications/pigs-on-farm-welfare/caring-for-pigs), [Big Dutchman CallBackpro](https://www.bigdutchman.com/en/products/pig-production/sow-management/callbackpro/).

Mode must be explicit configuration. The feed PRD classifies lactation as curve-fed, while AHDB describes ad-lib lactation systems as common. This does not invalidate Sentri's configured model; it prevents presenting its stage mapping as a universal husbandry fact. [AHDB, feeding lactating sows](https://ahdb.org.uk/knowledge-library/feeding-lactating-sows).

## Individual plans and permitted editing

Farmhands can apply individual-override presets; they cannot freely edit curves, formula composition or ration numbers. Presets need a start date and an explicitly prompted expiry or review choice. The feed PRD's exact preset values remain unresolved, and its adjustment model is not an approval request workflow. [Feed-mobile, adjustment primitive and review flow](feed-mobile.md).

For the interactive study, a named configured preset may demonstrate review of the selected pigs, sample before/after amounts, delivery method and expiry. Clearly identify values as demonstration configuration. Do not derive clinical cutoffs, dosage, withholding, or automatic ration reductions. The study's bulk preset application is a deliberate extension: the reference prefers bulk body-condition marking with per-pig plans and single-pig feed editing, rather than a common percentage applied indiscriminately. [Check-in §06b](../../system/check-in.html).

An observation such as “Thin” should not secretly prescribe a universal numeric adjustment. AHDB recommends body condition assessment over the production cycle and nutritionist advice for suitable feeding levels. Record the observation and make any configured plan visible as a separate consequence. [AHDB, body condition scoring sows](https://ahdb.org.uk/knowledge-library/body-condition-scoring-sows).

## Ad-lib checks

Use `Ad-lib` plus the actual formula. Relevant observations include feed available, feeder flow or blockage, fouling, water supply, and difficulty accessing feed. AHDB advises functioning, unobstructed feed and drink points; its weaner guidance also calls for monitoring feeding and drinking access and appropriate hopper adjustment. [AHDB WebHAT, limited feed and water access](https://webhat.ahdb.org.uk/limited-feed-and-water-access?Report=&Risks=), [AHDB, establishing the weaner](https://media.ahdb.org.uk/media/Default/Imported%20Publication%20Docs/Establishing%20the%20weaner.pdf).

The prototype can open a known “Feeder low” exception, record its refill/resolution, and retain who/when in history. That is an event resolving an open observation. It should not become a compulsory all-green checklist or a “ration delivered” action. A blocked feeder is a pen equipment issue; an individual pig refusing feed is an animal observation. Formula switching remains permission-sensitive because the feed extraction records conflicting Farmhand/Manager authority; leave formula selection read-only for this study. [Pen operations](../ops/pen-ops.md), [feed-mobile, permissions and gaps](feed-mobile.md).

## Visual reference and Astra continuity

Reuse the established Astra typography, warm ground, restrained green accents, white pen cards, large controls and bottom sheets from [Astra farrowing](../../system/farrowing-astra-concept.html).

The user rejected the initial Apple Photos and Todoist references as too distant from this work. They are not the basis of this version. The replacement visual study directly inspected Shopify's [grouped products and individually selectable variants](https://mobbin.com/screens/0b8b725e-f5ec-4a98-97c4-37a79dd27635), [selected count and selection review](https://mobbin.com/screens/1e566243-b3ff-453b-ad91-4c29b2b5517b), and [scoped order fulfillment](https://mobbin.com/screens/c1871f24-7ab7-4e57-9684-20a5664c5607). The transferable patterns are a visible parent group, explicit individual checkboxes, a stable selection count, review before a shared action, and action-specific fields. These are operational patterns, not a proposal to make pigs behave like stock quantities.

SafetyCulture's [inspection completion workflow](https://help.safetyculture.com/en-US/005883/) and [frontline training guide](https://assets.ctfassets.net/wum34wy9buzj/2JsRvVzB5bv6GZtCWiy8eg/757d2dd0eac8e678b30a34c77cf0fa00/SafetyCulture_Frontline_User_Training_Guide__Two_Page____Nov_24_-Generic_Version-_.pdf) provide a closer workflow comparison for recording findings and following up on issues. This is a workflow source, not a claim that its screen styling was visually inspected. The prototype deliberately keeps existing Sentri check-in semantics rather than adopting a scored audit or compulsory checklist.

## Assumptions to keep visible in review

1. C1 is a uniform gestation shared-trough sample; its pen amount is an illustrative allocated total. No mixed-stage or consumption claim is made.
2. C2 uses an individual station. Its amount is not a manual pen-delivery task. A displayed plan does not prove live hardware synchronization.
3. D4 is an ad-lib sample with two explicitly tagged growers, formula and an open feeder exception; no daily ration is computed.
4. Preset values and dates are sample farm configuration. Real catalogue values, permissions, delivery methods and station integrations remain unspecified.
5. Pen selection of visible pigs differs intentionally from the reference's mixed pen/animal selection. The scope label and resulting count must make this testable.
6. The first study's local records and end-walk attendance are demonstration state, not a persisted farm log. Core checks should cover multiselection across pens, filter changes, selection review, cancellation, per-pig weight progression, preset expiry, and return to the original list position.

## Implemented study and verification

The separate HTML imports the Astra visual foundations and adds its own scoped styles and interaction code. The original farrowing HTML is unchanged by this work. The three previews cover the unit walk, selected pigs, and ad-lib feeding; each preview has independent sample state.

Browser checks exercised: individual and cross-pen selection; indeterminate pen selection; a shared observation recorded against exactly two pig identities; per-pig weights of 210 kg and 235 kg with a fresh field for the next animal; a shared-trough delivery exception; an ad-lib feeder refill; rejection of a ration preset for a mixed ad-lib/ration-fed selection; a selected-only support preset with a 3-day review; returning to all pigs after the last selected checkbox is cleared; pen-grid navigation; and end-walk check-in. The narrow view measured 360 CSS pixels with no horizontal overflow in the main content. Core model assertions also passed for batch subject scope, mixed-mode rejection, allocation changes, required observation detail and filter visibility.

This is not a connected farm application: refresh resets records, scanning uses an explicitly labeled sample, station behavior is sample plan information, and real presets, hardware integration and persistence remain future work. Keyboard focus and internal scroll positions are preserved when local interactions redraw a sheet or list.
