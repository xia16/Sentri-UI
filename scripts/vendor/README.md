acorn 8.16.0 (MIT, see acorn.LICENSE), dist/acorn.mjs copied unmodified from the npm package.
Used only by the gate's scripts (scripts/bundle-graph.mjs) to parse the design-system bundle; no page loads it.
Vendored so the gate runs from any checkout without npm install (the scripts use Node built-ins and the global Playwright only).
