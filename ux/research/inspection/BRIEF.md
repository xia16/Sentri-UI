# 巡检 (Inspection / Patrol) — requirements extraction brief

You are extracting **production requirements** from Figma for ONE cluster of the 巡检 module.
This is a **UI → PRD** job: document what exists so it can serve as the basis for a redesign.

**Do NOT redesign.** No proposals, no cuts, no "we should". Only: what screens exist, what a user
can do, what data is captured, what rules govern it. Where production is ambiguous or
self-contradicting, say so plainly and quote it.

## Figma
- fileKey: `4GZGPBauEOWQQjnRrzoUgF` (this is the 巡检 file — a DIFFERENT file from 生产任务)
- `mcp__bee8a87f-8150-4977-ac3f-2d768fbe4991__get_screenshot` (fileKey, nodeId, maxDimension)
  → returns a URL + curl instructions. Download to your own scratch dir and Read the PNG.
  Use maxDimension ~1200 for a normal 750x1624 screen; tall frames (h>2000) should be pulled at
  ~2000 and read in slices if needed.
- `mcp__bee8a87f-8150-4977-ac3f-2d768fbe4991__get_metadata` (fileKey, nodeId) for structure when a
  screen is dense — WARNING: output can overflow; if it does, it is written to a file and you must
  probe it with python/jq rather than Read.
- **Use a scratch dir unique to you** (e.g. /tmp/insp-<cluster>/) — sibling agents run in parallel
  and shared filenames have collided before.

## What to capture per screen
1. **Screen name** (中文 + English gloss) + node id.
2. **Purpose** — what the user is doing here, in one line.
3. **Every control**: buttons, tabs, chips, toggles, steppers, pickers, checkboxes, search, FABs,
   nav affordances. Note disabled/enabled states and what gates them.
4. **Every field**: label, input type, required (look for `*`), default, units, placeholder text
   (quote it), validation.
5. **Every rule**: conditional visibility, branching, what an action does to state (batch moves,
   removals, status changes), confirmations, toasts.
6. **Designer annotations** — magenta/red/coloured text floating near frames are requirements.
   **Quote them verbatim in 中文 and translate.** These are the highest-value content in the file.
7. **Bulk vs individual** — does the screen act on one pig or many? Where does selection happen?
8. **Scanning** — where scan/NFC/ear-notch appears and what it does.

## Deliverable
Write **one markdown file**: `/Users/xia/Desktop/Sentri-UI/ux/inspection/<your-part>.md`

Structure:
```
# Part <X> — <cluster name>

## Screen inventory
| Node | Screen (中文) | English | Purpose |

## <Screen name> — <node>
**Purpose.** …
**Controls.** …
**Fields.** table: field | type | required | default | notes
**Rules.** bullets, quoting annotations verbatim
**Bulk / scan.** …

(repeat per screen)

## Actions this cluster exposes
| Action | Entry point | Subject (1 pig / N pigs / pen / device) | Data captured | Effect on state |

## Rules & conditionality
bullets, each with its node id and the 中文 quote where one exists

## Ambiguities / contradictions found
```

Be dense and factual. Tables over prose. Quote Chinese labels with an English gloss in
parentheses. Every claim must trace to a node id.
