# medicines: information budget

Every fact the picker, the Brand list, the add levels, the treatment's medicine fields and the Medicines page display, with the worker's question it answers there. A fact not named here is not drawn. The owner's decisions of 2026-10-16 (first round, revision, addition; `PRD.md`) fix the structure; this budget decides what each part shows. It replaces the first round's product budget (Category → Medicine → Product), kept in git history.

## The second-line rule

A row's second line (meta) shows only what tells it apart from its siblings (ChoiceList). So: category, medicine, recent and brand rows have none; a search result names its category (search mixes categories, and two results may be told apart only by it). There is no strength field: when strength matters it is in the brand's name ("Amoxinsol 50%"), so it needs no line of its own. A summary row that opens a list ("Custom doses") carries its count as meta, because that is what it says. Nothing else earns a second line here.

## Inventory

Per medicine: name in EN and ZH, other names (PRRS: blue ear), category, starting list or farm-added, its brands, its default meat withdrawal (prefilled for the starting list, sample values), the method and unit it was last given with, when last given and by whom.
Per brand: name (with its strength when that matters), its medicine, meat withdrawal override, when last used.
Per category: name, short name, its medicines, counts.
Farm: the three most recent distinct medicines given (any worker), the task (treatment or vaccination).
Picker and Brand list state: the level, the search text, matches, no match.
Treatment: medicine, method, brand, dose, unit, each pig's own dose, condition, note, the withdrawal in force and its date.

## Questions

At the picker (the worker holds a bottle, the pig is waiting): 1. Where am I? (title) 2. Is it one we gave lately? (recent rows) 3. If not, where is it? (search, categories) 4. Is this row the drug in my hand? (the name; in search, its category) 5. It is not in the list: can I add it? (the Add card, then Name and Category).

At the Brand list: 1. Which brand is the bottle? (its name, strength included when it matters) 2. Not listed: can I add it? (the Add card) 3. Does its label print a different withdrawal from the medicine's? (the optional details step).

On the treatment: 1. What was given, how, how much? (Medicine, Method, Brand, Dose) 2. Does any pig get a different dose? (Custom doses: how many pigs, how many own doses) 3. **When may these pigs go to slaughter?** (Withdrawal until <date>) 4. Can I save?

At the Medicines page (a supervisor tidying the list): 1. Which medicines does the farm have, by category? 2. Which brands has the farm used for this one, and what withdrawal applies? 3. What happens to past records if I change it? (said on Delete; the record keeps its copy).

## Levels

### Picker, level 1 (Medicines; Vaccines from a vaccination)

