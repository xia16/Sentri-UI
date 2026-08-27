export interface IconProps {
  /** Lucide icon name, kebab-case, e.g. "clipboard-list" */
  name: string;
  /** px, default 20 (24 in nav) */
  size?: number;
  strokeWidth?: number;
  /** defaults to currentColor */
  color?: string;
  style?: React.CSSProperties;
}
