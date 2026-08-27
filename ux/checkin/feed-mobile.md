# Feed on mobile — requirements extracted from Feed Management PRD v2.1

Source: `Sentri_Feed_Management_PRD_v2_1.html` (v2.1 Consensus Draft, 11 Aug 2026). Section numbers below are that document's. Requirements only — no design proposals. "Could not determine" is used literally.

---

## Thesis

The PRD is a console document: six of its seven cascade layers, the whole inventory/cost system, and every authoring surface belong to a Farm Manager or Nutrition Contact at a desk. Exactly two layers reach the barn — Layer 6 (individual/condition override) and Layer 7 (event/environmental modifiers) — and §6 grants the Farmhand role only three verbs: log events, apply individual-override presets, act on Review Inbox items routed to them.

The number itself is **kg per head per day**, and it exists for only about half the herd: curve-fed breeding stages resolve one, ad-lib growth stages never do and the PRD forbids inventing one (§7, §9.3, B.2, B.5). A phone that shows "how much to feed this pen" is therefore showing two structurally different things depending on the pen's stage.

Read-mostly is the right posture and matches §6, but the PRD leans on the barn far harder as a *data source* than as a reader: headcount, spot-check weights, BCS, silo counts, stockouts and disposals are all assumed to arrive from someone walking the building, and several have no defined capture path at all.

---

## The number a farm hand sees

### Output of the cascade (§7)

Seven layers, each inheriting from the one above unless a human explicitly set it. Layer 2 — the **Modality Gate** — decides whether a kg/day number exists at all.

| Path | Stages (§8) | What resolves | What the barn can be shown |
|---|---|---|---|
| `curve_fed` | Wean-to-Service, Gestation, Lactation, Breeding Boar; Gilt Development on medium/low-lean lines (§8.2) | Layer 4: `kg/day = Reference Requirement (MJ/day) ÷ Feed Formula energy_density (MJ/kg)` | A real ration number |
| `ad_lib` | Grower, Finisher; Gilt Development on high-lean lines (§8.2); Boar Development ("near ad-lib pre-puberty", §8) | **No kg/day figure — none exists in the underlying science** (§7, B.2) | Which formula is in the feeder, when it switches, forward volume, drift alarm — "never an invented ration" (§7) |
| `Transitional` | Nursery / Weaner (§8) | **Undetermined.** §8 labels the modality "Transitional" and never resolves it to `curve_fed` or `ad_lib`. B.5 works a Nursery batch through the *ad-lib* phase-budget machinery, which implies ad-lib-like, but the PRD never says so. | — |

### Unit

**kg per head per day.** Not a pen total, not meals.

- §9.6: Feed Curve `points = {day, kg, source, derivation_tier}`.
- §12.3: theoretical consumption = "head-count × that day's applicable stage curve" — i.e. the curve is the per-head term.
- B.1: `58 MJ/day ÷ 13.5 MJ/kg = 4.3 kg/day — the pen default`; an individual override takes Sow #248 to 4.7 kg/day "for Sow #248 only; the pen default stays 4.3 kg/day for everyone else."

**No meal concept exists in the PRD.** Zero occurrences of meal, feeding time, drop, or any splitting of the daily figure across feedings. Whether the phone shows kg/head/day or a computed pen total (`head_count × curve`) is **not specified anywhere** — the PRD names no pen-total display.

**Hard prohibition:** the internal ad-lib daily rate (`phase_budget_kg_per_head ÷ phase_budget_duration_days`) is computed for Tier-2 variance only and is "never displayed to a farmhand" (B.5) / "never shown to a farmhand as a ration" (§9.3). It must not leak onto a pen card as a pseudo-ration.

### What it depends on

