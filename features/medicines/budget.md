# medicines: information budget

Every fact the picker, the add level, the Medicines page and a product's sheet display, with the worker's question it answers there. A fact not named here is not drawn. Owner's decisions of 2026-10-16 fix the structure (`PRD.md`); this budget decides what each part shows.

## Inventory

Per product: brand name, form (injection, oral powder…), its medicine, the medicine's ingredients, its category, the last method and unit used, when it was last given and by whom, how often it is given, whether it is the current pick.
Per medicine: name (a combination is its own medicine; a vaccine is named for its disease), ingredients, category, its products, whether it is new (on the add level).
Per category: name, its medicines, counts of medicines and products.
Farm: the three most recent distinct products given (any worker), the task (treatment or vaccination).
Picker state: the level, the search text, the matches, no match.

## Questions

At the picker (the worker holds a box or bottle and the pig is waiting):

1. Where am I? (the title: Medicines, a category, Add a product)
2. Is the thing I hold one we used lately? (the recent rows)
3. If not, where is it? (search, then the categories)
4. Is this row the box in my hand? (the brand, then its form; the medicine it belongs to where the row does not sit under it)
5. It is not in the list: can I add it, and what must I say? (the Add card, then Name, Medicine, Category only for a new medicine)

At the Medicines page (a supervisor tidying the list):

1. Which products does the farm have, by category and medicine? 2. Is this the product I mean to rename or delete? 3. What happens to past records? (said once, on Delete)

## Levels

The picker has no Act-now fact: nothing is due. The heaviest thing on each level is the answer to its first question, the title, then the rows.

### Picker, level 1 (Medicines; Vaccines for a vaccination)

