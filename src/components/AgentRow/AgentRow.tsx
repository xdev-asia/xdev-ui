import { useId, type JSX, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import { Icon } from "../Icon/Icon";

export interface AgentRowLabels {
  /** Name of the details region, e.g. `Claude settings`. */
  details: (name: string) => string;
}

const DEFAULT_LABELS: AgentRowLabels = { details: (name) => `${name} settings` };

export interface AgentRowProps {
  /** Profile name ("Claude", "Codex review"). */
  name: string;
  /** The command that starts it, shown in mono ("claude", "codex --full-auto"). */
  cli: string;
  /** What the collapsed row shows after the name: model, account. Text or a few `Tag`s. */
  summary?: ReactNode;
  /** Controlled: the body is shown. Keep at most one row open in a list. */
  expanded: boolean;
  onToggle: (expanded: boolean) => void;
  /** Buttons at the right of the head (Duplicate, Remove). Kept outside the toggle button. */
  actions?: ReactNode;
  /** The profile form, shown while expanded. */
  children?: ReactNode;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<AgentRowLabels>;
  className?: string;
}

export function AgentRow({ name, cli, summary, expanded, onToggle, actions, children, labels, className }: AgentRowProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const id = `x-agent-row-${useId()}`;
  return (
    <article className={cx("x-agent-row", className)} data-expanded={expanded ? "" : undefined}>
      <div className="x-agent-row-head">
        <button type="button" className="x-agent-row-toggle" aria-expanded={expanded} aria-controls={`${id}-body`} onClick={() => onToggle(!expanded)}>
          <Icon name="chevron" size={14} className="x-agent-row-chevron" />
          <span className="x-agent-row-name">{name}</span>
          <code className="x-agent-row-cli">{cli}</code>
          {summary ? <span className="x-agent-row-summary">{summary}</span> : null}
        </button>
        {actions ? <div className="x-agent-row-actions">{actions}</div> : null}
      </div>
      <div className="x-agent-row-body" id={`${id}-body`} role="region" aria-label={l.details(name)} hidden={!expanded}>
        {children}
      </div>
    </article>
  );
}
