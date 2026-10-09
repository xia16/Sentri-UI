# Field

The label-over-control wrapper that every form field sits in. It is a `<label>` holding the label text and one control, so tapping the text focuses the control. `PickerField` is built on it, and a text input or note is dropped into it directly.

Call `SentriUI.field({ label, control, className, ds })`. `label` and `control` are raw HTML strings. `ds` writes `data-ds` on the root; pass `'Field'` from a screen and the card name from a component built on top (`PickerField` passes its own).

**Anatomy**
- Root: `<label class="field">`, a column with a 9px gap and an 18px top margin, so stacked fields keep their rhythm without a wrapper.
- Label: 12px/600 in `ink`, above the control.
- Control: an `input`, `textarea` or `select` gets the field skin, and a `button` (as in `PickerField`) supplies its own.
- The skin: at least `field-height` (48px), 12px padding, a 1px border, `paper`, a 14px value. A textarea is 90px high with a 1.6 line height and resizes vertically.

**What the caller provides**
- `label`: a noun in sentence case ("Cause of death", "Weight (kg)"). Put the unit in the label, never in the value.
- `control`: one control. Two controls in one label make the tap target ambiguous.
- Fields stack in capture order, never in columns.

**Rules**
- A choice field is `PickerField`, not a `<select>`. No native selects anywhere.
- Drift to know about: the input border (`#aeb8a1`) and radius (11px) are hard-coded in the stylesheet, close to but not equal to `control-border` and `radius-control` (12px). A picker trigger uses the tokens, so the two differ by a pixel.

**States**
- Default: the label over a `paper` control with its border.
- Pressed: not drawn. A text control has no pressed style.
- Disabled: not drawn. The stylesheet has no rule for a disabled `input`, `textarea` or `select`. Leave out a field the worker can't fill. A disabled `button` control takes the button rule (the `PickerField` trigger dims to half opacity).
- Focus: the global 3px `focus` ring at 2px offset on the control. The label does not change.
- Error: add `className: 'error'`. A text input or textarea takes a `red` border. There is no error message slot: put the reason in the label or a line the screen owns. A `button` control shows no error.
- Loading: not drawn.
- Empty: an empty control shows its browser placeholder. Fields are never rendered over an empty section.

**Strings**
`field` has no `strs`. `label` is raw HTML: to fill it from the registry, wrap the text in `<span data-str="id">` yourself, as `pickerField` does. Without a wrapper the output is unchanged.

## Variant: the optional row

Every optional input in a record sheet is an **optional row**, `SentriUI.optionalRow({ label, value, icon, editIcon, action | inline, key, open, optionalWord })`. It is the Photos header pattern for any field.
- **Anatomy:** a full-width `tap-min` row on `well`, `space-row-x` padding on the left. The label is `row-title` (13px/500), then the word "Optional" at `description` in `muted`. The trailing action is a ringed icon circle (`ring-width-fine` in `muted`, `paper` fill), the same as Photos' camera.
- **Empty:** the label, "Optional" and the `icon` (plus, or the camera for Photos).
- **Tap:** the row and the action are one tap target. `action` asks the host to open the field (picker, note editor, camera). `inline` reveals the field's own markup under the row instead (a note, a brand).
- **Filled:** the value is the row's answer line (12px, `ink`, one line, ellipsis) and the action becomes `editIcon` (edit). The word stays.
- **Placement:** below the required fields, in capture order, full width, one per line. Never chips, never side by side, never a label with a small "Optional" over a bare control.
- **Where:** `components/bundle.js` (DS screens, Piglet processing) and `ux/system/sentri-components.js` (the Astra prototypes) carry the same markup and `st-optional-*` classes. A required note (a choice demands it) stays a plain `field`.

