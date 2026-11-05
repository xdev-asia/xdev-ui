import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TreeView, type TreeRow } from "./TreeView";
import { pathRows } from "./pathRows";

interface Node {
  name: string;
  children?: Node[];
  mark?: TreeRow["mark"];
}

const repo: Node[] = [
  {
    name: "apps",
    children: [
      {
        name: "desktop",
        children: [
          { name: "FileTree.tsx", mark: "modified" },
          { name: "WorktreePanel.tsx" },
          { name: "useWorktrees.ts", mark: "added" },
        ],
      },
    ],
  },
  { name: "crates", children: [{ name: "xdev-core", children: [{ name: "lib.rs" }, { name: "git.rs", mark: "modified" }] }] },
  { name: "docs", children: [{ name: "adr-0007-worktrees.md", mark: "added" }] },
  { name: "Cargo.toml" },
  { name: "package.json", mark: "modified" },
];

function hasMark(n: Node): boolean {
  return Boolean(n.mark) || (n.children ?? []).some(hasMark);
}

function flatten(nodes: Node[], open: Set<string>, depth = 0, base = ""): TreeRow[] {
  return nodes.flatMap((n) => {
    const id = base ? `${base}/${n.name}` : n.name;
    if (!n.children) return [{ id, depth, name: n.name, kind: "file" as const, mark: n.mark }];
    const isOpen = open.has(id);
    const row: TreeRow = { id, depth, name: n.name, kind: "dir", open: isOpen, changed: !isOpen && hasMark(n) };
    return isOpen ? [row, ...flatten(n.children, open, depth + 1, id)] : [row];
  });
}

const meta = {
  title: "Navigation/TreeView",
  component: TreeView,
  args: { rows: flatten(repo, new Set(["apps", "apps/desktop"])), selected: "apps/desktop/FileTree.tsx" },
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
} satisfies Meta<typeof TreeView>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Static: Story = {};
export const Interactive: Story = {
  render: (args) => {
    const [open, setOpen] = useState(new Set(["apps", "apps/desktop"]));
    const [sel, setSel] = useState("apps/desktop/FileTree.tsx");
    const toggle = (id: string): void =>
      setOpen((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    return <TreeView {...args} rows={flatten(repo, open)} selected={sel} onToggle={toggle} onOpen={setSel} />;
  },
};

/** Folder chains merged into one row, with the file count of each folder. */
export const Compact: Story = {
  args: {
    rows: pathRows(
      [{ path: "apps/desktop/src/ports/PortsPanel.tsx", mark: "added" }, { path: "apps/desktop/src/ports/portsStore.ts" }, { path: "crates/xdev-ports/src/lib.rs", mark: "modified" }, { path: "README.md" }],
      new Set(),
      { compact: true },
    ),
    selected: "README.md",
  },
};
