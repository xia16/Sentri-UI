# Inspection product audit — Astra second pass

Date: 2026-09-12. Scope: source audit for the inspection concept; not a replacement PRD. Sources below are repository documents, with original Figma node IDs where available. Paths in this report are relative to `ux/` unless otherwise stated.

## Main corrections

1. **Use the overview for the unit's composition.** Current `system/inspection-astra-concept.js:46` spends half the overview on an initially empty updates counter. The original check-in study has cohort cards with batch, day/stage, population, pens, and feed formula (`system/check-in.html:588–590,613`). Tap scopes the list; a no-batch composition entry covers animals outside cohorts. A compact stage composition overview is consistent with the user's new direction. Stage totals must derive from the actual animals and compose with attention filtering; do not call biological stages task statuses.
2. **Restore counted All / Health / Feed attention filters.** The original screen already contains these (`system/check-in.html:591,614`). Health and Feed overlap and are not mutually exclusive herd states. Numbers are counts of matching pigs, not records. Keep batch/stage scoping separate. Current `Instructions` omits diseases and symptoms; current Feed includes any manual instruction, even non-feed `Check appetite today` (`inspection-astra-concept.js:25,46`). A pen equipment fault should have its own pen scope rather than making all its pigs appear to have a feeding adjustment.
3. **Health must lead the pig row when present.** Original production explicitly requires disease/symptom text only when present (`research/inspection/part-a.md:158–176`, Figma `749:2125`). The consolidated grammar prioritizes case + age, then parity/age and actual treatment/feed trail (`system/check-in.html:748–749`). Current `pigRow` uses `manual ? instruction : condition`, suppressing an open condition whenever an instruction exists (`inspection-astra-concept.js:45`). Preserve both the important case and a relevant handling instruction, with one clear hierarchy.
4. **Replace the generic bulk feed preset.** Current `applyRecord` changes every selected ration-fed pig to exactly +10% or standard (`inspection-astra-concept.js:31,55,60`) irrespective of the condition that justifies it. The consistent part of the consolidated model is a condition-led plan: mark Thin/Fat, apply each animal's configured severity band, derive a trough total, or send its individual ration to the station. See the feed conflict below; exact preset values are not approved clinical/nutritional values.
5. **Maintenance is independent of ad-lib feeding.** Current Report issue is only exposed from ad-lib feeding, records a single pen string, and combines feeder emptiness with device faults (`inspection-astra-concept.js:62,64,73`). Original production has both pen and unit equipment entry, typed devices, multiple Other fault records, and a fault count on the pen. Provide a pen-scoped Report fault path and a unit equipment list. Feeder refilling is not automatically equivalent to repairing a device.
6. **A four-action update sheet does not represent inspection's action catalogue.** Disease/symptom, recovery/correction, triage, treatment, death, body measures, and context-eligible production acts exist in the source. Organize the first-level sheet by clear subject/category, preserving pig multiselection and a separate pen tools entrance. Avoid displaying a large list of non-working placeholders as though flows were complete.

## Feed model: what is established

| Rule | Source | Consequence for the prototype |
|---|---|---|
| Breeding curves can resolve kg/head/day; ad-lib growth never resolves an invented daily ration | `research/checkin/feed-mobile.md:9–39` citing Feed PRD §7, §9.3, B.5 | Show a pen total for shared delivery, individual station context, or ad-lib + formula. Never put the internal ad-lib budget rate in the farmer UI. |
| Farmhand can apply individual-override presets; no free kg/day authoring is granted | `feed-mobile.md:119–126`, PRD §6, §11.1 | Use configured bands and explicit purpose, not a free percentage or kg editor for selected pigs. |
| Presets are severity-banded and asymmetric; exact values are unresolved | `feed-mobile.md:119,126,275`, PRD Open Decision 8 | Mark prototype values as sample configuration in study documentation; do not imply a universal +10% rule. |
| Start date required, expiry prompted, adjustment remains until expiry or explicit clearing | `feed-mobile.md:108–109,128–134`, PRD §9.11 | A review date is not an expiry date. Label each accurately; don't silently return to base merely because review is due. |
| An override applies directly; later aging review is not an approval gate | `feed-mobile.md:140–142` | No invented manager approval step for individual presets. |
| Manual delivery instruction vs already-applied plan are different | `system/check-in.html:719,749` | Amber actionable `+0.4 kg` / `no feed` vs quiet `feed +10%` inside trough total or delivered by station. Do not ask to do the same adjustment twice. |
| Routine delivery needs no compliance tap; record deviations | `system/check-in.html:718` | Don't turn every normal feed instruction into a required Done record. |
| Formula switch is the ad-lib event; formula name and timing matter | `system/check-in.html:728–735,927–935` | A switch-day transition can draw attention; ordinary ad-lib mode is quiet. |

### Feed contradictions that must remain explicit

