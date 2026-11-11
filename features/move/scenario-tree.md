# Move 转舍 — scenario tree for owner review

**Status:** draft specification, not a walked or approved behaviour contract. All five screens in [feature.json](feature.json) are `in-design`. `S` cites a source that describes a branch; it does not promote that source to an owner ruling. `I` states the reason for an inferred branch. A result beginning `? Qn` has **no expected result** until the owner decides; see [decisions.md](decisions.md). This tree deliberately includes branches the static workflow slides cannot execute today.

**Sources and precedence:** current owner laws in [design workflow](../../docs/design-workflow/README.md) and [design system](../../ux/design-system/README.md); then the draft [PRD](PRD.md) and [five screen records](feature.json); then [ops synthesis](../../ux/research/ops/SYNTHESIS.md), [place and identity research](../../ux/research/ops/place-identity.md), [transfer deck](../../ux/system/workflows/place.html), and [handover](../../references/handover/flows/pig-transfer.md). No move-area `RULINGS.md` was found. The production Figma flows in place-identity are baseline evidence, not current approval.

**State axes.** Subject: T1 one identified pig, T2 several identified pigs, U1 one-batch unidentified head, U2 multi-batch unidentified head, M tagged plus head, S sow, X deceased or otherwise ineligible pig. Location: L0 origin known, L1 same pen, L2 another pen in unit, L3 another unit, L4 missing or ambiguous destination, L5 capacity unknown/full. Group record: G0 none, G1 open records and some head leave, G2 all head leave. Draft: D0 no draft, D1 selection, D2 picker, D3 review ready, D4 submitting, D5 accepted, D6 saved locally, D7 rejected/unknown. Network: N0 online, N1 offline, N2 restored. Task: K0 on-demand, K1 planned task, K2 Console order. Entry: pen/walk selection, Inspection Actions, pig/sow record, Workbench task. A branch stops at the 95% cut where operations.md sends it elsewhere.

## A · Entry, subject and selection

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| A-1 | T1 L0 D0, pig record | Open Transfer | → Transfer review names that pig and origin; no record is written yet | S — PRD Scope; move.transfer-sow purpose | pending |
| A-2 | T2 L0 D1, pen or walk selection | Open Transfer | → Review names the selected count and offers a destination | S — move.tagged; place.html slide 1 | pending |
| A-3 | U1 L0 D1, group row | Select n of N head and open Transfer | → Review keeps the chosen n and source batch; no invented identities | S — place-identity §2.1; PRD Rules | pending |
| A-4 | U2 L0 D1, multi-batch group | Select n of N head and open Transfer | → Review asks which source batches supply n | S — synthesis §4; move.mixed | pending |
| A-5 | M L0 D1, tagged and head | Open Transfer | → One review distinguishes tagged subjects from head counted by batch | S — PRD Rules; move.mixed | pending |
| A-6 | T1/T2/M D1, Inspection Actions | Open Transfer and return without saving | → Host selection is still available; no placement is written | S — Lookup card owner 2026-10-20; I — reversible navigation | pending |
| A-7 | X D0, deceased sow record | Open Actions | → Transfer is unavailable for a deceased sow | S — move.transfer-sow rules | pending |
| A-8 | T1/T2/U1/U2/M D1 | Untick the last selected subject | → Selection mode ends; no empty transfer review appears | S — design-system Sheet law, empty selection | pending |
| A-9 | T1/T2/U1/U2/M from more than one source pen | Open one Transfer | ? Q8 — whether a single move may span sources and how group records and batch counts are scoped | I — bulk selection can cross pens; PRD only shows one source | blocker |

## B · Destination choice

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| B-1 | D2 L0, current unit | Open picker | → Current unit appears first and origin is identifiable | S — move.picker; place.html slide 2 | pending |
| B-2 | D2 L1, source pen | Tap origin pen | → Origin is unavailable, so no no-op move is chosen | S — move.picker states | pending |
| B-3 | D2 L2, another current-unit pen | Tap destination | → Picker closes with that pen filled in the review; the transfer is not yet submitted | S — move.picker rule; place.html slide 2 explanation | pending |
| B-4 | D2 L3, other unit with duplicate pen code | Search and tap destination | → Complete unit and pen path identifies the chosen destination in review | S — move.picker; place-identity §2.1 | pending |
| B-5 | D2 L3 | Scan a unique registered pen plate | → The matched pen and complete path can be checked before transfer commit | S — PRD Rules; place.html slide 2 | pending |
| B-6 | D2 L4 | Search or scan has no exact registered match | → No destination is silently chosen; draft remains | I — wrong location is high stakes; no source defines unmatched scan UI | pending |
| B-7 | D2 L4, duplicate or ambiguous plate | Scan plate | → No ambiguous destination is committed; worker must resolve the pen | I — duplicate code could map across units; source requires full path | pending |
| B-8 | D2 L2/L3, empty pen | View picker | → Empty pen is visibly labelled and may be chosen if other rules permit | S — move.picker states | pending |
| B-9 | D3 L5, destination full or capacity unknown | Try to continue | ? Q1 — allow, warn or block ordinary transfer; capacity evidence conflicts | S — handover Open question 1 | blocker |
| B-10 | S D2, sow record uses unit then pen fields | Choose destination | → Same source and destination identity is rejected; picker presentation is a design decision for the canvas | S — move.transfer-sow rule and issue | pending |

