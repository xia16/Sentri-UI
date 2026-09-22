# Astra farrowing design study

11 September 2026. Entry: `../../system/farrowing-astra-concept.html`.

This isolated HTML/CSS/JavaScript prototype explores presentation for the existing farrowing workflow. The reference `farrowing.html` was not edited during this redesign. Its SHA-256 before and after was `E657FD89EAB8273BD5B93402271493D473C9C9CCB6A8C6738EDE529921D1209A`.

## Design decisions

- Counting: put the living total, visit receipt and recording tools together. Use one unboxed numeral, generous minus/plus targets, and a subordinate Born/Dead history door. Keep Close and Finish in the footer.
- Finish: retain the litter summary, then use aligned observation rows. Group optional details in one quiet surface. Keep the hold action visible while the form scrolls on smaller phones.
- Locked: distinguish Alive now from the fixed Born figure. Present finish observations as separate label/value pairs, followed by the finish timestamp and author. Keep the detailed record on its own pushed page.
- Across the flow: retain bottom sheets over the room, consistent stepper positions, green pending additions, amber corrections and explicit draft language. Use colour as reinforcement alongside text.

The qualified research set is documented in [reference criteria](ASTRA-REFERENCE-CRITERIA.md). Airbnb's labeled quantity rows inform the form alignment; Google Maps informs keeping the parent context visible beneath sheets. AllTrails edit sheets and Strava summaries inform scrolling forms and metric hierarchy. These are visual references, not sources for farrowing save semantics. Rejected or unqualified app examples do not set the design direction.

## Review and validation

The three examples are independent in-memory samples. Their menus expose before-start, death entry, blocked lock, edit, Born correction, record history and sow-ended scenarios. Count taps and finish observations update the sample immediately. Death entries commit only on Save; Back, swipe dismissal, backdrop dismissal and Escape discard their unsaved counts, cause, note and photos without a warning. Edit retains its existing draft behavior. Reload and Reset examples restore the fixtures. There is no backend, durable storage or sync implementation.

Owner revision after the initial review: discard unsaved death entries on return without confirmation. This supersedes the retained-death-draft behavior in the original rules for this Astra concept. The death-entry example now opens inside the drawer; the blocked-lock example uses an unsaved Edit correction.

Checked JavaScript syntax and the model transitions for count floor/undo, first-event death, retained death/edit drafts, lock gating, finishing, post-lock deaths with fixed Born, Born amendments, and sow ending. Browser checks verified the count/death/finish draft path and nested sow-page return. Inspected the three main layouts and phone-width breakpoints at 390 and 360 CSS pixels; long forms scroll with actions inside the phone, without horizontal content overflow. No browser console errors were reported. Hold timing is implemented for pointer and keyboard; a physical long-press usability trial remains outside this automated review.

This is a design prototype, not a production implementation or user-tested claim of usability improvement.
