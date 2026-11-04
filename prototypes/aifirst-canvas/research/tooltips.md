# Chart tooltips for the desktop console

Research and recommendation · 4 November 2026 · no implementation or component approval.

**Recommend a light, anchored tooltip that acts as the chart’s legend:** category header, one keyed row per series, aligned values, a relevant summary, and a quiet hint for the hovered part’s filter action.

## What good examples do

These are public documentation, examples and source, not measurements of authenticated dashboards. **NS** means the source does not specify a show/hide delay; animation duration is not a hover delay. Defaults vary by chart and version. Tremor and shadcn both use Recharts, so they are separate treatments, not independent evidence of prevalence.

| Example | Surface; header; series key/order; values; summary; timing and placement |
| --- | --- |
| [Tremor bar chart](https://www.tremor.so/docs/visualizations/bar-chart) · [source](https://github.com/tremorlabs/tremor/blob/main/src/components/BarChart/BarChart.tsx) | White / near-black by theme; category in a divided header; 8 px rounded squares, payload order; values at right with tabular figures; no default total; NS, Recharts-positioned floating tooltip. Closest anatomy to Sentri. |
| [shadcn chart tooltip](https://ui.shadcn.com/docs/components/base/chart) · [source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/chart.tsx) | Theme background, light/dark; category label; 10 px rounded squares (“dot”), line or dashed indicators, payload order; right-aligned tabular numbers; summary custom; NS, Recharts placement, no caret in content. |
| [Grafana](https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/configure-tooltips/) | Theme surface, light/dark; time for time-series charts; colour keys, automatic / ascending / descending order; value column at right; no prescribed total, **hovered series bold** in All mode; NS, hover-positioned, proximity and maximum size configurable. |
| [Carbon Charts](https://charts.carbondesignsystem.com/tooltips) · [style](https://github.com/carbon-design-system/carbon-charts/blob/main/packages/core/scss/components/_tooltip.scss) · [options](https://charts.carbondesignsystem.com/api/interfaces/tooltipoptions) | Theme layer, light/dark; category/time context depends on chart, not one universal header; 4 px colour strips beside rows, supplied item order; values at row end; optional labelled total/custom calculation; no show/hide dwell in base handler (100 ms opacity transition); cursor-relative with side fitting, or element placement. |
| [Highcharts](https://www.highcharts.com/docs/chart-concepts/tooltip) · [API](https://api.highcharts.com/highcharts/tooltip) | Theme background; category/date header; coloured bullet in conventional shared format, series order unless customised; inline values by default, HTML table optional; total/delta custom; initial show 0 ms in documented `showDelay`, hide 500 ms; point-anchored by default for columns, follow-pointer / fixed / split options. |
| [Observable Plot](https://observablehq.com/plot/marks/tip) | White default, fill configurable; channel names/values rather than mandatory separate header; square swatches for colour/opacity channels, configurable channel order; name–value layout; no automatic total; NS, nearest datum via pointer transform, automatic fitting anchor, pointer and shadow. |
| [Chart.js](https://www.chartjs.org/docs/latest/configuration/tooltip.html) | Dark translucent default; category title; colour boxes or dataset point shapes, item-sort callback; body text left-aligned by default rather than a numeric column; footer callback for sums/comparisons; NS, average/nearest element placement with automatic caret alignment. |
| [Recharts](https://recharts.github.io/en-US/api/Tooltip/) · [default content](https://github.com/recharts/recharts/blob/main/src/component/DefaultTooltipContent.tsx) | Legacy default white with grey border, current theme overrides available; category label; coloured series text without a separate swatch, current API sorts by name by default; inline `name : value`; summary custom; NS, coordinate-relative with 10 px offset, view-box constraints and fixed/portal options. Useful baseline to improve, not copy unchanged. |

## Patterns that hold

The recurring structure is **context → keyed values → optional interpretation**. Colour alone is insufficient: keep a label beside each key. Right-aligned tabular figures are especially effective in Tremor and shadcn, although bare library defaults often leave values inline. Grafana’s active-row emphasis identifies the precise part under the pointer without hiding its siblings. Totals and target deltas are conditional, not obligatory footer decoration. These are conclusions from the examples above, not a universal standard.

Both light and dark work: theme-following surfaces suit multi-row reading; a dark inverse surface strongly separates a brief overlay from a light chart (Chart.js). For Sentri, white preserves chart swatch appearance and existing ink hierarchy; its border and shadow distinguish it from white cards. A stable series order helps comparison; sorting by changing values makes rows move. Match stack order consistently: base-to-top for vertical stacks, left-to-right for progress bars.

There is no shared pixel recipe or delay. Examples range from compact 6–10 px padding to Tremor’s 16 px horizontal padding; radii and shadows vary. A pointer can clarify a point anchor, but is unnecessary when the hovered part is visibly emphasised. Cursor-following suits exploration of dense points; a bar anchor keeps a small table still. Width limits and collision handling matter more than a heavy shadow. Generic icon-tooltip delays should not slow chart scrubbing. An action hint is appropriate only when the mark actually performs that action; it need not become an interactive button inside the tooltip.

Hover also needs a persistent, dismissible reading path. [Carbon guidance](https://carbondesignsystem.com/components/tooltip/usage/) supports hover/focus, pointer travel into the tooltip and Escape dismissal; [WCAG hover/focus guidance](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) requires dismissible, hoverable, persistent additional content in applicable cases. The Sentri fallbacks below are recommendations, not claims that every library supplies them.

## Sentri specification proposal

**Surface and dimensions.** White `#FFFFFF`, 1 px `#DFE4D8` border, ink `#20291F`, secondary `#657060`; opaque over the farm too. Radius **8 px**, shadow **0 4px 16px rgba(32,41,31,.14)**, no pointer. Width fits content: **240 px minimum, 280 px maximum**, capped to available container width minus 16 px. Padding **10 px vertical / 12 px horizontal**. Geist **13/18 px** for header and values; **12/18 px** for labels and hint. Header weight 600, body 400, values 500; hovered row label/value 600. Header-to-rows gap 6 px; rows minimum **24 px** high. A summary divider uses the border colour with 6 px space above/below; hint has 6 px top gap. Wrap long labels and grow rows; never ellipsise an identity or numeric value.

**Keys and content.** Use an **8 × 8 px square, radius 2 px**, 8 px before the label; copy the chart’s exact series colour, with a 1 px ink outline on very pale swatches. Keep a minimum 16 px label–value gap; values align right with `tabular-nums`. Use a **12 × 2 px line sample** for a target (copy its dash pattern), a dot for her marker, and a short range sample for the batch range. Swatches have text labels and are decorative to assistive technology. Keep all series, including zero; show missing/pending as words, never as zero. Do not invent new semantic colours; green remains done/approved.

**Two examples.** Illustrative values; `>` marks the row that would be semibold, not a rendered glyph. Squares represent the chart colours. Units belong in the header. The hint names the active filter, so the whole tooltip cannot be mistaken for the click target.

```text
Batch 29 · piglets / litter       Batch 29 · tasks

> ■ Alive now             11.8      ■ Done                    18
  ■ Died after birth       0.8    > ■ Active                   6
  ■ Born dead              0.6      ■ Awaiting                 4
  ───────────────────────────      ───────────────────────────
  Born alive              12.6      Total tasks              28
  ┄ Target 12.0           +0.6

Click to show Alive now pens      Click to show Active pens
```

**Chart-specific meaning.** Born alive = alive now + died after birth, using the same cohort and denominator; born dead is excluded. Compare **12.6**, not the full stack height of 13.2, against the born-alive target; anchor its line at that boundary. Omit a redundant total-born row. For progress, total counts the bar’s tasks, not unique pens. Paired litter bars show born alive and weaned; these overlap, so never sum them. If shown stacked, use disjoint retained/lost parts, or flag the existing encoding for resolution before build. A current litter says “Weaned: pending”; only show a loss delta for compatible completed cohorts. Range-track rows are “Her value”, “Batch average”, “Batch range”, with units and optional her-minus-average last; no total. Only offer a pens hint where that mark already has a defined filter mapping.

**Placement and timing.** Anchor 8 px above the hovered segment’s top-centre; keep still within that segment. Flip below if needed, then try the side with room; clamp horizontally to an 8 px inset of the **panel and viewport intersection**. Render in an overlay so chart clipping cannot cut it off. If no side fits, use a fixed position inside the panel’s available area. Keep the active segment visible. Show after **100 ms** initial hover; subsequent marks update immediately while open. Hide **150 ms** after leaving both trigger and tooltip; crossing their 8 px gap must not dismiss it. Remain while hovered/focused, with no timeout; Escape dismisses until the trigger is exited/refocused. Close on filtering or panel scroll; no travelling animation.

**Farm and input.** Reuse the same surface for pen hover: header “Pen A7 · Batch 29”, each row a task name with its status text right-aligned and a matching status swatch. Show “No tasks” explicitly; for more than four tasks, show four plus “+N more tasks”, with the complete list in pen details. Anchor to the pen’s projected upper edge; fit within the farm viewport excluding floating panels. Hide during camera drag, reproject after motion, and suppress occluded pens. Include an action hint only for an existing pen action. For keyboard, provide a chart/pen-list entry with arrow navigation among marks, immediate focus disclosure, accessible labels/descriptions, and Enter/Space for the existing click action. For touch, preserve tap-to-filter; a separate chart “Details” control (and accessible pen list) exposes the same values without filtering. The tooltip contains no focusable controls. These fallback controls are proposed future scope; this research changes no interaction today.

## Don’ts

- Don’t turn multiple series into one sentence or make colour the only key.
- Don’t reorder rows on hover, dim siblings beyond readability, or hide zero values.
- Don’t sum overlapping measures, mix tasks with pens, or compare total births to a born-alive target.
- Don’t let the overlay chase the cursor, cover its active part, clip, or vanish during reading.
- Don’t promise a click action on a non-filterable mark or make hover the only route to values.
