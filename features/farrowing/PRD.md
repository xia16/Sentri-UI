# Farrowing (分娩)

Section: Tasks · Platform: mobile · Prototype: `ux/system/farrowing-astra-concept.html?layout=focus` · Rulings: `ux/research/farrowing/RULINGS.md` (headings quoted below) · State contract: `ux/system/farrowing-contract.html`

## Problem

A sow can farrow for hours, across shifts, with wet gloves, one hand on the crate and no signal guarantee. The worker needs to count the piglets as they arrive without ever feeling the count is unsaved, record the dead by cause, fix a wrong figure without erasing the first one, and close the litter with a few deliberate facts. The supervisor needs the same records to roll up into one task: how many sows have farrowed, which are still going, which are still waiting, and a clean way to end the batch's farrowing task. The old UI scattered these over several screens and corrections had many doors; this feature keeps one familiar flow with a clearer place for every number.

## Who

- Farrowing-house worker (gloved, one-handed, often at night): counts, records deaths, finishes litters.
- Next-shift worker: reads the room list to see who is farrowing and who was last touched, then continues from the same record.
- Unit lead / supervisor: reads the unit and task progress, corrects posted figures, ends the task.
- Anyone may amend a finished record; provenance (stamp, original kept) replaces permissions.

## Anchor

The anchor is the **sow** (her litter session). Statuses: **Awaiting** (nothing recorded; live total zero) → **Farrowing** (live total above zero, not finished) → **Finished** (Born locked). Exits: **Sow died** (her death ends the session without Finish; she stays in the room while her piglets still need a place) and **Aborted** (an abortion with a live piglet keeps her row; with none she leaves the list). Both are finished states; sows that have left the list are counted once on the Task overview as "Left the task". Reachable in any status: the **Room list** and the **Farrowing log**. Task bands: **Task in progress** (the whole-task overview) and **Ending the task** (the four End task reviews and the receipt).

Status is derived, never set by a ceremony: "registers derive from the live total (posted + open pending)" (RULINGS *Starting and ending a session*).

## Rules

From RULINGS.md, quoted short:

