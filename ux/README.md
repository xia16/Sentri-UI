# ux/ — the Sentri redesign corpus

## system/ — the design system and its screens (start here)
| File | What it is |
|---|---|
| [home-astra-prototype.html](system/home-astra-prototype.html) | Home / today — the entrance |
| [inspection-astra-concept.html](system/inspection-astra-concept.html) | The inspection walk |
| [farrowing-astra-concept.html](system/farrowing-astra-concept.html) | The farrowing flow |
| [components.html](system/components.html) | The parts and the laws: row grammar, record-sheet shell + field kit, the chassis, the entrance (verb sheet), detail-page grammar, the consistency contract |
| [motion.html](system/motion.html) | Mark-to-move motion spec, with the front-end implementation contract |
| [farrowing-contract.html](system/farrowing-contract.html) | The farrowing state contract (developer handoff) |

Shared layer — every screen renders from these: `sentri-components.js/.css` (heading · panel · facts · row · log · field · picker field + sheet · segment · icon button), `sentri-icons.js` (one icon registry), `sentri-visual-foundation.css` (tokens), `astra-surfaces.js/.css` (sheet/page presentation). Guardrails: `no-native-selects.test.cjs`, `icon-registry.test.cjs` — run all suites with `node <file>` in `system/`.

Superseded renders live in [archive/](archive/): the old farrowing suite (`farrowing.html`), the unified task list (`screens.html`), the check-in study (`check-in.html`), and the workflow review deck (`workflows.html`).

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

archive/ holds superseded renders.
