import { useId } from "react";
import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import { Button } from "../Button/Button";
import { Disclosure } from "../Disclosure/Disclosure";
import { Segmented } from "../Segmented/Segmented";
import { Select } from "../Select/Select";
import { Tag } from "../Tag/Tag";

export interface LaunchOption {
  value: string;
  label: string;
}

export interface LaunchValue {
  agent: string;
  worktree: string;
  model: string;
  prompt: string;
}

export interface LaunchCardLabels {
  /** aria-label of the card. */
  region: string;
  agent: string;
  worktree: string;
  model: string;
  prompt: string;
  promptPlaceholder: string;
  /** Title of the disclosure that holds `advanced`. */
  more: string;
  start: string;
}

const DEFAULT_LABELS: LaunchCardLabels = {
  region: "Start an agent",
  agent: "Agent",
  worktree: "Worktree",
  model: "Model",
  prompt: "Task",
  promptPlaceholder: "Describe what the agent should do",
  more: "More options",
  start: "Start",
};

export interface LaunchCardProps {
  agents: LaunchOption[];
  worktrees: LaunchOption[];
  models: LaunchOption[];
  value: LaunchValue;
  onChange: (value: LaunchValue) => void;
  onStart: () => void;
  /** Extra fields (branch name, permissions, flags). Shown in a closed "More options" disclosure; omitted when not given. */
  advanced?: ReactNode;
  labels?: Partial<LaunchCardLabels>;
  className?: string;
}

export function LaunchCard({ agents, worktrees, models, value, onChange, onStart, advanced, labels, className }: LaunchCardProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const id = useId();
  const set = (patch: Partial<LaunchValue>): void => onChange({ ...value, ...patch });
  const pick = (opts: LaunchOption[], v: string): string | undefined => opts.find((o) => o.value === v)?.label;
  const worktreeLabel = pick(worktrees, value.worktree);
  const modelLabel = pick(models, value.model);
  return (
    <section className={cx("x-launch", className)} aria-label={l.region}>
      <Segmented label={l.agent} options={agents} value={value.agent} onChange={(agent) => set({ agent })} />
      <div className="x-launch-row">
        <div className="ws-field">
          <label htmlFor={`${id}-worktree`}>{l.worktree}</label>
          <Select id={`${id}-worktree`} options={worktrees} value={value.worktree} onChange={(e) => set({ worktree: e.target.value })} />
        </div>
        <div className="ws-field">
          <label htmlFor={`${id}-model`}>{l.model}</label>
          <Select id={`${id}-model`} options={models} value={value.model} onChange={(e) => set({ model: e.target.value })} />
        </div>
      </div>
      <div className="ws-field">
        <label htmlFor={`${id}-prompt`}>{l.prompt}</label>
        <textarea
          id={`${id}-prompt`}
          className="kit-textarea"
          data-resize="vertical"
          rows={4}
          value={value.prompt}
          placeholder={l.promptPlaceholder}
          onChange={(e) => set({ prompt: e.target.value })}
        />
      </div>
      {worktreeLabel || modelLabel ? (
        <div className="x-launch-chips">
          {worktreeLabel ? <Tag>{worktreeLabel}</Tag> : null}
          {modelLabel ? <Tag>{modelLabel}</Tag> : null}
        </div>
      ) : null}
      {advanced ? (
        <Disclosure title={l.more} defaultExpanded={false}>
          {advanced}
        </Disclosure>
      ) : null}
      <div className="x-launch-foot">
        <Button variant="primary" type="button" onClick={onStart}>
          {l.start}
        </Button>
      </div>
    </section>
  );
}
