# Disease and symptom: critique

Scope: the atlas entry moves from the archived event deck (`ux/archive/workflows.html`, `wf-condition` and `wf-resolve`) to the
live Inspection prototype (owner, 2026-10-20: the Health record built in Inspection is the design). Two defects the move brought into
view are fixed in the prototype.

## Keep

- What the deck got right and the live flow already has: one catalogue for diseases and symptoms, no chain of confirmation screens,
  the walk list as the receipt (the condition on the row), and a pig that already has the condition gets no second record.
- Resolve keeps two outcomes of unequal weight (Recovered as the normal act, Entered in error as a correction).
- The live screens' own design as merged in #223 (Actions, Record health as a page, the conditions picker, Resolve conditions):
  unchanged here except the two Problems below.

## Problems

- **major** · The feature showed an earlier design: the deck's verb sheet (Health / Routine bar, Triage and Death tiles, "7 not
  available for growers"), the drawer with triage inline, and the verdict page with Recover and Strike. The owner's decision makes
  the live prototype the design, so every screen moves to its live state.
- **major** · A pick returning to its field drew the ink focus ring (Record health's Conditions after Done, Resolve's Outcome after a
  pick): a tap must leave no ring (touch states only). Only Record treatment's form had the quiet return.
- **major** · On Resolve, a pig the action leaves unchanged faded to 55%: its ear tag at 3.6:1 and its line at 2.2:1, under the 4.5:1
  floor. Its right-hand line ("No Thin · unchanged") already says it will not change.

## Parts

| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| Verb sheet (deck) | static deck markup | Actions (inspection.actions, Choice tiles) | **cut**: replaced by the live Actions |
| Add condition drawer (deck) | static deck markup | Record health page (PickerField, Field) | **cut**: replaced |
| Verdict page (deck) | static deck markup | Resolve conditions (bulk rows, PickerField) | **cut**: replaced |
| Focus on a field after a pick | `render()` chooser return in `inspection-astra-concept.js` | the quiet focus (`[data-touch-focus]`, bundle.css) | **fix**: every chooser return, not only Treatment |
| Unchanged pig on a bulk form | `.bulk-pig-row.is-excluded .bulk-pig-copy{opacity:.55}` | the row's own line says unchanged | **cut**: no fade; the row reads like the others and its line says unchanged |

## Self-crit

There are no competing directions: the owner chose the live design, so each moved screen is the live prototype's state, judged
against the deck phone it replaces. Against the deck, the live screens drop the inline triage and the Strike chip, which the deck
used for speed; the live Care field and the Outcome picker cost a tap each but say what they write. The two fixes are judged on the
screens they move (Record health with a condition chosen, Resolve with an outcome chosen, and other bulk forms with an unchanged pig).
