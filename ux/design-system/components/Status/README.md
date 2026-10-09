**Status: in design.** One implementation of "how a state is said", rebuilt from the hand-built chips (TaskRow `.tk-chip`, Farrowing `.state-word` / `.done-word` / `.ended-word`, Home's card status) and the candidate word and line (ADR 0002).

# Status

Status says the **workflow state** of one item on one line: Awaiting, Active, Done, Late, Overdue, Sow died. Use [ConditionTag](../ConditionTag/README.md) instead for a recorded health condition with a care level, [Banner](../Banner/README.md) for a message that needs the worker's attention, and plain row text for a forecast (`Due tomorrow`, `Expected in 5 days`): a forecast is not a state.

## When to use / when not
- **Use** when a row, a heading or a line must say where an item stands in the task.
- **Don't** use for a health condition (ConditionTag), a count or a measure (Row, Measure), an action (Button), or a forecast (text in `muted`).
- A status that opens something sits inside a Row or a Button, which owns the tap.

## The colour map (the one definition)
Every status, in every variant and every screen, takes its colour from this table. Tokens are in `tokens.json`.

| Kind | Means | Tone | Chip colours | Icon (chip) |
|---|---|---|---|---|
| `awaiting` | not started yet (`Awaiting`, `To do`) | `muted` | `muted` on `well`, `line` | none |
| `active` | in progress (`Active`) | `progress` | `progress` on `progress-wash`, `chip-progress-border` | none |
| `done` | recorded, finished (`Done`) | `green` | `green` on `green-wash`, `chip-green-border` | check |
| `late` | past its time, still records (`Late`) | `amber` | `amber` on `amber-wash`, `pending-border` | clock |
| `overdue` | past its due date by days (`Overdue`) | `red` | `red` on `red-wash`, `chip-red-border` | alert |
| `died` | a terminal fact (`Sow died`) | `red` | `red` on `red-wash`, `chip-red-border` | none |

Green means done and nothing else: a pending item is never green. `To do` is `awaiting`.

## Anatomy
- **Chip:** optional icon (`glyph-tag` 12px) + text, one badge. 10px/600 (`meta`), padding `space-3` `space-6`, `radius-chip`, 1px border, `row-chip-max` wide at most. It wraps; it never ends in an ellipsis.
- **Word:** a `status-dot` (4px) dot and the word, `status-dot` apart, 11px/500 (`description`). The whole word takes the tone.
- **Line:** a body line (13px, `ink`) whose values carry the colour at 600; the words around them stay `ink`. Tokens join with a real `·` text node.

## Variants
- **Chip** (`variant: 'chip'`): a state on a list row, one per row, under the ID. Used by TaskRow (Piglet processing), Farrowing's room list and Home's task card (`Overdue` only: a count of days is meta text, not a status).
- **Word** (`variant: 'word'`, the default): a state in a heading, a meta line or a map cell. Used by Farrowing's Go-to-pen map (`Active`, `Overdue`) and the Row's `chip` slot.
- A **dot** variant was built and removed: a bare shape tells Done, Late and Overdue apart by colour alone. Add it back when a screen needs it, with a shape per kind.
- **Line** (`statusLine`): coloured values in a body line: the receipt `Saved · +4 this visit`, `Overdue · 3 days`, a row's mono line 2.

## States
Status is text and holds no action, so most interaction states do not apply.

| State | Chip | Word | Line |
|---|---|---|---|
| Default (one per kind) | drawn, 6 kinds | drawn, 6 kinds | drawn |
| Pressed, focus | none: the Row or Button around it owns them | same | same |
| Selected, disabled | none: a state is a fact, not a control | same | same |
| Error, loading | none: a pending upload is the amber word `waiting to upload` | same | same |
| Empty | absent: a row with nothing to flag has no chip | same | same |
| Long label | wraps within `row-chip-max` | wraps | wraps |
| Chinese | `母猪死了` fits one line | fits | fits |
| Live | n/a | n/a | a `live` line is a persistent `role="status"` region (below) |

## Behaviour
- `kind` picks the tone, and for a chip the icon. `tone` alone still works for a word (`status({ text, tone })`); a `kind` with a `tone` uses the tone.
- A live line is mounted **empty**: its content waits in a `<template>` and the host calls `SentriUI.liveFill(scope)` once after inserting the markup. To change it later call `SentriUI.announce(el, SentriUI.statusText(tokens))`, which clears and then sets after 60ms and keeps only the latest message per region.
- **Props:** `status({ text, kind, tone, variant, icon, id, className, strs, args })`; `statusLine(tokens, { live, sep: 'dot' | '', mono, tight, id, className })`; `statusText(tokens, { sep, tight })`; `announce(el, html, { delay, then })`; `liveFill(scope, { delay, then })`. TaskRow takes `chip: { text, str, args, kind }`.
- **Events:** none. **Slots:** the text (chip, word) or the tokens (line). **Ids:** `id` is written on the root.
- **Port note (Vue / React Native):** a live line is a view with `accessibilityLiveRegion="polite"` (Android) or an `announceForAccessibility` call (iOS) that fires after mount; the separator is a text child.

## Content rules
- Sentence case, one to two words: `Active`, `Done`, `Late`, `Overdue`, `Sow died`, `To do`. At most **12 characters** in English and **6** in Chinese; a longer state is a sentence in a Banner or a line.
- Never an ellipsis on a status word; a chip wraps instead. Never "Unchecked", exclamation marks or emoji.
- One chip per row. If two things are true, the more urgent state wins (`Late` over `To do`; `Sow died` over everything).
- Colour lives on the value: `Overdue` stays `ink` in a line and `3 days` is red.

## Accessibility
- Chip and word are plain text: the state is read in order with the row. The chip's icon is `aria-hidden`; the word is always there, so colour and icon are never the only cue.
- A live line is `role="status"`, `aria-live="polite"`, `aria-atomic`. Status takes no focus and has no keyboard behaviour.
- Contrast: every tone holds 4.5:1 or more on its wash. Nothing here is a tap target; the 48px floor belongs to the Row that carries it.

## Do / Don't
- Do take every status colour from the map above, in every screen.
- Do put the chip under the ID in a list row and the word in a heading.
- Don't colour a pending item green, fill a badge with a colour that isn't in the map, or draw a chip by hand.
- Don't put an icon in place of a word.
- Don't put more than one chip on a row, and don't insert a live region with its content already in it.

## CSS variables
`--ink`, `--muted`, `--line`, `--well`, `--green`, `--green-wash`, `--chip-green-border`, `--amber`, `--amber-wash`, `--pending-border`, `--red`, `--red-wash`, `--chip-red-border`, `--progress`, `--progress-wash`, `--chip-progress-border`, `--radius-chip`, `--row-chip-max`, `--glyph-tag`, `--status-dot`, `--space-3|4|6`, `--type-meta-size`, `--type-description-size`.

## Related
| Component | Use it for |
|---|---|
| [ConditionTag](../ConditionTag/README.md) | a recorded health condition and its care level |
| [Row](../Row/README.md) | the `chip` slot takes a Status word; the row owns the tap |
| [TaskRow](../TaskRow/README.md) | the animal row; its chip is a Status chip |
| [Banner](../Banner/README.md) | a message the worker must read |
| [TaskProgress](../TaskProgress/README.md) | how much of the task is done |

## Classification
**Component** (generic, used by three sections). `chip`, `word` and `line` are its **variants**. `Due tomorrow` is not a status; it is text.
