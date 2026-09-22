# Fostering

Figma nodes: `2565:4696`, `3276:6895`, `2650:8271`, `2657:9553`, `2657:9072`, `2657:9355`.

## Intent

Record piglets moving between litters. The action changes two litter counts and must name the other sow.

## Interaction

- Entry: **Actions → Production → Foster piglets**.
- First choose **Send piglets** or **Receive piglets**.
- Choose the other sow from the current unit and set the quantity.
- The quantity cannot exceed the source litter's live count.
- Saving updates the current litter immediately and writes an event containing direction, quantity, and counterpart sow.

Identified-pig selection can be added later. Until then, outgoing transfers reduce the unidentified count first and never fabricate identity records.
