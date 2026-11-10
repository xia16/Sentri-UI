# Customer demo: the AI-first console (desktop)

The desktop console as one clickable page, made for the live customer demo on 11 Nov 2026. It is desktop only. The phone app is designed in `ux/` and `features/` on `main`; nothing here touches it.

- **Live page:** https://claude.ai/artifact/VbpiYsRUXufeUdccL8TW67. It is private to the owner's Claude account.
- **Script:** [RUN-OF-SHOW.md](RUN-OF-SHOW.md) has what to click and the exact phrases to type.
- **Design canvas** (separate): https://claude.ai/artifact/3d1Q4z2YMnFwmFBXtaCeMm, with sources in `../aifirst/project/`.

## How it is put together

`site/` is exactly what is published.

| File | What it is |
|---|---|
| `index.html` | The published page. It frames the console at 1440×900, scaled to the window, and connects the chat to Claude. It declares the `sample` capability: a message that isn't a rehearsed phrase goes to Claude with the farm's facts and an `open_page` tool, and the answer streams back into the chat. |
| `Demo.dc.html` | The console: chat, AI team, tabs, Artifacts menu. It began as the canvas board `MainHomeG`. |
| `HomeGPane.dc.html` | Home. Decide, the doors and every tile open pages through `window` event `sentri:tab` `{id, start, wide}`. |
| `ProdSetup.dc.html` | Production setup: one reasoned batch rhythm from the fixed layout. |
| `LateBatch.dc.html` | A batch running late, and the fix with everything it moves. |
| `VaxProgramme.dc.html` | The Vet drafts six vaccination plans one by one; approve each, or all. |
| `Connections.dc.html` | Connected systems; adding accounting shows the fields being matched. |
| `ScheduleDemo.dc.html` | The Schedule grid; a task opens the Farm view with that task (`bt:<batch>/<task>` or `task:<id>`). |
| `Act*.dc.html`, `Treatment.dc.html` | Copies of the canvas's Action pages. `ActLayout3JS` is the Farm view. |
| `support.js` | The Design runtime, set to load React from `vendor/`. |
| `vendor/` | three.js r160 and React 18.3.1, byte-identical to the npm releases, so the demo never depends on a CDN. |

**Rehearsed answers:** `scripted()` in `Demo.dc.html` matches key words, answers at once and opens the page. Anything else goes to Claude live.

## Run it locally

Serve the `site` folder over http, then open `http://localhost:4400/index.html`. The page needs http; it won't load from a file path.

```bash
cd prototypes/aifirst-canvas/demo/site
python -m http.server 4400
```

Locally, the chat answers only the rehearsed phrases. Live answers work only on claude.ai.

## Change it and republish

Edit the files in `site/`, check them locally, then ask Claude Code to publish. For example: "Publish `prototypes/aifirst-canvas/demo/site/index.html` to https://claude.ai/artifact/VbpiYsRUXufeUdccL8TW67, with every other file in `site/` as supporting files at the same paths."

- **Keeps the link.** Publishing to that URL keeps the same link and the chat's permission to use Claude.
- **Slow connection.** Send the files in a few smaller batches; files left out keep their published version.

## Known rough edges

- Older pages say "Fri 30 Oct", while Home and the new pages say 9 to 10 Nov.
- These do nothing: the Finance and Initiatives tiles, composer **+ → Upload a file**, and **Create group**.