- **Model**: "Born = Alive + Σ Dead + fostered out − fostered in. Derived, never entered, locks at Finish."
- **Model**: Alive is one classless number; "+ is free; − drains pending and clamps at the floor" (B\* minus the dead recorded). Born can never drop silently.
- **Model**: five default dead types plus Other (stillborn, mummified, crushed, scours, starve-out).
- **Model**: "No WHEN anywhere, absolutely … The stamp is the date."
- **Model**: "Classification (weak/deformed) happens at Finish, commits per tap"; "Healthy has no form row"; litter weight and assisted are optional.
- **Model**: Active row line 2 is "born 14 · 1h ago · G.H"; "No staleness tracking on Active sows"; the interval chip is retired. "Every litter row carries its three numbers" (alive · dead, born).
- **Model**: "The overdue signal ends at the first record"; rows speak in days from due (due = service + 114), never gestation day; "Overdue · 3 days" colours only the number.
- **Model**: "The hero owns the total; the receipt owns the change" (`Saved · +4 this visit`).
- **Surfaces & entrances**: "ONE dead drawer product-wide", opened by Record dead; staged: Save commits, Back keeps the draft, Clear discards.
- **Surfaces & entrances**: "ONE correction door: Edit … ONE SCREEN"; "What Edit adjusts: the observations, never the derivation"; a missed fact is a recording, never an Edit.
- **Surfaces & entrances**: "Type-to-set is retired on count figures"; one stepper shape, − n +, everywhere.
- **Surfaces & entrances**: "Identity is sheet-first … the room row offers no sow-page target."
- **Surfaces & entrances**: "`Finish` is `Finish farrowing`"; the hold-to-lock is "the second guard".
- **Starting and ending a session**: "Farrowing starts at the first recorded event — full stop."
- **Starting and ending a session**: the sow's death lives in the drawer (`Piglets · The sow`), "hold-to-commit"; "She stays in the room".
- **Starting and ending a session**: "A non-empty ledger is never unreachable"; a draft never crosses the lock.
- **After the lock**: "The record face IS the record"; "One ledger surface, the Farrowing record page"; "History is the chevron on the fact line"; "The correction mark is the amber value".
- **After the lock**: Born is amended through the Edit ceremony, which opens in place under the Born row (`More born` / `Count was wrong`; never a drawer on a drawer); "Anyone may amend born post-lock — open ✎, stamped, no role gate." Fostering is **parked**.
- **Names and glyphs**: "words carry actions, icons carry objects"; dates speak relative within the week.
- **Piglet processing, Round 5**: all tasks look the same (farrowing's skeleton); "The exit word is always **Back**."
- **Owner calls for this atlas**: *Edit record* is editing while she is still farrowing; *Correct born* exists only after farrowing has finished. Home's Farrowing card and Choose unit both land on the room list.

## Scope

In:

- Room list: unit card, whole-task card, Awaiting / Active / Done / All tabs, due and parity filter, pen grouping, Go to pen, Scan ear tag, Search.
- The sow sheet in its faces: Before first count, Counting, Finish (and its blocked form), Locked record, Sow died.
- Death entry (piglets and the sow), Edit record, Edit of a finished litter and the Correct born correction (in place), the Farrowing log.
- Whole-task overview, End task reviews (blocked, awaiting, all finished, outcomes) and the task receipt. One count everywhere: Done · Active · Awaiting over every sow of the task (a sow that died or has an outcome is Done), the same on the overview, End task, the receipt and the room tabs.
- Farrowing's rows on the pig's Actions sheet (Edit litter record, Record abortion, Mark not in pig).
- When a sow dies: the allocation sheet (move her piglets to other sows, hand-rear them in her crate, or move them to a rearing pen), the Move page it opens (`farrowing.foster`), and her row's life on the list until every piglet has a place.

Out:

- Fostering outside the sow-died case (parked until the owner reopens it; see Decisions, 2026-10-10).
- Piglet processing and its identity work (separate feature; Move opens after the lock). The prototype's own Piglet processing, identity and mortality pages are mapped as screens; see the decision "Piglet processing is drawn in Farrowing and as its own feature".
- The sow page itself and the rest of the Actions sheet (pig-profile).
- Pen tools reachable from a pen header (feed guidance, equipment fault, pen note, pen log): present in the prototype, unclear whose feature; recorded in the Room list issues. The pen pages are mapped as screens; see the decision "Pen tools are drawn in Farrowing and in Inspection".
- Console reporting, anomaly queues, per-hand audit views, merge-review UI, notifications.
- Role gates, batch-close disposition doors beyond what the End task reviews show.

## Decisions

- Born is derived and frozen at Finish; Alive and the dead types are the observations — RULINGS *Model*.
- Born floor: "+" free, "−" clamps at B\* minus current dead — RULINGS *Model*.
- Five dead types plus Other; no WHEN chips — RULINGS *Model*.
- Weak and deformed asked at Finish only; Healthy derived — RULINGS *Model*.
- Row line 2 carries recency in words; interval chip retired — RULINGS *Model*.
- Overdue signal stops at the first record — RULINGS *Model*.
- Days from due on rows, gestation day on the sheet header only — RULINGS *Model*.
- Receipt `Saved · +4 this visit`; hero numeral plain, no typing — RULINGS *Model*.
- Edit folds weak, deformed, weight and assisted into one `At finish` row — RULINGS *Model*.
- Dead drawer is the only dead entrance, staged (Back/Clear/Save) — RULINGS *Surfaces & entrances*.
- Edit is the only correction door and one screen — RULINGS *Surfaces & entrances*.
- Count figures are stepper-only — RULINGS *Surfaces & entrances*.
- Sheet-first identity: only the sheet header opens the sow page — RULINGS *Surfaces & entrances*.
- Exit grammar: bars hold exits only; Finish farrowing is a hold — RULINGS *Surfaces & entrances*.
- Farrowing starts at the first record; no started mark — RULINGS *Starting and ending a session*.
- The sow's death is a hold-to-commit mode of the drawer; she stays in the room — RULINGS *Starting and ending a session*.
- Merge contract: signed deltas, flag instead of silently applying a breach — RULINGS *Starting and ending a session*.
- Fostering parked — RULINGS *After the lock*.
- The locked record is designed as a record, with one ledger page — RULINGS *After the lock*.
- Anyone may amend Born after the lock — RULINGS *After the lock*.
- Words for actions, icons for objects — RULINGS *Names and glyphs*.
- Relative dates inside a week — RULINGS *Names and glyphs*.
- Farrowing's skeleton is the model for all tasks; exit word Back — RULINGS *Piglet processing, Round 5*.
- Task end: manual, hold-to-commit with receipt, blocked while farrowing is open — RULINGS *Piglet processing, Q5*; closure details in `ux/research/farrowing/ASTRA-TASK-CLOSURE.md`.
- Edit record vs Correct born split by status; Home entries land on the room list — owner calls for this atlas.

### Owner decisions, 2026-10-10

- **Room rows** (the room, Find a sow, Scan results) are one row. **The row's arrangement is provisional, pending the list exploration**; for now it is the "need tile" arrangement (a design-system candidate), drawn by one function so it can be swapped: the ear tag exactly as stored over one muted facts line (state · key fact · when · who), a fixed-width tile at the right (a big number over one small word: `9 / alive`, `3 / days late`, `7 / to allocate`, `✓ / done`), a chevron. Tile colour is meaning only: red solid is work for the worker, green wash is done, neutral is the rest. Only recorded counts show: alive, and `· N dead` only above zero; never *born* when alive and dead are shown, never an expected or carried count. No pencil and no chip: tapping the row opens the record, and Edit is inside it. Awaiting rows (`parity 2 · 12 born last`) keep their facts. In Find a sow the facts line leads with the pen and drops when · who.
- **Statuses.** In progress: **Awaiting**, **Active**. Finished: **Done** (green), **Sow died** (red), **Aborted** (red; 流产).
- **Sow died.** Right after the hold records her death the sheet becomes `N piglets to allocate` (subtitle `<ID> · <pen> · sow died <time>`) with three options: **Move to other sows** (opens the move page, sending out of this litter with her piglets pre-selected; several receiving sows may split them), **Hand-rear here** (the piglets stay on her record and piglet care continues) and **Move to a rearing pen** (shown only when the farm config says the farm has one; the prototype flag is on for the demo, `?rearing=off` turns it off). Footer **Back** means later: no ✕, no extra question line.
- **Her row while piglets remain.** A red tile `N / to allocate`, facts `Sow died · yesterday · L.M`; tapping it opens the same sheet. After Hand-rear: a neutral tile `N / hand-reared`, facts `Sow died · 09:40 · L.M`; the row stays while hand-reared piglets remain. A partial allocation keeps the remaining count; her row never says `5 moved`. A piglet that dies or is put down is recorded through Record dead and the count drops. She **leaves the room list** once every piglet is on another sow, in a rearing pen, or recorded dead.
- **Aborted.** *Abortion* is the one word (never *miscarriage*). No live piglet: she leaves the room list at once. Any live piglet: the row stays with the tile `1 / alive` and the facts `Aborted · 08:10 · G.H` (recorded counts only).
- **Task overview** counts the sows that left the list: `Left the task · n aborted · n sow died`. She is then outside Done · Active · Awaiting, so every total still adds up (7 / 18 farrowed once one of 19 has left).
- **Sheet titles name the job; subtitles name the animal and context.** Record dead is titled `Record dead` (it was `Dead 6` / `The sow`); the pen sheet no longer repeats `Pen` as its only heading.
- **Fostering is in scope for the sow-died case** (and only there; elsewhere it stays parked).
- **An orphan litter can stay in the task, hand-reared** on her record.
- **A rearing pen is a farm-level option.** Its configuration is still open: filed as the To confirm item `farrowing-room-list-1` in `review/farrowing-room-list.json`.
- **Abortion rule.** No live piglets: she leaves the list. Any live piglet: an Aborted row stays.
- The glossary words (*abortion / aborted*, *to allocate*, *hand-reared*, *left the task*) are in `ux/laws/glossary.md` and `ux/laws/strings.json`; "Abortion vs miscarriage" (`events-1`) is closed by this decision.
