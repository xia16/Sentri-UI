# Shared Sentri reading components

The component study and app must render the same `SentriUI` functions and load `sentri-components.css` last. Do not copy sample markup or add screen-specific overrides for these components. Task state and navigation remain in each app.

## Surface contexts

`data-st-context="page"`: pale-green canvas (#f6f7f1), white information panels.
`data-st-context="drawer"`: white canvas, pale information panels (#f6f8f1).
Set context on the enclosing page/drawer, not on every card. Never infer an information panel's color from its route name. Status colors, inputs and selected states keep their own semantics. Full-page embedded pig details use page context.

## Titles

- Page: 22px / 500; no decorative leading icon. Scope is secondary text below.
- Section: 13px / 500, optional 16px category icon; one consistent 8px icon gap. Description below aligns with title text. Counts and one optional text action align right.
- Group: 11px / 500; no icon and no top divider. Used for Farrowing / Gestation / Shared within Production.
- Panel: 12px / 500; typically no icon. Used inside an information panel, e.g. Whole-task progress.
- Row title: 13px / 500; metadata 11px. Title and supporting text each occupy one line, with ellipsis for overflow; neither wraps. Full text remains in the accessible name. An icon identifies the destination; a trailing chevron appears only for a navigation action.

Section spacing is 24px. Heading-to-content spacing is 12px. Use internal row separators, not lines under headings or between whole sections.

Actions and record navigation use one visual row component: `SentriUI.row` inside `st-panel st-row-group`. Both use 68px rows, 34px icon tiles, 12px/14px padding, internal separators and single-line titles/supporting text. Groups are white on pages and lightly tinted in white drawers. `st-action-list` may identify a command group but adds no separate skin. This supersedes the earlier flat action-list variant at the user's request. Action categories use the standard section title outside their groups (13px, 500 weight), matching Litter summary and General details; `st-category-heading` adds no separate typography. Production subgroups use `SentriUI.rowGroup(content,{title})`: an 11px / 500 subgroup label inside the same panel as its rows, with no separator below the label. Nesting and spacing establish the hierarchy, not extra boldness. Leave 32px between categories. Avoid an additional enclosing card.

## Interface (HTML-returning helpers)

`SentriUI.heading({title, icon='', description='', meta='', action='', kind='section', level=4, className=''})`
Returns a heading group. `title`, `description`, `meta` are text (escaped internally). `icon` and `action` are trusted app-generated HTML slots. Kinds: page, section, group, panel. Choose actual semantic heading level separately from visual kind. Preserve existing data-action attributes in the action slot.

`SentriUI.panel(content, {className='', tag='div'}={})`
Returns a contextual information surface. `content` is trusted app HTML. For an existing structural element that must keep its markup, add `st-panel` to its classes instead. Do not add another wrapper around an existing panel.

`SentriUI.rowGroup(content, {title='', level=5, className=''}={})` owns a shared row panel and its optional inset subgroup label. Content is trusted row HTML. Use this for named production groups; unnamed navigation groups retain the same geometry and panel surface.

`SentriUI.facts(items, {className='', columns=2}={})`
Items: `{label, value, valueHtml, meta}`. Text values are escaped, null/empty values become an em dash, numeric zero remains zero. Optional `valueHtml` is a trusted app-generated slot for a link or formatted value. Returns contextual `dl.st-panel.st-facts`.

`SentriUI.row({title, description='', icon='', action='', value='', className='', disabled=false, trailing='', attrs={}})`
Returns a button if action exists, otherwise an informational div. Adds data-action/data-value, keeps disabled semantics and gives actionable rows a chevron. `attrs` supports only data-* and aria-* attributes; `icon` and `trailing` are trusted HTML slots. `title` and `description` are text. Preserve existing legacy class names only where interaction code needs them.

`SentriUI.log(groups, {className='', empty='No activity recorded yet'}={})`
Groups: `{label, entries:[{title, detail, meta, category, extraHtml}]}`. Optional date label, text fields escaped, extraHtml is app-generated attachment markup. Entries keep source order; filtering and timestamps are supplied by callers, never reinterpreted. Uses one contextual surface, compact timeline geometry, sans-serif author metadata, visible markers and no connector after a final entry. Empty state uses the same surface.

`SentriUI.categoryFooter({categories:[{id,label}], active, backAction='back', categoryAction='action-category', label='Action categories', className=''})`

The approved fixed footer pairs an outlined Back button with underlined section shortcuts. It preserves action identifiers and uses `aria-current="location"` for the current section. The caller owns scrolling and current-section state; this component owns markup and visual hierarchy. Use it for navigating sections of one long task/action page, not for filters, task statuses or primary form submission. Keep the existing visual design when extracting a component.

For each pattern, reuse an existing component if its purpose and behavior match. Extract a new component for a distinct recurring pattern. Keep a specialized control local when sharing would erase its meaning or require many exceptions; record that decision in the relevant audit.

## Migration ownership and checks

Check actual component adoption at each caller. Shared row markup alone does not establish the group surface; the enclosing group variant must be explicit. Remove competing legacy row padding, borders and heading rules when migrating. A geometry-only browser pass is not visual alignment coverage; inspect the actual group at its scroll position and compare its fill, spacing, typography and hierarchy with the study.

Inspection: pig overview/facts, Current tasks, Pig record routes, production action groups, record logs, profile/pen information and section headings. Farrowing: overview headings/panels, litter summary/facts, history/pen log, information pages. Home: secondary-page headings and navigation. Shared foundation owns styling; migrate or delete competing rules rather than increasing page-specific specificity.

Preserve record payloads, care-state meanings, filtering, action routing, disabled states, completion/termination gates and attachments. No new clinical assumptions. The study covers page/drawer, long titles, metadata/actions, empty/missing data, information/navigation rows, logs and an assembled example. Browser checks must distinguish source coverage from rendered coverage.
