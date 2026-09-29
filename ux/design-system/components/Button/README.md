# Button

The footer and bar actions. It is a CSS component (`<button class="button primary">`). The candidate factory `SentriUI.button({ label, register, action, value, waiting, describedby })` writes the same markup with `data-ds="Button"` and a string twin.

**Variants**
- `primary`: an `ink` fill with a white label. Every commit uses it, and there is one per bar, on the right.
- `secondary`: a `paper` fill with a `control-border` border. It is at least 86px wide.
- `danger`: a `red` fill with a white label, for deleting and ending.
- `task-end-early`: a `red-wash` fill with a `red` border and label.
- Back is `surface-back`: 86 × 48, `back-border`, on the left. A lone Back fills the footer and turns `ink`.

**Geometry**
- 48px high in footers and 44px minimum anywhere else.
- `radius-control` (12px), 14px/500 label.
- Pressing darkens the button to `brightness(.96)` and moves it down 1px.

**What the caller provides**
- A verb with its count and place: "Record for 12 pigs", "Confirm & next", "Foster 3 · B4 → B6", "Final · 10 total".

**Rules**
- A bar holds at most two actions, with the primary on the right.
- Never label a button "Submit", "Save" or "Complete", because every action commits itself.
- Green is never a button fill. Destructive buttons never take the primary treatment.
- Disabled primaries go `disabled-fill`. Prefer leaving out an action the worker can't take.

**States**
- Default: a white `button` with a `control-border` border. Primary is `ink`, danger is `red`, `task-end-early` is `red-wash`.
- Pressed: hover darkens to `brightness(.96)`, and `:active` moves the button down 1px (not under reduced motion). Back (`surface-back`) fills `#f5f6f1` with a green label while pressed. A lone Back stays `ink`.
- Disabled: any disabled button takes the flat grey fill, border and label (`#f1f2ed`, `#d9ddd3`, `#92998d`). A disabled primary takes `disabled-fill`. Prefer omission: leave out an action the worker can't take.
- Waiting (candidate): see below.
- Focus: a 3px `focus` ring at 2px offset. Back's own ring is 2px.
- Error, loading, empty: not drawn. Danger is a variant for destructive verbs, not an error state, and there is no spinner. A hold that has been sent shows its `pending` phase (below).

## Candidate additions ([ADR 0002](../../adr/0002-candidates-2.md))

**Status: candidate.** The two missing registers, the waiting face and hold-to-commit. Not approved.

**The four registers** (RULINGS, three button registers, 2026-09-01, plus the text action)
- **Exit** — `secondary` (and Back): outlined. `Close`, `Back`.
- **Commit** — `primary`: the one ink fill. `Finish farrowing`, `Save`, `Lock born 14`.
- **Tool** — `register: 'tool'` (`.button.tool`): a mid-sheet act on the thing in front of you. A `well` fill, no border (the border takes the fill), `ink` 14px/500 label, `control-height`. Tools come in pairs on a two-column grid (`Record dead · Set count`) and never sit in the bar: **the bar holds exits only, plus the one commit.**
- **Text** — `register: 'text'` (`.st-text-action`): the quietest register. A bare word at `row-title` (13px/600), `ink`, no container, a hit area of at least `touch-min` in both directions. It sits right-aligned on the row it acts on, and is present only while it applies (`Clear` on a draft, a floor pointer such as `Wrong count? Edit`).

**Waiting** (`waiting: true`)
- A button that waits on a step stays **present and quiet**: `aria-disabled="true"`, never `disabled`, so it keeps its place and its focus, and the tap still reaches the host.
- It takes `disabled-fill` with a `disabled-ink` label and border in every register, and no press or hover. The bundle's register rules skip `aria-disabled`, so no page needs its own override.
- The host answers the tap, and says why beforehand, in one persistent `buttonReason` line beside the bar: `SentriUI.buttonReason({ id, text })`, 12px `muted`, `role="status"`. Point the button at it with `describedby`.
- Prefer omission when the worker cannot make the button live from this sheet. Use waiting when one visible step makes it live (`Choose a cause for 2 crushed to save`).

**Hold** — `SentriUI.holdButton({ label, caption, tone, phase })`
- For the suite's irreversible acts only: `Lock born N`, saving the sow's death, `End task`.
- The verb, with a caption under it at `description` (11px/600): `Hold to end`, then `Keep holding`.
- **Sweep:** while held, a fill runs left to right over `hold-commit` (850ms, linear): `ink` over a danger button, `muted` over a primary. At the end the act commits once. Under reduced motion the sweep is a still half-fill and the caption carries the hold.
- **Phases:** `idle` · `holding` · `armed` (keyboard) · `pending` (sent: a full sweep, `aria-busy`, the caption says what it waits on, `Checking every litter`).
- **Cancel:** release before the end, sliding off the button, `pointercancel`, blur, or Escape. Nothing is recorded, and the caption says so (`Released · not saved`). A quick tap is answered too (`Keep holding to save`).
- **Keyboard and switch:** a two-step. The first press arms the button (a `focus` ring and `Press again to end`), and a second press within `hold-arm` (5s) commits. Blur, Escape or the timeout disarms it.
- **Rules:** `SentriUI.holdStep(state, event)` is the pure reducer; `SentriUI.holdBind(root, { onPhase, onCommit })` wires every hold under `root`. `commit` is true exactly once per hold or second press.

**Event contract**
- Every factory button is `<button data-ds="Button" data-register data-action data-value>`. Delegate with `closest('[data-action]')`, and check `aria-disabled` first: a waiting button's tap is answered, never acted on.
- A hold button's tap does nothing by itself; `holdBind` calls `onCommit(el)`. Set `phase` back to `idle` on failure, or replace the button with the receipt on success.

**Don'ts**
- Don't put a tool or a text action in the bar, or a second primary.
- Don't grey a button with `disabled` when it waits: the waiting face keeps focus.
- Don't use hold for anything that Edit can undo.
- Don't put an icon inside a text button (the dock's `Scan ear tag` is the one sanctioned pairing).

**Strings**
`button` takes `strs: { label }` and `args`. `buttonReason` takes `strs: { text }`. `holdButton` takes `strs: { label, caption }`; the host swaps the caption id per phase (`pp.end.hold.caption` → `pp.end.hold.keep`, `ds.c2.hold.again`, `pp.end.hold.pending`). Without `strs` the output is unchanged.
