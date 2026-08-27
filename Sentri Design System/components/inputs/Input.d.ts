export interface InputProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  /** Leading Lucide icon, e.g. "search" */
  icon?: string;
  /** Trailing unit/context text, e.g. "kg" */
  suffix?: string;
  /** Error message — replaces hint, red border */
  error?: string;
  hint?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}