| Fact | Where | Question | Level | Decision |
|---|---|---|---|---|
| Title "Medicines" / "Vaccines" | sheet header | Where am I? | Settled (the head's heaviest) | kept; no header line (the form is one Back away) |
| Search, "Search all options" | pinned at the top | Where is it, fast? | Settled | kept |
| Group label "Recently used" | above the recent rows | What are these rows? | Settled (Heading `group`) | kept; absent with the block |
| Recent row: the medicine's name | row | Is it the one I gave lately? | Settled | kept; **no second line** (siblings differ by name) |
| When / by whom last given | — | — | Audit | **cut** |
| Group label "Categories" | above the category rows | What are these rows, after the recents? | Settled | only when the recents are there |
| Category row: its full name | row | Where is it? | Settled | kept; no count, no second line |
| Vaccination: the vaccines (diseases) under the label "Vaccines" | after the recents | Which disease? | Settled | one category left: listed at once, no one-row level |

### Picker, level 2 (a category)

| Fact | Question | Decision |
|---|---|---|
| Title: the short name (Antibiotics · Pain relief · Parasite control · Vaccines · Hormones · Vitamins and iron · Other; ZH 抗生素 · 解热镇痛抗炎 · 驱虫 · 疫苗 · 生殖激素 · 维生素与补铁 · 其他) | Where am I? | short names fit the header at 360 (20 EN / 10 ZH) |
| Search, "Search all options" | It is not here: where else? | kept; searches every category; the head names the root while it has text |
| Medicine rows: the name | Is this it? | **no second line** |
| Current pick | Is this what is set? | ink ✓ |

### Search and no match

| Fact | Question | Decision |
|---|---|---|
| Result row: the medicine | Is this it? | kept |
| Result's second line: its category | Which one, when results come from several categories? | kept (the second-line rule); dropped in a vaccination (one category) |
| No match: one card `Add “<typed>”` | Can I add it? | nothing else (no "No options match") |

### Add a medicine

| Field | Question | Decision |
|---|---|---|
| Title "Add a medicine" | Where am I? | kept |
| Name (required, pre-filled from the search) | What is it called? | kept |
| Category (required, one pick; set already from inside a category or a vaccination) | Where will it be filed? | kept |
| Commit "Add" | Does adding pick it? | waits until both are set; a tap while waiting marks them Required |
| Medicine, form, method, dose, unit | — | **cut**: the medicine is what is added; method and unit are the treatment's |

### Brand list

| Fact | Where | Question | Decision |
|---|---|---|---|
| Title "Brand" | sheet header | Where am I? | kept; one level plus the details step (a drawer with levels: ✕, Back goes up) |
| Clear (top right) | while a brand is set | How do I remove it? | kept |
| Search "Search brands" | pinned | Which is it, fast? | kept |
| Group "Recently used": the three newest brands | when there are more than three | Which one do we use? | kept; one unlabelled list when three or fewer |
| Group "Other brands": the rest, A to Z | after the recents | Where is a less used one? | kept |
| Brand row: its name ("Amoxinsol 50%") | row | Which bottle? | **no second line**; strength is in the name when it matters |
| Withdrawal on a brand row | — | — | **cut**: it is the form's consequence notice |
| No match: `Add “<typed>”` | the body | Can I add it? | one card, nothing else; adds under this medicine for everyone and picks it |

### Add details (after adding a brand; optional, skippable)

| Field | Question | Decision |
|---|---|---|
| Title "Add details" | Where am I? | kept |
| Withdrawal (meat, days), with "Uses Amoxicillin's 14 days when empty" under it | Does this label print a different withdrawal from the medicine's? | optional; the hint says it overrides the default |
| Strength | — | **cut** (owner, round 3): in the name when it matters |
| Commit "Add" | — | waits until a withdrawal is typed; Back goes up to the list, the ✕ closes: both skip, the brand stays on the medicine's default |

### Record treatment (host)

| Fact | Question | Level | Decision |
|---|---|---|---|
| Medicine: its name | What was given? | Settled | kept |
| Method, unit: pre-filled from the medicine's last use | How, in what unit? | Settled | pre-filled, editable |
| Brand (optional row, full width, only once a medicine is chosen): "Brand · Optional", then its name under it | Which bottle? | Settled | OptionalRow face `row` |
| Dose (with its unit) | How much? | Settled | one field, one pig or all pigs |
| Custom doses (several pigs): "3 pigs · 1 own dose" | Does any pig get a different dose? | Settled (row meta) | kept; opens the page; the count of own doses only above zero |
| Custom doses page: each pig's tag, pen · stage, its dose on the right (muted when shared; ink with "Own dose") | Which pigs got what? | Settled | the checkbox stays (excludes a pig, the bulk convention); search and Scan for an ear tag |
| Condition, Note (optional rows) | Linked to which finding? Anything to add? | Settled | Note shows its first line |
| **Withdrawal until <date>**: Banner notice before Save, one line "N days for meat: these pigs go to slaughter no earlier than this date." | When may these pigs go to slaughter? | **Watch** (the only coloured block; the consequence of saving) | from the brand's override, else the medicine's default; absent when 0 or none |
| The source of the days (brand or default) | — | — | **cut**: the worker acts on the date; the Medicines page shows both |
| Order | What was given, then how much? | — | Medicine, Method, Brand, Dose, (Custom doses), Condition, Note, the notice |

### Medicines page, a medicine's sheet, a brand's sheet (edit forms)

| Fact | Where | Question | Decision |
|---|---|---|---|
| Title "Medicines"; category rows (name) | page | Which kind? | no counts, no second line |
| Title: short category name; medicine rows (name) | page | Which medicine? | no second line |
| Medicine sheet title: its name | sheet header | Is this the one? | read-only for a starting-list medicine |
| Name (field) | medicine sheet | What do we call what we added? | farm-added medicines only |
| Default withdrawal (meat, days) (field, prefilled) | medicine sheet | What withdrawal applies when no brand says otherwise? | editable; the usual case |
| Group "Brands": brand rows | medicine sheet | Which brands have we used? | no second line; "No brands used yet." when none |
| Brand sheet: Name, Withdrawal (meat, days) with "Uses <medicine>'s N days when empty" | brand sheet | Is the name right? Does its label differ from the default? | fields on the sheet; no Rename step |
| Delete brand / Delete medicine (text action, bottom) → "<name> leaves the list for everyone. Past records keep its name." | sheet bottom, confirm level | Can I remove it, and what happens to past records? | farm-added medicines and brands only; Delete in red on the confirm |
| Footer Back + Save | sheet | Is it kept? | Save waits until something changes |
| Who added it, when, how often used | — | — | **cut** (Audit) |

## Cut list

Brand not known; product form; strength as a field or a line (round 3); per-pig dose boxes and "Same dose for all" on the form (round 3); the second line on category, medicine, recent and brand rows; counts per category; when/by whom on recents; withdrawal on brand rows; Rename as a separate step; the source of the withdrawal days on the form; who added an entry and when; any count in a header.
