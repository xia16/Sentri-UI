export interface StepperProps {
  label?: string;
  value: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Unit shown after the number, e.g. "kg" */
  unit?: string;
  style?: React.CSSProperties;
}
