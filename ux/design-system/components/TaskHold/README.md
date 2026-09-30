**Status: candidate.** The footer placement of the hold ([Button](../Button/README.md) `holdButton`, ADR 0002) as farrowing's Finish farrowing and End task use it, for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)). It is not approved.

# TaskHold (the hold button in a footer)

A commit that cannot be undone from the sheet (Finish farrowing, End task) is a **hold in the primary's place**: the verb over a caption (`Hold to finish`), in the [footer](../TaskSheet/README.md) beside Back.

**Anatomy**
- The Button card's hold (`.button.st-hold`, `data-ds="Button"`): flex 1 in the footer, at least `control-height`; label 14px/500; caption in `description` 11px at `type-weight-strong`, `hold-caption-opacity`; the sweep at `hold-sweep-opacity`, `hold-commit` (850ms) linear.
- `tone: 'primary'` (Finish, Lock) is `ink`; `tone: 'danger'` (End task early) is `red`.
- The footer stretches Back to the hold's height (farrowing: 56px).

**States**
- All of the Button card's hold phases: idle, holding, armed (keyboard), pending, done, failed, unknown; waiting. See [Button](../Button/README.md).

**Component contract**
- **Props:** `SentriTask.footer({ back, hold: { label, caption, action, value, tone, phase, statusId, waiting, describedby } })`. Labels take text slots; they become the Button card's `strs`.
- **Events:** bind with `SentriUI.holdBind(root, { onCommit, cues, t })`; commit is the host's.
- **Port note:** a long-press with visible progress; the keyboard path is press twice.

**Don'ts**
- Don't put a hold anywhere but the footer's primary place.
- Don't write the caption in capitals: the ruling face is sentence case (farrowing's `HOLD TO FINISH` at 9px is below the type floor; see ADR 0003).

**Strings**
- Host strings for the label and caption; the cues are the Button card's.
