**Status: candidate.** Extracted from the Environment screen as it was drawn, then fixed for the farm legibility law. Not approved.

# SensorTrend

One sensor of one unit: the reading as a large mono figure, when it was taken, a trend chart with its low and high, and the exact readings behind one disclosure.

Call `SentriUI.sensorTrend({ name, value, unit, updated, period, rows, pad, decimals, chartLabel, note, ... })`. `rows` is `[{ time, value }]` in time order; `period` is a Segment (`{ options, active, action, ariaLabel }`) for Today / 7 days. The caller owns all copy.

Use [Measure](../Measure/README.md) for a value the worker types, [TaskMetrics](../TaskMetrics/README.md) for headline figures with totals, [Facts](../Facts/README.md) for label and value pairs. SensorTrend never alerts and never shows a threshold.

## Anatomy

- **Surface**: the panel surface, `space-panel` padding, 1px `line`, `radius-panel`, no shadow.
- **Name** (12px `muted`) over the **reading** (34px mono `ink`, regular weight) with its unit (11px `muted`). The reading is the hero; everything else is small.
- **Last reading**: 11px `muted`, right, two lines.
- **Period**: a Segment (`view-switch`), Today and 7 days.
- **Chart**: one line with a soft fill, three gridlines, three y values and three time labels in `muted`. The axes scale so they stay at 11px or more at 360px.
- **Low and High**: labels 11px `muted`, values 13px `ink`.
- **Reading history**: one 48px disclosure (13px `ink`) over a two-column table, times 11px `muted`, values 13px `ink`. A table, not [Log](../Log/README.md) (recorded acts, and it draws its own panel: a card on a card) and not Facts (two to a row scrambles a time series).
- **Note**: 11px `muted` line, for what qualifies the readings (`offline, showing last available values`).

## Variants

- **Trend** — [variants/trend.html](variants/trend.html)

## States

| State | Rendering |
|---|---|
| Today / 7 days | the chart and the table follow the period |
| Offline | the same card; the note says the values are the last available |
| No history | no chart, range or table; the reading stays |
| Pressed | the Segment's own |
| Empty, error, loading | a sensor with no value is not drawn (never `0`) |
| Chinese | same layout |

## Behaviour

The period Segment sends `data-action` with `data-value`; the page re-renders. The disclosure is a native `details`.

## Content rules

Unit always written. Whole-number sensors use `decimals: 0`. `chartLabel` carries `{min}` and `{max}` for the screen reader.

## Accessibility

The chart is `role="img"` with a label giving the range; the table behind the disclosure carries the exact values. The disclosure is a 48px target.

## Do and don't

- Do keep the reading the largest thing.
- Don't add a threshold colour or an alarm here.
- Don't say the offline state outside the note.

## Related components

[Segment](../Segment/README.md) · [DeviceControl](../DeviceControl/README.md) · [Measure](../Measure/README.md)

## Classification

Component, with one variant (trend). Candidate.
