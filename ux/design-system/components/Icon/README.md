# Icon

The shared glyph registry adds recognition to a visible word. Use Status for a verdict or IconButton for an icon-only action instead.

## When to use

Use beside labels in rows, headings, verbs and controls. Every screen draws from `SentriIcons`, exported alongside `SentriUI` by bundle.js.

## When not to use

Use the word alone when a glyph adds no recognition. Use Status for state; never use an icon's colour as the only signal.

## Anatomy

An aria-hidden SVG on a 24-unit viewBox containing one open-stroke path. More is the deliberate exception: three filled dots of radius 1.5. Size and colour inherit from the host.

## Variants

- **Standard:** use for labelled navigation and content; icon-stroke (1.6), normally at glyph sizes 14–20.
- **Key:** use plus/minus in Stepper keys; icon-key-stroke (2.2). Backspace in Numpad retains 1.8. These are host presentations of the same glyphs.

## States

| State | Rendering |
| --- | --- |
| Default | Registry glyph |
| Unknown | Empty SVG and `console.warn`; never a navigation affordance |
| Pressed, active, disabled, focus, error, loading | Host control owns these states |

## Behaviour / API

`SentriIcons.icon(name)` returns SVG markup. `SentriIcons.paths` is the canonical enumerable registry; derive the glyph count with `Object.keys(SentriIcons.paths).length`, as the preview does. Names are properties, not variants.

Compatibility aliases are non-enumerable: origin → place, arrow → chevron, condition → plus. Condition was a longer plus cross; use plus for that glyph. Aliases continue to resolve for existing callers without adding another glyph to the catalogue. Grid has four separate squares. Unknown names warn in every environment.

## Content rules

One lowercase name per glyph; no translated glyph keys. Labels follow their host's length and sentence-case rules. SVG contains no copy to truncate; Chinese labels remain visible beside it. Never add a screen-local path or use emoji for a verb.

## Accessibility

SVG is `aria-hidden="true"` and `focusable="false"`; the visible label or host aria-label provides the accessible name. No role, keyboard handler or tap target belongs to Icon. IconButton supplies a tap-min square target and visible keyboard focus; Stepper and Numpad supply their key semantics.

## Tokens

`icon-stroke`, `icon-key-stroke`, `icon-pad-stroke`, `glyph-key`, `glyph-key-hero`, `glyph-pad`, and the host's glyph size and text colour tokens. Check trails retain their documented heavier stroke.

## Do / don't

Do use one glyph consistently for one recognised job. Don't turn a misspelt name into a chevron. Don't hide the word on a verb tile.

## Related components

[IconButton](../IconButton/README.md), [Heading](../Heading/README.md), [Row](../Row/README.md), [Status](../Status/README.md), [Stepper](../Stepper/README.md), [Numpad](../Numpad/README.md).

## Classification

Component with standard and key host presentations; names are content properties.

## Changelog

2026-10-10: canonical aliases, empty unknown glyph, corrected grid, visible filled More dots and token stroke; retired prototype registries.
