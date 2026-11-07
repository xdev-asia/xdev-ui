import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import { Meter } from "../Meter/Meter";
import { StatusDot, type StatusTone } from "../StatusDot/StatusDot";

/** State of the account: usable, out of quota, failing, or not signed in. */
export type UsageState = "ok" | "limited" | "error" | "signedOut";

export interface UsageWindow {
  /** Name of the window, e.g. "5 h" or "Week". */
  label: string;
  /** Percent of the quota used, 0 to 100. */
  used: number;
  /** When the window resets, already formatted, e.g. "Resets in 2 h". */
  resetText: string;
}

export interface UsageMeterRowLabels {
  /** Visible words of the account state. */
  state: Record<UsageState, string>;
}

const DEFAULT_LABELS: UsageMeterRowLabels = {
  state: { ok: "Active", limited: "Limit reached", error: "Error", signedOut: "Signed out" },
};

const TONE: Record<UsageState, StatusTone> = { ok: "ok", limited: "warn", error: "danger", signedOut: "neutral" };

export interface UsageMeterRowProps {
  /** Account name, e.g. an email or "claude-3". */
  account: string;
  windows: UsageWindow[];
  state: UsageState;
  /** Meters turn to the warn tone at or above this percent. Default 80. */
  warnAt?: number;
  /** Buttons at the end of the row (Sign in, Switch). No primary here. */
  actions?: ReactNode;
  labels?: Partial<UsageMeterRowLabels>;
  className?: string;
}

export function UsageMeterRow({ account, windows, state, warnAt = 80, actions, labels, className }: UsageMeterRowProps): JSX.Element {
  const words = { ...DEFAULT_LABELS.state, ...labels?.state };
  return (
    <div className={cx("x-usage", className)} data-state={state}>
      <div className="x-usage-account">
        <span className="x-usage-name">{account}</span>
        <StatusDot tone={TONE[state]} label={words[state]} />
      </div>
      {windows.length > 0 ? (
        <ul className="x-usage-windows">
          {windows.map((w) => (
            <li key={w.label} className="x-usage-window">
              <Meter value={w.used} label={w.label} warnAt={warnAt} />
              <span className="x-usage-reset">{w.resetText}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {actions ? <div className="x-usage-actions">{actions}</div> : null}
    </div>
  );
}
