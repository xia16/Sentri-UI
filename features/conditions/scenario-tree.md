# Conditions: scenario tree (skeleton)

States × events → outcome. **S** = sourced (PRD rule, owner ruling or research), **I** = inferred. Walked in the Inspection
prototype on 2026-10-17 at 390px. Questions are listed once at the end.

Fixture: Inspection's sample unit. Pen **D4** (growers) has 000801 (Diarrhoea, shown as Scours), 000802, and **14 pigs without ear tags**
(Coughing · 3). Pens C1 and C2 (sows) have none.

## A. The walk list

| Row | Given | When | Then | |
|---|---|---|---|---|
| A1 | D4 | the list opens | 2 pig rows by ID, then the group row: struck tag, **14 pigs**, `Coughing · 3` under it, field `14` (grey); header `D4 · 16 pigs` | S PRD 1 |
| A2 | C1, C2 | the list opens | no group row; rows as before | S PRD 1 |
| A3 | a pig with a disease and its symptom | the list opens | the disease shows; the symptom is folded | S PRD 4 (Q2) |
| A4 | Diarrhoea and Diarrhoea (bloody) on one pig | the list opens | one tag, Scours, at the more urgent care | S PRD 4 |

## B. Choosing who

| Row | Given | When | Then | |
|---|---|---|---|---|
| B1 | list | tick D4's header | the header keeps its colour (checkbox ticked); its 2 pigs and its group row are ticked; the field shows `14`; dock `16 pigs selected` + Actions | S PRD 1, 2 |
| B2 | list | tick the group row only | dock `14 pigs selected` + Actions; Actions shows Disease or symptom only | S PRD 1 |
| B3 | B1 | tap the group row's field, type 3 | the phone's number pad, 14 selected; the field shows `3`; dock `5 pigs selected`; the row keeps its height | S PRD 2 |
| B4 | B3 | type 20 | the field caps at 14 | S PRD 2 |
| B5 | B3 | tap `5 pigs selected ›` | Selected page: Pens (D4 · 5 pigs), Without ear tags (`D4 · 3 of 14 pigs`); each row unticks; no Clear | S PRD flow |
| B6 | B3 | Actions | the Actions page: pig actions only, no Pigs / Pens switch, no bottom bar | S PRD flow |
| B7 | list | tap D4's › | the pen page: Pen note, Feed guidance, Pen log | S PRD flow |

## C. Record health

| Row | Given | When | Then | |
|---|---|---|---|---|
| C1 | B6 | Disease or symptom | Record health page: Conditions, Care, Note (optional); no pig list; `Save · 5 pigs` waits for Conditions | S PRD flow |
| C2 | C1 | Back, open Selected, untick the group row | Save counts the tagged pigs only (`Save · 2 pigs`) | S PRD flow |

## D. Conditions picker

| Row | Given | When | Then | |
|---|---|---|---|---|
| D1 | B3 | open Conditions | search; On these pigs (Diarrhoea on 1 pig, Coughing D4 without ear tags); Recent; Symptoms (the six groups); Diseases (six systems, Report a disease) | S PRD 3 |
| D2 | D1, worker | — | no Diseases row | S PRD 3 (Q1) |
| D3 | D1 | tap Respiratory | its diseases in one tap; Back returns to the first level | S PRD 3 |
| D3a | D1 | search "SDF" | one card, `Add "SDF"` | S PRD 3 |
| D3b | D3a | Add "SDF", Category Symptom · Breathing, Add | SDF listed in Breathing, ticked, `Done · 1` | S PRD 3 |
| D3c | D1 | Breathing › Nasal discharge | Clear, Thick or yellow, Bloody, Not sure which | S PRD 3 |
| D4 | D1 | Rear and belly | its symptoms and events; no sow-only items for growers | S PRD 3 |
| D5 | D4 | Diarrhoea | Watery, Yellow, Bloody, Black, Not sure which | S PRD 3 |
| D6 | D5 | tick Bloody, Back | Rear and belly; Diarrhoea `1 selected`; Done · 1 | S PickerField, ruling B |
| D7 | pen page | How the pen looks, tick Coughing heard and Huddling, Save | the pen page reads `Coughing heard · Huddling or piling`; a Pen observation in the pen log | S PRD 3 |
| D8 | D3 | Diseases → Reproductive | PRRS `Also in Respiratory` | S research |
| D9 | D1 | Report a disease | ASF, FMD (class 1), CSF, PRRS, PED (class 2), Not sure which | S research (China 573) |
| D10 | D6 | Done · 1 | Record health, Conditions `Diarrhoea (bloody)` | S PickerField |

## E. After save

| Row | Given | When | Then | |
|---|---|---|---|---|
| E1 | Diarrhoea (bloody), How many 3 | Save | 000801 one tag (Scours); the group row `Coughing · 3`, +1 | S PRD 4 |
| E2 | PRRS on D4 with How many 5 | Save | both pigs PRRS; the group row `PRRS · 5`, Coughing folded | S PRD 4 (Q2) |
| E3 | African swine fever on the group row only, 14 | Save | the group row leads with red `African swine fever` (Reportable on its picker row) | S PRD 3, 4 (Q4) |

## Questions

Q1 who may tag a disease · Q2 which symptoms a disease folds · Q3 a later count replaces or adds · Q4 reporting as a tag or
an alert (PRD).
