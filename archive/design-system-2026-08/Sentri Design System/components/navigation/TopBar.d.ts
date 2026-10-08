export interface TopBarProps {
  title: string;
  /** Context line, e.g. "Section B · 4 units" */
  subtitle?: string;
  /** Shows a back chevron when provided */
  onBack?: () => void;
  /** TopBarAction buttons */
  actions?: React.ReactNode;
  style?: React.CSSProperties;
}
export interface TopBarActionProps {
  icon: string;
  label: string;
  onClick?: () => void;
  /** Small amber count badge */
  badge?: number;
}
