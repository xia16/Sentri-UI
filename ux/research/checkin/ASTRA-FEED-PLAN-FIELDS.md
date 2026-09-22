# Astra Feed plan — field audit

Date: 18 September 2026. Research pass only; no UI or feeding calculations changed.

The old PRD supports substantially more feed detail than the present formula label, current ration and base curve. Keep the **feeding program** (the animal's plan) distinct from the **feed formula** (the actual product). Brand is a useful addition requested by the user, but is not a separate field in the old schema.

## Primary sources

- [Feed Management PRD v2.1](C:/Users/ying_/Downloads/Sentri_Feed_Management_PRD_v2_1.html:243), consensus draft dated 11 August 2026. Section numbers below refer to this document.
- [Feed Management PRD v2](C:/Users/ying_/Downloads/Sentri_Feed_Management_PRD_v2.html), checked against v2.1 for the Feed Formula schema. V2.1 adds the two phase-budget fields; the preceding formula fields match.
- [Existing mobile extraction](C:/Users/ying_/Documents/Codex/2026-09-08/clo/Sentri-UI/ux/research/checkin/feed-mobile.md), useful prior interpretation; the original PRD remains the source of schema claims.

## Fields to bring into the detail screen

| Screen group | Exact source fields | Suggested display / scope |
|---|---|---|
| Plan | Feeding Program `name`, `stage_id`; Assignment `effective_date` | Plan name, life stage and effective date. Program name must not stand in for the feed product name. [§9.4–9.5](C:/Users/ying_/Downloads/Sentri_Feed_Management_PRD_v2_1.html:247) |
| Current feed | Feed Formula `name`, `supplier`, internal `id` | Product/formula name and supplier. Keep internal ID out of normal reading. Formula record is entered from the supplier spec sheet. [§9.3](C:/Users/ying_/Downloads/Sentri_Feed_Management_PRD_v2_1.html:243) |
| Nutrition | `energy_density`, `energy_basis` | Energy as **MJ/kg**, visibly identified as **ME** or **NE**. Density is nullable; basis is required when density is supplied. Never treat ME and NE as interchangeable. [§9.3](C:/Users/ying_/Downloads/Sentri_Feed_Management_PRD_v2_1.html:243), [§7.2](C:/Users/ying_/Downloads/Sentri_Feed_Management_PRD_v2_1.html:185) |
| Nutrition | `crude_protein`, `sid_lysine` | Optional crude protein and SID lysine. **Neither field's unit is specified in the schema.** Confirm concentration units before rendering values; do not assume percent or g/kg. [§9.3](C:/Users/ying_/Downloads/Sentri_Feed_Management_PRD_v2_1.html:243) |
| More nutrition | `full_nutrient_profile` | Optional object. **The nested field schema and units are not enumerated.** The non-goals mention amino acids, digestibility coefficients and mineral breakdowns, but do not establish specific fields or require their capture. Do not invent a complete nutrition label. [§9.3](C:/Users/ying_/Downloads/Sentri_Feed_Management_PRD_v2_1.html:243), [§4](C:/Users/ying_/Downloads/Sentri_Feed_Management_PRD_v2_1.html:146) |
| Today's feeding | Feed Curve `points: {day, kg, source, derivation_tier}` and applicable Adjustments | Retain today's **kg/head/day** for curve-fed animals and the base curve; explain active adjustments separately so the base and final ration are understandable. Use Ad-lib when no ration exists. Source/tier can support a compact explanation rather than raw enums. [§9.6](C:/Users/ying_/Downloads/Sentri_Feed_Management_PRD_v2_1.html:255), [§9.11](C:/Users/ying_/Downloads/Sentri_Feed_Management_PRD_v2_1.html:279), [§7](C:/Users/ying_/Downloads/Sentri_Feed_Management_PRD_v2_1.html:169) |
| Adjustment detail, when active | `adjustment_type`, `value`, `unit`, `reason`, `applied_by`, `start_date`, `expires_at`; rate adjustments also have `reference_variable`, `threshold` | Amount/change, reason, start/end and who applied it. Severity band is optional. Show only relevant active details, with provenance available on demand. [§9.11](C:/Users/ying_/Downloads/Sentri_Feed_Management_PRD_v2_1.html:279) |
| Formula substitution, when active | Program `feed_formula_id`, `fallback_formula_id` | Identify the feed actually in use and explain a temporary substitute only when relevant. A configured fallback is not proof that substitution is active. [§9.4](C:/Users/ying_/Downloads/Sentri_Feed_Management_PRD_v2_1.html:247), §12.8 |

## Requested additions and unresolved schema

**Brand and manufacturer are proposed additions**, separate from the existing `supplier` field. The old Feed Formula table specifies neither field. Supplier may be a distributor rather than the product brand or producer, so do not relabel supplier as brand. Product code/SKU is also not specified; an internal `id` is not evidence of a printed product code. [§9.3](C:/Users/ying_/Downloads/Sentri_Feed_Management_PRD_v2_1.html:243)

Before storing or displaying nutrition, define the unit for crude protein and SID lysine, the concentration basis (for example, as-fed versus dry matter), and the nested nutrient-profile schema. Those are implementation proposals/gaps, not recovered requirements. A supplier spec-sheet reference and revision date would help trace values, but these are also proposed metadata rather than existing formula fields. No actual feed brand or nutrition values have been established for the prototype animal by this audit.

Do not mistake Reference Requirement `min_sid_lysine_per_mcal` for the unit of Formula `sid_lysine`: it is a separate threshold on a different entity. [§9.2](C:/Users/ying_/Downloads/Sentri_Feed_Management_PRD_v2_1.html:237)

## Optional, managerial and deferred details

Formula `discontinued_at` is nullable lifecycle metadata; surface it only if relevant to the assigned feed. V2.1 adds nullable `phase_budget_kg_per_head` and `phase_budget_duration_days`. They support phase purchase forecasts, diet-switch reminders and an internal ad-lib variance baseline. **Their derived daily rate must not be displayed as an ad-lib ration.** The defaults are still an open sourcing decision. [§9.3](C:/Users/ying_/Downloads/Sentri_Feed_Management_PRD_v2_1.html:243), [§12.11](C:/Users/ying_/Downloads/Sentri_Feed_Management_PRD_v2_1.html:396), [§17](C:/Users/ying_/Downloads/Sentri_Feed_Management_PRD_v2_1.html:445)

Keep program genetic line/strategy/fallback configuration, formula authoring, inventory quantities, purchase costs, currency, delivery/log dates, silo counts and reconciliation in their management surfaces. These are modeled in the PRD, but are not necessary in every animal's Feed plan screen. Batch strategy is reserved schema with one default objective initially; full nutrient capture is not required for MVP. [§9.4](C:/Users/ying_/Downloads/Sentri_Feed_Management_PRD_v2_1.html:247), [§9.12](C:/Users/ying_/Downloads/Sentri_Feed_Management_PRD_v2_1.html:285), [§16](C:/Users/ying_/Downloads/Sentri_Feed_Management_PRD_v2_1.html:438)

## Proposed reading order

1. **Today's feeding:** current ration or Ad-lib, feeding program and stage.
2. **Feed:** actual product name, brand if separately recorded, supplier.
3. **Nutrition:** energy with ME/NE and MJ/kg; protein and SID lysine only with established units. Additional supplied nutrition can expand here.
4. **Plan detail:** base curve, active adjustments, effective date and relevant provenance/substitution details.

This grouping is a screen proposal, not a layout prescribed by the PRD. It makes feed identity and nutrition available without turning the inspection header into another dense information area.
