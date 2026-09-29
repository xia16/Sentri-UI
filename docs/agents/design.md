# Design

How the design loop works in this repo: where the design system lives, how
screens are served, and what the tools check. The block below is read by
the plugin's `design_doctor.py` and `design_lint.mjs`; keep it valid JSON.

```json
{
  "design_system": "ux/design-system",
  "strings": "ux/laws/strings.json",
  "rulings": "ux/research/farrowing/RULINGS.md",
  "glossary": "ux/laws/glossary.md",
  "serve": "node scripts/serve-ux.cjs {port}",
  "port": 4317,
  "base_url": "http://localhost:{port}/",
  "screen_root": ".farrowing-phone, .inspection-phone, .phone",
  "viewports": [
    { "name": "phone", "width": 390, "height": 844 },
    { "name": "narrow", "width": 360, "height": 740 }
  ],
  "locales": ["en", "zh"],
  "locale_param": "lang",
  "allow": { "spacing": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 17, 20], "radius": [2, 4, 6, 8, 9, 11, 13] },
  "reference_tasks": ["farrowing"],
  "pages": [
    { "name": "farrowing", "url": "ux/system/farrowing-astra-concept.html", "locales": ["en"],
      "viewports": [{ "name": "studio", "width": 1440, "height": 900 }] },
    { "name": "inspection", "url": "ux/system/inspection-astra-concept.html", "locales": ["en"],
      "viewports": [{ "name": "studio", "width": 1440, "height": 900 }] },
    { "name": "pp-index", "url": "ux/tasks/piglet-processing/index.html", "strict": true },
    { "name": "ds-field-cards", "url": "ux/design-system/components/field-cards-demo.html", "strict": true },
    { "name": "pp-dead-dead", "url": "ux/tasks/piglet-processing/dead.html?state=dead", "strict": true },
    { "name": "pp-dead-dead-tallied", "url": "ux/tasks/piglet-processing/dead.html?state=dead-tallied", "strict": true },
    { "name": "pp-dead-dead-draft", "url": "ux/tasks/piglet-processing/dead.html?state=dead-draft", "strict": true },
    { "name": "pp-dead-dead-tagged", "url": "ux/tasks/piglet-processing/dead.html?state=dead-tagged", "strict": true },
    { "name": "pp-dead-dead-tagged-picked", "url": "ux/tasks/piglet-processing/dead.html?state=dead-tagged-picked", "strict": true },
    { "name": "pp-dead-dead-open-loss", "url": "ux/tasks/piglet-processing/dead.html?state=dead-open-loss", "strict": true },
    { "name": "pp-dead-dead-open-loss-yes", "url": "ux/tasks/piglet-processing/dead.html?state=dead-open-loss-yes", "strict": true },
    { "name": "pp-dead-dead-open-loss-no", "url": "ux/tasks/piglet-processing/dead.html?state=dead-open-loss-no", "strict": true },
    { "name": "pp-dead-dead-sow", "url": "ux/tasks/piglet-processing/dead.html?state=dead-sow", "strict": true },
    { "name": "pp-dead-farrowing-drawer", "url": "ux/tasks/piglet-processing/dead.html?state=farrowing-drawer", "strict": true },
    { "name": "pp-dead-farrowing-drawer-draft", "url": "ux/tasks/piglet-processing/dead.html?state=farrowing-drawer-draft", "strict": true },
    { "name": "pp-dead-farrowing-drawer-locked", "url": "ux/tasks/piglet-processing/dead.html?state=farrowing-drawer-locked", "strict": true },
    { "name": "pp-dead-dead-draft-sow", "url": "ux/tasks/piglet-processing/dead.html?state=dead-draft-sow", "strict": true },
    { "name": "pp-dead-dead-tagged-nocause", "url": "ux/tasks/piglet-processing/dead.html?state=dead-tagged-nocause", "strict": true },
    { "name": "pp-dead-dead-open-loss-split", "url": "ux/tasks/piglet-processing/dead.html?state=dead-open-loss-split", "strict": true },
    { "name": "pp-dead-dead-saved", "url": "ux/tasks/piglet-processing/dead.html?state=dead-saved", "strict": true },
    { "name": "pp-dead-dead-sow-recorded", "url": "ux/tasks/piglet-processing/dead.html?state=dead-sow-recorded", "strict": true },
    { "name": "pp-room-room", "url": "ux/tasks/piglet-processing/room.html?state=room", "strict": true },
    { "name": "pp-room-room-empty", "url": "ux/tasks/piglet-processing/room.html?state=room-empty", "strict": true },
    { "name": "pp-room-room-all-done", "url": "ux/tasks/piglet-processing/room.html?state=room-all-done", "strict": true },
    { "name": "pp-room-room-overdue", "url": "ux/tasks/piglet-processing/room.html?state=room-overdue", "strict": true },
    { "name": "pp-room-room-drift", "url": "ux/tasks/piglet-processing/room.html?state=room-drift", "strict": true },
    { "name": "pp-room-room-filter", "url": "ux/tasks/piglet-processing/room.html?state=room-filter", "strict": true },
    { "name": "pp-room-room-scan", "url": "ux/tasks/piglet-processing/room.html?state=room-scan", "strict": true },
    { "name": "pp-room-room-scan-none", "url": "ux/tasks/piglet-processing/room.html?state=room-scan-none", "strict": true },
    { "name": "pp-room-room-find", "url": "ux/tasks/piglet-processing/room.html?state=room-find", "strict": true },
    { "name": "pp-room-room-find-many", "url": "ux/tasks/piglet-processing/room.html?state=room-find-many", "strict": true },
    { "name": "pp-room-room-error", "url": "ux/tasks/piglet-processing/room.html?state=room-error", "strict": true },
    { "name": "pp-room-room-finished", "url": "ux/tasks/piglet-processing/room.html?state=room-finished", "strict": true },
    { "name": "pp-room-room-none", "url": "ux/tasks/piglet-processing/room.html?state=room-none", "strict": true },
    { "name": "pp-room-room-scan-unavailable", "url": "ux/tasks/piglet-processing/room.html?state=room-scan-unavailable", "strict": true },
    { "name": "pp-room-room-scan-hit", "url": "ux/tasks/piglet-processing/room.html?state=room-scan-hit", "strict": true }
  ]
}
```

- `pages` lists what the lint renders. Farrowing and inspection are studio
  boards (several phones on one page), so they render at a desk width and
  each phone canvas (`screen_root`) is measured as its own screen. New task
  screens are single URL-addressable states at the phone viewports, and are
  marked `"strict": true` so every string needs a registry id.
- `allow.spacing` holds the small steps the component cards name (rules,
  icon gaps, the sheet body's 20px top) that `tokens.json` does not list yet.
- `allow` also holds **component-owned drift** found by the first slice:
  spacing 3, 5, 7, 9, 10, 17 and radius 2, 4, 6, 8, 9, 11, 13 — every
  off-token value in `bundle.css` (scanned 2026-09-29; e.g. Facts `dt` 5,
  `.field` gap 9, footer gaps 10, `.button` padding 17 / gap 7, Heading
  action radius 6), plus 1 — the browser's default button padding the bundle
  does not reset. They
  come from the bundle, not from any task; a slice must not use them in its
  own CSS. Removing them is design-system cleanup (map #3, *Not yet specified*).
