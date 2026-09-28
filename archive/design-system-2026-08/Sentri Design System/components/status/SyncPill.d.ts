export interface SyncPillProps {
  state: 'synced' | 'pending' | 'offline';
  /** Records waiting — required for "pending" */
  count?: number;
  style?: React.CSSProperties;
}
