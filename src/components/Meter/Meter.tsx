import type { JSX } from "react";

export type MeterTone = "ok" | "warn" | "danger";

export interface MeterProps {
  /** 0–100 */
  value: number;
  label?: string;
  /** Fill turns --warn at or above this value. */
  warnAt?: number;
  /** Colour of the fill and number, chosen by the caller (e.g. quota left: ok > 70, warn 30–70, danger < 30). Wins over `warnAt`. */
  tone?: MeterTone;
  /** The bar takes the free width of its row instead of its compact 54px. */
  fill?: boolean;
  /** Text shown after the bar, and read by screen readers, instead of "NN%" (e.g. "750 / 1000 left"). */
  valueText?: string;
}

export function Meter({ value, label, warnAt, tone, fill, valueText }: MeterProps): JSX.Element {
  const v = Math.max(0, Math.min(100, value));
  const warn = tone === undefined && warnAt != null && v >= warnAt;
  return (
    <span
      className="ws-meter"
      data-warn={warn ? "" : undefined}
      data-tone={tone}
      data-fill={fill ? "" : undefined}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      aria-valuetext={valueText}
      aria-label={label}
    >
      {label ? <span className="ws-meter-label">{label}</span> : null}
      <span className="ws-meter-bar">
        <span className="ws-meter-fill" style={{ width: `${v}%` }} />
      </span>
      <span className="ws-meter-pct">{valueText ?? `${Math.round(v)}%`}</span>
    </span>
  );
}
