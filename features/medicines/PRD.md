# Medicines 药品

## Problem

Every treatment and vaccination names what was given. Today the worker picks a placeholder "medicine" and then, optionally, a "brand" from a list that is the same for every medicine, and the farm has no list of its own: nothing remembers what was used, nothing can be added from a treatment, and a typo can never be fixed. This feature is the farm's medicine list: choosing from it inside a record, adding to it when something is missing, and keeping it tidy.

## Who

The worker recording a treatment or vaccination with a box or bottle in hand (picks, sometimes adds). The supervisor who keeps the farm's list (renames, deletes).

## Anchor

None: the list has no lifecycle. Screens are grouped by surface: the picker (in Record treatment and Record vaccination), adding, and the Medicines page.

## Rules

- **Hierarchy: Category → Medicine → Product.** The worker picks a product and the record stores the product; "Brand not known" records the medicine only.
  - Category: a fixed preset list, the same on every farm: Antibiotics; Pain relief and anti-inflammatory; Parasite control; Vaccines; Hormones and reproduction; Vitamins, minerals and iron; Other.
  - Medicine: the drug or active ingredient (Amoxicillin, Meloxicam). A combination is its own medicine. A vaccine is named for its disease ("PRRS vaccine").
  - Product: the brand and its form ("Metacam · injection").
- **The picker is one drawer with levels** (owner ruling B): the long size, one height across levels, the footer Back goes up a level, the ✕ at the top left closes it from any level, keeping the draft.
  - Level 1: search, then up to three of the farm's most recent products (distinct, newest first, shared by every worker, filtered to the task: a vaccination shows vaccines only; absent when there are none), then the categories.
  - Level 2, a category: one flat list; the medicines are the group labels and their products the rows; one tap picks a product and closes.
  - Search, pinned at the top of every level ("Search all options"), matches medicine, brand and ingredient across all categories and lists the results the way level 2 does.
- **Adding is manual only; there is no barcode.** A search with no match shows one card and nothing else: `Add “<typed>”`. It opens the add level: Name (required, pre-filled from the search), Medicine (required: an existing medicine, the current category's when added from inside one, or a new one typed), and Category (asked only when the medicine is new). Adding puts the product straight into the farm's list for everyone and picks it. Nothing else is asked.
- **Method, dose and unit are recorded on each treatment.** The product remembers the last method and unit used and pre-fills them next time.
- **Rename and delete live on the Medicines page** (a page, not a drawer), reached from Home → Toolbox → Medicines. It shows the categories, then a category's medicines and their products; a product's own sheet offers Rename and Delete. Delete removes the product from the picker; past records keep its name.
- **Hosts.** Record treatment, one pig and several (health-record). Several: what was given first (Medicine, Method), then the doses ("Same dose for all", then each pig's dose in the remembered unit). Record vaccination uses the same picker filtered to Vaccines.

## Scope

In: the picker (level 1 with and without recents, a category, search, no match), the add level and its Medicine and Category levels, the Medicines page, a category on it, a product's sheet with Rename and Delete.

Out: the Record treatment and Record vaccination forms themselves (health-record; this feature changes only their Medicine field, the Brand row and the batch order), withdrawal periods, stock and batch numbers, prescriptions (prescriptions), barcode scanning.

## Decisions

- 2026-10-16 (owner): the hierarchy, the picker with levels, manual adding, method and unit remembered per product, rename and delete on a page, the hosts (the six decisions above).
- The category list is the owner's; its short titles for a level's header (Title length at 360) are this feature's budget: Pain relief, Hormones, Vitamins and iron. To confirm with the owner.
- The Medicines page is reached from Home's Toolbox (the tools that are not today's work); there is no farm settings page yet.

Open:

- The category list itself (to confirm), and whether its long names should be the short ones everywhere.
- Who may rename and delete (permissions): the prototype lets anyone.
- Whether a farm-added product should ask its form (decision 3 says nothing else is asked; its rows then have no second line).

## Not supported

- **Barcode scanning** — owner decision 3: adding is manual only.
- **Editing a product's medicine or category** — rename and delete only (decision 5); a wrong filing is fixed by deleting and adding again.
- **Renaming or deleting a medicine or a category** — categories are fixed; a medicine with no products stays as "Brand not known".
- **Stock, batch numbers, expiry, withdrawal periods** — not part of choosing what was given; they need stock infrastructure.
