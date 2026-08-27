# Ear tag · ear notch · weight — the pairing brief

Ops brief for FARROWING production screen 8 (耳标/耳缺/体重 编辑态) — the heaviest manual
data-entry surface: assigning identity and weight to every piglet in a litter, done with wet
gloves while physically handling squirming animals. Anchored on `ux/system/components.html`
§04 (Numpad kit, lines 639–641), §04d (C3 Conveyor, line 764; coverage row 884 — "Piglet
tag / weigh: **C5 whose section is a C3** · per-piglet numpad run"), the Assign-identity
conveyor in `ux/research/ops/place-identity.md` §2.2, and `ux/research/tasks/piglet-processing.html`
(delta 2, subtraction rows on 提交后不可再查看 and the four count dialogs).

---

## 1 · Ground truth

Tagging is a **hands-full, two-role job**. Usually two people: one catches, restrains, applies
the tag (and notch, and drops the piglet on the scale); one records. One-person farms alternate
applicator and phone — every recording step costs a glove-off or a knuckle-tap, so **taps per
piglet is the metric that matters**, not fields per screen.

Physical sequence per piglet: catch → tag (applicator, one squeeze) → optionally notch →
weigh (hanging or platform scale, piglet still in hand or in a bucket) → release into the
marked-done side of the crate. Weight is taken **in the same pass** when the schedule puts
tag and weigh on the same age-day (production's config does: 耳缺/耳标/体重 as one item);
birth weight proper is often a **litter total** at farrowing, with per-piglet weight at day 3–5.

Tags come **pre-printed in sequential ranges** — a strip or bag of 20–100 consecutive numbers.
The applicator does not choose numbers; they take the next tag off the strip. This is the single
most exploitable fact on the surface: if the app knows the range, identity capture is zero-typing.
RFID tags additionally carry a scannable EID.

**Error shapes**, all of which are pairing failures:
- **Tagged, not recorded** — recorder distracted; the strip and the list drift by one, and every
  subsequent pairing is off by one (the catastrophic case).
- **Recorded, tag failed** — applicator misfire, tag discarded; the number exists in the app,
  never in an ear.
- **Duplicate** — number typed twice, or a piglet re-caught from the wrong side of the crate.
- **Misordered** — a dropped/defective tag silently skipped in the strip breaks the sequence
  assumption.
- **Weight to wrong piglet** — batch-entry-after-the-fact reconstruction from memory.

Production's model — a big editable table, rows added ad hoc, one 确定, then 提交后不可再查看 —
maximises exactly these: pairing is reconstructed at the crate's edge from memory, one submit
loses everything to interruption, and the record can't even be checked afterwards.

## 2 · The pairing problem

The pairing "which piglet got which tag" is made **physically**, at the moment of application.
Any model that records it later is transcribing memory. Candidates:

| Model | Taps/piglet | Gloves | Interruption | Two-person | Verdict |
|---|---|---|---|---|---|
| **A · Sequential auto-assign** — arm a range once; each confirm = next number | 1–2 (weight + confirm) | good | pointer persists per-commit | recorder taps as tagger calls | **base model** |
| **B · Scan-per-piglet** — scan tag (RFID/EID or printed code), then weight | 1 + scan | good (reader) | same | scanner can be tagger's | **overlay on A**, not a rival — the scan just fills the tag field |
| C · Batch table after the fact | many, deferred | poor | one submit loses all | pairing from memory | production's sin — **cut** |
| D · Voice | 0 | best | — | — | barn noise during handling (piglets scream at ~100 dB) makes it unshippable — **cut** |

A and B collapse into one design because the only difference is how the tag field fills:
pre-fill from the armed range, **scan overrides** (already the pad spec in piglet-processing
delta 2: "tag · auto-increment, scan override"). The pre-fill must be editable in place —
a defective tag means the applicator skipped a number, and the recorder corrects the pre-fill
before confirming, not after.

## 3 · Interaction model

Three candidates on house chassis; the first is recommended.

**R1 · Range-armed Conveyor (recommended).** The litter record (C5) carries the line
`tag/weigh · 9 of 20 ›`; tapping it opens a C3 Conveyor over the litter. First entry arms the
range — type the first tag or scan it; thereafter each sheet is: tag (pre-filled next number,
editable, trailing scan) · sex Choice(2) · notch (optional ear-diagram picker; pre-fills sex
where the farm's derivation table says so, per place-identity §2.2) · weight Numpad.
**`Confirm & next` commits that piglet** — the tag is physically in the ear, so the record
follows the world immediately; no submit, no draft, nothing to lose. The running list is the
receipt (`001246 · 1.4 kg ♂ ✓`) and doubles as the two-person audit channel: the recorder
reads the last line back to the tagger when either suspects drift. Footnote counts
`9 of 20 · litter B4`. Duplicate numbers refuse inline at the field (amber, reason shown —
never a dialog); out-of-band weights warn amber but never block (nothing is disabled).

**R2 · Session-style tally + identity later.** Count-first (like farrowing's C6), pair
identities afterward. Rejected: it *is* model C wearing a session costume — pairing deferred
is pairing from memory.

**R3 · Roster verdict page.** Pre-generate 20 rows from the range, tick as applied. Rejected:
a wall of unassigned mono numbers, weight entry forces per-row drilling anyway, and a
pre-generated row is a record of something that hasn't happened.

**Weight entry:** Numpad, not stepper — birth-band weights (≈0.8–2.2 kg, day-3 ≈1.5–2.8) need
2–3 digits and steppers are too slow at 20 repetitions. The previous piglet's weight ghosts as
placeholder (carry-forward as *hint*, never as committed value — weight is the one field that
genuinely differs per subject). Bluetooth scale, where present, fills the field live; confirm
still belongs to the human, because the scale doesn't know which piglet is on it.

## 4 · Edge cases

- **Mid-litter interruption.** Conveyor law already covers it: committed records stand,
  leaving finishes early, re-entry resumes at `9 of 20` with the pre-fill at last-committed +1.
  The litter row's memory line (`tag/weigh · 9 of 20`) is the resume prompt — a state, not a debt.
- **Range exhausted mid-litter.** Pre-fill runs dry → tag field opens empty with the arm
  affordance again (scan or type the new strip's first number). No modal; arming is just
  filling the field.
- **Tag failed / discarded.** Edit the pre-fill past the spoiled number and confirm; whether
  spoiled numbers need their own record (so they can never be reused) is open q 5.
- **Retag after loss.** The pig page's ✎ on identity — same sheet, title 修改身份
  (place-identity row 18); old number retired into history, who · when stamped.
- **Correcting yesterday's pairing.** The piglet table is always viewable (提交后不可再查看 is
  cut — production's own ended-state contradicts it); ✎ per row, audited. Swapping two piglets'
  tags is two edits, each stamped.
- **Keepers-only farms.** A subset is legal by construction — finish early at 9 of 20; the
  untagged remainder stays the pen's group count, and litter sex-count steppers are asked only
  for the un-rowed remainder (never ask twice for the same fact).

## 5 · Open questions for the owner

1. **RFID or visual tags** — per farm, or mixed? Decides whether scan is the primary fill or
   the override, and whether the reader is the phone camera or a paired stick reader.
2. **Weighing at birth: individual or litter-total?** Production carries both 出生整窝体重 and
   per-piglet weight at the tag day. If individual-at-birth exists anywhere, the conveyor needs
   a farrowing-session entrance too.
3. **Who owns tag ranges** — console pre-allocation per batch/unit (arming becomes a pick, and
   cross-litter continuation is automatic), or physical strips only (arming stays manual)?
4. **Duplicate scope** — is tag uniqueness farm-wide or lifetime? Decides how hard the inline
   refusal can be, and whether a re-used number from a dead pig is legal.
5. **Spoiled tags** — must discarded numbers be recorded (inventory/traceability), or is a gap
   in the sequence acceptable?
6. **Bluetooth scale reality** — do any target farms have one? Determines whether scale
   integration is v1 or a listed later.
7. **Notch timing** — is notching done in the same pass as tagging, or days earlier (then the
   notch is how the piglet is *found*, and the conveyor should offer notch-first lookup)?
