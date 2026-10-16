# Medicines 药品

## Problem

Every treatment and vaccination names what was given. Before this feature the worker picked a placeholder "medicine" and an optional "brand" from a list that was the same for every medicine; the farm had no list of its own, nothing remembered what was used, nothing could be added from a treatment, and a typo could never be fixed. This feature is the farm's medicine list: choosing from it inside a record, adding to it when something is missing, the withdrawal period a label prints, and keeping it tidy.

## Who

The worker recording a treatment or vaccination with a bottle in hand (picks, sometimes adds). The supervisor who keeps the farm's list (brands, details, what the farm added).

## Anchor

None: the list has no lifecycle. Screens are grouped by surface: choosing (the picker in Record treatment and Record vaccination), adding, and the Medicines page.

## Rules

- **Category → Medicine** (owner, 2026-10-16, revision). Picking a medicine is a complete record.
  - Category: a fixed list, the same on every farm: Antibiotics; Pain relief and anti-inflammatory; Parasite control; Vaccines; Hormones and reproduction; Vitamins, minerals and iron; Other.
  - Medicine: the drug or active ingredient. Vaccines are named by the disease (PRRS, PCV2…), so a vaccination lists diseases.
  - **Every farm starts from the same categories and medicines, in English and Chinese** (`ux/system/medicines-catalogue.json`, a starting list to be checked by a vet). Farms add medicines and brands on top. Starting-list medicines cannot be renamed or deleted.
- **Brand is an optional field of the treatment**: a PickerField labelled "Brand" with a grey "Optional", styled like Medicine and Method ("Select" until set), that appears once a medicine is chosen. It lists the brands the farm has used for that medicine (the three most recent under "Recently used" when there are more). A search with no match shows one card, `Add “…”`, which adds the brand under that medicine for everyone and picks it, then offers an optional, skippable details step (its withdrawal). No brand chosen means no brand; there is no "Brand not known".
- **There is no strength field and no product form** (owner, round 3): not every medicine has a meaningful strength (vaccines are counted in doses; premixes and powders vary). When strength matters it is part of the brand's name ("Amoxinsol 50%"), so two strengths are two brand entries ("Amoxinsol 15%", "Amoxinsol 50%"). Method is chosen on each treatment. The treatment remembers the last method and unit per medicine and pre-fills them.
- **Withdrawal period (days), never required.** For pigs it is always the meat withdrawal, so every label reads "Withdrawal period (days)" (ZH 休药期（天）):
  - **The medicine's default is the usual case.** Every starting-list medicine ships with a default (vaccines none: usually 0 or not applicable), which the farm can change on the Medicines page. The defaults are **sample values**, to be verified against the official withdrawal periods (China: MOA Announcement No. 278 and its updates) before release; they are not authoritative.
  - **A brand overrides it only when its label differs.** The brand's field says so: "Uses Amoxicillin's 14 days when empty".
  - On a treatment: once a medicine is chosen, a muted caption in the field's hint slot reads **"Withdrawal period 14 days · until 26 Sep"**: under Medicine for its default, under Brand when the chosen brand has its own period (where it sits says whose number it is). No period, or 0: no caption. (In place, 2026-10-16: replaces the Banner notice.)
  - **The saved record keeps a copy** of the withdrawal days and date in force that day; later edits never change past records.
- **The second line (meta) shows only what tells a row apart from its siblings** (ChoiceList): category, medicine, recent and brand rows have none; a search result names its category, because search mixes categories.
- **The picker is one drawer with levels** (owner ruling B): the long size, one height across levels, the footer Back goes up a level, the ✕ at the top left closes it from any level.
  - Level 1: search, then up to three of the farm's most recent medicines (distinct, newest first, shared by every worker, filtered to the task: a vaccination shows vaccines only; absent when there are none), then the categories.
  - Level 2, a category: its medicines; one tap picks and closes.
  - Search, pinned at the top of every level ("Search all options"), matches English and Chinese names and common other names across every category.
