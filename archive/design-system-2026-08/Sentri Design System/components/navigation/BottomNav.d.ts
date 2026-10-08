export interface BottomNavProps {
  items: Array<{ value: string; label: string; icon: string; badge?: number }>;
  value: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}
