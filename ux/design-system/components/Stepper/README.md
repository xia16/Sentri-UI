# Stepper

Counts animals one step at a time. Use Measure instead for scale readings and Numpad for typed identifiers.

Status: candidate; implementation checked on this branch, owner approval remains separate.

## When
Use for animal counts in record rows, screen counts, foster and reconciliation.

### When not
Use Measure for measured quantities, PickerField for categorical choices, and Numpad for typed identifiers.

## Anatomy
Label; optional description; decrease key; spinbutton value; increase key; persistent status line; optional pointer text actions.

## Variants
- **Row** (`row`): use for inline animal counts in death, condition and adjustment records. not for the primary screen count — use count.
- **Count** (`count`): use for the primary count in Farrowing and Set count. not for repeated record rows — use row.
- **Well** (`well`): use for foster, move and reconcile counts. not for a measured value — use Measure.

## States
| State | Behaviour |
| --- | --- |
| Default | See rendered variant examples. |
| Empty | See rendered variant examples. |
| Pressed | See rendered variant examples. |
| Floor | The key at the bound takes the disabled face (aria-disabled); the bound (0, or the saved count when only additions are allowed) is the host's product rule. |
| Ceiling | See rendered variant examples. |
| Disabled | Visible reason; controls cannot change the value. |
| Error | Persistent corrective message, not colour alone. |
| Loading | Saving…; keys are aria-disabled until the host settles. |
| Draft | The value stays ink (green means approved only). Row: "+1 unsaved" in the muted face beside the label, so no row grows. Count and well: under the number. |
| Corrected | Corrected beside the revised value. |
| Long Chinese label | Wraps in full without ellipsis. |

## Behaviour
Keys emit data-action, data-value (field key), and data-step (requested delta). The host owns bounds, persistence and receipts; the component never commits. ArrowUp / ArrowDown on the spinbutton request the same delta as the visible keys. Floor and ceiling keys remain focusable and aria-disabled: the host answers refused taps in the status line. Loading and disabled hosts must reject deltas. Draft and corrected receipts include words. Pass localized status with the actual draft delta (for example +1 unsaved); the fallback says Unsaved. Keep roots and status regions mounted when patching.

Show at most seven row steppers in a drawer (six death causes plus one live-count correction); use a page for more, and keep the body scrollable. One count or well per sheet. Reserve hint space once per sheet with reserveHint:true on the row that can show pointers; all other rows use reserveHint:false. No selection state: these are counting actions.

## Content rules
Sentence case, labels normally ≤14 English characters or 8 Chinese characters. Longer labels wrap without truncation; descriptions ≤60 characters. Status lines state a single consequence; never repeat the label or count in a receipt. A pointer is a verb plus destination.

## Accessibility
Group is labelled by the visible label; value is a spinbutton with aria-valuenow/min/max; the screen reader's increment and decrement (sent as ArrowUp / ArrowDown) change it through the host. Every key has a Decrease/Increase accessible name and describes the status region. Keys act on activation. Keys, spinbuttons and text actions are at least tap-min in both dimensions.

## Do / don't
Do use row for repeated fields and count for the primary count. Do reject refused deltas in the host and explain why. Don’t type counts or use colour alone for drafts. Don’t reserve a blank hint beneath every row.

## API and tokens
SentriUI.stepper({variant, label, description, value, min, max, step, key, action, draft, changed, status, hint, hintHtml, pointers, reserveHint, disabled, reason, error, loading, pressed, strs, args}). Legacy hero maps to count. SentriTask.stepper is a compatibility adapter only; face maps to variant.

CSS variables: tap-min, control-height, field-height, stepper-row-min, hero-key, glyph-key, glyph-key-hero, space-key-gap, space-row-y, space-8, space-panel, radius-control, radius-count, radius-inset, font-sans, font-mono, type-entry-label-size, type-step-value-size, type-section-title-size, type-hero-count-size, type-figure-well-size, type-description-size, ink, muted, paper, well, control-border, disabled-fill, disabled-ink, press, amber, green, size-2, size-3. All sizing and colour resolve to tokens.

## Related components
[Measure](../Measure/README.md), [Numpad](../Numpad/README.md), [Field](../Field/README.md), [Sheet](../Sheet/README.md).

## Classification
Component: generic input used across sections. The named faces are variants, not copies. Optional input reveal is a pattern composed from OptionalRow and Field.

## Examples and references
[Preview](preview.html); [verification and screenshots](verification.md); each variant's states live in variants/*.html and variants.json. Primary guidance: the [component standard](../../../../docs/design-workflow/research/component-standard.md), Ant Design Mobile and TDesign; Material 3 and Apple HIG guide labels and target sizes.

## Changelog

2026-10-10: a draft value is ink, not green. In a row the draft / corrected word sits beside the label, so every row keeps one height. A minus key at the floor uses the same disabled face as the plus key at the ceiling.
2026-10-10: consolidated variants, corrected gate findings, documented states and migrated prototype forks. Numpad / Measure decisions remain outside this pass.
