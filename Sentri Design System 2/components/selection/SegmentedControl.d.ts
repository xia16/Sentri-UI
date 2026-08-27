export interface SegmentedControlProps {
  /** Strings or { value, label, icon? } */
  options: Array<string | { value: string; label: string; icon?: string }>;
  value: string;
  onChange?: (value: string) => void;
  /** Stretch segments to container width (default true) */
  full?: boolean;
  style?: React.CSSProperties;
}
