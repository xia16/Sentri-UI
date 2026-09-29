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

**Status: candidate.** These add the two missing registers, the waiting face and hold-to-commit. They were revised after the design panel and are not approved.

**The four registers** (RULINGS, three button registers, 2026-09-01, plus the text action)
- **Exit** is `secondary` (and Back): outlined. `Close`, `Back`.
- **Commit** is `primary`: the one ink fill. `Finish farrowing`, `Save`, `Lock born 14`.
- **Tool** is `register: 'tool'` (`.button.tool`): a mid-sheet act on the thing in front of you.
  - A `well` fill with no border (the border takes the fill), an `ink` 14px/500 label, and `control-height`.
  - Tools come in pairs on a two-column grid (`Record dead · Set count`) and never sit in the bar: **the bar holds exits only, plus the one commit.**
  - Pressed, it darkens with the standard `brightness(.96)` and moves down 1px. `choice-press` on `well` is 1.05:1 and would not show.
- **Text** is `register: 'text'` (`.st-text-action`): the quietest register.
  - A bare word at `row-title` (13px) in **`type-weight-strong` (700)** and **`ink-2`** (the rulings' ink2, 8.3:1 on `paper`).
  - No container, and a hit area of at least `touch-min` in both directions.
  - Pressed, it turns `ink` over a transient `press` fill.
  - It sits right-aligned on the row it acts on, and is present only while it applies (`Clear` on a draft, a floor pointer such as `Wrong count? Edit`).

**Waiting** (`waiting: true`, in every register, the text register included)
- A button that waits on a step stays **present and quiet**: `aria-disabled="true"`, never `disabled`. It keeps its place and its focus, and the tap still reaches the host.
- It takes `disabled-fill` with a `disabled-ink` label and border, and no press or hover. A waiting text action is `disabled-ink` with no fill. The bundle's register rules skip `aria-disabled`, so no page needs its own override.
- The reason sits in one persistent `buttonReason` line **beside the bar**, at `row-title` (13px) `muted`, `role="status"`: `SentriUI.buttonReason({ id, text })`. Point the button at it with `describedby`.
- **A tap is answered:** the host's delegated click calls `SentriUI.guard(el)` first. When the control is `aria-disabled`, guard returns true, and every status line the control is described by:
  - flashes (`data-answer`: an `amber-wash` highlight that fades over 1.1s, with no fade under reduced motion);
  - re-announces (it is cleared, then set again after 60ms).
- Prefer omission when the worker cannot make the button live from this sheet. Use waiting when one visible step makes it live (`Choose a cause for 2 crushed to save`).
- **Busy** (`busy: true`): sent, until the host settles. `aria-disabled` and `aria-busy`, with the waiting face (a row's one-tap after its first tap).

**Hold**: `SentriUI.holdButton({ label, caption, tone, phase, waiting, describedby, statusId })`
- Use it for the suite's irreversible acts only: `Lock born N`, saving the sow's death, `End task`.
- **Face:** the verb, with a caption under it at `description` (11px) in **`type-weight-strong` (700) at `hold-caption-opacity` (85%)**: `Hold to end`, then `Keep holding`.
- **Sweep:** while held, a fill runs left to right over **`hold-commit` (850ms)**, linear, at **`hold-sweep-opacity` (35%)**: `ink` over a danger button, `paper` over a primary. At the end the act commits once.
  - Reduced motion shows a still half-fill (the one value, 50%, also used by the still preview); the caption and the status line carry the hold.
- **Progress line:** `statusId` names a status line **outside the thumb's footprint** (above the bar, usually the bar's `buttonReason`) that echoes each cue: `Keep holding` · `Released · not saved` · `Press again to end` · `Checking every litter`.
- **Vibration**, where the platform has it:
  - 40ms on commit.
  - `[15, 60, 15]` on a release that did not commit.
- **Phases:**
  - `idle`.
  - `holding`.
  - `armed` (keyboard): a `focus` ring, `Press again to end`.
  - `pending` (sent): the full sweep, `aria-busy`, and the **register's own fill with no disabled rim**.
  - `done` (the host usually replaces the button with the receipt).
  - **`unknown`**: the answer never came. It is terminal: the waiting face with the caption `No answer · it may have ended; check before trying again`. **An irreversible act is never re-offered from the same button.**
- **Pointer:**
  - Only the pointer that started the hold counts (`pointerId`).
  - Moving more than **20px** outside the button, `pointercancel`, blur, or Escape cancels. Releasing before the end cancels too, with the caption reset and the progress line saying `Released · not saved`.
  - A quick tap (under 300ms) is answered `Keep holding to save`.
- **Keyboard and switch — a two-step:**
  - The first press arms. A second press **at least 400ms later** and within **`hold-arm` (5s)** commits.
  - A key held down (`keydown.repeat`) is ignored.
  - A press sooner than 400ms is answered (`early`) and does not re-arm.
  - Blur, Escape or the timeout disarms.
  - Escape stops propagating, so it does not also close the sheet.
- **Every return to idle restores the idle caption.**
- **Waiting hold** (`waiting: true`, `describedby`): `aria-disabled`. A press is answered through `guard` and `onRefused`, and is never held.

**Component contract**
- **`button` props:** `{ label, register, action, value, waiting, busy, describedby, labelledby, id, attrs, className, strs, args }`. An unknown `register` warns in development and falls back to `secondary`.
- **`buttonReason` props:** `{ id, text, actions, className, strs, args }`.
- **`guard(el, { answer = true, flash = 1200 })`:** returns a boolean. Call it at the top of every delegated click.
- **`holdButton` props:** `{ label, caption, action, value, tone: 'danger' | 'primary', phase, waiting, describedby, statusId, id, className, strs, args }`. The caption is `<id>-caption`.
- **`holdStep(state, event, { minArm })`:** returns `{ phase, armedAt, commit, cue }`. It is pure; the tests cover it.
- **`holdBind(root, { ms, armMs, minArm, slop, cues, t, vibrate, onPhase, onCommit, onRefused })`:** returns `{ settle(el, 'done' | 'failed' | 'unknown'), destroy() }`.
  - It owns `data-phase`, `aria-disabled` and `aria-busy`, and restores the idle caption.
  - `ms` and `armMs` default to the `--hold-commit` and `--hold-arm` tokens read from the stylesheet. `SentriUI.HOLD` carries the same defaults, which the tests check against `tokens.json`.
- **Events:**
  - Every factory button is `<button data-ds="Button" data-register data-action data-value>`. Delegate with `closest('[data-action]')` and `guard()` first.
  - A hold emits `onCommit(el)` exactly once. The host sends the act, then calls `settle(el, outcome)`:
    - `failed` returns to idle with its reason in the progress line.
    - `done` shows the receipt.
    - `unknown` is terminal.
- **Focus:** a hold keeps focus through every phase. After `done` the host moves focus to the receipt's heading.

**Don'ts**
- Don't put a tool or a text action in the bar, or a second primary.
- Don't grey a waiting button with `disabled`: the waiting face keeps focus.
- Don't use hold for anything that Edit can undo.
- Don't re-offer a hold whose outcome is unknown.
- Don't put an icon inside a text button (the dock's `Scan ear tag` is the one sanctioned pairing).

**Strings**
- `button` takes `strs: { label }` and `args`; `buttonReason` takes `strs: { text }`; `holdButton` takes `strs: { label, caption }`.
- `holdBind` takes `cues` as string ids and a translator `t`, for example `{ keep: 'pp.end.hold.keep', tap: 'ds.dead.hold.keep', released: 'ds.dead.hold.cancel', again: 'ds.c2.hold.again', pending: 'pp.end.hold.pending', unknown: 'ds.c2.hold.unknown' }`.
- Without `strs` the output is unchanged.
