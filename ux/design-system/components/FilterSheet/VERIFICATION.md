# FilterSheet / RangeSlider verification — 2026-10-10

Section 5 of the component standard, checked against both README pages, bundle implementation and Chromium renders.

| # | Evidence |
| --- | --- |
| 1 | Purpose and named alternative in both pages. |
| 2 | When / when not, with existing siblings. |
| 3 | Anatomy lists required and optional parts; error/reason examples show optional parts. |
| 4 | One list filter variant used by Farrowing and Inspection; one range variant used by Farrowing. |
| 5 | State documents show default, pressed, active where applicable, disabled, error; FilterSheet additionally shows loading/empty. |
| 6 | Chromium: all component buttons >=48px, changed prototype phone buttons >=48px. Range handle targets sit on opposite sides of the track so equal bounds cannot overlap. |
| 7 | Up to five short choices; PickerField for larger lists. Farrowing parity has five. |
| 8 | Chip check, pressed border, dashed disabled handle and written error/reason. |
| 9 | Sentence case, EN/ZH budgets; long Chinese examples wrap without horizontal overflow. |
| 10 | Slider ARIA and focus; tested ArrowRight, Home, End, track tap and draft retention after Back. |
| 11 | New CSS uses existing tokens only; README lists them. |
| 12 | Range visible label, current bounds and unit; persistent errors say how to recover. Filter group labels are visible. |
| 13 | Sheet supplies modal semantics and visible Back/Close. Filter drafts are preserved, not farm records; no record discard confirmation needed. Existing host owns focus lifecycle. |
| 14 | Related links and component classification documented. |
| 15 | Each state screenshot in each component's proof directory at 375x844. Chromium also rendered at 390x844: no page errors or horizontal overflow. |

303 checks passed: `node --test ux/system/*.test.cjs tests/filter-range.test.mjs tests/candidates-2.test.mjs tests/row-family.test.mjs tests/selection-controls.test.mjs tests/field-cards.test.mjs tests/picker-choice.test.mjs`.

Full `tests/*.test.mjs` run: 468/470 passed before adding the two new checks. The two unrelated starter rendering checks require missing `dist/server/index.js` and `app/_sites-preview/preview.css`. No existing test expectations were changed.

Both direct variant files were rendered with injected tokens/bundle assets, as well as standalone previews. Prototype URLs: atlas URLs with `&screen=farrowing.room` and `&screen=inspection.filters`; Chromium checked phone content, excluding prototype gallery controls. Piglet processing dist rebuilt. There were no FilterSheet or RangeSlider directories, README, preview or gate.json at the start; this is a self-audit, not a frontier judge approval. No owner decision was made or is needed for this component pass. Existing screen-level decision queues remain owned by their features.
