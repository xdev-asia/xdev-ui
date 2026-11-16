import type { JSX } from "react";

export interface DiffViewProps {
  /** Rows that start with "+", "-" or " ". */
  lines: string[];
  label: string;
  /** With it, each row is a button that starts a comment on that line (1-based). */
  onPick?: (line: number) => void;
  pickLabel?: (line: number) => string;
}

const kind = (row: string): "add" | "del" | undefined => (row.startsWith("+") ? "add" : row.startsWith("-") ? "del" : undefined);

/** A unified diff. The showcase draws it itself: the library has no diff component yet. */
export function DiffView({ lines, label, onPick, pickLabel }: DiffViewProps): JSX.Element {
  return (
    <ol className="app-diff" aria-label={label}>
      {lines.map((row, i) => (
        <li key={i}>
          {onPick ? (
            <button type="button" className="app-diff-row" data-kind={kind(row)} title={pickLabel?.(i + 1)} onClick={() => onPick(i + 1)}>
              {row || " "}
            </button>
          ) : (
            <span className="app-diff-row" data-kind={kind(row)}>
              {row || " "}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
