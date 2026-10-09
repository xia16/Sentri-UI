# Button

Button names and performs one act. Use [IconButton](../IconButton/README.md) instead for universal icon-only tools; use [ChoiceList](../ChoiceList/README.md) for selecting an outcome.

## When to use

Use in footer action bars and beside the content an act changes. At most two footer actions, primary right; mid-sheet tool groups have at most three labelled actions.

## When not to use

Use [Row](../Row/README.md) for a subject that opens detail, [ChoiceList](../ChoiceList/README.md) for choices, and [IconButton](../IconButton/README.md) for familiar glyph tools. Do not style a choice as a primary action.

## Anatomy

Container; visible verb label; optional leading icon; optional loading marker; optional reason line outside the target. Hold adds a progress sweep and one caption under the verb, using Farrowing’s uppercase caption face everywhere.

## Variants

| Variant | Use | API |
| --- | --- | --- |
| [Primary](variants/primary.html) | The one record or commit in a footer. | `button({register:"primary"})` |
| [Secondary](variants/secondary.html) | Back or another supporting exit. | `button({register:"secondary"})` |
| [Text action](variants/text.html) | Clear, reset or edit beside content. | `button({register:"text"})` |
| [Hold](variants/hold.html) | Finish farrowing, lock or end task with deliberate confirmation. | `holdButton()` |
| [Tool](variants/tool.html) | Labelled mid-sheet acts such as record death or set count. | `button({register:"tool"})` |
| [Destructive](variants/destructive.html) | Delete an attachment in the real farrowing photo dialog. | `button({register:"danger"})` |

## States

| State | Appearance and response |
| --- | --- |
| Default | Label or glyph at rest. |
| Pressed | Visible press fill / darkening and movement; static examples use `data-preview="pressed"`. |
| Focus | Token focus ring; static `data-preview="focus"`. |
| Disabled | Persistent text reason via `reason` or `describedby`; never colour alone. Prefer omitting unavailable acts. |
| Long / Chinese | Visible Button labels wrap without ellipsis; icon accessible names remain complete. |
| Waiting | Focusable `aria-disabled`; one prerequisite reason line stays visible. |
| Loading | `busy`, `aria-busy`, ellipsis and reason; no duplicate commit. |
| Hold: Holding / Armed | Progress sweep / second-press instruction and focus ring. |
| Hold: Pending / Done / Unknown | Recording / terminal result captions; Unknown never offers the act again. |
| Hold: Failed | Return to idle only after a confirmed failure, with a reason. |

No empty state: omit an action with no label. No field error state: put validation on the relevant field and explain the waiting action once.

## Behaviour

Native button activation emits `data-action` / `data-value` for the host. Call `guard(el)` before delegated writes. `reason` renders one persistent status line linked with `aria-describedby`; when using `sheetFooter`, supply `primary.reason` or its shared `status`, not both. The shared Sheet line stays visible while waiting.

Hold: `holdBind(root,{onCommit})` uses the token hold duration (850ms). Release, move outside, cancel, blur or Escape before completion cancels. Enter/Space arms; a second press after 400ms and within 5s commits. Repeated keys do not commit. Caption keeps Farrowing’s face; cues are announced in `statusId`; Armed, Pending, Done and Unknown show explicit instructions/results. Use `binding.settle(button, "done" | "failed" | "unknown")` on the binding after the host receives the result.

## Content rules

One label rule: verbs come from [strings.json](../../../laws/strings.json), and each verb has exactly its registered meaning. Back keeps a draft; Close exits a per-tap sheet; Clear discards a draft; Edit corrects a posted record; Record commits an act; End task ends the batch task. Name the act and subject/count; never “Submit”. Save is reserved by the registry for a staged event, not a substitute for Record.

Aim for 24 English characters or 12 Chinese characters in a visible label; hold captions aim for 16 English / 8 Chinese. These are writing budgets, not validation limits. Sentence case; only hold captions use uppercase English. Never truncate an act or accessible name: long Button labels wrap and grow the target. Icon names may be longer but must name the action and subject; include badge counts once.

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

Implementation: [bundle.js](../bundle.js), [bundle.css](../bundle.css), [index.d.ts](../index.d.ts). Factories return HTML; event delegation and business writes belong to the host. Existing register and helper signatures remain supported; TaskHold binding is a compatibility alias, not a second implementation.

Geometry/type: `tap-min`, `control-height`, `back-width`, `radius-control`, `border-width`, `space-4`, `space-7`, `space-8`, `space-10`, `space-17`, `type-button-size`, `type-hold-caption-size`, `font-sans`. Colour/state: `ink`, `ink-2`, `paper`, `well`, `line`, `control-border`, `disabled-fill`, `disabled-ink`, `press`, `focus`. Hold: `hold-commit`, `hold-sweep-opacity`, `task-hold-caption-opacity`; destructive uses `red`.

## Related components

| Component | Relationship |
| --- | --- |
| [Button](../Button/README.md) / [IconButton](../IconButton/README.md) | Labelled acts / familiar glyph tools. |
| [Sheet](../Sheet/README.md) | Positions footer actions and one reason line; drawer close is plain IconButton. |
| [ChoiceList](../ChoiceList/README.md) | Select outcomes instead of executing an act. |
| [Icons](../../assets/Icons/README.md) | Shared glyph registry. |

## Classification

Generic component, used across sections. Registers are variants of this component; footer placement is a Sheet composition pattern. Hold absorbs TaskHold; tools absorb Piglet’s former `.sp-tool`. Neither is a second component.

## References and changelog

2026-10-10: unified variants, reasons, hold face and glove targets; removed unused end-early register. [Ant Design Mobile Button](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/button/index.en.md) and [TDesign Button](https://github.com/Tencent/tdesign-mobile-vue/blob/develop/src/button/button.md) guide fill, optional icon and busy state; [Sentri’s research](../../../../docs/design-workflow/research/component-standard.md) records Material 3 and Apple interaction guidance. Sentri retains its stricter 48px glove floor.

Rendered verification and the 15-line self-review: [verification](../Button/verification.md). Screenshots: [state proof](proof/).
