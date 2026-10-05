# Dead picker — data contract (slice 9, candidate; scenario round 1 fixes; round 5 look and feel)

The one shared dead drawer (the DeadDrawer composition, page `dead.html`), drawn on the task skeleton (ADR 0003): a
TaskSheet over the room — grab, title `Dead 2` as farrowing's (this entry's count; `Dead` at 0; `Sow died` on the sow
tab; the door that opens it stays `Record death`), subtitle `A02 · 12 alive · 1 dead so far`, Clear (greyed while there is
nothing to clear), divider, body, footer with Back + Save — and in the body farrowing's faces from the skeleton (TaskStepper row
face for the causes and the `From the missing` answer, TaskPhotos, TaskRow door rows) and TaskRadios, TaskWarning beside the cards it keeps (Segment; the footer status slot for why Save waits; the hold; ADR 0002/0003). What is needed only sometimes sits one level down, in the
same drawer (Back returns): the tagged piglets, the neighbours' losses, and the held-body question (a TaskDialog). Farrowing, the farrowing
record, check-in and processing all open this component. It forks on **litter facts**, never on the
task or the surface; the surface chooses copy only. Binds with RULINGS *Surfaces & entrances*,
*Starting and ending a session*, and *Piglet processing* round 2 (the ledger).

## Inputs: litter facts

