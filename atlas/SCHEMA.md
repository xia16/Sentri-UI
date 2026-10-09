# Atlas data

The atlas (`atlas/index.html`) reads one generated file, `atlas/atlas.json`. Nobody edits it: `node scripts/build-atlas.mjs` writes it from the sources below and refuses to write it when a source is inconsistent.

Words are the design workflow's ([glossary](../docs/design-workflow/GLOSSARY.md)): atlas, platform, section, feature, screen, flow, entry point, adds to, anchor; statuses `placeholder` · `in-design` · `agent-checked` · `approved`.

## Sources

| Path | Holds |
|---|---|
| `sections/sections.json` | every platform's sections in board order: `{ "platforms": [{ "id", "name", "sections": [{ "id", "name", "zh", "shared": "what the section's features share, one paragraph" }] }] }` |
| `features/<id>/feature.json` | one feature (below) |
| `features/<id>/PRD.md` | the feature's PRD, prose: Problem · Who · Anchor · Rules · Scope · Decisions |
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
    "figma": "",                        // never shown in the atlas; for research only
    "notes": {
      "purpose": "one sentence: what the screen is for",
      "states": ["each state the screen can be in"],
      "elements": [{ "name": "Unit card · Target", "shows": "Target 12", "logic": "when and how it is shown, how it is computed", "source": "where the value comes from" }],
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

## Generated `atlas/atlas.json`

`{ "generated", "commit", "platforms": [{ id, name, sections: [{ id, name, zh, shared, features: [<feature.json> + "status" derived from its screens + "prd" (the PRD.md text)] }] }], "oldUi": <references/figma/index.json> }`

Feature status: `placeholder` when every screen is a placeholder; `in-design` when any screen is below agent-checked; `agent-checked` when all are agent-checked or approved; `frozen` when all are approved (and there is at least one).
