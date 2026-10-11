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
| Act now | Offline: the one loud element, a notice that says readings are the last ones and the fan cannot change. Absent when connected. When connected and in Manual: the speed stepper and Save, the only heavy control. |
| Watch | The three current readings, together, with the selected one marked. The fan's applied state (Auto or Manual 45%). |
| Coming up | none (no thresholds, no schedule on this page) |
| Settled | The trend chart with its Low and High, marked where they happened. |
| Audit | Last reading time. Sample-data note in the header. The reading history, behind one row. |

## Budget against real space

Real volume: 3 sensors, 8 chart points, 1 fan, the real header, no bottom bar (the page has a Back in the header). At 390 wide the first screen holds: header, the sensors control, the chart panel; the fan starts below it. At most one coloured element per row: the offline notice is the only amber; the chart line is `ink`, not green (green means done). Nothing the header already says: the unit stays in the header only.

## Cut list

- The big current value under the tabs: the tab itself now carries the value, so a reading is not said twice, and all three are visible at once.
- "Last reading" as a right-hand block with a line break; now one muted line under the section title.
- Offline said three times (chart helper, Devices tag, fan helper): now once, in the notice, only when offline. When connected, nothing says "connected".
- "Preview controls only, no command is sent" helper and the "Sample readings" helper: the header says "sample data"; the save toast still says no command was sent.
- The PREVIEW badge (9 px, below the type floor): replaced by the header description.
- The "Devices" section heading with its Offline/Connected tag: the fan has its own title.
- The 3 y-axis labels and the Low / High line: the chart marks its own low and high on the line, so the range is read where it happened.
- The applied receipt line "Preview setting applied, just now": the fan's status line already becomes "Manual, 70% speed" and the toast confirms; it was a third statement.
- The always-open reading table: behind one row ("Reading history"), because it repeats the chart points.

## Hierarchy

Squint test, after the build, in the PR body: the three things the eye lands on must be (1) the three readings, (2) the chart, (3) the fan.
