# Attention budget: Environment sensor screen

## Inventory

Per sensor (Temperature, Humidity, Ammonia): sensor name, current value, unit, last-reading time, period (Today / 7 days), 8 or 7 chart points, three y gridline values, three x labels, Low, High, the reading history table (8 or 7 rows of time and value), "Sample readings" caveat, connected or offline word. Devices: heading, connection word, fan name, fan mode (Auto, Manual), fan speed (when Manual), Auto or Manual speed line, Save setting, preview caveat or reconnect hint, "updated" stamp after a save. Page: back, title, unit, PREVIEW badge.

## Questions

1. Which room am I in, and which sensor am I looking at? (header, selected tab)
2. What is it now, and is it fresh? (the reading, last reading time)
3. Has it been steady or moving? (chart, Low / High)
4. What is the fan doing, and can I change it? (fan state, mode, speed, Save)
5. Is this real or offline or sample? (caveat, connection word)

## Levels

| Level | Facts |
|---|---|
| Act now | Save setting (only when there is something to save) |
| Watch | Reading with unit; the fan's current state; fan speed while the worker sets it |
| Coming up | none |
| Settled | Chart, Low / High, y and x labels |
| Audit | Last reading time, "Sample readings", connection word, "updated" stamp, history table (behind its link) |

Order of weight, which the eye must follow: the reading (34px), then the fan state and speed, then chart and Low / High, then the quiet audit text.

## Cut list

- "· connected" in the helper under the chart: the Devices heading already says Connected. "Sample readings" stays alone; offline keeps its sentence because the heading word only qualifies devices.
- Nothing else is cut: the budget is already light (one reading, one chart, one fan). The pass raises only what is read to act on (fan speed, fan state, Low / High) and leaves quiet text at the 11px floor, so the hero stays the hero.

## Squint test (target)

The eye lands on: 22.4, then the tabs/chart shape, then the fan card's segment and Save. That matches questions 2, 1 or 3, 4.
