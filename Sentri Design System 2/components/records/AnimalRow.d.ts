export interface AnimalRowProps {
  /** Animal identifier, rendered in mono, e.g. "SOW-04182" */
  id: string;
  /** Pen context, e.g. "PEN 14" — IDs without pens are often useless */
  pen?: string;
  /** Quiet meta line, e.g. "Parity 3 · Batch 24-31" */
  meta?: string;
  /** Attention note (amber text), replaces meta */
  note?: string;
  status?: 'overdue' | 'due' | 'upcoming' | 'done' | 'blocked' | 'none';
  /** Custom badge text, e.g. "Day 28" */
  statusLabel?: string;
  selected?: boolean;
  /** Presence enables bulk-select mode (checkbox) */
  onSelect?: (selected: boolean) => void;
  onClick?: () => void;
  style?: React.CSSProperties;
}
