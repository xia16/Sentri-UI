export interface CountPillProps {
  /** Number of items; null/undefined renders "—" (missing ≠ zero) */
  count?: number | null;
  status?: 'overdue' | 'due' | 'upcoming' | 'done' | 'blocked' | 'none';
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}
