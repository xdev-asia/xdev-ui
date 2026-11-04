import type { JSX } from "react";

export interface DiffStatLabels {
  /** Accessible summary, e.g. "3 added, 1 removed". */
  diffStat: (added: number, removed: number) => string;
}

const DEFAULT_LABELS: DiffStatLabels = { diffStat: (added, removed) => `${added} added, ${removed} removed` };

export interface DiffStatProps {
  added?: number;
  removed?: number;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<DiffStatLabels>;
}

export function DiffStat({ added = 0, removed = 0, labels }: DiffStatProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  return (
    <span className="ws-stat" aria-label={l.diffStat(added, removed)}>
      <span className="ws-stat-add">+{added}</span> <span className="ws-stat-del">−{removed}</span>
    </span>
  );
}
