# Rulings

Every owner ruling, newest first. A ruling leaves this list one of two ways:
- **Concrete** (it can be stated or measured exactly): it becomes a design-system law or a component spec, with a check where it can be measured. The pair is kept as evidence and as the check's test case.
- **Judgement** (cluttered, bulky, heavy: not yet statable): it becomes an example under one quality and climbs the taste ladder ([README](README.md)).

| Date | Screen | Board | Owner | Exit | Where |
|---|---|---|---|---|---|
| 2026-10-13 | Farrowing record and every task drawer about an animal | Today (sow ID as title ›) · A centred title + sow pill · B title + sow line + (i) · C sow as first row; then A1 (tag icon + ID › as the only tappable chip, pen · parity · stage in grey beside it) · A2 (details below) | **A1** — "lets make it so the tap area is only on the part of the sow ID … with the other information in grey … to differentiate" | Concrete → Sheet component spec: a task drawer about an animal has a short centred title; the animal is a chip (tag icon + ID ›), the only tappable part, opening the animal on a layer above; pen · parity · stage in grey beside it | [evidence](../../../ux/design-system/evidence/2026-10-13-sheet-task-header-sow-chip.png); spec to land with the Sheet change |
| 2026-10-13 | Farrowing · Record dead | A today · B space between the Piglets / The sow switch and the list, no divider above it · C B with a near-invisible − at its floor | **B** — "it is really cluttered here"; "if things are only off by a bit it is fine, we are not trying to copy Airbnb" | Concrete → law "Space groups" + `scripts/check-spacing.mjs` | [evidence](../../../ux/design-system/evidence/2026-10-13-space-groups-record-dead.png); `ux/design-system/README.md` |
| 2026-10-12 | Environment, Assistant headers | PREVIEW badge: A 9px · B in the subtitle · C 11px · D none | "why do we need that? The preview will never be shown to the users" — prototype chrome is not product (P1) | — | Concrete → P1 (prototype chrome is not product) |
| 2026-10-11 | Environment | c3 | "the left one is still better; yours looks like a bulky brute" | Judgement → example (bulky, held-out) | [c3](bulky/held-out/c3.png) |
| 2026-10-11 | Environment | c2 | "calmer but no visual hierarchy; just a bunch of information put on a screen, no UI" | Judgement → example (flat, held-out) | [c2](flat/held-out/c2.png) |
| 2026-10-11 | Environment | c1 | "better now, but a lot more cluttered; I would not call this passing" | Judgement → example (cluttered, held-out) | [c1](cluttered/held-out/c1.png) |
