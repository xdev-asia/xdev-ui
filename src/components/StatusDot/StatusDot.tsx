import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import type { CheckState, PrState, SessionState } from "../../types";

/** Pass exactly one of state, pr, check. */
export interface StatusDotProps {
  state?: SessionState;
  pr?: PrState;
  check?: CheckState;
  /** Only with state="working". */
  pulse?: boolean;
  label?: ReactNode;
}

export function StatusDot({ state, pr, check, pulse, label }: StatusDotProps): JSX.Element {
  const dot = (
    <span
      className={cx("ws-dot", pulse && "ws-pulse")}
      aria-hidden={label ? true : undefined}
      data-state={state}
      data-pr={pr}
      data-check={check}
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
