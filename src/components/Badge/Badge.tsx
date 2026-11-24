import type { HTMLAttributes, JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";

export type BadgeTone = "neutral" | "accent" | "ok" | "warn" | "danger";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Sync status of a file or kit item. */
  status?: "new" | "changed" | "unchanged" | "foreign" | "neutral";
  /**
   * Semantic tone for a state word ("active", "draft", "failed", "pending", "internal").
   * When both are set, the tone's look wins; `data-status` is still written.
   */
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

export function Badge({ status, tone, className, children, ...rest }: BadgeProps): JSX.Element {
  return (
    <span {...rest} className={cx("badge", className)} data-status={status && status !== "neutral" ? status : undefined} data-tone={tone}>
      {children}
    </span>
  );
}
