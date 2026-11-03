# AI-first console canvas: working copy (never merged)

This branch (`aifirst-canvas`) carries the sources of the Claude Design canvas
https://claude.ai/artifact/3d1Q4z2YMnFwmFBXtaCeMm so that build workers can
change them. It is transport, not product: it is never merged into `main`, and
the gate does not apply to it. The driver session copies results back to the
canvas and publishes.

## Layout (paths are kept as the render scripts expect them)

- `aifirst/project/`: every artboard (`*.dc.html`), `canvas.json`, the layout
  engine `layout.engine.js`, `pigs.module.js`, `farms/`, `vendor/three`.
  - `ActLayout3JS.dc.html` is the farm view and its editor: the page these
    tickets change.
  - `L3JS_*.dc.html` are one-line wrappers that open it in a given `start`
    state; `Flow*.dc.html` open the whole console (`Main.dc.html`).
- `aifirst/_inline.cjs`: copies the engine into the page. Run it from
  `aifirst/` after any engine change, then strip carriage returns from the page
  (`s.replace(/\r/g, '')`): the engine file has CRLF line ends, and a page with
  CRs makes the next inline run silently skip.
- `aifirst/_engine-check.mjs`, `aifirst/_equip-check.mjs`: engine checks.
- `render/`: Playwright scripts.
  - `shoot3js_host.cjs "state@960[~step...]"` renders a state; `HOSTLIKE=1`
    blocks the side files like the real host does; every state must render
    under it.
  - `walk_*.cjs <width>`: real-input walks. They print `errors N`, which must
    be 0.
- `artifact-files/.../dc-runtime.js`: the Design canvas runtime the renders use.
- `PLAN.md`: the plan these tickets come from.

## Rules for any change here

- Read the brief, then `PLAN.md`. Product rules: left shows, the bottom bar does;
  nothing piles up; say it once; touch targets ≥ 44 px; inline styles only;
  `{{hole}}` is a dotted lookup, never an expression; handlers come from
  `renderVals()`.
- Edit Layout mode is out of scope unless the brief says otherwise.
- Every state in `ActLayout3JS`'s `start` options must render with no console
  error under `HOSTLIKE=1`, at 960 and 1360 wide.
