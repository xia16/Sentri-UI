# Design-system archive

Parts and pages that no longer describe the mobile library, kept for history. Nothing here is a current component, and nothing in the product or the atlas loads it. The current library is `ux/design-system/` (its rules: `ux/design-system/README.md`, "The library").

| Here | What it was | Use instead |
|---|---|---|
| `components/TaskHeader/` | The task screen's page header (`SentriTask.header` still draws it) | [Header](../../ux/design-system/components/Header/README.md), on a task screen |
| `components/TaskHold/` | The task skeleton's hold-to-commit button | [Button](../../ux/design-system/components/Button/README.md) hold, `SentriUI.holdBind` |
| `components/TaskLens/` | The task list's sticky lens host | [Segment](../../ux/design-system/components/Segment/README.md)'s two-line lens with an IconButton |
| `components/TaskStepper/` | The task skeleton's stepper faces | [Stepper](../../ux/design-system/components/Stepper/README.md) (row, count, well) |
| `components/TaskPhotos/` | The task skeleton's photo line | [Photos](../../ux/design-system/components/Photos/README.md) |
| `components/TaskWarning/` | The task skeleton's danger band | [Banner](../../ux/design-system/components/Banner/README.md) |
| `demos/field-cards-demo.html` | ADR 0001's strict demo of the field cards (Stepper, Measure, Numpad) | Their component pages in the atlas |
| `demos/candidates-2-demo.html` | ADR 0002's strict demo of the second candidate set | Their component pages in the atlas |
| `IMPLEMENTATIONS.md` | The component pass's record of parts that existed twice (2026-10) | `ux/design-system/README.md`, "The library" |

The old task names still resolve in the atlas's search (Compatibility and retired), and the compatibility adapters (`SentriTask.stepper`, `SentriTask.lens`, …) stay in `task-skeleton.js` while the frozen piglet-processing pages call them. The demos still load today's tokens and bundle from `/ux/design-system/`, so they show today's parts.