## C · Review, group records and batches

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| C-1 | T1/T2 D3, all identified | Review before commit | → Destination and selected subjects are visible; individual health records travel with pigs without a verdict step | S — PRD Rules; place.html slide 1 | pending |
| C-2 | U1/M D3 G0 | Review before commit | → No group-record verdict block appears | S — place-identity §2.1; move.mixed conditional | pending |
| C-3 | U1/M D3 G1 | Review open source-pen records | → Each open group record has a visible Stays, Goes or Both verdict; default is Stays | S — PRD Rules; move.mixed | pending |
| C-4 | U1/M D3 G1 | Change one verdict to Goes | → Review distinguishes moving that group record from leaving others on the source | S — move.mixed states | pending |
| C-5 | U1/M D3 G1 | Change one verdict to Both | ? Q9 — exact record identity, count and history semantics of Both need a product rule | S — place-identity describes copy; move.mixed labels Both | blocker |
| C-6 | U1/M D3 G2, all unidentified head leave | Review group records | → Checklist folds to a summary and source records are not silently stranded | S — PRD Rules; move.mixed | pending |
| C-7 | U1 D3, one source batch | Review head allocation | → Known batch carries the moved count without an extra allocation step | S — synthesis §4; PRD Rules | pending |
| C-8 | U2/M D3, several source batches | Enter counts whose sum equals moved head | → Commit becomes available with each batch allocation visible | S — move.mixed; synthesis §4 | pending |
| C-9 | U2/M D3, several source batches | Enter counts whose sum differs from moved head | → Commit stays unavailable and no count is changed | S — PRD Rules; move.mixed | pending |
| C-10 | U2/M D3, source batch has fewer head than requested | Increase that batch above available count | → The allocation cannot exceed its source count | I — count conservation; source does not show error treatment | pending |
| C-11 | T1/T2/U1/U2/M D3 | Tap primary without a destination | → Required destination is marked; no record is written | S — design-system Sheet law; PRD required picker | pending |
| C-12 | M D3, tagged and head together | Commit once | ? Q5 — whether placement, head counts, record verdicts and batch changes are accepted atomically, or how a partial result is handled | S — PRD says one commit; handover notes partial failure undefined | blocker |

## D · Result, history and feedback

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| D-1 | T1 D4 N0 | Farm confirms move | → Current pen and location history reflect the accepted movement once | S — handover Rules 2; move.transfer-sow log | pending |
| D-2 | T2 D4 N0 | Farm confirms move | → Each identified pig moves once; source and destination counts derive from placement | S — PRD Rules; move.after | pending |
| D-3 | U1/U2 D4 N0 | Farm confirms move | → Origin count falls and destination count rises by the same n under the selected batches | S — PRD Rules; move.after | pending |
| D-4 | M D4 N0 G1 | Farm confirms mixed move | ? Q9 — the resulting group-record identity, count and history cannot be asserted until Both and Goes are specified | S — PRD Rules; move.after show one example only | blocker |
| D-5 | T1 D5, changed row visible on return | Return to origin or pig record | → The changed location itself confirms the result; no redundant toast | S — owner feedback law, 2026-10-18 | pending |
| D-6 | T2/M D5, several pigs | Return after confirmation | → A count toast confirms the several-pig result even if rows are off screen | S — owner feedback law, 2026-10-18 (supersedes old no-toast deck) | pending |
| D-7 | T1 D5, result off screen or barely visible | Return after confirmation | → A toast identifies the pig and accepted move | S — owner feedback law, 2026-10-18 | pending |
| D-8 | Any D5 | Later read pig and pen history | → Movement is traceable; a locally saved move is not represented as farm-confirmed | S — handover Rules 2; Data sync PRD | pending |

