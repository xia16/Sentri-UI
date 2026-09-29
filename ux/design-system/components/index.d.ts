/**
 * Sentri's shared component layer. Every function returns an HTML string;
 * the caller owns state, business rules and navigation, and wires clicks by
 * delegating on `data-action` / `data-value`. All text arguments are escaped;
 * arguments named `icon`, `action` (heading), `trailing`, `control`, `lead`
 * and `valueHtml` are raw HTML the caller must trust.
 */

/** An icon's SVG markup, e.g. `SentriIcons.icon('chevron')`. */
type IconHtml = string;
/** Only `data-*` and `aria-*` keys are kept; everything else is dropped. */
type SafeAttrs = Record<string, string | number | boolean>;
/** Registry ids for a component's text slots. The slot is wrapped in `<span data-str="id">`
 *  and filled by the screen shell; without an id the output is unchanged. */
type Strs<K extends string> = { [P in K]?: string };
/** Arguments for the string at each slot, written as `data-args` JSON. */
type StrArgs<K extends string> = { [P in K]?: Record<string, unknown> };

export interface HeadingProps {
  title: string;
  /** Leading 16px icon. */
  icon?: IconHtml;
  /** One muted line under the title. */
  description?: string;
  /** Short right-aligned muted text, e.g. "Mon 09:42". */
  meta?: string;
  /** Raw HTML for one right-aligned text action (a button or link). */
  action?: string;
  /** page 22px · section 13px (default) · panel 12px · group 11px muted. */
  kind?: 'page' | 'section' | 'group' | 'panel';
  /** h1–h6; default 4. */
  level?: number;
  className?: string;
  strs?: Strs<'title' | 'description' | 'meta'>;
  args?: StrArgs<'title' | 'description' | 'meta'>;
}

export interface PanelOptions {
  className?: string;
  tag?: 'div' | 'section' | 'article' | 'aside' | 'dl';
}

export interface Fact {
  label: string;
  /** Empty or null renders an em dash. */
  value?: string | number | null;
  /** Trusted HTML in place of value. */
  valueHtml?: string;
  /** A small muted line under the value. */
  meta?: string;
  strs?: Strs<'label' | 'value' | 'meta'>;
  args?: StrArgs<'label' | 'value' | 'meta'>;
}

export interface RowProps {
  title: string;
  description?: string;
  /** 18px icon in a 34px tinted tile. */
  icon?: IconHtml;
  /** When set the row is a <button data-action> with a chevron; otherwise a static <div>. */
  action?: string;
  value?: string;
  disabled?: boolean;
  /** Trusted HTML before the chevron (a status word, a count). */
  trailing?: string;
  attrs?: SafeAttrs;
  className?: string;
  /** With strs.trailing, `trailing` is escaped fallback text rather than trusted HTML. */
  strs?: Strs<'title' | 'description' | 'trailing'>;
  args?: StrArgs<'title' | 'description' | 'trailing'>;
}

export interface LogEntry {
  title: string;
  detail?: string;
  /** Timestamp and author: "Jul 8 · 07:14 · G.H". */
  meta?: string;
  /** 9px label above the title. */
  category?: string;
  extraHtml?: string;
  strs?: Strs<'category' | 'title' | 'detail' | 'meta'>;
  args?: StrArgs<'category' | 'title' | 'detail' | 'meta'>;
}
export interface LogGroup { label?: string; entries: LogEntry[]; strs?: Strs<'label'>; args?: StrArgs<'label'> }

export interface Category { id: string; label: string; disabled?: boolean; strs?: Strs<'label'>; args?: StrArgs<'label'> }
export interface CategoryFooterProps {
  categories: Category[];
  active?: string;
  /** Default "back". */
  backAction?: string;
  /** Default "action-category". */
  categoryAction?: string;
  /** Accessible name of the tab nav; default "Action categories". */
  label?: string;
  className?: string;
  /** back = the Back text. The nav `label` is an aria-label and has no twin. */
  strs?: Strs<'back'>;
  args?: StrArgs<'back'>;
}

export interface PickerFieldProps {
  /** Raw HTML label text (usually a plain string). */
  label?: string;
  value?: string;
  /** Text shown in place of value. */
  display?: string;
  /** Default "Choose". */
  placeholder?: string;
  /** Default "open-picker". */
  action?: string;
  /** Sent as data-picker-key so one handler can open the right sheet. */
  key?: string;
  disabled?: boolean;
  className?: string;
  /** display (or value) targets the shown value; placeholder targets the empty state. */
  strs?: Strs<'label' | 'display' | 'value' | 'placeholder'>;
  args?: StrArgs<'label' | 'display' | 'value' | 'placeholder'>;
}

