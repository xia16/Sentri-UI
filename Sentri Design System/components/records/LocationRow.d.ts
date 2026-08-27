export interface LocationRowProps {
  /** Farm-defined name, e.g. "Gestation 1" — may be long, truncates */
  name: string;
  /** e.g. "24 pens · Batch 24-31" */
  sublabel?: string;
  overdue?: number;
  due?: number;
  upcoming?: number;
  done?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
}