## E · Draft, interruption and online state

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| E-1 | D2/D3, unsaved | Tap Back midway | → No move commits; the reversible draft remains available on return | S — design-system drawer Back law | pending |
| E-2 | D3, unsaved | Close and reopen app | → Reopening does not claim a move happened; a new attempt reads current location and may rebuild the draft | I — process death must not turn an uncommitted draft into a saved move | pending |
| E-3 | D3 N1, offline | Commit | → Save status distinguishes this phone from farm acceptance; no synced claim | S — handover offline store; owner feedback law | pending |
| E-4 | D6 N1 | Reopen app offline | → Pending move and its subject/destination remain visible; server location is not claimed to have changed | I — queue must be recoverable; Data sync PRD | pending |
| E-5 | D6 N2 | Network returns and upload is accepted | → The accepted result is read back once; pending indicator clears without another success popup | S — Data sync PRD; owner feedback law | pending |
| E-6 | D4 N0/N1 | Double tap primary | → One operation is queued or accepted; no second count or history entry | I — gloved double tap and asynchronous commit | pending |
| E-7 | D4 N0 | App closes before response, then reopens | ? Q6 — operation identity and result lookup needed before retry or claiming success | I — unknown server result can double-write; handover conflict gap | blocker |
| E-8 | D6 N2, worker B moved same pig first | Upload A's earlier offline move | ? Q6 — conflict policy and recovery when another worker's placement wins | S — handover Edge cases says policy unwritten | blocker |
| E-9 | D6 N2, destination changed by another worker | Upload head-count move | ? Q6 — version or stock check needed to prevent negative or duplicated counts | I — shared pen counts can change while offline | blocker |
| E-10 | M D4/D6 | One part fails or the response is partial | ? Q5 — mixed transfer result and recovery must not masquerade as complete | S — handover Edge cases says partial failure undescribed | blocker |
| E-11 | D7, explicit farm rejection | Worker returns to transfer | → Rejected action stays reviewable with its reason; no accepted placement or count is shown | S — owner feedback law; Data sync PRD | pending |
| E-12 | D5, accepted move | Worker immediately starts another move for same pig | → New review uses the accepted current location, not the old origin | I — prevents a second move using stale facts | pending |

## F · Product boundaries and high-stakes questions

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| F-1 | S lactating, source pen contains piglets | Move sow out | ? Q4 — transfer alone may or may not change lactation status and litter relation | S — handover Open question 4 | blocker |
| F-2 | K1, production line trigger matches batch | System creates transfer task | ? Q2 — trigger, payload, destination, owner and lifecycle are unspecified | S — handover Open questions 2 and 5 | blocker |
| F-3 | K1, Workbench task opened | Worker executes a planned transfer | ? Q2 — whether the on-demand sheet is reused and how task progress is counted | S — handover group task is implied only | blocker |
| F-4 | K2, Console order with source, target and head count | Open on mobile | ? Q3 — order identity and handoff into per-pig or counted mobile execution are undefined | S — handover Open question 3 | blocker |
| F-5 | D5, accepted move went to wrong pen | Try to correct | ? Q7 — correction, reversal, permissions and history rule are undefined | I — wrong destination is a plausible high-stakes error | blocker |
| F-6 | Any subject, worker lacks move permission | Open or commit Transfer | ? Q10 — who may move pigs, and whether task assignment grants permission | I — production write needs authorization; no source states rule | blocker |

## G · Handoffs and 95% line

| # | State | Event | Result | Src | Leaf |
|---|---|---|---|---|---|
| G-1 | D6/D7, local pending or rejected record | Open Data sync | → handoff:data-sync; worker sees upload state and rejection without an invented farm location | S — owner feedback law; Data sync PRD | pending |
| G-2 | K1, assigned transfer task | Open Workbench entry | → handoff:workbench for task discovery; execution remains blocked by Q2 | S — handover; Workbench feature | pending |
| G-3 | Piglets in a farrowing litter | Choose a litter or crate move | → handoff:piglet-processing; its litter ledger owns that move | S — farrowing and piglet-processing PRDs | pending |
| G-4 | Console order setup or transfer-plan configuration | Request it in this mobile feature | → Not supported here; Q2/Q3 name the separate product contracts | S — operations.md cut; handover | pending |
| G-5 | Pig leaving the farm or feed stock move | Request it through Transfer | → Not supported here; exit and inventory have separate semantics | S — handover Rules 10; operations.md cut | pending |

## Walk personas and status

- First-time pen worker: one tagged pig, same-unit picker and Back (A/B/E).
- Routine stockperson: several tagged pigs, cross-unit search and visible feedback (A/B/D).
- Group worker: partial unidentified head, open records, one and multiple batches (A/C/D).
- Supervisor: accepted history, wrong destination, capacity and permissions (D/F).
- Planned-task worker: Workbench handoff and an incomplete Console order (F/G).
- Breaker: ambiguous scan, 0/all counts, double tap, offline/reopen, second device, long Chinese labels at 360 (B/C/E).

**Ledger:** `node scripts/scenario-ledger.mjs move init` creates one Pending row per table branch. These rows have not been walked. The current transfer deck is a static illustration, so a passing browser walk would require an interactive canvas/prototype and owner agreement first. Question rows stay blocked in intent; the initial ledger truthfully records Pending until a pinned walk round can mark them.
