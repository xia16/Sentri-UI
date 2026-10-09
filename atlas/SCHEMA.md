# Atlas data

The atlas (`atlas/index.html`) reads one generated file, `atlas/atlas.json`. Nobody edits it: `node scripts/build-atlas.mjs` writes it from the sources below and refuses to write it when a source is inconsistent.

Words are the design workflow's ([glossary](../docs/design-workflow/GLOSSARY.md)): atlas, platform, section, feature, screen, flow, entry point, adds to, anchor; statuses `placeholder` · `in-design` · `agent-checked` · `approved`.

## Sources

| Path | Holds |
|---|---|
| `sections/sections.json` | every platform's sections in board order: `{ "platforms": [{ "id", "name", "sections": [{ "id", "name", "zh", "shared": "what the section's features share, one paragraph" }] }] }` |
| `features/<id>/feature.json` | one feature (below) |
| `features/<id>/PRD.md` | the feature's PRD, prose: Problem · Who · Anchor · Rules · Scope · Decisions |
| `ux/design-system/components/<Name>/gate.json` | a component's gate result (below); optional |
| `ux/design-system/components/_proposed.json` | components seen in screens but not in the design system yet: `[{ name, group, seenIn: [screenId], note }]` |
| `references/figma/index.json` | the old UI in Figma: `[{ "file", "key", "screens", "flows": [[name, screens, nodeId]] }]` |

## `features/<id>/feature.json`

```jsonc
{
  "id": "farrowing",                    // = folder name; stable
  "name": "Farrowing", "zh": "分娩",
  "platform": "mobile", "section": "tasks",
  "newFeature": false,                  // true when not in the old Figma
  "duplicates": "",                     // where the old UI draws the same thing elsewhere, if anywhere
  "anchor": {                           // the thing whose status drives the work; omit when none
    "name": "Sow",
    "statuses": [{ "id": "awaiting", "name": "Awaiting", "screens": ["farrowing.before"] },
                 { "id": "farrowing", "name": "Farrowing", "screens": ["farrowing.count", "..."] },
                 { "id": "finished", "name": "Finished", "screens": ["..."] }],
    "exits": [{ "id": "died", "name": "Died", "screens": ["farrowing.ended"] }],
    "any": ["farrowing.room", "farrowing.history"],          // reachable in any status
    "task": [{ "id": "in-progress", "name": "Task in progress" },
             { "id": "ending", "name": "Ending the task", "screens": ["farrowing.task-ready", "..."] }]
  },
  "groups": [["Several pens", ["feed.bulk"]]],   // only when there is no anchor: named stages
  "entryPoints": [{ "section": "Home", "label": "via Overview", "from": "workbench.today", "control": "View task", "lands": "farrowing.room" }],
  "addsTo": [{ "feature": "pig-profile", "what": "Farrowing actions", "screen": "pig-profile.full", "open": "Actions", "under": "Production", "added": false }],
  "flow": [["farrowing.room", "farrowing.before", "tap an awaiting sow"]],   // from, to, the tap
  "screens": [{
    "id": "farrowing.room",             // <feature>.<screen>; stable; survives moves
    "name": "Room list", "zh": "产房列表",
    "status": "in-design",
    "url": "/ux/system/farrowing-astra-concept.html?layout=focus",   // where it renders today; omit for a placeholder
    "preset": "room",                   // the prototype's scenario value that shows it, if any
    "steps": ["Task overview", { "tap": "Finish", "hold": 900 }],   // taps to replay after the preset, for a screen no scenario opens (below)
    "figma": "",                        // never shown in the atlas; for research only
    "notes": {
      "purpose": "one sentence: what the screen is for",
      "states": ["each state the screen can be in"],
      "elements": [{ "name": "Sow row", "shows": "the sow's line in the room", "states": [{ "state": "Active", "when": "farrowing, not locked", "shows": "n alive · n dead, time since last record, who, Active badge" }], "logic": "", "rule": "", "source": "" }],   // see the rule below
      "controls": [{ "control": "A sow row", "does": "opens her record", "goesTo": "farrowing.before | farrowing.count | farrowing.locked by her status" }],
      "copy": ["string ids from ux/laws/strings.json, or literal text marked (raw) when the screen does not use the registry yet"],
      "edge": ["edge cases the screen must handle"],
      "rules": ["PRD rules this screen applies, quoted short"],
      "issues": ["what is wrong or unclear on the screen today — duplicated information, unclear labels, missing states; never fixed here, only recorded"]
    }
  }]
}
```

Rules the generator checks: ids unique across all features; every id in `anchor`, `groups`, `flow`, `entryPoints.lands` is one of the feature's screens; every `entryPoints.from` and `addsTo.screen` is a screen of some feature (or `null` for the app's start); a screen sits in exactly one anchor status, exit, `any` or task band; `url` and `placeholder` exclude each other.

## `steps`: screens only a tap reaches

When no scenario of the prototype opens a screen, give it the `url`/`preset` of the nearest state it can start from, and `steps`: an ordered list of taps `atlas-bare.js` replays inside the phone (after the preset, waiting for the phone to settle between taps) before it renders and posts `{atlasReady}`. A step is the control's visible text, its `aria-label` / `title`, or a CSS selector (starts with `[`, `.` or `#`); `{ "tap": "...", "hold": ms }` presses and holds for hold-to-commit buttons. A screen with `url` may have `steps`; a step that finds nothing logs an error and is skipped. Keep paths short, and use text over selectors so they survive restyling.

