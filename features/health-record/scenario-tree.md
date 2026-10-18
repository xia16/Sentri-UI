# Health record — scenario tree

Covers Record treatment for several pigs, the host form the Medicines feature builds on. Sources: M = the Medicines PRD's Hosts rules (owner rulings of 2026-10-16); P = this feature's PRD; B = owner ruling B, 2026-10-16 (footer Back keeps the draft). S is a sourced branch, I an inferred one. The executable leaves are in `scenarios.json`; each names its row. Record health, care, conditions and the other actions have no leaves yet.

States: the treatment form for two selected pigs with a medicine picked, with or without a dosage; Dose per pig, normal or in remove mode.

## T · Record treatment, several pigs

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| T-1 | Medicine picked, no dosage | Look at the form | → Save waits; no Adjust row | S — M Save, several pigs | hr-t1-save-waits-for-dose |
| T-2 | Medicine picked | Type a dosage of 2.5 | → one row "2 pigs · 2.5 mL each" with Adjust; Save · 2 pigs | S — M several pigs | hr-t2-shared-dose-row |
| T-3 | Dosage 2.5 | Give one pig 3 on Dose per pig, then Back | → "2 pigs · 1 adjusted"; Save · 2 pigs | S — M several pigs; P never identical doses | hr-t3-one-pig-adjusted |
| T-4 | Dosage 2.5 | Remove pigs, remove one, then Back | → remove mode ends at one pig; Save · 1 pig | S — M several pigs | hr-t4-remove-pig |
| T-5 | Medicine and dosage set | Back out of the form, reopen Record treatment | → the medicine and dosage are kept | S — B | hr-t5-draft-survives-reopen |
| T-6 | Dosage set for two pigs | Save | → the walk list, and a toast: Treatment recorded · 2 pigs | S — design law, Feedback after saving | hr-t6-saved-toast |
