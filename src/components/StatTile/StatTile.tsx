import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import { Icon } from "../Icon/Icon";
import { Spinner } from "../Spinner/Spinner";

export interface StatTileLabels {
  /** Accessible name of the spinner shown while loading. */
  loading: string;
}

const DEFAULT_LABELS: StatTileLabels = { loading: "Loading" };

export interface StatTileProps {
  label: ReactNode;
  /** The headline number, formatted by the caller. */
  value: ReactNode;
  /** Pre-formatted change ("+12%"). */
  delta?: ReactNode;
  /** Draws an arrow-up or arrow-down icon before the delta. */
  deltaTrend?: "up" | "down";
  /** The caller decides: up is not always good. Default "neutral". */
  deltaTone?: "good" | "bad" | "neutral";
  /** Period or basis of the delta ("vs last 7 days"). */
  hint?: ReactNode;
  loading?: boolean;
  /** Extra content under the value, e.g. a Meter. */
  children?: ReactNode;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<StatTileLabels>;
  className?: string;
}

export function StatTile({ label, value, delta, deltaTrend, deltaTone = "neutral", hint, loading, children, labels, className }: StatTileProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  return (
    <div className={cx("x-stat", className)} aria-busy={loading ? true : undefined}>
      <p className="x-stat-label">{label}</p>
      {loading ? (
        <div className="x-stat-loading">
          <Spinner size="md" label={l.loading} />
        </div>
      ) : (
        <>
          <p className="x-stat-value">{value}</p>
          {delta != null || hint ? (
            <p className="x-stat-foot">
              {delta != null ? (
                <span className="x-stat-delta" data-tone={deltaTone}>
                  {deltaTrend ? <Icon name={deltaTrend === "up" ? "arrow-up" : "arrow-down"} size={12} /> : null}
                  {delta}
                </span>
              ) : null}
              {hint ? <span className="x-stat-hint">{hint}</span> : null}
            </p>
          ) : null}
          {children ? <div className="x-stat-extra">{children}</div> : null}
        </>
      )}
    </div>
  );
}
