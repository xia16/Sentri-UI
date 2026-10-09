# CategoryFooter

The actions-page footer keeps Back beside navigation to verb categories. Use Sheet footer for Back plus a primary record action instead.

## When to use

Use on Inspection and pig-profile action pages; selecting a category scrolls to its section in the current page.

## When not to use

Use Segment to switch a fixed working lens, FilterChips for dynamic filters, and Sheet footer for submission. CategoryFooter never commits a record.

## Anatomy

Back button, labelled navigation region, category buttons, active underline and the footer's decorative handle. Categories are optional; Back remains when none exist.

## Variants

**Category navigation:** the single variant, used on both action pages. Narrow width, focus and overflow are states, not new variants.

## States

| State | Rendering |
| --- | --- |
| Default | First category current unless active matches a category |
| Active | Current category has bold text, underline and aria-current=location |
| Pressed | Tab has press fill; Back uses its shared Button pressed look |
| Back pressed | Shared Button press fill and transform |
| Scrolled | Last categories reached in the scroll region |
| Focused | Visible inset focus ring on tab; Back uses Button focus |
| Empty | Only Back; no empty categories |
| Five categories at 300px | Stress example scrolls horizontally; every target retains tap-min |
| Long label / Chinese | Full label stays on one line in the scroll region; no truncation |
| Disabled | Unsupported: omit an unavailable or empty category; give its reason in page content if needed |
| Error / loading | Not applicable; synchronous navigation, no input |

## Behaviour / API

`SentriUI.categoryFooter({categories: [{id, label}], active, backAction, categoryAction, label, className, strs, args})` returns the footer. The caller handles category data-action events, scrolls its content and updates active as the viewed section changes. An unknown active id falls back to the first category. There is no disabled option.

The verb-sheet order is **Health · Routine · Production**; omit an empty strip. Production supports single-subject work and is omitted for bulk work where unavailable. Real verb sheets have at most three categories. The five-category fixture tests future overflow resilience; it does not change that law. Labels stay readable via horizontal scrolling and keyboard focus.

## Content rules

One noun, sentence case; prefer at most 12 English characters or 6 Chinese characters. Exceptional longer labels remain complete, never ellipsised. No counts, facts or duplicated page titles. Back is always Back (localized via strs.back).

## Accessibility / keyboard

A nav with an aria-label contains ordinary buttons, not ARIA tabs: these scroll to locations rather than switching tab panels. aria-current=location marks the current section. Tab / Shift+Tab reach each button and scroll it into view; Enter / Space activate it. No swipe-only action. Targets are at least tap-min in both dimensions, with control-height minimum height.

## Tokens

`back-width`, `control-height`, `tap-min`, `space-footer-top`, `space-gutter`, `space-footer-bottom`, `space-16`, `space-8`, `tab-ink`, `tab-ink-active`, `current-marker`, `press`, `focus`, `handle-width`. Under the narrow container breakpoint, padding shrinks but targets do not.

## Do / don't

Do omit empty categories and show full translated words. Don't dim categories or rearrange the canonical order. Don't use a second footer inside this footer.

## Related components

[Sheet](../Sheet/README.md), [Button](../Button/README.md), [Segment](../Segment/README.md), [FilterChips](../FilterChips/README.md).

## Classification

Component with one variant. The host's verb grid and scroll coordination are a section pattern.

## Changelog

2026-10-10: Routine replaces General in the action catalogue; corrected order, removed disabled, added pressed/focus/overflow specimens and semantic footer tokens.
