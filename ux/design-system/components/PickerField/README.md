# PickerField

PickerField collects one or several catalogue values through a labelled trigger and a controlled picker body.
Use ChoiceList radio instead for two to four short outcomes.

## When to use

Use for five or more options, searchable catalogues and dependent trees.

## When not to use

Use [Segment](../Segment/README.md) for changing a lens. Use [Field](../Field/README.md) for free text. Optional inputs must be [optional rows](../Field/README.md), revealed in capture order, rather than permanently visible optional fields. TaskChoice is a task section pattern for a choice that changes the page, not another generic chooser.

## Anatomy

Visible label; trigger value, chosen names (record forms, up to two lines then +n) or count (filters); trailing chevron; optional persistent reason/error. The sheet is a [Sheet](../Sheet/README.md) drawer: header **‹ Parent** (cascade, below the root) and the current level as the title; search pinned at the top of the body; one ChoiceList option group; footer Back, plus Done · n (multi only; a single pick commits, so single has Back alone). No breadcrumb, no ✕.

## Variants

- **Single** (`single`): use for one value from five or more options; use ChoiceList radio for two to four outcomes instead.
- **Multi** (`multi`): use for several values from a flat or sectioned catalogue; use cascade-multi for a tree instead.
- **Cascade** (`cascade`): use for one leaf from a tree, such as medicine category → medicine; use single for a flat list instead.
- **Cascade multi** (`cascade-multi`): use for several leaves across kinds and groups, such as conditions; use multi for a flat list instead.

## States

| State | Rendering and response |
| --- | --- |
| Default | Missing value stays missing; Select (single) or None (multi). |
| Pressed | `choice-press`; static `pressed` prop for rows and triggers. |
| Selected / active | Trailing check, checkbox or ring plus stronger label; trigger shows the picked value or path (never the field label), the chosen names (record forms) or a count (filters). |
| Disabled | Prefer omission. If needed, retain readable text and a persistent reason; `aria-disabled`, no dimming. Host rejects activation and announces the reason. |
| Error | Picker trigger has `aria-invalid`, border and persistent corrective text. ChoiceList is not a validated field: host supplies the field error. |
| Loading | Busy trigger and Loading options status; selection unavailable until loaded. |
| Empty | No options available or search-specific no-match status. Never a blank panel. |
| Long label | Row labels wrap, including Chinese, inside the same 56px row (one and two lines are one height); the names trigger wraps to two lines then +n; a path or value ellipsizes, the full label stays accessible and visible in the sheet. |

Every declared state is in `variants/<id>.html`, each drawn in its real container: the 390px phone with the form drawer (trigger states) or the picker drawer (Open, Level, Loading, Empty, Long-label) over the pig's page. These documents rely on atlas-injected resources.

## Behaviour

Show at most eight rows before using a scrollable catalogue and search. Search is required above eight leaves and spans the entire tree, including aliases and path labels. Do not duplicate selected leaves in a second list or disclosure. Multi triggers on a record form (the chosen items are the record, as on Record health) show the chosen names, wrapping to two lines, then “+n”; only filters show “n selected”. Ticks stay visible in their original rows. Group counts describe selected descendants and appear only above zero; categories in a single cascade carry no count.

Cascade opens one level at a time; choosing a branch auto-advances. The header names where you are: below the root, **‹ Parent** (the level above, or the root's short name such as Conditions) and the level as the title; `pickerHead({ items, path, title, rootLabel, stepAction })` returns `{ title, up }` for `sheet()`. ‹ Parent goes up one level and is never labelled Back. Going up keeps ticks in every branch. A single leaf writes its complete path back to the trigger. Search is pinned at the top of the sheet and spans the whole tree; results show their path as meta. The body is the one scroller (search sticky inside it, never a second scroller). The drawer is sized to its content up to `long`, on the bottom edge. Multi keeps one exit pair that says different things: **Back** leaves the sheet and keeps the draft selection on the device (pure navigation); **Done · n** applies it and closes; a **Clear** head action, where offered, empties it. A single pick commits at once, so single sheets have Back alone. The scrim and a swipe down do what Back does. Modal hosts use one active dialog, inert background, and return focus to the trigger.

## Content rules

Sentence case, farm vocabulary, nouns for options. Aim for labels ≤32 English characters or 16 Chinese characters, meta ≤64 / 32; never truncate the catalogue label to meet the budget. Trigger label ≤24 / 12; its value may ellipsize. Inline options ≤8 English or 4 Chinese characters; use radio rows for longer outcomes. Search placeholders describe search, not the field label. Names on a record trigger are joined with “ · ”, not commas; no duplicate count summaries, nested cards or decorative status colour.

## Accessibility

Whole rows and every step, footer and Clear action meet `tap-min`. Checkboxes use an enclosing row label. Single catalogue buttons expose `aria-pressed`; radio rows use `radio` within a labelled `radiogroup`, `aria-checked` and a roving tab stop. Navigation buttons expose the next-level action. Search uses `type=search` and an accessible label. Reasons persist via meta / `aria-describedby`; error and loading text use a status region.

## API and tokens

Implementation: `../bundle.js`, `../bundle.css`, types in `../index.d.ts`. Legacy call signatures remain supported. `pickerOptions` is a compatibility adapter to ChoiceList, not another row renderer. `pickerBody` takes controlled `items` (value, label, children?, aliases?, meta?, attrs?), `path`, `selected`, `query`, action and stepAction. Hosts append a branch value, or slice the path to `up.value` when ‹ Parent is tapped (its `stepAction`); leaf selection toggles only in multi. `pickerHead` gives the header's level; `pickerFooter` renders the sole exit pair (Sheet's Back + Done · n). Hosts own data, persistence and modal lifecycle. Keep display paths separate from recorded ids/names. Going up clears search. Multi inputs emit native change with `value` and `checked`; branch buttons emit `data-action` and `data-value`. `secondaryAction` exposes a separately named removal control for session-defined options. Do not route checkbox clicks through the branch action.

