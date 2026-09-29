# ADR 0001: Field cards (Stepper, Measure, Numpad)

- **Status:** candidate. On 2026-09-29 the design panel accepted the cards with changes, and a refute pass by the other model family found six majors, all accepted. Both sets of changes are applied on `ds/field-cards`.
- **Not every ruling is honoured as written.** The cards keep **two deviations** from owner rulings, and each waits on the owner's nod (see *Deviations for the owner's nod*).
- **Map:** [Piglet processing design map, issue #3](https://github.com/xia16/Sentri-UI/issues/3).
- **Cards:** [Stepper](../components/Stepper/README.md) · [Measure](../components/Measure/README.md) · [Numpad](../components/Numpad/README.md). You can see every state on the strict demo page `components/field-cards-demo.html` (lint page `ds-field-cards`).

## Context

The design-system README's record-sheet law names ten field types, but only Picker and Multi-picker had a card. Five piglet-processing slices count animals (Stepper). The identity / weigh slice types ear tags and weights (Numpad) and records measured values with a unit (Measure). Left alone, each slice designer would have drawn their own stepper. So the cards were extracted first, as one step with one panel.

## Decision: extract, don't invent

The owner has already ruled on the anatomy in farrowing. These cards encode those rulings rather than propose new ones. There are two exceptions, the deviations listed below.

- **Stepper.**
  - RULINGS "One stepper shape: `− n +` everywhere".
  - The craft pass: 60px rows; the − always present and floor-gray when it has nothing to undo; the value always printed, with a quiet gray 0; 14px SVG glyphs centred (18px on the hero).
  - "The hero numeral is plain".
  - "Type-to-set is retired on count figures".
  - DS README "+ filled `ink`".
- **Numpad.**
  - "one type-to-set pad grammar product-wide … survives only where typing is real input (ear tags, weights)".
  - Interaction-map §8 G4, ratified.
  - The archived tag / weigh pad (`ux/archive/task-screens-combined.html` 04b).
- **Measure.**
  - The field kit's "Mono, large, unit always shown. Opens the numpad on tap".
  - Litter weight's "soft range warn — words, never a gate".
  - "REFUSED, never silently clamped".

Where the sources were silent, the first pass decided four things:
- There is no commit key on the pad; the bar's primary commits.
- The decimal key appears only for decimal fields. Its slot stays empty on integer fields, so keys never move between fields.
- The decimal key reads `.`, not `·`.
- There is one pad in two uses: keys only under a Measure, or a run with a readout and a running list.

## What the panel changed

The panel (worker, steward, interaction and developer critics) accepted all three cards with changes.

**Numpad**
- A duplicate tag **warns and never blocks** (owner ruling; SYNTHESIS §7.1). The `error` tone is gone.
- The suggestion can be recorded as it is: one tap per piglet on the happy path.
  - ⌫ on a suggestion turns it into typed ink.
  - ⌫ back to empty restores the suggestion.
  - An empty readout is legal, because notch-only farms exist.
- A short tag warns. Dead taps are answered in the hint.
- Keys never move: the hint line and three lines of the running list are reserved.
- The label and the running list are 14px.
- The readout is a live status.
- String rules live in `numpadInput`: the value is always a string, `.` first gives `0.`, weights strip a leading zero, tags keep theirs, and there is an `intLength` cap.
- `numpadCommit` normalises the value on commit. `numpadKey` maps a hardware keyboard or wedge scanner through the same path, and Enter never commits.

**Measure**
- The pad docks above the bar. The pad rule is written once, in both cards.
- The range is checked on commit or pad close, never per keystroke, and the hint gives it in words at 14px.
- Tone precedence is explicit: `changed` stands beside `warn` or `refused`.
- A refused value keeps the bar's primary withheld, with the reason given.
- The accessible name is label + value + unit, and the box has `aria-controls` pointing to the pad. `unitGap` handles `40.6°`.
- The label is 14px/600.

**Stepper**
- The hint line is reserved.
- Floor pointers are text actions of at least 44px. Ceiling copy is required from the host.
- Each key's hit area spans the full 60px row.
- The value is a spinbutton. Each key is named with its subject.
- `user-select` is off. There is deliberately no auto-repeat. There is a `step` option, and a 4ch cell when `max ≥ 1000`.

**All three**
- Each README has an event contract.
- Candidate tokens: `stepper-row-min`, `hero-key`, `glyph-key`, `glyph-key-hero`, `glyph-pad`, `caret-width`, `status-dot`, `space-key-gap`. The pad keys use `choice-row-min`.
- The floor-gray is promoted into the design-system README's States section.
- The icons section has an addendum. `backspace` is added to `assets/Icons`.

**Declined**
- Retiring `count-key` / `count-surface` waits on the owner's ruling on the colour of +.
- A shared field box with PickerField would change an existing card; it is logged as design-system cleanup.
- Stronger pressed and disabled contrast for glare is a suite-wide token decision the rulings already log for the owner.

## What the refute pass changed

The refute pass came from the other model family. All six of its majors were accepted.
1. **Stepper commit contract.** A key emits a *requested delta* and never commits. The README separates the two kinds of host:
   - **Immediate hosts** are recording surfaces: each tap posts a stamped event.
   - **Staged hosts** are the dead drawer and Edit: taps change a draft, Save posts it, Clear discards it, and Back keeps the draft on the device.
2. **A scan is atomic.** A scan replaces whatever is typed or suggested; it is never appended.
   - `numpadScan` validates the digits and the length.
   - `numpadScanner` recognises a wedge burst: at least 4 digits, each ≤ 35ms apart, ending in Enter. Ordinary keystrokes keep appending.
   - The reducer and burst tests live in `tests/field-cards.test.mjs`.
3. **Cleared is not an untouched suggestion.** The last ⌫ reaches a stable empty (missing). Returning to the suggestion is a named transition, the `Use 000258` text action.
4. **The duplicate check runs on every accepted value, suggestions included.** Record stays available.
   - The warning survives the advance as an amber mark on the running-list line (`000254 · 1.42 kg · also on B04`).
   - A duplicate found after offline sync gets the same mark, and nothing is merged or blocked.
5. **Announcements.** Each card has one persistent `role="status"` region, and the controls reference it with `aria-describedby`. A Measure's value is live while its pad is open, and the Numpad's readout value is live. Labels are never re-announced.
6. **The keys are truly stationary.** The Numpad's feedback region (status line and running list) is bounded: its heights are fixed and it scrolls inside itself, sized for the longest status in en and zh.
   - The demo shows the change before and after a warning.
   - In all 15 run states, en and zh, the keys sit 218px from the top of the pad.

## Deviations for the owner's nod

These are to be recorded in the map's provisional ledger.
1. **Stepper row label is 14px, not the ruled 15px.** The craft pass says "Row labels 15px/600", but 15px is not on the type scale. The label uses `choice-label` (14px/600), the size of every field and choice.
2. **The hero + is `ink`, not farrowing's green (`count-key`).** Signed-off farrowing fills the hero + with `count-key`. The DS README says "+ filled `ink`" and "green is never a button fill; green means done". The cards follow the README everywhere, so both + keys share one treatment. `count-key` and `count-surface` stay in the tokens until the owner rules.

## Consequences and known gaps

- Slices build counting rows, measured values and tag / weigh runs from these cards, and stop composing placeholders from farrowing's `row-stepper`.
- The Button card is not token-clean yet: base `.button` has `padding: 10px 17px` and `gap: 7px`. The lint config's `allow` list accepts these as component-owned drift, so the demo's bars use the card as-is, with nothing ignored. The card still needs a design-system cleanup.
- `backspace` is not yet in `ux/system/sentri-icons.js` or the artifact's asset blobs (`design-system.json`). They are left untouched on purpose.
- `tokens.json` still carries `version: 1`. The doctor's version gap predates this ADR.
