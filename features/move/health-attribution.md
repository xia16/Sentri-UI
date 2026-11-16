# Health attribution when pigs without ear tags move

## Owner rulings · 2026-11-16

1. Design for the worker **not being able to recognise an individual pig without an ear tag** on a later walk or during a partial move. An internal pig ID or a numbered row on a phone does not establish physical identity.
2. A partial move is allowed when some pigs in the source group have received medication and the worker cannot tell which pigs they are. The medication's attribution becomes **unknown**, and **both the source and destination groups show a conservative notice**. Do not assign an exact treated count to either side without evidence.

These rulings concern the on-demand mobile move. The five existing move screens remain `in-design`; the owner has not approved a replacement canvas or prototype from these rulings alone.

## Model for the next canvas and implementation contract

The following is a concrete design proposal for those rulings, not an approved backend contract.

- Keep a treatment administration as **one immutable historical event**: what was given, when, how much, to what known subject or counted source group, by whom, and the withdrawal details recorded at that time. A move does not create another administration event in either pen.
- For a group of `N` pigs without ear tags, record `T` treated head when known. If `0 < T < N` and `0 < M < N` head move without physical identification, neither pen can claim an exact treated count. Both groups link to the original event as **possibly exposed**. The source keeps `N − M` head and the destination gains `M`; neither number is a treated count.
- Show a worker-facing notice on both groups, such as “Some pigs may have received Amoxicillin · who moved is unknown”, with the original administration time and withdrawal end when known. The source event remains readable. Do not describe the destination notice as a new injection or as proof that every pig there was treated.
- Suggested Chinese copy for canvas review: **给药归属未知** · “这组可能包含已给阿莫西林的猪；无法确认是哪头。查看原给药记录及停药期。” Show the same notice on the source remainder and moved group. If the destination already contains other pigs, its pen-level warning points to the moved group's uncertainty; it must not silently attach the original dose to those existing pigs.
- When the entire source group moves, the original treated count travels with that whole population; the empty source pen keeps only its historical log. If all `N` head were treated, every moved head is known to have that exposure. These are count-preserving cases, not guesses about individuals.
- Condition counts and their Care levels on a partially moved, physically unrecognisable group also cannot be split into exact per-pen affected counts by the move. Show their current attribution as uncertain on both sides until a new observation establishes current counts. A later observation is a new event, not a rewrite of the original condition record. This extension from the owner's identification ruling still needs owner review alongside the canvas.
- A completed Resolve or an administered dose is historical. An open condition, an active care action, an unfinished prescribed course, and a withdrawal notice have different next actions. The current `move.mixed` checklist cannot treat all of them as one “Stays / Goes / Both” choice.

Example: Pen D4 holds 14 pigs without ear tags; a worker records that 2 received Amoxicillin. Four move to E2 and the worker cannot recognise the treated pair. D4 has 10 head and E2 gains 4; both show possible exposure linked to the **same** administration. Neither displays “2 treated here”.

## Affected states and unresolved decisions

| Area | State to design | Current gap |
|---|---|---|
| Conditions / Health record | Record `n of N` affected head; later edit Care or Resolve without inventing pig identities | Record health accepts a no-ear-tag group, but Care and Resolve operate on individual pig rows. The rule for a later count replacing or adding to an earlier count is open. |
| Treat / Prescriptions | Record medication for an identified pig or a counted group, distinguish an administered event from an active course and withdrawal | `treat` currently specifies one record per included pig and an ear-tag dose list; no group treatment screen or partial-move attribution exists. |
| Move review · `move.mixed` | Show the original treated count, moved head, and that allocation is unknown before commit | The old Stays / Goes / Both record verdict implies knowledge the worker does not have. |
| Move result · `move.after` | Show the two new head counts and possible-exposure notice on both groups, with one source treatment event | The static deck shows counts but no unknown-attribution state. |
| Data sync / history | Pending and rejected operations must not present a farm-confirmed location or health attribution | Operation identity, atomicity, conflict handling and result lookup remain Q5/Q6. |

Decisions still needed: how long and where a possible-exposure notice remains visible; who may clear it and with what evidence; how an uncertain group is handled before sale or another move; and how a new observation changes current Condition/Care without erasing historical uncertainty. These are separate from the owner's two confirmed rulings above.

## Research used as context

- [PigCom manual](https://www.pigcom.co.uk/downloads/PigCom%20Manual.pdf): feeding-herd treatment can use pig type and number treated rather than an ear tag; it may also store tattoo or batch information. It does not specify automatic attribution after a partial move.
- [LivestockIQ guide](https://www.livestockiq.co.uk/documentation): batches can be count-only, split and merged, with health and treatment records attached to animal or batch. It does not specify partial-treatment allocation on split.
- [Iowa State University Extension, identifying treated animals](https://www.porkgateway.iastate.edu/resource/how-identify-and-track-treated-animals): a treated group can be tracked by pen or location, and pigs removed from it should be individually identified with their withdrawal information. This is operational context, not a description of Sentri's implemented behaviour.