/** [value, label, subtitle?, groupName?, ids?]; a group's ids come from its first option. */
export type PickerOption = [string, string, string?, string?, { strs?: Strs<'label' | 'sub' | 'group'>; args?: StrArgs<'label' | 'sub' | 'group'> }?];

export interface ChoiceRowProps {
  label: string;
  meta?: string;
  /** navigate: chevron · single: check when selected · multi: checkbox. */
  mode?: 'navigate' | 'single' | 'multi';
  action?: string;
  value?: string;
  selected?: boolean;
  attrs?: SafeAttrs;
  className?: string;
  strs?: Strs<'label' | 'meta'>;
  args?: StrArgs<'label' | 'meta'>;
}

export interface SegmentProps {
  /** [value, label, ids?] — the label is raw HTML so a count can be marked up. */
  options: [string, string, { strs?: Strs<'label'>; args?: StrArgs<'label'> }?][];
  active?: string;
  action?: string;
  ariaLabel?: string;
  className?: string;
}

export interface IconButtonProps {
  action?: string;
  icon: IconHtml;
  /** Required: becomes aria-label. */
  label: string;
  value?: string;
  /** A count badge, e.g. the number of applied filters. */
  badge?: string | number;
  disabled?: boolean;
  className?: string;
  /** badge only; `label` is an aria-label and has no twin. */
  strs?: Strs<'badge'>;
  args?: StrArgs<'badge'>;
}

/** Candidate. `− n +`: each key is `<button data-action data-value=key data-step="-1|1">`.
 *  A key at the floor (− at min) or ceiling (+ at max) is aria-disabled (the floor-gray), still tappable. */
export interface StepperProps {
  label: string;
  /** One muted line under the label, e.g. "among 11 alive". */
  description?: string;
  /** Always prints; 0 prints in muted. */
  value: number;
  /** Floor; default 0. */
  min?: number;
  /** Ceiling; omit when + is free. */
  max?: number;
  /** Sent as data-value. */
  key?: string;
  /** Default "step". */
  action?: string;
  /** row: 60px sheet row (default) · hero: the count sheet's one number. */
  variant?: 'row' | 'hero';
  /** changed: a corrected value in Edit, amber. */
  tone?: 'changed';
  /** One line under the row: the floor pointer, or the hero's receipt. */
  hint?: string;
  /** Id of the label element; generated when omitted. */
  id?: string;
  className?: string;
  /** value gets args {n} automatically; decrease/increase are the keys' aria-labels (data-str-attr). */
  strs?: Strs<'label' | 'description' | 'value' | 'hint' | 'decrease' | 'increase'>;
  args?: StrArgs<'label' | 'description' | 'value' | 'hint' | 'decrease' | 'increase'>;
}

/** Candidate. A measured value with its unit; the box is `<button data-action="open-numpad" data-value=key>`. */
export interface MeasureProps {
  label: string;
  /** A muted word beside the label, e.g. "Optional". */
  optional?: string;
  /** The typed string ("16.8"); empty prints the placeholder. Missing is not zero. */
  value?: string;
  /** Always written, e.g. "kg". */
  unit: string;
  /** Default "—". */
  placeholder?: string;
  key?: string;
  /** Default "open-numpad". */
  action?: string;
  /** The Numpad is open beneath it: ink border and caret. */
  active?: boolean;
  /** Soft range [min, max]: outside it the tone becomes warn (the value still records). */
  range?: [number, number];
  /** warn: soft amber hint · refused: struck amber, not recorded · changed: corrected in Edit. */
  tone?: 'warn' | 'refused' | 'changed';
  hint?: string;
  id?: string;
  className?: string;
  strs?: Strs<'label' | 'optional' | 'value' | 'unit' | 'placeholder' | 'hint'>;
  args?: StrArgs<'label' | 'optional' | 'value' | 'unit' | 'placeholder' | 'hint'>;
}

export interface NumpadRecent { text: string; strs?: Strs<'text'>; args?: StrArgs<'text'> }
/** Candidate. 1–9 · [. or gap] 0 ⌫; each key is `<button data-action data-value=key data-key="0-9|.|back">`.
 *  No commit key: the surface's bar primary commits. */
