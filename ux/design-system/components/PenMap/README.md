# PenMap

A pen map shows a room as a map of pens, each pen a tile that goes to that pen and is coloured by its status, so a worker finds the pen in front of her by where it is and sees at once which ones need her. It is Farrowing's Pen map. It sits in a menu drawer ([Sheet](../Sheet/README.md), `surface: 'menu'`) and does not record a farm fact.

`SentriUI.penMap({ lanes, depth, pens, current, action, key, rangeSize, entrance, labels, peek })` draws the body: the Entrance band and the map. `SentriUI.penMapKey({ pens, words })` gives the items of the sheet's key line (the legend; see below). `SentriUI.penMapFooter({ back, depth, rangeSize, label })` draws the footer. `SentriUI.penPeek({ title, meta, rows })` draws the hold-to-peek card's content. Types are in `index.d.ts`.

Classification: **component** (a new job; no existing component draws a map of places). One variant today, the map.

## When to use / when not

**Use it when**
- the worker goes to one of many places that have a layout (the pens of a room), and where it is matters;
- each place has a status she should see before she taps (needs her, in progress, has sows, empty).

**Do not use it when**
- the places have no layout, or a name is all she knows: use [ChoiceList](../ChoiceList/README.md) or [Row](../Row/README.md) · navigation (Choose a unit);
- the places are a few fixed choices of one list: use [Segment](../Segment/README.md);
- the status needs more than a colour and a pen code: put it in the peek or on the page the tile opens.

## Anatomy

