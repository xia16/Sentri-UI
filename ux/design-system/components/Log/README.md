# Log

The history tail of a detail page: entries grouped by day on a vertical thread, newest first.

Use [Row](../Row/README.md) instead for a record the worker can open or edit; use [TaskReceipt](../TaskReceipt/README.md) for the receipt of one finished day.

Call `SentriUI.log(groups, { kind, empty, correctedLabel })`. `groups` is a list of `{ label, description, entries: [{ title, detail, at, by, meta, category, corrected, was, extraHtml }] }`. Flat entries with a date become groups through `SentriUI.logGroups(entries, { now, lang, today, yesterday, earlier })`.

## When to use / when not to use

- Use it to read what was recorded on a pen, a litter, a pig or a task, in the order it happened.
- Do not put an action in an entry: editing a record opens its sheet from the row that owns it.
- Do not use it for the day's work still to do (use [TaskDay](../TaskDay/README.md) or rows).
- One recorded act is **one entry**. Eight IDs given in one sitting are `IDs given · 8` with the range under it, not eight lines. A title is never repeated in its own detail: the component drops a detail that equals its title.

## Anatomy

- **Panel** with one or more day groups.
- **Group heading**: a [Heading](../Heading/README.md) group, the day (and an optional one-line `description` for the whole group, such as `Kept and stamped; the ended figures do not change`).
- **Thread and dot**: a 1px `log-line` with a `log-dot` per entry; the last entry's thread ends at its dot.
- **Entry**: category word (categorised only) or a "Corrected" word, the title (13/500), a `detail` line (11px `muted`), a `was` line, the stamp (10px) and an optional `extraHtml` slot.

## Variants

- **Day log** (default) — history of one thing, grouped by day. [variants/day.html](variants/day.html)
- **Categorised** (`kind: 'categorised'`) — a log that mixes kinds of event (Health, Feed, Movement, Notes): one kind word above each title, and a kind and date filter above the panel (the filter bar is the screen's, not the log's). Used by the pig log and the pen log on a walk. [variants/categorised.html](variants/categorised.html)

## One date and one stamp format

- **Group label** is the day: `Today`, `Yesterday`, a weekday within the past week (`Mon`), then `Jul 8` (with the year when it is not this year). Entries with no date go last under `Earlier`. Never `5 days ago`, `day 4` or `1 Aug 2026`. `SentriUI.logDay(at)` writes it.
- **Stamp** is `time · initials`: `07:14 · G.H` (`SentriUI.logStamp(at, by)`). The day is in the group label. A full name is written as initials. A missing time or author is **left out**; nothing prints `Author not supplied`.
- Pass `at` (a Date, epoch ms, `YYYY-MM-DD`, `YYYY-MM-DDTHH:MM` or `HH:MM`) and `by`; pass `meta` only for a stamp that is already text.

## Corrected entries

A correction is shown as the **original and the correction**: the entry's title is the new value, `corrected: true` draws a "Corrected" word above it, and `was` prints the original as a muted line (`Was 9 alive`). A delta already carries both (`Alive 9 → 8`): `corrected` alone is enough.

## States

| State | Rendering |
|---|---|
| Default | entries on the thread, newest first |
| Corrected | "Corrected" word above the title, `was` line under it |
| With an attachment | `extraHtml` after the detail (a photo is a 48px control with its own states) |
| Pressed, selected, disabled | none: entries are text. An `extraHtml` control follows its own component's states |
| Empty | one `muted` 12px line: `No activity recorded yet`; groups with no entries are dropped |
| Filter matches nothing (categorised) | `No matching entries`, a different line from the empty log |
| Loading, error | not drawn |
| Longest label | Title and detail at their budgets: one line each; the stamp stays under them. |

## Behaviour

Static. The caller sorts newest first (`logGroups` does it for flat entries). A new entry is added by re-rendering.

## Content rules

### Copy budget

| Text | English | 中文 | Lines |
| --- | --- | --- | --- |
| Entry title | 40 | 20 | 1 |
| Entry detail | 44 | 22 | 1 |
| Category | 12 | 6 | 1 |
| Group label | 16 | 8 | 1 |

Over-budget copy is rewritten, never wrapped, shrunk or ellipsised. The “Longest label” state shows real copy at this limit in the real container at 390px; budgets come from what fits at 390px inside the screen gutters.

### Writing rules


- Title: sentence case, the act in the fewest words (`Fostered 3 piglets`, `Count set to 11`).
- Detail: one line that adds something the title does not (a route `B4 → B6`, a reason); never the title again.
- Category (categorised only): one word, sentence case.
- Group label: the day, per above; never a sentence.
- Newest entry exactly as recorded: do not summarise it.

## Accessibility

- Role: each group is a `section` headed by its day; entries are an ordered list (`ol` / `li`), so a screen reader announces "list, 3 items".
- Nothing of its own to operate. The thread and dot are decoration.
- The "Corrected" word and `was` line say a correction in text, not colour.

## CSS variables

`--log-line`, `--log-dot`, `--space-panel`, `--space-heading`, `--space-24` (between groups), `--type-row-title-size`, `--type-description-size`, `--type-meta-size`, `--muted`, `--ink`.

## Do and don't

- Do write one entry per act and let the group carry the date.
- Do show the original beside a correction.
- Don't print a placeholder for a missing author or time.
- Don't put the same words in the title and the detail.
- Don't put a button in an entry to edit it.

## Strings

Per group `strs: { label, description }`, per entry `strs: { category, title, detail, meta }`, each with an `args` twin; the empty line takes `strs: { empty }` in the options. `correctedLabel` sets the word for a correction (default `Corrected`). Without `strs` the output is unchanged.

## Related components

[Heading](../Heading/README.md) (the group heading) · [Row](../Row/README.md) · [Panel](../Panel/README.md) · [TaskReceipt](../TaskReceipt/README.md) · [Photos](../Photos/README.md).

## Classification

Component, with two variants (day log, categorised). The group `description` was a candidate (ADR 0002) and is part of the component.
