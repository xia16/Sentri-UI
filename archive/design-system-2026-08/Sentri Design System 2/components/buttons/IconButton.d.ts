export interface IconButtonProps {
  /** Lucide icon name */
  icon: string;
  /** Required accessible label */
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  /** 36 / 48 px */
  size?: 'sm' | 'md';
  disabled?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}
