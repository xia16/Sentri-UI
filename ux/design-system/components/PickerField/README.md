# PickerField

The mobile choice control that replaces every native `<select>`. It is a trigger shaped like a text field, and it opens a picker sheet of options.

Call `SentriUI.pickerField({ label, value, display, placeholder, action, key, disabled })` for the trigger. For the sheet's option list, call `SentriUI.pickerOptions({ options, selected, action })`. Each option is `[value, label, subtitle?, group?]`.

**How it looks**
- The trigger matches a text field: at least 46px high (`field-height`), a `control-border` border, `radius-control`, 14px text and a `muted` chevron.
- Options are 56px rows split by `rule`. The selected option is 600 weight with a `green` check.
- Ungrouped options sit in one `inset`. Grouped options get a titled panel per group.

**What the caller provides**
- The open sheet. The trigger only emits `data-action` and `data-picker-key`; the host app owns the sheet and its state.
- A placeholder of "Select". The code's default is "Choose", but the design law is "Select, never a blank".

**Rules**
- A picker returns exactly one record. Use `ChoiceList` with `mode: 'multi'` for several, and show the count in the trigger ("2 selected", "None").
- Two to four outcomes are a Choice field, not a picker. A fifth outcome makes it a picker.
- No native selects anywhere. A guardrail test enforces this.

**Strings**
`pickerField` takes `strs: { label, display | value, placeholder }` and `args`; the id sits on the value span (the placeholder id when nothing is chosen). `pickerOptions` options take a fifth element `{ strs: { label, sub, group }, args }`. Without `strs` the output is unchanged.
