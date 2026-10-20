# Lookup

Lookup reaches an animal by her ear tag in one of two ways, and every feature uses the same two: **Find** (type part of a tag or pen, tap one, act) and **Scan** (hands-free: each tag the reader reads adds her to a list, then tap one or tick several). They are different jobs and never merge (owner decision, 2026-10-12). The host passes its own animal row and its own Actions, and Lookup draws the page around them.

`SentriUI.findPage({ query, placeholder, results, scan, clear, cancel, inputAttrs, bar })` draws Find, and `SentriUI.findResults({ query, groups, hint, none })` fills its results with the hint, the no-match line or the unit cards. `SentriUI.findRow({ code, place, query, action, value })` is a result row: the tag, the typed part marked, and where the animal is. `SentriUI.scanPage({ title, back, connected, listening, groups, picked, selected, actions, toggle, empty, bar })` draws Scan. `SentriUI.scanArrive(root, scan)` lights the row just read. `SentriUI.scanPlaces(root)` and `SentriUI.scanGlide(root, before)` let a new row arrive without a jump. `SentriUI.lookupGroups(groups, { variant })` draws the unit cards for either. Types are in `index.d.ts`.

Classification: **component**. It was lifted from Farrowing's Find a sow and Scan ear tags (#143, refined 2026-10-20) unchanged, so Farrowing's screens did not move. Inspection and Home then moved onto it from their old drawers. There are two variants, find and scan.

## When to use / when not

**Use Find when**
- the worker knows the tag or the pen, or part of it, and wants that one animal now, wherever she is.

**Use Scan when**
- the worker holds the reader to pigs one after another and wants them collected, to open one at a time or to act on several.

**Do not use it**
- to choose from a short known list: use [ChoiceList](../ChoiceList/README.md) or a [PickerField](../PickerField/README.md);
- to narrow a list already on screen: use [FilterSheet](../FilterSheet/README.md);
- as a drawer. Both are full pages, because the field and the list need the whole height.

## Anatomy

