# RangeSlider

Select two inclusive numeric bounds for a list. Use Measure instead for recording one exact measurement.

## When to use

Numeric or day ranges with a useful finite interval.

## When not to use

Use PickerField for categories with many choices. Use ChoiceList for a short categorical choice. Do not use filtering controls to record farm facts.

## Anatomy

Visible label, current bounds, track, minimum handle, maximum handle, end labels, optional persistent reason/error.

## Variants

**Range** — use for narrowing a list by two numeric bounds. Used by farrowing.room. Units and groups are properties, not separate variants.

## States

| State | Treatment |
| --- | --- |
| Default | Enabled, current values shown. |
| Pressed | Heavier border and inset surface. |
| Focus | Visible focus outline. |
| At limits | Both bounds remain readable. |
| Disabled | Blocked with a persistent reason. |
| Error | Persistent explanation and recovery instruction. |
| Long / Chinese | Labels wrap without truncation. |

Every state is rendered in [the variant](variants/range.html).

## Behaviour

Drag either handle, tap the track to move the nearer handle, or use the keyboard. Snap to step; bounds never cross. Handles retain stable minimum/maximum order. The caller receives bubbling `sentri-range-change` with `detail.key` and `detail.value` and computes results without replacing a captured pointer.

No presets existed in Farrowing; do not invent a preset variant. A caller can put up to four FilterChips presets above a range. Limit short visible choice rows to five; use PickerField beyond five. One drawer at a time; replace its content for nested pickers.

## Content rules

Sentence case. Label budget: 32 English characters / 16 Chinese characters; longer labels wrap, never truncate values or reasons. Always name units. Reasons say what is missing and how to recover. Clear uses registered `act.clear`; Back preserves draft. The caller supplies noun singular/plural and localized strings.

## Accessibility

Two buttons with role=slider, individual accessible labels, aria-valuemin/max/now/text and a visible focus ring. Tab reaches each handle; arrows move one step; Home/End move to the nearest permitted limit. Disabled handles are native disabled and linked to the visible reason.

All targets use `--tap-min` (48 CSS pixels). Handles sit on opposite sides of one track so their hit areas never overlap, even at equal bounds.

## Do / don’t

Do show current bounds and count. Do preserve drafts on Back. Don’t repeat count in a second heading. Don’t use colour alone for selection or errors. Don’t stack cards or drawers.

## API and tokens

`SentriUI.rangeSlider` returns HTML; see [types](../index.d.ts). Tokens: `--tap-min`, `--border-width`, `--space-2`, `--space-3`, `--space-4`, `--space-8`, `--space-16`, `--space-24`, `--ink`, `--paper`, `--well`, `--line`, `--muted`, `--focus`, `--type-input-size`, `--type-description-size`, `--type-sheet-title-size`. No custom theme tokens.

## Related components

[Sheet](../Sheet/README.md), [FilterChips](../FilterChips/README.md), [ChoiceList](../ChoiceList/README.md), [PickerField](../PickerField/README.md), [FilterSheet](../FilterSheet/README.md).

## Classification

Component: generic numeric control independent of farm data. No duplicate implementation.

## Changelog

2026-10-10: created bundle implementation, state examples and prototype migration. No gate.json existed for either proposal; no prior judge findings could be read.
