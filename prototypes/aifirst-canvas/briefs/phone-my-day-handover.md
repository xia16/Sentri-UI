# Handover: phone My day, the agent in the dock, and the agent's notes inside tasks

Written 9 Nov 2026 for a new session. The phone work moves out of the AI-first canvas session (Work schedule and Users boards). That session keeps the console side: the Work schedule tab, its job details, Users, Roles and Time away.

## Where things are

> **Moved 9 Nov (later):** the phone boards now live on their own canvas, "Sentri phone: My day and the agent", https://claude.ai/artifact/UNXAnopBzeWSC5jTNFTm28 (StopsHeadsUp at the top with round 3 above round 2, MyDayPhone below). Their sources are in `prototypes/aifirst-canvas/phone/project/`; generators stay in `aifirst/ovh/` (`gen-stops-r3.cjs` for round 3) and now write into that folder. The console canvas keeps only a note pointing there. The positions below describe the old canvas.

- **Canvas:** https://claude.ai/code/artifact/15394c53-c767-4178-a99f-287167e3eb10 (the "Sentri AI-first console" Design artifact). Page **Work schedule** (id `workday`).
- **Phone boards on that page:**
  - `StopsHeadsUp.dc.html` (top of the page, y −6440). Round 2, the current one. Frames:
    1. A simple day.
    2. An interrupted day.
    3. The agent's morning brief.
    4. The heads-up toast.
    5. The note opened.
    6. The walk's note.
    7. A console frame. It is a copy for reference; you may drop it.
  - `MyDayPhone.dc.html` (y −2900). Round 1. Frames:
    1. Home with a Your day card, the agent in the dock middle, and scan floating.
    2. The agent's thread.
    3. My day as a quest line.
    4. A step opens its task.
- **Branch and worktree:** `aifirst-canvas`, at `C:/Users/ying_/Documents/Codex/2026-09-08/clo/Sentri-UI/.claude/worktrees/aifirst-canvas/prototypes/aifirst-canvas`.
  - Board HTML is in `aifirst/project/`.
  - Generators are in `aifirst/ovh/`: `gen-myday.cjs` (round 1) and `gen-stops.cjs` (round 2, which includes the gen-myday helpers). `stops-console.frag.html` is the console frame that gen-stops reads.
  - Work on your own branch, or this one if the owner says so. Never push to `main`.
- **Live phone screens** come from the main checkout, which is on `main`; check it is up to date first:
  `node scripts/shoot-screens.mjs <dir>/home --screens workbench.today,treat.record,farrowing.room,inspection.walk --widths 390 --langs en`.
  - The generators read `home/<screen>/en-390.png` next to themselves and write `pub/project/<Board>.dc.html`.
  - To regenerate, copy `gen-stops.cjs` and `stops-console.frag.html` into a scratch folder, shoot `home/` there, and `mkdir -p pub/project`. Run with `NODE_PATH=<main checkout>/node_modules` (sharp).
- **Render a board:** copy the HTML into the worktree's `aifirst/project/`, then from `render/`:
  `VW=3008 VH=600 FULL=1 NODE_PATH=<main>/node_modules node shoot.cjs "StopsHeadsUp:wait=2000"`.
- **Publish:** other sessions publish to this canvas at the same time, so merge, never overwrite:
  1. Read `project/canvas.json` from the artifact (Artifact `read` with `path`).
  2. Change only your board's entry, `order` and your note.
  3. Publish with `root` = your folder holding `project/`, `file_path` = `project/canvas.json`, and `files` = your board.
  4. If the publish is refused for a newer version, re-read and merge again.

## What the owner has ruled (9 Nov)

