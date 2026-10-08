# CategoryFooter

The footer of an actions page. Back sits on the left, and the categories run as underlined tabs on the right.

Call `SentriUI.categoryFooter({ categories: [{ id, label, disabled }], active, backAction, categoryAction, label })`.

**How it looks**
- A grid of `86px | 1fr`, with 16px between the columns. Padding is `14px 18px 28px`, and the 92×4 `handle` bar sits below.
- Back is 86 × 48 with a `back-border`.
- Tabs are 48px high and 12px/500 in `tab-ink`. The active tab is `tab-ink-active` at 700, with a 3px `current-marker` underline.
- Tabs scroll sideways when they overflow. Under 310px their padding and size shrink.

**What the caller provides**
- One-word category names in the verb sheet's order: "Health", "Routine", "Production".
- `active`, set to the category in view. It falls back to the first category.
- The `data-action` handlers for Back and for each tab. The tabs scroll the page to that category; they don't open a new one.

**Rules**
- Leave out an empty category. Don't disable it.
- Back keeps its position between a pig's details and its action menu, so the return control never moves under the thumb.

**States**
- Default: Back on the left and the tabs on the right. The active tab (`aria-current="location"`) is 700 in `tab-ink-active` with the 3px `current-marker` underline. Every other tab is `tab-ink`.
- Pressed: Back fills `#f5f6f1` while pressed. The tabs have no pressed style: not drawn.
- Disabled: a category with `disabled` is drawn at half opacity. Prefer omission: leave out an empty category.
- Focus: tabs get a 2px `focus` ring inset by 2px. Back gets a 2px ring at 2px offset.
- Error, loading: not drawn.
- Empty: with no categories the nav is empty and only Back shows. Callers leave out an empty category rather than render it.

**Strings**
`strs: { back }` for the Back text and per category `strs: { label }`, with `args` twins. The nav `label` is an `aria-label` attribute and has no twin. Without `strs` the output is unchanged.