| Fact | Where | Question it answers | Level | Decision |
|---|---|---|---|---|
| Title "Medicines" ("Vaccines" from a vaccination) | sheet header | Where am I? | Settled (the head's heaviest) | kept |
| Header line | — | — | — | **none**: the form is one Back away; the picker is about the catalogue, not the pig (`health-record/budget.md`, Headers) |
| Search box, "Search all options" | pinned at the top | Where is it, fast? | Settled | kept (the picker convention) |
| Group label "Recently used" | above the recent rows | What are these rows? | Settled (13px muted, Heading `group`) | **added**: the answer to "RECENT?"; absent with the block |
| Recent row, line 1: the brand ("Draxxin"); for a medicine given with brand not known, the medicine ("Meloxicam") | recent row | Is this the box in my hand? | Settled (row title) | kept |
| Recent row, line 2: the medicine and the form ("Tulathromycin · injection"); for brand not known, "Brand not known" | recent row meta | Is it the drug I mean, in the form I mean? A recent row has no medicine above it, so it carries it | Settled (meta, muted) | kept |
| When it was last given, by whom | — | — | Audit | **cut**: the order says newest first; who gave it answers nothing here |
| How many recent rows | — | — | — | **cut**: at most three, never counted |
| Group label "Categories" | above the category rows | What are these rows, after the recents? | Settled | kept **only when the recents are there**; alone, the title already names the level |
| Category row: the category's name | category row | Where is it? | Settled | kept; full name ("Pain relief and anti-inflammatory") |
| Count of medicines or products per category | — | — | — | **cut** (PickerField: categories in a single cascade carry no count) |

Vaccination: one category is left, so level 1 shows the recents (vaccines only) and then the vaccines' list as level 2 draws it (group labels and rows), with no one-row category level.

### Picker, level 2 (a category)

| Fact | Where | Question it answers | Level | Decision |
|---|---|---|---|---|
| Title: the category's short name | sheet header | Where am I? | Settled | **short names** (Title length, 20 EN / 10 ZH at 360): Antibiotics · Pain relief · Parasite control · Vaccines · Hormones · Vitamins and iron · Other; ZH 抗生素 · 镇痛消炎 · 驱虫 · 疫苗 · 激素与繁殖 · 维生素与铁 · 其他 |
| Search box | pinned at the top | It is not here: where else? | Settled | kept, "Search all options": searches every category; while it has text the head names the root |
| Group label: the medicine ("Meloxicam", "PRRS vaccine", "Trimethoprim + sulfadiazine") | above its products | Which drug are these products of? | Settled (Heading `group`, outside the panel) | kept; one panel of rows under each label, no card per medicine |
| Product row, line 1: the brand ("Metacam") | product row | Is this the box in my hand? | Settled (row title) | kept |
| Product row, line 2: the form ("Injection", "Oral suspension") | product row meta | Which of this brand's forms? | Settled (meta) | kept; **absent** for a product added on the farm (Add asks no form) |
| The medicine on the product row | — | — | — | **cut**: the group label above says it |
| Row "Brand not known" | last row of each medicine | I know the drug but not the brand | Settled | kept; records the medicine only |
| The current pick | its row | Is this what is set? | Settled | ink ✓ in the trail (ChoiceList single) |
| Last method and unit | — | — | — | **cut** here: pre-filled on the form instead (decision 4) |

### Search results and no match

| Fact | Where | Question | Level | Decision |
|---|---|---|---|---|
| Results grouped by medicine, the same group labels and product rows as level 2 | the body | Which of these is it? | Settled | kept: a match on a medicine or ingredient lists all its products and Brand not known; a match on a brand lists that brand's products only |
| The category of a result | — | — | — | **cut**: the worker is choosing a product, not a place |
| No match: one card, `Add “<typed>”` (a navigate row in one panel) | the body | Can I add it? | Settled | kept; **nothing else** (no "No options match" line) |

### Add a product

| Fact / field | Question it answers | Level | Decision |
|---|---|---|---|
| Title "Add a product" | Where am I? | Settled | kept (fits at 360: 13 EN, 4 ZH) |
| Name (Field, required, pre-filled from the search) | What is it called? | Settled | kept |
| Medicine (PickerField single, required): opens the level "Medicine": the category's medicines (from inside one) or all, grouped by category; search; `Add “<typed>”` when nothing matches | Which drug is it? | Settled | kept |
| Category (PickerField single, required) | Where will it be filed? | Settled | **only when the medicine is new**; pre-filled with the category the worker came from |
| Form, method, dose, unit | — | — | **cut**: not product fields (decision 3); method and unit are remembered from the first treatment |
| Commit "Add" | Does adding pick it? | Act (the one dark control) | waits until the required fields are set; a tap while waiting marks them "Required" |

### Record treatment (host) after a pick

| Fact | Question | Decision |
|---|---|---|
| Medicine trigger: the product as the box reads, brand and form ("Metacam · injection"); the medicine alone for Brand not known ("Meloxicam") | What did I pick? | kept; the path (category, medicine) stays in the sheet |
| Method, unit pre-filled from the product's last use | How is it given? | pre-filled, still editable |
| Brand optional row | — | **cut** |
| Batch: Medicine and Method first, then "Same dose for all" and each pig's dose in the remembered unit, then the optional rows | What was given, then how much? | reordered (decision 6) |

### Medicines page, a category, a product's sheet

| Fact | Where | Question it answers | Decision |
|---|---|---|---|
| Title "Medicines" | page header with Back | Where am I? | kept; no header line |
| Category rows (name, chevron) | one panel | Which kind? | kept; no counts |
| Title: the category's short name | page header | Where am I? | kept |
| Group label: the medicine | above its products | Which drug? | kept; a medicine with no products is absent (Brand not known is not a product) |
| Product row: brand, form as the second line | row | Is this the one? | kept, as in the picker |
| Product sheet title: the product's name; with its form when another product has the same name ("Metacam · injection") | sheet header | Is this the one I meant? | kept; the medicine is on the page behind |
| Rows "Rename", "Delete" | product sheet | What can I do to it? | verbs only (a menu drawer) |
| Rename level: Name (Field, pre-filled), commit "Rename" | What should it be called? | kept; waits until the name changes |
| Delete level: "Delete <name>?" and one line "It leaves the list for everyone. Past records keep its name." | What happens to past records? | said once, here; commit "Delete" in red |
| Who added a product, when, how often used | — | — | **cut** (Audit; no question here) |

## Cut list

Last given / by whom on recent rows; counts per category; the medicine on a product row under its label; a result's category in search; "No options match" when the Add card shows; form, method, dose and unit on Add; the Brand optional row; who added a product and when; counts in any header.
