# Design-system doctor — first run, 2026-09-28

A hand run of the contract check, before the doctor tool exists. Its gaps
are the first design-system map, which runs before the piglet-processing
pilot. Re-run with the tool once it lands; this file is then replaced by its
output.

## Core — present

Colour (40 tokens, with usage and contrast), type (19 styles over two
families), spacing (11), radius (6), shadow (3), size including `touch-min`
44px, drawer heights. All required core categories exist.

## Gaps

### 1. Components the screens use that have no card

- `field` (text field) and `chooserList` are exported by
  `ux/system/sentri-components.js` but have no card.
- The README's record-sheet law names ten field types; only Picker and
  Multi-picker have a card (PickerField, ChoiceList). Missing: **Choice,
  Scale, Stepper, Measure, Checklist, Numpad, Note, Photos.** Piglet
  processing needs at least Stepper (counts), Measure (weight) and Numpad
  (tags) — these block the pilot.
- Surfaces built in `astra-*` files with no card: task header, task context
  card, verb sheet, dialog, receipt/toast.

### 2. States are not a standard section

Cards describe press, disabled and current where they come up, but no card
lists every state (default, pressed, disabled, focus, error, loading, empty).
The contract needs one `States` section per card.

### 3. The prototypes do not read the tokens

Raw values in `ux/system/*.css` checked against `tokens.json` (plus the small
steps the cards name: 2, 4, 6, 8, 20px):

| Property | Off-token | Most common off values | Worst files |
|---|---|---|---|
| Spacing | 909 of 3205 | 10px ×236, 5 ×132, 3 ×96, 7 ×82, 9 ×68, 13 ×65 | inspection-astra-concept 331, home-astra-prototype 191 |
| Font size | 92 of 882 | 15px ×17, 8 ×10, 17 ×7, 16 ×7 | home 23, inspection 23 |
| Radius | 147 of 386 | 13px ×22, 9 ×18, 11 ×17, 6 ×15 | inspection 49, home 36 |
| Colour | 984 uses, 628 distinct hex values not in the palette | | |

`10px` spacing is used 236 times: either it is a missing token or it is drift
— a ruling, not a snap. Font sizes are mostly on the scale already.

### 4. No adherence rules for Astra

The August system's `_adherence.oxlintrc.json` checked JSX; Astra is plain
HTML/CSS/JS, so nothing enforces the tokens today. Needed: the geometry and
token lint in a real browser, reading `tokens.json`.

### 5. No string registry

The README carries copy law (no Submit/Save/Complete; verbs on buttons,
states in segments; count-first) but there is no registry of strings, no zh,
and nothing checks it.

### 6. No semantic version

`tokens.json` says `"version": 1`. Designs need to record which version they
were built against.

## Rendered lint, same day

`design_lint.mjs` on the farrowing and inspection boards (each phone canvas
measured as its own screen, 1440×900): **397 errors, all token drift** —
spacing 290, colour 58, radius 30, font size 19. **Geometry is clean**: no
sideways scroll, protrusion, clipped text, ink collisions, overlapping tap
areas, unreachable content or undersized targets. The finished screens are
sound; they just do not read the tokens.
