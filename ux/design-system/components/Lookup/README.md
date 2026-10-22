# Lookup

Lookup reaches an animal by her ear tag in one of two ways, and every feature uses the same two: **Find** (type part of a tag or pen, tap one, act) and **Scan** (hands-free reads). They are different jobs and never merge (owner decision, 2026-10-12). What a read does is the host's job (owner, 2026-10-22): a **multi-select** place ticks each animal as she is read (Home, Inspection's walk, a list that chooses animals), a **single-action** task opens her (Farrowing). The host passes its own animal row, its task membership and its own Actions, and Lookup draws the page around them. The rules every host follows, and what a read can find, are the [Search and scan](../../../../features/find-pig/PRD.md) feature set's.

**The search field** is one part wherever a worker types to narrow (owner, 2026-10-21): `SentriUI.searchBox({ input, value, scan, clear })` draws the search glyph, the host's input, Clear (✕, only while something is typed) and the scan glyph at its end when the host has a reader. Find draws it as a box of its own at 52px (`searchBox`, the page's only control, focused on open). In a picker, a sheet or a list (`choiceSearch`) the host's own input stays the box, at the size each host gives it, and the glyph and the ends are drawn in its padding (`label.field.catalog-search > span.st-search-box > input`): hosts that size or splice that markup keep working, and nothing around the field moves. ChoiceList's `choiceSearch` (every picker), Home's To treat and Monitoring and Treatment's Dose per pig use it. A host keeps its own input attributes (`data-mk-search`, `data-dose-search`); Clear is the host's action when it passes `clear.action`, else it empties the field and fires `input` so the host's draft empties too.

`SentriUI.findPage({ query, placeholder, results, scan, clear, cancel, inputAttrs, bar, scanning, footer })` draws Find, and `SentriUI.findResults({ query, groups, hint, none })` fills its results with the hint, the no-match line or the unit cards. `SentriUI.findRow({ code, place, query, action, value, right })` is a result row: the tag, the typed part marked, over where the animal is, and the host's right side (`right`): the task's state for an animal on the task's own list, her condition tags (or nothing) for any other (owner, 2026-10-22: "in the task" is the list, not the unit). `SentriUI.findMark(text, query)` marks the typed part of any text (the tag, the place) in bold ink, for a host that draws its own result row. `SentriUI.scanPage({ title, back, read, connected, listening, groups, picked, selected, actions, toggle, empty, bar })` draws Scan: `read: 'open'` for a single-action task (nothing is listed; the host opens her on each read), and `actions` as a list (`[{ label, action }]`) for a multi-select task's own actions, shown directly in the footer. `SentriUI.scanBar({ state, device, stop })` is the scan bar: scanning on a list, in place of the host's search bar. `SentriUI.scanArrive(root, scan)` lights the row just read. `SentriUI.scanPlaces(root)` and `SentriUI.scanGlide(root, before)` let a new row arrive without a jump. `SentriUI.lookupGroups(groups, { variant })` draws the unit cards for either. A group can have `pens` instead of `rows`. Then it draws one card per pen under the unit heading, as Inspection's unit list does. The card's tinted header has the pen code in mono and how many pigs are listed ("B2 · 2 pigs"), with the typed part marked. Home and Inspection draw their lists and results this way (owner, 2026-10-22: the pen is the header, the row is the pig). Their rows then carry the stage line, not the pen; `findRow({ markPlace: false })` keeps the typed part from being marked in it. Types are in `index.d.ts`.

Classification: **component**. It was lifted from Farrowing's Find a sow and Scan ear tags (#143, refined 2026-10-20) unchanged, so Farrowing's screens did not move. Inspection and Home then moved onto it from their old drawers. There are three variants: find, scan and the scan bar.

## When to use / when not

**Use Find when**
- the worker knows the tag or the pen, or part of it, and wants that one animal now, wherever she is.

**Use Scan when**
- the worker holds the reader to pigs one after another: to tick them for an action (a multi-select place), or to open each in turn (a single-action task).

