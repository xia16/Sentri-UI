# Budget: Environment sensor screen

## Inventory

Everything the screen could show, for one unit (Unit 7) in both connection states:
sensor name (3 tabs) · selected reading and unit · last reading time · period toggle (Today / 7 days) · chart line, three y values, three time labels · Low · High · reading history (8 rows Today, 7 rows 7 days) · "Sample readings" note · connection word (offline / connected) · Devices heading · Devices connection tag · device name · device mode line (Auto, following schedule / Manual, N%) · Auto / Manual · fan speed label and value · slider · Save setting · "Reconnect to change device settings" · "Preview controls only, no command sent" · "Preview setting applied, just now" · PREVIEW tag.

## Questions

In order the worker asks them:
1. What is the reading, and is it OK?  (hero; the chart's range answers "is it normal")
2. How fresh is it, and can I trust it right now?  (last reading time; offline or not)
3. Has it been stable or moving?  (chart, Low, High; period toggle)
4. Is the fan on its schedule, or did someone set it by hand?  (mode line)
5. Can I change it, and if not, why?  (controls; offline reason)
6. What are the exact readings?  (history, rarely)

## Levels

| Level | Shown |
|---|---|
| Act now | nothing is urgent here; the only act is Save setting (the one dark control, present only when a change is pending or possible) |
| Watch | the hero reading with its unit; the fan's mode line |
| Coming up | none |
| Settled | chart, Low / High (Low and High values are read against the hero, so 13px; their labels 11px grey), reading history behind a disclosure |
| Audit (quiet, 11px) | last reading time, chart axes, "Sample readings" note, helper under the fan |

Cut list:
- **Devices connection tag** ("Offline" / "Connected"): says what the chart note and the fan helper already say (the offline fact is stated twice, not three times, and each beside what it qualifies: readings and the disabled controls).
- Nothing else is cut: every other item answers a question above.
- No enlarging of quiet text beyond 11px; only values read against the hero or acted on go to 13px.

Real volume: 3 sensors, 8 chart points, 1 fan per unit (a unit has at most the fan today), so the screen is one scroll of two cards at 390x844 (fits without scrolling when offline).
