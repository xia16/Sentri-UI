# Field

Labels a text control and its persistent help or corrective message. Use PickerField instead for choices and Stepper for animal counts.

Status: candidate; implementation checked on this branch, owner approval remains separate.

## When
Use for required text, treatment doses with units, and explanations; show a note editor only after the worker chooses Add.

### When not
A Field is never shown open for an optional input. An optional Note is an optional row: label · muted Optional · trailing Add action, opening this Field. Reuse SentriUI.optionalRow({label, inline:SentriUI.field(...)}). Use PickerField for options, Stepper for counts, and Measure with Numpad for weights and typed tags.

## Anatomy
Root label; visible label text; one input or textarea; optional unit in the label; optional help/error/reason line beneath the control.

## Variants
- **Text** (`text`): use for identity and required short text. not for choices — use PickerField.
- **Number with unit** (`number`): use for treatment dose with the unit in the label. not for animal counts — use Stepper.
- **Textarea** (`textarea`): use for a required explanation or a note after Add. not for an unopened optional note — use OptionalRow.

## States
| State | Behaviour |
| --- | --- |
| Default | See rendered variant examples. |
| Filled | See rendered variant examples. |
| Error | Persistent corrective message, not colour alone. |
| Disabled | Visible reason; controls cannot change the value. |
| Longest label (and Longest label · 中文) | Real copy at the Copy budget, in the real container at 390px: one line, nothing wrapped or cut. Longer copy is rewritten. |

## Behaviour
Fields stack in capture order, never in columns. Textarea grows with field-sizing:content and has no drag handle. Error takes precedence over help; disabled reason takes precedence over help. Messages persist after typing and are linked through aria-describedby. Hosts validate on commit or blur and supply what went wrong and how to fix it. Native disabled controls cannot be edited and always have a nearby reason. No loading or selection state: submitting belongs to Button. A dedicated Note editor has already been opened by its entry row; do not put another optional row inside it.

## Content rules

### Copy budget

| Text | English | 中文 | Lines |
| --- | --- | --- | --- |
| Label | 30 | 15 | 1 |
| Hint or reason | 60 | 30 | 2 |
| Placeholder | 24 | 12 | 1 |
| Short text value (entered) | 80 | 80 | n/a |

Over-budget copy is rewritten to the shortest copy that still names the act; it is never wrapped, shrunk or ellipsised to fit. The “Longest label” state shows real copy at this limit in the real container at 390px. Budgets come from what fits at 390px inside the screen gutters; a `{n}` or `{name}` slot counts as 3 characters. Entered text is the worker’s, not copy: it is limited by the host (notes 500), never rewritten by the component.

### Writing rules

Sentence case labels. Put units in the label, not the entered value. Placeholder offers an example, never repeats the title or substitutes for a label. Chinese copy uses the same sans font.

## Accessibility
Native label associates with one nested control. Hint/error uses aria-describedby; errors add aria-invalid and role=alert. The native input announces its role, label and value. The platform number keypad opens for number fields. Fields are at least field-height / tap-min. Use inputmode=decimal for number and an appropriate input type. Raw control HTML is trusted host markup; aria labels and existing descriptions remain the host’s responsibility.

## Do / don't
Do name the missing value and a fix in errors. Do pick Unit first, then Dose with the unit in its label. Don’t show an optional textarea before Add. Don’t repeat “Add a note” as title, label and placeholder.

## API and tokens
SentriUI.field({label, variant, value, unit, hint, error, disabled, reason, id, placeholder, control, className, ds, labelHidden}). control remains a compatible trusted HTML slot; otherwise the component generates the native control. label accepts trusted registry markup. labelHidden hides only the visual label when the opening OptionalRow already names it; retain its accessible association. Optional inputs use SentriUI.optionalRow; required conditional explanations use Field directly.

CSS variables: tap-min, field-height, font-sans, font-size-12, font-size-14, type-description-size, space-9, space-18, space-12, control-border, radius-control, ink, muted, paper, well, red, size-2, size-3, ring-width-fine, size-90. All sizing and colour resolve to tokens.

## Related components
[PickerField](../PickerField/README.md), [Stepper](../Stepper/README.md), [Measure](../Measure/README.md), [Sheet](../Sheet/README.md). OptionalRow is the shared reveal pattern in bundle.js.

## Classification
Component: generic input used across sections. The named faces are variants, not copies. Optional input reveal is a pattern composed from OptionalRow and Field.

## Examples and references
[Preview](preview.html); [verification and screenshots](verification.md); each variant's states live in variants/*.html and variants.json. Primary guidance: the [component standard](../../../../docs/design-workflow/research/component-standard.md), Ant Design Mobile and TDesign; Material 3 and Apple HIG guide labels and target sizes.

## Changelog
2026-10-10: consolidated variants, corrected gate findings, documented states and migrated prototype forks. Numpad / Measure decisions remain outside this pass.
