# Farrowing — research before the Astra revision

11 September 2026. Research only; neither farrowing HTML file was edited in this pass.

**Later owner constraint:** study only well-designed apps with substantial adoption. The [reference criteria and qualified shortlist](ASTRA-REFERENCE-CRITERIA.md) supersede this report's broad sampling; excluded apps are historical observations, not design benchmarks.

Follow-up: [Round two](ASTRA-RESEARCH-ROUND-2.md) challenges these initial recommendations with closer counting, draft, correction and long-form references. Use its revised grouping recommendations for the next concept. Supporting operational evidence is in [ASTRA-OPERATIONAL-SOURCES.md](ASTRA-OPERATIONAL-SOURCES.md).

## Recommendation

Keep the existing room → sheet workflow. Improve the hierarchy inside it: a focused counting area during farrowing, a short review form at Finish, and a readable summary after locking. Keep the detailed event record on its own page.

The distinct Astra contribution should be fewer competing frames, better alignment, readable secondary facts and clearer draft feedback. It should not be a new navigation model or a new data model. The earlier Astra concept removes essential paths and is not a sound implementation baseline.

## Baseline and evidence

- Fetched origin and verified the user-designated `claude/farrowing-review-handover-2b2e0e` branch remains at `07ec2c5faf4ee71915390efdd16d14e33db05fd3`. This identifies the requested baseline; it is not a claim that all repository branches are identical.
- Reviewed [RULINGS.md](RULINGS.md), the current [reference HTML](../../system/farrowing.html), the user's rendered screenshots, and the [Astra concept](../../system/farrowing-astra-concept.html) source/accessibility content. The local HTTP preview refused the new reference connection, so this is not a fresh rendered layout audit.
- Examined 13 individual Mobbin screen images and nine preview images across three flow results. Search results varied in relevance. Only visible content supports the observations below; static images do not establish autosave, gesture behavior or usability performance.
- Checked Apple HIG and W3C guidance, collected in [ASTRA-INTERACTION-SOURCES.md](ASTRA-INTERACTION-SOURCES.md).
- RULINGS and the reference page's explanatory prose retain superseded text. Resolve conflicts using explicit dated owner decisions and the latest rendered construction. Examples: keep `Close · Finish farrowing`; count typing is retired; the locked face has a separate `Farrowing record` page entrance. Do not revive earlier alternatives based on an isolated paragraph.

## Useful Mobbin references

