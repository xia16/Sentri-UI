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

**Strings**
`strs: { back }` for the Back text and per category `strs: { label }`, with `args` twins. The nav `label` is an `aria-label` attribute and has no twin. Without `strs` the output is unchanged.
