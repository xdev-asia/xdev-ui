import type { TreeMark, TreeRow } from "./TreeView";

interface Dir {
  path: string;
  name: string;
  dirs: Map<string, Dir>;
  files: { path: string; name: string; mark?: TreeMark }[];
  changed: boolean;
}

const byName = (a: { name: string }, b: { name: string }): number => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

/**
 * Visible `TreeView` rows for a flat list of file paths. Folders come first, each level sorted by name.
 * A folder id is its path with a trailing `/`; a file id is its path. `closed` holds the folder ids
 * whose children are hidden. A folder that holds a marked file gets `changed`.
 */
export function pathRows(files: { path: string; mark?: TreeMark }[], closed: ReadonlySet<string>): TreeRow[] {
  const root: Dir = { path: "", name: "", dirs: new Map(), files: [], changed: false };
  for (const f of files) {
    const parts = f.path.split("/");
    let dir = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const path = `${parts.slice(0, i + 1).join("/")}/`;
      let next = dir.dirs.get(path);
      if (!next) {
        next = { path, name: parts[i], dirs: new Map(), files: [], changed: false };
        dir.dirs.set(path, next);
      }
      if (f.mark) next.changed = true;
      dir = next;
    }
    dir.files.push({ path: f.path, name: parts[parts.length - 1], mark: f.mark });
  }
  const rows: TreeRow[] = [];
  const walk = (dir: Dir, depth: number): void => {
    for (const d of [...dir.dirs.values()].sort(byName)) {
      const open = !closed.has(d.path);
      rows.push({ id: d.path, depth, name: d.name, kind: "dir", open, ...(d.changed ? { changed: true } : {}) });
      if (open) walk(d, depth + 1);
    }
    for (const f of [...dir.files].sort(byName)) rows.push({ id: f.path, depth, name: f.name, kind: "file", mark: f.mark });
  };
  walk(root, 0);
  return rows;
}
