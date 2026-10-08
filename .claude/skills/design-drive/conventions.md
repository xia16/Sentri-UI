# Conventions

What a design repo looks like to this loop. The repo's `docs/agents/design.md`
names the paths; the shapes below are fixed.

## Where things live

The map owns the process, not the files. Deliverables go to the one living
design, filed by what they describe:

- the design system (`tokens.json`, `README.md`, `components/<Name>/`) at the
  config's `design_system`;
- product-wide law: the rulings file, the string registry, the glossary;
- `tasks/<task>/`: its screens, `contract.html`, `scenarios.md`,
  `research/`, `retro.md`;
- ADRs, one decision per file, each linking the map that made it.

A task's files never restyle the design system: a change to a component is
made in the design system, where the lint re-renders every task against it.

## Screens

- **Every state is a URL**: `?state=<name>` plus any fixture, e.g.
  `?state=count-mismatch&data=30-piglets`. An agent opens any state directly,
  without clicking to it.
- **Every visible string carries its registry id**: `data-str="<id>"` on the
  element holding it; the text comes from the registry in the active locale
  (`?lang=zh`).
- **Every component instance carries its name**: `data-ds="<Card>"` on its
  root, matching a card in the design system.
- New task pages are listed in the config's `pages` with `"strict": true`.

## The string registry

```json
{
  "verbs":   { "Record": { "meaning": "commit one observation", "zh": "记录" } },
  "banned":  { "Submit": "every action commits itself; name the act" },
  "strings": { "piglets.record": { "en": "Record {n} piglets", "zh": "记录 {n} 头仔猪", "kind": "action" } }
}
```

`kind: "action"` strings start with a verb from `verbs`. `{placeholders}` match
anything. English is written first; zh is required at handoff.

## Branches, commits, tags

- The map branch `map/<n>-<slug>` is cut from `main`.
- One branch and PR per slice, merged into the map branch by the driver.
- One commit per review round; its message lists the findings applied and
  declined.
- The map branch reaches `main` by one PR the user merges; the merge is
  tagged `design/<slug>/<n>`. The tag is the baseline later rounds render
  against, side by side, in the same run.
- Images are never committed. Every render input is: fonts, fixtures, the
  pinned Playwright in the lint.
