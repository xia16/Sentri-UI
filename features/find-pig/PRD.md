# Search and scan 搜索与扫描

Draft, in design (owner reviews, 2026-10-22). It grew out of Home's Find a pig, which stays its first host. The feature id stays `find-pig`.

## Problem

A worker reaches pigs by ear tag in every part of the app: one pig to look at, or several to act on, from Home, inside a task, or while choosing pigs for an action. Each place used to decide for itself what a search or a scan does. Search and scan are one feature set. Each task or feature adds only its own display logic on top.

## Who

Floor workers, gloved and one-handed, with a tag in front of them or a reader in their hand.

## Anchor

The design system's [Lookup](../../ux/design-system/components/Lookup/README.md): Find (`findPage`), Scan (`scanPage`), and the scan bar for scanning on a list (`scanBar`). Every host draws these parts. No host copies them.

## Rules (every host)

- **Search and scan are different jobs** (owner, 2026-10-12). Find: type, tap one, act. Scan: hands-free reads.
- **What a scan does depends on the host's job** (owner, 2026-10-22):
  - **Opens.** A single-action task (Farrowing) opens the pig on each read; there's no list. Its Scan page only listens. While she is open, the reader waits.
  - **Ticks.** A multi-select place (Home, Inspection's walk, Choose pigs, the heat check when it's designed) ticks each pig as she is read. The bar becomes the actions for the ticked pigs: the count and Actions, or the task's own actions directly. A repeat read keeps her ticked and lights her row.
  - **Scans on a list.** A page that chooses pigs from a list (Choose pigs) scans in place, with no Scan page. The scan button turns the search bar into the scan bar.
  - **Home searches and scans on one page** (owner, 2026-10-22). The bottom bar's middle button opens it. The button is a magnifier with no word, since the icon says it. The field searches, and its scan icon turns it into the scan bar, as on Choose pigs. Each read ticks the pig. A result can be ticked too. The ticks stay through searching, Stop and leaving the page. Home has no separate Scan page, and Toolbox no longer has Find a pig or pen.
- **Task membership:** "in the task" means on the task's own list, not just in the same unit. A pig on the list shows the task's row; any other pig shows the generic row (her tag over her pen, her condition tags). The host passes the row's right side.
- **Where a pig opens:** a task opens her in the task's context (Farrowing: her farrowing drawer, in any unit). A pig outside the task, or anywhere outside a task, opens her pig record. Back returns to the page she was opened from, with the text, the ticks and the scanning kept.
- **Pens stay the grouping** inside a unit, as the header of each card. Units are plain section headings ("Unit 7"), the worker's unit first. The list and the results read like Inspection's unit list (owner, 2026-10-22). The pen card's header has the pen code and how many pigs are listed. Each row shows the tag over her stage line, with her condition at its urgency. Home draws it this way. Inspection's and Farrowing's lists still use one card per unit with the pen in the row.
- **Unchanged display:** a host's change of behaviour never changes its rows. Home's scan ticks now, but draws its rows exactly as before.

## What a read can find, and what each host does

| The tag's record says | Opens (Farrowing Scan) | Ticks (Home, Inspection) | Choose pigs (this unit only) | Find (typed) |
|---|---|---|---|---|
| On the task's list | Her task drawer | Ticked | Ticked, the task's row | The task's row |
| In the unit, not on the list | Her record · "Not in Farrowing · Unit 7 · D2" | Ticked | Ticked, the generic row | The generic row |
| Another unit | On the list: her drawer. Otherwise her record · "Not in Farrowing · Unit 3 · A2" | Ticked, under her unit | Not added: "Pig in another unit · 000434 · Unit 3" | Under her unit |
| No longer on the farm (died, sold, culled, moved to another farm) | Her record · "Died 14 Oct · …" | Not added (proposed) | Not added: "Pig not on the farm · 000512 · Died 14 Oct" | Open question 2 |
| No pig has this tag (a new, empty tag, or not synced to this phone yet) | A toast on Scan: "No pig with this tag · 000999 · New tag, or not synced yet" | Not added (proposed) | Not added: the same toast | "No pig matching" |
| Read again | — (the reader waits while she is open) | Stays ticked, row lights | Stays ticked, row lights | — |
| Reader not connected, or it drops | Scan page · "Scanner not connected" | Inspection: the same. Home: the bar · "Waiting for reader · Make sure Reader 1 is on" | The bar · "Waiting for reader · Make sure Reader 1 is on" | — |

**Not added** is one toast at the bottom. It shows a category, then her tag and the reason. It stays, with a ✕ at its left, until the worker closes it or leaves; tapping the rest opens her record (a tag with no pig opens nothing). Reads that miss while it shows pile into it ("2 pigs not added", their tags). Tapping it then lists them, each with its reason. The ticks and the count always show what was added.

## What a host supplies

1. Its list (who is "in the task") and its row for those pigs.
2. Its job: opens or ticks.
3. Its actions for ticked pigs: its own, plus the general ones (Transfer, Condition, Treat, Note).
4. Where a pig opens in its context.

Everything else (the pages, the bar, the reader states, the not-added toast and list) is Lookup's.

## Scope

In: Find, Scan (opens and ticks), scanning on a list, the reader states, the not-added messages, opening a pig, the general Actions for ticked pigs from Home.

Out: ear-notch search, untagged groups, the pig record itself (Pig profile), each action's own pages, the real reader and pairing.

## Not supported

- Searching by anything other than tag or pen (batch, stage, condition): use a list's filter.
- Several readers paired to one phone.
- Registering a new pig from a scan of an empty tag (it belongs to tagging, which isn't designed). Here an empty tag only says so.

## Open questions (owner)

1. **An empty tag:** when tagging, workers scan a new tag first to add the pig. Should a read of an unknown tag offer "Add a pig with this tag" once tagging exists? Should "not synced yet" stay one message with it?
2. **Dead and sold pigs in Find:** list them last, under "Not on the farm", grey, opening her record (recommended), or hide them?
3. **A pig in transit** (move saved, not yet arrived): follow the record, so she belongs to the new unit (recommended)?
4. **Home and Inspection scan:** use the same not-added toast for pigs that died, were sold, or have no record (proposed, not built).

## Decisions

- Decided (ASTRA-HOME-DIRECTION): Home keeps Home / Scan / Toolbox. Amended by the owner on 2026-10-22: the middle button is now Search and scan, a magnifier with no word.
- Decided (owner, 2026-10-12): search and scan are separate pages with one pattern across features.
- Decided (owner, 2026-10-20): a pig from Home opens her pig record, not a task.
- Decided (owner, 2026-10-22): scan opens in single-action tasks and ticks in multi-select places, Home included; search rows follow task membership; search and scan is one feature set across every task.
- Decided (owner, 2026-10-22, later): Home searches and scans on one page. The field's scan icon turns it into the scan bar. The bottom bar's middle button opens the page and shows only a magnifier.

## Sources

- ux/research/home/ASTRA-HOME-DIRECTION.md
- ux/research/home/SENTRI-DRAWER-INVENTORY.md
- ux/research/home/UI-AUDIT-HOME-TASKS.md
- Prototype: ux/system/home-astra-prototype.html, ux/system/farrowing-astra-concept.html
