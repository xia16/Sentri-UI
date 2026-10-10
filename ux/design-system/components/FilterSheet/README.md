# FilterSheet

The drawer that narrows a list: Farrowing's room filter and Inspection's pig filter. It is a [Sheet](../Sheet/README.md) drawer with a fixed frame, so every list filters the same way.

`SentriUI.filterSheet({ title, subtitle, sections | body, apply, reset, backAction, closeAction })`

## When to use / when not

- **Use** to narrow one list by a few facets, with a live count of what will show.
- **Not** for tags that change by job (use FilterChips) or fixed views (use Segment). A choice that records a fact is a Sheet, not a filter.

## Anatomy

1. **Head**: title, one-line subtitle (the unit), **Reset** (text action) and the ✕.
2. **Sections**: each an icon-led title, the control, and an optional one-line help. A section may hold a [RangeSlider](../RangeSlider/README.md), a facet Segment, or any field. A sheet of plain fields passes `body` instead.
3. **Footer**: **Back** and the commit, "Show 4 sows".

## Variants

- [Sections](variants/sections.html): titled sections (a range and a parity row).
- [Fields](variants/fields.html): picker fields passed as the body.

## States

| State | Appearance and behaviour |
|---|---|
| Default | Every facet on "Any"; the commit shows the unfiltered count. |
| Active | Facets set; the commit shows the narrowed count. |
| Pressed | The touched control darkens at once. |
| Long / Chinese | Titles and help wrap; the footer keeps its size. |

## Behaviour

The sheet edits a draft. **Back** and ✕ return to the list and keep the draft; **Reset** clears the draft to "Any" and stays; the commit applies it. The host rewrites the commit label as the draft changes, so the count is live. A zero count still commits (the list then shows its own empty state). The filter button on the list carries a badge with the number of facets applied.

## Content rules

Sentence-case section titles that name the facet ("Parity"), never the control. Help is one line, only when the facet needs it. The commit is "Show" plus the count and the noun; Reset is one word. Reset resets (Clear in Inspection, where the fields read as a form).

## Accessibility

A Sheet drawer: a dialog with its scrim and ✕. Every control is at least 48px (`tap-min`). The Segment row reads as one group per section.

## API and tokens

Spacing and type come from space-10, space-28, type-description-size, muted and the Sheet's own tokens.

## Related components

Sheet is the frame. RangeSlider and Segment fill its sections. IconButton opens it, with the applied count as its badge.

## Classification

Component: generic, used across sections.

## Changelog

2026-10-10: distilled from the Farrowing room filter; both screens now render from it with no visible change.
