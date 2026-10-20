# Heading

A title: of a screen or a sheet (`page`), of a block (`section`) or of a run of rows (`group`). One line of text; a block title may add a description, an icon, a meta and one link. Heading is the title type only. The headers that hold a screen's or a sheet's title (Back, the corners, the header line) are [Header](../Header/README.md).

Use [Row](../Row/README.md) instead for a thing the worker taps; use [Panel](../Panel/README.md) for the surface a section heading sits above.

Call `SentriUI.heading({ title, kind, level, icon, description, meta, action })`.

## Which heading

| Kind | Use it for | It takes | It never takes |
|---|---|---|---|
| `page` | the title of a screen or a sheet: the type its [Header](../Header/README.md) draws, once | title | icon, meta, action, description: Back, the corners and the header line are the Header's |
| `section` (default) | the title of one block, sitting **above** its panel | title, icon, description, meta, action | |
| `group` | a label for a run of rows or log entries **inside** one panel (Day 2, Today, Health) | title, description | icon, meta, action |

One block has one heading: never stack a section heading over a group heading, and never put a heading over an empty block (leave the block out). A title inside a panel is a group heading. The old `panel` kind is a legacy kind with its own 14px title; Piglet processing's count and dead pages and Farrowing's whole-task progress still call it. Do not use it on a new screen. Group headings are usually drawn by `rowGroup({ title })` or `log()`, and may also be called directly (`kind: 'group'`, as Home does).

## When to use / when not to use

- Use `page` for the title of a screen or a sheet. It is drawn by its [Header](../Header/README.md) (the page header or the sheet header), never on its own. Where it sits, Back, Clear or Reset, and the header line are Header's job. This is only the type: 22px `page-title` in the page header, 20px `sheet-title` in the sheet header.
- Use `section` when a block needs a name: "Litter summary", "Feeding", "Current tasks". It is the only heading that may carry a count or time for the whole block (`meta`) and the one link-out (`action`, "View log ›").
- Use `group` when one panel holds several runs.
- Do not use a heading to say a status: a heading holds no status colour. Do not use one as a button: a destination the worker taps is a [Row](../Row/README.md).

## Anatomy

- **Title** (required): an `h1`–`h6` (`level`, default 4). Sentence case, a noun.
- **Icon** (section only): 16px, `muted`, only where the icon names the subject (`SentriIcons.icon('feed')` for Feeding).
- **Description** (section and group): one `muted` line under the title, only when it tells the worker something the title does not. A page or sheet title has none; a hub's header line is its [Header](../Header/README.md)'s.
- **Meta** (section only): a short `muted` aside at the top right ("3 tasks", "Mon 09:42").
- **Action** (section only): one text link with its ›, at the top right. A 48px target.

## Variants

- **Page and sheet title** — the title type, as the page header (22px `page-title`) and the sheet header (20px `sheet-title`) draw it. [variants/page.html](variants/page.html). For the headers themselves, see [Header](../Header/README.md).
- **Section** — name one block above its panel. 16px `section-title`, `space-heading` (12px) above the panel. [variants/section.html](variants/section.html)
- **Group** — label a run inside a panel. 13px `group-label`, `muted`. [variants/group.html](variants/group.html)

## States

A heading is static text. Only its action has states.

| State | Rendering |
|---|---|
| Default | title, with whatever optional parts the kind carries |
| Pressed | the action link: `press` fill, ink text (static: `data-preview="pressed"`) |
| Selected, disabled, error, loading | none. A heading is not selectable; a blocked action is left out, not greyed; a heading never loads or errs |
| Empty | absent: a heading is never drawn over an empty block |
| Long title | `page`: never wraps. It fits on one line between the header's corners at 360 with 12px clear, about 20 English or 10 Chinese characters (Headers law → Title length); a longer name is rewritten shorter in the feature's budget, never truncated, wrapped or shrunk. `section` and `group`: wrap; the aside stays top-aligned and holds at most 46% of the width |
| Chinese | same layout; the title is not truncated |

## Behaviour

The title is not interactive. `action` is `{ label, action, value, ariaLabel, disabled }` (the standard link, with its ›) or raw HTML for a control of the caller's own; either way the hit area is `tap-min` (48px) and the heading does not grow for it. The caller wires the click on `data-action`.

## Content rules

- Title: sentence case, a noun or noun phrase. A `page` title fits on one line at 360 between the header's corners (about 20 English or 10 Chinese characters: "Correct piglet count", "记录死亡"). A `section` or `group` title is one line at 390px where it can ("Litter summary", "Whole-task progress"); a longer one wraps, never truncates.
- Description: one line, at most one short sentence, sentence case, no full stop.
- Meta: 12 characters or fewer, never a sentence ("3 tasks", "48 sows").
- Action label: a verb phrase of one to three words ("View log", "View plan"); the › is drawn by the component.
- `ariaLabel` on the action when the visible label is not enough alone ("Open farrowing log").

## Accessibility

- Role: a heading element (`level`) so a screen reader can jump between headings; choose the level from the page outline, not the size.
- The action is a `<button>`; the screen reader reads its name and role.
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

[Header](../Header/README.md) (the page and sheet headers that draw the page title) · [Panel](../Panel/README.md) (the surface under a section heading) · [Row](../Row/README.md) (`rowGroup` draws the group heading) · [Log](../Log/README.md) (draws one group heading per day) · [TaskSection](../TaskSection/README.md).

## Classification

Component, with three variants (page, section, group).

## Changelog

2026-10-15: split from Header (owner: "split heading (this is titles) and headers (sheet and page)"). The `page` variant is now the title type the two headers draw ("Page and sheet title"). Its old states (with a description, in a drawer, a long title that wraps) taught a header the Headers law forbids: a description belongs to a hub's header line, and a header title never wraps. They are gone.
