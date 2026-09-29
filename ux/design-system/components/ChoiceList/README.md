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

**Strings**
`choiceRow` takes `strs: { label, meta }`, `choiceGroup` `strs: { title }`, `choiceEmpty(text, { strs: { text } })`, each with an `args` twin. `choiceSearch` label and placeholder are attributes and have no twin. Without `strs` the output is unchanged.
