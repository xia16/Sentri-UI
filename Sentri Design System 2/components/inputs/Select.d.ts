export interface SelectProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  /** Strings or { value, label } pairs */
  options: Array<string | { value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}
