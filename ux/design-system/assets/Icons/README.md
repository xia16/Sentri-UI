# Icons

The 52 glyphs of the `SentriIcons` registry (`ux/system/sentri-icons.js`). Each file is one of them, saved as a standalone SVG.

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
- `backspace` (candidate, ADR 0001) deletes the last typed character on the Numpad. It is the 53rd glyph: it lives in the bundle's `SentriIcons` and in `backspace.svg` here, not yet in `ux/system/sentri-icons.js` or the artifact's asset blobs.

**Known quirk**
- `grid` draws its second and fourth squares back to x = 3. This comes from the source, and the file keeps it as is.
