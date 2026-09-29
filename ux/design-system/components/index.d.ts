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

/** Candidate (ADR 0001). Event contract for all three field cards: every control is a
 *  `<button data-action data-value="<field key>">`; delegate with `closest('[data-action]')`.
 *  The root carries `data-field`. A floor-gray key is `aria-disabled` and still fires. */

/** A text action shown in a Stepper's hint line (the fourth register, ≥44px). */
export interface StepperPointer { label: string; action: string; value?: string; strs?: Strs<'label'>; args?: StrArgs<'label'> }

/** Candidate. `− n +`: keys are `<button data-action data-value=key data-step="-step|step">`.
 *  A key emits a requested delta; the host posts it (immediate host) or adds it to a draft (staged host). */
export interface StepperProps {
  label: string;
  /** One muted line under the label, e.g. "among 11 alive". */
  description?: string;
  /** Always prints; 0 prints in muted. */
  value: number;
  /** Floor; default 0. − at the floor wears the floor-gray. */
  min?: number;
  /** Ceiling; omit when + is free. Pass ceiling copy in `hint` whenever set. 4ch value cell when ≥ 1000. */
  max?: number;
  /** Default 1. No auto-repeat; a double tap is two steps. */
  step?: number;
  /** Sent as data-value and data-field. */
  key?: string;
  /** Default "step". */
  action?: string;
  /** row: 60px sheet row (default) · hero: the count sheet's one number. */
  variant?: 'row' | 'hero';
  /** A corrected value in Edit, amber. `tone: 'changed'` is accepted as an alias. */
  changed?: boolean;
  /** The value carries an unsaved staged addition (dead drawer): green, the number is the receipt. Wins over changed.
   *  `tone: 'draft'` is accepted as an alias. */
  draft?: boolean;
  tone?: 'changed' | 'draft';
  /** The hint line: ceiling copy, or the hero's receipt. */
  hint?: string;
  /** Text actions at the floor: `Found dead? Record dead` · `Wrong count? Edit`. */
  pointers?: StepperPointer[];
  /** Override the reserved hint line (default: 44px where pointers can appear, one line with a max, none otherwise). */
  reserveHint?: boolean;
  /** Id of the label element; generated when omitted. */
  id?: string;
  className?: string;
  /** value gets args {n} automatically; decrease/increase are the keys' aria-labels (data-str-attr),
   *  each key named by the row label + its own label. */
  strs?: Strs<'label' | 'description' | 'value' | 'hint' | 'decrease' | 'increase'>;
  args?: StrArgs<'label' | 'description' | 'value' | 'hint' | 'decrease' | 'increase'>;
}

/** Candidate. A measured value with its unit; the box is
 *  `<button data-action="open-numpad" data-value=key aria-expanded aria-controls>`. */
export interface MeasureProps {
  label: string;
  /** A muted word beside the label, e.g. "Optional". */
  optional?: string;
  /** The typed string, verbatim ("16."); empty prints the placeholder. Missing is not zero. */
  value?: string;
  /** Always written, e.g. "kg" or "°". */
  unit: string;
  /** false sets the unit tight to the value (`40.6°`). Default true. */
  unitGap?: boolean;
  /** Default "—". */
  placeholder?: string;
  key?: string;
  /** Default "open-numpad". */
  action?: string;
  /** The docked Numpad is editing it: ink border and caret; the range is not checked. */
  active?: boolean;
  /** The pad's id, for aria-controls. */
  controls?: string;
  /** Soft range [min, max], checked only when not active: outside it the tone becomes warn. */
  range?: [number, number];
  /** warn: soft amber hint, records · refused: struck amber, not recorded; the host withholds the primary. */
  tone?: 'warn' | 'refused' | 'changed';
  /** Corrected in Edit: the value prints amber; stands beside warn or refused. */
  changed?: boolean;
  /** Status line: range words (`Usual 8.8–27.5 kg · this is 30.4`) or the refusal. */
  hint?: string;
  /** A muted line under the hint, e.g. `was 16.8 kg`. */
  note?: string;
  id?: string;
  className?: string;
  strs?: Strs<'label' | 'optional' | 'value' | 'unit' | 'placeholder' | 'hint' | 'note'>;
  args?: StrArgs<'label' | 'optional' | 'value' | 'unit' | 'placeholder' | 'hint' | 'note'>;
}