| Fact | Meaning |
|---|---|
| `phase` | `open` (farrowing not locked) or `locked` (after `Lock born N`, or after the sow's death ended the session) |
| `identified[]` | the litter's identity rows with no death: alive, or **counted missing by name** (`status: missing`, its loss) — `rowId`, tag or notch, sex?, weight?, `canBeMissing` (alive, and an open loss has an unnamed part) |
| `openLosses[]` | open unexplained losses (`lossId`, `qty`, `stampAt`, named rows), oldest first |
| `roomLosses[]` | the other litters in the same room with an open loss that an untagged body can come from (processing only) |
| `held[]` | bodies held for review on this litter (the same body recorded twice), unanswered |
| `modes` | `['piglets','sow']`, or `['piglets']` when the sow's death is already recorded (the segment is not drawn) |
| `causes[]` | `open`: stillborn · mummified · crushed · scours · starve-out · other. `locked`: crushed · scours · starve-out · other |
| sow causes | `open`: farrowing · prolapse · found dead · other. `locked`: prolapse · found dead · other |

Phase rules:

- `open`: no cap. Tallies never touch Alive; Born derives (Born = Alive + Σ Dead).
- `locked`: untagged tallies are capped at `unidentified alive + Σ open loss`, so a body that was
  already counted missing can be recorded even at 0 alive. Each body leaves Alive unless it is drawn
  from an open loss.
- A stillborn or mummified body found after the lock is not offered: it is Born's correction, reached from the
  litter's Edit (round 5 moved the `Born dead? Correct farrowing · Edit` pointer out of the drawer); it is never a
  processing death.

## Events

```
dead_batch {
  litterId, phase, hand,
  stampAt,            // Save time; the stamp is the date (no WHEN is asked)
  deviceBase,         // the litter version the draft was made against
  lines: [ {cause, n, note?}                // unidentified tallies (`other` carries the note)
         | {cause, rowId, fromLoss?} ],     // one identified piglet each; fromLoss: this tagged body is the missing one
  lossSeen:  [ {lossId, qty} ],  // the open losses on screen when the hand answered
  lossAlloc: [ {lossId, qty} ],  // bodies drawn from them, oldest loss first; Σ qty = the "From the missing" answer
  note?,                         // `Other · what happened` (optional)
  photos: [ photoRef ]         // kept on the event; ride this Save; uploads queue offline, the event never waits
}
sow_died { litterId, cause, note?, photos: [ photoRef ] }   // never batched with piglets; photos ride this Save;
                                                            // `other` keeps cause `other` and the note apart
```

- **Allocation.** The hand answers how many of the untagged bodies were missing (a Stepper,
  `0 … min(untagged bodies, Σ unnamed open loss)`); the device allocates them to open losses oldest first.
- **Identified piglets can be the missing ones (R1-9; supersedes "identified piglets are never missing").** A Set
  count may name which tagged piglets are missing (required only when the untagged cannot cover the difference);
  a named piglet is listed in the roster as `counted missing <time>`, and its body closes its own loss (Alive does
  not move). An alive tagged piglet picked while a loss has an unnamed part (`canBeMissing`) is asked
  `Was 271004 one of the 2 missing?` — `One of the missing · alive stays 11` (`fromLoss`: its body takes that
  loss's unnamed share) or `Died here · alive 11 → 10`. There is no default: Save waits until it is answered.
- **A body found in another crate (R1-8).** In processing, after the lock, once a body is counted the drawer offers
  the other litters of the room with an open loss in one row: `One of D03's 2 missing?` when there is one, or
  `Found outside its crate? · 2 crates have piglets missing`, whose list (crate rows: `D03 · 2 piglets missing ·
  counted 10:25 · G.H`) is one level down. Tapping a litter records the draft
  **there**: the untagged bodies are presumed from that loss (the answer is preset to what is open and stays
  editable); tagged picks are dropped (they belong to their own litter); the subtitle names the litter and one row
  reads `Recording in D03 · found in A02` over `Record in A02 instead` (a tap records it in A02 again). The app never pairs by itself. From the room's
  Explain page, `Found a body?` opens the same drawer on a picker of the unit's open losses (`dead-found`).
- **Alive** after a locked batch: `alive − (untagged bodies − allocated) − identified piglets not from a loss`
  (a named-missing or `fromLoss` piglet was already taken off Alive by its count). It can never go
  negative: the answer has a floor `kMin = max(0, untagged bodies − unidentified alive)` (new deaths must be live
  unidentified piglets; picked identified piglets are already on the roster). The Stepper's floor is kMin; it is
  pre-set to kMin with `At least 2 must be from the missing`; raising the tallies raises the answer to kMin; Save
  refuses an answer below kMin. The tally cap (`unidentified alive + Σ open loss`) keeps kMin ≤ Σ open loss.
- **`None were missing` is an explicit answer** (a text action shown while the question is unanswered and kMin
  is 0). The floor-gray − never answers anything; it keeps its one meaning.
- **Photos** ride the Save that holds them and are **kept on the event** (`photos`): the receipt and the History
  line say so (`Saved · +2 crushed · 1 missing still open · 2 photos`). Before Save each thumbnail opens the viewer
  (`Photo 2 of 2`, Back and Delete, 24px apart); Delete returns to the drawer with `Photo deleted · Undo` for 5 s.
  The record page shows the event's photos (Back only: no Delete from History).
- **This entry, not the litter's total (R1-26).** Every stepper starts at 0: it counts this Save's bodies. The
  litter's running total is said apart (`12 alive · 1 dead so far` in the subtitle), never prefilled; the
  per-cause history is the record page's (round 5 removed `3 recorded before` from the stepper rows). The stepper keys name the cause (`Crushed · one more`). The unsaved words are one unit
  everywhere: `1 unsaved` / `1头未保存` (`pp.dead.unsaved`).
- **`Other` has a note** (`What happened · optional`), kept on the event and on its line.
- **The receipt says when the missing are all found**: `Saved · +1 crushed · all missing found` when this Save
  closed the last open loss; otherwise `· 1 missing still open`. Routed or found from the room it names the litter
  (`Saved · D03 · +1 crushed · all missing found`).
- **A new tick starts with no cause**: ticking another identified piglet never copies a cause; the shared
  control reads `Cause for 2 picked` with nothing selected until a cause is chosen for all of them, and Save
  points at the first piglet without one (`Pick a cause for notch 27-14`). Rows with no sex or weight print
  no meta line.
- **Identity status** is derived from the death event, keyed by `rowId`, idempotent per row. The row is
  never deleted: the identity table (S4) shows it with status `dead · <cause> · <date>`, excluded from
  Identified and from `n of N`, kept in *Identity rows on record*. It leaves the picker.
- **Save is idempotent per draft**: one draft commits one event; a second tap while committing is ignored.

## The draft envelope (on the device)

Key: `litterId + mode`. The piglet draft and the sow draft are separate: a piglet Save never erases a
sow draft; `Clear` clears only the mode on screen; the drawer reopens in the mode holding the draft
(piglets when both do — the page does the same).

```
{ litterId, mode, baseVersion,
  tallies {cause: n}, picks {rowId: cause}, miss {rowId: yes|no}, note, route, photoRefs [],   // piglets
  sowCause, sowNote, photoRefs [] }                                                        // sow
```

On the prototype the envelope lives in `sessionStorage` under `pp-dead-draft:<variant>:<litter the drawer
opened on>`; `route` is the litter a found body is being recorded on.

- The loss answer is **not** persisted: it is re-asked on every reopen (pre-set to kMin when that is above 0).
- **Restore trims to changed truth and says so**: a picked row that died elsewhere, or tallies above
  a lowered cap, are dropped on reopen with one line naming what was dropped.
- The host says a draft waits in words: `1 unsaved` (piglets, `pp.dead.unsaved`: `1头未保存`), `sow cause unsaved`
  (sow). The host is the page the drawer was opened from (the litter's `Record death` door); the drawer page has no
  host of its own.

## Merge (per RULINGS' draft merge contract)

Allocations apply in log order until a loss is spent (aggregated per loss; each named missing piglet is
reserved once). **The same body recorded twice is held for review (RULINGS round 3):** a body allocated
to a loss already spent — two offline deaths for one missing piglet — is **not applied**: Dead and Alive
stay (`Dead 1, Alive 9`), the death carries `held`, and it is flagged `sync review` (`held_body`) on the
litter drawer (a review row), the Set count drawer and Explain (`count.html?state=held-body`), the record page and the console, until a
worker answers:

```
resolve { litter, held: <death id>, answer: 'one' | 'two' }
```

`one body` — the same piglet: the duplicate is withdrawn, nothing applied. `two bodies` — two piglets
died: the held body applies now as a plain death (it leaves Alive; refused if Alive cannot cover it).
It is never silently a second death. Two deaths for one `rowId` keep the earliest; the later is flagged
`sync review` (`row_already_dead`).

## Interaction requirements of the shared component

- Staged: `Back`, the ✕, the scrim tap and a swipe down on the grab or head all keep the draft (one level down, they
  return to the drawer); `Clear` discards the
  mode on screen; `Save` commits.
- Save is gray (`aria-disabled`, still focusable) whenever it cannot commit, and, once Save is tapped (the guard), the
  footer's status line (`footer({status})`, in the footer and read from the start but visually hidden until that tap) names the missing step (`Pick a cause for 271004`, `How many were missing?`); tapping the gray
  Save scrolls to that step, opening the tagged piglets when the step is there. An empty draft names itself only when Save is tapped.
- Re-rendering keeps the body's scroll position and the focused control.
- **Save and Back return to where the worker came from (R1-26)**: the page named by `back` (Explain), else the litter drawer over the room (`room.html?state=litter&crate=A02`). There is no host stub and no extra Back. Save hands its receipt over on the phone
  (`sessionStorage` `pp-receipt:dead` = `{ parts: [{ id, args, tone }], litter, from, event }`, and `saved=dead` on
  the URL); the page it returns to shows it (`Saved · +1 crushed · 1 missing still open`) and ignores taps for
  ~400 ms. Back from a drawer opened on Explain returns to Explain.
- **A held body is shown where the next body is recorded (R1-22)**: the drawer leads with one row `Same body recorded
  twice? · G.H · 09:55 · held until you answer` when the litter has one unanswered; it opens the question as a dialog
  (`L.M and G.H each took a body from the one missing piglet`) in farrowing's dialog form: the two answers as radios
  (One body / Two bodies), Back + Apply (Apply waits until one is picked). The Set
  count drawer does the same above its number.
- The sow's Save is hold-to-commit (Button `holdButton` + `holdBind`, ADR 0002: 850 ms, the card's slop, repeat
  guard and 400 ms arm floor): a plain tap says `Keep holding to save`, the status line beside the bar reports start
  and cancel, and keyboard or switch access uses the card's two-step (`Press Save again`), disarmed after 5 s or on
  blur. When the hold completes the page rechecks what Save needs before it commits (`settle(el, 'failed')`
  otherwise). The warning above it is farrowing's danger band (`warning({ title, text })`: title `Saving records her death`, text the consequence). The hold is in the primary's ink, as farrowing's
  (`Save · Hold to save`).
- Identified piglets: one row in the drawer (`Identified · 9`, `2 picked`); one level down (`Identified piglets`,
  with Back + Save) they are picked from the roster or by `Scan ear tag`; one cause control for everything
  picked sits below the roster, so ticking never moves a row under the thumb; the `Was 271004 one of the missing?`
  question sits under it.
