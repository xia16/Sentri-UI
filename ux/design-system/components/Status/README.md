**Status: candidate.** Consolidated from the piglet-processing slices' StatusWord and Receipt compositions ([ADR 0002](../../adr/0002-candidates-2.md)). It is not approved.

# Status

How a state is said. There are two placements, and one rule under both: **colour lives on the value, the word stays ink** (RULINGS, 2026-09-03).

- **Word** — `SentriUI.status({ text, tone })`. A state word with a 4px dot: `due now`, `in progress`, `done`, `sow died`. It is the Row's one chip and a heading's trailing word. Never a filled badge.
- **Line** — `SentriUI.statusLine(tokens, { live, sep, mono, tight })`. A body line whose values carry the colour: the receipt `Saved · +4 this visit`, `Overdue · 3 days`, a row's mono line 2 `parity 3 · owed 4`.

**Anatomy**
- Word: an inline row of the `status-dot` dot (4px, `currentColor`) and the word, `status-dot` apart, at `description` (11px/500). The whole word takes the tone.
- Line: `row-title` (13px/400) in `ink`, or IBM Plex Mono with `mono`. Only the parts that carry a `tone` are coloured; the words around them stay `ink`.
- Tokens and parts: a line is a list of tokens; a token is one part or a word and its value (`[{ text: 'Overdue' }, { text: '3 days', tone: 'red' }]`). With `sep: 'dot'` the line draws a `muted` `·` between tokens, so the copy never carries separators of its own. Parts in a token join with a space; `tight` joins them without one (zh strings that carry none).

**Tones**
- `amber`: due now, waiting to upload, a warning that still records, a corrected figure.
- `progress`: in progress.
- `green`: done, recorded, synced, a draft addition (the number is the receipt).
- `red`: a terminal fact (`sow died`) or a number that is overdue. Not for errors on the worker's input: those are amber and never block.
- `muted`: waiting. The default.

**States**
- Default: the word in its tone with its dot; the line in `ink` with coloured values.
- Live: a `live` line is a persistent `role="status"` region. Keep it mounted and patch its text; an empty live line still announces later.
- Pressed, disabled, focus: none. Status is text and holds no action. A status that opens something sits inside a Row or a Button, which owns those states.
- Error, loading: not drawn. There is no spinner word: a pending upload is the amber word `waiting to upload`.
- Empty: absent. A row with nothing to flag has no chip; an empty slot stays empty.

**Don'ts**
- Don't colour the word when the value can carry it: `Overdue` ink, `3 days` red.
- Don't put an icon in place of a word. Status is a word or a colour register, never an icon (RULINGS, Names and glyphs).
- Don't fill a badge, and don't put an ellipsis on a status word.
- Don't use more than one chip per row.

**Strings**
`status` takes `strs: { text }` and `args`. Every part takes its own `strs: { text }` and `args: { text }`. Without `strs` the output is unchanged text. The `·` separator is drawn by the stylesheet and needs no string.
