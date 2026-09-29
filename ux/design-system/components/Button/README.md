# Button

The footer and bar actions. This is a CSS component, not a SentriUI function: `<button class="button primary">`.

**Variants**
- `primary`: an `ink` fill with a white label. Every commit uses it, and there is one per bar, on the right.
- `secondary`: a `paper` fill with a `control-border` border. It is at least 86px wide.
- `danger`: a `red` fill with a white label, for deleting and ending.
- `task-end-early`: a `red-wash` fill with a `red` border and label.
- Back is `surface-back`: 86 × 48, `back-border`, on the left. A lone Back fills the footer and turns `ink`.

**Geometry**
- 48px high in footers and 44px minimum anywhere else.
- `radius-control` (12px), 14px/500 label.
- Pressing darkens the button to `brightness(.96)` and moves it down 1px.

**What the caller provides**
- A verb with its count and place: "Record for 12 pigs", "Confirm & next", "Foster 3 · B4 → B6", "Final · 10 total".

**Rules**
- A bar holds at most two actions, with the primary on the right.
- Never label a button "Submit", "Save" or "Complete", because every action commits itself.
- Green is never a button fill. Destructive buttons never take the primary treatment.
- Disabled primaries go `disabled-fill`. Prefer leaving out an action the worker can't take.

**States**
- Default: a white `button` with a `control-border` border. Primary is `ink`, danger is `red`, `task-end-early` is `red-wash`.
- Pressed: hover darkens to `brightness(.96)`, and `:active` moves the button down 1px (not under reduced motion). Back (`surface-back`) fills `#f5f6f1` with a green label while pressed. A lone Back stays `ink`.
- Disabled: any disabled button takes the flat grey fill, border and label (`#f1f2ed`, `#d9ddd3`, `#92998d`). A disabled primary takes `disabled-fill`. Prefer omission: leave out an action the worker can't take.
- Focus: a 3px `focus` ring at 2px offset. Back's own ring is 2px.
- Error, loading, empty: not drawn. Danger is a variant for destructive verbs, not an error state, and there is no busy or spinner state.
