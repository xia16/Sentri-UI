/** @startingPoint section="Work" subtitle="One work type: counts, locations, progress, next-up" viewport="420x200" */
export interface TaskCardProps {
  /** Work type, e.g. "Pregnancy check" */
  title: string;
  /** Lucide icon for the work type */
  icon?: string;
  overdue?: number;
  due?: number;
  /** Where the work is, e.g. "Gestation 1–3" */
  locations?: string;
  /** Defined work set progress */
  progress?: { done: number; total: number };
  /** Upcoming line, e.g. "18 eligible in 4 days" — shows even when nothing is due */
  nextUp?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}
