import { useRef, useState, type CSSProperties, type JSX, type KeyboardEvent } from "react";
import { cx } from "../../internal/cx";
import { Icon } from "../Icon/Icon";
import { treeKey } from "./treeKeys";

export type TreeMark = "added" | "modified" | "deleted" | "renamed";

export interface TreeRow {
  /** Stable id, usually the path. */
  id: string;
  /** 0 for top-level entries. */
  depth: number;
  name: string;
  kind: "file" | "dir";
  /** Dirs only: whether the children are shown. Pass only visible rows. */
  open?: boolean;
  /** Shows a dot for a dir that holds changed files. */
  changed?: boolean;
  /** Git status letter at the end of the row. */
  mark?: TreeMark;
}

export interface TreeViewLabels {
  /** aria-label of the tree. */
  tree: string;
  /** Read out for the changed dot. */
  changed: string;
  /** Titles of the status letters. */
  marks: Record<TreeMark, string>;
}

const DEFAULT_LABELS: TreeViewLabels = {
  tree: "Files",
  changed: "Changed",
  marks: { added: "Added", modified: "Modified", deleted: "Deleted", renamed: "Renamed" },
};

const LETTER: Record<TreeMark, string> = { added: "A", modified: "M", deleted: "D", renamed: "R" };

export interface TreeViewProps {
  /** Visible rows in display order; children follow their dir. */
  rows: TreeRow[];
  /** Id of the selected row (e.g. the file open in the editor). */
  selected?: string;
  /** A dir was clicked or toggled with the keyboard. */
  onToggle?: (id: string) => void;
  /** A file was clicked or opened with Enter. */
  onOpen?: (id: string) => void;
  /** Override the English defaults (e.g. for vi). Partial `marks` merge too. */
  labels?: Partial<Omit<TreeViewLabels, "marks">> & { marks?: Partial<Record<TreeMark, string>> };
  className?: string;
}

export function TreeView({ rows, selected, onToggle, onOpen, labels, className }: TreeViewProps): JSX.Element {
  const l: TreeViewLabels = { ...DEFAULT_LABELS, ...labels, marks: { ...DEFAULT_LABELS.marks, ...labels?.marks } };
  const [focusId, setFocusId] = useState<string | undefined>(undefined);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeId = rows.some((r) => r.id === focusId) ? focusId : rows.some((r) => r.id === selected) ? selected : rows[0]?.id;

  const activate = (r: TreeRow): void => {
    setFocusId(r.id);
    if (r.kind === "dir") onToggle?.(r.id);
    else onOpen?.(r.id);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    const index = rows.findIndex((r) => r.id === activeId);
    const res = treeKey(e.key, index, rows);
    if (!res) return;
    e.preventDefault();
    if ("focus" in res) {
      setFocusId(rows[res.focus].id);
      refs.current[res.focus]?.focus();
    } else if ("toggle" in res) onToggle?.(res.toggle);
    else onOpen?.(res.open);
  };

  return (
    <div className={cx("ws-tree", className)} role="tree" aria-label={l.tree} onKeyDown={onKeyDown}>
      {rows.map((r, i) => (
        <button
          key={r.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="treeitem"
          className="ws-tree-row"
          aria-level={r.depth + 1}
          aria-expanded={r.kind === "dir" ? Boolean(r.open) : undefined}
          aria-selected={r.id === selected}
          tabIndex={r.id === activeId ? 0 : -1}
          data-kind={r.kind}
          style={{ "--tree-depth": r.depth } as CSSProperties}
          onClick={() => activate(r)}
        >
          <Icon name={r.kind === "dir" ? "folder" : "file"} size={14} className="ws-tree-icon" />
          <span className="ws-tree-name">{r.name}</span>
          {r.changed ? (
            <span className="ws-tree-dot">
              <span className="x-sr-only">{l.changed}</span>
            </span>
          ) : null}
          {r.mark ? (
            <span className="ws-tree-mark" data-kind={r.mark} title={l.marks[r.mark]}>
              <span aria-hidden="true">{LETTER[r.mark]}</span>
              <span className="x-sr-only">{l.marks[r.mark]}</span>
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
