# Handoff: Farrowing counting redesign (PR 1 of 4)

Reference material only. **Delete `ux/proto/` (this file, the prototype and `ux/proto/notes/`) in the last commit before opening the PR.** Nothing under `ux/proto/` may land on main.

## What the owner approved (2026-10-23)

The design is `ux/proto/farrowing-drawer-v17.html`. Open it at 390 px and click through: the owner said "ok lets push this and make the changes to farrowing". The background is in `ux/proto/notes/` (the brief and the Codex rounds). Where those notes disagree with v17, v17 wins.

Rulings for the event model (record them in `features/farrowing/PRD.md` under Decisions, dated 2026-10-23):
- A visit is a **draft until Save**. Nothing auto-saves any more. Born alive `+`/`−` changes only the draft.
- **Alive** is the big figure: alive now, with the draft applied. Total born and dead are stats, read in Litter details.
- There are two kinds of piglet death. **Born dead** (stillborn, mummified; indices 0–1) never lowers Alive. **Died after birth** (crushed, scours, starve-out, other; indices 2–5) lowers Alive on Save. Total born stays `alive + Σdead`. The stored data is unchanged; only what the actions mean changes.
- Report death is a **level inside the drawer**, not a new page. Its footer is Back · Done. Back drops this level's unapplied changes; Done applies them to the visit draft.
- Clear sits in the header's top-right corner, only while something is entered.
- Footer: with a draft, `Back · Save`. With no draft, `Back · Finish farrowing · ···`, where ··· is the sow's Actions (`sowActions`).
- Edit record (the corrections back door) moves into **Litter details**, opened by tapping the Alive card.

## PR 1 scope: Counting

Everything below lives in `ux/system/farrowing-astra-concept.js`, plus styles in `ux/design-system/components/bundle.css`. The gate fails any new visual CSS outside `ux/design-system`; farrowing-specific selectors are allowed in bundle.css.

1. **Model**
   - Seed: add `bornDraft:0, group:null, deathFrom:null`.
   - The count preset: set `pending:0`.
   - Add a preset `visit`: the count view with `bornDraft:3` and `deathDraft[2]=1`, so the atlas has a drafted count.
   - The `draft` preset becomes the death level with `group:'died'`.
2. **Helpers**
   - `draftBornDead=s=>s.deathDraft[0]+s.deathDraft[1]`
   - `draftDied=s=>sum(s.deathDraft.slice(2))`
   - `aliveNow=s=>s.alive+(s.bornDraft||0)-(s.locked?0:draftDied(s))`
   - `hasDraft` also counts `bornDraft`.
   - `persistDraft` and `restoreDraft` keep `bornDraft`.
3. **`act()`**
   - `bornAlive`: `bornDraft=max(0, bornDraft+n)`.
   - `death` (unlocked and not ended): snapshot `deathFrom=[...deathDraft]`; default `group` to `'bornDead'` if only born-dead entries exist, otherwise `'died'`.
   - `deathGroup`: `'bornDead'`, `'died'` or `'sow'`. `'sow'` sets `mode='sow'`; the other two set `mode='piglets'` and the group.
   - `deadStep`: cap died-after-birth at `alive+bornDraft`.
   - `back` from the death level: restore `deathFrom`.
   - `doneDeath`: clear `deathFrom`, go to count.
   - `saveVisit`:
     - `alive += bornDraft − died`
     - `dead += deathDraft`
     - one event, like `+3 born alive · 1 crushed`
     - reset the drafts and `anchor=born(s)`
     - set `s.saved=true`, so the card shows ✓ Saved
   - `clearVisit`: empty the drafts and photos.
   - `litter`: `s.litterBack=s.view; view='litter'`. Use its own back field, not `pageBack`: `history` overwrites `pageBack`, and Back from the litter page would loop.
   - Remove the old `alive` auto-save handler.
