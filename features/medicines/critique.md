# medicines: critique

Scope: choosing, adding and managing the farm's medicines (new feature, mode **new**). The picker is the one Record treatment and Record vaccination open (`health-record.treatment`, `health-record.treatment-batch`); the Medicines page and a product's sheet are new. Owner's decisions of 2026-10-16 are the brief (`features/medicines/PRD.md`, Decisions). Baselines: `origin/main` at `c6cc500`, `node scripts/shoot-screens.mjs` at 390 and 360, EN and ZH: `health-record.medicine-picker`, `health-record.treatment`, and the batch form (`health-record.treatment-batch`, registered by this change; on `c6cc500` it is the `selected` preset → Record treatment).

What is critiqued, as build.md asks in new mode, is the old UI: the medicine picker and Brand drawer on main, and the owner's rejected board (`board-final.png`, 2026-10-16), which is evidence of what not to do.

## References

| Job | Where it exists | Status | Baseline | Commit |
|---|---|---|---|---|
| Choose a medicine for a treatment | `health-record.medicine-picker` (inspection prototype, `medicinePicker()`) | in-design | `health-record.medicine-picker` 390/360 EN/ZH | c6cc500 |
| Record treatment, one pig | `health-record.treatment` | in-design | 390/360 EN/ZH | c6cc500 |
| Record treatment, several pigs | the `selected` preset → Record treatment (no atlas screen on main) | in-design | `health-record.treatment-batch` 390 EN | c6cc500 |
| Brand of a medicine, Add a brand | `record-optional` brand drawer (`recordOptionalEditor()`), no atlas screen | in-design | walked in the browser | c6cc500 |
| A catalogue drawer with levels, search across levels | `health-record.condition-picker` (`searchAllBody()`, `pickerHead()`) | in-design | — | c6cc500 |
| A list of a subject's items on a page, grouped | `pig-profile.full` (Heading group + Panel of Rows), More actions (house reference) | in-design / house reference | — | c6cc500 |
| Old UI | Figma 健康与治疗 (`references/figma/index.json`): drug names typed per treatment; no catalogue | — | — | — |

## Keep

- **One drawer with levels for the catalogue** (`health-record.medicine-picker`): the long size, one height from open to close (`sizing: 'hold'`), the ✕ at the top left at every level, the footer Back going up a level and leaving at the first (owner ruling B). The new picker keeps all of it.
- **Search pinned at the top of every level, saying "Search all options"** and searching the whole catalogue from any level, with the head naming the root while it searches (`searchAllBody()`, `searchHeader()`): the convention the condition picker set. Kept, and now at level 2 of the medicine picker too.
- **A single pick commits and closes; Back alone in the footer** (PickerField single, the drawer convention). Kept.
- **The trigger shows the pick, not the path** (PickerField cascade). Kept: the field shows the product.
- **Rows are ChoiceList rows: one row height, label over a quiet meta line, the trail on the right, rows split by hairlines inside one panel.** Kept for every list in the feature.
- **Record treatment's form as it stands** (page header with Back, Medicine, Method, Dose with its unit, optional rows below the required ones, the waiting Save): kept; only the Brand optional row goes (decision 1: the product is the brand).
- **The batch form's per-pig dose boxes and "Same dose for all"**: kept as drawn (the brief: only reorder).

## Problems

