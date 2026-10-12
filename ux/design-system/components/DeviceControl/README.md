**Status: candidate.** Extracted from the Environment screen as it was drawn, then fixed for the farm legibility law. Not approved.

# DeviceControl

One controllable device (today, the ventilation fan): its name and mode line, an Auto / Manual choice, a speed slider in Manual, one save, and the line that says why it cannot change.

Call `SentriUI.deviceControl({ icon, name, status, mode, speed, save, helper, updated })`. `mode` is a Segment (`{ options, active, action, ariaLabel, disabled }`); `speed` is `{ id, label, value, disabled }` or `null` (Auto); `save` is a Button (`{ action, label, disabled }`).

Use [Row](../Row/README.md) for a list of devices to open. DeviceControl is the page of one device. RangeSlider is a from-to range of two handles, so it does not fit a single speed.

## Anatomy

- **Surface**: the panel surface, no shadow.
- **Head**: a 20px line icon, the name (13px/500 `ink`) and the mode line (11px `muted`).
- **Mode**: a Segment, Auto and Manual.
- **Speed** (Manual only): label and value (13px `ink`) over the slider (48px tall).
- **Save**: the one dark Button. Disabled until the draft differs from the applied setting.
- **Helper**: 11px `muted`, one line: why it cannot change (offline) or that a preview sends nothing.
- **Updated**: 11px `green` line after a save (done).

## Variants

- **Fan** — [variants/fan.html](variants/fan.html)

## States

| State | Rendering |
|---|---|
| Auto | mode line `Auto · following unit schedule`, no slider |
| Manual | slider and value |
| Applied | `Manual · 45% speed`, the updated line |
| Offline | Segment, slider and Save disabled: a dashed rim and the disabled surface, text stays `ink` (no faded text); the helper says to reconnect |
| Pressed | the Segment's and Button's own |
| Chinese | same layout |

## Behaviour

`data-action` on the Segment and Save buttons, `input` on the slider (the screen listens by id). Nothing is sent to equipment in a preview.

## Content rules

The status line states the applied setting; the helper never repeats it. The connection word appears once, in the helper.

## Accessibility

The slider is labelled by its visible label (`aria-labelledby`) and its value is an `output`. Targets 48px.

## Do and don't

- Do say the offline reason once, beside the disabled controls.
- Don't fade a disabled control's text.

## Related components

[Segment](../Segment/README.md) · [Button](../Button/README.md) · [SensorTrend](../SensorTrend/README.md) · [Heading](../Heading/README.md)

## Classification

Component, with one variant (fan). Candidate.
