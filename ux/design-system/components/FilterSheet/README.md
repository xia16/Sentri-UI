# FilterSheet

Narrow a list with draft filters and a counted commit. Use Sheet instead for a record form.

## When to use

List filters in Farrowing and Inspection; Feed plan currently has no separate list filter copy.

## When not to use

Use PickerField for categories with many choices. Use ChoiceList for a short categorical choice. Do not use filtering controls to record farm facts.

## Anatomy

Sheet drawer, title, optional scope, Clear text action, named filter groups, optional persistent help, Back, live counted primary action, optional result reason.

## Variants

**List filters** — use for narrowing a list by draft filter groups. Used by farrowing.room, inspection.filters. Units and groups are properties, not separate variants.

## States

| State | Treatment |
| --- | --- |
| Default | Enabled, current values shown. |
| Active | Selected choice includes a check and accessible selection state. |
| Empty | Zero count; commit blocked with the reason (No sows match). The controls stay live so the draft can be widened. |
| Disabled | The whole sheet is unavailable (e.g. while syncing): every control, Clear and Show are disabled and one persistent reason says why. Not the same as Empty. |
| Error | Persistent explanation and recovery instruction. |
| Loading | Counting results; commit blocked. |
| Long / Chinese | Labels wrap without truncation. |

Every state is rendered in [the variant](variants/list.html).

## Behaviour

The caller owns draft and applied values. Back, Close and scrim preserve the draft; reopening resumes it. Clear changes the draft to defaults. Clear on the list (the summary line) resets the applied filter and the draft together, so reopening never shows filters the list says are off; the caller keeps applied and draft in agreement after any list-level clear. Show commits and closes. Count updates after every draft change; zero results blocks commit with a visible reason. Applied values appear once in the list summary and active group count badges the filter IconButton. No farm data is recorded, so leaving requires no unsaved-record confirmation.

No presets existed in Farrowing; do not invent a preset variant. A caller can put up to four FilterChips presets above a range. Limit short visible choice rows to five; use PickerField beyond five. One drawer at a time; replace its content for nested pickers.

## Content rules

Sentence case. Short choice groups wrap (nothing is cut off or hidden behind a scroll). Label budget: 32 English characters / 16 Chinese characters; longer labels wrap, never truncate values or reasons. Always name units. Reasons say what is missing and how to recover. Clear uses registered `act.clear`; Back preserves draft. Every label is a registered string (`act.clear`, `act.back`, `ds.filter.show`, `ds.filter.counting`; a feature passes `showStr:{one,many}` for its own “Show {n} sow(s)”). Where no shell fills them, pass `labels:{clear,back,counting,show(n,noun)}` in the user’s language.

## Accessibility

Sheet supplies role=dialog and aria-modal, visible Back and Close. Tab reaches controls; Enter/Space activates them. FilterChips supplies radio roles and arrow navigation; PickerField supplies its documented keyboard behaviour. Result/reason uses polite status. Caller retains Sheet focus lifecycle.

All targets use `--tap-min` (48 CSS pixels). Disabled commit stays understandable through the visible reason.

## Do / don’t

Do show the count only on the Show button. Do preserve drafts on Back, but reset them when the list is cleared. Don’t repeat the count in a second heading. Don’t use colour alone for selection or errors. Don’t stack cards or drawers.

## API and tokens

`SentriUI.filterSheet` returns HTML; see [types](../index.d.ts). Tokens: `--tap-min`, `--border-width`, `--space-2`, `--space-3`, `--space-4`, `--space-8`, `--space-16`, `--space-24`, `--ink`, `--paper`, `--well`, `--line`, `--muted`, `--focus`, `--type-input-size`, `--type-description-size`, `--type-sheet-title-size`. No custom theme tokens.

## Related components

[Sheet](../Sheet/README.md), [FilterChips](../FilterChips/README.md), [ChoiceList](../ChoiceList/README.md), [PickerField](../PickerField/README.md), [RangeSlider](../RangeSlider/README.md).

## Classification

Component: generic composition on Sheet, used by Farrowing and Inspection. No duplicate implementation.

## Changelog

2026-10-10: created bundle implementation, state examples and prototype migration. No gate.json existed for either proposal; no prior judge findings could be read.
