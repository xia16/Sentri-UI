# Miscarriage

Figma node: `2567:19584`.

## Intent

Record a pregnancy loss as a production outcome and keep the sow's prior records available.

## Current coverage

The existing Farrowing and Inspection prototypes already provide:

- a single-sow production action;
- an explicit warning that the sow leaves the batch while saved records remain;
- a required reason and disabled Save state while it is blank;
- a resulting locked production outcome and history event;
- unavailable-state rules for dead sows and sows with another recorded outcome.

This remains a single-animal action and is hidden from batch actions.
