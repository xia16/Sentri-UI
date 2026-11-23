# Move 转舍

## Scope

A worker moves pigs to another pen during a walk. The phone calls this **Move**. Planned Transfer tasks are issued from the console.

| Entrance | Where it opens |
| --- | --- |
| Inspection → pen → Move | Choose pigs in that pen. A pen holding one movable identified pig opens the destination directly. |
| Inspection or Scan → selected pigs → Actions → Move | The selection supplies identified pigs and the total number of unidentified pigs per source pen. Move opens the destination picker. |
| Pig record → Actions → Move | This pig opens directly on the destination. |
| Farrowing record → Actions → Move | This sow opens the same destination picker using Farrowing's rooms. |
| Finished or ended Farrowing record → Piglets → Actions → Move | The chosen piglets open the same destination picker. The movement goes in their litter and pen logs. |
| Inspection Scan or Find → pig from another unit | Choose Move only or Move and select. Choose a pen in the inspected unit using the same PenMap and search, then review both locations. |

## Meaning of a selection

- Ear tag and ear notch identify individual pigs. The pen roster supports search and the reader. For pigs without either identity, enter one total head count per source pen, up to the number available in that pen. The review shows that count next to the source pen.
- The client sends the source pen and total head count for its unidentified pigs. The server may randomly draw from the source pen's batch balances when deducting that count. The total deducted equals the submitted count.
- Choose a room and find a registered pen by code. Rooms with a multi-pen layout offer the standard PenMap Sheet with Back and, in long rooms, Whole room. The list and map both turn off source pens and known unavailable destinations. Selecting a pen opens Review move.
- Review identifies the source pens and their pigs or counts, and names the destination room and pen. Tap the destination row to change it. Back from that change restores the previous destination.
- Tagged or ear-notched animals keep their individual records. Once any unidentified pigs leave a pen, clear that source pen's **current diseases and symptoms for all its unidentified pigs**, even when some remain. The picker lists affected source pens. The destination's existing animals retain their records and the movement history stays available.
- Formal batch membership for unidentified pigs is handled internally. For individually identified pigs, any applicable default batch assignment is shown in the review.

## Record and return

- Confirm move submits the review. A confirmed move adjusts the source and destination and records both sides. The pen entrance returns to its source. The pig record and selection entrances return to the originating record or list. A finished litter returns to Piglets with the move listed in Sent and moved.
- Inspection's prototype models a success, an API error message or a quiet queue on connection loss. An API error uses the same notice toast as Scan and leaves the review available for editing. Placement, group conditions and selection update on confirmation.
- Android and the live operation require a service contract for placement, eligibility, capacity, conflicts and a retrievable receipt. A live cross-pen transaction is outside this prototype round.

[巡检转舍图文](../../ux/review/farrowing-inspection/move.html)
