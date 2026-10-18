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
- **Inline Choice, key face** (`inline` with `face: 'key'`, candidate): the same radiogroup drawn as two or three boxed keys in the Stepper row's right column, for a required No / Yes among Stepper rows and Measures (Finish farrowing: Assisted). Each key is the stepper key's face: `paper`, 1px `task-key-border`, `radius-control`, 16px/500, 44px tall in a 48px hit area, an 8px gap; the column runs from the first key's left edge to the last key's right edge (136px). The chosen key takes the selected mark, a 2px `ink` ring and a 600 label, never a fill. Pressed is the keys' press (`press`, scale .96). A row of this face carries a 1px `line` below it, none when last, like a Stepper row. Opt-in: every other inline caller renders as before. Use it only for a required answer; an optional one stays an optional row.

## States

| State | Rendering and response |
| --- | --- |
| Default | Label, optional meta, trailing mark; nothing selected is shown as nothing. |
| Pressed | `choice-press` fill; static `pressed` prop. |
| Selected | Trailing ink check, checkbox tick or ring plus stronger label. Selection is ink, never green (green is done). Never colour alone. |
| Disabled | Prefer omission. Otherwise readable text, `aria-disabled`, and a persistent reason line; no dimming. |
| Loading | Loading options status in place of rows. |
| Empty | No options or no search match; never a blank panel. |
| Empty, can add | A collection the worker fills (a farm's brands for a medicine): `choiceEmpty(hint, { title, icon })` draws the native "nothing here yet": a glyph on the tint, a title that names what is missing, one line that says how to add it, centred under the search. The search stays the way in: no button beside it. |
| Long label | Labels and meta wrap, including Chinese; rows grow, never truncate. |

Every state is in `variants/<id>.html`, drawn in its real container: navigate, single and multi in a picker drawer; radio and inline in a record drawer; each in the 390px phone.

## Behaviour

Show at most eight rows before search. A single-choice sheet (Care: No action needed / Monitor / Treat in place / Move to hospital pen; Method) is a drawer sized to its rows, on the bottom edge, with Back alone in its footer: a tap on a row commits and closes. **Adding starts from search** (owner, 2026-10-16, the medicine picker): there is no always-shown "Add …" row. When a search matches nothing, the body shows one card and nothing else, a navigate row `Add “<typed>”`; a tap adds the option for everyone and picks it, or, when the list needs more than a name (a medicine's category), opens an add level of the same drawer (a labelled field pre-filled with what was typed, only the fields the list needs, and its own commit, "Add"). Optional details the list keeps (a brand's withdrawal) may follow as a skippable level. Such a drawer has levels (owner ruling B, 2026-10-16): the footer's Back goes up one level (from the add level to where the search was typed; at the first level it leaves), and a ✕ at the top left closes the whole drawer from any level. A run of rows that is not the level's main list (recently used options above the categories) carries a group heading (`choiceGroup({ title })`, Heading `group`) like every other group; a group that stands alone under the title needs none. Single rows toggle `aria-pressed` and commit; multi rows are whole-row labels around a native checkbox; navigate rows open the next level and show a chevron. Meta appears only when it distinguishes options from their siblings (a search result's category when results mix categories), never as a description every row repeats: a group count such as "2 selected" appears only above zero, and a plain option count adds nothing. Clear appears only while an optional field has a value and returns the screen reader's focus to the group. Do not duplicate a selected row in a second list.

## Content rules

Sentence case, farm vocabulary, nouns for options. Aim for labels up to 32 English characters or 16 Chinese characters, meta up to 64 / 32. Inline options up to 8 English or 4 Chinese characters. Do not truncate a label to fit; wrap it.

## Accessibility

Rows meet `tap-min` (radio and inline rows `radio-row-min`). Single rows expose `aria-pressed`; radio rows use `radio` inside a labelled `radiogroup` with `aria-checked`. Search is `type=search` with an accessible label. Reasons persist through meta or `aria-describedby`.

## API and tokens

`choiceRow`, `choiceGroup`, `choiceSearch`, `choiceEmpty` (`title` and `icon` for the can-add empty state), `choiceRadios` (`layout: 'inline'`, `face: 'key'`), `radioBind`; `pickerOptions` is a compatibility adapter. `secondaryAction` exposes a separately named removal control. `labelHidden` hides only the field label when an enclosing optional row already names it; the accessible label and Clear remain. Types in `../index.d.ts`.

Tokens: `tap-min`, `choice-row-min`, `radio-row-min`, `rule`, `paper`, `ink`, `muted`, `green`, `choice-press`, `disabled-surface`, `font-sans`, `font-size-14`, `type-weight-strong`, `space-8`, `space-12`, `size-20`, `size-24`.

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

## Native

| Variant | iOS | Android |
|---|---|---|
| Single (a short choice list in a sheet) | a sheet with a `List` and a checkmark, or a `Menu` for a few short options; a tap commits | `ModalBottomSheet` with a list; a tap commits |
| Multi | `List` rows with trailing checkmarks in a sheet, Done · n in the toolbar | checkbox list items in a `ModalBottomSheet`, Done · n in the bottom bar |
| Navigate | `NavigationLink` rows (chevron) inside the sheet's `NavigationStack` | list items with a trailing chevron, navigating inside the sheet |
| Radio rows (2–4 outcomes) | a `Picker` with `.inline` style in a `Form` section | radio button list items (`RadioButton` + `selectableGroup`) |
| Inline Choice (2–3 short) | segmented `Picker` | `SegmentedButton` (single-select) |

Wheels (`UIPickerView`, `NumberPicker`) are for long ordered values only (dates, times, numbers), never for named options: they are poor with gloves and hide options a farmer should see at once.

## Changelog

2026-10-16 (medicines, owner decision 3): adding starts from a search with no match (one `Add “<typed>”` card, then an add level); the always-shown "Add a brand" row is retired with the Brand field. A secondary group (recently used) takes a group heading.

2026-10-16 (owner ruling B): a drawer with levels has no "‹ Parent": the title names the level, the footer's Back goes up one level, a ✕ at the top left closes the whole drawer. The multi variant's specimens (a level of a cascade) carry the ✕ and a Back that goes up.

2026-10-15 (Finish farrowing): the inline key face (`face: 'key'`), variant `inline-key`, used by Finish farrowing's Assisted (No preselected, no Clear) and Edit finish details.

2026-10-10 (multi-choice family): single-choice sheets have Back alone and sit on the bottom edge; specimens drawn in the phone; Native mapping.


2026-10-10 (round 2 fixes): README rewritten for rows; no zero or "1 options" meta; inline demo uses a required outcome and an optional row; ink text in disabled inline options.
