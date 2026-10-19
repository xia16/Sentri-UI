# Treatment 治疗

## Problem

A worker sees a sick pig and gives it something: an injection, a dose in the water, a spray. The record has to say what was given, how, how much and to which pigs, and the withdrawal period the label prints, without implying that every pig got the same dose. Before this feature the same job was drawn three times: Health record's Record treatment, a separate Medicines feature for the farm's medicine list, and an older Treat deck. They are one feature (owner, 2026-10-19). The farm's medicine list (choosing from it, adding to it, keeping it tidy) is part of it, since a treatment is where a medicine is named.

This is ad hoc treatment only. A vaccination is a task, and a planned or prescribed course of treatment is Prescription treatment (`features/prescriptions`); both have their own way of doing things and are not designed here.

## Who

The worker on the walk, or at a pen, with a bottle in hand: records the treatment, picks the medicine, sometimes adds one. The supervisor keeps the farm's medicine list (brands, withdrawal periods, what the farm added); the vet and supervisor read the trail afterwards.

## Anchor

None: a treatment is recorded once and has no lifecycle; the medicine list has none either. Screens are grouped by surface: the form for one pig, the form for several, choosing a medicine, adding one, Brand, and the Medicines page.

## Ways in

| Where | Control | Lands | Note |
|---|---|---|---|
| A pig's More actions (pig-profile) | Health → Record treatment | the form for one pig | The usual case: the pig in front of you is sick. |
| Pigs ticked on the walk (inspection) | Actions → Health → Record treatment | the form for several pigs | One record per ticked pig. |
| A finding (health-record) | Record treatment | the form for one pig, the condition fixed | Treat the condition you are looking at; Save returns to the finding. Health record keeps this as a link (`health-record.treatment`, an alias of `treat.record`). |
| Home → Toolbox (workbench) | Medicines | the Medicines page | Keeping the farm's list. |
| Not ad hoc: a vaccination task (pig-profile.tasks) | Vaccination → Vaccine | the vaccine picker | The task and its form are the task's. The prototype still opens this feature's form, titled Record vaccination; it moves out to the task. Only the shared medicine list, filtered to Vaccines, stays here. |

A planned or prescribed treatment is given from Prescription treatment, and a scheduled treatment task from its task; neither enters here.

## Rules

### The form

- **What was given comes first.** Medicine, Method, Brand (optional), Dosage and Unit, then Condition (optional) and Note (optional), then Save. For several pigs the same order, then the dose line (below).
- **Medicine** comes from the farm's list (below). Picking it fills Method and the unit with the ones it was last given with, unless they were set in this draft; Save stores them on the medicine.
- **Method:** Injection, Oral, Topical, In feed, In water (a sample list until farm configuration exists).
- **Dosage:** a number and a Unit picker side by side, each its own labelled 48px field ("Dosage", "Unit"). A dose must be above 0.
- **Brand is an optional field**: a PickerField labelled "Brand" with a grey "Optional", styled like Medicine and Method ("Select" until set), that appears once a medicine is chosen. It lists the brands the farm has used for that medicine (the three most recent under "Recently used" when there are more). A search with no match shows one card, `Add “…”`, which adds the brand under that medicine for everyone and picks it, then offers an optional, skippable details step (its withdrawal). No brand chosen means no brand; there is no "Brand not known". A new medicine drops a brand that belonged to the old one.
- **Condition is optional.** Treating a pig with nothing open is legal (prophylaxis), so an empty Condition never blocks Save. For several pigs, the treatment goes to every pig and the condition links only to the pigs that carry it. Opened from a finding, the condition is fixed and shown.
- **Note:** a textarea about three lines tall, typed into directly; at most 200 characters: input stops at the limit and nothing is cut afterwards; a counter ("180 / 200") shows from 160.
- **Optional fields** are ordinary labelled fields with a grey "Optional" (owner, rounds 4 and 5).
- **No date field.** The time of recording is the record, and the withdrawal date counts from it.
- **Several pigs** (modelled on splitting a bill equally, then adjusting): no per-pig inputs on the form. Once a dosage is typed, one navigate row under it reads "2 pigs · 2.5 mL each" with "Adjust ›" (after changes: "2 pigs · 1 adjusted"); no dosage, no row. It opens **Dose per pig**: an ear-tag search with Scan, then every pig with its dose box pre-filled with the dosage; typing a different value makes it that pig's own (ink, bold, "Adjusted"); clearing it returns it to the dosage. Unadjusted pigs follow a later change of the dosage; adjusted ones keep theirs. Values are live: no Save, Back top left. **Remove pigs** (a text action above the list) switches the list into remove mode: each row's dose box gives way to a remove control (×), Done leaves; the last pig cannot be removed.
- **Treatment never implies identical doses across pigs.**
- **Save** waits until medicine, method, unit and a dose above 0 are set: the shared dose, or a typed dose for every included pig. A tap on the waiting Save marks the empty fields "Required" and scrolls to the first. One treatment record per included pig; dead sows are excluded. It returns to where the worker came from: the walk list, the finding, or the pig record.
- **Feedback after saving** (design law, owner 2026-10-18): a save that returns to the walk list or to More actions confirms with a Toast saying what was recorded and for whom ("Treatment recorded · 2 pigs"); with no connection, that it is on this phone and uploads when connected. A save that returns to the finding shows the record there, so no toast.

