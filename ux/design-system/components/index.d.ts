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
}

export interface LogEntry {
  title: string;
  detail?: string;
  /** Timestamp and author: "Jul 8 · 07:14 · G.H". */
  meta?: string;
  /** 9px label above the title. */
  category?: string;
  extraHtml?: string;
}
export interface LogGroup { label?: string; entries: LogEntry[] }

export interface Category { id: string; label: string; disabled?: boolean }
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
}

/** [value, label, subtitle?, groupName?] */
export type PickerOption = [string, string, string?, string?];

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
}

export interface SegmentProps {
  /** [value, label] — the label is raw HTML so a count can be marked up. */
  options: [string, string][];
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
}

export interface SentriUI {
  heading(props: HeadingProps): string;
  panel(content: string, options?: PanelOptions): string;
  facts(items: Fact[], options?: { columns?: 1 | 2 | 3; className?: string }): string;
  row(props: RowProps): string;
  rowGroup(content: string, options?: { title?: string; level?: number; className?: string }): string;
  log(groups: LogGroup[], options?: { empty?: string; className?: string }): string;
  categoryFooter(props: CategoryFooterProps): string;
  field(props: { label?: string; control?: string; className?: string }): string;
  pickerField(props: PickerFieldProps): string;
  pickerOptions(props: { options: PickerOption[]; selected?: string; action?: string; className?: string }): string;
  chooserList(content: string, options?: { tone?: 'flat' | 'inset'; className?: string }): string;
  choiceRow(props: ChoiceRowProps): string;
  choiceGroup(rows: string | string[], options?: { title?: string; lead?: string; className?: string }): string;
  choiceSearch(props?: { label?: string; placeholder?: string; value?: string; attrs?: SafeAttrs }): string;
  choiceEmpty(text: string): string;
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
  | 'upload' | 'offline';

declare global {
  interface Window { SentriUI: SentriUI; SentriIcons: SentriIcons }
}
