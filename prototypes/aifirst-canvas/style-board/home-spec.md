# Home (console) · spec for a blind build

## What this is

Sentri is software for pig farms. Barn workers record on a phone; the farm owner or manager runs the
farm from a desktop **console**. The console has a chat on the left (AI teammates: General Manager,
Production, Vet, Biosecurity, Equipment) and a **side pane** on the right that shows pages. **Home**
is the page the pane shows first: the manager opens the console in the morning and Home must tell
them, in a glance, what needs them and where everything is.

You are designing **only the Home pane**: 467 px wide, 900 px tall viewport, content scrolls inside it.
The chat and everything left of the pane are out of scope; do not draw them.

## Who and how

The farm owner/manager (Adam), on a desktop, with a mouse. Grounded, serious, calm — a vertical
operations tool, not AI hype (no neon, no dark-and-lime, no gradients, no sparkle icons). Light theme
only. Quality bar: a top-tier modern product (think Linear, Stripe, Zaplar-style hospitality ops).

## Structure (top to bottom)

1. **Header** — a deep green band across the full pane width (`#1F4A38`), white text:
   - a search field "Find a page or action" (pages and actions; not a chat box)
   - a small date line "Thu 5 Nov · Hillside Sow Farm" and the greeting "Good morning, Adam"
   - **Inbox, one item at a time**: a section label "Inbox · 6 waiting", a small switcher (previous /
     position "1 of 6" / next, compact, monochrome on the green) and "Open inbox ›". Under it ONE
     item shown as a white card. This is the **only raised card** on the page (white, soft shadow).
     The green ends partway down this card so the card bridges header and body (no hard edge
     right under the card).
   The Inbox holds only things that arrived on their own (background agents, scheduled checks,
   teammates, the system) — never things the user asked for in chat.
2. **Today** — what the farm is doing today, as **two small tiles side by side** (the phone app's
   pattern): task name, its batch or target, one big number with a word, and a thin segmented
   progress bar of the task's days (done / today / ahead) with "Day 3 of 7". More than two tiles →
   the row scrolls sideways. Section header has a link **"Schedule ›"** (opens the week schedule).
   A tile opens that task.
3. **Actions** — "Recent": five tiles (icon in a soft coloured square + label under it), then a row
   "All actions · 26 in 7 groups" that expands. Next to the section title a quiet hint: "or type /
   in the chat".
4. **Dashboards** — one row each: icon, name, one short figure on the right, chevron. Rows open the
   dashboard.
5. **Your team today** — a quiet timeline of what the AI teammates did on their own today (time,
   agent colour mark, one line, agent name). Show the latest few; scrolling to the bottom loads older
   entries (infinite scroll) until "That's everything since Monday".

Nothing is fully presented on Home except the one Inbox item; everything else is a link into its page.

## Hierarchy rule (important)

The Inbox card is the one big, raised card. Everything in the body is **flat** (light fill or hairline
border, no shadow, smaller type), so the page reads as one decision on top and quiet links below —
never a stack of competing cards. No boxes inside boxes: one surface per item.

## Content (use exactly; do not invent other data)

**Inbox (6)**, newest first is not required; show this order:
1. Kind **Approve** · from **Vet** · 3h ago · "Revaccinate Batch 29 against PRRS" · "Antibodies came
   back low in 14 of 30 samples. I drafted a PRRS booster for all 470 pigs on Mon 9 Nov, the same plan
   as Batch 27." · reference "Batch 29 · Nursery 2" · buttons **Review**, **Approve** (primary).
2. **Approve** · Biosecurity · 3h ago · "5 visitors want to come in next week" · "Dr. Chen's team plus
   two feed reps, Tue–Thu. All have been away from other pigs for 3 days." · "5 visitors · Tue–Thu" ·
   Review / Approve.
3. **Question** · Production · 2h ago · "Batch 33 farrowing room: keep Farrowing 1?" · "2 crates in
   Farrowing 1 are down until Monday. Farrowing 2 is free from Thursday." · "Batch 33 · farrows from
   Fri" · two answers: "Keep Farrowing 1", "Use Farrowing 2".
