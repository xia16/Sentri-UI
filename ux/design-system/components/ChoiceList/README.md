# ChoiceList

ChoiceList renders consistent option rows for navigation and selection: one row per option, whole row tappable.
Use Segment for fixed short filter lenses; use [PickerField](../PickerField/README.md) for a collapsed catalogue with a trigger and sheet.

## When to use

Use when workers need to see and compare option labels, tick several, or open the next level.

## When not to use

Use [Segment](../Segment/README.md) for changing a lens. Use [Field](../Field/README.md) for free text. Use [PickerField](../PickerField/README.md) when the options should stay collapsed behind a trigger. An optional choice is an [optional row](../Field/README.md) that reveals its options on +, never permanently visible options. TaskChoice is a task section pattern for a choice that changes the page, not another generic chooser.

## Anatomy

Group heading (optional); lead control (optional); option label; meta line (optional, only to distinguish options); trailing check, checkbox, ring or chevron; search (optional); empty/status line; Clear text action (optional field only); secondary removal action (optional, for a session-defined option).

## Variants

- **Navigate** (`navigate`): use for opening another choice level; use single for selecting a leaf instead.
- **Single** (`single`): use for one value in a catalogue; use radio for visible unselected outcomes instead.
- **Multi** (`multi`): use for independent values with trailing checkboxes; use single for one value instead.
- **Radio rows** (`radio`): use for two to four recorded outcomes with visible rings; use PickerField for five or more outcomes instead.
- **Inline Choice** (`inline`): use for two or three short required outcomes in one 60px row; use radio rows for long labels, and an optional row for an optional input.

## States

| State | Rendering and response |
| --- | --- |
| Default | Label, optional meta, trailing mark; nothing selected is shown as nothing. |
| Pressed | `choice-press` fill; static `pressed` prop. |
| Selected | Trailing check, checkbox tick or ring plus stronger label. Never colour alone. |
| Disabled | Prefer omission. Otherwise readable text, `aria-disabled`, and a persistent reason line; no dimming. |
| Focus | `focus` ring on one row or option. |
| Loading | Loading options status in place of rows. |
| Empty | No options or no search match; never a blank panel. |
| Long label | Labels and meta wrap, including Chinese; rows grow, never truncate. |

Every state is in `variants/<id>.html`. Rendered proof is in [picker-choice-proof](../picker-choice-proof/verification.md).

## Behaviour

Show at most eight rows before search. Single rows toggle `aria-pressed` and commit; multi rows are whole-row labels around a native checkbox; navigate rows open the next level and show a chevron. Meta appears only when it distinguishes options: a group count such as "2 selected" appears only above zero, and a plain option count adds nothing. Clear appears only while an optional field has a value and returns focus to the group's tab stop. Radio rows and inline options use a roving tab stop. Do not duplicate a selected row in a second list.

## Content rules

Sentence case, farm vocabulary, nouns for options. Aim for labels up to 32 English characters or 16 Chinese characters, meta up to 64 / 32. Inline options up to 8 English or 4 Chinese characters. Do not truncate a label to fit; wrap it.

## Accessibility

Rows meet `tap-min` (radio and inline rows `radio-row-min`). Single rows expose `aria-pressed`; radio rows use `radio` inside a labelled `radiogroup` with `aria-checked`; `radioBind` supports arrows, Home and End. Search is `type=search` with an accessible label. Reasons persist through meta or `aria-describedby`.

## API and tokens

`choiceRow`, `choiceGroup`, `choiceSearch`, `choiceEmpty`, `choiceRadios`, `radioBind`; `pickerOptions` is a compatibility adapter. `secondaryAction` exposes a separately named removal control. `labelHidden` hides only the field label when an enclosing optional row already names it; the accessible label and Clear remain. Types in `../index.d.ts`.

Tokens: `tap-min`, `choice-row-min`, `radio-row-min`, `rule`, `paper`, `ink`, `muted`, `green`, `choice-press`, `disabled-surface`, `focus`, `font-sans`, `font-size-14`, `type-weight-strong`, `space-8`, `space-12`, `size-20`, `size-24`.

## Do / don't

- Do keep checks on the right. Don't build custom left-checkbox rows.
- Do put an optional choice in an optional row. Don't show its options permanently.
- Do show a count only when it helps a choice. Don't print "0 selected" or "1 options".
- Do wrap Chinese in rows. Don't shrink type or targets to fit it.

## Related components

[PickerField](../PickerField/README.md) owns the trigger, sheet, steps and Back / Done; [Segment](../Segment/README.md) changes lenses; [Sheet](../Sheet/README.md) owns modal containment; [Field](../Field/README.md) owns optional rows and free text.

## Classification

Component: generic and shared across sections. Selection modes are variants of this component. Radio and inline Choice retain their candidate approval status (ADR 0002).

## References

[Component standard, sections 4.2 and 4.5](../../../../docs/design-workflow/research/component-standard.md).

## Changelog

2026-10-10 (round 2 fixes): README rewritten for rows; no zero or "1 options" meta; inline demo uses a required outcome and an optional row; one focus ring and ink text in disabled inline options.
