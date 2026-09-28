# Panel

The one container surface. A panel is a bordered, unshadowed box that holds rows, facts, a log or free content.

Call `SentriUI.panel(content, { tag, className })`.

**How it looks**
- A 1px `line` border and `radius-panel` (18px), with `space-panel` (16px) of padding.
- No shadow.

**What the caller provides**
- The content HTML.
- The container's context. Mark the page or drawer that holds the panel with `data-st-context`:
  - On a `page`, panels are `paper` on `app-background`.
  - In a `drawer`, panels are `inset` on `paper`.
  - Never set a panel's colour yourself.

**Do and don't**
- Don't nest panels. A panel inside a panel turns transparent, so use a heading or rules instead.
- Don't add a left-border accent. Don't add a shadow.
- Separate panels with `space-section` (24px), each under its own heading.
