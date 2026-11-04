import type { JSX } from "react";

export interface DiffStatProps {
  added?: number;
  removed?: number;
}

export function DiffStat({ added = 0, removed = 0 }: DiffStatProps): JSX.Element {
  return (
    <span className="ws-stat" aria-label={`${added} added, ${removed} removed`}>
      <span className="ws-stat-add">+{added}</span> <span className="ws-stat-del">−{removed}</span>
    </span>
  );
}
