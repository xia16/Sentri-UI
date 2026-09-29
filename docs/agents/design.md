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
  "allow": { "spacing": [2, 4, 6, 8, 20] },
  "reference_tasks": ["farrowing"],
  "pages": [
    { "name": "farrowing", "url": "ux/system/farrowing-astra-concept.html", "locales": ["en"],
      "viewports": [{ "name": "studio", "width": 1440, "height": 900 }] },
    { "name": "inspection", "url": "ux/system/inspection-astra-concept.html", "locales": ["en"],
      "viewports": [{ "name": "studio", "width": 1440, "height": 900 }] },
    { "name": "pp-index", "url": "ux/tasks/piglet-processing/index.html", "strict": true },
    { "name": "pp-edge-no-task", "url": "ux/tasks/piglet-processing/edge.html?state=no-task", "strict": true },
    { "name": "pp-edge-orphan", "url": "ux/tasks/piglet-processing/edge.html?state=orphan", "strict": true },
    { "name": "pp-edge-prelock", "url": "ux/tasks/piglet-processing/edge.html?state=prelock", "strict": true },
    { "name": "pp-edge-birth-weight-missing", "url": "ux/tasks/piglet-processing/edge.html?state=birth-weight-missing", "strict": true },
    { "name": "pp-edge-birth-weight-set", "url": "ux/tasks/piglet-processing/edge.html?state=birth-weight-set", "strict": true }
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
