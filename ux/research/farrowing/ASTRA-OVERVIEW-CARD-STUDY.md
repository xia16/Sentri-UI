# Shared task overview card

## Requirement and scope

The owner asked for a better overview card that works across tasks with different metrics. The existing `screens.html` configuration table defines eight relevant examples: heat check, return-heat, pregnancy, breeding, farrowing, postpartum, weaning and piglet processing. The `components.html` context-bar contract separates the current unit's performance KPI from a door into whole-task progress. Owner clarification takes precedence over outdated examples: Task overview always aggregates all task units.

This change applies a shared renderer to the separate Farrowing concept and exposes all eight task examples in `task-overview-astra-study.html`. Original task screens remain untouched. The other task examples demonstrate presentation and source sample values; their workflows are not implemented here.

## Reference observations

Inspected four Mobbin screens across two established apps. These are visual observations, not usability-test results or an assertion that consumer metrics map directly to farming.

- [Revolut analytics](https://mobbin.com/screens/df7b1aab-511c-4959-9238-7ec8da733902) pairs small metric labels with prominent values. The budget card separates amount remaining, status and the progress track. This supports distinguishing a primary metric from its supporting context, and keeping progress supplementary.
- [Revolut budget detail](https://mobbin.com/screens/b578103d-3eca-4520-b50f-1698113428d7) states what the figure means (“left to spend”) and presents a defined budget. We retain clear labels and denominators; a large gauge would consume too much space in the farm's room header.
- [Apple Fitness widgets](https://mobbin.com/screens/c1fe70c1-c102-41c8-9352-15f5897055f5) distinguish movement progress toward a goal from step and distance totals, preserving each unit. We retain explicit units and goal semantics, without copying the rings or saturated colors.
- The [Apple Fitness activity detail](https://mobbin.com/screens/e7ca6eb2-7bce-43dd-92b2-c1b9cced5155) also labels steps, distance and flights as distinct measurements. It does not provide evidence for a unified task-completion percentage.

## Shared visual structure

The two-column overview has a shared warm neutral background, subtle outer border and shadow, and an inset divider. The owner rejected the completely flat version because it looked worse; the card boundary was restored to group the overview while keeping the simplified white pen headers. The task cell gains a subtle tint only while pressed, preserving the separation between navigation and green Active status. Headers and primary values align. Metric meaning sits immediately below its value; target or supporting counts sit below that. “All units” remains explicit on the task side. The chevron belongs only to that interactive side. Pen headers share their rows' white background; their dividers, card boundaries and status tags remain.

Targets no longer compete with the primary value on its baseline. Metric suffixes (% / h / kg) stay attached to numbers. An amber target line indicates the source example is below its specified target, without introducing an alert badge or declaring an unvalidated risk state.

Three presentations share the same component:

| Kind | Task examples | Treatment |
| --- | --- | --- |
| Open counts | Farrowing, breeding | Primary count and supporting states/queue; no invented denominator or progress bar |
| Bounded coverage/outcome | Heat, pregnancy, postpartum, weaning, piglet processing | Numerator / denominator, explicit outcome or counted entity, narrow progress track and time context |
| Elapsed monitoring window | Return-heat | Days / total days, neutral track, returned count separately; never described as animals checked |

Farrowing uses the live task aggregate (initially 2 active / 9 awaiting / 8 done across three sample units). Its left KPI remains Unit 7's illustrative 10 live/litter, target 12. The room's state tabs remain local and filtered. The card does not change recording rules or whole-task scope.

## Validation

Check the Farrowing card in its real room, including opening the existing task-wide sheet, filtering without changing task totals, and maintaining sticky-filter pen navigation. The comparison page uses the same renderer and stylesheet for all eight examples and supports 320/370/410 px card widths. Check long labels, three-digit numerator/denominator values, target directions, readable units and elapsed-days semantics at narrow widths.

Completed browser checks: all eight cards fit at 320 px without overflowing their value, label or cell; Farrowing and breeding have zero progress tracks, while the six bounded examples each have one. The Farrowing card opens the existing task-wide sheet (19 sample sows across three units). Applying the room's Overdue filter leaves its 2 active / 9 awaiting / 8 done task aggregate unchanged. A pen jump still positions B4 directly below the sticky controls (measured offset under 1 px). Existing recording-model checks pass, and the original reference file's hash is unchanged.
