# Icon round: more icons, one meaning each

Status: **proposal, on the canvas for the owner** (2026-11-03). Nothing under `ux/` has changed. The canvas link is in [the design system's canvas.md](../../ux/design-system/canvas.md).

## Why

The registry (`SentriIcons` in `ux/design-system/components/bundle.js`) has 73 glyphs. Most are generic app symbols, and screens keep borrowing them for farm things they don't show:
- a person (`profile`) stands for a sow, a piglet, a parity and a pig's details;
- a warning triangle (`alert`) stands for a death and for "not in pig";
- a hospital pen stands for fostering;
- a bar chart stands for every production task;
- a note stands for breeding, sampling and piglet-processing tasks.

Five pairs are the same shape under two names:
- `chart` and `production` are the same three bars, and `signal` is bars again;
- `farrow` and `pregnancy` are the same pulse line;
- `note` and `record` are the same lined page;
- `up` and `back-chevron` are the same path;
- `humidity` and `drop` are the same drop.

## The drawing rules (taken from the current set)

1. **Grid:** a 24 × 24 viewBox. Content sits inside about 2 units of padding (x and y from 2 to 22). Small parts such as a tail, a tusk or an arrowhead may touch the edge.
2. **Stroke:** one open-stroke `path` per glyph (several subpaths are fine). The stroke weight comes from the CSS: `--icon-stroke` 1.6 at glyph sizes 14–20, and `--icon-key-stroke` 2.2 on Stepper keys. The path never sets its own weight, fill or colour.
3. **Ends:** round caps and round joins (`stroke-linecap/linejoin: round`, set by the host CSS).
4. **Shapes:** simple outlines with no fills and no occlusion tricks. Where one shape stands behind another, only its visible part is drawn (`pigs`, `litter`).
5. **Dots:** a dot is a zero-length segment (`h.01`), so the round cap draws it. That includes eyes, teats and the dot in `tag`. `more` remains the only glyph with filled circles.
6. **One family:** every animal comes from one parametric body in [pig-family.mjs](pig-family.mjs): a stadium facing right, with a square snout, a pointed ear, two legs, a curled tail and an eye. Kinds differ only by what they add:
   - sow: two teats;
   - boar: a tusk;
   - gilt: smaller, with a small spark for "new";
   - piglet: small;
   - pregnancy: a dot-ring in the belly;
   - not-pregnant: the pregnancy pig with a slash, as `tag-off` is drawn.
7. **No library:** every path is hand-written here. Lucide and Tabler served only as references for common shapes such as the clock with a back arrow and the clipboard.
8. **One meaning per icon.** A new screen that needs a meaning with no glyph gets a new glyph, never a borrowed one.

## What to draw: 23 new glyphs, 8 redrawn

| Group | Glyph | Meaning | First uses |
|---|---|---|---|
| Animals | **pig** (redrawn) | Any pig, or pigs as a subject | Pig profile: General details, Basic information, finisher title; Farrowing filter: Pigs |
| | **sow** | A sow | Farrowing Details: *Against herself*; Parity facet; Report death: *The sow*; Pig profile: sow title, *Sow & cycle* |
| | **gilt** | A gilt | Drawn for type facets and pig rows (no screen yet) |
| | **boar** | A boar | Pig profile: boar title |
| | **piglet** | A piglet, or piglets as a subject | Piglet processing action and Home task; + born chip; Nursery section |
| | **litter** | One sow's litter | Farrowing Details: *This litter* |
| | **pigs** | A group of pigs: a batch or a pen's pigs | *Against her batch*; Move to another farrowing batch; Batch membership |
| Events | **service** | Service (breeding) | Home: Breeding section and task |
| | **return-heat** | Return-heat check | Home: Return-heat task |
| | **pregnancy** (redrawn) | Pregnant; the pregnancy check | Home: Gestation, Pregnancy check |
| | **not-pregnant** | Abortion, or not in pig | Record abortion, Mark not in pig |
| | **farrow** (redrawn) | Farrowing: a sow lying down, a piglet at her belly | Home: Farrowing; Open Farrowing |
| | **wean** | Weaning | Drawn for Wean (no screen yet) |
| | **foster** | Fostering piglets | Foster piglets (was the hospital pen) |
| | **death** | A death (a headstone, no cross) | Death key, Died after birth, − died chip, Record piglet/sow deaths |
| | **move** | Moving pigs to another pen or room | Transfer, Pig transfer tasks; `transfer` becomes its alias |
| | **truck** | Pigs leaving the farm | Home: Outbound pickups (was `send`) |
| | **sample** | Sampling | Home: Sampling tasks |
| | **count** | A count of animals | Reconcile piglet count |
| | **notch** | Ear notch | Piglet identity: Ear notch (was `details`) |
| | **production** (redrawn) | Production work: a cycle round a snout | Home: Production; production tasks and actions |
| Records | **record** (redrawn) | A record: a clipboard | Litter summary, Task outcomes, Pig record |
| | **note** (redrawn) | A note: a sticky note | Pen and sow notes, Add a note |
| | **history** | Past records, the log | Home: Records |
| | **tasks** | A list of tasks | Pig profile: Current tasks |
| | **chart** (redrawn) | Performance over time: a line on axes | Performance metrics, Averages, Base curve |
| | **undo** | Undo (the old `return` shape) | Farrowing: Undo; `return` becomes its alias |
| Places | **room** | A room or unit | Choose a unit, Task overview unit tile, Inspection unit |
| | **pen** | A pen (a fence) | Fault pen rows |
| Health | **pain** | Pain relief | Medicine categories (was the heat flame) |
| Farm | **humidity** (redrawn) | Air humidity: a drop over waves | Sensors |

## The look-alike pairs

| Was | Becomes |
|---|---|
| `chart` = `production` (bars) | `chart` is a line on axes; `production` is a cycle round a snout. `signal` keeps its bars for the status bar only |
| `farrow` = `pregnancy` (pulse) | `farrow` is a sow with a piglet; `pregnancy` is a pig with a dot-ring in the belly |
| `note` = `record` (page) | `note` is a sticky note; `record` is a clipboard |
| `up` = `back-chevron` | `up` becomes an alias of `back-chevron` |
| `humidity` = `drop` | `humidity` is a drop over waves; `drop` stays for vitamins and the udder |
| `transfer`, `return` | Become `move` and `undo`; the old names stay as aliases, so nothing breaks |

## The usage swaps

51 swaps in six files are listed in [swaps.json](swaps.json), each with its reason. The mock applies them in memory, and `node review/icon-round/swaps.mjs --write` applies them for the build.
- **Inspection:** icon names only (`'clock'` → `'sow'`, and so on). No logic changes.
- **Farrowing:** two action entries that had no icon get one (`Record abortion` and `Record sow death`). Everything else is a name change.
- **Home:** the task card takes the task's own icon (`t.icon`) instead of `production` for every card.
- **Left alone:** the old piglet full-task pages, `weaning.handoff` and the built `piglet-processing/simple/dist`.

## One meaning per icon

[meanings.json](meanings.json) lists every one of the 93 glyphs after the round, each with its one meaning and the screens that use it. The canvas shows it as the sheet, and the build copies it into the Icon README.

## Open questions (recommendation first)

1. **Home "Other" heading** uses `transfer` (now `move`), because most Other items are moves. *Recommend:* keep it until Other has a mix of jobs, then use no icon.
2. **gilt and wean have no screen yet.** *Recommend:* add them now, because Find a pig's type facet and the Wean task need them next.
3. **Sizes:** the animals are wide shapes, so at 16px (heading size) they read smaller than square glyphs. *Recommend:* keep 16px for headings and check them on the phone frames below. Don't add a size token for the animals.
