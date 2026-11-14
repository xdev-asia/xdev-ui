import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import { StatusDot, type StatusTone } from "../StatusDot/StatusDot";

export interface ServiceStatusProps {
  /** ok: up; warn: degraded; danger: down; neutral: unknown. */
  tone: StatusTone;
  /** The state in words ("Gateway online"). */
  label: ReactNode;
  /** Quiet mono text at the end: a version, a region, a build. */
  detail?: ReactNode;
  className?: string;
}

/** One line for the foot of a sidebar: the state of the service this console runs, and its version. */
export function ServiceStatus({ tone, label, detail, className }: ServiceStatusProps): JSX.Element {
  return (
    <div className={cx("x-service-status", className)}>
      <StatusDot tone={tone} label={label} />
      {detail != null ? <span className="x-service-status-detail">{detail}</span> : null}
    </div>
  );
}
