**Status: candidate.** Extracted from the field kit's Measure and farrowing's litter weight, then revised after the design panel ([ADR 0001](../../adr/0001-field-cards.md)). It is not approved.

# Measure

A Measure holds one measured value with its unit: litter weight, a piglet's weight, a temperature, a dose. The value is set in mono and the unit is always written (`16.8 kg`). Tapping it opens the Numpad, docked above the bar. There is no native input and no system keyboard.

Call `SentriUI.measure({ label, optional, value, unit, unitGap, placeholder, key, action, active, controls, range, tone, changed, hint, note })`.

**Anatomy**
- **Label** above the box, in `choice-label` 14px at 600 `ink`. It does the same job as a Stepper row's label. An optional `muted` word can sit beside it ("Optional").
- **Box.** Shaped like a field:
  - `field-height` minimum, `paper` fill, a 1px `control-border` and `radius-control`;
  - padding of `space-row-y` × `space-row-x`.
- **Value** in IBM Plex Mono `figure` (21px/500), tabular, in `ink`. It shows the typed string verbatim, with no locale formatting.
- **Unit** in mono `identifier` 12px `muted`, 6px after the value on the same baseline. `unitGap: false` sets it tight, for `40.6°`.
- **Status region (the hint)** below the box, in `input` 14px: one persistent `role="status"` line, always mounted, which the box points to with `aria-describedby`. A status hint starts with a `status-dot`. The `note` line (muted, also in `aria-describedby`) goes under it.

**The pad rule (written once, here and in Numpad)**
- The Numpad docks above the bar, in the thumb zone.
- The host scrolls the active Measure into view above the pad.
- Tapping the active Measure again does nothing.
- The pad closes with Back or by opening another field. The typed text is kept as the staged draft. Closing never writes and never discards.

**States**
- **Default:** the value and its unit.
- **Empty:** `—` in `muted`, with the unit still written (`— kg`). Missing is not zero, so an unweighed litter never reads `0 kg`.
- **Pressed:** the box fills `press`.
- **Active** (the pad is open):
  - the border turns `ink` at `caret-width`, and a `caret-width` `ink` caret follows the digits;
  - when the field is empty, the caret shows alone before the unit;
  - the range is **not** checked while typing.
- **Disabled:** none. A value the worker cannot set is left out, or printed as a Facts value.
- **Focus:** a 3px `focus` ring, offset 2px, on the box.
- **Out of range (soft)** (`range: [min, max]`, or `tone: 'warn'`):
  - evaluated on commit or pad close, never per keystroke;
  - the value stays `ink`;
  - an `amber` hint with a dot gives the range in words: `Usual 8.8–27.5 kg · this is 30.4`;
  - it is never a gate: the value records.
- **Refused** (`tone: 'refused'`): a physically impossible value.
  - The figure is struck through in `amber`.
  - The hint says why: `Not recorded · over 55 kg for 11 piglets`.
  - The host **withholds the bar's primary** until the value changes. It is never silently dropped or clamped.
- **Corrected** (`changed: true`): the value prints in `amber`, and `note` carries the original (`was 16.8 kg`).
- **Tone precedence:** refused beats warn, and `changed` stands beside either. A corrected value that is out of range shows the amber value, the range hint and the `was` note together.
- **Loading:** none.

**Event contract**
- The box is `<button data-action="<action, default open-numpad>" data-value="<key>" aria-expanded aria-controls="<pad id>">`. The root carries `data-field`.
- The accessible name is label + value + unit (`aria-labelledby`).
- **Announcements.** While the pad is open, the Measure's value is a polite live region, so each keystroke announces only the new value (`16.8`), never the label. The range warning or refusal announces once, through the status region, when the pad closes.
- Delegate with `closest('[data-action]')`.
- The typed draft is a **string** that the host holds. It survives interruption (a scream, a phone sleeping) because it lives with the host, not the DOM.
- The host normalises the draft on commit with `SentriUI.numpadCommit(value, { decimals })`:
  - `16.` → `16`;
  - leading zeros are stripped;
  - empty → `null` (missing).
- Re-render by patching the Measure and its pad, keyed by `data-field`, so focus survives.

**What the caller provides**
- `unit`, always. A value with no unit is not a Measure: an ear tag is typed in the Numpad's readout.
- `range` for the soft warning, computed for this subject (per-piglet range × piglets alive), plus the hint words. The hard bound and its refusal also come from the caller.
- The bar's primary commits (`Save`, or the surface's own verb). The Measure and its pad never commit by themselves.

**Don'ts**
- Don't use `<input type="number">` or rely on the system keyboard. There is one pad grammar across the product.
- Don't warn while the worker is still typing.
- Don't block the bar on a soft warning, and don't turn the border red for it.
- Don't write `0` for missing, and don't drop the unit when the field is empty.
- Don't use a Measure for a count of animals (use a Stepper) or for values entered in sequence (use the Numpad run).

**Strings**
- `strs: { label, optional, value, unit, placeholder, hint, note }` and `args`. Without `strs`, the output is unchanged.
- `value` gets `{ n }` when no `args.value` is given (`ds.field.figure`).
- `placeholder` (`ds.field.placeholder`) shows while the field is empty and inactive.
- Range words: `ds.field.measure.range` (`Usual {min}–{max} kg · this is {v}`). Refusal: `ds.field.measure.refused`. Original value: `ds.field.measure.was`.
