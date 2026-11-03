# PenMap

A pen map shows a room as a map of pens, each pen a tile that goes to that pen and is coloured by its status, so a worker finds the pen in front of her by where it is and sees at once which ones need her. It is Farrowing's and Inspection's Pen map. It sits in a menu drawer ([Sheet](../Sheet/README.md), `surface: 'menu'`) and does not record a farm fact.

`SentriUI.penMap({ lanes, depth, rows, apart, aSide, entranceAt, backDoor, pens, current, action, key, entrance, labels, peek })` draws the body: the Entrance band and the map. `SentriUI.penMapKey({ pens, words })` gives the items of the sheet's key line (the legend; see below). `SentriUI.penMapFooter({ back })` draws the footer (Back; the map adds [Whole room](#whole-room) beside it when it needs it). `SentriUI.penPeek({ title, meta, rows, more })` draws the hold-to-peek card's content. Types are in `index.d.ts`.

Classification: **component** (a new job; no existing component draws a map of places). Two variants: the map, and the map's [Whole room](#whole-room) view.

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
4. **Tile**: a button, at least 56 × 56, 8px gaps, 12px radius, the pen code in 15px / 600 mono and nothing else. Columns are `minmax(56px, 1fr)`: when the lanes do not fit at 56px the map scrolls sideways and the tiles never shrink. In a room of pens of different sizes a tile is as tall as its pen is long, against the room's other pens ([Pen sizes](#pen-sizes)).
5. **Back door** band, the Entrance band's twin, ending the map when the room has a door at the far end ([Room shapes](#room-shapes)).
6. **Peek** (on hold): a white card with a 1px `line` border over the lower part of the map, clear of the footer: the pen code and its count, the host's animal rows, and, when a pen has more animals than the card shows, one muted 13px line (`+26 more`).
7. **Whole room** (footer, only on a map more than two screens tall): a secondary button beside Back, taking the footer's spare width, "Whole room"; while the room is shown whole it reads "Pen by pen" ([Whole room](#whole-room)).
8. **Shared tile** (Whole room only): a tile several pens of one run share. Its range in 13px / 600 mono (`A11–20`), and under it one 8px mark per pen in that pen's status colour, in order (`amber-fill`, `progress-fill`, `handle` for has sows, `well` for empty; `paper` marks when every pen in it is empty).

## Room shapes

