# ChoiceList

ChoiceList renders consistent option rows for navigation and selection.
Use Segment instead for fixed short filter lenses; use PickerField for a collapsed catalogue.

## When to use

Use when workers need to see and compare option labels or open the next level.

## When not to use

Use [Segment](../Segment/README.md) for changing a lens. Use [Field](../Field/README.md) for free text. Optional inputs must be [optional rows](../Field/README.md), revealed in capture order, rather than permanently visible optional fields. TaskChoice is a task section pattern for a choice that changes the page, not another generic chooser.

## Anatomy

Group heading (optional); lead control (optional); option label; meta line (optional, only to distinguish options); trailing check, checkbox, ring or chevron; search (optional); empty/status line; optional Clear action; optional secondary removal action for a session-defined option.

## Variants

- **Navigate** (`navigate`): use for opening another choice level; use single for selecting a leaf instead.
- **Single** (`single`): use for one value in a picker catalogue; use radio for visible unselected outcomes instead.
- **Multi** (`multi`): use for independent values with trailing checkboxes; use single for one value instead.
- **Radio rows** (`radio`): use for two to four recorded outcomes with visible rings; use PickerField for five or more outcomes instead.
- **Inline Choice** (`inline`): use for two or three short recorded outcomes; use radio rows for long labels instead.

## States

| State | Rendering and response |
| --- | --- |
| Default | Missing value stays missing; Select (single) or None (multi). |
| Pressed | `choice-press`; static `pressed` prop for rows and triggers. |
| Selected / active | Trailing check, checkbox or ring plus stronger label; trigger shows path or count. |
| Disabled | Prefer omission. If needed, retain readable text and a persistent reason; `aria-disabled`, no dimming. Host rejects activation and announces the reason. |
| Focus | `focus` ring; keyboard focus never depends on colour alone. |
| Error | Picker trigger has `aria-invalid`, border and persistent corrective text. ChoiceList is not a validated field: host supplies the field error. |
| Loading | Busy trigger and Loading options status; selection unavailable until loaded. |
| Empty | No options available or search-specific no-match status. Never a blank panel. |
| Long label | Row labels wrap, including Chinese; trigger ellipsizes, full label remains accessible and visible in the sheet. |

Every declared state is in `variants/<id>.html`; these documents rely on atlas-injected resources. Each state owns its rendering script so the atlas can isolate it without loading unrelated states. Rendered proof is in [picker-choice-proof](../picker-choice-proof/verification.md).

## Behaviour

Show at most eight rows before using a scrollable catalogue and search. Search is required above eight leaves and spans the entire tree, including aliases and path labels. Do not duplicate selected leaves in a second list or disclosure. Multi triggers show only “n selected”; ticks stay visible in their original rows. Group counts describe selected descendants.

Cascade opens one level at a time; choosing a branch auto-advances. Tappable steps reopen earlier levels; changing a branch replaces the downstream path without clearing ticks in other branches. A single leaf writes its complete path back to the trigger. Multi keeps one exit pair: Back and Done · n. Back keeps the draft; Done accepts it. A host that discards a changed draft must ask first. Modal hosts use one active dialog, inert background, focus trapping, Escape → Back, and return focus to the trigger.

## Content rules

Sentence case, farm vocabulary, nouns for options. Aim for labels ≤32 English characters or 16 Chinese characters, meta ≤64 / 32; never truncate the catalogue label to meet the budget. Trigger label ≤24 / 12; its value may ellipsize. Inline options ≤8 English or 4 Chinese characters; use radio rows for longer outcomes. Search placeholders describe search, not the field label. No comma-joined multi values, duplicate count summaries, nested cards or decorative status colour.

## Accessibility

Whole rows and every step, footer and Clear action meet `tap-min`. Buttons use Enter/Space and Tab; checkboxes use native Space and an enclosing row label. Single catalogue buttons expose `aria-pressed`; radio rows use `radio` within a labelled `radiogroup`, `aria-checked` and roving tabindex. `radioBind` supports arrows, Home and End. Navigation buttons expose the next-level action. Search uses `type=search` and an accessible label. Reasons persist via meta / `aria-describedby`; error and loading text use a status region. A visible focus ring is required in the modal host.

## API and tokens

Implementation: `../bundle.js`, `../bundle.css`, types in `../index.d.ts`. Legacy call signatures remain supported. `pickerOptions` is a compatibility adapter to ChoiceList, not another row renderer. `pickerBody` takes controlled `items` (value, label, children?, aliases?, meta?, attrs?), `path`, `selected`, `query`, action and stepAction. Hosts append a branch value or slice the path at a step; leaf selection toggles only in multi. `pickerFooter` renders the sole exit pair. Hosts own data, persistence and modal lifecycle. Keep display paths separate from recorded ids/names. Breadcrumb activation clears search and reopens the requested level. Multi inputs emit native change with `value` and `checked`; branch buttons emit `data-action` and `data-value`. `secondaryAction` exposes a separately named removal control for session-defined options. Do not route checkbox clicks through the branch action.

Tokens: `tap-min`, `choice-row-min`, `radio-row-min`, `field-height`, `radius-control`, `control-border`, `rule`, `paper`, `ink`, `muted`, `green`, `choice-press`, `disabled-surface`, `disabled-ink`, `focus`, `red`, `font-sans`, `font-size-14`, `type-weight-strong`, `space-8`, `space-12`, `size-20`, `size-24`. No per-screen trigger sizing.

Shared copy (Select, None, counts, All, Done, loading and empty) has English/Chinese registry ids in `ux/laws/strings.json`; hosts resolve `data-str` / `data-args` and search `data-str-attr`, or supply localized search copy through `choiceSearch`. Item labels/meta accept `strs` / `args`.

## Do / don't

- Do keep checks on the right and search across branches. Don't build custom left-checkbox catalogue rows.
- Do show a count once on the multi trigger and once on Done. Don't repeat names in a selected disclosure.
- Do wrap Chinese in option rows. Don't shrink type or targets to fit it.
- Do retain a disabled reason. Don't dim controls or use colour alone.

## Related components

[PickerField](../PickerField/README.md) owns catalogue capture; [ChoiceList](../ChoiceList/README.md) owns option rows; [Segment](../Segment/README.md) changes lenses; [Sheet](../Sheet/README.md) owns modal containment; [Field](../Field/README.md) owns optional rows and free text.

## Classification

Component: generic and shared across sections. Selection modes are variants of this component; a feature's catalogue and modal recipe are section patterns, not copied components. Radio and inline Choice retain their candidate approval status (ADR 0002). `labelHidden` hides only the field label when an enclosing optional row already names it; the accessible label and Clear remain.

## References

The one-level, auto-advance and tappable-step model follows Ant Design Mobile Cascader and TDesign Mobile step Cascader, with Apple/Material guidance for containment, keyboard and dismissal, as recorded in [the component standard, section 4.5](../../../../docs/design-workflow/research/component-standard.md). Sentri uses its own `tap-min` floor rather than smaller library defaults.

## Changelog

2026-10-10: consolidated picker option rows; added controlled multi/cascade bodies and documented state proofs. Gate findings are addressed by this pass; owner approval remains separate from implementation verification.
