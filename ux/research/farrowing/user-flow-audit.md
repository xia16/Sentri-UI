# Session screens — simulated-user attack audit

Four simulated users (night attendant · first-week new hire · morning/handover pair ·
edge-case operator) walked the During / Finish / After screens and the death drawer tap by
tap against session-interaction-spec.md. 39 raw findings, merged below. The pattern that
emerged everywhere: **the alive half survives every abuse — re-countable, self-healing,
correction-friendly — and every blocker lives on the dead path, exactly where the spec
admits the system can never self-correct.**

## Blockers

B1 · **The dead path loses data.** The drawer's tally-then-Record two-stage loses
uncommitted tallies when the hand bolts mid-visit (the pile is append-only and never
re-countable — those bodies vanish forever, silently). Post-Record overshoot has no
during-farrowing correction path (Adjust was removed; the drawer's − exists only within a
visit; committed-vs-blank reopen state is genuinely undecided in the spec). *Direction:
the drawer becomes state-showing like everything else — committed per-type totals with
live − capsules, commits per tap, no Record ceremony. One persistence model product-wide.*

B2 · **The Alive-minus trap swallows ordinary deaths, not just savaged ones.** − and + are
the biggest targets; Report death is small; a hurried hand records a death as − and Born
silently drops. The accepted-cost framing underestimated this. *Direction: a transient
inline hint on every − ("died? → record it as dead"), and the Born foot line visibly
ticking on every change.*

B3 · **Stillborn breaks the "Report death" frame.** The most natural gesture for a born-dead
piglet is +1 alive then report — silently inflating Born; the button label reads as
live-piglet incident; the drawn drawer is missing Stillborn/Mummified cells entirely
(mock drift from before the one-drawer ruling). *Direction: button says "Record dead";
drawer lists stillborn · mummified first; drawer copy carries "born dead or died — all
bodies here".*

B4 · **Save teaches the wrong persistence model.** An explicit Save implies unsaved state:
the new hire presses it after every piglet; the night attendant fears dismissing sheets
mid-burst. Everything already commits per tap. *Direction (owner ruling needed — Save was
an explicit owner ask): rename to Close/Done, and add a quiet live "saved · 23:41" stamp
near the trail so persistence teaches itself.*

B5 · **Premature Finish has no barn-reachable birth path.** She delivers three more after
Lock born 12; the record offers Adjust/Foster/Report death, none of which is "more were
born"; the sanctioned route (count-drawer up-doors) lives on another surface and is
referenced nowhere. *Direction: the Adjust warning becomes a choice — "More born ›" ·
"Count was wrong ›" — and the amendment editor always asks where the extra goes, so the
invariant never breaks silently.*

B6 · **Wrong-sow writes: alive self-heals, deaths are permanent.** Two pixel-identical
sheets, tiny ID difference, 3am. *Direction: louder sow identity on the sheet (large tag,
pen chip color), an idle-sheet freshness nudge, and a "wrong sow" void-last-visit
correction that keeps the ledger honest.*

## Confusing tier

C1 · The mocks contradict themselves (row 8 live · 3 dead vs sheet 9 · 5) — trust dies at
the handover exactly where it is needed; rows must read live-derived, mocks must agree.
C2 · The drawer opens with foreign context strings (Check-in backdrop, day 6 · 8 live)
mid-farrowing — per-surface context required.
C3 · Lock is specced hold-to-commit but drawn as a plain tap — draw the hold affordance.
C4 · "Trail · 2 ›" is unreadable as a number and hides the one surface that teaches
persistence and corrections — naming and count semantics need a pass.
C5 · Born reads as an editable headline — nothing marks it derived.
C6 · **Spec bug found: fostering breaks invariant 1.** Born = Alive + Dead fails after any
foster; must read Born = Alive + ΣDead + fostered-out − fostered-in, and the record needs
fostered lines on both donor ("fostered out 2 → 000xxx") and receiver, whose Born stays
her own birth fact.
C7 · A sow dying mid-farrowing has no route from this sheet, and "Report death" under her
ID reads as *her* death — rename toward piglet dead; give the sheet a route to the sow
verb that also parks the session for fostering.
C8 · Litter weight accepts 92 kg for 9 piglets silently, and neither optional fact prints
on the locked record — soft range warning + print both with ✎.
C9 · The sheet shows when but never who, and drops the row's recency signal exactly when
the user drills in — echo "last event Xm · G.H" in the sheet header.
C10 · Finish is reachable at the all-zero state — one stray sequence from locking Born 0.

## What held up (protect from regression)

Mis-tap → − → trail nets to nothing: works cleanly, no dialogs. Convergence after phone
sleep: genuinely strong. After-screen hierarchy (no alive stepper post-lock, Report death
primary): correct, and structurally closes the minus trap after Finish.
