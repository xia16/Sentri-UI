# Icon

The shared glyph registry. `SentriIcons.icon(name)` returns an inline `<svg viewBox="0 0 24 24">`, and `SentriIcons.paths` holds every path.

**How it looks**
- Each glyph is a single open-stroke path on a 24px grid.
- The stylesheet sets `fill:none; stroke:currentColor` with round caps and joins.
- Stroke width is 1.6 at 14–18px, and 1.8–2 for checks and trails.

**What the caller provides**
- The size and colour, through the container. An icon inherits its text colour.

**Rules**
- Every screen draws from this registry. Add a new glyph here, never inline in a screen.
- An unknown name falls back to the chevron, so check spellings against `IconName` in the types.
- Icons support a word. They never replace one.
- Known source quirk: the `grid` path draws its second and fourth squares back to x = 3 (`M14 3h7v7H3z`). Copied here as is.
