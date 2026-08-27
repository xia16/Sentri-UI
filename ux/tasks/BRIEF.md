# Task-doc brief — production consolidation & subtraction

You are producing ONE self-contained HTML document for ONE production task of Sentri
(pig-farm operations app). Audience: the product owner reviewing on desktop. Mission:

1. **Inventory** what production has today (from Figma — every screen, state, sheet,
   field, and rule in your task's section).
2. **Distill the requirements** — what data must be captured, what is derived, what is
   configuration. Production is the requirements source; its UI is NOT the target.
3. **Subtract** — identify redundancy, noise, over-complication. We are doing
   subtraction: farmers must capture maximum data with minimum system complexity.
4. **Re-express the task** as an optimized low-fi flow anchored on our already-designed
   system (below). Only task-specific deltas need design; everything else cites the
   existing component.

## Think like this

A farmer stands in a pen with gloves. Every screen must answer "what do I do here" in
one glance. Data capture is the goal; complexity is the enemy. If production shows the
same fact twice, cut one. If a status legend explains what a good status word would say
itself, fix the word and cut the legend. If a field can be derived (day counts, windows,
percentages), the system computes it — never ask the farmer. If a screen exists only to
navigate, our navigation (lens · pen picker · scan · search) already covers it.

## Our design system (the anchor — read these files first)

- `/Users/xia/Desktop/Sentri-UI/ux/task-screens.html` — the full rendered system.
  Sections: 01 task lists · 01b row & data grammar · 01c filter · 02 pen picker ·
  02b status matrix · 02c peek · 03 task detail sheets · 04 interaction sheets.
- `/Users/xia/Desktop/Sentri-UI/ux/unified-task-list.md` — the interaction model.

Non-negotiable laws (do not re-litigate; anchor on them):
- Screen = header (task title + last activity → Unit KPI | Task overview cells) →
  lens row (+ funnel) → pen-grouped rows → dock (Go to pen · Scan ear tag · search).
- Lens = pig-state pair, negative first, never a verb; sub-lens for multi-outcome.
- Row = [box?] tag · fact(+one chip max) · metadata line · rail. Two lines, always.
  Line 1 words (`Mated · 21 days ago`), line 2 tokens (`weaned 4d · signs 10h · G.H`).
  Chips only for escalated measurements or flagged observations. Stamps = record
  trails (done rows, or open rows whose state descends from a record).
- Box tasks (stateless mark → bar acts): heat, return, pregnancy, piglet treatments.
  Rail tasks (tap acts): breeding, farrowing, postpartum, weaning.
- No Save/Submit/Complete on room screens; actions commit themselves; rounds are
  ambient; End task lives in the task detail sheet only (sweeps yes; event tasks no).
- Picker/peek are navigation-only; grid never acts.
- Everything derivable is derived. No per-sow negative confirmations.

## Figma access (your task's node is in your prompt)

fileKey: `psrxDa9LRWLdTL9XMZmWdc`
- `mcp__bee8a87f-8150-4977-ac3f-2d768fbe4991__get_metadata` (fileKey, nodeId) — result
  overflows to a file; probe with python/jq, extract frames:
  `re.findall(r'<frame id="([^"]+)" name="([^"]+)"', xml)` — screens are the large
  direct-child frames (names like `Tab：…`, `…默认态`, sheets, dialogs). Note x/y/w/h
  to distinguish full screens (~375–390 wide) from components.
- `mcp__bee8a87f-8150-4977-ac3f-2d768fbe4991__get_screenshot` (fileKey, nodeId,
  maxDimension) — returns a URL + curl instructions; download to your scratchpad and
  Read the PNG. Screenshot the whole section once (maxDimension ~2800) for the map,
  then each distinct screen/sheet at ~1200 for reading. Read EVERY distinct screen —
  magenta/red annotations in the frames are designer notes: capture them, they are
  requirements.

## Deliverable: `/Users/xia/Desktop/Sentri-UI/ux/tasks/<slug>.html`

Self-contained HTML, no JS, Google Fonts via link only. Copy this head verbatim:

```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--ground:#F7F6F2;--card:#FFF;--well:#EFEEE8;--ink:#1C1E19;--ink2:#51544B;--ink3:#8B8E83;--hair:#E7E6DF;--hair2:#D8D7CE;--red:#C2402E;--amber:#96660D;--amber-fill:#D99A21;--amber-wash:#F8F0DC;--green:#3B8A50;--green-wash:#EAF2EC;--mono:'IBM Plex Mono',monospace}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--ground);color:var(--ink);font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;line-height:1.55;-webkit-font-smoothing:antialiased}
.wrap{max-width:980px;margin:0 auto;padding:40px 48px 90px}
h1{font-size:34px;font-weight:800;letter-spacing:-.015em;margin:18px 0 10px}
h2{font-size:21px;font-weight:800;margin:44px 0 14px;padding-top:28px;border-top:1px solid var(--ink)}
h3{font-size:15px;font-weight:700;margin:20px 0 8px}
p{max-width:72ch;color:var(--ink2);margin-bottom:10px}
.anno{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink3)}
table{width:100%;border-collapse:collapse;font-size:13.5px;margin:12px 0}
th,td{text-align:left;padding:9px 10px;border-bottom:1px solid var(--hair);vertical-align:top}
thead th{font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink3);border-bottom:1px solid var(--ink)}
.mono{font-family:var(--mono);font-size:12.5px}
.cut{color:var(--red);font-weight:700}.keep{color:var(--green);font-weight:700}.merge{color:var(--amber);font-weight:700}
pre.flow{font-family:var(--mono);font-size:12px;line-height:1.7;background:var(--card);border:1px solid var(--hair);border-radius:12px;padding:18px 20px;overflow-x:auto;margin:12px 0;color:var(--ink)}
.note{background:var(--card);border:1px solid var(--hair);border-radius:12px;padding:14px 16px;margin:12px 0;font-size:13.5px;color:var(--ink2);max-width:none}
</style>
```

Document sections, in order:
1. `<h1>` task name (EN + 中文) + one-line thesis. `.anno` line: figma node · screen count.
2. **Production inventory** — table of every screen/sheet/state (name · what it shows ·
   data on it). Include designer-annotation findings.
3. **Requirements distilled** — three lists: data captured (field-level, with type),
   derived by system, configuration.
4. **Subtraction analysis** — table: production element · verdict
   (<span class=cut>CUT</span> / <span class=merge>MERGE</span> /
   <span class=keep>KEEP</span> / MOVE) · justification. Be aggressive but never drop
   a captured data field — relocate it.
5. **Optimized flow** — `pre.flow` ASCII of the farmer's walk, step by step, each step
   citing the anchor component (e.g. `→ outcome sheet (04)`), with only genuine
   task-specific deltas called out in a "Deltas" list after.
6. **Data-capture map** — table: field → where in new flow → production origin.
7. **Open questions** — only real product decisions, not design.

Keep it dense and honest; no marketing prose. Everything in English (translate
production labels, keep 中文 in parentheses where the term matters).
