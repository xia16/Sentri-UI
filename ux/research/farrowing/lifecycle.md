# Task lifecycle & the end of a task — ops brief (farrowing suite slice)

Sources: farrowing-figma-context.md (production 结束任务) · unified-task-list.md ·
screens.html 01/03 · motion.html contract · today.html 08e–08h · SYNTHESIS.md.
Much of this slice is already decided in scattered places; this brief consolidates and
fills the remainder policy, which is decided nowhere.

---

## 1 · Ground truth — what 结束任务 was actually for

Production's end screen bundles four jobs into one ceremony: (1) **certification** — an
auditable "this round was worked" fact for compliance/pay; (2) **manager visibility** —
the tallies card is a proto-report; (3) **handover** — the next shift reads what's left;
(4) **closure** — the green check tells the hand they may stop. Our system already serves
three of the four without ceremony:

- **Closure**: the working lens reaching zero *is* the complete state (motion contract,
  "Empty states" row). Today's all-clear ("Nothing needs you · 214 records") is the
  day-level version.
- **Handover**: Today's done cards keep attribution (`200 of 200 · 14:20 · G.H`), tomorrow
  previews gray — "the last person out reads what the first person in will face" (08e).
  Task detail sheet's per-unit split is "how Unit B knows Unit A is done" (03 note).
- **Manager visibility**: unit KPI + task overview cell are live; nothing waits for a submit.

Only **certification** has no surface — and unified-task-list §2 shows why it was cut:
round-submit semantics were undefined and per-pen attestation was rejected. The compliance
story is *recorded check activity*, not a signature. Ground-truth gap: we have no evidence
whether pay or SOP audits require an explicit sign-off — owner question 1.

## 2 · Task closure model

Already decided (screen 03): **End task lives on the task detail sheet** — bordered red,
bottom, one level above any room. Sweeps show it always; standing tasks (heat) show it as
the supervisor's stop; **event tasks (breeding, farrowing) never show it** — they close
record by record. Keep this; the lifecycle around it:

| Phase | Mechanism | Surface |
|---|---|---|
| Opens | window start date (farm config: `3 d · Jul 8–10`) | appears on Today; forecast register before |
| Worked | lens counts are the live status; rows commit themselves | task list; ctxbar `100/200 · day 1 of 3` |
| Day rolls | nothing happens at day end — "no ceremony marked it, the window did" (08e); remainder returns tomorrow as `day 2 · 100 remaining` | Today's tomorrow preview |
| Closes | **automatic at day N end**; End task = early manual close only (all done on day 2, or supervisor abandons) | task detail sheet |
| Remainder | per-type policy, below | escalation strip |
| Record | the run persists as a closed task-detail sheet (frozen progress + KPI + who/when) reachable from history | see §3 |

**Remainder policy per type** (the undecided piece — proposal):
- **Sweep verdicts (pregnancy, postpartum, weaning)**: unchecked at window close never
  silently expire — they escalate. today.html already draws the pattern for rechecks
  (`Re-checks overdue · 6 sows · oldest +2d`, the strip, the only red register). Same
  strip row: `Unchecked at close · 12 sows · pregnancy B22`. Rows stay dispositionable
  from the strip's filtered view; no new task spawns.
- **Watch tasks (heat, return-heat)**: cohort never shrinks; window close closes the
  question itself — no remainder (a sow not returned *is* the outcome). Zero rule: nothing
  prints for the negatives.
- **Generated rows (unclear → recheck 3d)**: regenerate on their own clock, independent of
  the parent window; they are why the strip exists.
- **Event tasks**: no window remainder; overdue is per-subject (§4).

## 3 · The summary question

No new surface needed. The tallies production printed on the end screen already exist,
live, in three places: lens counts (`Checked 100`), outcome sub-lens (pregnancy),
unit KPI (`95% pregnant · ≥90`). The **closed run's record = the task detail sheet,
frozen** — same sections (progress, KPI, per-unit split, config), plus closed-at + who
ended it if manual. Reached from Today's done card (which already persists with
attribution) — tap-through goes to the frozen sheet instead of a live list. "I'm done"
is marked by three non-events: working lens at zero, Today card compressed to done, chip
gone quiet. Nothing else. The manager's cross-day view (yesterday's runs, week's rates)
is a **farm/console surface, not a task artifact** — today.html is explicit that Today is
"not a dashboard, not a report"; out of this slice's scope but the frozen sheet is its
data unit.

## 4 · Farrowing specifics

- **Farrowing is a standing surface, not a windowed task.** Config table already says so:
  lens `Awaiting / Active / Done / All`, overview `2 farrowing · 9 awaiting`, no day-gauge,
  no End task. Each sow is her own window (due date ± tolerance); her Session record closes
  on "final", advancing her row Awaiting → Active → Done in place. The "task" never closes;
  it drains. A batch's farrowing surface retires when its last sow is Done — complete
  state, no ceremony.
- **Per-sow overdue replaces window remainder**: sow past due date with no farrowing
  started → escalation strip (`超出预产期` in production's grammar); active sow with
  last-piglet interval breach rides the row (`LAST 45m`), never modal.
- **Piglet day-age ladder**: due days are computed per-litter from birth date, so the
  window is a conveyor of small per-litter windows, not one sweep. `Due today / Done / All`
  lens; future days in forecast register (production's 可提前填 survives as "nothing is
  ever disabled"). A missed day-age does **not** expire — a day-3 treatment done on day 4
  is late, not gone: row goes overdue (red), strip aggregates (`6 overdue in G7`), memory
  line keeps showing what's left. Late completion stamps actual who/when; the on-time KPI
  (90% target) absorbs the lateness — the row never nags twice.
- Production's "提交后不可再查看" (day-2 records unviewable after submit) is a bug by house
  law — everything editable after the fact (✎); the frozen-run sheet is read-frozen at the
  *run* level, rows stay ✎ at the *record* level.

## 5 · Open questions for the owner

1. Does compliance/pay need an explicit per-run sign-off, or is recorded activity + the
   frozen sheet enough? (This decides whether End task on sweeps also *asserts* anything.)
2. Auto-close at day N end: hard midnight, or grace until the next task's window opens?
   And who may End task early — any hand, or lead only (the "supervisor's stop" wording
   implies a role gate that contradicts "nothing is ever disabled")?
3. Escalated unchecked sows: dispositionable from the strip's filtered view directly, or
   must they be folded into the next sweep of the same check?
4. Farrowing due-window tolerance (±N days before a sow goes overdue) — farm config?
5. Where does the frozen-run sheet live long-term — reachable only from Today's history,
   or from the batch record? (Touches the undesigned farm surface; park with toolbox.)
6. Day-age ladder: is there a hard ceiling after which a treatment is clinically pointless
   (e.g. day-1 iron at day 10) and should convert to a health flag instead of staying overdue?
