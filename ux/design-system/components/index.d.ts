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
  /** A string, or (candidate, ADR 0002) a token list with colour on the value: `[[{text:'Overdue'},{text:'3 days',tone:'red'}]]`. */
  title: string | Token[];
  /** A string, or (candidate) a token list the row draws with `·` between tokens — the row law's line 2. */
  description?: string | Token[];
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
  /** Candidate: a leading mono identifier (crate `A02`), in a column `row-code-min` wide. */
  code?: string;
  /** Candidate: line 2 set in mono (the row law). */
  mono?: boolean;
  /** Candidate: the row's one status chip (a Status word). */
  chip?: StatusProps;
  /** Candidate: title and description wrap instead of truncating (evidence lines, long mono tokens). */
  wrap?: boolean;
  /** Candidate: the rail. Default: a chevron when `action` is set; 'edit' draws ✎ (a done row whose tap opens Edit); 'none'. */
  rail?: 'chevron' | 'edit' | 'none';
  /** Candidate: select mode — a <label> with a checkbox trail (bulk picks); `action` and the chevron are not drawn. */
  select?: { checked?: boolean; action?: string; value?: string };
  /** Candidate: a second target. The copy becomes the door (`action`, with an inline ›) and this Button acts in one tap. */
  act?: ButtonProps;
  /** Token parts join without spaces (zh strings that carry none). */
  tight?: boolean;
  strs?: Strs<'title' | 'description' | 'trailing' | 'code'>;
  args?: StrArgs<'title' | 'description' | 'trailing' | 'code'>;
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
/** description (candidate, ADR 0002): one muted line under the group label. */
export interface LogGroup { label?: string; description?: string; entries: LogEntry[]; strs?: Strs<'label' | 'description'>; args?: StrArgs<'label' | 'description'> }

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
  /** navigate: chevron · single: check when selected · multi: checkbox · radio (candidate): a visible ring, role=radio. */
  mode?: 'navigate' | 'single' | 'multi' | 'radio';
  action?: string;
  value?: string;
  selected?: boolean;
  /** Candidate: the label is an identifier, set in mono (crate codes, ear tags). */
  mono?: boolean;
  /** radio only: the roving tab stop (0) or not (-1). */
  tabindex?: 0 | -1;
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
  /** Candidate (ADR 0002): a run without the running list; the host speaks the last record in the status line. */
  compact?: boolean;
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

