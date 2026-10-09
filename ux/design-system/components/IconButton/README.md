# IconButton

A square, icon-only button for toolbar tools such as filter, search, scan or more, with an optional count badge.

Call `SentriUI.iconButton({ icon, label, action, value, badge, disabled, className })`.

**How it looks**
- The canonical toolbar control is `className: 'room-filter-button'`: 48×48, `paper`, a 1px `line` border and `radius-control`. Use it for every room and list screen.
- Without that class, the button is a borderless 48px (`tap-min`) target, as in headers.
- `badge` renders a 17px `ink` disc with a mono count, for example the number of applied filters.

**What the caller provides**
- `label`, which is required. It becomes the `aria-label`: "Filter", "Search", "More actions".
- An icon from the registry: `SentriIcons.icon('filter')`.

**Do and don't**
- Use an icon button only for a tool whose glyph is universal. Every verb gets a labelled button or tile.
- When a filter is applied, show the badge and the one-line "Filtered · …" summary with a Clear action. Don't rely on the badge alone.

**States**
- Default: a 48px (`tap-min`) borderless target, or the 48px bordered `room-filter-button`. With a `badge`, a 17px `ink` disc sits on the corner.
- Pressed: not drawn. The stylesheet has no hover or active rule for it.
- Disabled: `disabled` gives it the flat grey fill and `#92998d` glyph that every disabled button takes. Prefer omission: leave out a tool that can't be used.
- Focus: the global 3px `focus` ring at 2px offset.
- Error, loading, empty: not drawn. A filter with nothing applied shows no badge.

**Strings**
Optional `strs: { badge }` and `args` for the count badge. `label` is an `aria-label` attribute and has no `data-str` twin.
