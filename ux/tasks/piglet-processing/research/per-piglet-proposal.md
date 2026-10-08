# Proposal: how per-piglet work fits Sentri (2026-10-07)

Research + proposal by a research agent for the owner (round 10). Nothing built. Sources tagged S (sourced) / I (inferred).

**Short answer:** production already draws the same per-piglet actions (give ID, weigh, record sex, mark as breeder) three times — in piglet processing (Figma 8003:12183/12056), the weaning check (断奶检查 8023:18354/17634/17870) and 巡检 (walk-round inspection, `ux/research/inspection/part-c2.md`). The repo's ops research (`ux/research/ops/place-identity.md` §2.2–2.3, `measures.md` §2) already designed them as single shared actions but they were never built. Proposal: make them **pig/pen features any task can open**; a task only **reminds** and **counts progress**, never owns the data.

## 1. How farms do it
- **IDs** depend on farm type: commercial farms buying gilts often identify no piglets; nucleus/GGP/原种场 notch every piglet at day 0–3 with birth weight (公单母双); self-replacing farms notch candidates at birth, tag at selection; modern breeding farms tag only at day 2–3. PIC tags only females within 12 h (tag = candidate flag). Two people, hands full, one piglet at a time; tags on pre-printed strips — the costly error is drifting one number off the strip. National 防疫 tag out of scope. (S: practice-skips-castration-identity.md §3.1; sohu 701348904, 315316333; PMC7770622; NMSU B602; cpsswine; PIC gb.pic.com; farrowing identity.md; MOA 2021 tag spec)
- **Weighing:** breeding herds weigh individually at ~24 h, day 21, weaning; commercial farms mostly litter totals (S: EAAP 2015 S46_04; FAO agris; I). Production asks litter total at processing (Figma 1000:5357).
- **Sex:** visible at processing; litter boar/gilt split drives castration and gilt tagging (I); production asks litter counts at processing and weaning, sex required with an ID (Figma).
- **Breeders (留种):** staged — candidate at birth/processing, retention checks at day 4, weaning (~24 d), end of nursery (~70 d), pre-selection (~190 d); final 猪只选种 turns a meat pig into breeding stock (mother's ear number optional). Criteria: ≥7 good teats per side, no inverted teats, sound legs, no hernia/atresia, birth weight >1 kg, ~7 kg at weaning, mother's record. (S: PIC; gxswine help; thepigsite; 3tres3; NY/T 822 / GB/T 45554-2025 search only.) No Chinese source on 初选 timing (I: same stages).
- **For the product (I):** most farms need litter numbers plus a candidate flag; a few need full per-piglet records; breeder choice runs processing → weaning → ~180 d, so it can't belong to the processing task.

## 2. What the product already has (reuse)
| Where | What | Reuse |
|---|---|---|
| Figma 仔猪处理 8003:12183/12056 | 耳标/耳缺/体重 sub-form: litter weight, boar/gilt counts, rows tag·notch·sex·weight via 扫描耳标/选择耳缺/手动添加 | Field set, entry doors |
| Figma 断奶检查 8023:18354/17634/17870 | 仔猪信息: counts (healthy/weak/deformed), litter weight + switch for individual weights, boar/gilt, **留种仔猪 list**; 选择留种仔猪 drawer lists all piglets with health flags incl. 无身份 rows; ticking untagged opens 补充身份 | Pick list with health; "picking an untagged pig asks for its ID first" |
| 巡检 (`part-c2.md`) | 标记/移除留种 on any selection; **ear tag required before marking**; sex required; 3-step 补充身份 | "ID before breeder" |
| `ops/place-identity.md`, `measures.md` | Designed, unbuilt: Assign identity (one sheet per pig, Confirm & next, mother when known, reachable anywhere); inline gate "identity first · 2 of 3 · next: 留种"; Mark/Unmark 留种; Weigh (tagged one by one; untagged = kg × n) | Core of the proposal |
| `ux/model/product-model.html` §4, §6 | "Assign identity is one event, reachable from anywhere"; Weaning = counts + weights + sex + 留种 | Already argues shared |
| `ux/system/inspection-astra-concept.js` | Pig record page (IDs, dam/sire, teat count, piglet growth), Record weight, dock Scan ear tag · Search · Go to pen | Pig card + scan dock |
| Farrowing | Tag pre-filled from strip, scan overrides, one piglet per confirm; pen = drawer, deeper work = page; Back | Look and navigation |
| Simple prototype `simple/` | Piglets tab; ID page; farm scheme setting | Becomes the shared Give IDs page |

## 3. Proposal
### Model
| Owned by the pig / pen (usable anywhere) | Owned by the task |
|---|---|
| ID, sex, weight, mother, breeder yes/no, litter weight, litter boar/gilt counts; their edits (stamped, original kept) | Treatment checklist; **when** ID/weighing is due per farm scheme; a reminder row + progress read from the pigs ("Tag · 12 left") |

A task never stores per-piglet facts; it reads them (tagging during an inspection lowers processing's "12 left"). Words: **Give ID**, **Weigh**, **Keep as breeder / Not keep**, **Breeders page** per batch. Three doors to the same sheets: (1) a pen's **Piglets** tab in any task (and inspection); (2) **Scan ear tag** → pig card; (3) the **pig card** (ID, sex, mother, weights, breeder; Weigh · Keep as breeder · Edit). A task shows the work as a timeline step, a job chip and an End-review line.

### Flows
**(a) Tag + weigh a litter in processing:** pen A03 → "Today · Day 3 · Tag piglets · 12 left" → Give IDs page ("A03 · sow 000418 · 12 without ID"; `Use 001237`, scan overrides) → Boar/Gilt → weight (optional) → Keep as breeder switch (gilts, if the farm picks here) → Record · next piglet (saved now, tag → 001238) → after the last, Litter weight (optional; boar/gilt counts fill from rows) → Back: "Tag done".
**(b) Untagged pig found during another task:** pen sheet "C2 · 14 pigs · 2 without ID" → Give ID (same page, one pig) → tag + Record; mother filled only if the pen holds one litter with no arrivals, else "Mother unknown"; processing's "N left" drops if open.
**(c) Breeders for a batch (placeholder ranking):** task header / Breeders chip → "Breeders · batch 27": suggested gilts (placeholder order) with ID or "no ID · pen A03", mother, one reason line; health flags shown; mother-unknown gilts listed apart "not ranked" → pig card with a read-only "check on the pig" list (teats 7+7 · legs · no hernia) → Keep as breeder (ID sheet first if untagged) → "6 kept"; Not keep always available.
**(d) Pen with moved-in piglets:** drawer warning "Has 3 piglets from other pens · suggestions may be off"; tagged-before-move keep their mother; untagged arrivals "Mother unknown"; Give ID in that pen adds Born here / Moved in (spray mark), default Born here.
**(e) Fix a wrong ID/sex/weight:** scan or tap the row → pig card → Edit → Save change (stamped, old value amber) → side effects stated in one line ("Sex changed to boar · removed from breeders · castration +1 owed"); duplicate tag refused.

### Where it lives
| Piece | Screen | Opened from |
|---|---|---|
| Piglets tab | Tab in the pen drawer | Any task's pen; inspection pen sheet |
| Give IDs | Full page, farrowing-style, Back | Piglets tab; the task's timeline step; "ID first" before Keep |
| Pig card | Drawer (small inspection pig record) | Scan; an ID row; a Breeders row |
| Weigh | Small drawer | Pig card; Piglets tab |
| Breeders page | Page per batch | Task header; Breeders chip; later the weaning check |
| Task reminder | Timeline step + chip + End line | Skeleton |

## 4. Decisions for the owner (recommendation first)
1. Who owns per-piglet work: **A. shared pig/pen features, tasks remind** (rec.) · B. processing-only · C. each task its own copy.
2. Breeder needs an ID: **yes, ID asked first in place** (rec., production's rule).
3. Breeder = **one yes/no, stamped, changeable** (rec.); final ~180-day 猪只选种 is a later action out of this map.
4. **Suggestions for gilts only**; boars keepable from the pig card (rec.).
5. Sex: **per piglet with an ID; litter counts otherwise, auto-filled when all have IDs** (rec.).
6. Weight: **litter total always; individual optional; never auto-sum unless all weighed** (rec.).
7. Mixed pens: **ask Born here / Moved in only in pens with untagged arrivals** (rec.).
8. Reminders: **processing (ID day) and weaning check (breeders, weaning weight); inspection access only** (rec.).
9. Pig-card checklist (teats, legs, hernia): **read-only reminder** (rec.).

## 5. Risks and open questions
- Progress that moves by itself (tagged elsewhere) — pen log says "Tagged in inspection · G.H".
- Offline duplicate tag numbers — keep both and flag, or first-in-wins (round 9 sync rule) — needs a ruling.
- Off-by-one against the strip — pre-filled number editable in place; a skipped bad tag must not shift the rest.
- Sex edits ripple into castration and breeders — always stated.
- Untagged pigs can't be scanned — the pen is their only door.
- Placeholder ranking may be read as advice — label "Suggested order", show the reason line, keep unranked visible.
- Open: breeder eligibility rule; inspection pen sheet Piglets tab vs a Give ID row; sex from notch; who may Not keep after weaning; whether the weaning-check redesign is in scope.
- Research gap: no Chinese source on 初选 timing or 二元 gilt multiplication.
