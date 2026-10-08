# Lenses and panels

A **lens** is a reviewer with one question, brief and fresh each round: it did
not make the design and has not argued about it. Numbers and geometry belong to
the lint; a lens judges what the lint cannot.

Every lens gets: the slice's states (URLs and screenshots), the lint report,
the rulings, the design system's README, and the reference task's screenshots.
It returns findings that each name an element (`data-str`, `data-ds`, or a
selector) and say what should be true instead. A finding without an element is
a note.

## The lenses

| Lens | Its question | Runs |
|---|---|---|
| **Scenarios** | Does every scenario branch this slice owns reach an outcome or an explicit handoff? Invent one the branches miss that would change the design. | every slice |
| **Interaction** | Does every control have every state it can be in? Does every action give feedback, and is there a way back or an undo? What do double-tap, back mid-flow, offline and one gloved hand do? | every slice |
| **Copy** | Is every string in the registry, every verb used in its defined meaning, the same act named the same way as in finished tasks? Would a worker reading for two seconds know what happens on tap? | every slice |
| **Information** | At each decision, can the worker see what the decision needs? Does every recorded field map to something recorded? Is anything shown that nothing uses? | every slice |
| **Visual** | Hierarchy, crowding, what reads first — side by side with the reference task's matching screen. Never alignment in pixels. | every slice |
| **Consistency** | Does it behave like the finished tasks: headers, filters, lenses, end-task, receipts, sheets? | every slice; on the other model family |
| **Simplicity** | Can a step or screen go? For each, which of *remove, organise, hide, displace* applies — and where does the complexity move? | every slice |

## Checklists

Each lens also works its checklist, line by line. A miss the user catches at
review is a missing line: add it here, with the map it came from.

- **Interaction**: default · pressed · disabled or omitted-with-reason · focus
  · error · loading · empty · partial · offline — for each control and screen.
- **Copy**: no banned words · action labels start with a set verb · counts
  lead from 2 · units always written · zh keeps each verb's term.
- **Information**: every count says what it counts (population and time) as
  the glossary defines it.

## Design panels

A **candidate** (a new variant or a new component) goes to a panel before it
enters the design system.

1. **References**: Mobbin (screens and flows), mobile component libraries the
   developers already know (for Chinese apps: Ant Design Mobile, Vant,
   TDesign), and the old UI's own attempts. Extract patterns, not visuals.
2. **Two or three designers**, each from a different pattern.
3. **Critics**, each one role: the worker (gloves, hurry, sunlight, one hand,
   interrupted); the design-system steward (fits the tokens; where else would
   it be used?); the interaction critic (every state, every way out); the
   developer (build and maintenance cost).
4. **One author.** Pick the strongest proposal and refine it with the
   critics; never merge drafts. The other model family then tries to refute
   it.
5. **Output**: an ADR (why this pattern, why the others lost), a card with
   README, States and preview, marked `candidate`.
