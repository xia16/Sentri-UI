# Row

Row presents one item and its next action in a consistent list anatomy. Use [Log](../Log/README.md) instead for an event timeline and [Facts](../Facts/README.md) for a static fact grid.

## When to use

Use in groups of places, animals, bulk selections, scope choices, counts, or editable records. The same job with different content stays in this family.

## When not to use

Use [Field](../Field/README.md) for typed input, [ChoiceList](../ChoiceList/README.md) for short single-choice forms, and the section pattern `sections/home/patterns/home-task-card` for Home's task progress card. That card is not a row and remains unchanged. Optional inputs are optional rows in record sheets; Row does not replace OptionalRow.

## Anatomy

Leading selection box (select + door only: a 24px box in a 48px hit area, always on the left), tick mark (tick only: an empty ring when due, a check disc when ticked; 24px, the whole row is the target), identity (optional code with one Status chip below it), navigation icon tile (optional, replaces identity), title, line 2 (optional), typed trailing word/count (optional), trail (chevron or Edit, optional; none when disabled), and one act button (door + act only). Icon tiles belong only to navigation lists of places or actions; never animal or record rows. Chips use `SentriUI.status({variant:'chip',kind,text})`.

## Variants

- **Navigation**: places or actions, icon tile, title, line 2 and chevron inside `rowGroup`; Inspection actions and Piglet more actions.
- **Animal**: code column, chip and token lines; Farrowing room and Piglet pen/sow lists.
- **Tick in place**: an item ticked before saving (`mark: 'due' | 'ticked'`). A due item shows the ring, a ticked one the check disc on green wash; a ticked item is a draft and never shows a Done chip. Done is said only for a saved item (see Done / record). No chevron. Piglet day list.
- **Select + door** (`rowSelectDoor`): a list that selects for a bulk act and opens items. The leading box toggles selection; the door (text column, then a small fixed chevron) opens the item. They are sibling targets, never nested. Without a door (`rowSelect`) the whole row is a label that only selects, the same box on the same side. Inspection pig rows use the door; the Inspection and Feed plan pen header box is the no-door case (box only, with the pen door beside it).
- **Plain**: a row with no icon, code, mark or trail (a Show/Hide toggle) reports `data-variant="plain"`, not navigation.
- **Door + act**: details opens a sheet; a sibling act records or removes in one tap. Piglet task sheets and Inspection review.
- **Scope**: workbench choose-unit; trailing count word and `aria-current="location"` for the current unit.
- **Summary count**: Farrowing overview; trailing number, inert at zero and a button above zero. Zero rows intentionally retain category coverage and say why the list is empty; no disabled chevron.
- **Done / record**: full evidence wraps, with Edit; Piglet done rows. Any row with a Done chip or an Edit rail reports `record`.

## States

| State | Rendering and behaviour |
|---|---|
| Default | Native button, checkbox label, or inert div according to job. |
| Pressed | `press` on every tappable face; `attrs: {'data-preview':'pressed'}` demonstrates it statically. |
| Selected | Native checked checkbox, never colour alone. Tick: the check disc on green wash. |
| Ticked | Tick only: disc and wash, no Done chip until saved. |
| Current | `aria-current="location"`, current marker and explicit current-unit description. |
| Disabled | Prefer omission. If retained, pass `disabled` and `reason`: a visible reason line replaces line 2 and the chevron is dropped; no opacity face. |
| Loading | `act.busy` prevents repeated act while the host settles; label says Recording. |
| Error | Host supplies actionable reason in line 2 and Retry act; no colour-only error. |
| Empty | Summary count zero is inert and says No sows due today. Empty groups are omitted with a separate reason. |
| Longest label (and Longest label · 中文) | Real copy at the Copy budget, in the real container at 390px: one line, nothing wrapped or cut. Longer copy is rewritten. |

Every applicable state appears in [variants.json](variants.json) and `variants/<id>.html`.

## Behaviour and API

`SentriUI.row(props)`, `rowSelect(props)`, `rowAction(props)` share one copy renderer in bundle.js and one stylesheet. `variant` identifies the base row job; code and Edit infer animal/record for existing calls. Navigation stays in `rowGroup(content,{title})`. Actions expose `data-action`/`data-value`; host owns routing and sheet state. Selection uses change only: `rowSelectChange(event)` (select + door, with or without the door) returns `{value,checked,action}`. `inputAttrs` carries the host's selection hooks. Door and act are sibling buttons, never nested. Act's accessible name combines its label and row title. The task skeleton's `SentriTask.row` and `door` are thin adapters only.

No hard choice cap for a scrollable list; show only relevant rows and provide search for large collections. Keep touch targets at least `tap-min`; secondary acts use `control-height`. No swipe-only actions.

## Content rules

### Copy budget

| Text | English | 中文 | Lines |
| --- | --- | --- | --- |
| Title | 32 | 16 | 1 |
| Description (line 2) | 44 | 20 | 1 |
| Code | 12 | 12 | 1 |
| Act or trailing word | 12 | 6 | 1 |
| Chip | 12 | 6 | 1 |

Over-budget copy is rewritten to the shortest copy that still names the act; it is never wrapped, shrunk or ellipsised to fit. The “Longest label” state shows real copy at this limit in the real container at 390px. Budgets come from what fits at 390px inside the screen gutters; a `{n}` or `{name}` slot counts as 3 characters. Record, animal and evidence rows may keep `wrap:true` for a second description line only when the data cannot be shortened (a list of names); a title never wraps.

### Writing rules

Sentence case. Pass trailing `{text,tone}`, never injected HTML; legacy strings are escaped. One chip or trailing word, not both. Do not repeat status in title, chip and line 2. Line 2 orders time, counts, codes; colours belong on meaningful token values only.

## Accessibility

Native button and checkbox semantics; inert rows are divs. Checkbox label covers the row; screen readers announce checked state. Use `attrs` for descriptive ARIA, `inputAttrs` for checkbox ARIA. Scope announces current location. No gesture is required. Disabled reason remains readable at full contrast. One-handed targets never overlap.

## Do / don't

Do use a code column and shared Status chip for animals; don't give them navigation icon tiles. Do provide one independent act beside the door; don't nest buttons or add multiple chips. Do omit unavailable actions or explain why; don't fade the row. Do use flat rows in one group; don't put cards on cards.

## Related and classification

Component, absorbing TaskRow's animal/tick/door/door+act faces as variants. The old TaskRow is retired: use Row. `SentriTask.row` and `SentriTask.door` remain only as thin aliases that translate the task skeleton API into `SentriUI.row`, `rowSelect` and `rowAction`, with no markup or CSS of their own. TaskDay is a section arrangement of Row doors, not another row implementation. [Status](../Status/README.md) owns chips, [Button](../Button/README.md) owns acts, [Log](../Log/README.md) owns history, and [ChoiceList](../ChoiceList/README.md) owns form choices. Home task card remains a section pattern.

## Tokens

`row-icon-bg`, `row-icon-ink`, `press`, `green-wash`, `current-marker`, `row-min`, `space-row-y`, `space-row-x`, `animal-row-min`, `animal-id-col`, `row-chip-max`, `tap-min`, `control-height`, type and space scale tokens. No local palette or component CSS pixel sizes.

## References and change log

The repository [component standard](../../../../docs/design-workflow/research/component-standard.md) records primary ADM List and TDesign Cell references, with Material 3 and Apple list guidance. This pass unifies the family, adds state specimens and migrates the real callers; human approval remains separate from implementation checks.

