# SensorTrend

One sensor's reading card: the current value as the hero, a trend line under it, Low / High, and the reading history folded away. Environment & devices uses it for temperature, humidity and ammonia.

Use [Facts](../Facts/README.md) instead for a reading that has no history; use [TaskMetrics](../TaskMetrics/README.md) for counts that carry a total.

`SentriUI.sensorTrend({ name, unit, value, stamp, stampLabel, rows, decimals, pad, period, note, lowLabel, highLabel, historyLabel, timeLabel, chartLabel })`

## When to use / when not

- **Use** for one numeric sensor with a short sample history (the day or the week).
- **Not** for a count of animals (use TaskMetrics) or a value the worker sets (use Measure or Stepper).

## Anatomy

1. **Panel**: the one surface; the card sits on it, no card inside.
2. **Name and stamp**: the sensor name left, "Last reading 09:40" right, quiet, one line.
3. **Hero**: the current value in 34px mono with its unit small and muted beside it. It is the heaviest thing in the card.
4. **Period**: a [Segment](../Segment/README.md) view switch the host passes in (`Today` / `7 days`). It filters only this card.
5. **Trend**: one line with a faint fade beneath it, three gridlines with their values at the left, three time labels under it, a dot per reading.
6. **Low / High**: the two numbers the line cannot show, label quiet, value in ink.
7. **Reading history**: a folded table (Time and value); a chevron says it opens.
8. **Note** (optional): one quiet line that qualifies the facts ("Sample readings · connected").

## Variants

- [Reading](variants/reading.html): the one card.

## States

| State | Appearance and behaviour |
|---|---|
| Default | Hero, period control, trend, Low / High, history closed. |
| History open | The table opens under the summary; the chevron turns. |
| Humidity / Ammonia | Same card; unit and axis precision change (`decimals`). |
| Offline | The note says the values are the last available ones. The card stays readable; nothing in it acts offline. |
| Long label / Chinese | The name and stamp share one line and wrap onto two if they must; the hero never wraps. |

There is no pressed state of its own: the period control and the summary carry theirs.

## Behaviour

The component draws `rows` (`{ time, value }`, 7 or 8 points) and computes the axis from the data: the line fills the plot between the lowest and highest reading, padded by `pad` units. Gridlines print at the top, middle and bottom of that range with `decimals` digits. The host owns the period control and the data; the card never fetches.

## Content rules

The unit is always written. Axis text and the stamp are the 11px quiet size; Low / High values are 13px ink. Times are 24-hour. The chart has an `aria-label` with the minimum and maximum, and the history table gives every value in text.

## Accessibility

The chart is `role="img"` with a text summary; the folded table is the full data. The summary is a 48px-tall target. Reading order is the visual order.

## API and tokens

Uses panel, ink, muted, line, rule, range-fill, paper, tap-min, border-width, space-2 to space-20, size-16, type-description-size, icon-stroke and font-mono.

## Related components

Segment (the period), Panel (the surface), Heading (the section above it), DeviceControl (the equipment under it).

## Classification

Component: generic, built for Environment & devices; reusable for any sensor with a history.

## Changelog

2026-10-11: extracted from the Environment page pixel-identical, then fixed: 9px axes to 11px, 10px stamp, Low / High, history and note to 11px or 13px, the period control given room under the hero, the chart 44 units shorter so the fan card shows, the history chevron, the Panel surface and tokens.
