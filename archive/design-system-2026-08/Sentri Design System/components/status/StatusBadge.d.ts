export interface StatusBadgeProps {
  /** The fixed work-status vocabulary */
  status: 'overdue' | 'due' | 'upcoming' | 'done' | 'blocked' | 'none';
  /** Custom label; defaults to the status name */
  children?: React.ReactNode;
  /** Show the status icon (default true) */
  icon?: boolean;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}
