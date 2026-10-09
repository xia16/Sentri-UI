# Panel, Icon and CategoryFooter verification

2026-10-10, branch `45-panel-icon-footer`. Implementation and owner laws were checked against [the component standard](../../../../docs/design-workflow/research/component-standard.md). The primary reference is the ADM / TDesign guidance recorded there: explicit usage, one component with variants, token properties and complete examples. M3 / Apple inform states, target sizes and accessible content. This is a self-check; original frontier-model scores in gate.json are preserved alongside resolution notes.

## Automated checks

- `node --test ux/system/*.test.cjs`: 102 pass.
- `node --test tests/row-family.test.mjs tests/selection-controls.test.mjs tests/field-cards.test.mjs tests/picker-choice.test.mjs tests/candidates-2.test.mjs`: 56 pass.
- Piglet processing `build.mjs` rebuilt dist/app.html.
- `git diff --check`: clean.

Tests changed only where expectations encoded retired behaviour: ChoiceList's independent surface class, Production-first / General category ordering, unknown-icon chevron fallback, and a Row snapshot's duplicated chevron path. Assertions now require the shared Panel class, canonical order, empty unknown SVG and canonical registry glyph. Additional guards cover aliases, grid, dots, empty Panel, TaskGroup composition, omitted disabled behaviour, valid usedBy ids and isolated srcdoc fixtures.

## Browser proof

Chromium / Playwright: 18 isolated component states at 375×844 and 11 bare prototype screens at 390×844. No page or console errors, no component page overflow, and no measured visible action target below 48×48. The intentionally unknown glyph specimen emits the documented warning. Horizontal category overflow stays inside its scroll region; focusing its final button reveals it. A favicon request is fulfilled with 204 in the verifier to remove browser-only resource noise.

Screens: workbench.today; farrowing.room, finish, history; inspection.walk, filters, actions; pig-profile.actions; piglet-processing.pen-list, sheet-todo, record-death. Each opens its atlas URL with the `screen` query parameter and waits for `atlas-ready`, including the preset and recorded entry taps. Study chrome is excluded by the page's bare mode.

[Machine-readable measurements](results.json). Each PNG beside this file records one component state or prototype screen. To reproduce, run `node scripts/serve-ux.cjs 4317`, then `node scripts/verify-panel-icon-footer.cjs` from the repository root. Playwright is an optional external tool; `SENTRI_PLAYWRIGHT_MODULE` may point to its installed module. No project dependency was added.

## Fifteen-line self-check

| Line | Result / evidence |
| --- | --- |
| 1 Purpose | Each README names its job and an existing alternative. |
| 2 When / when not | Separate sections name siblings. |
| 3 Anatomy | Context surface; glyph / dots; Back, navigation, underline, handle. All shown. |
| 4 Variants | Panel page/drawer; Icon standard/key; Category navigation. Each has valid atlas usedBy ids. Names and width are properties, not extra variants. |
| 5 States | Static Panel and Icon state exclusions explicit. Category default, active, tab and Back pressed, focused, empty, Chinese, overflow and scrolled rendered. Disabled categories omitted; errors/loading not applicable. |
| 6 Targets | Rendered visible action targets at least 48×48 on all checked states/screens; Back and category regions remain separate. |
| 7 Choice cap | Real verb sheets have three strips; five at 300px is explicitly a resilience stress test. Panel / Icon are not choices. |
| 8 Beyond colour | Current location uses weight, underline and ARIA; unsupported categories omitted rather than dimmed. |
| 9 Content | Sentence case, noun labels, preferred English/Chinese budgets; complete scrollable labels and wrapping Row specimen. Icon / Panel have no translated text slot. |
| 10 Accessibility | Hidden nonfocusable SVG, semantic containers, nav buttons / aria-current, visible focus. Tab/Shift+Tab and Enter/Space documented; keyboard reveals overflow. |
| 11 Tokens | Surface aliases resolve to tokens; default/icon key/pad stroke tokens; semantic footer dimensions and padding. Hairline uses border-width; container breakpoint is literal because CSS queries cannot read tokens. |
| 12 Fields | Not input components. Content documentation reiterates optional rows; input semantics remain with Field / picker consumers. |
| 13 Overlays | Not overlays. Sheet owns the context; these components add no modal or exit behaviour. |
| 14 Related / classification | Each page links siblings and states component/variant classification. |
| 15 Rendered proof | All 18 component states have individual PNGs, including empty and Chinese; all five variant files and direct overview previews rendered. |

## Migrations and decisions

Home, Inspection and Farrowing local icon dictionaries, mutations and fallback renderers are deleted; the task skeleton also delegates icons to the registry. Inspection's ruler glyph was moved into the registry. TaskGroup, ChoiceList, catalogue option lists and Farrowing pen cards share Panel; duplicated shadows and chooser-wrapper surfaces are removed. Inspection's copied category footer fallback is deleted. Its action catalogue, Farrowing host additions and the component study use Health · Routine · Production. Piglet processing inherits the shared TaskGroup/icons and its distribution is rebuilt.

No owner-only product decision is introduced by this pass. Existing gate scores and candidate approval statuses remain historical; a new independent judge/owner approval is separate from this implementation self-check.