/** A running-list line; tone 'warn' keeps an amber mark (`000254 · 1.42 kg · also on B04`). */
export interface NumpadRecent { text: string; tone?: 'warn'; strs?: Strs<'text'>; args?: StrArgs<'text'> }
/** A text action in a status line, e.g. `Use 000258`. */
export interface FieldAction { label: string; action: string; value?: string; strs?: Strs<'label'>; args?: StrArgs<'label'> }
/** Candidate. 1–9 · [. or gap] 0 ⌫; keys are `<button data-action data-value=key data-key="0-9|.|back">`.
 *  No commit key: the surface's bar primary commits. Keys never move. */
export interface NumpadProps {
  /** The readout's label ("Piglet 5 of 11 · ear tag"); omit for keys only, under a Measure. */
  label?: string;
  /** The typed string — always a string (tags keep leading zeros). */
  value?: string;
  unit?: string;
  placeholder?: string;
  /** value is the next tag in sequence: muted, recordable as-is. */
  suggested?: boolean;
  /** 0 (default): no decimal key, its slot stays empty. n: a "." key and n places. */
  decimals?: number;
  /** Total digits (6 for ear tags). */
  maxLength?: number;
  /** Whole digits of a decimal value before the point. */
  intLength?: number;
  /** Newest first; at most three shown; three lines reserved in a run. */
  recent?: NumpadRecent[] | null;
  /** The root id, for a Measure's aria-controls. */
  id?: string;
  key?: string;
  /** Default "numpad". */
  action?: string;
  /** warn: amber hint (duplicate tag, short tag, unusual weight); the value still records. */
  tone?: 'warn';
  /** The status line (role=status, always mounted, 44px, scrolls inside itself). */
  hint?: string;
  /** Text actions in the status line, e.g. the named `Use 000258` transition. */
  actions?: FieldAction[];
  className?: string;
  /** digit gets args {n} per key; back, pad and recent are aria-labels (data-str-attr). */
  strs?: Strs<'label' | 'value' | 'unit' | 'placeholder' | 'hint' | 'digit' | 'decimal' | 'back' | 'pad' | 'recent'>;
  args?: StrArgs<'label' | 'value' | 'unit' | 'placeholder' | 'hint' | 'decimal' | 'back' | 'pad' | 'recent'>;
}

/** The typed draft the host holds between keys. */
export interface NumpadState { value: string; suggested?: boolean; suggestion?: string }
export type NumpadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '.' | 'back';
/** 'suggestion' is the named transition back to the suggested tag (never the last ⌫). */
export type NumpadInputKey = NumpadKey | 'suggestion';
export interface NumpadLimits { decimals?: number; maxLength?: number; intLength?: number }

export interface SentriUI {
  stepper(props: StepperProps): string;
  measure(props: MeasureProps): string;
  numpad(props: NumpadProps): string;
  /** Apply one key; `dead` says which dead tap to answer in the hint line. */
  numpadInput(state: NumpadState, key: NumpadInputKey, limits?: NumpadLimits): Required<NumpadState> & { dead: null | 'full' | 'point' | 'empty' };
  /** A scan replaces whatever is typed or suggested; invalid (not digits, wrong length) keeps the state with dead 'scan'. */
  numpadScan(state: NumpadState, scanned: string, limits?: { maxLength?: number }): Required<NumpadState> & { dead: null | 'scan'; scanned: boolean };
  /** The committed value: `16.` → `16`, weights lose leading zeros, empty → null (missing). */
  numpadCommit(value: string, options?: { decimals?: number }): string | null;
  /** Hardware keyboard / wedge scanner → pad key; Enter returns 'enter' and never commits. */
  numpadKey(event: Pick<KeyboardEvent, 'key'>): NumpadKey | 'enter' | null;
  /** Wedge-scanner bursts (≥ minKeys digits, each ≤ gap ms apart, ending in Enter) go to onScan once; other keys to onKey. */
  numpadScanner(options: { onKey?: (key: NumpadKey) => void; onScan?: (digits: string) => void; gap?: number; minKeys?: number; now?: () => number; later?: (f: () => void, ms: number) => unknown; cancel?: (handle: unknown) => void }): { handle(event: Pick<KeyboardEvent, 'key'>): boolean; flush(): void };
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
