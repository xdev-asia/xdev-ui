import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import type { SessionState } from "../../types";
import { StatusDot } from "../StatusDot/StatusDot";

export type RunStepStatus = "pending" | "running" | "done" | "failed" | "skipped";

export interface RunTimelineStep {
  id: string;
  label: ReactNode;
  status: RunStepStatus;
  /** When the step started, as text, already formatted ("14:02"). */
  at?: string;
  /** How long it took. Shown as text from `labels.duration`. */
  durationMs?: number;
}

export interface RunTimelineLabels {
  /** Names the list for screen readers. */
  list: string;
  /** Text of each status, read by screen readers. */
  status: Record<RunStepStatus, string>;
  /** Formats a duration ("1.2 s", "3 min 4 s"). */
  duration: (ms: number) => string;
}

const DEFAULT_LABELS: RunTimelineLabels = {
  list: "Run steps",
  status: { pending: "Pending", running: "Running", done: "Done", failed: "Failed", skipped: "Skipped" },
  duration: (ms) => {
    const total = Math.max(0, Math.round(ms / 100) / 10);
    if (total < 60) return `${total} s`;
    const s = Math.round(total);
    return `${Math.floor(s / 60)} min ${s % 60} s`;
  },
};

const DOT: Record<RunStepStatus, SessionState> = { pending: "idle", running: "working", done: "done", failed: "failed", skipped: "exited" };

export interface RunTimelineProps {
  steps: RunTimelineStep[];
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<Omit<RunTimelineLabels, "status">> & { status?: Partial<RunTimelineLabels["status"]> };
  className?: string;
}

export function RunTimeline({ steps, labels, className }: RunTimelineProps): JSX.Element {
  const l: RunTimelineLabels = { ...DEFAULT_LABELS, ...labels, status: { ...DEFAULT_LABELS.status, ...labels?.status } };
  return (
    <ol className={cx("x-run-timeline", className)} aria-label={l.list}>
      {steps.map((s) => (
        <li key={s.id} className="x-run-step" data-status={s.status} aria-current={s.status === "running" ? "step" : undefined}>
          <span className="x-run-step-mark">
            <StatusDot state={DOT[s.status]} pulse={s.status === "running"} />
          </span>
          <span className="x-run-step-label">{s.label}</span>
          <span className="x-sr-only">{l.status[s.status]}</span>
          {s.at ? <time className="x-run-step-at">{s.at}</time> : null}
          {s.durationMs != null ? <span className="x-run-step-dur">{l.duration(s.durationMs)}</span> : null}
        </li>
      ))}
    </ol>
  );
}
