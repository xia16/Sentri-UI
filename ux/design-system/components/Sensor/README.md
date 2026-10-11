**Status: candidate.** Extracted from the Environment screen's page-built sensor card (`.sensor-detail`), then raised to the farm floors. Not approved.

# Sensor

One sensor reading with its short history: the current value in mono, when it was read, a quiet line chart over Today or 7 days, Low and High, and the raw readings behind a disclosure.

Call `SentriUI.sensor({ name, value, unit, updated, periodHtml, rows, decimals, pad, note })`. `rows` is `[{ time, value }]`, oldest first; `periodHtml` is the page's period [Segment](../Segment/README.md).

## When to use / when not
- Use for a measured series the worker reads, not sets: a unit's temperature, humidity, ammonia.
- Do not use for a value the worker enters (use [Measure](../Measure/README.md)) or for plain facts about a record (use [Facts](../Facts/README.md)). A sensor with no finite reading is left out by the page; it is never drawn as `0`.

## Anatomy
1. **Panel** (`st-panel`, one card).
2. **Name** (13px `muted`) over the **value** (`figure-reading`, 34px mono, `ink`) with the unit 13px `muted`. The value is the largest thing on the screen.
3. **Last reading** (13px `muted`, right): how fresh the number is.
4. **Period Segment** (from the page).
5. **Chart**: three `chart-grid` hairlines with axis values (12 chart units, about 11px on a 360 phone, `muted`), a `chart-line` polyline with dots over a `chart-fill` gradient, and the first, middle and last time labels.
6. **Low / High**: label 13px `muted`, value 13px `ink` at 500, unit written.
7. **Reading history**: a 48px disclosure holding a Time / value table at 13px.
8. **Data note** (11px `muted`): "Sample readings", plus the offline wording when offline. It qualifies the facts and never goes loud.

## Variants
- [Reading](variants/reading.html): the one sensor card.

## States
Today · 7 days · whole number (humidity, ammonia) · offline (the note says the numbers are the last available ones).

## Content and wrapping
`decimals` sets the axis labels; values are never rounded elsewhere. Units (`ppm NH₃`) sit beside the value. Chinese uses the same sizes.

## Accessibility
The chart is `role="img"` with its minimum and maximum in the name; the history table carries the same numbers under a hidden caption. The disclosure is a native `details`.

## Do / don't
Do keep the reading the largest thing. Don't add a second coloured element or a threshold colour without an owner ruling on target ranges.

## Related
[Segment](../Segment/README.md), [Facts](../Facts/README.md), [Devices](../Devices/README.md).

## Classification
Component, candidate. One feature uses it today (Environment); Home's unit card shows the same readings as text.
