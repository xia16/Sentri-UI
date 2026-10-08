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

## Candidate additions ([ADR 0002](../../adr/0002-candidates-2.md))

**Status: candidate.** The `radio` mode, `choiceRadios`, `radioBind`, and mono labels. They were revised after the design panel and are not approved.

**`radio` mode:** `choiceRow({ mode: 'radio', selected, tabindex })`, inside `choiceGroup(rows, { radio: true })`
- Use it for one-of-several choices where the unchosen options must read as choosable (RULINGS craft pass: "Radios are visible"). `single` draws only a check on the chosen row, so an unchosen list reads as plain text.
- **Anatomy:** the ChoiceList row at **`radio-row-min` (60px, ruled)**, with the ring in the 24px trailing slot (on the right).
  - The ring is `radio-size` (20px), a `ring-width` (2px) `muted` ring on `paper` (the rulings' ink3 maps to `muted`).
  - Selected: an `ink` ring and a `radio-dot` (10px) `ink` dot, and the label goes to **`type-weight-strong` (700)**.
  - The whole row is the target.
- **Semantics:** `role="radio"` and `aria-checked` on the row. The panel is the `role="radiogroup"`, labelled by the group heading.

**`choiceRadios({ label, options, selected, action, key, layout, optional, clear, id })`**: the radio field in one call
- `layout: 'rows'` (the default): a titled ChoiceList group of radio rows. Options take `{ value, label, meta, mono }`.
- `layout: 'inline'`: the **Choice** field of the record-sheet law, for two or three short outcomes (the sex field).
  - It has the Stepper's silhouette: the label (14px/600, with an optional `muted` word) on the left, the options on the right.
  - Each option is a ring and its word, at least `back-width` wide and 60px tall; the selected word is 700.
- **Optional fields clear through a visible `Clear`:**
  - While an optional field (`optional` set) holds a value, a `Clear` text action shows: at the right end of the rows' heading, or under the inline label.
  - `data-action` is `"<action>-clear"` and `data-value` is the field key. Tapping the chosen radio again does nothing.
  - An inline optional field **reserves the Clear slot** (44px) even when nothing is chosen, so the row never changes shape.
- A fifth outcome makes it a picker; four long ones use rows.

**Mono labels:** `mono: true` on a row or an option sets the label in IBM Plex Mono. **It is for Latin letter and digit codes only** (crate codes, ear tags: `A02`, `000254`). Other text warns in development.

**States (radio)**
- **Default:** every option shows its ring. Nothing is chosen until the worker chooses (missing, never a default).
- **Selected:** the ink ring and dot, and the label at 700. In an optional field, `Clear` is present.
- **Pressed:** `choice-press` on a row, `press` on an inline option.
- **Focus:** rows take the 3px `focus` ring inset −3px (the panel clips outside rings). Inline options take it at 2px offset.
- **Disabled:** not drawn. Leave out an option that can't be taken.
- **Error, loading, empty:** not drawn. An empty group is absent.

**Component contract**
- **Props:**
  - `choiceRadios({ label, optional, options: [{ value, label, meta, mono, strs, args }], selected, action = 'choose', key, layout: 'rows' | 'inline', lead, clear, id, className, strs: { label, optional, clear }, args })`. An unknown `layout` warns in development.
  - `choiceRow({ mode: 'radio', selected, tabindex, mono })`.
  - `choiceGroup(rows, { radio, aside, id })`. `aside` is raw HTML at the heading's right end.
- **Ids:** the root, or the group heading, is `<id>` / `<id>-title`; Clear is `<id>-clear`.
- **Events:**
  - Each option is `<button role="radio" data-action="<action>" data-value="<option>">`, with the field key in `data-field` (on each row, or on the inline root). The payload is `{ field: data-field, value: data-value }`; the host sets the value and re-renders.
  - `Clear` has the payload `{ field: data-value }`; the host sets the field to missing.
- **Keyboard:** `SentriUI.radioBind(root, { onChange(field, value) })` gives the standard radiogroup model.
  - ArrowDown and ArrowRight move to the next option, ArrowUp and ArrowLeft to the previous (both wrap), and Home and End jump to the first and last. Each move selects the option and focuses it.
  - Space and Enter select through the ordinary click.
  - The pure rule is `SentriUI.radioNext(values, current, key)`, which the tests cover.
- **Roving tab stop:** the selected option, or the first, has `tabindex="0"`; the others have `-1`.
- **Focus return:** after `Clear`, focus moves to the group's tab stop (the first option), through `SentriUI.handFocus(clearButton, firstOption)`, because Clear itself leaves the page. If focus is elsewhere, it stays there.
- Re-render by patching the group, and keep it mounted so focus survives.

**Strings (radio)**
- `choiceRadios` takes `strs: { label, optional, clear }` and `args`; each option takes `strs: { label, meta }` and `args`.
- `clear` defaults to "Clear" (`act.clear`).
- Without `strs` the output is unchanged.
