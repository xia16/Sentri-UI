# Farrowing: Find a sow and Scan ear tags, information budget

## Inventory

**Find a sow, per state**
- Field: the typed text, a clear control, a scan icon, Cancel.
- Empty: the hint. Typed: matching sows with her ear tag, her pen, her unit (other units only), grouped by unit. No match: one line quoting the text.
- Could have shown and does not: her state, her parity, her pen's other sows, a count line ("N sows found"), the unit in the header, recent searches.

**Scan ear tags, per state**
- Header: back, the title, the context (Farrowing · Unit 7), the scanner state (Scanning / Stopped).
- Not connected: one message and how to fix it. Nothing scanned: one invitation. Scanned: groups with counts, one row per sow (ear tag, where she is, her state), a tick box. Footer: Stop or Resume scanning, or the selection count and Actions.
- Could have shown and does not: a "ready for the next tag" banner, a "Not found" row, scan times, battery or signal of the reader, a totals line, her born or dead counts as separate facts.

## Questions

1. Which sow is this? (Find a sow: type a part of the tag; Scan: hold the reader.)
2. Is she in my unit? (the group: "In Unit 7" or "Other units"; the place on the right.)
3. Is the reader working? (the pill, or the not-connected message.)
4. What can I do with her, or with these? (tap a row to open her; tick several, then Actions.)
5. How do I stop? (Stop scanning; the back arrow.)

## Levels

- **Act now**: the worker's own input (the field in Find a sow; the scan itself, which needs no tap). In a Scan row the one act-now fact is her overdue state, exactly as in the room (red figure, one "!").
- **Watch**: the scanner state (the pill), and the selection count once something is ticked.
- **Settled**: group counts, the context line, her place on the right in Find a sow (ink, 16px; the typed part of the tag is the only bold).
- **Audit**: nothing: no times, no names beyond the row's own context line.
- Cut list: the "N sows found" line, the unit in the search header, the "ready for the next tag" banner, the "Not found" row, the Scanner preview and Try sample tag, the old second search door inside Scan.

## Headers (2026-10-13)

The header line of every surface of this feature, decided by the Headers law (`ux/design-system/README.md#headers-law-owner-2026-10-13`, owner 2026-10-13). The default is no line; each kept fact names its question and passes the Back test.

| Surface | Hub or action | Header line | The worker's question it answers there | Back test |
|---|---|---|---|---|
| Room list (task page) | hub | fact: `Last record 08:41 · G.H` | Can I trust this list; who was here last? | Back reaches Today, which does not show it |
| Farrowing record (before, counting, finished, sow died) | hub | route: `#000418 ›` · `B1` · `Parity 3` (`Unit 6 · A2` when she is in another unit) | chip: open her page; pen: is this the crate in front of me; parity: what to expect of this litter (first or a later one) | Back reaches the room, which lists many sows: it is the hub |
| N piglets to allocate (sow died) | hub (her row opens it) | none; her tag, pen and the time she died label the options (`000399 · B3 · sow died Aug 25 06:20`, settled: the 13px muted group label over the card) | Which sow died, and when? (body) | Back reaches the room; she is on screen |
| Finish farrowing, Record dead, Edit record, Edit finish details, Correct born | action | none | (the record is one Back away) | Back reaches the record, which has the chip |
| Farrowing log, Death breakdown | action (read) | none | | Back reaches the record |
| More actions (her sow page's actions, shown in the drawer) | hub for her action pages | route: chip · pen (Pig profile's More actions) | Which sow will these write to? | the record (chip) | on screen |
| Piglet processing (her piglets' care and records) | hub for identity, mortality and foster | route: chip · pen | Whose piglets are these? | More actions (chip) | on screen |
| Note, reconcile, transfer, not in pig | action | none | | More actions (chip) | one Back away |
| Piglet identity, Report piglet mortality, Foster piglets (from Piglet processing) | action | none | | Piglet processing (chip), walked in crit round 1 | one Back away |
| Task overview, End task (early), Task ended, task sows lists | action (from the room's summary card) | none | the scope is in the body (Choose a unit, the outcomes) | Back reaches the room |
| Filter sows, Go to pen, Scan actions | action | none | Reset in the footer | Back reaches the room |
| Pen page, Pen log, Pen note, Feed guidance, Report fault, Equipment fault | action | none | | Back reaches the room or the pen page |
| Scan ear tags | action (page) | none; Scanning / Stopped is the body's first line | | Back reaches the room |
| Find a sow | search page | not a title header: its pinned field is its head (owner, 2026-10-12) | | |

Moved, not cut (crit rounds 1 and 2): the task receipt's closure stamp (`Farrowing · Oct 11 · 09:41 · G.H`), Scan actions' count (`2 sows`), the allocation's sow-died line and the finished record's stamp (`Finished Aug 27 at 08:12 by G.H`, Audit) each open their body as the quiet group label (13px muted, 8px over their card); Scan's Scanning / Stopped is the body's first line.

Chains walked (crit round 1): the room, the record drawer, the logs and the pen pages read as before; More actions and Piglet processing now carry the route, so every action page about her is one Back from her chip.

## Record dead (2026-10-14)

Kept facts (not changed by this pass), with the question each answers: the title `Record dead` (what am I doing?); the switch `Piglets` / `The sow` (whose death?); each cause's label and count (how many of each so far, with this draft?); `+n unsaved` beside a drafted cause (what will this save add?); the sow's four causes and the banner `Saving ends farrowing · N alive stay under piglet care` (what does saving her death do?); the primary `Record N deaths` / `Record sow death` (what will the tap commit?).

Facts this pass touches:

| Fact | State | Question it answers there | Level |
|---|---|---|---|
| `Photos` (the optional row's label, camera glyph) | always, last in capture order | Can I attach a photo to this record? | Settled (quiet card) |
| `Record a death first · photos ride that record` (the hint line, the Photos component's registered `ds.c2.photos.inactive`) | no death drafted (piglets) or no cause chosen (the sow) | Why can't I take a photo yet? | Settled (muted hint; the tap re-announces it) |
| `N attached` (the row's answer) and thumbnails | after a photo | Did my photo go on this record? | Settled |

Cut: nothing new. Hiding the Photos row until a death is drafted is cut (the row waits visibly instead). Nothing is added to the header.
