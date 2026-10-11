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

The PREVIEW badge in the header is 9px mono (check-legibility, the one small-text node left on all four screens); raised to 11px (minor, fixed).

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

Compared at 390 and 360, EN, same states (Today, 7 days, Humidity, fan Manual, offline). The prototype ignores `?lang=zh`, so ZH is shown only in the component variants.

### Direction A: fix in place (chosen)

The card stays as drawn; only the problem parts change. Extraction came first and was rendered against main (Panel surface: radius 16 to 18, padding 14 to 16, colours moved to tokens; otherwise identical).

- **Problem 1 fixed.** Fan speed: label 11 to 16px, value 11px to 21px mono (the number being set is now the card's hero). Slider unchanged.
- **Problem 2 fixed.** Fan state line 10 to 13px.
- **Problem 3 fixed.** Low / High values 10 to 13px ink (500), labels 11px.
- **Problem 4 fixed.** Axis labels 9 to 11px-equivalent at 390 and 360 (drawn at 1.1x the caption size so the scaled chart stays at or above 11px), fill `muted` (5.4:1).
- **Problem 5 fixed.** Last reading 10 to 11px.
- **Problem 6 fixed.** History summary 13px in a 48px target; table 13px; "Sample readings" 11px; Devices is a Heading (16px, meta 13px) instead of a 13px title with a 10px word.
- **Problem 7 fixed.** "Sample readings · connected" is now "Sample readings"; the repeated "Temperature" label above the figure is not drawn (the selected tab says it; it stays for screen readers).
- **Problem 8 fixed.** The page CSS for both cards, chart, fan block and the Devices heading is deleted; `Trend` and `Device` (new, candidates) draw them on `Panel`.
- **Found while rendering, same screen:** the page-wide `button:disabled{opacity:.45}` faded the offline Auto / Manual / Save to 2.6-2.7:1 against the "disabled is not faded" law, and the disabled Save lost its surface (the layered base rule loses to the page's `button{background:transparent}`). Scoped fix: `.environment-page button:disabled{opacity:1}` and the disabled face on `.st-device .button.primary`. The offline page now fits 844px, so its "Reconnect to change device settings." line is visible without scrolling (it was cut).

Keep items: reading hero 34px mono, same place, same weight and still the largest thing; tabs, period toggle, chart shape, one card per topic, one dark control, speed only when Manual: all as strong as before.

Squint test (390, Temperature): the eye lands on 22.4, then the chart line, then the fan card (Manual segment, 45%, Save). The worker's questions: what is it now (1), has it moved (2), what is the fan doing and can I change it (3). Match.

Owner's eye: c1 (everything bigger)? No: quiet text stays at 11px (stamp, axis, note); only values read or set grew (Low / High, fan speed, state line, Devices heading). c2 (flatter)? No: same cards and headings, one more native Heading. c3 (bulkier)? No: no box or bold added; the Save button is the same width as before (content-width). Same product as Farrowing: light panel, one hero, quiet support.

Rejected examples it could show: R14 (enlarging to clear a floor) is avoided by the cut (label, "connected") and by keeping quiet text at 11px; R15 (flat) not applicable; R16 not applicable (no new stack).

**better because** the numbers a worker reads and sets (speed, Low / High, fan state) are now legible in the barn, the offline state is readable and fits on one screen, and the page no longer hand-builds colour, type or borders.

### Direction B: full-width Save and Low / High as a chart caption (tried, dropped)

Full-width Save at the foot of the fan card made the card heavier than the sensor card (c3) and widened the one dark control; Low / High at 16px bold-ish read as a heading row under the chart. Dropped: **not better** than A.

Hand-over: A.
