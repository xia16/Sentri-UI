**Status: in design.** Built from Inspection's page-built toast (moved as-is first, then designed) for the saves the owner asked to confirm (2026-10-18). The design law's [Feedback after saving](../../README.md#feedback-after-saving-owner-2026-10-18) says when it is used.

# Toast

Toast says what was just saved, for a few seconds, over the page the worker lands on. Use [Banner](../Banner/README.md) instead for a consequence before a commit, and [Status](../Status/README.md) for a fact that stays.

## When
- A save closes a sheet and lands where the result is **not visible**: Record treatment or Record vaccination returning to the walk list. It says what was done and for whom.
- The same save with **no connection**: it says the record is kept on this phone and uploads when connected.

## When not
- **The result is visible where you land**: a finding sheet shows the treatment it returns to; an edited row shows its new value. The screen is the confirmation.
- **Repeated entries inside a task** (counts, weights, piglet processing): the task's own rows and receipt confirm each one.
- **An upload that succeeds later**: nothing pops up; the header badge counts down.
- **A failure, never.** A save that fails keeps its sheet open with the error; an upload that fails stays in the badge and in Data sync until someone deals with it.
- **Not the only offline signal**: the toast goes, so the header badge carries "saved on this phone" after it (Data sync).
- **Not a question or a choice**: no Undo, no View, no buttons. Anything the worker must decide belongs in a sheet.

## Anatomy
| Part | What it is |
| --- | --- |
| Box | The ink (`--ink`), solid, never see-through: it is read in sun and glare. `--radius-inset` (14px) corners, a soft shadow. 18px (`--space-gutter`) from each side of the phone, at least 56px tall, padding 10px 16px. |
| Place | Above the page's dock: `bottom: var(--toast-bottom, 104px)`, 10px clear of a 94px dock. The host moves it with `--toast-bottom` when its dock is taller or absent. |
| Glyph | A 28px disc with a 16px glyph, 12px before the copy: a white check on `--green` (done), no-signal on white at 14% (offline). None in the plain form. |
| Title | What was done, past tense: 16px / 600 (a row title's size), white. |
| Second line | For whom, or where it went: 13px / 400, white at 78%. Left out, never left empty, when there is nothing to say. |

The check on the green is the only colour; green means done (design law: colour). No tone draws red or amber: a problem is never a toast.

## Variants
- **Done** (`tone: 'done'`): a check on the green. "Treatment recorded · 000267"; several pigs: "Treatment recorded · 12 pigs"; "Vaccination recorded".
- **Offline** (`tone: 'offline'`): no-signal on the ink. "Saved on this phone · Uploads when connected · 000267". Never "uploaded" or "synced": nothing has reached the team yet.
- **Plain** (no tone): a title, no glyph. Only where a host has not moved its older saves to a tone yet (Inspection's "Weights saved"); new saves use done or offline.

## States
| State | Rendering and behaviour | Drawn on the component page |
| --- | --- | --- |
| Default | Glyph, title, second line | Done, Offline, Plain |
| Several pigs | The second line counts them: "12 pigs" / "12 头猪" | Done, Offline |
| Title only | Glyph and title; no second line | Done ("Changes saved"), Plain |
| Long line | A longer line wraps and the box grows; nothing is clipped or cut with an ellipsis. Not drawn: every real line fits one line at 360px (no invented stress copy) | — |
| Chinese | The same parts; Chinese wraps rather than clips | Done, Offline, Plain |
| Entering | Rises 8px and fades in over 0.2s (`st-toast-in`); no motion under reduced motion | Held screens (below) |
| Showing | About 3 seconds, one at a time; `role="status"` reads it once to a screen reader | Held screens |
| Replaced | A newer toast replaces it at once; toasts never stack | — |
| Cleared by the next view | It belongs to the view it landed on: opening a pig, a sheet or another page clears it at once | — |
| Dismissed by a tap | A tap on it dismisses it and never reaches the row or control it covers | — |
| Gone | Removed after its time; nothing replaces it | — |
| Held (atlas) | While the atlas holds a screen still, it stays on screen so the gate can see it (rules ledger L25) | `health-record.treatment-saved`, `…-saved-offline` |

There is no pressed, disabled, loading or error state: it takes no action, and a failure is never a toast.

## Behaviour
- **One at a time.** The host keeps one toast; a newer one replaces it.
- **About 3 seconds**, then gone. It is not a record the worker can return to: the record itself, the log and (offline) the header badge are.
- **It belongs to the view it landed on.** The next view clears it, so it never sits over a sheet it wasn't about.
- **A tap dismisses it** and is not passed through: a gloved thumb on the toast never opens the row hidden under it.
- **Screen readers** hear it once (`role="status"`); it takes no focus.
- **Reduced motion**: it appears without rising.
- **In the atlas** a held screen keeps it; the gate shoots it like any screen.

## Content rules
- **Title**: what was done, past tense, in the record's own words: "Treatment recorded", "Vaccination recorded", "Death recorded", "Changes saved". Offline: "Saved on this phone". At most about 24 characters in English, 10 in Chinese, so it stays on one line at 360px.
- **Second line**: the subject (the ear tag "000267", or "12 pigs") or, offline, "Uploads when connected · <subject>". One line at 360px in English where it can; it may wrap rather than be cut.
- No exclamation marks, no "successfully", no "please", no internal names (queue, sync job).
- Strings live in `ux/laws/strings.json` (`save.*`) with their Chinese.

## API
`SentriUI.toast(title, { detail, tone, strs, args })` returns the markup.

| Option | Type | Meaning |
| --- | --- | --- |
| `title` | string | What was done (required) |
| `detail` | string | For whom, or where it went (optional; left out when empty) |
| `tone` | `'done'` \| `'offline'` | The glyph; omitted for the plain form |
| `strs`, `args` | string ids | `{ title, detail }` string ids and their arguments, so the page's language switch reaches them |

The host owns timing, replacement, clearing on the next view and the tap: see Inspection's `notify` and `saveToast` (`ux/system/inspection-astra-concept.js`).

## Tokens
`--ink`, `--green`, `--radius-inset`, `--space-gutter`, `--space-10`, `--space-12`, `--space-16`, `--type-row-title-size`, `--font-size-13`, `--font-sans`; host override `--toast-bottom`.

## Used by
Inspection's record actions, through one rule (`saveFeedback` in `ux/system/inspection-astra-concept.js`; tested in `ux/system/save-feedback.test.cjs`):

| Action | One pig | Several pigs |
| --- | --- | --- |
| Record treatment / vaccination | "Treatment recorded · 000267" | "… · 12 pigs" |
| Measurements: weight, temperature, backfat | "Weight recorded · 000267" | "… · 12 pigs" |
| Add a note | "Note added · 000267" | "… · 12 pigs" |
| Resolve conditions | "Marked recovered" / "Record corrected · 000267" | "… · 12 pigs" |
| Record health (disease or symptom) | none when the row is on screen and shows every tag; else "Condition recorded · 000267" | "Condition recorded · 12 pigs" |
| Body condition, care instructions, edit conditions | as Record health: none only when the row is in view with every tag | "… · 12 pigs" |
| Record abortion, batch membership | "Abortion recorded" / "Batch updated · 000267" | one pig only |

None after a save that returns to its finding (the finding shows it). Moving a pig is saved by Farrowing's host, which owns its own feedback. Older plain toasts ("Weights saved", "Saved to pen …", "Task completed") remain where Inspection's older flows draw them.

## Related
[Banner](../Banner/README.md) · [Status](../Status/README.md) · [TaskReceipt](../TaskReceipt/README.md) (a finished task's receipt, which stays) · the design law's Feedback after saving.
