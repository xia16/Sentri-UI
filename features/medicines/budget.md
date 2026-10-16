# medicines: information budget

Every fact the picker, the Brand list, the add levels, the treatment's medicine fields and the Medicines page display, with the worker's question it answers there. A fact not named here is not drawn. The owner's decisions of 2026-10-16 (first round, revision, addition; `PRD.md`) fix the structure; this budget decides what each part shows. It replaces the first round's product budget (Category → Medicine → Product), kept in git history.

## The second-line rule

A row's second line (meta) shows only what tells it apart from its siblings (ChoiceList). So: category, medicine, recent and brand rows have none; a search result names its category (search mixes categories, and two results may be told apart only by it). There is no strength field: when strength matters it is in the brand's name ("Amoxinsol 50%"), so it needs no line of its own. Nothing else earns a second line here.

## Inventory

Per medicine: name in EN and ZH, other names (PRRS: blue ear), category, starting list or farm-added, its brands, its default withdrawal period (prefilled for the starting list, sample values), the method and unit it was last given with, when last given and by whom.
Per brand: name (with its strength when that matters), its medicine, withdrawal period override, when last used.
Per category: name, short name, its medicines, counts.
Farm: the three most recent distinct medicines given (any worker), the task (treatment or vaccination).
Picker and Brand list state: the level, the search text, matches, no match.
Treatment: medicine, method, brand, dose, unit, each pig's own dose (typed) or the shared one, condition, note, the withdrawal in force and its date.

## Questions

At the picker (the worker holds a bottle, the pig is waiting): 1. Where am I? (title) 2. Is it one we gave lately? (recent rows) 3. If not, where is it? (search, categories) 4. Is this row the drug in my hand? (the name; in search, its category) 5. It is not in the list: can I add it? (the Add card, then Name and Category).

At the Brand list: 1. Which brand is the bottle? (its name, strength included when it matters) 2. Not listed: can I add it? (the Add card) 3. Does its label print a different withdrawal from the medicine's? (the optional details step).

On the treatment: 1. What was given, how, how much? (Medicine, Method, Brand, Dose) 2. Does any pig get a different dose? (the Adjust line; on Dose per pig, each box) 3. Where is this pig, and can I take it out? (search, Scan, Remove) 4. **When may these pigs go to slaughter?** (the withdrawal caption) 5. Can I save?

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
| Withdrawal period (days), with "Uses Amoxicillin's 14 days when empty" under it | Does this label print a different withdrawal from the medicine's? | optional; the hint says it overrides the default |
| Strength | — | **cut** (owner, round 3): in the name when it matters |
| Commit "Add" | — | waits until a withdrawal is typed; Back goes up to the list, the ✕ closes: both skip, the brand stays on the medicine's default |

### Record treatment (host)

| Fact | Question | Level | Decision |
|---|---|---|---|
| Medicine: its name | What was given? | Settled | kept |
| Caption under Medicine (its default) or under Brand (the brand's own): "Withdrawal period 14 days · until 26 Sep" | When may these pigs go to slaughter? | Watch, quiet (muted hint line) | where it sits says whose number it is; absent with no period or 0; replaces the Banner |
| Method: pre-filled from the medicine's last use | How? | Settled | pre-filled, editable |
| Brand (PickerField, "Optional", only once a medicine is chosen) | Which bottle? | Settled | "Select" until set |
| Dosage and Unit, side by side, each a labelled 48px field; unit remembered per medicine | How much, in what unit? | Settled | two fields |
| Several pigs: one navigate Row "2 pigs · 2.5 mL each" / "2 pigs · 1 adjusted", trailing "Adjust ›", only once a dosage is typed | Does every pig get the same? How many differ? | Settled (Row, the word + › of a row whose tap acts) | no per-pig inputs on the form |
| Dose per pig: search and Scan; each pig (tag, pen · stage) with its box pre-filled with the dose; adjusted: ink bold + "Adjusted"; "Remove pigs" switches to remove mode (× per row, Done) | Which pig gets what? Can I take one out? | Settled | live values; no remove control on the last pig |
| Condition (PickerField, Optional), Note (textarea, about 3 lines, Optional, 200 characters, a counter from 160) | Which finding? Anything to add? | Settled | kept |
| Order | What was given, then how much? | — | Medicine, Method, Brand, Dosage and Unit, (Adjust line), Condition, Note |

### Medicines page, a medicine's sheet, a brand's sheet (edit forms)

| Fact | Where | Question | Decision |
|---|---|---|---|
| Title "Medicines"; category rows (name) | page | Which kind? | no counts, no second line |
| Title: short category name; medicine rows (name) | page | Which medicine? | no second line |
| Medicine sheet title: its name | sheet header | Is this the one? | read-only for a starting-list medicine |
| Name (field) | medicine sheet | What do we call what we added? | farm-added medicines only |
| Withdrawal period (days) (field, prefilled) | medicine sheet | What withdrawal applies when no brand says otherwise? | editable; the usual case |
| Group "Brands": brand rows | medicine sheet | Which brands have we used? | no second line; "No brands used yet." when none |
| Brand sheet: Name, Withdrawal period (days) with "Uses <medicine>'s N days when empty" | brand sheet | Is the name right? Does its label differ from the default? | fields on the sheet; no Rename step |
| Delete brand / Delete medicine (text action, bottom) → "<name> leaves the list for everyone. Past records keep its name." | sheet bottom, confirm level | Can I remove it, and what happens to past records? | farm-added medicines and brands only; Delete in red on the confirm |
| Footer Back + Save | sheet | Is it kept? | Save waits until something changes |
| Who added it, when, how often used | — | — | **cut** (Audit) |

## Cut list

Brand not known; product form; strength as a field or a line (round 3); per-pig inputs on the form and checkboxes on dose rows (round 5); the per-pig dose sheet; "meat" in the withdrawal label (round 4); the second line on category, medicine, recent and brand rows; counts per category; when/by whom on recents; withdrawal on brand rows; Rename as a separate step; the source of the withdrawal days on the form; who added an entry and when; any count in a header.
