# Home tools (desktop console, Home G)

These are the canvas Home boards, saved here on 11 Nov so they're on the repo. On the canvas (https://claude.ai/artifact/3d1Q4z2YMnFwmFBXtaCeMm), Home is its own page. The sources are in `../aifirst/project/`:

| Board | What it is |
|---|---|
| `HomeG.dc.html` | Production, Health and Farm cards side by side. This is the source of truth. |
| `HomeGPane.dc.html` | Home as a single pane, built from Home G by `mkPane.py`. |
| `MainHomeG.dc.html` | The console with Home beside the chat, also built by `mkPane.py`. |
| `HomeUIGuide.dc.html` | The Home UI guide: anatomy, hover, tooltips, colour and type. Built by `mkGuide.py`. |
| `DailyReportSplit.dc.html` | Home shows state; the daily report explains change. |

## After every change to Home G

Run these from `prototypes/aifirst-canvas/aifirst/project/`:

```bash
py -3 -I ../../home-tools/mkPane.py HomeG.dc.html HomeGPane.dc.html Main.dc.html MainHomeG.dc.html
sed -i "s/count: id === 'home' ? 6 : forYouCount,/count: id === 'home' ? 17 : forYouCount,/" MainHomeG.dc.html
```

After the pipeline, re-apply the pane tint: in `MainHomeG.dc.html`, the `<div>` around `<dc-import name="HomeGPane">` needs `background: #F6F7F1`. Without it, a white gap shows below short tabs.

## Look at a board

```bash
PW=<path to node_modules/playwright> node ../../home-tools/shoot.cjs "MainHomeG:wait=1500"
```

This writes a screenshot to `home-tools/shots/`.

Each step is one of:
- a visible text to click;
- `aria=<label>`;
- `hover=<css>`;
- `wait=<ms>`;
- `evalfile=<file.js>`.

Separate boards with commas and steps with colons, so a step can't contain either.

## Not done yet

- **MainHomeG pane tint:** the version here has the tint fix. The canvas still has the version without it.
- **Customer demo:** a separate, wired-up copy of the console lives in `../demo/`.
