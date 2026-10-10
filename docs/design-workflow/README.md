# Design workflow

Sentri-UI is the product and design source of truth. Its design workflow lives
here, beside the designs it makes, so whoever clones the repo has it.

- **The skill**: [`.claude/skills/design-drive/`](../../.claude/skills/design-drive/SKILL.md)
  — run `/design-drive` in Claude Code from this repo. Its lint
  (`design_lint.mjs`, needs Node and Playwright) and doctor (`design_doctor.py`)
  sit in its `scripts/`, with their tests in `test_design_tools.py`.
- **Its config**: [`docs/agents/design.md`](../agents/design.md).
- **Matt Pocock's skills** (grilling, wayfinder, prototype, to-spec) are enabled
  for everyone by [`.claude/settings.json`](../../.claude/settings.json); accept
  the workspace trust prompt once.
- **Why it is shaped this way**: [design-loop.md](design-loop.md), with its
  research in [design-loop-research.md](design-loop-research.md).
- **Behaviour**: each feature's scenario tree and the runner that gates it, in
  [scenarios.md](scenarios.md); persona walk rounds in [walks.md](walks.md).
- **What went wrong when it ran**: the setup retro in
  [pilot-retro.md](pilot-retro.md) and the piglet-processing pilot's 36 entries
  in [`ux/tasks/piglet-processing/retro.md`](../../ux/tasks/piglet-processing/retro.md).
  The skill does not yet carry those lessons; folding them in is the next step,
  tracked on the map [Team design workflow](https://github.com/xia16/Sentri-UI/issues/20).

Change the workflow in its own pull request, never inside a design PR.
