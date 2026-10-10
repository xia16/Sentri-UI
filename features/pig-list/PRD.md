# Pig list 猪只列表

**Draft — compiled from existing docs, not yet confirmed.**

## Problem

The old UI keeps a pig list in its own Figma file (21 screens in the Chinese section, an English copy repeats them): the farm's pigs with filter and a more-actions button, then pig detail, health management, all events and edit pig info. Pig detail and health management are already built as pig-profile and health-record inside the Inspection prototype, so only the list itself and the identity-assignment flow are not shown by a built screen.

## Who

The worker finding or tagging a pig (gloved, one hand free) and the supervisor reading pig records. The section's shared note says search takes an ear tag or ear notch, and that untagged pigs appear as groups where one row means several head.

## Anchor

None yet.

## Rules

From the place workflow deck (assign identity):

- One sheet, required fields first: Tag and Sex are required; Notch and Parents are optional, so there is no step wizard and no Skip-per-step.
- Each Confirm saves that pig. There is no batched submit. Saving migrates the pig's batch from the pen's partition to the animal record (one head leaves the pen's batch row).
- The tag is pre-filled from the last one plus 1; sex is not carried forward because a litter is mixed.
- A notch entered pre-fills Sex (editable, source named); a known litter opens Parents as read-only cards.
- A verb that must pin to an individual (cycle events, the breeding mark) runs identity for an untagged pig first and then opens its own sheet; backing out keeps saved identities and never writes the mark.

## Scope

In: the screens below. The old file's pig detail, health management, all events and edit entries are shown as the same screens as pig-profile and health-record (aliases).

Out: the list itself, its filter and more-actions button (placeholder; only drawn in the old Figma); the Piglet processing identity flow ("Give IDs", owned by Tasks).

## Screens

- Placeholder: Pig list (old UI only).
- Same as pig-profile / health-record: Pig detail, Health management, All events, Edit pig info.
- Assign identity (place workflow deck): one pig, tag keypad, from the notch, breeding stock with an untagged pig.

## Open questions

- Where does the pig list live in the new app: the Pigs section promises untagged groups and ear-notch search, and no screen shows them (backlog).
- How does Assign identity relate to Piglet processing's identity step (filed as a decision in the backlog)?
- Whether the notch-to-sex table is farm config or breed convention (open in the deck).

## Sources

- Old UI: Figma 猪只列表 file, https://www.figma.com/design/ZnHLToEqmWREEgMXsu8ZvZ?node-id=6003-11580
- `ux/system/workflows/place.html` (wf-identity), shown through `ux/archive/workflows.html?sec=wf-identity`
- `review/inspection-group.json` (items on the Pigs section and "Pig list entry has no source screen")
