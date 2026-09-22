# Treatment

Figma nodes: `2632:16590`, `2583:20812`, `2583:20308`.

## Intent

Record medicine that was actually administered. The flow must work for one pig and a selected roster without implying that every pig received an identical dose.

## Current coverage

The Inspection prototype already supports the important capabilities:

- searchable, categorized medicine selection;
- method and unit selection;
- shared dose plus per-pig dose overrides;
- optional brand, linked condition, and note editors;
- a scrollable selected-pig roster with inclusion controls;
- a disabled Save state until the required fields are complete.

## Remaining production requirements

- Medicines, formulations, methods, and units should come from farm configuration.
- The target disease and symptom fields should continue to use the shared condition catalogue.
- A task-triggered treatment may prefill the target and medicine, but the user must still confirm what was administered.
- Saving a batch action creates one treatment record per included pig.

No parallel treatment UI was added to Farrowing; the shared sow Actions surface remains the entry point.
