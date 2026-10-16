# medicines: information budget

Every fact the picker, the Brand list, the add levels, the treatment's medicine fields and the Medicines page display, with the worker's question it answers there. A fact not named here is not drawn. The owner's decisions of 2026-10-16 (first round, revision, addition; `PRD.md`) fix the structure; this budget decides what each part shows. It replaces the first round's product budget (Category → Medicine → Product), kept in git history.

## The second-line rule

A row's second line (meta) shows only what tells it apart from its siblings (ChoiceList). So: category, medicine and recent rows have none; a search result names its category (search mixes categories, and two results may be told apart only by it); a brand row shows its strength (two brands are told apart by it; it is also what the worker checks against the bottle). Nothing else earns a second line here.

## Inventory

Per medicine: name in EN and ZH, other names (PRRS: blue ear), category, starting list or farm-added, its brands, its default meat withdrawal, the method and unit it was last given with, when last given and by whom.
Per brand: name, its medicine, strength, meat withdrawal, when last used.
Per category: name, short name, its medicines, counts.
Farm: the three most recent distinct medicines given (any worker), the task (treatment or vaccination).
Picker and Brand list state: the level, the search text, matches, no match.
Treatment: medicine, method, brand, dose, unit, the withdrawal in force and its date.

## Questions

At the picker (the worker holds a bottle, the pig is waiting): 1. Where am I? (title) 2. Is it one we gave lately? (recent rows) 3. If not, where is it? (search, categories) 4. Is this row the drug in my hand? (the name; in search, its category) 5. It is not in the list: can I add it? (the Add card, then Name and Category).

At the Brand list: 1. Which brand is the bottle? (brand name) 2. Which of two similar brands? (strength) 3. Not listed: can I add it? (the Add card) 4. Does the label print a strength or a withdrawal I should keep? (the optional details step).

On the treatment: 1. What was given, how, how much? (Medicine, Method, Brand, Dose) 2. **When may these pigs go to slaughter?** (Withdrawal until <date>) 3. Can I save?

At the Medicines page (a supervisor tidying the list): 1. Which medicines does the farm have, by category? 2. Which brands has the farm used for this one, and what do their labels say? 3. What happens to past records if I change it? (said on Delete; the record keeps its copy).

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
| Brand row: name; second line its strength | row | Which bottle, and which of two similar ones? | strength kept (the second-line rule); absent when not set |
| Withdrawal on a brand row | — | — | **cut** here: it is the form's consequence notice |
| No match: `Add “<typed>”` | the body | Can I add it? | one card, nothing else; adds under this medicine for everyone and picks it |

### Add details (after adding a brand; optional, skippable)

| Field | Question | Decision |
|---|---|---|
| Title "Add details" | Where am I? | kept; the brand's name is on the form behind, one ✕ away |
| Strength (free text) | What strength does the label print? | optional |
| Withdrawal (meat, days) | How long before these pigs may go to slaughter, by the label? | optional |
| Commit "Add" | — | waits until either is typed; Back goes up to the list, the ✕ closes: both skip, the brand stays |

### Record treatment (host)

| Fact | Question | Level | Decision |
|---|---|---|---|
| Medicine: its name | What was given? | Settled | kept |
| Method, unit: pre-filled from the medicine's last use | How, in what unit? | Settled | pre-filled, editable |
| Brand (optional row, only once a medicine is chosen): "Amoxinsol 50 · 50%" | Which bottle? | Settled | kept; strength after the name |
| **Withdrawal until <date>**: Banner notice before Save, with one line "N days for meat: these pigs go to slaughter no earlier than this date." | When may these pigs go to slaughter? | **Watch** (the only coloured block; the consequence of saving) | from the brand's own days, else the medicine's default; absent when neither (or 0) |
| The source of the days (brand or default) | — | — | **cut**: the worker acts on the date, not its source; the Medicines page shows both |
| Order | What was given, then how much? | — | Medicine, Method, Brand, Dose (several pigs: the dose card), Condition, Note, withdrawal |

### Medicines page, a medicine's sheet, a brand's sheet

| Fact | Where | Question | Decision |
|---|---|---|---|
| Title "Medicines"; category rows (name) | page | Which kind? | no counts, no second line |
| Title: short category name; medicine rows (name) | page | Which medicine? | no second line (starting list and farm-added alike) |
| Medicine sheet title: its name | sheet header | Is this the one? | kept |
| Default withdrawal (meat): "14 days" / "Not set" | medicine sheet, first | What withdrawal applies when no brand says? | editable (Update) |
| Rename, Delete | medicine sheet | Can I fix or remove what we added? | **farm-added medicines only** |
| Group "Brands": brand rows, strength as second line | medicine sheet | Which brands have we used? | kept; "No brands used yet." when none |
| Brand sheet title: its name | sheet header | Is this the one? | kept |
| Strength; Withdrawal (meat) ("Not set" until entered) | brand sheet | What does its label print? | each editable (Update) |
| Rename, Delete | brand sheet | Can I fix or remove it? | kept |
| Delete level: "<name> leaves the list for everyone. Past records keep its name." | Delete | What happens to past records? | said once, here; commit "Delete" in red |
| Who added it, when, how often used | — | — | **cut** (Audit) |

## Cut list

Brand not known; product form; the second line on category, medicine and recent rows; counts per category; when/by whom on recents; withdrawal on brand rows; the source of the withdrawal days on the form; who added an entry and when; any count in a header.
