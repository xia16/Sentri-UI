# Critique: Environment sensor screen (environment.page, .sensor-week, .sensor-other, .fan-manual)

Mode polish, class presentation. Baselines: origin/main 716d761, `environment.*` at 390 and 360 (EN). All four screens are one page (`home-astra-prototype.js`, `environment()`), so the critique covers the page once.

## Keep

- **The reading hero** (`22.4 °C`, 34px mono, regular weight, top-left of the card). It is the first thing the eye lands on and answers "what is the room doing now?". Stays the largest thing on the screen, same place, same weight.
- **Sensor tabs on top** (Temperature · Humidity · Ammonia, one Segment). One tap switches the sensor; the selected tab is bold on white. Unchanged.
- **Today / 7 days toggle directly under the reading.** Same Segment, same position.
- **The trend chart** (soft green area, dots, three gridlines). It shows shape at a glance with no legend. Stays as drawn.
- **One card per topic**: sensor card, then Devices heading outside the card, then the fan card. Light structure, regular weight, one dark control (Save setting). Kept.
- **Fan: Auto / Manual segment, then the speed slider only when Manual.** The optional input is optional; Save setting is the one dark filled control. Kept.
- **Missing sensor is omitted, never 0** (feature rule). Untouched.

## Problems

| # | Problem | Evidence | Severity |
|---|---|---|---|
| 1 | The fan speed value and its label are 11px. The worker sets this value with a thumb and reads it to confirm. | probe: `Fan speed` 11px, `45%` 11px, in the acted-on card | major |
| 2 | The fan's current state ("Auto · following unit schedule", "Manual · 45% speed") is 10px. It is the answer to "what is the fan doing?". | probe: `.device-control-heading p` 10px; check-legibility small-text list | major |
| 3 | Low / High are 10px, and they are the numbers read off the chart. | probe: `.sensor-range-stats` 10px, below the 11px floor | major |
| 4 | Chart axis labels are 9px, and 3 pairs fail contrast (fill `#78826f` on white, below 4.5:1). Scaled further down at 360px because the SVG shrinks with the card. | check-legibility: 3 contrast on environment.page/-week/-other; probe: svg text 9px | major |
| 5 | "Last reading 09:40" is 10px. | probe | minor |
| 6 | History table and the helper lines under the chart and the fan are 10px. "Connected / Offline" beside the Devices heading is 10px. "Reading history", a control, is 11px. | probe | minor |
| 7 | The page says "connected" twice: "Sample readings · connected" under the chart, "Connected" beside Devices. And "09:40" twice: "Last reading 09:40" and the chart's last label. | owner rule: nothing said twice | minor |
| 8 | Both cards, the chart, the readout and the fan block are page-built with page CSS colour, border, radius and type (`.sensor-detail`, `.device-control`, `.sensor-chart`, `#fan-speed`), not SentriUI parts. | `ux/system/home-astra-prototype.css` 148-167; owner rule: design-system components only | structural, fixed by extraction (section 1c) |

fan-manual also has one target under 48px (check-legibility, 1 target) which the extraction checks.

## Parts

| Part | Drawn by | Verdict |
|---|---|---|
| Header (back, title, Unit 7, PREVIEW) | `head()` page helper / TaskHeader family | keep |
| Sensor tabs | `SentriUI.segment` view-switch | keep |
| Reading + Last reading | page-built `.sensor-detail-heading` | extract into `Trend`, fix 5 |
| Period toggle | `SentriUI.segment` | keep |
| Chart + axis | page-built `.sensor-chart` SVG | extract into `Trend`, fix 4 |
| Low / High | page-built `.sensor-range-stats` | extract, fix 3 |
| Reading history (details + table) | page-built `.sensor-history` | extract, fix 6 |
| Helper "Sample readings" | page `.helper` | fix 6, 7 |
| Sensor card surface, device card surface | page-built white card | move onto `Panel` |
| Devices heading + status word | page-built `.device-section-heading` | fix 6, 7 |
| Fan heading (icon, name, state) | page-built `.device-control-heading` | extract into `Device`, fix 2 |
| Fan Auto / Manual | `SentriUI.segment` | keep |
| Fan speed label, value, slider | page-built `.fan-speed-label`, `#fan-speed` | extract into `Device`, fix 1 |
| Save setting | `SentriUI.button` | keep |
| Helper "Preview controls only" | page `.helper` | fix 6 |

## Self-crit

(written in the directions step)
