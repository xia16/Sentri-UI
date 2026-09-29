**Status: candidate** — extracted from the field kit's Measure and farrowing's litter weight (ds/field-cards, 2026-09-29). Not approved; the design panel reviews it before any slice builds on it as final.

# Measure

One measured value with its unit: litter weight, a piglet's weight, a dose. Mono, and the unit is always written (`16.8 kg`). It is a field that opens the Numpad beneath it — there is no native input and no system keyboard.

Call `SentriUI.measure({ label, optional, value, unit, placeholder, key, action, active, range, tone, hint })`. The box is a `<button data-action="open-numpad" data-value="<key>" aria-expanded>`; the host opens `SentriUI.numpad({ decimals, value, key })` directly beneath it and re-renders the Measure with `active: true`. The component places the pad 12px (`space-row-y`) under an active Measure.

**Anatomy**
- Label above, in `panel-title` 12px at 600 `ink`, with an optional `muted` 11px word beside it ("Optional").
- Box: field-shaped, like PickerField — `field-height` minimum, `paper`, 1px `control-border`, `radius-control`, padded `space-row-y` × `space-row-x`.
- Value in IBM Plex Mono `figure` (21px/500, tabular) in `ink`; unit in mono `identifier` 12px `muted`, 6px after it, on the same baseline.
- Hint: one line under the box, `choice-meta` 12px, with a 4px dot when it is a status.

**States**
- Default: the value and its unit.
- Empty: `—` in `muted` and the unit still written (`— kg`). Missing is not zero: an unweighed litter never reads `0 kg`.
- Pressed: the box fills `press`.
- Active (the pad is open): the border goes `ink` at 2px and a 2px `ink` caret follows the digits; empty-and-active shows the caret alone before the unit.
- Disabled: none. A value the worker cannot set is left out, or printed as a Facts value.
- Focus: a 3px `focus` ring offset 2px on the box.
- Out of range — soft (`range: [min, max]`, or `tone: 'warn'`): the value stays `ink`; an `amber` hint with a dot says what is usual (`Outside the usual 8.8–27.5 kg for 11 piglets`). Words, never a gate: the value records.
- Refused (`tone: 'refused'`): a value past a hard bound is not recorded — the typed figure is struck through in `amber` and the hint says why (`Not recorded · over 55 kg for 11 piglets`). It is never silently clamped.
- Corrected (`tone: 'changed'`): the value prints `amber`; the hint carries the original (`was 16.8 kg`).
- Loading: none.

**What the caller provides**
- `unit`, always. A value with no unit is not a Measure (an ear tag is typed in the Numpad's readout).
- `range` for the soft warning, computed for this subject (per-piglet range × piglets alive); a hard bound is the caller's refusal.
- The bar's primary commits (`Save`, or the surface's own verb). The Measure and its pad never commit by themselves.

**Don'ts**
- Don't put an `<input type="number">` or rely on the system keyboard: one pad grammar product-wide.
- Don't block the bar on a soft warning, and don't turn the border red for it — red is for errors and ending acts.
- Don't write `0` for missing, and don't drop the unit when empty.
- Don't use a Measure for a count of animals (Stepper) or a sequence of values (Numpad with its readout and running list).

**Strings**
`strs: { label, optional, value, unit, placeholder, hint }` and `args`. `value` gets `{ n: value }` when no `args.value` is given (`ds.field.figure`); `placeholder` (`ds.field.placeholder`, `—`) is used while empty and inactive. Without `strs` the output is unchanged.

**Token gaps (literals in bundle.css)**: the 2px caret and the 2px active border (drawn as `control-border`-width 1px + a 1px inset `ink` shadow), the 4px hint dot.
