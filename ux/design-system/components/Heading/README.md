# Heading

The title of a screen, a block or a group of rows: one line of text, with an optional description, and (on a block title only) an icon, a meta and one link.

Use [Row](../Row/README.md) instead for a thing the worker taps; use [Panel](../Panel/README.md) for the surface a section heading sits above.

Call `SentriUI.heading({ title, kind, level, icon, description, meta, action })`.

## Which heading

| Kind | Use it for | It takes | It never takes |
|---|---|---|---|
| `page` | the title of a screen or a sheet, once, in its header | title, description | icon, meta, action |
| `section` (default) | the title of one block, sitting **above** its panel | title, icon, description, meta, action | |
| `group` | a label for a run of rows or log entries **inside** one panel (Day 2, Today, Health) | title, description | icon, meta, action |

One block has one heading: never stack a section heading over a group heading, and never put a heading over an empty block (leave the block out). A title inside a panel is a group heading. The old `panel` kind is retired: `kind: 'panel'` reads as `section`. A group heading is reached through `rowGroup({ title })` or `log()`, not called on its own.

## When to use / when not to use

- Use `page` once per screen or sheet, in the header, with the subject as the description ("A02 · Sow 000245").
- Use `section` when a block needs a name: "Litter summary", "Feeding", "Current tasks". It is the only heading that may carry a count or time for the whole block (`meta`) and the one link-out (`action`, "View log ›").
- Use `group` when one panel holds several runs.
- Do not use a heading to say a status: a heading holds no status colour. Do not use one as a button: a destination the worker taps is a [Row](../Row/README.md).

## Anatomy

- **Title** (required): an `h1`–`h6` (`level`, default 4). Sentence case, a noun.
- **Icon** (section only): 16px, `muted`, only where the icon names the subject (`SentriIcons.icon('feed')` for Feeding).
- **Description**: one `muted` line under the title, only when it tells the worker something the title does not.
- **Meta** (section only): a short `muted` aside at the top right ("3 tasks", "Mon 09:42").
- **Action** (section only): one text link with its ›, at the top right. A 48px target.

## Variants

- **Page** — name a screen or a sheet. 22px `page-title` (20px `sheet-title` inside a drawer). [variants/page.html](variants/page.html)
- **Section** — name one block above its panel. 13px `section-title`, `space-heading` (12px) above the panel. [variants/section.html](variants/section.html)
- **Group** — label a run inside a panel. 11px `group-label`, `muted`. [variants/group.html](variants/group.html)

## States

A heading is static text. Only its action has states.

| State | Rendering |
|---|---|
| Default | title, with whatever optional parts the kind carries |
| Pressed | the action link: `press` fill, ink text (static: `data-preview="pressed"`) |
| Focus | the action link: the 3px `focus` ring |
| Selected, disabled, error, loading | none. A heading is not selectable; a blocked action is left out, not greyed; a heading never loads or errs |
| Empty | absent: a heading is never drawn over an empty block |
| Long title | wraps; the aside stays top-aligned and holds at most 46% of the width |
| Chinese | same layout; the title is not truncated |

## Behaviour

The title is not interactive. `action` is `{ label, action, value, ariaLabel, disabled }` (the standard link, with its ›) or raw HTML for a control of the caller's own; either way the hit area is `tap-min` (48px) and the heading does not grow for it. The caller wires the click on `data-action`.

## Content rules

- Title: sentence case, a noun or noun phrase, one line at 390px where it can ("Litter summary", "Whole-task progress"); a longer one wraps, never truncates.
- Description: one line, at most one short sentence, sentence case, no full stop.
- Meta: 12 characters or fewer, never a sentence ("3 tasks", "48 sows").
- Action label: a verb phrase of one to three words ("View log", "View plan"); the › is drawn by the component.
- `ariaLabel` on the action when the visible label is not enough alone ("Open farrowing log").

## Accessibility

- Role: a heading element (`level`) so a screen reader can jump between headings; choose the level from the page outline, not the size.
- The action is a `<button>` with a visible 3px focus ring; Tab reaches it, Enter and Space activate it.
- Nothing depends on a gesture.

## CSS variables

Title sizes come from `--type-page-title-size`, `--type-sheet-title-size`, `--type-section-title-size`, `--type-group-label-size`; descriptions and meta from `--type-description-size`, `--type-meta-size`; the gap from `--space-heading`; the action target from `--tap-min`; colours from `--ink`, `--muted`.

## Do and don't

- Do give a section heading an icon only where it names the subject; do put one count or time in `meta`.
- Don't give a page or group heading an icon, meta or an action: the component drops them and warns in development.
- Don't write a heading over a single row group that already has its own label.
- Don't put status colour in a heading.

## Strings

`strs: { title, description, meta }` (registry ids) and `args: { title: {...} }`: each slot is wrapped in `<span data-str data-args>` for the screen shell to fill. The action takes `strs: { label }`.

## Related components

[Panel](../Panel/README.md) (the surface under a section heading) · [Row](../Row/README.md) (`rowGroup` draws the group heading) · [Log](../Log/README.md) (draws one group heading per day) · [TaskSection](../TaskSection/README.md).

## Classification

Component, with three variants (page, section, group).
