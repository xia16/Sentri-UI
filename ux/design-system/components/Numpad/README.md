**Status: candidate.** Extracted from the archived tag / weigh pad and the ratified one-pad grammar. Revised after the design panel and the refute pass ([ADR 0001](../../adr/0001-field-cards.md)). It is not approved.

# Numpad

The one type-to-set pad, product-wide. It is used only where typing is real input: ear tags and weights. It is never used for counts, which are Steppers. The pad has two uses under one grammar:
- **Under a Measure:** the pad shows its keys and a status line, and the Measure above is the readout.
- **A run of values in sequence** (the tag / weigh run, one piglet after another): the pad shows a readout naming the subject and field, a bounded feedback region (a status line and the last three recorded values), and then the keys.

Call `SentriUI.numpad({ label, value, unit, placeholder, suggested, decimals, maxLength, intLength, recent, actions, id, key, action, tone, hint })`.

**Anatomy**
- **Keys.** A 3-column grid in the thumb zone, with `space-key-gap` (8px) gaps: `1 2 3 · 4 5 6 · 7 8 9 · [.] 0 ⌫`.
  - Each key is `choice-row-min` (56px) high and the full column wide, in `paper` with a 1px `control-border` and `radius-control`.
  - Digits are set in mono `figure` 21px/500.
  - ⌫ is the registry's `backspace` glyph at `glyph-pad` (20px), stroke 1.8, with a spoken label.
- **Decimal key.** It exists only when `decimals > 0` (weights). For whole-number fields (ear tags) its slot stays an empty gap, so 0 and ⌫ never move between fields. The key is `.`, never `·`.
- **Readout** (run use only).
  - The label is `choice-label` 14px at 600 (`Piglet 5 of 11 · ear tag`).
  - Under it sits the same box as an active Measure: an `ink` border at `caret-width`, a mono `figure` value, a caret, and the unit when there is one.
  - The **value** is a polite live region, so typing announces only the value, never the label.
- **Feedback region.** It is **bounded**. Its heights are fixed and it scrolls inside itself, so no feedback ever moves the keys.
  - **Status line** (`role="status"`, always mounted, which the key group points to with `aria-describedby`). It is `tap-min` (48px) tall: room for two lines of `input` 14px (the longest duplicate warning in en or zh) or one line with a text action.
  - **Running list** (run use only). Three lines of mono 14px `ink`, newest first, indented to the value's left edge (`000257 · 1.51 kg`). The space is reserved even when the list is empty.
- **The keys never move.** The readout and the feedback region hold fixed heights, so the keys sit at the same place for every piglet and in every state. The demo measures this: 218px from the top of the pad in all 15 run states, en and zh, at 360 and 390.
- **No commit key.** The surface's bar holds the one primary (`Record · next piglet`, or the drawer's `Save`).

**The pad rule (written once, here and in Measure)**
- The pad docks above the bar, in the thumb zone, with its keys `space-row-y` (12px) above the bar. The pad and the bar are anchored at the bottom, independent of the feedback above the keys.
- The host scrolls the active field into view above the pad.
- Tapping the active field again does nothing.
- The pad is dismissed with Back or by opening another field. The typed text stays as the staged draft.

**States**
- **Default:** typing. Digits in `ink`, with the caret after them.
- **Empty:** the readout holds only the caret, and ⌫ wears the floor-gray. An empty readout is a legal value: the host decides whether a row needs a tag, because notch-only farms exist. Empty means missing, never 0.
- **Suggested** (`suggested: true`): the next tag in sequence, pre-filled in `muted` with no caret.
  - **It can be recorded as it is.** The happy path is one tap per piglet, and the hint reads `Next tag · Record to use`.
  - The first digit replaces the suggestion. A scan replaces it too.
  - ⌫ on a suggestion turns it into typed `ink`, minus its last digit.
- **Cleared:** deleting down to empty reaches a **stable empty** (missing). The last ⌫ never brings the suggestion back.
  - Returning to the suggestion is a separate, named transition: a text action in the status line, `Use 000258` (`actions`). It feeds `numpadInput(state, 'suggestion')`.
- **Full:** a tag at `maxLength` digits, a weight at `intLength` whole digits with no point, or a weight with all its `decimals` places. The digit keys wear the floor-gray, and ⌫ stays live.
- **Pressed:** the key scales to .96 and fills `press`. There is no transform under reduced motion.
- **Disabled — the floor-gray** (see *States* in the design-system README). A key with nothing to do stays tappable, and the host answers the dead tap in the status line:
  - a digit when full: `Tag is 6 digits` or `2 decimal places at most`;
  - ⌫ on empty: `Nothing to delete`;
  - `.` after a point.
- **Focus:** a 3px `focus` ring, offset 2px, on the key.
- **Warn** (`tone: 'warn'`): an `amber` hint with a dot. **Record stays available**, and the value records.
  - **Duplicate tag.** The check runs on **every accepted value, suggestions included**: typed, suggested or scanned. It shows `000254 is already on crate B04 · records anyway`.
  - **Short tag, on Record:** `5 of 6 digits`.
  - **Unusual weight for the day-age:** `Outside the usual 1.0–2.8 kg at day 3`.
  - The readout border stays `ink`.
- **Where a duplicate warning survives.**
  - When Record advances to the next piglet, the recorded line in the running list keeps an amber dot and says so: `000254 · 1.42 kg · also on B04` (list item `tone: 'warn'`).
  - A duplicate found after offline sync gets the same amber mark on the litter's identity row and in the running list. Nothing is merged, withdrawn or blocked; correcting it goes through Edit.
