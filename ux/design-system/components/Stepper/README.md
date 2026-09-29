**Status: candidate** — extracted from farrowing's ruled counter (ds/field-cards, 2026-09-29). Not approved; the design panel reviews it before any slice builds on it as final.

# Stepper

The record sheet's counting field: `− n +`. Use it whenever the worker counts animals rather than reads a number off a scale or a tag. It is the only way a count changes in a sheet: up is +, down is − (or bodies, or Edit). Nobody types a count.

Call `SentriUI.stepper({ label, description, value, min, max, key, action, variant, tone, hint })`. Each key is a `<button data-action="step" data-value="<key>" data-step="-1 | 1">`. The caller owns the value, the floor (`min`) and the ceiling (`max`), commits on every tap and re-renders.

**Anatomy**
- One silhouette in every state: label (and optional description) on the left, `[−] n [+]` on the right, the digit centred between its keys. No row ever changes shape as it wakes.
- Row: 60px minimum height (the craft pass's glove spacing). Label `choice-label` 14px at 600 in `ink`; description `description` 11px in `muted`. Stacked steppers are divided by `rule`, never above the first.
- Keys: `field-height` (46px) square, `radius-control`, 8px apart. − is `paper` with a `control-border` edge and an `ink` glyph. **+ is filled `ink` with a `paper` glyph.** Glyphs are the registry's `minus` / `plus` strokes, 14px, stroke 2.2, centred in the key — never text characters sitting on a baseline.
- Value: IBM Plex Mono `figure` (21px/500), tabular, 3ch wide so the keys never move as the count gains a digit.
- Hint: one optional line under the row in `choice-meta` 12px — the floor pointer (`Wrong count? Edit`), never a caption.

**Variants**
- `row` (default): a counting row in a drawer, Edit or Finish.
- `hero`: the one number a count sheet exists to set (farrowing's Alive). Label centred above in `section-title` 13px `muted`; keys 54px at `radius-inset` with 18px glyphs, at the two edges; value `hero-count` (68px/600, −3px) in `count-ink`; the hint line is the receipt (`Saved · +4 this visit`) centred beneath. No box around the numeral: a bordered figure invites typing, and type-to-set is retired.

**States**
- Default: − outlined, + filled `ink`, value in `ink`.
- Empty: the value always prints — a quiet `0` in `muted`. Never blank, never "—" (a count of none is a real 0).
- Pressed: the key scales to .96 (120ms); − fills `press`, + stays `ink`. Under reduced motion there is no transform.
- Disabled — the floor-gray, the one scoped exception to "no dim-as-disabled": − at the floor (`value <= min`), + at the ceiling (`value >= max`) fill `disabled-fill` with a `disabled-ink` glyph. The key is `aria-disabled`, not `disabled`: a tap still reaches the host, which answers with the pointers in the hint line (`Found dead? Record dead` · `Wrong count? Edit`). − is present even when there is nothing to undo.
- Focus: a 3px `focus` ring offset 2px on the key.
- Error / out of range: none. A stepper cannot hold an invalid value — the floor and ceiling gray the key instead of refusing a tap. A corrected figure in Edit (`tone: 'changed'`) prints in `amber`, as every corrected value does.
- Loading: none; the tap commits and the digit ticks at once.

**What the caller provides**
- `label`: the thing counted, sentence case, ≤ 14 characters in en ("Weak", "Crushed", "Kept boar").
- `min` / `max`: the floor (farrowing's Born floor for Alive; 0 elsewhere) and the ceiling (weak + deformed ≤ alive). Omit `max` when + is free.
- `description` only when the row needs its population ("among 11 alive").

**Don'ts**
- Don't let the worker type a count; don't box the value.
- Don't hide − at zero or swap the row for a "+ Add" button until the first tap.
- Don't colour + green: green is never a button fill. (The `count-key` token, farrowing's green hero +, is not used here — see the report.)
- Don't use a stepper for a measured value (weight, temperature): that is a Measure.

**Strings**
`strs: { label, description, value, hint, decrease, increase }` and `args`. `value` is wrapped in a `data-str` span; when `strs.value` is given without `args.value`, the component fills `{ n: value }` (register the figure as `ds.field.figure`, `{n}`). `decrease` / `increase` are the keys' spoken labels, set through `data-str-attr="aria-label:…"` (`ds.field.aria.decrease` / `.increase`); the group is named by the label. Without `strs` the output is unchanged.

**Token gaps (literals in bundle.css, not tokens yet)**: 60px row, 54px hero key, 14px / 18px glyph boxes, 2.2 stroke, the craft pass's 15px label (set at the 14px `choice-label` step instead, because 15px is not on the type scale).
