# Farrowing page review · 1 · Find a sow (2026-10-22)

Branch `farrowing-find-drawer-over-search` (worktree happy-saha-abd10a), off origin/main e74efe4.

## Where it stands against the owner's spec (2026-10-12 + Lookup rulings)
Already met on main: full-height page, field focused at top with search icon / clear ✕ / scan icon / Cancel;
global; nothing listed before typing (hint only); one card per unit under a plain "Unit 7" heading, this unit
first, no counts, no "Other units"; rows = tag (typed part bold) + pen + chevron, no state/counts/who-when;
pen codes match; "No sow matching “9999” in any unit."; a result opens her farrowing drawer (other unit too,
subtitle names unit and pen); Back keeps the typed text; Cancel returns to the room. Keyboard: documented
natively (Lookup README); web field is plain text.

## The one defect found in the walk
Her drawer rose over the **room** (blurred unit card + tabs) though Back returns to **Find a sow**. Same on
Scan ear tags. Fix: `pageUnder` in farrowing-astra-concept.js draws the page she was opened from under
her drawer. Two leaves strengthened (fa-s6…, fa-s21…): pass on branch, fail on main's JS.

## Two checks
House pattern: Scan's Actions drawer over Scan ear tags (`roomScanActions` → page under = Scan). Computed:
scrim rgba(55,64,44,.14) + backdrop blur 1.4px on both; drawer white (content drawer) vs Actions tint (menu).

Attention budget (Find a sow, unchanged page): questions — 1 which sow is this tag? 2 where is she? 3 open her;
then in her drawer: 4 where does Back take me? Levels — act now: the field; live: the typed part of the tag
(bold); settled: unit headings, pen, rest of tag (ink-2 500); quiet: hint / no-match line. Cut (kept cut):
state, parity, counts, who/when, "N found", unit in header, recent searches. Cut by this change: the room's
unit card, tabs and rows behind her drawer (they claimed Back goes to the room).

Board: scratchpad find-a-sow-board.png (sent to the user).

## Page 1 merged: PR 272 (50ab217), 2026-10-22.

# Page 2 · Scan ear tags (branch farrowing-scan-review, off 50ab217)
All seven atlas states meet the rulings (2026-10-12, 2026-10-20); leaves fa-s10..s26 pass.
Walk defect: Find a sow (43) → scan icon → Scan → Back landed on the room and lost "43".
Fix: Scan remembers it was opened from Find a sow (c.scanFrom) and Back returns there, text kept,
field focused. Dock Scan → Back still the room. House pattern: Home's Find a pig → Scan → Back
(push/pop stack) returns to Find with "43". New leaf fa-s27 (tree S-27).
Noted, not changed: a ticked row's fill (allowed by SURFACES: "at most well fill", shared Row).

## Page 2 merged: PR 277 (1a39fbd), 2026-10-22.

# Page 3 · Room list (branch farrowing-room-review, off 7a9ae71 — after the shared TaskDock, PR 279)
Walked room ↔ Find/Scan/Pen map/filter; information and order unchanged (budget.md hub rows; rows are the
approved Row · animal). Defect: the pen card. Computed on main: box-shadow 0 2px 8px rgba(32,41,31,.04)
(law: no card is shadowed), header bg #f6f7f1 = the page (the card's top edge reads as a stray rule), header
radius 12 inside an 18 card. House pattern Inspection's walk pen card (computed): no shadow, head #f8faf5,
rule #e8eddf, clipped. Fix: farrowing-subpages-refinement.css (card + header) and two .pen-card shadow rules
in bundle.css (only Farrowing renders .pen-card). Dock untouched (now SentriUI.taskDock).
Follow-up idea (not done): both pen cards onto the candidate TaskGroup part, which names this card.

## Page 3 merged: PR 288 (a842519), 2026-10-22.

# Page 4 · Sow drawer (branch farrowing-drawer-review, off e7fdf44 incl. PR 287)
Before first count / Counting / Finish: at standard, no change (+ never moves on the first tap; the Born 0 / Dead 0
summary holds the drawer's height; − drains pending then clamps; six causes wrap in pairs). Header line stays
chip · pen · parity (Headers law 2026-10-13 supersedes RULINGS' "gestation day on the sheet header").
Fixes: (1) Death breakdown drawer capped 'compact' (42%) cut "Total dead" under the footer → content-sized.
(2) Sow died / Aborted used summary() (causes inline) while Finished (PR 287) uses Facts figures + Death causes
door → one builder finishedFigures(s, extra); summary() removed; figures' 20px trailing margin dropped when
last (bundle.css). Finished record byte-identical. Drawer opening / what it shows first: unchanged.
