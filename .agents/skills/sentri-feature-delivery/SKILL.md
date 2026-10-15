---
name: sentri-feature-delivery
description: Implement a Sentri-UI feature in the sibling native Android app and feed implementation findings back into Sentri-UI. Use for cross-repo Android feature delivery, design handoff checks, or design-system feedback from real implementation; not for design-only exploration.
---

# Sentri feature delivery

Use the single workflow in `docs/implementation-workflow.md` at the Sentri-UI repo root. Resolve the two sibling repositories from their actual checkout paths; do not assume they share a Git history.

1. Find the feature slug. Read its `features/<slug>/PRD.md` and `feature.json`, then the linked prototype/handoff and only the design-system cards needed for the screen. Inspect status, open decisions and candidate components before treating a state as ready. Record the Sentri-UI commit SHA.
2. Read the Android repo's `AGENTS.md`, README, relevant integration/migration docs and implementation. Map screen IDs and states to native behavior, GraphQL operations, offline/device conditions and verification. Keep this mapping in the feature's Android task record or implementation note.
3. Implement the authorized scope in Compose. Follow the real backend contract and Android platform behavior. When sources disagree, capture the scenario, evidence, affected states and proposed resolution; ask for a product decision only for business semantics or approved global design changes, while continuing independent work.
4. Feed proven findings into the relevant Sentri-UI PRD, `feature.json`, prototype/contract or design-system card. Check other consumers before changing shared components. Keep unresolved questions visible and do not promote a candidate or unfinished design by implication.
5. Run applicable Sentri-UI checks for changed surfaces and the Android verification required by its `AGENTS.md`. Report actual results separately for fake, device, real login and backend, and give the two repos' file changes and remaining decisions.

Use this skill for implementation and feedback. The repository's `.claude/skills/design/` remains the separate design creation workflow.
