# Piglet processing — handoff (2026-10-06)

Read this first in a new session. It says where everything is, what the owner has decided, and what is open. Run with the `design-drive` skill (`.claude/skills/design-drive/`, untracked in this worktree — copy it if you start elsewhere).

## Where things are

- **Repo / branch:** `xia16/Sentri-UI`, map branch `map/3-piglet-processing` (head `99ae8c9`, everything below is merged and pushed). Main is untouched; closing = one PR map → main (owner merges, tag `design/piglet-processing/1`).
- **Map issue:** GitHub #3 (Stage: working) — decisions, provisionals, status. Body source was the driver's scratch `map.md`; regenerate from this file + RULINGS if lost.
- **Two prototypes live side by side:**
  1. **Full task** — `ux/tasks/piglet-processing/` (`room.html` hosts the litter drawer via `litter.js`; `dead.html`, `count.html`, `move.html`, `id.html`, `edit.html`, `end.html`, `bulk.html`; shared `ledger.js` + `fixtures.js`). Built on farrowing's skeleton. Behaviour-complete for rulings rounds 1–7, but **too complicated** (see Simplification).
  2. **Simplified prototype** — `ux/tasks/piglet-processing/simple/` (`index.html`, `app.js`, `state.js`, `strings.js`, `app.css`; `build.mjs` → `dist/app.html` standalone; `register.mjs` → `sp.*` strings). Small own state model, no `ledger.js`. **This is the direction the owner is judging now.**
- **Serve:** `node scripts/serve-ux.cjs 4317` (or the Browser pane's `ux` launch config) → `http://localhost:4317/ux/tasks/piglet-processing/simple/index.html`. Always show the owner screens inside the 390×844 phone frame.
- **Design system:** `ux/design-system/`. Task skeleton (candidate, ADR `adr/0003-task-skeleton.md`): `components/task-skeleton.css|js` (`window.SentriTask`: TaskPhone, Header, Summary, Lens, Group, Row/door/doors, Dock, Sheet, Hold, Page, Dialog, Totals, Progress, Stepper faces, Photos, Choice, Radios, Warning, Section, Day, Receipt, Table, Metrics, **Chips**). Candidates 2: ADR 0002. Tokens: `tokens.json` → `tokens.css` via `scripts/tokens-css.py`.
- **Rulings:** `ux/research/farrowing/RULINGS.md` → *Piglet processing*, rounds 1–8 (round 5 = look like farrowing; round 8 = farmers-first simplicity, bulk kept with time-window override).
- **Walk-throughs:** `scenarios.md` (rounds 1–3 classified); raw/condensed reports in `research/walks/r1|r2|r3` (r3 scenario 2 is summarised only in scenarios.md R3-18). Walk brief: `research/walks/walk-brief.md`.
- **Parity:** `parity.md` + `parity/` (processing vs farrowing pairs); reviews `research/walks/parity-review-*.txt` (other family GREEN after 4 rounds).
- **Simplification proposals:** `simplify-proposals.html` (also published privately: https://claude.ai/artifact/YSeoKLSj41kkuaeWZ82KLX).
- **Retro:** `retro.md`, 34 entries (29–34 are the costly ones: drift from farrowing, no pruning, plain UI bugs, full-window presentation, everything on Opus, no complexity budget).
- **Tests:** `node --test tests/ledger.test.mjs tests/field-cards.test.mjs tests/candidates-2.test.mjs` (207) and `node tests/*click-through.mjs` (9 suites, ~118 flows) — all pass on the full task. Lint: `node .claude/skills/design-drive/scripts/design_lint.mjs --repo . --page <name> … --port N --out DIR` (page names in `docs/agents/design.md`; run in chunks of ~60).

## Owner decisions that shape what comes next

- **Same look as farrowing**, pruned to its density; Back not Close; show in the phone frame (memory: sentri-task-design-parity).
- **Simplicity first**: farmers, not tech-savvy, used to paper; prefer rules that restrict over mechanisms that handle edge cases; the app settles conflicts itself (memory: simplicity-first).
- **Model split**: Opus for driving/ledger/judgment, Sonnet for briefed builds, other family (collab) for reviews; set `model` on every dispatch (memory: agent-model-split).
- From the simplified prototype (owner feedback 2026-10-05/06): tagging and breeders are back with a farm scheme (tag all · notch all · breeders only · no ID); ID is **always available** on a pen *and* a reminder step on the farm's ID day; the pen sheet is a **timeline** (done days collapsed); **job chips** replace both the old filter/bulk page and the To do / Done / All tabs; bulk = chip-filtered list with ticks + hold, window-checked with a "Record anyway?" override; recording happens **in place** (tick animates, "Recorded · Undo", row folds into done only on leaving).

## Open — needs the owner

1. **The seven simplifications** (see `simplify-proposals.html`): moves within the batch with Yes/No; count = Not sure why / Count was wrong; first-in-wins sync; cut nurse-sow-outside-task; cut after-End evidence; cut fine-grained corrections; keep bulk. The owner wanted to judge them by using the simplified prototype — the prototype already implements 1, 2, 3, 5 and keeps bulk; confirm each before carrying into the full task.
2. **Prototype rules the builder interpreted** (confirm or change): ID window day 3–7; Tag chip filters only (no bulk tagging); Move asks "Have tags?"; "Done picking" may close with no breeders; a pen with nothing due yet counts as done; losses come off untreated piglets first; a higher count just corrects; pen-sheet records past the window are marked late automatically; bulk pre-ticks only pens fully inside the window.
3. **Candidate approvals at close**: task skeleton parts (ADR 0003, incl. Chips) and candidates 2 (ADR 0002) with their candidate tokens; four candidates-2 nods (keyboard two-step hold, one 35% sweep, Row code 600, 64px optional radio row).

## Next steps (suggested)

1. Get the owner's verdict on the simplified prototype + the seven proposals.
2. Decide the build path: **carry the simplified flows into the full task** (shrink `ledger.js` to the simplified rules, delete cut mechanisms and their states) **or promote `simple/` to be the task** and port the still-needed full-task pieces (End handoff, Edit, log). Either way: one look (skeleton), one string registry, strict lint, click-throughs.
3. Walk-through rounds on the result until two consecutive clean rounds (Sonnet walkers; first walk also asks "had to read past / too complex?").
4. Close: score vs `research/eval-set.md` (driver only — never shown to builders, lenses or walkers), `contract.html` + scenario→state matrix + ADRs + zh strings, review page for the owner (decisions, provisionals, candidates, strings), one PR map → main, retro issue labelled `workflow-retro` in the plugin repo (entries by cost; 29–34 lead).

## Housekeeping

- ~98 working branches on origin (`slice/*`, `fix/*`, `rebuild/*`, `proto/*`) are all merged into the map; safe to delete after close.
- Agent worktrees under `C:/Users/ying_/Documents/Codex/2026-09-08/clo/Sentri-UI/.claude/worktrees/` can be cleaned up.
- The full task still has known open round-3 items (scenarios.md R3-6, 8–11, 13–14, 19 and the held ledger items) — they may disappear with the simplification; don't fix them before the owner decides.