4. **To do** · Zhao Min (a worker, from the phone) · 1h ago · "Sick room is full" · "3 of 3 places
   taken. Two more sows were marked sick this morning." · "2 sows waiting for a place" · Mark done.
5. **To do** · flagged by the phones · yesterday · "3 pigs missed in Batch 31's PRRS round" ·
   **Overdue** · "Plan top-up".
6. **To do** · reminder you set · Mon · "Call Hartland to confirm Dr. Chen's visit time" · Mark done.
Each card also has a dismiss ✕. Approving/answering/dismissing moves to the next item.

**Today** (4 tiles):
- Fostering checks · Batch 32 · **6** "of 8 checked" · days: 2 done, today, 4 ahead · Day 3 of 7
- Amox treatment · 4 sows · **4** "due today" · doses: 1 done, today, 1 ahead · Dose 2 of 3
- PRRS top-up · 3 pigs · **3** "waiting" · today only · Today
- Farrowing · Batch 33 · **~6** "expected Fri" · 7 days ahead · Starts Fri

**Actions — recent**: Pig list, Batches, Vaccination plans, Treatment orders, Sampling plans.
All actions groups (expanded): Pigs, Batches, Health, Production, Feed, People, Setup.

**Dashboards**: Production — "6 batches running"; Health — "3 to treat · 12 monitoring";
Biosecurity — "Next sampling Mon 9 Nov".

**Your team today** (latest first):
- 08:12 · Equipment · "Water line B pressure is back to normal"
- 07:55 · General Manager · "Logged Zhao Min's note: the sick room is full"
- 06:10 · Production · "Asked you about Batch 33's farrowing room"
- 06:00 · General Manager · "Sent the morning report to the Farrowing team"
- 05:40 · Vet · "Drafted a PRRS booster for Batch 29"
Older (loaded on scroll, yesterday and Tue/Mon): plausible entries of the same kind (e.g. "Ordered
10 bottles of Amoxicillin", "Moved Batch 33 to Farrowing 1 on the schedule", "Checked heat lamps in
Farrowing 2"), then "That's everything since Monday".

## Colour and type

- Font Inter (Google Fonts) with a system fallback; tabular figures for numbers.
- Primary green `#1F5F45` (buttons); header `#1F4A38`; page white.
- Colour only where it means something. Kinds: Approve violet `#F1E6FB`/`#8A3FCF`, Question blue
  `#E3EDFB`/`#2F6AC0`, To do grey `#EFEFEC`/`#55554F`; Overdue red `#B34B43`. Task days: done green
  `#5DAA74`, today blue `#7FA7E0`, ahead `#E9ECE5`.
- Agent identity colours (avatar/mark): General Manager ink `#20291F` (white text), Production amber
  `#FCEFD6`/`#8A5A12`, Vet teal `#DDF1EF`/`#1F6F68`, Biosecurity violet `#ECE8FB`/`#5B4AB3`,
  Equipment red `#FBE5E3`/`#A23B33`. People (workers) grey.
- Text sizes: nothing acted on below 13 px; quiet text ≥ 12 px. Short values only: a value that
  would wrap goes elsewhere.

## Deliverable

One self-contained file: `C:\Users\ying_\Documents\Codex\2026-09-08\clo\Sentri-UI\.claude\worktrees\happy-saha-abd10a\prototypes\aifirst-canvas\style-board\home-blind.html`.
- Plain HTML + one `<style>` + one `<script>`; no frameworks, no CDN scripts (Google Fonts link only);
  must render offline with the system font.
- The page shows the pane as a 467 × 900 frame (rounded, white) centred on a neutral background.
- Real interactions: switcher, Approve/answers/dismiss advance, Today row scrolls sideways, All
  actions expands, team timeline loads more on scroll, hover states (desktop).
- Nothing may overflow or overlap; no text truncation except where a row is designed to scroll.
