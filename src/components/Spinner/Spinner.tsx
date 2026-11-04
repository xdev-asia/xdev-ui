import type { JSX } from "react";
import { cx } from "../../internal/cx";

export interface SpinnerLabels {
  /** Read out by screen readers; never shown. */
  loading: string;
}

const DEFAULT_LABELS: SpinnerLabels = { loading: "Loading" };

export interface SpinnerProps {
  /** "sm" is 10px for inline use next to text, "md" is 16px. Default "sm". */
  size?: "sm" | "md";
  /** What is loading ("Loading usage"). Overrides `labels.loading`. */
  label?: string;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<SpinnerLabels>;
  className?: string;
}

export function Spinner({ size = "sm", label, labels, className }: SpinnerProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  return (
    <span className={cx("x-spinner", className)} role="status" data-size={size}>
      <span className="x-spinner-ring" aria-hidden="true" />
      <span className="x-sr-only">{label ?? l.loading}</span>
    </span>
  );
}
