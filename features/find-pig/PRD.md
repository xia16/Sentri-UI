# Find a pig 查找猪只

Draft: compiled from existing docs, not yet confirmed.

## Problem

A worker standing at a pen needs to find a pig or a pen by its ear tag or pen code, by typing or by scanning, from anywhere in the app without choosing a section first.

## Who

Floor workers, gloved and one-handed, who have a tag in front of them.

## Anchor

None. Two entrances lead to one result list.

## Rules

- Scan is the centre button of the Home bar. Find a pig or pen sits in Toolbox. Both are drawers over the current page.
- Search takes one field: an ear tag or a pen code (required, up to 30 characters), matched whole.
- Scan reads the tag with the camera or tag reader; the study offers a sample tag instead.
- A result row shows the tag and pen, and the unit, task and batch it belongs to. Tapping it opens that task in its unit.
- No match says so and offers Search again.
- Camera, tag reader and the real pig list are not connected; the study searches its sample task records.

## Scope

In: the search drawer, the scan drawer, the results.

Out: ear-notch search, untagged groups, filters, the pig record itself (Pig profile), a real camera or reader.

## Decisions

- Decided (ASTRA-HOME-DIRECTION): Home keeps Home / Scan / Toolbox.
- Open: where the feature lives and whether a result opens the pig's record rather than a task (filed under To confirm).

## Sources

- ux/research/home/ASTRA-HOME-DIRECTION.md
- ux/research/home/SENTRI-DRAWER-INVENTORY.md
- ux/research/home/UI-AUDIT-HOME-TASKS.md
- Prototype: ux/system/home-astra-prototype.html
