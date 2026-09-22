# Piglet mortality

Figma nodes: `2857:7199`, `2889:7987`, `2889:8203`, `2900:13209`, `2900:13922`.

## Intent

Support both animals with identity and deaths from the unidentified part of a litter. A blank cause must not silently mean “unknown.”

## Interaction

- Entry: **Piglet records → Report mortality**, or the sow Production actions.
- Select one or more identified piglets in the roster.
- Optionally add an unidentified quantity with a stepper.
- Choose one explicit cause, including **Cause unknown**.
- Photos are optional and stay attached to this mortality record.
- Save is disabled until there is at least one subject and one cause.

## Commit behavior

One save marks selected identified piglets dead, decreases the unidentified count, updates the litter's live/dead totals, and creates a readable history event. The prototype uses one cause per save; mixed causes require separate passes.
