export interface ProgressBarProps {
  /** Recorded so far */
  done: number;
  /** The defined work set — never render without a denominator */
  total: number;
  label?: string;
  /** Show "x of y" (default true) */
  showCount?: boolean;
  style?: React.CSSProperties;
}
