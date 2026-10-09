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
  /** Before the rail: a typed word ({ text, tone }). A plain string is legacy trusted HTML (with strs.trailing, escaped text). Not with chip. */
  trailing?: string | Exclude<Part, string>;
  /** Candidate: the right end. auto (default): a chevron when action is set · chevron · edit (✎, a done row whose tap opens Edit) · none. */
  trail?: 'auto' | 'chevron' | 'edit' | 'none';
  attrs?: SafeAttrs;
  className?: string;
  /** Candidate: a leading mono identifier (crate `A02`) at `identifier-strong`, in a `row-code-min` column. Not with icon. */
  code?: string;
  /** Candidate: line 2 set in mono (the row law). */
  mono?: boolean;
  /** Candidate: the row's one status chip (a Status word). Not with trailing. */
  chip?: StatusProps;
  /** Candidate: title and description wrap instead of truncating (evidence lines, long mono tokens). */
  wrap?: boolean;
  /** Token parts join without spaces (zh strings that carry none). */
  tight?: boolean;
  id?: string;
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

export interface PickerItem { group?: string; disabled?: boolean; reason?: string; strs?: Strs<'label' | 'meta'>; args?: StrArgs<'label' | 'meta'>; value: string; label: string; meta?: string; aliases?: string[]; secondaryAction?: {label: string; action: string}; children?: PickerItem[]; attrs?: SafeAttrs }
export interface PickerBodyProps { variant?: 'single' | 'multi' | 'cascade' | 'cascade-multi'; items?: PickerItem[]; selected?: string[]; path?: string[]; query?: string; action?: string; stepAction?: string; searchAttrs?: SafeAttrs; loading?: boolean; error?: string; strs?: Strs<'search' | 'all' | 'loading' | 'error' | 'empty' | 'noMatch'>; args?: StrArgs<'search' | 'all' | 'loading' | 'error' | 'empty' | 'noMatch'> }
export interface PickerFieldProps {
  /** Optional contextual name for repeated fields; current display is appended to it. Visible label remains. */
  ariaLabel?: string;
  variant?: 'single' | 'multi' | 'cascade' | 'cascade-multi';
  selected?: string[];
  path?: string[];
  reason?: string;
  error?: string;
  loading?: boolean;
  pressed?: boolean;
  active?: boolean;
  /** Raw HTML label text (usually a plain string). */
  label?: string;
  value?: string;
  /** Text shown in place of value. */
  display?: string;
  /** Default "Select"; multi displays None or n selected. */
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
export type PickerOption = [string, string, string?, string?, { disabled?: boolean; reason?: string; strs?: Strs<'label' | 'sub' | 'group'>; args?: StrArgs<'label' | 'sub' | 'group'> }?];

export interface ChoiceRowProps {
  disabled?: boolean;
  reason?: string;
  pressed?: boolean;
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
/** A piece of a line. tone colours this part only (the value, at 600); mono sets it in IBM Plex Mono. */
export type Part = string | { text: string; tone?: Tone; mono?: boolean; strs?: Strs<'text'>; args?: StrArgs<'text'> };
/** A token: one part, or a word and its value as a list of parts. Tokens with sep 'dot' are joined by a real `·` text node. */
export type Token = Part | Part[];
/** Status · word: a coloured state word with a 4px dot. */
export interface StatusProps { text: string; tone?: Tone; id?: string; className?: string; strs?: Strs<'text'>; args?: StrArgs<'text'> }
export interface StatusLineOptions {
  /** A persistent role=status region, mounted empty: its content waits in a <template> until liveFill() or announce(). */
  live?: boolean;
  /** 'dot' puts `·` between tokens. */
  sep?: 'dot' | '';
  mono?: boolean;
  tight?: boolean;
  id?: string;
  className?: string;
}
export interface BannerProps {
  /** danger: red wash and border, red 700 headline (an irreversible act, a terminal fact).
   *  correction: `amber-wash-strong` with an `amber` border (Edit). */
  tone?: 'danger' | 'correction';
  headline: string;
  /** The mono line under the headline: what it costs, or the stamp. */
  consequence?: string;
  /** correction: the live change summary (`stillborn 1 → 0`), tokens with the corrected values amber. After Clear: `Cleared` with Undo. */
  summary?: string | Token[] | null;
  /** Text actions on the summary row (Clear; after it, Undo). */
  actions?: FieldAction[];
  /** No summary: the banner itself is the one live region (it appears in answer to a choice). */
  live?: boolean;
  /** Stable id; the summary region is `<id>-summary`. */
  id?: string;
  className?: string;
  strs?: Strs<'headline' | 'consequence' | 'summary'>;
  args?: StrArgs<'headline' | 'consequence' | 'summary'>;
}
/** pending: this photo waits to upload (an amber dot on the tile, and its spoken label says so). */
export interface PhotoItem { id?: string; src?: string; alt?: string; pending?: boolean }
export interface PhotosProps {
  label?: string;
  optional?: string;
  /** The count and upload state beside the label: `3 attached · 1 waiting to upload`. */
  count?: Token | Token[] | null;
  /** false: nothing to attach to yet; the camera is floor-gray (aria-disabled, data-reason="inactive"), its tap answered. */
  active?: boolean;
  items?: PhotoItem[];
  /** Default 12; at max the camera grays the same way (data-reason="full"). */
  max?: number;
  /** Default 'photo-add'. */
  action?: string;
  /** Default 'photo-view': a thumbnail opens the viewer (where Delete lives, while drafting only). */
  viewAction?: string;
  key?: string;
  /** The answer line under the header row (role=status, always mounted). */
  hint?: string;
  /** denied (camera permission) · too-large: the card's own registered message, amber (it wins over hint). cancelled: nothing is said. */
  error?: '' | 'denied' | 'too-large' | 'cancelled';
  /** Stable id: the camera is `<id>-camera`, thumbnails `<id>-thumb-<n>`. */
  id?: string;
  className?: string;
  /** camera, thumb and thumbPending are aria-labels (thumb gets {n}); index is a thumbnail's fallback number. */
  strs?: Strs<'label' | 'optional' | 'hint' | 'camera' | 'thumb' | 'thumbPending' | 'index'>;
  args?: StrArgs<'label' | 'optional' | 'hint' | 'camera'>;
}
export type ButtonRegister = 'primary' | 'secondary' | 'tool' | 'text' | 'danger' | 'end-early';
export interface ButtonProps {
  label: string;
  /** primary: the one commit (ink) · secondary: an exit (outlined) · tool: a mid-sheet act (soft well, no border) ·
   *  text: the bare word (13/700 `ink-2`, ≥44px, no container) · danger · end-early. Default secondary; unknown values warn in dev. */
  register?: ButtonRegister;
  action?: string;
  value?: string;
  /** The waiting face: aria-disabled (never disabled), focusable; guard() answers the tap. Every register, text included. */
  waiting?: boolean;
  /** Sent, until the host settles: aria-disabled + aria-busy (a row's one-tap after its first tap). */
  busy?: boolean;
  /** The id of the buttonReason that says why it waits. */
  describedby?: string;
  labelledby?: string;
  id?: string;
  attrs?: SafeAttrs;
  className?: string;
  strs?: Strs<'label'>;
  args?: StrArgs<'label'>;
}
/** unknown: the answer never came — terminal; the act is never offered again from this button. */
export type HoldPhase = 'idle' | 'holding' | 'armed' | 'pending' | 'done' | 'unknown';
export interface HoldButtonProps {
  label: string;
  /** The idle line under the verb (`Hold to end`); holdBind swaps it per cue and restores it on every idle transition. */
  caption?: string;
  action?: string;
  value?: string;
  /** danger (default; an ink sweep) or primary (Lock; a paper sweep), both at `hold-sweep-opacity`. */
  tone?: 'danger' | 'primary';
  phase?: HoldPhase;
  /** Waiting: aria-disabled; a press is answered (guard + onRefused), never held. */
  waiting?: boolean;
  /** The reason a waiting hold waits. */
  describedby?: string;
  /** A status line outside the thumb's footprint (above the bar) that echoes the progress. */
  statusId?: string;
  id?: string;
  className?: string;
  strs?: Strs<'label' | 'caption'>;
  args?: StrArgs<'label' | 'caption'>;
}
export type HoldCue = null | 'keep' | 'tap' | 'released' | 'disarmed' | 'again' | 'early' | 'pending' | 'done' | 'failed' | 'unknown';
export type HoldEvent = 'down' | 'leave' | 'cancel' | 'blur' | 'escape' | 'elapsed' | 'timeout'
  | { type: 'up'; held: number } | { type: 'key'; at: number; repeat?: boolean } | { type: 'settle'; outcome: 'done' | 'failed' | 'unknown' };
export interface HoldBindOptions {
  selector?: string;
  /** Default: the `--hold-commit` token (850ms). */
  ms?: number;
  /** Default: the `--hold-arm` token (5000ms). */
  armMs?: number;
  /** The least time between arming and the committing press (400ms). */
  minArm?: number;
  /** Pointer slop before a hold counts as left (20px). */
  slop?: number;
  /** Cue → string id for the caption and the status line. */
  cues?: Partial<Record<Exclude<HoldCue, null>, string>>;
  t?: (id: string) => string;
  /** navigator.vibrate: 40ms on commit, [15, 60, 15] on release. Default true. */
  vibrate?: boolean;
  onPhase?: (el: HTMLElement, phase: HoldPhase, cue: HoldCue) => void;
  onCommit?: (el: HTMLElement) => void;
  onRefused?: (el: HTMLElement) => void;
  now?: () => number;
}
export interface RadioOption { value: string; label: string; meta?: string; /** Latin and digit codes only (warns in dev otherwise). */ mono?: boolean; strs?: Strs<'label' | 'meta'>; args?: StrArgs<'label' | 'meta'> }
export interface ChoiceRadiosProps {
  /** Hide only the field label when an enclosing optional row already names it; accessible label and Clear remain. */
  labelHidden?: boolean;
  disabled?: boolean;
  reason?: string;
  pressed?: boolean;
  label: string;
  /** Makes the field optional: while a value is chosen, a `Clear` text action (data-action "<action>-clear") shows. */
  optional?: string;
  options: RadioOption[];
  selected?: string;
  /** Default 'choose'. */
  action?: string;
  /** Written as data-field. */
  key?: string;
  /** rows (default): 60px ChoiceList rows with a visible radio. inline: label left, two or three short options right, one row. */
  layout?: 'rows' | 'inline';
  lead?: string;
  /** The Clear label (default "Clear"). */
  clear?: string;
  /** Stable id; Clear is `<id>-clear`. */
  id?: string;
  className?: string;
  strs?: Strs<'label' | 'optional' | 'clear'>;
  args?: StrArgs<'label' | 'optional'>;
}
/** The shared row fields (row, rowSelect, rowAction). */
export interface RowCopyProps {
  title: string | Token[];
  description?: string | Token[];
  /** A leading mono identifier (crate `A02`) at `identifier-strong`, in a `row-code-min` column. Not with an icon. */
  code?: string;
  /** Line 2 in mono (the row law). */
  mono?: boolean;
  /** The row's one status chip (a Status word). Not with trailing. */
  chip?: StatusProps;
  /** Title and line 2 wrap instead of truncating. */
  wrap?: boolean;
  tight?: boolean;
  id?: string;
  className?: string;
  attrs?: SafeAttrs;
  strs?: Strs<'title' | 'description' | 'code'>;
  args?: StrArgs<'title' | 'description' | 'code'>;
}
export interface RowSelectProps extends RowCopyProps { checked?: boolean; /** Default 'select'. */ action?: string; value: string }
export interface RowActionProps extends RowCopyProps {
  /** The door (the copy, with an inline ›). */
  action: string;
  value?: string;
  /** The one-tap. Named by its label plus the row title. busy: the pending face until the host settles. */
  act: ButtonProps;
}

export interface SentriUI {
  status(props: StatusProps): string;
  statusLine(tokens: Token[], options?: StatusLineOptions): string;
  /** The tokens as HTML, for announce() into a region the host holds. */
  statusText(tokens: Token[], options?: { sep?: 'dot' | ''; tight?: boolean }): string;
  /** Clear a live region, then set it (default after 60ms), so the change is announced. */
  announce(el: Element, html: string, options?: { delay?: number; then?: (el: Element) => void }): void;
  /** Fill every empty live region under scope from its <template> (call once after inserting card markup). */
  liveFill(scope: Element, options?: { delay?: number; then?: (el: Element) => void }): void;
  banner(props: BannerProps): string;
  photos(props: PhotosProps): string;
  /** The optional input: label · muted "Optional" · trailing icon action. `action` asks the host to open the editor; `inline` reveals the field under the row. */
  optionalRow(props: { label: string; value?: string; icon?: string; editIcon?: string; action?: string; key?: string; inline?: string; open?: boolean; optionalWord?: string; editLabel?: string; disabled?: boolean; className?: string; attrs?: Record<string, string> }): string;
  button(props: ButtonProps): string;
  /** The persistent status line (row-title size) that says why a waiting button waits. */
  buttonReason(props: { text?: string; id?: string; actions?: FieldAction[]; className?: string; strs?: Strs<'text'>; args?: StrArgs<'text'> }): string;
  /** For delegated clicks: true when the control is aria-disabled; answers it (its reason lines flash and re-announce). */
  guard(el: Element | null, options?: { answer?: boolean; flash?: number }): boolean;
  /** Focus target only if focus is still inside leaving (a banner at its Undo timeout); returns whether it moved focus. */
  handFocus(leaving: Element, target: HTMLElement | null): boolean;
  holdButton(props: HoldButtonProps): string;
  /** The hold's rules: commit is true exactly once; repeats are ignored; a second press sooner than minArm is 'early'. */
  /** A press past armedAt + arm is a fresh first press (re-arms, never commits). */
  holdStep(state: { phase?: HoldPhase; armedAt?: number | null }, event: HoldEvent, options?: { minArm?: number; arm?: number }): { phase: HoldPhase; armedAt: number | null; commit: boolean; cue: HoldCue };
  /** Wires every hold under root; owns data-phase, aria-disabled and aria-busy. */
  holdBind(root: Element, options?: HoldBindOptions): { settle(el: Element, outcome: 'done' | 'failed' | 'unknown'): HoldPhase; destroy(): void };
  readonly HOLD: { commit: number; arm: number; minArm: number; slop: number; vibrateCommit: number; vibrateRelease: number[] };
  choiceRadios(props: ChoiceRadiosProps): string;
  /** The radio keyboard model: the value the key moves to, or null. */
  radioNext(values: string[], current: string, key: string): string | null;
  /** Arrow keys select and focus inside every radiogroup under root; onChange re-renders. */
  radioBind(root: Element, options?: { onChange?: (field: string, value: string) => void }): { destroy(): void };
  rowSelect(props: RowSelectProps): string;
  rowAction(props: RowActionProps): string;
  /** From a 'change' event on a rowSelect: { value, checked, action }, or null. */
  rowSelectChange(event: Event | { target: unknown }): { value: string; checked: boolean; action: string } | null;
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
  pickerOptions(props: { options: PickerOption[]; selected?: string | string[]; action?: string; className?: string; variant?: 'single' | 'multi'; loading?: boolean; error?: string }): string;
  pickerBody(props: PickerBodyProps): string;
  pickerFooter(props?: { selected?: string[]; multi?: boolean; backAction?: string; doneAction?: string; strs?: Strs<'back' | 'done'>; args?: StrArgs<'back' | 'done'> }): string;
  chooserList(content: string, options?: { tone?: 'flat' | 'inset'; className?: string; ds?: string }): string;
  choiceRow(props: ChoiceRowProps): string;
  /** radio (candidate): the panel is a radiogroup labelled by the heading. */
  choiceGroup(rows: string | string[], options?: { title?: string; lead?: string; className?: string; radio?: boolean; /** Raw HTML at the heading's right end (a radio field's Clear). */ aside?: string; id?: string; strs?: Strs<'title'>; args?: StrArgs<'title'> }): string;
  choiceSearch(props?: { label?: string; placeholder?: string; value?: string; attrs?: SafeAttrs; strs?: Strs<'label' | 'placeholder'> }): string;
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
