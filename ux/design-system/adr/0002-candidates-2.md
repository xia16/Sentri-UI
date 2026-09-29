# ADR 0002: Design-system candidates 2 (Status, Banner, Photos, and variants of Button, ChoiceList, Row, Log, Numpad)

- **Status:** candidate, on `ds/candidates-2`.
  - The design panel (worker, steward, interaction, developer) **accepted every card with changes**, and those changes are applied (see *What the panel changed*).
  - Pages adopt the cards in a later step (see *Adoption*). No task page changes here.
- **Map:** [Piglet processing design map, issue #3](https://github.com/xia16/Sentri-UI/issues/3).
- **Demo:** every state, en and zh, on the strict page `components/candidates-2-demo.html` (lint page `ds-candidates-2`).
- **Tests:** `tests/candidates-2.test.mjs` covers:
  - the hold's rules: the repeat guard, the 400ms arm floor, settle and `unknown`, and the token parity;
  - `radioNext`;
  - the `rowSelect` payload and the `rowAction` naming;
  - the one-live-region rule;
  - Row's back-compatibility.

## Context

The piglet-processing slices drew what the cards lacked as `Candidate:*` compositions: 15 names across 9 pages, `shell-ui.js` and `shell.css`.
- Several are one need drawn twice.
- Some fight the bundle. Every page with a waiting Save needed a triple-class override, because the bundle's primary rule outranks page rules.
- The slices drew three incompatible radios and two holds.

## Decision: three new cards, variants on five existing ones

The test for a new card is a second consumer and a shape no existing card can take. Everything else becomes a variant, or stays with the task.

| Slice candidate(s) | Became | Why |
|---|---|---|
| Radio (dead, litter, move, id) | ChoiceList `radio` mode, `choiceRadios` (rows, inline), `radioBind` | It is ChoiceList's row with a different trailing mark. The inline pair is the record-sheet law's missing **Choice** field. |
| Tool, TextAction | Button registers `tool` and `text` | These are RULINGS' four registers. |
| Button waiting face | Button `waiting` / `busy`, `buttonReason`, `guard`, and a bundle fix | The register rules now skip `aria-disabled`, so the waiting face wins with no page override. |
| HoldButton, the dead drawer's hold | Button `holdButton`, `holdStep`, `holdBind` | One hold for Lock, the sow's death and End. |
| StatusWord, Receipt, coloured tones, row partial colour | **Status** (new): `status`, `statusLine`, `statusText`, `announce`, `liveFill` | One grammar ("colour lives on the value") in two placements. |
| DangerBand, the sow's warning, EditBanner | **Banner** (new), tones `danger` and `correction` | One anatomy: a headline over its consequence, on a wash. |
| Photos | **Photos** (new) | The tenth field type of the record-sheet law. |
| LitterRow, TreatmentRow, EvidenceRow | Row: `row`, `rowSelect`, `rowAction` over one shared copy | These are Row's anatomy with the row law filled in, split by root element. |
| CompactRun | Numpad `compact` | The run minus its list; the keys still never move. |
| Log gap | Log group `description` | It uses the Heading's existing description slot. |
| Mono labels in ChoiceList | `mono` on a choice row or option (Latin and digit codes only) | |

### What stays a task-level pattern, and why

- **LeadFigure** (room): one consumer. It is `figure-lg` plus a muted label.
- **DriftStrip** (room): one consumer, and it is a door. On adoption it becomes a `row` with toned tokens, not a new surface.
- **ScanFrame** (room): camera chrome, which belongs to the native scanner.
- **WellTray** (Edit's post-lock `At finish` disclosure): its one consumer is farrowing's Edit. It is deferred until a second one appears.
- **DeadDrawer**: a composition of cards, not a card.

## What the panel changed

**The rulings win where tokens can express them** (the new tokens are listed under *Candidate tokens*)
1. **700 is drawn** as `type-weight-strong` on the selected radio label, the text action, the HOLD caption and the danger headline.
2. **The text action is `ink-2`** (the rulings' ink2, 8.3:1 on `paper`). Pressed, it turns `ink` over a transient `press` fill.
3. **The camera ring is 1.5px** (`ring-width-fine`); the radio keeps 2px (`ring-width`). The rulings' ink3 maps to `muted` in both.
4. **The Photos card has no outline.** This is accepted as the **owner's craft-pass ruling** (2026-09-01), which is later than the same day's "bordered radius-12 box". The corner × is retired in favour of Delete in the viewer.
5. **The hold draws the ruled opacities:** the sweep at `hold-sweep-opacity` (35%) and the caption at `hold-caption-opacity` (85%). The keyboard **two-step** stays and is logged for the owner (below).
6. **The radio ring sits on the right** (accepted).
7. **The correction banner reads as amber in sunlight.** The border is `amber` (5.6:1) and the wash is `amber-wash-strong`. The headline stays `ink`.

**Hold (blocking, all done)**
- `keydown.repeat` is ignored, and a second press must come ≥ 400ms after arming.
- `holdBind` returns `settle(el, 'done' | 'failed' | 'unknown')` and owns `aria-disabled` and `aria-busy`.
  - **`unknown` is terminal:** the act is never re-offered.
  - Every idle transition restores the idle caption.
- **Pointer:** a 20px slop before "leave", and only the owning `pointerId` counts. Escape stops propagating.
- **Progress** is echoed in a status line outside the thumb's footprint (`statusId`).
- **Vibration:** 40ms on commit, `[15, 60, 15]` on release.
- A waiting hold answers its press.
- The pending face keeps its register with no disabled rim.
- **Reduced motion** uses one still-fill value (50%).
- `hold-commit` and `hold-arm` are read from the tokens; `SentriUI.HOLD` is tested against `tokens.json`.

**Waiting face**
- A tap is answered through `guard()`: the reason line flashes, and it re-announces by being cleared and then set.
- The reason line is at `row-title`, beside the bar.
- The text register has a waiting face too.

**Radio**
- Rows are 60px (`radio-row-min`).
- An optional field clears through a visible `Clear` (no re-tap clear). An inline optional field reserves the slot.
- `radioBind` gives the keyboard model and `radioNext` is its tested rule.
- `mono` is limited to Latin and digit codes, with a warning in development.

**Row**
- The roots are split: `row`, `rowSelect` (a change-only `{ value, checked }` payload through `rowSelectChange`) and `rowAction` (sibling targets; the act is named with the row title; `busy` gives its pending face).
- There is one `trail` enum, and `trailing` takes a typed word.
- Development warnings cover code with icon and chip with trailing.
- The `·` is a real text node (`ds.sep`).
- `chip-max` is renamed `row-chip-max`, and the code is set in `identifier-strong`.

**Status and Banner live regions**
- They mount empty and are filled after (`liveFill`, `announce`), with `aria-atomic`.
- There is one live region per banner.
- The toned value part is set at 600.

**Banner Clear**
- `Cleared · Undo` stays for 5 seconds.
- `Clear` sits `space-row-y` from the summary text.
- Focus-return targets are documented, as they are for the radio's Clear and the Photos viewer's Delete.

**Photos**
- **The viewer contract:** Delete only while drafting, never from History, 24px from Back, with `Photo deleted · Undo`.
- **Error states:** camera denied and too large are answered in amber; a cancelled capture says nothing.
- **Pending:** each thumbnail can carry a pending flag (an amber dot and a spoken label).
- **Platform note:** capture first (`uni.chooseMedia`, the RN camera module, `capture` on the web).
- **Disabled camera:** `data-reason` in the payload says why it is gray.
- **Layout:** the answer line sits under the header row, 20px below the field before it, with the tile counts at 390 and 360 documented.

**Every card README** gains a **Component contract** section: props, emitted events with their payloads, slots and ids. There are stable `id` props, and unknown enum values warn in development.

## Deviations still for the owner's nod

These are to be recorded in the map's provisional ledger.
1. **The keyboard path of a hold is a two-step** (press, then press again within 5s and no sooner than 400ms), not a held key. A held Enter auto-repeats, and a switch user cannot hold.
2. **One sweep for both holds, over one fill per register.** It is `ink` at 35% over danger (the dead drawer's) and `paper` at 35% over primary (Lock). End's full-ink sweep is retired.
3. **The Row code is `identifier-strong` (600).** The `identifier` style is 500; the slices chose 600 for the lead key of a list.
4. **The inline radio's optional Clear slot is reserved.** An optional inline Choice row is 64px (a label line plus a 44px Clear slot), not the ruled 60px, so the row never changes shape when a value is chosen.

## Candidate tokens

These are in `tokens.json` with usage "Candidate … not approved", and generated into `tokens.css`. `scripts/tokens-css.py` now emits the new `weight`, `opacity` and `motion` groups.
- **colour:** `ink-2` #465143, `amber-wash-strong` #f6e7bf.
- **type:** `identifier-strong` (12px/600, mono).
- **size:** `radio-size` 20px, `radio-dot` 10px, `ring-width` 2px, `ring-width-fine` 1.5px, `radio-row-min` 60px, `photo-tile` 56px, `row-code-min` 40px, `row-chip-max` 96px.
- **weight (new group):** `type-weight-strong` 700.
- **opacity (new group):** `hold-sweep-opacity` 0.35, `hold-caption-opacity` 0.85.
- **motion (new group):** `hold-commit` 850ms, `hold-arm` 5000ms.

## Adoption

The later step swaps each composition for the card call and deletes the page CSS listed.

| Page | `Candidate:*` today | Becomes | Page CSS to delete |
|---|---|---|---|
| `shell-ui.js`, `shell.css` | LitterRow (`U.litterRow`) | `row({ code, title: tokens, description: tokens, mono: true, chip, wrap: true })`; select mode → `rowSelect(…)` | `.pp-litter*`, `.pp-tok`, `.pp-chip`, `.pp-code` |
| `shell-ui.js`, `shell.css` | Receipt (`U.receipt`) | `statusLine(tokens, { live: true, sep: 'dot' })` + `liveFill` / `announce` | `.pp-receipt`, `.pp-tone` |
| `shell-ui.js`, `shell.css` | Tool (`U.tools`) | `button({ register: 'tool' })` ×2 in a two-column grid | `.pp-tool` (keep `.pp-tools` as layout) |
| room | LitterRow | as the shell | — |
| room | LeadFigure, DriftStrip, ScanFrame | stay task-level; DriftStrip → a `row` with toned tokens | `.pp-strip*` once it is a row |
| end | LitterRow | as the shell | — |
| end | HoldButton | `holdButton({ phase, statusId })` + `holdBind({ cues })`; on no answer, `settle(el, 'unknown')` | `.pp-hold*`, the page's pointer and key handlers |
| bulk | LitterRow (select), Receipt | `rowSelect` + `rowSelectChange` on `change`; `statusLine` | — |
| count | Receipt; the primary's waiting override | `statusLine`; `button({ register: 'primary', waiting: true, describedby })` + `buttonReason` + `guard` | the triple-class `aria-disabled` rule |
| dead | Radio | `choiceRadios({ layout: 'rows', … })` | `.dd-radio*` |
| dead | Photos | `photos({ active, items, count, error })` | `.dd-photos*`, `.dd-camera*` |
| dead | TextAction | `button({ register: 'text' })` | `.dd-text-action` |
| dead | DeadDrawer: the sow warning, the hold, the gray Save | `banner({ tone: 'danger', live: true })`, `holdButton`, `button({ waiting: true })` | `.dd-warn*`, `.dd-hold*`, the triple-class rule |
| dead | DeadDrawer: `unsaved` words, mono identity labels | `status({ tone: 'green' })`; `choiceRow({ mono: true })` | `.dd-unsaved`, `.dd-mono` |
| edge | DangerBand | `banner({ tone: 'danger' })` | `.edge-band` |
| id | Radio (sex) | `choiceRadios({ layout: 'inline', optional })` + `radioBind` | `.id-radio*` |
| id | CompactRun | `numpad({ compact: true, … })` | `.id-compact` |
| id | Tool | `button({ register: 'tool' })` | — |
| litter | TreatmentRow | `rowAction({ act: { label, action: 'record', busy } })` | `.lt-tx`, `.lt-door` |
| litter | EvidenceRow | `row({ wrap: true, trail: 'edit' })` | `.lt-rec` |
| litter | Radio; the primary's waiting override | `choiceRadios`; `button({ waiting: true })` | `.lt-radio`, the `aria-disabled` rule |
| move | Radio | `choiceRadios({ layout: 'rows' })`: the ring moves to the right | `.mv-radio*` |
| Edit (S8, future) | the correction banner | `banner({ tone: 'correction', summary, actions: [Clear] })`, then `Cleared · Undo` | — |

## Consequences

- The bundle change is live for every page: a primary, danger or end-early button with `aria-disabled="true"` takes the waiting face. The page overrides draw the same face and become dead code on adoption.
- The text-action register is now 700 in `ink-2` wherever `.st-text-action` is used. That includes the Stepper's floor pointers and the Numpad's status-line actions (ADR 0001 cards).
- `camera` and `edit` are already in the icon registry, so there are no new glyphs.
