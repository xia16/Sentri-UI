# Parent review of UI alignment findings

Reviewed 21 September 2026. This is a source inventory plus targeted visual verification, not a claim that every possible populated, empty, error and interaction state has been visually inspected.

## Latest decisions

- Actions and navigation now share `SentriUI.row` in `st-panel st-row-group`: 68px rows, 34px icon tiles, internal separators, and single-line titles/supporting text. The previous flat action variant is superseded. The approved Back + category footer remains.
- Page information panels are white; drawer panels are lightly tinted. This does not override semantic alerts, selection states or the deliberately distinct Home inspection hub.
- Full pages and drawers are labelled separately in the study. Actions is now a full-page recipe, matching the app. Mobile preview bodies retain scrolling without desktop scrollbar chrome.
- Compact, short and medium retain their caps; the tall drawer now stops at 85% so context remains visible. The source catalog records actual sizing and gestures; no new draggable resize behavior has been invented.

## Agent findings and parent disposition

The three cheaper-agent passes were read-only source inspections. Findings were reported to the parent before selected implementation assignments. Component non-adoption is evidence to inspect, not automatically evidence that a specialized control must be replaced.

| Area | Finding | Parent disposition |
| --- | --- | --- |
| Home | Stacked unit cards, shadows, initial focus on Close | Replaced with one contextual shared row group; initial focus on dialog container, keyboard focus preserved. Kept pigs/pens and task counts, moved no inspection data out of the unit summary. |
| Home | Green ready-task CTA | Black primary CTA; pressed feedback. |
| Home | Clarification submission in scrolling body | Fixed Back/Send footer; form association retained. |
| Home | Early-end confirmation action in scrolling body | Compact confirmation, outlined Back plus red action in footer. |
| Home | All forms default medium | Search short; early-end compact. Scanner and multi-field fault form retain medium. |
| Home | Legacy search result rows | Shared contextual row group. |
| Home | Tinted unit hub | Retained: user requested visual distinction from task cards. |
| Home | Device Apply inside information panel | Retained: applies a panel-local setting, not the whole page. |
| Home | Sync message wrapping | Retained: alert/status copy is not a navigation-row subtitle; important status remains readable. |
| Inspection | Feed-plan summary bypasses panel context | Added shared contextual panel. |
| Inspection | Footer has older competing geometry | Current shared footer wins; actual rendered Back/category footer retained. Older selector is cleanup debt, not a verified visible mismatch. |
| Inspection | Whole-section environment/equipment dividers | Removed in favor of whitespace. |
| Inspection | Task/work summary text can wrap | Single-line ellipsis applied to row titles and supporting text. |
| Inspection | Touch floors depended on desktop viewport | Applied 44px floors to the phone shell itself. |
| Inspection | Legacy Home/Search and selection-review markup | Migrated Home/Search to shared panel rows and Selection Review to shared headings/row geometry. Review retains semantic list items and separate Remove buttons; removed legacy padding conflicts. |
| Inspection | Multi-pen scope tabs | Retained as a segmented selection control, not a navigation list; needs a separate rendered comparison before changing its semantics. |
| Farrowing | Pen navigation stale `action-item` class | Removed unused class; shared navigation component retained. |
| Farrowing | Feed guidance custom facts | Reused `SentriUI.facts`. |
| Farrowing | Other outcomes custom rows | Reused shared rows, preserving non-actionable zero counts and actionable nonzero routes. |
| Farrowing | Feature page manual headings | Reused shared page heading. |
| Farrowing | Count and finished-litter custom facts | Retained for now: compact inline live totals, causes and an interactive death breakdown differ from the static facts specimen. Shared outer panel controls context. Do not silently remove those functions during styling. |
| Farrowing | Identity/edit headers | Retained specialized linked identity, Clear action and unsaved indicator; not plain static headings. |
| Farrowing | Old wrapped row selectors overridden later | Current refinement enforces single-line rows; source cleanup remains, not claimed as a new rendered defect. |
| Farrowing | Empty space above death tabs | Removed additive header and first-tab margins; verified 16px total header-to-tabs gap. |

## Coverage and evidence

Source inventory covers Home secondary routes and drawers; Inspection's 20 named page views and 43 named drawer branches plus nested pickers; Farrowing's page/drawer branches. See `SENTRI-DRAWER-INVENTORY.md` for the finite surface catalog. Source coverage does not multiply into all possible combinations of selections, record states and data lengths.

Parent browser verification before the page/drawer consolidation: Home unit picker visual appearance and Unit 7 routing; clarification fixed footer/form association; compact early-end footer and red action; Farrowing death drawer spacing; actual embedded Actions drawer after unification; Farrowing overview Other outcomes shared rows. Actions rendered 68px rows, 34px icon tiles and 12px/14px padding with the expected tinted drawer panels. The updated study was visually inspected at the Actions recipe: full-page Actions, unified contextual rows, no desktop scrollbar inside the phone, and the approved category footer. No clinical records were submitted during these checks.

Remaining verification boundary: physical-device keyboard/safe-area behavior, every conditional record combination and source-only specialist pages are not certified by this pass. Earlier geometry checks are not relabelled as visual reviews.


## Page/drawer consolidation follow-up

Actions now uses page classification for both pig and pen scopes, with no scrim/handle and white panels on the page canvas. The component study shows the same full-page recipe, plus record and log pages and a focused note drawer over a visible parent. Removed presentation-switching controls from recipes and clarified component swatches. Tall drawers now use an 85% cap. Browser checked actual embedded Actions context, panels, absence of handle and Back return; the death drawer measured 715.69px / 842px (85%). Surface tests 39/39 and shared components 5/5 pass.
