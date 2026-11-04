import type { JSX, ReactNode } from "react";

export interface BadgeProps {
  status?: "new" | "changed" | "unchanged" | "foreign" | "neutral";
  children: ReactNode;
}

export function Badge({ status, children }: BadgeProps): JSX.Element {
  return (
    <span className="badge" data-status={status && status !== "neutral" ? status : undefined}>
      {children}
    </span>
  );
}
