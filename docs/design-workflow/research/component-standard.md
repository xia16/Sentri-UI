# What a finished component of the mobile app looks like in mature design systems

**Components are designed and perfected from real features.**

A component's look comes from the approved feature screens that use it, and it improves by improving those screens, judged before/after on them. An approved screen is never restyled to fit a component. The approved baseline for Farrowing, Inspection and Piglet processing is main at 6e6c940 plus the owner-approved deltas, checked with `scripts/compare-screens.mjs`.

Research for Sentri: the standard every **mobile app** component page and component gate is judged against. It is the standard for the mobile app only (a native-feel phone app used with touch): web-only rules such as hover, focus rings and keyboard navigation are not adopted. A web app, when it exists, gets its own standard.
Date: 2026-10-09. Method: primary docs and the libraries' own source docs only.

## Source access and caveats (read first)

- **Material Design 3 (m3.material.io) and Apple HIG are rendered with JavaScript**; a plain fetch returns only the page title.
  - Apple: I read the HIG's own content JSON (`developer.apple.com/tutorials/data/design/human-interface-guidelines/<page>.json`), which is the same text as the site. Pages used: [segmented controls](https://developer.apple.com/design/human-interface-guidelines/segmented-controls), [sheets](https://developer.apple.com/design/human-interface-guidelines/sheets), [action sheets](https://developer.apple.com/design/human-interface-guidelines/action-sheets), [pickers](https://developer.apple.com/design/human-interface-guidelines/pickers), [sliders](https://developer.apple.com/design/human-interface-guidelines/sliders), [text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields), [lists and tables](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables), [buttons](https://developer.apple.com/design/human-interface-guidelines/buttons).
  - M3: facts below come from search extracts of the M3 pages themselves (each is linked), plus Google's own [Material Web docs](https://github.com/material-components/material-web/tree/main/docs/components) (an official M3 implementation). M3 claims are therefore **lower confidence than the others**; verify any number before it goes into a gate.
