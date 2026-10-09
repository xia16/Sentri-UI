# Row pass verification

Branch: `45-row`. Implementation checks do not confer owner approval.

The 15-line component checklist was reviewed against the finished README, variant specimens, bundle and real callers:

| Line | Result / evidence |
|---|---|
| 1 Purpose | Purpose and named Log/Facts alternatives. |
| 2 When / when not | Both documented, alternatives linked. |
| 3 Anatomy | Named optional parts, all demonstrated. |
| 4 Variants | Seven jobs mapped to actual screens; TaskRow and TaskDay delegate. |
| 5 States | 44 applicable state specimens; pressed/focus, selection/current, reason, async retry/loading and zero count. |
| 6 Targets | Chromium measured Row roots, checkboxes and both door/act buttons: ≥48 CSS px at 375 and 390 widths; eleven affected atlas screens at 390×844. |
| 7 Choice cap | Scrollable lists have no fixed cap; search for large collections, scope lists about 15 units. |
| 8 Beyond colour | Native checks, explicit current copy, disabled reason and error/retry copy. |
| 9 Content | Length guidance, sentence case, wrapping and Chinese specimens. |
| 10 Accessibility | Native buttons/labels, keyboard, current semantics, visible focus and act naming. |
| 11 Tokens | Shared Row CSS uses tokens; no local palette. |
| 12 Fields | Not a typed-input component; checkbox labels remain visible. |
| 13 Overlays | Row owns no overlay; hosts route to existing Sheet. |
| 14 Classification | Component; TaskRow adapter, TaskDay arrangement, Home task card section pattern. |
| 15 Rendered proof | Every state screenshot at 375px in `proof/`; overflow and page errors checked at 375 and 390. |

Gate remedies: one family, no disabled opacity, secondary targets use control-height, icon tiles restricted to navigation, escaped legacy trailing and typed trailing in new calls, named Row tokens, zero-count reason, full page anatomy and state proof. Retired TaskRow and TaskDay row CSS, farrowing animal-row CSS and hand-built Inspection review/pen-selection markup. Home task cards are unchanged.

Tests: `node --test ux/system/*.test.cjs tests/candidates-2.test.mjs tests/selection-controls.test.mjs tests/field-cards.test.mjs tests/picker-choice.test.mjs tests/row-family.test.mjs` — 149 passed. Three candidates-2 markup assertions were updated only for the explicit variant attributes; event and accessible-name assertions remain. New regression checks cover task delegation, localization hooks, selection event hooks and escaped trailing text.

Browser screens: workbench.choose-unit, farrowing.room, farrowing.overview, piglet-processing.pen-list, piglet-processing.sheet-todo, piglet-processing.sheet-done, piglet-processing.end-task, feed-plan.pen, feed-plan.bulk, inspection.walk, inspection.review-selected. No page errors or undersized Row targets. State proof is in `proof/`.

No new farm-record or worker-obligation decision was introduced. Human design approval remains outstanding as usual; the original frontier gate is retained as historical findings.

Interaction checks: preview rendered all 38 states with no console errors; Inspection pen selection and Remove worked; Piglet sheet contained no retired TaskDay row markup or object-to-string text. Inspection click delegation ignores selectable rows so their native change event owns selection.

Two older Piglet callers (room/bulk) had CSS and a bulk identity-link transform coupled to TaskRow class names. Those now target Row, preserving the separate litter link with a 48px target. Browser click-through selectors were updated for the retired class names; those older flow suites were not executed in this pass.
