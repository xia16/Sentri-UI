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
