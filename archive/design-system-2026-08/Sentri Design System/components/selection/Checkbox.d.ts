export interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  sublabel?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}
