# Piglet processing 仔猪处理

## Problem

After farrowing, each litter owes a schedule by age-day (iron, dock tail, castrate, coccidiosis, and the identification step the farm requires). The worker records it pen by pen, with paper habits and dirty gloves. The task must show what each pen still needs today, record a pen with one tick per item and one Submit, and keep the litter's count honest through deaths, moves and counts, all looking exactly like Farrowing.

## Who

Piglet-care workers walking the pens (farmers, not tech-savvy; Round 8). A supervisor ends the task.

## Anchor

Pen (a sow with her litter). Its status is derived, not stored: Coming (every step still ahead), To do (anything due or partly given), Late (a step past its window; shown over To do), Done (nothing left, nothing ahead). A dead sow adds a red chip but the litter stays on its schedule. The task has its own band: in progress, then ended (End task by hold).

## Rules

- Windows in pen age days: Iron 2-4, Dock tail 2-4, Castrate 3-7, Coccidiosis 3-5, ID 3-7. Outside the window a record is stamped early or late automatically; early counts on time (Round 1 Q6).
- One tick per item, one Submit. Fewer piglets than alive asks one reason (weak or sick); the rest stay on the list.
- Identity follows the farm: tag every piglet, notch every piglet, breeders only, or no ID (then no ID step at all). ID is always available on a pen and is also a step on the ID day. One piglet at a time, tag or notch; sex required here; weight optional (Rounds 1, 7, 10).
- Alive = born, minus dead, minus moved out, plus moved in. Set count only adjusts the record; the difference goes to the batch-level "N piglets unaccounted", not to the pen (Round 9). Move offers only the pens of the batch and asks what the piglets already had.
- Same look as Farrowing: list row = id + one chip + one headline + one meta line; the pen opens as a sheet; Back, not Close (Round 5). End task is a hold and reviews in numbers (Round 1 Q5).
- Two phones recording the same item: first record wins, the second is kept as a note (simplification, not yet confirmed).
- In the rulings but not in this prototype: End blocked while the batch's farrowing is open; corrections after End; the shared dead picker; Edit; bulk recording with a Finish hold.

## Scope

In: pen list with job chips, pen sheet, Piglets list, Give IDs, boars and gilts, litter weight, death, move, set count, pen log, End task.

Out: recording several pens at once (Round 9 keeps bulk as chips, but the prototype has only the filter), farrowing's Born figure, the weaning handoff, breeder ranking (placeholder only), multi-sow pens, fostering outside the batch.

## Decisions

Decided:
- Same look as Farrowing, pruned to its density; farmers first; restrict rather than add mechanisms (Rounds 5, 8).
- Set count just adjusts; no nurse sows outside the task; Move only within the batch (Round 9).
- Tagging per farm scheme; per-piglet work and breeder selection may become universal; ranking is a placeholder (Rounds 7, 10).
- Verbs Record, Edit, Set count, End task (Q11, provisional).

Open (HANDOFF, needs the owner):
1. The seven simplifications: moves within the batch with Yes/No; count = reason or "count was wrong"; first-in-wins sync; cut nurse sow outside the task; cut after-End evidence; cut fine-grained corrections; keep bulk. The prototype implements 1, 2, 3 and 5 and keeps bulk only as a filter.
2. Rules the builder interpreted: ID window day 3-7; the Tag chip filters only (no bulk tagging); Move asks "Have tags?"; "Done picking" may close with no breeders; a pen with nothing due yet counts as done; losses come off untreated piglets first; a higher count just corrects; sheet records past the window are marked late automatically; bulk pre-ticks only pens fully inside the window.
3. Candidate approvals at close: task skeleton parts (ADR 0003, with Chips) and candidates 2 (ADR 0002) with four nods (keyboard two-step hold, one 35% sweep, Row code 600, 64 px optional radio row).
4. Build path: carry the simplified flows into the full task, or promote simple/ to be the task.
5. Where per-piglet work (ID, weigh, sex, breeder) lives as a universal feature (Round 10 direction only; proposal first).
6. How a farm's ID scheme is configured (Round 1 Q3); in the prototype it is a Demo switch outside the phone.
