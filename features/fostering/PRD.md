# Fostering (寄养)

Draft — compiled from existing docs, not yet confirmed.

Section: Breeding · Platform: mobile · Prototype: `ux/tasks/piglet-processing/move.html?state=move` (the full Piglet processing task's Move piglets drawer). Sources: `ux/tasks/piglet-processing/dead-contract.md`, `parity.md` (13 · Move), `ux/research/farrowing/RULINGS.md` (After the lock; Round 2 Q12-Q14), Figma Inspection file 记录-寄养 (`node-id=60-408`).

## Problem

Piglets are moved between litters (fosters, nurse sows, strays, across rooms). One move changes two litters at once, and the receiving litter inherits what the moved piglets owe or have had. The old UI covers this in 8 Inspection screens: choose the type, the receiving sow, the piglets, confirm the result.

## Who

- Farrowing and nursery workers moving piglets between crates, gloved, on a phone.
- The supervisor reading the batch's litter counts.

## Anchor

None: a move is an action on two litters, not a thing with a status.

## Rules

From RULINGS Round 2, quoted short:

- "Move (one record changes both litters at once, n piglets from crate A to crate B)": fosters, nurse sows, strays, across rooms too.
- Q13: "Move opens only on litters whose farrowing is locked"; before the lock the farrowing sheet owns the count.
- Q14: what moved piglets owe follows the source's done / not done doses; when the source is partly done the Move asks per treatment.
- The ledger: Alive = Born − Dead − Moved out + Moved in ± Unexplained − Weaned.
- Fostering in farrowing is **parked** (RULINGS After the lock).

## Scope

The four screens drawn here are states of the one Move drawer, mapped to the old UI's four steps: direction and other crate, search for the receiving crate, which piglets, the result before Save. Farrowing's own Foster piglets page and the simple prototype's Move are separate designs; see Decisions.

## Decisions (open)

- To confirm: fostering is drawn three times (farrowing.foster, this feature's Move drawer, piglet-processing.move-piglets); see `review/piglet-fostering.json`.

## Links

Old UI Figma: https://www.figma.com/design/4GZGPBauEOWQQjnRrzoUgF?node-id=60-408 · `ux/tasks/piglet-processing/scenarios.md` (s4 fostering).
