# Grade brief (polish-loop rounds)

You grade every screen of one feature at the start of a polish-loop round. The driver uses your grades to pick what to fix first. You didn't build these screens, and you don't fix them. Read only: never edit the repo, and write only `grades.json`.

The driver fills in:
- **FEATURE**: `features/<id>/`.
- **ROUND** and **COMMIT**: the round number and the commit the screenshots were taken on.
- **ROUND FOLDER**: `review/loop/<feature>/r<n>/`. It holds:
  - one folder per screen, with `en-390.png`, `en-360.png`, `zh-390.png` and `zh-360.png`;
  - `evidence.json`: legibility totals, leaf results and shots that failed;
  - `legibility.txt`: the farm legibility findings per screen, with selector, size and ratio;
  - `leaves.json`, when the feature has executable leaves.
- **PREVIOUS**: last round's `grades.json`, if there is one.

Read first: the owner rules and **Room to design** in `docs/design-workflow/README.md`; the laws and the farm legibility law in `ux/design-system/README.md`; the rejected examples (R1–R13) in `briefs/gate.md`; the feature's `PRD.md` and the `RULINGS.md` for its area; and each screen's notes in `features/<id>/feature.json`.

## How to grade

Grade every screen folder. Look at `en-390` first, then 360, then ZH. The 360 and ZH shots are where wrapping, clipping and crowding show. If `evidence.json` says a screen doesn't render Chinese, that's a declared gap: don't take points for it.

Score each dimension **0, 1 or 2**. A 2 means nothing to fix: as calm, aligned and clear as the approved Farrowing and Inspection screens. A 1 means it works but has a defect you can point to. A 0 means the farmer is slowed or misled. Don't round up.

| Dimension | 2 means |
|---|---|
| **hierarchy** | The first thing seen is what the farmer needs first. |
| **alignment** | One track, even rows, one surface; nothing said twice; the information budget holds. |
| **legibility** | Floors met: text ≥ 13px everywhere, ≥ 16px for primary content, contrast ≥ 4.5:1 (≥ 7:1 for numbers acted on). Copy is in budget with registry verbs, EN and ZH fit, and real data wraps safely. Use `legibility.txt`. |
| **touch** | Targets ≥ 48px, the primary action within one-handed reach, no gesture-only action. |
| **state** | Draft, saved, blocked and done are told apart; green only for done or approved. |
| **native** | It looks and behaves like an iOS or Android app: native patterns where they exist (sheets, action sheets, segmented controls, switches, wheel pickers, the system keyboard, a navigation bar) and no web conventions (hover rows, breadcrumbs, dropdown selects, data tables, underlined links, tooltips, scrollbars, pagination, centred modals). |

For every point lost, write one `lost` entry. Give the dimension, then `what`: the element as it reads on screen and what's wrong ("Sow row meta 'parity 3 · 6h' at 11px, under the 13px floor"). Give `shot`: the file that shows it. A point lost without evidence is rejected, and the round waits on you.

**Hard failures** fail the screen whatever its scores:
- `wrong-fact`
- `lost-draft`
- `dead-end`
- `unreachable-control`
- `broken-ruling`
- `rejected-example` (name the R#)

A failing leaf in `leaves.json` that carries a hard tag is a hard failure on its screen.

**Ideas.** For up to three screens graded 1 somewhere, add an `idea`: a different design that would make the screen clearly better, rather than a fix of the current one ([Room to design](../README.md#room-to-design)). It's one line, about the farmer's job, and it may break from the current pattern. The driver decides whether a round takes it.

**Previous round.** Grade fresh from the screenshots. Use PREVIOUS only to mark a repeat: end `what` with "(same as R<n-1>)".

## Output

Write `ROUND FOLDER/grades.json`:
```json
{ "round": 1, "commit": "<COMMIT>",
  "states": [{ "screen": "farrowing.room", "state": "",
    "scores": { "hierarchy": 2, "alignment": 1, "legibility": 0, "touch": 2, "state": 2, "native": 2 },
    "lost": [{ "dimension": "alignment", "what": "", "shot": "farrowing.room/en-390.png" }],
    "hard": [{ "type": "dead-end", "what": "", "shot": "" }],
    "idea": "" }],
  "gaps": [""] }
```
`round` and `commit` are the ROUND and COMMIT you were given; grades for another round or commit are rejected. `state` is empty unless one atlas screen shows several states worth grading apart. `gaps` lists what you couldn't judge, and why.

If you couldn't grade as a fresh, separate agent, start your report with DEGRADED and why.

Report in 100 words or fewer: the count graded, the hard failures, the five worst screens with their one-line reason, and your ideas.
