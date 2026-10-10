**Status: in design.** New. It replaces Inspection's hand-built `.recorded-tag` pills (and the finding page's care block).

# ConditionTag

ConditionTag names a **recorded health condition** on an animal, with its day count and its care level: `Thin · Day 3`, `Arthritis · 12 days`. Use [Status](../Status/README.md) instead for a workflow state (Active, Done, Late), [Banner](../Banner/README.md) for a message, and [TaskChips](../TaskChips/README.md) for a filter.

## When to use / when not
- **Use** wherever a condition recorded on a pig is shown: the pig list, the pig profile, the finding (condition) page header.
- **Don't** use for a state of the task (Status), a choice the worker makes (ChoiceList), or free text (a note).

## Anatomy
- **Tag:** icon (`glyph-tag`, 12px) + name + optional day count, one pill, `tag-height` (24px) tall, 10px/600 with the day at 400, `radius-chip`, 1px border. The care-level word is visually hidden in the tag and in `title`.
- **Detail:** a mark tile (`row-icon`, 34px, tinted by care) + the care-level word (14px/500, `ink`) + a meta line (`name · day`, 11px `muted`) + an optional note (13px).

## Care levels (the states)
The care level is a recorded fact, not a colour. Monitor and Treat share amber on purpose (one colour map); they differ by **icon and word**: Monitor shows the eye icon, Treat shows the syringe icon and the visible word `Treat`, Hospital the hospital icon and the word `Hospital` (red). In the detail the full care word is printed.

| Care | Level | Means | Colours | Icon |
|---|---|---|---|---|
| `attention` | `monitor` | watch it | `amber` on `amber-wash`, `pending-border` | monitor |
| `attention` | `treat` | treat in place | `amber` on `amber-wash` | treat |
| `attention` | `hospital` | move to the hospital pen | `red` on `red-wash`, `chip-red-border` | hospital |
| `ongoing` | | recorded, no action needed | `ink-2` on `well`, `line` | note |
| `resolved` | | recovered | `green` on `green-wash`, `chip-green-border` | check |
| `notice` | | a standing instruction on the animal (`Feed held`, `No feed`), not a condition | `muted`, outline | the caller's (`feed`) |

The colours follow the Status map: green is done (resolved), amber needs attention, red is the hospital pen.

## Variants
- **Tag** (`variant: 'tag'`, default): in a row, several per line. Used by Inspection's pig list and the profile's health list.
- **Detail** (`variant: 'detail'`): at the head of a condition's record page. Used by Inspection's finding page.
- **Mark** (`variant: 'mark'`): just the care icon tile, for the icon slot of a Row (Inspection's attention list). It replaces the hand-built care-tinted row.

## States
| State | Tag | Detail |
|---|---|---|
| Needs attention (monitor, treat, hospital) | drawn | drawn |
| Ongoing | drawn | drawn |
| Resolved | drawn | drawn |
| Notice | drawn | not used |
| Pressed, selected, disabled | none: the Row or Button around it owns them (the tag is never a target) | none |
| Error, loading | none | none |
| Empty | absent: no condition, no tag (the list shows `—`) | absent |
| Long name | the name ends in an ellipsis; the icon and day stay | wraps |
| Chinese | `食欲差 · 第3天` fits | fits |
| Pending removal (`pending`) | muted, struck name, drawn inside the component | n/a |
| Overflow in a line | the host folds the extra tags into `+N` (Inspection's `fitRecordedTags`) | n/a |

## Behaviour
- `conditionTag({ name, day, care, level, careText, note, icon, variant, id, className, strs, args })`. `care` defaults to `ongoing`; `level` defaults to `monitor` when `care` is `attention`. `careText` is the care-level word, localized by the caller (default English: Monitor, Treat in place, Hospital pen, Ongoing, Resolved).
- `day` is text the caller writes: `Day 3` while it needs attention, `12 days` while it is ongoing.
- No events. A tag inside a tappable row is carried by that row's tap target (48px).

## Content rules
- Name: the catalogue name, sentence case, ideally under 20 characters; the tag truncates with an ellipsis at the line's width. Day: `Day 3`, `12 days`, `第3天`. Care word: under 20 characters.
- One tag per condition. The tag never repeats the care word in text beside it.

## Accessibility
- The tag is text: name, day and (visually hidden) care word read in order, `Thin Day 3 · Monitor`. The icon is `aria-hidden`.
- Colour, icon and word differ for every care level, so no level is colour-only. The row that holds the tags carries an `aria-label` that lists them.
- Not a target; the screen reader reads it as text.

## Do / Don't
- Do use the care level to pick the look; never choose a colour per screen.
- Do keep the tag one size everywhere (no 11px "in the overview" variant).
- Don't use it for Active, Done, Late (Status) or as a button.
- Don't put a second badge beside it that says the same care level.

## CSS variables
`--ink`, `--ink-2`, `--muted`, `--line`, `--well`, `--amber`, `--amber-wash`, `--pending-border`, `--red`, `--red-wash`, `--chip-red-border`, `--green`, `--green-wash`, `--chip-green-border`, `--row-icon`, `--row-icon-bg`, `--row-icon-ink`, `--radius-chip`, `--radius-segment`, `--glyph-tag`, `--tag-height`, `--space-2|4|6|12`, `--type-meta-size`, `--type-description-size`, `--type-button-size`, `--type-row-title-size`.

## Related
| Component | Use it for |
|---|---|
| [Status](../Status/README.md) | a workflow state (Active, Done, Late) |
| [Banner](../Banner/README.md) | a message that needs reading |
| [Row](../Row/README.md) | the list row that holds the tags and owns the tap |
| [Facts](../Facts/README.md) | the profile's other recorded facts |

## Classification
**Component** (used by health-record, pig-profile and inspection.walk). `tag` and `detail` are its **variants**.
