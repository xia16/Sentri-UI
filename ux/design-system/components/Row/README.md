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

## Candidate additions ([ADR 0002](../../adr/0002-candidates-2.md))

**Status: candidate.** These are options on the one Row, not new cards: the room's litter row, the treatment row with a one-tap, the done row whose evidence wraps. Not approved. Without these options the output is byte-for-byte unchanged.

**Options**
- `code`: a leading mono identifier (`A02`) at `identifier` size, 600, in `ink`, in a column `row-code-min` (40px) wide so codes line up down a list. It takes the icon tile's place; a row has one or the other.
- `title` and `description` as **token lists** (the Status card's grammar), with colour on the value only: `title: [[{ text: 'Overdue' }, { text: '3 days', tone: 'red' }]]`. A token-list description draws a `muted` `·` between tokens.
- `mono: true`: line 2 in IBM Plex Mono. This is the row law's line 2 (`2h ago · owed 4 · parity 3`: time, then counts, then codes).
- `chip`: the row's **one** status word (`{ text, tone }`, a Status word at most `chip-max` wide). It is the reason this row needs you first (`sow died`, `unlocked`).
- `wrap: true`: the title and line 2 wrap instead of truncating (evidence, long mono lines). The row grows; it never truncates a record.
- `rail`: the right end. The default is a chevron when the row has an `action`. `'edit'` draws ✎ (a done row, whose tap opens Edit). `'none'` leaves it empty (the bar acts).
- `select: { checked, action, value }`: select mode, for a bulk pick. The row is a `<label>` and the trailing slot is ChoiceList's checkbox. There is no chevron, and tapping anywhere toggles.
- `act: { label, action, value, strs, args }`: **two targets**. The copy becomes the door (`action`, with an inline ›) and a secondary Button on the right acts in one tap (`Record 12`). The root is a `<div>` holding two sibling buttons; they are never nested.

**Composed shapes** (task-level names for one card)
- Litter row: `code`, a token `title`, a `mono` token `description`, an optional `chip`, `wrap`.
- Treatment row: `act`.
- Evidence row: `wrap` and `rail: 'edit'` on a done row.

**States (additions)**
- Pressed: a button row and a select row fill `press`. The door of an `act` row fills `press` on its own, and the act button presses as a Button.
- Focus: a door takes the 3px `focus` ring at 2px offset, inside the row's padding.
- Selected (select mode): the checkbox is checked, and nothing else changes. Selection is a check, never a fill.
- Settle: a committed row may take the one shared `green-wash` flash (DS README, Motion). The host sets it.

**Don'ts**
- Don't put two chips on a row, or say in the chip what line 2 already says.
- Don't colour a whole token when its value can carry the colour.
- Don't put icons on list rows (RULINGS: no icons on list rows). The ✎ rail is the one closed-vocabulary glyph.

**Strings (additions)**
`strs: { code }` and `args: { code }`. Token parts take their own `strs: { text }` and `args: { text }`. `chip` takes Status's `strs: { text }`, and `act` takes Button's `strs: { label }`.
