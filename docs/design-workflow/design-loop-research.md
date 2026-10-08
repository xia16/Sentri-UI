# Design loop research

2026-09-28

The design loop will be an autonomous agent loop that produces HTML prototypes
as developer handoff for a mobile farm-operations app. This note looks at what
other teams and researchers do about five problems:

- keeping UI copy consistent
- keeping screens visually consistent
- keeping generated UI inside a design system
- covering scenarios and edge cases
- running critique loops

Each claim cites its source inline. Some claims rest only on a search snippet
or a secondary summary, and those are marked **unverified**.

## Top lessons

1. **Deterministic checks catch what vision models miss.** Every published
   loop that works pairs rules with model judgement, not judgement alone.
   - Rules check tokens, geometry, overlap and a11y.
   - Model judgement covers semantics, grouping and copy.
   - Vision models localise poorly: UICrit baselines got near-zero IoU
     ([UICrit](https://arxiv.org/html/2407.08850v2)).
   - They also struggle with precise alignment
     ([SheetDesigner](https://arxiv.org/pdf/2509.07473);
     [CANVAS](https://arxiv.org/pdf/2511.20737)).
2. **Serve the design system to the agent on demand, as structured data.**
   - Atlassian measured its MCP against a one-file DESIGN.md. The one file cost
     about 92% more tokens, and to fit it Atlassian cut the usage guidance for
     50+ components
     ([Atlassian DESIGN.md](https://www.atlassian.com/blog/how-we-build/atlassians-design-md-is-here-what-we-learned-testing-portable-design-context-in-practice)).
   - Figma says many short guideline files beat a few long ones
     ([Figma guidelines](https://help.figma.com/hc/articles/43602393097239)).
3. **Put the linter inside the agent's loop, not after it.**
   - Primer's MCP ships a `lint_css` tool
     ([Primer MCP](https://primer.style/product/getting-started/foundations/mcp/)).
   - Storybook's `test-run` returns a11y failures to the agent so it can fix
     and re-run
     ([Storybook MCP](https://storybook.js.org/docs/ai/mcp/overview)).
   - A survey of 165 techniques puts the "validation loop" first, with 31
     entries ([State of AI in DS](https://state-of-ai-in-design-systems.netlify.app/techniques)).
4. **Content design systems define a small verb set, and each verb means one
   thing.**
   - Carbon avoids "Done" and "Submit" as vague, and uses Save, Close and
     Cancel with distinct meanings
     ([Carbon action labels](https://carbondesignsystem.com/guidelines/content/action-labels/)).
   - NN/g separates Cancel (discard) from Close (keep)
     ([NN/g](https://www.nngroup.com/articles/cancel-vs-close/)).
   - Ant Design requires an action's name to match the title of the page it
     opens ([Ant Design copywriting](https://ant.design/docs/spec/copywriting/)).
5. **LLM critique helps but decays.**
   - GPT-4 feedback on mockups "decreased in utility over iterations"
     ([Duan et al., CHI '24](https://arxiv.org/abs/2403.13139)).
   - Judges prefer their own outputs
     ([Panickssery et al.](https://arxiv.org/abs/2404.13076)).
   - In one software-design study, a cross-model reviewer came second of 12
     setups ([arXiv 2606.01490](https://arxiv.org/abs/2606.01490)).
   - What helps: few-shot examples, coordinate overlays, and chaining "what is
     wrong" before "where"
     ([UICrit](https://arxiv.org/html/2407.08850v2)).
6. **Scenario coverage is a list of states per screen, plus simulated users.**
   - The fixed state list is ideal, empty, loading, error and partial. The
     Australian Agriculture Design System gives each state required content
     ([Agriculture DS](https://design-system.agriculture.gov.au/patterns/loading-error-empty-states)).
   - Persona-driven browser agents
     ([UXAgent](https://arxiv.org/abs/2502.12561)) find flow problems, but
     their realism is contested.

## Copy

- **Verb set with defined meanings (Carbon).**
  - Carbon defines what each action label means: Save saves without closing,
    and Close dismisses a view.
  - It advises against "Done" as vague and against "Submit" as generic, and
    uses OK only when no specific label fits
    ([Carbon action labels](https://carbondesignsystem.com/guidelines/content/action-labels/)).
  - **Partly unverified:** the full page did not render through the fetch
    tool, so these points come from Carbon-domain search snippets.
- **Cancel vs Close (NN/g).**
  - Close dismisses a view and keeps the work. Cancel abandons the process and
    discards it.
  - NN/g prefers text labels to a bare X, and wants a confirmation before a
    destructive cancel. Its maxim is "When in doubt, save, then out"
    ([NN/g](https://www.nngroup.com/articles/cancel-vs-close/)).
  - For multi-step flows, a Back step does not undo actions already committed,
    so offer Cancel ([NN/g search snippet, unverified](https://www.nngroup.com/articles/reset-and-cancel-buttons/)).
- **Consistency rules.**
  - Primer: the same label for the same action, and never the same visible
    label for different actions. One primary button per page where possible,
    placed at the end of the group
    ([Primer Button](https://primer.style/product/components/button/guidelines/)).
  - Material: refer to an action with the same language throughout
    ([Material writing, **unverified** — page did not render](https://m2.material.io/design/communication/writing.html)).
  - Ant Design:
    - an operation's name matches the title of the page it leads to
    - the same word describes the same thing
    - no periods on labels, titles and tooltips
    - a space between Chinese characters and Latin text or digits
    ([Ant Design copywriting](https://ant.design/docs/spec/copywriting/)).

    This is directly relevant to the zh output.
  - GOV.UK: "Save and continue" only when research shows users need
    reassurance that data is saved
    ([GOV.UK Button](https://design-system.service.gov.uk/components/button/),
    via search snippet).
  - Polaris: lead with a strong verb, and drop filler verbs like "View" or
    "Go" ([Polaris actionable language](https://polaris.shopify.com/content/actionable-language),
    now redirecting to shopify.dev; from a search snippet).
- **Terminology linting (Vale).**
  - Vale's `substitution` rule maps banned terms to preferred ones, with the
    message "Use '%s' instead of '%s'"
    ([Vale docs](https://vale.sh/docs)).
  - Datadog runs Vale on every PR through a GitHub Action, with rules kept in
    one shared repository
    ([Datadog blog](https://www.datadoghq.com/blog/engineering/how-we-use-vale-to-improve-our-documentation-editing-process/)).
    Their limits: false alerts on shortcodes needed exclusion patterns, and
    tuning the rules is ongoing.
  - GitLab makes Vale a required docs check
    ([GitLab](https://docs.gitlab.com/development/documentation/testing/vale)).
  - No source found that runs Vale on a UI string registry rather than on
    docs. The plan would be new ground here, though the mechanism carries over.
- **No literal strings.** `eslint-plugin-i18next/no-literal-string` flags any
  user-visible literal that does not go through `t()`
  ([rule doc](https://github.com/edvardchen/eslint-plugin-i18next/blob/main/docs/rules/no-literal-string.md)).
  This is how a string registry is kept the only source of copy.
- **Glossary QA on translations.** Crowdin's "consistent terminology" check
  covers Chinese Simplified. It flags a translation that skips the glossary
  term or uses one marked not recommended. Crowdin also has per-string length
  limits, placeholder mismatch and punctuation mismatch checks
  ([Crowdin QA checks](https://support.crowdin.com/project-settings/qa-checks/)).
- **Pseudolocalization.**
  - Microsoft's method:
    - expand strings by about 40%, and one- or two-word strings grow
      proportionally more
    - pad with other scripts to expose clipping and font problems
    - wrap each string in delimiters, so truncation and concatenation show
    - tag each string with an ID to trace it back to source
    ([Microsoft Learn](https://learn.microsoft.com/en-us/globalization/methodology/pseudolocalization)).
  - Shrinkage "generally causes fewer issues", so pseudo does not simulate it.
    Chinese is usually shorter than English, but needs a CJK font check.

## Visual consistency

- **Cross-screen consistency is a known weak spot.** MobileForge is the first
  benchmark for multi-screen mobile app generation. It finds that navigation
  mostly compiles, but "interactive navigation remains unreliable". Visual
  fidelity and maintainability also lag
  ([MobileForge, arXiv 2607.28645](https://arxiv.org/abs/2607.28645)).
- **Where VLMs fail at geometry.** CANVAS reports these failures when VLMs
  design through tools
  ([CANVAS](https://arxiv.org/pdf/2511.20737)):
  - wrong counts and spatial arrangement
  - auto-layout adjustments that push components past the viewport
  - text dimensions inferred wrongly, which causes overflow and breaks
    alignment
- **Rules plus vision beats either alone.** SheetDesigner states that MLLMs
  are good at overlap and balance perception but "struggle with precise
  spatial alignment". It pairs rule-based reflection with vision-based
  reflection ([SheetDesigner](https://arxiv.org/pdf/2509.07473)). The
  ablation percentages reported by the fetch tool are **unverified**.
- **Viewing screens side by side.** A practitioner guide recommends a grid of
  frames per state, so that inconsistency shows
  ([EULE Institute, low trust](https://euleinstitute.com/en/blog/design-states/)).
  It is a manual technique, but it maps to a contact-sheet render of every
  URL-addressable state.

## Design-system adherence

- **How teams hand the design system to agents.**
  - *Figma MCP + Code Connect.* Figma components map to code components. The
    "Instructions for MCP" field carries per-component usage, props and a11y
    notes into the agent's context
    ([Figma Code Connect](https://developers.figma.com/docs/figma-mcp-server/code-connect-integration/)).
    Figma's custom rules advise:
    - always use components from a named path
    - no hardcoded values, only tokens
    - a named layout primitive and styling approach
    ([Figma custom rules](https://developers.figma.com/docs/figma-mcp-server/add-custom-rules/)).
  - *Figma Make guidelines.* A `guidelines/` folder with `Guidelines.md`
    read first, then `components/` and `foundations/` subfolders. Figma's
    advice:
    - "Many short files … are better than a small number of lengthy guidelines"
    - imperative rules rather than soft ones
    - decision trees ("which button variant?")
    - closed lists of valid variants ("nothing else")
    ([Figma guidelines](https://help.figma.com/hc/articles/43602393097239)).
  - *Storybook manifests + MCP.*
    - A components manifest holds props, descriptions and examples, and the
      `!manifest` tag excludes noise from it.
    - Stories should show "one concept" and say why
      ([Storybook best practices](https://storybook.js.org/docs/ai/best-practices)).
    - The MCP exposes `docs-list`, `docs-show` and `test-run`, and is in
      preview ([Storybook MCP](https://storybook.js.org/docs/ai/mcp/overview)).
  - *shadcn registry + MCP.* All registries share one schema, and the MCP
    lets an agent browse, search and install items
    ([shadcn MCP](https://ui.shadcn.com/docs/mcp)).
  - *v0 design system skill.* It holds:
    - a starter app with providers, theme and fonts
    - guidance on which components, props and tokens are safe to use
    - links to source

    "If a component, prop, or token cannot be verified from the sources, v0
    should not use it"
    ([v0 Design Systems 2.0](https://v0.app/docs/design-systems-2)).
  - *Atlassian.*
    - Structured TypeScript schemas cover components, tokens, lint rules and
      content standards. They generate the MCP content, the skill and a
      DESIGN.md.
    - A split `llms.txt` points to `llms-components`, `-tokens`, `-content`
      and `-a11y` files
      ([Atlassian llms.txt](https://atlassian.design/llms.txt)).
    - Reported results against no MCP: 4.9% more accurate code (up to 52% on
      specific queries), 11% fewer errors, 34% faster, 16% fewer tokens
      ([Atlassian blog](https://www.atlassian.com/blog/ai-at-work/teaching-ai-to-speak-our-design-language)).
      A second post quotes only the 52% figure
      ([context engine](https://www.atlassian.com/blog/ai-at-work/atlassian-design-system-building-the-context-engine-for-the-ai-era)),
      so read the headline number with care.
    - A CLI beat the MCP: 8% faster, 8% fewer tokens, and 60% higher adoption
      by agents. The team's advice is "Judge the whole task, not only the
      payload" and to read the transcripts
      ([Atlassian CLI](https://www.atlassian.com/blog/ai-at-work/giving-ai-agents-design-system-context-from-the-terminal-what-we-learned-building-a-cli)).
  - *DESIGN.md (Google Stitch's format).* Atlassian found it loads everything
    at once and nudges agents to rebuild components instead of reusing them.
    It is best for prototyping outside the real stack
    ([Atlassian DESIGN.md](https://www.atlassian.com/blog/how-we-build/atlassians-design-md-is-here-what-we-learned-testing-portable-design-context-in-practice)).
  - *Primer.* Primer's MCP includes `find_tokens`, pattern guidance,
    `lint_css` and `review_alt_text`
    ([Primer MCP](https://primer.style/product/getting-started/foundations/mcp/)).
    Per a search snippet, Primer's own agents may only open issues, never
    merge (**unverified**).
- **Token-only enforcement.**
  - `@atlaskit/design-system/ensure-design-token-usage` is set per domain
    (`color`, `spacing`, …), with siblings `no-unsafe-…` and
    `no-deprecated-design-token-usage`
    ([Atlassian ESLint](https://atlassian.design/components/eslint-plugin-design-system/ensure-design-token-usage/)).
  - Primer's stylelint rules `primer/colors`, `primer/spacing`,
    `primer/typography`, `primer/borders` and `primer/box-shadow` require
    variables ([primer/stylelint-config](https://github.com/primer/stylelint-config)).
  - `stylelint-declaration-strict-value` requires a variable, function or
    keyword for the properties you list
    ([repo](https://github.com/AndyOGo/stylelint-declaration-strict-value)).
  - Figma "Check designs" flags hard-coded colour, text, radius and spacing
    and suggests the variable. It uses a custom model, not an LLM, and works
    better when primitives are hidden and variables scoped
    ([Figma Help](https://help.figma.com/hc/en-us/articles/39592284074263-Check-designs-in-Figma)).
- **Token format.** The DTCG format reached its first stable version (2025.10)
  on 2025-10-28. Each token has a required `$value` and an optional `$type`,
  and the format supports aliases and theming
  ([W3C DTCG](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)).
- **Taste guidance vs a design system.** Anthropic's frontend-design skill is
  about 400 tokens aimed at "distributional convergence", the model's pull
  towards generic output. It steers typography, colour and motion away from
  defaults, and suggests teams adapt it into their own design system
  ([Claude blog](https://claude.com/blog/improving-frontend-design-through-skills)).
  For a system with fixed tokens, the lesson is its altitude: rules that are
  neither hex codes nor vague.
- **Survey of techniques.** Kaelig Deloumeau-Prigent catalogued 165
  "coercion techniques" across design systems. Examples:
  - validation loops (Ant Design's mandatory post-edit lint; Fluent's
    per-component Storybook + Playwright screenshots)
  - prohibitions (USWDS "absolute prohibition on inventing UI")
  - tool-gating (Carbon: "The MCP index is the authoritative source — not
    your weights")
  - token-first styling with a narrow escape hatch (Chakra)

  ([State of AI in DS](https://state-of-ai-in-design-systems.netlify.app/techniques)).
  This is a practitioner compilation: good for pointers, and each item should
  be verified at its source.

## Rendered-UI checks

- **Playwright screenshots.**
  - `toHaveScreenshot` needs a baseline per browser and platform because of
    font and rendering differences
    ([Playwright docs](https://playwright.dev/docs/test-snapshots)).
  - Guides from secondary sources say to pin fonts, wait for
    `document.fonts.ready`, freeze animations and run in the official Docker
    image
    ([secondary summary](https://bug0.com/knowledge-base/playwright-visual-regression-testing)).
- **axe in Playwright.** `@axe-core/playwright` catches contrast, missing
  labels and duplicate IDs
  ([Playwright a11y docs](https://playwright.dev/docs/accessibility-testing)).
  It catches only part of WCAG, "up to 50%" per secondary guides
  (**unverified** at the primary). It cannot test focus management.
- **Geometry and layout oracles.**
  - Galen Specs asserts relative positions: "aligned horizontally all", near,
    inside. It highlights failures on a screenshot
    ([Galen spec guide](https://galenframework.com/docs/reference-galen-spec-language-guide/)).
  - ReDeCheck renders across many viewport widths and reports five failure
    types: element collision, element protrusion, viewport protrusion,
    small-range and wrapping
    ([ReDeCheck](https://github.com/redecheck/redecheck)).
  - The plan's DOM-geometry lint rebuilds this idea. Collision and protrusion
    are its well-studied core.
- **Story-per-state snapshots.** Chromatic snapshots every story; "Stories
  capture all states" ([Chromatic](https://www.chromatic.com/docs/visual/)).
  This is the same shape as URL-addressable states.
- **AI diff triage.** Percy's Visual Review Agent sorts diffs into "Irregular"
  and "Valid" and compares them with the PR summary. BrowserStack claims 3x
  faster review and 40% of noise filtered, and says "AI may occasionally miss
  or misinterpret changes"
  ([BrowserStack docs](https://www.browserstack.com/docs/app-percy/review-agent/overview)).
- **Self-healing test loop.** Storybook's `test-run` returns interaction and
  a11y failures along with instructions for fixing them. The agent fixes and
  re-runs ([Storybook MCP](https://storybook.js.org/docs/ai/mcp/overview)).
- **Code plus render repair.** DesignRepair turns Material Design into
  component-level and system-level knowledge bases. It checks both the code
  and the Playwright-rendered page, then repairs with RAG, divide and conquer
  ([DesignRepair, ICSE '25](https://arxiv.org/abs/2411.01606)).

## Critique loops and LLM-as-judge

- **UICrit (Google, UIST '24).**
  - 3,059 critiques with bounding boxes on 983 mobile UIs, from 7 designers.
  - Few-shot examples chosen by visual and task similarity lifted comment
    quality from 0.31 to 0.48. Human critiques scored 0.75.
  - Baseline localisation was near-zero IoU. Coordinate or patch-grid
    overlays reached 0.19–0.22.
  - Chaining critique first and localisation second helped.
  - Models missed guidelines such as error prevention
    ([UICrit](https://arxiv.org/html/2407.08850v2);
    [dataset](https://github.com/google-research-datasets/uicrit)).
- **Iterative visual prompting.** This follow-up used Gemini-1.5-pro and
  GPT-4o. It "reduced the gap from human performance by 50%" on one metric
  ([arXiv 2412.16829](https://arxiv.org/abs/2412.16829)).
- **Heuristic evaluation (Duan et al., CHI '24).** A Figma plugin gave GPT-4 a
  UI and written heuristics: Nielsen's 10, CrowdCrit visual principles and
  grouping rules.
  - Useful for "catching subtle errors, improving text".
  - Utility fell over repeated iterations on the same design
    ([arXiv 2403.13139](https://arxiv.org/abs/2403.13139)).
- **MLLM as UI judge.** GPT-4o, Claude and Llama were tested on 30 UIs across
  nine perception factors. They "approximate human preferences on some
  dimensions but diverge on others"
  ([arXiv 2510.08783](https://arxiv.org/abs/2510.08783)). Which factors
  diverge is not in the abstract (**unverified**).
- **UXBench.** Eight frontier models were tested on how actionable their UX
  critiques are. UX judging is "neither saturated nor one dimensional".
  Models trade the lead across surface categories
  ([arXiv 2606.16262](https://arxiv.org/abs/2606.16262)).
  The failure taxonomy the fetch tool gave (vague, generic, hallucinated) is
  **unverified**.
- **Learned scorers.**
  - UIClip scores a screenshot plus a description for quality and relevance.
    It agreed best with 12 designers' rankings
    ([arXiv 2404.12500](https://arxiv.org/abs/2404.12500)).
  - UICoder filtered self-generated UI code with compiler success and CLIP
    scores ([Apple ML](https://machinelearning.apple.com/research/uicoder)).
- **Judge biases.**
  - Position bias, verbosity bias, self-enhancement bias and limited
    reasoning. Strong judges reach over 80% agreement with humans on chat
    ([Zheng et al.](https://arxiv.org/abs/2306.05685)).
  - Self-preference rises linearly with the judge's ability to recognise its
    own output ([Panickssery et al.](https://arxiv.org/abs/2404.13076)).
    This argues for a reviewer from another model family.
- **Multi-agent topologies.** This study is about software design, not UI, so
  it is adjacent evidence.
  - 12 topologies over 520 runs.
  - First place went to a structurally adversarial reviewer that demands a
    complete rewrite. Second was cross-model review.
  - Parallel-merge came last, attributed to "token starvation and the
    Frankenstein effect"
    ([arXiv 2606.01490](https://arxiv.org/abs/2606.01490)).
- **Multi-agent UI generation.** MAxPrototyper uses a theme agent that
  orchestrates component sub-agents. The abstract gives no metrics
  ([arXiv 2405.07131](https://arxiv.org/abs/2405.07131)).

## Scenario coverage

- **State checklist.** The five classic states are ideal, empty, error,
  partial and loading, sometimes with offline and success added
  ([EULE Institute, low trust](https://euleinstitute.com/en/blog/design-states/)).
  The primary source for required content is the Agriculture Design System:
  - Loading: a skeleton with an accessible "Loading" label.
  - Error: icon, heading, specific message, retry button, and an error code
    if available. Do not blame the user.
  - Empty: icon, heading, explanation and an action, worded differently for
    a new user and for a filter with no results.

  ([Agriculture DS](https://design-system.agriculture.gov.au/patterns/loading-error-empty-states)).
- **LLM-generated scenarios add real coverage.** Test cases generated from
  requirements were 87% valid. 15% of the valid ones had not been considered
  by developers ([arXiv 2412.03693](https://arxiv.org/abs/2412.03693)).
- **Simulated users.**
  - UXAgent generates personas and drives the real site through a browser
    connector, with replay and "interview" of the agents
    ([arXiv 2502.12561](https://arxiv.org/abs/2502.12561);
    [repo](https://github.com/neuhai/uxagent)).
  - UX researchers were interested but raised concerns.
  - PerceptUI claims human-level realism, but the abstract gives no numbers
    ([arXiv 2606.05697](https://arxiv.org/abs/2606.05697)).
  - Persona generators tend towards uniformity and miss outliers. One answer
    is to optimise explicitly for coverage along diversity axes
    ([arXiv 2602.03545](https://arxiv.org/html/2602.03545v2)).
- **NN/g on flows.** Confirm destructive actions, and keep work on close
  ([NN/g](https://www.nngroup.com/articles/cancel-vs-close/)). These make
  good scenario probes, for example "user taps Back mid-form".

## Lessons for our loop

| Lesson | Verdict | Note |
|---|---|---|
| Deterministic geometry and token lint in a real browser | **Confirms** | Every working system pairs rules with vision ([SheetDesigner](https://arxiv.org/pdf/2509.07473), [DesignRepair](https://arxiv.org/abs/2411.01606)); VLMs miss alignment ([CANVAS](https://arxiv.org/pdf/2511.20737)). Borrow ReDeCheck's five failure types and test at several viewport widths, not one ([ReDeCheck](https://github.com/redecheck/redecheck)). |
| Per-repo design-system config | **Confirms, changes shape** | Split it into short files with progressive disclosure, closed lists of valid variants, decision trees and imperative rules ([Figma](https://help.figma.com/hc/articles/43602393097239)). Do not load everything at once ([Atlassian DESIGN.md](https://www.atlassian.com/blog/how-we-build/atlassians-design-md-is-here-what-we-learned-testing-portable-design-context-in-practice)). Store tokens as DTCG JSON ([DTCG](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)). |
| Lint runs *inside* the generating agent's loop | **Changes plan** (if lint was planned only as a gate) | Expose the lint as a CLI the generator calls after each edit and reads the output of ([Primer `lint_css`](https://primer.style/product/getting-started/foundations/mcp/), [Storybook `test-run`](https://storybook.js.org/docs/ai/mcp/overview)). Atlassian found a CLI beat an MCP ([Atlassian CLI](https://www.atlassian.com/blog/ai-at-work/giving-ai-agents-design-system-context-from-the-terminal-what-we-learned-building-a-cli)). |
| "Unverifiable ⇒ don't use" rule | **New** | v0's rule: a component or token not found in the config is forbidden, and a new one goes to the design panel ([v0](https://v0.app/docs/design-systems-2)). |
| String registry with a fixed verb set | **Confirms** | Define each verb's meaning, not just the list (Carbon, NN/g). Add Cancel ≠ Close, and avoid Done/Submit unless defined. Require action label = destination title (Ant Design), one primary per screen, primary last (Primer). |
| Enforce registry-only copy | **New** | A lint rule that no visible text node in the rendered DOM lacks a registry ID, the DOM equivalent of `no-literal-string` ([rule](https://github.com/edvardchen/eslint-plugin-i18next/blob/main/docs/rules/no-literal-string.md)). Add a Vale-style `substitution` table for banned synonyms ([Vale](https://vale.sh/docs)). |
| English-first, translated to Chinese | **Confirms, add checks** | A glossary with a consistent-terminology check on zh, plus length and placeholder checks ([Crowdin](https://support.crowdin.com/project-settings/qa-checks/)). Pseudo-locale render: +40% expansion, delimiters and a CJK font ([Microsoft](https://learn.microsoft.com/en-us/globalization/methodology/pseudolocalization)). Ant Design's CJK/Latin spacing and punctuation rules for zh ([Ant Design](https://ant.design/docs/spec/copywriting/)). |
| Single-question review lenses | **Confirms, with limits** | Judges drift over iterations (Duan). Cap lens re-runs, and have lenses report issues with coordinates or element IDs. Chain "what" then "where" and include few-shot examples of real findings ([UICrit](https://arxiv.org/html/2407.08850v2)). Never ask a lens about pixel alignment: that belongs to lint. |
| Cross-model reviewer | **New / confirms collab** | Self-preference bias ([Panickssery](https://arxiv.org/abs/2404.13076)). Cross-model review ranked high ([2606.01490](https://arxiv.org/abs/2606.01490)). Run at least one lens on another model family. |
| Design panels for new components | **Confirms, caution** | No evidence for merged panel output: parallel merge ranked last ([2606.01490](https://arxiv.org/abs/2606.01490)). Have one author, with critics who may demand a rewrite, not a merge of several drafts. |
| Scenario walk-through agents | **Confirms** | LLM scenario generation finds about 15% more cases ([2412.03693](https://arxiv.org/abs/2412.03693)). Also add a *fixed* state checklist per screen (ideal, empty, loading, error, partial, offline) with required content ([Agriculture DS](https://design-system.agriculture.gov.au/patterns/loading-error-empty-states)), so coverage does not depend on the agent's imagination. Persona agents ([UXAgent](https://arxiv.org/abs/2502.12561)) are a later option, not proven. |
| URL-addressable states | **Confirms** | The same shape as story-per-state snapshotting ([Chromatic](https://www.chromatic.com/docs/visual/)). It lets every state be linted, axe-checked and screenshot-diffed. |
| Visual regression across iterations | **New** | Take a `toHaveScreenshot` baseline per state once a state is approved, with pinned fonts, a fixed browser and a Docker image ([Playwright](https://playwright.dev/docs/test-snapshots)). This catches drift that lints do not model. |
| a11y check | **New** (if absent) | Run axe on every state ([Playwright a11y](https://playwright.dev/docs/accessibility-testing)). It covers only part of WCAG and not focus order, so a lens or a scripted check handles focus in modals and sheets. |
| Cross-screen consistency | **New emphasis** | Multi-screen generation is where models are weakest ([MobileForge](https://arxiv.org/abs/2607.28645)). Add a cross-screen lint that checks the same component has the same geometry and tokens on every screen, and the same header/back pattern. Add a contact-sheet render for lenses. |
