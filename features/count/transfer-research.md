# How transfer works in the live system (Dahua handover, read 2026-11-03)

The handover map ([references/handover/flows/pig-transfer.md](../../references/handover/flows/pig-transfer.md), PR 301) says "no transfer PRD; the group transfer task is implied". It is more than implied: the handover carries the **live Console's own code** for it, under `Vaccine/src/console-dev/` (handover root `C:\Users\ying_\Documents\Sentri-Dahua-Handover\Sentri-Dhua`). The sources below are that code, not drafts.

| Source (handover-relative) | What it shows |
|---|---|
| `Vaccine/src/console-dev/locales/langs/en/transfer-shed.json` (and `cn/`) | Every Console string of 转舍: list, create in three steps, transfer plans, task detail, the move-in location dialog |
| `Vaccine/src/console-dev/routes/sections/production.tsx` | Routes `production/transfer-shed`, `/create`, `/:id`, `batch/settings/transfer-plan` |
| `Vaccine/src/console-dev/gqlApi/transer.gql` | The Console's queries and mutations: task list, task items (one per pig), create, add or remove pigs, change move-in units, plans, unit capacity |
| `Vaccine/src/console-dev/gqlApi/__generated__/schema-types.generated.ts` | The back end's full command set, including the mobile ones the Console doesn't call: `transfer_out`, `transfer_in`, `complete_transfer_task`, `record_transfer`, `transfer_pig`, outbound (exit) tasks, status enums, the daily dashboard |
| `Vaccine/src/mobileHomeFixtures.ts`, `Vaccine/docs/MOBILE_FIELD_LAYOUT.md` | A transfer task card on the mobile Home, beside vaccination and weaning check (`taskType: "transfer"`, progress done / total) |
| `Vaccine/docs/offline-test-2026-09-03/…离线能力多角色专项.md` | The real Android app has a `transferTask` offline store; transfer isn't a production-line-dispatched task |
| `brainstorm/&&sale.md` s12 | Internal transfer of a culled sow: a transfer task with a destination capacity check |

## The model

**A transfer is a task for one batch and one pig category, from units to units.**

- **Task** (`transfer_task`): `batch_id`, `transfer_type` (Sows · Boars · Breeders · Piglets / fatteners), `transfer_out_unit` and `transfer_in_unit` (**units, several allowed; never pens**), `planned_transfer_time`, `actual_start_time`, `completed_at`, `remark` (special notes), `transfer_plan_id` (when a plan made it), `operator`. Status **Planned → In progress → Completed** (the list also shows Cancelled).
- **Items** (`transfer_task_item`): **one per pig** in the task: `pig_id` (with its ear tag), `source_pen_index`, `destination_location_index` (the **pen**, filled in when the pig goes in), `actual_transfer_time`, `operator`, `failure_reason`, status **Pending → Transfer out → Transfer in** (or Cancelled).

**Who makes it.** The Console (managers): *Create task* in three steps.
1. **Add pigs**: pick the category, then add a batch (a table of batches with available and selected pig counts; sows can be picked one by one by ID, location or tag). "Added 112 / 120 pigs".
2. **Move-in location**: transfer date, **move-in units** (several: "Selected 3 units"), special notes.
3. **Confirm**: each move-in unit with its **available capacity** (`available / total pigs`, from the pens' capacities).

Or a **transfer plan** on the production line makes it on its own: the pig category plus a trigger (N days before a production task's expected start, N days after its actual end, or N days in a production status, e.g. 5 days before Farrowing starts), with the expected day from batch start. Plans can be reused across lines and batches.

**Who does it.** The phone (workers), in two halves, which the back end already has as commands:

| Command | Who, where | Fields |
|---|---|---|
| `transfer_out` | At the source, as pigs leave | `transfer_targets` (pigs that left, each with its source location) · **`missing_targets`** (pigs in the task that weren't found) · `remove_targets` (pigs taken out of the task) |
| `transfer_in` | At the destination, **one pen at a time** | `pen_location` (the pen) · `transfer_targets` (tagged pigs put in this pen) · **`no_identity_count`** (how many pigs without an ID went into this pen) |
| `complete_transfer_task` | When done | `completed_at` |

Between the two, pigs are **in transit**: the daily dashboard counts `pigs_out_in_progress` and `pigs_in_in_progress` (the AI-drawn Home card's "Moving 100 heads", "200 unpositioned").

**Ad hoc moves** (not from a task) are `record_transfer`: pigs, source and target location, time, and `health_transfer_items` (for each disease, symptom or therapy: **MOVE or COPY**). And `transfer_pig`: one pig, one destination.

**Exits** (sale, transfer off the farm) are a separate **outbound task**: by category (production sows · boars · breeding pigs · fatteners), pigs chosen by ear tag (`TAG_SELECT`) or by hand (`MANUAL_SELECT`), status Planned → Running → Completed / Cancelled, each pig logged with where it left from.

## What this means for Count

1. **The room count already exists in the back end: it is transfer in.** `transfer_in` is one pen at a time, the tagged pigs put in it plus a **number** for the pigs without an ID. That is the [Receive pigs](mock/mock-8-receive.png) page: received against sent, then each pen's count. It confirms the owner's call: the destination is units, pens are chosen when the pigs go in, and a whole room is counted only here.
2. **The source side has its own "not accounted for": `missing_targets`.** A pig in the task that can't be found when the batch leaves. Count's balancing sheet should take these too, so the batch has one place for every pig the farm can't account for, whether from a count, transfer out or transfer in.
3. **In transit is a real state.** Pigs out but not yet in are neither in the old pen nor the new one. A count of the destination during a transfer must not book them as unaccounted; the receiving page says "8 still to come" for exactly this.
4. **Planning is the Console's**, as already ruled (console orchestrates, phone records): who moves, when, which units, capacity. The phone only does out and in.
5. **Conditions on untagged pigs**: the back end's ad hoc move still has MOVE / COPY per record. The Count proposal replaces it with conditions that follow the pick by count, so nothing is copied. A change for the developers.
6. **Exits** (sale, off farm) are outbound tasks, each pig logged; they feed *Since the last count* like deaths and moves.

## Owner ruling, 2026-11-03

Transfer out is a reference list of the pigs to move, nothing more; receiving receives the pigs and locates them into pens. So the phone sends no transfer-out count: the back end's `transfer_out` (with `missing_targets`) is either sent whole by receiving, or not used by the phone. Pigs not received go on the balancing sheet when receiving finishes. Open question 1 below is answered (no).

## Open questions this raised

1. Should the phone's **Transfer out** also be a pen-by-pen count (all pigs, then scan the tags), like Count and Transfer in? The back end takes tagged pigs plus missing ones; untagged pigs leaving would need a number per source pen.
2. Does a **transfer in that comes up short** (112 of 120) close the task with 8 not accounted for, or does the task wait open? The dashboard's in-transit figure suggests it waits; the owner's balancing sheet suggests it closes and the sheet carries the 8.
3. Keep the back end's **COPY** for health records on ad hoc moves, or retire it for conditions by count?
