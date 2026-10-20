# Find a pig 查找猪只

Draft: compiled from existing docs, not yet confirmed.

## Problem

A worker standing at a pen needs to find a pig or a pen by its ear tag or pen code, by typing or by scanning, from anywhere in the app without choosing a section first.

## Who

Floor workers, gloved and one-handed, who have a tag in front of them.

## Anchor

None. Two entrances, two pages: Find (Toolbox) and Scan (the Home bar's Scan). Both are the design system's [Lookup](../../ux/design-system/components/Lookup/README.md), the same pages as Farrowing's and Inspection's.

## Rules

- Search and scan are different jobs (owner decision, 2026-10-12). **Find**: type, tap one, act. **Scan**: hands-free; each scan adds the pig to a list; tap one, or tick several for Actions.
- Both are full pages, not drawers. Both reach every unit of the section the worker is in.
- Find: the field is pinned and focused; nothing is listed before typing; part of a tag or a pen matches; results are one card per unit under a plain "Unit 7" heading, the worker's unit first (owner, 2026-10-20). No match says so in one line.
- Scan: the reader always listens; a repeat scan lights her row instead of adding one; no "Not found" row and no Select button; the footer's Stop / Resume scanning is the only scanning status. A row is her tag over her pen, with her marked condition on the right when she has one.
- A pig, found or scanned, opens her pig record (owner, 2026-10-20). Back returns to the list.
- Actions for ticked pigs are the general ones (Transfer, Condition, Treat, Note); Home has no task of its own.
- The tag reader is not connected; the study's "Simulate scan" reads sample pigs.

## Scope

In: Find a pig, Scan ear tags, the general Actions for ticked pigs, opening a pig's record.

Out: ear-notch search, untagged groups, filters, the pig record itself (Pig profile), the four actions' own pages from Home, a real reader.

## Decisions

- Decided (ASTRA-HOME-DIRECTION): Home keeps Home / Scan / Toolbox.
- Decided (owner, 2026-10-12): search and scan are separate pages with one pattern across features.
- Decided (owner, 2026-10-20): a pig from Home opens her pig record, not a task.

## Sources

- ux/research/home/ASTRA-HOME-DIRECTION.md
- ux/research/home/SENTRI-DRAWER-INVENTORY.md
- ux/research/home/UI-AUDIT-HOME-TASKS.md
- Prototype: ux/system/home-astra-prototype.html
