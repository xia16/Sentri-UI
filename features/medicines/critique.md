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

Directions, rounds and the final look follow, after the budget (`budget.md`) and the first renders.
