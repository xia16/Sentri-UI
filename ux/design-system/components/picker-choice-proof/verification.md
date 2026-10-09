# PickerField / ChoiceList component pass verification

Branch: `45-picker`. Date: 2026-10-10. This is implementation evidence, not a replacement frontier-model judgement or owner approval. The original `gate.json` files are retained as the findings this pass addresses.

## Standard section 5 self-check

| Line | Result | Evidence |
| --- | --- | --- |
| 1 Purpose | Pass | Both README purpose lines name an alternative. |
| 2 When / when not | Pass | Both pages distinguish catalogue capture, outcomes, lenses and free text. |
| 3 Anatomy | Pass | Label, trigger, path steps, search, shared option row, status and footer; optional meta, Clear and session-option removal are named. |
| 4 Variants | Pass | Picker: single, multi, cascade, cascade-multi. ChoiceList: navigate, single, multi, radio rows, inline Choice. Multi/cascade variants are expressly requested future-facing cases; existing screens exercise all other jobs. |
| 5 States | Pass | Variant manifests and isolated state documents cover Default, Pressed, Active/Selected where applicable, Disabled with reason, Focus, Loading, Empty, long Chinese; Picker also Error. ChoiceList itself has no validation error. |
| 6 Targets | Pass | Chromium measures every control in all variant states and visible controls on 16 bare screens at 390×844. Checkbox labels are the effective whole-row hit region. All meet 48×48; hidden file capture inputs are excluded. |
| 7 Cap | Pass | README: eight rows before scroll and mandatory whole-tree search; demos show at most five options. Cascade browsing shows one level at a time. |
| 8 Meaning beyond colour | Pass | Checks, checkbox ticks and rings; persistent disabled reason; corrective error text and aria-invalid. |
| 9 Content | Pass | English/Chinese length budgets, sentence case, wrapping in rows and ellipsis on the trigger. Long Chinese appears in every variant proof. Multi writes counts instead of names. |
| 10 Accessibility | Pass | Labelled triggers, native checkbox change, aria-pressed single rows, radio roles and keyboard binder, visible focus, tab-accessible steps, modal focus trap/Escape/return in hosts. Disabled activation is blocked in the bundle. |
| 11 Tokens | Pass | Family CSS uses existing colour, spacing, type, radius and tap tokens; duplicated picker-option styles and Inspection trigger overrides removed. Unitless weights and hairline borders follow IMPLEMENTATIONS.md. |
| 12 Fields | Pass | Conditions has a visible label. Default Select/None, persistent corrective error/reason, labelled search type. Shared copy has English/Chinese registry entries and string hooks. |
| 13 Overlays | Pass | Only the top picker is active; parent is inert. Multi has Back + Done · n, without header arrow/X or a second auto-added footer. Back retains the draft, so it discards nothing. |
| 14 Related / classification | Pass | Both pages link related components and distinguish variants, components and host section patterns. |
| 15 Rendered proof | Pass | Nine full-state screenshots at 375px, sixteen bare-screen screenshots at 390×844, plus two ticks and whole-tree search. Browser also renders every atlas state in isolation and both previews. |

## Validation

- `node --test ux/system/*.test.cjs tests/field-cards.test.mjs tests/candidates-2.test.mjs tests/picker-choice.test.mjs`: **140 passed**.
- `node ux/tasks/piglet-processing/simple/build.mjs`: rebuilt `dist/app.html` from the shared bundle and task sources.
- `tests/picker-choice-browser.cjs`: Chromium checks variant states, isolated atlas state scripts, both previews, and sixteen bare screens; **no console/page errors, no horizontal overflow in variants, no undersized effective tap targets**. [Machine-readable results](browser-results.json).
- Browser regression: enter Symptoms → General appearance, tick twice, keep the catalogue and both ticks visible, then search Fever across the whole tree. [Two ticks](condition-two-ticks.png), [whole-tree search](condition-search.png).

Run the browser check with a local preview server (`node scripts/serve-ux.cjs 4317`). Playwright can be installed outside the repo; set `SENTRI_PLAYWRIGHT` to its module directory and optionally `SENTRI_PREVIEW_URL` to the server URL.

## Changed test expectations

`no-native-selects.test.cjs` and `sentri-components.test.cjs` now assert the shared ChoiceList row and aria-pressed state, replacing retired listbox/option and chooser wrapper assertions. `inspection-health-catalog.test.cjs` replaces old header-arrow/navigation, chooser wrapper, Choose title and Done “selected” suffix assertions with path steps and exactly one exit pair. Health/feed harnesses now load the actual bundle because the copied fallbacks are retired. Farm-data and save rules were not relaxed.

## Gate findings addressed

Picker owns a controlled multi/tree body and footer; option rows use ChoiceList. The broken disclosure is gone. Checkbox changes no longer trigger branch navigation before change. Search spans both kinds and all groups/aliases, with full path meta. Trigger summaries, medicine paths, reasons, loading/empty/error states, canonical geometry and static previews are implemented. Trailing selection is consistent; radio selected weight and Clear target floor are consistent in Piglet processing. Documentation supplies caps, content rules, state tables, accessibility and classification.

Migrations: Farrowing picker adapters, born-correction/sow-cause radios and optional assistance choices; Inspection condition/medicine/brand/reason/date-preset rows and labelled capture/log/outcome triggers; Home unit/section choosers; Piglet processing destination choices and shared radio selected weight. Copies and unused option styles are retired; the already-retired `ux/system/sentri-components.*` files were not edited.

Medicine category paths are display metadata; recorded medicine names and ids retain their original values. No new farm-recording decision was introduced. Radio/inline Choice retain ADR 0002 candidate status; owner approval and a fresh external gate remain separate from this verification.
