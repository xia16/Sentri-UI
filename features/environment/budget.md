# Attention budget: Environment sensor screen

## Inventory

Every fact the four screens can show, for Unit 7:

- Page: title "Environment & devices", Unit 7, PREVIEW badge, back.
- Sensor tabs: Temperature, Humidity, Ammonia (each has a value; the tab shows only the name).
- Selected sensor: name, current value, unit, "Last reading 09:40".
- Period: Today / 7 days.
- Chart: 3 y-axis values, 3 x labels, 8 (or 7) points.
- Low and High over the period, with unit.
- Reading history: 8 (or 7) time and value pairs.
- Data note: "Sample readings", connected or offline, "showing last available values".
- Devices heading and its Connected / Offline meta.
- Fan: name, mode summary ("Auto · following unit schedule" or "Manual · 45% speed"), Auto / Manual, fan speed 45%, slider, Save setting.
- Fan helper: "Reconnect to change device settings." or "Preview controls only · no command is sent to equipment."
- Fan last-updated line (only after a save).

## Questions

In the order the worker asks, standing in the unit:
1. Which reading am I looking at, and what is it right now?
2. Is it fresh, or is this an old number? (offline, last reading time)
3. Is it going the wrong way? (the trend, and the lowest and highest it has been)
4. Is the fan doing what I think? Is it on Auto or set by hand?
5. Can I change it, and what will it do?

## Levels

| Fact | Level | Shown as |
|---|---|---|
| Current value + unit | Act now (the answer to Q1) | 34px mono, unchanged; the only large thing |
| Sensor name, tabs | Watch | Segment, unchanged |
| Last reading time | Watch (qualifies the reading) | 11px muted, beside the reading, not loud |
| Trend chart | Watch | quiet line, axis labels 11px |
| Low / High | Watch | 13px, label muted, value ink |
| Fan mode and speed | Act now when Manual or Save is enabled | summary line 13px; Save is the one dark control |
| Auto / Manual, slider | Act now (the control) | Segment and slider as they are |
| Data note, connection | Settled (qualifies, never loud) | 11px muted, one line |
| Reading history | Audit | collapsed; cells 13px ink when opened |
| Fan helper | Settled | 11px muted |

## Budget and cut list

Real volume: three sensors, two periods, one fan. The screen fits one 844px frame down to the fan Save button in Auto and down to the speed slider in Manual, as today.

Cut:
- "connected" in the data note ("Sample readings · connected" becomes "Sample readings"): the Devices heading already says Connected.
- Nothing else is cut. The facts are few and each answers a question; the fix is size and quietness, not removal. The hero stays the largest thing, support goes to 11px quiet and the two figures the worker reads (Low, High; fan summary) to 13px ink.

Squint test, expected: (1) the 34px reading, (2) the Today / 7 days toggle and chart line, (3) the fan card with its Save button.
