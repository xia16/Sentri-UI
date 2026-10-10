# FilterChips

Narrow a list by a changing set of category tags. Use [Segment](../Segment/README.md) instead for fixed views and list states.

## When to use

- **Tags:** use for narrowing a list by changing job or category tags.

## When not to use

Use Segment for To do / Done and other fixed views. Use ChoiceList for recorded form outcomes and Button for actions. These controls do not record a farm fact.

## Anatomy

Scrollable track, tag button, label, optional mono count, selected check, optional reason line. Filtering and sticky placement belong to the host layout; an adjacent IconButton opens advanced filters.

## Variants

See [variants.json](variants.json) for use boundaries and each variant’s rendered states.

- [Tags](variants/tags.html): narrowing a list by changing job or category tags.

## States

| State | Appearance and behaviour |
|---|---|
| Default | Enabled options; host supplies current selection. |
| Pressed | An unselected chip darkens to the handle tone at once on touch; the selected chip keeps its paper face. The static demo presses the second chip. |
| Selected | Weight plus check mark, shown only on the selected chip; the chip keeps the same width selected or not (padding reserves the check); never colour alone. |
| Disabled | Native disabled button, dashed outline; host supplies one visible reason beside the row. Prefer omission unless temporarily unavailable. |
| Longest label (and Longest label · 中文) | Real copy at the Copy budget, in the real container at 390px: one line, nothing wrapped or cut. Longer copy is rewritten. |

Error and loading belong to the list/sheet, not this synchronous control. Empty options omit the entire control; an empty result retains the current filters and shows a list-level empty state with a clear-filter action.

## Behaviour

Selection changes the content below immediately through the host’s data-action handler. No record is committed. Counts include zero; missing counts are omitted. Single selection; All clears the tag constraint. There is no total tag cap; show only what fits and scroll the remainder. The track scrolls sideways; a screen reader reads every chip in order, so swipe is not required. A Segment lens may sit above tags when it controls a separate state dimension, as in Piglet processing.

## Content rules

### Copy budget

| Text | English | 中文 | Lines |
| --- | --- | --- | --- |
| Chip label | 12 | 6 | 1 |
| Chip count (separate from the label) | 4 digits | 4 digits | 1 |

Over-budget copy is rewritten to the shortest copy that still names the act; it is never wrapped, shrunk or ellipsised to fit. The “Longest label” state shows real copy at this limit in the real container at 390px. Budgets come from what fits at 390px inside the screen gutters; a `{n}` or `{name}` slot counts as 3 characters. Chips scroll sideways, so the budget is about reading: at least two whole chips are visible at 390px.

### Writing rules

Sentence case; the job or category as a noun, never a commit verb. One or two words; no abbreviations. One optional count per chip, never in the label; zero is shown. All comes first and has no count when a lens above already carries the total. The set is dynamic and scrolls sideways; there is no cap on chips. Legacy labels may contain trusted HTML; never pass unsanitized user content.

## Accessibility

Named role=radiogroup; buttons expose role=radio and aria-checked, read as one choice of the group. Every target is at least tap-min in both dimensions. Disabled options are skipped. The shared bundle dispatches selection through ordinary clicks and keeps the screen reader's place after host rendering. Hosts provide an ariaLabel/label and keep list announcements outside the control.

## Do / don’t

- Do show only tags that have work today; don’t list empty tags.
- Do keep All first and uncounted when a lens above shows the total; don’t repeat totals.
- Do preserve the selection for an empty result; don’t hide the way back.

## API and tokens

`SentriUI.filterChips({ items: [{value, label, count, checked, disabled}], action, key, label, state, reason })`. TaskChips is a compatibility adapter into this implementation.

CSS uses tap-min, well, line, paper, ink, muted, press, control-border, radius-segment, radius-control, radius-8, space-2/3/4/6, space-key-gap, space-row-x, space-gutter, size-16, type-row-title-size, type-description-size, type-meta-size, font-sans and font-mono. No prototype scope is required.

## Related components

Segment switches fixed views; FilterChips narrows by tags; ChoiceList records an outcome; IconButton opens the filter sheet. TaskLens is a layout adapter for Segment’s two-line lens, not another implementation.

## Classification

Component: generic, used across sections. Named appearances are variants. Sticky filter bars are host layout patterns.

## Changelog

2026-10-10: consolidated implementations, self-contained tokens, press feedback, documented states and Chinese overflow.