| Input | Where | Changes when |
|---|---|---|
| Reference Requirement, keyed on `genetic_line` × `sex_class` × `parity_band` × `stage` × day | §8.1, §9.2 | Batch creation; genetic line correction (explicit action, full recompute, §9.7) |
| Modality gate = f(stage, `genetic_line.lean_potential_tier`) | §7 L2, §8.2 | Genetic line changes |
| Batch strategy | §7 L3, §9.4 | Rarely, at batch start |
| Feed Formula `energy_density` + `energy_basis` | §7 L4, §9.3 | Whenever the assigned formula's data changes; on stockout fallback (§12.8) |
| Nutrition Contact override (whole-curve at MVP) | §7 L5, §16 | Never auto — flags for review (§13) |
| Adjustments (Layers 6, 7) | §9.11, §11 | Start date, expiry, explicit clear |
| `effective_day = calendar_days_in_stage + growth_offset_days` | §10 | **Daily**, plus recalibration from spot-check or a real move event |
| Week→day linear interpolation | §7.4 | Daily |

**How often it changes: daily.** `effective_day` advances every day and the day value is linearly interpolated between week-level anchors (§7.4, §16), so a curve-fed number drifts continuously (lactation ramp, late-gestation bump). Step changes come from stage transition, formula recompute, stockout substitution, and adjustment start/expiry.

### The `energy_basis` guard (§7.2)

Energy is expressed on an ME or NE basis and the two are **not interchangeable** — ME overvalues fiber/protein and undervalues fat relative to NE. Both Reference Requirement (§9.2) and Feed Formula (§9.3) carry an explicit `energy_basis: ME | NE`.

Layer 4 auto-derives **only when the two match**. A mismatch, a missing basis on either side, or a missing `energy_density` falls the curve point to `system_fallback` (§7.3) rather than silently dividing across incompatible units.

Curve point states (§7.3):

| State | Meaning | Recompute |
|---|---|---|
| `derived` | Computed normally through Layer 4 | Auto, silent, on any upstream change |
| `system_fallback` | System could not derive — **not a human decision** | Auto-resumes to `derived` the instant the data gap is fixed; **never needs a review flag to leave this state** |
| `nutritionist_locked` | A human deliberately set it | Never auto-resumes; upstream change raises a Review Inbox flag (§13) |

**What a guarded number means in the barn:** the figure on screen is the Precision Ladder Level 1 "Default" — a generic reference curve used untouched (§7.1), not divided against the actual feed in the silo. It is the least-precise tier available, it is a console data-entry gap (a missing or mismatched field on a formula), not a decision anyone made, and it will silently self-correct the moment someone fills the field in. UX-9 exists precisely so a typo cannot strand a curve permanently.

§5 ("Provenance over false precision": every computed or estimated number is labeled as such and never presented with more confidence than the data supports) requires this state be visibly distinguishable. **The PRD specifies no farmhand-facing copy for `system_fallback`.** The nearest specified string is UX-7's genetics-fallback message: "Using a generic reference curve — refine anytime" (§8.1) — which covers a different fallback (unset genetics key), not the energy-basis guard.

---

## Why it goes wrong