**Use the scan bar when**
- a page that chooses animals from a list on screen scans in place (Farrowing's Actions → Choose pigs): the reads tick animals where they are in the list, with no Scan page;
- a multi-select place with no list of its own searches and scans on one page (Home, owner 2026-10-22): Find's page, whose scan icon turns the field into the scan bar (`findPage({ scanning })`). Each read ticks her into the results area, a result ticks the same way, and the count and Actions sit in the page's `footer`.

**Do not use it**
- to choose from a short known list: use [ChoiceList](../ChoiceList/README.md) or a [PickerField](../PickerField/README.md);
- to narrow a list already on screen: use [FilterSheet](../FilterSheet/README.md);
- as a drawer. Both are full pages, because the field and the list need the whole height.

## Anatomy

**Find** (a white input page, `data-ds="Lookup"`, `data-variant="find"`):
1. **Status bar** (the host's `bar`), white with the page.
2. **Field**, pinned at the top. It is 52px with a 2px ink border and focused on open. Inside it are the search glyph, the typed text (17px / 500), Clear (✕, only once something is typed) and the scan icon (only when the host has a reader; it opens Scan). **Cancel** (a text button) sits beside the field. A 1px `line` rule sits under the bar.
3. **Results**: the only scroller. Before typing it holds one quiet hint line and lists nothing. Typed, it shows one tinted card per unit under a plain section heading ("Unit 7"), with the worker's unit first. Each row is the tag in mono, with the typed part bold ink and the rest muted, over the place ("Pen C2", also marked when it matched); on the right, the host's right side: the task's state for an animal on its list ("3 days" over "! Overdue"), else her condition tags or nothing. With nothing found it shows one quiet line quoting the text and saying every unit was searched.

**Scan** (a [Sheet](../Sheet/README.md) page on the tint):
1. **Page header**: Back at the top left and the title ("Scan ear tags"), with no line.
2. **List**: one white card per unit under a plain section heading, the worker's unit first, newest scan first within it. Each row is **the context's own animal row** with its tick box (Row · select + door): Farrowing's sow row with her state, Inspection's roster row with condition tags, Home's tag over pen with a marked condition. The list carries the page gutter itself.
3. **Empty** (before the first scan): the scan glyph, "Hold the reader to an ear tag" and "Each pig you scan appears here." Stopped before any scan, it reads "Scanning is stopped".
4. **Footer** (56px): "Stop scanning" (secondary, stop glyph) while listening, or "Resume scanning" (primary, scan glyph) once stopped. With rows ticked it is the plain count ("2 pigs selected", not a button) and the primary **Actions**, or a task's own actions directly (the last primary). With no reader paired there is no footer.
5. **Opens** (`read: 'open'`): no list at all; the empty line says what a read does ("Each sow opens as soon as her tag is read."), and the footer is Stop / Resume scanning.

**Scan bar** (`data-variant="scan-bar"`, in the host's search bar's place): the scan glyph, a title over a line, and a text **Stop** at the end, one tap target the bar's height. **Scanning** ("Scanning" / "Scan to tick pigs") wears the scan hue: `progress-wash`, a 1px `chip-progress-border`, `progress-fill-ink` and `progress` text (8.6:1 and 5.1:1). **Waiting** ("Waiting for reader" / "Make sure Reader 1 is on", the paired reader's name) wears the pending colours: `pending-surface`, `pending-border`, `amber-fill-ink` and `amber` (9.1:1 and 5.2:1).

## Variants

- [Find](variants/find.html): empty, results in two units, no match, a 12-digit tag, no reader (no scan icon), and Chinese.
- [Scan](variants/scan.html): nothing scanned, no reader, condition-tag rows, a single-action task's opening page, stopped, and Chinese. A row's ticked and Just scanned faces are [Row · select + door](../Row/variants/select-door.html)'s own states; the page with rows ticked as they were read is on the live screens (Inspection's and Home's Scan · scanned). A multi-select task's own actions in the footer (`actions: [...]`) are a shape for the heat check, which isn't designed yet.
- [Scan bar](variants/scan-bar.html): scanning, waiting for the reader, waiting with no reader name, and Chinese. A row's ticked and Just scanned faces are [Row · select + door](../Row/variants/select-door.html)'s own states; the page with rows ticked is on the live screens (Farrowing's and Inspection's Scan · ticked).

## States

| State | Find | Scan |
|---|---|---|
| Opened | the field focused, the hint, nothing listed | "Hold the reader to an ear tag", Stop scanning |
| Content | unit cards of results | unit cards of scanned animals |
| None | "No pig matching “909” in any unit." | a tag no pig has (a new, empty tag, or not synced to this phone) is possible (owner, 2026-10-22). It is never ticked; the host says so: a list puts it in its own card ("No pig with this tag"), a single-action task's Scan a toast (Toast · Door and dismiss) to her pig profile |
| Arrival | n/a | the row just read takes Row's Just scanned state (`data-arrival`, `progress-wash`) for 1.6 s, then fades; the row is brought into view |
| Ticked | n/a | a multi-select host ticks each read; ticked rows take the selected tint; the footer becomes the count and Actions (or the task's own actions) |
| Opens | n/a | a single-action task: each read opens her over Scan; her Back returns to Scan, still listening; while she is open the reader waits |
| Waiting (scan bar) | n/a | the reader isn't connected yet: "Waiting for reader"; it turns to Scanning by itself when it connects |
| Stopped | n/a | the list stays; Resume scanning is the primary |
| No reader | no scan icon in the field | "Scanner not connected" and how to pair it; no footer |

## Behaviour

- **Find** opens with the field focused. Natively the keyboard is number-first with an ABC switch for pens (iOS `numbersAndPunctuation`, Android's 123/ABC). The web field asks for plain text with no auto-capitals and no suggestions. Results follow every keystroke: tags that start with the text come first, then tags that contain it, then pens that match. A result opens that animal **in the host's context**: Farrowing opens her farrowing drawer, Inspection opens her pig record in the walk, and Home opens her pig record (owner, 2026-10-20). Back from there returns to the results with the text kept.
- **Scan** always listens while the page is open. A repeat scan adds no second row; it lights hers again. In a multi-select place each read arrives ticked (owner, 2026-10-22: a worker walking past three sick pigs scans them and acts on all three); a tick unticks. Tapping the rest of the row opens her, as Find does. In a single-action task a read opens her and nothing is listed.
- **The scan bar** turns a list into scanning: each read ticks her where she is, marks her row (Row's Just scanned) and brings her into view; a read the list can't take (another unit, no longer on the farm, a tag with no pig) goes into the list's own cards at its top, with no tick box. Stop returns the search field. **Actions** belongs to the host (owner ruling: the task's own actions where it has them, plus the general ones: transfer, condition, treatment, note). Farrowing and Home show the general ones as More actions' verb grid; Inspection opens the walk's own Actions page, whose everyday verbs include Transfer. Transfer is everywhere an entry point to the Transfer feature, which is not designed yet (owner, 2026-10-20). Leaving and coming back keeps the list.
- **Motion**: a new row slides in at the top of its card and the rows under it glide down (280ms). A new card fades in with its heading. Reduced motion and the atlas's still frames skip the slide; the tint stays.

## Content rules

- Tags are shown whole in mono, never truncated. The tag format is not fixed yet (owner: mock with 6-digit tags); Find's specimens include a 12-digit tag. How a row lays out a long tag beside its figure or tags is [Row](../Row/README.md)'s rule. The place on the right is short ("Pen C2", "B12").
- Unit headings are the unit's plain name with no count and no "Other units" (owner, 2026-10-20).
- The selected count names the context's animal: "2 sows selected", "2 pigs selected".

## Accessibility

The field's accessible name is its placeholder ("Ear tag or pen"). The results area is a live region, so a screen reader hears the change. Each tick box is named "Select 000306" and each door names the animal. The footer count is plain text, not a control.

## Do / Don't

- **Do** pass the context's own animal row to Scan, so a scanned animal looks as she does in that task.
- **Don't** list anything before the worker types, add a Select button, or add a second scanning status in the body.
- **Don't** show a task's state on an animal that isn't on the task's list, or a plain row for one that is.
- **Don't** restyle the page from a feature's CSS. A host only places it: Inspection lays Find over the walk; Home turns its status bar white under Find.

## Native

Find maps to a search screen with a pinned search bar (iOS `UISearchController` in a full-screen presentation, Android `SearchView` in its own screen). Scan maps to a full-screen list fed by the Bluetooth reader, with a short haptic tick on each read.

## Related components

[Row](../Row/README.md) (Animal, select + door) draws every row. [Sheet](../Sheet/README.md) (page) holds Scan. [Heading](../Heading/README.md) and [Panel](../Panel/README.md) draw the unit cards, and [Button](../Button/README.md) and [IconButton](../IconButton/README.md) draw the controls. Actions is the host's own (More actions' verb grid, [Row](../Row/README.md) tile).

## Tokens used

`paper`, `app-background`, `line`, `ink`, `ink-2`, `muted`, `radius-12`, `footer-height`, `font-sans`.

## Used by

Farrowing: Find a sow, Scan ear tags (opens), Actions → Choose pigs (the scan bar). Inspection: Find a pig, Scan ear tags (ticks; from the walk's dock). Home: Search and scan, one page (Find with the scan bar; ticks; the bottom bar's middle button).