### Withdrawal period

- **Withdrawal period (days), never required.** For pigs it is always the meat withdrawal, so every label reads "Withdrawal period (days)" (ZH 休药期（天）).
- **The medicine's default is the usual case.** Every starting-list medicine ships with a default (vaccines none: usually 0 or not applicable), which the farm can change on the Medicines page. The defaults are **sample values**, to be verified against the official withdrawal periods (China: MOA Announcement No. 278 and its updates) before release; they are not authoritative.
- **A brand overrides it only when its label differs.** The brand's field says so: "Uses Amoxicillin's 14 days when empty".
- **On the form:** once a medicine is chosen, a muted caption in the field's hint slot reads "Withdrawal period 14 days · until 26 Sep": under Medicine for its default, under Brand when the chosen brand has its own period (where it sits says whose number it is). No period, or 0: no caption.
- **The saved record keeps a copy** of the withdrawal days and date in force that day; later edits never change past records.

### The medicine list

- **Category → Medicine** (owner, 2026-10-16, revision). Picking a medicine is a complete record.
  - Category: a fixed list, the same on every farm: Antibiotics; Pain relief and anti-inflammatory; Parasite control; Vaccines; Hormones and reproduction; Vitamins, minerals and iron; Other.
  - Medicine: the drug or active ingredient. Vaccines are named by the disease (PRRS, PCV2…).
  - **Every farm starts from the same categories and medicines, in English and Chinese** (`ux/system/medicines-catalogue.json`, a starting list to be checked by a vet). Farms add medicines and brands on top. Starting-list medicines cannot be renamed or deleted.
- **There is no strength field and no product form** (owner, round 3): not every medicine has a meaningful strength (vaccines are counted in doses; premixes and powders vary). When strength matters it is part of the brand's name ("Amoxinsol 50%"), so two strengths are two brand entries. Method is chosen on each treatment.
- **The second line (meta) shows only what tells a row apart from its siblings** (ChoiceList): category, medicine, recent and brand rows have none; a search result names its category, because search mixes categories.
- **The picker is one drawer with levels** (owner ruling B): the long size, one height across levels, the footer Back goes up a level, the ✕ at the top left closes it from any level.
  - Level 1: search, then up to three of the farm's most recent medicines (distinct, newest first, shared by every worker; absent when there are none), then the categories.
  - Level 2, a category: its medicines; one tap picks and closes.
  - Search, pinned at the top of every level ("Search all options"), matches English and Chinese names and common other names across every category.
  - The vaccination task opens the same picker filtered to Vaccines: vaccines by disease at once, no category level.
- **Adding a medicine is manual only** (no barcode). A search with no match shows one card and nothing else: `Add “<typed>”`. It opens the add level: Name (pre-filled) and Category (required, one pick; already set when added from inside a category). Adding lists it for everyone and picks it.
- **The Medicines page** (a page, not a drawer), reached from Home → Toolbox → Medicines: the categories, then a category's medicines. A medicine's sheet and a brand's are **edit forms**: their fields on the sheet (a brand: Name, Withdrawal; a farm-added medicine: Name, Default withdrawal; a starting-list medicine: its default withdrawal only, its name read-only), the medicine's brands as rows, **Delete** as a navigate Row in its own card at the bottom, opening a confirm level ("Past records keep its name"), footer Back + Save. Starting-list medicines have no Delete. Delete removes the entry from the picker; past records keep the name.

## Scope

In: Record treatment for one pig and for several (Dose per pig, Remove pigs), its optional fields, the withdrawal caption and the record's copy, the save and its Toast; the medicine picker (level 1 with and without recents, a category, search, no match), adding a medicine, the Brand list with its add card and details step; the Medicines page with the medicine and brand edit forms and Delete. The vaccine picker, only as the shared list the vaccination task opens.

