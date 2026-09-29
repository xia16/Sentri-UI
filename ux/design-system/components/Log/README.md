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

**States**
- Default: entries on the `log-line` thread. The last entry's thread ends at its dot.
- Empty: a log with no entries, or only empty groups, renders one `muted` 12px line ("No activity recorded yet"). Groups with no entries are dropped.
- Pressed, disabled, focus: none, because entries are text and hold no actions. `extraHtml` may hold a control, which then follows that control's own states.
- Error, loading: not drawn.

**Strings**
Per group `strs: { label }`, per entry `strs: { category, title, detail, meta }`, each with an `args` twin; the empty line takes `strs: { empty }` in the options. Without `strs` the output is unchanged.

## Candidate addition ([ADR 0002](../../adr/0002-candidates-2.md))

**Status: candidate.** A group may carry `description`: one `muted` 11px line under its label that says what the whole group means (`Since End` over `Kept and stamped; the ended figures do not change`). It uses the Heading's description slot, so nothing new is drawn. Strings: `strs: { label, description }` and `args` per group. Without it the output is unchanged.