export interface NumpadProps {
  /** The readout's label ("Piglet 5 of 11 · ear tag"); omit for keys only, under a Measure. */
  label?: string;
  /** The typed string. */
  value?: string;
  unit?: string;
  placeholder?: string;
  /** value is the next tag in sequence, muted until the first key replaces it. */
  suggested?: boolean;
  /** 0 (default): no decimal key, its slot stays empty. n: a "." key and n places. */
  decimals?: number;
  /** Digits before the digit keys go floor-gray (6 for ear tags). */
  maxLength?: number;
  /** Newest first; at most three shown. */
  recent?: NumpadRecent[];
  key?: string;
  /** Default "numpad". */
  action?: string;
  /** error: red readout, cannot record as typed · warn: amber hint, still records. */
  tone?: 'error' | 'warn';
  hint?: string;
  className?: string;
  /** digit gets args {n} per key; back, pad and recent are aria-labels (data-str-attr). */
  strs?: Strs<'label' | 'value' | 'unit' | 'placeholder' | 'hint' | 'digit' | 'decimal' | 'back' | 'pad' | 'recent'>;
  args?: StrArgs<'label' | 'value' | 'unit' | 'placeholder' | 'hint' | 'decimal' | 'back' | 'pad' | 'recent'>;
}

export interface SentriUI {
  stepper(props: StepperProps): string;
  measure(props: MeasureProps): string;
  numpad(props: NumpadProps): string;
  heading(props: HeadingProps): string;
  panel(content: string, options?: PanelOptions & { ds?: string }): string;
  facts(items: Fact[], options?: { columns?: 1 | 2 | 3; className?: string }): string;
  row(props: RowProps): string;
  rowGroup(content: string, options?: { title?: string; level?: number; className?: string; strs?: Strs<'title'>; args?: StrArgs<'title'> }): string;
  log(groups: LogGroup[], options?: { empty?: string; className?: string; strs?: Strs<'empty'>; args?: StrArgs<'empty'> }): string;
  categoryFooter(props: CategoryFooterProps): string;
  field(props: { label?: string; control?: string; className?: string; ds?: string }): string;
  pickerField(props: PickerFieldProps): string;
  pickerOptions(props: { options: PickerOption[]; selected?: string; action?: string; className?: string }): string;
  chooserList(content: string, options?: { tone?: 'flat' | 'inset'; className?: string; ds?: string }): string;
  choiceRow(props: ChoiceRowProps): string;
  choiceGroup(rows: string | string[], options?: { title?: string; lead?: string; className?: string; strs?: Strs<'title'>; args?: StrArgs<'title'> }): string;
  choiceSearch(props?: { label?: string; placeholder?: string; value?: string; attrs?: SafeAttrs }): string;
  choiceEmpty(text: string, options?: { strs?: Strs<'text'>; args?: StrArgs<'text'> }): string;
  segment(props: SegmentProps): string;
  iconButton(props: IconButtonProps): string;
}

export interface SentriIcons {
  /** name → SVG path data on a 24×24 grid. */
  readonly paths: Readonly<Record<IconName, string>>;
  /** `<svg viewBox="0 0 24 24" aria-hidden="true"><path d=…/></svg>`; an unknown name falls back to chevron. */
  icon(name: IconName): string;
}

export type IconName =
  | 'more' | 'monitor' | 'treat' | 'hospital' | 'profile' | 'chart' | 'origin' | 'back' | 'chevron' | 'close'
  | 'check' | 'note' | 'feed' | 'link' | 'condition' | 'weight' | 'search' | 'grid' | 'scan' | 'clock'
  | 'alert' | 'signal' | 'battery' | 'filter' | 'minus' | 'plus' | 'record' | 'camera' | 'edit' | 'wrench'
  | 'details' | 'calendar' | 'bookmark' | 'transfer' | 'down' | 'arrow' | 'place' | 'home' | 'toolbox' | 'spark'
  | 'heat' | 'pregnancy' | 'farrow' | 'barn' | 'return' | 'send' | 'health' | 'temperature' | 'humidity' | 'air'
  | 'upload' | 'offline' | 'backspace';

declare global {
  interface Window { SentriUI: SentriUI; SentriIcons: SentriIcons }
}
