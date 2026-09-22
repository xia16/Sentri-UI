# Shared mobile component audit

Scope: shared title, information-panel, row, log and page/drawer/footer components; the component study.

## Screenshot follow-up: navigation groups and Actions

The earlier pass missed two adoption defects: Inspection's Pig record/pen navigation lacked a shared panel container, and Farrowing's Pen information still used legacy row markup and overriding row CSS. Geometry and behavior checks did not catch either issue. These are now migrated to the shared navigation group, with the conflicting first-row padding and Farrowing row rules removed.

Historical pass (superseded by the later unification request below): following the user's lighter Actions request, command groups used the shared flat action-list variant, without the enclosing tinted panel, icon tiles or row dividers. The same variant is shown in the component study and used in nested command pickers.

Direct browser verification on the user's Farrowing route covered Pen A1, sow 000601's Pig record at its scrolled position, and the embedded Actions drawer. Both navigation groups rendered white with equal 68px row heights and 12px/14px padding. Actions rendered transparent groups and icon slots with 60px rows. Screenshots were inspected for all three surfaces. Two caller-level regression checks now verify page navigation and drawer group selection; all 38 surface tests pass.

## Changes

- Removed the extra section-heading margin from page/drawer headers.
- Raised standalone heading actions to at least 44 × 44 CSS px.
- Replaced shared row and Back hover feedback with pressed feedback. No shared function requires a mouse, tooltip, double-click or right-click.
- Added compact (320), standard (390) and large (430) phone widths to the review controls. Individual component specimens now respect phone width instead of expanding across a desktop column.
- Kept single-line title/supporting text with ellipsis for navigation rows. Full text stays in the accessibility tree.
- Extracted the approved Back + underlined section navigation into `SentriUI.categoryFooter`. The real Inspection/Farrowing Actions surface and component study use the same renderer. Callers retain section scrolling and action handlers.

## Browser coverage

- Six assembled contexts at 320 px: detail, Actions and log, each as page and drawer, with long content.
- Twelve isolated component contexts at 320 px: titles, facts, navigation, logs, grouping/dividers and action footers, each on page and drawer backgrounds.
- No horizontal overflow in the inspected bodies, canvases or heading groups. No visible shared button below the 44 px target in those specimens.
- Page/drawer color contrast and fixed-footer scrolling checked in the rendered study.
- Repeated component geometry checks at 390 and 430 px, with no overflow or undersized shared buttons.
- Checked the new category footer at 320 px in both contexts: 318 px inner width, 48 px button heights, all button widths at least 44 px, and no horizontal overflow in the category rail.

## Integrated parent browser pass

The parent verified all 15 Farrowing presets and all 28 Inspection presets at the actual 390 px phone canvas. These checks measured rendered geometry and touch targets; they are not a claim that every possible data combination is visually perfect.

Additional Farrowing routes checked: task overview, filter drawer, pen map, search, scanner, pen detail, feed guidance, equipment fault form, pen note editor, pen log, piglet processing, piglet records, identity editor, foster form and mortality form. No phone overflow was found in those routes. Small sow-title and death-breakdown links found in the preset pass were corrected.

Additional Inspection routes checked: populated pig detail, Actions, category shortcut navigation, pig log, treatment page, medicine picker, health recording and condition picker. The health recording Details and Choose conditions controls were corrected and rechecked at 44 px height.

Screenshot review covered task completion, populated pig details, the Actions drawer and its fixed category footer, and the embedded Farrowing pig log. The embedded log now has an 18 px filter inset and the pale page canvas behind its filters; facts use white panels on that canvas. Its legacy timestamps are grouped by their supplied day label while time remains with each entry.

Home, task gallery and overview study browser coverage is recorded separately in `UI-AUDIT-HOME-TASKS.md`. Farrowing and Inspection reports distinguish source coverage from parent browser checks. Specialized unvisited branches remain listed there; do not describe the audit as exhaustive device testing.

All six direct Node test files passed (62 tests after adding the legacy log grouping regression). Direct invocation avoids the sandbox child-process restriction encountered by one subagent.

The phone-width selector is a review tool outside the product. This audit does not emulate a real soft keyboard, platform safe areas, assistive technology gestures or every OS-native input picker. Those require device validation.
