# Sentri surface policy

This policy applies to the Astra inspection, Farrowing and Home studies. `AstraSurfaces.present` classifies every `.sheet` before returning markup: full-page surfaces use `data-st-context="page"`; all other sheets use `data-st-context="drawer"`. The context belongs on the enclosing sheet so shared `st-panel` components can render white information panels on the pale-green page canvas and tinted panels on a white drawer canvas.

## Presentation and sizing

Actions (pig and pen scopes), records and logs are full pages. Actions preserves its fixed Back + category footer; it has no scrim, grab handle or rounded drawer top. Drawer height must not be used as a substitute for page classification. This supersedes the earlier drawer-only Actions study.

Drawers are focused choices and forms layered over the previous context. Tall drawers stop at 85% of the phone, leaving at least 15% visible above. Their bodies scroll rather than expanding to cover the whole phone.

Pages occupy the phone canvas, have independently scrolling bodies, fixed action footers and 24px bottom body padding. A drawer keeps its fixed header/footer and independently scrolling body. Drawers use only these finite `data-size` presets:

| Preset | Use | Maximum height |
| --- | --- | --- |
| `compact` | confirmation or a very small status review | adaptive content, capped at 42% |
| `short` | one-field or single-pig entry | adaptive content, capped at 58% |
| `medium` | predictable forms and action menus | 76% |
| `long` | selections, logs and multi-step review | `85%` |

An omitted preset uses the shared drawer maximum. `data-sizing="content"` opts into adaptive content sizing while retaining the selected preset’s cap. Content scrolls inside `.sheet-body`; ad hoc per-screen heights are not part of the contract.

The current presets declare no separate numeric minimum. Adaptive drawers use the intrinsic height of their header, content and footer until capped; fixed medium/long drawers use the preset height. These prototypes do not support dragging between height stops. A handle may support dismissal in its owning flow, which is different from resizing. Home drawers opt into content sizing by default. See [the per-drawer inventory](SENTRI-DRAWER-INVENTORY.md) for each named workflow, cap and dismissal behavior. Mobile preview content scrolls without desktop scrollbar chrome; full pages remain explicitly separate from drawers.

## Navigation and actions

Every subpage and drawer exposes exactly one Back action with the existing `data-action` id preserved. The current studies place Back in the fixed footer so it can sit beside a primary action; a lone Back expands to own the footer. A drawer close icon may dismiss the surface, but does not replace Back in a nested workflow. Pages and drawers must not add a second Back during normalization.

The main enabled primary action is black (`var(--ink)`), with an outlined secondary Back. Disabled states remain disabled. Destructive controls retain explicit red treatment, including delete and end-task confirmations; contextual warning choices may use the existing pale-red treatment. No broad green rule may override primary action semantics.

These rules derive from `ux/research/farrowing/ASTRA-PAGES-AND-DRAWERS.md`, `ASTRA-ACTION-NAVIGATION-GUIDANCE.md`, and `SENTRI-COMPONENT-CONTRACT.md`. The footer Back placement follows the current shared implementation and regression contract while retaining the research requirement of one navigation exit.

## Divider and icon rules

Use separators between sibling rows and to anchor a fixed header/footer. Use whitespace between sections; no rule under a subgroup label. Section icons identify subject areas. Buttons use an icon only when it aids recognition (Back, Actions, record death); a text action such as Save does not need an icon simply because section titles have one.

Home drawers share the same height tokens and fixed Back/action footer. Form buttons retain their form association when placed in that footer. Main pages with persistent bottom tabs keep Back in the header; nested record pages and drawers use the shared footer.

## Mobile interaction contract

The product canvas is a mobile touch interface. Use at least 44 × 44 CSS px for standalone touch targets, tap to navigate, and visible labels or icons. No action or essential explanation may depend on hover, double-click, right-click, a tooltip, or a mouse. Pressed feedback is allowed; keyboard focus remains available for accessibility. Truncated row descriptions are supporting context only; task names and primary actions must remain understandable without a tooltip.

Keep one vertical content scroller between the fixed header and footer; do not hide controls below a clipped body. Native operating-system inputs are acceptable. The desktop controls surrounding a prototype phone are review tools, not product interactions. Component specimens can be inspected at 320, 390 and 430 CSS px. Real soft-keyboard and safe-area behavior still require a device check.