Tokens: `tap-min`, `choice-row-min`, `radio-row-min`, `field-height`, `radius-control`, `control-border`, `rule`, `paper`, `ink`, `muted`, `green`, `choice-press`, `disabled-surface`, `disabled-ink`, `red`, `font-sans`, `font-size-14`, `type-weight-strong`, `space-8`, `space-12`, `size-20`, `size-24`. No per-screen trigger sizing.

Shared copy (Select, None, counts, All, Done, loading and empty) has English/Chinese registry ids in `ux/laws/strings.json`; hosts resolve `data-str` / `data-args` and search `data-str-attr`, or supply localized search copy through `choiceSearch`. Item labels/meta accept `strs` / `args`.

## Do / don't

- Do keep checks on the right and search across branches. Don't build custom left-checkbox catalogue rows.
- Do name the parent in the header (‹ Diseases) and the level in the title. Don't draw a breadcrumb or label the up control Back.
- Do show the chosen names on a record form, and the count once on a filter trigger and once on Done. Don't repeat names in a selected disclosure.
- Do wrap Chinese in option rows. Don't shrink type or targets to fit it.
- Do retain a disabled reason. Don't dim controls or use colour alone.

## Related components

[PickerField](../PickerField/README.md) owns catalogue capture; [ChoiceList](../ChoiceList/README.md) owns option rows; [Segment](../Segment/README.md) changes lenses; [Sheet](../Sheet/README.md) owns modal containment; [Field](../Field/README.md) owns optional rows and free text.

## Classification

Component: generic and shared across sections. Selection modes are variants of this component; a feature's catalogue and modal recipe are section patterns, not copied components. Radio and inline Choice retain their candidate approval status (ADR 0002).

## References

The one-level, auto-advance and tappable-step model follows Ant Design Mobile Cascader and TDesign Mobile step Cascader, with Apple/Material guidance for containment and dismissal, as recorded in [the component standard, section 4.5](../../../../docs/design-workflow/research/component-standard.md). Sentri uses its own `tap-min` floor rather than smaller library defaults.

## Native

Build the platform control; Sentri's drawing is the reference for content and order, not for chrome.

| Variant | iOS | Android |
|---|---|---|
| Trigger | a `NavigationLink`-style row (label, value, chevron) in a `Form` | a list item with supporting text and a trailing chevron (Material 3 `ListItem`) |
| Single, 5+ short options | a sheet with a `List` and a checkmark on the chosen row (a `Menu` is fine for up to ~7 short options) | `ModalBottomSheet` with a radio/check list; a single tap commits |
| Multi | a sheet with a `List` and checkmarks, toolbar Back + Done · n | `ModalBottomSheet` with checkbox rows, bottom bar Back + Done · n |
| Cascade / cascade multi | `NavigationStack` inside the sheet: the back button names the parent, the title names the level; `.searchable` at the top spans the tree | a `NavHost` inside the bottom sheet with an up arrow and the parent name; a `SearchBar` at the top spanning the tree |

**No wheels here.** A wheel (`UIPickerView`, Android `NumberPicker`) only for long ordered values: dates, times, numbers. It is poor with gloves and hides options a farmer should see at once, so it never replaces a list of named options.

Where screens today differ from the platform choice (for the owner):
- Dates (log range custom dates, feed end date) use the platform date field, which is right: native date picker (`DatePicker` compact/graphical; Material `DatePicker`/`DateRangePicker`), not our list.
- Typed numbers (weight, dose, temperature, backfat) stay the numeric keypad (Numpad / `keyboardType(.decimalPad)`), not a wheel: values are read off a scale.
- Feed adjustment % is a slider plus a typed field: native `Slider` / Material `Slider` (a wheel would also do for this ordered range, but the slider is the better glove target).
- Care (4 outcomes), Outcome (2: Recovered / Entered in error), Body condition (2) and Dose unit (3: mL / mg / g) open a picker list today; by the record-sheet law (2–4 outcomes = Choice) the platform equivalent is an inline segmented control or radio rows, not a sheet. Left as approved; flagged.

## Changelog

2026-10-10 (multi-choice family): drawer convention — ‹ Parent in the header and the level as the title (`pickerHead`), no breadcrumb, no ✕; search pinned at the top; one row height for one and two lines; Back is Sheet's Back; sized to content on the bottom edge; specimens drawn in the phone; Native mapping.


2026-10-10 (round 2 fixes): Back keeps the draft, Done confirms; record forms show chosen names; no zero or “1 options” meta; single has no Done; steps read as a path.

2026-10-10: consolidated picker option rows; added controlled multi/cascade bodies and documented state proofs. Gate findings are addressed by this pass; owner approval remains separate from implementation verification.
