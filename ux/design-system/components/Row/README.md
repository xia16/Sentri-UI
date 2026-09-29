# Row

The list unit: an optional icon tile, a title over a description, and an optional trailing slot. A row with an action is a button and ends in a chevron. Rows are grouped in a panel with `rowGroup`.

Call `SentriUI.row({ title, description, icon, action, value, trailing, disabled, attrs })`. To wrap rows in a panel with an optional group label, call `SentriUI.rowGroup(rowsHtml, { title })`.

**How it looks**
- Minimum height `row-min` (68px), with `space-row-y` × `space-row-x` (12 × 14) padding.
- The title is 13/500. The description is 11px `muted`. Both truncate with an ellipsis.
- A `rule` hairline separates rows. There is never a rule above the first row.
- The leading icon is 18px in a 34px `row-icon-bg` tile, stroked in `row-icon-ink`.

**What the caller provides**
- `title`: the fact, in sentence case.
- `description`: the memory line. Use relative times and counts on open rows ("3 sows due today"). Use stamps only on done rows.
- `action` and `value`: the component writes these as `data-action` and `data-value`, and your delegated click handler routes on them.
- `trailing`: a status word or a count, never a second chip.

**States**
- Pressed rows fill with `press`.
- The row you are standing in takes `attrs: { 'aria-current': 'location' }`. It gets `green-wash` and the 3px `current-marker`.
- `disabled` exists, but prefer omission. Leave out a row that can't be acted on, and add one line saying why.

**Strings**
`row` takes `strs: { title, description, trailing }` and `args`; with `strs.trailing`, `trailing` is escaped fallback text instead of trusted HTML. `rowGroup` takes `strs: { title }` and its root is `data-ds="Row"`. Without `strs` the output is unchanged.
