# Retro — piglet processing (仔猪处理) design drive

Where the workflow, not the design, went wrong. One entry per event, written
when it happened. Cost: **low** (minutes, no user time) · **medium** (an agent
round or a rework) · **high** (user time, or a wrong design shipped to review).

## 1 · Start — the doctor command does not run on Windows

- **Stage:** Start, step 2.
- **What happened:** `python3 scripts/design_doctor.py` hit the Windows Store
  alias ("Python was not found"). `python` (3.13) runs it.
- **Why:** the skill names `python3`, which is not a real interpreter on a
  default Windows install.
- **Change:** name `python` (or `py -3`) in the skill, or have the skill say
  "the repo's Python 3" and let the driver pick.
- **Cost:** low.

## 2 · Start — the doctor finds no core gaps but reads the old hand-run file as current

- **Stage:** Start, step 2–3.
- **What happened:** `ux/design-system/DOCTOR.md` is the hand run from
  2026-09-28 and says it "is replaced by the tool's output" once the tool
  lands. The tool now exists; nothing in the skill says to write its output
  back, so the file and the tool now disagree (the file lists missing field
  cards — Stepper, Measure, Numpad — that the tool does not check for).
- **Why:** the doctor checks cards that exist; it cannot know which cards a
  README's law names but nobody has built.
- **Change:** the doctor should read component names the README's laws
  mention and report missing cards as growth; the skill should say where its
  output is kept.
- **Cost:** low.

## 3 · Start — `dispatch.py plan` is not in `drive`'s scripts

- **Stage:** Slices, step 1 (found while reading ahead).
- **What happened:** the skill says the designer's model comes from
  `dispatch.py plan` "in `drive`'s scripts". No such folder beside this
  skill; the only `dispatch.py` is in the adam-agent-workflow plugin's
  `events/` folder (several cached versions).
- **Why:** the reference points at a skill layout that does not exist here.
- **Change:** name the path, or state the tiering rule in the skill.
- **Cost:** low.
