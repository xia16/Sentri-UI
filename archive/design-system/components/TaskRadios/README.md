# TaskRadios

Retired as an independent component. Use [ChoiceList](../../../../ux/design-system/components/ChoiceList/README.md)'s radio: `SentriUI.choiceRadios({ face: 'flat' })` for farrowing's flat rows (60px rows, a line under each, a thin ring at the right), and `{ layout: 'inline', face: 'row' }` for the inline field with outlined pills.

`SentriTask.radios` remains a thin compatibility alias of `choiceRadios` for existing task skeleton callers (the Piglet processing pages). It draws the same markup as before and adds the `tk-radios` class; the CSS lives in `bundle.css` under the ChoiceList flat face. Classification: alias of ChoiceList, not a separate component or variant. It was a candidate (extracted from farrowing's `.radio-row`, [ADR 0003](../../../../ux/design-system/adr/0003-task-skeleton.md), owner round 5), never approved.
