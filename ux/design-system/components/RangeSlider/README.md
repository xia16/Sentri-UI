# RangeSlider

Pick a from–to range of whole steps with two round handles on one track: Farrowing's expected-farrowing range (7+ days ago to in 7+ days) and its parity range (0 to 6+). It sits in a [FilterSheet](../FilterSheet/README.md) section and does not record a farm fact.

`SentriUI.rangeSlider({ min, max, step, value: [from, to], title, icon, key, names, labels, format, summary, ends, counts })`

## When to use / when not

- **Use** for a bounded range where "any" is the whole track: a due window, a weight band.
- **Not** for one value (use Stepper or Measure) or a choice from a few named options (use Segment).

## Anatomy

1. **Title row**: a section Heading with its icon, and at its end the chosen span in words (muted), only once the range is narrowed.
2. **Track**: two 28px round handles centred on a 4px rail. Open (the whole track), the rail is quiet (`line`); narrowed, the span between the handles fills green.
3. **Ticks**: a 4px tick under the rail at each step (up to 20 steps), so the stops show.
4. **End labels**: left, middle and right ("7+ days ago · Today · In 7+ days"; "0 · 3 · 6+"), the middle one centred.
5. **Histogram** (optional, `counts`: one number per step): a short bar over each step for how many items sit there, green inside the span, quiet outside it and while the range is open.

## Variants

- [Range](variants/range.html): the one slider.

## States

| State | Appearance and behaviour |
|---|---|
| Open (default) | Handles at both ends, a quiet rail, nothing at the title's end: the end labels say the range. |
| Narrowed | Handles moved in; the fill sits between them and the title row names both ends. |
| Same value | Both handles on one step; the title row names it once. |
| Long / Chinese | The span wraps under the title; the track keeps its size. |

There is no designed pressed state: the handle follows the finger. Handles never cross; a handle pushed past the other carries it along.

## Behaviour

A touch anywhere on the 48px-tall rail moves the nearest handle, and a drag keeps hold of it, so the 28px handle is never the target. When both handles share a step, the next touch picks the side it lands on. Each change updates the fill, the span at the title's end and the handle's spoken value, then fires `sentri-range-change` with `{ key, values: { from, to } }`; the host reads that and re-counts its list.

## Few values in use

The scale never shrinks to the data: parity is always 0 to 6+, the due window always 7+ days ago to in 7+ days, so the handles sit in the same place every day. When few values are in use (every sow at parity 0 or 1), the histogram shows it and the host's live count ("Show 2 sows") confirms it. When every item has one value, or none has a value, the range cannot narrow anything: the host leaves the section out of its FilterSheet, as FilterChips leaves out an empty chip (owner, 2026-11-02).

## Content rules

The span is the range in plain words, never raw numbers alone, and nothing while the range is open. End labels are short nouns or phrases; the middle label names the neutral point. `format(n)` supplies one value's words (also each handle's spoken value); `summary(from, to)` supplies the narrowed span.

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
2026-11-02: refined with the owner (the first version read abrupt: a solid green bar for "any", 32px rings, a gap under the title). Open is a quiet rail with nothing named; the span sits at the end of the title row; 28px handles; a tick per step; the middle end label centred. Parity became a second range in Farrowing's Filter sows.
2026-11-02 (later): `counts` draws a histogram over the rail; a range with one value in use is left out by the host (Farrowing's Filter sows).
