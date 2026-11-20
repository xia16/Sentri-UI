# Inspection 巡检

## Problem

A worker walks one unit and has to see every pig, spot the ones that need care or feed attention, and record what they find without leaving the place they are standing. Today's old UI spreads this over many screens in the Inspection Figma file. The current prototype (`ux/system/inspection-astra-concept.html`) puts the walk in a single list with a dock. A pen header opens its pen tools; a pig row opens that pig’s record. Unit summary, sensors and the batch tracker have no live walk entrance.

## Who

The barn worker doing the morning or evening walk, often wearing gloves, one hand free. The supervisor uses History to see what was recorded. The unit is the scope: there is no cohort.

## Anchor

No anchor. The walk has no lifecycle that changes what work is available. The header shows the last record and opens History; End walk and check-in were removed by the owner on 2026-11-03 (#314).

## Rules

- Selection is not an inspection result. The pen header opens the pen page. Tick all on that page selects the pen’s pigs shown in the walk, including its untagged group when present. A pig checkbox selects that pig only.
- A pen note is scoped to one pen, and belongs to its own log when closed. Pig notes are a separate action on the pig record.
- Feed is guidance, not a completion checklist: nothing on the walk can be "done" for feed.
- The stage on a row is days in the stage, never lifetime age; the walk date is fixed in the sample (12 Sep 2026).
- Care is the only editable condition state; attention is derived from it (ASTRA-BULK-ACTIONS).
- One Actions sheet for one pig or many, with applicable Production actions only for one pig. Opening Actions on a pig record uses that pig alone; Back from the single-pig Actions restores the walk or scan selection. A successful everyday record returns to the source (walk, Scan, Selected, or the pig record), restoring the original selection; treatment started on a finding still returns to that finding.
- The dock and Find open the same full-screen unit Scan. Back returns to the calling page and preserves its context.
- Search and scan show pigs under the unit and pen where they are recorded. A scan ticks an active pig only in the current unit. A pig from another unit has one result row: tap for her record or to move her. From Scan or Find, choose a registered destination pen in the current unit on the searchable full-screen page. Confirm the move after reviewing both locations. Only a confirmed transfer updates placement; **Move and select** also ticks her. Offline, denied, failed and unconfirmed moves leave the selection unchanged. The prototype uses sample receipts, not a transfer API.
- Home To treat and Monitoring open the selected pig record with her marked condition. Back preserves the search, filters and scroll. Home Inspect unit still opens the unit walk.
- Open Farrowing from a pig record or its single-pig Actions opens the matching sow’s Farrowing record for that task, matching the unit and ear tag. Back returns to the originating screen. A missing match does not open another animal.

## Scope

In: the unit walk list (lens All / Health / Feed, filter, pen map, find and scan), the pen page and its tools (note, feed, fault, log) wherever a task opens it, Farrowing's room included (owner, 2026-10-22: the screens Farrowing's prototype draws are mapped here, "Pen in Farrowing"), the selection and Actions sheet, the walk history, equipment faults for one pen, and the unit batches that change the stage text.

Out (owned by other features): the pig record and its actions (pig-profile), feed reading and editing (feed-plan), conditions, care and treatment (health-record). The Farrowing task is opened from here but belongs to Tasks.

## Decisions

- Owner, 2026-10-22: the pen page and its tools are Inspection's. Farrowing's pen header `›` opens the pen page; Farrowing offers Note, read-only Feed guidance, Fault and Pen log. It shares the note and fault form renderers and validation with Inspection. Each host supplies its own pen facts and history, and returns to its own task. Observe and Tick all remain Inspection-only.

Taken from the research notes and the code:

- The roster shows every pig (the earlier "quiet pigs collapsed" idea was dropped). Owner-approved 2026-10-12: a pig is a two-line row. Left, a fixed 112px column: the pig ID over the stage line ("Gestation · 42d"; "d" is the one allowed abbreviation; no stage date, the stage alone; the stage ends in an ellipsis rather than widening the column). Right, one line of compact condition tags that fills the space up to the chevron: the name only (no day, no care word; Poor appetite is the trend-down icon and "Appetite", Diarrhoea is "Scours"), ordered by urgency then day (Treat in place and Hospital pen, then Monitor, then ongoing). Act now is a red wash with the "!" icon and bold red text; monitor is white with a thin border; ongoing is muted text with no box.
- The tag line is one line only. Tags are added in priority order until the line is full, then "+N" says how many are left; the urgent tag is never the hidden one.
- There is no feed tag on a pig row. A trough pen can't feed one pig, so feed is read and changed at the pen (the pen header keeps its feed summary).
- The row is the design system's Row · animal (select + door), with the compact ConditionTag.
- Home opens this page through the "Inspect unit" card with the unit kept in the link. Back from the walk restores the Home unit. Home’s magnifier runs its own Lookup and can open a pig record without entering a walk.
- Pen map is the design system's PenMap, as Farrowing's (2026-10-22): the framed Pen map button in the dock, tiles coloured by the walk's row levels (amber for a pig at act now, never blue), the peek with the walk's rows, and the colour-carries-over landing. A pen the walk has been through and one it has not look the same: there is no per-pen check (budget.md, Pen map).
- A pen with an open equipment fault shows a wrench in its walk header. Tap the pen name for the fault under Needs attention; resolving the last open fault removes the mark and retains the record in Pen log.

Open (recorded on the screens as issues):

- The unit summary card (pig and pen counts, faults, sensors, batch tracker) is not placed on the walk. Home already has Environment & devices.
- Pen head count stays out of this round. The Web Pigs fact is read-only. The earlier Set count deck and Android preview are references for the separate Count design.
- The six entrance decisions and screenshots are in the [operation flows](decision-round/canvas.html). Native transfer still needs a service receipt that can identify and safely look up the exact submitted operation before enabling real writes.
- "Health" and "Feed" lens counts do not say what they count.
- The care level shows on a row only by the tag's look (red wash with "!", outlined, plain); the care word and the day are on the record.
- Fixed author "G. Hansen" and times 06:40 and 09:41 stand in for the signed-in worker and real times.