- **Scan not read.** A scan that fails validation (wrong length, not digits) keeps what was there. The status line says why: `Scan not read · a tag is 6 digits`.
- **Error:** none. The pad never holds a value that cannot record. A physically impossible measured value is a Measure's refusal.
- **Loading:** none.

**Event contract**
- Every key is `<button data-action="<action, default numpad>" data-value="<key>" data-key="0–9 | . | back">`. Status-line text actions carry their own `data-action` (for example `numpad-suggestion`). The root carries `data-field` and the `id` that a Measure's `aria-controls` points to.
- Delegate with `closest('[data-action]')`. Run each key through `SentriUI.numpadInput(state, key, { decimals, maxLength, intLength })`.
  - `state` is `{ value, suggested, suggestion }`. `value` is **always a string**; never pass it through `Number()`, because tags keep their leading zeros.
  - The keys are `'0'`–`'9'`, `'.'`, `'back'`, and `'suggestion'` (the `Use 000258` transition).
  - It returns the next state and `dead` (`'full' | 'point' | 'empty' | null`). Answer `dead` in the status line.
  - The rules: `.` first gives `0.`; a weight strips a leading zero; a tag keeps its zeros; a suggestion becomes ink on ⌫; a cleared value stays empty.
- **A scan is atomic.** A scan is a **replacement** event, never an append.
  - `SentriUI.numpadScan(state, scanned, { maxLength })` validates the scan (digits only, exactly `maxLength` for tags). It then **replaces** whatever is typed or suggested and returns `scanned: true`. An invalid scan keeps the state and returns `dead: 'scan'`.
  - Camera scans call it directly.
  - Wedge scanners go through `SentriUI.numpadScanner({ onKey, onScan, gap = 35, minKeys = 4 })`. A **burst** is at least `minKeys` digits, each within `gap` ms of the one before, ending in Enter within `gap` ms. It is delivered once to `onScan` and never typed. Any other keystroke is released to `onKey` as an ordinary key, held at most `gap` ms, so ordinary keystrokes keep appending.
  - `tests/field-cards.test.mjs` covers this (`node --test tests/field-cards.test.mjs`):
    - typed `12`, then a scan of `000254`, gives `000254`;
    - a full typed tag, then a scan, is replaced;
    - a burst is never typed;
    - human keys pass through;
    - the clear and suggestion transitions.
- **Hardware keyboard.** `SentriUI.numpadKey(event)` maps digits, `.` (and `,`) and Backspace. Enter returns `'enter'`, and **Enter never commits**: outside a burst it is dropped.
- **On commit.** `SentriUI.numpadCommit(value, { decimals })` turns `16.` into `16`, strips a weight's leading zeros, and turns empty into `null`.
- **Drafts and re-renders.** The typed draft belongs to the host and survives interruption. Re-render by patching the pad keyed by `data-field`. Keep the readout and status line mounted so their live regions announce, and keep focus on the key that was pressed.
- **Announcements are concise.** The value announces as it is typed. The status line announces a warning, a dead-tap answer or a scan failure once. The running list and the label are not live.

**What the caller provides**
- `decimals`: 0 for tags, 2 for piglet weights, 1 for litter weight.
- `maxLength`: 6 for a farm's ear tags.
- `intLength`: the whole digits of a weight.
- The run label (`Piglet 5 of 11 · weight`), the running list's text and any warn marks on it.
- The duplicate lookup, run on every accepted value.
- The commit in the bar, and what follows it: the next piglet, and a new suggestion auto-incremented past tags already used.

**Don'ts**
- Don't put the pad under a count. Type-to-set is retired on count figures.
- Don't add an OK, Enter, Next or Clear key, and don't reorder keys per field.
- Don't block Record on a duplicate or short tag. Warn in words, and keep the mark on the list.
- Don't append a scan to typed digits, and don't let the last ⌫ restore the suggestion.
- Don't let the system keyboard open instead, and don't show more than three recorded values.

**Strings**
- `strs: { label, value, unit, placeholder, hint, digit, decimal, back, pad, recent }` and `args`. Without `strs` the output is unchanged.
  - `digit` wraps each key with `{ n }` (`ds.field.figure`).
  - `back`, `pad` and `recent` are spoken labels, set through `data-str-attr`.
- Running-list items take `{ text, tone, strs: { text }, args: { text } }`: `ds.field.numpad.recent`, or `.recent_dup` for a warned line.
- Status actions take `{ label, action, strs: { label }, args }`: `ds.field.numpad.use_suggestion`, `Use {tag}`, kind `pointer`, because "Use" is not a registered verb.
- Hint copy: `ds.field.numpad.suggested`, `.duplicate`, `.short`, `.dead_full`, `.dead_places`, `.dead_empty`, `.dead_scan`, `.weight_range`.

## Candidate addition ([ADR 0002](../../adr/0002-candidates-2.md))

**Status: candidate.** `compact: true` is the run without its three-line running list.
- Use it for a run that must fit one 360 × 740 phone with a field above the pad (the tag and weigh run with the sex field).
- The host speaks the last record in the status line instead (`Last 000257 · 1.51 kg`, with a text action such as `Edit piglet 4`).
- The status line keeps its reserved `tap-min` height, so the keys still never move.
- The readout, the keys and the event contract are unchanged.

**Component contract**
- **Props:** as above, plus `compact`.
- **Events:** each key is `<button data-action="<action, default numpad>" data-value="<key>" data-key="0–9 | . | back">`, and each status-line text action has its own `data-action`.
- **Slots:** the readout label, the status line (text and text actions), and the running list (absent when `compact`).
