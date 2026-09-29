# Dead picker — data contract (slice 9, candidate)

The one shared dead drawer (`Candidate:DeadDrawer`, page `dead.html`). Farrowing, the farrowing
record, check-in and processing all open this component. It forks on **litter facts**, never on the
task or the surface; the surface chooses copy only. Binds with RULINGS *Surfaces & entrances*,
*Starting and ending a session*, and *Piglet processing* round 2 (the ledger).

## Inputs: litter facts

| Fact | Meaning |
|---|---|
| `phase` | `open` (farrowing not locked) or `locked` (after `Lock born N`, or after the sow's death ended the session) |
| `identified[]` | the litter's live identity rows (`rowId`, tag or notch, sex?, weight?) that have no death |
| `openLosses[]` | open unexplained losses (`lossId`, `qty`, `stampAt`), oldest first |
| `modes` | `['piglets','sow']`, or `['piglets']` when the sow's death is already recorded (the segment is not drawn) |
| `causes[]` | `open`: stillborn · mummified · crushed · scours · starve-out · other. `locked`: crushed · scours · starve-out · other |
| sow causes | `open`: farrowing · prolapse · found dead · other. `locked`: prolapse · found dead · other |

Phase rules:

- `open`: no cap. Tallies never touch Alive; Born derives (Born = Alive + Σ Dead).
- `locked`: untagged tallies are capped at `unidentified alive + Σ open loss`, so a body that was
  already counted missing can be recorded even at 0 alive. Each body leaves Alive unless it is drawn
  from an open loss.
- A stillborn or mummified body found after the lock is not offered. The pointer
  `Born dead? Correct farrowing · Edit` routes it to Born's correction; it is never a processing death.

## Events

```
dead_batch {
  litterId, phase, hand,
  stampAt,            // Save time; the stamp is the date (no WHEN is asked)
  deviceBase,         // the litter version the draft was made against
  lines: [ {cause, n}            // unidentified tallies
         | {cause, rowId} ],     // one identified piglet each
  lossSeen:  [ {lossId, qty} ],  // the open losses on screen when the hand answered
  lossAlloc: [ {lossId, qty} ],  // bodies drawn from them, oldest loss first; Σ qty = the "From the missing" answer
  photos: []
}
sow_died { litterId, cause, note?, photos[] }   // never batched with piglets
```

- **Allocation.** The hand answers how many of the untagged bodies were missing (a Stepper,
  `0 … min(untagged bodies, Σ open loss)`); the device allocates them to open losses oldest first.
  Identified piglets are never missing (they were on the roster) and never draw from a loss.
- **Alive** after a locked batch: `alive − (untagged bodies − allocated) − identified piglets`.
- **Identity status** is derived from the death event, keyed by `rowId`, idempotent per row. The row is
  never deleted: the identity table (S4) shows it with status `dead · <cause> · <date>`, excluded from
  Identified and from `n of N`, kept in *Identity rows on record*. It leaves the picker.
- **Save is idempotent per draft**: one draft commits one event; a second tap while committing is ignored.

## The draft envelope (on the device)

Key: `litterId + mode`. The piglet draft and the sow draft are separate: a piglet Save never erases a
sow draft; `Clear` clears only the mode on screen; the drawer reopens in the mode holding the draft
(piglets when both do).

```
{ litterId, mode, baseVersion,
  tallies {cause: n}, picks {rowId: cause}, photoRefs [],    // piglets
  sowCause, sowNote, photoRefs [] }                          // sow
```

- The loss answer is **not** persisted: it is re-asked on restore.
- **Restore trims to changed truth and says so**: a picked row that died elsewhere, or tallies above
  a lowered cap, are dropped on reopen with one line naming what was dropped.
- The host says a draft waits in words: `1 unsaved` (piglets), `sow cause unsaved` (sow).

## Merge (per RULINGS' draft merge contract)

Allocations apply in stamp order until a loss is spent. Any excess becomes a plain death (it leaves
Alive) and is flagged `sync review` on the Farrowing record page (History) and in the console, resolved
through Edit. Two deaths for one `rowId` keep the earliest; the later is flagged the same way.

## Interaction requirements of the shared component

- Staged: `Back`, the scrim tap and a swipe down on the header all keep the draft; `Clear` discards the
  mode on screen; `Save` commits.
- Save is gray (`aria-disabled`, still focusable) whenever it cannot commit, and a pointer above the
  bar names the missing step (`Pick a cause for 271004`, `How many were missing?`); tapping the gray
  Save scrolls to that step. An empty draft names itself only when Save is tapped.
- Re-rendering keeps the body's scroll position and the focused control.
- After Save the host shows the receipt (`Saved · +1 crushed · 1 missing still open`); the host's own
  Back ignores taps for ~400 ms after the drawer closes.
- The sow's Save is hold-to-commit (850 ms): `touch-action:none`, no callout, sliding within the button
  keeps the hold, a plain tap says `Keep holding to save`, an `aria-live` line reports start and
  cancel, and keyboard or switch access uses a two-step alternative (`Press Save again`).
- Identified piglets: picked from the roster or by `Scan ear tag`; one cause control for everything
  picked sits below the roster, so ticking never moves a row under the thumb.
