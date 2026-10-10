# Design workflow

The words for how Sentri's product and UI are designed, checked and handed off in this repo: what the atlas shows, what a status means, and who decides what. Farm terms (Born, Alive, Owed…) live in [the farm glossary](../../ux/laws/glossary.md).

## The atlas

**Atlas**:
The read-only home page that shows every feature and where it stands; only the workflow changes it, through commits.
_Avoid_: Canvas, dashboard, index

**Old UI**:
The product as it is today, in Figma; reference for research, kept on its own page and never part of the atlas.
_Avoid_: Legacy design, Figma atlas

**Platform**:
Mobile or web; the atlas's first switch, each with its own sections, features and design system.

**Section**:
A capability that groups features (Tasks, Inspection, Health & treatments); the only level above a feature.
_Avoid_: Module, area, category

**Section doc**:
A section's generated page: what its features share, and one line per feature.

**Feature**:
A lasting place in the atlas that owns a set of screens; a task is a mobile feature that is farm work.
_Avoid_: Module, page, product area

**Screen**:
One state of the UI a feature owns, with a stable id that survives moves.
_Avoid_: Page, view, frame, state

**Flow**:
A feature's screens drawn as a chart: screens as nodes, arrows for the tap that leads from one to the next.
_Avoid_: Sitemap, feature map, screen map

**Entry point**:
A way into a feature: the source screen in another section or feature, the control on it, and the screen it lands on.
_Avoid_: Way in (on screen only), entrance

**Adds to**:
An addition one feature makes to another feature's screen (farrowing's actions in Pig profile's More actions); owned and documented by the feature that adds it.

**Component**:
A generic control or block that knows nothing about farm data, or anything used by two or more sections; it lives in the platform's design system with its variants, one implementation.
_Avoid_: Widget, element, task part

**Variant**:
A named use case of a component with its own preview, states and status; the same job with a different look is a variant, never a new component.
_Avoid_: Copy, custom version

**Section pattern**:
A recurring arrangement of components inside one section, documented in that section (the Task skeleton, the Home task card).
_Avoid_: Template, layout component

**Feature block**:
Something only one feature uses, documented in that feature's notes; promoted to a component when a second feature or section needs it.

## Status

**Placeholder**:
A screen with nothing designed yet.
_Avoid_: Stub, TODO screen

**In design**:
A screen that is built but has not passed the gates.
_Avoid_: Designed, not gated; concept; draft

**Agent-checked**:
A screen that passed the gates.
_Avoid_: Done, ready, reviewed

**Approved**:
An agent-checked screen with no open to-do and no provisional flag that a human approved in a session, recorded with who, when and which commit.
_Avoid_: Signed off, accepted

**Provisional**:
A flag on a screen that rests on an unanswered decision; it cannot be approved.

**Changed since approval**:
A flag on a screen that was approved and then touched; it is back in design.
_Avoid_: Stale

**Frozen**:
A feature with at least one screen, every one of them approved; it hands off to developers.
_Avoid_: Final, locked, signed off

**Reopened**:
What happens to the touched screens of a frozen feature when anything changes them.

**Touched**:
A screen whose rendering, behaviour, navigation or product rules changed; a screenshot baseline shows only the first, so the others are judged by the gates' walk-throughs and by what the change edited.

**Set**:
A component variant approved with the first feature that froze using it; a component is as ready as its weakest variant.
_Avoid_: Stable, released

**Needs rework**:
A component that failed the gates; a screen may not use it unflagged.

## Work and decisions

**Map**:
A Wayfinder map: a piece of work, which may touch many features; never the picture of a feature.
_Avoid_: Feature map

**Claim**:
Who is working on a feature, taken when its map opens.

**To-do**:
Known work on a screen that agents or the engineer clear; a screen with an open to-do cannot be agent-checked.
_Avoid_: Issue, finding

**Thing to confirm**:
A question on a screen only a human can answer; it goes to the decision queue and makes the screen provisional.
_Avoid_: Open question, TBD

**Decision queue**:
A feature's list of things to confirm, each with the agents' recommendation; only decisions that change what the farm records or what a worker must do.

**Attention budget**:
The step before any layout that decides what a screen shows and how loudly: the facts it could show, the worker's questions in order, an attention level per fact (act now, watch, coming up, settled, audit) and a written cut list.
_Avoid_: Information hierarchy, content audit

**Enhancement**:
A design change that makes an adequate screen, interaction or component clearly better, as opposed to fixing a defect. It's gated like any change: it must beat what it replaces.
_Avoid_: Redesign, polish

**Gate**:
A check a screen must pass before it is agent-checked; code checks, the visual judge and the UX judge.
_Avoid_: Lens, review

**Good example** / **Bad example**:
A screen or component shown to a judge as what passes and what must fail; bad examples include every miss an engineer declared.
_Avoid_: Anchor, calibration set

## Copy

**String**:
A piece of visible text, defined once in the registry with its Chinese, and referenced by id from every screen that shows it.
_Avoid_: Label, raw text, copy (for a single item)

**Shared vocabulary**:
The registry's verbs and terms used across sections, each with one meaning (Back, Close, End task).
