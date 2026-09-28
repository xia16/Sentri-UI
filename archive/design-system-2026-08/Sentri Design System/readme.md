# Sentri Design System

Sentri is a mobile task-orchestration and farm-operations application for commercial pig farms. It connects production planning to the physical work done in barns, units, pens and on individual animals: what needs to happen, when, where, how much, what's done, what's coming, and what needs attention.

**Users:** frontline farm workers (short, repeated, one-handed interactions, often gloved), unit supervisors (workload distribution, progress, overdue, exceptions), farm managers (production flow, completion), vets/specialists (flagged animals, treatments).

**Environment:** active pig farms — dusty, wet, noisy, bright-outdoor to dark-indoor transitions, unreliable connectivity. Interactions must be fast, glanceable, glove-friendly, low-navigation.

**Sources provided:** product brief only (pasted text). No codebase, Figma, logo, fonts, or existing UI were provided. Everything here is an original design authored from the brief.

## No logo

No logo or brand mark was provided. Wherever a mark would go, render the word "Sentri" in `--font-display` (Plus Jakarta Sans, extrabold). Do not draw or invent a mark.

## Font substitution (flag)

No font files were provided. The system uses Google Fonts via `tokens/fonts.css`:
- Display / body / UI: **Plus Jakarta Sans**
- Identifiers (ear tags, pen codes): **IBM Plex Mono**

If Sentri has real brand fonts, supply the files and we'll swap the `@font-face` declarations.

## CONTENT FUNDAMENTALS

Sentri copy is operational: it tells a worker what to do, where, and how much. Written for someone standing in a barn, reading for two seconds.

- **Sentence case everywhere** except uppercase micro-labels for section headers ("DUE NOW", "GESTATION 1"). Status badges are sentence case.
- **Counts lead.** "18 of 31 recorded", "6 overdue", "Eligible in 4 days". Numbers first, nouns second. Never a bare percentage without its denominator.
- **Verbs for actions, nouns for state.** Buttons: "Record", "Mark pregnant", "Move 12 pigs". Statuses: "Due now", "Overdue", "Upcoming", "Done", "Blocked".
- **Location is always named**, never implied: "Gestation 1 · Pen 14".
- **Attribution on records:** "Recorded by M. Larsen · 09:42". Sync state is explicit: "Synced" / "Waiting to sync".
- **Missing ≠ zero.** Write "No status" or "Not checked", never "0".
- **Voice:** direct, neutral, no exclamation marks, no emoji, no "please". Second person only when necessary ("You're offline").
- Farm terminology is farm-defined (unit/room/barn/house) — copy uses the farm's own names verbatim and truncates gracefully.

Examples:
- "Pregnancy check — 31 due in 3 units"
- "No checks due now. 18 sows eligible in 4 days."
- "Same result for 8 selected animals?"
- "2 records waiting to sync"

## VISUAL FOUNDATIONS

**Vibe:** a modern field tool — clean, light, high-contrast, with soft depth and rounded geometry. Operational, not playful.