- **Adding a medicine is manual only** (no barcode). A search with no match shows one card and nothing else: `Add “<typed>”`. It opens the add level: Name (pre-filled) and Category (required, one pick; already set when added from inside a category, or from a vaccination). Adding lists it for everyone and picks it.
- **The Medicines page** (a page, not a drawer), reached from Home → Toolbox → Medicines: the categories, then a category's medicines. A medicine's sheet and a brand's are **edit forms**: their fields on the sheet (a brand: Name, Withdrawal; a farm-added medicine: Name, Default withdrawal; a starting-list medicine: its default withdrawal only, its name read-only), the medicine's brands as rows, **Delete** as a text action at the bottom opening a confirm level ("Past records keep its name"), footer Back + Save. Starting-list medicines have no Delete. Delete removes the entry from the picker; past records keep the name.
- **Hosts.** Record treatment, one pig and several (health-record): Medicine, Method, Brand (optional), Dose (a number and its unit on one line; the unit remembered per medicine), Condition (optional PickerField; its picker unchanged until the condition rework), Note (optional), then the withdrawal notice. Optional fields are ordinary labelled fields with a grey "Optional" (owner, rounds 4 and 5; the Field law and component change come as their own shared PR).
  - **Note:** a textarea about three lines tall, typed into directly; **at most 200 characters**: input stops at the limit and nothing is cut afterwards; a counter ("180 / 200") shows from 160.
  - **Dosage:** a number and a Unit picker side by side, each its own labelled 48px field ("Dosage", "Unit"); the unit is remembered per medicine.
  - **Several pigs** (modelled on splitting a bill equally, then adjusting): no per-pig inputs on the form. Once a dosage is typed, one navigate row under it reads "2 pigs · 2.5 mL each" with "Adjust ›" (after changes: "2 pigs · 1 adjusted"); no dosage, no row. It opens **Dose per pig**: an ear-tag search with Scan, then every pig with its dose box pre-filled with the dosage; typing a different value makes it that pig's own (ink, bold, "Adjusted"); clearing it returns it to the dosage. Unadjusted pigs follow a later change of the dosage; adjusted ones keep theirs. Values are live: no Save, Back top left. **Remove pigs** (a text action above the list) switches the list into remove mode: each row's dose box gives way to a remove control (×), Done leaves; the last pig cannot be removed.
  - **Save** waits until the shared dose is set, or every included pig has a typed dose.
  - Record vaccination uses the same picker filtered to Vaccines.

## Scope

In: the picker (level 1 with and without recents, a category, search, no match), adding a medicine, the Brand list with its add card and details step, the withdrawal notice and the record's copy, the Medicines page with the medicine and brand edit forms and Delete. The treatment's optional fields and its batch doses are health-record's screens built on this feature. The condition picker is unchanged (the owner reworks conditions separately).

Out: the Record treatment and Record vaccination forms themselves (health-record; this feature changes their Medicine field, adds the Brand row and the withdrawal notice, and orders the batch form), prescriptions (prescriptions), barcode scanning.

## Decisions

- 2026-10-16 (owner): Category → Medicine → Product, a picker with levels, manual adding, rename and delete on a page (first round).
- 2026-10-16 (owner, revision): the picker picks a medicine; Brand is an optional field of the treatment with its own list and quick add; no product form; method and unit remembered per medicine; one rule for the second line; a starting catalogue for every farm; adding a medicine asks Name and Category; the page holds brands, and Rename and Delete for farm-added medicines only.
- 2026-10-16 (owner, addition): optional withdrawal (medicine default, brand override), never required; shown on the form (now a caption); the record keeps a copy.
- 2026-10-16 (owner, in place, 2): the Adjust line becomes one navigate row ("2 pigs · 2.5 mL each · Adjust ›"); Remove pigs as a mode on Dose per pig; the samples show the same pigs throughout.
- 2026-10-16 (owner, in place): no pigs row; Remove on Dose per pig; withdrawal as a caption under Medicine or Brand; Dosage and Unit side by side; Same for all · Adjust ›, the per-pig page pre-filled with the dosage.
- 2026-10-16 (owner, round 5): optional fields approved as labelled fields with a grey Optional (the law follows in a shared PR); Note 200 characters with a counter from 160; the Custom doses row and page back, with inline boxes and no checkboxes; a pig is taken out on the selected list.
- 2026-10-16 (owner, round 4): "Withdrawal period (days)" everywhere; optional fields as ordinary labelled fields (Brand and Condition PickerFields, Note a textarea); batch doses inline on the form with search and Scan (replacing round 3's Custom doses page).
- 2026-10-16 (owner, round 3): one batch dose; no strength field (strength in the brand's name); withdrawal defaults prefilled in the starting list (sample values); the Medicines page sheets are edit forms with Delete at the bottom.
- Category titles at a level's header use short names to fit at 360 (this feature's budget): Pain relief, Hormones, Vitamins and iron.
- The withdrawal notice is a Banner notice: Banner states a consequence before the action it governs; danger is for destructive commits and correction for a review, neither of which this is.

Open:

- "Done" leaves Dose per pig's remove mode; the registry's Done applies a picker's choices with its count. The word is to confirm.
- The red Delete text action, Field's `optional` label and ChoiceList's row faces are separate component decisions.

- The starting list (categories and medicines, EN and ZH) is to be checked by a vet, and its default withdrawals verified against the official periods (China: MOA Announcement No. 278 and its updates) before release.
- The Delete text action is drawn by Button's text register, which has no destructive (red) face; the red is on the confirm. A destructive text face would be a Button change of its own.
- Who may add, rename and delete, and edit names and withdrawals (permissions): the prototype lets anyone.
- None on milk withdrawal: pigs are not milked for sale.

Follow-ups (other features, not built here):

- Show a pig's or pen's withdrawal on the pig (pig-profile) and the pen, and flag a pig under withdrawal when it is moved or sold for slaughter (move). The record already keeps the date.

## Not supported

- **Barcode scanning** — owner decision: adding is manual only.
- **Product form and a strength field** — owner revisions: method is chosen on the treatment; a strength that matters is in the brand's name.
- **Renaming or deleting a starting-list medicine or a category** — the starting list is the same on every farm.
- **Batch numbers, expiry and stock** — they belong to future inventory, not to the treatment.
- **Milk withdrawal, withdrawal by species or route** — meat only, one number per brand or medicine.
