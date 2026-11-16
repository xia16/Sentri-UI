# Move 转移

> In design: the owner reviews it on the canvas (https://claude.ai/artifact/BdBXnZEAP8nLSYJKSexVck); nothing here is merged.

## Problem

Production moved pigs through a tree page, a two-wheel drawer and a confirmation dialog, and a separate full page for groups with uncounted head. The new app then grew three different moves: Inspection's Transfer drawer, Farrowing's sow transfer with unit and pen fields, and a list of pens for her piglets.

## Who

The stockperson moving pigs between pens or rooms, on the spot; the supervisor reading pen counts and pen logs.

## Anchor

Anchor: The placement of a pig or a counted group.

## Move and Transfer

- **Move is the ad hoc move**: a worker moves pigs now, from the phone (owner, 2026-11-09).
- **Transfer is a planned task** the console sends; it never appears in the phone's Actions. Its receiving end is Count's ([features/count](../count/PRD.md)).

## One Move everywhere (owner, 2026-11-16)

The same steps wherever pigs are moved from: a pen page's Move tile, ticked pigs' Actions, a sow's Actions (Farrowing), her ticked piglets' Actions (Farrowing). One variable decides the shape: **one pig or many**, with or without ID.

1. **Which pigs** (only from a pen that holds more than one pig, or pigs without ID): *With ID* is the pen's tagged pigs, ticked by ID behind the search with scan (Farrowing's Send piglets parts); *Without ID* is a count, *of 14*. **Choose pen** is off until a pig is ticked or counted.
2. **To pen**: the room as a row (the pigs' own room by default, *This room*), then that room's **Pen map, neutral**: every pen white, no status colours, the pen the pigs are in greyed. Tap a pen: a 2px ink ring, and the footer names it, **Move to D5**.
3. **Choose room**: another room, even in another section; rooms grouped by section, the pigs' own section first and their room at its top (*This room · 24 pens*).
4. **After**: back where the move started; a toast, *Moved 000801 to D5*; both pens' logs say **moved**, never transferred.

One pig, or pigs already ticked, skip Which pigs and open on To pen (*Move 000267*, *Move 3 piglets*).

## Rules

- **Conditions on pigs without ID do not move with them** (owner, 2026-11-16): they sit on a number, not on pigs, so the moved head arrive with none and the pen they left keeps its own. When the group has conditions, Which pigs says so in the count's hint: **Moving clears their conditions.** Inspection records them again. Pigs with ID carry everything with them.
- The source pen is never a destination: greyed (*the pigs are here*; *her crate* for a sow or her piglets).
- No confirmation dialog: To pen is the confirmation, and its commit names the pen.
- Pen codes are lane labels (A14), never "Pen 14".

## Scope

In: Which pigs; Which pigs · one ticked; To pen; To pen · a pen chosen; Choose room; After · back on the pen; Move a sow · from her record. Farrowing's piglets move on the same step (farrowing.piglets-pen, farrowing.piglets-room).

Out: Transfer (a console task; its receiving is Count's); pigs leaving the farm; feed stock.

## Decisions

Open questions and items to confirm:

- Medication given to part of a group without ID, then part of it moves: the teammate branch `codex/move-design-scenarios` records the owner's 2026-11-16 ruling (attribution unknown; both groups show a possible-medication notice; no invented counts). Its scenario tree and decisions (capacity, offline conflicts, correction, permissions) describe the old Transfer drawer and need moving onto this design.
- A pen without ID holding several batches: which batches shrink when some move (the old rule: steppers per batch, summing to the count).
- Pen capacity on To pen (a full pen): not shown yet.

Sources:

- Owner rulings 2026-11-09 (Move vs Transfer, rooms by section, *moved*) and 2026-11-16 (one Move everywhere; conditions cleared).
- History, not the design: `ux/system/workflows/place.html`, `ux/research/ops/place-identity.md`, `ux/research/ops/SYNTHESIS.md`.
