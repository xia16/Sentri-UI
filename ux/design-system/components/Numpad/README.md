**Status: candidate.** Extracted from the archived tag / weigh pad and the ratified one-pad grammar, then revised after the design panel ([ADR 0001](../../adr/0001-field-cards.md)). It is not approved.

# Numpad

The one type-to-set pad for the whole product. It appears only where typing is real input, which means ear tags and weights. It is never used for counts; those are Steppers. There are two uses, with one grammar:
- **Under a Measure**: the pad shows its keys only, and the Measure is the readout.
- **A run of values in sequence** (the tag / weigh run, one piglet after another): the pad shows a readout naming the subject and field, a hint line, the last three values recorded, and then the keys.

Call `SentriUI.numpad({ label, value, unit, placeholder, suggested, decimals, maxLength, intLength, recent, id, key, action, tone, hint })`.

**Anatomy**
- **Keys.** A 3-column grid in the thumb zone, with `space-key-gap` (8px) gaps: `1 2 3 · 4 5 6 · 7 8 9 · [.] 0 ⌫`.
  - Each key is `choice-row-min` (56px) high and the full column wide, in `paper` with a 1px `control-border` and `radius-control`.
  - The digit is mono `figure`, 21px/500.
  - ⌫ is the registry's `backspace` glyph at `glyph-pad` (20px), stroke 1.8, with a spoken label.
- **Decimal key.** It exists only when `decimals > 0` (weights).
  - For whole-number fields (ear tags) its slot stays an empty gap, so 0 and ⌫ never move between fields.
  - The key reads `.`, never `·`; the copy law keeps `·` as the separator.
- **Readout** (run use only). The label is in `choice-label` 14px at 600 (`Piglet 5 of 11 · ear tag`). Below it sits the same box as an active Measure: an `ink` border at `caret-width`, a mono `figure` value, a caret, and the unit when there is one. The readout is `role="status"` with `aria-live="polite"`.
- **Hint line.** Always reserved, one line of `input` (14px). It holds the suggestion note, the warnings, and the answer to a dead tap.
- **Running list** (run use only). Newest first, at most three entries, in mono 14px `ink`, indented to the value's left edge (`000257 · 1.51 kg`). Three lines are always reserved, even when the list is empty.
- **The keys never move.** The readout, the hint line and the list all hold fixed heights, so the keys sit at the same place on every piglet and every state.
- **No commit key.** The surface's bar holds the one primary (`Record · next piglet`, or the drawer's `Save`). An OK or Enter key on the pad would be a second primary.

**The pad rule (written once, here and in Measure)**
- The pad docks above the bar, in the thumb zone, with its keys `space-row-y` (12px) above the bar.
- The host scrolls the active field into view above the pad.
- Tapping the active field again does nothing.
- The pad closes with Back or by opening another field. The typed text stays as the staged draft.

**States**
- **Default:** typing. The digits are `ink`, with the caret after them.
- **Empty:** the readout holds only the caret, and ⌫ wears the floor-gray.
  - An empty readout is a legal state. The host decides whether a row needs a tag, because notch-only farms exist.
  - Empty is missing, never 0.
- **Suggested** (`suggested: true`): the next tag in sequence, pre-filled in `muted` with no caret.
  - **It can be recorded as it is**, so the happy path is one tap per piglet. The hint reads `Next tag · Record to use`.
  - The first digit replaces the suggestion, and a scan overrides it.
  - ⌫ on a suggestion turns it into typed `ink` minus its last digit.
  - ⌫ back to empty restores the suggestion.
  - The duplicate check never fires on an untouched suggestion.
- **Full:** once a tag has `maxLength` digits, or a weight has `intLength` whole digits and no point, or a weight has all its `decimals` places, the digit keys wear the floor-gray and ⌫ stays live.
- **Pressed:** the key scales to .96 and fills `press`. There is no transform under reduced motion.
- **Disabled: the floor-gray** (see *States* in the design-system README). A key with nothing to do stays tappable, and the host answers the dead tap in the hint line:
  - a digit when full (`Tag is 6 digits`, `2 decimal places at most`);
  - ⌫ on empty (`Nothing to delete`);
  - `.` after a point.
- **Focus:** a 3px `focus` ring, offset 2px, on the key.
- **Warn** (`tone: 'warn'`): an `amber` hint with a dot. The value records anyway.
  - A duplicate tag: `000254 is already on crate B04 · records anyway`.
  - A short tag on Record: `5 of 6 digits`.
  - A weight outside the usual for the day-age: `Outside the usual 1.0–2.8 kg at day 3`.
  - The readout border stays `ink`.
- **Error:** none. The pad holds no value that cannot record. A physically impossible measured value is a Measure's refusal.
- **Loading:** none.

**Event contract**
- Every key is `<button data-action="<action, default numpad>" data-value="<key>" data-key="0–9 | . | back">`. The root carries `data-field` and the `id` a Measure's `aria-controls` points to.
- Delegate with `closest('[data-action]')`. Run each key through `SentriUI.numpadInput(state, key, { decimals, maxLength, intLength })`:
  - `state` is `{ value, suggested, suggestion }`, and `value` is **always a string**. Never pass it through `Number()`, because tags keep their leading zeros.
  - The function returns the next state and `dead` (`'full' | 'point' | 'empty' | null`); answer `dead` in the hint line.
  - Its rules: `.` first gives `0.`, weights strip a leading zero, tags keep theirs, and the suggestion rules above apply.
- On commit, `SentriUI.numpadCommit(value, { decimals })`:
  - `16.` → `16`;
  - weights lose leading zeros;
  - empty → `null`.
- **Hardware keyboard and wedge scanners.** `SentriUI.numpadKey(event)` maps digits, `.` (and `,`) and Backspace to the same keys, through the same path.
  - Enter returns `'enter'`, and **Enter never commits**.
  - A wedge scanner's digits arrive as keys, and its trailing Enter only ends the burst. The readout then holds the full tag, and Record still commits.
- The typed draft belongs to the host and survives interruption.
- Re-render by patching the pad keyed by `data-field`. Keep the readout mounted so its live region announces, and keep focus on the key that was pressed.

**What the caller provides**
- `decimals`: 0 for tags, 2 for piglet weights, 1 for litter weight.
- `maxLength` (6 for a farm's ear tags) and `intLength` (the whole digits of a weight).
- The label with the subject's position in the run (`Piglet 5 of 11 · weight`), and the running list's text.
- The commit in the bar, and what happens after it: the next piglet, and the tag auto-incremented into a new suggestion.

**Don'ts**
- Don't put the pad under a count. Type-to-set is retired on count figures.
- Don't add an OK, Enter, Next or Clear key, and don't reorder the keys for different fields.
- Don't block Record on a duplicate or short tag. Warn in words.
- Don't let the system keyboard open instead.
- Don't show more than three recorded values. History is the record's job.

**Strings**
- `strs: { label, value, unit, placeholder, hint, digit, decimal, back, pad, recent }` and `args`. Without `strs`, the output is unchanged.
- `digit` wraps each key with `{ n }` (`ds.field.figure`), and `decimal` wraps `.`.
- `back`, `pad` and `recent` are spoken labels, set through `data-str-attr`.
- Each running-list item takes `{ text, strs: { text }, args: { text } }` (`ds.field.numpad.recent`).
- Hint copy: `ds.field.numpad.suggested`, `.duplicate`, `.short`, `.dead_full`, `.dead_places`, `.dead_empty`, `.weight_range`.
