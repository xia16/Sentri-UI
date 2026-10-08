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

**Status: candidate.** One row anatomy over **three roots**, split by what the root element is. They share one internal copy (code, title, line 2). They were revised after the design panel and are not approved.

| Call | Root | Use |
|---|---|---|
| `row(props)` | `<button>` (with `action`) or `<div>` | The litter row, a done row, every list row. Without the candidate options the output is byte-for-byte unchanged (tested). |
| `rowSelect(props)` | `<label>` around a checkbox | A bulk pick. |
| `rowAction(props)` | `<div>` holding two sibling buttons | The treatment row: the copy is the door, the button records in one tap. |

**Shared options** (all three roots)
- `code`: a leading mono identifier (`A02`) at **`identifier-strong`** (12px/600) in `ink`, in a column `row-code-min` (40px) wide so codes line up down a list. It takes the icon tile's place; `code` and `icon` together warn in development, and the code wins.
- `title` and `description` as **token lists** (the Status card's grammar), with colour on the value only, at 600: `title: [[{ text: 'Overdue' }, { text: '3 days', tone: 'red' }]]`. A token-list description puts a `muted` `·` text node between tokens.
- `mono: true`: line 2 in IBM Plex Mono. This is the row law's line 2 (`2h ago · owed 4 · parity 3`: time, then counts, then codes).
- `chip`: the row's **one** status word (`{ text, tone }`, a Status word at most `row-chip-max` wide). It is the reason this row needs you first (`sow died`, `unlocked`). `chip` and `trailing` together warn in development, and the chip wins.
- `wrap: true`: the title and line 2 wrap instead of truncating (evidence, long mono lines). The row grows; it never truncates a record.
- `id`: a stable root id.

**`row` only**
- `trail`, **one slot**: `'auto'` (the default: a chevron when the row has an `action`), `'chevron'`, `'edit'` (✎: a done row whose tap opens Edit) or `'none'` (the bar acts). An unknown value warns in development.
- `trailing`: a **typed** word before the trail (`{ text, tone, strs, args }`). A plain string is the legacy trusted-HTML path, kept for existing callers; new code passes the object.

**`rowSelect` only:** `checked`, `action` (default `select`), `value`. The whole row is the `<label>`, and the trailing slot is ChoiceList's checkbox. There is no chevron.

**`rowAction` only:** `action` and `value` for the door, and `act` for the one-tap: a Button, secondary by default.
- The act button is **named by its label plus the row title** (`aria-labelledby="<id>-act <id>-title"`), so it reads "Record 12 Iron and tail".
- `act.busy: true` gives the **pending face** after the first tap (`aria-disabled`, `aria-busy`, the label from the host, such as `Recording 12`) until the host settles; then it re-renders.

**States (additions)**
- **Pressed:** a button row and a select row fill `press`. The door of a `rowAction` fills `press` on its own, and the act button presses as a Button.
- **Focus:** a door takes the 3px `focus` ring at 2px offset, inside the row's padding.
- **Selected** (`rowSelect`): the checkbox is checked, and nothing else changes. Selection is a check, never a fill.
- **Busy** (`rowAction`): the act's pending face.
- **Settle:** a committed row may take the one shared `green-wash` flash (DS README, Motion). The host sets it.

**Component contract**
- **Props:** see the table and the lists above. The TypeScript shapes are `RowProps`, `RowSelectProps` and `RowActionProps`, over the shared `RowCopyProps`.
- **Events:**
  - `row`: a click on `<button data-action data-value>`, with the payload `{ value }`.
  - `rowSelect`: **`change` only**, never click. `SentriUI.rowSelectChange(event)` returns `{ value, checked, action }`, or null for anything else.
  - `rowAction`: two click targets, the door (`action`) and the act (`act.action`), each with its own `data-value`.
- **Slots:** the leading code or icon, the title tokens, the line-2 tokens, the chip or trailing word, and the trail. There are no other slots.
- **Ids:** `id` on the root. A `rowAction` also writes `<id>-title` and `<id>-act`, generated when no `id` is given.

**Don'ts**
- Don't put two chips on a row, or a chip beside a trailing word, or say in the chip what line 2 already says.
- Don't colour a whole token when its value can carry the colour.
- Don't nest a button in a button. The two targets of `rowAction` are siblings.
- Don't put icons on list rows (RULINGS: no icons on list rows). The ✎ trail is the one closed-vocabulary glyph.

**Strings (additions)**
- `strs: { code }` and `args: { code }`.
- Token parts take their own `strs: { text }` and `args: { text }`.
- `chip` and a typed `trailing` take Status's `strs: { text }`; `act` takes Button's `strs: { label }`.
- The separator is `ds.sep`.
