# RangeSlider

Pick a from–to range of whole steps with two round handles on one track: Farrowing's expected-farrowing range (7+ days ago to in 7+ days). It sits in a [FilterSheet](../FilterSheet/README.md) section and does not record a farm fact.

`SentriUI.rangeSlider({ min, max, step, value: [from, to], title, icon, key, names, labels, format, summary, ends })`

## When to use / when not

- **Use** for a bounded range where "any" is the whole track: a due window, a weight band.
- **Not** for one value (use Stepper or Measure) or a choice from a few named options (use Segment).

## Anatomy

1. **Title** (optional): a section Heading with its icon.
2. **Value line**: the current range in words. The whole track reads "Any time".
3. **Track**: two round handles centred on a 4px rail; the span between them is filled green.
4. **End labels**: left, middle and right ("7+ days ago · Today · In 7+ days").

## Variants

- [Range](variants/range.html): the one slider.

## States

| State | Appearance and behaviour |
|---|---|
| Default | Handles at both ends; the value line says the open phrase. |
| Narrowed | Handles moved in; the fill sits between them and the value line names both ends. |
| Same value | Both handles on one step; the value line names it once. |
| Long / Chinese | The value line wraps; the track keeps its size. |

There is no designed pressed state: the handle follows the finger. Handles never cross; a handle pushed past the other carries it along.

## Behaviour

A touch anywhere on the 48px-tall rail moves the nearest handle, and a drag keeps hold of it, so the 32px handle is never the target. When both handles share a step, the next touch picks the side it lands on. Each change updates the fill, the value line and the handle's spoken value, then fires `sentri-range-change` with `{ key, values: { from, to } }`; the host reads that and re-counts its list.

## Content rules

The value line is the range in plain words, never raw numbers alone. End labels are short nouns or phrases; the middle label names the neutral point. `format(n)` supplies one value's words (also each handle's spoken value); `summary(from, to)` supplies the whole line.

## Accessibility

Two native range inputs, each with its own `aria-label` and `aria-valuetext`, so arrow keys, Home and End work with a screen reader. The touch rail is 48px tall (`tap-min`).

## API and tokens

Uses range-fill, range-handle, shadow-handle, line, paper, muted, tap-min, size-4, size-14, size-20, size-22, space-7, space-14, space-16, space-17, space-32, radius-4, border-width, type-choice-meta-size and type-range-end-size.

## Related components

FilterSheet holds it. Stepper and Measure set one value. Segment picks among named options.

## Classification

Component: generic, used across sections.

## Changelog

2026-10-10: distilled from the Farrowing room filter; the look is unchanged, the colours are tokens, and the gesture moved from the screen into the bundle.
