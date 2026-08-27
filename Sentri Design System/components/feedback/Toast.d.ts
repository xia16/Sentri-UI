export interface ToastProps {
  message: string;
  tone?: 'neutral' | 'success' | 'error';
  /** Override the tone's default icon */
  icon?: string;
  /** Action label, e.g. "Undo" */
  action?: string;
  onAction?: () => void;
  style?: React.CSSProperties;
}
