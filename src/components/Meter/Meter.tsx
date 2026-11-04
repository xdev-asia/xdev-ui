import type { JSX } from "react";

export interface MeterProps {
  /** 0–100 */
  value: number;
  label?: string;
  /** Fill turns --warn at or above this value. */
  warnAt?: number;
}

export function Meter({ value, label, warnAt }: MeterProps): JSX.Element {
  const v = Math.max(0, Math.min(100, value));
  const warn = warnAt != null && v >= warnAt;
  return (
    <span
      className="ws-meter"
      data-warn={warn ? "" : undefined}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      aria-label={label}
    >
      {label ? <span>{label}</span> : null}
      <span className="ws-meter-bar">
        <span className="ws-meter-fill" style={{ width: `${v}%` }} />
      </span>
      <span className="ws-meter-pct">{Math.round(v)}%</span>
    </span>
  );
}
