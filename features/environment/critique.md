# Critique: Environment sensor screen (polish)

Scope: `environment.page`, `environment.sensor-week`, `environment.sensor-other`, `environment.fan-manual`, all drawn by `ux/system/home-astra-prototype.js` (`environment()`, `sensorChart()`). Baselines: `origin/main` ccaa3f2, 390 and 360, EN and ZH. Figma: the old UI has no sensor chart screen (feature is `newFeature: true`), so there is no older design to defer to.

## Keep

- **The reading is the hero.** "22.4 °C" in 34px mono is the first thing the eye lands on and answers "is the unit OK?". Same size, same position (top-left of the card), regular weight.
- **Sensor tabs above the card** (Temperature / Humidity / Ammonia): a fixed set of three subjects of one page, in the native-feel segment. The selected tab is the one filled face. Kept as is.
- **Today / 7 days toggle inside the card.** It changes only this card's chart, so it belongs in the card. Kept.
- **One light card per topic**, sections outside cards ("Devices"), thin line, soft radius: the approved structure. Kept.
- **The trend chart itself**: a single 2.5px line with a faint fill, three gridlines, end dots. It reads at a glance and is the right form. The line, fill and grid are kept; only its labels and height change.
- **Low / High under the chart** (the only two numbers the chart cannot show by itself) and the collapsed "Reading history" table.
- **Auto / Manual segment and the 0-100 slider with a live value** for the fan; everything disabled while offline.
- **Header, PREVIEW badge, unit subtitle**: untouched.

## Problems

| # | Problem | Evidence | Level |
|---|---|---|---|
| 1 | Chart axis labels are 9px (values on the y axis, times on the x axis) | `.sensor-chart svg text{font:9px}`; floor is 11px for quiet text, nothing under 11 | major |
| 2 | "Last reading 09:40", Low / High, history table, helper line, device status ("Auto · following unit schedule"), "Offline" tag and fan label are 10-11px, with grey text on the card (`#78826f` axis text is below 4.5:1 on white) | `check-legibility` and the CSS: 10px on `.sensor-range-stats`, `.sensor-history table`, `.device-control-heading p`, `.device-section-heading>span`, `.helper` | major (legibility floor) |
| 3 | The period toggle touches the 34px reading: no air between the hero and the control that follows it, so the reading is crowded and the card reads as one block | 390 shot, `environment.page`: reading baseline to toggle top is about 8px | minor |
| 4 | The sensor card is 450px tall, so the fan control starts at the fold and its Save button sits under it at 844 (the one control on the page that changes anything) | 390 shot: "Save setting" is cut off at the bottom edge; chart is 184 viewBox units tall plus Low/High, history, helper | major (the only action is off-screen) |
| 5 | "Reading history" is a bare line with no sign that it opens (no chevron), and the helper line sits below it, so the card ends on two grey lines | 390 shot | minor |
| 6 | The fan slider is filled green. Green means done / approved only | `accent-color:var(--green)` on `#fan-speed` | minor |
| 7 | The page hand-builds its card, chart, device card and sensor styles in `home-astra-prototype.css` with its own colours, borders, radii and type (`.sensor-detail`, `.sensor-chart`, `.device-control`...), against the design-system-only rule | CSS lines 145-168 | major (process) |
| 8 | The waiting Save setting (offline, or draft equals applied) is the page's one action, drawn as 45%-faded text with no surface and so reads as a stray label; "Disabled is not faded" | 390 shot, `button:disabled{opacity:.45}`, no fill | major |

Not changed (product, not presentation): the bare "Save setting" verb, the sample-data model, the 0% fan question already filed in the notes.

## Parts

| Part | Drawn by | Decision |
|---|---|---|
| Header, PREVIEW badge | `head()` page-built, shared by every Home page | keep, not in scope |
| Sensor tabs | SentriUI Segment (view-switch) | keep |
| Reading card (name, hero, last reading) | page-built (`.sensor-detail*`) | extract to SentriUI `sensorTrend`, then fix (2, 3) |
| Period toggle | SentriUI Segment (view-switch) | keep, inside the extracted card |
| Chart, Low / High | page-built SVG (`sensorChart`, `.sensor-chart`, `.sensor-range-stats`) | extract as-is, then fix labels and height (1, 2, 4) |
| Reading history | page-built `<details>` | extract, add the chevron (5) |
| Connection helper line | page-built `.helper` | keep, quiet, move into the card as its note |
| "Devices" heading and tag | page-built | use SentriUI Heading section with meta |
| Fan card (title, status, segment, slider, Save) | page-built (`.device-control*`) | extract to SentriUI `deviceControl`, then fix (2, 6) |
| Auto / Manual | SentriUI Segment | keep |
| Save setting | SentriUI Button | keep the verb and position; give the waiting face a surface (8) |
