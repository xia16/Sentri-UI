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
    { "name": "pp-litter-litter", "url": "ux/tasks/piglet-processing/litter.html?state=litter", "strict": true },
    { "name": "pp-litter-litter-partial", "url": "ux/tasks/piglet-processing/litter.html?state=litter-partial", "strict": true },
    { "name": "pp-litter-litter-short-count", "url": "ux/tasks/piglet-processing/litter.html?state=litter-short-count", "strict": true },
    { "name": "pp-litter-litter-short-saved", "url": "ux/tasks/piglet-processing/litter.html?state=litter-short-saved", "strict": true },
    { "name": "pp-litter-castrate", "url": "ux/tasks/piglet-processing/litter.html?state=castrate", "strict": true },
    { "name": "pp-litter-castrate-saved", "url": "ux/tasks/piglet-processing/litter.html?state=castrate-saved", "strict": true },
    { "name": "pp-litter-done-by-other", "url": "ux/tasks/piglet-processing/litter.html?state=done-by-other", "strict": true },
    { "name": "pp-litter-early", "url": "ux/tasks/piglet-processing/litter.html?state=early", "strict": true },
    { "name": "pp-litter-late", "url": "ux/tasks/piglet-processing/litter.html?state=late", "strict": true },
    { "name": "pp-litter-missed", "url": "ux/tasks/piglet-processing/litter.html?state=missed", "strict": true },
    { "name": "pp-litter-double-flag", "url": "ux/tasks/piglet-processing/litter.html?state=double-flag", "strict": true },
    { "name": "pp-litter-all-done", "url": "ux/tasks/piglet-processing/litter.html?state=all-done", "strict": true },
    { "name": "ds-field-cards", "url": "ux/design-system/components/field-cards-demo.html", "strict": true }
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
