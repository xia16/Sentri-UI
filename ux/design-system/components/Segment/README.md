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
| Longest label (and Longest label · 中文) | Real copy at the Copy budget, in the real container at 390px: one line, nothing wrapped or cut. Longer copy is rewritten. |

Error and loading belong to the list/sheet, not this synchronous control. Empty options omit the entire control; an empty result retains the current filters and shows a list-level empty state with a clear-filter action.

## Behaviour

Selection changes the content below immediately through the host’s data-action handler. No record is committed. Counts include zero; missing counts are omitted. Lens order is working pile, finished pile, All last. View switches have no All or counts. Segment has 2–5 choices; view switch has 2–3. Do not scroll Segment.

## Content rules

### Copy budget

| Text | English | 中文 | Lines |
| --- | --- | --- | --- |
| Label, 2–3 options | 12 | 6 | 1 |
| Label, 4 options | 8 | 4 | 1 |
| Label, 5 options | 6 | 3 | 1 |
| Count (optional, separate from the label) | 4 digits | 4 digits | 1 |

Over-budget copy is rewritten to the shortest copy that still names the act; it is never wrapped, shrunk or ellipsised to fit. The “Longest label” state shows real copy at this limit in the real container at 390px. Budgets come from what fits at 390px inside the screen gutters; a `{n}` or `{name}` slot counts as 3 characters. Measured with the segment inside the gutters (354px) beside no other control: three options fit 19 English / 8 Chinese characters, five fit 10 / 4. An adjacent filter IconButton takes 56px more, which is why the budget keeps a margin.

### Writing rules

Sentence case; nouns or states, never commit verbs. One or two words. Translate rather than abbreviate states. Counts are optional properties, defined once, never repeated in the label. Legacy labels may contain trusted HTML; never pass unsanitized user content.

## Accessibility

Named role=group; buttons expose aria-pressed. Every target is at least tap-min in both dimensions. Disabled options are skipped. The shared bundle dispatches selection through ordinary clicks and keeps the screen reader's place after host rendering. Hosts provide an ariaLabel/label and keep list announcements outside the control.

## Do / don’t

- Do use one count per choice; don’t repeat it in surrounding headings.
- Do preserve the selection for an empty result; don’t hide the way back.
- Do name subjects consistently; don’t mix unrelated navigation destinations.

## API and tokens

`SentriUI.segment({ options: [[value, trustedLabelHTML, {count, disabled, strs, args}]], active, action, ariaLabel, variant, state, disabled, reason, className })`. Existing calls remain valid; default variant is two-line-lens.

CSS uses tap-min, well, line, paper, ink, muted, press, control-border, radius-segment, radius-control, radius-8, space-2/3/4/6, space-key-gap, space-row-x, space-gutter, size-16, type-row-title-size, type-description-size, type-meta-size, font-sans and font-mono. No prototype scope is required.

## Related components

Segment switches fixed views; FilterChips narrows by tags; ChoiceList records an outcome; IconButton opens the filter sheet. TaskLens is a layout adapter for Segment’s two-line lens, not another implementation.

## Classification

Component: generic, used across sections. Named appearances are variants. Sticky filter bars are host layout patterns.

## Changelog

2026-10-10: consolidated implementations, self-contained tokens, press feedback, documented states and Chinese overflow.

[Gate remediation and checklist verification](VERIFICATION.md).