| Reference actually viewed | Visible observation | Application to farrowing | Limit |
| --- | --- | --- | --- |
| [Warby Parker: quantity sheet](https://mobbin.com/screens/679d260d-f135-4afb-a7ee-bfa052f65513) | Two related rows share one quiet group; labels and minus/value/plus controls align. The host remains visible. | Align Weak and Deformed into one stable control column; reuse the anatomy for death and correction rows. | Its small circular controls and cart submission semantics are not a prescription for barn use. |
| [AllTrails: activity detail](https://mobbin.com/screens/e1ea60bf-3e06-4d70-be24-cbcef5883577) | Metrics are grouped with whitespace, without a border around each value; `See splits` separates deeper detail. | One Born/Alive/Dead group, then finish facts and one record entrance. Reduce internal lines without removing information. | This is a full-page activity screen, not a reason to replace Sentri's sheets. |
| [Strava: activity detail](https://mobbin.com/screens/1e98b074-3fa8-4932-ac64-a3e3b7ed1803) | Labels and bold values form a regular metric grid distinct from narrative cards. | Use alignment and weight for the summary and finish details; reserve the largest number for Alive during counting. | Achievement and coaching cards would add irrelevant content to farrowing. |
| [Lloyds: transaction detail](https://mobbin.com/screens/793b2b0a-560c-4768-b138-e94150930e53) | Primary identity/amount precede labeled detail rows; a clearly marked row navigates to related records. | Keep summary, finish provenance and record navigation visually distinct. Make the entire record row a clear target. | Do not copy the bank's many cards or its inline edit doors. Sentri has one Edit entrance. |
| [Revolut: transfer detail](https://mobbin.com/screens/b7a4d4f5-b5a7-4f95-a39e-84e7a258996c) | Timeline information is grouped under a status heading, separate from other facts. | Use grouped time/event presentation on the dedicated Farrowing record page. | Its timeline predicts stages of a transfer. Farrowing history must show actual events only, with no invented progress stages. |

### Results deliberately not adopted

[Target](https://mobbin.com/screens/05cf7f80-bd51-4d5e-bb64-656f76d7a364), [Amazon](https://mobbin.com/screens/bcb25aa4-c9a8-4886-a947-c149a54442d3) and [Gymshark Shopping](https://mobbin.com/screens/f25ce853-65ea-430d-9c30-caaef5c2b0c9) returned wheel quantity pickers. These replace the direct counting interaction. [Crouton](https://mobbin.com/screens/80e0c9db-24c5-4023-83e0-00c9750749d4), [Yazio](https://mobbin.com/screens/b6db4cbe-ece5-49fe-a61a-d37f677028fe) and [Alta](https://mobbin.com/screens/0cb86101-485a-45c9-8ee8-8c136355b15b) emphasize keyboards or single-value entry; typing remains appropriate only for existing weight/text inputs. [Slopes](https://mobbin.com/screens/e05a359f-c4be-44e7-93e8-855603393cf2) contains multiple visual layers and recreational controls. [Splitwise](https://mobbin.com/screens/2b1a86c7-6122-40be-be7d-725a04ce24b8) mixes details with a dense change discussion; it is not a good model for the compact locked face.

The [Gymshark workout flow](https://mobbin.com/flows/f056e8f3-4754-452b-846e-4a8a3c7b948a) previews show recording and summary surfaces, but do not prove its commit behavior. [Fitbit](https://mobbin.com/flows/427bdd1d-03e9-48bb-bbe2-f0d791340fcb) shows a log-session confirmation that is a poor match for per-tap saving. The targeted [Hevy result](https://mobbin.com/flows/c41c8cc5-176f-4e86-8c62-363635206552) was routine browsing, not completion; it provides no evidence for changing Finish. These are rejected matches, not supporting citations dressed up as research.

## What currently makes the screens difficult to read

1. **Finish has too many comparable frames.** The summary well, outlined classification group, outlined optional group, individual outlined keys and footer rule all compete. The two form groups are useful; their repeated outer borders are not essential. This is a visual judgment from the user screenshots, not a measured task-time finding.
2. **Secondary information is small and sometimes too faint.** Source token `#8B8E83` has calculated contrast of 3.34:1 on white and 2.87:1 on `#EFEEE8`. Where used as opaque small text, it falls below WCAG AA's 4.5:1 requirement. Existing `#51544B` reaches 7.72:1 and 6.64:1 respectively. These are token-pair calculations, not a complete computed-style audit. [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum).
3. **Long fact strings make scanning harder.** Death causes and finish observations must wrap or use aligned label/value positions; ellipsis is inappropriate when it hides recorded facts on a detail surface. The current source and concept both contain nowrap/ellipsis styling in these areas.
4. **The Astra concept duplicates identity and adds explanatory furniture.** Its full-page title plus identity header repeat the sow context. `At a glance`, `live record` and the separate autosave panel add reading without adding an action.
5. **The Astra concept changes the workflow.** During omits Edit and Close, shortens Finish farrowing, the death drawer uses Done and omits draft/sow/photo states, and the locked face embeds history. Most displayed keys are spans and there is no implemented interaction model. It must not be described as preserving the workflow merely because the same numbers appear.

## Proposed presentation, screen by screen

These are design recommendations for the next concept pass, not new approved domain rules.

| Surface | Proposed structure | Behavior that must remain |
| --- | --- | --- |
| Room | Align pen, sow identity and the two information lines; reduce redundant spacing in pen headers and let rows grow. Keep all current lenses and status grammar. | Row opens the session sheet; identity in the sheet opens the sow page. No new filters, badges or lifecycle states. |
| Before / During | One identity header; one centered Alive counter; receipt immediately beneath; `Record dead · Edit` tool pair; compact Born/Dead record entrance; `Close · Finish farrowing` footer. Remove the concept's extra headings and autosave card. Tighten dead space, not count targets. | Same skeleton before recording; appropriate disabled controls, inline saved receipt, floor pointers and unsaved indicators. Close remains available. |
| Record dead | Keep Piglets/The sow segment, title and draft count, consistent cause rows, and optional photo field. Use the existing aligned minus/value/plus shape without shifting columns as counts change. | Back retains draft, Clear discards, Save posts. Sow death keeps its warning and hold action. Photos remain optional. |
| Finish | One shallow totals well. Causes below its totals in a wrapping line or aligned two-column list. Below it, Weak and Deformed as plain separated rows with aligned steppers; optional weight/assisted stay visible in a quieter section. Remove the two extra outer form borders. Keep footer accessible while content scrolls. | Classification saves per tap; Back navigates; no new Healthy field, no optional-field gate; unsaved drafts block Lock only; hold-to-lock remains. |
| Locked face | Reuse Finish's summary. Present At finish values as a readable two-column detail group when space allows: Weak / Deformed, Litter weight / Assisted. Put Finished timestamp and author below it. One distinct Farrowing record row carries the latest event. | Current alive/dead can change after Born locks. Finish facts and provenance remain visible. Edit/Record dead footer; history remains a separate page. |
| Edit | Reuse tally-row alignment. Show the correction banner and change summary only after a change. Keep the post-lock At finish disclosure as one expanding group. | One correction entrance; Back/Clear/Save; Born correction uses the existing popup then Apply to draft then Save. |
| Farrowing record | Give event descriptions enough width, with small time columns, date groups and author changes. Use the existing timeline milestones and photo groups; remove unnecessary row dividers if spacing already separates events. | Separate pushed page, read-only events, newest first, correct open-visit and correction treatment, return to the originating sheet. |

Visual direction: retain warm neutral surfaces, dark ink, Plus Jakarta Sans, IBM Plex Mono for IDs/numerals/stamps, and semantic status colors. Use one clear surface boundary per group. Prefer sentence-case labels and readable body copy to tiny tracked caps. No glass effects, decorative gradients, charts or success celebration added to the farrowing task.

## Flow verification required in the next pass

The ordinary route remains room → counting sheet → Finish sheet → locked face. Record dead and Edit are side paths; history is a pushed page. Improving this flow means making its transitions and state feedback understandable, not reducing steps by changing when data commits.

| Walkthrough | Required observable result |
| --- | --- |
| First event is a stillborn | Record dead is available at zero; Save creates the record with consistent Born/Alive/Dead. |
| Accidental Alive tap | Minus undoes within the allowed floor; no confirmation or new count-entry method. |
| Leave and resume counting | Saved receipt and totals remain consistent; Close does not masquerade as Save. |
| Leave a death draft, then reopen | Host shows the unsaved count; draft returns intact; Clear and Save have different outcomes. |
| Open Finish with a pending death draft | Finish fields remain usable; Lock waits and its pointer returns to the draft. |
| Back from Finish | Classification follows existing per-tap persistence; no new cancel/discard behavior. |
| Lock then record another death | Born stays fixed, current Alive/Dead update, finish facts remain, event appears in history. |
| Correct after lock | Born popup → Apply → Edit summary → Save remains visible and coherent. |
| Sow dies | Cause, consequence and hold-to-save remain; ended record is not labeled Finished. |
| Review history and return | Returns to the correct sheet without fabricating a save or losing a draft. |

Validate individual screens at 360×740 and 390×844, narrow 320px content, 200% text, long names and wrapping causes. Count keys should be at least 44×44 CSS px, with roughly 60px tally rows as a starting point, not a claim of proven glove usability. Check focus, status announcements and footer reachability. [W3C target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced), [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow).

## Implementation boundary

Next work belongs only in `ux/system/farrowing-astra-concept.html` and any clearly named concept support files. Keep `ux/system/farrowing.html` as the reference. Scope is the farrowing room/session/finish/record and their existing death/correction paths; piglet processing, tagging, fostering, batch-close redesign and the farm landing page are outside this pass.

No claim yet that the proposed design is faster or better for workers. Mobbin establishes examples, platform guidance establishes constraints, and these recommendations still require a rendered interactive concept and actual user evaluation.
