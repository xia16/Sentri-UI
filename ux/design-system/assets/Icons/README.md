# Icons

The canonical icon registry lives in `ux/design-system/components/bundle.js`. This folder is a historical, incomplete set of standalone exports; use the registry for current glyph names and shapes.

**How the files are drawn**
- Stroke `ink` (#20291f), 1.6 wide, with round caps and joins, on a 24×24 viewBox.
- Because an `<img>` can't inherit colour, the files are for documents and mockups only.

**In product code**
- Call `SentriIcons.icon(name)`. Don't use these files: the registry's inline SVG takes `currentColor` from its text.

**What the common glyphs mean**
- `chevron` means more.
- `back` means return.
- `check` means done or selected.
- `filter` opens filters.
- `scan` reads an ear tag.
- `farrow` stands for farrowing, `pregnancy` for the pregnancy check, `feed` for feed, `health` for health and `treat` for treatment.
- `transfer` means move.
- `offline` means no signal, and `upload` means records waiting to upload.
- `backspace` (candidate, ADR 0001) deletes the last typed character on the Numpad. Its standalone export is `backspace.svg`; the live glyph is in `SentriIcons`.

**Current source**
- The registry's `grid` path draws four separate squares. Do not use an older exported shape in place of it.
