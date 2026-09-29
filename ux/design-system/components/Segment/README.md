# Segment

A segmented control that switches a list between states of the same set, called a lens. It filters; it never acts.

Call `SentriUI.segment({ options: [[value, label], …], active, action, ariaLabel })`.

**How it looks**
- A `well` track with a `line` border and `radius-segment`.
- The active button turns `paper` and 500 weight. Every button is at least 44px high.

**What the caller provides**
- Labels that name the animal's state, never a verb: "Open / Mated", "Not in heat / In heat". "To check / Checked" is the one licensed action phrase.
- Order: the working pile first, the finished pile second, and "All" always last.
- An `ariaLabel` naming what the segment filters.

**Rules**
- Four segments at most.
- Copy budget: ≤12 characters per label at three segments, ≤8 at four.
- When space runs out, drop the counts on inactive segments first.
- Never put an ellipsis on a status word.
- Labels are raw HTML, so a count can sit in a `<span>`.

**Strings**
Per option a third element `{ strs: { label }, args: { label: {...} } }`, e.g. `['a', 'All', { strs: { label: 'pp.all' } }]`; the label is wrapped in a `data-str` span. Without it the output is unchanged.
