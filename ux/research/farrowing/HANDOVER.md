# Farrowing — handover guide for the next session

You are inheriting the farrowing suite mid-build. The interaction model is SETTLED and
owner-signed; the remaining work is design execution on four surfaces plus polish rounds
the owner will drive chip-by-chip. This file is your entry point. Read it fully before
touching anything.

---

## 1 · Read these, in this order

0. `RULINGS.md` — **the standing rulings, current answers only; it outranks everything
   below.** The chronological docs contain superseded positions (that is how a previous
   session got confused about the dead WHEN chips); when in doubt, RULINGS wins.
1. `ux/system/components.html` — the law book. Row grammar, chip law, zero rule, field
   kit, the chassis (04d), lens law, forecast register. Every law here is owner-ratified;
   never re-litigate one silently.
2. `ux/system/screens.html` + `ux/system/check-in.html` — the fidelity anchors. **Copy
   constructions verbatim.** The single biggest failure mode in this project's history was
   approximating instead of copying — the owner rejected an entire draft as "half-assed"
   for style drift. Statusbar → appbar → ctxbar → lensrow+funnel → carded list → dock,
   exact classes, exact spacing.
3. `ux/system/motion.html` — the motion contract (advance / cross / exit destinies,
   receipts, 800 ms settle, group collapse). Every commit you draw must name its destiny.
4. `ux/research/farrowing/SYNTHESIS.md` — the suite map, cross-slice laws, owner rulings
   §6–§12 in chronological order (later supersedes earlier).
5. `ux/research/farrowing/session-interaction-spec.md` — the session model, FINAL. §1–§3
   are the contract; §7–§8 record audit and pattern adoptions.
   **Then `interaction-map.md`** — the complete low-fi walk of every surface, state,
   gesture, path and receipt in the drawer suite, with the inconsistency register (§7),
   the gap proposals awaiting owner sign-off (§8), and the open questions (§9). It is
   the reconciled contract; check a drawn detail against it before the older briefs.
6. `ux/research/farrowing/count-entry-pattern.md` — the researched posted/pending/
   correction architecture. It is cited law now, product-wide.
7. `ux/research/farrowing/user-flow-audit.md` — what simulated users broke and how it was
   fixed; contains a protect-list of things that WORK (minus-undo netting, convergence
   after sleep, After hierarchy). Do not regress them.
8. The five slice briefs (`session.md · ladder.md · identity.md · count.md ·
   lifecycle.md`) — requirements evidence for the four unbuilt surfaces.
9. `ux/system/farrowing.html` — the artifact you will be editing. Sections 09–09b are the
   built session suite; 09c–09g await their rounds.

## 2 · The settled model (do not reopen)

- **The room** (09): standing surface, drains, never closes. Lens Awaiting/Active/Done/
  All. Row grammar: line 1 = now (`9 alive · 5 dead` + interval chip while fresh), line 2
  = record (`born 14 · started 6h · parity 3`). ACTIVE prints green. One-tap started mark
  for unattended sows; overdue = `No record · day 117` red chip from day 116 (due =
  service + 114, hardcoded). No staleness tracking, no escalation prompts, ever.
- **The session sheet** (09a, During): three zones, one axis each. Hero = Alive
  `[− n +]` centered, framed count types on tap, receipt beneath (`5 posted · +4 this
  visit`); − drains pending free, net-down below posted is honest convergence with a
  standing reminder line (never a popup). Record block = `Born 14 · Dead 5` + breakdown
  metadata + `History ›` + `saved hh:mm · who` stamp + two-up `Record dead · Adjust`.
  Bar = `Close · Finish`. Born = alive + Σdead ± fosters, derived, never entered.
- **The dead drawer** (09b): ONE component product-wide (during via Record dead, post-
  lock via Record dead on the record, check-in off the litter row). Rest is read-state
  (posted count + lone +); touch grows − and the pending receipt; Done folds pending into
  posted per type. Types: stillborn · mummified · crushed · scours · starve-out · Other
  (absorbs unknown; farm tail behind it). NO WHEN anywhere — the stamp is the date.
- **Adjust** — THE one correction door, always available: pick the figure → amber banner
  ("Correcting a past record · logged as …") → provenance → what happened chips
  (miscount · wrong type › · wrong sow) → should-be value → signed delta appended, ✎
  glyph on the figure forever. Post-lock adds the Born ceremony (More born › / Count was
  wrong ›). NO other correction entrances exist — no floor-doors, no tap-the-fact, no
  hidden gestures. The owner explicitly banned scattered entrances ("whack-a-mole").
