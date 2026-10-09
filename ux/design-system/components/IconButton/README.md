# IconButton

IconButton performs one familiar, recognisable icon action. Use [Button](../Button/README.md) instead for a farm act that needs a visible verb.

## When to use

Use for header returns, sheet Close, Search, Filter, Scan and familiar More tools. Keep at most three tools in a toolbar; avoid duplicating a labelled action nearby.

## When not to use

Use [Button](../Button/README.md) for Record, Move or Set count. Use [ChoiceList](../ChoiceList/README.md) for choosing a farm outcome; an icon must never be the only explanation of that outcome.

## Anatomy

48 × 48 container; registry glyph (decorative to assistive technology); accessible label; optional count badge; optional selected check; optional persistent reason line outside the target.

## Variants

| Variant | Use | API |
| --- | --- | --- |
| [Bordered](variants/bordered.html) | Header returns and toolbar search, filter or scan. | `iconButton({variant:"bordered"})` |
| [Plain](variants/plain.html) | Sheet close, more actions or a breeder mark. | `iconButton({variant:"plain"})` |

## States

| State | Appearance and response |
| --- | --- |
| Default | Label or glyph at rest. |
| Pressed | Visible press fill / darkening and movement; static examples use `data-preview="pressed"`. |
| Focus | Token focus ring; static `data-preview="focus"`. |
| Disabled | Persistent text reason via `reason` or `describedby`; never colour alone. Prefer omitting unavailable acts. |
| Long / Chinese | Visible Button labels wrap without ellipsis; icon accessible names remain complete. |
| Selected | Optional `aria-pressed` plus a visible check, for the breeder mark. |
| Badge | Count is visible and included in the accessible name, e.g. “Filter pigs, 2 applied”. |

No empty state: omit an action with no label. No field error state: put validation on the relevant field and explain the waiting action once.

## Behaviour

Native button activation emits `data-action` / `data-value`. Bordered is the default, including header returns. Sheet ✕ uses plain. Use `selected` only for a binary mark and update it with its accessible name. `disabled` stays focusable with `aria-disabled`; delegated hosts call `guard(el)` and retain a visible reason.

## Content rules

One label rule: verbs come from [strings.json](../../../laws/strings.json), and each verb has exactly its registered meaning. Back keeps a draft; Close exits a per-tap sheet; Clear discards a draft; Edit corrects a posted record; Record commits an act; End task ends the batch task. Name the act and subject/count; never “Submit”. Save is reserved by the registry for a staged event, not a substitute for Record.

Aim for an accessible name within 64 English characters or 32 Chinese characters. This is a writing budget, not a validation limit. Sentence case; never truncate the accessible name. Name the action and subject, and include badge counts once. The Chinese example keeps its complete name while the target stays square.

## Accessibility

| Input | Behaviour |
| --- | --- |
| Tab / Shift+Tab | Moves focus among controls; visible token ring. |
| Enter / Space | Native activation; hold uses the two-press path above. |
| Escape | Cancels an armed or in-progress hold. |

Native `button` role; decorative icons are `aria-hidden`. Waiting and icon-disabled controls use `aria-disabled`; native disabled Button is unavailable to keyboard, with its reason visible. Loading uses `aria-busy`. Reason has `role="status"` and `aria-live="polite"`. Targets use `tap-min`, never less than 48 × 48. Respect reduced motion; no action depends on a long press alone.

## Do / don’t

Do name the act, give one visible reason while it waits and keep one primary per bar. Don’t duplicate that reason inside the label, add cards around buttons, encode disabled/selected only with colour, or shrink a target to fit Chinese.

## API and tokens

Implementation: [bundle.js](../bundle.js), [bundle.css](../bundle.css), [index.d.ts](../index.d.ts). Factories return HTML; event delegation and business writes belong to the host. Existing `action`, `value`, `badge` and `className` signatures remain supported; variant selection belongs to this factory.

Geometry/type: `tap-min`, `radius-control`, `space-1`, `size-2`, `size-3`, `type-description-size`. Colour/state: `ink`, `paper`, `line`, `disabled-ink`, `press`, `focus`. The reason line uses Button’s shared tokens.

## Related components

| Component | Relationship |
| --- | --- |
| [Button](../Button/README.md) / [IconButton](../IconButton/README.md) | Labelled acts / familiar glyph tools. |
| [Sheet](../Sheet/README.md) | Positions footer actions and one reason line; drawer close is plain IconButton. |
| [ChoiceList](../ChoiceList/README.md) | Select outcomes instead of executing an act. |
| [Icons](../../assets/Icons/README.md) | Shared glyph registry. |

## Classification

Generic component, used across sections. Bordered and plain are variants; header return and toolbar tools share bordered. Sheet positions its plain close control as a composition pattern, with no separate close implementation.

## References and changelog

2026-10-10: unified variants, reasons, hold face and glove targets; removed unused end-early register. [Ant Design Mobile Button](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/button/index.en.md) and [TDesign Button](https://github.com/Tencent/tdesign-mobile-vue/blob/develop/src/button/button.md) guide fill, optional icon and busy state; [Sentri’s research](../../../../docs/design-workflow/research/component-standard.md) records Material 3 and Apple interaction guidance. Sentri retains its stricter 48px glove floor.

Rendered verification and the 15-line self-review: [verification](../Button/verification.md). Screenshots: [state proof](proof/).
