**Status: candidate.** Extracted from farrowing's phone (`farrowing-astra-concept.html`, `.phone`) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)). It is not approved.

# TaskPhone

The frame every task page renders in. **Wider than a phone, the page sits in farrowing's 390×844 phone; at phone width it fills the screen.** The owner is only ever shown the framed page (retro 32).

**Anatomy**
- **Stage** (`body.tk-stage`): `app-background` at phone width; wider than 430px it is `ground`, padded `space-section` top and bottom, with the phone centred.
- **Frame** (`.tk-phone`, wider than 430px): `phone-width` × `phone-height` (390 × 844), a 1px `frame-border` edge, `radius-device` (34px) corners, farrowing's two-layer shadow, `overflow: hidden`, `isolation: isolate`. At phone width: `100%` × `100dvh`, no edge, no radius, no shadow.
- **Status bar** (`.tk-statusbar`): `statusbar-height` (42px), padded `14px 24px 5px`, `app-background`, the time at 12px/700 left and the signal and battery glyphs (16px, 6px apart) right. `aria-hidden`: it is device chrome. A drawer's scrim starts under it.
- **Screen** (`.tk-screen`): a flex column filling the rest: the [TaskHeader](../TaskHeader/README.md), one scroller (`.tk-scroll`, `app-background`), and an optional [TaskDock](../TaskDock/README.md).
- **Overlays** are absolute children of the phone, in this order: a [drawer](../Sheet/README.md) (scrim z 2, sheet z 3), a [record page](../Sheet/README.md) (z 5), a [dialog](../Sheet/README.md) (z 8). The screen under an open overlay is `inert`.

**States**
- Default: framed or full-bleed, by the window's width only (`@media (min-width: 431px)`).
- Pressed, disabled, focus, error, loading, empty: none. The phone is a container.

**Component contract**
- **Props:** `SentriTask.phone(inner, { label, bar = true, id })` → `<main class="tk-phone inspection-phone" data-ds="TaskPhone" data-st-context="page">`. `SentriTask.screen({ header, body, dock, inert, label })`. `SentriTask.statusbar({ time })`.
- **Events:** none.
- **Slots:** `inner` (a screen plus overlays); `header`, `body`, `dock` of the screen.
- **Ids:** `id` on the root.
- **Host:** put the phone straight in `<body class="tk-stage">`. The phone carries `inspection-phone`, so the lint's `screen_root` finds it and the bundle's cards (Button, Stepper, Status…) render as on every other screen.
- **Port note (Vue / React Native):** the frame and status bar are prototype chrome only. A native app has the device's own status bar; the screen, overlays and their z order are the contract.

**Don'ts**
- Don't present a task page stretched to a desktop window. Wider than a phone, it is framed.
- Don't put a second scroller in the screen. The scroll region is `.tk-scroll`; drawers and pages scroll their own body.
- Don't leave the screen interactive under an overlay: mark it `inert`.

**Strings**
- `tk.statusbar.time` (`9:41`).
