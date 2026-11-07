import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import { formatDuration } from "../../internal/duration";
import { SESSION_STATE_LABELS } from "../../internal/session-labels";
import type { SessionState } from "../../types";
import { DiffStat, type DiffStatLabels } from "../DiffStat/DiffStat";
import { StatusDot } from "../StatusDot/StatusDot";

export interface SessionBarLabels {
  /** aria-label of the bar. */
  region: string;
  /** Visible words of the state, per state. */
  status: Record<SessionState, string>;
  /** aria-label of the model, e.g. "Model". */
  model: string;
  /** aria-label of the elapsed time, e.g. "Elapsed". */
  elapsed: string;
  /** Formats the elapsed time, e.g. "5 min". */
  duration: (ms: number) => string;
  diffStat: DiffStatLabels["diffStat"];
}

const DEFAULT_LABELS: SessionBarLabels = {
  region: "Session",
  status: SESSION_STATE_LABELS,
  model: "Model",
  elapsed: "Elapsed",
  duration: formatDuration,
  diffStat: (added, removed) => `${added} added, ${removed} removed`,
};

export interface SessionBarProps {
  status: SessionState;
  /** Model name, e.g. "claude-opus-5-5". */
  model?: string;
  /** Time since the session started, in ms. */
  elapsed?: number;
  /** Lines added and removed by this session. */
  diff?: { add: number; del: number };
  /** Buttons at the end of the bar (IconButtons or secondary Buttons; no primary here). */
  actions?: ReactNode;
  labels?: Partial<SessionBarLabels>;
  className?: string;
}

export function SessionBar({ status, model, elapsed, diff, actions, labels, className }: SessionBarProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels, status: { ...DEFAULT_LABELS.status, ...labels?.status } };
  return (
    <div className={cx("x-sessionbar", className)} role="group" aria-label={l.region} data-state={status}>
      <span className="x-sessionbar-status">
        <StatusDot state={status} pulse={status === "working"} label={l.status[status]} />
      </span>
      {model ? (
        <span className="x-sessionbar-item x-sessionbar-model" aria-label={`${l.model}: ${model}`}>
          {model}
        </span>
      ) : null}
      {elapsed != null ? (
        <span className="x-sessionbar-item" aria-label={`${l.elapsed}: ${l.duration(elapsed)}`}>
          {l.duration(elapsed)}
        </span>
      ) : null}
      {diff ? <DiffStat added={diff.add} removed={diff.del} labels={{ diffStat: l.diffStat }} /> : null}
      {actions ? <span className="x-sessionbar-actions">{actions}</span> : null}
    </div>
  );
}
