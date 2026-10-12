# Critique: Environment sensor screen (polish)

Scope: `environment.page`, `environment.sensor-week`, `environment.sensor-other`, `environment.fan-manual`, all drawn by `ux/system/home-astra-prototype.js` `environment()`. Baseline: origin/main `15db35c`, shots in `/tmp/claude-0/s/before/<id>/en-{390,360}.png`.
Held against: Unit (the Environment card it opens from), More actions (small headings outside white cards), Farrowing room (mono hero, quiet support).

## Keep

- **The 34px mono reading (`22.4 °C`).** It is the first thing the eye lands on and answers "is the unit OK?". Light weight, big because everything near it is small. Stays the largest thing, same position.
- **Sensor tabs on top (Temperature / Humidity / Ammonia).** One Segment, selected tab is the white pill; picks which reading the card shows. Stays first.
- **One white card for reading + period + chart.** One card per topic, thin line, soft radius; matches the house references. Stays one card.
- **The chart itself.** One green line with a soft fill, three gridlines, three time labels; reads as a trend at a glance. Stays as drawn.
- **Devices as a second small heading plus one card.** Native section heading outside the card, as in More actions.
- **The single dark control (Save setting)**, shown only for a changeable fan, and Auto / Manual as a Segment. The slider appears only in Manual (optional input is optional).
- **Sensors omitted when missing, never 0.**

## Problems

1. **Text below the 11px floor (major).** `check-legibility` reports 33-37 small nodes per screen. Named: chart axis labels 9px; "Last reading 09:40" 10px; "Low / High" 10px; the helper line 10px; the fan subtitle "Auto · following unit schedule" 10px; the Devices tag 10px; the reading-history table 10px.
2. **Acted-on or read values at quiet size (major).** Low and High values (10px) are the numbers the worker compares the reading with; "Fan speed 45%" label and value are 11px next to a control; the "Reading history" disclosure is a control at 11px (floor 13px).
3. **Chart axis labels fail contrast (minor, `3 contrast` on three screens).** Fill `#78826f` on white is under 4.5:1.
4. **The offline fact is said three times (major for the information budget).** Chart helper ("offline, showing last available values"), the Devices tag "Offline" and the fan helper "Reconnect to change device settings". The Devices tag also says "Connected" beside "connected" in the helper. The atlas already lists this as an issue.
5. **Reading history is a hand-built web `<table>` in a `<details>`, 10px (minor).** Page-built with its own borders.
6. **The whole screen is page-built (major, owner rule).** `.sensor-detail`, `.device-control`, the chart, range stats and history are styled in `home-astra-prototype.css` / `home-subpages-refinement.css` (colour, border, radius, shadow, type), so none of it can be fixed in one place. The shadow breaks "panels are bordered, not shadowed".
7. **Fan slider target (minor).** `check-legibility` reports 1 target under 48px on `environment.fan-manual`.

## Parts

| Part | Drawn by today | Component whose job it is | Decision |
|---|---|---|---|
| Header, back, PREVIEW tag | page `head()` | none (Home page header) | keep, untouched |
| Sensor tabs | `SentriUI.segment` view-switch | Segment | keep |
| Period toggle Today / 7 days | `SentriUI.segment` | Segment | keep |
| Reading hero, last reading, chart, Low / High, history | page-built (`.sensor-detail*`, `sensorChart()`) | none in the list. Ruled out: Measure (an input), TaskMetrics (two headlines with totals), Facts (never charts), Log (recorded events; draws its own panel: card on card) | extract as it is to a new component `SensorTrend`, then fix problems 1-3, 5 |
| Reading history table | page-built `<table>` | Log, Facts, TaskTable ruled out: Log is for recorded acts and nests a panel, Facts lays two per row and scrambles a time series, TaskTable rows are doors | stays a table inside `SensorTrend`, tokenised, 11px, fixes 1 and 5 |
| "Devices" heading + tag | page-built `.device-section-heading` | Heading (section, with meta) | move to Heading; cut the tag (problem 4) |
| Ventilation fan card (icon, title, mode, speed, save, helper) | page-built `.device-control*` | none in the list (a device with a mode and a setting). Ruled out: Row (acts as one door), Field, Stepper | extract as it is to a new component `DeviceControl` (Segment, Button, slider inside), then fix 1, 2, 4, 7 |
| Auto / Manual | `SentriUI.segment` | Segment | keep |
| Fan speed slider | page-built `<input type=range>` | RangeSlider is a from-to range of two handles; not a single value | keep the input inside `DeviceControl` |
| Save setting | `btn()` primary | Button | keep |

## Self-crit

### Round 1 (extraction, then the fixes)

Extraction first: `SensorTrend` and `DeviceControl` drawn exactly as the page drew them; all 8 renders (4 screens x 390, 360) were pixel-identical to origin/main (`15db35c`). Committed alone. Then the fixes, in the component.

- Problems: 1 fixed (9 and 10px text now 11px; 35 small nodes per screen down to 1, the shared header `PREVIEW` badge, which is page-built, shared with Maintenance and Assistant, and left for a workflow fix). 2 fixed (Low and High values, fan speed label and value, Reading history disclosure at 13px). 3 fixed (axis labels `muted`, 12 viewBox units so they stay at 11px or more at 360). 4 fixed (Devices tag cut; offline is said twice, each beside what it qualifies). 5 fixed (table tokenised and 11px, values 13px; stays a table, reasons in Parts). 6 fixed for these two cards (they now live in the design system; no shadow, panel radius). 7 fixed (the slider's label is no longer a 16px tap target). Offline disabled controls were 2.6:1 because Home's global `button:disabled{opacity:.45}` faded them; DeviceControl now shows disabled with surface and rim, text in ink (contrast 3 to 0).
- Keep list: hero reading, sensor tabs, single card, chart, one dark control, Devices heading outside the card: all unchanged in position and weight. The hero is untouched at 34px; support text moved from 9-10px to 11px and values read against it to 13px, so the ratio hero to support is still large.
- Squint test: 1 the 22.4 reading, 2 the chart line, 3 the Devices card with its segment. Worker questions: reading, how it moved, fan state. Matches in order.
- Owner's eye: c1 (everything bigger)? No: only 11px for quiet, 13px for values read or acted on; the screen is 16px longer. c2 (structure removed)? No: same cards and headings. c3 (bulkier)? One risk: Devices is now the system's 16px section heading (it was 13px); it is lighter than the hero and stays regular-ish weight (500), accepted. Held against Unit and More actions: small headings outside white cards, one dark control, colour only for state (the green line is the data).
- Rejected examples: none of R1-R16 shown that I can see; nothing added is coloured.
- Risk noted: the offline Auto / Manual segment no longer looks faded, so it reads as live; the dashed rim and the helper beneath ("Reconnect to change device settings.") carry the state, as the law requires.
- Not changed, with reason: the PREVIEW badge size (page-built, shared with other screens); ZH (the prototype's copy is literal English); the period toggle sits close under the hero, as before.

**better because** the same screen reads in the barn: no text under 11px, the values you compare with the hero are 13px, the disabled fan no longer fades, and the offline note stops repeating.
