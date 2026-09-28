export interface ActionBarProps {
  /** Selection summary, e.g. "8 selected" */
  message?: string;
  /** Buttons */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
