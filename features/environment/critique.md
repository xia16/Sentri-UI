# Critique: Environment sensor screen

Scope: `environment.page`, `environment.sensor-week`, `environment.sensor-other`, `environment.fan-manual`, all rendered by `ux/system/home-astra-prototype.html` (`environment()` in `home-astra-prototype.js`). Mode: polish, class: presentation. Baseline: `origin/main` e1aa956, shots at 390 and 360 (EN; the page does not render Chinese, shoot-screens reports "no zh rendering").

## Keep

- **Sensor tabs (Temperature / Humidity / Ammonia).** One Segment across the top answers "which reading?" before anything else and is a full-height tap target. Same position, same weight.
- **The 34px mono reading with its unit.** `22.4 °C` is the first thing the eye lands on and answers "is the unit OK?". Kept at 34px, same place, same weight; the unit stays small beside it.
- **Today / 7 days toggle directly under the reading**, and the chart under that. The order reading, period, trend, extremes is the order the worker asks in.
- **The line chart.** A light green line on three hairlines, with a soft fill: one quiet picture, not a data table. Kept as drawn (geometry, colours, dots).
- **Reading history behind a disclosure.** The eight raw points are the detail, not the answer; they stay collapsed.
- **Devices as its own card below the sensors**, with the fan's Auto / Manual Segment, the speed slider that appears only in Manual, and one Save setting button (the one dark control on the screen).
- **Light structure**: pale canvas, white cards with a hairline and soft radius, small section heading outside the card (Devices). It matches Farrowing.

## Problems

Evidence: `node scripts/check-legibility.mjs --feature environment` (35, 37, 35 and 33 text nodes under the floor on the four screens; 3 contrast failures on three of them; 1 small target on fan-manual) and a per-node probe at 390 (listed in the evidence below).

1. **Major: Low / High read at 10px.** "Low 21.9 °C" and "High 22.8 °C" are the figures the worker compares with the target range; they are set at 10px (label and value). Fails the 11px floor, and the values are read values, not quiet text.
2. **Major: chart axis and time labels at 9px.** The y-axis values (23.3 / 22.4 / 21.4) and the x labels (00:00 / 07:00 / 09:40, 6d ago / 3d ago / Today) are 9px SVG text in #78826f. They are the only way to read the scale. Below the floor and low contrast on white.
3. **Major: "Last reading 09:40" at 10px.** On an offline screen this is the one fact that says how old the numbers are, and it is the smallest, lightest text next to the hero.
4. **Minor: every supporting line at 10px.** Reading history table (16 cells), "Sample readings..." helper, Devices meta ("Offline"/"Connected"), the fan summary ("Auto · following unit schedule"), "Reconnect to change device settings.", the "Fan speed 45%" label and the Today-state helper all sit at 9 to 11px. The fan summary and the speed value are acted on, so the floor for them is 13px.
5. **Minor: connection said twice.** "Sample readings · connected" under the chart repeats the "Connected" meta beside the Devices heading. Offline is said as "offline, showing last available values" and again as "Offline" beside Devices.
6. **Minor: three contrast failures on the sensor card** (the 9px grey axis text and the muted "Last reading" on the gradient fill) and **a sub-48px target on fan-manual** (the speed slider thumb row).
7. **Process: the styling is page-built.** `.sensor-detail*`, `.sensor-chart`, `.sensor-range-stats`, `.sensor-history`, `.device-control*` and `.fan-speed-label` colour and size text in `home-astra-prototype.css`; the gate fails any such declaration added there, so the parts must move into the design system before they can be improved.

Not a problem: the Auto / Manual Segment and Save setting looking washed out when offline is the shared disabled state of Segment and Button; it is the system's, so it is left alone.

## Parts

| Part | Drawn by | Verdict |
|---|---|---|
| Page header (back, title, Unit 7, PREVIEW) | `head()` page header, `.preview-badge` | keep (header is out of scope) |
| Sensor tabs | `SentriUI.segment` view-switch | keep |
| Reading hero + Last reading | page-built `.sensor-detail-heading` | extract as is, then fix problem 3 |
| Today / 7 days | `SentriUI.segment` view-switch | keep |
| Chart | page-built `sensorChart()` + `.sensor-chart` | extract as is, then fix problem 2 |
| Low / High | page-built `.sensor-range-stats` | extract, then fix problem 1 |
| Reading history | page-built `.sensor-history` | extract, then raise cells (problem 4) |
| Helper line | page-built `.helper` | extract, shorten (problem 5) |
| Devices heading + meta | page-built `.device-section-heading` | extract into the device part, raise meta |
| Fan card (heading, summary, Segment, slider, Save, helper) | page-built `.device-control*` + `SentriUI.segment` + `SentriUI.button` | extract, then raise summary, speed, helper |

## Self-crit

(written after the directions are rendered)