**Find** (a white input page, `data-ds="Lookup"`, `data-variant="find"`):
1. **Status bar** (the host's `bar`), white with the page.
2. **Field**, pinned at the top. It is 52px with a 2px ink border and focused on open. Inside it are the search glyph, the typed text (17px / 500), Clear (✕, only once something is typed) and the scan icon (only when the host has a reader; it opens Scan). **Cancel** (a text button) sits beside the field. A 1px `line` rule sits under the bar.
3. **Results**: the only scroller. Before typing it holds one quiet hint line and lists nothing. Typed, it shows one tinted card per unit under a plain section heading ("Unit 7"), with the worker's unit first. Each row is the tag in mono, with the typed part bold ink and the rest muted, and the place on the right ("Pen C2"), also marked when it matched. With nothing found it shows one quiet line quoting the text and saying every unit was searched.

**Scan** (a [Sheet](../Sheet/README.md) page on the tint):
1. **Page header**: Back at the top left and the title ("Scan ear tags"), with no line.
2. **List**: one white card per unit under a plain section heading, the worker's unit first, newest scan first within it. Each row is **the context's own animal row** with its tick box (Row · select + door): Farrowing's sow row with her state, Inspection's roster row with condition tags, Home's tag over pen with a marked condition. The list carries the page gutter itself.
3. **Empty** (before the first scan): the scan glyph, "Hold the reader to an ear tag" and "Each pig you scan appears here." Stopped before any scan, it reads "Scanning is stopped".
4. **Footer** (56px): "Stop scanning" (secondary, stop glyph) while listening, or "Resume scanning" (primary, scan glyph) once stopped. With rows ticked it is the plain count ("2 pigs selected", not a button) and the primary **Actions**. With no reader paired there is no footer.

## Variants

- [Find](variants/find.html): empty, results in two units, no match, a 12-digit tag, no reader (no scan icon), and Chinese.
- [Scan](variants/scan.html): nothing scanned, no reader, sow rows in two units, condition-tag rows, the arrival tint, ticked, stopped, a 12-digit tag, and Chinese.

## States

| State | Find | Scan |
|---|---|---|
| Opened | the field focused, the hint, nothing listed | "Hold the reader to an ear tag", Stop scanning |
| Content | unit cards of results | unit cards of scanned animals |
| None | "No pig matching “909” in any unit." | not possible: a scan always adds a row (no Not-found row, owner 2026-10-12) |
| Arrival | n/a | the row just read takes Row's Just scanned state (`data-arrival`, `progress-wash`) for 1.6 s, then fades; the row is brought into view |
| Ticked | n/a | ticked rows take the selected tint; the footer becomes the count and Actions |
| Stopped | n/a | the list stays; Resume scanning is the primary |
| No reader | no scan icon in the field | "Scanner not connected" and how to pair it; no footer |

## Behaviour

- **Find** opens with the field focused. Natively the keyboard is number-first with an ABC switch for pens (iOS `numbersAndPunctuation`, Android's 123/ABC). The web field asks for plain text with no auto-capitals and no suggestions. Results follow every keystroke: tags that start with the text come first, then tags that contain it, then pens that match. A result opens that animal **in the host's context**: Farrowing opens her farrowing drawer, Inspection opens her pig record in the walk, and Home opens her pig record (owner, 2026-10-20). Back from there returns to the results with the text kept.
- **Scan** always listens while the page is open. A repeat scan adds no second row; it lights hers again. A tick selects. Tapping the rest of the row opens her, as Find does. **Actions** belongs to the host: the task's own actions where it has them (Inspection's), plus the general ones everywhere (transfer, condition, treatment, note). Home has no task, so it offers only the general ones. Leaving and coming back keeps the list.
- **Motion**: a new row slides in at the top of its card and the rows under it glide down (280ms). A new card fades in with its heading. Reduced motion and the atlas's still frames skip the slide; the tint stays.

## Content rules

- Tags are shown whole in mono, never truncated; the tag format is not fixed, so a 12-digit tag must fit (specimens). The place on the right is short ("Pen C2", "B12").
- Unit headings are the unit's plain name with no count and no "Other units" (owner, 2026-10-20).
- The selected count names the context's animal: "2 sows selected", "2 pigs selected".

## Accessibility

The field's accessible name is its placeholder ("Ear tag or pen"). The results area is a live region, so a screen reader hears the change. Each tick box is named "Select 000306" and each door names the animal. The footer count is plain text, not a control.

## Do / Don't

- **Do** pass the context's own animal row to Scan, so a scanned animal looks as she does in that task.
- **Don't** list anything before the worker types, add a Select button, add a Not-found row, or add a second scanning status in the body.
- **Don't** restyle the page from a feature's CSS. A host only places it: Inspection lays Find over the walk; Home turns its status bar white under Find.

## Native

Find maps to a search screen with a pinned search bar (iOS `UISearchController` in a full-screen presentation, Android `SearchView` in its own screen). Scan maps to a full-screen list fed by the Bluetooth reader, with a short haptic tick on each read.

## Related components

[Row](../Row/README.md) (Animal, select + door) draws every row. [Sheet](../Sheet/README.md) (page) holds Scan. [Heading](../Heading/README.md) and [Panel](../Panel/README.md) draw the unit cards, and [Button](../Button/README.md) and [IconButton](../IconButton/README.md) draw the controls. Actions is the host's own (More actions' verb grid, [Row](../Row/README.md) tile).

## Tokens used

`paper`, `app-background`, `line`, `ink`, `ink-2`, `muted`, `radius-12`, `footer-height`, `font-sans`.

## Used by

Farrowing: Find a sow, Scan ear tags. Inspection: Find a pig, Scan ear tags (from the walk's dock). Home: Find a pig (Toolbox › Find a pig or pen), Scan ear tags (the bottom bar's Scan).
