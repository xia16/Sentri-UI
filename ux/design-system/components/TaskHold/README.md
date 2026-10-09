**Status: candidate.** The footer placement of the hold ([Button](../Button/README.md) `holdButton`, ADR 0002) as farrowing's Finish farrowing and End task use it, for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)). It is not approved.

# TaskHold (the hold button in a footer)

A commit that cannot be undone from the sheet (Finish farrowing, End task) is a **hold in the primary's place**: the verb over a caption (`HOLD TO FINISH`), in the [footer](../Sheet/README.md) beside Back.

**Anatomy**
- The Button card's hold (`.button.st-hold`, `data-ds="Button"`): flex 1 in the footer, at least `control-height`; label 14px/500; caption in farrowing's face (owner round 5: match farrowing): `hold-caption` 9px/500, capitals, `0.07em` apart, at `task-hold-caption-opacity` (80%; 100% in the `unknown` phase); the sweep at `hold-sweep-opacity`, `hold-commit` (850ms) linear.
- `tone: 'primary'` (Finish, Lock) is `ink`; `tone: 'danger'` (End task early) is `red`.
- The footer stretches Back to the hold's height (farrowing: 56px).

**States**
- All of the Button card's hold phases: idle, holding, armed (keyboard), pending, done, failed, unknown; waiting. See [Button](../Button/README.md).

**Component contract**
- **Props:** `SentriTask.footer({ back, hold: { label, caption, action, value, tone, phase, statusId, waiting, describedby } })`. Labels take text slots; they become the Button card's `strs`.
- **Events:** bind with **`SentriTask.holdBind(root, { onCommit, cues, t, … })`** (the same options and return as `SentriUI.holdBind`): as farrowing, **the caption stays as it is through the hold** (`HOLD TO END` never becomes `Keep holding`); the cues still reach the hold's status line when it has one (`statusId`, e.g. the footer's `status` slot). The unknown phase keeps the Button card's message. Commit is the host's.
- **Port note:** a long-press with visible progress; the keyboard path is press twice.

**Don'ts**
- Don't put a hold anywhere but the footer's primary place.
- Don't draw the caption in the Button card's 11px sentence case inside a task footer: round 5 rules farrowing's face (9px capitals). The skeleton uppercases it (`text-transform`), so write the registry's English caption and cue strings in capitals too (`HOLD TO RECORD`, `KEEP HOLDING`), or the strict lint reads a mismatch. zh is unchanged.

**Strings**
- Host strings for the label and caption; the cues are the Button card's.
