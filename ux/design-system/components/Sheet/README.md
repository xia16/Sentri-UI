# Sheet

The two ways a surface is presented. A *drawer* rises over the page. A *page* takes the whole canvas. This is a CSS contract: `<section class="sheet" data-st-context="drawer" data-size="short">` with `.utility-header`, `.sheet-body` and `.sheet-footer` inside.

**Drawer**
- `paper` background, `radius-sheet` (28px) top corners and `shadow-sheet`, over a `scrim` with a 1.4px blur.
- Four heights:
  - `compact`: up to 42%, for one question.
  - `short`: up to 58%.
  - `medium`: 76%. This is the default.
  - `long`: 85%, for catalogues.
- `compact` and `short` size to their content. Add `data-sizing="content"` to let any drawer do the same.
- Panels inside a drawer are `inset`.

**Page**
- `data-presentation="page"`: square corners, and the body padded `20px 21px 24px`.
- A utility header with a `line` divider, and a footer padded `14px 21px 28px` with the `handle` bar.
- Panels on a page are `paper` on `app-background`.

**Choosing between them**
- A drawer holds about five fields and one primary action.
- A page form has Back and never a grab bar.
- Re-entering a session resumes it. It never opens a fresh sheet.

**What the caller provides**
- The header title (`sheet-title`, 20px).
- The body content.
- A footer with at most two actions, primary on the right.

**States**
- Default: the drawer over its `scrim`, or the page on the whole canvas. Both are static containers.
- Pressed, disabled: these belong to the buttons and rows inside. A sheet has none of its own.
- Focus: controls inside take the global 3px `focus` ring. The sheet itself takes none.
- Error, loading, empty: not drawn. A sheet has no busy or failed presentation. Its body holds the empty line of whatever it contains.

**Page presentation needs a positioned parent**
`data-presentation="page"` draws the sheet as `position:absolute; inset:0; height:100%; max-height:100%`, with no radius or shadow, at `z-index:3`. It is therefore sized by its nearest positioned ancestor, and the drawer's percentage heights and the `scrim` are too. Give the screen root, the `.inspection-phone` or `.farrowing-phone` element, this CSS:

```css
.inspection-phone {
  position: relative;   /* the containing block for .sheet and .scrim */
  height: 100dvh;       /* a fixed height; percent heights resolve against it */
  overflow: hidden;     /* nothing scrolls the root; .sheet-body scrolls */
}
```

Without `position:relative` the page sheet fills the viewport or a far ancestor. Without a fixed height a percent-height drawer collapses to its content and the page sheet is only as tall as its parent. The preview uses a 460px root.
