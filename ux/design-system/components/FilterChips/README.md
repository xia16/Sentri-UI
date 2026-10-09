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
| Pressed | Press fill immediately on touch; static demo uses state=Pressed. |
| Selected | Weight plus check mark; never colour alone. |
| Disabled | Native disabled button, dashed outline; host supplies one visible reason beside the row. Prefer omission unless temporarily unavailable. |
| Focus | Token focus ring. |
| Long-label | English and Chinese labels wrap without clipping or ellipsis. |

Error and loading belong to the list/sheet, not this synchronous control. Empty options omit the entire control; an empty result retains the current filters and shows a list-level empty state with a clear-filter action.

## Behaviour

Selection changes the content below immediately through the host’s data-action handler. No record is committed. Counts include zero; missing counts are omitted. Single selection; All clears the tag constraint. There is no total tag cap; show only what fits and scroll the remainder. The track has a visible scrollbar and keyboard navigation, so swipe is not required. A Segment lens may sit above tags when it controls a separate state dimension, as in Piglet processing.

## Content rules

Sentence case; nouns or states, never commit verbs. Aim for 1–2 words, ≤12 English characters / 6 Chinese characters at 2–3 choices; ≤8 / 4 at 4–5. Translate rather than abbreviate states. Long translations wrap and increase height; never ellipsize a status. Counts are optional properties, defined once, never repeated in the label. Legacy labels may contain trusted HTML; never pass unsanitized user content.

## Accessibility

Named role=radiogroup; buttons expose role=radio and aria-checked, with a roving tab stop. Every target is at least tap-min in both dimensions. Tab reaches the control; arrows select adjacent enabled options, Home/End select the first/last. Enter/Space activate. Disabled options are skipped. The shared bundle dispatches selection through ordinary clicks and restores focus after host rendering. Hosts provide an ariaLabel/label and keep list announcements outside the control.

## Do / don’t

- Do use one count per choice; don’t repeat it in surrounding headings.
- Do preserve the selection for an empty result; don’t hide the way back.
- Do name subjects consistently; don’t mix unrelated navigation destinations.

## API and tokens

`SentriUI.filterChips({ items: [{value, label, count, checked, disabled}], action, key, label, state, reason })`. TaskChips is a compatibility adapter into this implementation.

CSS uses tap-min, well, line, paper, ink, muted, press, focus, control-border, radius-segment, radius-control, radius-8, space-2/3/4/6, space-key-gap, space-row-x, space-gutter, size-16, type-row-title-size, type-description-size, type-meta-size, font-sans and font-mono. No prototype scope is required.

## Related components

Segment switches fixed views; FilterChips narrows by tags; ChoiceList records an outcome; IconButton opens the filter sheet. TaskLens is a layout adapter for Segment’s two-line lens, not another implementation.

## Classification

Component: generic, used across sections. Named appearances are variants. Sticky filter bars are host layout patterns.

## Changelog

2026-10-10: consolidated implementations, self-contained tokens, keyboard and press feedback, documented states and Chinese overflow.