| # | Cause | § | Effect on the number | Farm hand notices? | Farm hand can correct? |
|---|---|---|---|---|---|
| 1 | **Wrong headcount** | §9.7, §12.3, §12.4 | Per-head kg/day is *unaffected* (it's per head). Breaks any pen total, all Tier-2 animal-days, and the Reference Requirement's production term | **Yes** — counting a pen is the archetypal barn act | Only indirectly, by logging `culled`/`died`/`sold`/`fostered` (§9.10). **The PRD never states `head_count` is event-derived** — it is a bare `int` (§9.7), in explicit contrast to `entered_stage_on`, which §9.7 says is derived from the Event Log and "never independently maintained". Gap. |
| 2 | **Stage mismatch (Grower→Finisher)** | §8.3, §10 | Only transition in the taxonomy with no real-world event; estimated from `effective_day` vs weight band. Wrong stage → wrong formula tier / wrong curve | **Yes** — pigs visibly off-size for the stage shown | **Yes.** One-click confirm on the physical pen move; a real `moved_to_grower`/`moved_to_finisher` event supersedes estimation entirely and auto-adjusts `growth_offset_days` by the projected-vs-actual delta (§10, ADV-6). The confirm click is itself "a free calibration signal even without a formal weigh-in" (§10) |
| 3 | **Growth offset stale / compensatory growth** | §10, NUT-7 | `growth_offset_days` defaults to 0 and only a spot-check weight recalibrates it. A single negative offset must not forward-project statically through a recovery period or the system under-projects growth and mistimes the next transition | Partly — animals off-size | **Yes** — log a spot-check weight. `spot_check_due` is one of only two Review Inbox item types routed to Farmhand (§13.1) |
| 4 | **Mixed-sex pens** | §7.5, §9.7, B.4 | Pen resolves to the **more nutrient-demanding represented sex** (typically gilts' higher lysine:energy), not an average. Barrows are mildly over-specified | **No — explicitly invisible.** B.4: the alternative error "shows up downstream as reduced lean gain and worse feed conversion for that half of the pen, not as a visible error anywhere in the system" | No. `sex_class` + `sex_mix_ratio` are batch-creation fields; §16 scopes the UI as "one optional field pair at batch creation". Whether they're manual or derived is Open Decision 9 |
| 5 | **Environmental** | §11.3, §15 | Cold (Breeding Boar: +0.1 lb/day per °F below 68°F). Heat stress (lactating sow): depresses *voluntary intake* above a heat-index threshold — the curve number stays correct and the sow does not eat it. Flushing efficacy is reduced under heat stress | **Yes, acutely** — feed left in the trough | Yes in principle, via an Adjustment. But at MVP this is "a manual seasonal toggle, not a live weather feed" (§11.3, §16), and **the PRD does not say who operates the toggle or where it lives** |
| 6 | **Individual animals** | §11.1, §8 | BCS / backfat off target. §8 flags individual override as "most active" in Lactation; §9.2 extends the body-condition check to boars | **Yes** — this is what a barn walk is for | **Yes** — §6 grants Farmhands "apply individual-override presets" |
| 7 | **Curve-point status** | §7.3, §13.2, §13.1 | `system_fallback` → generic reference (see above). `nutritionist_locked` → a human's number that may be stale (`override_aging` fires at 30+ days). A pending `formula_changed` flag → point temporarily reverts to `derived` with an "awaiting Nutrition Contact confirmation" badge | Only if labeled | **No** — §6: Farmhands "cannot edit curves, formulas, or Reference Requirements directly" |
| 8 | **Week/day interpolation** | §7.4, §16 | MVP stores week-level anchor points only; daily values are read by **linear** interpolation between adjacent weeks. A straight-line approximation of a curve that is not straight (lactation ramp, late-gestation bump) — a small systematic intra-week error | **No** | No |
| 9 | **Stockout / substitution** | §12.8, UX-13 | Silo empty, or refilled with a different formula → the displayed curve is stale and energy-mismatched against what's physically being fed | **Yes, extremely** — a barn observation by definition | Partly. A Farmhand can log `stocked_out` (auto-fires the fallback immediately and auto-reassigns) and act on `stockout_confirm` / `restock_switchback` items (§6, §13.1). **But** where no fallback is configured, §12.8 specifies an inline prompt "assign a substitute formula now?" — and §6 reserves assigning feed formulas to the Farm Manager. **Unresolved permission conflict** |
| 10 | **Reference-curve accuracy itself** | §12.2, §9.2, §15, UX-7 | §12.2 concedes the reference curve "can be off by double digits between sources". Boar curves carry `confidence_label = lower` (§9.2, NUT-14). An unset genetics key falls back to a generic curve (UX-7) | No | No |

---

## The adjustment primitive

One shape (§9.11) reused for individual/condition overrides, event-triggered modifiers (flushing), and environmental modifiers.

### Fields (§9.11)

| Field | Type | Notes |
|---|---|---|
| `scope_type`, `scope_id` | enum + ref | `animal \| pen \| batch \| curve` — plus which specific one |
| `adjustment_type` | enum | `percent \| absolute \| rate_per_unit` |
| `value` | number | — |
| `reference_variable`, `threshold` | text/number, nullable | `rate_per_unit` only, e.g. `ambient_temp_F` / 68 |
| `unit` | text, nullable | e.g. lb/day |
| `severity_band` | ref, nullable | Links a BCS score or backfat-mm reading to standard guidance (§11.1). **Optional** — the flat preset dropdown remains available with no numeric entry required |
| `reason`, `applied_by` | text/ref | — |
| `start_date` | date, **required** | — |
| `expires_at` | date, nullable | "A prompted field at creation, not a silent optional" (§9.11, §13.1) |

### Scopes — with a caveat

The enum is `animal | pen | batch | curve`. But §7 Layer 6 describes it as "per-animal or per-pen"; §11.1's severity bands are written entirely around an individual animal's BCS/backfat; and **both** §11.3 environmental examples use `scope_type = curve`. **The PRD never maps a preset band to a scope**, and never says whether a pen-scoped adjustment on a curve-fed pen shifts every animal's kg/head/day or something else. Could not determine.

### Bounded vs free entry

| Type | § | Bounded by | MVP form |
|---|---|---|---|
| Individual / condition | §11.1, §16 | **Severity-banded preset table** — Band 1 (mild, BCS ~2.5-3), Band 2 (moderate, BCS ~2, time-boxed, re-check before next critical event), Band 3 (severe, BCS ≤1.5, flagged for Nutrition Contact awareness), plus Over-conditioned (BCS ≥4). **Asymmetric by design**: restriction near farrowing is riskier than supplementation, so the over-conditioned band restricts more conservatively than the equivalent thin band increases | Preset dropdown. §16: "Reserved schema; severity-banded preset dropdown, **not a BCS-scoring engine**" |
| Numeric BCS / backfat-mm | §11.1, NUT-12 | Optional middle tier between the subjective dropdown and deferred IoT; **maps onto the same band table**. Rationale: many farms already collect caliper BCS or ultrasound P2 backfat at breeding and pre-farrow, and forcing that through a binary bucket discards real farm data | Optional numeric entry; dropdown alone "remains fully sufficient" |
| Event modifier (flushing) | §11.2, §16 | `percent`, `start_date`, **bounded duration**. Gated by `flushing_window_days_before_transition` for Gilt Development (so the action only appears in the last N days of the stage, ADV-9); flat availability for Wean-to-Service; skipped for first-time gilts in Wean-to-Service (§8) | "Manual button with start date + duration" |
| Environmental | §11.3, §16 | `rate_per_unit` + `reference_variable` + `threshold` + `unit` | "Manual seasonal toggle, not a live weather feed" |

**Free numeric entry is not granted to the barn.** §6 gives Farmhands "apply individual-override presets" only; whole-curve and point-level overrides are Farm Manager / Nutrition Contact. The PRD never specifies a free kg/day entry for a Farmhand.

**Exact preset values do not exist yet.** §11.1: "illustrative structure below; exact thresholds are Open Decision 8" — "the schema is settled, the values are not" (§17).

### Duration / expiry model

- `start_date` required; `expires_at` nullable but prompted at creation (§9.11, §13.1).
- Layers 6 and 7 **never recompute**: "time-bound, expires or is cleared explicitly" / "time-bound or condition-bound" (§7).
- `override_aging` Review Inbox item fires when any Adjustment is **30+ days old with no `expires_at` reached**, routed to whoever applied it, or the Farm Manager (§13.1). A standing "overrides older than 30 days" view surfaces from the same item type.

---

## Review flow

### Adjustments apply immediately. There is no approval gate.

Layers 6 and 7 take effect on `start_date` (§7, §9.11). B.1 shows the +10% landing directly on Sow #248's ration. The only Review Inbox item touching an Adjustment is `override_aging`, which fires **30 days later** — an anti-staleness nudge, not an approval. This is consistent with the product's no-submit-button posture.

### §13.2's interim behaviour is about formula changes, not about adjustments

`formula_changed` fires when a formula change would affect a `nutritionist_locked` curve point. While that flag is pending (§13.2):

- the affected point **falls back to auto-computed (`derived`)**, and
- carries a visible **"awaiting Nutrition Contact confirmation"** badge, and
- the `nutritionist_locked` value is **preserved and restorable — not discarded, only temporarily superseded for feeding purposes** until reviewed.

Rationale: "a fresh auto-derived point is safer than an increasingly stale manual one, particularly for an off-site consultant who may not see the flag for weeks."

**What the farmer sees in the meantime:** the system's freshly recomputed number, *not* the nutritionist's number, plus a pending badge. So during a review window the displayed ration can legitimately differ from what the nutritionist last set, and the phone must be able to say so.

Fallback activation on stockout is treated as a `formula_changed` event for review purposes on any locked point — flagging rather than silently carrying a now-energy-mismatched absolute kg/day forward. The inventory side switches immediately regardless (§12.8, ADV-2).

### Who reviews what (§13.1)

| Item type | Fires when | Routed to | Barn-relevant? |
|---|---|---|---|
| `formula_changed` | Formula change would affect a `nutritionist_locked` point | Nutrition Contact | Read-only awareness |
| `stockout_confirm` | Tier-1 projected balance crosses zero (**never auto-fires a reassignment**) | Farm Manager | Triggered by barn reality |
| `restock_switchback` | `restocked` logged while a fallback substitution is active | Farm Manager | Yes — one-click "switch back?" confirm; §6 routes stockout/restock confirms to Farmhands |
| `variance_flagged` | Closed period's variance exceeds noise tolerance | Farm Manager | No |
| `override_aging` | Any Adjustment 30+ days old, no `expires_at` reached | Whoever applied it, **or** Farm Manager | **Yes** — a Farmhand's own adjustment comes back to them |
| `spot_check_due` | `growth_offset_days` not recalibrated in a configurable interval | **Farmhand** / Farm Manager | Yes |
| `phase_diet_switch_due` | Estimated days-on-formula approaches `phase_budget_duration_days` (§12.11) | Farm Manager | Physical feed changeover happens in the barn |

### Delivery constraint

§13.1: "**Visibility on login** satisfies 'never silently discarded' at MVP; push/email/escalation timing is deferred to Phase 2." §16 repeats it. **No push notifications at MVP** — the inbox must be found, not delivered.

---

## Console-only (excluded from the phone)

Verified against §6 role permissions and each section's own scoping language.

| Excluded | § | Basis |
|---|---|---|
| Tier-2 Feed Variance, reconciliation periods, closed-period math | §12.1, §12.3, §9.16 | §6: cost/variance reporting is Farm Manager. Note the split: **logging** a Physical Count *is* a Farmhand action (§6, §9.13); **reading** the variance is not |
| Feed Variance $, `estimated_loss_dollars`, WAC, cost layers, batch feed cost | §12.5, §12.6 | §6 Farm Manager. §12.6: variance $ is a pure usage variance with price effects deliberately excluded — must never be misread as a purchasing-efficiency signal |
| Persistence / trend display ("last several periods' signed variance side by side") | §12.4 | Scoped to "a farmer or Nutrition Contact" |
| Formula management, formula assignment, `fallback_formula_id` | §9.3, §9.4, §6 | §6 Farm Manager. **Conflicts with §12.8's inline "assign a substitute formula now?" prompt** — see Why it goes wrong #9 |
| Curve authoring — whole-curve and point-level override | §9.6, §16, §6 | §6: Farmhands "cannot edit curves" |
| Reference Requirements | §9.2 | "Static and centrally maintained — never edited at the farm level"; Sentri Admin |
| Genetic Line catalog; `genetic_line_id` correction | §9.1, §9.7 | Sentri Admin; correction is an explicit action triggering full recompute, "never a silent edit" |
| Batch strategy | §7 L3, §9.4 | Farm Manager, at batch start |
| `sex_class` / `sex_mix_ratio` | §9.7, §16 | §16: "UI is one optional field pair at batch creation" |
| Data migration / import-as-locked / stage-by-stage unlock | §14 | Onboarding, console |
| Forward purchase forecast (`expected_total_kg`) | §12.11, B.5 | "Surfaced wherever Purchase planning happens — **not as a per-pen ration**". Logging a purchase receipt is a Farmhand action (§6, §9.12); *planning* is not |
| Discontinue-formula action | §12.9 | Forces a final count and formal close |
| Energy / MJ / `energy_basis` / SID lysine as farm-facing data | §2, §5 | §2: farms "do not track — and should not be asked to track — energy or amino-acid requirements". The whole design anchors the farm on kg/day |
| **The internal ad-lib daily rate** | §9.3, §12.11, B.5 | "Never shown to a farmhand as a ration" / "never displayed to a farmhand". Hard prohibition |
| **Any invented per-pen ration for an ad-lib stage** | §7, B.2, B.5 | "Never an invented ration"; "intake is observed, not prescribed" |

### Not console-only — three things the PRD explicitly contemplates in a farmhand-facing view

1. **Tier-1 Projected Balance.** §12.2 constrains rather than excludes it: "Never rendered as a raw negative number in a farmhand-facing view — shown instead as **'unconfirmed since [date] — count to verify'** in a neutral state." Plus: must be labeled "projected / unconfirmed", never "inventory"; treated symmetrically regardless of sign (an unverified positive is exactly as untrustworthy and "more likely to be wrongly trusted because it looks fine", ACC-8); and every Tier-1 display carries a **staleness indicator** (days/purchases since the last count).
2. **Physical Count and Calibration entry** (§9.13, §9.14, §6) — including reporting in a natural unit (scoops, bags, gauge marks, level fraction).
3. **Review Inbox items routed to Farmhands** — `spot_check_due`, `stockout_confirm`, `restock_switchback`, and own-authored `override_aging` (§13.1, §6).

**Undetermined role assignment:** Disposal (§9.15, `recorded_by` only) and Calibration (§9.14, `set_by` only) are never assigned to a role in §6. Both are physically barn/yard acts. Could not determine whether they are phone-facing.

---

## MVP vs Phase 2 (§16), phone-facing only

| Capability | MVP treatment | Phone read |
|---|---|---|
| Derivation math, week-level anchors + linear daily interpolation | **ON** | The number exists day one; intra-week values are interpolated |
| Purchase logging | **ON — always logged, non-optional** | The one input the whole cost model depends on (§9.12) |
| Physical Count / Calibration | **ON as optional** — any confidence tier, including `self-reported` | `self-reported` is the lowest tier of the same mechanism, and "never triggers a compliance alert on its own" (§12.10) |
| Tier 1 Projected Balance | **ON** — once any purchase exists | Subject to §12.2's farmhand rendering rules above |
| Tier 2 Feed Variance | **ON** — once any closed period exists | Console reading |
| Stockout detection & substitution | **ON** — human-confirm gate on projection-based detection; auto-fire **only** on explicit log | Asymmetric by trigger (§12.8, ADV-1/UX-3) |
| Phase feed budget (forecast + `phase_diet_switch_due` nudge + ad-lib Tier-2 baseline) | **ON** — "no new UI paradigm" | Nudge routes to Farm Manager; the physical changeover is a barn act |
| Mixed-sex pen resolution | **ON** — schema + resolution rule only; defaults to single-sex behaviour when unset | Invisible in the barn |
| Review Inbox | **ON** — elevated to a first-class MVP primitive | **Visibility on login only; push/email/escalation deferred** |
| Data migration (import-as-locked) | **ON** | Day-one feeding is unchanged from the farm's existing program (§14) |
| **Individual / condition override** | **Reserved schema** — severity-banded preset dropdown, not a scoring engine | The phone's main adjustment path ships as a shape, with values still open (OD "8") |
| **Event modifiers (flushing)** | **Reserved schema** — manual button, start date + duration, windowed per §8.2 | — |
| **Environmental modifiers** | **Reserved schema** — manual seasonal toggle, not a live weather feed | Actor and location unspecified |
| Batch strategy | Reserved schema, one default objective initially | — |
| Persistence / trend detection | Reserved schema, human-eyeballed display | Console |
| Nutrition Contact override | **Whole-curve only at MVP**; point-level as fast-follow (resolves ADV-7) | Not a phone surface either way |
| Per-animal IoT precision feeding | **Deferred** — 8-10% ceiling needs Gestal-class hardware most farms lack | — |
| AI-driven curve recommendations | **Deferred to Phase 2** | — |
| Price / purchasing-variance tracking | **Deferred** — variance stays usage-only | — |
| Tenant-specific Reference Requirement curves | **Deferred** pending OD 1 | — |
| Push / email / escalation | **Deferred to Phase 2** | Hard constraint on any notification-led phone flow |

The pattern that matters: **every adjustment capability the phone needs is "reserved schema" at MVP.** The UI shape is settled; the numbers behind the presets are not.

---

## Inputs the barn must supply

Everything the PRD assumes arrives from someone walking a building. Flagged as requirements on check-in design.

| # | Input | § | Assumed by | Capture path defined? |
|---|---|---|---|---|
| 1 | **`head_count`, kept current** | §9.7, §12.3, §12.4 | Every Tier-2 animal-days calc; the Reference Requirement's production term | **No.** Bare `int` with no stated derivation, in explicit contrast to `entered_stage_on`. §12.3 further needs headcount **per day across a period**, implying a headcount *timeline*, not a current value |
| 2 | **Spot-check weights** | §10, §6, §13.1 | `growth_offset_days` recalibration; both the curve lookup and the transition threshold | Partly — `spot_check_due` nudge exists; entry form unspecified |
| 3 | **Grower→Finisher confirm on physical pen move** | §8.3, §10 | The only transition with no real-world event; the confirm click is itself a free calibration signal | "One-click confirm" named; nothing further |
| 4 | **BCS score / backfat-mm** | §11.1 | Severity-band selection; optional numeric middle tier | Optional; band mapping is OD "8" |
| 5 | **`estrus_observed` events** | §8.2, §9.10 | Estrus-count + min-age co-gate out of Gilt Development. Farms that don't detect heats fall back to age + weight | New event type; capture unspecified |
| 6 | **Physical Counts in a natural unit** | §9.13, §9.14 | Every closed period, therefore all of Tier 2. `raw_quantity` + `calibration_id` must both be stored so a later calibration fix repairs history retroactively (ENG-12) | Fields defined; `confidence_tier` inherits from the Silo and is only overridable "if the method genuinely differed that day" (UX-12) |
| 7 | **`stocked_out` / `restocked` events** | §9.10, §12.8 | An explicit log **auto-fires** the fallback and auto-closes the silo's count period at the moment of substitution, prompting a count at the transition point | Event types exist |
| 8 | **Disposal (spoiled / contaminated / pest-damaged), kg + reason** | §9.15, §12.7 | Nets out before variance so a storage failure never implicates farm staff | Record defined; **no role assigned** |
| 9 | **Purchases** — `delivery_date` (authoritative) vs `logged_date` (tracked separately to detect entry lag) | §9.12, §12.5, UX-2 | All costing | Farmhand-permitted (§6) |
| 10 | **`fostered` events** | §8.3 | Required before a litter can transition when the dam is culled or dies mid-lactation | Event type exists; flow unspecified |
| 11 | Core event log: `selected, serviced, farrowed, weaned, estrus_observed, moved_to_grower, moved_to_finisher, culled, died, fostered, sold, stocked_out, restocked` | §9.10 | "Almost every date-based computation in the system" | Enum defined |
| 12 | **`sex_class` / `sex_mix_ratio`** | §9.7 | Mixed-sex resolution | Manual-at-creation vs derived-from-animal-records is **OD 9**, which §17 says "affects the Nursery and Grower batch-creation flow" |
| 13 | **Environmental seasonal toggle** | §11.3, §16 | Cold and heat-stress modifiers at MVP | **Actor and surface unspecified** |
| 14 | **`weaning_age` as a parameter** | §8.1, §15, NUT-5 | Nursery diet phasing; the sow's wean-to-estrus interval | "A tracked parameter, not just an event" — derivable from farrowed→weaned dates, but stated as its own parameter |

### Structural gaps between the PRD's model and a unit-scoped phone app

- **No location hierarchy above Pen.** §9.8 Pen is `id, farm_id, name/location, current_batch_id`. Zero occurrences of unit, room, house, site, or building anywhere in the document. A unit-scoped pen list has no schema support in this PRD.
- **Pen↔Batch is modeled 1:1** (`Pen.current_batch_id` / `Batch.current_pen_id`). No support for two batches in one pen, or one batch spanning pens.
- **No Silo↔Pen link exists.** §12.3 says variance reports per-silo, "which may feed multiple pens or stages", and §9.9 explicitly rejects a 1:1 formula↔silo assumption — but no field connects a Silo to the Pens it feeds. A pen card cannot resolve which silo it draws from.
- **No offline or sync story.** Zero occurrences of offline, sync, or conflict resolution — despite the entire design assuming data capture inside barns.
- **No photo capture** anywhere.
- **`farm.unit_system` is claimed but not defined.** UX-10's resolution reads "farm.unit_system: metric|imperial; internal storage stays metric (§7)" — **§7 contains no such field**, and §11.3's boar example is stated in lb/day while curves are in kg. The metric/imperial rule is asserted in the appendix and never specified in the body.
- **The late-gestation bump's gating mechanism is asserted, not specified.** ADV-10's resolution reads "human-observed/invoked via the existing override preset (§8.2)" — §8.2 is entirely about Gilt Development and says nothing about it. §8's stage table only notes "Late-gestation bump — all parities, scaled by parity band". So a barn-observed gestation bump is implied by the appendix but has no defined trigger.

---

## Open decisions (§17) that touch the phone

**Citation warning:** §17's bullet list has nine items, but in-body cross-references are stale — §17's own preamble notes two items were resolved and removed this round. §11.1 cites "Open Decision 8" for severity bands (list position **6**); §12.5 cites "Open Decision 7" for the WAC window (list position **5**). Cite by content, not number.

| Item (by content) | Phone impact |
|---|---|
| **Exact severity-band thresholds** (BCS/backfat-mm cutoffs and corresponding %/kg guidance) for §11.1 — needs nutrition-advisor input; "the schema is settled, the values are not" | **Blocking.** This is the phone's primary adjustment control. The preset list can be built; its contents cannot |
| **Whether `growth_offset_days` (weight calibration) and feed calibration (scoops/gauges) share implementation** — the same self-correction pattern on two axes | Both are barn actions. Shared implementation would mean one calibration concept in the app rather than two |
| **How noise-tolerance bands per confidence tier get set** — fixed percentage per tier, or empirically calibrated per farm/silo over time | Determines whether a count a farm hand logs produces a variance flag or silence — i.e. whether counting feels consequential |
| **Default `phase_budget_kg_per_head` / `phase_budget_duration_days` by stage and genetic line** — "schema settled, values not" | Absence leaves ad-lib batches with no Tier-2 baseline **and no `phase_diet_switch_due` nudge**. The ad-lib pen card's "when does the formula switch" content depends on these |
| **Whether `sex_mix_ratio` is entered manually at batch creation/merge or derived from linked individual-animal records** — §17 states it "affects the Nursery and Grower batch-creation flow" | The only open decision §17 itself ties to an operational flow. If derived, it depends on individual-animal records the barn maintains |
| **Minimum age / estrus-count default thresholds for the Gilt Development gate** (~220-230 days, 2nd-3rd estrus, pending confirmation against the farm's genetic line) | Determines whether logging `estrus_observed` in the barn has any consequence |

Not phone-facing: Reference Requirement curve ownership (global vs tenant-scoped); default source for launch reference curves; WAC trailing-window length.

---

## What could not be determined from the PRD

1. **Nursery's modality gate output.** §8 says "Transitional"; never resolved to `curve_fed` or `ad_lib`. B.5 runs a Nursery batch through ad-lib phase-budget machinery without saying so.
2. **Whether the phone shows kg/head/day or a pen total.** The curve is per-head (§9.6, §12.3, B.1); no pen-total display is named anywhere.
3. **What a `pen`- or `batch`-scoped Adjustment does to a curve-fed pen's per-head number.** The scope enum includes them (§9.11); nothing maps a preset band to a scope, and both §11.3 examples use `curve`.
4. **Farmhand-facing copy for `system_fallback`.** Required to be labeled by §5; string never specified. UX-7's "Using a generic reference curve — refine anytime" covers a different fallback.
5. **Who operates the environmental seasonal toggle, and where.**
6. **Whether Disposal and Calibration are Farmhand actions.** Neither appears in §6.
7. **How `head_count` is maintained.** No derivation rule; §12.3 additionally implies a per-day headcount history.
8. **The `assign a substitute formula now?` permission conflict** (§12.8 vs §6) — unresolved in the document.
9. **Metric/imperial handling.** Asserted in UX-10, absent from the body.
10. **Offline behaviour.** Not addressed at all.
