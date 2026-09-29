**Status: candidate.** Consolidated from the piglet-processing slices' StatusWord and Receipt compositions and revised after the design panel ([ADR 0002](../../adr/0002-candidates-2.md)). It is not approved.

# Status

How a state is said. There are two placements, and one rule under both: **colour lives on the value, the word stays ink** (RULINGS, 2026-09-03).

- **Word**: `SentriUI.status({ text, tone })`. A state word with a 4px dot: `due now`, `in progress`, `done`, `sow died`. It is the Row's one chip and a heading's trailing word. It is never a filled badge.
- **Line**: `SentriUI.statusLine(tokens, { live, sep, mono, tight })`. A body line whose values carry the colour: the receipt `Saved · +4 this visit`, `Overdue · 3 days`, a row's mono line 2 `parity 3 · owed 4`.

**Anatomy**
- **Word:** an inline row of the `status-dot` dot (4px, `currentColor`) and the word, `status-dot` apart, at `description` (11px/500). The whole word takes the tone.
- **Line:** `row-title` (13px/400) in `ink`, or IBM Plex Mono with `mono`. Only the parts that carry a `tone` are coloured, **at 600**; the words around them stay `ink` at 400.
- **Tokens and parts:** a line is a list of tokens. A token is one part, or a word and its value (`[{ text: 'Overdue' }, { text: '3 days', tone: 'red' }]`). With `sep: 'dot'` the line puts a `muted` `·` between tokens.
  - The `·` is a **real text node** (`<span class="st-sep" data-str="ds.sep">·</span>`), styled with 4px on each side, so it copies, reads and wraps like text. The copy never carries separators of its own.
  - Parts in a token join with a space. `tight` joins them without one, for zh strings that carry none.

**Tones**
- `amber`: due now, waiting to upload, a warning that still records, a corrected figure.
- `progress`: in progress.
- `green`: done, recorded, synced, a draft addition (the number is the receipt).
- `red`: a terminal fact (`sow died`) or a number that is overdue. Not for errors on the worker's input: those are amber and never block.
- `muted`: waiting. This is the default. An unknown tone warns in development and falls back to `muted`.

**States**
- **Default:** the word in its tone with its dot, and the line in `ink` with coloured values.
- **Live:** a `live` line is a persistent `role="status"` region with `aria-atomic`.
  - It is **mounted empty**, because content inserted together with its region is not announced. The card writes the content into a `<template>` inside the region.
  - The host calls `SentriUI.liveFill(scope)` once after inserting the markup: it clears the region, then sets it.
  - To change it later, call `SentriUI.announce(el, SentriUI.statusText(tokens))`, which clears and then sets after 60ms.
- **Pressed, disabled, focus:** none. Status is text and holds no action. A status that opens something sits inside a Row or a Button, which owns those states.
- **Error, loading:** not drawn. There is no spinner word: a pending upload is the amber word `waiting to upload`.
- **Empty:** absent. A row with nothing to flag has no chip; an empty slot stays empty.

**Component contract**
- **Props:**
  - `status({ text, tone, id, className, strs, args })`.
  - `statusLine(tokens, { live, sep: 'dot' | '', mono, tight, id, className })`.
  - `statusText(tokens, { sep, tight })` returns the line's inner HTML.
  - `announce(el, html, { delay = 60, then })` and `liveFill(scope, { delay, then })`.
- **Events:** none. Status emits nothing.
- **Slots:** the text (word) or the tokens (line). There are no child slots.
- **Ids:** `id` is written on the root, so a host can hold the region and announce into it.
- **Port note (Vue / React Native):**
  - A live line is a view whose `accessibilityLiveRegion="polite"` (Android) or an `AccessibilityInfo.announceForAccessibility` call (iOS) fires after mount, never with it.
  - The separator is a text child, not a decoration.

**Don'ts**
- Don't colour the word when the value can carry it: `Overdue` stays ink, `3 days` is red.
- Don't put an icon in place of a word. Status is a word or a colour register, never an icon (RULINGS, Names and glyphs).
- Don't fill a badge, and don't put an ellipsis on a status word.
- Don't put more than one chip on a row.
- Don't insert a live region with its content already in it.

**Strings**
- `status` takes `strs: { text }` and `args`. Every part takes its own `strs: { text }` and `args: { text }`. Without `strs` the output is unchanged text.
- The separator is `ds.sep` (`·` in every locale).
