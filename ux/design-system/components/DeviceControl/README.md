# DeviceControl

One piece of equipment the worker can set: its name and mode, a mode switch, a speed slider in Manual and one Save button. Environment & devices uses it for the ventilation fan.

Use [Row](../Row/README.md) instead for a device that only opens a page; use [Stepper](../Stepper/README.md) or [Measure](../Measure/README.md) to record a number about an animal.

`SentriUI.deviceControl({ name, icon, status, modes, speed, save, note, updated })`

## When to use / when not

- **Use** for equipment with a mode and, in Manual, one level (a fan speed, a heater setpoint).
- **Not** for a record of something that happened (use a record sheet) or for a list of devices (use Row group).

## Anatomy

1. **Panel**: the one surface.
2. **Name and status**: the equipment name (14px, medium) with its icon, and under it the current mode in quiet text ("Auto · following unit schedule", "Manual · 45% speed").
3. **Mode**: a [Segment](../Segment/README.md) view switch the host passes in (`Auto` / `Manual`).
4. **Speed** (Manual only): the label, the live percentage in 16px mono at the right, and a 48px-tall slider in ink.
5. **Save**: the one dark control. Waiting (grey, ink label) while the draft equals what is applied, or offline.
6. **Note and stamp** (optional): one quiet line under Save, and the time it was last set.

## Variants

- [Equipment](variants/equipment.html): the one card.

## States

| State | Appearance and behaviour |
|---|---|
| Auto | Name, status, mode switch, Save waiting. No slider. |
| Manual | The slider appears; moving it updates the percentage; Save goes live once the draft differs from what is applied. |
| Applied | Status reads "Manual · 70% speed" and the stamp says when. |
| Offline | The mode switch, slider and Save are disabled; Save keeps its grey face and the note says why. |
| Long label / Chinese | The name wraps under its icon; the percentage and the slider keep their size. |

## Behaviour

The host owns the draft and the applied setting; the card draws them. The slider is a native range input (0-100, step 5) with the id the host gives it, so the host listens for `input`. The card never sends a command: Save only raises the host's action.

## Content rules

The note is one short sentence. The status line never repeats the percentage in the slider while the slider is open: in Manual it reads the applied value, which differs from the draft.

## Accessibility

Native range input with a label; the percentage is an `output`. Save uses the waiting face with `disabled`, so it cannot be tapped while waiting. Targets are 48px.

## API and tokens

Uses panel, ink, muted, disabled-fill, tap-min, space-2 to space-14, size-20, type-description-size, type-row-title-size and font-mono.

## Related components

Segment (the mode), Button (Save), Panel (the surface), SensorTrend (the readings above it), Heading (the "Devices" section title).

## Classification

Component: generic, built for Environment & devices.

## Changelog

2026-10-11: extracted from the Environment page pixel-identical, then fixed: the slider is ink, not green; the waiting Save has a surface instead of 45% faded text; status, note and label text no longer 10-11px grey; the Panel surface and tokens.
