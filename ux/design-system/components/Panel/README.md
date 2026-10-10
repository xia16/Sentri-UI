# Panel

The one surface every grouped block sits on; you rarely call it directly. Use Facts instead for read-only pairs, Row group for destinations, and Log for history.

## When to use

Use beneath Facts, Row group, Log, TaskGroup, TaskTotals, TaskProgress and TaskSection. ChoiceList also uses this surface for grouped options.

## When not to use

Use Heading and divider rules to organise content inside an existing panel. Use Sheet for a page or drawer shell. Never put a card in a card or use a panel for a paragraph alone.

## Anatomy

Context fill, hairline border, rounded corners and content slot. Padding belongs to the consumer: Facts and Log are padded; Row group, TaskGroup and ChoiceList run edge to edge. These content components are related consumers, not additional Panel variants.

## Variants

- **Page:** use on the app canvas; paper on app-background.
- **Drawer:** use inside a drawer; inset on paper.

The enclosing `data-st-context="page|drawer"` chooses the variant. The default outside a context is page.

## States

| State | Rendering |
| --- | --- |
| Default | Bordered surface, no shadow |
| Empty | Absent; `panel('')` returns an empty string |
| Long label / Chinese | Content wraps using the consumer's copy rules |
| Pressed, active, disabled, error, loading | Owned by the contained control; Panel is static |

## Behaviour

`SentriUI.panel(content, {tag, className, ds})` returns a semantic container. It has no events, navigation or async work. Separate grouped blocks with space-section. Nested panels are not a supported composition; replace the inner surface with a heading and rules.

## Content rules

Panel has no text slots, label length, casing or truncation. Facts, Row and Log govern their own copy. Do not repeat a section title within its surface. Optional inputs stay optional rows beneath required fields.

## Accessibility

No implicit role or handler. `tag` permits div, section, article, aside or dl; use the consumer to supply correct semantics. Only controls inside the panel are tappable, at tap-min or above. They own their own roles and states.

## Tokens / API

`line`, `inset`, `paper`, `app-background`, `radius-panel`, `space-panel`, `space-section`. The compatibility aliases `--st-line`, `--st-inset`, `--st-radius` resolve to these tokens. No elevation or accent stripe.

## Do / don't

Do show one Facts block or one Row group per surface. Don't wrap Facts or Log in another Panel. Don't apply a custom fill or shadow to a consumer.

## Related components

[Facts](../Facts/README.md), [Row](../Row/README.md), [Log](../Log/README.md), [ChoiceList](../ChoiceList/README.md), [TaskGroup](../TaskGroup/README.md), [TaskTotals](../TaskTotals/README.md), [TaskProgress](../TaskProgress/README.md), [TaskSection](../TaskSection/README.md), [Sheet](../Sheet/README.md).

## Classification

Component; page and drawer are context variants. Consumer compositions retain their own component APIs. See variants.json for screen usage and variants/ for isolated states.

## Changelog

2026-10-10: unified TaskGroup, ChoiceList and Farrowing pen surfaces; replaced the paragraph demo with Facts and Row groups.
