# Data sync — consolidation map (working document)

Status: working document for the cleanup, 2026-10-20. It maps Zhaoxu's offline work onto the design agreed with the owner on 2026-10-18 to 2026-10-20, lists what is still missing or open, and names every place in the repo the cleanup touches. It is not a ruling: rules move into `PRD.md` only once the open items below are answered.

## Sources

| Source | What it holds | Fate |
|---|---|---|
| `codex/data-sync-split` (Zhaoxu, 16 Oct) | Newest rules 12–16 Oct, 3-state overview, 30-day uploaded entry, volume and operation-chain proposals | Docs carried into this branch unchanged (commit 1). Volume and chain screens stay on his branch. Close once this lands. |
| `codex/offline-flow-design` (Zhaoxu, 13 Oct) | Task-scoped awareness, evidence screenshots, review notes | Its docs already reached main; the rest is superseded. Close. |
| `codex/workbench-connected-home`, `codex/workbench-home-split` | Data sync + Home combined; Home task hierarchy | No longer on origin. Nothing to carry. |
| main, `8c87a9a` (Zhaoxu) | Home `globalSync` badge, Farrowing `taskSyncBadge` pills, Data sync prototype | Replaced by the agreed badge and screens (Impact map). |
| main, #218 (Medicines session) | Toast component, offline tone, "Feedback after saving" law | Kept; needs a standing form (Open 4). |
| Remap (owner, 18 Oct) | [Offline Sync Remap](https://claude.ai/artifact/Lzx3LLThXBL8sqFooEFtaY) | Agreed badge model. |
| Saved work screens (owner, 19–20 Oct) | [Saved Work Screens](https://claude.ai/artifact/RtKdYgaqa6NCQrLufsbSzW) | Locked layout. |
| Record details (owner, 20 Oct) | [Record Details](https://claude.ai/artifact/S811efhEntCamLLagqPo1A) | Inform-only model, two categories; copy open. |

Key: **Kept** = his rule stands as written. **Changed** = the job stays, the rule or screen changes. **Dropped** = no longer needed. **New** = ours, not in his version. **Open** = needs an owner call before it is written down.

## 1 · Rules (his PRD Rules and Decisions)

| His rule | Agreed design | Status |
|---|---|---|
| Offline save lands on the phone first; feedback says "saved on this phone", never "synced" | Same. The first offline save always shows the Toast's offline form, which shrinks into the badge; later offline saves show it only where a toast shows anyway | Kept (+ New: first-save rule, shrink) |
| Phone-save failure gives no success feedback | Same; the sheet stays open with the error (Feedback after saving law) | Kept |
| Upload starts by itself on a usable connection; temporary errors retry by themselves | Same. The badge follows records, not the connection: up on save, down on server confirmation; no connection timer, 3 s grace after an online save | Kept (+ New: records-driven badge) |
| Each record settles on its own; partial success is legal | Same | Kept |
| Stable operation ID; unknown receipt is queried, never re-sent with a new ID | Same; while checking it shows as uploading | Kept |
| Later records on the same object wait for earlier ones (`groupKey`, `dependsOn`) | Order only: once the earlier record settles (uploaded **or not accepted**), later ones upload as their own records. A later record that no longer makes sense is refused by the server with its own reason | Changed |
| Failed record: see reason, retry by hand | The phone retries while a retry can still work, then marks it **not accepted** with its reason. No retry button | Changed (owner 20 Oct) |
| Conflict: stops auto-sync; compare, retry by hand, or delete with double confirmation | The team record stands (it was never going to be overwritten); the worker's record is marked **not accepted · already recorded** and shown read-only. No compare, retry or delete. Same values on both sides count as uploaded and show nothing | Changed (owner 20 Oct) — **see Open 1** |
| Records after a deleted conflict stay blocked; delete one by one | Not needed: nothing is deleted, and later records upload on their own | Dropped |
| Only conflicts and their blocked follow-ons may be deleted; nothing else is cleared | Nothing in Saved work deletes or clears. Not-accepted records leave after 30 days | Changed |
| Switching account or farm is blocked while records wait | Same; a sheet "Upload first" with See saved work | Kept |
| Sign-in expired: pause, sign back in as the same account only | Same; the one remaining red "needs you" state | Kept |
| App header badge: Home and non-task pages count the whole phone; task pages count the task instance, labelled "Task N" / "All M" | Inside a task: icon + that task's record count. Home header: icon alone. Home task cards carry "↑ N". No word labels; no "All M" fallback (a task with nothing waiting shows no badge) | Changed (owner 18 Oct) |
| Badge states: waiting, uploading, exception each with its own graphic | Two forms: waiting (ink upload icon) and needs you (red "!"), red only for signed out and work stuck on the phone. Uploading lifts the arrow once per confirmed record; no spinner | Changed |
| Overview: conflict-or-error → syncing → waiting; category rows from 9 records across 2 categories | Saved work lists **tasks** (rows with counts, "Other records" last); a task page is one flat **log** of what is still on the phone, with Home's unit switch carrying the count ("All units 296", "Unit 7 64"). No category layer, no status sections | Changed (owner 19–20 Oct) |
| "Uploaded · last 30 days" as the overview's last row | Past uploads behind a clock icon at the top right of the page header, same log, same unit switch | Changed — needs a Headers law line (Impact) |
| Uploaded records kept 30 × 24 h from `syncedAt`; cleanup rules | Same, and not-accepted records follow the same 30-day rule | Kept (+ New) |
| Count includes records the signed-in identity can't upload; overview shows their owner and reason (13 Oct) | **Not designed yet** | Missing — see Gaps |
| Live Update system chip as an extra channel where Android allows | Not designed; stays an optional native channel | Kept as note |
| Operation-chain and many-tasks proposals (unreviewed) | Not adopted: tasks as rows + flat log + unit switch replace them | Dropped |

## 2 · Scenarios (his scenario tree)

| # | Scenario | Agreed design | Status |
|---|---|---|---|
| A-1 | Offline save succeeds | Toast offline form (first offline save always), badge +1 | Covered |
| A-2 | Phone save fails | Sheet stays open with error | Covered (law) |
| A-3 | Open saved records from Home | Home header icon → Saved work (task rows) | Covered |
| A-4, A-9, A-11 | Task badge opens this task's records; then the whole phone | Task badge → the task's log. The whole phone is Home's icon or Toolbox › Saved work, not a link inside the task | Changed |
| A-5 | Empty queue | "Everything has uploaded" | Covered |
| A-6 | Restart keeps records and counts | Engineering; no screen | Kept |
| A-7 | Badge on other pages | Home and non-task pages: icon alone; tasks: icon + count | Changed |
| A-8, A-10 | 30 mixed records; categories; no layout jump at 9→8 | No categories. Rows that upload while the log is open hold, then depart (motion law) | Changed — Gap: held-frame screen |
| A-12, A-13 | Task has none, other tasks have some: "All M" | No badge in that task; Home shows the rest | Changed |
| B-1, B-3 | Connection returns; record confirmed | Badge counts down, arrow lifts once per record; nothing pops up | Covered |
| B-2 | Unstable connection | Nothing changes on screen (records-driven) | Covered |
| B-4 | Partial success | Each record settles on its own; the log and counts follow | Covered |
| B-5 | Temporary failure | Retries by itself; never shown | Covered |
| B-6 | Double tap / manual retry | No manual upload or retry exists | Dropped |
| B-7 | Receipt unknown | Shows as uploading until the query answers | Covered |
| B-8 | Uploaded last 30 days | Past uploads (clock) | Changed |
| C-1, C-2 | Failed: reason, manual retry | Auto retry, then not accepted with reason | Changed |
| C-3, C-4, C-9 | Conflict: no auto retry, compare, manual retry | Not accepted · already recorded | Changed — Open 1 |
| C-5, C-6 | Delete conflict, cancel or confirm | No delete | Dropped |
| C-7, C-8 | Later record waits on an earlier one, then sends | Waits in the log as an ordinary record; uploads once the earlier one settles | Covered |
| C-10, C-11 | Blocked after a deleted conflict | No longer arises | Dropped |
| D-1 | Switch account or farm with records waiting | "Upload first" sheet | Covered (needs final screen) |
| D-2 | Everything uploaded: switching allowed | Same | Kept |
| D-3 | Sign-in expired | Saved work asks to sign in as the same person; badge red | Covered (needs final screen) |
| D-4 | Another phone changed the same object | Server decides: uploaded, or not accepted · already recorded | Covered — Open 1 |
| D-5 | Records a day or more old | Log groups by day; work waiting 24 h turns the badge red | Covered — Open 3 |

## 3 · Screens (his `feature.json`)

| His screen | Replaced by |
|---|---|
| `data-sync.banner`, `.global-upload`, `.global-error` | Home header icon (waiting / needs you) and Home task card mark |
| `data-sync.task-badge` | Task header icon + count |
| `data-sync.list`, `.grouped`, `.category`, `.task-list` | Saved work (task rows) and the task page (log + unit switch) |
| `data-sync.history` | Past uploads |
| `data-sync.detail`, `.failed`, `.conflict`, `.blocked`, `.dependent-delete`, `.receipt`, `.reconciled`, `.upload` | Not accepted (read-only log, two groups) |
| `data-sync.switch`, `.auth` | Upload first sheet; signed-out Saved work |
| `data-sync.volume-*` | Dropped |
| — | New: unit drawer, Saved work empty, offline toast shrink (held frame), standing Needs-you / Not-accepted bar |

## 4 · Gaps: in his version or our rules, not yet designed

1. **Records owned by another account or farm** (his 13 Oct ruling): they count on the badge but can't be uploaded by whoever is signed in. Saved work needs a place to say whose they are and why they're waiting.
2. **Ending a task with records still on the phone** (his handoff to Workbench and each task): what End says. Farrowing already has "End needs a connection" and "after end · synced from an offline phone"; the other tasks need the same rule.
3. **Final screens not built yet**: Upload first (switch block), signed out, work stuck 24 h, Not accepted.
4. **Held frames** (rules ledger L25): the toast shrinking into the badge; rows departing from the log as they upload.
5. **Chinese and 360px** for every new string and screen.
6. **Refusal reasons catalogue**: one plain line per server refusal, plus a fallback. Needs the backend's list.

## 5 · Open: owner calls before the PRD is rewritten

1. **Conflicts are a per-feature policy, not a sync rule.** Piglet processing already rules that two phones' records of one litter are **both kept, flagged, never merged** and resolved in Edit (the farm glossary, `ux/laws/glossary.md`: "Possible double treatment", "Two counts disagree", "Sync review"). "Team record kept, yours not accepted" contradicts that for piglets. Proposal: the owning feature decides what a collision means; Saved work only reports what the server actually refused. Piglet collisions then upload (kept and flagged in the feature) and never appear as not accepted.
2. **Vocabulary**: Saved (on the phone) → Uploaded (the farm has it) → **Not accepted** (the farm said no). Categories **Already recorded** and **Couldn't be accepted**. Entry: what the farm has first ("000412 · Not pregnant"), yours under it ("You recorded Pregnant").
3. **Work stuck on the phone**: threshold for turning the badge red (24 h or end of shift).
4. **Toast standing form**: the Needs-you / Not-accepted bar stays until looked at and opens a page. The Toast card forbids that today; it is the Medicines session's component.
5. **Offline toast copy**: main (#218) says "Saved on this phone · Uploads when connected · 000267"; the remap proposed "No connection · saved on this phone, uploads later". Proposal: keep #218's merged wording.
6. **Backend questions**: can a not-accepted record travel up as a note on the team record, and should a unit submit be accepted for the sows that are still there instead of refused whole?

## 6 · Impact map: where the cleanup lands

| Area | Files | Change |
|---|---|---|
| Data sync docs | `features/data-sync/PRD.md`, `flow.md`, `scenario-tree.md`, `operations.md`, `budget.md`, `GLOSSARY.md`, `critique.md` | Rewrite from sections 1–2 once section 5 is answered; scenario leaves follow the new outcomes |
| Data sync screens | `features/data-sync/feature.json`, `scenarios.json`, `ux/system/data-sync-astra-prototype.{html,js,css}` | Rebuild to the locked screens (section 3); retire the old ids |
| Home | `ux/system/home-astra-prototype.js` (`globalSync`), `ux/system/astra-home-task-card.js` | Header icon alone; red only for signed out / stuck; "↑ N" in the task card footer |
| Workbench rule | `features/workbench/PRD.md` (Offline line) | Restate the badge: icon on Home, counts on task cards, exceptions narrowed |
| Farrowing | `ux/system/farrowing-astra-concept.js` (`taskSyncBadge`, `placeTaskSyncBadge`), `farrowing-task-sync-study.css` | "Task 2" pill → icon + count; drop "All 3"; delete the pill CSS |
| Inspection | `ux/system/inspection-astra-concept.js` | Add the task header badge; its offline save toast already follows #218 |
| Other tasks | Piglet processing, Weaning, Pregnancy, Move, Treat prototypes | Same header badge where the task runs offline; End rule (Gap 2) |
| Piglet processing | `ux/laws/glossary.md` (its collision terms), `features/piglet-processing` | Unchanged if Open 1 is accepted; otherwise its collision rules conflict |
| Design system: Header | `ux/design-system/README.md` (Headers law), `components/Header` | One line: a page may carry one icon action at the top right |
| Design system: Toast | `components/Toast` (Medicines session) | Standing form; first-offline-save shrink into the badge with a held frame |
| Design system: Log | `components/Log` | Identifiers in entry titles set in mono |
| Design system: unit switch | Home's `scope-switch` → a shared part | Used by Home and Saved work; labels 12 → 13 px (legibility floor) |
| Design system: icon | `SentriIcons` | Upload and alert glyphs exist; nothing new |
| Strings | `ux/laws/strings.json`, `ux/laws/glossary.md` | New `sync.*` strings with Chinese; Saved / Uploaded / Not accepted defined once |
| Atlas and gate | `atlas/atlas.json`, rules ledger | New screens, held frames; rebuild atlas after the last scenario run |

## 7 · Branch closure

Close `codex/offline-flow-design` and `codex/data-sync-split` once this branch merges with their rulings carried (section 1). The volume and chain proposals are recorded here as dropped, so nothing on his branches is lost unread.
