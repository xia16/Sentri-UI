# Inspection 巡检

## Problem

A worker walks one unit and has to see every pig, spot the ones that need care or feed attention, and record what they find without leaving the place they are standing. Today's old UI spreads this over many screens in the Inspection Figma file. The built prototype (`ux/system/inspection-astra-concept.html`) puts it in one list with a dock, but several parts of it are built and never reachable (unit summary, sensors, batch tracker, equipment faults), and the list repeats facts that the pig record also shows.

## Who

The barn worker doing the morning or evening walk, often wearing gloves, one hand free. The supervisor reads the same list to see what was recorded ("Log", "Check in"). The unit is the scope: there is no cohort.

## Anchor

No anchor. The walk has no lifecycle that changes what work is available: it can be checked in again at any time ("Check in again"), and nothing is blocked before or after. The screens are therefore grouped by what the worker is doing: walk the list, open a pen, select and act, unit batches, unit environment and equipment (built, not reachable), finish.

## Rules

- Selection is not an inspection result. A pig checkbox never selects its pen; a pen checkbox selects the pen and the pigs shown (ROUND-3).
- Notes belong to the pen, not to its pigs. A pen has one note; closing it moves it into the pen log.
- Feed is guidance, not a completion checklist: nothing on the walk can be "done" for feed.
- The stage on a row is days in the stage, never lifetime age; the walk date is fixed in the sample (12 Sep 2026).
- Care is the only editable condition state; attention is derived from it (ASTRA-BULK-ACTIONS).
- One Actions sheet for one pig or many; Production actions exist only for one pig.
- Finishing a walk records that the unit was walked; it does not mark pigs healthy or tasks done.

## Scope

In: the unit walk list (lens All / Health / Feed, filter, pen map, find and scan), the pen sheet with note and log, the selection and Actions sheet, the walk log and check-in, the unit batches that change the stage text, and the built-but-unreachable unit summary, sensors, batch sheet and equipment fault flow.

Out (owned by other features): the pig record and its actions (pig-profile), feed reading and editing (feed-plan), conditions, care and treatment (health-record). The Farrowing task is opened from here but belongs to Tasks.

## Decisions

Taken from the research notes and the code:

- The roster shows every pig (the earlier "quiet pigs collapsed" idea was dropped) with an identity line and one line of tags.
- Home opens this page through the "Inspect unit" card with the unit kept in the link; Back returns to Home with the unit.
- Pen map copies Farrowing's four-column, six-row map and 350 ms hold-to-peek.

Open (recorded on the screens as issues):

- The unit summary card (pig and pen counts, faults, sensors, batch tracker) is in the code and not placed on the walk. Draw it or remove it.
- Equipment faults have a full report-and-resolve flow but no control reaches it.
- "Health" and "Feed" lens counts do not say what they count.
- The care level shows only by icon and colour on a row.
- Fixed author "G. Hansen" and times 06:40 and 09:41 stand in for the signed-in worker and real times.
