**Status: candidate** — extracted from the archived tag / weigh pad and the ratified one-pad grammar (ds/field-cards, 2026-09-29). Not approved; the design panel reviews it before any slice builds on it as final.

# Numpad

The one type-to-set pad, product-wide. It exists only where typing is real input — ear tags and weights — and never for counts (those are Steppers). Two uses, one grammar:
- **Under a Measure**: keys only. The Measure above is the readout.
- **A run of values in sequence** (the tag / weigh run, piglet after piglet): a readout naming the subject and field, a hint, the running list of the last three recorded, then the keys.

Call `SentriUI.numpad({ label, value, unit, placeholder, suggested, decimals, maxLength, recent, key, action, tone, hint })`. Each key is a `<button data-action="numpad" data-value="<key>" data-key="0–9 | . | back">`. The caller owns the typed string and re-renders on every key.

**Anatomy**
- Keys: a 3-column grid, 8px gaps, in the thumb zone at the bottom: `1 2 3 · 4 5 6 · 7 8 9 · [.] 0 ⌫`. Each key is 56px high, full column width, `paper`, 1px `control-border`, `radius-control`, digit in mono `figure` 21px/500. ⌫ is the registry's `backspace` glyph at 20px, stroke 1.8, with a spoken label.
- The decimal key exists only when `decimals > 0` (weights). For whole-number fields (ear tags) its slot stays an empty gap, so 0 and ⌫ never move between fields. The key is `.`, never `·`, which the copy law keeps as the separator.
- Readout (sequence use): label in `panel-title` 12px/600 (`Piglet 5 of 11 · ear tag`), then the same box as an active Measure — `ink` 2px border, mono `figure` value, caret, unit when there is one.
- Running list: newest first, at most three, mono `identifier` 12px `muted`, indented to the value's left edge (`000257 · 1.51 kg`).
- No commit key. The surface's bar holds the one primary (`Record · next piglet`, or the drawer's `Save`); a pad OK/Enter would be a second primary.

**States**
- Default: typing — digits in `ink`, caret after them.
- Empty: the readout holds only the caret; ⌫ wears the floor-gray.
- Suggested (`suggested: true`): the next tag in sequence (auto-increment) is pre-filled in `muted` with no caret; the first digit replaces it, a scan overrides it. ⌫ is floor-gray until something is typed.
- Full: at `maxLength` digits (tags) or at `decimals` places (weights), every digit key and `.` wear the floor-gray; only ⌫ is live.
- Pressed: the key scales to .96 and fills `press`; no transform under reduced motion.
- Disabled — the floor-gray family: a key with nothing to do (⌫ on empty, `.` after a point, digits when full) fills `disabled-fill` with `disabled-ink`, `aria-disabled` so a tap still reaches the host. Nothing else is ever grayed.
- Focus: a 3px `focus` ring offset 2px on the key.
- Error (`tone: 'error'`): a value that cannot be recorded as typed — a tag already in use. The readout border turns `red`, the hint says where (`000254 is already on crate B04`) and the bar's primary is withheld by the host.
- Out of range (`tone: 'warn'`): a weight outside the usual for the day-age — `amber` hint with a dot, the value still records.
- Loading: none.

**What the caller provides**
- `decimals` (0 for tags, 2 for piglet weights, 1 for litter weight) and `maxLength` (6 for a farm's ear tags).
- The label with the subject's position in the run (`Piglet 5 of 11 · weight`), and the running list's text.
- The commit in the bar, and what happens after it: the next piglet, the tag auto-incremented.

**Don'ts**
- Don't put the pad under a count. Type-to-set is retired on count figures.
- Don't add an OK, Enter, Next or Clear key; don't reorder the keys per field.
- Don't let the system keyboard open instead, and don't show the pad without a readout or a Measure above it naming what is being typed.
- Don't show more than three recorded values; history is the record's job.

**Strings**
`strs: { label, value, unit, placeholder, hint, digit, decimal, back, pad, recent }` and `args`. `digit` wraps each key's figure with `{ n: digit }` (`ds.field.figure`); `decimal` wraps `.` (`ds.field.decimal`); `back`, `pad` and `recent` are spoken labels set through `data-str-attr` (`ds.field.aria.backspace`, `.pad`, `.recent`). Each running-list item takes its own `{ text, strs: { text }, args: { text } }` (`ds.field.numpad.recent`, `{tag} · {w} kg`). Without `strs` the output is unchanged.

**Token gaps (literals in bundle.css)**: 56px pad key height, 20px glyph box and 1.8 stroke, the 2px caret and active border, the 4px hint dot. The `backspace` glyph is new in the bundle's `SentriIcons` registry and not yet in the Icons asset group or `ux/system/sentri-icons.js`.