- **Finish**: hidden until any event exists → summary (`14 born · 9 alive · 5 dead` +
  breakdown) → "Any weak or deformed?" (healthy = remainder) → optional litter weight
  (soft range warn ~0.8–2.5 kg/piglet) + assisted checkbox → `Lock born N` hold-to-commit
  with drawn HOLD affordance, doubled gap from Back.
- **After**: a record. `14 ✎ born · locked` + `alive now`, read lines (living / dead /
  since final / fostered out → sow / litter weight · assisted ✎), History, bar
  `Adjust · Foster · Record dead`. Foster = Pairing, 12–48 h window, never during.
- **Persistence**: everything commits per tap; Close only closes; Save is dead (it taught
  unsaved-ness — audit blocker). Undo = the pending window, session-long, never a toast.
  Trail/History: append-only, nets per type per visit, same-visit pairs vanish.

## 3 · The owner: how to work with them

- **Iterate in small rendered rounds.** Every change: edit → puppeteer render → LOOK at
  the screenshot yourself → commit + push (they send the GitHub Pages link to colleagues)
  → send them the screenshot. Live: https://xia16.github.io/Sentri-UI/ux/system/farrowing.html
- They critique from screenshots, bluntly and correctly. Their instincts have beaten the
  first design repeatedly (Adjust button, append-only alive, the +4 misread, Report-death
  naming). When they propose a model, walk the flows honestly before disagreeing — and
  when you disagree, say so with the failure case, once.
- **Consolidate, never patch.** After the whack-a-mole complaint, piecemeal fixes are a
  breach. If a critique reveals a structural problem, redesign the structure.
- No design text inside phone mocks (aud footnotes died); mock numbers must agree across
  every screen and backdrop (audits caught drift twice); self-describing tokens ≤14 chars;
  no dim-as-disabled ever; census-only pen headers; no toasts, no submit buttons.
- They value: professional review panels (craft/ergonomics/system-copy), simulated-user
  attack audits (four personas walked flows tap-by-tap — repeat this before presenting a
  new surface), and web research when a pattern feels industry-general.
- Commit messages carry the why in full prose; every deviation from an anchor is marked;
  end plans with unresolved questions.

## 4 · The work remaining

| Surface | Section | State | Requirements source |
|---|---|---|---|
| Piglet-processing cohort | 09c | drawn pre-consolidation, needs the audit+polish treatment; token work-line exists | ladder.md + SYNTHESIS §2 |
| Tag/notch/weigh conveyor | 09d | drawn once, panel-reviewed once; posted/pending pattern NOT yet applied | identity.md; owner: both tag kinds, everything optional, no range mgmt, suggestion +1, dup warns never blocks |
| Count drawer + doors | 09e | drawn early; must adopt count-entry-pattern (assert → doors) and the one-Adjust-door consolidation; the up-doors are load-bearing for post-lock "more born" | count.md; audit B5 |
| Batch close | 09f | drawn once; warn+doors ruling stands (never hard-block; remainder = disposition doors) | lifecycle.md; SYNTHESIS §6 |
| Mating + scan edge cases | parked | untouched by design; production screens 2–3 | ops research + Figma 生产任务 |
| 09g contract tables | — | partially stale vs the final model; refresh when surfaces settle | — |

Cross-surface debts: apply posted/pending + one-Adjust-door consistently wherever counts
appear (09e Set count especially); check-in's litter-row death entry must be the same 09b
drawer; screens.html farrowing/piglet-processing phones predate the final model and will
need reconciliation once the owner declares the suite done.

## 5 · Open questions (owner answers pending)

- spec §6: dead-type defaults confirm; euthanized in defaults or behind Other; optional
  early classification worth two cells?
- SYNTHESIS §5 remainder: tag-range console pre-allocation (owner said none — closed);
  B2 who may amend born-alive post-lock (provenance philosophy suggests open ✎, never
  explicitly ruled); C2 unexplained counts at weaning close (owner said anomaly-tally,
  confirm at the weaning surface); E1 two hands claiming (live sync ruled, revisit only
  on real collisions).

## 6 · Tooling

- Render: puppeteer at `/Users/xia/.npm/_npx/55158e48eb5c59f7/node_modules/puppeteer`;
  screenshot scripts pattern in scratchpad (find vlabel → parentElement → screenshot).
  ALWAYS eyeball the render — div-balance checks catch structure, not clipping,
  truncation, or overflow (all three happened).
- Edit farrowing.html via python string surgery between the section marker comments
  (`<!-- ============ 09x name ============ -->`); assert on old strings, verify
  `<div` == `</div>` counts, and re-render after every splice. A non-greedy regex once
  silently ate three drawer rows — prefer index-bounded slices over regex.
- GIF assembly via PIL; play-once (no loop param). Deck fragments rebuild via
  `scratchpad/assemble.py` (workflows only, not farrowing.html).
- Commit trailer: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
