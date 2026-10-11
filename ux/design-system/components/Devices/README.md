**Status: candidate.** Extracted from the Environment screen's page-built device card (`.device-control`), then raised to the farm floors. Not approved.

# Devices

The equipment of one unit under a section title with its connection: today the ventilation fan with Auto / Manual, a speed slider in Manual and one Save setting button.

Call `SentriUI.devices(items, { status })` and `SentriUI.deviceControl({ name, summary, modeHtml, speed, speedId, offline, saveHtml, helper, updated })`. The page builds `modeHtml` (a [Segment](../Segment/README.md)) and `saveHtml` (a [Button](../Button/README.md)); `speed` is a number only in Manual, else `null`.

## When to use / when not
- Use for a unit's controllable equipment. Not for a fault report or a maintenance record, and not for a sensor (use [Sensor](../Sensor/README.md)).

## Anatomy
1. **Section title** "Devices" (13px, 500) with the **connection** at the right (13px `muted`: Connected / Offline).
2. **Card** (`st-panel`): **name** (13px, 500) over the **summary** (13px `muted`: "Auto · following unit schedule" or "Manual · 45% speed").
3. **Mode Segment**.
4. **Speed** (Manual only): label and value 13px `ink`, a slider at the 48px tap height.
5. **Save setting**: the one dark control; disabled until the draft differs from what is saved.
6. **Helper** (11px `muted`) and an optional **updated** line (11px `green`).

## Variants
- [Fan](variants/fan.html): the ventilation fan.

## States
Auto · Manual · Offline (Segment, slider and Save disabled; the helper says "Reconnect to change device settings."). No reason line sits above the disabled button.

## Content and wrapping
The summary and helper wrap; the name never does. Chinese uses the same sizes.

## Accessibility
The slider has a visible label and an `output` for its value; the Segment states its pressed option; disabled controls are natively disabled.

## Do / don't
Do keep one dark control. Don't show a speed slider in Auto.

## Related
[Sensor](../Sensor/README.md), [Segment](../Segment/README.md), [Button](../Button/README.md).

## Classification
Component, candidate. One feature uses it today (Environment).
