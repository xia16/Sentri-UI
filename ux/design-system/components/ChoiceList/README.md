# ChoiceList

The chooser: one row shape for every list of choices, whether flat, sectioned or nested. Every row has a label, an optional meta line and one 24px trailing slot on the right.

Compose it from four calls:
- `SentriUI.choiceRow({ label, meta, mode, action, value, selected })`
- `SentriUI.choiceGroup(rows, { title, lead })`
- `SentriUI.choiceSearch({ label, placeholder })`
- `SentriUI.choiceEmpty(text)`

**Modes**
- `navigate`: the trailing slot is a `muted` chevron. The row opens the next level under a new sheet title.
- `single`: the trailing slot shows an `ink` check when selected, and the label goes to 600.
- `multi`: the trailing slot is a checkbox.

**Shapes**
- A flat list is one group with no title.
- A sectioned list is several titled groups.
- A nested list is navigate rows that lead to a leaf list.
- Search, when present, sits above everything.

**What the caller provides**
- Labels in the farm's own words.
- `meta`: only when it separates two similar options ("Last used yesterday", a dose).
- `lead`: an optional control between a group's heading and its panel, such as a segment that filters only that group.

**Rules**
- Row geometry never varies: at least 56px (`choice-row-min`), with a `rule` between rows.
- Selection is a check or a checkbox, never a filled rectangle inside the panel.
- A search with no results renders `choiceEmpty` ("No medicines match 'amox'").

**States**
- Default: a row of label, optional meta and the 24px trailing slot. Navigate rows show a `muted` chevron.
- Selected: a `single` row shows the `ink` check and its label goes to 600 (`aria-pressed`). A `multi` row shows a checked checkbox in `ink`.
- Pressed: a row fills `#eaf0e2` while pressed.
- Disabled: not drawn. `choiceRow` has no `disabled` option and the stylesheet has no disabled rule. Leave out a choice that can't be taken.
- Focus: not drawn by this card. Rows inherit the global 3px `focus` ring on buttons and checkboxes.
- Error, loading: not drawn.
- Empty: `choiceEmpty` prints a `muted` 13px line in place of the panel ("No medicines match 'amox'"). An empty section is otherwise absent.

**Strings**
`choiceRow` takes `strs: { label, meta }`, `choiceGroup` `strs: { title }`, `choiceEmpty(text, { strs: { text } })`, each with an `args` twin. `choiceSearch` label and placeholder are attributes and have no twin. Without `strs` the output is unchanged.
