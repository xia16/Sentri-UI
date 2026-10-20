# Disease and symptom: critique

Scope: the atlas entry moves from the archived event deck (`ux/archive/workflows.html`, `wf-condition` and `wf-resolve`) to the
live Inspection prototype (owner, 2026-10-20: the Health record built in Inspection is the design). Two defects the move brought into
view are fixed in the prototype.

## Keep

- What the deck got right and the live flow already has: one catalogue for diseases and symptoms, no chain of confirmation screens,
  the walk list as the receipt (the condition on the row), and a pig that already has the condition gets no second record.
- Resolve keeps two outcomes that write different things: Recovered closes the case and keeps it in history; Entered in error
  marks a correction. (The deck's unequal weight, a big Recover tick beside a small "wrong" chip, is not kept: the owner's live
  design asks for the outcome in one picker, as Self-crit says.)
- The live screens' own design as merged in #223 (Actions, Record health as a page, the conditions picker, Resolve conditions):
  unchanged here except the two Problems below.

## Problems

- **major** · The feature showed an earlier design: the deck's verb sheet (Health / Routine bar, Triage and Death tiles, "7 not
  available for growers"), the drawer with triage inline, and the verdict page with Recover and Strike. The owner's decision makes
  the live prototype the design, so every screen moves to its live state.
- **major** · A pick returning to its field drew the ink focus ring (Record health's Conditions after Done, Resolve's Outcome after a
  pick): a tap must leave no ring (touch states only). Only Record treatment's form had the quiet return.
- **major** · On Resolve, a pig the action leaves unchanged faded to 55%: its ear tag at 3.6:1 and its line at 2.2:1, under the 4.5:1
  floor. Its right-hand line ("No Thin") already says it will not change.
- **major** · In Chinese the health flow read English: Record health's labels, the whole catalogue (areas, examples, condition
  names), Add a condition's fields, Resolve's labels and outcomes, and the condition tags on the walk list. The catalogue already
  carries every name in Chinese; the page's localizer never used it, and the labels had no registry entries.
- **minor** · On Resolve at 360, "No open conditions" (nothing open), "No Thin · unchanged" (not this condition) and "Thin · choose outcome" (before an outcome) pushed the pig's pen · stage · days line onto two lines,
  so the two pig rows had different heights.

## Parts

| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| Verb sheet (deck) | static deck markup | Actions (inspection.actions, Choice tiles) | **cut**: replaced by the live Actions |
| Add condition drawer (deck) | static deck markup | Record health page (PickerField, Field) | **cut**: replaced |
| Verdict page (deck) | static deck markup | Resolve conditions (bulk rows, PickerField) | **cut**: replaced |
| Focus on a field after a pick | `render()` chooser return in `inspection-astra-concept.js` | the quiet focus (`[data-touch-focus]`, bundle.css) | **fix**: every chooser return, not only Treatment |
| Unchanged pig on a bulk form | `.bulk-pig-row.is-excluded .bulk-pig-copy{opacity:.55}` | the row's own line says unchanged | **cut**: no fade; the row reads like the others and its line says unchanged |
| Chinese on the health flow | `localizeFeed` (`ux/system/feed-locale.js`) matching `feed.copy.*` registry strings | the registry (`feed.copy.health.*`) for labels; the conditions catalogue's own `zh` for names | **fix**: labels added to the registry; names, types, areas and systems read from the catalogue; the condition search redraw is localized too |
| A pig with nothing open on Resolve | `bulkChanges` summary in `inspection-astra-concept.js` | copy that fits the row | **fix**: "Nothing open" |

## Self-crit

There are no competing directions: the owner chose the live design, so each moved screen is the live prototype's state, judged
against the deck phone it replaces. Against the deck, the live screens drop the inline triage and the Strike chip, which the deck
used for speed; the live Care field and the Outcome picker cost a tap each but say what they write. In the picker, Recovered and
Entered in error are two equal rows: the worker reads the word, not a size, and the correction is a deliberate pick rather than a
small target beside a big one. The fixes are judged on the screens they move: Record health with a condition chosen, Resolve with an
outcome chosen, bulk forms with an unchanged pig, and in Chinese every screen that shows a condition or the health flow's labels.

# Chinese pass (PR 244), critique

Scope: the words only. At `?lang=zh` these screens read in English where the Inspection prototype draws them: the walk list's stage days behind the Disease and symptom screens and the pig record they return to. Nothing is added, moved or cut in EN.

## Keep

- Every surface, row, order, weight and colour as it is: the change replaces English words with Chinese in the same place, in the same component, at the same weight.
- EN exactly as it is.
- Ear tags, pen codes, medicine and brand names, the worker's name, RFID, record numbers and the units mL and °C stay in Latin script; kg reads 公斤 (as on main) and mm reads 毫米.

## Problems

- **major** · At ZH 360 the parts above read in English beside Chinese, so a Chinese-reading worker reads two languages on one screen (P2: read in two seconds).
- **minor** · Dates read in English forms (`1 Aug 2026`, `Aug 1`, `Thu`) and day counts as `40d`.
- **minor** · Copy that is longer in Chinese has to fit its component at 360 (a pen-map tile holds four characters: `Not in unit` reads 非本单元).

## Attention budget

Unchanged: each screen shows the same information in the same order as on main, in Chinese. Cut list: nothing is cut.
