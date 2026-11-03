# Icon

The shared glyph registry adds recognition to a visible word. Use Status for a verdict or IconButton for an icon-only action instead.

## When to use

Use beside labels in rows, headings, verbs and controls. Every screen draws from `SentriIcons`, exported alongside `SentriUI` by bundle.js.

## When not to use

Use the word alone when a glyph adds no recognition. Use Status for state; never use an icon's colour as the only signal.

## Anatomy

An aria-hidden SVG on a 24-unit viewBox containing one open-stroke path. More is the deliberate exception: three filled dots of radius 1.5. Size and colour inherit from the host.

## Variants

- **Standard:** use for labelled navigation and content; icon-stroke (1.6), normally at glyph sizes 14–20.
- **Key:** use plus/minus in Stepper keys; icon-key-stroke (2.2). Backspace in Numpad retains 1.8. These are host presentations of the same glyphs.

## States

| State | Rendering |
| --- | --- |
| Default | Registry glyph |
| Unknown | Empty SVG and `console.warn`; never a navigation affordance |
| Pressed, active, disabled, error, loading | Host control owns these states |

## Behaviour / API

`SentriIcons.icon(name)` returns SVG markup. `SentriIcons.paths` is the canonical enumerable registry; derive the glyph count with `Object.keys(SentriIcons.paths).length`, as the preview does. Names are properties, not variants.

Compatibility aliases are non-enumerable: origin → place, arrow → chevron, condition → plus, return → undo, up → back-chevron. Condition was a longer plus cross; use plus for that glyph. Return was the Undo arrow and now means only undo; the return-heat check has its own glyph. Up was a second copy of back-chevron. Aliases continue to resolve for existing callers without adding another glyph to the catalogue. Grid has four separate squares. Unknown names warn in every environment.

The Home task card uses this registry too: its identity icon is the task's own (`farrow`, `pig`, `service`…, falling back to `production`), and its location, clock, transfer, check and chevron use `place`, `clock`, `transfer`, `check` and `chevron`. Its ended-task mark uses `minus`. The card carries no SVG path definitions of its own.


## Meaning rules

The rules come from the owner (2026-11-03). How the icons were drawn and tested is in [review/icon-round](../../../../review/icon-round/PROPOSAL.md).

1. **One meaning per icon.** The table below is the source. A label whose meaning has no icon gets the word alone; never borrow an icon for another meaning (a person for a sow, a warning for a death, a chart for a task).
2. **Use an icon wherever its meaning applies.** Reuse an icon that passed before drawing a near-copy.
3. **Never repeat an icon across the section headings of one page.** Repeated list items of the same kind may share one.
4. **One pig for every kind and age.** `pig` stands for a sow, gilt, boar or piglet; the word beside it says which. At 16 px the kinds can't be told apart.
5. **Generic where the farm makes it obvious:** `transfer` moves pigs, `bookmark` marks a pig, and `more` (···) is every Actions button. `grid` is only the pen map and a unit.
6. **Good enough or not at all.** A new glyph passes a blind naming test first: a fresh tester names it unlabelled at 16–18 px, then matches it to the labels. A glyph that fails isn't added. `batch` and `farrow` passed as borderline: they read only beside their word.

## One meaning per icon

**Animals**

| Icon | Meaning | Used on |
|---|---|---|
| `pig` | A pig of any kind or age: sow, gilt, boar, piglet. The word says which | Parity facet; Report death: The sow; actions: Piglet processing, Foster piglets; + born chip; Pig profile: General details, Basic information; Home: Piglet processing task, Nursery section; Foster piglets row; condition picker: On these pigs |
| `batch` | A batch: pigs managed together ("Batch 27"). Borderline in the blind test: reads as a stack, fine beside the word | Move to another farrowing batch; Pig actions: Batch membership; Pig profile: Batches |
| `missing` | A missing pig (a dashed circle with a question mark, no pig) | Drawn for Report missing (no screen yet) |

**Events**

