# Sow actions: category navigation and availability

Research date: 17 September 2026. User request: refine the existing UI, hide unavailable actions behind one link, and study faster movement between Health, Records, Feed and other action groups. This is a recommendation, not an implemented action menu.

## What was inspected

Mobbin screen previews and the sampled flow previews returned by the connector were visually inspected. A static screen establishes visible layout, not tapping, sticky behavior, accessibility or performance. Flow results include sampled screens; unshown intermediate steps are not evidence. No usability claim is based on screenshot similarity alone.

| Reference | Visible evidence | Application to this prototype |
|---|---|---|
| [Fitbit: Add activities](https://mobbin.com/flows/242a06d7-37fb-4327-880c-f3247b6702a3) | The three previews show the Today page, an opened sheet, and a larger sheet. Actions have icon-and-text labels under Track live and Manually log. | One action entry can expose several groups in the same sheet. Keep text labels; we need not copy its tile grid. |
| [Notion: action picker](https://mobbin.com/screens/6d541d61-ef40-4190-a91a-815925e83657) | Search actions appears above a vertical list of named commands including Insert blocks, Add page to, and Send notification to. | Search is an alternative for a large catalogue. Our first refinement should be group navigation; do not consume space with an always-open search field yet. |
| [Skip: item options](https://mobbin.com/screens/8fb1297d-c390-4a3e-8acc-199f278b5a38) | Category labels run across the top; Size and Ingredients sections are visible together below. The footer action is separate from the content. | Supports investigating a category index over a continuous list. Tap-to-jump and active-section tracking are our proposed behavior, not verified from this screenshot. |
| [Urban Company: filters](https://mobbin.com/screens/5cebc585-9255-410b-8d29-842d28213f1f) | Rating, Sort By and Others form a top tab row, with Sort By selected and its choices displayed below. | True tabs work for separate sets of choices. Hiding other categories would make our full action set harder to scan; not the first choice here. |
| [MacroFactor: icon chooser](https://mobbin.com/screens/408c71ad-183a-460f-af83-07337c30126b) | A category row sits over a dense icon grid with explicit Select Icon and Cancel buttons. | Suitable for homogeneous items. It is not a reason to turn heterogeneous sow actions into unlabeled icons or add a selection/confirmation step to menu navigation. |
| [Taco Bell: choosing an item](https://mobbin.com/flows/d589d191-5373-49ba-afe0-4c2db878572c) | The three previews show an item page, a dedicated choice list, then the original item page updated with the chosen sauce. | A focused subview can return to its origin with the choice reflected there. It does not establish draft persistence or a particular back animation. |

The targeted Skip flow search returned Taco Bell instead; it is recorded under its actual app name, not treated as a Skip interaction demonstration. Profile-side-menu results from Uber Eats, X, Base, Glovo and Lyft were inspected but are weaker matches for a subject-specific actions drawer.

## Local design evidence

- [Earlier seven-action inventory and eligibility table](../tasks/pig-actions.html): treatment, health records, abortion, fostering, count check, transfer and death. Its count-check availability is explicitly deferred.
- [Later action-sheet examples](../../system/components.html): the single-subject entrance is in the record header. The later rule omits blocked actions and exposes a link with their reasons, superseding the earlier greyed-row proposal. The full operation matrix is broader than the seven-action inventory.
- The current Inspection implementation already has labeled rows and Health / Records / Feed groups. Production, transfer and death are not all implemented in that menu. A shortcut alone would not provide the missing forms or eligibility rules.

## Recommended refinement

1. Add a neutral **Actions** button to the sow record header. Open one shared action drawer already scoped to the sow, with her tag/pen beneath the title. Do not add a Pigs/Pens selector for a single known sow.
2. Retain the existing row design. Use one compact, sticky category index under the header. Initial groups follow the shared catalogue: Production, Health, Records, Feed; Movement/identity remains a distinct group if those actions are included. Keep a fixed order and show only groups with available actions.
3. Category buttons jump to section headings in the same scrollable list. Manual scrolling updates the active category. Keep the category row reachable, reveal the selected label if the row overflows, and offset section headings below it. These are navigation links, not ARIA tabs that falsely imply hidden panels. Do not require swiping or a long press to discover categories.
4. Show no disabled action rows or empty category sections in the main list. A single **Unavailable actions (N)** link after the list opens a separate view with action names and concise reasons. Hide the link when N=0. Back restores the prior scroll/category. Do not expand a long explanation inline into the menu.
5. Choosing an action opens its form within the existing drawer flow, changing the title and exposing Back. Avoid another sheet layered over the actions sheet. Preserve the originating sow and prior menu position; opening a form alone never records an event.
6. After an ordinary save, show feedback and return to the originating action context. After a terminal event such as sow death or batch removal, show the updated record/result and recalculate availability; do not offer stale live-sow actions. Cancelling discards nothing silently: preserve drafts or use the established discard behavior.
7. Existing high-frequency litter controls stay on the farrowing screen. **Record sow death** in the actions list must explicitly name the sow. Reuse the existing death/edit forms where appropriate, rather than creating competing count or death implementations.
8. Do not introduce favorites, adaptive reordering, icon-only tiles or an always-visible search field in this pass. These add complexity before the available action list has been measured. Search can be reconsidered if state filtering still leaves a long catalogue.

## What this does not decide

No new clinical eligibility rules are inferred from consumer apps. The legacy matrix needs reconciliation with current animal states before implementing miscarriage, fostering or transfer. Mobbin provides layout references, not evidence that one pattern is faster with farm gloves, larger text or real task interruptions. Validate those through the actual prototype.

See [platform guidance](ASTRA-ACTION-NAVIGATION-GUIDANCE.md) for separately sourced constraints and interpretations.


## Preview implementation — 17 September

The Farrowing sow header now opens the shared Inspection Actions drawer directly. Following the user's review, this uses the existing large drawer token (`--drawer-long`) and fixes Production / Health / Records / Feed navigation above the bottom Back button. The categories jump within one list; Back restores its scroll position. Unavailable actions open a separate medium drawer.

Production exposes Record miscarriage while farrowing is unfinished, Finish farrowing when a litter exists, and Record piglet deaths. Edit litter record and Farrowing log live under Records. Record sow death is explicitly named under Health. The prototype miscarriage form preserves existing counts and records a terminal production outcome; clinical eligibility rules still require domain validation. Fostering and transfer remain unconnected preview flows and are labeled as such in the unavailable list.

Verified in the browser: direct entry, category navigation, unavailable view, note save returning to Actions, exiting after save, miscarriage form, and sow-death form returning to Actions. Both scripts passed syntax checks.


## Interaction revision after review

Task work is now a prominent Current task card above the ad hoc catalogue. In Farrowing it shows status and recorded counts and opens this sow's task screen; Finish farrowing is no longer a generic action row. Ad hoc production actions remain below. Transfer belongs to Management (movement and identity); this group appears only when an available action exists, avoiding an empty category while transfers are unconnected.

The sow header keeps Actions and Close in one horizontal row. Bottom category controls use 14px labels and at least 52px height. All destinations use the existing short, medium, or long heights; note is short, measurements retain short forms, and long forms retain long drawers. Catalogue and unavailable-list heights depend on their row count. The live Farrowing catalogue remains long. Verified the new task card route and the short note layout in the browser.


## Mobile task-strip correction

Removed Farrowing log from the ad hoc catalogue; history remains in the existing pig/detail flow. The compact task strip uses native horizontal overflow and snap scrolling with a partial next card, without previous/next controls. Task cards are keyboard-focusable buttons. Farrowing routes directly to its execution screen; sample vaccination and treatment tasks now route directly to recording forms using the existing treatment form infrastructure. Saving marks that linked sample task complete and removes it from Current tasks. These are local prototype records, not connected clinical schedules.

Reference: Material's native carousel implementation supports horizontal scrolling and peeking items: https://github.com/material-components/material-components-android/blob/master/docs/components/Carousel.md


## General and task type — latest review

User chose General rather than Management. General contains Transfer sow and Add a note; measurements stay in Records. The transfer entry now opens a medium destination unit/pen form with a current-location readback, excludes the current pen, and validates the destination before enabling save. The local prototype includes the transfer mutation; destination selection was browser-checked, but the final save was not verified during this pass.

Current-task cards carry compact text chips alongside status: Production for Farrowing, Health for Vaccination and Treatment. The chip uses an explicit task-type field rather than inferring type from the task title. Five category buttons fit the standard phone width and can scroll horizontally on smaller widths.


## Action navigation spacing

The Actions drawer now puts Back in its header and reserves the bottom for one horizontally scrollable category-chip row. Chips have 48px minimum height, 14px labels, 8px gaps, and one dark filled selection state. The large footer Back button and redundant selected underline are removed. Selecting a category or scrolling the content keeps the active chip visible. Other form footers are unchanged. Browser-verified category navigation and header Back.
