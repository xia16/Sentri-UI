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

In: the unit walk list (lens All / Health / Feed, filter, pen map, find and scan), the pen page and its tools (note, feed, fault, log) wherever a task opens it, Farrowing's room included (owner, 2026-10-22: the screens Farrowing's prototype draws are mapped here, "Pen in Farrowing"), the selection and Actions sheet, the walk log and check-in, the unit batches that change the stage text, and the built-but-unreachable unit summary, sensors, batch sheet and equipment fault flow.

Out (owned by other features): the pig record and its actions (pig-profile), feed reading and editing (feed-plan), conditions, care and treatment (health-record). The Farrowing task is opened from here but belongs to Tasks.

## Decisions

- Owner, 2026-10-22: the pen page and its tools are Inspection's. Farrowing's pen header `›` opens the pen page; Farrowing's own drawing of it (Note, Feed, Fault, Needs attention, Now, Pen log) is listed under "Pen in Farrowing" until the two prototypes share one page.

Taken from the research notes and the code:

- The roster shows every pig (the earlier "quiet pigs collapsed" idea was dropped). Owner-approved 2026-10-12: a pig is a two-line row. Left, a fixed 112px column: the pig ID over the stage line ("Gestation · 42d"; "d" is the one allowed abbreviation; no stage date, the stage alone; the stage ends in an ellipsis rather than widening the column). Right, one line of compact condition tags that fills the space up to the chevron: the name only (no day, no care word; Poor appetite is the trend-down icon and "Appetite", Diarrhoea is "Scours"), ordered by urgency then day (Treat in place and Hospital pen, then Monitor, then ongoing). Act now is a red wash with the "!" icon and bold red text; monitor is white with a thin border; ongoing is muted text with no box.
- The tag line is one line only. Tags are added in priority order until the line is full, then "+N" says how many are left; the urgent tag is never the hidden one.
- There is no feed tag on a pig row. A trough pen can't feed one pig, so feed is read and changed at the pen (the pen header keeps its feed summary).
- The row is the design system's Row · animal (select + door), with the compact ConditionTag.
- Home opens this page through the "Inspect unit" card with the unit kept in the link; Back returns to Home with the unit.
- Pen map is the design system's PenMap, as Farrowing's (2026-10-22): the framed Pen map button in the dock, tiles coloured by the walk's row levels (amber for a pig at act now, never blue), the peek with the walk's rows, and the colour-carries-over landing. A pen the walk has been through and one it has not look the same: there is no per-pen check (budget.md, Pen map).

Open (recorded on the screens as issues):

- The unit summary card (pig and pen counts, faults, sensors, batch tracker) is in the code and not placed on the walk. Draw it or remove it.
- Equipment faults have a full report-and-resolve flow in the prototype's code but no control reaches it; the pen workflow deck draws the same flow (and Set count) as screens, listed under Equipment faults and Pen head count.
- "Health" and "Feed" lens counts do not say what they count.
- The care level shows on a row only by the tag's look (red wash with "!", outlined, plain); the care word and the day are on the record.
- Fixed author "G. Hansen" and times 06:40 and 09:41 stand in for the signed-in worker and real times.