- **major** · The catalogue has no product level: a medicine is "Antibiotic A" with a form as its meta, and the brand is a second, optional field that lists the same two sample brands for every medicine (`availableBrands()`). The worker picks twice for one box in their hand, and the record can hold a brand that does not belong to the medicine. Owner decision 1: Category → Medicine → Product, the worker picks a product.
- **major** · Adding happens in the wrong place: "Add a brand" is the last row of the Brand drawer, always shown (ChoiceList README's adding sentence), and there is no way to add a medicine at all. Owner decision 3: adding starts from a search with no match, as one card, and asks Name, Medicine and (for a new medicine) Category only.
- **major** · Search inside a category on main searches that category only ("Search in Antibiotics", the PickerField default), unlike the condition picker, so a worker inside the wrong category finds nothing. Owner: "where is search?" on the category level of the rejected board (it had none). Evidence: `health-record.medicine-picker` notes, "Searches the level you are on".
- **major** · No recently used products: the farm gives the same few products again and again, each two levels deep (`health-record.condition-picker` issue "No recently used list", the same gap here).
- **major** · The rejected board's recent rows had nothing saying what they were (owner: "RECENT?"). A block of rows above the categories needs the group label every ChoiceList group has (Heading `group`), not a floating label or nothing.
- **major** · The rejected board drew each medicine as its own card with its own sub-title look and the category rows as another card under unlabelled recents (owner: "What is our convention on sub titles and cards?"). The convention: a group label (Heading `group`, 13px muted, outside the panel) over one panel of rows; no card inside a card, no hand-drawn sub-title.
- **major** · The rejected board's form was a fake: no page header, no Back, a count in the title (`Record treatment · 3 pigs`) (owner: "what is going on with the header?"). Headers law: the page header, Back top left, no count. The picker must open over the real Record treatment page.
- **major** · Batch Record treatment asks the doses before what was given: the pig list with "Same dose for all" sits on top and Medicine and Method are docked at the bottom, folded under "Treatment details". A dose means nothing until the medicine and its unit are known. Owner decision 6.
- **major** · Method and unit are asked from nothing every time, although the same product is given the same way (owner decision 4: the product remembers the last method and unit).
- **major** · No place to rename or delete a product, so a typo made while adding stays in everyone's picker (owner decision 5).
- **minor** · The sample catalogue is placeholders ("Antibiotic A", "Sample brand A"), which hides how long real names and combinations wrap (issue on `health-record.medicine-picker`).
- **minor** · Three of the owner's category names are longer than a sheet title's room at 360 (Headers law, Title length: about 20 English characters): "Pain relief and anti-inflammatory" (33), "Vitamins, minerals and iron" (27), "Hormones and reproduction" (25). A level's title needs a short name decided in the budget.

## Parts

| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| Picker drawer, its head (title, ✕) and footer Back | Sheet drawer via `sheet()` + `levels()` / `pickerHead()` | Sheet, Header (sheet), PickerField `pickerFooter` | keep |
| Search box | ChoiceList `choiceSearch` (via `searchAllBody`) | ChoiceList | keep; **fix** scope at level 2 (all options) |
| Category rows | ChoiceList navigate rows in one group | ChoiceList | keep |
| Recent products | — (board: page-built rows with no label) | ChoiceList group with a title (Heading `group`) | **fix** (add) |
| Medicine labels over product rows at level 2 | — (board: a card per medicine) | ChoiceList `choiceGroup({ title })`: the group label over one panel | **fix** (add) |
| Product rows | ChoiceList single rows (were medicine rows) | ChoiceList | **fix**: a product per row, "Brand not known" last in each medicine |
| No-match line "No options match" | ChoiceList `choiceEmpty` | ChoiceList | **cut** for this picker: the Add card replaces it (decision 3) |
| Add card | — (Brand: an always-shown "Add a brand" row) | ChoiceList navigate row, one group | **fix** |
| Add level fields | Brand drawer: Field "Brand name" | Field (Name), PickerField (Medicine, Category) | **fix** |
| Brand optional row and Brand drawer | Field `optionalRow` + page-built drawer | — | **cut** (the product is the brand) |
| Batch form order | `bulkListOverlay()` (list on top, details docked below) | Sheet page, the same fields | **fix**: order only |
| Medicines page, a category, a product's sheet | — | Sheet page + Header (page) + Heading `group` + Panel of Row; Sheet drawer with ChoiceList rows and Field | **fix** (add) |

## Self-crit

The owner's six decisions of 2026-10-16 fix the structure (levels, what each level lists, adding, the page), so directions differ only in the calls left open: how recent rows are labelled, whether the categories carry a label, where search sits at level 2, and how the batch form is ordered. Each is held against its baseline (`c6cc500`) and the house references (More actions: a menu drawer of rows in one panel; the Farrowing room: a quiet head, the work in the body).

#### Round 1 (renders at 390 EN beside `c6cc500`)
- Recents: **A** a group label "Recently used" over the recent rows, "Categories" over the category rows (chosen); **B** no label, the recents set apart by space only (the rejected board: "RECENT?"); **C** a meta word "Recent" on each row (repeats one fact three times). A is the ChoiceList/Heading group convention: every run of rows that is not the level's own list is a group with a heading.
- Categories label: always shown, or only when the recents are there. Alone under "Medicines", a "Categories" label repeats the title; with recents it is needed so the categories do not read as more recents. Chosen: only with the recents (`medicines.picker-first`).
- Search at level 2: pinned at the top of every level, "Search all options", spanning all categories (chosen, the condition picker's convention); against "Search in Pain relief" (PickerField's default), which finds nothing when the worker opened the wrong category, the case the owner asked about.
- Level 2: a group label per medicine over one panel of its products (chosen) against a card per medicine with its own title look (the rejected board). The first is ChoiceList's sectioned list: labels outside, rows inside one panel, no card on a card.
- Batch: the fields as on the one-pig form at the top, then the pig card, then the optional rows (chosen) against keeping the dock and only swapping it to the top (a fold and a sticky surface at the top of a page, above the work, for no reason).
- Problems fixed: product level (rows are products, Brand not known last); adding from a no-match search only, one card; search at level 2; recents with a label; group labels not cards; real page header behind the picker (it opens over Record treatment); batch order; method and unit pre-filled (batch screen shows Draxxin → Injection, mL); a Medicines page with rename and delete; real sample names (long ones wrap: "Trimethoprim + sulfadiazine", "Parvovirus and erysipelas vaccine"); short level titles.
- Header check found the add level 42px from the hairline (the Field's own 18px top margin); fixed in the layout CSS (`medicine-add-fields`), now 24px.
- Keep: one drawer height across levels, the ✕ and Back, a pick that commits, the trigger showing the pick, ChoiceList rows, the form's anatomy: all as strong.
- Squint (level 1): the title, the search box, then the recent rows; categories after. Level 2: the title, the first medicine label, its products. Batch: the title, Medicine, Method, then the dose card.
- Cluttered, flat or bulky against the original: the picker adds one quiet label per group and nothing bold; level 2 is longer than the old two-row category but each row now is one box in the hand. The batch page loses its fold and its sticky dock: lighter. Not c1 (no type enlarged), not c2 (every list keeps its panel and label), not c3 (no extra boxes; a medicine is a label, not a card).
- **Better because** the worker picks the box in their hand in one tap from the recents or two from a category, finds it from any level by search, can add what is missing without leaving the record, and the form asks what was given before how much.

#### Final look (`1d7eeab`, the screens of the pushed head; renders at 390 and 360 in EN and ZH beside `c6cc500`)
- Screens: `medicines.picker`, `.picker-first`, `.category`, `.search`, `.vaccines`, `.search-none`, `.add`, `.add-medicine`, `.add-new-medicine`, `.page`, `.page-category`, `.product`, `.rename`, `.delete`; moved: `health-record.treatment` (Brand row gone), `health-record.treatment-batch` (new screen, reordered), `health-record.medicine-picker` (now the same screen as `medicines.picker`).
- Every title fits at 360 in EN and ZH (header check: 0 defects on 17 screens); spacing 0 defects; legibility strict passes on the changed screens; check-states 6 failing states, the same 6 as `c6cc500` (Banner, ConditionTag, Facts).
- Known: the batch screen's Medicine trigger shows the browser's focus ring because the atlas replays taps as clicks and the picker returns focus to its trigger; a finger tap draws none. Record treatment's own labels (Medicine, Method, Same dose for all) are not in the registry yet and stay English in ZH, as on main.
- **Better because** each level answers one question with the system's own parts, and nothing the owner rejected (unlabelled rows, cards per medicine, a fake header) is left.

# Revision (owner, 2026-10-16): a medicine, not a product; brand, strength and withdrawal are optional

The owner reviewed the first round's screens (head `1d7eeab`) and revised the decisions (`PRD.md`, Decisions). The first round's critique above stands as the critique of the old UI; this block critiques the first round itself, against the revised decisions.

### Keep (from the first round)

- One drawer with levels, its ✕ and footer Back, one height across levels; search pinned at every level, "Search all options", across every category; "Recently used" and "Categories" as group labels; the no-match Add card and nothing else; the add level with its waiting "Add"; the Medicines page as a page; the batch form asking what was given before the doses.

### Problems

- **major** · The picker made the worker choose a product (brand and form) to record a treatment, with a "Brand not known" row under every medicine: the owner wants picking a medicine to be a complete record and the brand an optional field (revision 1). Evidence: owner, on `medicines.category`.
- **major** · Product form (injection, oral suspension) sat in names and second lines, but the method is chosen on the treatment (revision 2).
- **major** · Second lines had no one rule: recents carried medicine · form, products their form. The ChoiceList rule (meta only to tell siblings apart) gives: none on category, medicine and recent rows, the category on search results, the strength on brand rows (revision 3, addition).
- **major** · The list was invented sample data; every farm needs the same starting list in EN and ZH (revision 4).
- **major** · Adding asked a Medicine pick inside the add level; the medicine is what is added (revision 5).
- **major** · The page managed products; it must hold a medicine's brands, with Rename and Delete for what the farm added only (revision 6).
- **major** · No place for what a label prints (strength, withdrawal), and nothing told the worker when treated pigs may go to slaughter (addition).
- **minor** · The single form's dose unit button was 46px wide with a one-letter unit ("g"), under the 48px target (legibility check on `health-record.treatment`).

### Parts (revised)

| Part | Drawn by | Component | Keep / fix / cut |
|---|---|---|---|
| Product rows, Brand not known rows, form meta | ChoiceList rows | — | **cut** |
| Medicine rows (category, recents, search) | ChoiceList single rows | ChoiceList | **fix**: one row per medicine; meta by the rule |
| Starting list | `medicines-catalogue.json` (one data file the prototype loads) | — | **fix** (add) |
| Brand optional row | Field `optionalRow` | Field | **fix** (add back, only once a medicine is chosen; reads brand · strength) |
| Brand list, Add card, Add details step | Sheet drawer with levels, ChoiceList, Field | the same | **fix** (add) |
| Withdrawal until <date> | Banner, tone notice | Banner (a consequence stated before the action it governs) | **fix** (add) |
| Medicine sheet (default withdrawal, brands, Rename/Delete if farm-added), brand sheet (strength, withdrawal, Rename, Delete) | Sheet drawer with levels, PickerField triggers, ChoiceList rows, Field | the same | **fix** |
| Dose unit button | page-built `bulk-unit-button` | — | **fix**: a 48px minimum target (layout CSS) |

### Self-crit

#### Round 2 (renders at 390 and 360, EN and ZH, beside the first round and `c6cc500`)
- Withdrawal notice: **A** Banner notice before Save (chosen); **B** a quiet line under the Brand row (reads as a fact of the brand, not the consequence of saving; a worker can miss it); **C** in the footer beside Save (the footer holds Back and the primary only). Banner's job is "a consequence or pending condition before the action it governs"; danger is for destructive commits and correction for a review, so notice.
- Brand list: three or fewer brands as one unlabelled list; more, the three newest under "Recently used" and the rest A to Z under "Other brands", so the labels say why the order changes.
- Add details: a skippable level after Add “…” (Back goes up to the list with the new brand ticked, ✕ closes) against two optional rows on an add level before the brand exists (makes the common case, name only, two taps longer).
- Problems fixed: picking a medicine records it; Brand is an optional row with its own list, recents and Add card; no form anywhere; the second-line rule holds on every list; 58 starting medicines in EN and ZH from one file; Add asks Name and Category only; the page shows brands, details, and Rename/Delete only for what the farm added; Withdrawal until <date> before Save (brand's own, else the medicine's default) and the record keeps a copy; the unit target is 48px.
- Keep: as strong; the first round's levels, search, labels and add card are unchanged.
- Squint (treatment): the title, Medicine, then the withdrawal notice (the one coloured block, the consequence of saving), then Save. Picker: the title, search, the recent names.
- Cluttered, flat or bulky: every list lost its second line except where it tells rows apart; the picker's rows halved in count (no product rows). One notice added to the form, only when a withdrawal is in force. Not c1, c2 or c3.
- **Better because** a treatment is one pick, the bottle's brand and strength are there when the worker wants them and never in the way, and the form says when the pigs may go to slaughter before it is saved.

#### Final look (the screens of this push; renders at 390 and 360 in EN and ZH)
- Header check on the 25 changed screens: 0 defects (a first render titled the withdrawal edit "Default withdrawal (meat)", 235px at 360; now "Withdrawal (meat)"). Spacing 0; strict legibility passes on the changed screens; check-states 6 failing states, the same 6 as `c6cc500`; npm test 723 pass.
- Known: the atlas replays taps as clicks, so a trigger the picker returns focus to shows the browser's focus ring; a finger draws none. Record treatment's own labels (Method, Same dose for all) are not in the registry and stay English in ZH, as on main. In the batch form the withdrawal notice sits below the optional rows and scrolls under the footer at 360; it is reached by scrolling, as the rows above it.

# Round 3 (owner, 2026-10-16): full-width optional rows, one batch dose, edit forms, no strength, prefilled withdrawals

### Problems (from round 2's screens)

- **major** · Two optional faces on one form: half-width "+" cards for empty optionals and a filled card with a pencil (owner). OptionalRow's `face:'row'` is the one full-width face (Field README: a sheet gives its optionals one face on one track).
- **major** · The batch form grew with the pigs (a dose box per pig under "Same dose for all"); one Dose applies to most batches, and a few pigs differ (owner).
- **major** · Strength as a field and a second line: many medicines have no meaningful strength (vaccines in doses, premixes and powders vary) (owner). It belongs in the brand's name when it matters.
- **major** · Withdrawal defaults were empty for most medicines, so the notice rarely appeared; the default is the usual case and should ship prefilled (owner).
- **major** · The Medicines page's sheets were menus of steps (Rename, Strength, Withdrawal, each a level); an edit form shows the fields on the sheet and saves once (owner).
- **minor** · `medicines.search-none` typed "Gamithro", which matches the farm-added Gamithromycin: not a no-match state (owner). Now "Cefquinome".

### Self-crit

#### Round 3 (renders at 390 and 360, EN and ZH)
- Custom doses as a **page**, not a drawer level: the list grows with the pigs and holds a scan (Sheet: a surface that fills the screen, a scan, is a page), and the pig's dose sheet must open over it; a drawer level would put a drawer on a drawer. Its Back (top left) returns to the form.
- Found pig: Inspection has no highlight-and-scroll pattern; its patterns are Find a pig's results (search narrows the list) and Scan (opens the pig). Followed both: search narrows the list to the tag; Scan opens that pig's dose. Not the owner's "highlight and scroll into view" literally; said in the hand-back.
- Checkbox kept on the Custom doses rows: every bulk page lets a pig be taken out (health-record PRD: "let a pig be excluded"); without it there is no way to exclude one.
- Delete as Button's text register (ink): the system has no red text action; the red is on the confirm level. Filed as open.
- Problems fixed: one optional face, full width; the form no longer grows with the pigs ("2 pigs · 1 own dose"); no strength anywhere (brand names carry it: "Amoxinsol 15%", "Amoxinsol 50%"); every non-vaccine starting-list medicine has a default withdrawal (sample, verify before release); edit forms with Save; a true no-match.
- Squint (batch): the title, Medicine, Dose, then the withdrawal notice. Custom doses: the search, then the tags with their doses.
- **Better because** the form is the same height for 2 pigs or 200, every optional reads the same way, and a brand or medicine is fixed in one place with one Save.

#### Final look (the screens of this push; 390 and 360, EN and ZH)
- Header check 0, spacing 0 on the 26 changed screens; strict legibility passes on them; check-states 6 failing, the same 6 as `c6cc500`; npm test passes.
- Known: a trigger the atlas returns focus to shows the browser's focus ring (a finger draws none); Record treatment's own labels (Method) stay English in ZH, as on main.
