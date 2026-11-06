import type { JSX } from "react";
import { cx } from "../../internal/cx";

export interface StepDotsLabels {
  /** Names the dots for screen readers ("Step 2 of 3"). */
  step: (current: number, total: number) => string;
}

const DEFAULT_LABELS: StepDotsLabels = { step: (current, total) => `Step ${current} of ${total}` };

export interface StepDotsProps {
  /** Number of steps, at least 1. */
  total: number;
  /** 1-based; clamped to 1…total. */
  current: number;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<StepDotsLabels>;
  className?: string;
}

export function StepDots({ total, current, labels, className }: StepDotsProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const count = Math.max(1, Math.floor(total));
  const at = Math.min(count, Math.max(1, Math.floor(current)));
  return (
    <span className={cx("x-step-dots", className)} role="img" aria-label={l.step(at, count)}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="x-step-dot" data-current={i + 1 === at ? "true" : undefined} data-done={i + 1 < at ? "true" : undefined} />
      ))}
    </span>
  );
}