/* ---- Design-system candidates 2 (candidate, ADR 0002) ---- */
export type Tone = 'amber' | 'progress' | 'green' | 'red' | 'muted';
/** A piece of a line. tone colours this part only (the value); mono sets it in IBM Plex Mono. */
export type Part = string | { text: string; tone?: Tone; mono?: boolean; strs?: Strs<'text'>; args?: StrArgs<'text'> };
/** A token: one part, or a word and its value as a list of parts. */
export type Token = Part | Part[];
/** Status · word: a coloured state word with a 4px dot. */
export interface StatusProps { text: string; tone?: Tone; className?: string; strs?: Strs<'text'>; args?: StrArgs<'text'> }
export interface StatusLineOptions {
  /** A persistent role=status region (the receipt). */
  live?: boolean;
  /** 'dot' draws `·` between tokens. */
  sep?: 'dot' | '';
  mono?: boolean;
  tight?: boolean;
  id?: string;
  className?: string;
}
export interface BannerProps {
  /** danger: red wash and border, red headline (an irreversible act, a terminal fact). correction: amber wash (Edit). */
  tone?: 'danger' | 'correction';
  headline: string;
  /** The mono line under the headline: what it costs, or the stamp. */
  consequence?: string;
  /** correction: the live change summary (`stillborn 1 → 0`), tokens with the corrected values amber. */
  summary?: string | Token[] | null;
  /** Text actions on the summary row (Clear). */
  actions?: FieldAction[];
  /** The whole banner is a live region (it appears in answer to a choice). */
  live?: boolean;
  id?: string;
  className?: string;
  strs?: Strs<'headline' | 'consequence' | 'summary'>;
  args?: StrArgs<'headline' | 'consequence' | 'summary'>;
}
export interface PhotoItem { id?: string; src?: string; alt?: string }
export interface PhotosProps {
  label?: string;
  optional?: string;
  /** The count and upload state beside the label: `3 attached · 1 waiting to upload`. */
  count?: Token | Token[] | null;
  /** false: nothing to attach to yet; the camera is floor-gray (aria-disabled) and its tap is answered in the hint. */
  active?: boolean;
  items?: PhotoItem[];
  /** Default 12; at max the camera grays the same way. */
  max?: number;
  /** Default 'photo-add'. */
  action?: string;
  /** Default 'photo-view': a thumbnail opens the viewer (where Delete lives). */
  viewAction?: string;
  key?: string;
  /** The status region (role=status, always mounted). */
  hint?: string;
  id?: string;
  className?: string;
  /** camera and thumb are aria-labels (thumb gets {n}); index is a thumbnail's fallback number. */
  strs?: Strs<'label' | 'optional' | 'hint' | 'camera' | 'thumb' | 'index'>;
  args?: StrArgs<'label' | 'optional' | 'hint' | 'camera'>;
}
export type ButtonRegister = 'primary' | 'secondary' | 'tool' | 'text' | 'danger' | 'end-early';
export interface ButtonProps {
  label: string;
  /** primary: the one commit (ink) · secondary: an exit (outlined) · tool: a mid-sheet act (soft well, no border) ·
   *  text: the bare word (13px, ≥44px, no container) · danger · end-early. Default secondary. */
  register?: ButtonRegister;
  action?: string;
  value?: string;
  /** The waiting face: aria-disabled (never disabled), focusable, the tap still reaches the host. */
  waiting?: boolean;
  /** The id of the buttonReason that says why it waits. */
  describedby?: string;
  attrs?: SafeAttrs;
  className?: string;
  strs?: Strs<'label'>;
  args?: StrArgs<'label'>;
}
export type HoldPhase = 'idle' | 'holding' | 'armed' | 'pending';
export interface HoldButtonProps {
  label: string;
  /** The line under the verb, set per phase by the host (`Hold to end` · `Keep holding` · `Press again to end`). */
  caption?: string;
  action?: string;
  value?: string;
  /** danger (default; the sweep is ink) or primary (Lock; the sweep is muted). */
  tone?: 'danger' | 'primary';
  phase?: HoldPhase;
  id?: string;
  className?: string;
  strs?: Strs<'label' | 'caption'>;
  args?: StrArgs<'label' | 'caption'>;
}
export type HoldEvent = 'down' | 'leave' | 'cancel' | 'blur' | 'escape' | 'elapsed' | 'key' | 'timeout' | 'done' | 'failed' | { type: 'up'; held: number };
export interface RadioOption { value: string; label: string; meta?: string; mono?: boolean; strs?: Strs<'label' | 'meta'>; args?: StrArgs<'label' | 'meta'> }
export interface ChoiceRadiosProps {
  label: string;
  /** inline only: the muted word after the label. */
  optional?: string;
  options: RadioOption[];
  selected?: string;
  /** Default 'choose'. */
  action?: string;
  /** Written as data-field. */
  key?: string;
  /** rows (default): ChoiceList rows with a visible radio. inline: label left, two or three short options right, one 60px row. */
  layout?: 'rows' | 'inline';
  lead?: string;
  id?: string;
  className?: string;
  strs?: Strs<'label' | 'optional'>;
  args?: StrArgs<'label' | 'optional'>;
}

export interface SentriUI {
  status(props: StatusProps): string;
  statusLine(tokens: Token[], options?: StatusLineOptions): string;
  banner(props: BannerProps): string;
  photos(props: PhotosProps): string;
  button(props: ButtonProps): string;
  /** The persistent status line that says why a waiting button waits. */
  buttonReason(props: { text?: string; id?: string; actions?: FieldAction[]; className?: string; strs?: Strs<'text'>; args?: StrArgs<'text'> }): string;
  holdButton(props: HoldButtonProps): string;
  /** The hold's rules: commit is true exactly once per completed hold or second keyboard press. */
  holdStep(state: { phase?: HoldPhase }, event: HoldEvent): { phase: HoldPhase; commit: boolean; cue: null | 'keep' | 'tap' | 'released' | 'again' };
  /** Wires every hold button under root (pointer hold, keyboard two-step, Escape, blur). */
  holdBind(root: Element, options?: { selector?: string; ms?: number; armMs?: number; onPhase?: (el: HTMLElement, phase: HoldPhase, cue: string | null) => void; onCommit?: (el: HTMLElement) => void; now?: () => number }): { destroy(): void };
  choiceRadios(props: ChoiceRadiosProps): string;
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
  /** radio (candidate): the panel is a radiogroup labelled by the heading. */
  choiceGroup(rows: string | string[], options?: { title?: string; lead?: string; className?: string; radio?: boolean; id?: string; strs?: Strs<'title'>; args?: StrArgs<'title'> }): string;
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
