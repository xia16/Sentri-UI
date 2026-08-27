export interface SheetProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children?: React.ReactNode;
  /** Action row pinned at the bottom */
  footer?: React.ReactNode;
  style?: React.CSSProperties;
}
