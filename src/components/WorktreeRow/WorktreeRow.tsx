import type { JSX } from "react";
import { cx } from "../../internal/cx";
import { SESSION_STATE_LABELS } from "../../internal/session-labels";
import type { SessionState } from "../../types";
import { AgentChip, type AgentChipProps } from "../AgentChip/AgentChip";
import { DiffStat, type DiffStatLabels } from "../DiffStat/DiffStat";
import { ListRow } from "../ListRow/ListRow";
import { StatusDot } from "../StatusDot/StatusDot";

export interface WorktreeRowLabels {
  /** Screen reader text of the status dot, per state. */
  status: Record<SessionState, string>;
  /** Accessible summary of the diff stat. */
  diffStat: DiffStatLabels["diffStat"];
}

const DEFAULT_LABELS: WorktreeRowLabels = {
  status: SESSION_STATE_LABELS,
  diffStat: (added, removed) => `${added} added, ${removed} removed`,
};

export interface WorktreeRowProps {
  /** Main line: the branch of the worktree. */
  branch: string;
  /** Second line: the repository or folder name. */
  repo?: string;
  /** Agents running in this worktree, one chip each. */
  agents: AgentChipProps[];
  /** The one status of the worktree: a dot plus screen reader text. */
  status: SessionState;
  /** Lines added and removed in the worktree. Hidden when omitted. */
  diff?: { add: number; del: number };
  selected?: boolean;
  onSelect: () => void;
  /** Root element. Use "li" inside a ul. Default "div". */
  as?: "div" | "li";
  labels?: Partial<WorktreeRowLabels>;
  className?: string;
}

export function WorktreeRow({ branch, repo, agents, status, diff, selected, onSelect, as, labels, className }: WorktreeRowProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels, status: { ...DEFAULT_LABELS.status, ...labels?.status } };
  return (
    <ListRow
      className={cx("x-worktree-row", className)}
      as={as}
      selected={selected}
      onClick={onSelect}
      leading={<StatusDot state={status} label={<span className="x-sr-only">{l.status[status]}</span>} />}
      title={<span className="x-worktree-branch">{branch}</span>}
      meta={repo}
      trailing={
        <>
          {agents.length > 0 ? (
            <span className="x-worktree-agents">
              {agents.map((a, i) => (
                <AgentChip key={`${a.profile ?? "custom"}-${a.letter ?? ""}-${i}`} {...a} />
              ))}
            </span>
          ) : null}
          {diff ? <DiffStat added={diff.add} removed={diff.del} labels={{ diffStat: l.diffStat }} /> : null}
        </>
      }
    />
  );
}
