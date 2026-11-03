# Icons

The canonical icon registry lives in `ux/design-system/components/bundle.js`. This folder is a historical, incomplete set of standalone exports; use the registry for current glyph names and shapes.

**How the files are drawn**
- Stroke `ink` (#20291f), 1.6 wide, with round caps and joins, on a 24×24 viewBox.
- Because an `<img>` can't inherit colour, the files are for documents and mockups only.

**In product code**
- Call `SentriIcons.icon(name)`. Don't use these files: the registry's inline SVG takes `currentColor` from its text.

**What the glyphs mean**
- Each glyph has one meaning: the table and the rules are in the [Icon card](../../components/Icon/README.md#one-meaning-per-icon).
- The farm glyphs most screens use: `pig` (any pig: sow, gilt, boar, piglet), `batch`, `farrow`, `pregnancy`, `service`, `heat`, `return-heat`, `death`, `transfer` (move pigs), `truck` (pigs leaving the farm), `sample`, `count`, `pen`, `feed`, `health`, `treat`.
- Controls: `chevron` means more, `back` returns, `check` is done or selected, `filter` opens filters, `scan` reads an ear tag, `more` (···) is every Actions button, `undo` undoes the last save.
- `offline` means no signal, and `upload` means records waiting to upload.
- `backspace` (candidate, ADR 0001) deletes the last typed character on the Numpad. Its standalone export is `backspace.svg`; the live glyph is in `SentriIcons`.

**Current source**
- The registry's `grid` path draws four separate squares. Do not use an older exported shape in place of it.
