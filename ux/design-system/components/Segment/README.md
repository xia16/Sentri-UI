# Segment

Switch a fixed set of 2–5 views or choices of the same list or sheet. Use [FilterChips](../FilterChips/README.md) instead for dynamic tag filters.

## When to use

- **Two-line lens (the default lens):** use for the To do / Done (or Active / Done / All) states of a task list, count beneath each label. Farrowing, Inspection and Piglet processing all use it, so the same job looks the same everywhere. Sits beside the filter IconButton when the list has one.
- **Lens (inline count):** use only for a 2-state split inside a card or sheet header where a second text line would not fit, and no filter button sits beside it. Not for the main list of a task: use the two-line lens.
- **View switch:** use for 2–3 subjects of one sheet.
- **Facet:** use for one fixed single-choice filter in a filter sheet.

## When not to use

Use FilterChips for changing tags, especially more than five. Use ChoiceList for recorded form outcomes and Button for actions. These controls do not record a farm fact.

## Anatomy

Track, equal-width option buttons, label, optional mono count, selected underline, optional reason line. Filtering and sticky placement belong to the host layout; an adjacent IconButton opens advanced filters.

## Variants

See [variants.json](variants.json) for use boundaries and each variant’s rendered states.

- [Lens](variants/lens.html): states of one list with inline counts.
- [Two-line lens](variants/two-line-lens.html): states of one list with counts beneath labels.
- [View switch](variants/view-switch.html): 2–3 subjects of one sheet.
- [Facet](variants/facet.html): one fixed single-choice filter in a filter sheet.

## States

| State | Appearance and behaviour |
|---|---|
| Default | Enabled options; host supplies current selection. |
| Pressed | An unselected option darkens to the handle tone at once on touch (visibly different from both unselected and selected); a selected option keeps its paper face. The static demo presses the second option. |
| Selected | Weight plus underline; never colour alone. |
| Disabled | Native disabled button, dashed outline; host supplies one visible reason beside the row. Prefer omission unless temporarily unavailable. |
| Focus | Token focus ring. |
| Long-label | English and Chinese labels wrap without clipping or ellipsis. |

Error and loading belong to the list/sheet, not this synchronous control. Empty options omit the entire control; an empty result retains the current filters and shows a list-level empty state with a clear-filter action.

## Behaviour

Selection changes the content below immediately through the host’s data-action handler. No record is committed. Counts include zero; missing counts are omitted. Lens order is working pile, finished pile, All last. View switches have no All or counts. Segment has 2–5 choices; view switch has 2–3. Do not scroll Segment.

## Content rules

Sentence case; nouns or states, never commit verbs. Aim for 1–2 words, ≤12 English characters / 6 Chinese characters at 2–3 choices; ≤8 / 4 at 4–5. Translate rather than abbreviate states. Long translations wrap and increase height; never ellipsize a status. Counts are optional properties, defined once, never repeated in the label. Legacy labels may contain trusted HTML; never pass unsanitized user content.

## Accessibility

Named role=group; buttons expose aria-pressed. Every target is at least tap-min in both dimensions. Tab reaches the control; arrows select adjacent enabled options, Home/End select the first/last. Enter/Space activate. Disabled options are skipped. The shared bundle dispatches selection through ordinary clicks and restores focus after host rendering. Hosts provide an ariaLabel/label and keep list announcements outside the control.

## Do / don’t

- Do use one count per choice; don’t repeat it in surrounding headings.
- Do preserve the selection for an empty result; don’t hide the way back.
- Do name subjects consistently; don’t mix unrelated navigation destinations.

## API and tokens

`SentriUI.segment({ options: [[value, trustedLabelHTML, {count, disabled, strs, args}]], active, action, ariaLabel, variant, state, disabled, reason, className })`. Existing calls remain valid; default variant is lens.

CSS uses tap-min, well, line, paper, ink, muted, press, focus, control-border, radius-segment, radius-control, radius-8, space-2/3/4/6, space-key-gap, space-row-x, space-gutter, size-16, type-row-title-size, type-description-size, type-meta-size, font-sans and font-mono. No prototype scope is required.

## Related components

Segment switches fixed views; FilterChips narrows by tags; ChoiceList records an outcome; IconButton opens the filter sheet. TaskLens is a layout adapter for Segment’s two-line lens, not another implementation.

## Classification

Component: generic, used across sections. Named appearances are variants. Sticky filter bars are host layout patterns.

## Changelog

2026-10-10: consolidated implementations, self-contained tokens, keyboard and press feedback, documented states and Chinese overflow.

[Gate remediation and checklist verification](VERIFICATION.md).
