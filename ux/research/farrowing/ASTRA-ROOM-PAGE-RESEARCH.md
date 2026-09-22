# Farrowing room page — focused reference study

11 September 2026. Scope: the room's sow list, state lenses, filtering, and persistent navigation. This note supports the separate Astra concept; it does not change the reference HTML or farrowing recording rules.

## Selection and evidence

Applied the owner's [reference criteria](ASTRA-REFERENCE-CRITERIA.md): only established apps with substantial adoption, and only screens with a useful, clearly visible design pattern. Inspected six Mobbin screenshots across Google Maps, Airbnb, and Revolut. Their previously recorded first-party adoption evidence qualifies them for inspection; popularity is not evidence that a particular layout performs better. The observations below describe the actual returned screenshots. Suggested farrowing adaptations are design judgments, not measured usability results.

The local reference remains the source of product requirements: state lenses and counts, explicit Active state, grouped pens and census, task/unit context, and the Go to pen / Scan ear tag / Search dock. Public consumer apps do not establish those domain rules. In particular, the pen grid's full-unit scope, its independence from list filters, tap-to-list behavior, and hold-to-peek behavior come from the existing design, not from these references.

## 1. Compact rows within a meaningful group

The inspected [Revolut transaction list](https://mobbin.com/screens/d0e343a8-5e97-4b70-b94a-64ea9109e7b8) has one Today heading above three rows in a common surface. Each row gives its identity and value first, with timestamp and exceptional state underneath. The failed transaction has a visible explanatory line; its meaning is not left to color alone. The screen does not show status tabs, so it is not evidence for their behavior. A second [Revolut category screen](https://mobbin.com/screens/b5fa1102-5e25-4bbc-b482-0d1c6aa6c692) shows separate dated groups, reinforcing the visual distinction between a group label and a row's content.

**Adaptation:** make a pen the group, with one restrained pen/census header and several sow rows beneath it. Keep the sow ID in a stable location. The primary text is the useful current fact: due status for Awaiting, Alive / Dead for Active and Done. Put Born, recency, and recording hand on the secondary line where applicable. Preserve explicit Active/Done/Ended meanings; do not expect the user to infer them from the counts or green text. Avoid an oversized rounded card and a repeated pen header for every animal.

This is an information-density choice, not a reason to shrink tap targets or remove the original fields. Test with multiple sows in the same pen and mixed states; a two-sow mockup cannot expose the grouping problem.

## 2. Make filtering visible, then keep detailed choices in a sheet

The inspected [Google Maps filtered results](https://mobbin.com/screens/20e3f86c-6cc8-4c92-929f-626bb8da5b24) visibly distinguish selected chips with both a checkmark and a tinted background. The filter controls stay above the results. Google's [iPhone documentation](https://support.google.com/maps/answer/3092445?co=GENIE.Platform%3DiOS&hl=en) separately confirms the Filter → choose criteria → Apply sequence; the screenshot alone would not prove it.

The [Airbnb Filters sheet](https://mobbin.com/screens/51327fa9-fda5-446a-a268-db32aecbaf6c) groups options under clear headings. A selected option has a stronger outline. Clear all and Show 45 homes remain together at the bottom while the option area occupies the body. Airbnb's [filter documentation](https://www.airbnb.com/help/article/479) confirms that Filters refines search using categories such as amenities and booking options.

**Adaptation:** keep Awaiting / Active / Done / All and their counts immediately visible as the established state lenses. Keep the funnel beside them as a distinct refinement control. Give applied refinements an explicit visual state and a compact readable summary, so a short list does not appear to mean that animals disappeared. In the filter sheet, group only the existing approved criteria and retain reachable Clear all / Show N sows actions. Clarify whether a displayed number is all animals in a state or matching results, rather than letting identical-looking counts mean different things.

Do not import travel criteria or add elapsed-time alarms. The older filter specification and later no-interval rule must be reconciled against owner direction before exposing a timing filter. These references support presentation and feedback, not a new filtering model.

## 3. Keep spatial navigation available without turning it into another workflow

The [Google Maps compact search list](https://mobbin.com/screens/cdf52403-8878-40f2-b7cc-126b574c8379) shows multiple compact result rows, a visible map region, and a distinct View map control near the bottom. The [Airbnb map/results screen](https://mobbin.com/screens/067c2fd3-202a-4dc1-ba8b-e5d6249aa80c) keeps location context, a results sheet and the global navigation visually separate. These images demonstrate visible access to spatial context; they do not establish how filters are preserved during transitions.

**Adaptation:** restore the persistent source dock with Go to pen, Scan ear tag and Search. Give the grid control a recognizable grid icon and current-pen context. Keep the spatial picker as navigation to a pen in the existing list, rather than duplicating the counting task on every tile. Its full-unit scope should be stated clearly when the list is filtered. A pen selection should leave the user at the selected pen with an understandable result even when the prior lens would exclude its animals; follow the established navigation rule rather than silently displaying an empty group.

Do not borrow geographic ranking, price pins, photography, or consumer-app bottom destinations. The farm already has a physical pen structure and a settled contextual dock.

## Proposed hierarchy to validate in the concept

1. Compact Farrowing and room/unit identity, preserving access to the existing unit/task context.
2. Existing state lenses with counts, followed by the separate funnel and applied-filter feedback.
3. A scrollable pen-grouped sow list with stable row alignment, explicit state, current facts and quiet metadata.
4. Persistent Go to pen / Scan ear tag / Search dock above the safe area.

Validate a multi-sow pen, all state lenses, filtered-empty results, a selected pen outside the previous lens, transitions from Awaiting to Active to Done, and dock access at narrow phone widths. Restore required behavior before polishing spacing; a clean two-row placeholder is not a complete room screen.