| Icon | Meaning | Used on |
|---|---|---|
| `service` | Service (breeding, insemination) | Home: Breeding section and task; Pig profile: Sow cycle, Gilt breeding, Boar breeding, Sow & cycle |
| `heat` | Heat check | Home: Heat check tasks |
| `return-heat` | Return-heat check | Home: Return-heat check task |
| `pregnancy` | Pregnancy: the check, abortion, not in pig | Home: Gestation, Pregnancy check; Actions: Record abortion, Mark not in pig |
| `farrow` | Farrowing: a sow lying down, a piglet at her belly. Borderline in the blind test | Home: Farrowing section and task; Pig actions: Open Farrowing |
| `death` | A death | Farrowing: Death key, Died after birth, − died chip; Actions: Record piglet deaths, Record sow death, Record dead |
| `transfer` | Moving or transferring pigs to another pen or room (generic) | Actions: Transfer; Home: Pig transfer tasks; Home: Other |
| `truck` | Pigs leaving the farm | Home: Outbound pickups |
| `sample` | Sampling | Home: Sampling tasks |
| `count` | A count of animals | Farrowing actions: Reconcile piglet count |
| `production` | Production work (bars; chart no longer shares the shape) | Home: Production heading; Pig profile: production tasks; Pig actions: Production |

**Records**

| Icon | Meaning | Used on |
|---|---|---|
| `record` | A record or summary of what was done | Litter summary, Task outcomes, Other outcomes, Pig record, Batches, Task overview |
| `note` | A note someone wrote | Pen note, sow note, Add a note, Details (other cause) |
| `history` | Past records, the log | Home: Records; Pig profile: Log; Pen log; walk Log; Past uploads |
| `tasks` | A list of tasks | Pig profile: Current tasks |
| `chart` | Performance over time | Performance metrics, Averages, Base curve, Production totals & averages, Production stats |
| `edit` | Edit | Edit conditions, Edit finding, correction banner |
| `undo` | Undo the last save (was return) | Farrowing: Undo |
| `camera` | Photos | Photos field |
| `calendar` | A date | Expected farrowing; first-litter placeholder |
| `clock` | Time or due | Header times; Home task timing |
| `details` | More detail fields (sliders) | Piglet processing end page |
| `bookmark` | Mark a pig: breeder pick, Mark as breeder | Piglet processing; Mark as breeder |

**Places**

| Icon | Meaning | Used on |
|---|---|---|
| `barn` | A building on the farm | Sections |
| `pen` | A pen | Pen page: Now; fault pen rows; Pen information |
| `grid` | The pen map, and a unit | Dock map; Choose a unit; unit rows |
| `place` | Where something is (location pin) | Scope label, Origin & dates, task-card scope |
| `home` | Home tab | Bottom navigation |
| `hospital` | Hospital pen | Care instructions: Move to hospital pen |

**Health**

| Icon | Meaning | Used on |
|---|---|---|
| `health` | Health | Home: Health heading and signals; Actions page: Health |
| `care` | Care instructions | Care instructions (actions, batch tiles); To-treat filter: Care |
| `treat` | Treatment, vaccines | Treat tiles, To treat, Record treatment |
| `pill` | Medicine: antibiotics, pain relief | Medicine categories (antibiotics, pain relief); medicine picker groups; no-brand state |
| `bug` | Parasites | Medicine categories |
| `drop` | Vitamins; udder | Medicine categories, udder area |
| `monitor` | Monitoring | Monitoring list, Observe |
| `alert` | Needs attention | Warnings, Care |
| `lungs` | Breathing area | Condition areas |
| `head` | Head area | Condition areas |
| `skin` | Skin area | Condition areas |
| `leg` | Legs area | Condition areas |
| `tail` | Rear area | Condition areas |
| `gut` | Gut | Condition areas, diseases |
| `repro` | Reproductive system; hormones | Condition areas, medicine categories |
| `bone` | Bones and joints | Condition areas |
| `trend-down` | Falling (appetite) | Inspection: Poor appetite |

**Farm and measures**

