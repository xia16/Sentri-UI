# PickerField

PickerField collects one or several catalogue values through a labelled trigger and a controlled picker body.
Use ChoiceList radio instead for two to four short outcomes.

## When to use

Use for five or more options, searchable catalogues and dependent trees.

## When not to use

Use [Segment](../Segment/README.md) for changing a lens. Use [Field](../Field/README.md) for free text. Optional inputs must be [optional rows](../Field/README.md), revealed in capture order, rather than permanently visible optional fields. TaskChoice is a task section pattern for a choice that changes the page, not another generic chooser.

## Anatomy

Visible label; trigger value, chosen names (record forms) or count (filters); trailing chevron; optional persistent reason/error; sheet title; search; chosen-level step path with › separators (cascade); ChoiceList option group; footer: Back, plus Done · n (multi only; a single pick commits, so single has Back alone).

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
| Longest label (and Longest label · 中文) | Real copy at the Copy budget, in the real container at 390px: one line, nothing wrapped or cut. Longer copy is rewritten. |

Every declared state is in `variants/<id>.html`; these documents rely on atlas-injected resources. Each state owns its rendering script so the atlas can isolate it without loading unrelated states. Rendered proof is in [picker-choice-proof](../picker-choice-proof/verification.md).

## Behaviour

Show at most eight rows before using a scrollable catalogue and search. Search is required above eight leaves and spans the entire tree, including aliases and path labels. Do not duplicate selected leaves in a second list or disclosure. Multi triggers on a record form (the chosen items are the record, as on Record health) show the chosen names, wrapping to two lines, then “+n”; only filters show “n selected”. Ticks stay visible in their original rows. Group counts describe selected descendants and appear only above zero; categories in a single cascade carry no count.

Cascade opens one level at a time; choosing a branch auto-advances. Tappable steps reopen earlier levels; changing a branch replaces the downstream path without clearing ticks in other branches. A single leaf writes its complete path back to the trigger. Multi keeps one exit pair that says different things: **Back** leaves the sheet and keeps the draft selection on the device (pure navigation, per the Back verb law); **Done · n** confirms it; a **Clear** text action, where offered, discards it. A single pick commits at once, so single sheets have Back only and no Done. Modal hosts use one active dialog, inert background, focus trapping, and return focus to the trigger.

## Content rules

### Copy budget

| Text | English | 中文 | Lines |
| --- | --- | --- | --- |
| Field label | 32 | 16 | 1 |
| Selected value in the trigger | 32 | 16 | 1 |
| Option label | 36 | 18 | 1 |
| Option meta | 44 | 22 | 1 |
| Inline option | 8 | 4 | 1 |

Over-budget copy is rewritten to the shortest copy that still names the act; it is never wrapped, shrunk or ellipsised to fit. The “Longest label” state shows real copy at this limit in the real container at 390px. Budgets come from what fits at 390px inside the screen gutters; a `{n}` or `{name}` slot counts as 3 characters. Several selected names are joined with “ · ” and summarised as a count past two; the trigger never wraps.

### Writing rules

Sentence case, farm vocabulary, nouns for options. Search placeholders describe search, not the field label. Names on a record trigger are joined with “ · ”, not commas; no duplicate count summaries, nested cards or decorative status colour.

## Accessibility

Whole rows and every step, footer and Clear action meet `tap-min`. Checkboxes use an enclosing row label. Single catalogue buttons expose `aria-pressed`; radio rows use `radio` within a labelled `radiogroup`, `aria-checked` and a roving tab stop. Navigation buttons expose the next-level action. Search uses `type=search` and an accessible label. Reasons persist via meta / `aria-describedby`; error and loading text use a status region.

## API and tokens

Implementation: `../bundle.js`, `../bundle.css`, types in `../index.d.ts`. Legacy call signatures remain supported. `pickerOptions` is a compatibility adapter to ChoiceList, not another row renderer. `pickerBody` takes controlled `items` (value, label, children?, aliases?, meta?, attrs?), `path`, `selected`, `query`, action and stepAction. Hosts append a branch value or slice the path at a step; leaf selection toggles only in multi. `pickerFooter` renders the sole exit pair. Hosts own data, persistence and modal lifecycle. Keep display paths separate from recorded ids/names. Breadcrumb activation clears search and reopens the requested level. Multi inputs emit native change with `value` and `checked`; branch buttons emit `data-action` and `data-value`. `secondaryAction` exposes a separately named removal control for session-defined options. Do not route checkbox clicks through the branch action.

Tokens: `tap-min`, `choice-row-min`, `radio-row-min`, `field-height`, `radius-control`, `control-border`, `rule`, `paper`, `ink`, `muted`, `green`, `choice-press`, `disabled-surface`, `disabled-ink`, `red`, `font-sans`, `font-size-14`, `type-weight-strong`, `space-8`, `space-12`, `size-20`, `size-24`. No per-screen trigger sizing.

Shared copy (Select, None, counts, All, Done, loading and empty) has English/Chinese registry ids in `ux/laws/strings.json`; hosts resolve `data-str` / `data-args` and search `data-str-attr`, or supply localized search copy through `choiceSearch`. Item labels/meta accept `strs` / `args`.

## Do / don't

- Do keep checks on the right and search across branches. Don't build custom left-checkbox catalogue rows.
- Do show the chosen names on a record form, and the count once on a filter trigger and once on Done. Don't repeat names in a selected disclosure.
- Do wrap Chinese in option rows. Don't shrink type or targets to fit it.
- Do retain a disabled reason. Don't dim controls or use colour alone.

## Related components

[PickerField](../PickerField/README.md) owns catalogue capture; [ChoiceList](../ChoiceList/README.md) owns option rows; [Segment](../Segment/README.md) changes lenses; [Sheet](../Sheet/README.md) owns modal containment; [Field](../Field/README.md) owns optional rows and free text.

## Classification

Component: generic and shared across sections. Selection modes are variants of this component; a feature's catalogue and modal recipe are section patterns, not copied components. Radio and inline Choice retain their candidate approval status (ADR 0002).

## References

The one-level, auto-advance and tappable-step model follows Ant Design Mobile Cascader and TDesign Mobile step Cascader, with Apple/Material guidance for containment and dismissal, as recorded in [the component standard, section 4.5](../../../../docs/design-workflow/research/component-standard.md). Sentri uses its own `tap-min` floor rather than smaller library defaults.

## Changelog

2026-10-10 (round 2 fixes): Back keeps the draft, Done confirms; record forms show chosen names; no zero or “1 options” meta; single has no Done; steps read as a path.

2026-10-10: consolidated picker option rows; added controlled multi/cascade bodies and documented state proofs. Gate findings are addressed by this pass; owner approval remains separate from implementation verification.