- `system/check-in.html:648` says pen Feed can adjust the pen by %, single-pig Feed is N=1, and shared percentages across arbitrary selected pigs are deliberately impossible.
- The same file at `:704` says bulk Thin/Fat marks **replace pen feed adjustment**. `system/components.html:1082` says Feed is never a verb: adjustments are a case consequence. `research/ops/pen-ops.md:7–9` repeats the latter rule.
- The Feed PRD extraction itself does not map pen/batch-scoped adjustments to a clear execution model (`feed-mobile.md:113,290`). Therefore a free whole-pen percentage editor cannot be called a settled production requirement.
- Recommended resolution for this concept: follow the coherent case-led / farm-configured preset model in components + operations, keep pen feeding readable, and retain the direct-pen-percentage dispute as an open product decision.
- Formula assignment permissions also conflict: stock-out can automatically invoke a configured fallback, while manual substitute assignment belongs to a manager (`research/ops/pen-ops.md:62–69`). A farmer can record an actual switch to an already configured due formula without being granted arbitrary formula authoring; label this a proposed workflow where the source has no barn screen.
- The claim in an older study that trough-fed pigs categorically cannot be fed separately is too broad. Preserve configured manual top-dress/withhold instructions and distinguish them from a shared allocation; do not assert individual intake from a pen total.

## Required action families and semantics

| Family | What exists | Important rule / source |
|---|---|---|
| Health | Add diseases **and** symptoms, recover/remove, adjust triage, record treatment, report death | `research/inspection/part-d.md:48–80`, original drawer `853:2120`. Disease/symptom selection is multi-select across both kinds, ≥1 required (`272:3354`, `272:3480`). |
| Add condition | Separate diseases/symptoms fields or clearly separated catalogue sections, triage, optional evidence | `research/ops/health.md:91–137`. Existing carriers must not get duplicate cases or a reset onset day. Catalogue determines case vs characteristic; the worker does not classify data types. |
| Resolve | Recover = no longer true; remove/correct = never true | `ops/health.md:147–186`. Preserve the distinction and old record audit. Don't implement both as deleting the current condition string. |
| Triage | Attention level associated with an open case; can be updated | Production has urgent/priority/routine/healthy (`part-d.md:169–189`); consolidated model uses Hospital pen / Treat in place / Monitor (`ops/health.md:100`). This is a documented redesign, not production verbatim. |
| Treatment | Record the administered action, drug/dose/method and related observations | `part-d.md:260–307`. This does not mean inventing a prescription recommendation or dose. |
| Body condition / feed | Thin/Fat or the configured severity band carries an appropriate individual plan | `check-in.html:704,719,749`, `feed-mobile.md:119–126`. Plan must remain visible on the pig and included in feed context. |
| Measures | Weight, backfat, body temperature | `research/ops/measures.md:3–10,175–182`. Each animal gets its own measurement in a conveyor; bulk selection must not copy one body reading to all pigs. |
| Production | Heat, pregnancy result, returned to heat, abortion; farrowing/weaning and replacement-stock work where eligible | `research/ops/cycle-adhoc.md:104–133`, `research/inspection/part-c1.md`, `part-c2.md`. These have real state/batch effects; showing only a note field as a substitute would be wrong. Abortion is single; heat/pregnancy/return can share a valid batch payload in the consolidated model. |
| Other records | Notes, transfer, missing, fostering, identity, untagged count | `part-e.md:70–120`, `ops/pen-ops.md:175–224`. Untagged populations are counted groups, not fabricated individual IDs. |
| Pen maintenance | Report fault, read fault, resolve fault; separate pen note | `research/ops/pen-ops.md:93–189`. Device + required description; Other additionally requires device name. Typed device with existing fault opens its record instead of duplicating. Resolve one record at a time. |
| Unit finish | Optional environmental readings, optional unit note, check-in stamp | `system/check-in.html:863–891`, `research/inspection/part-a.md` Figma `1506:2768`/`1563:2560`. Positive acts are saved during the walk; finish records that the unit was covered, not a declaration that every animal is healthy. |

## Pen maintenance details worth preserving

- Original equipment types are Feeding station / Drinking station / Other; all other device names are entered at report time. (`research/inspection/part-b.md:73–116`, `1574:4029`)
- Original faults carry pen, device, description, reporter and timestamp. Typed devices cannot have duplicate open faults; Other can hold multiple records. (`part-b.md`, annotation `928:2008`)
- Old annotation says typed faults need no note, but the later form requires Description; the consolidated operations spec explicitly chooses the required field. (`ops/pen-ops.md:40–46`)
- Production has no resolve screen despite requiring per-record resolution. The consolidated proposed sheet adds optional resolution note plus stamped actor/time. (`ops/pen-ops.md:134–170`)
- Production has no photos for faults. Optional photos are a deliberate addition in the operations study; severity/assignee/due-date dispatch machinery is not established. (`ops/pen-ops.md:102–110`)

## Proposed scope for the next prototype pass

Start with a unit composition overview, counted All/Health/Feed views and advanced batch/stage scope; preserve grouped pig selection. Implement multi-condition records, visible existing cases, individual body-condition/feed context, and maintenance report/detail/resolve for every pen. Keep per-pig measurements and clear batch scope. The source contains many more action flows; any narrower prototype coverage should be listed honestly in its study notes rather than implied to cover all production operations.
