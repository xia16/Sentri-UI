export interface TagProps {
  children: React.ReactNode;
  tone?: 'neutral' | 'brand';
  /** Mono type for identifiers (batch codes, pen codes) */
  mono?: boolean;
  style?: React.CSSProperties;
}
