**Status: in design.** Built from Inspection's page-built toast (moved as-is first, then designed), for the saves the owner asked to confirm (2026-10-18).

# Toast

Toast says what was just saved, for a few seconds, over the page the worker lands on. Use [Banner](../Banner/README.md) instead for a consequence before a commit, and [Status](../Status/README.md) for a fact that stays.

## When
After a save that closes a sheet and lands where the result is not visible: Record treatment returning to the walk list, a death leaving the list. With no connection the same toast says where the record went: on this phone, uploading when connected.

## When not
- The result shows where you land: the row itself says it; no toast.
- Repeated entries inside a task (counts, weights, piglet processing): the task's own rows and receipt confirm them.
- An upload that succeeds later: the header badge counts down; nothing pops up.
- A failure, never: a save that fails keeps its sheet open with the error.
- Not the only offline signal: the toast goes, so the header badge carries "saved on this phone" after it.

## Anatomy
An ink box above the page's dock, 18px from each side, at least 56px tall. A 28px glyph disc; the title (16px/600, white, a row title's size), what was done; the second line (13px, white at 78%), for whom or where it went. Solid, never see-through: it is read in sun and glare. A tap on it dismisses it and never reaches what it covers.

## Variants
- **Done** (`tone: 'done'`): a check on the green. "Treatment recorded · 000267"; several pigs: "12 pigs".
- **Offline** (`tone: 'offline'`): no-signal on the ink. "Saved on this phone · Uploads when connected · 000267". Never "uploaded" or "synced": nothing has reached the team yet.
- Without a tone it draws no glyph (a title alone, as Inspection's older saves still do).

## States
| State | Rendering |
| --- | --- |
| Default | Glyph, title, second line |
| Title only | Glyph and title; the second line is left out, never left empty |
| Chinese | The same; the title and line wrap rather than clip |
| Entering | Rises 8px and fades in over 0.2s (`st-toast-in`); no motion under reduced motion |

## Behaviour
The host shows one toast at a time; a newer one replaces it. It stays about 3 seconds, then goes; it belongs to the view it landed on, so the next view clears it at once. A tap dismisses it and is not passed to the row or control under it. `role="status"` reads it once to a screen reader. The host sets its height above the dock with `--toast-bottom` (default 104px). In the atlas a held screen keeps it on screen so the gate can see it (rules ledger L25).

## Content rules
The title is what was done, past tense, in the record's own words ("Treatment recorded", "Death recorded", "Changes saved"); the second line is the subject (the ear tag, "12 pigs") or, offline, "Uploads when connected · <subject>". One line each at 360px in English; Chinese may wrap. No exclamation marks, no "successfully".

## API
`SentriUI.toast(title, { detail, tone: 'done' | 'offline', strs, args })`.

## Related
[Banner](../Banner/README.md) · [Status](../Status/README.md) · the design law's "Feedback after saving" (`ux/design-system/README.md`).