The desktop console's Farm layout describes a room exactly: lanes run away from the main door, each a run or several runs of one pen type with sizes in centimetres; rows of pens stand across the room at the far end or by the door; older layouts have pens drawn by hand in any shape; a room has one main door and may have others; lane A is on the left or the right as you walk in. The phone draws the same room as the worker meets it at the main door, simplified so every pen is a tile she can hit with a glove. What a worker uses to find a pen is its order from the door and its number, so the map keeps those exactly and drops shapes and distances. Sizes come back only as tile heights, against the room's other pens ([Pen sizes](#pen-sizes)). The pen lists do not change (owner, 2026-11-02).

| The room has | The map draws | Why |
|---|---|---|
| Lanes of different lengths | Each lane stops at its last pen. No tile past it, no empty cell: the sheet's tint shows through. | An empty tile is a pen with no animals; a place with no pen is nothing. |
| Runs of different pen types along a lane (10 group pens, then 12 stalls; 3 gilt pens, a stall, a gilt pen; lane A group pens then stalls while lane B is stalls then crates) | The codes carry on along the lane (A10, A11). Each tile is as tall as its pen is long, against the room's other pens ([Pen sizes](#pen-sizes)), so the change of size is the change of type: nothing is named. When every lane pen is one size, rows stay pen numbers with the number column on the left; when sizes differ, each lane is a column of its own pens and the row numbers go (the codes carry them). | A stall (65 cm) and a group pen (4.8 m) look different on the floor, and the map says so the same way. Names over runs piled up in lanes that change at different pens (owner, 2026-11-03: size, not labels). |
| A row of pens across the room (the layout's end row: Row C, 24 stalls across the far end; 3 sick pens by the door) | Where she meets it: a row by the door before the lanes, a row at the far end after them, 8px further from the lanes than the lanes' own gaps. Its tiles sit under the lanes by the row-grid rule: 1 to 4 on one line, then the fewest even lines, four across at most (24 stalls: 6 lines of 4), each run of the row starting a line. Codes count from lane A's side (C1 under A); no row numbers beside them. One pen is one tile across all the lanes (the sketch room's large pen, C1). | A row of 24 stalls drawn as it stands would be 24 tiles across, a screen and a half wide; folded under the lanes it reads in her walking order and every tile keeps 56px. |
| A pen drawn by hand (older layouts only: a triangle, a trapezoid, anything) | A tile like every other. One at the far end of a lane carries on that lane (its code says so). One on its own takes a column of its own beyond the last lane, headed by its letter (C, D), at the row of the lane pen it stands beside, or at the end. | A shape at 56px loses half its area as a target and its code no longer fits, and nobody finds a pen by its outline: she finds it by where it is and the number on it. |
| A room that is not a rectangle | The lanes and pens only; the walls are not drawn. | The walls do not change which pen is which. |
| A main door | The Entrance band, always on top: pens are numbered from the main door, so pen 1 is always the first row. Its words sit over where the door is across the room (`entranceAt`: left, middle, right). A main door on a side wall is drawn at that side of the top: pen 1 is the end nearest it. | One reading direction for every room: down the phone is away from the door. |
| Another door at the far end | The Back door band ends the map (`backDoor`), its arrow pointing up, as a worker who comes in there would walk. Other doors (on the side walls) are not drawn. | A worker who comes in at the far end needs to know she starts at the high numbers; a side door does not change how the map reads. |
| Lane A on the right as you walk in | The lanes are drawn right to left (B A), and a row counts from the right (C1 under A): the map is what she sees at the main door. The row numbers stay on the left. | The letters must sit where the lanes are. |
| One pen, or an open room | No map: the host draws no Pen map button, and the room list is the room. | A map of one place answers nothing. |
| A very long lane (50 stalls), or any room more than two screens tall | The map scrolls, and the footer gets Whole room beside Back ([Whole room](#whole-room)). | One way to the far end for every room, instead of a jump control that only counts pen numbers. |

The host passes the room in pen-map terms, which the farm layout gives directly: `lanes` as `[{ runs: [{ n: 10, type: 'Group pen', size: 483 }, { n: 12, type: 'Gestation stall', size: 65 }] }]` (`size`: the pen type's length along the lane in cm, the layout type's `w`) (letters A, B… in order; `{ n: 6 }` for a lane of one type), `rows: [{ letter: 'C', at: 'far', runs: [{ n: 24, type: 'Gestation stall', size: 65 }] }]` (`at: 'door'` for a row by the door), `apart: [{ code: 'C1', row: 2 }]`, `aSide: 'right'`, `entranceAt: 'left'`, `backDoor: 'Back door'`. Letter lanes with a `depth` (`lanes: ['A','B','C','D'], depth: 6`) draw the room exactly as before.

## Pen sizes

A pen's size says what it is: on the floor a stall is a narrow slot and a group pen a room-wide box, and the map keeps that difference without a word (owner, 2026-11-03). Sizes are always against the other pens in the same room, never a fixed size per type.

1. **The room's shortest pen is 56px**, the glove floor. Nothing is ever smaller, and a tile never grows to fill the screen: growing would only show fewer pens.
2. **The longest is at most 1.8 × that** (101px). On a 390 × 844 phone that is a quarter of the map's height, so at least four of a room's biggest pens show in one lane on one screen.
3. **Within that, the ratios are true** (crates 180 cm and sick pens 250 cm: 56px and 78px). Past it they are compressed together, keeping their order: height = 56 × (length ÷ shortest)^p, with p chosen so the longest lands on 1.8 × (stalls 65 cm, crates 180, group pens 483: 56, 76 and 101px).
4. **One size, or none given:** every tile 56px, as before.

Size tells small, medium or large at a glance; two types close in size (crates and sick pens) look alike, and the exact type is in the peek and on the pen's page. A map of one size keeps its row numbers; a map of mixed sizes stacks each lane on its own (rows would no longer line up), and the codes carry the numbers.

## Whole room

A room longer than two screens is hard to take in by scrolling, and a tile can never shrink under the glove floor. So such a map gets one more button, Whole room, which shows the room on one screen with neighbouring pens sharing a tile (owner, 2026-11-03: one zoom out; no slider, no pinch). It replaces the range control.

| Rule | Detail |
|---|---|
| **When** | The map adds Whole room to the sheet's footer, beside Back, when it is more than twice as tall as the space it has (measured when it mounts). Shorter rooms have Back alone, and no host does anything. |
| **How many to a tile** | The fewest that fit the map's height with no scrolling down: 2, 5, 10, 25 or 50 pens to a tile (2 × 50 stalls: 10; the gestation barn: 5). A room too wide for its lanes at 56px still scrolls sideways (the 8 × 20 nursery): tiles never go under 56px wide. |
| **Which pens share** | Neighbours in one run of one lane or row, so a shared tile is always one type, at that type's size. A leftover of less than half a tile joins the tile before it (B14–19, never a lone B19). A pen alone in its tile is a pen tile and opens its pen. |
| **What a shared tile says** | Its range (`A11–20`) and one mark per pen in its status colour, in order, so she sees where in the ten the amber one is; past ten pens, one mark per status, as long as its share. Its face is white when any pen in it has animals, quiet when all are empty. |
| **Lane letters** | When a range does not fit its column, every lane tile drops the lane letter at once (`11–15`): the letter is at the top of the column. Row tiles keep theirs. |
| **Going back** | A tap on a shared tile goes to pen by pen with that tile's first pen just under the letters. The button, which reads Pen by pen while the room is whole, goes back to where the map was. |
| **Peek** | A shared tile has none (it is not one pen); a pen tile in Whole room peeks as usual. |

Strings: `ds.penmap.whole_room` (Whole room) and `ds.penmap.pen_by_pen` (Pen by pen); the host passes them as `labels.whole` and `labels.byPen`, and a shared tile's accessible name as `labels.pens` (`Pens A11–20`).

## Variants

- [Map](variants/map.html): the one map, in a menu drawer. Specimens: Unit 7 (4 × 6), 2 × 60, 2 × 100, 2 × 160, 8 × 20 (sideways scroll), a filtered map, an empty map, the peek (and a pen of 30 with `+26 more`), a pressed tile and the Chinese key; and the room shapes: lanes of different lengths, a mixed lane (the group gestation barn), mixed lanes that differ, a row at the far end (one pen; the gestation barn's 24 stalls), a row by the door, the sketch room, pens on their own, the doors, lane A on the right with a row, and a lane of 50 stalls.
- [Whole room](variants/whole-room.html): the Whole room view: 2 × 50 stalls at ten to a tile, the gestation barn (group pens and the stall row, at five), four lanes of four types, the 8 × 20 nursery with the lane letters dropped, and pen by pen again after a tap on B31–40.

## States

A pen takes one face: the loudest level among the animals the list shows in it (the colour rule below). Farrowing's animals are sows; Inspection's are pigs.

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
- **The task supplies the levels.** It says which of its row states sit on which rung; the component never decides. A task with no "in progress" state simply never draws blue. Each task varies only through a mapping table in its `budget.md`: [Farrowing's](../../../../features/farrowing/budget.md#pen-colours-the-mapping-table), [Inspection's](../../../../features/inspection/budget.md#pen-colours-the-mapping-table). Breeding, heat-check and pregnancy add theirs when they adopt PenMap.
- **A tile shows only the pen code.** Counts go in the colour key (the sheet's header line), never in the tile.
- **The map follows the list.** It uses the list's current tab and filter: a pen the list hides is drawn as filtered out.
- **Severity never adds a colour.** An Inspection red marker becomes Needs you (amber); how bad it is stays in the peek or on the page.
- **Progress through a task is not a level.** A pen the walk has been through and one it has not take the same face (Inspection, 2026-10-22): a pen with nothing to record leaves no trace, so a checked mark would call a healthy pen unchecked, and it would be a second channel in the tile. The map answers "where was I" by opening on the pen at the top of the list. [The decision](../../../../features/inspection/budget.md#checked-and-not-checked).

## Landing on the pen

Tapping a tile is one motion, with one cue. The host places its list on the pen first, under the sheet, so no scroll is seen. The sheet then slides down in `sheet-out` (180ms) with its scrim, and the pen's header takes the tapped tile's own fill (amber, blue), its text and icons in that fill's own ink as on a tile, held for `land-hold` (900ms) and faded back by `land-fade` (700ms) later, 1.6s in all. A white tile (Has animals) has no fill to carry, so its pen card takes a 2px ink ring with the same timing, drawn just inside the card's edge so it covers the card's own border and a sticky bar above cannot hide its top. Nothing else dims or moves. With reduced motion the sheet just goes and the colour shows and fades without movement. Where motion is frozen (the atlas) the pen is reached at once and the list is the plain list.

The cue is the component's, so every task lands the same way: the host marks the pen it lands on with `data-pen-land="act|live|plain"` (the tapped tile's level) and that pen's header with `data-pen-land-head`, and removes both after `land-hold` + `land-fade`. A pen re-drawn mid-cue sets `--land-elapsed` to resume part-way. The host draws nothing of its own. A still render (the atlas, automation) shows the cue at its hold without motion: the host adds `data-pen-land-held` and keeps the mark until the next action, so the landed states are screens the gate shoots and judges (Farrowing: `farrowing.pen-landed`, `-live`, `-plain`).

## Behaviour

- **Tap** a tile and the host goes to that pen (`data-action` and `data-value` carry the action and the pen code), as in Landing on the pen. A disabled tile does nothing.
- **Hold** a tile 350ms to peek at its sows, read-only. Moving more than 12px, scrolling or lifting hides it; the tap that follows a peek only closes it and does not go to the pen.
- **The map scrolls** inside the sheet, sideways and down. The sheet body does not scroll; the Entrance band stays put. The scrollbar is never drawn.
- **Opens on the current pen**, centred in the space under the letters and beside the numbers.
- **Whole room** shows the room on one screen ([Whole room](#whole-room)); a tap on a shared tile, or Pen by pen, goes back.
- **Mounting** is automatic: a map is found by its markup and mounted when it enters the document. A host that inserts markup some other way calls `SentriUI.penMapMount(root)`.

## Content rules

- The key word is a short phrase after the count ("need you", "farrowing"; Chinese "需处理", "分娩中"). Counts lead the word.
- Pen codes are the lane then the row (`B3`, `A120`); they are never shortened, translated or wrapped, and they are set in mono.
- A tile says its pen code only. A tile's accessible name adds the state (`Pen B3, needs you`).
- Strings are in the registry (`ds.penmap.*`).
- The peek rows are the host's animal [Row](../Row/README.md) rows: the same tag, state word and figure as its list (or, for a list of condition tags, the same tags). Past four rows the host shows the most urgent four and `more` ("+26 more"); a peek never scrolls.

## Accessibility

- Every tile is a button named by its pen and state; an empty or hidden tile is disabled. The letters and numbers are decoration (`aria-hidden`): the reading order is pen 1's row, then pen 2's.
- Tiles are at least 56 × 56 (above the 48px target floor) with 8px between.
- Whole room is a toggle button (`aria-pressed`). A shared tile is a button named by its range (`Pens A11–20`); its marks are decoration.
- State is never colour alone: the key names the two colours, and each tile's accessible name says its state. The empty face differs by surface and by being disabled.
- Contrast: `amber-fill-ink` on `amber-fill` is 7.4:1 and `progress-fill-ink` on `progress-fill` is 7.1:1; `muted` on `well` is 4.5:1.
- Hold to peek is a shortcut: everything in the peek is in the room list one tap away.

## Do / Don't

- Do put the pen code and nothing else in a tile; put the facts in the peek.
- Do let a long row scroll, and let Whole room share tiles; don't shrink a tile under 56px.
- Don't name pen types on the map: the size says the type.
- Do colour by the animal row's levels (`sowFacts().level`); don't invent a second mapping.
- Don't mark the current pen with a ring or a fill.
- Don't put the status in words in the tile ("Active", "No sows").

## Native

| Sentri | iOS | Android |
|---|---|---|
| map in a menu drawer | a sheet with a `LazyVGrid` of buttons in a `ScrollView([.vertical, .horizontal])`, pinned section headers for the letters | `ModalBottomSheet` with a two-way scrolling `LazyVerticalGrid`, sticky headers |
| Whole room | a toggle button in the bottom toolbar | a toggle button in the bottom app bar |
| hold to peek | a `contextMenu` preview | a long-press popup |

## Related components

[Sheet](../Sheet/README.md) holds it (a menu drawer). [Row](../Row/README.md) draws the peek's rows. [Status](../Status/README.md) says the workflow state of one item in words; a tile says it in colour.

## Tokens used

`land-hold` · `land-fade` · `sheet-out` · `amber-fill` · `amber-fill-ink` · `progress-fill` · `progress-fill-ink` (new: fills colour a status that covers a whole area, [SURFACES.md](../../SURFACES.md)) · `paper` · `well` · `ink` · `muted` · `line` · `handle` · `app-background` · `st-context-bg` · `st-panel-bg` · `st-press` · `radius-control` · `radius-segment` · `radius-inset` · `radius-panel` · `radius-4` · `space-2` · `space-4` · `space-6` · `space-8` · `space-10` · `space-12` · `space-14` · `space-16` · `space-24` · `space-card-x` · `size-2` · `size-15` · `size-16` · `size-20` · `size-22` · `size-24` · `size-34` · `size-56` · `footer-height` · `type-meta-size` · `type-identifier-size` · `type-weight-medium` · `type-weight-semibold` · `font-sans` · `font-mono` · `border-width` · `icon-pad-stroke`. The geometry is set in four local properties on the map (`--pm-tile`, `--pm-gap`, `--pm-label`, `--pm-head`) built from these tokens.

## Used by

- `farrowing.pen-map` (Pen map).
- `inspection.go-to-pen` (Pen map), and its landing (`inspection.pen-landed`, `-plain`).

## Changelog

2026-10-14: new. Farrowing's Go to pen moves onto it. Adds the `arrow-down` glyph and the tokens `amber-fill`, `amber-fill-ink`, `progress-fill` and `progress-fill-ink`.
2026-10-17: Farrowing's dock entry is a framed Pen map button (the sheet is titled Pen map, formerly Go to pen). Adds the colour rule, the landing cue and the tokens `land-hold` and `land-fade`.
2026-10-22: Inspection's Go to pen moves onto it, with the framed Pen map button and the landing cue. The peek takes `more` (one muted line past the rows it shows); the colour rule settles that a task's progress (checked or not) is not a level.
2026-11-02: room shapes from the console's Farm layout: lanes of any length made of runs of pen types (each run named where the type changes), pens across lanes, pens on their own, lane A on the right, the main door's place and a back door. Letter lanes draw exactly as before. Adds the string `ds.penmap.back_door`.
2026-11-03: rows across the room (the layout's end rows) replace pens across lanes: a row stands before the lanes (by the door) or after them (far end), each run named, its tiles folded under the lanes by the row-grid rule and counted from lane A's side. The phone's room comes from the layout by one lossy step (order, codes, types, door side; never centimetres).
2026-11-03: a pen's size says what it is (tile heights against the room's other pens, 56px to 1.8 ×; mixed sizes stack each lane), so run names are gone. Whole room replaces the range control: a map more than two screens tall gets one button that shows the room on one screen, neighbouring pens sharing a tile. Farrowing's and Inspection's maps are unchanged. Adds the strings `ds.penmap.whole_room` and `ds.penmap.pen_by_pen`.