1. **Colour key** (optional, the sheet's header line, not part of the body): `sheet({ line: { key: penMapKey({ pens, words }) } })`, the Sheet's colour-key header line (owner exception to the Headers law, 2026-10-14; see [Sheet](../Sheet/README.md)). A 12px rounded swatch, a bold ink count and a muted word per coloured level (**2** need you, **2** farrowing), 13px, centred under the title, plain text and never tappable, on one line at 360 in English and Chinese. It counts pens, follows the current tab and filter, and draws only a level that has a pen; with none the sheet has no header line.
2. **Entrance band**: a full-width band on `well`, 36px tall, a down arrow and "Entrance", 13px / 600 ink, the first thing in the body, 24px under the hairline (the header owns the gap). It says the map is drawn as seen from the door: pen 1 is nearest it, at the top.
3. **Column letters** (A, B, C…) and **row numbers** (1, 2, 3…): muted 13px mono on the sheet's tint. Letters are always the columns and numbers always the rows, so the map uses the phone's height. Letters stick to the top and numbers to the left. The number column is 22px, or 30px when a row has 100 pens or more.
4. **Tile**: a button, at least 56 × 56, 8px gaps, 12px radius, the pen code in 15px / 600 mono and nothing else. Columns are `minmax(56px, 1fr)`: when the lanes do not fit at 56px the map scrolls sideways and the tiles never shrink.
5. **Peek** (on hold): a white card with a 1px `line` border over the lower part of the map, clear of the footer.
6. **Range control** (footer, only when a row has more than 20 pens): a segmented control beside Back, one button per 20 pens (`1–20`, `21–40`…), each at least 76px wide and the control 56px tall. It scrolls sideways when the ranges overflow, with no visible scrollbar.

## Variants

- [Map](variants/map.html): the one map, in a menu drawer. Specimens: Unit 7 (4 × 6), 2 × 60, 2 × 100, 2 × 160, 8 × 20 (sideways scroll), a filtered map, an empty map, the peek, a pressed tile and the Chinese key.

## States

A pen takes one face: the loudest level among the animals the list shows in it (the colour rule below). Farrowing's animals are sows.

| State | When | Tile | Fill | Text |
|---|---|---|---|---|
| Needs you (`act`) | any shown sow is at the animal row's `act` level | amber | `amber-fill` `#fede82`, no border | `amber-fill-ink` `#5c3f00` |
| In progress (`live`; Farrowing says "farrowing") | else any shown sow is at `live` | blue | `progress-fill` `#c1ddfd`, no border | `progress-fill-ink` `#1f4470` |
| Has animals (`plain`; Farrowing says "has sows") | else the pen has shown sows | white | `paper`, 1px `line` | `ink` |
| Empty | no animals | quiet, disabled | `well`, no border | `muted`, 500 |
| Filtered out (`hidden`) | animals, all hidden by the tab or filter | the empty face, disabled | `well`, no border | `muted`, 500 |
| Pressed | finger down | white takes `press`; the fills darken | | |
| Peek | held 350ms | the card, over the lower part of the map (the upper part when the held tile would sit under it) | | |
| Long / Chinese | `lanes` and `depth` of any size; Chinese words | the key stays on one line; pen codes are never translated | | |

There is no text inside a tile but the pen code: no "No sows", no "Active". There is no current-pen marker (no ring, no fill): the map opens scrolled so the current pen is in view, centred under the letters.

Selected, Error and Loading do not apply: tapping a tile leaves the sheet.

## The colour rule (every task's pen map)

- **One pen, one colour.** A pen shows the loudest level among the animals the current list shows in it. Change the tab or filter and the colours follow.
- **A fixed ladder, loudest first:** Needs you (amber) > In progress (blue) > Has animals (white) > Empty / filtered out (quiet, disabled). Severity never adds a colour: a worse "needs you" is still amber, and the detail lives in the peek or on the page the tile opens.
- **The task supplies the levels.** It says which of its row states sit on which rung; the component never decides. A task with no "in progress" state simply never draws blue. Each task varies only through a mapping table in its `budget.md`: [Farrowing's](../../../../features/farrowing/budget.md). Inspection, breeding, heat-check and pregnancy add theirs when they adopt PenMap.
- **A tile shows only the pen code.** Counts go in the colour key (the sheet's header line), never in the tile.
- **The map follows the list.** It uses the list's current tab and filter: a pen the list hides is drawn as filtered out.
- **Severity never adds a colour.** An Inspection red marker becomes Needs you (amber); how bad it is stays in the peek or on the page.
- **Open (Inspection):** how the walk shows checked against not-yet-checked pens is still to be decided.

## Landing on the pen

Tapping a tile is one motion, with one cue. The host places its list on the pen first, under the sheet, so no scroll is seen. The sheet then slides down in `sheet-out` (180ms) with its scrim, and the pen's header takes the tapped tile's own fill (amber, blue), held for `land-hold` (900ms) and faded back by `land-fade` (700ms) later, 1.6s in all. A white tile (Has animals) has no fill to carry, so its pen card takes a 2px ink ring with the same timing. Nothing else dims or moves. With reduced motion the sheet just goes and the colour shows and fades without movement. Where motion is frozen (the atlas) the pen is reached at once and the list is the plain list.

## Behaviour

- **Tap** a tile and the host goes to that pen (`data-action` and `data-value` carry the action and the pen code), as in Landing on the pen. A disabled tile does nothing.
- **Hold** a tile 350ms to peek at its sows, read-only. Moving more than 12px, scrolling or lifting hides it; the tap that follows a peek only closes it and does not go to the pen.
- **The map scrolls** inside the sheet, sideways and down. The sheet body does not scroll; the Entrance band stays put. The scrollbar is never drawn.
- **Opens on the current pen**, centred in the space under the letters and beside the numbers.
- **The range control follows the map.** The pressed range holds the top visible row (at the very end, the last range). Its button scrolls into view when the ranges overflow sideways. A tap on a range scrolls its first row to just under the letters.
- **Mounting** is automatic: a map is found by its markup and mounted when it enters the document. A host that inserts markup some other way calls `SentriUI.penMapMount(root)`.

## Content rules

- The key word is a short phrase after the count ("need you", "farrowing"; Chinese "需处理", "分娩中"). Counts lead the word.
- Pen codes are the lane then the row (`B3`, `A120`); they are never shortened, translated or wrapped, and they are set in mono.
- A tile says its pen code only. A tile's accessible name adds the state (`Pen B3, needs you`).
- Strings are in the registry (`ds.penmap.*`).
- The peek rows are the host's animal [Row](../Row/README.md) rows: the same tag, state word and figure as its list.

## Accessibility

- Every tile is a button named by its pen and state; an empty or hidden tile is disabled. The letters and numbers are decoration (`aria-hidden`): the reading order is pen 1's row, then pen 2's.
- Tiles are at least 56 × 56 (above the 48px target floor) with 8px between.
- The range control is a single-choice group: a radio group of buttons, one checked (the range that holds the top visible row).
- State is never colour alone: the key names the two colours, and each tile's accessible name says its state. The empty face differs by surface and by being disabled.
- Contrast: `amber-fill-ink` on `amber-fill` is 7.4:1 and `progress-fill-ink` on `progress-fill` is 7.1:1; `muted` on `well` is 4.5:1.
- Hold to peek is a shortcut: everything in the peek is in the room list one tap away.

## Do / Don't

- Do put the pen code and nothing else in a tile; put the facts in the peek.
- Do let a long row scroll; don't shrink a tile under 56px.
- Do colour by the animal row's levels (`sowFacts().level`); don't invent a second mapping.
- Don't mark the current pen with a ring or a fill.
- Don't put the status in words in the tile ("Active", "No sows").

## Native

| Sentri | iOS | Android |
|---|---|---|
| map in a menu drawer | a sheet with a `LazyVGrid` of buttons in a `ScrollView([.vertical, .horizontal])`, pinned section headers for the letters | `ModalBottomSheet` with a two-way scrolling `LazyVerticalGrid`, sticky headers |
| range control | a segmented `Picker` in the bottom toolbar, scrollable | a scrollable `SingleChoiceSegmentedButtonRow` in the bottom app bar |
| hold to peek | a `contextMenu` preview | a long-press popup |

## Related components

[Sheet](../Sheet/README.md) holds it (a menu drawer). [Row](../Row/README.md) draws the peek's rows. [Segment](../Segment/README.md) is the range control's nearest relative (2 to 5 fixed views; this one scrolls). [Status](../Status/README.md) says the workflow state of one item in words; a tile says it in colour.

## Tokens used

`land-hold` · `land-fade` · `sheet-out` · `amber-fill` · `amber-fill-ink` · `progress-fill` · `progress-fill-ink` (new: fills colour a status that covers a whole area, [SURFACES.md](../../SURFACES.md)) · `paper` · `well` · `ink` · `muted` · `line` · `handle` · `app-background` · `st-context-bg` · `st-panel-bg` · `st-press` · `radius-control` · `radius-segment` · `radius-inset` · `radius-panel` · `radius-4` · `space-2` · `space-4` · `space-6` · `space-8` · `space-10` · `space-12` · `space-14` · `space-16` · `space-24` · `space-card-x` · `size-2` · `size-15` · `size-16` · `size-20` · `size-22` · `size-24` · `size-34` · `size-56` · `footer-height` · `type-meta-size` · `type-identifier-size` · `type-weight-medium` · `type-weight-semibold` · `font-sans` · `font-mono` · `border-width` · `icon-pad-stroke`. The geometry is set in four local properties on the map (`--pm-tile`, `--pm-gap`, `--pm-label`, `--pm-head`) built from these tokens.

## Used by

- `farrowing.pen-map` (Pen map).
- **Until migrated:** `inspection.go-to-pen` still draws its own map and peek (`ux/system/inspection-astra-concept.js`, `penMapSheet`); it moves onto PenMap in the next change.

## Changelog

2026-10-14: new. Farrowing's Go to pen moves onto it. Adds the `arrow-down` glyph and the tokens `amber-fill`, `amber-fill-ink`, `progress-fill` and `progress-fill-ink`.
2026-10-17: Farrowing's dock entry is a framed Pen map button (the sheet is titled Pen map, formerly Go to pen). Adds the colour rule, the landing cue and the tokens `land-hold` and `land-fade`.