## Screen notes: what earns a note (owner, 2026-10-09)

**The live demo is the spec.** Notes cover only what clicking through the demo cannot show. The PRD (`PRD.md`) is the feature's why, rules and scope; notes never repeat it.

An element gets a note only when it has at least one of:
1. **States the demo can't present all of**: every variant of a data-driven element (a sow row awaiting / active / done / died; empty, offline, error, overflow). Give `states`: `[{ "state", "when", "shows" }]`.
2. **Hidden logic**: how a value, colour or label is computed and over what scope (`logic`, `source`).
3. **An interaction rule the UI can't show**: a hold duration, what is saved and when, what blocks an action and why (`rule`).
4. An **edge case** the demo has no data for (screen-level `edge`).

Never annotated: static labels and headings, the app bar and back, the phone's status bar, standard buttons whose only job is to navigate, anything the screenshot already makes obvious. `controls` lists only taps whose result the demo can't show (a block, a save, a hold); ordinary navigation is the flow's arrows and the demo itself.

Element shape: `{ "name", "at"?, "shows", "states"?: [{ "state", "when", "shows" }], "logic"?, "rule"?, "source"? }` — at least one of `states`, `logic`, `rule`. `at` is text visible inside the element on that screen (a string or list); the atlas finds the element by it first (smallest visible element with that text, then its nearest card/row/button) and falls back to `shows` / `name`. An `at` that starts with `[`, `.` or `#` is a CSS selector inside the screen (for icon-only controls, e.g. `[aria-label="Filter"]`); otherwise it is visible text, then an `aria-label` / `title` equal to it. Aim for under ~8 elements per screen; a screen that needs more is a sign the screen itself is overloaded (record that in `issues`).

## Sections: patterns

A section in `sections/sections.json` may list `patterns: [{ "name", "screens": [screen ids], "note" }]`: a way of building screens that several features share (Tasks: the task skeleton). Every screen id must exist. The board shows them under the section title; a pattern page shows the listed screens as live phones.

A pattern's states are drawn like a component variant's: `sections/<section-id>/patterns/<pattern-id>/variants.json` (`[{ id, name, use, notUse, states }]`, pattern-id = the slugified pattern name) and `variants/<id>.html` (top-level elements carrying `data-state`, see Component variants below). Without them the pattern page says the states haven't been drawn and offers the live screens behind a closed "Current view" disclosure.

## Component gate results

`ux/design-system/components/<Name>/gate.json`, written by a component's gate run:
`{ "status": "in-design" | "agent-checked" | "approved", "judged": "<date>", "commit", "model", "scores": { clarity, budget, hierarchy, spacing, broken } (0-10), "lowest", "findings": [{ severity, text, fix }], "variants"?: [{ name, status, scores?, findings? }] }`. Pass mark 8.

## Component variants and their states

A component page has an Overview tab (the README) and one tab per variant. Variant ids come from `ux/design-system/components/<Name>/variants.json` when the component pass writes one — `[{ "id", "name", "use", "notUse", "states": ["Default", "Pressed", ...] }]` — else from the slugified `variants[].name` of its `gate.json`. The selected tab is the URL's `&variant=<id>`.

A variant's states are drawn in `ux/design-system/components/<Name>/variants/<variant-id>.html`: a small document whose top-level elements carry `data-state="<State name>"`. The atlas renders each `[data-state]` element in its own labelled cell at phone width (it injects `tokens.css`, `bundle.css` and `bundle.js` as the single preview does, keeps the document's own `<style>` and `<link>`s, and any `<script>` outside the state elements; each cell holds only its own state element, so scripts must tolerate the others being absent). A variant without that file shows "This variant's states haven't been drawn yet" and the old whole preview behind a closed "Current preview" disclosure.

## Backlog

`review/*.json` (an array of items per file) holds what review sweeps found: `{ id, target: { kind: "screen"|"feature"|"component"|"section", id }, kind: "decision"|"design"|"broken"|"unclear", severity: "high"|"medium"|"low", title, detail, options?, recommendation?, source }`. The generator also turns every component `gate.json` finding into an item (`source: "gate"`; `broken` when its text is about overflow, targets, a state not working or errors, else `design`) and every `proposals[]` entry into a `decision`. All of it is `atlas.json`'s `backlog`. Decisions add to a feature's and screen's "To confirm" count; the other kinds add to its "To-dos".

## Generated `atlas/atlas.json`

`{ "generated", "commit", "backlog": [the items above], "components": [{ name, group, status (gate.json's, else "in-design"; "placeholder" for proposed ones), gate (the gate.json or null), seenIn?, note? }], "platforms": [{ id, name, sections: [{ id, name, zh, shared, features: [<feature.json> + "status" derived from its screens + "prd" (the PRD.md text)] }] }], "oldUi": <references/figma/index.json> }`

Feature status: `placeholder` when every screen is a placeholder; `in-design` when any screen is below agent-checked; `agent-checked` when all are agent-checked or approved; `frozen` when all are approved (and there is at least one).