4. **`count(s)`**: the body is the Alive card, then a `farmStepper({variant:'count',label:'Born alive',value:bornDraft,min:0,action:'bornAlive'})`, then a Report death tool button with a badge for the draft's deaths.
   - The Alive card:
     - label `Alive` (plus amber `· Not saved yet` while a draft exists), `Details ›` top right
     - the figure is 64 px mono 600
     - at the right, a column of v17 chips: `+N born` (add: `#e3ecdb`/`#2f5a2c`, icon `farrow`), `−N died` (sub: `#f6e1dc`/`#8a2a1c`, icon `trend-down`), `N born dead` (quiet: `#eceee7`/`#4b5547`, icon `minus`)
     - chips are 134×24, radius 999, 13 px label, 14 px mono figure
     - with no draft, the chips are replaced by a quiet `✓ Saved` or nothing
   - The card and the drawer keep one height in every state: the drawer must not jump.
   - The footer as in the rulings. Save is `SentriUI.button({register:'primary'})`; ··· is `SentriUI.iconButton({icon:icon('more'),action:'sowActions'})`.
   - Corner: `cornerClear('clearVisit')` while a draft exists.
   - Drop `recordActions` and the receipt from count. Locked keeps `recordActions`.
5. **`death(s)`**, unlocked and not ended:
   - `SentriTask.choice` tiles: Born dead / Died after birth / The sow. The sow tile only while not ended.
   - Below the tiles, the chosen group's cause steppers, then photos.
   - The sow tile keeps today's cause radios, banner and hold.
   - Footer: Back · Done (`doneDeath`), plus Clear in the corner.
   - Title: `Report death`.
   - The locked and ended death views keep their current body (the post-finish death and the sow-died flows must still work).
6. **Litter details** (new view `litter`, `detailSheet`, atlas id `farrowing.litter`):
   - one rowGroup ledger: Born alive, then the six causes (`–` for 0), then the totals (Total born, Dead, Alive)
   - then the rows `Edit record ›` (`edit`) and `Farrowing log ›` (`history`)
   - Register the view everywhere: the render dispatch near `deathBreakdown(s)`, `farrowingBackground`, `atlasScreen`'s `more` map, the `back` handler, and `features/farrowing/feature.json` (a screen entry like `farrowing.death-breakdown`, its group, and the transition `farrowing.count → farrowing.litter "tap the Alive card"`).
   - Also add a screen for the drafted count (`farrowing.count-draft`), or map `visit` to one.

PRs 2–4, after this one merges, each its own PR: 2 Before farrowing (due card, the track, the last-litter bar, Start farrowing); 3 the full Litter details ledger with spreadsheet Edit logged as an override, plus Missing; 4 production-only Actions plus Assisted farrowing. v17 shows all of them. Don't start them unless the owner asks.

## Verify, then merge

- Use `SENTRI_PLAYWRIGHT` if Playwright isn't installed beside the repo. Never link `node_modules` into a worktree.
- Shoot the changed screens at 390 and 360:

  ```
  node scripts/shoot-screens.mjs <out> --screens farrowing.count,farrowing.death,farrowing.litter --widths 390,360
  ```

  - No visible defect, no scrollbar in the phone, text ≥ 13 px, footer buttons 56 px.
  - Compare against v17.
- Run the farrowing leaves:

  ```
  node scripts/run-scenarios.mjs farrowing --lang en
  ```

  - About 100 of the 130 leaves touch count, death or edit. Rewrite each broken leaf in `features/farrowing/scenarios.json` and `scenario-tree.md` to the new semantics; don't weaken them.
  - Then `git restore review/scenarios-farrowing.json`.
- Run `npm run atlas` whenever `scenarios.json` or `feature.json` changes, and commit the result.
- Append an entry to `features/farrowing/critique.md`.
- The shared-change rule: a bundle.css change gets a quick check of other reached screens.
- Delete `ux/proto/`. Commit with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- `node scripts/merge-main.mjs`, then `git push origin <branch>` (this exact form), then open the PR. The body ends with `🤖 Generated with [Claude Code](https://claude.com/claude-code)` and has a Results block.
- `node scripts/gate.mjs --candidate origin/<branch>`. On GATE PASS, merge as its own command: `gh pr merge <n> --squash --match-head-commit <full sha>`. Never push to main.
- English only (no Chinese work until a feature freezes). Don't touch Inspection files.
