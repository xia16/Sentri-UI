# ux/ — the Sentri redesign corpus

Run `npm run ux` from the repo root, then open the link it prints
(`ux/system/home-astra-prototype.html`) to browse everything below locally.

## system/ — Astra: the current component library (start here)
Astra is the newest generation of the design system — a linked set of
interactive prototypes sharing one component/style foundation
(`sentri-components.css/js`, `sentri-visual-foundation.css`). Start at Home and
follow the in-page links.

| File | What it is |
|---|---|
| [home-astra-prototype.html](system/home-astra-prototype.html) | **Home — start here.** The task-list home surface, linking out to the rest of the cluster |
| [sentri-components-study.html](system/sentri-components-study.html) | The component library study: parts and states in isolation |
| [task-cards-astra-prototype.html](system/task-cards-astra-prototype.html) | Task card variants and states |
| [inspection-astra-concept.html](system/inspection-astra-concept.html) | Inspection flow concept |
| [farrowing-astra-concept.html](system/farrowing-astra-concept.html) | Farrowing flow concept |
| [task-overview-astra-study.html](system/task-overview-astra-study.html) | Task overview study |

## system/ — legacy reference
The prior generation of the system. Still linked from a few Astra pages as
reference points; no longer the primary entry point.

| File | What it is |
|---|---|
| [components.html](system/components.html) | The parts and the laws: row grammar, record-sheet shell + field kit, the chassis, the entrance (verb sheet), detail-page grammar, the consistency contract |
| [screens.html](system/screens.html) | The 8 production tasks rendered on the unified list |
| [check-in.html](system/check-in.html) | The check-in: pen cards, batch cards, feed, triage, pen sheet, unit sheet |
| [workflows.html](system/workflows.html) | The review deck — 23 workflows end to end; pick a chip, swipe inside |
| [motion.html](system/motion.html) | Mark-to-move motion spec, with the front-end implementation contract |
| [farrowing.html](system/farrowing.html) | The farrowing suite: room, session sheet, piglet death, day-cohort, tag/weigh conveyor, count doors, batch close |

## model/ — the product model
| File | What it is |
|---|---|
| [product-model.html](model/product-model.html) | The unification: tasks observe events; the event catalogue; the laws |
| [consolidation-plan.html](model/consolidation-plan.html) | Archetypes, supersession, triage research |
| [unified-task-list.md](model/unified-task-list.md) | Historical (superseded banner inside) |

## research/ — requirements extracted from production
| Dir | What it holds |
|---|---|
| [research/ops/](research/ops/) | Six per-cluster operation briefs + [SYNTHESIS.md](research/ops/SYNTHESIS.md) |
| [research/checkin/](research/checkin/) | Feed PRD mobile slice, pen-count calibration, row-content synthesis |
| [research/tasks/](research/tasks/) | Per-task PRDs from the 生产任务 Figma |
| [research/farrowing/](research/farrowing/) | The farrowing suite: [HANDOVER.md](research/farrowing/HANDOVER.md) (entry point) · [SYNTHESIS.md](research/farrowing/SYNTHESIS.md) · interaction spec · audits · pattern research |
| [research/inspection/](research/inspection/) | The 巡检 Figma, documented part by part |
| [research/home/](research/home/) | Astra home/component-contract research: component migration notes, VI coverage, surface policy, audits |
| [research/production-capabilities/](research/production-capabilities/) | Production capability briefs: fostering, mortality, treatment, piglet processing, count reconciliation, search/identity |

archive/ holds superseded renders.
