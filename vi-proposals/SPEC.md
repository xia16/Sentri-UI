# Sentri VI — Candidate Deck Spec (shared across all three directions)

Sentri is a mobile app for commercial pig-farm operations. Farm workers use it in
barns: gloved hands, wet/dirty screens, sunlight glare, low tolerance for reading.
The app is **location-first**: workers navigate by building → room → pen, not by
animal ID. Ear-tag IDs matter only *inside* a location context. The app is
information-dense — hundreds of animals per task — and must stay calm: few
hierarchies, no decoration that competes with status.

Reference lineage (validated with user): Flighty / flight trackers, package-tracking
timelines, health-metric cards. NOT luxury-car status tiles. Distill principles,
do not imitate any app.

## Non-negotiable constraints (identical in every deck)

- **Status semantics** (hues may be retuned per direction, meanings may not):
  - Overdue = red family
  - Due now = amber family (amber is load-bearing; never decorative)
  - In progress = blue family
  - Done / recorded = green family
  - Upcoming / not yet due = neutral gray
- **IDs are monospaced.** Ear tags (e.g. `000418`), pen codes (e.g. `A1`).
- **Touch targets:** 48px minimum, 56px for primary CTAs. Gloves.
- **Light UI.** Near-white ground. No dark mode in these decks.
- **English primary.** Fictional data below, used identically in all decks.
- **Free fonts only** (Google Fonts OK, loaded via CDN link).
- **Location-first hierarchy** on every screen: location is the container,
  animal rows live inside location groups, never a flat animal list.

## Shared fictional data (same in all three decks — comparison must be about identity)

- Farm: **Ashfield Farm** · 2,140 sows · 4 sections: Breeding, Gestation, Farrowing, Nursery
- Today's workload: 3 tasks — Pregnancy Check (Gestation · Room 2, 200 sows, day 1 of 3,
  100 done), Heat Check (Breeding · Room 1, 46 sows, due now), Farrowing watch
  (Farrowing · Room 3, 12 sows active, 1 alert)
- Exception state: 6 overdue pregnancy re-checks in Gestation Room 2; sync pending 3 records
- Pregnancy Check list: pens A1–A4, rows like:
  - `000231` — recheck in 3 days (uncertain) — upcoming
  - `000268` — needs check — due now
  - `000302` — not pregnant → flagged for rebreed — attention
  - `000318` — pregnant, confirmed — done
  - Delta pattern where relevant: scheduled day vs actual (e.g. "due Jul 8 · done Jul 8" or "+2d late")
- Farrowing record sheet: sow `000418` · pen B2 · parity 3 · 650 days old ·
  8 live, 0 stillborn/mummified · warning "45 min since last piglet" ·
  recorded by G. Hansen 23:00 · primary CTA "Record birth" · secondary "···"
- Worker: G. Hansen. Date context: Thu, Jul 8.

## Deck structure (Moxling-style, ~10 numbered chapters, one HTML file, self-contained)

Editorial specimen page: hairline rules, numbered chapters, uppercase letterspaced
mono annotation labels, generous whitespace. Desktop-width document; phone screens
rendered inside 390px fixed-width frames with a thin bezel border.

1. **01 Idea** — the metaphor in one page: name, one-line thesis, 3 principles
2. **02 Mark** — wordmark + symbol for "Sentri". Simple geometric construction,
   shown at multiple sizes incl. 24px favicon scale. Explain the gesture.
3. **03 Type** — display + text + mono choices (free fonts), scale specimen,
   numerals-in-anger sample (big count, tabular time, mono ID)
4. **04 Color & Status** — full palette with values, the 5-status system rendered
   as chips/rows, one section showing "status must survive sunlight" contrast notes
5. **05 Screen: Today / Section overview** — location-first home. Sections →
   rooms with counts, exception strip for the 6 overdue, sync state. THE key screen.
6. **06 Screen: Pregnancy Check** — unit progress header + pen-grouped pig list
   (data above). Density test: must handle 200 rows' worth of pattern.
7. **07 Screen: Farrowing record** — bottom-sheet record UI (data above).
   Action test: counters, warning, big CTA.
8. **08 Density rules** — row heights, spacing rhythm, hierarchy depth limit,
   what color is allowed to mean, touch-target diagram
9. **09 Voice** — microcopy register: calm, imperative, no jargon; 6 example strings
   (empty state, error, sync, confirm, overdue nudge, done)
10. **10 Verdict** — honest self-assessment: what this direction proves,
    where it strains. (Feeds the compare sheet.)

## The three directions (one per deck — over-commit, do not hedge toward the middle)

### Direction 01 — Field Ledger (`sentri-vi-ledger.html`)
The record book. Warm paper neutrals, deep olive-green brand, ink text.
Serif display (e.g. Fraunces) + humanist sans text + mono annotations.
Signature: the **delta row** — scheduled vs actual, struck-through schedule,
colored delta chip. Editorial hairlines, ledger tables. Personality: trustworthy
registry; "everything on the record." Evolution of Sentri's existing DS
(olive/amber, Plus Jakarta Sans + IBM Plex Mono — may keep or upgrade).

### Direction 02 — Panel (`sentri-vi-panel.html`)
The instrument cluster. Cool near-neutral ground, one engineered signal hue
(pick something ownable — not enterprise blue), big tabular numerals, gauge-like
segmented progress, exception-first layout (alerts pinned top, everything else
quiet). Display face with mechanical authority (e.g. Archivo/Space Grotesk family).
Signature: the **barn schematic** — spatial room/pen diagram with live counts.
Personality: equipment you operate.

### Direction 03 — Board (`sentri-vi-board.html`)
The departure board. Near-white ground, ink text, mono-forward typography
(e.g. JetBrains Mono/Geist Mono + a compact grotesk), strict tabular rows:
location · task · count · time · STATUS. Status column carries ALL color;
everything else is achromatic. Flip-board glanceability without kitsch.
Signature: the **status column** — one aligned rail of colored words readable
at arm's length. Personality: the schedule you read.

## Quality bar

Same fidelity across decks. Real data everywhere (no lorem). Screens must look
shippable, not wireframe. Each deck internally consistent: its mark, type, and
color must appear *in* its screens. Honest chapter 10. No JS beyond trivial;
no external assets except Google Fonts.
