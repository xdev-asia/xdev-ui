import type { JSX } from "react";
import { cx } from "../../internal/cx";

export interface SkeletonLabels {
  /** Read out by screen readers while the placeholder shows; never shown. */
  loading: string;
}

const DEFAULT_LABELS: SkeletonLabels = { loading: "Loading" };

export interface SkeletonProps {
  /** "line" is one line of text, "block" a card or image, "circle" an avatar. Default "line". */
  shape?: "line" | "block" | "circle";
  /** Number of text lines for `shape="line"`; the last one is shorter. Default 1. */
  lines?: number;
  /** Height of a block or circle, any CSS length. Default from CSS. */
  height?: string;
  /** Width, any CSS length. Default 100% (circle: same as height). */
  width?: string;
  /** Announce "Loading" to screen readers. Set on one skeleton per region; the rest stay silent. */
  announce?: boolean;
  labels?: Partial<SkeletonLabels>;
  className?: string;
}

export function Skeleton({ shape = "line", lines = 1, height, width, announce, labels, className }: SkeletonProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const count = shape === "line" ? Math.max(1, Math.floor(lines)) : 1;
  const style = height || width ? { height, width } : undefined;
  return (
    <span className={cx("x-skeleton", className)} data-shape={shape} role={announce ? "status" : undefined}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="x-skeleton-bar" aria-hidden="true" data-last={count > 1 && i === count - 1 ? "true" : undefined} style={style} />
      ))}
      {announce ? <span className="x-sr-only">{l.loading}</span> : null}
    </span>
  );
}
