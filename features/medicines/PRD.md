# Medicines 药品

## Problem

Every treatment and vaccination names what was given. Before this feature the worker picked a placeholder "medicine" and an optional "brand" from a list that was the same for every medicine; the farm had no list of its own, nothing remembered what was used, nothing could be added from a treatment, and a typo could never be fixed. This feature is the farm's medicine list: choosing from it inside a record, adding to it when something is missing, the optional details a label prints (strength, withdrawal), and keeping it tidy.

## Who

The worker recording a treatment or vaccination with a bottle in hand (picks, sometimes adds). The supervisor who keeps the farm's list (brands, details, what the farm added).

## Anchor

None: the list has no lifecycle. Screens are grouped by surface: choosing (the picker in Record treatment and Record vaccination), adding, and the Medicines page.

## Rules

- **Category → Medicine** (owner, 2026-10-16, revision). Picking a medicine is a complete record.
  - Category: a fixed list, the same on every farm: Antibiotics; Pain relief and anti-inflammatory; Parasite control; Vaccines; Hormones and reproduction; Vitamins, minerals and iron; Other.
  - Medicine: the drug or active ingredient. Vaccines are named by the disease (PRRS, PCV2…), so a vaccination lists diseases.
  - **Every farm starts from the same categories and medicines, in English and Chinese** (`ux/system/medicines-catalogue.json`, a starting list to be checked by a vet). Farms add medicines and brands on top. Starting-list medicines cannot be renamed or deleted.
- **Brand is an optional field of the treatment**, an optional row that appears once a medicine is chosen. It lists the brands the farm has used for that medicine (the three most recent under "Recently used" when there are more). A search with no match shows one card, `Add “…”`, which adds the brand under that medicine for everyone and picks it. No brand chosen means no brand; there is no "Brand not known".
- **There is no product form.** Method is chosen on each treatment. The treatment remembers the last method and unit per medicine and pre-fills them.
- **Optional details, never required:**
  - **Strength** (free text: "15%", "100 mg/ml"), set on a brand. It shows wherever the brand is shown: the treatment's Brand row reads "Amoxinsol 50 · 50%", and the Brand list row's second line is the strength.
  - **Withdrawal period** (meat, days): a brand can have one (it is printed on its label); a medicine can have a default, used when no brand is chosen or the brand has none.
  - Entered: when a brand is added, an optional, skippable "Add details" step (Strength, Withdrawal); on the Medicines page, a brand's sheet (Strength, Withdrawal, Rename, Delete) and a medicine's sheet (its default withdrawal, its brands).
  - On a treatment: when the chosen brand, or the medicine's default, has a withdrawal, the form shows **"Withdrawal until <date>"** before Save, as a Banner notice (a consequence of the commit stated before the action it governs, as Record dead states its consequence).
  - **The saved record keeps a copy** of the strength, the withdrawal days and the date in force that day; later edits never change past records.
- **The second line (meta) shows only what tells a row apart from its siblings** (ChoiceList): category, medicine and recent rows have none; a search result names its category, because search mixes categories; a brand row shows its strength, because strength tells sibling brands apart.
- **The picker is one drawer with levels** (owner ruling B): the long size, one height across levels, the footer Back goes up a level, the ✕ at the top left closes it from any level.
  - Level 1: search, then up to three of the farm's most recent medicines (distinct, newest first, shared by every worker, filtered to the task: a vaccination shows vaccines only; absent when there are none), then the categories.
  - Level 2, a category: its medicines; one tap picks and closes.
  - Search, pinned at the top of every level ("Search all options"), matches English and Chinese names and common other names across every category.
- **Adding a medicine is manual only** (no barcode). A search with no match shows one card and nothing else: `Add “<typed>”`. It opens the add level: Name (pre-filled) and Category (required, one pick; already set when added from inside a category, or from a vaccination). Adding lists it for everyone and picks it.
- **The Medicines page** (a page, not a drawer), reached from Home → Toolbox → Medicines: the categories, then a category's medicines, then a medicine's sheet: its default withdrawal, its brands (each with its strength, withdrawal, Rename and Delete), and Rename and Delete for a medicine the farm added. Delete removes the entry from the picker; past records keep the name.
- **Hosts.** Record treatment, one pig and several (health-record): Medicine, Method, the optional Brand row, then the dose (several pigs: "Same dose for all" and each pig's dose), then the optional rows and the withdrawal notice. Record vaccination uses the same picker filtered to Vaccines.

## Scope

In: the picker (level 1 with and without recents, a category, search, no match), adding a medicine, the Brand list with its add card and details step, the withdrawal notice and the record's copy, the Medicines page, a medicine's sheet and a brand's sheet with their edits, Rename and Delete.

Out: the Record treatment and Record vaccination forms themselves (health-record; this feature changes their Medicine field, adds the Brand row and the withdrawal notice, and orders the batch form), prescriptions (prescriptions), barcode scanning.

## Decisions

- 2026-10-16 (owner): Category → Medicine → Product, a picker with levels, manual adding, rename and delete on a page (first round).
- 2026-10-16 (owner, revision): the picker picks a medicine; Brand is an optional field of the treatment with its own list and quick add; no product form; method and unit remembered per medicine; one rule for the second line; a starting catalogue for every farm; adding a medicine asks Name and Category; the page holds brands, and Rename and Delete for farm-added medicines only.
- 2026-10-16 (owner, addition): optional strength (brand) and meat withdrawal (brand, medicine default), never required; Withdrawal until <date> before Save; the record keeps a copy.
- Category titles at a level's header use short names to fit at 360 (this feature's budget): Pain relief, Hormones, Vitamins and iron.
- The withdrawal notice is a Banner notice: Banner states a consequence before the action it governs; danger is for destructive commits and correction for a review, neither of which this is.

Open:

- The starting list (categories and medicines, EN and ZH) is to be checked by a vet.
- Who may add, rename and delete, and edit strength and withdrawal (permissions): the prototype lets anyone.
- Whether milk withdrawal is ever needed (meat only for now).

Follow-ups (other features, not built here):

- Show a pig's or pen's withdrawal on the pig (pig-profile) and the pen, and flag a pig under withdrawal when it is moved or sold for slaughter (move). The record already keeps the date.

## Not supported

- **Barcode scanning** — owner decision: adding is manual only.
- **Product form (powder, injection, oral suspension)** — owner revision: method is chosen on the treatment.
- **Renaming or deleting a starting-list medicine or a category** — the starting list is the same on every farm.
- **Batch numbers, expiry and stock** — they belong to future inventory, not to the treatment.
- **Milk withdrawal, withdrawal by species or route** — meat only, one number per brand or medicine.
