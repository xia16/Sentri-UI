**Status: candidate.** Extracted from farrowing's flat radio rows (`.radio-row`: the sow-death causes) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)), owner round 5 (match farrowing exactly). It is not approved.

# TaskRadios (flat radio rows)

The design system's ChoiceList radio field (`SentriUI.choiceRadios`: `role=radio` buttons, an optional Clear) drawn as farrowing's flat rows.

**Anatomy** (`.tk-radios`, `data-ds="ChoiceList" data-face="flat"`)
- No panel. Each row `radio-row-min` (60px), padding 0, 10px gap, a 1px `line` **under each** row (the last too).
- The label 14px/400 `ink` (chosen: still 400, as farrowing).
- The radio at the right: `radio-size` 20px, a `ring-width-fine` ring in `muted`; chosen: the ring `ink` with the `radio-dot` in `ink`.

**Inline field** (`layout: 'row'`): farrowing's Finish field (`Assisted farrowing  (○ No) (○ Yes)`): one row at least 64px — the label 15px/500 with its Optional tag (10px `muted`) and Clear on the left (they wrap under the label when the row is short), the options right as 44px outlined pills (1px `control-border`, 11px radius, 13px/500, a 14px radio, 6px apart); chosen: the pill's edge `ink` on `press`. It is the ChoiceList's `inline` layout (same keys, events and Clear), marked `data-face="row"`.

**Component contract**
- **Props:** `SentriTask.radios({ …SentriUI.choiceRadios props })` (`label`, `options: [{ value, label, meta, strs }]`, `selected`, `action`, `key`, `optional`, `id`). `layout`: rows (default) or `'row'` (the inline field).
- **Events:** the ChoiceList's (`<button role=radio data-action=action data-value=value>`).
