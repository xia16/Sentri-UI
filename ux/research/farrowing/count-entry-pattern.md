# The count-entry pattern — cross-industry research synthesis

Commissioned for the farrowing session sheet; applies product-wide wherever a committed
count meets live entry (set count, treatments, weaning). Three researched domains —
inventory/WMS, consumer tally apps + platform guidelines, regulated ledgers (eMAR, LIMS,
accounting, banking, aviation) — converge on one architecture. Full citations in the three
research reports (see git history of this round).

## The three layers every mature field arrives at

**1 · Posted — the committed fact.** Plain text, no border, no affordance, never directly
editable. (Banking "posted"; Odoo's on-hand column; inFlow's frozen snapshot; the baby
tracker's history list.) Provenance rides beside it: `12 · recorded 14:32 · G.H`.

**2 · Pending — the session buffer.** The + is the only resting control. Each tap grows a
visually distinct session delta beside the fact — displayed as `14 +3`, never merged —
and the − grows in only while the session delta > 0, draining **only the buffer, clamped
by construction**: it can never touch posted state, so the invariant is guaranteed, not
requested. On session close the buffer folds into the fact as ONE stamped event
(`+3 · 14:32 · G.H`). The undo window is the session, not a toast timer (Material's own
guidance: undo must not race a clock; Gmail's hold-window; farm hands are hands-busy).
Same-session fixes need no reason and leave no mark — that is the pending window's whole
point. (Odoo count-session → Apply; cart grow-in minus; Square/Shopify delta-vs-set;
banking pending-vs-posted.)

**3 · The correction door — an event, not an edit form.** Fixing the past is a separate,
deliberately-shaped flow that announces itself:
- A one-line state banner, not a dialog: *"Correcting a past record — logged with your
  name."* (eMAR late-entry labeling as UX; Epic's flagged cell.)
- It asks **what happened, not what number**: preset reason chips (miscount · missed
  entry · wrong sow …) + the new truth; the system computes and appends a signed
  correction event referencing the original. The old value is never obliterated.
  (Accounting reversing entries; LIMS corrected report; FAA "new entry referencing the
  erroneous one.")
- Reason capture is mandatory ONLY here, and cheap — chips, one tap; free-text optional
  (mandatory prose becomes "asdf").
- Any figure carrying corrections wears a small corner glyph forever; tapping it reveals
  original → correction · who · when · why. The KPI shows the net; the mark preserves
  trust. (Epic Show-Audit; QuickBooks "Voided" stays visible.)

## The four laws under the three layers

1. Two doors, differently shaped: recording now is frictionless; amending then announces
   itself. Never one shared edit affordance.
2. The original never disappears — strikethrough, version, or reversing event.
3. Who/when stamp automatically everywhere; **why only on the amend path**.
4. Corrections are normal; punishing them is what breeds falsification. (The livestock
   software we found — AgriWebb's plain edit-a-death-record — is the cautionary tale,
   not the model.)

## Control-grammar conventions worth adopting verbatim

- **Steppers tap deltas; numpads type absolutes.** (Odoo: +1 buttons to count, pencil
  numpad to override; Square Re-Count mode switches to absolute.)
- **The reason picks the arithmetic** (Square: "Received" adds, "Loss" deducts,
  "Re-Count" sets) — our death-cause cells already are this.
- Minus left, plus right; disable at floor within a mode, swap controls between modes.
- Blind-count option for assertions (SAP/Odoo): seeing the expected number re-anchors
  the counter. Console-configurable someday; not v1 barn chrome.
- Large-variance soft check (SAP tolerance): a correction bigger than N asks "recount?"
  once — a nudge, not a gate.

## Mapping to the session sheet

- Alive: `14  +3` — posted fact plain, session chip distinct, − drains the chip only;
  fold-on-close event. Tap the chip's count area to type (numpad = absolute assert).
- Dead drawer rows: identical grammar per type; rest state is posted fact + lone +.
- The Adjust/amend door (post-lock, and cross-session corrections): rebuilt as the
  correction event flow above — banner state, reason chips, computed delta, corner glyph
  on amended figures.
