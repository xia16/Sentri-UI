# Environment: attention budget

Scope: `environment.page`, `environment.sensor-week`, `environment.sensor-other`, `environment.fan-manual` (the sensor and fan page of a unit). Maintenance screens are out of scope. Written before any layout (build brief 1b). Baseline: `origin/main` at 3dc7e94, each screen bare at 390 x 844 and 360 x 844.

## References

| Job | Where it exists today | Status | Baseline | Commit |
|---|---|---|---|---|
| Read a unit's sensors, set the fan | the four screens above (`ux/system/home-astra-prototype.js`, `environment()`; hand-built chart and cards, page CSS in `home-astra-prototype.css`) | in-design | before/environment.*/en-390.png and en-360.png | 3dc7e94 |
| The sensors as a glance from the unit | `workbench.unit` environment card (three readings and a chevron); `inspection` unit summary (hand-built chips) | in-design; neighbours, not in scope | before/workbench.unit/en-390.png | 3dc7e94 |
| Segments, panels, facts, banner, stepper, button | `ux/design-system/components/` (Segment, Heading, Panel, Facts, Banner, Stepper, Button, Row, Sheet) | the system; none approved on a screen of this feature | n/a | 3dc7e94 |
| Charts | none in the design system; hand-built SVG on this page only | gap, proposed in `_proposed.json` | n/a | 3dc7e94 |
| Old UI | `references/figma/index.json` has no sensor, fan or room-environment flow (the feature is new; the PRD says the old UI had no such place; "环境样本" in Sampling is lab sampling, not sensors) | none | n/a | n/a |
| Approved screens | none for this feature (no `approvals.json`); no section pattern covers a sensor or device page | none | n/a | n/a |

Chinese: the page does not render Chinese (`?lang=zh` is ignored; the shoot reports "no zh rendering"), so ZH fit is unverified here, on the baseline and after.

## Inventory

Everything the page can say, per state.

- Header: title "Environment and devices", unit, PREVIEW badge.
- Per sensor (Temperature, Humidity, Ammonia): name, current value, unit, last-reading time (one time for all three).
- Selection: which sensor the chart shows (3 tabs).
- Period: Today (8 points, 00:00 to the last reading) or 7 days (7 points).
- Chart: 3 y labels, 3 x labels, line, points, fill, grid.
- Low and High of the plotted points.
- Reading history: a table of the same points (time, value).
- Connection: offline or connected. Said today in three places: the chart helper, the Devices tag, the fan helper.
- Sample-data disclaimers: PREVIEW badge, "Sample readings", "Preview controls only, no command is sent".
- Fan: name, applied mode (Auto following the unit schedule, or Manual with a speed), draft mode, draft speed (0-100, steps of 5), Save, the applied receipt "Preview setting applied, just now", the toast.
- States: offline, connected, Manual draft, applied, no device (Devices absent), a missing sensor (tab absent, never 0), no readings at all.

## Questions

In the order a worker asks them, standing at the unit:

1. Which unit is this, and is this real?
2. Is the room right now? (all three readings, without tapping)
3. Is that fresh? Do I have a signal?
4. Which way is it going: was it fine overnight, this week?
5. What is the fan doing?
6. Can I change it, and how?
7. Did my change take?

## Levels

| Level | Facts |
|---|---|
| Act now | Offline: the one loud element, a notice that says readings are the last ones and the fan cannot change. Absent when connected. Nothing else shouts: the page reads, and the fan is changed in a sheet. |
| Watch | The three current readings, together, with the selected one marked. The fan's applied state (Auto or Manual 45%) as a row. |
| Coming up | none (no thresholds, no schedule on this page) |
| Settled | The trend chart with its Low and High, marked where they happened. |
| Audit | Last reading time. Sample-data note in the header. The reading history, behind the Trend heading's link. |

## Budget against real space

Real volume: 3 sensors, 8 chart points, 1 fan, the real header, no bottom bar (the page has a Back in the header). At 390 wide the first screen holds the header, the notice (offline only), the sensors control, the Trend panel and the Devices row. One section per question: Sensors, Trend, Devices, each under its native heading, the page ending on a group. At most one coloured element per row: the offline notice is the only amber; the chart line is `ink`, not green (green means done). Nothing the header already says: the unit stays in the header only.

## Cut list

- The big current value under the tabs: the tab itself now carries the value, so a reading is not said twice, and all three are visible at once.
- "Last reading" as a right-hand block with a line break; now one muted line under the section title.
- Offline said three times (chart helper, Devices tag, fan helper): now once, in the notice, only when offline. When connected, nothing says "connected".
- "Preview controls only, no command is sent" helper and the "Sample readings" helper: the header says "sample data"; the save toast still says no command was sent.
- The PREVIEW badge (9 px, below the type floor): replaced by the header description.
- The Offline / Connected tag on the Devices heading: the notice says it once.
- The 3 y-axis labels and the Low / High line: the chart marks its own low and high on the line, so the range is read where it happened.
- The applied receipt line "Preview setting applied, just now": the fan's status line already becomes "Manual, 70% speed" and the toast confirms; it was a third statement.
- The always-open reading table: behind a "View history" link in the Trend heading, which opens a sheet, because it repeats the chart points.
- The fan's inline controls (Auto, Manual, speed, Save, with their greyed offline faces; the disabled segment measured 2.7:1): the page only reads. One row, "Ventilation fan · Auto · following unit schedule", opens a sheet with the controls and Back / Save. Offline the row is read-only, so nothing is greyed. Save appears only once the draft differs from the applied setting.
- The range slider: replaced by a stepper (5 % a tap), which a gloved thumb can hit; the 0-100 in steps of 5 rule is unchanged.

## Hierarchy

Squint test on the built screen, connected: the eye lands on (1) the three readings in the segmented control, with the selected one raised, (2) the chart line with its High marked, (3) the Ventilation fan row at the end. Offline, the amber notice comes first, which is right: it is the one thing that changes what the worker can do. The three are the answers to "is the room right", "which way is it going" and "what is the fan doing", in that order.