| Icon | Meaning | Used on |
|---|---|---|
| `feed` | Feed | Feed tiles, Feeding |
| `weight` | Weight | Weight measure |
| `measure` | Measurements | Measurements & condition, Record body condition, Record backfat |
| `temperature` | Temperature | Sensors, measure |
| `humidity` | Air humidity | Sensors |
| `air` | Ventilation reading | Sensors |
| `fan` | A fan (a device) | Home unit: fan controls |
| `wrench` | A fault, maintenance | Report fault, Maintenance |
| `toolbox` | Toolbox tab | Bottom navigation |
| `spark` | Assistant | Assistant |
| `tag` | Ear tag and identity marks | Tag chips, Identity records, Ear notch |
| `tag-off` | No ear tag | Untagged pigs |

**Controls**

| Icon | Meaning | Used on |
|---|---|---|
| `back` | Back (arrow) | Unused; kept for page back |
| `back-chevron` | Back (chevron); up is now its alias | Page back buttons |
| `chevron` | Opens more | Rows, doors |
| `down` | Opens a picker | Pickers, section switcher |
| `arrow-down` | Sort or move down | Bundle |
| `close` | Close or remove | Drawers, Remove from batch |
| `check` | Done or selected | Checks |
| `plus` | Add (condition is its alias) | Add, Condition |
| `minus` | Subtract | Stepper, born dead |
| `search` | Search | Search |
| `scan` | Scan an ear tag | Scan |
| `filter` | Filters | Filter buttons |
| `more` | More actions: every Actions button and ··· menu | Actions buttons (Farrowing, Inspection, pig profile, scan footer); ··· icon buttons |
| `info` | How to read this | Schedule key |
| `link` | A link | Unused |
| `send` | Send a message | Assistant send |
| `upload` | Records waiting to upload | Header sync |
| `offline` | No signal | Toasts |
| `stop` | Stop scanning | Scan |
| `backspace` | Delete the last digit | Numpad |
| `profile` | A person (a worker) | No pig uses it after this round |
| `signal` | Phone signal (status bar only) | Status bar |
| `battery` | Battery (status bar only) | Status bar |

## Content rules

One lowercase name per glyph; no translated glyph keys. Labels follow their host's length and sentence-case rules. SVG contains no copy to truncate; Chinese labels remain visible beside it. Never add a screen-local path or use emoji for a verb.

## Accessibility

SVG is `aria-hidden="true"` and `focusable="false"`; the visible label or host aria-label provides the accessible name. No role, handler or tap target belongs to Icon. IconButton supplies a tap-min square target; Stepper and Numpad supply their key semantics.

## Tokens

`icon-stroke`, `icon-key-stroke`, `icon-pad-stroke`, `glyph-key`, `glyph-key-hero`, `glyph-pad`, and the host's glyph size and text colour tokens. Check trails retain their documented heavier stroke.

## Do / don't

Do use one glyph consistently for one recognised job. Don't turn a misspelt name into a chevron. Don't hide the word on a verb tile.

## Related components

[IconButton](../IconButton/README.md), [Heading](../Heading/README.md), [Row](../Row/README.md), [Status](../Status/README.md), [Stepper](../Stepper/README.md), [Numpad](../Numpad/README.md).

## Classification

Component with standard and key host presentations; names are content properties.

## Changelog

2026-11-03: icon round (review/icon-round). New: missing, batch, service, return-heat, death, truck, sample, count, history, tasks, undo, pen, fan. Redrawn: pig (one body for every kind), farrow (a sow with her piglet; no longer the pregnancy pulse), note (a sticky note) and record (a clipboard), no longer the same page, and chart (a line on axes; production keeps the bars). return and up became aliases. Added the meaning rules and the one-meaning table; usage swapped across Farrowing, Inspection (names only) and Home.

2026-10-19: added info (a circled i) for the Schedule's "How to read the board" button.
2026-10-10: Home task-card glyphs moved to the shared registry; added production and care.
2026-10-10: canonical aliases, empty unknown glyph, corrected grid, visible filled More dots and token stroke; retired prototype registries.
