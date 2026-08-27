export interface StatProps {
  /** Big number; null renders "—" (missing ≠ zero) */
  value?: number | string | null;
  /** Uppercase micro-label below */
  label: string;
  tone?: 'default' | 'overdue' | 'due' | 'done' | 'muted';
  /** e.g. "of 31" */
  suffix?: string;
  style?: React.CSSProperties;
}
