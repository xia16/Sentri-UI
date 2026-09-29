# Facts

A grid of label–value pairs inside a panel. It is the reading half of a detail page.

Call `SentriUI.facts(items, { columns })`. Each item is `{ label, value | valueHtml, meta }`.

**How it looks**
- Two columns by default. Use `columns: 3` for short numeric facts, or `1` for long values.
- Labels are 11px `muted`. Values are 14px/500 `fact-value`. `meta` is a 10px line under the value.

**What the caller provides**
- Values already formatted, with their units: `182 kg`, `Parity 4`, `Mated 21 days ago`.
- An empty or null value renders an em dash. Use this only for a fact the record really lacks. When a whole group of facts is missing, leave the group out.
- Trails (when · who) go in `meta`, not in the value.

**Do and don't**
- Put IDs in `valueHtml` with `font-family:var(--mono)`, so an ear tag reads as an ID.
- Don't put actions in facts. A detail page reads; it never acts.

**Strings**
Per fact `strs: { label, value, meta }` and `args: { value: {...} }` (value ids are ignored when `valueHtml` is set); without `strs` the output is unchanged.
