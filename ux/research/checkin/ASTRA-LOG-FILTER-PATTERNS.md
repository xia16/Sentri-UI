# Mobile log category selector

Date: 2026-09-16. Scope: primary-source guidance for the inspection prototype's 7–8 mutually exclusive log filters. No production apps were inspected. Prototype conditions below come from the task brief, not an independent usability study.

## Recommendation

Use one labelled single-selection control in the existing grey log toolbar: **Show | All activity · 2 ⌄**. Keep the selected category and count visible; open the full category list on demand. Default to All activity. This suits a small phone better than a horizontally overflowing row when many categories have zero entries and the active choice can otherwise disappear offscreen.

This is a design inference from the task conditions and the guidance below, not a claim that menus universally outperform chips. The parent task reports that this native single-select implementation is now in place.

## Verified guidance

- Apple describes pop-up buttons as a flat set of mutually exclusive choices that affect content or its surrounding view. The selected value can replace the button's label. It recommends a useful default, enough labelling to predict the options, and this pattern when space is limited and all options need not remain visible. [Apple HIG: Pop-up buttons](https://developer.apple.com/design/human-interface-guidelines/pop-up-buttons)
- Material's official web implementation describes filter chips as descriptive tags for filtering content, displayed in a set. Chips are therefore a valid category-filter pattern; their validity does not resolve overflow or current-selection visibility in this particular layout. [Material Web: Chips](https://material-web.dev/components/chip/)
- Material's official menu documentation describes a temporary surface containing choices, positioned relative to an anchor. Its component includes keyboard navigation and typeahead. This supports the general compact-trigger pattern; it does not prescribe a menu for every filter. [Material Web: Menus](https://material-web.dev/components/menu/)
- Apple's button guidance recommends at least a 44 × 44 pt hit region. Use a comfortably tappable selector row; this native-platform measurement is guidance, not a claim that CSS pixels and device points are interchangeable. [Apple HIG: Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)

## Tradeoff for this prototype

| Pattern | Benefit | Cost in this layout |
| --- | --- | --- |
| Scrolling chips | Visible categories are one tap away; multiple choices can be compared at once. | Seven or eight labelled/count-bearing chips overflow a phone. Offscreen choices and the selected chip require deliberate scrolling affordance and selection visibility handling. |
| Compact single selection | Current selection stays in one predictable place; preserves room for log entries; all categories can be read in a vertical picker. | Changing the category requires opening the picker first; alternatives are hidden while closed. |

These comparisons are interaction analysis of the supplied layout, not measured performance results.

Keep the category order stable and show zero counts in the picker for discoverability; show Equipment only in the applicable pen context. Retaining zero-count options is a product recommendation, not a rule in the cited guidelines. Give their empty result a clear category-specific message. Keep the neutral grey grouped surface and a visible disclosure indicator, rather than introducing a second decorative card around the selector. Verify the longest selected label at the narrowest supported phone width, keyboard operation, focus indication, and return to All activity.

## Source limitation

The Material 3 [chips](https://m3.material.io/components/chips/guidelines) and [menus](https://m3.material.io/components/menus/guidelines) guideline pages returned only a JavaScript requirement through the research reader. Their detailed contents were not verified; the concrete Material claims above use the official Material Web documentation instead.
