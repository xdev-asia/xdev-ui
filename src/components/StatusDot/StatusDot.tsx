import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import type { CheckState, PrState, SessionState } from "../../types";

export type StatusTone = "ok" | "warn" | "danger" | "accent" | "neutral";

/** Pass exactly one of state, pr, check, tone. */
export interface StatusDotProps {
  state?: SessionState;
  pr?: PrState;
  check?: CheckState;
  /** Generic status that is not a session, PR or check, e.g. a user who is active, invited or suspended. */
  tone?: StatusTone;
  /** Only with state="working". */
  pulse?: boolean;
  label?: ReactNode;
}

export function StatusDot({ state, pr, check, tone, pulse, label }: StatusDotProps): JSX.Element {
  const dot = (
    <span
      className={cx("ws-dot", pulse && "ws-pulse")}
      aria-hidden={label ? true : undefined}
      data-state={state}
      data-pr={pr}
      data-check={check}
      data-tone={tone}
    />
  );
  if (!label) return dot;
  return (
    <span className="x-dot-label">
      {dot}
      {label}
    </span>
  );
}
