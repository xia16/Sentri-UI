# Row

Row presents one item and its next action in a consistent list anatomy. Use [Log](../Log/README.md) instead for an event timeline and [Facts](../Facts/README.md) for a static fact grid.

## When to use

Use in groups of places, animals, bulk selections, scope choices, counts, or editable records. The same job with different content stays in this family.

## When not to use

Use [Field](../Field/README.md) for typed input, [ChoiceList](../ChoiceList/README.md) for short single-choice forms, and the section pattern `sections/home/patterns/home-task-card` for Home's task progress card. That card is not a row and remains unchanged. Optional inputs are optional rows in record sheets; Row does not replace OptionalRow.

## Anatomy

Leading selection box (select + door only: a 24px box in a 48px hit area, always on the left), tick mark (tick only: an empty ring when due, a check disc when ticked; 24px, the whole row is the target), identity (optional code with one Status chip below it), navigation icon tile (optional, replaces identity), title, line 2 (optional), typed trailing word/count (optional), trail (chevron or Edit, optional; none when disabled), and one act button (door + act only). Icon tiles belong only to navigation lists of places or actions and to verb tiles; never animal or record rows. Chips use `SentriUI.status({variant:'chip',kind,text})`.

## Variants

- **Navigation**: places or actions, icon tile, title, line 2 and chevron inside `rowGroup`; Inspection actions and Piglet more actions.
- **Tile** (`rowTile`, in a `rowGrid`): the everyday verbs of More actions (owner, 2026-10-19). One action as a 48px icon well (the navigation icon's colours) over one 13px word: the short verb ("Treat"). Its accessible name starts with that word and adds the full action name when the name does not already hold it ("Condition, Disease or symptom"; "Record treatment" already holds "Treat"), so voice control can say what it sees. `rowGrid(tiles, {more, expanded, label})` lays them in one panel in two rows (one only for a single tile), split evenly so row two is never short by more than one (5 = 3+2, 6 = 3+3, 8 = 4+4, 10 = 5+5), at most five across. `tone: 'danger'` is the one irreversible verb (Death): red ink on its well and word, never folded and always the last tile. Over ten tiles, nine show and `more` sits just before Death; opening it (`expanded`) shows every tile in even rows of at most five (11 = 4+4+3), the one case of a third row. The words come from the strings registry (`actions.tile.*`), each with its Chinese. Verbs that need a line to explain them (Production) stay navigation rows below the grid.
- **Animal**: one animal in a list. Designed from Farrowing room + Inspection walk, owner-approved 2026-10-11/12. Used by the Farrowing room list, Find a sow, Scan results and the task's sow list, and by the Inspection walk (a select + door row) and Find a pig. It is drawn when the caller passes `right`. Left, always the same: the ID (`code`, 16px/600 mono, ink) over one 13px muted context line (`description`); `contextWidth` (`112px` on the walk) fixes the left column and the context then ends in an ellipsis. Right, one of two (`right`), right-aligned:
  - **State** (`right: { kind: 'state', figure, word, level }`): the figure (16px) over the state word (13px). `level`: **act** (figure 700 and word in `red-ink`, the word led by the 15px solid "!" circle: overdue, a sow died with piglets to allocate; the only icon in a row), **live** (figure 700 ink: farrowing), **soon** (figure 500 ink, word muted: due today or tomorrow), **settled** (word muted, figure in `ink-2` so it holds 7:1: done, due in 2+ days, aborted).
  - **Tags** (`right: { kind: 'tags', tags: [{ name, icon?, level }] }`): one line of compact [ConditionTags](../ConditionTag/README.md) (`level` act, watch, ongoing), drawn in that order. The screen calls `SentriUI.rowFitTags(root)` after render, fonts and resize: tags show in order until the line is full, the rest fold into `+N`, and the first (urgent) tag never hides. The screen owns short names (Poor appetite becomes `Appetite` with the `trend-down` glyph) and passes no day or care word.
  - **Group** (`lead`, `count`, with `right: { kind: 'tags' }`): animals without an ID as one row, owner 2026-10-18 (Inspection: a pen's pigs without ear tags). The name is the count (`14 pigs`, sans 600) after a muted `lead` glyph (`tag-off`); the tags take the context line and fold the same way; no chevron; a 48px count field ends the row, always there, so the row keeps the Animal height ticked or not (`count.idle`: not ticked, the number in `ink-2` at 500, which holds 7:1).
  The new layout has no status chip under the ID, no headline beside the ID and no mono meta line. The row's own chevron ends it; no pencil.
- **Animal (classic)**, until migrated: without `right`, the row is the older animal row (code column, status chip, headline, meta line), unchanged. Piglet processing's lists (several items per animal), Weaning handoff and Pig profile still use it. Not for new lists.
- **Tick in place**: an item ticked before saving (`mark: 'due' | 'ticked'`). A due item shows the ring, a ticked one an ink disc with a white check, and the row takes `well`; a ticked item is a draft and never shows a Done chip. Done is said only for a saved item (see Done / record). No chevron. Piglet day list.
- **Select + door** (`rowSelectDoor`): a list that selects for a bulk act and opens items. The leading box toggles selection; the door (text column, then a small fixed chevron) opens the item. They are sibling targets, never nested. Without a door (`rowSelect`) the whole row is a label that only selects, the same box on the same side. Inspection pig rows use the door; the Inspection and Feed plan pen header box is the no-door case (box only, with the pen door beside it; `fill: false`, so the tick doesn't tint its cell, owner 2026-10-18).
- **Plain**: a row with no icon, code, mark or trail (a Show/Hide toggle) reports `data-variant="plain"`, not navigation.
- **Door + act**: details opens a sheet; a sibling act records or removes in one tap. Piglet task sheets and Inspection review.
- **Scope**: workbench choose-unit; trailing count word and `aria-current="location"` for the current unit.
- **Summary count**: Farrowing overview; trailing number, inert at zero and a button above zero. Zero rows intentionally retain category coverage and say why the list is empty; no disabled chevron.
- **Done / record**: full evidence wraps, with Edit; Piglet done rows. Any row with a Done chip or an Edit rail reports `record`.

## States

| State | Rendering and behaviour |
|---|---|
| Default | Native button, checkbox label, or inert div according to job. |
| Pressed | One step deeper than the surface (`--st-press`: `press` on a white card, `choice-press` on a tinted one) on every tappable face; `attrs: {'data-preview':'pressed'}` demonstrates it statically. |
| Selected | Native checked checkbox, never colour alone. Tick: the ink check disc. |
| Ticked | Tick only: ink disc and a `well` row, no Done chip until saved. |
| Current | `aria-current="location"`: an ink ✓ in the right rail and a 600 title, no fill and no bar. |
| Disabled | Prefer omission. If retained, pass `disabled` and `reason`: a visible reason line replaces line 2 and the chevron is dropped; no opacity face. |
| Loading | `act.busy` prevents repeated act while the host settles; label says Recording. |
| Error | Host supplies actionable reason in line 2 and Retry act; no colour-only error. |
| Empty | Summary count zero is inert and says No sows due today. Empty groups are omitted with a separate reason. |
| Long label / Chinese | Wrap evidence and animal content; no clipping of identifiers or status chips. Animal: the ID wraps and the row grows; the figure never wraps (a value long enough to wrap needs another component); on the tags side the context ends in an ellipsis and a tag is never cut: it folds into `+N`. |

Every applicable state appears in [variants.json](variants.json) and `variants/<id>.html`.

## Behaviour and API

`SentriUI.row(props)`, `rowSelect(props)`, `rowAction(props)` share one copy renderer in bundle.js and one stylesheet. `variant` identifies the base row job; code and Edit infer animal/record for existing calls. Navigation stays in `rowGroup(content,{title})`. Actions expose `data-action`/`data-value`; host owns routing and sheet state. Selection uses change only: `rowSelectChange(event)` (select + door, with or without the door) returns `{value,checked,action}`. `inputAttrs` carries the host's selection hooks. Door and act are sibling buttons, never nested. Act's accessible name combines its label and row title. The task skeleton's `SentriTask.row` and `door` are thin adapters only.

No hard choice cap for a scrollable list; show only relevant rows and provide search for large collections. Keep touch targets at least `tap-min`; secondary acts use `control-height`. No swipe-only actions.

## Content rules

Sentence case. Aim for titles ≤32 English characters or 16 Chinese characters, descriptions ≤64 English characters or 32 Chinese characters, codes ≤12 characters, acts ≤12 English characters or 6 Chinese characters. These are authoring limits, not destructive truncation limits. Navigation may ellipsize secondary copy (`wrap:false`); evidence, animal and record rows use `wrap:true`. Never truncate a record. Pass trailing `{text,tone}`, never injected HTML; legacy strings are escaped. One chip or trailing word, not both. Do not repeat status in title, chip and line 2. Line 2 orders time, counts, codes; colours belong on meaningful token values only.

## Accessibility

Native button and checkbox semantics; inert rows are divs. Checkbox label covers the row; screen readers announce checked state. Use `attrs` for descriptive ARIA, `inputAttrs` for checkbox ARIA. Scope announces current location. No gesture is required. Disabled reason remains readable at full contrast. One-handed targets never overlap.

## Do / don't

Do use the animal row for animals (ID over context, state or tags on the right); don't give them navigation icon tiles, a chip under the ID or a second icon beside the "!". Do wrap evidence; don't clip Chinese text. Do provide one independent act beside the door; don't nest buttons or add multiple chips. Do omit unavailable actions or explain why; don't fade the row. Do use flat rows in one group; don't put cards on cards.

## Related and classification

Component, absorbing TaskRow's animal/tick/door/door+act faces as variants. The old TaskRow is retired: use Row. `SentriTask.row` and `SentriTask.door` remain only as thin aliases that translate the task skeleton API into `SentriUI.row`, `rowSelect` and `rowAction`, with no markup or CSS of their own. TaskDay is a section arrangement of Row doors, not another row implementation. [Status](../Status/README.md) owns chips, [Button](../Button/README.md) owns acts, [Log](../Log/README.md) owns history, and [ChoiceList](../ChoiceList/README.md) owns form choices. Home task card remains a section pattern.

## Tokens

`row-icon-bg`, `row-icon-ink`, `press`, `choice-press`, `row-min`, `space-row-y`, `space-row-x`, `animal-row-min`, `animal-id-col`, `row-chip-max`, `tap-min`, `control-height`, type and space scale tokens. No local palette or component CSS pixel sizes.

## References and change log

The repository [component standard](../../../../docs/design-workflow/research/component-standard.md) records primary ADM List and TDesign Cell references, with Material 3 and Apple list guidance. This pass unifies the family, adds state specimens and migrates the real callers; human approval remains separate from implementation checks.