Out: vaccination (a task: its form and its completion are the task's); planned or prescribed treatment (Prescription treatment, `features/prescriptions`) and scheduled treatment tasks; recording, editing and resolving a condition (health-record); the condition picker inside the form, unchanged until the owner's condition rework (health-record); barcode scanning.

## Decisions

- 2026-10-19 (owner): Health record's Record treatment, Medicines and Treat are one feature, Treatment, for ad hoc treatment only. Vaccination is a task and planned treatment has its own way of doing things (Prescription treatment). The Medicines page lives here. The old Treat deck's four screens (`ux/archive/workflows.html`, wf-treatment: the marked set, the six-field page, targets, next walk) are retired; what still holds is carried into the rules above (optional condition as legal prophylaxis, the condition linking only to the pigs that carry it, no date field). Its "the confirm screen and toast are gone" is superseded by Feedback after saving (owner, 2026-10-18), and its total-dose footnote and marked-set filter were not carried over.
- Screen ids moved with the screens: `health-record.treatment*` → `treat.record*`, `health-record.brand*` → `treat.brand*`, `health-record.custom-doses*` → `treat.dose-per-pig*`, `health-record.treatment-saved*` → `treat.saved*`, `medicines.picker*`, `.category`, `.search*`, `.add*` → `treat.medicine-*`, `medicines.vaccines` → `treat.vaccine-picker`, `medicines.page*` → `treat.medicines-page*`, `medicines.medicine*` → `treat.medicine-sheet*`, `medicines.brand` → `treat.brand-sheet`, `medicines.delete` → `treat.brand-delete`. Copy keys (`medicines.*` in `ux/laws/strings.json`) and the prototype's file names (`medicines-astra.css`, `medicines-catalogue.json`) keep their names.
- 2026-10-18 (owner): a save that returns to the walk list confirms with a Toast; offline, that it is on this phone (Feedback after saving).
- 2026-10-16 (owner): Category → Medicine → Product, a picker with levels, manual adding, rename and delete on a page (first round).
- 2026-10-16 (owner, revision): the picker picks a medicine; Brand is an optional field of the treatment with its own list and quick add; no product form; method and unit remembered per medicine; one rule for the second line; a starting catalogue for every farm; adding a medicine asks Name and Category; the page holds brands, and Rename and Delete for farm-added medicines only.
- 2026-10-16 (owner, addition): optional withdrawal (medicine default, brand override), never required; shown on the form (now a caption); the record keeps a copy.
- 2026-10-16 (owner, round 3): one batch dose; no strength field (strength in the brand's name); withdrawal defaults prefilled in the starting list (sample values); the Medicines page sheets are edit forms with Delete at the bottom.
- 2026-10-16 (owner, round 4): "Withdrawal period (days)" everywhere; optional fields as ordinary labelled fields (Brand and Condition PickerFields, Note a textarea).
- 2026-10-16 (owner, round 5): optional fields approved as labelled fields with a grey Optional; Note 200 characters with a counter from 160; Dose per pig with inline boxes and no checkboxes.
- 2026-10-16 (owner, in place): withdrawal as a caption under Medicine or Brand; Dosage and Unit side by side; the per-pig page pre-filled with the dosage.
- 2026-10-16 (owner, in place, 2): the Adjust line becomes one navigate row ("2 pigs · 2.5 mL each · Adjust ›"); Remove pigs as a mode on Dose per pig; the samples show the same pigs throughout.
- Category titles at a level's header use short names to fit at 360: Pain relief, Hormones, Vitamins and iron.
- The withdrawal period is a muted caption in the PickerField's hint slot (`reason`), not a Banner: it informs without warning.

Open:

- Whether recording a treatment ends a "Treat in place" care level on the condition it treats (the old Treat deck said it does; a hospital-pen level would end with the move). Not built.
- Is a dose required for every pig, or may a pig be saved without one? (review/inspection-r2.json)
- When the vaccination form moves out to its task, whether the task keeps this picker or gets its own list.
- "Done" leaves Dose per pig's remove mode; the registry's Done applies a picker's choices with its count. The word is to confirm.
- The red Delete, Field's `optional` label and ChoiceList's row faces are separate component decisions. The Delete Row is an ordinary navigate Row (ink, no red face); the red is on the confirm.
- The starting list (categories and medicines, EN and ZH) is to be checked by a vet, and its default withdrawals verified against the official periods before release.
- Who may add, rename and delete, and edit names and withdrawals (permissions): the prototype lets anyone.
- Methods and units are a sample list until farm configuration exists.

Follow-ups (other features, not built here):

- Show a pig's or pen's withdrawal on the pig (pig-profile) and the pen, and flag a pig under withdrawal when it is moved or sold for slaughter (move). The record already keeps the date.

Sources: the owner's rulings above; the ops requirements `ux/research/ops/health.md` and `ux/research/ops/SYNTHESIS.md`; the retired deck `ux/system/workflows/health.html` (rendered in `ux/archive/workflows.html`).

## Not supported

- **Vaccination** — a task, not an ad hoc treatment: its form moves out to the task.
- **Planned or prescribed treatment, and scheduled treatment tasks** — Prescription treatment and the task have their own way of doing things.
- **Barcode scanning** — owner decision: adding is manual only.
- **Product form and a strength field** — owner revisions: method is chosen on the treatment; a strength that matters is in the brand's name.
- **Renaming or deleting a starting-list medicine or a category** — the starting list is the same on every farm.
- **Batch numbers, expiry and stock** — they belong to future inventory, not to the treatment.
- **Milk withdrawal, withdrawal by species or route** — meat only, one number per brand or medicine; pigs are not milked for sale.
