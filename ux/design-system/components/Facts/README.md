# Facts

Read-only label and value pairs in a panel: the reading half of a detail page.

Use [Row](../Row/README.md) instead for a figure the worker taps or edits; use [TaskMetrics](../TaskMetrics/README.md) for headline figures that carry a total.

Call `SentriUI.facts(items, { columns })`. Each item is `{ label, value | valueHtml, mono, meta, inline }`. `variant: 'record'` is the form Farrowing uses on a finished litter. `variant: 'figures'` is the headline-figure form (below).

## When to use / when not to use

- Use it to show what is on record about one thing: a pen sheet's litter figures, a feed formula, a sow's origin.
- Do not use it for anything the worker acts on. **Facts never act**: no button, link or › inside a value or a cell. A figure that opens a sheet is a [Row](../Row/README.md), or a link below the facts (a text [Button](../Button/README.md)). `valueHtml` that holds a button or link is refused in development and drawn as the plain `value`.
- Do not use it for a table of many rows with columns (use [TaskTable](../TaskTable/README.md)).
- Figures (`variant: 'figures'`): use it for the two or three figures a sheet is about to commit (`Born 14 · Alive 9 · Dead 5` before Finish farrowing) and for a summary of counts at the head of a record. Not for a fact with a unit, a trail or a long value (Two-column), more than three figures, or a figure that opens something (a figure with a door is a [Row](../Row/README.md) or a link below).

## Anatomy

- **Panel**: the `st-panel` surface, `space-panel` padding.
- **Label** (required): 13px `muted` (`type-description-size`).
- **Value** (required): 16px `fact-value`, weight 500; with units written out (`24.6 kg`).
- **Meta** (optional): a 13px `muted` line under the value, for the trail: `Jul 8 · 07:14 · G.H`.

## Variants

- **Two-column** (default) — label over value, two to a row. [variants/two-column.html](variants/two-column.html)
- **Three-column** (`columns: 3`) — three short counts side by side. [variants/three-column.html](variants/three-column.html)

A `columns: 1` form exists for a single long value on the full width; Piglet processing's litter and move pages and Data sync use it, but it has no variant page. Prefer two-column and let the value wrap.

- **Figures** (`variant: 'figures'`) — label over a large figure, two or three across. [variants/figures.html](variants/figures.html)

**Figures** (`SentriUI.facts([{ label, value }, ...], { variant: 'figures', panel })`): items are `{ label, value }` only (no meta, mono or valueHtml). Two or three items set the columns (`columns: 2 | 3` overrides). It is a `panel` by default (`st-panel`, 14px padding, 12px between cells); `panel: false` when the host is already the surface (a Panel, or the count drawer's record), and the host sets the space below it. Label 13px `muted`; figure 23px, weight 600, tabular numerals, 4px under the label. The label is a short noun (about 12 characters); the figure is a count or a short number. Farrowing draws it on the Finish page (Born · Alive · Dead), the count drawer's litter record (Born · Dead) and the litter summary. It replaces the hand-built `finish-totals` grid.

**Record** (`variant: 'record'`): no panel surface of its own (the caller wraps it in a [Panel](../Panel/README.md)), 13px label over a 14px value in tabular figures. An item with `inline: true` takes the full width, label and value on one line (Farrowing's litter weight).

## States

Facts are static text.

| State | Rendering |
|---|---|
| Default | label over value |
| Pressed, selected, disabled, error, loading | none: facts hold no controls |
| Empty value | `null` or blank renders an em dash `—`. `0` is a value and renders `0` |
| Empty set | the whole panel is absent when every fact is missing |
| Long value | wraps at word breaks; an ID (`mono: true`) never breaks mid-ID |
| Chinese | same layout; labels wrap in the column |

## Behaviour

None. Facts have no click handler.

## Content rules

- Values are formatted by the caller, with units: `182 kg`, `Parity 4`, `0 of 12`.
- Labels: sentence case, a noun, 24 characters or fewer, wrapping to a second line rather than truncating.
- A missing value is an em dash only when the record really lacks that fact. Leave out a fact that cannot exist for this animal.
- Trails (when · who) go in `meta`, with initials: `G.H`.
- IDs (ear tags, pens, batches) use `mono: true`: set in `IBM Plex Mono`, never broken.

## Accessibility

- Role: a description list (`dl` with `dt` label and `dd` value), so a screen reader reads each pair together.
- Nothing to operate: the screen reader reads it as a list.
- Target size: not applicable, because there are no targets. This is why a tappable fact is forbidden: a 26px `›` inside a cell fails the glove floor.

## CSS variables

`--type-description-size` (label), `--type-fact-value-size` (value), `--type-meta-size` (meta), `--space-panel` (padding), `--space-18` and `--space-20` (gaps), `--muted`, `--ink`, `--font-mono` (IDs).

## Do and don't

- Do put a figure the worker edits in a [Row](../Row/README.md) next to the facts, or one link below them.
- Do write a missing value as `—` and a real zero as `0`.
- Don't put a `›`, a button or a link in a fact.
- Don't repeat in the facts what the page header already says.

## Strings

Per fact `strs: { label, value, meta }` and `args: { value: {...} }` (value ids are ignored when `valueHtml` is set); without `strs` the output is unchanged.

## Related components

[Row](../Row/README.md) · [Panel](../Panel/README.md) · [Heading](../Heading/README.md) (the section heading above the panel) · [TaskMetrics](../TaskMetrics/README.md).

## Classification

Component, with three variants (two-column, three-column, figures).
