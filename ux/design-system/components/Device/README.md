# Device

The controls of one piece of equipment: the ventilation fan on Environment & devices. It says what the equipment is doing, offers its mode and an optional speed, and saves.

`SentriUI.device({ icon, name, state, mode, speed, save, note, updated })`

## When to use / when not

- **Use** for equipment with a mode and a setting the worker saves.
- **Not** for a read-only status (Row, Facts) or a setting that takes effect at once (Segment alone).

## Anatomy

1. **Heading**: line icon, the equipment name (`row-title`, 16px) and what it is doing now (`meta`, muted).
2. **Mode**: the caller's Segment (Auto / Manual).
3. **Speed** (only when the mode needs it): the label at `input` size and the value in mono `figure` at the right, over a slider with a 48px target. The value is the figure the worker sets, so it is the largest thing in the card.
4. **Save**: the caller's primary Button, the one dark control.
5. **Note**: one `caption` line (the preview caveat, or "Reconnect to change device settings.").
6. **Updated**: `meta`, green, after a save.
7. **Surface**: Panel.

## Variants

- [Fan](variants/fan.html): the one card.

## States

| State | Appearance |
|---|---|
| Auto | No speed row; Save is waiting until something changes. |
| Manual | Speed row with the slider. |
| Saved | The state line and the updated stamp say what was saved. |
| Offline | Mode, slider and Save are disabled with their surface and rim, text stays ink; the note says why. |
| Long label / Chinese | State and note wrap. |

## Behaviour

The page owns the events: Segment `data-action="fan-mode"`, the slider's `input` event (id `speed.id`, value shown in `<id>-value`) and Save. Preview only: no command is sent.

## Accessibility

The slider is named by the speed label (`aria-labelledby`); the value is an `output` for the slider. All targets are 48px.

## Related

[Segment](../Segment/README.md), [Button](../Button/README.md), [Panel](../Panel/README.md), [Trend](../Trend/README.md).

## Classification

Component (candidate). Extracted from Environment & devices.
