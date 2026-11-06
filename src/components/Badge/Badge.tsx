import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface BadgeProps {
  status?: "new" | "changed" | "unchanged" | "foreign" | "neutral";
  /** "danger" for a failed or blocked state (danger tint). Independent of `status`. */
  tone?: "danger";
  className?: string;
  children: ReactNode;
}

export function Badge({ status, tone, className, children }: BadgeProps): JSX.Element {
  return (
    <span className={cx("badge", className)} data-status={status && status !== "neutral" ? status : undefined} data-tone={tone}>
      {children}
    </span>
  );
}
