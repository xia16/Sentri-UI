# Log

The history tail of a detail page: grouped entries on a vertical thread, newest first.

Call `SentriUI.log(groups, { empty })`. `groups` is a list of `{ label, entries: [{ title, detail, meta, category, extraHtml }] }`.

**How it looks**
- Each entry is a 7px `log-dot` on a `log-line` thread.
- The title is 13/500. `detail` is 11px `muted`. `meta` is the 10px record stamp.
- Groups are separated by `space-section`.

**What the caller provides**
- Group labels as relative days within the week ("Today", "Yesterday", "Mon"), and the date after that.
- `meta` as an absolute stamp: `Jul 8 · 07:14 · G.H`. Records stay absolute.
- `category`: a 9px word above the title, only when the log mixes kinds of event.
- `empty`: the text for a log with no entries. It defaults to "No activity recorded yet". Groups with no entries are dropped.

**Do and don't**
- Write the newest entry exactly as it was recorded. Don't summarise it.
- Don't put actions inside entries. Editing a record opens its sheet from the row that owns it.
