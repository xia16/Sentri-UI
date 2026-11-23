# Move 转舍

## Scope

A worker moves pigs to another pen during a walk. The phone calls this **Move**. Planned Transfer tasks are issued from the console.

| Entrance | Where it opens |
| --- | --- |
| Inspection → pen → Move | Choose pigs in that pen. A pen holding one movable identified pig opens the destination directly. |
| Inspection or Scan → selected pigs → Actions → Move | The selection supplies the pigs and counts. A partial multi-batch group asks for the split by batch before the destination. |
| Pig record → Actions → Move | This pig opens directly on the destination. |
| Farrowing record → Actions → Move | This sow opens the same destination picker using Farrowing's rooms. |
| Finished or ended Farrowing record → Piglets → Actions → Move | The chosen piglets open the same destination picker. The movement goes in their litter and pen logs. |
| Inspection Scan or Find → pig from another unit | Choose Move only or Move and select. Choose a pen in the inspected unit using the same PenMap and search, then review both locations. |

## Meaning of a selection

- Ear tag and ear notch identify individual pigs. The pen roster supports search and the reader. Without either identity, select a count from the source pen and its batch. Multi-batch allocations match the requested count.
- Review identifies the source pens and their pigs or counts, and names the destination room and pen. Source pens, unregistered positions and known unavailable pens cannot be chosen. The room chooser groups by section. Search finds a pen code. Long maps show Whole room.
- Tagged or ear-notched animals keep their individual records. Once any unidentified pigs leave a pen, clear that source pen's **current diseases and symptoms for all its unidentified pigs**, even when some remain. The picker lists affected source pens. The destination's existing animals retain their records and the movement history stays available.
- Formal batch memberships follow the pigs. The sample nursery has a default batch for eligible pigs arriving from no batch or another default batch. The review shows a reassignment when the prototype has that destination fact.

## Record and return

- Choosing a pen sets the destination. The primary button names it and commits. A confirmed move adjusts the source and destination and records both sides. The pen entrance returns to its source. The pig record and selection entrances return to the originating record or list. A finished litter returns to Piglets with the move listed in Sent and moved.
- Inspection models a single result for a submission in its local sample data. A connection loss quietly queues it in the current session and returns to the source. Placement, group conditions and selection update on confirmation. A rejection or unknown outcome leaves the recorded position and health data intact. An unknown operation blocks resubmission for the same pigs or group.
- Android and the live operation require a service contract for placement, eligibility, capacity, conflicts and a retrievable receipt. A live cross-pen transaction is outside this prototype round.

[图文操作档案](../inspection/decision-round/canvas.html)
