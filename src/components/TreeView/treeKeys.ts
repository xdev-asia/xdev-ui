/** Pure keyboard logic for TreeView over a flat list of visible rows. Not exported from the package. */

export interface TreeKeyRow {
  id: string;
  depth: number;
  kind: "file" | "dir";
  open?: boolean;
}

/** What a key press asks for: move focus to a row index, toggle a dir, or open a file. */
export type TreeKeyResult = { focus: number } | { toggle: string } | { open: string } | null;

export function treeKey(key: string, index: number, rows: readonly TreeKeyRow[]): TreeKeyResult {
  const row = rows[index];
  if (!row) return null;
  switch (key) {
    case "ArrowDown":
      return index < rows.length - 1 ? { focus: index + 1 } : null;
    case "ArrowUp":
      return index > 0 ? { focus: index - 1 } : null;
    case "Home":
      return { focus: 0 };
    case "End":
      return { focus: rows.length - 1 };
    case "ArrowRight":
      if (row.kind !== "dir") return null;
      if (!row.open) return { toggle: row.id };
      return rows[index + 1] && rows[index + 1].depth > row.depth ? { focus: index + 1 } : null;
    case "ArrowLeft": {
      if (row.kind === "dir" && row.open) return { toggle: row.id };
      for (let i = index - 1; i >= 0; i--) if (rows[i].depth < row.depth) return { focus: i };
      return null;
    }
    case "Enter":
    case " ":
      return row.kind === "dir" ? { toggle: row.id } : { open: row.id };
    default:
      return null;
  }
}
