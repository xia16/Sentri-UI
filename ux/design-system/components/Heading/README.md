# Heading

The title above a panel, a page or a group: one line of text, with an optional icon, description, meta and a text action.

Call `SentriUI.heading({ title, kind, icon, description, meta, action, level })`.

**The four kinds**
- `page`: 22px `page-title`. Use it once, at the top of a page. It drops to 20px inside a drawer.
- `section`: 13px `section-title`. This is the default. It sits `space-heading` (12px) above its panel.
- `panel`: 12px. Use it for a title inside a panel.
- `group`: 11px, in `muted`. It labels a group of rows or log entries.

**What the caller provides**
- `title`: sentence case, and a noun ("Litter", "Sow details").
- `description`: one `muted` line, only when it tells the worker something the title does not.
- `meta`: short, and never a sentence ("Mon 09:42", "3 of 12").
- `action`: raw HTML for one text button or link. The component extends its hit area to 44px.

**Do and don't**
- Do use `icon` only where the icon names the subject: a feed heading takes `SentriIcons.icon('feed')`. The icon is 16px and `muted`.
- Don't render a heading for an empty section. Empty sections are absent.
- Don't put status colour in a heading.
