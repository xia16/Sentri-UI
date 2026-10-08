# Walk-through brief — piglet processing (whole task)

You are a **barn worker** (or a supervisor, where your scenario says so) using Sentri's piglet processing (仔猪处理) on a phone, gloved, one hand, interrupted, reading for two seconds. You walk the **whole task in a real browser** — the design is HTML that works. You did not design it.

**Never open `ux/tasks/piglet-processing/research/eval-set.md`** (held out). Do not edit any repo file.

## Setup
- Repo: `C:/Users/ying_/Documents/Codex/2026-09-08/clo/Sentri-UI-pilot` at branch `map/3-piglet-processing` (read-only for you; run `git -C <repo> log --oneline -1` to note the head).
- Serve it on your own port: `node C:/Users/ying_/Documents/Codex/2026-09-08/clo/Sentri-UI-pilot/scripts/serve-ux.cjs <PORT>` from the repo root (run in the background), then drive `http://localhost:<PORT>/ux/tasks/piglet-processing/room.html` with **Playwright** (use the cached Playwright the lint uses: `require` it from `C:/Users/ying_/AppData/Local/design-lint` or run `npx playwright` there — or the lint script's own resolution) at 390×844 (and 360×740 once), en first, zh once. Save screenshots under your scratch folder. Start from the room list, not from a state URL — walk as a worker would: tap, read, tap. Use `?data=<variant>` only to set the day's starting situation (variants are listed at the top of `ux/tasks/piglet-processing/fixtures.js`).
- Read `ux/research/farrowing/RULINGS.md` (*Piglet processing* rounds 1–6) so you know what the owner ruled — but judge as a worker first.

## Notes
- The fixture farm is Unit 7 (other units reachable from the room). Treatments come from the farm configuration (no teeth clipping configured). Castration is due day 5.
- Playwright: cached at `C:/Users/ying_/.cache/adam-design/playwright-1.63.0` (or via the lint script's resolution).
- Rounds 1–2 findings are in `ux/tasks/piglet-processing/scenarios.md`; do not re-report something as new if it is listed there and still broken — say "R1-n / R2-n still broken".

- Round 2: the whole UI was rebuilt since round 1 to look exactly like the farrowing task (round 5). A litter now opens as a drawer over the room (`room.html?state=litter&crate=X`); `litter.html` forwards there. Also report anything that is unlike the farrowing task (`ux/system/farrowing-astra-concept.html`) or cluttered, as a worker would notice it.

## Report (your final message IS the report — the harness will not let you write report files; save screenshots and scripts in your scratch folder)
Every point where the design **does not let you do the right thing, shows a wrong or contradictory fact, dead-ends, loses work, or confuses you on tap**, each with: the step, the screen (URL/state + screenshot), what you tried, what happened, what you expected. Then **new scenarios** you discovered while walking (things the task must handle that your script didn't mention). For each item suggest a class: *already handled* (you found the way on a second look) · *change a slice* (name the page) · *new slice* · *new module*. Also list what worked well (briefly). Be concrete; no generic UX advice.
