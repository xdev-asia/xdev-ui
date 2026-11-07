import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import type { IconName } from "../../icons";
import { Icon } from "../Icon/Icon";
import { StepDots, type StepDotsLabels } from "../StepDots/StepDots";

export interface EmptyStateStep {
  /** What to do in this step ("Open a project"). */
  label: ReactNode;
  /** The step is finished. Shown as a check mark and read as "Done". */
  done?: boolean;
}

export interface EmptyStateLabels {
  /** Text read after a finished step. */
  done: string;
  /** Names the step dots ("Step 2 of 3"). */
  step: StepDotsLabels["step"];
  /** Names the list of steps. */
  steps: string;
}

const DEFAULT_LABELS: EmptyStateLabels = { done: "Done", step: (current, total) => `Step ${current} of ${total}`, steps: "Steps" };

export interface EmptyStateProps {
  /** Icon in a soft tile; shown only for size "center". */
  icon?: IconName;
  /** What is missing, as a statement ("No worktrees yet"). */
  title: ReactNode;
  /** One line on how to fill it. */
  hint?: ReactNode;
  /** Numbered steps under the hint, with `StepDots` above them. For a first-run view that teaches a short path. */
  steps?: EmptyStateStep[];
  /** 1-based step the person is on. Defaults to the first step that is not done. */
  current?: number;
  /** Override the English defaults (e.g. for vi). Only used with `steps`. */
  labels?: Partial<EmptyStateLabels>;
  /** One primary action, maybe one secondary. */
  actions?: ReactNode;
  /** "inline" for a short muted line inside a pane; "center" for a whole empty view. Default "inline". */
  size?: "inline" | "center";
  className?: string;
}

export function EmptyState({ icon, title, hint, steps, current, labels, actions, size = "inline", className }: EmptyStateProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const first = steps ? steps.findIndex((s) => !s.done) : -1;
  const at = steps?.length ? Math.min(steps.length, Math.max(1, current ?? (first < 0 ? steps.length : first + 1))) : 0;
  return (
    <div className={cx("x-empty", className)} data-size={size}>
      {icon && size === "center" ? (
        <span className="x-empty-icon">
          <Icon name={icon} size={20} />
        </span>
      ) : null}
      <p className="x-empty-title">{title}</p>
      {hint ? <p className="x-empty-hint">{hint}</p> : null}
      {steps?.length ? (
        <>
          <StepDots total={steps.length} current={at} labels={{ step: l.step }} />
          <ol className="x-empty-steps" aria-label={l.steps}>
            {steps.map((s, i) => (
              <li key={i} className="x-empty-step" data-done={s.done ? "" : undefined} aria-current={i + 1 === at ? "step" : undefined}>
                <span className="x-empty-step-num" aria-hidden="true">
                  {s.done ? <Icon name="check" size={12} /> : i + 1}
                </span>
                <span className="x-empty-step-label">{s.label}</span>
                {s.done ? <span className="x-sr-only">{l.done}</span> : null}
              </li>
            ))}
          </ol>
        </>
      ) : null}
      {actions ? <div className="x-empty-actions">{actions}</div> : null}
    </div>
  );
}
