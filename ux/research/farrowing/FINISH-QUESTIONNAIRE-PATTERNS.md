# Finish questionnaire — focused pattern study

16 September 2026. Scope: Weak / Deformed counts, optional litter weight, and optional assisted-farrowing answer in the existing finish drawer. This is a study of first-party design-system patterns, not a claim that specific consumer apps use this exact form or that the proposed design has been usability-tested.

## Evidence from established systems

| System | Published guidance | Relevant implication |
| --- | --- | --- |
| Apple Human Interface Guidelines | Steppers suit small incremental changes. Keep the affected value obvious; consider text entry when large changes are likely. [Steppers](https://developer.apple.com/design/human-interface-guidelines/steppers) | Weak and Deformed can remain separately labelled count controls, with the current number between decrement and increment buttons. |
| Google Material through Android's official component documentation | Single-select segmented buttons expose mutually exclusive options side by side. The examples distinguish single-select from multi-select controls. [Segmented button](https://developer.android.com/develop/ui/compose/components/segmented-button) | Two short choices can be visible together rather than hidden in a menu. This supports the presentation, not a requirement to use a particular web implementation. |
| GOV.UK Design System | Mark optional information on each field label, or on the legend for radio/checkbox questions. Ask only for information the service needs. [Question pages](https://design-system.service.gov.uk/patterns/question-pages/) | Put Optional directly beside litter weight and the assistance question, rather than above a vague Additional details section. |
| GOV.UK Design System | Use radios for one choice from a set. Avoid preselecting answers. Group controls with a fieldset and descriptive legend. Ordinary radios cannot return to an unanswered state after selection. [Radios](https://design-system.service.gov.uk/components/radios/) | Use explicit Yes / No answers for assistance and retain a distinct unanswered state. |
| GOV.UK Design System | Place concise visible labels above text inputs; placeholders must not replace labels. Inputs support persistent suffixes. [Text input](https://design-system.service.gov.uk/components/text-input/) | Give weight its own label above an outlined entry, with kg visible independently of the value. |

The Material guidelines page itself required JavaScript in this research tool. The Material comparison above therefore uses Google's readable first-party Android documentation, which links back to Material 3; it does not rely on third-party summaries.

## Proposed adaptation — design judgment

Keep a single compact questionnaire within the existing drawer. These few closely related finishing answers do not warrant a new multi-page wizard. GOV.UK's broader preference for one question per page is not copied literally into this repeated, short farm task.

1. **Piglet condition:** a clear question or prompt, one short line explaining the alive-piglet scope, then Weak and Deformed counts. Keep both controls visible. A preliminary Yes / No gate would add a decision and hide the data that the user is already here to enter. Preserve the established zero-count semantics and constraints.
2. **Litter weight · Optional:** label above an outlined numeric entry with a persistent kg suffix. A blank optional field means unrecorded, not zero. Size the input for a short weight value rather than stretching it merely to fill a row.
3. **Was farrowing assisted? · Optional:** two large, mutually exclusive Yes / No choices using native radio semantics. An unchecked single checkbox ambiguously conflates No and unanswered in this optional questionnaire. Neither answer should be preselected for a new record. Existing saved answers must remain selected when editing.

Use one consistent question-label treatment and spacing to group each question with its answer. Do not force a read-only icon/title and fact-grid pattern onto editable fields. Avoid decorative cards or horizontal rules between every question; reserve emphasis for the input boundaries, focus, selected answers, and validation.

For assistance, store unanswered separately from false. Show **Not recorded** in read-only detail when skipped, **No** only after an explicit No answer, and **Yes** after Yes. A quiet **Clear answer** action can restore the optional unanswered state after selection. This tri-state model and the clear action are our product inference from the optional-field requirement and the radio limitation; they are not prescribed verbatim by the source systems.

## Validation scope

Check that count controls still enforce their limits; weight stays labelled and accepts the existing numeric format; Yes / No are exclusive and keyboard operable; Clear answer restores unanswered; optional omission does not block finishing; saved Yes / No / unrecorded states read back accurately; and all questions remain usable at narrow phone widths with the fixed drawer footer.