1. **Home stays the to-do list.** A "Your day" card on top opens My day.
2. **The dock's middle button is the agent** (it was search+scan). The header's Assistant button goes. Scan becomes a floating round button, bottom right: it hides while scrolling, comes back when still, and opens Find with the scanner on.
3. **The agent sends the day every morning.**
4. **My day is the plan, not a tracker.** No ticks, no "Now", no progress; completion is tracked on the console's week Schedule.
5. **A card is a stop (one trip):**
   - **A place:** several tasks in one room, as rows in order.
   - **A round:** one task across several rooms, as one card with its rooms on one scrolling line in walking order.
   - **A return:** "Back to Farrowing 3", its own card.

   "As you go" work is one sentence under a row, not a row of its own. Each row opens that task's own page; the plan never redraws a task.
6. **What the agent wants to say lives inside the task, as prose.** No new controls in the coded task pages, and no tags in lists. Pigs and pens are named in the sentences.
7. **The agent writes formatted pages, not chat lines.** The morning brief is a laid-out page: a heading line, the stops as a route with times, where to start and why, and what's worth knowing.
8. **The heads-up is never a forced pop-up.** It arrives like a notification you can open or close. Today that is a toast above the task footer; a header button with the agent's sparkle keeps it afterwards.

## What to do next (the owner's latest notes, not yet drawn)

1. **The toast must not be white.** Give it its own look, so it reads as the agent and not as page content. Show two or three versions on the canvas. Keep to the status colour convention: one hue per status, and don't reuse green, which is for the action button.
2. **Things to watch are not only about pigs.** Some are about the whole unit or the whole task, for example "You're 2 days late on fostering checks in Farrowing 3" or "The room ran hot overnight".
   - The note format must take whole-task and whole-unit lines as well as per-pen, per-pig ones, with no pen badge when there's no pen.
   - Today's format is one item per pen: a pen badge, the pig, a sentence.
3. **A marked spot inside the task UI for the AI part, like notes but scoped to the task.**
   - Users should see a section in the task page, marked as the agent's, that they tap to read its notes for this task.
   - It differs from pen and pig notes, which are attached to a pen or a pig and read like messages (pen notes round, PR 314).
   - Find the spot without disturbing the coded page. Candidates:
     - a row under the summary card ("✦ 2 notes for this task ›");
     - a section header in the list;
     - the header button made visible as a labelled chip.
   - Show versions; the owner picks.
   - The toast is how the notes arrive; this spot is where they live.
4. Three open questions from round 1, still unanswered:
   - The agent's name on the phone: "General Manager" (as on the console) or "Assistant" (today's phone word)?
   - Should a recorded task quietly tick itself in My day?
   - Does the morning brief buzz the phone?

## Rules to follow (from the owner's standing preferences)

- **Canvas first:** mock-ups on the canvas; nothing in prototypes, the atlas or a PR until the owner agrees. Don't ask "PR it?" mid-feature.
- **Walk the live flow first:** screenshot the real screens from up-to-date main and build on them. Never redraw a host page from scratch, and never use old renders.
- **Before every mock-up, write two checks:**
  - **House pattern:** a sibling screen with the same job.
  - **Attention budget:** what the user must see first, and what was removed to make room.
- **Phone design system:**
  - Plus Jakarta Sans; tint `#f6f7f1`; white cards with line `#dfe4d8`; ink `#20291f`; muted `#657060`; green `#276640`.
  - Every page and drawer is tint with white cards; nothing loose on the tint; no nested cards.
  - Footer buttons 56px; other targets at least 44pt.
  - Text the user acts on at least 13px; quiet text at least 11px.
  - One green button per screen.
- **Icons by intent:** one meaning per icon. The sparkle means the agent (Assistant/General Manager) everywhere.
- **Information budget:** say it once; short notes (only what changes what you do today in this task); never counts on plan cards.
- **Copy fits the component:** rewrite long copy, don't absorb it. Pens are lane labels (B2, C1), pig IDs are 6-digit tags.
- **Related phone feature:** `features/assistant/` (PRD and `feature.json`; a draft). It has Needs you and Conversations, opened from the Home header today; this work would move it to the dock as one thread. Home's live screens are `workbench.*`; search/scan is `find-pig.*` and `search.*`.