- **Shopify Polaris** has moved from polaris.shopify.com to [shopify.dev/docs/api/polaris](https://shopify.dev/docs/api/app-home/polaris-web-components/forms/textfield) (web components). The old React site redirects (HTTP 301).
- **Atlassian**'s [contribution page](https://atlassian.design/contribution) gives no criteria for "new component vs variant vs pattern" (details in section 3).
- **Ant Design Mobile (ADM), Vant, TDesign Mobile** were read from their repos' docs source (the same text the doc sites render), linked per claim.
- Variant and prop lists in the section 4 tables were read from each library's props tables; a few minor props (e.g. Vant Tag, ADM Tag, ADM List) were skimmed rather than exhaustively checked.
- Only M3 and Apple are native-first; ADM, Vant and TDesign are the web (HTML/CSS/JS) mobile libraries. That matters for Sentri (section 6).
- **Touch rule (Sentri decision, 2026-10-10).** Sentri is a native-feel touch app for gloved, one-handed use. Hover, focus and keyboard rows below are **web-only and not adopted**: there is no pointer to hover, and on a phone the OS screen reader (VoiceOver, TalkBack) draws its own focus outline. Where a cited source lists them, the citation stays as research; the Sentri rule is in the checklist (section 5).

---

## 1. Anatomy of a component page

Two groups of systems emerge. The **design-guidance** systems (M3, Apple, Atlassian, Polaris) write prose guidance. The **mobile web kits** (ADM, Vant, TDesign) are thin: a one-line purpose, demos, and an API table. A finished Sentri page should take the guidance sections from the first group and the API/CSS-variable rigour from the second.

| Section | What it contains | Who does it (links) |
|---|---|---|
| **Overview / purpose** | One or two sentences: what it is and the job it does | All. ADM states it as a "When to Use" heading ([ADM Segmented](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/segmented/index.en.md), [Tabs](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/tabs/index.en.md)); Vant has an "Intro" ([Cascader](https://github.com/youzan/vant/blob/main/packages/vant/src/cascader/README.md)); Atlassian "Usage" ([Tabs](https://atlassian.design/components/tabs/usage)) |
| **Anatomy / parts** | Named parts of the component, optional ones marked | Atlassian "Parts" ([Tabs](https://atlassian.design/components/tabs/usage), [Tag](https://atlassian.design/components/tag/usage)); Apple "Anatomy" ([Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)); M3 pages have anatomy/specs tabs ([M3 components](https://m3.material.io/components)) |
| **Variants / types** | Each variant with *when to use it* | M3 chips: assist / filter / input / suggestion, "choose the type of chip based on its purpose" ([Material Web chips](https://github.com/material-components/material-web/blob/main/docs/components/chip.md)); M3 sliders: continuous / discrete / range ([Material Web slider](https://github.com/material-components/material-web/blob/main/docs/components/slider.md)) |
| **When to use / when not to use** | Positive and negative scope, naming the sibling component to use instead | Atlassian Tag has an explicit "When not to use" pointing to Lozenge, Avatar tag ([Tag](https://atlassian.design/components/tag/usage)); Atlassian Range ([Range](https://atlassian.design/components/range/usage)); ADM Picker: "fewer than 5 options... Radio is a better choice" ([ADM Picker](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/picker/index.en.md)); Apple pickers ([Pickers](https://developer.apple.com/design/human-interface-guidelines/pickers)) |
| **States** | Enabled / pressed / selected / disabled / error / loading (hover and focus are web-only, not adopted by Sentri) | M3 has a shared [States foundation](https://m3.material.io/foundations/interaction/states/overview) (enabled, disabled, hover, focused, pressed, dragged); Atlassian Tabs lists "Default, Focus, Hover, Press, Selected" ([Tabs](https://atlassian.design/components/tabs/usage)); Polaris text field lists Error, Disabled, Read-only, Required ([Polaris text field](https://shopify.dev/docs/api/app-home/polaris-web-components/forms/textfield)). The mobile kits show states only as props (`disabled`, `loading`, `error`), not as a section |
| **Behaviour / interaction** | Gestures, snapping, dismissal, what happens on select (keyboard is web-only, not adopted) | Apple sheets: detents, grabber, swipe to dismiss ([Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)); M3 slider: handle snaps to nearest stop, value label only while dragging ([M3 sliders via search extract](https://m3.material.io/components/sliders/guidelines)); ADM Cascader: selecting an option jumps to the next level ([ADM Cascader](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/cascader/index.en.md)) |
| **Content / copy rules** | Label length, casing, grammar, truncation | Atlassian "Content guidelines" on Tabs (1-2 words, no overlap), Select (one line per option), Tag (no wrap, 200px max) ([Tabs](https://atlassian.design/components/tabs/usage), [Select](https://atlassian.design/components/select/usage), [Tag](https://atlassian.design/components/tag/usage)); Apple "Content" section: nouns for segment labels, no mixing text and icons ([Segmented controls](https://developer.apple.com/design/human-interface-guidelines/segmented-controls)) |
| **Accessibility** | Screen-reader roles, label rules, target size (keyboard is web-only, not adopted) | Atlassian "Accessibility" section on most pages; M3 has a separate accessibility tab per component (e.g. [Bottom sheets](https://m3.material.io/components/bottom-sheets/accessibility)); Material Web ends each page with Accessibility ([text field](https://github.com/material-components/material-web/blob/main/docs/components/text-field.md)); Polaris text field has labels / `aria` announcement ([Polaris](https://shopify.dev/docs/api/app-home/polaris-web-components/forms/textfield)). Mobile kits: almost none |
| **Platform considerations** | Per-platform differences | Apple only (iOS / macOS / watchOS blocks on every page) |
| **Do / don't** | Paired examples | Apple and M3 bake do/don't into prose and image pairs; Atlassian uses "Best practices: use when / don't use when" bullets ([Tabs](https://atlassian.design/components/tabs/usage)). None of the mobile kits has it |
| **API / properties / theming** | Props, events, CSS variables | ADM, Vant, TDesign, Polaris, Material Web. e.g. ADM Segmented lists CSS variables ([ADM Segmented](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/segmented/index.en.md)); Vant lists `--van-*` variables per component ([Vant Cell](https://github.com/youzan/vant/blob/main/packages/vant/src/cell/README.md)); TDesign lists `--td-*` ([TDesign Cascader](https://github.com/Tencent/tdesign-mobile-vue/blob/develop/src/cascader/cascader.md)) |
| **Examples / demos** | Live, runnable | All; the mobile kits are demo-led |
| **Related components** | "Use X for Y" table | Atlassian Tag's table of Tag / Lozenge / Badge / Avatar tag ([Tag](https://atlassian.design/components/tag/usage)); Atlassian Select's Related list ([Select](https://atlassian.design/components/select/usage)); Apple "Related" on every page |

**Page tab structure.** Atlassian splits each component into Examples, Code, Usage, Changelog ([Text field](https://atlassian.design/components/textfield/usage)). M3 splits into Overview, Specs, Guidelines, Accessibility ([bottom sheets accessibility tab](https://m3.material.io/components/bottom-sheets/accessibility)). Apple has a Change log at the foot of the page ([text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields)). Shape to copy: one page with the sections above, plus a changelog.

---

## 2. Variant vs state vs property

None of these systems prints a formal definition. The distinction is visible in how they structure pages and APIs:

| Concept | Practical test (inferred from sources) | Examples |
|---|---|---|
| **Variant / type** | A different *job* or a different structure, chosen by the designer at design time and stable for the life of the instance. Each has its own "when to use". | M3 chip types assist / filter / input / suggestion are "based on its purpose" ([Material Web chips](https://github.com/material-components/material-web/blob/main/docs/components/chip.md)). M3 slider continuous / discrete / range ([Material Web slider](https://github.com/material-components/material-web/blob/main/docs/components/slider.md)). M3 bottom sheet standard vs modal ([M3 bottom sheets](https://m3.material.io/components/bottom-sheets/accessibility)). Apple segmented control single vs multiple choice vs action buttons ([Segmented controls](https://developer.apple.com/design/human-interface-guidelines/segmented-controls)). Vant Tabs `type`: line / card ([Vant Tabs](https://github.com/youzan/vant/blob/main/packages/vant/src/tab/README.md)). TDesign Tabs `theme`: line / tag / card ([TDesign Tabs](https://github.com/Tencent/tdesign-mobile-vue/blob/develop/src/tabs/tabs.md)) |
| **State** | A condition the *user or system* puts the instance in at run time; the same instance moves between states. Shared across components. | M3's States foundation: enabled, disabled, hover, focused, pressed, dragged, and "states can be combined, such as selection and hover" ([M3 states](https://m3.material.io/foundations/interaction/states/overview)). Polaris: error, disabled, read-only ([Polaris](https://shopify.dev/docs/api/app-home/polaris-web-components/forms/textfield)). TDesign CheckTag `checked` and `disabled` ([TDesign Tag](https://github.com/Tencent/tdesign-mobile-vue/blob/develop/src/tag/tag.md)) |
| **Property** | A knob that changes content, size, or an optional part, without changing the job. Includes slots and optional parts. | Atlassian Tag optional parts `swatchBefore`, `elemBefore`, `isRemovable`, `trailingMetric` ([Tag](https://atlassian.design/components/tag/usage)). Polaris `prefix`/`suffix`, `maxLength`, `required` ([Polaris](https://shopify.dev/docs/api/app-home/polaris-web-components/forms/textfield)). Vant Slider `step`, `min`, `max`, `button-size` ([Vant Slider](https://github.com/youzan/vant/blob/main/packages/vant/src/slider/README.md)). ADM Selector `columns`, `showCheckMark` ([ADM Selector](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/selector/index.en.md)) |

**Grey zones worth a Sentri rule** (the sources blur them):
- *Size* is a property in Vant/TDesign (`size`) but a variant in M3 sliders (XS to XL are separate sized specs) ([M3 sliders extract](https://m3.material.io/components/sliders/guidelines)).
- *Single vs multiple selection* is a variant in M3 segmented buttons and Apple, but a boolean property (`multiple`) in ADM Selector ([ADM Selector](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/selector/index.en.md)). TDesign Tag `disabled`/`checked` only exist for `theme=default`, which shows variants gate which states exist ([TDesign Tag](https://github.com/Tencent/tdesign-mobile-vue/blob/develop/src/tag/tag.md)).
- *Required* is a property that only changes the look (Vant and Polaris both say it does not validate) ([Vant Field](https://github.com/youzan/vant/blob/main/packages/vant/src/field/README.md), [Polaris](https://shopify.dev/docs/api/app-home/polaris-web-components/forms/textfield)).

---

## 3. New component vs variant vs pattern

**What the sources actually say (honest summary): there are no published decision rules.** The practice is visible only in structure:

- **Atlassian** lists foundations, components, tooling and patterns as separate areas ([design system overview](https://atlassian.design/design-system), [about](https://atlassian.design/get-started/about-atlassian-design-system)). Its [contribution page](https://atlassian.design/contribution) sorts changes by *scope* not by kind: fixes and small enhancements accepted; "major enhancements" (adding a feature to a component) and "new components or patterns" likely not accepted because they need system-wide coordination across code, design and guidelines. It names no test for component-vs-variant.
- **Sibling-split by job** is the de facto test: Atlassian splits Tag, Lozenge, Badge, Avatar tag by what they represent: categories, status, tallies, people ([Tag](https://atlassian.design/components/tag/usage)). So "same visual form, different meaning = different component". M3 splits Segmented button, Chips and Tabs the same way: segmented is a fixed set of 2-5 related choices, chips are dynamic sets ([M3 segmented button extract](https://m3.material.io/components/segmented-buttons/guidelines)). Apple: switching closely related subviews is a segmented control; separate app sections are a tab bar ([Segmented controls](https://developer.apple.com/design/human-interface-guidelines/segmented-controls)).
- **Same job, different look = variant/theme.** ADM ships `Tabs` and `CapsuleTabs` and `JumboTabs` as three components with the same one-line description "Navigate between content groups" ([Tabs](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/tabs/index.en.md), [CapsuleTabs](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/capsule-tabs/index.en.md)), whereas Vant and TDesign make the same split a `type`/`theme` prop ([Vant](https://github.com/youzan/vant/blob/main/packages/vant/src/tab/README.md), [TDesign](https://github.com/Tencent/tdesign-mobile-vue/blob/develop/src/tabs/tabs.md)). Lesson: the libraries disagree, so Sentri must state its own rule (see section 6).
- **Composites are components in the mobile kits:** Cascader is its own component in ADM, Vant and TDesign; Picker contains Picker / CascadePicker / DatePicker as one family ([ADM Picker](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/picker/index.en.md)). Vant's Cascader is shown composed with Field + Popup ([Vant Cascader](https://github.com/youzan/vant/blob/main/packages/vant/src/cascader/README.md)).
- **Patterns** (multi-component recipes: form validation, empty states, filtering flows) live in a separate section, not on component pages. Atlassian puts them in their own area and says "no one pattern works for all situations" ([search extract of atlassian.design accessibility guidance](https://atlassian.design/foundations/accessibility)). Apple's pickers page points elsewhere for large sets ("consider using a list") ([Pickers](https://developer.apple.com/design/human-interface-guidelines/pickers)); Apple's Layout and Patterns are separate HIG sections ([HIG](https://developer.apple.com/design/human-interface-guidelines/)). Polaris and M3 likewise separate foundations/patterns from components ([M3 components index](https://m3.material.io/components)).

**Implied working rule (my synthesis, not quoted):** new component if the job or meaning differs from any sibling; variant if the job is the same and only structure/selection mode differs; property if only content or an optional part changes; pattern if it is a recipe combining two or more components.

---

## 4. Per-component findings

### 4.1 Segmented control and tabs

| Library | Names | Variants offered | States / props | Notable |
|---|---|---|---|---|
| M3 | Segmented button (now steered to connected button group in Expressive) | single-select, multi-select; 2-5 segments | selected / unselected / disabled | "Best used for 2 and 5 choices... more than five, consider chips" ([M3 extract](https://m3.material.io/components/segmented-buttons/guidelines)) |
| Apple | Segmented control | single choice, multiple (macOS), action buttons | selected; "keep control types consistent" | ~5 segments max on iPhone; equal widths; text *or* icons, not both; nouns for labels; for separate sections use tab bar ([HIG](https://developer.apple.com/design/human-interface-guidelines/segmented-controls)) |
| ADM | Segmented, Tabs, CapsuleTabs, JumboTabs | `block` (full width); icon per item | `disabled` (whole and per segment); CSS vars | Segmented: "multiple options, user selects one; content below changes" ([ADM Segmented](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/segmented/index.en.md)) |
| Vant | Tabs | `type`: line / card; swipeable, sticky | `ellipsis`, `border`; tab bar height 44px, card height 30px by default ([Vant Tabs](https://github.com/youzan/vant/blob/main/packages/vant/src/tab/README.md)) | Scrollable when many tabs (`swipe-threshold`) |
| TDesign | Tabs | `theme`: line / tag / card; `size`: medium / large | per-panel `disabled` | ([TDesign Tabs](https://github.com/Tencent/tdesign-mobile-vue/blob/develop/src/tabs/tabs.md)) |
| Atlassian | Tabs | none besides neutral selected style | Default, Focus, Hover, Press, Selected | Tabs for *content on the same page*, not for navigating to pages or states; not for "information users need simultaneously, such as filtering a single table"; labels 1-2 words; order by importance ([Tabs](https://atlassian.design/components/tabs/usage)) |

**Segmented vs filter chips (how they relate).** M3 says filter chips "can be a good alternative to segmented buttons": segmented = fixed, persistent 2-5 option group; chips = a dynamic set that can scroll horizontally and holds more than five ([M3 extract](https://m3.material.io/components/segmented-buttons/guidelines)). Apple frames the same split as grouping: segmented controls "preserve their grouping" and show selection clearly ([HIG](https://developer.apple.com/design/human-interface-guidelines/segmented-controls)). Decision rule that falls out: *switch the view or mode of the same data* = segmented/tabs; *narrow a list by tags* = filter chips.

**Gloved-hand notes.** Hit region at least 44x44pt (Apple) / 48x48dp (M3) ([Apple buttons](https://developer.apple.com/design/human-interface-guidelines/buttons), [M3 inputs](https://m3.material.io/foundations/interaction/inputs)); 2-5 equal-width segments is a built-in "few choices" limit; the 44px Vant tab bar sits at Apple's floor, so Sentri should go larger.

### 4.2 List item / row

| Library | Variants | States | Notable |
|---|---|---|---|
| M3 Lists | one-, two-, three-line items; leading media, trailing element | enabled, hovered, focused, pressed, dragged, disabled | Supporting text 1-3 lines; leading media at the leading edge only; gaps preferred over dividers on contained lists ([M3 extract](https://m3.material.io/components/lists/guidelines), [Material Web list](https://github.com/material-components/material-web/blob/main/docs/components/list.md)) |
| Apple lists and tables | grouped / plain / elliptical / bordered styles | selection feedback: brief highlight + checkmark for option lists; persistent highlight for navigation | Keep item text succinct; middle-ellipsis when truncating; row-based text beats images ([HIG](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables)) |
| Vant Cell / CellGroup | `size`, inset grouped, left icon, link (chevron), group title, vertical center | `is-link`, `clickable` | ([Vant Cell](https://github.com/youzan/vant/blob/main/packages/vant/src/cell/README.md)) |
| TDesign Cell / CellGroup | `theme` default / card | `hover`, `arrow` | ([TDesign Cell](https://github.com/Tencent/tdesign-mobile-vue/blob/develop/src/cell/cell.md)) |
| ADM List | list with header, items with prefix/extra/arrow | `clickable`, `arrowIcon`, prefix slot | ([ADM List](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/list/index.en.md)) |

Gloved: row height comes from content lines; give each tappable row one clear target, put the key datum first and secondary info in supporting text, and avoid a second interactive control inside a tappable row (my inference; Atlassian says the same about nested controls in tabs and text fields).

### 4.3 Chips / filter chips / tags

| Library | Variants | States / props | Notable |
|---|---|---|---|
| M3 Chips | assist, filter, input, suggestion; always in a *chip set* (a toolbar) | selected (adds leading check), unselected, disabled, dragged, elevated | Multi-select by default; all sets on a page should be consistently single- or multi-select; trailing remove needs its own 48x48dp target (min chip width 88dp for it) ([M3 extract](https://m3.material.io/components/chips/guidelines), [Material Web chips](https://github.com/material-components/material-web/blob/main/docs/components/chip.md)) |
| ADM Selector | grid of options, `multiple`, `columns` | `showCheckMark`, `disabled`, per-option `description` | The ADM chip-equivalent for filters and forms: "Select one or more from a set of options" ([ADM Selector](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/selector/index.en.md)) |
| ADM Tag | color, fill (solid/outline), round | - | Display only ([ADM Tag](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/tag/index.en.md)) |
| Vant Tag | type, plain, round, mark, closeable, size | - | ([Vant Tag](https://github.com/youzan/vant/blob/main/packages/vant/src/tag/README.md)) |
| TDesign Tag + CheckTag | `theme` default/primary/warning/danger/success; `variant` dark/light/outline/light-outline; `shape` square/round/mark; `size` | CheckTag `checked`, `disabled` (default theme only), `closable` | Splitting display Tag from selectable CheckTag is the clearest separation of "label" vs "control" ([TDesign Tag](https://github.com/Tencent/tdesign-mobile-vue/blob/develop/src/tag/tag.md)) |
| Atlassian Tag | removable, with swatch / icon / metric | - | Tag = low-priority metadata; status goes to Lozenge, counts to Badge ([Tag](https://atlassian.design/components/tag/usage)) |

Gloved: filter chips are small by default (M3 secondary targets need 48dp); for Sentri use ADM Selector's large grid-of-options shape, few options, and a visible check mark so selection is not colour-only.

### 4.4 Bottom sheet / action sheet

| Library | Variants | States / behaviour | Notable |
|---|---|---|---|
| M3 Bottom sheets | standard (non-blocking), modal (dims, tap-outside closes) | drag handle optional, cycles heights; Esc closes | Top 48dp is the touch zone when handle present; needs a single-pointer alternative to dragging; only the handle gets a label (role button) ([M3 a11y extract](https://m3.material.io/components/bottom-sheets/accessibility)) |
| Apple Sheets | modal / nonmodal; detents medium / large | Cancel (leading), Done (trailing), Back for steps; swipe to dismiss | One sheet at a time; never show Cancel + Done + Back together; include grabber; confirm with an action sheet if unsaved changes ([HIG sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)) |
| Apple Action sheets | - | Cancel at bottom; destructive on top | Use for choices tied to an action, not alerts or menus; avoid scrolling; short title, message only if needed ([HIG action sheets](https://developer.apple.com/design/human-interface-guidelines/action-sheets)) |
| ADM ActionSheet / Popup | actions with `danger`, `description`, `disabled`, `bold`; `cancelText` | `closeOnMaskClick`, `closeOnAction`, `safeArea` | "two or more options related to the current scene" ([ADM ActionSheet](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/action-sheet/index.en.md)) |
| Vant ActionSheet | with icon, cancel button, description, option status (disabled/loading), custom panel | `round`, `close-on-click-action` | ([Vant ActionSheet](https://github.com/youzan/vant/blob/main/packages/vant/src/action-sheet/README.md)) |
| TDesign ActionSheet | `theme`: list / grid | `showCancel`, `showOverlay` | ([TDesign ActionSheet](https://github.com/Tencent/tdesign-mobile-vue/blob/develop/src/action-sheet/action-sheet.md)) |

Gloved: bottom sheets keep controls in thumb reach; give a visible Close/Cancel button as well as swipe (Apple + M3 both say not to rely on the gesture alone); keep action sheets to few big buttons (watchOS guidance caps at 4 buttons incl. Cancel; Apple says avoid scrolling).

### 4.5 Picker / multi-select / nested (cascading)

| Library | Components | Variants | Notable |
|---|---|---|---|
| Apple Pickers | picker (wheels), date picker (compact / inline / wheels) | modes date / time / date+time / countdown | For short lists use a segmented control; for very large sets use a list/table; "avoid switching views to show a picker" ([HIG](https://developer.apple.com/design/human-interface-guidelines/pickers)) |
| ADM | Picker, CascadePicker, DatePicker (wheel columns); **Cascader** (tabbed levels); Selector (multi) | Cascader: `options` with `children`, async/skeleton loading, `optionRender`, `activeIcon` | Cascader "selection of multi-level data" e.g. provinces; Picker: "fewer than 5 options, tile them with Radio instead" ([ADM Cascader](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/cascader/index.en.md), [ADM Picker](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/picker/index.en.md)) |
| Vant | Picker (incl. a "Cascade" example with `children`), **Cascader**, DropdownMenu | Cascader: async options, custom field names, custom content slot with level indicator, `active-color` | Typical use is a Field (`is-link`, readonly) that opens a Popup containing the Cascader; the Field shows the path "A/B" after finish ([Vant Cascader](https://github.com/youzan/vant/blob/main/packages/vant/src/cascader/README.md), [Vant Picker](https://github.com/youzan/vant/blob/main/packages/vant/src/picker/README.md)) |
| TDesign | Picker, **Cascader** | `theme`: **step** (default) / tab; `subTitles` per level; `load` for lazy children; `checkStrictly` | Step theme uses a 44px step row and 8px dots to show level; options area 320px; `title`, `closeBtn` ([TDesign Cascader](https://github.com/Tencent/tdesign-mobile-vue/blob/develop/src/cascader/cascader.md)) |
| Atlassian Select | single / multi (tags + clear-all) | - | Order options logically (not alphabetically for localisation), keep options to one line, group only when all can be grouped ([Select](https://atlassian.design/components/select/usage)) |

**How nested/cascading selection is done well** (what the three Chinese kits agree on):
1. Open from a read-only field row (label + placeholder + chevron) into a bottom popup; do not switch screens (matches Apple "avoid switching views", [Pickers](https://developer.apple.com/design/human-interface-guidelines/pickers)).
2. Show **one level at a time** as tabs/steps across the top (ADM Cascader tabs, TDesign step/tab themes, Vant Cascader). Each level's pick auto-advances to the next level ([ADM Cascader](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/cascader/index.en.md)).
3. Previously chosen levels stay visible as tabs, so people can tap back and change a higher level.
4. The result is written back to the field as a path (Vant: "A/B/C").
5. Provide a title, a close/cancel affordance, a placeholder for unchosen levels (ADM `placeholder` default "please select"; TDesign `placeholder`), and lazy-load with skeleton/loading state for large trees.

Gloved: this is the right model for few big choices per screen; the wheel Picker needs fine scrolling, so for Sentri prefer the Cascader/Selector forms over wheels. (Inference; none of the sources test with gloves.)

### 4.6 Slider / range slider

| Library | Variants | States / props | Notable |
|---|---|---|---|
| M3 Sliders | continuous, discrete (stops), range; XS-XL sizes (16 / 24 / 40 / 56 / 96dp); centered | value label only while dragging; disabled | Handle snaps to nearest stop; avoid too many stops; avoid vertical range slider; min/max icons or text outside to show scale; optional synced text field; no inset icons on range sliders ([M3 extract](https://m3.material.io/components/sliders/guidelines), [Material Web slider](https://github.com/material-components/material-web/blob/main/docs/components/slider.md)) |
| Apple Sliders | with min/max icons; macOS tick marks | - | Min on leading side; consider pairing with a text field and stepper for wide ranges ([HIG](https://developer.apple.com/design/human-interface-guidelines/sliders)) |
| ADM Slider | single, range (dual), ticks, marks | `disabled`, `step` | ([ADM Slider](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/slider/index.en.md)) |
| Vant Slider | single, dual thumb (`range`), vertical, custom button | `disabled`, `readonly`, `step`, `button-size` (default 24px), `bar-height` (default 2px) | ([Vant Slider](https://github.com/youzan/vant/blob/main/packages/vant/src/slider/README.md)) |
| TDesign Slider | single, range, `marks`, `showExtremeValue`, `theme` | `disabled`, `step` | ([TDesign Slider](https://github.com/Tencent/tdesign-mobile-vue/blob/develop/src/slider/slider.md)) |
| Atlassian Range | single | - | "Avoid ranges when an exact value matters... less precise than typing"; not for non-numeric choices ([Range](https://atlassian.design/components/range/usage)) |

Gloved: Vant's defaults (2px bar, 24px thumb) are far too small for gloves; M3's L/XL sizes and Atlassian's "sliders are imprecise" point to Sentri using a steppers/numpad for exact values and a large-thumb slider only for coarse ranges. Sentri already moved weights to a numpad (git: "weights on the Numpad").

### 4.7 Text field (incl. optional fields)

| Library | Variants | States | Optional / required handling | Notable |
|---|---|---|---|---|
| M3 Text fields | filled, outlined; textarea | enabled, hover, focus, error, disabled | "required" marked with asterisk on label plus supporting text; supporting text can be replaced by error text; character counter ([Material Web text field](https://github.com/material-components/material-web/blob/main/docs/components/text-field.md)) | Prefix / suffix, leading / trailing icon |
| Apple Text fields | - | - | No optional guidance | Placeholder disappears when typing so also use a label; show the right keyboard type; Clear button; validate on field exit for email ([HIG](https://developer.apple.com/design/human-interface-guidelines/text-fields)) |
| ADM Input / Form | Input; Form with `requiredMarkStyle` | validation via Form `rules` | **`requiredMarkStyle`: `asterisk` / `text-required` / `text-optional` / `none`**, so optional fields can be labelled "optional" instead of marking required ones ([ADM Form](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/form/index.en.md)) | `required` only controls appearance |
| Vant Field | types incl. number / tel; textarea auto-resize; word limit | disabled, readonly, error, error-message | `required` (style only) or `required="auto"` from rules ([Vant Field](https://github.com/youzan/vant/blob/main/packages/vant/src/field/README.md)) | Label align, input align, insert button, clearable |
| TDesign Input | - | disabled, readonly, error status | ([TDesign Input](https://github.com/Tencent/tdesign-mobile-vue/blob/develop/src/input/input.md)) | |
| Polaris | Text field with `details` (help), `error`, prefix/suffix, accessory | Error, Disabled, Read-only, Required | "Required adds an indicator... does not validate"; the page gives **no optional-field guidance** ([Polaris](https://shopify.dev/docs/api/app-home/polaris-web-components/forms/textfield)) | Error text must say what is wrong and how to fix it |
| Atlassian Textfield | - | (no state section) | - | Always a visible label; placeholder is not a label; helper text for formats so it stays after typing; `aria-live=polite` errors ([Textfield](https://atlassian.design/components/textfield/usage)) |

Optional fields, summary: the only explicit mechanism is ADM's `text-optional` mark; everyone else marks *required* with an asterisk. For Sentri: mark the exception, and the exception should be the rarer case (see section 6). Gloved: use numeric keypad types (Apple: show the appropriate keyboard) and avoid free text.

### 4.8 Heading / typography usage

I could not retrieve a heading-usage page from M3 (JS-rendered, [type scale](https://m3.material.io/styles/typography/overview) not extractable here), so treat M3 specifics as unverified. What is verified:

- **Apple**: segment labels and column headings are nouns / short noun phrases, with no ending punctuation ([Segmented controls](https://developer.apple.com/design/human-interface-guidelines/segmented-controls), [Lists and tables](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables)); action sheet titles one line ([Action sheets](https://developer.apple.com/design/human-interface-guidelines/action-sheets)).
- **Atlassian**: headings and information shared by all tabs go *above* the tab line ([Tabs](https://atlassian.design/components/tabs/usage)); labels short (1-2 words).
- **TDesign** wires a token to the component: `--td-cascader-title-font: @font-title-large` ([TDesign Cascader](https://github.com/Tencent/tdesign-mobile-vue/blob/develop/src/cascader/cascader.md)). Vant gives group title its own line-height variable ([Vant Cell](https://github.com/youzan/vant/blob/main/packages/vant/src/cell/README.md)). Takeaway: **each component's title/label slots map to named type tokens**, not ad-hoc sizes.
- Heading/typography is a *foundation* (tokens), applied inside components, not a component of its own in any of these systems.

---

## 5. Judge checklist (objectively checkable)

A component page and its HTML/CSS/JS pass if:

1. **Purpose line**: one sentence stating the job, plus a "use X instead for Y" line naming at least one sibling component (cf. [Atlassian Tag](https://atlassian.design/components/tag/usage)).
2. **When / when not**: both subsections present; "when not" names an alternative that exists in the library.
3. **Anatomy**: every part is named, optional parts marked, and the demo shows all parts.
4. **Variants**: each variant has its own when-to-use sentence, and variant count is the smallest that covers real Sentri screens (no variant without a screen that uses it).
5. **States table**: the designed states are Default, Pressed, Selected/Checked, Disabled (with its reason), Error, Loading/Waiting, Empty, and Long label / Chinese, whichever apply; each is shown in a rendered example. Hover, Focus and keyboard rows are not designed states: Sentri is a touch app, and the OS screen reader draws its own focus outline.
6. **Target size**: every tap target measured in the rendered CSS is at least 48 CSS px (set Sentri's glove floor here; Apple floor 44pt [HIG](https://developer.apple.com/design/human-interface-guidelines/buttons), M3 48dp [M3](https://m3.material.io/foundations/interaction/inputs)); neighbouring targets do not overlap.
7. **Choice cap**: the component states a maximum number of visible choices (e.g. segmented 2-5 per [M3](https://m3.material.io/components/segmented-buttons/guidelines) / [Apple](https://developer.apple.com/design/human-interface-guidelines/segmented-controls)) and the demo respects it.
8. **Not colour-only**: selected, error and disabled each differ by something other than colour (check mark, text, icon, shape); check marks as in [M3 filter chips](https://m3.material.io/components/chips/guidelines).
9. **Content rules**: label max length and casing stated; truncation behaviour shown with a long-label example (cf. [Atlassian Tag](https://atlassian.design/components/tag/usage), [Select](https://atlassian.design/components/select/usage)).
10. **Accessibility**: the screen-reader role, name and state are stated (VoiceOver, TalkBack); every tap target is at least 48px; no action depends on a gesture alone (swipe/drag always has a visible control per [M3 sheets](https://m3.material.io/components/bottom-sheets/accessibility) and [Apple sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)); reading order matches the visual order. No focus ring, hover or keyboard row is designed (web-only, not adopted; the Atlassian Tabs keyboard rule is cited in section 4 as research only).
11. **Tokens only**: CSS has no raw colour, size or font values; every one resolves to a named token, and the component lists its CSS variables (cf. [Vant Cell](https://github.com/youzan/vant/blob/main/packages/vant/src/cell/README.md), [ADM Segmented](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/segmented/index.en.md)).
12. **Form fields**: visible label (placeholder never the label), help text persists after typing, error text says what is wrong and how to fix it, correct input type/keyboard ([Atlassian](https://atlassian.design/components/textfield/usage), [Polaris](https://shopify.dev/docs/api/app-home/polaris-web-components/forms/textfield), [Apple](https://developer.apple.com/design/human-interface-guidelines/text-fields)).
13. **Overlays**: modal overlays have a visible close/cancel, one overlay at a time, and unsaved-change exit asks first (Apple [sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)).
14. **Related and classification**: page links related components and states whether it is a new component, a variant of one, or a pattern (see section 3 rule).
15. **Rendered proof**: a screenshot of the component in every state at the 375px phone width, with no overflow or clipped text (a Sentri-side requirement, not from the sources).

---

## 6. Reference set recommendation

**Primary (use as the page-structure and behaviour reference):**

1. **Ant Design Mobile** ([mobile.ant.design](https://mobile.ant.design/)): mobile-only; clean "When to Use" per component; the best Selector (chip-like multi-choice), Cascader, Form `requiredMarkStyle: text-optional` for optional fields; CSS variables per component; targets Chinese users ([ADM repo docs](https://github.com/ant-design/ant-design-mobile/tree/master/src/components)).
2. **TDesign Mobile** ([tdesign.tencent.com/mobile-vue](https://tdesign.tencent.com/mobile-vue)): token-driven (every component exposes `--td-*` mapped to global tokens), the clearest separation of Tag vs CheckTag, Cascader with step/tab themes and lazy load ([TDesign repo](https://github.com/Tencent/tdesign-mobile-vue/tree/develop/src)).
3. **Material Design 3 + Apple HIG together as the *guidance* reference** (they are the only sources with real do/don't, accessibility and behaviour prose): M3 for chips, sheets, sliders, targets; Apple for sheets/action sheets and segmented-control content rules. Both are native-first, so take rules, not styling.

**Secondary (page structure only):** Atlassian for the page template (Usage / Parts / Accessibility / Content guidelines / Related, with explicit "when not to use" and sibling tables). Polaris for property/state documentation (now a web-component API).

**Vant**: useful as a second web implementation to compare against (good async Cascader and Field examples), but its pages have almost no guidance prose or accessibility, and several defaults (24px thumb, 2px bar) fail glove-size targets.

**Gaps none of them fill (Sentri must write its own):**
- A glove-size floor larger than 44-48 (none of the sources studied gloves).
- Variant-vs-component rule (libraries disagree: ADM splits Tabs into three components, Vant/TDesign use a prop).
- The optional-field convention (only ADM has `text-optional`; the rest mark required).
- Where patterns live and how a component page links to them.

---

## Source index

- Apple HIG: <https://developer.apple.com/design/human-interface-guidelines/>
- M3: <https://m3.material.io/components>; Material Web docs <https://github.com/material-components/material-web/tree/main/docs/components>
- Ant Design Mobile: <https://mobile.ant.design/>, source <https://github.com/ant-design/ant-design-mobile/tree/master/src/components>
- Vant: <https://vant-ui.github.io/vant/>, source <https://github.com/youzan/vant/tree/main/packages/vant/src>
- TDesign Mobile Vue: <https://tdesign.tencent.com/mobile-vue>, source <https://github.com/Tencent/tdesign-mobile-vue/tree/develop/src>
- Polaris: <https://shopify.dev/docs/api/polaris>
- Atlassian Design System: <https://atlassian.design/components>, <https://atlassian.design/contribution>
