# Attention budget: Environment sensor screen

## Inventory

Every fact the four screens can show: unit name; PREVIEW badge; the three sensor names; the selected sensor's name; its current value and unit; the last-reading time; the Today / 7 days toggle; the chart (line, fill, three gridlines, three y labels, three x labels, 8 or 7 dots); Low and High with units; the reading history table (8 or 7 rows of time and value); "Sample readings"; connected or offline; "Devices"; the connection tag; the fan name; the fan's mode text ("Auto · following unit schedule" or "Manual · 45% speed"); the Auto / Manual segment; "Fan speed" and its live percentage; the slider; Save setting; "Preview controls only · no command is sent"; "Reconnect to change device settings"; the "just now" stamp after saving.

## Questions

1. Which unit and which reading am I looking at? (header, tabs)
2. Is it OK right now? (the value)
3. Is it stable or moving? (the chart, Low / High)
4. How fresh is it? (last reading)
5. Is the fan doing what it should, and can I change it? (fan mode, Save)
6. Can I trust this? (offline, sample data)

## Levels

| Level | Facts |
|---|---|
| Act now | none on this page is urgent; the single action is Save setting (the one ink control, only live when the draft differs) |
| Watch | the current value (hero), the chart; the fan mode and speed |
| Coming up | n/a |
| Settled | Low / High, y and x labels, last-reading time, Reading history |
| Audit | last-reading time, "just now" after saving, preview-only and offline notes (smallest, quiet) |

Weight follows the questions: the reading (Q2) is the heaviest, then the chart (Q3), then the fan card (Q5). The connection state (Q6) qualifies the facts, so it is quiet and said once.

## Budget against real space

390 x 844 with the real header (about 105px) and bottom padding: header, tabs (56), sensor card, then the Devices heading and the fan card must show their segment and Save control. Today the sensor card is about 450px and the fan control's Save sits on the fold. Target: the card shrinks by at least 90px so Auto / Manual and Save setting are fully on screen for the default state (connected or offline).

## Cut list

- Nothing is said twice that was not already; the two connection lines say different things (the readings are last-known; the fan is unreachable), so both stay, quiet.
- The two-line "Last reading / 09:40" block becomes one quiet "Last reading 09:40" line beside the sensor name.
- The chart is 184 to 150 units tall; its three x labels and three y labels stay (all legible at 11px).
- No new facts, no zero, no new colour.

## Hierarchy and squint test

The first three things the eye lands on must be: (1) the 34px reading; (2) the trend line; (3) the Auto / Manual control with Save. In order, these answer "is it OK", "is it moving", "can I change the fan". Written again against the render in critique.md `## Self-crit`.
