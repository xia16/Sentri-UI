# Treatment — scenario tree

Ad hoc treatment: a worker sees a sick pig and records what was given. Sources: P = this feature's PRD (the owner's rulings of 2026-10-16, all rounds, and the merge of 2026-10-19); B = owner ruling B, 2026-10-16 (drawers with levels: footer Back goes up a level and keeps the draft, ✕ closes); A = the atlas screen's own rule in `feature.json`. S is a sourced branch, I an inferred one. The executable leaves are in `scenarios.json`; each names its row. Leaf ids keep their first names (hr-t from Health record, med- from Medicines) so their results carry over.

States: the form for one pig and for several (a medicine picked, with or without a dosage); Dose per pig, normal or in remove mode; the picker at level 1, at a category, searching, or at the add level (Name, Category); the Brand list and its details level; the Medicines page at a category, a medicine's sheet, a brand's sheet and the Delete confirm. Entries: a pig's More actions → Health → Record treatment, Actions on the pigs ticked on the walk, a finding's Record treatment, Home → Toolbox → Medicines; and, not ad hoc, the vaccination task's vaccine picker.

## T · Record treatment, several pigs

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| T-1 | Medicine picked, no dosage | Look at the form | → Save waits; no Adjust row | S — P Save, several pigs | hr-t1-save-waits-for-dose |
| T-2 | Medicine picked | Type a dosage of 2.5 | → one row "2 pigs · 2.5 mL each" with Adjust; Save · 2 pigs | S — P several pigs | hr-t2-shared-dose-row |
| T-3 | Dosage 2.5 | Give one pig 3 on Dose per pig, then Back | → "2 pigs · 1 adjusted"; Save · 2 pigs | S — P several pigs, never identical doses | hr-t3-one-pig-adjusted |
| T-4 | Dosage 2.5 | Remove pigs, remove one, then Back | → remove mode ends at one pig; Save · 1 pig | S — P several pigs | hr-t4-remove-pig |
| T-5 | Medicine and dosage set | Back out of the form, reopen Record treatment | → the medicine and dosage are kept | S — B | hr-t5-draft-survives-reopen |
| T-6 | Dosage set for two pigs | Save | → the walk list, and a toast: Treatment recorded · 2 pigs | S — design law, Feedback after saving | hr-t6-saved-toast |

## A · Choosing a medicine (Record treatment)

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| A-1 | Picker at Antibiotics | Tap Amoxicillin | → closes onto the form; Medicine reads Amoxicillin with its 14-day withdrawal caption | S — P picker level 2, withdrawal caption | med-a1-pick-closes |
| A-2 | Picker at Antibiotics | Footer Back | → back to level 1, the drawer stays open | S — P, B | med-a2-back-up-a-level |
| A-3 | Picker at Antibiotics | ✕ | → the whole picker closes; Medicine still unset | S — P, B | med-a3-close-from-level |
| A-4 | Picker at level 1 | Tap a recent medicine last given by injection in mL | → Method and unit filled from its last use | S — P remembered method and unit | med-a4-method-unit-remembered |
| A-5 | Picker at level 1 | Type part of a name | → matches listed with their category; no category list | S — P second line | med-a5-search-names-category |
| A-6 | Add level, Category empty | Tap the waiting Add | → nothing added; Category marked Required | S — A treat.medicine-add | med-a6-waiting-add-required (pending: the runner cannot tap a waiting control) |
| A-7 | Add level, Name and Category set | Tap Add | → listed for everyone and picked; the drawer closes on the form | S — P adding | med-a7-add-lists-and-picks |
| A-8 | Add level, Category set | Back to the search, then the same Add card | → the add level reopens with the Category kept | S — B | med-a8-add-draft-kept |

## B · Brand (Record treatment)

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| B-1 | Amoxicillin picked | Pick a brand with its own withdrawal | → its period shows under Brand | S — P withdrawal | med-b1-brand-own-period |
| B-2 | Brand search with no match | Add “Moxylan”, then Add with the withdrawal empty | → Brand is Moxylan; the medicine's 14 days still apply | S — P Brand, withdrawal never required | med-b2-add-brand-details-optional |
| B-3 | A medicine with no brands yet | Open Brand, type a name, Add | → the empty list says there are none and to type a name; the new brand is on the form | S — P Brand; atlas treat.brand-empty | med-b3-no-brands-says-how-to-add |

## C · The vaccine picker (the vaccination task opens it)

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| C-1 | Vaccination task | Open the vaccine picker | → vaccines by disease at once (recent, then All); no other medicines, no category level | S — P hosts, Category → Medicine | med-c1-vaccines-by-disease |

## D · The Medicines page

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| D-1 | Antibiotics | Open a starting-list medicine | → only its default withdrawal is editable; no name field, no Delete | S — P Medicines page | med-d1-starting-list-read-only-name |
| D-2 | A brand's sheet with an unsaved name | Footer Back, then open the brand again | → the typed name is kept | S — B | med-d2-brand-draft-kept |
| D-3 | A farm-added medicine | Delete medicine, then Delete | → the confirm says past records keep its name; the medicine leaves the list | S — P Medicines page | med-d3-delete-farm-medicine |