- **Color:** cool near-white neutrals (`--bg-app #f5f6f3`) as ground; deep green (`--olive-800 #15603f` — token names kept for compatibility) as the brand/action color; high-vis amber (`--amber-500 #f5a524`) reserved for *due-now* attention. Status is a fixed 5-color system: red = overdue (filled), amber = due now (filled, black text), blue = upcoming (tinted), green = done (tinted), gray = blocked/no status (tinted; dashed border when info is missing). Status colors are never used decoratively.
- **One accent rule:** amber and red are load-bearing. Nothing else on a screen may be amber or red.
- **Type:** Plus Jakarta Sans throughout (extrabold headings and counts, regular body); IBM Plex Mono for animal/pen identifiers so IDs are visually distinct and scannable. Big-count style `--text-count` (40px extrabold) for glanceable workload numbers. Minimum UI text 12px; body 15px.
- **Backgrounds:** flat solid colors only. No gradients, no textures, no photography, no illustration. Headers are light with a large extrabold title and circular icon actions; content sits on the near-white ground.
- **Spacing:** 4px base scale (`--sp-*`). Screen padding 16px. Dense lists, 12px vertical rhythm inside cards.
- **Touch:** minimum 48px targets (`--touch-min`), 48px default control height, 56px for primary field actions — gloves.
- **Corners:** 14px controls, 20px cards, 28px sheets, full-round buttons, pills and badges.
- **Borders & shadows:** cards are white and borderless with a soft ambient shadow (`--shadow-card`); inputs and secondary buttons are filled (`--surface-sunken`) with no border until focus. Elevation is used sparingly: raised only for sticky action bars and sheets. No inner shadows, no glows.
- **Hover:** darken (backgrounds shift one step down, e.g. olive-800 → olive-900). **Press:** darken + scale(0.98). Desktop hover is secondary — this is a touch product.
- **Focus:** brand-green border + soft green halo on fields; `--ring` for keyboard focus.
- **Animation:** minimal and fast — 120–200ms ease-out fades/translates. No bounces, no springs. Sheets slide up; toasts fade. Anything longer feels laggy in a barn.
- **Transparency/blur:** none, except a 40% ink scrim behind sheets/dialogs.
- **Cards:** white, 20px radius, borderless, soft shadow, 16px padding. Card = one unit of work or one location. Left edge never carries a colored accent border; status is carried by badges and count pills.
- **Layout:** single column on mobile; light top bar and a bottom nav with a tinted active pill; sticky action bar above bottom nav during bulk selection.
- **Progress:** always segmented against a defined work set ("18 of 31"), shown as a thick 8px rounded bar, green fill for recorded, amber remainder marker when due, never an ambiguous %.

## ICONOGRAPHY

No icon assets were provided. The system uses **Lucide** (open-source, CDN) — 2px-stroke outline icons that match the utilitarian tone. This is a flagged substitution: if Sentri has a proprietary icon set, supply it.

- Load: `<script src="https://unpkg.com/lucide@0.462.0/dist/umd/lucide.min.js"></script>`; components use the `Icon` React wrapper (`components/core/Icon.jsx`) which renders from `window.lucide` — never hand-drawn SVG.
- Default size 20px (24px in nav), stroke-width 2, `currentColor`.
- Core vocabulary: `clipboard-list` tasks, `map-pin` location, `calendar-clock` upcoming, `alert-triangle` overdue/attention, `check` / `check-check` done/synced, `clock` due, `piggy-bank` never (too cute) — animals use `tag` (ear tag), `scan-line` scan, `syringe` treatment, `wheat` feed, `arrow-right-left` movement, `shield` biosecurity, `cloud-off` offline.
- No emoji, ever. No unicode-glyph icons except "·" as a text separator.

## Intentional additions

No source defined a component inventory, so this is an authored standard set plus domain components the brief demands:
- `Stepper` — glove-friendly ± count entry (piglet counts, doses).
- `SegmentedControl` — the by-task / by-location mode switch.
- `StatusBadge`, `CountPill` — the fixed work-status vocabulary.
- `ProgressBar` — defined-denominator progress.
- `SyncPill` — offline/sync state (unreliable connectivity).
- `TaskCard`, `LocationRow`, `AnimalRow`, `Stat` — the operational list/aggregate units.
- `TopBar`, `BottomNav`, `Sheet`, `ActionBar` — the fixed mobile shell.

## Index

- `styles.css` — global entry; imports everything under `tokens/`.
- `tokens/` — fonts, colors, typography, spacing, effects, base.
- `guidelines/` — foundation specimen cards (Design System tab).
- `components/core/` — Icon.
- `components/forms/` — Button, IconButton, Input, Select, Checkbox, Switch, Stepper, SegmentedControl.
- `components/feedback/` — StatusBadge, CountPill, Tag, ProgressBar, Toast, SyncPill.
- `components/navigation/` — TopBar, BottomNav, Tabs, Sheet, ActionBar.
- `components/data/` — TaskCard, LocationRow, AnimalRow, Stat.
- `ui_kits/sentri-mobile/` — interactive mobile app recreation (Today, Unit, Task screens).
- `SKILL.md` — agent skill entry point.
