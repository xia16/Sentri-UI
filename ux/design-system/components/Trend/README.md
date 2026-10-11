# Trend

One sensor's reading now, with its recent shape: Environment & devices (Temperature, Humidity, Ammonia). Use Measure for a value the worker types and Facts for read-only record pairs.

`SentriUI.trend({ label, value, unit, updatedLabel, updated, period, rows, decimals, pad, lowLabel, highLabel, historyLabel, timeLabel, chartLabel, note })`

## When to use / when not

- **Use** for a live or sampled figure that has a short history (two or more points) and a "how fresh" stamp.
- **Not** for a figure the worker enters (Measure), a count (TaskMetrics), or a list of animals' weights.

## Anatomy

1. **Hero reading**: the value in mono `reading` (34px, regular), the unit beside it in `meta`. It is the largest thing in the card.
2. **Last reading** at the right, `caption` size, muted.
3. **Period slot**: the caller's Segment (Today / 7 days).
4. **Chart**: a soft area and line in `range-fill`, three gridlines in `line`, three y labels and three x labels (`caption`, scaled with the chart, never under 11px at 360).
5. **Low / High**: `caption` label and a `meta` ink value with its unit.
6. **Reading history**: a disclosure (48px) holding the table of every point.
7. **Note**: one `caption` line for the caveat ("Sample readings").
8. **Surface**: Panel. The label (the sensor's name) is read to screen readers and is the table caption; it is not drawn, because the selected tab above already says it.

## Variants

- [Reading](variants/reading.html): the one card.

## States

| State | Appearance |
|---|---|
| Today / 7 days | The caller passes the rows and the matching x labels. |
| Offline | The note says the values are the last available ones; the figure is unchanged. |
| Fewer than two points | Chart, Low / High and history are left out; the hero stays. |
| Long label / Chinese | Copy wraps; the hero and chart keep their size. |

## Behaviour

Static. The period Segment is the caller's (`data-action`), as is the history disclosure (native `details`). Missing is never 0: a sensor without a finite value is not drawn by the host.

## Content and wrapping

The reading and unit are real data and never shortened. Axis labels come from the caller (`00:00`, `6d ago`). Low / High are the minimum and maximum of the rows.

## Accessibility

The chart is `role="img"` with `chartLabel`; its numbers are in the history table. The history summary is a 48px target.

## Do / don't

Do keep the reading the one large figure. Don't add a second figure beside it, and don't colour the line by state: green means approved or done.

## Related

[Segment](../Segment/README.md) (period), [Panel](../Panel/README.md) (surface), [Measure](../Measure/README.md) (typed values).

## Classification

Component (candidate). Extracted from Environment & devices (`environment.*`).
