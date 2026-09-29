# ADR 0002: Design-system candidates 2 (Status, Banner, Photos, and variants of Button, ChoiceList, Row, Log, Numpad)

- **Status:** candidate, on `ds/candidates-2`. Not yet through the design panel. Pages adopt the cards in a later step; no task page changes here.
- **Map:** [Piglet processing design map, issue #3](https://github.com/xia16/Sentri-UI/issues/3).
- **Demo:** every state, en and zh, on the strict page `components/candidates-2-demo.html` (lint page `ds-candidates-2`).
- **Tests:** `tests/candidates-2.test.mjs` (the hold's rules, Row back-compatibility, radio tab stops, the waiting and floor-gray faces).

## Context

The piglet-processing slices drew what the cards lacked as `Candidate:*` compositions: 15 names across 9 pages, `shell-ui.js` and `shell.css`. Several are one need drawn twice, and some fight the bundle: every page with a waiting Save needed a triple-class override, because the bundle's primary rule outranks page rules. The slices also drew three incompatible radios (ring left in Move, ring right in the dead drawer and the litter sheet, an inline pair in identity) and two holds (a 35% ink sweep with a two-step keyboard in the dead drawer, a full ink sweep with a held key in End).

## Decision: three new cards, variants on five existing ones

The test for a new card is a second consumer and a shape no existing card can take. Everything else becomes a variant, or stays with the task.

| Slice candidate(s) | Became | Why |
|---|---|---|
| Radio (dead, litter, move, id) | ChoiceList `radio` mode, `choiceRadios` (rows, inline) | It is ChoiceList's row with a different trailing mark. The inline pair is the record-sheet law's missing **Choice** field. |
| Tool, TextAction | Button registers `tool` and `text` | These are RULINGS' four registers. The text register is the existing `.st-text-action`, now a named register. |
| Button waiting face | Button `waiting` + `buttonReason`, and a bundle fix | The register rules now skip `aria-disabled`, so the waiting face wins with no page override. |
| HoldButton, the dead drawer's hold | Button `holdButton`, `holdStep`, `holdBind` | One hold for Lock, the sow's death and End. |
| StatusWord, Receipt, coloured tones, row partial colour | **Status** (new): `status` (word) and `statusLine` (line) | This is one grammar, "colour lives on the value", in two placements. Its parts and tokens are reused by Row, Banner and Photos. |
| DangerBand, the sow's warning, EditBanner | **Banner** (new), tones `danger` and `correction` | They share one anatomy (headline over consequence, on a wash). The correction tone adds the live summary and Clear. |
| Photos | **Photos** (new) | This is the tenth field type of the record-sheet law, with its own anatomy and states. |
| LitterRow, TreatmentRow, EvidenceRow | Row options `code`, token `title`/`description`, `mono`, `chip`, `wrap`, `rail`, `select`, `act` | They are Row's geometry with the row law filled in. With no new options, Row's output is byte-identical (tested). |
| CompactRun | Numpad `compact` | It is the run minus its list. The keys still never move. |
| Log gap | Log group `description` | This uses the Heading's existing description slot. |
| Mono labels in ChoiceList | `mono` on a choice row or option | |

### What stays a task-level pattern, and why

- **LeadFigure** (room): one consumer. It is `figure-lg` plus a muted label, and needs no card until a second list leads with a number.
- **DriftStrip** (room): one consumer, and it is a door. When adopted it should be a Row (token title with toned values, `mono` codes) on the page, not a new surface. The `well` strip it draws is the tool register's fill on a non-tool, which the panel should look at.
- **ScanFrame** (room): camera chrome. It belongs to the native scanner, and the icon convention already names the scan frame glyph.
- **WellTray** (Edit's post-lock `At finish` disclosure): no piglet-processing consumer. Its one consumer is farrowing's Edit. Deferred until a second consumer. (The Born-ceremony tray, by contrast, is retired by ruling.)
- **DeadDrawer**: a composition of cards, not a card.

## Deviations for the owner's nod

These are to be recorded in the map's provisional ledger.

1. **Weights of 700 become 600.** The rulings give 700 for the selected radio label, the text action (13/700) and the HOLD caption (11/700), and 14/700 for the warning headline. The type scale stops at 600 (README: "400, 500 and 600"), so all four use 600, as ADR 0001 did for the text action.
2. **The text action is `ink`, not "ink2".** ADR 0001 already drew it in `ink`. `muted` is for secondary text, and a muted word reads as a caption, not an act. The dead drawer's muted version changes on adoption.
3. **One ring weight.** The camera circle takes the radio's 2px ring (`ring-width`), not the ruled 1.5px. There is one weight for the round controls, and 1.5px renders unevenly across densities. Its colour is `muted` (the rulings' "ink3").
4. **The Photos card has no outline.** The owner's 09-01 Photos ruling says "a bordered radius-12 box". The later craft pass the same day says "a well card (no outline — the emptiest element must not have the strongest border)". The card follows the craft pass, which both slices already drew. The corner × on thumbnails is gone too: the Photos ruling retires it in favour of `Delete` in the viewer, although an older sentence keeps it "while drafting".
5. **One hold.** The sweep is full `ink` over danger (End's), not the dead drawer's 35% ink. Opacity is not a token, and a full sweep reads as done. Over a primary (Lock) it is `muted`. The keyboard path is the dead drawer's **two-step** (arm, then press again within 5s), not End's held key: a held Enter repeats, and a switch user cannot hold. The caption stays 11px without the ruled 85% opacity.
6. **The radio ring is on the right** (ChoiceList's trailing slot), as in the dead drawer and the litter sheet. Move drew it on the left and changes on adoption.
7. **The correction banner's headline is `ink` on the amber wash**, and its border is `pending-border`, because `amber` is "never decorative" and colour lives on the value. The corrected figures in its summary are amber.

## Candidate tokens

These are in `tokens.json` with usage "Candidate … not approved", and generated into `tokens.css`:
- size: `radio-size` 20px, `radio-dot` 10px, `ring-width` 2px, `photo-tile` 56px, `row-code-min` 40px, `chip-max` 96px.
- **motion (a new group):** `hold-commit` 850ms, `hold-arm` 5000ms. `scripts/tokens-css.py` now emits the `motion` group; this is its one change.

Gaps the panel should see:
- **The row code weight is 600, and `identifier` says 500.** The slices chose 600 for the lead key of a list.
- **`pending-border` extends from sync blocks to the correction banner.** Its usage line should grow if this is approved.
- **Contrast of the tool's pressed face.** `choice-press` against `well` is about 1.05:1, so the tool presses with the standard Button darken (`brightness(.96)`) instead. The token decision on glare-grade pressed states is already logged for the owner.

## Consequences

- The bundle change is live for every page: a primary, danger or end-early button with `aria-disabled="true"` now takes the waiting face. Pages that overrode it (count, litter, dead) keep drawing the same face, so their overrides become dead code when they adopt.
- Adoption is a later step. It swaps each `Candidate:*` for the card call and deletes the page CSS: `dd-radio`, `mv-radio`, `id-radio`, `lt-radio`, `pp-tool`, `dd-text-action`, `pp-hold`, `dd-hold`, `edge-band`, `dd-warn`, `dd-photos`, `pp-receipt`, `pp-litter`, `lt-tx`, `lt-rec`, and the triple-class waiting overrides.
- `camera` is already in the icon registry. There are no new glyphs; the ✎ rail uses `edit`.
