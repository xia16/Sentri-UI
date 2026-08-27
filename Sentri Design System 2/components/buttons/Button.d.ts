/** @startingPoint section="Controls" subtitle="Primary, secondary, ghost and danger actions" viewport="700x230" */
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** 36 / 48 / 56 px — md (48) is the glove-safe default */
  size?: 'sm' | 'md' | 'lg';
  /** Optional leading Lucide icon name */
  icon?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  /** Stretch to container width — use for bottom field actions */
  full?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}
