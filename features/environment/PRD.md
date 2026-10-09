# Environment & devices 环境与设备

## Problem

A worker in a unit needs to see whether the room is right (temperature, humidity, ammonia), to set the ventilation fan, and to report and close equipment faults, without leaving the unit. The old UI has no such place; faults and sensors were scattered across Inspection.

## Who

Floor workers and supervisors responsible for a unit.

## Anchor

None. Two groups: Sensors and devices; Maintenance. The only lifecycle is an issue: open, then resolved.

## Rules

- Environment lives at the unit, one tap from Home. Inspection no longer carries sensors, batch tracker or maintenance.
- A sensor with no numeric reading is omitted, never shown as 0. A unit with neither readings nor devices has no entrance. A controllable device is independent of readings.
- Readings: Temperature °C, Humidity %, Ammonia ppm NH₃, each with last-reading time, a Today or 7-day trend, low and high, and a reading-history table.
- Fan: Auto (follows the unit schedule) or Manual with a speed 0-100 in steps of 5; an explicit Apply; everything disabled offline with "Reconnect to change device settings."
- Maintenance is unit-scoped: open-issue count; Report issue (equipment, location in the unit, note, all required); issue detail with Mark resolved. The open count feeds the Maintenance chip on the unit hub.
- All data is sample; no command is sent to equipment (PREVIEW badges).

## Scope

In: sensors, fan, maintenance list, report and resolve.

Out: real sensor feeds, alerts and thresholds, photos or assignees on issues, devices other than the fan, cross-unit views.

## Decisions

- Decided (ASTRA-HOME-DIRECTION): environment and maintenance belong to unit Home; Inspection does not repeat them.
- Open: alert thresholds and who is told; whether the Maintenance chip should link to the list (today it is reached only through Toolbox); whether issues get priority, photo, assignee and a resolver stamp; which other devices are controllable; whether Farrowing and Breeding units get an entrance (the sample has none).
